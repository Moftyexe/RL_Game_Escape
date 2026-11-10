import CombatSystem, { validActions } from '../combat/CombatSystem.js';
import { guardObservation } from '../ai/StateEncoder.js';
import guardReward, { guardOutcome } from '../ai/RewardFunction.js';
import { seededRandom, deriveSeed } from './SeededRandom.js';
import { createPlayerBot } from './PlayerBots.js';
import { TRAINING_CONFIG } from './TrainingConfig.js';
import { applyRandomizedStart } from './RandomizedStarts.js';

// No Phaser and no alternative combat formulas. Each round uses the exact
// lock/reveal/resolve/end sequence used by BattleScene and resolveRound.
export default class TrainingEnvironment {
    constructor({ seed = TRAINING_CONFIG.seed, bot = 'random', maxRounds = TRAINING_CONFIG.maxRounds,
        gamma = TRAINING_CONFIG.gamma, keepTrace = false, randomizedStart = false } = {}) {
        if (!Number.isInteger(maxRounds) || maxRounds < 1) throw new Error('Invalid round limit');
        this.maxRounds = maxRounds; this.gamma = gamma; this.keepTrace = keepTrace;
        this.reset({ seed, bot, randomizedStart });
    }
    reset({ seed = this.seed, bot = this.botSpec, randomizedStart = false } = {}) {
        this.botSpec = bot; this.seed = seed; this.botType = typeof bot === 'string' ? bot : bot.type ?? 'custom';
        this.combat = new CombatSystem({ random: seededRandom(deriveSeed(seed, 'combat')),
            tieRandom: seededRandom(deriveSeed(seed, 'tie')), dialogueRandom: seededRandom(deriveSeed(seed, 'dialogue')) });
        this.startType = randomizedStart ? 'randomized' : 'normal';
        if(randomizedStart) applyRandomizedStart(this.combat, seededRandom(deriveSeed(seed,'midbattle-start')));
        this.initialState = this.combat.snapshot();
        this.playerBot = typeof bot === 'string' ? createPlayerBot(bot, seededRandom(deriveSeed(seed, 'player'))) : bot;
        this.rounds = 0; this.decisions = 0; this.forcedRounds = 0; this.totalReward = 0;
        this.outcome = null; this.roundLimitReached = false; this.actionCounts = {}; this.cancelledGuardActions = 0; this.trace = [];
        return this.observation();
    }
    get terminal() { return this.outcome !== null; }
    observation() { return guardObservation(this.combat.snapshot()); }
    decisionActions() { return this.terminal ? [] : validActions(this.observation(), 'guard'); }
    runRound(guardAction, forced) {
        if (this.terminal) throw new Error('Episode already ended');
        const pre = this.combat.beginRound();
        // Player receives a separate observation without the chosen Guard action.
        const playerAction = pre.player.stunned ? null : this.playerBot.chooseAction(guardObservation(pre));
        if (!this.combat.lockActions(playerAction, guardAction)) throw new Error('Policy committed an unavailable action');
        this.combat.revealActions(); this.combat.resolveNextAction(); this.combat.resolveNextAction();
        const round = this.combat.endRound(); this.rounds++;
        if (forced) this.forcedRounds++;
        this.outcome = round.outcome;
        if (!this.outcome && this.rounds >= this.maxRounds) { this.outcome = 'DRAW'; this.roundLimitReached = true; }
        const reward = guardReward({ events: round.events, outcome: this.outcome });
        this.totalReward += reward;
        this.cancelledGuardActions += round.events.filter(event => event.type === 'actionCancelled' && event.targetId === 'guard').length;
        const transition = { playerAction, guardAction, forced, orderedActions: round.orderedActions, events: round.events,
            nextState: this.observation(), outcome: this.outcome, reward };
        if (this.keepTrace) this.trace.push(transition);
        return transition;
    }
    // Public for tests/initial forced states. No policy is queried or Q row added.
    advanceForcedRounds() {
        const transitions = [];
        while (!this.terminal && this.decisionActions().length === 0) transitions.push(this.runRound(null, true));
        return transitions;
    }
    step(guardAction) {
        if (!this.decisionActions().includes(guardAction)) throw new Error('Not a valid Guard decision');
        const state = this.observation();
        this.decisions++; this.actionCounts[guardAction] = (this.actionCounts[guardAction] ?? 0) + 1;
        const transitions = [this.runRound(guardAction, false), ...this.advanceForcedRounds()];
        return { state, action: guardAction, rounds: transitions.length, transitions,
            reward: transitions.reduce((sum, transition, index) => sum + this.gamma ** index * transition.reward, 0),
            totalReward: transitions.reduce((sum, transition) => sum + transition.reward, 0),
            nextState: this.observation(), terminal: this.terminal, outcome: this.outcome };
    }
    summary() {
        return { outcome: guardOutcome(this.outcome), startType: this.startType, rounds: this.rounds, decisions: this.decisions,
            forcedRounds: this.forcedRounds, totalReward: this.totalReward, actionCounts: { ...this.actionCounts },
            cancelledGuardActions: this.cancelledGuardActions, roundLimitReached: this.roundLimitReached };
    }
}
