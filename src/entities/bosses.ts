import { Enemy } from './Enemy';
import type { Game } from '../game/Game';
import { dist2, RNG, rectsOverlap } from '../types';
import { Projectile } from './Projectile';
import { drawSprite, tinted } from '../graphics/PixelArt';
import { createEnemy } from './enemies';
import { Pickup } from './Pickup';
import { Hazard } from './Hazard';

interface Whip {
  angle: number;
  len: number;
  w: number;
  telegraph: number;
  dur: number;
  hitDone: boolean;
}

interface Beam {
  angle: number;
  len: number;
  t: number;
  dur: number;
  spin: number;
  hitCd: number;
}

export abstract class Boss extends Enemy {
  phase = 1;
  protected phaseT = 0;
  protected attackT2 = 2;
  protected summonT = 4;
  protected whips: Whip[] = [];
  protected beams: Beam[] = [];
  protected arena: { x: number; y: number; w: number; h: number } | null = null;

  constructor(tx: number, ty: number, w: number, h: number) {
    super(tx, ty);
    this.w = w;
    this.h = h;
    this.solid = false;
    this.aggroRange = 400;
  }

  setArena(a: { x: number; y: number; w: number; h: number }): void {
    this.arena = a;
  }

  protected checkPhase(game: Game): void {
    const f = this.hp / this.maxHp;
    const np = f > 0.75 ? 1 : f > 0.5 ? 2 : f > 0.25 ? 3 : 4;
    if (np !== this.phase) {
      this.phase = np;
      this.invulnT = 0.8;
      this.whips = [];
      game.audio.sfx('roar');
      game.camera.shake(8);
      game.particles.burst(this.x, this.y - 20, '#8ae06a', 30, 130, 2);
      game.toast(this.name + ' enters phase ' + np + '!');
    }
  }

  protected addWhip(angle: number, len: number, w: number, telegraph: number, dur: number): void {
    this.whips.push({ angle, len, w, telegraph, dur, hitDone: false });
  }

  protected updateWhips(dt: number, game: Game): void {
    const p = game.player;
    for (const wh of this.whips) {
      if (wh.telegraph > 0) {
        wh.telegraph -= dt;
        continue;
      }
      wh.dur -= dt;
      if (!wh.hitDone) {
        for (let s = 10; s <= wh.len; s += 6) {
          const wx = this.x + Math.cos(wh.angle) * s;
          const wy = this.y - 14 + Math.sin(wh.angle) * s;
          if (dist2(wx, wy, p.x, p.y - 8) < (wh.w / 2 + 6) * (wh.w / 2 + 6)) {
            wh.hitDone = true;
            const dir = Math.abs(Math.cos(wh.angle)) > Math.abs(Math.sin(wh.angle)) ? (Math.cos(wh.angle) >= 0 ? 'right' : 'left') : (Math.sin(wh.angle) >= 0 ? 'down' : 'up');
            game.combat.applyDamage(p, 12, { dir, knockback: 240, element: 'nature', crit: false, source: this });
            break;
          }
        }
      }
    }
    this.whips = this.whips.filter((w) => w.dur > 0 || w.telegraph > 0);
  }

  protected fireSpores(game: Game, ring: number, aimed: number): void {
    const spr = game.enemySprites['spore'] as HTMLCanvasElement;
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * Math.PI * 2 + this.t * 0.7;
      const p = new Projectile(this.x, this.y - 14, 'down', 0, 6, { pierce: 0, element: 'nature', ttl: 4, fromPlayer: false, sprite: spr });
      p.vx = Math.cos(a) * 62;
      p.vy = Math.sin(a) * 62;
      game.projectiles.push(p);
    }
    const pp = game.player;
    const base = Math.atan2((pp.y - 8) - (this.y - 14), pp.x - this.x);
    for (let i = 0; i < aimed; i++) {
      const a = base + (i - (aimed - 1) / 2) * 0.35;
      const p = new Projectile(this.x, this.y - 14, 'down', 0, 6, { pierce: 0, element: 'nature', ttl: 4, fromPlayer: false, sprite: spr });
      p.vx = Math.cos(a) * 85;
      p.vy = Math.sin(a) * 85;
      game.projectiles.push(p);
    }
    game.audio.sfx('swing');
  }

  protected updateBeams(dt: number, game: Game): void {
    const p = game.player;
    for (const b of this.beams) {
      b.t += dt;
      b.angle += b.spin * dt;
      b.hitCd = Math.max(0, b.hitCd - dt);
      if (b.t > b.dur) continue;
      const bx = this.x;
      const by = this.y - 14;
      const ex = bx + Math.cos(b.angle) * b.len;
      const ey = by + Math.sin(b.angle) * b.len;
      const seg = Math.hypot(ex - bx, ey - by) || 1;
      const tt = Math.max(0, Math.min(1, ((p.x - bx) * (ex - bx) + (p.y - 8 - by) * (ey - by)) / (seg * seg)));
      const cx = bx + (ex - bx) * tt;
      const cy = by + (ey - by) * tt;
      if (!p.dead && b.hitCd <= 0 && dist2(cx, cy, p.x, p.y - 8) < 10 * 10) {
        b.hitCd = 0.4;
        game.combat.applyDamage(p, 10, { dir: Math.abs(Math.cos(b.angle)) > Math.abs(Math.sin(b.angle)) ? (Math.cos(b.angle) >= 0 ? 'right' : 'left') : (Math.sin(b.angle) >= 0 ? 'down' : 'up'), knockback: 160, element: 'fire', crit: false, source: this });
      }
    }
    this.beams = this.beams.filter((b) => b.t <= b.dur);
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    const art = this.art(game);
    if (!art) return;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 2, art.w / 2.6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    const fr = art.frames[Math.floor(this.t * 2) % art.frames.length];
    const tint = this.phase === 3 ? '#ff8a6a' : this.phase === 2 ? '#e8d06a' : null;
    const base = this.flashT > 0 ? tinted(fr, '#ffffff') : tint ? tinted(fr, tint) : fr;
    drawSprite(ctx, base, this.x - art.w / 2, this.y - art.h + art.yOff);
    for (const b of this.beams) {
      if (b.t > b.dur) continue;
      const bx = this.x;
      const by = this.y - 14;
      const ex = bx + Math.cos(b.angle) * b.len;
      const ey = by + Math.sin(b.angle) * b.len;
      ctx.strokeStyle = 'rgba(255,106,30,0.35)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.strokeStyle = '#ffd76a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.strokeStyle = '#fff0c0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
    for (const wh of this.whips) {
      if (wh.telegraph > 0) {
        ctx.strokeStyle = 'rgba(138,224,106,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 14);
        ctx.lineTo(this.x + Math.cos(wh.angle) * wh.len, this.y - 14 + Math.sin(wh.angle) * wh.len);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#4aa04a';
        ctx.lineWidth = wh.w;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 14);
        ctx.lineTo(this.x + Math.cos(wh.angle) * wh.len, this.y - 14 + Math.sin(wh.angle) * wh.len);
        ctx.stroke();
        ctx.strokeStyle = '#8ae06a';
        ctx.lineWidth = Math.max(2, wh.w - 6);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 14);
        ctx.lineTo(this.x + Math.cos(wh.angle) * wh.len, this.y - 14 + Math.sin(wh.angle) * wh.len);
        ctx.stroke();
      }
    }
  }
}

export class Brambleheart extends Boss {
  name = 'BRAMBLEHEART';
  artKey = 'bramble';
  bossId = 'brambleheart';
  contactDamage = 10;
  xpReward = 120;
  goldMin = 20;
  goldMax = 40;
  speed = 34;
  private whipAngle = 0;
  private sweep = false;

  constructor(tx: number, ty: number) {
    super(tx, ty, 36, 36);
    this.hp = 130;
    this.maxHp = 130;
    this.element = 'nature';
  }

  protected ai(dt: number, game: Game): void {
    this.checkPhase(game);
    this.updateWhips(dt, game);
    const p = game.player;
    const d2 = dist2(this.x, this.y, p.x, p.y - 8);
    const d = Math.sqrt(d2) || 1;
    this.phaseT += dt;
    this.attackT2 -= dt;
    this.summonT -= dt;

    if (this.arena) {
      const a = this.arena;
      if (this.x < a.x + 24) this.x = a.x + 24;
      if (this.x > a.x + a.w - 24) this.x = a.x + a.w - 24;
      if (this.y < a.y + 24) this.y = a.y + 24;
      if (this.y > a.y + a.h - 16) this.y = a.y + a.h - 16;
    }

    if (this.phase === 1) {
      if (this.attackT2 <= 0) {
        this.attackT2 = 2.3;
        const aimed = Math.atan2((p.y - 8) - (this.y - 14), p.x - this.x);
        this.addWhip(aimed + this.rng.range(-0.25, 0.25), 78, 16, 0.55, 0.3);
        this.addWhip(aimed + Math.PI + this.rng.range(-0.25, 0.25), 78, 16, 0.55, 0.3);
        game.audio.sfx('swing');
      }
      this.moveChase(dt, game, d);
    } else if (this.phase === 2) {
      if (this.attackT2 <= 0) {
        this.attackT2 = 1.9;
        this.fireSpores(game, 10, 3);
        game.camera.shake(3);
      }
      this.moveChase(dt, game, d);
    } else {
      if (this.attackT2 <= 0) {
        this.attackT2 = 1.4;
        this.sweep = !this.sweep;
        if (this.sweep) {
          this.whipAngle = this.rng.range(0, Math.PI * 2);
          this.addWhip(this.whipAngle, 84, 16, 0.5, 0.3);
          this.addWhip(this.whipAngle + Math.PI / 2, 84, 14, 0.5, 0.3);
        } else {
          this.fireSpores(game, 8, 2);
        }
        game.audio.sfx('swing');
      }
      if (this.summonT <= 0) {
        this.summonT = 4.5;
        const alive = game.enemies.filter((e) => e.minion && !e.dead).length;
        if (alive < 3 && this.arena) {
          const a = this.arena;
          for (let i = 0; i < 2; i++) {
            const kind = this.rng.chance(0.5) ? 'thornSprite' : 'slime';
            const m = createEnemy(kind, 0, 0);
            m.minion = true;
            m.x = a.x + 24 + this.rng.range(0, a.w - 48);
            m.y = a.y + 24 + this.rng.range(0, a.h - 40);
            game.enemies.push(m);
          }
          game.audio.sfx('roar');
          game.particles.burst(this.x, this.y - 20, '#b06ae0', 24, 110, 1.5);
          game.toast('Brambleheart summons minions!');
        }
      }
      this.moveChase(dt, game, d);
    }
  }

  private moveChase(dt: number, game: Game, d: number): void {
    const p = game.player;
    if (p.dead || d < 40) return;
    const mx = ((p.x - this.x) / d) * this.speed * this.slowFactor;
    const my = ((p.y - 8 - (this.y - 14)) / d) * this.speed * this.slowFactor;
    this.x += mx * dt;
    this.y += my * dt;
  }

  onDeath(game: Game): void {
    game.particles.burst(this.x, this.y - 20, '#8ae06a', 40, 150, 2);
    game.particles.burst(this.x, this.y - 20, '#ffd76a', 24, 120, 1.5);
    game.audio.sfx('boom');
    game.audio.sfx('roar');
    game.camera.shake(10);
    game.pickups.push(new Pickup(this.x - 8, this.y - 16, 'item', 1, 'bossShard'));
    game.pickups.push(new Pickup(this.x + 8, this.y - 16, 'item', 1, 'bossShard'));
    for (let i = 0; i < 10; i++) game.pickups.push(new Pickup(this.x + this.rng.range(-20, 20), this.y - 8, 'gold', 5));
    game.pickups.push(new Pickup(this.x, this.y - 24, 'heart', 20));
    game.player.gainXp(this.xpReward, game);
    this.dead = true;
    game.onEnemyKilled(this);
  }
}

export class DrownedWarden extends Boss {
  name = 'DROWNED WARDEN';
  artKey = 'warden';
  bossId = 'warden';
  contactDamage = 12;
  xpReward = 160;
  goldMin = 25;
  goldMax = 45;
  speed = 30;
  private pullT = 0;
  private pullCd = 3.2;
  private volleyT = 1.6;
  private volleyAngle = 0;
  private chargeT = 0;
  private chargeCd = 2.8;
  private chargeDir = 0;
  private chargeHitDone = false;

  constructor(tx: number, ty: number) {
    super(tx, ty, 36, 36);
    this.hp = 170;
    this.maxHp = 170;
    this.element = 'frost';
  }

  protected ai(dt: number, game: Game): void {
    this.checkPhase(game);
    const p = game.player;
    const d2 = dist2(this.x, this.y, p.x, p.y - 8);
    const d = Math.sqrt(d2) || 1;
    this.phaseT += dt;

    if (this.arena) {
      const a = this.arena;
      if (this.x < a.x + 24) this.x = a.x + 24;
      if (this.x > a.x + a.w - 24) this.x = a.x + a.w - 24;
      if (this.y < a.y + 24) this.y = a.y + 24;
      if (this.y > a.y + a.h - 16) this.y = a.y + a.h - 16;
    }

    if (this.pullT > 0) {
      this.pullT -= dt;
      if (!p.dead) {
        const pull = 150 * this.slowFactor;
        p.vx += ((this.x - p.x) / d) * pull * dt * 8;
        p.vy += (((this.y - 8) - (p.y - 8)) / d) * pull * dt * 8;
        if (Math.random() < dt * 20) game.particles.burst(p.x, p.y - 8, '#5ab0e0', 1, 20, 1);
      }
    }

    if (this.chargeT > 0) {
      this.chargeT -= dt;
      this.x += Math.cos(this.chargeDir) * 270 * dt;
      this.y += Math.sin(this.chargeDir) * 270 * dt - 14 * dt * 0;
      if (this.arena) {
        const a = this.arena;
        this.x = Math.max(a.x + 24, Math.min(a.x + a.w - 24, this.x));
        this.y = Math.max(a.y + 24, Math.min(a.y + a.h - 16, this.y));
      }
      if (!this.chargeHitDone && !p.dead && rectsOverlap(this.hitbox, p.hitbox)) {
        this.chargeHitDone = true;
        game.combat.applyDamage(p, 16, { dir: Math.abs(Math.cos(this.chargeDir)) > Math.abs(Math.sin(this.chargeDir)) ? (Math.cos(this.chargeDir) >= 0 ? 'right' : 'left') : (Math.sin(this.chargeDir) >= 0 ? 'down' : 'up'), knockback: 320, element: 'frost', crit: false, source: this });
      }
      if (Math.random() < dt * 30) game.particles.burst(this.x, this.y - 14, '#5ab0e0', 1, 40, 1);
      return;
    }

    if (this.phase === 1) {
      this.pullCd -= dt;
      if (this.pullCd <= 0 && !p.dead) {
        this.pullCd = 3.2;
        this.pullT = 1.3;
        game.audio.sfx('roar');
        game.camera.shake(5);
        game.toast('Whirlpool!');
      }
      if (this.attackT2 <= 0) {
        this.attackT2 = 2.4;
        const spr = game.enemySprites['wave'] as HTMLCanvasElement;
        for (let i = 0; i < 2; i++) {
          const pj = new Projectile(this.x, this.y - 14, 'down', 0, 6, { pierce: 0, element: 'frost', ttl: 4.5, fromPlayer: false, sprite: spr });
          const a = Math.atan2((p.y - 8) - (this.y - 14), p.x - this.x) + (i - 0.5) * 0.5;
          pj.vx = Math.cos(a) * 42;
          pj.vy = Math.sin(a) * 42;
          game.projectiles.push(pj);
        }
      }
      this.chase(dt, game, d);
    } else if (this.phase === 2) {
      this.volleyT -= dt;
      if (this.volleyT <= 0) {
        this.volleyT = 1.7;
        this.volleyAngle += 0.7;
        const spr = game.enemySprites['wave'] as HTMLCanvasElement;
        for (let i = 0; i < 6; i++) {
          const a = this.volleyAngle + (i / 6) * Math.PI * 2;
          const pj = new Projectile(this.x, this.y - 14, 'down', 0, 7, { pierce: 0, element: 'frost', ttl: 5, fromPlayer: false, sprite: spr });
          pj.vx = Math.cos(a) * 82;
          pj.vy = Math.sin(a) * 82;
          game.projectiles.push(pj);
        }
        game.audio.sfx('swing');
        game.camera.shake(3);
      }
      this.chase(dt, game, d);
    } else {
      this.chargeCd -= dt;
      if (this.chargeCd <= 0 && !p.dead) {
        this.chargeCd = 2.8;
        this.chargeT = 0.55;
        this.chargeDir = Math.atan2((p.y - 8) - (this.y - 14), p.x - this.x);
        this.chargeHitDone = false;
        this.attackT = 0.6;
        game.audio.sfx('roar');
        game.toast('The Warden charges!');
      }
      if (this.volleyT <= 0) {
        this.volleyT = 2.6;
        const spr = game.enemySprites['wave'] as HTMLCanvasElement;
        const base = Math.atan2((p.y - 8) - (this.y - 14), p.x - this.x);
        for (let i = 0; i < 4; i++) {
          const a = base + (i - 1.5) * 0.3;
          const pj = new Projectile(this.x, this.y - 14, 'down', 0, 6, { pierce: 0, element: 'frost', ttl: 4, fromPlayer: false, sprite: spr });
          pj.vx = Math.cos(a) * 70;
          pj.vy = Math.sin(a) * 70;
          game.projectiles.push(pj);
        }
      }
      this.volleyT -= dt;
      this.chase(dt, game, d);
    }
  }

  private chase(dt: number, game: Game, d: number): void {
    const p = game.player;
    if (p.dead || d < 46) return;
    this.x += ((p.x - this.x) / d) * this.speed * this.slowFactor * dt;
    this.y += ((p.y - 8 - (this.y - 14)) / d) * this.speed * this.slowFactor * dt;
  }

  onDeath(game: Game): void {
    game.particles.burst(this.x, this.y - 20, '#5ab0e0', 40, 150, 2);
    game.particles.burst(this.x, this.y - 20, '#ffd76a', 24, 120, 1.5);
    game.audio.sfx('boom');
    game.audio.sfx('roar');
    game.camera.shake(10);
    game.pickups.push(new Pickup(this.x - 8, this.y - 16, 'item', 1, 'bossShard'));
    game.pickups.push(new Pickup(this.x + 8, this.y - 16, 'item', 1, 'bossShard'));
    for (let i = 0; i < 10; i++) game.pickups.push(new Pickup(this.x + this.rng.range(-20, 20), this.y - 8, 'gold', 5));
    game.pickups.push(new Pickup(this.x, this.y - 24, 'heart', 20));
    game.player.gainXp(this.xpReward, game);
    this.dead = true;
    game.onEnemyKilled(this);
  }
}

export class Ignis extends Boss {
  name = 'IGNIS THE FORGEMASTER';
  artKey = 'ignis';
  bossId = 'ignis';
  contactDamage = 14;
  xpReward = 220;
  goldMin = 30;
  goldMax = 50;
  speed = 26;
  private slamCd = 2.4;
  private teleT = 0;
  private beamCd = 3;
  private novaT = 2.2;

  constructor(tx: number, ty: number) {
    super(tx, ty, 36, 36);
    this.hp = 210;
    this.maxHp = 210;
    this.element = 'fire';
  }

  protected ai(dt: number, game: Game): void {
    this.checkPhase(game);
    this.updateBeams(dt, game);
    const p = game.player;
    const d2 = dist2(this.x, this.y, p.x, p.y - 8);
    const d = Math.sqrt(d2) || 1;

    if (this.arena) {
      const a = this.arena;
      if (this.x < a.x + 24) this.x = a.x + 24;
      if (this.x > a.x + a.w - 24) this.x = a.x + a.w - 24;
      if (this.y < a.y + 24) this.y = a.y + 24;
      if (this.y > a.y + a.h - 16) this.y = a.y + a.h - 16;
    }

    if (this.teleT > 0) {
      this.teleT -= dt;
      this.attackT = 0.1;
      if (this.teleT <= 0) {
        game.audio.sfx('boom');
        game.camera.shake(8);
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * Math.PI * 2;
          game.particles.spawn({ x: this.x, y: this.y - 14, vx: Math.cos(a) * 100, vy: Math.sin(a) * 100, life: 0.45, maxLife: 0.45, size: 2, color: i % 2 ? '#ff8a2e' : '#ffd76a', gravity: 0, shrink: true });
        }
        if (!p.dead && d < 74) {
          game.combat.applyDamage(p, 13, { dir: dirFromVecSafe(p.x - this.x, (p.y - 8) - (this.y - 14)), knockback: 300, element: 'fire', crit: false, source: this });
        }
        const spr = game.enemySprites['fireball'] as HTMLCanvasElement;
        for (let i = 0; i < 3; i++) {
          const a = Math.atan2((p.y - 8) - (this.y - 14), p.x - this.x) + (i - 1) * 0.4;
          const pj = new Projectile(this.x, this.y - 14, 'down', 0, 7, { pierce: 0, element: 'fire', ttl: 4, fromPlayer: false, sprite: spr });
          pj.vx = Math.cos(a) * 70;
          pj.vy = Math.sin(a) * 70;
          game.projectiles.push(pj);
        }
      }
      return;
    }

    if (this.phase === 1) {
      this.slamCd -= dt;
      if (!p.dead && this.slamCd <= 0) {
        this.slamCd = 2.4;
        this.teleT = 0.65;
        game.audio.sfx('charge');
        game.toast('Ignis raises his anvil!');
      }
      this.chase(dt, game, d);
    } else if (this.phase === 2) {
      this.beamCd -= dt;
      if (this.beamCd <= 0) {
        this.beamCd = 3.2;
        const base = this.rng.range(0, Math.PI * 2);
        this.beams.push({ angle: base, len: 110, t: 0, dur: 2.8, spin: 0.7, hitCd: 0 });
        this.beams.push({ angle: base + Math.PI, len: 110, t: 0, dur: 2.8, spin: 0.7, hitCd: 0 });
        game.audio.sfx('roar');
        game.toast('Flame beams sweep the arena!');
      }
      this.chase(dt, game, d);
    } else {
      this.slamCd -= dt;
      this.novaT -= dt;
      if (!p.dead && this.slamCd <= 0) {
        this.slamCd = 1.7;
        this.teleT = 0.5;
        game.audio.sfx('charge');
      }
      if (this.novaT <= 0 && this.arena) {
        this.novaT = 2.2;
        const a = this.arena;
        for (let i = 0; i < 3; i++) {
          const hx = a.x + 30 + this.rng.range(0, a.w - 60);
          const hy = a.y + 30 + this.rng.range(0, a.h - 50);
          game.hazards.push(new Hazard(hx, hy, 19, 8, 3.6, 'fire', 'lava'));
        }
        game.audio.sfx('boom');
        game.camera.shake(5);
        game.toast('The floor superheats!');
      }
      this.chase(dt, game, d);
    }
  }

  private chase(dt: number, game: Game, d: number): void {
    const p = game.player;
    if (p.dead || d < 50) return;
    this.x += ((p.x - this.x) / d) * this.speed * this.slowFactor * dt;
    this.y += ((p.y - 8 - (this.y - 14)) / d) * this.speed * this.slowFactor * dt;
  }

  onDeath(game: Game): void {
    game.particles.burst(this.x, this.y - 20, '#ff8a2e', 44, 160, 2);
    game.particles.burst(this.x, this.y - 20, '#ffd76a', 26, 130, 1.5);
    game.audio.sfx('boom');
    game.audio.sfx('roar');
    game.camera.shake(10);
    game.pickups.push(new Pickup(this.x - 10, this.y - 16, 'item', 1, 'bossShard'));
    game.pickups.push(new Pickup(this.x, this.y - 20, 'item', 1, 'bossShard'));
    game.pickups.push(new Pickup(this.x + 10, this.y - 16, 'item', 1, 'bossShard'));
    for (let i = 0; i < 12; i++) game.pickups.push(new Pickup(this.x + this.rng.range(-24, 24), this.y - 8, 'gold', 5));
    game.pickups.push(new Pickup(this.x, this.y - 26, 'heart', 20));
    game.player.gainXp(this.xpReward, game);
    this.dead = true;
    game.onEnemyKilled(this);
  }
}

function dirFromVecSafe(x: number, y: number): 'down' | 'up' | 'left' | 'right' {
  if (Math.abs(x) > Math.abs(y)) return x >= 0 ? 'right' : 'left';
  return y >= 0 ? 'down' : 'up';
}

export class HollowKing extends Boss {
  name = 'THE HOLLOW KING';
  artKey = 'hollowKing';
  bossId = 'hollowKing';
  contactDamage = 14;
  xpReward = 500;
  goldMin = 40;
  goldMax = 80;
  speed = 34;
  private dashCd = 2.2;
  private dashT = 0;
  private dashDir = 0;
  private dashHit = false;
  private spiralT = 0;
  private spiralAngle = 0;
  private ringT = 0;
  private novaT = 3;
  private hazardT = 2.5;

  constructor(tx: number, ty: number) {
    super(tx, ty, 36, 36);
    this.hp = 260;
    this.maxHp = 260;
    this.element = 'void';
    this.summonT = 5;
  }

  protected ai(dt: number, game: Game): void {
    this.checkPhase(game);
    const p = game.player;
    const d2 = dist2(this.x, this.y, p.x, p.y - 8);
    const d = Math.sqrt(d2) || 1;

    if (this.arena) {
      const a = this.arena;
      if (this.x < a.x + 24) this.x = a.x + 24;
      if (this.x > a.x + a.w - 24) this.x = a.x + a.w - 24;
      if (this.y < a.y + 24) this.y = a.y + 24;
      if (this.y > a.y + a.h - 16) this.y = a.y + a.h - 16;
    }

    if (this.dashT > 0) {
      this.dashT -= dt;
      this.x += Math.cos(this.dashDir) * 240 * dt;
      this.y += Math.sin(this.dashDir) * 240 * dt;
      if (this.arena) {
        const a = this.arena;
        this.x = Math.max(a.x + 24, Math.min(a.x + a.w - 24, this.x));
        this.y = Math.max(a.y + 24, Math.min(a.y + a.h - 16, this.y));
      }
      if (!this.dashHit && !p.dead && rectsOverlap(this.hitbox, p.hitbox)) {
        this.dashHit = true;
        game.combat.applyDamage(p, 14, { dir: Math.abs(Math.cos(this.dashDir)) > Math.abs(Math.sin(this.dashDir)) ? (Math.cos(this.dashDir) >= 0 ? 'right' : 'left') : (Math.sin(this.dashDir) >= 0 ? 'down' : 'up'), knockback: 300, element: 'void', crit: false, source: this });
      }
      if (Math.random() < dt * 40) game.particles.burst(this.x, this.y - 14, '#b08aff', 1, 60, 1);
      return;
    }

    const spr = game.enemySprites['voidBolt'] as HTMLCanvasElement;
    const fireBolt = (a: number, speed: number, dmg: number, homing = 0) => {
      const pj = new Projectile(this.x, this.y - 14, 'down', 0, dmg, { pierce: 0, element: 'void', ttl: 5, fromPlayer: false, sprite: spr, homing });
      pj.vx = Math.cos(a) * speed;
      pj.vy = Math.sin(a) * speed;
      game.projectiles.push(pj);
    };

    if (this.phase === 1) {
      this.dashCd -= dt;
      if (!p.dead && this.dashCd <= 0) {
        this.dashCd = 2.2;
        this.dashT = 0.5;
        this.dashDir = Math.atan2((p.y - 8) - (this.y - 14), p.x - this.x);
        this.dashHit = false;
        this.attackT = 0.5;
        game.audio.sfx('dash');
        game.toast('The Hollow King dashes!');
      }
      if (this.attackT2 <= 0) {
        this.attackT2 = 2;
        const base = Math.atan2((p.y - 8) - (this.y - 14), p.x - this.x);
        for (let i = 0; i < 5; i++) fireBolt(base + (i - 2) * 0.3, 85, 7);
        game.audio.sfx('swing');
      }
      this.chase(dt, game, d);
    } else if (this.phase === 2) {
      this.spiralT -= dt;
      this.spiralAngle += dt * 3.2;
      if (this.spiralT <= 0) {
        this.spiralT = 0.14;
        fireBolt(this.spiralAngle, 70, 6);
        fireBolt(this.spiralAngle + Math.PI, 70, 6);
      }
      this.ringT -= dt;
      if (this.ringT <= 0) {
        this.ringT = 1.6;
        for (let i = 0; i < 12; i++) fireBolt((i / 12) * Math.PI * 2 + this.t, 60, 6);
        game.audio.sfx('swing');
      }
      this.chase(dt, game, d);
    } else if (this.phase === 3) {
      this.hazardT -= dt;
      if (this.hazardT <= 0 && this.arena) {
        this.hazardT = 2.4;
        const a = this.arena;
        for (let i = 0; i < 2; i++) {
          game.hazards.push(new Hazard(a.x + 30 + this.rng.range(0, a.w - 60), a.y + 30 + this.rng.range(0, a.h - 50), 20, 7, 4, 'void', 'void'));
        }
        game.audio.sfx('boom');
      }
      this.summonT -= dt;
      if (this.summonT <= 0) {
        this.summonT = 6;
        const alive = game.enemies.filter((e) => e.minion && !e.dead).length;
        if (alive < 2) {
          const m = createEnemy('shadowKnight', 0, 0);
          m.minion = true;
          if (this.arena) {
            m.x = this.arena.x + 30 + this.rng.range(0, this.arena.w - 60);
            m.y = this.arena.y + 30 + this.rng.range(0, this.arena.h - 50);
          }
          game.enemies.push(m);
          game.audio.sfx('roar');
          game.toast('The King calls his knights!');
        }
      }
      this.spiralT -= dt;
      this.spiralAngle += dt * 2.4;
      if (this.spiralT <= 0) {
        this.spiralT = 0.18;
        fireBolt(this.spiralAngle, 75, 6);
      }
      this.dashCd -= dt;
      if (!p.dead && this.dashCd <= 0) {
        this.dashCd = 2.8;
        this.dashT = 0.45;
        this.dashDir = Math.atan2((p.y - 8) - (this.y - 14), p.x - this.x);
        this.dashHit = false;
        game.audio.sfx('dash');
      }
      this.chase(dt, game, d);
    } else {
      this.spiralT -= dt;
      this.spiralAngle += dt * 5.5;
      if (this.spiralT <= 0) {
        this.spiralT = 0.09;
        fireBolt(this.spiralAngle, 85, 7, 25);
        fireBolt(this.spiralAngle + Math.PI, 85, 7, 25);
      }
      this.novaT -= dt;
      if (this.novaT <= 0) {
        this.novaT = 3;
        for (let i = 0; i < 16; i++) fireBolt((i / 16) * Math.PI * 2, 65, 7);
        game.audio.sfx('roar');
        game.camera.shake(8);
        game.toast('THE CROWN BURNS!');
      }
      this.dashCd -= dt;
      if (!p.dead && this.dashCd <= 0) {
        this.dashCd = 1.6;
        this.dashT = 0.4;
        this.dashDir = Math.atan2((p.y - 8) - (this.y - 14), p.x - this.x);
        this.dashHit = false;
        game.audio.sfx('dash');
      }
      this.chase(dt, game, d * 0.5 + 30);
    }
  }

  private chase(dt: number, game: Game, d: number): void {
    const p = game.player;
    if (p.dead || d < 56) return;
    this.x += ((p.x - this.x) / d) * this.speed * this.slowFactor * dt;
    this.y += ((p.y - 8 - (this.y - 14)) / d) * this.speed * this.slowFactor * dt;
  }

  onDeath(game: Game): void {
    for (let i = 0; i < 60; i++) {
      game.particles.spawn({
        x: this.x + this.rng.range(-20, 20),
        y: this.y - 14 + this.rng.range(-20, 20),
        vx: this.rng.range(-120, 120),
        vy: this.rng.range(-160, 40),
        life: this.rng.range(0.6, 1.6),
        maxLife: 1.6,
        size: this.rng.range(1, 2.5),
        color: this.rng.pick(['#b08aff', '#ff3a5a', '#ffd76a', '#ffffff']),
        gravity: 60,
        shrink: true
      });
    }
    game.audio.sfx('boom');
    game.audio.sfx('roar');
    game.camera.shake(12);
    game.pickups.push(new Pickup(this.x - 12, this.y - 16, 'item', 1, 'bossShard'));
    game.pickups.push(new Pickup(this.x, this.y - 22, 'item', 1, 'bossShard'));
    game.pickups.push(new Pickup(this.x + 12, this.y - 16, 'item', 1, 'bossShard'));
    game.pickups.push(new Pickup(this.x - 6, this.y - 10, 'item', 1, 'bossShard'));
    game.pickups.push(new Pickup(this.x + 6, this.y - 10, 'item', 1, 'bossShard'));
    for (let i = 0; i < 14; i++) game.pickups.push(new Pickup(this.x + this.rng.range(-26, 26), this.y - 8, 'gold', 5));
    game.pickups.push(new Pickup(this.x, this.y - 28, 'heart', 30));
    game.player.gainXp(this.xpReward, game);
    this.dead = true;
    game.onEnemyKilled(this);
    game.toast('THE ASHEN CROWN IS YOURS!');
  }
}
