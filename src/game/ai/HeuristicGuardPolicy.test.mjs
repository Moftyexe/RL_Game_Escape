import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';
import HeuristicGuardPolicy from'./HeuristicGuardPolicy.js';import CombatSystem,{validActions}from'../combat/CombatSystem.js';import{seededRandom}from'../training/SeededRandom.js';
test('diagnostic heuristic only uses legal public observations and masks forced/invalid actions',()=>{
 const rng=seededRandom(11),p=new HeuristicGuardPolicy(rng);
 for(const hp of [50,200,500,1000])for(const sp of [0,14,15,20,100])for(const status of [null,'RILED','DISTRACTED','FOCUSED']){
  const s=new CombatSystem().snapshot();Object.assign(s.guard,{hp,sp,status:status?{name:status,turns:2}:null});Object.defineProperty(s,'playerAction',{get(){throw Error('hidden');}});Object.defineProperty(s.player,'currentAction',{get(){throw Error('hidden');}});
  assert.ok(validActions(s,'guard').includes(p.chooseAction(s)));s.guard.offGuard=true;assert.equal(p.chooseAction(s),null);
 }
});
test('heuristic rules are transparent: emergency heal, direct critical pressure, then wife cleanse/buff',()=>{
 const p=new HeuristicGuardPolicy(()=>0),s=new CombatSystem().snapshot();s.guard.hp=200;assert.equal(p.chooseAction(s),'eatDonut');s.guard.donutAvailable=false;s.player.hp=50;assert.equal(p.chooseAction(s),'attack');s.player.hp=1000;s.guard.status={name:'RILED',turns:2};assert.equal(p.chooseAction(s),'callWife');
});
test('heuristic weighted choices reproduce seeded RNG and are not imported by live AI or Q training selection',async()=>{
 const run=()=>{const p=new HeuristicGuardPolicy(seededRandom(51)),s=new CombatSystem().snapshot();s.guard.wifeCallAvailable=false;return Array.from({length:30},()=>p.chooseAction(s));};assert.deepEqual(run(),run());
 for(const file of ['../scenes/BattleScene.js','GuardAIController.js','QLearningGuardPolicy.js'])assert.equal((await readFile(new URL(file,import.meta.url),'utf8')).includes('HeuristicGuardPolicy'),false);
});
