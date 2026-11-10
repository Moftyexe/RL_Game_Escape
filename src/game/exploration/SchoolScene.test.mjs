import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { HALLWAY, createHallwayLayout } from './hallwayLayout.js';
import { createSchoolFixture } from './explorationTestHarness.mjs';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test('measured crop fits the current opaque BG and layout aligns source landmarks with world coordinates', async () => {
    const metadata = await sharp(await readFile(new URL('../../../public/assets/environment/hallway.png', import.meta.url))).metadata();
    assert.deepEqual([metadata.width, metadata.height], [2048, 688]);
    assert.ok(HALLWAY.crop.x + HALLWAY.crop.width <= metadata.width);
    assert.ok(HALLWAY.crop.y + HALLWAY.crop.height <= metadata.height);
    const layout = createHallwayLayout(1024, 768);
    close(layout.backgroundScale, 1.28); close(layout.worldWidth, 2575.36); close(layout.worldHeight, 768);
    close(layout.player.x, 290.56); close(layout.player.y, 520.96);
    close(layout.guard.x, 2396.16); close(layout.guard.y, 546.56);
    close(layout.floor.top, 431.36); close(layout.floor.bottom, 623.36);
    close(layout.player.scale, 0.675); close(layout.guard.scale, 0.74);
});

test('scene uses shared feet origins/scales, tracks Player smoothly, and bounds the camera to the cropped room', () => {
    const { scene, calls, room } = createSchoolFixture();
    assert.deepEqual(room(), HALLWAY.crop);
    assert.deepEqual(scene.player.origin, [0.5, 125 / 128]);
    assert.deepEqual(scene.guard.origin, [0.5, 125 / 128]);
    close(scene.player.scale, 0.675); close(scene.guard.scale, 0.74);
    const bounds = calls.find(call => call[0] === 'cameraBounds');
    close(bounds[3], 2575.36); close(bounds[4], 768);
    assert.deepEqual(calls.find(call => call[0] === 'cameraFollow').slice(2), [true, 0.12, 0.12]);
    assert.ok(scene.player.x < scene.scale.width / 2);
    assert.ok(scene.guard.x - (scene.hallway.worldWidth - scene.scale.width) < scene.scale.width - 100);
});

test('WASD/arrow movement always uses the new directional runs, mirrors left, and returns to last-facing idle without changing scale', () => {
    const { scene } = createSchoolFixture();
    for (const [direction, key, flip] of [['right', 'side', false], ['left', 'side', true], ['up', 'up', false], ['down', 'down', false]]) {
        scene.cursors[direction].isDown = true; scene.update(0, 16);
        assert.equal(scene.player.animation, 'run-' + key); assert.equal(scene.player.flipX, flip);
        scene.cursors[direction].isDown = false; scene.update(0, 16);
        assert.equal(scene.player.animation, 'idle-' + key); assert.equal(scene.player.flipX, flip);
        close(scene.player.scale, 0.675); assert.deepEqual(scene.player.origin, [0.5, 125 / 128]);
    }
    scene.keys.right.isDown = true; scene.update(0, 16); assert.equal(scene.player.animation, 'run-side');
    scene.keys.right.isDown = false; scene.update(0, 16); assert.equal(scene.player.animation, 'idle-side');
});

test('cardinal/diagonal movement both remain 400 px/s, without a Shift requirement', () => {
    for (const diagonal of [false, true]) {
        const { scene } = createSchoolFixture();
        const { x, y } = scene.player;
        scene.keys.right.isDown = true;
        scene.keys.down.isDown = diagonal; scene.update(0, 50);
        close(Math.hypot(scene.player.x - x, scene.player.y - y), 20);
    }
});

test('Player stays within measured floor and perspective side bounds at every hallway edge', () => {
    const { scene } = createSchoolFixture();
    // Isolate floor math; proximity stopping is covered by the gate tests below.
    scene.gateTrigger={x:-1000000,y:-1000000,radius:0};
    scene.keys.up.isDown = true; for (let i = 0; i < 100; i++) scene.update(0, 50);
    close(scene.player.y, scene.floorBounds.top);
    scene.keys.up.isDown = false; scene.keys.left.isDown = true;
    for (let i = 0; i < 200; i++) scene.update(0, 50);
    close(scene.player.x, scene.floorBounds.topLeft + scene.hallway.halfFootprint);
    scene.keys.left.isDown = false; scene.keys.down.isDown = true;
    for (let i = 0; i < 100; i++) scene.update(0, 50);
    close(scene.player.y, scene.floorBounds.bottom);
    scene.keys.down.isDown = false; scene.keys.right.isDown = true;
    for (let i = 0; i < 300; i++) scene.update(0, 50);
    close(scene.player.x, scene.floorBounds.bottomRight - scene.hallway.halfFootprint);
    scene.update(0, 16); assert.equal(scene.player.animation, 'idle-side');
});

test('proximity automatically locks exploration for dialogue, then launches battle once with day metadata', () => {
    const { scene, calls } = createSchoolFixture();
    const zone = scene.gateTrigger;
    close(zone.x, scene.guard.x); close(zone.y, scene.guard.y); close(zone.radius, 150);
    scene.update(0, 16);
    assert.equal(scene.interactionPrompt.visible, false);
    assert.equal(calls.some(call => call[0] === 'launch'), false);
    scene.player.x = scene.guard.x - 151; scene.player.y = scene.guard.y;scene.update(0,16);assert.equal(scene.storyDialogue.active,false);
    scene.player.x = scene.guard.x - 140;
    scene.update(0, 16);
    assert.equal(scene.interactionPrompt.visible, false);
    assert.equal(calls.some(call => call[0] === 'launch'), false);
    assert.equal(scene.keys.interact.fresh,false);scene.update(0, 16); scene.update(0, 16);scene.startGateEncounter();
    assert.equal(scene.storyDialogue.active,true);assert.equal(scene.inputLocked,true);assert.equal(calls.filter(call=>call[0]==='launch').length,0);
    const x=scene.player.x;scene.keys.left.isDown=true;scene.update(0,16);assert.equal(scene.player.x,x);
    while(scene.storyDialogue.active)scene.storyDialogue.advance();assert.equal(calls.filter(call=>call[0]==='launch').length,0);scene.advanceTime(699);assert.equal(calls.filter(call=>call[0]==='launch').length,0);scene.advanceTime(1);
    assert.equal(calls.filter(call => call[0] === 'launch').length, 1);
    const launch=calls.find(call=>call[0]==='launch');assert.equal(launch[1],'BattleScene');assert.equal(launch[2].returnScene,'SchoolScene');assert.equal(launch[2].runContext.dayNumber,1);assert.equal(launch[2].runContext.readinessTier,1);assert.equal(launch[2].encounterId,1);
    assert.equal(calls.filter(call => call[0] === 'pause').length, 1);
});
test('retry and new-day exploration reset automatic gate trigger while retaining day/readiness',()=>{
 const game={};
 for(const[outcome,expectedDay]of [['DEFEAT',1],['VICTORY',1],['RETRY',2]]){
  const{scene,calls}=createSchoolFixture({game});assert.equal(scene.runState.dayNumber,expectedDay);assert.equal(scene.gateBusy,false);scene.player.x=scene.guard.x-100;scene.player.y=scene.guard.y;scene.update(0,16);assert.equal(scene.storyDialogue.active,true);while(scene.storyDialogue.active)scene.storyDialogue.advance();scene.advanceTime(700);const launch=calls.find(c=>c[0]==='launch')[2];assert.equal(launch.runContext.dayNumber,expectedDay);assert.equal(launch.runContext.readinessTier,expectedDay);scene.runState.completeEncounter(launch.encounterId,outcome);scene.events.emit('shutdown');
 }
});

test('hallway shadows are subtle, wider for Guard, and stay behind both sprites',()=>{
 const {scene,shadows}=createSchoolFixture();assert.equal(shadows.length,3);
 for(const [shadow,actor] of [[scene.playerShadow,scene.player],[scene.guardShadow,scene.guard]]){
 close(shadow.x,actor.x);close(shadow.y,actor.y+2);assert.ok(shadow.depth<actor.depth);assert.equal(shadow.alpha,.26);assert.equal(shadow.color,0x030712);assert.ok(shadow.width>shadow.height*4);
 }
 assert.ok(scene.guardShadow.width>scene.playerShadow.width);
});
test('hallway shadows follow feet while moving, stopping and at floor bounds',()=>{
 const {scene}=createSchoolFixture();scene.keys.right.isDown=true;scene.keys.down.isDown=true;
 for(let i=0;i<100;i++)scene.update(0,16);
 close(scene.playerShadow.x,scene.player.x);close(scene.playerShadow.y,scene.player.y+2);
 scene.keys.right.isDown=false;scene.keys.down.isDown=false;scene.update(0,16);
 close(scene.playerShadow.x,scene.player.x);close(scene.playerShadow.y,scene.player.y+2);
 scene.guard.x-=10;scene.guard.y-=5;scene.update(0,16);close(scene.guardShadow.x,scene.guard.x);close(scene.guardShadow.y,scene.guard.y+2);
});
