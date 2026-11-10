export function components(data, width, height) {
    const seen = new Uint8Array(width * height), queue = new Int32Array(seen.length), poses = [];
    let discardedPixels = 0;
    for (let start = 0; start < seen.length; start++) {
        if (seen[start] || !data[start * 4 + 3]) continue;
        let head = 0, tail = 1, left = width, top = height, right = 0, bottom = 0;
        queue[0] = start; seen[start] = 1;
        while (head < tail) {
            const p = queue[head++], x = p % width, y = Math.floor(p / width);
            left = Math.min(left, x); right = Math.max(right, x);
            top = Math.min(top, y); bottom = Math.max(bottom, y);
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                const n = ny * width + nx;
                if (!seen[n] && data[n * 4 + 3]) { seen[n] = 1; queue[tail++] = n; }
            }
        }
        if (tail >= 10000) poses.push({ crop: { left, top, width: right - left + 1, height: bottom - top + 1 }, pixels: queue.slice(0, tail) });
        else discardedPixels += tail;
    }
    return { poses: poses.sort((a, b) => a.crop.left - b.crop.left), discardedPixels };
}

