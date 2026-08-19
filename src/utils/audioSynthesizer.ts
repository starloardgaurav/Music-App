/**
 * Web Audio Synthesizer fallback
 * Ensures reliable melodic sound playback even if external CDN audio fails,
 * is offline, or is blocked by browser network policies.
 */

class MusicAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isSynthesizing = false;
  private currentGenre = 'Synthwave';
  private timer: number | null = null;
  private step = 0;
  private analyser: AnalyserNode | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    } catch {
      // Audio context might need user gesture
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public start(genre = 'Synthwave') {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.currentGenre = genre;
    this.isSynthesizing = true;
    this.step = 0;

    if (this.timer) {
      clearInterval(this.timer);
    }

    const interval = genre.includes('Lo-Fi') ? 350 : 250;
    this.timer = window.setInterval(() => {
      this.playPatternStep();
    }, interval);
  }

  public stop() {
    this.isSynthesizing = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume * 0.4)), this.ctx.currentTime);
    }
  }

  private playPatternStep() {
    if (!this.ctx || !this.masterGain || !this.isSynthesizing) return;
    const now = this.ctx.currentTime;

    // Chords and bassline frequencies
    const synthChords = [
      [220, 261.63, 329.63, 392], // Am7
      [174.61, 220, 261.63, 329.63], // Fmaj7
      [261.63, 329.63, 392, 493.88], // Cmaj7
      [196, 246.94, 293.66, 349.23], // G7
    ];

    const chordIndex = Math.floor(this.step / 8) % synthChords.length;
    const currentChord = synthChords[chordIndex];

    // Kick / Bass pulse on every 4th step
    if (this.step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.22);
    }

    // Melodic arpeggio note
    const noteFreq = currentChord[this.step % currentChord.length];
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = this.currentGenre.includes('Synthwave') ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(noteFreq, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.36);

    this.step++;
  }
}

export const audioSynthesizer = new MusicAudioSynthesizer();
