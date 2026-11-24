import { LayerBuilder, GameMap, buildMap, LightDef } from './MapData';

export const CRYPT_W = 72;
export const CRYPT_H = 58;

function room(walls: LayerBuilder, ground: LayerBuilder, x: number, y: number, w: number, h: number): void {
  walls.rect(x + 1, y + 1, w - 2, h - 2, '.');
  ground.rect(x, y, w, h, 'c');
}

function corridor(walls: LayerBuilder, ground: LayerBuilder, x: number, y: number, w: number, h: number): void {
  walls.rect(x, y, w, h, '.');
  ground.rect(x, y, w, h, 'c');
}

export function crypt(): GameMap {
  const ground = new LayerBuilder(CRYPT_W, CRYPT_H, 's');
  const walls = new LayerBuilder(CRYPT_W, CRYPT_H, 'W');
  const decor = new LayerBuilder(CRYPT_W, CRYPT_H, '.');
  const canopy = new LayerBuilder(CRYPT_W, CRYPT_H, '.');

  room(walls, ground, 4, 4, 17, 13);
  corridor(walls, ground, 11, 17, 3, 7);
  room(walls, ground, 4, 24, 17, 13);
  corridor(walls, ground, 21, 29, 8, 3);
  room(walls, ground, 29, 24, 16, 13);
  corridor(walls, ground, 45, 29, 8, 3);
  room(walls, ground, 53, 24, 16, 13);
  corridor(walls, ground, 59, 37, 3, 7);
  room(walls, ground, 44, 44, 25, 13);

  walls.set(12, 24, '.');
  walls.set(29, 30, '.');
  walls.set(53, 30, '.');
  walls.set(3, 9, '.');
  walls.set(3, 10, '.');
  walls.set(3, 11, '.');

  walls.set(12, 16, '.');
  walls.set(20, 30, '.');
  walls.set(44, 30, '.');
  walls.set(60, 36, '.');
  walls.set(60, 44, '.');

  for (let x = 54; x <= 67; x++) {
    ground.set(x, 29, 'X');
    ground.set(x, 30, 'X');
  }
  ground.set(56, 33, 'X');
  ground.set(64, 26, 'X');

  decor.set(8, 12, 'e');
  decor.set(16, 6, 'e');
  decor.set(10, 30, 'e');
  decor.set(38, 32, 'e');
  decor.set(58, 27, 'e');
  decor.set(50, 50, 'e');

  const brazierTiles: [number, number][] = [
    [5, 5], [19, 15], [45, 45], [67, 55], [56, 45], [62, 50]
  ];
  for (const [x, y] of brazierTiles) walls.set(x, y, 'L');
  const lights: LightDef[] = brazierTiles.map(([tx, ty]) => ({ tx, ty, r: 34, color: '#ff9a2e', flicker: 0.25 }));

  return buildMap({
    id: 'crypt',
    name: 'The Flooded Crypt',
    w: CRYPT_W,
    h: CRYPT_H,
    ground,
    walls,
    decor,
    canopy,
    solidChars: 'WLX~',
    lights,
    ambient: 0.55,
    music: 'dungeon',
    darkRects: [
      { x: 30 * 16, y: 25 * 16, w: 13 * 16, h: 11 * 16 },
      { x: 45 * 16, y: 29 * 16, w: 8 * 16, h: 3 * 16 },
      { x: 54 * 16, y: 25 * 16, w: 14 * 16, h: 11 * 16 }
    ],
    spawn: { tx: 12, ty: 10 },
    signs: [
      { tx: 7, ty: 5, lines: ['THE FLOODED CRYPT', 'Some halls are pitch black. Light is life.', 'The Ember Lantern burns webs and lights cold braziers.', 'Something armored drowned in the deep hall.'] }
    ],
    exits: [
      { x: 2 * 16, y: 9 * 16, w: 2 * 16 + 8, h: 3 * 16, to: 'biome_marshes', spawnTx: 88, spawnTy: 51 }
    ],
    doors: [
      { id: 'cdoorA', kind: 'house', tx: 12, ty: 16 },
      { id: 'cdoorB_east', kind: 'house', tx: 20, ty: 30 },
      { id: 'cdoorC_east', kind: 'brazier', tx: 44, ty: 30, lockedText: 'Sealed by cold water. Light every brazier in the dark hall.' },
      { id: 'cdoorD_south', kind: 'house', tx: 60, ty: 36 },
      { id: 'cdoorE', kind: 'house', tx: 60, ty: 44 }
    ],
    braziers: [
      { id: 'brazier_a', tx: 6, ty: 6 },
      { id: 'brazier_dark1', tx: 31, ty: 26, roomId: 'dark1' },
      { id: 'brazier_dark2', tx: 42, ty: 34, roomId: 'dark1' },
      { id: 'brazier_d', tx: 55, ty: 26 }
    ],
    brazierDoors: [{ doorId: 'cdoorC_east', roomId: 'dark1' }],
    enemies: [
      { kind: 'acidToad', tx: 8, ty: 8 },
      { kind: 'bogZombie', tx: 8, ty: 32 },
      { kind: 'bogZombie', tx: 16, ty: 27 },
      { kind: 'acidToad', tx: 18, ty: 33 },
      { kind: 'wisp', tx: 33, ty: 28 },
      { kind: 'wisp', tx: 40, ty: 32 },
      { kind: 'acidToad', tx: 36, ty: 26 },
      { kind: 'bogZombie', tx: 57, ty: 27 },
      { kind: 'wisp', tx: 63, ty: 33 },
      { kind: 'bogZombie', tx: 64, ty: 27 }
    ],
    destructibles: [
      { id: 'cpot_1', kind: 'pot', tx: 6, ty: 14, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'cpot_2', kind: 'pot', tx: 18, ty: 12, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'cpot_3', kind: 'pot', tx: 5, ty: 34, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'cpot_4', kind: 'pot', tx: 18, ty: 25, drops: [{ type: 'mana', min: 10, max: 10 }] },
      { id: 'cpot_5', kind: 'pot', tx: 31, ty: 33, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'cpot_6', kind: 'pot', tx: 42, ty: 26, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'cpot_7', kind: 'pot', tx: 55, ty: 33, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'cpot_8', kind: 'pot', tx: 66, ty: 34, drops: [{ type: 'item', item: 'potion', min: 1, max: 1 }] },
      { id: 'ccrate_1', kind: 'crate', tx: 19, ty: 5, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'ccrate_2', kind: 'crate', tx: 30, ty: 34, drops: [{ type: 'item', item: 'ether', min: 1, max: 1 }] },
      { id: 'cweb_1', kind: 'web', tx: 46, ty: 30, drops: [] },
      { id: 'cweb_2', kind: 'web', tx: 48, ty: 30, drops: [] },
      { id: 'cweb_3', kind: 'web', tx: 50, ty: 30, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'cweb_4', kind: 'web', tx: 43, ty: 25, drops: [{ type: 'item', item: 'potion', min: 1, max: 1 }] }
    ],
    chests: [
      { id: 'cchest_a', tx: 18, ty: 14, locked: false, contents: [{ item: 'potion', count: 1 }, { gold: 30 }] },
      { id: 'cchest_relic', tx: 6, ty: 26, locked: false, contents: [{ relic: 'emberLantern' }, { gold: 100 }] },
      { id: 'cchest_c', tx: 33, ty: 35, locked: false, contents: [{ gold: 80 }, { item: 'ether', count: 1 }] },
      { id: 'cchest_d', tx: 67, ty: 25, locked: false, contents: [{ gold: 60 }, { item: 'potion', count: 1 }] }
    ],
    bossZone: {
      x: 45 * 16,
      y: 45 * 16,
      w: 23 * 16,
      h: 11 * 16,
      kind: 'drownedWarden',
      name: 'DROWNED WARDEN',
      doorIds: ['cdoorE']
    }
  });
}
