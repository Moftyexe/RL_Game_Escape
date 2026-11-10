import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../Guard_Animations/Guard_idle.png', import.meta.url));
const output = fileURLToPath(new URL('../public/assets/guard/idle/', import.meta.url));
const input = await readFile(source);
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const seen = new Uint8Array(info.width * info.height);
const queue = new Int32Array(seen.length);
const poses = [];
// Detect actual connected character silhouettes, ignoring detached generation
// debris. No assumption of equal-width sheet cells or runtime crop coordinates.
for (let start = 0; start < seen.length; start++) {
    if (seen[start] || !data[start * 4 + 3]) continue;
    let head = 0, tail = 1, left = info.width, top = info.height, right = 0, bottom = 0;
    queue[0] = start;
    seen[start] = 1;
    while (head < tail) {
        const p = queue[head++], x = p % info.width, y = Math.floor(p / info.width);
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || nx >= info.width || ny < 0 || ny >= info.height) continue;
            const n = ny * info.width + nx;
            if (!seen[n] && data[n * 4 + 3]) { seen[n] = 1; queue[tail++] = n; }
        }
    }
    if (tail >= 10000) poses.push({ crop: { left, top, width: right - left + 1, height: bottom - top + 1 }, pixels: queue.slice(0, tail) });
}
poses.sort((a, b) => a.crop.left - b.crop.left);
if (poses.length !== 4) throw new Error(`Expected four inspected guard poses, found ${poses.length}. Inspect the changed source before exporting.`);
await mkdir(output, { recursive: true });
const report = { source: 'Guard_Animations/Guard_idle.png', sha256: createHash('sha256').update(input).digest('hex'),
    sourceDimensions: [info.width, info.height], frameCount: poses.length, outputDimensions: [256, 256], baseline: 249, frames: [] };
const preview = [];
for (const [index, { crop, pixels }] of poses.entries()) {
    const isolated = Buffer.alloc(crop.width * crop.height * 4);
    for (const p of pixels) {
        const offset = ((Math.floor(p / info.width) - crop.top) * crop.width + p % info.width - crop.left) * 4;
        data.copy(isolated, offset, p * 4, p * 4 + 4);
    }
    const scale = Math.min(240 / crop.height, 248 / crop.width);
    const scaled = await sharp(isolated, { raw: { width: crop.width, height: crop.height, channels: 4 } })
        .resize(Math.round(crop.width * scale), Math.round(crop.height * scale), { kernel: 'nearest', fit: 'fill' }).png().toBuffer();
    const { data: resized, info: bounds } = await sharp(scaled).trim({ background: '#00000000', threshold: 0 }).png().toBuffer({ resolveWithObject: true });
    const left = Math.floor((256 - bounds.width) / 2), top = 250 - bounds.height;
    const frame = await sharp({ create: { width: 256, height: 256, channels: 4, background: '#00000000' } })
        .composite([{ input: resized, left, top }]).png().toBuffer();
    await writeFile(`${output}${index}.png`, frame);
    report.frames.push({ index, alphaBounds: crop, resized: [bounds.width, bounds.height], placement: { left, top } });
    preview.push({ input: frame, left: index * 256, top: 0 });
}
await writeFile(`${output}manifest.json`, JSON.stringify(report, null, 2) + '\n');
await sharp({ create: { width: 1024, height: 256, channels: 4, background: '#66717b' } })
    .composite(preview).png().toFile(`${output}preview.png`);
console.log(JSON.stringify(report, null, 2));
