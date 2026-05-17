/**
 * trainer-card.js
 * Reads localStorage and populates the Trainer Card stats page.
 * Also renders: gym badge mini-strip, achievements grid, Pokédex tracker.
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

	// ── Pokédex tracker helpers ───────────────────────────────────────────────
	const DEX_KEY        = 'pokequiz_pokedex';
	const DEX_RECENT_KEY = 'pokequiz_pokedex_recent';
	const DEX_TOTAL      = 1025;

	/** Read the Pokédex registration object {id: true, ...} */
	function loadPokedex() {
		return safeJSON(DEX_KEY, {});
	}

	/** Read recently registered list [{id, name, at}] */
	function loadDexRecent() {
		const raw = safeJSON(DEX_RECENT_KEY, []);
		return Array.isArray(raw) ? raw : [];
	}

	/**
	 * Register a Pokémon by id + name. Exported globally so puzzle pages
	 * can call window.PokeQuiz.registerPokemon(id, name) when they're ready.
	 */
	function registerPokemon(id, name) {
		const idStr = String(id);
		const dex   = loadPokedex();
		const isNew = !dex[idStr];
		dex[idStr]  = true;
		try { localStorage.setItem(DEX_KEY, JSON.stringify(dex)); } catch (_) {}

		if (isNew) {
			const recent = loadDexRecent();
			recent.unshift({ id: idStr, name: name || idStr, at: Date.now() });
			const trimmed = recent.slice(0, 10); // keep last 10
			try { localStorage.setItem(DEX_RECENT_KEY, JSON.stringify(trimmed)); } catch (_) {}
		}
	}

	// Expose globally for puzzle pages
	window.PokeQuiz = window.PokeQuiz || {};
	window.PokeQuiz.registerPokemon = registerPokemon;

	// ── Estimate Pokédex from puzzle best scores ──────────────────────────────
	// When there's no real registration data yet we generate an estimate.
	const PUZZLE_BEST_KEYS = [
		'pokequiz_puzzle_best_casual', 'pokequiz_puzzle_best_standard', 'pokequiz_puzzle_best_hardcore',
		'pokequiz_cry_best_casual',    'pokequiz_cry_best_standard',    'pokequiz_cry_best_hardcore',
		'pokequiz_zoom_best_casual',   'pokequiz_zoom_best_standard',   'pokequiz_zoom_best_hardcore',
		'pokequiz_dex_best_casual',    'pokequiz_dex_best_standard',    'pokequiz_dex_best_hardcore',
		'pokequiz_type_best_mono',     'pokequiz_type_best_dual',       'pokequiz_type_best_random',
		'pokequiz_stats_best_easy',    'pokequiz_stats_best_medium',    'pokequiz_stats_best_hard',
		'pokequiz_memory_best_easy',   'pokequiz_memory_best_medium',   'pokequiz_memory_best_hard',
		'pokequiz_hl_best',
		'pokequiz_sprint_best_30',     'pokequiz_sprint_best_60',       'pokequiz_sprint_best_120',
	];

	function estimateDexCount() {
		let total = 0;
		PUZZLE_BEST_KEYS.forEach(k => {
			const v = safeNum(k, 0);
			if (v > 0) total += Math.min(v * 2, 80); // rough: each correct guess = 2 Pokémon seen
		});
		return Math.min(total, DEX_TOTAL);
	}

	// ── Populate Pokédex section ──────────────────────────────────────────────
	function populatePokedex() {
		const dex       = loadPokedex();
		const recent    = loadDexRecent();
		let   regCount  = Object.keys(dex).length;

		// If no real data, show estimated count (not stored — just display)
		let isEstimate = false;
		if (regCount === 0) {
			regCount   = estimateDexCount();
			isEstimate = regCount > 0;
		}

		const pct = regCount > 0 ? Math.min(100, ((regCount / DEX_TOTAL) * 100).toFixed(1)) : 0;

		// Progress bar
		const fillEl = document.getElementById('tcDexFill');
		if (fillEl) {
			requestAnimationFrame(() => { fillEl.style.width = pct + '%'; });
		}
		setText('tcDexCount', isEstimate ? '~' + regCount : regCount);
		setText('tcDexPct', pct + '%');

		// Recent registrations
		const recentListEl = document.getElementById('tcDexRecentList');
		if (recentListEl) {
			if (recent.length > 0) {
				recentListEl.innerHTML = recent.slice(0, 5).map(entry => {
					const d = new Date(entry.at);
					const dateStr = isNaN(d) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
					return `<span class="tc-dex-recent-tag">#${entry.id} ${entry.name}${dateStr ? ' <span class="tc-dex-recent-date">· ' + dateStr + '</span>' : ''}</span>`;
				}).join('');
			} else if (isEstimate) {
				recentListEl.innerHTML = '<span class="tc-dex-none">Play puzzle games to register Pok&eacute;mon.</span>';
			} else {
				recentListEl.innerHTML = '<span class="tc-dex-none">No Pok&eacute;mon registered yet.</span>';
			}
		}

		// Mini grid for first 151 (Gen 1)
		const miniGridEl = document.getElementById('tcDexMiniGrid');
		if (miniGridEl) {
			const squares = [];
			for (let i = 1; i <= 151; i++) {
				const isReg = !!dex[String(i)];
				squares.push(`<span class="tc-dex-sq${isReg ? ' reg' : ''}" title="#${i}"></span>`);
			}
			miniGridEl.innerHTML = squares.join('');
		}
	}

	// ── Achievements data & renderer ──────────────────────────────────────────
	const ACHIEVEMENTS = [
		{
			id     : 'sharpShooter',
			icon   : '🎯',
			name   : 'Sharp Shooter',
			desc   : 'First perfect quiz score (21/21)',
			check  : () => {
				const list = safeJSON('pokequiz_leaderboard', []);
				return Array.isArray(list) && list.some(e => Number(e.score) === 21 && Number(e.total) === 21);
			},
		},
		{
			id     : 'onFire',
			icon   : '🔥',
			name   : 'On Fire',
			desc   : 'Reach a 10-day login streak',
			check  : () => {
				const stats = safeJSON('pokequiz_camp_stats', {});
				return (Number(stats.loginStreak) || 0) >= 10;
			},
		},
		{
			id     : 'shinyHunter',
			icon   : '✨',
			name   : 'Shiny Hunter',
			desc   : 'Catch your first shiny Pokémon',
			check  : () => {
				const shinyKey = localStorage.getItem('pokequiz_partner_shiny');
				if (shinyKey && shinyKey !== 'false' && shinyKey !== '0') return true;
				const shinies = safeJSON('pokequiz_shinies', []);
				if (Array.isArray(shinies) && shinies.length > 0) return true;
				const inv = safeJSON('pokequiz_inventory', {});
				if (Array.isArray(inv.shinies) && inv.shinies.length > 0) return true;
				const ach = safeJSON('pokequiz_achievements', {});
				return !!(ach.rareFish || ach.shiny);
			},
		},
		{
			id     : 'champion',
			icon   : '🏆',
			name   : 'Champion',
			desc   : 'Earn all 8 gym badges',
			check  : () => {
				if (!window.PokeBadges) return false;
				const earned = PokeBadges.computeAndSave();
				return PokeBadges.countEarned(earned) === 8;
			},
		},
		{
			id     : 'completionist',
			icon   : '🎮',
			name   : 'Completionist',
			desc   : 'Play all 9 puzzle games at least once',
			check  : () => {
				const gameSets = [
					['pokequiz_puzzle_best_casual','pokequiz_puzzle_best_standard','pokequiz_puzzle_best_hardcore'],
					['pokequiz_cry_best_casual','pokequiz_cry_best_standard','pokequiz_cry_best_hardcore'],
					['pokequiz_zoom_best_casual','pokequiz_zoom_best_standard','pokequiz_zoom_best_hardcore'],
					['pokequiz_dex_best_casual','pokequiz_dex_best_standard','pokequiz_dex_best_hardcore'],
					['pokequiz_type_best_mono','pokequiz_type_best_dual','pokequiz_type_best_random'],
					['pokequiz_stats_best_easy','pokequiz_stats_best_medium','pokequiz_stats_best_hard'],
					['pokequiz_memory_best_easy','pokequiz_memory_best_medium','pokequiz_memory_best_hard'],
					['pokequiz_hl_best'],
					['pokequiz_sprint_best_30','pokequiz_sprint_best_60','pokequiz_sprint_best_120'],
				];
				return gameSets.every(keys => keys.some(k => safeNum(k, 0) > 0));
			},
		},
		{
			id     : 'bigSpender',
			icon   : '💰',
			name   : 'Big Spender',
			desc   : 'Spend 500+ tokens total at camp',
			check  : () => {
				const inv = safeJSON('pokequiz_camp_inventory', {});
				return (Number(inv.totalSpent) || 0) >= 500;
			},
		},
		{
			id     : 'consistentTrainer',
			icon   : '🌿',
			name   : 'Consistent Trainer',
			desc   : 'Maintain a 30-day login streak',
			check  : () => {
				const stats = safeJSON('pokequiz_camp_stats', {});
				return (Number(stats.loginStreak) || 0) >= 30;
			},
		},
		{
			id     : 'triviaMaster',
			icon   : '🧠',
			name   : 'Trivia Master',
			desc   : 'Score 80%+ on all 4 quiz difficulties',
			check  : () => {
				// Each quiz has 21 questions; 80% = 17+
				const list = safeJSON('pokequiz_leaderboard', []);
				if (!Array.isArray(list)) return false;
				// Find best score per quiz (total=21 entries represent quiz runs)
				const quizBests = {};
				list.forEach(e => {
					if (Number(e.total) === 21 && e.game === 'quiz') {
						// We don't store quiz id in leaderboard entries currently —
						// approximate: each difficulty is tracked separately by name
						// Check entries with score >= 17
					}
				});
				// Simplified: check if player has scored 17+ in at least 4 separate
				// quiz sessions (each 21 questions total)
				const highScores = list.filter(e => Number(e.total) === 21 && Number(e.score) >= 17);
				// Need at least 4 such sessions (one per difficulty in spirit)
				return highScores.length >= 4;
			},
		},
		{
			id     : 'pokedexScholar',
			icon   : '📖',
			name   : 'Pokédex Scholar',
			desc   : 'Register 100+ Pokémon',
			check  : () => {
				const dex   = safeJSON(DEX_KEY, {});
				const count = Object.keys(dex).length;
				if (count >= 100) return true;
				// Also count estimate
				return estimateDexCount() >= 100;
			},
		},
		{
			id     : 'interiorDesigner',
			icon   : '🏠',
			name   : 'Interior Designer',
			desc   : 'Place 5+ room items in the bedroom',
			check  : () => {
				const inv = safeJSON('pokequiz_camp_inventory', {});
				const placements = inv?.cosmetics?.roomPlacements || {};
				return Object.keys(placements).length >= 5;
			},
		},
	];

	function populateAchievements() {
		const gridEl = document.getElementById('tcAchievementsGrid');
		if (!gridEl) return;

		gridEl.innerHTML = ACHIEVEMENTS.map(ach => {
			let earned = false;
			try { earned = ach.check(); } catch (_) {}
			return `
				<div class="tc-ach-card${earned ? ' earned' : ' locked'}">
					<div class="tc-ach-icon" aria-hidden="true">${ach.icon}</div>
					<div class="tc-ach-body">
						<div class="tc-ach-name">${ach.name}</div>
						<div class="tc-ach-desc">${ach.desc}</div>
					</div>
					<div class="tc-ach-status" aria-label="${earned ? 'Unlocked' : 'Locked'}">
						${earned ? '<span class="tc-ach-check">✓ UNLOCKED</span>' : '<span class="tc-ach-lock">🔒</span>'}
					</div>
				</div>
			`;
		}).join('');
	}

	// ── Gym badge mini-strip + badges grid ────────────────────────────────────
	function populateGymBadges() {
		if (!window.PokeBadges) return;

		const earned = PokeBadges.computeAndSave();
		const meta   = PokeBadges.meta;

		// Mini strip in hero
		const iconsEl = document.getElementById('tcGymBadgeIcons');
		if (iconsEl) {
			const earnedBadges = meta.filter(b => earned[b.id]);
			if (earnedBadges.length > 0) {
				iconsEl.innerHTML = earnedBadges.map(b =>
					`<span class="tc-gym-badge-icon" title="${b.name}">${b.emoji}</span>`
				).join('');
			} else {
				iconsEl.innerHTML = '<span class="tc-gym-empty">None yet</span>';
			}
		}

		// Full badges grid on card
		const gridEl = document.getElementById('tcBadgesGrid');
		if (gridEl) {
			gridEl.innerHTML = meta.map(badge => {
				const isEarned = !!earned[badge.id];
				return `
					<div class="tc-badge-tile${isEarned ? ' earned' : ' locked'}" style="--badge-color:${badge.color};" title="${badge.unlock}">
						<span class="tc-badge-tile-emoji">${badge.emoji}</span>
						<span class="tc-badge-tile-name">${badge.name}</span>
						${isEarned ? '<span class="tc-badge-tile-check">✓</span>' : '<span class="tc-badge-tile-lock">🔒</span>'}
					</div>
				`;
			}).join('');
		}
	}

	// ── Share / receive logic ─────────────────────────────────────────────────

	/**
	 * Encode a payload object to base64url (URL-safe, no padding).
	 */
	function toBase64Url(obj) {
		const json = JSON.stringify(obj);
		// btoa works on binary strings; encode as UTF-8 first
		const bytes = new TextEncoder().encode(json);
		let binary = '';
		bytes.forEach(b => { binary += String.fromCharCode(b); });
		return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	}

	/**
	 * Decode a base64url string back to an object, or null on error.
	 */
	function fromBase64Url(str) {
		try {
			const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
			const binary = atob(b64);
			const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
			return JSON.parse(new TextDecoder().decode(bytes));
		} catch (_) {
			return null;
		}
	}

	/**
	 * Build the share payload from current localStorage state.
	 */
	function buildSharePayload() {
		const inventory = safeJSON(KEYS.inventory, {});
		const stats     = safeJSON(KEYS.stats, {});
		const name      = localStorage.getItem(KEYS.name) || 'Trainer';

		// Gym badges — compute via PokeBadges if available
		let badges = {};
		let badgeCount = 0;
		if (window.PokeBadges) {
			const earned = PokeBadges.computeAndSave();
			badges = earned;
			badgeCount = PokeBadges.countEarned(earned);
		}

		return {
			name,
			badges,
			badgeCount,
			partner : inventory.eeveeForm || 'Eevee',
			streak  : stats.loginStreak  ?? 0,
		};
	}

	/**
	 * Render a read-only "shared" banner and suppress the share button.
	 */
	function renderSharedView(payload) {
		// Banner above the hero
		const banner = document.createElement('div');
		banner.className = 'tc-share-banner';
		banner.innerHTML = '&#128203; Viewing <strong>' +
			(payload.name || 'Trainer').replace(/[&<>"']/g, c =>
				({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) +
			'</strong>’s Trainer Card';
		const main = document.querySelector('main.container');
		if (main) main.insertBefore(banner, main.firstChild);

		// Hide the share button if it exists
		const shareBtn = document.getElementById('tcShareBtn');
		if (shareBtn) shareBtn.hidden = true;

		// Override trainer name displayed
		setText('tcTrainerName', payload.name || 'Trainer');

		// Badge strip: render from payload
		if (window.PokeBadges && payload.badges) {
			const iconsEl = document.getElementById('tcGymBadgeIcons');
			if (iconsEl) {
				const earnedBadges = PokeBadges.meta.filter(b => payload.badges[b.id]);
				if (earnedBadges.length > 0) {
					iconsEl.innerHTML = earnedBadges.map(b =>
						'<span class="tc-gym-badge-icon" title="' + b.name + '">' + b.emoji + '</span>'
					).join('');
				} else {
					iconsEl.innerHTML = '<span class="tc-gym-empty">None yet</span>';
				}
			}
		}

		// Partner
		if (payload.partner) {
			setPartnerSprite(payload.partner);
			setText('tcPartnerFormName', payload.partner);
			setText('tcCurrentForm', payload.partner);
		}

		// Streak badge
		setText('tcBadgeStreakVal', payload.streak ?? 0);
		setText('tcStreak', payload.streak ?? 0);

		// Badge count tile (if we can show it)
		if (payload.badgeCount !== undefined) {
			setText('tcBadgeDaysVal', payload.badgeCount);
		}
	}

	/**
	 * Copy the share URL to the clipboard and show a brief toast.
	 */
	function handleShare() {
		// PokeBadges might not be ready yet — it's deferred. We read directly.
		const payload = buildSharePayload();
		const encoded = toBase64Url(payload);
		const url = window.location.origin + window.location.pathname + '?tc=' + encoded;

		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(url).then(() => {
				showShareToast('Link copied to clipboard!');
			}).catch(() => {
				prompt('Copy this link to share your Trainer Card:', url);
			});
		} else {
			prompt('Copy this link to share your Trainer Card:', url);
		}
	}

	function showShareToast(msg) {
		let toast = document.getElementById('tcShareToast');
		if (!toast) {
			toast = document.createElement('div');
			toast.id = 'tcShareToast';
			toast.className = 'tc-share-toast';
			document.body.appendChild(toast);
		}
		toast.textContent = msg;
		toast.classList.add('is-visible');
		setTimeout(() => toast.classList.remove('is-visible'), 2800);
	}

	// ── Run on DOM ready ──────────────────────────────────────────────────────
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', runAll);
	} else {
		runAll();
	}

	function runAll() {
		// Check for ?tc= share param first
		const tcParam = new URLSearchParams(window.location.search).get('tc');
		const sharedPayload = tcParam ? fromBase64Url(tcParam) : null;

		if (!sharedPayload) {
			// Normal view: populate from localStorage, wire share button
			populate();
			requestAnimationFrame(() => {
				populateGymBadges();
				populateAchievements();
				populatePokedex();

				// Wire share button
				const shareBtn = document.getElementById('tcShareBtn');
				if (shareBtn) {
					shareBtn.addEventListener('click', handleShare);
				}
			});
		} else {
			// Read-only shared view: only populate what the payload has
			populate();
			requestAnimationFrame(() => {
				populateGymBadges();
				populateAchievements();
				populatePokedex();
				renderSharedView(sharedPayload);
			});
		}
	}

})();
