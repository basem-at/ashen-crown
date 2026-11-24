import { VIEW_W, VIEW_H } from '../types';

const GAME_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyJ', 'KeyK', 'KeyX', 'KeyZ', 'KeyE', 'KeyQ', 'KeyF',
  'Space', 'Enter', 'Escape', 'Tab', 'ShiftLeft', 'ShiftRight',
  'Digit1', 'Digit2', 'Digit3', 'Digit4', 'KeyM', 'KeyP', 'KeyH', 'KeyR',
  'F1', 'F2', 'F3'
]);

export class InputManager {
  private keys = new Set<string>();
  private pressed = new Set<string>();
  mouse = { x: 0, y: 0, down: false, pressed: false, rightPressed: false, rightDown: false };
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener('keydown', (e) => {
      if (GAME_KEYS.has(e.code)) e.preventDefault();
      if (!e.repeat) {
        this.keys.add(e.code);
        this.pressed.add(e.code);
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
    window.addEventListener('blur', () => {
      this.keys.clear();
    });
    canvas.addEventListener('mousedown', (e) => {
      this.updateMouse(e);
      if (e.button === 0) {
        this.mouse.down = true;
        this.mouse.pressed = true;
      }
      if (e.button === 2) {
        this.mouse.rightPressed = true;
        this.mouse.rightDown = true;
      }
      e.preventDefault();
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.down = false;
      if (e.button === 2) this.mouse.rightDown = false;
    });
    canvas.addEventListener('mousemove', (e) => this.updateMouse(e));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private updateMouse(e: MouseEvent): void {
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - r.left) / r.width) * VIEW_W;
    this.mouse.y = ((e.clientY - r.top) / r.height) * VIEW_H;
  }

  down(code: string): boolean {
    return this.keys.has(code);
  }

  hit(code: string): boolean {
    return this.pressed.has(code);
  }

  axis(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    if (this.down('KeyA') || this.down('ArrowLeft')) x -= 1;
    if (this.down('KeyD') || this.down('ArrowRight')) x += 1;
    if (this.down('KeyW') || this.down('ArrowUp')) y -= 1;
    if (this.down('KeyS') || this.down('ArrowDown')) y += 1;
    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.SQRT2;
      x *= inv;
      y *= inv;
    }
    return { x, y };
  }

  attackPressed(): boolean {
    return this.hit('KeyJ') || this.hit('KeyZ') || this.mouse.pressed;
  }

  attackHeld(): boolean {
    return this.down('KeyJ') || this.down('KeyZ') || this.mouse.down;
  }

  interactPressed(): boolean {
    return this.hit('KeyF') || this.hit('Enter') || this.mouse.pressed;
  }

  endFrame(): void {
    this.pressed.clear();
    this.mouse.pressed = false;
    this.mouse.rightPressed = false;
  }
}
