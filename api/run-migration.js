// ONE-TIME migration: remove invalid entries + backfill mode-specific boards.
// DELETE THIS FILE after running.
import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

const GAMES = [
	{ key: 'pokequiz:leaderboard:silhouette',  modes: ['casual','standard','hardcore'], timeBased: false },
	{ key: 'pokequiz:leaderboard:cry',          modes: ['casual','standard','hardcore'], timeBased: false },
	{ key: 'pokequiz:leaderboard:higherlower',  modes: ['weight','height','hp','atk','spd','random'], timeBased: false },
	{ key: 'pokequiz:leaderboard:memory',       modes: ['6','8','12'], timeBased: true },
];

function safeParse(s) {
	try { return typeof s === 'string' ? JSON.parse(s) : s; } catch { return null; }
}

function parseZRange(raw) {
	const out = [];
	if (!Array.isArray(raw)) return out;
	if (raw.length && typeof raw[0] === 'object' && raw[0] !== null && 'member' in raw[0]) {
		return raw.map(x => ({ member: typeof x.member === 'string' ? x.member : JSON.stringify(x.member), score: Number(x.score) }));
	}
	for (let i = 0; i < raw.length; i += 2) {
		out.push({ member: String(raw[i]), score: Number(raw[i + 1]) });
	}
	return out;
}

export default async function handler(req) {
	const url = new URL(req.url);
	if (url.searchParams.get('secret') !== 'migrate2026') {
		return new Response('forbidden', { status: 403 });
	}

	const redis = new Redis({
		url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
		token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
	});

	const log = [];

	for (const game of GAMES) {
		log.push(`\n=== ${game.key} ===`);

		// 1. Remove invalid entries from all boards (main + each mode board)
		const allKeys = [game.key, ...game.modes.map(m => `${game.key}:${m}`)];
		for (const k of allKeys) {
			// For time-based: score >= 0 is invalid (valid stored scores are negative ms)
			// For streak: score <= 0 is invalid (valid streaks are >= 1)
			const invalidMin = game.timeBased ? 0 : '-inf';
			const invalidMax = game.timeBased ? '+inf' : 0;
			const raw = await redis.zrangebyscore(k, invalidMin, invalidMax, { withScores: true });
			const bad = parseZRange(raw);
			if (bad.length) {
				log.push(`  [PURGE] ${k}: removing ${bad.length} invalid entries`);
				for (const e of bad) {
					await redis.zrem(k, e.member);
					const meta = safeParse(e.member);
					log.push(`    - ${meta?.name || '?'} score=${e.score}`);
				}
			}
		}

		// 2. Backfill mode-specific boards from the main board
		const mainRaw = await redis.zrange(game.key, 0, -1, { withScores: true });
		const mainEntries = parseZRange(mainRaw);
		log.push(`  Main board: ${mainEntries.length} entries`);

		let migrated = 0;
		for (const e of mainEntries) {
			const meta = safeParse(e.member);
			if (!meta || !meta.mode || !game.modes.includes(meta.mode)) continue;

			const modeKey = `${game.key}:${meta.mode}`;

			// Find existing entry for this player in the mode board
			const modeRaw = await redis.zrange(modeKey, 0, -1, { withScores: true });
			const modeEntries = parseZRange(modeRaw);

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
				for (const ex of existing) await redis.zrem(modeKey, ex.member);
				await redis.zadd(modeKey, { score: e.score, member: e.member });
				migrated++;
				log.push(`  [MIGRATE] ${meta.name} → ${modeKey} (score=${e.score})`);
			}
		}
		if (migrated === 0) log.push('  No entries needed migration');
	}

	log.push('\nDone!');
	return new Response(log.join('\n'), { status: 200, headers: { 'content-type': 'text/plain' } });
}
