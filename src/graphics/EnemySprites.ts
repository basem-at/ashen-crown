import { RNG } from '../types';
import { makeSprite, Palette } from './PixelArt';

const R = (...segs: [string, number][]): string => segs.map(([c, n]) => c.repeat(n)).join('');

export interface EnemyArt {
  frames: HTMLCanvasElement[];
  attackFrames?: HTMLCanvasElement[];
  w: number;
  h: number;
  yOff: number;
}

function slimeFrame(squash: boolean): HTMLCanvasElement {
  const pal: Palette = { o: '#1d3a1d', g: '#5ab04f', l: '#8ae06a', e: '#10240f', m: '#2c5a2c', w: '#eaffea' };
  const rows: string[] = [];
  if (squash) {
    rows.push(R(['.', 16]));
    rows.push(R(['.', 16]));
    rows.push(R(['.', 16]));
    rows.push(R(['.', 2], ['o', 12], ['.', 2]));
    rows.push(R(['.', 1], ['o', 14], ['.', 1]));
    rows.push(R(['o', 16]));
    rows.push(R(['o', 1], ['g', 3], ['e', 1], ['g', 4], ['e', 1], ['g', 5], ['o', 1]));
    rows.push(R(['o', 1], ['g', 5], ['m', 4], ['g', 5], ['o', 1]));
    rows.push(R(['o', 1], ['g', 2], ['l', 3], ['g', 8], ['o', 1]));
    rows.push(R(['o', 1], ['g', 14], ['o', 1]));
    rows.push(R(['o', 1], ['g', 14], ['o', 1]));
    rows.push(R(['.', 1], ['o', 14], ['.', 1]));
    rows.push(R(['.', 3], ['o', 10], ['.', 3]));
    rows.push(R(['.', 5], ['o', 6], ['.', 5]));
    rows.push(R(['.', 16]));
    rows.push(R(['.', 16]));
  } else {
    rows.push(R(['.', 16]));
    rows.push(R(['.', 4], ['o', 8], ['.', 4]));
    rows.push(R(['.', 2], ['o', 12], ['.', 2]));
    rows.push(R(['.', 1], ['o', 14], ['.', 1]));
    rows.push(R(['o', 1], ['g', 14], ['o', 1]));
    rows.push(R(['o', 1], ['g', 2], ['l', 2], ['g', 8], ['l', 1], ['g', 1], ['o', 1]));
    rows.push(R(['o', 1], ['g', 3], ['e', 1], ['w', 1], ['g', 3], ['w', 1], ['e', 1], ['g', 3], ['o', 1]));
    rows.push(R(['o', 1], ['g', 3], ['e', 1], ['g', 5], ['e', 1], ['g', 3], ['o', 1]));
    rows.push(R(['o', 1], ['g', 14], ['o', 1]));
    rows.push(R(['o', 1], ['g', 5], ['m', 4], ['g', 5], ['o', 1]));
    rows.push(R(['o', 1], ['g', 14], ['o', 1]));
    rows.push(R(['o', 1], ['g', 2], ['l', 4], ['g', 8], ['o', 1]));
    rows.push(R(['o', 1], ['g', 14], ['o', 1]));
    rows.push(R(['.', 1], ['o', 14], ['.', 1]));
    rows.push(R(['.', 2], ['o', 12], ['.', 2]));
    rows.push(R(['.', 4], ['o', 8], ['.', 4]));
    rows.push(R(['.', 16]));
  }
  return makeSprite(rows, pal, 16, 16);
}

function slimeMiniFrame(squash: boolean): HTMLCanvasElement {
  const pal: Palette = { o: '#1d3a1d', g: '#6ac45f', l: '#9af07a', e: '#10240f' };
  const rows: string[] = [];
  if (squash) {
    rows.push(R(['.', 8]));
    rows.push(R(['.', 8]));
    rows.push(R(['o', 8]));
    rows.push(R(['o', 1], ['g', 2], ['e', 1], ['g', 2], ['e', 1], ['o', 1]));
    rows.push(R(['o', 1], ['g', 6], ['o', 1]));
    rows.push(R(['.', 1], ['o', 6], ['.', 1]));
    rows.push(R(['.', 8]));
    rows.push(R(['.', 8]));
  } else {
    rows.push(R(['.', 2], ['o', 4], ['.', 2]));
    rows.push(R(['.', 1], ['o', 6], ['.', 1]));
    rows.push(R(['o', 1], ['g', 6], ['o', 1]));
    rows.push(R(['o', 1], ['g', 1], ['e', 1], ['g', 2], ['e', 1], ['g', 1], ['o', 1]));
    rows.push(R(['o', 1], ['g', 6], ['o', 1]));
    rows.push(R(['.', 1], ['o', 6], ['.', 1]));
    rows.push(R(['.', 2], ['o', 4], ['.', 2]));
    rows.push(R(['.', 8]));
  }
  return makeSprite(rows, pal, 8, 8);
}

function thornSpriteFrame(flutter: boolean): HTMLCanvasElement {
  const pal: Palette = { o: '#14240f', t: '#2f7a33', p: '#8a4ae0', e: '#eaffea', l: '#c8a8ff', s: '#5aa04a' };
  const rows: string[] = [];
  const leafL = flutter ? R(['.', 1], ['o', 1], ['t', 3], ['.', 11]) : R(['.', 2], ['o', 1], ['t', 2], ['.', 11]);
  const leafR = flutter ? R(['.', 11], ['t', 3], ['o', 1], ['.', 1]) : R(['.', 11], ['t', 2], ['o', 1], ['.', 2]);
  rows.push(R(['.', 6], ['o', 4], ['.', 6]));
  rows.push(R(['.', 5], ['o', 1], ['t', 4], ['o', 1], ['.', 5]));
  rows.push(leafL.slice(0, 16));
  rows.push(R(['.', 3], ['o', 1], ['t', 2], ['p', 6], ['t', 2], ['o', 1], ['.', 3]));
  rows.push(R(['.', 2], ['o', 1], ['t', 1], ['p', 10], ['t', 1], ['o', 1], ['.', 2]));
  rows.push(R(['.', 2], ['o', 1], ['t', 1], ['p', 2], ['e', 2], ['p', 2], ['l', 2], ['p', 1], ['t', 1], ['o', 1], ['.', 2]));
  rows.push(R(['.', 2], ['o', 1], ['t', 1], ['p', 10], ['t', 1], ['o', 1], ['.', 2]));
  rows.push(R(['.', 3], ['o', 1], ['p', 1], ['s', 2], ['p', 4], ['s', 2], ['p', 1], ['o', 1], ['.', 3]));
  rows.push(leafR.slice(0, 16));
  rows.push(R(['.', 4], ['o', 1], ['s', 6], ['o', 1], ['.', 4]));
  rows.push(R(['.', 5], ['o', 1], ['s', 4], ['o', 1], ['.', 5]));
  rows.push(R(['.', 6], ['o', 4], ['.', 6]));
  for (let i = 0; i < 4; i++) rows.push(R(['.', 16]));
  return makeSprite(rows, pal, 16, 16);
}

function thornShot(): HTMLCanvasElement {
  const pal: Palette = { o: '#14240f', t: '#4aa04a', l: '#8ae06a' };
  return makeSprite([
    R(['.', 2], ['o', 1], ['t', 2], ['o', 1], ['.', 2]),
    R(['.', 1], ['o', 1], ['t', 4], ['l', 1], ['o', 1], ['.', 1]),
    R(['o', 1], ['t', 5], ['l', 1], ['o', 1]),
    R(['.', 1], ['o', 1], ['t', 4], ['l', 1], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 1], ['t', 2], ['o', 1], ['.', 2]),
    R(['.', 8]), R(['.', 8]), R(['.', 8])
  ], pal, 8, 8);
}

function spore(): HTMLCanvasElement {
  const pal: Palette = { o: '#241033', p: '#b06ae0', l: '#e0c0ff' };
  return makeSprite([
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 1], ['o', 1], ['p', 4], ['o', 1], ['.', 1]),
    R(['o', 1], ['p', 2], ['l', 2], ['p', 2], ['o', 1]),
    R(['.', 1], ['o', 1], ['p', 4], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 8]), R(['.', 8]), R(['.', 8])
  ], pal, 8, 8);
}

function stalkerFrame(lunge: boolean, legAlt: boolean): HTMLCanvasElement {
  const pal: Palette = { o: '#16121f', f: '#3a3444', l: '#5a5266', e: '#ffd76a', n: '#c8cede' };
  const rows: string[] = [];
  const empty = R(['.', 16]);
  rows.push(empty);
  rows.push(R(['.', 8], ['o', 2], ['.', 6]));
  rows.push(R(['.', 7], ['o', 1], ['f', 3], ['o', 1], ['.', 4]));
  rows.push(R(['.', 6], ['o', 1], ['f', 5], ['o', 1], ['.', 3]));
  rows.push(R(['.', 5], ['o', 1], ['f', 2], ['e', 1], ['f', 3], ['o', 1], ['.', 3]));
  rows.push(R(['.', 4], ['o', 1], ['f', 6], ['n', 1], ['o', 1], ['.', 3]));
  if (lunge) {
    rows.push(R(['o', 1], ['f', 8], ['n', 2], ['o', 1], ['.', 3]));
    rows.push(R(['o', 12], ['.', 4]));
    rows.push(R(['o', 1], ['f', 9], ['o', 2], ['.', 4]));
    rows.push(R(['.', 1], ['o', 1], ['f', 8], ['o', 1], ['.', 5]));
    rows.push(R(['.', 2], ['o', 1], ['f', 6], ['o', 1], ['.', 6]));
    rows.push(R(['.', 3], ['o', 1], ['f', 4], ['o', 1], ['.', 7]));
    rows.push(R(['.', 3], ['o', 1], ['f', 1], ['l', 1], ['f', 2], ['o', 1], ['.', 6]));
    rows.push(R(['.', 4], ['o', 1], ['f', 2], ['o', 1], ['.', 9]));
    rows.push(R(['.', 4], ['o', 1], ['f', 2], ['o', 1], ['.', 9]));
    rows.push(R(['.', 5], ['o', 1], ['f', 1], ['o', 1], ['.', 10]));
    rows.push(R(['.', 5], ['o', 1], ['f', 1], ['o', 1], ['.', 10]));
  } else {
    rows.push(R(['o', 1], ['f', 9], ['o', 1], ['.', 5]));
    rows.push(R(['.', 1], ['o', 1], ['f', 8], ['o', 1], ['.', 5]));
    rows.push(R(['.', 2], ['o', 1], ['f', 6], ['o', 1], ['.', 6]));
    rows.push(R(['.', 2], ['o', 1], ['f', 1], ['l', 2], ['f', 3], ['o', 1], ['.', 6]));
    if (legAlt) {
      rows.push(R(['.', 2], ['o', 1], ['f', 2], ['.', 3], ['f', 2], ['o', 1], ['.', 6]));
      rows.push(R(['.', 3], ['f', 2], ['.', 5], ['f', 2], ['.', 4]));
      rows.push(R(['.', 3], ['f', 2], ['.', 5], ['f', 2], ['.', 4]));
      rows.push(R(['.', 4], ['f', 1], ['.', 7], ['f', 1], ['.', 3]));
    } else {
      rows.push(R(['.', 2], ['o', 1], ['f', 2], ['.', 2], ['f', 2], ['o', 1], ['.', 6]));
      rows.push(R(['.', 3], ['f', 2], ['.', 4], ['f', 2], ['.', 4]));
      rows.push(R(['.', 3], ['f', 2], ['.', 4], ['f', 2], ['.', 4]));
      rows.push(R(['.', 4], ['f', 1], ['.', 6], ['f', 1], ['.', 3]));
    }
  }
  while (rows.length < 20) rows.push(empty);
  return makeSprite(rows.slice(0, 20), pal, 16, 20);
}

function brambleFrame(seed: number, phase: number): HTMLCanvasElement {
  const size = 48;
  const rng = new RNG(seed);
  const blobs: { x: number; y: number; r: number }[] = [];
  const n = 8 + phase * 2;
  for (let i = 0; i < n; i++) blobs.push({ x: rng.range(12, 36), y: rng.range(12, 36), r: rng.range(7, 13 - phase) });
  const body: boolean[][] = [];
  const thorn: boolean[][] = [];
  const hi: boolean[][] = [];
  for (let y = 0; y < size; y++) {
    body.push([]);
    thorn.push([]);
    hi.push([]);
    for (let x = 0; x < size; x++) {
      let inside = false;
      let dMin = 1e9;
      for (const b of blobs) {
        const d = Math.hypot(x - b.x, y - b.y);
        if (d < b.r) inside = true;
        if (d < dMin) dMin = d;
      }
      body[y][x] = inside;
      const edge = inside && blobs.some((b) => Math.hypot(x - b.x, y - b.y) > b.r - 2);
      thorn[y][x] = edge && rng.chance(phase >= 2 ? 0.5 : 0.3);
      hi[y][x] = inside && !edge && rng.chance(0.12);
    }
  }
  const pal: Palette = {
    o: '#1c2f14',
    b: phase === 2 ? '#4a3a1a' : phase === 1 ? '#2f5a1e' : '#274d1a',
    l: phase === 2 ? '#8a6a2a' : '#4a8a34',
    t: phase === 2 ? '#c05a2e' : '#6ac04a',
    e: '#ffe89a',
    m: '#5a1a1a',
    c: '#d9a441'
  };
  const rows: string[] = [];
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) {
      if (!body[y][x]) {
        const nearEdge = blobs.some((b) => Math.hypot(x - b.x, y - b.y) < b.r + 1.5);
        row += nearEdge && rng.chance(0.4) ? 't' : '.';
        continue;
      }
      const cx = 24;
      const cy = 26;
      const eyeL = Math.hypot(x - 18, y - 22) < 2.6;
      const eyeR = Math.hypot(x - 30, y - 22) < 2.6;
      const pupilL = Math.hypot(x - 18, y - 22) < 1.1;
      const pupilR = Math.hypot(x - 30, y - 22) < 1.1;
      const mouth = y >= 30 && y <= 32 && Math.abs(x - cx) < 5;
      const crown = y < 10 && (x === 16 || x === 24 || x === 32);
      if (eyeL || eyeR) row += pupilL || pupilR ? 'e' : 'e';
      else if (mouth && body[y + 1] && !body[y + 1][x]) row += 'm';
      else if (mouth) row += 'm';
      else if (crown) row += 'c';
      else if (thorn[y][x]) row += 't';
      else if (hi[y][x]) row += 'l';
      else row += 'b';
    }
    rows.push(row);
  }
  return makeSprite(rows, pal, size, size);
}

function zombieFrame(legAlt: boolean, armsUp: boolean): HTMLCanvasElement {
  const pal: Palette = { o: '#101c10', s: '#7a9a5a', h: '#4a5a3a', c: '#4a3a52', p: '#3a3444', e: '#c0ff60', m: '#2c4a2c' };
  const e = R(['.', 16]);
  const rows: string[] = [];
  rows.push(e);
  rows.push(R(['.', 5], ['o', 6], ['.', 5]));
  rows.push(R(['.', 4], ['o', 1], ['h', 6], ['o', 1], ['.', 4]));
  rows.push(R(['.', 4], ['o', 1], ['h', 6], ['o', 1], ['.', 4]));
  rows.push(R(['.', 4], ['o', 1], ['s', 2], ['e', 2], ['s', 2], ['o', 1], ['.', 4]));
  rows.push(R(['.', 4], ['o', 1], ['s', 6], ['o', 1], ['.', 4]));
  rows.push(R(['.', 4], ['o', 1], ['s', 2], ['m', 2], ['s', 2], ['o', 1], ['.', 4]));
  rows.push(R(['.', 5], ['o', 6], ['.', 5]));
  if (armsUp) {
    rows.push(R(['o', 1], ['s', 2], ['.', 3], ['o', 2], ['.', 3], ['s', 2], ['o', 1]));
    rows.push(R(['o', 1], ['s', 2], ['.', 3], ['c', 2], ['.', 3], ['s', 2], ['o', 1]));
    rows.push(R(['.', 1], ['s', 2], ['.', 4], ['c', 2], ['.', 4], ['s', 2], ['.', 1]));
  } else {
    rows.push(R(['.', 2], ['o', 1], ['s', 2], ['.', 3], ['c', 2], ['.', 3], ['s', 2], ['o', 1], ['.', 2]));
    rows.push(R(['.', 1], ['o', 1], ['s', 3], ['.', 3], ['c', 2], ['.', 3], ['s', 3], ['o', 1], ['.', 1]));
    rows.push(R(['.', 1], ['o', 1], ['s', 3], ['.', 4], ['c', 2], ['.', 4], ['s', 3], ['o', 1], ['.', 1]));
  }
  rows.push(R(['.', 2], ['o', 1], ['c', 10], ['o', 1], ['.', 2]));
  rows.push(R(['.', 2], ['o', 1], ['c', 10], ['o', 1], ['.', 2]));
  rows.push(R(['.', 3], ['o', 1], ['c', 8], ['o', 1], ['.', 3]));
  rows.push(R(['.', 3], ['o', 1], ['p', 8], ['o', 1], ['.', 3]));
  if (legAlt) {
    rows.push(R(['.', 3], ['o', 1], ['p', 2], ['.', 3], ['p', 2], ['o', 1], ['.', 3]));
    rows.push(R(['.', 4], ['p', 2], ['.', 5], ['p', 2], ['.', 3]));
  } else {
    rows.push(R(['.', 3], ['o', 1], ['p', 2], ['.', 2], ['p', 2], ['o', 1], ['.', 3]));
    rows.push(R(['.', 4], ['p', 2], ['.', 4], ['p', 2], ['.', 4]));
  }
  rows.push(R(['.', 4], ['o', 2], ['.', 6], ['o', 2], ['.', 4]));
  rows.push(R(['.', 3], ['o', 3], ['.', 4], ['o', 3], ['.', 3]));
  while (rows.length < 20) rows.push(e);
  return makeSprite(rows.slice(0, 20), pal, 16, 20);
}

function toadFrame(leap: boolean): HTMLCanvasElement {
  const pal: Palette = { o: '#1c2a10', g: '#5a8a3a', l: '#8ac05a', e: '#10240f', b: '#3a5a28', m: '#2c4a1c' };
  const rows: string[] = [];
  if (leap) {
    rows.push(R(['.', 16]));
    rows.push(R(['.', 16]));
    rows.push(R(['.', 2], ['o', 2], ['.', 3], ['o', 2], ['.', 5]));
    rows.push(R(['.', 1], ['o', 1], ['g', 3], ['e', 1], ['g', 1], ['e', 1], ['g', 3], ['o', 1], ['.', 4]));
    rows.push(R(['o', 1], ['g', 14], ['o', 1]));
    rows.push(R(['o', 1], ['g', 2], ['l', 2], ['g', 6], ['l', 2], ['g', 2], ['o', 1]));
    rows.push(R(['o', 1], ['g', 14], ['o', 1]));
    rows.push(R(['o', 1], ['g', 5], ['m', 4], ['g', 5], ['o', 1]));
    rows.push(R(['.', 1], ['o', 14], ['.', 1]));
    rows.push(R(['.', 3], ['o', 10], ['.', 3]));
    for (let i = 0; i < 7; i++) rows.push(R(['.', 16]));
  } else {
    rows.push(R(['.', 16]));
    rows.push(R(['.', 16]));
    rows.push(R(['.', 16]));
    rows.push(R(['.', 16]));
    rows.push(R(['.', 3], ['o', 2], ['.', 5], ['o', 2], ['.', 3]));
    rows.push(R(['.', 2], ['o', 1], ['g', 3], ['e', 1], ['g', 1], ['e', 1], ['g', 3], ['o', 1], ['.', 2]));
    rows.push(R(['.', 1], ['o', 14], ['.', 1]));
    rows.push(R(['o', 1], ['g', 2], ['l', 3], ['g', 6], ['l', 2], ['g', 1], ['o', 1]));
    rows.push(R(['o', 16]));
    rows.push(R(['o', 1], ['g', 5], ['m', 4], ['g', 5], ['o', 1]));
    rows.push(R(['o', 1], ['b', 2], ['g', 8], ['b', 2], ['o', 1]));
    rows.push(R(['.', 1], ['o', 1], ['b', 2], ['.', 6], ['b', 2], ['o', 1], ['.', 1]));
    rows.push(R(['.', 2], ['o', 2], ['.', 8], ['o', 2], ['.', 2]));
    rows.push(R(['.', 16]));
    rows.push(R(['.', 16]));
  }
  return makeSprite(rows, pal, 16, 16);
}

function toadGlob(): HTMLCanvasElement {
  return makeSprite([
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 1], ['o', 1], ['g', 4], ['o', 1], ['.', 1]),
    R(['o', 1], ['g', 2], ['l', 2], ['g', 2], ['o', 1]),
    R(['.', 1], ['o', 1], ['g', 4], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 8]), R(['.', 8]), R(['.', 8])
  ], { o: '#1c2a10', g: '#8ae04a', l: '#d0ffa0' }, 8, 8);
}

function wispFrame(flicker: boolean): HTMLCanvasElement {
  const r = flicker ? 5 : 4;
  const pal: Palette = { o: '#0a1a2a', c: '#8ae0ff', l: '#e0f8ff', t: '#4aa8d8' };
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = '';
    for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x - 8, y - 7);
      if (d < r - 1.5) row += 'c';
      else if (d < r) row += 'l';
      else if (d < r + 1.5 && ((x + y) % 2 === 0 || flicker)) row += 't';
      else row += '.';
    }
    rows.push(row);
  }
  rows.push(R(['.', 7], ['t', 2], ['.', 7]));
  return makeSprite(rows, pal, 16, 16);
}

function wispBolt(): HTMLCanvasElement {
  return makeSprite([
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 1], ['o', 1], ['c', 4], ['o', 1], ['.', 1]),
    R(['o', 1], ['c', 2], ['l', 2], ['c', 2], ['o', 1]),
    R(['.', 1], ['o', 1], ['c', 4], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 8]), R(['.', 8]), R(['.', 8])
  ], { o: '#0a1a2a', c: '#8ae0ff', l: '#eaffff' }, 8, 8);
}

function puddle(): HTMLCanvasElement {
  const pal: Palette = { o: '#1c3a10', g: '#6ac04a', l: '#b0f08a', b: '#8ae06a' };
  const rows: string[] = [];
  const rng = new RNG(31337);
  for (let y = 0; y < 16; y++) {
    let row = '';
    for (let x = 0; x < 16; x++) {
      const d = Math.hypot((x - 8) / 1.6, y - 8);
      if (d < 6.5) row += rng.chance(0.15) ? 'l' : rng.chance(0.2) ? 'b' : 'g';
      else if (d < 7.5) row += 'o';
      else row += '.';
    }
    rows.push(row);
  }
  return makeSprite(rows, pal, 16, 16);
}

function wave(): HTMLCanvasElement {
  return makeSprite([
    R(['.', 8]),
    R(['.', 1], ['o', 2], ['w', 2], ['.', 3]),
    R(['.', 1], ['w', 3], ['l', 1], ['o', 1], ['.', 2]),
    R(['o', 1], ['w', 4], ['l', 1], ['o', 1]),
    R(['o', 1], ['w', 5], ['l', 1], ['o', 1]),
    R(['.', 1], ['o', 1], ['w', 4], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 8])
  ], { o: '#0a2a4a', w: '#4a9ae0', l: '#b0e0ff' }, 8, 8);
}

function wardenFrame(seed: number, phase: number): HTMLCanvasElement {
  const size = 48;
  const rng = new RNG(seed);
  const blobs: { x: number; y: number; r: number }[] = [];
  const n = 8 + phase;
  for (let i = 0; i < n; i++) blobs.push({ x: rng.range(12, 36), y: rng.range(12, 36), r: rng.range(7, 13) });
  const pal: Palette = {
    o: '#0a1a2a',
    b: phase === 2 ? '#3a2a4a' : phase === 1 ? '#1e3a5a' : '#16304a',
    l: phase === 2 ? '#7a5aa8' : '#3a7ac0',
    t: phase === 2 ? '#b08aff' : '#5ab0e0',
    e: '#ffd76a',
    m: '#081020',
    c: '#8ad0ff'
  };
  const rows: string[] = [];
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) {
      let inside = false;
      let edge = false;
      for (const b of blobs) {
        const d = Math.hypot(x - b.x, y - b.y);
        if (d < b.r) inside = true;
        if (d < b.r && d > b.r - 2) edge = true;
      }
      if (!inside) {
        const near = blobs.some((b) => Math.hypot(x - b.x, y - b.y) < b.r + 1.5);
        row += near && rng.chance(0.35) ? 't' : '.';
        continue;
      }
      const eyeL = Math.hypot(x - 18, y - 22) < 2.6;
      const eyeR = Math.hypot(x - 30, y - 22) < 2.6;
      const mouth = y >= 30 && y <= 33 && Math.abs(x - 24) < 6;
      const crown = y < 9 && (x === 15 || x === 24 || x === 33);
      const drip = edge && rng.chance(0.3);
      if (eyeL || eyeR) row += 'e';
      else if (mouth) row += 'm';
      else if (crown) row += 'c';
      else if (drip) row += 't';
      else if (edge && rng.chance(0.15)) row += 'l';
      else row += 'b';
    }
    rows.push(row);
  }
  return makeSprite(rows, pal, size, size);
}

function golemFrame(legAlt: boolean, slam: boolean): HTMLCanvasElement {
  const pal: Palette = { o: '#140c08', r: '#5a4438', l: '#8a6a52', c: '#c05a1e', e: '#ffd76a', m: '#7c2c10' };
  const e = R(['.', 20]);
  const rows: string[] = [];
  rows.push(e);
  rows.push(R(['.', 6], ['o', 8], ['.', 6]));
  rows.push(R(['.', 5], ['o', 1], ['r', 8], ['o', 1], ['.', 5]));
  rows.push(R(['.', 5], ['o', 1], ['r', 2], ['c', 2], ['r', 2], ['e', 1], ['r', 1], ['o', 1], ['.', 5]));
  rows.push(R(['.', 5], ['o', 1], ['r', 8], ['o', 1], ['.', 5]));
  rows.push(R(['.', 5], ['o', 1], ['r', 3], ['m', 2], ['r', 3], ['o', 1], ['.', 5]));
  rows.push(R(['.', 6], ['o', 8], ['.', 6]));
  if (slam) {
    rows.push(R(['o', 1], ['r', 4], ['.', 4], ['r', 4], ['o', 1], ['.', 6]));
    rows.push(R(['o', 2], ['r', 6], ['.', 2], ['r', 6], ['o', 2]));
    rows.push(R(['o', 1], ['r', 8], ['.', 2], ['r', 8], ['o', 1]));
  } else {
    rows.push(R(['.', 1], ['o', 1], ['r', 3], ['.', 3], ['r', 3], ['o', 1], ['.', 7]));
    rows.push(R(['.', 1], ['o', 1], ['r', 4], ['.', 2], ['r', 4], ['o', 1], ['.', 6]));
    rows.push(R(['.', 2], ['o', 1], ['r', 4], ['.', 1], ['r', 4], ['o', 1], ['.', 5]));
  }
  rows.push(R(['.', 2], ['o', 16], ['.', 2]));
  rows.push(R(['.', 3], ['o', 1], ['r', 12], ['o', 1], ['.', 3]));
  rows.push(R(['.', 3], ['o', 1], ['r', 2], ['l', 3], ['r', 4], ['l', 2], ['r', 1], ['o', 1], ['.', 3]));
  rows.push(R(['.', 3], ['o', 1], ['r', 12], ['o', 1], ['.', 3]));
  rows.push(R(['.', 4], ['o', 1], ['r', 10], ['o', 1], ['.', 4]));
  if (legAlt) {
    rows.push(R(['.', 4], ['o', 1], ['r', 3], ['.', 4], ['r', 3], ['o', 1], ['.', 4]));
    rows.push(R(['.', 5], ['r', 3], ['.', 6], ['r', 3], ['.', 3]));
    rows.push(R(['.', 5], ['o', 3], ['.', 6], ['o', 3], ['.', 3]));
  } else {
    rows.push(R(['.', 4], ['o', 1], ['r', 3], ['.', 3], ['r', 3], ['o', 1], ['.', 4]));
    rows.push(R(['.', 5], ['r', 3], ['.', 5], ['r', 3], ['.', 4]));
    rows.push(R(['.', 5], ['o', 3], ['.', 5], ['o', 3], ['.', 4]));
  }
  rows.push(R(['.', 6], ['o', 8], ['.', 6]));
  while (rows.length < 24) rows.push(e);
  return makeSprite(rows.slice(0, 24), pal, 20, 24);
}

function archerFrame(legAlt: boolean, firing: boolean): HTMLCanvasElement {
  const pal: Palette = { o: '#1c1008', c: '#7c3c14', h: '#3a2418', p: '#4a3040', e: '#ffd76a', w: '#e8d9a8', b: '#c05a1e' };
  const e = R(['.', 16]);
  const rows: string[] = [];
  rows.push(e);
  rows.push(R(['.', 5], ['o', 6], ['.', 5]));
  rows.push(R(['.', 4], ['o', 1], ['h', 6], ['o', 1], ['.', 4]));
  rows.push(R(['.', 4], ['o', 1], ['h', 6], ['o', 1], ['.', 4]));
  rows.push(R(['.', 4], ['o', 1], ['s', 6], ['o', 1], ['.', 4]));
  rows.push(R(['.', 4], ['o', 1], ['s', 2], ['e', 2], ['s', 2], ['o', 1], ['.', 4]));
  rows.push(R(['.', 4], ['o', 1], ['s', 6], ['o', 1], ['.', 4]));
  rows.push(R(['.', 5], ['o', 6], ['.', 5]));
  if (firing) {
    rows.push(R(['.', 2], ['o', 1], ['c', 3], ['b', 2], ['w', 2], ['.', 6]));
    rows.push(R(['.', 1], ['o', 1], ['c', 4], ['b', 2], ['w', 3], ['o', 1], ['.', 3]));
    rows.push(R(['.', 2], ['o', 1], ['c', 5], ['b', 2], ['o', 1], ['.', 5]));
  } else {
    rows.push(R(['.', 2], ['o', 1], ['c', 3], ['b', 2], ['.', 7]));
    rows.push(R(['.', 1], ['o', 1], ['c', 4], ['b', 3], ['o', 1], ['.', 4]));
    rows.push(R(['.', 2], ['o', 1], ['c', 5], ['b', 1], ['.', 6]));
  }
  rows.push(R(['.', 2], ['o', 1], ['c', 10], ['o', 1], ['.', 2]));
  rows.push(R(['.', 2], ['o', 1], ['c', 10], ['o', 1], ['.', 2]));
  rows.push(R(['.', 3], ['o', 1], ['c', 8], ['o', 1], ['.', 3]));
  rows.push(R(['.', 3], ['o', 1], ['p', 8], ['o', 1], ['.', 3]));
  if (legAlt) {
    rows.push(R(['.', 3], ['o', 1], ['p', 2], ['.', 3], ['p', 2], ['o', 1], ['.', 3]));
    rows.push(R(['.', 4], ['p', 2], ['.', 5], ['p', 2], ['.', 3]));
  } else {
    rows.push(R(['.', 3], ['o', 1], ['p', 2], ['.', 2], ['p', 2], ['o', 1], ['.', 3]));
    rows.push(R(['.', 4], ['p', 2], ['.', 4], ['p', 2], ['.', 4]));
  }
  rows.push(R(['.', 4], ['o', 2], ['.', 6], ['o', 2], ['.', 4]));
  while (rows.length < 20) rows.push(e);
  return makeSprite(rows.slice(0, 20), pal, 16, 20);
}

function arrow(): HTMLCanvasElement {
  return makeSprite([
    R(['.', 8]),
    R(['.', 1], ['o', 1], ['b', 3], ['.', 3]),
    R(['.', 1], ['o', 1], ['b', 2], ['w', 1], ['.', 4]),
    R(['o', 1], ['b', 5], ['w', 1], ['o', 1]),
    R(['.', 1], ['o', 1], ['b', 2], ['w', 1], ['.', 4]),
    R(['.', 8]), R(['.', 8]), R(['.', 8])
  ], { o: '#1c1008', b: '#c05a1e', w: '#ffd76a' }, 8, 8);
}

function fireball(): HTMLCanvasElement {
  return makeSprite([
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 1], ['o', 1], ['r', 4], ['o', 1], ['.', 1]),
    R(['o', 1], ['r', 2], ['y', 2], ['r', 2], ['o', 1]),
    R(['.', 1], ['o', 1], ['r', 4], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 8]), R(['.', 8]), R(['.', 8])
  ], { o: '#2c0c04', r: '#ff6a1e', y: '#ffd76a' }, 8, 8);
}

function batFrame(swoop: boolean, flap: boolean): HTMLCanvasElement {
  const pal: Palette = { o: '#1c0c14', f: '#4a2438', e: '#ff5a3a', l: '#8a4a68' };
  const rows: string[] = [];
  rows.push(R(['.', 16]));
  const wingL = flap ? R(['o', 4], ['.', 12]) : R(['o', 2], ['f', 1], ['.', 13]);
  const wingR = flap ? R(['.', 12], ['o', 4]) : R(['.', 13], ['f', 1], ['o', 2]);
  rows.push(wingL.slice(0, 16));
  rows.push(R(['.', 3], ['o', 1], ['f', 8], ['o', 1], ['.', 3]));
  rows.push(R(['.', 4], ['o', 1], ['f', 2], ['e', 2], ['f', 2], ['o', 1], ['.', 4]));
  rows.push(R(['.', 4], ['o', 1], ['f', 6], ['o', 1], ['.', 4]));
  rows.push(R(['.', 5], ['o', 1], ['f', 4], ['o', 1], ['.', 5]));
  rows.push(wingR.slice(0, 16));
  rows.push(R(['.', 5], ['o', 6], ['.', 5]));
  for (let i = 0; i < 5; i++) rows.push(R(['.', 16]));
  void swoop;
  return makeSprite(rows, pal, 16, 12);
}

function ignisFrame(seed: number, phase: number): HTMLCanvasElement {
  const size = 48;
  const rng = new RNG(seed);
  const pal: Palette = {
    o: '#1c0a04',
    b: phase === 2 ? '#4a1a10' : phase === 1 ? '#3a1408' : '#2c0e06',
    l: phase === 2 ? '#ff8a2e' : '#e05a1e',
    t: '#ffd76a',
    e: '#fff0c0',
    m: '#5a1004',
    c: '#c0c8d8'
  };
  const rows: string[] = [];
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) {
      const dx = (x - 24) / 13;
      const dy = (y - 26) / 14;
      const d = Math.sqrt(dx * dx + dy * dy);
      const wob = Math.sin(x * 0.5 + seed) * 1.5 + Math.cos(y * 0.4) * 1.5;
      const inside = d + wob * 0.05 < 1;
      if (!inside) {
        row += d < 1.25 && rng.chance(0.3) ? 't' : '.';
        continue;
      }
      const eyeL = Math.hypot(x - 18, y - 22) < 2.6;
      const eyeR = Math.hypot(x - 30, y - 22) < 2.6;
      const mouth = y >= 30 && y <= 33 && Math.abs(x - 24) < 6;
      const helm = y < 12;
      const cracks = rng.chance(0.08) ? 'l' : null;
      if (eyeL || eyeR) row += 'e';
      else if (mouth) row += 'm';
      else if (helm) row += (x === 16 || x === 24 || x === 32) && y < 8 ? 'c' : 'l';
      else if (cracks) row += cracks;
      else row += 'b';
    }
    rows.push(row);
  }
  return makeSprite(rows, pal, size, size);
}


function knightFrame(legAlt: boolean, dash: boolean, slash: boolean): HTMLCanvasElement {
  const pal: Palette = { o: '#0c0c18', a: '#5a6280', l: '#9aa8cc', e: '#8a4ae0', w: '#e6ecf5', g: '#d9a441', p: '#2c3040' };
  const e16 = R(['.', 16]);
  const rows: string[] = [];
  rows.push(e16);
  rows.push(R(['.', 5], ['o', 6], ['.', 5]));
  rows.push(R(['.', 4], ['o', 1], ['a', 6], ['o', 1], ['.', 4]));
  rows.push(R(['.', 4], ['o', 1], ['a', 2], ['g', 2], ['a', 2], ['o', 1], ['.', 4]));
  rows.push(R(['.', 4], ['o', 1], ['a', 2], ['e', 2], ['a', 2], ['o', 1], ['.', 4]));
  rows.push(R(['.', 4], ['o', 1], ['a', 6], ['o', 1], ['.', 4]));
  rows.push(R(['.', 5], ['o', 6], ['.', 5]));
  if (slash) {
    rows.push(R(['.', 1], ['o', 1], ['a', 3], ['w', 4], ['l', 2], ['o', 1], ['.', 4]));
    rows.push(R(['.', 2], ['o', 1], ['a', 4], ['w', 3], ['o', 1], ['.', 5]));
    rows.push(R(['.', 3], ['o', 1], ['a', 5], ['w', 2], ['o', 1], ['.', 4]));
  } else if (dash) {
    rows.push(R(['.', 1], ['o', 1], ['a', 4], ['l', 2], ['.', 8]));
    rows.push(R(['.', 2], ['o', 1], ['a', 5], ['l', 1], ['o', 1], ['.', 5]));
    rows.push(R(['.', 3], ['o', 1], ['a', 6], ['o', 1], ['.', 4]));
  } else {
    rows.push(R(['.', 2], ['o', 1], ['a', 3], ['w', 2], ['.', 7]));
    rows.push(R(['.', 1], ['o', 1], ['a', 4], ['w', 3], ['o', 1], ['.', 4]));
    rows.push(R(['.', 2], ['o', 1], ['a', 5], ['o', 1], ['.', 5]));
  }
  rows.push(R(['.', 2], ['o', 1], ['a', 10], ['o', 1], ['.', 2]));
  rows.push(R(['.', 2], ['o', 1], ['a', 2], ['g', 6], ['a', 2], ['o', 1], ['.', 2]));
  rows.push(R(['.', 3], ['o', 1], ['a', 8], ['o', 1], ['.', 3]));
  rows.push(R(['.', 3], ['o', 1], ['p', 8], ['o', 1], ['.', 3]));
  if (legAlt) {
    rows.push(R(['.', 3], ['o', 1], ['p', 2], ['.', 3], ['p', 2], ['o', 1], ['.', 3]));
    rows.push(R(['.', 4], ['p', 2], ['.', 5], ['p', 2], ['.', 3]));
  } else {
    rows.push(R(['.', 3], ['o', 1], ['p', 2], ['.', 2], ['p', 2], ['o', 1], ['.', 3]));
    rows.push(R(['.', 4], ['p', 2], ['.', 4], ['p', 2], ['.', 4]));
  }
  rows.push(R(['.', 4], ['o', 2], ['.', 6], ['o', 2], ['.', 4]));
  while (rows.length < 24) rows.push(e16);
  return makeSprite(rows.slice(0, 24), pal, 16, 24);
}

function mageFrame(flap: boolean, cast: boolean): HTMLCanvasElement {
  const pal: Palette = { o: '#0c0618', c: '#2c1a4a', l: '#5a3a8a', e: '#b08aff', v: '#e0c8ff', p: '#1c1030' };
  const e16 = R(['.', 16]);
  const rows: string[] = [];
  rows.push(e16);
  rows.push(R(['.', 4], ['o', 8], ['.', 4]));
  rows.push(R(['.', 3], ['o', 1], ['c', 8], ['o', 1], ['.', 3]));
  rows.push(R(['.', 3], ['o', 1], ['c', 8], ['o', 1], ['.', 3]));
  rows.push(R(['.', 4], ['o', 1], ['c', 2], ['e', 2], ['v', 2], ['c', 2], ['o', 1], ['.', 4]));
  rows.push(R(['.', 4], ['o', 1], ['c', 6], ['o', 1], ['.', 4]));
  rows.push(R(['.', 5], ['o', 6], ['.', 5]));
  if (cast) {
    rows.push(R(['.', 1], ['o', 1], ['c', 3], ['v', 3], ['e', 1], ['.', 7]));
    rows.push(R(['.', 2], ['o', 1], ['c', 4], ['v', 2], ['e', 2], ['o', 1], ['.', 4]));
  } else if (flap) {
    rows.push(R(['.', 2], ['o', 1], ['c', 3], ['l', 2], ['.', 8]));
    rows.push(R(['.', 1], ['o', 1], ['c', 4], ['l', 3], ['o', 1], ['.', 5]));
  } else {
    rows.push(R(['.', 2], ['o', 1], ['c', 3], ['l', 2], ['.', 8]));
    rows.push(R(['.', 1], ['o', 1], ['c', 4], ['l', 2], ['o', 1], ['.', 6]));
  }
  rows.push(R(['.', 2], ['o', 1], ['c', 10], ['o', 1], ['.', 2]));
  rows.push(R(['.', 2], ['o', 1], ['c', 2], ['l', 6], ['c', 2], ['o', 1], ['.', 2]));
  rows.push(R(['.', 3], ['o', 1], ['c', 8], ['o', 1], ['.', 3]));
  rows.push(R(['.', 3], ['o', 1], ['p', 8], ['o', 1], ['.', 3]));
  rows.push(R(['.', 4], ['p', 2], ['.', 8], ['p', 2]));
  rows.push(R(['.', 5], ['o', 6], ['.', 5]));
  while (rows.length < 20) rows.push(e16);
  return makeSprite(rows.slice(0, 20), pal, 16, 20);
}

function guardFrame(legAlt: boolean, slam: boolean): HTMLCanvasElement {
  const pal: Palette = { o: '#0a0a14', a: '#4a4a5e', l: '#8a8aa8', e: '#ff5a3a', s: '#6a7a9a', g: '#c8a23a', p: '#23232f' };
  const e20 = R(['.', 20]);
  const rows: string[] = [];
  rows.push(e20);
  rows.push(R(['.', 6], ['o', 8], ['.', 6]));
  rows.push(R(['.', 5], ['o', 1], ['a', 8], ['o', 1], ['.', 5]));
  rows.push(R(['.', 5], ['o', 1], ['a', 2], ['g', 2], ['a', 2], ['e', 1], ['a', 1], ['o', 1], ['.', 5]));
  rows.push(R(['.', 5], ['o', 1], ['a', 8], ['o', 1], ['.', 5]));
  rows.push(R(['.', 6], ['o', 8], ['.', 6]));
  if (slam) {
    rows.push(R(['o', 1], ['s', 6], ['.', 4], ['s', 6], ['o', 1], ['.', 2]));
    rows.push(R(['o', 1], ['s', 8], ['.', 2], ['s', 8], ['o', 1]));
    rows.push(R(['o', 2], ['s', 8], ['.', 0].slice(0, 2).join('') as never));
    rows.pop();
    rows.push(R(['o', 2], ['s', 8], ['o', 2]));
  } else {
    rows.push(R(['.', 1], ['o', 1], ['s', 4], ['a', 3], ['.', 3], ['a', 3], ['s', 2], ['o', 1], ['.', 2]));
    rows.push(R(['.', 1], ['o', 1], ['s', 5], ['a', 2], ['.', 2], ['a', 2], ['s', 4], ['o', 1], ['.', 2]));
    rows.push(R(['.', 2], ['o', 1], ['s', 6], ['a', 1], ['.', 1], ['a', 1], ['s', 5], ['o', 1], ['.', 1]));
  }
  rows.push(R(['.', 2], ['o', 16], ['.', 2]));
  rows.push(R(['.', 3], ['o', 1], ['a', 12], ['o', 1], ['.', 3]));
  rows.push(R(['.', 3], ['o', 1], ['a', 3], ['l', 3], ['a', 3], ['g', 2], ['a', 1], ['o', 1], ['.', 3]));
  rows.push(R(['.', 3], ['o', 1], ['a', 12], ['o', 1], ['.', 3]));
  rows.push(R(['.', 4], ['o', 1], ['a', 10], ['o', 1], ['.', 4]));
  if (legAlt) {
    rows.push(R(['.', 4], ['o', 1], ['p', 3], ['.', 4], ['p', 3], ['o', 1], ['.', 4]));
    rows.push(R(['.', 5], ['p', 3], ['.', 6], ['p', 3], ['.', 3]));
  } else {
    rows.push(R(['.', 4], ['o', 1], ['p', 3], ['.', 3], ['p', 3], ['o', 1], ['.', 4]));
    rows.push(R(['.', 5], ['p', 3], ['.', 5], ['p', 3], ['.', 4]));
  }
  rows.push(R(['.', 6], ['o', 8], ['.', 6]));
  while (rows.length < 24) rows.push(e20);
  return makeSprite(rows.slice(0, 24), pal, 20, 24);
}

function voidBolt(): HTMLCanvasElement {
  return makeSprite([
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 1], ['o', 1], ['v', 4], ['o', 1], ['.', 1]),
    R(['o', 1], ['v', 2], ['l', 2], ['v', 2], ['o', 1]),
    R(['.', 1], ['o', 1], ['v', 4], ['o', 1], ['.', 1]),
    R(['.', 2], ['o', 4], ['.', 2]),
    R(['.', 8]), R(['.', 8]), R(['.', 8])
  ], { o: '#0c0618', v: '#8a4ae0', l: '#e0c8ff' }, 8, 8);
}

function hollowKingFrame(seed: number, phase: number): HTMLCanvasElement {
  const size = 48;
  const rng = new RNG(seed);
  const pal: Palette = {
    o: '#05050f',
    b: phase >= 3 ? '#1a0a2e' : phase === 2 ? '#141024' : '#0e0c1c',
    l: phase >= 3 ? '#8a2ae0' : '#5a3a9a',
    t: '#b08aff',
    e: phase >= 3 ? '#ff3a5a' : '#e0c8ff',
    m: '#000000',
    c: '#d9a441'
  };
  const rows: string[] = [];
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) {
      const dx = (x - 24) / 12;
      const dy = (y - 27) / 13;
      const d = Math.sqrt(dx * dx + dy * dy);
      const inside = d < 1;
      if (!inside) {
        row += d < 1.2 && rng.chance(0.3) ? 't' : '.';
        continue;
      }
      const crown = y < 12 && (x === 14 || x === 19 || x === 24 || x === 29 || x === 34);
      const crownBand = y >= 12 && y < 15 && Math.abs(x - 24) < 10;
      const eyeL = Math.hypot(x - 19, y - 23) < 2.4;
      const eyeR = Math.hypot(x - 29, y - 23) < 2.4;
      const mouth = y >= 31 && y <= 34 && Math.abs(x - 24) < 4;
      if (crown) row += 'c';
      else if (crownBand) row += 'c';
      else if (eyeL || eyeR) row += 'e';
      else if (mouth) row += 'm';
      else if (rng.chance(0.1)) row += 'l';
      else row += 'b';
    }
    rows.push(row);
  }
  return makeSprite(rows, pal, size, size);
}

export function buildEnemySprites2(): void {}

export function buildEnemySprites(): Record<string, EnemyArt | HTMLCanvasElement> {
  return {
    golem: { frames: [golemFrame(false, false), golemFrame(true, false)], attackFrames: [golemFrame(false, true)], w: 20, h: 24, yOff: 6 },
    archer: { frames: [archerFrame(false, false), archerFrame(true, false)], attackFrames: [archerFrame(false, true)], w: 16, h: 20, yOff: 6 },
    bat: { frames: [batFrame(false, false), batFrame(true, true)], attackFrames: [batFrame(true, false)], w: 16, h: 12, yOff: 4 },
    ignis: { frames: [ignisFrame(2024, 0), ignisFrame(3131, 1), ignisFrame(4141, 2)], w: 48, h: 48, yOff: 6 },
    zombie: { frames: [zombieFrame(false, false), zombieFrame(true, false)], attackFrames: [zombieFrame(false, true)], w: 16, h: 20, yOff: 6 },
    toad: { frames: [toadFrame(false), toadFrame(true)], w: 16, h: 16, yOff: 4 },
    wisp: { frames: [wispFrame(false), wispFrame(true)], w: 16, h: 16, yOff: 6 },
    warden: { frames: [wardenFrame(5150, 0), wardenFrame(6261, 1), wardenFrame(7373, 2)], w: 48, h: 48, yOff: 6 },
    slime: { frames: [slimeFrame(false), slimeFrame(true)], w: 16, h: 16, yOff: 4 },
    slimeMini: { frames: [slimeMiniFrame(false), slimeMiniFrame(true)], w: 8, h: 8, yOff: 2 },
    thorn: { frames: [thornSpriteFrame(false), thornSpriteFrame(true)], attackFrames: [thornSpriteFrame(true)], w: 16, h: 16, yOff: 6 },
    stalker: { frames: [stalkerFrame(false, false), stalkerFrame(false, true)], attackFrames: [stalkerFrame(true, false)], w: 16, h: 20, yOff: 6 },
    bramble: { frames: [brambleFrame(4242, 0), brambleFrame(9317, 1), brambleFrame(1337, 2)], w: 48, h: 48, yOff: 6 },
    thornShot: thornShot(),
    spore: spore(),
    toadGlob: toadGlob(),
    wispBolt: wispBolt(),
    puddle: puddle(),
    wave: wave(),
    arrow: arrow(),
    fireball: fireball(),
    voidBolt: voidBolt(),
    knight: { frames: [knightFrame(false, false, false), knightFrame(true, false, false)], attackFrames: [knightFrame(false, true, false), knightFrame(false, false, true)], w: 16, h: 24, yOff: 6 },
    mage: { frames: [mageFrame(false, false), mageFrame(true, false)], attackFrames: [mageFrame(false, true)], w: 16, h: 20, yOff: 6 },
    guard: { frames: [guardFrame(false, false), guardFrame(true, false)], attackFrames: [guardFrame(false, true)], w: 20, h: 24, yOff: 6 },
    hollowKing: { frames: [hollowKingFrame(11, 0), hollowKingFrame(22, 1), hollowKingFrame(33, 2), hollowKingFrame(44, 3)], w: 48, h: 48, yOff: 6 }
  };
}
