import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import HallwayMusic, { HALLWAY_MUSIC_VOLUME } from './HallwayMusic.js';
import { preloadHallwayAssets, createMusician } from './hallwayAssets.js';
import manifest from '../../../public/assets/hallway-manifest.json' with { type: 'json' };
import { createSchoolFixture } from './explorationTestHarness.mjs';

function fixture({ missing = false, locked = false, reject = false } = {}) {
    const track={isPlaying:false,isPaused:false,seek:42,plays:0,resumes:0,pauses:0,
        play(config){if(reject)throw Error('unavailable audio');this.config=config;this.plays++;this.isPlaying=true;return true;},
        pause(){this.pauses++;this.isPaused=true;this.isPlaying=false;return true;},
        resume(){this.resumes++;this.isPaused=false;this.isPlaying=true;return true;}};
    let instances=0;
    const sound=Object.assign(new EventEmitter(),{locked,get:()=>null,add:(key,config)=>{instances++;track.initialConfig=config;return track;}});
    const scene={sound,events:new EventEmitter(),input:Object.assign(new EventEmitter(),{keyboard:new EventEmitter()}),cache:{audio:{exists:()=>!missing}}};
    const music=HallwayMusic.forScene(scene);
    return{scene,music,track,instances:()=>instances};
}
test('hallway asset registration uses detected audio and four NPC frames; missing manifest is safe',()=>{
    const calls=[],scene={load:{audio:(...a)=>calls.push(['audio',...a]),image:(...a)=>calls.push(['image',...a])}};
    preloadHallwayAssets(scene);assert.equal(calls.filter(a=>a[0]==='audio').length,1);assert.match(calls[0][2],/assets\/audio\/hallway.mp3$/);assert.equal(calls.filter(a=>a[0]==='image').length,4);
    preloadHallwayAssets(scene,{});assert.equal(calls.length,5);assert.equal(createMusician({}, {}, 1, {}),null);
});
test('music copied byte-for-byte without re-encoding and musician manifest matches current source',async()=>{
    for(const entry of [manifest.music,manifest.musician])assert.equal(createHash('sha256').update(await readFile(entry.source)).digest('hex'),entry.sha256);
    assert.equal(createHash('sha256').update(await readFile('public/'+manifest.music.file)).digest('hex'),manifest.music.sha256);
});
test('one looping track at 0.35 survives repeated interaction starts',()=>{const f=fixture();for(let i=0;i<5;i++){f.music.start();f.scene.input.emit('pointerdown');}assert.equal(f.instances(),1);assert.equal(f.track.plays,1);assert.deepEqual(f.track.config,{loop:true,volume:HALLWAY_MUSIC_VOLUME});});
test('ON/OFF/ON pauses and resumes without restarting or changing playback position',()=>{const f=fixture();assert.equal(f.music.toggle(),false);assert.equal(f.track.isPaused,true);assert.equal(f.music.toggle(),true);assert.equal(f.track.resumes,1);assert.equal(f.track.plays,1);assert.equal(f.track.seek,42);});
test('battle pause and return resume preserve track and user OFF preference',()=>{const f=fixture();f.scene.events.emit('pause');assert.equal(f.track.isPaused,true);f.scene.input.emit('pointerdown');assert.equal(f.track.resumes,0);f.scene.events.emit('resume');assert.equal(f.track.resumes,1);f.music.toggle();f.scene.events.emit('pause');f.scene.events.emit('resume');assert.equal(f.track.resumes,1);assert.equal(f.music.enabled,false);});
test('locked audio waits for unlock/user gesture and never spawns duplicates',()=>{const f=fixture({locked:true});assert.equal(f.instances(),0);f.scene.sound.locked=false;f.scene.sound.emit('unlocked');f.scene.input.keyboard.emit('keydown');assert.equal(f.instances(),1);assert.equal(f.track.plays,1);});
test('missing/failed/no-audio paths are nonfatal',()=>{const missing=fixture({missing:true});assert.equal(missing.instances(),0);assert.doesNotThrow(()=>missing.music.toggle());const rejected=fixture({reject:true});assert.equal(rejected.music.start(),false);assert.doesNotThrow(()=>rejected.scene.input.emit('pointerdown'));rejected.scene.sound.noAudio=true;assert.equal(rejected.music.start(),false);});
test('shutdown removes gesture/lifecycle listeners; recreating scene keeps session preference',()=>{const f=fixture();f.music.toggle();f.scene.events.emit('shutdown');assert.equal(f.scene.input.listenerCount('pointerdown'),0);assert.equal(f.scene.sound.listenerCount('unlocked'),0);assert.equal(f.scene.events.listenerCount('pause'),0);assert.equal(HallwayMusic.forScene(f.scene),f.music);assert.equal(f.music.enabled,false);assert.equal(f.instances(),1);});
test('musician opens central greeting then audio settings without toggling music or starting battle',()=>{const f=createSchoolFixture();f.scene.hallwayMusic.toggle=()=>{throw Error('Immediate toggle forbidden');};f.scene.player.x=f.scene.musician.x;f.scene.player.y=f.scene.musician.y;f.scene.keys.interact.fresh=true;f.scene.update(0,16);assert.equal(f.scene.storyDialogue.active,true);assert.equal(f.scene.inputLocked,true);assert.equal(f.scene.storyDialogue.name.text,'@prodbyhajime');while(f.scene.storyDialogue.active)f.scene.storyDialogue.advance();assert.equal(f.scene.audioMenu.active,true);assert.equal(f.scene.inputLocked,true);f.scene.audioMenu.close();assert.equal(f.scene.inputLocked,false);assert.equal(f.calls.some(c=>c[0]==='launch'),false);assert.equal(f.scene.interactions.zones.length,1);});
test('missing friend sprite removes optional zone and leaves Guard dialogue/battle working',()=>{const f=createSchoolFixture({missingMusician:true});assert.equal(f.scene.musician,null);assert.equal(f.scene.interactions.zones.length,0);f.scene.player.x=f.scene.guard.x;f.scene.player.y=f.scene.guard.y;f.scene.keys.interact.fresh=true;f.scene.update(0,16);assert.equal(f.scene.storyDialogue.active,true);while(f.scene.storyDialogue.active)f.scene.storyDialogue.advance();f.scene.advanceTime(700);assert.equal(f.calls.filter(c=>c[0]==='launch').length,1);});
