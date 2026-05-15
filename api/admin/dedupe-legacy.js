import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

// One-shot: collapse legacy duplicate entries (same playerId or same
// normalized name when playerId is missing) keeping only the highest-score
// entry per player on each board.
const LB_KEYS = [
	'pokequiz:leaderboard',
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

	for (const key of LB_KEYS) {
		const raw = await redis.zrange(key, 0, -1, { withScores: true });
		// Normalize to [{ member, score, meta }]
		const rows = [];
		const push = (m, s) => {
			try {
				const meta = typeof m === 'string' ? JSON.parse(m) : m;
				if (!meta) return;
				rows.push({ member: m, score: Number(s), meta });
			} catch {}
		};
		if (Array.isArray(raw)) {
			if (raw.length && typeof raw[0] === 'object' && raw[0] !== null && 'member' in raw[0]) {
				for (const r of raw) push(r.member, r.score);
			} else {
				for (let i = 0; i < raw.length; i += 2) push(raw[i], raw[i + 1]);
			}
		}

		// Group by playerId if present, else by lowercased name
		const groups = new Map();
		for (const row of rows) {
			const id = row.meta.playerId
				? `id:${row.meta.playerId}`
				: `name:${String(row.meta.name || '').toLowerCase()}`;
			const cur = groups.get(id);
			if (!cur || row.score > cur.score) {
				if (cur) cur.losers.push(row);
				groups.set(id, { ...row, losers: cur ? [...cur.losers] : [] });
			} else {
				cur.losers.push(row);
			}
		}

		const toRemove = [];
		for (const g of groups.values()) {
			for (const l of g.losers) toRemove.push(l.member);
		}

		let removed = 0;
		for (const m of toRemove) {
			const r = await redis.zrem(key, m);
			removed += Number(r) || 0;
		}
		summary.push({ key, scanned: rows.length, groups: groups.size, removed });
	}

	return json({ ok: true, summary });
}
