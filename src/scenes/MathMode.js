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
        
        const panelWidth = 240;
        const panelHeight = 60;
        const cornerRadius = 12;

        // Base panel (dark blue)
        const basePanel = this.add.graphics();
        basePanel.setDepth(9);
        basePanel.fillStyle(0x0A2A4A);
        
        // Draw base panel
        basePanel.beginPath();
        basePanel.moveTo(this.cameras.main.centerX - panelWidth/2 + cornerRadius, this.cameras.main.centerY - 250);
        // Top edge
        basePanel.lineTo(this.cameras.main.centerX + panelWidth/2 - cornerRadius, this.cameras.main.centerY - 250);
        // Top right corner (stepped)
        for (let i = 0; i < cornerRadius; i += 3) {
            basePanel.lineTo(
                this.cameras.main.centerX + panelWidth/2 - cornerRadius + i,
                this.cameras.main.centerY - 250 + i/2
            );
        }
        // Right edge
        basePanel.lineTo(this.cameras.main.centerX + panelWidth/2, this.cameras.main.centerY - 250 + panelHeight - cornerRadius);
        // Bottom right corner (stepped)
        for (let i = 0; i < cornerRadius; i += 3) {
            basePanel.lineTo(
                this.cameras.main.centerX + panelWidth/2 - i,
                this.cameras.main.centerY - 250 + panelHeight - cornerRadius + i
            );
        }
        // Bottom edge
        basePanel.lineTo(this.cameras.main.centerX - panelWidth/2 + cornerRadius, this.cameras.main.centerY - 250 + panelHeight);
        // Bottom left corner (stepped)
        for (let i = 0; i < cornerRadius; i += 3) {
            basePanel.lineTo(
                this.cameras.main.centerX - panelWidth/2 + cornerRadius - i,
                this.cameras.main.centerY - 250 + panelHeight - i
            );
        }
        // Left edge
        basePanel.lineTo(this.cameras.main.centerX - panelWidth/2, this.cameras.main.centerY - 250 + cornerRadius);
        // Top left corner (stepped)
        for (let i = 0; i < cornerRadius; i += 3) {
            basePanel.lineTo(
                this.cameras.main.centerX - panelWidth/2 + i,
                this.cameras.main.centerY - 250 + cornerRadius - i
            );
        }
        basePanel.closePath();
        basePanel.fill();
        
        // Create question text with maximum font weight
        this.questionText = this.add.text(
            this.cameras.main.centerX,
            55,
            '',
            {
                fontSize: '48px',
                fontFamily: 'Handjet',
                fontWeight: '900',
                color: '#FFD700',
                align: 'center',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000',
                    blur: 0,
                    fill: true
                }
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
        
        // Determine which digit to hide (20% chance for dozens if available)
        let hiddenDigitIndex;
        if (answerStr.length > 1 && Math.random() < 0.2) {
            // Hide dozens digit
            hiddenDigitIndex = answerStr.length - 2;
        } else {
            // Hide singles digit
            hiddenDigitIndex = answerStr.length - 1;
        }

        // Create hidden answer string
        const hiddenAnswer = answerStr.split('')
            .map((digit, index) => index === hiddenDigitIndex ? '_' : digit)
            .join('');

        this.currentQuestion = {
            display: `${num1} ${operation} ${num2} = ${hiddenAnswer}`,
            answer: answerStr[hiddenDigitIndex]
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
        
        if (this.timerBar) {
            this.timerBar.destroy();
        }
        
        const baseTime = 8000;
        const level = this.levelManager.currentLevel;
        const timeLeft = Math.max(3000, Math.ceil(baseTime * Math.pow(0.9, level - 1)));

        // Create container for timer
        this.timerBar = this.add.container(this.cameras.main.centerX, 95);
        
        // Dimensions
        const width = 150;
        const height = 12;
        
        // Create black background
        const background = this.add.rectangle(0, 0, width, height, 0x000000)
            .setStrokeStyle(1, 0xFFFFFF);  // White border
        this.timerBar.add(background);

        // Create main progress bar (slightly smaller than background)
        const mainBar = this.add.rectangle(
            -(width/2 - 2),
            0,
            width - 4,
            height - 4,
            0x92C81A
        ).setOrigin(0, 0.5);
        this.timerBar.add(mainBar);

        // Create the timer event
        this.timerEvent = this.time.delayedCall(timeLeft, () => {
            if (!this.isGameOver) {
                this.spawnObstacles();
            }
            this.timerBar.destroy();
        });

        // Update the timer width
        this.time.addEvent({
            delay: 32,
            callback: () => {
                if (this.timerBar && this.timerBar.active) {
                    const progress = 1 - this.timerEvent.getProgress();
                    mainBar.width = Math.round((width - 4) * progress);
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