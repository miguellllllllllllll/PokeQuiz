import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

// One-shot: remove my dedupe-test entries + free the name claims so the
// real player can re-claim them on their next play.
const TARGET_NAMES = ['DedupTest', 'Miguel'];
const TARGET_NAMES_LOWER = TARGET_NAMES.map((n) => n.toLowerCase());
const LB_KEYS = [
	'pokequiz:leaderboard',                  // quiz (default key)
	'pokequiz:leaderboard:silhouette',
	'pokequiz:leaderboard:cry',
	'pokequiz:leaderboard:higherlower',
	'pokequiz:leaderboard:memory',
];
const NAMES_KEY = 'pokequiz:names';

// Only remove entries that were created by my test playerIds, so we don't
// touch the original 12 quiz Miguel/Gab/etc. entries.
const TEST_PLAYER_IDS = new Set([
	'player-A-12345',
	'player-B-67890',
	'player-Z',
	'playerA',
	'playerB',
	'miguel-real-uuid',
	'deploy-probe',
]);

function makeRedis() {
	const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
	if (!url || !token) throw new Error('redis env vars missing');
	return new Redis({ url, token });
}

function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
	});
}

export default async function handler() {
	let redis;
	try { redis = makeRedis(); } catch (e) {
		return json({ error: 'redis env missing', detail: String(e?.message || e) }, 500);
	}

	const summary = [];

	for (const key of LB_KEYS) {
		const members = await redis.zrange(key, 0, -1);
		const toRemove = [];
		for (const m of members) {
			try {
				const obj = typeof m === 'string' ? JSON.parse(m) : m;
				if (!obj) continue;
				const isTestName = obj.name && TARGET_NAMES.includes(obj.name);
				const isTestPlayer = obj.playerId && TEST_PLAYER_IDS.has(obj.playerId);
				if (isTestName && isTestPlayer) toRemove.push(m);
			} catch {}
		}
		let removed = 0;
		for (const m of toRemove) {
			const r = await redis.zrem(key, m);
			removed += Number(r) || 0;
		}
		summary.push({ key, scanned: members.length, removed });
	}

	// Free name claims that point to test playerIds, so real players can
	// re-claim the names on their next play.
	const allClaims = await redis.hgetall(NAMES_KEY);
	const freed = [];
	for (const [name, ownerId] of Object.entries(allClaims || {})) {
		if (TEST_PLAYER_IDS.has(ownerId)) {
			await redis.hdel(NAMES_KEY, name);
			freed.push(name);
		}
	}
	summary.push({ key: NAMES_KEY, freed });

	return json({ ok: true, summary });
}
