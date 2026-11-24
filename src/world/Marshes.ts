import { LayerBuilder, GameMap, buildMap, LightDef } from './MapData';
import { RNG } from '../types';

export const MAR_W = 96;
export const MAR_H = 72;

const PATH: [number, number][] = [
  [4, 18], [12, 18], [20, 18], [28, 18], [28, 26], [28, 32], [36, 32], [44, 32], [52, 32],
  [52, 24], [52, 18], [60, 18], [68, 18], [72, 18], [72, 26], [72, 34], [72, 42], [80, 42], [88, 42], [88, 48], [88, 52]
];

function nearPath(x: number, y: number, r: number): boolean {
  for (const [px, py] of PATH) if (Math.abs(x - px) <= r && Math.abs(y - py) <= r) return true;
  return false;
}

export function marshes(): GameMap {
  const ground = new LayerBuilder(MAR_W, MAR_H, 'G');
  const walls = new LayerBuilder(MAR_W, MAR_H, '.');
  const decor = new LayerBuilder(MAR_W, MAR_H, '.');
  const canopy = new LayerBuilder(MAR_W, MAR_H, '.');
  const rng = new RNG(424242);

  for (let i = 0; i < 26; i++) {
    const cx = rng.int(6, MAR_W - 8);
    const cy = rng.int(6, MAR_H - 8);
    const r = rng.int(2, 5);
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        if (Math.hypot(x - cx, y - cy) <= r && !nearPath(x, y, 2)) ground.set(x, y, '~');
      }
    }
  }
  for (let i = 0; i < 60; i++) {
    const x = rng.int(2, MAR_W - 3);
    const y = rng.int(2, MAR_H - 3);
    if (ground.get(x, y) === 'G' && !nearPath(x, y, 1)) ground.set(x, y, 'd');
  }

  for (let i = 0; i < PATH.length - 1; i++) {
    const [x0, y0] = PATH[i];
    const [x1, y1] = PATH[i + 1];
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(x0 + ((x1 - x0) * s) / steps);
      const y = Math.round(y0 + ((y1 - y0) * s) / steps);
      ground.rect(x - 1, y - 1, 3, 3, 'b');
    }
  }

  const features: [number, number][] = [
    [6, 17], [14, 44], [84, 10], [88, 50],
    [10, 22], [24, 36], [40, 28], [48, 38], [58, 22], [66, 30], [78, 38], [86, 46],
    [18, 12], [34, 22], [62, 48], [76, 14], [30, 44], [50, 44], [70, 54]
  ];
  const isFeature = (x: number, y: number) => features.some(([fx, fy]) => Math.abs(x - fx) <= 2 && Math.abs(y - fy) <= 2);

  for (let y = 0; y < MAR_H; y++) {
    for (let x = 0; x < MAR_W; x++) {
      const border = x < 2 || y < 2 || x >= MAR_W - 2 || y >= MAR_H - 2;
      const cryptGap = x >= 87 && x <= 90 && y >= 50 && y <= 53;
      const gateGap = x <= 1 && y >= 17 && y <= 19;
      if (cryptGap || gateGap) continue;
      if (border) {
        if (rng.chance(0.7)) {
          walls.set(x, y, 'U');
          canopy.set(x, y, rng.chance(0.8) ? 'V' : 'C2');
        } else if (rng.chance(0.3)) ground.set(x, y, '~');
        continue;
      }
      if (nearPath(x, y, 2)) continue;
      if (isFeature(x, y)) continue;
      if (ground.get(x, y) === '~') continue;
      if (rng.chance(0.3)) {
        walls.set(x, y, 'U');
        canopy.set(x, y, rng.chance(0.7) ? 'V' : 'C2');
      } else if (rng.chance(0.05)) {
        walls.set(x, y, 'r');
      } else if (rng.chance(0.12)) {
        decor.set(x, y, rng.pick(['f', 't', 'e']));
      }
    }
  }

  ground.rect(87, 51, 4, 3, 's');
  walls.set(86, 51, 'r');
  walls.set(91, 51, 'r');
  walls.set(86, 53, 'r');
  walls.set(91, 53, 'r');
  walls.set(87, 54, 'r');
  walls.set(88, 54, 'r');
  walls.set(89, 54, 'r');
  walls.set(90, 54, 'r');

  const lights: LightDef[] = [
    { tx: 4, ty: 18, r: 34, color: '#ffd76a', flicker: 0.15 },
    { tx: 28, ty: 24, r: 40, color: '#6a8ae0', intensity: 0.5 },
    { tx: 60, ty: 24, r: 40, color: '#6a8ae0', intensity: 0.5 },
    { tx: 76, ty: 38, r: 42, color: '#6a8ae0', intensity: 0.5 },
    { tx: 88, ty: 51, r: 30, color: '#4a6ae0', intensity: 0.7 }
  ];

  return buildMap({
    id: 'biome_marshes',
    name: 'Sunken Marshes',
    w: MAR_W,
    h: MAR_H,
    ground,
    walls,
    decor,
    canopy,
    solidChars: 'TUVrFL~',
    lights,
    ambient: 0.55,
    music: 'overworld',
    mist: true,
    spawn: { tx: 4, ty: 18 },
    signs: [
      { tx: 6, ty: 17, lines: ['SUNKEN MARSHES', 'Murk and will-o-wisps. The Flooded Crypt lies east-south.', 'Wisps drift over the water - their light is a lie.'] },
      { tx: 86, ty: 48, lines: ['THE FLOODED CRYPT', 'Drowned halls below. Bring light.'] }
    ],
    exits: [
      { x: -6, y: 17 * 16, w: 12, h: 3 * 16, to: 'hub', spawnTx: 45, spawnTy: 18 },
      { x: 87 * 16, y: 51 * 16, w: 4 * 16, h: 3 * 16, to: 'crypt', spawnTx: 12, spawnTy: 10 }
    ],
    enemies: [
      { kind: 'bogZombie', tx: 12, ty: 22 },
      { kind: 'bogZombie', tx: 24, ty: 14 },
      { kind: 'acidToad', tx: 20, ty: 36 },
      { kind: 'acidToad', tx: 40, ty: 28 },
      { kind: 'wisp', tx: 33, ty: 27 },
      { kind: 'bogZombie', tx: 48, ty: 38 },
      { kind: 'acidToad', tx: 58, ty: 22 },
      { kind: 'wisp', tx: 62, ty: 48 },
      { kind: 'acidToad', tx: 70, ty: 30 },
      { kind: 'bogZombie', tx: 78, ty: 38 },
      { kind: 'wisp', tx: 82, ty: 20 },
      { kind: 'bogZombie', tx: 86, ty: 46 },
      { kind: 'acidToad', tx: 90, ty: 38 },
      { kind: 'wisp', tx: 16, ty: 44 },
      { kind: 'wisp', tx: 52, ty: 44 }
    ],
    destructibles: [
      { id: 'mpot_1', kind: 'pot', tx: 10, ty: 22, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'mpot_2', kind: 'pot', tx: 24, ty: 36, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'mpot_3', kind: 'pot', tx: 40, ty: 28, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'mpot_4', kind: 'pot', tx: 48, ty: 38, drops: [{ type: 'mana', min: 10, max: 10 }] },
      { id: 'mpot_5', kind: 'pot', tx: 58, ty: 22, drops: [{ type: 'gold', min: 1, max: 4 }] },
      { id: 'mpot_6', kind: 'pot', tx: 66, ty: 30, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'mpot_7', kind: 'pot', tx: 78, ty: 38, drops: [{ type: 'gold', min: 2, max: 5 }] },
      { id: 'mpot_8', kind: 'pot', tx: 86, ty: 46, drops: [{ type: 'item', item: 'potion', min: 1, max: 1 }] },
      { id: 'mcrate_1', kind: 'crate', tx: 18, ty: 12, drops: [{ type: 'gold', min: 2, max: 5 }] },
      { id: 'mcrate_2', kind: 'crate', tx: 19, ty: 13, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'mcrate_3', kind: 'crate', tx: 34, ty: 22, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'mbush_1', kind: 'bush', tx: 30, ty: 44, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'mbush_2', kind: 'bush', tx: 50, ty: 44, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'mbush_3', kind: 'bush', tx: 62, ty: 48, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'mbush_4', kind: 'bush', tx: 70, ty: 54, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'mbush_5', kind: 'bush', tx: 76, ty: 14, drops: [{ type: 'gold', min: 1, max: 2 }] },
      { id: 'mbush_s1', kind: 'bush', tx: 13, ty: 43, drops: [{ type: 'gold', min: 1, max: 2 }] },
      { id: 'mbush_s2', kind: 'bush', tx: 15, ty: 43, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'mbush_s3', kind: 'bush', tx: 13, ty: 45, drops: [{ type: 'gold', min: 1, max: 2 }] },
      { id: 'mbush_s4', kind: 'bush', tx: 15, ty: 45, drops: [{ type: 'heart', min: 8, max: 8 }] }
    ],
    chests: [
      { id: 'mchest_1', tx: 14, ty: 44, locked: false, contents: [{ gold: 90 }, { item: 'ether', count: 1 }] },
      { id: 'mchest_2', tx: 84, ty: 10, locked: false, contents: [{ gold: 150 }, { item: 'potion', count: 2 }] }
    ]
  });
}
