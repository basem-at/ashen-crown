import { VIEW_W, VIEW_H } from '../types';
import type { Game } from '../game/Game';
import { SaveManager } from '../engine/SaveManager';
import { drawText, drawTextShadow } from '../graphics/PixelArt';

export class SaveMenu {
  cursor = 0;
  confirmDelete = -1;

  update(game: Game): void {
    const input = game.input;
    const slots = SaveManager.slots();
    if (input.hit('ArrowUp') || input.hit('KeyW')) {
      this.cursor = (this.cursor - 1 + 3) % 3;
      this.confirmDelete = -1;
      game.audio.sfx('cursor');
    }
    if (input.hit('ArrowDown') || input.hit('KeyS')) {
      this.cursor = (this.cursor + 1) % 3;
      this.confirmDelete = -1;
      game.audio.sfx('cursor');
    }
    if (input.hit('KeyX') && !slots[this.cursor].empty) {
      if (this.confirmDelete === this.cursor) {
        SaveManager.remove(this.cursor);
        this.confirmDelete = -1;
        game.audio.sfx('smash');
      } else {
        this.confirmDelete = this.cursor;
        game.audio.sfx('cursor');
      }
    }
    if (input.hit('Enter') || input.hit('KeyF') || input.hit('KeyJ') || input.mouse.pressed) {
      game.saveGame(this.cursor);
      game.audio.sfx('save');
      game.toast('Saved to slot ' + (this.cursor + 1));
      game.mode = game.prevMode;
    }
    if (input.hit('Escape')) {
      game.mode = game.prevMode;
      game.audio.sfx('cursor');
    }
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    const x = 60;
    const y = 40;
    const w = VIEW_W - 120;
    const h = 100;
    ctx.fillStyle = 'rgba(10,12,28,0.96)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#e0b34c';
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    drawText(ctx, 'SAVE GAME', x + w / 2, y + 8, 1, '#ffd76a', 'center');
    const slots = SaveManager.slots();
    slots.forEach((s, i) => {
      const sel = i === this.cursor;
      const ry = y + 24 + i * 20;
      if (sel) {
        ctx.fillStyle = 'rgba(224,179,76,0.15)';
        ctx.fillRect(x + 8, ry - 3, w - 16, 17);
      }
      if (s.empty) {
        drawText(ctx, (sel ? '> ' : '  ') + 'SLOT ' + (i + 1) + ' - EMPTY', x + 14, ry, 1, sel ? '#ffd76a' : '#7a8098');
      } else {
        const mins = Math.floor(s.playtime / 60);
        const secs = Math.floor(s.playtime % 60);
        drawText(ctx, (sel ? '> ' : '  ') + 'SLOT ' + (i + 1) + '  LV' + s.level + '  ' + s.gold + 'G  ' + s.mapName, x + 14, ry, 1, sel ? '#ffd76a' : '#e8ecf5');
        drawText(ctx, '   ' + mins + 'm' + String(secs).padStart(2, '0') + 's   saved ' + new Date(s.savedAt).toLocaleTimeString(), x + 14, ry + 8, 1, '#6a7090');
      }
      if (this.confirmDelete === i) {
        drawText(ctx, 'PRESS X AGAIN TO DELETE', x + w - 14 - 19 * 4, ry, 1, '#e04a5a');
      }
    });
    drawText(ctx, 'ENTER: SAVE   X: DELETE   ESC: BACK', x + w / 2, y + h + 6, 1, '#6a7090', 'center');
  }
}
