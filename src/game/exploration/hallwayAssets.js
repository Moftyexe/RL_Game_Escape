import manifest from '../../../public/assets/hallway-manifest.json' with { type: 'json' };
export const HALLWAY_MUSIC_KEY = 'hallway-music';
export const MUSICIAN_DEPTH = 1.5; // Wall/background role, always below Player depth 2.
const revision = entry => entry?.revision ?? entry?.sha256?.slice(0,12) ?? 'missing';
const animationKey = entry => `musician-idle-${revision(entry)}`;
const frameKey = (entry,index) => `${animationKey(entry)}-${index}`;
export const MUSICIAN_IDLE = animationKey(manifest.musician);
export const MUSICIAN_TEXTURE = frameKey(manifest.musician,0);
export function preloadHallwayAssets(scene, assets = manifest) {
    const base = import.meta.env?.BASE_URL ?? './';
    if (assets.music?.file) scene.load.audio(HALLWAY_MUSIC_KEY, `${base}${assets.music.file}`);
    assets.musician?.frames.forEach((frame, index) => scene.load.image(frameKey(assets.musician,index), `${base}${frame.file}?v=${frame.sha256?.slice(0,12) ?? revision(assets.musician)}`));
}
export function createMusician(scene, placement, nearestFilter, assets = manifest) {
    const entry = assets.musician;
    if (!entry?.frames.length) return null;
    const frames = entry.frames.map((_, index) => ({ key: frameKey(entry,index) }));
    if (!frames.every(frame => scene.textures.exists(frame.key))) return null;
    frames.forEach(frame => scene.textures.get(frame.key).setFilter(nearestFilter));
    const key = animationKey(entry);
    if (!scene.anims.exists(key)) scene.anims.create({ key, frames, frameRate: entry.frameRate, repeat: -1 });
    return scene.add.sprite(placement.x, placement.y, frames[0].key).setOrigin(0.5, (entry.baseline+1) / entry.canvas[1])
        .setScale(placement.scale).setDepth(MUSICIAN_DEPTH).play(key);
}
