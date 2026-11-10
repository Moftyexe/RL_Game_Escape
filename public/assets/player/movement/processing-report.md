# Player movement sprite processing

- Side run uses eight chronological poses from8-frame side run cycle.mp4; deterministic background removal and framing stabilization precede this shared normalization pipeline.
- Running uses one scale and a common source floor per sheet, plus a head-center horizontal anchor. Airborne visible feet may be above the logical baseline 249; head height is not shifted to force every foot down.
- Front and rear run sources currently contain six poses each; no new eight-pose front/rear sheet was present.
- Side run uses alpha >= 16/255 for connectivity to exclude background debris joining poses; retained pixels preserve their original alpha.
- All movement/idle frames now use a 256x256 canvas, 240 px character height, and baseline 249; runtime scales are halved to preserve apparent size. All outputs are generated and structurally validated before any existing PNG is replaced.

Output: transparent 256x256, nearest-neighbour proportional fit, character height up to 240 px, logical floor baseline 249. Run poses preserve source airborne foot lift and use head-center horizontal anchoring; idle/walk frames keep their original alignment.

## Pixel Art Protagonist Idle Animation Frames.png

2172x724; 4 poses; front; 4 exported; idle_down

0: source {"left":130,"top":59,"width":281,"height":633}, output 107x240, placement {"left":74,"top":10}

1: source {"left":676,"top":47,"width":275,"height":645}, output 102x240, placement {"left":77,"top":10}

2: source {"left":1218,"top":60,"width":279,"height":632}, output 106x240, placement {"left":75,"top":10}

3: source {"left":1755,"top":73,"width":287,"height":619}, output 111x240, placement {"left":72,"top":10}

## Pixel-Art Front Walk Cycle Sprite Sheet.png

2172x724; 4 poses; front; 4 exported; walk_down

0: source {"left":132,"top":58,"width":272,"height":620}, output 105x240, placement {"left":75,"top":10}

1: source {"left":675,"top":58,"width":276,"height":620}, output 107x240, placement {"left":74,"top":10}

2: source {"left":1220,"top":58,"width":278,"height":620}, output 108x240, placement {"left":74,"top":10}

3: source {"left":1766,"top":58,"width":265,"height":619}, output 103x240, placement {"left":76,"top":10}

## Pixel Art Afro Character Idle Spritesheet.png

2172x724; 4 poses; right; 4 exported; idle_side

0: source {"left":158,"top":61,"width":235,"height":618}, output 91x239, placement {"left":82,"top":11}

1: source {"left":697,"top":63,"width":239,"height":615}, output 92x240, placement {"left":82,"top":10}

2: source {"left":1240,"top":73,"width":240,"height":606}, output 95x240, placement {"left":80,"top":10}

3: source {"left":1783,"top":72,"width":244,"height":608}, output 96x239, placement {"left":80,"top":11}

## Pixel-Art Walking Cycle Sprite Sheet.png

2172x724; 6 poses; right; 6 exported; walk_side

0: source {"left":32,"top":81,"width":307,"height":549}, output 134x239, placement {"left":61,"top":11}

1: source {"left":435,"top":95,"width":239,"height":534}, output 107x240, placement {"left":74,"top":10}

2: source {"left":801,"top":82,"width":231,"height":548}, output 101x239, placement {"left":77,"top":11}

3: source {"left":1126,"top":94,"width":306,"height":534}, output 138x240, placement {"left":59,"top":10}

4: source {"left":1519,"top":93,"width":234,"height":536}, output 105x239, placement {"left":75,"top":11}

5: source {"left":1883,"top":92,"width":241,"height":538}, output 108x240, placement {"left":74,"top":10}

## Pixel-Art Character Idle Animation Sprite Sheet.png

2172x724; 4 poses; rear; 4 exported; idle_up

0: source {"left":143,"top":69,"width":259,"height":607}, output 102x240, placement {"left":77,"top":10}

1: source {"left":691,"top":65,"width":256,"height":611}, output 101x240, placement {"left":77,"top":10}

2: source {"left":1224,"top":72,"width":265,"height":604}, output 105x240, placement {"left":75,"top":10}

3: source {"left":1771,"top":63,"width":259,"height":614}, output 101x240, placement {"left":77,"top":10}

## Rear-View Pixel Character Walk Cycle.png

2170x725; 4 poses; rear; 4 exported; walk_up

0: source {"left":146,"top":64,"width":256,"height":613}, output 100x240, placement {"left":78,"top":10}

1: source {"left":676,"top":64,"width":270,"height":611}, output 106x240, placement {"left":75,"top":10}

2: source {"left":1218,"top":65,"width":270,"height":611}, output 106x240, placement {"left":75,"top":10}

3: source {"left":1764,"top":64,"width":267,"height":613}, output 105x240, placement {"left":75,"top":10}

## Six-Frame Pixel Art Run Cycle.png

2172x724; 6 poses; front; 6 exported; run_down

Explicit analysis region: {"left":0,"top":95,"width":2172,"height":520}

0: source {"left":7,"top":95,"width":309,"height":520}, output 143x240, placement {"left":47,"top":10}

1: source {"left":416,"top":95,"width":266,"height":482}, output 123x222, placement {"left":69,"top":10}

2: source {"left":765,"top":95,"width":269,"height":520}, output 124x240, placement {"left":63,"top":10}

3: source {"left":1131,"top":95,"width":272,"height":520}, output 125x240, placement {"left":65,"top":10}

4: source {"left":1495,"top":95,"width":265,"height":520}, output 122x240, placement {"left":66,"top":10}

5: source {"left":1864,"top":95,"width":264,"height":520}, output 122x240, placement {"left":69,"top":10}

## latest-run-side.png

4320x760; 8 poses; right; 8 exported; run_side

Replaces prior source: 4320x760, 8 poses, SHA-256 c3c6828721340f3b1e784cfa4e81de335dd6d9da2469899f8e46dd9bdba70e42.

0: source {"left":135,"top":24,"width":269,"height":441}, output 146x239, placement {"left":35,"top":10}

1: source {"left":642,"top":24,"width":336,"height":436}, output 182x236, placement {"left":20,"top":10}

2: source {"left":1218,"top":24,"width":264,"height":438}, output 143x237, placement {"left":34,"top":10}

3: source {"left":1793,"top":24,"width":193,"height":437}, output 105x237, placement {"left":72,"top":10}

4: source {"left":2288,"top":24,"width":284,"height":436}, output 154x235, placement {"left":35,"top":11}

5: source {"left":2806,"top":24,"width":327,"height":436}, output 176x236, placement {"left":22,"top":10}

6: source {"left":3354,"top":24,"width":311,"height":443}, output 168x240, placement {"left":25,"top":10}

7: source {"left":3933,"top":24,"width":234,"height":442}, output 127x239, placement {"left":49,"top":10}

## Pixel Runner Back-View Sprite Sheet.png

2172x724; 6 poses; rear; 6 exported; run_up

0: source {"left":65,"top":112,"width":244,"height":520}, output 113x239, placement {"left":71,"top":10}

1: source {"left":432,"top":113,"width":246,"height":519}, output 114x240, placement {"left":73,"top":10}

2: source {"left":787,"top":112,"width":243,"height":520}, output 112x240, placement {"left":70,"top":10}

3: source {"left":1143,"top":112,"width":257,"height":520}, output 119x240, placement {"left":67,"top":10}

4: source {"left":1526,"top":114,"width":234,"height":497}, output 108x229, placement {"left":77,"top":11}

5: source {"left":1878,"top":112,"width":247,"height":520}, output 114x240, placement {"left":72,"top":10}

## Pixel-Art Runner Sprite Sheet.png

2172x724; 6 poses; rear; 0 exported; Inspected alternate rear-run sheet; canonical run_up uses Pixel Runner Back-View Sprite Sheet.png.

0: source {"left":64,"top":114,"width":243,"height":532}, output 110x240, placement {"left":73,"top":10}

1: source {"left":417,"top":112,"width":245,"height":530}, output 111x240, placement {"left":72,"top":10}

2: source {"left":773,"top":114,"width":247,"height":524}, output 113x240, placement {"left":71,"top":10}

3: source {"left":1143,"top":111,"width":247,"height":529}, output 112x240, placement {"left":72,"top":10}

4: source {"left":1511,"top":114,"width":243,"height":514}, output 113x240, placement {"left":71,"top":10}

5: source {"left":1867,"top":113,"width":241,"height":529}, output 109x240, placement {"left":73,"top":10}

