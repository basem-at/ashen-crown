import { Entity, Interactable } from './Entity';
import type { Game } from '../game/Game';
import { Dir, dirFromVec, dist2, RNG } from '../types';
import { AnimationController } from '../graphics/AnimationController';
import { drawSprite, tinted } from '../graphics/PixelArt';

export class NPC extends Entity implements Interactable {
  name: string;
  charId: string;
  tree: string;
  anim = new AnimationController();
  radius = 16;
  private rng = new RNG(Math.floor(Math.random() * 1e9));
  private wanderT = 0;
  private wx = 0;
  private wy = 0;
  roam: boolean;

  constructor(name: string, charId: string, tree: string, tx: number, ty: number, roam = false) {
    super();
    this.name = name;
    this.charId = charId;
    this.tree = tree;
    this.x = tx * 16 + 8;
    this.y = ty * 16 + 12;
    this.w = 10;
    this.h = 8;
    this.roam = roam;
  }

  prompt(): string {
    return 'Talk';
  }

  interact(game: Game): void {
    game.startDialogue(this.tree, this.name);
  }

  update(dt: number, game: Game): void {
    this.anim.update(dt);
    const p = game.player;
    const d2 = dist2(this.x, this.y - 8, p.x, p.y - 8);
    if (d2 < 34 * 34) {
      this.anim.dir = dirFromVec(p.x - this.x, (p.y - 8) - (this.y - 8));
      this.anim.setState('idle');
      this.roam && (this.wanderT = 0);
      return;
    }
    if (!this.roam) {
      this.anim.setState('idle');
      return;
    }
    this.wanderT -= dt;
    if (this.wanderT <= 0) {
      this.wanderT = this.rng.range(1, 2.5);
      if (this.rng.chance(0.4)) {
        this.wx = 0;
        this.wy = 0;
      } else {
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const d = this.rng.pick(dirs);
        this.wx = d[0];
        this.wy = d[1];
      }
    }
    if (this.wx !== 0 || this.wy !== 0) {
      this.anim.setState('walk', dirFromVec(this.wx, this.wy));
      game.moveEntity(this, this.wx * 22 * dt, this.wy * 22 * dt);
    } else {
      this.anim.setState('idle');
    }
  }

  render(ctx: CanvasRenderingContext2D, game: Game): void {
    const spr = game.sprites.chars[this.charId];
    if (!spr) return;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 1, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    const set = this.anim.dir === 'left' ? spr.sideLeft : this.anim.dir === 'right' ? spr.side : this.anim.dir === 'up' ? spr.up : spr.down;
    const fr = set[this.anim.frameIndex % set.length];
    drawSprite(ctx, fr, this.x - 8, this.y - 24);
    const p = game.player;
    if (dist2(this.x, this.y - 8, p.x, p.y - 8) < 40 * 40 && game.mode === 'play') {
      const bob = Math.sin(game.time * 5) * 1.5;
      ctx.fillStyle = '#ffd76a';
      ctx.fillRect(Math.round(this.x - 1), Math.round(this.y - 33 + bob), 2, 3);
      ctx.fillRect(Math.round(this.x - 1), Math.round(this.y - 29 + bob), 2, 1);
    }
  }
}
