import { Dir } from '../types';
import { CharSprites, drawCharFrame } from './Sprites';
import { drawSprite } from './PixelArt';

export type AnimState = 'idle' | 'walk' | 'attack' | 'hurt' | 'dead' | 'dash';

export class AnimationController {
  state: AnimState = 'idle';
  dir: Dir = 'down';
  t = 0;
  attackFrame = 0;
  attackT = 0;
  hurtT = 0;
  deadT = 0;

  setState(s: AnimState, dir?: Dir): void {
    if (this.state !== s) {
      this.state = s;
      this.t = 0;
      if (s === 'attack') {
        this.attackT = 0;
        this.attackFrame = 0;
      }
      if (s === 'hurt') this.hurtT = 0;
      if (s === 'dead') this.deadT = 0;
    }
    if (dir) this.dir = dir;
  }

  update(dt: number): void {
    this.t += dt;
    if (this.state === 'attack') {
      this.attackT += dt;
      this.attackFrame = Math.min(2, Math.floor(this.attackT / 0.08));
    }
    if (this.state === 'hurt') this.hurtT += dt;
    if (this.state === 'dead') this.deadT += dt;
  }

  get frameIndex(): number {
    if (this.state === 'walk' || this.state === 'dash') {
      return Math.floor(this.t * 10) % 2;
    }
    return 0;
  }

  render(ctx: CanvasRenderingContext2D, spr: CharSprites, x: number, y: number, flash = false): void {
    if (this.state === 'dead') {
      drawSprite(ctx, spr.dead, x, y + 8);
      return;
    }
    if (this.state === 'attack') {
      drawCharFrame(ctx, spr, this.dir, 0, x, y);
      drawSprite(ctx, spr.slash[this.dir][this.attackFrame], x, y + 8);
      return;
    }
    drawCharFrame(ctx, spr, this.dir, this.frameIndex, x, y);
  }
}
