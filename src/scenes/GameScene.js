import { Player } from '../entities/Player';
import { Obstacle } from '../entities/Obstacle';
import { CollisionManager } from '../systems/CollisionManager';
import { LevelManager } from '../systems/LevelManager';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.backgrounds = [];
        this.isGameOver = false;
        this.score = 0;
        this.lives = 3;
        this.gameMode = 'simple';  // default mode
        this.basePath = import.meta.env.DEV ? '' : '/arnavon';
    }

    init(data) {
        this.isGameOver = false;
        this.score = 0;
        this.lives = 3;
        this.gameMode = data.gameMode || 'simple';
        
        if (this.physics) {
            this.physics.resume();
        }
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
        this.load.spritesheet('player-death', 
            `${this.basePath}/assets/1 Pink_Monster/Pink_Monster_Death_8.png`,
            { frameWidth: 32, frameHeight: 32 }
        );

        // Load heart powerup image
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
            
            // Initial speed will be set by LevelManager.updateBackgroundSpeeds()
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
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });

        this.livesText = this.add.text(16, 48, '❤️'.repeat(this.lives), {
            fontSize: '24px'
        });

        // Setup collisions
        this.physics.add.collider(
            this.player,
            this.obstacles,
            this.handleCollision,
            null,
            this
        );

        // Add level display
        this.levelText = this.add.text(this.cameras.main.width - 16, 16, 'Level: 1', {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(1, 0);

        // Initialize appropriate manager based on mode
        if (this.gameMode === 'math') {
            // Initialize math mode specific features
            this.initMathMode();
        }

        // Reset physics state
        this.physics.world.resume();
    }

    initMathMode() {
        // We'll implement math mode features later
        console.log('Math mode initialized');
    }

    spawnObstacle(speed) {
        if (!this.isGameOver) {
            const obstacle = this.physics.add.sprite(600, 260, 'obstacle');
            obstacle.scored = false;
            obstacle.speed = speed;  // This is pixels per second
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
            if (this.lives >= 0) {
                this.livesText.setText('❤️'.repeat(this.lives));
            }

            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.player.hit();
                
                // Remove nearby obstacles
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
            
            // Stop all obstacles
            this.obstacles.children.each(obstacle => {
                obstacle.speed = 0;
            });

            // Play death animation first
            this.player.play('death');
            
            // Wait for animation to complete before disabling physics
            this.time.delayedCall(800, () => {
                this.player.isDead = true;
                this.player.y = this.player.groundY;
                this.player.setVelocityY(0);
                this.player.body.allowGravity = false;
                this.player.body.enable = false;
                this.physics.pause();

                // Launch game over scene
                this.scene.launch('GameOverScene', {
                    score: this.score,
                    level: this.levelManager.currentLevel,
                    gameMode: this.gameMode
                });
            });
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

        // Update level manager
        this.levelManager.update();
    }
} 