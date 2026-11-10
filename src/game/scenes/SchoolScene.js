import { Scene, Input, Textures } from 'phaser';
import { preloadHallwayAssets, createMusician } from '../exploration/hallwayAssets.js';
import HallwayMusic from '../exploration/HallwayMusic.js';
import { addMusicianInteraction } from '../exploration/musicianInteraction.js';
import background from '../../../BG.png?url';
import { preloadPlayer, createPlayerAnimations, RUN_SPEED, PLAYER_FOOT_ORIGIN } from '../player/playerAnimations';
import InteractionZones from '../interactions/InteractionZones';
import { preloadGuard, createGuardAnimations, GUARD_TEXTURE, GUARD_IDLE, GUARD_FOOT_ORIGIN } from '../guard/guardAnimations';
import { createHallwayLayout } from '../exploration/hallwayLayout.js';
import {runStateForScene} from '../progression/RunState.js';
import DialogueBox from '../dialogue/DialogueBox.js';
import {gateDialogue} from '../dialogue/gateDialogue.js';
import {preloadPortraits} from '../dialogue/portraits.js';
import SoundEffects,{preloadSfx} from '../audio/SoundEffects.js';
import BattleEntryTransition from '../battle/BattleEntryTransition.js';

export default class SchoolScene extends Scene {
    constructor() {
        super('SchoolScene');
    }

    preload() {
        preloadSfx(this);
        preloadPlayer(this);
        preloadGuard(this);
        preloadHallwayAssets(this);
        preloadPortraits(this);
        this.load.image('school-background', background);
    }

    create() {
        this.sfx=new SoundEffects(this);this.battleEntry=new BattleEntryTransition(this);
        this.runState=runStateForScene(this);this.inputLocked=false;this.gateBusy=false;
        this.storyDialogue=new DialogueBox(this,{onLock:locked=>{this.inputLocked=locked;}});
        const { width, height } = this.scale;
        this.hallway = createHallwayLayout(width, height);
        const { crop } = this.hallway;
        // Crop the current image's opaque outer border/padding, not the old BG.
        const backgroundTexture = this.textures.get('school-background');
        if (!backgroundTexture.has('room')) {
            backgroundTexture.add('room', 0, crop.x, crop.y, crop.width, crop.height);
        }
        const bg = this.add.image(0, 0, 'school-background', 'room').setOrigin(0, 0);
        // Keep a large scrollable room, filling the viewport without stretching.
        bg.setScale(this.hallway.backgroundScale);
        const worldWidth = bg.displayWidth;
        const worldHeight = bg.displayHeight;
        this.floorBounds = this.hallway.floor;

        createPlayerAnimations(this);

        this.playerShadow = this.createGroundShadow(this.hallway.player, 104, 18);
        this.player = this.add.sprite(this.hallway.player.x, this.hallway.player.y, 'player-idleDown')
            .setScale(this.hallway.player.scale)
            .setOrigin(0.5, PLAYER_FOOT_ORIGIN).setDepth(2)
            .play('idle-down');
        this.facing = 'down';

        const camera = this.cameras.main;
        camera.setBounds(0, 0, worldWidth, worldHeight);
        camera.centerOn(this.player.x, this.player.y);
        camera.startFollow(this.player, true, 0.12, 0.12);
        // Controls
        this.keys = this.input.keyboard.addKeys({
            left: Input.Keyboard.KeyCodes.A,
            right: Input.Keyboard.KeyCodes.D,
            up: Input.Keyboard.KeyCodes.W,
            down: Input.Keyboard.KeyCodes.S,
            interact: Input.Keyboard.KeyCodes.SPACE
        });
        this.cursors = this.input.keyboard.createCursorKeys();
        this.createGuardEncounter();
        this.hallwayMusic = HallwayMusic.forScene(this);
        this.musician = createMusician(this, this.hallway.musician, Textures.FilterMode.NEAREST);
        if (this.musician) this.musicianShadow = this.createGroundShadow(this.hallway.musician, 90, 16);
        addMusicianInteraction(this, this.musician, this.hallway.musician, this.hallway.musicianRadius);
        this.events.once('shutdown', () => { this.musicianSpeechTimer?.remove(false); this.musicianSpeech?.destroy(); });
        this.add.text(22,20,`DAY ${this.runState.dayNumber}`,{fontFamily:'monospace',fontSize:'20px',color:'#f5db91',backgroundColor:'#101827',padding:{x:10,y:6}}).setScrollFactor(0).setDepth(999);
    }

    createGroundShadow({ x, y, scale }, width, height) {
        return this.add.ellipse(x, y + 2, width * scale, height * scale, 0x030712, 0.26)
            .setDepth(1);
    }

    createGuardEncounter() {
        const { x: guardX, y: guardY, scale } = this.hallway.guard;
        createGuardAnimations(this);
        this.guardShadow = this.createGroundShadow(this.hallway.guard, 124, 20);
        this.guard = this.add.sprite(guardX, guardY, GUARD_TEXTURE)
            .setScale(scale)
            .setOrigin(0.5, GUARD_FOOT_ORIGIN).setDepth(2)
            .play(GUARD_IDLE);
        this.add.text(guardX, guardY - 240 * scale - 22, 'School Guard', {
            fontFamily: 'Arial', fontSize: '20px', color: '#ffffff',
            backgroundColor: '#202838', padding: { x: 6, y: 4 }
        }).setOrigin(0.5).setDepth(3);

        this.interactions = new InteractionZones();
        this.gateTrigger={x:guardX,y:guardY,radius:this.hallway.interactionRadius};
        this.interactionPrompt = this.add.text(this.scale.width / 2, this.scale.height - 45, '', {
            fontFamily: 'Arial', fontSize: '22px', color: '#ffffff',
            backgroundColor: '#202838', padding: { x: 12, y: 8 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000).setVisible(false);
    }

    startGateEncounter(){
        if(this.gateBusy||this.inputLocked)return;
        this.gateBusy=true;this.interactionPrompt.setVisible(false);
        this.sfx?.play('encounter');
        const direction=['left','right'].includes(this.facing)?'side':this.facing;this.player.play(`idle-${direction}`,true);
        this.storyDialogue.start(gateDialogue(this.runState.dayNumber),()=>{
            this.inputLocked=true;
            this.battleEntry.start(()=>{
                const encounterId=this.runState.beginEncounter(),runContext=this.runState.snapshot();
                this.scene.launch('BattleScene',{returnScene:this.scene.key,encounterId,runContext});this.scene.pause();
            });
        });
    }

    update(time, delta) {
        if(this.inputLocked||this.gateBusy)return;
        const directionX = Number(this.keys.right.isDown || this.cursors.right.isDown) -
            Number(this.keys.left.isDown || this.cursors.left.isDown);
        const directionY = Number(this.keys.down.isDown || this.cursors.down.isDown) -
            Number(this.keys.up.isDown || this.cursors.up.isDown);
        const length = Math.hypot(directionX, directionY) || 1;
        // Use a stable footprint, independent of the animation's padded canvas.
        const halfWidth = this.hallway.halfFootprint;
        const previousX = this.player.x;
        const previousY = this.player.y;
        const step = RUN_SPEED * Math.min(delta, 50) / 1000;
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
        if(moving)this.sfx?.step(Math.hypot(this.player.x-previousX,this.player.y-previousY));
        if (moving) {
            if (Math.abs(directionX) > Math.abs(directionY)) {
                this.facing = directionX < 0 ? 'left' : 'right';
            } else if (directionY !== 0) {
                this.facing = directionY < 0 ? 'up' : 'down';
            }
        }
        this.player.setFlipX(this.facing === 'left');
        // Always run while moving, preserving the original controls and speed.
        const movement = moving ? 'run' : 'idle';
        const direction = this.facing === 'left' || this.facing === 'right' ? 'side' : this.facing;
        this.player.play(`${movement}-${direction}`, true);

        this.playerShadow.setPosition(this.player.x, this.player.y + 2);
        this.guardShadow.setPosition(this.guard.x, this.guard.y + 2);

        if(Math.hypot(this.player.x-this.gateTrigger.x,this.player.y-this.gateTrigger.y)<=this.gateTrigger.radius){this.startGateEncounter();return;}

        const zone = this.interactions.findAt(this.player.x, this.player.y);
        this.interactionPrompt.setVisible(Boolean(zone));
        if (zone) this.interactionPrompt.setText(zone.prompt);
        // Consume a fresh press even outside zones; holding Space never auto-interacts.
        if (Input.Keyboard.JustDown(this.keys.interact)) {
            this.interactions.interactAt(this.player.x, this.player.y);
        }
    }
}
