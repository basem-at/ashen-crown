import { Entity } from './Entity';
import type { Game } from '../game/Game';
import { Element, rectsOverlap } from '../types';
import { drawSprite } from '../graphics/PixelArt';

export class Hazard extends Entity {
  r: number;
  dps: number;
  ttl: number;
  element: Element;
  kind: 'acid' | 'lava' | 'void';
  hitCd = 0;
  solid = false;

  constructor(x: number, y: number, r: number, dps: number, ttl: number, element: Element = 'nature', kind: 'acid' | 'lava' | 'void' = 'acid') {
    super();
    this.x = x;
    this.y = y;
    this.r = r;
    this.dps = dps;
    this.ttl = ttl;
    this.element = element;
    this.kind = kind;
    this.w = r * 2;
    this.h = r;
  }

  update(dt: number, game: Game): void {
    this.ttl -= dt;
    if (this.ttl <= 0) {
      this.dead = true;
      return;
    }
    this.hitCd = Math.max(0, this.hitCd - dt);
    const p = game.player;
    const box = { x: this.x - this.r, y: this.y - this.r / 2, w: this.r * 2, h: this.r };
    if (!p.dead && this.hitCd <= 0 && rectsOverlap(box, p.hitbox)) {
      this.hitCd = 0.5;
      game.combat.applyDamage(p, 2, { dir: 'down', knockback: 20, element: this.element, crit: false, source: null });
    }
    const col = this.kind === 'lava' ? '#ff8a2e' : this.kind === 'void' ? '#b08aff' : '#8ae06a';
    if (Math.random() < dt * 6) {
      game.particles.burst(this.x + (Math.random() - 0.5) * this.r, this.y + (Math.random() - 0.5) * this.r * 0.5, col, 1, 15, 1);
    }
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    ctx.globalAlpha = Math.min(1, this.ttl);
    if (this.kind === 'void') {
      ctx.fillStyle = 'rgba(110,40,200,0.6)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.r, this.r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(200,160,255,0.8)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.r * 0.5, this.r * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.kind === 'lava') {
      ctx.fillStyle = 'rgba(224,74,30,0.75)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.r, this.r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,215,106,0.8)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.r * 0.55, this.r * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const spr = game.enemySprites['puddle'] as HTMLCanvasElement;
      if (spr) {
        const s = (this.r / 8) * 2;
        drawSprite(ctx, spr, this.x - 8 * s / 2, this.y - 8 * s / 2 - 2, { scale: s / 2 });
      }
    }
    ctx.globalAlpha = 1;
  }
}
