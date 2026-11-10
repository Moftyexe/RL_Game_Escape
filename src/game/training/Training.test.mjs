import test from 'node:test';
import assert from 'node:assert/strict';
import CombatSystem, { resolveRound, validActions } from '../combat/CombatSystem.js';
import TrainingEnvironment from './TrainingEnvironment.js';
import { createPlayerBot, BOT_TYPES } from './PlayerBots.js';
import { seededRandom } from './SeededRandom.js';
import { trainingConfig, epsilonForEpisode } from './TrainingConfig.js';
import { trainGuard, evaluateGuard } from './GuardExperiments.js';
import { guardObservation } from '../ai/StateEncoder.js';
import QTable from '../ai/QTable.js';
const fixed = action => ({type:'fixed',chooseAction:()=>action});
function constantCombat(env, value=.5) { env.combat.random=()=>value;env.combat.tieRandom=()=>0;env.combat.dialogueRandom=()=>0;return env; }

test('environment round exactly matches authoritative headless resolveRound',()=>{
 const e=constantCombat(new TrainingEnvironment({bot:fixed('swingBackpack'),keepTrace:true}));const before=e.combat.snapshot();const expected=resolveRound(before,'swingBackpack','defend',{random:()=>.5,tieRandom:()=>0,dialogueRandom:()=>0});
 const result=e.step('defend');assert.deepEqual(result.transitions[0].events,expected.events);assert.deepEqual(e.combat.snapshot(),expected.nextState);assert.equal(e.combat.guard.hp,1130);assert.equal(e.combat.guard.defending,false);
});
test('both policy observations exclude the other current choice before locking',()=>{
 let guardObservationSeen,playerObservationSeen;const e=new TrainingEnvironment({bot:{chooseAction(observation){playerObservationSeen=observation;assert.equal(e.combat.round.guardAction,undefined);return 'lookThere';}}});
 const guard={chooseAction(observation){guardObservationSeen=observation;assert.equal(e.combat.round,null);return 'attack';}};
 const action=guard.chooseAction(e.observation());constantCombat(e,.5);e.step(action);
 assert.deepEqual(guardObservationSeen,playerObservationSeen);for(const key of ['playerAction','guardAction','round'])assert.equal(key in guardObservationSeen,false);
});
test('priority and immediate statuses remain active in training',()=>{
 const e=constantCombat(new TrainingEnvironment({bot:fixed('lookThere'),keepTrace:true}),.7);const t=e.step('attack');assert.equal(t.transitions[0].orderedActions[0].action,'lookThere');assert.equal(e.combat.player.hp,1000);assert.ok(t.transitions[0].events.some(event=>event.type==='miss'&&event.actorId==='guard'));
});
test('OFF_GUARD interrupt and forced next round accumulate discounted return without a fake decision',()=>{
 let playerCalls=0;const e=constantCombat(new TrainingEnvironment({bot:{chooseAction:()=>++playerCalls===1?'lookThere':'attack'},gamma:.95,keepTrace:true}),0);
 const transition=e.step('attack');assert.equal(transition.rounds,2);assert.equal(transition.transitions[1].guardAction,null);assert.equal(transition.transitions[1].forced,true);
 assert.ok(transition.transitions[0].events.some(event=>event.type==='actionCancelled'&&event.reason==='offGuard'));
 assert.ok(transition.transitions[1].events.some(event=>event.type==='offGuardSkipped'));assert.equal(e.combat.guard.offGuard,false);
 assert.equal(e.decisions,1);assert.equal(e.forcedRounds,1);assert.deepEqual(e.actionCounts,{attack:1});
 assert.equal(transition.reward,transition.transitions[0].reward+.95*transition.transitions[1].reward);assert.ok(e.decisionActions().includes('attack'));
});
test('initial forced OFF_GUARD rounds advance without querying any Guard policy',()=>{
 const e=new TrainingEnvironment({bot:fixed('catchBreath')});e.combat.guard.offGuard=true;assert.deepEqual(e.decisionActions(),[]);assert.throws(()=>e.step('attack'));const forced=e.advanceForcedRounds();assert.equal(forced.length,1);assert.equal(forced[0].guardAction,null);assert.equal(e.decisions,0);assert.equal(e.combat.guard.offGuard,false);
});
test('stunned Player is not asked for an action; actual null skip consumes stun',()=>{
 const e=constantCombat(new TrainingEnvironment({bot:{chooseAction(){throw Error('stunned bot must be bypassed');}}}));e.combat.player.stunned=true;
 const transition=e.step('attack');assert.equal(transition.transitions[0].playerAction,null);assert.ok(transition.transitions[0].events.some(event=>event.type==='turnSkipped'));assert.equal(e.combat.player.stunned,false);assert.equal(e.combat.player.hp,920);
});
test('finite resources, HP/SP, effects and previous action reset per episode',()=>{
 const e=new TrainingEnvironment({bot:fixed('catchBreath')});e.combat.guard.hp=990;e.step('eatDonut');e.step('callWife');assert.equal(e.combat.guard.wifeCallAvailable,false);assert.equal(e.combat.guard.donutAvailable,false);
 e.reset();assert.equal(e.combat.guard.hp,1200);assert.equal(e.combat.guard.sp,100);assert.equal(e.combat.guard.status,null);assert.equal(e.combat.guard.offGuard,false);assert.equal(e.combat.guard.wifeCallAvailable,true);assert.equal(e.combat.guard.donutAvailable,true);assert.equal(e.combat.previousPlayerAction,null);
});
for(const [target,playerAction,guardAction,outcome]of [['player','attack','attack','win'],['guard','attack','defend','loss']])test(`training episode ends on Guard ${outcome}`,()=>{
 const e=constantCombat(new TrainingEnvironment({bot:fixed(playerAction)}));e.combat[target].hp=1;e.step(guardAction);assert.equal(e.terminal,true);assert.equal(e.summary().outcome,outcome);assert.throws(()=>e.step(guardAction));
});
test('100-round loop ends in training-only DRAW with draw penalty; human resolver has no added limit',()=>{
 const e=new TrainingEnvironment({bot:fixed('defend')});for(let i=0;i<100;i++)e.step('defend');assert.equal(e.terminal,true);assert.equal(e.outcome,'DRAW');assert.equal(e.roundLimitReached,true);assert.equal(e.rounds,100);assert.ok(Math.abs(e.totalReward+30)<1e-10);assert.equal(e.combat.turnState,'WAITING_FOR_PLAYER');
});
for(const botType of BOT_TYPES)test(`${botType} bot samples only existing valid Player actions and respects stun`,()=>{
 const rng=seededRandom(100),bot=createPlayerBot(botType,rng),s=new CombatSystem().snapshot();
 for(const sp of [0,14,15,19,20,100]){s.player.sp=sp;for(let i=0;i<30;i++)assert.ok(validActions(s,'player').includes(bot.chooseAction(s)));}
 s.player.stunned=true;assert.equal(bot.chooseAction(s),null);
});
test('fixed seeds reproduce an entire episode, with independent combat and bot streams',()=>{
 const play=()=>{const e=new TrainingEnvironment({seed:12345,bot:'tricky',maxRounds:20,keepTrace:true});const rng=seededRandom(42);while(!e.terminal){const actions=e.decisionActions();e.step(actions[Math.floor(rng()*actions.length)]);}return {summary:e.summary(),trace:e.trace};};assert.deepEqual(play(),play());
});
test('epsilon reaches floor at45000 independent of training horizon',()=>{for(const episodes of [60000,80000,100000]){const c=trainingConfig({episodes});assert.equal(epsilonForEpisode(0,c),1);assert.ok(Math.abs(epsilonForEpisode(22500,c)-.525)<1e-12);assert.equal(epsilonForEpisode(45000,c),.05);assert.equal(epsilonForEpisode(99999,c),.05);}assert.throws(()=>trainingConfig({alpha:0}));assert.throws(()=>trainingConfig({botDistribution:{random:0,aggressive:0,tricky:0}}));});
test('tiny training is deterministic, sparse, mixes bots, and evaluation does not learn',()=>{
 const config={episodes:40,seed:7,maxRounds:15};const a=trainGuard(config),b=trainGuard(config);assert.deepEqual(a.table.toJSON(a.metadata),b.table.toJSON(b.metadata));assert.deepEqual(a.metrics,b.metrics);assert.ok(a.table.stateCount>0&&a.table.stateCount<172800);for(const bot of BOT_TYPES)assert.ok(a.metrics.perBot[bot].episodes>0);
 const before=JSON.stringify(a.table.toJSON());const evaluation=evaluateGuard(a.table,{episodesPerBot:2,maxRounds:10,seed:99});assert.equal(evaluation.results.length,9);assert.ok(evaluation.results.every(result=>result.episodes===2));assert.equal(JSON.stringify(a.table.toJSON()),before);assert.equal(evaluation.learning,false);
});
test('custom bot distribution can select only a specified training opponent',()=>{const result=trainGuard({episodes:3,maxRounds:3,botDistribution:{random:0,aggressive:1,tricky:0}});assert.ok(result.metrics.episodes.every(record=>record.bot==='aggressive'));});
