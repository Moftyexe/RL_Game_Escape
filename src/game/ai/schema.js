// Shared browser/headless compatibility identity. Bump schema when features change.
import CombatSystem, { ACTIONS, GUARD_ACTIONS, PLAYER_ACTIONS, STATUSES, LOOK_THERE_FULL_SUCCESS_CHANCE, RILED_STUMBLE, DONUT_HEAL, CATCH_BREATH_HEAL, PLAYER_DEFEND_EVASION } from '../combat/CombatSystem.js';
export const STATE_SCHEMA_VERSION = 'guard-q-v7';
export const Q_FORMAT = 'school-guard-qtable';
export const Q_FORMAT_VERSION = 2;
const initial = new CombatSystem();
const stats = actor => Object.fromEntries(['maxHp','maxSp','baseAttackDamage','baseAccuracy','baseCriticalChance','criticalDamageMultiplier'].map(key => [key, actor[key]]));
export const COMBAT_SIGNATURE = JSON.stringify({
    player: stats(initial.player), guard: stats(initial.guard),
    actions: Object.fromEntries([...new Set([...PLAYER_ACTIONS, ...GUARD_ACTIONS])].map(key => {
        const { cost, priority, category, damage, accuracy } = ACTIONS[key];
        return [key, { cost, priority, category, damage, accuracy }];
    })), statuses: STATUSES, lookThereChance: LOOK_THERE_FULL_SUCCESS_CHANCE,
    stumble: RILED_STUMBLE, recovery: {donutHp:DONUT_HEAL,donutSp:0,catchHp:CATCH_BREATH_HEAL,catchSp:0},playerDefendEvasion:PLAYER_DEFEND_EVASION,
    rules: 'hidden-priority-random-ties|execute-costs|death-cancels|offguard-current-interrupt-plus-next-round-skip|round-status-fresh-no-tick|defend-round-player-evasion-physical-rolled-only|whistle-stun-next-opportunity-v1|catch-30sp-150hp|smack-direct-30|wife-always-focused|five-hp-bins|donut-value-200-v5'
});
