// Auditable event palette. Empty arrays deliberately represent missing Foley.
export const SFX_EVENTS={
 UI:{'Menu move':['uiMove'],'Menu confirm / select':['uiConfirm'],'Menu cancel / Back':['uiCancel'],'Invalid / insufficient SP':['uiInvalid']},
 Dialogue:{'Open':['dialogueOpen'],'Typewriter (every third non-space character)':['dialogueTick'],'Reveal current line':[],'Advance / final confirm':['dialogueAdvance']},
 Transitions:{'Gate encounter':['encounter'],'Battle shutter close':['wipe'],'Battle reveal':['reveal'],'Next day':['nextDay']},
 Exploration:{'Running step (alternates three)':['foot1','foot2','foot3'],'Gate/door Foley (no door currently opens)':[]},
 'Player actions':{'Attack swing':['swing'],'Attack hit':['hit'],'Attack miss':['reveal'],'Attack critical':['hit','critical'],'Defend activation':['brace'],'Defended hit':['block'],'Bro, Lock In':['focused'],'Talk Smack':['smack','riled'],'Look There distraction':['distracted'],'Look There full success':['offGuard'],'Backpack swing':['heavySwing'],'Backpack hit':['heavyHit'],'Backpack miss':['heavySwing'],'Backpack critical':['heavyHit','critical'],'Catch Breath':['breath','heal']},
 'Guard actions':{'Attack swing':['swing'],'Attack hit':['hit'],'Attack miss':['reveal'],'Attack critical':['hit','critical'],'Defend activation':['brace'],'Defended hit':['block'],'Crack Knuckles':['crack','riled'],'Blow Whistle':['whistle'],'Whistle stun proc':['stun'],'Call Wife buttons':['phoneButton'],'Call Wife Focused':['focused'],'Call Wife ring':[],'Eat Donut bite/chew':[],'Eat Donut healing':['heal'],'Stumble missed swing':['reveal'],'Stumble fall':['fall'],'Stumble get-up (only if alive)':['getUp']},
 Damage:{'Light hurt / physical impact':['hit'],'Heavy hurt / Backpack':['heavyHit'],'Critical impact layer':['critical'],'Guard stumble self-damage':['fall']},
 Status:{FOCUSED:['focused'],DISTRACTED:['distracted'],RILED:['riled'],STUN:['stun'],'OFF GUARD':['offGuard']},
 Results:{'Player victory / escape':['victory'],'Player defeat':['defeat'],'Guard defeat extra impact':[]}
};
