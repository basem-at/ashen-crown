import { TrackId, RelicId } from '../types';
import { DestructibleKind, DropDef } from '../entities/Destructible';
import { ChestContent } from '../entities/Chest';

export interface LightDef {
  tx: number;
  ty: number;
  r: number;
  color?: string;
  flicker?: number;
  intensity?: number;
}

export interface ExitDef {
  x: number;
  y: number;
  w: number;
  h: number;
  to: string;
  spawnTx: number;
  spawnTy: number;
  requireFlag?: string;
  lockedText?: string;
}

export interface NPCDef {
  id: string;
  name: string;
  tx: number;
  ty: number;
  charId: string;
  tree: string;
  roam?: boolean;
}

export interface DestructibleDef {
  id: string;
  kind: DestructibleKind;
  tx: number;
  ty: number;
  drops?: DropDef[];
  respawn?: number;
}

export interface ChestDef {
  id: string;
  tx: number;
  ty: number;
  locked: boolean;
  contents: ChestContent[];
}

export interface DoorDef {
  id: string;
  kind: 'house' | 'gate' | 'puzzle' | 'key' | 'brazier';
  tx: number;
  ty: number;
  requireFlag?: string;
  lockedText?: string;
  questFlag?: string;
  requireItem?: string;
}

export interface EnemyDef {
  kind: string;
  tx: number;
  ty: number;
}

export interface SwitchDef {
  id: string;
  tx: number;
  ty: number;
  doorId: string;
}

export interface BlockDef {
  tx: number;
  ty: number;
}

export interface BossZoneDef {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: string;
  name: string;
  doorIds: string[];
}

export interface BrazierDef {
  id: string;
  tx: number;
  ty: number;
  roomId?: string;
}

export interface BrazierDoorDef {
  doorId: string;
  roomId: string;
}

export interface DarkRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SignDef {
  tx: number;
  ty: number;
  lines: string[];
}

export interface GameMap {
  id: string;
  name: string;
  w: number;
  h: number;
  layers: { ground: string[]; walls: string[]; decor: string[]; canopy: string[] };
  solidChars: string;
  lights: LightDef[];
  ambient: number;
  music: TrackId;
  npcs: NPCDef[];
  destructibles: DestructibleDef[];
  chests: ChestDef[];
  doors: DoorDef[];
  signs: SignDef[];
  exits: ExitDef[];
  enemies?: EnemyDef[];
  switches?: SwitchDef[];
  blocks?: BlockDef[];
  bossZone?: BossZoneDef;
  fireflies?: boolean;
  mist?: boolean;
  embers?: boolean;
  darkRects?: DarkRect[];
  braziers?: BrazierDef[];
  brazierDoors?: BrazierDoorDef[];
  spawn: { tx: number; ty: number };
  campfire: { tx: number; ty: number } | null;
}

export class LayerBuilder {
  cells: string[][];
  constructor(
    public w: number,
    public h: number,
    fill = '.'
  ) {
    this.cells = Array.from({ length: h }, () => Array(w).fill(fill));
  }

  set(x: number, y: number, ch: string): void {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cells[y][x] = ch;
  }

  get(x: number, y: number): string {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) return this.cells[y][x];
    return '.';
  }

  rect(x: number, y: number, w: number, h: number, ch: string): void {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, ch);
  }

  hline(x0: number, x1: number, y: number, ch: string): void {
    for (let i = Math.min(x0, x1); i <= Math.max(x0, x1); i++) this.set(i, y, ch);
  }

  vline(x: number, y0: number, y1: number, ch: string): void {
    for (let j = Math.min(y0, y1); j <= Math.max(y0, y1); j++) this.set(x, j, ch);
  }

  stamp(rows: string[], x: number, y: number): void {
    for (let j = 0; j < rows.length; j++) {
      for (let i = 0; i < rows[j].length; i++) {
        if (rows[j][i] !== '.') this.set(x + i, y + j, rows[j][i]);
      }
    }
  }

  toRows(): string[] {
    return this.cells.map((r) => r.join(''));
  }
}

export function buildMap(o: {
  id: string;
  name: string;
  w: number;
  h: number;
  ground: LayerBuilder;
  walls: LayerBuilder;
  decor?: LayerBuilder;
  canopy?: LayerBuilder;
  solidChars: string;
  lights?: LightDef[];
  ambient: number;
  music: TrackId;
  npcs?: NPCDef[];
  destructibles?: DestructibleDef[];
  chests?: ChestDef[];
  doors?: DoorDef[];
  signs?: SignDef[];
  exits?: ExitDef[];
  enemies?: EnemyDef[];
  switches?: SwitchDef[];
  blocks?: BlockDef[];
  bossZone?: BossZoneDef;
  fireflies?: boolean;
  mist?: boolean;
  embers?: boolean;
  darkRects?: DarkRect[];
  braziers?: BrazierDef[];
  brazierDoors?: BrazierDoorDef[];
  spawn: { tx: number; ty: number };
  campfire?: { tx: number; ty: number } | null;
}): GameMap {
  return {
    id: o.id,
    name: o.name,
    w: o.w,
    h: o.h,
    layers: {
      ground: o.ground.toRows(),
      walls: o.walls.toRows(),
      decor: (o.decor ?? new LayerBuilder(o.w, o.h)).toRows(),
      canopy: (o.canopy ?? new LayerBuilder(o.w, o.h)).toRows()
    },
    solidChars: o.solidChars,
    lights: o.lights ?? [],
    ambient: o.ambient,
    music: o.music,
    npcs: o.npcs ?? [],
    destructibles: o.destructibles ?? [],
    chests: o.chests ?? [],
    doors: o.doors ?? [],
    signs: o.signs ?? [],
    exits: o.exits ?? [],
    enemies: o.enemies ?? [],
    switches: o.switches ?? [],
    blocks: o.blocks ?? [],
    bossZone: o.bossZone,
    fireflies: o.fireflies ?? false,
    mist: o.mist ?? false,
    embers: o.embers ?? false,
    darkRects: o.darkRects ?? [],
    braziers: o.braziers ?? [],
    brazierDoors: o.brazierDoors ?? [],
    spawn: o.spawn,
    campfire: o.campfire ?? null
  };
}
