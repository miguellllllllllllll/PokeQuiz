import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

// One-shot: remove the DebugProbe test entry from silhouette board and
// free its name claim. Removed after running.
const PROBE_PLAYER_ID = 'debug-probe-uuid-001';
const PROBE_NAME = 'DebugProbe';
const LB_KEYS = [
	'pokequiz:leaderboard',
	'pokequiz:leaderboard:silhouette',
	'pokequiz:leaderboard:cry',
	'pokequiz:leaderboard:higherlower',
	'pokequiz:leaderboard:memory',
];
const NAMES_KEY = 'pokequiz:names';

function makeRedis() {
	const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
	if (!url || !token) throw new Error('redis env vars missing');
	return new Redis({ url, token });
}

function json(d, s = 200) {
	return new Response(JSON.stringify(d), {
		status: s,
		headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
	});
}

export default async function handler() {
	let redis;
	try { redis = makeRedis(); } catch (e) {
		return json({ error: String(e?.message || e) }, 500);
	}

	const summary = [];
	for (const key of LB_KEYS) {
		const raw = await redis.zrange(key, 0, -1);
		const toRemove = [];
		for (const m of raw) {
			try {
				const meta = typeof m === 'string' ? JSON.parse(m) : m;
				if (!meta) continue;
				if (meta.playerId === PROBE_PLAYER_ID || meta.name === PROBE_NAME) {
					toRemove.push(m);
				}
			} catch {}
		}
		let removed = 0;
		for (const m of toRemove) removed += Number(await redis.zrem(key, m)) || 0;
		summary.push({ key, removed });
	}

	const claims = await redis.hgetall(NAMES_KEY) || {};
	const freed = [];
	for (const [name, owner] of Object.entries(claims)) {
		if (owner === PROBE_PLAYER_ID || name === PROBE_NAME.toLowerCase()) {
			await redis.hdel(NAMES_KEY, name);
			freed.push(name);
		}
	}

	return json({ ok: true, summary, freed });
}
