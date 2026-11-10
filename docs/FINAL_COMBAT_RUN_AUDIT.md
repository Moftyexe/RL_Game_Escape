> Historical inspection report. Combat balance, recovery commentary, Call Wife, and RL state values are superseded by [the v2 balance/RL/audio pass](FINAL_BALANCE_RL_AUDIO_PASS.md). Running asset findings remain historical evidence.

# Final combat and source-to-playback running audit

This report incorporates the revised 25% OFF_GUARD / 75% DISTRACTED request.
No Q-learning, DDA, training, rewards or state encoder were added.

## Combat result

- Player HP stays 1000; Guard HP changes 1000 -> 1200. Both SP maxima stay 100.
- Donut remains +180 HP/+20 SP and caps at Guard 1200 HP / 100 SP.
- Look There stays 18 SP / NORMAL. Exactly one injected combat roll is used:
  below 0.25 = OFF_GUARD; at 0.25 or above = normal DISTRACTED.
- Full success cancels a still-pending current Guard action before spending SP
  or applying effects. It never reverses an already-resolved Guard action.
- OFF_GUARD survives application-round end and the next round begins with a
  reserved null Guard action. Policy is not called. Player chooses normally;
  reveal displays OFF GUARD. Null skip uses the existing FAST skip-slot convention,
  including injected tie RNG when both slots are FAST.
- That next-round Guard opportunity produces offGuardSkipped and clears the flag
  immediately. The skipped-opportunity narration presents before the next action,
  holding the away pose during the notice, then restoring the current stance.
  Future rounds allow normal Guard selection again. A fresh full success after
  an earlier penalty is consumed can apply a new penalty.
- OFF_GUARD is a separate transient flag, not an entry in STATUSES. Existing
  mental effects and their round ticking continue normally beneath it.
- Visual priority is terminal > OFF_GUARD > Defend > Riled idle > normal idle.
  Full success plays source frames 0,1,2 once and holds frame 2 through current
  round and next-round skip. Hurt returns to the held pose while the flag is active.
- Partial success uses the existing two-round DISTRACTED mechanics and immediate
  accuracy/defense reduction, yellow reaction and status label. Persistent stance
  is ordinary idle; it does not use the held away pose. RILED is unchanged.
- Blow Whistle remains guaranteed Player DISTRACTED plus 10% stun; costs,
  priorities, base damage, hit/crit values and RandomGuardPolicy are unchanged.

Full-success commentary is queued: "The Guard actually fell for it." then
"OFF GUARD!" with the appropriate pending/next-action explanation. On the carried
skip: "The Guard is still looking away." / "He loses his action."

## Running findings before changes

The independent scan found the same source hashes already recorded by processing;
no different unprocessed run source was present in the source folder. Ten side,
six front and six rear poses are actually on disk. Every recorded crop was checked
against an independent alpha-component extraction. No exact duplicated PNG, decoded
RGBA frame, or source crop was found. Registration used every index once in source
left-to-right order; no old frame key was mixed into the registration.

However, processing forced every visible foot to y=249, including airborne poses.
That moved the entire head/torso downward in raised-foot frames. Bounding-box
horizontal centering also let extended legs shift the torso sideways. The recent
45-70 ms frame override hid repeated-looking source poses by speeding through them.
Phaser's installed Animation/AnimationState code defaults skipMissedFrames=true,
which allows catch-up frame skips under lag. These are concrete alignment/playback
problems, in addition to source-art similarity, rather than evidence of duplicated
image files or missing extraction indexes.

## Running fixes

- Reprocessed RUN only with --runs-only; idle/walk PNGs and their playback were
  not rewritten. No original source file was deleted or edited.
- Preserved one proportional scale and shared source-floor coordinates per sheet.
  Intentional airborne visible feet stay above the floor; they are not forced down.
- Centered the head alpha centroid at x=128, within rounding tolerance, instead
  of centering the full extended-leg bounding rectangle. Output remains 256x256.
- Removed the source-specific shortened-frame timing array. All run cycles use
  uniform 12 FPS, repeat=-1, and skipMissedFrames=false. No frame indexes were
  removed, repeated, interpolated or fabricated.
- Added run-manifest.json with source and per-output hashes, explicit frame files
  and source pose indexes, and a deterministic processed-content revision.
- Run texture keys include the processed revision; image URLs include their PNG
  hash. Run registrations are replaced on scene creation so stale animation
  definitions cannot keep an old count/order. Idle/walk registration is unchanged.
- The processor still checks inspected pose counts as a fail-closed validation,
  but detects actual connected components and generates actual manifest counts;
  it never slices or registers a guessed six-frame grid.

## Sources and provenance

| Source | Dimensions | Bytes | Poses | Runtime use | SHA-256 |
|---|---|---:|---:|---|---|
| Pixel Runner Back-View Sprite Sheet.png | 2172x724 | 795796 | 6 | run_up | 342acabf72184a067c2815ae8535029aa793b0ef1aed5fac2f2f3d80a7ba4607 |
| Pixel Running Cycle Sprite Sheet.png | 1983x793 | 1502280 | 10 | run_side | 495d52385b7d49779b951f0f9c8a2dfbbaed95e4cf2807c9c42e3863af86a48d |
| Pixel-Art Runner Sprite Sheet.png | 2172x724 | 805289 | 6 | Alternate rear, inspection only | 39a5ade1b938bf0fef5969c9fbf018a8ef1f825c7a689856418e1592e84cc058 |
| Six-Frame Pixel Art Run Cycle.png | 2172x724 | 1100419 | 6 | run_down | a9c887dd505276f4ca509f348ad52868d527de686e422459d4e87e7c42e03b51 |

All four candidate sources have alpha transparency. The alternate rear source
remains referenced by the processor for inspection, not by runtime loading.
Prior 16-frame versions were overwritten in the same filename; their hashes are
retained only in historical processing metadata, not loaded as separate assets.
There are no remaining active old runtime frame-count or custom-duration references.
Earlier visual-pass reports are historical and point here for current behavior.

## Frame order and anatomical inspection

Source extraction is sorted left-to-right and retained in final playback. The
side sheet groups flight, contact/passing/compression-like poses, launch and
opposite-flight poses; several passing/launch silhouettes are very similar.
The six-frame front/rear sources likewise contain repeated-looking stances rather
than evenly spaced textbook eight-frame contact/passing/push-off drawings.
The source-vs-output contact sheet shows these similarities already in the art.
There was no evidence supporting an arbitrary permutation that would supply missing
intermediate anatomy. Order was therefore preserved, not silently scrambled or
made faster to hide it. Source-art staging can still limit perceived smoothness.

## RUN_SIDE

Source: Pixel Running Cycle Sprite Sheet.png

Source SHA-256: 495d52385b7d49779b951f0f9c8a2dfbbaed95e4cf2807c9c42e3863af86a48d

Processed frames: 10; FPS: 12; order: 0,1,2,3,4,5,6,7,8,9.
Source pose order and final playback order are the same. Repeat -1; no random
start, yoyo or repeated interior frame is configured. Catch-up skipping disabled.
Exact duplicate PNGs/pixels: none. Every source crop matches run metadata.

| Frame | Processed SHA-256 | Phaser texture key |
|---|---|---|
| 0 | 74172fb0c188d8b03cc9d06c5c5d1d510f755db2722d8527cbb5cd4998906b04 | player-runSide-483fc0bb929e-0 |
| 1 | f20ca0f5c5b499cd161e3acec4302a84e1b19766edc4dc3d1f94d5e099506e51 | player-runSide-483fc0bb929e-1 |
| 2 | 2ac792c0abf1d8d4ebfb449f4f0ade1cfa24650754faa6ea9c780c62b91680f7 | player-runSide-483fc0bb929e-2 |
| 3 | 20293232f5a0ea7a91bfffd494425088b8187fa56f54102a2bc4a19500140766 | player-runSide-483fc0bb929e-3 |
| 4 | 1767a245b25c5c8feceae9b96c727ceb9dd468a9e9ed1993de58aca50a1ccb79 | player-runSide-483fc0bb929e-4 |
| 5 | 415639cd152d8a2e9e320842ab45ee0d880931cba94c93bd27ebb83c924c3746 | player-runSide-483fc0bb929e-5 |
| 6 | 3922309219f8809d41bb747d81f0d0cc3ec0c320bf3c5f72abd0fa06330e45b6 | player-runSide-483fc0bb929e-6 |
| 7 | 7aeb42a00b9daf68f7b946ffee1603487be931984d6eaab243770aada26baa71 | player-runSide-483fc0bb929e-7 |
| 8 | 4fe23fefe4a35e19ba618bd7bb2127230d3ee72f0fd6bf86e05e41f9ed14564a | player-runSide-483fc0bb929e-8 |
| 9 | a4f0a17bd2836f7b6e9cb9d08db2665fd7e9fb48c28fc62310df3db993156c16 | player-runSide-483fc0bb929e-9 |

Head top before: 10..38; after: 10..14. Final head center: 127.514..128.472. Logical floor baseline 249; visible feet 221..249 reflect source airborne poses. Width/height/bounding center changes are recorded per frame, not normalized away by stretching.

Near-duplicate candidates (silhouette difference <15% or changed pixels <15% of visible union):

- 0 / 9: 34.32% changed pixels; 14.28% silhouette difference.
- 2 / 7: 30.77% changed pixels; 10.54% silhouette difference.
- 3 / 8: 34.31% changed pixels; 11.07% silhouette difference.
- 6 / 7: 35.02% changed pixels; 13.57% silhouette difference.
- 7 / 8: 37.49% changed pixels; 14.46% silhouette difference.

All adjacent transitions, including loop closure:

| Transition | Changed pixels | Silhouette change |
|---|---:|---:|
| 0 -> 1 | 52.89% | 34.44% |
| 1 -> 2 | 43.43% | 24.34% |
| 2 -> 3 | 38.82% | 16.52% |
| 3 -> 4 | 68.42% | 42.99% |
| 4 -> 5 | 62.97% | 39.14% |
| 5 -> 6 | 59.77% | 45.83% |
| 6 -> 7 | 35.02% | 13.57% |
| 7 -> 8 | 37.49% | 14.46% |
| 8 -> 9 | 50.25% | 36.1% |
| 9 -> 0 | 34.32% | 14.28% |

## RUN_DOWN

Source: Six-Frame Pixel Art Run Cycle.png

Source SHA-256: a9c887dd505276f4ca509f348ad52868d527de686e422459d4e87e7c42e03b51

Processed frames: 6; FPS: 12; order: 0,1,2,3,4,5.
Source pose order and final playback order are the same. Repeat -1; no random
start, yoyo or repeated interior frame is configured. Catch-up skipping disabled.
Exact duplicate PNGs/pixels: none. Every source crop matches run metadata.

| Frame | Processed SHA-256 | Phaser texture key |
|---|---|---|
| 0 | 0442fb400582d7210415f23e21f706c9d7b1dafc32de8e92f3754cac83071510 | player-runDown-ccbbdbbfb5cb-0 |
| 1 | c8c3badf39995178fe0bea3d0ebe564b649c4c2d0328158fff49c7badd1ff46e | player-runDown-ccbbdbbfb5cb-1 |
| 2 | cccc42bb98aab834a704fb97094387e2f6c6a0095713e9777996eedfbd8f6f03 | player-runDown-ccbbdbbfb5cb-2 |
| 3 | 4e1c2446671854c096027fe299532284223673ab216b689a63744536f31e815c | player-runDown-ccbbdbbfb5cb-3 |
| 4 | 198f74b1fd6033e793fa5a3c18b16594d841951938b734b42b28f31bdbb4fabc | player-runDown-ccbbdbbfb5cb-4 |
| 5 | 619f94bad18ac9817b2dc0c54961606707a14a6047b0991ac3aaa3cf6b7f1e3b | player-runDown-ccbbdbbfb5cb-5 |

Head top before: 10..28; after: 10..10. Final head center: 127.583..128.135. Logical floor baseline 249; visible feet 231..249 reflect source airborne poses. Width/height/bounding center changes are recorded per frame, not normalized away by stretching.

Near-duplicate candidates (silhouette difference <15% or changed pixels <15% of visible union):

- 2 / 3: 26.15% changed pixels; 13.89% silhouette difference.
- 3 / 5: 21.95% changed pixels; 11.86% silhouette difference.

All adjacent transitions, including loop closure:

| Transition | Changed pixels | Silhouette change |
|---|---:|---:|
| 0 -> 1 | 48.57% | 20.97% |
| 1 -> 2 | 47.75% | 20.92% |
| 2 -> 3 | 26.15% | 13.89% |
| 3 -> 4 | 50.6% | 20.38% |
| 4 -> 5 | 49.92% | 20.95% |
| 5 -> 0 | 31.31% | 16.87% |

## RUN_UP

Source: Pixel Runner Back-View Sprite Sheet.png

Source SHA-256: 342acabf72184a067c2815ae8535029aa793b0ef1aed5fac2f2f3d80a7ba4607

Processed frames: 6; FPS: 12; order: 0,1,2,3,4,5.
Source pose order and final playback order are the same. Repeat -1; no random
start, yoyo or repeated interior frame is configured. Catch-up skipping disabled.
Exact duplicate PNGs/pixels: none. Every source crop matches run metadata.

| Frame | Processed SHA-256 | Phaser texture key |
|---|---|---|
| 0 | b88dff5448567b7cd3ff4e97119a85e3d36e378270290619437cdc3376391e09 | player-runUp-3840dcd3e7ee-0 |
| 1 | 6c51c76c6a1945d7e87552407a6028ec7510a92c7cd42b18412ef84590ada12c | player-runUp-3840dcd3e7ee-1 |
| 2 | 592fa8e34f222da70ccdb8c32ed7d27ebcd75a8f0b00be18db57b5cdcecce746 | player-runUp-3840dcd3e7ee-2 |
| 3 | e4cd9a43280dae1bbfbaacb6bcae9a99f0870604eed342cb4b11d1166b9fdbc6 | player-runUp-3840dcd3e7ee-3 |
| 4 | ef15d7e2109f43a0dd15d713f8dffaf7135e9c50267a9a87c15177ba27511138 | player-runUp-3840dcd3e7ee-4 |
| 5 | 664e2d7f60b4b8f70498d1fe2ed864ba9c6bc997d63bb86704255b5aa9c7b457 | player-runUp-3840dcd3e7ee-5 |

Head top before: 10..22; after: 10..11. Final head center: 127.77..128.178. Logical floor baseline 249; visible feet 239..249 reflect source airborne poses. Width/height/bounding center changes are recorded per frame, not normalized away by stretching.

Near-duplicate candidates (silhouette difference <15% or changed pixels <15% of visible union):

- 0 / 1: 21.51% changed pixels; 11.47% silhouette difference.
- 0 / 2: 26.19% changed pixels; 13.29% silhouette difference.
- 0 / 3: 19.13% changed pixels; 11.16% silhouette difference.
- 0 / 4: 24.14% changed pixels; 13.31% silhouette difference.
- 0 / 5: 17.44% changed pixels; 8.59% silhouette difference.
- 1 / 2: 21.69% changed pixels; 9.13% silhouette difference.
- 1 / 3: 12.79% changed pixels; 5.25% silhouette difference.
- 1 / 5: 19.34% changed pixels; 8.85% silhouette difference.
- 2 / 3: 20.5% changed pixels; 9.07% silhouette difference.
- 2 / 5: 20.73% changed pixels; 11.47% silhouette difference.
- 3 / 5: 15.39% changed pixels; 8% silhouette difference.

All adjacent transitions, including loop closure:

| Transition | Changed pixels | Silhouette change |
|---|---:|---:|
| 0 -> 1 | 21.51% | 11.47% |
| 1 -> 2 | 21.69% | 9.13% |
| 2 -> 3 | 20.5% | 9.07% |
| 3 -> 4 | 25.74% | 15.68% |
| 4 -> 5 | 26.5% | 15% |
| 5 -> 0 | 17.44% | 8.59% |

## Diagnostic artifacts and reproduction

- [Numbered exact runtime frames](../public/assets/player/movement/run-audit.png)
- [Source crops above exact runtime frames](../public/assets/player/movement/run-audit-source-vs-processed.png)
- [Complete machine-readable audit](../public/assets/player/movement/run-audit.json)
- [Detailed hashes, raw crop hashes, alpha bounds and transition metrics](../public/assets/player/movement/run-audit.md)
- [Before-fix evidence](run-audit-before.json)

Changed pixels = maximum RGBA channel difference >32, divided by the union of
visible pixels. Silhouette difference = alpha occupancy XOR / visible union.
These are diagnostic flags, not proof of artist reuse: the large stable head
and torso naturally make rear frames similar. No frame was silently discarded.
Side 5->6 is still the largest silhouette transition (45.83%), already present
in the source. Loop closure is not a disproportionate jump in any final cycle.

Regenerate with:

    node tools/processPlayerSprites.mjs --runs-only
    npm.cmd run audit-running
    node --test

Hashes are derived from current files/manifests, not permanent literals in tests.
Future source replacement must be inspected if its pose count changes, then both
processing and audit are rerun. Ordinary idle/walk files need no regeneration.

## Verification

177 tests pass, zero failures. This includes 25% boundaries, current interruption,
no SP/effects on cancellation, carry into next round, policy bypass in scene and
adapter, skip consumption/clear, following-round normal action, no retroactive
undo, reapplication after skip, normal DISTRACTED stance, held OFF_GUARD after Hurt,
UI HP maxima, Donut caps, all existing combat behavior, directional movement and
left flip, every source/output/crop hash, unique indexes, explicit registration,
cache revision and baseline/geometry checks.

Syntax and production-build results are recorded after final verification.
Manual browser checks remain: subjective stride smoothness at actual movement
speed/DPI and frame-rate conditions, and OFF_GUARD reveal/held/skip transitions.
Static source, anatomy and processed contact sheets were visually inspected.
No live browser verification is claimed.
