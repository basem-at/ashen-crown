import { LayerBuilder, GameMap, buildMap, LightDef } from './MapData';

export const SPIRE_W = 80;
export const SPIRE_H = 64;

function room(walls: LayerBuilder, ground: LayerBuilder, x: number, y: number, w: number, h: number): void {
  walls.rect(x + 1, y + 1, w - 2, h - 2, '.');
  ground.rect(x, y, w, h, 'O');
}

function corridor(walls: LayerBuilder, ground: LayerBuilder, x: number, y: number, w: number, h: number): void {
  walls.rect(x, y, w, h, '.');
  ground.rect(x, y, w, h, 'O');
}

export function spire(): GameMap {
  const ground = new LayerBuilder(SPIRE_W, SPIRE_H, 's');
  const walls = new LayerBuilder(SPIRE_W, SPIRE_H, 'W');
  const decor = new LayerBuilder(SPIRE_W, SPIRE_H, '.');
  const canopy = new LayerBuilder(SPIRE_W, SPIRE_H, '.');

  room(walls, ground, 4, 28, 18, 14);
  corridor(walls, ground, 12, 20, 3, 8);
  room(walls, ground, 4, 6, 18, 14);
  corridor(walls, ground, 22, 12, 8, 3);
  room(walls, ground, 30, 6, 18, 14);
  corridor(walls, ground, 48, 12, 8, 3);
  room(walls, ground, 56, 6, 20, 14);
  corridor(walls, ground, 64, 20, 3, 8);
  room(walls, ground, 56, 28, 20, 14);
  corridor(walls, ground, 48, 34, 8, 3);
  room(walls, ground, 30, 28, 18, 14);
  corridor(walls, ground, 38, 42, 3, 8);
  room(walls, ground, 30, 50, 18, 12);

  walls.set(12, 19, '.');
  walls.set(30, 13, '.');
  walls.set(56, 13, '.');
  walls.set(65, 28, '.');
  walls.set(47, 35, '.');
  walls.set(38, 41, '.');
  walls.set(3, 33, '.');
  walls.set(3, 34, '.');
  walls.set(3, 35, '.');

  walls.set(12, 28, '.');
  walls.set(21, 13, '.');
  walls.set(47, 13, '.');
  walls.set(65, 19, '.');
  walls.set(56, 35, '.');
  walls.set(38, 50, '.');

  for (let y = 7; y <= 18; y++) {
    ground.set(9, y, 'X');
    ground.set(10, y, 'X');
    ground.set(15, y, 'X');
    ground.set(16, y, 'X');
  }
  for (let x = 57; x <= 74; x++) {
    ground.set(x, 11, 'M');
    ground.set(x, 12, 'M');
    ground.set(x, 13, 'M');
    ground.set(x, 14, 'M');
  }
  ground.set(60, 33, 'X');
  ground.set(61, 33, 'X');
  ground.set(68, 38, 'X');
  ground.set(69, 38, 'X');

  decor.set(8, 32, 'e');
  decor.set(16, 10, 'e');
  decor.set(38, 10, 'e');
  decor.set(62, 10, 'e');
  decor.set(62, 32, 'e');
  decor.set(38, 34, 'e');
  decor.set(36, 54, 'e');

  const spireLights: [number, number][] = [
    [5, 29], [20, 40], [5, 7], [20, 18], [31, 7], [46, 18],
    [57, 7], [74, 18], [57, 29], [74, 40], [31, 29], [46, 40], [38, 33],
    [31, 51], [46, 60], [38, 55]
  ];
  for (const [x, y] of spireLights) walls.set(x, y, 'L');
  const lights: LightDef[] = spireLights.map(([tx, ty]) => ({ tx, ty, r: 34, color: '#b08aff', flicker: 0.2, intensity: 0.8 }));

  return buildMap({
    id: 'biome_spire',
    name: 'The Ashen Spire',
    w: SPIRE_W,
    h: SPIRE_H,
    ground,
    walls,
    decor,
    canopy,
    solidChars: 'WLX~M',
    lights,
    ambient: 0.68,
    music: 'dungeon',
    darkRects: [{ x: 31 * 16, y: 7 * 16, w: 16 * 16, h: 12 * 16 }],
    spawn: { tx: 12, ty: 34 },
    campfire: { tx: 38, ty: 33 },
    signs: [
      { tx: 6, ty: 30, lines: ['THE ASHEN SPIRE', 'Every relic is tested here: dash the chasms,', 'light the dark with the lantern, freeze the lava,', 'and turn the King\'s own bolts against him.'] },
      { tx: 33, ty: 30, lines: ['SANCTUARY', 'Rest at the flame. The throne room lies south.', 'The Hollow King wears the Ashen Crown.'] },
      { tx: 33, ty: 52, lines: ['THRONE ROOM', 'The Hollow King awaits.'] }
    ],
    exits: [
      { x: 2 * 16, y: 33 * 16, w: 2 * 16 + 8, h: 3 * 16, to: 'hub', spawnTx: 24, spawnTy: 33 }
    ],
    doors: [
      { id: 'sdoorA', kind: 'house', tx: 12, ty: 28 },
      { id: 'sdoorB_east', kind: 'house', tx: 21, ty: 13 },
      { id: 'sdoorC_east', kind: 'brazier', tx: 47, ty: 13, lockedText: 'Sealed by void-mist. Light every brazier in the dark hall.' },
      { id: 'sdoorD_west', kind: 'house', tx: 56, ty: 13 },
      { id: 'sdoorD_south', kind: 'house', tx: 65, ty: 19 },
      { id: 'sdoorE_west', kind: 'house', tx: 56, ty: 35 },
      { id: 'sdoorG', kind: 'house', tx: 38, ty: 50 }
    ],
    braziers: [
      { id: 'sbrazier_dark1', tx: 32, ty: 8, roomId: 'darkC' },
      { id: 'sbrazier_dark2', tx: 45, ty: 17, roomId: 'darkC' }
    ],
    brazierDoors: [{ doorId: 'sdoorC_east', roomId: 'darkC' }],
    enemies: [
      { kind: 'fallenGuard', tx: 8, ty: 36 },
      { kind: 'shadowKnight', tx: 8, ty: 10 },
      { kind: 'shadowKnight', tx: 17, ty: 15 },
      { kind: 'voidMage', tx: 34, ty: 9 },
      { kind: 'voidMage', tx: 43, ty: 16 },
      { kind: 'shadowKnight', tx: 40, ty: 12 },
      { kind: 'fallenGuard', tx: 60, ty: 9 },
      { kind: 'voidMage', tx: 70, ty: 15 },
      { kind: 'shadowKnight', tx: 60, ty: 31 },
      { kind: 'shadowKnight', tx: 71, ty: 38 },
      { kind: 'voidMage', tx: 66, ty: 35 }
    ],
    destructibles: [
      { id: 'spot_a1', kind: 'pot', tx: 6, ty: 38, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'spot_a2', kind: 'pot', tx: 18, ty: 31, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'spot_b1', kind: 'pot', tx: 6, ty: 8, drops: [{ type: 'gold', min: 2, max: 5 }] },
      { id: 'spot_b2', kind: 'crate', tx: 18, ty: 17, drops: [{ type: 'item', item: 'potion', min: 1, max: 1 }] },
      { id: 'sweb_1', kind: 'web', tx: 34, ty: 10, drops: [] },
      { id: 'sweb_2', kind: 'web', tx: 40, ty: 16, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'spot_c1', kind: 'pot', tx: 32, ty: 17, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'spot_c2', kind: 'pot', tx: 44, ty: 8, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'spot_d1', kind: 'pot', tx: 58, ty: 8, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'spot_d2', kind: 'crate', tx: 73, ty: 17, drops: [{ type: 'mana', min: 15, max: 15 }] },
      { id: 'spot_e1', kind: 'pot', tx: 58, ty: 38, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'spot_e2', kind: 'pot', tx: 72, ty: 30, drops: [{ type: 'gold', min: 3, max: 6 }] }
    ],
    chests: [
      { id: 'spchest_a', tx: 19, ty: 38, locked: false, contents: [{ item: 'potion', count: 2 }, { gold: 50 }] },
      { id: 'spchest_b', tx: 5, ty: 18, locked: false, contents: [{ gold: 100 }, { item: 'ether', count: 1 }] },
      { id: 'spchest_c', tx: 45, ty: 7, locked: false, contents: [{ gold: 120 }, { item: 'potion', count: 1 }] },
      { id: 'spchest_d', tx: 74, ty: 8, locked: false, contents: [{ item: 'bossShard', count: 1 }, { gold: 150 }] },
      { id: 'spchest_sanct', tx: 32, ty: 38, locked: false, contents: [{ item: 'potion', count: 3 }, { item: 'ether', count: 2 }, { gold: 200 }] }
    ],
    bossZone: {
      x: 31 * 16,
      y: 51 * 16,
      w: 15 * 16,
      h: 9 * 16,
      kind: 'hollowKing',
      name: 'THE HOLLOW KING',
      doorIds: ['sdoorG']
    }
  });
}
