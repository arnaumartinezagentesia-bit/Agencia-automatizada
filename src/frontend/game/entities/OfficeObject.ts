import Phaser from 'phaser';

export interface OfficeObjectConfig {
  x: number;
  y: number;
  texture: string;
  name: string;
  interactive?: boolean;
  callback?: () => void;
}

export class OfficeObject extends Phaser.GameObjects.Sprite {
  private readonly objectName: string;
  private readonly interactionCallback?: () => void;

  constructor(scene: Phaser.Scene, config: OfficeObjectConfig) {
    super(scene, config.x, config.y, config.texture);

    this.objectName = config.name;
    this.interactionCallback = config.callback;

    scene.add.existing(this);

    if (config.interactive) {
      this.setInteractive();
      this.on('pointerdown', () => {
        console.log(`Interacting with ${this.objectName}`);
        if (this.interactionCallback) {
          this.interactionCallback();
        }
      });
    }
  }

  public getName(): string {
    return this.objectName;
  }
}
