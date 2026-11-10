import{verifyOptionalSource}from'../testing/assetProvenance.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import sharp from 'sharp';
import manifest from '../../../public/assets/portraits/manifest.json' with {type:'json'};
import {PORTRAITS} from './portraits.js';import {SchoolScene,createSchoolFixture} from '../exploration/explorationTestHarness.mjs';import DialogueBox from './DialogueBox.js';
test('SchoolScene actually preloads both existing transparent portrait PNGs without editing source bytes',async()=>{
 const scene=new SchoolScene(),requests=[];scene.load={image:(...a)=>requests.push(a),audio(){}};scene.preload();
 for(const id of ['player','guard']){const p=manifest[id],source=await verifyOptionalSource(p.source,p.sha256),runtime=await readFile('public/'+p.file);if(source)assert.deepEqual(source,runtime);assert.equal(createHash('sha256').update(runtime).digest('hex'),p.sha256);const m=await sharp(runtime).metadata();assert.equal(m.format,'png');assert.equal(m.hasAlpha,true);assert.deepEqual([m.width,m.height],[p.width,p.height]);assert.ok(p.transparentPixels>0);assert.ok(requests.some(([key,url])=>key===PORTRAITS[id].textureKey&&url.endsWith(p.file)));}
});
test('portrait renderer fits real dimensions proportionally and applies nearest filtering on speaker switch',()=>{
 const{scene}=createSchoolFixture(),image=scene.add.image,filters=[];
 scene.add.image=(x,y,key)=>{const value=image(x,y,key),p=key===PORTRAITS.guard.textureKey?manifest.guard:manifest.player;value.width=p.width;value.height=p.height;return value;};scene.textures.get=()=>({setFilter:v=>filters.push(v)});
 const box=new DialogueBox(scene);box.start([{speaker:'guard',text:'Stop.'},{speaker:'player',text:'Home.'}]);
 for(const id of ['guard','player']){assert.equal(box.image.texture,PORTRAITS[id].textureKey);assert.ok(box.image.displayWidth<=184+1e-9);assert.ok(box.image.displayHeight<=164+1e-9);assert.ok(Math.abs(box.image.displayWidth/box.image.displayHeight-manifest[id].width/manifest[id].height)<1e-9);box.advance();box.advance();}
 assert.deepEqual(filters,[1,1]);
});
