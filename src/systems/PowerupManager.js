import { POWERUPS, GAME } from '../config/constants';

export class PowerupManager {
    constructor(scene) {
        this.scene = scene;
        this.powerups = scene.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        this.nextSpawnTime = this.getNextSpawnTime();
        this.hasActivePowerup = false;
    }

    getNextSpawnTime() {
        const randomDelay = Phaser.Math.Between(30000, 90000);
        return this.scene.time.now + randomDelay;
    }

    update() {
        if (this.scene.isGameOver) return;

        const currentTime = this.scene.time.now;

        if (!this.hasActivePowerup && this.scene.lives < 3 && currentTime > this.nextSpawnTime) {
            let canSpawn = true;
            const spawnX = this.scene.cameras.main.width + 50;
            
            this.scene.obstacles.children.each(obstacle => {
                if (Math.abs(obstacle.x - spawnX) < 200) {
                    canSpawn = false;
                }
            });

            if (canSpawn) {
                this.spawnHeartPowerup();
                this.nextSpawnTime = this.getNextSpawnTime();
                this.hasActivePowerup = true;
            }
        }

        this.powerups.children.each(powerup => {
            powerup.x += this.scene.levelManager.getObstacleSpeed() * (this.scene.levelManager.speedMultipliers.powerup / this.scene.levelManager.speedMultipliers.obstacle) / 60;
            
            if (powerup.x < -powerup.width) {
                powerup.destroy();
                this.hasActivePowerup = false;
            }
        });
    }

    spawnHeartPowerup() {
        const powerup = this.scene.add.sprite(
            this.scene.cameras.main.width + 50,
            250,
            'heart-powerup'
        );
        
        this.scene.physics.add.existing(powerup);
        powerup.setDepth(1);
        powerup.setScale(0.05);
        
        this.scene.tweens.add({
            targets: powerup,
            y: powerup.y - 10,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        this.powerups.add(powerup);
    }

    handlePowerupCollision(player, powerup) {
        if (this.scene.lives < 3) {
            this.scene.lives++;
            this.scene.livesText.setText('❤️'.repeat(this.scene.lives));
            
            const plusOne = this.scene.add.text(
                player.x,
                player.y - 40,
                '+1',
                {
                    fontSize: '24px',
                    fontWeight: 'bold',
                    fill: '#FFFFFF'
                }
            );
            
            this.scene.tweens.add({
                targets: plusOne,
                y: plusOne.y - 50,
                alpha: 0,
                duration: 1000,
                ease: 'Power1',
                onComplete: () => plusOne.destroy()
            });
            
            powerup.destroy();
            this.hasActivePowerup = false;
        }
    }
} 