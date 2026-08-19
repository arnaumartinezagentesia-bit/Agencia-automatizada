import Phaser from 'phaser';
import { OfficeObject } from '../entities/OfficeObject';

export type AgentState = 'IDLE' | 'WORKING' | 'THINKING' | 'ALERT' | 'COLLABORATING';

export class AgentEntity extends Phaser.Physics.Arcade.Sprite {
  private state: AgentState = 'IDLE';
  private target: Phaser.GameObjects.GameObject | null = null;
  private stateTimer: number = 0;
  private moveSpeed: number = 100;
  private agentName: string = 'Agent';

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
  }

  public setName(name: string) {
    this.agentName = name;
  }

  public getName(): string {
    return this.agentName;
  }

  public setState(newState: AgentState) {
    if (this.state === newState) return;

    this.state = newState;
    this.updateAnimation();
    this.stateTimer = 0;
  }

  private updateAnimation() {
    switch (this.state) {
      case 'IDLE':
        this.play('idle', true);
        break;
      case 'WORKING':
        this.play('work', true);
        break;
      case 'THINKING':
        this.play('think', true);
        break;
      case 'ALERT':
        this.play('alert', true);
        break;
      case 'COLLABORATING':
        this.play('walk', true);
        break;
    }
  }

  public update(time: number, delta: number, officeObjects: OfficeObject[]) {
    this.stateTimer += delta;

    switch (this.state) {
      case 'IDLE':
        this.handleIdleState(officeObjects);
        break;
      case 'WORKING':
        this.handleWorkingState(officeObjects);
        break;
      case 'THINKING':
        this.handleThinkingState();
        break;
      case 'ALERT':
        this.handleAlertState();
        break;
      case 'COLLABORATING':
        this.handleCollaboratingState(officeObjects);
        break;
    }
  }

  private handleIdleState(officeObjects: OfficeObject[]) {
    if (this.target) {
      this.moveToTarget();
      if (this.hasReachedTarget()) {
        this.target = null;
        this.setState('THINKING');
      }
    } else if (this.stateTimer > 2000) {
      const rand = Math.random();
      if (rand < 0.3) {
        this.setState('WORKING');
      } else if (rand < 0.6) {
        this.setState('COLLABORATING');
      } else {
        this.target = this.getRandomTarget();
      }
      this.stateTimer = 0;
    }
  }

  private handleWorkingState(officeObjects: OfficeObject[]) {
    const computer = officeObjects.find(obj => obj.getName().includes('Terminal') || obj.getName().includes('Desk'));
    if (computer) {
      this.target = computer;
      this.moveToTarget();
      if (this.hasReachedTarget()) {
        this.target = null;
        this.updateAnimation(); // Ensure 'work' anim is playing
        if (this.stateTimer > 5000) {
          this.setState('IDLE');
        }
      }
    } else {
      this.setState('IDLE');
    }
  }

  private handleThinkingState() {
    if (this.stateTimer > 3000) {
      this.setState('IDLE');
    }
  }

  private handleAlertState() {
    if (this.stateTimer > 2000) {
      this.setState('IDLE');
    }
  }

  private handleCollaboratingState(officeObjects: OfficeObject[]) {
    const table = officeObjects.find(obj => obj.getName().includes('Meeting') || obj.getName().includes('Coffee'));
    if (table) {
      this.target = table;
      this.moveToTarget();
      if (this.hasReachedTarget()) {
        this.target = null;
        if (this.stateTimer > 4000) {
          this.setState('IDLE');
        }
      }
    } else {
      this.setState('IDLE');
    }
  }

  private moveToTarget() {
    if (this.target) {
      this.scene.physics.moveToObject(this, this.target, this.moveSpeed);

      if (this.body.velocity.x > 0) {
        this.setFlipX(false);
      } else if (this.body.velocity.x < 0) {
        this.setFlipX(true);
      }

      // Play walking animation when moving
      if (this.state !== 'ALERT') {
        this.play('walk', true);
      }
    }
  }

  private hasReachedTarget(): boolean {
    if (!this.target) return false;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    return dist < 32;
  }

  private getRandomTarget(): Phaser.GameObjects.GameObject | null {
    return {
      x: Phaser.Math.Between(32, 800),
      y: Phaser.Math.Between(32, 600),
    } as any;
  }
}
