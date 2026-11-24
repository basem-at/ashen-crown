import { Dir, DIR_VEC, VIEW_W, VIEW_H, Rect } from '../types';

export interface Light {
  x: number;
  y: number;
  r: number;
  color: string;
  intensity: number;
  flicker: number;
  coneDir: Dir | null;
  coneSpread: number;
}

export class LightingEngine {
  ambient = 0;
  darkRects: Rect[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lights: Light[] = [];
  private t = 0;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = VIEW_W;
    this.canvas.height = VIEW_H;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d ctx');
    this.ctx = ctx;
  }

  setAmbient(a: number): void {
    this.ambient = a;
  }

  setDarkRects(r: Rect[]): void {
    this.darkRects = r;
  }

  clearLights(): void {
    this.lights.length = 0;
  }

  addLight(l: Partial<Light> & { x: number; y: number; r: number }): void {
    this.lights.push({
      color: l.color ?? '#ffd9a0',
      intensity: l.intensity ?? 1,
      flicker: l.flicker ?? 0,
      coneDir: l.coneDir ?? null,
      coneSpread: l.coneSpread ?? 0.6,
      x: l.x,
      y: l.y,
      r: l.r
    });
  }

  update(dt: number): void {
    this.t += dt;
  }

  private cutLight(c: CanvasRenderingContext2D, l: Light, camX: number, camY: number): void {
    const flick = l.flicker > 0 ? 1 + Math.sin(this.t * (9 + l.flicker * 7) + l.x * 0.7) * 0.5 * l.flicker + (Math.random() - 0.5) * l.flicker * 0.6 : 1;
    const r = l.r * flick;
    const sx = l.x - camX;
    const sy = l.y - camY;
    if (sx + r < 0 || sx - r > VIEW_W || sy + r < 0 || sy - r > VIEW_H) return;
    c.save();
    if (l.coneDir) {
      const base = Math.atan2(DIR_VEC[l.coneDir].y, DIR_VEC[l.coneDir].x);
      c.beginPath();
      c.moveTo(sx, sy);
      c.arc(sx, sy, r, base - l.coneSpread / 2, base + l.coneSpread / 2);
      c.closePath();
      c.clip();
    }
    const g = c.createRadialGradient(sx, sy, 0, sx, sy, r);
    const a = Math.min(1, l.intensity);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(0.55, `rgba(255,255,255,${a * 0.75})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(sx - r, sy - r, r * 2, r * 2);
    c.restore();
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    if (this.ambient <= 0.01 && this.darkRects.length === 0) return;
    const c = this.ctx;
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, VIEW_W, VIEW_H);
    c.fillStyle = `rgba(5, 6, 20, ${this.ambient})`;
    c.fillRect(0, 0, VIEW_W, VIEW_H);
    c.globalCompositeOperation = 'destination-out';
    for (const l of this.lights) this.cutLight(c, l, camX, camY);
    for (const r of this.darkRects) {
      const sx = r.x - camX;
      const sy = r.y - camY;
      if (sx + r.w < 0 || sx > VIEW_W || sy + r.h < 0 || sy > VIEW_H) continue;
      c.save();
      c.beginPath();
      c.rect(sx, sy, r.w, r.h);
      c.clip();
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = 'rgba(2, 3, 14, 0.85)';
      c.fillRect(sx, sy, r.w, r.h);
      c.globalCompositeOperation = 'destination-out';
      for (const l of this.lights) this.cutLight(c, l, camX, camY);
      c.restore();
    }
    ctx.drawImage(this.canvas, 0, 0);
  }
}
