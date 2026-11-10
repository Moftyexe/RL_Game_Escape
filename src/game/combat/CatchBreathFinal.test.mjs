import test from 'node:test';
import assert from 'node:assert/strict';
import CombatSystem,{ACTIONS,validActions} from './CombatSystem.js';
import {mechanicalCommentary} from '../battle/mechanicalCommentary.js';
const lock=c=>{c.beginRound();assert.equal(c.lockActions('catchBreath','defend'),true);c.revealActions();};
test('Catch Breath costs30, heals150 capped1000, restores no SP or defense',()=>{
 for(const[hp,sp,expected]of [[650,70,800],[960,70,1000],[1000,30,1000]]){
  const c=new CombatSystem({tieRandom:()=>0});c.player.hp=hp;c.player.sp=sp;lock(c);const result=c.resolveNextAction();
  assert.equal(result.action,'catchBreath');assert.equal(c.player.hp,expected);assert.equal(c.player.sp,sp-30);assert.equal(c.player.defending,false);
  assert.deepEqual(result.events.find(e=>e.type==='restored'),{type:'restored',targetId:'player',hp:expected-hp,sp:0});
  assert.equal(mechanicalCommentary(result)[0].text.includes('SP'),false);if(hp===650)assert.match(mechanicalCommentary(result)[0].text,/\+150 HP/);
 }
 assert.equal(ACTIONS.catchBreath.cost,30);assert.equal(ACTIONS.catchBreath.priority,'FAST');
});
test('engine rejects unaffordable Catch Breath, including exact29/30 boundary',()=>{
 for(const sp of [0,14,20,29,30,70,100]){const c=new CombatSystem();c.player.sp=sp;assert.equal(validActions(c,'player').includes('catchBreath'),sp>=30);c.beginRound();assert.equal(c.lockActions('catchBreath','defend'),sp>=30);}
});
test('Catch Breath cancelled at execution by stun or death spends nothing and heals nothing',()=>{
 for(const interruption of ['stun','guardDeath','playerDeath']){const c=new CombatSystem({tieRandom:()=>0});c.player.hp=650;c.player.sp=70;lock(c);
  if(interruption==='stun')c.player.stunned=true;else if(interruption==='guardDeath')c.guard.hp=0;else c.player.hp=0;
  const result=c.resolveNextAction();assert.equal(result.skipped,true);assert.equal(c.player.sp,70);assert.equal(c.player.hp,interruption==='playerDeath'?0:650);assert.equal(result.events.some(e=>e.type==='restored'),false);
 }
});
test('carried Whistle stun reserves null opportunity; no Catch Breath cost/heal and flag clears',()=>{
 const c=new CombatSystem();c.player.hp=650;c.player.sp=70;c.player.stunned=true;c.beginRound();assert.equal(c.lockActions('catchBreath','defend'),false);assert.equal(c.lockActions(null,'defend'),true);c.revealActions();c.resolveNextAction();c.resolveNextAction();c.endRound();assert.equal(c.player.hp,650);assert.equal(c.player.sp,70);assert.equal(c.player.stunned,false);
});
