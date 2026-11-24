import { GameMap } from './MapData';
import { hubVillage } from './HubVillage';
import { woods } from './Woods';
import { sanctum } from './Sanctum';
import { marshes } from './Marshes';
import { crypt } from './Crypt';
import { wastes } from './Wastes';
import { foundry } from './Foundry';
import { spire } from './Spire';

export class World {
  private maps = new Map<string, GameMap>();

  constructor() {
    this.register(hubVillage());
    this.register(woods());
    this.register(sanctum());
    this.register(marshes());
    this.register(crypt());
    this.register(wastes());
    this.register(foundry());
    this.register(spire());
  }

  register(m: GameMap): void {
    this.maps.set(m.id, m);
  }

  get(id: string): GameMap {
    const m = this.maps.get(id);
    if (!m) throw new Error('Unknown map: ' + id);
    return m;
  }

  has(id: string): boolean {
    return this.maps.has(id);
  }

  all(): GameMap[] {
    return [...this.maps.values()];
  }
}
