// Measured in the CURRENT 2048x688 BG.png source, not percentages of a guessed
// room. Opaque black outer padding is excluded by this interior crop.
export const HALLWAY = Object.freeze({
    crop: Object.freeze({ x: 18, y: 63, width: 2012, height: 600 }),
    // Back-wall skirting meets floor at y~344. Feet stay at least 56 px in
    // front of it; perspective side edges narrow the rear walkable band.
    floor: Object.freeze({ top: 400, bottom: 550, topLeft: 140, bottomLeft: 80, topRight: 1870, bottomRight: 1960 }),
    player: Object.freeze({ x: 245, y: 470, scale: 0.675 }),
    // Exit is in the right wall at x~1905..1970, threshold y~440..500.
    // Stand immediately in front/left of its approach, facing the Player.
    guard: Object.freeze({ x: 1890, y: 490, scale: 0.74 }),
    // Blank wall between the banner pillar and low window; no collision body.
    musician: Object.freeze({ x: 750, y: 375, scale: 0.64 }),
    referenceBackgroundScale: 1.28,
    interactionRadius: 150, halfFootprint: 42
});

export function createHallwayLayout(width, height) {
    const { crop, floor } = HALLWAY;
    const scale = Math.max(1, width / crop.width, height / crop.height);
    const x = value => (value - crop.x) * scale;
    const y = value => (value - crop.y) * scale;
    const actor = value => ({ x: x(value.x), y: y(value.y), scale: value.scale * scale / HALLWAY.referenceBackgroundScale });
    return {
        crop, backgroundScale: scale, worldWidth: crop.width * scale, worldHeight: crop.height * scale,
        player: actor(HALLWAY.player), guard: actor(HALLWAY.guard), musician: actor(HALLWAY.musician),
        musicianRadius: 110 * scale / HALLWAY.referenceBackgroundScale,
        interactionRadius: HALLWAY.interactionRadius * scale / HALLWAY.referenceBackgroundScale,
        halfFootprint: HALLWAY.halfFootprint * scale / HALLWAY.referenceBackgroundScale,
        floor: { top: y(floor.top), bottom: y(floor.bottom), topLeft: x(floor.topLeft), bottomLeft: x(floor.bottomLeft),
            topRight: x(floor.topRight), bottomRight: x(floor.bottomRight) }
    };
}
