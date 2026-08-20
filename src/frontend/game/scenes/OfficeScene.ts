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
      this.add.image(0, 0, 'background').setOrigin(0).setDisplaySize(1280, 720);
    } else {
      this.add.rectangle(640, 360, 1280, 720, 0x333333).setOrigin(0.5);
    }
  }

  private createOfficeObjects() {
    const objectScale = 0.4; // Adjust this to fix the "huge" furniture issue

    // Trading Office Area (Left side)
    for (let i = 0; i < 3; i++) {
      const x = 200 + (i * 250);
      const y = 200;

      const desk = new OfficeObject(this, {
        x: x,
        y: y,
        texture: 'desk',
        name: `Trading Desk ${i + 1}`,
        interactive: true,
        callback: () => console.log('Checking markets...'),
      });
      desk.setScale(objectScale);
      this.officeObjects.push(desk);

      const monitors = new OfficeObject(this, {
        x: x,
        y: y - 20,
        texture: 'monitors',
        name: `Trading Terminal ${i + 1}`,
        interactive: true,
      });
      monitors.setScale(objectScale);
      this.officeObjects.push(monitors);
    }

    // Risk Office Area (Top Right)
    const riskDesk = new OfficeObject(this, {
      x: 1000,
      y: 200,
      texture: 'desk',
      name: 'Risk Management Desk',
      interactive: true,
      callback: () => console.log('Analyzing VaR...'),
    });
    riskDesk.setScale(objectScale);
    this.officeObjects.push(riskDesk);

    // Director's Office Area (Bottom Left)
    const dirDesk = new OfficeObject(this, {
      x: 300,
      y: 500,
      texture: 'desk',
      name: 'Directors Desk',
      interactive: true,
      callback: () => console.log('Reviewing P&L...'),
    });
    dirDesk.setScale(objectScale);
    this.officeObjects.push(dirDesk);

    // Monitoring/Coffee Area (Bottom Right)
    const coffee = new OfficeObject(this, {
      x: 1000,
      y: 500,
      texture: 'coffee',
      name: 'Coffee Machine',
      interactive: true,
      callback: () => console.log('Brewing coffee for the night shift...'),
    });
    coffee.setScale(objectScale);
    this.officeObjects.push(coffee);

    this.meetingTable = new OfficeObject(this, {
      x: 640,
      y: 360,
      texture: 'desk',
      name: 'Meeting Table',
      interactive: true,
    });
    this.meetingTable.setScale(objectScale * 1.5);
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
    // Map agent IDs to their visual assets and positions
    const agentsConfig = [
      { id: 'Director', texture: 'director', x: 300, y: 550, room: 'Director\'s Office' },
      { id: 'MarketIntel', texture: 'marketIntel', x: 200, y: 250, room: 'Trading Office' },
      { id: 'PatternDet', texture: 'patternDetection', x: 450, y: 250, room: 'Trading Office' },
      { id: 'Backtest', texture: 'backtesting', x: 700, y: 250, room: 'Trading Office' },
      { id: 'RiskMgmt', texture: 'riskMgmt', x: 1000, y: 250, room: 'Risk Office' },
    ];

    agentsConfig.forEach(config => {
      const agent = new AgentEntity(this, config.x, config.y, config.texture);
      agent.setAgentId(config.id);
      agent.setName(`${config.id} (${config.room})`);
      this.agents.push(agent);
    });
  }
}
