import {readFile,writeFile} from 'node:fs/promises';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const r=await json('tools/guard-v5-comparison.json'),selection=await json('tools/guard-v5-selection.json');
const sfx=await json('docs/SFX_AUDIT.json'),smoke=await json('tools/guard-v5-smoke-metrics.json');
const verify=await json('tools/v5-verification.json'),train=await json('public/assets/ai/guard_training_metrics.json');
const starts=await json('public/assets/ai/guard_start_coverage.json');
const f=n=>Number(n).toFixed(2),pct=(n,total)=>total?100*n/total:0;
const table=(heads,rows)=>'| '+heads.join(' | ')+' |\n| '+heads.map(()=> '---').join(' | ')+' |\n'+rows.map(row=>'| '+row.join(' | ')+' |').join('\n')+'\n';
const policies=['random','heuristic','q-20k','q-40k','q-60k'];
const sum=o=>Object.values(o).reduce((n,v)=>n+v,0);
function combined(policy){
 const rows=r.results.filter(row=>row.policy===policy),d={};
 for(const row of rows)for(const [key,value]of Object.entries(row.diagnostics)){
  if(typeof value==='object'){d[key]??={};for(const[k,n]of Object.entries(value))d[key][k]=(d[key][k]??0)+n;}
  else if(key.startsWith('max'))d[key]=Math.max(d[key]??0,value);
  else d[key]=(d[key]??0)+value;
 }
 return {policy,episodes:rows.reduce((n,x)=>n+x.episodes,0),wins:rows.reduce((n,x)=>n+x.wins,0),losses:rows.reduce((n,x)=>n+x.losses,0),draws:rows.reduce((n,x)=>n+x.draws,0),roundLimitDraws:rows.reduce((n,x)=>n+x.roundLimitDraws,0),averageRounds:rows.reduce((n,x)=>n+x.averageRounds,0)/rows.length,averageReward:rows.reduce((n,x)=>n+x.averageReward,0)/rows.length,d};
}
const all=policies.map(combined),qs=all.filter(x=>x.policy.startsWith('q-'));
let md=`# Final balance, v5 checkpoints and SFX cleanup

## Combat changes and Whistle inspection

The current project was inspected before edits. Whistle already used the intended one-opportunity stun semantics; **no stun mechanic correction was necessary**. Before and after: the 10% proc sets Player.stunned. On the Player's next execution opportunity, the engine clears the flag and skips before deducting action SP. If Whistle precedes the pending action, that opportunity consumes it immediately; if the Player already acted, the flag survives to exactly the next opportunity. There is no additional end-round stun application.

New WhistleOpportunity.test.mjs proves both orders across multiple rounds: pending Backpack cancels without SP cost and next round executes; completed Catch Breath is untouched, next null opportunity skips, third action executes. Exactly one turnSkipped event occurs and stunned=false after consumption. A roll exactly .10 does not stun and still applies DISTRACTED. Existing matching tests remain.

| Mechanic | Before | Now |
| --- | --- | --- |
| Player max HP / SP | 1000 / 100 | 1000 / 100 |
| Guard max HP / SP | 1000 / 100 | **1200 / 100** |
| Catch Breath | 50 HP +35 SP | **35 SP only, zero HP**, FAST/free/action-consuming/no defense |
| Donut | 180 HP only | **200 HP only**, FAST/free/once, capped1200/no SP |
| Donut FULL_VALUE | missing >=180 HP | **missing >=200 HP** |

Shared DONUT_HEAL constant drives execution, Donut encoding, diagnostic heuristic and audit waste calculations. At1000/1200 HP, Donut is FULL_VALUE; at1001 it is PARTIAL_VALUE; unavailable once spent. No tactical high-HP ban. Five percentage HP bins remain unchanged: <=10%, <=25%, <=50%, <=75%, >75%; 120/1200 is CRITICAL and 300/1200 LOW. BattleScene's HP bars/text already divide by actor.maxHp; presentation fixtures now verify1200. Training uses the same CombatSystem initialization.

Player kit, attack stats, action costs/priorities, Call Wife, Defend, OFF_GUARD, reward function and bot weights are unchanged. **RILED remains +50% damage, +25pp crit, -25pp accuracy, three rounds, 40% defended reduction; 20% stumble after physical miss, 50 self-damage, no future skip**. No hidden Guard stat increase. No DDA.

## Training plan, compatibility and reproducibility

Schema **guard-q-v5**, format2; combat signature now explicitly includes recovery values and Guard1200. v4 and older tables are rejected. Smoke **${smoke.config.episodes} episodes**, fresh table; full **60,000 episodes from zero**, seed **${train.config.seed}**. Neither v4 nor smoke values were reused.

Alpha .10, gamma .95, unchanged reward weights and epsilon schedule: 1 → .05 linearly through75% of the planned60k run (45k), then .05. Checkpoints are serialized prefixes of **one continuous run**, not independently annealed20k/40k/60k runs. Epsilon at each checkpoint: ${r.checkpoints.map(c=>c.policy+' '+f(c.metadata.finalEpsilon)).join('; ')}. Metadata records completed episodes, planned horizon, seed/config, Q values, visits, legal-action unions and coverage. Checkpoint callbacks do not consume RNG. Deterministic tests confirm callback/noncallback runs match and serialized visits/coverage survive reloading.

Target start mix75/25 normal/randomized; actual full run **${train.summary.startCounts.normal}/${train.summary.startCounts.randomized}**. Target bots50/25/25 Aggressive/Random/Tricky; actual ${Object.entries(train.perBot).map(([k,v])=>k+' '+v.episodes).join(', ')}. Valid randomized-start draft/setup/reject pipeline retained; Donut states observed in accepted randomized starts: ${Object.entries(starts.donutStates).map(([k,v])=>k+' '+v).join(', ')}.

Sparse tables, explicit visits, seeded unvisited-valid TRAIN priority, visited-only greedy EVAL and Random fallback remain. A committed decision cancelled mechanically still receives its one existing transition/Q update/visit; forced skipped rounds receive no visits and aggregate discounted return. Hidden current Player choices remain excluded. Live BattleScene still uses Q-learning EVAL, epsilon0/no learning; P/F2 remain. Heuristic is evaluation only.

All checkpoints retained separately:

${table(['Checkpoint','Completed / planned','Path','SHA256'],r.checkpoints.map(c=>[c.policy,c.metadata.episodes+' / '+c.metadata.plannedEpisodes,c.file,c.sha256]))}
Each has its matching guard_training_20k/40k/60k.json in the same folder. Production **${selection.selected}** was copied byte-for-byte to public/assets/ai/guard_qtable.json.

## State/action coverage comparison

${table(['Checkpoint','States','Learned pairs','Mean actions/state','Median','All observed legal options explored'],r.checkpoints.map(c=>[c.policy,c.coverage.encounteredStates,c.coverage.learnedPairs,f(c.coverage.meanVisitedActions),c.coverage.medianVisitedActions,f(c.coverage.fullyExploredSeenLegalPercent)+'%']))}
${table(['Checkpoint','1 visited','2 visited','3 visited','4 visited','5 visited','6 visited'],r.checkpoints.map(c=>[c.policy,...[1,2,3,4,5,6].map(n=>c.coverage.statesByVisitedActions[n]+' ('+f(c.coverage.percentByVisitedActions[n])+'%)')]))}
Coverage improves with additional episodes, but mean actions/state and fully explored percentage improve slowly. Rare states remain undersampled. “Fully explored” means every member of the union of legal options actually observed in that encoded state was tried, not all six theoretical actions. The theoretical state space remains259,200; changes affect values/compatibility, not cardinality. No preallocation.

## Paired held-out evaluation

Seed **${r.seed}**; **${r.episodesPerBot} normal full battles per policy/bot**, same episode seeds and policy RNG streams, max100 rounds; no randomized evaluation starts. Rewards and W/L/D are Guard-perspective. Evaluation asserts no Q-table mutation. These held-out results guide checkpoint selection; they are not a separate untouched final selection test.

${table(['Guard policy','Player bot','W/L/D','Win %','Mean rounds','Mean reward'],r.results.map(x=>[x.policy,x.bot,[x.wins,x.losses,x.draws].join('/'),f(100*x.winRate),f(x.averageRounds),f(x.averageReward)]))}
${table(['Policy overall (3000)','W/L/D','Win %','Mean rounds','Mean reward'],all.map(x=>[x.policy,[x.wins,x.losses,x.draws].join('/'),f(pct(x.wins,x.episodes)),f(x.averageRounds),f(x.averageReward)]))}
### Production choice

Selected **60k based on measured behavior and validation**, not episode count alone. It has the best Aggressive win rate62.5% and best overall wins/reward, matches20k's99.3% against Random and reaches100% against Tricky. 40k regresses to53.9% against Aggressive, demonstrating that longer alone is not sufficient. 60k also has the most visited pairs and best mean/complete coverage. Against Aggressive its average Donut restores197.01/200 HP, under100 healing occurs1.00%, and CRITICAL Defend falls to19.73% versus33.31% at20k and32.28% at40k. No round-limit draws; maximum Defend chain7 still warrants monitoring. All policies obey resource validity, costs and finite use; there is no invalid-resource exploit.

Important remaining weakness:60k still wastes Donut healing against easy Random/Tricky opponents; this is shown below rather than masked with a healing rule. Its62.5% vs heuristic60.6% Aggressive result is close and is not proof of superiority to all competent strategies.

## Aggressive matchup: why it changed

The old v4 experiment recorded Random/Q/heuristic Aggressive wins0.1%/13.4%/18.3%. With the agreed combined changes, current wins are5.0%/62.5%/60.6% for Random/selected Q/heuristic. This supports a substantial previous balance disadvantage, while learning/selection still matters (40k regresses). The combined experiment cannot isolate how much came from extra Guard HP versus removing Player healing or the Donut increase. Whistle semantics were already correct, so the improvement is not a stun fix.

Below, action rates count committed non-null decisions, including later interruptions. Guard ATTACK is damaging; Whistle/Crack/etc are setup. Player ATTACK/Backpack/Talk Smack are damaging. Damage totals use actual HP lost, excluding Guard stumble self-damage and overkill; they are not attempted damage. Raw JSON also includes executed-action counts and cancellations.

`;
const aggressive=r.results.filter(x=>x.bot==='aggressive');
md+=table(['Guard policy','Guard damaging %','Guard setup %','Player damaging %','Catch Breath count (%)','Backpack count (%)'],aggressive.map(x=>[x.policy,f(x.rates.guardDamagingPercent),f(x.rates.guardSetupPercent),f(x.rates.playerDamagingPercent),(x.diagnostics.playerActions.catchBreath??0)+' ('+f(x.rates.playerCatchBreathPercent)+')',(x.diagnostics.playerActions.swingBackpack??0)+' ('+f(x.rates.playerBackpackPercent)+')']));
md+='\n'+table(['Guard policy','Guard Defend count (%)','Guard Donut count (%)','Mean Guard damage dealt','Mean Player damage dealt','Mean effective Donut HP'],aggressive.map(x=>[x.policy,(x.diagnostics.guardActions.defend??0)+' ('+f(x.rates.guardDefendPercent)+')',(x.diagnostics.guardActions.eatDonut??0)+' ('+f(x.rates.guardDonutPercent)+')',f(x.rates.averageGuardDamage),f(x.rates.averagePlayerDamage),f(x.rates.meanEffectiveDonut)]));
md+=`\nThe simple heuristic prioritizes emergency full-value healing at<=25% HP, direct attacks against CRITICAL Player, available Wife cleanse/buff/SP, then seeded weighted Attack/Whistle/Crack pressure. It sees only public observations and chooses valid actions. Random baseline remains uniform and unchanged.\n\n## Donut audit\n\nAll following checkpoint audits aggregate3000 normal full battles (equal bots). Uses are executed Donuts; value/HP bins use predecision HP. Restored-event HP measures actual effective healing, including any same-round effects. Wasted=200−effective.\n\n`;
md+=table(['Checkpoint','CRITICAL','LOW','MID','HIGH','VERY_HIGH','FULL_VALUE','PARTIAL_VALUE'],qs.map(x=>[x.policy,...['CRITICAL','LOW','MID','HIGH','VERY_HIGH'].map(k=>x.d.donutByHp[k]),x.d.donutByValue.FULL_VALUE,x.d.donutByValue.PARTIAL_VALUE]));
md+='\n'+table(['Checkpoint','Executed uses','Mean restored','Mean wasted','Uses <100 HP %','Above75% HP %'],qs.map(x=>[x.policy,x.d.donuts,f(x.d.donutHp/x.d.donuts),f(200-x.d.donutHp/x.d.donuts),f(pct(x.d.donutUnder100,x.d.donuts)),f(pct(x.d.donutAbove75,x.d.donuts))]));
md+='\n'+table(['60k versus bot','Uses','FULL / PARTIAL','Mean restored','Mean wasted','<100 HP %','Above75% HP %'],r.results.filter(x=>x.policy==='q-60k').map(x=>[x.bot,x.diagnostics.donuts,x.diagnostics.donutByValue.FULL_VALUE+' / '+x.diagnostics.donutByValue.PARTIAL_VALUE,f(x.rates.meanEffectiveDonut),f(x.rates.meanWastedDonut),f(x.rates.donutUnder100Percent),f(x.rates.donutAbove75Percent)]));
md+=`\nDonut efficiency improves strongly against Aggressive with60k, but still poor against weaker bots. Above75% HP is not itself waste: a1200-max Guard can accept the entire200 heal at1000HP (83.33%). FULL_VALUE remains observation, never a policy restriction.\n\n## Defend audit\n\n`;
md+=table(['Checkpoint','CRITICAL Defend / decisions (%)','Longest chain','Longest while Player CRITICAL','Player-CRITICAL chains >=2','Round-limit draws'],qs.map(x=>[x.policy,x.d.criticalGuardDefends+' / '+x.d.criticalGuardDecisions+' ('+f(pct(x.d.criticalGuardDefends,x.d.criticalGuardDecisions))+')',x.d.maxDefendChain,x.d.maxPlayerCriticalDefendChain,x.d.criticalPlayerDefendChains,x.roundLimitDraws]));
md+='\nMore training is not monotonic: longest chains are7/6/7. CRITICAL Defend improves at60k; all checkpoints avoid round-limit draws. Forced skipped rounds break chains. There are still short nonfinishing Defend chains when Player is CRITICAL. No Defend nerf or tactical workaround was added.\n\n## RILED verification\n\n';
md+=table(['Checkpoint','Crack count (% decisions)','Immediate repeats','RILED entries / battles','Hit %','Miss %','Crit % of hits','Stumbles (% misses)','Fatal stumbles'],qs.map(x=>[x.policy,x.d.crack+' ('+f(pct(x.d.crack,sum(x.d.guardActions)))+')',x.d.repeatCrack,x.d.riledEntries+' / '+x.d.riledBattles,f(pct(x.d.riledHits,x.d.riledHits+x.d.riledMisses)),f(pct(x.d.riledMisses,x.d.riledHits+x.d.riledMisses)),f(pct(x.d.riledCrits,x.d.riledHits)),x.d.stumbles+' ('+f(pct(x.d.stumbles,x.d.riledMisses))+')',x.d.fatalStumbles]));
md+=`\nEntries include Talk Smack and status refreshes. Hit/miss/crit samples include completed physical Guard attacks while RILED, excluding cancelled actions. These are observational checks; RILED/stumble values were not changed.\n\n## SFX source cleanup\n\nFolder **${sfx.root}**. Before **${sfx.before} audio files**, kept **${sfx.retained}**, deleted **${sfx.deleted}**; exact duplicate groups **${sfx.duplicateGroups.length}**. All were WAVs with inspected headers; JSON records actual duration, encoding, sample rate/channels/bit depth, bytes, hashes, metadata chunks and PCM peak/RMS. No transcode or renaming. README/LICENSES retained. No perceptual listening is claimed.\n\nDeleted only explicit sword/knife weapon effects, firearms/ammunition/ranged weapons, explosions/bombs, offensive fire spells, named monsters, engines/robots/space machinery, lasers/phasers. Generic magic feedback, vague creature hurt/death, gear/armor, scrapes, whooshes, atmospheric/weather/water effects and household impacts remain for audition. No duplicate copies were removed because none were exact.\n\nEvery retained file is categorized and every deletion has its full path and reason in [SFX_AUDIT.md](SFX_AUDIT.md); per-file machine-readable inventory and integrity records in [SFX_AUDIT.json](SFX_AUDIT.json). Deletion plan was recorded first; PowerShell validated absolute paths stay under this collection and checked hashes before nonrecursive literal-file deletion. Post-cleanup verification confirms all planned files gone, retained hashes unchanged, no runtime source references to deleted names/paths, and protected runtime/music/image/animation assets unchanged during cleanup. Only the intended SFX files were deleted.\n\n**No SFX integrated**: no copies into public/assets, no Phaser registrations/preloads, no action/UI/status/interaction sound changes. Hallway/battle tracks, volumes, musician toggle and music lifecycle were not edited.\n\n## Verification and manual checks\n\nTests: **${verify.testsPassed}/${verify.testsTotal} passed**, **${verify.testsFailed} failures**. Syntax: **${verify.syntax}**. Production build: **${verify.buildExitCode===0?'PASS':'FAIL'}** (existing large-chunk warning); built table and audio verified against runtime originals. All runtime music and animation/image integrity comparisons passed.\n\nDeterministic coverage includes1200 Guard/1000 Player, percentage bins for1200, no-HP Catch Breath with SP cap/no defense,200-HP Donut/cap/no SP, exact200 missing-HP boundary, both Whistle orders/single skip/no SP charge, unchanged RILED thresholds, explicit visits/zero distinction, seeded unvisited-valid priority, EVAL visited-only/fallback nonmutation, randomized starts, heuristic legality/public observations, v4 rejection and chosen-v5 loading, checkpoint serialization/RNG reproducibility, and existing music lifecycle tests.\n\nManual browser checks remain: verify the1200 HP bar/label and new recovery commentary during real battles, P/F2 switching, animation pacing, and audible hallway/battle transitions/autoplay. No browser session was claimed here. Manually audition retained SFX before later selection/integration; current classification uses metadata/category context conservatively.\n\nRaw evaluation/behavior comparison: tools/guard-v5-comparison.json. Production Q/metrics and representative policy inspection: public/assets/ai. Reproduction tools: trainGuard.mjs, compareGuardCheckpoints.mjs, inspectGuardPolicy.mjs, auditTrainingCoverage.mjs, reportGuardV5.mjs. No DDA.\n`;
await writeFile('docs/GUARD_BALANCE_CHECKPOINTS_V5.md',md);
console.log('Wrote docs/GUARD_BALANCE_CHECKPOINTS_V5.md');
