import { TILE, VIEW_W, VIEW_H } from '../types';
import { drawSprite } from './PixelArt';
import type { GameMap } from '../world/MapData';
import type { SpriteSet } from './Sprites';

export class TilemapRenderer {
  private waterT = 0;

  update(dt: number): void {
    this.waterT += dt;
  }

  renderLayer(
    ctx: CanvasRenderingContext2D,
    sprites: SpriteSet,
    map: GameMap,
    layer: 'ground' | 'walls' | 'decor' | 'canopy',
    camX: number,
    camY: number,
    frozen: Set<string> | null = null
  ): void {
    const rows = map.layers[layer];
    const x0 = Math.max(0, Math.floor(camX / TILE) - 1);
    const y0 = Math.max(0, Math.floor(camY / TILE) - 1);
    const x1 = Math.min(map.w - 1, Math.ceil((camX + VIEW_W) / TILE) + 1);
    const y1 = Math.min(map.h - 1, Math.ceil((camY + VIEW_H) / TILE) + 1);
    for (let y = y0; y <= y1; y++) {
      const row = rows[y];
      for (let x = x0; x <= x1; x++) {
        const ch = row[x];
        if (!ch || ch === '.') continue;
        let spr = sprites.tiles[ch];
        if (ch === '~') spr = sprites.tiles[Math.floor(this.waterT * 3) % 2 === 0 ? '~' : '~2'];
        if (ch === 'M') spr = sprites.tiles[Math.floor(this.waterT * 3) % 2 === 0 ? 'M' : 'M2'];
        if (frozen && frozen.has(x + ',' + y) && (ch === 'M' || ch === '~')) spr = sprites.tiles['I'];
        if (spr) drawSprite(ctx, spr, x * TILE - camX, y * TILE - camY);
      }
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    sprites: SpriteSet,
    map: GameMap,
    camX: number,
    camY: number,
    drawEntities: () => void,
    frozen: Set<string> | null = null
  ): void {
    this.renderLayer(ctx, sprites, map, 'ground', camX, camY, frozen);
    this.renderLayer(ctx, sprites, map, 'walls', camX, camY, frozen);
    drawEntities();
    this.renderLayer(ctx, sprites, map, 'decor', camX, camY, frozen);
    this.renderLayer(ctx, sprites, map, 'canopy', camX, camY, frozen);
  }
}
