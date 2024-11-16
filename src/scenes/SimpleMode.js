import { BaseScene } from './BaseScene';
import { Player } from '../entities/Player';
import { GAME } from '../config/constants';

export class SimpleMode extends BaseScene {
    constructor() {
        super('SimpleMode');
    }

    create() {
        super.create();
        this.player = new Player(this, 100, 260, Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.player.setDepth(1);
        this.setupCollisions();
        
        // Start first series after a delay
        this.time.delayedCall(1000, () => this.spawnSeries());
    }

    spawnSeries() {
        if (this.isGameOver || this.levelManager.isSpawningSeries) return;
        
        this.levelManager.isSpawningSeries = true;
        const obstacleCount = Phaser.Math.Between(1, 3);
        
        let delay = 0;
        for (let i = 0; i < obstacleCount; i++) {
            this.time.delayedCall(delay, () => {
                this.spawnObstacle(this.levelManager.getObstacleSpeed());
            });
            delay += GAME.TIMING.OBSTACLE_SPACING;
        }

        // Schedule series completion
        this.time.delayedCall(delay, () => {
            this.completeSeries();
        });
    }

    completeSeries() {
        if (this.isGameOver) return;
        
        this.levelManager.currentSeries++;
        
        if (this.levelManager.currentSeries >= this.levelManager.seriesInLevel) {
            this.levelManager.completeLevel();
        }
        
        this.levelManager.isSpawningSeries = false;
        
        // Schedule next series
        this.time.delayedCall(GAME.TIMING.SERIES_SPACING, () => {
            this.spawnSeries();
        });
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

        // Update powerup manager
        this.powerupManager.update();
    }
} 