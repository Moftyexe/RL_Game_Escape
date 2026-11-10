# Final balance, v5 checkpoints and SFX cleanup

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

Schema **guard-q-v5**, format2; combat signature now explicitly includes recovery values and Guard1200. v4 and older tables are rejected. Smoke **200 episodes**, fresh table; full **60,000 episodes from zero**, seed **20261106**. Neither v4 nor smoke values were reused.

Alpha .10, gamma .95, unchanged reward weights and epsilon schedule: 1 → .05 linearly through75% of the planned60k run (45k), then .05. Checkpoints are serialized prefixes of **one continuous run**, not independently annealed20k/40k/60k runs. Epsilon at each checkpoint: q-20k 0.58; q-40k 0.16; q-60k 0.05. Metadata records completed episodes, planned horizon, seed/config, Q values, visits, legal-action unions and coverage. Checkpoint callbacks do not consume RNG. Deterministic tests confirm callback/noncallback runs match and serialized visits/coverage survive reloading.

Target start mix75/25 normal/randomized; actual full run **44847/15153**. Target bots50/25/25 Aggressive/Random/Tricky; actual random 14938, aggressive 29944, tricky 15118. Valid randomized-start draft/setup/reject pipeline retained; Donut states observed in accepted randomized starts: UNAVAILABLE 9473, FULL_VALUE 4987, PARTIAL_VALUE 693.

Sparse tables, explicit visits, seeded unvisited-valid TRAIN priority, visited-only greedy EVAL and Random fallback remain. A committed decision cancelled mechanically still receives its one existing transition/Q update/visit; forced skipped rounds receive no visits and aggregate discounted return. Hidden current Player choices remain excluded. Live BattleScene still uses Q-learning EVAL, epsilon0/no learning; P/F2 remain. Heuristic is evaluation only.

All checkpoints retained separately:

| Checkpoint | Completed / planned | Path | SHA256 |
| --- | --- | --- | --- |
| q-20k | 20000 / 60000 | tools/checkpoints/v5/guard_qtable_20k.json | c3b78b68bb5bf678724a53e8fbf2cb70c95062f8df7552f558628c6984333dcd |
| q-40k | 40000 / 60000 | tools/checkpoints/v5/guard_qtable_40k.json | 158d7c17d1001905b39e0ed1afb666b8bcb14ad2f0378b947404ee9e47b30ad5 |
| q-60k | 60000 / 60000 | tools/checkpoints/v5/guard_qtable_60k.json | fb29db0c01c96cf71f18d69b363f77769f3aa5e120b6691b79a7d2093ab7cdcf |

Each has its matching guard_training_20k/40k/60k.json in the same folder. Production **q-60k** was copied byte-for-byte to public/assets/ai/guard_qtable.json.

## State/action coverage comparison

| Checkpoint | States | Learned pairs | Mean actions/state | Median | All observed legal options explored |
| --- | --- | --- | --- | --- | --- |
| q-20k | 16601 | 39674 | 2.39 | 2 | 48.38% |
| q-40k | 19710 | 48041 | 2.44 | 2 | 48.70% |
| q-60k | 21602 | 53554 | 2.48 | 2 | 49.18% |

| Checkpoint | 1 visited | 2 visited | 3 visited | 4 visited | 5 visited | 6 visited |
| --- | --- | --- | --- | --- | --- | --- |
| q-20k | 5667 (34.14%) | 4326 (26.06%) | 2642 (15.91%) | 2645 (15.93%) | 1077 (6.49%) | 244 (1.47%) |
| q-40k | 6412 (32.53%) | 5079 (25.77%) | 3373 (17.11%) | 3147 (15.97%) | 1430 (7.26%) | 269 (1.36%) |
| q-60k | 6733 (31.17%) | 5530 (25.60%) | 3879 (17.96%) | 3470 (16.06%) | 1696 (7.85%) | 294 (1.36%) |

Coverage improves with additional episodes, but mean actions/state and fully explored percentage improve slowly. Rare states remain undersampled. “Fully explored” means every member of the union of legal options actually observed in that encoded state was tried, not all six theoretical actions. The theoretical state space remains259,200; changes affect values/compatibility, not cardinality. No preallocation.

## Paired held-out evaluation

Seed **20261107**; **1000 normal full battles per policy/bot**, same episode seeds and policy RNG streams, max100 rounds; no randomized evaluation starts. Rewards and W/L/D are Guard-perspective. Evaluation asserts no Q-table mutation. These held-out results guide checkpoint selection; they are not a separate untouched final selection test.

| Guard policy | Player bot | W/L/D | Win % | Mean rounds | Mean reward |
| --- | --- | --- | --- | --- | --- |
| random | random | 676/324/0 | 67.60 | 44.04 | 18.21 |
| random | aggressive | 50/950/0 | 5.00 | 25.16 | -135.07 |
| random | tricky | 959/41/0 | 95.90 | 51.54 | 91.55 |
| heuristic | random | 994/6/0 | 99.40 | 23.94 | 110.99 |
| heuristic | aggressive | 606/394/0 | 60.60 | 19.91 | 1.75 |
| heuristic | tricky | 1000/0/0 | 100.00 | 26.48 | 122.64 |
| q-20k | random | 993/7/0 | 99.30 | 20.45 | 112.77 |
| q-20k | aggressive | 582/418/0 | 58.20 | 17.60 | -3.91 |
| q-20k | tricky | 999/1/0 | 99.90 | 23.12 | 123.11 |
| q-40k | random | 988/12/0 | 98.80 | 20.53 | 110.78 |
| q-40k | aggressive | 539/461/0 | 53.90 | 18.73 | -15.45 |
| q-40k | tricky | 1000/0/0 | 100.00 | 22.60 | 123.64 |
| q-60k | random | 993/7/0 | 99.30 | 20.43 | 112.29 |
| q-60k | aggressive | 625/375/0 | 62.50 | 18.68 | 6.38 |
| q-60k | tricky | 1000/0/0 | 100.00 | 22.41 | 124.07 |

| Policy overall (3000) | W/L/D | Win % | Mean rounds | Mean reward |
| --- | --- | --- | --- | --- |
| random | 1685/1315/0 | 56.17 | 40.24 | -8.44 |
| heuristic | 2600/400/0 | 86.67 | 23.44 | 78.46 |
| q-20k | 2574/426/0 | 85.80 | 20.39 | 77.32 |
| q-40k | 2527/473/0 | 84.23 | 20.62 | 72.99 |
| q-60k | 2618/382/0 | 87.27 | 20.51 | 80.91 |

### Production choice

Selected **60k based on measured behavior and validation**, not episode count alone. It has the best Aggressive win rate62.5% and best overall wins/reward, matches20k's99.3% against Random and reaches100% against Tricky. 40k regresses to53.9% against Aggressive, demonstrating that longer alone is not sufficient. 60k also has the most visited pairs and best mean/complete coverage. Against Aggressive its average Donut restores197.01/200 HP, under100 healing occurs1.00%, and CRITICAL Defend falls to19.73% versus33.31% at20k and32.28% at40k. No round-limit draws; maximum Defend chain7 still warrants monitoring. All policies obey resource validity, costs and finite use; there is no invalid-resource exploit.

Important remaining weakness:60k still wastes Donut healing against easy Random/Tricky opponents; this is shown below rather than masked with a healing rule. Its62.5% vs heuristic60.6% Aggressive result is close and is not proof of superiority to all competent strategies.

## Aggressive matchup: why it changed

The old v4 experiment recorded Random/Q/heuristic Aggressive wins0.1%/13.4%/18.3%. With the agreed combined changes, current wins are5.0%/62.5%/60.6% for Random/selected Q/heuristic. This supports a substantial previous balance disadvantage, while learning/selection still matters (40k regresses). The combined experiment cannot isolate how much came from extra Guard HP versus removing Player healing or the Donut increase. Whistle semantics were already correct, so the improvement is not a stun fix.

Below, action rates count committed non-null decisions, including later interruptions. Guard ATTACK is damaging; Whistle/Crack/etc are setup. Player ATTACK/Backpack/Talk Smack are damaging. Damage totals use actual HP lost, excluding Guard stumble self-damage and overkill; they are not attempted damage. Raw JSON also includes executed-action counts and cancellations.

| Guard policy | Guard damaging % | Guard setup % | Player damaging % | Catch Breath count (%) | Backpack count (%) |
| --- | --- | --- | --- | --- | --- |
| random | 27.98 | 72.02 | 76.61 | 3675 (14.66) | 9592 (38.26) |
| heuristic | 60.19 | 39.81 | 77.66 | 2671 (13.45) | 7764 (39.10) |
| q-20k | 63.96 | 36.04 | 78.39 | 2221 (12.64) | 6979 (39.72) |
| q-40k | 57.90 | 42.10 | 78.21 | 2446 (13.09) | 7369 (39.44) |
| q-60k | 63.53 | 36.47 | 78.07 | 2451 (13.14) | 7368 (39.49) |

| Guard policy | Guard Defend count (%) | Guard Donut count (%) | Mean Guard damage dealt | Mean Player damage dealt | Mean effective Donut HP |
| --- | --- | --- | --- | --- | --- |
| random | 7046 (28.07) | 993 (3.96) | 562.72 | 1353.92 | 172.15 |
| heuristic | 1050 (5.29) | 956 (4.81) | 920.52 | 1216.86 | 198.25 |
| q-20k | 848 (4.83) | 1000 (5.69) | 883.40 | 1201.63 | 162.30 |
| q-40k | 2059 (11.02) | 1000 (5.35) | 861.09 | 1235.33 | 186.92 |
| q-60k | 1751 (9.39) | 999 (5.36) | 928.00 | 1216.20 | 197.01 |

The simple heuristic prioritizes emergency full-value healing at<=25% HP, direct attacks against CRITICAL Player, available Wife cleanse/buff/SP, then seeded weighted Attack/Whistle/Crack pressure. It sees only public observations and chooses valid actions. Random baseline remains uniform and unchanged.

## Donut audit

All following checkpoint audits aggregate3000 normal full battles (equal bots). Uses are executed Donuts; value/HP bins use predecision HP. Restored-event HP measures actual effective healing, including any same-round effects. Wasted=200−effective.

| Checkpoint | CRITICAL | LOW | MID | HIGH | VERY_HIGH | FULL_VALUE | PARTIAL_VALUE |
| --- | --- | --- | --- | --- | --- | --- | --- |
| q-20k | 0 | 0 | 0 | 53 | 2947 | 647 | 2353 |
| q-40k | 0 | 0 | 0 | 89 | 2911 | 1065 | 1935 |
| q-60k | 0 | 0 | 58 | 711 | 2230 | 1343 | 1656 |

| Checkpoint | Executed uses | Mean restored | Mean wasted | Uses <100 HP % | Above75% HP % |
| --- | --- | --- | --- | --- | --- |
| q-20k | 3000 | 104.77 | 95.23 | 53.17 | 98.23 |
| q-40k | 3000 | 124.79 | 75.21 | 40.50 | 97.03 |
| q-60k | 2999 | 135.42 | 64.58 | 33.78 | 74.36 |

| 60k versus bot | Uses | FULL / PARTIAL | Mean restored | Mean wasted | <100 HP % | Above75% HP % |
| --- | --- | --- | --- | --- | --- | --- |
| random | 1000 | 288 / 712 | 123.19 | 76.81 | 38.00 | 91.80 |
| aggressive | 999 | 956 / 43 | 197.01 | 2.99 | 1.00 | 32.73 |
| tricky | 1000 | 99 / 901 | 86.13 | 113.87 | 62.30 | 98.50 |

Donut efficiency improves strongly against Aggressive with60k, but still poor against weaker bots. Above75% HP is not itself waste: a1200-max Guard can accept the entire200 heal at1000HP (83.33%). FULL_VALUE remains observation, never a policy restriction.

## Defend audit

| Checkpoint | CRITICAL Defend / decisions (%) | Longest chain | Longest while Player CRITICAL | Player-CRITICAL chains >=2 | Round-limit draws |
| --- | --- | --- | --- | --- | --- |
| q-20k | 410 / 1235 (33.20) | 7 | 2 | 11 | 0 |
| q-40k | 460 / 1414 (32.53) | 6 | 3 | 21 | 0 |
| q-60k | 207 / 1049 (19.73) | 7 | 2 | 12 | 0 |

More training is not monotonic: longest chains are7/6/7. CRITICAL Defend improves at60k; all checkpoints avoid round-limit draws. Forced skipped rounds break chains. There are still short nonfinishing Defend chains when Player is CRITICAL. No Defend nerf or tactical workaround was added.

## RILED verification

| Checkpoint | Crack count (% decisions) | Immediate repeats | RILED entries / battles | Hit % | Miss % | Crit % of hits | Stumbles (% misses) | Fatal stumbles |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| q-20k | 8436 (14.23) | 588 | 15097 / 2996 | 65.42 | 34.58 | 35.09 | 1618 (20.50) | 5 |
| q-40k | 8113 (13.52) | 458 | 14740 / 2994 | 65.63 | 34.37 | 35.55 | 1522 (20.23) | 4 |
| q-60k | 6042 (10.12) | 516 | 12663 / 2966 | 65.42 | 34.58 | 35.09 | 1320 (20.17) | 2 |

Entries include Talk Smack and status refreshes. Hit/miss/crit samples include completed physical Guard attacks while RILED, excluding cancelled actions. These are observational checks; RILED/stumble values were not changed.

## SFX source cleanup

Folder **500-game-sound-effects**. Before **500 audio files**, kept **399**, deleted **101**; exact duplicate groups **0**. All were WAVs with inspected headers; JSON records actual duration, encoding, sample rate/channels/bit depth, bytes, hashes, metadata chunks and PCM peak/RMS. No transcode or renaming. README/LICENSES retained. No perceptual listening is claimed.

Deleted only explicit sword/knife weapon effects, firearms/ammunition/ranged weapons, explosions/bombs, offensive fire spells, named monsters, engines/robots/space machinery, lasers/phasers. Generic magic feedback, vague creature hurt/death, gear/armor, scrapes, whooshes, atmospheric/weather/water effects and household impacts remain for audition. No duplicate copies were removed because none were exact.

Every retained file is categorized and every deletion has its full path and reason in [SFX_AUDIT.md](SFX_AUDIT.md); per-file machine-readable inventory and integrity records in [SFX_AUDIT.json](SFX_AUDIT.json). Deletion plan was recorded first; PowerShell validated absolute paths stay under this collection and checked hashes before nonrecursive literal-file deletion. Post-cleanup verification confirms all planned files gone, retained hashes unchanged, no runtime source references to deleted names/paths, and protected runtime/music/image/animation assets unchanged during cleanup. Only the intended SFX files were deleted.

**No SFX integrated**: no copies into public/assets, no Phaser registrations/preloads, no action/UI/status/interaction sound changes. Hallway/battle tracks, volumes, musician toggle and music lifecycle were not edited.

## Verification and manual checks

Tests: **349/349 passed**, **0 failures**. Syntax: **PASS: 84 JavaScript modules**. Production build: **PASS** (existing large-chunk warning); built table and audio verified against runtime originals. All runtime music and animation/image integrity comparisons passed.

Deterministic coverage includes1200 Guard/1000 Player, percentage bins for1200, no-HP Catch Breath with SP cap/no defense,200-HP Donut/cap/no SP, exact200 missing-HP boundary, both Whistle orders/single skip/no SP charge, unchanged RILED thresholds, explicit visits/zero distinction, seeded unvisited-valid priority, EVAL visited-only/fallback nonmutation, randomized starts, heuristic legality/public observations, v4 rejection and chosen-v5 loading, checkpoint serialization/RNG reproducibility, and existing music lifecycle tests.

Manual browser checks remain: verify the1200 HP bar/label and new recovery commentary during real battles, P/F2 switching, animation pacing, and audible hallway/battle transitions/autoplay. No browser session was claimed here. Manually audition retained SFX before later selection/integration; current classification uses metadata/category context conservatively.

Raw evaluation/behavior comparison: tools/guard-v5-comparison.json. Production Q/metrics and representative policy inspection: public/assets/ai. Reproduction tools: trainGuard.mjs, compareGuardCheckpoints.mjs, inspectGuardPolicy.mjs, auditTrainingCoverage.mjs, reportGuardV5.mjs. No DDA.
