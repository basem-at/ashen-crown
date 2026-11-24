import { clamp, lerp, VIEW_W, VIEW_H } from '../types';

export class Camera {
  x = 0;
  y = 0;
  shakeMag = 0;
  shakeX = 0;
  shakeY = 0;
  private boundsW = VIEW_W;
  private boundsH = VIEW_H;

  setBounds(w: number, h: number): void {
    this.boundsW = w;
    this.boundsH = h;
  }

  follow(tx: number, ty: number, dt: number, snap = false): void {
    const targetX = tx - VIEW_W / 2;
    const targetY = ty - VIEW_H / 2;
    const maxX = Math.max(0, this.boundsW - VIEW_W);
    const maxY = Math.max(0, this.boundsH - VIEW_H);
    const cx = clamp(targetX, 0, maxX);
    const cy = clamp(targetY, 0, maxY);
    if (snap) {
      this.x = cx;
      this.y = cy;
    } else {
      const t = 1 - Math.pow(0.0001, dt);
      this.x = lerp(this.x, cx, t);
      this.y = lerp(this.y, cy, t);
    }
    if (this.boundsW <= VIEW_W) this.x = (this.boundsW - VIEW_W) / 2;
    if (this.boundsH <= VIEW_H) this.y = (this.boundsH - VIEW_H) / 2;
  }

  shake(amount: number): void {
    this.shakeMag = Math.max(this.shakeMag, amount);
  }

  update(dt: number): void {
    if (this.shakeMag > 0) {
      this.shakeX = (Math.random() * 2 - 1) * this.shakeMag;
      this.shakeY = (Math.random() * 2 - 1) * this.shakeMag;
      this.shakeMag = Math.max(0, this.shakeMag - dt * 26);
      if (this.shakeMag <= 0.05) {
        this.shakeMag = 0;
        this.shakeX = 0;
        this.shakeY = 0;
      }
    }
  }

  get viewX(): number {
    return this.x + this.shakeX;
  }

  get viewY(): number {
    return this.y + this.shakeY;
  }
}
