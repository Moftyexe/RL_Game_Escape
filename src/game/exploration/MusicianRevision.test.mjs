import{verifyOptionalSource}from'../testing/assetProvenance.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import manifest from '../../../public/assets/hallway-manifest.json' with {type:'json'};
import {preloadHallwayAssets,MUSICIAN_IDLE,MUSICIAN_DEPTH} from './hallwayAssets.js';
import {createSchoolFixture}from'./explorationTestHarness.mjs';

test('musician uses replaced source bytes, actual pose count and revisioned keys rather than old textures',async()=>{
 const e=manifest.musician,source=await verifyOptionalSource(e.source,e.sha256),metadata=source?await sharp(source).metadata():{width:e.dimensions[0],height:e.dimensions[1]};
 assert.notEqual(e.sha256,'1e4ad94951af7e216b4963a5035c19c72bf48f1d9391e54a0b87d96ec946a6d0');
 assert.deepEqual(e.dimensions,[metadata.width,metadata.height]);assert.equal(e.sourceHasAlpha,false);assert.equal(e.frames.length,4);assert.ok(e.matteRemoval.removedPixels>0);
 const loads=[];preloadHallwayAssets({load:{audio(){},image:(...a)=>loads.push(a)}});assert.equal(loads.length,e.frames.length);
 assert.ok(loads.every(([key,url])=>key.includes(e.revision)&&url.includes('?v=')));assert.ok(MUSICIAN_IDLE.includes(e.revision));
 for(const frame of e.frames){const png=await readFile('public/'+frame.file);assert.equal(createHash('sha256').update(png).digest('hex'),frame.sha256);const{data,info}=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual([info.width,info.height],[256,256]);assert.equal(data[3],0);let bottom=0;for(let p=0;p<256*256;p++)if(data[p*4+3])bottom=Math.max(bottom,Math.floor(p/256));assert.equal(bottom,249);}
});
test('musician moves nearer wall, zone follows, and Player always renders in front without collision',()=>{
 const{scene}=createSchoolFixture();assert.equal(scene.musician.depth,MUSICIAN_DEPTH);assert.ok(scene.player.depth>scene.musician.depth);assert.equal(scene.musician.body,undefined);
 const zone=scene.interactions.zones.find(z=>z.id==='hallway-musician');assert.equal(zone.x,scene.musician.x);assert.equal(zone.y,scene.musician.y);assert.equal(zone.radius,scene.hallway.musicianRadius);assert.equal(zone.radius,110);
 assert.equal(scene.hallway.musician.y,(375-63)*1.28);scene.player.x=scene.musician.x;scene.player.y=scene.floorBounds.top;scene.keys.right.isDown=true;const x=scene.player.x;scene.update(0,16);assert.ok(scene.player.x>x);assert.ok(scene.player.depth>scene.musician.depth);
});
