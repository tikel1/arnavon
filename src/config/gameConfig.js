import { StartMenuScene } from '../scenes/StartMenuScene';
import { SimpleMode } from '../scenes/SimpleMode';
import { MathMode } from '../scenes/MathMode';
import { GameOverScene } from '../scenes/GameOverScene';

export const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        parent: 'game',
        width: 800,
        height: 600
    },
    scene: [StartMenuScene, SimpleMode, MathMode, GameOverScene]
}; 