import { Entity } from './Entity';
import type { Game } from '../game/Game';
import { Dir, DIR_VEC, dirFromVec, clamp, Element, ItemId } from '../types';
import { Inventory } from '../systems/Inventory';
import { AnimationController } from '../graphics/AnimationController';
import { drawSprite, tinted } from '../graphics/PixelArt';
import { Projectile } from './Projectile';

const COMBO_DUR = 0.26;
const COMBO_CD = 0.34;
const COMBO_MULT = [1, 1, 1.6];
const CHARGE_TIME = 0.45;
const CHARGE_MANA = 20;
const DASH_TIME = 0.18;
const DASH_SPEED = 250;
const DASH_COST = 25;
const DASH_CD = 0.45;

interface Ghost {
  x: number;
  y: number;
  dir: Dir;
  frame: number;
  alpha: number;
}

export class Player extends Entity {
  level = 1;
  xp = 0;
  maxHp = 40;
  hp = 40;
  maxStamina = 100;
  stamina = 100;
  maxMana = 30;
  mana = 30;
  baseAttack = 4;
  gold = 0;
  speed = 80;
  inv = new Inventory();
  anim = new AnimationController();
  attackT = 0;
  attackCd = 0;
  combo = 0;
  swingId = 0;
  hitsApplied = new Set<number>();
  chargeT = 0;
  charging = false;
  dashT = 0;
  dashCd = 0;
  dashDir: Dir = 'down';
  ghosts: Ghost[] = [];
  stepT = 0;
  hurtT = 0;
  potionCd = 0;
  shieldOn = false;

  constructor() {
    super();
    this.w = 10;
    this.h = 8;
    this.maxHp = 40;
    this.hp = 40;
  }

  get xpNext(): number {
    return Math.floor(30 * Math.pow(this.level, 1.35));
  }

  get attack(): number {
    return this.baseAttack + this.inv.weaponInfo().dmg;
  }

  getDefense(): number {
    return this.inv.armorInfo().def;
  }

  gainXp(n: number, game: Game): void {
    this.xp += n;
    game.audio.sfx('xp');
    game.particles.healText(this.x, this.y - 26, '+' + n + ' XP', '#8ae0ff');
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      game.pendingLevelUps++;
      game.audio.sfx('levelup');
      game.toast('LEVEL UP! Choose a bonus');
    }
  }

  usePotion(game: Game): boolean {
    if (this.inv.count('potion') <= 0 || this.potionCd > 0) return false;
    if (this.hp >= this.maxHp) return false;
    this.inv.remove('potion');
    this.hp = Math.min(this.maxHp, this.hp + Math.ceil(this.maxHp * 0.4));
    this.potionCd = 0.5;
    game.audio.sfx('potion');
    game.particles.burst(this.x, this.y - 10, '#ff6a7a', 12, 60, 1);
    game.particles.healText(this.x, this.y - 26, '+' + Math.ceil(this.maxHp * 0.4), '#ff8a9a');
    return true;
  }

  useEther(game: Game): boolean {
    if (this.inv.count('ether') <= 0) return false;
    if (this.mana >= this.maxMana) return false;
    this.inv.remove('ether');
    this.mana = Math.min(this.maxMana, this.mana + 20);
    game.audio.sfx('potion');
    game.particles.healText(this.x, this.y - 26, '+20 MP', '#7ab8ff');
    return true;
  }

  update(dt: number, game: Game): void {
    const input = game.input;
    this.tickStatus(game.time);
    this.invulnT = Math.max(0, this.invulnT - dt);
    this.flashT = Math.max(0, this.flashT - dt);
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.dashCd = Math.max(0, this.dashCd - dt);
    this.potionCd = Math.max(0, this.potionCd - dt);
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.decayKnockback(dt);

    const canAct = this.attackT <= 0 && this.dashT <= 0;

    if (input.hit('Digit4') || input.hit('KeyH')) this.usePotion(game);
    if (input.hit('KeyR')) this.useEther(game);
    if (input.hit('Digit1') || input.hit('Digit2') || input.hit('Digit3')) {
      const n = input.hit('Digit1') ? 0 : input.hit('Digit2') ? 1 : 2;
      if (this.inv.relics[n]) {
        this.inv.activeRelic = n;
        game.audio.sfx('cursor');
      } else game.audio.sfx('error');
    }
    if (input.hit('KeyQ') || input.hit('KeyE')) {
      if (this.inv.relics.length > 0) {
        const d = input.hit('KeyQ') ? -1 : 1;
        this.inv.activeRelic = (this.inv.activeRelic + d + this.inv.relics.length) % this.inv.relics.length;
        game.audio.sfx('cursor');
      }
    }

    const atkEdge = input.attackPressed();
    if (atkEdge && canAct && this.chargeT < CHARGE_TIME * 0.6) {
      if (this.attackT <= 0) this.combo = 0;
      else this.combo = (this.combo + 1) % 3;
      this.attackT = COMBO_DUR;
      this.attackCd = COMBO_CD;
      this.swingId++;
      this.hitsApplied.clear();
      game.audio.sfx('swing');
      this.anim.setState('attack');
    }

    if (input.attackHeld()) {
      this.chargeT += dt;
      if (this.chargeT >= CHARGE_TIME && !this.charging) {
        this.charging = true;
        game.audio.sfx('charge');
      }
    } else {
      if (this.charging) {
        if (this.mana >= CHARGE_MANA) {
          this.mana -= CHARGE_MANA;
          const dv = DIR_VEC[this.anim.dir];
          game.projectiles.push(new Projectile(this.x + dv.x * 10, this.y - 8 + dv.y * 10, this.anim.dir, 230, Math.round(this.attack * 2.2), { pierce: 3, element: 'none', sprite: game.sprites.props['shockwave'] }));
          game.audio.sfx('release');
          game.camera.shake(3);
          game.particles.burst(this.x, this.y - 8, '#eaf4ff', 10, 80, 1);
        } else {
          game.toast('Not enough mana!');
          game.audio.sfx('error');
        }
      }
      this.charging = false;
      this.chargeT = 0;
    }

    if ((input.hit('KeyK') || input.hit('KeyX') || input.hit('Space')) && this.dashT <= 0 && this.dashCd <= 0) {
      if (this.inv.hasRelic('windBoots')) {
        if (this.stamina >= DASH_COST) {
          this.stamina -= DASH_COST;
          this.dashT = DASH_TIME;
          this.dashCd = DASH_CD;
          const a = input.axis();
          this.dashDir = a.x !== 0 || a.y !== 0 ? dirFromVec(a.x, a.y) : this.anim.dir;
          this.invulnT = Math.max(this.invulnT, 0.28);
          game.audio.sfx('dash');
        } else {
          game.toast('Too exhausted to dash!');
          game.audio.sfx('error');
        }
      } else {
        game.toast('Dash requires the Wind Boots relic');
        game.audio.sfx('error');
      }
    }

    let mx = 0;
    let my = 0;
    if (this.attackT <= 0 && this.dashT <= 0) {
      const a = input.axis();
      mx = a.x;
      my = a.y;
    }
    if (this.dashT > 0) {
      this.dashT -= dt;
      mx = DIR_VEC[this.dashDir].x;
      my = DIR_VEC[this.dashDir].y;
      this.ghosts.push({ x: this.x, y: this.y, dir: this.anim.dir, frame: this.anim.frameIndex, alpha: 0.5 });
      if (this.ghosts.length > 12) this.ghosts.shift();
    }
    for (const g of this.ghosts) g.alpha -= dt * 2.2;
    this.ghosts = this.ghosts.filter((g) => g.alpha > 0);

    const wantShield = this.inv.hasRelic('frostAegis') && this.attackT <= 0 && this.dashT <= 0 && (input.down('KeyC') || input.mouse.rightDown);
    if (wantShield && this.stamina > 0) {
      this.shieldOn = true;
      this.stamina = Math.max(0, this.stamina - 22 * dt);
      game.freezeLavaAround(this);
      if (this.stamina <= 0) this.shieldOn = false;
    } else {
      this.shieldOn = false;
    }

    const sp = (this.dashT > 0 ? DASH_SPEED : this.speed) * this.slowFactor * (this.shieldOn ? 0.55 : 1);
    if (mx !== 0 || my !== 0) {
      const d = dirFromVec(mx, my);
      if (this.attackT <= 0) this.anim.setState('walk', d);
      else this.anim.dir = d;
      game.moveEntity(this, mx * sp * dt, my * sp * dt);
      this.stepT += dt * sp * 0.05;
      if (this.stepT > 1) {
        this.stepT = 0;
        game.audio.sfx('step');
      }
    } else if (this.attackT <= 0 && this.dashT <= 0) {
      this.anim.setState('idle');
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    game.clampToMap(this);

    if (this.attackT > 0) {
      this.attackT -= dt;
      this.anim.update(dt);
      const active = this.attackT < COMBO_DUR - 0.06 && this.attackT > COMBO_DUR - 0.2;
      if (active && !this.hitsApplied.has(this.swingId)) {
        this.hitsApplied.add(this.swingId);
        const dv = DIR_VEC[this.anim.dir];
        const reach = 15;
        const box = {
          x: this.x + dv.x * reach - (dv.y !== 0 ? 8 : 0) - (dv.x !== 0 ? reach / 2 : 0),
          y: this.y - 8 + dv.y * reach - (dv.x !== 0 ? 8 : 0) - (dv.y !== 0 ? reach / 2 : 0),
          w: dv.x !== 0 ? reach : 16,
          h: dv.y !== 0 ? reach : 16
        };
        const crit = Math.random() < 0.12;
        const base = this.attack * COMBO_MULT[this.combo] * (0.9 + Math.random() * 0.2);
        game.combat.melee(box, crit ? Math.round(base * 1.75) : Math.round(base), { dir: this.anim.dir, knockback: crit ? 200 : 120, element: 'none' as Element, crit, source: this });
      }
      if (this.attackT <= 0) this.anim.setState('idle');
    } else {
      this.anim.update(dt);
    }

    this.stamina = Math.min(this.maxStamina, this.stamina + dt * (this.dashT > 0 ? 0 : 14));
    this.mana = Math.min(this.maxMana, this.mana + dt * 5);
  }

  onHurt(game: Game): void {
    this.hurtT = 0.25;
    this.invulnT = 0.7;
    this.anim.setState('hurt');
    game.audio.sfx('hurt');
    game.camera.shake(4);
    game.particles.burst(this.x, this.y - 10, '#e04a5a', 10, 80, 1);
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    const spr = game.sprites.chars['player'];
    for (const g of this.ghosts) {
      ctx.globalAlpha = g.alpha;
      const set = g.dir === 'left' ? spr.sideLeft : g.dir === 'right' ? spr.side : g.dir === 'up' ? spr.up : spr.down;
      drawSprite(ctx, set[g.frame % set.length], g.x - 8, g.y - 24);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 1, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    if (this.invulnT > 0 && Math.floor(game.time * 20) % 2 === 0 && this.hurtT <= 0) {
      ctx.globalAlpha = 0.45;
    }
    if (this.charging) {
      ctx.fillStyle = 'rgba(159,216,255,0.25)';
      ctx.beginPath();
      ctx.arc(this.x, this.y - 10, 10 + Math.sin(game.time * 20) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (this.shieldOn) {
      const dv = DIR_VEC[this.anim.dir];
      const base = Math.atan2(dv.y, dv.x);
      ctx.strokeStyle = 'rgba(159,216,255,0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 8, 15, base - 1.1, base + 1.1);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(234,248,255,0.95)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 8, 13, base - 1.0, base + 1.0);
      ctx.stroke();
    }
    const frame = this.anim;
    if (frame.state === 'dead') {
      drawSprite(ctx, spr.dead, this.x - 8, this.y - 16);
    } else if (frame.state === 'attack') {
      const set = frame.dir === 'left' ? spr.sideLeft : frame.dir === 'right' ? spr.side : frame.dir === 'up' ? spr.up : spr.down;
      const fr = set[0];
      drawSprite(ctx, this.flashT > 0 ? tinted(fr, '#ffffff') : fr, this.x - 8, this.y - 24);
      drawSprite(ctx, spr.slash[frame.dir][frame.attackFrame], this.x - 8, this.y - 16);
    } else {
      const set = frame.dir === 'left' ? spr.sideLeft : frame.dir === 'right' ? spr.side : frame.dir === 'up' ? spr.up : spr.down;
      const fr = set[frame.frameIndex % set.length];
      drawSprite(ctx, this.flashT > 0 ? tinted(fr, '#ff8080') : fr, this.x - 8, this.y - 24);
    }
    ctx.globalAlpha = 1;
  }
}
