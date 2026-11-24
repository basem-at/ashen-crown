import { Game } from './game/Game';
import { VIEW_W, VIEW_H } from './types';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const game = new Game(canvas);

function resize(): void {
  const s = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  canvas.style.width = Math.floor(VIEW_W * s) + 'px';
  canvas.style.height = Math.floor(VIEW_H * s) + 'px';
}
window.addEventListener('resize', resize);
resize();

const unlockAudio = () => {
  game.audio.ensure();
  if (game.mode === 'title') game.audio.playMusic('title');
};
window.addEventListener('keydown', unlockAudio, { once: true });
window.addEventListener('pointerdown', unlockAudio, { once: true });

game.start();

(window as unknown as { game: Game }).game = game;
