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
        
        // Set scale
        this.setScale(2);
    }

    update() {
        // Move obstacle manually since it's static
        this.x += this.speed * (this.scene.game.loop.delta / 1000);
    }
} 