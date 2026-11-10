# Battle animation inspection

- Frames are alpha-connected silhouettes, not equal-width cells. Small detached generation debris is excluded.
- Nearest-neighbour proportional resizing; final alpha trimmed; feet centers anchored at x=96, baseline y=155.
- All Player sheets face right; all Guard battle sheets face left. No horizontal flipping.
- Inspected Player and Guard skills, defense, hurt and critical attacks are integrated. Player/Guard victory, Guard defeat and status idles are integrated. Player defeat is integrated; only stunned art is absent.
- Catch Breath has contaminated background pixels; explicit regions isolate poses. Call Wife has a joined floor shadow; explicit regions separate its eight poses.
- Connectivity ignores alpha below 16/255 for Catch Breath and 32/255 for Call Wife; retained silhouette pixels preserve original alpha.
- Backpack frame 4 fits proportionally to 132 px high and Guard critical frame 3 to 125 px high to avoid clipping wide extensions. Other frames normalize to 144 px.
- Guard_Animations/Guard_idle.png (2172x724, four poses) is hallway idle, not a battle action.
- Fall has six poses; get-up has eight, ordered left-to-right. Alpha below 32 bridges adjacent source poses; ignore it for connectivity. Normalize both with fixed proportional body scale from their tallest pose, baseline 155. Fall holds downed pose 300 ms; recovery restores the current persistent stance. Missing optional sheets use hurt fallback.

| Source | Dimensions | Frames | Mapping |
|---|---|---|---|
| P_Animations/Protagonist_Battle_idle stance.png | 2172 x 724 | 4 | player: idle |
| P_Animations/Protagonist_Battle_BasicATKpng.png | 2172 x 724 | 6 | player: attack |
| P_Animations/Protagonist_Battle_Defensepng.png | 2170 x 725 | 4 | player: defend |
| Guard_Animations/Guard_battle_idle.png | 2172 x 724 | 4 | guard: idle |
| Guard_Animations/Guard_battle_BasicAtk.png | 2172 x 724 | 6 | guard: attack |
| P_Animations/Protagonist_Battle_Lockin.png | 2172 x 724 | 5 | player: lock-in |
| P_Animations/Protagonist_Battle_LookThere.png | 2172 x 724 | 6 | player: look-there |
| P_Animations/Protagonist_Battle_Talk smack.png | 2172 x 724 | 6 | player: talk-smack |
| P_Animations/Protagonist_Battle_Bagthrow.png | 2172 x 724 | 6 | player: backpack |
| P_Animations/Protagonist_Battle_catchBreath.png | 2172 x 724 | 5 | player: catch-breath |
| P_Animations/Protagonist_Battle_Criticalhitpng.png | 2172 x 724 | 6 | player: critical |
| P_Animations/Protagonist_Battle_hurtpng.png | 2172 x 724 | 4 | player: hurt |
| Guard_Animations/Guard_battle_callwife.png | 2170 x 725 | 8 | guard: call-wife |
| Guard_Animations/Guard_battle_crackknuckles.png | 2172 x 724 | 6 | guard: crack-knuckles |
| Guard_Animations/Guard_battle_CritAtk.png | 2172 x 724 | 6 | guard: critical |
| Guard_Animations/Guard_battle_defend.png | 1774 x 887 | 4 | guard: defend |
| Guard_Animations/Guard_battle_eatdonut.png | 2170 x 725 | 8 | guard: eat-donut |
| Guard_Animations/Guard_battle_hurt.png | 2172 x 724 | 4 | guard: hurt |
| P_Animations/Protagonist_Battle_Defeat.png | 2172 x 724 | 5 | player: defeat |
| P_Animations/Protagonist_Battle_victory.png | 2172 x 724 | 5 | player: victory |
| Guard_Animations/Guard_battle_Distracted.png | 2172 x 724 | 4 | guard: distracted |
| Guard_Animations/Guard_battle_Riled.png | 2172 x 724 | 4 | guard: riled |
| Guard_Animations/Guard_battle_Victory.png | 2171 x 724 | 5 | guard: victory |
| Guard_Animations/Guard_battle_defeat.png | 2172 x 724 | 6 | guard: defeat |
| Guard_Animations/Guard_battle_whistle.png | 2172 x 724 | 6 | guard: blow-whistle |
| Guard_Animations/Guard_battle_fall.png | 2172 x 724 | 6 | guard: stumble |
| Guard_Animations/Guard_battle_getup.png | 2172 x 724 | 8 | guard: recovery |

## Complete action mapping

| Action | Player | Guard |
|---|---|---|
| Battle idle | player-battle-idle | guard-battle-idle |
| Basic attack | player-battle-attack | guard-battle-attack |
| Defend | player-battle-defend | guard-battle-defend |
| Bro, Lock In / Crack Knuckles | player-battle-lock-in | guard-battle-crack-knuckles |
| Talk Smack / Blow Whistle | player-battle-talk-smack | guard-battle-blow-whistle |
| Look There! / Call Wife | player-battle-look-there | guard-battle-call-wife |
| Swing Backpack / Eat Donut | player-battle-backpack | guard-battle-eat-donut |
| Catch breath | player-battle-catch-breath | Not a Guard action |
| Hurt | player-battle-hurt | guard-battle-hurt |
| Dedicated critical | player-battle-critical | guard-battle-critical |
| Victory | player-battle-victory | guard-battle-victory |
| Defeat | player-battle-defeat | guard-battle-defeat |
| Status idles | No dedicated sheet | guard-battle-distracted / guard-battle-riled |

NO MATCH uses continuous battle idle. Critical basic attacks fall back to their basic attack when dedicated art is unavailable; skills retain their own mapping.

## P_Animations/Protagonist_Battle_idle stance.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 27549 source pixels.

Frame 0: crop {"left":116,"top":64,"width":288,"height":621}, resized 67x144, placement {"left":63,"top":12}.

Frame 1: crop {"left":661,"top":59,"width":278,"height":625}, resized 64x144, placement {"left":64,"top":12}.

Frame 2: crop {"left":1206,"top":65,"width":275,"height":624}, resized 62x144, placement {"left":65,"top":12}.

Frame 3: crop {"left":1743,"top":67,"width":284,"height":614}, resized 67x144, placement {"left":63,"top":12}.

## P_Animations/Protagonist_Battle_BasicATKpng.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 3612 source pixels.

Frame 0: crop {"left":76,"top":116,"width":236,"height":497}, resized 67x144, placement {"left":63,"top":12}.

Frame 1: crop {"left":401,"top":128,"width":247,"height":485}, resized 73x144, placement {"left":60,"top":12}.

Frame 2: crop {"left":721,"top":140,"width":295,"height":473}, resized 90x144, placement {"left":56,"top":12}.

Frame 3: crop {"left":1079,"top":132,"width":371,"height":481}, resized 110x144, placement {"left":54,"top":12}.

Frame 4: crop {"left":1474,"top":130,"width":265,"height":481}, resized 79x144, placement {"left":57,"top":12}.

Frame 5: crop {"left":1861,"top":114,"width":233,"height":497}, resized 68x144, placement {"left":62,"top":12}.

## P_Animations/Protagonist_Battle_Defensepng.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 6482 source pixels.

Frame 0: crop {"left":118,"top":63,"width":282,"height":596}, resized 68x144, placement {"left":62,"top":12}.

Frame 1: crop {"left":664,"top":70,"width":279,"height":589}, resized 67x144, placement {"left":63,"top":12}.

Frame 2: crop {"left":1193,"top":82,"width":292,"height":577}, resized 74x144, placement {"left":59,"top":12}.

Frame 3: crop {"left":1737,"top":79,"width":288,"height":581}, resized 71x144, placement {"left":61,"top":12}.

## Guard_Animations/Guard_battle_idle.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 3023 source pixels.

Frame 0: crop {"left":33,"top":109,"width":451,"height":549}, resized 118x144, placement {"left":29,"top":12}.

Frame 1: crop {"left":578,"top":134,"width":454,"height":526}, resized 124x144, placement {"left":26,"top":12}.

Frame 2: crop {"left":1117,"top":118,"width":448,"height":538}, resized 119x144, placement {"left":28,"top":12}.

Frame 3: crop {"left":1668,"top":110,"width":446,"height":549}, resized 117x144, placement {"left":31,"top":12}.

## Guard_Animations/Guard_battle_BasicAtk.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 1504 source pixels.

Frame 0: crop {"left":33,"top":160,"width":325,"height":407}, resized 115x144, placement {"left":33,"top":12}.

Frame 1: crop {"left":413,"top":161,"width":295,"height":400}, resized 106x144, placement {"left":39,"top":12}.

Frame 2: crop {"left":747,"top":162,"width":334,"height":399}, resized 121x144, placement {"left":28,"top":12}.

Frame 3: crop {"left":1079,"top":176,"width":383,"height":383}, resized 144x144, placement {"left":11,"top":12}.

Frame 4: crop {"left":1499,"top":162,"width":293,"height":396}, resized 107x144, placement {"left":39,"top":12}.

Frame 5: crop {"left":1833,"top":162,"width":313,"height":401}, resized 112x144, placement {"left":35,"top":12}.

## P_Animations/Protagonist_Battle_Lockin.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 11081 source pixels.

Frame 0: crop {"left":64,"top":60,"width":289,"height":628}, resized 66x144, placement {"left":63,"top":12}.

Frame 1: crop {"left":514,"top":61,"width":242,"height":623}, resized 56x144, placement {"left":74,"top":12}.

Frame 2: crop {"left":932,"top":45,"width":259,"height":636}, resized 58x144, placement {"left":70,"top":12}.

Frame 3: crop {"left":1352,"top":48,"width":273,"height":642}, resized 61x144, placement {"left":66,"top":12}.

Frame 4: crop {"left":1786,"top":63,"width":295,"height":618}, resized 69x144, placement {"left":62,"top":12}.

## P_Animations/Protagonist_Battle_LookThere.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 1127 source pixels.

Frame 0: crop {"left":43,"top":77,"width":263,"height":579}, resized 65x144, placement {"left":64,"top":12}.

Frame 1: crop {"left":373,"top":85,"width":318,"height":573}, resized 80x144, placement {"left":62,"top":12}.

Frame 2: crop {"left":702,"top":83,"width":278,"height":576}, resized 70x144, placement {"left":63,"top":12}.

Frame 3: crop {"left":1031,"top":86,"width":433,"height":574}, resized 108x144, placement {"left":58,"top":12}.

Frame 4: crop {"left":1444,"top":89,"width":405,"height":569}, resized 103x144, placement {"left":59,"top":12}.

Frame 5: crop {"left":1863,"top":81,"width":271,"height":573}, resized 67x144, placement {"left":63,"top":12}.

## P_Animations/Protagonist_Battle_Talk smack.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 2210 source pixels.

Frame 0: crop {"left":49,"top":79,"width":274,"height":566}, resized 70x144, placement {"left":61,"top":12}.

Frame 1: crop {"left":411,"top":78,"width":266,"height":568}, resized 67x144, placement {"left":62,"top":12}.

Frame 2: crop {"left":755,"top":79,"width":321,"height":567}, resized 81x144, placement {"left":60,"top":12}.

Frame 3: crop {"left":1108,"top":77,"width":331,"height":568}, resized 84x144, placement {"left":51,"top":12}.

Frame 4: crop {"left":1489,"top":79,"width":284,"height":565}, resized 71x144, placement {"left":58,"top":12}.

Frame 5: crop {"left":1859,"top":75,"width":267,"height":571}, resized 67x144, placement {"left":63,"top":12}.

## P_Animations/Protagonist_Battle_Bagthrow.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 7834 source pixels.

Frame 0: crop {"left":27,"top":55,"width":247,"height":577}, resized 62x144, placement {"left":65,"top":12}.

Frame 1: crop {"left":335,"top":95,"width":247,"height":535}, resized 66x144, placement {"left":63,"top":12}.

Frame 2: crop {"left":578,"top":95,"width":395,"height":535}, resized 106x144, placement {"left":38,"top":12}.

Frame 3: crop {"left":981,"top":120,"width":419,"height":508}, resized 120x144, placement {"left":52,"top":12}.

Frame 4: crop {"left":1381,"top":145,"width":522,"height":485}, resized 142x132, placement {"left":48,"top":24}.

Frame 5: crop {"left":1893,"top":95,"width":240,"height":536}, resized 65x144, placement {"left":64,"top":12}.

## P_Animations/Protagonist_Battle_catchBreath.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 398612 source pixels.

Explicit regions [left, top, width, height]: [[70,55,310,625],[490,65,310,615],[900,95,330,585],[1320,125,350,555],[1770,55,310,625]]

Frame 0: crop {"left":84,"top":67,"width":280,"height":611}, resized 66x144, placement {"left":63,"top":12}.

Frame 1: crop {"left":503,"top":76,"width":283,"height":602}, resized 68x144, placement {"left":63,"top":12}.

Frame 2: crop {"left":914,"top":104,"width":306,"height":572}, resized 77x144, placement {"left":62,"top":12}.

Frame 3: crop {"left":1330,"top":135,"width":337,"height":543}, resized 89x144, placement {"left":61,"top":12}.

Frame 4: crop {"left":1782,"top":72,"width":282,"height":606}, resized 67x144, placement {"left":63,"top":12}.

## P_Animations/Protagonist_Battle_Criticalhitpng.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 755 source pixels.

Frame 0: crop {"left":66,"top":95,"width":242,"height":531}, resized 66x144, placement {"left":63,"top":12}.

Frame 1: crop {"left":369,"top":146,"width":294,"height":475}, resized 90x144, placement {"left":51,"top":12}.

Frame 2: crop {"left":706,"top":138,"width":298,"height":488}, resized 88x144, placement {"left":52,"top":12}.

Frame 3: crop {"left":1045,"top":142,"width":387,"height":484}, resized 115x144, placement {"left":49,"top":12}.

Frame 4: crop {"left":1449,"top":141,"width":324,"height":481}, resized 97x144, placement {"left":53,"top":12}.

Frame 5: crop {"left":1878,"top":98,"width":244,"height":524}, resized 66x144, placement {"left":63,"top":12}.

## P_Animations/Protagonist_Battle_hurtpng.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 1147 source pixels.

Frame 0: crop {"left":175,"top":93,"width":310,"height":568}, resized 79x144, placement {"left":61,"top":12}.

Frame 1: crop {"left":627,"top":95,"width":323,"height":565}, resized 82x144, placement {"left":47,"top":12}.

Frame 2: crop {"left":1172,"top":130,"width":312,"height":533}, resized 84x144, placement {"left":59,"top":12}.

Frame 3: crop {"left":1687,"top":111,"width":282,"height":549}, resized 73x144, placement {"left":60,"top":12}.

## Guard_Animations/Guard_battle_callwife.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 99298 source pixels.

Explicit regions [left, top, width, height]: [[0,140,295,450],[295,140,270,450],[565,140,270,450],[835,140,255,450],[1090,140,263,450],[1353,140,265,450],[1618,140,255,450],[1873,140,297,450]]

Frame 0: crop {"left":19,"top":159,"width":268,"height":394}, resized 98x144, placement {"left":48,"top":12}.

Frame 1: crop {"left":304,"top":159,"width":251,"height":394}, resized 92x144, placement {"left":48,"top":12}.

Frame 2: crop {"left":578,"top":159,"width":249,"height":394}, resized 91x144, placement {"left":51,"top":12}.

Frame 3: crop {"left":843,"top":159,"width":239,"height":394}, resized 87x144, placement {"left":53,"top":12}.

Frame 4: crop {"left":1104,"top":155,"width":239,"height":398}, resized 86x144, placement {"left":53,"top":12}.

Frame 5: crop {"left":1364,"top":155,"width":243,"height":398}, resized 88x144, placement {"left":52,"top":12}.

Frame 6: crop {"left":1629,"top":158,"width":235,"height":395}, resized 86x144, placement {"left":53,"top":12}.

Frame 7: crop {"left":1881,"top":159,"width":273,"height":394}, resized 100x144, placement {"left":45,"top":12}.

## Guard_Animations/Guard_battle_crackknuckles.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 11442 source pixels.

Frame 0: crop {"left":25,"top":126,"width":363,"height":492}, resized 106x144, placement {"left":39,"top":12}.

Frame 1: crop {"left":413,"top":126,"width":329,"height":487}, resized 97x144, placement {"left":48,"top":12}.

Frame 2: crop {"left":756,"top":126,"width":340,"height":494}, resized 100x144, placement {"left":46,"top":12}.

Frame 3: crop {"left":1107,"top":126,"width":326,"height":485}, resized 98x144, placement {"left":47,"top":12}.

Frame 4: crop {"left":1447,"top":112,"width":342,"height":506}, resized 97x144, placement {"left":48,"top":12}.

Frame 5: crop {"left":1821,"top":128,"width":337,"height":483}, resized 100x144, placement {"left":47,"top":12}.

## Guard_Animations/Guard_battle_CritAtk.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 1646 source pixels.

Frame 0: crop {"left":33,"top":164,"width":322,"height":397}, resized 117x144, placement {"left":30,"top":12}.

Frame 1: crop {"left":397,"top":180,"width":325,"height":377}, resized 125x144, placement {"left":30,"top":12}.

Frame 2: crop {"left":724,"top":169,"width":368,"height":391}, resized 136x144, placement {"left":19,"top":12}.

Frame 3: crop {"left":1033,"top":184,"width":447,"height":373}, resized 151x125, placement {"left":2,"top":31}.

Frame 4: crop {"left":1479,"top":175,"width":333,"height":380}, resized 125x144, placement {"left":28,"top":12}.

Frame 5: crop {"left":1835,"top":167,"width":320,"height":394}, resized 118x144, placement {"left":31,"top":12}.

## Guard_Animations/Guard_battle_defend.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 2783 source pixels.

Frame 0: crop {"left":18,"top":191,"width":419,"height":507}, resized 119x144, placement {"left":30,"top":12}.

Frame 1: crop {"left":466,"top":212,"width":423,"height":494}, resized 124x144, placement {"left":28,"top":12}.

Frame 2: crop {"left":915,"top":205,"width":409,"height":497}, resized 121x144, placement {"left":30,"top":12}.

Frame 3: crop {"left":1354,"top":209,"width":420,"height":489}, resized 124x144, placement {"left":29,"top":12}.

## Guard_Animations/Guard_battle_eatdonut.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 3280 source pixels.

Frame 0: crop {"left":17,"top":167,"width":272,"height":395}, resized 99x144, placement {"left":46,"top":12}.

Frame 1: crop {"left":308,"top":167,"width":255,"height":397}, resized 92x144, placement {"left":53,"top":12}.

Frame 2: crop {"left":576,"top":169,"width":247,"height":393}, resized 91x144, placement {"left":51,"top":12}.

Frame 3: crop {"left":834,"top":164,"width":261,"height":401}, resized 94x144, placement {"left":47,"top":12}.

Frame 4: crop {"left":1109,"top":168,"width":241,"height":404}, resized 86x144, placement {"left":53,"top":12}.

Frame 5: crop {"left":1367,"top":167,"width":243,"height":397}, resized 87x144, placement {"left":53,"top":12}.

Frame 6: crop {"left":1624,"top":162,"width":259,"height":403}, resized 93x144, placement {"left":50,"top":12}.

Frame 7: crop {"left":1882,"top":168,"width":273,"height":396}, resized 99x144, placement {"left":45,"top":12}.

## Guard_Animations/Guard_battle_hurt.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 12000 source pixels.

Frame 0: crop {"left":49,"top":131,"width":434,"height":531}, resized 118x144, placement {"left":31,"top":12}.

Frame 1: crop {"left":596,"top":96,"width":418,"height":566}, resized 105x144, placement {"left":40,"top":12}.

Frame 2: crop {"left":1122,"top":130,"width":443,"height":530}, resized 120x144, placement {"left":28,"top":12}.

Frame 3: crop {"left":1667,"top":113,"width":442,"height":549}, resized 117x144, placement {"left":30,"top":12}.

## P_Animations/Protagonist_Battle_Defeat.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 1087 source pixels.

Frame 0: crop {"left":78,"top":77,"width":293,"height":553}, resized 77x144, placement {"left":54,"top":12}.

Frame 1: crop {"left":401,"top":112,"width":370,"height":526}, resized 96x137, placement {"left":38,"top":19}.

Frame 2: crop {"left":819,"top":210,"width":374,"height":420}, resized 98x109, placement {"left":52,"top":47}.

Frame 3: crop {"left":1256,"top":192,"width":433,"height":446}, resized 113x116, placement {"left":42,"top":40}.

Frame 4: crop {"left":1737,"top":227,"width":370,"height":406}, resized 97x106, placement {"left":47,"top":50}.

## P_Animations/Protagonist_Battle_victory.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 1301 source pixels.

Frame 0: crop {"left":99,"top":59,"width":267,"height":571}, resized 65x144, placement {"left":64,"top":12}.

Frame 1: crop {"left":544,"top":60,"width":275,"height":569}, resized 70x144, placement {"left":65,"top":12}.

Frame 2: crop {"left":976,"top":61,"width":249,"height":569}, resized 63x144, placement {"left":65,"top":12}.

Frame 3: crop {"left":1401,"top":62,"width":274,"height":568}, resized 69x144, placement {"left":63,"top":12}.

Frame 4: crop {"left":1832,"top":55,"width":242,"height":574}, resized 61x144, placement {"left":64,"top":12}.

## Guard_Animations/Guard_battle_Distracted.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 2434 source pixels.

Frame 0: crop {"left":35,"top":112,"width":449,"height":548}, resized 118x144, placement {"left":30,"top":12}.

Frame 1: crop {"left":578,"top":112,"width":453,"height":548}, resized 119x144, placement {"left":28,"top":12}.

Frame 2: crop {"left":1145,"top":97,"width":438,"height":565}, resized 112x144, placement {"left":39,"top":12}.

Frame 3: crop {"left":1660,"top":112,"width":449,"height":547}, resized 118x144, placement {"left":29,"top":12}.

## Guard_Animations/Guard_battle_Riled.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 5239 source pixels.

Frame 0: crop {"left":83,"top":112,"width":402,"height":556}, resized 104x144, placement {"left":44,"top":12}.

Frame 1: crop {"left":629,"top":114,"width":401,"height":552}, resized 105x144, placement {"left":44,"top":12}.

Frame 2: crop {"left":1137,"top":142,"width":442,"height":521}, resized 122x144, placement {"left":30,"top":12}.

Frame 3: crop {"left":1711,"top":109,"width":401,"height":555}, resized 104x144, placement {"left":43,"top":12}.

## Guard_Animations/Guard_battle_Victory.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 1512 source pixels.

Frame 0: crop {"left":31,"top":111,"width":436,"height":549}, resized 114x144, placement {"left":33,"top":12}.

Frame 1: crop {"left":516,"top":95,"width":352,"height":567}, resized 89x144, placement {"left":51,"top":12}.

Frame 2: crop {"left":930,"top":97,"width":359,"height":563}, resized 92x144, placement {"left":50,"top":12}.

Frame 3: crop {"left":1376,"top":111,"width":345,"height":551}, resized 90x144, placement {"left":53,"top":12}.

Frame 4: crop {"left":1802,"top":96,"width":321,"height":567}, resized 81x144, placement {"left":56,"top":12}.

## Guard_Animations/Guard_battle_defeat.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 4933 source pixels.

Frame 0: crop {"left":0,"top":176,"width":340,"height":420}, resized 117x144, placement {"left":31,"top":12}.

Frame 1: crop {"left":350,"top":192,"width":332,"height":405}, resized 114x139, placement {"left":30,"top":17}.

Frame 2: crop {"left":740,"top":240,"width":288,"height":357}, resized 98x122, placement {"left":47,"top":34}.

Frame 3: crop {"left":1069,"top":242,"width":359,"height":353}, resized 123x121, placement {"left":32,"top":35}.

Frame 4: crop {"left":1433,"top":256,"width":369,"height":339}, resized 127x116, placement {"left":30,"top":40}.

Frame 5: crop {"left":1807,"top":256,"width":365,"height":342}, resized 125x117, placement {"left":32,"top":39}.

## Guard_Animations/Guard_battle_whistle.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 936 source pixels.

Frame 0: crop {"left":19,"top":139,"width":355,"height":474}, resized 108x144, placement {"left":39,"top":12}.

Frame 1: crop {"left":397,"top":130,"width":335,"height":483}, resized 101x144, placement {"left":46,"top":12}.

Frame 2: crop {"left":753,"top":142,"width":343,"height":472}, resized 104x144, placement {"left":46,"top":12}.

Frame 3: crop {"left":1121,"top":140,"width":333,"height":472}, resized 102x144, placement {"left":46,"top":12}.

Frame 4: crop {"left":1481,"top":141,"width":329,"height":471}, resized 101x144, placement {"left":46,"top":12}.

Frame 5: crop {"left":1834,"top":139,"width":338,"height":474}, resized 104x144, placement {"left":41,"top":12}.

## Guard_Animations/Guard_battle_fall.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 1753 source pixels.

Frame 0: crop {"left":24,"top":205,"width":331,"height":318}, resized 146x140, placement {"left":15,"top":16}.

Frame 1: crop {"left":340,"top":203,"width":310,"height":320}, resized 129x132, placement {"left":2,"top":24}.

Frame 2: crop {"left":661,"top":194,"width":331,"height":328}, resized 145x144, placement {"left":22,"top":12}.

Frame 3: crop {"left":1009,"top":249,"width":385,"height":234}, resized 151x92, placement {"left":2,"top":64}.

Frame 4: crop {"left":1391,"top":356,"width":369,"height":163}, resized 163x72, placement {"left":15,"top":84}.

Frame 5: crop {"left":1775,"top":384,"width":380,"height":139}, resized 167x61, placement {"left":13,"top":95}.

## Guard_Animations/Guard_battle_getup.png

Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid. Detached alpha debris excluded: 0 source pixels.

Frame 0: crop {"left":18,"top":379,"width":282,"height":118}, resized 136x57, placement {"left":28,"top":99}.

Frame 1: crop {"left":318,"top":341,"width":254,"height":155}, resized 121x74, placement {"left":36,"top":82}.

Frame 2: crop {"left":591,"top":310,"width":238,"height":189}, resized 115x91, placement {"left":39,"top":65}.

Frame 3: crop {"left":853,"top":273,"width":207,"height":230}, resized 99x110, placement {"left":47,"top":46}.

Frame 4: crop {"left":1136,"top":248,"width":198,"height":255}, resized 95x122, placement {"left":47,"top":34}.

Frame 5: crop {"left":1395,"top":231,"width":200,"height":271}, resized 96x130, placement {"left":50,"top":26}.

Frame 6: crop {"left":1654,"top":215,"width":213,"height":287}, resized 102x138, placement {"left":44,"top":18}.

Frame 7: crop {"left":1925,"top":202,"width":217,"height":300}, resized 104x144, placement {"left":44,"top":12}.

Output: transparent 192x160 PNGs, character height normally 144 pixels (wide extensions fit proportionally), feet baseline 155. Catch Breath would benefit from a clean transparent source; Call Wife would benefit from separated shadows/poses. Both currently have explicit extraction regions. Both defeat sheets are integrated; Guard defeat preserves falling body scale.
