import { VIEW_W, VIEW_H } from '../types';
import type { Game } from '../game/Game';
import { drawText, drawTextShadow } from '../graphics/PixelArt';

export class LevelUpScreen {
  idx = 0;
  options = [
    { key: '1', label: '+20 MAX HP', desc: 'Tougher heart. Heals 20 now.' },
    { key: '2', label: '+2 ATTACK', desc: 'Every strike hits harder.' },
    { key: '3', label: '+15 MAX STAMINA', desc: 'More dashes and swings.' }
  ];

  update(game: Game): void {
    const input = game.input;
    if (input.hit('ArrowLeft') || input.hit('KeyA')) {
      this.idx = (this.idx - 1 + 3) % 3;
      game.audio.sfx('cursor');
    }
    if (input.hit('ArrowRight') || input.hit('KeyD')) {
      this.idx = (this.idx + 1) % 3;
      game.audio.sfx('cursor');
    }
    if (input.hit('Digit1') || input.hit('Digit2') || input.hit('Digit3')) {
      this.idx = input.hit('Digit1') ? 0 : input.hit('Digit2') ? 1 : 2;
      game.applyLevelUp(this.idx);
      return;
    }
    if (input.hit('Enter') || input.hit('KeyF') || input.hit('KeyJ') || input.mouse.pressed) {
      game.applyLevelUp(this.idx);
    }
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    ctx.fillStyle = 'rgba(4,5,14,0.7)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    drawText(ctx, 'LEVEL UP!  LV ' + game.player.level, VIEW_W / 2, 44, 2, '#ffd76a', 'center');
    drawText(ctx, 'CHOOSE A BONUS', VIEW_W / 2, 62, 1, '#c8cede', 'center');
    const cw = 88;
    const gap = 8;
    const total = cw * 3 + gap * 2;
    let x = VIEW_W / 2 - total / 2;
    const y = 80;
    this.options.forEach((o, i) => {
      const sel = i === this.idx;
      ctx.fillStyle = sel ? 'rgba(224,179,76,0.22)' : 'rgba(10,12,28,0.9)';
      ctx.fillRect(x, y, cw, 48);
      ctx.strokeStyle = sel ? '#ffd76a' : '#3a3f55';
      ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, 47);
      drawText(ctx, '[' + o.key + ']', x + cw / 2, y + 6, 1, '#8a93b5', 'center');
      drawText(ctx, o.label, x + cw / 2, y + 18, 1, sel ? '#ffd76a' : '#e8ecf5', 'center');
      drawText(ctx, o.desc, x + cw / 2, y + 32, 1, '#8a93b5', 'center');
      x += cw + gap;
    });
    if (game.pendingLevelUps > 1) {
      drawTextShadow(ctx, game.pendingLevelUps + ' MORE LEVEL-UPS PENDING', VIEW_W / 2, 140, 1, '#8ae0ff');
    }
  }
}
