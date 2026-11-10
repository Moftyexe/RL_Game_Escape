import test from 'node:test';import assert from 'node:assert/strict';
import RunState,{runStateForScene,readinessForTier} from './RunState.js';
import {gateDialogue} from '../dialogue/gateDialogue.js';
test('escapes advance canonical day/readiness; defeat/retry/draw do not; cap5 and deduplicate victory',()=>{
 const s=new RunState();assert.deepEqual([s.dayNumber,s.readinessTier,s.successfulEscapes],[1,1,0]);
 for(const outcome of ['DEFEAT','RETRY','DRAW']){s.completeEncounter(s.beginEncounter(),outcome);assert.equal(s.dayNumber,1);assert.equal(s.readinessTier,1);}
 for(let i=1;i<=9;i++){const id=s.beginEncounter();assert.equal(s.completeEncounter(id,'VICTORY'),true);assert.equal(s.completeEncounter(id,'VICTORY'),false);assert.equal(s.dayNumber,i+1);assert.equal(s.successfulEscapes,i);assert.equal(s.readinessTier,Math.min(i+1,5));}
});
test('session survives different scenes in one game; separate games stay independent',()=>{
 const game={};const a=runStateForScene({game});a.completeEncounter(a.beginEncounter(),'VICTORY');assert.equal(runStateForScene({game}),a);assert.equal(runStateForScene({game:{}}).dayNumber,1);
});
test('day-aware editable dialogue and defaults do not require portraits',()=>{
 assert.match(gateDialogue(1)[0].text,/Where/);assert.match(gateDialogue(3)[0].text,/tricks/);assert.deepEqual(gateDialogue(100),gateDialogue(5));assert.ok(gateDialogue(3,{1:[]}).length);assert.ok(gateDialogue(undefined,{}).length);assert.equal(readinessForTier(5).name,'LOCKED IN');
});
