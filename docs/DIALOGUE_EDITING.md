# Editing game dialogue

Edit **`src/game/dialogue/dialogueScript.js`**. It is the authored character/story text source; do not put replacement speech in scenes.

- `SPEAKERS` holds names and portrait mappings. IDs are `player`, `guard`, `musicGuy`, `wife`.
- `GAME_DIALOGUE.gate[1..5]` contains ordered conversations. Variant5 covers Day5 and later; missing variants fall back to Day1. Add/remove entries shaped `{speaker:'guard', text:'Your line.'}`. Keep at least one valid line per conversation.
- `musicGuy.greeting` opens before audio settings. It uses the same entry format and portrait renderer.
- `battle.actionLines` contains the existing quoted action speeches; keep surrounding quote characters because the combat presentation uses them to distinguish speech from mechanical messages.
- `battle.player.talkSmack` is the ordered insult pool. Cosmetic selection and its injected RNG are unchanged.
- `battle.wife` contains the four existing responses: RILED, DISTRACTED, FOCUSED and default. Keep the keys, edit the text.
- `battle.victory` and `battle.defeat` are empty extension slots; no spoken result lines existed, so none were invented or wired in this pass.
- `battle.introduction`, `fallback`, and `narrative` contain the initial encounter/fallback/day-card prose. Preserve the `{readiness}` placeholder in the day description.

Arrays determine line order. `getDialogue('musicGuy.greeting')` is the lookup helper. `gateDialogue(day)` handles day mapping; existing combat imports are compatibility exports of this source.

To add the Music Guy portrait, place the PNG under `public/assets/portraits/`, then set `SPEAKERS.musicGuy.file` to its `assets/portraits/...png` path. The stable key is `music-guy-dialogue-portrait`; no dialogue renderer changes are needed. Until then, no file is requested and the speaker text works without a portrait. Missing/failed textures remain safe.

Names, portraits and script arrays can be edited independently. UI labels such as ATTACK/HP/AI DEBUG and mechanical damage, stun, restoration and status messages intentionally remain in UI/combat presentation modules.
