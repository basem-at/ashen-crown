import { LayerBuilder, GameMap, buildMap, LightDef } from './MapData';

export const SAN_W = 72;
export const SAN_H = 58;

function room(walls: LayerBuilder, ground: LayerBuilder, x: number, y: number, w: number, h: number): void {
  walls.rect(x + 1, y + 1, w - 2, h - 2, '.');
  ground.rect(x, y, w, h, 'c');
}

function corridor(walls: LayerBuilder, ground: LayerBuilder, x: number, y: number, w: number, h: number): void {
  walls.rect(x, y, w, h, '.');
  ground.rect(x, y, w, h, 'c');
}

export function sanctum(): GameMap {
  const ground = new LayerBuilder(SAN_W, SAN_H, 's');
  const walls = new LayerBuilder(SAN_W, SAN_H, 'W');
  const decor = new LayerBuilder(SAN_W, SAN_H, '.');
  const canopy = new LayerBuilder(SAN_W, SAN_H, '.');

  room(walls, ground, 4, 4, 17, 13);
  corridor(walls, ground, 11, 17, 3, 7);
  room(walls, ground, 4, 24, 17, 13);
  corridor(walls, ground, 21, 29, 8, 3);
  room(walls, ground, 29, 24, 16, 13);
  corridor(walls, ground, 35, 17, 3, 7);
  room(walls, ground, 29, 4, 16, 13);
  corridor(walls, ground, 45, 9, 8, 3);
  room(walls, ground, 53, 4, 16, 13);
  corridor(walls, ground, 59, 17, 3, 7);
  room(walls, ground, 53, 24, 16, 13);
  corridor(walls, ground, 59, 37, 3, 7);
  room(walls, ground, 44, 44, 25, 13);

  walls.set(12, 24, '.');
  walls.set(29, 30, '.');
  walls.set(36, 16, '.');
  walls.set(53, 10, '.');
  walls.set(60, 24, '.');
  walls.set(3, 9, '.');
  walls.set(3, 10, '.');
  walls.set(3, 11, '.');

  walls.set(12, 16, '.');
  walls.set(20, 30, '.');
  walls.set(36, 24, '.');
  walls.set(44, 10, '.');
  walls.set(60, 16, '.');
  walls.set(60, 36, '.');
  walls.set(60, 44, '.');

  for (let x = 54; x <= 67; x++) {
    ground.set(x, 29, 'X');
    ground.set(x, 30, 'X');
  }
  ground.set(56, 33, 'X');
  ground.set(57, 33, 'X');
  ground.set(63, 26, 'X');
  ground.set(64, 26, 'X');

  decor.set(8, 12, 'e');
  decor.set(16, 6, 'e');
  decor.set(33, 30, 'e');
  decor.set(50, 12, 'e');
  decor.set(58, 27, 'e');
  decor.set(50, 50, 'e');

  const brazierTiles: [number, number][] = [
    [5, 5], [19, 15], [5, 25], [19, 35], [30, 25], [43, 35],
    [30, 5], [43, 15], [54, 5], [67, 15], [54, 25], [67, 35],
    [45, 45], [67, 55], [56, 45]
  ];
  for (const [x, y] of brazierTiles) walls.set(x, y, 'L');
  const lights: LightDef[] = brazierTiles.map(([tx, ty]) => ({ tx, ty, r: 36, color: '#ff9a2e', flicker: 0.25 }));

  return buildMap({
    id: 'sanctum',
    name: 'The Rooted Sanctum',
    w: SAN_W,
    h: SAN_H,
    ground,
    walls,
    decor,
    canopy,
    solidChars: 'WLX~',
    lights,
    ambient: 0.82,
    music: 'dungeon',
    spawn: { tx: 12, ty: 10 },
    signs: [
      { tx: 7, ty: 5, lines: ['THE ROOTED SANCTUM', 'Pressure plates open root-sealed doors.', 'Push stone blocks onto plates.', 'Something vast sleeps in the deep hall.'] }
    ],
    exits: [
      { x: 2 * 16, y: 9 * 16, w: 2 * 16 + 8, h: 3 * 16, to: 'biome_woods', spawnTx: 48, spawnTy: 64 }
    ],
    doors: [
      { id: 'doorA', kind: 'house', tx: 12, ty: 16 },
      { id: 'doorB_east', kind: 'puzzle', tx: 20, ty: 30, lockedText: 'Sealed by ancient roots. Stand on the plates!' },
      { id: 'doorC_north', kind: 'puzzle', tx: 36, ty: 24, lockedText: 'Sealed by roots. Something must press the far plate.' },
      { id: 'doorD_east', kind: 'key', tx: 44, ty: 10, requireItem: 'dungeonKey', lockedText: 'A sanctum lock. It needs a Sanctum Key.' },
      { id: 'doorE_south', kind: 'house', tx: 60, ty: 16 },
      { id: 'doorF_south', kind: 'house', tx: 60, ty: 36 },
      { id: 'doorG', kind: 'house', tx: 60, ty: 44 }
    ],
    switches: [
      { id: 'plate_b1', tx: 6, ty: 26, doorId: 'doorB_east' },
      { id: 'plate_b2', tx: 18, ty: 26, doorId: 'doorB_east' },
      { id: 'plate_b3', tx: 12, ty: 34, doorId: 'doorB_east' },
      { id: 'plate_c', tx: 41, ty: 30, doorId: 'doorC_north' }
    ],
    blocks: [{ tx: 32, ty: 30 }],
    enemies: [
      { kind: 'slime', tx: 8, ty: 8 },
      { kind: 'slime', tx: 16, ty: 12 },
      { kind: 'slime', tx: 8, ty: 32 },
      { kind: 'thornSprite', tx: 16, ty: 27 },
      { kind: 'thornSprite', tx: 33, ty: 27 },
      { kind: 'thornSprite', tx: 40, ty: 33 },
      { kind: 'slime', tx: 36, ty: 31 },
      { kind: 'forestStalker', tx: 32, ty: 8 },
      { kind: 'forestStalker', tx: 40, ty: 13 },
      { kind: 'forestStalker', tx: 57, ty: 8 },
      { kind: 'thornSprite', tx: 64, ty: 13 },
      { kind: 'forestStalker', tx: 57, ty: 32 },
      { kind: 'forestStalker', tx: 64, ty: 27 }
    ],
    destructibles: [
      { id: 'spot_1', kind: 'pot', tx: 6, ty: 6, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'spot_2', kind: 'pot', tx: 18, ty: 14, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'spot_key', kind: 'pot', tx: 5, ty: 34, drops: [{ type: 'item', item: 'dungeonKey', min: 1, max: 1 }] },
      { id: 'spot_3', kind: 'pot', tx: 31, ty: 26, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'spot_4', kind: 'pot', tx: 42, ty: 34, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'spot_5', kind: 'pot', tx: 42, ty: 14, drops: [{ type: 'gold', min: 2, max: 5 }] },
      { id: 'spot_6', kind: 'pot', tx: 55, ty: 6, drops: [{ type: 'mana', min: 10, max: 10 }] },
      { id: 'spot_7', kind: 'pot', tx: 67, ty: 34, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'scrate_1', kind: 'crate', tx: 19, ty: 5, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'scrate_2', kind: 'crate', tx: 30, ty: 34, drops: [{ type: 'item', item: 'potion', min: 1, max: 1 }] },
      { id: 'scrate_3', kind: 'crate', tx: 54, ty: 26, drops: [{ type: 'heart', min: 8, max: 8 }] }
    ],
    chests: [
      { id: 'schest_b', tx: 5, ty: 25, locked: false, contents: [{ gold: 60 }, { item: 'potion', count: 1 }] },
      { id: 'schest_c', tx: 43, ty: 25, locked: false, contents: [{ item: 'potion', count: 2 }, { item: 'ether', count: 1 }] },
      { id: 'schest_d', tx: 30, ty: 5, locked: false, contents: [{ gold: 40 }, { item: 'ether', count: 1 }] },
      { id: 'schest_relic', tx: 66, ty: 5, locked: false, contents: [{ relic: 'windBoots' }, { gold: 100 }] }
    ],
    bossZone: {
      x: 45 * 16,
      y: 45 * 16,
      w: 23 * 16,
      h: 11 * 16,
      kind: 'brambleheart',
      name: 'BRAMBLEHEART',
      doorIds: ['doorG']
    }
  });
}
