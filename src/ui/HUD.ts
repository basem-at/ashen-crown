import { VIEW_W, VIEW_H, clamp } from '../types';
import type { Game } from '../game/Game';
import { drawText, drawTextShadow, drawSprite, tinted, measureText } from '../graphics/PixelArt';
import { QUESTS } from '../systems/QuestSystem';
import { RELIC_INFO } from '../types';

export class HUD {
  render(ctx: CanvasRenderingContext2D, game: Game): void {
    const p = game.player;
    this.renderQuests(ctx, game);
    if (game.map) game.minimap.render(ctx, game, VIEW_W - game.map.w - 4, 4, 1);
    this.renderVitals(ctx, game);
    this.renderWallet(ctx, game);
    this.renderRelics(ctx, game);
    this.renderBossBar(ctx, game);
    this.renderPrompt(ctx, game);
    this.renderToast(ctx, game);
  }

  private renderQuests(ctx: CanvasRenderingContext2D, game: Game): void {
    let y = 4;
    const active = game.quests.active.slice(0, 3);
    for (const id of active) {
      drawTextShadow(ctx, QUESTS[id].name.toUpperCase(), 4, y, 1, '#ffd76a');
      drawTextShadow(ctx, game.quests.currentObjective(id), 4, y + 7, 1, '#c8cede');
      y += 16;
    }
  }

  private renderVitals(ctx: CanvasRenderingContext2D, game: Game): void {
    const p = game.player;
    const heart = game.sprites.items['heart'];
    const full = tinted(heart, '#e04a5a');
    const empty = tinted(heart, '#3a3040');
    const n = Math.ceil(p.maxHp / 10);
    for (let i = 0; i < n; i++) {
      const hpIn = clamp(p.hp - i * 10, 0, 10);
      const x = 4 + i * 9;
      const y = VIEW_H - 24;
      drawSprite(ctx, hpIn >= 10 ? full : empty, x, y);
      if (hpIn > 0 && hpIn < 10) {
        drawSprite(ctx, full, x, y);
        ctx.fillStyle = 'rgba(10,8,16,0.85)';
        ctx.fillRect(x + Math.ceil((hpIn / 10) * 8), y, 8 - Math.ceil((hpIn / 10) * 8), 8);
      }
    }
    this.bar(ctx, 4, VIEW_H - 13, 46, 3, p.stamina / p.maxStamina, '#8ae06a', '#2c3a24');
    this.bar(ctx, 4, VIEW_H - 8, 46, 3, p.mana / p.maxMana, '#5a8ae0', '#232c44');
    drawText(ctx, 'ST', 52, VIEW_H - 14, 1, '#8ae06a');
    drawText(ctx, 'MP', 52, VIEW_H - 9, 1, '#5a8ae0');
    const potions = p.inv.count('potion');
    if (potions > 0 || true) {
      const pot = game.sprites.items['potion'];
      drawSprite(ctx, pot, 64, VIEW_H - 16);
      drawTextShadow(ctx, 'x' + potions + '  [4]', 74, VIEW_H - 14, 1, potions > 0 ? '#ffb0b8' : '#666c80');
    }
  }

  private bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, f: number, col: string, bg: string): void {
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = col;
    ctx.fillRect(x, y, Math.round(w * clamp(f, 0, 1)), h);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
  }

  private renderWallet(ctx: CanvasRenderingContext2D, game: Game): void {
    const p = game.player;
    drawSprite(ctx, game.sprites.items['coin'], VIEW_W - 46, VIEW_H - 12);
    drawTextShadow(ctx, String(p.gold), VIEW_W - 38, VIEW_H - 10, 1, '#ffd76a');
    const lv = 'LV' + p.level;
    drawText(ctx, lv, VIEW_W - measureText(lv, 1) - 4, VIEW_H - 22, 1, '#8ae0ff');
    const xpF = p.xp / p.xpNext;
    this.bar(ctx, VIEW_W - 46, VIEW_H - 18, 42, 2, xpF, '#8ae0ff', '#1c2c3c');
  }

  private renderRelics(ctx: CanvasRenderingContext2D, game: Game): void {
    const p = game.player;
    for (let i = 0; i < 3; i++) {
      const x = VIEW_W - 3 * 14 - 4 + i * 14;
      const y = VIEW_H - 36;
      ctx.fillStyle = 'rgba(8,10,24,0.8)';
      ctx.fillRect(x, y, 12, 12);
      ctx.strokeStyle = i === p.inv.activeRelic && p.inv.relics[i] ? '#ffd76a' : '#3a3f55';
      ctx.strokeRect(x + 0.5, y + 0.5, 11, 11);
      const r = p.inv.relics[i];
      if (r) {
        drawSprite(ctx, game.sprites.items[RELIC_INFO[r].icon], x + 2, y + 2);
      }
      drawText(ctx, String(i + 1), x + 1, y + 13, 1, '#666c80');
    }
  }

  private renderBossBar(ctx: CanvasRenderingContext2D, game: Game): void {
    const b = game.bossBar;
    if (!b) return;
    const w = 120;
    const x = (VIEW_W - w) / 2;
    const y = 6;
    drawText(ctx, b.name.toUpperCase(), VIEW_W / 2, y, 1, '#ff8a9a', 'center');
    ctx.fillStyle = '#2c1420';
    ctx.fillRect(x, y + 8, w, 5);
    ctx.fillStyle = '#e03a4a';
    ctx.fillRect(x, y + 8, Math.round(w * clamp(b.hp / b.max, 0, 1)), 5);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x - 0.5, y + 7.5, w + 1, 6);
  }

  private renderPrompt(ctx: CanvasRenderingContext2D, game: Game): void {
    if (game.mode !== 'play') return;
    const it = game.nearestInteractable();
    if (!it) return;
    const label = it.obj.prompt(game);
    if (!label) return;
    const sx = game.player.x - game.camera.viewX;
    const sy = game.player.y - game.camera.viewY - 30;
    const txt = '[F] ' + label;
    const w = measureText(txt, 1) + 6;
    ctx.fillStyle = 'rgba(8,10,24,0.85)';
    ctx.fillRect(sx - w / 2, sy - 2, w, 9);
    drawText(ctx, txt, sx, sy, 1, '#ffd76a', 'center');
  }

  private renderToast(ctx: CanvasRenderingContext2D, game: Game): void {
    if (game.time > game.toastUntil || !game.toastMsg) return;
    const a = clamp((game.toastUntil - game.time) / 0.4, 0, 1);
    ctx.globalAlpha = a;
    const w = measureText(game.toastMsg, 1) + 10;
    ctx.fillStyle = 'rgba(8,10,24,0.88)';
    ctx.fillRect(VIEW_W / 2 - w / 2, 18, w, 11);
    ctx.strokeStyle = '#e0b34c';
    ctx.strokeRect(VIEW_W / 2 - w / 2 + 0.5, 18.5, w - 1, 10);
    drawText(ctx, game.toastMsg, VIEW_W / 2, 21, 1, '#ffe89a', 'center');
    ctx.globalAlpha = 1;
  }
}
