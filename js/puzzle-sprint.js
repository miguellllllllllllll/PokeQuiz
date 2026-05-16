(function () {
	const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
	const DATA_URL = 'js/pokemon-data.json';

	const MODES = {
		'30':  { name: '30s',  seconds: 30,  bestKey: 'pokequiz_sprint_best_30' },
		'60':  { name: '60s',  seconds: 60,  bestKey: 'pokequiz_sprint_best_60' },
		'120': { name: '2min', seconds: 120, bestKey: 'pokequiz_sprint_best_120' },
	};

	function normalize(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, ''); }
	function getBest(k) { const n = Number(localStorage.getItem(k)); return Number.isFinite(n) && n > 0 ? n : 0; }
	function setBest(k, n) { try { localStorage.setItem(k, String(n)); } catch {} }
	function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
	function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

	let POOL = [];
	async function loadPool() {
		try { POOL = await (await fetch(DATA_URL)).json(); }
		catch { POOL = [{ id: 25, name: 'Pikachu' }]; }
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
		const clockEl = document.getElementById('sprintClock');
		const clockTime = document.getElementById('clockTime');
		const img = document.getElementById('sprintImg');
		const placeholder = document.getElementById('sprintPlaceholder');
		const input = document.getElementById('guessInput');
		const form = document.getElementById('guessForm');
		const feedback = document.getElementById('feedback');
		const skipBtn = document.getElementById('skipBtn');
		const quitBtn = document.getElementById('quitBtn');
		const caughtNum = document.getElementById('caughtNum');
		const bestNum = document.getElementById('bestNum');
		const finalCaught = document.getElementById('finalCaught');
		const finalBest = document.getElementById('finalBest');
		const gameOverTitle = document.getElementById('gameOverTitle');
		const gameOverMsg = document.getElementById('gameOverMessage');
		const retryBtn = document.getElementById('retryBtn');
		const changeModeBtn = document.getElementById('changeModeBtn');
		const submitBtn = form.querySelector('button[type=submit]');

		let mode, modeCfg, picker, current, caught, best, ended, submitted, timerStarted, endsAt, tickHandle;

		function paintBests() {
			document.getElementById('best30').textContent = getBest(MODES['30'].bestKey);
			document.getElementById('best60').textContent = getBest(MODES['60'].bestKey);
			document.getElementById('best120').textContent = getBest(MODES['120'].bestKey);
		}
		function showModeSelect() { paintBests(); modeSelectEl.hidden = false; gameView.hidden = true; gameOverEl.hidden = true; }
		function showGame() { modeSelectEl.hidden = true; gameView.hidden = false; gameOverEl.hidden = true; }

		function setFeedback(m, cls = '') { feedback.innerHTML = m; feedback.className = 'feedback' + (cls ? ' ' + cls : ''); }

		function fmtClock(sec) {
			sec = Math.max(0, Math.ceil(sec));
			const m = Math.floor(sec / 60);
			const s = sec % 60;
			return `${m}:${String(s).padStart(2, '0')}`;
		}

		function startTimer() {
			if (timerStarted) return;
			timerStarted = true;
			endsAt = performance.now() + modeCfg.seconds * 1000;
			tickHandle = setInterval(tick, 100);
			tick();
		}

		function tick() {
			const remain = (endsAt - performance.now()) / 1000;
			clockTime.textContent = fmtClock(remain);
			clockEl.classList.toggle('is-warning', remain <= 10 && remain > 0);
			if (remain <= 0) {
				clearInterval(tickHandle);
				tickHandle = null;
				ended = true;
				clockTime.textContent = '0:00';
				setTimeout(endRun, 200);
			}
		}

		function loadPokemon(p) {
			current = p;
			img.classList.remove('is-loaded');
			img.classList.add('is-silhouette');
			placeholder.style.display = 'block';
			placeholder.textContent = 'Loading…';
			input.value = '';
			input.disabled = false;
			submitBtn.disabled = false;

			const tmp = new Image();
			tmp.onload = () => {
				img.src = tmp.src;
				img.classList.add('is-loaded');
				placeholder.style.display = 'none';
				input.focus();
				startTimer();
			};
			tmp.onerror = () => { placeholder.textContent = 'Sprite unavailable…'; setTimeout(nextPokemon, 400); };
			tmp.src = `${SPRITE_BASE}${p.id}.png`;
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
			if (!name || !pid || caught <= 0) return;
			try { fetch('/api/leaderboard', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ game: 'sprint', name, score: caught, mode, playerId: pid }) }).catch(() => {}); } catch {}
		}

		function endRun() {
			if (tickHandle) { clearInterval(tickHandle); tickHandle = null; }
			ended = true;
			input.disabled = true; submitBtn.disabled = true;
			postLeaderboard();
			if (caught > best) { best = caught; setBest(modeCfg.bestKey, best); }
			finalCaught.textContent = caught;
			finalBest.textContent = best;
			gameOverTitle.textContent = caught > 0 ? "Time's Up!" : 'Run Ended';
			gameOverMsg.innerHTML = `You caught <strong>${caught}</strong> Pok&eacute;mon in ${modeCfg.name}.`;
			modeSelectEl.hidden = true; gameView.hidden = true; gameOverEl.hidden = false;
		}

		function handleGuess() {
			if (ended) return;
			if (!current) return;
			if (isMatch(input.value, current)) {
				caught++;
				caughtNum.textContent = caught;
				setFeedback(`Caught <strong>${escapeHtml(current.name)}</strong>!`, 'correct');
				nextPokemon();
			} else {
				setFeedback('Not quite — keep going.', 'wrong');
				input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
				input.select();
			}
		}

		function startMode(m) {
			mode = m; modeCfg = MODES[m];
			modeBadge.textContent = modeCfg.name; modeBadge.dataset.mode = m;
			caught = 0; best = getBest(modeCfg.bestKey);
			ended = false; submitted = false; timerStarted = false;
			caughtNum.textContent = 0; bestNum.textContent = best;
			clockTime.textContent = fmtClock(modeCfg.seconds);
			clockEl.classList.remove('is-warning');
			picker = createPicker(POOL);
			showGame();
			setFeedback('Loading first Pokémon…');
			nextPokemon();
		}

		document.querySelectorAll('.mode-card').forEach((c) => c.addEventListener('click', () => MODES[c.dataset.mode] && startMode(c.dataset.mode)));
		form.addEventListener('submit', (e) => { e.preventDefault(); handleGuess(); });
		skipBtn.addEventListener('click', () => { if (ended) return; setFeedback(`Skipped — that was <strong>${escapeHtml(current.name)}</strong>.`, 'skipped'); nextPokemon(); });
		quitBtn.addEventListener('click', () => { if (!confirm('End this run early?')) return; endRun(); });
		retryBtn.addEventListener('click', () => startMode(mode));
		changeModeBtn.addEventListener('click', () => showModeSelect());

		showModeSelect();
	}

	function boot() { setModeCardsEnabled(false); loadPool().then(() => { init(); setModeCardsEnabled(true); }); }
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
