import test from 'node:test';import assert from'node:assert/strict';import{createSchoolFixture}from'../exploration/explorationTestHarness.mjs';import{revealBattle,BATTLE_ENTRY_TIMING}from'./BattleEntryTransition.js';
test('automatic dialogue -> pause -> shutters -> black -> battle; single trigger and input lock survive transition',()=>{
 const{scene,calls}=createSchoolFixture();scene.startGateEncounter();while(scene.storyDialogue.active)scene.storyDialogue.advance();assert.equal(scene.inputLocked,true);assert.equal(calls.filter(c=>c[0]==='launch').length,0);scene.startGateEncounter();scene.advanceTime(200);assert.equal(scene.battleEntry.cover.top.scaleY,0);scene.advanceTime(420);assert.equal(scene.battleEntry.cover.top.scaleY,1);assert.equal(calls.filter(c=>c[0]==='launch').length,0);scene.advanceTime(80);assert.equal(calls.filter(c=>c[0]==='launch').length,1);scene.advanceTime(3000);assert.equal(calls.filter(c=>c[0]==='launch').length,1);
});
test('shutdown cancels entry and reveal callbacks; reveal finishes only at220ms',()=>{
 const a=createSchoolFixture();let count=0;a.scene.battleEntry.start(()=>count++);a.scene.advanceTime(250);a.scene.events.emit('shutdown');a.scene.advanceTime(2000);assert.equal(count,0);
 const b=createSchoolFixture();revealBattle(b.scene,()=>count++);b.scene.advanceTime(BATTLE_ENTRY_TIMING.reveal-1);assert.equal(count,0);b.scene.advanceTime(1);assert.equal(count,1);
 revealBattle(b.scene,()=>count++);b.scene.events.emit('shutdown');b.scene.advanceTime(1000);assert.equal(count,1);
});
