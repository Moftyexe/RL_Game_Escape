import {writeFile} from 'node:fs/promises';
import CombatSystem from '../src/game/combat/CombatSystem.js';
import {seededRandom} from '../src/game/training/SeededRandom.js';
const random=seededRandom(20261112),samples=20000,rows=[];
for(const test of [
 {label:'Normal Guard vs Player Defend',p:'defend',g:'attack',actor:'guard',expected:.85},
 {label:'Normal Guard vs undefended Player',p:'catchBreath',g:'attack',actor:'guard',expected:.9},
 {label:'RILED Guard vs Player Defend',p:'defend',g:'attack',actor:'guard',status:'RILED',expected:.6},
 {label:'RILED Guard vs undefended Player',p:'catchBreath',g:'attack',actor:'guard',status:'RILED',expected:.65},
 {label:'Player Attack vs Guard Defend',p:'attack',g:'defend',actor:'player',expected:.9},
 {label:'Player Backpack vs Guard Defend',p:'swingBackpack',g:'defend',actor:'player',expected:.8}
]){
 let hits=0,misses=0;for(let i=0;i<samples;i++){
  const c=new CombatSystem({random,tieRandom:random,dialogueRandom:()=>0});if(test.status)c.guard.status={name:test.status,turns:3};
  c.beginRound();if(!c.lockActions(test.p,test.g))throw Error('Invalid evasion sample');c.revealActions();c.resolveNextAction();c.resolveNextAction();const r=c.endRound();
  const e=r.events.find(e=>e.actorId===test.actor&&e.physical&&['damage','miss'].includes(e.type));if(!e||e.effectiveAccuracy!==test.expected)throw Error('Wrong effective accuracy: '+test.label);if(e.type==='damage')hits++;else misses++;
 }rows.push({...test,samples,hits,misses,observedHitPercent:100*hits/samples});
}
await writeFile('tools/v7-evasion-audit.json',JSON.stringify({seed:20261112,samplesPerCase:samples,rows},null,2)+'\n');console.table(rows.map(r=>({case:r.label,expected:100*r.expected,observed:r.observedHitPercent,hits:r.hits,misses:r.misses})));
