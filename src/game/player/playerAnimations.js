import { Textures } from 'phaser';
import runManifest from '../../../public/assets/player/movement/run-manifest.json' with { type: 'json' };
import frameCounts from '../../../public/assets/player/movement/manifest.json' with { type: 'json' };

export const PLAYER_TEXTURE = 'protagonist';
export const RUN_SPEED = 400;
export const PLAYER_FOOT_ORIGIN = 250 / 256;

export const PLAYER_ANIMATIONS = Object.entries(frameCounts).map(([folder, count]) => {
    const run = runManifest.animations[folder];
    const [movement, direction] = folder.split('_');
    const name = `${movement}${direction[0].toUpperCase()}${direction.slice(1)}`;
    return { folder, count, texture: `player-${name}`, key: `${movement}-${direction}`,
        frameRate: movement === 'idle' ? 4 : movement === 'walk' ? 8 : run?.frameRate??12, run };
});

// Frame zero retains SchoolScene's existing initial texture key.
const frameKey = (animation, index) => animation.run
    ? `${animation.texture}-${animation.run.revision}-${index}`
    : index === 0 ? animation.texture : `${animation.texture}-${index}`;

export function preloadPlayer(scene) {
    for (const animation of PLAYER_ANIMATIONS) {
        for (let index = 0; index < animation.count; index++) {
            scene.load.image(frameKey(animation, index),
                `${import.meta.env?.BASE_URL ?? './'}${animation.run ? animation.run.frames[index].file + '?v=' + animation.run.frames[index].sha256.slice(0, 12) : 'assets/player/movement/' + animation.folder + '/' + index + '.png'}`);
        }
    }
}

export function createPlayerAnimations(scene) {
    for (const animation of PLAYER_ANIMATIONS) {
        const frames = Array.from({ length: animation.count }, (_, index) => {
            const key = frameKey(animation, index);
            scene.textures.get(key).setFilter(Textures.FilterMode.NEAREST);
            return { key };
        });
        // Run revisions use new texture keys, and stale registration is replaced
        // on scene creation. Idle/walk registrations retain their existing behavior.
        if (animation.run && scene.anims.exists(animation.key)) scene.anims.remove(animation.key);
        if (!scene.anims.exists(animation.key)) {
            scene.anims.create({ key: animation.key, frames, frameRate: animation.frameRate, repeat: -1, ...(animation.run ? { skipMissedFrames: false } : {}) });
        }
    }
}
