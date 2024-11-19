import { BaseScene } from './BaseScene';
import { Player } from '../entities/Player';
import { GAME } from '../config/constants';

const DIFFICULTY_SETTINGS = {
    1: { min: 0, max: 10, operators: ['+'] },
    2: { min: 5, max: 15, operators: ['+'] },
    3: { min: 5, max: 20, operators: ['+', '-'] },
    4: { min: 10, max: 20, operators: ['+', '-'] },
    5: { min: 15, max: 25, operators: ['+', '-'] },
    6: { min: 15, max: 30, operators: ['+', '-'] },
    7: { 
        addition: { min: 20, max: 30, operators: ['+'] },
        subtraction: { min: 20, max: 30, operators: ['-'] },
        multiplication: { min: 0, max: 10, operators: ['*'] }
    },
    8: { 
        addition: { min: 20, max: 30, operators: ['+'] },
        subtraction: { min: 20, max: 30, operators: ['-'] },
        multiplication: { min: 0, max: 10, operators: ['*'] }
    },
    9: { 
        addition: { min: 20, max: 30, operators: ['+'] },
        subtraction: { min: 20, max: 30, operators: ['-'] },
        multiplication: { min: 0, max: 10, operators: ['*'] }
    },
    10: { 
        addition: { min: 20, max: 30, operators: ['+'] },
        subtraction: { min: 20, max: 30, operators: ['-'] },
        multiplication: { min: 0, max: 10, operators: ['*'] }
    }
};

export class MathMode extends BaseScene {
    constructor() {
        super('MathMode');
        this.currentQuestion = null;
        this.questionText = null;
        this.jumpKeys = null;
        this.timerBar = null;
        this.timerEvent = null;
    }

    create() {
        super.create();
        this.player = new Player(this, 100, 260, Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.player.setDepth(1);
        this.setupCollisions();
        
        // Create question text (initially empty)
        this.questionText = this.add.text(
            this.cameras.main.centerX,
            50,
            '',
            {
                fontSize: '32px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(10);

        // Create countdown text (initially empty)
        this.countdownText = this.add.text(
            this.cameras.main.centerX,
            100,
            '',
            {
                fontSize: '48px',
                fill: '#ff0000',
                stroke: '#000',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(10);

        // Clear any existing state
        this.clearQuestion();
        this.levelManager.isSpawningSeries = false;

        // Start the first question after a short delay
        this.time.delayedCall(1000, () => {
            if (!this.isGameOver) {
                this.spawnSeries();
            }
        });
    }

    setupJumpKeys(answer) {
        // Remove old jump key listeners if they exist
        if (this.jumpKeys) {
            this.jumpKeys.forEach(key => key.destroy());
        }

        // Convert answer to string for comparison
        const answerStr = answer.toString();
        
        // Create number keys for both regular numbers and numpad
        const numberKey = this.input.keyboard.addKey(48 + parseInt(answerStr)); // Regular number keys
        const numpadKey = this.input.keyboard.addKey(96 + parseInt(answerStr)); // Numpad keys
        
        // Store keys for cleanup
        this.jumpKeys = [numberKey, numpadKey];
        
        // Update player's jump key checking
        this.player.jumpKeyObj = this.jumpKeys;
    }

    generateQuestion() {
        const level = this.levelManager.currentLevel;
        // Get difficulty settings for current level, if above 10 use level 10 settings
        const settings = DIFFICULTY_SETTINGS[Math.min(level, 10)];
        
        let operation, num1, num2, operationSettings;

        if (level >= 7) {
            // Randomly choose operation type
            const operationType = Phaser.Math.RND.pick(['addition', 'subtraction', 'multiplication']);
            operationSettings = settings[operationType];
            operation = operationSettings.operators[0];
        } else {
            // For levels 1-6, use the old logic
            operation = settings.operators[Math.floor(Math.random() * settings.operators.length)];
            operationSettings = settings;
        }

        // Generate numbers within level range
        num1 = Phaser.Math.Between(operationSettings.min, operationSettings.max);
        num2 = Phaser.Math.Between(operationSettings.min, operationSettings.max);

        let answer;
        if (operation === '+') {
            answer = num1 + num2;
        } else if (operation === '-') {
            // Ensure subtraction results in positive number
            if (num1 < num2) {
                [num1, num2] = [num2, num1];
            }
            answer = num1 - num2;
        } else if (operation === '*') {
            answer = num1 * num2;
        }

        const answerStr = answer.toString();
        const hiddenAnswer = answerStr.slice(0, -1) + '_';

        this.currentQuestion = {
            display: `${num1} ${operation} ${num2} = ${hiddenAnswer}`,
            answer: answerStr[answerStr.length - 1]
        };

        if (this.questionText) {
            this.questionText.setText(this.currentQuestion.display);
        }

        this.setupJumpKeys(this.currentQuestion.answer);
    }

    startCountdown() {
        if (this.timerEvent) {
            this.timerEvent.destroy();
        }
        
        // Remove old timer bar if it exists
        if (this.timerBar) {
            this.timerBar.destroy();
        }
        
        const baseTime = 5000; // Time in milliseconds
        const level = this.levelManager.currentLevel;
        const timeLeft = Math.max(2000, Math.ceil(baseTime * Math.pow(0.8, level - 1)));
        
        // Create background bar (gray)
        const barBackground = this.add.rectangle(
            this.cameras.main.centerX,
            80,
            200,
            20,
            0x666666
        ).setOrigin(0.5);
        
        // Create timer bar (green)
        this.timerBar = this.add.rectangle(
            this.cameras.main.centerX - 100,
            80,
            200,
            20,
            0x00ff00
        ).setOrigin(0, 0.5);
        
        // Create the timer event
        this.timerEvent = this.time.addEvent({
            delay: timeLeft,
            callback: () => {
                if (!this.isGameOver) {
                    this.spawnObstacles();
                }
                this.timerBar.destroy();
                barBackground.destroy();
            }
        });
        
        // Update the timer bar width
        this.time.addEvent({
            delay: 16, // 60fps
            callback: () => {
                if (this.timerBar && this.timerBar.active) {
                    const progress = this.timerEvent.getProgress();
                    this.timerBar.width = 200 * (1 - progress);
                    
                    // Change color based on remaining time
                    if (progress > 0.7) {
                        this.timerBar.setFillStyle(0xff0000); // Red
                    } else if (progress > 0.3) {
                        this.timerBar.setFillStyle(0xffff00); // Yellow
                    }
                }
            },
            loop: true
        });
    }

    spawnObstacles() {
        const obstacleCount = Phaser.Math.Between(1, 3);
        let delay = 0;
        
        for (let i = 0; i < obstacleCount; i++) {
            this.time.delayedCall(delay, () => {
                this.spawnObstacle(this.levelManager.getObstacleSpeed());
            });
            delay += GAME.TIMING.OBSTACLE_SPACING;
        }

        // Schedule series completion
        this.time.delayedCall(delay, () => {
            this.completeSeries();
        });
    }

    spawnSeries() {
        if (this.isGameOver || this.levelManager.isSpawningSeries) return;
        
        this.levelManager.isSpawningSeries = true;
        this.clearQuestion();
        this.generateQuestion();
        this.startCountdown();
    }

    completeSeries() {
        if (this.isGameOver) return;
        
        this.levelManager.currentSeries++;
        
        if (this.levelManager.currentSeries >= this.levelManager.seriesInLevel) {
            this.levelManager.completeLevel();
            // Start new level with new series after delay
            this.time.delayedCall(1000, () => {
                this.spawnSeries();
            });
        } else {
            this.levelManager.isSpawningSeries = false;
            // Schedule next series
            this.time.delayedCall(2000, () => {
                this.spawnSeries();
            });
        }
    }

    clearQuestion() {
        this.currentQuestion = null;
        if (this.questionText) {
            this.questionText.setText('');
        }
        if (this.timerBar) {
            this.timerBar.destroy();
        }
        if (this.timerEvent) {
            this.timerEvent.destroy();
        }
    }

    update() {
        super.update(); // This will handle all updates including powerups
    }
} 