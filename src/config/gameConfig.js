import { StartMenuScene } from '../scenes/StartMenuScene';
import { SimpleMode } from '../scenes/SimpleMode';
import { MathMode } from '../scenes/MathMode';
import { GameOverScene } from '../scenes/GameOverScene';
import { CharacterSelectScene } from '../scenes/CharacterSelectScene';

export const gameConfig = {
    type: Phaser.AUTO,
    width: 576,
    height: 324,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game',
        width: 576,
        height: 324
    },
    scene: [StartMenuScene, CharacterSelectScene, SimpleMode, MathMode, GameOverScene]
}; 