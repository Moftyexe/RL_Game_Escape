export const BATTLE_BACKDROP_KEY = 'battle-hallway';
export const BATTLE_ARENA = Object.freeze({ x: 26, y: 22, width: 972, height: 366 });
export const BACKDROP_DARKENING = 0.35;
const backdropUrl = new URL('../../../BGbattle.png', import.meta.url).href;

export function preloadBattleBackdrop(scene) {
    scene.load.image(BATTLE_BACKDROP_KEY, backdropUrl);
}

// Source-space cover crop stays entirely within the upper arena, without masks
// or distorted scaling. A missing/failed image keeps the ordinary dark panel.
export function createBattleBackdrop(scene, nearestFilter) {
    if (!scene.textures.exists(BATTLE_BACKDROP_KEY)) return null;
    try {
        const texture = scene.textures.get(BATTLE_BACKDROP_KEY);
        const source = texture.getSourceImage();
        if (!source?.width || !source?.height) return null;
        const arena = BATTLE_ARENA, ratio = arena.width / arena.height;
        const width = Math.min(source.width, source.height * ratio);
        const height = width / ratio;
        const left = Math.floor((source.width - width) / 2);
        const top = Math.floor((source.height - height) * 0.65);
        if (!texture.has('arena')) texture.add('arena', 0, left, top, Math.floor(width), Math.floor(height));
        texture.setFilter(nearestFilter);
        const image = scene.add.image(arena.x + arena.width / 2, arena.y + arena.height / 2, BATTLE_BACKDROP_KEY, 'arena')
            .setScale(Math.min(arena.width / Math.floor(width), arena.height / Math.floor(height)));
        const overlay = scene.add.rectangle(arena.x + arena.width / 2, arena.y + arena.height / 2,
            arena.width, arena.height, 0x071020, BACKDROP_DARKENING);
        scene.ui.add([image, overlay]);
        return { image, overlay };
    } catch { return null; }
}
