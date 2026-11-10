# SFX source collection audit

Folder: `500-game-sound-effects`. Before: **500 audio files**; retained **399**; deleted **101**. README/LICENSES retained.

WAV headers, duration, PCM peak/RMS, category context and SHA256; no perceptual listening or elaborate audio classification. Ambiguous sounds kept. No renaming/transcoding/integration.

No SFX were copied to runtime, preloaded, registered or connected to gameplay. Existing hallway/battle music, volumes and transitions were untouched. Verified: all retained hashes unchanged; every deleted path is inside this collection; no runtime references to deleted files; all protected runtime/music/image/animation hashes unchanged.

Metadata for every original file (path, extension, bytes, SHA256, duration, sample rate, channels, bit depth, metadata and peak/RMS): [SFX_AUDIT.json](SFX_AUDIT.json). WAV headers were inspected rather than trusting filename duration/rate. This does not claim auditioning sounds.

## Kept

### Ambience/liquids/miscellaneous

- `14_water_mud_slime/bubble_48kHz_16bit_0.55s_01_s53.wav` — 0.547s, 48000 Hz, 2 channels, 105088 bytes
- `14_water_mud_slime/bubbles_48kHz_16bit_0.32s_02_s53.wav` — 0.317s, 48000 Hz, 2 channels, 60824 bytes
- `14_water_mud_slime/bubbles_48kHz_16bit_0.6s_01_s53.wav` — 0.597s, 48000 Hz, 2 channels, 114660 bytes
- `14_water_mud_slime/impactsplat_48kHz_16bit_0.76s_04_s06.wav` — 0.762s, 48000 Hz, 2 channels, 146364 bytes
- `14_water_mud_slime/impactsplat_48kHz_16bit_0.83s_03_s06.wav` — 0.831s, 48000 Hz, 2 channels, 159576 bytes
- `14_water_mud_slime/impactsplat_48kHz_16bit_0.97s_01_s06.wav` — 0.967s, 48000 Hz, 2 channels, 185644 bytes
- `14_water_mud_slime/impactsplat_48kHz_16bit_1.01s_02_s06.wav` — 1.015s, 48000 Hz, 2 channels, 194904 bytes
- `14_water_mud_slime/impactsplat_48kHz_16bit_1.78s_05_s06.wav` — 1.779s, 48000 Hz, 2 channels, 341632 bytes
- `14_water_mud_slime/impactsplat_48kHz_16bit_1s_06_s06.wav` — 1.004s, 48000 Hz, 2 channels, 192752 bytes
- `14_water_mud_slime/loop_bubbles_loop_48kHz_16bit_4.41s_02_s53.wav` — 4.407s, 48000 Hz, 2 channels, 846188 bytes
- `14_water_mud_slime/loop_bubbles_loop_48kHz_16bit_7.33s_01_s53.wav` — 7.334s, 48000 Hz, 2 channels, 1408080 bytes
- `14_water_mud_slime/loop_water_loop_48kHz_16bit_3.38s_04_s53.wav` — 3.380s, 48000 Hz, 2 channels, 649096 bytes
- `14_water_mud_slime/loop_water_loop_48kHz_16bit_6.37s_01_s49.wav` — 6.367s, 48000 Hz, 2 channels, 1222548 bytes
- `14_water_mud_slime/loop_water_loop_48kHz_16bit_8.73s_02_s49.wav` — 8.734s, 48000 Hz, 2 channels, 1676900 bytes
- `14_water_mud_slime/loop_water_loop_48kHz_16bit_9.71s_03_s49.wav` — 9.707s, 48000 Hz, 2 channels, 1863776 bytes
- `14_water_mud_slime/mud_48kHz_16bit_0.31s_03_s51.wav` — 0.306s, 48000 Hz, 2 channels, 58788 bytes
- `14_water_mud_slime/mud_48kHz_16bit_0.44s_01_s51.wav` — 0.441s, 48000 Hz, 2 channels, 84708 bytes
- `14_water_mud_slime/mud_48kHz_16bit_0.68s_02_s51.wav` — 0.681s, 48000 Hz, 2 channels, 130788 bytes
- `14_water_mud_slime/splash_48kHz_16bit_0.63s_03_s53.wav` — 0.627s, 48000 Hz, 2 channels, 120484 bytes
- `14_water_mud_slime/splash_48kHz_16bit_0.72s_02_s53.wav` — 0.718s, 48000 Hz, 2 channels, 137872 bytes
- `14_water_mud_slime/splash_48kHz_16bit_1.24s_01_s53.wav` — 1.243s, 48000 Hz, 2 channels, 238676 bytes
- `14_water_mud_slime/water_boiling_loop_48kHz_16bit_4.49s_01_s52.wav` — 4.492s, 48000 Hz, 2 channels, 862464 bytes
- `14_water_mud_slime/water_drop_48kHz_16bit_0.35s_01_s32.wav` — 0.345s, 48000 Hz, 2 channels, 66376 bytes
- `14_water_mud_slime/water_drop_48kHz_16bit_0.39s_02_s32.wav` — 0.391s, 48000 Hz, 2 channels, 75084 bytes
- `14_water_mud_slime/water_drop_48kHz_16bit_0.59s_03_s32.wav` — 0.586s, 48000 Hz, 2 channels, 112516 bytes
- `14_water_mud_slime/water_flowing_loop_48kHz_16bit_1.88s_01_s52.wav` — 1.883s, 48000 Hz, 2 channels, 361620 bytes
- `14_water_mud_slime/water_pour_48kHz_16bit_1.59s_01_s32.wav` — 1.591s, 48000 Hz, 2 channels, 305436 bytes
- `14_water_mud_slime/water_vial_fill_48kHz_16bit_2.12s_01_s32.wav` — 2.124s, 48000 Hz, 2 channels, 407948 bytes
- `15_nature_weather/birds_48kHz_16bit_30.69s_02_s39.wav` — 30.688s, 48000 Hz, 2 channels, 5892188 bytes
- `15_nature_weather/birds_48kHz_16bit_3s_01_s58.wav` — 3.000s, 48000 Hz, 2 channels, 576004 bytes
- `15_nature_weather/cicada_48kHz_16bit_7.38s_01_s17.wav` — 7.385s, 48000 Hz, 2 channels, 1417896 bytes
- `15_nature_weather/cricket_48kHz_16bit_13.71s_01_s17.wav` — 13.714s, 48000 Hz, 2 channels, 2633188 bytes
- `15_nature_weather/cricket_48kHz_16bit_13.71s_02_s17.wav` — 13.714s, 48000 Hz, 2 channels, 2633188 bytes
- `15_nature_weather/crickets_48kHz_16bit_5.14s_02_s17.wav` — 5.143s, 48000 Hz, 2 channels, 987476 bytes
- `15_nature_weather/crickets_48kHz_16bit_82.52s_01_s27.wav` — 82.518s, 48000 Hz, 2 channels, 15843412 bytes
- `15_nature_weather/fire_loop_48kHz_16bit_29.26s_01_s28.wav` — 29.264s, 48000 Hz, 2 channels, 5618644 bytes
- `15_nature_weather/leaves_48kHz_16bit_0.85s_02_s40.wav` — 0.852s, 48000 Hz, 2 channels, 163708 bytes
- `15_nature_weather/leaves_48kHz_16bit_1.58s_01_s40.wav` — 1.579s, 48000 Hz, 2 channels, 303284 bytes
- `15_nature_weather/power_drain_48kHz_16bit_3s_01_s42.wav` — 3.000s, 48000 Hz, 2 channels, 576044 bytes
- `15_nature_weather/rain_loop_48kHz_16bit_3.99s_02_s52.wav` — 3.991s, 48000 Hz, 2 channels, 766252 bytes
- `15_nature_weather/rain_loop_48kHz_16bit_6.83s_01_s53.wav` — 6.827s, 48000 Hz, 2 channels, 1310740 bytes
- `15_nature_weather/raven_48kHz_16bit_2.06s_02_s29.wav` — 2.064s, 48000 Hz, 2 channels, 396272 bytes
- `15_nature_weather/raven_48kHz_16bit_9.79s_01_s29.wav` — 9.789s, 48000 Hz, 2 channels, 1879560 bytes
- `15_nature_weather/rustle_48kHz_16bit_2.33s_01_s40.wav` — 2.335s, 48000 Hz, 2 channels, 448312 bytes
- `15_nature_weather/thunder_48kHz_16bit_5.26s_01_s49.wav` — 5.265s, 48000 Hz, 2 channels, 1010876 bytes
- `15_nature_weather/wind_48kHz_16bit_60s_01_s20.wav` — 59.999s, 48000 Hz, 2 channels, 11519836 bytes
- `15_nature_weather/wind_48kHz_16bit_60s_02_s20.wav` — 59.999s, 48000 Hz, 2 channels, 11519836 bytes
- `15_nature_weather/wind_48kHz_16bit_60s_03_s20.wav` — 59.999s, 48000 Hz, 2 channels, 11519836 bytes
- `16_ambiences/ambience_48kHz_16bit_1.69s_02_s23.wav` — 1.688s, 48000 Hz, 2 channels, 324048 bytes
- `16_ambiences/ambience_48kHz_16bit_1.81s_01_s23.wav` — 1.813s, 48000 Hz, 2 channels, 348044 bytes
- `16_ambiences/atmoseerie_48kHz_16bit_20.01s_01_s05.wav` — 20.011s, 48000 Hz, 2 channels, 3842132 bytes
- `16_ambiences/atmoseerie_48kHz_16bit_20.01s_02_s05.wav` — 20.011s, 48000 Hz, 2 channels, 3842132 bytes
- `16_ambiences/atmosphere_48kHz_16bit_4.63s_01_s23.wav` — 4.625s, 48000 Hz, 2 channels, 888048 bytes
- `16_ambiences/desert_48kHz_16bit_35.81s_01_s29.wav` — 35.813s, 48000 Hz, 2 channels, 6876164 bytes
- `16_ambiences/dungeon_loop_48kHz_16bit_94.31s_01_s08.wav` — 94.310s, 48000 Hz, 2 channels, 18107516 bytes
- `16_ambiences/forest_48kHz_16bit_30s_01_s29.wav` — 30.000s, 48000 Hz, 2 channels, 5760080 bytes

### Computer/UI/switch/alarm

- `17_machinery_technology/alarm_loop_48kHz_16bit_1.98s_01_s52.wav` — 1.979s, 48000 Hz, 2 channels, 379968 bytes
- `17_machinery_technology/bleepingcomputer_48kHz_16bit_8s_01_s27.wav` — 8.002s, 48000 Hz, 2 channels, 1536492 bytes
- `17_machinery_technology/computer_48kHz_16bit_5s_01_s15.wav` — 5.000s, 48000 Hz, 2 channels, 960044 bytes
- `17_machinery_technology/computer_noise_48kHz_16bit_5s_01_s15.wav` — 5.000s, 48000 Hz, 2 channels, 960044 bytes
- `17_machinery_technology/computer_noise_48kHz_16bit_5s_02_s15.wav` — 5.000s, 48000 Hz, 2 channels, 960044 bytes
- `17_machinery_technology/computer_pack_away_48kHz_16bit_10.31s_01_s27.wav` — 10.313s, 48000 Hz, 2 channels, 1980212 bytes
- `17_machinery_technology/computersaysno_48kHz_16bit_8.01s_01_s27.wav` — 8.010s, 48000 Hz, 2 channels, 1537964 bytes
- `17_machinery_technology/switch_48kHz_16bit_0.22s_01_s48.wav` — 0.219s, 48000 Hz, 2 channels, 42132 bytes
- `17_machinery_technology/switch_48kHz_16bit_0.3s_02_s48.wav` — 0.301s, 48000 Hz, 2 channels, 57828 bytes

### Doors/interaction

- `11_doors_locks/creak_48kHz_16bit_0.34s_03_s14.wav` — 0.338s, 48000 Hz, 2 channels, 64980 bytes
- `11_doors_locks/creak_48kHz_16bit_0.65s_01_s14.wav` — 0.648s, 48000 Hz, 2 channels, 124500 bytes
- `11_doors_locks/creak_48kHz_16bit_0.83s_02_s14.wav` — 0.830s, 48000 Hz, 2 channels, 159432 bytes
- `11_doors_locks/door_48kHz_16bit_0.56s_03_s07.wav` — 0.561s, 48000 Hz, 2 channels, 107840 bytes
- `11_doors_locks/door_48kHz_16bit_0.81s_01_s35.wav` — 0.811s, 48000 Hz, 2 channels, 155820 bytes
- `11_doors_locks/door_48kHz_16bit_0.83s_02_s07.wav` — 0.830s, 48000 Hz, 2 channels, 159320 bytes
- `11_doors_locks/door_close_48kHz_16bit_0.46s_03_s41.wav` — 0.458s, 48000 Hz, 2 channels, 88032 bytes
- `11_doors_locks/door_close_48kHz_16bit_0.59s_02_s41.wav` — 0.589s, 48000 Hz, 2 channels, 113144 bytes
- `11_doors_locks/door_close_48kHz_16bit_0.92s_01_s41.wav` — 0.918s, 48000 Hz, 2 channels, 176236 bytes
- `11_doors_locks/door_open_48kHz_16bit_0.6s_02_s41.wav` — 0.603s, 48000 Hz, 2 channels, 115792 bytes
- `11_doors_locks/door_open_48kHz_16bit_0.72s_01_s41.wav` — 0.723s, 48000 Hz, 2 channels, 138800 bytes
- `11_doors_locks/door_open_48kHz_16bit_1s_03_s41.wav` — 1.000s, 48000 Hz, 2 channels, 192044 bytes
- `11_doors_locks/floor_creak_48kHz_16bit_0.64s_01_s32.wav` — 0.643s, 48000 Hz, 2 channels, 123416 bytes
- `11_doors_locks/key_lock_door_48kHz_16bit_0.91s_03_s26.wav` — 0.910s, 48000 Hz, 2 channels, 174844 bytes
- `11_doors_locks/key_lock_door_48kHz_16bit_0.95s_02_s26.wav` — 0.954s, 48000 Hz, 2 channels, 183188 bytes
- `11_doors_locks/key_lock_door_48kHz_16bit_2.39s_01_s26.wav` — 2.389s, 48000 Hz, 2 channels, 458744 bytes
- `11_doors_locks/keyhole_lockbox_insert_48kHz_16bit_0.86s_01_s32.wav` — 0.858s, 48000 Hz, 2 channels, 164788 bytes
- `11_doors_locks/keyhole_lockbox_remove_48kHz_16bit_0.75s_01_s32.wav` — 0.753s, 48000 Hz, 2 channels, 144624 bytes
- `11_doors_locks/keyhole_lockbox_turn_48kHz_16bit_0.92s_01_s32.wav` — 0.922s, 48000 Hz, 2 channels, 177068 bytes
- `11_doors_locks/keys_48kHz_16bit_0.33s_01_s50.wav` — 0.329s, 48000 Hz, 2 channels, 63252 bytes
- `11_doors_locks/latch_48kHz_16bit_0.26s_01_s14.wav` — 0.261s, 48000 Hz, 2 channels, 50220 bytes
- `11_doors_locks/lock_48kHz_16bit_0.28s_02_s56.wav` — 0.284s, 48000 Hz, 2 channels, 54484 bytes
- `11_doors_locks/lock_48kHz_16bit_0.37s_01_s56.wav` — 0.367s, 48000 Hz, 2 channels, 70588 bytes
- `11_doors_locks/unlock_48kHz_16bit_0.74s_01_s50.wav` — 0.737s, 48000 Hz, 2 channels, 141568 bytes

### Eating/recovery

- `09_human_nonverbal/drink_sip_and_swallow_48kHz_16bit_2.54s_01_s27.wav` — 2.539s, 48000 Hz, 2 channels, 487552 bytes

### Footsteps/movement/gear

- `02_footsteps/boots_leather_step_48kHz_16bit_0.43s_01_s32.wav` — 0.432s, 48000 Hz, 2 channels, 82904 bytes
- `02_footsteps/carpet_48kHz_16bit_0.14s_01_s12.wav` — 0.145s, 48000 Hz, 2 channels, 27844 bytes
- `02_footsteps/carpet_48kHz_16bit_0.14s_02_s12.wav` — 0.145s, 48000 Hz, 2 channels, 27844 bytes
- `02_footsteps/carpet_48kHz_16bit_0.14s_03_s12.wav` — 0.145s, 48000 Hz, 2 channels, 27844 bytes
- `02_footsteps/concrete_48kHz_16bit_0.11s_01_s12.wav` — 0.106s, 48000 Hz, 2 channels, 20384 bytes
- `02_footsteps/concrete_48kHz_16bit_0.11s_02_s12.wav` — 0.108s, 48000 Hz, 2 channels, 20712 bytes
- `02_footsteps/concrete_48kHz_16bit_0.11s_03_s12.wav` — 0.113s, 48000 Hz, 2 channels, 21700 bytes
- `02_footsteps/concrete_48kHz_16bit_0.11s_04_s12.wav` — 0.111s, 48000 Hz, 2 channels, 21260 bytes
- `02_footsteps/footstep_48kHz_16bit_0.24s_02_s14.wav` — 0.242s, 48000 Hz, 2 channels, 46536 bytes
- `02_footsteps/footstep_48kHz_16bit_0.25s_01_s14.wav` — 0.249s, 48000 Hz, 2 channels, 47824 bytes
- `02_footsteps/footstep_48kHz_16bit_0.27s_03_s14.wav` — 0.269s, 48000 Hz, 2 channels, 51696 bytes
- `02_footsteps/gassy_footstep_48kHz_16bit_0.57s_01_s27.wav` — 0.570s, 48000 Hz, 2 channels, 109492 bytes
- `02_footsteps/grass_48kHz_16bit_0.67s_02_s12.wav` — 0.674s, 48000 Hz, 2 channels, 129380 bytes
- `02_footsteps/grass_48kHz_16bit_0.67s_04_s12.wav` — 0.669s, 48000 Hz, 2 channels, 128556 bytes
- `02_footsteps/grass_48kHz_16bit_0.69s_03_s12.wav` — 0.692s, 48000 Hz, 2 channels, 132996 bytes
- `02_footsteps/grass_48kHz_16bit_0.78s_01_s12.wav` — 0.778s, 48000 Hz, 2 channels, 149340 bytes
- `02_footsteps/grassy_footstep_48kHz_16bit_0.41s_01_s27.wav` — 0.414s, 48000 Hz, 2 channels, 79512 bytes
- `02_footsteps/grassy_footstep_48kHz_16bit_0.5s_02_s27.wav` — 0.498s, 48000 Hz, 2 channels, 95660 bytes
- `02_footsteps/grassy_footstep_48kHz_16bit_0.5s_03_s27.wav` — 0.501s, 48000 Hz, 2 channels, 96280 bytes
- `02_footsteps/gravel_48kHz_16bit_0.7s_01_s31.wav` — 0.704s, 48000 Hz, 2 channels, 135196 bytes
- `02_footsteps/hard_footstep_48kHz_16bit_0.49s_02_s27.wav` — 0.488s, 48000 Hz, 2 channels, 93668 bytes
- `02_footsteps/hard_footstep_48kHz_16bit_0.58s_01_s27.wav` — 0.578s, 48000 Hz, 2 channels, 111064 bytes
- `02_footsteps/hard_footstep_48kHz_16bit_0.58s_03_s27.wav` — 0.581s, 48000 Hz, 2 channels, 111500 bytes
- `02_footsteps/leaves_48kHz_16bit_0.39s_01_s31.wav` — 0.391s, 48000 Hz, 2 channels, 75168 bytes
- `02_footsteps/leaves_48kHz_16bit_0.47s_02_s31.wav` — 0.474s, 48000 Hz, 2 channels, 91108 bytes
- `02_footsteps/movement_footsteps_48kHz_16bit_0.05s_01_s30.wav` — 0.052s, 48000 Hz, 2 channels, 9956 bytes
- `02_footsteps/movement_footstepsa_48kHz_16bit_0.05s_01_s30.wav` — 0.049s, 48000 Hz, 2 channels, 9380 bytes
- `02_footsteps/movement_footstepsb_48kHz_16bit_0.05s_01_s30.wav` — 0.050s, 48000 Hz, 2 channels, 9584 bytes
- `02_footsteps/movement_footstepsloop_fast_loop_48kHz_16bit_0.32s_01_s30.wav` — 0.321s, 48000 Hz, 2 channels, 61640 bytes
- `02_footsteps/movement_footstepsloop_fast_loop_48kHz_16bit_0.36s_02_s30.wav` — 0.359s, 48000 Hz, 2 channels, 69060 bytes
- `02_footsteps/movement_footstepsloop_slow_loop_48kHz_16bit_0.46s_01_s30.wav` — 0.458s, 48000 Hz, 2 channels, 88036 bytes
- `02_footsteps/movement_footstepsloop_slow_loop_48kHz_16bit_0.49s_02_s30.wav` — 0.494s, 48000 Hz, 2 channels, 94872 bytes
- `02_footsteps/mud_48kHz_16bit_0.26s_01_s31.wav` — 0.260s, 48000 Hz, 2 channels, 49952 bytes
- `02_footsteps/mud_steps_48kHz_16bit_1.02s_03_s32.wav` — 1.018s, 48000 Hz, 2 channels, 195568 bytes
- `02_footsteps/mud_steps_48kHz_16bit_1.03s_01_s32.wav` — 1.033s, 48000 Hz, 2 channels, 198312 bytes
- `02_footsteps/mud_steps_48kHz_16bit_1.19s_02_s32.wav` — 1.187s, 48000 Hz, 2 channels, 227952 bytes
- `02_footsteps/s_walking_on_snow_covered_gravel_48kHz_16bit_0.48s_01_s02.wav` — 0.477s, 48000 Hz, 2 channels, 91604 bytes
- `02_footsteps/s_walking_on_snow_covered_gravel_48kHz_16bit_0.65s_03_s02.wav` — 0.650s, 48000 Hz, 2 channels, 124760 bytes
- `02_footsteps/s_walking_on_snow_covered_gravel_48kHz_16bit_0.69s_02_s02.wav` — 0.694s, 48000 Hz, 2 channels, 133244 bytes
- `02_footsteps/s_walking_on_snow_covered_gravel_and_ice_48kHz_16bit_0.44s_01_s02.wav` — 0.442s, 48000 Hz, 2 channels, 84984 bytes
- `02_footsteps/s_walking_on_snow_covered_gravel_and_ice_48kHz_16bit_0.63s_02_s02.wav` — 0.630s, 48000 Hz, 2 channels, 121004 bytes
- `02_footsteps/s_walking_on_snow_covered_gravel_and_ice_48kHz_16bit_0.64s_03_s02.wav` — 0.637s, 48000 Hz, 2 channels, 122396 bytes
- `02_footsteps/sand_48kHz_16bit_0.32s_02_s03.wav` — 0.320s, 48000 Hz, 2 channels, 61408 bytes
- `02_footsteps/sand_48kHz_16bit_0.3s_03_s03.wav` — 0.300s, 48000 Hz, 2 channels, 57556 bytes
- `02_footsteps/sand_48kHz_16bit_0.41s_04_s03.wav` — 0.406s, 48000 Hz, 2 channels, 77952 bytes
- `02_footsteps/sand_48kHz_16bit_0.44s_01_s03.wav` — 0.443s, 48000 Hz, 2 channels, 85012 bytes
- `02_footsteps/snow_48kHz_16bit_0.37s_01_s12.wav` — 0.374s, 48000 Hz, 2 channels, 71896 bytes
- `02_footsteps/snow_48kHz_16bit_0.37s_02_s12.wav` — 0.374s, 48000 Hz, 2 channels, 71896 bytes
- `02_footsteps/snow_48kHz_16bit_0.37s_03_s12.wav` — 0.374s, 48000 Hz, 2 channels, 71896 bytes
- `02_footsteps/snow_48kHz_16bit_0.37s_04_s12.wav` — 0.374s, 48000 Hz, 2 channels, 71896 bytes
- `02_footsteps/soil_steps_48kHz_16bit_1.09s_01_s32.wav` — 1.092s, 48000 Hz, 2 channels, 209728 bytes
- `02_footsteps/stone_48kHz_16bit_0.29s_01_s31.wav` — 0.293s, 48000 Hz, 2 channels, 56392 bytes
- `02_footsteps/wood_48kHz_16bit_0.25s_01_s12.wav` — 0.250s, 48000 Hz, 2 channels, 47968 bytes
- `02_footsteps/wood_48kHz_16bit_0.25s_02_s12.wav` — 0.252s, 48000 Hz, 2 channels, 48348 bytes
- `02_footsteps/wood_48kHz_16bit_0.25s_03_s12.wav` — 0.251s, 48000 Hz, 2 channels, 48312 bytes
- `02_footsteps/wood_48kHz_16bit_0.25s_04_s12.wav` — 0.252s, 48000 Hz, 2 channels, 48336 bytes
- `03_movement_cloth_gear/armor_48kHz_16bit_0.45s_01_s35.wav` — 0.448s, 48000 Hz, 2 channels, 86016 bytes
- `03_movement_cloth_gear/bag_zipper_48kHz_16bit_6.98s_01_s27.wav` — 6.983s, 48000 Hz, 2 channels, 1340696 bytes
- `03_movement_cloth_gear/blanket_movement_48kHz_16bit_2.04s_01_s27.wav` — 2.040s, 48000 Hz, 2 channels, 391700 bytes
- `03_movement_cloth_gear/blanket_movement_48kHz_16bit_2.17s_03_s27.wav` — 2.166s, 48000 Hz, 2 channels, 415952 bytes
- `03_movement_cloth_gear/blanket_movement_48kHz_16bit_3.16s_02_s27.wav` — 3.162s, 48000 Hz, 2 channels, 607084 bytes
- `03_movement_cloth_gear/chainmail_48kHz_16bit_0.51s_01_s35.wav` — 0.510s, 48000 Hz, 2 channels, 98000 bytes
- `03_movement_cloth_gear/chainmail_48kHz_16bit_0.54s_02_s35.wav` — 0.539s, 48000 Hz, 2 channels, 103544 bytes
- `03_movement_cloth_gear/cloth_48kHz_16bit_1.55s_01_s26.wav` — 1.554s, 48000 Hz, 2 channels, 298356 bytes
- `03_movement_cloth_gear/cloth_48kHz_16bit_1.5s_02_s26.wav` — 1.503s, 48000 Hz, 2 channels, 288680 bytes
- `03_movement_cloth_gear/cloth_48kHz_16bit_1.75s_03_s26.wav` — 1.750s, 48000 Hz, 2 channels, 336004 bytes
- `03_movement_cloth_gear/cloth_heavy_48kHz_16bit_0.37s_01_s35.wav` — 0.371s, 48000 Hz, 2 channels, 71236 bytes
- `03_movement_cloth_gear/movement_jump_48kHz_16bit_0.16s_02_s30.wav` — 0.162s, 48000 Hz, 2 channels, 31144 bytes
- `03_movement_cloth_gear/movement_jump_48kHz_16bit_0.16s_03_s30.wav` — 0.162s, 48000 Hz, 2 channels, 31128 bytes
- `03_movement_cloth_gear/movement_jump_48kHz_16bit_0.39s_01_s30.wav` — 0.392s, 48000 Hz, 2 channels, 75296 bytes
- `03_movement_cloth_gear/velcro_48kHz_16bit_0.64s_03_s26.wav` — 0.635s, 48000 Hz, 2 channels, 122000 bytes
- `03_movement_cloth_gear/velcro_48kHz_16bit_0.82s_02_s26.wav` — 0.822s, 48000 Hz, 2 channels, 157828 bytes
- `03_movement_cloth_gear/velcro_48kHz_16bit_1.04s_01_s26.wav` — 1.042s, 48000 Hz, 2 channels, 200096 bytes
- `05_combat_ranged/arrow_feathers_48kHz_16bit_0.53s_01_s32.wav` — 0.534s, 48000 Hz, 2 channels, 102484 bytes
- `05_combat_ranged/arrow_grab_from_quiver_48kHz_16bit_0.62s_01_s32.wav` — 0.624s, 48000 Hz, 2 channels, 119828 bytes
- `05_combat_ranged/arrow_grab_from_quiver_48kHz_16bit_1.23s_02_s32.wav` — 1.231s, 48000 Hz, 2 channels, 236336 bytes
- `05_combat_ranged/arrow_return_to_quiver_48kHz_16bit_0.52s_02_s32.wav` — 0.517s, 48000 Hz, 2 channels, 99400 bytes
- `05_combat_ranged/arrow_return_to_quiver_48kHz_16bit_0.73s_01_s32.wav` — 0.726s, 48000 Hz, 2 channels, 139416 bytes

### Hits/blocks/material impacts

- `10_impacts_materials/chop_48kHz_16bit_0.24s_01_s14.wav` — 0.240s, 48000 Hz, 2 channels, 46172 bytes
- `10_impacts_materials/crack_48kHz_16bit_1.69s_01_s04.wav` — 1.691s, 48000 Hz, 2 channels, 324800 bytes
- `10_impacts_materials/crack_48kHz_16bit_1.94s_02_s04.wav` — 1.936s, 48000 Hz, 2 channels, 371800 bytes
- `10_impacts_materials/crack_48kHz_16bit_2.54s_03_s04.wav` — 2.535s, 48000 Hz, 2 channels, 486832 bytes
- `10_impacts_materials/glass_48kHz_16bit_0.21s_01_s12.wav` — 0.210s, 48000 Hz, 2 channels, 40288 bytes
- `10_impacts_materials/glass_48kHz_16bit_0.21s_02_s12.wav` — 0.210s, 48000 Hz, 2 channels, 40288 bytes
- `10_impacts_materials/glass_heavy_48kHz_16bit_0.24s_01_s12.wav` — 0.241s, 48000 Hz, 2 channels, 46360 bytes
- `10_impacts_materials/glass_heavy_48kHz_16bit_0.43s_02_s12.wav` — 0.429s, 48000 Hz, 2 channels, 82416 bytes
- `10_impacts_materials/heavy_thud_48kHz_16bit_0.51s_01_s12.wav` — 0.505s, 48000 Hz, 2 channels, 97024 bytes
- `10_impacts_materials/heavy_thud_48kHz_16bit_0.57s_02_s12.wav` — 0.572s, 48000 Hz, 2 channels, 109876 bytes
- `10_impacts_materials/impact_bell_heavy_48kHz_16bit_0.7s_03_s12.wav` — 0.697s, 48000 Hz, 2 channels, 133924 bytes
- `10_impacts_materials/impact_bell_heavy_48kHz_16bit_1.48s_01_s12.wav` — 1.480s, 48000 Hz, 2 channels, 284240 bytes
- `10_impacts_materials/impact_bell_heavy_48kHz_16bit_1.74s_02_s12.wav` — 1.741s, 48000 Hz, 2 channels, 334292 bytes
- `10_impacts_materials/impact_generic_light_48kHz_16bit_0.12s_02_s12.wav` — 0.118s, 48000 Hz, 2 channels, 22608 bytes
- `10_impacts_materials/impact_generic_light_48kHz_16bit_0.14s_01_s12.wav` — 0.139s, 48000 Hz, 2 channels, 26672 bytes
- `10_impacts_materials/impact_generic_light_48kHz_16bit_0.14s_03_s12.wav` — 0.140s, 48000 Hz, 2 channels, 26848 bytes
- `10_impacts_materials/impact_glass_heavy_48kHz_16bit_0.25s_01_s12.wav` — 0.247s, 48000 Hz, 2 channels, 47500 bytes
- `10_impacts_materials/impact_glass_light_48kHz_16bit_0.21s_01_s12.wav` — 0.210s, 48000 Hz, 2 channels, 40288 bytes
- `10_impacts_materials/impact_glass_medium_48kHz_16bit_0.54s_01_s12.wav` — 0.543s, 48000 Hz, 2 channels, 104372 bytes
- `10_impacts_materials/impact_glass_medium_48kHz_16bit_0.54s_02_s12.wav` — 0.543s, 48000 Hz, 2 channels, 104372 bytes
- `10_impacts_materials/impact_glass_medium_48kHz_16bit_0.54s_03_s12.wav` — 0.543s, 48000 Hz, 2 channels, 104372 bytes
- `10_impacts_materials/impact_meat_48kHz_16bit_0.5s_01_s44.wav` — 0.500s, 48000 Hz, 2 channels, 96044 bytes
- `10_impacts_materials/impact_meat_48kHz_16bit_0.5s_02_s44.wav` — 0.500s, 48000 Hz, 2 channels, 96044 bytes
- `10_impacts_materials/impact_metal_48kHz_16bit_0.48s_01_s44.wav` — 0.482s, 48000 Hz, 2 channels, 92508 bytes
- `10_impacts_materials/impact_metal_light_48kHz_16bit_0.24s_03_s12.wav` — 0.236s, 48000 Hz, 2 channels, 45316 bytes
- `10_impacts_materials/impact_metal_light_48kHz_16bit_0.25s_02_s12.wav` — 0.252s, 48000 Hz, 2 channels, 48400 bytes
- `10_impacts_materials/impact_metal_light_48kHz_16bit_0.35s_01_s12.wav` — 0.351s, 48000 Hz, 2 channels, 67528 bytes
- `10_impacts_materials/impact_metal_medium_48kHz_16bit_0.12s_01_s12.wav` — 0.119s, 48000 Hz, 2 channels, 22920 bytes
- `10_impacts_materials/impact_mining_48kHz_16bit_0.81s_02_s12.wav` — 0.809s, 48000 Hz, 2 channels, 155392 bytes
- `10_impacts_materials/impact_mining_48kHz_16bit_0.87s_01_s12.wav` — 0.867s, 48000 Hz, 2 channels, 166420 bytes
- `10_impacts_materials/impact_mining_48kHz_16bit_0.8s_03_s12.wav` — 0.805s, 48000 Hz, 2 channels, 154544 bytes
- `10_impacts_materials/impact_plank_medium_48kHz_16bit_0.55s_02_s12.wav` — 0.549s, 48000 Hz, 2 channels, 105508 bytes
- `10_impacts_materials/impact_plank_medium_48kHz_16bit_0.55s_03_s12.wav` — 0.548s, 48000 Hz, 2 channels, 105288 bytes
- `10_impacts_materials/impact_plank_medium_48kHz_16bit_0.5s_01_s12.wav` — 0.499s, 48000 Hz, 2 channels, 95928 bytes
- `10_impacts_materials/impact_soft_heavy_48kHz_16bit_0.57s_01_s12.wav` — 0.572s, 48000 Hz, 2 channels, 109932 bytes
- `10_impacts_materials/impact_wood_48kHz_16bit_0.45s_01_s44.wav` — 0.455s, 48000 Hz, 2 channels, 87340 bytes
- `10_impacts_materials/impactwood_48kHz_16bit_1.85s_02_s04.wav` — 1.849s, 48000 Hz, 2 channels, 355120 bytes
- `10_impacts_materials/impactwood_48kHz_16bit_2.2s_01_s04.wav` — 2.205s, 48000 Hz, 2 channels, 423356 bytes
- `10_impacts_materials/impactwood_48kHz_16bit_2.8s_03_s04.wav` — 2.796s, 48000 Hz, 2 channels, 536780 bytes
- `10_impacts_materials/metal_48kHz_16bit_0.14s_02_s12.wav` — 0.143s, 48000 Hz, 2 channels, 27588 bytes
- `10_impacts_materials/metal_48kHz_16bit_0.27s_01_s12.wav` — 0.272s, 48000 Hz, 2 channels, 52224 bytes
- `10_impacts_materials/metal_fork_scrape_48kHz_16bit_0.87s_02_s32.wav` — 0.875s, 48000 Hz, 2 channels, 167996 bytes
- `10_impacts_materials/metal_fork_scrape_48kHz_16bit_1.2s_01_s32.wav` — 1.200s, 48000 Hz, 2 channels, 230476 bytes
- `10_impacts_materials/metal_heavy_48kHz_16bit_0.12s_03_s12.wav` — 0.117s, 48000 Hz, 2 channels, 22568 bytes
- `10_impacts_materials/metal_heavy_48kHz_16bit_0.17s_01_s12.wav` — 0.168s, 48000 Hz, 2 channels, 32236 bytes
- `10_impacts_materials/metal_heavy_48kHz_16bit_0.36s_02_s12.wav` — 0.359s, 48000 Hz, 2 channels, 69028 bytes
- `10_impacts_materials/stone_48kHz_16bit_0.54s_02_s56.wav` — 0.544s, 48000 Hz, 2 channels, 104412 bytes
- `10_impacts_materials/stone_48kHz_16bit_0.5s_01_s44.wav` — 0.500s, 48000 Hz, 2 channels, 96044 bytes
- `10_impacts_materials/vial_glass_close_48kHz_16bit_0.48s_01_s32.wav` — 0.481s, 48000 Hz, 2 channels, 92360 bytes
- `10_impacts_materials/vial_glass_open_48kHz_16bit_0.32s_01_s32.wav` — 0.324s, 48000 Hz, 2 channels, 62168 bytes
- `10_impacts_materials/vial_glass_uncork_48kHz_16bit_0.43s_01_s32.wav` — 0.427s, 48000 Hz, 2 channels, 81940 bytes
- `10_impacts_materials/wood_48kHz_16bit_0.22s_05_s29.wav` — 0.225s, 48000 Hz, 2 channels, 43240 bytes
- `10_impacts_materials/wood_48kHz_16bit_0.24s_04_s29.wav` — 0.242s, 48000 Hz, 2 channels, 46584 bytes
- `10_impacts_materials/wood_48kHz_16bit_0.25s_06_s29.wav` — 0.253s, 48000 Hz, 2 channels, 48672 bytes
- `10_impacts_materials/wood_48kHz_16bit_0.33s_01_s12.wav` — 0.333s, 48000 Hz, 2 channels, 63920 bytes
- `10_impacts_materials/wood_48kHz_16bit_0.33s_02_s12.wav` — 0.333s, 48000 Hz, 2 channels, 63920 bytes
- `10_impacts_materials/wood_48kHz_16bit_0.33s_03_s12.wav` — 0.333s, 48000 Hz, 2 channels, 63920 bytes
- `10_impacts_materials/wood_bowl_spoon_48kHz_16bit_0.42s_03_s32.wav` — 0.424s, 48000 Hz, 2 channels, 81404 bytes
- `10_impacts_materials/wood_bowl_spoon_48kHz_16bit_0.54s_02_s32.wav` — 0.543s, 48000 Hz, 2 channels, 104248 bytes
- `10_impacts_materials/wood_bowl_spoon_48kHz_16bit_0.75s_01_s32.wav` — 0.747s, 48000 Hz, 2 channels, 143528 bytes
- `10_impacts_materials/wood_break_48kHz_16bit_0.4s_01_s32.wav` — 0.396s, 48000 Hz, 2 channels, 76100 bytes
- `10_impacts_materials/wood_break_48kHz_16bit_0.76s_02_s32.wav` — 0.755s, 48000 Hz, 2 channels, 145016 bytes

### Hits/blocks/scrapes

- `04_combat_melee/handsaw_knife_scrape_48kHz_16bit_0.46s_02_s32.wav` — 0.461s, 48000 Hz, 2 channels, 88580 bytes
- `04_combat_melee/handsaw_knife_scrape_48kHz_16bit_0.75s_01_s32.wav` — 0.753s, 48000 Hz, 2 channels, 144596 bytes
- `04_combat_melee/metal_knife_scrape_48kHz_16bit_1.19s_03_s32.wav` — 1.194s, 48000 Hz, 2 channels, 229268 bytes
- `04_combat_melee/metal_knife_scrape_48kHz_16bit_1.77s_01_s32.wav` — 1.765s, 48000 Hz, 2 channels, 338928 bytes
- `04_combat_melee/metal_knife_scrape_48kHz_16bit_1.9s_02_s32.wav` — 1.898s, 48000 Hz, 2 channels, 364392 bytes
- `04_combat_melee/punch_48kHz_16bit_0.35s_02_s12.wav` — 0.348s, 48000 Hz, 2 channels, 66944 bytes
- `04_combat_melee/punch_48kHz_16bit_0.36s_01_s12.wav` — 0.363s, 48000 Hz, 2 channels, 69652 bytes
- `04_combat_melee/punch_heavy_48kHz_16bit_0.54s_02_s12.wav` — 0.536s, 48000 Hz, 2 channels, 102948 bytes
- `04_combat_melee/punch_heavy_48kHz_16bit_0.65s_01_s12.wav` — 0.649s, 48000 Hz, 2 channels, 124660 bytes
- `04_combat_melee/slap_48kHz_16bit_0.48s_01_s27.wav` — 0.480s, 48000 Hz, 2 channels, 92188 bytes
- `04_combat_melee/wpn_punch_48kHz_16bit_0.1s_01_s30.wav` — 0.103s, 48000 Hz, 2 channels, 19860 bytes
- `04_combat_melee/wpn_punch_48kHz_16bit_0.1s_02_s30.wav` — 0.103s, 48000 Hz, 2 channels, 19808 bytes
- `04_combat_melee/wpn_punch_48kHz_16bit_0.1s_03_s30.wav` — 0.104s, 48000 Hz, 2 channels, 19928 bytes

### Human/comedic/hurt

- `09_human_nonverbal/clap_48kHz_16bit_2.68s_01_s27.wav` — 2.677s, 48000 Hz, 2 channels, 514028 bytes
- `09_human_nonverbal/cough_48kHz_16bit_0.89s_03_s27.wav` — 0.891s, 48000 Hz, 2 channels, 171068 bytes
- `09_human_nonverbal/cough_48kHz_16bit_1.07s_01_s27.wav` — 1.071s, 48000 Hz, 2 channels, 205660 bytes
- `09_human_nonverbal/cough_48kHz_16bit_1.38s_02_s27.wav` — 1.384s, 48000 Hz, 2 channels, 265752 bytes
- `09_human_nonverbal/heartbeat_48kHz_16bit_1.48s_01_s38.wav` — 1.476s, 48000 Hz, 2 channels, 283428 bytes
- `09_human_nonverbal/laugh_48kHz_16bit_1.14s_01_s27.wav` — 1.138s, 48000 Hz, 2 channels, 218552 bytes
- `09_human_nonverbal/scream_48kHz_16bit_0.28s_02_s29.wav` — 0.280s, 48000 Hz, 2 channels, 53804 bytes
- `09_human_nonverbal/scream_48kHz_16bit_0.3s_01_s29.wav` — 0.295s, 48000 Hz, 2 channels, 56760 bytes
- `09_human_nonverbal/scream_48kHz_16bit_1.72s_03_s27.wav` — 1.716s, 48000 Hz, 2 channels, 329420 bytes
- `09_human_nonverbal/shh_48kHz_16bit_0.55s_01_s27.wav` — 0.548s, 48000 Hz, 2 channels, 105216 bytes
- `09_human_nonverbal/sniff_48kHz_16bit_1.01s_01_s27.wav` — 1.010s, 48000 Hz, 2 channels, 193948 bytes

### Hurt/recovery

- `09_human_nonverbal/breath_48kHz_16bit_4.27s_01_s27.wav` — 4.268s, 48000 Hz, 2 channels, 819424 bytes
- `09_human_nonverbal/freakedbreath_48kHz_16bit_1.24s_01_s27.wav` — 1.237s, 48000 Hz, 2 channels, 237544 bytes
- `09_human_nonverbal/gasp_48kHz_16bit_5.2s_01_s27.wav` — 5.198s, 48000 Hz, 2 channels, 998148 bytes

### Items/paper/books/interaction

- `12_items_inventory/bottle_48kHz_16bit_0.43s_01_s35.wav` — 0.433s, 48000 Hz, 2 channels, 83224 bytes
- `12_items_inventory/bottle_clay_uncork_48kHz_16bit_0.33s_01_s32.wav` — 0.330s, 48000 Hz, 2 channels, 63436 bytes
- `12_items_inventory/bottle_cork_48kHz_16bit_0.49s_01_s32.wav` — 0.489s, 48000 Hz, 2 channels, 93884 bytes
- `12_items_inventory/bottle_glass_cork_twist_48kHz_16bit_0.62s_01_s32.wav` — 0.618s, 48000 Hz, 2 channels, 118688 bytes
- `12_items_inventory/bottle_pills_shake_48kHz_16bit_0.27s_01_s32.wav` — 0.274s, 48000 Hz, 2 channels, 52732 bytes
- `12_items_inventory/bottle_pills_shake_48kHz_16bit_0.27s_02_s32.wav` — 0.268s, 48000 Hz, 2 channels, 51528 bytes
- `12_items_inventory/bottle_plastic_lid_screw_48kHz_16bit_1.09s_01_s32.wav` — 1.093s, 48000 Hz, 2 channels, 209884 bytes
- `12_items_inventory/bottle_plastic_lid_unscrew_48kHz_16bit_1.24s_01_s32.wav` — 1.244s, 48000 Hz, 2 channels, 238936 bytes
- `12_items_inventory/bottle_uncork_48kHz_16bit_0.48s_01_s32.wav` — 0.479s, 48000 Hz, 2 channels, 91968 bytes
- `12_items_inventory/coin_48kHz_16bit_0.3s_05_s35.wav` — 0.304s, 48000 Hz, 2 channels, 58504 bytes
- `12_items_inventory/coin_48kHz_16bit_0.48s_03_s56.wav` — 0.482s, 48000 Hz, 2 channels, 92660 bytes
- `12_items_inventory/coin_48kHz_16bit_0.4s_01_s56.wav` — 0.399s, 48000 Hz, 2 channels, 76728 bytes
- `12_items_inventory/coin_48kHz_16bit_0.61s_02_s56.wav` — 0.606s, 48000 Hz, 2 channels, 116320 bytes
- `12_items_inventory/coin_48kHz_16bit_0.6s_06_s35.wav` — 0.601s, 48000 Hz, 2 channels, 115384 bytes
- `12_items_inventory/coin_48kHz_16bit_0.97s_04_s35.wav` — 0.968s, 48000 Hz, 2 channels, 185940 bytes
- `12_items_inventory/coin_flip_48kHz_16bit_0.35s_01_s32.wav` — 0.352s, 48000 Hz, 2 channels, 67672 bytes
- `12_items_inventory/coin_spin_fall_48kHz_16bit_1.43s_01_s32.wav` — 1.432s, 48000 Hz, 2 channels, 274964 bytes
- `12_items_inventory/coins_shake_48kHz_16bit_1.06s_01_s32.wav` — 1.057s, 48000 Hz, 2 channels, 203052 bytes
- `12_items_inventory/gem_48kHz_16bit_0.17s_02_s56.wav` — 0.175s, 48000 Hz, 2 channels, 33580 bytes
- `12_items_inventory/gem_48kHz_16bit_0.25s_01_s56.wav` — 0.247s, 48000 Hz, 2 channels, 47440 bytes
- `12_items_inventory/item_48kHz_16bit_0.34s_03_s56.wav` — 0.341s, 48000 Hz, 2 channels, 65592 bytes
- `12_items_inventory/item_48kHz_16bit_0.41s_01_s56.wav` — 0.408s, 48000 Hz, 2 channels, 78324 bytes
- `12_items_inventory/item_48kHz_16bit_0.44s_02_s56.wav` — 0.438s, 48000 Hz, 2 channels, 84112 bytes
- `12_items_inventory/item_gem_48kHz_16bit_0.24s_01_s56.wav` — 0.242s, 48000 Hz, 2 channels, 46508 bytes
- `12_items_inventory/item_stone_48kHz_16bit_0.28s_02_s56.wav` — 0.275s, 48000 Hz, 2 channels, 52912 bytes
- `12_items_inventory/item_stone_48kHz_16bit_0.39s_03_s56.wav` — 0.393s, 48000 Hz, 2 channels, 75528 bytes
- `12_items_inventory/item_stone_48kHz_16bit_0.66s_01_s56.wav` — 0.657s, 48000 Hz, 2 channels, 126124 bytes
- `12_items_inventory/item_wood_48kHz_16bit_0.26s_02_s56.wav` — 0.263s, 48000 Hz, 2 channels, 50628 bytes
- `12_items_inventory/item_wood_48kHz_16bit_0.49s_01_s56.wav` — 0.494s, 48000 Hz, 2 channels, 94916 bytes
- `12_items_inventory/money_48kHz_16bit_0.24s_02_s26.wav` — 0.241s, 48000 Hz, 2 channels, 46396 bytes
- `12_items_inventory/money_48kHz_16bit_0.62s_03_s26.wav` — 0.621s, 48000 Hz, 2 channels, 119220 bytes
- `12_items_inventory/money_48kHz_16bit_0.78s_01_s26.wav` — 0.785s, 48000 Hz, 2 channels, 150748 bytes
- `13_paper_books/book_close_48kHz_16bit_0.23s_01_s14.wav` — 0.231s, 48000 Hz, 2 channels, 44320 bytes
- `13_paper_books/book_flip_48kHz_16bit_0.23s_02_s14.wav` — 0.231s, 48000 Hz, 2 channels, 44320 bytes
- `13_paper_books/book_flip_48kHz_16bit_0.43s_01_s14.wav` — 0.430s, 48000 Hz, 2 channels, 82688 bytes
- `13_paper_books/book_open_48kHz_16bit_0.15s_01_s14.wav` — 0.154s, 48000 Hz, 2 channels, 29560 bytes
- `13_paper_books/book_page_48kHz_16bit_0.73s_02_s32.wav` — 0.733s, 48000 Hz, 2 channels, 140716 bytes
- `13_paper_books/book_page_48kHz_16bit_1.49s_01_s32.wav` — 1.491s, 48000 Hz, 2 channels, 286340 bytes
- `13_paper_books/cover_paper_tear_48kHz_16bit_1.15s_01_s32.wav` — 1.154s, 48000 Hz, 2 channels, 221688 bytes
- `13_paper_books/cover_paper_tear_48kHz_16bit_1.38s_02_s32.wav` — 1.375s, 48000 Hz, 2 channels, 264104 bytes
- `13_paper_books/crumples_48kHz_16bit_1.78s_01_s27.wav` — 1.782s, 48000 Hz, 2 channels, 342256 bytes
- `13_paper_books/crumples_48kHz_16bit_2.19s_02_s27.wav` — 2.187s, 48000 Hz, 2 channels, 419880 bytes
- `13_paper_books/page_flip_48kHz_16bit_0.73s_01_s14.wav` — 0.729s, 48000 Hz, 2 channels, 139924 bytes
- `13_paper_books/page_turn_48kHz_16bit_0.59s_01_s27.wav` — 0.589s, 48000 Hz, 2 channels, 113072 bytes
- `13_paper_books/pageturn_48kHz_16bit_1.81s_01_s27.wav` — 1.810s, 48000 Hz, 2 channels, 347496 bytes
- `13_paper_books/paper_sketchbook_page_flips_48kHz_16bit_7.22s_01_s27.wav` — 7.218s, 48000 Hz, 2 channels, 1385828 bytes

### Miscellaneous potentially useful

- `08_creatures_monsters/creature_death_48kHz_16bit_1.06s_01_s56.wav` — 1.060s, 48000 Hz, 2 channels, 203532 bytes
- `08_creatures_monsters/creature_hurt_48kHz_16bit_0.47s_04_s57.wav` — 0.465s, 48000 Hz, 2 channels, 89380 bytes
- `08_creatures_monsters/creature_hurt_48kHz_16bit_0.49s_03_s57.wav` — 0.495s, 48000 Hz, 2 channels, 95084 bytes
- `08_creatures_monsters/creature_hurt_48kHz_16bit_0.52s_01_s56.wav` — 0.523s, 48000 Hz, 2 channels, 100500 bytes
- `08_creatures_monsters/creature_hurt_48kHz_16bit_0.54s_02_s56.wav` — 0.536s, 48000 Hz, 2 channels, 102868 bytes
- `20_tools_household/camera_48kHz_16bit_0.37s_02_s26.wav` — 0.368s, 48000 Hz, 2 channels, 70700 bytes
- `20_tools_household/camera_48kHz_16bit_0.47s_01_s26.wav` — 0.468s, 48000 Hz, 2 channels, 89840 bytes
- `20_tools_household/camera_48kHz_16bit_1.9s_03_s26.wav` — 1.902s, 48000 Hz, 2 channels, 365248 bytes
- `20_tools_household/handsaw_sawing_wood_48kHz_16bit_6.37s_01_s32.wav` — 6.374s, 48000 Hz, 2 channels, 1223900 bytes
- `20_tools_household/impact_plate_heavy_48kHz_16bit_0.35s_02_s12.wav` — 0.352s, 48000 Hz, 2 channels, 67696 bytes
- `20_tools_household/impact_plate_heavy_48kHz_16bit_0.49s_01_s12.wav` — 0.489s, 48000 Hz, 2 channels, 93868 bytes
- `20_tools_household/impact_plate_heavy_48kHz_16bit_0.49s_03_s12.wav` — 0.494s, 48000 Hz, 2 channels, 94932 bytes
- `20_tools_household/impact_plate_light_48kHz_16bit_0.54s_01_s12.wav` — 0.542s, 48000 Hz, 2 channels, 104192 bytes
- `20_tools_household/impact_plate_light_48kHz_16bit_0.65s_02_s12.wav` — 0.655s, 48000 Hz, 2 channels, 125744 bytes
- `20_tools_household/metal_hammer_hit_48kHz_16bit_1.47s_02_s32.wav` — 1.472s, 48000 Hz, 2 channels, 282572 bytes
- `20_tools_household/metal_hammer_hit_48kHz_16bit_1.62s_01_s32.wav` — 1.616s, 48000 Hz, 2 channels, 310264 bytes
- `20_tools_household/scissors_close_48kHz_16bit_0.18s_01_s32.wav` — 0.180s, 48000 Hz, 2 channels, 34644 bytes

### Misses/swishes

- `04_combat_melee/swing_48kHz_16bit_0.14s_05_s35.wav` — 0.138s, 48000 Hz, 2 channels, 26548 bytes
- `04_combat_melee/swing_48kHz_16bit_0.15s_04_s35.wav` — 0.146s, 48000 Hz, 2 channels, 28044 bytes
- `04_combat_melee/swing_48kHz_16bit_0.22s_06_s35.wav` — 0.218s, 48000 Hz, 2 channels, 41836 bytes
- `04_combat_melee/swing_48kHz_16bit_0.32s_01_s37.wav` — 0.317s, 48000 Hz, 2 channels, 60948 bytes
- `04_combat_melee/swing_48kHz_16bit_0.36s_03_s37.wav` — 0.359s, 48000 Hz, 2 channels, 68976 bytes
- `04_combat_melee/swing_48kHz_16bit_0.57s_02_s37.wav` — 0.575s, 48000 Hz, 2 channels, 110444 bytes
- `04_combat_melee/swosh_48kHz_16bit_0.28s_01_s45.wav` — 0.277s, 48000 Hz, 2 channels, 53196 bytes
- `04_combat_melee/swosh_48kHz_16bit_0.2s_02_s45.wav` — 0.202s, 48000 Hz, 2 channels, 38864 bytes
- `04_combat_melee/swosh_48kHz_16bit_0.58s_03_s45.wav` — 0.576s, 48000 Hz, 2 channels, 110544 bytes
- `04_combat_melee/tin_whistle_whoosh_48kHz_16bit_0.37s_01_s32.wav` — 0.365s, 48000 Hz, 2 channels, 70164 bytes

### Status/recovery/transition candidates

- `07_magic_spells/freeze_48kHz_16bit_2.04s_01_s33.wav` — 2.036s, 48000 Hz, 2 channels, 390892 bytes
- `07_magic_spells/magic_48kHz_16bit_0.7s_07_s35.wav` — 0.696s, 48000 Hz, 2 channels, 133736 bytes
- `07_magic_spells/magic_48kHz_16bit_1.11s_06_s09.wav` — 1.110s, 48000 Hz, 2 channels, 213240 bytes
- `07_magic_spells/magic_48kHz_16bit_1.38s_02_s09.wav` — 1.380s, 48000 Hz, 2 channels, 264996 bytes
- `07_magic_spells/magic_48kHz_16bit_1.44s_05_s09.wav` — 1.438s, 48000 Hz, 2 channels, 276192 bytes
- `07_magic_spells/magic_48kHz_16bit_1.61s_01_s09.wav` — 1.609s, 48000 Hz, 2 channels, 308976 bytes
- `07_magic_spells/magic_48kHz_16bit_1.82s_03_s09.wav` — 1.821s, 48000 Hz, 2 channels, 349600 bytes
- `07_magic_spells/magic_48kHz_16bit_1.91s_04_s09.wav` — 1.911s, 48000 Hz, 2 channels, 366916 bytes
- `07_magic_spells/magic_48kHz_16bit_2.4s_09_s29.wav` — 2.400s, 48000 Hz, 2 channels, 460844 bytes
- `07_magic_spells/magic_48kHz_16bit_2.67s_08_s29.wav` — 2.667s, 48000 Hz, 2 channels, 512044 bytes
- `07_magic_spells/spell_48kHz_16bit_0.53s_03_s56.wav` — 0.525s, 48000 Hz, 2 channels, 100860 bytes
- `07_magic_spells/spell_48kHz_16bit_0.63s_02_s56.wav` — 0.633s, 48000 Hz, 2 channels, 121576 bytes
- `07_magic_spells/spell_48kHz_16bit_2.83s_01_s35.wav` — 2.834s, 48000 Hz, 2 channels, 544216 bytes
- `07_magic_spells/teleport_48kHz_16bit_0.32s_02_s54.wav` — 0.316s, 48000 Hz, 2 channels, 60668 bytes
- `07_magic_spells/teleport_48kHz_16bit_1.62s_01_s25.wav` — 1.616s, 48000 Hz, 2 channels, 310388 bytes
- `07_magic_spells/teleport_48kHz_16bit_1.74s_03_s54.wav` — 1.744s, 48000 Hz, 2 channels, 334884 bytes
- `18_sci_fi_energy/force_field_48kHz_16bit_0.94s_01_s15.wav` — 0.938s, 48000 Hz, 2 channels, 180144 bytes
- `18_sci_fi_energy/force_field_48kHz_16bit_0.94s_02_s15.wav` — 0.943s, 48000 Hz, 2 channels, 181100 bytes
- `18_sci_fi_energy/zap_48kHz_16bit_0.97s_01_s11.wav` — 0.974s, 48000 Hz, 2 channels, 187092 bytes

### Stumble/fall

- `03_movement_cloth_gear/jump_land_48kHz_16bit_0.41s_01_s21.wav` — 0.408s, 48000 Hz, 2 channels, 78456 bytes
- `03_movement_cloth_gear/jump_land_48kHz_16bit_0.43s_02_s21.wav` — 0.431s, 48000 Hz, 2 channels, 82720 bytes
- `03_movement_cloth_gear/movement_jump_landing_48kHz_16bit_0.07s_01_s30.wav` — 0.072s, 48000 Hz, 2 channels, 13960 bytes
- `03_movement_cloth_gear/movement_jump_landing_48kHz_16bit_0.08s_02_s30.wav` — 0.082s, 48000 Hz, 2 channels, 15788 bytes
- `03_movement_cloth_gear/movement_jump_landing_48kHz_16bit_0.1s_03_s30.wav` — 0.100s, 48000 Hz, 2 channels, 19272 bytes

### UI

- `01_ui_interface/alert_48kHz_16bit_0.31s_01_s29.wav` — 0.314s, 48000 Hz, 2 channels, 60288 bytes
- `01_ui_interface/alert_48kHz_16bit_0.3s_02_s29.wav` — 0.302s, 48000 Hz, 2 channels, 58024 bytes
- `01_ui_interface/back_48kHz_16bit_0.06s_01_s13.wav` — 0.064s, 48000 Hz, 2 channels, 12312 bytes
- `01_ui_interface/back_48kHz_16bit_0.07s_02_s13.wav` — 0.070s, 48000 Hz, 2 channels, 13456 bytes
- `01_ui_interface/back_48kHz_16bit_0.09s_03_s13.wav` — 0.093s, 48000 Hz, 2 channels, 17880 bytes
- `01_ui_interface/click_48kHz_16bit_0.09s_03_s16.wav` — 0.094s, 48000 Hz, 2 channels, 18060 bytes
- `01_ui_interface/click_48kHz_16bit_0.11s_01_s18.wav` — 0.107s, 48000 Hz, 2 channels, 20512 bytes
- `01_ui_interface/click_48kHz_16bit_0.16s_04_s18.wav` — 0.160s, 48000 Hz, 2 channels, 30724 bytes
- `01_ui_interface/click_48kHz_16bit_0.28s_02_s27.wav` — 0.280s, 48000 Hz, 2 channels, 53720 bytes
- `01_ui_interface/close_48kHz_16bit_0.15s_01_s13.wav` — 0.148s, 48000 Hz, 2 channels, 28420 bytes
- `01_ui_interface/confirm_48kHz_16bit_0.29s_01_s13.wav` — 0.290s, 48000 Hz, 2 channels, 55696 bytes
- `01_ui_interface/confirm_48kHz_16bit_0.54s_02_s13.wav` — 0.539s, 48000 Hz, 2 channels, 103536 bytes
- `01_ui_interface/cursor_rollover_48kHz_16bit_0.2s_01_s01.wav` — 0.196s, 48000 Hz, 2 channels, 37680 bytes
- `01_ui_interface/error_48kHz_16bit_0.16s_01_s13.wav` — 0.165s, 48000 Hz, 2 channels, 31640 bytes
- `01_ui_interface/error_48kHz_16bit_0.53s_02_s13.wav` — 0.533s, 48000 Hz, 2 channels, 102472 bytes
- `01_ui_interface/hover_48kHz_16bit_0.06s_02_s16.wav` — 0.057s, 48000 Hz, 2 channels, 11052 bytes
- `01_ui_interface/hover_48kHz_16bit_0.23s_01_s16.wav` — 0.227s, 48000 Hz, 2 channels, 43684 bytes
- `01_ui_interface/load_48kHz_16bit_1.72s_01_s18.wav` — 1.719s, 48000 Hz, 2 channels, 330048 bytes
- `01_ui_interface/menu_move_48kHz_16bit_0.04s_01_s30.wav` — 0.039s, 48000 Hz, 2 channels, 7592 bytes
- `01_ui_interface/menu_move_48kHz_16bit_0.06s_02_s30.wav` — 0.060s, 48000 Hz, 2 channels, 11588 bytes
- `01_ui_interface/menu_move_48kHz_16bit_0.08s_03_s30.wav` — 0.076s, 48000 Hz, 2 channels, 14616 bytes
- `01_ui_interface/menu_select_48kHz_16bit_0.31s_02_s30.wav` — 0.305s, 48000 Hz, 2 channels, 58612 bytes
- `01_ui_interface/menu_select_48kHz_16bit_0.35s_01_s30.wav` — 0.351s, 48000 Hz, 2 channels, 67460 bytes
- `01_ui_interface/menu_select_48kHz_16bit_0.73s_03_s30.wav` — 0.733s, 48000 Hz, 2 channels, 140728 bytes
- `01_ui_interface/open_48kHz_16bit_0.15s_01_s13.wav` — 0.148s, 48000 Hz, 2 channels, 28420 bytes
- `01_ui_interface/positive_48kHz_16bit_1.72s_01_s18.wav` — 1.719s, 48000 Hz, 2 channels, 330048 bytes
- `01_ui_interface/power_up_48kHz_16bit_0.61s_01_s11.wav` — 0.610s, 48000 Hz, 2 channels, 117088 bytes
- `01_ui_interface/power_up_48kHz_16bit_0.63s_02_s11.wav` — 0.630s, 48000 Hz, 2 channels, 120924 bytes
- `01_ui_interface/power_up_48kHz_16bit_0.8s_03_s11.wav` — 0.798s, 48000 Hz, 2 channels, 153268 bytes
- `01_ui_interface/save_48kHz_16bit_3.43s_01_s18.wav` — 3.433s, 48000 Hz, 2 channels, 659188 bytes
- `01_ui_interface/select_48kHz_16bit_0.04s_01_s13.wav` — 0.043s, 48000 Hz, 2 channels, 8356 bytes
- `01_ui_interface/select_48kHz_16bit_0.04s_02_s13.wav` — 0.043s, 48000 Hz, 2 channels, 8356 bytes
- `01_ui_interface/sounds_powerup_48kHz_16bit_0.25s_01_s30.wav` — 0.254s, 48000 Hz, 2 channels, 48872 bytes
- `01_ui_interface/sounds_powerup_48kHz_16bit_0.45s_02_s30.wav` — 0.448s, 48000 Hz, 2 channels, 86132 bytes
- `01_ui_interface/sounds_powerup_48kHz_16bit_0.61s_03_s30.wav` — 0.608s, 48000 Hz, 2 channels, 116844 bytes
- `01_ui_interface/toggle_48kHz_16bit_0.14s_01_s13.wav` — 0.139s, 48000 Hz, 2 channels, 26796 bytes
- `01_ui_interface/toggle_48kHz_16bit_0.14s_02_s13.wav` — 0.139s, 48000 Hz, 2 channels, 26796 bytes
- `01_ui_interface/window_open_48kHz_16bit_1.47s_01_s01.wav` — 1.469s, 48000 Hz, 2 channels, 282168 bytes

### Victory/defeat and feedback

- `01_ui_interface/game_over_48kHz_16bit_2.4s_01_s29.wav` — 2.400s, 48000 Hz, 2 channels, 460844 bytes
- `01_ui_interface/negative_48kHz_16bit_0.31s_01_s18.wav` — 0.313s, 48000 Hz, 2 channels, 60224 bytes
- `01_ui_interface/negative_48kHz_16bit_1.72s_02_s18.wav` — 1.719s, 48000 Hz, 2 channels, 330048 bytes
- `01_ui_interface/victory_48kHz_16bit_2.4s_02_s29.wav` — 2.400s, 48000 Hz, 2 channels, 460844 bytes
- `01_ui_interface/victory_48kHz_16bit_2.67s_01_s29.wav` — 2.667s, 48000 Hz, 2 channels, 512044 bytes
- `01_ui_interface/victory_48kHz_16bit_2.67s_03_s29.wav` — 2.667s, 48000 Hz, 2 channels, 512044 bytes

### Whistle

- `09_human_nonverbal/attention_whistle_48kHz_16bit_0.68s_01_s27.wav` — 0.683s, 48000 Hz, 2 channels, 131128 bytes

## Deleted

- `500-game-sound-effects/04_combat_melee/knife_draw_48kHz_16bit_0.47s_01_s32.wav` — Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.
- `500-game-sound-effects/04_combat_melee/knife_sheathe_48kHz_16bit_0.6s_01_s32.wav` — Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.
- `500-game-sound-effects/04_combat_melee/knife_slash_48kHz_16bit_0.51s_02_s14.wav` — Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.
- `500-game-sound-effects/04_combat_melee/knife_slash_48kHz_16bit_0.56s_01_s14.wav` — Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.
- `500-game-sound-effects/04_combat_melee/sword_clash_48kHz_16bit_0.77s_03_s32.wav` — Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.
- `500-game-sound-effects/04_combat_melee/sword_clash_48kHz_16bit_1.19s_02_s32.wav` — Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.
- `500-game-sound-effects/04_combat_melee/sword_clash_48kHz_16bit_1.31s_01_s32.wav` — Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.
- `500-game-sound-effects/04_combat_melee/sword_draw_48kHz_16bit_0.36s_01_s35.wav` — Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.
- `500-game-sound-effects/04_combat_melee/sword_draw_48kHz_16bit_0.43s_02_s35.wav` — Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.
- `500-game-sound-effects/04_combat_melee/sword_sound_48kHz_16bit_0.54s_01_s47.wav` — Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.
- `500-game-sound-effects/04_combat_melee/sword_unsheathe_48kHz_16bit_0.4s_01_s35.wav` — Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.
- `500-game-sound-effects/04_combat_melee/wpn_sword_48kHz_16bit_0.11s_01_s30.wav` — Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.
- `500-game-sound-effects/04_combat_melee/wpn_sword_48kHz_16bit_0.1s_02_s30.wav` — Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.
- `500-game-sound-effects/05_combat_ranged/ammo_48kHz_16bit_0.25s_01_s29.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/arrow_48kHz_16bit_0.39s_01_s29.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/bow_48kHz_16bit_0.4s_01_s37.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/empty_weapon_48kHz_16bit_0.12s_02_s29.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/empty_weapon_48kHz_16bit_0.1s_01_s30.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/gun_48kHz_16bit_0.74s_01_s29.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/gun_48kHz_16bit_0.77s_02_s29.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/gunshot_48kHz_16bit_0.04s_04_s30.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/gunshot_48kHz_16bit_0.05s_03_s30.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/gunshot_48kHz_16bit_0.16s_01_s30.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/gunshot_48kHz_16bit_0.1s_02_s30.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/reload_48kHz_16bit_0.49s_01_s29.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/shoot_48kHz_16bit_0.28s_02_s29.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/shoot_48kHz_16bit_0.44s_01_s29.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/shoot_48kHz_16bit_0.47s_03_s29.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/shot_48kHz_16bit_0.19s_01_s55.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/shot_48kHz_16bit_0.28s_02_s55.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/shotgun_48kHz_16bit_0.37s_01_s30.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/shotgun_48kHz_16bit_0.63s_02_s30.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/shotgun_48kHz_16bit_0.65s_03_s30.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/wpn_cannon_48kHz_16bit_0.9s_01_s30.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/wpn_cannon_48kHz_16bit_1.29s_02_s30.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/05_combat_ranged/wpn_cannon_48kHz_16bit_2.87s_03_s30.wav` — Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.
- `500-game-sound-effects/06_explosions_destruction/bit_bomb_explosion_48kHz_16bit_0.58s_01_s19.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/exp_cluster_48kHz_16bit_1.86s_01_s30.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/exp_cluster_48kHz_16bit_2.47s_03_s30.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/exp_cluster_48kHz_16bit_2.73s_02_s30.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/explosion_48kHz_16bit_0.53s_03_s29.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/explosion_48kHz_16bit_0.59s_01_s29.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/explosion_48kHz_16bit_0.79s_02_s29.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/explosion_crunch_48kHz_16bit_0.78s_01_s15.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/explosion_crunch_48kHz_16bit_1.26s_03_s15.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/explosion_crunch_48kHz_16bit_1.36s_02_s15.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/explosion_low_48kHz_16bit_1s_02_s15.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/explosion_low_48kHz_16bit_2s_01_s15.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/explosion_synth_48kHz_16bit_1.18s_01_s46.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/nenad_simic_muffled_distant_explosion_48kHz_16bit_3.25s_01_s22.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/retro_explosion_48kHz_16bit_1.06s_02_s55.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/06_explosions_destruction/retro_explosion_48kHz_16bit_1.25s_01_s55.wav` — Explicit bomb/explosion/destruction effect; unrelated to school melee combat.
- `500-game-sound-effects/07_magic_spells/fireball_48kHz_16bit_1.96s_01_s10.wav` — Explicit offensive fire spell/fireball; no elemental attacks in this game.
- `500-game-sound-effects/07_magic_spells/spell_fire_48kHz_16bit_0.58s_07_s56.wav` — Explicit offensive fire spell/fireball; no elemental attacks in this game.
- `500-game-sound-effects/07_magic_spells/spell_fire_48kHz_16bit_0.76s_02_s56.wav` — Explicit offensive fire spell/fireball; no elemental attacks in this game.
- `500-game-sound-effects/07_magic_spells/spell_fire_48kHz_16bit_0.9s_01_s56.wav` — Explicit offensive fire spell/fireball; no elemental attacks in this game.
- `500-game-sound-effects/07_magic_spells/spell_fire_48kHz_16bit_1.24s_05_s56.wav` — Explicit offensive fire spell/fireball; no elemental attacks in this game.
- `500-game-sound-effects/07_magic_spells/spell_fire_48kHz_16bit_1.35s_04_s56.wav` — Explicit offensive fire spell/fireball; no elemental attacks in this game.
- `500-game-sound-effects/07_magic_spells/spell_fire_48kHz_16bit_1.68s_03_s56.wav` — Explicit offensive fire spell/fireball; no elemental attacks in this game.
- `500-game-sound-effects/07_magic_spells/spell_fire_48kHz_16bit_1s_06_s56.wav` — Explicit offensive fire spell/fireball; no elemental attacks in this game.
- `500-game-sound-effects/08_creatures_monsters/ghost_moan_48kHz_16bit_3.02s_01_s43.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/ghost_moan_48kHz_16bit_5.14s_02_s43.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/ghost_moan_48kHz_16bit_5.74s_03_s43.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/giant_48kHz_16bit_0.55s_03_s35.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/giant_48kHz_16bit_0.69s_02_s35.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/giant_48kHz_16bit_0.6s_01_s35.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/goblin_48kHz_16bit_0.18s_01_s34.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/goblin_48kHz_16bit_0.29s_02_s34.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/monster_48kHz_16bit_0.36s_01_s24.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/ogre_48kHz_16bit_0.4s_01_s35.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/ogre_48kHz_16bit_0.57s_03_s35.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/ogre_48kHz_16bit_0.59s_02_s35.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/roar_48kHz_16bit_0.64s_01_s56.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/roar_48kHz_16bit_0.94s_02_s56.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/roar_48kHz_16bit_0.95s_03_s56.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/slime_48kHz_16bit_0.27s_02_s35.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/slime_48kHz_16bit_0.31s_03_s35.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/slime_48kHz_16bit_0.35s_01_s35.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/zombie_48kHz_16bit_0.49s_02_s36.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/zombie_48kHz_16bit_0.66s_01_s36.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/08_creatures_monsters/zombie_48kHz_16bit_0.77s_03_s36.wav` — Explicit supernatural creature/monster vocal or effect; unrelated character theme.
- `500-game-sound-effects/17_machinery_technology/engine_48kHz_16bit_5s_01_s15.wav` — Explicit engine/space/robot machinery; unrelated school setting.
- `500-game-sound-effects/17_machinery_technology/engine_circular_48kHz_16bit_5s_01_s15.wav` — Explicit engine/space/robot machinery; unrelated school setting.
- `500-game-sound-effects/17_machinery_technology/engine_circular_48kHz_16bit_5s_02_s15.wav` — Explicit engine/space/robot machinery; unrelated school setting.
- `500-game-sound-effects/17_machinery_technology/robot_48kHz_16bit_0.81s_01_s27.wav` — Explicit engine/space/robot machinery; unrelated school setting.
- `500-game-sound-effects/17_machinery_technology/robotics_48kHz_16bit_0.84s_01_s27.wav` — Explicit engine/space/robot machinery; unrelated school setting.
- `500-game-sound-effects/17_machinery_technology/space_engine_48kHz_16bit_5s_01_s15.wav` — Explicit engine/space/robot machinery; unrelated school setting.
- `500-game-sound-effects/17_machinery_technology/space_engine_48kHz_16bit_5s_02_s15.wav` — Explicit engine/space/robot machinery; unrelated school setting.
- `500-game-sound-effects/18_sci_fi_energy/laser_48kHz_16bit_0.82s_02_s11.wav` — Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.
- `500-game-sound-effects/18_sci_fi_energy/laser_48kHz_16bit_0.94s_03_s11.wav` — Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.
- `500-game-sound-effects/18_sci_fi_energy/laser_48kHz_16bit_1.06s_01_s11.wav` — Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.
- `500-game-sound-effects/18_sci_fi_energy/laser_heavy_48kHz_16bit_0.68s_01_s15.wav` — Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.
- `500-game-sound-effects/18_sci_fi_energy/laser_heavy_48kHz_16bit_0.72s_02_s15.wav` — Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.
- `500-game-sound-effects/18_sci_fi_energy/laser_light_48kHz_16bit_0.24s_01_s15.wav` — Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.
- `500-game-sound-effects/18_sci_fi_energy/laser_light_48kHz_16bit_0.25s_02_s15.wav` — Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.
- `500-game-sound-effects/18_sci_fi_energy/phaser_down_48kHz_16bit_0.27s_02_s11.wav` — Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.
- `500-game-sound-effects/18_sci_fi_energy/phaser_down_48kHz_16bit_0.43s_01_s11.wav` — Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.
- `500-game-sound-effects/18_sci_fi_energy/phaser_down_48kHz_16bit_0.46s_03_s11.wav` — Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.
- `500-game-sound-effects/18_sci_fi_energy/phaser_up_48kHz_16bit_0.38s_02_s11.wav` — Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.
- `500-game-sound-effects/18_sci_fi_energy/phaser_up_48kHz_16bit_0.46s_01_s11.wav` — Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.
- `500-game-sound-effects/18_sci_fi_energy/phaser_up_48kHz_16bit_0.48s_03_s11.wav` — Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.

## Duplicates

No byte-for-byte duplicate audio files found. Different takes and processed variants retained.

## Manual selection

Listen to retained files before selecting sounds. Generic magic/status feedback, creature hurt, gear rattles, scrapes, atmospheres, impacts and water sounds were intentionally kept when plausible or uncertain. No dedicated phone or eating bite was confidently identified; drink/swallow, UI and inventory candidates remain available for audition.
