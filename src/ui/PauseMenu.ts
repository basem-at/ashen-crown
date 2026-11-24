import { VIEW_W, VIEW_H } from '../types';
import type { Game } from '../game/Game';
import { drawText, drawTextShadow, drawSprite } from '../graphics/PixelArt';
import { ITEM_INFO, WEAPONS, ARMORS } from '../systems/Inventory';
import { QUESTS } from '../systems/QuestSystem';
import { RELIC_INFO, ItemId } from '../types';

export type PauseTab = 'inv' | 'map' | 'quest' | 'sys';

export class PauseMenu {
  tab: PauseTab = 'inv';
  cursor = 0;
  sysCursor = 0;

  private tabs: PauseTab[] = ['inv', 'map', 'quest', 'sys'];

  update(game: Game): void {
    const input = game.input;
    if (input.hit('ArrowLeft') || input.hit('KeyA')) {
      const i = this.tabs.indexOf(this.tab);
      this.tab = this.tabs[(i - 1 + this.tabs.length) % this.tabs.length];
      this.cursor = 0;
      game.audio.sfx('cursor');
    }
    if (input.hit('ArrowRight') || input.hit('KeyD')) {
      const i = this.tabs.indexOf(this.tab);
      this.tab = this.tabs[(i + 1) % this.tabs.length];
      this.cursor = 0;
      game.audio.sfx('cursor');
    }
    if (this.tab === 'inv') {
      const entries = this.itemEntries(game);
      if (entries.length > 0) {
        if (input.hit('ArrowUp') || input.hit('KeyW')) {
          this.cursor = (this.cursor - 1 + entries.length) % entries.length;
          game.audio.sfx('cursor');
        }
        if (input.hit('ArrowDown') || input.hit('KeyS')) {
          this.cursor = (this.cursor + 1) % entries.length;
          game.audio.sfx('cursor');
        }
        if (input.hit('Enter') || input.hit('KeyF') || input.hit('KeyJ')) {
          const e = entries[this.cursor];
          if (e === 'potion') game.player.usePotion(game);
          else if (e === 'ether') game.player.useEther(game);
          else game.audio.sfx('error');
        }
      }
    } else if (this.tab === 'sys') {
      const opts = 4;
      if (input.hit('ArrowUp') || input.hit('KeyW')) {
        this.sysCursor = (this.sysCursor - 1 + opts) % opts;
        game.audio.sfx('cursor');
      }
      if (input.hit('ArrowDown') || input.hit('KeyS')) {
        this.sysCursor = (this.sysCursor + 1) % opts;
        game.audio.sfx('cursor');
      }
      if (input.hit('Enter') || input.hit('KeyF') || input.hit('KeyJ')) {
        game.audio.sfx('select');
        if (this.sysCursor === 0) game.openSaveMenu('pause');
        else if (this.sysCursor === 1) game.audio.setMuted(!game.audio.muted);
        else if (this.sysCursor === 2) game.toggleCrt();
        else game.toTitle();
      }
    }
  }

  private itemEntries(game: Game): ItemId[] {
    const p = game.player;
    return (Object.keys(ITEM_INFO) as ItemId[]).filter((k) => p.inv.count(k) > 0);
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    ctx.fillStyle = 'rgba(4,5,14,0.72)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    const x = 24;
    const y = 12;
    const w = VIEW_W - 48;
    const h = VIEW_H - 24;
    ctx.fillStyle = 'rgba(10,12,28,0.95)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#e0b34c';
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    const tabNames: Record<PauseTab, string> = { inv: 'INVENTORY', map: 'MAP', quest: 'QUESTS', sys: 'SYSTEM' };
    this.tabs.forEach((t, i) => {
      const tx = x + 8 + i * 62;
      const sel = t === this.tab;
      if (sel) {
        ctx.fillStyle = 'rgba(224,179,76,0.18)';
        ctx.fillRect(tx - 3, y + 5, 56, 11);
      }
      drawText(ctx, tabNames[t], tx, y + 8, 1, sel ? '#ffd76a' : '#7a8098');
    });
    ctx.strokeStyle = '#3a3f55';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 19);
    ctx.lineTo(x + w - 4, y + 19);
    ctx.stroke();
    const cy = y + 26;
    if (this.tab === 'inv') this.renderInv(ctx, game, x + 8, cy, w - 16);
    else if (this.tab === 'map') this.renderMap(ctx, game, x + 8, cy, w - 16, h - 34);
    else if (this.tab === 'quest') this.renderQuests(ctx, game, x + 8, cy, w - 16);
    else this.renderSys(ctx, game, x + 8, cy);
    drawText(ctx, 'ESC/TAB: CLOSE   ARROWS: NAVIGATE', VIEW_W / 2, VIEW_H - 8, 1, '#6a7090', 'center');
  }

  private renderInv(ctx: CanvasRenderingContext2D, game: Game, x: number, y: number, w: number): void {
    const p = game.player;
    drawText(ctx, 'EQUIPPED', x, y, 1, '#8a93b5');
    const wInfo = p.inv.weaponInfo();
    const aInfo = p.inv.armorInfo();
    drawSprite(ctx, game.sprites.items[wInfo.icon], x, y + 8);
    drawText(ctx, wInfo.name + '  DMG ' + (p.baseAttack + wInfo.dmg), x + 12, y + 10, 1, '#e8ecf5');
    drawSprite(ctx, game.sprites.items[aInfo.icon], x, y + 20);
    drawText(ctx, aInfo.name + '  DEF ' + aInfo.def, x + 12, y + 22, 1, '#e8ecf5');
    drawText(ctx, 'RELICS', x, y + 36, 1, '#8a93b5');
    for (let i = 0; i < 3; i++) {
      const r = p.inv.relics[i];
      const rx = x + i * 62;
      ctx.fillStyle = 'rgba(8,10,24,0.8)';
      ctx.fillRect(rx, y + 44, 58, 12);
      ctx.strokeStyle = i === p.inv.activeRelic && r ? '#ffd76a' : '#3a3f55';
      ctx.strokeRect(rx + 0.5, y + 44.5, 57, 11);
      if (r) {
        drawSprite(ctx, game.sprites.items[RELIC_INFO[r].icon], rx + 2, y + 46);
        drawText(ctx, RELIC_INFO[r].name, rx + 12, y + 47, 1, '#e8ecf5');
      } else {
        drawText(ctx, 'EMPTY', rx + 4, y + 47, 1, '#555a70');
      }
    }
    const ix = x + w / 2;
    drawText(ctx, 'ITEMS  (ENTER: USE)', ix, y, 1, '#8a93b5');
    const entries = this.itemEntries(game);
    if (entries.length === 0) drawText(ctx, '(empty - buy potions from Mira!)', ix, y + 10, 1, '#555a70');
    entries.forEach((e, i) => {
      const sel = i === this.cursor;
      const ry = y + 10 + i * 10;
      if (sel) {
        ctx.fillStyle = 'rgba(224,179,76,0.15)';
        ctx.fillRect(ix - 2, ry - 2, w / 2 - 6, 9);
      }
      drawSprite(ctx, game.sprites.items[ITEM_INFO[e].icon], ix, ry);
      drawText(ctx, ITEM_INFO[e].name + ' x' + p.inv.count(e), ix + 12, ry + 1, 1, sel ? '#ffd76a' : '#e8ecf5');
    });
    if (entries.length > 0) {
      const e = entries[this.cursor];
      drawText(ctx, ITEM_INFO[e].desc, x, VIEW_H - 34, 1, '#8a93b5');
    }
    void WEAPONS;
    void ARMORS;
  }

  private renderMap(ctx: CanvasRenderingContext2D, game: Game, x: number, y: number, w: number, h: number): void {
    if (game.map) {
      const scale = Math.min(3, Math.floor(Math.min((w - 90) / game.map.w, (h - 10) / game.map.h)));
      game.minimap.render(ctx, game, x + 4, y + 2, Math.max(1, scale));
      drawText(ctx, game.map.name.toUpperCase(), x + 6 + game.map.w * Math.max(1, scale) + 6, y + 4, 1, '#ffd76a');
    }
    game.minimap.renderWorldMap(ctx, game);
  }

  private renderQuests(ctx: CanvasRenderingContext2D, game: Game, x: number, y: number, w: number): void {
    let qy = y;
    drawText(ctx, 'ACTIVE', x, qy, 1, '#8a93b5');
    qy += 9;
    if (game.quests.active.length === 0) drawText(ctx, '(none)', x + 4, qy, 1, '#555a70');
    for (const id of game.quests.active) {
      drawText(ctx, '* ' + QUESTS[id].name, x + 4, qy, 1, '#ffd76a');
      drawText(ctx, '  ' + game.quests.currentObjective(id), x + 4, qy + 6, 1, '#c8cede');
      drawText(ctx, '  Reward: ' + QUESTS[id].rewardText, x + 4, qy + 12, 1, '#6a7090');
      qy += 21;
    }
    qy += 4;
    drawText(ctx, 'COMPLETED', x, qy, 1, '#8a93b5');
    qy += 9;
    if (game.quests.done.length === 0) drawText(ctx, '(none)', x + 4, qy, 1, '#555a70');
    for (const id of game.quests.done) {
      drawText(ctx, '[OK] ' + QUESTS[id].name, x + 4, qy, 1, '#5a8a5a');
      qy += 7;
    }
    void w;
  }

  private renderSys(ctx: CanvasRenderingContext2D, game: Game, x: number, y: number): void {
    const opts = [
      'SAVE GAME (3 SLOTS)',
      'SOUND: ' + (game.audio.muted ? 'OFF' : 'ON') + '  [M]',
      'CRT FX: ' + (game.crtOn ? 'ON' : 'OFF') + '  [F3]',
      'QUIT TO TITLE'
    ];
    opts.forEach((o, i) => {
      const sel = i === this.sysCursor;
      drawTextShadow(ctx, (sel ? '> ' : '  ') + o, x, y + i * 10, 1, sel ? '#ffd76a' : '#c8cede');
    });
  }
}
