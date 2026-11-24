import { Entity, Interactable } from './Entity';
import type { Game } from '../game/Game';
import { ItemId } from '../types';
import { drawSprite } from '../graphics/PixelArt';
import { Pickup } from './Pickup';

export type DestructibleKind = 'pot' | 'crate' | 'bush' | 'bushGlow' | 'dummy' | 'web';

export interface DropDef {
  type: 'gold' | 'heart' | 'mana' | 'item';
  item?: ItemId;
  min: number;
  max: number;
}

const KIND_HP: Record<DestructibleKind, number> = { pot: 1, crate: 2, bush: 1, bushGlow: 1, dummy: 6, web: 2 };

export class Destructible extends Entity {
  id: string;
  kind: DestructibleKind;
  drops: DropDef[];
  respawn: number;
  broken = false;
  respawnT = 0;
  wobble = 0;

  constructor(id: string, kind: DestructibleKind, tx: number, ty: number, drops: DropDef[] = [], respawn = 0) {
    super();
    this.id = id;
    this.kind = kind;
    this.x = tx * 16 + 8;
    this.y = ty * 16 + 12;
    this.w = 10;
    this.h = 8;
    this.hp = KIND_HP[kind];
    this.maxHp = this.hp;
    this.drops = drops;
    this.respawn = respawn;
  }

  update(dt: number, game: Game): void {
    this.invulnT = Math.max(0, this.invulnT - dt);
    this.flashT = Math.max(0, this.flashT - dt);
    this.wobble = Math.max(0, this.wobble - dt * 6);
    if (this.kind === 'web' && !this.broken && game.player.inv.hasRelic('emberLantern')) {
      const d = Math.hypot(this.x - game.player.x, this.y - (game.player.y - 8));
      if (d < 30) {
        this.hp -= dt * 5;
        this.wobble = 0.2;
        if (Math.random() < dt * 10) game.particles.burst(this.x, this.y - 6, '#ff9a2e', 1, 30, 1);
        if (this.hp <= 0) {
          this.hp = 0;
          this.onDeath(game);
          return;
        }
      }
    }
    if (this.broken) {
      this.solid = false;
      if (this.respawn > 0) {
        this.respawnT += dt;
        if (this.respawnT >= this.respawn) {
          this.broken = false;
          this.hp = this.maxHp;
          this.solid = true;
          game.particles.burst(this.x, this.y - 8, '#b08a5a', 8, 50, 1);
        }
      }
    }
  }

  onDeath(game: Game): void {
    this.broken = true;
    this.dead = true;
    this.solid = false;
    const colors: Record<DestructibleKind, string> = { pot: '#b06a3a', crate: '#9a6b3f', bush: '#4aa04a', bushGlow: '#c8ff5a', dummy: '#b08a5a', web: '#e8ecf5' };
    game.particles.burst(this.x, this.y - 6, colors[this.kind], 12, 80, 1.5);
    game.audio.sfx('smash');
    for (const d of this.drops) {
      const n = d.min + Math.floor(Math.random() * (d.max - d.min + 1));
      if (n <= 0) continue;
      if (d.type === 'item' && d.item) {
        game.pickups.push(new Pickup(this.x, this.y - 8, 'item', n, d.item));
      } else {
        game.pickups.push(new Pickup(this.x + (Math.random() * 12 - 6), this.y - 6, d.type, n));
      }
    }
    if (this.kind === 'dummy') {
      game.setFlag('dummyBreaks', (game.flags['dummyBreaks'] ?? 0) + 1);
    }
    game.persistEntity(this.id, { broken: true });
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    if (this.broken) return;
    const key = this.kind === 'bushGlow' ? 'bushGlow' : this.kind;
    const spr = game.sprites.props[key];
    if (!spr) return;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 1, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    const ox = this.wobble > 0 ? Math.sin(this.wobble * 30) * 1.5 : 0;
    drawSprite(ctx, this.flashT > 0 ? tintedWhite(spr) : spr, this.x - 8 + ox, this.y - 14);
    if (this.kind === 'bushGlow') {
      const g = 0.3 + Math.sin(game.time * 4) * 0.15;
      ctx.fillStyle = `rgba(200,255,90,${g * 0.25})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 6, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

import { tinted } from '../graphics/PixelArt';
function tintedWhite(s: HTMLCanvasElement): HTMLCanvasElement {
  return tinted(s, '#ffffff');
}

export class Campfire extends Entity implements Interactable {
  radius = 18;
  t = 0;

  constructor(tx: number, ty: number) {
    super();
    this.x = tx * 16 + 8;
    this.y = ty * 16 + 12;
    this.w = 12;
    this.h = 10;
  }

  prompt(): string {
    return 'Rest (heal + save)';
  }

  interact(game: Game): void {
    game.player.hp = game.player.maxHp;
    game.player.mana = game.player.maxMana;
    game.player.stamina = game.player.maxStamina;
    game.audio.sfx('heal');
    game.particles.burst(this.x, this.y - 10, '#ffd76a', 14, 60, 1);
    game.openSaveMenu();
  }

  update(dt: number, _game: Game): void {
    this.t += dt;
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    const spr = Math.floor(this.t * 6) % 2 === 0 ? game.sprites.props['campfire0'] : game.sprites.props['campfire1'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 1, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    drawSprite(ctx, spr, this.x - 8, this.y - 12);
  }
}
