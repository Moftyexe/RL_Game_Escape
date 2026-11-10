import test from 'node:test';
import assert from 'node:assert/strict';
import CombatSystem from '../combat/CombatSystem.js';
import PresentationEffects from './presentationEffects.js';
import { installPresentationHarness } from './presentationTestHarness.mjs';
import { dialogueDuration, PRESENTATION_TIMING as T } from './presentationTiming.js';

function setup() {
    const scene = { combat: new CombatSystem(), presentationSerial: 0 };
    const fixture = installPresentationHarness(scene);
    return { ...fixture, effects: new PresentationEffects(scene) };
}

test('banners and wrapped speech boxes occupy character lanes and destroy all children after their beats', async () => {
    const f = setup();
    f.effects.showActionBanner('player', 'TALK SMACK');
    f.effects.showSpeechBubble('player', 'The already-resolved insult.', 1700);
    const bubble = f.effects.speech.object;
    assert.equal(bubble.x, 42);
    assert.equal(bubble.children[1].text, 'PLAYER');
    assert.equal(bubble.children[2].text, 'The already-resolved insult.');
    assert.ok(bubble.y + bubble.children[0].height <= 150);
    assert.equal(f.effects.overlays.size, 1);
    await f.advance(T.actionBanner);
    assert.equal(f.effects.overlays.size, 1);
    await f.advance(1700 - T.actionBanner);
    assert.equal(f.effects.overlays.size, 0);
    assert.equal(f.effects.speech, null);
    assert.ok(f.objects.every(object => object.destroyed));
});

test('Wife uses a distinct phone speaker label in the Guard lane and replaces Guard speech', () => {
    const f = setup();
    f.effects.showSpeechBubble('guard', 'Guard line', 1000);
    const previous = f.effects.speech.object;
    f.effects.showPhoneDialogue('Resolved wife response', 1150);
    assert.equal(previous.destroyed, true);
    assert.equal(f.effects.speech.object.x, 550);
    assert.equal(f.effects.speech.object.children[1].text, 'WIFE / PHONE');
    assert.equal(f.effects.speech.object.children[2].text, 'Resolved wife response');
    f.effects.clearPresentationOverlay();
    assert.ok(f.objects.every(object => object.destroyed));
});

test('Talk Smack reading time scales with resolved text length within 1.5 to 4 seconds', () => {
    assert.equal(dialogueDuration('talkSmack', 'short'), 1500);
    assert.equal(dialogueDuration('talkSmack', 'a'.repeat(70)), 4000);
    assert.equal(dialogueDuration('talkSmack', 'a'.repeat(200)), 4000);
});

test('overlapping local jolts restore exact coordinates without drift', async () => {
    const f = setup(), sprite = f.scene.actors.guard.body;
    const origin = { x: sprite.x, y: sprite.y };
    f.effects.playLocalJolt('guard', 3);
    assert.equal(sprite.x, origin.x + 3);
    await f.advance(100);
    f.effects.playLocalJolt('guard', 5);
    assert.equal(sprite.x, origin.x + 5);
    await f.advance(T.reactionStep * 6);
    assert.deepEqual({ x: sprite.x, y: sprite.y }, origin);
    assert.equal(f.effects.jolts.size, 0);
});

test('status reactions tint and locally move sprites without camera shake', async () => {
    const f = setup();
    for (const status of ['FOCUSED', 'DISTRACTED', 'RILED', 'STUN']) {
        f.effects.playStatusReaction('player', status);
        await f.advance(T.reactionStep * 6);
        assert.equal(f.scene.actors.player.body.x, 205);
    }
    const tints = f.calls.filter(call => call.type === 'tint').map(call => call.tint);
    assert.equal(new Set(tints).size, 4);
    assert.equal(f.calls.some(call => call.type === 'shake'), false);
});

test('hit-stop pauses sprites only, preserves combat state, and respects a pre-existing pause', async () => {
    const f = setup(), before = f.scene.combat.snapshot();
    f.scene.actors.guard.body.anims.isPaused = true;
    const finished = f.effects.playHitStop(['player', 'guard'], T.normalHitStop);
    assert.equal(f.scene.actors.player.body.anims.isPaused, true);
    await f.advance(T.normalHitStop);
    assert.equal(await finished, true);
    assert.equal(f.scene.actors.player.body.anims.isPaused, false);
    assert.equal(f.scene.actors.guard.body.anims.isPaused, true);
    assert.deepEqual(f.scene.combat.snapshot(), before);
});

test('shutdown removes overlays, cancels timers/tweens, restores positions and resumes owned hit-stop pauses', async () => {
    const f = setup();
    f.effects.showSpeechBubble('player', 'Interrupted dialogue', 2000);
    f.effects.showActionBanner('player', 'LOOK THERE!');
    f.effects.playStatusReaction('guard', 'RILED');
    const finished = f.effects.playHitStop(['player', 'guard'], T.criticalHitStop);
    f.scene.events.emit('shutdown');
    assert.equal(await finished, false);
    assert.equal(f.scene.actors.guard.body.x, 760);
    assert.equal(f.scene.actors.guard.body.y, 328);
    assert.equal(f.scene.actors.player.body.anims.isPaused, false);
    assert.equal(f.scene.actors.guard.body.anims.isPaused, false);
    assert.equal(f.effects.overlays.size, 0);
    assert.equal(f.effects.jolts.size, 0);
    assert.equal(f.effects.pulses.size, 0);
    assert.ok(f.objects.every(object => object.destroyed));
    const count = f.calls.length;
    await f.advance(3000);
    assert.equal(f.calls.length, count);
});

test('dialogue timing scales for all speakers with enforced minimum and maximum',()=>{
 assert.equal(dialogueDuration('attack',''),1500);assert.equal(dialogueDuration('eatDonut','"Yum."'),1540);
 assert.ok(dialogueDuration('talkSmack','x'.repeat(60))>dialogueDuration('broLockIn','"Bro, lock in."'));
 assert.equal(dialogueDuration('callWife','x'.repeat(1000)),4000);assert.equal(dialogueDuration('callWife','x'.repeat(40)),2900);
});
