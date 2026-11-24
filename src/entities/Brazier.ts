import { Entity, Interactable } from './Entity';
import type { Game } from '../game/Game';
import { drawSprite } from '../graphics/PixelArt';

export class Brazier extends Entity implements Interactable {
  id: string;
  roomId: string | null;
  lit = false;
  radius = 16;
  t = 0;

  constructor(id: string, tx: number, ty: number, roomId: string | null = null) {
    super();
    this.id = id;
    this.roomId = roomId;
    this.x = tx * 16 + 8;
    this.y = ty * 16 + 12;
    this.w = 12;
    this.h = 10;
  }

  prompt(game: Game): string {
    if (this.lit) return '';
    return game.player.inv.hasRelic('emberLantern') ? 'Light brazier' : 'Cold brazier';
  }

  interact(game: Game): void {
    if (this.lit) return;
    if (!game.player.inv.hasRelic('emberLantern')) {
      game.toast('Cold and dark. It needs the Ember Lantern.');
      game.audio.sfx('error');
      return;
    }
    this.lit = true;
    game.persistEntity(this.id, { lit: true });
    game.audio.sfx('charge');
    game.particles.burst(this.x, this.y - 10, '#ff9a2e', 16, 70, 1.5);
    game.toast('The brazier roars to life!');
  }

  update(dt: number, _game: Game): void {
    this.t += dt;
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 1, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    if (this.lit) {
      const spr = Math.floor(this.t * 6) % 2 === 0 ? game.sprites.props['campfire0'] : game.sprites.props['campfire1'];
      drawSprite(ctx, game.sprites.props['brazier'], this.x - 8, this.y - 10);
      drawSprite(ctx, spr, this.x - 8, this.y - 14);
    } else {
      drawSprite(ctx, game.sprites.props['brazier'], this.x - 8, this.y - 10);
    }
  }
}
