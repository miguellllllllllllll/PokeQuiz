import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

const TARGET_NAME = 'AuditBot';
const KEYS = [
	'pokequiz:leaderboard:silhouette',
	'pokequiz:leaderboard:cry',
	'pokequiz:leaderboard:higherlower',
	'pokequiz:leaderboard:memory',
];

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
	for (const key of KEYS) {
		const members = await redis.zrange(key, 0, -1);
		const toRemove = [];
		for (const m of members) {
			try {
				const obj = typeof m === 'string' ? JSON.parse(m) : m;
				if (obj?.name === TARGET_NAME) toRemove.push(m);
			} catch {}
		}
		let removed = 0;
		for (const m of toRemove) {
			const r = await redis.zrem(key, m);
			removed += Number(r) || 0;
		}
		summary.push({ key, scanned: members.length, removed });
	}

	return json({ ok: true, summary });
}
