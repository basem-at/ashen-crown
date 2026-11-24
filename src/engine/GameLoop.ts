export class GameLoop {
  private last = 0;
  private acc = 0;
  readonly step = 1 / 60;
  private running = false;
  elapsed = 0;

  constructor(
    private update: (dt: number) => void,
    private render: () => void
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
  }

  private frame = (t: number): void => {
    if (!this.running) return;
    let dt = (t - this.last) / 1000;
    this.last = t;
    if (dt > 0.25) dt = 0.25;
    this.acc += dt;
    while (this.acc >= this.step) {
      this.elapsed += this.step;
      this.update(this.step);
      this.acc -= this.step;
    }
    this.render();
    requestAnimationFrame(this.frame);
  };
}
