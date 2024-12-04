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
            powerup: 0.97,
            background: {
                layer1: 0.3,
                layer2: 0.8,
                layer3: 0.85,
                layer4: 1
            }
        };
        this.currentSpeed = this.BASE_MOVEMENT_SPEED;
        
        this.updateBackgroundSpeeds();
        console.log(`Starting Level ${this.currentLevel} with ${this.seriesInLevel} series`);
    }

    getRandomSeriesCount() {
        return Phaser.Math.Between(5, 10);
    }

    getObstacleSpeed() {
        return -this.currentSpeed * this.speedMultipliers.obstacle;
    }

    completeLevel() {
        this.currentLevel++;
        this.currentSeries = 0;
        this.seriesInLevel = this.getRandomSeriesCount();
        
        this.currentSpeed = this.BASE_MOVEMENT_SPEED * (1 + (this.currentLevel - 1) * 0.2);
        this.updateBackgroundSpeeds();

        if (this.scene.levelText) {
            this.scene.levelText.setText('שלב: ' + this.currentLevel);
        }

        console.log(`Level ${this.currentLevel} starting with ${this.seriesInLevel} series`);
        this.isSpawningSeries = false;
    }

    updateBackgroundSpeeds() {
        const baseSpeed = this.currentSpeed / 60;  
        this.scene.backgrounds.forEach((bg, index) => {
            const layerNumber = index + 1;
            const multiplier = this.speedMultipliers.background[`layer${layerNumber}`];
            bg.speed = baseSpeed * multiplier;
        });
    }
} 
