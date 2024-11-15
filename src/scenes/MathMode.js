import { BaseScene } from './BaseScene';
import { Player } from '../entities/Player';

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

        // Debug key press listener - only for keydown
        this.input.keyboard.on('keydown', (event) => {
            console.log('Key pressed:', event.keyCode, String.fromCharCode(event.keyCode));
        });

        // Start the first question after a short delay
        this.time.delayedCall(1000, () => {
            this.spawnSeries();
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
        const operations = ['+', '-'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        let num1 = Math.floor(Math.random() * 9) + 1;
        let num2 = Math.floor(Math.random() * 9) + 1;
        let answer;

        if (operation === '+') {
            answer = num1 + num2;
        } else {
            if (num1 < num2) {
                [num1, num2] = [num2, num1];
            }
            answer = num1 - num2;
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

        // Setup jump keys for the new answer
        this.setupJumpKeys(this.currentQuestion.answer);
    }

    startCountdown() {
        let timeLeft = 5;
        this.countdownText.setText(timeLeft.toString());
        
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                timeLeft--;
                if (timeLeft > 0) {
                    this.countdownText.setText(timeLeft.toString());
                } else {
                    this.countdownText.setText('');
                    this.levelManager.isSpawningSeries = true;
                    this.levelManager.generateSeries();
                }
            },
            repeat: 4
        });
    }

    spawnSeries() {
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

    // Override the base scene's completeSeries method
    completeSeries() {
        this.clearQuestion();
        this.levelManager.completeSeries();
        
        // If we have more series to go, generate a new question immediately
        if (this.levelManager.currentSeries < this.levelManager.seriesInLevel) {
            this.generateQuestion();
            this.time.delayedCall(1000, () => {
                this.startCountdown();
            });
        }
    }
} 