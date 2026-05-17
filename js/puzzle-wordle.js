/* puzzle-wordle.js — Pokédle: Guess the daily Pokémon */
'use strict';

// ── Type lookup (Gen 1–2, first 251) ────────────────────────────────────────
const TYPE_DATA = {
  // Gen 1 (1–151)
  'Bulbasaur':   ['Grass','Poison'],
  'Ivysaur':     ['Grass','Poison'],
  'Venusaur':    ['Grass','Poison'],
  'Charmander':  ['Fire'],
  'Charmeleon':  ['Fire'],
  'Charizard':   ['Fire','Flying'],
  'Squirtle':    ['Water'],
  'Wartortle':   ['Water'],
  'Blastoise':   ['Water'],
  'Caterpie':    ['Bug'],
  'Metapod':     ['Bug'],
  'Butterfree':  ['Bug','Flying'],
  'Weedle':      ['Bug','Poison'],
  'Kakuna':      ['Bug','Poison'],
  'Beedrill':    ['Bug','Poison'],
  'Pidgey':      ['Normal','Flying'],
  'Pidgeotto':   ['Normal','Flying'],
  'Pidgeot':     ['Normal','Flying'],
  'Rattata':     ['Normal'],
  'Raticate':    ['Normal'],
  'Spearow':     ['Normal','Flying'],
  'Fearow':      ['Normal','Flying'],
  'Ekans':       ['Poison'],
  'Arbok':       ['Poison'],
  'Pikachu':     ['Electric'],
  'Raichu':      ['Electric'],
  'Sandshrew':   ['Ground'],
  'Sandslash':   ['Ground'],
  'Nidoran♀':   ['Poison'],
  'Nidorina':    ['Poison'],
  'Nidoqueen':   ['Poison','Ground'],
  'Nidoran♂':   ['Poison'],
  'Nidorino':    ['Poison'],
  'Nidoking':    ['Poison','Ground'],
  'Clefairy':    ['Fairy'],
  'Clefable':    ['Fairy'],
  'Vulpix':      ['Fire'],
  'Ninetales':   ['Fire'],
  'Jigglypuff':  ['Normal','Fairy'],
  'Wigglytuff':  ['Normal','Fairy'],
  'Zubat':       ['Poison','Flying'],
  'Golbat':      ['Poison','Flying'],
  'Oddish':      ['Grass','Poison'],
  'Gloom':       ['Grass','Poison'],
  'Vileplume':   ['Grass','Poison'],
  'Paras':       ['Bug','Grass'],
  'Parasect':    ['Bug','Grass'],
  'Venonat':     ['Bug','Poison'],
  'Venomoth':    ['Bug','Poison'],
  'Diglett':     ['Ground'],
  'Dugtrio':     ['Ground'],
  'Meowth':      ['Normal'],
  'Persian':     ['Normal'],
  'Psyduck':     ['Water'],
  'Golduck':     ['Water'],
  'Mankey':      ['Fighting'],
  'Primeape':    ['Fighting'],
  'Growlithe':   ['Fire'],
  'Arcanine':    ['Fire'],
  'Poliwag':     ['Water'],
  'Poliwhirl':   ['Water'],
  'Poliwrath':   ['Water','Fighting'],
  'Abra':        ['Psychic'],
  'Kadabra':     ['Psychic'],
  'Alakazam':    ['Psychic'],
  'Machop':      ['Fighting'],
  'Machoke':     ['Fighting'],
  'Machamp':     ['Fighting'],
  'Bellsprout':  ['Grass','Poison'],
  'Weepinbell':  ['Grass','Poison'],
  'Victreebel':  ['Grass','Poison'],
  'Tentacool':   ['Water','Poison'],
  'Tentacruel':  ['Water','Poison'],
  'Geodude':     ['Rock','Ground'],
  'Graveler':    ['Rock','Ground'],
  'Golem':       ['Rock','Ground'],
  'Ponyta':      ['Fire'],
  'Rapidash':    ['Fire'],
  'Slowpoke':    ['Water','Psychic'],
  'Slowbro':     ['Water','Psychic'],
  'Magnemite':   ['Electric','Steel'],
  'Magneton':    ['Electric','Steel'],
  "Farfetch'd":  ['Normal','Flying'],
  'Doduo':       ['Normal','Flying'],
  'Dodrio':      ['Normal','Flying'],
  'Seel':        ['Water'],
  'Dewgong':     ['Water','Ice'],
  'Grimer':      ['Poison'],
  'Muk':         ['Poison'],
  'Shellder':    ['Water'],
  'Cloyster':    ['Water','Ice'],
  'Gastly':      ['Ghost','Poison'],
  'Haunter':     ['Ghost','Poison'],
  'Gengar':      ['Ghost','Poison'],
  'Onix':        ['Rock','Ground'],
  'Drowzee':     ['Psychic'],
  'Hypno':       ['Psychic'],
  'Krabby':      ['Water'],
  'Kingler':     ['Water'],
  'Voltorb':     ['Electric'],
  'Electrode':   ['Electric'],
  'Exeggcute':   ['Grass','Psychic'],
  'Exeggutor':   ['Grass','Psychic'],
  'Cubone':      ['Ground'],
  'Marowak':     ['Ground'],
  'Hitmonlee':   ['Fighting'],
  'Hitmonchan':  ['Fighting'],
  'Lickitung':   ['Normal'],
  'Koffing':     ['Poison'],
  'Weezing':     ['Poison'],
  'Rhyhorn':     ['Ground','Rock'],
  'Rhydon':      ['Ground','Rock'],
  'Chansey':     ['Normal'],
  'Tangela':     ['Grass'],
  'Kangaskhan':  ['Normal'],
  'Horsea':      ['Water'],
  'Seadra':      ['Water'],
  'Goldeen':     ['Water'],
  'Seaking':     ['Water'],
  'Staryu':      ['Water'],
  'Starmie':     ['Water','Psychic'],
  'Mr. Mime':    ['Psychic','Fairy'],
  'Scyther':     ['Bug','Flying'],
  'Jynx':        ['Ice','Psychic'],
  'Electabuzz':  ['Electric'],
  'Magmar':      ['Fire'],
  'Pinsir':      ['Bug'],
  'Tauros':      ['Normal'],
  'Magikarp':    ['Water'],
  'Gyarados':    ['Water','Flying'],
  'Lapras':      ['Water','Ice'],
  'Ditto':       ['Normal'],
  'Eevee':       ['Normal'],
  'Vaporeon':    ['Water'],
  'Jolteon':     ['Electric'],
  'Flareon':     ['Fire'],
  'Porygon':     ['Normal'],
  'Omanyte':     ['Rock','Water'],
  'Omastar':     ['Rock','Water'],
  'Kabuto':      ['Rock','Water'],
  'Kabutops':    ['Rock','Water'],
  'Aerodactyl':  ['Rock','Flying'],
  'Snorlax':     ['Normal'],
  'Articuno':    ['Ice','Flying'],
  'Zapdos':      ['Electric','Flying'],
  'Moltres':     ['Fire','Flying'],
  'Dratini':     ['Dragon'],
  'Dragonair':   ['Dragon'],
  'Dragonite':   ['Dragon','Flying'],
  'Mewtwo':      ['Psychic'],
  'Mew':         ['Psychic'],
  // Gen 2 (152–251)
  'Chikorita':   ['Grass'],
  'Bayleef':     ['Grass'],
  'Meganium':    ['Grass'],
  'Cyndaquil':   ['Fire'],
  'Quilava':     ['Fire'],
  'Typhlosion':  ['Fire'],
  'Totodile':    ['Water'],
  'Croconaw':    ['Water'],
  'Feraligatr':  ['Water'],
  'Sentret':     ['Normal'],
  'Furret':      ['Normal'],
  'Hoothoot':    ['Normal','Flying'],
  'Noctowl':     ['Normal','Flying'],
  'Ledyba':      ['Bug','Flying'],
  'Ledian':      ['Bug','Flying'],
  'Spinarak':    ['Bug','Poison'],
  'Ariados':     ['Bug','Poison'],
  'Crobat':      ['Poison','Flying'],
  'Chinchou':    ['Water','Electric'],
  'Lanturn':     ['Water','Electric'],
  'Pichu':       ['Electric'],
  'Cleffa':      ['Fairy'],
  'Igglybuff':   ['Normal','Fairy'],
  'Togepi':      ['Fairy'],
  'Togetic':     ['Fairy','Flying'],
  'Natu':        ['Psychic','Flying'],
  'Xatu':        ['Psychic','Flying'],
  'Mareep':      ['Electric'],
  'Flaaffy':     ['Electric'],
  'Ampharos':    ['Electric'],
  'Bellossom':   ['Grass'],
  'Marill':      ['Water','Fairy'],
  'Azumarill':   ['Water','Fairy'],
  'Sudowoodo':   ['Rock'],
  'Politoed':    ['Water'],
  'Hoppip':      ['Grass','Flying'],
  'Skiploom':    ['Grass','Flying'],
  'Jumpluff':    ['Grass','Flying'],
  'Aipom':       ['Normal'],
  'Sunkern':     ['Grass'],
  'Sunflora':    ['Grass'],
  'Yanma':       ['Bug','Flying'],
  'Wooper':      ['Water','Ground'],
  'Quagsire':    ['Water','Ground'],
  'Espeon':      ['Psychic'],
  'Umbreon':     ['Dark'],
  'Murkrow':     ['Dark','Flying'],
  'Slowking':    ['Water','Psychic'],
  'Misdreavus':  ['Ghost'],
  'Unown':       ['Psychic'],
  'Wobbuffet':   ['Psychic'],
  'Girafarig':   ['Normal','Psychic'],
  'Pineco':      ['Bug'],
  'Forretress':  ['Bug','Steel'],
  'Dunsparce':   ['Normal'],
  'Gligar':      ['Ground','Flying'],
  'Steelix':     ['Steel','Ground'],
  'Snubbull':    ['Fairy'],
  'Granbull':    ['Fairy'],
  'Qwilfish':    ['Water','Poison'],
  'Scizor':      ['Bug','Steel'],
  'Shuckle':     ['Bug','Rock'],
  'Heracross':   ['Bug','Fighting'],
  'Sneasel':     ['Dark','Ice'],
  'Teddiursa':   ['Normal'],
  'Ursaring':    ['Normal'],
  'Slugma':      ['Fire'],
  'Magcargo':    ['Fire','Rock'],
  'Swinub':      ['Ice','Ground'],
  'Piloswine':   ['Ice','Ground'],
  'Corsola':     ['Water','Rock'],
  'Remoraid':    ['Water'],
  'Octillery':   ['Water'],
  'Delibird':    ['Ice','Flying'],
  'Mantine':     ['Water','Flying'],
  'Skarmory':    ['Steel','Flying'],
  'Houndour':    ['Dark','Fire'],
  'Houndoom':    ['Dark','Fire'],
  'Kingdra':     ['Water','Dragon'],
  'Phanpy':      ['Ground'],
  'Donphan':     ['Ground'],
  'Porygon2':    ['Normal'],
  'Stantler':    ['Normal'],
  'Smeargle':    ['Normal'],
  'Tyrogue':     ['Fighting'],
  'Hitmontop':   ['Fighting'],
  'Smoochum':    ['Ice','Psychic'],
  'Elekid':      ['Electric'],
  'Magby':       ['Fire'],
  'Miltank':     ['Normal'],
  'Blissey':     ['Normal'],
  'Raikou':      ['Electric'],
  'Entei':       ['Fire'],
  'Suicune':     ['Water'],
  'Larvitar':    ['Rock','Ground'],
  'Pupitar':     ['Rock','Ground'],
  'Tyranitar':   ['Rock','Dark'],
  'Lugia':       ['Psychic','Flying'],
  'Ho-Oh':       ['Fire','Flying'],
  'Celebi':      ['Psychic','Grass'],
};

// Height categories
const HEIGHT_CATS = ['Tiny', 'Small', 'Medium', 'Large', 'Huge'];
// Height data: id -> height in meters (sampled subset for well-known Pokémon)
const HEIGHT_DATA = {
  1:0.7, 2:1.0, 3:2.0, 4:0.6, 5:1.1, 6:1.7,
  7:0.5, 8:1.0, 9:1.6, 10:0.3, 11:0.7, 12:1.1,
  13:0.3, 14:0.6, 15:1.0, 16:0.3, 17:1.1, 18:1.5,
  19:0.3, 20:0.7, 21:0.3, 22:1.2, 23:2.0, 24:3.5,
  25:0.4, 26:0.8, 27:0.6, 28:1.0, 29:0.4, 30:0.8,
  31:1.3, 32:0.5, 33:0.9, 34:1.4, 35:0.6, 36:1.3,
  37:0.6, 38:1.1, 39:0.5, 40:1.0, 41:0.8, 42:1.6,
  43:0.5, 44:0.6, 45:1.2, 46:0.3, 47:1.0, 48:1.0,
  49:1.5, 50:0.2, 51:0.7, 52:0.4, 53:1.0, 54:0.8,
  55:1.7, 56:0.5, 57:1.0, 58:0.7, 59:1.9, 60:0.6,
  61:1.2, 62:1.3, 63:0.9, 64:1.3, 65:1.5, 66:0.8,
  67:1.5, 68:1.6, 69:0.7, 70:1.0, 71:1.7, 72:0.9,
  73:1.6, 74:0.4, 75:1.0, 76:1.4, 77:1.0, 78:1.7,
  79:1.2, 80:1.6, 81:0.3, 82:1.0, 83:0.8, 84:1.4,
  85:1.8, 86:1.1, 87:1.7, 88:0.9, 89:1.8, 90:0.3,
  91:1.5, 92:1.3, 93:1.6, 94:1.5, 95:8.8, 96:1.0,
  97:1.6, 98:0.4, 99:1.3, 100:0.5, 101:1.2, 102:0.4,
  103:2.0, 104:0.4, 105:1.0, 106:1.5, 107:1.4, 108:1.2,
  109:0.6, 110:1.2, 111:1.0, 112:1.9, 113:1.1, 114:1.0,
  115:2.2, 116:0.4, 117:1.2, 118:0.6, 119:1.3, 120:0.8,
  121:1.1, 122:1.3, 123:1.5, 124:1.4, 125:1.1, 126:1.3,
  127:1.5, 128:1.4, 129:0.9, 130:6.5, 131:2.5, 132:0.3,
  133:0.3, 134:1.0, 135:0.8, 136:0.9, 137:0.8, 138:0.4,
  139:1.0, 140:0.5, 141:1.3, 142:1.8, 143:2.1, 144:1.7,
  145:1.6, 146:2.0, 147:1.8, 148:4.0, 149:2.2, 150:2.0,
  151:0.4,
  152:0.9, 155:0.5, 158:0.6, 172:0.3, 175:0.3, 179:0.6,
  183:0.4, 185:1.2, 194:0.4, 196:0.9, 197:1.0, 198:0.5,
  200:0.6, 202:1.3, 206:1.4, 209:0.6, 212:1.8, 213:0.6,
  214:1.5, 216:0.6, 218:0.7, 220:0.4, 222:0.6, 225:0.9,
  226:2.1, 227:1.7, 228:0.6, 229:1.5, 231:0.5, 241:1.2,
  242:1.5, 243:1.9, 244:2.1, 245:2.3, 246:0.6, 247:1.2,
  248:2.0, 249:5.2, 250:3.8, 251:0.6,
};

// Legendary/Mythical set (Pokémon IDs)
const LEGENDARY_IDS = new Set([
  144,145,146,150,151,
  243,244,245,249,250,251,
  377,378,379,380,381,382,383,384,385,386,
  480,481,482,483,484,485,486,487,488,489,490,491,492,493,
  494,638,639,640,641,642,643,644,645,646,647,648,649,
  716,717,718,719,720,721,
  785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,
  888,889,890,891,892,893,894,895,896,897,898,
  905,1007,1008,
  1001,1002,1003,1004,1009,1010,1017,1023,1024,1025,
]);

// ── Gen ranges ───────────────────────────────────────────────────────────────
function getGen(id) {
  if (id <= 151)  return 1;
  if (id <= 251)  return 2;
  if (id <= 386)  return 3;
  if (id <= 493)  return 4;
  if (id <= 649)  return 5;
  if (id <= 721)  return 6;
  if (id <= 809)  return 7;
  if (id <= 905)  return 8;
  return 9;
}

// ── Height helpers ───────────────────────────────────────────────────────────
function heightCat(id, heightM) {
  const h = heightM !== undefined ? heightM : HEIGHT_DATA[id];
  if (h === undefined) return null;
  if (h < 0.5)  return 0; // Tiny
  if (h < 1.0)  return 1; // Small
  if (h < 2.0)  return 2; // Medium
  if (h < 4.0)  return 3; // Large
  return 4;                // Huge
}

// ── Daily seed ───────────────────────────────────────────────────────────────
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  h = Math.abs(h);
  return h;
}

// ── State ────────────────────────────────────────────────────────────────────
let allPokemon = [];  // [{id, name}, ...]
let mystery = null;   // {id, name}
let guesses = [];     // list of guess results
let maxGuesses = 6;
let done = false;
let acSelected = -1;  // autocomplete selection index

// ── Token award ──────────────────────────────────────────────────────────────
function awardTokens(amount) {
  const inv = JSON.parse(localStorage.getItem('pokequiz_inventory') || '{}');
  inv.tokens = (inv.tokens || 0) + amount;
  localStorage.setItem('pokequiz_inventory', JSON.stringify(inv));
}

// ── Streak ───────────────────────────────────────────────────────────────────
function loadStreak() {
  return parseInt(localStorage.getItem('pokequiz_wordle_streak') || '0', 10);
}
function saveStreak(v) {
  const cur = loadStreak();
  if (v > cur) localStorage.setItem('pokequiz_wordle_streak', String(v));
}

// ── Hint logic ───────────────────────────────────────────────────────────────
function getHints(guessedId, guessedName) {
  const mId = mystery.id;
  const mName = mystery.name;

  const gTypes = TYPE_DATA[guessedName] || null;
  const mTypes = TYPE_DATA[mName] || null;

  // Gen
  const gGen = getGen(guessedId);
  const mGen = getGen(mId);
  let genStatus;
  if (gGen === mGen) genStatus = 'correct';
  else if (Math.abs(gGen - mGen) <= 1) genStatus = 'close';
  else genStatus = 'wrong';

  // Type 1
  let t1Status = 'wrong';
  if (gTypes && mTypes) {
    const gT1 = gTypes[0];
    const mT1 = mTypes[0];
    if (gT1 === mT1) t1Status = 'correct';
    else if (mTypes.includes(gT1) || gTypes.some(t => mTypes.includes(t))) t1Status = 'close';
  } else if (!gTypes || !mTypes) {
    t1Status = 'close'; // unknown, partial credit
  }

  // Type 2
  const gT2 = gTypes ? gTypes[1] : undefined;
  const mT2 = mTypes ? mTypes[1] : undefined;
  let t2Status = 'wrong';
  if (!gT2 && !mT2) {
    t2Status = 'correct'; // both mono-type
  } else if (gT2 && mT2) {
    if (gT2 === mT2) t2Status = 'correct';
    else if (mTypes && mTypes.includes(gT2)) t2Status = 'close';
    else if (gTypes && gTypes.some(t => mTypes && mTypes.includes(t))) t2Status = 'close';
  } else if (!gT2 || !mT2) {
    // one has type 2, other doesn't
    if (gTypes && mTypes && gTypes.some(t => mTypes.includes(t))) t2Status = 'close';
    else t2Status = 'wrong';
  }

  // Height
  const gCatIdx = heightCat(guessedId);
  const mCatIdx = heightCat(mId);
  let htStatus = 'wrong';
  let htLabel = gCatIdx !== null ? HEIGHT_CATS[gCatIdx] : '?';
  if (gCatIdx === null || mCatIdx === null) {
    htStatus = 'close';
  } else if (gCatIdx === mCatIdx) {
    htStatus = 'correct';
  } else if (Math.abs(gCatIdx - mCatIdx) <= 1) {
    htStatus = 'close';
  }

  // Legendary
  const gLeg = LEGENDARY_IDS.has(guessedId);
  const mLeg = LEGENDARY_IDS.has(mId);
  const legStatus = gLeg === mLeg ? 'correct' : 'wrong';

  return {
    name: guessedName,
    genStatus,  gGen,
    t1Status,   t1: gTypes ? gTypes[0] : '?',
    t2Status,   t2: gT2 || '—',
    htStatus,   htLabel,
    legStatus,  isLeg: gLeg,
  };
}

// ── DOM helpers ──────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

function setFeedback(msg) {
  const el = $('wordleFeedback');
  if (el) el.innerHTML = msg;
}

function renderRemaining() {
  const el = $('wordleRemaining');
  if (!el) return;
  const left = maxGuesses - guesses.length;
  if (done) { el.textContent = ''; return; }
  el.innerHTML = `<strong>${left}</strong> guess${left === 1 ? '' : 'es'} remaining`;
}

function hintCell(status, topText, botText) {
  const cls = status === 'correct' ? 'hint-correct' : status === 'close' ? 'hint-close' : 'hint-wrong';
  const emoji = status === 'correct' ? '🟩' : status === 'close' ? '🟡' : '🟥';
  return `<div class="hint-cell ${cls}"><span class="hint-emoji">${emoji}</span><span class="hint-val">${botText}</span></div>`;
}

function renderGuesses() {
  const tbody = $('wordleTbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  for (const h of guesses) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${h.name}</td>
      <td>${hintCell(h.genStatus, 'Gen', `Gen ${h.gGen}`)}</td>
      <td>${hintCell(h.t1Status, 'Type 1', h.t1)}</td>
      <td>${hintCell(h.t2Status, 'Type 2', h.t2)}</td>
      <td>${hintCell(h.htStatus, 'Height', h.htLabel)}</td>
      <td>${hintCell(h.legStatus, 'Legendary', h.isLeg ? 'Yes' : 'No')}</td>
    `;
    tbody.appendChild(tr);
  }

  if (guesses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="wordle-empty">Make your first guess above!</td></tr>`;
  }
}

// ── Autocomplete ─────────────────────────────────────────────────────────────
let acFiltered = [];

function updateAutocomplete(query) {
  const dropdown = $('wordleAC');
  if (!dropdown) return;
  if (!query || query.length < 1) {
    dropdown.hidden = true;
    acFiltered = [];
    return;
  }

  const q = query.toLowerCase();
  const alreadyGuessed = new Set(guesses.map(g => g.name.toLowerCase()));

  acFiltered = allPokemon
    .filter(p => {
      if (alreadyGuessed.has(p.name.toLowerCase())) return false;
      return p.name.toLowerCase().startsWith(q) ||
             (p.aliases && p.aliases.some(a => a.toLowerCase().startsWith(q)));
    })
    .slice(0, 8);

  if (acFiltered.length === 0) {
    dropdown.hidden = true;
    return;
  }

  dropdown.hidden = false;
  dropdown.innerHTML = '';
  acSelected = -1;
  acFiltered.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'wordle-autocomplete-item';
    item.textContent = p.name;
    item.addEventListener('mousedown', e => {
      e.preventDefault();
      selectAutocomplete(i);
    });
    dropdown.appendChild(item);
  });
}

function selectAutocomplete(idx) {
  if (idx < 0 || idx >= acFiltered.length) return;
  const input = $('wordleInput');
  if (input) input.value = acFiltered[idx].name;
  const dropdown = $('wordleAC');
  if (dropdown) dropdown.hidden = true;
  acFiltered = [];
  acSelected = -1;
}

// ── Submit guess ──────────────────────────────────────────────────────────────
function submitGuess(rawName) {
  if (done) return;
  const name = rawName.trim();
  if (!name) return;

  // Find matching Pokémon
  const match = allPokemon.find(p =>
    p.name.toLowerCase() === name.toLowerCase() ||
    (p.aliases && p.aliases.some(a => a.toLowerCase() === name.toLowerCase()))
  );

  if (!match) {
    setFeedback('Unknown Pokémon — check spelling!');
    return;
  }

  // Already guessed?
  if (guesses.some(g => g.name.toLowerCase() === match.name.toLowerCase())) {
    setFeedback('Already guessed!');
    return;
  }

  setFeedback('');
  const hints = getHints(match.id, match.name);
  guesses.push(hints);

  const input = $('wordleInput');
  if (input) input.value = '';
  const dropdown = $('wordleAC');
  if (dropdown) dropdown.hidden = true;

  renderGuesses();
  renderRemaining();

  // Win check
  if (match.name.toLowerCase() === mystery.name.toLowerCase()) {
    done = true;
    const tokens = 15;
    awardTokens(tokens);
    saveStreak(loadStreak() + 1);
    saveResult(true, guesses.length);
    setTimeout(() => showResult(true, tokens, guesses.length), 400);
    return;
  }

  // Loss check
  if (guesses.length >= maxGuesses) {
    done = true;
    const tokens = 5;
    awardTokens(tokens);
    saveResult(false, guesses.length);
    setTimeout(() => showResult(false, tokens, guesses.length), 400);
  }
}

// ── Persist today's result ───────────────────────────────────────────────────
function saveResult(won, guessCount) {
  const key = `pokequiz_wordle_${getTodayStr()}`;
  localStorage.setItem(key, JSON.stringify({ won, guessCount }));
}

// ── Result screen ─────────────────────────────────────────────────────────────
function showResult(won, tokens, guessCount) {
  const gameSection = $('wordleGame');
  const resultSection = $('wordleResult');
  if (gameSection) gameSection.hidden = true;
  if (resultSection) resultSection.hidden = false;

  const title = $('wordleResultTitle');
  if (title) title.textContent = won ? `Got it in ${guessCount}!` : 'Better luck tomorrow!';

  const answerEl = $('wordleResultAnswer');
  if (answerEl) {
    answerEl.innerHTML = won
      ? `The answer was <strong>${mystery.name}</strong>`
      : `The answer was <strong>${mystery.name}</strong> — try again tomorrow!`;
  }

  const streakEl = $('wordleResultStreak');
  if (streakEl) streakEl.textContent = loadStreak();

  const guessesEl = $('wordleResultGuesses');
  if (guessesEl) guessesEl.textContent = won ? guessCount : '✗';

  const tokenEl = $('wordleResultTokens');
  if (tokenEl) tokenEl.innerHTML = `<span class="token-burst">+${tokens} Tokens earned!</span>`;
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  // Load Pokémon list
  try {
    const res = await fetch('js/pokemon-data.json');
    allPokemon = await res.json();
  } catch (e) {
    console.error('Failed to load Pokémon data', e);
    return;
  }

  // Pick today's mystery Pokémon (first 809 for well-known pool)
  const pool = allPokemon.filter(p => p.id <= 809);
  const todayKey = getTodayStr();
  const idx = seededRandom(todayKey) % pool.length;
  mystery = pool[idx];

  // Check if already played today
  const savedKey = `pokequiz_wordle_${todayKey}`;
  const saved = localStorage.getItem(savedKey);
  // (we still allow re-play in the same session for UX simplicity)

  // Update stats display
  const streakEl = $('wordleStatStreak');
  if (streakEl) streakEl.textContent = loadStreak();

  renderGuesses();
  renderRemaining();

  // Input events
  const input = $('wordleInput');
  if (input) {
    input.addEventListener('input', () => updateAutocomplete(input.value));
    input.addEventListener('keydown', e => {
      const dropdown = $('wordleAC');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        acSelected = Math.min(acSelected + 1, acFiltered.length - 1);
        highlightAC();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        acSelected = Math.max(acSelected - 1, -1);
        highlightAC();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (acSelected >= 0 && acFiltered.length > 0) {
          selectAutocomplete(acSelected);
        } else {
          submitGuess(input.value);
        }
      } else if (e.key === 'Escape') {
        if (dropdown) dropdown.hidden = true;
        acFiltered = [];
        acSelected = -1;
      }
    });
    input.addEventListener('blur', () => {
      setTimeout(() => {
        const dropdown = $('wordleAC');
        if (dropdown) dropdown.hidden = true;
      }, 150);
    });
  }

  const guessBtn = $('wordleGuessBtn');
  if (guessBtn) {
    guessBtn.addEventListener('click', () => {
      const inp = $('wordleInput');
      submitGuess(inp ? inp.value : '');
    });
  }

  const backBtn = $('wordlePlayAgain');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'puzzle.html';
    });
  }
}

function highlightAC() {
  const items = document.querySelectorAll('.wordle-autocomplete-item');
  items.forEach((el, i) => {
    el.classList.toggle('active', i === acSelected);
    if (i === acSelected) {
      const input = $('wordleInput');
      if (input && acFiltered[i]) input.value = acFiltered[i].name;
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
