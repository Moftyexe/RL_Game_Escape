import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { guardAnimations } from '../exploration/explorationTestHarness.mjs';
import report from '../../../public/assets/guard/idle/manifest.json' with { type: 'json' };

test('high-resolution Guard frames preserve source, aspect, transparency and foot baseline',async()=>{
 const root=new URL('../../../',import.meta.url),source=await readFile(new URL(report.source,root));
 assert.equal(createHash('sha256').update(source).digest('hex'),report.sha256);assert.deepEqual(report.outputDimensions,[256,256]);assert.equal(report.baseline,249);assert.equal(guardAnimations.GUARD_FOOT_ORIGIN,250/256);
 for(const frame of report.frames){
 const {data,info}=await sharp(await readFile(new URL(`public/assets/guard/idle/${frame.index}.png`,root))).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.deepEqual([info.width,info.height],[256,256]);assert.equal(data[3],0);let bottom=-1;
 for(let p=0;p<256*256;p++)if(data[p*4+3])bottom=Math.max(bottom,Math.floor(p/256));
 assert.equal(bottom,249);assert.ok(Math.abs(frame.resized[0]/frame.resized[1]-frame.alphaBounds.width/frame.alphaBounds.height)<.035);
 }
});
