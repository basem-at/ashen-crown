export interface SaveSlotInfo {
  slot: number;
  empty: boolean;
  level: number;
  gold: number;
  mapName: string;
  playtime: number;
  savedAt: number;
}

const KEY = 'ashen_crown_save_';
const META = 'ashen_crown_slots';

export class SaveManager {
  static slots(): SaveSlotInfo[] {
    let meta: SaveSlotInfo[] = [];
    try {
      const raw = localStorage.getItem(META);
      if (raw) meta = JSON.parse(raw) as SaveSlotInfo[];
    } catch {
      meta = [];
    }
    const out: SaveSlotInfo[] = [];
    for (let i = 0; i < 3; i++) {
      const found = meta.find((m) => m.slot === i);
      if (found && localStorage.getItem(KEY + i)) {
        out.push(found);
      } else {
        out.push({ slot: i, empty: true, level: 0, gold: 0, mapName: '', playtime: 0, savedAt: 0 });
      }
    }
    return out;
  }

  static save(slot: number, data: unknown, info: Omit<SaveSlotInfo, 'slot' | 'empty'>): void {
    localStorage.setItem(KEY + slot, JSON.stringify(data));
    const meta = SaveManager.slots();
    const idx = meta.findIndex((m) => m.slot === slot);
    const entry: SaveSlotInfo = { slot, empty: false, ...info };
    if (idx >= 0) meta[idx] = entry;
    else meta.push(entry);
    localStorage.setItem(META, JSON.stringify(meta));
  }

  static load(slot: number): unknown | null {
    const raw = localStorage.getItem(KEY + slot);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static remove(slot: number): void {
    localStorage.removeItem(KEY + slot);
    const meta = SaveManager.slots().filter((m) => m.slot !== slot);
    localStorage.setItem(META, JSON.stringify(meta));
  }

  static has(slot: number): boolean {
    return localStorage.getItem(KEY + slot) !== null;
  }
}

export interface SaveData {
  version: 1;
  mapId: string;
  spawn: { x: number; y: number };
  playtime: number;
  player: {
    level: number;
    xp: number;
    hp: number;
    maxHp: number;
    stamina: number;
    maxStamina: number;
    mana: number;
    maxMana: number;
    attack: number;
    defense: number;
    gold: number;
    weapon: string;
    armor: string;
    relics: string[];
    activeRelic: number;
    items: Record<string, number>;
  };
  quests: { active: string[]; progress: Record<string, number>; done: string[] };
  flags: Record<string, number>;
  worldState: Record<string, unknown>;
  discovered: string[];
}
