import { validActions } from '../combat/CombatSystem.js';
import StateEncoder, { guardObservation } from './StateEncoder.js';
import QTable from './QTable.js';
import RandomGuardPolicy from '../combat/RandomGuardPolicy.js';
import { TRAINING_CONFIG } from '../training/TrainingConfig.js';
export const POLICY_MODE = Object.freeze({ TRAIN: 'TRAIN', EVAL: 'EVAL' });
export default class QLearningGuardPolicy {
    constructor({ table = new QTable(), mode = POLICY_MODE.EVAL, random = Math.random,
        alpha = TRAINING_CONFIG.alpha, gamma = TRAINING_CONFIG.gamma, epsilon = TRAINING_CONFIG.epsilonStart } = {}) {
        if (!Object.values(POLICY_MODE).includes(mode)) throw new Error('Unknown policy mode');
        if (!(alpha > 0 && alpha <= 1) || !(gamma >= 0 && gamma <= 1)) throw new Error('Invalid Q hyperparameters');
        Object.defineProperty(this, 'mode', { value: mode, enumerable: true });
        this.table = table; this.random = random; this.alpha = alpha; this.gamma = gamma; this.encoder = new StateEncoder();
        this.randomFallback = new RandomGuardPolicy(random);this.lastSelection=null;
        this.setEpsilon(mode === POLICY_MODE.EVAL ? 0 : epsilon);
    }
    setEpsilon(value) {
        if (!Number.isFinite(value) || value < 0 || value > 1 || (this.mode === POLICY_MODE.EVAL && value !== 0)) throw new Error('Invalid epsilon for mode');
        this.epsilon = value;
    }
    chooseAction(snapshot) {
        const observation = guardObservation(snapshot), actions = validActions(observation, 'guard');
        if (!actions.length) {this.lastSelection={fallback:false,forced:true};return null;}
        const key=this.encoder.encode(observation);
        if(this.mode===POLICY_MODE.TRAIN){
            this.table.observeValidActions(key,actions);
            const unvisited=actions.filter(a=>!this.table.hasVisited(key,a));
            if(unvisited.length){this.lastSelection={fallback:false,unvisited:true};return unvisited[Math.floor(this.random()*unvisited.length)];}
        }else{
            const visited=actions.filter(a=>this.table.hasVisited(key,a));
            this.lastSelection={fallback:visited.length===0};
            return visited.length?this.table.bestAction(key,visited,this.random):this.randomFallback.chooseAction(observation);
        }
        this.lastSelection={fallback:false,unvisited:false};
        if (this.mode === POLICY_MODE.TRAIN && this.epsilon > 0 && this.random() < this.epsilon)
            return actions[Math.floor(this.random() * actions.length)];
        return this.table.bestAction(key, actions, this.random);
    }
    learn(state, action, reward, nextState, { terminal = false, rounds = 1 } = {}) {
        if (this.mode !== POLICY_MODE.TRAIN) throw new Error('Learning is disabled in EVAL mode');
        if (!validActions(state, 'guard').includes(action) || !Number.isFinite(reward) || !Number.isInteger(rounds) || rounds < 1) throw new Error('Invalid learning transition');
        const key = this.encoder.encode(state), old = this.table.get(key, action);
        const future = terminal ? 0 : this.table.maxQ(this.encoder.encode(nextState), validActions(nextState, 'guard'));
        // A normal transition is standard one-step Q-learning. Forced rounds are
        // a discounted multi-round transition to the next real Guard decision.
        const value=this.table.set(key, action, old + this.alpha * (reward + this.gamma ** rounds * future - old));
        // Count one learned commitment/transition, even when later interrupted.
        // Forced no-decision rounds aggregate into it and receive no visits.
        this.table.observeValidActions(key,validActions(state,'guard'));
        this.table.incrementVisit(key,action);
        return value;
    }
}
