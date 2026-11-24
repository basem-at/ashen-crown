import { Entity } from './Entity';
import type { Game } from '../game/Game';
import { ItemId } from '../types';
import { drawSprite } from '../graphics/PixelArt';
import { dist2 } from '../types';

export type PickupKind = 'gold' | 'heart' | 'mana' | 'item';

export class Pickup extends Entity {
  kind: PickupKind;
  item: ItemId | null = null;
  amount = 0;
  t = 0;
  solid = false;
  w = 6;
  h = 6;

  constructor(x: number, y: number, kind: PickupKind, amount: number, item: ItemId | null = null) {
    super();
    this.x = x;
    this.y = y;
    this.kind = kind;
    this.amount = amount;
    this.item = item;
    this.vy = -40;
  }

  update(dt: number, game: Game): void {
    this.t += dt;
    this.decayKnockback(dt);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.t > 0.25) {
      this.vx = 0;
      this.vy = 0;
    }
    const p = game.player;
    const d2 = dist2(this.x, this.y, p.x, p.y - 8);
    if (d2 < 30 * 30) {
      const d = Math.sqrt(d2) || 1;
      const sp = 130 * (1 - d / 60) + 40;
      this.x += ((p.x - this.x) / d) * sp * dt;
      this.y += ((p.y - 8 - this.y) / d) * sp * dt;
    }
    if (d2 < 8 * 8) {
      this.collect(game);
    }
  }

  private collect(game: Game): void {
    const p = game.player;
    this.dead = true;
    switch (this.kind) {
      case 'gold':
        p.gold += this.amount;
        game.audio.sfx('coin');
        game.particles.burst(this.x, this.y, '#ffd76a', 5, 40, 1);
        break;
      case 'heart':
        p.hp = Math.min(p.maxHp, p.hp + this.amount);
        game.audio.sfx('heal');
        game.particles.healText(this.x, this.y - 6, '+' + this.amount, '#ff7a8a');
        break;
      case 'mana':
        p.mana = Math.min(p.maxMana, p.mana + this.amount);
        game.audio.sfx('pickup');
        game.particles.healText(this.x, this.y - 6, '+' + this.amount, '#7ab8ff');
        break;
      case 'item':
        if (this.item) {
          p.inv.add(this.item, this.amount);
          game.toast('Got ' + game.itemName(this.item) + ' x' + this.amount);
          game.audio.sfx('pickup');
          game.particles.burst(this.x, this.y, '#e8d9a8', 8, 50, 1);
        }
        break;
    }
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    const bob = Math.sin(this.t * 6) * 1.5;
    const spr =
      this.kind === 'gold' ? game.sprites.items['coin']
      : this.kind === 'heart' ? game.sprites.items['heart']
      : this.kind === 'mana' ? game.sprites.items['mana']
      : this.item ? game.sprites.items[this.item] : game.sprites.items['coin'];
    if (spr) drawSprite(ctx, spr, this.x - 4, this.y - 4 + bob, { scale: 1 });
  }
}
