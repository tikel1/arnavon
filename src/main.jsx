import Phaser from 'phaser';
import { StartMenuScene } from './scenes/StartMenuScene';
import { SimpleMode } from './scenes/SimpleMode';
import { MathMode } from './scenes/MathMode';
import { GameOverScene } from './scenes/GameOverScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';

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
    scene: [StartMenuScene, CharacterSelectScene, SimpleMode, MathMode, GameOverScene]
};

new Phaser.Game(config); 