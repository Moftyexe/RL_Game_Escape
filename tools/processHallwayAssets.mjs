import sharp from 'sharp';
import { readdir, readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { components } from './spriteComponents.mjs';
import { removeEdgeMatte } from './removeEdgeMatte.mjs';

// Optional sources: omission produces a safe, explicit empty manifest.
const manifest = { music: null, musician: null };
await mkdir('public/assets/audio', { recursive: true });
await mkdir('public/assets/npc/musician', { recursive: true });
const audio = (await readdir('.')).filter(name => /^hallway\./i.test(name)).sort()[0];
if (audio) {
    const input = await readFile(audio);
    // The supplied Hallway.mp3.mpeg is MPEG Layer III; rename, never re-encode.
    const extension = /\.mp3(?:\.mpeg)?$/i.test(audio) ? 'mp3' : audio.split('.').at(-1).toLowerCase();
    if (!['mp3', 'ogg', 'wav', 'm4a', 'aac', 'webm'].includes(extension)) throw Error('Inspect unsupported hallway audio format');
    const file = `assets/audio/hallway.${extension}`;
    await copyFile(audio, `public/${file}`);
    manifest.music = { source: audio, file, format: extension, sha256: createHash('sha256').update(input).digest('hex') };
}
const npc = (await readdir('npcanimations').catch(() => [])).filter(name => /friend|musician|music|composer/i.test(name) && /\.png$/i.test(name)).sort()[0];
if (npc) {
    const source = `npcanimations/${npc}`, input = await readFile(source);
    const metadata = await sharp(input).metadata();
    const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const removedMattePixels = metadata.hasAlpha ? 0 : removeEdgeMatte(data,info.width,info.height);
    const { poses } = components(data, info.width, info.height);
    if (!poses.length) throw Error('No musician silhouettes found');
    manifest.musician = { source, sha256: createHash('sha256').update(input).digest('hex'),
        revision: createHash('sha256').update(input).digest('hex').slice(0,12),
        dimensions: [info.width, info.height], canvas: [256, 256], baseline: 249, sourceHasAlpha: metadata.hasAlpha,
        matteRemoval: { method: 'edge-connected near-black only', tolerance: 8, removedPixels: removedMattePixels },
        hasAlpha: true, frameRate: 4, frames: [] };
    const ratio = Math.min(240 / Math.max(...poses.map(p=>p.crop.height)),248 / Math.max(...poses.map(p=>p.crop.width)));
    const preview = [];
    for (const [index, { crop, pixels }] of poses.entries()) {
        const isolated = Buffer.alloc(crop.width * crop.height * 4);
        for (const p of pixels) data.copy(isolated, ((Math.floor(p / info.width) - crop.top) * crop.width + p % info.width - crop.left) * 4, p * 4, p * 4 + 4);
        const { data: frame, info: size } = await sharp(isolated, { raw: { width: crop.width, height: crop.height, channels: 4 } })
            .resize(Math.round(crop.width * ratio), Math.round(crop.height * ratio), { kernel: 'nearest' }).png().toBuffer({ resolveWithObject: true });
        const output = await sharp({ create: { width: 256, height: 256, channels: 4, background: '#00000000' } })
            .composite([{ input: frame, left: Math.floor((256 - size.width) / 2), top: 250 - size.height }]).png().toBuffer();
        const file = `assets/npc/musician/${index}.png`;
        await writeFile(`public/${file}`, output);
        manifest.musician.frames.push({ file, sha256: createHash('sha256').update(output).digest('hex'), crop, size: [size.width, size.height] });
        preview.push({ input: output, left: index * 256, top: 0 });
    }
    await sharp({ create: { width: poses.length * 256, height: 256, channels: 4, background: '#66717b' } })
        .composite(preview).png().toFile('public/assets/npc/musician/preview.png');
}
await writeFile('public/assets/hallway-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
