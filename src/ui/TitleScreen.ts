import { VIEW_W, VIEW_H } from '../types';
import type { Game } from '../game/Game';
import { drawText, drawTextShadow, measureText } from '../graphics/PixelArt';

export class TitleScreen {
  idx = 0;

  items(game: Game): string[] {
    const anySave = game.hasAnySave();
    return [
      'NEW GAME',
      anySave ? 'CONTINUE' : 'CONTINUE (NO SAVES)',
      'SOUND: ' + (game.audio.muted ? 'OFF' : 'ON'),
      'CRT FX: ' + (game.crtOn ? 'ON' : 'OFF')
    ];
  }

  update(game: Game): void {
    const input = game.input;
    const items = this.items(game);
    if (input.hit('ArrowUp') || input.hit('KeyW')) {
      this.idx = (this.idx - 1 + items.length) % items.length;
      game.audio.sfx('cursor');
    }
    if (input.hit('ArrowDown') || input.hit('KeyS')) {
      this.idx = (this.idx + 1) % items.length;
      game.audio.sfx('cursor');
    }
    if (input.hit('Enter') || input.hit('KeyJ') || input.hit('KeyF') || input.mouse.pressed) {
      game.audio.sfx('select');
      if (this.idx === 0) {
        game.slotMode = 'new';
        game.slotCursor = 0;
        game.confirmSlot = -1;
        game.mode = 'slots';
      } else if (this.idx === 1) {
        if (!game.hasAnySave()) {
          game.audio.sfx('error');
          return;
        }
        game.slotMode = 'continue';
        game.slotCursor = game.firstSaveSlot();
        game.confirmSlot = -1;
        game.mode = 'slots';
      } else if (this.idx === 2) {
        game.audio.setMuted(!game.audio.muted);
      } else if (this.idx === 3) {
        game.toggleCrt();
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    ctx.fillStyle = 'rgba(4,5,14,0.55)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    const cx = VIEW_W / 2;
    const pulse = 1 + Math.sin(game.time * 2) * 0.02;
    const s = 5;
    drawText(ctx, 'ASHEN', cx + s, 26 + s, s, '#40260a', 'center');
    drawText(ctx, 'ASHEN', cx, 26, s, '#ffd76a', 'center');
    drawText(ctx, 'CROWN', cx + s, 56 + s, s, '#40260a', 'center');
    drawText(ctx, 'CROWN', cx, 56, s, '#e0b34c', 'center');
    const crownY = 12;
    ctx.fillStyle = '#e0b34c';
    ctx.fillRect(cx - 10, crownY + 4, 20, 4);
    ctx.fillRect(cx - 10, crownY, 3, 4);
    ctx.fillRect(cx - 1.5, crownY - 3, 3, 7);
    ctx.fillRect(cx + 7, crownY, 3, 4);
    ctx.fillStyle = '#e04a5a';
    ctx.fillRect(cx - 1, crownY + 5, 2, 2);
    drawText(ctx, 'A PROCEDURAL PIXEL ACTION-RPG', cx, 82, 1, '#8a93b5', 'center');
    const items = this.items(game);
    let y = 100;
    items.forEach((it, i) => {
      const sel = i === this.idx;
      const col = it.includes('NO SAVES') ? '#4a4f63' : sel ? '#ffd76a' : '#c8cede';
      const x = cx - measureText((sel ? '> ' : '  ') + it, 1) / 2;
      drawTextShadow(ctx, (sel ? '> ' : '  ') + it, x, y, 1, col);
      y += 10;
    });
    drawText(ctx, 'MOVE WASD/ARROWS  ATK J/CLICK  CHARGE HOLD ATK', cx, VIEW_H - 22, 1, '#6a7090', 'center');
    drawText(ctx, 'DASH K/SPACE(RELIC)  TALK F/CLICK  1-3/Q-E RELICS  4 POTION  TAB MENU', cx, VIEW_H - 14, 1, '#6a7090', 'center');
    drawText(ctx, '(C) 2025 EMBERHOLD SOFTWORKS - ALL ART AND MUSIC GENERATED IN CODE', cx, VIEW_H - 6, 1, '#4a4f63', 'center');
    void pulse;
  }
}
