import { REWARDS } from '../training/TrainingConfig.js';
export const guardOutcome = combatOutcome => combatOutcome === 'DEFEAT' ? 'win' : combatOutcome === 'VICTORY' ? 'loss' : combatOutcome === 'DRAW' ? 'draw' : null;
export default function guardReward({ events = [], outcome = null }, weights = REWARDS) {
    let reward = weights.roundCost;
    for (const event of events) if (event.type === 'damage') {
        // Per-hit HP removal, so healing cannot masquerade as negative damage;
        // overkill cannot earn extra shaping reward beyond HP actually removed.
        const amount = Number.isFinite(event.hpBefore) && Number.isFinite(event.hpAfter)
            ? Math.max(0, Math.min(event.damage, event.hpBefore - event.hpAfter)) : event.damage;
        if (event.targetId === 'player') reward += amount / weights.damageDivisor;
        if (event.targetId === 'guard') reward -= amount / weights.damageDivisor;
    }
    const terminal = guardOutcome(outcome);
    return reward + (terminal ? weights[terminal] : 0);
}
