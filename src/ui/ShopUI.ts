import { VIEW_W, VIEW_H } from '../types';
import type { Game } from '../game/Game';
import { drawText, drawTextShadow, drawSprite, measureText } from '../graphics/PixelArt';
import { WEAPONS, ARMORS, ITEM_INFO } from '../systems/Inventory';
import { ItemId } from '../types';

interface ShopEntry {
  icon: string;
  name: string;
  desc: string;
  price: number;
  shards: number;
  buy: (g: Game) => boolean;
}

export class ShopUI {
  kind: 'smith' | 'alch';
  cursor = 0;
  entries: ShopEntry[] = [];

  constructor(kind: 'smith' | 'alch', game: Game) {
    this.kind = kind;
    if (kind === 'alch') {
      this.entries = [
        {
          icon: ITEM_INFO['potion'].icon,
          name: ITEM_INFO['potion'].name,
          desc: ITEM_INFO['potion'].desc,
          price: 30,
          shards: 0,
          buy: (g) => {
            if (g.player.gold < 30) return false;
            g.player.gold -= 30;
            g.player.inv.add('potion', 1);
            return true;
          }
        },
        {
          icon: ITEM_INFO['ether'].icon,
          name: ITEM_INFO['ether'].name,
          desc: ITEM_INFO['ether'].desc,
          price: 25,
          shards: 0,
          buy: (g) => {
            if (g.player.gold < 25) return false;
            g.player.gold -= 25;
            g.player.inv.add('ether', 1);
            return true;
          }
        }
      ];
    } else {
      const p = game.player;
      const wIdx = WEAPONS.findIndex((w) => w.id === p.inv.weapon);
      const aIdx = ARMORS.findIndex((a) => a.id === p.inv.armor);
      for (const w of WEAPONS.slice(wIdx + 1)) {
        this.entries.push({
          icon: w.icon,
          name: 'Upgrade: ' + w.name,
          desc: 'DMG ' + w.dmg + '  (needs ' + w.cost + ' G + ' + w.shards + ' shard' + (w.shards > 1 ? 's' : '') + ')',
          price: w.cost,
          shards: w.shards,
          buy: (g) => {
            if (g.player.gold < w.cost || g.player.inv.count('bossShard') < w.shards) return false;
            g.player.gold -= w.cost;
            g.player.inv.remove('bossShard', w.shards);
            g.player.inv.weapon = w.id as typeof p.inv.weapon;
            g.toast('Forged: ' + w.name + '!');
            g.audio.sfx('chest');
            return true;
          }
        });
      }
      for (const a of ARMORS.slice(aIdx + 1)) {
        this.entries.push({
          icon: a.icon,
          name: 'Buy: ' + a.name,
          desc: 'DEF ' + a.def + '  (needs ' + a.cost + ' G)',
          price: a.cost,
          shards: 0,
          buy: (g) => {
            if (g.player.gold < a.cost) return false;
            g.player.gold -= a.cost;
            g.player.inv.armor = a.id as typeof p.inv.armor;
            g.toast('Bought: ' + a.name + '!');
            g.audio.sfx('coin');
            return true;
          }
        });
      }
      if (this.entries.length === 0) {
        this.entries.push({
          icon: 'sword_crownblade',
          name: 'Fully upgraded!',
          desc: 'Your gear is the finest in the realm.',
          price: 0,
          shards: 0,
          buy: () => false
        });
      }
    }
  }

  update(game: Game): void {
    const input = game.input;
    const n = this.entries.length;
    if (input.hit('ArrowUp') || input.hit('KeyW')) {
      this.cursor = (this.cursor - 1 + n) % n;
      game.audio.sfx('cursor');
    }
    if (input.hit('ArrowDown') || input.hit('KeyS')) {
      this.cursor = (this.cursor + 1) % n;
      game.audio.sfx('cursor');
    }
    if (input.hit('Enter') || input.hit('KeyF') || input.hit('KeyJ') || input.mouse.pressed) {
      const e = this.entries[this.cursor];
      if (e.price > 0 && e.buy(game)) {
        game.audio.sfx('coin');
      } else if (e.price > 0) {
        game.audio.sfx('error');
        game.toast('Not enough gold/shards!');
      }
    }
    if (input.hit('Escape') || input.hit('Tab') || input.hit('KeyP')) {
      game.audio.sfx('cursor');
      game.mode = 'play';
    }
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    const x = 40;
    const y = 30;
    const w = VIEW_W - 80;
    const h = VIEW_H - 60;
    ctx.fillStyle = 'rgba(10,12,28,0.96)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#e0b34c';
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    const title = this.kind === 'smith' ? "BRAM'S FORGE" : "MIRA'S POTIONS";
    drawText(ctx, title, x + w / 2, y + 7, 1, '#ffd76a', 'center');
    drawSprite(ctx, game.sprites.items['coin'], x + 8, y + 7);
    drawText(ctx, String(game.player.gold) + ' G', x + 18, y + 8, 1, '#ffd76a');
    drawText(ctx, 'SHARDS: ' + game.player.inv.count('bossShard' as ItemId), x + w - 90, y + 8, 1, '#b08aff');
    let ey = y + 22;
    this.entries.forEach((e, i) => {
      const sel = i === this.cursor;
      if (sel) {
        ctx.fillStyle = 'rgba(224,179,76,0.15)';
        ctx.fillRect(x + 6, ey - 2, w - 12, 11);
      }
      drawSprite(ctx, game.sprites.items[e.icon] ?? game.sprites.items['coin'], x + 10, ey - 1, { scale: 1 });
      drawText(ctx, (sel ? '> ' : '  ') + e.name, x + 22, ey, 1, sel ? '#ffd76a' : '#e8ecf5');
      const price = e.price > 0 ? e.price + ' G' + (e.shards > 0 ? ' +' + e.shards + 'S' : '') : '-';
      drawText(ctx, price, x + w - 10 - measureText(price, 1), ey, 1, '#ffd76a');
      ey += 11;
    });
    const e = this.entries[this.cursor];
    ctx.strokeStyle = '#3a3f55';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + h - 16);
    ctx.lineTo(x + w - 6, y + h - 16);
    ctx.stroke();
    drawText(ctx, e.desc, x + 10, y + h - 12, 1, '#8a93b5');
    drawText(ctx, 'ENTER: BUY   ESC: LEAVE', x + w / 2, y + h + 4, 1, '#6a7090', 'center');
  }
}
