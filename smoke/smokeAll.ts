import './stubs';
import { Game } from '../src/game/Game';
import { makeCanvas } from './stubs';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean): void {
  if (cond) {
    pass++;
    console.log('  PASS  ' + name);
  } else {
    fail++;
    console.log('  FAIL  ' + name);
  }
}

const game = new Game(makeCanvas() as unknown as HTMLCanvasElement);
game.startNewGame(0);
const input = game.input as unknown as { keys: Set<string>; pressed: Set<string> };
function step(sec: number): void {
  const dt = 1 / 60;
  for (let i = 0; i < Math.round(sec * 60); i++) {
    game.update(dt);
    game.input.endFrame();
    let guard = 0;
    while (game.mode === 'levelup' && guard++ < 10) game.applyLevelUp(0);
  }
}

const p = game.player;
p.maxHp = 100000;
p.hp = 100000;

try {
  for (const map of game.world.all()) {
    console.log('\n== map: ' + map.id + ' (' + map.name + ') ==');
    game.loadMap(map.id, map.spawn.tx, map.spawn.ty);
    game.giveRelic('windBoots');
    game.giveRelic('emberLantern');
    game.giveRelic('frostAegis');
    step(1.5);
    check(map.id + ': 1.5s of play updates OK, mode=' + game.mode, game.mode === 'play' || game.mode === 'gameover');
    game.render();
    check(map.id + ': render OK', true);
    check(map.id + ': enemies=' + game.enemies.length + ' npcs=' + game.npcs.length + ' chests=' + game.chests.length + ' doors=' + game.doors.length, true);
    if (map.bossZone) {
      p.x = map.bossZone.x + map.bossZone.w / 2;
      p.y = map.bossZone.y + map.bossZone.h / 2;
      step(0.3);
      const boss = game.enemies.find((e) => e.bossId && !e.dead);
      check(map.id + ': boss spawned (' + (boss?.name ?? 'none') + '), bar=' + (game.bossBar?.name ?? 'none'), !!boss && !!game.bossBar);
      const hpBefore = p.hp;
      let fightProjs = 0;
      const dt0 = 1 / 60;
      for (let i = 0; i < 180; i++) {
        game.update(dt0);
        game.input.endFrame();
        fightProjs = Math.max(fightProjs, game.projectiles.length + game.hazards.length);
        let guard = 0;
        while (game.mode === 'levelup' && guard++ < 10) game.applyLevelUp(0);
      }
      game.render();
      check(map.id + ': boss fight is live (boss damaged player or attacked), proj/haz=' + fightProjs, !!boss && (p.hp < hpBefore || fightProjs > 0));
      if (boss) {
        game.combat.applyDamage(boss, 999999, { dir: 'down', knockback: 0, element: 'none', crit: false, source: null });
        step(0.5);
        check(map.id + ': boss kill -> flag boss_' + boss.bossId, game.flags['boss_' + boss.bossId] === 1);
      }
      game.loadMap(map.id, map.spawn.tx, map.spawn.ty);
    }
  }

  console.log('\n== full quest chain ==');
  game.quests.start('main', game);
  game.setFlag('metElder', 1);
  game.setFlag('metLore', 1);
  game.quests.done.push('tonic');
  game.setFlag('elderAfterTonic', 1);
  game.setFlag('gate_woods', 1);
  game.setFlag('boss_brambleheart', 1);
  game.setFlag('gate_marshes', 1);
  game.setFlag('boss_warden', 1);
  game.setFlag('gate_wastes', 1);
  game.setFlag('boss_ignis', 1);
  game.setFlag('gate_spire', 1);
  game.setFlag('boss_hollowKing', 1);
  step(0.5);
  check('main quest completes -> ending flag', game.quests.isDone('main') && game.flags['ending'] === 1);
  check('mode is ending', game.mode === 'ending');
  step(2);
  game.render();
  check('ending renders', true);

  console.log('\n== side quests registered ==');
  for (const q of ['herbs', 'sparring', 'lostMap']) {
    game.quests.start(q, game);
    check('quest "' + q + '" starts', game.quests.isActive(q));
  }
  check('quest "tonic" tracked (done)', game.quests.isDone('tonic'));

  console.log('\n== save slots ==');
  game.saveGame(1);
  check('hasAnySave after save', game.hasAnySave());
  const g2 = new Game(makeCanvas() as unknown as HTMLCanvasElement);
  g2.loadGame(1);
  check('slot 2 loads', g2.currentSlot === 1 && g2.flags['boss_hollowKing'] === 1);
} catch (err) {
  fail++;
  console.error('SMOKE-ALL EXCEPTION:', err);
}

console.log('\n========================================');
console.log('SMOKE-ALL RESULT: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail > 0 ? 1 : 0);
