import RandomGuardPolicy from '../combat/RandomGuardPolicy.js';
import { ACTIONS, GUARD_ACTIONS, validActions } from '../combat/CombatSystem.js';
import QLearningGuardPolicy, { POLICY_MODE } from './QLearningGuardPolicy.js';
import QTable from './QTable.js';
import StateEncoder, { guardObservation } from './StateEncoder.js';
import ReadinessGuardPolicy from './ReadinessGuardPolicy.js';
import {readinessForTier} from '../progression/RunState.js';
export const GUARD_AI_MODE = Object.freeze({ RANDOM: 'RANDOM', Q: 'Q-LEARNING' });
export const Q_TABLE_CACHE_KEY = 'guard-trained-qtable';
export default class GuardAIController {
    constructor({ random = Math.random, runContext = null } = {}) {
        this.random = random; this.randomPolicy = new RandomGuardPolicy(random);
        this.qPolicy = null; this.mode = GUARD_AI_MODE.RANDOM; this.encoder = new StateEncoder();
        this.loadStatus = 'Q-table not loaded'; this.lastDecision = null;
        this.runContext=runContext;this.readinessPolicy=null;
    }
    get policy() { return this.mode === GUARD_AI_MODE.Q && this.qPolicy ? this.readinessPolicy??this.qPolicy : this.randomPolicy; }
    load(data) {
        try {
            if (typeof data === 'string') data = JSON.parse(data);
            this.qPolicy = new QLearningGuardPolicy({ table: QTable.fromJSON(data), mode: POLICY_MODE.EVAL, random: this.random });
            this.readinessPolicy=this.runContext?new ReadinessGuardPolicy(this.qPolicy,this.runContext.readinessTier,this.random):null;
            this.mode = GUARD_AI_MODE.Q; this.loadStatus = 'Trained table loaded; EVAL only';
            return true;
        } catch {
            this.qPolicy = null; this.readinessPolicy=null; this.mode = GUARD_AI_MODE.RANDOM; this.loadStatus = 'Q-table unavailable/incompatible; Random baseline';
            return false;
        }
    }
    toggle() {
        this.mode = this.mode === GUARD_AI_MODE.RANDOM && this.qPolicy ? GUARD_AI_MODE.Q : GUARD_AI_MODE.RANDOM;
        return this.mode;
    }
    chooseAction(state) {
        const observation = guardObservation(state);
        const action = validActions(observation, 'guard').length ? this.policy.chooseAction(observation) : null;
        this.recordDecision(observation, action);
        return action;
    }
    recordDecision(state, action) {
        this.lastDecision = { observation: guardObservation(state), action, mode: this.mode,
            fallback:this.mode===GUARD_AI_MODE.Q&&!!this.policy?.lastSelection?.fallback,
            ranked:this.mode===GUARD_AI_MODE.Q?this.policy?.lastSelection?.ranked??null:null };
    }
    debugView(state, revealed = false) {
        const observation = revealed && this.lastDecision ? this.lastDecision.observation : guardObservation(state);
        const key = this.encoder.encode(observation), valid = validActions(observation, 'guard');
        return { mode: this.mode, committedMode: revealed ? this.lastDecision?.mode : null, loadStatus: this.loadStatus,
            narrative:this.runContext?{...this.runContext,distribution:readinessForTier(this.runContext.readinessTier).weights,
                ranked:revealed?this.lastDecision?.ranked:null}:null,
            stateKey: key, epsilon: 0, learning: false, forced: observation.guard.offGuard,
            fallback:valid.length>0 && (revealed?!!this.lastDecision?.fallback:this.mode===GUARD_AI_MODE.Q&&!!this.qPolicy&&!valid.some(a=>this.qPolicy.table.hasVisited(key,a))),
            chosen: revealed ? this.lastDecision?.action ?? null : null, revealed,
            actions: GUARD_ACTIONS.map(action => ({ action, label: ACTIONS[action].label,
                valid: valid.includes(action), q: this.qPolicy?.table.get(key, action) ?? 0,
                visits:this.qPolicy?.table.getVisitCount(key,action)??0 })) };
    }
}
