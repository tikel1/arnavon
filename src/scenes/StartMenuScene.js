export class StartMenuScene extends Phaser.Scene {
    constructor() {
        super('StartMenuScene');
    }

    preload() {
        // Load menu background if not already loaded
        if (!this.textures.exists('menu-background')) {
            this.load.image('menu-background', 'assets/Menu/menu.webp');
        }
    }

    create() {
        // Add menu background
        const background = this.add.image(0, 0, 'menu-background');
        background.setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Add semi-transparent overlay for better text readability
        const overlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.3
        ).setOrigin(0);

        // Add title
        const title = this.add.text(
            this.cameras.main.centerX,
            100,
            'ARNAVON',
            {
                fontSize: '64px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 6,
                fontFamily: 'Arial Black'
            }
        ).setOrigin(0.5);

        // Create mode selection buttons
        const simpleMode = this.add.text(
            this.cameras.main.centerX,
            200,
            'Simple Mode',
            {
                fontSize: '32px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4
            }
        ).setOrigin(0.5)
        .setInteractive();

        const mathMode = this.add.text(
            this.cameras.main.centerX,
            260,
            'Math Mode',
            {
                fontSize: '32px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4
            }
        ).setOrigin(0.5)
        .setInteractive();

        // Add hover effects
        [simpleMode, mathMode].forEach(button => {
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
        simpleMode.on('pointerdown', () => {
            this.startGame('simple');
        });

        mathMode.on('pointerdown', () => {
            this.startGame('math');
        });
    }

    startGame(mode) {
        const sceneName = mode === 'simple' ? 'SimpleMode' : 'MathMode';
        this.scene.start('CharacterSelectScene', { mode: sceneName });
    }
} 