import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

// One-shot: remove diagnostic entries + name claims.
const TARGET_NAMES = ['TestUnique', 'UniqueTest', 'DeployProbe'];
const TARGET_NAMES_LOWER = TARGET_NAMES.map((n) => n.toLowerCase());
const LB_KEYS = [
	'pokequiz:leaderboard:quiz',
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
				if (obj?.name && TARGET_NAMES.includes(obj.name)) toRemove.push(m);
			} catch {}
		}
		let removed = 0;
		for (const m of toRemove) {
			const r = await redis.zrem(key, m);
			removed += Number(r) || 0;
		}
		summary.push({ key, scanned: members.length, removed });
	}

	// Also free the claimed names so anyone can use them now
	const claimsRemoved = await redis.hdel(NAMES_KEY, ...TARGET_NAMES_LOWER);
	summary.push({ key: NAMES_KEY, claims_freed: claimsRemoved });

	return json({ ok: true, summary });
}
