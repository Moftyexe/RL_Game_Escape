import test from 'node:test';
import assert from 'node:assert/strict';
import CombatSystem from '../src/game/combat/CombatSystem.js';
import TrainingEnvironment from '../src/game/training/TrainingEnvironment.js';
import RandomGuardPolicy from '../src/game/combat/RandomGuardPolicy.js';
import {seededRandom} from '../src/game/training/SeededRandom.js';
import CatchBreathAudit from './CatchBreathAudit.mjs';
test('audit measures exact executed cost, capped healing, waste and cancelled commitments',()=>{
 const a=new CatchBreathAudit();
 for(const hp of [650,960,1000]){const c=new CombatSystem({tieRandom:()=>0});c.player.hp=hp;c.player.sp=70;a.attach(c);c.beginRound();assert.ok(c.lockActions('catchBreath','defend'));c.revealActions();c.resolveNextAction();c.resolveNextAction();c.endRound();}
 const c=new CombatSystem({tieRandom:()=>0});a.attach(c);c.beginRound();c.lockActions('catchBreath','defend');c.revealActions();c.player.stunned=true;c.resolveNextAction();c.resolveNextAction();c.endRound();
 const d=a.toJSON();assert.equal(d.selected,4);assert.equal(d.executed,3);assert.equal(d.cancelled,1);assert.equal(d.totalSpSpent,90);assert.equal(d.effectiveHealing,190);assert.equal(d.wastedHealing,260);assert.equal(d.healsUnder50,2);assert.equal(d.usedAtFullHp,1);assert.equal(d.everyExecutedCost30,true);
});
test('audit wrappers leave seeded combat, rewards, choices and RNG sequences unchanged',()=>{
 const run=instrumented=>{const a=new CatchBreathAudit(),e=new TrainingEnvironment({seed:876,bot:'random',keepTrace:true}),p=new RandomGuardPolicy(seededRandom(123));if(instrumented)a.attach(e.combat);while(!e.terminal)e.step(p.chooseAction(e.observation()));if(instrumented)a.toJSON();return {trace:e.trace,summary:e.summary(),state:e.combat.snapshot()};};assert.deepEqual(run(true),run(false));
});
test('audit missing-HP categories use exact boundaries and reconcile to executions',()=>{
 const a=new CatchBreathAudit();for(const missing of [0,20,25,49,50,99,100]){const c=new CombatSystem({tieRandom:()=>0});c.player.hp=1000-missing;a.attach(c);c.beginRound();c.lockActions('catchBreath','defend');c.revealActions();c.resolveNextAction();c.resolveNextAction();c.endRound();}
 const d=a.toJSON();assert.deepEqual(d.missingHpBins,{FULL_HP:1,UNDER25:1,FROM25_TO49:2,FROM50_TO99:2,AT_LEAST100:1});assert.equal(Object.values(d.missingHpBins).reduce((a,n)=>a+n,0),d.executed);
});
