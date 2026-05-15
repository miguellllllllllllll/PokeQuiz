// ONE-TIME migration: remove invalid entries + backfill mode-specific boards.
// DELETE THIS FILE after running.
// Uses raw Upstash REST API (not SDK) to preserve exact member strings for ZREM.
export const config = { runtime: 'edge' };

const MEMORY_MIN_MS = { '6': 3500, '8': 5000, '12': 7000 };
const GAMES = [
	{ key: 'pokequiz:leaderboard:silhouette',  modes: ['casual','standard','hardcore'], timeBased: false },
	{ key: 'pokequiz:leaderboard:cry',          modes: ['casual','standard','hardcore'], timeBased: false },
	{ key: 'pokequiz:leaderboard:higherlower',  modes: ['weight','height','hp','atk','spd','random'], timeBased: false },
	{ key: 'pokequiz:leaderboard:memory',       modes: ['6','8','12'], timeBased: true },
];

function safeParse(s) {
	try { return typeof s === 'string' ? JSON.parse(s) : s; } catch { return null; }
}

let BASE, TOKEN;

// Execute a single Redis command via raw HTTP. Returns result.
async function rc(...args) {
	const r = await fetch(BASE, {
		method: 'POST',
		headers: { Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
		body: JSON.stringify(args),
	});
	const j = await r.json();
	if (j.error) throw new Error(j.error);
	return j.result;
}

// ZRANGE key 0 -1 WITHSCORES → [[member, score], ...]
async function zrangeAll(key) {
	const raw = await rc('ZRANGE', key, '0', '-1', 'WITHSCORES');
	if (!Array.isArray(raw)) return [];
	const out = [];
	for (let i = 0; i < raw.length; i += 2) {
		out.push({ member: String(raw[i]), score: Number(raw[i + 1]) });
	}
	return out;
}

// ZRANGEBYSCORE key min max WITHSCORES → [[member, score], ...]
async function zrangeByScore(key, min, max) {
	const raw = await rc('ZRANGEBYSCORE', key, String(min), String(max), 'WITHSCORES');
	if (!Array.isArray(raw)) return [];
	const out = [];
	for (let i = 0; i < raw.length; i += 2) {
		out.push({ member: String(raw[i]), score: Number(raw[i + 1]) });
	}
	return out;
}

async function zrem(key, member) {
	return rc('ZREM', key, member);
}

async function zadd(key, score, member) {
	return rc('ZADD', key, String(score), member);
}

export default async function handler(req) {
	const url = new URL(req.url);
	if (url.searchParams.get('secret') !== 'migrate2026') {
		return new Response('forbidden', { status: 403 });
	}

	BASE = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
	TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
	if (!BASE || !TOKEN) return new Response('env vars missing', { status: 500 });

	const log = [];

	for (const game of GAMES) {
		log.push(`\n=== ${game.key} ===`);

		if (game.timeBased) {
			// Memory game: stored score = -elapsedMs (negative). Invalid = too fast or >=0.
			// Purge mode boards using per-mode floor.
			for (const mode of game.modes) {
				const modeKey = `${game.key}:${mode}`;
				const minMs = MEMORY_MIN_MS[mode];
				// Any entry with stored score > -minMs is too fast (elapsed < minMs).
				// ZRANGEBYSCORE with open interval: "(-minMs" would exclude -minMs itself (valid boundary).
				// But since ms are integers, -(minMs-1) is the same: zrangebyscore key -(minMs-1) +inf
				const bad = await zrangeByScore(modeKey, -(minMs - 1), '+inf');
				if (bad.length) {
					log.push(`  [PURGE] ${modeKey}: ${bad.length} entry/entries faster than ${minMs}ms`);
					for (const e of bad) {
						await zrem(modeKey, e.member);
						const meta = safeParse(e.member);
						log.push(`    - ${meta?.name ?? e.member.slice(0,40)} elapsed=${-e.score}ms`);
					}
				}
			}

			// Purge main memory board: check each entry against its mode's floor.
			const mainEntries = await zrangeAll(game.key);
			for (const e of mainEntries) {
				const meta = safeParse(e.member);
				const minMs = MEMORY_MIN_MS[meta?.mode] ?? 3500;
				if (e.score > -minMs) {
					await zrem(game.key, e.member);
					log.push(`  [PURGE] main: ${meta?.name ?? '?'} elapsed=${-e.score}ms mode=${meta?.mode}`);
				}
			}
		} else {
			// Streak games: any score <= 0 is invalid.
			const allKeys = [game.key, ...game.modes.map(m => `${game.key}:${m}`)];
			for (const k of allKeys) {
				const bad = await zrangeByScore(k, '-inf', '0');
				if (bad.length) {
					log.push(`  [PURGE] ${k}: ${bad.length} entries with score<=0`);
					for (const e of bad) {
						await zrem(k, e.member);
						const meta = safeParse(e.member);
						log.push(`    - ${meta?.name ?? '?'} score=${e.score}`);
					}
				}
			}
		}

		// Backfill mode-specific boards from the main board.
		const mainEntries = await zrangeAll(game.key);
		log.push(`  Main board (post-purge): ${mainEntries.length} entries`);

		let migrated = 0;
		for (const e of mainEntries) {
			const meta = safeParse(e.member);
			if (!meta || !meta.mode || !game.modes.includes(meta.mode)) continue;

			const modeKey = `${game.key}:${meta.mode}`;
			const modeEntries = await zrangeAll(modeKey);

			const existing = modeEntries.filter(me => {
				const mm = safeParse(me.member);
				if (!mm) return false;
				if (meta.playerId && mm.playerId === meta.playerId) return true;
				if (!meta.playerId && mm.name && meta.name &&
					mm.name.toLowerCase() === meta.name.toLowerCase()) return true;
				return false;
			});

			const bestExisting = existing.reduce((best, ex) => Math.max(best, ex.score), -Infinity);

			if (existing.length === 0 || e.score > bestExisting) {
				for (const ex of existing) await zrem(modeKey, ex.member);
				await zadd(modeKey, e.score, e.member);
				migrated++;
				log.push(`  [MIGRATE] ${meta.name} → ${modeKey} (stored=${e.score})`);
			}
		}
		if (migrated === 0) log.push('  No entries needed migration');
	}

	log.push('\nDone!');
	return new Response(log.join('\n'), { status: 200, headers: { 'content-type': 'text/plain' } });
}
