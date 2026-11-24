import type { Game } from '../game/Game';

export interface QuestDef {
  id: string;
  name: string;
  giver: string;
  desc: string;
  stages: { objective: string; done: (g: Game) => boolean }[];
  rewardText: string;
  reward: (g: Game) => void;
}

export const QUESTS: Record<string, QuestDef> = {
  main: {
    id: 'main',
    name: 'The Ashen Crown',
    giver: 'Elder Rowan',
    desc: 'Recover the Ashen Crown from the Hollow King in the Ashen Spire.',
    stages: [
      { objective: 'Speak with Elder Rowan at his hut (NW).', done: (g) => !!g.flags['metElder'] },
      { objective: 'Visit Lorekeeper Vesper in her tower (SW).', done: (g) => !!g.flags['metLore'] },
      { objective: 'Complete "Vesper\'s Tonic" for the Lorekeeper.', done: (g) => g.quests.isDone('tonic') },
      { objective: 'Return to Elder Rowan.', done: (g) => !!g.flags['elderAfterTonic'] },
      { objective: 'Unseal the northern gate to the Whispering Woods.', done: (g) => !!g.flags['gate_woods'] },
      { objective: 'Defeat Brambleheart in the Rooted Sanctum.', done: (g) => !!g.flags['boss_brambleheart'] },
      { objective: 'Claim the Wind Boots relic.', done: (g) => g.player.inv.hasRelic('windBoots') },
      { objective: 'Unseal the eastern gate to the Sunken Marshes.', done: (g) => !!g.flags['gate_marshes'] },
      { objective: 'Defeat the Drowned Warden in the Flooded Crypt.', done: (g) => !!g.flags['boss_warden'] },
      { objective: 'Claim the Ember Lantern relic.', done: (g) => g.player.inv.hasRelic('emberLantern') },
      { objective: 'Unseal the western gate to the Scorched Wastes.', done: (g) => !!g.flags['gate_wastes'] },
      { objective: 'Defeat Ignis the Forgemaster in the Obsidian Foundry.', done: (g) => !!g.flags['boss_ignis'] },
      { objective: 'Claim the Frost Aegis relic.', done: (g) => g.player.inv.hasRelic('frostAegis') },
      { objective: 'Unseal the southern gate to the Ashen Spire.', done: (g) => !!g.flags['gate_spire'] },
      { objective: 'Defeat the Hollow King and claim the Ashen Crown.', done: (g) => !!g.flags['boss_hollowKing'] }
    ],
    rewardText: 'The crown is yours.',
    reward: (g) => {
      g.setFlag('ending', 1);
    }
  },
  herbs: {
    id: 'herbs',
    name: 'Moonherb Tonic',
    giver: 'Mira the Alchemist',
    desc: 'Mira needs 3 Moonherbs from the glowing bushes in her garden to brew a tonic.',
    stages: [
      { objective: 'Gather 3 Moonherbs from glowing bushes (SE garden).', done: (g) => g.player.inv.count('moonherb') >= 3 }
    ],
    rewardText: '+2 Potions, +60 Gold, +30 XP',
    reward: (g) => {
      g.player.inv.remove('moonherb', 3);
      g.player.inv.add('potion', 2);
      g.player.gold += 60;
      g.player.gainXp(30, g);
    }
  },
  sparring: {
    id: 'sparring',
    name: 'Sparring Partner',
    giver: 'Bram the Smith',
    desc: 'Bram wants you to test your blade on the training dummy east of the plaza 3 times.',
    stages: [
      { objective: 'Strike the training dummy 3 times (E of plaza).', done: (g) => (g.flags['dummyBreaks'] ?? 0) >= 3 }
    ],
    rewardText: '+1 Boss Shard, +40 Gold, +20 XP',
    reward: (g) => {
      g.player.inv.add('bossShard', 1);
      g.player.gold += 40;
      g.player.gainXp(20, g);
    }
  },
  lostMap: {
    id: 'lostMap',
    name: 'The Lost Map',
    giver: 'Ilya the Cartographer',
    desc: 'Ilya tore a page out of his world map. Rumor says it ended up inside a pot somewhere in the village...',
    stages: [
      { objective: 'Find the map page (search the pots!).', done: (g) => g.player.inv.count('mapPage') >= 1 }
    ],
    rewardText: '+80 Gold, +30 XP, Emberhold fully mapped',
    reward: (g) => {
      g.player.inv.remove('mapPage', 1);
      g.player.gold += 80;
      g.player.gainXp(30, g);
      g.setFlag('mapEmberhold', 1);
      g.discovered.add('hub');
    }
  },
  tonic: {
    id: 'tonic',
    name: "Vesper's Tonic",
    giver: 'Lorekeeper Vesper',
    desc: 'Vesper is too frail to leave her tower. Bring her 1 Potion.',
    stages: [
      { objective: 'Bring 1 Potion to Vesper (buy from Mira, or find one).', done: (g) => g.player.inv.count('potion') >= 1 }
    ],
    rewardText: '+50 Gold, +40 XP, and her knowledge',
    reward: (g) => {
      g.player.inv.remove('potion', 1);
      g.player.gold += 50;
      g.player.gainXp(40, g);
      g.setFlag('tonicDone', 1);
    }
  }
};

export class QuestSystem {
  active: string[] = [];
  progress: Record<string, number> = {};
  done: string[] = [];

  start(id: string, game: Game): void {
    if (this.active.includes(id) || this.done.includes(id)) return;
    this.active.push(id);
    this.progress[id] = 0;
    game.toast('Quest accepted: ' + QUESTS[id].name);
    game.audio.sfx('quest');
  }

  isActive(id: string): boolean {
    return this.active.includes(id);
  }

  isDone(id: string): boolean {
    return this.done.includes(id);
  }

  stage(id: string): number {
    return this.progress[id] ?? 0;
  }

  currentObjective(id: string): string {
    const def = QUESTS[id];
    const s = this.progress[id] ?? 0;
    return def.stages[Math.min(s, def.stages.length - 1)].objective;
  }

  update(game: Game): void {
    for (const id of [...this.active]) {
      const def = QUESTS[id];
      let stage = this.progress[id] ?? 0;
      while (stage < def.stages.length && def.stages[stage].done(game)) {
        stage++;
        if (stage < def.stages.length) {
          game.toast(QUESTS[id].name + ' - new objective');
          game.audio.sfx('quest');
        }
      }
      this.progress[id] = stage;
      if (stage >= def.stages.length) {
        this.active = this.active.filter((q) => q !== id);
        this.done.push(id);
        delete this.progress[id];
        def.reward(game);
        game.toast('Quest complete: ' + def.name + '  (' + def.rewardText + ')');
        game.audio.sfx('quest');
        game.particles.burst(game.player.x, game.player.y - 20, '#ffd76a', 20, 90, 1.5);
      }
    }
  }

  serialize(): { active: string[]; progress: Record<string, number>; done: string[] } {
    return { active: [...this.active], progress: { ...this.progress }, done: [...this.done] };
  }

  deserialize(d: { active: string[]; progress: Record<string, number>; done: string[] }): void {
    this.active = [...d.active];
    this.progress = { ...d.progress };
    this.done = [...d.done];
  }
}
