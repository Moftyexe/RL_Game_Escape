import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {THEORETICAL_STATE_COUNT,PREVIOUS_THEORETICAL_STATE_COUNT} from '../src/game/ai/StateEncoder.js';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const train=await json('public/assets/ai/guard_training_metrics.json');
const evaluation=await json('public/assets/ai/guard_evaluation_metrics.json');
const audit=await json('public/assets/ai/guard_policy_inspection.json');
const starts=await json('public/assets/ai/guard_start_coverage.json');
const manifest=await json('public/assets/audio/battle-manifest.json');
const raw=await readFile('public/assets/ai/guard_qtable.json'),saved=JSON.parse(raw);
const hash=createHash('sha256').update(raw).digest('hex');
if(saved.stateSchema!=='guard-q-v4'||hash!==evaluation.table.sha256||hash!==audit.tableSha256)throw Error('Mismatched report artifacts');
const b=audit.behavior,c=train.coverage,f=n=>Number(n).toFixed(2),pct=(n,d)=>f(100*n/d)+'%';
const table=(headers,rows)=>'| '+headers.join(' | ')+' |\n| '+headers.map(()=> '---').join(' | ')+' |\n'+rows.map(r=>'| '+r.join(' | ')+' |').join('\n')+'\n';
let text=`# Guard v4 coverage and battle music experiment

## Scope and implementation

Current project inspected before edits. It already contained the v4 coverage/state/policy/audio implementations, but shipped a v3 Q-table. Validated those implementations, completed fresh training, improved audit accounting, and replaced stale artifacts. CombatSystem, Combatant, RandomGuardPolicy, rewards, musician visuals/placement and running animations were not edited. No combat rebalance and no DDA.

Schema **${saved.stateSchema}**, Q format **${saved.version}**. Older tables are rejected safely. Sparse Q values, explicit integer visit counts and observed legal-action unions serialize independently. Q=0 does not imply unvisited. TRAIN selects uniformly among unvisited CURRENTLY VALID actions with injected seeded RNG before epsilon-greedy. Forced skips/death have no decision. A committed action cancelled by OFF_GUARD/death still receives its transition's one Q update and one visit, matching the existing commitment-based decision model. Forced rounds aggregate into that transition without extra visits. Training asserts total decisions = Q updates = visits (${c.totalVisits}). Presentation never increments visits.

EVAL considers only visited valid actions. If there are none, that decision uses unchanged RandomGuardPolicy, without Q mutation. F2 displays Q and N, UNVISITED, and “Q state unseen — Random fallback”; hidden current Player action remains excluded. Live BattleScene uses QLearningGuardPolicy, never the heuristic. Audit fallback decisions: **${b.fallbackDecisions}/${b.decisions} (${pct(b.fallbackDecisions,b.decisions)})**.

## Training and coverage

Smoke: **200 episodes**, separate empty table, default seed ${train.config.seed}, artifacts tools/guard-v4-smoke-*. Full: **${train.config.episodes} episodes from zero**, seed ${train.config.seed}; no smoke/v3 warm start. Alpha .10, gamma .95, unchanged epsilon 1 → .05 over the first 75% of episode indices, then .05; 100-round limit. 40,000 was practical and retained as requested; coverage remains incomplete, so this is not a claim of convergence.

Target starts 75% normal / 25% randomized; actual **${train.summary.startCounts.normal}/${train.summary.startCounts.randomized}**. Target bots Aggressive/Random/Tricky 50/25/25%; actual ${Object.entries(train.perBot).map(([k,v])=>k+' '+v.episodes).join(', ')}. Randomized starts retain the valid draft → real unrewarded setup round → reject terminal/forced-Guard-skip method. Reconstructed randomized Donut categories: ${Object.entries(starts.donutStates).map(([k,v])=>k+' '+v).join(', ')}.

Encountered states **${c.encounteredStates}**; learned pairs **${c.learnedPairs}**. Mean **${f(c.meanVisitedActions)}**, median **${c.medianVisitedActions}** visited actions/state. Previous 35,187/16,266 = **2.16**; relative mean improvement **${f(100*(c.meanVisitedActions/(35187/16266)-1))}%**. ${c.fullyExploredSeenLegalStates} states (**${f(c.fullyExploredSeenLegalPercent)}%**) explored every legal option observed there; ${c.exploredSeenLegalPairs}/${c.seenLegalPairs} observed legal pairs explored (${pct(c.exploredSeenLegalPairs,c.seenLegalPairs)}). This measures the union of authoritative legal options actually observed for each encoded state, including exact-SP/resource differences within bins.

${table(['Visited actions','States','Percent'],Object.entries(c.statesByVisitedActions).map(([n,count])=>[n,count,f(c.percentByVisitedActions[n])+'%']))}
The improvement is modest: ${f(c.percentByVisitedActions[1]+c.percentByVisitedActions[2])}% still have only 1–2 visited actions. Unvisited-first selection guarantees exploration on revisits, not revisits themselves. Expanded state space and rare randomized states leave sparse tails. EVAL now honestly excludes untried actions instead of treating their zeros as superior.

## Donut representation and behavior

Five percentage HP bins remain unchanged for both actors. Donut encoding replaces the boolean: UNAVAILABLE if spent; FULL_VALUE if available and missing >=180 HP; PARTIAL_VALUE if available and missing <180 HP (including full HP, where the existing validity mask excludes it). At 820/1000 HP it is FULL_VALUE; at 821 it is PARTIAL_VALUE. No tactical healing threshold was added; partial-value Donut remains selectable.

Theoretical states: **${PREVIOUS_THEORETICAL_STATE_COUNT.toLocaleString()} → ${THEORETICAL_STATE_COUNT.toLocaleString()}**, **1.5×**. Formula: 5² HP × 3² SP × 4² mental status × 2 Wife × 3 Donut × 2 Player stun × 6 previous-action category. This is a Cartesian upper bound, including unreachable combinations, not preallocation.

Audit: 1,000 normal full battles per bot, seed ${audit.seed}, held out from training. Donut commitments **${b.donuts}**, executed **${b.executedDonuts}**. HP categories below use predecision HP; action is FAST, and actual restored events measure effective healing. Cancelled commitments are excluded from effective/wasted averages.

${table(['Guard HP bucket','Executed Donuts'],Object.entries(b.donutUseByHpBucket).map(([k,v])=>[k,b.executedDonutsByHp[k]??0]))}
FULL_VALUE **${b.executedDonutsByValue.FULL_VALUE} (${pct(b.executedDonutsByValue.FULL_VALUE,b.executedDonuts)})**; PARTIAL_VALUE **${b.executedDonutsByValue.PARTIAL_VALUE} (${pct(b.executedDonutsByValue.PARTIAL_VALUE,b.executedDonuts)})**. Above 75% HP **${b.executedDonutsAbove75}/${b.executedDonuts} = ${pct(b.executedDonutsAbove75,b.executedDonuts)}**, compared with prior 85.10% (earlier 93.89%). Mean effective heal **${f(b.meanEffectiveHeal)} HP**; mean wasted **${f(b.meanWastedHeal)} HP**; SP restored **${b.donutRestoredSp}**. Early healing remains a substantial learned-policy weakness. Above-75% alone does not imply waste: 760 HP can accept all 180.

## Representative EVAL states

All examples have Guard/Player SP50, no Player mental status/stun, Wife and Donut available, previous Player action ATTACK. Guard status NONE except the RILED example. These are exact encoded keys, not nearby-state substitutions. Values are rounded only for display. UNVISITED means N=0 and excludes the action from greedy candidates; valid options are all six in these examples. Ties use seeded RNG.

`;
const labels={A:'Guard CRITICAL / Player CRITICAL',B:'Guard CRITICAL / Player HIGH',C:'Guard VERY_HIGH / Player CRITICAL',D:'Guard MID / Player MID',E:'Guard RILED MID / Player LOW',F:'Guard LOW / Player HIGH / FULL_VALUE',G:'Guard CRITICAL / Player LOW',H:'Guard VERY_HIGH / Player HIGH / PARTIAL_VALUE'};
for(const s of audit.representativeStates){
 text+=`### ${labels[s.label]}\n\nHP ${s.guardHp}/${s.playerHp}; Donut ${s.donutState}. EVAL chooses **${s.chosen}**${s.fallback?' (Random fallback)':''}.\n\n`;
 text+=table(['Valid action','Q','Visits','Status'],s.validActions.map(a=>[a,s.visits[a]?f(s.values[a]):'—',s.visits[a],s.visits[a]?'VISITED':'UNVISITED']))+'\n';
}
text+=`## Behavior and remaining irrational choices

CRITICAL-Guard Defend **${b.criticalActions.defend}/${Object.values(b.criticalActions).reduce((a,n)=>a+n,0)} = ${pct(b.criticalActions.defend,Object.values(b.criticalActions).reduce((a,n)=>a+n,0))}**. Longest overall Defend chain **${b.maxDefendStreak}**; chains of >=2 while Player CRITICAL **${b.criticalPlayerDefendChains}**, longest **${b.longestCriticalPlayerDefendChain}**. Q audit round-limit draws **${b.roundLimitDraws}**. Forced skipped rounds break chains.

Crack commitments **${b.cracks}**, executed **${b.crackExecuted}**, immediate repeated commitments **${b.repeatedCracks}**. Guard RILED entries (including Talk Smack and refreshes) **${b.riledEntries}**, battles with entry **${b.battlesRiled}/3000**. Completed RILED physical attacks **${b.riledPhysical}**: hits ${b.riledHits} (${pct(b.riledHits,b.riledPhysical)}), misses ${b.riledMisses} (${pct(b.riledMisses,b.riledPhysical)}); critical hits ${b.riledCrits} (${pct(b.riledCrits,b.riledHits)} of hits). Stumbles **${b.stumbles}**, **${pct(b.stumbles,b.riledMisses)} of misses**, ${pct(b.stumbles,b.riledPhysical)} of attacks; fatal **${b.fatalStumbles}**. No RILED/stumble mechanics changed.

Remaining weaknesses include early partial-value Donuts, Defend with Player CRITICAL (${b.criticalPlayerActions.defend} commitments), repeated Crack, and sparse critical states choosing nonfinishers. Example A selects Defend among equally learned -0.02 actions with only one visit each; two alternatives remain untried. Visit masking fixes artificial unseen-zero optimism, not noisy/undersampled learned values or all state aliasing. No rules were added to hide these outcomes.

## Held-out policy comparison

Evaluation seed **${evaluation.seed}**, **${evaluation.episodesPerBot} battles per policy/bot**, identical paired episode seeds, normal starts only, max100 rounds. W/L/D and rewards are Guard-perspective. Evaluation asserts the table is unchanged.

Heuristic is diagnostic only: heal at <=25% HP with >=180 missing; attack at Player <=10%; otherwise use available Wife to cleanse/buff/recover SP, then seeded weighted legal choices favoring Attack/Whistle/Crack (Defend gains weight at low SP). It reads only whitelisted public observations. It is intentionally small, not an optimal-policy bound, and never supplies training targets or production choices.

${table(['Guard policy','Player bot','W/L/D','Win %','Mean rounds','Mean reward'],evaluation.results.map(r=>[r.policy,r.bot,[r.wins,r.losses,r.draws].join('/'),f(100*r.winRate),f(r.averageRounds),f(r.averageReward)]))}
`;
const totals=['random','q-learning','heuristic'].map(kind=>{const rows=evaluation.results.filter(r=>r.policy===kind),sum=k=>rows.reduce((n,r)=>n+r[k],0);return[kind,[sum('wins'),sum('losses'),sum('draws')].join('/'),f(100*sum('wins')/3000),f(sum('averageRounds')/3),f(sum('averageReward')/3)];});
text+=table(['Policy overall','W/L/D (3000)','Win %','Mean rounds','Mean reward'],totals);
text+=`
Against Aggressive: Random 0.1%, Q 13.4%, heuristic 18.3%. Because the heuristic also loses heavily, this experiment suggests the matchup favors Aggressive, rather than Q coverage being the sole cause. Q still trails the simple heuristic and has weak coverage, so RL/state limitations also remain plausible. This heuristic is not proof of the best achievable Guard performance. No combat adjustment follows from these results.

## Battle audio

Detected source **${manifest.music.source}**, actual **MP3** (ID3 header), ${manifest.music.bytes} bytes. Runtime **public/${manifest.music.file}**; byte-identical copy, no transcode; SHA256 ${manifest.music.sha256}. Re-scanned root/source and runtime audio files; this is the detected battle source. Central volume **0.35** in src/game/audio/musicConfig.js; loop **true**; SFX untouched.

School → Battle: per-SoundManager interlock pauses hallway preserving seek/preference, then starts battle. Battle → School: stop battle before scene resume; hallway resumes its saved position if enabled. One cached instance per track/SoundManager; repeated input/unlock/battles reuse it. Battle restarts from its beginning each encounter. Musician still toggles only session hallway preference, so hallway OFF does not suppress battle. Scene pause/resume, shutdown listener cleanup and interlock are covered by audio tests. Unlock, pointer and keyboard retry safely; missing/undecodable audio cannot crash or strand hallway. Battle pause cannot be undone by an unrelated unlock.

## Verification and remaining manual checks

`;
const log=async path=>{const bytes=await readFile(path);return bytes[0]===255&&bytes[1]===254?bytes.subarray(2).toString('utf16le'):bytes.toString('utf8');};
const tests=await log('tools/v4-final-tests.txt');
const syntax=await log('tools/v4-syntax.txt');
const build=await log('tools/v4-build.txt');
const verification=await json('tools/v4-verification.json');
text+=`Tests: **${tests.match(/# pass (\d+)/)?.[1]}/${tests.match(/# tests (\d+)/)?.[1]} passed**, failures ${tests.match(/# fail (\d+)/)?.[1]}. Includes visits/zero distinctions, seeded unvisited selection and epsilon resumption, validity/forced/cancelled timing, EVAL fallback/nonmutation, Donut boundary/randomized categories, heuristic hidden-action isolation/live exclusion, and audio transition/singleton/unlock/missing-asset cases.\n\nSyntax: ${syntax.trim()}. Production build: **${verification.buildExitCode===0?'PASS':'FAIL'}**; existing large-chunk warning. Built Q-table and battle audio verified byte-identical to public assets. Initial sandbox build was blocked by parent-directory access; approved direct rerun exited 0. PowerShell redirection had treated the warning as an error; direct execution resolved the status.\n\nManual browser checks still required: actual MP3 decoding and perceived loudness; locked-autoplay retry in target browsers; audible hallway seek preservation through School → Battle → School → Battle; musician toggle off/on around encounters. Automated sound-manager tests verify lifecycle logic, not real browser audio output. No live browser/audio check is claimed.\n\nTable SHA256: ${hash}. Full precision Q/visits, spent-resource examples and behavioral counts: public/assets/ai/guard_policy_inspection.json. Reproduce with tools/trainGuard.mjs, evaluateGuard.mjs, inspectGuardPolicy.mjs, auditTrainingCoverage.mjs and reportGuardV4.mjs.\n`;
await writeFile('docs/GUARD_COVERAGE_BATTLE_AUDIO_V4.md',text);
console.log('Wrote docs/GUARD_COVERAGE_BATTLE_AUDIO_V4.md');
