# Hallway layout verification

Current BG.png: 2048x688, opaque (including black padding). Interior crop: {"x":18,"y":63,"width":2012,"height":600}.
The back-wall/floor seam is near source y=344. Exit door: source x approximately 1905-1970, threshold y approximately 440-500.
Walkable foot band: source y=400-625, perspective side edges measured in hallwayLayout.js.

At 1024x768: background scale 1.28, world 2575.36x768.
Player feet: (290.56, 533.76), scale 1.00.
Guard feet: (2396.16, 559.36), scale 1.00.
World walkable y: 431.36-719.36.
Interaction: Guard foot position, radius 150. Camera tracking remains 0.12/0.12, clamped to the cropped room.

Movement remains 400 px/s with normalized diagonals. Movement always uses running animations; Shift is not required. Both characters use their original display scale of 1 at 1024x768.
Only the side run source was newly replaced (10 poses at 11 FPS). Existing front/rear runs remain 6 poses at 12 FPS until new source art is supplied.

Previews use actual processed frames and nearest-neighbour scaling. They verify static placement, not live input/camera smoothness or animation transitions.
