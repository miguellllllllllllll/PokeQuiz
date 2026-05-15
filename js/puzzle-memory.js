(function () {
	const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
	const DATA_URL = 'js/pokemon-data.json';
	const BEST_KEY_PREFIX = 'pokequiz_memory_best_';

	const DIFFICULTIES = {
		6: { name: 'Easy', cols: 4, rows: 3 },
		8: { name: 'Medium', cols: 4, rows: 4 },
		12: { name: 'Hard', cols: 6, rows: 4 },
	};

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

	function fmtTime(ms) {
		const totalSec = Math.floor(ms / 1000);
		const m = Math.floor(totalSec / 60);
		const s = totalSec % 60;
		return `${m}:${String(s).padStart(2, '0')}`;
	}

	function getBestTime(pairs) {
		const raw = localStorage.getItem(BEST_KEY_PREFIX + pairs);
		const n = Number(raw);
		return Number.isFinite(n) && n > 0 ? n : null;
	}
	function setBestTime(pairs, ms) {
		try { localStorage.setItem(BEST_KEY_PREFIX + pairs, String(ms)); } catch {}
	}

	async function loadPool() {
		const r = await fetch(DATA_URL);
		return r.json();
	}

	function init(pool) {
		const introEl = document.getElementById('mmIntro');
		const gameEl = document.getElementById('mmGame');
		const gameOverEl = document.getElementById('mmGameOver');
		const startBtn = document.getElementById('mmStartBtn');
		const gridOptions = document.querySelectorAll('.mm-grid-opt');
		const diffBadge = document.getElementById('mmDiffBadge');
		const board = document.getElementById('mmBoard');
		const movesEl = document.getElementById('mmMoves');
		const timeEl = document.getElementById('mmTime');
		const pairsEl = document.getElementById('mmPairs');
		const restartBtn = document.getElementById('mmRestartBtn');
		const endBtn = document.getElementById('mmEndBtn');

		const finalTime = document.getElementById('mmFinalTime');
		const finalMoves = document.getElementById('mmFinalMoves');
		const bestTimeEl = document.getElementById('mmBestTime');
		const goTitle = document.getElementById('mmGameOverTitle');
		const goMessage = document.getElementById('mmGameOverMessage');
		const goLabel = document.getElementById('mmGoLabel');
		const againBtn = document.getElementById('mmAgainBtn');
		const changeBtn = document.getElementById('mmChangeBtn');

		let chosenPairs = 6;
		let cards = [];     // { id, pokemon, el, matched, flipped }
		let first = null;
		let lock = false;
		let moves = 0;
		let matched = 0;
		let startedAt = 0;
		let timer = null;
		let ended = false;

		gridOptions.forEach((b) => {
			b.addEventListener('click', () => {
				chosenPairs = Number(b.dataset.pairs);
				gridOptions.forEach((x) => x.classList.toggle('selected', x === b));
			});
		});

		function paintBests() {
			[6, 8, 12].forEach((n) => {
				const el = document.getElementById(`mmBest${n}`);
				if (!el) return;
				const ms = getBestTime(n);
				el.textContent = ms ? fmtTime(ms) : '—';
			});
		}
		paintBests();

		function startGame() {
			introEl.hidden = true;
			gameOverEl.hidden = true;
			gameEl.hidden = false;
			ended = false;

			const diff = DIFFICULTIES[chosenPairs];
			diffBadge.textContent = diff.name;
			board.style.setProperty('--mm-cols', diff.cols);
			board.style.setProperty('--mm-rows', diff.rows);

			// Pick N unique pokemon, double them, shuffle
			const picks = shuffle([...pool]).slice(0, chosenPairs);
			const deck = shuffle([...picks, ...picks].map((p, i) => ({ id: i, pokemon: p, matched: false, flipped: false })));

			cards = deck;
			first = null;
			lock = false;
			moves = 0;
			matched = 0;
			updateMeta();
			pairsEl.textContent = `0/${chosenPairs}`;
			startedAt = Date.now();
			if (timer) clearInterval(timer);
			timer = setInterval(() => {
				timeEl.textContent = fmtTime(Date.now() - startedAt);
			}, 250);

			board.innerHTML = '';
			cards.forEach((c) => {
				const el = document.createElement('button');
				el.type = 'button';
				el.className = 'mm-tile';
				el.setAttribute('aria-label', 'Pokémon card, face down');
				el.innerHTML = `
					<span class="mm-tile-inner">
						<span class="mm-tile-front">
							<img src="Pictures/pokeball.png" alt="">
						</span>
						<span class="mm-tile-back">
							<img class="mm-tile-img" src="${SPRITE_BASE}${c.pokemon.id}.png" alt="${escapeHtml(c.pokemon.name)}" loading="lazy">
							<span class="mm-tile-name">${escapeHtml(c.pokemon.name)}</span>
						</span>
					</span>
				`;
				el.addEventListener('click', () => onTileClick(c));
				c.el = el;
				board.appendChild(el);
			});
		}

		function escapeHtml(s) {
			return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
		}

		function updateMeta() {
			movesEl.textContent = moves;
		}

		function onTileClick(c) {
			if (lock || c.flipped || c.matched || ended) return;
			c.flipped = true;
			c.el.classList.add('is-flipped');
			if (!first) {
				first = c;
				return;
			}
			// Second card: count a move, compare
			moves++;
			updateMeta();
			if (first.pokemon.id === c.pokemon.id) {
				// Match
				const a = first, b = c;
				b.matched = true;
				a.matched = true;
				first = null;
				matched++;
				pairsEl.textContent = `${matched}/${chosenPairs}`;
				// Wait for the second card's flip to finish before adding the
				// matched class — otherwise the scale-pop animation fights the
				// in-flight rotation and the pokeball-front flashes through.
				setTimeout(() => {
					a.el.classList.add('is-matched');
					b.el.classList.add('is-matched');
				}, 520);
				if (matched === chosenPairs) {
					setTimeout(finishGame, 900);
				}
			} else {
				// No match — flip back after a short delay
				lock = true;
				const a = first, b = c;
				first = null;
				setTimeout(() => {
					a.flipped = false;
					b.flipped = false;
					a.el.classList.remove('is-flipped');
					b.el.classList.remove('is-flipped');
					lock = false;
				}, 900);
			}
		}

		function spawnConfetti() {
			const card = document.querySelector('.puzzle-card');
			if (!card) return;
			const layer = document.createElement('div');
			layer.className = 'mm-confetti-layer';
			const colors = ['#ee1515', '#ffcb05', '#3b4cca', '#22c55e', '#ff7eb6', '#8b3aff'];
			const pieces = 36;
			for (let i = 0; i < pieces; i++) {
				const p = document.createElement('span');
				p.className = 'mm-confetti';
				p.style.background = colors[i % colors.length];
				p.style.left = (50 + (Math.random() - 0.5) * 16) + '%';
				p.style.setProperty('--dx', `${(Math.random() - 0.5) * 600}px`);
				p.style.setProperty('--dy', `${300 + Math.random() * 400}px`);
				p.style.setProperty('--rot', `${(Math.random() - 0.5) * 1080}deg`);
				p.style.animationDelay = `${Math.random() * 0.18}s`;
				layer.appendChild(p);
			}
			card.appendChild(layer);
			setTimeout(() => layer.remove(), 2400);
		}

		function postLeaderboard(elapsedMs) {
			const playerName = (sessionStorage.getItem('playerName') || localStorage.getItem('playerName') || '').trim();
			const playerId = localStorage.getItem('pokequiz_player_id') || '';
			if (!playerName || !playerId) return;
			try {
				fetch('/api/leaderboard', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ game: 'memory', name: playerName, score: elapsedMs, mode: String(chosenPairs) , playerId }),
				}).catch(() => {});
			} catch {}
		}

		function finishGame() {
			ended = true;
			clearInterval(timer);
			const elapsed = Date.now() - startedAt;
			const prevBest = getBestTime(chosenPairs);
			const isBest = prevBest === null || elapsed < prevBest;
			if (isBest) setBestTime(chosenPairs, elapsed);
			paintBests();
			spawnConfetti();
			postLeaderboard(elapsed);

			gameEl.hidden = true;
			gameOverEl.hidden = false;
			gameOverEl.classList.remove('is-defeat');
			gameOverEl.classList.add('is-victory');
			goLabel.textContent = 'Match Complete';
			goTitle.textContent = isBest ? 'New Personal Best!' : 'Match Complete!';
			finalTime.textContent = fmtTime(elapsed);
			finalMoves.textContent = moves;
			const best = getBestTime(chosenPairs);
			bestTimeEl.textContent = best === null ? '—' : fmtTime(best);
			goMessage.innerHTML = isBest
				? `You cleared <strong>${chosenPairs}</strong> pairs in <strong>${fmtTime(elapsed)}</strong> — your fastest yet!`
				: `You cleared <strong>${chosenPairs}</strong> pairs. Your best on ${DIFFICULTIES[chosenPairs].name} stays at <strong>${fmtTime(prevBest)}</strong>.`;
		}

		startBtn.addEventListener('click', startGame);
		restartBtn.addEventListener('click', () => {
			if (!confirm('Restart this board?')) return;
			startGame();
		});
		endBtn.addEventListener('click', () => {
			if (!confirm('End this run? Your time won\'t be saved.')) return;
			ended = true;
			clearInterval(timer);
			introEl.hidden = false;
			gameEl.hidden = true;
			gameOverEl.hidden = true;
		});
		againBtn.addEventListener('click', startGame);
		changeBtn.addEventListener('click', () => {
			introEl.hidden = false;
			gameEl.hidden = true;
			gameOverEl.hidden = true;
		});
	}

	(async function boot() {
		const pool = await loadPool();
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => init(pool));
		} else {
			init(pool);
		}
	})();
})();
