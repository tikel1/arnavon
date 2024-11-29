export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene', active: false });
        this.gameOverColor = '#4a90e2'; // Nice blue color, can be configured
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

        // Game Over text with animation and subtle movement
        const gameOver = this.add.text(
            this.cameras.main.centerX,
            80,
            'לא נורא',
            {
                fontSize: '48px',
                fill: this.gameOverColor,
                stroke: '#000',
                strokeThickness: 6,
                fontFamily: 'Rubik',
                fontWeight: '500',
                rtl: true,
                align: 'center'
            }
        ).setOrigin(0.5);

        // Add subtle floating animation
        this.tweens.add({
            targets: gameOver,
            y: '+=5',
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Score and level info with center alignment
        const stats = this.add.text(
            0, 0,  // Position relative to container
            [
                `תוצאה: ${this.finalScore}`,  // Switched order
                `שלב: ${this.level}`
            ],
            {
                fontSize: '24px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4,
                align: 'center',
                lineSpacing: 15,
                fontFamily: 'Rubik',
                fontWeight: '500',
                rtl: true
            }
        ).setOrigin(0.5);

        // Create a container for stats at the desired position
        const statsContainer = this.add.container(this.cameras.main.centerX, 160);
        statsContainer.add(stats);

        // Create buttons with smaller font
        const buttonStyle = {
            fontSize: '20px', // Even smaller font
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4,
            fontFamily: 'Rubik',
            fontWeight: '500',
            rtl: true
        };

        // Buttons container moved down for more spacing
        const buttonsContainer = this.add.container(this.cameras.main.centerX, 250);

        // Retry button
        const retryButton = this.add.text(
            0, 0,
            'נסו שוב (רווח)',
            buttonStyle
        ).setOrigin(0.5);

        // Menu button with reduced spacing
        const menuButton = this.add.text(
            0, 35,
            'תפריט ראשי (M)',
            buttonStyle
        ).setOrigin(0.5);

        buttonsContainer.add([retryButton, menuButton]);
        
        [retryButton, menuButton].forEach(button => {
            button.setInteractive();
            button.on('pointerover', () => {
                button.setScale(1.1);
                button.setStyle({ fill: '#ffff00' });
            });

            button.on('pointerout', () => {
                button.setScale(1);
                button.setStyle({ fill: '#fff' });
            });
        });

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

        // Remove the pulsing animation from the buttons
        this.tweens.add({
            targets: [retryButton, menuButton],
            scale: 1.02,
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
        this.scene.start(sceneName, { mode: this.gameMode });
    }

    goToMenu() {
        const sceneName = this.gameMode === 'simple' ? 'SimpleMode' : 'MathMode';
        const gameScene = this.scene.get(sceneName);
        
        // Re-enable input for game scene before stopping
        if (gameScene) {
            gameScene.input.keyboard.enabled = true;
            gameScene.physics.resume();
            
            // Clear any remaining game objects
            gameScene.obstacles?.clear(true, true);
            gameScene.backgrounds?.forEach(bg => bg.layer.destroy());
            gameScene.player?.destroy();
        }

        // Stop any currently playing music and sounds
        this.sound.stopAll();

        // Stop all scenes and restart the menu
        this.scene.stop('GameOverScene');
        this.scene.stop(sceneName);
        this.scene.stop('CharacterSelectScene'); // Also stop character select scene if it exists
        
        // Start fresh menu scene
        this.scene.start('StartMenuScene');
    }
} 