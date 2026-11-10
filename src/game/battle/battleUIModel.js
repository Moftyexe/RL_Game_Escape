import {ACTIONS, CATCH_BREATH_HEAL, PLAYER_DEFEND_EVASION, LOOK_THERE_FULL_SUCCESS_CHANCE, getEffectiveStats} from '../combat/CombatSystem.js';

// Presentation reads public actor state only; never the committed Guard action.
const DESCRIPTIONS = {
    attack: 'Throw a reliable physical punch.',
    defend: 'Brace for this round. Damage down, evasion up, recover SP.',
    broLockIn: 'Focus yourself for better accuracy, critical hits and protection.',
    talkSmack: 'Deal fixed emotional damage and rile up the Guard. Cannot miss or crit.',
    lookThere: 'Distract the Guard, with a chance to leave him off guard.',
    swingBackpack: 'Swing your backpack for a heavy but less accurate physical hit.',
    catchBreath: 'Spend SP to recover HP. No protection or SP recovery.',
    skills: 'Open your status, distraction, heavy attack and healing commands.',
    back: 'Return to ATTACK, DEFEND and SKILLS.'
};
export const STATUS_HELP = {
    FOCUSED: 'Accuracy up / Crit up / Defense up',
    RILED: 'Damage up / Crit up / Accuracy down / Defense down',
    DISTRACTED: 'Accuracy down / Defense down',
    OFF_GUARD: 'Cancels a pending Guard move and skips his next round.'
};
export function actionContext(entry, player, valid = []) {
    const a = ACTIONS[entry];
    if (!DESCRIPTIONS[entry]) return null;
    const tags = [], details = [];
    if (a) {
        if (a.category === 'attack') {
            tags.push(`${a.damage ?? player.baseAttackDamage} DMG`, `${Math.round(getEffectiveStats(player, a.accuracy ?? player.baseAccuracy).accuracy * 100)}% HIT`);
        }
        if (entry === 'talkSmack') tags.push('30 FIXED DMG', 'ALWAYS HIT');
        if (entry === 'catchBreath') tags.push(`+${CATCH_BREATH_HEAL} HP`);
        tags.push(`${a.cost} SP`, a.priority);
        if (entry === 'defend') {
            details.push(`Damage down / +${Math.round(PLAYER_DEFEND_EVASION * 100)}pp evasion / +10 SP`);
            details.push(`SP ${player.sp} -> ${Math.min(player.maxSp, player.sp + 10)}`);
        }
        if (entry === 'catchBreath' && valid.includes(entry)) details.push(`HP ${player.hp} -> ${Math.min(player.maxHp, player.hp + CATCH_BREATH_HEAL)}   SP ${player.sp} -> ${player.sp - a.cost}`);
        if (entry === 'broLockIn') details.push(`FOCUSED: ${STATUS_HELP.FOCUSED}`);
        if (entry === 'talkSmack') details.push(`RILED: ${STATUS_HELP.RILED}`);
        if (entry === 'lookThere') details.push(`${Math.round(LOOK_THERE_FULL_SUCCESS_CHANCE * 100)}% OFF GUARD: action lost + next skip; otherwise DISTRACTED: accuracy / defense down.`);
    }
    const warning = a && !valid.includes(entry) ? player.sp < a.cost ? 'Not enough SP' : 'Unavailable this turn' : '';
    return {title:a?.label ?? entry.toUpperCase(), description:DESCRIPTIONS[entry], tags, details:details.join('   |   '), priority:a?.priority ?? '', warning};
}
export function statusBadges(actor, id) {
    return [actor.status ? `[${actor.status.name} ${actor.status.turns}]` : '', actor.defending ? '[DEFENDING]' : '', actor.offGuard ? '[OFF GUARD]' : '', actor.stunned ? '[STUN]' : ''].filter(Boolean).join(' ');
}
export function defendSummary(actor, id) {
    return actor.defending ? `Damage -${Math.round(getEffectiveStats(actor).defendReduction * 100)}%${id === 'player' ? ` / Evasion +${Math.round(PLAYER_DEFEND_EVASION * 100)}pp` : ''}` : '';
}
export function guardResources(actor) {
    return `[DONUT ${actor.donutAvailable ? '\u2713' : '\u2014'}]  [CALL ${actor.wifeCallAvailable ? '\u2713' : '\u2014'}]`;
}
