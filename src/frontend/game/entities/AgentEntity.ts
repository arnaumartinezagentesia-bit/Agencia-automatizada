import Phaser from 'phaser';
import { OfficeObject } from '../entities/OfficeObject';

export type AgentState = 'IDLE' | 'WORKING' | 'THINKING' | 'ALERT' | 'COLLABORATING';

export class AgentEntity extends Phaser.Physics.Arcade.Sprite {
  private state: AgentState = 'IDLE';
  private agentId: string = '';
  private target: Phaser.GameObjects.GameObject | Phaser.Math.Vector2 | null = null;
  private stateTimer: number = 0;
  private moveSpeed: number = 100;
  private agentName: string = 'Agent';
  private bubble: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this as any);
    scene.physics.add.existing(this as any);

    this.setCollideWorldBounds(true);

    this.createBubble();
  }

  private createBubble() {
    this.bubble = this.scene.add.text(0, 0, '', {
      fontSize: '12px',
      backgroundColor: '#334155',
      padding: { x: 4, y: 2 },
      color: '#fff',
    });
    this.bubble.setVisible(false);
    this.bubble.setOrigin(0.5);
  }

  private updateBubble() {
    if (!this.bubble) return;

    switch (this.state) {
      case 'THINKING':
        this.bubble.setText('💭 thinking...');
        this.bubble.setBackgroundColor('#475569');
        this.bubble.setVisible(true);
        break;
      case 'ALERT':
        this.bubble.setText('🚨 ALERT!');
        this.bubble.setBackgroundColor('#b91c1c');
        this.bubble.setVisible(true);
        break;
      case 'WORKING':
        this.bubble.setText('⌨️ working...');
        this.bubble.setBackgroundColor('#1e293b');
        this.bubble.setVisible(true);
        break;
      case 'COLLABORATING':
        this.bubble.setText('🤝 gathering...');
        this.bubble.setBackgroundColor('#1e3a8a');
        this.bubble.setVisible(true);
        break;
      default:
        this.bubble.setVisible(false);
        break;
    }
  }

  public setName(name: string): this {
    this.agentName = name;
    return this;
  }

  public setAgentId(id: string) {
    this.agentId = id;
  }

  public getAgentId(): string {
    return this.agentId;
  }

  public getName(): string {
    return this.agentName;
  }

  public setTarget(target: Phaser.GameObjects.GameObject | Phaser.Math.Vector2) {
    this.target = target;
    this.setState('COLLABORATING');
  }

  public syncState(newState: AgentState) {
    console.log(`Syncing ${this.agentId} to state ${newState}`);
    this.setState(newState);
  }

  public setState(newState: AgentState) {
    if (this.state === newState) return;

    this.state = newState;
    this.updateAnimation();
    this.updateBubble();
    this.stateTimer = 0;
  }

  private updateAnimation() {
    const anims = {
      IDLE: 'idle',
      WORKING: 'work',
      THINKING: 'think',
      ALERT: 'alert',
      COLLABORATING: 'walk',
    };

    const animKey = anims[this.state];
    if (animKey && this.scene.anims.exists(animKey)) {
      this.play(animKey, true);
    }
  }


  public update(time: number, delta: number, officeObjects: OfficeObject[]) {
    this.stateTimer += delta;

    if (this.bubble) {
      this.bubble.x = this.x;
      this.bubble.y = this.y - 40;
    }

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
      const targetX = 'x' in this.target ? this.target.x : (this.target as any).x;
      const targetY = 'y' in this.target ? this.target.y : (this.target as any).y;

      this.scene.physics.moveTo(this, targetX, targetY, this.moveSpeed);

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
    const targetX = 'x' in this.target ? this.target.x : (this.target as any).x;
    const targetY = 'y' in this.target ? this.target.y : (this.target as any).y;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
    return dist < 32;
  }

  private getRandomTarget(): Phaser.GameObjects.GameObject | null {
    return {
      x: Phaser.Math.Between(32, 800),
      y: Phaser.Math.Between(32, 600),
    } as any;
  }
}
