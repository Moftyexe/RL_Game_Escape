# Runtime-focused repository cleanup

The game ships processed assets in `public/assets/`. Raw authoring sheets, extracted video frames, alternate backgrounds and duplicate audio exports are not needed to run or build it.

The cleanup manifest records every removed path, size and SHA256 **before deletion**: [cleanup-manifest.json](cleanup-manifest.json). Approximately843MiB of authoring/generated files are removed from the working tree. This includes locally installed video-extraction dependencies that were already ignored. Runtime art/audio and the selected Q-table are preserved byte-for-byte; [runtime-hashes.json](runtime-hashes.json) records the retained files and is verified by tests.

## Removed

- Original Player/Guard/NPC animation sheets, source videos and duplicate portrait exports. Processed runtime frames and portraits remain.
- BG2–BG5 and other unused background/character/template images.
- Root-level duplicate hallway/battle audio recordings. The same MP3 bytes remain under `public/assets/audio/`.
- SFX source WAV duplicates and candidate copies; selected runtime effects, provenance metadata and source/CC0 license notices remain.
- Archived training checkpoints, per-episode metrics, raw frame extraction caches, audit logs/screenshots and video-extraction-only dependencies. The frozen selected production Q-table remains.
- Unused template Game scene and template analytics helper. Standard dev/build scripts now invoke Vite directly.

The two active backgrounds were moved, without image editing, to `public/assets/environment/hallway.png` and `battle.png`. Runtime loaders now use those paths. Source code, tests, CLI tool source, package lock, documentation, licenses and useful lightweight processed-asset manifests remain.

## Tests and reproducibility

Runtime tests check shipped bytes, dimensions, transparency, ordering, unique frames, baselines and the actual production model. Original-source digest checks run additionally if an authoring export is restored locally; tests no longer require those exports. Archived artifact-loading tests now validate the selected production checkpoint; existing generated-checkpoint serialization/determinism tests remain in the training suite.

Removed files remain recoverable from commit `39800af` and earlier history. Restore a source export before using its optional processing tool; a full asset regeneration requires those original inputs. Training and processing outputs are ignored so they do not return in routine commits. Generated historical paths in older reports describe the original experiments rather than files promised in the current checkout.

This is a normal cleanup commit, **not a Git history rewrite**. Full clones may still download old large objects. Use `git clone --depth 1 https://github.com/Moftyexe/RL_Game_Escape.git` when only the current game is needed. No commits were force-pushed or historical work destroyed.

Music credit is independent of cleanup: [@prodbyhajime](https://www.instagram.com/prodbyhajime/), **CC BY4.0**; see [Music license](../../MUSIC_LICENSE.md). Runtime recordings and selected SFX are unchanged.
