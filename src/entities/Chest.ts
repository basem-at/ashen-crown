import { Entity, Interactable } from './Entity';
import type { Game } from '../game/Game';
import { ItemId, RelicId, RELIC_INFO } from '../types';
import { drawSprite } from '../graphics/PixelArt';
import { Pickup } from './Pickup';

export interface ChestContent {
  gold?: number;
  item?: ItemId;
  count?: number;
  relic?: RelicId;
}

export class Chest extends Entity implements Interactable {
  id: string;
  locked: boolean;
  opened = false;
  contents: ChestContent[];
  radius = 16;
  sparkleT = 0;

  constructor(id: string, tx: number, ty: number, locked: boolean, contents: ChestContent[]) {
    super();
    this.id = id;
    this.x = tx * 16 + 8;
    this.y = ty * 16 + 12;
    this.w = 12;
    this.h = 10;
    this.locked = locked;
    this.contents = contents;
  }

  prompt(game: Game): string {
    if (this.opened) return '';
    return this.locked ? (game.player.inv.count('rustyKey') > 0 ? 'Unlock (Rusty Key)' : 'Locked') : 'Open';
  }

  interact(game: Game): void {
    if (this.opened) return;
    if (this.locked) {
      if (game.player.inv.count('rustyKey') <= 0) {
        game.toast('Locked. It needs a Rusty Key.');
        game.audio.sfx('error');
        return;
      }
      game.player.inv.remove('rustyKey');
      this.locked = false;
      game.toast('Unlocked with the Rusty Key!');
      game.audio.sfx('door');
    }
    this.opened = true;
    game.persistEntity(this.id, { opened: true, locked: false });
    game.audio.sfx('chest');
    game.particles.burst(this.x, this.y - 10, '#ffd76a', 14, 70, 1.5);
    let goldTotal = 0;
    for (const c of this.contents) {
      if (c.gold) goldTotal += c.gold;
      if (c.item) game.pickups.push(new Pickup(this.x, this.y - 12, 'item', c.count ?? 1, c.item));
      if (c.relic) {
        game.giveRelic(c.relic);
        game.toast('RELIC ACQUIRED: ' + RELIC_INFO[c.relic].name + '!');
        game.audio.sfx('levelup');
        game.particles.burst(this.x, this.y - 14, '#ffd76a', 30, 110, 2);
        game.camera.shake(5);
      }
    }
    if (goldTotal > 0) {
      game.player.gold += goldTotal;
      game.particles.healText(this.x, this.y - 18, '+' + goldTotal + ' G', '#ffd76a');
      game.audio.sfx('coin');
    }
  }

  update(dt: number, _game: Game): void {
    this.sparkleT += dt;
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    const spr = this.opened ? game.sprites.props['chestOpen'] : game.sprites.props['chestClosed'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 1, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    drawSprite(ctx, spr, this.x - 8, this.y - 12);
    if (!this.opened && Math.floor(this.sparkleT * 3) % 3 === 0) {
      ctx.fillStyle = '#fff8c8';
      ctx.fillRect(Math.round(this.x + Math.sin(this.sparkleT * 5) * 5), Math.round(this.y - 14 + Math.cos(this.sparkleT * 4) * 2), 1, 1);
    }
  }
}
