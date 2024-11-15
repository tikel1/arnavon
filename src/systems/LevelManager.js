import { GAME } from '../config/constants';

export class LevelManager {
    constructor(scene) {
        this.scene = scene;
        this.currentLevel = 1;
        this.currentSeries = 0;
        this.seriesInLevel = this.getRandomSeriesCount();
        this.isSpawningSeries = false;
        
        // Speed management
        this.BASE_MOVEMENT_SPEED = 250;
        this.speedMultipliers = {
            obstacle: 1,
            background: {
                layer1: 0.3,
                layer2: 0.45,
                layer3: 0.6,
                layer4: 0.82
            }
        };
        this.currentSpeed = this.BASE_MOVEMENT_SPEED;
        
        // Use timing constants from config
        this.OBSTACLE_SPACING = GAME.TIMING.OBSTACLE_SPACING;
        this.SERIES_SPACING = GAME.TIMING.SERIES_SPACING;
        
        this.updateBackgroundSpeeds();
        console.log(`Starting Level ${this.currentLevel} with ${this.seriesInLevel} series`);
    }

    getRandomSeriesCount() {
        return Phaser.Math.Between(5, 10);
    }

    generateSeries() {
        if (this.scene.isGameOver) return;

        const obstacleCount = Phaser.Math.Between(1, 3);
        console.log(`Spawning series ${this.currentSeries + 1}/${this.seriesInLevel} with ${obstacleCount} obstacles`);
        
        let delay = GAME.TIMING.COUNTDOWN_DURATION;
        
        // Spawn obstacles in series
        for (let i = 0; i < obstacleCount; i++) {
            this.scene.time.delayedCall(delay, () => {
                this.scene.spawnObstacle(this.getObstacleSpeed());
            });
            delay += this.OBSTACLE_SPACING;
        }
        
        // Schedule series completion
        const obstaclePassTime = (600 + 32) / Math.abs(this.currentSpeed) * 1000;
        this.scene.time.delayedCall(delay + obstaclePassTime, () => {
            this.completeSeries();
        });
    }

    updateBackgroundSpeeds() {
        // Convert pixels/second to pixels/frame
        const baseSpeed = this.currentSpeed / 60;  

        // Update each background layer
        this.scene.backgrounds.forEach((bg, index) => {
            const layerNumber = index + 1;
            const multiplier = this.speedMultipliers.background[`layer${layerNumber}`];
            bg.speed = baseSpeed * multiplier;
        });
    }

    getObstacleSpeed() {
        return -this.currentSpeed * this.speedMultipliers.obstacle;
    }

    completeLevel() {
        this.currentLevel++;
        this.currentSeries = 0;
        this.seriesInLevel = this.getRandomSeriesCount();
        
        // Increase speed for new level (20% faster each level)
        this.currentSpeed = this.BASE_MOVEMENT_SPEED * (1 + (this.currentLevel - 1) * 0.2);
        this.updateBackgroundSpeeds();

        if (this.scene.levelText) {
            this.scene.levelText.setText('Level: ' + this.currentLevel);
        }

        console.log(`Level ${this.currentLevel} starting with ${this.seriesInLevel} series (Speed: ${this.currentSpeed})`);
        this.isSpawningSeries = false;
    }

    update() {
        if (!this.isSpawningSeries && !this.scene.isGameOver) {
            if (this.scene.constructor.name === 'MathMode') {
                // MathMode handles its own series spawning
                return;
            } else {
                this.generateSeries();
                this.isSpawningSeries = true;
            }
        }
    }

    completeSeries() {
        // If we're in math mode, call the scene's clearQuestion method
        if (this.scene.constructor.name === 'MathMode') {
            this.scene.clearQuestion();
        }
        
        this.currentSeries++;
        console.log(`Completed series ${this.currentSeries}/${this.seriesInLevel}`);
        
        if (this.currentSeries >= this.seriesInLevel) {
            this.completeLevel();
        } else {
            this.isSpawningSeries = false;  // Only reset if not completing level
            console.log('Ready for next series');
            // Tell MathMode to spawn new question
            if (this.scene.constructor.name === 'MathMode') {
                this.scene.spawnSeries();
            }
        }
    }
} 