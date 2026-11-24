import { LayerBuilder, GameMap, buildMap, LightDef } from './MapData';
import { RNG } from '../types';

export const WASTES_W = 96;
export const WASTES_H = 72;

const PATH: [number, number][] = [
  [92, 18], [84, 18], [76, 18], [70, 18], [70, 26], [70, 30], [62, 30], [54, 30], [50, 30],
  [50, 38], [50, 44], [42, 44], [34, 44], [30, 44], [30, 50], [30, 54], [22, 54], [14, 54], [8, 54]
];

function nearPath(x: number, y: number, r: number): boolean {
  for (const [px, py] of PATH) if (Math.abs(x - px) <= r && Math.abs(y - py) <= r) return true;
  return false;
}

export function wastes(): GameMap {
  const ground = new LayerBuilder(WASTES_W, WASTES_H, 'A');
  const walls = new LayerBuilder(WASTES_W, WASTES_H, '.');
  const decor = new LayerBuilder(WASTES_W, WASTES_H, '.');
  const canopy = new LayerBuilder(WASTES_W, WASTES_H, '.');
  const rng = new RNG(991123);

  for (let i = 0; i < 30; i++) {
    const cx = rng.int(6, WASTES_W - 8);
    const cy = rng.int(6, WASTES_H - 8);
    const r = rng.int(2, 5);
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        if (Math.hypot(x - cx, y - cy) <= r && !nearPath(x, y, 2)) ground.set(x, y, 'M');
      }
    }
  }
  for (let i = 0; i < 120; i++) {
    const x = rng.int(2, WASTES_W - 3);
    const y = rng.int(2, WASTES_H - 3);
    if (ground.get(x, y) === 'A' && rng.chance(0.3)) ground.set(x, y, 'O');
  }

  for (let i = 0; i < PATH.length - 1; i++) {
    const [x0, y0] = PATH[i];
    const [x1, y1] = PATH[i + 1];
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(x0 + ((x1 - x0) * s) / steps);
      const y = Math.round(y0 + ((y1 - y0) * s) / steps);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const gx = x + dx;
          const gy = y + dy;
          if (ground.get(gx, gy) === 'M') ground.set(gx, gy, 'b');
          else if (ground.get(gx, gy) !== 'b') ground.set(gx, gy, 'A');
        }
      }
    }
  }

  const features: [number, number][] = [
    [90, 17], [8, 52], [40, 12], [60, 48], [24, 40],
    [78, 22], [66, 34], [54, 26], [46, 40], [38, 50], [26, 48], [16, 58], [86, 40], [58, 12], [34, 20]
  ];
  const isFeature = (x: number, y: number) => features.some(([fx, fy]) => Math.abs(x - fx) <= 2 && Math.abs(y - fy) <= 2);

  for (let y = 0; y < WASTES_H; y++) {
    for (let x = 0; x < WASTES_W; x++) {
      const border = x < 2 || y < 2 || x >= WASTES_W - 2 || y >= WASTES_H - 2;
      const gateGap = x >= 94 && y >= 17 && y <= 19;
      const foundryGap = x <= 6 && y >= 52 && y <= 55;
      if (gateGap || foundryGap) continue;
      if (border) {
        if (rng.chance(0.75)) {
          walls.set(x, y, rng.chance(0.5) ? 'r' : 'U');
          if (rng.chance(0.4)) canopy.set(x, y, 'V');
        } else if (rng.chance(0.4)) ground.set(x, y, 'M');
        continue;
      }
      if (nearPath(x, y, 2)) continue;
      if (isFeature(x, y)) continue;
      if (ground.get(x, y) === 'M') continue;
      if (rng.chance(0.22)) {
        walls.set(x, y, rng.chance(0.6) ? 'U' : 'r');
        if (rng.chance(0.5)) canopy.set(x, y, 'V');
      } else if (rng.chance(0.08)) {
        decor.set(x, y, rng.pick(['e', 't']));
      }
    }
  }

  ground.rect(5, 53, 4, 3, 's');
  walls.set(4, 53, 'r');
  walls.set(9, 53, 'r');
  walls.set(4, 55, 'r');
  walls.set(9, 55, 'r');
  walls.set(5, 56, 'r');
  walls.set(6, 56, 'r');
  walls.set(7, 56, 'r');
  walls.set(8, 56, 'r');

  const lavaLights: LightDef[] = [];
  for (let i = 0; i < 14; i++) {
    const x = rng.int(3, WASTES_W - 4);
    const y = rng.int(3, WASTES_H - 4);
    if (ground.get(x, y) === 'M' && !nearPath(x, y, 1)) {
      lavaLights.push({ tx: x, ty: y, r: 40, color: '#ff6a2e', flicker: 0.2, intensity: 0.55 });
      i += 0;
    }
  }
  lavaLights.push({ tx: 92, ty: 18, r: 36, color: '#ffd76a', flicker: 0.15 });
  lavaLights.push({ tx: 7, ty: 54, r: 32, color: '#ff5a1e', intensity: 0.7 });

  return buildMap({
    id: 'biome_wastes',
    name: 'Scorched Wastes',
    w: WASTES_W,
    h: WASTES_H,
    ground,
    walls,
    decor,
    canopy,
    solidChars: 'TUVrFM',
    lights: lavaLights,
    ambient: 0.38,
    music: 'overworld',
    embers: true,
    spawn: { tx: 92, ty: 18 },
    signs: [
      { tx: 90, ty: 17, lines: ['SCORCHED WASTES', 'Ash and fire. The Obsidian Foundry lies west-south.', 'Do not touch the lava. It touches back.'] },
      { tx: 10, ty: 51, lines: ['THE OBSIDIAN FOUNDRY', 'Ignis hammers the Frost Aegis into shape below.'] }
    ],
    exits: [
      { x: WASTES_W * 16 - 6, y: 17 * 16, w: 12, h: 3 * 16, to: 'hub', spawnTx: 2, spawnTy: 18 },
      { x: 5 * 16, y: 53 * 16, w: 4 * 16, h: 3 * 16, to: 'foundry', spawnTx: 12, spawnTy: 10 }
    ],
    enemies: [
      { kind: 'magmaGolem', tx: 78, ty: 22 },
      { kind: 'cinderArcher', tx: 72, ty: 34 },
      { kind: 'fireBat', tx: 64, ty: 24 },
      { kind: 'cinderArcher', tx: 58, ty: 26 },
      { kind: 'fireBat', tx: 52, ty: 48 },
      { kind: 'magmaGolem', tx: 46, ty: 40 },
      { kind: 'cinderArcher', tx: 38, ty: 50 },
      { kind: 'fireBat', tx: 34, ty: 38 },
      { kind: 'fireBat', tx: 26, ty: 48 },
      { kind: 'magmaGolem', tx: 20, ty: 58 },
      { kind: 'cinderArcher', tx: 14, ty: 50 },
      { kind: 'fireBat', tx: 60, ty: 44 },
      { kind: 'fireBat', tx: 84, ty: 40 },
      { kind: 'magmaGolem', tx: 66, ty: 12 },
      { kind: 'cinderArcher', tx: 30, ty: 30 }
    ],
    destructibles: [
      { id: 'gpot_1', kind: 'pot', tx: 78, ty: 22, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'gpot_2', kind: 'pot', tx: 66, ty: 34, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'gpot_3', kind: 'pot', tx: 54, ty: 26, drops: [{ type: 'gold', min: 2, max: 5 }] },
      { id: 'gpot_4', kind: 'pot', tx: 46, ty: 40, drops: [{ type: 'mana', min: 10, max: 10 }] },
      { id: 'gpot_5', kind: 'pot', tx: 38, ty: 50, drops: [{ type: 'gold', min: 1, max: 4 }] },
      { id: 'gpot_6', kind: 'pot', tx: 26, ty: 48, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'gpot_7', kind: 'pot', tx: 16, ty: 58, drops: [{ type: 'item', item: 'potion', min: 1, max: 1 }] },
      { id: 'gpot_8', kind: 'pot', tx: 86, ty: 40, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'gcrate_1', kind: 'crate', tx: 60, ty: 48, drops: [{ type: 'gold', min: 2, max: 5 }] },
      { id: 'gcrate_2', kind: 'crate', tx: 61, ty: 49, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'gcrate_3', kind: 'crate', tx: 24, ty: 40, drops: [{ type: 'item', item: 'ether', min: 1, max: 1 }] },
      { id: 'gbush_1', kind: 'bush', tx: 40, ty: 12, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'gbush_2', kind: 'bush', tx: 58, ty: 12, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'gbush_3', kind: 'bush', tx: 34, ty: 20, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'gbush_s1', kind: 'bush', tx: 39, ty: 11, drops: [{ type: 'gold', min: 1, max: 2 }] },
      { id: 'gbush_s2', kind: 'bush', tx: 41, ty: 11, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'gbush_s3', kind: 'bush', tx: 39, ty: 13, drops: [{ type: 'gold', min: 1, max: 2 }] },
      { id: 'gbush_s4', kind: 'bush', tx: 41, ty: 13, drops: [{ type: 'heart', min: 8, max: 8 }] }
    ],
    chests: [
      { id: 'gchest_1', tx: 40, ty: 12, locked: false, contents: [{ gold: 110 }, { item: 'potion', count: 1 }] },
      { id: 'gchest_2', tx: 88, ty: 44, locked: false, contents: [{ gold: 160 }, { item: 'ether', count: 2 }] }
    ]
  });
}
