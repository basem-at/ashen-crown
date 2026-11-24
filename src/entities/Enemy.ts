import { Entity } from './Entity';
import type { Game } from '../game/Game';
import { Dir, dirFromVec, dist2, RNG, rectsOverlap, Element } from '../types';
import { drawSprite, tinted } from '../graphics/PixelArt';
import { Pickup } from './Pickup';
import type { EnemyArt } from '../graphics/EnemySprites';

export class Enemy extends Entity {
  name = 'Enemy';
  artKey = 'slime';
  contactDamage = 4;
  xpReward = 10;
  goldMin = 1;
  goldMax = 5;
  aggroRange = 96;
  speed = 42;
  touchCd = 0;
  attackT = 0;
  alpha = 1;
  t = 0;
  animSpeed = 6;
  frameOverride: number | null = null;
  canSplit = false;
  minion = false;
  bossId: string | null = null;
  element: Element = 'none';
  protected rng = new RNG(Math.floor(Math.random() * 1e9));
  protected wanderT = 0;
  protected wx = 0;
  protected wy = 0;

  constructor(tx: number, ty: number) {
    super();
    this.x = tx * 16 + 8;
    this.y = ty * 16 + 12;
    this.w = 10;
    this.h = 8;
  }

  art(game: Game): EnemyArt | null {
    return (game.enemySprites[this.artKey] as EnemyArt) ?? null;
  }

  update(dt: number, game: Game): void {
    if (this.dead) return;
    this.t += dt;
    this.tickStatus(game.time);
    this.invulnT = Math.max(0, this.invulnT - dt);
    this.flashT = Math.max(0, this.flashT - dt);
    this.touchCd = Math.max(0, this.touchCd - dt);
    this.attackT = Math.max(0, this.attackT - dt);
    this.decayKnockback(dt);
    this.ai(dt, game);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    game.clampToMap(this);
    const p = game.player;
    if (!p.dead && this.touchCd <= 0 && rectsOverlap(this.hitbox, p.hitbox)) {
      this.touchCd = 0.8;
      game.combat.applyDamage(p, this.contactDamage, { dir: dirFromVec(this.x - p.x, this.y - p.y), knockback: 130, element: this.element, crit: false, source: this });
    }
  }

  protected ai(dt: number, game: Game): void {
    const p = game.player;
    const d2 = dist2(this.x, this.y - 6, p.x, p.y - 8);
    let mx = 0;
    let my = 0;
    if (!p.dead && d2 < this.aggroRange * this.aggroRange) {
      const d = Math.sqrt(d2) || 1;
      mx = ((p.x - this.x) / d) * this.speed * this.slowFactor;
      my = ((p.y - 8 - (this.y - 6)) / d) * this.speed * this.slowFactor;
    } else {
      this.wanderT -= dt;
      if (this.wanderT <= 0) {
        this.wanderT = this.rng.range(0.8, 2.2);
        if (this.rng.chance(0.5)) {
          this.wx = 0;
          this.wy = 0;
        } else {
          const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
          const d = this.rng.pick(dirs);
          this.wx = d[0] * this.speed * 0.4;
          this.wy = d[1] * this.speed * 0.4;
        }
      }
      mx = this.wx * this.slowFactor;
      my = this.wy * this.slowFactor;
    }
    if (mx !== 0 || my !== 0) {
      this.dir = dirFromVec(mx, my);
      game.moveEntity(this, mx * dt, my * dt);
    }
  }

  onDeath(game: Game): void {
    this.dead = true;
    game.particles.burst(this.x, this.y - 8, '#c03a3a', 16, 90, 1.5);
    game.audio.sfx('boom');
    game.camera.shake(3);
    const gold = this.rng.int(this.goldMin, this.goldMax);
    for (let i = 0; i < gold; i++) game.pickups.push(new Pickup(this.x + this.rng.range(-6, 6), this.y - 6 + this.rng.range(-4, 4), 'gold', 1));
    if (this.rng.chance(0.25)) game.pickups.push(new Pickup(this.x, this.y - 10, 'heart', 8));
    if (this.rng.chance(0.2)) game.pickups.push(new Pickup(this.x, this.y - 10, 'mana', 10));
    game.player.gainXp(this.xpReward, game);
    game.onEnemyKilled(this);
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    const art = this.art(game);
    if (!art) return;
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 1, art.w / 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    const set = this.attackT > 0 && art.attackFrames ? art.attackFrames : art.frames;
    const idx = this.frameOverride ?? Math.floor(this.t * this.animSpeed) % set.length;
    const fr = set[idx % set.length];
    drawSprite(ctx, this.flashT > 0 ? tinted(fr, '#ffffff') : fr, this.x - art.w / 2, this.y - art.h + art.yOff);
    if (this.status && this.status.type === 'frost') {
      ctx.fillStyle = 'rgba(159,216,255,0.4)';
      ctx.fillRect(this.x - art.w / 2, this.y - art.h + art.yOff, art.w, art.h);
    } else if (this.status && this.status.type === 'fire') {
      ctx.fillStyle = 'rgba(255,120,40,0.35)';
      ctx.fillRect(this.x - art.w / 2, this.y - art.h + art.yOff, art.w, art.h);
    }
    ctx.globalAlpha = 1;
  }
}
