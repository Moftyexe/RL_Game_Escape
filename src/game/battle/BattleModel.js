import CombatSystem, { PLAYER_ACTIONS, GUARD_ACTIONS, ROUND_STATES, validActions } from '../combat/CombatSystem.js';
export const BATTLE_ACTIONS = Object.freeze([...new Set([...PLAYER_ACTIONS, ...GUARD_ACTIONS])]);

// Compatibility selection adapter. Policy observation never includes selections.
export default class BattleModel extends CombatSystem {
    constructor({ guardAgent = null, ...options } = {}) {
        super(options);
        this.guardAgent = guardAgent;
        this.selection = null;
        this.guardRequest = null;
    }
    get state() { return this.snapshot(); }
    selectPlayerAction(action) {
        if (this.turnState !== ROUND_STATES.WAITING_FOR_PLAYER || this.selection !== null) throw new Error('Selection is locked');
        if (!this.round) this.beginRound();
        this.validateAction(action, 'player');
        this.selection = action;
    }
    async requestGuardAction() {
        if (this.guardRequest) return this.guardRequest;
        if (this.turnState !== ROUND_STATES.WAITING_FOR_PLAYER || (!this.guardAgent && !this.guard.offGuard)) return null;
        if (!this.round) this.beginRound();
        const observation = structuredClone(this.round.preRoundState);
        this.guardRequest = (async () => {
            const action = observation.guard.offGuard ? null : await this.guardAgent.chooseAction(observation, validActions(observation, 'guard'));
            this.validateAction(action, 'guard');
            if (!this.lockActions(this.selection, action)) throw new Error('Cannot lock actions');
            return action;
        })();
        return this.guardRequest;
    }
    endRound() {
        const result = super.endRound();
        if (result) { this.selection = null; this.guardRequest = null; }
        return result;
    }
    validateAction(action, actorId = 'player') {
        const pre = this.round?.preRoundState ?? this.snapshot();
        if ((pre[actorId].stunned || (actorId === 'guard' && pre.guard.offGuard)) ? action !== null : !validActions(pre, actorId).includes(action)) throw new Error(`Unavailable action: ${action}`);
    }
}
