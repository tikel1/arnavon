export class SoundManager {
    static instance = null;

    constructor() {
        if (SoundManager.instance) {
            return SoundManager.instance;
        }
        SoundManager.instance = this;
        this.isSoundOn = localStorage.getItem('arnavonSoundEnabled') === 'true';
        this.currentMusic = null;
    }

    toggleSound() {
        this.isSoundOn = !this.isSoundOn;
        localStorage.setItem('arnavonSoundEnabled', this.isSoundOn);
        
        // Handle currently playing music
        if (this.currentMusic) {
            if (this.isSoundOn) {
                this.currentMusic.play();
            } else {
                this.currentMusic.stop();
            }
        }
        
        return this.isSoundOn;
    }

    playMusic(music) {
        this.currentMusic = music;
        if (this.isSoundOn) {
            music.play();
        }
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }

    playSound(sound) {
        if (this.isSoundOn && sound) {
            sound.play();
        }
    }
}

export const soundManager = new SoundManager(); 