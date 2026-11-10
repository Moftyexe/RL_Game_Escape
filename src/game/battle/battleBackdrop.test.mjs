import test from 'node:test';
import assert from 'node:assert/strict';
import { createBattleBackdrop, preloadBattleBackdrop, BATTLE_ARENA, BACKDROP_DARKENING } from './battleBackdrop.js';
function fixture({missing=false,broken=false}={}) {
 const calls=[], objects=[];
 const texture={getSourceImage:()=>{if(broken)throw Error('failed image');return {width:1672,height:941};},has:()=>false,add:(...args)=>calls.push(['crop',...args]),setFilter:v=>calls.push(['filter',v])};
 const scene={textures:{exists:()=>!missing,get:()=>texture},load:{image:(...args)=>calls.push(['load',...args])},ui:{add:v=>objects.push(...v)},add:{image:(...args)=>({args,setScale(value){this.scale=value;return this;}}),rectangle:(...args)=>({args})}};
 return {scene,calls,objects};
}
test('battle backdrop loads the real BGbattle asset',()=>{const f=fixture();preloadBattleBackdrop(f.scene);assert.equal(f.calls[0][1],'battle-hallway');assert.match(f.calls[0][2],/BGbattle\.png$/);});
test('backdrop cover crop preserves aspect and stays exclusively in upper arena',()=>{
 const f=fixture(),result=createBattleBackdrop(f.scene,1),crop=f.calls.find(c=>c[0]==='crop');
 assert.equal(f.objects.length,2);assert.equal(result.image.args[0],512);assert.equal(result.image.args[1],205);
 const [,name,index,x,y,w,h]=crop;assert.equal(name,'arena');assert.equal(index,0);assert.ok(x>=0&&y>=0&&x+w<=1672&&y+h<=941);
 assert.ok(w*result.image.scale<=BATTLE_ARENA.width);assert.ok(h*result.image.scale<=BATTLE_ARENA.height);
 assert.equal(result.overlay.args.at(-1),BACKDROP_DARKENING);assert.equal(BACKDROP_DARKENING,.35);assert.ok(BATTLE_ARENA.y+BATTLE_ARENA.height<402);
});
for(const options of [{missing:true},{broken:true}])test('unavailable backdrop safely retains dark arena '+JSON.stringify(options),()=>{const f=fixture(options);assert.equal(createBattleBackdrop(f.scene,1),null);assert.equal(f.objects.length,0);});
