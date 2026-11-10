# Battle interface polish

This pass follows the final UI-only scope in the request. Dialogue redesign, transitions and SFX selection/integration were not part of these changes. Combat, AI, readiness, day progression, audio, scene flow and animations remain unchanged.

## Header and layout

The primary header is now **SCHOOL GUARD**, with **DAY N / READINESS** below it. Redundant actor-name labels above the battlefield were removed; bottom status panels retain their actor names. P/F2 controls remain in the upper corners, smaller and muted. F2 still owns technical details.

The existing middle panel stays at (24,402), 976x90 in the 1024x768 logical layout. It now contains an action title, compact mechanic tags, a short description, resource/status details and a separate Player priority helper. This avoids adding new panels.

When selecting commands, it shows the highlighted command. During resolution or with no selection, it shows recent combat commentary, with the existing combat log as a fallback. Immediate mechanical commentary retains its existing presentation timing and overlay; its latest message also remains in the underlying panel. Returning to Player control restores the action description. No Guard choice or priority is added to the gameplay panel.

## Command descriptions

| Command | Description | Additional information |
| --- | --- | --- |
| ATTACK | Throw a reliable physical punch. | Base DMG, current accuracy after Player status modifiers, cost, SLOW. |
| DEFEND | Brace for this round. Damage down, evasion up, recover SP. | Damage down / +5pp evasion / +10 SP; capped SP preview; FAST. |
| SKILLS | Open your status, distraction, heavy attack and healing commands. | Opens the existing five-skill submenu. |
| BRO, LOCK IN | Focus yourself for better accuracy, critical hits and protection. | FOCUSED: accuracy up / crit up / defense up; cost and NORMAL. |
| TALK SMACK | Deal fixed emotional damage and rile up the Guard. Cannot miss or crit. | 30 FIXED DMG / ALWAYS HIT; RILED benefits and drawbacks; cost and NORMAL. |
| LOOK THERE! | Distract the Guard, with a chance to leave him off guard. | 25% OFF GUARD: pending action lost plus next skip; otherwise DISTRACTED: accuracy/defense down; cost and NORMAL. |
| SWING BACKPACK | Swing your backpack for a heavy but less accurate physical hit. | 140 DMG / current accuracy / 20 SP / SLOW. |
| CATCH BREATH | Spend SP to recover HP. No protection or SP recovery. | +150 HP / 30 SP / FAST; capped HP and SP preview if legal. |
| BACK | Return to ATTACK, DEFEND and SKILLS. | No extra nesting. |

Mechanic tags read action damage, accuracy, cost and priority from shared definitions/actor state wherever exposed. Healing and evasion use shared combat constants. Fixed Talk Smack damage and Defend SP restoration are explanatory values because those effects are currently internal combat literals; this pass does not modify the combat module to export them. DMG tags describe base action damage, not a prediction of damage through the Guard's defenses.

Priority appears both as a command tag and **YOUR ACTION: FAST/NORMAL/SLOW**, with **FAST > NORMAL > SLOW** beneath it. This reveals only Player timing.

## Status and resource panels

Both bottom panels retain prominent current/max HP and SP. Bars are uniformly 284 pixels wide, with separate aligned value lines and 42-pixel separation between HP and SP rows. Statuses use compact bracketed tags and wrap within the panel:

`[FOCUSED 3] [RILED 3] [DISTRACTED 2] [DEFENDING] [OFF GUARD] [STUN]`

Only applicable tags appear. No `No mental status` or `Not defending` filler remains. A defending actor's actual reduction is shown separately; **only Player** also shows `Evasion +5pp`. Guard defense shows damage reduction alone. Guard finite resources read `[DONUT ✓] [CALL ✓]`, switching each used resource to an em dash.

## Deterministic previews and selection

Catch Breath previews capped HP and the actual SP cost: HP620/SP70 becomes **HP620 -> 770 / SP70 -> 40**; HP960 becomes **1000**, not1110. Defend previews capped +10 SP, e.g.95 ->100. No speculative damage or Guard-response forecast is shown. An illegal heal does not display a negative-SP or executable-heal preview.

Selected rows have a cream border, stronger blue fill and a solid pointer. Unaffordable rows are dimmed but readable, with a muted warning-colored cost and **Not enough SP** in the context panel when highlighted. Inspection is allowed; execution continues through the unchanged authoritative validity check.

W/S and up/down arrows visit all visible entries, including unaffordable skills. Mouse hover, mouse click and number shortcuts set the same selected index before refreshing/activating. Enter/Space executes only valid entries. A/D, left/right, Escape/Backspace and BACK retain the existing menu structure. During resolution, menu inspection is locked.

## Implementation

- `src/game/battle/battleUIModel.js`: read-only descriptions, tags, previews and status/resource formatting.
- `src/game/scenes/BattleScene.js`: context panel, status layout, compact header, row styling and synchronized selection.
- `src/game/battle/presentationEffects.js`: retains the latest displayed commentary in the context panel; no timing changes.
- `src/game/battle/BattleUI.test.mjs`: seven deterministic model/scene-integration tests.

## Validation

- **395/395 tests passed**, including existing presentation, combat, policy and progression tests.
- **113 JS/MJS files passed syntax checks**. The final priority-label change was also syntax-checked and all seven UI tests rerun successfully.
- **Production build passed**, exit0. Existing >500kB bundle warning remains.
- **278 frozen files checked; zero changes**, covering combat, AI/Q-table, training, readiness, audio, dialogue, Player animation modules and runtime assets. No SFX were added or changed.
- Production Q SHA256 remains `96dff2a6a9c7f2803342e5d7e9550231b22392c10a5bebd8e8d4fb7f012bf686`.
- No new code consumes gameplay RNG. A hidden-action getter test rejects accidental inspection while the UI is refreshed.

Artifacts: `tools/battle-ui-tests.txt`, `battle-ui-final-target.txt`, `battle-ui-syntax-summary.txt`, `battle-ui-build.txt`, `battle-ui-integrity.json`.

Browser automation reported its browser access host unavailable, so live appearance was not verified. Remaining manual checks: inspect text wrapping at normal and narrow window sizes, all status combinations, spent-resource badges, disabled-row readability, keyboard/mouse/number navigation, capped previews and commentary transitions during an actual battle. Existing music, SFX, animations and day flow should receive a brief smoke check without changing their behavior.
