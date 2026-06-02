#!/usr/bin/env node
// build-kanto.js — splices the full 151-Pokémon kanto section into personality-data.js

const fs = require('fs');
const path = require('path');

const POKEMON   = require('./js/kanto-part1.js');  // { bulbasaur: {...}, ... }
const QUESTIONS = require('./js/kanto-part2.js');   // [ { question, answers }, ... ]

const DATA_PATH = path.join(__dirname, 'js', 'personality-data.js');

// ── helpers ──────────────────────────────────────────────────────────────────

function indent(str, spaces) {
  const pad = ' '.repeat(spaces);
  return str.split('\n').map(l => l ? pad + l : l).join('\n');
}

function weightsToStr(obj, baseIndent) {
  const pad = ' '.repeat(baseIndent);
  const inner = ' '.repeat(baseIndent + 2);
  const entries = Object.entries(obj)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');
  // keep short weights on one line, break long ones
  if (entries.length < 90) return `{ ${entries} }`;
  // group: w3, w2s, w1s
  const w3 = Object.entries(obj).filter(([,v]) => v === 3).map(([k,v]) => `${k}: ${v}`).join(', ');
  const w2 = Object.entries(obj).filter(([,v]) => v === 2).map(([k,v]) => `${k}: ${v}`).join(', ');
  const w1 = Object.entries(obj).filter(([,v]) => v === 1).map(([k,v]) => `${k}: ${v}`).join(', ');
  const lines = [];
  if (w3) lines.push(`${inner}${w3},`);
  if (w2) lines.push(`${inner}${w2},`);
  if (w1) lines.push(`${inner}${w1}`);
  return `{\n${lines.join('\n')}\n${pad}}`;
}

// ── build pokemon block ───────────────────────────────────────────────────────

function buildPokemonBlock() {
  const lines = [];
  const keys = Object.keys(POKEMON);
  keys.forEach((key, i) => {
    const p = POKEMON[key];
    const comma = i < keys.length - 1 ? ',' : '';
    const traitsStr = JSON.stringify(p.traits);
    const safeName = p.name.replace(/'/g, "\\'");
    const safeMove = p.signatureMove.replace(/'/g, "\\'");
    const safePartner = p.idealPartner.replace(/'/g, "\\'");
    const safeDesc = p.desc.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    lines.push(`        ${key}: { id: ${p.id}, typeId: ${p.typeId}, name: '${safeName}', type: '${p.type}', color: '${p.color}',`);
    lines.push(`                      traits: ${traitsStr},`);
    lines.push(`                      signatureMove: '${safeMove}', idealPartner: '${safePartner}',`);
    lines.push(`                      desc: "${safeDesc}" }${comma}`);
  });
  return lines.join('\n');
}

// ── build questions block ─────────────────────────────────────────────────────

function buildQuestionsBlock() {
  const lines = [];
  QUESTIONS.forEach((q, qi) => {
    const qComma = qi < QUESTIONS.length - 1 ? ',' : '';
    const questionText = (q.question || q.text || '').replace(/'/g, "\\'");
    lines.push(`        { text: '${questionText}',`);
    lines.push(`          answers: [`);
    q.answers.forEach((a, ai) => {
      const aComma = ai < q.answers.length - 1 ? ',' : '';
      const answerText = a.text.replace(/'/g, "\\'");
      const wStr = weightsToStr(a.weights, 14);
      lines.push(`            { text: '${answerText}', weights: ${wStr} }${aComma}`);
    });
    lines.push(`          ]`);
    lines.push(`        }${qComma}`);
  });
  return lines.join('\n');
}

// ── assemble full kanto section ───────────────────────────────────────────────

function buildKantoSection() {
  const pokemonCount = Object.keys(POKEMON).length;
  const questionCount = QUESTIONS.length;

  return `    /* ════════════════════════════════════════════
       QUIZ 3 – Which Kanto Pokémon Are You?
    ════════════════════════════════════════════ */
    kanto: {
      id: 'kanto',
      name: 'Which Kanto Pokémon Are You?',
      label: 'KANTO QUIZ',
      subtitle: '${pokemonCount} results · ${questionCount} questions',
      icon: '✨',
      color: '#ee1515',
      gradient: 'linear-gradient(135deg,#ee1515 0%,#ff6b35 100%)',
      desc: 'Discover your true Kanto counterpart among all ${pokemonCount} original Pokémon.',
      showcasePokemon: [25, 6, 94, 133],  // Pikachu · Charizard · Gengar · Eevee

      pokemon: {
${buildPokemonBlock()}
      },

      questions: [
${buildQuestionsBlock()}
      ]
    }`;
}

// ── splice into personality-data.js ──────────────────────────────────────────

const raw = fs.readFileSync(DATA_PATH, 'utf8');

// Find the start of the kanto section comment
const startMarker = '    /* ════════════════════════════════════════════\n       QUIZ 3 – Which Kanto Pokémon Are You?';
const startIdx = raw.indexOf(startMarker);
if (startIdx === -1) {
  console.error('ERROR: Could not find kanto section start marker');
  process.exit(1);
}

// Find the closing brace of kanto: { ... }
// The kanto section ends with "    }" then newline + "  }" + newline + "};"
// We want `after` to include only the outer closing braces (NOT kanto's own closing brace)
const afterStart = raw.slice(startIdx);
// Find "    }\n  }\n};" pattern — the kanto closing "    }" plus outer braces
const endPattern = /\n    \}\n  \}\n\};/;
const endMatch = afterStart.search(endPattern);
if (endMatch === -1) {
  console.error('ERROR: Could not find kanto section end');
  process.exit(1);
}

const before = raw.slice(0, startIdx);
// after starts at the "\n  }\n};" part (skipping the kanto-closing "    }")
const kantoEnd = startIdx + endMatch;
// kantoEnd points to the "\n    }" — advance past it to get just "\n  }\n};"
const afterOffset = raw.indexOf('\n  }\n};', kantoEnd);
const after = raw.slice(afterOffset); // "\n  }\n};"

const newContent = before + buildKantoSection() + after;

fs.writeFileSync(DATA_PATH, newContent, 'utf8');
console.log(`✅ Done! Wrote ${Object.keys(POKEMON).length} Pokémon and ${QUESTIONS.length} questions to personality-data.js`);

// Quick sanity check
const written = fs.readFileSync(DATA_PATH, 'utf8');
const pokemonMatches = (written.match(/typeId:/g) || []).length;
const questionMatches = (written.match(/{ text: '/g) || []).length;
console.log(`   • Found ${pokemonMatches} 'typeId:' occurrences (expect 151+)`);
console.log(`   • Found ${questionMatches} question/answer text entries`);
