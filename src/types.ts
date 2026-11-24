export type Dir = 'down' | 'up' | 'left' | 'right';

export const DIR_VEC: Record<Dir, { x: number; y: number }> = {
  down: { x: 0, y: 1 },
  up: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export function dirFromVec(x: number, y: number): Dir {
  if (Math.abs(x) > Math.abs(y)) return x >= 0 ? 'right' : 'left';
  return y >= 0 ? 'down' : 'up';
}

export function oppositeDir(d: Dir): Dir {
  return d === 'down' ? 'up' : d === 'up' ? 'down' : d === 'left' ? 'right' : 'left';
}

export interface Vec {
  x: number;
  y: number;
}

export const TILE = 16;
export const VIEW_W = 320;
export const VIEW_H = 180;

export type RelicId = 'windBoots' | 'emberLantern' | 'frostAegis';

export const RELIC_INFO: Record<RelicId, { name: string; desc: string; icon: string }> = {
  windBoots: { name: 'Wind Boots', desc: 'Dash with i-frames (K / Space)', icon: 'relicBoots' },
  emberLantern: { name: 'Ember Lantern', desc: 'Light the dark, burn webs, light braziers', icon: 'relicLantern' },
  frostAegis: { name: 'Frost Aegis', desc: 'Block & reflect projectiles (hold attack-block)', icon: 'relicAegis' }
};

export type Element = 'none' | 'fire' | 'frost' | 'void' | 'nature';

export type ItemId =
  | 'potion'
  | 'ether'
  | 'moonherb'
  | 'rustyKey'
  | 'dungeonKey'
  | 'mapPage'
  | 'bossShard';

export type WeaponId = 'rusty' | 'iron' | 'steel' | 'ember' | 'crownblade';
export type ArmorId = 'cloth' | 'leather' | 'ironmail' | 'embermail' | 'crownplate';

export type TrackId = 'title' | 'hub' | 'overworld' | 'dungeon' | 'boss' | 'ending' | 'none';

export type GameMode =
  | 'title'
  | 'slots'
  | 'play'
  | 'dialogue'
  | 'shop'
  | 'pause'
  | 'levelup'
  | 'gameover'
  | 'ending'
  | 'save'
  | 'sign';

export function clamp(v: number, a: number, b: number): number {
  return v < a ? a : v > b ? b : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function dist2(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export class RNG {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0 || 1;
  }
  next(): number {
    this.s = (this.s * 1664525 + 1013904223) >>> 0;
    return this.s / 4294967296;
  }
  range(a: number, b: number): number {
    return a + this.next() * (b - a);
  }
  int(a: number, b: number): number {
    return Math.floor(this.range(a, b + 1));
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
}
