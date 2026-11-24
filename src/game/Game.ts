import { GameLoop } from '../engine/GameLoop';
import { InputManager } from '../engine/InputManager';
import { Camera } from '../engine/Camera';
import { LightingEngine } from '../engine/LightingEngine';
import { ParticleSystem } from '../engine/ParticleSystem';
import { SaveManager, SaveData } from '../engine/SaveManager';
import { buildSprites, SpriteSet } from '../graphics/Sprites';
import { TilemapRenderer } from '../graphics/TilemapRenderer';
import { PostFX } from '../graphics/PostFX';
import { drawText, drawTextShadow } from '../graphics/PixelArt';
import { Chiptune } from '../audio/Chiptune';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { Enemy } from '../entities/Enemy';
import { createEnemy } from '../entities/enemies';
import { Brambleheart, DrownedWarden, Ignis, HollowKing } from '../entities/bosses';
import { Hazard } from '../entities/Hazard';
import { Brazier } from '../entities/Brazier';
import { Projectile } from '../entities/Projectile';
import { Pickup } from '../entities/Pickup';
import { Destructible, Campfire } from '../entities/Destructible';
import { Chest } from '../entities/Chest';
import { Door } from '../entities/Door';
import { Switch } from '../entities/Switch';
import { Block } from '../entities/Block';
import { Interactable } from '../entities/Entity';
import { buildEnemySprites } from '../graphics/EnemySprites';
import { World } from '../world/World';
import { GameMap } from '../world/MapData';
import { HUB_TREES } from '../world/HubDialogue';
import { CombatSystem } from '../systems/CombatSystem';
import { QuestSystem } from '../systems/QuestSystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { Minimap } from '../systems/Minimap';
import { ITEM_INFO } from '../systems/Inventory';
import { HUD } from '../ui/HUD';
import { TitleScreen } from '../ui/TitleScreen';
import { PauseMenu } from '../ui/PauseMenu';
import { ShopUI } from '../ui/ShopUI';
import { LevelUpScreen } from '../ui/LevelUpScreen';
import { GameOverScreen } from '../ui/GameOverScreen';
import { SaveMenu } from '../ui/SaveMenu';
import { EndingScreen } from '../ui/EndingScreen';
import { GameMode, VIEW_W, VIEW_H, TILE, clamp, rectsOverlap, Rect, DIR_VEC, ItemId, RelicId } from '../types';

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  sprites: SpriteSet;
  enemySprites: ReturnType<typeof buildEnemySprites>;
  input: InputManager;
  camera = new Camera();
  lighting = new LightingEngine();
  particles = new ParticleSystem();
  audio = new Chiptune();
  postfx = new PostFX();
  renderer = new TilemapRenderer();
  world = new World();

  mode: GameMode = 'title';
  prevMode: GameMode = 'title';
  map: GameMap | null = null;
  npcs: NPC[] = [];
  destructibles: Destructible[] = [];
  chests: Chest[] = [];
  doors: Door[] = [];
  enemies: Enemy[] = [];
  switches: Switch[] = [];
  blocks: Block[] = [];
  hazards: Hazard[] = [];
  braziers: Brazier[] = [];
  projectiles: Projectile[] = [];
  pickups: Pickup[] = [];
  campfire: Campfire | null = null;
  frozen = new Map<string, number>();
  private bossSpawned = false;
  player = new Player();
  combat = new CombatSystem(this);
  quests = new QuestSystem();
  dialogue = new DialogueSystem(HUB_TREES);
  minimap = new Minimap();
  hud = new HUD();
  title = new TitleScreen();
  pause = new PauseMenu();
  shop: ShopUI | null = null;
  levelUp = new LevelUpScreen();
  gameOver = new GameOverScreen();
  saveMenu = new SaveMenu();
  ending = new EndingScreen();

  flags: Record<string, number> = {};
  worldState: Record<string, Record<string, unknown>> = {};
  discovered = new Set<string>(['hub']);
  time = 0;
  playtime = 0;
  toastMsg = '';
  toastUntil = 0;
  pendingLevelUps = 0;
  bossBar: { name: string; hp: number; max: number } | null = null;
  slotMode: 'new' | 'continue' = 'new';
  slotCursor = 0;
  confirmSlot = -1;
  delConfirm = -1;
  dialoguePortrait = 'player';
  currentSlot = -1;
  crtOn = true;
  signLines: string[] = [];
  private exitToastCd = 0;
  private ended = false;
  private loop: GameLoop;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    this.ctx = ctx;
    ctx.imageSmoothingEnabled = false;
    this.sprites = buildSprites();
    this.enemySprites = buildEnemySprites();
    this.input = new InputManager(canvas);
    try {
      this.crtOn = localStorage.getItem('ashen_crown_crt') !== '0';
    } catch {
      this.crtOn = true;
    }
    this.postfx.crt = this.crtOn;
    this.loop = new GameLoop(
      (dt) => {
        this.update(dt);
        this.input.endFrame();
      },
      () => this.render()
    );
    this.loadMap('hub', this.world.get('hub').spawn.tx, this.world.get('hub').spawn.ty);
    this.dialogue.onEnd = () => {
      if (this.mode === 'dialogue') this.mode = 'play';
    };
  }

  start(): void {
    this.loop.start();
  }

  hasAnySave(): boolean {
    return SaveManager.slots().some((s) => !s.empty);
  }

  firstSaveSlot(): number {
    const s = SaveManager.slots().findIndex((x) => !x.empty);
    return s < 0 ? 0 : s;
  }

  toggleCrt(): void {
    this.crtOn = this.postfx.toggle();
    try {
      localStorage.setItem('ashen_crown_crt', this.crtOn ? '1' : '0');
    } catch { /* ignore */ }
  }

  toast(text: string): void {
    this.toastMsg = text;
    this.toastUntil = this.time + 2.6;
  }

  setFlag(name: string, v = 1): void {
    this.flags[name] = v;
  }

  persistEntity(id: string, state: Record<string, unknown>): void {
    this.worldState[id] = { ...(this.worldState[id] ?? {}), ...state };
  }

  itemName(id: ItemId): string {
    return ITEM_INFO[id].name;
  }

  loadMap(id: string, spawnTx: number, spawnTy: number): void {
    const map = this.world.get(id);
    this.map = map;
    this.npcs = map.npcs.map((d) => new NPC(d.name, d.charId, d.tree, d.tx, d.ty, d.roam));
    this.destructibles = map.destructibles.map((d) => {
      const e = new Destructible(d.id, d.kind, d.tx, d.ty, d.drops ?? [], d.respawn ?? 0);
      const st = this.worldState[d.id];
      if (st && st['broken']) {
        e.broken = true;
        e.dead = true;
        e.solid = false;
      }
      return e;
    });
    this.chests = map.chests.map((d) => {
      const c = new Chest(d.id, d.tx, d.ty, d.locked, d.contents);
      const st = this.worldState[d.id];
      if (st && st['opened']) c.opened = true;
      if (st && st['locked'] === false) c.locked = false;
      return c;
    });
    this.doors = map.doors.map((d) => {
      const door = new Door(d.id, d.kind, d.tx, d.ty, d.requireFlag ?? null, d.lockedText ?? '', d.questFlag ?? null, d.requireItem ?? null);
      const st = this.worldState[d.id];
      if (st && st['open']) {
        door.open = true;
        door.solid = false;
      }
      return door;
    });
    this.enemies = (map.enemies ?? []).map((d) => createEnemy(d.kind, d.tx, d.ty));
    this.switches = (map.switches ?? []).map((s) => new Switch(s.id, s.doorId, s.tx, s.ty));
    this.blocks = (map.blocks ?? []).map((b) => new Block(b.tx, b.ty));
    this.hazards = [];
    this.braziers = (map.braziers ?? []).map((b) => {
      const br = new Brazier(b.id, b.tx, b.ty, b.roomId ?? null);
      const st = this.worldState[b.id];
      if (st && st['lit']) br.lit = true;
      return br;
    });
    this.lighting.setDarkRects(map.darkRects ?? []);
    this.frozen.clear();
    this.bossSpawned = false;
    this.bossBar = null;
    this.projectiles = [];
    this.pickups = [];
    this.campfire = map.campfire ? new Campfire(map.campfire.tx, map.campfire.ty) : null;
    this.minimap.build(map);
    this.camera.setBounds(map.w * TILE, map.h * TILE);
    this.player.x = spawnTx * TILE + 8;
    this.player.y = spawnTy * TILE + 12;
    this.clampToMap(this.player);
    this.camera.follow(this.player.x, this.player.y, 0, true);
    this.lighting.setAmbient(map.ambient);
    this.discovered.add(id);
    this.audio.playMusic(map.music);
  }

  isSolidAt(px: number, py: number, o: { gaps?: boolean; fly?: boolean; except?: { x: number; y: number; w: number; h: number } | null } = {}): boolean {
    if (!this.map) return true;
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    if (tx < 0 || ty < 0 || tx >= this.map.w || ty >= this.map.h) return true;
    const wch = this.map.layers.walls[ty][tx];
    const gch = this.map.layers.ground[ty][tx];
    if (this.map.solidChars.includes(wch)) return true;
    if (this.map.solidChars.includes(gch)) {
      if (gch === 'X' && o.gaps) return false;
      if (gch === '~' && o.fly) return false;
      if (gch === 'M') {
        const fe = this.frozen.get(tx + ',' + ty);
        if (fe !== undefined && fe > this.time) return false;
      }
      return true;
    }
    for (const e of [...this.npcs, ...this.destructibles, ...this.chests, ...this.doors, ...this.blocks, ...this.braziers]) {
      if (!e.solid || e.dead || e === o.except) continue;
      if (px >= e.x - e.w / 2 && px <= e.x + e.w / 2 && py >= e.y - e.h / 2 && py <= e.y + e.h / 2) return true;
    }
    if (this.campfire && px >= this.campfire.x - 6 && px <= this.campfire.x + 6 && py >= this.campfire.y - 10 && py <= this.campfire.y + 2) return true;
    return false;
  }

  private hitboxCollides(e: { x: number; y: number; w: number; h: number; fly?: boolean }, x: number, y: number, o: { gaps?: boolean; except?: { x: number; y: number; w: number; h: number } | null } = {}): boolean {
    const opts = { ...o, fly: e.fly === true };
    const pts: [number, number][] = [
      [x - e.w / 2, y - e.h / 2],
      [x + e.w / 2, y - e.h / 2],
      [x - e.w / 2, y + e.h / 2],
      [x + e.w / 2, y + e.h / 2],
      [x, y]
    ];
    for (const [px, py] of pts) if (this.isSolidAt(px, py, opts)) return true;
    return false;
  }

  moveEntity(e: { x: number; y: number; w: number; h: number; fly?: boolean }, dx: number, dy: number): void {
    const o = { gaps: e === this.player && this.player.dashT > 0 };
    if (dx !== 0) {
      const nx = e.x + dx;
      if (!this.hitboxCollides(e, nx, e.y, o)) e.x = nx;
      else this.tryPushBlock(e, nx, e.y, dx, 0, o);
    }
    if (dy !== 0) {
      const ny = e.y + dy;
      if (!this.hitboxCollides(e, e.x, ny, o)) e.y = ny;
      else this.tryPushBlock(e, e.x, ny, 0, dy, o);
    }
  }

  private tryPushBlock(e: { x: number; y: number; w: number; h: number }, x: number, y: number, dx: number, dy: number, o: { gaps?: boolean }): void {
    if (e !== this.player) return;
    const box: Rect = { x: x - e.w / 2, y: y - e.h / 2, w: e.w, h: e.h };
    for (const b of this.blocks) {
      if (!rectsOverlap(box, b.hitbox)) continue;
      const nx = b.x + dx;
      const ny = b.y + dy;
      if (nx < 8 || ny < 8 || !this.map || nx > this.map.w * TILE - 8 || ny > this.map.h * TILE - 8) return;
      if (this.hitboxCollides(b, nx, ny, { ...o, except: b })) return;
      b.x = nx;
      b.y = ny;
      e.x = x;
      e.y = y;
      this.audio.sfx('step');
      this.particles.burst(b.x, b.y, '#9a8a78', 3, 25, 1);
      return;
    }
  }

  clampToMap(e: { x: number; y: number }): void {
    if (!this.map) return;
    e.x = clamp(e.x, 6, this.map.w * TILE - 6);
    e.y = clamp(e.y, 6, this.map.h * TILE - 6);
  }

  nearestInteractable(): { obj: Interactable } | null {
    const px = this.player.x;
    const py = this.player.y - 8;
    let best: Interactable | null = null;
    let bestD = 1e9;
    const consider = (o: Interactable) => {
      const d = (o.x - px) * (o.x - px) + (o.y - py) * (o.y - py);
      const rr = o.radius + 6;
      if (d < rr * rr && d < bestD) {
        bestD = d;
        best = o;
      }
    };
    for (const n of this.npcs) consider(n);
    for (const c of this.chests) consider(c);
    for (const d of this.doors) consider(d);
    for (const b of this.braziers) consider(b);
    if (this.campfire) consider(this.campfire);
    if (this.map) {
      for (const s of this.map.signs) {
        consider({
          x: s.tx * TILE + 8,
          y: s.ty * TILE + 12,
          radius: 14,
          prompt: () => 'Read sign',
          interact: (g) => g.showSign(s.lines)
        });
      }
    }
    return best ? { obj: best } : null;
  }

  freezeLavaAround(p: Player): void {
    if (!this.map) return;
    const px = Math.floor(p.x / TILE);
    const py = Math.floor((p.y - 8) / TILE);
    for (let y = py - 2; y <= py + 2; y++) {
      for (let x = px - 2; x <= px + 2; x++) {
        if (x < 0 || y < 0 || x >= this.map.w || y >= this.map.h) continue;
        if (this.map.layers.ground[y][x] === 'M') {
          const key = x + ',' + y;
          this.frozen.set(key, this.time + 7);
          this.particles.burst(x * TILE + 8, y * TILE + 8, '#9fd8ff', 5, 35, 1);
          this.audio.sfx('block');
        }
      }
    }
  }

  showSign(lines: string[]): void {
    this.signLines = lines;
    this.mode = 'sign';
    this.audio.sfx('select');
  }

  startDialogue(tree: string, speaker: string): void {
    const npc = this.npcs.find((n) => n.name === speaker);
    this.dialoguePortrait = npc ? npc.charId : 'player';
    this.mode = 'dialogue';
    this.dialogue.start(tree, speaker, this);
    this.audio.sfx('select');
  }

  openShop(kind: 'smith' | 'alch'): void {
    this.shop = new ShopUI(kind, this);
    this.mode = 'shop';
    this.audio.sfx('select');
  }

  openPause(tab: 'inv' | 'map' | 'quest' | 'sys' = 'inv'): void {
    this.prevMode = this.mode === 'pause' ? this.prevMode : this.mode;
    this.pause.tab = tab;
    this.mode = 'pause';
    this.audio.sfx('select');
  }

  openSaveMenu(from: GameMode = 'play'): void {
    this.prevMode = from;
    this.saveMenu.cursor = this.currentSlot >= 0 ? this.currentSlot : 0;
    this.saveMenu.confirmDelete = -1;
    this.mode = 'save';
  }

  onEnemyKilled(e: Enemy): void {
    if (e.bossId) {
      this.setFlag('boss_' + e.bossId, 1);
      this.bossBar = null;
      const bz = this.map?.bossZone;
      if (bz) {
        for (const id of bz.doorIds) {
          const d = this.doors.find((dd) => dd.id === id);
          if (d) {
            d.bossLocked = false;
            d.open = true;
            d.solid = false;
          }
        }
      }
      this.audio.playMusic(this.map?.music ?? 'hub');
      this.toast('Boss defeated!');
    }
  }

  onPlayerDeath(): void {
    if (this.mode === 'gameover') return;
    this.mode = 'gameover';
    this.audio.playMusic('none');
    this.audio.sfx('roar');
    this.camera.shake(8);
  }

  respawn(): void {
    const p = this.player;
    p.hp = p.maxHp;
    p.mana = p.maxMana;
    p.stamina = p.maxStamina;
    const map = this.map;
    if (map) {
      const cf = map.campfire ?? map.spawn;
      this.loadMap(map.id, cf.tx, cf.ty + 1);
    }
    this.mode = 'play';
    this.toast('You rise again at the campfire.');
  }

  applyLevelUp(i: number): void {
    const p = this.player;
    if (i === 0) {
      p.maxHp += 20;
      p.hp = Math.min(p.maxHp, p.hp + 20);
    } else if (i === 1) {
      p.baseAttack += 2;
    } else {
      p.maxStamina += 15;
      p.stamina = p.maxStamina;
    }
    this.pendingLevelUps--;
    this.audio.sfx('levelup');
    this.particles.burst(p.x, p.y - 16, '#ffd76a', 18, 80, 1.5);
    if (this.pendingLevelUps <= 0) this.mode = 'play';
  }

  toTitle(): void {
    this.mode = 'title';
    this.title.idx = 0;
    this.ended = false;
    this.audio.playMusic('title');
    if (!this.map) this.loadMap('hub', 24, 21);
  }

  startNewGame(slot: number): void {
    this.flags = {};
    this.worldState = {};
    this.discovered = new Set(['hub']);
    this.quests = new QuestSystem();
    this.player = new Player();
    this.combat = new CombatSystem(this);
    this.pendingLevelUps = 0;
    this.bossBar = null;
    this.playtime = 0;
    this.currentSlot = slot;
    this.ended = false;
    this.particles.clear();
    const hub = this.world.get('hub');
    this.loadMap('hub', hub.spawn.tx, hub.spawn.ty);
    this.mode = 'play';
    this.toast('Welcome to Emberhold, hero. Talk to Elder Rowan (NW).');
    this.audio.playMusic('hub');
  }

  serialize(): SaveData {
    const p = this.player;
    const cf = this.map?.campfire;
    return {
      version: 1,
      mapId: this.map?.id ?? 'hub',
      spawn: { x: cf ? cf.tx * TILE + 8 : p.x, y: cf ? cf.ty * TILE + 16 : p.y },
      playtime: this.playtime,
      player: {
        level: p.level,
        xp: p.xp,
        hp: p.hp,
        maxHp: p.maxHp,
        stamina: p.stamina,
        maxStamina: p.maxStamina,
        mana: p.mana,
        maxMana: p.maxMana,
        attack: p.baseAttack,
        defense: p.getDefense(),
        gold: p.gold,
        weapon: p.inv.weapon,
        armor: p.inv.armor,
        relics: [...p.inv.relics],
        activeRelic: p.inv.activeRelic,
        items: { ...p.inv.items }
      },
      quests: this.quests.serialize(),
      flags: { ...this.flags },
      worldState: JSON.parse(JSON.stringify(this.worldState)) as Record<string, unknown>,
      discovered: [...this.discovered]
    };
  }

  saveGame(slot: number): void {
    if (!this.map) return;
    const data = this.serialize();
    SaveManager.save(slot, data, {
      level: this.player.level,
      gold: this.player.gold,
      mapName: this.map.name,
      playtime: this.playtime,
      savedAt: Date.now()
    });
    this.currentSlot = slot;
  }

  loadGame(slot: number): void {
    const raw = SaveManager.load(slot) as SaveData | null;
    if (!raw || raw.version !== 1) return;
    this.currentSlot = slot;
    this.flags = { ...raw.flags };
    this.worldState = raw.worldState as Record<string, Record<string, unknown>>;
    this.discovered = new Set(raw.discovered);
    this.playtime = raw.playtime;
    this.quests = new QuestSystem();
    this.quests.deserialize(raw.quests);
    this.player = new Player();
    this.combat = new CombatSystem(this);
    const p = this.player;
    p.level = raw.player.level;
    p.xp = raw.player.xp;
    p.maxHp = raw.player.maxHp;
    p.hp = raw.player.hp;
    p.maxStamina = raw.player.maxStamina;
    p.stamina = raw.player.stamina;
    p.maxMana = raw.player.maxMana;
    p.mana = raw.player.mana;
    p.baseAttack = raw.player.attack;
    p.gold = raw.player.gold;
    p.inv.deserialize({
      weapon: raw.player.weapon,
      armor: raw.player.armor,
      relics: raw.player.relics,
      activeRelic: raw.player.activeRelic,
      items: raw.player.items
    });
    this.pendingLevelUps = 0;
    this.bossBar = null;
    this.ended = !!this.flags['ending'];
    this.loadMap(raw.mapId, Math.floor(raw.spawn.x / TILE), Math.floor(raw.spawn.y / TILE));
    p.x = raw.spawn.x;
    p.y = raw.spawn.y;
    this.clampToMap(p);
    this.camera.follow(p.x, p.y, 0, true);
    this.mode = 'play';
    this.toast('Journey restored. Slot ' + (slot + 1) + '.');
  }

  giveRelic(id: RelicId): void {
    if (!this.player.inv.relics.includes(id)) {
      this.player.inv.relics.push(id);
      this.player.inv.activeRelic = this.player.inv.relics.length - 1;
    }
  }

  private updateSlots(): void {
    const input = this.input;
    const slots = SaveManager.slots();
    if (input.hit('ArrowUp') || input.hit('KeyW')) {
      this.slotCursor = (this.slotCursor - 1 + 3) % 3;
      this.confirmSlot = -1;
      this.delConfirm = -1;
      this.audio.sfx('cursor');
    }
    if (input.hit('ArrowDown') || input.hit('KeyS')) {
      this.slotCursor = (this.slotCursor + 1) % 3;
      this.confirmSlot = -1;
      this.delConfirm = -1;
      this.audio.sfx('cursor');
    }
    if (input.hit('KeyX') && !slots[this.slotCursor].empty) {
      if (this.delConfirm === this.slotCursor) {
        SaveManager.remove(this.slotCursor);
        this.delConfirm = -1;
        this.audio.sfx('smash');
      } else {
        this.delConfirm = this.slotCursor;
        this.audio.sfx('cursor');
      }
    }
    if (input.hit('Enter') || input.hit('KeyF') || input.hit('KeyJ') || input.mouse.pressed) {
      const s = slots[this.slotCursor];
      if (this.slotMode === 'new') {
        if (!s.empty && this.confirmSlot !== this.slotCursor) {
          this.confirmSlot = this.slotCursor;
          this.audio.sfx('cursor');
          return;
        }
        this.audio.sfx('select');
        this.startNewGame(this.slotCursor);
      } else {
        if (s.empty) {
          this.audio.sfx('error');
          return;
        }
        this.audio.sfx('select');
        this.loadGame(this.slotCursor);
      }
    }
    if (input.hit('Escape')) {
      this.mode = 'title';
      this.audio.sfx('cursor');
    }
  }

  private playUpdate(dt: number): void {
    this.playtime += dt;
    const map = this.map;
    if (!map) return;
    for (const d of this.doors) {
      if (d.kind === 'gate' && d.requireFlag && this.flags[d.requireFlag] && !d.open) {
        d.open = true;
        d.solid = false;
        this.persistEntity(d.id, { open: true });
        if (d.questFlag) this.setFlag(d.questFlag, 1);
        this.toast('The ward shatters!');
        this.audio.sfx('gate');
      }
    }
    const doorGroups = new Map<string, Switch[]>();
    for (const s of this.switches) {
      s.update(dt, this);
      const list = doorGroups.get(s.doorId) ?? [];
      list.push(s);
      doorGroups.set(s.doorId, list);
    }
    for (const [doorId, list] of doorGroups) {
      const door = this.doors.find((d) => d.id === doorId);
      if (!door || door.kind !== 'puzzle') continue;
      const open = list.every((s) => s.active);
      if (open !== door.open) {
        door.open = open;
        door.solid = !open;
        if (open) {
          this.toast('The roots retract with a groan!');
          this.audio.sfx('gate');
          this.particles.burst(door.x, door.y, '#4aa04a', 12, 60, 1.5);
        }
      }
    }
    for (const br of this.braziers) {
      br.update(dt, this);
    }
    if (map.brazierDoors) {
      for (const bd of map.brazierDoors) {
        const door = this.doors.find((d) => d.id === bd.doorId);
        if (!door || door.kind !== 'brazier') continue;
        const open = this.braziers.filter((b) => b.roomId === bd.roomId).every((b) => b.lit);
        if (open !== door.open) {
          door.open = open;
          door.solid = !open;
          if (open) {
            this.toast('The water recedes from the seal!');
            this.audio.sfx('gate');
            this.particles.burst(door.x, door.y, '#5ab0e0', 14, 70, 1.5);
          }
        }
      }
    }
    const bz = map.bossZone;
    if (bz && !this.bossSpawned && rectsOverlap(this.player.hitbox, { x: bz.x, y: bz.y, w: bz.w, h: bz.h })) {
      this.bossSpawned = true;
      const bossTx = Math.floor((bz.x + bz.w / 2) / TILE);
      const bossTy = Math.floor((bz.y + bz.h / 2) / TILE);
      const boss = bz.kind === 'drownedWarden' ? new DrownedWarden(bossTx, bossTy) : bz.kind === 'ignis' ? new Ignis(bossTx, bossTy) : bz.kind === 'hollowKing' ? new HollowKing(bossTx, bossTy) : new Brambleheart(bossTx, bossTy);
      boss.setArena({ x: bz.x, y: bz.y, w: bz.w, h: bz.h });
      this.enemies.push(boss);
      this.bossBar = { name: bz.name, hp: boss.hp, max: boss.maxHp };
      for (const id of bz.doorIds) {
        const d = this.doors.find((dd) => dd.id === id);
        if (d) {
          d.bossLocked = true;
          d.open = false;
          d.solid = true;
        }
      }
      this.audio.playMusic('boss');
      this.audio.sfx('roar');
      this.camera.shake(8);
      this.toast(bz.name + ' awakens!');
    }
    const boss = this.enemies.find((e) => e.bossId && !e.dead);
    if (boss && this.bossBar) this.bossBar.hp = boss.hp;
    for (const [fk, exp] of this.frozen) {
      if (exp <= this.time) this.frozen.delete(fk);
    }
    if (map.embers && Math.random() < dt * 10) {
      this.particles.spawn({
        x: this.player.x + (Math.random() - 0.5) * 340,
        y: this.player.y + (Math.random() - 0.5) * 200 + 40,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 26 - 8,
        life: 2 + Math.random() * 2.5,
        maxLife: 4.5,
        size: 1,
        color: Math.random() < 0.5 ? '#ff8a2e' : '#ffd76a',
        gravity: -6,
        shrink: false
      });
    }
    if (map.mist && Math.random() < dt * 7) {
      this.particles.spawn({
        x: this.player.x + (Math.random() - 0.5) * 360,
        y: this.player.y + (Math.random() - 0.5) * 220,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 5,
        life: 3 + Math.random() * 3,
        maxLife: 6,
        size: 2,
        color: '#8a94b0',
        gravity: 0,
        shrink: false
      });
    }
    if (map.fireflies && Math.random() < dt * 5) {
      this.particles.spawn({
        x: this.player.x + (Math.random() - 0.5) * 300,
        y: this.player.y + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 12,
        vy: -6 - Math.random() * 8,
        life: 2 + Math.random() * 2,
        maxLife: 4,
        size: 1,
        color: Math.random() < 0.5 ? '#c8ff5a' : '#8ae06a',
        gravity: 0,
        shrink: false
      });
    }
    this.player.update(dt, this);
    for (const n of this.npcs) n.update(dt, this);
    for (const d of this.destructibles) d.update(dt, this);
    for (const c of this.chests) c.update(dt, this);
    for (const d of this.doors) d.update(dt, this);
    for (const e of this.enemies) e.update(dt, this);
    for (const b of this.blocks) b.update(dt, this);
    for (const h of this.hazards) h.update(dt, this);
    this.hazards = this.hazards.filter((h) => !h.dead);
    for (const pr of this.projectiles) pr.update(dt, this);
    for (const pk of this.pickups) pk.update(dt, this);
    this.projectiles = this.projectiles.filter((p) => !p.dead);
    this.pickups = this.pickups.filter((p) => !p.dead);
    this.combat.tickStatusDots(dt);
    this.quests.update(this);
    this.exitToastCd = Math.max(0, this.exitToastCd - dt);
    for (const ex of map.exits) {
      const r: Rect = { x: ex.x, y: ex.y, w: ex.w, h: ex.h };
      if (rectsOverlap(this.player.hitbox, r)) {
        if (ex.requireFlag && !this.flags[ex.requireFlag]) {
          if (this.exitToastCd <= 0) {
            this.exitToastCd = 2;
            this.toast(ex.lockedText ?? 'Sealed.');
            this.audio.sfx('gate');
          }
        } else if (this.world.has(ex.to)) {
          this.loadMap(ex.to, ex.spawnTx, ex.spawnTy);
          this.toast(this.map?.name ?? '');
          return;
        } else {
          if (this.exitToastCd <= 0) {
            this.exitToastCd = 2;
            this.toast(ex.lockedText ?? 'Sealed.');
            this.audio.sfx('gate');
          }
        }
      }
    }
    if (this.input.interactPressed()) {
      const it = this.nearestInteractable();
      if (it) it.obj.interact(this);
    }
    if (this.input.hit('Escape') || this.input.hit('Tab') || this.input.hit('KeyP')) this.openPause('inv');
    if (this.input.hit('KeyM')) this.audio.setMuted(!this.audio.muted);
    if (this.input.hit('F3')) this.toggleCrt();
    if (this.pendingLevelUps > 0) {
      this.mode = 'levelup';
      this.audio.sfx('levelup');
    }
    if (this.flags['ending'] && !this.ended) {
      this.ended = true;
      this.mode = 'ending';
      this.ending.t = 0;
      this.audio.playMusic('ending');
    }
    this.camera.follow(this.player.x, this.player.y, dt);
  }

  update(dt: number): void {
    this.time += dt;
    switch (this.mode) {
      case 'title': {
        if (Math.random() < dt * 14) {
          this.particles.spawn({
            x: Math.random() * VIEW_W,
            y: VIEW_H + 2,
            vx: Math.random() * 10 - 5,
            vy: -Math.random() * 22 - 8,
            life: 3 + Math.random() * 3,
            maxLife: 6,
            size: 1,
            color: Math.random() < 0.5 ? '#ff9a2e' : '#e0b34c',
            gravity: -4,
            shrink: false
          });
        }
        this.particles.update(dt);
        if (this.map) {
          const panX = (this.map.w * TILE - VIEW_W) / 2 + Math.sin(this.time * 0.13) * 60;
          const panY = (this.map.h * TILE - VIEW_H) / 2 + Math.cos(this.time * 0.09) * 30;
          this.camera.x = clamp(panX, 0, Math.max(0, this.map.w * TILE - VIEW_W));
          this.camera.y = clamp(panY, 0, Math.max(0, this.map.h * TILE - VIEW_H));
        }
        this.title.update(this);
        this.renderer.update(dt);
        this.lighting.update(dt);
        break;
      }
      case 'slots':
        this.particles.update(dt);
        this.updateSlots();
        this.renderer.update(dt);
        break;
      case 'play':
        this.playUpdate(dt);
        this.particles.update(dt);
        this.camera.update(dt);
        this.renderer.update(dt);
        this.lighting.update(dt);
        break;
      case 'dialogue':
        this.dialogue.update(dt, this);
        this.particles.update(dt);
        this.camera.update(dt);
        this.lighting.update(dt);
        break;
      case 'shop':
        this.shop?.update(this);
        break;
      case 'pause':
        this.pause.update(this);
        break;
      case 'save':
        this.saveMenu.update(this);
        break;
      case 'levelup':
        this.levelUp.update(this);
        break;
      case 'gameover':
        this.gameOver.update(this);
        this.camera.update(dt);
        break;
      case 'ending':
        this.ending.update(this, dt);
        break;
      case 'sign':
        if (this.input.hit('KeyF') || this.input.hit('Enter') || this.input.hit('KeyJ') || this.input.mouse.pressed || this.input.hit('Escape')) {
          this.mode = 'play';
        }
        break;
    }
  }

  private renderWorld(drawEntities: boolean): void {
    const ctx = this.ctx;
    const map = this.map;
    if (!map) return;
    const camX = Math.round(this.camera.viewX);
    const camY = Math.round(this.camera.viewY);
    this.renderer.render(ctx, this.sprites, map, camX, camY, () => {
      if (!drawEntities) return;
      ctx.save();
      ctx.translate(-camX, -camY);
      const all = [
        ...this.npcs,
        ...this.destructibles,
        ...this.chests,
        ...this.doors,
        ...this.switches,
        ...this.blocks,
        ...this.braziers,
        ...this.hazards,
        ...this.enemies.filter((e) => !e.dead),
        this.player,
        ...this.projectiles,
        ...this.pickups
      ];
      all.sort((a, b) => a.y - b.y);
      for (const e of all) e.render(ctx, this);
      ctx.restore();
    }, new Set(this.frozen.keys()));
    this.lighting.clearLights();
    for (const l of map.lights) {
      this.lighting.addLight({ x: l.tx * TILE + 8, y: l.ty * TILE + 8, r: l.r, color: l.color, flicker: l.flicker, intensity: l.intensity });
    }
    const p = this.player;
    const lantern = p.inv.hasRelic('emberLantern');
    this.lighting.addLight({ x: p.x, y: p.y - 8, r: lantern ? 60 : 46, color: lantern ? '#ffb050' : '#ffe0b0', flicker: 0.08 });
    if (lantern) {
      const dv = DIR_VEC[p.anim.dir];
      this.lighting.addLight({ x: p.x + dv.x * 24, y: p.y - 8 + dv.y * 24, r: 78, color: '#ff9a2e', flicker: 0.15, coneDir: p.anim.dir, coneSpread: 1.15 });
    }
    if (this.campfire) {
      this.lighting.addLight({ x: this.campfire.x, y: this.campfire.y - 6, r: 66, color: '#ff9a2e', flicker: 0.35 });
    }
    for (const br of this.braziers) {
      if (br.lit) this.lighting.addLight({ x: br.x, y: br.y - 8, r: 42, color: '#ff9a2e', flicker: 0.3 });
    }
    for (const e of this.enemies) {
      if (e.emitsLight && !e.dead) this.lighting.addLight({ x: e.x, y: e.y - 6, r: 46, color: '#8ae0ff', flicker: 0.45, intensity: 0.9 });
    }
    this.lighting.render(ctx, camX, camY);
    this.particles.render(ctx, camX, camY, drawText);
  }

  private renderSlots(): void {
    const ctx = this.ctx;
    const slots = SaveManager.slots();
    const x = 60;
    const y = 46;
    const w = VIEW_W - 120;
    const h = 92;
    ctx.fillStyle = 'rgba(10,12,28,0.96)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#e0b34c';
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    drawText(ctx, this.slotMode === 'new' ? 'NEW GAME - CHOOSE SLOT' : 'CONTINUE - CHOOSE SLOT', x + w / 2, y + 8, 1, '#ffd76a', 'center');
    slots.forEach((s, i) => {
      const sel = i === this.slotCursor;
      const ry = y + 24 + i * 20;
      if (sel) {
        ctx.fillStyle = 'rgba(224,179,76,0.15)';
        ctx.fillRect(x + 8, ry - 3, w - 16, 17);
      }
      if (s.empty) {
        drawText(ctx, (sel ? '> ' : '  ') + 'SLOT ' + (i + 1) + ' - EMPTY', x + 14, ry, 1, sel ? '#ffd76a' : '#7a8098');
      } else {
        const mins = Math.floor(s.playtime / 60);
        drawText(ctx, (sel ? '> ' : '  ') + 'SLOT ' + (i + 1) + '  LV' + s.level + '  ' + s.gold + 'G  ' + s.mapName + '  ' + mins + 'm', x + 14, ry, 1, sel ? '#ffd76a' : '#e8ecf5');
      }
      if (this.confirmSlot === i) drawText(ctx, 'OVERWRITE? ENTER AGAIN', x + w - 14 - 21 * 4, ry, 1, '#e04a5a');
      if (this.delConfirm === i) drawText(ctx, 'DELETE? X AGAIN', x + w - 14 - 15 * 4, ry, 1, '#e04a5a');
    });
    drawText(ctx, 'ENTER: SELECT   X: DELETE   ESC: BACK', x + w / 2, y + h + 6, 1, '#6a7090', 'center');
  }

  private renderSign(): void {
    const ctx = this.ctx;
    const x = 40;
    const by = VIEW_H - 40;
    const w = VIEW_W - 80;
    ctx.fillStyle = 'rgba(10,12,28,0.95)';
    ctx.fillRect(x, by, w, 32);
    ctx.strokeStyle = '#9a6b3f';
    ctx.strokeRect(x + 0.5, by + 0.5, w - 1, 31);
    this.signLines.forEach((ln, i) => drawTextShadow(ctx, ln, x + 8, by + 6 + i * 8, 1, '#e8d9a8'));
    drawText(ctx, '[F] CLOSE', x + w - 52, by + 24, 1, '#6a7090');
  }

  render(): void {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    if (this.mode === 'title' || this.mode === 'slots') {
      this.renderWorld(false);
      ctx.fillStyle = 'rgba(4,5,14,0.35)';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      this.particles.render(ctx, 0, 0, drawText);
      this.title.render(ctx, this);
      if (this.mode === 'slots') this.renderSlots();
    } else if (this.map) {
      const inGame = this.mode === 'play' || this.mode === 'dialogue' || this.mode === 'shop' || this.mode === 'pause' || this.mode === 'levelup' || this.mode === 'save' || this.mode === 'sign';
      this.renderWorld(inGame);
      if (inGame) this.hud.render(ctx, this);
      if (this.mode === 'dialogue') this.dialogue.render(ctx, this);
      if (this.mode === 'shop' && this.shop) this.shop.render(ctx, this);
      if (this.mode === 'pause') {
        this.pause.render(ctx, this);
      }
      if (this.mode === 'save') this.saveMenu.render(ctx, this);
      if (this.mode === 'levelup') this.levelUp.render(ctx, this);
      if (this.mode === 'sign') this.renderSign();
      if (this.mode === 'gameover') this.gameOver.render(ctx, this);
      if (this.mode === 'ending') this.ending.render(ctx, this);
    }
    this.postfx.render(ctx);
  }
}
