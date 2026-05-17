(function () {
	const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
	const DATA_URL = 'js/pokemon-data.json';
	const FLAVOR_URL = 'js/pokemon-flavor.json';
	const TYPES_URL = 'js/pokemon-types.json';

	const MODES = {
		casual:   { name: 'Casual',   hearts: Infinity, bestKey: 'pokequiz_dex_best_casual' },
		standard: { name: 'Standard', hearts: 3,        bestKey: 'pokequiz_dex_best_standard' },
		hardcore: { name: 'Hardcore', hearts: 1,        bestKey: 'pokequiz_dex_best_hardcore' },
	};

	function normalize(s) {
		return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
	}
	function getBest(k) { const n = Number(localStorage.getItem(k)); return Number.isFinite(n) && n > 0 ? n : 0; }
	function setBest(k, n) { try { localStorage.setItem(k, String(n)); } catch {} }
	function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
	function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

	let POOL = [], FLAVOR_BY_ID = {}, TYPES_BY_ID = {};
	async function loadData() {
		try {
			const [pRes, fRes, tRes] = await Promise.all([fetch(DATA_URL), fetch(FLAVOR_URL), fetch(TYPES_URL)]);
			const pokemons = await pRes.json();
			const flavors = await fRes.json();
			const types = await tRes.json();
			for (const f of flavors) FLAVOR_BY_ID[f.id] = f.flavor;
			for (const t of types) TYPES_BY_ID[t.id] = t.types;
			POOL = pokemons.filter((p) => FLAVOR_BY_ID[p.id] && FLAVOR_BY_ID[p.id].length > 20);
		} catch {
			POOL = [{ id: 25, name: 'Pikachu' }];
		}
	}

	function createPicker(pool) {
		let deck = []; const recent = []; const BUF = Math.min(20, Math.floor(pool.length / 3));
		return { pick() {
			if (!deck.length) deck = shuffle([...pool]);
			let i = deck.findIndex((p) => !recent.includes(p.id));
			if (i < 0) i = 0;
			const p = deck.splice(i, 1)[0];
			recent.push(p.id); if (recent.length > BUF) recent.shift();
			return p;
		}};
	}

	function setModeCardsEnabled(on) {
		document.querySelectorAll('.mode-card').forEach((c) => { c.disabled = !on; c.style.opacity = on ? '' : '0.55'; c.style.cursor = on ? '' : 'wait'; });
	}

	function init() {
		const modeSelectEl = document.getElementById('modeSelect');
		const gameView = document.getElementById('gameView');
		const gameOverEl = document.getElementById('gameOver');
		const modeBadge = document.getElementById('modeBadge');
		const heartsRow = document.getElementById('heartsRow');
		const dexText = document.getElementById('dexText');
		const dexNum = document.getElementById('dexNum');
		const dexTypes = document.getElementById('dexTypes');
		const dexSprite = document.getElementById('dexSprite');
		const dexScreen = document.getElementById('dexScreen');
		const input = document.getElementById('guessInput');
		const form = document.getElementById('guessForm');
		const feedback = document.getElementById('feedback');
		const hintBtn = document.getElementById('hintBtn');
		const skipBtn = document.getElementById('skipBtn');
		const nextBtn = document.getElementById('nextBtn');
		const quitBtn = document.getElementById('quitBtn');
		const streakNum = document.getElementById('streakNum');
		const bestNum = document.getElementById('bestNum');
		const revealWrap = document.getElementById('revealNameWrap');
		const revealName = document.getElementById('revealName');
		const finalStreak = document.getElementById('finalStreak');
		const finalBest = document.getElementById('finalBest');
		const gameOverTitle = document.getElementById('gameOverTitle');
		const gameOverMsg = document.getElementById('gameOverMessage');
		const retryBtn = document.getElementById('retryBtn');
		const changeModeBtn = document.getElementById('changeModeBtn');
		const submitBtn = form.querySelector('button[type=submit]');

		let mode, modeCfg, picker, current, revealed, streak, best, hearts, ended, submitted;

		function paintBests() {
			document.getElementById('bestCasual').textContent = getBest(MODES.casual.bestKey);
			document.getElementById('bestStandard').textContent = getBest(MODES.standard.bestKey);
			document.getElementById('bestHardcore').textContent = getBest(MODES.hardcore.bestKey);
		}
		function showModeSelect() { paintBests(); modeSelectEl.hidden = false; gameView.hidden = true; gameOverEl.hidden = true; }
		function showGame() { modeSelectEl.hidden = true; gameView.hidden = false; gameOverEl.hidden = true; }

		function renderHearts() {
			heartsRow.innerHTML = '';
			if (modeCfg.hearts === Infinity) {
				const inf = document.createElement('span'); inf.className = 'hearts-infinite'; inf.textContent = '∞'; heartsRow.appendChild(inf); return;
			}
			for (let i = 0; i < modeCfg.hearts; i++) {
				const h = document.createElement('span'); h.className = 'heart ' + (i < hearts ? 'filled' : 'empty'); h.textContent = '♥'; heartsRow.appendChild(h);
			}
		}
		function setFeedback(m, cls = '') { feedback.innerHTML = m; feedback.className = 'feedback' + (cls ? ' ' + cls : ''); }

		function redactText(name, flavor) {
			// Additional safety: redact any literal name appearance in case prefetch missed it.
			let t = flavor || '';
			const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
			t = t.replace(re, '???');
			return t;
		}

		function loadPokemon(p) {
			current = p; revealed = false;
			revealWrap.hidden = true;
			dexScreen.classList.remove('is-revealed');
			dexNum.textContent = 'No. ???';
			dexTypes.hidden = true; dexTypes.innerHTML = '';
			dexSprite.hidden = true; dexSprite.src = '';
			dexText.textContent = redactText(p.name, FLAVOR_BY_ID[p.id]) || 'No entry on file…';
			setFeedback('');
			input.value = ''; input.disabled = false;
			hintBtn.disabled = mode === 'hardcore';
			skipBtn.hidden = mode !== 'casual';
			nextBtn.hidden = true;
			submitBtn.disabled = false;
			input.focus();
		}

		function nextPokemon() { if (!ended) loadPokemon(picker.pick()); }

		function isMatch(input, p) {
			const g = normalize(input); if (!g) return false;
			return [p.name, ...(p.aliases || [])].some((c) => normalize(c) === g);
		}

		function postLeaderboard() {
			if (submitted) return;
			submitted = true;
			const name = (sessionStorage.getItem('playerName') || localStorage.getItem('playerName') || '').trim();
			const pid = (window.PokeProfile && window.PokeProfile.playerId) || localStorage.getItem('pokequiz_player_id') || '';
			if (!name || !pid || streak <= 0) return;
			window.PokeUtil.submitScore({ game: 'dex', name, score: streak, mode, playerId: pid });
		}

		function reveal(correct) {
			revealed = true;
			dexNum.textContent = `No. ${String(current.id).padStart(4, '0')}`;
			dexSprite.src = `${SPRITE_BASE}${current.id}.png`;
			dexSprite.hidden = false;
			dexScreen.classList.add('is-revealed');
			revealName.textContent = current.name;
			revealWrap.hidden = false;
			input.disabled = true; hintBtn.disabled = true; skipBtn.hidden = true; nextBtn.hidden = false; submitBtn.disabled = true;

			if (correct) {
				streak++;
				if (streak > best) { best = streak; setBest(modeCfg.bestKey, best); }
				streakNum.textContent = streak; bestNum.textContent = best;
				setFeedback(`Correct! Streak: ${streak}`, 'correct');
				if (streak > 0 && streak % 5 === 0) {
					const card = document.querySelector('.puzzle-card');
					if (card) { const b = document.createElement('div'); b.className = 'streak-milestone'; b.textContent = `${streak} Streak!`; card.appendChild(b); setTimeout(() => b.remove(), 1400); }
				}
			}
			setTimeout(() => nextBtn.focus(), 200);
		}

		function loseHeart() { if (modeCfg.hearts === Infinity) return false; hearts = Math.max(0, hearts - 1); renderHearts(); return hearts <= 0; }

		function applyHint() {
			if (revealed || mode === 'hardcore') return;
			const types = TYPES_BY_ID[current.id] || [];
			if (!types.length) { setFeedback('No typing data available.', 'hint'); return; }
			dexTypes.innerHTML = types.map((t) => `<span class="type-pill type-${t}">${t}</span>`).join('');
			dexTypes.hidden = false;
			hintBtn.disabled = true;
			setFeedback(`Hint: it's <strong>${types.join(' / ')}</strong> type.`, 'hint');
		}

		function handleWrong() {
			const out = loseHeart();
			if (out) {
				ended = true; reveal(false);
				setFeedback(`Out of hearts &mdash; it was <strong>${escapeHtml(current.name)}</strong>.`, 'wrong');
				postLeaderboard();
				setTimeout(showGameOver, 1400);
			} else {
				const left = modeCfg.hearts === Infinity ? '∞' : hearts;
				setFeedback(`Not quite! Hearts left: ${left}`, 'wrong');
				input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake'); input.select();
			}
		}

		function showGameOver() {
			postLeaderboard();
			modeSelectEl.hidden = true; gameView.hidden = true; gameOverEl.hidden = false;
			gameOverTitle.textContent = streak > 0 ? 'Run Complete' : 'Stumped!';
			finalStreak.textContent = streak; finalBest.textContent = best;
			gameOverMsg.innerHTML = current ? `You were stumped by <strong>${escapeHtml(current.name)}</strong>.` : 'Run ended.';
		}

		function startMode(m) {
			mode = m; modeCfg = MODES[m];
			modeBadge.textContent = modeCfg.name; modeBadge.dataset.mode = m;
			hearts = modeCfg.hearts === Infinity ? Infinity : modeCfg.hearts;
			streak = 0; best = getBest(modeCfg.bestKey);
			ended = false; submitted = false;
			streakNum.textContent = 0; bestNum.textContent = best;
			picker = createPicker(POOL);
			renderHearts();
			skipBtn.hidden = m !== 'casual';
			showGame();
			nextPokemon();
		}

		document.querySelectorAll('.mode-card').forEach((c) => c.addEventListener('click', () => MODES[c.dataset.mode] && startMode(c.dataset.mode)));
		form.addEventListener('submit', (e) => { e.preventDefault(); if (revealed || ended) return; if (isMatch(input.value, current)) reveal(true); else handleWrong(); });
		hintBtn.addEventListener('click', applyHint);
		skipBtn.addEventListener('click', () => { streak = 0; streakNum.textContent = 0; setFeedback(`Skipped — it was <strong>${escapeHtml(current.name)}</strong>.`, 'skipped'); reveal(false); });
		nextBtn.addEventListener('click', () => { if (ended) showGameOver(); else nextPokemon(); });
		quitBtn.addEventListener('click', () => { if (!confirm('End this run?')) return; ended = true; showGameOver(); });
		retryBtn.addEventListener('click', () => startMode(mode));
		changeModeBtn.addEventListener('click', () => showModeSelect());

		showModeSelect();
	}

	function boot() { setModeCardsEnabled(false); loadData().then(() => { init(); setModeCardsEnabled(true); }); }
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
