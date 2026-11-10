import { readFile,writeFile } from 'node:fs/promises';
import TrainingEnvironment from '../src/game/training/TrainingEnvironment.js';
import {hpBucket,donutState}from'../src/game/ai/StateEncoder.js';
const metrics=JSON.parse(await readFile('public/assets/ai/guard_training_metrics.json','utf8'));
const pairs={},playerStatuses={},guardStatuses={},donutStates={};
let randomized=0,playerStunned=0;
const add=(counts,key)=>counts[key]=(counts[key]??0)+1;
// Reconstruct exactly the recorded initial states. No table, actions, learning
// or terminal reward is involved; initial-state RNG is a separate named stream.
for(const record of metrics.episodes){
 if(record.startType!=='randomized')continue;
 const env=new TrainingEnvironment({seed:record.seed,bot:record.bot,randomizedStart:true});
 const state=env.initialState;randomized++;add(pairs,hpBucket(state.guard)+' / '+hpBucket(state.player));
 add(playerStatuses,state.player.status?.name??'NONE');add(guardStatuses,state.guard.status?.name??'NONE');add(donutStates,donutState(state.guard));playerStunned+=Number(state.player.stunned);
}
const report={seed:metrics.config.seed,episodes:metrics.config.episodes,normal:metrics.episodes.length-randomized,randomized,pairs,playerStatuses,guardStatuses,donutStates,playerStunned,
 method:'Reconstructed recorded episode initial states using the independent seeded start stream; no policy queries or Q updates.'};
await writeFile('public/assets/ai/guard_start_coverage.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
