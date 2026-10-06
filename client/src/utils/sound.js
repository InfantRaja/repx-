// Audio Synthesizer using Web Audio API (Zero external assets required)
class SoundFx {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playBeep(freq = 600, duration = 0.15, type = 'sine') {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay blocked or unsupported, fail silently
    }
  }

  // Set completed chime
  playSetComplete() {
    this.playBeep(880, 0.1, 'sine');
    setTimeout(() => this.playBeep(1174, 0.25, 'sine'), 100);
  }

  // Rest timer countdown ticks
  playCountdownTick() {
    this.playBeep(440, 0.08, 'triangle');
  }

  // Rest timer finished horn
  playRestComplete() {
    this.playBeep(659, 0.15, 'sine');
    setTimeout(() => this.playBeep(880, 0.15, 'sine'), 150);
    setTimeout(() => this.playBeep(1318, 0.4, 'sine'), 300);
  }

  // PR Celebration fanfare
  playPRCelebration() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.25, 'triangle'), idx * 120);
    });
  }
}

export const sound = new SoundFx();
