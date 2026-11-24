import { GameMap } from '../world/MapData';
import { TILE, VIEW_W, VIEW_H } from '../types';
import type { Game } from '../game/Game';
import { drawText } from '../graphics/PixelArt';

const GROUND_COLORS: Record<string, string> = {
  g: '#274a22', G: '#223d1d', d: '#4a3826', p: '#5a4630', s: '#3c3c48', c: '#3a3026',
  w: '#4a3423', '~': '#1e3a6e', '~2': '#1e3a6e', b: '#5a4028'
};

export class Minimap {
  private cv: HTMLCanvasElement | null = null;
  private mw = 0;
  private mh = 0;

  build(map: GameMap): void {
    this.mw = map.w;
    this.mh = map.h;
    this.cv = document.createElement('canvas');
    this.cv.width = map.w;
    this.cv.height = map.h;
    const ctx = this.cv.getContext('2d');
    if (!ctx) return;
    for (let y = 0; y < map.h; y++) {
      for (let x = 0; x < map.w; x++) {
        const wch = map.layers.walls[y][x];
        const gch = map.layers.ground[y][x];
        let col = GROUND_COLORS[gch] ?? '#1c1c28';
        if (wch && wch !== '.') col = '#6a7090';
        ctx.fillStyle = col;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, game: Game, x: number, y: number, scale: number): void {
    if (!this.cv || !game.map) return;
    const w = this.mw * scale;
    const h = this.mh * scale;
    ctx.fillStyle = 'rgba(6,8,20,0.78)';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.drawImage(this.cv, x, y, w, h);
    ctx.strokeStyle = '#e0b34c';
    ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
    const px = x + (game.player.x / TILE) * scale;
    const py = y + (game.player.y / TILE) * scale;
    if (game.flags['mapEmberhold'] || game.map.id !== 'hub') {
      for (const n of game.npcs) {
        ctx.fillStyle = '#ffd76a';
        ctx.fillRect(x + (n.x / TILE) * scale - 0.5, y + (n.y / TILE) * scale - 0.5, 1.5, 1.5);
      }
      for (const e of game.map.exits) {
        ctx.fillStyle = '#6ae0e0';
        ctx.fillRect(x + (e.x / TILE) * scale, y + (e.y / TILE) * scale, Math.max(2, (e.w / TILE) * scale), Math.max(2, (e.h / TILE) * scale));
      }
      if (game.map.campfire) {
        ctx.fillStyle = '#ff9a2e';
        ctx.fillRect(x + game.map.campfire.tx * scale - 1, y + game.map.campfire.ty * scale - 1, 3, 3);
      }
      for (const c of game.chests) {
        if (!c.opened) {
          ctx.fillStyle = '#ffe89a';
          ctx.fillRect(x + (c.x / TILE) * scale - 0.5, y + (c.y / TILE) * scale - 0.5, 2, 2);
        }
      }
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(px - 1), Math.round(py - 1), 2, 2);
  }

  renderWorldMap(ctx: CanvasRenderingContext2D, game: Game): void {
    const cx = VIEW_W / 2;
    const cy = 86;
    ctx.fillStyle = 'rgba(6,8,20,0.85)';
    ctx.fillRect(30, 22, VIEW_W - 60, 130);
    ctx.strokeStyle = '#e0b34c';
    ctx.strokeRect(30.5, 22.5, VIEW_W - 61, 129);
    drawText(ctx, 'WORLD MAP', cx, 28, 1, '#ffd76a', 'center');
    const regions: { id: string; name: string; x: number; y: number; w: number; h: number }[] = [
      { id: 'hub', name: 'EMBERHOLD', x: cx - 22, y: cy - 12, w: 44, h: 24 },
      { id: 'biome_woods', name: 'WHISPERING WOODS', x: cx - 22, y: 34, w: 44, h: 20 },
      { id: 'biome_marshes', name: 'SUNKEN MARSHES', x: cx + 40, y: cy - 12, w: 60, h: 24 },
      { id: 'biome_wastes', name: 'SCORCHED WASTES', x: cx - 102, y: cy - 12, w: 56, h: 24 },
      { id: 'biome_spire', name: 'THE ASHEN SPIRE', x: cx - 30, y: cy + 22, w: 60, h: 20 }
    ];
    for (const r of regions) {
      const disc = game.discovered.has(r.id) || (r.id === 'hub' && game.flags['mapEmberhold']);
      ctx.fillStyle = disc ? '#2c3a2c' : '#191924';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = disc ? '#8ae06a' : '#3a3a4c';
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
      drawText(ctx, disc ? r.name : '???', r.x + r.w / 2, r.y + r.h / 2 - 2, 1, disc ? '#c8ffb0' : '#555a70', 'center');
      if (game.map && game.map.id === r.id) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(r.x + r.w / 2 - 1, r.y + r.h / 2 - 1, 3, 3);
      }
    }
    drawText(ctx, 'N', cx, 26, 1, '#6a7090', 'center');
  }
}
