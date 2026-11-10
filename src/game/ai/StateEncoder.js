import { DONUT_HEAL } from '../combat/CombatSystem.js';
export const THEORETICAL_STATE_COUNT = 5 ** 2 * 3 ** 2 * 4 ** 2 * 2 ** 2 * 3 * 6; // 259,200
export const PREVIOUS_THEORETICAL_STATE_COUNT = THEORETICAL_STATE_COUNT * 2 / 3; // 172,800
// PARTIAL_VALUE includes zero missing HP; authoritative validity still masks
// Donut at full HP. This follows resource-value encoding, not a tactical rule.
export const donutState = actor => !actor.donutAvailable ? 'UNAVAILABLE'
    : actor.maxHp - actor.hp >= DONUT_HEAL ? 'FULL_VALUE' : 'PARTIAL_VALUE';
export const hpBucket = actor => {
    const percent = actor.hp * 100 / actor.maxHp;
    return percent <= 10 ? 'CRITICAL' : percent <= 25 ? 'LOW' : percent <= 50 ? 'MID' : percent <= 75 ? 'HIGH' : 'VERY_HIGH';
};
export const spBucket = sp => sp < 15 ? 'LOW' : sp < 20 ? 'MEDIUM' : 'HIGH';
const previousCategories = Object.freeze({ attack: 'ATTACK', swingBackpack: 'ATTACK', defend: 'DEFEND', broLockIn: 'SELF_BUFF', talkSmack: 'DISRUPTION', lookThere: 'DISRUPTION', catchBreath: 'RECOVERY' });
export const previousCategory = action => previousCategories[action] ?? 'NONE';
const mental = actor => ['FOCUSED','DISTRACTED','RILED'].includes(actor.status?.name) ? actor.status.name : 'NONE';

// Whitelist public information. No commitment, current action/skill, sprites or RNG.
export function guardObservation(state) {
    const actor = value => ({ hp: value.hp, maxHp: value.maxHp, sp: value.sp, maxSp: value.maxSp,
        status: value.status ? { name: value.status.name, turns: value.status.turns } : null,
        stunned: !!value.stunned, offGuard: !!value.offGuard, defending: !!value.defending,
        wifeCallAvailable: !!value.wifeCallAvailable, donutAvailable: !!value.donutAvailable });
    return { player: actor(state.player), guard: actor(state.guard), previousPlayerAction: state.previousPlayerAction ?? null };
}
export default class StateEncoder {
    encode(state) {
        const { guard: g, player: p } = state;
        return [`GHP_${hpBucket(g)}`, `PHP_${hpBucket(p)}`, `GSP_${spBucket(g.sp)}`, `PSP_${spBucket(p.sp)}`,
            `G_${mental(g)}`, `P_${mental(p)}`, `W${Number(!!g.wifeCallAvailable)}`, `DONUT_${donutState(g)}`,
            `PSTUN${Number(!!p.stunned)}`, `PREV_${previousCategory(state.previousPlayerAction)}`].join('|');
    }
}
