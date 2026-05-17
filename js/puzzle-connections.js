/* puzzle-connections.js — Pokémon Connections daily puzzle */
'use strict';

// ── Puzzle data (30 daily puzzles) ─────────────────────────────────────────
// Each puzzle must have exactly 16 unique Pokémon across all 4 groups.
const PUZZLES = [
  // 0
  {
    groups: [
      { tier: 'yellow', label: 'Water Starters', members: ['Squirtle', 'Totodile', 'Mudkip', 'Piplup'] },
      { tier: 'green',  label: 'Fire Starters', members: ['Charmander', 'Cyndaquil', 'Torchic', 'Chimchar'] },
      { tier: 'blue',   label: 'Evolve with a Thunder Stone', members: ['Pikachu', 'Eevee', 'Eelektrik', 'Magneton'] },
      { tier: 'purple', label: 'Grass Starters', members: ['Bulbasaur', 'Chikorita', 'Treecko', 'Turtwig'] },
    ]
  },
  // 1
  {
    groups: [
      { tier: 'yellow', label: 'Pseudo-Legendaries', members: ['Dragonite', 'Tyranitar', 'Metagross', 'Garchomp'] },
      { tier: 'green',  label: 'Pokémon that can learn Surf', members: ['Lapras', 'Vaporeon', 'Slowpoke', 'Snorlax'] },
      { tier: 'blue',   label: 'Kanto Legendary Birds', members: ['Articuno', 'Zapdos', 'Moltres', 'Aerodactyl'] },
      { tier: 'purple', label: 'Names that contain a direction or dash', members: ['Rapidash', 'Dodrio', 'Lickitung', 'Tangela'] },
    ]
  },
  // 2
  {
    groups: [
      { tier: 'yellow', label: 'Eeveelutions (Gen 1)', members: ['Vaporeon', 'Jolteon', 'Flareon', 'Eevee'] },
      { tier: 'green',  label: 'Kanto Fossil Pokémon (evolved)', members: ['Omastar', 'Kabutops', 'Rampardos', 'Cradily'] },
      { tier: 'blue',   label: 'Ghost-type Legendaries or Mythicals', members: ['Marshadow', 'Hoopa', 'Calyrex', 'Spectrier'] },
      { tier: 'purple', label: 'Pokémon whose names end in a number sound', members: ['Magneton', 'Electrode', 'Dodrio', 'Zweilous'] },
    ]
  },
  // 3
  {
    groups: [
      { tier: 'yellow', label: 'Baby Pokémon (Gen 2)', members: ['Pichu', 'Cleffa', 'Igglybuff', 'Magby'] },
      { tier: 'green',  label: 'Pokémon with 3 heads or faces', members: ['Dodrio', 'Magneton', 'Weezing', 'Exeggutor'] },
      { tier: 'blue',   label: 'Fossil Pokémon from Hoenn', members: ['Lileep', 'Anorith', 'Cradily', 'Armaldo'] },
      { tier: 'purple', label: 'Johto Beast Trio', members: ['Raikou', 'Entei', 'Suicune', 'Lugia'] },
    ]
  },
  // 4
  {
    groups: [
      { tier: 'yellow', label: 'Pokémon that evolve via Moon Stone', members: ['Nidorina', 'Jigglypuff', 'Clefairy', 'Skitty'] },
      { tier: 'green',  label: 'Ash\'s Unova Core Team', members: ['Krookodile', 'Unfezant', 'Leavanny', 'Snivy'] },
      { tier: 'blue',   label: 'Pure Normal-type Pokémon', members: ['Snorlax', 'Tauros', 'Kangaskhan', 'Ditto'] },
      { tier: 'purple', label: 'Pokémon whose names contain a number (hidden)', members: ['Dugtrio', 'Magneton', 'Weezing', 'Exeggutor'] },
    ]
  },
  // 5
  {
    groups: [
      { tier: 'yellow', label: 'Pokémon that evolve via Trade', members: ['Machamp', 'Golem', 'Gengar', 'Alakazam'] },
      { tier: 'green',  label: 'Pure Electric-types (Gen 1)', members: ['Pikachu', 'Electrode', 'Jolteon', 'Voltorb'] },
      { tier: 'blue',   label: 'Pokémon based on inanimate objects', members: ['Magnemite', 'Klink', 'Honedge', 'Chandelure'] },
      { tier: 'purple', label: 'Pokémon Red version exclusives', members: ['Ekans', 'Arcanine', 'Scyther', 'Electabuzz'] },
    ]
  },
  // 6
  {
    groups: [
      { tier: 'yellow', label: 'Hoenn Weather Trio', members: ['Kyogre', 'Groudon', 'Rayquaza', 'Castform'] },
      { tier: 'green',  label: 'Pokémon with Levitate ability', members: ['Gastly', 'Misdreavus', 'Drifblim', 'Rotom'] },
      { tier: 'blue',   label: 'Pokémon that can Mega Evolve (Gen 1 starters)', members: ['Venusaur', 'Charizard', 'Blastoise', 'Beedrill'] },
      { tier: 'purple', label: 'Team Rocket\'s Main Pokémon', members: ['Ekans', 'Koffing', 'Arbok', 'Weezing'] },
    ]
  },
  // 7
  {
    groups: [
      { tier: 'yellow', label: 'Pokémon with forme changes', members: ['Giratina', 'Shaymin', 'Deoxys', 'Rotom'] },
      { tier: 'green',  label: 'Steel-type Legendaries', members: ['Dialga', 'Jirachi', 'Registeel', 'Cobalion'] },
      { tier: 'blue',   label: 'Pokémon Gary used in the Indigo League', members: ['Blastoise', 'Nidoking', 'Arcanine', 'Alakazam'] },
      { tier: 'purple', label: 'Pokémon that appear in the Gen 1 intro battle', members: ['Nidorino', 'Gengar', 'Jigglypuff', 'Pidgey'] },
    ]
  },
  // 8
  {
    groups: [
      { tier: 'yellow', label: 'Sinnoh Starters', members: ['Turtwig', 'Chimchar', 'Piplup', 'Riolu'] },
      { tier: 'green',  label: 'Mythical Pokémon', members: ['Mew', 'Celebi', 'Jirachi', 'Darkrai'] },
      { tier: 'blue',   label: 'Pokémon named after celestial bodies', members: ['Solrock', 'Lunatone', 'Starmie', 'Clefairy'] },
      { tier: 'purple', label: 'Pokémon with 100 in exactly one base stat', members: ['Nidoking', 'Poliwrath', 'Arcanine', 'Primeape'] },
    ]
  },
  // 9
  {
    groups: [
      { tier: 'yellow', label: 'Evolve with a Fire Stone', members: ['Vulpix', 'Growlithe', 'Eevee', 'Pansear'] },
      { tier: 'green',  label: 'Dark or Ghost Legendaries or Mythicals', members: ['Yveltal', 'Marshadow', 'Hoopa', 'Darkrai'] },
      { tier: 'blue',   label: 'Pokémon that can learn Fly but are not Flying-type', members: ['Dragonite', 'Gyarados', 'Gligar', 'Mew'] },
      { tier: 'purple', label: 'Pokémon Blue version exclusives', members: ['Sandshrew', 'Ninetales', 'Pinsir', 'Magmar'] },
    ]
  },
  // 10
  {
    groups: [
      { tier: 'yellow', label: 'Unova Starters', members: ['Snivy', 'Tepig', 'Oshawott', 'Emboar'] },
      { tier: 'green',  label: 'Pokémon with exactly 3-stage evolution lines', members: ['Caterpie', 'Weedle', 'Abra', 'Machop'] },
      { tier: 'blue',   label: 'Ice/Water-type Pokémon', members: ['Lapras', 'Dewgong', 'Cloyster', 'Walrein'] },
      { tier: 'purple', label: 'Famous VGC competitive core members', members: ['Garchomp', 'Rotom', 'Ferrothorn', 'Heatran'] },
    ]
  },
  // 11
  {
    groups: [
      { tier: 'yellow', label: 'Kalos Legendaries', members: ['Xerneas', 'Yveltal', 'Zygarde', 'Diancie'] },
      { tier: 'green',  label: 'Pokémon that can Mega Evolve into two forms', members: ['Charizard', 'Mewtwo', 'Latios', 'Latias'] },
      { tier: 'blue',   label: 'Pokémon with Trace ability', members: ['Ralts', 'Porygon', 'Gardevoir', 'Espeon'] },
      { tier: 'purple', label: 'Pokémon from Lavender Town (Pokémon Tower)', members: ['Gastly', 'Haunter', 'Gengar', 'Cubone'] },
    ]
  },
  // 12
  {
    groups: [
      { tier: 'yellow', label: 'Pokémon Red version exclusives', members: ['Ekans', 'Arcanine', 'Scyther', 'Electabuzz'] },
      { tier: 'green',  label: 'Pokémon Blue version exclusives', members: ['Sandshrew', 'Ninetales', 'Pinsir', 'Magmar'] },
      { tier: 'blue',   label: 'Pokémon that appear in Lavender Town area', members: ['Gastly', 'Haunter', 'Gengar', 'Cubone'] },
      { tier: 'purple', label: 'Pokémon with notoriously identical-looking Shiny forms', members: ['Garchomp', 'Glaceon', 'Togekiss', 'Quagsire'] },
    ]
  },
  // 13
  {
    groups: [
      { tier: 'yellow', label: 'Kanto starters (final evolutions)', members: ['Venusaur', 'Charizard', 'Blastoise', 'Raichu'] },
      { tier: 'green',  label: 'Pokémon with signature moves (Gen 1)', members: ['Pikachu', 'Mewtwo', 'Snorlax', 'Mew'] },
      { tier: 'blue',   label: 'Dragon-type Legendaries', members: ['Rayquaza', 'Dialga', 'Palkia', 'Giratina'] },
      { tier: 'purple', label: 'Ultra Beasts', members: ['Nihilego', 'Buzzwole', 'Pheromosa', 'Guzzlord'] },
    ]
  },
  // 14
  {
    groups: [
      { tier: 'yellow', label: 'Kalos Starters', members: ['Chespin', 'Fennekin', 'Froakie', 'Sylveon'] },
      { tier: 'green',  label: 'Sword of Justice (Fighting Legendaries)', members: ['Cobalion', 'Terrakion', 'Virizion', 'Keldeo'] },
      { tier: 'blue',   label: 'Alola Starters', members: ['Rowlet', 'Litten', 'Popplio', 'Decidueye'] },
      { tier: 'purple', label: 'Pokémon only found in one game version in Gen 1', members: ['Scyther', 'Pinsir', 'Oddish', 'Bellsprout'] },
    ]
  },
  // 15
  {
    groups: [
      { tier: 'yellow', label: 'Pokémon with 4x weakness to Ground', members: ['Magnezone', 'Steelix', 'Golem', 'Nosepass'] },
      { tier: 'green',  label: 'Gender-locked Pokémon (female only)', members: ['Nidorina', 'Nidoqueen', 'Kangaskhan', 'Blissey'] },
      { tier: 'blue',   label: 'Ash\'s Pokémon that never evolved during his ownership', members: ['Pikachu', 'Bulbasaur', 'Squirtle', 'Totodile'] },
      { tier: 'purple', label: 'Pokémon that can learn Ice Beam and are not Ice-type', members: ['Lapras', 'Vaporeon', 'Starmie', 'Slowbro'] },
    ]
  },
  // 16
  {
    groups: [
      { tier: 'yellow', label: 'Pure Poison-type Pokémon (Gen 1)', members: ['Ekans', 'Koffing', 'Grimer', 'Nidorino'] },
      { tier: 'green',  label: 'Rock-type Pokémon from Mt. Moon (Gen 1)', members: ['Geodude', 'Onix', 'Rhyhorn', 'Kabuto'] },
      { tier: 'blue',   label: 'Pokémon in the Field Egg Group', members: ['Eevee', 'Vulpix', 'Growlithe', 'Arcanine'] },
      { tier: 'purple', label: 'Ghost/Poison Pokémon', members: ['Gastly', 'Haunter', 'Gengar', 'Misdreavus'] },
    ]
  },
  // 17
  {
    groups: [
      { tier: 'yellow', label: 'Dragon-type Legendaries (Sinnoh)', members: ['Dialga', 'Palkia', 'Giratina', 'Rayquaza'] },
      { tier: 'green',  label: 'Pokémon that can learn any move via Sketch or Copy', members: ['Mew', 'Castform', 'Arceus', 'Smeargle'] },
      { tier: 'blue',   label: 'Ultra Beasts (Gen 7)', members: ['Nihilego', 'Buzzwole', 'Pheromosa', 'Guzzlord'] },
      { tier: 'purple', label: 'Pokémon whose Pokédex entries mention death or grief', members: ['Gengar', 'Banette', 'Duskull', 'Yamask'] },
    ]
  },
  // 18
  {
    groups: [
      { tier: 'yellow', label: 'Sinnoh Lake Trio', members: ['Uxie', 'Mesprit', 'Azelf', 'Phione'] },
      { tier: 'green',  label: 'Dual Steel-type Pokémon', members: ['Magnezone', 'Steelix', 'Skarmory', 'Scizor'] },
      { tier: 'blue',   label: 'Pokémon that are Psychic-type in Gen 1', members: ['Mewtwo', 'Mew', 'Jynx', 'Alakazam'] },
      { tier: 'purple', label: 'Pokémon names that are anagrams of other words (or Pokémon)', members: ['Ekans', 'Arbok', 'Latios', 'Latias'] },
    ]
  },
  // 19
  {
    groups: [
      { tier: 'yellow', label: 'Galar Starters', members: ['Grookey', 'Scorbunny', 'Sobble', 'Inteleon'] },
      { tier: 'green',  label: 'Pokémon that learn Spore', members: ['Paras', 'Foongus', 'Shroomish', 'Breloom'] },
      { tier: 'blue',   label: 'Galar Legendaries', members: ['Zacian', 'Zamazenta', 'Eternatus', 'Kubfu'] },
      { tier: 'purple', label: 'Pokémon with extraordinarily high single base stats', members: ['Shuckle', 'Blissey', 'Deoxys', 'Ninjask'] },
    ]
  },
  // 20
  {
    groups: [
      { tier: 'yellow', label: 'Pokémon that appear in the Gen 1 intro battle sequence', members: ['Nidorino', 'Gengar', 'Pidgey', 'Rattata'] },
      { tier: 'green',  label: 'Johto starters or their final evolutions', members: ['Meganium', 'Typhlosion', 'Feraligatr', 'Totodile'] },
      { tier: 'blue',   label: 'Pokémon reclassified as Fairy-type in Gen 6', members: ['Clefairy', 'Jigglypuff', 'Snubbull', 'Togetic'] },
      { tier: 'purple', label: 'Sinnoh Lake Guardians (trio only)', members: ['Uxie', 'Mesprit', 'Azelf', 'Dialga'] },
    ]
  },
  // 21
  {
    groups: [
      { tier: 'yellow', label: 'Hoenn Starters', members: ['Treecko', 'Torchic', 'Mudkip', 'Blaziken'] },
      { tier: 'green',  label: 'Pokémon that evolve with a Water Stone', members: ['Staryu', 'Poliwhirl', 'Shellder', 'Lombre'] },
      { tier: 'blue',   label: 'Pokémon with Mold Breaker ability', members: ['Haxorus', 'Excadrill', 'Rampardos', 'Druddigon'] },
      { tier: 'purple', label: 'Ash vs Brock — their Pokémon in their first battle', members: ['Pikachu', 'Geodude', 'Onix', 'Zubat'] },
    ]
  },
  // 22
  {
    groups: [
      { tier: 'yellow', label: 'Pokémon that can learn HM Strength', members: ['Machamp', 'Golem', 'Snorlax', 'Tauros'] },
      { tier: 'green',  label: 'Pokémon with signature Gen 3 abilities', members: ['Slaking', 'Gardevoir', 'Blaziken', 'Shedinja'] },
      { tier: 'blue',   label: 'Pokémon that require high friendship to evolve', members: ['Togetic', 'Espeon', 'Umbreon', 'Chansey'] },
      { tier: 'purple', label: 'Pokémon whose shiny colors are drastically different', members: ['Gyarados', 'Dragonite', 'Metagross', 'Rapidash'] },
    ]
  },
  // 23
  {
    groups: [
      { tier: 'yellow', label: 'Bug/Flying-type Pokémon', members: ['Butterfree', 'Beautifly', 'Mothim', 'Masquerain'] },
      { tier: 'green',  label: 'Pikachu family', members: ['Pichu', 'Pikachu', 'Raichu', 'Plusle'] },
      { tier: 'blue',   label: 'Pokémon that evolve only at night', members: ['Eevee', 'Murkrow', 'Misdreavus', 'Sneasel'] },
      { tier: 'purple', label: 'Kanto Gym Leader signature Pokémon', members: ['Onix', 'Staryu', 'Arcanine', 'Clefable'] },
    ]
  },
  // 24
  {
    groups: [
      { tier: 'yellow', label: 'Electric-type Rodents (Pikaclones)', members: ['Pikachu', 'Plusle', 'Minun', 'Pachirisu'] },
      { tier: 'green',  label: 'Pokémon that can learn Earthquake', members: ['Golem', 'Sandslash', 'Rhydon', 'Nidoking'] },
      { tier: 'blue',   label: 'Pokémon found at Mt. Coronet', members: ['Graveler', 'Clefairy', 'Zubat', 'Bronzor'] },
      { tier: 'purple', label: 'Pokémon whose Pokédex entries contain extreme exaggerations', members: ['Machamp', 'Jynx', 'Steelix', 'Gyarados'] },
    ]
  },
  // 25
  {
    groups: [
      { tier: 'yellow', label: 'Pokémon in Super Smash Bros. Melee', members: ['Pikachu', 'Jigglypuff', 'Mewtwo', 'Pichu'] },
      { tier: 'green',  label: 'Pokémon whose names end in "-eon"', members: ['Vaporeon', 'Flareon', 'Jolteon', 'Umbreon'] },
      { tier: 'blue',   label: 'Pokémon appearing in both R/B and G/S routes', members: ['Abra', 'Geodude', 'Onix', 'Gastly'] },
      { tier: 'purple', label: 'Pokémon with the Truant or Pure Power ability', members: ['Meditite', 'Medicham', 'Slaking', 'Azumarill'] },
    ]
  },
  // 26
  {
    groups: [
      { tier: 'yellow', label: 'Pokémon with 1 HP (base)', members: ['Shedinja', 'Caterpie', 'Weedle', 'Magikarp'] },
      { tier: 'green',  label: 'Fastest base Speed in their generation', members: ['Deoxys', 'Ninjask', 'Pheromosa', 'Electrode'] },
      { tier: 'blue',   label: 'Pokémon that can use Transform or Copy Cat moves', members: ['Ditto', 'Mew', 'Smeargle', 'Zoroark'] },
      { tier: 'purple', label: 'Pokémon found by surfing in Kanto (FRLG)', members: ['Tentacool', 'Horsea', 'Krabby', 'Goldeen'] },
    ]
  },
  // 27
  {
    groups: [
      { tier: 'yellow', label: 'Dual Dragon-type Pokémon (non-legendary)', members: ['Dragonite', 'Altaria', 'Flygon', 'Salamence'] },
      { tier: 'green',  label: 'Gen 2 evolutions of Gen 1 Pokémon', members: ['Crobat', 'Steelix', 'Espeon', 'Scizor'] },
      { tier: 'blue',   label: 'Pokémon that can learn Whirlpool in HG/SS', members: ['Gyarados', 'Lapras', 'Marill', 'Feraligatr'] },
      { tier: 'purple', label: 'Pokémon that can learn Flamethrower but are not Fire-type', members: ['Charizard', 'Arcanine', 'Clefable', 'Magmar'] },
    ]
  },
  // 28
  {
    groups: [
      { tier: 'yellow', label: 'Paldea Starters', members: ['Sprigatito', 'Fuecoco', 'Quaxly', 'Meowscarada'] },
      { tier: 'green',  label: 'Paradox Pokémon (Ancient forms)', members: ['Great Tusk', 'Brute Bonnet', 'Slither Wing', 'Sandy Shocks'] },
      { tier: 'blue',   label: 'Pokémon with the Prankster ability', members: ['Murkrow', 'Sableye', 'Whimsicott', 'Klefki'] },
      { tier: 'purple', label: 'Johto starters and their signature Pokémon', members: ['Chikorita', 'Cyndaquil', 'Totodile', 'Togekiss'] },
    ]
  },
  // 29
  {
    groups: [
      { tier: 'yellow', label: 'Pokémon found by surfing in Kanto (Gen 1)', members: ['Magikarp', 'Tentacool', 'Shellder', 'Krabby'] },
      { tier: 'green',  label: 'Pokémon that can be caught in the Safari Zone (Kanto)', members: ['Scyther', 'Pinsir', 'Kangaskhan', 'Tauros'] },
      { tier: 'blue',   label: 'Pokémon whose Shiny forms are iconic or well-known', members: ['Charizard', 'Gyarados', 'Dragonite', 'Gardevoir'] },
      { tier: 'purple', label: 'Pokémon whose names rhyme with another Pokémon', members: ['Pikachu', 'Clefairy', 'Snorlax', 'Rapidash'] },
    ]
  },
];

// Return the puzzle as-is (data is pre-validated to have 16 unique members)
function sanitizePuzzle(puzzle) {
  return puzzle;
}

// ── State ───────────────────────────────────────────────────────────────────
let state = {
  puzzle: null,
  selected: [],        // names currently selected
  solvedGroups: [],    // group objects that have been solved
  strikes: 0,
  maxStrikes: 4,
  done: false,
};

// ── DOM helpers ─────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── Daily seed ──────────────────────────────────────────────────────────────
function todayIndex() {
  const d = new Date();
  const epoch = new Date(2024, 0, 1);
  const diff = Math.floor((d - epoch) / 86400000);
  return ((diff % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
}

// ── Token award ─────────────────────────────────────────────────────────────
function awardTokens(amount) {
  const inv = JSON.parse(localStorage.getItem('pokequiz_inventory') || '{}');
  inv.tokens = (inv.tokens || 0) + amount;
  localStorage.setItem('pokequiz_inventory', JSON.stringify(inv));
}

// ── Streak helpers ───────────────────────────────────────────────────────────
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function loadStreak() {
  return parseInt(localStorage.getItem('pokequiz_connections_streak') || '0', 10);
}

function saveStreak(val) {
  const cur = loadStreak();
  if (val > cur) localStorage.setItem('pokequiz_connections_streak', String(val));
}

function loadBest() {
  return parseInt(localStorage.getItem('pokequiz_connections_best') || '99', 10);
}

function saveBest(mistakes) {
  const cur = loadBest();
  if (mistakes < cur) localStorage.setItem('pokequiz_connections_best', String(mistakes));
}

// ── Shuffle ──────────────────────────────────────────────────────────────────
let shuffledOrder = [];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Render ───────────────────────────────────────────────────────────────────
function renderStrikes() {
  const balls = document.querySelectorAll('.conn-ball');
  balls.forEach((b, i) => {
    b.classList.toggle('used', i < state.strikes);
  });
}

function updateStats() {
  const streakEl = $('connStreak');
  const bestEl = $('connBest');
  if (streakEl) streakEl.textContent = loadStreak();
  if (bestEl) {
    const b = loadBest();
    bestEl.textContent = b === 99 ? '—' : b;
  }
}

function renderGrid() {
  const grid = $('connGrid');
  if (!grid) return;
  grid.innerHTML = '';

  // Remaining unsolved Pokémon
  const solved = new Set(state.solvedGroups.flatMap(g => g.members));
  const allMembers = state.puzzle.groups.flatMap(g => g.members);

  // Build or trim shuffled order to only remaining
  if (shuffledOrder.length === 0) {
    shuffledOrder = shuffleArray(allMembers);
  }
  const remaining = shuffledOrder.filter(m => !solved.has(m));

  for (const name of remaining) {
    const pill = document.createElement('button');
    pill.className = 'conn-pill';
    pill.textContent = name;
    pill.type = 'button';
    pill.dataset.name = name;
    if (state.selected.includes(name)) pill.classList.add('selected');
    pill.addEventListener('click', () => onPillClick(name));
    grid.appendChild(pill);
  }
}

function renderSolvedGroups() {
  const container = $('connSolvedGroups');
  if (!container) return;
  container.innerHTML = '';
  for (const g of state.solvedGroups) {
    const div = document.createElement('div');
    div.className = `conn-solved-group tier-${g.tier}`;
    div.innerHTML = `
      <div class="csg-label">${g.tier.toUpperCase()}</div>
      <div class="csg-title">${g.label}</div>
      <div class="csg-members">${g.members.join(' · ')}</div>
    `;
    container.appendChild(div);
  }
}

function setFeedback(msg) {
  const el = $('connFeedback');
  if (el) el.innerHTML = msg;
}

// ── Interactions ─────────────────────────────────────────────────────────────
function onPillClick(name) {
  if (state.done) return;
  const idx = state.selected.indexOf(name);
  if (idx === -1) {
    if (state.selected.length < 4) {
      state.selected.push(name);
    }
  } else {
    state.selected.splice(idx, 1);
  }
  renderGrid();
  const submitBtn = $('connSubmit');
  if (submitBtn) submitBtn.disabled = state.selected.length !== 4;
}

function onSubmit() {
  if (state.selected.length !== 4) return;

  // Check if any group matches
  const sel = new Set(state.selected);
  let matchGroup = null;

  for (const g of state.puzzle.groups) {
    if (state.solvedGroups.includes(g)) continue;
    const gSet = new Set(g.members);
    const intersection = [...sel].filter(s => gSet.has(s));
    if (intersection.length === 4) {
      matchGroup = g;
      break;
    }
  }

  if (matchGroup) {
    // Correct!
    state.solvedGroups.push(matchGroup);
    state.selected = [];
    setFeedback('');
    renderSolvedGroups();
    renderGrid();

    if (state.solvedGroups.length === 4) {
      finishGame(true);
    }
  } else {
    // Wrong — check for "one away"
    state.strikes++;
    renderStrikes();

    // Check one-away
    let oneAway = false;
    for (const g of state.puzzle.groups) {
      if (state.solvedGroups.includes(g)) continue;
      const gSet = new Set(g.members);
      const intersection = [...sel].filter(s => gSet.has(s));
      if (intersection.length === 3) { oneAway = true; break; }
    }

    // Shake selected pills
    document.querySelectorAll('.conn-pill.selected').forEach(p => {
      p.classList.remove('shake');
      void p.offsetWidth;
      p.classList.add('shake');
    });

    if (oneAway) {
      setFeedback('<span class="one-away-toast">One away!</span>');
    } else {
      setFeedback('Not quite — try again!');
    }

    if (state.strikes >= state.maxStrikes) {
      setTimeout(() => finishGame(false), 600);
      return;
    }
  }
}

function onDeselectAll() {
  state.selected = [];
  renderGrid();
  const submitBtn = $('connSubmit');
  if (submitBtn) submitBtn.disabled = true;
}

function finishGame(won) {
  state.done = true;
  const mistakes = state.strikes;

  // If lost, reveal all groups as solved
  if (!won) {
    state.solvedGroups = [...state.puzzle.groups];
    renderSolvedGroups();
    renderGrid();
  }

  const tokens = won ? 20 : 5;
  awardTokens(tokens);

  if (won) saveBest(mistakes);

  // Streak (simple: just increment on win)
  if (won) {
    const cur = loadStreak();
    saveStreak(cur + 1);
  }

  updateStats();

  // Show result screen
  setTimeout(() => {
    showResult(won, tokens, mistakes);
  }, won ? 500 : 1000);
}

const TIER_EMOJI = { yellow: '🟨', green: '🟩', blue: '🟦', purple: '🟪' };
const TIER_CLASS  = { yellow: 'sq-yellow', green: 'sq-green', blue: 'sq-blue', purple: 'sq-purple' };

function buildShareGrid(won) {
  const container = $('connShareGrid');
  if (!container) return;
  container.innerHTML = '';

  // Build rows: each row is one "guess attempt" that maps to a solved group tier
  // For simplicity, show solved groups in solve order + unsolved at bottom (on loss)
  const groups = state.puzzle.groups;
  const solvedTiers = state.solvedGroups.map(g => g.tier);
  const allTiers = [...solvedTiers];

  // Add unsolved groups on loss (shown in puzzle order)
  if (!won) {
    for (const g of groups) {
      if (!state.solvedGroups.includes(g)) allTiers.push(g.tier);
    }
  }

  for (const tier of allTiers) {
    const row = document.createElement('div');
    row.className = 'conn-share-row';
    for (let i = 0; i < 4; i++) {
      const sq = document.createElement('div');
      sq.className = `conn-share-square ${TIER_CLASS[tier] || ''}`;
      sq.textContent = TIER_EMOJI[tier] || '⬜';
      row.appendChild(sq);
    }
    container.appendChild(row);
  }
}

// ── Leaderboard submit ───────────────────────────────────────────────────────
let submitted = false;
function postLeaderboard() {
  if (submitted) return;
  submitted = true;
  const name = (sessionStorage.getItem('playerName') || localStorage.getItem('playerName') || '').trim();
  const pid = (window.PokeProfile && window.PokeProfile.playerId) || localStorage.getItem('pokequiz_player_id') || '';
  const streak = loadStreak();
  if (!name || !pid || streak <= 0) return;
  window.PokeUtil.submitScore({ game: 'connections', name, score: streak, playerId: pid });
}

function showResult(won, tokens, mistakes) {
  postLeaderboard();

  const gameSection = $('connGame');
  const resultSection = $('connResult');
  if (gameSection) gameSection.hidden = true;
  if (resultSection) resultSection.hidden = false;

  const emojiEl = $('connResultEmoji');
  if (emojiEl) emojiEl.textContent = won ? '🎉' : '😢';

  const title = $('connResultTitle');
  if (title) title.textContent = won ? 'Connections Complete!' : 'Better luck next time!';

  buildShareGrid(won);

  const streakEl = $('connResultStreak');
  if (streakEl) streakEl.textContent = loadStreak();

  const bestEl = $('connResultBest');
  if (bestEl) {
    const b = loadBest();
    bestEl.textContent = b === 99 ? '—' : `${b} mistake${b === 1 ? '' : 's'}`;
  }

  const mistakesEl = $('connResultMistakes');
  if (mistakesEl) mistakesEl.textContent = `${mistakes} mistake${mistakes === 1 ? '' : 's'}`;

  const tokenEl = $('connResultTokens');
  if (tokenEl) {
    tokenEl.innerHTML = `<span class="token-burst">🪙 +${tokens} Tokens earned!</span>`;
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────
function init() {
  const idx = todayIndex();
  const raw = PUZZLES[idx];
  state.puzzle = sanitizePuzzle(raw);

  updateStats();
  renderStrikes();
  renderGrid();

  const submitBtn = $('connSubmit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.addEventListener('click', onSubmit);
  }

  const deselectBtn = $('connDeselect');
  if (deselectBtn) deselectBtn.addEventListener('click', onDeselectAll);

  const shuffleBtn = $('connShuffle');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      const solved = new Set(state.solvedGroups.flatMap(g => g.members));
      const remaining = shuffledOrder.filter(m => !solved.has(m));
      const reshuffled = shuffleArray(remaining);
      // Rebuild shuffledOrder: solved positions stay removed, rebuild remaining order
      shuffledOrder = [...shuffledOrder.filter(m => solved.has(m)), ...reshuffled];
      renderGrid();
    });
  }

  const playAgainBtn = $('connPlayAgain');
  if (playAgainBtn) playAgainBtn.addEventListener('click', () => {
    window.location.href = 'puzzle.html';
  });
}

document.addEventListener('DOMContentLoaded', init);
