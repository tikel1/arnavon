export class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super('CharacterSelectScene');
        this.selectedMode = null;
        this.basePath = import.meta.env.DEV ? '' : '/arnavon';
    }

    init(data) {
        this.selectedMode = data.mode;
    }

    preload() {
        // Load portrait images for each character
        this.load.image('pink-preview', 
            `${this.basePath}/assets/1 Pink_Monster/Pink_Monster_portrait.png`
        );
        this.load.image('owlet-preview', 
            `${this.basePath}/assets/2 Owlet_Monster/Owlet_Monster_portrait.png`
        );
        this.load.image('dude-preview', 
            `${this.basePath}/assets/3 Dude_Monster/Dude_Monster_portrait.png`
        );
    }

    create() {
        // Add background with blur effect
        const background = this.add.image(0, 0, 'menu-background');
        background.setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        background.setAlpha(0.5); // Make background more transparent

        // Add darker overlay for better contrast
        const overlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        ).setOrigin(0);

        // Add title
        const title = this.add.text(
            this.cameras.main.centerX,
            30,
            'SELECT YOUR CHARACTER',
            {
                fontSize: '24px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4,
                fontFamily: 'Arial Black'
            }
        ).setOrigin(0.5);

        // Create character options
        const characters = [
            { name: 'ארנבון', key: 'pink-preview', x: this.cameras.main.width * 0.25 },
            { name: 'שדוני', key: 'owlet-preview', x: this.cameras.main.centerX },
            { name: 'בלו', key: 'dude-preview', x: this.cameras.main.width * 0.75 }
        ];

        characters.forEach(char => {
            // Create character frame
            const frame = this.add.rectangle(
                char.x,
                160,
                120,
                140,
                0x333333,
                0.8
            ).setOrigin(0.5);

            // Add frame border
            const frameBorder = this.add.rectangle(
                char.x,
                160,
                120,
                140,
                0xFFFFFF,
                1
            ).setOrigin(0.5);
            frameBorder.setStrokeStyle(2, 0xFFFFFF);

            // Character portrait with frame
            const preview = this.add.image(char.x, 160, char.key)
                .setScale(1.5)
                .setInteractive();

            // Character name background
            const nameBackground = this.add.rectangle(
                char.x,
                220,
                110,
                30,  // Slightly taller to accommodate Hebrew text
                0x000000,
                0.6
            ).setOrigin(0.5);

            // Character name
            const nameText = this.add.text(char.x, 220, char.name, {
                fontSize: '20px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 2,
                fontFamily: 'Handjet',
                rtl: true  // Right-to-left for Hebrew text
            }).setOrigin(0.5);

            // Add hover effects
            preview.on('pointerover', () => {
                frame.setStrokeStyle(2, 0xffff00);
                frameBorder.setStrokeStyle(2, 0xffff00);
                nameText.setStyle({ fill: '#ffff00' });
            });

            preview.on('pointerout', () => {
                frame.setStrokeStyle(2, 0xFFFFFF);
                frameBorder.setStrokeStyle(2, 0xFFFFFF);
                nameText.setStyle({ fill: '#fff' });
            });

            // Add click handler
            preview.on('pointerdown', () => {
                this.startGame(char.name.split(' ')[0].toLowerCase());
            });
        });
    }

    startGame(character) {
        const characterMap = {
            'ארנבון': 'pink',
            'שדוני': 'owlet',
            'בלו': 'dude'
        };
        
        this.scene.start(this.selectedMode, { 
            character: characterMap[character],
            gameMode: this.selectedMode === 'SimpleMode' ? 'simple' : 'math'
        });
    }
} 