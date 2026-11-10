import { PRESENTATION_TIMING as T } from './presentationTiming.js';
const STATUS_DETAIL = Object.freeze({
    FOCUSED: 'Accuracy ↑   Crit ↑   Defense ↑',
    DISTRACTED: 'Accuracy ↓   Defense ↓',
    RILED: 'Damage ↑   Crit ↑   Accuracy ↓   Defense ↓'
});
const subject = id => id === 'guard' ? 'The Guard' : 'You';
const recovery = event => [event?.hp ? `+${event.hp} HP` : '', event?.sp ? `+${event.sp} SP` : ''].filter(Boolean).join('   ');

// Pure narration from resolved events. It never applies a mechanic or rolls RNG.
export function mechanicalCommentary(result, before = {}, { playerAlreadyActed = false } = {}) {
    const entries = [];
    const add = (text, important = false) => entries.push({ text, duration: Math.min(important ? 2200 : 1500,
        Math.max(important ? T.commentaryImportant : T.commentarySimple, 700 + [...text].length * 18)) });
    const restored = result.events.find(e => e.type === 'restored');
    if (result.action === 'callWife') {
        add('The Guard called his wife.');
        if (before.guard?.status?.name === 'FOCUSED') add(`His confidence was restored.\nFOCUSED refreshed.   ${recovery(restored)}`, true);
        else add(`His wife encouraged him.\nFOCUSED   ${recovery(restored)}`, true);
        return entries;
    }
    if (result.action === 'eatDonut') add(`The Guard ate a donut.\n${recovery(restored)}`, true);
    if (result.action === 'catchBreath') add(`You catch your breath.\n${recovery(restored) || 'HP is already full.'}`);
    if (result.action === 'defend') add(`${result.actorId === 'guard' ? 'The Guard' : 'The Player'} braces for impact.`);
    if (result.action === 'talkSmack') add('Critical emotional damage.\n-30 HP   Guard is RILED.', true);
    for (const event of result.events) {
        if (event.type === 'statusApplied' && result.action !== 'talkSmack') {
            const refreshed = before[event.targetId]?.status?.name === event.status;
            add(refreshed ? `${subject(event.targetId)} ${event.targetId === 'guard' ? 'remains' : 'remain'} ${event.status}.`
                : `${subject(event.targetId)} ${event.targetId === 'guard' ? 'is' : 'are'} ${event.status}.\n${STATUS_DETAIL[event.status]}`, !refreshed);
        }
        if (event.type === 'offGuardApplied') {
            add('The Guard actually fell for it.');
            add(event.interrupted ? 'OFF GUARD!\nHis pending action was interrupted.' : 'OFF GUARD!\nHis next action will be lost.', true);
        }
        if (event.type === 'offGuardSkipped') add('The Guard is still looking away.\nHe loses his action.', true);
        if (event.type === 'stunApplied') add(`The whistle stunned you!\n${playerAlreadyActed ? 'Your next action will be skipped.' : 'Your action was interrupted.'}`, true);
        if (event.type === 'turnSkipped') add('You were stunned!\nYour action was interrupted.');
        if (event.type === 'stumbled') add('The Guard swung too hard and fell on his face.\n-50 HP', true);
        if (event.type === 'damage' && event.blocked) add('The attack was partially blocked.');
    }
    return entries;
}
