export class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'obstacle');
        this.scene = scene;
        this.speed = -300;
        this.init();
    }

    init() {
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);
        
        // Randomly select one of the 6 rock frames (0-5)
        const randomFrame = Phaser.Math.Between(0, 5);
        this.setFrame(randomFrame);
        
        // Set scale smaller
        this.setScale(2.5);
    }

    update() {
        // Move obstacle manually since it's static
        this.x += this.speed * (this.scene.game.loop.delta / 1000);
    }
} 