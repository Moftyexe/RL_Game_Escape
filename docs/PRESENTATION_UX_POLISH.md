> Historical inspection report. Combat balance, recovery commentary, Call Wife, and RL state values are superseded by [the v2 balance/RL/audio pass](FINAL_BALANCE_RL_AUDIO_PASS.md). Running asset findings remain historical evidence.

﻿# Presentation / UX polish before Q-learning

Historical pass: see [Final combat and running audit](FINAL_COMBAT_RUN_AUDIT.md) for current Look There, Guard HP, run anchoring and playback.

This is the current presentation report, superseding the earlier visual pass.
CombatSystem, action definitions/priorities, balance, costs, status formulas,
hidden commitments, tie RNG, stun/death rules, RandomGuardPolicy and insults were
not edited. No Q-learning or DDA was implemented.

## 1. Latest assets and running cycles

Source folders were rescanned before editing. The replaced side-run file is now
P_Animations/Pixel Running Cycle Sprite Sheet.png: 1983x793, alpha transparency,
ten separated right-facing silhouettes. It replaces a 2172x724 sixteen-pose sheet.
Alpha-connected components, not equal grid cells, determine the actual poses.
Connectivity excludes near-invisible alpha noise; retained pixels preserve alpha.

| Direction | Current source | Dimensions | Previous -> new frames | FPS |
|---|---|---|---|---:|
| Right / flipped Left | Pixel Running Cycle Sprite Sheet.png | 1983x793 | 16 -> 10 | 16 base; 540 ms cycle |
| Down | Six-Frame Pixel Art Run Cycle.png | 2172x724 | 6 -> 6 | 12 |
| Up | Pixel Runner Back-View Sprite Sheet.png | 2172x724 | 6 -> 6 | 12 |

The alternate Pixel-Art Runner Sprite Sheet.png is also a six-pose rear run;
there is no new front/rear replacement. Existing direction selection, left flip,
diagonal normalization, speed, feet anchoring and collision band remain intact.
Source hashes, dimensions, pose bounds, replacement history and counts are in the
regenerated movement reports. Obsolete generated side-run frames 10..15 were
removed after validating the complete new batch. Source PNGs were not changed.

The newly supplied Protagonist_Battle_Defeat.png was also integrated: 2172x724,
five poses, 10 FPS, playing once and holding frame 4. Both combatants now have
real victory and defeat mappings. Falling poses keep a single body scale rather
than stretching seated characters back to standing height.

## 2. Exploration quality and physical scale

| Property | Before | After |
|---|---|---|
| Player and Guard output canvas | 128x128 | 256x256 |
| Normal visible character height | 120 px | 240 px |
| Visible feet baseline | 124 | 249 |
| Foot origin | 125/128 | 250/256 (same ratio) |
| Player runtime scale at 1024x768 | 1.35 | 0.675 |
| Guard runtime scale at 1024x768 | 1.48 | 0.74 |
| Player apparent standing height | 162 px | 162 px |
| Guard apparent standing height | 177.6 px | 177.6 px |

High-resolution source crops are resized directly with nearest-neighbor filtering;
small old processed frames are not enlarged. Aspect ratios and transparency are
preserved. Runs use one proportional scale per source sheet so a crouch does not
enlarge the head. Idle/run canvases share their feet baseline. Guard stays about
9.6% taller. Fractional downscales preserve the established physical size, with
nearest filtering and rounded draw positions preventing smoothing. Hallway floor,
camera zoom, spawn positions and interaction radius are unchanged this pass.

Pixel-art settings: Phaser pixelArt=true, antialias=false, roundPixels=true;
Phaser also disables antialiasGL when pixelArt is enabled. Animation textures
continue to set NEAREST. Canvas CSS now uses image-rendering: pixelated, with
crisp-edges fallback. The installed Phaser implementation was checked locally.

## 3. Backdrop, shadows and panels

BGbattle.png is 1672x941. battleBackdrop.js loads it through a Vite-managed asset
URL. A source-space cover crop fits the upper arena interior (26,22,972,366).
Uniform scaling preserves the cropped image's aspect ratio; it never extends
under commentary or bottom panels. A 35% dark/navy overlay keeps the hall visible
while supporting sprite and text contrast. Missing or failed backdrop textures
safely retain the existing dark panel.

Battle ground shadows are dark ellipses without blur: Player 76x12, Guard 104x14,
30% opacity. They sit under the feet and follow sprite position, including local
jolts. Battle display scales stay Player 1.18 / Guard 1.13.

Panel borders remain consistently 2 px with light outlines and darker, 96%-opaque
backgrounds. Selected rows have stronger contrast. Names/status labels have dark
strokes; HP/SP bars retain dark backing. Speech sits above the enlarged sprites
(bottom y=150), and beginning speech clears the temporary action banner in that
lane. Action reveal remains visible for 800 ms after both commitments lock.
The upper arena, commentary area, two status panels, menu and history strip remain
in their existing layout.

## 4. Battle controls

W / Up = previous enabled entry. S / Down = next enabled entry.
A / Left = close Skills. D / Right = open Skills when that entry is selected.
Enter / Space = confirm. Esc / Backspace and number shortcuts retain existing
behavior. Main-menu Left does not exit the encounter. During resolution the menu
continues to reject navigation/confirmation; keys do not buffer a next action.
Early dialogue advance was intentionally deferred.

## 5. Natural motion, holds and dialogue

Physical attacks remain 10 FPS; existing skills retain natural 8-10 FPS motion.
Victory/defeat are now 10 FPS rather than 7. Distracted's transition is 10 FPS
rather than the old 4 FPS loop. Riled and ordinary subtle idle remain 4 FPS.
Important pose holds remain localized to one inspected frame:

| Action | Zero-based expressive frame |
|---|---:|
| Bro, Lock In | 3 |
| Talk Smack | 2 |
| Look There! | 3 |
| Catch Breath | 3 |
| Crack Knuckles | 5 |
| Blow Whistle | 3 |
| Call Wife | 4, dynamic hold |
| Eat Donut | 4 |
| Defend | 3, then persistent round hold |

All speech uses the same length-aware formula (including phone lines):

    min(4000, max(1500, 1300 + Unicode character count * 40)) milliseconds

For example, the quoted Yum line gets 1540 ms; long insults approach 4000 ms.
The settings are centralized in presentationTiming.js. Call Wife introduces the
call, plays Guard speech, pauses 150 ms, plays the Wife response, then explains
the resolved branch. The phone-to-ear frame pauses for the calculated reading
window and resumes its recovery motion afterward. Watchdog and shutdown cleanup
account for the dynamic hold. Readable speech intentionally takes longer than
the previous fixed roughly-three-second exchange. Mechanics still execute once.

## 6. Mechanical commentary

The separate black, light-bordered 1-2-line box remains at y=402..492, independent
of character speech and permanent history. Messages derive only from resolved
events and queue one at a time. Actual capped recovery is reported. An unchanged
or refreshed status gets a short reminder rather than the full explanation.
Simple narration lasts 1200-1500 ms; important two-line narration 1600-2200 ms,
adjusted by message length. Expiry/shutdown disposes narration and temporary art.

| Action/event | Typical commentary |
|---|---|
| Bro, Lock In | You are FOCUSED. / Accuracy up, Crit up, Defense up |
| Talk Smack / Crack Knuckles | The Guard is RILED. / Damage up, Crit up, Accuracy down, Defense down |
| Look There! | The Guard is DISTRACTED. / Accuracy down, Defense down |
| Blow Whistle | You are DISTRACTED. / Accuracy down, Defense down |
| Stun before pending Player action | The whistle stunned you! / Your action was interrupted. |
| Stun after Player acted | The whistle stunned you! / Your next action will be skipped. |
| Catch Breath | You catch your breath. / +20 SP |
| Eat Donut | The Guard ate a donut. / +180 HP +20 SP |
| Call Wife introduction | The Guard called his wife. |
| Wife removes RILED | The Guard calmed down. / RILED removed. +20 SP |
| Wife removes DISTRACTED | The Guard refocused. / DISTRACTED removed. +20 SP |
| Wife from neutral | His wife encouraged him. / FOCUSED +20 SP |
| Wife refreshes FOCUSED | His confidence was restored. / FOCUSED refreshed. +20 SP |
| Defend | The Player / The Guard braces for impact. |
| Blocked attack | The attack was partially blocked. |

Actual modifier text uses arrow glyphs. Recovery examples assume sufficient
missing HP/SP; capped/full-resource cases show only actual recovery.

## 7. Persistent visual-state resolver

Priority is terminal Victory/Defeat > Defending > Distracted held pose > Riled
loop > normal idle. Temporary actions interrupt the persistent pose and return
to the current appropriate state afterward. Terminal animations play once and
hold their final frame; later refreshes cannot restore normal idle.

Guard Distracted registers frames 0,1,2 once (repeat=0). Source frame 2 is the
strong looking-away pose; source frame 3 faces forward again and is deliberately
excluded from playback. After the one transition the sprite holds frame 2 until
Distracted expires, is replaced or cleansed. Hurt returns directly to the held
pose rather than replaying the transition. Cancelling/replacing a transition
cleans its pending callbacks so a stale pose cannot override the new state.
Guard Riled loops and returns after Hurt/actions while active. Player has no
invented Distracted art: indicator, yellow reaction and commentary remain, then
ordinary idle.

## 8. Verification and remaining manual checks

148 tests passed, zero failures. Coverage includes regenerated hashes/pose counts,
256x256 transparency/baselines/aspect ratios, Guard output validation, directional
running and left flip, unchanged combat, hidden choice, WASD/arrow equivalence,
backdrop crop/fallback, foot-following shadows, text duration clamps, commentary
branches/ordering, no duplicate mechanics, Distracted held-frame behavior,
transition cancellation, Riled returns, Defend/terminal precedence, long phone
holds and safe shutdown. JS/MJS syntax checks passed. Production build passed,
with Vite's large-chunk warning.

Source sheets, processed animation contacts, and a static backdrop/layout preview
were inspected. These are not live browser screenshots. Remaining manual checks:
continuous run smoothness, browser/DPI scaling quality, live text/sprite overlap,
phone pose timing, status-to-action transitions and complete outcome sequences.
The previous Computer Use URL-verification limitation remains relevant; no live
browser verification is claimed for this pass.

Primary code: battleAnimations.js, battleBackdrop.js, presentationTiming.js,
presentBattleResult.js, mechanicalCommentary.js, presentationEffects.js,
BattleScene.js, main.js, SchoolScene.js, hallwayLayout.js, playerAnimations.js,
public/style.css, the three sprite processors, regenerated asset reports/PNGs,
and their combat-independent tests.


## Final running cadence and hallway shadows

Following the running-smoothness feedback, the inspected ten-pose side cycle
retains every source frame with per-frame times of 70,45,45,55,65,70,45,45,55,45 ms
(540 ms per loop, configured base 16 FPS). Near-identical passing poses no longer
linger for a uniform 83 ms each. The front/rear six-frame cycles stay at 12 FPS.
Movement remains 400 px/s, diagonals remain normalized, left still mirrors the
same side cycle, and apparent size remains unchanged. The higher-resolution
frames still use one source-body scale per run sheet.

Hallway Player and Guard now also have dark elliptical ground shadows, 26%
opacity, with the Guard shadow slightly wider. Dimensions scale with the existing
character display scale. Shadows sit two world pixels below the foot anchor,
follow the actor through movement/stopping/bounds, and scroll with the world.
Shadows draw at depth 1, character sprites at depth 2, and the Guard name at depth
3. Phaser owns their scene lifetime; no independent timers or animation state.

148/148 tests pass after these changes, with syntax checks on the changed modules.
