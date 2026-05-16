// Prefetch Pokémon types + a Pokédex flavor entry for IDs 1..1025.
// Writes:
//   js/pokemon-types.json   -> [{id, types: ["fire","flying"]}, ...]
//   js/pokemon-flavor.json  -> [{id, flavor: "Spits fire that ..."}, ...]
//
// Uses PokeAPI. Concurrency limited to be polite.

const fs = require('fs');
const path = require('path');

const MAX_ID = 1025;
const CONCURRENCY = 25;

const typesOut = new Array(MAX_ID);
const flavorOut = new Array(MAX_ID);

async function fetchJson(url, tries = 3) {
	for (let i = 0; i < tries; i++) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error('http ' + res.status);
			return await res.json();
		} catch (err) {
			if (i === tries - 1) throw err;
			await new Promise((r) => setTimeout(r, 500 * (i + 1)));
		}
	}
}

function cleanFlavor(s, name) {
	if (!s) return '';
	let t = String(s).replace(/[\f\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();
	// Redact the Pokémon's own name (and uppercase variants).
	const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
	return t.replace(re, '???');
}

async function fetchOne(id) {
	try {
		const [poke, species] = await Promise.all([
			fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}`),
			fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
		]);
		const types = (poke.types || []).sort((a, b) => a.slot - b.slot).map((t) => t.type.name);
		typesOut[id - 1] = { id, types };

		const entries = (species.flavor_text_entries || []).filter((e) => e.language && e.language.name === 'en');
		// Prefer most recent / non-trivial entry
		const preferredVersions = ['scarlet', 'violet', 'sword', 'shield', 'ultra-sun', 'ultra-moon', 'sun', 'moon', 'x', 'y'];
		let chosen = null;
		for (const v of preferredVersions) {
			chosen = entries.find((e) => e.version && e.version.name === v);
			if (chosen) break;
		}
		if (!chosen) chosen = entries[0];
		const raw = chosen ? chosen.flavor_text : '';
		flavorOut[id - 1] = { id, flavor: cleanFlavor(raw, species.name) };
	} catch (err) {
		console.warn(`#${id} failed:`, err.message);
		typesOut[id - 1] = { id, types: [] };
		flavorOut[id - 1] = { id, flavor: '' };
	}
}

async function run() {
	const ids = Array.from({ length: MAX_ID }, (_, i) => i + 1);
	let next = 0;
	let done = 0;
	async function worker() {
		while (next < ids.length) {
			const id = ids[next++];
			await fetchOne(id);
			done++;
			if (done % 50 === 0) process.stdout.write(`  ${done}/${MAX_ID}\n`);
		}
	}
	await Promise.all(Array.from({ length: CONCURRENCY }, worker));

	const outDir = path.join(__dirname, '..', 'js');
	fs.writeFileSync(path.join(outDir, 'pokemon-types.json'), JSON.stringify(typesOut));
	fs.writeFileSync(path.join(outDir, 'pokemon-flavor.json'), JSON.stringify(flavorOut));
	console.log('Done. Wrote pokemon-types.json + pokemon-flavor.json');
}

run().catch((err) => { console.error(err); process.exit(1); });
