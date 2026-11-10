# Running source-to-playback audit

Changed pixels: max RGBA difference >32, divided by union of visible pixels. Silhouette: alpha occupancy XOR / visible union. All adjacent pairs include loop closure. Near-duplicate flag: silhouette or pixel changed percentage <15; diagnostic, not proof of identical art.

## Candidate sources

### 3-run-side.png

4320x760; 1803376 bytes; alpha true; poses 8; processor referenced false; runtime not selected.

SHA-256: c3c6828721340f3b1e784cfa4e81de335dd6d9da2469899f8e46dd9bdba70e42

Full-sheet alpha bounds: {"left":84,"top":24,"width":4122,"height":670,"baseline":693,"centerX":2145,"headCenterX":2232.585,"pixels":901453}

Detection threshold 1; analysis region null.

Pose 0: bounds {"left":84,"top":24,"width":371,"height":665}; isolated RGBA crop SHA-256 5dfb2225dd4ae1f5328a0ceee38e4c904f945289e6281a2103ff83bf98aa1965

Pose 1: bounds {"left":646,"top":24,"width":327,"height":670}; isolated RGBA crop SHA-256 068649612acc8455898e397b89d50e2fe876a86047fc1e6291b37741d067146e

Pose 2: bounds {"left":1212,"top":24,"width":275,"height":660}; isolated RGBA crop SHA-256 45ef7141b3d429662ed4d19069506a507967319d335b2dffe8fca11be675b029

Pose 3: bounds {"left":1716,"top":24,"width":348,"height":670}; isolated RGBA crop SHA-256 2396af6dd01e4b90110366ffcafac10fadbdea03e1fcf1869c58bd5d59b0b16c

Pose 4: bounds {"left":2246,"top":24,"width":367,"height":659}; isolated RGBA crop SHA-256 52c1e96bbe3429837a002b22ccafb5a23b1dbc6f4d226a2b934e5f7cd956a8ab

Pose 5: bounds {"left":2782,"top":24,"width":376,"height":664}; isolated RGBA crop SHA-256 5165b6f83f68a606815b0fb6512615f16c22971df206a81fec69cf758dcbef05

Pose 6: bounds {"left":3352,"top":24,"width":316,"height":651}; isolated RGBA crop SHA-256 8e66d1ab332612278d01c435cca87640239d778c3d0ed32c1878d195be0797dc

Pose 7: bounds {"left":3893,"top":24,"width":313,"height":660}; isolated RGBA crop SHA-256 639d8e049d697ac3fc6a9aa8fd41968a4227046f0b4054303f16a7a85997b38f

### latest-run-side.png

4320x760; 982367 bytes; alpha true; poses 8; processor referenced false; runtime run_side.

SHA-256: 21f742f9f0c062d94476bd91f6d314e9ae18ef32a5e6b11f727c075cd88ebb9b

Full-sheet alpha bounds: {"left":135,"top":24,"width":4032,"height":443,"baseline":466,"centerX":2151,"headCenterX":2190.944,"pixels":505010}

Detection threshold 16; analysis region null.

Pose 0: bounds {"left":135,"top":24,"width":269,"height":441}; isolated RGBA crop SHA-256 f21dce28213edb990179c468bf2f7095aa420783446d9d4e10ff79e622acd48f

Pose 1: bounds {"left":642,"top":24,"width":336,"height":436}; isolated RGBA crop SHA-256 a2f9d99f17051c9198c58633bfa0ef26491dfb1b02cca299af6909bcf0a32052

Pose 2: bounds {"left":1218,"top":24,"width":264,"height":438}; isolated RGBA crop SHA-256 190acc4a6584ba3530810829126d3206acb60fd1cfd6d0a4f4f413ed96b86281

Pose 3: bounds {"left":1793,"top":24,"width":193,"height":437}; isolated RGBA crop SHA-256 7ae6b55915007bea7ddf52dbbd9cb20dc5b24b302c57622a092244b39ba432a6

Pose 4: bounds {"left":2288,"top":24,"width":284,"height":436}; isolated RGBA crop SHA-256 76e1d22d046e6d646b933c48c4e19a48c3563a0ea0cab9072072f28754889de9

Pose 5: bounds {"left":2806,"top":24,"width":327,"height":436}; isolated RGBA crop SHA-256 9eb9df67de21d8cbd48e5a53ef5599341c69c574e7ba0d0eed1e9dd1314e22f6

Pose 6: bounds {"left":3354,"top":24,"width":311,"height":443}; isolated RGBA crop SHA-256 cdc28f3e856c62e31cdffc4134b25dc24c80b5e6e54cba80e00221005fa91154

Pose 7: bounds {"left":3933,"top":24,"width":234,"height":442}; isolated RGBA crop SHA-256 7ff1a7bebadd0cf6d4ffb5f859f282d60750ff8cc199324c6d98d974ebfd67d1

### Pixel Runner Back-View Sprite Sheet.png

2172x724; 795796 bytes; alpha true; poses 6; processor referenced true; runtime run_up.

SHA-256: 342acabf72184a067c2815ae8535029aa793b0ef1aed5fac2f2f3d80a7ba4607

Full-sheet alpha bounds: {"left":0,"top":9,"width":2125,"height":715,"baseline":723,"centerX":1062.5,"headCenterX":1296.643,"pixels":511857}

Detection threshold 1; analysis region null.

Pose 0: bounds {"left":65,"top":112,"width":244,"height":520}; isolated RGBA crop SHA-256 a04d8336ce8cbc2364678710d06ff5209655107c9c800631c1eae1517a6b8204

Pose 1: bounds {"left":432,"top":113,"width":246,"height":519}; isolated RGBA crop SHA-256 b99426f1a02eeb00794ddcc9534885166691b38ae5d970e1b24ecce4f0592544

Pose 2: bounds {"left":787,"top":112,"width":243,"height":520}; isolated RGBA crop SHA-256 89668d38b8884c1db95b9157d5c6c2262f87412f3bc06f90cd1661d738007c29

Pose 3: bounds {"left":1143,"top":112,"width":257,"height":520}; isolated RGBA crop SHA-256 a2e6b3b4a93c8dbb72ad481fba13786c009cfa67c5dd1f0dc8c245d427f54027

Pose 4: bounds {"left":1526,"top":114,"width":234,"height":497}; isolated RGBA crop SHA-256 30d1a898c4973e7b41b1f2db8054eba7764559aa1a2731cb977548f694fd1933

Pose 5: bounds {"left":1878,"top":112,"width":247,"height":520}; isolated RGBA crop SHA-256 574b90aeea7f1592bbedfc55b0a5b2216a76392c54a8f0f40fc49261cfff5593

### Pixel Running Cycle Sprite Sheet.png

1983x793; 1502280 bytes; alpha true; poses 1; processor referenced true; runtime not selected.

SHA-256: 495d52385b7d49779b951f0f9c8a2dfbbaed95e4cf2807c9c42e3863af86a48d

Full-sheet alpha bounds: {"left":0,"top":0,"width":1983,"height":793,"baseline":792,"centerX":991.5,"headCenterX":958.575,"pixels":1077317}

Detection threshold 1; analysis region null.

Pose 0: bounds {"left":0,"top":66,"width":1983,"height":727}; isolated RGBA crop SHA-256 e43d43eaca9ea8f19233e91471857f8fd9111bfd44c72933e238d76e42d13307

### Pixel-Art Runner Sprite Sheet.png

2172x724; 805289 bytes; alpha true; poses 6; processor referenced true; runtime not selected.

SHA-256: 39a5ade1b938bf0fef5969c9fbf018a8ef1f825c7a689856418e1592e84cc058

Full-sheet alpha bounds: {"left":0,"top":7,"width":2134,"height":717,"baseline":723,"centerX":1067,"headCenterX":1060.734,"pixels":520820}

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

Full-sheet alpha bounds: {"left":0,"top":0,"width":2172,"height":724,"baseline":723,"centerX":1086,"headCenterX":982.985,"pixels":737827}

Detection threshold 1; analysis region {"left":0,"top":95,"width":2172,"height":520}.

Pose 0: bounds {"left":7,"top":95,"width":309,"height":520}; isolated RGBA crop SHA-256 71befe0fd567b064ae16a34dd1de88ef90403400293c9dff2b18037e63f2083e

Pose 1: bounds {"left":416,"top":95,"width":266,"height":482}; isolated RGBA crop SHA-256 7b65e053686244c25884bdc6dfd94a61c474dd64ee64996e7b05856afdf06569

Pose 2: bounds {"left":765,"top":95,"width":269,"height":520}; isolated RGBA crop SHA-256 ea1501a6f70915e041192a313a434f1403aafae8b7934807151a6bba90b2985a

Pose 3: bounds {"left":1131,"top":95,"width":272,"height":520}; isolated RGBA crop SHA-256 91eae410d8d96b14c26b91811e494318a1927599e39aa6ce4f0c1c0c04ff12f6

Pose 4: bounds {"left":1495,"top":95,"width":265,"height":520}; isolated RGBA crop SHA-256 b457310938feaee9f4f6e389d29c9f446810725a3bc9f0f3f83da604584384c8

Pose 5: bounds {"left":1864,"top":95,"width":264,"height":520}; isolated RGBA crop SHA-256 4b0095a11a5b01108c1d6109619a74b69c12c13810f9ef12d2125abdf2c8c6e8

## RUN_SIDE

Source: latest-run-side.png

Source SHA-256: 21f742f9f0c062d94476bd91f6d314e9ae18ef32a5e6b11f727c075cd88ebb9b

Source matches processor report: true. Poses 8; processed 8; FPS 12; repeat -1; skipMissedFrames false.

Playback order: 0,1,2,3,4,5,6,7

Raw-pixel exact duplicates: []. Contiguous files: true; crops verified against manifest: true; indexes used once: true. Geometry: {"headTopRange":[10,11],"visibleFootRange":[245,249],"headCenterRange":[127.555,128.42]}.

Exact duplicates: none.

Near-duplicate candidates: [{"frames":[1,5],"changedPercent":32.99,"silhouetteChangedPercent":10.93,"normalizedMeanDifference":0.0926},{"frames":[5,6],"changedPercent":21.76,"silhouetteChangedPercent":11.02,"normalizedMeanDifference":0.0748}]

### Exact runtime frames

Frame 0 (playback position 0)

File: public/assets/player/movement/run_side/0.png

SHA-256: 182e3715c43a326a3ec512ac4e0c40bb2a0ed5959c344a233c07e2839931f69b

Phaser key: player-runSide-3c1b0ebd06d1-0; duration 83.33333333333333 ms

Alpha bounds: {"left":35,"top":10,"width":146,"height":239,"baseline":248,"centerX":108,"headCenterX":127.659,"pixels":18695}

Isolated source crop SHA-256: f21dce28213edb990179c468bf2f7095aa420783446d9d4e10ff79e622acd48f

Frame 1 (playback position 1)

File: public/assets/player/movement/run_side/1.png

SHA-256: f77a220426e84a3c0cd987f4e05504e908b114dea39b52115f81d6319bcf7102

Phaser key: player-runSide-3c1b0ebd06d1-1; duration 83.33333333333333 ms

Alpha bounds: {"left":20,"top":10,"width":182,"height":236,"baseline":245,"centerX":111,"headCenterX":128.009,"pixels":19528}

Isolated source crop SHA-256: a2f9d99f17051c9198c58633bfa0ef26491dfb1b02cca299af6909bcf0a32052

Frame 2 (playback position 2)

File: public/assets/player/movement/run_side/2.png

SHA-256: 4775c516d207afa6a8eb349a30f2609aa8c207ebddfd32188ed504a65e125c0a

Phaser key: player-runSide-3c1b0ebd06d1-2; duration 83.33333333333333 ms

Alpha bounds: {"left":34,"top":10,"width":143,"height":237,"baseline":246,"centerX":105.5,"headCenterX":128.42,"pixels":17534}

Isolated source crop SHA-256: 190acc4a6584ba3530810829126d3206acb60fd1cfd6d0a4f4f413ed96b86281

Frame 3 (playback position 3)

File: public/assets/player/movement/run_side/3.png

SHA-256: 3c885885edbde5a96f38fdc3dbf72fe41f49b3e0f8a10df24abe72c4204d8f0d

Phaser key: player-runSide-3c1b0ebd06d1-3; duration 83.33333333333333 ms

Alpha bounds: {"left":72,"top":10,"width":105,"height":237,"baseline":246,"centerX":124.5,"headCenterX":128.236,"pixels":15878}

Isolated source crop SHA-256: 7ae6b55915007bea7ddf52dbbd9cb20dc5b24b302c57622a092244b39ba432a6

Frame 4 (playback position 4)

File: public/assets/player/movement/run_side/4.png

SHA-256: 0fb45e25e42a9e8a798b1368aeb4f0356c70e16d32c0d4c7a7bf8ab36ac835a6

Phaser key: player-runSide-3c1b0ebd06d1-4; duration 83.33333333333333 ms

Alpha bounds: {"left":35,"top":11,"width":154,"height":235,"baseline":245,"centerX":112,"headCenterX":127.924,"pixels":19433}

Isolated source crop SHA-256: 76e1d22d046e6d646b933c48c4e19a48c3563a0ea0cab9072072f28754889de9

Frame 5 (playback position 5)

File: public/assets/player/movement/run_side/5.png

SHA-256: 34dcfb822defae163518d56aed28daca805eeea6541b305a5f67f6df62ebf5d3

Phaser key: player-runSide-3c1b0ebd06d1-5; duration 83.33333333333333 ms

Alpha bounds: {"left":22,"top":10,"width":176,"height":236,"baseline":245,"centerX":110,"headCenterX":127.652,"pixels":20386}

Isolated source crop SHA-256: 9eb9df67de21d8cbd48e5a53ef5599341c69c574e7ba0d0eed1e9dd1314e22f6

Frame 6 (playback position 6)

File: public/assets/player/movement/run_side/6.png

SHA-256: 9dee348593a8941f7daa7ab917c944c83a748dc4776447cd798405d43074852a

Phaser key: player-runSide-3c1b0ebd06d1-6; duration 83.33333333333333 ms

Alpha bounds: {"left":25,"top":10,"width":168,"height":240,"baseline":249,"centerX":109,"headCenterX":127.555,"pixels":19927}

Isolated source crop SHA-256: cdc28f3e856c62e31cdffc4134b25dc24c80b5e6e54cba80e00221005fa91154

Frame 7 (playback position 7)

File: public/assets/player/movement/run_side/7.png

SHA-256: e503ab8a16a230bee0718bc0a50ca1c6975c5a33c535f509098320c85f04debd

Phaser key: player-runSide-3c1b0ebd06d1-7; duration 83.33333333333333 ms

Alpha bounds: {"left":49,"top":10,"width":127,"height":239,"baseline":248,"centerX":112.5,"headCenterX":127.596,"pixels":16738}

Isolated source crop SHA-256: 7ff1a7bebadd0cf6d4ffb5f859f282d60750ff8cc199324c6d98d974ebfd67d1

### Adjacent transitions (including loop closure)

| From -> To | Changed pixels | Silhouette changed | Mean normalized difference | Flag |
|---|---:|---:|---:|---|
| 0 -> 1 | 36.81% | 26.68% | 0.1494 | - |
| 1 -> 2 | 38.86% | 25.02% | 0.1504 | - |
| 2 -> 3 | 48.14% | 31.94% | 0.1858 | - |
| 3 -> 4 | 50.87% | 34.56% | 0.1943 | - |
| 4 -> 5 | 38.69% | 27.24% | 0.1556 | - |
| 5 -> 6 | 21.76% | 11.02% | 0.0748 | near duplicate |
| 6 -> 7 | 43.99% | 29.1% | 0.1749 | - |
| 7 -> 0 | 51.78% | 32.46% | 0.1873 | - |

## RUN_DOWN

Source: Six-Frame Pixel Art Run Cycle.png

Source SHA-256: a9c887dd505276f4ca509f348ad52868d527de686e422459d4e87e7c42e03b51

Source matches processor report: true. Poses 6; processed 6; FPS 12; repeat -1; skipMissedFrames false.

Playback order: 0,1,2,3,4,5

Raw-pixel exact duplicates: []. Contiguous files: true; crops verified against manifest: true; indexes used once: true. Geometry: {"headTopRange":[10,10],"visibleFootRange":[231,249],"headCenterRange":[127.583,128.135]}.

Exact duplicates: none.

Near-duplicate candidates: [{"frames":[2,3],"changedPercent":26.15,"silhouetteChangedPercent":13.89,"normalizedMeanDifference":0.0771},{"frames":[3,5],"changedPercent":21.95,"silhouetteChangedPercent":11.86,"normalizedMeanDifference":0.0678}]

### Exact runtime frames

Frame 0 (playback position 0)

File: public/assets/player/movement/run_down/0.png

SHA-256: 0442fb400582d7210415f23e21f706c9d7b1dafc32de8e92f3754cac83071510

Phaser key: player-runDown-ccbbdbbfb5cb-0; duration 83.33333333333333 ms

Alpha bounds: {"left":47,"top":10,"width":143,"height":240,"baseline":249,"centerX":118.5,"headCenterX":127.918,"pixels":20899}

Isolated source crop SHA-256: 71befe0fd567b064ae16a34dd1de88ef90403400293c9dff2b18037e63f2083e

Frame 1 (playback position 1)

File: public/assets/player/movement/run_down/1.png

SHA-256: c8c3badf39995178fe0bea3d0ebe564b649c4c2d0328158fff49c7badd1ff46e

Phaser key: player-runDown-ccbbdbbfb5cb-1; duration 83.33333333333333 ms

Alpha bounds: {"left":69,"top":10,"width":123,"height":222,"baseline":231,"centerX":130.5,"headCenterX":128.025,"pixels":18624}

Isolated source crop SHA-256: 7b65e053686244c25884bdc6dfd94a61c474dd64ee64996e7b05856afdf06569

Frame 2 (playback position 2)

File: public/assets/player/movement/run_down/2.png

SHA-256: cccc42bb98aab834a704fb97094387e2f6c6a0095713e9777996eedfbd8f6f03

Phaser key: player-runDown-ccbbdbbfb5cb-2; duration 83.33333333333333 ms

Alpha bounds: {"left":63,"top":10,"width":124,"height":240,"baseline":249,"centerX":125,"headCenterX":128.036,"pixels":20086}

Isolated source crop SHA-256: ea1501a6f70915e041192a313a434f1403aafae8b7934807151a6bba90b2985a

Frame 3 (playback position 3)

File: public/assets/player/movement/run_down/3.png

SHA-256: 4e1c2446671854c096027fe299532284223673ab216b689a63744536f31e815c

Phaser key: player-runDown-ccbbdbbfb5cb-3; duration 83.33333333333333 ms

Alpha bounds: {"left":65,"top":10,"width":125,"height":240,"baseline":249,"centerX":127.5,"headCenterX":127.583,"pixels":19881}

Isolated source crop SHA-256: 91eae410d8d96b14c26b91811e494318a1927599e39aa6ce4f0c1c0c04ff12f6

Frame 4 (playback position 4)

File: public/assets/player/movement/run_down/4.png

SHA-256: 198f74b1fd6033e793fa5a3c18b16594d841951938b734b42b28f31bdbb4fabc

Phaser key: player-runDown-ccbbdbbfb5cb-4; duration 83.33333333333333 ms

Alpha bounds: {"left":66,"top":10,"width":122,"height":240,"baseline":249,"centerX":127,"headCenterX":127.958,"pixels":18626}

Isolated source crop SHA-256: b457310938feaee9f4f6e389d29c9f446810725a3bc9f0f3f83da604584384c8

Frame 5 (playback position 5)

File: public/assets/player/movement/run_down/5.png

SHA-256: 619f94bad18ac9817b2dc0c54961606707a14a6047b0991ac3aaa3cf6b7f1e3b

Phaser key: player-runDown-ccbbdbbfb5cb-5; duration 83.33333333333333 ms

Alpha bounds: {"left":69,"top":10,"width":122,"height":240,"baseline":249,"centerX":130,"headCenterX":128.135,"pixels":19698}

Isolated source crop SHA-256: 4b0095a11a5b01108c1d6109619a74b69c12c13810f9ef12d2125abdf2c8c6e8

### Adjacent transitions (including loop closure)

| From -> To | Changed pixels | Silhouette changed | Mean normalized difference | Flag |
|---|---:|---:|---:|---|
| 0 -> 1 | 48.57% | 20.97% | 0.1321 | - |
| 1 -> 2 | 47.75% | 20.92% | 0.1285 | - |
| 2 -> 3 | 26.15% | 13.89% | 0.0771 | near duplicate |
| 3 -> 4 | 50.6% | 20.38% | 0.1414 | - |
| 4 -> 5 | 49.92% | 20.95% | 0.136 | - |
| 5 -> 0 | 31.31% | 16.87% | 0.0952 | - |

## RUN_UP

Source: Pixel Runner Back-View Sprite Sheet.png

Source SHA-256: 342acabf72184a067c2815ae8535029aa793b0ef1aed5fac2f2f3d80a7ba4607

Source matches processor report: true. Poses 6; processed 6; FPS 12; repeat -1; skipMissedFrames false.

Playback order: 0,1,2,3,4,5

Raw-pixel exact duplicates: []. Contiguous files: true; crops verified against manifest: true; indexes used once: true. Geometry: {"headTopRange":[10,11],"visibleFootRange":[239,249],"headCenterRange":[127.77,128.178]}.

Exact duplicates: none.

Near-duplicate candidates: [{"frames":[0,1],"changedPercent":21.51,"silhouetteChangedPercent":11.47,"normalizedMeanDifference":0.0752},{"frames":[0,2],"changedPercent":26.19,"silhouetteChangedPercent":13.29,"normalizedMeanDifference":0.0894},{"frames":[0,3],"changedPercent":19.13,"silhouetteChangedPercent":11.16,"normalizedMeanDifference":0.067},{"frames":[0,4],"changedPercent":24.14,"silhouetteChangedPercent":13.31,"normalizedMeanDifference":0.0823},{"frames":[0,5],"changedPercent":17.44,"silhouetteChangedPercent":8.59,"normalizedMeanDifference":0.0576},{"frames":[1,2],"changedPercent":21.69,"silhouetteChangedPercent":9.13,"normalizedMeanDifference":0.0715},{"frames":[1,3],"changedPercent":12.79,"silhouetteChangedPercent":5.25,"normalizedMeanDifference":0.0404},{"frames":[1,5],"changedPercent":19.34,"silhouetteChangedPercent":8.85,"normalizedMeanDifference":0.0648},{"frames":[2,3],"changedPercent":20.5,"silhouetteChangedPercent":9.07,"normalizedMeanDifference":0.0684},{"frames":[2,5],"changedPercent":20.73,"silhouetteChangedPercent":11.47,"normalizedMeanDifference":0.073},{"frames":[3,5],"changedPercent":15.39,"silhouetteChangedPercent":8,"normalizedMeanDifference":0.0542}]

### Exact runtime frames

Frame 0 (playback position 0)

File: public/assets/player/movement/run_up/0.png

SHA-256: b88dff5448567b7cd3ff4e97119a85e3d36e378270290619437cdc3376391e09

Phaser key: player-runUp-3840dcd3e7ee-0; duration 83.33333333333333 ms

Alpha bounds: {"left":71,"top":10,"width":113,"height":239,"baseline":248,"centerX":127.5,"headCenterX":128.178,"pixels":19016}

Isolated source crop SHA-256: a04d8336ce8cbc2364678710d06ff5209655107c9c800631c1eae1517a6b8204

Frame 1 (playback position 1)

File: public/assets/player/movement/run_up/1.png

SHA-256: 6c51c76c6a1945d7e87552407a6028ec7510a92c7cd42b18412ef84590ada12c

Phaser key: player-runUp-3840dcd3e7ee-1; duration 83.33333333333333 ms

Alpha bounds: {"left":73,"top":10,"width":114,"height":240,"baseline":249,"centerX":130,"headCenterX":127.77,"pixels":18243}

Isolated source crop SHA-256: b99426f1a02eeb00794ddcc9534885166691b38ae5d970e1b24ecce4f0592544

Frame 2 (playback position 2)

File: public/assets/player/movement/run_up/2.png

SHA-256: 592fa8e34f222da70ccdb8c32ed7d27ebcd75a8f0b00be18db57b5cdcecce746

Phaser key: player-runUp-3840dcd3e7ee-2; duration 83.33333333333333 ms

Alpha bounds: {"left":70,"top":10,"width":112,"height":240,"baseline":249,"centerX":126,"headCenterX":127.98,"pixels":17477}

Isolated source crop SHA-256: 89668d38b8884c1db95b9157d5c6c2262f87412f3bc06f90cd1661d738007c29

Frame 3 (playback position 3)

File: public/assets/player/movement/run_up/3.png

SHA-256: e4cd9a43280dae1bbfbaacb6bcae9a99f0870604eed342cb4b11d1166b9fdbc6

Phaser key: player-runUp-3840dcd3e7ee-3; duration 83.33333333333333 ms

Alpha bounds: {"left":67,"top":10,"width":119,"height":240,"baseline":249,"centerX":126.5,"headCenterX":127.794,"pixels":18343}

Isolated source crop SHA-256: a2e6b3b4a93c8dbb72ad481fba13786c009cfa67c5dd1f0dc8c245d427f54027

Frame 4 (playback position 4)

File: public/assets/player/movement/run_up/4.png

SHA-256: ef15d7e2109f43a0dd15d713f8dffaf7135e9c50267a9a87c15177ba27511138

Phaser key: player-runUp-3840dcd3e7ee-4; duration 83.33333333333333 ms

Alpha bounds: {"left":77,"top":11,"width":108,"height":229,"baseline":239,"centerX":131,"headCenterX":127.924,"pixels":16805}

Isolated source crop SHA-256: 30d1a898c4973e7b41b1f2db8054eba7764559aa1a2731cb977548f694fd1933

Frame 5 (playback position 5)

File: public/assets/player/movement/run_up/5.png

SHA-256: 664e2d7f60b4b8f70498d1fe2ed864ba9c6bc997d63bb86704255b5aa9c7b457

Phaser key: player-runUp-3840dcd3e7ee-5; duration 83.33333333333333 ms

Alpha bounds: {"left":72,"top":10,"width":114,"height":240,"baseline":249,"centerX":129,"headCenterX":127.906,"pixels":18907}

Isolated source crop SHA-256: 574b90aeea7f1592bbedfc55b0a5b2216a76392c54a8f0f40fc49261cfff5593

### Adjacent transitions (including loop closure)

| From -> To | Changed pixels | Silhouette changed | Mean normalized difference | Flag |
|---|---:|---:|---:|---|
| 0 -> 1 | 21.51% | 11.47% | 0.0752 | near duplicate |
| 1 -> 2 | 21.69% | 9.13% | 0.0715 | near duplicate |
| 2 -> 3 | 20.5% | 9.07% | 0.0684 | near duplicate |
| 3 -> 4 | 25.74% | 15.68% | 0.0873 | - |
| 4 -> 5 | 26.5% | 15% | 0.0912 | - |
| 5 -> 0 | 17.44% | 8.59% | 0.0576 | near duplicate |

