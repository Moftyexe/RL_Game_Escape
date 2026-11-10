import { validActions, CATCH_BREATH_HEAL } from '../combat/CombatSystem.js';
export const BOT_TYPES = Object.freeze(['random','aggressive','tricky']);
export const PLAYER_BOT_SCHEMA = 'player-bots-v2-heal-utility';
export const healEfficiency = player => Math.min(CATCH_BREATH_HEAL,Math.max(0,player.maxHp-player.hp))/CATCH_BREATH_HEAL;
export function weightedChoice(weights, random) {
    const entries = Object.entries(weights).filter(([, weight]) => weight > 0), total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    if (!total) return null;
    let roll = random() * total;
    for (const [value, weight] of entries) { roll -= weight; if (roll < 0) return value; }
    return entries.at(-1)[0];
}
export function playerBotWeights(type,state){
    if (!BOT_TYPES.includes(type)) throw new Error(`Unknown player bot: ${type}`);
    const low=state.player.sp<20;
    const weights=type==='random'?Object.fromEntries(validActions(state,'player').map(a=>[a,1])):type==='aggressive'
            ? { attack: 6, swingBackpack: 8, broLockIn: state.player.status?.name === 'FOCUSED' ? 0.2 : 1,
                defend: 0.5, lookThere: 0.2, talkSmack: 0.2, catchBreath: low ? 10 : 0.15 }
            : { attack: 2, swingBackpack: 1, defend: 4, broLockIn: 3, lookThere: 5, talkSmack: 4, catchBreath: low ? 8 : 1 };
    weights.catchBreath=(weights.catchBreath??0)*healEfficiency(state.player);
    return Object.fromEntries(validActions(state,'player').map(action=>[action,weights[action]]));
}
export function createPlayerBot(type, random) {
    if (!BOT_TYPES.includes(type)) throw new Error(`Unknown player bot: ${type}`);
    return { type, chooseAction:state=>weightedChoice(playerBotWeights(type,state),random) };
}
