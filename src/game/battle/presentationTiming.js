// All values are cosmetic milliseconds. CombatSystem never reads this module.
export const PRESENTATION_TIMING = Object.freeze({
    actionReveal: 800, minimumAction: 800, barTween: 320, feedbackFloat: 700,
    targetFlash: 160, normalShake: 90, criticalShake: 150,
    statusPoseHold: 875, talkSmackHold: 1500, lookThereHold: 1000,
    crackKnucklesHold: 1000, recoveryHold: 875,
    whistlePoseHold: 875, stunFeedbackHold: 1700,
    phoneDialogueStart: 400, phoneResponsePause: 150,
    commentarySimple: 1200, commentaryImportant: 1600, defendHold: 500, watchdogLimit: 5000, watchdogGrace: 500,
    actionBanner: 690, dialogueEffectLead: 220,
    dialogueMinimum: 1500, dialogueMaximum: 4000, dialogueBase: 1300, dialoguePerCharacter: 40,
    physicalRecovery: 100, skillRecovery: 175,
    normalHitStop: 100, blockedHitStop: 80, criticalHitStop: 140,
    blockedShake: 60, criticalFlash: 220, reactionStep: 55, statusPulse: 275,
    reactionSmall: 3, reactionStrong: 5
});

// Zero-based inspected expressive poses. Frame duration extends that pose while
// still playing every source frame, including the recovery back to neutral.
const T = PRESENTATION_TIMING;
export const ANIMATION_PRESENTATION = Object.freeze({
    'guard-battle-distracted': { endFrame: 2, holdFrame: 2, holdMs: 0 },
    'guard-battle-stumble': { holdFrame: 5, holdMs: 300 },
    'player-battle-defend': { holdFrame: 3, holdMs: T.defendHold, cueFrame: 3 },
    'guard-battle-defend': { holdFrame: 3, holdMs: T.defendHold, cueFrame: 3 },
    'player-battle-lock-in': { holdFrame: 3, holdMs: T.statusPoseHold, cueFrame: 3 },
    // Human poses 1,2,3,5,6: omit fourth visual pose (source index3).
    'player-battle-talk-smack': { frameSequence: [0,1,2,4,5], holdFrame: 2, holdMs: T.talkSmackHold, cueFrame: 2 },
    'player-battle-look-there': { holdFrame: 3, holdMs: T.lookThereHold, cueFrame: 3 },
    'player-battle-catch-breath': { holdFrame: 3, holdMs: T.recoveryHold, cueFrame: 3 },
    'guard-battle-crack-knuckles': { holdFrame: 5, holdMs: T.crackKnucklesHold, cueFrame: 5 },
    'guard-battle-blow-whistle': { holdFrame: 3, holdMs: T.whistlePoseHold, cueFrame: 3 },
    'guard-battle-call-wife': { holdFrame: 4, holdMs: 0 },
    'guard-battle-eat-donut': { holdFrame: 4, holdMs: T.recoveryHold, cueFrame: 4 }
});

// Short lines stay brief; longer speech gets time to read, regardless of speaker.
export function dialogueDuration(action, message = '') {
    return Math.min(T.dialogueMaximum, Math.max(T.dialogueMinimum, T.dialogueBase + [...message].length * T.dialoguePerCharacter));
}

export function animationFrameIndices(entry, key) {
    return ANIMATION_PRESENTATION[key]?.frameSequence ?? Array.from({length:Math.min(entry.frames.length,(ANIMATION_PRESENTATION[key]?.endFrame ?? entry.frames.length-1)+1)},(_,i)=>i);
}
export function animationDuration(entry, key) {
    return animationFrameIndices(entry,key).length / entry.frameRate * 1000 + (ANIMATION_PRESENTATION[key]?.holdMs ?? 0);
}

export function animationFrameTime(entry, key, frame) {
    if (frame == null) return 0;
    const profile = ANIMATION_PRESENTATION[key];
    const sequence=animationFrameIndices(entry,key),index=sequence.indexOf(frame);
    if(index<0)throw Error('Cue references an omitted animation frame');
    return index / entry.frameRate * 1000 + (profile && sequence.indexOf(profile.holdFrame) < index ? profile.holdMs : 0);
}
