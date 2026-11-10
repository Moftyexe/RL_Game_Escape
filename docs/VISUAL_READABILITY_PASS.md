> Historical inspection report. Combat balance, recovery commentary, Call Wife, and RL state values are superseded by [the v2 balance/RL/audio pass](FINAL_BALANCE_RL_AUDIO_PASS.md). Running asset findings remain historical evidence.

# Final visual/readability pass

Historical pass: see [Final combat and running audit](FINAL_COMBAT_RUN_AUDIT.md) for current Look There, Guard HP, run anchoring and playback.

For the current presentation implementation, see [Presentation / UX polish](PRESENTATION_UX_POLISH.md). Earlier visual measurements below describe the previous pass.

Combat rules, priorities, randomness, costs, damage, accuracy, critical values, statuses,
insults and the hidden-action round resolver are unchanged. No Q-learning or DDA.

## Source inspection and mappings

All Player/Guard source PNGs were rescanned for actual connected pose counts and
alpha bounds. New integrations:

| Source | Dimensions | Frames | Mapping / FPS |
|---|---|---:|---|
| P_Animations/Pixel Running Cycle Sprite Sheet.png | 2172x724 | 16 | run-side / 16 FPS; mirrored for left |
| P_Animations/Protagonist_Battle_victory.png | 2172x724 | 5 | player-battle-victory / 7 FPS |
| Guard_Animations/Guard_battle_Distracted.png | 2172x724 | 4 | guard-battle-distracted / 4 FPS looping |
| Guard_Animations/Guard_battle_Riled.png | 2172x724 | 4 | guard-battle-riled / 4 FPS looping |
| Guard_Animations/Guard_battle_Victory.png | 2171x724 | 5 | guard-battle-victory / 7 FPS |
| Guard_Animations/Guard_battle_defeat.png | 2172x724 | 6 | guard-battle-defeat / 7 FPS |

Front/rear canonical runs still have six poses at 12 FPS. The alternate rear sheet
also contains six poses and stays unselected. No Player defeat sheet was found.
Player defeat explicitly retains a null mapping and holds the final Hurt pose as
a static fallback. It does not return to idle when hurt art is available.

Outputs retain the existing transparent, nearest-neighbor normalization: movement
128x128, baseline 124; battle 192x160, baseline 155. Pose bounds and source hashes
are recorded in generated processing reports. Detached noise is excluded. Guard
Defeat preserves its first-frame body scale as the character lowers to the floor;
seated poses are not stretched back to standing height. No source PNG was changed.
Movement exports now replace generated frames using a temporary sibling and rename,
which avoids Windows refusing to overwrite frames open in an image viewer.

Guard persistent stance precedence: Defend hold > RILED/DISTRACTED loop > regular
idle. Hurt is temporary and returns to that precedence. FOCUSED uses existing
feedback and ordinary idle. Outcomes play once and hold their final frame.

## Scale and floor

At the reference 1024x768 viewport:

| Actor | Old scale | New scale |
|---|---:|---:|
| Exploration Player | 1.00 | 1.35 |
| Exploration Guard | 1.00 | 1.48 |
| Battle Player | 1.00 | 1.18 |
| Battle Guard | 1.00 | 1.13 |

Exploration Guard is approximately 9.6% taller than Player. Battle Guard retains
its broader silhouette. Scale stays constant across animations, using foot anchors.
Hallway source-coordinate floor band changes from y=400..625 to y=400..550.
Bottom perspective edges change x=50..2000 to x=80..1960; rear edges are unchanged.
Player spawn y=480 -> 470; Guard y=500 -> 490. Camera zoom stays 1.0. World crop,
horizontal scrolling, movement speed, interaction radius and fixed-screen prompt
are unchanged. Static hallway composite was reviewed; live scrolling needs manual QA.

## Mechanical commentary

The separate black, white-bordered narration box occupies y=402..492. Character
speech remains in upper character lanes; action banners remain separate. Permanent
combat history remains in CombatSystem.log, with the latest entry in a bottom strip.
Narration is derived from resolved events only. It displays actual capped recovery.
Messages queue sequentially; only one mechanical box is visible. Shutdown cancels
pending narration and all temporary visuals. Status refresh uses a shorter reminder
instead of repeating the full modifier explanation. Persistent colored status text
and Guard idle animation communicate ongoing statuses.

| Action | Typical commentary |
|---|---|
| Bro, Lock In | You are FOCUSED. / Accuracy up, Crit up, Defense up |
| Talk Smack | The Guard is RILED. / Damage up, Crit up, Accuracy down |
| Look There! | The Guard is DISTRACTED. / Accuracy down, Defense down |
| Crack Knuckles | The Guard is RILED. / Damage up, Crit up, Accuracy down |
| Blow Whistle | You are DISTRACTED. / Accuracy down, Defense down |
| Whistle stun | The whistle stunned you! / Your next action opportunity is lost. |
| Cancelled action | You were stunned! / Your action was interrupted. |
| Catch Breath | You caught your breath. / +20 SP |
| Eat Donut | The Guard ate a donut. / +180 HP +20 SP |
| Call Wife cleanse | His wife calmed him down. / RILED or DISTRACTED removed. +20 SP |
| Call Wife focus | His wife encouraged him. / FOCUSED +20 SP |
| Defend | The Guard braces for impact. |
| Blocked attack | The Guard blocked part of the attack. |

The game uses arrow glyphs for up/down in the actual modifier text.

## Timing and layout

- Reveal 650 -> 800 ms, still after both choices lock.
- Lock In, Catch Breath, Whistle holds 700 -> 875 ms.
- Look There and Crack Knuckles holds 800 -> 1000 ms.
- Talk Smack pose 1100 -> 1375 ms; insult reading time remains 1500..2200 ms.
- Donut uses the 875 ms recovery pose hold; Defend adds a 500 ms final-pose hold.
- Ordinary speech 1100 -> 1375 ms; banners 550 -> 690 ms.
- Skill recovery 140 -> 175 ms; physical attack FPS, hit-stop and recovery unchanged.
- Mechanical commentary 1200 ms simple / 1600 ms important; stun feedback shares
  that reading time rather than introducing an additional unnecessary wait.
- Call Wife stays approximately 3025 ms excluding reveal: phone animation, Guard
  speech (900 ms), 150 ms pause, Wife response (1000 ms), then commentary appears
  200 ms into that response in the separate box and shares the final phone hold.
  The phone-to-ear frame remains held throughout the spoken exchange. Mechanics
  resolve only once, before presentation.

Panels have stronger backgrounds and consistent borders; selection highlight is
clearer; log and controls have their own lower strip. The upper arena has very
faint architectural bands. No new backdrop art or major interface redesign.

## Verification

123 tests pass, zero failures. Tests cover source hashes, transparency, bounds,
frame counts/FPS, baseline placement, status-idle precedence and Hurt returns,
terminal holds, event-derived narration, narration sequencing/shutdown, Call Wife
runtime, hidden selection and unchanged combat mechanics. JS/MJS syntax checks pass.
Production build passes with Vite's large-chunk warning.

Live UI inspection was attempted but Computer Use ended because it could not verify
the browser URL sufficiently to enforce policy. No further UI automation was used.
Manual checks remaining: live pacing/loop smoothness, speech/sprite overlap at
multiple window sizes, outcome sequences, scrolling near the exit and prompt.
Static source and normalized sprite contact sheets and hallway scale composite
were visually inspected. Preview images are in tools/*review.png and the generated
asset preview files.
