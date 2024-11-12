export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player-run');
        this.scene = scene;
        this.groundY = 260;
        this.jumpForce = -450;
        this.baseAnimationSpeed = 12;
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
        this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
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

        this.play('run', true);
    }

    jump() {
        if (!this.isJumping && !this.isDead) {
            this.isJumping = true;
            this.setVelocityY(this.jumpForce);
            this.play('jump', true);
        }
    }

    hit() {
        if (!this.isDead) {
            if (this.scene.lives <= 0) {
                this.isDead = true;
                this.play('jump');
                this.setTint(0xff0000);
                
                // Ensure player stays at ground level
                this.y = this.groundY;
                this.setVelocityY(0);
                
                // Disable physics body
                this.body.allowGravity = false;
                this.body.enable = false;
            } else {
                // Just hit but not dead
                this.setTint(0xff0000);
                this.scene.time.delayedCall(100, () => {
                    this.clearTint();
                });
            }
        }
    }

    update() {
        if (this.isDead) {
            // When dead, force position at ground level
            this.y = this.groundY;
            this.setVelocityY(0);
            return;
        }

        // Keep player in fixed x position
        this.x = 100;

        // Ground check and animation handling
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.setVelocityY(0);
            if (this.isJumping) {
                this.isJumping = false;
                this.play('run', true);
            }
        }

        // Handle jump input only if not dead
        if (!this.isDead && this.spaceKey.isDown && !this.isJumping) {
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
