import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
export function argumentsFor(argv, allowed) {
    const result = {};
    for (let i = 0; i < argv.length; i++) {
        const key = argv[i].replace(/^--/, '');
        if (!argv[i].startsWith('--') || !allowed.includes(key) || argv[i + 1] == null || argv[i + 1].startsWith('--')) throw new Error(`Invalid argument: ${argv[i]}`);
        result[key] = argv[++i];
    }
    return result;
}
export async function saveJSON(filename, data) {
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, JSON.stringify(data, null, 2) + '\n');
}
export const readJSON = async filename => JSON.parse(await readFile(filename, 'utf8'));
