# SFX integration and presentation report

## Scope and inspection

The current399 retained WAVs were rescanned, hashed and parsed for PCM format, duration, channels, sample rate, bit depth, peak and RMS (`tools/sfx-current-inventory.json`). All are48kHz/16-bit/stereo PCM WAV. No web sounds, transcoding, perceptual audition, portrait/sprite redraw, combat/Q/reward/readiness/day change or music-track/volume change. Choices use category context and measured duration/dynamics. Listening and final mixing remain manual.

Before: **399 source audio files** (+README/LICENSES). Active runtime files: **36**. Alternative copies: **28**, across15 named candidate folders. Retained source audio: **81** (+README/LICENSES). Unused deletion completed: **318**. Original active and candidate source files are retained too; counts across runtime/candidates/source are not additive unique sounds.

## Dialogue

Old box952x202 at(36,536); new952x140 at(36,598), **30.7% shorter**, same bottom margin. Dark navy, cream3px outer border plus inset pixel line. Dedicated108x112 portrait frame at(50,612), image centered at(104,668), fit92x104, NEAREST, original aspect ratio. Speaker at(174,613); text at(174,640),19px,782px wrap. Player/Guard use identical geometry and existing art.

Typewriter30ms/Unicode character;120ms input debounce; held-key repeat ignored. First Space/Enter/click while typing reveals only; later press advances; final fully visible line closes once and calls completion. Indicator is a small cream triangle, hidden while typing, blinking every450ms afterward. Timers/input/portrait are cleaned on advance/close/shutdown. Text tick every third non-space character, throttled75ms; skipping does not burst ticks.

## Battle entry

Gate still automatically locks movement and settles running to idle. Final dialogue closes ->200ms dramatic pause ->420ms horizontal black shutters with8-step pixel motion ->80ms full-black hold -> launch/pause ->220ms reverse shutters. **920ms total**. One-shot transition latch, shutdown cancellation and continuous input lock prevent duplicate battles/walking between dialogue and battle. Reveal also locks commands. Battle music attaches once after reveal through existing BattleMusic lifecycle; hallway pauses on SchoolScene pause, keeping seek/preference. Existing next-day scene retains calm fades and day card, with only a subtle cue added. Missing optional sound does not gate transitions.

## Central configuration and safety

`public/assets/audio/sfx/manifest.json` records stable keys, runtime paths, original source, metadata, gains and optional playback excerpt duration. `SoundEffects.js` preloads this manifest and owns reusable scene voices, maximum8 concurrent effects, per-key throttles45ms UI/75ms dialogue/60ms other. No random pitch or gameplay RNG. Pauses stop voices; shutdown destroys them. Locked/missing/no-audio/decoder failures drop optional cues without crashing or queuing a burst for unlock. Future events play after unlock. No music objects are stopped by this service.

| Category | Volume multiplier |
| --- | --- |
| ui | 0.22 |
| dialogue | 0.1 |
| footsteps | 0.09 |
| combat | 0.38 |
| status | 0.25 |
| transition | 0.3 |
Actual volume = category multiplier x per-asset gain. Steps alternate3 concrete samples at128 world pixels per step (~320ms at400px/s), far quieter than hits. No effect fires merely because a render frame ran. Most action feedback uses1-2 layers; a normal swing occurs before impact, a critical adds one thud. The footstep table lists alternatives in sequence, not a simultaneous stack.

## UI

| Event | Active SFX | Original source path | Runtime path | Volume | Layered with / sequence | Alternatives | Confidence / notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Menu move | uiMove | 500-game-sound-effects/01_ui_interface/menu_move_48kHz_16bit_0.04s_01_s30.wav | assets/audio/sfx/ui/uiMove.wav | 0.154 | None | sfx_candidates/ui | Category fits; metadata reviewed, listening pending. |
| Menu confirm / select | uiConfirm | 500-game-sound-effects/01_ui_interface/confirm_48kHz_16bit_0.29s_01_s13.wav | assets/audio/sfx/ui/uiConfirm.wav | 0.176 | None | sfx_candidates/ui | Category fits; metadata reviewed, listening pending. |
| Menu cancel / Back | uiCancel | 500-game-sound-effects/01_ui_interface/back_48kHz_16bit_0.06s_01_s13.wav | assets/audio/sfx/ui/uiCancel.wav | 0.176 | None | sfx_candidates/ui | Category fits; metadata reviewed, listening pending. |
| Invalid / insufficient SP | uiInvalid | 500-game-sound-effects/01_ui_interface/error_48kHz_16bit_0.16s_01_s13.wav | assets/audio/sfx/ui/uiInvalid.wav | 0.154 | None | - | Category fits; metadata reviewed, listening pending. |

## Dialogue

| Event | Active SFX | Original source path | Runtime path | Volume | Layered with / sequence | Alternatives | Confidence / notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Open | dialogueOpen | 500-game-sound-effects/01_ui_interface/open_48kHz_16bit_0.15s_01_s13.wav | assets/audio/sfx/dialogue/dialogueOpen.wav | 0.050 | None | - | Category fits; metadata reviewed, listening pending. |
| Typewriter (every third non-space character) | dialogueTick | 500-game-sound-effects/01_ui_interface/select_48kHz_16bit_0.04s_01_s13.wav | assets/audio/sfx/dialogue/dialogueTick.wav | 0.045 | None | sfx_candidates/dialogue | Category fits; metadata reviewed, listening pending. |
| Reveal current line | Silent | - | - | - | None | - | See SFX_MISSING.md for missing Foley / intentional omissions |
| Advance / final confirm | dialogueAdvance | 500-game-sound-effects/01_ui_interface/click_48kHz_16bit_0.09s_03_s16.wav | assets/audio/sfx/dialogue/dialogueAdvance.wav | 0.060 | None | sfx_candidates/dialogue | Category fits; metadata reviewed, listening pending. |

## Transitions

| Event | Active SFX | Original source path | Runtime path | Volume | Layered with / sequence | Alternatives | Confidence / notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Gate encounter | encounter | 500-game-sound-effects/01_ui_interface/alert_48kHz_16bit_0.31s_01_s29.wav | assets/audio/sfx/transition/encounter.wav | 0.195 | None | - | Category fits; metadata reviewed, listening pending. |
| Battle shutter close | wipe | 500-game-sound-effects/04_combat_melee/swosh_48kHz_16bit_0.58s_03_s45.wav | assets/audio/sfx/transition/wipe.wav | 0.180 | None | sfx_candidates/battle_entry | Category fits; metadata reviewed, listening pending. |
| Battle reveal | reveal | 500-game-sound-effects/04_combat_melee/swosh_48kHz_16bit_0.28s_01_s45.wav | assets/audio/sfx/transition/reveal.wav | 0.105 | None | sfx_candidates/battle_entry | Category fits; metadata reviewed, listening pending. |
| Next day | nextDay | 500-game-sound-effects/01_ui_interface/sounds_powerup_48kHz_16bit_0.25s_01_s30.wav | assets/audio/sfx/transition/nextDay.wav | 0.075 | None | sfx_candidates/catch_breath<br>sfx_candidates/results | Category fits; metadata reviewed, listening pending. |

## Exploration

| Event | Active SFX | Original source path | Runtime path | Volume | Layered with / sequence | Alternatives | Confidence / notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Running step (alternates three) | foot1, foot2, foot3 | 500-game-sound-effects/02_footsteps/concrete_48kHz_16bit_0.11s_01_s12.wav<br>500-game-sound-effects/02_footsteps/concrete_48kHz_16bit_0.11s_02_s12.wav<br>500-game-sound-effects/02_footsteps/concrete_48kHz_16bit_0.11s_03_s12.wav | assets/audio/sfx/footsteps/foot1.wav<br>assets/audio/sfx/footsteps/foot2.wav<br>assets/audio/sfx/footsteps/foot3.wav | 0.058, 0.058, 0.058 | Alternating, never layered | - | Category fits; metadata reviewed, listening pending. |
| Gate/door Foley (no door currently opens) | Silent | - | - | - | None | - | See SFX_MISSING.md for missing Foley / intentional omissions |

## Player actions

| Event | Active SFX | Original source path | Runtime path | Volume | Layered with / sequence | Alternatives | Confidence / notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Attack swing | swing | 500-game-sound-effects/04_combat_melee/swing_48kHz_16bit_0.14s_05_s35.wav | assets/audio/sfx/combat/swing.wav | 0.228 | None | sfx_candidates/attack_swing | Category fits; metadata reviewed, listening pending. |
| Attack hit | hit | 500-game-sound-effects/04_combat_melee/punch_48kHz_16bit_0.35s_02_s12.wav | assets/audio/sfx/combat/hit.wav | 0.285 | None | sfx_candidates/normal_hit | Category fits; metadata reviewed, listening pending. |
| Attack miss | reveal | 500-game-sound-effects/04_combat_melee/swosh_48kHz_16bit_0.28s_01_s45.wav | assets/audio/sfx/transition/reveal.wav | 0.105 | None | sfx_candidates/battle_entry | Category fits; metadata reviewed, listening pending. |
| Attack critical | hit, critical | 500-game-sound-effects/04_combat_melee/punch_48kHz_16bit_0.35s_02_s12.wav<br>500-game-sound-effects/10_impacts_materials/heavy_thud_48kHz_16bit_0.51s_01_s12.wav | assets/audio/sfx/combat/hit.wav<br>assets/audio/sfx/combat/critical.wav | 0.285, 0.247 | hit + / then critical | sfx_candidates/normal_hit<br>sfx_candidates/player_backpack_hit | Category fits; metadata reviewed, listening pending. |
| Defend activation | brace | 500-game-sound-effects/03_movement_cloth_gear/movement_jump_landing_48kHz_16bit_0.07s_01_s30.wav | assets/audio/sfx/combat/brace.wav | 0.228 | None | - | Category fits; metadata reviewed, listening pending. |
| Defended hit | block | 500-game-sound-effects/03_movement_cloth_gear/cloth_heavy_48kHz_16bit_0.37s_01_s35.wav | assets/audio/sfx/combat/block.wav | 0.190 | None | - | Category fits; metadata reviewed, listening pending. |
| Bro, Lock In | focused | 500-game-sound-effects/01_ui_interface/power_up_48kHz_16bit_0.61s_01_s11.wav | assets/audio/sfx/status/focused.wav | 0.138 | None | sfx_candidates/status | Category fits; metadata reviewed, listening pending. |
| Talk Smack | smack, riled | 500-game-sound-effects/04_combat_melee/slap_48kHz_16bit_0.48s_01_s27.wav<br>500-game-sound-effects/01_ui_interface/negative_48kHz_16bit_0.31s_01_s18.wav | assets/audio/sfx/combat/smack.wav<br>assets/audio/sfx/status/riled.wav | 0.209, 0.125 | smack + / then riled | sfx_candidates/talk_smack | Provisional: context/dynamics choice; candidate alternatives retained. |
| Look There distraction | distracted | 500-game-sound-effects/01_ui_interface/toggle_48kHz_16bit_0.14s_01_s13.wav | assets/audio/sfx/status/distracted.wav | 0.150 | None | sfx_candidates/status | Category fits; metadata reviewed, listening pending. |
| Look There full success | offGuard | 500-game-sound-effects/01_ui_interface/error_48kHz_16bit_0.53s_02_s13.wav | assets/audio/sfx/status/offGuard.wav | 0.113 | None | - | Provisional: context/dynamics choice; candidate alternatives retained. |
| Backpack swing | heavySwing | 500-game-sound-effects/04_combat_melee/swing_48kHz_16bit_0.57s_02_s37.wav | assets/audio/sfx/combat/heavySwing.wav | 0.247 | None | sfx_candidates/attack_swing | Category fits; metadata reviewed, listening pending. |
| Backpack hit | heavyHit | 500-game-sound-effects/10_impacts_materials/impact_soft_heavy_48kHz_16bit_0.57s_01_s12.wav | assets/audio/sfx/combat/heavyHit.wav | 0.285 | None | - | Category fits; metadata reviewed, listening pending. |
| Backpack miss | heavySwing | 500-game-sound-effects/04_combat_melee/swing_48kHz_16bit_0.57s_02_s37.wav | assets/audio/sfx/combat/heavySwing.wav | 0.247 | None | sfx_candidates/attack_swing | Category fits; metadata reviewed, listening pending. |
| Backpack critical | heavyHit, critical | 500-game-sound-effects/10_impacts_materials/impact_soft_heavy_48kHz_16bit_0.57s_01_s12.wav<br>500-game-sound-effects/10_impacts_materials/heavy_thud_48kHz_16bit_0.51s_01_s12.wav | assets/audio/sfx/combat/heavyHit.wav<br>assets/audio/sfx/combat/critical.wav | 0.285, 0.247 | heavyHit + / then critical | sfx_candidates/player_backpack_hit | Category fits; metadata reviewed, listening pending. |
| Catch Breath | breath, heal | 500-game-sound-effects/09_human_nonverbal/breath_48kHz_16bit_4.27s_01_s27.wav<br>500-game-sound-effects/01_ui_interface/sounds_powerup_48kHz_16bit_0.45s_02_s30.wav | assets/audio/sfx/combat/breath.wav<br>assets/audio/sfx/status/heal.wav | 0.209, 0.138 | breath + / then heal | sfx_candidates/catch_breath<br>sfx_candidates/results | Provisional: context/dynamics choice; candidate alternatives retained. |

## Guard actions

| Event | Active SFX | Original source path | Runtime path | Volume | Layered with / sequence | Alternatives | Confidence / notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Attack swing | swing | 500-game-sound-effects/04_combat_melee/swing_48kHz_16bit_0.14s_05_s35.wav | assets/audio/sfx/combat/swing.wav | 0.228 | None | sfx_candidates/attack_swing | Category fits; metadata reviewed, listening pending. |
| Attack hit | hit | 500-game-sound-effects/04_combat_melee/punch_48kHz_16bit_0.35s_02_s12.wav | assets/audio/sfx/combat/hit.wav | 0.285 | None | sfx_candidates/normal_hit | Category fits; metadata reviewed, listening pending. |
| Attack miss | reveal | 500-game-sound-effects/04_combat_melee/swosh_48kHz_16bit_0.28s_01_s45.wav | assets/audio/sfx/transition/reveal.wav | 0.105 | None | sfx_candidates/battle_entry | Category fits; metadata reviewed, listening pending. |
| Attack critical | hit, critical | 500-game-sound-effects/04_combat_melee/punch_48kHz_16bit_0.35s_02_s12.wav<br>500-game-sound-effects/10_impacts_materials/heavy_thud_48kHz_16bit_0.51s_01_s12.wav | assets/audio/sfx/combat/hit.wav<br>assets/audio/sfx/combat/critical.wav | 0.285, 0.247 | hit + / then critical | sfx_candidates/normal_hit<br>sfx_candidates/player_backpack_hit | Category fits; metadata reviewed, listening pending. |
| Defend activation | brace | 500-game-sound-effects/03_movement_cloth_gear/movement_jump_landing_48kHz_16bit_0.07s_01_s30.wav | assets/audio/sfx/combat/brace.wav | 0.228 | None | - | Category fits; metadata reviewed, listening pending. |
| Defended hit | block | 500-game-sound-effects/03_movement_cloth_gear/cloth_heavy_48kHz_16bit_0.37s_01_s35.wav | assets/audio/sfx/combat/block.wav | 0.190 | None | - | Category fits; metadata reviewed, listening pending. |
| Crack Knuckles | crack, riled | 500-game-sound-effects/10_impacts_materials/crack_48kHz_16bit_1.69s_01_s04.wav<br>500-game-sound-effects/01_ui_interface/negative_48kHz_16bit_0.31s_01_s18.wav | assets/audio/sfx/combat/crack.wav<br>assets/audio/sfx/status/riled.wav | 0.190, 0.125 | crack + / then riled | sfx_candidates/guard_knuckles<br>sfx_candidates/talk_smack | Provisional: context/dynamics choice; candidate alternatives retained. |
| Blow Whistle | whistle | 500-game-sound-effects/09_human_nonverbal/attention_whistle_48kHz_16bit_0.68s_01_s27.wav | assets/audio/sfx/combat/whistle.wav | 0.190 | None | - | Category fits; metadata reviewed, listening pending. |
| Whistle stun proc | stun | 500-game-sound-effects/01_ui_interface/alert_48kHz_16bit_0.3s_02_s29.wav | assets/audio/sfx/status/stun.wav | 0.150 | None | - | Category fits; metadata reviewed, listening pending. |
| Call Wife buttons | phoneButton | 500-game-sound-effects/17_machinery_technology/switch_48kHz_16bit_0.22s_01_s48.wav | assets/audio/sfx/combat/phoneButton.wav | 0.190 | None | sfx_candidates/phone_buttons | Provisional: context/dynamics choice; candidate alternatives retained. |
| Call Wife Focused | focused | 500-game-sound-effects/01_ui_interface/power_up_48kHz_16bit_0.61s_01_s11.wav | assets/audio/sfx/status/focused.wav | 0.138 | None | sfx_candidates/status | Category fits; metadata reviewed, listening pending. |
| Call Wife ring | Silent | - | - | - | None | - | See SFX_MISSING.md for missing Foley / intentional omissions |
| Eat Donut bite/chew | Silent | - | - | - | None | - | See SFX_MISSING.md for missing Foley / intentional omissions |
| Eat Donut healing | heal | 500-game-sound-effects/01_ui_interface/sounds_powerup_48kHz_16bit_0.45s_02_s30.wav | assets/audio/sfx/status/heal.wav | 0.138 | None | sfx_candidates/catch_breath<br>sfx_candidates/results | Category fits; metadata reviewed, listening pending. |
| Stumble missed swing | reveal | 500-game-sound-effects/04_combat_melee/swosh_48kHz_16bit_0.28s_01_s45.wav | assets/audio/sfx/transition/reveal.wav | 0.105 | None | sfx_candidates/battle_entry | Category fits; metadata reviewed, listening pending. |
| Stumble fall | fall | 500-game-sound-effects/03_movement_cloth_gear/jump_land_48kHz_16bit_0.41s_01_s21.wav | assets/audio/sfx/combat/fall.wav | 0.247 | None | sfx_candidates/guard_stumble | Category fits; metadata reviewed, listening pending. |
| Stumble get-up (only if alive) | getUp | 500-game-sound-effects/03_movement_cloth_gear/cloth_48kHz_16bit_1.55s_01_s26.wav | assets/audio/sfx/combat/getUp.wav | 0.114 | None | sfx_candidates/guard_stumble | Provisional: context/dynamics choice; candidate alternatives retained. |

## Damage

| Event | Active SFX | Original source path | Runtime path | Volume | Layered with / sequence | Alternatives | Confidence / notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Light hurt / physical impact | hit | 500-game-sound-effects/04_combat_melee/punch_48kHz_16bit_0.35s_02_s12.wav | assets/audio/sfx/combat/hit.wav | 0.285 | None | sfx_candidates/normal_hit | Category fits; metadata reviewed, listening pending. |
| Heavy hurt / Backpack | heavyHit | 500-game-sound-effects/10_impacts_materials/impact_soft_heavy_48kHz_16bit_0.57s_01_s12.wav | assets/audio/sfx/combat/heavyHit.wav | 0.285 | None | - | Category fits; metadata reviewed, listening pending. |
| Critical impact layer | critical | 500-game-sound-effects/10_impacts_materials/heavy_thud_48kHz_16bit_0.51s_01_s12.wav | assets/audio/sfx/combat/critical.wav | 0.247 | None | sfx_candidates/player_backpack_hit | Category fits; metadata reviewed, listening pending. |
| Guard stumble self-damage | fall | 500-game-sound-effects/03_movement_cloth_gear/jump_land_48kHz_16bit_0.41s_01_s21.wav | assets/audio/sfx/combat/fall.wav | 0.247 | None | sfx_candidates/guard_stumble | Category fits; metadata reviewed, listening pending. |

## Status

| Event | Active SFX | Original source path | Runtime path | Volume | Layered with / sequence | Alternatives | Confidence / notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FOCUSED | focused | 500-game-sound-effects/01_ui_interface/power_up_48kHz_16bit_0.61s_01_s11.wav | assets/audio/sfx/status/focused.wav | 0.138 | None | sfx_candidates/status | Category fits; metadata reviewed, listening pending. |
| DISTRACTED | distracted | 500-game-sound-effects/01_ui_interface/toggle_48kHz_16bit_0.14s_01_s13.wav | assets/audio/sfx/status/distracted.wav | 0.150 | None | sfx_candidates/status | Category fits; metadata reviewed, listening pending. |
| RILED | riled | 500-game-sound-effects/01_ui_interface/negative_48kHz_16bit_0.31s_01_s18.wav | assets/audio/sfx/status/riled.wav | 0.125 | None | sfx_candidates/talk_smack | Provisional: context/dynamics choice; candidate alternatives retained. |
| STUN | stun | 500-game-sound-effects/01_ui_interface/alert_48kHz_16bit_0.3s_02_s29.wav | assets/audio/sfx/status/stun.wav | 0.150 | None | - | Category fits; metadata reviewed, listening pending. |
| OFF GUARD | offGuard | 500-game-sound-effects/01_ui_interface/error_48kHz_16bit_0.53s_02_s13.wav | assets/audio/sfx/status/offGuard.wav | 0.113 | None | - | Provisional: context/dynamics choice; candidate alternatives retained. |

## Results

| Event | Active SFX | Original source path | Runtime path | Volume | Layered with / sequence | Alternatives | Confidence / notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Player victory / escape | victory | 500-game-sound-effects/01_ui_interface/victory_48kHz_16bit_2.4s_02_s29.wav | assets/audio/sfx/transition/victory.wav | 0.120 | None | sfx_candidates/results | Category fits; metadata reviewed, listening pending. |
| Player defeat | defeat | 500-game-sound-effects/01_ui_interface/game_over_48kHz_16bit_2.4s_01_s29.wav | assets/audio/sfx/transition/defeat.wav | 0.120 | None | - | Category fits; metadata reviewed, listening pending. |
| Guard defeat extra impact | Silent | - | - | - | None | - | See SFX_MISSING.md for missing Foley / intentional omissions |

## Active sample details

| ID | Duration s | Peak | RMS | Playback excerpt max s | Category |
| --- | --- | --- | --- | --- | --- |
| uiMove | 0.039 | 0.479 | 0.109 | Full | ui |
| uiConfirm | 0.290 | 0.890 | 0.269 | Full | ui |
| uiCancel | 0.064 | 0.892 | 0.071 | Full | ui |
| uiInvalid | 0.165 | 0.836 | 0.105 | Full | ui |
| dialogueTick | 0.043 | 0.873 | 0.117 | Full | dialogue |
| dialogueAdvance | 0.094 | 0.851 | 0.062 | Full | dialogue |
| dialogueOpen | 0.148 | 0.586 | 0.165 | Full | dialogue |
| encounter | 0.314 | 0.162 | 0.045 | Full | transition |
| wipe | 0.576 | 0.950 | 0.094 | Full | transition |
| reveal | 0.277 | 0.950 | 0.125 | Full | transition |
| nextDay | 0.254 | 0.627 | 0.263 | Full | transition |
| swing | 0.138 | 0.950 | 0.143 | Full | combat |
| heavySwing | 0.575 | 0.950 | 0.098 | Full | combat |
| hit | 0.348 | 0.878 | 0.154 | Full | combat |
| heavyHit | 0.572 | 0.904 | 0.138 | Full | combat |
| critical | 0.505 | 0.900 | 0.137 | Full | combat |
| block | 0.371 | 0.950 | 0.110 | Full | combat |
| brace | 0.072 | 0.066 | 0.018 | Full | combat |
| focused | 0.610 | 0.914 | 0.198 | Full | status |
| riled | 0.313 | 0.501 | 0.164 | Full | status |
| distracted | 0.139 | 0.898 | 0.192 | Full | status |
| offGuard | 0.533 | 0.925 | 0.100 | Full | status |
| stun | 0.302 | 0.470 | 0.093 | Full | status |
| smack | 0.480 | 0.950 | 0.096 | Full | combat |
| heal | 0.448 | 0.657 | 0.266 | Full | status |
| breath | 4.268 | 0.204 | 0.020 | 1 | combat |
| crack | 1.691 | 0.948 | 0.070 | 0.6 | combat |
| whistle | 0.683 | 0.575 | 0.131 | Full | combat |
| phoneButton | 0.219 | 0.950 | 0.046 | Full | combat |
| fall | 0.408 | 0.950 | 0.107 | Full | combat |
| getUp | 1.554 | 0.461 | 0.058 | 0.45 | combat |
| victory | 2.400 | 0.950 | 0.216 | 1.6 | transition |
| defeat | 2.400 | 0.300 | 0.031 | 1.6 | transition |
| foot1 | 0.106 | 0.627 | 0.063 | Full | footsteps |
| foot2 | 0.108 | 0.505 | 0.049 | Full | footsteps |
| foot3 | 0.113 | 0.539 | 0.045 | Full | footsteps |

Breath, crack and cloth excerpts start at0 with the marker limit shown; result jingles are limited to1.6s to fit the existing1.8s outcome hold. Files remain byte-identical; no destructive audio editing. A real attention whistle is active. Switch click is only a phone-button stand-in, not a claimed ring; no eating substitute is forced.

## Candidates and future source pool

- `sfx_candidates/ui/`: README identifies ACTIVE sources; 5 alternative files.
- `sfx_candidates/dialogue/`: README identifies ACTIVE sources; 3 alternative files.
- `sfx_candidates/battle_entry/`: README identifies ACTIVE sources; 1 alternative files.
- `sfx_candidates/player_backpack_hit/`: README identifies ACTIVE sources; 1 alternative files.
- `sfx_candidates/normal_hit/`: README identifies ACTIVE sources; 2 alternative files.
- `sfx_candidates/attack_swing/`: README identifies ACTIVE sources; 2 alternative files.
- `sfx_candidates/guard_stumble/`: README identifies ACTIVE sources; 3 alternative files.
- `sfx_candidates/talk_smack/`: README identifies ACTIVE sources; 1 alternative files.
- `sfx_candidates/catch_breath/`: README identifies ACTIVE sources; 1 alternative files.
- `sfx_candidates/status/`: README identifies ACTIVE sources; 3 alternative files.
- `sfx_candidates/guard_knuckles/`: README identifies ACTIVE sources; 2 alternative files.
- `sfx_candidates/phone_buttons/`: README identifies ACTIVE sources; 1 alternative files.
- `sfx_candidates/results/`: README identifies ACTIVE sources; 3 alternative files.

Some candidate directories contain only an ACTIVE README if no other reasonable source existed. All source filenames remain unchanged. Future school/item Foley retained: 03_movement_cloth_gear/bag_zipper_48kHz_16bit_6.98s_01_s27.wav, 09_human_nonverbal/drink_sip_and_swallow_48kHz_16bit_2.54s_01_s27.wav, 11_doors_locks/door_close_48kHz_16bit_0.46s_03_s41.wav, 11_doors_locks/door_close_48kHz_16bit_0.59s_02_s41.wav, 11_doors_locks/door_close_48kHz_16bit_0.92s_01_s41.wav, 11_doors_locks/door_open_48kHz_16bit_0.6s_02_s41.wav, 11_doors_locks/door_open_48kHz_16bit_0.72s_01_s41.wav, 11_doors_locks/door_open_48kHz_16bit_1s_03_s41.wav, 11_doors_locks/keys_48kHz_16bit_0.33s_01_s50.wav, 11_doors_locks/latch_48kHz_16bit_0.26s_01_s14.wav, 12_items_inventory/coin_flip_48kHz_16bit_0.35s_01_s32.wav, 13_paper_books/book_close_48kHz_16bit_0.23s_01_s14.wav, 13_paper_books/book_flip_48kHz_16bit_0.23s_02_s14.wav, 13_paper_books/book_flip_48kHz_16bit_0.43s_01_s14.wav, 13_paper_books/book_open_48kHz_16bit_0.15s_01_s14.wav, 13_paper_books/book_page_48kHz_16bit_0.73s_02_s32.wav, 13_paper_books/book_page_48kHz_16bit_1.49s_01_s32.wav, 13_paper_books/page_turn_48kHz_16bit_0.59s_01_s27.wav.

## Cleanup

The deletion manifest was generated before cleanup: `tools/sfx-deletion-manifest.json`. The cleanup validates every absolute path stays inside the resolved500-game-sound-effects root, is a WAV, matches its pre-deletion hash and is not retained; it completes all validations before any nonrecursive Remove-Item calls. README/LICENSES are preserved in source and copied to runtime for distribution. Active/candidate copies are secured before cleanup.

| Deleted source path | Reason |
| --- | --- |
| 500-game-sound-effects/01_ui_interface/click_48kHz_16bit_0.28s_02_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/01_ui_interface/close_48kHz_16bit_0.15s_01_s13.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/01_ui_interface/cursor_rollover_48kHz_16bit_0.2s_01_s01.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/01_ui_interface/hover_48kHz_16bit_0.06s_02_s16.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/01_ui_interface/hover_48kHz_16bit_0.23s_01_s16.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/01_ui_interface/load_48kHz_16bit_1.72s_01_s18.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/01_ui_interface/menu_select_48kHz_16bit_0.31s_02_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/01_ui_interface/menu_select_48kHz_16bit_0.35s_01_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/01_ui_interface/menu_select_48kHz_16bit_0.73s_03_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/01_ui_interface/positive_48kHz_16bit_1.72s_01_s18.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/01_ui_interface/save_48kHz_16bit_3.43s_01_s18.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/01_ui_interface/window_open_48kHz_16bit_1.47s_01_s01.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/boots_leather_step_48kHz_16bit_0.43s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/carpet_48kHz_16bit_0.14s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/carpet_48kHz_16bit_0.14s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/carpet_48kHz_16bit_0.14s_03_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/concrete_48kHz_16bit_0.11s_04_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/footstep_48kHz_16bit_0.24s_02_s14.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/footstep_48kHz_16bit_0.25s_01_s14.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/footstep_48kHz_16bit_0.27s_03_s14.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/gassy_footstep_48kHz_16bit_0.57s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/grass_48kHz_16bit_0.67s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/grass_48kHz_16bit_0.67s_04_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/grass_48kHz_16bit_0.69s_03_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/grass_48kHz_16bit_0.78s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/grassy_footstep_48kHz_16bit_0.41s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/grassy_footstep_48kHz_16bit_0.5s_02_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/grassy_footstep_48kHz_16bit_0.5s_03_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/gravel_48kHz_16bit_0.7s_01_s31.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/hard_footstep_48kHz_16bit_0.49s_02_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/hard_footstep_48kHz_16bit_0.58s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/hard_footstep_48kHz_16bit_0.58s_03_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/leaves_48kHz_16bit_0.39s_01_s31.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/leaves_48kHz_16bit_0.47s_02_s31.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/movement_footsteps_48kHz_16bit_0.05s_01_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/movement_footstepsa_48kHz_16bit_0.05s_01_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/movement_footstepsb_48kHz_16bit_0.05s_01_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/movement_footstepsloop_fast_loop_48kHz_16bit_0.32s_01_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/movement_footstepsloop_fast_loop_48kHz_16bit_0.36s_02_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/movement_footstepsloop_slow_loop_48kHz_16bit_0.46s_01_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/movement_footstepsloop_slow_loop_48kHz_16bit_0.49s_02_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/mud_48kHz_16bit_0.26s_01_s31.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/mud_steps_48kHz_16bit_1.02s_03_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/mud_steps_48kHz_16bit_1.03s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/mud_steps_48kHz_16bit_1.19s_02_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/s_walking_on_snow_covered_gravel_48kHz_16bit_0.48s_01_s02.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/s_walking_on_snow_covered_gravel_48kHz_16bit_0.65s_03_s02.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/s_walking_on_snow_covered_gravel_48kHz_16bit_0.69s_02_s02.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/s_walking_on_snow_covered_gravel_and_ice_48kHz_16bit_0.44s_01_s02.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/s_walking_on_snow_covered_gravel_and_ice_48kHz_16bit_0.63s_02_s02.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/s_walking_on_snow_covered_gravel_and_ice_48kHz_16bit_0.64s_03_s02.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/sand_48kHz_16bit_0.32s_02_s03.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/sand_48kHz_16bit_0.3s_03_s03.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/sand_48kHz_16bit_0.41s_04_s03.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/sand_48kHz_16bit_0.44s_01_s03.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/snow_48kHz_16bit_0.37s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/snow_48kHz_16bit_0.37s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/snow_48kHz_16bit_0.37s_03_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/snow_48kHz_16bit_0.37s_04_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/soil_steps_48kHz_16bit_1.09s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/stone_48kHz_16bit_0.29s_01_s31.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/wood_48kHz_16bit_0.25s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/wood_48kHz_16bit_0.25s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/wood_48kHz_16bit_0.25s_03_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/02_footsteps/wood_48kHz_16bit_0.25s_04_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/armor_48kHz_16bit_0.45s_01_s35.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/blanket_movement_48kHz_16bit_2.04s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/blanket_movement_48kHz_16bit_2.17s_03_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/blanket_movement_48kHz_16bit_3.16s_02_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/chainmail_48kHz_16bit_0.51s_01_s35.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/chainmail_48kHz_16bit_0.54s_02_s35.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/movement_jump_48kHz_16bit_0.16s_02_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/movement_jump_48kHz_16bit_0.16s_03_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/movement_jump_48kHz_16bit_0.39s_01_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/movement_jump_landing_48kHz_16bit_0.08s_02_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/movement_jump_landing_48kHz_16bit_0.1s_03_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/velcro_48kHz_16bit_0.64s_03_s26.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/velcro_48kHz_16bit_0.82s_02_s26.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/03_movement_cloth_gear/velcro_48kHz_16bit_1.04s_01_s26.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/04_combat_melee/handsaw_knife_scrape_48kHz_16bit_0.46s_02_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/04_combat_melee/handsaw_knife_scrape_48kHz_16bit_0.75s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/04_combat_melee/metal_knife_scrape_48kHz_16bit_1.19s_03_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/04_combat_melee/metal_knife_scrape_48kHz_16bit_1.77s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/04_combat_melee/metal_knife_scrape_48kHz_16bit_1.9s_02_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/04_combat_melee/punch_heavy_48kHz_16bit_0.65s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/04_combat_melee/swing_48kHz_16bit_0.32s_01_s37.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/04_combat_melee/swing_48kHz_16bit_0.36s_03_s37.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/04_combat_melee/tin_whistle_whoosh_48kHz_16bit_0.37s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/04_combat_melee/wpn_punch_48kHz_16bit_0.1s_01_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/04_combat_melee/wpn_punch_48kHz_16bit_0.1s_02_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/04_combat_melee/wpn_punch_48kHz_16bit_0.1s_03_s30.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/05_combat_ranged/arrow_feathers_48kHz_16bit_0.53s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/05_combat_ranged/arrow_grab_from_quiver_48kHz_16bit_0.62s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/05_combat_ranged/arrow_grab_from_quiver_48kHz_16bit_1.23s_02_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/05_combat_ranged/arrow_return_to_quiver_48kHz_16bit_0.52s_02_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/05_combat_ranged/arrow_return_to_quiver_48kHz_16bit_0.73s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/freeze_48kHz_16bit_2.04s_01_s33.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/magic_48kHz_16bit_0.7s_07_s35.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/magic_48kHz_16bit_1.11s_06_s09.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/magic_48kHz_16bit_1.38s_02_s09.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/magic_48kHz_16bit_1.44s_05_s09.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/magic_48kHz_16bit_1.61s_01_s09.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/magic_48kHz_16bit_1.82s_03_s09.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/magic_48kHz_16bit_1.91s_04_s09.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/magic_48kHz_16bit_2.4s_09_s29.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/magic_48kHz_16bit_2.67s_08_s29.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/spell_48kHz_16bit_0.53s_03_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/spell_48kHz_16bit_0.63s_02_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/spell_48kHz_16bit_2.83s_01_s35.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/teleport_48kHz_16bit_0.32s_02_s54.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/teleport_48kHz_16bit_1.62s_01_s25.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/07_magic_spells/teleport_48kHz_16bit_1.74s_03_s54.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/08_creatures_monsters/creature_death_48kHz_16bit_1.06s_01_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/08_creatures_monsters/creature_hurt_48kHz_16bit_0.47s_04_s57.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/08_creatures_monsters/creature_hurt_48kHz_16bit_0.49s_03_s57.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/08_creatures_monsters/creature_hurt_48kHz_16bit_0.52s_01_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/08_creatures_monsters/creature_hurt_48kHz_16bit_0.54s_02_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/09_human_nonverbal/clap_48kHz_16bit_2.68s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/09_human_nonverbal/cough_48kHz_16bit_0.89s_03_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/09_human_nonverbal/cough_48kHz_16bit_1.07s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/09_human_nonverbal/cough_48kHz_16bit_1.38s_02_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/09_human_nonverbal/freakedbreath_48kHz_16bit_1.24s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/09_human_nonverbal/gasp_48kHz_16bit_5.2s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/09_human_nonverbal/heartbeat_48kHz_16bit_1.48s_01_s38.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/09_human_nonverbal/laugh_48kHz_16bit_1.14s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/09_human_nonverbal/scream_48kHz_16bit_0.28s_02_s29.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/09_human_nonverbal/scream_48kHz_16bit_0.3s_01_s29.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/09_human_nonverbal/scream_48kHz_16bit_1.72s_03_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/09_human_nonverbal/shh_48kHz_16bit_0.55s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/09_human_nonverbal/sniff_48kHz_16bit_1.01s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/chop_48kHz_16bit_0.24s_01_s14.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/glass_48kHz_16bit_0.21s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/glass_48kHz_16bit_0.21s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/glass_heavy_48kHz_16bit_0.24s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/glass_heavy_48kHz_16bit_0.43s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_bell_heavy_48kHz_16bit_0.7s_03_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_bell_heavy_48kHz_16bit_1.48s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_bell_heavy_48kHz_16bit_1.74s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_generic_light_48kHz_16bit_0.12s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_generic_light_48kHz_16bit_0.14s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_generic_light_48kHz_16bit_0.14s_03_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_glass_heavy_48kHz_16bit_0.25s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_glass_light_48kHz_16bit_0.21s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_glass_medium_48kHz_16bit_0.54s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_glass_medium_48kHz_16bit_0.54s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_glass_medium_48kHz_16bit_0.54s_03_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_meat_48kHz_16bit_0.5s_01_s44.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_meat_48kHz_16bit_0.5s_02_s44.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_metal_48kHz_16bit_0.48s_01_s44.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_metal_light_48kHz_16bit_0.24s_03_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_metal_light_48kHz_16bit_0.25s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_metal_light_48kHz_16bit_0.35s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_metal_medium_48kHz_16bit_0.12s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_mining_48kHz_16bit_0.81s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_mining_48kHz_16bit_0.87s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_mining_48kHz_16bit_0.8s_03_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_plank_medium_48kHz_16bit_0.55s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_plank_medium_48kHz_16bit_0.55s_03_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_plank_medium_48kHz_16bit_0.5s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impact_wood_48kHz_16bit_0.45s_01_s44.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impactwood_48kHz_16bit_1.85s_02_s04.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impactwood_48kHz_16bit_2.2s_01_s04.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/impactwood_48kHz_16bit_2.8s_03_s04.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/metal_48kHz_16bit_0.14s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/metal_48kHz_16bit_0.27s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/metal_fork_scrape_48kHz_16bit_0.87s_02_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/metal_fork_scrape_48kHz_16bit_1.2s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/metal_heavy_48kHz_16bit_0.12s_03_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/metal_heavy_48kHz_16bit_0.17s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/metal_heavy_48kHz_16bit_0.36s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/stone_48kHz_16bit_0.54s_02_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/stone_48kHz_16bit_0.5s_01_s44.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/vial_glass_close_48kHz_16bit_0.48s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/vial_glass_open_48kHz_16bit_0.32s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/vial_glass_uncork_48kHz_16bit_0.43s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/wood_48kHz_16bit_0.22s_05_s29.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/wood_48kHz_16bit_0.24s_04_s29.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/wood_48kHz_16bit_0.25s_06_s29.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/wood_48kHz_16bit_0.33s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/wood_48kHz_16bit_0.33s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/wood_48kHz_16bit_0.33s_03_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/wood_bowl_spoon_48kHz_16bit_0.42s_03_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/wood_bowl_spoon_48kHz_16bit_0.54s_02_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/wood_bowl_spoon_48kHz_16bit_0.75s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/wood_break_48kHz_16bit_0.4s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/10_impacts_materials/wood_break_48kHz_16bit_0.76s_02_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/creak_48kHz_16bit_0.34s_03_s14.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/creak_48kHz_16bit_0.65s_01_s14.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/creak_48kHz_16bit_0.83s_02_s14.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/door_48kHz_16bit_0.56s_03_s07.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/door_48kHz_16bit_0.81s_01_s35.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/door_48kHz_16bit_0.83s_02_s07.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/floor_creak_48kHz_16bit_0.64s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/key_lock_door_48kHz_16bit_0.91s_03_s26.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/key_lock_door_48kHz_16bit_0.95s_02_s26.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/key_lock_door_48kHz_16bit_2.39s_01_s26.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/keyhole_lockbox_insert_48kHz_16bit_0.86s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/keyhole_lockbox_remove_48kHz_16bit_0.75s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/keyhole_lockbox_turn_48kHz_16bit_0.92s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/lock_48kHz_16bit_0.28s_02_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/lock_48kHz_16bit_0.37s_01_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/11_doors_locks/unlock_48kHz_16bit_0.74s_01_s50.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/bottle_48kHz_16bit_0.43s_01_s35.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/bottle_clay_uncork_48kHz_16bit_0.33s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/bottle_cork_48kHz_16bit_0.49s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/bottle_glass_cork_twist_48kHz_16bit_0.62s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/bottle_pills_shake_48kHz_16bit_0.27s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/bottle_pills_shake_48kHz_16bit_0.27s_02_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/bottle_plastic_lid_screw_48kHz_16bit_1.09s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/bottle_plastic_lid_unscrew_48kHz_16bit_1.24s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/bottle_uncork_48kHz_16bit_0.48s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/coin_48kHz_16bit_0.3s_05_s35.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/coin_48kHz_16bit_0.48s_03_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/coin_48kHz_16bit_0.4s_01_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/coin_48kHz_16bit_0.61s_02_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/coin_48kHz_16bit_0.6s_06_s35.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/coin_48kHz_16bit_0.97s_04_s35.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/coin_spin_fall_48kHz_16bit_1.43s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/coins_shake_48kHz_16bit_1.06s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/gem_48kHz_16bit_0.17s_02_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/gem_48kHz_16bit_0.25s_01_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/item_48kHz_16bit_0.34s_03_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/item_48kHz_16bit_0.41s_01_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/item_48kHz_16bit_0.44s_02_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/item_gem_48kHz_16bit_0.24s_01_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/item_stone_48kHz_16bit_0.28s_02_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/item_stone_48kHz_16bit_0.39s_03_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/item_stone_48kHz_16bit_0.66s_01_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/item_wood_48kHz_16bit_0.26s_02_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/item_wood_48kHz_16bit_0.49s_01_s56.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/money_48kHz_16bit_0.24s_02_s26.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/money_48kHz_16bit_0.62s_03_s26.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/12_items_inventory/money_48kHz_16bit_0.78s_01_s26.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/13_paper_books/cover_paper_tear_48kHz_16bit_1.15s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/13_paper_books/cover_paper_tear_48kHz_16bit_1.38s_02_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/13_paper_books/crumples_48kHz_16bit_1.78s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/13_paper_books/crumples_48kHz_16bit_2.19s_02_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/13_paper_books/page_flip_48kHz_16bit_0.73s_01_s14.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/13_paper_books/pageturn_48kHz_16bit_1.81s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/13_paper_books/paper_sketchbook_page_flips_48kHz_16bit_7.22s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/bubble_48kHz_16bit_0.55s_01_s53.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/bubbles_48kHz_16bit_0.32s_02_s53.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/bubbles_48kHz_16bit_0.6s_01_s53.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/impactsplat_48kHz_16bit_0.76s_04_s06.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/impactsplat_48kHz_16bit_0.83s_03_s06.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/impactsplat_48kHz_16bit_0.97s_01_s06.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/impactsplat_48kHz_16bit_1.01s_02_s06.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/impactsplat_48kHz_16bit_1.78s_05_s06.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/impactsplat_48kHz_16bit_1s_06_s06.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/loop_bubbles_loop_48kHz_16bit_4.41s_02_s53.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/loop_bubbles_loop_48kHz_16bit_7.33s_01_s53.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/loop_water_loop_48kHz_16bit_3.38s_04_s53.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/loop_water_loop_48kHz_16bit_6.37s_01_s49.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/loop_water_loop_48kHz_16bit_8.73s_02_s49.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/loop_water_loop_48kHz_16bit_9.71s_03_s49.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/mud_48kHz_16bit_0.31s_03_s51.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/mud_48kHz_16bit_0.44s_01_s51.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/mud_48kHz_16bit_0.68s_02_s51.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/splash_48kHz_16bit_0.63s_03_s53.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/splash_48kHz_16bit_0.72s_02_s53.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/splash_48kHz_16bit_1.24s_01_s53.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/water_boiling_loop_48kHz_16bit_4.49s_01_s52.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/water_drop_48kHz_16bit_0.35s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/water_drop_48kHz_16bit_0.39s_02_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/water_drop_48kHz_16bit_0.59s_03_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/water_flowing_loop_48kHz_16bit_1.88s_01_s52.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/water_pour_48kHz_16bit_1.59s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/14_water_mud_slime/water_vial_fill_48kHz_16bit_2.12s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/birds_48kHz_16bit_30.69s_02_s39.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/birds_48kHz_16bit_3s_01_s58.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/cicada_48kHz_16bit_7.38s_01_s17.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/cricket_48kHz_16bit_13.71s_01_s17.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/cricket_48kHz_16bit_13.71s_02_s17.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/crickets_48kHz_16bit_5.14s_02_s17.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/crickets_48kHz_16bit_82.52s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/fire_loop_48kHz_16bit_29.26s_01_s28.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/leaves_48kHz_16bit_0.85s_02_s40.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/leaves_48kHz_16bit_1.58s_01_s40.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/power_drain_48kHz_16bit_3s_01_s42.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/rain_loop_48kHz_16bit_3.99s_02_s52.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/rain_loop_48kHz_16bit_6.83s_01_s53.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/raven_48kHz_16bit_2.06s_02_s29.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/raven_48kHz_16bit_9.79s_01_s29.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/rustle_48kHz_16bit_2.33s_01_s40.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/thunder_48kHz_16bit_5.26s_01_s49.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/wind_48kHz_16bit_60s_01_s20.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/wind_48kHz_16bit_60s_02_s20.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/15_nature_weather/wind_48kHz_16bit_60s_03_s20.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/16_ambiences/ambience_48kHz_16bit_1.69s_02_s23.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/16_ambiences/ambience_48kHz_16bit_1.81s_01_s23.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/16_ambiences/atmoseerie_48kHz_16bit_20.01s_01_s05.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/16_ambiences/atmoseerie_48kHz_16bit_20.01s_02_s05.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/16_ambiences/atmosphere_48kHz_16bit_4.63s_01_s23.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/16_ambiences/desert_48kHz_16bit_35.81s_01_s29.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/16_ambiences/dungeon_loop_48kHz_16bit_94.31s_01_s08.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/16_ambiences/forest_48kHz_16bit_30s_01_s29.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/17_machinery_technology/alarm_loop_48kHz_16bit_1.98s_01_s52.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/17_machinery_technology/bleepingcomputer_48kHz_16bit_8s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/17_machinery_technology/computer_48kHz_16bit_5s_01_s15.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/17_machinery_technology/computer_noise_48kHz_16bit_5s_01_s15.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/17_machinery_technology/computer_noise_48kHz_16bit_5s_02_s15.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/17_machinery_technology/computer_pack_away_48kHz_16bit_10.31s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/17_machinery_technology/computersaysno_48kHz_16bit_8.01s_01_s27.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/18_sci_fi_energy/force_field_48kHz_16bit_0.94s_01_s15.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/18_sci_fi_energy/force_field_48kHz_16bit_0.94s_02_s15.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/18_sci_fi_energy/zap_48kHz_16bit_0.97s_01_s11.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/20_tools_household/camera_48kHz_16bit_0.37s_02_s26.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/20_tools_household/camera_48kHz_16bit_0.47s_01_s26.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/20_tools_household/camera_48kHz_16bit_1.9s_03_s26.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/20_tools_household/handsaw_sawing_wood_48kHz_16bit_6.37s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/20_tools_household/impact_plate_heavy_48kHz_16bit_0.35s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/20_tools_household/impact_plate_heavy_48kHz_16bit_0.49s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/20_tools_household/impact_plate_heavy_48kHz_16bit_0.49s_03_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/20_tools_household/impact_plate_light_48kHz_16bit_0.54s_01_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/20_tools_household/impact_plate_light_48kHz_16bit_0.65s_02_s12.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/20_tools_household/metal_hammer_hit_48kHz_16bit_1.47s_02_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/20_tools_household/metal_hammer_hit_48kHz_16bit_1.62s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |
| 500-game-sound-effects/20_tools_household/scissors_close_48kHz_16bit_0.18s_01_s32.wav | Unused after palette selection; not active, a candidate, or a retained school/item future-use sound. |

## Validation and remaining manual checks

See `tools/presentation-audio-tests.txt`, syntax/build/integrity reports. Deterministic tests cover typewriter/reveal-only input, debounce, blink/portraits, transition timing and cancellation, audio assets/keys/volume categories, menu callbacks, resolved feedback/Whistle stun, recovery/stumble/result-once, distance footsteps, bounded voice cleanup and nonmutation of combat traces. Existing music/readiness/Whistle tests remain.

Manual browser/audio review remains: listen to active samples and compare candidates; tune relative mix after listening; assess crack/breath/cloth excerpts; inspect portrait/text wrapping, repeated entry/reveal, missing assets and autoplay unlock; verify footsteps under actual movement and repeated battles with musician hallway-off preference. Browser appearance/audio audition is not claimed. Missing phone ring and bite/chew are documented in `docs/SFX_MISSING.md`.
