import { EventEmitter } from 'node:events';
import manifest from '../../../public/assets/battle/manifest.json' with { type: 'json' };
import { animationDuration } from './presentationTiming.js';

// Virtual Phaser surface for deterministic presentation integration tests.
export function installPresentationHarness(scene, { missingAnimations = false } = {}) {
    scene.combat.random = () => 0.5;
    scene.events = new EventEmitter();
    const calls = [], timers = [], objects = [];
    scene.scene={stop:key=>calls.push({type:'sceneStop',key}),start:(key,data)=>calls.push({type:'sceneStart',key,data})};
    let now = 0;
    scene.time = { delayedCall(ms, callback) {
        const timer = { at: now + ms, removed: false, remove() { this.removed = true; }, callback };
        timers.push(timer); return timer;
    } };
    const object = (x = 0, y = 0) => {
        const value = { x, y, children: [], destroyed: false,
            setOrigin() { return this; }, setStrokeStyle() { return this; },
            add(children) { this.children.push(...(Array.isArray(children) ? children : [children])); return this; },
            destroy() { this.destroyed = true; this.children.forEach(child => child.destroy()); } };
        objects.push(value); return value;
    };
    scene.add = {
        container: object,
        rectangle: (x, y, width, height) => Object.assign(object(x, y), { width, height }),
        text: (x, y, text, style) => {
            calls.push({ type: 'text', message: text, at: now });
            const size = parseInt(style.fontSize), width = Math.min(text.length * size * 0.6, style.wordWrap?.width ?? Infinity);
            return Object.assign(object(x, y), { text, width,
                height: Math.max(1, Math.ceil(text.length * size * 0.6 / width)) * (size + 2) });
        }
    };
    scene.ui = { add() {} };
    const animations = missingAnimations ? {} : Object.fromEntries(Object.entries(manifest.animations).map(([key, entry]) =>
        [key, { duration: animationDuration(entry, key), repeat: entry.repeat }]));
    scene.textures = { exists: () => !missingAnimations };
    scene.anims = { exists: key => !!animations[key], get: key => animations[key] };
    scene.actors = {};
    for (const id of ['player', 'guard']) {
        const body = new EventEmitter(); body.x = id === 'player' ? 205 : 760; body.y = 328;
        let current = null, completion, remaining;
        const schedule = ms => {
            remaining = ms;
            completion = scene.time.delayedCall(ms, () => {
                body.anims.isPlaying = false;
                body.emit(`animationcomplete-${current}`);
            });
        };
        body.play = (key, ignorePlaying) => {
            if (ignorePlaying && current === key && body.anims.isPlaying) return body;
            completion?.remove(); completion = null; current = key;
            body.anims.isPlaying = true; body.anims.isPaused = false;
            calls.push({ type: 'play', id, key, at: now });
            if (animations[key]?.repeat === 0) schedule(animations[key].duration);
            return body;
        };
        body.setTexture = key => { completion?.remove(); current = key; calls.push({ type: 'texture', id, key, at: now }); return body; };
        body.anims = { isPlaying: false, isPaused: false,
            stop() { completion?.remove(); this.isPlaying = false; this.isPaused = false; },
            pause() {
                calls.push({ type: 'pause', id, at: now }); this.isPaused = true;
                if (completion && !completion.removed) { remaining = completion.at - now; completion.remove(); }
            },
            resume() {
                calls.push({ type: 'resume', id, at: now }); this.isPaused = false;
                if (animations[current]?.repeat === 0) schedule(remaining);
            }
        };
        body.setTintFill = tint => calls.push({ type: 'tint', id, tint, at: now });
        body.clearTint = () => calls.push({ type: 'clearTint', id, at: now });
        scene.actors[id] = { x: body.x, y: 256, body, color: 0x123456, displayedHp: scene.combat[id].hp, displayedSp: scene.combat[id].sp };
        if (!missingAnimations) body.play(`${id}-battle-idle`, true);
    }
    const tweens = [];
    scene.tweens = { add(config) {
        const targets = config.targets;
        if (config.x != null) targets.x = config.x;
        const timer = scene.time.delayedCall(config.duration * (config.yoyo ? 2 : 1) * ((config.repeat ?? 0) + 1), () => config.onComplete?.());
        const tween = { remove: () => timer.remove() }; tweens.push(tween); return tween;
    }, killAll() { tweens.forEach(tween => tween.remove()); } };
    scene.refresh = () => {
        for (const id of ['player', 'guard']) {
            scene.actors[id].displayedHp = scene.presentationHealth?.[id] ?? scene.presentationState?.[id]?.hp ?? scene.combat[id].hp;
        }
    };
    scene.floatFeedback = (id, message) => calls.push({ type: 'float', id, message, at: now });
    scene.cameras = { main: { shake: (duration, intensity) => calls.push({ type: 'shake', duration, intensity, at: now }) } };
    scene.guardPolicy = { chooseAction: () => { calls.push({ type: 'guardChoice', at: now }); return 'attack'; } };
    scene.events.once('shutdown', () => { scene.presentationSerial++; scene.tweens.killAll(); });
    const flush = async () => { for (let i = 0; i < 16; i++) await Promise.resolve(); };
    return { scene, calls, timers, objects, async advance(ms) {
        const end = now + ms;
        for (;;) {
            const next = timers.filter(timer => !timer.removed && timer.at <= end).sort((a, b) => a.at - b.at)[0];
            if (!next) break;
            now = next.at; next.removed = true; next.callback(); await flush();
        }
        now = end; await flush();
    } };
}
