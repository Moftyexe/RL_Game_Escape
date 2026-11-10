import test from 'node:test';
import assert from 'node:assert/strict';
import { mechanicalCommentary } from './mechanicalCommentary.js';
import CombatSystem from '../combat/CombatSystem.js';
import PresentationEffects from './presentationEffects.js';
import { installPresentationHarness } from './presentationTestHarness.mjs';
const resolved = (p,g,configure=()=>{}) => {const c=new CombatSystem({random:()=>.5,tieRandom:()=>0});configure(c);c.beginRound();assert.ok(c.lockActions(p,g));c.revealActions();return [c.resolveNextAction(),c.resolveNextAction()];};
for(const [action,target,name] of [['broLockIn','player','FOCUSED'],['lookThere','guard','DISTRACTED']])test(`commentary explains ${action} without changing result`,()=>{
 const result=resolved(action,'attack').find(r=>r.actorId==='player'),before=structuredClone(result),entries=mechanicalCommentary(result);
 assert.ok(entries[0].text.includes(name));assert.ok(entries[0].text.includes('↑')||entries[0].text.includes('↓'));assert.deepEqual(result,before);
 assert.equal(mechanicalCommentary(result,{[target]:{status:{name}}})[0].text.includes('↑'),false);
});
test('Whistle status and stun commentary is queued, with no claimed extra skipped action',()=>{const result=resolved('attack','blowWhistle',c=>c.random=()=>0)[0];const entries=mechanicalCommentary(result);assert.equal(entries.length,2);assert.ok(entries[0].text.includes('DISTRACTED'));assert.ok(entries[1].text.includes('action was interrupted'));});
test('Donut and Catch Breath narration reports actual capped recovery',()=>{const results=resolved('catchBreath','eatDonut',c=>{c.player.hp=960;c.player.sp=95;c.guard.hp=1190;c.guard.sp=99;});assert.match(mechanicalCommentary(results[0])[0].text,/\+40 HP/);assert.match(mechanicalCommentary(results[1])[0].text,/\+10 HP$/);});
for(const mental of ['RILED','DISTRACTED',null])test(`Wife commentary matches ${mental} execution branch`,()=>{const r=resolved('attack','callWife',c=>{c.guard.sp=50;c.guard.status=mental?{name:mental,turns:3}:null;})[0];const entries=mechanicalCommentary(r);assert.equal(entries.length,2);assert.match(entries[0].text,/called his wife/);assert.match(entries[1].text,/FOCUSED/);assert.match(entries[1].text,/\+20 SP/);});
test('Defend and blocked hit explain their mechanical consequence',()=>{const results=resolved('attack','defend');assert.match(mechanicalCommentary(results[0])[0].text,/braces for impact/);assert.match(mechanicalCommentary(results[1])[0].text,/partially blocked/);});
test('commentary owns a separate box from speech and cleans up on shutdown',async()=>{
 const scene={combat:new CombatSystem(),presentationSerial:0};const f=installPresentationHarness(scene),effects=new PresentationEffects(scene);
 effects.showSpeechBubble('guard','"Yum."',1300);const speech=effects.speech;
 effects.showMechanicalCommentary('The Guard ate a donut.\n+200 HP',1600);
 assert.equal(effects.speech,speech);assert.equal(effects.commentary.object.y,402);assert.equal(effects.commentary.object.children[0].height,90);
 const first=effects.commentary;effects.showMechanicalCommentary('Second message',1200);assert.equal(first.object.destroyed,true);
 scene.events.emit('shutdown');await f.advance(5000);assert.equal(effects.overlays.size,0);assert.equal(effects.commentary.object.destroyed,true);
});

test('RILED explanation includes lower defense; Wife FOCUSED refresh differs from neutral',()=>{
 const riled=resolved('defend','crackKnuckles').find(r=>r.actorId==='guard');assert.match(mechanicalCommentary(riled)[0].text,/Defense ↓/);
 const wife=resolved('attack','callWife',c=>{c.guard.status={name:'FOCUSED',turns:1};})[0];
 const entries=mechanicalCommentary(wife,{guard:{status:{name:'FOCUSED'}}});assert.equal(entries[0].text,'The Guard called his wife.');assert.match(entries[1].text,/confidence was restored/);assert.match(entries[1].text,/FOCUSED refreshed/);
});
test('late whistle stun accurately explains the next opportunity rather than an already-completed action',()=>{
 const result=resolved('broLockIn','blowWhistle',c=>c.random=()=>0)[1];assert.match(mechanicalCommentary(result,{}, {playerAlreadyActed:true}).at(-1).text,/next action will be skipped/);
});

test('OFF GUARD commentary distinguishes interrupted and already-resolved Guard actions',()=>{
 const interrupted={action:'lookThere',actorId:'player',events:[{type:'offGuardApplied',targetId:'guard',interrupted:true}]};
 assert.equal(mechanicalCommentary(interrupted)[0].text,'The Guard actually fell for it.');assert.match(mechanicalCommentary(interrupted)[1].text,/OFF GUARD!/);assert.match(mechanicalCommentary(interrupted)[1].text,/pending action was interrupted/);
 assert.match(mechanicalCommentary({...interrupted,events:[{type:'offGuardApplied',targetId:'guard',interrupted:false}]})[1].text,/next action will be lost/);
});
