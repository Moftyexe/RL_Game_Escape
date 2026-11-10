# School Escape documentation

Start with the [game README](../README.md) for the story, controls, characters and local setup.

| Topic | Guide |
| --- | --- |
| Player/Guard actions and combat rules | [Combat rules](COMBAT_RULES.md) |
| Frozen learned Guard and training architecture | [Guard Q-learning](GUARD_Q_LEARNING.md) |
| Shipped checkpoint and held-out results | [v7 experiment](V7_COMBAT_GATE_PORTRAITS.md) |
| Day progression and readiness | [Day/readiness design](DAY_READINESS_PROGRESSION.md) |
| Edit character speech and portraits | [Dialogue editing](DIALOGUE_EDITING.md) |
| Readable debug and audio settings NPC | [Debug/dialogue/audio settings](DEBUG_DIALOGUE_AUDIO_SETTINGS.md) |
| Battle command interface | [Battle UI polish](BATTLE_UI_POLISH.md) |
| Sound palette and missing Foley | [SFX integration](SFX_INTEGRATION_REPORT.md), [Missing sounds](SFX_MISSING.md) |
| Music attribution | [CC BY4.0 notice](../MUSIC_LICENSE.md) |
| Removed source originals and generated output | [Repository cleanup](maintenance/REPOSITORY_CLEANUP.md) |

Other reports document earlier experiments and implementation passes. Their raw source/checkpoint/log paths are historical records; those large generated inputs are no longer distributed in the repository. Current runtime manifests retain provenance hashes, and tests verify the shipped assets directly. Restore old inputs from Git history only when regenerating assets or reproducing an archived experiment.
