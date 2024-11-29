export class SoundManager {
    static instance = null;

    constructor() {
        if (SoundManager.instance) {
            return SoundManager.instance;
        }
        SoundManager.instance = this;
        this.isSoundOn = localStorage.getItem('arnavonSoundEnabled') === 'true';
    }

    toggleSound() {
        this.isSoundOn = !this.isSoundOn;
        localStorage.setItem('arnavonSoundEnabled', this.isSoundOn);
        return this.isSoundOn;
    }

    isSoundEnabled() {
        return this.isSoundOn;
    }

    playSound(sound) {
        if (this.isSoundOn) {
            sound.play();
        }
    }

    stopSound(sound) {
        sound.stop();
    }
}

// Create a singleton instance
export const soundManager = new SoundManager(); 