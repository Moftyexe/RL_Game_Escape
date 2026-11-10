# Day-based Guard readiness and gate narrative

## Progression

This replaces the proposed recent-win-rate DDA design with visible story progression. Each Phaser Game has one session RunState, shared through a WeakMap across SchoolScene, BattleScene and DayTransitionScene. No browser storage/save dependency; refreshing starts a new run.

Successful escapes are the canonical value: day = escapes + 1; readiness = min(day,5). Day1 starts with zero escapes and CASUAL readiness. A Player VICTORY records an escape and advances day exactly once. DEFEAT, DRAW or an early return/abandon resets exploration on the same day; readiness never decreases. Day continues increasing after tier5. Encounter IDs reject duplicate/stale result events. The battle keeps its starting-day snapshot for UI/debug while the session advances for the next day.

| Day | Tier | Narrative state | Best / second / third Q rank |
| --- | --- | --- | --- |
| 1 | 1 | CASUAL | 60% / 25% / 15% |
| 2 | 2 | ALERT | 70% / 20% / 10% |
| 3 | 3 | PREPARED | 80% / 15% / 5% |
| 4 | 4 | DETERMINED | 90% / 8% / 2% |
| 5+ | 5 | LOCKED IN | 100% / 0% / 0% |

Only CURRENTLY VALID, VISITED Guard actions are ranked. Unvisited zero-Q entries cannot enter the ranking. Top-three weights are truncated and renormalized for two candidates (CASUAL becomes60/85 and25/85); a sole candidate is always selected. Exact-Q ties are shuffled with the injected RNG to avoid action-catalog bias. Tier5 is greedy among best visited legal actions. No visited valid options delegates to the existing Q-policy's RandomGuardPolicy fallback, with no table writes. Forced skips bypass selection. There is no broad epsilon or performance-based sliding meter.

More readiness means greater adherence to learned rankings, not guaranteed optimal tactics. Existing Q-policy weaknesses remain; this layer adds no tactical healing/finishing rules and no stat adjustments. P still switches to the explicit Random debug baseline; fresh battles load Q mode by default.

## Scene and interaction flow

1. Explore with existing WASD/arrows, camera, collision footprint, movement speed and NPC interactions.
2. Entering the existing Guard/gate proximity circle automatically starts the gate exchange; no Space press is needed. Movement/interaction updates lock, Player goes idle, and the encounter cannot start twice.
3. Dialogue advances with SPACE, ENTER or click. Held-key repeats do not advance. Battle launches only after the last line, passing the day/readiness snapshot and encounter ID; exploration pauses.
4. Battle finishes with the normal result and victory/defeat poses. After a1.8-second result hold, victory starts DayTransitionScene; loss/draw returns directly to reset SchoolScene. Early Esc/Return also retries the same day. Repeated return/result events are guarded.
5. DayTransitionScene shows THE NEXT DAY, DAY N and the readiness name. It fades in350ms, starts fading out after1900ms, and launches reset exploration350ms later. Both actors are newly initialized by the unchanged combat engine when the next battle starts.

The transition itself does not increment the day again. Exploration restarts at the original spawn, so it does not immediately retrigger the gate zone. No training or battle mechanics were moved into the story system.

## Editable dialogue and portraits

Gate lines live in `src/game/dialogue/gateDialogue.js`, keyed by readiness/day1–5, with day5 reused thereafter. Missing/empty alternate scripts fall back to Day1. Current placeholders include “Where do you think you’re going?” / “Home.”, “You got lucky yesterday,” “I know your tricks now,” and later refusals.

`DialogueBox.js` is a reusable modal accepting a sequence of `{speaker,text,name?,portrait?}`, a completion callback, and an input-lock callback. Its viewport-scaled1024×768 layout reserves a120×166 left portrait panel, speaker name, wrapped text and advance hint. Shutdown removes pointer/key/resize listeners, destroys the modal and releases its lock without completing the encounter.

`portraits.js` maps `player` and `guard` to speaker names, texture keys and optional runtime file paths. To add art later:

1. Put a portrait under `public/assets/portraits/` (or another runtime asset folder).
2. Set that speaker's `file` to e.g. `assets/portraits/player.png`.
3. Existing SchoolScene preload hooks load configured files; the renderer looks up their texture keys and fits the portrait proportionally in the left panel.

Both speaker paths are now registered to byte-identical runtime copies of P_Animations/P_dialogue.png and Guard_Animations/guard_dialogue.png. Absent/failed textures leave a blank portrait panel and working text. A per-line portrait override and custom speaker registry are supported. No portrait art was generated, and the newly present `P_dialogue.png` was not automatically assigned or altered.

## Battle UI and F2

The battle top area shows `DAY N · GUARD: NAME` beneath the encounter title. The hallway also has a small day label. F2 retains the Q/visit/unvisited display, current/committed policy and explicit unseen-state fallback. It now also shows day, escape count, readiness name/number, configured rank weights and the applied candidate probabilities after reveal (including two-action normalization). Current hidden Player choices are never displayed.

## Frozen Q and audio behavior

The readiness wrapper is attached only through live GuardAIController when supplied a narrative context. QLearningGuardPolicy itself stays EVAL/epsilon0 with learning disabled. Headless training/evaluation and its previous results are unchanged; no retrain was run.

Production table SHA256:

`a45930e8955707be6f1ea0689b39b0ecbce384080277fa2fa19c9c813f695a6d`

v7 compatibility, Q values/visits, Player1000HP/100SP, Guard1200HP/100SP, Catch Breath30SP/150HP, all other skills, Donut200HP, Whistle, RILED, priorities, rewards and training configuration remain unchanged.

HallwayMusic and BattleMusic runtime modules and volumes are unchanged. Battle stops before restarting exploration. The paused hallway scene is shut down before the next day/retry, then the same SoundManager/session track resumes its previous seek if enabled. The musician's hallway-only toggle persists across these scene resets. Day cards are silent; no overlapping tracks or duplicate instances are introduced. Automated tests cover reset ordering, repeated battles, OFF preference, seek and unlock/missing-audio cases. No SFX were integrated or modified.

## New run video test and selection

Inspected `P_Animations/8-frame side run cycle.mp4`: H.264,1920×1080,30FPS, approximately5.22s. It starts idle; that introduction is excluded. Eight chronological native zero-based frames9,11,13,15,18,20,22,24 were selected (human10,12,14,16,19,21,23,25).

The candidate initially lost dark trouser pixels with the older video's mask threshold8. Testing threshold5 preserved the full silhouette and removed the dark background. The final transparent sheet, normalized preview and source-to-runtime audit were inspected; the new candidate passed all pipeline checks and was selected.

- Derived source: `P_Animations/latest-run-side.png` plus provenance JSON.
- Active selector: `P_Animations/active-run-video.json`.
- Runtime: eight `public/assets/player/movement/run_side/*.png` frames,256×256, nearest-neighbor, one body scale, common floor/head anchoring.
- Animation: `run-side`, ordered0→1→2→3→4→5→6→7→0 at12FPS. Frame hashes/revisioned texture keys and URL versions invalidate old cached frames; old animation registrations are replaced.
- Front/rear/idle/walk imagery, Player scale/foot origin,400 movement speed, camera and footprint remain unchanged. Video audio is ignored.

The previous `3.mp4` cycle and `3-run-side.png/.json` remain intact. To revert, set selector `stem` to `3-run-side`, then run `node tools/processPlayerSprites.mjs --runs-only` and `node tools/auditRunning.mjs`. This restores the previous eight-pose10FPS cycle without touching combat or progression.

Extraction reproduction: `node tools/extractVideoRun.mjs --latest`. A local FFmpeg path is available under `tools/video-deps`; `RUN_VIDEO_FFMPEG` can point to another installation. Raw decoded frames and comparisons remain under tools. No AI redraw/recolor or new SFX was used.

## Files and validation

Added: RunState, ReadinessGuardPolicy, gate dialogue data, DialogueBox, portrait registry, DayTransitionScene and their tests. Updated: SchoolScene/BattleScene/main scene registration, GuardAIController, F2 display, encounter/presentation/audio-reset tests, run extraction/active-source selection and video provenance tests. Production Q/learning/combat modules were not edited.

Final results are recorded in `tools/day-verification.json`, test log `tools/day-tests.txt`, syntax log `tools/day-syntax.txt`, and integrity report `tools/day-integrity.json`.

Automated validation:380/380 tests passed, including all five exact tier distributions, visited-valid ranking, single/two-action cases, unseen fallback/nonmutation, session persistence/cap, loss/retry behavior, idempotent win, dialogue-before-battle, day metadata, result-to-transition flow, day-card timing, portraits/missing assets, key-repeat cleanup, audio resets and the updated run/cached-texture checks. JavaScript syntax and production build passed; existing large-chunk warning remains.

Live browser verification was attempted but blocked: in-app browser host unavailable; native Edge access approval timed out before UI access. No live browser/audio check is claimed. Remaining manual checks: walk to gate, advance the portrait-ready exchange, inspect Day/readiness/F2 layout, win through Day1→Day2, lose and retry the same day, repeat beyond Day5, test hallway toggle across outcomes, and judge new run-loop/edge quality in motion. The local preview server is available at `http://127.0.0.1:8080/` while its dev session remains running.

Current v7 combat/evaluation/portrait details: [v7 report](V7_COMBAT_GATE_PORTRAITS.md). Existing tier distributions, day progression and scene/music lifecycle remain unchanged. Production table identity is recorded in that report; the earlier v6 hash above is historical.
