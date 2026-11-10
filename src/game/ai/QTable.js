import { GUARD_ACTIONS } from '../combat/CombatSystem.js';
import { STATE_SCHEMA_VERSION, COMBAT_SIGNATURE, Q_FORMAT, Q_FORMAT_VERSION } from './schema.js';
const actionSet = new Set(GUARD_ACTIONS);
const checkAction = action => { if (!actionSet.has(action)) throw new Error(`Unknown Guard action: ${action}`); };
export default class QTable {
    constructor() { this.rows = new Map(); this.visits = new Map(); this.legalSeen = new Map(); }
    get stateCount() { return this.rows.size; }
    get pairCount() { return [...this.rows.values()].reduce((sum, row) => sum + row.size, 0); }
    get(state, action) { checkAction(action); return this.rows.get(state)?.get(action) ?? 0; }
    getVisitCount(state, action) { checkAction(action); return this.visits.get(state)?.get(action) ?? 0; }
    hasVisited(state, action) { return this.getVisitCount(state,action)>0; }
    incrementVisit(state, action) {
        checkAction(action);
        if(!this.rows.get(state)?.has(action))this.set(state,action,0);
        if(!this.visits.has(state))this.visits.set(state,new Map());
        const n=this.getVisitCount(state,action)+1;
        if(!Number.isSafeInteger(n))throw Error('Visit count overflow');
        this.visits.get(state).set(action,n);return n;
    }
    observeValidActions(state, actions) {
        if(!this.legalSeen.has(state))this.legalSeen.set(state,new Set());
        for(const action of actions){checkAction(action);this.legalSeen.get(state).add(action);}
    }
    coverage() {
        const distribution=Object.fromEntries([1,2,3,4,5,6].map(n=>[n,0])),counts=[];
        let complete=0,totalVisits=0,seenOptions=0,exploredOptions=0;
        for(const [state,row]of this.rows){
            const n=[...row.keys()].filter(a=>this.hasVisited(state,a)).length;
            if(!n)continue;counts.push(n);distribution[n]++;
            totalVisits += [...(this.visits.get(state)?.values()??[])].reduce((a,n)=>a+n,0);
            const legal=this.legalSeen.get(state)??new Set();
            seenOptions+=legal.size;exploredOptions+=[...legal].filter(a=>this.hasVisited(state,a)).length;
            if(legal.size&&[...legal].every(a=>this.hasVisited(state,a)))complete++;
        }
        counts.sort((a,b)=>a-b);const states=counts.length,mid=Math.floor(states/2);
        return {encounteredStates:states,learnedPairs:counts.reduce((a,n)=>a+n,0),totalVisits,
            meanVisitedActions:states?counts.reduce((a,n)=>a+n,0)/states:0,
            medianVisitedActions:states?(states%2?counts[mid]:(counts[mid-1]+counts[mid])/2):0,
            statesByVisitedActions:distribution,percentByVisitedActions:Object.fromEntries(Object.entries(distribution).map(([k,n])=>[k,states?100*n/states:0])),
            fullyExploredSeenLegalStates:complete,fullyExploredSeenLegalPercent:states?100*complete/states:0,seenLegalPairs:seenOptions,exploredSeenLegalPairs:exploredOptions};
    }
    set(state, action, value) {
        checkAction(action);
        if (typeof state !== 'string' || !state.length || !Number.isFinite(value)) throw new Error('Invalid Q entry');
        if (!this.rows.has(state)) this.rows.set(state, new Map());
        this.rows.get(state).set(action, value);
        return value;
    }
    maxQ(state, validActions) {
        return validActions.length ? Math.max(...validActions.map(action => this.get(state, action))) : 0;
    }
    bestAction(state, validActions, rng = Math.random) {
        if (!validActions.length) return null;
        const best = this.maxQ(state, validActions);
        const tied = validActions.filter(action => this.get(state, action) === best);
        return tied.length === 1 ? tied[0] : tied[Math.floor(rng() * tied.length)];
    }
    toJSON(metadata = {}) {
        return { format: Q_FORMAT, version: Q_FORMAT_VERSION, stateSchema: STATE_SCHEMA_VERSION,
            combatSignature: COMBAT_SIGNATURE, actions: [...GUARD_ACTIONS], metadata,
            visitCounts: Object.fromEntries([...this.visits].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([s,row])=>[s,Object.fromEntries([...row].sort())])),
            legalActionsSeen: Object.fromEntries([...this.legalSeen].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([s,actions])=>[s,[...actions].sort()])),
            qValues: Object.fromEntries([...this.rows].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([state, row]) =>
                [state, Object.fromEntries([...row].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) ])) };
    }
    static fromJSON(data) {
        if (!data || data.format !== Q_FORMAT || data.version !== Q_FORMAT_VERSION || data.stateSchema !== STATE_SCHEMA_VERSION
            || data.combatSignature !== COMBAT_SIGNATURE || JSON.stringify(data.actions) !== JSON.stringify(GUARD_ACTIONS)
            || !data.qValues || typeof data.qValues !== 'object' || Array.isArray(data.qValues)
            || !data.visitCounts || typeof data.visitCounts!=='object' || Array.isArray(data.visitCounts)
            || !data.legalActionsSeen || typeof data.legalActionsSeen!=='object' || Array.isArray(data.legalActionsSeen)) throw new Error('Incompatible or malformed Guard Q-table');
        const table = new QTable();
        for (const [state, row] of Object.entries(data.qValues)) {
            if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Malformed Q row');
            for (const [action, value] of Object.entries(row)) table.set(state, action, value);
        }
        for(const [state,row]of Object.entries(data.visitCounts)){
            if(!row||typeof row!=='object'||Array.isArray(row))throw Error('Malformed visit row');
            for(const [action,n]of Object.entries(row)){
                checkAction(action);if(!Number.isSafeInteger(n)||n<0||!table.rows.get(state)?.has(action))throw Error('Invalid visit count');
                if(!table.visits.has(state))table.visits.set(state,new Map());table.visits.get(state).set(action,n);
            }
        }
        for(const [state,actions]of Object.entries(data.legalActionsSeen)){
            if(!Array.isArray(actions)||new Set(actions).size!==actions.length)throw Error('Invalid legal-action union');
            table.observeValidActions(state,actions);
        }
        return table;
    }
}
