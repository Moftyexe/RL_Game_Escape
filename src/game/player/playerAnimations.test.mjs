import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { playerAnimations as player } from '../exploration/explorationTestHarness.mjs';
import counts from '../../../public/assets/player/movement/manifest.json' with { type: 'json' };
import runManifest from '../../../public/assets/player/movement/run-manifest.json' with { type: 'json' };
import report from '../../../public/assets/player/movement/processing-report.json' with { type: 'json' };

test('run registrations use actual manifest counts and direction-specific FPS; idle/walk art stays available', () => {
    const calls = [], loaded = [];
    player.preloadPlayer({ load: { image: (key, url) => loaded.push({ key, url }) } });
    player.createPlayerAnimations({ textures: { get: () => ({ setFilter: value => assert.equal(value, 1) }) },
        anims: { exists: () => false, create: config => calls.push(config) } });
    assert.equal(loaded.length, Object.values(counts).reduce((a, b) => a + b, 0));
    assert.equal(new Set(loaded.map(entry => entry.key)).size, loaded.length);
    assert.equal(calls.length, 9);
    for (const [key, frames, fps] of ['run_side','run_down','run_up'].map(folder=>[folder.replace('_','-'),counts[folder],runManifest.animations[folder].frameRate??12])) {
        const animation = calls.find(entry => entry.key === key);
        assert.equal(animation.frames.length, frames); assert.equal(animation.frameRate, fps); assert.equal(animation.repeat, -1);
    }
    assert.equal(calls.find(entry => entry.key === 'idle-side').frameRate, 4);
    assert.equal(player.RUN_SPEED, 400); assert.equal(player.PLAYER_FOOT_ORIGIN, 250 / 256);
});

test('all movement frames match reports, source hashes, transparency, centering and a fixed visible baseline', async () => {
    const root = new URL('../../../', import.meta.url);
    let exported = 0;
    for (const sheet of report.sheets) {
        const source = await readFile(new URL('P_Animations/' + sheet.source, root));
        assert.equal(createHash('sha256').update(source).digest('hex'), sheet.sha256);
        if (!sheet.animation) continue;
        assert.equal(sheet.exportedFrames, counts[sheet.animation]);
        const files = await readdir(new URL('public/assets/player/movement/' + sheet.animation + '/', root));
        assert.equal(files.filter(name => /^\d+\.png$/.test(name)).length, counts[sheet.animation]);
        for (const frame of sheet.frames) {
            const { data, info } = await sharp(await readFile(new URL(`public/assets/player/movement/${sheet.animation}/${frame.index}.png`, root)))
                .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
            assert.deepEqual([info.width, info.height], [256, 256]);
            let left = 256, right = -1, top = 256, bottom = -1;
            for (let p = 0; p < 256 * 256; p++) if (data[p * 4 + 3]) {
                const x = p % 256, y = Math.floor(p / 256);
                left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
            }
            assert.equal(data[3], 0); assert.equal(bottom, frame.baseline); assert.ok(bottom <= 249);
            if (!sheet.animation.startsWith('run_')) assert.ok(Math.abs((left + right + 1) / 2 - 128) <= 0.5);
            else assert.ok(Math.abs(frame.headCenterX-128)<=0.5);
            assert.deepEqual([right - left + 1, bottom - top + 1], frame.resized);
            assert.ok(Math.abs(frame.resized[0] / frame.resized[1] - frame.alphaBounds.width / frame.alphaBounds.height) < 0.035);
            exported++;
        }
    }
    assert.equal(exported, Object.values(counts).reduce((a, b) => a + b, 0));
});

test('current run sources and frame counts agree across processing and runtime metadata',()=>{
 for(const [folder,entry] of Object.entries(runManifest.animations)){const sheet=report.sheets.find(s=>s.animation===folder);assert.equal(entry.source,sheet.source);assert.equal(entry.sourceSha256,sheet.sha256);assert.equal(entry.frames.length,sheet.detectedFrames);assert.equal(entry.frames.length,counts[folder]);}
});

test('running poses use one body scale per source sheet, preserving head size through crouches',()=>{
 for(const sheet of report.sheets.filter(s=>s.animation?.startsWith('run_'))){
 assert.equal(sheet.normalizationReferenceHeight,Math.max(...sheet.frames.map(f=>f.alphaBounds.top+f.alphaBounds.height))-Math.min(...sheet.frames.map(f=>f.alphaBounds.top)));
 for(const frame of sheet.frames){
  assert.equal(frame.sourceScale,240/sheet.normalizationReferenceHeight);
  assert.ok(Math.abs(frame.sampling.height-frame.alphaBounds.height*frame.sourceScale)<=.5);
  assert.equal(frame.resized[1],frame.sampling.height-frame.sampling.trim.top-frame.sampling.trim.bottom);
 }
 }
});


test('run registration uses every versioned frame once, uniform cadence and no catch-up skipping',()=>{
 const calls=[];player.createPlayerAnimations({textures:{get:()=>({setFilter(){}})},anims:{exists:()=>false,create:c=>calls.push(c)}});
 for(const [folder,entry] of Object.entries(runManifest.animations)){
 const animation=calls.find(c=>c.key===folder.replace('_','-'));assert.equal(animation.frames.length,entry.frames.length);assert.equal(new Set(animation.frames.map(f=>f.key)).size,entry.frames.length);
 assert.equal(animation.frameRate,entry.frameRate??12);assert.equal(animation.repeat,-1);assert.equal(animation.skipMissedFrames,false);
 assert.ok(animation.frames.every((frame,i)=>frame.key.endsWith('-'+entry.revision+'-'+i)&&!frame.duration));
 }
});
