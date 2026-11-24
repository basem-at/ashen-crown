import { LayerBuilder, GameMap, buildMap, LightDef } from './MapData';

export const FOUN_W = 72;
export const FOUN_H = 58;

function room(walls: LayerBuilder, ground: LayerBuilder, x: number, y: number, w: number, h: number): void {
  walls.rect(x + 1, y + 1, w - 2, h - 2, '.');
  ground.rect(x, y, w, h, 'O');
}

function corridor(walls: LayerBuilder, ground: LayerBuilder, x: number, y: number, w: number, h: number): void {
  walls.rect(x, y, w, h, '.');
  ground.rect(x, y, w, h, 'O');
}

export function foundry(): GameMap {
  const ground = new LayerBuilder(FOUN_W, FOUN_H, 's');
  const walls = new LayerBuilder(FOUN_W, FOUN_H, 'W');
  const decor = new LayerBuilder(FOUN_W, FOUN_H, '.');
  const canopy = new LayerBuilder(FOUN_W, FOUN_H, '.');

  room(walls, ground, 4, 4, 17, 13);
  corridor(walls, ground, 11, 17, 3, 7);
  room(walls, ground, 4, 24, 17, 13);
  corridor(walls, ground, 21, 29, 8, 3);
  room(walls, ground, 29, 24, 16, 13);
  corridor(walls, ground, 45, 29, 8, 3);
  room(walls, ground, 53, 24, 16, 13);
  corridor(walls, ground, 59, 17, 3, 7);
  room(walls, ground, 53, 4, 16, 13);
  corridor(walls, ground, 59, 37, 3, 7);
  room(walls, ground, 44, 44, 25, 13);

  walls.set(12, 24, '.');
  walls.set(29, 30, '.');
  walls.set(53, 30, '.');
  walls.set(60, 16, '.');
  walls.set(3, 9, '.');
  walls.set(3, 10, '.');
  walls.set(3, 11, '.');

  walls.set(12, 16, '.');
  walls.set(20, 30, '.');
  walls.set(44, 30, '.');
  walls.set(60, 24, '.');
  walls.set(60, 36, '.');
  walls.set(60, 44, '.');

  for (let x = 30; x <= 43; x++) {
    ground.set(x, 29, 'M');
    ground.set(x, 30, 'M');
  }
  for (let y = 25; y <= 35; y++) {
    ground.set(60, y, 'X');
    ground.set(61, y, 'X');
  }
  for (let x = 54; x <= 67; x++) ground.set(x, 10, 'M');

  decor.set(8, 12, 'e');
  decor.set(16, 6, 'e');
  decor.set(10, 30, 'e');
  decor.set(38, 32, 'e');
  decor.set(58, 27, 'e');
  decor.set(50, 50, 'e');

  const forgeTiles: [number, number][] = [
    [5, 5], [19, 15], [5, 25], [19, 35], [30, 25], [43, 35],
    [54, 25], [67, 35], [45, 45], [67, 55], [56, 45], [62, 50]
  ];
  for (const [x, y] of forgeTiles) walls.set(x, y, 'L');
  const lights: LightDef[] = forgeTiles.map(([tx, ty]) => ({ tx, ty, r: 38, color: '#ff7a2e', flicker: 0.28 }));

  return buildMap({
    id: 'foundry',
    name: 'The Obsidian Foundry',
    w: FOUN_W,
    h: FOUN_H,
    ground,
    walls,
    decor,
    canopy,
    solidChars: 'WLX~M',
    lights,
    ambient: 0.5,
    music: 'dungeon',
    darkRects: [{ x: 54 * 16, y: 5 * 16, w: 13 * 16, h: 11 * 16 }],
    spawn: { tx: 12, ty: 10 },
    signs: [
      { tx: 7, ty: 5, lines: ['THE OBSIDIAN FOUNDRY', 'Lava runs through the halls. The Frost Aegis freezes it.', 'Hold C (or right-click) to raise the frost shield.', 'It reflects shots and freezes lava ahead of you.', 'Ignis waits in the furnace hall below.'] }
    ],
    exits: [
      { x: 2 * 16, y: 9 * 16, w: 2 * 16 + 8, h: 3 * 16, to: 'biome_wastes', spawnTx: 7, spawnTy: 54 }
    ],
    doors: [
      { id: 'fdoorA', kind: 'house', tx: 12, ty: 16 },
      { id: 'fdoorB_east', kind: 'house', tx: 20, ty: 30 },
      { id: 'fdoorC_east', kind: 'house', tx: 44, ty: 30 },
      { id: 'fdoorD_north', kind: 'house', tx: 60, ty: 24 },
      { id: 'fdoorE_south', kind: 'house', tx: 60, ty: 16 },
      { id: 'fdoorD_south', kind: 'house', tx: 60, ty: 36 },
      { id: 'fdoorG', kind: 'house', tx: 60, ty: 44 }
    ],
    enemies: [
      { kind: 'fireBat', tx: 8, ty: 8 },
      { kind: 'cinderArcher', tx: 16, ty: 12 },
      { kind: 'magmaGolem', tx: 8, ty: 32 },
      { kind: 'cinderArcher', tx: 17, ty: 27 },
      { kind: 'fireBat', tx: 34, ty: 27 },
      { kind: 'magmaGolem', tx: 40, ty: 33 },
      { kind: 'cinderArcher', tx: 55, ty: 26 },
      { kind: 'cinderArcher', tx: 66, ty: 34 },
      { kind: 'fireBat', tx: 60, ty: 31 },
      { kind: 'magmaGolem', tx: 56, ty: 8 },
      { kind: 'fireBat', tx: 64, ty: 13 },
      { kind: 'cinderArcher', tx: 63, ty: 7 }
    ],
    destructibles: [
      { id: 'fpot_1', kind: 'pot', tx: 6, ty: 14, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'fpot_2', kind: 'pot', tx: 18, ty: 12, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'fpot_3', kind: 'pot', tx: 5, ty: 34, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'fpot_4', kind: 'pot', tx: 18, ty: 25, drops: [{ type: 'mana', min: 10, max: 10 }] },
      { id: 'fpot_5', kind: 'pot', tx: 33, ty: 33, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'fpot_6', kind: 'pot', tx: 42, ty: 26, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'fpot_7', kind: 'pot', tx: 55, ty: 33, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'fpot_8', kind: 'pot', tx: 66, ty: 34, drops: [{ type: 'item', item: 'potion', min: 1, max: 1 }] },
      { id: 'fcrate_1', kind: 'crate', tx: 19, ty: 5, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'fcrate_2', kind: 'crate', tx: 30, ty: 34, drops: [{ type: 'item', item: 'ether', min: 1, max: 1 }] },
      { id: 'fweb_1', kind: 'web', tx: 56, ty: 8, drops: [] },
      { id: 'fweb_2', kind: 'web', tx: 62, ty: 12, drops: [{ type: 'gold', min: 2, max: 4 }] }
    ],
    chests: [
      { id: 'fchest_a', tx: 18, ty: 14, locked: false, contents: [{ item: 'potion', count: 1 }, { gold: 30 }] },
      { id: 'fchest_relic', tx: 6, ty: 26, locked: false, contents: [{ relic: 'frostAegis' }, { gold: 100 }] },
      { id: 'fchest_c', tx: 33, ty: 35, locked: false, contents: [{ gold: 80 }, { item: 'ether', count: 1 }] },
      { id: 'fchest_e', tx: 66, ty: 6, locked: false, contents: [{ gold: 120 }, { item: 'bossShard', count: 1 }] }
    ],
    bossZone: {
      x: 45 * 16,
      y: 45 * 16,
      w: 23 * 16,
      h: 11 * 16,
      kind: 'ignis',
      name: 'IGNIS THE FORGEMASTER',
      doorIds: ['fdoorG']
    }
  });
}
