import test from 'node:test';import assert from 'node:assert/strict';import {EventEmitter}from'node:events';import{readFile}from'node:fs/promises';import{createHash}from'node:crypto';
import SoundEffects,{SFX,SFX_VOLUMES,preloadSfx}from'./SoundEffects.js';import{actionStartSfx,resultSfx}from'./battleSfx.js';import{SFX_EVENTS}from'./sfxEventCatalog.js';
function fixture(){let now=0;const voices=[];const scene={time:{get now(){return now;}},events:new EventEmitter(),cache:{audio:{exists:()=>true}},sound:{add(key){const v={key,isPlaying:false,plays:0,addMarker(){},play(){this.plays++;this.isPlaying=true;return true;},stop(){this.isPlaying=false;},destroy(){this.destroyed=true;}};voices.push(v);return v;}}};return{scene,voices,advance:()=>now+=100,sfx:new SoundEffects(scene)};}
test('every active event references real copied WAV assets with original hashes; volume categories resolve',async()=>{
 const keys=new Set(Object.values(SFX_EVENTS).flatMap(g=>Object.values(g).flat()));for(const id of keys){assert.ok(SFX[id],id);const a=SFX[id],b=await readFile('public/'+a.file);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(createHash('sha256').update(b).digest('hex'),a.metadata.sha256);assert.ok(SFX_VOLUMES[a.category]>0&&SFX_VOLUMES[a.category]<.5);}
 const requests=[];preloadSfx({load:{audio:(...v)=>requests.push(v)}});assert.equal(requests.length,Object.keys(SFX).length);
});
test('bounded voices reuse instances, throttle rapid input and clean up on pause/shutdown; missing/locked audio is safe',()=>{
 const f=fixture();assert.equal(f.sfx.play('no-such-sound'),false);assert.equal(f.sfx.play('uiMove'),true);assert.equal(f.sfx.play('uiMove'),false);f.advance();f.sfx.play('uiMove');assert.equal(f.voices.length,1);assert.equal(f.voices[0].plays,2);
 for(const id of Object.keys(SFX)){f.advance();f.sfx.play(id);}assert.ok(f.voices.filter(v=>v.isPlaying).length<=8);f.scene.events.emit('pause');assert.ok(f.voices.every(v=>!v.isPlaying));f.scene.sound.locked=true;assert.equal(f.sfx.play('hit'),false);f.scene.sound.locked=false;f.scene.cache.audio.exists=()=>false;assert.equal(f.sfx.play('hit'),false);f.scene.events.emit('shutdown');assert.ok(f.voices.every(v=>v.destroyed));assert.equal(f.sfx.play('hit'),false);
});
test('footsteps alternate three samples by distance, not rendered frames',()=>{
 const f=fixture();const ids=[];f.sfx.play=id=>ids.push(id);for(let i=0;i<50;i++)f.sfx.step(0);assert.deepEqual(ids,[]);for(let i=0;i<6;i++)f.sfx.step(128);assert.deepEqual(ids,['foot1','foot2','foot3','foot1','foot2','foot3']);
});
test('resolved hit/miss/critical/blocked, recovery, Whistle and proc-specific statuses map without mutating results',()=>{
 const r={action:'attack',events:[{type:'damage',critical:false}]},before=JSON.stringify(r);assert.deepEqual(resultSfx(r),['hit']);assert.equal(JSON.stringify(r),before);
 assert.deepEqual(resultSfx({...r,events:[{type:'miss'}]}),['reveal']);assert.deepEqual(resultSfx({...r,events:[{type:'damage',critical:true}]}),['hit','critical']);assert.deepEqual(resultSfx({...r,events:[{type:'damage',blocked:true}]}),['block']);
 assert.deepEqual(actionStartSfx('blowWhistle'),['whistle']);assert.deepEqual(resultSfx({action:'blowWhistle',events:[{type:'statusApplied',status:'DISTRACTED'}]}),['distracted']);assert.deepEqual(resultSfx({action:'blowWhistle',events:[{type:'statusApplied',status:'DISTRACTED'},{type:'stunApplied'}]}),['stun']);
 assert.deepEqual(actionStartSfx('catchBreath'),['breath']);assert.deepEqual(resultSfx({action:'catchBreath',events:[{type:'restored',hp:150}]}),['heal']);assert.deepEqual(resultSfx({action:'eatDonut',events:[{type:'restored',hp:200}]}),['heal']);
});
