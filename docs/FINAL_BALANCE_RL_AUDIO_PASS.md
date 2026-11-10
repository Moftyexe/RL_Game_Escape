> Historical experiment report. Current mechanics and results: [v5 checkpoint report](GUARD_BALANCE_CHECKPOINTS_V5.md). Historical measurements below are not current production results.

> Historical v2 report. Current RILED, Donut, training starts, bot mixture, policy results and musician sprite/placement are documented in [the v3 report](GUARD_POLICY_MUSICIAN_V3.md).

# Final balance, Q-learning v2 and hallway audio pass

## Combat

Both Player and Guard now initialize at **1000 HP / 100 SP**. Guard was 1200 HP.
Basic attack remains 80 damage, 90% accuracy, 10% crit, 1.5x crit multiplier.
Hidden simultaneous commitments, priority tiers, ties, SP execution timing,
Look There/OFF_GUARD, Whistle, Donut, Defend and RandomGuardPolicy are preserved.

| Player action | Previous | Current |
|---|---|---|
| Catch Breath | +20 SP | +35 SP only; no HP healing; capped; FAST, free; no defense (v5) |
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

Schema **guard-q-v2**, format version 1; old v1 table was
explicitly rejected before replacement (tools/guard-v1-invalidation.json).
HP bins for BOTH actors use percent of actual maximum:
CRITICAL 0..10%; LOW >10..25%; MID >25..50%; HIGH >50..75%; VERY_HIGH >75..100%.
Other state features are unchanged: both SP buckets, mental statuses, Wife/Donut,
Player stun, previous committed Player category. No current hidden choice, exact
HP/SP, finisher flag, animation or dialogue is encoded.

Previous theoretical states **62,208**; new **172,800**;
multiplier **25/9 = 2.7778x**. Six actions: 1,036,800 possible pairs, kept sparse.
Smoke: 2000 episodes, 7566 states;
15,470 pairs (separate smoke output). Proper training: **20000 episodes
from a NEW EMPTY QTable**, seed 20261107, 11722 encountered
state rows and 27824 stored action values. Smoke values were not reused.

Alpha .10, gamma .95, epsilon 1.0 to .05 linearly over first 75% of episode indices,
then .05. 100-round cap. Equal Random/Aggressive/Tricky episode weights. Bots,
valid-action filtering, independent seeded RNG streams, reward and forced-skip
aggregation remain the existing architecture. Reward: actual Player damage/20
- actual Guard damage/20 -0.2 per round; terminal +100/-100/-10. Healing has no
direct reward; emotional and self-damage now enter through normal damage events.

Training results include exploration: 9297 wins,
10689 losses, 14 draws;
46.48% wins; 31.96
average rounds. This is not the greedy policy's evaluation performance.

Saved table: public/assets/ai/guard_qtable.json, **2233702 bytes**.
SHA-256: 33c1d81193c458f7af6779c9f2c7adfe03a5d3063bb49e7ccefb37cad2624d4b. Both evaluation and inspection record this exact hash.
Game loading validates current schema AND combat signature. Human battles remain
read-only EVAL (epsilon0); P/click switches next unlocked decision, F2 public debug.
Random stays available. No DDA.

## Held-out evaluation under NEW rules

Seed **20261108**, 1000 episodes per bot/policy;
same scenario seeds per policy, no learning, 100-round cap.

| Bot | Guard | W/L/D | Win % | Avg rounds | Avg reward |
|---|---|---|---:|---:|---:|
| random | random | 88/912/0 | 8.80 | 44.33 | -102.99 |
| random | q-learning | 754/246/0 | 75.40 | 27.16 | 61.38 |
| aggressive | random | 1/999/0 | 0.10 | 20.95 | -141.49 |
| aggressive | q-learning | 33/967/0 | 3.30 | 20.39 | -125.23 |
| tricky | random | 333/657/10 | 33.30 | 65.57 | -35.65 |
| tricky | q-learning | 956/44/0 | 95.60 | 28.89 | 117.33 |

Overall random: 422/3000 wins (14.07%), 43.62 mean rounds, -93.38 mean reward.

Overall q-learning: 1743/3000 wins (58.10%), 25.48 mean rounds, 17.83 mean reward.

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
| A | 50 | 50 | attack, defend, crackKnuckles, blowWhistle, callWife, eatDonut | false |
| B | 50 | 700 | attack, blowWhistle, eatDonut | true |
| C | 900 | 50 | attack, defend, crackKnuckles, blowWhistle, callWife, eatDonut | false |
| D | 400 | 400 | attack | true |
| E | 400 / RILED | 200 | attack, defend, blowWhistle, eatDonut | true |
| F | 200 | 700 | defend | true |

Supplementary encountered examples with both finite resources spent. Same HP/SP,
status and previous-action dimensions; unavailable Wife/Donut excluded:

| Case | Attack Q | Defend Q | Crack Q | Whistle Q | Preferred |
|---|---:|---:|---:|---:|---|
| A | -1.81 | -24.77 | -9.60 | -5.15 | attack |
| B | -83.98 | -83.26 | -80.90 | -81.63 | crackKnuckles |
| C | 10.23 | 0.00 | 49.77 | 0.00 | crackKnuckles |
| D | 0.12 | 1.37 | 0.69 | 12.64 | blowWhistle |
| E | 74.50 | 39.94 | 36.08 | 27.57 | attack |

Policy limitations are visible: C can buff instead of immediately finishing;
F with Donut available prefers Defend. Some resource-available CRITICAL examples
were never encountered and are entirely tied at zero. More HP bins do not alone
guarantee good decisions; sparse coverage and opponent/reward credit assignment
remain issues to investigate before DDA.

## Behavior audit (separate held-out seed 20261109)

1000 episodes per bot, 74631 decisions, 76987
rounds. Counts are commitments, including later interrupted actions.

- Overall actions: {"callWife":3000,"blowWhistle":7189,"eatDonut":2993,"attack":46778,"defend":8482,"crackKnuckles":6189}.
- CRITICAL Guard: {"attack":918,"defend":1248,"blowWhistle":799,"crackKnuckles":523,"eatDonut":9}. Defend 35.69%; not universal.
- Both CRITICAL: {"attack":85,"blowWhistle":2,"defend":17,"crackKnuckles":9}. Attack 75.22%.
- CRITICAL Player: {"attack":3061,"crackKnuckles":358,"defend":180,"blowWhistle":58}. Attack 83.70%; some failure to finish remains.
- Longest consecutive Defend chain: 7. Round-limit draws: 0.
- Donut: 2993 uses; 2810 (93.89%) above 75% HP; 1664 above 90% HP. Average actual heal 90.62 of 180 and SP 12.32 of 20. This is substantial early-resource use, not hidden as success.
- Wife: 3000 uses; directly after Crack 0. No dominant Crack->Wife loop observed.
- Crack: 6189 choices; 539 immediate repeats. It is neither absent nor the dominant action.
- Whistle: 7189 choices (9.63%); no dominant Whistle spam.
- 20230 executed RILED physical attacks, 8157 misses, 1573 stumbles (7.78% overall; 19.28% per miss), 15 fatal self-damage events. Fatal recklessness exists, but no universal suicide policy was observed.

No rewards, bots or combat values were secretly changed to improve these results.
Do not add DDA on the assumption this is an optimal or human-tested policy.

## Hallway music and friend

Detected Hallway.mp3.mpeg, MPEG Layer III/MP3, copied byte-for-byte to
public/assets/audio/hallway.mp3; no transcoding. SHA-256 8f18890c72a78e99d6d1071fb250b6d64a624f2955a8cee3f98ecc350ee89780.
Default volume **0.35**, loop=true. One instance per game's SoundManager; repeated
interactions do not restart it. Exploration pause (entering battle) pauses only
this track, and returning resumes position. Session ON/OFF preference persists.
No battle music existed to replace. Missing/undecodable/no-audio paths are safe.
Locked audio retries after sound-unlocked or pointer/keyboard input; no fatal
autoplay failure. Other sound effects/global volume are untouched.

Detected npcanimations/musicguy_idle.png: 2172x724 transparent sheet, four poses, 4 FPS.
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

**311/311 tests passed, 0 failures.**
Syntax: all src/tools JS and MJS passed. Production build: passed; existing large-chunk warning.
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
