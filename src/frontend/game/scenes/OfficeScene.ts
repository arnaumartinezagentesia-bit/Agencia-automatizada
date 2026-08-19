import Phaser from 'phaser';

export default class OfficeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OfficeScene' });
    }

    preload() {
        // In a real game, we would load images here
        // this.load.image('office_bg', 'assets/office_bg.png');
    }

    create() {
        // Set a basic background color to verify rendering
        this.cameras.main.setBackgroundColor('#2c3e50');

        // Add "Trading Enterprise" text in a pixel-style (simulated with a standard font for now)
        this.add.text(400, 300, 'Trading Enterprise', {
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
    }

    update() {
        // Game loop logic goes here
    }
}
