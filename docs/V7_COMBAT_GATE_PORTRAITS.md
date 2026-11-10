# v7 Catch Breath, Player evasion, automatic gate and portraits

## Combat scope

Catch Breath changes **100→150HP**; everything else about it stays FAST/30SP/zero SP restoration/no defense/one action/HP capped1000. It requires>=30SP and pays/heals only on execution. Capped recovery commentary reads the actual event (e.g.+150HP or+40HP near full). Player-bot healing utility automatically scales against the new150HP maximum; personality weights were not retuned.

Central constant **PLAYER_DEFEND_EVASION=.05** applies only when the defender is Player, actively defending, and an incoming physical attack uses an accuracy roll. Status accuracy modifiers and evasion are combined before the final0–1 clamp: normal90→85%, RILED65→60%. Guard Defend receives **zero evasion**; Player Attack remains90%, Backpack80% against it. Existing damage reduction and+10SP remain. No evasion applies to fixed/nonphysical damage, Talk Smack, guaranteed status applications or alwaysHit/accuracyRolled=false actions. Always-hit attacks bypass the hit roll. Accuracy metadata added to events is observational, not reward shaping.

All other combat is frozen: Player1000HP/100SP, Guard1200HP/100SP, Donut200HP only/once, Wife20SP/FOCUSED, Whistle10%/exactly one skipped Player opportunity, RILED values/duration/stumble, all action costs/priorities and Talk Smack animation unchanged. No readiness/DDA redesign, reward change, new SFX or run/music/NPC change.

## Automatic gate encounter

Old: Guard was a manual SPACE interaction. New: a dedicated proximity trigger is tested independently of the remaining NPC interaction zones. At1024×768 layout its center is **(2396.16,546.56)**, radius **150.00 world pixels**. It scales with existing hallway geometry and triggers before contact with the Guard; no Space or collision is required.

Entering the circle immediately hides prompts, settles the run animation to idle, sets gateBusy/inputLocked, and starts day-aware dialogue. Staying inside, repeated updates or duplicate calls cannot reopen it. Movement/interaction updates remain locked; only dialogue controls advance. The completion callback keeps the lock while launching BattleScene with the current day/readiness and encounter ID. Retry/new-day SchoolScene creation resets the trigger latch, at the original spawn. Musician SPACE interaction remains separate and unchanged.

Existing victory→next day/readiness increase, defeat→same day, cap5, next-day card, battle indicator and F2 information remain intact. Their source/state design was not altered.

## Real dialogue portraits

| Speaker | Source | Dimensions | Format / transparency | Runtime copy | Phaser key |
| --- | --- | --- | --- | --- | --- |
| player | P_Animations/P_dialogue.png | 1254×1254 | png; alpha0–255 | assets/portraits/player.png | player-dialogue-portrait |
| guard | Guard_Animations/guard_dialogue.png | 1312×1199 | png; alpha0–255 | assets/portraits/guard.png | guard-dialogue-portrait |

Both originals were visually inspected and copied **byte-for-byte**, not edited/redrawn. SchoolScene.preload calls the portrait loader with real file paths. Central speaker mapping selects the Guard image for Guard lines and Player image for Player lines. DialogueBox creates the corresponding Phaser image, destroys the prior speaker image on advance, applies NEAREST filtering and fits the original aspect ratio within108×150 in the reserved left portrait panel. Text/speaker labels remain separate. Missing textures leave a blank panel and working dialogue.

Integration tests verify actual preload registrations, runtime/source hashes, PNG alpha, correct image keys on speaker changes, proportional scaling using real1254×1254/1312×1199 dimensions, nearest filtering, old-image destruction and missing-portrait safety. These establish that graphics are wired into the render path, not unused path declarations. Live browser appearance still needs the manual check listed below; no unobserved browser rendering is claimed.

## Phased validation and fresh training

Before full training,306 non-artifact tests passed, including the required combat/gate/portrait/readiness/Whistle regressions. Shipped-v7/checkpoint compatibility tests awaited the new artifacts. Then a **200-episode smoke** from an empty table completed and loaded successfully (2087 states/3823 pairs). Full training began only after those checks.

Schema **guard-q-v7**, format2; combat signature includes150HP recovery and Player-only.05 evasion. v6 and older tables are rejected. No warm start. One continuous **100,000-episode** run, seed20261106; alpha.10/gamma.95/rewards unchanged; epsilon1→.05 by zero-based episode index45000, then.05 through100k. All checkpoints are prefixes of this same run, with Q values, explicit visits, seed/config, completed/planned count, legal-action coverage and corrected player-bots-v2-heal-utility metadata. No Q architecture, five percentage HP bins, Donut encoding or randomized-start preparation changes.

Target starts75% normal/25% coherent randomized; bots Aggressive50%/Random25%/Tricky25%. Live readiness adapter and human EVAL/no-online-learning design remain unchanged.

| Checkpoint | States | Visited pairs | Mean actions/state | Median | Fully explored observed legal % | SHA256 |
| --- | --- | --- | --- | --- | --- | --- |
| q-60k | 21177 | 52285 | 2.47 | 2 | 47.58 | 96dff2a6a9c7f2803342e5d7e9550231b22392c10a5bebd8e8d4fb7f012bf686 |
| q-80k | 22724 | 56890 | 2.50 | 2 | 48.45 | 0421b7869b7838c2937de523573ef468ce8185cbce1462fb840e40ae66a21a15 |
| q-100k | 23949 | 60909 | 2.54 | 2 | 49.36 | 74b5d24e3e3ffc5a2147045adc86c91685fe69edac60716625030a235a9b35b8 |

| Checkpoint | 1 visited | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- | --- |
| q-60k | 7044 (33.26%) | 5128 (24.21%) | 3611 (17.05%) | 3211 (15.16%) | 1790 (8.45%) | 393 (1.86%) |
| q-80k | 7313 (32.18%) | 5481 (24.12%) | 4016 (17.67%) | 3429 (15.09%) | 2059 (9.06%) | 426 (1.87%) |
| q-100k | 7404 (30.92%) | 5766 (24.08%) | 4341 (18.13%) | 3708 (15.48%) | 2262 (9.45%) | 468 (1.95%) |

## Held-out checkpoint evaluation

Seed **20261107**, **1000 normal full-start battles per policy/bot**, max100 rounds, same paired seeds, no learning or Q mutation. These evaluate strict Q EVAL, not a particular day's softer readiness distribution. Random and heuristic Guard are independent diagnostic baselines.

| Guard | Player | W/L/D | Win % | Mean rounds | Mean reward |
| --- | --- | --- | --- | --- | --- |
| random | random | 339/661/0 | 33.90 | 43.50 | -59.95 |
| random | aggressive | 24/976/0 | 2.40 | 24.14 | -142.32 |
| random | tricky | 785/215/0 | 78.50 | 54.16 | 44.55 |
| heuristic | random | 969/31/0 | 96.90 | 27.34 | 99.64 |
| heuristic | aggressive | 511/489/0 | 51.10 | 19.82 | -20.85 |
| heuristic | tricky | 1000/0/0 | 100.00 | 29.43 | 116.69 |
| q-60k | random | 968/32/0 | 96.80 | 23.24 | 101.97 |
| q-60k | aggressive | 580/420/0 | 58.00 | 17.22 | -5.09 |
| q-60k | tricky | 998/2/0 | 99.80 | 24.83 | 118.08 |
| q-80k | random | 957/43/0 | 95.70 | 24.61 | 98.10 |
| q-80k | aggressive | 564/436/0 | 56.40 | 20.12 | -8.90 |
| q-80k | tricky | 998/2/0 | 99.80 | 25.30 | 118.01 |
| q-100k | random | 972/28/0 | 97.20 | 23.48 | 102.73 |
| q-100k | aggressive | 486/514/0 | 48.60 | 18.59 | -25.98 |
| q-100k | tricky | 1000/0/0 | 100.00 | 24.72 | 118.90 |

Production chosen: **q-60k**. Q60 has the highest aggregate win rate (84.87% vs 83.97%/81.93%), strongest Aggressive matchup (58.0% vs 56.4%/48.6%), and best mean reward (71.65 vs 69.07/65.21). Its maximum Guard Defend chain is 3 versus 5/7, with no ordinary-evaluation draws. Later checkpoints improve coverage and Donut efficiency but do not outweigh poorer held-out performance. Deliberate healing-loop stalls remain in all candidates.

Installed hash: **96dff2a6a9c7f2803342e5d7e9550231b22392c10a5bebd8e8d4fb7f012bf686**. All three v7 checkpoints and matching metrics remain in tools/checkpoints/v7; v6 archives are preserved. Selected bytes are copied unchanged to public/assets/ai/guard_qtable.json. No extra balance adjustment followed evaluation.

## Evasion audit: actual engine events

Seed20261112,20000 independent live-engine sample rounds per case. Every event also asserts its exact configured effective accuracy. Hit/miss counts include accuracy rolls, not only landed hits; critical rolls/stumbles do not alter the defined hit threshold.

| Case | Expected hit % | Observed % | Hits | Misses |
| --- | --- | --- | --- | --- |
| Normal Guard vs Player Defend | 85.00 | 84.78 | 16955 | 3045 |
| Normal Guard vs undefended Player | 90.00 | 89.65 | 17930 | 2070 |
| RILED Guard vs Player Defend | 60.00 | 59.55 | 11910 | 8090 |
| RILED Guard vs undefended Player | 65.00 | 64.77 | 12953 | 7047 |
| Player Attack vs Guard Defend | 90.00 | 90.14 | 18028 | 1972 |
| Player Backpack vs Guard Defend | 80.00 | 80.01 | 16002 | 3998 |

## Defensive stall audit: ordinary bots

The following committed Player action chains include forced opportunities, which break chains. D→C means Defend immediately followed by Catch Breath; D→C→D counts a return to Defend; >=3D→C specifically tracks the resource-regeneration/healing pattern. Mean healing comes from actual capped restoration events. Round-limit draws are evaluation limits, not a new human-battle cap.

| Guard | Player | Max Player Defend chain | D→C | D→C→D | >=3D→C | Mean Player healing/battle | Mean rounds | Round-limit draws |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| random | random | 6 | 226 | 84 | 65 | 60.32 | 43.50 | 0 |
| random | aggressive | 3 | 2 | 1 | 0 | 3.02 | 24.14 | 0 |
| random | tricky | 8 | 137 | 63 | 61 | 32.28 | 54.16 | 0 |
| heuristic | random | 5 | 207 | 70 | 40 | 84.22 | 27.34 | 0 |
| heuristic | aggressive | 2 | 2 | 1 | 0 | 6.41 | 19.82 | 0 |
| heuristic | tricky | 6 | 109 | 49 | 31 | 38.62 | 29.43 | 0 |
| q-60k | random | 6 | 189 | 73 | 41 | 86.06 | 23.24 | 0 |
| q-60k | aggressive | 2 | 1 | 0 | 0 | 7.03 | 17.22 | 0 |
| q-60k | tricky | 7 | 94 | 39 | 27 | 35.95 | 24.83 | 0 |
| q-80k | random | 5 | 175 | 59 | 39 | 73.01 | 24.61 | 0 |
| q-80k | aggressive | 2 | 4 | 1 | 0 | 5.74 | 20.12 | 0 |
| q-80k | tricky | 7 | 83 | 38 | 25 | 29.77 | 25.30 | 0 |
| q-100k | random | 6 | 204 | 76 | 42 | 87.35 | 23.48 | 0 |
| q-100k | aggressive | 3 | 2 | 0 | 0 | 7.10 | 18.59 | 0 |
| q-100k | tricky | 7 | 101 | 47 | 31 | 37.91 | 24.72 | 0 |

### Deliberate healing-loop stress probe

Separate from the training/evaluation personalities: a Player that never attacks, Defends until missing>=150HP and affordable, then heals. Normal starts, seed20261113,300 episodes/policy,100-round audit cap. This probe diagnoses potential stalling rather than providing a win-rate headline or training target.

| Guard | W/L/D | Mean rounds | Round-limit draws | Max Player Defend chain | D→C | >=3D→C | Mean Player healing |
| --- | --- | --- | --- | --- | --- | --- | --- |
| random | 0/0/300 | 100.00 | 300 | 43 | 2859 | 2446 | 1574.00 |
| heuristic | 0/0/300 | 100.00 | 300 | 21 | 5759 | 3923 | 3139.50 |
| q-60k | 0/0/300 | 100.00 | 300 | 33 | 7649 | 5164 | 3851.00 |
| q-80k | 0/0/300 | 100.00 | 300 | 11 | 7624 | 5136 | 3839.00 |
| q-100k | 6/0/294 | 99.84 | 294 | 13 | 7538 | 5186 | 3804.50 |

The probe demonstrates long defensive/healing stalls for at least some policies/seeds. Human battles do not have the100-round cap, so these can last longer in live play. This is reported without an automatic Defend/healing nerf.

## Other behavior and regressions

| Q checkpoint | Guard CRITICAL Defend % | Max Guard Defend chain | Donut FULL / PARTIAL | Mean Donut heal / waste | RILED hit / miss % | Crit among hits % | Stumble among misses % | Fatal stumbles |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| q-60k / random | 24.19 | 3 | 250 / 750 | 121.09 / 78.91 | 64.68 / 35.32 | 34.92 | 19.62 | 1 |
| q-60k / aggressive | 11.36 | 3 | 838 / 162 | 187.22 / 12.78 | 64.06 / 35.94 | 34.65 | 20.53 | 8 |
| q-60k / tricky | 15.79 | 3 | 78 / 922 | 87.21 / 112.79 | 63.62 / 36.38 | 34.27 | 20.50 | 0 |
| q-80k / random | 31.96 | 4 | 317 / 683 | 124.73 / 75.27 | 63.16 / 36.84 | 34.50 | 20.31 | 1 |
| q-80k / aggressive | 25.09 | 5 | 916 / 82 | 194.12 / 5.88 | 64.78 / 35.22 | 35.36 | 22.70 | 4 |
| q-80k / tricky | 25.00 | 2 | 125 / 875 | 92.48 / 107.52 | 62.70 / 37.30 | 34.98 | 20.21 | 0 |
| q-100k / random | 32.89 | 4 | 530 / 470 | 160.65 / 39.35 | 64.02 / 35.98 | 36.30 | 19.44 | 2 |
| q-100k / aggressive | 12.86 | 7 | 948 / 39 | 197.54 / 2.46 | 64.84 / 35.16 | 33.05 | 21.21 | 6 |
| q-100k / tricky | 0.00 | 3 | 283 / 717 | 128.33 / 71.67 | 63.76 / 36.24 | 35.01 | 19.27 | 0 |

Donut still200HP/no SP/once/capped1200; Guard Defend still its existing damage reduction/+10SP with no evasion. RILED's damage, crit, status duration, defense and20%-after-miss/50-damage stumble values remain unchanged; Player evasion naturally changes the number of RILED misses when defending. Whistle's exact one-opportunity stun and OFF_GUARD rules retain their regressions. Day/readiness flow tests pass. Frozen run/music/SFX and unrelated art hashes match the pre-pass inventory.

## Verification and manual checks

Tests **388/388 passed**, failures0; syntax **PASS: 111 JavaScript/MJS files**; production build **PASS** with existing large-chunk warning. Built table, portrait copies, run and music assets match runtime originals. No SFX integration or DDA redesign.

Manual browser checks remain: approach the gate without Space, confirm portrait appearance and speaker switches, complete dialogue with no movement gap, win/new-day and loss/same-day resets, missing-portrait fallback, and in-battle healing/evasion feedback. Runtime portrait render creation is integration-tested; no live browser screenshot verification is claimed. Review extreme Defend/heal play in live readiness tiers before deciding whether any future balance work is warranted.

Artifacts: tools/guard-v7-comparison.json, v7-evasion-audit.json, v7-healing-stall-stress.json, guard-v7-selection.json, v7-verification.json; public/assets/portraits/manifest.json; production AI metrics. Reproduce with trainGuard.mjs, compareGuardCheckpoints.mjs, auditPlayerEvasion.mjs, auditHealingStall.mjs and reportGuardV7.mjs.
