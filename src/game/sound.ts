/**
 * Lightweight sound engine built on the Web Audio API.
 * No external audio files — all tones are synthesized in-browser.
 */

type SoundName = 'click' | 'move' | 'invalid' | 'win' | 'lose';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  setEnabled(v: boolean) {
    this.enabled = v;
  }

  isEnabled() {
    return this.enabled;
  }

  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  /** Call from a user gesture to unlock audio on mobile Safari. */
  unlock() {
    this.ensureCtx();
  }

  play(name: SoundName) {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    switch (name) {
      case 'click':
        this.tone(ctx, now, 660, 0.05, 0.12, 'sine', 0.06);
        break;
      case 'move':
        this.tone(ctx, now, 523.25, 0.12, 0.18, 'triangle', 0.09);
        this.tone(ctx, now + 0.06, 783.99, 0.12, 0.18, 'triangle', 0.07);
        break;
      case 'invalid':
        this.tone(ctx, now, 220, 0.18, 0.2, 'sawtooth', 0.08);
        this.tone(ctx, now + 0.12, 180, 0.18, 0.2, 'sawtooth', 0.06);
        break;
      case 'win': {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((f, i) =>
          this.tone(ctx, now + i * 0.12, f, 0.18, 0.25, 'triangle', 0.11),
        );
        break;
      }
      case 'lose': {
        const notes = [392, 349.23, 311.13, 261.63];
        notes.forEach((f, i) =>
          this.tone(ctx, now + i * 0.16, f, 0.22, 0.3, 'sine', 0.1),
        );
        break;
      }
    }
  }

  private tone(
    ctx: AudioContext,
    start: number,
    freq: number,
    attack: number,
    decay: number,
    type: OscillatorType,
    gain: number,
  ) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + attack + decay + 0.02);
  }
}

let engine: SoundEngine | null = null;

export function getSoundEngine(): SoundEngine {
  if (!engine) engine = new SoundEngine();
  return engine;
}
