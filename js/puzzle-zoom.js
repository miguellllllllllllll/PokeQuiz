(function () {
	const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
	const DATA_URL = 'js/pokemon-data.json';

	const MODES = {
		casual:   { name: 'Casual',   hearts: Infinity, bestKey: 'pokequiz_zoom_best_casual' },
		standard: { name: 'Standard', hearts: 3,        bestKey: 'pokequiz_zoom_best_standard' },
		hardcore: { name: 'Hardcore', hearts: 1,        bestKey: 'pokequiz_zoom_best_hardcore' },
	};

	const ZOOM_LEVELS = [5.5, 4.2, 3.2, 2.3, 1.5, 1.0]; // 0 = max zoom

	function normalize(s) {
		return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
	}
	function getBest(k) { const n = Number(localStorage.getItem(k)); return Number.isFinite(n) && n > 0 ? n : 0; }
	function setBest(k, n) { try { localStorage.setItem(k, String(n)); } catch {} }
	function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
	function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

	let POOL = [];
	async function loadPool() {
		try { const r = await fetch(DATA_URL); POOL = await r.json(); }
		catch { POOL = [{ id: 25, name: 'Pikachu' }, { id: 6, name: 'Charizard' }, { id: 150, name: 'Mewtwo' }]; }
	}

	function createPicker(pool) {
		let deck = [];
		const recent = [];
		const BUF = Math.min(20, Math.floor(pool.length / 3));
		return {
			pick() {
				if (!deck.length) deck = shuffle([...pool]);
				let i = deck.findIndex((p) => !recent.includes(p.id));
				if (i < 0) i = 0;
				const p = deck.splice(i, 1)[0];
				recent.push(p.id);
				if (recent.length > BUF) recent.shift();
				return p;
			}
		};
	}

	function setModeCardsEnabled(on) {
		document.querySelectorAll('.mode-card').forEach((c) => {
			c.disabled = !on;
			c.style.opacity = on ? '' : '0.55';
			c.style.cursor = on ? '' : 'wait';
		});
	}

	function init() {
		const modeSelectEl = document.getElementById('modeSelect');
		const gameView = document.getElementById('gameView');
		const gameOverEl = document.getElementById('gameOver');
		const modeBadge = document.getElementById('modeBadge');
		const heartsRow = document.getElementById('heartsRow');
		const img = document.getElementById('zoomImg');
		const frame = document.getElementById('zoomFrame');
		const placeholder = document.getElementById('zoomPlaceholder');
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

		let mode, modeCfg, picker, current, revealed, zoomIdx, streak, best, hearts, ended, submitted;

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
				const inf = document.createElement('span');
				inf.className = 'hearts-infinite'; inf.textContent = '∞';
				heartsRow.appendChild(inf); return;
			}
			for (let i = 0; i < modeCfg.hearts; i++) {
				const h = document.createElement('span');
				h.className = 'heart ' + (i < hearts ? 'filled' : 'empty');
				h.textContent = '♥';
				heartsRow.appendChild(h);
			}
		}

		function setFeedback(m, cls = '') { feedback.innerHTML = m; feedback.className = 'feedback' + (cls ? ' ' + cls : ''); }

		function applyZoom() {
			const scale = ZOOM_LEVELS[zoomIdx];
			// Random pan, but stable per Pokémon. Hash from id.
			const seed = current ? current.id : 0;
			const px = ((seed * 37) % 60) - 30;
			const py = ((seed * 53) % 60) - 30;
			img.style.transform = `scale(${scale}) translate(${px}%, ${py}%)`;
		}

		function loadPokemon(p) {
			current = p; revealed = false; zoomIdx = 0;
			revealWrap.hidden = true;
			frame.classList.remove('is-revealed');
			img.classList.remove('is-loaded');
			placeholder.style.display = 'block';
			placeholder.textContent = 'Loading…';
			setFeedback('');
			input.value = ''; input.disabled = false;
			hintBtn.disabled = mode === 'hardcore';
			skipBtn.hidden = mode !== 'casual';
			nextBtn.hidden = true;
			submitBtn.disabled = false;

			const tmp = new Image();
			tmp.onload = () => {
				img.src = tmp.src;
				img.classList.add('is-loaded');
				placeholder.style.display = 'none';
				applyZoom();
				input.focus();
			};
			tmp.onerror = () => {
				placeholder.textContent = 'Sprite unavailable — skipping…';
				setTimeout(nextPokemon, 800);
			};
			tmp.src = `${SPRITE_BASE}${p.id}.png`;
		}

		function nextPokemon() { if (!ended) loadPokemon(picker.pick()); }

		function isMatch(input, p) {
			const g = normalize(input);
			if (!g) return false;
			return [p.name, ...(p.aliases || [])].some((c) => normalize(c) === g);
		}

		function postLeaderboard() {
			if (submitted) return;
			submitted = true;
			const name = (sessionStorage.getItem('playerName') || localStorage.getItem('playerName') || '').trim();
			const pid = (window.PokeProfile && window.PokeProfile.playerId) || localStorage.getItem('pokequiz_player_id') || '';
			if (!name || !pid || streak <= 0) return;
			window.PokeUtil.submitScore({ game: 'zoom', name, score: streak, mode, playerId: pid });
		}

		function reveal(correct) {
			revealed = true;
			zoomIdx = ZOOM_LEVELS.length - 1;
			applyZoom();
			frame.classList.add('is-revealed');
			revealName.textContent = current.name;
			revealWrap.hidden = false;
			input.disabled = true;
			hintBtn.disabled = true;
			skipBtn.hidden = true;
			nextBtn.hidden = false;
			submitBtn.disabled = true;

			if (correct) {
				streak++;
				if (streak > best) { best = streak; setBest(modeCfg.bestKey, best); }
				streakNum.textContent = streak;
				bestNum.textContent = best;
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
			if (zoomIdx >= ZOOM_LEVELS.length - 2) { hintBtn.disabled = true; }
			zoomIdx = Math.min(zoomIdx + 1, ZOOM_LEVELS.length - 2);
			applyZoom();
			setFeedback(`Zoomed out (${ZOOM_LEVELS.length - 1 - zoomIdx} levels left).`, 'hint');
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
				input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
				input.select();
			}
		}

		function showGameOver() {
			postLeaderboard();
			modeSelectEl.hidden = true; gameView.hidden = true; gameOverEl.hidden = false;
			gameOverTitle.textContent = streak > 0 ? 'Run Complete' : 'Tough Crop!';
			finalStreak.textContent = streak; finalBest.textContent = best;
			gameOverMsg.innerHTML = current ? `You were stumped by <strong>${escapeHtml(current.name)}</strong>.` : 'Run ended.';
		}

		function startMode(m) {
			mode = m; modeCfg = MODES[m];
			modeBadge.textContent = modeCfg.name;
			modeBadge.dataset.mode = m;
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
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			if (revealed || ended) return;
			if (isMatch(input.value, current)) reveal(true);
			else handleWrong();
		});
		hintBtn.addEventListener('click', applyHint);
		skipBtn.addEventListener('click', () => { streak = 0; streakNum.textContent = 0; setFeedback(`Skipped — it was <strong>${escapeHtml(current.name)}</strong>.`, 'skipped'); reveal(false); });
		nextBtn.addEventListener('click', () => { if (ended) showGameOver(); else nextPokemon(); });
		quitBtn.addEventListener('click', () => { if (!confirm('End this run and return to mode select?')) return; ended = true; showGameOver(); });
		retryBtn.addEventListener('click', () => startMode(mode));
		changeModeBtn.addEventListener('click', () => showModeSelect());

		showModeSelect();
	}

	function boot() {
		setModeCardsEnabled(false);
		loadPool().then(() => { init(); setModeCardsEnabled(true); });
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
	else boot();
})();
