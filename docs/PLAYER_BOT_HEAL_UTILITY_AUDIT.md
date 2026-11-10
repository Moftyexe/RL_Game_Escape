# Simulated-Player healing utility and Q100k re-evaluation

## Decision: retraining not necessary

Keep the existing production Q100k **byte-for-byte unchanged**. Aggressive Guard win rate **46.80% → 47.30% (0.50pp)**; overall Q win rate **80.90% → 80.33% (-0.57pp)**. Q against Random changes96.30→94.10%; Tricky stays99.60%. These are small changes, not evidence that the training opponent became materially stronger. Heuristic > Q > Random ordering remains on every bot style. Existing Q weaknesses remain; conclusions do not reverse.

Practical review thresholds: approximately5pp absolute Aggressive change or3pp overall Q change, plus qualitative ordering/action-distribution changes. Neither numerical threshold is crossed. Aggressive damaging/Attack/Backpack distributions remain close (below). Random Guard versus Random moves more (-4.3pp), but this does not materially alter production Q conclusions. This is paired fixed-seed validation, not proof of optimality or human difficulty.

**No new training was run. No v7 or combat-schema bump. Q-learning is frozen and ready for DDA work; DDA is not implemented.** Production path public/assets/ai/guard_qtable.json; SHA256 **a45930e8955707be6f1ea0689b39b0ecbce384080277fa2fa19c9c813f695a6d**. All old60k/80k/100k checkpoints remain available unchanged.

## Bot-only fix

Old Random Player sampled all legal actions uniformly, including full-HP Catch Breath. Aggressive/Tricky used fixed personality weights, with no healing-value adjustment. Catch Breath is no longer free SP recovery, so full-HP choices wasted30SP and a turn.

New playerBotWeights first preserves each style's original base weights and authoritative legal actions, then changes only Catch Breath weight:

    efficiency = min(max(maxHP-currentHP, 0), 100) / 100
    CatchBreathWeight = originalStyleWeight * efficiency

At0 missing HP weight=0; at20 it is20% of base,50 gives50%, and>=100 gives the full configured weight. This is smooth utility, not a low-HP tactical threshold. Random remains broadly weighted across all other legal actions (base1); Aggressive keeps Attack6/Backpack8/Catch.15 at legal SP; Tricky keeps Attack2/Backpack1/Catch1/Defend4/Look There5. Focused Lock In weighting and every non-Catch weight remain unchanged. Existing low-SP recovery preferences are preserved in base logic but Catch remains invalid below30SP, so cannot bypass cost.

Player bot metadata version **player-bots-v2-heal-utility** is distinct from combat schema **guard-q-v6**. Future training metadata identifies corrected opponents; existing Q100k honestly retains its historical player-bots-v1 training metadata. No Q values, visits, schema or metadata were rewritten. RandomGuardPolicy is unchanged; this fix affects simulated Player policies only.

## Frozen game and run cycle

Catch Breath still FAST/30SP/100HP/capped1000/no SP recovery/no defense, execution-only cost and heal. Player1000HP, Guard1200HP, Donut200, Whistle, RILED, Defend, all other skills/priorities/rewards/state representation/visit behavior unchanged. Talk Smack sequence1,2,3,5,6 unchanged. The current video-derived eight-pose side run was already installed when this narrower task arrived; it is unchanged in this pass. Its previous359-test run passed. No music, musician, SFX or DDA changes.

## Identical before/after evaluation design

Exact current production table loaded from its production path, not a newly trained table. Seed **20261107**, **1000 normal full-start battles per policy/bot**, max rounds **100**, identical named episode/combat/tie/Player/Guard RNG streams. Policy is EVAL, epsilon0, no learning. Every evaluation serializes/checks the in-memory table before/after; final file SHA matches the original. All nine corrected-bot evaluations completed. Previously saved old-policy results are preserved in tools/guard-v6-old-production-evaluation.json; new results in tools/guard-bot-utility-evaluation.json.

W/L/D and reward below are Guard-perspective. Before/after uses identical initial seeds, but changing actions naturally makes subsequent trajectories diverge.

| Guard | Player | Bots | W/L/D | Win % | Mean rounds | Mean reward |
| --- | --- | --- | --- | --- | --- | --- |
| random | random | OLD | 424/576/0 | 42.40 | 43.96 | -40.50 |
| random | random | CORRECTED | 381/619/0 | 38.10 | 43.35 | -50.59 |
| random | aggressive | OLD | 27/973/0 | 2.70 | 24.30 | -141.29 |
| random | aggressive | CORRECTED | 25/975/0 | 2.50 | 24.13 | -142.01 |
| random | tricky | OLD | 822/178/0 | 82.20 | 53.27 | 54.00 |
| random | tricky | CORRECTED | 823/177/0 | 82.30 | 53.25 | 53.68 |
| heuristic | random | OLD | 983/17/0 | 98.30 | 26.30 | 103.86 |
| heuristic | random | CORRECTED | 979/21/0 | 97.90 | 26.52 | 102.20 |
| heuristic | aggressive | OLD | 517/483/0 | 51.70 | 19.86 | -19.44 |
| heuristic | aggressive | CORRECTED | 513/487/0 | 51.30 | 19.81 | -20.45 |
| heuristic | tricky | OLD | 1000/0/0 | 100.00 | 28.57 | 117.44 |
| heuristic | tricky | CORRECTED | 1000/0/0 | 100.00 | 28.54 | 117.42 |
| q-100k | random | OLD | 963/37/0 | 96.30 | 25.50 | 98.57 |
| q-100k | random | CORRECTED | 941/59/0 | 94.10 | 26.06 | 92.71 |
| q-100k | aggressive | OLD | 468/532/0 | 46.80 | 23.46 | -32.44 |
| q-100k | aggressive | CORRECTED | 473/527/0 | 47.30 | 23.36 | -31.37 |
| q-100k | tricky | OLD | 996/4/0 | 99.60 | 26.66 | 116.36 |
| q-100k | tricky | CORRECTED | 996/4/0 | 99.60 | 26.61 | 116.33 |


## Corrected Catch Breath audit

Measurements at actual execution; missing-HP categories are exclusive: full0,1–24,25–49,50–99,>=100. Each row is1000 battles. Counts of selections reconcile to executions+cancellations. A carried Whistle stun prevents selection and consumes a null opportunity; FAST Catch Breath normally executes before NORMAL Whistle, explaining why selected-action cancellations may be zero. Separate deterministic tests cover cancellation without cost/heal.

| Guard | Player | Selected / executed / cancelled | FullHP | Missing1–24 | 25–49 | 50–99 | >=100 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| random | random | 537/537/0 | 0 | 3 | 17 | 148 | 369 |
| random | aggressive | 30/30/0 | 0 | 0 | 0 | 8 | 22 |
| random | tricky | 273/273/0 | 0 | 1 | 6 | 52 | 214 |
| heuristic | random | 670/670/0 | 0 | 2 | 14 | 102 | 552 |
| heuristic | aggressive | 50/50/0 | 0 | 0 | 0 | 10 | 40 |
| heuristic | tricky | 303/303/0 | 0 | 0 | 9 | 41 | 253 |
| q-100k | random | 528/528/0 | 0 | 2 | 10 | 90 | 426 |
| q-100k | aggressive | 31/31/0 | 0 | 0 | 0 | 5 | 26 |
| q-100k | tricky | 249/249/0 | 0 | 0 | 4 | 34 | 211 |

| Guard | Player | Mean effective HP | Mean wasted HP | Mean SP before | Total Catch SP spent |
| --- | --- | --- | --- | --- | --- |
| random | random | 91.30 | 8.70 | 50.77 | 16110 |
| random | aggressive | 94.67 | 5.33 | 58.23 | 900 |
| random | tricky | 93.63 | 6.37 | 47.31 | 8190 |
| heuristic | random | 95.21 | 4.79 | 55.33 | 20100 |
| heuristic | aggressive | 96.00 | 4.00 | 57.12 | 1500 |
| heuristic | tricky | 95.05 | 4.95 | 53.96 | 9090 |
| q-100k | random | 94.49 | 5.51 | 51.97 | 15840 |
| q-100k | aggressive | 96.77 | 3.23 | 54.00 | 930 |
| q-100k | tricky | 95.93 | 4.07 | 52.20 | 7470 |

**Full-HP uses are0 across all nine rows. Every execution still costs exactly30SP.** Audit wrappers assert exact capped healing, zero SP restoration, no defense, and no cost/heal on cancellation. Regression tests verify instrumentation does not alter seeded traces/rewards/RNG.

## Aggressive Player versus unchanged Q100k

| Metric | OLD | CORRECTED |
| --- | --- | --- |
| Catch selected/executed/cancelled | 83/83/0 | 31/31/0 |
| Full-HP Catch % | 61.45 | 0.00 |
| Mean effective Catch heal | 36.39 | 96.77 |
| Guard win % | 46.80 | 47.30 |
| attack count (% Player decisions) | 16360 (69.84) | 16244 (69.62) |
| swingBackpack count (% Player decisions) | 4596 (19.62) | 4670 (20.02) |
| catchBreath count (% Player decisions) | 83 (0.35) | 31 (0.13) |
| Player damaging % | 89.99 | 90.17 |
| Mean Player damage/battle | 1287.96 | 1286.65 |
| Mean Player healing/battle | 3.02 | 3.00 |
| Mean Catch SP spent/battle | 2.49 | 0.93 |
| Guard damaging / setup % | 48.88 / 51.12 | 49.01 / 50.99 |
| Mean Guard damage/battle | 870.37 | 869.97 |

Frequencies count committed, non-null decisions; damaging means Player Attack/Backpack/Talk Smack. Actual damage excludes overkill and Guard stumble self-damage. Player healing is Catch Breath only. The corrected Aggressive remains attack-heavy, heals rarely, and does not become an optimized healing expert. Other simulated bots still have imperfect tactics.

## Verification and remaining manual checks

Tests **367/367 passed**; syntax **PASS: 94 JavaScript modules**; production build **PASS**, existing large-chunk warning. Final hash checks verify the original production table, combat, Q architecture/state/rewards, current running art/control files, music, SFX and other frozen files unchanged. No retrain, schema bump, checkpoint replacement or online learning occurred.

Tests cover efficiency0/.2/.5/.99/1, every bot's full-HP exclusion, personality weights,29/30SP legality, seeded reproducibility, exact audit-bin boundaries, unchanged instrumented traces/rewards, production EVAL nonmutation and existing compatibility/visits/fallback tests. Manual browser checks remain: basic gameplay/P/F2 and the newly installed video run's perceived loop/edge quality from the preceding task. This bot-only pass adds no human-battle healing restriction; humans may still choose Catch Breath at full HP if otherwise legal.

Reproduce corrected evaluation:

    node tools/compareGuardCheckpoints.mjs 1000 v6 100 --production --output=tools/guard-bot-utility-evaluation.json

Decision metadata: tools/bot-utility-decision.json. No DDA implemented.
