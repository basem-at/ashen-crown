import { TrackId } from '../types';

type Wave = OscillatorType;

interface Channel {
  wave: Wave;
  vol: number;
  steps: (number | null)[];
}

interface Track {
  bpm: number;
  channels: Channel[];
  kick: boolean[];
  hat: boolean[];
  snare: boolean[];
}

const SEMI: Record<string, number> = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

function noteToMidi(name: string): number {
  const m = /^([A-G][#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error('bad note ' + name);
  const oct = parseInt(m[2], 10);
  return (oct + 1) * 12 + SEMI[m[1]];
}

function seq(...bars: string[]): (number | null)[] {
  const out: (number | null)[] = [];
  for (const bar of bars) {
    for (const tok of bar.trim().split(/\s+/)) {
      if (tok === '-') out.push(null);
      else if (tok.endsWith(':hold')) out.push(null);
      else if (tok.includes(':')) {
        const [n] = tok.split(':');
        out.push(noteToMidi(n));
      } else out.push(noteToMidi(tok));
    }
  }
  return out;
}

function ch(wave: Wave, vol: number, ...bars: string[]): Channel {
  return { wave, vol, steps: seq(...bars) };
}

function drumPattern(len: number, steps: number[]): boolean[] {
  const p = new Array<boolean>(len).fill(false);
  for (const s of steps) p[s % len] = true;
  return p;
}

const BAR = 16;

function makeTrack(bpm: number, channels: Channel[], kickSteps: number[], hatSteps: number[], snareSteps: number[]): Track {
  const len = channels[0].steps.length;
  return { bpm, channels, kick: drumPattern(len, kickSteps), hat: drumPattern(len, hatSteps), snare: drumPattern(len, snareSteps) };
}

const TRACKS: Record<Exclude<TrackId, 'none'>, Track> = {
  title: makeTrack(
    92,
    [
      ch('square', 0.09,
        'A3 - C4 - E4 - - A4 - - - G4 - E4 - -',
        'F4 - D4 - F4 - - A4 - - - G4 - - -',
        'E4 - C4 - E4 - G4 - A4 - - - - - - -',
        'G3 - B3 - D4 - G4 - - E4 - C4 - D4 - -'),
      ch('triangle', 0.16,
        'A2 A2 A2 A2 A2 A2 A2 A2 - - - - - - - -',
        'F2 F2 F2 F2 F2 F2 F2 F2 - - - - - - - -',
        'C3 C3 C3 C3 C3 C3 C3 C3 - - - - - - - -',
        'G2 G2 G2 G2 G2 G2 G2 G2 - - - - - - - -'),
      ch('square', 0.04,
        'E5 - - A4 - - C5 - - E5 - - A5 - - C6 -',
        'F5 - - A4 - - D5 - - F5 - - A5 - - D6 -',
        'C5 - - G4 - - E5 - - G5 - - C6 - - E6 -',
        'D5 - - G4 - - B4 - - D5 - - G5 - - B5 -')
    ],
    [0, 8],
    [2, 6, 10, 14],
    [4, 12]
  ),
  hub: makeTrack(
    118,
    [
      ch('square', 0.09,
        'E5 - G5 - A5 - G5 - E5 - D5 - E5 - - - -',
        'C5 - D5 - E5 - D5 - C5 - A4 - - - - -',
        'D5 - E5 - F5 - E5 - D5 - C5 - D5 - - - -',
        'E5 - - - D5 - C5 - D5 - E5 - - - - -'),
      ch('triangle', 0.15,
        'C3 C3 E3 E3 G3 G3 C3 C3 C3 C3 E3 E3 G3 G3 C3 C3',
        'A2 A2 C3 C3 E3 E3 A2 A2 A2 A2 C3 C3 E3 E3 A2 A2',
        'F2 F2 A2 A2 C3 C3 F2 F2 G2 G2 B2 B2 D3 D3 G2 G2',
        'C3 C3 E3 E3 G3 G3 C3 C3 G2 G2 D3 D3 E3 E3 C3 C3'),
      ch('square', 0.035,
        'G4 C5 E5 G5 G4 C5 E5 G5 A4 C5 E5 A5 A4 C5 E5 A5',
        'A4 C5 E5 A5 A4 C5 E5 A5 G4 B4 D5 G5 G4 B4 D5 G5',
        'A4 C5 F5 A5 A4 C5 F5 A5 G4 B4 D5 G5 G4 B4 D5 G5',
        'G4 C5 E5 G5 G4 C5 E5 G5 E4 G4 C5 E5 E4 G4 C5 E5')
    ],
    [0, 4, 8, 12],
    [2, 6, 10, 14],
    [4, 12]
  ),
  overworld: makeTrack(
    108,
    [
      ch('square', 0.08,
        'D4 - F4 - A4 - - G4 - F4 - E4 - D4 - - -',
        'C4 - E4 - G4 - - A4 - G4 - E4 - D4 - - -',
        'F4 - A4 - C5 - - B4 - A4 - G4 - F4 - - -',
        'E4 - G4 - B4 - - A4 - - - G4 - E4 - D4 -'),
      ch('triangle', 0.14,
        'D3 D3 D3 D3 G3 G3 G3 G3 D3 D3 D3 D3 G3 G3 G3 G3',
        'A2 A2 A2 A2 C3 C3 C3 C3 A2 A2 A2 A2 C3 C3 C3 C3',
        'D3 D3 D3 D3 F3 F3 F3 F3 D3 D3 D3 D3 F3 F3 F3 F3',
        'C3 C3 C3 C3 E3 E3 E3 E3 G3 G3 G3 G3 E3 E3 E3 E3')
    ],
    [0, 8],
    [4, 12],
    []
  ),
  dungeon: makeTrack(
    80,
    [
      ch('sawtooth', 0.07,
        'A2 - - - - - - - - - - - - - - -',
        '- - - - E3 - - - - - - G3 - - -',
        'F2 - - - - - - - - - - - - - - -',
        '- - - - D3 - - - B2 - - - - - - -'),
      ch('triangle', 0.18,
        'A1 A1 A1 A1 A1 A1 A1 A1 - - - - - - - -',
        'A1 A1 A1 A1 - - - - E1 E1 E1 E1 - - - -',
        'F1 F1 F1 F1 F1 F1 F1 F1 - - - - - - - -',
        'G1 G1 G1 G1 - - - - G1 G1 G1 G1 - - - -'),
      ch('square', 0.03,
        'A4 - - - E5 - - - G5 - - - - B5 - -',
        '- - - - - - - - - - - - - - - -',
        'A4 - - - F5 - - - A5 - - - - C6 - -',
        '- - - - - - - - - - - - - - - -')
    ],
    [0, 10],
    [4, 12],
    [8]
  ),
  boss: makeTrack(
    132,
    [
      ch('square', 0.1,
        'A4 A4 - C5 - A4 - G4 - A4 - - E4 - G4 - -',
        'F4 F4 - A4 - F4 - E4 - F4 - - D4 - E4 - -',
        'G4 G4 - B4 - G4 - F4 - G4 - - E4 - F4 - -',
        'A4 - - - A4 - - - G4 - A4 - C5 - D5 -'),
      ch('sawtooth', 0.12,
        'A2 - A2 - C3 - A2 - G2 - A2 - E2 - G2 -',
        'F2 - F2 - A2 - F2 - E2 - F2 - D2 - F2 -',
        'G2 - G2 - B2 - G2 - F2 - G2 - E2 - G2 -',
        'A2 A2 A2 A2 - - - - E2 E2 E2 E2 - - - -'),
      ch('square', 0.04,
        'A5 - - C6 - - A5 - - G5 - - A5 - -',
        'F5 - - A5 - - F5 - - E5 - - F5 - -',
        'G5 - - B5 - - G5 - - F5 - - G5 - -',
        'A5 - - - - - - - - - - - - - - -')
    ],
    [0, 4, 8, 12],
    [2, 4, 6, 10, 14],
    [4, 12]
  ),
  ending: makeTrack(
    76,
    [
      ch('triangle', 0.1,
        'C4 - E4 - G4 - A4 - - G4 - E4 - D4 - -',
        'E4 - G4 - B4 - D5 - B4 - G4 - E4 - C4 -'),
      ch('square', 0.05,
        'C5 - - E5 - - G5 - - A5 - - G5 - -',
        'D5 - - F5 - - A5 - - G5 - - B5 - -'),
      ch('triangle', 0.16,
        'C3 C3 C3 C3 C3 C3 C3 C3 - - - - - - - -',
        'G2 G2 G2 G2 - - - - C3 C3 C3 C3 - - - -')
    ],
    [0],
    [8],
    []
  )
};

export type SfxName =
  | 'swing' | 'hit' | 'crit' | 'hurt' | 'coin' | 'xp' | 'pickup' | 'potion' | 'door'
  | 'select' | 'cursor' | 'text' | 'dash' | 'charge' | 'release' | 'boom' | 'chest'
  | 'levelup' | 'quest' | 'gate' | 'error' | 'smash' | 'heal' | 'save' | 'block' | 'roar' | 'step';

export class Chiptune {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  muted = false;
  private current: TrackId = 'none';
  private track: Track | null = null;
  private stepIdx = 0;
  private nextTime = 0;
  private timer: number | null = null;

  constructor() {
    try {
      this.muted = localStorage.getItem('ashen_crown_muted') === '1';
    } catch {
      this.muted = false;
    }
  }

  ensure(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.6;
    this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.9;
    this.sfxGain.connect(this.master);
    const len = this.ctx.sampleRate * 1;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  setMuted(m: boolean): void {
    this.muted = m;
    try {
      localStorage.setItem('ashen_crown_muted', m ? '1' : '0');
    } catch { /* ignore */ }
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.02);
  }

  playMusic(id: TrackId): void {
    if (id === 'none') {
      this.stopMusic();
      return;
    }
    if (this.current === id && this.track) return;
    this.current = id;
    this.track = TRACKS[id];
    this.stepIdx = 0;
    if (this.ctx) this.nextTime = this.ctx.currentTime + 0.06;
    if (this.timer === null) {
      this.timer = window.setInterval(() => this.schedule(), 40);
    }
  }

  stopMusic(): void {
    this.current = 'none';
    this.track = null;
  }

  private schedule(): void {
    if (!this.ctx || !this.track || !this.musicGain) return;
    const stepDur = 60 / this.track.bpm / 4;
    while (this.nextTime < this.ctx.currentTime + 0.15) {
      this.playStep(this.stepIdx, this.nextTime, stepDur);
      this.stepIdx = (this.stepIdx + 1) % this.track.channels[0].steps.length;
      this.nextTime += stepDur;
    }
  }

  private playStep(idx: number, t: number, stepDur: number): void {
    if (!this.ctx || !this.track || !this.musicGain) return;
    for (const c of this.track.channels) {
      const note = c.steps[idx % c.steps.length];
      if (note === null || note === undefined) continue;
      const f = 440 * Math.pow(2, (note - 69) / 12);
      const osc = this.ctx.createOscillator();
      osc.type = c.wave;
      osc.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(c.vol, t + 0.008);
      g.gain.setValueAtTime(c.vol, t + stepDur * 0.7);
      g.gain.linearRampToValueAtTime(0.0001, t + stepDur * 0.95);
      osc.connect(g).connect(this.musicGain);
      osc.start(t);
      osc.stop(t + stepDur);
    }
    const drum = (freq: number, dur: number, vol: number, type: BiquadFilterType, q = 1) => {
      if (!this.ctx || !this.noiseBuf || !this.musicGain) return;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const f = this.ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f).connect(g).connect(this.musicGain);
      src.start(t);
      src.stop(t + dur);
    };
    if (this.track.kick[idx % this.track.kick.length]) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      osc.connect(g).connect(this.musicGain);
      osc.start(t);
      osc.stop(t + 0.15);
    }
    if (this.track.hat[idx % this.track.hat.length]) drum(8000, 0.04, 0.08, 'highpass');
    if (this.track.snare[idx % this.track.snare.length]) drum(1800, 0.09, 0.16, 'bandpass', 0.8);
  }

  private tone(o: { f0: number; f1?: number; dur: number; wave?: Wave; vol?: number; delay?: number; dest?: GainNode }): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + (o.delay ?? 0);
    const osc = this.ctx.createOscillator();
    osc.type = o.wave ?? 'square';
    osc.frequency.setValueAtTime(o.f0, t);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f1), t + o.dur);
    const g = this.ctx.createGain();
    const v = o.vol ?? 0.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(g).connect(o.dest ?? this.sfxGain ?? this.ctx.destination);
    osc.start(t);
    osc.stop(t + o.dur + 0.02);
  }

  private noise(o: { dur: number; vol?: number; f0?: number; f1?: number; type?: BiquadFilterType; delay?: number }): void {
    if (!this.ctx || !this.noiseBuf) return;
    const t = this.ctx.currentTime + (o.delay ?? 0);
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = o.type ?? 'bandpass';
    f.frequency.setValueAtTime(o.f0 ?? 1000, t);
    if (o.f1) f.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), t + o.dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(o.vol ?? 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f).connect(g).connect(this.sfxGain ?? this.ctx.destination);
    src.start(t);
    src.stop(t + o.dur + 0.02);
  }

  sfx(name: SfxName): void {
    if (!this.ctx || this.muted) return;
    switch (name) {
      case 'swing': this.noise({ dur: 0.12, vol: 0.12, f0: 2400, f1: 500 }); break;
      case 'hit': this.tone({ f0: 220, f1: 90, dur: 0.09, vol: 0.25 }); this.noise({ dur: 0.06, vol: 0.15, f0: 3000, type: 'highpass' }); break;
      case 'crit': this.tone({ f0: 660, f1: 1320, dur: 0.14, vol: 0.28 }); this.tone({ f0: 990, f1: 1980, dur: 0.16, vol: 0.2, delay: 0.04 }); this.noise({ dur: 0.12, vol: 0.2, f0: 5000, type: 'highpass' }); break;
      case 'hurt': this.tone({ f0: 300, f1: 80, dur: 0.22, wave: 'sawtooth', vol: 0.3 }); break;
      case 'coin': this.tone({ f0: 988, dur: 0.07, vol: 0.18 }); this.tone({ f0: 1319, dur: 0.16, vol: 0.18, delay: 0.07 }); break;
      case 'xp': this.tone({ f0: 660, dur: 0.06, vol: 0.12 }); this.tone({ f0: 880, dur: 0.08, vol: 0.12, delay: 0.05 }); break;
      case 'pickup': this.tone({ f0: 523, f1: 784, dur: 0.1, vol: 0.18 }); break;
      case 'potion': this.tone({ f0: 392, f1: 784, dur: 0.2, wave: 'sine', vol: 0.22 }); this.tone({ f0: 784, f1: 1046, dur: 0.18, wave: 'sine', vol: 0.14, delay: 0.1 }); break;
      case 'door': this.noise({ dur: 0.25, vol: 0.2, f0: 300, f1: 120, type: 'lowpass' }); this.tone({ f0: 90, f1: 60, dur: 0.2, vol: 0.15 }); break;
      case 'select': this.tone({ f0: 880, dur: 0.06, vol: 0.16 }); this.tone({ f0: 1174, dur: 0.08, vol: 0.14, delay: 0.05 }); break;
      case 'cursor': this.tone({ f0: 660, dur: 0.045, vol: 0.14 }); break;
      case 'text': this.tone({ f0: 1046, dur: 0.02, vol: 0.07 }); break;
      case 'dash': this.noise({ dur: 0.16, vol: 0.18, f0: 600, f1: 3200 }); break;
      case 'charge': this.tone({ f0: 200, f1: 800, dur: 0.4, wave: 'sawtooth', vol: 0.12 }); break;
      case 'release': this.tone({ f0: 800, f1: 200, dur: 0.2, vol: 0.22 }); this.noise({ dur: 0.18, vol: 0.18, f0: 1200, f1: 300 }); break;
      case 'boom': this.noise({ dur: 0.6, vol: 0.35, f0: 400, f1: 60, type: 'lowpass' }); this.tone({ f0: 120, f1: 30, dur: 0.5, vol: 0.3 }); break;
      case 'chest': this.tone({ f0: 523, dur: 0.08, vol: 0.18 }); this.tone({ f0: 659, dur: 0.08, vol: 0.18, delay: 0.08 }); this.tone({ f0: 784, dur: 0.14, vol: 0.2, delay: 0.16 }); break;
      case 'levelup': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone({ f0: f, dur: 0.12, vol: 0.18, delay: i * 0.07 })); break;
      case 'quest': [784, 988, 1175].forEach((f, i) => this.tone({ f0: f, dur: 0.1, vol: 0.16, delay: i * 0.08 })); break;
      case 'gate': this.tone({ f0: 110, f1: 55, dur: 0.5, wave: 'sawtooth', vol: 0.25 }); this.noise({ dur: 0.4, vol: 0.15, f0: 200, f1: 80, type: 'lowpass' }); break;
      case 'error': this.tone({ f0: 220, f1: 180, dur: 0.15, wave: 'sawtooth', vol: 0.16 }); break;
      case 'smash': this.noise({ dur: 0.2, vol: 0.3, f0: 2000, f1: 300 }); this.tone({ f0: 180, f1: 60, dur: 0.15, vol: 0.2 }); break;
      case 'heal': [392, 523, 659].forEach((f, i) => this.tone({ f0: f, dur: 0.15, wave: 'sine', vol: 0.15, delay: i * 0.06 })); break;
      case 'save': [659, 784, 988, 1319].forEach((f, i) => this.tone({ f0: f, dur: 0.1, vol: 0.15, delay: i * 0.06 })); break;
      case 'block': this.tone({ f0: 1200, f1: 900, dur: 0.07, vol: 0.2 }); this.noise({ dur: 0.05, vol: 0.12, f0: 6000, type: 'highpass' }); break;
      case 'roar': this.noise({ dur: 0.8, vol: 0.3, f0: 300, f1: 90, type: 'lowpass' }); this.tone({ f0: 150, f1: 50, dur: 0.7, wave: 'sawtooth', vol: 0.25 }); break;
      case 'step': this.noise({ dur: 0.03, vol: 0.05, f0: 900, type: 'lowpass' }); break;
    }
  }
}

export { BAR };
