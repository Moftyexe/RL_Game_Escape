import test from 'node:test';import assert from 'node:assert/strict';
import {createSchoolFixture} from '../exploration/explorationTestHarness.mjs';
import DialogueBox from './DialogueBox.js';import {preloadPortraits,portraitFor,PORTRAITS} from './portraits.js';
test('dialogue renders speaker/text, missing portraits are safe; keys/click advance and unlock once',()=>{
 const{scene}=createSchoolFixture();scene.textures.exists=()=>false;const locks=[];let completed=0;const box=new DialogueBox(scene,{onLock:v=>locks.push(v)});
 assert.equal(box.start([{speaker:'guard',text:'Stop.'},{speaker:'player',text:'Home.'}],()=>completed++),true);assert.equal(box.name.text,'School Guard');assert.equal(box.body.text,'');assert.equal(box.image,null);
 scene.input.keyboard.emit('keydown',{code:'Space',repeat:true});assert.equal(box.index,0);scene.input.keyboard.emit('keydown',{code:'Enter'});assert.equal(box.body.text,'Stop.');assert.equal(box.index,0);scene.input.emit('pointerdown');assert.equal(box.index,0);scene.advanceTime(120);scene.input.emit('pointerdown');assert.equal(box.name.text,'Player');scene.advanceTime(150);assert.equal(box.body.text,'Home.');scene.input.emit('pointerdown');assert.equal(completed,1);assert.deepEqual(locks,[true,false]);box.advance();assert.equal(completed,1);
 assert.equal(scene.input.listenerCount('pointerdown'),1); // Hallway unlock listener remains.
});
test('portraits are opt-in, speaker lookup is extensible, and shutdown cancels callback/input lock',()=>{
 const loads=[];preloadPortraits({load:{image:(...a)=>loads.push(a)}});const configured=Object.values(PORTRAITS).filter(p=>p.file&&p.textureKey);assert.deepEqual(loads.map(a=>a[0]),configured.map(p=>p.textureKey));assert.ok(loads.every(a=>a[1].includes('assets/portraits/')));preloadPortraits({load:{image:(...a)=>loads.push(a)}},{});assert.equal(loads.length,configured.length);assert.equal(portraitFor('guard').name,'School Guard');
 const{scene}=createSchoolFixture();const locks=[];const box=new DialogueBox(scene,{onLock:v=>locks.push(v),portraits:{player:{name:'Player',textureKey:'portrait'}}});let complete=0;box.start([{speaker:'player',text:'Hello.'}],()=>complete++);assert.ok(box.image);scene.events.emit('shutdown');assert.equal(complete,0);assert.equal(box.active,false);assert.deepEqual(locks,[true,false]);
});
test('actual default speaker mapping creates and switches the registered portrait image',()=>{
 const{scene}=createSchoolFixture(),box=new DialogueBox(scene);box.start([{speaker:'guard',text:'Stop.'},{speaker:'player',text:'Home.'}]);assert.equal(box.image.texture,'guard-dialogue-portrait');const guard=box.image;box.advance();box.advance();assert.equal(guard.destroyed,true);assert.equal(box.image.texture,'player-dialogue-portrait');assert.equal(box.name.text,'Player');box.advance();box.advance();assert.equal(box.active,false);
});

test('typewriter reveals each character at30ms; arrow appears only after completion and blinks; shutdown cancels timers',()=>{
 const{scene}=createSchoolFixture(),box=new DialogueBox(scene);box.start([{speaker:'player',text:'Hello!'}]);assert.equal(box.indicator.visible,false);scene.advanceTime(29);assert.equal(box.body.text,'');scene.advanceTime(1);assert.equal(box.body.text,'H');scene.advanceTime(60);assert.equal(box.body.text,'Hel');scene.advanceTime(90);assert.equal(box.body.text,'Hello!');assert.equal(box.indicator.visible,true);scene.advanceTime(450);assert.equal(box.indicator.visible,false);scene.events.emit('shutdown');scene.advanceTime(5000);assert.equal(box.active,false);
});
