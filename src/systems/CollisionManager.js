export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    setup() {
        this.scene.physics.add.collider(
            this.scene.player,
            this.scene.obstacles,
            this.handleObstacleCollision,
            null,
            this
        );
    }

    handleObstacleCollision(player, obstacle) {
        this.scene.gameOver();
    }
} 