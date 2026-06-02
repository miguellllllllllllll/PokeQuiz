#!/usr/bin/env node
/**
 * balance-kanto.js
 *
 * Rewrites kanto-part2.js with balanced weights:
 * - Keeps all w3 assignments exactly as-is
 * - Rebuilds w2 (5 per answer) and w1 (12 per answer)
 * - Every Pokémon gets exactly 5 w2 and 12 w1 assignments
 * - Uses type/trait similarity for thematic coherence
 */

const fs = require('fs');

// All 151 Pokémon with their types (for thematic grouping)
const ALL_MON = [
  // id, key, types[]
  [1,   'bulbasaur',  ['grass','poison']],
  [2,   'ivysaur',    ['grass','poison']],
  [3,   'venusaur',   ['grass','poison']],
  [4,   'charmander', ['fire']],
  [5,   'charmeleon', ['fire']],
  [6,   'charizard',  ['fire','flying']],
  [7,   'squirtle',   ['water']],
  [8,   'wartortle',  ['water']],
  [9,   'blastoise',  ['water']],
  [10,  'caterpie',   ['bug']],
  [11,  'metapod',    ['bug']],
  [12,  'butterfree', ['bug','flying']],
  [13,  'weedle',     ['bug','poison']],
  [14,  'kakuna',     ['bug','poison']],
  [15,  'beedrill',   ['bug','poison']],
  [16,  'pidgey',     ['normal','flying']],
  [17,  'pidgeotto',  ['normal','flying']],
  [18,  'pidgeot',    ['normal','flying']],
  [19,  'rattata',    ['normal']],
  [20,  'raticate',   ['normal']],
  [21,  'spearow',    ['normal','flying']],
  [22,  'fearow',     ['normal','flying']],
  [23,  'ekans',      ['poison']],
  [24,  'arbok',      ['poison']],
  [25,  'pikachu',    ['electric']],
  [26,  'raichu',     ['electric']],
  [27,  'sandshrew',  ['ground']],
  [28,  'sandslash',  ['ground']],
  [29,  'nidoranF',   ['poison']],
  [30,  'nidorina',   ['poison']],
  [31,  'nidoqueen',  ['poison','ground']],
  [32,  'nidoranM',   ['poison']],
  [33,  'nidorino',   ['poison']],
  [34,  'nidoking',   ['poison','ground']],
  [35,  'clefairy',   ['normal']],
  [36,  'clefable',   ['normal']],
  [37,  'vulpix',     ['fire']],
  [38,  'ninetales',  ['fire']],
  [39,  'jigglypuff', ['normal']],
  [40,  'wigglytuff', ['normal']],
  [41,  'zubat',      ['poison','flying']],
  [42,  'golbat',     ['poison','flying']],
  [43,  'oddish',     ['grass','poison']],
  [44,  'gloom',      ['grass','poison']],
  [45,  'vileplume',  ['grass','poison']],
  [46,  'paras',      ['bug','grass']],
  [47,  'parasect',   ['bug','grass']],
  [48,  'venonat',    ['bug','poison']],
  [49,  'venomoth',   ['bug','poison']],
  [50,  'diglett',    ['ground']],
  [51,  'dugtrio',    ['ground']],
  [52,  'meowth',     ['normal']],
  [53,  'persian',    ['normal']],
  [54,  'psyduck',    ['water']],
  [55,  'golduck',    ['water']],
  [56,  'mankey',     ['fighting']],
  [57,  'primeape',   ['fighting']],
  [58,  'growlithe',  ['fire']],
  [59,  'arcanine',   ['fire']],
  [60,  'poliwag',    ['water']],
  [61,  'poliwhirl',  ['water']],
  [62,  'poliwrath',  ['water','fighting']],
  [63,  'abra',       ['psychic']],
  [64,  'kadabra',    ['psychic']],
  [65,  'alakazam',   ['psychic']],
  [66,  'machop',     ['fighting']],
  [67,  'machoke',    ['fighting']],
  [68,  'machamp',    ['fighting']],
  [69,  'bellsprout', ['grass','poison']],
  [70,  'weepinbell', ['grass','poison']],
  [71,  'victreebel', ['grass','poison']],
  [72,  'tentacool',  ['water','poison']],
  [73,  'tentacruel', ['water','poison']],
  [74,  'geodude',    ['rock','ground']],
  [75,  'graveler',   ['rock','ground']],
  [76,  'golem',      ['rock','ground']],
  [77,  'ponyta',     ['fire']],
  [78,  'rapidash',   ['fire']],
  [79,  'slowpoke',   ['water','psychic']],
  [80,  'slowbro',    ['water','psychic']],
  [81,  'magnemite',  ['electric','steel']],
  [82,  'magneton',   ['electric','steel']],
  [83,  'farfetchd',  ['normal','flying']],
  [84,  'doduo',      ['normal','flying']],
  [85,  'dodrio',     ['normal','flying']],
  [86,  'seel',       ['water']],
  [87,  'dewgong',    ['water','ice']],
  [88,  'grimer',     ['poison']],
  [89,  'muk',        ['poison']],
  [90,  'shellder',   ['water']],
  [91,  'cloyster',   ['water','ice']],
  [92,  'gastly',     ['ghost','poison']],
  [93,  'haunter',    ['ghost','poison']],
  [94,  'gengar',     ['ghost','poison']],
  [95,  'onix',       ['rock','ground']],
  [96,  'drowzee',    ['psychic']],
  [97,  'hypno',      ['psychic']],
  [98,  'krabby',     ['water']],
  [99,  'kingler',    ['water']],
  [100, 'voltorb',    ['electric']],
  [101, 'electrode',  ['electric']],
  [102, 'exeggcute',  ['grass','psychic']],
  [103, 'exeggutor',  ['grass','psychic']],
  [104, 'cubone',     ['ground']],
  [105, 'marowak',    ['ground']],
  [106, 'hitmonlee',  ['fighting']],
  [107, 'hitmonchan', ['fighting']],
  [108, 'lickitung',  ['normal']],
  [109, 'koffing',    ['poison']],
  [110, 'weezing',    ['poison']],
  [111, 'rhyhorn',    ['ground','rock']],
  [112, 'rhydon',     ['ground','rock']],
  [113, 'chansey',    ['normal']],
  [114, 'tangela',    ['grass']],
  [115, 'kangaskhan', ['normal']],
  [116, 'horsea',     ['water']],
  [117, 'seadra',     ['water']],
  [118, 'goldeen',    ['water']],
  [119, 'seaking',    ['water']],
  [120, 'staryu',     ['water']],
  [121, 'starmie',    ['water','psychic']],
  [122, 'mrMime',     ['psychic']],
  [123, 'scyther',    ['bug','flying']],
  [124, 'jynx',       ['ice','psychic']],
  [125, 'electabuzz', ['electric']],
  [126, 'magmar',     ['fire']],
  [127, 'pinsir',     ['bug']],
  [128, 'tauros',     ['normal']],
  [129, 'magikarp',   ['water']],
  [130, 'gyarados',   ['water','flying']],
  [131, 'lapras',     ['water','ice']],
  [132, 'ditto',      ['normal']],
  [133, 'eevee',      ['normal']],
  [134, 'vaporeon',   ['water']],
  [135, 'jolteon',    ['electric']],
  [136, 'flareon',    ['fire']],
  [137, 'porygon',    ['normal']],
  [138, 'omanyte',    ['rock','water']],
  [139, 'omastar',    ['rock','water']],
  [140, 'kabuto',     ['rock','water']],
  [141, 'kabutops',   ['rock','water']],
  [142, 'aerodactyl', ['rock','flying']],
  [143, 'snorlax',    ['normal']],
  [144, 'articuno',   ['ice','flying']],
  [145, 'zapdos',     ['electric','flying']],
  [146, 'moltres',    ['fire','flying']],
  [147, 'dratini',    ['dragon']],
  [148, 'dragonair',  ['dragon']],
  [149, 'dragonite',  ['dragon','flying']],
  [150, 'mewtwo',     ['psychic']],
  [151, 'mew',        ['psychic']],
];

const ALL_KEYS = ALL_MON.map(m => m[1]);

// ── type grouping for thematic assignment ─────────────────────────────────────
// Each answer theme → which types get w2 priority
// Answer index 0=A1, 1=A2, 2=A3, 3=A4

// Question themes and answer flavor tags
// These drive which types get w2 slots vs w1 slots
const Q_ANSWER_THEMES = [
  // Q1: morning energy
  [['fire','flying','fighting','electric'], ['water','psychic','normal','dragon'],    ['psychic','normal','electric','rock'], ['electric','normal','grass','water']],
  // Q2: conflict
  [['fighting','fire','normal'],            ['water','normal','ice','grass'],          ['psychic','normal','electric'],        ['ghost','poison','dark']],
  // Q3: social style
  [['normal','fairy'],                      ['grass','water','ground'],                ['psychic','ghost'],                    ['normal','fire','water']],
  // Q4: failure
  [['fighting','fire'],                     ['normal','water'],                        ['psychic','electric'],                 ['normal','ghost']],
  // Q5: fear
  [['fire','dragon'],                       ['water','psychic','ice'],                 ['psychic','ghost'],                    ['bug','poison','ghost']],
  // Q6: emotions
  [['fighting','fire'],                     ['fire','normal'],                         ['normal','psychic'],                   ['ghost','poison']],
  // Q7: ambition
  [['fighting','fire'],                     ['dragon','flying'],                       ['electric','psychic'],                 ['grass','poison']],
  // Q8: workspace
  [['electric','steel'],                    ['normal','water'],                        ['grass','bug'],                        ['normal','fire']],
  // Q9: decisions
  [['flying','rock'],                       ['rock','water'],                          ['grass','psychic'],                    ['poison','normal']],
  // Q10: humor
  [['electric','fire'],                     ['normal','fairy'],                        ['ghost','poison'],                     ['fire','psychic']],
  // Q11: energy drains
  [['water','ice'],                         ['water','fighting'],                      ['bug','flying'],                       ['poison','gas']],
  // Q12: rules
  [['flying','ghost'],                      ['water','fighting'],                      ['fire','normal'],                      ['poison','dark']],
  // Q13: underestimated
  [['fighting','rock'],                     ['normal','water'],                        ['water','psychic'],                    ['water','psychic']],
  // Q14: loyalty
  [['fire','normal'],                       ['grass','poison'],                        ['poison','ground'],                    ['poison','ground']],
  // Q15: risk
  [['flying','normal'],                     ['water','fighting'],                      ['water','poison'],                     ['water']],
  // Q16: success
  [['flying','normal'],                     ['grass','normal'],                        ['water','psychic'],                    ['normal','fairy']],
  // Q17: planning
  [['fighting'],                            ['rock','ground'],                         ['electric','steel'],                   ['normal']],
  // Q18: sharing yourself
  [['rock','ground'],                       ['water','normal'],                        ['psychic'],                            ['ice','psychic']],
  // Q19: competition
  [['normal','fighting'],                   ['water'],                                 ['electric'],                           ['grass','psychic']],
  // Q20: patience
  [['electric'],                            ['dragon'],                                ['water','psychic'],                    ['water','ice']],
  // Q21: alone time
  [['normal','fairy'],                      ['ground'],                                ['dragon'],                             ['normal']],
  // Q22: change
  [['water','flying'],                      ['water','poison'],                        ['water'],                              ['flying','normal']],
  // Q23: leadership
  [['poison','ground'],                     ['poison','ground'],                       ['ground'],                             ['poison']],
  // Q24: misunderstood
  [['bug'],                                 ['water','psychic'],                       ['fire'],                               ['bug']],
  // Q25: work ethic
  [['water'],                               ['ground'],                                ['bug'],                                ['fire']],
  // Q26: transformation
  [['water'],                               ['bug'],                                   ['bug','flying'],                       ['bug','poison']],
  // Q27: steady improvement
  [['bug','poison'],                        ['normal','flying'],                       ['normal','flying'],                    ['normal']],
  // Q28: territory
  [['normal','flying'],                     ['electric'],                              ['ground'],                             ['poison']],
  // Q29: ambition
  [['poison'],                              ['poison'],                                ['poison','flying'],                    ['grass','poison']],
  // Q30: tedious work
  [['bug','grass'],                         ['bug','grass'],                           ['bug','poison'],                       ['ground']],
  // Q31: physical energy
  [['ground'],                              ['water','fighting'],                      ['fighting'],                           ['grass','poison']],
  // Q32: persistence
  [['grass','poison'],                      ['grass','poison'],                        ['rock','ground'],                      ['rock','ground']],
  // Q33: freedom
  [['fire'],                                ['fire'],                                  ['normal','flying'],                    ['normal','flying']],
  // Q34: emotional protection
  [['water','ice'],                         ['water'],                                 ['water'],                              ['poison']],
  // Q35: long journeys
  [['ground','rock'],                       ['ground','rock'],                         ['water'],                              ['water']],
  // Q36: untapped potential
  [['psychic'],                             ['water'],                                 ['electric'],                           ['fire']],
  // Q37: rarely seen
  [['rock','water'],                        ['rock','water'],                          ['rock'],                               ['ice','flying']],
  // Q38: feel alive
  [['electric','flying'],                   ['fire','flying'],                         ['psychic','normal'],                   ['electric']],
  // Q39: keeps you going
  [['fire','flying'],                       ['psychic'],                               ['normal'],                             ['ghost','poison']],
  // Q40: at your core
  [['normal'],                              ['psychic'],                               ['dragon','flying'],                    ['water','flying']],
];

// ── w3 assignments (fixed, from the spec) ─────────────────────────────────────
const W3_ASSIGNMENTS = [
  ['charizard','venusaur','mewtwo','pikachu'],
  ['machamp','lapras','alakazam','gengar'],
  ['jigglypuff','bulbasaur','abra','eevee'],
  ['primeape','snorlax','kadabra','ditto'],
  ['charmeleon','slowbro','hypno','venomoth'],
  ['mankey','growlithe','persian','gastly'],
  ['hitmonlee','dragonite','porygon','oddish'],
  ['magneton','kangaskhan','tangela','meowth'],
  ['aerodactyl','omastar','exeggcute','arbok'],
  ['electabuzz','wigglytuff','haunter','ninetales'],
  ['cloyster','blastoise','scyther','koffing'],
  ['golbat','wartortle','vulpix','muk'],
  ['machoke','chansey','starmie','psyduck'],
  ['arcanine','gloom','ekans','nidorina'],
  ['dodrio','poliwhirl','tentacruel','poliwag'],
  ['fearow','ivysaur','golduck','clefairy'],
  ['hitmonchan','graveler','magnemite','rattata'],
  ['onix','vaporeon','drowzee','jynx'],
  ['tauros','seaking','electrode','exeggutor'],
  ['voltorb','dratini','staryu','seel'],
  ['clefable','cubone','dragonair','lickitung'],
  ['gyarados','tentacool','goldeen','pidgeot'],
  ['nidoking','nidoqueen','marowak','grimer'],
  ['pinsir','slowpoke','magmar','caterpie'],
  ['kingler','sandslash','beedrill','charmander'],
  ['squirtle','metapod','butterfree','weedle'],
  ['kakuna','pidgey','pidgeotto','raticate'],
  ['spearow','raichu','sandshrew','nidoranF'],
  ['nidoranM','nidorino','zubat','vileplume'],
  ['paras','parasect','venonat','diglett'],
  ['dugtrio','poliwrath','machop','bellsprout'],
  ['weepinbell','victreebel','geodude','golem'],
  ['ponyta','rapidash','farfetchd','doduo'],
  ['dewgong','shellder','krabby','weezing'],
  ['rhyhorn','rhydon','horsea','seadra'],
  ['mrMime','magikarp','jolteon','flareon'],
  ['omanyte','kabuto','kabutops','articuno'],
  ['zapdos','moltres','mew','pikachu'],
  ['charizard','mewtwo','eevee','gengar'],
  ['snorlax','alakazam','dragonite','gyarados'],
];

// ── question/answer texts (copied from kanto-part2.js) ───────────────────────
// Read the actual texts from part2
// Read question/answer texts from personality-data.js (already built once with good content)
const vm = require('vm');
const DATA_SRC = fs.readFileSync('./js/personality-data.js', 'utf8');
const ctxData = { window: {} };
vm.createContext(ctxData);
vm.runInContext(DATA_SRC, ctxData);
const ORIG_QUESTIONS = ctxData.window.PERSONALITY_DATA.quizzes.kanto.questions;

// ── balanced weight assignment ────────────────────────────────────────────────

// Build a type lookup for each Pokémon key
const MON_TYPES = {};
ALL_MON.forEach(([id, key, types]) => MON_TYPES[key] = types);

// Shuffle an array using seed
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = (seed >>> 0) || 1;
  function rand() {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5; s = s >>> 0;
    return s / 0x100000000;
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const W2_TARGET = 5;
const W1_TARGET = 12;

// Track remaining assignments for each Pokémon
const w2Remaining = {};
const w1Remaining = {};
ALL_KEYS.forEach(k => { w2Remaining[k] = W2_TARGET; w1Remaining[k] = W1_TARGET; });

// Build the 160 answer slots: [qi, ai] pairs
const ALL_ANSWER_SLOTS = [];
for (let qi = 0; qi < 40; qi++) for (let ai = 0; ai < 4; ai++) ALL_ANSWER_SLOTS.push([qi, ai]);

function typeScore(monKey, themeTypes) {
  const types = MON_TYPES[monKey] || [];
  let score = 0;
  for (const t of types) if (themeTypes.includes(t)) score++;
  return score;
}

// monUsedQuestions[mon] = Set of qi where this Pokémon already has ANY weight
// This ensures each Pokémon's w2 and w1 go to DIFFERENT questions from each other and from w3,
// so maxPossible = 3 + 5×2 + 12×1 = 25 for every Pokémon.
const monUsedQuestions = {};
ALL_KEYS.forEach(k => monUsedQuestions[k] = new Set());
// Pre-populate with w3 questions
W3_ASSIGNMENTS.forEach((answerW3s, qi) => {
  answerW3s.forEach(mon => monUsedQuestions[mon].add(qi));
});

// w2Map: answer-slot key → Set of Pokémon keys assigned as w2
const w2Map = {};
ALL_ANSWER_SLOTS.forEach(([qi, ai]) => { w2Map[`${qi}_${ai}`] = new Set(); });

// questionW2Mons: qi → Set of Pokémon already assigned w2 in that question
// (prevents same Pokémon appearing as w2 in multiple answers of same question)
const questionW2Mons = {};
for (let qi = 0; qi < 40; qi++) questionW2Mons[qi] = new Set();

const shuffledSlots = seededShuffle(ALL_ANSWER_SLOTS, 9999);

// Pass 1: assign w2
for (const [qi, ai] of shuffledSlots) {
  const w3Mon = W3_ASSIGNMENTS[qi][ai];
  const themeTypes = Q_ANSWER_THEMES[qi]?.[ai] || ['normal'];
  const slotKey = `${qi}_${ai}`;

  const candidates = ALL_KEYS.filter(k =>
    k !== w3Mon &&
    w2Remaining[k] > 0 &&
    !monUsedQuestions[k].has(qi)  // not already in this question (includes w3 check)
  );

  candidates.sort((a, b) => {
    const ts = typeScore(b, themeTypes) - typeScore(a, themeTypes);
    if (ts !== 0) return ts;
    return w2Remaining[b] - w2Remaining[a];
  });

  let assigned = 0;
  for (const mon of candidates) {
    if (assigned >= 5) break;
    w2Map[slotKey].add(mon);
    monUsedQuestions[mon].add(qi);
    questionW2Mons[qi].add(mon);
    w2Remaining[mon]--;
    assigned++;
  }
}

// w1Map: answer-slot key → Set of Pokémon keys assigned as w1
const w1Map = {};
ALL_ANSWER_SLOTS.forEach(([qi, ai]) => { w1Map[`${qi}_${ai}`] = new Set(); });

// questionW1Mons: qi → Set of Pokémon already assigned w1 in that question
const questionW1Mons = {};
for (let qi = 0; qi < 40; qi++) questionW1Mons[qi] = new Set();

const shuffledSlots2 = seededShuffle(ALL_ANSWER_SLOTS, 12345);

// Pass 2: assign w1
for (const [qi, ai] of shuffledSlots2) {
  const w3Mon = W3_ASSIGNMENTS[qi][ai];
  const themeTypes = Q_ANSWER_THEMES[qi]?.[ai] || ['normal'];
  const slotKey = `${qi}_${ai}`;
  const existingW2 = w2Map[slotKey];

  const candidates = ALL_KEYS.filter(k =>
    k !== w3Mon &&
    !existingW2.has(k) &&
    w1Remaining[k] > 0 &&
    !monUsedQuestions[k].has(qi) &&    // not already w3 or w2 in this question
    !questionW1Mons[qi].has(k)          // not already w1 in another answer of this question
  );

  candidates.sort((a, b) => {
    const ts = typeScore(b, themeTypes) - typeScore(a, themeTypes);
    if (ts !== 0) return ts;
    return w1Remaining[b] - w1Remaining[a];
  });

  let assigned = 0;
  for (const mon of candidates) {
    if (assigned >= 12) break;
    w1Map[slotKey].add(mon);
    monUsedQuestions[mon].add(qi);
    questionW1Mons[qi].add(mon);
    w1Remaining[mon]--;
    assigned++;
  }
}

// ── check remaining assignments ───────────────────────────────────────────────
const w2Unplaced = Object.entries(w2Remaining).filter(([,v]) => v > 0);
const w1Unplaced = Object.entries(w1Remaining).filter(([,v]) => v > 0);
if (w2Unplaced.length) console.warn('w2 unplaced:', w2Unplaced.map(([k,v]) => `${k}:${v}`).join(', '));
if (w1Unplaced.length) console.warn('w1 unplaced:', w1Unplaced.map(([k,v]) => `${k}:${v}`).join(', '));

// ── generate the new kanto-part2.js ──────────────────────────────────────────
function buildPart2() {
  const lines = ['// kanto-part2.js — 40 personality quiz questions (balanced weights)',
                 'const KANTO_QUESTIONS = [', ''];

  ORIG_QUESTIONS.forEach((q, qi) => {
    const qTheme = [
      'Morning routine / energy', 'Handling conflict', 'Social style', 'Dealing with failure',
      'Fear', 'Emotional expression', 'Ambition', 'Ideal workspace', 'Decision making', 'Humor style',
      'Energy drains', 'Rules', 'Underestimated', 'Loyalty', 'Risk', 'Praise/success',
      'Planning', 'Sharing yourself', 'Competition', 'Patience', 'Alone time', 'Change',
      'Leadership', 'Misunderstood', 'Work ethic', 'Transformation', 'Steady improvement',
      'Territory', 'Ambition level', 'Tedious work', 'Physical energy', 'Persistence',
      'Freedom', 'Emotional protection', 'Long journeys', 'Untapped potential',
      'Rarely seen', 'Feel alive', 'Keeps you going', 'At your core',
    ][qi] || `Q${qi+1}`;

    lines.push(`  // Q${qi+1} — ${qTheme}`);
    lines.push('  {');
    const qtext = (q.question || q.text || '').replace(/'/g, "\\'");
    lines.push(`    question: '${qtext}',`);
    lines.push('    answers: [');

    q.answers.forEach((a, ai) => {
      const slotKey = `${qi}_${ai}`;
      const w3Mon = W3_ASSIGNMENTS[qi][ai];
      const w2Mons = [...w2Map[slotKey]];
      const w1Mons = [...w1Map[slotKey]];

      const atext = a.text.replace(/'/g, "\\'");
      lines.push('      {');
      lines.push(`        text: '${atext}',`);
      lines.push('        weights: {');
      const wParts = [`          ${w3Mon}: 3`];
      if (w2Mons.length) wParts.push(`          ${w2Mons.join(': 2, ')}: 2`);
      if (w1Mons.length) wParts.push(`          ${w1Mons.join(': 1, ')}: 1`);
      lines.push(wParts.join(',\n'));
      lines.push('        }');
      lines.push(`      }${ai < 3 ? ',' : ''}`);
    });

    lines.push('    ]');
    lines.push(`  }${qi < 39 ? ',' : ''}`);
    lines.push('');
  });

  lines.push('];');
  lines.push('');
  lines.push('module.exports = KANTO_QUESTIONS;');
  return lines.join('\n');
}

const output = buildPart2();
fs.writeFileSync('./js/kanto-part2.js', output, 'utf8');
console.log('✅ Wrote balanced kanto-part2.js');

// Print stats
const totalW2 = ALL_KEYS.reduce((s, k) => s + (W2_TARGET - w2Remaining[k]), 0);
const totalW1 = ALL_KEYS.reduce((s, k) => s + (W1_TARGET - w1Remaining[k]), 0);
const w2Unplaced2 = Object.entries(w2Remaining).filter(([,v]) => v > 0);
const w1Unplaced2 = Object.entries(w1Remaining).filter(([,v]) => v > 0);
console.log(`   • Total w2 assigned: ${totalW2} (target: ${ALL_KEYS.length * W2_TARGET})`);
console.log(`   • Total w1 assigned: ${totalW1} (target: ${ALL_KEYS.length * W1_TARGET})`);
if (w2Unplaced2.length) console.warn('   ⚠ w2 unplaced:', w2Unplaced2.map(([k,v]) => `${k}:${v}`).join(', '));
if (w1Unplaced2.length) console.warn('   ⚠ w1 unplaced:', w1Unplaced2.map(([k,v]) => `${k}:${v}`).join(', '));
