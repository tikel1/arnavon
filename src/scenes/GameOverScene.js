export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene', active: false });
    }

    init(data) {
        this.finalScore = data.score;
        this.level = data.level;
        this.gameMode = data.gameMode;
    }

    create() {
        // Get the correct scene based on mode
        const sceneName = this.gameMode === 'simple' ? 'SimpleMode' : 'MathMode';
        const gameScene = this.scene.get(sceneName);
        
        // Pause the game scene's physics if it exists
        if (gameScene && gameScene.physics) {
            gameScene.physics.pause();
        }

        // Add semi-transparent dark overlay
        const overlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        ).setOrigin(0);

        // Game Over text with animation
        const gameOver = this.add.text(
            this.cameras.main.centerX,
            100,
            'לא נורא',
            {
                fontSize: '64px',
                fill: '#ff0000',
                stroke: '#000',
                strokeThickness: 6,
                fontFamily: 'Rubik',
                fontWeight: '500',
                rtl: true
            }
        ).setOrigin(0.5);

        // Animate game over text
        this.tweens.add({
            targets: gameOver,
            scale: { from: 0, to: 1 },
            duration: 1000,
            ease: 'Bounce'
        });

        // Score and level info
        const stats = this.add.text(
            this.cameras.main.centerX,
            200,
            [
                `שלב: ${this.level}`,
                `תוצאה: ${this.finalScore}`
            ],
            {
                fontSize: '32px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4,
                align: 'center',
                lineSpacing: 20,
                fontFamily: 'Rubik',
                fontWeight: '500',
                rtl: true
            }
        ).setOrigin(0.5);

        // Create buttons
        const buttonStyle = {
            fontSize: '28px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4,
            fontFamily: 'Rubik',
            fontWeight: '500',
            rtl: true
        };

        // Retry button
        const retryButton = this.add.text(
            this.cameras.main.centerX,
            300,
            '!נסו שוב (רווח)',
            buttonStyle
        ).setOrigin(0.5)
        .setInteractive();

        // Menu button
        const menuButton = this.add.text(
            this.cameras.main.centerX,
            360,
            'תפריט ראשי (M)',
            buttonStyle
        ).setOrigin(0.5)
        .setInteractive();

        // Add hover effects to buttons
        [retryButton, menuButton].forEach(button => {
            button.on('pointerover', () => {
                button.setScale(1.1);
                button.setStyle({ fill: '#ffff00' });
            });

            button.on('pointerout', () => {
                button.setScale(1);
                button.setStyle({ fill: '#fff' });
            });
        });

        // Add click handlers
        retryButton.on('pointerdown', () => this.retryGame());
        menuButton.on('pointerdown', () => this.goToMenu());

        // Remove any existing keyboard listeners from the game scene
        if (gameScene) {
            gameScene.input.keyboard.enabled = false;
        }

        // Add keyboard handlers with proper event handling
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

        spaceKey.on('down', () => {
            this.retryGame();
        });

        mKey.on('down', () => {
            this.goToMenu();
        });

        // Clean up event listeners when scene shuts down
        this.events.on('shutdown', () => {
            spaceKey.destroy();
            mKey.destroy();
        });

        // Add button prompts that pulse
        this.tweens.add({
            targets: [retryButton, menuButton],
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    retryGame() {
        const sceneName = this.gameMode === 'simple' ? 'SimpleMode' : 'MathMode';
        const gameScene = this.scene.get(sceneName);
        
        // Re-enable input for game scene before stopping
        if (gameScene) {
            gameScene.input.keyboard.enabled = true;
            gameScene.physics.resume();
        }

        // Stop both scenes and start a new game
        this.scene.stop('GameOverScene');
        this.scene.stop(sceneName);
        this.scene.start(sceneName);
    }

    goToMenu() {
        const sceneName = this.gameMode === 'simple' ? 'SimpleMode' : 'MathMode';
        const gameScene = this.scene.get(sceneName);
        
        // Re-enable input for game scene before stopping
        if (gameScene) {
            gameScene.input.keyboard.enabled = true;
        }

        // Stop both scenes and return to menu
        this.scene.stop('GameOverScene');
        this.scene.stop(sceneName);
        this.scene.start('StartMenuScene');
    }
} 