# Readable debug, dialogue portraits and Music Guy settings

## Scope

This pass changes UI, settings and authored-text organization only. Combat balance/validity/outcomes, Q-table/schema, learning, readiness probabilities, day progression, selected SFX mappings, audio source files, transitions and animation assets are unchanged. Combat speech references now point to a central data module; speech text/order/cosmetic RNG and mechanical code paths are preserved.

## F2 debug

Each F2 opening starts in the readable view. The720x454 navy panel at(152,104) uses padding,13px body text and two columns. A background input shield prevents clicks through the overlay into commands below it.

The header shows Guard AI, day/readiness, current policy and learning OFF. The left column explains the configured best/second/third learned-move percentages, then health/SP bands, statuses, finite resources, Player stun and previous Player move category in plain English. Examples: VERY_HIGH becomes Very High, NONE becomes None, unavailable Donut becomes Used, PREV_ATTACK becomes Attack. Previous-move categories are the information the existing encoded state actually contains; no current hidden choice is inspected. When the policy is Random, the panel explicitly says it randomly chooses an available move rather than claiming to apply readiness ranking.

The right column lists valid visited actions in descending Q order: a cream star/Best for first, Good for ranks2-3, Fair for rank4, Low afterward. Unvisited valid moves say Not learned yet and are not promoted by their default zero. Unavailable moves are muted and marked Unavailable. No raw Q, visit counts or encoded state appears in this default view. Unseen states explain safe Random fallback. Guard move stays Hidden until reveal.

**A**, only while F2 is open, or the clickable ADVANCED control switches to technical information. It retains schema, EVAL/epsilon0, load status, escapes/tier, configured and normalized rank probabilities, wrapped encoded state, Q-values, visits N, validity and fallback information. Short definitions explain Q-value and training visits. Closing/reopening F2 returns to the simple view. No new policy calls, decisions, RNG draws or learning occur when switching views.

## Larger borderless dialogue portraits

The main box is now952x180 at(36,558), still bottom-aligned. Player and Guard use the same fixed geometry. Images are fit proportionally into **184x164**, centered atx138 and bottom-aligned aty730, preserving the entire canvas and head/hair/shoulders. The previous fit was92x104. Neither source artwork nor runtime PNG bytes were edited. NEAREST filtering remains.

The separate portrait rectangle/stroke is removed entirely. Only the main dialogue box keeps its retro cream/inset border. Speaker text begins at(250,575), body at(250,604), wrapping within710px. Typewriter30ms/character, reveal-first/advance-next semantics,120ms input debounce and blinking continuation arrow are unchanged.

`musicGuy` is registered centrally as @prodbyhajime with key `music-guy-dialogue-portrait`, file null until supplied. Missing art leaves a blank image area and functioning dialogue.

## Central dialogue source

**`src/game/dialogue/dialogueScript.js`** contains the editable authored lines and speaker metadata. Migrated: all day-aware gate exchanges and Player responses, Music Guy greeting, action speeches including Lock In/Look There/Backpack/Catch Breath/Crack Knuckles/Whistle/Call Wife/Donut, the15 Talk Smack insults, four Wife responses, initial encounter/fallback prose and next-day narration. No existing character utterance changed. Empty result-dialogue slots document that no victory/defeat spoken lines existed.

`gateDialogue.js` and `combatDialogue.js` remain compatibility adapters, not duplicate authored scripts. Scenes and action definitions request the central data. Purely mechanical damage/status/resource/cancellation commentary, action names, controls, HP/SP and debug labels remain separate. See [Dialogue editing](DIALOGUE_EDITING.md).

## Music Guy audio menu

Space interaction now locks exploration, settles the Player to idle, plays the central greeting **Need me to fix the mix?**, then opens AUDIO. It no longer immediately toggles hallway music. Closing the menu restores control and clears the interaction press to avoid reopening on the same key. Missing NPC artwork retains the existing safe removal behavior. Gate auto-dialogue and battle flow remain unchanged.

The menu has four rows, a Music by @prodbyhajime credit, Mute/Unmute Music and Close. Mouse click/drag adjusts sliders; Up/Down or W/S changes keyboard selection; Left/Right or A/D changes5%; Enter/Space activates mute/credit/close; Escape/Backspace closes. Values clamp0-100% and labels update immediately. Resize uses the same logical1024x768 layout.

| Channel | New-install starting value | Meaning |
| --- | --- | --- |
| Hallway Music | 35% | Actual music volume0.35; keeps the old mix. |
| Battle Music | 35% | Actual music volume0.35; keeps the old mix. |
| Sound Effects | 100% | Multiplies the existing per-category/sample SFX gains; no original effect is boosted at startup. |
| Footsteps | 30% | Independent scale with headroom:0.30 reference gain x0.30 setting x sample gain = old0.09 x sample gain. At100%, steps can be3.33x louder than the original, without changing other effects. |

Changing music applies volume to the existing track; it does not restart/seek it. Battle volume is retained before BattleScene and applies live if its track exists. SFX/footstep changes update existing voices and future plays independently. Mute Music sets both tracks' effective volume to0 while preserving their individual slider values; it leaves SFX/footsteps alone. The legacy HallwayMusic toggle method remains for compatibility but is no longer the NPC interaction.

Settings live in a per-SoundManager session store and safely save to localStorage key `school-escape-audio-v1`. Stored choices override initial defaults on a later refresh. Unavailable/invalid/blocked storage falls back to session/default values without crashing.

**@prodbyhajime** is underlined, has pointer/hover feedback, and is reachable in keyboard menu navigation. Activation opens exactly **https://www.instagram.com/prodbyhajime/** using `_blank` with `noopener,noreferrer`; it does not navigate the game tab. No external page was opened during automated tests.

## Validation

- **414/414 tests passed**, including default/advanced debug behavior and hidden-choice safety; Music Guy greeting/menu replacing toggle; live track changes and unchanged seek/play counts; volume bounds/persistence/storage failures; separate SFX/footstep voices; mouse/keyboard menu control; exact safe credit URL; central script identity/order; enlarged portraits/missing Music Guy artwork; existing combat/Q/readiness/typewriter/transition regressions.
- **128 JS/MJS syntax checks passed**; final modified debug/scene files were also rechecked.
- **Production build passed**, exit0, with the existing large-bundle warning. Evidence is recorded in `tools/settings-dialogue-build.txt` and `tools/settings-dialogue-integrity.json`.
- **289 protected files match** the pre-pass inventory, including production Q, core AI/training/readiness modules, all runtime art/audio/SFX manifests and the battle-entry transition. Production Q SHA256 remains `96dff2a6a9c7f2803342e5d7e9550231b22392c10a5bebd8e8d4fb7f012bf686`.
- Existing414 tests include all combat compatibility regressions; no retraining or schema bump was done.

Browser automation currently reports its browser access host unavailable. Manual checks remain: readable F2 layout and long Advanced-state wrapping at different window sizes; portrait visual size/padding; mouse drag and keyboard focus; live listening/mixing, mute/unmute and persistence after refresh; actual Instagram opening; missing Music Guy portrait; repeated battles with adjusted channel volumes. Live browser rendering/listening is not claimed.

## Changed implementation files

Added `audio/AudioSettings.js`, `audio/AudioSettingsMenu.js`, `dialogue/dialogueScript.js` and feature tests. Updated audio services for category multipliers; musician interaction for greeting/settings; DialogueBox and portrait registry; debug renderer and BattleScene toggle; combat/action speech references and compatibility exports; day-card/speech speaker labels for central authored metadata. Scene/gameplay transitions themselves were not redesigned.
