import test from 'node:test';import assert from 'node:assert/strict';
import CombatSystem,{ACTIONS,PLAYER_DEFEND_EVASION,getActionAccuracy} from './CombatSystem.js';
const round=(c,p,g)=>{c.beginRound();assert.ok(c.lockActions(p,g));c.revealActions();c.resolveNextAction();c.resolveNextAction();return c.endRound();};
test('Player-only Defend subtracts5pp; neutral85%, RILED60%; damage reduction remains',()=>{
 assert.equal(PLAYER_DEFEND_EVASION,.05);
 for(const[status,accuracy,roll,hit,damage]of [[null,.85,.849,true,40],[null,.85,.85,false,0],['RILED',.6,.599,true,60],['RILED',.6,.6,false,0]]){
  const c=new CombatSystem({random:()=>roll,tieRandom:()=>0});if(status)c.guard.status={name:status,turns:3};c.player.sp=50;
  const r=round(c,'defend','attack'),e=r.events.find(e=>e.actorId==='guard'&&['damage','miss'].includes(e.type));
  assert.equal(e.effectiveAccuracy,accuracy);assert.equal(e.type,hit?'damage':'miss');assert.equal(c.player.hp,1000-damage);assert.equal(c.player.sp,60);assert.equal(c.player.defending,false);
 }
});
test('Guard Defend never changes Player Attack/Backpack accuracy or existing block',()=>{
 for(const[action,accuracy,hitRoll,damage]of [['attack',.9,.899,40],['swingBackpack',.8,.799,70]]){
  const c=new CombatSystem({random:()=>hitRoll,tieRandom:()=>0}),r=round(c,action,'defend'),e=r.events.find(e=>e.type==='damage');assert.equal(e.effectiveAccuracy,accuracy);assert.equal(e.damage,damage);assert.equal(e.blocked,true);
 }
});
test('evasion excludes nonphysical/guaranteed actions and applies after status modifiers before clamp',()=>{
 const c=new CombatSystem();c.player.defending=true;
 assert.equal(getActionAccuracy(c.guard,c.player,'player',{category:'skill',accuracy:.9}),.9);
 assert.equal(getActionAccuracy(c.guard,c.player,'player',{category:'attack',physical:false,accuracy:.9}),.9);
 for(const extra of [{alwaysHit:true},{accuracyRolled:false}])assert.equal(getActionAccuracy(c.guard,c.player,'player',{...ACTIONS.attack,...extra}),1);
 c.guard.status={name:'FOCUSED',turns:3};assert.equal(getActionAccuracy(c.guard,c.player,'player',ACTIONS.attack),1);
 const direct=new CombatSystem({random:()=>{throw Error('Guaranteed nonphysical skill must not roll accuracy');},tieRandom:()=>0});const r=round(direct,'talkSmack','defend');assert.equal(r.events.find(e=>e.type==='damage').damage,30);assert.equal(direct.guard.status.name,'RILED');
 const whistle=new CombatSystem({random:()=>.5,tieRandom:()=>0});round(whistle,'defend','blowWhistle');assert.equal(whistle.player.status.name,'DISTRACTED');
});
