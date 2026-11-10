import{verifyOptionalSource}from'../testing/assetProvenance.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { ANIMATION_PRESENTATION, animationDuration, animationFrameTime, PRESENTATION_TIMING as T } from './presentationTiming.js';
import manifest from '../../../public/assets/battle/manifest.json' with { type: 'json' };
import { BATTLE_ANIMATIONS, preloadBattleAnimations, createBattleAnimations, initialBattleTexture,
    resolveBattleAnimation, playBattleAction, waitBattlePresentation, restoreBattleStance } from './battleAnimations.js';

function fixture(keys = Object.keys(manifest.animations)) {
    const animations = new Map(keys.map(key => [key, { duration: 600 }]));
    const timers = [], calls = [], textures = new Set();
    for (const [key, entry] of Object.entries(manifest.animations)) entry.frames.forEach((_, i) => textures.add(`${key}-${i}`));
    const scene = {
        events: new EventEmitter(),
        time: { delayedCall(ms, callback) {
            const timer = { ms, removed: false, remove() { this.removed = true; },
                fire() { if (!this.removed) { this.removed = true; callback(); } } };
            timers.push(timer); return timer;
        } },
        anims: { exists: key => animations.has(key), get: key => animations.get(key),
            create: config => animations.set(config.key, config) },
        textures: { exists: key => textures.has(key), get: () => ({ setFilter: value => calls.push(['filter', value]) }) },
        load: { image: (key, url) => calls.push(['load', key, url]) }
    };
    const sprite = new EventEmitter();
    sprite.play = (key, ignorePlaying) => { calls.push(['play', key, ignorePlaying]); return sprite; };
    sprite.setTexture = key => { calls.push(['texture', key]); return sprite; };
    sprite.anims = { stop: () => calls.push(['stop']) };
    return { scene, sprite, calls, timers, animations, textures };
}

test('all inspected skill, attack and reaction mappings exist; missing outcomes stay explicit', () => {
    const expected = { broLockIn: 'player-battle-lock-in', talkSmack: 'player-battle-talk-smack', lookThere: 'player-battle-look-there' };
    for (const [action, key] of Object.entries(expected)) assert.equal(BATTLE_ANIMATIONS.player[action], key);
    for (const id of ['player', 'guard']) for (const [action, key] of Object.entries(BATTLE_ANIMATIONS[id])) {
        if (action === 'stunned') assert.equal(key, null);
        else assert.ok(manifest.animations[key], id + ':' + action);
    }
});

test('preloader queues all 147 individual PNG frames with unique texture keys', () => {
    const f = fixture(); preloadBattleAnimations(f.scene);
    const loads = f.calls.filter(call => call[0] === 'load');
    assert.equal(loads.length, 147);
    assert.equal(new Set(loads.map(call => call[1])).size, 147);
    assert.ok(loads.every(call => call[2].endsWith('.png')));
});

test('partial missing frames skip that animation rather than registering a broken one', () => {
    const f = fixture([]); f.textures.delete('guard-battle-attack-2');
    createBattleAnimations(f.scene, 1);
    assert.equal(f.animations.size, 26);
    assert.equal(f.animations.has('guard-battle-attack'), false);
    assert.equal(f.animations.get('player-battle-idle').repeat, -1);
    assert.equal(f.animations.get('player-battle-attack').repeat, 0);
    createBattleAnimations(f.scene, 1);
    assert.equal(f.animations.size, 26);
});

test('registered Phaser frame durations include the base tick and exactly match presentation timing', () => {
    const f = fixture([]); createBattleAnimations(f.scene, 1);
    for (const [key, profile] of Object.entries(ANIMATION_PRESENTATION)) {
        const registered = f.animations.get(key), entry = manifest.animations[key];
        assert.equal(registered.frames[profile.holdFrame].duration, 1000 / entry.frameRate + profile.holdMs);
        const actualDuration = registered.frames.reduce((sum, frame) => sum + (frame.duration || 1000 / entry.frameRate), 0);
        assert.equal(actualDuration, animationDuration(entry, key));
    }
});

test('Talk Smack omits fourth human pose, preserves fifth and sixth, 8FPS and total action duration',()=>{
 const f=fixture([]);createBattleAnimations(f.scene,1);const config=f.animations.get('player-battle-talk-smack');
 assert.deepEqual(config.frames.map(f=>f.key),[0,1,2,4,5].map(i=>'player-battle-talk-smack-'+i));
 assert.equal(config.frames.length,5);assert.equal(config.frames.length,manifest.animations['player-battle-talk-smack'].frames.length-1);
 assert.equal(config.frameRate,8);assert.equal(animationDuration(manifest.animations['player-battle-talk-smack'],'player-battle-talk-smack'),2125);
 assert.equal(animationFrameTime(manifest.animations['player-battle-talk-smack'],'player-battle-talk-smack',2),250);
});

test('Call Wife motion stays at 10 FPS and phone hold is supplied per dialogue',()=>{
 const entry=manifest.animations['guard-battle-call-wife'];assert.equal(entry.frameRate,10);
 assert.equal(ANIMATION_PRESENTATION['guard-battle-call-wife'].holdMs,0);
 assert.equal(animationFrameTime(entry,'guard-battle-call-wife',4),400);
});

test('initial idle texture is optional, including a fully missing idle asset', () => {
    const f = fixture();
    assert.equal(initialBattleTexture(f.scene, 'player'), 'player-battle-idle-0');
    f.textures.delete('player-battle-idle-0');
    assert.equal(initialBattleTexture(f.scene, 'player'), null);
    assert.equal(initialBattleTexture(f.scene, 'unknown'), null);
});

test('dedicated criticals apply only to basic attacks; missing skills stay idle', () => {
    const f = fixture();
    for (const id of ['player', 'guard']) {
        assert.equal(resolveBattleAnimation(f.scene, id, 'attack', { critical: true }), id + '-battle-critical');
        f.animations.delete(id + '-battle-critical');
        assert.equal(resolveBattleAnimation(f.scene, id, 'attack', { critical: true }), id + '-battle-attack');
    }
    assert.equal(resolveBattleAnimation(f.scene, 'player', 'swingBackpack', { critical: true }), 'player-battle-backpack');
    f.animations.delete('player-battle-backpack');
    assert.equal(resolveBattleAnimation(f.scene, 'player', 'swingBackpack', { critical: true }), 'player-battle-idle');
});

test('temporary attack waits for completion, then returns to continuous idle and cleans listeners', async () => {
    const f = fixture();
    const action = playBattleAction(f.scene, f.sprite, 'player', 'attack');
    assert.equal(action.temporary, true);
    assert.equal(action.impactMs, 300);
    assert.equal(f.calls.at(-1)[1], 'player-battle-attack');
    f.sprite.emit('animationcomplete-player-battle-attack');
    await action.finished;
    assert.deepEqual(f.calls.at(-1), ['play', 'player-battle-idle', true]);
    assert.equal(f.sprite.listenerCount('animationcomplete-player-battle-attack'), 0);
    assert.equal(f.scene.events.listenerCount('shutdown'), 0);
    assert.ok(f.timers.every(timer => timer.removed));
});

test('unmapped skill keeps idle playing and needs no completion event', async () => {
    const f = fixture();
    const action = playBattleAction(f.scene, f.sprite, 'player', 'missing-skill');
    await action.finished;
    assert.equal(action.temporary, false);
    assert.equal(action.impactMs, 0);
    assert.deepEqual(f.calls.at(-1), ['play', 'player-battle-idle', true]);
    assert.equal(f.timers.length, 0);
});

test('fully missing animations and placeholder objects never throw or wait forever', async () => {
    const f = fixture([]);
    await playBattleAction(f.scene, f.sprite, 'player', 'attack').finished;
    await playBattleAction(f.scene, {}, 'guard', 'eatDonut').finished;
    await playBattleAction(f.scene, f.sprite, 'unknown', 'unknown').finished;
    assert.equal(f.calls.length, 0);
});

test('missing attack gracefully falls back to idle even on criticals', async () => {
    const f = fixture(['guard-battle-idle']);
    const action = playBattleAction(f.scene, f.sprite, 'guard', 'attack', { critical: true });
    await action.finished;
    assert.equal(action.key, 'guard-battle-idle');
    assert.equal(action.temporary, false);
});

test('cosmetic playback failure recovers to idle without throwing', async () => {
    const f = fixture();
    f.sprite.play = key => {
        if (key === 'player-battle-attack') throw new Error('Cosmetic asset disappeared');
        f.calls.push(['play', key]);
    };
    await playBattleAction(f.scene, f.sprite, 'player', 'attack').finished;
    assert.deepEqual(f.calls.at(-1), ['play', 'player-battle-idle']);
    assert.equal(f.scene.events.listenerCount('shutdown'), 0);
});

test('watchdog releases a stuck animation, stops it and resumes idle', async () => {
    const f = fixture();
    const action = playBattleAction(f.scene, f.sprite, 'guard', 'attack');
    f.timers[0].fire();
    await action.finished;
    assert.deepEqual(f.calls.at(-2), ['stop']);
    assert.deepEqual(f.calls.at(-1), ['play', 'guard-battle-idle', true]);
    assert.equal(f.scene.events.listenerCount('shutdown'), 0);
});

test('final presentation mode holds its final pose instead of automatically resuming idle', async () => {
    const f = fixture();
    const action = playBattleAction(f.scene, f.sprite, 'player', 'defend', { returnToIdle: false });
    f.sprite.emit('animationcomplete-player-battle-defend');
    await action.finished;
    assert.deepEqual(f.calls.at(-1), ['texture', 'player-battle-defend-3']);
});

test('missing victory/defeat assets leave each character in idle', async () => {
    const f = fixture(['player-battle-idle', 'guard-battle-idle']);
    f.scene.combat = { player: { defending: true }, guard: { defending: true } };
    for (const id of ['player', 'guard']) for (const action of ['victory', 'defeat']) {
        await playBattleAction(f.scene, f.sprite, id, action, { returnToIdle: false }).finished;
        assert.equal(f.calls.at(-1)[1], `${id}-battle-idle`);
    }
});

test('shutdown releases pending playback and timing without restarting a destroyed scene', async () => {
    const f = fixture();
    const action = playBattleAction(f.scene, f.sprite, 'player', 'attack');
    const wait = waitBattlePresentation(f.scene, 300);
    f.scene.events.emit('shutdown');
    await action.finished;
    assert.equal(await wait, false);
    assert.equal(f.calls.at(-1)[1], 'player-battle-attack');
    assert.ok(f.timers.every(timer => timer.removed));
    assert.equal(f.scene.events.listenerCount('shutdown'), 0);
});

test('presentation wait completes normally and removes its shutdown listener', async () => {
    const f = fixture();
    const wait = waitBattlePresentation(f.scene, 300);
    f.timers[0].fire();
    assert.equal(await wait, true);
    assert.equal(f.scene.events.listenerCount('shutdown'), 0);
});

test('processed battle PNGs preserve source files, dimensions, transparent padding and foot baseline', async () => {
    const root = new URL('../../../', import.meta.url);
    const report = JSON.parse(await readFile(new URL('public/assets/battle/inspection.json', root)));
    let count = 0;
    for (const sheet of report.sheets) {
        await verifyOptionalSource(new URL(sheet.source,root),sheet.sha256);
        for (const frame of sheet.frames) {
            if (sheet.manualRegions) {
                const [left, top, width, height] = sheet.manualRegions[frame.index];
                assert.ok(frame.alphaBounds.left > left && frame.alphaBounds.left + frame.alphaBounds.width < left + width, sheet.source);
                assert.ok(frame.alphaBounds.top > top && frame.alphaBounds.top + frame.alphaBounds.height < top + height, sheet.source);
            }
            const url = `public/assets/battle/${sheet.character}/${sheet.action}/${frame.index}.png`;
            const { data, info } = await sharp(await readFile(new URL(url, root))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
            assert.deepEqual([info.width, info.height], [192, 160]);
            assert.equal(data[3], 0);
            let top = 160, bottom = -1;
            for (let p = 0; p < 192 * 160; p++) if (data[p * 4 + 3]) {
                const y = Math.floor(p / 192); top = Math.min(top, y); bottom = Math.max(bottom, y);
            }
            assert.equal(bottom, 155, url);
            assert.ok(bottom - top + 1 >= (['stumble','recovery'].includes(sheet.action) ? 45 : sheet.action === 'defeat' ? 105 : 120) && bottom - top + 1 <= 144, url);
            assert.ok(Math.abs(frame.resized[0] / frame.resized[1] - frame.alphaBounds.width / frame.alphaBounds.height) < 0.035, url);
            assert.ok(Math.abs(frame.footCenter - 96) <= 0.5, url);
            count++;
        }
    }
    assert.equal(count, 147);
});

test('defense restores its final pose until the authoritative flag is consumed', () => {
    const f = fixture(); f.scene.combat = { player: { defending: true } };
    restoreBattleStance(f.scene, f.sprite, 'player');
    assert.deepEqual(f.calls.at(-1), ['texture', 'player-battle-defend-3']);
    f.scene.combat.player.defending = false;
    restoreBattleStance(f.scene, f.sprite, 'player');
    assert.deepEqual(f.calls.at(-1), ['play', 'player-battle-idle', true]);
});

test('missing defend art keeps idle even while the mechanic is active', () => {
    const f = fixture(['guard-battle-idle']); f.scene.combat = { guard: { defending: true } };
    restoreBattleStance(f.scene, f.sprite, 'guard');
    assert.deepEqual(f.calls.at(-1), ['play', 'guard-battle-idle', true]);
});

test('terminal playback option holds final texture without returning to idle', async () => {
    const f = fixture();
    // Exercise the same terminal option using a real finite animation because
    // dedicated outcome source art does not exist yet.
    const action = playBattleAction(f.scene, f.sprite, 'guard', 'hurt', { returnToIdle: false });
    f.sprite.emit('animationcomplete-guard-battle-hurt'); await action.finished;
    assert.deepEqual(f.calls.at(-1), ['texture', 'guard-battle-hurt-3']);
    assert.equal(f.calls.some(c => c[0] === 'play' && c[1] === 'guard-battle-idle'), false);
});

test('Riled loops after Hurt while normal Distracted returns to ordinary idle',async()=>{
 for(const name of ['RILED','DISTRACTED']){const f=fixture();f.scene.combat={guard:{status:{name},defending:false}};
 const expected=name==='RILED'?'guard-battle-riled':'guard-battle-idle';
 restoreBattleStance(f.scene,f.sprite,'guard');assert.equal(f.calls.at(-1)[1],expected);
 const hurt=playBattleAction(f.scene,f.sprite,'guard','hurt');f.sprite.emit('animationcomplete-guard-battle-hurt');await hurt.finished;assert.equal(f.calls.at(-1)[1],expected);
 f.scene.combat.guard.defending=true;restoreBattleStance(f.scene,f.sprite,'guard');assert.deepEqual(f.calls.at(-1),['texture','guard-battle-defend-3']);}
});
for(const [id,action,count] of [['player','victory',5],['guard','victory',5],['guard','defeat',6]])test(`${id} ${action} plays once and holds terminal pose`,async()=>{
 const f=fixture(),key=`${id}-battle-${action}`;assert.equal(manifest.animations[key].repeat,0);const result=playBattleAction(f.scene,f.sprite,id,action,{returnToIdle:false});f.sprite.emit('animationcomplete-'+key);await result.finished;assert.deepEqual(f.calls.at(-1),['texture',key+'-'+(count-1)]);
});
test('Player defeat uses the new five-frame sheet and holds its final frame',async()=>{
 const f=fixture();assert.equal(BATTLE_ANIMATIONS.player.defeat,'player-battle-defeat');
 const result=playBattleAction(f.scene,f.sprite,'player','defeat',{returnToIdle:false});f.sprite.emit('animationcomplete-player-battle-defeat');await result.finished;assert.deepEqual(f.calls.at(-1),['texture','player-battle-defeat-4']);
});

test('OFF_GUARD plays once through looking-away pose, never registers the neutral return frame',async()=>{
 const f=fixture([]);createBattleAnimations(f.scene,1);const animation=f.animations.get('guard-battle-distracted');
 assert.equal(animation.repeat,0);assert.equal(animation.frames.length,3);assert.equal(animation.frames.at(-1).key,'guard-battle-distracted-2');
 f.scene.combat={guard:{status:null,offGuard:true,defending:false}};
 restoreBattleStance(f.scene,f.sprite,'guard');f.sprite.emit('animationcomplete-guard-battle-distracted');await Promise.resolve();
 for(let i=0;i<3;i++)restoreBattleStance(f.scene,f.sprite,'guard');
 assert.equal(f.calls.filter(c=>c[0]==='play'&&c[1]==='guard-battle-distracted').length,1);assert.deepEqual(f.calls.at(-1),['texture','guard-battle-distracted-2']);
 f.scene.combat.guard.offGuard=false;f.scene.combat.guard.status=null;restoreBattleStance(f.scene,f.sprite,'guard');assert.deepEqual(f.calls.at(-1),['play','guard-battle-idle',true]);
});
test('clearing OFF_GUARD during transition cancels its stale final-frame callback',async()=>{
 for(const name of [null,'RILED']){const f=fixture();f.scene.combat={guard:{status:null,offGuard:true}};restoreBattleStance(f.scene,f.sprite,'guard');
 f.scene.combat.guard.offGuard=false;f.scene.combat.guard.status=name?{name}:null;restoreBattleStance(f.scene,f.sprite,'guard');await Promise.resolve();
 for(const timer of f.timers)timer.fire();assert.equal(f.calls.at(-1)[1],name?'guard-battle-riled':'guard-battle-idle');}
});
test('terminal visual state overrides Defend and status, and cannot return to idle',async()=>{
 const f=fixture();f.scene.combat={turnState:'VICTORY',guard:{defending:true,status:{name:'DISTRACTED'}}};
 restoreBattleStance(f.scene,f.sprite,'guard');assert.equal(f.calls.at(-1)[1],'guard-battle-defeat');
 restoreBattleStance(f.scene,f.sprite,'guard');assert.equal(f.calls.filter(c=>c[0]==='play').length,1);
 f.sprite.emit('animationcomplete-guard-battle-defeat');await Promise.resolve();restoreBattleStance(f.scene,f.sprite,'guard',{forceIdle:true});
 assert.deepEqual(f.calls.at(-1),['texture','guard-battle-defeat-5']);assert.equal(f.calls.some(c=>c[1]==='guard-battle-idle'),false);
});
test('missing terminal textures cannot recurse or block stance restoration',()=>{const f=fixture([]);f.scene.combat={turnState:'DEFEAT',player:{}};assert.doesNotThrow(()=>restoreBattleStance(f.scene,f.sprite,'player'));});

test('Hurt while OFF_GUARD returns to held away frame; clearing restores RILED',async()=>{
 const f=fixture();f.scene.combat={guard:{offGuard:true,defending:true,status:{name:'RILED'}}};restoreBattleStance(f.scene,f.sprite,'guard');f.sprite.emit('animationcomplete-guard-battle-distracted');await Promise.resolve();
 assert.deepEqual(f.calls.at(-1),['texture','guard-battle-distracted-2']);const hurt=playBattleAction(f.scene,f.sprite,'guard','hurt');f.sprite.emit('animationcomplete-guard-battle-hurt');await hurt.finished;assert.deepEqual(f.calls.at(-1),['texture','guard-battle-distracted-2']);
 f.scene.combat.guard.offGuard=false;f.scene.combat.guard.defending=false;restoreBattleStance(f.scene,f.sprite,'guard');assert.deepEqual(f.calls.at(-1),['play','guard-battle-riled',true]);
});
