import { LayerBuilder, GameMap, buildMap, LightDef } from './MapData';
import { RNG } from '../types';

export const WOODS_W = 96;
export const WOODS_H = 72;

const PATH: [number, number][] = [
  [24, 4], [24, 10], [24, 16], [24, 22], [24, 28],
  [30, 28], [36, 28], [40, 28], [40, 34], [40, 40], [40, 44],
  [46, 44], [52, 44], [58, 44], [64, 44], [64, 50], [64, 56], [64, 58],
  [58, 58], [52, 58], [48, 58], [48, 62], [48, 65]
];

function onPath(x: number, y: number): boolean {
  for (const [px, py] of PATH) if (Math.abs(x - px) <= 1 && Math.abs(y - py) <= 1) return true;
  return false;
}

function nearPath(x: number, y: number, r: number): boolean {
  for (const [px, py] of PATH) if (Math.abs(x - px) <= r && Math.abs(y - py) <= r) return true;
  return false;
}

export function woods(): GameMap {
  const ground = new LayerBuilder(WOODS_W, WOODS_H, 'g');
  const walls = new LayerBuilder(WOODS_W, WOODS_H, '.');
  const decor = new LayerBuilder(WOODS_W, WOODS_H, '.');
  const canopy = new LayerBuilder(WOODS_W, WOODS_H, '.');
  const rng = new RNG(777001);

  for (let i = 0; i < PATH.length - 1; i++) {
    const [x0, y0] = PATH[i];
    const [x1, y1] = PATH[i + 1];
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(x0 + ((x1 - x0) * s) / steps);
      const y = Math.round(y0 + ((y1 - y0) * s) / steps);
      ground.rect(x - 1, y - 1, 3, 3, 'd');
    }
  }

  const features: [number, number][] = [
    [26, 6], [10, 50], [89, 8], [48, 63],
    [22, 12], [26, 20], [38, 26], [42, 40], [62, 50], [50, 60], [30, 34], [66, 46],
    [58, 24], [59, 25], [14, 22], [70, 36], [34, 50], [52, 12], [84, 40], [20, 60],
    [8, 48], [12, 52], [9, 49], [11, 49], [9, 51], [11, 51]
  ];
  const clearings: [number, number][] = [
    [24, 16], [56, 36], [30, 52], [70, 50], [12, 30]
  ];

  const isFeature = (x: number, y: number) => features.some(([fx, fy]) => Math.abs(x - fx) <= 2 && Math.abs(y - fy) <= 2);
  const isClearing = (x: number, y: number) => clearings.some(([cx, cy]) => Math.abs(x - cx) <= 3 && Math.abs(y - cy) <= 3);

  for (let y = 0; y < WOODS_H; y++) {
    for (let x = 0; x < WOODS_W; x++) {
      const border = x < 2 || y < 2 || x >= WOODS_W - 2 || y >= WOODS_H - 2;
      const caveGap = x >= 46 && x <= 50 && y >= 65;
      const gateGap = x >= 23 && x <= 25 && y <= 1;
      if (caveGap || gateGap) continue;
      if (border) {
        walls.set(x, y, 'T');
        canopy.set(x, y, rng.chance(0.85) ? 'C' : 'C2');
        continue;
      }
      if (onPath(x, y)) continue;
      if (isFeature(x, y) || isClearing(x, y)) continue;
      if (nearPath(x, y, 2)) continue;
      if (rng.chance(0.34)) {
        walls.set(x, y, 'T');
        canopy.set(x, y, rng.chance(0.75) ? 'C' : 'C2');
      } else if (rng.chance(0.04)) {
        walls.set(x, y, 'r');
      } else if (rng.chance(0.1) && ground.get(x, y) === 'g') {
        decor.set(x, y, rng.chance(0.6) ? 'f' : 't');
      }
    }
  }

  for (let i = 0; i < 60; i++) {
    const x = rng.int(2, WOODS_W - 3);
    const y = rng.int(2, WOODS_H - 3);
    if (ground.get(x, y) === 'g' && !onPath(x, y) && decor.get(x, y) === '.' && !isFeature(x, y)) {
      decor.set(x, y, rng.pick(['f', 't', 'e', 't', 'f']));
    }
  }

  ground.rect(47, 66, 3, 2, 's');
  walls.set(46, 66, 'r');
  walls.set(50, 66, 'r');
  walls.set(46, 67, 'r');
  walls.set(50, 67, 'r');
  walls.set(47, 68, 'r');
  walls.set(48, 68, 'r');
  walls.set(49, 68, 'r');

  const lights: LightDef[] = clearings.map(([cx, cy]) => ({ tx: cx, ty: cy, r: 46, color: '#a8e86a', intensity: 0.5 }));
  lights.push({ tx: 48, ty: 66, r: 30, color: '#8a5ae0', intensity: 0.7 });
  lights.push({ tx: 24, ty: 4, r: 34, color: '#ffd76a', flicker: 0.15 });

  return buildMap({
    id: 'biome_woods',
    name: 'Whispering Woods',
    w: WOODS_W,
    h: WOODS_H,
    ground,
    walls,
    decor,
    canopy,
    solidChars: 'TWrFL~',
    lights,
    ambient: 0.5,
    music: 'overworld',
    fireflies: true,
    spawn: { tx: 24, ty: 4 },
    signs: [
      { tx: 26, ty: 6, lines: ['WHISPERING WOODS', 'The trees remember everything.', 'Stalkers hunt near the Sanctum to the south.'] },
      { tx: 48, ty: 63, lines: ['THE ROOTED SANCTUM', 'A root-choked ruin. Something vast sleeps below.'] }
    ],
    exits: [
      { x: 23 * 16, y: -6, w: 3 * 16, h: 12, to: 'hub', spawnTx: 24, spawnTy: 2 },
      { x: 47 * 16, y: 66 * 16, w: 3 * 16, h: 2 * 16, to: 'sanctum', spawnTx: 12, spawnTy: 10 }
    ],
    enemies: [
      { kind: 'slime', tx: 22, ty: 10 },
      { kind: 'slime', tx: 26, ty: 18 },
      { kind: 'slime', tx: 36, ty: 30 },
      { kind: 'slime', tx: 44, ty: 40 },
      { kind: 'slime', tx: 60, ty: 52 },
      { kind: 'slime', tx: 8, ty: 48 },
      { kind: 'slime', tx: 12, ty: 52 },
      { kind: 'thornSprite', tx: 34, ty: 24 },
      { kind: 'thornSprite', tx: 46, ty: 36 },
      { kind: 'thornSprite', tx: 58, ty: 40 },
      { kind: 'thornSprite', tx: 68, ty: 54 },
      { kind: 'forestStalker', tx: 44, ty: 50 },
      { kind: 'forestStalker', tx: 56, ty: 56 },
      { kind: 'forestStalker', tx: 38, ty: 58 },
      { kind: 'forestStalker', tx: 62, ty: 62 }
    ],
    destructibles: [
      { id: 'wpot_1', kind: 'pot', tx: 22, ty: 12, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'wpot_2', kind: 'pot', tx: 26, ty: 20, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'wpot_3', kind: 'pot', tx: 38, ty: 26, drops: [{ type: 'gold', min: 2, max: 5 }] },
      { id: 'wpot_4', kind: 'pot', tx: 42, ty: 40, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'wpot_5', kind: 'pot', tx: 62, ty: 50, drops: [{ type: 'gold', min: 1, max: 4 }] },
      { id: 'wpot_6', kind: 'pot', tx: 50, ty: 60, drops: [{ type: 'mana', min: 10, max: 10 }] },
      { id: 'wpot_7', kind: 'pot', tx: 30, ty: 34, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'wpot_8', kind: 'pot', tx: 66, ty: 46, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'wcrate_1', kind: 'crate', tx: 58, ty: 24, drops: [{ type: 'gold', min: 2, max: 5 }] },
      { id: 'wcrate_2', kind: 'crate', tx: 59, ty: 25, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'wcrate_3', kind: 'crate', tx: 58, ty: 25, drops: [{ type: 'item', item: 'potion', min: 1, max: 1 }] },
      { id: 'wbush_1', kind: 'bush', tx: 14, ty: 22, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'wbush_2', kind: 'bush', tx: 70, ty: 36, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'wbush_3', kind: 'bush', tx: 34, ty: 50, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'wbush_4', kind: 'bush', tx: 52, ty: 12, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'wbush_5', kind: 'bush', tx: 84, ty: 40, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'wbush_6', kind: 'bush', tx: 20, ty: 60, drops: [{ type: 'gold', min: 1, max: 2 }] },
      { id: 'wbush_s1', kind: 'bush', tx: 9, ty: 49, drops: [{ type: 'gold', min: 1, max: 2 }] },
      { id: 'wbush_s2', kind: 'bush', tx: 11, ty: 49, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'wbush_s3', kind: 'bush', tx: 9, ty: 51, drops: [{ type: 'gold', min: 1, max: 2 }] },
      { id: 'wbush_s4', kind: 'bush', tx: 11, ty: 51, drops: [{ type: 'heart', min: 8, max: 8 }] }
    ],
    chests: [
      { id: 'wchest_1', tx: 10, ty: 50, locked: false, contents: [{ gold: 80 }, { item: 'potion', count: 1 }] },
      { id: 'wchest_2', tx: 89, ty: 8, locked: false, contents: [{ gold: 120 }, { item: 'potion', count: 2 }, { item: 'ether', count: 1 }] }
    ]
  });
}
