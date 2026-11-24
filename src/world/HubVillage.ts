import { LayerBuilder, GameMap, buildMap, LightDef } from './MapData';
import { RNG } from '../types';

export const HUB_W = 48;
export const HUB_H = 36;

function house(walls: LayerBuilder, ground: LayerBuilder, x: number, y: number): { doorX: number; doorY: number } {
  ground.rect(x, y, 7, 6, 'w');
  walls.rect(x, y, 7, 2, 'R');
  walls.rect(x, y + 2, 7, 3, 'H');
  walls.rect(x, y + 5, 3, 1, 'H');
  walls.rect(x + 4, y + 5, 3, 1, 'H');
  return { doorX: x + 3, doorY: y + 5 };
}

export function hubVillage(): GameMap {
  const ground = new LayerBuilder(HUB_W, HUB_H, 'g');
  const walls = new LayerBuilder(HUB_W, HUB_H, '.');
  const decor = new LayerBuilder(HUB_W, HUB_H, '.');
  const canopy = new LayerBuilder(HUB_W, HUB_H, '.');
  const rng = new RNG(20240517);

  walls.hline(0, HUB_W - 1, 0, 'T');
  walls.hline(0, HUB_W - 1, HUB_H - 1, 'T');
  walls.vline(0, 0, HUB_H - 1, 'T');
  walls.vline(HUB_W - 1, 0, HUB_H - 1, 'T');
  canopy.hline(0, HUB_W - 1, 0, 'C');
  canopy.hline(0, HUB_W - 1, HUB_H - 1, 'C');
  canopy.vline(0, 0, HUB_H - 1, 'C');
  canopy.vline(HUB_W - 1, 0, HUB_H - 1, 'C');

  const gates = [
    { x: 24, y: 0 },
    { x: 24, y: HUB_H - 1 },
    { x: 0, y: 18 },
    { x: HUB_W - 1, y: 18 }
  ];
  for (const g of gates) {
    walls.set(g.x, g.y, '.');
    canopy.set(g.x, g.y, '.');
  }

  ground.rect(20, 14, 9, 9, 's');
  ground.rect(23, 1, 3, 13, 'd');
  ground.rect(23, 23, 3, 12, 'd');
  ground.rect(29, 17, 18, 3, 'd');
  ground.rect(1, 17, 19, 3, 'd');
  ground.rect(8, 10, 3, 7, 'd');
  ground.rect(37, 10, 3, 7, 'd');
  ground.rect(37, 20, 3, 11, 'd');
  ground.rect(8, 20, 3, 8, 'd');
  ground.rect(15, 20, 2, 10, 'd');
  ground.rect(2, 30, 7, 4, '~');

  for (let i = 0; i < 90; i++) {
    const x = rng.int(1, HUB_W - 2);
    const y = rng.int(1, HUB_H - 2);
    if (ground.get(x, y) === 'g' && rng.chance(0.5)) ground.set(x, y, 'G');
  }

  const elder = house(walls, ground, 5, 4);
  const smith = house(walls, ground, 35, 4);
  const alch = house(walls, ground, 35, 26);
  const carto = house(walls, ground, 5, 24);
  const lore = house(walls, ground, 14, 26);

  const lanternTiles = [
    [20, 14], [28, 14], [20, 22], [28, 22],
    [22, 6], [26, 29], [12, 16], [12, 20], [36, 16], [36, 20]
  ];
  for (const [x, y] of lanternTiles) walls.set(x, y, 'L');

  walls.hline(1, 9, 29, 'F');
  walls.vline(9, 29, 33, 'F');
  walls.hline(30, 34, 27, 'F');
  walls.hline(30, 34, 32, 'F');
  walls.vline(30, 27, 32, 'F');
  walls.vline(34, 27, 32, 'F');

  const trees: [number, number][] = [
    [15, 5], [15, 12], [20, 5], [28, 5], [20, 30], [28, 30],
    [33, 12], [44, 12], [44, 24], [3, 12], [21, 8], [27, 8], [13, 15], [42, 22]
  ];
  for (const [x, y] of trees) {
    walls.set(x, y, 'T');
    canopy.set(x, y, 'C');
  }
  const rocks: [number, number][] = [
    [17, 22], [30, 13], [43, 22], [6, 20], [40, 15], [31, 24]
  ];
  for (const [x, y] of rocks) walls.set(x, y, 'r');

  for (let i = 0; i < 40; i++) {
    const x = rng.int(1, HUB_W - 2);
    const y = rng.int(1, HUB_H - 2);
    const g = ground.get(x, y);
    if ((g === 'g' || g === 'G') && decor.get(x, y) === '.') {
      const r = rng.next();
      if (r < 0.5) decor.set(x, y, 'f');
      else if (r < 0.85) decor.set(x, y, 't');
      else decor.set(x, y, 'e');
    }
  }

  const lights: LightDef[] = [
    { tx: 24, ty: 18, r: 64, color: '#ff9a2e', flicker: 0.35 },
    ...lanternTiles.map(([tx, ty]) => ({ tx, ty, r: 38, color: '#ffd76a', flicker: 0.2 })),
    { tx: elder.doorX, ty: elder.doorY, r: 26, color: '#ffcf7a', flicker: 0.12 },
    { tx: smith.doorX, ty: smith.doorY, r: 26, color: '#ffcf7a', flicker: 0.12 },
    { tx: alch.doorX, ty: alch.doorY, r: 26, color: '#ffcf7a', flicker: 0.12 },
    { tx: carto.doorX, ty: carto.doorY, r: 26, color: '#ffcf7a', flicker: 0.12 },
    { tx: lore.doorX, ty: lore.doorY, r: 26, color: '#b08ae0', flicker: 0.12 }
  ];

  return buildMap({
    id: 'hub',
    name: 'Emberhold Village',
    w: HUB_W,
    h: HUB_H,
    ground,
    walls,
    decor,
    canopy,
    solidChars: 'TWHrRFL~',
    lights,
    ambient: 0.6,
    music: 'hub',
    spawn: { tx: 24, ty: 21 },
    campfire: { tx: 24, ty: 18 },
    npcs: [
      { id: 'elder', name: 'Elder Rowan', tx: 8, ty: 7, charId: 'elder', tree: 'elder' },
      { id: 'smith', name: 'Bram the Smith', tx: 38, ty: 12, charId: 'smith', tree: 'smith' },
      { id: 'alch', name: 'Mira the Alchemist', tx: 37, ty: 24, charId: 'alchemist', tree: 'alch' },
      { id: 'carto', name: 'Ilya the Cartographer', tx: 12, ty: 27, charId: 'carto', tree: 'carto', roam: true },
      { id: 'lore', name: 'Lorekeeper Vesper', tx: 16, ty: 29, charId: 'lore', tree: 'lore' }
    ],
    destructibles: [
      { id: 'dummy', kind: 'dummy', tx: 30, ty: 16, drops: [{ type: 'gold', min: 2, max: 4 }], respawn: 6 },
      { id: 'pot_1', kind: 'pot', tx: 22, ty: 12, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'pot_2', kind: 'pot', tx: 26, ty: 24, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'pot_key', kind: 'pot', tx: 5, ty: 23, drops: [{ type: 'item', item: 'rustyKey', min: 1, max: 1 }] },
      { id: 'pot_map', kind: 'pot', tx: 44, ty: 31, drops: [{ type: 'item', item: 'mapPage', min: 1, max: 1 }] },
      { id: 'pot_3', kind: 'pot', tx: 33, ty: 24, drops: [{ type: 'gold', min: 1, max: 4 }] },
      { id: 'pot_4', kind: 'pot', tx: 19, ty: 25, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'crate_1', kind: 'crate', tx: 43, ty: 11, drops: [{ type: 'gold', min: 2, max: 5 }] },
      { id: 'crate_2', kind: 'crate', tx: 44, ty: 12, drops: [{ type: 'gold', min: 2, max: 5 }] },
      { id: 'crate_3', kind: 'crate', tx: 43, ty: 13, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'crate_4', kind: 'crate', tx: 36, ty: 14, drops: [{ type: 'gold', min: 2, max: 4 }] },
      { id: 'bush_1', kind: 'bush', tx: 11, ty: 14, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'bush_2', kind: 'bush', tx: 31, ty: 15, drops: [{ type: 'gold', min: 1, max: 2 }] },
      { id: 'bush_3', kind: 'bush', tx: 41, ty: 27, drops: [{ type: 'heart', min: 8, max: 8 }] },
      { id: 'bush_4', kind: 'bush', tx: 26, ty: 28, drops: [{ type: 'gold', min: 1, max: 3 }] },
      { id: 'herb_1', kind: 'bushGlow', tx: 31, ty: 29, drops: [{ type: 'item', item: 'moonherb', min: 1, max: 1 }] },
      { id: 'herb_2', kind: 'bushGlow', tx: 32, ty: 30, drops: [{ type: 'item', item: 'moonherb', min: 1, max: 1 }] },
      { id: 'herb_3', kind: 'bushGlow', tx: 33, ty: 28, drops: [{ type: 'item', item: 'moonherb', min: 1, max: 1 }] },
      { id: 'herb_4', kind: 'bushGlow', tx: 30, ty: 31, drops: [{ type: 'item', item: 'moonherb', min: 1, max: 1 }, { type: 'heart', min: 8, max: 8 }] }
    ],
    chests: [
      { id: 'chest_locked', tx: 4, ty: 28, locked: true, contents: [{ gold: 60 }, { item: 'potion', count: 1 }] },
      { id: 'chest_plain', tx: 45, ty: 15, locked: false, contents: [{ gold: 40 }, { item: 'ether', count: 1 }] }
    ],
    doors: [
      { id: 'door_elder', kind: 'house', tx: elder.doorX, ty: elder.doorY },
      { id: 'door_smith', kind: 'house', tx: smith.doorX, ty: smith.doorY },
      { id: 'door_alch', kind: 'house', tx: alch.doorX, ty: alch.doorY },
      { id: 'door_carto', kind: 'house', tx: carto.doorX, ty: carto.doorY },
      { id: 'door_lore', kind: 'house', tx: lore.doorX, ty: lore.doorY },
      { id: 'gate_n', kind: 'gate', tx: 24, ty: 0, requireFlag: 'metElder', questFlag: 'gate_woods', lockedText: 'A violet ward seals the north path. Only the Elder\'s blessing can lift it.' },
      { id: 'gate_s', kind: 'gate', tx: 24, ty: HUB_H - 1, requireFlag: 'boss_ignis', questFlag: 'gate_spire', lockedText: 'The Ashen Spire is sealed by the Hollow King himself. Only the Forgemaster\'s fall can open it.' },
      { id: 'gate_e', kind: 'gate', tx: HUB_W - 1, ty: 18, requireFlag: 'boss_brambleheart', questFlag: 'gate_marshes', lockedText: 'A drowned ward seals the east path. Only a guardian\'s fall can break it.' },
      { id: 'gate_w', kind: 'gate', tx: 0, ty: 18, requireFlag: 'boss_warden', questFlag: 'gate_wastes', lockedText: 'A burning ward seals the west path. Only the Drowned Warden\'s fall can quench it.' }
    ],
    signs: [
      { tx: 26, ty: 20, lines: ['EMBERHOLD VILLAGE', 'The last warm hearth in a dying land.', 'Rest at the campfire to save your journey.'] },
      { tx: 22, ty: 2, lines: ['NORTH: WHISPERING WOODS', 'Sealed by the Hollow King\'s ward.'] },
      { tx: 45, ty: 18, lines: ['EAST: SUNKEN MARSHES', 'Sealed by a drowned ward.'] },
      { tx: 22, ty: 33, lines: ['SOUTH: THE ASHEN SPIRE', 'Where the Ashen Crown waits. Sealed.'] },
      { tx: 2, ty: 18, lines: ['WEST: SCORCHED WASTES', 'Sealed by a burning ward.'] }
    ],
    exits: [
      { x: 23 * 16, y: -6, w: 3 * 16, h: 12, to: 'biome_woods', spawnTx: 24, spawnTy: 3, requireFlag: 'gate_woods', lockedText: 'A violet ward seals the north path.' },
      { x: HUB_W * 16 - 6, y: 17 * 16, w: 12, h: 3 * 16, to: 'biome_marshes', spawnTx: 4, spawnTy: 18, requireFlag: 'gate_marshes', lockedText: 'A drowned ward seals the east path.' },
      { x: -6, y: 17 * 16, w: 12, h: 3 * 16, to: 'biome_wastes', spawnTx: 92, spawnTy: 18, requireFlag: 'gate_wastes', lockedText: 'A burning ward seals the west path.' },
      { x: 23 * 16, y: HUB_H * 16 - 6, w: 3 * 16, h: 12, to: 'biome_spire', spawnTx: 12, spawnTy: 34, requireFlag: 'gate_spire', lockedText: 'The Ashen Spire is sealed by the Hollow King.' }
    ]
  });
}
