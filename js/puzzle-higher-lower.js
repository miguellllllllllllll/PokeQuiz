(function () {
	const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
	const DATA_URL = 'js/pokemon-data.json';
	const STATS_URL = 'js/pokemon-stats.json';
	const BEST_KEY = 'pokequiz_hl_best';
	const STAT_KEY = 'pokequiz_hl_stat';

	const STATS = {
		weight: { field: 'w',  label: 'Weight',  unit: 'kg', mult: 0.1, icon: '⚖️' },
		height: { field: 'h',  label: 'Height',  unit: 'm',  mult: 0.1, icon: '📏' },
		hp:     { field: 'hp', label: 'HP',      unit: '',   mult: 1,   icon: '❤️' },
		atk:    { field: 'atk',label: 'Attack',  unit: '',   mult: 1,   icon: '⚔️' },
		spd:    { field: 'spd',label: 'Speed',   unit: '',   mult: 1,   icon: '⚡' },
	};
	const RANDOM_OPTIONS = Object.keys(STATS);

	function getBest() {
		const n = Number(localStorage.getItem(BEST_KEY));
		return Number.isFinite(n) && n > 0 ? n : 0;
	}
	function setBest(n) { try { localStorage.setItem(BEST_KEY, String(n)); } catch {} }

	function shuffle(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const r = (typeof crypto !== 'undefined' && crypto.getRandomValues)
				? crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32
				: Math.random();
			const j = Math.floor(r * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	function statValue(p, key) {
		const s = STATS[key];
		return s ? p[s.field] : undefined;
	}

	function formatStat(p, key) {
		const s = STATS[key];
		const raw = statValue(p, key);
		if (raw == null) return '?';
		const v = raw * s.mult;
		if (s.unit) {
			return v >= 100 ? `${v.toFixed(0)} ${s.unit}` : `${v.toFixed(1)} ${s.unit}`;
		}
		return String(raw);
	}

	function escapeHtml(s) {
		return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
	}

	async function loadDataset() {
		const [pokemon, stats] = await Promise.all([
			fetch(DATA_URL).then(r => r.json()),
			fetch(STATS_URL).then(r => r.json()),
		]);
		const byId = new Map(pokemon.map(p => [p.id, p]));
		// Merge stats into pokemon entries
		const merged = stats
			.filter(s => byId.has(s.id))
			.map(s => Object.assign({}, s, { name: byId.get(s.id).name }));
		return merged;
	}

	function init(pool) {
		const introEl = document.getElementById('hlIntro');
		const gameEl = document.getElementById('hlGame');
		const gameOverEl = document.getElementById('hlGameOver');
		const startBtn = document.getElementById('hlStartBtn');
		const statOptions = document.querySelectorAll('.hl-stat-opt');
		const statBadge = document.getElementById('hlStatBadge');

		const leftEl = document.getElementById('hlLeft');
		const rightEl = document.getElementById('hlRight');
		const leftImg = document.getElementById('hlLeftImg');
		const rightImg = document.getElementById('hlRightImg');
		const leftName = document.getElementById('hlLeftName');
		const rightName = document.getElementById('hlRightName');
		const leftStat = document.getElementById('hlLeftStat');
		const rightStat = document.getElementById('hlRightStat');
		const leftStatName = document.getElementById('hlLeftStatName');
		const rightStatName = document.getElementById('hlRightStatName');

		const ctaButtons = document.querySelectorAll('.hl-cta[data-pick]');
		const continueBtn = document.getElementById('hlContinueBtn');
		const endBtn = document.getElementById('hlEndBtn');
		const streakNum = document.getElementById('hlStreak');
		const bestNum = document.getElementById('hlBest');
		const feedback = document.getElementById('hlFeedback');

		const finalStreak = document.getElementById('hlFinalStreak');
		const finalBest = document.getElementById('hlFinalBest');
		const goTitle = document.getElementById('hlGameOverTitle');
		const goMessage = document.getElementById('hlGameOverMessage');
		const retryBtn = document.getElementById('hlRetryBtn');

		let chosenStat = localStorage.getItem(STAT_KEY) || 'weight';
		if (!STATS[chosenStat] && chosenStat !== 'random') chosenStat = 'weight';

		statOptions.forEach((b) => {
			b.classList.toggle('selected', b.dataset.stat === chosenStat);
			b.addEventListener('click', () => {
				chosenStat = b.dataset.stat;
				try { localStorage.setItem(STAT_KEY, chosenStat); } catch {}
				statOptions.forEach((x) => x.classList.toggle('selected', x === b));
			});
		});

		let activeStat = chosenStat;
		let left = null;
		let right = null;
		let streak = 0;
		let best = getBest();
		let ended = false;
		let submitted = false;
		bestNum.textContent = best;

		function pickStat() {
			if (chosenStat === 'random') {
				return RANDOM_OPTIONS[Math.floor(Math.random() * RANDOM_OPTIONS.length)];
			}
			return chosenStat;
		}

		function pickPokemon(exclude) {
			let p; let tries = 0;
			do {
				p = pool[Math.floor(Math.random() * pool.length)];
				tries++;
			} while (exclude && exclude.id === p.id && tries < 12);
			return p;
		}

		function setFeedback(msg, cls = '') {
			feedback.innerHTML = msg;
			feedback.className = 'feedback' + (cls ? ' ' + cls : '');
		}

		function paintCard(side, p, statKey, showStat) {
			const img = side === 'left' ? leftImg : rightImg;
			const name = side === 'left' ? leftName : rightName;
			const stat = side === 'left' ? leftStat : rightStat;
			const statN = side === 'left' ? leftStatName : rightStatName;

			img.src = `${SPRITE_BASE}${p.id}.png`;
			img.alt = p.name;
			name.textContent = p.name;
			const s = STATS[statKey];
			statN.innerHTML = `<span class="hl-stat-icon" aria-hidden="true">${s.icon}</span> ${s.label}`;
			if (showStat) {
				stat.classList.remove('hl-stat-hidden');
				stat.textContent = formatStat(p, statKey);
			} else {
				stat.classList.add('hl-stat-hidden');
				stat.textContent = '???';
			}
		}

		function startGame() {
			introEl.hidden = true;
			gameEl.hidden = false;
			gameOverEl.hidden = true;
			streak = 0;
			ended = false;
			submitted = false;
			streakNum.textContent = streak;
			bestNum.textContent = best;
			activeStat = pickStat();
			statBadge.innerHTML = `${STATS[activeStat].icon} ${STATS[activeStat].label}`;
			left = pickPokemon();
			right = pickPokemon(left);
			paintCard('left', left, activeStat, true);
			paintCard('right', right, activeStat, false);
			rightEl.classList.remove('hl-correct', 'hl-wrong');
			continueBtn.hidden = true;
			ctaButtons.forEach((b) => { b.disabled = false; });
			setFeedback('');
		}

		function postLeaderboard() {
			if (submitted) return;
			submitted = true;
			const playerName = (sessionStorage.getItem('playerName') || localStorage.getItem('playerName') || '').trim();
			const playerId = (window.PokeProfile && window.PokeProfile.playerId) || localStorage.getItem('pokequiz_player_id') || '';
			if (!playerName || !playerId || streak <= 0) return;
			window.PokeUtil.submitScore({ game: 'higherlower', name: playerName, score: streak, mode: activeStat, playerId });
		}

		function showGameOver() {
			postLeaderboard();
			introEl.hidden = true;
			gameEl.hidden = true;
			gameOverEl.hidden = false;
			finalStreak.textContent = streak;
			finalBest.textContent = best;
			const beat = streak > 0 && streak === best && streak > 0;
			goTitle.textContent = beat ? 'New Personal Best!' : 'Run Ended';
			const lastName = right ? escapeHtml(right.name) : 'an unknown Pokémon';
			const leftName = left ? escapeHtml(left.name) : 'an unknown Pokémon';
			goMessage.innerHTML = `You ran out on <strong>${lastName}</strong> vs <strong>${leftName}</strong>. Final streak: <strong>${streak}</strong>.`;
		}

		function handlePick(pick) {
			if (ended) return;
			const lv = statValue(left, activeStat);
			const rv = statValue(right, activeStat);
			// Treat equal as a "win" — give the player the benefit of the doubt
			const correct = (pick === 'higher' && rv >= lv) || (pick === 'lower' && rv <= lv);
			ctaButtons.forEach((b) => { b.disabled = true; });
			rightStat.classList.remove('hl-stat-hidden');
			rightStat.textContent = formatStat(right, activeStat);

			if (correct) {
				streak++;
				if (streak > best) { best = streak; setBest(best); }
				streakNum.textContent = streak;
				bestNum.textContent = best;
				rightEl.classList.add('hl-correct');
				setFeedback(`Correct! Streak: ${streak}`, 'correct');
				continueBtn.hidden = false;
				setTimeout(() => continueBtn.focus(), 200);
			} else {
				rightEl.classList.add('hl-wrong');
				ended = true;
				setFeedback(`Not quite. ${right.name}'s ${STATS[activeStat].label.toLowerCase()} was <strong>${formatStat(right, activeStat)}</strong>.`, 'wrong');
				setTimeout(() => {
					document.querySelector('.puzzle-card').classList.add('is-losing');
					setTimeout(showGameOver, 1300);
				}, 900);
			}
		}

		function continueRun() {
			if (ended) return;
			// Right card slides into left, new mystery on the right
			left = right;
			right = pickPokemon(left);
			activeStat = pickStat();
			statBadge.innerHTML = `${STATS[activeStat].icon} ${STATS[activeStat].label}`;
			rightEl.classList.remove('hl-correct', 'hl-wrong');
			paintCard('left', left, activeStat, true);
			paintCard('right', right, activeStat, false);
			continueBtn.hidden = true;
			ctaButtons.forEach((b) => { b.disabled = false; });
			setFeedback('');
		}

		startBtn.addEventListener('click', startGame);
		continueBtn.addEventListener('click', continueRun);
		ctaButtons.forEach((b) => b.addEventListener('click', () => handlePick(b.dataset.pick)));
		endBtn.addEventListener('click', () => {
			if (!confirm('End this run? Your streak will be saved if it\'s a best.')) return;
			ended = true;
			showGameOver();
		});
		retryBtn.addEventListener('click', startGame);
	}

	(async function boot() {
		const pool = await loadDataset();
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => init(pool));
		} else {
			init(pool);
		}
	})();
})();
