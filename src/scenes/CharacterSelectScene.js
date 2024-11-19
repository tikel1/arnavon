export class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super('CharacterSelectScene');
        this.selectedMode = null;
        this.selectedCharacter = 0;
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
        this.load.image('name-banner', 
            `${this.basePath}/assets/Menu/UI_Flat_Banner01a.png`
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
            'בחר/י דמות',
            {
                fontSize: '24px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4,
                fontFamily: 'Rubik',
                fontWeight: '500',
                rtl: true
            }
        ).setOrigin(0.5);

        // Create character options
        const characters = [
            { name: 'ארנבון', key: 'pink-preview', x: this.cameras.main.width * 0.25 },
            { name: 'שדוני', key: 'owlet-preview', x: this.cameras.main.centerX },
            { name: 'בלו', key: 'dude-preview', x: this.cameras.main.width * 0.75 }
        ];

        const characterFrames = [];
        const characterPreviews = [];
        const characterNames = [];

        characters.forEach((char, index) => {
            // Create character frame (dark background only)
            const frame = this.add.rectangle(
                char.x,
                160,
                120,
                140,
                0x333333,
                0.8
            ).setOrigin(0.5);

            // Character portrait with larger initial scale
            const preview = this.add.image(char.x, 160, char.key)
                .setScale(0.16)
                .setInteractive();

            // Character name background
            const nameBackground = this.add.image(
                char.x,
                222,
                'name-banner'
            )
            .setOrigin(0.5)
            .setScale(2, 1.5);

            // Character name
            const nameText = this.add.text(char.x, 225, char.name, {
                fontSize: '20px',
                fill: '#000000',
                stroke: '#000',
                strokeThickness: 0,
                fontFamily: 'Rubik',
                fontWeight: '700',
                rtl: true
            })
            .setOrigin(0.5)
            .setShadow(0, 2, '#ffc579', 0, true, true);

            characterFrames.push({ frame });  // Now only storing the dark background frame
            characterPreviews.push(preview);
            characterNames.push(nameText);
        });

        // Add floating animation to all characters
        characterPreviews.forEach(preview => {
            this.tweens.add({
                targets: preview,
                y: '+=4',  // Float up and down 4 pixels
                duration: 1500,
                yoyo: true,
                repeat: -1,  // Infinite repeat
                ease: 'Sine.easeInOut'
            });
        });

        // Add keyboard controls
        this.input.keyboard.on('keydown-LEFT', () => {
            this.selectedCharacter = (this.selectedCharacter > 0) ? this.selectedCharacter - 1 : characters.length - 1;
            this.updateCharacterStyles(characterFrames, characterNames);
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            this.selectedCharacter = (this.selectedCharacter < characters.length - 1) ? this.selectedCharacter + 1 : 0;
            this.updateCharacterStyles(characterFrames, characterNames);
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.startGame(characters[this.selectedCharacter].name);
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            this.startGame(characters[this.selectedCharacter].name);
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('StartMenuScene');
        });

        // Update the updateCharacterStyles function
        this.updateCharacterStyles = (frames, names) => {
            frames.forEach((frame, index) => {
                const preview = characterPreviews[index];
                
                if (index === this.selectedCharacter) {
                    frame.frame.setStrokeStyle(2, 0x267ae9);
                    names[index].setStyle({ 
                        fill: '#267ae9',
                        fontFamily: 'Rubik',
                        fontWeight: '500',
                        rtl: true
                    });
                    
                    // Zoom in animation for selected character
                    this.tweens.add({
                        targets: preview,
                        scaleX: 0.18,
                        scaleY: 0.18,
                        duration: 200,
                        ease: 'Sine.easeOut'
                    });
                } else {
                    frame.frame.setStrokeStyle(2, 0x000000);
                    names[index].setStyle({ 
                        fill: '#000000',
                        fontFamily: 'Rubik',
                        fontWeight: '500',
                        rtl: true
                    });
                    
                    // Reset scale for unselected characters
                    this.tweens.add({
                        targets: preview,
                        scaleX: 0.16,
                        scaleY: 0.16,
                        duration: 200,
                        ease: 'Sine.easeOut'
                    });
                }
            });
        };

        // Initial character styles
        this.updateCharacterStyles(characterFrames, characterNames);
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