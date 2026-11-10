import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {runStateForScene} from './RunState.js';
const url=new URL('../scenes/DayTransitionScene.js',import.meta.url),stub='data:text/javascript,export class Scene{}';
const source=(await readFile(url,'utf8')).replace(/from '([^']+)'/g,(_,s)=>`from '${s==='phaser'?stub:new URL(s,url).href}'`);
const{default:Transition}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('next-day card holds, fades and restarts exploration without incrementing twice',()=>{
 const s=new Transition();s.game={};const run=runStateForScene(s);run.completeEncounter(run.beginEncounter(),'VICTORY');s.init();
 const text=[],timers=[],calls=[];s.scale={width:1024,height:768};s.cameras={main:{setBackgroundColor(){},fadeIn:()=>calls.push('in'),fadeOut:()=>calls.push('out')}};
 s.add={text:(x,y,t)=>{text.push(t);return{setOrigin(){return this;}};}};s.time={delayedCall:(ms,fn)=>timers.push({ms,fn})};s.scene={start:key=>calls.push(key)};s.create();
 assert.ok(text.includes('THE NEXT DAY'));assert.ok(text.includes('DAY 2'));assert.equal(timers[0].ms,1900);assert.equal(calls.includes('SchoolScene'),false);timers[0].fn();assert.equal(timers[1].ms,350);s.finish();assert.equal(timers.length,2);timers[1].fn();assert.equal(calls.at(-1),'SchoolScene');assert.equal(run.dayNumber,2);
});
