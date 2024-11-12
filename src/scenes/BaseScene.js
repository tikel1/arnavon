export class BaseScene extends Phaser.Scene {
    constructor(key) {
        super(key);
    }

    init() {
        this.collisionManager = new CollisionManager(this);
        this.scoreManager = new ScoreManager(this);
        this.powerUpManager = new PowerUpManager(this);
    }

    create() {
        this.player = new Player(this, 100, 450);
        this.setupCommonElements();
    }

    setupCommonElements() {
        // Common setup for platforms, physics, etc.
    }
} 