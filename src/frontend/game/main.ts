import Phaser from 'phaser';
import { OfficeScene } from './scenes/OfficeScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'phaser-game-container',
    scene: [OfficeScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    pixelArt: true,
};

export const initGame = () => {
    return new Phaser.Game(config);
};
