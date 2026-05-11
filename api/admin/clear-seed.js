import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

const KEY = 'pokequiz:leaderboard';
const SEED_NAME = 'Claude';
const SEED_TIMESTAMP = 1778521959510;

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

	const members = await redis.zrange(KEY, 0, -1);
	const toRemove = [];

	for (const m of members) {
		try {
			const obj = typeof m === 'string' ? JSON.parse(m) : m;
			if (obj?.name === SEED_NAME && obj?.at === SEED_TIMESTAMP) {
				toRemove.push(m);
			}
		} catch {}
	}

	let removed = 0;
	for (const m of toRemove) {
		const r = await redis.zrem(KEY, m);
		removed += Number(r) || 0;
	}

	return json({ ok: true, removed, scanned: members.length });
}
