import { BaseScene } from './BaseScene';
import { Player } from '../entities/Player';

export class SimpleMode extends BaseScene {
    constructor() {
        super('SimpleMode');
    }

    create() {
        super.create();
        this.player = new Player(this, 100, 260, Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.player.setDepth(1);
        this.setupCollisions();
    }

    update() {
        if (this.isGameOver) return;
        const delta = this.game.loop.delta / 1000;  // Convert to seconds

        // Update backgrounds
        this.backgrounds.forEach(bg => {
            bg.layer.tilePositionX += bg.speed;
        });

        // Update player
        this.player.update();

        // Update obstacles
        this.obstacles.children.each(obstacle => {
            obstacle.x += obstacle.speed * delta;
            
            if (!obstacle.scored && obstacle.x + obstacle.width < this.player.x) {
                obstacle.scored = true;
                this.incrementScore();
            }

            if (obstacle.x < -obstacle.width) {
                obstacle.destroy();
            }
        });

        // Update level manager
        this.levelManager.update();
    }
} 