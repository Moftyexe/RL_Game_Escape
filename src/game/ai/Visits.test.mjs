import test from'node:test';import assert from'node:assert/strict';
import CombatSystem,{validActions}from'../combat/CombatSystem.js';
import QTable from'./QTable.js';import QLearningGuardPolicy from'./QLearningGuardPolicy.js';
import StateEncoder,{donutState}from'./StateEncoder.js';import{seededRandom}from'../training/SeededRandom.js';
import TrainingEnvironment from'../training/TrainingEnvironment.js';import{formatGuardDebug}from'../battle/guardAIDebug.js';import GuardAIController from'./GuardAIController.js';
const encoder=new StateEncoder(),state=()=>new CombatSystem().snapshot();
test('visits distinguish real learned zero from unseen; set/get never imply experience',()=>{
 const q=new QTable();assert.equal(q.getVisitCount('s','attack'),0);assert.equal(q.hasVisited('s','attack'),false);q.set('s','attack',0);assert.equal(q.hasVisited('s','attack'),false);
 assert.equal(q.incrementVisit('s','attack'),1);assert.equal(q.incrementVisit('s','attack'),2);assert.equal(q.hasVisited('s','attack'),true);assert.equal(q.get('s','attack'),0);
 const copy=QTable.fromJSON(JSON.parse(JSON.stringify(q.toJSON())));assert.equal(copy.getVisitCount('s','attack'),2);assert.equal(copy.getVisitCount('s','defend'),0);
 for(const n of [-1,1.5,'1',Number.MAX_SAFE_INTEGER+1]){const data=q.toJSON();data.visitCounts.s.attack=n;assert.throws(()=>QTable.fromJSON(data));}
});
test('TRAIN exhausts unvisited valid choices before epsilon greedy, reproducibly and without invalid actions',()=>{
 const play=()=>{const s=state(),q=new QTable(),p=new QLearningGuardPolicy({table:q,mode:'TRAIN',random:seededRandom(21),epsilon:0}),actions=validActions(s,'guard'),chosen=[];
  for(let i=0;i<actions.length;i++){const a=p.chooseAction(s);assert.ok(actions.includes(a));assert.equal(q.hasVisited(encoder.encode(s),a),false);chosen.push(a);p.learn(s,a,-1,s,{terminal:true});}
  assert.equal(new Set(chosen).size,actions.length);assert.equal(chosen.includes('eatDonut'),false);q.set(encoder.encode(s),'defend',100);assert.equal(p.chooseAction(s),'defend');return chosen;};assert.deepEqual(play(),play());
});
test('TRAIN epsilon exploration resumes after visited valid actions, including zero Q',()=>{
 const s=state();s.guard.sp=0;s.guard.wifeCallAvailable=false;s.guard.donutAvailable=false;const q=new QTable(),key=encoder.encode(s);q.set(key,'attack',10);q.incrementVisit(key,'attack');q.incrementVisit(key,'defend');
 const rolls=[0,.99],p=new QLearningGuardPolicy({table:q,mode:'TRAIN',random:()=>rolls.shift(),epsilon:1});assert.equal(p.chooseAction(s),'defend');p.setEpsilon(0);assert.equal(p.chooseAction(s),'attack');
});
test('EVAL excludes unvisited zero when visited Q is negative; visited zero remains legitimate',()=>{
 const s=state();s.guard.hp=500;const key=encoder.encode(s),q=new QTable();q.set(key,'attack',-2);q.incrementVisit(key,'attack');q.set(key,'defend',-3);q.incrementVisit(key,'defend');
 const p=new QLearningGuardPolicy({table:q,mode:'EVAL',random:()=>.99}),before=JSON.stringify(q.toJSON());assert.equal(p.chooseAction(s),'attack');assert.equal(p.lastSelection.fallback,false);assert.equal(JSON.stringify(q.toJSON()),before);
 q.incrementVisit(key,'eatDonut');assert.equal(p.chooseAction(s),'eatDonut');assert.equal(q.get(key,'eatDonut'),0);
});
test('no visited VALID action invokes Random fallback without table mutation, even if invalid actions were visited',()=>{
 const s=state(),q=new QTable(),key=encoder.encode(s);q.set(key,'eatDonut',999);q.incrementVisit(key,'eatDonut');
 const p=new QLearningGuardPolicy({table:q,random:()=>0}),before=JSON.stringify(q.toJSON());assert.equal(p.chooseAction(s),'attack');assert.equal(p.lastSelection.fallback,true);assert.equal(JSON.stringify(q.toJSON()),before);
 s.guard.offGuard=true;assert.equal(p.chooseAction(s),null);assert.equal(p.lastSelection.forced,true);
});
test('one Q update/visit for a cancelled commitment, none for aggregated forced OFF_GUARD skip',()=>{
 let calls=0;const e=new TrainingEnvironment({bot:{chooseAction:()=> ++calls===1?'lookThere':'attack'}});e.combat.random=()=>0;e.combat.tieRandom=()=>0;
 const s=e.observation(),q=new QTable(),p=new QLearningGuardPolicy({table:q,mode:'TRAIN'}),t=e.step('attack');assert.equal(t.rounds,2);assert.equal(t.transitions[0].events.some(e=>e.type==='actionCancelled'),true);p.learn(s,'attack',t.reward,t.nextState,{terminal:t.terminal,rounds:t.rounds});
 assert.equal(q.getVisitCount(encoder.encode(s),'attack'),1);assert.equal(q.coverage().totalVisits,e.decisions);
});
test('coverage uses visit counts and union of legal options actually observed, not nonzero Q',()=>{
 const q=new QTable();q.observeValidActions('a',['attack','defend']);q.incrementVisit('a','attack');q.observeValidActions('b',['attack']);q.incrementVisit('b','attack');q.incrementVisit('b','attack');
 const c=q.coverage();assert.equal(c.encounteredStates,2);assert.equal(c.learnedPairs,2);assert.equal(c.totalVisits,3);assert.equal(c.meanVisitedActions,1);assert.equal(c.medianVisitedActions,1);assert.equal(c.fullyExploredSeenLegalPercent,50);
 assert.deepEqual(QTable.fromJSON(q.toJSON()).coverage(),c);
});
for(const [available,hp,expected]of [[false,500,'UNAVAILABLE'],[true,1000,'FULL_VALUE'],[true,999,'FULL_VALUE'],[true,1001,'PARTIAL_VALUE'],[true,1190,'PARTIAL_VALUE'],[true,1200,'PARTIAL_VALUE']])test(`Donut ${available}/${hp} encodes ${expected}`,()=>{
 const s=state();s.guard.donutAvailable=available;s.guard.hp=hp;assert.equal(donutState(s.guard),expected);assert.ok(encoder.encode(s).includes('DONUT_'+expected));
});
test('randomized starts cover all Donut values coherently without a heal policy rule',()=>{
 const categories=new Set();for(let seed=0;seed<400;seed++){const e=new TrainingEnvironment({seed,randomizedStart:true}),s=e.observation();categories.add(donutState(s.guard));assert.equal(donutState(s.guard)==='FULL_VALUE',s.guard.donutAvailable&&s.guard.maxHp-s.guard.hp>=200);}
 assert.equal(categories.size,3);
});
test('debug distinguishes visited Q zero, unvisited actions and honest unseen fallback without hidden Player choice',()=>{
 const c=new GuardAIController({random:()=>0}),q=new QTable(),s=state(),key=encoder.encode(s);q.incrementVisit(key,'attack');c.load(q.toJSON());const view=c.debugView({...s,playerAction:'secret'},false),text=formatGuardDebug(view,true);assert.match(text,/Q 0.00  N 1/);assert.match(text,/UNVISITED/);assert.equal(text.includes('secret'),false);
 const d=new GuardAIController({random:()=>0});d.load(new QTable().toJSON());assert.match(formatGuardDebug(d.debugView(s,false),true),/Q state unseen.*Random fallback/);
});
