import { Entity } from './Entity';
import type { Game } from '../game/Game';
import { rectsOverlap } from '../types';
import { drawSprite } from '../graphics/PixelArt';

export class Switch extends Entity {
  id: string;
  doorId: string;
  active = false;
  solid = false;

  constructor(id: string, doorId: string, tx: number, ty: number) {
    super();
    this.id = id;
    this.doorId = doorId;
    this.x = tx * 16 + 8;
    this.y = ty * 16 + 8;
    this.w = 14;
    this.h = 14;
  }

  update(dt: number, game: Game): void {
    if (this.active) return;
    const box = { x: this.x - 8, y: this.y - 8, w: 16, h: 16 };
    let active = false;
    if (rectsOverlap(box, game.player.hitbox)) active = true;
    for (const e of game.enemies) {
      if (!e.dead && rectsOverlap(box, e.hitbox)) active = true;
    }
    for (const b of game.blocks) {
      if (rectsOverlap(box, b.hitbox)) active = true;
    }
    if (active) {
      this.active = true;
      game.audio.sfx('select');
      game.particles.burst(this.x, this.y, '#6ab0ff', 6, 45, 1);
    }
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    drawSprite(ctx, this.active ? game.sprites.props['plateDown'] : game.sprites.props['plateUp'], this.x - 8, this.y - 8);
  }
}
