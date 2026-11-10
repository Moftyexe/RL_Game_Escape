import sharp from 'sharp';
import { readdir, mkdir, writeFile, readFile, rename, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {existsSync} from 'node:fs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceDir = path.join(root, 'P_Animations');
const outputDir = path.join(root, 'public/assets/player/movement');
const runsOnly = process.argv.includes('--runs-only');
const activeVideo=JSON.parse(await readFile(path.join(sourceDir,'active-run-video.json'),'utf8').catch(()=>' {"stem":"3-run-side"}'));
if(!/^[\w-]+$/.test(activeVideo.stem))throw Error('Invalid video run source selector');
const videoRun=existsSync(path.join(sourceDir,activeVideo.stem+'.png'))
    ? JSON.parse(await readFile(path.join(sourceDir,activeVideo.stem+'.json'),'utf8')) : null;
if(videoRun){
    for(const[file,expected]of [[videoRun.video,videoRun.videoSha256],[videoRun.sheet,videoRun.sheetSha256]])
        if(createHash('sha256').update(await readFile(path.join(root,file))).digest('hex')!==expected)throw Error('Stale video run extraction: '+file);
}
// Mappings were checked visually: source filenames do not always describe the view.
const sources = [
    ['Pixel Art Protagonist Idle Animation Frames.png', 'idle_down', 4],
    ['Pixel-Art Front Walk Cycle Sprite Sheet.png', 'walk_down', 4],
    ['Pixel Art Afro Character Idle Spritesheet.png', 'idle_side', 4],
    ['Pixel-Art Walking Cycle Sprite Sheet.png', 'walk_side', 6],
    ['Pixel-Art Character Idle Animation Sprite Sheet.png', 'idle_up', 4],
    ['Rear-View Pixel Character Walk Cycle.png', 'walk_up', 4],
    ['Six-Frame Pixel Art Run Cycle.png', 'run_down', 6],
    [videoRun?path.basename(videoRun.sheet):'Pixel Running Cycle Sprite Sheet.png', 'run_side', videoRun?8:10],
    ['Pixel Runner Back-View Sprite Sheet.png', 'run_up', 6],
    ['Pixel-Art Runner Sprite Sheet.png', null, 6]
];

// Flood fill actual alpha, rather than slicing a grid. Large connected components
// are poses; detached generation debris is excluded. Every retained pixel keeps
// its original alpha. Fail closed if a changed sheet no longer has the known count.
function detectPoses(data, width, height) {
    const seen = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    const components = [];
    for (let p = 0; p < seen.length; p++) {
        if (seen[p] || data[p * 4 + 3] === 0) continue;
        let head = 0, tail = 1;
        queue[0] = p;
        seen[p] = 1;
        let left = width, top = height, right = 0, bottom = 0;
        while (head < tail) {
            const current = queue[head++];
            const x = current % width, y = Math.floor(current / width);
            left = Math.min(left, x); right = Math.max(right, x);
            top = Math.min(top, y); bottom = Math.max(bottom, y);
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                const n = ny * width + nx;
                if (!seen[n] && data[n * 4 + 3] > 0) {
                    seen[n] = 1; queue[tail++] = n;
                }
            }
        }
        if (tail >= 10000) components.push({
            crop: { left, top, width: right - left + 1, height: bottom - top + 1 },
            pixels: queue.slice(0, tail)
        });
    }
    return components.sort((a, b) => a.crop.left - b.crop.left);
}

// Generate and validate the entire batch in memory before replacing any PNG.
// A bad/new source must not leave the working movement assets half-overwritten.
const previousReport = JSON.parse(await readFile(path.join(outputDir, 'processing-report.json'), 'utf8').catch(() => '{"sheets":[]}'));
const outputs = new Map();
const report = { output: { width: 256, height: 256, baseline: 249, characterHeight: 240 },
    detection: '8-connected alpha > 0; pose components >= 10000 pixels; detached debris excluded',
    unreliableFrames: [], sheets: runsOnly ? previousReport.sheets.filter(sheet => !sheet.animation?.startsWith('run_')) : [], notes: [
        videoRun?`Side run uses eight chronological poses from${path.basename(videoRun.video)}; deterministic background removal and framing stabilization precede this shared normalization pipeline.`:'The side run source has ten inspected right-facing poses, not equal-width cells.',
        'Running uses one scale and a common source floor per sheet, plus a head-center horizontal anchor. Airborne visible feet may be above the logical baseline 249; head height is not shifted to force every foot down.',
        'Front and rear run sources currently contain six poses each; no new eight-pose front/rear sheet was present.',
        'Side run uses alpha >= 16/255 for connectivity to exclude background debris joining poses; retained pixels preserve their original alpha.',
        'All movement/idle frames now use a 256x256 canvas, 240 px character height, and baseline 249; runtime scales are halved to preserve apparent size. All outputs are generated and structurally validated before any existing PNG is replaced.'
    ] };
const manifest = runsOnly ? JSON.parse(await readFile(path.join(outputDir, 'manifest.json'), 'utf8')) : {};
const runManifest = { version: 1, animations: {} };
const preview = [];
for (const [filename, animation, expected] of sources) {
    if (runsOnly && !animation?.startsWith('run_')) continue;
    const input = await readFile(path.join(sourceDir, filename));
    const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    // This inspected sheet has opaque generation debris along its bottom edge
    // connecting otherwise separate poses. Keep the character band explicitly.
    const analysisRegion = filename === 'Six-Frame Pixel Art Run Cycle.png'
        ? { left: 0, top: 95, width: info.width, height: 520 } : null;
    if (analysisRegion) {
        for (let y = 0; y < info.height; y++) if (y < 95 || y >= 615) {
            for (let x = 0; x < info.width; x++) data[(y * info.width + x) * 4 + 3] = 0;
        }
    }
    const detectionData = animation === 'run_side' ? Buffer.from(data) : data;
    if (animation === 'run_side') {
        for (let p = 3; p < detectionData.length; p += 4) if (detectionData[p] < 16) detectionData[p] = 0;
    }
    const poses = detectPoses(detectionData, info.width, info.height);
    if (poses.length !== expected) throw new Error(`${filename}: expected ${expected} poses, found ${poses.length}; inspect and specify explicit regions before exporting.`);
    const sheet = { source: filename, sha256: createHash('sha256').update(input).digest('hex'),
        dimensions: [info.width, info.height], analysisRegion, animation, detectedFrames: poses.length,
        exportedFrames: animation ? poses.length : 0,
        normalizationReferenceHeight: animation?.startsWith('run_') ? Math.max(...poses.map(pose => pose.crop.top + pose.crop.height)) - Math.min(...poses.map(pose => pose.crop.top)) : null,
        sourceFloor: animation?.startsWith('run_') ? Math.max(...poses.map(pose => pose.crop.top + pose.crop.height)) : null,
        note: animation ? '' : 'Inspected alternate rear-run sheet; canonical run_up uses Pixel Runner Back-View Sprite Sheet.png.', frames: [] };
    const previous = previousReport.sheets.find(entry => entry.source === filename)??previousReport.sheets.find(entry=>animation&&entry.animation===animation);
    sheet.replaces = previous && previous.sha256 !== sheet.sha256
        ? { sha256: previous.sha256, dimensions: previous.dimensions, frames: previous.detectedFrames }
        : previous?.replaces ?? null;
    sheet.orientation = animation?.endsWith('_side') ? 'right' : animation?.endsWith('_up') || !animation ? 'rear' : 'front';
    sheet.layout = 'Single row of detected alpha-connected poses; unequal silhouette widths and gaps, no uniform grid slicing.';
    if (animation) {
        manifest[animation] = poses.length;
        // Obsolete generated numeric frames are removed only after the whole
        // replacement batch validates; source art is never removed.
    }
    if (animation?.startsWith('run_')) runManifest.animations[animation] = { source: filename, sourceSha256: sheet.sha256,
        frameRate:animation==='run_side'&&videoRun?videoRun.frameRate:12,
        ...(animation==='run_side'&&videoRun?{videoSource:{file:path.basename(videoRun.video),sha256:videoRun.videoSha256,sourceIndices:videoRun.sourceIndices}}:{}),frames: [] };
    for (const [index, pose] of poses.entries()) {
        const { crop } = pose;
        // A single proportional fit, never independent width/height scaling.
        // The wider canvas accommodates the airborne stride at the same visible
        // height as standing poses without clipping or stretching it.
        const referenceHeight = sheet.normalizationReferenceHeight ?? crop.height;
        const scale = Math.min(240 / referenceHeight, 248 / crop.width);
        const width = Math.round(crop.width * scale), height = Math.round(crop.height * scale);
        const left = Math.floor((256 - width) / 2), top = 250 - height;
        sheet.frames.push({ index, alphaBounds: crop, cropBounds: crop,
            resized: [width, height], placement: { left, top }, baseline: 249 });
        if (!animation) continue;
        const isolated = Buffer.alloc(crop.width * crop.height * 4);
        for (const p of pose.pixels) {
            const target = ((Math.floor(p / info.width) - crop.top) * crop.width + p % info.width - crop.left) * 4;
            data.copy(isolated, target, p * 4, p * 4 + 4);
        }
        const scaled = await sharp(isolated, { raw: { width: crop.width, height: crop.height, channels: 4 } })
            .resize(width, height, { kernel: 'nearest', fit: 'fill' }).png().toBuffer();
        // Downsampling can discard the last opaque row/column. Re-trim the
        // sampled alpha before positioning, so the visible feet meet y=249.
        let resized, sampled, finalLeft, finalTop;
        if (sheet.sourceFloor != null) {
            const rgba = await sharp(scaled).ensureAlpha().raw().toBuffer();
            let minX = width, minY = height, maxX = -1, maxY = -1;
            for (let p = 0; p < width * height; p++) if (rgba[p * 4 + 3]) {
                const x = p % width, y = Math.floor(p / width);
                minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
            }
            const trimmed = await sharp(scaled).extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 }).png().toBuffer({ resolveWithObject: true });
            resized = trimmed.data; sampled = trimmed.info;
            // Preserve the source row's shared floor/head height. Do not push an
            // airborne foot down and inadvertently drop the whole torso/head.
            finalTop = 250 - Math.round((sheet.sourceFloor - crop.top) * scale) + minY;
            const body = await sharp(resized).ensureAlpha().raw().toBuffer();
            let sum = 0, weight = 0;
            for (let y = 0; y < Math.min(60, sampled.height); y++) for (let x = 0; x < sampled.width; x++) {
                const alpha = body[(y * sampled.width + x) * 4 + 3];
                sum += (x + 0.5) * alpha; weight += alpha;
            }
            const headCenter = sum / weight;
            finalLeft = Math.round(128 - headCenter);
            Object.assign(sheet.frames.at(-1), { headCenterX: finalLeft + headCenter,
                anchor: 'common source floor; top-60px head alpha centroid centered at x=128', sourceScale: scale,
                sampling:{width,height,trim:{left:minX,top:minY,right:width-1-maxX,bottom:height-1-maxY}} });
        } else {
            const trimmed = await sharp(scaled).trim({ background: '#00000000', threshold: 0 }).png().toBuffer({ resolveWithObject: true });
            resized = trimmed.data; sampled = trimmed.info;
            finalLeft = Math.floor((256 - sampled.width) / 2); finalTop = 250 - sampled.height;
        }
        if (finalLeft < 0 || finalTop < 0 || finalLeft + sampled.width > 256 || finalTop + sampled.height > 250)
            throw new Error(filename + ', frame ' + index + ': pose would clip');
        Object.assign(sheet.frames.at(-1), { resized: [sampled.width, sampled.height], placement: { left: finalLeft, top: finalTop }, baseline: finalTop + sampled.height - 1 });
        const frame = await sharp({ create: { width: 256, height: 256, channels: 4, background: '#00000000' } })
            .composite([{ input: resized, left: finalLeft, top: finalTop }]).png().toBuffer();
        const { data: rgba, info: check } = await sharp(frame).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        let bottom = -1;
        for (let p = 0; p < 256 * 256; p++) if (rgba[p * 4 + 3]) bottom = Math.max(bottom, Math.floor(p / 256));
        if (check.width !== 256 || check.height !== 256 || (sheet.sourceFloor != null ? bottom > 249 : bottom !== 249) || rgba[3] !== 0) {
            throw new Error(`${filename}, frame ${index}: normalized frame validation failed; existing assets preserved.`);
        }
        outputs.set(path.join(animation, `${index}.png`), frame);
        if (runManifest.animations[animation]) runManifest.animations[animation].frames.push({ index, sourcePoseIndex: index,
            file: `assets/player/movement/${animation}/${index}.png`, sha256: createHash('sha256').update(frame).digest('hex'),
            sourceCropSha256: createHash('sha256').update(isolated).digest('hex') });
        preview.push({ input: frame, left: index * 256, top: (Object.keys(manifest).length - 1) * 256 });
    }
    report.sheets.push(sheet);
    console.log(`${filename}: ${info.width}x${info.height}, ${poses.length} poses, ${sheet.exportedFrames} exported`);
}
for (const [filename, frame] of outputs) {
    await mkdir(path.dirname(path.join(outputDir, filename)), { recursive: true });
    const target = path.join(outputDir, filename);
    await writeFile(target + '.pending', frame);
    await rename(target + '.pending', target);
}
for (const [animation, count] of Object.entries(manifest)) {
    if (runsOnly && !animation.startsWith('run_')) continue;
    for (const name of await readdir(path.join(outputDir, animation))) {
        if (/^\d+\.png$/.test(name) && Number(name.slice(0, -4)) >= count) {
            await unlink(path.join(outputDir, animation, name));
        }
    }
}
report.sheets.sort((a, b) => sources.findIndex(source => source[0] === a.source) - sources.findIndex(source => source[0] === b.source));
for (const entry of Object.values(runManifest.animations)) entry.revision = createHash('sha256').update(entry.frames.map(frame => frame.sha256).join('')).digest('hex').slice(0, 12);
await writeFile(path.join(outputDir, 'run-manifest.json'), JSON.stringify(runManifest, null, 2) + '\n');
await writeFile(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(path.join(outputDir, 'processing-report.json'), JSON.stringify(report, null, 2) + '\n');
let markdown = '# Player movement sprite processing\n\n' + report.notes.map(note => `- ${note}`).join('\n') + '\n\n';
markdown += 'Output: transparent 256x256, nearest-neighbour proportional fit, character height up to 240 px, logical floor baseline 249. Run poses preserve source airborne foot lift and use head-center horizontal anchoring; idle/walk frames keep their original alignment.\n\n';
for (const sheet of report.sheets) {
    markdown += `## ${sheet.source}\n\n${sheet.dimensions.join('x')}; ${sheet.detectedFrames} poses; ${sheet.orientation}; ${sheet.exportedFrames} exported; ${sheet.animation ?? sheet.note}\n\n`;
    if (sheet.analysisRegion) markdown += `Explicit analysis region: ${JSON.stringify(sheet.analysisRegion)}\n\n`;
    if (sheet.replaces) markdown += `Replaces prior source: ${sheet.replaces.dimensions.join('x')}, ${sheet.replaces.frames} poses, SHA-256 ${sheet.replaces.sha256}.\n\n`;
    markdown += sheet.frames.map(frame => `${frame.index}: source ${JSON.stringify(frame.cropBounds)}, output ${frame.resized.join('x')}, placement ${JSON.stringify(frame.placement)}`).join('\n\n') + '\n\n';
}
await writeFile(path.join(outputDir, 'processing-report.md'), markdown);
const previewLayers = [];
for (const [row, [animation, count]] of Object.entries(manifest).entries()) for (let index = 0; index < count; index++)
    previewLayers.push({ input: await readFile(path.join(outputDir, animation, index + '.png')), left: index * 256, top: row * 256 });
const previewPng = await sharp({ create: { width: Math.max(...Object.values(manifest)) * 256, height: Object.keys(manifest).length * 256, channels: 4, background: '#66717b' } }).composite(previewLayers).png().toBuffer();
await writeFile(path.join(outputDir, 'preview.png'), previewPng);
console.log('All output frames: 256x256. No unreliable poses. Report and preview written.');
