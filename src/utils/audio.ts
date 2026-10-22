/**
 * Sound & Haptic Feedback Utility
 * Uses Web Audio API for synthetic, zero-network sound generation
 * and Navigator Vibration API for physical touch feedback.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private hapticsEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
    if (typeof window !== 'undefined') {
      const storedSound = localStorage.getItem('habitpulse_sound');
      const storedHaptics = localStorage.getItem('habitpulse_haptics');
      if (storedSound !== null) this.soundEnabled = storedSound === 'true';
      if (storedHaptics !== null) this.hapticsEnabled = storedHaptics === 'true';
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem('habitpulse_sound', String(enabled));
  }

  setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
    localStorage.setItem('habitpulse_haptics', String(enabled));
  }

  getSettings() {
    return {
      sound: this.soundEnabled,
      haptics: this.hapticsEnabled,
    };
  }

  vibrate(pattern: number | number[] = 15) {
    if (!this.hapticsEnabled) return;
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently catch if unsupported/blocked
      }
    }
  }

  // Gentle soft click for buttons & tabs
  tap() {
    this.vibrate(10);
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // AudioContext policy safe catch
    }
  }

  // Crisp checkmark chime when a habit is completed
  completeHabit() {
    this.vibrate([18, 40, 24]);
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.07); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.14); // G5

      osc2.frequency.setValueAtTime(1046.5, now + 0.14); // C6

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.14);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // Ignored
    }
  }

  // Grand celebration fanfare when completing end-of-day review or 100% of habits
  celebrate() {
    this.vibrate([30, 50, 40, 50, 60]);
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.09, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch {
      // Ignored
    }
  }
}

export const sound = new SoundEffects();
