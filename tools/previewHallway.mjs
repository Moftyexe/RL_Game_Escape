import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { HALLWAY, createHallwayLayout } from '../src/game/exploration/hallwayLayout.js';

// Static visual QA using the exact runtime crop, foot origin and display scales.
// These previews are documentation artifacts, never loaded by the game.
const root = fileURLToPath(new URL('../', import.meta.url));
const layout = createHallwayLayout(1024, 768);
const layers = [];
for (const [frame, actor] of [['public/assets/player/movement/idle_down/0.png', layout.player],
    ['public/assets/guard/idle/0.png', layout.guard]]) {
    const size = Math.round(128 * actor.scale);
    layers.push({ input: await sharp(path.join(root, frame)).resize(size, size, { kernel: 'nearest' }).toBuffer(),
        left: Math.round(actor.x - size / 2), top: Math.round(actor.y - size * 125 / 128) });
}
const room = await sharp(path.join(root, 'BG.png')).extract({ left: layout.crop.x, top: layout.crop.y,
    width: layout.crop.width, height: layout.crop.height })
    .resize(Math.round(layout.worldWidth), Math.round(layout.worldHeight), { kernel: 'nearest' })
    .composite(layers).png().toBuffer();
await mkdir(path.join(root, 'docs'), { recursive: true });
await writeFile(path.join(root, 'docs/exploration-layout-preview.png'), room);
await sharp(room).extract({ left: 0, top: 0, width: 1024, height: 768 }).toFile(path.join(root, 'docs/exploration-camera-start.png'));
await sharp(room).extract({ left: Math.round(layout.worldWidth) - 1024, top: 0, width: 1024, height: 768 })
    .toFile(path.join(root, 'docs/exploration-camera-exit.png'));
await writeFile(path.join(root, 'docs/EXPLORATION_LAYOUT.md'), `# Hallway layout verification

Current BG.png: 2048x688, opaque (including black padding). Interior crop: ${JSON.stringify(HALLWAY.crop)}.
The back-wall/floor seam is near source y=344. Exit door: source x approximately 1905-1970, threshold y approximately 440-500.
Walkable foot band: source y=${HALLWAY.floor.top}-${HALLWAY.floor.bottom}, perspective side edges measured in hallwayLayout.js.

At 1024x768: background scale ${layout.backgroundScale}, world ${layout.worldWidth}x${layout.worldHeight}.
Player feet: (${layout.player.x.toFixed(2)}, ${layout.player.y.toFixed(2)}), scale ${layout.player.scale.toFixed(2)}.
Guard feet: (${layout.guard.x.toFixed(2)}, ${layout.guard.y.toFixed(2)}), scale ${layout.guard.scale.toFixed(2)}.
World walkable y: ${layout.floor.top.toFixed(2)}-${layout.floor.bottom.toFixed(2)}.
Interaction: Guard foot position, radius ${layout.interactionRadius.toFixed(0)}. Camera tracking remains 0.12/0.12, clamped to the cropped room.

Movement remains 400 px/s with normalized diagonals. Movement always uses running animations; Shift is not required. Both characters use their original display scale of 1 at 1024x768.
Only the side run source was newly replaced (10 poses at 11 FPS). Existing front/rear runs remain 6 poses at 12 FPS until new source art is supplied.

Previews use actual processed frames and nearest-neighbour scaling. They verify static placement, not live input/camera smoothness or animation transitions.
`);
console.log('Wrote exploration layout and both camera-end previews under docs/.');
