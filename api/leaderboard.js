import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

function makeRedis() {
	const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
	if (!url || !token) {
		throw new Error('redis env vars missing');
	}
	return new Redis({ url, token });
}

let _redis = null;
function getRedis() {
	if (!_redis) _redis = makeRedis();
	return _redis;
}

// Per-game leaderboards. Each game gets its own Redis sorted set.
// score = numeric value used for sorting (always "higher is better"; for time-based
// games like memory, we store negated milliseconds so higher = faster).
const GAMES = {
	quiz:       { key: 'pokequiz:leaderboard',                maxTotal: 100, defaultTotal: 21 },
	// Streak caps: ~500 is humanly unreachable in a single session; anything higher is fraudulent.
	silhouette: { key: 'pokequiz:leaderboard:silhouette',     maxTotal: 500, modes: ['casual','standard','hardcore'] },
	cry:        { key: 'pokequiz:leaderboard:cry',            maxTotal: 500, modes: ['casual','standard','hardcore'] },
	higherlower:{ key: 'pokequiz:leaderboard:higherlower',    maxTotal: 500, modes: ['weight','height','hp','atk','spd','random'] },
	memory:     { key: 'pokequiz:leaderboard:memory',         maxTotal: 0,   timeBased: true, modes: ['6','8','12'] },
};

// Minimum physically-possible completion times per memory board size (ms).
// Derived from mandatory animation delays: each matched pair holds a 520ms flip
// animation, plus the 900ms finish delay. These floors can't be beaten even with
// perfect knowledge and instant clicks.
const MEMORY_MIN_MS = { '6': 3500, '8': 5000, '12': 7000 };

const MAX_NAME = 24;
const MAX_RETURN = 50;
const KEEP_TOP = 100;
const RATE_LIMIT = 12;
const RATE_WINDOW_SECONDS = 60;
const NAMES_KEY = 'pokequiz:names';   // hash: lowercased_name -> playerId

function normalizeName(s) {
	return String(s).toLowerCase();
}

async function checkOrClaimName(redis, name, playerId) {
	const normalized = normalizeName(name);
	const owner = await redis.hget(NAMES_KEY, normalized);
	if (owner && owner !== playerId) {
		return { ok: false, owner };
	}
	if (!owner) {
		await redis.hset(NAMES_KEY, { [normalized]: playerId });
	}
	return { ok: true };
}

// Find every leaderboard entry that belongs to the given player (by stored
// playerId, or by name match for legacy pre-uniqueness entries that don't
// have a playerId yet).
async function findPlayerEntries(redis, key, playerId, name) {
	const raw = await redis.zrange(key, 0, -1, { withScores: true });
	const out = [];
	const push = (m, score) => {
		try {
			const meta = typeof m === 'string' ? JSON.parse(m) : m;
			if (!meta) return;
			const isOwn = meta.playerId === playerId
				|| (!meta.playerId && meta.name && normalizeName(meta.name) === normalizeName(name));
			if (isOwn) out.push({ member: m, score: Number(score), meta });
		} catch {}
	};
	if (Array.isArray(raw)) {
		if (raw.length && typeof raw[0] === 'object' && raw[0] !== null && 'member' in raw[0]) {
			for (const row of raw) push(row.member, row.score);
		} else {
			for (let i = 0; i < raw.length; i += 2) push(raw[i], raw[i + 1]);
		}
	}
	return out;
}

function json(data, status = 200, extraHeaders = {}) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'content-type': 'application/json',
			'cache-control': 'no-store',
			...extraHeaders,
		},
	});
}

function clientIp(req) {
	const fwd = req.headers.get('x-forwarded-for');
	if (fwd) return fwd.split(',')[0].trim();
	return req.headers.get('x-real-ip') || 'unknown';
}

function sanitizeName(raw) {
	if (typeof raw !== 'string') return '';
	const trimmed = raw.trim().replace(/[ -<>]/g, '');
	return trimmed.slice(0, MAX_NAME);
}

function gameConfig(name) {
	const cfg = GAMES[name];
	if (!cfg) return null;
	return cfg;
}

async function readTop(cfg, limit) {
	const max = Math.max(1, Math.min(MAX_RETURN, Number(limit) || MAX_RETURN));
	const raw = await getRedis().zrange(cfg.key, 0, max - 1, {
		rev: true,
		withScores: true,
	});

	const entries = [];
	const handleRow = (memberRaw, scoreRaw) => {
		const meta = typeof memberRaw === 'string' ? safeParse(memberRaw) : memberRaw;
		if (!meta) return;
		// For time-based games, the stored score is negated time. Decode for display.
		const score = Number(scoreRaw);
		entries.push({
			name: meta.name,
			score: cfg.timeBased ? -score : score,
			total: meta.total,
			at: meta.at,
			mode: meta.mode,
		});
	};

	if (Array.isArray(raw)) {
		if (raw.length && typeof raw[0] === 'object' && raw[0] !== null && 'member' in raw[0]) {
			for (const row of raw) handleRow(row.member, row.score);
		} else {
			for (let i = 0; i < raw.length; i += 2) handleRow(raw[i], raw[i + 1]);
		}
	}
	return entries;
}

// Write one entry to a board (deduplicating by player, keeping best score).
// Returns true if the new score was written, false if existing was better.
async function writeToBoard(redis, boardKey, playerId, name, storedScore, member) {
	const existing = await findPlayerEntries(redis, boardKey, playerId, name);
	let bestExisting = -Infinity;
	for (const e of existing) {
		if (e.score > bestExisting) bestExisting = e.score;
	}
	if (existing.length > 0 && storedScore <= bestExisting) {
		return false;
	}
	for (const e of existing) {
		await redis.zrem(boardKey, e.member);
	}
	await redis.zadd(boardKey, { score: storedScore, member });
	await redis.zremrangebyrank(boardKey, 0, -KEEP_TOP - 1);
	return true;
}

function safeParse(s) {
	try { return JSON.parse(s); } catch { return null; }
}

function envDiag() {
	return {
		hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
		hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
		hasKvUrl: !!process.env.KV_REST_API_URL,
		hasKvToken: !!process.env.KV_REST_API_TOKEN,
	};
}

export default async function handler(req) {
	if (req.method === 'GET') {
		const url = new URL(req.url);
		if (url.searchParams.get('diag') === '1') {
			return json({ env: envDiag() });
		}
		const gameName = url.searchParams.get('game') || 'quiz';
		const cfg = gameConfig(gameName);
		if (!cfg) return json({ error: 'unknown game' }, 400);

		// Support mode-specific board reads.
		const modeParam = url.searchParams.get('mode') || '';
		let readCfg = cfg;
		if (modeParam && cfg.modes && cfg.modes.includes(modeParam)) {
			readCfg = { ...cfg, key: cfg.key + ':' + modeParam };
		}

		const limit = url.searchParams.get('limit');
		try {
			const entries = await readTop(readCfg, limit);
			return json({ game: gameName, mode: modeParam || null, entries });
		} catch (err) {
			return json({ error: 'read failed', detail: String(err?.message || err), env: envDiag() }, 500);
		}
	}

	if (req.method === 'POST') {
		let body;
		try { body = await req.json(); } catch { return json({ error: 'invalid json' }, 400); }

		const action = body?.action || 'score';
		const name = sanitizeName(body?.name);
		const playerId = typeof body?.playerId === 'string' ? body.playerId.slice(0, 64) : '';

		if (!name) return json({ error: 'name required' }, 400);
		if (!playerId) return json({ error: 'playerId required' }, 400);

		// Name claim / ownership check (applies to both claim and score actions)
		let redis;
		try { redis = getRedis(); } catch (err) {
			return json({ error: 'redis init failed' }, 500);
		}
		const ownership = await checkOrClaimName(redis, name, playerId);
		if (!ownership.ok) {
			return json({
				error: 'name taken',
				message: `The name "${name}" is already claimed by another trainer. Please pick a different name.`,
			}, 409);
		}

		// Claim-only request: stop here, no score persisted.
		if (action === 'claim') {
			return json({ ok: true, claimed: name });
		}

		const gameName = body?.game || 'quiz';
		const cfg = gameConfig(gameName);
		if (!cfg) return json({ error: 'unknown game' }, 400);

		const score = Number(body?.score);
		const total = Number(body?.total);
		const mode = typeof body?.mode === 'string' ? body.mode.slice(0, 24) : '';

		if (!Number.isFinite(score) || score < 0) return json({ error: 'invalid score' }, 400);

		// Reject unknown modes up-front so bad data never reaches Redis.
		if (mode && cfg.modes && !cfg.modes.includes(mode)) {
			return json({ error: 'invalid mode' }, 400);
		}

		// Game-specific score validation
		if (cfg.timeBased) {
			// Memory match: score = elapsed ms, lower is better.
			// Minimum is board-size-dependent (animation floors); max 30 min.
			const minMs = MEMORY_MIN_MS[mode] ?? 3500;
			if (score < minMs || score > 30 * 60 * 1000) return json({ error: 'score out of range' }, 400);
		} else {
			// Streak / quiz: must be at least 1 and within the game's realistic cap.
			if (score < 1) return json({ error: 'invalid score' }, 400);
			if (score > cfg.maxTotal) return json({ error: 'invalid score' }, 400);
			if (cfg.maxTotal === 100) {
				// quiz: total must be in range and score can't exceed it
				if (!Number.isFinite(total) || total < 1 || total > cfg.maxTotal) return json({ error: 'invalid total' }, 400);
				if (score > total) return json({ error: 'score exceeds total' }, 400);
			}
		}

		const ip = clientIp(req);
		const rateKey = `pokequiz:rl:${ip}`;
		try {
			const count = await getRedis().incr(rateKey);
			if (count === 1) await getRedis().expire(rateKey, RATE_WINDOW_SECONDS);
			if (count > RATE_LIMIT) return json({ error: 'rate limit' }, 429);
		} catch {
			/* if rate limiter fails, allow through */
		}

		// For time-based games, negate so larger = better in the sorted set.
		const storedScore = cfg.timeBased ? -score : score;

		const member = JSON.stringify({
			name,
			playerId,
			total: Number.isFinite(total) ? total : (cfg.defaultTotal ?? undefined),
			at: Date.now(),
			...(mode ? { mode } : {}),  // omit key entirely if no mode
		});

		try {
			// Write to main board (overall best per player across all modes).
			await writeToBoard(redis, cfg.key, playerId, name, storedScore, member);

			// Write to mode-specific board (best per player per mode).
			if (mode && cfg.modes && cfg.modes.includes(mode)) {
				await writeToBoard(redis, cfg.key + ':' + mode, playerId, name, storedScore, member);
			}

			const entries = await readTop(cfg, MAX_RETURN);
			return json({ ok: true, game: gameName, entries });
		} catch (err) {
			return json({ error: 'write failed', detail: String(err?.message || err), env: envDiag() }, 500);
		}
	}

	return json({ error: 'method not allowed' }, 405, { 'allow': 'GET, POST' });
}
