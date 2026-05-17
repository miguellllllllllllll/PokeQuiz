/**
 * badges.js
 * Gym badge computation logic for PokeQuiz.
 * Reads localStorage and determines which of the 8 Kanto gym badges are earned.
 * Exposes window.PokeBadges with a compute() function and badge metadata.
 */
(function () {
	'use strict';

	// ── Safe helpers ──────────────────────────────────────────────────────────
	function safeJSON(key, fallback) {
		try {
			const raw = localStorage.getItem(key);
			if (raw === null) return fallback;
			return JSON.parse(raw) ?? fallback;
		} catch (_) { return fallback; }
	}

	function safeNum(key, fallback) {
		const v = localStorage.getItem(key);
		const n = Number(v);
		return isFinite(n) ? n : fallback;
	}

	// ── Puzzle best score keys ─────────────────────────────────────────────────
	// Each puzzle game exposes at least one best-score key.
	const PUZZLE_GAME_KEYS = [
		// Silhouette
		['pokequiz_puzzle_best_casual', 'pokequiz_puzzle_best_standard', 'pokequiz_puzzle_best_hardcore'],
		// Cry
		['pokequiz_cry_best_casual', 'pokequiz_cry_best_standard', 'pokequiz_cry_best_hardcore'],
		// Zoom
		['pokequiz_zoom_best_casual', 'pokequiz_zoom_best_standard', 'pokequiz_zoom_best_hardcore'],
		// Dex
		['pokequiz_dex_best_casual', 'pokequiz_dex_best_standard', 'pokequiz_dex_best_hardcore'],
		// Type
		['pokequiz_type_best_mono', 'pokequiz_type_best_dual', 'pokequiz_type_best_random'],
		// Stats
		['pokequiz_stats_best_easy', 'pokequiz_stats_best_medium', 'pokequiz_stats_best_hard'],
		// Memory
		['pokequiz_memory_best_easy', 'pokequiz_memory_best_medium', 'pokequiz_memory_best_hard'],
		// Higher/Lower
		['pokequiz_hl_best'],
		// Sprint
		['pokequiz_sprint_best_30', 'pokequiz_sprint_best_60', 'pokequiz_sprint_best_120'],
	];

	// How many puzzle games the player has ever played (has a best score > 0 in any mode)
	function countPuzzleGamesPlayed() {
		return PUZZLE_GAME_KEYS.filter(keys =>
			keys.some(k => safeNum(k, 0) > 0)
		).length;
	}

	// Highest single-game streak across ALL puzzle modes
	function highestPuzzleStreak() {
		let max = 0;
		PUZZLE_GAME_KEYS.forEach(keys => {
			keys.forEach(k => {
				const v = safeNum(k, 0);
				if (v > max) max = v;
			});
		});
		return max;
	}

	// Best quiz score from local leaderboard
	function getQuizBestScore() {
		const list = safeJSON('pokequiz_leaderboard', []);
		if (!Array.isArray(list) || list.length === 0) return 0;
		return list.reduce((max, e) => {
			const s = Number(e.score);
			return isFinite(s) && s > max ? s : max;
		}, 0);
	}

	// Check if perfect score on Master Quiz (21/21)
	function hasPerfectMasterScore() {
		const list = safeJSON('pokequiz_leaderboard', []);
		if (!Array.isArray(list)) return false;
		return list.some(e => {
			const score = Number(e.score);
			const total = Number(e.total);
			return score === 21 && total === 21;
		});
	}

	// Check if shiny partner is stored (pokequiz_partner_shiny key) OR
	// camp caught a shiny (pokequiz_dex caught array) OR
	// pokequiz_shinies array exists
	function hasCaughtShiny() {
		// Method 1: camp's shiny key
		const shinyKey = localStorage.getItem('pokequiz_partner_shiny');
		if (shinyKey && shinyKey !== 'false' && shinyKey !== '0') return true;

		// Method 2: pokequiz_shinies array (from task spec)
		const shinies = safeJSON('pokequiz_shinies', []);
		if (Array.isArray(shinies) && shinies.length > 0) return true;

		// Method 3: pokequiz_inventory.shinies
		const inv = safeJSON('pokequiz_inventory', {});
		if (Array.isArray(inv.shinies) && inv.shinies.length > 0) return true;

		// Method 4: camp dex caught a shiny via the fishing mini-game or achievements
		const achievements = safeJSON('pokequiz_achievements', {});
		if (achievements.rareFish || achievements.shiny) return true;

		return false;
	}

	// Login streak
	function getLoginStreak() {
		const stats = safeJSON('pokequiz_camp_stats', {});
		return Number(stats.loginStreak) || 0;
	}

	// ── Badge metadata ─────────────────────────────────────────────────────────
	const BADGE_META = [
		{
			id      : 'boulder',
			emoji   : '🪨', // 🪨
			name    : 'Boulder Badge',
			gym     : 'Brock',
			city    : 'Pewter City',
			unlock  : 'Score 10+ on any quiz',
			color   : '#8B7355',
		},
		{
			id      : 'cascade',
			emoji   : '💧', // 💧
			name    : 'Cascade Badge',
			gym     : 'Misty',
			city    : 'Cerulean City',
			unlock  : 'Reach a streak of 10 in any puzzle game',
			color   : '#4FC3F7',
		},
		{
			id      : 'thunder',
			emoji   : '⚡', // ⚡
			name    : 'Thunder Badge',
			gym     : 'Lt. Surge',
			city    : 'Vermilion City',
			unlock  : 'Play 5 different puzzle games',
			color   : '#FFD600',
		},
		{
			id      : 'rainbow',
			emoji   : '🌿', // 🌿
			name    : 'Rainbow Badge',
			gym     : 'Erika',
			city    : 'Celadon City',
			unlock  : 'Maintain a 7-day login streak',
			color   : '#66BB6A',
		},
		{
			id      : 'soul',
			emoji   : '🩷', // 🩷
			name    : 'Soul Badge',
			gym     : 'Koga',
			city    : 'Fuchsia City',
			unlock  : 'Catch a shiny Pokémon',
			color   : '#CE93D8',
		},
		{
			id      : 'marsh',
			emoji   : '❤️', // ❤️
			name    : 'Marsh Badge',
			gym     : 'Sabrina',
			city    : 'Saffron City',
			unlock  : 'Get a perfect score (21/21) on the Master Quiz',
			color   : '#EF5350',
		},
		{
			id      : 'volcano',
			emoji   : '🔥', // 🔥
			name    : 'Volcano Badge',
			gym     : 'Blaine',
			city    : 'Cinnabar Island',
			unlock  : 'Reach a streak of 25 in any puzzle game',
			color   : '#FF7043',
		},
		{
			id      : 'earth',
			emoji   : '🌈', // 🌈
			name    : 'Earth Badge',
			gym     : 'Giovanni',
			city    : 'Viridian City',
			unlock  : 'Earn all other 7 gym badges',
			color   : '#AB47BC',
		},
	];

	// ── Core computation ───────────────────────────────────────────────────────
	/**
	 * Compute current badge state by reading all relevant localStorage keys.
	 * Returns an object: { boulder: bool, cascade: bool, ... } for all 8 badges.
	 */
	function compute() {
		const quizBest     = getQuizBestScore();
		const streak       = highestPuzzleStreak();
		const gamesPlayed  = countPuzzleGamesPlayed();
		const loginStreak  = getLoginStreak();
		const hasShiny     = hasCaughtShiny();
		const perfectMaster= hasPerfectMasterScore();

		const earned = {
			boulder  : quizBest >= 10,
			cascade  : streak >= 10,
			thunder  : gamesPlayed >= 5,
			rainbow  : loginStreak >= 7,
			soul     : hasShiny,
			marsh    : perfectMaster,
			volcano  : streak >= 25,
		};

		// Earth Badge: earn all other 7
		earned.earth = Object.values(earned).every(Boolean);

		return earned;
	}

	/**
	 * Load saved badge state from localStorage 'pokequiz_badges'.
	 */
	function load() {
		return safeJSON('pokequiz_badges', {});
	}

	/**
	 * Save badge state to localStorage 'pokequiz_badges'.
	 */
	function save(earned) {
		try { localStorage.setItem('pokequiz_badges', JSON.stringify(earned)); } catch (_) {}
	}

	/**
	 * Compute badges, merge with saved state (badges can only be gained, never lost),
	 * save, and return the merged state.
	 */
	function computeAndSave() {
		const freshEarned = compute();
		const savedEarned = load();

		// Merge: once earned, always earned
		const merged = {};
		BADGE_META.forEach(b => {
			merged[b.id] = !!(freshEarned[b.id] || savedEarned[b.id]);
		});

		// Re-check Earth Badge after merge
		const allSeven = BADGE_META.filter(b => b.id !== 'earth').every(b => merged[b.id]);
		merged.earth = allSeven;

		save(merged);
		return merged;
	}

	/**
	 * Count how many badges are earned.
	 */
	function countEarned(earned) {
		return Object.values(earned).filter(Boolean).length;
	}

	// Expose public API
	window.PokeBadges = {
		meta         : BADGE_META,
		compute,
		load,
		save,
		computeAndSave,
		countEarned,
		// Debug helpers
		_countPuzzleGamesPlayed : countPuzzleGamesPlayed,
		_highestPuzzleStreak    : highestPuzzleStreak,
		_getQuizBestScore       : getQuizBestScore,
		_hasPerfectMasterScore  : hasPerfectMasterScore,
		_hasCaughtShiny         : hasCaughtShiny,
		_getLoginStreak         : getLoginStreak,
	};
})();
