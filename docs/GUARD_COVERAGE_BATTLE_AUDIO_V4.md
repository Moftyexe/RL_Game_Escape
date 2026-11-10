# Guard v4 coverage and battle music experiment

## Scope and implementation

Current project inspected before edits. It already contained the v4 coverage/state/policy/audio implementations, but shipped a v3 Q-table. Validated those implementations, completed fresh training, improved audit accounting, and replaced stale artifacts. CombatSystem, Combatant, RandomGuardPolicy, rewards, musician visuals/placement and running animations were not edited. No combat rebalance and no DDA.

Schema **guard-q-v4**, Q format **2**. Older tables are rejected safely. Sparse Q values, explicit integer visit counts and observed legal-action unions serialize independently. Q=0 does not imply unvisited. TRAIN selects uniformly among unvisited CURRENTLY VALID actions with injected seeded RNG before epsilon-greedy. Forced skips/death have no decision. A committed action cancelled by OFF_GUARD/death still receives its transition's one Q update and one visit, matching the existing commitment-based decision model. Forced rounds aggregate into that transition without extra visits. Training asserts total decisions = Q updates = visits (918779). Presentation never increments visits.

EVAL considers only visited valid actions. If there are none, that decision uses unchanged RandomGuardPolicy, without Q mutation. F2 displays Q and N, UNVISITED, and “Q state unseen — Random fallback”; hidden current Player action remains excluded. Live BattleScene uses QLearningGuardPolicy, never the heuristic. Audit fallback decisions: **64/71669 (0.09%)**.

## Training and coverage

Smoke: **200 episodes**, separate empty table, default seed 20261106, artifacts tools/guard-v4-smoke-*. Full: **40000 episodes from zero**, seed 20261106; no smoke/v3 warm start. Alpha .10, gamma .95, unchanged epsilon 1 → .05 over the first 75% of episode indices, then .05; 100-round limit. 40,000 was practical and retained as requested; coverage remains incomplete, so this is not a claim of convergence.

Target starts 75% normal / 25% randomized; actual **29904/10096**. Target bots Aggressive/Random/Tricky 50/25/25%; actual random 9957, aggressive 19976, tricky 10067. Randomized starts retain the valid draft → real unrewarded setup round → reject terminal/forced-Guard-skip method. Reconstructed randomized Donut categories: UNAVAILABLE 6325, FULL_VALUE 3269, PARTIAL_VALUE 502.

Encountered states **20243**; learned pairs **50704**. Mean **2.50**, median **2** visited actions/state. Previous 35,187/16,266 = **2.16**; relative mean improvement **15.79%**. 10157 states (**50.18%**) explored every legal option observed there; 50704/76687 observed legal pairs explored (66.12%). This measures the union of authoritative legal options actually observed for each encoded state, including exact-SP/resource differences within bins.

| Visited actions | States | Percent |
| --- | --- | --- |
| 1 | 6318 | 31.21% |
| 2 | 5146 | 25.42% |
| 3 | 3474 | 17.16% |
| 4 | 3245 | 16.03% |
| 5 | 1668 | 8.24% |
| 6 | 392 | 1.94% |

The improvement is modest: 56.63% still have only 1–2 visited actions. Unvisited-first selection guarantees exploration on revisits, not revisits themselves. Expanded state space and rare randomized states leave sparse tails. EVAL now honestly excludes untried actions instead of treating their zeros as superior.

## Donut representation and behavior

Five percentage HP bins remain unchanged for both actors. Donut encoding replaces the boolean: UNAVAILABLE if spent; FULL_VALUE if available and missing >=180 HP; PARTIAL_VALUE if available and missing <180 HP (including full HP, where the existing validity mask excludes it). At 820/1000 HP it is FULL_VALUE; at 821 it is PARTIAL_VALUE. No tactical healing threshold was added; partial-value Donut remains selectable.

Theoretical states: **172,800 → 259,200**, **1.5×**. Formula: 5² HP × 3² SP × 4² mental status × 2 Wife × 3 Donut × 2 Player stun × 6 previous-action category. This is a Cartesian upper bound, including unreachable combinations, not preallocation.

Audit: 1,000 normal full battles per bot, seed 20261108, held out from training. Donut commitments **2919**, executed **2919**. HP categories below use predecision HP; action is FAST, and actual restored events measure effective healing. Cancelled commitments are excluded from effective/wasted averages.

| Guard HP bucket | Executed Donuts |
| --- | --- |
| CRITICAL | 56 |
| LOW | 32 |
| MID | 97 |
| HIGH | 520 |
| VERY_HIGH | 2214 |

FULL_VALUE **1118 (38.30%)**; PARTIAL_VALUE **1801 (61.70%)**. Above 75% HP **2214/2919 = 75.85%**, compared with prior 85.10% (earlier 93.89%). Mean effective heal **117.96 HP**; mean wasted **62.04 HP**; SP restored **0**. Early healing remains a substantial learned-policy weakness. Above-75% alone does not imply waste: 760 HP can accept all 180.

## Representative EVAL states

All examples have Guard/Player SP50, no Player mental status/stun, Wife and Donut available, previous Player action ATTACK. Guard status NONE except the RILED example. These are exact encoded keys, not nearby-state substitutions. Values are rounded only for display. UNVISITED means N=0 and excludes the action from greedy candidates; valid options are all six in these examples. Ties use seeded RNG.

### Guard CRITICAL / Player CRITICAL

HP 50/50; Donut FULL_VALUE. EVAL chooses **defend**.

| Valid action | Q | Visits | Status |
| --- | --- | --- | --- |
| attack | -0.02 | 1 | VISITED |
| defend | -0.02 | 1 | VISITED |
| crackKnuckles | -0.02 | 1 | VISITED |
| blowWhistle | — | 0 | UNVISITED |
| callWife | -10.18 | 1 | VISITED |
| eatDonut | — | 0 | UNVISITED |

### Guard CRITICAL / Player HIGH

HP 50/700; Donut FULL_VALUE. EVAL chooses **eatDonut**.

| Valid action | Q | Visits | Status |
| --- | --- | --- | --- |
| attack | -10.35 | 1 | VISITED |
| defend | -10.52 | 2 | VISITED |
| crackKnuckles | -10.11 | 1 | VISITED |
| blowWhistle | -10.44 | 2 | VISITED |
| callWife | -10.40 | 1 | VISITED |
| eatDonut | -2.77 | 6 | VISITED |

### Guard VERY_HIGH / Player CRITICAL

HP 900/50; Donut PARTIAL_VALUE. EVAL chooses **eatDonut**.

| Valid action | Q | Visits | Status |
| --- | --- | --- | --- |
| attack | — | 0 | UNVISITED |
| defend | — | 0 | UNVISITED |
| crackKnuckles | — | 0 | UNVISITED |
| blowWhistle | — | 0 | UNVISITED |
| callWife | — | 0 | UNVISITED |
| eatDonut | -0.42 | 1 | VISITED |

### Guard MID / Player MID

HP 400/400; Donut FULL_VALUE. EVAL chooses **defend**.

| Valid action | Q | Visits | Status |
| --- | --- | --- | --- |
| attack | -1.37 | 58 | VISITED |
| defend | -1.34 | 10 | VISITED |
| crackKnuckles | -3.22 | 7 | VISITED |
| blowWhistle | -2.00 | 12 | VISITED |
| callWife | -2.04 | 7 | VISITED |
| eatDonut | -2.02 | 9 | VISITED |

### Guard RILED MID / Player LOW

HP 400/200; Donut FULL_VALUE. EVAL chooses **eatDonut**.

| Valid action | Q | Visits | Status |
| --- | --- | --- | --- |
| attack | — | 0 | UNVISITED |
| defend | — | 0 | UNVISITED |
| crackKnuckles | -0.42 | 1 | VISITED |
| blowWhistle | 0.04 | 1 | VISITED |
| callWife | -1.02 | 1 | VISITED |
| eatDonut | 0.68 | 1 | VISITED |

### Guard LOW / Player HIGH / FULL_VALUE

HP 200/700; Donut FULL_VALUE. EVAL chooses **blowWhistle**.

| Valid action | Q | Visits | Status |
| --- | --- | --- | --- |
| attack | -6.94 | 8 | VISITED |
| defend | -1.85 | 11 | VISITED |
| crackKnuckles | -2.68 | 9 | VISITED |
| blowWhistle | -1.09 | 17 | VISITED |
| callWife | -12.22 | 5 | VISITED |
| eatDonut | -2.28 | 5 | VISITED |

### Guard CRITICAL / Player LOW

HP 50/200; Donut FULL_VALUE. EVAL chooses **callWife**.

| Valid action | Q | Visits | Status |
| --- | --- | --- | --- |
| attack | — | 0 | UNVISITED |
| defend | -0.17 | 1 | VISITED |
| crackKnuckles | -0.02 | 1 | VISITED |
| blowWhistle | — | 0 | UNVISITED |
| callWife | 0.26 | 1 | VISITED |
| eatDonut | — | 0 | UNVISITED |

### Guard VERY_HIGH / Player HIGH / PARTIAL_VALUE

HP 990/700; Donut PARTIAL_VALUE. EVAL chooses **attack**.

| Valid action | Q | Visits | Status |
| --- | --- | --- | --- |
| attack | 1.43 | 37 | VISITED |
| defend | -0.81 | 8 | VISITED |
| crackKnuckles | -1.67 | 7 | VISITED |
| blowWhistle | -0.74 | 8 | VISITED |
| callWife | -0.98 | 6 | VISITED |
| eatDonut | -1.48 | 7 | VISITED |

## Behavior and remaining irrational choices

CRITICAL-Guard Defend **942/2896 = 32.53%**. Longest overall Defend chain **7**; chains of >=2 while Player CRITICAL **11**, longest **3**. Q audit round-limit draws **0**. Forced skipped rounds break chains.

Crack commitments **6707**, executed **6618**, immediate repeated commitments **581**. Guard RILED entries (including Talk Smack and refreshes) **14712**, battles with entry **2896/3000**. Completed RILED physical attacks **20151**: hits 13046 (64.74%), misses 7105 (35.26%); critical hits 4483 (34.36% of hits). Stumbles **1514**, **21.31% of misses**, 7.51% of attacks; fatal **21**. No RILED/stumble mechanics changed.

Remaining weaknesses include early partial-value Donuts, Defend with Player CRITICAL (143 commitments), repeated Crack, and sparse critical states choosing nonfinishers. Example A selects Defend among equally learned -0.02 actions with only one visit each; two alternatives remain untried. Visit masking fixes artificial unseen-zero optimism, not noisy/undersampled learned values or all state aliasing. No rules were added to hide these outcomes.

## Held-out policy comparison

Evaluation seed **20261107**, **1000 battles per policy/bot**, identical paired episode seeds, normal starts only, max100 rounds. W/L/D and rewards are Guard-perspective. Evaluation asserts the table is unchanged.

Heuristic is diagnostic only: heal at <=25% HP with >=180 missing; attack at Player <=10%; otherwise use available Wife to cleanse/buff/recover SP, then seeded weighted legal choices favoring Attack/Whistle/Crack (Defend gains weight at low SP). It reads only whitelisted public observations. It is intentionally small, not an optimal-policy bound, and never supplies training targets or production choices.

| Guard policy | Player bot | W/L/D | Win % | Mean rounds | Mean reward |
| --- | --- | --- | --- | --- | --- |
| random | random | 167/833/0 | 16.70 | 44.59 | -82.01 |
| q-learning | random | 822/178/0 | 82.20 | 25.84 | 78.17 |
| heuristic | random | 887/113/0 | 88.70 | 28.39 | 92.29 |
| random | aggressive | 1/999/0 | 0.10 | 21.11 | -139.51 |
| q-learning | aggressive | 134/866/0 | 13.40 | 20.48 | -98.15 |
| heuristic | aggressive | 183/817/0 | 18.30 | 18.67 | -82.50 |
| random | tricky | 490/498/12 | 49.00 | 63.07 | 2.88 |
| q-learning | tricky | 985/15/0 | 98.50 | 27.10 | 125.26 |
| heuristic | tricky | 995/5/0 | 99.50 | 31.15 | 126.95 |

| Policy overall | W/L/D (3000) | Win % | Mean rounds | Mean reward |
| --- | --- | --- | --- | --- |
| random | 658/2330/12 | 21.93 | 42.92 | -72.88 |
| q-learning | 1941/1059/0 | 64.70 | 24.47 | 35.09 |
| heuristic | 2065/935/0 | 68.83 | 26.07 | 45.58 |

Against Aggressive: Random 0.1%, Q 13.4%, heuristic 18.3%. Because the heuristic also loses heavily, this experiment suggests the matchup favors Aggressive, rather than Q coverage being the sole cause. Q still trails the simple heuristic and has weak coverage, so RL/state limitations also remain plausible. This heuristic is not proof of the best achievable Guard performance. No combat adjustment follows from these results.

## Battle audio

Detected source **Battle.mp3.mpeg**, actual **MP3** (ID3 header), 3435136 bytes. Runtime **public/assets/audio/battle.mp3**; byte-identical copy, no transcode; SHA256 f2396ed1f8a312b6241bdaeaabed46b8e5f5f58f84fa5ed67034a757dce351b3. Re-scanned root/source and runtime audio files; this is the detected battle source. Central volume **0.35** in src/game/audio/musicConfig.js; loop **true**; SFX untouched.

School → Battle: per-SoundManager interlock pauses hallway preserving seek/preference, then starts battle. Battle → School: stop battle before scene resume; hallway resumes its saved position if enabled. One cached instance per track/SoundManager; repeated input/unlock/battles reuse it. Battle restarts from its beginning each encounter. Musician still toggles only session hallway preference, so hallway OFF does not suppress battle. Scene pause/resume, shutdown listener cleanup and interlock are covered by audio tests. Unlock, pointer and keyboard retry safely; missing/undecodable audio cannot crash or strand hallway. Battle pause cannot be undone by an unrelated unlock.

## Verification and remaining manual checks

Tests: **345/345 passed**, failures 0. Includes visits/zero distinctions, seeded unvisited selection and epsilon resumption, validity/forced/cancelled timing, EVAL fallback/nonmutation, Donut boundary/randomized categories, heuristic hidden-action isolation/live exclusion, and audio transition/singleton/unlock/missing-asset cases.

Syntax: PASS: 79 JavaScript modules. Production build: **PASS**; existing large-chunk warning. Built Q-table and battle audio verified byte-identical to public assets. Initial sandbox build was blocked by parent-directory access; approved direct rerun exited 0. PowerShell redirection had treated the warning as an error; direct execution resolved the status.

Manual browser checks still required: actual MP3 decoding and perceived loudness; locked-autoplay retry in target browsers; audible hallway seek preservation through School → Battle → School → Battle; musician toggle off/on around encounters. Automated sound-manager tests verify lifecycle logic, not real browser audio output. No live browser/audio check is claimed.

Table SHA256: 10fdf554065d39a72c0cf7f199aec0f1c94057daa267882759e15535ea90f134. Full precision Q/visits, spent-resource examples and behavioral counts: public/assets/ai/guard_policy_inspection.json. Reproduce with tools/trainGuard.mjs, evaluateGuard.mjs, inspectGuardPolicy.mjs, auditTrainingCoverage.mjs and reportGuardV4.mjs.
