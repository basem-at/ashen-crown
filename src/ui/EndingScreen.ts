import { VIEW_W, VIEW_H } from '../types';
import type { Game } from '../game/Game';
import { drawText } from '../graphics/PixelArt';

const CREDITS = [
  'ASHEN CROWN',
  '',
  'THE HOLLOW KING IS FELLED.',
  'THE ASHEN CROWN RETURNS TO THE LIGHT.',
  '',
  'EMBERHOLD WILL REMEMBER YOU, HERO.',
  '',
  'DESIGN / CODE / ART / MUSIC',
  'PROCEDURALLY GENERATED IN TYPESCRIPT',
  '',
  'THANKS FOR PLAYING!'
];

export class EndingScreen {
  t = 0;

  update(game: Game, dt: number): void {
    this.t += dt;
    if (this.t > 4 && (game.input.hit('Enter') || game.input.hit('KeyF') || game.input.mouse.pressed)) {
      game.toTitle();
    }
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    ctx.fillStyle = '#05060f';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    for (let i = 0; i < 40; i++) {
      const ex = (i * 47 + Math.floor(this.t * (10 + (i % 5) * 6))) % VIEW_W;
      const ey = VIEW_H - ((i * 31 + Math.floor(this.t * (14 + (i % 7) * 8))) % (VIEW_H + 20));
      ctx.fillStyle = i % 3 === 0 ? '#ffd76a' : i % 3 === 1 ? '#ff9a2e' : '#e0b34c';
      ctx.globalAlpha = 0.5;
      ctx.fillRect(ex, ey, 1, 1);
      ctx.globalAlpha = 1;
    }
    const startY = VIEW_H - this.t * 8;
    CREDITS.forEach((line, i) => {
      const y = startY + i * 9;
      if (y < -8 || y > VIEW_H + 8) return;
      drawText(ctx, line, VIEW_W / 2, y, i === 0 ? 2 : 1, i === 0 ? '#ffd76a' : '#c8cede', 'center');
    });
    const p = game.player;
    const mins = Math.floor(game.playtime / 60);
    const secs = Math.floor(game.playtime % 60);
    drawText(ctx, 'LV ' + p.level + '   GOLD ' + p.gold + '   TIME ' + mins + 'm' + String(secs).padStart(2, '0') + 's', VIEW_W / 2, VIEW_H - 16, 1, '#8a93b5', 'center');
    if (this.t > 4 && Math.floor(this.t * 3) % 2 === 0) {
      drawText(ctx, 'PRESS ENTER', VIEW_W / 2, VIEW_H - 7, 1, '#ffd76a', 'center');
    }
  }
}
