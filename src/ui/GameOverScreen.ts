import { VIEW_W, VIEW_H } from '../types';
import type { Game } from '../game/Game';
import { drawText } from '../graphics/PixelArt';

export class GameOverScreen {
  update(game: Game): void {
    if (game.input.hit('Enter') || game.input.hit('KeyF') || game.input.hit('KeyJ') || game.input.mouse.pressed) {
      game.respawn();
    }
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    ctx.fillStyle = 'rgba(20,4,8,0.82)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    drawText(ctx, 'YOU DIED', VIEW_W / 2, 70, 3, '#e04a5a', 'center');
    drawText(ctx, 'THE ASH DOES NOT FORGET... BUT YOU RISE AGAIN', VIEW_W / 2, 100, 1, '#c8cede', 'center');
    if (Math.floor(game.time * 3) % 2 === 0) {
      drawText(ctx, 'PRESS ENTER TO RISE AT THE CAMPFIRE', VIEW_W / 2, 124, 1, '#ffd76a', 'center');
    }
  }
}
