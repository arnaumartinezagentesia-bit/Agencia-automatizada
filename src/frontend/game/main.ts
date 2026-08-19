import Phaser from 'phaser';
import OfficeScene from './scenes/OfficeScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-game-container',
    scene: [OfficeScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    pixelArt: true,
};

export const initGame = () => {
    return new Phaser.Game(config);
};
