import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import manifest from '../../../public/assets/player/movement/run-manifest.json' with {type:'json'};
import {playerAnimations as player} from '../exploration/explorationTestHarness.mjs';
import {silhouetteMask} from '../../../tools/videoRunMask.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
test('active video-derived side run uses eight unique transparent frames and revisioned looping registration',async()=>{
 const selector=JSON.parse(await readFile('P_Animations/active-run-video.json','utf8')),entry=manifest.animations.run_side;
 const extraction=JSON.parse(await readFile('P_Animations/'+entry.source.replace('.png','.json'),'utf8'));
 assert.equal(entry.source,selector.stem+'.png');assert.equal(entry.frames.length,8);assert.equal(entry.frameRate,extraction.frameRate);
 assert.equal(hash(await readFile(extraction.video)),extraction.videoSha256);assert.equal(hash(await readFile(extraction.sheet)),entry.sourceSha256);assert.equal(entry.sourceSha256,extraction.sheetSha256);
 assert.equal(entry.videoSource.sha256,extraction.videoSha256);assert.deepEqual(extraction.sourceIndices,selector.stem==='latest-run-side'?[9,11,13,15,18,20,22,24]:[3,6,8,10,12,15,18,21]);assert.deepEqual(entry.videoSource.sourceIndices,extraction.sourceIndices);
 const hashes=[];for(const frame of entry.frames){const b=await readFile('public/'+frame.file),{data,info}=await sharp(b).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual([info.width,info.height],[256,256]);assert.equal(data[3],0);assert.equal(hash(b),frame.sha256);hashes.push(hash(data));}
 assert.equal(new Set(hashes).size,8);assert.deepEqual(entry.frames.map(f=>f.index),[0,1,2,3,4,5,6,7]);
 const configs=[],loads=[];player.preloadPlayer({load:{image:(key,url)=>loads.push({key,url})}});player.createPlayerAnimations({textures:{get:()=>({setFilter(){}})},anims:{exists:()=>false,create:c=>configs.push(c)}});
 const c=configs.find(c=>c.key==='run-side');assert.equal(c.frames.length,8);assert.equal(c.frameRate,extraction.frameRate);assert.equal(c.repeat,-1);assert.equal(c.skipMissedFrames,false);
 for(const[i,f]of c.frames.entries()){assert.ok(f.key.includes(entry.revision));assert.ok(loads.find(l=>l.key===f.key).url.includes(entry.frames[i].sha256.slice(0,12)));}
 assert.equal(player.RUN_SPEED,400);assert.equal(player.PLAYER_FOOT_ORIGIN,250/256);
});
test('silhouette extraction removes exterior black while retaining enclosed black clothing',()=>{
 const w=64,h=64,rgba=Buffer.alloc(w*h*4);for(let y=10;y<54;y++)for(let x=10;x<54;x++){const p=(y*w+x)*4,v=x<14||x>49||y<14||y>49?40:0;rgba[p]=rgba[p+1]=rgba[p+2]=v;rgba[p+3]=255;}
 const mask=silhouetteMask(rgba,w,h);assert.equal(mask[0],0);assert.equal(mask[32*w+32],1);assert.equal(mask[20*w+20],1);
});
