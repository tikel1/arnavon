import { soundManager } from '../utils/SoundManager';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, jumpKey = Phaser.Input.Keyboard.KeyCodes.SPACE) {
        super(scene, x, y, 'player-run');
        this.scene = scene;
        this.groundY = 260;
        this.jumpForce = -450;
        this.baseAnimationSpeed = 12;
        this.jumpKey = jumpKey;
        this.jumpSounds = [];
        for (let i = 1; i <= 4; i++) {
            this.jumpSounds.push(scene.sound.add(`jump-sound-${i}`, { volume: 0.2 }));
        }
        this.hurtSound = scene.sound.add('hurt-sound', { volume: 0.2 });
        this.dieSound = scene.sound.add('die-sound', { volume: 0.2 });
        this.init();
    }

    init() {
        // Add to scene and enable physics
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        // Reset all states
        this.isJumping = false;
        this.isDead = false;
        
        // Configure physics body
        this.body.enable = true;
        this.body.allowGravity = true;
        this.body.reset(100, this.groundY);
        this.setVelocity(0, 0);
        
        // Clear any tint
        this.clearTint();
        
        // Reset position
        this.setPosition(100, this.groundY);
        
        // Configure physics properties
        this.setBounce(0);
        this.setCollideWorldBounds(true);
        this.setScale(2);
        
        // Setup input
        this.jumpKeyObj = this.scene.input.keyboard.addKey(this.jumpKey);
        
        // Setup animations and start running
        this.setupAnimations();
        this.play('run', true);
    }

    setupAnimations() {
        // Running animation
        if (!this.scene.anims.exists('run')) {
            this.scene.anims.create({
                key: 'run',
                frames: this.scene.anims.generateFrameNumbers('player-run', { 
                    start: 0, 
                    end: 5 
                }),
                frameRate: this.baseAnimationSpeed,
                repeat: -1
            });
        }

        // Jumping animation
        if (!this.scene.anims.exists('jump')) {
            this.scene.anims.create({
                key: 'jump',
                frames: this.scene.anims.generateFrameNumbers('player-jump', { 
                    start: 0, 
                    end: 7 
                }),
                frameRate: 15,
                repeat: 0
            });
        }

        // Death animation
        if (!this.scene.anims.exists('death')) {
            this.scene.anims.create({
                key: 'death',
                frames: this.scene.anims.generateFrameNumbers('player-death', {
                    start: 0,
                    end: 7
                }),
                frameRate: 10,
                repeat: 0
            });
        }

        this.play('run', true);
    }

    jump() {
        if (!this.isJumping && this.y >= this.groundY) {
            this.isJumping = true;
            this.setVelocityY(this.jumpForce);
            this.play('jump', true);
            
            // Play random jump sound
            const randomSound = this.jumpSounds[Math.floor(Math.random() * this.jumpSounds.length)];
            soundManager.playSound(randomSound);
        }
    }

    hit() {
        if (!this.isDead) {
            if (this.scene.lives <= 0) {
                this.isDead = true;
                
                // Play death sound
                soundManager.playSound(this.dieSound);
                
                // First ensure player is at ground level
                this.y = this.groundY;
                this.setVelocityY(0);
                
                // Then disable physics
                this.body.allowGravity = false;
                this.body.enable = false;
                
                // Finally play death animation
                this.play('death');
            } else {
                // Just hit but not dead - play hurt sound
                soundManager.playSound(this.hurtSound);
                this.setTint(0xff0000);
                this.scene.time.delayedCall(100, () => {
                    this.clearTint();
                });
            }
        }
    }

    update() {
        if (this.isDead) {
            this.y = this.groundY;
            this.setVelocityY(0);
            return;
        }

        this.x = 100;

        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.setVelocityY(0);
            if (this.isJumping) {
                this.isJumping = false;
                this.play('run', true);
            }
        }

        // Check for jump input with multiple possible keys
        if (Array.isArray(this.jumpKeyObj)) {
            if (this.jumpKeyObj.some(key => key.isDown)) {
                this.jump();
            }
        } else if (this.jumpKeyObj && this.jumpKeyObj.isDown) {
            this.jump();
        }
    }

    updateAnimationSpeed(newSpeed) {
        // Update run animation speed
        const runAnim = this.scene.anims.get('run');
        if (runAnim) {
            runAnim.frameRate = newSpeed;
        }
        
        // Restart animation to apply new speed
        if (this.anims.currentAnim.key === 'run') {
            this.play('run', true);
        }
    }
}
