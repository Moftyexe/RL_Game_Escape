import {GAME_DIALOGUE} from '../dialogue/dialogueScript.js';
import Combatant from './Combatant.js';
import { PLAYER_INSULTS } from './combatDialogue.js';

export const ROUND_STATES = Object.freeze(Object.fromEntries(['WAITING_FOR_PLAYER','PLAYER_ACTION_SELECTED','ACTIONS_LOCKED','REVEALING','RESOLVING_FIRST','RESOLVING_SECOND','ROUND_END','VICTORY','DEFEAT','DRAW'].map(name => [name,name])));
export const PRIORITY = Object.freeze({ FAST: 'FAST', NORMAL: 'NORMAL', SLOW: 'SLOW' });
const PRIORITY_ORDER = [PRIORITY.FAST, PRIORITY.NORMAL, PRIORITY.SLOW];
const SPEEDS = { attack: PRIORITY.SLOW, defend: PRIORITY.FAST, catchBreath: PRIORITY.FAST,
 broLockIn: PRIORITY.NORMAL, talkSmack: PRIORITY.NORMAL, lookThere: PRIORITY.NORMAL,
 swingBackpack: PRIORITY.SLOW, crackKnuckles: PRIORITY.NORMAL, blowWhistle: PRIORITY.NORMAL,
 callWife: PRIORITY.FAST, eatDonut: PRIORITY.FAST };
export const LOOK_THERE_FULL_SUCCESS_CHANCE = 0.25;
export const RILED_STUMBLE = Object.freeze({ chance: 0.20, damage: 50 });
export const DONUT_HEAL = 200;
export const CATCH_BREATH_HEAL = 150;
export const PLAYER_DEFEND_EVASION = 0.05;
export const STATUSES = Object.freeze({
    FOCUSED: Object.freeze({ turns: 3, accuracy: 0.15, criticalChance: 0.1, damage: 1, defend: 0.15 }),
    DISTRACTED: Object.freeze({ turns: 2, accuracy: -0.25, criticalChance: 0, damage: 1, defend: -0.15 }),
    RILED: Object.freeze({ turns: 3, accuracy: -0.25, criticalChance: 0.25, damage: 1.5, defend: -0.1 })
});
const ACTION_DEFINITIONS = {
    attack: { label: 'ATTACK', cost: 0, category: 'attack' },
    defend: { label: 'DEFEND', cost: 0, category: 'defend' },
    broLockIn: { label: 'BRO, LOCK IN', cost: 15, category: 'skill', message: GAME_DIALOGUE.battle.actionLines.broLockIn },
    talkSmack: { label: 'TALK SMACK', cost: 15, category: 'skill' },
    lookThere: { label: 'LOOK THERE!', cost: 18, category: 'skill', message: GAME_DIALOGUE.battle.actionLines.lookThere },
    swingBackpack: { label: 'SWING BACKPACK', cost: 20, category: 'attack', damage: 140, accuracy: 0.8, message: GAME_DIALOGUE.battle.actionLines.swingBackpack },
    catchBreath: { label: 'CATCH BREATH', cost: 30, category: 'skill', message: GAME_DIALOGUE.battle.actionLines.catchBreath },
    crackKnuckles: { label: 'CRACK KNUCKLES', cost: 15, category: 'skill', message: GAME_DIALOGUE.battle.actionLines.crackKnuckles },
    blowWhistle: { label: 'BLOW WHISTLE', cost: 20, category: 'skill', message: GAME_DIALOGUE.battle.actionLines.blowWhistle },
    callWife: { label: 'CALL WIFE', cost: 0, category: 'skill', message: GAME_DIALOGUE.battle.actionLines.callWife },
    eatDonut: { label: 'EAT DONUT', cost: 0, category: 'skill', message: GAME_DIALOGUE.battle.actionLines.eatDonut }
};
export const ACTIONS = Object.freeze(Object.fromEntries(Object.entries(ACTION_DEFINITIONS).map(([key,value]) => [key,Object.freeze({...value, priority: SPEEDS[key]})])));
export const PLAYER_SKILLS = Object.freeze(['broLockIn', 'talkSmack', 'lookThere', 'swingBackpack', 'catchBreath']);
export const PLAYER_ACTIONS = Object.freeze(['attack', 'defend', ...PLAYER_SKILLS]);
export const GUARD_ACTIONS = Object.freeze(['attack', 'defend', 'crackKnuckles', 'blowWhistle', 'callWife', 'eatDonut']);
// Preserve exact percentage-point RNG thresholds despite floating-point sums.
const clamp = value => Math.max(0, Math.min(1, Math.round(value * 1e12) / 1e12));
const actionList = actorId => actorId === 'player' ? PLAYER_ACTIONS : GUARD_ACTIONS;
export const usesAccuracyRoll=definition=>!definition.alwaysHit&&definition.accuracyRolled!==false;
export function getActionAccuracy(attacker,defender,defenderId,definition){
    if(!usesAccuracyRoll(definition))return 1;
    const physical=definition.category==='attack'&&definition.physical!==false;
    const evasion=physical&&defenderId==='player'&&defender.defending?PLAYER_DEFEND_EVASION:0;
    // Apply evasion before the final probability clamp, retaining status bonuses.
    return clamp((definition.accuracy??attacker.baseAccuracy)+(STATUSES[attacker.status?.name]?.accuracy??0)-evasion);
}
// Derived at the moment of the attack, including the defender's current status.
export function getEffectiveStats(actor, baseAccuracy = actor.baseAccuracy) {
    const effect = actor.status ? STATUSES[actor.status.name] : null;
    return {
        accuracy: clamp(baseAccuracy + (effect?.accuracy ?? 0)),
        criticalChance: clamp(actor.baseCriticalChance + (effect?.criticalChance ?? 0)),
        damageMultiplier: effect?.damage ?? 1,
        defendReduction: clamp(0.5 + (effect?.defend ?? 0))
    };
}

// Shared by player UI, combat validation and the random policy.
export function validActions(state, actorId) {
    if (!['player','guard'].includes(actorId) || state.player.hp <= 0 || state.guard.hp <= 0 || state[actorId].stunned || (actorId === 'guard' && state.guard.offGuard)) return [];
    const actor = state[actorId];
    return actionList(actorId).filter(action => {
        if (actor.sp < ACTIONS[action].cost) return false;
        if (action === 'eatDonut') return actor.donutAvailable && actor.hp < actor.maxHp;
        if (action === 'callWife') return actor.wifeCallAvailable;
        return true;
    });
}

export default class CombatSystem {
    constructor({ random = Math.random, tieRandom = random, dialogueRandom = Math.random } = {}) {
        this.random = random;
        this.tieRandom = tieRandom;
        this.dialogueRandom = dialogueRandom;
        this.player = new Combatant('Player');
        this.guard = new Combatant('Guard', { hasDonut: true, hasWifeCall: true, maxHp: 1200 });
        this.turnState = ROUND_STATES.WAITING_FOR_PLAYER;
        this.round = null;
        this.previousPlayerAction = null;
        this.previousPlayerActionCategory = null;
        this.log = [GAME_DIALOGUE.battle.introduction];
    }

    snapshot() {
        return JSON.parse(JSON.stringify({ player: this.player, guard: this.guard,
            turnState: this.turnState, previousPlayerAction: this.previousPlayerAction, previousPlayerActionCategory: this.previousPlayerActionCategory }));
    }

    getValidActions(actorId) { return validActions(this, actorId); }

    applyStatus(actorId, name, events) {
        this[actorId].status = { name, turns: STATUSES[name].turns };
        events.push({ type: 'statusApplied', targetId: actorId, status: name });
    }

    removeStatus(actorId, events, reason) {
        const actor = this[actorId];
        if (!actor.status) return;
        events.push({ type: 'statusRemoved', targetId: actorId, status: actor.status.name, reason });
        actor.status = null;
    }

    restore(actorId, hp, sp, events) {
        const actor = this[actorId], hpBefore = actor.hp, spBefore = actor.sp;
        actor.hp = Math.min(actor.maxHp, actor.hp + hp);
        actor.sp = Math.min(actor.maxSp, actor.sp + sp);
        events.push({ type: 'restored', targetId: actorId, hp: actor.hp - hpBefore, sp: actor.sp - spBefore });
    }

    attack(actorId, action, events, messages) {
        const targetId = actorId === 'player' ? 'guard' : 'player';
        const actor = this[actorId], target = this[targetId];
        const definition = ACTIONS[action];
        const stats = getEffectiveStats(actor, definition.accuracy ?? actor.baseAccuracy);
        const effectiveAccuracy=getActionAccuracy(actor,target,targetId,definition),accuracyRolled=usesAccuracyRoll(definition);
        const accuracyInfo={effectiveAccuracy,accuracyRolled,defenderDefending:!!target.defending};
        if (accuracyRolled&&this.random() >= effectiveAccuracy) {
            events.push({ type: 'miss', actorId, targetId, physical: definition.category === 'attack', actorStatus: actor.status?.name ?? null,...accuracyInfo });
            messages.push(`${actor.name} missed.`);
            // Only Guard physical misses while RILED consume this extra roll.
            // Stumble is damage in this action, never a future skip/status.
            if (actorId === 'guard' && definition.category === 'attack' && actor.status?.name === 'RILED'
                && this.random() < RILED_STUMBLE.chance) {
                this.directDamage(actorId, actorId, RILED_STUMBLE.damage, 'stumble', events);
                events.push({ type: 'stumbled', targetId: actorId });
                messages.push('The Guard swung too hard and fell on his face. -50 HP');
            }
            return;
        }
        const critical = this.random() < stats.criticalChance;
        const blocked = target.defending;
        const reduction = blocked ? getEffectiveStats(target).defendReduction : 0;
        const damage = Math.round((definition.damage ?? actor.baseAttackDamage) * stats.damageMultiplier
            * (1 - reduction) * (critical ? actor.criticalDamageMultiplier : 1));
        const hpBefore = target.hp;
        target.hp = Math.max(0, target.hp - damage);

        events.push({ type: 'damage', actorId, targetId, damage, critical, blocked, physical: true, actorStatus: actor.status?.name ?? null,
            defenseReduction: reduction, hpBefore, hpAfter: target.hp,...accuracyInfo });
        messages.push(`${actor.name} ${action === 'swingBackpack' ? 'swung a backpack' : 'attacked'} for ${damage} damage.${critical ? ' CRITICAL!' : ''}${blocked ? ' BLOCKED.' : ''}`);
    }

    directDamage(actorId, targetId, damage, source, events) {
        const target = this[targetId], hpBefore = target.hp;
        target.hp = Math.max(0, target.hp - damage);
        events.push({ type: 'damage', actorId, targetId, damage, source,
            physical: false, critical: false, blocked: false, hpBefore, hpAfter: target.hp });
    }

    // Exactly one tick per completed round, including a skipped turn.
    // A new/refreshed status object keeps its full duration on its application round.
    tickStatus(actorId, statusAtStart, events) {
        const actor = this[actorId];
        if (actor.status && actor.status === statusAtStart) {
            actor.status.turns--;
            if (actor.status.turns === 0) this.removeStatus(actorId, events, 'expired');
        }
    }

    // Stun consumes one opportunity. Cancelled actions never pay costs.
    #executeAction(actorId, action) {
        const actor = this[actorId], events = [], messages = [];
        if (this.player.hp <= 0 || this.guard.hp <= 0) return { ok: true, actorId, action, skipped: true,
            events: [{type:'actionCancelled', targetId:actorId, reason:'defeated'}], messages: [actor.name + ' cannot act after defeat.'] };
        if (actorId === 'guard' && this.round.preRoundState.guard.offGuard) {
            // Current-round interruption does not consume the carried penalty.
            // A round that STARTED off guard reserves a null action opportunity;
            // consuming that opportunity clears the state immediately.
            actor.offGuard = false;
            return { ok: true, actorId, action: 'offGuard', skipped: true,
                events: [{ type: 'offGuardSkipped', targetId: actorId }, { type: 'offGuardCleared', targetId: actorId }],
                messages: ['The Guard is still looking away. He loses his action.'] };
        }
        if (actorId === 'guard' && actor.offGuard) {
            return { ok: true, actorId, action, skipped: true,
                events: [{ type: 'actionCancelled', targetId: actorId, action, reason: 'offGuard' }],
                messages: ['Guard was OFF GUARD before they could act.'] };
        }
        if (actor.stunned) {
            actor.stunned = false;
            return {ok:true, actorId, action:'stunned', skipped:true, events:[{type:'turnSkipped',targetId:actorId}], messages:[actor.name + ' was stunned before they could act.']};
        }
        actor.sp -= ACTIONS[action].cost;
        if (ACTIONS[action].message) messages.push(ACTIONS[action].message);
        switch (action) {
            case 'attack':
            case 'swingBackpack': this.attack(actorId, action, events, messages); break;
            case 'defend':
                actor.defending = true;
                this.restore(actorId, 0, 10, events);
                events.push({ type: 'defending', targetId: actorId });
                messages.push(`${actor.name} defended${this.round.index === 1 ? ' first' : ''}.`);
                break;
            case 'broLockIn': this.applyStatus('player', 'FOCUSED', events); break;
            case 'talkSmack':
                this.directDamage('player', 'guard', 30, 'talkSmack', events);
                this.applyStatus('guard', 'RILED', events);
                messages.push(PLAYER_INSULTS[Math.floor(this.dialogueRandom() * PLAYER_INSULTS.length)]);
                break;
            case 'lookThere': {
                // Resolve against current round order; never undo an earlier action.
                if (this.random() < LOOK_THERE_FULL_SUCCESS_CHANCE) {
                    const interrupted = this.round.orderedActions.slice(this.round.index).some(item => item.actorId === 'guard');
                    this.guard.offGuard = true;
                    events.push({ type: 'offGuardApplied', targetId: 'guard', interrupted });
                    messages.push(interrupted ? 'Guard fell for it. OFF GUARD: pending action interrupted.' : 'Guard fell for it, but had already acted.');
                } else this.applyStatus('guard', 'DISTRACTED', events);
                break;
            }
            case 'crackKnuckles': this.applyStatus('guard', 'RILED', events); break;
            case 'blowWhistle':
                this.applyStatus('player', 'DISTRACTED', events);
                if (this.random() < 0.1) {
                    this.player.stunned = true;
                    events.push({ type: 'stunApplied', targetId: 'player' });
                    messages.push('Player is STUNNED!');
                }
                break;
            case 'catchBreath': this.restore(actorId, CATCH_BREATH_HEAL, 0, events); break;
            case 'eatDonut':
                actor.donutAvailable = false;
                this.restore(actorId, DONUT_HEAL, 0, events);
                break;
            case 'callWife': {
                actor.wifeCallAvailable = false;
                const name = actor.status?.name;
                this.applyStatus(actorId, 'FOCUSED', events);
                messages.push(GAME_DIALOGUE.battle.wife[name] ?? GAME_DIALOGUE.battle.wife.default);
                this.restore(actorId, 0, 20, events);
                break;
            }
        }
        for (const event of events.filter(event => event.type === 'statusApplied')) messages.push(this[event.targetId].name + ' is ' + event.status + '.');
        return {ok:true, actorId, action, skipped:false, events, messages, message:messages.join('\n')};
    }

    // A detached observation excludes all current commitments.
    beginRound() {
        if (this.turnState !== ROUND_STATES.WAITING_FOR_PLAYER) return null;
        this.round ??= {preRoundState:this.snapshot(), statuses:{player:this.player.status, guard:this.guard.status}};
        return JSON.parse(JSON.stringify(this.round.preRoundState));
    }
    lockActions(playerAction, guardAction) {
        if (this.turnState !== ROUND_STATES.WAITING_FOR_PLAYER) return false;
        if (!this.round) this.beginRound();
        const pre = this.round.preRoundState;
        for (const [id,action] of [['player',playerAction],['guard',guardAction]]) {
            if ((pre[id].stunned || (id === 'guard' && pre.guard.offGuard)) ? action !== null : !validActions(pre,id).includes(action)) return false;
        }
        this.turnState = ROUND_STATES.PLAYER_ACTION_SELECTED;
        const ordered = [Object.freeze({actorId:'player',action:playerAction}),Object.freeze({actorId:'guard',action:guardAction})];
        const rank = item => PRIORITY_ORDER.indexOf(ACTIONS[item.action]?.priority ?? PRIORITY.FAST);
        const difference = rank(ordered[0])-rank(ordered[1]);
        if (difference > 0 || (difference === 0 && this.tieRandom() >= 0.5)) ordered.reverse();
        Object.assign(this.round,{playerAction,guardAction,orderedActions:Object.freeze(ordered),index:0,results:[]});
        this.turnState = ROUND_STATES.ACTIONS_LOCKED;
        return true;
    }
    revealActions() {
        if (this.turnState !== ROUND_STATES.ACTIONS_LOCKED) return null;
        this.turnState = ROUND_STATES.REVEALING;
        return this.round.orderedActions.map(item => ({...item}));
    }
    resolveNextAction() {
        if (![ROUND_STATES.REVEALING,ROUND_STATES.RESOLVING_FIRST].includes(this.turnState)) return null;
        const index = this.round.index++;
        this.turnState = index === 0 ? ROUND_STATES.RESOLVING_FIRST : ROUND_STATES.RESOLVING_SECOND;
        const {actorId,action} = this.round.orderedActions[index];
        const result = this.#executeAction(actorId,action);
        this.log.push(...result.messages); this.round.results.push(result);
        return result;
    }
    endRound() {
        if (this.turnState !== ROUND_STATES.RESOLVING_SECOND) return null;
        this.turnState = ROUND_STATES.ROUND_END;
        const events = [];
        for (const id of ['player','guard']) {
            this.tickStatus(id,this.round.statuses[id],events);
            this[id].defending = false;
            // OFF_GUARD carries through this boundary until the next round's
            // reserved Guard skip opportunity consumes it.
        }
        this.previousPlayerAction = this.round.playerAction;
        this.previousPlayerActionCategory = ACTIONS[this.previousPlayerAction]?.category ?? 'skipped';
        const outcome = this.player.hp <= 0 && this.guard.hp <= 0 ? ROUND_STATES.DRAW : this.guard.hp <= 0 ? ROUND_STATES.VICTORY : this.player.hp <= 0 ? ROUND_STATES.DEFEAT : null;
        this.turnState = outcome ?? ROUND_STATES.WAITING_FOR_PLAYER;
        const result = {orderedActions:this.round.orderedActions,results:this.round.results,events:[...this.round.results.flatMap(result=>result.events),...events],nextState:this.snapshot(),outcome};
        this.round = null;
        return result;
    }
}

// Headless entry point. Input is copied; RNG streams may be injected separately.
export function resolveRound(preRoundState,playerAction,guardAction,rng = Math.random) {
    const combat = new CombatSystem(typeof rng === 'function' ? {random:rng} : rng);
    for (const id of ['player','guard']) Object.assign(combat[id],JSON.parse(JSON.stringify(preRoundState[id])));
    combat.previousPlayerAction = preRoundState.previousPlayerAction ?? null;
    combat.previousPlayerActionCategory = preRoundState.previousPlayerActionCategory ?? null;
    combat.beginRound();
    if (!combat.lockActions(playerAction,guardAction)) throw new Error('Unavailable committed action');
    combat.revealActions(); combat.resolveNextAction(); combat.resolveNextAction();
    return combat.endRound();
}
