import test from 'node:test';import assert from 'node:assert/strict';
import CombatSystem from '../combat/CombatSystem.js';import StateEncoder from './StateEncoder.js';import QTable from './QTable.js';
import QLearningGuardPolicy from './QLearningGuardPolicy.js';import ReadinessGuardPolicy from './ReadinessGuardPolicy.js';
import GuardAIController from './GuardAIController.js';import {formatGuardDebug} from '../battle/guardAIDebug.js';
import {seededRandom} from '../training/SeededRandom.js';
const setup=()=>{const s=new CombatSystem().snapshot();s.guard.hp=800;s.guard.wifeCallAvailable=false;const q=new QTable(),key=new StateEncoder().encode(s);for(const[a,v]of [['attack',3],['defend',2],['crackKnuckles',1],['blowWhistle',-1],['callWife',999]]){q.set(key,a,v);q.incrementVisit(key,a);}q.set(key,'eatDonut',9999);return{s,q,key};};
test('tier1 rank distribution and boundaries; only valid visited top3; tier5 greedy',()=>{
 const{s,q}=setup(),before=JSON.stringify(q.toJSON());
 for(const[roll,action]of [[0,'attack'],[.59,'attack'],[.60,'defend'],[.84,'defend'],[.85,'crackKnuckles'],[.999,'crackKnuckles']]){const p=new ReadinessGuardPolicy(new QLearningGuardPolicy({table:q}),1,()=>roll);assert.equal(p.chooseAction(s),action);assert.deepEqual(p.lastSelection.ranked.map(r=>r.probability),[.6,.25,.15]);}
 const p=new ReadinessGuardPolicy(new QLearningGuardPolicy({table:q}),5,()=>.99);assert.equal(p.chooseAction(s),'attack');assert.equal(JSON.stringify(q.toJSON()),before);
});
test('all five tier distributions match deterministic stratified rolls',()=>{
 const{s,q}=setup();const expected=[[60,25,15],[70,20,10],[80,15,5],[90,8,2],[100,0,0]];
 for(let tier=1;tier<=5;tier++){const counts={attack:0,defend:0,crackKnuckles:0};for(let i=0;i<100;i++){const p=new ReadinessGuardPolicy(new QLearningGuardPolicy({table:q}),tier,()=>(i+.5)/100);counts[p.chooseAction(s)]++;}assert.deepEqual(Object.values(counts),expected[tier-1]);}
});
test('two ranks normalize weights, single rank is forced, no visited options use unchanged fallback',()=>{
 const{s,q,key}=setup();s.guard.sp=0; // Different encoded state.
 const k=new StateEncoder().encode(s),t=new QTable();t.set(k,'attack',-2);t.incrementVisit(k,'attack');t.set(k,'defend',-3);t.incrementVisit(k,'defend');
 const p=new ReadinessGuardPolicy(new QLearningGuardPolicy({table:t}),1,()=>.71);assert.equal(p.chooseAction(s),'defend');assert.ok(Math.abs(p.lastSelection.ranked[0].probability-.6/.85)<1e-12);
 const one=new QTable();one.incrementVisit(k,'defend');assert.equal(new ReadinessGuardPolicy(new QLearningGuardPolicy({table:one}),1,()=>{throw Error('one option needs no roll');}).chooseAction(s),'defend');
 const empty=new QTable(),before=JSON.stringify(empty.toJSON()),fallback=new ReadinessGuardPolicy(new QLearningGuardPolicy({table:empty,random:()=>0}),5,()=>.99);assert.equal(fallback.chooseAction(s),'attack');assert.equal(fallback.lastSelection.fallback,true);assert.equal(JSON.stringify(empty.toJSON()),before);s.guard.offGuard=true;assert.equal(fallback.chooseAction(s),null);
});
test('all readiness tiers reproduce seeds; debug shows day and technical distribution without hidden Player action',()=>{
 const{s,q}=setup();for(let tier=1;tier<=5;tier++){const run=()=>{const p=new ReadinessGuardPolicy(new QLearningGuardPolicy({table:q}),tier,seededRandom(1));return Array.from({length:50},()=>p.chooseAction(s));};assert.deepEqual(run(),run());}
 const c=new GuardAIController({runContext:{dayNumber:3,successfulEscapes:2,readinessTier:3,readinessName:'PREPARED'},random:()=>0});c.load(q.toJSON());c.chooseAction({...s,playerAction:'SECRET'});const text=formatGuardDebug(c.debugView(s,true),true);assert.match(text,/Day 3/);assert.match(text,/Escapes 2/);assert.match(text,/#1 80%/);assert.equal(text.includes('SECRET'),false);assert.equal(c.qPolicy.mode,'EVAL');assert.equal(c.qPolicy.epsilon,0);
});
