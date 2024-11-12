import Phaser from 'phaser';
import { StartMenuScene } from './scenes/StartMenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

const config = {
    type: Phaser.AUTO,
    width: 576,
    height: 324,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [StartMenuScene, GameScene, GameOverScene]
};

new Phaser.Game(config); 