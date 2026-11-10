import CombatSystem, { PLAYER_ACTIONS, STATUSES, validActions } from '../combat/CombatSystem.js';

export const START_SCHEMA = 'midbattle-starts-v1';
// Stratified draft sampling plus one REAL round produces coherent history,
// duration, cost/recovery and finite-resource combinations. The seed round is
// before the episode: no seed damage/reward is carried into learning.
export const HP_START_RANGES = Object.freeze([[0,10],[10,25],[25,50],[50,75],[75,100]]);
const pick = (values, rng) => values[Math.floor(rng() * values.length)];
const integer = (min, max, rng) => min + Math.floor(rng() * (max - min + 1));
export function applyRandomizedStart(combat, rng) {
    if (combat.round || combat.turnState !== 'WAITING_FOR_PLAYER') throw Error('Randomized start requires a fresh round boundary');
    for(let attempt=0;attempt<64;attempt++){
        const candidate=new CombatSystem({random:rng,tieRandom:rng,dialogueRandom:rng});
        sampleDraft(candidate,rng);
        const p=pick(validActions(candidate,'player'),rng),g=pick(validActions(candidate,'guard'),rng);
        candidate.beginRound();candidate.lockActions(p,g);candidate.revealActions();candidate.resolveNextAction();candidate.resolveNextAction();
        const round=candidate.endRound();
        // Only live Guard decision boundaries become randomized episode starts.
        if(round.outcome || !validActions(candidate,'guard').length)continue;
        const state=candidate.snapshot();assertCoherentStart(state);
        for(const id of ['player','guard'])Object.assign(combat[id],state[id]);
        combat.previousPlayerAction=state.previousPlayerAction;combat.previousPlayerActionCategory=state.previousPlayerActionCategory;
        return;
    }
    throw Error('Unable to construct a live randomized decision state');
}
function sampleDraft(combat,rng){
    for (const id of ['player','guard']) {
        const actor = combat[id], bucket = integer(0,4,rng), [lower,upper] = HP_START_RANGES[bucket];
        const minimum = bucket === 0 ? 1 : Math.floor(actor.maxHp * lower / 100) + 1;
        actor.hp = integer(minimum, Math.floor(actor.maxHp * upper / 100), rng);
        // Sample SP bands evenly too; no exact raw SP is added to the encoder.
        const [lo,hi] = pick([[0,14],[15,19],[20,100]],rng);
        actor.sp = integer(lo,hi,rng);
        const status = pick(id === 'player' ? [null,'FOCUSED','DISTRACTED'] : [null,'FOCUSED','DISTRACTED','RILED'],rng);
        actor.status = status ? { name: status, turns: integer(1,STATUSES[status].turns,rng) } : null;
        actor.defending = false; actor.stunned = false; actor.offGuard = false;
    }
    combat.guard.wifeCallAvailable = combat.guard.status?.name === 'FOCUSED' ? false : rng() < .5;
    combat.guard.donutAvailable = rng() < .5;
}

export function assertCoherentStart(state) {
    if (state.turnState !== 'WAITING_FOR_PLAYER') throw Error('Not an unlocked start');
    for (const id of ['player','guard']) {
        const a=state[id];
        if (!Number.isInteger(a.hp) || a.hp<1 || a.hp>a.maxHp || !Number.isInteger(a.sp) || a.sp<0 || a.sp>a.maxSp
            || a.defending || (id==='guard'&&a.stunned) || a.offGuard) throw Error('Invalid round-boundary actor');
        if(a.status && (!(a.status.name in STATUSES) || !Number.isInteger(a.status.turns) || a.status.turns<1 || a.status.turns>STATUSES[a.status.name].turns))throw Error('Invalid status duration');
    }
    if(state.player.status?.name==='RILED')throw Error('Player RILED is unreachable with current kits');
    if(state.player.stunned && state.player.status?.name!=='DISTRACTED')throw Error('Whistle stun must retain DISTRACTED');
    if(state.guard.status?.name==='FOCUSED' && state.guard.wifeCallAvailable)throw Error('Focused Guard must have used Wife');
    if(state.previousPlayerAction!==null && !PLAYER_ACTIONS.includes(state.previousPlayerAction))throw Error('Invalid previous action');
    return true;
}
