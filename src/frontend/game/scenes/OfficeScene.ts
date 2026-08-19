import Phaser from 'phaser';
import { Assets } from '../assets/Assets';
import { OfficeObject } from '../entities/OfficeObject';

export class OfficeScene extends Phaser.Scene {
  constructor() {
    super('OfficeScene');
  }

  preload() {
    // Load tilesets
    this.load.image('floor', Assets.tilesets.floor);
    this.load.image('walls', Assets.tilesets.walls);

    // Load objects
    this.load.image('desk', Assets.objects.desk);
    this.load.image('computer', Assets.objects.computer);
    this.load.image('coffeeMachine', Assets.objects.coffeeMachine);
    this.load.image('chair', Assets.objects.chair);
  }

  create() {
    this.createMap();
    this.createOfficeObjects();
  }

  private createMap() {
    const tileSize = 32;

    // Define room areas: [xStart, yStart, width, height, roomName]
    const rooms = [
      { x: 0, y: 0, w: 15, h: 15, name: 'Trading Office', color: 0x444444 },
      { x: 16, y: 0, w: 10, h: 15, name: 'Risk Office', color: 0x555555 },
      { x: 0, y: 16, w: 15, h: 10, name: 'Director\'s Office', color: 0x666666 },
      { x: 16, y: 16, w: 10, h: 10, name: 'Monitoring Room', color: 0x777777 },
    ];

    rooms.forEach(room => {
      // Fill floor
      for (let x = room.x; x < room.x + room.w; x++) {
        for (let y = room.y; y < room.y + room.h; y++) {
          this.add.image(x * tileSize, y * tileSize, 'floor').setOrigin(0);
        }
      }

      // Draw walls (perimeter)
      for (let x = room.x; x < room.x + room.w; x++) {
        this.add.image(x * tileSize, room.y * tileSize, 'walls').setOrigin(0);
        this.add.image(x * tileSize, (room.y + room.h) * tileSize, 'walls').setOrigin(0);
      }
      for (let y = room.y; y < room.y + room.h; y++) {
        this.add.image(room.x * tileSize, y * tileSize, 'walls').setOrigin(0);
        this.add.image((room.x + room.w) * tileSize, y * tileSize, 'walls').setOrigin(0);
      }

      // Label the room
      this.add.text(
        room.x * tileSize + 10,
        room.y * tileSize + 10,
        room.name,
        { fontSize: '16px', fill: '#fff' }
      );
    });
  }

  private createOfficeObjects() {
    const tileSize = 32;

    // Trading Office Objects
    for (let i = 0; i < 3; i++) {
      new OfficeObject(this, {
        x: (2 + i * 3) * tileSize,
        y: 3 * tileSize,
        texture: 'desk',
        name: `Trading Desk ${i + 1}`,
        interactive: true,
        callback: () => console.log('Checking markets...'),
      });
      new OfficeObject(this, {
        x: (2 + i * 3) * tileSize,
        y: 3 * tileSize,
        texture: 'computer',
        name: `Trading Terminal ${i + 1}`,
        interactive: true,
      });
    }

    // Risk Office Objects
    new OfficeObject(this, {
      x: 18 * tileSize,
      y: 3 * tileSize,
      texture: 'desk',
      name: 'Risk Management Desk',
      interactive: true,
      callback: () => console.log('Analyzing VaR...'),
    });

    // Director's Office Objects
    new OfficeObject(this, {
      x: 5 * tileSize,
      y: 18 * tileSize,
      texture: 'desk',
      name: 'Directors Desk',
      interactive: true,
      callback: () => console.log('Reviewing P&L...'),
    });

    // Monitoring Room Objects
    new OfficeObject(this, {
      x: 20 * tileSize,
      y: 20 * tileSize,
      texture: 'coffeeMachine',
      name: 'Coffee Machine',
      interactive: true,
      callback: () => console.log('Brewing coffee for the night shift...'),
    });
  }
}
