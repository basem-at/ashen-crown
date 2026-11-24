import { Entity } from './Entity';
import type { Game } from '../game/Game';
import { drawSprite } from '../graphics/PixelArt';

export class Block extends Entity {
  constructor(tx: number, ty: number) {
    super();
    this.x = tx * 16 + 8;
    this.y = ty * 16 + 12;
    this.w = 14;
    this.h = 14;
  }

  update(_dt: number, _game: Game): void {}

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 2, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    drawSprite(ctx, game.sprites.props['block'], this.x - 8, this.y - 12);
  }
}
