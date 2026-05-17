// Smoke test: leaderboard game ids must stay consistent across the three
// places they're declared. Run with `node tests/check-consistency.mjs`.
// No dependencies — reads the source files as text.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

let failures = 0;
function check(label, cond, detail) {
	if (cond) {
		console.log(`  ok  ${label}`);
	} else {
		failures++;
		console.error(`FAIL  ${label}${detail ? ' — ' + detail : ''}`);
	}
}

// --- Extract game ids from each source -------------------------------------
const api = read('api/leaderboard.js');
const apiBlock = api.slice(api.indexOf('const GAMES = {'), api.indexOf('};', api.indexOf('const GAMES = {')));
const apiIds = [...apiBlock.matchAll(/^\s*([a-z]+):\s*\{/gm)].map((m) => m[1]);

const cfg = read('js/games-config.js');
const cfgIds = [...cfg.matchAll(/^\t\t([a-z]+):\s*\{/gm)].map((m) => m[1]);

const ranking = read('ranking.html');
const tabIds = [...ranking.matchAll(/data-game="([a-z]+)"/g)].map((m) => m[1]);

console.log('API game ids:    ', apiIds.join(', '));
console.log('Config game ids: ', cfgIds.join(', '));
console.log('Ranking tab ids: ', [...new Set(tabIds)].join(', '));
console.log('');

// --- Assertions -------------------------------------------------------------
check('API GAMES is non-empty', apiIds.length > 0);
check('games-config is non-empty', cfgIds.length > 0);

for (const id of cfgIds) {
	check(`config game "${id}" exists in API`, apiIds.includes(id),
		'client would show a game the API rejects');
}
for (const id of new Set(tabIds)) {
	check(`ranking tab "${id}" exists in games-config`, cfgIds.includes(id),
		'tab would have no config and crash renderRows');
}

// --- sanitizeName must not strip digits (regression guard for the bug) ------
const sanitizeMatch = api.match(/replace\((\/\[[^\]]*\]\/g)/);
check('sanitizeName regex found', !!sanitizeMatch);
if (sanitizeMatch) {
	const re = new RegExp(sanitizeMatch[1].slice(1, -2), 'g');
	check('sanitizeName keeps digits', 'Ash2024'.replace(re, '') === 'Ash2024',
		`regex ${sanitizeMatch[1]} strips digits from names`);
	check('sanitizeName strips angle brackets', '<b>x'.replace(re, '') === 'bx');
}

console.log('');
if (failures) {
	console.error(`${failures} check(s) failed.`);
	process.exit(1);
}
console.log('All consistency checks passed.');
