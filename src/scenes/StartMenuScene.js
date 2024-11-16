export class StartMenuScene extends Phaser.Scene {
    constructor() {
        super('StartMenuScene');
        this.selectedButton = 0; // 0 for simple mode, 1 for math mode
    }

    preload() {
        if (!this.textures.exists('menu-background')) {
            this.load.image('menu-background', 'assets/Menu/menu.webp');
        }
    }

    create() {
        // Add menu background
        const background = this.add.image(0, 0, 'menu-background');
        background.setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Add semi-transparent overlay
        const overlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.3
        ).setOrigin(0);

        // Create mode selection buttons
        const simpleMode = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 100,
            'אימון',
            {
                fontSize: '32px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4,
                fontFamily: 'Rubik',
                fontWeight: '500',
                rtl: true
            }
        ).setOrigin(0.5)
        .setInteractive();

        const mathMode = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 40,
            'חשבון',
            {
                fontSize: '32px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4,
                fontFamily: 'Rubik',
                fontWeight: '500',
                rtl: true
            }
        ).setOrigin(0.5)
        .setInteractive();

        const buttons = [simpleMode, mathMode];

        // Add hover effects
        buttons.forEach((button, index) => {
            button.on('pointerover', () => {
                this.selectedButton = index;
                this.updateButtonStyles(buttons);
            });

            button.on('pointerdown', () => {
                this.startGame(index === 0 ? 'אימון' : 'חשבון');
            });
        });

        // Add keyboard controls
        this.input.keyboard.on('keydown-UP', () => {
            this.selectedButton = 0;
            this.updateButtonStyles(buttons);
        });

        this.input.keyboard.on('keydown-DOWN', () => {
            this.selectedButton = 1;
            this.updateButtonStyles(buttons);
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.startGame(this.selectedButton === 0 ? 'אימון' : 'חשבון');
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            this.startGame(this.selectedButton === 0 ? 'אימון' : 'חשבון');
        });

        // Initial button styles
        this.updateButtonStyles(buttons);
    }

    updateButtonStyles(buttons) {
        buttons.forEach((button, index) => {
            if (index === this.selectedButton) {
                button.setScale(1.1);
                button.setStyle({ fill: '#ffff00' });
            } else {
                button.setScale(1);
                button.setStyle({ fill: '#fff' });
            }
        });
    }

    startGame(mode) {
        const modeMap = {
            'אימון': 'simple',
            'חשבון': 'math'
        };
        const sceneName = modeMap[mode] === 'simple' ? 'SimpleMode' : 'MathMode';
        this.scene.start('CharacterSelectScene', { mode: sceneName });
    }
} 