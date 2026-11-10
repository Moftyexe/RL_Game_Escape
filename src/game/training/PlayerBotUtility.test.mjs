import test from 'node:test';
import assert from 'node:assert/strict';
import CombatSystem,{validActions} from '../combat/CombatSystem.js';
import {BOT_TYPES,healEfficiency,playerBotWeights,createPlayerBot} from './PlayerBots.js';
import {seededRandom} from './SeededRandom.js';
for(const type of BOT_TYPES){
 test(type+' excludes full-HP healing and scales only Catch Breath by heal efficiency',()=>{
  const s=new CombatSystem().snapshot();s.player.hp=850;const base=playerBotWeights(type,s);
  for(const[missing,eff]of [[0,0],[30,.2],[75,.5],[149,149/150],[150,1],[400,1]]){
   s.player.hp=s.player.maxHp-missing;const w=playerBotWeights(type,s);assert.equal(healEfficiency(s.player),eff);assert.equal(w.catchBreath,base.catchBreath*eff);
   for(const[a,n]of Object.entries(w))if(a!=='catchBreath')assert.equal(n,base[a]);
  }
  s.player.hp=1000;const bot=createPlayerBot(type,seededRandom(76));for(let i=0;i<1000;i++)assert.notEqual(bot.chooseAction(s),'catchBreath');
  s.player.hp=500;for(const sp of [0,29,30,100]){s.player.sp=sp;const w=playerBotWeights(type,s);assert.equal('catchBreath'in w,sp>=30);for(let i=0;i<20;i++)assert.ok(validActions(s,'player').includes(bot.chooseAction(s)));}
  s.player.stunned=true;assert.equal(bot.chooseAction(s),null);
 });
 test(type+' corrected choices reproduce seeded RNG',()=>{
  const run=()=>{const b=createPlayerBot(type,seededRandom(15)),s=new CombatSystem().snapshot();s.player.hp=950;return Array.from({length:100},()=>b.chooseAction(s));};assert.deepEqual(run(),run());
 });
}
test('base personalities remain distinct at full heal value',()=>{
 const s=new CombatSystem().snapshot();s.player.hp=850;const a=playerBotWeights('aggressive',s),r=playerBotWeights('random',s),t=playerBotWeights('tricky',s);
 assert.deepEqual([a.attack,a.swingBackpack,a.catchBreath],[6,8,.15]);assert.deepEqual([r.attack,r.swingBackpack,r.catchBreath],[1,1,1]);assert.deepEqual([t.attack,t.swingBackpack,t.catchBreath,t.defend,t.lookThere],[2,1,1,4,5]);
});
