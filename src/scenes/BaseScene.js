import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { LevelManager } from '../systems/LevelManager';
import { PowerupManager } from '../systems/PowerupManager';

export class BaseScene extends Phaser.Scene {
    constructor(sceneName) {
        super(sceneName);
        this.backgrounds = [];
        this.isGameOver = false;
        this.score = 0;
        this.lives = 3;
        this.basePath = window.location.pathname.includes('/arnavon') ? '/arnavon' : '';
    }

    preload() {
        // Load backgrounds with correct path
        for (let i = 1; i <= 4; i++) {
            this.load.image(`background-${i}`, `${this.basePath}/assets/Background/nature_5/${i}.png`);
        }

        // Load player sprites
        this.load.spritesheet('player-run', 
            `${this.basePath}/assets/1 Pink_Monster/Pink_Monster_Run_6.png`,
            { frameWidth: 32, frameHeight: 32 }
        );
        this.load.spritesheet('player-jump', 
            `${this.basePath}/assets/1 Pink_Monster/Pink_Monster_Jump_8.png`,
            { frameWidth: 32, frameHeight: 32 }
        );

        // Load heart powerup
        this.load.image('heart-powerup', `${this.basePath}/assets/Icons/Heart.png`);

        // Create obstacle texture
        const graphics = this.add.graphics();
        graphics.fillStyle(0xFF0000);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('obstacle', 32, 32);
        graphics.destroy();
    }

    create() {
        // Create level manager first
        this.levelManager = new LevelManager(this);

        // Create backgrounds with initial speeds
        this.backgrounds = [];
        for (let i = 1; i <= 4; i++) {
            let bg = this.add.tileSprite(0, 0, 576, 324, `background-${i}`);
            bg.setOrigin(0, 0);
            bg.setDepth(i - 4);
            
            this.backgrounds.push({
                layer: bg,
                speed: 0
            });
        }
        
        // Initialize background speeds
        this.levelManager.updateBackgroundSpeeds();

        // Create obstacles group
        this.obstacles = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Add score text
        this.scoreText = this.add.text(
            this.cameras.main.width - 16, 
            16, 
            'Score: 0', 
            {
                fontSize: '24px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4
            }
        ).setOrigin(1, 0);

        // Add level display
        this.levelText = this.add.text(
            this.cameras.main.width - 16, 
            48, 
            'Level: 1', 
            {
                fontSize: '24px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4
            }
        ).setOrigin(1, 0);

        // Add lives display
        this.livesText = this.add.text(
            16, 
            16, 
            '❤️'.repeat(this.lives), 
            {
                fontSize: '24px'
            }
        );

        // Reset physics state
        this.physics.world.resume();

        // Create powerup manager
        this.powerupManager = new PowerupManager(this);

        // Add powerup collision after creating the player
        if (this.player && this.powerupManager) {
            this.physics.add.overlap(
                this.player,
                this.powerupManager.powerups,
                this.powerupManager.handlePowerupCollision,
                null,
                this.powerupManager
            );
        }
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

    spawnObstacle(speed) {
        if (!this.isGameOver) {
            const obstacle = this.physics.add.sprite(600, 260, 'obstacle');
            obstacle.scored = false;
            obstacle.speed = speed;
            obstacle.body.allowGravity = false;
            obstacle.body.immovable = true;
            this.obstacles.add(obstacle);
            obstacle.setScale(2);
        }
    }

    incrementScore() {
        this.score += 1;
        this.scoreText.setText('Score: ' + this.score);
    }

    handleCollision() {
        if (!this.player.isDead) {
            this.lives--;
            this.livesText.setText('❤️'.repeat(this.lives));

            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.player.hit();
                
                this.obstacles.children.each(obstacle => {
                    if (Math.abs(obstacle.x - this.player.x) < 200) {
                        obstacle.destroy();
                    }
                });
            }
        }
    }

    gameOver() {
        if (!this.isGameOver) {
            this.isGameOver = true;
            
            this.obstacles.children.each(obstacle => {
                obstacle.speed = 0;
            });

            this.player.isDead = true;
            this.player.y = this.player.groundY;
            this.player.setVelocityY(0);
            this.player.body.allowGravity = false;
            this.player.body.enable = false;

            this.physics.pause();

            this.scene.launch('GameOverScene', {
                score: this.score,
                level: this.levelManager.currentLevel,
                gameMode: this.constructor.name.toLowerCase().replace('mode', '')
            });
        }
    }

    setupCollisions() {
        if (this.player && this.obstacles) {
            this.physics.add.collider(
                this.player,
                this.obstacles,
                this.handleCollision,
                null,
                this
            );
        }

        // Add powerup collision
        if (this.player && this.powerupManager) {
            this.physics.add.overlap(
                this.player,
                this.powerupManager.powerups,
                (player, powerup) => this.powerupManager.handlePowerupCollision(player, powerup),
                null,
                this
            );
        }
    }

    spawnSeries() {
        // This should be implemented by child classes
        console.warn('spawnSeries() not implemented');
    }

    completeSeries() {
        if (this.isGameOver) return;
        
        this.levelManager.currentSeries++;
        if (this.levelManager.currentSeries >= this.levelManager.seriesInLevel) {
            this.levelManager.completeLevel();
            this.time.delayedCall(1000, () => this.spawnSeries());
        } else {
            this.levelManager.isSpawningSeries = false;
            this.time.delayedCall(2000, () => this.spawnSeries());
        }
    }
} 