import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import audit from '../../../public/assets/player/movement/run-audit.json' with { type:'json' };
import manifest from '../../../public/assets/player/movement/run-manifest.json' with { type:'json' };
import processing from '../../../public/assets/player/movement/processing-report.json' with { type:'json' };
import { playerAnimations as player } from '../exploration/explorationTestHarness.mjs';
const root=new URL('../../../',import.meta.url),hash=data=>createHash('sha256').update(data).digest('hex');
for(const animation of audit.animations)test(`${animation.folder} audit verifies source, every output hash/crop, contiguous order and unique pixels`,async()=>{
 const entry=manifest.animations[animation.folder],source=await readFile(new URL('P_Animations/'+entry.source,root));
 assert.equal(hash(source),entry.sourceSha256);assert.equal(entry.sourceSha256,animation.sourceSha256);assert.ok(animation.sourceMatchesProcessingReport);assert.ok(animation.cropsMatchManifest);
 assert.ok(animation.noSkippedOrReusedIndexes);assert.ok(animation.contiguousFiles);assert.deepEqual(animation.exactDuplicates,[]);assert.deepEqual(animation.pixelExactDuplicates,[]);
 const indexes=Array.from({length:entry.frames.length},(_,i)=>i);assert.deepEqual(animation.playbackOrder,indexes);
 assert.deepEqual(entry.frames.map(f=>f.index),indexes);assert.deepEqual(entry.frames.map(f=>f.sourcePoseIndex),indexes);
 const files=(await readdir(new URL(`public/assets/player/movement/${animation.folder}/`,root))).filter(n=>/^\d+\.png$/.test(n));assert.equal(files.length,indexes.length);
 const hashes=[];for(const frame of animation.frames){const png=await readFile(new URL(frame.file,root));const raw=await sharp(png).ensureAlpha().raw().toBuffer();assert.equal(hash(png),frame.sha256);assert.equal(hash(raw),frame.rawSha256);assert.equal(frame.sha256,entry.frames[frame.index].sha256);assert.equal(frame.sourcePose.isolatedSha256,entry.frames[frame.index].sourceCropSha256);hashes.push(hash(png));}
 assert.equal(new Set(hashes).size,indexes.length);assert.equal(animation.transitions.length,indexes.length);assert.equal(animation.transitions.at(-1).to,0);
});
test('run anchoring preserves source vertical coordinates and centers the head rather than extended legs',()=>{
 for(const sheet of processing.sheets.filter(s=>s.animation?.startsWith('run_'))){for(const frame of sheet.frames){assert.ok(Math.abs(frame.headCenterX-128)<=.5);assert.ok(Math.abs(frame.placement.top-(frame.sampling?.trim.top??0)+Math.round((sheet.sourceFloor-frame.alphaBounds.top)*frame.sourceScale)-250)<=1);assert.ok(frame.placement.left>=0&&frame.placement.left+frame.resized[0]<=256);assert.ok(frame.baseline<=249);}}
 for(const animation of audit.animations){assert.ok(animation.geometry.headTopRange[1]-animation.geometry.headTopRange[0]<=5);assert.ok(animation.geometry.headCenterRange[0]>=127.5&&animation.geometry.headCenterRange[1]<=128.5);}
});
test('run loaders use current content hashes and registration replaces stale run animations only',()=>{
 const loaded=[];player.preloadPlayer({load:{image:(key,url)=>loaded.push({key,url})}});
 const old=new Map(player.PLAYER_ANIMATIONS.map(a=>[a.key,{frames:[{key:'legacy-run-key'}]}]));const originalIdle=old.get('idle-down'),removed=[];
 player.createPlayerAnimations({textures:{get:()=>({setFilter(){}})},anims:{exists:key=>old.has(key),remove:key=>{removed.push(key);old.delete(key);},create:config=>old.set(config.key,config)}});
 assert.deepEqual(removed.sort(),audit.animations.map(a=>a.folder.replace('_','-')).sort());assert.equal(old.get('idle-down'),originalIdle);
 for(const animation of audit.animations){const entry=manifest.animations[animation.folder],registered=old.get(animation.folder.replace('_','-'));assert.equal(registered.skipMissedFrames,false);assert.equal(registered.frameRate,entry.frameRate??12);for(const [i,frame]of registered.frames.entries()){const load=loaded.find(l=>l.key===frame.key);assert.ok(frame.key.includes(entry.revision));assert.ok(load.url.endsWith(entry.frames[i].file+'?v='+entry.frames[i].sha256.slice(0,12)));}}
});
