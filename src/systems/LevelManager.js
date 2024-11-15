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
            powerup: 0.9,
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
        if (this.scene.isGameOver || this.isSpawningSeries) {
            console.log('Blocked series generation - already spawning or game over');
            return;
        }
        
        this.isSpawningSeries = true;  // Set flag immediately
        console.log('Starting series generation');
        
        const obstacleCount = Phaser.Math.Between(1, 3);
        console.log(`Spawning series ${this.currentSeries + 1}/${this.seriesInLevel} with ${obstacleCount} obstacles`);
        
        let delay = 0;  // Start spawning immediately after countdown
        
        // Spawn obstacles in series
        for (let i = 0; i < obstacleCount; i++) {
            this.scene.time.delayedCall(delay, () => {
                this.scene.spawnObstacle(this.getObstacleSpeed());
            });
            
            // Add powerup after first obstacle in series with 2+ obstacles
            if (i === 0 && obstacleCount > 1 && this.scene.lives < 3) {
                this.scene.time.delayedCall(delay + GAME.TIMING.OBSTACLE_SPACING / 2, () => {
                    console.log('Spawning powerup between obstacles');
                    this.scene.powerupManager.spawnHeartPowerup();
                });
            }
            
            delay += GAME.TIMING.OBSTACLE_SPACING;
        }
        
        // Schedule series completion
        const seriesTime = obstacleCount * GAME.TIMING.OBSTACLE_SPACING;
        this.scene.time.delayedCall(seriesTime, () => {
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
        
        // Reset spawning flag
        this.isSpawningSeries = false;

        // Add this new section to trigger the next series for MathMode
        if (this.scene.constructor.name === 'MathMode') {
            this.scene.time.delayedCall(1000, () => {
                this.scene.spawnSeries();
            });
        }
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
        if (!this.isSpawningSeries) {
            console.log('Blocked series completion - no active series');
            return;
        }
        
        this.currentSeries++;
        console.log(`Completed series ${this.currentSeries}/${this.seriesInLevel}`);
        
        if (this.currentSeries >= this.seriesInLevel) {
            this.completeLevel();
        } else {
            this.isSpawningSeries = false;  // Reset flag
            if (this.scene.constructor.name === 'MathMode') {
                this.scene.time.delayedCall(1000, () => {
                    this.scene.spawnSeries();
                });
            }
        }
    }
} 