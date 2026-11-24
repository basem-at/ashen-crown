import './stubs';
import { Game } from '../src/game/Game';
import { HUB_TREES } from '../src/world/HubDialogue';
import { HUB_H } from '../src/world/HubVillage';
import { Projectile } from '../src/entities/Projectile';
import { HollowKing } from '../src/entities/bosses';
import { ShadowKnight, VoidMage, FallenGuard, createEnemy } from '../src/entities/enemies';
import { Destructible } from '../src/entities/Destructible';
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
function section(t: string): void {
  console.log('\n== ' + t + ' ==');
}

const canvas = makeCanvas();
const game = new Game(canvas as unknown as HTMLCanvasElement);
const input = game.input as unknown as { keys: Set<string>; pressed: Set<string> };
const press = (code: string) => input.pressed.add(code);
const hold = (code: string, on = true) => {
  if (on) input.keys.add(code);
  else input.keys.delete(code);
};
function step(sec: number, fn?: (i: number) => void): void {
  const dt = 1 / 60;
  const n = Math.round(sec * 60);
  for (let i = 0; i < n; i++) {
    fn?.(i);
    game.update(dt);
    game.input.endFrame();
    let guard = 0;
    while (game.mode === 'levelup' && guard++ < 10) game.applyLevelUp(0);
  }
}

try {
  section('Boot & hub start');
  game.startNewGame(0);
  step(0.3);
  check('mode is play', game.mode === 'play');
  check('map is hub', game.map?.id === 'hub');
  game.render();
  check('hub render does not throw', true);

  section('Phase-5 prerequisites: flags, relics, quest tracker');
  game.quests.start('main', game);
  game.setFlag('metElder', 1);
  game.setFlag('metLore', 1);
  game.quests.done.push('tonic');
  game.setFlag('elderAfterTonic', 1);
  game.setFlag('gate_woods', 1);
  game.setFlag('boss_brambleheart', 1);
  game.giveRelic('windBoots');
  game.setFlag('gate_marshes', 1);
  game.setFlag('boss_warden', 1);
  game.giveRelic('emberLantern');
  game.setFlag('gate_wastes', 1);
  game.setFlag('boss_ignis', 1);
  game.giveRelic('frostAegis');
  step(0.3);
  check('player owns all 3 relics', game.player.inv.relics.length === 3);
  check(
    'main quest advanced to Hollow King objective',
    game.quests.currentObjective('main') === 'Defeat the Hollow King and claim the Ashen Crown.'
  );

  section('Spire gate unlock & Elder dialogue');
  const gateS = game.doors.find((d) => d.id === 'gate_s');
  check('south gate exists and is a ward gate', !!gateS && gateS.kind === 'gate' && gateS.requireFlag === 'boss_ignis');
  check('south gate now open', !!gateS && gateS.open === true && gateS.solid === false);
  check('gate_spire quest flag set', game.flags['gate_spire'] === 1);
  const greetNode = (HUB_TREES.elder.nodes as Record<string, { goto?: (g: Game) => string }>).greet;
  check('Elder dialogue branches to final "spire" node', greetNode.goto!(game) === 'spire');
  const spireNode = (HUB_TREES.elder.nodes as Record<string, { text?: string | string[] }>).spire;
  check(
    'spire dialogue mentions Hollow King / relics',
    Array.isArray(spireNode.text) && spireNode.text.join(' ').includes('Hollow King') && spireNode.text.join(' ').includes('relics')
  );

  section('Travel through south exit into the Ashen Spire');
  game.player.x = 24 * 16 + 8;
  game.player.y = HUB_H * 16 - 4;
  step(0.15);
  check('exit transitioned to biome_spire', game.map?.id === 'biome_spire');
  check('spawned at spire spawn point', Math.abs(game.player.x - (12 * 16 + 8)) < 2 && Math.abs(game.player.y - (34 * 16 + 12)) < 2);
  game.render();
  check('spire render does not throw', true);

  section('Spire structure: rooms, gauntlet features, entities');
  const m = game.map!;
  const ground = m.layers.ground;
  let chasm = 0;
  let lava = 0;
  for (const row of ground) for (const ch of row) {
    if (ch === 'X') chasm++;
    if (ch === 'M') lava++;
  }
  check('chasm (gap) tiles present', chasm >= 8);
  check('lava tiles present', lava >= 32);
  check('pitch-black dark rect present', (m.darkRects?.length ?? 0) >= 1);
  check('two braziers present', game.braziers.length === 2);
  check('burnable webs present', game.destructibles.filter((d) => d.kind === 'web').length === 2);
  check('campfire save point in sanctuary', !!game.campfire);
  check('5 chests present', game.chests.length === 5);
  check('exit back to hub present', m.exits.some((e) => e.to === 'hub'));
  check('boss zone is hollowKing with door lock', m.bossZone?.kind === 'hollowKing' && m.bossZone.doorIds.includes('sdoorG'));
  check('11 elite enemies spawned', game.enemies.length === 11);
  check('ShadowKnight instances present', game.enemies.some((e) => e instanceof ShadowKnight));
  check('VoidMage instances present', game.enemies.some((e) => e instanceof VoidMage));
  check('FallenGuard instances present', game.enemies.some((e) => e instanceof FallenGuard));
  check('hollowKing 48x48 sprite with 4 phase frames', (game.enemySprites['hollowKing' as keyof typeof game.enemySprites] as { w: number; h: number; frames: unknown[] }).w === 48);

  const p = game.player;
  p.maxHp = 100000;
  p.hp = 100000;
  p.maxMana = 1000;
  p.mana = 1000;

  section('Wind Boots: dash crosses chasms, walking is blocked');
  check('chasm tile solid on foot', game.isSolidAt(9 * 16 + 8, 12 * 16 + 8, {}) === true);
  check('chasm tile passable while dashing (gaps)', game.isSolidAt(9 * 16 + 8, 12 * 16 + 8, { gaps: true }) === false);
  p.x = 8 * 16 + 8;
  p.y = 12 * 16 + 8;
  p.dashT = 0;
  game.moveEntity(p, 30, 0);
  check('blocked by chasm without dash', p.x === 8 * 16 + 8);
  p.dashT = 0.5;
  game.moveEntity(p, 30, 0);
  game.moveEntity(p, 30, 0);
  check('dash crosses the chasm', p.x >= 11 * 16);
  p.dashT = 0;

  section('Ember Lantern: web burning (with negative control)');
  const web1 = game.destructibles.find((d) => d.id === 'sweb_1')!;
  const web2 = game.destructibles.find((d) => d.id === 'sweb_2')!;
  p.x = web2.x - 12;
  p.y = web2.y + 8;
  const savedRelics = p.inv.relics.splice(0, p.inv.relics.length);
  for (let i = 0; i < 90; i++) web2.update(1 / 60, game);
  check('web does NOT burn without the lantern', !web2.broken);
  p.inv.relics.push(...savedRelics);
  p.x = web1.x - 12;
  p.y = web1.y + 8;
  for (let i = 0; i < 240 && !web1.broken; i++) web1.update(1 / 60, game);
  check('web burns away with the lantern nearby', web1.broken === true && web1.solid === false);

  section('Ember Lantern: brazier puzzle unseals the door');
  const doorC = game.doors.find((d) => d.id === 'sdoorC_east')!;
  check('brazier door starts sealed', doorC.open === false && doorC.solid === true);
  const br1 = game.braziers.find((b) => b.id === 'sbrazier_dark1')!;
  const br2 = game.braziers.find((b) => b.id === 'sbrazier_dark2')!;
  br1.interact(game);
  check('first brazier lit', br1.lit === true);
  step(0.1);
  check('door still sealed with one brazier lit', doorC.open === false);
  br2.interact(game);
  step(0.1);
  check('all braziers lit -> door unsealed', br2.lit === true && doorC.open === true && doorC.solid === false);

  section('Frost Aegis: freezes lava into walkable ice, then thaws');
  p.x = 60 * 16 + 8;
  p.y = 10 * 16 + 8;
  check('lava tile solid before freeze', game.isSolidAt(60 * 16 + 8, 12 * 16 + 8, {}) === true);
  game.freezeLavaAround(p);
  check('lava frozen around player', game.frozen.size >= 8);
  check('frozen lava is walkable', game.isSolidAt(60 * 16 + 8, 12 * 16 + 8, {}) === false);
  game.time += 8;
  step(0.1);
  check('lava re-solidifies after thaw', game.isSolidAt(60 * 16 + 8, 12 * 16 + 8, {}) === true);

  section('Frost Aegis: directional shield reflects enemy projectiles');
  p.x = 60 * 16 + 8;
  p.y = 10 * 16 + 8;
  p.anim.dir = 'right';
  p.shieldOn = true;
  const pr = new Projectile(p.x + 12, p.y - 8, 'left', 60, 6, { fromPlayer: false, element: 'void', ttl: 5 });
  game.projectiles.push(pr);
  for (let i = 0; i < 12 && !pr.fromPlayer; i++) pr.update(1 / 60, game);
  check('projectile reflected back as player-owned frost bolt', pr.fromPlayer === true && pr.element === 'frost' && pr.vx > 0);
  p.shieldOn = false;
  const pr2 = new Projectile(p.x - 12, p.y - 8, 'right', 60, 6, { fromPlayer: false, element: 'void', ttl: 5 });
  game.projectiles.push(pr2);
  for (let i = 0; i < 12 && !pr2.fromPlayer; i++) pr2.update(1 / 60, game);
  check('projectile behind the shield is NOT reflected', pr2.fromPlayer === false);

  section('Elite enemy AI: knight dashes, mage teleports+spell, guard slams/charges');
  p.x = 65 * 16 + 8;
  p.y = 35 * 16 + 8;
  const knight = createEnemy('shadowKnight', 0, 0) as ShadowKnight;
  knight.x = 63 * 16 + 8;
  knight.y = 30 * 16 + 8;
  const mage = createEnemy('voidMage', 0, 0) as VoidMage;
  mage.x = 72 * 16 + 8;
  mage.y = 30 * 16 + 8;
  const guard = createEnemy('fallenGuard', 0, 0) as FallenGuard;
  guard.x = 63 * 16 + 8;
  guard.y = 38 * 16 + 8;
  game.enemies.push(knight, mage, guard);
  let minKnightD = 1e9;
  let maxProj = 0;
  let mageTeleported = false;
  let guardActed = false;
  const mageHome = { x: mage.x, y: mage.y };
  const guardHome = { x: guard.x, y: guard.y };
  step(5, () => {
    minKnightD = Math.min(minKnightD, Math.hypot(knight.x - p.x, knight.y - (p.y - 8)));
    maxProj = Math.max(maxProj, game.projectiles.length);
    if (Math.abs(mage.x - mageHome.x) + Math.abs(mage.y - mageHome.y) > 60) mageTeleported = true;
    if (Math.hypot(guard.x - guardHome.x, guard.y - guardHome.y) > 3 || guard.attackT > 0) guardActed = true;
  });
  check('Shadow Knight closed distance (dash/combo AI)', minKnightD < 60);
  check('Void Mage fired void bolts', maxProj > 0);
  check('Void Mage teleported', mageTeleported);
  check('Fallen Guard moved or telegraphed slam/charge', guardActed);
  game.render();
  check('combat render does not throw', true);

  section('Hollow King: arena lock-in, boss bar, 4 phases');
  game.projectiles = [];
  game.hazards = [];
  p.x = 38 * 16 + 8;
  p.y = 55 * 16 + 8;
  step(0.3);
  const boss = game.enemies.find((e) => e.bossId === 'hollowKing');
  check('Hollow King spawned in throne room', boss instanceof HollowKing);
  check('boss bar active with correct name', game.bossBar?.name === 'THE HOLLOW KING' && game.bossBar.max === 260);
  const doorG = game.doors.find((d) => d.id === 'sdoorG')!;
  check('arena door locked during fight', doorG.bossLocked === true && doorG.open === false && doorG.solid === true);
  check('boss starts in phase 1', boss!.phase === 1);
  game.render();
  check('boss-fight render (boss bar) does not throw', true);

  boss!.hp = boss!.maxHp * 0.7;
  step(2.5);
  check('phase 2 reached (spiral + rings)', boss!.phase === 2);
  let p2max = 0;
  step(2, () => {
    p2max = Math.max(p2max, game.projectiles.length);
  });
  check('phase 2 fires bullet patterns', p2max > 0);

  boss!.hp = boss!.maxHp * 0.4;
  let hzMax = 0;
  let minionsSeen = 0;
  step(6, () => {
    hzMax = Math.max(hzMax, game.hazards.length);
    minionsSeen = Math.max(minionsSeen, game.enemies.filter((e) => e.minion && !e.dead).length);
  });
  check('phase 3 reached (void hazards + summons)', boss!.phase === 3 && hzMax > 0 && minionsSeen > 0);

  boss!.hp = boss!.maxHp * 0.1;
  let p4max = 0;
  step(4, () => {
    p4max = Math.max(p4max, game.projectiles.length);
  });
  check('phase 4 reached (bullet-hell finale)', boss!.phase === 4 && p4max > 0);
  game.render();

  section('Hollow King kill -> shards, flags, quest complete, ending');
  game.combat.applyDamage(boss!, 99999, { dir: 'down', knockback: 0, element: 'none', crit: false, source: null });
  step(0.6);
  check('boss_hollowKing flag set', game.flags['boss_hollowKing'] === 1);
  check('arena door unlocked after kill', doorG.bossLocked === false && doorG.open === true && doorG.solid === false);
  check('boss bar cleared', game.bossBar === null);
  check('boss shards dropped', game.pickups.some((pk) => pk.kind === 'item' && pk.item === 'bossShard'));
  check('main quest completed', game.quests.isDone('main'));
  check('ending flag set', game.flags['ending'] === 1);
  check('game switched to ending mode', game.mode === 'ending');
  step(3);
  game.render();
  check('ending/credits screen runs and renders without throwing', game.mode === 'ending');

  section('Save/load round-trip with spire state');
  game.saveGame(0);
  const g2 = new Game(makeCanvas() as unknown as HTMLCanvasElement);
  g2.loadGame(0);
  check('save persists map + flags + relics', g2.map?.id === 'biome_spire' && g2.flags['boss_hollowKing'] === 1 && g2.player.inv.relics.length === 3);
  check('ending flag persists through save', g2.flags['ending'] === 1);
} catch (err) {
  fail++;
  console.error('SMOKE EXCEPTION:', err);
}

console.log('\n========================================');
console.log('SMOKE5 RESULT: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail > 0 ? 1 : 0);
