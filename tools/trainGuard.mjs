import path from 'node:path';
import {mkdirSync,writeFileSync} from 'node:fs';
import { trainGuard } from '../src/game/training/GuardExperiments.js';
import { argumentsFor, readJSON, saveJSON } from './guardCli.mjs';
const args = argumentsFor(process.argv.slice(2), ['episodes','seed','alpha','gamma','max-rounds','randomized-start-fraction','output','metrics','config','checkpoints','checkpoint-dir']);
const overrides = args.config ? await readJSON(args.config) : {};
for (const key of ['episodes','seed','alpha','gamma']) if (args[key] != null) overrides[key] = Number(args[key]);
if (args['max-rounds'] != null) overrides.maxRounds = Number(args['max-rounds']);
if (args['randomized-start-fraction'] != null) overrides.randomizedStartFraction = Number(args['randomized-start-fraction']);
const checkpointEpisodes=args.checkpoints?args.checkpoints.split(',').map(Number):[];
const checkpointDir=path.resolve(args['checkpoint-dir']??'tools/checkpoints/v7');
const result = trainGuard(overrides, progress => console.log(`Training ${progress.episode}: ${progress.states} Q states`),{
 checkpointEpisodes,onCheckpoint:result=>{
  mkdirSync(checkpointDir,{recursive:true});const n=result.metadata.episodes;
  writeFileSync(path.join(checkpointDir,`guard_qtable_${n/1000}k.json`),JSON.stringify(result.table.toJSON(result.metadata),null,2)+'\n');
  writeFileSync(path.join(checkpointDir,`guard_training_${n/1000}k.json`),JSON.stringify(result.metrics,null,2)+'\n');
  console.log(`Saved checkpoint ${n}`);
 }
});
const output = path.resolve(args.output ?? 'public/assets/ai/guard_qtable.json');
await saveJSON(output, result.table.toJSON(result.metadata));
await saveJSON(path.resolve(args.metrics ?? 'public/assets/ai/guard_training_metrics.json'), result.metrics);
console.log(JSON.stringify({ output, states: result.table.stateCount, pairs: result.table.pairCount, ...result.metrics.summary, perBot: result.metrics.perBot }, null, 2));
