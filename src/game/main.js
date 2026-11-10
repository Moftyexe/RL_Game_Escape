import SchoolScene from './scenes/SchoolScene';
import BattleScene from './scenes/BattleScene';
import DayTransitionScene from './scenes/DayTransitionScene.js';
import { AUTO, Scale,Game } from 'phaser';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        SchoolScene,
        BattleScene,
        DayTransitionScene
    ]
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
}

export default StartGame;
