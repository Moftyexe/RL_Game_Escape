import { PRESENTATION_TIMING as T } from './presentationTiming.js';
import { waitBattlePresentation } from './battleAnimations.js';
import {SPEAKERS} from '../dialogue/dialogueScript.js';

const STATUS_TINTS = { FOCUSED: 0xc6edff, DISTRACTED: 0xffdf73, RILED: 0xff986f, STUN: 0xe5a0ff };

// Owns temporary visuals, never combat state. One instance lives for one scene.
export default class PresentationEffects {
    constructor(scene) {
        this.scene = scene;
        this.overlays = new Set();
        this.jolts = new Map();
        this.pulses = new Map();
        this.paused = new Map();
        this.speech = null;
        this.banners = new Set();
        this.closed = false;
        scene.events.once('shutdown', () => this.shutdown());
    }

    track(object, milliseconds) {
        const entry = { object, timer: null, dispose: () => {
            if (!this.overlays.delete(entry)) return;
            entry.timer?.remove(false);
            this.scene.tweens.killTweensOf?.(object);
            object.destroy();
            this.banners.delete(entry);
            if (this.speech === entry) this.speech = null;
        } };
        this.overlays.add(entry);
        entry.timer = this.scene.time.delayedCall(milliseconds, entry.dispose);
        return entry;
    }

    showMechanicalCommentary(message, duration) {
        if (this.closed) return;
        // Keep the contextual panel useful after this temporary overlay expires.
        this.scene.contextFeedback=message;
        this.scene.refreshContext?.();
        this.commentary?.dispose();
        const scene = this.scene, box = scene.add.container(24, 402);
        const background = scene.add.rectangle(0, 0, 976, 90, 0x080c14, 1)
            .setOrigin(0).setStrokeStyle(2, 0xe2e7ef);
        const text = scene.add.text(22, 16, message, { fontFamily: 'monospace', fontSize: '18px', color: '#f1f3f7', lineSpacing: 7, wordWrap: { width: 930 } });
        box.add([background, text]); scene.ui.add(box);
        this.commentary = this.track(box, duration);
    }

    showActionBanner(id, label, duration = T.actionBanner) {
        if (this.closed) return;
        const scene = this.scene, x = scene.actors[id].x;
        const banner = scene.add.container(x, 78);
        const text = scene.add.text(0, 0, label, { fontFamily: 'monospace', fontSize: '16px', color: '#ffe4a0' }).setOrigin(0.5);
        const box = scene.add.rectangle(0, 0, text.width + 24, 25, 0x26334b, 0.98).setStrokeStyle(1, 0xe5c680);
        banner.add([box, text]); scene.ui.add(banner);
        this.banners.add(this.track(banner, duration));
    }

    showSpeechBubble(id, message, milliseconds, { phone = false } = {}) {
        this.clearSpeech();
        for (const banner of [...this.banners]) banner.dispose();
        if (this.closed || !message) return;
        const scene = this.scene, width = 432;
        const color = phone ? '#9ee1d9' : '#edf3ff';
        const body = scene.add.text(12, 26, message, {
            fontFamily: 'monospace', fontSize: '17px', color,
            wordWrap: { width: width - 24 }, lineSpacing: 2
        });
        const height = Math.max(66, body.height + 38);
        // Reserve the upper band above the sprites. Bars/statuses remain below
        // their feet, and the two speech lanes stay within the logical canvas.
        const bubble = scene.add.container(id === 'player' ? 42 : 550, Math.max(28, 150 - height));
        const box = scene.add.rectangle(0, 0, width, height, phone ? 0x122d35 : 0x111b2d, 0.97)
            .setOrigin(0).setStrokeStyle(2, phone ? 0x78cec5 : 0xa9bddb);
        const title = scene.add.text(12, 8, phone ? SPEAKERS.wife.name : SPEAKERS[id]?.name.toUpperCase()??'GUARD',
            { fontFamily: 'monospace', fontSize: '11px', color });
        bubble.add([box, title, body]); scene.ui.add(bubble);
        this.speech = this.track(bubble, milliseconds);
    }

    showPhoneDialogue(message, milliseconds) {
        this.showSpeechBubble('guard', message, milliseconds, { phone: true });
    }

    clearSpeech() { this.speech?.dispose(); }

    playLocalJolt(id, strength = T.reactionSmall) {
        if (this.closed) return;
        const sprite = this.scene.actors[id].body;
        this.jolts.get(sprite)?.cancel();
        const { x, y } = sprite;
        let tween;
        const cancel = () => {
            tween?.remove();
            sprite.x = x; sprite.y = y;
            this.jolts.delete(sprite);
        };
        this.jolts.set(sprite, { cancel });
        tween = this.scene.tweens.add({ targets: sprite, x: x + strength,
            duration: T.reactionStep, yoyo: true, repeat: 2, ease: 'Sine.InOut', onComplete: cancel });
    }

    pulse(id, tint, duration = T.statusPulse) {
        if (this.closed) return;
        const actor = this.scene.actors[id], sprite = actor.body;
        this.pulses.get(sprite)?.cancel();
        let timer;
        const cancel = () => {
            timer?.remove(false);
            if (sprite.clearTint) sprite.clearTint();
            else sprite.setFillStyle?.(actor.color);
            this.pulses.delete(sprite);
        };
        if (sprite.setTintFill) sprite.setTintFill(tint);
        else sprite.setFillStyle?.(tint);
        this.pulses.set(sprite, { cancel });
        timer = this.scene.time.delayedCall(duration, cancel);
    }

    playStatusReaction(id, status) {
        this.pulse(id, STATUS_TINTS[status] ?? 0xc6edff);
        if (status !== 'FOCUSED') this.playLocalJolt(id, status === 'STUN' ? T.reactionStrong : T.reactionSmall);
    }

    async playHitStop(ids, milliseconds) {
        if (this.closed) return false;
        const owned = [];
        for (const id of new Set(ids)) {
            const anims = this.scene.actors[id].body.anims;
            if (!anims?.isPlaying || anims.isPaused || !anims.pause) continue;
            anims.pause();
            const resume = () => { try { anims.resume(); } catch { /* Sprite may have been destroyed. */ } };
            this.paused.set(anims, resume); owned.push(anims);
        }
        try { return await waitBattlePresentation(this.scene, milliseconds); }
        finally {
            for (const anims of owned) {
                this.paused.get(anims)?.(); this.paused.delete(anims);
            }
        }
    }

    clearPresentationOverlay() {
        for (const entry of [...this.overlays]) entry.dispose();
        for (const entry of [...this.jolts.values()]) entry.cancel();
        for (const entry of [...this.pulses.values()]) entry.cancel();
    }

    shutdown() {
        this.closed = true;
        this.clearPresentationOverlay();
        for (const resume of this.paused.values()) resume();
        this.paused.clear();
    }
}
