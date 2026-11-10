# Running source-to-playback audit

Changed pixels: max RGBA difference >32, divided by union of visible pixels. Silhouette: alpha occupancy XOR / visible union. All adjacent pairs include loop closure. Near-duplicate flag: silhouette or pixel changed percentage <15; diagnostic, not proof of identical art.

## Candidate sources

### Pixel Runner Back-View Sprite Sheet.png

2172x724; 795796 bytes; alpha true; poses 6; processor referenced true; runtime run_up.

SHA-256: 342acabf72184a067c2815ae8535029aa793b0ef1aed5fac2f2f3d80a7ba4607

Full-sheet alpha bounds: {"left":0,"top":9,"width":2125,"height":715,"baseline":723,"centerX":1062.5,"pixels":511857}

Detection threshold 1; analysis region null.

Pose 0: bounds {"left":65,"top":112,"width":244,"height":520}; isolated RGBA crop SHA-256 a04d8336ce8cbc2364678710d06ff5209655107c9c800631c1eae1517a6b8204

Pose 1: bounds {"left":432,"top":113,"width":246,"height":519}; isolated RGBA crop SHA-256 b99426f1a02eeb00794ddcc9534885166691b38ae5d970e1b24ecce4f0592544

Pose 2: bounds {"left":787,"top":112,"width":243,"height":520}; isolated RGBA crop SHA-256 89668d38b8884c1db95b9157d5c6c2262f87412f3bc06f90cd1661d738007c29

Pose 3: bounds {"left":1143,"top":112,"width":257,"height":520}; isolated RGBA crop SHA-256 a2e6b3b4a93c8dbb72ad481fba13786c009cfa67c5dd1f0dc8c245d427f54027

Pose 4: bounds {"left":1526,"top":114,"width":234,"height":497}; isolated RGBA crop SHA-256 30d1a898c4973e7b41b1f2db8054eba7764559aa1a2731cb977548f694fd1933

Pose 5: bounds {"left":1878,"top":112,"width":247,"height":520}; isolated RGBA crop SHA-256 574b90aeea7f1592bbedfc55b0a5b2216a76392c54a8f0f40fc49261cfff5593

### Pixel Running Cycle Sprite Sheet.png

1983x793; 1502280 bytes; alpha true; poses 10; processor referenced true; runtime run_side.

SHA-256: 495d52385b7d49779b951f0f9c8a2dfbbaed95e4cf2807c9c42e3863af86a48d

Full-sheet alpha bounds: {"left":0,"top":0,"width":1983,"height":793,"baseline":792,"centerX":991.5,"pixels":1077317}

Detection threshold 16; analysis region null.

Pose 0: bounds {"left":13,"top":251,"width":195,"height":335}; isolated RGBA crop SHA-256 24f31cdc65eebb71e96abf5acb86d2279835bf0caca7e3ec041dd52ed6a3e095

Pose 1: bounds {"left":223,"top":251,"width":172,"height":343}; isolated RGBA crop SHA-256 cfeb8a4455dff7d60da570024d00ca955a4f7db6bedf9f62c64b22111395cb38

Pose 2: bounds {"left":434,"top":251,"width":152,"height":343}; isolated RGBA crop SHA-256 5637734e7785d7c771c29d0c0dcd44e155b4adfee5e63e12fe999ad818208347

Pose 3: bounds {"left":612,"top":251,"width":171,"height":343}; isolated RGBA crop SHA-256 dd10b4094847534d4eb6b7d2bb6aee776509b425f75c32e688791693b86cdc44

Pose 4: bounds {"left":765,"top":245,"width":225,"height":341}; isolated RGBA crop SHA-256 a562632adece655c6e72873b83ae68c5366b8292f795d109006d5a5974c1fe55

Pose 5: bounds {"left":959,"top":251,"width":253,"height":303}; isolated RGBA crop SHA-256 1d1149837f346203cd4e5cd142b7b89dd3c83c2e1a3261f72a5fa3bb1db075c4

Pose 6: bounds {"left":1227,"top":251,"width":146,"height":343}; isolated RGBA crop SHA-256 670169d09b1279165e0bf42a7324a4a5ce0e592060c2696004b246a3b782458c

Pose 7: bounds {"left":1410,"top":251,"width":156,"height":343}; isolated RGBA crop SHA-256 484234c9d69165de8d6aed51f80f5bc0bf0922413d11a056f26e11658d99bfb1

Pose 8: bounds {"left":1600,"top":251,"width":160,"height":343}; isolated RGBA crop SHA-256 359df04c012497e1b9106f51e64bd38365516f4e2ce47af1635b949be68b80b9

Pose 9: bounds {"left":1755,"top":251,"width":205,"height":336}; isolated RGBA crop SHA-256 469fdfea402be8ef21414fca73bf45b4215e6aabf00ea0ff7500be71e066324f

### Pixel-Art Runner Sprite Sheet.png

2172x724; 805289 bytes; alpha true; poses 6; processor referenced true; runtime not selected.

SHA-256: 39a5ade1b938bf0fef5969c9fbf018a8ef1f825c7a689856418e1592e84cc058

Full-sheet alpha bounds: {"left":0,"top":7,"width":2134,"height":717,"baseline":723,"centerX":1067,"pixels":520820}

Detection threshold 1; analysis region null.

Pose 0: bounds {"left":64,"top":114,"width":243,"height":532}; isolated RGBA crop SHA-256 730a3c81c51980ea48c64e44d4094b4d9ee2b5681b2d26128c6a6e4c882ef6ed

Pose 1: bounds {"left":417,"top":112,"width":245,"height":530}; isolated RGBA crop SHA-256 2e673023f462327d63a12abf80657e06282476a8d3c06a12c3436a98a063223e

Pose 2: bounds {"left":773,"top":114,"width":247,"height":524}; isolated RGBA crop SHA-256 e657070a0d7d8768f0938ad773cce91e5219faccccf3dbdfabe42234a0d0d1fb

Pose 3: bounds {"left":1143,"top":111,"width":247,"height":529}; isolated RGBA crop SHA-256 03bd43a77f97b092073f356620f76203a64ffa8344a4ab7ad92f69ce8205460d

Pose 4: bounds {"left":1511,"top":114,"width":243,"height":514}; isolated RGBA crop SHA-256 089d909d5d4a80e4b667778a55c03501d1d5d97dac8e66bd200128056cb05f7d

Pose 5: bounds {"left":1867,"top":113,"width":241,"height":529}; isolated RGBA crop SHA-256 50b244b4806f23fe1b0c58bf6cea4105153fd89c419350c30c1f17b4f1a942b7

### Six-Frame Pixel Art Run Cycle.png

2172x724; 1100419 bytes; alpha true; poses 6; processor referenced true; runtime run_down.

SHA-256: a9c887dd505276f4ca509f348ad52868d527de686e422459d4e87e7c42e03b51

Full-sheet alpha bounds: {"left":0,"top":0,"width":2172,"height":724,"baseline":723,"centerX":1086,"pixels":737827}

Detection threshold 1; analysis region {"left":0,"top":95,"width":2172,"height":520}.

Pose 0: bounds {"left":7,"top":95,"width":309,"height":520}; isolated RGBA crop SHA-256 71befe0fd567b064ae16a34dd1de88ef90403400293c9dff2b18037e63f2083e

Pose 1: bounds {"left":416,"top":95,"width":266,"height":482}; isolated RGBA crop SHA-256 7b65e053686244c25884bdc6dfd94a61c474dd64ee64996e7b05856afdf06569

Pose 2: bounds {"left":765,"top":95,"width":269,"height":520}; isolated RGBA crop SHA-256 ea1501a6f70915e041192a313a434f1403aafae8b7934807151a6bba90b2985a

Pose 3: bounds {"left":1131,"top":95,"width":272,"height":520}; isolated RGBA crop SHA-256 91eae410d8d96b14c26b91811e494318a1927599e39aa6ce4f0c1c0c04ff12f6

Pose 4: bounds {"left":1495,"top":95,"width":265,"height":520}; isolated RGBA crop SHA-256 b457310938feaee9f4f6e389d29c9f446810725a3bc9f0f3f83da604584384c8

Pose 5: bounds {"left":1864,"top":95,"width":264,"height":520}; isolated RGBA crop SHA-256 4b0095a11a5b01108c1d6109619a74b69c12c13810f9ef12d2125abdf2c8c6e8

## RUN_SIDE

Source: Pixel Running Cycle Sprite Sheet.png

Source SHA-256: 495d52385b7d49779b951f0f9c8a2dfbbaed95e4cf2807c9c42e3863af86a48d

Source matches processor report: true. Poses 10; processed 10; FPS 16; repeat -1; skipMissedFrames true.

Playback order: 0,1,2,3,4,5,6,7,8,9

Exact duplicates: none.

Near-duplicate candidates: [{"frames":[2,7],"changedPercent":33.52,"silhouetteChangedPercent":11.21,"normalizedMeanDifference":0.1001},{"frames":[3,8],"changedPercent":41.78,"silhouetteChangedPercent":12.67,"normalizedMeanDifference":0.1224},{"frames":[6,7],"changedPercent":39.96,"silhouetteChangedPercent":13.32,"normalizedMeanDifference":0.1163},{"frames":[7,8],"changedPercent":38.44,"silhouetteChangedPercent":13.95,"normalizedMeanDifference":0.1153}]

### Exact runtime frames

Frame 0 (playback position 0)

File: public/assets/player/movement/run_side/0.png

SHA-256: 8125cd0e9528ee4208706d5047e936e55d908b1d0782b1bd8203aa39bc5c2ecc

Phaser key: player-runSide; duration 70 ms

Alpha bounds: {"left":60,"top":16,"width":136,"height":234,"baseline":249,"centerX":128,"pixels":17299}

Isolated source crop SHA-256: 24f31cdc65eebb71e96abf5acb86d2279835bf0caca7e3ec041dd52ed6a3e095

Frame 1 (playback position 1)

File: public/assets/player/movement/run_side/1.png

SHA-256: cdfab8c1321aa355012face05e36b8c6cfb5b8b748c519f14011bfce9a70d702

Phaser key: player-runSide-1; duration 45 ms

Alpha bounds: {"left":68,"top":10,"width":120,"height":240,"baseline":249,"centerX":128,"pixels":16088}

Isolated source crop SHA-256: cfeb8a4455dff7d60da570024d00ca955a4f7db6bedf9f62c64b22111395cb38

Frame 2 (playback position 2)

File: public/assets/player/movement/run_side/2.png

SHA-256: 76aad6a470c6a9e4e9f564c419ae2905dddb212037f4928d25a2877bbdd4b6ff

Phaser key: player-runSide-2; duration 45 ms

Alpha bounds: {"left":75,"top":10,"width":106,"height":240,"baseline":249,"centerX":128,"pixels":16125}

Isolated source crop SHA-256: 5637734e7785d7c771c29d0c0dcd44e155b4adfee5e63e12fe999ad818208347

Frame 3 (playback position 3)

File: public/assets/player/movement/run_side/3.png

SHA-256: be653409e1a49a5c55b41d165905d1f03ed1e360250ff8aba03cd78e1fb660b8

Phaser key: player-runSide-3; duration 55 ms

Alpha bounds: {"left":68,"top":10,"width":120,"height":240,"baseline":249,"centerX":128,"pixels":16104}

Isolated source crop SHA-256: dd10b4094847534d4eb6b7d2bb6aee776509b425f75c32e688791693b86cdc44

Frame 4 (playback position 4)

File: public/assets/player/movement/run_side/4.png

SHA-256: cc72efc4d59e325c3dd6af7b212dde74bb4073276ff08f98155181b5c08105ee

Phaser key: player-runSide-4; duration 65 ms

Alpha bounds: {"left":49,"top":11,"width":157,"height":239,"baseline":249,"centerX":127.5,"pixels":18242}

Isolated source crop SHA-256: a562632adece655c6e72873b83ae68c5366b8292f795d109006d5a5974c1fe55

Frame 5 (playback position 5)

File: public/assets/player/movement/run_side/5.png

SHA-256: d174bd11b0fa8b4447e67c79c699945f3ca3bdb15aebfa150b8a32a20c01d61e

Phaser key: player-runSide-5; duration 70 ms

Alpha bounds: {"left":39,"top":38,"width":177,"height":212,"baseline":249,"centerX":127.5,"pixels":17771}

Isolated source crop SHA-256: 1d1149837f346203cd4e5cd142b7b89dd3c83c2e1a3261f72a5fa3bb1db075c4

Frame 6 (playback position 6)

File: public/assets/player/movement/run_side/6.png

SHA-256: ccb3d387e0a7dc7760f1d605c2bb07109df7dfcf7dfe5ca001b527e4dcfd85b1

Phaser key: player-runSide-6; duration 45 ms

Alpha bounds: {"left":77,"top":10,"width":102,"height":240,"baseline":249,"centerX":128,"pixels":15745}

Isolated source crop SHA-256: 670169d09b1279165e0bf42a7324a4a5ce0e592060c2696004b246a3b782458c

Frame 7 (playback position 7)

File: public/assets/player/movement/run_side/7.png

SHA-256: 34ffb951159cbed553c559b327671e04cb62c97f704c3b3e9703a17d44102be6

Phaser key: player-runSide-7; duration 45 ms

Alpha bounds: {"left":73,"top":10,"width":109,"height":240,"baseline":249,"centerX":127.5,"pixels":15819}

Isolated source crop SHA-256: 484234c9d69165de8d6aed51f80f5bc0bf0922413d11a056f26e11658d99bfb1

Frame 8 (playback position 8)

File: public/assets/player/movement/run_side/8.png

SHA-256: fec9572034b198d62da947362da0643e45398c93f5becf9afad31665da6856ff

Phaser key: player-runSide-8; duration 55 ms

Alpha bounds: {"left":72,"top":10,"width":112,"height":240,"baseline":249,"centerX":128,"pixels":16128}

Isolated source crop SHA-256: 359df04c012497e1b9106f51e64bd38365516f4e2ce47af1635b949be68b80b9

Frame 9 (playback position 9)

File: public/assets/player/movement/run_side/9.png

SHA-256: 39ee1c1f9fda0d4a6f6211f2388e8cf55583aa42384a74b9566a77d89590cc6c

Phaser key: player-runSide-9; duration 45 ms

Alpha bounds: {"left":56,"top":15,"width":143,"height":235,"baseline":249,"centerX":127.5,"pixels":17524}

Isolated source crop SHA-256: 469fdfea402be8ef21414fca73bf45b4215e6aabf00ea0ff7500be71e066324f

### Adjacent transitions (including loop closure)

| From -> To | Changed pixels | Silhouette changed | Mean normalized difference | Flag |
|---|---:|---:|---:|---|
| 0 -> 1 | 63.07% | 39.21% | 0.2244 | - |
| 1 -> 2 | 61.85% | 34.75% | 0.2123 | - |
| 2 -> 3 | 49.3% | 17.8% | 0.1453 | - |
| 3 -> 4 | 69.81% | 44.81% | 0.2509 | - |
| 4 -> 5 | 76.61% | 48.61% | 0.2684 | - |
| 5 -> 6 | 80.49% | 56.17% | 0.2976 | large silhouette change |
| 6 -> 7 | 39.96% | 13.32% | 0.1163 | near duplicate |
| 7 -> 8 | 38.44% | 13.95% | 0.1153 | near duplicate |
| 8 -> 9 | 67.17% | 44.94% | 0.2435 | - |
| 9 -> 0 | 47.22% | 20.14% | 0.1437 | - |

## RUN_DOWN

Source: Six-Frame Pixel Art Run Cycle.png

Source SHA-256: a9c887dd505276f4ca509f348ad52868d527de686e422459d4e87e7c42e03b51

Source matches processor report: true. Poses 6; processed 6; FPS 12; repeat -1; skipMissedFrames true.

Playback order: 0,1,2,3,4,5

Exact duplicates: none.

Near-duplicate candidates: [{"frames":[2,3],"changedPercent":37.78,"silhouetteChangedPercent":14.55,"normalizedMeanDifference":0.1044},{"frames":[3,5],"changedPercent":27.13,"silhouetteChangedPercent":12.07,"normalizedMeanDifference":0.0777}]

### Exact runtime frames

Frame 0 (playback position 0)

File: public/assets/player/movement/run_down/0.png

SHA-256: 88e6e6e15e0932a6899bda6a32d0ad6fe24dcbcac940779ca9c01a1f8c69eaf0

Phaser key: player-runDown; duration 83.33333333333333 ms

Alpha bounds: {"left":58,"top":10,"width":140,"height":240,"baseline":249,"centerX":128,"pixels":20895}

Isolated source crop SHA-256: 71befe0fd567b064ae16a34dd1de88ef90403400293c9dff2b18037e63f2083e

Frame 1 (playback position 1)

File: public/assets/player/movement/run_down/1.png

SHA-256: d285a857fffeb06dd9f723f84ed660de61c5063a3e4fdf653dca0f5cde04e13f

Phaser key: player-runDown-1; duration 83.33333333333333 ms

Alpha bounds: {"left":66,"top":28,"width":123,"height":222,"baseline":249,"centerX":127.5,"pixels":18624}

Isolated source crop SHA-256: 7b65e053686244c25884bdc6dfd94a61c474dd64ee64996e7b05856afdf06569

Frame 2 (playback position 2)

File: public/assets/player/movement/run_down/2.png

SHA-256: fd9ea7596a974c02f964e0d4ec96251693ab8817087422c6576983eea5ff674d

Phaser key: player-runDown-2; duration 83.33333333333333 ms

Alpha bounds: {"left":66,"top":10,"width":124,"height":240,"baseline":249,"centerX":128,"pixels":20086}

Isolated source crop SHA-256: ea1501a6f70915e041192a313a434f1403aafae8b7934807151a6bba90b2985a

Frame 3 (playback position 3)

File: public/assets/player/movement/run_down/3.png

SHA-256: 4e1c2446671854c096027fe299532284223673ab216b689a63744536f31e815c

Phaser key: player-runDown-3; duration 83.33333333333333 ms

Alpha bounds: {"left":65,"top":10,"width":125,"height":240,"baseline":249,"centerX":127.5,"pixels":19881}

Isolated source crop SHA-256: 91eae410d8d96b14c26b91811e494318a1927599e39aa6ce4f0c1c0c04ff12f6

Frame 4 (playback position 4)

File: public/assets/player/movement/run_down/4.png

SHA-256: e183146917961b75f965072cf966b50a88696bca167fc96890c4ddd66b7c10db

Phaser key: player-runDown-4; duration 83.33333333333333 ms

Alpha bounds: {"left":67,"top":10,"width":121,"height":240,"baseline":249,"centerX":127.5,"pixels":18625}

Isolated source crop SHA-256: b457310938feaee9f4f6e389d29c9f446810725a3bc9f0f3f83da604584384c8

Frame 5 (playback position 5)

File: public/assets/player/movement/run_down/5.png

SHA-256: 8f673ed172c6ae1a1bd6cfa3290f2d5ad431489547235d0b7c8a8fb6c5589617

Phaser key: player-runDown-5; duration 83.33333333333333 ms

Alpha bounds: {"left":67,"top":10,"width":122,"height":240,"baseline":249,"centerX":128,"pixels":19698}

Isolated source crop SHA-256: 4b0095a11a5b01108c1d6109619a74b69c12c13810f9ef12d2125abdf2c8c6e8

### Adjacent transitions (including loop closure)

| From -> To | Changed pixels | Silhouette changed | Mean normalized difference | Flag |
|---|---:|---:|---:|---|
| 0 -> 1 | 57.45% | 27.89% | 0.1679 | - |
| 1 -> 2 | 54.64% | 21.1% | 0.1516 | - |
| 2 -> 3 | 37.78% | 14.55% | 0.1044 | near duplicate |
| 3 -> 4 | 50.6% | 20.38% | 0.1414 | - |
| 4 -> 5 | 49.93% | 20.26% | 0.1372 | - |
| 5 -> 0 | 51.24% | 22.29% | 0.1406 | - |

## RUN_UP

Source: Pixel Runner Back-View Sprite Sheet.png

Source SHA-256: 342acabf72184a067c2815ae8535029aa793b0ef1aed5fac2f2f3d80a7ba4607

Source matches processor report: true. Poses 6; processed 6; FPS 12; repeat -1; skipMissedFrames true.

Playback order: 0,1,2,3,4,5

Exact duplicates: none.

Near-duplicate candidates: [{"frames":[0,1],"changedPercent":30.92,"silhouetteChangedPercent":13.37,"normalizedMeanDifference":0.0957},{"frames":[0,2],"changedPercent":29.64,"silhouetteChangedPercent":14.28,"normalizedMeanDifference":0.0975},{"frames":[0,3],"changedPercent":20.69,"silhouetteChangedPercent":11.16,"normalizedMeanDifference":0.0717},{"frames":[0,5],"changedPercent":21.36,"silhouetteChangedPercent":8.74,"normalizedMeanDifference":0.0663},{"frames":[1,2],"changedPercent":37.74,"silhouetteChangedPercent":14.04,"normalizedMeanDifference":0.1048},{"frames":[1,3],"changedPercent":25.9,"silhouetteChangedPercent":8.97,"normalizedMeanDifference":0.0691},{"frames":[1,5],"changedPercent":23.43,"silhouetteChangedPercent":10.14,"normalizedMeanDifference":0.0733},{"frames":[2,3],"changedPercent":22.74,"silhouetteChangedPercent":9.76,"normalizedMeanDifference":0.0736},{"frames":[2,5],"changedPercent":28,"silhouetteChangedPercent":12.53,"normalizedMeanDifference":0.0877},{"frames":[3,5],"changedPercent":19.01,"silhouetteChangedPercent":8.23,"normalizedMeanDifference":0.0612}]

### Exact runtime frames

Frame 0 (playback position 0)

File: public/assets/player/movement/run_up/0.png

SHA-256: 49a92b839722c956fc0a0c9b7790e4ddff50b15b5ac61cda5477a92632bb5ad5

Phaser key: player-runUp; duration 83.33333333333333 ms

Alpha bounds: {"left":71,"top":11,"width":113,"height":239,"baseline":249,"centerX":127.5,"pixels":19016}

Isolated source crop SHA-256: a04d8336ce8cbc2364678710d06ff5209655107c9c800631c1eae1517a6b8204

Frame 1 (playback position 1)

File: public/assets/player/movement/run_up/1.png

SHA-256: 34afdbadc4a8a86cd4b15b2e626ae15ca9ea10b00863b31ddc16f327d5411569

Phaser key: player-runUp-1; duration 83.33333333333333 ms

Alpha bounds: {"left":71,"top":10,"width":114,"height":240,"baseline":249,"centerX":128,"pixels":18243}

Isolated source crop SHA-256: b99426f1a02eeb00794ddcc9534885166691b38ae5d970e1b24ecce4f0592544

Frame 2 (playback position 2)

File: public/assets/player/movement/run_up/2.png

SHA-256: de06133b13513a20d67f1dd5651ff89557810ca2930965b6f7ae16029ac9b8b1

Phaser key: player-runUp-2; duration 83.33333333333333 ms

Alpha bounds: {"left":72,"top":10,"width":112,"height":240,"baseline":249,"centerX":128,"pixels":17477}

Isolated source crop SHA-256: 89668d38b8884c1db95b9157d5c6c2262f87412f3bc06f90cd1661d738007c29

Frame 3 (playback position 3)

File: public/assets/player/movement/run_up/3.png

SHA-256: 61ce8caab45cb1c49dcd2417974a3e4521ec2f014333c2695cf512d132452278

Phaser key: player-runUp-3; duration 83.33333333333333 ms

Alpha bounds: {"left":68,"top":10,"width":119,"height":240,"baseline":249,"centerX":127.5,"pixels":18343}

Isolated source crop SHA-256: a2e6b3b4a93c8dbb72ad481fba13786c009cfa67c5dd1f0dc8c245d427f54027

Frame 4 (playback position 4)

File: public/assets/player/movement/run_up/4.png

SHA-256: e5a13dfe2d49c00ba621aadcfce325510950948f436970ed5715f392eb5d41b7

Phaser key: player-runUp-4; duration 83.33333333333333 ms

Alpha bounds: {"left":74,"top":22,"width":108,"height":228,"baseline":249,"centerX":128,"pixels":16803}

Isolated source crop SHA-256: 30d1a898c4973e7b41b1f2db8054eba7764559aa1a2731cb977548f694fd1933

Frame 5 (playback position 5)

File: public/assets/player/movement/run_up/5.png

SHA-256: 08b6c5f38baab3b6b7b3a9528a460af89058d85796d91d37ece7e511577cf80c

Phaser key: player-runUp-5; duration 83.33333333333333 ms

Alpha bounds: {"left":71,"top":10,"width":114,"height":240,"baseline":249,"centerX":128,"pixels":18907}

Isolated source crop SHA-256: 574b90aeea7f1592bbedfc55b0a5b2216a76392c54a8f0f40fc49261cfff5593

### Adjacent transitions (including loop closure)

| From -> To | Changed pixels | Silhouette changed | Mean normalized difference | Flag |
|---|---:|---:|---:|---|
| 0 -> 1 | 30.92% | 13.37% | 0.0957 | near duplicate |
| 1 -> 2 | 37.74% | 14.04% | 0.1048 | near duplicate |
| 2 -> 3 | 22.74% | 9.76% | 0.0736 | near duplicate |
| 3 -> 4 | 48.07% | 23.16% | 0.1438 | - |
| 4 -> 5 | 46.55% | 20.5% | 0.1361 | - |
| 5 -> 0 | 21.36% | 8.74% | 0.0663 | near duplicate |

