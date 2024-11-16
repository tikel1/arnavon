import { BaseScene } from './BaseScene';
import { Player } from '../entities/Player';

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
        this.countdownText = null;
        this.countdownTimer = null;
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

        // Convert answer to number and create key listeners for both number row and numpad
        const numericAnswer = parseInt(answer);
        
        // Create array of valid key codes for this number
        const numberKeyCode = 48 + numericAnswer; // 48 is '0' in ASCII
        const numpadKeyCode = 96 + numericAnswer; // 96 is 'NUMPAD_0' in ASCII
        
        this.jumpKeys = [
            this.input.keyboard.addKey(numberKeyCode),
            this.input.keyboard.addKey(numpadKeyCode)
        ];

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
        if (this.countdownTimer) {
            this.countdownTimer.destroy();
        }
        
        const baseTime = 5;
        const level = this.levelManager.currentLevel;
        let timeLeft = Math.max(2, Math.ceil(baseTime * Math.pow(0.8, level - 1)));
        
        this.countdownText.setText(timeLeft.toString());
        
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                timeLeft--;
                if (timeLeft > 0) {
                    this.countdownText.setText(timeLeft.toString());
                } else {
                    this.countdownText.setText('');
                    // Only generate series when countdown completes
                    if (!this.isGameOver) {
                        this.levelManager.generateSeries();
                    }
                }
            },
            repeat: timeLeft - 1
        });
    }

    spawnSeries() {
        if (this.isGameOver || this.levelManager.isSpawningSeries) return;
        
        // Set spawning flag immediately
        this.levelManager.isSpawningSeries = true;
        
        // Clear any existing question first
        this.clearQuestion();
        
        // Generate new question and start countdown
        this.generateQuestion();
        this.startCountdown();
    }

    clearQuestion() {
        this.currentQuestion = null;
        if (this.questionText) {
            this.questionText.setText('');
        }
        if (this.countdownText) {
            this.countdownText.setText('');
        }
        if (this.countdownTimer) {
            this.countdownTimer.destroy();
        }
    }

    update() {
        super.update(); // This will handle all updates including powerups
    }
} 