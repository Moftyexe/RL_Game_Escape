import {readFile,writeFile} from 'node:fs/promises';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const result=await json('tools/guard-v6-comparison.json'),selection=await json('tools/guard-v6-selection.json');
const smoke=await json('tools/guard-v6-smoke-metrics.json'),verify=await json('tools/v6-verification.json');
const inventory=await json('docs/RUN_V6_SOURCE_INVENTORY.json');
const train=await json('public/assets/ai/guard_training_metrics.json');
const v5=await json('tools/guard-v5-comparison.json');
const f=n=>Number(n).toFixed(2),pct=(n,total)=>total?100*n/total:0,sum=o=>Object.values(o).reduce((n,v)=>n+v,0);
const table=(heads,rows)=>'| '+heads.join(' | ')+' |\n| '+heads.map(()=> '---').join(' | ')+' |\n'+rows.map(row=>'| '+row.join(' | ')+' |').join('\n')+'\n';
const all=['random','heuristic','q-60k','q-80k','q-100k'].map(policy=>{
 const rows=result.results.filter(r=>r.policy===policy),d={};
 for(const row of rows)for(const[k,v]of Object.entries(row.diagnostics)){
  if(typeof v==='object'){d[k]??={};for(const[a,n]of Object.entries(v))d[k][a]=(d[k][a]??0)+n;}
  else d[k]=k.startsWith('max')?Math.max(d[k]??0,v):(d[k]??0)+v;
 }
 return {policy,d,wins:rows.reduce((n,r)=>n+r.wins,0),losses:rows.reduce((n,r)=>n+r.losses,0),draws:rows.reduce((n,r)=>n+r.draws,0),roundLimitDraws:rows.reduce((n,r)=>n+r.roundLimitDraws,0),meanRounds:rows.reduce((n,r)=>n+r.averageRounds,0)/3,meanReward:rows.reduce((n,r)=>n+r.averageReward,0)/3};
});
const qs=all.filter(r=>r.policy.startsWith('q-'));
let md=`# Final Catch Breath, Talk Smack art and v6 checkpoints

## Status

Catch Breath redesign, Talk Smack frame removal, fresh100k training and checkpoint comparison completed. The user clarified that the run cycle **was not updated**, withdrawing the eight-frame integration request. Existing running assets, registration, FPS and exploration gameplay remain unchanged; there is no missing run-art task. No DDA or SFX integration.

## Mechanical scope

Only Catch Breath changes combat: **FAST,30 SP cost paid only on execution,100 HP heal capped1000, zero SP restoration, no defense, consumes one action**. Engine validity rejects SP<30 via the same catalog cost check used by UI and bots. HP650/SP70 → HP750/SP40; HP960/SP70 → HP1000/SP40. At full HP it still pays30 if executed; no additional tactical validity rule was added.

Cancellation checks happen before cost/healing. Tests cover execution interrupted by stun/death and a carried Whistle stun's null opportunity. Whistle is NORMAL, so it cannot naturally outrank a FAST Catch Breath in the current kit; no artificial priority rule was introduced just to test that scenario. Existing before/after Whistle tests still prove exactly one skip, no double skip and no cost for a cancelled Backpack.

Commentary reads actual recovery: “You catch your breath.” / “+100 HP” (or the capped amount/full-HP message). The ordinary SP display reflects30 paid; Catch Breath art unchanged.

Frozen: Player1000HP/100SP, Attack80/90%/10%, Defend+10SP, Lock In15SP, Talk Smack15SP/30 fixed emotional damage/RILED, Look There, Backpack140/80%/20SP. Guard1200HP/100SP, Donut200HP only/once, Wife20SP/FOCUSED, Whistle10% single-opportunity stun, priorities unchanged. RILED remains3 rounds, +50% damage, +25pp crit, -25pp accuracy, weaker defense,20% stumble after physical miss,50 self-damage/no future skip. Rewards, bot weights and insult array unchanged.

## Talk Smack: exact visual sequence

Source inspected: P_Animations/Protagonist_Battle_Talk smack.png, six left-to-right poses. Human **fourth pose** is the open-handed shrug; source zero-based index3 is omitted. Runtime keys play source indices **[0,1,2,4,5]**, human sequence **1 → 2 → 3 → 5 → 6**. Fifth pose remains. Source artwork and extracted PNGs were not redrawn; registration explicitly excludes the unwanted pose even after reprocessing.

Only this animation's existing third-pose hold grows1375 →1500ms, compensating exactly125ms for the removed8FPS frame. Motion stays8FPS; complete duration stays **2125ms**, cue at third source pose stays250ms. Other animation speeds/holds unchanged. Deterministic registration/duration tests and [five-pose preview](../tools/talk-smack-v6-review.png) verify the change. Manual in-game motion feel still needs review.

## Running source inspection — request withdrawn

The project root and image/source folders were rescanned; the generic root protagonist sheet was also viewed and is the old mixed character reference, not a new eight-frame run cycle. Current run files were independently alpha-scanned rather than trusting the old manifest:

${table(['Source','Dimensions','Alpha','Detected poses','Same hash as previous source'],inventory.sources.map(s=>[s.path,s.width+'×'+s.height,s.hasAlpha,s.detectedPoses,s.matchesPreviousProcessedSource]))}
Side source1983×793 is one horizontal row of10 unevenly spaced poses with transparency/background debris; front/rear sheets are2172×724 with6 poses. The side hash is495d52385b7d49779b951f0f9c8a2dfbbaed95e4cf2807c9c42e3863af86a48d, matching the previous processing report. Exact hashes, detected crops and source feet positions: [RUN_V6_SOURCE_INVENTORY.json](RUN_V6_SOURCE_INVENTORY.json).

The user subsequently confirmed “i actually didnt update the run cycle.” No poses were dropped/reordered to fabricate eight. Existing run-side/run-down/run-up keys retain their10/6/6 frames at12FPS, looping sequentially. Existing256×256 nearest-neighbor canvases, common source-floor/head anchors and logical baseline249 remain. No new-eight-frame claims or tests were fabricated. Movement speed400, collision/camera/depth/idle/layout/music/NPC/interaction settings and all running PNGs remain unchanged. Existing tests still verify current frames, revision-tagged textures, loops and cache invalidation.

## v6 training and absolute epsilon horizon

Schema **guard-q-v6**, format2; recovery signature records catchHp100/catchSp0 and catalog cost30. v5 and older tables reject safely. Smoke **${smoke.config.episodes} episodes** from an empty table; full **100,000 episodes from zero**, seed **${train.config.seed}**. No warm start, alpha.10/gamma.95, rewards unchanged.

Implementation: **epsilonDecayEpisodes=45000**, independent of config.episodes. With zero-based episode index i: epsilon=1+(.05−1)×clamp(i/45000,0,1). i0=1; i22500=.525; i45000 and all later indices=.05. This does **not** stretch to75k. Checkpoints count completed episodes;60k/80k/100k all record epsilon.05.

Target start mix75% normal/25% randomized; selected-checkpoint actual **${train.summary.startCounts.normal}/${train.summary.startCounts.randomized}**. Bot weights Aggressive50%/Random25%/Tricky25%; actual selected ${Object.entries(train.perBot).map(([b,r])=>b+' '+r.episodes).join(', ')}. Existing bot action weights retained; all bots filter current legality, so low-SP Catch Breath is unavailable rather than free SP recovery. Randomized starts still draft valid states, run one real unrewarded setup round and reject terminal/forced-Guard-skip results.

Sparse Q values/visits, five percentage HP bins, Donut value state, unvisited-valid TRAIN priority, visited-only greedy EVAL and explicit Random fallback remain. Current hidden Player actions are excluded. Human BattleScene remains EVAL/epsilon0/no table mutation, with P/F2 intact. Heuristic remains diagnostic only. Committed-but-cancelled Guard decisions retain one transition/update/visit; forced skips aggregate reward without visits.

${table(['Checkpoint','Table path','Completed / planned','Epsilon','SHA256'],result.checkpoints.map(c=>[c.policy,c.file,c.metadata.episodes+' / '+c.metadata.plannedEpisodes,c.metadata.finalEpsilon,c.sha256]))}
Matching training metrics are retained beside every checkpoint. Checkpoints are prefixes of the same seeded100k run, not three independently annealed runs. Callback serialization and RNG reproducibility tests remain.

## Coverage comparison

${table(['Checkpoint','States','Visited pairs','Mean actions/state','Median','Fully explored observed states %'],result.checkpoints.map(c=>[c.policy,c.coverage.encounteredStates,c.coverage.learnedPairs,f(c.coverage.meanVisitedActions),c.coverage.medianVisitedActions,f(c.coverage.fullyExploredSeenLegalPercent)]))}
${table(['Checkpoint','1 action','2 actions','3 actions','4 actions','5 actions','6 actions'],result.checkpoints.map(c=>[c.policy,...[1,2,3,4,5,6].map(n=>c.coverage.statesByVisitedActions[n]+' ('+f(c.coverage.percentByVisitedActions[n])+'%)')]))}
Fully explored means all members of the union of legal actions actually observed in each encoded state were visited. Rare states still have thin experience. The theoretical space remains259,200; no new HP bins or preallocation.

The extra40k low-epsilon episodes add **${result.checkpoints[2].coverage.learnedPairs-result.checkpoints[0].coverage.learnedPairs} visited pairs** and **${result.checkpoints[2].coverage.encounteredStates-result.checkpoints[0].coverage.encounteredStates} states**. Mean actions/state grows${f(result.checkpoints[0].coverage.meanVisitedActions)} →${f(result.checkpoints[2].coverage.meanVisitedActions)} (${f(100*(result.checkpoints[2].coverage.meanVisitedActions/result.checkpoints[0].coverage.meanVisitedActions-1))}%); fully explored states increase${f(result.checkpoints[2].coverage.fullyExploredSeenLegalPercent-result.checkpoints[0].coverage.fullyExploredSeenLegalPercent)} percentage points. This is useful but modest improvement; median remains2 and the sparse tail is not solved.

## Held-out comparison and production choice

Evaluation seed **${result.seed}**, **${result.episodesPerBot} normal full battles per policy/bot**, paired episode seeds,100-round cap, no randomized evaluation starts, no learning/table mutation. Selection uses these held-out validation results; no independent final selection test is claimed.

${table(['Guard policy','Player bot','W/L/D','Win %','Mean rounds','Mean reward'],result.results.map(r=>[r.policy,r.bot,[r.wins,r.losses,r.draws].join('/'),f(100*r.winRate),f(r.averageRounds),f(r.averageReward)]))}
${table(['Policy overall (3000)','W/L/D','Win %','Mean rounds','Mean reward'],all.map(r=>[r.policy,[r.wins,r.losses,r.draws].join('/'),f(pct(r.wins,3000)),f(r.meanRounds),f(r.meanReward)]))}
Production selected: **${selection.selected}**. ${selection.reason} All three checkpoints retained; chosen bytes copied to public/assets/ai/guard_qtable.json. No additional balance adjustments followed evaluation.

## Behavior comparison

Aggregate3000-battle checkpoint audit. Donut counts use executed restoration events; HP/value buckets use predecision state. Effective healing uses actual capped event HP. Defend chains break on forced Guard skips. RILED hit/miss/crit include completed physical attacks, excluding cancelled attacks.

${table(['Checkpoint','Donut CRIT/LOW/MID/HIGH/VERY_HIGH','FULL / PARTIAL','Mean heal','Mean waste','<100 HP n (%)','Above75% HP n (%)'],qs.map(r=>[r.policy,['CRITICAL','LOW','MID','HIGH','VERY_HIGH'].map(k=>r.d.donutByHp[k]).join('/'),r.d.donutByValue.FULL_VALUE+' / '+r.d.donutByValue.PARTIAL_VALUE,f(r.d.donutHp/r.d.donuts),f(200-r.d.donutHp/r.d.donuts),r.d.donutUnder100+' ('+f(pct(r.d.donutUnder100,r.d.donuts))+')',r.d.donutAbove75+' ('+f(pct(r.d.donutAbove75,r.d.donuts))+')']))}
${table(['Checkpoint','CRITICAL Guard Defend %','Longest Defend chain','Longest while Player CRITICAL','Round-limit draws','Unseen fallback decisions'],qs.map(r=>[r.policy,f(pct(r.d.criticalGuardDefends,r.d.criticalGuardDecisions)),r.d.maxDefendChain,r.d.maxPlayerCriticalDefendChain,r.roundLimitDraws,r.d.fallbackDecisions]))}
${table(['Checkpoint','Crack n (% decisions)','Immediate repeats','RILED entries / battles','Hit %','Miss %','Crit % of hits','Stumbles (% misses)','Fatal stumbles'],qs.map(r=>[r.policy,r.d.crack+' ('+f(pct(r.d.crack,sum(r.d.guardActions)))+')',r.d.repeatCrack,r.d.riledEntries+' / '+r.d.riledBattles,f(pct(r.d.riledHits,r.d.riledHits+r.d.riledMisses)),f(pct(r.d.riledMisses,r.d.riledHits+r.d.riledMisses)),f(pct(r.d.riledCrits,r.d.riledHits)),r.d.stumbles+' ('+f(pct(r.d.stumbles,r.d.riledMisses))+')',r.d.fatalStumbles]))}

### Catch Breath audit

All15 policy/bot combinations use the same held-out1000-battle setup. Selection is counted when a legal commitment locks; execution/cancellation is observed at the Player's actual action resolution. “Before use” averages are at execution (not merely round start); they exclude cancelled commitments. Audit-only wrappers snapshot numeric fields without RNG calls or changing choices, rewards or combat. A regression test proves instrumented and uninstrumented traces match exactly.

${table(['Guard policy','Player bot','Selected','Executed','Cancelled','Mean HP before','Mean SP before','Total SP spent'],result.results.map(r=>[r.policy,r.bot,r.catchBreath.selected,r.catchBreath.executed,r.catchBreath.cancelled,f(r.catchBreath.averageHpBeforeUse),f(r.catchBreath.averageSpBeforeUse),r.catchBreath.totalSpSpent]))}
${table(['Guard policy','Player bot','Mean effective HP','Mean wasted HP','Uses healing<50 HP %','Uses at full HP %','Every execution cost30'],result.results.map(r=>[r.policy,r.bot,f(r.catchBreath.averageEffectiveHealing),f(r.catchBreath.averageWastedHealing),f(r.catchBreath.under50Percent),f(r.catchBreath.fullHpPercent),r.catchBreath.everyExecutedCost30?'PASS':'FAIL']))}
Every measured execution asserts30 SP deducted, zero SP restored, correct capped healing and no defense; cancelled commitments assert zero cost/heal. All selected counts reconcile to executed+cancelled. Because Catch Breath is FAST, normal Whistle cannot cancel it later in the same round; carried stun prevents selection and consumes a null opportunity. Deterministic tests separately cover pre-execution interruption/death without charging/healing.

### Aggressive diagnostics

Action percentages count commitments, including later cancellations. Guard ATTACK is damaging; Whistle/Crack/etc are setup. Player Attack/Backpack/Talk Smack are damaging. Actual damage totals exclude overkill and stumble self-damage. Raw JSON also includes executed counts.

${table(['Policy vs Aggressive','Guard damage/setup %','Player damaging %','Player Catch count (%)','Player Backpack count (%)','Guard Defend %','Mean Guard / Player damage','Mean Donut heal'],result.results.filter(r=>r.bot==='aggressive').map(r=>[r.policy,f(r.rates.guardDamagingPercent)+' / '+f(r.rates.guardSetupPercent),f(r.rates.playerDamagingPercent),(r.diagnostics.playerActions.catchBreath??0)+' ('+f(r.rates.playerCatchBreathPercent)+')',(r.diagnostics.playerActions.swingBackpack??0)+' ('+f(r.rates.playerBackpackPercent)+')',f(r.rates.guardDefendPercent),f(r.rates.averageGuardDamage)+' / '+f(r.rates.averagePlayerDamage),f(r.rates.meanEffectiveDonut)]))}
${table(['Policy vs Aggressive','Basic Attack n (%)','Backpack n (%)','Catch Breath n (%)','Player damaging / other %','Mean Player healing/battle','Mean Catch SP/battle'],result.results.filter(r=>r.bot==='aggressive').map(r=>[r.policy,(r.diagnostics.playerActions.attack??0)+' ('+f(pct(r.diagnostics.playerActions.attack??0,sum(r.diagnostics.playerActions)))+')',(r.diagnostics.playerActions.swingBackpack??0)+' ('+f(r.rates.playerBackpackPercent)+')',r.catchBreath.selected+' ('+f(r.rates.playerCatchBreathPercent)+')',f(r.rates.playerDamagingPercent)+' / '+f(100-r.rates.playerDamagingPercent),f(r.catchBreath.effectiveHealing/r.episodes),f(r.catchBreath.totalSpSpent/r.episodes)]))}
### Available v5 comparison

Archived v5 production was Q60k. Its Catch Breath was free+35SP with zero HP healing, so Catch healing/SP-cost values below are zero by the v5 rule (not a newly instrumented v5 replay). Other counts/damage are the preserved paired evaluation. v6 uses the same held-out seed/count; changed dynamics and100k versus60k training mean this is descriptive, not isolation of one causal effect.

${table(['Production vs Aggressive','Win %','Attack n (%)','Backpack n (%)','Catch n (%)','Player damaging / other %','Guard damaging / setup %','Mean Guard / Player damage','Player heal/battle','Catch SP/battle'],[v5.results.find(r=>r.policy==='q-60k'&&r.bot==='aggressive'),result.results.find(r=>r.policy===selection.selected&&r.bot==='aggressive')].map((r,i)=>[i?'v6 '+selection.selected:'v5 q-60k',f(100*r.winRate),(r.diagnostics.playerActions.attack??0)+' ('+f(pct(r.diagnostics.playerActions.attack??0,sum(r.diagnostics.playerActions)))+')',(r.diagnostics.playerActions.swingBackpack??0)+' ('+f(r.rates.playerBackpackPercent)+')',(r.diagnostics.playerActions.catchBreath??0)+' ('+f(r.rates.playerCatchBreathPercent)+')',f(r.rates.playerDamagingPercent)+' / '+f(100-r.rates.playerDamagingPercent),f(r.rates.guardDamagingPercent)+' / '+f(r.rates.guardSetupPercent),f(r.rates.averageGuardDamage)+' / '+f(r.rates.averagePlayerDamage),i?f(r.catchBreath.effectiveHealing/r.episodes):'0 (v5 rule)',i?f(r.catchBreath.totalSpSpent/r.episodes):'0 (v5 rule)']))}
### Remaining irrational behavior and limits

Guard weaknesses remain:10-decision maximum Defend chains at100k, some Defend while Player is CRITICAL, repeated Crack, early partial-value Donuts, and thin state/action experience.80k has better Donut efficiency and shorter worst Defend chains, but worse Aggressive/overall results.100k is a tradeoff, not evidence of an optimal policy or complete coverage.

Player bots also misuse the redesigned action. Against selected Q100k, Aggressive selects Catch Breath83 times across1000 battles;61.45% occur at full HP, mean effective heal36.39, and total healing is only3.02HP per battle. Random/Tricky also waste many heals. Their inherited action weights were intentionally not retuned: the old low-SP Catch preference is now filtered out by30-SP validity. Therefore these bots are imperfect diagnostics of how a human will use paid healing. The v5→v6 win-rate difference cannot be cleanly attributed to HP healing alone; the SP economy and learned training trajectory also changed. No reward/bot/balance change was made to improve these results.
## Validation and remaining work

Tests **${verify.testsPassed}/${verify.testsTotal} passed**, failures **${verify.testsFailed}**; syntax **${verify.syntax}**; production build **${verify.buildExitCode===0?'PASS':'FAIL'}**, existing chunk-size warning. Built selected table/audio match runtime assets. Integrity verifies unchanged music, exploration settings, existing run imagery, insult array, SFX source collection and unrelated artwork. No SFX integrated and no DDA.

Manual browser checks remain: Catch Breath cost/HP bars/disabled selection, capped heal feedback, Talk Smack five-pose motion/point hold/dialogue synchronization, P/F2 and music transitions. Running is intentionally unchanged following the user's clarification.

Raw comparison: tools/guard-v6-comparison.json; production metrics and representative Q/visit audit: public/assets/ai. Reproduce with trainGuard.mjs (100k/checkpoints60000,80000,100000), compareGuardCheckpoints.mjs and reportGuardV6.mjs. Source inventory tool: inspectRunSourceInventory.mjs.
`;
await writeFile('docs/FINAL_CATCH_ART_CHECKPOINTS_V6.md',md);
console.log('Wrote docs/FINAL_CATCH_ART_CHECKPOINTS_V6.md');
