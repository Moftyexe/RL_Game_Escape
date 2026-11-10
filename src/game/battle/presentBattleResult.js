import { mechanicalCommentary } from './mechanicalCommentary.js';
import { ACTIONS } from '../combat/CombatSystem.js';
import { playBattleAction, waitBattlePresentation, restoreBattleStance, holdBattleFrame, BATTLE_ANIMATIONS } from './battleAnimations.js';
import { PRESENTATION_TIMING as T, dialogueDuration } from './presentationTiming.js';
import PresentationEffects from './presentationEffects.js';
import {actionStartSfx,resultSfx,playCues} from '../audio/battleSfx.js';

// Presents an immutable-in-practice resolved result; no rolls or combat actions.
export async function presentBattleResult(scene, result) {
    const serial = ++scene.presentationSerial;
    const effects = scene.effects ??= new PresentationEffects(scene);
    effects.clearPresentationOverlay();
    scene.presentationBusy = true;
    scene.presentationState = scene.displayedState;
    scene.presentationHealth = Object.fromEntries(Object.entries(scene.actors).map(([id, actor]) => [id, actor.displayedHp]));
    scene.refresh();
    if (ACTIONS[result.action] && result.action !== 'attack' && result.action !== 'defend') {
        effects.showActionBanner(result.actorId, ACTIONS[result.action].label);
    }
    const damage = result.events.find(event => event.type === 'damage');
    if(!result.skipped)playCues(scene.sfx,actionStartSfx(result.action));
    const commentary = mechanicalCommentary(result, scene.displayedState, {
        playerAlreadyActed: scene.combat.round?.results.some(item => item.actorId === 'player') ?? false
    });
    const guardSpeechTime = dialogueDuration('callWife', result.messages[0] ?? '');
    const wifeSpeechTime = dialogueDuration('callWife', result.messages[1] ?? '');
    const phoneHold = result.action === 'callWife'
        ? guardSpeechTime + T.phoneResponsePause + wifeSpeechTime + commentary.at(-1).duration : 0;
    if (result.action === 'offGuard') holdBattleFrame(scene, scene.actors.guard.body, BATTLE_ANIMATIONS.guard.distracted, 2);
    const action = result.action === 'offGuard'
        ? { durationMs: 0, impactMs: 0, cueMs: 0, finished: Promise.resolve(true) }
        : playBattleAction(scene, scene.actors[result.actorId].body, result.actorId, result.action,
        { critical: damage?.critical ?? false, extraHoldMs: phoneHold });
    let elapsed = 0, readableUntil = 0;
    const current = () => serial === scene.presentationSerial && !effects.closed;
    const wait = async ms => {
        const active = await waitBattlePresentation(scene, ms);
        elapsed += ms;
        return active && current();
    };
    if (result.action === 'callWife') {
        const introduction = commentary.shift();
        effects.showMechanicalCommentary(introduction.text, introduction.duration);
        if (!await wait(T.phoneDialogueStart)) return;
        effects.showSpeechBubble('guard', result.messages[0], guardSpeechTime);
        if (!await wait(guardSpeechTime)) return;
        effects.clearSpeech();
        if (!await wait(T.phoneResponsePause)) return;
        effects.showPhoneDialogue(result.messages[1], wifeSpeechTime);
        if (!await wait(wifeSpeechTime)) return;
    } else {
        const cue = action.impactMs || action.cueMs;
        if (cue > 0 && !await wait(cue)) return;
        if (!current()) return;
        // Combat owns dialogue selection. Exclude mechanical history messages
        // such as damage amounts and stun notifications from character speech.
        const line = result.messages.find(message => message.startsWith('"'));
        if (line) {
            const hold = dialogueDuration(result.action, line);
            effects.showSpeechBubble(result.actorId, line, hold);
            readableUntil = elapsed + hold;
            if (!damage && !await wait(T.dialogueEffectLead)) return;
        }
        if (damage) {
            const stop = damage.critical ? T.criticalHitStop : damage.blocked ? T.blockedHitStop : T.normalHitStop;
            if (!await effects.playHitStop([result.actorId, damage.targetId], stop) || !current()) return;
            elapsed += stop;
        }
    }
    if (!current()) return;
    const stumbled = result.events.some(event => event.type === 'stumbled');
    const reactions = result.events.filter(event => event.type === 'damage' && event.source !== 'stumble').map(event => {
        const reaction = playBattleAction(scene, scene.actors[event.targetId].body, event.targetId, 'hurt');
        if (!reaction.temporary) effects.playLocalJolt(event.targetId);
        return reaction;
    });
    scene.presentationHealth = null;
    scene.presentationState = null;
    scene.displayedState = scene.combat.snapshot();
    scene.refresh();
    scene.showFeedback(result);
    playCues(scene.sfx,resultSfx(result));
    if (stumbled) {
        scene.sfx?.play('fall');
        const index = commentary.findIndex(entry => entry.text.startsWith('The Guard swung too hard'));
        const narration = index >= 0 ? commentary.splice(index, 1)[0] : null;
        if (narration) effects.showMechanicalCommentary(narration.text, narration.duration);
        const fall = playBattleAction(scene, scene.actors.guard.body, 'guard', 'stumble', { returnToIdle: false });
        if (!await fall.finished || !current()) return;
        // Fatal self-damage stays down; the round orchestrator presents defeat.
        if (scene.combat.guard.hp > 0) {
            scene.sfx?.play('getUp');
            const recovery = playBattleAction(scene, scene.actors.guard.body, 'guard', 'recovery');
            if (!await recovery.finished || !current()) return;
        }
    }
    // Other-actor status transitions must not interrupt the speaking actor.
    for (const event of result.events) {
        if (['statusApplied', 'offGuardApplied'].includes(event.type) && event.targetId !== result.actorId)
            restoreBattleStance(scene, scene.actors[event.targetId].body, event.targetId);
    }
    const feedbackAt = elapsed;
    // Queue narration instead of stacking status and stun explanations.
    for (const entry of commentary) {
        effects.showMechanicalCommentary(entry.text, entry.duration);
        if (!await wait(entry.duration)) return;
    }
    const minimum = result.skipped || result.events.some(event => event.type === 'stunApplied')
        ? Math.max(T.minimumAction, feedbackAt + T.stunFeedbackHold) : T.minimumAction;
    const active = await Promise.all([action.finished, ...reactions.map(reaction => reaction.finished),
        waitBattlePresentation(scene, Math.max(0, minimum - elapsed, action.durationMs - elapsed, readableUntil - elapsed))]);
    if (!current() || active.at(-1) === false) return;
    if (!await wait(damage || result.action === 'attack' || result.action === 'swingBackpack' ? T.physicalRecovery : T.skillRecovery)) return;
    effects.clearPresentationOverlay();
    // Round orchestration owns input unlock, outcome and the next action.
    for (const id of ['player', 'guard']) restoreBattleStance(scene, scene.actors[id].body, id);
    scene.advanceResolution();
}
