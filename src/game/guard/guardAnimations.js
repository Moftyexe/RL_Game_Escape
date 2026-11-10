import { Textures } from 'phaser';
import manifest from '../../../public/assets/guard/idle/manifest.json' with { type: 'json' };

export const GUARD_TEXTURE = 'guard-idle-0';
export const GUARD_IDLE = 'guard-idle';
export const GUARD_FOOT_ORIGIN = (manifest.baseline + 1) / manifest.outputDimensions[1];

export function preloadGuard(scene) {
    for (let index = 0; index < manifest.frameCount; index++) {
        scene.load.image(`guard-idle-${index}`, `${import.meta.env?.BASE_URL ?? './'}assets/guard/idle/${index}.png`);
    }
}

export function createGuardAnimations(scene) {
    const frames = Array.from({ length: manifest.frameCount }, (_, index) => {
        const key = `guard-idle-${index}`;
        scene.textures.get(key).setFilter(Textures.FilterMode.NEAREST);
        return { key };
    });
    if (!scene.anims.exists(GUARD_IDLE)) {
        scene.anims.create({ key: GUARD_IDLE, frames, frameRate: 4, repeat: -1 });
    }
}
