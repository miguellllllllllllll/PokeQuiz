/**
 * trainer-card.js
 * Reads localStorage and populates the Trainer Card stats page.
 * No external dependencies — works standalone.
 */

(function () {
	'use strict';

	// ── localStorage keys ──────────────────────────────────────────────────────
	const KEYS = {
		inventory : 'pokequiz_camp_inventory',
		plants    : 'pokequiz_camp_plants',
		daily     : 'pokequiz_camp_daily',
		stats     : 'pokequiz_camp_stats',
		name      : 'pokequiz_trainer_name',
		trainerId : 'pokequiz_trainer_id',
	};

	// ── Safe JSON parse ────────────────────────────────────────────────────────
	function safeJSON(key, fallback) {
		try {
			const raw = localStorage.getItem(key);
			if (raw === null || raw === undefined) return fallback;
			return JSON.parse(raw) ?? fallback;
		} catch (_) {
			return fallback;
		}
	}

	function safeNum(key, fallback) {
		const v = localStorage.getItem(key);
		const n = Number(v);
		return isFinite(n) ? n : fallback;
	}

	// ── Helper: set text safely ────────────────────────────────────────────────
	function setText(id, value) {
		const el = document.getElementById(id);
		if (el) el.textContent = value;
	}

	function setHTML(id, html) {
		const el = document.getElementById(id);
		if (el) el.innerHTML = html;
	}

	// ── Format a timestamp as a human-readable date ───────────────────────────
	function formatDate(ts) {
		if (!ts || !isFinite(Number(ts))) return '—';
		const d = new Date(Number(ts));
		if (isNaN(d.getTime())) return '—';
		return d.toLocaleDateString(undefined, {
			year : 'numeric',
			month: 'short',
			day  : 'numeric',
		});
	}

	// ── Pokémon sprite from PokeAPI sprites (Gen 5 animated when available) ───
	// Map eevee evolution names (as stored) to PokéAPI species slugs
	const FORM_SLUG = {
		'Eevee'    : 'eevee',
		'Vaporeon' : 'vaporeon',
		'Jolteon'  : 'jolteon',
		'Flareon'  : 'flareon',
		'Espeon'   : 'espeon',
		'Umbreon'  : 'umbreon',
		'Leafeon'  : 'leafeon',
		'Glaceon'  : 'glaceon',
		'Sylveon'  : 'sylveon',
	};

	function getSpriteUrl(formName) {
		const slug = FORM_SLUG[formName] || FORM_SLUG['Eevee'];
		// Use the PokeAPI official front sprite (always available, no CORS issues)
		return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${slugToId(slug)}.png`;
	}

	// Map slug → dex number for the Eevee family
	const SLUG_ID = {
		eevee: 133, vaporeon: 134, jolteon: 135, flareon: 136,
		espeon: 196, umbreon: 197, leafeon: 470, glaceon: 471, sylveon: 700,
	};

	function slugToId(slug) {
		return SLUG_ID[slug] || 133;
	}

	// ── Friendship bar ────────────────────────────────────────────────────────
	// Treat max friendship as 255 (classic Pokémon cap)
	const FRIENDSHIP_MAX = 255;

	function setFriendshipBar(value) {
		const fill = document.getElementById('tcFriendshipFill');
		const num  = document.getElementById('tcFriendshipNum');
		const pct  = Math.min(100, Math.max(0, Math.round((value / FRIENDSHIP_MAX) * 100)));
		if (fill) {
			// Small delay so CSS transition fires after paint
			requestAnimationFrame(() => {
				fill.style.width = pct + '%';
			});
		}
		if (num) num.textContent = value;
	}

	// ── Populate partner sprite ────────────────────────────────────────────────
	function setPartnerSprite(formName) {
		const img         = document.getElementById('tcPartnerImg');
		const placeholder = document.getElementById('tcPartnerPlaceholder');

		if (!img) return;

		const url = getSpriteUrl(formName || 'Eevee');
		img.src   = url;
		img.alt   = formName || 'Eevee';

		img.onload = function () {
			img.style.display = '';
			if (placeholder) placeholder.classList.add('hidden');
		};

		img.onerror = function () {
			img.style.display = 'none';
			if (placeholder) {
				placeholder.classList.remove('hidden');
				placeholder.textContent = '?';
			}
		};
	}

	// ── Trainer name + ID from localStorage (written by profile.js) ──────────
	function populateTrainerIdentity() {
		// profile.js stores the trainer name under 'pokequiz_trainer_name'
		// and a trainer ID under 'pokequiz_trainer_id'
		const name = localStorage.getItem(KEYS.name);
		const id   = localStorage.getItem(KEYS.trainerId);

		if (name) setText('tcTrainerName', name);
		if (id)   setText('tcTrainerId', id);

		// Also update header profile button text to match (profile.js may not
		// have run yet since we load it with defer — safe to do here too)
		const nameSpans = document.querySelectorAll('.profile-name');
		nameSpans.forEach(s => { if (name) s.textContent = name; });
	}

	// ── Main population function ───────────────────────────────────────────────
	function populate() {
		// Read all data
		const inventory = safeJSON(KEYS.inventory, {});
		const plants    = safeJSON(KEYS.plants, []);
		const dailyTs   = safeNum(KEYS.daily, 0);
		const stats     = safeJSON(KEYS.stats, {});

		// Inventory fields with safe defaults
		const tokens          = inventory.tokens          ?? 0;
		const friendship      = inventory.friendship      ?? 0;
		const friendshipBerries = inventory.friendshipBerries ?? 0;
		const seeds           = inventory.seeds           ?? 0;
		const eeveeForm       = inventory.eeveeForm       || 'Eevee';
		const stone           = inventory.stone           || null;

		// Camp stats with safe defaults
		const totalCatches       = stats.totalCatches       ?? 0;
		const totalHarvests      = stats.totalHarvests      ?? 0;
		const totalDaysPlayed    = stats.totalDaysPlayed    ?? 0;
		const loginStreak        = stats.loginStreak        ?? 0;

		// Plants — count total items ever placed (length of plants array if
		// it's an array, or its numeric value if stored as a count)
		const plantsCount = Array.isArray(plants) ? plants.length : (Number(plants) || 0);

		// ── Hero ──────────────────────────────────────────────────────────────
		populateTrainerIdentity();

		setText('tcBadgeStreakVal', loginStreak);
		setText('tcBadgeCatchesVal', totalCatches);
		setText('tcBadgeDaysVal', totalDaysPlayed);

		// ── Partner ───────────────────────────────────────────────────────────
		setPartnerSprite(eeveeForm);
		setText('tcPartnerFormName', eeveeForm || 'Eevee');
		setText('tcCurrentForm', eeveeForm || 'Eevee');
		setFriendshipBar(friendship);
		setText('tcFriendshipBerries', friendshipBerries);

		// ── Stats tiles ───────────────────────────────────────────────────────
		setText('tcTokens',   tokens);
		setText('tcCatches',  totalCatches);
		setText('tcHarvests', totalHarvests);
		setText('tcStreak',   loginStreak);
		setText('tcDays',     totalDaysPlayed);

		const bonusEl = document.getElementById('tcLastBonus');
		if (bonusEl) {
			const dateStr = formatDate(dailyTs);
			bonusEl.textContent = dateStr;
			if (dateStr === '—') bonusEl.classList.add('is-empty');
		}

		// ── Inventory grid ────────────────────────────────────────────────────
		setText('tcInvTokens',    tokens);
		setText('tcInvFriendship', friendship);
		setText('tcInvBerries',   friendshipBerries);
		setText('tcInvSeeds',     seeds);
		setText('tcInvPlants',    plantsCount);

		const stoneEl = document.getElementById('tcInvStone');
		if (stoneEl) {
			stoneEl.textContent = stone || '—';
			if (!stone) stoneEl.style.opacity = '0.45';
		}

		// ── Apply "empty" styling to zero stat tiles ──────────────────────────
		applyEmptyStates();
	}

	// ── Mark zero/empty values with a muted style ─────────────────────────────
	function applyEmptyStates() {
		const tileIds = ['tcTokens','tcCatches','tcHarvests','tcStreak','tcDays'];
		tileIds.forEach(id => {
			const el = document.getElementById(id);
			if (el && el.textContent.trim() === '0') {
				el.classList.add('is-empty');
				el.textContent = '0';
			}
		});
	}

	// ── Run on DOM ready ──────────────────────────────────────────────────────
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', populate);
	} else {
		populate();
	}

})();
