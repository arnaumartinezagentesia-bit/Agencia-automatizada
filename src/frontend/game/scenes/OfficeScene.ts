import Phaser from 'phaser';
import { Assets } from '../assets/Assets';
import { OfficeObject } from '../entities/OfficeObject';
import { AgentEntity, AgentState } from '../entities/AgentEntity';
import { socketSystem } from '../systems/SocketSystem';

export class OfficeScene extends Phaser.Scene {
  private officeObjects: OfficeObject[] = [];
  private agents: AgentEntity[] = [];
  private meetingTable: OfficeObject | null = null;

  constructor() {
    super('OfficeScene');
  }

  preload() {
    // Load background
    this.load.image('background', Assets.background);

    // Load objects
    this.load.image('desk', Assets.objects.desk);
    this.load.image('chair', Assets.objects.chair);
    this.load.image('monitors', Assets.objects.monitors);
    this.load.image('coffee', Assets.objects.coffee);

    // Load agents as spritesheets
    Object.entries(Assets.agents).forEach(([key, path]) => {
      this.load.spritesheet(key, path, {
        frameWidth: 32,
        frameHeight: 32,
      });
    });
  }

  create() {
    this.createFallbackTextures();
    this.createBackground();
    this.createOfficeObjects();
    this.createAgentAnimations();
    this.spawnAgents();
    this.setupSocketSync();
  }

  private createFallbackTextures() {
    // Create simple colored textures if the images didn't load
    const fallbacks = {
      background: 0x333333,
      desk: 0x8B4513,
      chair: 0x555555,
      monitors: 0x0000FF,
      coffee: 0xADD8E6,
    };

    Object.entries(fallbacks).forEach(([key, color]) => {
      if (!this.textures.exists(key)) {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture(key, 32, 32);
      }
    });
  }

  private setupSocketSync() {

    socketSystem.connect();
    socketSystem.on('AGENT_STATE_UPDATE', (payload) => {
      const agent = this.agents.find(a => a.getAgentId() === payload.agentId);
      if (agent && payload.state) {
        agent.syncState(payload.state as AgentState);
      }
    });

    socketSystem.on('DIRECTOR_SYNTHESIS_START', () => {
      console.log('Director starting synthesis! Agents gathering...');
      if (this.meetingTable) {
        this.agents.forEach((agent, index) => {
          // Calculate a position around the table so they don't overlap
          const angle = (index / this.agents.length) * Math.PI * 2;
          const radius = 40;
          const targetX = this.meetingTable!.x + Math.cos(angle) * radius;
          const targetY = this.meetingTable!.y + Math.sin(angle) * radius;

          agent.setTarget({ x: targetX, y: targetY } as any);
        });
      }
    });
  }

  update(time: number, delta: number) {
    this.agents.forEach(agent => agent.update(time, delta, this.officeObjects));
  }

  private createBackground() {
    if (this.textures.exists('background')) {
      this.add.image(0, 0, 'background').setOrigin(0).setDisplaySize(800, 600);
    } else {
      this.add.rectangle(400, 300, 800, 600, 0x333333).setOrigin(0.5);
    }
  }

  private createOfficeObjects() {
    const tileSize = 32;

    // Trading Office Objects
    for (let i = 0; i < 3; i++) {
      this.officeObjects.push(new OfficeObject(this, {
        x: (2 + i * 3) * tileSize,
        y: 3 * tileSize,
        texture: 'desk',
        name: `Trading Desk ${i + 1}`,
        interactive: true,
        callback: () => console.log('Checking markets...'),
      }));
      this.officeObjects.push(new OfficeObject(this, {
        x: (2 + i * 3) * tileSize,
        y: 3 * tileSize,
        texture: 'monitors',
        name: `Trading Terminal ${i + 1}`,
        interactive: true,
      }));
    }

    // Risk Office Objects
    this.officeObjects.push(new OfficeObject(this, {
      x: 18 * tileSize,
      y: 3 * tileSize,
      texture: 'desk',
      name: 'Risk Management Desk',
      interactive: true,
      callback: () => console.log('Analyzing VaR...'),
    }));

    // Director's Office Objects
    this.officeObjects.push(new OfficeObject(this, {
      x: 5 * tileSize,
      y: 18 * tileSize,
      texture: 'desk',
      name: 'Directors Desk',
      interactive: true,
      callback: () => console.log('Reviewing P&L...'),
    }));

    // Monitoring Room Objects
    this.officeObjects.push(new OfficeObject(this, {
      x: 20 * tileSize,
      y: 20 * tileSize,
      texture: 'coffee',
      name: 'Coffee Machine',
      interactive: true,
      callback: () => console.log('Brewing coffee for the night shift...'),
    }));

    this.meetingTable = new OfficeObject(this, {
      x: 22 * tileSize,
      y: 22 * tileSize,
      texture: 'desk',
      name: 'Meeting Table',
      interactive: true,
    });
    this.officeObjects.push(this.meetingTable);
  }

  private createAgentAnimations() {
    Object.keys(Assets.agents).forEach(agentKey => {
      this.anims.create({
        key: `${agentKey}_idle`,
        frames: this.anims.generateFrameNumbers(agentKey, { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
      this.anims.create({
        key: `${agentKey}_walk`,
        frames: this.anims.generateFrameNumbers(agentKey, { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
      this.anims.create({
        key: `${agentKey}_work`,
        frames: this.anims.generateFrameNumbers(agentKey, { start: 8, end: 11 }),
        frameRate: 5,
        repeat: -1
      });
      this.anims.create({
        key: `${agentKey}_think`,
        frames: this.anims.generateFrameNumbers(agentKey, { start: 12, end: 15 }),
        frameRate: 5,
        repeat: -1
      });
      this.anims.create({
        key: `${agentKey}_alert`,
        frames: this.anims.generateFrameNumbers(agentKey, { start: 16, end: 19 }),
        frameRate: 10,
        repeat: -1
      });
    });
  }

  private spawnAgents() {
    const tileSize = 32;

    // Map agent IDs to their visual assets and positions
    const agentsConfig = [
      { id: 'Director', texture: 'director', x: 5 * tileSize, y: 19 * tileSize, room: 'Director\'s Office' },
      { id: 'MarketIntel', texture: 'marketIntel', x: 2 * tileSize, y: 4 * tileSize, room: 'Trading Office' },
      { id: 'PatternDet', texture: 'patternDetection', x: 5 * tileSize, y: 4 * tileSize, room: 'Trading Office' },
      { id: 'Backtest', texture: 'backtesting', x: 8 * tileSize, y: 4 * tileSize, room: 'Trading Office' },
      { id: 'RiskMgmt', texture: 'riskMgmt', x: 18 * tileSize, y: 4 * tileSize, room: 'Risk Office' },
    ];

    agentsConfig.forEach(config => {
      const agent = new AgentEntity(this, config.x, config.y, config.texture);
      agent.setAgentId(config.id);
      agent.setName(`${config.id} (${config.room})`);
      this.agents.push(agent);
    });
  }
}
