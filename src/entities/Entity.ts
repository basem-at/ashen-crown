import { Dir, Element, Rect } from '../types';
import type { Game } from '../game/Game';

export interface Interactable {
  x: number;
  y: number;
  radius: number;
  prompt(game: Game): string;
  interact(game: Game): void;
}

export abstract class Entity {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  w = 10;
  h = 10;
  hp = 1;
  maxHp = 1;
  dead = false;
  solid = true;
  invulnT = 0;
  flashT = 0;
  fly = false;
  emitsLight = false;
  shieldDir: Dir | null = null;
  dir: Dir = 'down';
  status: { type: Element; until: number } | null = null;

  abstract update(dt: number, game: Game): void;
  abstract render(ctx: CanvasRenderingContext2D, game: Game): void;

  get hitbox(): Rect {
    return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h };
  }

  getDefense(): number {
    return 0;
  }

  get slowFactor(): number {
    if (this.status && this.status.type === 'frost' && this.status.until > 0) return 0.5;
    return 1;
  }

  applyStatus(type: Element, dur: number, now: number): void {
    if (type === 'none') return;
    this.status = { type, until: now + dur };
  }

  tickStatus(now: number): void {
    if (this.status && this.status.until <= now) this.status = null;
  }

  applyKnockback(dx: number, dy: number): void {
    this.vx += dx;
    this.vy += dy;
  }

  decayKnockback(dt: number): void {
    const f = Math.max(0, 1 - dt * 6);
    this.vx *= f;
    this.vy *= f;
  }

  onDeath(_game: Game): void {}
}
