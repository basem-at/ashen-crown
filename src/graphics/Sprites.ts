import { Dir, RNG } from '../types';
import { makeSprite, Palette, flipX, rotate90, drawSprite } from './PixelArt';

const R = (...segs: [string, number][]): string => segs.map(([c, n]) => c.repeat(n)).join('');

function scatter(base: string, spots: [string, number][], seed: number, pal: Palette, w = 16, h = 16): HTMLCanvasElement {
  const rng = new RNG(seed);
  const rows: string[] = [];
  for (let y = 0; y < h; y++) {
    let row = '';
    for (let x = 0; x < w; x++) row += base;
    rows.push(row);
  }
  const cells = rows.map((r) => r.split(''));
  for (const [ch, n] of spots) {
    for (let i = 0; i < n; i++) cells[rng.int(0, h - 1)][rng.int(0, w - 1)] = ch;
  }
  return makeSprite(cells.map((r) => r.join('')), pal, w, h);
}

const PAL_GRASS: Palette = { g: '#4d8f3f', d: '#3d7432', l: '#67b04f', o: '#2c5524' };
const PAL_DIRT: Palette = { b: '#8a6844', d: '#6f5233', l: '#a07c52', o: '#54402a' };
const PAL_PATH: Palette = { b: '#b09468', d: '#8f7350', l: '#c9ad7e', o: '#6e5638' };
const PAL_STONE: Palette = { b: '#8d8d99', d: '#6e6e7a', l: '#a9a9b8', o: '#4c4c58' };
const PAL_WOOD: Palette = { w: '#9a6b3f', o: '#5f4126', d: '#7a5230', l: '#b3854f' };
const PAL_WALL: Palette = { b: '#7d7d8a', o: '#4a4a55', l: '#9a9aa8', d: '#63636e' };
const PAL_ROOF: Palette = { r: '#a8402f', d: '#7c2c20', o: '#54201a', l: '#c65a42' };
const PAL_LEAF: Palette = { f: '#2f7a33', o: '#1d4d20', l: '#4aa04a', d: '#245f27' };
const PAL_TRUNK: Palette = { t: '#6e4a2a', o: '#40281a', d: '#54381f' };
const PAL_ROCK: Palette = { r: '#8a8a94', o: '#55555f', l: '#a8a8b2', d: '#6a6a74' };
const PAL_WATER: Palette = { w: '#2e5fb0', l: '#63a8e8', d: '#1e4488', o: '#163264' };
const PAL_METAL: Palette = { m: '#8a93a6', o: '#3c414e', l: '#c3cadb', y: '#ffd76a' };
const PAL_FIRE: Palette = { o: '#4c4c58', s: '#7a7a88', f: '#ff9a2e', y: '#ffd76a', r: '#e04a2e' };

function tileRows(rows: string[], pal: Palette): HTMLCanvasElement {
  return makeSprite(rows, pal, 16, 16);
}

function buildTiles(): Record<string, HTMLCanvasElement> {
  const t: Record<string, HTMLCanvasElement> = {};
  t['g'] = scatter('g', [['d', 10], ['l', 6]], 101, PAL_GRASS);
  t['G'] = scatter('g', [['d', 16], ['o', 3]], 202, PAL_GRASS);
  t['d'] = scatter('b', [['d', 12], ['l', 6]], 303, PAL_DIRT);
  t['p'] = scatter('b', [['d', 10], ['l', 8]], 404, PAL_PATH);
  t['s'] = scatter('b', [['d', 8], ['l', 5], ['o', 2]], 505, PAL_STONE);
  t['c'] = scatter('b', [['d', 10], ['l', 4]], 606, { b: '#7a6a58', d: '#5f5142', l: '#968467', o: '#463b2e' });
  const plank = R(['w', 3], ['o', 1], ['w', 3], ['o', 1], ['w', 3], ['o', 1], ['w', 4]);
  const plankB = R(['w', 1], ['o', 1], ['w', 4], ['o', 1], ['w', 3], ['o', 1], ['w', 4]);
  const seam = R(['o', 16]);
  t['w'] = tileRows([plank, plankB, plank, seam, plankB, plank, plankB, seam, plank, plankB, plank, seam, plankB, plank, plankB, seam], PAL_WOOD);
  const brickA = R(['o', 1], ['b', 6], ['o', 1], ['b', 7], ['o', 1]);
  const brickB = R(['b', 3], ['o', 1], ['b', 6], ['o', 1], ['b', 5]);
  t['W'] = tileRows([brickA, brickA, seam, brickB, brickB, seam, brickA, brickA, seam, brickB, brickB, seam, brickA, brickA, seam, R(['o', 16])], PAL_WALL);
  const wallV = R(['o', 1], ['b', 3], ['o', 1], ['b', 3], ['o', 1], ['b', 3], ['o', 1], ['b', 4]);
  t['H'] = tileRows(Array.from({ length: 16 }, (_, i) => (i % 4 === 3 ? seam : wallV)), PAL_WALL);
  const shA = R(['r', 4], ['d', 2], ['r', 4], ['d', 2], ['r', 4]);
  const shB = R(['d', 2], ['r', 4], ['d', 2], ['r', 4], ['d', 2]);
  t['R'] = tileRows([shA, shA, shB, shB, shA, shA, shB, shB, shA, shA, shB, shB, shA, shA, shB, R(['o', 16])], PAL_ROOF);
  t['r'] = tileRows([R(['.', 4], ['o', 8], ['.', 4]), R(['.', 2], ['o', 12], ['.', 2]), R(['o', 16]), R(['o', 1], ['r', 14], ['o', 1]), R(['o', 1], ['r', 3], ['l', 2], ['r', 3], ['d', 2], ['r', 2], ['o', 1]), R(['o', 1], ['r', 14], ['o', 1]), R(['o', 1], ['r', 2], ['d', 3], ['r', 4], ['l', 2], ['r', 3], ['o', 1]), R(['o', 1], ['r', 14], ['o', 1]), R(['o', 1], ['r', 14], ['o', 1]), R(['o', 1], ['r', 5], ['l', 2], ['r', 6], ['d', 1], ['o', 1]), R(['o', 1], ['r', 14], ['o', 1]), R(['o', 1], ['r', 14], ['o', 1]), R(['.', 1], ['o', 14], ['.', 1]), R(['.', 3], ['o', 10], ['.', 3]), R(['.', 5], ['o', 6], ['.', 5])], PAL_ROCK);
  const trunk = R(['.', 5], ['o', 1], ['t', 4], ['o', 1], ['.', 5]);
  const trunkD = R(['.', 5], ['o', 1], ['t', 1], ['d', 2], ['t', 1], ['o', 1], ['.', 5]);
  t['T'] = tileRows([trunk, trunkD, trunk, trunkD, trunk, trunk, trunkD, trunk, trunk, trunkD, trunk, trunk, trunkD, trunk, trunk, R(['.', 4], ['o', 8], ['.', 4])], PAL_TRUNK);
  const canRows: string[] = [];
  canRows.push(R(['.', 3], ['o', 10], ['.', 3]));
  canRows.push(R(['.', 1], ['o', 14], ['.', 1]));
  canRows.push(R(['o', 1], ['f', 3], ['l', 2], ['f', 3], ['d', 2], ['f', 2], ['l', 2], ['o', 1]));
  for (let i = 0; i < 10; i++) {
    const rng = new RNG(900 + i);
    let inner = '';
    for (let x = 0; x < 14; x++) inner += rng.pick(['f', 'f', 'f', 'l', 'd']);
    canRows.push('o' + inner + 'o');
  }
  canRows.push(R(['.', 1], ['o', 14], ['.', 1]));
  canRows.push(R(['.', 3], ['o', 10], ['.', 3]));
  canRows.push(R(['.', 5], ['o', 6], ['.', 5]));
  t['C'] = tileRows(canRows, PAL_LEAF);
  t['C2'] = tileRows(canRows.map((r) => r), { f: '#276b2c', o: '#17401b', l: '#3f8f3e', d: '#1e5223' });
  const fencePost = R(['.', 5], ['o', 1], ['w', 4], ['o', 1], ['.', 5]);
  const fenceRail = R(['o', 1], ['w', 14], ['o', 1]);
  t['F'] = tileRows([fencePost, fencePost, fenceRail, fencePost, fenceRail, fencePost, fencePost, fencePost, fencePost, fencePost, fencePost, fencePost, fencePost, fencePost, fencePost, fencePost], PAL_WOOD);
  t['~'] = scatter('w', [['l', 7], ['d', 3]], 707, PAL_WATER);
  t['~2'] = scatter('w', [['l', 7], ['d', 3]], 708, PAL_WATER);
  const brA = R(['o', 1], ['w', 3], ['o', 1], ['w', 3], ['o', 1], ['w', 3], ['o', 1], ['w', 2]);
  t['b'] = tileRows([brA, brA, brA, brA, brA, brA, brA, brA, R(['.', 16]), R(['.', 16]), R(['.', 16]), R(['.', 16]), R(['.', 16]), R(['.', 16]), R(['.', 16]), R(['.', 16])], PAL_WOOD);
  const lampTop = R(['.', 6], ['o', 4], ['.', 6]);
  const lampGlow = R(['.', 5], ['o', 1], ['y', 4], ['o', 1], ['.', 5]);
  const post = R(['.', 7], ['o', 1], ['m', 1], ['o', 1], ['.', 7]);
  t['L'] = tileRows([lampTop, lampGlow, lampGlow, lampTop, post, post, post, post, post, post, post, post, post, post, R(['.', 6], ['o', 4], ['.', 6]), R(['.', 5], ['o', 6], ['.', 5])], PAL_METAL);
  t['f'] = scatter('g', [['d', 8]], 111, PAL_GRASS);
  const fl: string[] = [];
  const frng = new RNG(112);
  for (let y = 0; y < 16; y++) {
    let row = '';
    for (let x = 0; x < 16; x++) row += y >= 10 ? 'g' : '.';
    fl.push(row);
  }
  const fc = fl.map((r) => r.split(''));
  for (let i = 0; i < 5; i++) {
    const x = frng.int(1, 14);
    const y = frng.int(8, 12);
    fc[y][x] = 'P';
    fc[y + 1] && (fc[y + 1][x] = 'S');
  }
  t['U'] = tileRows([trunk, trunkD, trunk, trunkD, trunk, trunk, trunkD, trunk, trunk, trunkD, trunk, trunk, trunkD, trunk, trunk, R(['.', 4], ['o', 8], ['.', 4])], { t: '#4a4038', o: '#241f1a', d: '#38302a' });
  const deadCan: string[] = [];
  deadCan.push(R(['.', 3], ['o', 10], ['.', 3]));
  deadCan.push(R(['.', 1], ['o', 14], ['.', 1]));
  deadCan.push(R(['o', 1], ['v', 3], ['w', 2], ['v', 3], ['b', 2], ['v', 2], ['w', 2], ['o', 1]));
  for (let i = 0; i < 10; i++) {
    const rng = new RNG(950 + i);
    let inner = '';
    for (let x = 0; x < 14; x++) inner += rng.pick(['v', 'v', 'w', 'b']);
    deadCan.push('o' + inner + 'o');
  }
  deadCan.push(R(['.', 1], ['o', 14], ['.', 1]));
  deadCan.push(R(['.', 3], ['o', 10], ['.', 3]));
  deadCan.push(R(['.', 5], ['o', 6], ['.', 5]));
  t['V'] = tileRows(deadCan, { v: '#4a4438', o: '#241f1a', w: '#6a6252', b: '#38322a' });
  t['A'] = scatter('b', [['d', 14], ['l', 6], ['o', 3]], 808, { b: '#4a4440', d: '#3a352f', l: '#5f5850', o: '#2c2823' });
  t['O'] = scatter('b', [['d', 10], ['l', 4]], 809, { b: '#1e1c26', d: '#141218', l: '#4a4258', o: '#0c0a12' });
  t['M'] = scatter('f', [['y', 6], ['r', 5], ['o', 3]], 810, { f: '#e04a1e', y: '#ffd76a', r: '#ff8a2e', o: '#7c1e0a' });
  t['M2'] = scatter('f', [['y', 6], ['r', 5], ['o', 3]], 811, { f: '#e04a1e', y: '#ffd76a', r: '#ff8a2e', o: '#7c1e0a' });
  t['I'] = scatter('i', [['l', 6], ['o', 2]], 812, { i: '#9fd8f0', l: '#eaf8ff', o: '#5a9ac0' });
  t['f'] = makeSprite(fc.map((r) => r.join('')), { g: '#4d8f3f', P: '#e86a9a', S: '#2c5524', d: '#3d7432' }, 16, 16);
  const tuft = scatter('.', [['g', 5], ['l', 2]], 113, PAL_GRASS, 16, 16);
  t['t'] = tuft;
  const peb = scatter('.', [['r', 3], ['l', 1]], 114, PAL_ROCK, 16, 16);
  t['e'] = peb;
  return t;
}

const PAL_HUMAN: Palette = { o: '#1c1c28', s: '#f0c297', h: '#6e4520', e: '#1c1c28', c: '#3f6fb5', t: '#e0b34c', p: '#5b4a33', b: '#33241a', w: '#e6ecf5', g: '#e0b34c', m: '#9aa3b5', r: '#b03a3a' };

function humanoidRows(dir: 'down' | 'up' | 'side', legFrame: 0 | 1): string[] {
  const torso: string[] = [
    R(['.', 2], ['o', 1], ['c', 10], ['o', 1], ['.', 2]),
    R(['.', 1], ['o', 1], ['c', 12], ['o', 1], ['.', 1]),
    R(['.', 1], ['o', 1], ['c', 5], ['t', 2], ['c', 5], ['o', 1], ['.', 1]),
    R(['.', 1], ['o', 1], ['c', 12], ['o', 1], ['.', 1]),
    R(['.', 1], ['o', 1], ['c', 12], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 1], ['c', 10], ['o', 1], ['.', 2]),
    R(['.', 2], ['o', 1], ['t', 10], ['o', 1], ['.', 2]),
    R(['.', 3], ['o', 1], ['p', 8], ['o', 1], ['.', 3])
  ];
  const headDown: string[] = [
    R(['.', 5], ['o', 6], ['.', 5]),
    R(['.', 4], ['o', 1], ['h', 6], ['o', 1], ['.', 4]),
    R(['.', 3], ['o', 1], ['h', 8], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['h', 8], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['h', 1], ['s', 6], ['h', 1], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['h', 1], ['s', 1], ['e', 1], ['s', 2], ['e', 1], ['s', 1], ['h', 1], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['h', 1], ['s', 6], ['h', 1], ['o', 1], ['.', 3]),
    R(['.', 4], ['o', 1], ['s', 6], ['o', 1], ['.', 4])
  ];
  const headUp: string[] = [
    R(['.', 5], ['o', 6], ['.', 5]),
    R(['.', 4], ['o', 1], ['h', 6], ['o', 1], ['.', 4]),
    R(['.', 3], ['o', 1], ['h', 8], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['h', 8], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['h', 8], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['h', 8], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['h', 8], ['o', 1], ['.', 3]),
    R(['.', 4], ['o', 1], ['h', 6], ['o', 1], ['.', 4])
  ];
  const headSide: string[] = [
    R(['.', 6], ['o', 5], ['.', 5]),
    R(['.', 5], ['o', 1], ['h', 5], ['o', 1], ['.', 4]),
    R(['.', 4], ['o', 1], ['h', 7], ['o', 1], ['.', 3]),
    R(['.', 4], ['o', 1], ['h', 7], ['o', 1], ['.', 3]),
    R(['.', 4], ['o', 1], ['h', 2], ['s', 4], ['h', 1], ['o', 1], ['.', 3]),
    R(['.', 4], ['o', 1], ['h', 1], ['s', 3], ['e', 1], ['s', 2], ['o', 1], ['.', 3]),
    R(['.', 4], ['o', 1], ['h', 1], ['s', 6], ['o', 1], ['.', 3]),
    R(['.', 5], ['o', 1], ['s', 4], ['o', 1], ['.', 5])
  ];
  const legsA: string[] = [
    R(['.', 4], ['o', 1], ['p', 2], ['.', 2], ['p', 2], ['o', 1], ['.', 4]),
    R(['.', 4], ['p', 3], ['.', 2], ['p', 3], ['.', 4]),
    R(['.', 4], ['p', 3], ['.', 2], ['p', 3], ['.', 4]),
    R(['.', 4], ['p', 3], ['.', 2], ['p', 3], ['.', 4]),
    R(['.', 4], ['p', 3], ['.', 2], ['p', 3], ['.', 4]),
    R(['.', 4], ['o', 1], ['b', 2], ['.', 2], ['b', 2], ['o', 1], ['.', 4]),
    R(['.', 4], ['b', 3], ['.', 2], ['b', 3], ['.', 4]),
    R(['.', 3], ['o', 1], ['b', 3], ['.', 2], ['b', 3], ['o', 1], ['.', 3])
  ];
  const legsB: string[] = [
    R(['.', 3], ['o', 1], ['p', 2], ['.', 4], ['p', 2], ['o', 1], ['.', 3]),
    R(['.', 3], ['p', 3], ['.', 4], ['p', 3], ['.', 3]),
    R(['.', 2], ['p', 3], ['.', 6], ['p', 3], ['.', 2]),
    R(['.', 2], ['p', 3], ['.', 6], ['p', 3], ['.', 2]),
    R(['.', 1], ['o', 1], ['p', 2], ['.', 8], ['p', 2], ['o', 1], ['.', 1]),
    R(['.', 1], ['o', 1], ['b', 2], ['.', 8], ['b', 2], ['o', 1], ['.', 1]),
    R(['o', 1], ['b', 3], ['.', 8], ['b', 3], ['o', 1]),
    R(['.', 1], ['o', 1], ['b', 2], ['.', 8], ['b', 2], ['o', 1], ['.', 1])
  ];
  const head = dir === 'down' ? headDown : dir === 'up' ? headUp : headSide;
  const legs = legFrame === 0 ? legsA : legsB;
  return [...head, ...torso, ...legs];
}

function deadRows(): string[] {
  const rows: string[] = [];
  for (let i = 0; i < 10; i++) rows.push(R(['.', 16]));
  rows.push(R(['.', 2], ['o', 1], ['h', 4], ['o', 1], ['.', 8]));
  rows.push(R(['.', 2], ['o', 1], ['h', 2], ['s', 2], ['o', 1], ['.', 8]));
  rows.push(R(['.', 2], ['o', 1], ['c', 10], ['o', 1], ['.', 2]));
  rows.push(R(['.', 3], ['o', 1], ['p', 8], ['o', 1], ['.', 3]));
  for (let i = 0; i < 10; i++) rows.push(R(['.', 16]));
  return rows;
}

const SLASH_BASE: Palette = { w: '#eaf4ff', g: '#9fd8ff', o: '#cfe8ff' };

function slashFrames(): HTMLCanvasElement[] {
  const mk = (rows: string[]) => makeSprite(rows, SLASH_BASE, 16, 16);
  const e = R(['.', 16]);
  const f1 = mk([
    e, e, e, e, e, e,
    R(['.', 1], ['o', 1], ['w', 2], ['.', 12]),
    R(['.', 1], ['w', 1], ['g', 2], ['.', 12]),
    R(['.', 2], ['w', 1], ['g', 1], ['.', 12]),
    R(['.', 2], ['g', 2], ['.', 12]),
    R(['.', 3], ['g', 1], ['.', 12]),
    e, e, e
  ]);
  const f2 = mk([
    e, e, e, e,
    R(['.', 4], ['o', 1], ['w', 2], ['.', 9]),
    R(['.', 3], ['w', 1], ['g', 2], ['o', 1], ['w', 1], ['.', 8]),
    R(['.', 2], ['w', 2], ['g', 2], ['.', 10]),
    R(['.', 2], ['g', 3], ['w', 1], ['.', 10]),
    R(['.', 1], ['g', 2], ['w', 2], ['.', 11]),
    R(['.', 1], ['g', 1], ['w', 1], ['.', 13]),
    e, e, e, e, e, e
  ]);
  const f3 = mk([
    e, e, e, e, e,
    R(['.', 9], ['o', 1], ['w', 2], ['.', 4]),
    R(['.', 8], ['w', 1], ['g', 2], ['o', 1], ['w', 1], ['.', 3]),
    R(['.', 8], ['g', 2], ['w', 1], ['.', 5]),
    R(['.', 9], ['g', 2], ['w', 1], ['.', 4]),
    R(['.', 10], ['g', 2], ['.', 4]),
    R(['.', 11], ['g', 1], ['.', 4]),
    e, e, e, e, e, e, e, e, e
  ]);
  return [f1, f2, f3];
}

export interface CharSprites {
  down: HTMLCanvasElement[];
  up: HTMLCanvasElement[];
  side: HTMLCanvasElement[];
  sideLeft: HTMLCanvasElement[];
  dead: HTMLCanvasElement;
  portrait: HTMLCanvasElement;
  slash: Record<Dir, HTMLCanvasElement[]>;
}

function buildChar(pal: Palette, hatRows: string[] | null): CharSprites {
  const mk = (rows: string[]) => makeSprite(rows, pal, 16, 24);
  const applyHat = (cv: HTMLCanvasElement): HTMLCanvasElement => {
    if (!hatRows) return cv;
    const out = document.createElement('canvas');
    out.width = 16;
    out.height = 24;
    const ctx = out.getContext('2d')!;
    ctx.drawImage(cv, 0, 0);
    ctx.drawImage(makeSprite(hatRows, pal, 16, hatRows.length), 0, 0);
    return out;
  };
  const down = [mk(humanoidRows('down', 0)), mk(humanoidRows('down', 1))].map(applyHat);
  const up = [mk(humanoidRows('up', 0)), mk(humanoidRows('up', 1))].map(applyHat);
  const side = [mk(humanoidRows('side', 0)), mk(humanoidRows('side', 1))].map(applyHat);
  const sideLeft = side.map((s) => flipX(s));
  const dead = mk(deadRows());
  const portrait = makeSprite(humanoidRows('down', 0).slice(0, 10), pal, 16, 10);
  if (hatRows) {
    const pctx = portrait.getContext('2d')!;
    pctx.drawImage(makeSprite(hatRows, pal, 16, hatRows.length), 0, 0);
  }
  const base = slashFrames();
  const slash: Record<Dir, HTMLCanvasElement[]> = {
    down: base,
    right: base.map((s) => rotate90(s, 3)),
    up: base.map((s) => rotate90(s, 2)),
    left: base.map((s) => rotate90(s, 1))
  };
  return { down, up, side, sideLeft, dead, portrait, slash };
}

function icon(rows: string[], pal: Palette, s = 8): HTMLCanvasElement {
  return makeSprite(rows, pal, s, s);
}

function buildIcons(): Record<string, HTMLCanvasElement> {
  const I: Record<string, HTMLCanvasElement> = {};
  const o = '#1c1c28';
  I['potion'] = icon([
    R(['.', 3], ['o', 2], ['.', 3]),
    R(['.', 2], ['o', 1], ['w', 2], ['o', 1], ['.', 2]),
    R(['.', 1], ['o', 1], ['w', 4], ['o', 1], ['.', 1]),
    R(['o', 1], ['r', 6], ['o', 1]),
    R(['o', 1], ['r', 4], ['l', 1], ['r', 1], ['o', 1]),
    R(['o', 1], ['r', 6], ['o', 1]),
    R(['o', 8]),
    R(['.', 8])
  ], { o, w: '#cfd8e3', r: '#e04a4a', l: '#ff9a9a' });
  I['ether'] = icon([
    R(['.', 3], ['o', 2], ['.', 3]),
    R(['.', 2], ['o', 1], ['w', 2], ['o', 1], ['.', 2]),
    R(['.', 1], ['o', 1], ['w', 4], ['o', 1], ['.', 1]),
    R(['o', 1], ['b', 6], ['o', 1]),
    R(['o', 1], ['b', 4], ['l', 1], ['b', 1], ['o', 1]),
    R(['o', 1], ['b', 6], ['o', 1]),
    R(['o', 8]),
    R(['.', 8])
  ], { o, w: '#cfd8e3', b: '#4a7ae0', l: '#9ab8ff' });
  I['moonherb'] = icon([
    R(['.', 8]),
    R(['.', 2], ['g', 1], ['P', 2], ['g', 1], ['.', 2]),
    R(['.', 1], ['g', 2], ['P', 1], ['l', 1], ['P', 1], ['g', 1], ['.', 1]),
    R(['.', 2], ['g', 1], ['P', 2], ['g', 1], ['.', 2]),
    R(['.', 3], ['S', 1], ['g', 1], ['.', 3]),
    R(['.', 3], ['S', 1], ['.', 4]),
    R(['.', 3], ['S', 1], ['.', 4]),
    R(['.', 8])
  ], { g: '#2c5524', P: '#b8ff6a', l: '#eaffb0', S: '#3d7432' });
  I['rustyKey'] = icon([
    R(['.', 2], ['o', 2], ['.', 4]),
    R(['.', 1], ['o', 1], ['m', 2], ['o', 1], ['.', 3]),
    R(['.', 1], ['o', 1], ['m', 1], ['o', 1], ['.', 4]),
    R(['.', 1], ['o', 1], ['m', 1], ['.', 5]),
    R(['.', 1], ['o', 1], ['m', 1], ['o', 1], ['m', 1], ['.', 2]),
    R(['.', 3], ['o', 1], ['m', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['m', 1], ['.', 3]),
    R(['.', 8])
  ], { o, m: '#b08a4a' });
  I['mapPage'] = icon([
    R(['o', 8]),
    R(['o', 1], ['p', 6], ['o', 1]),
    R(['o', 1], ['p', 2], ['d', 2], ['p', 2], ['o', 1]),
    R(['o', 1], ['p', 1], ['d', 4], ['p', 1], ['o', 1]),
    R(['o', 1], ['p', 3], ['d', 1], ['p', 2], ['o', 1]),
    R(['o', 1], ['p', 6], ['o', 1]),
    R(['o', 1], ['p', 2], ['d', 2], ['p', 2], ['o', 1]),
    R(['o', 8])
  ], { o, p: '#e8d9a8', d: '#8f6f2f' });
  I['ironShard'] = icon([
    R(['.', 3], ['o', 1], ['.', 4]),
    R(['.', 2], ['o', 1], ['m', 1], ['o', 1], ['.', 3]),
    R(['.', 1], ['o', 1], ['m', 2], ['l', 1], ['o', 1], ['.', 2]),
    R(['.', 1], ['o', 1], ['m', 3], ['o', 1], ['.', 2]),
    R(['.', 2], ['o', 1], ['m', 2], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['m', 1], ['o', 1], ['.', 3]),
    R(['.', 4], ['o', 1], ['.', 3]),
    R(['.', 8])
  ], { o, m: '#9aa3b5', l: '#e6ecf5' });
  I['bossShard'] = icon([
    R(['.', 3], ['o', 1], ['.', 4]),
    R(['.', 2], ['o', 1], ['v', 1], ['o', 1], ['.', 3]),
    R(['.', 1], ['o', 1], ['v', 2], ['l', 1], ['o', 1], ['.', 2]),
    R(['.', 1], ['o', 1], ['v', 3], ['o', 1], ['.', 2]),
    R(['.', 2], ['o', 1], ['v', 2], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['v', 1], ['o', 1], ['.', 3]),
    R(['.', 4], ['o', 1], ['.', 3]),
    R(['.', 8])
  ], { o, v: '#8a4ae0', l: '#d0a8ff' });
  I['coin'] = icon([
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 1], ['o', 1], ['g', 4], ['o', 1], ['.', 1]),
    R(['o', 1], ['g', 2], ['y', 2], ['g', 2], ['o', 1]),
    R(['o', 1], ['g', 1], ['y', 4], ['g', 1], ['o', 1]),
    R(['o', 1], ['g', 2], ['y', 2], ['g', 2], ['o', 1]),
    R(['.', 1], ['o', 1], ['g', 4], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 8])
  ], { o, g: '#d9a441', y: '#ffe89a' });
  I['heart'] = icon([
    R(['.', 8]),
    R(['.', 1], ['r', 2], ['.', 1], ['r', 2], ['.', 1]),
    R(['o', 1], ['r', 6], ['o', 1]),
    R(['o', 1], ['r', 1], ['l', 1], ['r', 3], ['o', 1]),
    R(['.', 1], ['o', 1], ['r', 4], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 1], ['r', 2], ['o', 1], ['.', 2]),
    R(['.', 3], ['o', 2], ['.', 3]),
    R(['.', 8])
  ], { o, r: '#e04a5a', l: '#ff9aa8' });
  I['mana'] = icon([
    R(['.', 3], ['o', 2], ['.', 3]),
    R(['.', 2], ['o', 2], ['b', 2], ['.', 2]),
    R(['.', 1], ['o', 1], ['b', 4], ['o', 1], ['.', 1]),
    R(['o', 1], ['b', 2], ['l', 2], ['b', 2], ['o', 1]),
    R(['.', 1], ['o', 1], ['b', 4], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 8]),
    R(['.', 8])
  ], { o, b: '#4a8ae0', l: '#9ac8ff' });
  const swordPal = (blade: string, hi: string): Palette => ({ o, w: blade, l: hi, g: '#d9a441', m: '#6e4a2a' });
  const sword = (p: Palette) => icon([
    R(['.', 6], ['w', 1], ['.', 1]),
    R(['.', 5], ['w', 2], ['.', 1]),
    R(['.', 4], ['w', 2], ['l', 1], ['.', 1]),
    R(['.', 3], ['w', 2], ['.', 3]),
    R(['.', 2], ['w', 2], ['.', 4]),
    R(['.', 1], ['g', 4], ['.', 3]),
    R(['.', 2], ['m', 2], ['.', 4]),
    R(['.', 3], ['m', 2], ['.', 3])
  ], p);
  I['sword_rusty'] = sword(swordPal('#a8a8b0', '#d0d0d8'));
  I['sword_iron'] = sword(swordPal('#dfe6f0', '#ffffff'));
  I['sword_steel'] = sword(swordPal('#cfe0ff', '#ffffff'));
  I['sword_ember'] = sword(swordPal('#ff9a2e', '#ffe89a'));
  I['sword_crownblade'] = sword(swordPal('#ffd76a', '#fffbe0'));
  const armorPal = (c: string, l: string): Palette => ({ o, c, l, m: '#8a93a6' });
  const armor = (p: Palette) => icon([
    R(['.', 8]),
    R(['.', 1], ['o', 1], ['c', 4], ['o', 1], ['.', 1]),
    R(['o', 1], ['c', 1], ['l', 4], ['c', 1], ['o', 1]),
    R(['o', 1], ['c', 6], ['o', 1]),
    R(['o', 1], ['c', 2], ['m', 2], ['c', 2], ['o', 1]),
    R(['.', 1], ['o', 1], ['c', 4], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 8])
  ], p);
  I['armor_cloth'] = armor(armorPal('#7a6a58', '#9a8a78'));
  I['armor_leather'] = armor(armorPal('#8a5a2e', '#b08a4a'));
  I['armor_ironmail'] = armor(armorPal('#9aa3b5', '#dfe6f0'));
  I['armor_embermail'] = armor(armorPal('#c65a2e', '#ffb060'));
  I['armor_crownplate'] = armor(armorPal('#d9a441', '#fff0a8'));
  I['relicBoots'] = icon([
    R(['.', 1], ['b', 3], ['.', 1], ['b', 3], ['.', 0 + 1 - 1]),
    R(['.', 1], ['b', 3], ['.', 1], ['b', 3], ['.', 1]),
    R(['b', 1], ['b', 2], ['w', 1], ['.', 1], ['b', 2], ['w', 1], ['b', 0]),
    R(['b', 4], ['.', 1], ['b', 4]),
    R(['b', 5], ['.', 1], ['b', 2]),
    R(['w', 2], ['b', 3], ['.', 1], ['b', 2], ['w', 1]),
    R(['.', 8]),
    R(['.', 8])
  ], { o, b: '#4a8ae0', w: '#9ac8ff' });
  I['relicLantern'] = icon([
    R(['.', 3], ['o', 2], ['.', 3]),
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['o', 1], ['m', 2], ['y', 2], ['m', 2], ['o', 1]),
    R(['o', 1], ['m', 1], ['y', 4], ['m', 1], ['o', 1]),
    R(['o', 1], ['m', 2], ['y', 2], ['m', 2], ['o', 1]),
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 3], ['o', 2], ['.', 3]),
    R(['.', 8])
  ], { o, m: '#8a93a6', y: '#ffd76a' });
  I['dungeonKey'] = icon([
    R(['.', 2], ['o', 2], ['.', 4]),
    R(['.', 1], ['o', 1], ['g', 2], ['o', 1], ['.', 3]),
    R(['.', 1], ['o', 1], ['g', 1], ['y', 1], ['o', 1], ['.', 4]),
    R(['.', 1], ['o', 1], ['g', 1], ['.', 5]),
    R(['.', 1], ['o', 1], ['g', 1], ['o', 1], ['g', 1], ['.', 2]),
    R(['.', 3], ['o', 1], ['g', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['g', 1], ['.', 3]),
    R(['.', 8])
  ], { o, g: '#d9a441', y: '#ffe89a' });
  I['relicAegis'] = icon([
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 1], ['o', 1], ['s', 4], ['o', 1], ['.', 1]),
    R(['o', 1], ['s', 2], ['l', 2], ['s', 2], ['o', 1]),
    R(['o', 1], ['s', 4], ['l', 1], ['s', 1], ['o', 1]),
    R(['.', 1], ['o', 1], ['s', 4], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 3], ['o', 2], ['.', 3]),
    R(['.', 8])
  ], { o, s: '#9fd8ff', l: '#eaf8ff' });
  return I;
}

function buildProps(): Record<string, HTMLCanvasElement> {
  const P: Record<string, HTMLCanvasElement> = {};
  const o = '#1c1c28';
  const mk = (rows: string[], pal: Palette) => makeSprite(rows, pal, 16, 16);
  const e = R(['.', 16]);
  P['pot'] = mk([
    e, e, e, e, e,
    R(['.', 5], ['o', 6], ['.', 5]),
    R(['.', 4], ['o', 1], ['r', 6], ['o', 1], ['.', 4]),
    R(['.', 3], ['o', 1], ['r', 8], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['r', 8], ['o', 1], ['.', 3]),
    R(['.', 4], ['o', 1], ['r', 6], ['o', 1], ['.', 4]),
    R(['.', 4], ['o', 1], ['d', 6], ['o', 1], ['.', 4]),
    R(['.', 5], ['o', 6], ['.', 5]),
    e, e, e
  ], { o, r: '#b06a3a', d: '#7c4526' });
  P['crate'] = mk([
    e, e, e, e,
    R(['o', 16]),
    R(['o', 1], ['w', 6], ['o', 1], ['w', 6], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 3], ['o', 2], ['w', 3], ['o', 1], ['w', 3], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 2], ['o', 2], ['w', 4], ['o', 2], ['w', 2], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 16]),
    e, e, e
  ], { o, w: '#9a6b3f' });
  P['bush'] = mk([
    e, e, e, e,
    R(['.', 4], ['o', 8], ['.', 4]),
    R(['.', 2], ['o', 12], ['.', 2]),
    R(['o', 1], ['g', 14], ['o', 1]),
    R(['o', 1], ['g', 3], ['l', 2], ['g', 3], ['d', 2], ['g', 2], ['l', 1], ['o', 1]),
    R(['o', 1], ['g', 14], ['o', 1]),
    R(['o', 1], ['g', 2], ['l', 3], ['g', 4], ['d', 2], ['g', 2], ['o', 1]),
    R(['o', 1], ['g', 14], ['o', 1]),
    R(['o', 1], ['g', 5], ['l', 2], ['g', 6], ['o', 1]),
    R(['.', 1], ['o', 14], ['.', 1]),
    R(['.', 3], ['o', 10], ['.', 3]),
    e, e, e
  ], { o, g: '#2f7a33', l: '#67c04f', d: '#1d4d20' });
  P['bushGlow'] = mk([
    e, e, e, e,
    R(['.', 4], ['o', 8], ['.', 4]),
    R(['.', 2], ['o', 12], ['.', 2]),
    R(['o', 1], ['g', 14], ['o', 1]),
    R(['o', 1], ['g', 3], ['P', 2], ['g', 3], ['l', 2], ['g', 2], ['P', 1], ['o', 1]),
    R(['o', 1], ['g', 14], ['o', 1]),
    R(['o', 1], ['g', 2], ['P', 3], ['g', 4], ['l', 2], ['g', 2], ['o', 1]),
    R(['o', 1], ['g', 14], ['o', 1]),
    R(['o', 1], ['g', 5], ['l', 2], ['g', 6], ['o', 1]),
    R(['.', 1], ['o', 14], ['.', 1]),
    R(['.', 3], ['o', 10], ['.', 3]),
    e, e, e
  ], { o, g: '#3f8f2f', P: '#c8ff5a', l: '#a8e86a', d: '#1d4d20' });
  P['dummy'] = mk([
    e, e, e, e, e, e,
    R(['.', 6], ['o', 4], ['.', 6]),
    R(['.', 5], ['o', 1], ['w', 4], ['o', 1], ['.', 5]),
    R(['.', 5], ['o', 1], ['w', 1], ['r', 2], ['w', 1], ['o', 1], ['.', 5]),
    R(['.', 5], ['o', 1], ['w', 4], ['o', 1], ['.', 5]),
    R(['.', 4], ['o', 1], ['w', 8], ['o', 1], ['.', 4]),
    R(['.', 3], ['o', 10], ['.', 3]),
    R(['.', 5], ['o', 6], ['.', 5]),
    R(['.', 6], ['o', 4], ['.', 6]),
    e, e
  ], { o, w: '#b08a5a', r: '#c03a3a' });
  P['chestClosed'] = mk([
    e, e, e, e, e, e,
    R(['o', 16]),
    R(['o', 1], ['w', 6], ['g', 2], ['w', 6], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 7], ['g', 1], ['w', 6], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 16]),
    e, e, e, e, e
  ], { o, w: '#8a5a2e', g: '#d9a441' });
  P['chestOpen'] = mk([
    e, e, e, e, e, e,
    R(['o', 16]),
    R(['o', 1], ['w', 6], ['g', 2], ['w', 6], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 7], ['g', 1], ['w', 6], ['o', 1]),
    R(['o', 1], ['d', 14], ['o', 1]),
    R(['o', 1], ['d', 14], ['o', 1]),
    R(['o', 16]),
    e, e, e, e, e
  ], { o, w: '#8a5a2e', g: '#d9a441', d: '#2c1c10' });
  const fire = (seed: number) => {
    const rng = new RNG(seed);
    const rows: string[] = [];
    for (let y = 0; y < 16; y++) {
      let row = '';
      for (let x = 0; x < 16; x++) {
        const edge = x < 4 || x > 11 || y > 13;
        if (edge && y > 9) row += rng.chance(0.5) ? 's' : 'o';
        else if (y > 6 && y <= 13 && x >= 5 && x <= 10) row += rng.pick(['f', 'f', 'y', 'r']);
        else row += '.';
      }
      rows.push(row);
    }
    return makeSprite(rows, PAL_FIRE, 16, 16);
  };
  P['campfire0'] = fire(31);
  P['campfire1'] = fire(77);
  P['door'] = mk([
    R(['o', 16]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 3], ['o', 1], ['w', 3], ['o', 1], ['w', 3], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 3], ['o', 1], ['w', 3], ['o', 1], ['w', 3], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 3], ['o', 1], ['w', 3], ['o', 1], ['w', 3], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 6], ['g', 2], ['w', 6], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 1], ['w', 14], ['o', 1]),
    R(['o', 16])
  ], { o, w: '#7a5230', g: '#d9a441' });
  P['doorOpen'] = mk([
    R(['o', 3], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 1], ['w', 2], ['.', 13]),
    R(['o', 16])
  ], { o, w: '#7a5230' });
  const gatePal: Palette = { o: '#14141f', m: '#5a5f7a', v: '#8a4ae0', g: '#d9a441' };
  const gate = makeSprite([
    R(['o', 16]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 2], ['v', 2], ['m', 6], ['v', 2], ['m', 1], ['o', 1]),
    R(['o', 1], ['m', 1], ['v', 4], ['m', 4], ['v', 4], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 3], ['v', 2], ['m', 4], ['v', 2], ['m', 1], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 2], ['g', 2], ['m', 6], ['g', 2], ['m', 1], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 16]),
    R(['o', 16]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 2], ['v', 2], ['m', 6], ['v', 2], ['m', 1], ['o', 1]),
    R(['o', 1], ['m', 1], ['v', 4], ['m', 4], ['v', 4], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 3], ['v', 2], ['m', 4], ['v', 2], ['m', 1], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 2], ['g', 2], ['m', 6], ['g', 2], ['m', 1], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 1], ['m', 14], ['o', 1]),
    R(['o', 16])
  ], gatePal, 16, 32);
  P['gate'] = gate;
  P['sign'] = mk([
    R(['.', 3], ['o', 1], ['w', 8], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 10], ['.', 3]),
    R(['.', 3], ['o', 1], ['w', 8], ['o', 1], ['.', 3]),
    R(['.', 7], ['o', 1], ['w', 1], ['o', 1], ['.', 7]),
    R(['.', 7], ['o', 1], ['w', 1], ['o', 1], ['.', 7]),
    R(['.', 7], ['o', 1], ['w', 1], ['o', 1], ['.', 7]),
    R(['.', 7], ['o', 1], ['w', 1], ['o', 1], ['.', 7]),
    R(['.', 7], ['o', 1], ['w', 1], ['o', 1], ['.', 7]),
    R(['.', 7], ['o', 1], ['w', 1], ['o', 1], ['.', 7]),
    R(['.', 7], ['o', 1], ['w', 1], ['o', 1], ['.', 7]),
    R(['.', 7], ['o', 1], ['w', 1], ['o', 1], ['.', 7]),
    R(['.', 7], ['o', 1], ['w', 1], ['o', 1], ['.', 7]),
    R(['.', 7], ['o', 1], ['w', 1], ['o', 1], ['.', 7]),
    R(['.', 6], ['o', 4], ['.', 6]),
    R(['.', 5], ['o', 6], ['.', 5])
  ], { o, w: '#9a6b3f' });
  P['plateUp'] = mk([
    R(['o', 16]),
    R(['o', 1], ['s', 14], ['o', 1]),
    R(['o', 1], ['s', 2], ['v', 3], ['s', 3], ['v', 3], ['s', 2], ['o', 1]),
    R(['o', 1], ['s', 3], ['v', 2], ['s', 6], ['v', 2], ['s', 1], ['o', 1]),
    R(['o', 1], ['s', 14], ['o', 1]),
    R(['o', 1], ['s', 14], ['o', 1]),
    R(['o', 1], ['s', 14], ['o', 1]),
    R(['o', 1], ['s', 14], ['o', 1]),
    R(['o', 1], ['s', 14], ['o', 1]),
    R(['o', 1], ['s', 14], ['o', 1]),
    R(['o', 1], ['s', 14], ['o', 1]),
    R(['o', 1], ['s', 14], ['o', 1]),
    R(['o', 1], ['s', 2], ['l', 10], ['s', 2], ['o', 1]),
    R(['o', 1], ['s', 14], ['o', 1]),
    R(['o', 16])
  ], { o: '#2c2c38', s: '#6e6e7a', v: '#4a8ae0', l: '#a9a9b8' });
  P['plateDown'] = mk([
    R(['o', 16]),
    R(['o', 1], ['d', 14], ['o', 1]),
    R(['o', 1], ['d', 3], ['v', 3], ['d', 3], ['v', 3], ['d', 2], ['o', 1]),
    R(['o', 1], ['d', 4], ['v', 2], ['d', 6], ['v', 2], ['d', 1], ['o', 1]),
    R(['o', 1], ['d', 14], ['o', 1]),
    R(['o', 1], ['d', 14], ['o', 1]),
    R(['o', 1], ['d', 14], ['o', 1]),
    R(['o', 1], ['d', 14], ['o', 1]),
    R(['o', 1], ['d', 14], ['o', 1]),
    R(['o', 1], ['d', 14], ['o', 1]),
    R(['o', 1], ['d', 14], ['o', 1]),
    R(['o', 1], ['d', 14], ['o', 1]),
    R(['o', 1], ['d', 2], ['v', 10], ['d', 2], ['o', 1]),
    R(['o', 1], ['d', 14], ['o', 1]),
    R(['o', 16])
  ], { o: '#2c2c38', d: '#4c4c58', v: '#6ab0ff' });
  P['block'] = mk([
    R(['o', 16]),
    R(['o', 1], ['r', 14], ['o', 1]),
    R(['o', 1], ['r', 3], ['d', 2], ['r', 3], ['l', 2], ['r', 3], ['o', 1]),
    R(['o', 1], ['r', 14], ['o', 1]),
    R(['o', 1], ['r', 2], ['d', 4], ['r', 2], ['l', 3], ['r', 3], ['o', 1]),
    R(['o', 1], ['r', 14], ['o', 1]),
    R(['o', 1], ['r', 5], ['l', 2], ['r', 3], ['d', 2], ['r', 2], ['o', 1]),
    R(['o', 1], ['r', 14], ['o', 1]),
    R(['o', 1], ['r', 1], ['d', 3], ['r', 6], ['l', 2], ['r', 1], ['o', 1]),
    R(['o', 1], ['r', 14], ['o', 1]),
    R(['o', 1], ['r', 3], ['l', 3], ['r', 4], ['d', 2], ['r', 2], ['o', 1]),
    R(['o', 1], ['r', 14], ['o', 1]),
    R(['o', 1], ['r', 14], ['o', 1]),
    R(['o', 1], ['r', 6], ['d', 2], ['r', 5], ['o', 1]),
    R(['o', 16])
  ], { o: '#2c2c38', r: '#7a6a58', d: '#5f5142', l: '#9a8a78' });
  P['web'] = mk([
    R(['o', 1], ['w', 2], ['.', 2], ['w', 2], ['.', 2], ['w', 2], ['.', 2], ['w', 2], ['o', 1]),
    R(['w', 1], ['.', 1], ['w', 3], ['.', 1], ['w', 1], ['.', 2], ['w', 3], ['.', 1], ['w', 1]),
    R(['.', 2], ['w', 1], ['.', 1], ['w', 2], ['.', 2], ['w', 2], ['.', 1], ['w', 1], ['.', 2]),
    R(['w', 2], ['.', 2], ['w', 1], ['.', 1], ['w', 3], ['.', 1], ['w', 1], ['.', 2], ['w', 1]),
    R(['.', 1], ['w', 3], ['.', 2], ['w', 1], ['.', 1], ['w', 3], ['.', 1], ['w', 1]),
    R(['w', 1], ['.', 1], ['w', 1], ['.', 2], ['w', 2], ['.', 2], ['w', 1], ['.', 1], ['w', 3]),
    R(['.', 2], ['w', 2], ['.', 1], ['w', 3], ['.', 1], ['w', 2], ['.', 2], ['w', 1], ['.', 1]),
    R(['w', 1], ['.', 1], ['w', 1], ['.', 2], ['w', 1], ['.', 1], ['w', 3], ['.', 1], ['w', 1], ['.', 1]),
    R(['.', 1], ['w', 3], ['.', 1], ['w', 1], ['.', 2], ['w', 2], ['.', 1], ['w', 3], ['.', 1]),
    R(['w', 2], ['.', 2], ['w', 2], ['.', 1], ['w', 1], ['.', 1], ['w', 3], ['.', 2]),
    R(['.', 2], ['w', 1], ['.', 1], ['w', 3], ['.', 2], ['w', 1], ['.', 1], ['w', 2], ['.', 1]),
    R(['w', 1], ['.', 1], ['w', 2], ['.', 2], ['w', 2], ['.', 1], ['w', 2], ['.', 2], ['w', 1]),
    R(['.', 2], ['w', 3], ['.', 2], ['w', 1], ['.', 1], ['w', 3], ['.', 2]),
    R(['w', 2], ['.', 2], ['w', 1], ['.', 2], ['w', 2], ['.', 1], ['w', 1], ['.', 2]),
    R(['o', 1], ['w', 2], ['.', 2], ['w', 2], ['.', 2], ['w', 2], ['.', 2], ['w', 2], ['o', 1]),
    R(['.', 16])
  ], { o: '#3a3f4a', w: '#dfe6f0' });
  P['brazier'] = mk([
    e, e, e, e, e, e,
    R(['.', 4], ['o', 8], ['.', 4]),
    R(['.', 3], ['o', 1], ['m', 8], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['m', 8], ['o', 1], ['.', 3]),
    R(['.', 4], ['o', 1], ['m', 6], ['o', 1], ['.', 4]),
    R(['.', 5], ['o', 1], ['m', 4], ['o', 1], ['.', 5]),
    R(['.', 6], ['o', 4], ['.', 6]),
    R(['.', 7], ['o', 2], ['.', 7]),
    e, e, e, e, e
  ], { o: '#2c2c38', m: '#5a5f7a' });
  P['shockwave'] = mk([
    e, e, e, e,
    R(['.', 4], ['o', 8], ['.', 4]),
    R(['.', 2], ['o', 1], ['w', 2], ['g', 4], ['w', 2], ['o', 1], ['.', 2]),
    R(['.', 1], ['o', 1], ['w', 3], ['g', 2], ['w', 3], ['o', 1], ['.', 1]),
    R(['.', 1], ['o', 1], ['w', 12], ['o', 1], ['.', 1]),
    R(['.', 1], ['o', 1], ['w', 3], ['g', 2], ['w', 3], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 1], ['w', 2], ['g', 4], ['w', 2], ['o', 1], ['.', 2]),
    R(['.', 4], ['o', 8], ['.', 4]),
    e, e, e, e, e, e
  ], { o, w: '#eaf4ff', g: '#9fd8ff' });
  return P;
}

export interface SpriteSet {
  tiles: Record<string, HTMLCanvasElement>;
  chars: Record<string, CharSprites>;
  items: Record<string, HTMLCanvasElement>;
  props: Record<string, HTMLCanvasElement>;
}

export function buildSprites(): SpriteSet {
  const hoodElder = [
    R(['.', 4], ['o', 8], ['.', 4]),
    R(['.', 3], ['o', 1], ['c', 8], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['c', 8], ['o', 1], ['.', 3]),
    R(['.', 4], ['o', 1], ['c', 6], ['o', 1], ['.', 4]),
    R(['.', 4], ['o', 1], ['h', 6], ['o', 1], ['.', 4])
  ];
  const bandana = [
    R(['.', 4], ['o', 8], ['.', 4]),
    R(['.', 3], ['o', 1], ['r', 8], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['r', 8], ['o', 1], ['.', 3])
  ];
  const hoodGreen = [
    R(['.', 4], ['o', 8], ['.', 4]),
    R(['.', 3], ['o', 1], ['c', 8], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['c', 8], ['o', 1], ['.', 3]),
    R(['.', 4], ['o', 1], ['c', 6], ['o', 1], ['.', 4])
  ];
  const hatWide = [
    R(['.', 2], ['o', 12], ['.', 2]),
    R(['.', 2], ['o', 1], ['m', 10], ['o', 1], ['.', 2]),
    R(['.', 4], ['o', 1], ['m', 6], ['o', 1], ['.', 4]),
    R(['.', 4], ['o', 1], ['m', 6], ['o', 1], ['.', 4])
  ];
  const circlet = [
    R(['.', 4], ['o', 1], ['g', 6], ['o', 1], ['.', 4]),
    R(['.', 3], ['o', 1], ['g', 8], ['o', 1], ['.', 3]),
    R(['.', 3], ['o', 1], ['g', 8], ['o', 1], ['.', 3])
  ];
  const chars: Record<string, CharSprites> = {};
  chars['player'] = buildChar(PAL_HUMAN, null);
  chars['elder'] = buildChar({ ...PAL_HUMAN, c: '#7a5a9e', h: '#d8d8e8', t: '#b08ae0' }, hoodElder);
  chars['smith'] = buildChar({ ...PAL_HUMAN, c: '#8a5a2e', p: '#5b3a22', h: '#2c2c38', t: '#c03a3a' }, bandana);
  chars['alchemist'] = buildChar({ ...PAL_HUMAN, c: '#2f8f6f', h: '#d9a441', t: '#8ae0c0' }, hoodGreen);
  chars['carto'] = buildChar({ ...PAL_HUMAN, c: '#8f6f2f', h: '#4a3b2f', t: '#e0b34c', p: '#3a3b4a' }, hatWide);
  chars['lore'] = buildChar({ ...PAL_HUMAN, c: '#3a3a5e', h: '#c8c8d8', t: '#8a8ae0' }, circlet);
  return {
    tiles: buildTiles(),
    chars,
    items: buildIcons(),
    props: buildProps()
  };
}

export function drawCharFrame(
  ctx: CanvasRenderingContext2D,
  ch: CharSprites,
  dir: Dir,
  frame: number,
  x: number,
  y: number
): void {
  const set = dir === 'left' ? ch.sideLeft : dir === 'right' ? ch.side : dir === 'up' ? ch.up : ch.down;
  drawSprite(ctx, set[frame % set.length], x, y);
}
