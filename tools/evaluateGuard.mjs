import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import QTable from '../src/game/ai/QTable.js';
import { evaluateGuard } from '../src/game/training/GuardExperiments.js';
import { argumentsFor, saveJSON } from './guardCli.mjs';
const args = argumentsFor(process.argv.slice(2), ['table','episodes','seed','max-rounds','output']);
const tableBytes = await readFile(path.resolve(args.table ?? 'public/assets/ai/guard_qtable.json'));
const saved = JSON.parse(tableBytes.toString('utf8'));
const table = QTable.fromJSON(saved);
const options = {};
if (args.episodes != null) options.episodesPerBot = Number(args.episodes);
if (args.seed != null) options.seed = Number(args.seed);
if (args['max-rounds'] != null) options.maxRounds = Number(args['max-rounds']);
const result = evaluateGuard(table, options);
result.table = { sha256: createHash('sha256').update(tableBytes).digest('hex'), stateSchema: saved.stateSchema, trainingSeed: saved.metadata?.seed, trainingEpisodes: saved.metadata?.episodes };
await saveJSON(path.resolve(args.output ?? 'public/assets/ai/guard_evaluation_metrics.json'), result);
console.table(result.results.map(row => ({ policy: row.policy, bot: row.bot, wins: row.wins, losses: row.losses,
    draws: row.draws, winPercent: +(row.winRate * 100).toFixed(2), averageRounds: +row.averageRounds.toFixed(2), averageReward: +row.averageReward.toFixed(2) })));
