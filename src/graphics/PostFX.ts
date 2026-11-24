import { VIEW_W, VIEW_H } from '../types';

export class PostFX {
  crt = true;
  private scan: HTMLCanvasElement;
  private sctx: CanvasRenderingContext2D;

  constructor() {
    this.scan = document.createElement('canvas');
    this.scan.width = VIEW_W;
    this.scan.height = VIEW_H;
    const ctx = this.scan.getContext('2d');
    if (!ctx) throw new Error('no ctx');
    this.sctx = ctx;
    this.sctx.fillStyle = 'rgba(0,0,0,0.16)';
    for (let y = 0; y < VIEW_H; y += 2) this.sctx.fillRect(0, y, VIEW_W, 1);
  }

  toggle(): boolean {
    this.crt = !this.crt;
    return this.crt;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.crt) return;
    ctx.drawImage(this.scan, 0, 0);
    const g = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.45, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.95);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.32)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}
