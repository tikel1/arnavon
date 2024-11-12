export class LevelManager {
    constructor(scene) {
        this.scene = scene;
        this.currentLevel = 1;
        this.currentSeries = 0;
        this.seriesInLevel = this.getRandomSeriesCount();
        this.isSpawningSeries = false;
        
        // Base speeds
        this.baseObstacleSpeed = -300;
        this.currentSpeed = this.baseObstacleSpeed;
        
        // Set initial background speeds
        this.updateBackgroundSpeeds();
        
        // Timing constants (in milliseconds)
        this.OBSTACLE_SPACING = 2000;
        this.SERIES_SPACING = 5000;
        
        console.log(`Starting Level ${this.currentLevel} with ${this.seriesInLevel} series`);
    }

    getRandomSeriesCount() {
        return Phaser.Math.Between(5, 10);
    }

    generateSeries() {
        if (this.scene.isGameOver) return;

        const obstacleCount = Phaser.Math.Between(1, 3);
        console.log(`Spawning series ${this.currentSeries + 1}/${this.seriesInLevel} with ${obstacleCount} obstacles`);
        
        let delay = 0;
        
        // Spawn obstacles in series
        for (let i = 0; i < obstacleCount; i++) {
            this.scene.time.delayedCall(delay, () => {
                this.scene.spawnObstacle(this.currentSpeed);
            });
            delay += this.OBSTACLE_SPACING;
        }

        this.currentSeries++;
        
        // Schedule next series
        this.scene.time.delayedCall(delay + this.SERIES_SPACING, () => {
            this.isSpawningSeries = false;
            
            // Check if level is complete
            if (this.currentSeries >= this.seriesInLevel) {
                this.completeLevel();
            }
        });
    }

    updateBackgroundSpeeds() {
        // Get the current obstacle speed in pixels per frame
        const baseSpeed = Math.abs(this.currentSpeed) / 60;  // Convert pixels/second to pixels/frame

        // Update each background layer
        this.scene.backgrounds.forEach((bg, index) => {
            let speedMultiplier;
            if (index === 3) {
                // Layer 4 (ground) matches obstacle speed exactly
                speedMultiplier = 1;
            } else {
                // Earlier layers move progressively slower
                speedMultiplier = (index + 1) * 0.25;  // 25%, 50%, 75% of ground speed
            }
            
            bg.speed = baseSpeed * speedMultiplier;
        });
    }

    completeLevel() {
        this.currentLevel++;
        this.currentSeries = 0;
        this.seriesInLevel = this.getRandomSeriesCount();
        
        // Increase speed for new level (20% faster each level)
        this.currentSpeed = this.baseObstacleSpeed * (1 + (this.currentLevel - 1) * 0.2);
        
        // Update background speeds for new level
        this.updateBackgroundSpeeds();

        // Update level text if it exists
        if (this.scene.levelText) {
            this.scene.levelText.setText('Level: ' + this.currentLevel);
        }

        console.log(`Level ${this.currentLevel} starting with ${this.seriesInLevel} series (Speed: ${Math.abs(this.currentSpeed)})`);
        this.isSpawningSeries = false;
    }

    update() {
        if (!this.isSpawningSeries && !this.scene.isGameOver) {
            this.isSpawningSeries = true;
            this.generateSeries();
        }
    }
} 