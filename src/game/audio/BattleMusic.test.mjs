import test from'node:test';import assert from'node:assert/strict';import{EventEmitter}from'node:events';import{readFile}from'node:fs/promises';import{createHash}from'node:crypto';
import BattleMusic,{preloadBattleMusic}from'./BattleMusic.js';import HallwayMusic from'../exploration/HallwayMusic.js';import{BATTLE_MUSIC_KEY,BATTLE_MUSIC_VOLUME}from'./musicConfig.js';
import{HALLWAY_MUSIC_KEY}from'../exploration/hallwayAssets.js';import manifest from'../../../public/assets/audio/battle-manifest.json'with{type:'json'};
function fixture({locked=false,missing=false,reject=false}={}){
 const tracks=new Map(),adds={},calls=[];
 const sound=Object.assign(new EventEmitter(),{locked,get:key=>tracks.get(key),add:(key,config)=>{
  adds[key]=(adds[key]??0)+1;const t={key,isPlaying:false,isPaused:false,seek:42,config,
   play(c){if(reject&&key===BATTLE_MUSIC_KEY)throw Error('decode failure');assert.equal([...tracks.values()].some(other=>other!==t&&other.isPlaying),false,'music overlap');this.isPlaying=true;this.isPaused=false;this.config=c;calls.push('play '+key);return true;},
   pause(){this.isPlaying=false;this.isPaused=true;calls.push('pause '+key);},
   resume(){assert.equal([...tracks.values()].some(other=>other!==t&&other.isPlaying),false,'music overlap');this.isPlaying=true;this.isPaused=false;calls.push('resume '+key);return true;},
   stop(){this.isPlaying=false;this.isPaused=false;this.seek=0;calls.push('stop '+key);}};tracks.set(key,t);return t;}});
 const scene=()=>({sound,events:new EventEmitter(),input:Object.assign(new EventEmitter(),{keyboard:new EventEmitter()}),cache:{audio:{exists:key=>!(missing&&key===BATTLE_MUSIC_KEY)}}});
 const school=scene(),hallway=HallwayMusic.forScene(school);
 return{sound,scene,school,hallway,tracks,adds,calls};
}
test('battle music detected/copied without transcoding and registered with safe absent-manifest behavior',async()=>{
 assert.equal(manifest.music.source,'Battle.mp3.mpeg');assert.equal(manifest.music.format,'mp3');
 const runtime=await readFile('public/'+manifest.music.file);assert.equal(createHash('sha256').update(runtime).digest('hex'),manifest.music.sha256);
 const calls=[];preloadBattleMusic({load:{audio:(...a)=>calls.push(a)}});assert.equal(calls.length,1);assert.equal(calls[0][0],BATTLE_MUSIC_KEY);assert.match(calls[0][1],/assets\/audio\/battle.mp3$/);preloadBattleMusic({},{});
});
test('School -> Battle -> School uses one loop at .35, pauses/resumes hallway seek without overlap',()=>{
 const f=fixture(),battle=f.scene(),music=BattleMusic.forScene(battle);f.school.events.emit('pause');assert.equal(f.tracks.get(HALLWAY_MUSIC_KEY).isPaused,true);assert.equal(f.tracks.get(BATTLE_MUSIC_KEY).isPlaying,true);assert.deepEqual(f.tracks.get(BATTLE_MUSIC_KEY).config,{loop:true,volume:BATTLE_MUSIC_VOLUME});
 music.leave();f.school.events.emit('resume');battle.events.emit('shutdown');assert.equal(f.tracks.get(BATTLE_MUSIC_KEY).isPlaying,false);assert.equal(f.tracks.get(HALLWAY_MUSIC_KEY).isPlaying,true);assert.equal(f.tracks.get(HALLWAY_MUSIC_KEY).seek,42);assert.equal(f.adds[BATTLE_MUSIC_KEY],1);
});
test('repeated battles, repeated input and duplicate leave never create duplicate tracks/listeners',()=>{
 const f=fixture();for(let i=0;i<3;i++){const s=f.scene(),m=BattleMusic.forScene(s);f.school.events.emit('pause');for(let j=0;j<4;j++)s.input.emit('pointerdown');m.leave();f.school.events.emit('resume');s.events.emit('shutdown');assert.equal(s.input.listenerCount('pointerdown'),0);}
 assert.equal(f.adds[BATTLE_MUSIC_KEY],1);assert.equal(f.adds[HALLWAY_MUSIC_KEY],1);assert.equal(f.sound.listenerCount('unlocked'),1);
});
test('hallway OFF remains local, battle still plays and return respects preference',()=>{
 const f=fixture();f.hallway.toggle();const s=f.scene(),m=BattleMusic.forScene(s);f.school.events.emit('pause');assert.equal(f.tracks.get(BATTLE_MUSIC_KEY).isPlaying,true);m.leave();f.school.events.emit('resume');s.events.emit('shutdown');assert.equal(f.tracks.get(HALLWAY_MUSIC_KEY).isPlaying,false);assert.equal(f.hallway.enabled,false);f.hallway.toggle();assert.equal(f.tracks.get(HALLWAY_MUSIC_KEY).isPlaying,true);
});
test('unlock retries respect interlock and create only one battle instance',()=>{
 const f=fixture({locked:true}),s=f.scene(),m=BattleMusic.forScene(s);f.school.events.emit('pause');assert.equal(f.tracks.size,0);f.sound.locked=false;f.sound.emit('unlocked');s.input.keyboard.emit('keydown');assert.equal(f.adds[BATTLE_MUSIC_KEY],1);assert.equal(f.tracks.has(HALLWAY_MUSIC_KEY),false);m.leave();f.school.events.emit('resume');assert.equal(f.tracks.get(HALLWAY_MUSIC_KEY).isPlaying,true);
});
test('missing/undecodable battle audio is nonfatal and does not strand hallway playback',()=>{
 for(const options of [{missing:true},{reject:true}]){const f=fixture(options),s=f.scene(),m=BattleMusic.forScene(s);f.school.events.emit('pause');assert.doesNotThrow(()=>s.input.emit('pointerdown'));m.leave();f.school.events.emit('resume');assert.equal(f.tracks.get(HALLWAY_MUSIC_KEY).isPlaying,true);}
});
test('resume ordering cannot overlap tracks; battle pause cannot be undone by unrelated unlock',()=>{
 const f=fixture(),s=f.scene(),m=BattleMusic.forScene(s);f.school.events.emit('resume');assert.equal(f.tracks.get(HALLWAY_MUSIC_KEY).isPlaying,false);s.events.emit('pause');f.sound.emit('unlocked');assert.equal(f.tracks.get(BATTLE_MUSIC_KEY).isPlaying,false);s.events.emit('resume');assert.equal(f.tracks.get(BATTLE_MUSIC_KEY).isPlaying,true);s.events.emit('shutdown');assert.equal(f.tracks.get(HALLWAY_MUSIC_KEY).isPlaying,true);
});
test('day/retry scene resets preserve seek and hallway preference without duplicate music',()=>{
 const f=fixture();let school=f.school;for(let day=0;day<3;day++){
  school.events.emit('pause');const battle=f.scene(),music=BattleMusic.forScene(battle);music.leave();school.events.emit('shutdown');battle.events.emit('shutdown');
  assert.equal(f.tracks.get(HALLWAY_MUSIC_KEY).isPlaying,false);assert.equal(f.tracks.get(BATTLE_MUSIC_KEY).isPlaying,false);
  school=f.scene();const hall=HallwayMusic.forScene(school);assert.equal(hall.track.seek,42);assert.equal(hall.track.isPlaying,hall.enabled);
  if(day===1)hall.toggle();
 }
 assert.equal(f.adds[BATTLE_MUSIC_KEY],1);assert.equal(f.adds[HALLWAY_MUSIC_KEY],1);
});
