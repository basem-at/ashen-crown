import { Entity } from './Entity';
import type { Game } from '../game/Game';
import { Element, rectsOverlap, dist2, DIR_VEC, Dir } from '../types';
import { drawSprite } from '../graphics/PixelArt';

export class Projectile extends Entity {
  dmg = 0;
  pierce = 0;
  element: Element = 'none';
  ttl = 1.5;
  fromPlayer = true;
  sprite: HTMLCanvasElement | null = null;
  spin = 0;
  onHit: ((game: Game, x: number, y: number) => void) | null = null;
  homing = 0;
  private hitSet = new Set<Entity>();

  constructor(x: number, y: number, dir: Dir, speed: number, dmg: number, opts: { pierce?: number; element?: Element; ttl?: number; fromPlayer?: boolean; sprite?: HTMLCanvasElement | null; onHit?: (game: Game, x: number, y: number) => void; homing?: number } = {}) {
    super();
    this.x = x;
    this.y = y;
    this.vx = DIR_VEC[dir].x * speed;
    this.vy = DIR_VEC[dir].y * speed;
    this.dmg = dmg;
    this.pierce = opts.pierce ?? 0;
    this.element = opts.element ?? 'none';
    this.ttl = opts.ttl ?? 1.5;
    this.fromPlayer = opts.fromPlayer ?? true;
    this.sprite = opts.sprite ?? null;
    this.onHit = opts.onHit ?? null;
    this.homing = opts.homing ?? 0;
    this.w = 10;
    this.h = 10;
    this.solid = false;
  }

  update(dt: number, game: Game): void {
    this.ttl -= dt;
    this.spin += dt * 12;
    if (this.ttl <= 0) {
      this.dead = true;
      return;
    }
    if (this.homing > 0 && !this.fromPlayer) {
      const p = game.player;
      const dx = p.x - this.x;
      const dy = p.y - 8 - this.y;
      const d = Math.hypot(dx, dy) || 1;
      this.vx += (dx / d) * this.homing * dt;
      this.vy += (dy / d) * this.homing * dt;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (game.isSolidAt(this.x, this.y)) {
      this.dead = true;
      game.particles.burst(this.x, this.y, '#9fd8ff', 6, 60, 1);
      if (this.onHit) this.onHit(game, this.x, this.y);
      return;
    }
    if (!this.fromPlayer && game.player.shieldOn) {
      const p = game.player;
      const dx = this.x - p.x;
      const dy = this.y - (p.y - 8);
      const d = Math.hypot(dx, dy) || 1;
      const f = DIR_VEC[p.anim.dir];
      if (d < 26 && (dx * f.x + dy * f.y) / d > 0.35) {
        this.fromPlayer = true;
        this.vx *= -1.7;
        this.vy *= -1.7;
        this.dmg = Math.round(this.dmg * 1.5);
        this.element = 'frost';
        this.hitSet.clear();
        game.audio.sfx('block');
        game.particles.burst(this.x, this.y, '#9fd8ff', 8, 70, 1);
        game.camera.shake(2);
      }
    }
    const targets = this.fromPlayer ? [...game.enemies, ...game.destructibles] : [game.player];
    for (const t of targets) {
      if (t.dead || this.hitSet.has(t)) continue;
      if (rectsOverlap(this.hitbox, t.hitbox)) {
        this.hitSet.add(t);
        game.combat.applyDamage(t, this.dmg, { dir: this.vx >= 0 ? (this.vy >= 0 ? 'down' : 'up') : (this.vy >= 0 ? 'down' : 'up'), knockback: 90, element: this.element, crit: false, source: null });
        if (this.onHit) this.onHit(game, this.x, this.y);
        if (this.pierce > 0) {
          this.pierce--;
        } else {
          this.dead = true;
          game.particles.burst(this.x, this.y, '#eaf4ff', 8, 70, 1);
          return;
        }
      }
    }
    if (this.fromPlayer && dist2(this.x, this.y, game.player.x, game.player.y) > 260 * 260) this.dead = true;
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    if (!this.sprite) return;
    const s = this.sprite;
    ctx.save();
    ctx.translate(Math.round(this.x), Math.round(this.y - 8));
    ctx.rotate(this.spin);
    drawSprite(ctx, s, -s.width / 2, -s.height / 2);
    ctx.restore();
  }
}
