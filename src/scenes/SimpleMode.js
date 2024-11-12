import { BaseScene } from './BaseScene';

export class SimpleMode extends BaseScene {
    constructor() {
        super('SimpleMode');
    }

    create() {
        super.create();
        this.setupObstacles();
    }

    update() {
        this.player.update();
        this.obstacleManager.update();
    }
} 