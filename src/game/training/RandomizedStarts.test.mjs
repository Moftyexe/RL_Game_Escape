import test from 'node:test';
import assert from 'node:assert/strict';
import CombatSystem, { validActions } from '../combat/CombatSystem.js';
import { applyRandomizedStart, assertCoherentStart } from './RandomizedStarts.js';
import { seededRandom } from './SeededRandom.js';
import { hpBucket, spBucket } from '../ai/StateEncoder.js';
import { trainGuard,evaluateGuard } from './GuardExperiments.js';
import TrainingEnvironment from './TrainingEnvironment.js';
import { trainingConfig } from './TrainingConfig.js';
import QTable from '../ai/QTable.js';

test('seeded synthetic starts are reproducible, legal and cover all HP/SP/status/resource bands',()=>{
 const gp=new Set(),pp=new Set(),gs=new Set(),ps=new Set(),mental=new Set(),previous=new Set(),resources=new Set();
 const rng=seededRandom(17);
 for(let i=0;i<2000;i++){
  const c=new CombatSystem();applyRandomizedStart(c,rng);const s=c.snapshot();assert.equal(assertCoherentStart(s),true);
  assert.ok(validActions(s,'guard').length>=2);assert.ok(s.player.stunned || validActions(s,'player').length>=2);assert.equal(c.round,null);
  assert.equal(JSON.stringify(s).includes('currentAction'),false);gp.add(hpBucket(s.guard));pp.add(hpBucket(s.player));gs.add(spBucket(s.guard.sp));ps.add(spBucket(s.player.sp));mental.add(s.guard.status?.name??'NONE');previous.add(s.previousPlayerAction);resources.add(String(s.guard.wifeCallAvailable)+s.guard.donutAvailable);
 }
 assert.equal(gp.size,5);assert.equal(pp.size,5);assert.equal(gs.size,3);assert.equal(ps.size,3);assert.equal(mental.size,4);assert.equal(previous.size,7);assert.equal(resources.size,4);
 const a=new TrainingEnvironment({seed:42,randomizedStart:true}),b=new TrainingEnvironment({seed:42,randomizedStart:true});assert.deepEqual(a.initialState,b.initialState);assert.notEqual(a.combat.guard.hp,1200);
});
test('coherence validator rejects unreachable Player RILED, available Wife with Guard FOCUSED, dead actors and invalid durations',()=>{
 for(const mutate of [s=>s.player.status={name:'RILED',turns:3},s=>s.guard.status={name:'FOCUSED',turns:3},s=>s.player.hp=0,s=>s.guard.status={name:'RILED',turns:4}]){const s=new CombatSystem().snapshot();mutate(s);assert.throws(()=>assertCoherentStart(s));}
});
test('configured normal/randomized split is controllable and recorded separately',()=>{
 for(const fraction of [0,1]){const r=trainGuard({episodes:8,maxRounds:2,randomizedStartFraction:fraction});assert.ok(r.metrics.episodes.every(e=>e.startType===(fraction?'randomized':'normal')));assert.equal(r.metrics.perStart[fraction?'randomized':'normal'].episodes,8);}
 const r=trainGuard({episodes:200,maxRounds:1,seed:13});assert.ok(r.metrics.perStart.randomized.episodes>=30&&r.metrics.perStart.randomized.episodes<=70);
 assert.equal(trainingConfig().randomizedStartFraction,.25);assert.deepEqual(trainingConfig().botDistribution,{random:1,aggressive:2,tricky:1});assert.throws(()=>trainingConfig({randomizedStartFraction:1.1}));
});
test('evaluation ignores training randomized fraction and always starts full normal battles',()=>{
 const r=evaluateGuard(new QTable(),{episodesPerBot:2,maxRounds:1,seed:7,randomizedStartFraction:1});assert.equal(r.startMode,'normal-only');
 const e=new TrainingEnvironment({seed:7});assert.equal(e.startType,'normal');assert.equal(e.initialState.player.hp,1000);assert.equal(e.initialState.guard.hp,1200);
 for(const row of r.results){assert.equal(row.episodes,2);assert.deepEqual(row.startCounts,{normal:2,randomized:0});}
});
test('randomized start itself grants zero reward; only subsequent real events are rewarded and current choices remain hidden',()=>{
 const bot={chooseAction:s=>{assert.equal(s.guardAction,undefined);assert.equal(s.playerAction,undefined);assert.equal(s.round,undefined);return validActions(s,'player')[0];}};
 const e=new TrainingEnvironment({seed:71,randomizedStart:true,bot});assert.equal(e.totalReward,0);assert.equal(e.rounds,0);const initial=e.observation();assert.equal(initial.playerAction,undefined);
 const t=e.step('defend');assert.equal(e.decisions,1);assert.equal(t.transitions[0].guardAction,'defend');assert.ok(t.transitions[0].events.some(event=>event.type==='defending'));
});
