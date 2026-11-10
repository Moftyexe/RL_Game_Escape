import test from 'node:test';
import assert from 'node:assert/strict';
import CombatSystem,{STATUSES,RILED_STUMBLE} from './CombatSystem.js';
function round(c,p,g){c.beginRound();assert.ok(c.lockActions(p,g));c.revealActions();c.resolveNextAction();c.resolveNextAction();return c.endRound();}
test('Whistle before backpack consumes stun now, charges no SP and next action is normal',()=>{
 const c=new CombatSystem({random:()=>.05,tieRandom:()=>0});
 const first=round(c,'swingBackpack','blowWhistle');
 assert.equal(first.results[0].action,'blowWhistle');assert.equal(first.results[1].action,'stunned');assert.equal(first.results[1].skipped,true);
 assert.equal(c.player.sp,100);assert.equal(c.guard.hp,1200);assert.equal(c.player.stunned,false);
 const next=round(c,'swingBackpack','defend');assert.equal(next.results.find(r=>r.actorId==='player').skipped,false);assert.equal(c.player.sp,80);assert.equal(c.player.stunned,false);
 assert.equal([...first.events,...next.events].filter(e=>e.type==='turnSkipped'&&e.targetId==='player').length,1);
});
test('Whistle after Player acts stores one skip, consumes it next opportunity, then normal',()=>{
 const c=new CombatSystem({random:()=>.05,tieRandom:()=>0});c.player.sp=70;
 const first=round(c,'catchBreath','blowWhistle');assert.equal(first.results[0].action,'catchBreath');assert.equal(first.results[0].skipped,false);assert.equal(c.player.sp,40);assert.equal(c.player.stunned,true);
 const next=round(c,null,'defend');assert.equal(c.player.sp,40);assert.equal(c.player.stunned,false);
 const third=round(c,'swingBackpack','defend');assert.equal(third.results.find(r=>r.actorId==='player').skipped,false);assert.equal(c.player.sp,20);
 assert.equal([...first.events,...next.events,...third.events].filter(e=>e.type==='turnSkipped'&&e.targetId==='player').length,1);
});
test('Whistle nonproc retains DISTRACTED without skipping; 10% boundary unchanged',()=>{
 const c=new CombatSystem({random:()=>.1,tieRandom:()=>0});const r=round(c,'swingBackpack','blowWhistle');
 assert.equal(c.player.status.name,'DISTRACTED');assert.equal(c.player.stunned,false);assert.equal(c.player.sp,80);assert.equal(r.events.some(e=>e.type==='turnSkipped'),false);
 assert.deepEqual(STATUSES.RILED,{turns:3,accuracy:-.25,criticalChance:.25,damage:1.5,defend:-.1});assert.deepEqual(RILED_STUMBLE,{chance:.2,damage:50});
});
