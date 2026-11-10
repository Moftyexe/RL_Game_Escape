import { components } from './spriteComponents.mjs';
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'public/assets/battle');
// Visually inspected assignments only. Punch contact is frame 3 (zero-based).
const sources = [
    ['P_Animations/Protagonist_Battle_idle stance.png', 'player', 'idle', 4, 4, null],
    ['P_Animations/Protagonist_Battle_BasicATKpng.png', 'player', 'attack', 6, 10, 3],
    ['P_Animations/Protagonist_Battle_Defensepng.png', 'player', 'defend', 4, 8, null],
    ['Guard_Animations/Guard_battle_idle.png', 'guard', 'idle', 4, 4, null],
    ['Guard_Animations/Guard_battle_BasicAtk.png', 'guard', 'attack', 6, 10, 3],
    ['P_Animations/Protagonist_Battle_Lockin.png', 'player', 'lock-in', 5, 8, null],
    ['P_Animations/Protagonist_Battle_LookThere.png', 'player', 'look-there', 6, 8, null],
    ['P_Animations/Protagonist_Battle_Talk smack.png', 'player', 'talk-smack', 6, 8, null],
    ['P_Animations/Protagonist_Battle_Bagthrow.png', 'player', 'backpack', 6, 10, 4],
    ['P_Animations/Protagonist_Battle_catchBreath.png', 'player', 'catch-breath', 5, 8, null],
    ['P_Animations/Protagonist_Battle_Criticalhitpng.png', 'player', 'critical', 6, 10, 3],
    ['P_Animations/Protagonist_Battle_hurtpng.png', 'player', 'hurt', 4, 10, null],
    ['Guard_Animations/Guard_battle_callwife.png', 'guard', 'call-wife', 8, 10, null],
    ['Guard_Animations/Guard_battle_crackknuckles.png', 'guard', 'crack-knuckles', 6, 8, null],
    ['Guard_Animations/Guard_battle_CritAtk.png', 'guard', 'critical', 6, 10, 3],
    ['Guard_Animations/Guard_battle_defend.png', 'guard', 'defend', 4, 8, null],
    ['Guard_Animations/Guard_battle_eatdonut.png', 'guard', 'eat-donut', 8, 10, null],
    ['Guard_Animations/Guard_battle_hurt.png', 'guard', 'hurt', 4, 10, null],
    ['P_Animations/Protagonist_Battle_Defeat.png', 'player', 'defeat', 5, 10, null],
    ['P_Animations/Protagonist_Battle_victory.png', 'player', 'victory', 5, 10, null],
    ['Guard_Animations/Guard_battle_Distracted.png', 'guard', 'distracted', 4, 10, null],
    ['Guard_Animations/Guard_battle_Riled.png', 'guard', 'riled', 4, 4, null],
    ['Guard_Animations/Guard_battle_Victory.png', 'guard', 'victory', 5, 7, null],
    ['Guard_Animations/Guard_battle_defeat.png', 'guard', 'defeat', 6, 10, null],
    ['Guard_Animations/Guard_battle_whistle.png', 'guard', 'blow-whistle', 6, 8, null],
    ['Guard_Animations/Guard_battle_fall.png', 'guard', 'stumble', 6, 10, null],
    ['Guard_Animations/Guard_battle_getup.png', 'guard', 'recovery', 8, 10, null]
];

// Measured pose regions, NOT an equal-cell assumption. Keep only the largest
// connected silhouette inside each region, excluding the phone's joined floor
// shadow and Catch Breath's contaminated outer background.
const regions = {
    'player/catch-breath': [[70, 55, 310, 625], [490, 65, 310, 615], [900, 95, 330, 585],
        [1320, 125, 350, 555], [1770, 55, 310, 625]],
    'guard/call-wife': [0, 295, 565, 835, 1090, 1353, 1618, 1873].map((left, i, xs) =>
        [left, 140, (xs[i + 1] ?? 2170) - left, 450])
};


await mkdir(out, { recursive: true });
const manifest = { canvas: { width: 192, height: 160, baseline: 155, characterHeight: 144 }, animations: {} };
const report = { normalization: manifest.canvas, sheets: [], ambiguousFiles: [],
    notes: [
        'Frames are alpha-connected silhouettes, not equal-width cells. Small detached generation debris is excluded.',
        'Nearest-neighbour proportional resizing; final alpha trimmed; feet centers anchored at x=96, baseline y=155.',
        'All Player sheets face right; all Guard battle sheets face left. No horizontal flipping.',
        'Inspected Player and Guard skills, defense, hurt and critical attacks are integrated. Player/Guard victory, Guard defeat and status idles are integrated. Player defeat is integrated; only stunned art is absent.',
        'Catch Breath has contaminated background pixels; explicit regions isolate poses. Call Wife has a joined floor shadow; explicit regions separate its eight poses.',
        'Connectivity ignores alpha below 16/255 for Catch Breath and 32/255 for Call Wife; retained silhouette pixels preserve original alpha.',
        'Backpack frame 4 fits proportionally to 132 px high and Guard critical frame 3 to 125 px high to avoid clipping wide extensions. Other frames normalize to 144 px.',
        'Guard_Animations/Guard_idle.png (2172x724, four poses) is hallway idle, not a battle action.'
        ,'Fall has six poses; get-up has eight, ordered left-to-right. Alpha below 32 bridges adjacent source poses; ignore it for connectivity. Normalize both with fixed proportional body scale from their tallest pose, baseline 155. Fall holds downed pose 300 ms; recovery restores the current persistent stance. Missing optional sheets use hurt fallback.'
    ] };
const preview = [];
for (const [row, [source, character, action, expected, frameRate, impactFrame]] of sources.entries()) {
    const input = await readFile(path.join(root, source)).catch(error => {
        if (error.code !== 'ENOENT' || !['stumble', 'recovery'].includes(action)) throw error;
        report.ambiguousFiles.push({ source, reason: 'Optional art missing; runtime uses hurt fallback.' });
        return null;
    });
    if (!input) continue;
    const metadata = await sharp(input).metadata();
    if (!metadata.hasAlpha) throw new Error(`${source}: expected transparency; inspect before processing.`);
    const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const manualRegions = regions[`${character}/${action}`];
    const alphaConnectivityThreshold = ['call-wife', 'stumble', 'recovery'].includes(action) ? 32 : manualRegions ? 16 : 1;
    const connectivity = Buffer.from(data);
    if (['stumble', 'recovery'].includes(action)) for (let i = 3; i < connectivity.length; i += 4) if (connectivity[i] < alphaConnectivityThreshold) connectivity[i] = 0;
    let { poses, discardedPixels } = components(connectivity, info.width, info.height);
    if (manualRegions) {
        poses = manualRegions.map(([left, top, width, height]) => {
            const local = Buffer.alloc(width * height * 4);
            for (let y = 0; y < height; y++) data.copy(local, y * width * 4,
                ((top + y) * info.width + left) * 4, ((top + y) * info.width + left + width) * 4);
            // Near-invisible alpha (often 1/255) joins the background/shadow to
            // the bodies in these two assets. Preserve original alpha on the
            // retained silhouette, but do not let that noise define connectivity.
            for (let p = 3; p < local.length; p += 4) if (local[p] < alphaConnectivityThreshold) local[p] = 0;
            const pose = components(local, width, height).poses.sort((a, b) => b.pixels.length - a.pixels.length)[0];
            if (!pose) throw new Error(`${source}: empty explicit pose region`);
            return { crop: { ...pose.crop, left: pose.crop.left + left, top: pose.crop.top + top },
                pixels: Int32Array.from(pose.pixels, p => (Math.floor(p / width) + top) * info.width + p % width + left) };
        });
        discardedPixels = data.filter((_, i) => i % 4 === 3 && data[i] > 0).length - poses.reduce((n, p) => n + p.pixels.length, 0);
    }
    if (poses.length !== expected) throw new Error(`${source}: expected ${expected} inspected poses, found ${poses.length}. Define explicit regions after inspection.`);
    const key = `${character}-battle-${action}`;
    const entry = { character, action, frameRate, repeat: ['idle', 'riled'].includes(action) ? -1 : 0, impactFrame, frames: [] };
    const sheet = { source, character, action, dimensions: [info.width, info.height], frameCount: poses.length,
        sha256: createHash('sha256').update(input).digest('hex'), hasAlpha: true,
        layout: 'Single row, approximately regular placement; unequal character widths and gaps. Detect alpha bounds, not a uniform grid.',
        manualRegions: manualRegions ?? null, alphaConnectivityThreshold, discardedPixels, frames: [] };
    await mkdir(path.join(out, character, action), { recursive: true });
    for (const [index, { crop, pixels }] of poses.entries()) {
        const isolated = Buffer.alloc(crop.width * crop.height * 4);
        for (const p of pixels) {
            const offset = ((Math.floor(p / info.width) - crop.top) * crop.width + p % info.width - crop.left) * 4;
            data.copy(isolated, offset, p * 4, p * 4 + 4);
        }
        // Height sets body size; the wider canvas leaves room for extended fists.
        // Falling poses preserve body scale instead of stretching seated silhouettes.
        const targetHeight = ['stumble', 'recovery'].includes(action) ? Math.round(144 * crop.height / Math.max(...poses.map(p => p.crop.height))) : action === 'defeat' ? Math.round(144 * crop.height / poses[0].crop.height) : 144;
        const scale = targetHeight / crop.height;
        const scaled = await sharp(isolated, { raw: { width: crop.width, height: crop.height, channels: 4 } })
            .resize(Math.round(crop.width * scale), targetHeight, { kernel: 'nearest', fit: 'fill' }).png().toBuffer();
        let { data: trimmed, info: size } = await sharp(scaled).trim({ background: '#00000000', threshold: 0 })
            .png().toBuffer({ resolveWithObject: true });
        // Nearest sampling may miss a thin alpha edge (up to three rows in the
        // inspected punch sheet). Proportionally fit the trimmed result once
        // more so those lost rows do not make a pose visibly smaller.
        if (size.height < targetHeight) {
            const corrected = await sharp(trimmed).resize(Math.round(size.width * targetHeight / size.height), targetHeight,
                { kernel: 'nearest', fit: 'fill' }).png().toBuffer({ resolveWithObject: true });
            trimmed = corrected.data; size = corrected.info;
        }
        const feet = async () => {
            const rgba = await sharp(trimmed).ensureAlpha().raw().toBuffer();
            let footLeft = size.width, footRight = -1;
            for (let y = Math.max(0, size.height - 20); y < size.height; y++) for (let x = 0; x < size.width; x++) {
                if (rgba[(y * size.width + x) * 4 + 3]) { footLeft = Math.min(footLeft, x); footRight = Math.max(footRight, x); }
            }
            return [footLeft, footRight];
        };
        let [footLeft, footRight] = await feet();
        // An extended backpack exceeds the foot-centered canvas at height 144.
        // Fit the WHOLE pose proportionally rather than stretch, shift or clip it.
        const center = (footLeft + footRight + 1) / 2;
        const fit = Math.min(1, 94 / center, 94 / (size.width - center));
        if (fit < 1) {
            const fitted = await sharp(trimmed).resize(Math.floor(size.width * fit), Math.floor(size.height * fit),
                { kernel: 'nearest', fit: 'fill' }).png().toBuffer({ resolveWithObject: true });
            trimmed = fitted.data; size = fitted.info;
            [footLeft, footRight] = await feet();
        }
        const left = Math.round(96 - (footLeft + footRight + 1) / 2), top = 156 - size.height;
        if (left < 0 || left + size.width > 192 || top < 0) throw new Error(`${source}, frame ${index}: pose would be clipped; inspect canvas size.`);
        const frame = await sharp({ create: { width: 192, height: 160, channels: 4, background: '#00000000' } })
            .composite([{ input: trimmed, left, top }]).png().toBuffer();
        const url = `assets/battle/${character}/${action}/${index}.png`;
        await writeFile(path.join(root, 'public', url), frame);
        entry.frames.push(url);
        sheet.frames.push({ index, alphaBounds: crop, resized: [size.width, size.height], placement: { left, top }, footCenter: left + (footLeft + footRight + 1) / 2 });
        preview.push({ input: frame, left: index * 192, top: row * 160 });
    }
    manifest.animations[key] = entry;
    report.sheets.push(sheet);
    console.log(`${source}: ${info.width}x${info.height}, ${poses.length} frames -> ${key}`);
}
await writeFile(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(path.join(out, 'inspection.json'), JSON.stringify(report, null, 2) + '\n');
let markdown = '# Battle animation inspection\n\n' + report.notes.map(n => `- ${n}`).join('\n') + '\n\n';
markdown += '| Source | Dimensions | Frames | Mapping |\n|---|---|---|---|\n';
markdown += report.sheets.map(s => `| ${s.source} | ${s.dimensions.join(' x ')} | ${s.frameCount} | ${s.character}: ${s.action} |`).join('\n');
markdown += '\n\n## Complete action mapping\n\n| Action | Player | Guard |\n|---|---|---|\n';
const mappings = [
    ['Battle idle', 'player-battle-idle', 'guard-battle-idle'],
    ['Basic attack', 'player-battle-attack', 'guard-battle-attack'],
    ['Defend', 'player-battle-defend', 'guard-battle-defend'],
    ['Bro, Lock In / Crack Knuckles', 'player-battle-lock-in', 'guard-battle-crack-knuckles'],
    ['Talk Smack / Blow Whistle', 'player-battle-talk-smack', 'guard-battle-blow-whistle'],
    ['Look There! / Call Wife', 'player-battle-look-there', 'guard-battle-call-wife'],
    ['Swing Backpack / Eat Donut', 'player-battle-backpack', 'guard-battle-eat-donut'],
    ['Catch breath', 'player-battle-catch-breath', 'Not a Guard action'],
    ['Hurt', 'player-battle-hurt', 'guard-battle-hurt'],
    ['Dedicated critical', 'player-battle-critical', 'guard-battle-critical'],
    ['Victory', 'player-battle-victory', 'guard-battle-victory'], ['Defeat', 'player-battle-defeat', 'guard-battle-defeat'], ['Status idles', 'No dedicated sheet', 'guard-battle-distracted / guard-battle-riled']
];
markdown += mappings.map(row => `| ${row.join(' | ')} |`).join('\n');
markdown += '\n\nNO MATCH uses continuous battle idle. Critical basic attacks fall back to their basic attack when dedicated art is unavailable; skills retain their own mapping.\n\n';
for (const s of report.sheets) {
    markdown += `## ${s.source}\n\n${s.layout} Detached alpha debris excluded: ${s.discardedPixels} source pixels.\n\n`;
    if (s.manualRegions) markdown += `Explicit regions [left, top, width, height]: ${JSON.stringify(s.manualRegions)}\n\n`;
    markdown += s.frames.map(f => `Frame ${f.index}: crop ${JSON.stringify(f.alphaBounds)}, resized ${f.resized.join('x')}, placement ${JSON.stringify(f.placement)}.`).join('\n\n') + '\n\n';
}
markdown += 'Output: transparent 192x160 PNGs, character height normally 144 pixels (wide extensions fit proportionally), feet baseline 155. Catch Breath would benefit from a clean transparent source; Call Wife would benefit from separated shadows/poses. Both currently have explicit extraction regions. Both defeat sheets are integrated; Guard defeat preserves falling body scale.\n';
await writeFile(path.join(out, 'inspection.md'), markdown);
await sharp({ create: { width: 1536, height: sources.length * 160, channels: 4, background: '#66717b' } })
    .composite(preview).png().toFile(path.join(out, 'preview.png'));
