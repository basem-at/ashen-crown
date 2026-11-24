export type Palette = Record<string, string>;

export function makeSprite(rows: string[], pal: Palette, w?: number, h?: number): HTMLCanvasElement {
  const width = w ?? Math.max(...rows.map((r) => r.length), 1);
  const height = h ?? rows.length;
  const cv = document.createElement('canvas');
  cv.width = width;
  cv.height = height;
  const ctx = cv.getContext('2d');
  if (!ctx) throw new Error('no ctx');
  for (let y = 0; y < height; y++) {
    const row = rows[y] ?? '';
    for (let x = 0; x < width; x++) {
      const ch = row[x] ?? '.';
      const col = pal[ch];
      if (col) {
        ctx.fillStyle = col;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return cv;
}

const tintCache = new WeakMap<HTMLCanvasElement, Map<string, HTMLCanvasElement>>();

export function tinted(src: HTMLCanvasElement, color: string): HTMLCanvasElement {
  let m = tintCache.get(src);
  if (!m) {
    m = new Map();
    tintCache.set(src, m);
  }
  let cv = m.get(color);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = src.width;
    cv.height = src.height;
    const ctx = cv.getContext('2d');
    if (!ctx) throw new Error('no ctx');
    ctx.drawImage(src, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, cv.width, cv.height);
    m.set(color, cv);
  }
  return cv;
}

export function flipX(src: HTMLCanvasElement): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = src.width;
  cv.height = src.height;
  const ctx = cv.getContext('2d');
  if (!ctx) throw new Error('no ctx');
  ctx.translate(src.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  return cv;
}

export function rotate90(src: HTMLCanvasElement, times: number): HTMLCanvasElement {
  let cur = src;
  for (let i = 0; i < times % 4; i++) {
    const cv = document.createElement('canvas');
    cv.width = cur.height;
    cv.height = cur.width;
    const ctx = cv.getContext('2d');
    if (!ctx) throw new Error('no ctx');
    ctx.translate(cv.width, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(cur, 0, 0);
    cur = cv;
  }
  return cur;
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  spr: HTMLCanvasElement,
  x: number,
  y: number,
  opts: { flipX?: boolean; alpha?: number; scale?: number } = {}
): void {
  const s = opts.scale ?? 1;
  ctx.globalAlpha = opts.alpha ?? 1;
  if (opts.flipX) {
    ctx.save();
    ctx.translate(Math.round(x) + spr.width * s, Math.round(y));
    ctx.scale(-1, 1);
    ctx.drawImage(spr, 0, 0, spr.width * s, spr.height * s);
    ctx.restore();
  } else {
    ctx.drawImage(spr, Math.round(x), Math.round(y), spr.width * s, spr.height * s);
  }
  ctx.globalAlpha = 1;
}

const FONT: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'],
  N: ['#.#', '###', '#.#', '#.#', '#.#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '.#.', '..#'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#.#', '#.#', '###', '###', '#.#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['##.', '..#', '.#.', '#..', '###'],
  '3': ['##.', '..#', '.#.', '..#', '##.'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '##.', '..#', '##.'],
  '6': ['.##', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '.#.', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '##.'],
  ' ': ['...', '...', '...', '...', '...'],
  '.': ['...', '...', '...', '...', '.#.'],
  ',': ['...', '...', '...', '.#.', '#..'],
  '!': ['.#.', '.#.', '.#.', '...', '.#.'],
  '?': ['##.', '..#', '.#.', '...', '.#.'],
  "'": ['.#.', '.#.', '...', '...', '...'],
  '"': ['#.#', '#.#', '...', '...', '...'],
  ':': ['...', '.#.', '...', '.#.', '...'],
  ';': ['...', '.#.', '...', '.#.', '#..'],
  '-': ['...', '...', '###', '...', '...'],
  '+': ['...', '.#.', '###', '.#.', '...'],
  '/': ['..#', '..#', '.#.', '#..', '#..'],
  '(': ['..#', '.#.', '.#.', '.#.', '..#'],
  ')': ['#..', '.#.', '.#.', '.#.', '#..'],
  '%': ['#.#', '..#', '.#.', '#..', '#.#'],
  '<': ['..#', '.#.', '#..', '.#.', '..#'],
  '>': ['#..', '.#.', '..#', '.#.', '#..'],
  '=': ['...', '###', '...', '###', '...'],
  '&': ['.#.', '#.#', '.#.', '#.#', '.#.'],
  '@': ['.#.', '###', '#.#', '###', '.#.'],
  '#': ['#.#', '###', '#.#', '###', '#.#'],
  '_': ['...', '...', '...', '...', '###'],
  '*': ['...', '#.#', '.#.', '#.#', '...']
};

export function measureText(text: string, scale = 1): number {
  return text.length * 4 * scale - scale;
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  scale = 1,
  color = '#ffffff',
  align: 'left' | 'center' | 'right' = 'left'
): void {
  const w = measureText(text, scale);
  let cx = align === 'left' ? x : align === 'center' ? x - w / 2 : x - w;
  const cy = Math.round(y);
  ctx.fillStyle = color;
  for (const raw of text.toUpperCase()) {
    const glyph = FONT[raw] ?? FONT['?'];
    for (let gy = 0; gy < 5; gy++) {
      const row = glyph[gy];
      for (let gx = 0; gx < 3; gx++) {
        if (row[gx] === '#') {
          ctx.fillRect(Math.round(cx) + gx * scale, cy + gy * scale, scale, scale);
        }
      }
    }
    cx += 4 * scale;
  }
}

export function drawTextShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  scale = 1,
  color = '#ffffff',
  align: 'left' | 'center' | 'right' = 'left'
): void {
  drawText(ctx, text, x + scale, y + scale, scale, '#000000', align);
  drawText(ctx, text, x, y, scale, color, align);
}
