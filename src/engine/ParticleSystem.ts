import { RNG } from '../types';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
  shrink: boolean;
  text: string | null;
  textColor: string;
}

export class ParticleSystem {
  particles: Particle[] = [];
  private rng = new RNG(1234567);

  spawn(p: Partial<Particle> & { x: number; y: number }): void {
    this.particles.push({
      vx: 0,
      vy: 0,
      life: 1,
      maxLife: 1,
      size: 1,
      color: '#ffffff',
      gravity: 0,
      shrink: true,
      text: null,
      textColor: '#fff',
      ...p
    });
  }

  burst(x: number, y: number, color: string, count: number, speed: number, size = 1, gravity = 60): void {
    for (let i = 0; i < count; i++) {
      const a = this.rng.range(0, Math.PI * 2);
      const s = this.rng.range(speed * 0.3, speed);
      this.spawn({
        x: x + this.rng.range(-2, 2),
        y: y + this.rng.range(-2, 2),
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 20,
        life: this.rng.range(0.25, 0.7),
        maxLife: 0.7,
        size: this.rng.range(size * 0.6, size * 1.4),
        color,
        gravity,
        shrink: true
      });
    }
  }

  damageNumber(x: number, y: number, amount: number, color: string, crit = false): void {
    this.spawn({
      x,
      y,
      vx: this.rng.range(-8, 8),
      vy: -46,
      life: crit ? 0.95 : 0.7,
      maxLife: 0.95,
      size: crit ? 2 : 1,
      color: '#000',
      gravity: -30,
      shrink: false,
      text: String(amount),
      textColor: color
    });
  }

  healText(x: number, y: number, text: string, color: string): void {
    this.spawn({ x, y, vx: 0, vy: -30, life: 0.9, maxLife: 0.9, size: 1, color, gravity: 0, shrink: false, text, textColor: color });
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number, drawText: (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number, color: string, align?: 'left' | 'center' | 'right') => void): void {
    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.maxLife);
      if (p.text) {
        ctx.globalAlpha = a;
        drawText(ctx, p.text, p.x - camX, p.y - camY, p.size, p.textColor, 'center');
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = a;
        const s = p.shrink ? Math.max(0.5, p.size * a) : p.size;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x - camX - s / 2), Math.round(p.y - camY - s / 2), Math.ceil(s), Math.ceil(s));
        ctx.globalAlpha = 1;
      }
    }
  }

  clear(): void {
    this.particles.length = 0;
  }
}
