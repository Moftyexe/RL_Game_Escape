import test from 'node:test';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import CombatSystem, { GUARD_ACTIONS, validActions } from '../combat/CombatSystem.js';
import StateEncoder, { hpBucket, spBucket, previousCategory, guardObservation, THEORETICAL_STATE_COUNT } from './StateEncoder.js';
import QTable from './QTable.js';
import QLearningGuardPolicy, { POLICY_MODE } from './QLearningGuardPolicy.js';
import GuardAIController from './GuardAIController.js';
import RandomGuardPolicy from '../combat/RandomGuardPolicy.js';
import guardReward from './RewardFunction.js';
import { formatGuardDebug } from '../battle/guardAIDebug.js';
import { STATE_SCHEMA_VERSION } from './schema.js';
const state = () => new CombatSystem().snapshot();
const encoder = new StateEncoder();
test('v7 rejects old combat schema instead of silently loading stale learned values',()=>{
 assert.equal(STATE_SCHEMA_VERSION,'guard-q-v7');const c=new GuardAIController();const data=new QTable().toJSON();data.stateSchema='guard-q-v6';assert.equal(c.load(data),false);assert.equal(c.mode,'RANDOM');
});
for (const actor of ['player','guard']) for (const max of [1000,1200]) for (const [percent,bucket] of [[0,'CRITICAL'],[10,'CRITICAL'],[10.01,'LOW'],[25,'LOW'],[25.01,'MID'],[50,'MID'],[50.01,'HIGH'],[75,'HIGH'],[75.01,'VERY_HIGH'],[100,'VERY_HIGH']])
 test(actor+' HP '+percent+'% of '+max+' encodes '+bucket,()=>{const s=state();s[actor].maxHp=max;s[actor].hp=max*percent/100;assert.equal(hpBucket(s[actor]),bucket);assert.ok(encoder.encode(s).includes((actor==='guard'?'GHP_':'PHP_')+bucket));});
for(const [value,bucket]of [[0,'LOW'],[14,'LOW'],[15,'MEDIUM'],[19,'MEDIUM'],[20,'HIGH'],[100,'HIGH']])test(`SP ${value} encodes ${bucket}`,()=>assert.equal(spBucket(value),bucket));
for(const [action,category]of [[null,'NONE'],['stunned','NONE'],['attack','ATTACK'],['swingBackpack','ATTACK'],['defend','DEFEND'],['broLockIn','SELF_BUFF'],['talkSmack','DISRUPTION'],['lookThere','DISRUPTION'],['catchBreath','RECOVERY']])
    test(`previous ${action} maps to ${category}`,()=>assert.equal(previousCategory(action),category));
test('state key deterministically encodes statuses, finite resources and stun with 259,200 theoretical states',()=>{
 const s=state();s.guard.status={name:'RILED',turns:1};s.player.status={name:'FOCUSED',turns:3};s.guard.donutAvailable=false;s.player.stunned=true;s.previousPlayerAction='lookThere';
 assert.equal(encoder.encode(s),'GHP_VERY_HIGH|PHP_VERY_HIGH|GSP_HIGH|PSP_HIGH|G_RILED|P_FOCUSED|W1|DONUT_UNAVAILABLE|PSTUN1|PREV_DISRUPTION');assert.equal(THEORETICAL_STATE_COUNT,259200);
 for(const name of ['FOCUSED','DISTRACTED','RILED']){s.guard.status={name,turns:2};assert.ok(encoder.encode(s).includes('G_'+name));}
 s.guard.wifeCallAvailable=false;assert.ok(encoder.encode(s).includes('|W0|'));
});
test('current hidden action, skill, exact resources within bucket, RNG and animation do not affect key or observation',()=>{
 const a=state(),b=state();b.playerAction='swingBackpack';b.guardAction='attack';b.player.currentAction='lookThere';b.player.currentSkill='talkSmack';b.animation='secret';b.rng=123;b.player.hp=999;b.guard.hp=1199;b.guard.sp=99;
 assert.equal(encoder.encode(a),encoder.encode(b));const visible=guardObservation(b);assert.equal(visible.playerAction,undefined);assert.equal(visible.player.currentAction,undefined);assert.equal(visible.player.currentSkill,undefined);assert.equal(visible.animation,undefined);
 visible.player.hp=1;assert.equal(b.player.hp,999);
});
test('Q table is sparse; unseen get/max/best do not allocate entries',()=>{const q=new QTable();assert.equal(q.get('s','attack'),0);assert.equal(q.maxQ('s',['attack','defend']),0);q.bestAction('s',['attack','defend'],()=>0);assert.equal(q.stateCount,0);assert.equal(q.pairCount,0);q.set('s','attack',4);assert.equal(q.get('s','attack'),4);assert.equal(q.stateCount,1);assert.equal(q.pairCount,1);});
test('invalid/unavailable actions never affect maxQ or bestAction, including negative valid Q',()=>{const q=new QTable();q.set('s','callWife',9999);q.set('s','attack',-4);q.set('s','defend',-2);assert.equal(q.maxQ('s',['attack','defend']),-2);assert.equal(q.bestAction('s',['attack','defend']), 'defend');assert.equal(q.maxQ('s',[]),0);assert.equal(q.bestAction('s',[]),null);});
test('ties randomly cover all tied valid actions with injected RNG',()=>{const q=new QTable();assert.equal(q.bestAction('s',['attack','defend'],()=>.01),'attack');assert.equal(q.bestAction('s',['attack','defend'],()=>.99),'defend');});
test('Q table JSON round-trip and schema/action/combat/value validation',()=>{
 const q=new QTable();q.set('s','attack',1.5);const data=q.toJSON({seed:1});assert.deepEqual(QTable.fromJSON(JSON.parse(JSON.stringify(data))).toJSON().qValues,data.qValues);
 for(const change of [{stateSchema:'old'},{version:99},{combatSignature:'old rules'},{actions:['offGuard']},{qValues:{s:{offGuard:1}}},{qValues:{s:{attack:'5'}}},{qValues:[]}])assert.throws(()=>QTable.fromJSON({...data,...change}));
 assert.throws(()=>q.set('s','attack',Infinity));assert.throws(()=>q.set('s','oldBuff',0));
});
test('one-step Q update equals standard numeric formula, with valid-action bootstrap only',()=>{
 const s=state(),next=state();next.guard.sp=10;next.guard.wifeCallAvailable=false;next.guard.donutAvailable=false;next.previousPlayerAction='defend';
 const q=new QTable();q.set(encoder.encode(s),'attack',2);q.set(encoder.encode(next),'defend',5);q.set(encoder.encode(next),'callWife',9999);q.set(encoder.encode(next),'blowWhistle',9999);
 const p=new QLearningGuardPolicy({table:q,mode:'TRAIN',alpha:.1,gamma:.95});assert.equal(p.learn(s,'attack',3,next),2+.1*(3+.95*5-2));
});
test('terminal update has zero future Q; EVAL explicitly refuses all learning',()=>{
 const s=state(),q=new QTable();q.set(encoder.encode(s),'attack',2);const p=new QLearningGuardPolicy({table:q,mode:'TRAIN'});assert.equal(p.learn(s,'attack',100,null,{terminal:true}),11.8);
 const evalPolicy=new QLearningGuardPolicy({table:q,mode:'EVAL',epsilon:1});const before=JSON.stringify(q.toJSON());assert.equal(evalPolicy.epsilon,0);evalPolicy.chooseAction(s);assert.equal(JSON.stringify(q.toJSON()),before);assert.throws(()=>evalPolicy.learn(s,'attack',100,s));assert.throws(()=>evalPolicy.setEpsilon(.1));
});
test('forced-round update uses discounted return and gamma^duration bootstrap',()=>{const s=state(),next=state();next.previousPlayerAction='attack';const q=new QTable();q.set(encoder.encode(next),'attack',10);const p=new QLearningGuardPolicy({table:q,mode:'TRAIN',alpha:.5,gamma:.9});assert.equal(p.learn(s,'attack',1+.9*2,next,{rounds:2}),.5*(1+.9*2+.9**2*10));});
test('epsilon 1 explores; epsilon 0 greedily exploits; invalid actions excluded in both',()=>{
 const s=state();s.guard.sp=0;s.guard.wifeCallAvailable=false;s.guard.donutAvailable=false;const q=new QTable();q.set(encoder.encode(s),'attack',100);q.set(encoder.encode(s),'callWife',9999);q.incrementVisit(encoder.encode(s),'attack');q.incrementVisit(encoder.encode(s),'defend');
 const rolls=[0,.99];const p=new QLearningGuardPolicy({table:q,mode:'TRAIN',epsilon:1,random:()=>rolls.shift()});assert.equal(p.chooseAction(s),'defend');p.setEpsilon(0);assert.equal(p.chooseAction(s),'attack');
 s.guard.offGuard=true;assert.equal(p.chooseAction(s),null);s.guard.offGuard=false;s.guard.hp=0;assert.equal(p.chooseAction(s),null);
});
for(const [event,expected]of [[{type:'damage',targetId:'player',damage:80},3.8],[{type:'damage',targetId:'guard',damage:80},-4.2],[{type:'restored',targetId:'guard',hp:180,sp:20},-.2],[{type:'statusApplied',targetId:'guard',status:'FOCUSED'},-.2]])
 test(`reward derives only damage/outcome and round cost: ${event.type}/${event.targetId}`,()=>assert.equal(guardReward({events:[event]}),expected));
for(const [outcome,expected]of [['DEFEAT',99.8],['VICTORY',-100.2],['DRAW',-10.2]])test(`terminal ${outcome} reward`,()=>assert.equal(guardReward({outcome}),expected));
test('same-round heal cannot erase damage penalty and overkill shaping is clamped per event',()=>{
 assert.equal(guardReward({events:[{type:'restored',targetId:'guard',hp:180},{type:'damage',targetId:'guard',damage:80,hpBefore:980,hpAfter:900}]}),-4.2);
 assert.ok(Math.abs(guardReward({events:[{type:'damage',targetId:'player',damage:80,hpBefore:1,hpAfter:0}]})+.15)<1e-12);
});
test('safe table loading accepts valid text and rejects missing/malformed/incompatible data',()=>{
 const c=new GuardAIController({random:()=>0});assert.ok(c.policy instanceof RandomGuardPolicy);
 for(const data of [undefined,null,'{broken',{},new QTable().toJSON({})&&{format:'old'}]){assert.equal(c.load(data),false);assert.equal(c.mode,'RANDOM');assert.ok(c.policy instanceof RandomGuardPolicy);}
 assert.equal(c.load(JSON.stringify(new QTable().toJSON())),true);assert.ok(c.policy instanceof QLearningGuardPolicy);assert.equal(c.policy.mode,POLICY_MODE.EVAL);assert.equal(c.toggle(),'RANDOM');assert.equal(c.toggle(),'Q-LEARNING');
});
test('debug hides current choices before reveal and whitelists Guard-visible inputs',()=>{
 const c=new GuardAIController({random:()=>0});c.load(new QTable().toJSON());const s=state();s.playerAction='secret-attack';s.player.currentSkill='secret-skill';c.chooseAction(s);
 const hidden=c.debugView(s,false);assert.equal(hidden.chosen,null);assert.equal(JSON.stringify(hidden).includes('secret'),false);assert.match(formatGuardDebug(hidden),/Hidden until reveal/);
 const revealed=c.debugView(s,true);assert.equal(revealed.chosen,'attack');assert.match(formatGuardDebug(revealed,true),/Chosen: attack/);assert.equal(revealed.learning,false);
});
test('controller does not call either policy in forced OFF_GUARD states',()=>{const c=new GuardAIController();c.randomPolicy.chooseAction=()=>{throw Error('forced skip must bypass policy');};const s=state();s.guard.offGuard=true;assert.equal(c.chooseAction(s),null);assert.equal(c.debugView(s,true).forced,true);});


test('live policy masks a ready Donut at full HP/SP and all unaffordable/used skills',()=>{
 const s=state(),q=new QTable();q.set(encoder.encode(s),'eatDonut',10000);q.set(encoder.encode(s),'attack',10);q.incrementVisit(encoder.encode(s),'attack');
 const p=new QLearningGuardPolicy({table:q});assert.equal(p.chooseAction(s),'attack');
 s.guard.sp=14;s.guard.wifeCallAvailable=false;s.guard.donutAvailable=false;const key=encoder.encode(s);
 for(const action of ['crackKnuckles','blowWhistle','callWife','eatDonut'])q.set(key,action,10000);
 q.set(key,'defend',2);q.incrementVisit(key,'defend');assert.equal(p.chooseAction(s),'defend');
});
test('the shipped trained file loads as compatible EVAL and choosing does not alter rows',async()=>{
 const text=await readFile(new URL('../../../public/assets/ai/guard_qtable.json',import.meta.url),'utf8');const c=new GuardAIController({random:()=>.5});assert.equal(c.load(text),true);assert.equal(c.mode,'Q-LEARNING');assert.equal(c.qPolicy.epsilon,0);const before=JSON.stringify(c.qPolicy.table.toJSON());c.chooseAction(state());assert.equal(JSON.stringify(c.qPolicy.table.toJSON()),before);assert.ok(c.qPolicy.table.stateCount>0);
});

test('production v7 checkpoint preserves visits, legal coverage and fixed epsilon horizon',async()=>{
 let previousVisits=0;
 for(const path of ['public/assets/ai/guard_qtable.json']){
  const saved=JSON.parse(await readFile(new URL('../../../'+path,import.meta.url),'utf8'));
  const q=QTable.fromJSON(saved);assert.equal(saved.stateSchema,'guard-q-v7');assert.equal(saved.metadata.config.alpha,.1);assert.equal(saved.metadata.config.gamma,.95);assert.equal(saved.metadata.config.epsilonDecayEpisodes,45000);
  assert.deepEqual(q.coverage(),saved.metadata.coverage);assert.ok(q.coverage().totalVisits>previousVisits);previousVisits=q.coverage().totalVisits;
  const c=new GuardAIController({random:()=>0});assert.equal(c.load(saved),true);assert.equal(c.qPolicy.mode,'EVAL');assert.equal(c.qPolicy.epsilon,0);
 }
});
