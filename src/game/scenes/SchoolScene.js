import { Scene, Input, Textures } from 'phaser';
import characterSheet from '../../../Pixel Art Protagonist Animation Sprite Sheet.png?url';
import background from '../../../BG.png?url';

// Individually measured regions: this illustration is not a regular sprite grid.
const playerFrames = {
    'idle-0': [156, 516, 71, 168],
    'idle-1': [249, 516, 72, 168],
    'idle-2': [340, 516, 71, 168],
    'idle-3': [428, 516, 72, 168],
    'walk-0': [575, 516, 88, 168],
    'walk-1': [680, 516, 75, 168],
    'walk-2': [770, 515, 76, 169],
    'walk-3': [869, 514, 68, 170]
};

export default class SchoolScene extends Scene {
    constructor() {
        super('SchoolScene');
    }

    preload() {
        this.load.image('protagonist', characterSheet);
        this.load.image('school-background', background);
    }

    create() {
        const { width, height } = this.scale;
        // Exclude the transparent outer padding measured in the new 2172 x 724 BG.
        const backgroundTexture = this.textures.get('school-background');
        if (!backgroundTexture.has('room')) {
            backgroundTexture.add('room', 0, 8, 49, 2154, 633);
        }
        const bg = this.add.image(0, 0, 'school-background', 'room').setOrigin(0, 0);
        // Keep a large scrollable room, filling the viewport without stretching.
        bg.setScale(Math.max(1, width / bg.width, height / bg.height));
        const worldWidth = bg.displayWidth;
        const worldHeight = bg.displayHeight;
        // Floor edges measured relative to the visible room, in world coordinates.
        this.floorBounds = {
            top: worldHeight * 0.46,
            bottom: worldHeight * 0.975,
            topLeft: worldWidth * 0.04,
            bottomLeft: worldWidth * 0.11,
            topRight: worldWidth * 0.87,
            bottomRight: worldWidth * 0.985
        };
        const floorY = this.floorBounds.top +
            (this.floorBounds.bottom - this.floorBounds.top) * 0.55;

        const texture = this.textures.get('protagonist');
        texture.setFilter(Textures.FilterMode.NEAREST);
        for (const [name, [x, y, frameWidth, frameHeight]] of Object.entries(playerFrames)) {
            if (!texture.has(name)) {
                // Give differently sized crops the same centered, foot-aligned canvas.
                texture.add(name, 0, x, y, frameWidth, frameHeight)
                    .setTrim(104, 180, Math.floor((104 - frameWidth) / 2),
                        180 - frameHeight, frameWidth, frameHeight);
            }
        }

        for (const [key, prefix, count, frameRate] of [
            ['protagonist-idle', 'idle', 4, 4],
            ['protagonist-walk', 'walk', 4, 10]
        ]) {
            if (!this.anims.exists(key)) {
                this.anims.create({
                    key,
                    frames: Array.from({ length: count }, (_, index) => ({
                        key: 'protagonist', frame: `${prefix}-${index}`
                    })),
                    frameRate,
                    repeat: -1
                });
            }
        }

        const spawnX = this.floorBounds.topLeft +
            (this.floorBounds.bottomLeft - this.floorBounds.topLeft) * 0.55 + 104;
        this.player = this.add.sprite(spawnX, floorY, 'protagonist', 'idle-0')
            .setOrigin(0.5, 1)
            .play('protagonist-idle');

        const camera = this.cameras.main;
        camera.setBounds(0, 0, worldWidth, worldHeight);
        camera.centerOn(this.player.x, this.player.y);
        camera.startFollow(this.player, true, 0.12, 0.12);
        // Controls
        this.keys = this.input.keyboard.addKeys({
            left: Input.Keyboard.KeyCodes.A,
            right: Input.Keyboard.KeyCodes.D,
            up: Input.Keyboard.KeyCodes.W,
            down: Input.Keyboard.KeyCodes.S
        });
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(time, delta) {
        const directionX = Number(this.keys.right.isDown || this.cursors.right.isDown) -
            Number(this.keys.left.isDown || this.cursors.left.isDown);
        const directionY = Number(this.keys.down.isDown || this.cursors.down.isDown) -
            Number(this.keys.up.isDown || this.cursors.up.isDown);
        const length = Math.hypot(directionX, directionY) || 1;
        const halfWidth = this.player.displayWidth / 2;
        const previousX = this.player.x;
        const previousY = this.player.y;
        const step = 240 * Math.min(delta, 50) / 1000;
        const floor = this.floorBounds;
        this.player.y = Math.max(floor.top,
            Math.min(floor.bottom, previousY + directionY / length * step));
        const progress = (this.player.y - floor.top) / (floor.bottom - floor.top);
        const left = floor.topLeft + (floor.bottomLeft - floor.topLeft) * progress;
        const right = floor.topRight + (floor.bottomRight - floor.topRight) * progress;
        this.player.x = Math.max(left + halfWidth,
            Math.min(right - halfWidth, previousX + directionX / length * step));

        if (directionX !== 0) {
            this.player.setFlipX(directionX < 0);
        }
        const moving = this.player.x !== previousX || this.player.y !== previousY;
        this.player.play(moving ? 'protagonist-walk' : 'protagonist-idle', true);
    }
}
