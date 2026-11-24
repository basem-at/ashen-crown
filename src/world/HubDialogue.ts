import { DialogueTree } from '../systems/DialogueSystem';
import type { Game } from '../game/Game';

export const HUB_TREES: Record<string, DialogueTree> = {
  elder: {
    start: 'greet',
    nodes: {
      greet: {
        goto: (g) => {
          if (g.quests.isDone('main')) return 'done';
          const s = g.quests.stage('main');
          if (s < 4) return 'intro';
          if (g.flags['boss_brambleheart'] && !g.flags['boss_warden']) return 'marshes';
          if (g.flags['boss_warden'] && !g.flags['boss_ignis']) return 'wastes';
          if (g.flags['boss_ignis'] && !g.flags['boss_hollowKing']) return 'spire';
          return 'sealed';
        },
        text: 'Ah, a new face in Emberhold...'
      },
      marshes: {
        text: [
          'Brambleheart is felled! The eastern ward is broken - the Sunken Marshes are open to you.',
          'The Drowned Warden guards the Ember Lantern in the Flooded Crypt. Its light will cut through the crypt\'s black rooms and burn its webs.'
        ],
        choices: [
          { text: 'To the marshes, then.', next: 'end' },
          { text: 'Any advice?', next: 'advice' }
        ]
      },
      wastes: {
        text: [
          'The Drowned Warden has fallen! The western ward to the Scorched Wastes is now open.',
          'Ignis the Forgemaster awaits in the Obsidian Foundry, guarding the Frost Aegis. Watch for his molten floor.'
        ],
        choices: [
          { text: 'I\'ll go west then.', next: 'end' },
          { text: 'Any advice?', next: 'advice' }
        ]
      },
      spire: {
        text: [
          'Ignis is ash! The southern gate to the Ashen Spire stands open - the last ward is broken.',
          'The Hollow King waits on his throne with the Ashen Crown. All three relics will be tested there: the boots, the lantern, the aegis.',
          'Go, hero. Take back what was stolen. Emberhold believes in you.'
        ],
        choices: [
          { text: 'For the Crown!', next: 'end' },
          { text: 'Any final advice?', next: 'advice' }
        ]
      },
      advice: {
        text: 'Stock up on potions with Mira, keep your blade sharp at Bram\'s, and never walk into the dark unprepared.',
        next: 'sealed'
      },
      intro: {
        action: (g) => {
          g.setFlag('metElder', 1);
          if (!g.quests.isActive('main') && !g.quests.isDone('main')) g.quests.start('main', g);
        },
        text: [
          'Welcome to Emberhold, traveler. I am Rowan, the Elder.',
          'Long ago the Hollow King stole the Ashen Crown and sealed the four paths out of this valley with his wards.',
          'The Lorekeeper in the old tower to the southwest knows the old rites. Speak with her, and come back to me.'
        ],
        choices: [
          { text: 'Who are you?', next: 'who' },
          { text: 'Tell me of the Hollow King.', next: 'king' },
          { text: 'I will help. Farewell.', next: 'end' }
        ]
      },
      who: {
        text: 'I have kept this village\'s hearth lit for sixty years. Now my bones are old, but my memory is sharp.',
        next: 'intro'
      },
      king: {
        text: 'The Hollow King was once a king of men. The crown hollowed him out. Now he waits in the Ashen Spire, south of here.',
        next: 'intro'
      },
      sealed: {
        action: (g) => {
          if (g.quests.stage('main') === 4 && !g.flags['elderAfterTonic']) g.setFlag('elderAfterTonic', 1);
        },
        text: [
          'You have Vesper\'s knowledge now. The four wards can only be broken by the three relics hidden in the old dungeons:',
          'The Wind Boots in the Rooted Sanctum (north woods), the Ember Lantern in the Flooded Crypt (east marshes), and the Frost Aegis in the Obsidian Foundry (west wastes).',
          'Only then can the southern gate to the Ashen Spire be opened. Go. The crown awaits its rightful bearer.'
        ],
        choices: [
          { text: 'I will not fail you, Elder.', next: 'end' },
          { text: 'What are the relics?', next: 'relics' }
        ]
      },
      relics: {
        text: 'Each dungeon boss guards a relic. The boots let you dash through gaps, the lantern burns away darkness and webs, and the aegis turns aside death itself.',
        next: 'sealed'
      },
      done: {
        text: 'The crown is yours, hero. Emberhold will sing of you for a thousand years. Rest here whenever you wish.',
        choices: [{ text: 'Thank you, Elder.', next: 'end' }]
      },
      end: { text: '...', next: undefined as unknown as string }
    }
  },
  smith: {
    start: 'greet',
    nodes: {
      greet: {
        text: [
          'Ho! A blade-arm, are ye? Bram\'s forge is the finest in the valley.',
          'Bring me gold and Boss Shards and I\'ll put a keener edge on your sword. Armor too, if you\'ve coin.'
        ],
        choices: [
          { text: 'Upgrade weapon / armor (SHOP)', action: (g) => g.openShop('smith') },
          {
            text: 'Sparring quest',
            action: (g) => {
              if (!g.quests.isActive('sparring') && !g.quests.isDone('sparring')) {
                g.quests.start('sparring', g);
              } else g.toast(g.quests.isDone('sparring') ? 'You already proved yourself.' : 'Break the dummy 3 times, east of the plaza!');
            }
          },
          { text: 'Farewell.', next: 'end' }
        ]
      },
      end: { text: 'Hmph. Come back when you\'re serious.', next: undefined as unknown as string }
    }
  },
  alch: {
    start: 'greet',
    nodes: {
      greet: {
        text: [
          'Oh! A customer. Mira brews potions and ethers here. Careful with the shelves, dear.',
          'If you need Moonherbs, they grow in the glowing bushes of my garden, southeast of here.'
        ],
        choices: [
          { text: 'Buy potions (SHOP)', action: (g) => g.openShop('alch') },
          {
            text: 'Moonherb tonic quest',
            action: (g) => {
              if (!g.quests.isActive('herbs') && !g.quests.isDone('herbs')) g.quests.start('herbs', g);
              else g.toast(g.quests.isDone('herbs') ? 'The tonic is done. Thank you!' : 'Gather 3 Moonherbs from the glowing bushes in my garden!');
            }
          },
          { text: 'Farewell.', next: 'end' }
        ]
      },
      end: { text: 'Mind the fumes, dear.', next: undefined as unknown as string }
    }
  },
  carto: {
    start: 'greet',
    nodes: {
      greet: {
        text: [
          'Maps! Maps of every road, ruin and ruin-road in the realm. Ilya\'s ink is the truest north there is.',
          'I lost a page of my world map somewhere in the village... if you find it in a pot, bring it back for a reward.'
        ],
        choices: [
          { text: 'Show me the world map.', action: (g) => g.openPause('map') },
          {
            text: 'Buy Map of Emberhold (20 G)',
            action: (g) => {
              if (g.flags['mapEmberhold']) {
                g.toast('You already have the full map of Emberhold.');
              } else if (g.player.gold >= 20) {
                g.player.gold -= 20;
                g.setFlag('mapEmberhold', 1);
                g.discovered.add('hub');
                g.audio.sfx('coin');
                g.toast('Bought: Map of Emberhold!');
              } else {
                g.audio.sfx('error');
                g.toast('Not enough gold!');
              }
            }
          },
          {
            text: 'Lost map quest',
            action: (g) => {
              if (!g.quests.isActive('lostMap') && !g.quests.isDone('lostMap')) g.quests.start('lostMap', g);
              else g.toast(g.quests.isDone('lostMap') ? 'The map is whole again. Bless you!' : 'Find my map page - it was in a pot somewhere!');
            }
          },
          { text: 'Farewell.', next: 'end' }
        ]
      },
      end: { text: 'Safe travels, map-friend.', next: undefined as unknown as string }
    }
  },
  lore: {
    start: 'greet',
    nodes: {
      greet: {
        action: (g) => g.setFlag('metLore', 1),
        goto: (g) => (g.quests.isDone('tonic') ? 'thanks' : 'intro'),
        text: '...'
      },
      intro: {
        text: [
          'A seeker. Few come to my tower anymore. I am Vesper, keeper of the old lore.',
          'The Hollow King\'s wards are sealed with relic-magic. Three relics lie in the three dungeons beyond the sealed gates:',
          'Wind Boots, Ember Lantern, Frost Aegis. Without them, the Ashen Spire will never open.',
          'I am too frail to leave this tower... would you bring me a Potion? Mira sells them, or search the pots.'
        ],
        choices: [
          {
            text: 'I\'ll get you a potion (QUEST)',
            action: (g) => {
              if (!g.quests.isActive('tonic') && !g.quests.isDone('tonic')) g.quests.start('tonic', g);
            }
          },
          { text: 'What is the Ashen Crown?', next: 'crown' },
          { text: 'Farewell for now.', next: 'end' }
        ]
      },
      crown: {
        text: 'The Ashen Crown was forged from the first ember of the world. It grants dominion over ash and cinder. The Hollow King wears it now, empty inside, ravenous.',
        next: 'intro'
      },
      thanks: {
        text: [
          'You brought me a tonic, seeker. The old books whisper that a true hero walks among us again.',
          'Go to Elder Rowan. He will tell you how the wards may be broken.'
        ],
        choices: [{ text: 'I will, Vesper. Farewell.', next: 'end' }]
      },
      end: { text: 'The dark is patient. Be faster.', next: undefined as unknown as string }
    }
  }
};
