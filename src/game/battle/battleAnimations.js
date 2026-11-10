import manifest from '../../../public/assets/battle/manifest.json' with { type: 'json' };
import { PRESENTATION_TIMING, ANIMATION_PRESENTATION, animationDuration, animationFrameTime, animationFrameIndices } from './presentationTiming.js';

// null means NO MATCH, deliberately not a substitute action or a guessed pose.
export const BATTLE_ANIMATIONS = Object.freeze({
    player: Object.freeze({ idle: 'player-battle-idle', attack: 'player-battle-attack',
        defend: 'player-battle-defend', broLockIn: 'player-battle-lock-in', talkSmack: 'player-battle-talk-smack', lookThere: 'player-battle-look-there',
        swingBackpack: 'player-battle-backpack', catchBreath: 'player-battle-catch-breath', stunned: null,
        hurt: 'player-battle-hurt', critical: 'player-battle-critical', victory: 'player-battle-victory', defeat: 'player-battle-defeat' }),
    guard: Object.freeze({ idle: 'guard-battle-idle', attack: 'guard-battle-attack',
        defend: 'guard-battle-defend', crackKnuckles: 'guard-battle-crack-knuckles', blowWhistle: 'guard-battle-blow-whistle',
        callWife: 'guard-battle-call-wife', eatDonut: 'guard-battle-eat-donut',
        stunned: null, hurt: 'guard-battle-hurt', critical: 'guard-battle-critical', victory: 'guard-battle-victory', defeat: 'guard-battle-defeat',
        distracted: 'guard-battle-distracted', riled: 'guard-battle-riled',
        stumble: 'guard-battle-stumble', recovery: 'guard-battle-recovery' })
});
export const BATTLE_CANVAS = Object.freeze(manifest.canvas);
const textureKey = (key, index) => `${key}-${index}`;

export function preloadBattleAnimations(scene) {
    const base = import.meta.env?.BASE_URL ?? './';
    for (const [key, entry] of Object.entries(manifest.animations)) {
        entry.frames.forEach((url, index) => scene.load.image(textureKey(key, index), `${base}${url}`));
    }
}

export function createBattleAnimations(scene, nearestFilter) {
    for (const [key, entry] of Object.entries(manifest.animations)) {
        const profile = ANIMATION_PRESENTATION[key];
        const frames = animationFrameIndices(entry,key).map(index => ({ key: textureKey(key, index),
            // Phaser 4 treats per-frame duration as the entire frame time,
            // rather than an addition to msPerFrame.
            duration: profile?.holdFrame === index ? 1000 / entry.frameRate + profile.holdMs : 0 }));
        // A missing PNG must not create a partially broken animation.
        if (!frames.every(frame => scene.textures.exists(frame.key))) continue;
        frames.forEach(frame => scene.textures.get(frame.key).setFilter(nearestFilter));
        if (!scene.anims.exists(key)) {
            scene.anims.create({ key, frames, frameRate: entry.frameRate, repeat: entry.repeat });
        }
    }
}

export function initialBattleTexture(scene, character) {
    const key = BATTLE_ANIMATIONS[character]?.idle;
    const texture = key ? textureKey(key, 0) : null;
    return texture && scene.textures.exists(texture) ? texture : null;
}

export function resolveBattleAnimation(scene, character, action, { critical = false } = {}) {
    const mapping = BATTLE_ANIMATIONS[character];
    if (!mapping) return null;
    // Critical basic attacks may fall back to the basic punch. An unmapped
    // critical skill must still stay idle rather than borrow an unrelated punch.
    const candidates = action === 'critical' || (action === 'attack' && critical)
        ? [mapping.critical, mapping.attack, mapping.idle] : ['stumble', 'recovery'].includes(action)
            ? [mapping[action], mapping.hurt, mapping.idle] : [mapping[action], mapping.idle];
    return candidates.find(key => key && scene.anims.exists(key)) ?? null;
}

export function holdBattleFrame(scene, sprite, key, index) {
    const entry = manifest.animations[key];
    const texture = entry && textureKey(key, index ?? entry.frames.length - 1);
    if (!texture || !scene.anims.exists(key) || !sprite?.setTexture || !scene.textures.exists(texture)) return false;
    try { sprite.anims?.stop(); sprite.setTexture(texture); return true; } catch { return false; }
}

const visualContexts = new WeakMap();
const contextFor = sprite => {
    if (!visualContexts.has(sprite)) visualContexts.set(sprite, {});
    return visualContexts.get(sprite);
};

// One authoritative persistent visual priority; never changes combat state.
export function resolvePersistentVisualState(scene, character) {
    const mapping = BATTLE_ANIMATIONS[character];
    const outcome = scene.combat?.turnState;
    if (['VICTORY', 'DEFEAT', 'DRAW'].includes(outcome)) {
        const action = outcome === 'DRAW' ? 'defeat'
            : (character === 'player') === (outcome === 'VICTORY') ? 'victory' : 'defeat';
        return { kind: 'terminal', key: mapping?.[action], action };
    }
    const actor = scene.combat?.[character];
    if (character === 'guard' && actor?.offGuard)
        return { kind: 'offGuard', key: mapping.distracted, holdFrame: 2 };
    if (actor?.defending) return { kind: 'defending', key: mapping?.defend };
    if (character === 'guard' && actor?.status?.name === 'RILED')
        return { kind: 'riled', key: mapping.riled };
    return { kind: 'idle', key: mapping?.idle };
}

export function restoreBattleStance(scene, sprite, character, { forceIdle = false } = {}) {
    if (!sprite) return;
    const context = contextFor(sprite);
    const persistent = resolvePersistentVisualState(scene, character);
    // A terminal pose survives all later stance refreshes, including forced idle.
    if (persistent.kind === 'terminal' || context.terminalKey) {
        if (context.terminalPlaying) return;
        if (context.terminalKey && holdBattleFrame(scene, sprite, context.terminalKey)) return;
        if (persistent.action && scene.anims.exists(persistent.key)) playBattleAction(scene, sprite, character, persistent.action, { returnToIdle: false });
        else holdBattleFrame(scene, sprite, BATTLE_ANIMATIONS[character]?.hurt);
        return;
    }
    if (persistent.kind !== 'offGuard') {
        context.offGuardActive = false;
        if (context.offGuardTransition) context.cancel?.();
    }
    if (!forceIdle && persistent.kind === 'defending' && holdBattleFrame(scene, sprite, persistent.key)) return;
    if (!forceIdle && persistent.kind === 'offGuard' && scene.anims.exists(persistent.key)) {
        if (!context.offGuardActive) {
            context.offGuardActive = true;
            const transition = playBattleAction(scene, sprite, character, 'distracted', { returnToIdle: false, holdFrame: persistent.holdFrame });
            context.offGuardTransition = transition;
            void transition.finished.then(active => {
                if (context.offGuardTransition !== transition) return;
                context.offGuardTransition = null;
                if (active) restoreBattleStance(scene, sprite, character);
            });
        } else if (!context.offGuardTransition) holdBattleFrame(scene, sprite, persistent.key, persistent.holdFrame);
        return;
    }
    const key = !forceIdle && persistent.kind === 'riled' && scene.anims.exists(persistent.key)
        ? persistent.key : BATTLE_ANIMATIONS[character]?.idle;
    if (key && scene.anims.exists(key) && sprite?.play) {
        try { sprite.play(key, true); } catch { /* Optional art cannot block combat. */ }
    }
}

// Presentation only: no hit rolls, stats, damage or turn mutations here.
export function playBattleAction(scene, sprite, character, action, { critical = false, returnToIdle = true, holdFrame, extraHoldMs = 0 } = {}) {
    const context = contextFor(sprite);
    const terminal = action === 'victory' || action === 'defeat';
    if (context.terminalKey && !terminal) {
        restoreBattleStance(scene, sprite, character);
        return { key: context.terminalKey, temporary: false, impactMs: 0, cueMs: 0, durationMs: 0, finished: Promise.resolve(true) };
    }
    context.cancel?.();
    const key = resolveBattleAnimation(scene, character, action, { critical });
    if (terminal && key && key !== BATTLE_ANIMATIONS[character]?.idle) {
        context.terminalKey = key;
        context.terminalPlaying = true;
        returnToIdle = false;
    }
    const idle = BATTLE_ANIMATIONS[character]?.idle;
    if ((action === 'victory' || action === 'defeat') && key === idle &&
        holdBattleFrame(scene, sprite, BATTLE_ANIMATIONS[character]?.hurt)) {
        // Missing terminal art stays explicit; hold a hurt pose instead of idling.
        return { key: null, temporary: false, impactMs: 0, cueMs: 0, durationMs: 0, finished: Promise.resolve(true) };
    }
    if (!key || !sprite?.play || key === idle) {
        restoreBattleStance(scene, sprite, character, { forceIdle: action === 'victory' || action === 'defeat' });
        return { key, temporary: false, impactMs: 0, cueMs: 0, durationMs: 0, finished: Promise.resolve(true) };
    }
    const entry = manifest.animations[key];
    const animation = scene.anims.get(key);
    const baseDuration = entry ? animationDuration(entry, key) : animation?.duration ?? PRESENTATION_TIMING.minimumAction;
    const duration = baseDuration + extraHoldMs;
    const impactMs = entry ? animationFrameTime(entry, key, entry.impactFrame) : 0;
    const cueMs = entry ? animationFrameTime(entry, key, ANIMATION_PRESENTATION[key]?.cueFrame) : 0;
    const finished = new Promise(resolve => {
        let settled = false, watchdog, pauseTimer, resumeTimer, ownedPause = false;
        const event = `animationcomplete-${key}`;
        const settle = (resumeIdle, stop = false) => {
            if (settled) return;
            settled = true;
            sprite.off(event, complete);
            scene.events.off('shutdown', cancel);
            watchdog?.remove(false);
            pauseTimer?.remove(false);
            resumeTimer?.remove(false);
            if (ownedPause) { sprite.anims?.resume?.(); ownedPause = false; }
            if (context.cancel === cancel) context.cancel = null;
            if (terminal) context.terminalPlaying = false;
            if (stop) sprite.anims?.stop();
            if (resumeIdle && returnToIdle) restoreBattleStance(scene, sprite, character);
            if (resumeIdle && !returnToIdle) holdBattleFrame(scene, sprite, key, holdFrame);
            resolve(resumeIdle);
        };
        const complete = () => settle(true);
        const cancel = () => settle(false);
        context.cancel = cancel;
        sprite.once(event, complete);
        scene.events.once('shutdown', cancel);
        // If an asset fails to emit completion, cosmetics cannot strand a turn.
        watchdog = scene.time.delayedCall(Math.min(baseDuration, PRESENTATION_TIMING.watchdogLimit) + extraHoldMs + PRESENTATION_TIMING.watchdogGrace, () => settle(true, true));
        if (extraHoldMs > 0) {
            const frame = ANIMATION_PRESENTATION[key]?.holdFrame ?? 0;
            pauseTimer = scene.time.delayedCall(animationFrameTime(entry, key, frame), () => {
                if (settled || !sprite.anims?.pause) return;
                sprite.anims.pause(animation?.getFrameAt?.(frame)); ownedPause = true;
                resumeTimer = scene.time.delayedCall(extraHoldMs, () => {
                    if (ownedPause) { sprite.anims.resume(); ownedPause = false; }
                });
            });
        }
        try { sprite.play(key); } catch { restoreBattleStance(scene, sprite, character); settle(false); }
    });
    return { key, temporary: true, impactMs, cueMs, durationMs: duration, finished };
}

export function waitBattlePresentation(scene, milliseconds) {
    return new Promise(resolve => {
        let settled = false, timer;
        const settle = active => {
            if (settled) return;
            settled = true;
            timer?.remove(false);
            scene.events.off('shutdown', cancel);
            resolve(active);
        };
        const cancel = () => settle(false);
        scene.events.once('shutdown', cancel);
        timer = scene.time.delayedCall(milliseconds, () => settle(true));
    });
}
