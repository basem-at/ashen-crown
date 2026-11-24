import type { Game } from '../game/Game';
import { Entity } from '../entities/Entity';
import { Element, Rect, rectsOverlap, DIR_VEC } from '../types';

export interface HitOpts {
  knockback: number;
  element: Element;
  crit: boolean;
  source: Entity | null;
  dir?: 'down' | 'up' | 'left' | 'right';
}

const ELEMENT_COLOR: Record<Element, string> = {
  none: '#ffffff',
  fire: '#ff9a2e',
  frost: '#9fd8ff',
  void: '#b08aff',
  nature: '#8ae06a'
};

export class CombatSystem {
  constructor(private game: Game) {}

  melee(box: Rect, dmg: number, opts: HitOpts): number {
    let hits = 0;
    const targets = [...this.game.enemies, ...this.game.destructibles];
    for (const t of targets) {
      if (t.dead || t.invulnT > 0) continue;
      if (!rectsOverlap(box, t.hitbox)) continue;
      this.applyDamage(t, dmg, opts);
      hits++;
    }
    return hits;
  }

  applyDamage(target: Entity, raw: number, opts: HitOpts): void {
    if (target.dead || target.invulnT > 0) return;
    const def = target.getDefense();
    let dmg = Math.max(1, Math.round(raw - def * 0.6));
    if (target.shieldDir) {
      const sd = DIR_VEC[target.shieldDir];
      const od = DIR_VEC[opts.dir ?? 'down'];
      if (sd.x === od.x && sd.y === od.y) dmg = Math.max(1, Math.round(dmg * 0.15));
    }
    if (opts.element === 'void' && target === this.game.player) {
      this.game.player.mana = Math.max(0, this.game.player.mana - 5);
    }
    if (opts.element === 'fire') dmg += Math.round(dmg * 0.25);
    if (opts.element === 'frost') dmg += 1;
    target.hp -= dmg;
    target.flashT = 0.12;
    const dir = opts.dir ?? 'down';
    const dv = DIR_VEC[dir];
    target.applyKnockback(dv.x * opts.knockback, dv.y * opts.knockback);
    const isPlayer = target === this.game.player;
    if (!isPlayer) target.invulnT = Math.max(target.invulnT, 0.15);
    const col = opts.crit ? '#ffd76a' : ELEMENT_COLOR[opts.element];
    this.game.particles.damageNumber(target.x, target.y - target.h - 8, dmg, col, opts.crit);
    this.game.particles.burst(target.x, target.y - 6, col, opts.crit ? 10 : 6, 70, 1);
    if (opts.crit) {
      this.game.audio.sfx('crit');
      this.game.camera.shake(3);
    } else {
      this.game.audio.sfx('hit');
    }
    if (opts.element !== 'none') {
      target.applyStatus(opts.element, opts.element === 'frost' ? 2 : 3, this.game.time);
    }
    if (target.hp <= 0) {
      target.hp = 0;
      if (isPlayer) {
        this.game.onPlayerDeath();
      } else {
        target.onDeath(this.game);
      }
    } else if (isPlayer) {
      this.game.player.onHurt(this.game);
    }
  }

  tickStatusDots(dt: number): void {
    const g = this.game;
    for (const e of [...g.enemies, g.player]) {
      if (e.dead || !e.status) continue;
      if (e.status.type === 'fire') {
        e.hp -= 2.2 * dt;
        if (Math.random() < dt * 8) g.particles.burst(e.x, e.y - 8, '#ff9a2e', 1, 30, 1);
        if (e.hp <= 0) {
          e.hp = 0;
          if (e === g.player) g.onPlayerDeath();
          else e.onDeath(g);
        }
      } else if (e.status.type === 'nature') {
        e.hp -= 1.7 * dt;
        if (Math.random() < dt * 6) g.particles.burst(e.x, e.y - 8, '#8ae06a', 1, 25, 1);
        if (e.hp <= 0) {
          e.hp = 0;
          if (e === g.player) g.onPlayerDeath();
          else e.onDeath(g);
        }
      }
    }
  }
}
