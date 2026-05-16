(function () {
	const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
	const DATA_URL = 'js/pokemon-data.json';
	const TYPES_URL = 'js/pokemon-types.json';

	const ALL_TYPES = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];

	const MODES = {
		mono:   { name: 'Mono',   hearts: 3, bestKey: 'pokequiz_type_best_mono',   filter: (t) => t.length === 1 },
		dual:   { name: 'Dual',   hearts: 3, bestKey: 'pokequiz_type_best_dual',   filter: (t) => t.length === 2 },
		random: { name: 'Random', hearts: 1, bestKey: 'pokequiz_type_best_random', filter: () => true },
	};

	function getBest(k) { const n = Number(localStorage.getItem(k)); return Number.isFinite(n) && n > 0 ? n : 0; }
	function setBest(k, n) { try { localStorage.setItem(k, String(n)); } catch {} }
	function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
	function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

	let POOLS = { mono: [], dual: [], random: [] };
	let TYPES_BY_ID = {};

	async function loadData() {
		try {
			const [pRes, tRes] = await Promise.all([fetch(DATA_URL), fetch(TYPES_URL)]);
			const pokemons = await pRes.json();
			const types = await tRes.json();
			for (const t of types) TYPES_BY_ID[t.id] = t.types;
			const enriched = pokemons.map((p) => ({ ...p, types: TYPES_BY_ID[p.id] || [] })).filter((p) => p.types.length);
			POOLS.mono = enriched.filter((p) => p.types.length === 1);
			POOLS.dual = enriched.filter((p) => p.types.length === 2);
			POOLS.random = enriched;
		} catch {
			POOLS.random = [{ id: 25, name: 'Pikachu', types: ['electric'] }];
			POOLS.mono = POOLS.random;
			POOLS.dual = [];
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
		const sprite = document.getElementById('typeSprite');
		const nameEl = document.getElementById('typeName');
		const hintEl = document.getElementById('typeHint');
		const grid = document.getElementById('typeGrid');
		const feedback = document.getElementById('feedback');
		const submitBtn = document.getElementById('submitBtn');
		const clearBtn = document.getElementById('clearBtn');
		const nextBtn = document.getElementById('nextBtn');
		const quitBtn = document.getElementById('quitBtn');
		const streakNum = document.getElementById('streakNum');
		const bestNum = document.getElementById('bestNum');
		const finalStreak = document.getElementById('finalStreak');
		const finalBest = document.getElementById('finalBest');
		const gameOverTitle = document.getElementById('gameOverTitle');
		const gameOverMsg = document.getElementById('gameOverMessage');
		const retryBtn = document.getElementById('retryBtn');
		const changeModeBtn = document.getElementById('changeModeBtn');

		let mode, modeCfg, picker, current, selected, revealed, streak, best, hearts, ended, submitted;

		// Build type buttons
		ALL_TYPES.forEach((t) => {
			const b = document.createElement('button');
			b.type = 'button';
			b.className = `type-btn type-${t}`;
			b.dataset.type = t;
			b.textContent = t;
			b.addEventListener('click', () => toggleType(t));
			grid.appendChild(b);
		});

		function paintBests() {
			document.getElementById('bestMono').textContent = getBest(MODES.mono.bestKey);
			document.getElementById('bestDual').textContent = getBest(MODES.dual.bestKey);
			document.getElementById('bestRandom').textContent = getBest(MODES.random.bestKey);
		}
		function showModeSelect() { paintBests(); modeSelectEl.hidden = false; gameView.hidden = true; gameOverEl.hidden = true; }
		function showGame() { modeSelectEl.hidden = true; gameView.hidden = false; gameOverEl.hidden = true; }

		function renderHearts() {
			heartsRow.innerHTML = '';
			for (let i = 0; i < modeCfg.hearts; i++) {
				const h = document.createElement('span'); h.className = 'heart ' + (i < hearts ? 'filled' : 'empty'); h.textContent = '♥'; heartsRow.appendChild(h);
			}
		}
		function setFeedback(m, cls = '') { feedback.innerHTML = m; feedback.className = 'feedback' + (cls ? ' ' + cls : ''); }

		function maxPicks() { return mode === 'mono' ? 1 : 2; }

		function toggleType(t) {
			if (revealed || ended) return;
			const idx = selected.indexOf(t);
			if (idx >= 0) selected.splice(idx, 1);
			else if (selected.length < maxPicks()) selected.push(t);
			else { selected.shift(); selected.push(t); }
			renderSelection();
		}

		function renderSelection() {
			grid.querySelectorAll('.type-btn').forEach((b) => {
				b.classList.toggle('is-selected', selected.includes(b.dataset.type));
			});
			submitBtn.disabled = selected.length === 0;
		}

		function loadPokemon(p) {
			current = p; revealed = false; selected = [];
			renderSelection();
			nameEl.textContent = p.name;
			hintEl.textContent = mode === 'mono' ? 'Pick 1 type' : (mode === 'dual' ? 'Pick 2 types' : 'Pick 1 or 2 types');
			sprite.src = `${SPRITE_BASE}${p.id}.png`;
			sprite.classList.remove('is-revealed');
			setFeedback('');
			nextBtn.hidden = true;
			submitBtn.hidden = false; submitBtn.disabled = true;
			clearBtn.hidden = false;
			grid.querySelectorAll('.type-btn').forEach((b) => { b.disabled = false; b.classList.remove('is-correct', 'is-wrong'); });
		}

		function nextPokemon() { if (!ended) loadPokemon(picker.pick()); }

		function setEq(a, b) {
			if (a.length !== b.length) return false;
			const A = new Set(a), B = new Set(b);
			for (const x of A) if (!B.has(x)) return false;
			return true;
		}

		function postLeaderboard() {
			if (submitted) return;
			submitted = true;
			const name = (sessionStorage.getItem('playerName') || localStorage.getItem('playerName') || '').trim();
			const pid = (window.PokeProfile && window.PokeProfile.playerId) || localStorage.getItem('pokequiz_player_id') || '';
			if (!name || !pid || streak <= 0) return;
			try { fetch('/api/leaderboard', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ game: 'type', name, score: streak, mode, playerId: pid }) }).catch(() => {}); } catch {}
		}

		function reveal(correct) {
			revealed = true;
			sprite.classList.add('is-revealed');
			grid.querySelectorAll('.type-btn').forEach((b) => {
				b.disabled = true;
				const t = b.dataset.type;
				if (current.types.includes(t)) b.classList.add('is-correct');
				else if (selected.includes(t)) b.classList.add('is-wrong');
			});
			submitBtn.hidden = true; clearBtn.hidden = true; nextBtn.hidden = false;

			if (correct) {
				streak++;
				if (streak > best) { best = streak; setBest(modeCfg.bestKey, best); }
				streakNum.textContent = streak; bestNum.textContent = best;
				setFeedback(`Correct! <strong>${current.name}</strong> is ${current.types.join('/')}. Streak: ${streak}`, 'correct');
				if (streak > 0 && streak % 5 === 0) {
					const card = document.querySelector('.puzzle-card');
					if (card) { const b = document.createElement('div'); b.className = 'streak-milestone'; b.textContent = `${streak} Streak!`; card.appendChild(b); setTimeout(() => b.remove(), 1400); }
				}
			} else {
				setFeedback(`Not quite &mdash; <strong>${current.name}</strong> is <strong>${current.types.join('/')}</strong>.`, 'wrong');
			}
			setTimeout(() => nextBtn.focus(), 200);
		}

		function loseHeart() { hearts = Math.max(0, hearts - 1); renderHearts(); return hearts <= 0; }

		function submitGuess() {
			if (revealed || ended || !selected.length) return;
			if (mode === 'mono' && selected.length !== 1) { setFeedback('Mono mode: pick exactly 1 type.', 'wrong'); return; }
			if (mode === 'dual' && selected.length !== 2) { setFeedback('Dual mode: pick exactly 2 types.', 'wrong'); return; }
			const correct = setEq(selected, current.types);
			if (correct) reveal(true);
			else {
				const out = loseHeart();
				if (out) {
					ended = true; reveal(false);
					postLeaderboard();
					setTimeout(showGameOver, 1400);
				} else {
					setFeedback(`Wrong &mdash; try again. Hearts left: ${hearts}`, 'wrong');
				}
			}
		}

		function showGameOver() {
			postLeaderboard();
			modeSelectEl.hidden = true; gameView.hidden = true; gameOverEl.hidden = false;
			gameOverTitle.textContent = streak > 0 ? 'Run Complete' : 'Out of Hearts';
			finalStreak.textContent = streak; finalBest.textContent = best;
			gameOverMsg.innerHTML = current ? `Last one: <strong>${escapeHtml(current.name)}</strong> &mdash; ${current.types.join('/')}.` : 'Run ended.';
		}

		function startMode(m) {
			mode = m; modeCfg = MODES[m];
			modeBadge.textContent = modeCfg.name; modeBadge.dataset.mode = m;
			hearts = modeCfg.hearts;
			streak = 0; best = getBest(modeCfg.bestKey);
			ended = false; submitted = false;
			streakNum.textContent = 0; bestNum.textContent = best;
			picker = createPicker(POOLS[m]);
			renderHearts();
			showGame();
			nextPokemon();
		}

		document.querySelectorAll('.mode-card').forEach((c) => c.addEventListener('click', () => MODES[c.dataset.mode] && startMode(c.dataset.mode)));
		submitBtn.addEventListener('click', submitGuess);
		clearBtn.addEventListener('click', () => { if (revealed) return; selected = []; renderSelection(); });
		nextBtn.addEventListener('click', () => { if (ended) showGameOver(); else nextPokemon(); });
		quitBtn.addEventListener('click', () => { if (!confirm('End this run?')) return; ended = true; showGameOver(); });
		retryBtn.addEventListener('click', () => startMode(mode));
		changeModeBtn.addEventListener('click', () => showModeSelect());

		showModeSelect();
	}

	function boot() { setModeCardsEnabled(false); loadData().then(() => { init(); setModeCardsEnabled(true); }); }
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
