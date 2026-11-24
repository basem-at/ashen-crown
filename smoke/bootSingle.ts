import './stubs';
import './dist/bundle.mjs';

const g = globalThis as unknown as { game?: { mode: string; map: { id: string; name: string } | null; enemies: unknown[] } };
const game = g.game;
if (!game) {
  console.error('BOOT FAIL: window.game not set');
  process.exit(1);
}
console.log('BOOT OK: game constructed from single-file inline bundle');
console.log('  mode=' + game.mode + '  map=' + (game.map?.id ?? 'none') + ' (' + (game.map?.name ?? '') + ')');
console.log('  enemies on hub map: ' + game.enemies.length);
process.exit(0);
