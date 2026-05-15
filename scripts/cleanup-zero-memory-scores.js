#!/usr/bin/env node
// Deletes memory leaderboard entries stored with score=0 (the 0:00 bug).
// Run with your Upstash credentials:
//   UPSTASH_REDIS_REST_URL=https://... UPSTASH_REDIS_REST_TOKEN=... node scripts/cleanup-zero-memory-scores.js

const BASE_URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN    = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!BASE_URL || !TOKEN) {
	console.error('Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
	process.exit(1);
}

async function redisCmd(...args) {
	const res = await fetch(`${BASE_URL}/${args.map(encodeURIComponent).join('/')}`, {
		headers: { Authorization: `Bearer ${TOKEN}` },
	});
	const json = await res.json();
	if (json.error) throw new Error(json.error);
	return json.result;
}

const KEYS = [
	'pokequiz:leaderboard:memory',
	'pokequiz:leaderboard:memory:6',
	'pokequiz:leaderboard:memory:8',
	'pokequiz:leaderboard:memory:12',
];

(async () => {
	for (const key of KEYS) {
		// ZRANGEBYSCORE key 0 0 — finds members stored with score exactly 0
		const members = await redisCmd('ZRANGEBYSCORE', key, '0', '0');
		if (!members || members.length === 0) {
			console.log(`${key}: no zero-score entries`);
			continue;
		}
		console.log(`${key}: found ${members.length} zero-score entry/entries — deleting...`);
		for (const m of members) {
			await redisCmd('ZREM', key, m);
			let parsed;
			try { parsed = JSON.parse(m); } catch { parsed = {}; }
			console.log(`  removed: ${parsed.name || '(unknown)'} @ ${new Date(parsed.at || 0).toLocaleString()}`);
		}
	}
	console.log('Done.');
})().catch((e) => { console.error(e); process.exit(1); });
