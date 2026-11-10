# Final Catch Breath, Talk Smack art and v6 checkpoints

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

| Source | Dimensions | Alpha | Detected poses | Same hash as previous source |
| --- | --- | --- | --- | --- |
| P_Animations/Pixel Runner Back-View Sprite Sheet.png | 2172×724 | true | 6 | true |
| P_Animations/Pixel Running Cycle Sprite Sheet.png | 1983×793 | true | 10 | true |
| P_Animations/Pixel-Art Runner Sprite Sheet.png | 2172×724 | true | 6 | true |
| P_Animations/Six-Frame Pixel Art Run Cycle.png | 2172×724 | true | 6 | true |

Side source1983×793 is one horizontal row of10 unevenly spaced poses with transparency/background debris; front/rear sheets are2172×724 with6 poses. The side hash is495d52385b7d49779b951f0f9c8a2dfbbaed95e4cf2807c9c42e3863af86a48d, matching the previous processing report. Exact hashes, detected crops and source feet positions: [RUN_V6_SOURCE_INVENTORY.json](RUN_V6_SOURCE_INVENTORY.json).

The user subsequently confirmed “i actually didnt update the run cycle.” No poses were dropped/reordered to fabricate eight. Existing run-side/run-down/run-up keys retain their10/6/6 frames at12FPS, looping sequentially. Existing256×256 nearest-neighbor canvases, common source-floor/head anchors and logical baseline249 remain. No new-eight-frame claims or tests were fabricated. Movement speed400, collision/camera/depth/idle/layout/music/NPC/interaction settings and all running PNGs remain unchanged. Existing tests still verify current frames, revision-tagged textures, loops and cache invalidation.

## v6 training and absolute epsilon horizon

Schema **guard-q-v6**, format2; recovery signature records catchHp100/catchSp0 and catalog cost30. v5 and older tables reject safely. Smoke **200 episodes** from an empty table; full **100,000 episodes from zero**, seed **20261106**. No warm start, alpha.10/gamma.95, rewards unchanged.

Implementation: **epsilonDecayEpisodes=45000**, independent of config.episodes. With zero-based episode index i: epsilon=1+(.05−1)×clamp(i/45000,0,1). i0=1; i22500=.525; i45000 and all later indices=.05. This does **not** stretch to75k. Checkpoints count completed episodes;60k/80k/100k all record epsilon.05.

Target start mix75% normal/25% randomized; selected-checkpoint actual **74894/25106**. Bot weights Aggressive50%/Random25%/Tricky25%; actual selected random 24761, aggressive 49998, tricky 25241. Existing bot action weights retained; all bots filter current legality, so low-SP Catch Breath is unavailable rather than free SP recovery. Randomized starts still draft valid states, run one real unrewarded setup round and reject terminal/forced-Guard-skip results.

Sparse Q values/visits, five percentage HP bins, Donut value state, unvisited-valid TRAIN priority, visited-only greedy EVAL and explicit Random fallback remain. Current hidden Player actions are excluded. Human BattleScene remains EVAL/epsilon0/no table mutation, with P/F2 intact. Heuristic remains diagnostic only. Committed-but-cancelled Guard decisions retain one transition/update/visit; forced skips aggregate reward without visits.

| Checkpoint | Table path | Completed / planned | Epsilon | SHA256 |
| --- | --- | --- | --- | --- |
| q-60k | tools/checkpoints/v6/guard_qtable_60k.json | 60000 / 100000 | 0.05 | 2c39e8cf7796b68e35851f884d47d3ae13d44ac6e9d122818d5936b6a40b17f5 |
| q-80k | tools/checkpoints/v6/guard_qtable_80k.json | 80000 / 100000 | 0.05 | ef827f3ffe62f2e9965403288e712dc46b4c074989ddb2dc8edaf365badd3e1d |
| q-100k | tools/checkpoints/v6/guard_qtable_100k.json | 100000 / 100000 | 0.05 | a45930e8955707be6f1ea0689b39b0ecbce384080277fa2fa19c9c813f695a6d |

Matching training metrics are retained beside every checkpoint. Checkpoints are prefixes of the same seeded100k run, not three independently annealed runs. Callback serialization and RNG reproducibility tests remain.

## Coverage comparison

| Checkpoint | States | Visited pairs | Mean actions/state | Median | Fully explored observed states % |
| --- | --- | --- | --- | --- | --- |
| q-60k | 21062 | 51843 | 2.46 | 2 | 47.01 |
| q-80k | 22667 | 56621 | 2.50 | 2 | 47.99 |
| q-100k | 23915 | 60556 | 2.53 | 2 | 48.75 |

| Checkpoint | 1 action | 2 actions | 3 actions | 4 actions | 5 actions | 6 actions |
| --- | --- | --- | --- | --- | --- | --- |
| q-60k | 7031 (33.38%) | 5144 (24.42%) | 3560 (16.90%) | 3182 (15.11%) | 1754 (8.33%) | 391 (1.86%) |
| q-80k | 7302 (32.21%) | 5519 (24.35%) | 3958 (17.46%) | 3449 (15.22%) | 2023 (8.92%) | 416 (1.84%) |
| q-100k | 7457 (31.18%) | 5801 (24.26%) | 4290 (17.94%) | 3668 (15.34%) | 2239 (9.36%) | 460 (1.92%) |

Fully explored means all members of the union of legal actions actually observed in each encoded state were visited. Rare states still have thin experience. The theoretical space remains259,200; no new HP bins or preallocation.

The extra40k low-epsilon episodes add **8713 visited pairs** and **2853 states**. Mean actions/state grows2.46 →2.53 (2.87%); fully explored states increase1.74 percentage points. This is useful but modest improvement; median remains2 and the sparse tail is not solved.

## Held-out comparison and production choice

Evaluation seed **20261107**, **1000 normal full battles per policy/bot**, paired episode seeds,100-round cap, no randomized evaluation starts, no learning/table mutation. Selection uses these held-out validation results; no independent final selection test is claimed.

| Guard policy | Player bot | W/L/D | Win % | Mean rounds | Mean reward |
| --- | --- | --- | --- | --- | --- |
| random | random | 424/576/0 | 42.40 | 43.96 | -40.50 |
| random | aggressive | 27/973/0 | 2.70 | 24.30 | -141.29 |
| random | tricky | 822/178/0 | 82.20 | 53.27 | 54.00 |
| heuristic | random | 983/17/0 | 98.30 | 26.30 | 103.86 |
| heuristic | aggressive | 517/483/0 | 51.70 | 19.86 | -19.44 |
| heuristic | tricky | 1000/0/0 | 100.00 | 28.57 | 117.44 |
| q-60k | random | 947/53/0 | 94.70 | 25.04 | 95.64 |
| q-60k | aggressive | 442/558/0 | 44.20 | 22.45 | -39.80 |
| q-60k | tricky | 996/4/0 | 99.60 | 25.68 | 116.94 |
| q-80k | random | 972/28/0 | 97.20 | 24.89 | 100.63 |
| q-80k | aggressive | 378/622/0 | 37.80 | 22.77 | -54.49 |
| q-80k | tricky | 999/1/0 | 99.90 | 26.12 | 117.06 |
| q-100k | random | 963/37/0 | 96.30 | 25.50 | 98.57 |
| q-100k | aggressive | 468/532/0 | 46.80 | 23.46 | -32.44 |
| q-100k | tricky | 996/4/0 | 99.60 | 26.66 | 116.36 |

| Policy overall (3000) | W/L/D | Win % | Mean rounds | Mean reward |
| --- | --- | --- | --- | --- |
| random | 1273/1727/0 | 42.43 | 40.51 | -42.60 |
| heuristic | 2500/500/0 | 83.33 | 24.91 | 67.29 |
| q-60k | 2385/615/0 | 79.50 | 24.39 | 57.59 |
| q-80k | 2349/651/0 | 78.30 | 24.60 | 54.40 |
| q-100k | 2427/573/0 | 80.90 | 25.21 | 60.83 |

Production selected: **q-100k**. 100k has the best overall Q wins/reward and Aggressive win rate (46.8%), best state/action coverage, and lower CRITICAL Defend rate than60k/80k. It is not uniformly best:80k wins more against Random/Tricky and heals more efficiently.100k has rare Defend chains up to10 (versus7/6), which remain a policy weakness; no round-limit draws occurred. It was chosen for broader held-out performance and coverage, not merely duration. No tactical fixes or further balance changes were added. All three checkpoints retained; chosen bytes copied to public/assets/ai/guard_qtable.json. No additional balance adjustments followed evaluation.

## Behavior comparison

Aggregate3000-battle checkpoint audit. Donut counts use executed restoration events; HP/value buckets use predecision state. Effective healing uses actual capped event HP. Defend chains break on forced Guard skips. RILED hit/miss/crit include completed physical attacks, excluding cancelled attacks.

| Checkpoint | Donut CRIT/LOW/MID/HIGH/VERY_HIGH | FULL / PARTIAL | Mean heal | Mean waste | <100 HP n (%) | Above75% HP n (%) |
| --- | --- | --- | --- | --- | --- | --- |
| q-60k | 0/0/0/198/2802 | 1095 / 1905 | 117.96 | 82.04 | 1366 (45.53) | 2802 (93.40) |
| q-80k | 11/29/67/242/2613 | 1687 / 1275 | 159.34 | 40.66 | 577 (19.48) | 2613 (88.22) |
| q-100k | 3/2/6/468/2515 | 1426 / 1568 | 141.60 | 58.40 | 941 (31.43) | 2515 (84.00) |

| Checkpoint | CRITICAL Guard Defend % | Longest Defend chain | Longest while Player CRITICAL | Round-limit draws | Unseen fallback decisions |
| --- | --- | --- | --- | --- | --- |
| q-60k | 41.39 | 7 | 2 | 0 | 25 |
| q-80k | 32.71 | 6 | 2 | 0 | 20 |
| q-100k | 27.88 | 10 | 2 | 0 | 5 |

| Checkpoint | Crack n (% decisions) | Immediate repeats | RILED entries / battles | Hit % | Miss % | Crit % of hits | Stumbles (% misses) | Fatal stumbles |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| q-60k | 6327 (8.82) | 628 | 12090 / 2895 | 64.93 | 35.07 | 35.14 | 1370 (20.85) | 1 |
| q-80k | 6718 (9.28) | 163 | 12543 / 2969 | 65.01 | 34.99 | 34.73 | 1532 (19.40) | 2 |
| q-100k | 6468 (8.72) | 478 | 12392 / 2853 | 64.56 | 35.44 | 34.87 | 1578 (20.43) | 10 |


### Catch Breath audit

All15 policy/bot combinations use the same held-out1000-battle setup. Selection is counted when a legal commitment locks; execution/cancellation is observed at the Player's actual action resolution. “Before use” averages are at execution (not merely round start); they exclude cancelled commitments. Audit-only wrappers snapshot numeric fields without RNG calls or changing choices, rewards or combat. A regression test proves instrumented and uninstrumented traces match exactly.

| Guard policy | Player bot | Selected | Executed | Cancelled | Mean HP before | Mean SP before | Total SP spent |
| --- | --- | --- | --- | --- | --- | --- | --- |
| random | random | 1189 | 1189 | 0 | 879.24 | 62.04 | 35670 |
| random | aggressive | 83 | 83 | 0 | 944.70 | 71.16 | 2490 |
| random | tricky | 571 | 571 | 0 | 831.30 | 61.16 | 17130 |
| heuristic | random | 1066 | 1066 | 0 | 847.59 | 65.22 | 31980 |
| heuristic | aggressive | 85 | 85 | 0 | 868.09 | 70.45 | 2550 |
| heuristic | tricky | 480 | 480 | 0 | 818.92 | 66.04 | 14400 |
| q-60k | random | 1065 | 1065 | 0 | 884.33 | 65.11 | 31950 |
| q-60k | aggressive | 86 | 86 | 0 | 938.67 | 70.15 | 2580 |
| q-60k | tricky | 470 | 470 | 0 | 853.84 | 66.61 | 14100 |
| q-80k | random | 1061 | 1061 | 0 | 890.74 | 65.02 | 31830 |
| q-80k | aggressive | 83 | 83 | 0 | 962.29 | 70.19 | 2490 |
| q-80k | tricky | 479 | 479 | 0 | 848.07 | 65.67 | 14370 |
| q-100k | random | 1071 | 1071 | 0 | 878.35 | 65.09 | 32130 |
| q-100k | aggressive | 83 | 83 | 0 | 935.16 | 70.86 | 2490 |
| q-100k | tricky | 476 | 476 | 0 | 850.66 | 66.17 | 14280 |

| Guard policy | Player bot | Mean effective HP | Mean wasted HP | Uses healing<50 HP % | Uses at full HP % | Every execution cost30 |
| --- | --- | --- | --- | --- | --- | --- |
| random | random | 40.56 | 59.44 | 57.36 | 54.92 | PASS |
| random | aggressive | 39.16 | 60.84 | 57.83 | 57.83 | PASS |
| random | tricky | 48.00 | 52.00 | 50.79 | 47.29 | PASS |
| heuristic | random | 56.57 | 43.43 | 40.99 | 38.93 | PASS |
| heuristic | aggressive | 57.88 | 42.12 | 38.82 | 38.82 | PASS |
| heuristic | tricky | 57.69 | 42.31 | 40.42 | 37.50 | PASS |
| q-60k | random | 44.38 | 55.62 | 53.24 | 51.92 | PASS |
| q-60k | aggressive | 26.05 | 73.95 | 73.26 | 73.26 | PASS |
| q-60k | tricky | 49.59 | 50.41 | 47.66 | 46.81 | PASS |
| q-80k | random | 37.18 | 62.82 | 61.55 | 60.04 | PASS |
| q-80k | aggressive | 20.00 | 80.00 | 78.31 | 78.31 | PASS |
| q-80k | tricky | 44.72 | 55.28 | 53.65 | 51.98 | PASS |
| q-100k | random | 43.21 | 56.79 | 54.25 | 53.22 | PASS |
| q-100k | aggressive | 36.39 | 63.61 | 61.45 | 61.45 | PASS |
| q-100k | tricky | 48.52 | 51.48 | 49.58 | 48.53 | PASS |

Every measured execution asserts30 SP deducted, zero SP restored, correct capped healing and no defense; cancelled commitments assert zero cost/heal. All selected counts reconcile to executed+cancelled. Because Catch Breath is FAST, normal Whistle cannot cancel it later in the same round; carried stun prevents selection and consumes a null opportunity. Deterministic tests separately cover pre-execution interruption/death without charging/healing.

### Aggressive diagnostics

Action percentages count commitments, including later cancellations. Guard ATTACK is damaging; Whistle/Crack/etc are setup. Player Attack/Backpack/Talk Smack are damaging. Actual damage totals exclude overkill and stumble self-damage. Raw JSON also includes executed counts.

| Policy vs Aggressive | Guard damage/setup % | Player damaging % | Player Catch count (%) | Player Backpack count (%) | Guard Defend % | Mean Guard / Player damage | Mean Donut heal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| random | 27.74 / 72.26 | 90.11 | 83 (0.34) | 4642 (19.13) | 27.68 | 531.60 / 1359.62 | 172.13 |
| heuristic | 59.71 / 40.29 | 90.03 | 85 (0.43) | 4505 (22.71) | 5.44 | 902.13 / 1266.23 | 198.29 |
| q-60k | 48.71 / 51.29 | 90.12 | 86 (0.38) | 4602 (20.54) | 15.82 | 809.93 / 1275.68 | 189.62 |
| q-80k | 46.22 / 53.78 | 90.08 | 83 (0.36) | 4537 (19.95) | 22.54 | 806.38 / 1302.13 | 197.92 |
| q-100k | 48.88 / 51.12 | 89.99 | 83 (0.35) | 4596 (19.62) | 16.19 | 870.37 / 1287.96 | 194.61 |

| Policy vs Aggressive | Basic Attack n (%) | Backpack n (%) | Catch Breath n (%) | Player damaging / other % | Mean Player healing/battle | Mean Catch SP/battle |
| --- | --- | --- | --- | --- | --- | --- |
| random | 17094 (70.43) | 4642 (19.13) | 83 (0.34) | 90.11 / 9.89 | 3.25 | 2.49 |
| heuristic | 13231 (66.70) | 4505 (22.71) | 85 (0.43) | 90.03 / 9.97 | 4.92 | 2.55 |
| q-60k | 15469 (69.03) | 4602 (20.54) | 86 (0.38) | 90.12 / 9.88 | 2.24 | 2.58 |
| q-80k | 15821 (69.57) | 4537 (19.95) | 83 (0.36) | 90.08 / 9.92 | 1.66 | 2.49 |
| q-100k | 16360 (69.84) | 4596 (19.62) | 83 (0.35) | 89.99 / 10.01 | 3.02 | 2.49 |

### Available v5 comparison

Archived v5 production was Q60k. Its Catch Breath was free+35SP with zero HP healing, so Catch healing/SP-cost values below are zero by the v5 rule (not a newly instrumented v5 replay). Other counts/damage are the preserved paired evaluation. v6 uses the same held-out seed/count; changed dynamics and100k versus60k training mean this is descriptive, not isolation of one causal effect.

| Production vs Aggressive | Win % | Attack n (%) | Backpack n (%) | Catch n (%) | Player damaging / other % | Guard damaging / setup % | Mean Guard / Player damage | Player heal/battle | Catch SP/battle |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| v5 q-60k | 62.50 | 7015 (37.60) | 7368 (39.49) | 2451 (13.14) | 78.07 / 21.93 | 63.53 / 36.47 | 928.00 / 1216.20 | 0 (v5 rule) | 0 (v5 rule) |
| v6 q-100k | 46.80 | 16360 (69.84) | 4596 (19.62) | 83 (0.35) | 89.99 / 10.01 | 48.88 / 51.12 | 870.37 / 1287.96 | 3.02 | 2.49 |

### Remaining irrational behavior and limits

Guard weaknesses remain:10-decision maximum Defend chains at100k, some Defend while Player is CRITICAL, repeated Crack, early partial-value Donuts, and thin state/action experience.80k has better Donut efficiency and shorter worst Defend chains, but worse Aggressive/overall results.100k is a tradeoff, not evidence of an optimal policy or complete coverage.

Player bots also misuse the redesigned action. Against selected Q100k, Aggressive selects Catch Breath83 times across1000 battles;61.45% occur at full HP, mean effective heal36.39, and total healing is only3.02HP per battle. Random/Tricky also waste many heals. Their inherited action weights were intentionally not retuned: the old low-SP Catch preference is now filtered out by30-SP validity. Therefore these bots are imperfect diagnostics of how a human will use paid healing. The v5→v6 win-rate difference cannot be cleanly attributed to HP healing alone; the SP economy and learned training trajectory also changed. No reward/bot/balance change was made to improve these results.
## Validation and remaining work

Tests **357/357 passed**, failures **0**; syntax **PASS: 89 JavaScript modules**; production build **PASS**, existing chunk-size warning. Built selected table/audio match runtime assets. Integrity verifies unchanged music, exploration settings, existing run imagery, insult array, SFX source collection and unrelated artwork. No SFX integrated and no DDA.

Manual browser checks remain: Catch Breath cost/HP bars/disabled selection, capped heal feedback, Talk Smack five-pose motion/point hold/dialogue synchronization, P/F2 and music transitions. Running is intentionally unchanged following the user's clarification.

Raw comparison: tools/guard-v6-comparison.json; production metrics and representative Q/visit audit: public/assets/ai. Reproduce with trainGuard.mjs (100k/checkpoints60000,80000,100000), compareGuardCheckpoints.mjs and reportGuardV6.mjs. Source inventory tool: inspectRunSourceInventory.mjs.
