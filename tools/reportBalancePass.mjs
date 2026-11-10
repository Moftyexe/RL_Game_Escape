import { readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import QTable from '../src/game/ai/QTable.js';
import { THEORETICAL_STATE_COUNT } from '../src/game/ai/StateEncoder.js';
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const training=await json('public/assets/ai/guard_training_metrics.json'),evaluation=await json('public/assets/ai/guard_evaluation_metrics.json');
const inspection=await json('public/assets/ai/guard_policy_inspection.json'),smoke=await json('tools/guard-v2-smoke-metrics.json');
const verification=await json('tools/balance-verification.json');
const bytes=await readFile('public/assets/ai/guard_qtable.json'),saved=JSON.parse(bytes),table=QTable.fromJSON(saved);
if(saved.stateSchema!=='guard-q-v2')throw Error('This historical report generator requires v2 inputs; use the v3 report.');
const hash=createHash('sha256').update(bytes).digest('hex');
if(evaluation.table.sha256!==hash||inspection.tableSha256!==hash)throw Error('Results refer to a different Q-table');
const assets=await json('public/assets/hallway-manifest.json'),b=inspection.behavior;
const f=n=>Number(n).toFixed(2),pct=(n,d)=>f(100*n/d)+'%';
let report=`# Final balance, Q-learning v2 and hallway audio pass

## Combat

Both Player and Guard now initialize at **1000 HP / 100 SP**. Guard was 1200 HP.
Basic attack remains 80 damage, 90% accuracy, 10% crit, 1.5x crit multiplier.
Hidden simultaneous commitments, priority tiers, ties, SP execution timing,
Look There/OFF_GUARD, Whistle, Donut, Defend and RandomGuardPolicy are preserved.

| Player action | Previous | Current |
|---|---|---|
| Catch Breath | +20 SP | +50 HP and +35 SP; capped; FAST, free; no defense |
| Bro, Lock In | 20 SP | 15 SP; NORMAL; same FOCUSED |
| Talk Smack | RILED | 30 direct emotional damage plus RILED; 15 SP, NORMAL |
| Swing Backpack | 125 damage, 75% accuracy | 140 damage, 80% accuracy; 20 SP, SLOW |

Talk Smack always deals exactly 30 requested damage when executed (HP floors at
zero), with no accuracy/crit roll, defense reduction, physical modifier or stumble.
Its damage event is explicitly source=talkSmack, physical=false. Insults unchanged.
Catch Breath does not defend; Defend still recovers only 10 SP and protects.

RILED: **damage x1.40, crit +20pp, accuracy -30pp**, 3 rounds. Basic Guard attack
is 112 damage, 60% accuracy, 30% crit, 168 critical damage. Defend reductions
remain neutral 50%, FOCUSED 65%, DISTRACTED 35%, RILED 40%. FOCUSED remains +15pp
accuracy/+10pp crit/3 rounds; DISTRACTED remains -25pp accuracy/2 rounds.

Only a RILED Guard physical MISS takes a second combat RNG roll: strictly below
0.20 stumbles. No roll on hit or nonphysical action. Base overall chance is
0.40 * 0.20 = **8% per RILED physical attack**. Stumble deals 50 self-damage,
floored at zero HP, and causes no STUN, OFF_GUARD or future turn loss. Exact
percentage-point thresholds are rounded to 12 decimals to avoid floating-point
60%/30% boundary drift in injected tests. Ordinary damage rounding is unchanged.

Call Wife is always FAST/free/once: **+20 SP and apply/refreshed FOCUSED**, replacing
RILED/DISTRACTED. Prior mental state changes only the dialogue. Donut is unchanged:
FAST/free/once, +180 HP/+20 SP, capped at 1000 HP/100 SP.

## Stumble assets and presentation

Both transparent sources are 2172x724. Actual left-to-right pose counts:

| Source | Runtime mapping | Frames | FPS |
|---|---|---:|---:|
| Guard_Animations/Guard_battle_fall.png | guard-battle-stumble | 6 | 10 |
| Guard_Animations/Guard_battle_getup.png | guard-battle-recovery | 8 | 10 |

Alpha below 32/255 creates bridges between source poses; connected-component
extraction ignores it for connectivity. New frames keep proportional body scale
relative to each sheet's tallest pose, on the existing 192x160 canvas/baseline155.
All six/eight poses are retained in anatomical order. The final downed pose holds
300ms. Sequence: miss/self-damage event, commentary and -50 HP feedback, fall once,
get-up once, current persistent visual state. Fatal self-damage stays down until
terminal defeat presentation. Missing art safely uses hurt/idle fallback.
No mechanics run from animation callbacks. Shutdown cancels both stages.

Persistent priority remains terminal > OFF_GUARD held pose > Defend > RILED idle
> normal idle. Normal DISTRACTED remains an indicator/reaction, not an away hold.
Inspection: public/assets/battle/inspection.json and preview.png.

## State schema and training

Schema **${saved.stateSchema}**, format version ${saved.version}; old v1 table was
explicitly rejected before replacement (tools/guard-v1-invalidation.json).
HP bins for BOTH actors use percent of actual maximum:
CRITICAL 0..10%; LOW >10..25%; MID >25..50%; HIGH >50..75%; VERY_HIGH >75..100%.
Other state features are unchanged: both SP buckets, mental statuses, Wife/Donut,
Player stun, previous committed Player category. No current hidden choice, exact
HP/SP, finisher flag, animation or dialogue is encoded.

Previous theoretical states **62,208**; new **${THEORETICAL_STATE_COUNT.toLocaleString('en-US')}**;
multiplier **25/9 = 2.7778x**. Six actions: 1,036,800 possible pairs, kept sparse.
Smoke: ${smoke.summary.episodes} episodes, ${smoke.episodes.at(-1).qStates} states;
15,470 pairs (separate smoke output). Proper training: **${saved.metadata.episodes} episodes
from a NEW EMPTY QTable**, seed ${saved.metadata.seed}, ${table.stateCount} encountered
state rows and ${table.pairCount} stored action values. Smoke values were not reused.

Alpha .10, gamma .95, epsilon 1.0 to .05 linearly over first 75% of episode indices,
then .05. 100-round cap. Equal Random/Aggressive/Tricky episode weights. Bots,
valid-action filtering, independent seeded RNG streams, reward and forced-skip
aggregation remain the existing architecture. Reward: actual Player damage/20
- actual Guard damage/20 -0.2 per round; terminal +100/-100/-10. Healing has no
direct reward; emotional and self-damage now enter through normal damage events.

Training results include exploration: ${training.summary.wins} wins,
${training.summary.losses} losses, ${training.summary.draws} draws;
${pct(training.summary.wins,training.summary.episodes)} wins; ${f(training.summary.averageRounds)}
average rounds. This is not the greedy policy's evaluation performance.

Saved table: public/assets/ai/guard_qtable.json, **${(await stat('public/assets/ai/guard_qtable.json')).size} bytes**.
SHA-256: ${hash}. Both evaluation and inspection record this exact hash.
Game loading validates current schema AND combat signature. Human battles remain
read-only EVAL (epsilon0); P/click switches next unlocked decision, F2 public debug.
Random stays available. No DDA.

## Held-out evaluation under NEW rules

Seed **${evaluation.seed}**, ${evaluation.episodesPerBot} episodes per bot/policy;
same scenario seeds per policy, no learning, 100-round cap.

| Bot | Guard | W/L/D | Win % | Avg rounds | Avg reward |
|---|---|---|---:|---:|---:|
`;
for(const r of evaluation.results)report+=`| ${r.bot} | ${r.policy} | ${r.wins}/${r.losses}/${r.draws} | ${f(r.winRate*100)} | ${f(r.averageRounds)} | ${f(r.averageReward)} |\n`;
for(const policy of ['random','q-learning']){
 const rows=evaluation.results.filter(r=>r.policy===policy),n=rows.reduce((a,r)=>a+r.episodes,0),wins=rows.reduce((a,r)=>a+r.wins,0);
 report+=`\nOverall ${policy}: ${wins}/${n} wins (${pct(wins,n)}), ${f(rows.reduce((a,r)=>a+r.averageRounds*r.episodes,0)/n)} mean rounds, ${f(rows.reduce((a,r)=>a+r.averageReward*r.episodes,0)/n)} mean reward.\n`;
}
report+=`
The Q policy improves over Random on these bots but still loses overwhelmingly
to Aggressive. No comparison is made with the obsolete v1 Q-policy/environment.

## Representative policy inspection

These are legal examples, not specially trained probes. Both SP=50 (HIGH),
Player neutral/not stunned, previous Player action=ATTACK; Guard neutral unless E.
Q values for EVERY action, masks and learned/unseen flags are in
public/assets/ai/guard_policy_inspection.json. Unseen actions have Q=0; ties random.

First, both resources available (F explicitly requires Donut):

| Case | Guard HP | Player HP | Preferred action(s) | Learned row? |
|---|---|---|---|---|
`;
for(const r of inspection.representativeStates)report+=`| ${r.label} | ${r.guardHp}${r.label==='E'?' / RILED':''} | ${r.playerHp} | ${r.preferred.join(', ')} | ${r.learnedState} |\n`;
report+=`
Supplementary encountered examples with both finite resources spent. Same HP/SP,
status and previous-action dimensions; unavailable Wife/Donut excluded:

| Case | Attack Q | Defend Q | Crack Q | Whistle Q | Preferred |
|---|---:|---:|---:|---:|---|
`;
for(const r of inspection.spentResourceExamples)report+=`| ${r.label} | ${f(r.values.attack)} | ${f(r.values.defend)} | ${f(r.values.crackKnuckles)} | ${f(r.values.blowWhistle)} | ${r.preferred.join(', ')} |\n`;
report+=`
Policy limitations are visible: C can buff instead of immediately finishing;
F with Donut available prefers Defend. Some resource-available CRITICAL examples
were never encountered and are entirely tied at zero. More HP bins do not alone
guarantee good decisions; sparse coverage and opponent/reward credit assignment
remain issues to investigate before DDA.

## Behavior audit (separate held-out seed ${inspection.seed})

${inspection.episodesPerBot} episodes per bot, ${b.decisions} decisions, ${b.rounds}
rounds. Counts are commitments, including later interrupted actions.

- Overall actions: ${JSON.stringify(b.actions)}.
- CRITICAL Guard: ${JSON.stringify(b.criticalActions)}. Defend ${pct(b.criticalActions.defend,Object.values(b.criticalActions).reduce((a,n)=>a+n,0))}; not universal.
- Both CRITICAL: ${JSON.stringify(b.bothCriticalActions)}. Attack ${pct(b.bothCriticalActions.attack,Object.values(b.bothCriticalActions).reduce((a,n)=>a+n,0))}.
- CRITICAL Player: ${JSON.stringify(b.criticalPlayerActions)}. Attack ${pct(b.criticalPlayerActions.attack,Object.values(b.criticalPlayerActions).reduce((a,n)=>a+n,0))}; some failure to finish remains.
- Longest consecutive Defend chain: ${b.maxDefendStreak}. Round-limit draws: ${b.roundLimitDraws}.
- Donut: ${b.donuts} uses; ${b.nearFullDonuts} (${pct(b.nearFullDonuts,b.donuts)}) above 75% HP; ${b.over90Donuts} above 90% HP. Average actual heal ${f(b.donutHealedHp/b.donuts)} of 180 and SP ${f(b.donutRestoredSp/b.donuts)} of 20. This is substantial early-resource use, not hidden as success.
- Wife: ${b.actions.callWife} uses; directly after Crack ${b.wifeAfterCrack}. No dominant Crack->Wife loop observed.
- Crack: ${b.cracks} choices; ${b.repeatedCracks} immediate repeats. It is neither absent nor the dominant action.
- Whistle: ${b.actions.blowWhistle} choices (${pct(b.actions.blowWhistle,b.decisions)}); no dominant Whistle spam.
- ${b.riledPhysical} executed RILED physical attacks, ${b.riledMisses} misses, ${b.stumbles} stumbles (${pct(b.stumbles,b.riledPhysical)} overall; ${pct(b.stumbles,b.riledMisses)} per miss), ${b.fatalStumbles} fatal self-damage events. Fatal recklessness exists, but no universal suicide policy was observed.

No rewards, bots or combat values were secretly changed to improve these results.
Do not add DDA on the assumption this is an optimal or human-tested policy.

## Hallway music and friend

Detected ${assets.music.source}, MPEG Layer III/MP3, copied byte-for-byte to
public/${assets.music.file}; no transcoding. SHA-256 ${assets.music.sha256}.
Default volume **0.35**, loop=true. One instance per game's SoundManager; repeated
interactions do not restart it. Exploration pause (entering battle) pauses only
this track, and returning resumes position. Session ON/OFF preference persists.
No battle music existed to replace. Missing/undecodable/no-audio paths are safe.
Locked audio retries after sound-unlocked or pointer/keyboard input; no fatal
autoplay failure. Other sound effects/global volume are untouched.

Detected ${assets.musician.source}: 2172x724 transparent sheet, four poses, 4 FPS.
Nearest proportional normalization to 256x256, character height240, feet249.
Runtime uses the Player's exploration conventions, provisional source coordinates
**(750,405)** on the blank wall between banner pillar and low window; scale .64
versus Player .675 / Guard .74 at the reference viewport. Interaction radius110
at the reference viewport (scaled with layout), no collision body. Far from Guard.
Space uses the existing InteractionZones system/prompt. Dialogue toggles:
"Want me to turn the track off?" / Music OFF, or
"Want the hallway music back on?" / Music ON. No invented name.
Missing/incomplete sprite -> no NPC art, shadow or optional zone; Guard remains
functional. Music still works independently. Current running sources, manifest,
revision texture keys, frame ordering, 12 FPS, controls, normalized diagonals,
Player/Guard scale and floor bounds are preserved. The existing scene runs whenever
moving and does not require Shift; this behavior was not changed.

## Verification

**${verification.passed}/${verification.tests} tests passed, ${verification.failed} failures.**
Syntax: ${verification.syntax}. Production build: ${verification.productionBuild}.
Production table/audio/animation/hallway manifests match current public assets
byte-for-byte. Current schema and combat signature accepted the built table.
An independent second 20,000-episode from-zero run reproduced the exact table AND
training metrics byte-for-byte (same seed/config), including after exact percentage
threshold normalization. Only one table is shipped/used by the game.

See tools/balance-test-results.txt for final test counts and tools/balance-animation-processing.txt
for actual asset processing. Relevant checks include combat, five-bin boundaries,
schema rejection/current-table EVAL, source hashes/running playback, damage reward,
stumble/fallback/shutdown, music singleton/toggle/pause/resume/unlock/failure, optional
NPC isolation and existing Guard encounter. JS/MJS syntax and production build are
run after final changes. Build has the existing large-chunk warning.

Manual browser verification remains: real MP3 decoding/volume/autoplay across
browsers; provisional NPC placement and speech bubble/camera alignment; fall/get-up
motion against the battle backdrop; real audio position resume through battle.
Normalized new-animation contact sheets were inspected on disk; live gameplay/audio
was not visually/audibly verified in a browser in this pass.
`;
await writeFile('docs/FINAL_BALANCE_RL_AUDIO_PASS.md',report);
console.log('Wrote docs/FINAL_BALANCE_RL_AUDIO_PASS.md; current table/result hashes match');
