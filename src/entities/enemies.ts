import { Enemy } from './Enemy';
import type { Game } from '../game/Game';
import { Dir, dirFromVec, dist2 } from '../types';
import { Projectile } from './Projectile';
import { Hazard } from './Hazard';
import { DIR_VEC, rectsOverlap } from '../types';

export class Slime extends Enemy {
  name = 'Slime';
  artKey = 'slime';
  contactDamage = 4;
  xpReward = 8;
  goldMin = 1;
  goldMax = 4;
  speed = 0;
  aggroRange = 80;
  canSplit = true;
  private hopT = 0;
  private state: 'idle' | 'squash' | 'air' = 'idle';
  private squashT = 0;
  private groundY = 0;
  private jumpVy = 0;
  private jumpVx = 0;

  constructor(tx: number, ty: number) {
    super(tx, ty);
    this.hp = 5;
    this.maxHp = 5;
    this.groundY = this.y;
    this.w = 12;
    this.h = 8;
  }

  protected ai(dt: number, game: Game): void {
    const p = game.player;
    const d2 = dist2(this.x, this.y, p.x, p.y - 6);
    this.hopT -= dt;
    if (this.state === 'squash') {
      this.squashT -= dt;
      this.frameOverride = 1;
      if (this.squashT <= 0) {
        this.state = 'air';
        this.jumpVy = -95;
        const lunge = !p.dead && d2 < 80 * 80;
        if (lunge) {
          const d = Math.sqrt(d2) || 1;
          this.jumpVx = ((p.x - this.x) / d) * 85;
        } else {
          const a = this.rng.range(0, Math.PI * 2);
          this.jumpVx = Math.cos(a) * this.rng.range(20, 50);
        }
        game.audio.sfx('step');
      }
      return;
    }
    if (this.state === 'air') {
      this.frameOverride = 0;
      this.jumpVy += 420 * dt;
      this.y += this.jumpVy * dt;
      this.x += this.jumpVx * dt;
      game.clampToMap(this);
      if (this.jumpVy > 0 && this.y >= this.groundY) {
        this.y = this.groundY;
        this.state = 'idle';
        this.hopT = this.rng.range(0.7, 1.6);
        this.frameOverride = null;
        game.particles.burst(this.x, this.y, '#5ab04f', 4, 30, 1);
      }
      return;
    }
    this.frameOverride = null;
    if (this.hopT <= 0) {
      this.state = 'squash';
      this.squashT = 0.28;
    }
  }

  onDeath(game: Game): void {
    if (this.canSplit && !this.dead) {
      const mini1 = new SlimeMini(Math.floor(this.x / 16), Math.floor(this.y / 16));
      mini1.x = this.x - 6;
      mini1.y = this.y;
      const mini2 = new SlimeMini(Math.floor(this.x / 16), Math.floor(this.y / 16));
      mini2.x = this.x + 6;
      mini2.y = this.y;
      game.enemies.push(mini1, mini2);
      game.particles.burst(this.x, this.y - 6, '#5ab04f', 10, 70, 1);
      game.audio.sfx('smash');
    }
    super.onDeath(game);
  }
}

export class SlimeMini extends Slime {
  artKey = 'slimeMini';
  contactDamage = 2;
  xpReward = 3;
  goldMin = 1;
  goldMax = 2;
  canSplit = false;
  minion = true;

  constructor(tx: number, ty: number) {
    super(tx, ty);
    this.hp = 2;
    this.maxHp = 2;
    this.w = 6;
    this.h = 5;
    this.aggroRange = 70;
  }
}

export class ThornSprite extends Enemy {
  name = 'Thorn Sprite';
  artKey = 'thorn';
  contactDamage = 3;
  xpReward = 12;
  goldMin = 2;
  goldMax = 5;
  speed = 48;
  aggroRange = 150;
  element = 'nature' as const;
  private fireT = 1.2;
  private hoverT = 0;

  constructor(tx: number, ty: number) {
    super(tx, ty);
    this.hp = 7;
    this.maxHp = 7;
    this.w = 10;
    this.h = 10;
    this.solid = false;
  }

  protected ai(dt: number, game: Game): void {
    const p = game.player;
    this.hoverT += dt;
    this.fireT -= dt;
    const d2 = dist2(this.x, this.y - 6, p.x, p.y - 8);
    const d = Math.sqrt(d2) || 1;
    let mx = 0;
    let my = 0;
    if (!p.dead && d2 < this.aggroRange * this.aggroRange) {
      if (d < 62) {
        mx = (-(p.x - this.x) / d) * this.speed;
        my = (-(p.y - 8 - (this.y - 6)) / d) * this.speed;
      } else if (d > 120) {
        mx = ((p.x - this.x) / d) * this.speed;
        my = ((p.y - 8 - (this.y - 6)) / d) * this.speed;
      } else {
        const strafe = Math.sin(this.hoverT * 2.2) * this.speed * 0.6;
        mx = (-(p.y - 8 - (this.y - 6)) / d) * strafe;
        my = ((p.x - this.x) / d) * strafe * 0.4;
      }
      if (this.fireT <= 0) {
        this.fireT = 1.5 + this.rng.range(0, 0.5);
        this.attackT = 0.25;
        const dir: Dir = dirFromVec(p.x - this.x, (p.y - 8) - (this.y - 6));
        const spr = game.enemySprites['thornShot'] as HTMLCanvasElement;
        game.projectiles.push(new Projectile(this.x, this.y - 8, dir, 115, 5, { pierce: 0, element: 'nature', ttl: 3.2, fromPlayer: false, sprite: spr }));
        game.audio.sfx('swing');
      }
    } else {
      mx = Math.sin(this.hoverT * 0.8) * 12;
      my = Math.cos(this.hoverT * 1.1) * 8;
    }
    game.moveEntity(this, mx * dt * this.slowFactor, my * dt * this.slowFactor);
  }
}

export class ForestStalker extends Enemy {
  name = 'Forest Stalker';
  artKey = 'stalker';
  contactDamage = 7;
  xpReward = 18;
  goldMin = 3;
  goldMax = 7;
  speed = 62;
  aggroRange = 130;
  private ambushT = 0;
  private ambushCd = 0;
  private visible = false;

  constructor(tx: number, ty: number) {
    super(tx, ty);
    this.hp = 12;
    this.maxHp = 12;
    this.w = 12;
    this.h = 8;
  }

  protected ai(dt: number, game: Game): void {
    const p = game.player;
    const d2 = dist2(this.x, this.y - 6, p.x, p.y - 8);
    const d = Math.sqrt(d2) || 1;
    this.ambushCd -= dt;
    if (!p.dead && d2 < 95 * 95) this.visible = true;
    if (d2 > 140 * 140) this.visible = false;
    this.alpha = this.visible ? 1 : 0.3;
    let sp = this.speed;
    if (this.visible && this.ambushCd <= 0 && d < 95) {
      this.ambushT = 0.7;
      this.ambushCd = 2.6;
      this.attackT = 0.5;
      game.audio.sfx('dash');
    }
    this.ambushT -= dt;
    if (this.ambushT > 0) {
      sp = 150;
      this.frameOverride = 0;
    } else if (this.visible) {
      sp = this.speed;
    } else {
      sp = 10;
    }
    if (!p.dead && (this.visible || d2 < this.aggroRange * this.aggroRange)) {
      const mx = ((p.x - this.x) / d) * sp * this.slowFactor;
      const my = ((p.y - 8 - (this.y - 6)) / d) * sp * this.slowFactor;
      game.moveEntity(this, mx * dt, my * dt);
    } else {
      this.wanderT -= dt;
      if (this.wanderT <= 0) {
        this.wanderT = this.rng.range(1, 2.5);
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const dd = this.rng.pick(dirs);
        this.wx = dd[0] * 10;
        this.wy = dd[1] * 10;
      }
      game.moveEntity(this, this.wx * dt, this.wy * dt);
    }
  }
}

export class BogZombie extends Enemy {
  name = 'Bog Zombie';
  artKey = 'zombie';
  contactDamage = 8;
  xpReward = 16;
  goldMin = 2;
  goldMax = 6;
  speed = 24;
  aggroRange = 110;
  element = 'nature' as const;

  constructor(tx: number, ty: number) {
    super(tx, ty);
    this.hp = 22;
    this.maxHp = 22;
    this.w = 11;
    this.h = 9;
    this.animSpeed = 3;
  }

  protected ai(dt: number, game: Game): void {
    const p = game.player;
    const d2 = dist2(this.x, this.y - 6, p.x, p.y - 8);
    if (!p.dead && d2 < this.aggroRange * this.aggroRange) {
      const d = Math.sqrt(d2) || 1;
      if (d < 22) this.attackT = 0.4;
      const mx = ((p.x - this.x) / d) * this.speed * this.slowFactor;
      const my = ((p.y - 8 - (this.y - 6)) / d) * this.speed * this.slowFactor;
      game.moveEntity(this, mx * dt, my * dt);
    } else {
      this.wanderT -= dt;
      if (this.wanderT <= 0) {
        this.wanderT = this.rng.range(1.5, 3);
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const dd = this.rng.pick(dirs);
        this.wx = dd[0] * 10;
        this.wy = dd[1] * 10;
      }
      game.moveEntity(this, this.wx * dt, this.wy * dt);
    }
  }
}

export class AcidToad extends Enemy {
  name = 'Acid Toad';
  artKey = 'toad';
  contactDamage = 5;
  xpReward = 14;
  goldMin = 2;
  goldMax = 5;
  aggroRange = 120;
  element = 'nature' as const;
  private hopT = 0;
  private state: 'idle' | 'squash' | 'air' = 'idle';
  private squashT = 0;
  private groundY = 0;
  private jumpVy = 0;
  private jumpVx = 0;
  private spitT = 1.6;

  constructor(tx: number, ty: number) {
    super(tx, ty);
    this.hp = 9;
    this.maxHp = 9;
    this.groundY = this.y;
    this.w = 12;
    this.h = 8;
  }

  protected ai(dt: number, game: Game): void {
    const p = game.player;
    const d2 = dist2(this.x, this.y, p.x, p.y - 6);
    this.hopT -= dt;
    this.spitT -= dt;
    if (!p.dead && d2 < 120 * 120 && this.spitT <= 0) {
      this.spitT = 2.3;
      this.attackT = 0.3;
      const d = Math.sqrt(d2) || 1;
      const dir: Dir = dirFromVec(p.x - this.x, (p.y - 8) - (this.y - 6));
      const glob = new Projectile(this.x, this.y - 8, dir, 100, 5, {
        pierce: 0,
        element: 'nature',
        ttl: 3,
        fromPlayer: false,
        sprite: game.enemySprites['toadGlob'] as HTMLCanvasElement,
        onHit: (g, x, y) => {
          g.hazards.push(new Hazard(x, y + 4, 13, 3, 6, 'nature'));
          g.particles.burst(x, y, '#8ae06a', 8, 50, 1);
        }
      });
      game.projectiles.push(glob);
      game.audio.sfx('swing');
    }
    if (this.state === 'squash') {
      this.squashT -= dt;
      this.frameOverride = 1;
      if (this.squashT <= 0) {
        this.state = 'air';
        this.jumpVy = -110;
        const lunge = !p.dead && d2 < 90 * 90;
        if (lunge) {
          const d = Math.sqrt(d2) || 1;
          this.jumpVx = ((p.x - this.x) / d) * 70;
        } else {
          const a = this.rng.range(0, Math.PI * 2);
          this.jumpVx = Math.cos(a) * this.rng.range(20, 45);
        }
      }
      return;
    }
    if (this.state === 'air') {
      this.frameOverride = 1;
      this.jumpVy += 430 * dt;
      this.y += this.jumpVy * dt;
      this.x += this.jumpVx * dt;
      game.clampToMap(this);
      if (this.jumpVy > 0 && this.y >= this.groundY) {
        this.y = this.groundY;
        this.state = 'idle';
        this.hopT = this.rng.range(0.9, 1.8);
        this.frameOverride = null;
        game.particles.burst(this.x, this.y, '#5a8a3a', 4, 30, 1);
      }
      return;
    }
    this.frameOverride = null;
    if (this.hopT <= 0) {
      this.state = 'squash';
      this.squashT = 0.3;
    }
  }
}

export class Wisp extends Enemy {
  name = 'Wisp';
  artKey = 'wisp';
  contactDamage = 4;
  xpReward = 15;
  goldMin = 2;
  goldMax = 6;
  speed = 42;
  aggroRange = 150;
  fly = true;
  emitsLight = true;
  element = 'void' as const;
  private fireT = 1.4;
  private blinkT = 2;

  constructor(tx: number, ty: number) {
    super(tx, ty);
    this.hp = 8;
    this.maxHp = 8;
    this.w = 10;
    this.h = 10;
    this.solid = false;
    this.animSpeed = 4;
  }

  protected ai(dt: number, game: Game): void {
    const p = game.player;
    this.fireT -= dt;
    this.blinkT -= dt;
    const d2 = dist2(this.x, this.y - 6, p.x, p.y - 8);
    const d = Math.sqrt(d2) || 1;
    if (this.blinkT <= 0) {
      this.blinkT = this.rng.range(1.8, 3.2);
      game.particles.burst(this.x, this.y - 6, '#8ae0ff', 10, 60, 1.5);
      for (let tries = 0; tries < 8; tries++) {
        const nx = this.x + this.rng.range(-70, 70);
        const ny = this.y + this.rng.range(-50, 50);
        if (!game.isSolidAt(nx, ny) || game.map?.layers.ground[Math.floor(ny / 16)]?.[Math.floor(nx / 16)] === '~') {
          this.x = nx;
          this.y = ny;
          break;
        }
      }
      game.particles.burst(this.x, this.y - 6, '#8ae0ff', 10, 60, 1.5);
      game.audio.sfx('dash');
      return;
    }
    let mx = 0;
    let my = 0;
    if (!p.dead && d2 < this.aggroRange * this.aggroRange) {
      if (d > 85) {
        mx = ((p.x - this.x) / d) * this.speed;
        my = ((p.y - 8 - (this.y - 6)) / d) * this.speed;
      } else if (d < 55) {
        mx = (-(p.x - this.x) / d) * this.speed;
        my = (-(p.y - 8 - (this.y - 6)) / d) * this.speed;
      }
      if (this.fireT <= 0) {
        this.fireT = 1.7;
        this.attackT = 0.25;
        const dir: Dir = dirFromVec(p.x - this.x, (p.y - 8) - (this.y - 6));
        game.projectiles.push(new Projectile(this.x, this.y - 6, dir, 135, 6, { pierce: 0, element: 'void', ttl: 3, fromPlayer: false, sprite: game.enemySprites['wispBolt'] as HTMLCanvasElement }));
        game.audio.sfx('swing');
      }
    } else {
      mx = Math.sin(this.t * 0.9) * 16;
      my = Math.cos(this.t * 1.2) * 12;
    }
    game.moveEntity(this, mx * dt * this.slowFactor, my * dt * this.slowFactor);
  }
}

export class MagmaGolem extends Enemy {
  name = 'Magma Golem';
  artKey = 'golem';
  contactDamage = 8;
  xpReward = 24;
  goldMin = 3;
  goldMax = 8;
  speed = 17;
  aggroRange = 120;
  element = 'fire' as const;
  private slamCd = 2.5;
  private teleT = 0;

  constructor(tx: number, ty: number) {
    super(tx, ty);
    this.hp = 32;
    this.maxHp = 32;
    this.w = 15;
    this.h = 12;
    this.animSpeed = 3;
  }

  getDefense(): number {
    return 3;
  }

  protected ai(dt: number, game: Game): void {
    const p = game.player;
    const d2 = dist2(this.x, this.y - 8, p.x, p.y - 8);
    const d = Math.sqrt(d2) || 1;
    this.slamCd -= dt;
    if (this.teleT > 0) {
      this.teleT -= dt;
      this.attackT = 0.1;
      if (this.teleT <= 0) {
        game.audio.sfx('boom');
        game.camera.shake(7);
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2;
          game.particles.spawn({ x: this.x, y: this.y - 8, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, life: 0.4, maxLife: 0.4, size: 2, color: '#ff8a2e', gravity: 0, shrink: true });
        }
        if (!p.dead && d < 62) {
          game.combat.applyDamage(p, 12, { dir: dirFromVec(p.x - this.x, (p.y - 8) - (this.y - 8)), knockback: 280, element: 'fire', crit: false, source: this });
        }
      }
      return;
    }
    if (!p.dead && d2 < 120 * 120) {
      game.moveEntity(this, ((p.x - this.x) / d) * this.speed * this.slowFactor * dt, ((p.y - 8 - (this.y - 8)) / d) * this.speed * this.slowFactor * dt);
      if (d < 62 && this.slamCd <= 0) {
        this.slamCd = 3.2;
        this.teleT = 0.7;
        game.audio.sfx('charge');
      }
    } else {
      this.wanderT -= dt;
      if (this.wanderT <= 0) {
        this.wanderT = this.rng.range(1.5, 3);
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const dd = this.rng.pick(dirs);
        this.wx = dd[0] * 8;
        this.wy = dd[1] * 8;
      }
      game.moveEntity(this, this.wx * dt, this.wy * dt);
    }
  }
}

export class CinderArcher extends Enemy {
  name = 'Cinder Archer';
  artKey = 'archer';
  contactDamage = 5;
  xpReward = 16;
  goldMin = 2;
  goldMax = 6;
  speed = 55;
  aggroRange = 160;
  element = 'fire' as const;
  private fireT = 1.5;

  constructor(tx: number, ty: number) {
    super(tx, ty);
    this.hp = 10;
    this.maxHp = 10;
    this.w = 10;
    this.h = 9;
  }

  protected ai(dt: number, game: Game): void {
    const p = game.player;
    this.fireT -= dt;
    const d2 = dist2(this.x, this.y - 6, p.x, p.y - 8);
    const d = Math.sqrt(d2) || 1;
    let mx = 0;
    let my = 0;
    if (!p.dead && d2 < this.aggroRange * this.aggroRange) {
      if (d < 85) {
        mx = (-(p.x - this.x) / d) * this.speed;
        my = (-(p.y - 8 - (this.y - 6)) / d) * this.speed;
      } else if (d > 140) {
        mx = ((p.x - this.x) / d) * this.speed;
        my = ((p.y - 8 - (this.y - 6)) / d) * this.speed;
      } else {
        const s = Math.sin(this.t * 2.6) * this.speed * 0.6;
        mx = (-(p.y - 8 - (this.y - 6)) / d) * s;
        my = ((p.x - this.x) / d) * s * 0.4;
      }
      if (this.fireT <= 0) {
        this.fireT = 1.9;
        this.attackT = 0.3;
        const dir: Dir = dirFromVec(p.x - this.x, (p.y - 8) - (this.y - 6));
        game.projectiles.push(new Projectile(this.x, this.y - 8, dir, 135, 6, { pierce: 0, element: 'fire', ttl: 3.5, fromPlayer: false, sprite: game.enemySprites['arrow'] as HTMLCanvasElement }));
        game.audio.sfx('swing');
      }
    }
    game.moveEntity(this, mx * dt * this.slowFactor, my * dt * this.slowFactor);
  }
}

export class FireBat extends Enemy {
  name = 'Fire Bat';
  artKey = 'bat';
  contactDamage = 5;
  xpReward = 10;
  goldMin = 1;
  goldMax = 4;
  speed = 72;
  aggroRange = 150;
  fly = true;
  element = 'fire' as const;
  private dirT = 0;
  private swoopT = 0;
  private swoopCd = 1.4;

  constructor(tx: number, ty: number) {
    super(tx, ty);
    this.hp = 6;
    this.maxHp = 6;
    this.w = 10;
    this.h = 7;
    this.solid = false;
    this.animSpeed = 10;
  }

  protected ai(dt: number, game: Game): void {
    const p = game.player;
    const d2 = dist2(this.x, this.y - 5, p.x, p.y - 6);
    const d = Math.sqrt(d2) || 1;
    this.dirT -= dt;
    this.swoopCd -= dt;
    let mx: number;
    let my: number;
    if (!p.dead && d < 80 && this.swoopCd <= 0) {
      this.swoopT = 0.35;
      this.swoopCd = 1.6;
      this.attackT = 0.3;
    }
    this.swoopT -= dt;
    if (this.swoopT > 0 && !p.dead) {
      mx = ((p.x - this.x) / d) * 160;
      my = ((p.y - 6 - (this.y - 5)) / d) * 160;
    } else {
      if (this.dirT <= 0) {
        this.dirT = this.rng.range(0.25, 0.5);
        const a = this.rng.range(0, Math.PI * 2);
        this.wx = Math.cos(a) * this.speed;
        this.wy = Math.sin(a) * this.speed * 0.6;
        if (!p.dead && d2 < this.aggroRange * this.aggroRange) {
          this.wx += ((p.x - this.x) / d) * this.speed * 0.7;
          this.wy += ((p.y - 6 - (this.y - 5)) / d) * this.speed * 0.7;
        }
      }
      mx = this.wx;
      my = this.wy;
    }
    game.moveEntity(this, mx * dt * this.slowFactor, my * dt * this.slowFactor);
  }
}


export class ShadowKnight extends Enemy {
  name = 'Shadow Knight';
  artKey = 'knight';
  contactDamage = 8;
  xpReward = 30;
  goldMin = 4;
  goldMax = 9;
  speed = 72;
  aggroRange = 170;
  element = 'void' as const;
  private state: 'chase' | 'dash' | 'combo' = 'chase';
  private stateT = 0;
  private comboHit = 0;
  private dashDir: Dir = 'down';

  constructor(tx: number, ty: number) {
    super(tx, ty);
    this.hp = 26;
    this.maxHp = 26;
    this.w = 11;
    this.h = 10;
    this.animSpeed = 8;
  }

  getDefense(): number {
    return 2;
  }

  protected ai(dt: number, game: Game): void {
    const p = game.player;
    const d2 = dist2(this.x, this.y - 8, p.x, p.y - 8);
    const d = Math.sqrt(d2) || 1;
    this.stateT -= dt;
    if (this.state === 'dash') {
      this.attackT = 0.1;
      game.moveEntity(this, Math.cos(this.attackAngle()) * 195 * dt, Math.sin(this.attackAngle()) * 195 * dt);
      if (this.stateT <= 0) {
        this.state = 'combo';
        this.stateT = 0.9;
        this.comboHit = 0;
      }
      return;
    }
    if (this.state === 'combo') {
      this.attackT = 0.12;
      if (this.stateT <= 0) {
        this.state = 'chase';
        this.stateT = 0.8;
        return;
      }
      const hitPoint = 0.9 - this.stateT;
      const idx = Math.floor((0.9 - this.stateT) / 0.3);
      if (idx > this.comboHit && idx < 3 && !p.dead) {
        this.comboHit = idx;
        const dv = DIR_VEC[this.dir];
        const box = { x: this.x + dv.x * 12 - 7, y: this.y - 8 + dv.y * 12 - 7, w: 14, h: 14 };
        game.combat.melee(box, 9, { dir: this.dir, knockback: 200, element: 'void', crit: false, source: this });
        game.audio.sfx('swing');
      }
      return;
    }
    if (!p.dead && d2 < this.aggroRange * this.aggroRange) {
      this.dir = dirFromVec(p.x - this.x, (p.y - 8) - (this.y - 8));
      if (d < 95 && this.stateT <= 0) {
        this.state = 'dash';
        this.stateT = 0.28;
        game.audio.sfx('dash');
      } else {
        game.moveEntity(this, ((p.x - this.x) / d) * this.speed * this.slowFactor * dt, ((p.y - 8 - (this.y - 8)) / d) * this.speed * this.slowFactor * dt);
      }
    }
  }

  private attackAngle(): number {
    const p = (this as unknown as { gameRef?: Game }).gameRef;
    void p;
    return Math.atan2(DIR_VEC[this.dir].y, DIR_VEC[this.dir].x);
  }
}

export class VoidMage extends Enemy {
  name = 'Void Mage';
  artKey = 'mage';
  contactDamage = 5;
  xpReward = 28;
  goldMin = 4;
  goldMax = 8;
  speed = 30;
  aggroRange = 180;
  element = 'void' as const;
  private tpT = 1.5;
  private fireT = 2;

  constructor(tx: number, ty: number) {
    super(tx, ty);
    this.hp = 14;
    this.maxHp = 14;
    this.w = 10;
    this.h = 9;
  }

  protected ai(dt: number, game: Game): void {
    const p = game.player;
    this.tpT -= dt;
    this.fireT -= dt;
    if (this.tpT <= 0) {
      this.tpT = this.rng.range(1.8, 2.8);
      game.particles.burst(this.x, this.y - 8, '#b08aff', 10, 60, 1.5);
      for (let tries = 0; tries < 10; tries++) {
        const nx = this.x + this.rng.range(-90, 90);
        const ny = this.y + this.rng.range(-70, 70);
        if (!game.isSolidAt(nx, ny)) {
          this.x = nx;
          this.y = ny;
          break;
        }
      }
      game.particles.burst(this.x, this.y - 8, '#b08aff', 10, 60, 1.5);
      game.audio.sfx('dash');
      return;
    }
    const d2 = dist2(this.x, this.y - 6, p.x, p.y - 8);
    if (!p.dead && d2 < this.aggroRange * this.aggroRange) {
      const d = Math.sqrt(d2) || 1;
      if (d > 70) game.moveEntity(this, ((p.x - this.x) / d) * this.speed * dt, ((p.y - 8 - (this.y - 6)) / d) * this.speed * dt);
      if (this.fireT <= 0) {
        this.fireT = 2.1;
        this.attackT = 0.3;
        const spr = game.enemySprites['voidBolt'] as HTMLCanvasElement;
        const base = Math.atan2((p.y - 8) - (this.y - 6), p.x - this.x);
        for (let i = 0; i < 3; i++) {
          const a = base + (i - 1) * 0.35;
          const pj = new Projectile(this.x, this.y - 6, 'down', 0, 6, { pierce: 0, element: 'void', ttl: 4, fromPlayer: false, sprite: spr, homing: i === 1 ? 30 : 0 });
          pj.vx = Math.cos(a) * 95;
          pj.vy = Math.sin(a) * 95;
          game.projectiles.push(pj);
        }
        game.audio.sfx('swing');
      }
    }
  }
}

export class FallenGuard extends Enemy {
  name = 'Fallen Guard';
  artKey = 'guard';
  contactDamage = 9;
  xpReward = 34;
  goldMin = 5;
  goldMax = 10;
  speed = 20;
  aggroRange = 130;
  element = 'void' as const;
  private slamCd = 3;
  private teleT = 0;
  private chargeT = 0;
  private chargeDir = 0;

  constructor(tx: number, ty: number) {
    super(tx, ty);
    this.hp = 42;
    this.maxHp = 42;
    this.w = 15;
    this.h = 13;
    this.animSpeed = 3;
  }

  getDefense(): number {
    return 4;
  }

  protected ai(dt: number, game: Game): void {
    const p = game.player;
    const d2 = dist2(this.x, this.y - 8, p.x, p.y - 8);
    const d = Math.sqrt(d2) || 1;
    const front = dirFromVec(p.x - this.x, (p.y - 8) - (this.y - 8));
    this.shieldDir = !p.dead && d < 80 ? front : null;
    this.slamCd -= dt;
    if (this.teleT > 0) {
      this.teleT -= dt;
      this.attackT = 0.1;
      if (this.teleT <= 0) {
        game.audio.sfx('boom');
        game.camera.shake(6);
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          game.particles.spawn({ x: this.x, y: this.y - 8, vx: Math.cos(a) * 80, vy: Math.sin(a) * 80, life: 0.4, maxLife: 0.4, size: 2, color: '#8a8aa8', gravity: 0, shrink: true });
        }
        if (!p.dead && d < 58) {
          game.combat.applyDamage(p, 11, { dir: front, knockback: 260, element: 'void', crit: false, source: this });
        }
      }
      return;
    }
    if (this.chargeT > 0) {
      this.chargeT -= dt;
      this.x += Math.cos(this.chargeDir) * 210 * dt;
      this.y += Math.sin(this.chargeDir) * 210 * dt;
      game.clampToMap(this);
      if (!p.dead && rectsOverlap(this.hitbox, p.hitbox)) {
        game.combat.applyDamage(p, 13, { dir: front, knockback: 300, element: 'void', crit: false, source: this });
        this.chargeT = 0;
      }
      if (this.chargeT <= 0) this.shieldDir = null;
      return;
    }
    if (!p.dead && d2 < this.aggroRange * this.aggroRange) {
      this.dir = front;
      if (d < 60 && this.slamCd <= 0) {
        if (this.rng.chance(0.5)) {
          this.slamCd = 3.4;
          this.teleT = 0.65;
          game.audio.sfx('charge');
        } else {
          this.slamCd = 3.4;
          this.chargeT = 0.5;
          this.chargeDir = Math.atan2((p.y - 8) - (this.y - 8), p.x - this.x);
          game.audio.sfx('roar');
        }
      } else {
        game.moveEntity(this, ((p.x - this.x) / d) * this.speed * this.slowFactor * dt, ((p.y - 8 - (this.y - 8)) / d) * this.speed * this.slowFactor * dt);
      }
    }
  }
}

export function createEnemy(kind: string, tx: number, ty: number): Enemy {
  switch (kind) {
    case 'slime':
      return new Slime(tx, ty);
    case 'slimeMini':
      return new SlimeMini(tx, ty);
    case 'thornSprite':
      return new ThornSprite(tx, ty);
    case 'forestStalker':
      return new ForestStalker(tx, ty);
    case 'bogZombie':
      return new BogZombie(tx, ty);
    case 'acidToad':
      return new AcidToad(tx, ty);
    case 'wisp':
      return new Wisp(tx, ty);
    case 'magmaGolem':
      return new MagmaGolem(tx, ty);
    case 'cinderArcher':
      return new CinderArcher(tx, ty);
    case 'fireBat':
      return new FireBat(tx, ty);
    case 'shadowKnight':
      return new ShadowKnight(tx, ty);
    case 'voidMage':
      return new VoidMage(tx, ty);
    case 'fallenGuard':
      return new FallenGuard(tx, ty);
    default:
      return new Slime(tx, ty);
  }
}
