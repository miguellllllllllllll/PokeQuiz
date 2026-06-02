// kanto-part2.js — 40 personality quiz questions (balanced weights)
const KANTO_QUESTIONS = [

  // Q1 — Morning routine / energy
  {
    question: 'How do you actually start your morning?',
    answers: [
      {
        text: 'Up early, first out the door, already thinking about what I\'m conquering today',
        weights: {
          charizard: 3,
          zapdos: 1, moltres: 1, charmander: 1, mankey: 1, primeape: 1, arcanine: 1, machop: 1, machoke: 1, machamp: 1, ponyta: 1, rapidash: 1, farfetchd: 1
        }
      },
      {
        text: 'Slow and deliberate — I make tea, check my plants, ease in at my own pace',
        weights: {
          venusaur: 3,
          slowpoke: 2, starmie: 2, slowbro: 2, clefable: 2, jigglypuff: 2,
          psyduck: 1, golduck: 1, poliwag: 1, poliwrath: 1, abra: 1, alakazam: 1, seel: 1, dewgong: 1, shellder: 1, cloyster: 1, krabby: 1, kingler: 1
        }
      },
      {
        text: 'I lie awake running through every possible scenario before I even get up',
        weights: {
          mewtwo: 3,
          graveler: 2, golem: 2, onix: 2, voltorb: 2, rhyhorn: 2,
          kadabra: 1, magnemite: 1, magneton: 1, electrode: 1, mrMime: 1, electabuzz: 1, ditto: 1, eevee: 1, jolteon: 1, mew: 1, fearow: 1, raichu: 1
        }
      },
      {
        text: 'I wake up curious and excited — no alarm needed, every day feels like an adventure',
        weights: {
          pikachu: 3,
          tangela: 1, staryu: 1, tauros: 1, lapras: 1, vaporeon: 1, omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1, squirtle: 1, wartortle: 1, blastoise: 1
        }
      }
    ]
  },

  // Q2 — Handling conflict
  {
    question: 'Someone picks a fight with you. What happens next?',
    answers: [
      {
        text: 'I engage head-on — I\'m not here to back down from anyone',
        weights: {
          machamp: 3,
          ponyta: 2, rapidash: 2, chansey: 2, kangaskhan: 2, tauros: 2,
          hitmonchan: 1, magmar: 1, ditto: 1, eevee: 1, flareon: 1, porygon: 1, snorlax: 1, charmander: 1, charmeleon: 1, rattata: 1, raticate: 1, clefairy: 1
        }
      },
      {
        text: 'I try to understand both sides and find a peaceful resolution',
        weights: {
          lapras: 3,
          dewgong: 2, cloyster: 2, parasect: 2, weepinbell: 2, victreebel: 2,
          vileplume: 1, paras: 1, tangela: 1, horsea: 1, seadra: 1, goldeen: 1, seaking: 1, staryu: 1, jynx: 1, magikarp: 1, gyarados: 1, vaporeon: 1
        }
      },
      {
        text: 'I stay calm and dismantle their argument with logic until they\'ve got nothing left',
        weights: {
          alakazam: 3,
          drowzee: 2, hypno: 2, electrode: 2, exeggcute: 2, exeggutor: 2,
          electabuzz: 1, jolteon: 1, pikachu: 1, raichu: 1, persian: 1, magnemite: 1, magneton: 1, voltorb: 1, lickitung: 1, mrMime: 1, weezing: 1, pinsir: 1
        }
      },
      {
        text: 'I let them underestimate me, then pull the rug out when they least expect it',
        weights: {
          gengar: 3,
          haunter: 2, gastly: 2, nidorino: 2, grimer: 2, muk: 2,
          weedle: 1, kakuna: 1, beedrill: 1, nidoranF: 1, nidorina: 1, nidoqueen: 1, nidoranM: 1, nidoking: 1, oddish: 1, gloom: 1, venonat: 1, venomoth: 1
        }
      }
    ]
  },

  // Q3 — Social style
  {
    question: 'How would your friends describe your social energy?',
    answers: [
      {
        text: 'The life of the party — I perform, I entertain, I make sure everyone\'s having a great time',
        weights: {
          jigglypuff: 3,
          tauros: 2, porygon: 2, pidgey: 2, pidgeotto: 2, clefable: 2,
          doduo: 1, chansey: 1, kangaskhan: 1, spearow: 1, wigglytuff: 1, meowth: 1, persian: 1, farfetchd: 1, dodrio: 1, lickitung: 1, pidgeot: 1, fearow: 1
        }
      },
      {
        text: 'Warm and steady — I show up, I listen, I\'m quietly the glue holding the group together',
        weights: {
          bulbasaur: 3,
          sandslash: 2, diglett: 2, dugtrio: 2, seel: 2, shellder: 2,
          marowak: 1, rhyhorn: 1, rhydon: 1, sandshrew: 1, paras: 1, parasect: 1, psyduck: 1, golduck: 1, poliwag: 1, poliwhirl: 1, poliwrath: 1, tentacool: 1
        }
      },
      {
        text: 'Selective — I\'d rather go deep with one person than skim the surface with a crowd',
        weights: {
          abra: 3,
          gengar: 2, mrMime: 2, jynx: 2, mewtwo: 2, mew: 2,
          alakazam: 1, kadabra: 1, gastly: 1, haunter: 1, drowzee: 1, hypno: 1, exeggcute: 1, exeggutor: 1, slowpoke: 1, slowbro: 1, starmie: 1, ninetales: 1
        }
      },
      {
        text: 'I adapt to whoever I\'m with — I can vibe with anyone in any room',
        weights: {
          eevee: 3,
          ditto: 2, snorlax: 2, rattata: 2, raticate: 2, clefairy: 2,
          ponyta: 1, rapidash: 1, goldeen: 1, seaking: 1, staryu: 1, magikarp: 1, lapras: 1, vaporeon: 1, flareon: 1, omanyte: 1, omastar: 1, kabuto: 1
        }
      }
    ]
  },

  // Q4 — Dealing with failure
  {
    question: 'You just failed at something that really mattered to you. What do you do?',
    answers: [
      {
        text: 'I get angry, I push back, I train harder — failure just makes me more dangerous',
        weights: {
          primeape: 3,
          mankey: 2, machamp: 2, hitmonlee: 2, hitmonchan: 2, magmar: 2,
          kangaskhan: 1
        }
      },
      {
        text: 'I take a long nap, eat something good, and come back to it when I\'m ready',
        weights: {
          snorlax: 3,
          eevee: 2, porygon: 2, pidgeot: 2, spearow: 2, fearow: 2,
          squirtle: 1, wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1, poliwag: 1, poliwhirl: 1, poliwrath: 1, seel: 1, dewgong: 1, shellder: 1, cloyster: 1
        }
      },
      {
        text: 'I analyze every step, find exactly where it went wrong, and build a better strategy',
        weights: {
          kadabra: 3,
          abra: 1, alakazam: 1, magnemite: 1, magneton: 1, hypno: 1, voltorb: 1, electrode: 1, electabuzz: 1, jolteon: 1, zapdos: 1, mewtwo: 1, mew: 1
        }
      },
      {
        text: 'I shapeshift — I become exactly what the situation needs next time',
        weights: {
          ditto: 3,
          rattata: 2, raticate: 2, clefable: 2, dodrio: 2, lickitung: 2,
          farfetchd: 1, doduo: 1, gastly: 1, haunter: 1, gengar: 1, pidgey: 1, pidgeotto: 1, clefairy: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1, persian: 1
        }
      }
    ]
  },

  // Q5 — Fear
  {
    question: 'What is the thing you actually fear most?',
    answers: [
      {
        text: 'Being tamed — someone else controlling my path or putting out my fire',
        weights: {
          charmeleon: 3,
          dragonair: 2, dragonite: 2, vulpix: 2, ninetales: 2, growlithe: 2,
          charmander: 1, arcanine: 1, ponyta: 1, rapidash: 1, magmar: 1, moltres: 1, charizard: 1, cubone: 1, marowak: 1, hitmonchan: 1, weezing: 1, pidgeot: 1
        }
      },
      {
        text: 'Losing connection — being cut off from the people I love',
        weights: {
          slowbro: 3,
          mewtwo: 2, mew: 2, flareon: 2, dratini: 2,
          dewgong: 1, cloyster: 1, starmie: 1, jynx: 1, lapras: 1, drowzee: 1, articuno: 1, poliwag: 1, poliwhirl: 1, poliwrath: 1, tentacool: 1, tentacruel: 1
        }
      },
      {
        text: 'Being wrong — making a decision based on bad information and ruining everything',
        weights: {
          hypno: 3,
          abra: 2, kadabra: 2, alakazam: 2, slowpoke: 2, gastly: 2,
          mrMime: 1, exeggcute: 1, exeggutor: 1, mankey: 1, primeape: 1, machop: 1, machoke: 1, machamp: 1, magnemite: 1, magneton: 1, shellder: 1, krabby: 1
        }
      },
      {
        text: 'Being forgotten — invisible, irrelevant, fading into background noise',
        weights: {
          venomoth: 3,
          haunter: 2, gengar: 2, beedrill: 2, venonat: 2, weedle: 2,
          kakuna: 1, pinsir: 1, bulbasaur: 1, caterpie: 1, metapod: 1, paras: 1, bellsprout: 1, weepinbell: 1, victreebel: 1, grimer: 1, muk: 1, koffing: 1
        }
      }
    ]
  },

  // Q6 — Emotional expression
  {
    question: 'How do you handle your emotions when things get intense?',
    answers: [
      {
        text: 'I\'m an open book — you\'ll know exactly how I feel, immediately',
        weights: {
          mankey: 3,
          primeape: 2, machop: 2, machoke: 2, machamp: 2, hitmonlee: 2,
          arcanine: 1, ponyta: 1, rapidash: 1, hitmonchan: 1, magmar: 1, flareon: 1, moltres: 1, charmeleon: 1, vulpix: 1, ninetales: 1, poliwrath: 1, golbat: 1
        }
      },
      {
        text: 'I wear my heart on my sleeve — enthusiasm and affection first, always',
        weights: {
          growlithe: 3,
          eevee: 2, charmander: 2, charizard: 2, fearow: 2, clefairy: 2,
          lickitung: 1, chansey: 1, porygon: 1, snorlax: 1, pidgey: 1, rattata: 1, raticate: 1, spearow: 1, clefable: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1
        }
      },
      {
        text: 'I keep a composed exterior while carefully filing everything away for later',
        weights: {
          persian: 3,
          exeggcute: 2, kangaskhan: 2, jynx: 2, tauros: 2, ditto: 2,
          drowzee: 1, mewtwo: 1, mew: 1, abra: 1, kadabra: 1, alakazam: 1, farfetchd: 1, doduo: 1, hypno: 1, mrMime: 1, dodrio: 1, pidgeotto: 1
        }
      },
      {
        text: 'I drift away — I go somewhere quiet and process everything in private',
        weights: {
          gastly: 3,
          haunter: 2, gengar: 2, venonat: 2, bellsprout: 2, weepinbell: 2,
          bulbasaur: 1, ivysaur: 1, venusaur: 1, weedle: 1, beedrill: 1, ekans: 1, arbok: 1, nidoranF: 1, nidorina: 1, nidoranM: 1, nidorino: 1, oddish: 1
        }
      }
    ]
  },

  // Q7 — Ambition
  {
    question: 'What actually gets you out of bed and working toward something big?',
    answers: [
      {
        text: 'Proving people wrong — I remember every person who doubted me',
        weights: {
          hitmonlee: 3,
          charmeleon: 2, vulpix: 2, ninetales: 2, mankey: 2, primeape: 2,
          machop: 1, machoke: 1, machamp: 1, charmander: 1, growlithe: 1, arcanine: 1, ponyta: 1, rapidash: 1, hitmonchan: 1, magmar: 1, flareon: 1, moltres: 1
        }
      },
      {
        text: 'Protecting the people and things I love — I build so they never have to worry',
        weights: {
          dragonite: 3,
          gyarados: 2, aerodactyl: 2, articuno: 2, zapdos: 2, dratini: 2,
          dragonair: 1, butterfree: 1, doduo: 1, scyther: 1, charizard: 1, pidgey: 1, pidgeotto: 1, spearow: 1, zubat: 1, golbat: 1, farfetchd: 1, dodrio: 1
        }
      },
      {
        text: 'Curiosity — I need to understand how everything works, and build something no one\'s built before',
        weights: {
          porygon: 3,
          mrMime: 2, jynx: 2, mewtwo: 2, mew: 2, pikachu: 2,
          electabuzz: 1, jolteon: 1, raichu: 1, abra: 1, kadabra: 1, alakazam: 1, slowpoke: 1, slowbro: 1, magnemite: 1, magneton: 1, drowzee: 1, hypno: 1
        }
      },
      {
        text: 'The simple joy of it — I just genuinely love doing the thing',
        weights: {
          oddish: 3,
          vileplume: 2, bellsprout: 2, weepinbell: 2, victreebel: 2, koffing: 2,
          gloom: 1, bulbasaur: 1, ivysaur: 1, venusaur: 1, exeggcute: 1, exeggutor: 1, weezing: 1, tangela: 1, weedle: 1, kakuna: 1, beedrill: 1, ekans: 1
        }
      }
    ]
  },

  // Q8 — Ideal workspace
  {
    question: 'Describe your ideal place to work or create.',
    answers: [
      {
        text: 'Minimal, wired in, completely silent — I need data and zero distraction',
        weights: {
          magneton: 3,
          magnemite: 2, voltorb: 2, electrode: 2, electabuzz: 2, jolteon: 2,
          pikachu: 1, raichu: 1, zapdos: 1, dugtrio: 1, poliwag: 1, machop: 1, machoke: 1, bellsprout: 1, weepinbell: 1, victreebel: 1, grimer: 1, muk: 1
        }
      },
      {
        text: 'Outside, open air, somewhere I can move around and keep an eye on everything',
        weights: {
          kangaskhan: 3,
          kingler: 2, lickitung: 2, chansey: 2, horsea: 2, seadra: 2,
          psyduck: 1, tentacool: 1, tentacruel: 1, seel: 1, dewgong: 1, shellder: 1, cloyster: 1, krabby: 1, goldeen: 1, seaking: 1, staryu: 1, tauros: 1
        }
      },
      {
        text: 'Surrounded by greenery, soft light, things growing — nature is my productivity hack',
        weights: {
          tangela: 3,
          parasect: 2, paras: 2, caterpie: 2, metapod: 2, kakuna: 2,
          pinsir: 1, bulbasaur: 1, ivysaur: 1, venusaur: 1, butterfree: 1, oddish: 1, gloom: 1, vileplume: 1, venomoth: 1, exeggcute: 1, exeggutor: 1, scyther: 1
        }
      },
      {
        text: 'Cozy chaos — snacks nearby, low lighting, I work best when I\'m completely comfortable',
        weights: {
          meowth: 3,
          clefairy: 2, persian: 2, growlithe: 2, arcanine: 2, ponyta: 2,
          vulpix: 1, eevee: 1, flareon: 1, porygon: 1, snorlax: 1, moltres: 1, charmander: 1, charmeleon: 1, rattata: 1, raticate: 1, clefable: 1, ninetales: 1
        }
      }
    ]
  },

  // Q9 — Decision making
  {
    question: 'You have a huge decision to make. How do you approach it?',
    answers: [
      {
        text: 'I go with my gut and move fast — hesitation is its own kind of mistake',
        weights: {
          aerodactyl: 3,
          omanyte: 2, kabuto: 2, kabutops: 2, butterfree: 2, pidgeot: 2,
          spearow: 1, fearow: 1, golbat: 1, graveler: 1, onix: 1, rhyhorn: 1, gyarados: 1, articuno: 1, dragonite: 1, charizard: 1, pidgey: 1, pidgeotto: 1
        }
      },
      {
        text: 'I research everything, build a model, run it against every scenario I can think of',
        weights: {
          omastar: 3,
          squirtle: 2, wartortle: 2, blastoise: 2, psyduck: 2, golduck: 2,
          geodude: 1, golem: 1, slowpoke: 1, slowbro: 1, seel: 1, shellder: 1, krabby: 1, kingler: 1, rhydon: 1, horsea: 1, seadra: 1, goldeen: 1
        }
      },
      {
        text: 'I ask five trusted people, gather their input, then sit with it until something feels right',
        weights: {
          exeggcute: 3,
          exeggutor: 2, tangela: 2, paras: 2, parasect: 2, mrMime: 2,
          starmie: 1, abra: 1, kadabra: 1, alakazam: 1, drowzee: 1, hypno: 1, jynx: 1, mewtwo: 1, mew: 1, sandshrew: 1, sandslash: 1, diglett: 1
        }
      },
      {
        text: 'I watch how other people react, then make a move that none of them saw coming',
        weights: {
          arbok: 3,
          bulbasaur: 2, ivysaur: 2, venusaur: 2, ekans: 2, nidoranF: 2,
          nidorina: 1, nidoranM: 1, nidorino: 1, oddish: 1, gloom: 1, vileplume: 1, venonat: 1, venomoth: 1, bellsprout: 1, weepinbell: 1, victreebel: 1, tentacruel: 1
        }
      }
    ]
  },

  // Q10 — Humor style
  {
    question: 'What\'s your sense of humor actually like?',
    answers: [
      {
        text: 'Electric and sharp — I\'m always looking for the perfect moment to land a great zinger',
        weights: {
          electabuzz: 3,
          raichu: 2, arcanine: 2, ponyta: 2, rapidash: 2, magnemite: 2,
          pikachu: 1, magneton: 1, voltorb: 1, electrode: 1, jolteon: 1, flareon: 1, zapdos: 1, charmander: 1, charizard: 1, magmar: 1, moltres: 1, hitmonlee: 1
        }
      },
      {
        text: 'Soft and wholesome — my humor makes people feel safe, not called out',
        weights: {
          wigglytuff: 3,
          farfetchd: 2, doduo: 2, dodrio: 2, lickitung: 2, chansey: 2,
          pidgey: 1, pidgeotto: 1, pidgeot: 1, rattata: 1, raticate: 1, clefairy: 1, clefable: 1, jigglypuff: 1, meowth: 1, persian: 1, kangaskhan: 1, tauros: 1
        }
      },
      {
        text: 'Dry and dark — I\'ll make a joke about things most people are afraid to touch',
        weights: {
          haunter: 3,
          gastly: 2, gengar: 2, grimer: 2, beedrill: 2, ekans: 2,
          bulbasaur: 1, weezing: 1, ivysaur: 1, nidorina: 1, nidoranM: 1, nidorino: 1, nidoking: 1, oddish: 1, gloom: 1, vileplume: 1, venonat: 1, venomoth: 1
        }
      },
      {
        text: 'Unpredictable and chaotic — I will absolutely commit to a bit until everyone is uncomfortable',
        weights: {
          ninetales: 3,
          mrMime: 2, charmeleon: 2, vulpix: 2, growlithe: 2, kadabra: 2,
          mew: 1, abra: 1, alakazam: 1, drowzee: 1, hypno: 1, exeggcute: 1, exeggutor: 1, mewtwo: 1, starmie: 1, jynx: 1, slowpoke: 1, slowbro: 1
        }
      }
    ]
  },

  // Q11 — Energy drains
  {
    question: 'What completely drains your energy after too much of it?',
    answers: [
      {
        text: 'Being forced to be warm and social when I want to be left alone',
        weights: {
          cloyster: 3,
          dewgong: 2, lapras: 2, psyduck: 2, golduck: 2, poliwag: 2,
          seaking: 1, staryu: 1, jynx: 1, magikarp: 1, vaporeon: 1, articuno: 1, poliwhirl: 1, tentacruel: 1, slowpoke: 1, slowbro: 1, horsea: 1, seadra: 1
        }
      },
      {
        text: 'People who talk without listening and take up all the oxygen in the room',
        weights: {
          blastoise: 3,
          poliwrath: 2, seel: 2, shellder: 2, krabby: 2, kingler: 2,
          hitmonlee: 1, mankey: 1, primeape: 1, machop: 1, machoke: 1, machamp: 1, hitmonchan: 1, goldeen: 1, omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1
        }
      },
      {
        text: 'Standing still — I need movement, challenge, or I start to deteriorate',
        weights: {
          scyther: 3,
          butterfree: 2, charizard: 2, caterpie: 2, metapod: 2, pidgeotto: 2,
          venonat: 1, venomoth: 1, pinsir: 1, weedle: 1, kakuna: 1, beedrill: 1, pidgeot: 1, paras: 1, parasect: 1, dodrio: 1, gyarados: 1, aerodactyl: 1
        }
      },
      {
        text: 'Negativity, mess, and bad vibes — I absorb the energy of my environment completely',
        weights: {
          koffing: 3,
          ekans: 2, arbok: 2, nidoranF: 2, nidorina: 2, nidoranM: 2,
          venusaur: 1, nidoqueen: 1, nidorino: 1, nidoking: 1, zubat: 1, golbat: 1, oddish: 1, gloom: 1, vileplume: 1, bellsprout: 1, weepinbell: 1, victreebel: 1
        }
      }
    ]
  },

  // Q12 — Rules
  {
    question: 'What is your relationship with rules and authority?',
    answers: [
      {
        text: 'Rules are suggestions — I operate by my own code, and it\'s a better one anyway',
        weights: {
          golbat: 3,
          zapdos: 2, moltres: 2, zubat: 2, dodrio: 2, haunter: 2,
          scyther: 1, aerodactyl: 1, articuno: 1, dragonite: 1, diglett: 1, geodude: 1, kingler: 1, electrode: 1, cubone: 1, marowak: 1, hitmonlee: 1, hitmonchan: 1
        }
      },
      {
        text: 'I respect structure — I built mine the right way and I expect the same from others',
        weights: {
          wartortle: 3,
          poliwrath: 2, squirtle: 2, blastoise: 2, psyduck: 2, golduck: 2,
          seaking: 1, staryu: 1, magikarp: 1, lapras: 1, kabutops: 1, mankey: 1, primeape: 1, poliwag: 1, poliwhirl: 1, machop: 1, machoke: 1, machamp: 1
        }
      },
      {
        text: 'I\'ll follow rules that make sense, but I need to understand the reason why first',
        weights: {
          vulpix: 3,
          clefable: 1, ninetales: 1, jigglypuff: 1, growlithe: 1, arcanine: 1, ponyta: 1, rapidash: 1, chansey: 1, kangaskhan: 1, magmar: 1, tauros: 1, ditto: 1
        }
      },
      {
        text: 'I disappear into the system so thoroughly that no one can track what I\'m doing',
        weights: {
          muk: 3,
          nidorino: 2, vileplume: 2, victreebel: 2, grimer: 2, koffing: 2,
          nidoranM: 1, nidoking: 1, oddish: 1, gloom: 1, venonat: 1, venomoth: 1, bellsprout: 1, weepinbell: 1, weezing: 1, bulbasaur: 1, ivysaur: 1, venusaur: 1
        }
      }
    ]
  },

  // Q13 — Underestimated
  {
    question: 'In what way do people most consistently underestimate you?',
    answers: [
      {
        text: 'They see the easygoing exterior and have no idea how hard I can hit when I need to',
        weights: {
          machoke: 3,
          mankey: 2, primeape: 2, machop: 2, machamp: 2, onix: 2,
          hitmonchan: 1, poliwrath: 1, geodude: 1, graveler: 1, golem: 1, hitmonlee: 1, rhyhorn: 1, rhydon: 1, aerodactyl: 1, koffing: 1, seaking: 1, staryu: 1
        }
      },
      {
        text: 'They think I\'m soft, but I\'ve been quietly keeping score this whole time',
        weights: {
          chansey: 3,
          poliwhirl: 2, tentacool: 2, tentacruel: 2, seel: 2, shellder: 2,
          lickitung: 1, wigglytuff: 1, ditto: 1, eevee: 1, porygon: 1, snorlax: 1, rattata: 1, raticate: 1, clefairy: 1, clefable: 1, jigglypuff: 1, meowth: 1
        }
      },
      {
        text: 'They see the trophy, not the algorithm — they don\'t understand how I got there',
        weights: {
          starmie: 3,
          slowbro: 2, slowpoke: 2, squirtle: 2, wartortle: 2, blastoise: 2,
          magikarp: 1, lapras: 1, vaporeon: 1, golduck: 1, poliwag: 1, dewgong: 1, cloyster: 1, kingler: 1, gyarados: 1, mewtwo: 1, mew: 1, metapod: 1
        }
      },
      {
        text: 'They see my chaos and miss how deeply I\'m actually paying attention',
        weights: {
          psyduck: 3,
          abra: 2, kadabra: 2, alakazam: 2, drowzee: 2, hypno: 2,
          krabby: 1, exeggcute: 1, exeggutor: 1, horsea: 1, seadra: 1, goldeen: 1, mrMime: 1, jynx: 1, omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1
        }
      }
    ]
  },

  // Q14 — Loyalty
  {
    question: 'What does loyalty actually mean to you?',
    answers: [
      {
        text: 'I run toward you, not away — when things get bad, I\'m the one showing up',
        weights: {
          arcanine: 3,
          ninetales: 2, ponyta: 2, rapidash: 2, kangaskhan: 2, magmar: 2,
          flareon: 1, charmander: 1, charmeleon: 1, vulpix: 1, growlithe: 1, tauros: 1, ditto: 1, eevee: 1, porygon: 1, snorlax: 1, rattata: 1, raticate: 1
        }
      },
      {
        text: 'It grows slowly — I\'m loyal to the people who earned it over years, not days',
        weights: {
          gloom: 3,
          oddish: 2, nidorino: 2, zubat: 2, golbat: 2, paras: 2,
          grimer: 1, muk: 1, koffing: 1, weezing: 1, tangela: 1, arbok: 1, nidoranF: 1, nidoranM: 1, gastly: 1, gengar: 1, exeggutor: 1, parasect: 1
        }
      },
      {
        text: 'I keep my promises and remember every single detail of what you\'ve shared with me',
        weights: {
          ekans: 3,
          nidoqueen: 2, nidoking: 2, bulbasaur: 2, ivysaur: 2, venusaur: 2,
          onix: 1, rhyhorn: 1, diglett: 1, dugtrio: 1, tentacool: 1, tentacruel: 1, graveler: 1, pinsir: 1, dratini: 1, dragonair: 1, mewtwo: 1, mew: 1
        }
      },
      {
        text: 'I protect you without being asked — it\'s instinct, not obligation',
        weights: {
          nidorina: 3,
          vileplume: 2, venomoth: 2, bellsprout: 2, weepinbell: 2, victreebel: 2,
          geodude: 1, golem: 1, haunter: 1, cubone: 1, marowak: 1, rhydon: 1, weedle: 1, kakuna: 1, beedrill: 1, sandshrew: 1, sandslash: 1, venonat: 1
        }
      }
    ]
  },

  // Q15 — Risk
  {
    question: 'How do you feel about taking risks?',
    answers: [
      {
        text: 'I thrive on them — the higher the stakes, the more focused and alive I feel',
        weights: {
          dodrio: 3,
          spearow: 2, fearow: 2, farfetchd: 2, doduo: 2, pidgey: 2,
          pidgeotto: 1, pidgeot: 1, lickitung: 1, chansey: 1, scyther: 1, articuno: 1, moltres: 1, dragonite: 1, charizard: 1, butterfree: 1, wigglytuff: 1, persian: 1
        }
      },
      {
        text: 'I like calculated risks — I\'ll take the leap once I\'ve mapped the landing zone',
        weights: {
          poliwhirl: 3,
          poliwrath: 2, machop: 2, machoke: 2, hitmonlee: 2, hitmonchan: 2,
          mankey: 1, primeape: 1, machamp: 1, cloyster: 1, krabby: 1, kingler: 1, goldeen: 1, tentacool: 1, horsea: 1, seadra: 1, starmie: 1, weezing: 1
        }
      },
      {
        text: 'I\'ll risk it if the upside helps something bigger than me',
        weights: {
          tentacruel: 3,
          nidorino: 2, seaking: 2, staryu: 2, lapras: 2, dratini: 2,
          koffing: 1, bulbasaur: 1, ivysaur: 1, venusaur: 1, weedle: 1, kakuna: 1, beedrill: 1, ekans: 1, arbok: 1, nidoranF: 1, nidorina: 1, nidoqueen: 1
        }
      },
      {
        text: 'I\'d rather have a sure thing — I build slowly but I almost never lose what I\'ve built',
        weights: {
          poliwag: 3,
          magikarp: 2, vaporeon: 2, squirtle: 2, wartortle: 2, blastoise: 2,
          gyarados: 1, omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1, psyduck: 1, golduck: 1, slowpoke: 1, slowbro: 1, seel: 1, dewgong: 1, shellder: 1
        }
      }
    ]
  },

  // Q16 — Praise/success
  {
    question: 'Someone publicly praises your work in front of a group. How do you react?',
    answers: [
      {
        text: 'I accept it gracefully — I worked hard for this and I\'m not going to fake modesty',
        weights: {
          fearow: 3,
          dodrio: 2, pidgey: 2, pidgeotto: 2, pidgeot: 2, spearow: 2,
          farfetchd: 1, doduo: 1, articuno: 1, zapdos: 1, dragonite: 1, charizard: 1, butterfree: 1, rattata: 1, raticate: 1, zubat: 1, golbat: 1, scyther: 1
        }
      },
      {
        text: 'I deflect immediately and redirect credit to everyone who helped me',
        weights: {
          ivysaur: 3,
          clefable: 2, jigglypuff: 2, wigglytuff: 2, oddish: 2, gloom: 2,
          tangela: 1, bulbasaur: 1, venusaur: 1, vileplume: 1, paras: 1, parasect: 1, persian: 1, bellsprout: 1, weepinbell: 1, victreebel: 1, ditto: 1, eevee: 1
        }
      },
      {
        text: 'I appreciate it but immediately start cataloguing what still needs to be better',
        weights: {
          golduck: 3,
          starmie: 2, alakazam: 2, jynx: 2, poliwag: 2, poliwhirl: 2
        }
      },
      {
        text: 'Honestly? I love it. I beam. I remember it for months and it fuels me.',
        weights: {
          clefairy: 3,
          meowth: 2, lickitung: 2, chansey: 2, kangaskhan: 2, tauros: 2,
          porygon: 1, snorlax: 1, dratini: 1, dragonair: 1, ekans: 1, arbok: 1, sandshrew: 1, sandslash: 1, nidoranF: 1, nidorina: 1, nidoqueen: 1, nidoranM: 1
        }
      }
    ]
  },

  // Q17 — Planning
  {
    question: 'How do you actually approach planning something important?',
    answers: [
      {
        text: 'Spreadsheets, timelines, contingencies — I map every single step before I move',
        weights: {
          hitmonchan: 3,
          mankey: 2, primeape: 2, poliwrath: 2, machop: 2, machoke: 2,
          hitmonlee: 1, machamp: 1, caterpie: 1, metapod: 1, nidorino: 1, vileplume: 1, paras: 1, parasect: 1, abra: 1, kadabra: 1, alakazam: 1, bellsprout: 1
        }
      },
      {
        text: 'I have a rough vision and I improvise everything else on the way there',
        weights: {
          graveler: 3,
          golem: 2, onix: 2, rhyhorn: 2, rhydon: 2, geodude: 2,
          nidoking: 1, aerodactyl: 1, sandshrew: 1, nidoqueen: 1, diglett: 1, dugtrio: 1, marowak: 1, sandslash: 1, cubone: 1, omanyte: 1, omastar: 1, kabuto: 1
        }
      },
      {
        text: 'I absorb every input I can find, then suddenly know what to do',
        weights: {
          magnemite: 3,
          magneton: 2, zapdos: 2, pikachu: 2, raichu: 2, voltorb: 2,
          electabuzz: 1, jolteon: 1, electrode: 1, pinsir: 1, dratini: 1, dragonite: 1, kakuna: 1, ekans: 1, arbok: 1, nidoranF: 1, nidorina: 1, nidoranM: 1
        }
      },
      {
        text: 'I talk it through with someone I trust until the plan feels right',
        weights: {
          rattata: 3,
          lickitung: 2, chansey: 2, kangaskhan: 2, tauros: 2, ditto: 2,
          clefairy: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1, persian: 1, eevee: 1, porygon: 1, snorlax: 1, raticate: 1, clefable: 1, farfetchd: 1, doduo: 1
        }
      }
    ]
  },

  // Q18 — Sharing yourself
  {
    question: 'How much of yourself do you actually let people see?',
    answers: [
      {
        text: 'I let people in slowly — the real me takes time and trust to appear',
        weights: {
          onix: 3,
          geodude: 2, graveler: 2, golem: 2, rhyhorn: 2, rhydon: 2,
          aerodactyl: 1, sandslash: 1, diglett: 1, dugtrio: 1, cubone: 1, marowak: 1, omastar: 1, nidoqueen: 1, nidoking: 1, caterpie: 1, metapod: 1, pikachu: 1
        }
      },
      {
        text: 'I share everything openly — vulnerability is a feature, not a bug',
        weights: {
          vaporeon: 3,
          omanyte: 2, kabuto: 2, kabutops: 2, squirtle: 2, wartortle: 2,
          clefairy: 1, persian: 1, farfetchd: 1, doduo: 1, seel: 1, dewgong: 1, shellder: 1, cloyster: 1, krabby: 1, kingler: 1, lickitung: 1, chansey: 1
        }
      },
      {
        text: 'I\'m genuinely an open book — but most people don\'t ask the right questions',
        weights: {
          drowzee: 3,
          abra: 2, kadabra: 2, alakazam: 2, hypno: 2, exeggutor: 2,
          exeggcute: 1, starmie: 1, slowbro: 1, sandshrew: 1, machop: 1, machoke: 1, machamp: 1, gastly: 1, haunter: 1, gengar: 1, voltorb: 1, hitmonlee: 1
        }
      },
      {
        text: 'I show people what they want to see while keeping the real depths to myself',
        weights: {
          jynx: 3,
          mrMime: 2, articuno: 2, mewtwo: 2, mew: 2, slowpoke: 2
        }
      }
    ]
  },

  // Q19 — Competition
  {
    question: 'Someone challenges you to a direct competition. What do you feel?',
    answers: [
      {
        text: 'Pure excitement — finally, a chance to prove exactly what I\'m worth',
        weights: {
          tauros: 3,
          raticate: 2, jigglypuff: 2, wigglytuff: 2, meowth: 2, persian: 2,
          mankey: 1, primeape: 1, machop: 1, machoke: 1, machamp: 1, hitmonlee: 1, hitmonchan: 1, kangaskhan: 1, ditto: 1, eevee: 1, snorlax: 1, pidgey: 1
        }
      },
      {
        text: 'I study them first, find the gap, then act at exactly the right moment',
        weights: {
          seaking: 3,
          psyduck: 2, golduck: 2, poliwag: 2, poliwhirl: 2, tentacool: 2,
          omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1, weezing: 1, chansey: 1, pinsir: 1, dratini: 1, dragonair: 1
        }
      },
      {
        text: 'I turn it into performance — I want the win AND the crowd',
        weights: {
          electrode: 3,
          magneton: 2, electabuzz: 2, jolteon: 2, zapdos: 2, pikachu: 2,
          voltorb: 1, raichu: 1, magnemite: 1, charmeleon: 1, caterpie: 1, metapod: 1, vulpix: 1, ninetales: 1, growlithe: 1, abra: 1, kadabra: 1, alakazam: 1
        }
      },
      {
        text: 'I don\'t feel competitive — I just want everyone to grow and do their best',
        weights: {
          exeggutor: 3,
          exeggcute: 2, gloom: 2, paras: 2, parasect: 2, tangela: 2,
          mewtwo: 1, mew: 1, slowpoke: 1, drowzee: 1, hypno: 1, mrMime: 1, bulbasaur: 1, ivysaur: 1, venusaur: 1, oddish: 1, vileplume: 1, bellsprout: 1
        }
      }
    ]
  },

  // Q20 — Patience
  {
    question: 'What\'s your relationship with patience and waiting?',
    answers: [
      {
        text: 'I\'m genuinely terrible at it — stillness feels like wasted momentum to me',
        weights: {
          voltorb: 3,
          magnemite: 2, magneton: 2, electrode: 2, electabuzz: 2, jolteon: 2,
          raichu: 1, pikachu: 1, zapdos: 1, abra: 1, kadabra: 1, alakazam: 1, tentacruel: 1, geodude: 1, graveler: 1, golem: 1, grimer: 1, muk: 1
        }
      },
      {
        text: 'I\'m patient about the big things — I\'ll wait a lifetime for what I actually want',
        weights: {
          dratini: 3,
          dragonair: 2, dragonite: 2, eevee: 2, porygon: 2, snorlax: 2,
          mewtwo: 1, mew: 1, charmander: 1, metapod: 1, diglett: 1, dugtrio: 1, mankey: 1, primeape: 1, growlithe: 1, arcanine: 1, machop: 1, machoke: 1
        }
      },
      {
        text: 'I use waiting time productively — I\'m always building even when I look still',
        weights: {
          staryu: 3,
          slowpoke: 2, starmie: 2, slowbro: 2, poliwhirl: 2, tentacool: 2,
          hypno: 1, krabby: 1, kingler: 1, exeggcute: 1, exeggutor: 1, horsea: 1, seadra: 1, goldeen: 1, seaking: 1, mrMime: 1, jynx: 1, magikarp: 1
        }
      },
      {
        text: 'I\'m almost too patient — I\'ll endure almost anything without complaint',
        weights: {
          seel: 3,
          dewgong: 2, cloyster: 2, lapras: 2, wartortle: 2, poliwag: 2,
          kabutops: 1, squirtle: 1, blastoise: 1, psyduck: 1, shellder: 1, vaporeon: 1, omanyte: 1, omastar: 1, kabuto: 1, articuno: 1, golduck: 1, poliwrath: 1
        }
      }
    ]
  },

  // Q21 — Alone time
  {
    question: 'How do you feel about time completely alone?',
    answers: [
      {
        text: 'It\'s sacred — I recharge by myself and I guard that time fiercely',
        weights: {
          clefable: 3,
          clefairy: 2, jigglypuff: 2, wigglytuff: 2, meowth: 2, persian: 2,
          chansey: 1, kangaskhan: 1, tauros: 1, ditto: 1, eevee: 1, porygon: 1, snorlax: 1, spearow: 1, fearow: 1, farfetchd: 1, doduo: 1, dodrio: 1
        }
      },
      {
        text: 'I feel it most keenly — solitude is where I process everything that\'s happened',
        weights: {
          cubone: 3,
          sandslash: 2, nidoqueen: 2, nidoking: 2, diglett: 2, dugtrio: 2,
          marowak: 1, sandshrew: 1, geodude: 1, graveler: 1, golem: 1, onix: 1, rhyhorn: 1, rhydon: 1, gloom: 1, vileplume: 1, paras: 1, parasect: 1
        }
      },
      {
        text: 'I love it, but I start to miss people after a while — I need both',
        weights: {
          dragonair: 3,
          dratini: 2, dragonite: 2, hitmonchan: 2, tangela: 2, pinsir: 2,
          pikachu: 1, raichu: 1, nidorino: 1, victreebel: 1, grimer: 1, lapras: 1, jolteon: 1, flareon: 1, omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1
        }
      },
      {
        text: 'Honestly, I can be alone indefinitely — I genuinely don\'t get lonely that easily',
        weights: {
          lickitung: 3,
          pidgey: 2, pidgeotto: 2, pidgeot: 2, rattata: 2, raticate: 2,
          muk: 1, magmar: 1, charmander: 1, charmeleon: 1, squirtle: 1, wartortle: 1, blastoise: 1, caterpie: 1, metapod: 1, weedle: 1, kakuna: 1, beedrill: 1
        }
      }
    ]
  },

  // Q22 — Change
  {
    question: 'Something you\'ve relied on for years suddenly changes. What do you do?',
    answers: [
      {
        text: 'I rage against it initially, then eventually adapt — but I\'m slow to let go',
        weights: {
          gyarados: 3,
          omanyte: 2, omastar: 2, kabuto: 2, kabutops: 2, aerodactyl: 2,
          poliwrath: 1, seel: 1, dewgong: 1, shellder: 1, staryu: 1, magikarp: 1, lapras: 1, squirtle: 1, wartortle: 1, spearow: 1, fearow: 1, poliwhirl: 1
        }
      },
      {
        text: 'I take time to mourn it, then rebuild deliberately and carefully',
        weights: {
          tentacool: 3,
          tentacruel: 2, muk: 2, krabby: 2, weezing: 2, seaking: 2,
          gengar: 1, koffing: 1, ekans: 1, arbok: 1, nidoranF: 1, oddish: 1, gloom: 1, venonat: 1, venomoth: 1, grimer: 1, cloyster: 1, gastly: 1
        }
      },
      {
        text: 'I find the angle in it — change usually creates opportunity if you move fast enough',
        weights: {
          goldeen: 3,
          vaporeon: 2, blastoise: 2, psyduck: 2, golduck: 2, poliwag: 2,
          kingler: 1, horsea: 1, seadra: 1, slowpoke: 1, slowbro: 1, starmie: 1, caterpie: 1, ninetales: 1, arcanine: 1, geodude: 1, graveler: 1, golem: 1
        }
      },
      {
        text: 'I barely notice — I was already moving in a different direction anyway',
        weights: {
          pidgeot: 3,
          dragonair: 2,
          pidgey: 1, pidgeotto: 1, farfetchd: 1, doduo: 1, dodrio: 1, clefable: 1, snorlax: 1, dragonite: 1, butterfree: 1, jigglypuff: 1, wigglytuff: 1, zubat: 1
        }
      }
    ]
  },

  // Q23 — Leadership
  {
    question: 'When you\'re the one in charge, how do you lead?',
    answers: [
      {
        text: 'With dominance — I set the direction and I expect everyone to move in it',
        weights: {
          nidoking: 3,
          nidoranF: 2, zubat: 2, golbat: 2, venonat: 2, venomoth: 2,
          tentacool: 1, caterpie: 1, metapod: 1, butterfree: 1, clefable: 1, vulpix: 1, ninetales: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1, persian: 1, mankey: 1
        }
      },
      {
        text: 'With quiet authority — I don\'t demand respect, I build it action by action',
        weights: {
          nidoqueen: 3,
          arbok: 2, nidorina: 2, nidoranM: 2, nidorino: 2, oddish: 2,
          weedle: 1, kakuna: 1, gloom: 1, vileplume: 1, bellsprout: 1, weepinbell: 1, victreebel: 1, haunter: 1, gengar: 1, venusaur: 1, beedrill: 1, ekans: 1
        }
      },
      {
        text: 'Through the environment — I set up systems so the right thing happens automatically',
        weights: {
          marowak: 3,
          rhydon: 2, hitmonchan: 2, tangela: 2, magmar: 2, pinsir: 2,
          sandshrew: 1, sandslash: 1, diglett: 1, dugtrio: 1, geodude: 1, graveler: 1, golem: 1, onix: 1, cubone: 1, rhyhorn: 1, bulbasaur: 1, ivysaur: 1
        }
      },
      {
        text: 'By example and genuine enthusiasm — I pull people forward because I believe so hard',
        weights: {
          grimer: 3,
          tentacruel: 2, muk: 2, gastly: 2, koffing: 2, weezing: 2,
          machamp: 1, magnemite: 1, magneton: 1, voltorb: 1, electrode: 1, hitmonlee: 1, mrMime: 1, jynx: 1, electabuzz: 1, jolteon: 1, kabutops: 1, dratini: 1
        }
      }
    ]
  },

  // Q24 — Misunderstood
  {
    question: 'What\'s the biggest misconception people have about you?',
    answers: [
      {
        text: 'That I\'m aggressive — I\'m actually just extremely direct and I don\'t apologize for it',
        weights: {
          pinsir: 3,
          metapod: 2, scyther: 2, butterfree: 2, weedle: 2, kakuna: 2,
          muk: 1, dragonair: 1, mewtwo: 1, mew: 1, pikachu: 1, raichu: 1, sandshrew: 1, sandslash: 1, clefable: 1, diglett: 1, dugtrio: 1, meowth: 1
        }
      },
      {
        text: 'That I\'m simple — there\'s a whole world running under the surface that nobody sees',
        weights: {
          slowpoke: 3,
          starmie: 2, slowbro: 2, goldeen: 2, staryu: 2, magikarp: 2,
          krabby: 1, squirtle: 1, wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1, poliwag: 1, poliwhirl: 1, poliwrath: 1, abra: 1, kadabra: 1, alakazam: 1
        }
      },
      {
        text: 'That I\'m cold — I\'m not cold, I\'m just precise about who gets the real me',
        weights: {
          magmar: 3,
          charmander: 2, charmeleon: 2, charizard: 2, vulpix: 2, ninetales: 2,
          flareon: 1, growlithe: 1, arcanine: 1, ponyta: 1, rapidash: 1, grimer: 1, gastly: 1, haunter: 1, gengar: 1, marowak: 1, lickitung: 1, koffing: 1
        }
      },
      {
        text: 'That I\'m fragile — I\'ve survived things quietly that would\'ve broken most people',
        weights: {
          caterpie: 3,
          beedrill: 1, paras: 1, parasect: 1, venonat: 1, venomoth: 1, venusaur: 1, rattata: 1, raticate: 1, spearow: 1, fearow: 1, ekans: 1, arbok: 1
        }
      }
    ]
  },

  // Q25 — Work ethic
  {
    question: 'How do you approach hard, sustained work?',
    answers: [
      {
        text: 'I lock in completely — I can work for hours in a flow state without noticing time',
        weights: {
          kingler: 3,
          seaking: 2, staryu: 2, magikarp: 2, lapras: 2, vaporeon: 2,
          squirtle: 1, wartortle: 1, blastoise: 1, poliwag: 1, poliwhirl: 1, cloyster: 1, krabby: 1, horsea: 1, seadra: 1, goldeen: 1, starmie: 1, gyarados: 1
        }
      },
      {
        text: 'I chip away slowly and consistently — I\'m not fast, but I never stop',
        weights: {
          sandslash: 3,
          cubone: 2, marowak: 2, sandshrew: 2, nidoqueen: 2, nidoking: 2,
          dugtrio: 1, diglett: 1, geodude: 1, graveler: 1, golem: 1, onix: 1, rhyhorn: 1, rhydon: 1, raichu: 1, abra: 1, machamp: 1, magnemite: 1
        }
      },
      {
        text: 'I rally behind a deadline and do my best work under pressure',
        weights: {
          beedrill: 3,
          scyther: 1, pinsir: 1, caterpie: 1, metapod: 1, butterfree: 1, weedle: 1, kakuna: 1, paras: 1, parasect: 1, venonat: 1, venomoth: 1, zubat: 1
        }
      },
      {
        text: 'I need to feel inspired — I work incredibly hard on things I love, struggle with things I don\'t',
        weights: {
          charmander: 3,
          rapidash: 2, magmar: 2, flareon: 2, moltres: 2, charmeleon: 2,
          ponyta: 1, vulpix: 1, ninetales: 1, growlithe: 1, arcanine: 1, charizard: 1, magneton: 1, drowzee: 1, electrode: 1, hitmonlee: 1, tangela: 1, jynx: 1
        }
      }
    ]
  },

  // Q26 — Transformation
  {
    question: 'How do you think about personal growth and change?',
    answers: [
      {
        text: 'I\'m actively reinventing myself — I\'m not who I was last year and I like that',
        weights: {
          squirtle: 3,
          tentacool: 2, tentacruel: 2, seel: 2, shellder: 2, krabby: 2,
          wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1, poliwag: 1, poliwhirl: 1, poliwrath: 1, slowpoke: 1, slowbro: 1, dewgong: 1, cloyster: 1, kingler: 1
        }
      },
      {
        text: 'I grow through stillness — my biggest changes happen when I stop forcing things',
        weights: {
          metapod: 3,
          caterpie: 2, kakuna: 2, beedrill: 2, paras: 2, parasect: 2,
          cubone: 1, marowak: 1, rhyhorn: 1, rhydon: 1, seaking: 1, magmar: 1, magikarp: 1, lapras: 1, vaporeon: 1, jolteon: 1, flareon: 1, dratini: 1
        }
      },
      {
        text: 'I pursue growth deliberately — I have a system and I track my own progress',
        weights: {
          butterfree: 3,
          scyther: 2, pinsir: 2, gyarados: 2, articuno: 2, moltres: 2,
          dragonite: 1, charizard: 1, aerodactyl: 1, zapdos: 1, pidgey: 1, pidgeotto: 1, pidgeot: 1, spearow: 1, fearow: 1, zubat: 1, golbat: 1, farfetchd: 1
        }
      },
      {
        text: 'I grow through relationships — the right people push me to become something better',
        weights: {
          weedle: 3,
          venonat: 2, venomoth: 2, arbok: 2, nidorina: 2, nidoranM: 2
        }
      }
    ]
  },

  // Q27 — Steady improvement
  {
    question: 'What does steady, incremental improvement mean to you?',
    answers: [
      {
        text: 'It\'s the whole game — I trust the compound effect more than any big breakthrough',
        weights: {
          kakuna: 3,
          pinsir: 2, caterpie: 2, metapod: 2, nidoranF: 2, nidoranM: 2,
          weedle: 1, beedrill: 1, venonat: 1, venomoth: 1, weepinbell: 1, victreebel: 1, muk: 1, gengar: 1, koffing: 1, weezing: 1, bulbasaur: 1, ivysaur: 1
        }
      },
      {
        text: 'I get restless with small gains — I want leaps, not steps',
        weights: {
          pidgey: 3,
          pidgeot: 2, spearow: 2, fearow: 2, farfetchd: 2, doduo: 2,
          dodrio: 1, kangaskhan: 1, tauros: 1, dragonite: 1, butterfree: 1, zubat: 1, golbat: 1, persian: 1, lickitung: 1, chansey: 1, scyther: 1, gyarados: 1
        }
      },
      {
        text: 'I value consistency, but I also need to know the destination is worth the grind',
        weights: {
          pidgeotto: 3,
          aerodactyl: 1, articuno: 1, clefable: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1, porygon: 1, zapdos: 1, moltres: 1, charizard: 1, rapidash: 1, onix: 1
        }
      },
      {
        text: 'I build habits and they carry me even on the days when motivation vanishes',
        weights: {
          raticate: 3,
          ditto: 2, eevee: 2, snorlax: 2, rattata: 2, clefairy: 2,
          bellsprout: 1, rhydon: 1, tangela: 1, horsea: 1, seadra: 1, electabuzz: 1, magmar: 1, magikarp: 1, lapras: 1, vaporeon: 1, jolteon: 1, flareon: 1
        }
      }
    ]
  },

  // Q28 — Territory
  {
    question: 'How do you feel about your own personal space and boundaries?',
    answers: [
      {
        text: 'My territory is sacred — cross the line and you\'ll know about it fast',
        weights: {
          spearow: 3,
          farfetchd: 2, doduo: 2, dodrio: 2, pidgey: 2, pidgeotto: 2,
          pidgeot: 1, fearow: 1, dragonite: 1, rattata: 1, raticate: 1, clefairy: 1, clefable: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1, persian: 1, lickitung: 1
        }
      },
      {
        text: 'I enforce boundaries firmly but fairly — I respect yours and expect you to respect mine',
        weights: {
          raichu: 3,
          pikachu: 2, voltorb: 2, electrode: 2, electabuzz: 2, jolteon: 2,
          magnemite: 1, magneton: 1, zapdos: 1, cubone: 1, rhydon: 1, geodude: 1, golem: 1, grimer: 1, gastly: 1, haunter: 1, onix: 1, drowzee: 1
        }
      },
      {
        text: 'I\'m flexible — I adapt my space to whoever I\'m with and what the situation needs',
        weights: {
          sandshrew: 3,
          marowak: 2, sandslash: 2, nidoqueen: 2, nidoking: 2, diglett: 2,
          dugtrio: 1, graveler: 1, rhyhorn: 1, ponyta: 1, rapidash: 1, hitmonchan: 1, chansey: 1, tangela: 1, kangaskhan: 1, horsea: 1, seadra: 1, goldeen: 1
        }
      },
      {
        text: 'I struggle with them — I give people too much access and end up drained',
        weights: {
          nidoranF: 3,
          weedle: 2, ekans: 2, arbok: 2, nidorina: 2, nidoranM: 2,
          muk: 1, gengar: 1, koffing: 1, weezing: 1, nidorino: 1, zubat: 1, golbat: 1, bellsprout: 1, weepinbell: 1, victreebel: 1, tentacool: 1, tentacruel: 1
        }
      }
    ]
  },

  // Q29 — Ambition level
  {
    question: 'How ambitious are you, honestly?',
    answers: [
      {
        text: 'Extremely — I have a specific vision of the top and I\'m working toward it relentlessly',
        weights: {
          nidoranM: 3,
          arbok: 2, nidorina: 2, golbat: 2, grimer: 2, muk: 2,
          hitmonchan: 1, tangela: 1, pinsir: 1, dratini: 1, dragonair: 1, charmeleon: 1, caterpie: 1, metapod: 1, pikachu: 1, sandshrew: 1, clefairy: 1, vulpix: 1
        }
      },
      {
        text: 'Ambitious in specific areas — deeply motivated where I care, completely detached elsewhere',
        weights: {
          nidorino: 3,
          nidoranF: 2, venonat: 2, venomoth: 2, bellsprout: 2, weepinbell: 2,
          gastly: 1, nidoking: 1, oddish: 1, haunter: 1, weedle: 1, kakuna: 1, beedrill: 1, ekans: 1, nidoqueen: 1, tentacruel: 1, tentacool: 1, primeape: 1
        }
      },
      {
        text: 'I drift into things and somehow end up succeeding — ambition feels like the wrong word',
        weights: {
          zubat: 3,
          gengar: 2, koffing: 2, weezing: 2, scyther: 2, gyarados: 2,
          aerodactyl: 1, articuno: 1, dragonite: 1, butterfree: 1, doduo: 1, moltres: 1, charizard: 1, pidgey: 1, pidgeotto: 1, pidgeot: 1, spearow: 1, fearow: 1
        }
      },
      {
        text: 'I want depth and meaning more than height — being the best isn\'t the goal, doing it well is',
        weights: {
          vileplume: 3,
          victreebel: 2, bulbasaur: 2, ivysaur: 2, venusaur: 2, gloom: 2,
          paras: 1, parasect: 1, exeggcute: 1, exeggutor: 1, dewgong: 1, onix: 1, krabby: 1, kingler: 1, voltorb: 1, hitmonlee: 1, rhyhorn: 1, rhydon: 1
        }
      }
    ]
  },

  // Q30 — Tedious work
  {
    question: 'How do you handle boring, repetitive, or tedious work?',
    answers: [
      {
        text: 'I find a rhythm and let my mind wander — I can grind indefinitely',
        weights: {
          paras: 3,
          tangela: 2, scyther: 2, butterfree: 2, vileplume: 2, bellsprout: 2,
          oddish: 1, ivysaur: 1, gloom: 1, weepinbell: 1, victreebel: 1, exeggcute: 1, venusaur: 1, charmander: 1, charmeleon: 1, pikachu: 1, raichu: 1, nidoranF: 1
        }
      },
      {
        text: 'I automate or delegate it the moment I can — my energy is for bigger things',
        weights: {
          parasect: 3,
          caterpie: 2, metapod: 2, exeggutor: 2, pinsir: 2, bulbasaur: 2,
          dragonair: 1, dragonite: 1, mewtwo: 1, mew: 1, ponyta: 1, rapidash: 1, magnemite: 1, magneton: 1, drowzee: 1, hypno: 1, voltorb: 1, electrode: 1
        }
      },
      {
        text: 'I do it, but I\'m quietly miserable — I need the end goal visible to push through',
        weights: {
          venonat: 3,
          kakuna: 2, beedrill: 2, venomoth: 2, weedle: 2, grimer: 2,
          weezing: 1, zubat: 1, golbat: 1, tentacool: 1, tentacruel: 1, muk: 1, gastly: 1, haunter: 1, gengar: 1, koffing: 1, ekans: 1, arbok: 1
        }
      },
      {
        text: 'I turn it into a game or a competition with myself — tedium is a mindset, not a fact',
        weights: {
          diglett: 3,
          dugtrio: 2, sandshrew: 2, nidoking: 2, geodude: 2, golem: 2,
          nidoqueen: 1, marowak: 1, rhydon: 1, sandslash: 1, graveler: 1, onix: 1, cubone: 1, rhyhorn: 1, nidorina: 1, nidoranM: 1, nidorino: 1, clefairy: 1
        }
      }
    ]
  },

  // Q31 — Physical energy
  {
    question: 'How physical or active are you day to day?',
    answers: [
      {
        text: 'Always moving — stillness makes me anxious and I need to use my body',
        weights: {
          dugtrio: 3,
          sandshrew: 2, cubone: 2, marowak: 2, sandslash: 2, nidoqueen: 2,
          diglett: 1, geodude: 1, graveler: 1, golem: 1, onix: 1, rhyhorn: 1, rhydon: 1, nidoking: 1, growlithe: 1, kadabra: 1, dratini: 1, dragonair: 1
        }
      },
      {
        text: 'Active when I need to be — I have deep reserves I haven\'t shown anyone yet',
        weights: {
          poliwrath: 3,
          machoke: 2, seel: 2, dewgong: 2, shellder: 2, cloyster: 2,
          seaking: 1, staryu: 1, magikarp: 1, vaporeon: 1, kingler: 1, lapras: 1, kabutops: 1, squirtle: 1, wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1
        }
      },
      {
        text: 'I prefer mental energy — physical action is a tool, not a state of being',
        weights: {
          machop: 3,
          hitmonlee: 2, hitmonchan: 2, mankey: 2, primeape: 2, machamp: 2,
          goldeen: 1, omanyte: 1, kabuto: 1, arbok: 1, nidoranF: 1, nidorina: 1, nidoranM: 1, nidorino: 1, vulpix: 1, venonat: 1, venomoth: 1, arcanine: 1
        }
      },
      {
        text: 'I take it as it comes — I can be a couch or a mountain, depending on the day',
        weights: {
          bellsprout: 3,
          ivysaur: 2, venusaur: 2, oddish: 2, gloom: 2, vileplume: 2,
          weepinbell: 1, victreebel: 1, paras: 1, parasect: 1, grimer: 1, muk: 1, gastly: 1, haunter: 1, gengar: 1, exeggcute: 1, exeggutor: 1, koffing: 1
        }
      }
    ]
  },

  // Q32 — Persistence
  {
    question: 'What does persistence look like for you?',
    answers: [
      {
        text: 'I keep going no matter what — obstacles don\'t stop me, they become part of the path',
        weights: {
          weepinbell: 3,
          bulbasaur: 2, ivysaur: 2, venusaur: 2, oddish: 2, gloom: 2
        }
      },
      {
        text: 'I evolve my approach — I won\'t keep doing the same thing if it isn\'t working',
        weights: {
          victreebel: 3,
          weezing: 2, weedle: 2, kakuna: 2, beedrill: 2, ekans: 2,
          vileplume: 1, bellsprout: 1, nidorina: 1, nidorino: 1, zubat: 1, golbat: 1, grimer: 1, muk: 1, koffing: 1, tangela: 1, arbok: 1, nidoranF: 1
        }
      },
      {
        text: 'I rest without quitting — I know the difference between a break and giving up',
        weights: {
          geodude: 3,
          onix: 2, graveler: 2, rhyhorn: 2, rhydon: 2, sandshrew: 2,
          omanyte: 1, kabuto: 1, kabutops: 1, aerodactyl: 1, sandslash: 1, nidoqueen: 1, nidoking: 1, dragonair: 1, pikachu: 1, raichu: 1, mankey: 1, primeape: 1
        }
      },
      {
        text: 'I outlast everyone — I don\'t have the most energy, but I\'m still here at the end',
        weights: {
          golem: 3,
          omastar: 2, diglett: 2, dugtrio: 2, cubone: 2, marowak: 2,
          pinsir: 1, charmander: 1, charmeleon: 1, caterpie: 1, metapod: 1, butterfree: 1, parasect: 1, mrMime: 1, scyther: 1, electabuzz: 1, magmar: 1, tauros: 1
        }
      }
    ]
  },

  // Q33 — Freedom
  {
    question: 'How important is independence and freedom to you?',
    answers: [
      {
        text: 'Everything — I will sacrifice comfort, stability, and security to stay free',
        weights: {
          ponyta: 3,
          moltres: 2, dragonair: 2, electabuzz: 2, jolteon: 2, dratini: 2,
          charmeleon: 1, vulpix: 1, ninetales: 1, charizard: 1, voltorb: 1, electrode: 1, cubone: 1, hitmonlee: 1, hitmonchan: 1, koffing: 1, weezing: 1, tangela: 1
        }
      },
      {
        text: 'I value it but I also find freedom in commitment — roots and wings can coexist',
        weights: {
          rapidash: 3,
          growlithe: 2, arcanine: 2, magmar: 2, flareon: 2, charmander: 2
        }
      },
      {
        text: 'I need enough independence to do things my way, not full isolation',
        weights: {
          farfetchd: 3,
          zapdos: 2, dragonite: 2, pikachu: 2, raichu: 2, sandslash: 2,
          gyarados: 1, scyther: 1, tauros: 1, ditto: 1, clefairy: 1, jigglypuff: 1, wigglytuff: 1, zubat: 1, golbat: 1, meowth: 1, horsea: 1, seadra: 1
        }
      },
      {
        text: 'I\'m honestly fine with structure — freedom without purpose is just wandering',
        weights: {
          doduo: 3,
          eevee: 2, porygon: 2, aerodactyl: 2, snorlax: 2, articuno: 2,
          dodrio: 1, pidgey: 1, pidgeotto: 1, pidgeot: 1, spearow: 1, fearow: 1, rattata: 1, raticate: 1, persian: 1, lickitung: 1, chansey: 1, kangaskhan: 1
        }
      }
    ]
  },

  // Q34 — Emotional protection
  {
    question: 'How do you protect yourself emotionally?',
    answers: [
      {
        text: 'I build walls — few people get past them, but those who do are trusted completely',
        weights: {
          dewgong: 3,
          cloyster: 2, lapras: 2, kingler: 2, horsea: 2, seadra: 2,
          articuno: 1, slowbro: 1, starmie: 1, jynx: 1, marowak: 1, pikachu: 1, raichu: 1, sandshrew: 1, sandslash: 1, voltorb: 1, electrode: 1, cubone: 1
        }
      },
      {
        text: 'I protect myself by staying useful — if I\'m needed, I feel safe',
        weights: {
          shellder: 3,
          seaking: 2, staryu: 2, magikarp: 2, gyarados: 2, vaporeon: 2
        }
      },
      {
        text: 'I use humor to deflect anything that feels too heavy',
        weights: {
          krabby: 3,
          goldeen: 2, omanyte: 2, omastar: 2, kabuto: 2, kabutops: 2,
          squirtle: 1, wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1, poliwag: 1, poliwhirl: 1, poliwrath: 1, tentacool: 1, tentacruel: 1, seel: 1, slowpoke: 1
        }
      },
      {
        text: 'I protect myself by becoming unpredictable — if no one knows my patterns, no one can use them',
        weights: {
          weezing: 3,
          growlithe: 2, arcanine: 2, machop: 2, machoke: 2, machamp: 2,
          ekans: 1, arbok: 1, nidoranF: 1, nidorina: 1, nidoqueen: 1, nidoranM: 1, nidoking: 1, grimer: 1, muk: 1, gastly: 1, haunter: 1, gengar: 1
        }
      }
    ]
  },

  // Q35 — Long journeys
  {
    question: 'You\'re deep into a long project. It\'s taking longer than expected. What do you do?',
    answers: [
      {
        text: 'I buckle down harder — the length of the road is proof the destination is worth it',
        weights: {
          rhyhorn: 3,
          omanyte: 2, omastar: 2, kabuto: 2, kabutops: 2, sandshrew: 2,
          marowak: 1, aerodactyl: 1, sandslash: 1, nidoqueen: 1, nidoking: 1, drowzee: 1, hypno: 1, hitmonlee: 1, mrMime: 1, electabuzz: 1, dratini: 1, mewtwo: 1
        }
      },
      {
        text: 'I revisit the plan, cut what isn\'t essential, and find a smarter path forward',
        weights: {
          rhydon: 3,
          geodude: 2, golem: 2, onix: 2, graveler: 2, cubone: 2,
          mankey: 1, primeape: 1, machop: 1, machoke: 1, magnemite: 1, magneton: 1, seel: 1, shellder: 1, cloyster: 1, gastly: 1, haunter: 1, gengar: 1
        }
      },
      {
        text: 'I look for the wonder in it — long projects are where the best discoveries happen',
        weights: {
          horsea: 3,
          magikarp: 2, vaporeon: 2, dragonair: 2, diglett: 2, dugtrio: 2,
          dewgong: 1, kingler: 1, goldeen: 1, seaking: 1, staryu: 1, lapras: 1, squirtle: 1, wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1, poliwag: 1
        }
      },
      {
        text: 'I phone a friend — I can push through anything if someone\'s there with me',
        weights: {
          seadra: 3,
          poliwhirl: 1, tentacool: 1, tentacruel: 1, krabby: 1, slowpoke: 1, slowbro: 1, starmie: 1, gyarados: 1, growlithe: 1, machamp: 1, weepinbell: 1, victreebel: 1
        }
      }
    ]
  },

  // Q36 — Untapped potential
  {
    question: 'Do you feel like you\'ve reached your potential yet?',
    answers: [
      {
        text: 'Absolutely not — I\'m still in the early chapters and the best is nowhere near written',
        weights: {
          mrMime: 3,
          drowzee: 2, jynx: 2, mewtwo: 2, mew: 2, abra: 2,
          hypno: 1, exeggcute: 1, exeggutor: 1, slowpoke: 1, slowbro: 1, starmie: 1, seaking: 1, bulbasaur: 1, ivysaur: 1, venusaur: 1, blastoise: 1, caterpie: 1
        }
      },
      {
        text: 'I tap into it in flashes — I\'ve seen what I can do and I\'m working to access it consistently',
        weights: {
          magikarp: 3,
          krabby: 2, kingler: 2, horsea: 2, seadra: 2, goldeen: 2,
          omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1, poliwhirl: 1, poliwrath: 1, seel: 1, dewgong: 1, shellder: 1, cloyster: 1, staryu: 1, gyarados: 1
        }
      },
      {
        text: 'I keep finding new depths I didn\'t know existed — potential feels infinite',
        weights: {
          jolteon: 3,
          electrode: 2, raichu: 2, magnemite: 2, magneton: 2, voltorb: 2,
          pikachu: 1, electabuzz: 1, zapdos: 1, porygon: 1, snorlax: 1, dratini: 1, dragonair: 1, metapod: 1, paras: 1, parasect: 1, diglett: 1, dugtrio: 1
        }
      },
      {
        text: 'I feel settled in who I am — the work is refinement now, not discovery',
        weights: {
          flareon: 3,
          charmander: 2, charmeleon: 2, charizard: 2, vulpix: 2, ninetales: 2,
          growlithe: 1, arcanine: 1, ponyta: 1, rapidash: 1, magmar: 1, moltres: 1, mankey: 1, primeape: 1, kadabra: 1, alakazam: 1, machop: 1, machoke: 1
        }
      }
    ]
  },

  // Q37 — Rarely seen
  {
    question: 'What side of yourself do almost no one ever get to see?',
    answers: [
      {
        text: 'My tenderness — I care deeply and I\'m fiercely protective of the people I love',
        weights: {
          omanyte: 3,
          omastar: 2, poliwhirl: 2, poliwrath: 2, tentacool: 2, tentacruel: 2,
          seaking: 1, staryu: 1, starmie: 1, magikarp: 1, gyarados: 1, lapras: 1, vaporeon: 1, squirtle: 1, wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1
        }
      },
      {
        text: 'My humor — I have an absolutely ridiculous inner life that almost no one sees',
        weights: {
          kabuto: 3,
          krabby: 2, kingler: 2, horsea: 2, seadra: 2, goldeen: 2,
          ditto: 1, eevee: 1
        }
      },
      {
        text: 'My ambition — on the surface I seem easygoing, underneath I\'m tracking everything',
        weights: {
          kabutops: 3,
          rhyhorn: 2, rhydon: 2, aerodactyl: 2, geodude: 2, graveler: 2,
          golem: 1, onix: 1, rattata: 1, nidorino: 1, nidoking: 1, vulpix: 1, ninetales: 1, oddish: 1, gloom: 1, vileplume: 1, venonat: 1, venomoth: 1
        }
      },
      {
        text: 'My fear — I carry anxieties silently that would probably surprise everyone who knows me',
        weights: {
          articuno: 3,
          cloyster: 2, zubat: 2, golbat: 2, dewgong: 2, scyther: 2,
          jynx: 1, dragonite: 1, butterfree: 1, dodrio: 1, zapdos: 1, moltres: 1, pinsir: 1, dratini: 1, dragonair: 1, mewtwo: 1, mew: 1, caterpie: 1
        }
      }
    ]
  },

  // Q38 — Feel alive
  {
    question: 'When do you feel most completely, undeniably yourself?',
    answers: [
      {
        text: 'In motion, at full speed, something important on the line',
        weights: {
          zapdos: 3,
          raichu: 2, magnemite: 2, magneton: 2, farfetchd: 2, doduo: 2,
          dodrio: 1, scyther: 1, gyarados: 1, pidgey: 1, pidgeotto: 1, sandshrew: 1, sandslash: 1, diglett: 1, dugtrio: 1, geodude: 1, graveler: 1, golem: 1
        }
      },
      {
        text: 'When I\'m creating or discovering something that didn\'t exist before I found it',
        weights: {
          moltres: 3,
          charizard: 2, arcanine: 2, flareon: 2, dragonite: 2, charmander: 2,
          aerodactyl: 1, articuno: 1, charmeleon: 1, butterfree: 1, pidgeot: 1, spearow: 1, fearow: 1, vulpix: 1, ninetales: 1, zubat: 1, golbat: 1, growlithe: 1
        }
      },
      {
        text: 'When I feel genuinely needed — when my presence makes a real difference',
        weights: {
          mew: 3,
          wigglytuff: 2, meowth: 2, persian: 2, alakazam: 2, exeggcute: 2,
          abra: 1, kadabra: 1, drowzee: 1, hypno: 1, exeggutor: 1, kangaskhan: 1, mrMime: 1, tauros: 1, ditto: 1, eevee: 1, porygon: 1, snorlax: 1
        }
      },
      {
        text: 'When I\'m electric and lit up and the right song is playing',
        weights: {
          pikachu: 3,
          ponyta: 2, rapidash: 2, cubone: 2, marowak: 2, hitmonlee: 2,
          electrode: 1, electabuzz: 1, jolteon: 1, voltorb: 1, hitmonchan: 1, tangela: 1, horsea: 1, seadra: 1, jynx: 1, pinsir: 1, magikarp: 1, vaporeon: 1
        }
      }
    ]
  },

  // Q39 — Keeps you going
  {
    question: 'At the end of a brutal stretch, what actually keeps you going?',
    answers: [
      {
        text: 'Stubbornness — I refuse to be the reason something doesn\'t happen',
        weights: {
          charizard: 3,
          moltres: 2, gyarados: 2, flareon: 2, aerodactyl: 2, articuno: 2,
          charmander: 1, charmeleon: 1, vulpix: 1, ninetales: 1, growlithe: 1, arcanine: 1, ponyta: 1, rapidash: 1, doduo: 1, dodrio: 1, scyther: 1, magmar: 1
        }
      },
      {
        text: 'A vision so specific and clear it feels like memory — I\'ve already seen myself there',
        weights: {
          mewtwo: 3,
          drowzee: 2, hypno: 2, exeggcute: 2, exeggutor: 2, starmie: 2,
          mrMime: 1, wartortle: 1, dugtrio: 1, mankey: 1, primeape: 1, machop: 1, machoke: 1, seel: 1, onix: 1, voltorb: 1, electrode: 1, cubone: 1
        }
      },
      {
        text: 'The love I have for the thing itself — if it matters, I find the energy',
        weights: {
          eevee: 3,
          ditto: 2, porygon: 2, snorlax: 2, rattata: 2, raticate: 2,
          lickitung: 1, chansey: 1, kangaskhan: 1, tauros: 1, pidgeot: 1, spearow: 1, fearow: 1, clefairy: 1, clefable: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1
        }
      },
      {
        text: 'The people counting on me — I can\'t quit when someone else needs me not to',
        weights: {
          gengar: 3,
          gastly: 2, haunter: 2, muk: 2, koffing: 2, weezing: 2,
          ekans: 1, arbok: 1, nidoranF: 1, grimer: 1, ivysaur: 1, weedle: 1, kakuna: 1, beedrill: 1, nidorina: 1, nidoqueen: 1, nidoranM: 1, nidorino: 1
        }
      }
    ]
  },

  // Q40 — At your core
  {
    question: 'Stripped of everything else, at your absolute core, you are…',
    answers: [
      {
        text: 'A protector — I exist to make sure the people and things I love are safe',
        weights: {
          snorlax: 3,
          clefable: 2, jigglypuff: 2, wigglytuff: 2, meowth: 2, persian: 2,
          lickitung: 1, chansey: 1, kangaskhan: 1, tauros: 1, ditto: 1, eevee: 1, porygon: 1, rattata: 1, raticate: 1, clefairy: 1, magnemite: 1, magneton: 1
        }
      },
      {
        text: 'A seeker — I need to know more, become more, understand more than I did yesterday',
        weights: {
          alakazam: 3,
          abra: 2, kadabra: 2, slowbro: 2, drowzee: 2, hypno: 2
        }
      },
      {
        text: 'A transformer — I become what each moment needs and I\'m always changing',
        weights: {
          dragonite: 3,
          butterfree: 2, spearow: 2, fearow: 2, zubat: 2, golbat: 2,
          dratini: 1, dragonair: 1, articuno: 1, scyther: 1, aerodactyl: 1, zapdos: 1, moltres: 1, electabuzz: 1, vaporeon: 1, jolteon: 1, flareon: 1, omastar: 1
        }
      },
      {
        text: 'A force — something raw and unstoppable that most people only sense but never fully see',
        weights: {
          gyarados: 3,
          horsea: 2, seadra: 2, goldeen: 2, seaking: 2, staryu: 2,
          charizard: 1, squirtle: 1, pidgey: 1, pidgeotto: 1, pidgeot: 1, tentacool: 1, tentacruel: 1, farfetchd: 1, doduo: 1, dodrio: 1, seel: 1, shellder: 1
        }
      }
    ]
  }

];

module.exports = KANTO_QUESTIONS;