import { ArmorId, WeaponId, ItemId, RelicId, RELIC_INFO } from '../types';

export interface WeaponInfo {
  id: string;
  name: string;
  dmg: number;
  cost: number;
  shards: number;
  icon: string;
}

export const WEAPONS: WeaponInfo[] = [
  { id: 'rusty', name: 'Rusty Sword', dmg: 4, cost: 0, shards: 0, icon: 'sword_rusty' },
  { id: 'iron', name: 'Iron Sword', dmg: 8, cost: 120, shards: 1, icon: 'sword_iron' },
  { id: 'steel', name: 'Steel Sword', dmg: 13, cost: 300, shards: 2, icon: 'sword_steel' },
  { id: 'ember', name: 'Emberbrand', dmg: 19, cost: 650, shards: 4, icon: 'sword_ember' },
  { id: 'crownblade', name: 'Crownblade', dmg: 28, cost: 1400, shards: 8, icon: 'sword_crownblade' }
];

export interface ArmorInfo {
  id: string;
  name: string;
  def: number;
  cost: number;
  icon: string;
}

export const ARMORS: ArmorInfo[] = [
  { id: 'cloth', name: 'Traveler Garb', def: 0, cost: 0, icon: 'armor_cloth' },
  { id: 'leather', name: 'Leather Jerkin', def: 2, cost: 100, icon: 'armor_leather' },
  { id: 'ironmail', name: 'Iron Mail', def: 4, cost: 350, icon: 'armor_ironmail' },
  { id: 'embermail', name: 'Ember Mail', def: 7, cost: 800, icon: 'armor_embermail' },
  { id: 'crownplate', name: 'Crown Plate', def: 11, cost: 1800, icon: 'armor_crownplate' }
];

export const ITEM_INFO: Record<ItemId, { name: string; desc: string; icon: string; price: number }> = {
  potion: { name: 'Potion', desc: 'Restores 40% HP. Hotkey: 4', icon: 'potion', price: 30 },
  ether: { name: 'Ether', desc: 'Restores 20 MP', icon: 'ether', price: 25 },
  moonherb: { name: 'Moonherb', desc: 'A pale glowing herb', icon: 'moonherb', price: 0 },
  rustyKey: { name: 'Rusty Key', desc: 'Opens a locked chest', icon: 'rustyKey', price: 0 },
  dungeonKey: { name: 'Sanctum Key', desc: 'Opens sanctum doors', icon: 'dungeonKey', price: 0 },
  mapPage: { name: 'Map Page', desc: 'A torn page from a map', icon: 'mapPage', price: 0 },
  bossShard: { name: 'Boss Shard', desc: 'Forged at the blacksmith', icon: 'bossShard', price: 0 }
};

export class Inventory {
  items: Record<string, number> = {};
  weapon: WeaponId = 'rusty';
  armor: ArmorId = 'cloth';
  relics: RelicId[] = [];
  activeRelic = 0;

  add(item: ItemId, n = 1): void {
    this.items[item] = (this.items[item] ?? 0) + n;
  }

  remove(item: ItemId, n = 1): boolean {
    const c = this.items[item] ?? 0;
    if (c < n) return false;
    this.items[item] = c - n;
    if (this.items[item] <= 0) delete this.items[item];
    return true;
  }

  count(item: ItemId): number {
    return this.items[item] ?? 0;
  }

  weaponInfo(): WeaponInfo {
    return WEAPONS.find((w) => w.id === this.weapon) ?? WEAPONS[0];
  }

  armorInfo(): ArmorInfo {
    return ARMORS.find((a) => a.id === this.armor) ?? ARMORS[0];
  }

  hasRelic(id: RelicId): boolean {
    return this.relics.includes(id);
  }

  currentRelic(): RelicId | null {
    return this.relics[this.activeRelic] ?? null;
  }

  relicName(id: RelicId): string {
    return RELIC_INFO[id].name;
  }

  serialize(): { weapon: string; armor: string; relics: string[]; activeRelic: number; items: Record<string, number> } {
    return { weapon: this.weapon, armor: this.armor, relics: [...this.relics], activeRelic: this.activeRelic, items: { ...this.items } };
  }

  deserialize(d: { weapon: string; armor: string; relics: string[]; activeRelic: number; items: Record<string, number> }): void {
    this.weapon = d.weapon as WeaponId;
    this.armor = d.armor as ArmorId;
    this.relics = d.relics as RelicId[];
    this.activeRelic = d.activeRelic;
    this.items = { ...d.items };
  }
}
