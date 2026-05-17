(function () {
	const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
	const DATA_URL = 'js/pokemon-data.json';
	const STATS_URL = 'js/pokemon-stats.json';

	const MODES = {
		easy:   { name: 'Easy',   hearts: 5, choices: 4, bestKey: 'pokequiz_stats_best_easy' },
		medium: { name: 'Medium', hearts: 3, choices: 6, bestKey: 'pokequiz_stats_best_medium' },
		hard:   { name: 'Hard',   hearts: 1, choices: 8, bestKey: 'pokequiz_stats_best_hard' },
	};

	function getBest(k) { const n = Number(localStorage.getItem(k)); return Number.isFinite(n) && n > 0 ? n : 0; }
	function setBest(k, n) { try { localStorage.setItem(k, String(n)); } catch {} }
	function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
	function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

	let POOL = [];
	let STATS_BY_ID = {};
	async function loadData() {
		try {
			const [pRes, sRes] = await Promise.all([fetch(DATA_URL), fetch(STATS_URL)]);
			const pokemons = await pRes.json();
			const stats = await sRes.json();
			for (const s of stats) STATS_BY_ID[s.id] = s;
			POOL = pokemons.map((p) => ({ ...p, stats: STATS_BY_ID[p.id] })).filter((p) => p.stats);
		} catch {
			POOL = [];
		}
	}

	function setModeCardsEnabled(on) {
		document.querySelectorAll('.mode-card').forEach((c) => { c.disabled = !on; c.style.opacity = on ? '' : '0.55'; c.style.cursor = on ? '' : 'wait'; });
	}

	function drawRadar(svg, stats) {
		const cx = 120, cy = 120, R = 90;
		const axes = ['hp', 'atk', 'def', 'spd'];
		const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]; // up, right, down, left
		// Scale: use max of stats, with floor.
		const max = Math.max(stats.hp, stats.atk, stats.def, stats.spd, 60);

		// Concentric rings
		const rings = [];
		for (let r = 1; r <= 4; r++) {
			const rr = (R * r) / 4;
			const pts = angles.map((a) => `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`).join(' ');
			rings.push(`<polygon points="${pts}" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="1"/>`);
		}
		// Axes
		const axisLines = angles.map((a) => `<line x1="${cx}" y1="${cy}" x2="${cx + R * Math.cos(a)}" y2="${cy + R * Math.sin(a)}" stroke="rgba(0,0,0,0.18)" stroke-width="1"/>`).join('');
		// Stat polygon
		const pts = axes.map((k, i) => {
			const v = stats[k] / max;
			const r = R * v;
			return `${cx + r * Math.cos(angles[i])},${cy + r * Math.sin(angles[i])}`;
		}).join(' ');
		const fill = `<polygon points="${pts}" fill="rgba(238,21,21,0.32)" stroke="#c41e1e" stroke-width="2.5" stroke-linejoin="round"/>`;
		// Points
		const dots = axes.map((k, i) => {
			const v = stats[k] / max;
			const r = R * v;
			const x = cx + r * Math.cos(angles[i]);
			const y = cy + r * Math.sin(angles[i]);
			const color = { hp: '#22c55e', atk: '#ef4444', def: '#3b82f6', spd: '#eab308' }[k];
			return `<circle cx="${x}" cy="${y}" r="4.5" fill="${color}" stroke="#1a1a1a" stroke-width="1.5"/>`;
		}).join('');
		// Labels
		const labels = axes.map((k, i) => {
			const r = R + 16;
			const x = cx + r * Math.cos(angles[i]);
			const y = cy + r * Math.sin(angles[i]);
			return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="'Press Start 2P', monospace" font-size="9" fill="#1a1a1a">${k.toUpperCase()}</text>`;
		}).join('');

		svg.innerHTML = rings.join('') + axisLines + fill + dots + labels;
	}

	function init() {
		const modeSelectEl = document.getElementById('modeSelect');
		const gameView = document.getElementById('gameView');
		const gameOverEl = document.getElementById('gameOver');
		const modeBadge = document.getElementById('modeBadge');
		const heartsRow = document.getElementById('heartsRow');
		const radar = document.getElementById('statsRadar');
		const legHp = document.getElementById('legHp');
		const legAtk = document.getElementById('legAtk');
		const legDef = document.getElementById('legDef');
		const legSpd = document.getElementById('legSpd');
		const choices = document.getElementById('statsChoices');
		const feedback = document.getElementById('feedback');
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

		let mode, modeCfg, current, options, revealed, streak, best, hearts, ended, submitted;

		function paintBests() {
			document.getElementById('bestEasy').textContent = getBest(MODES.easy.bestKey);
			document.getElementById('bestMedium').textContent = getBest(MODES.medium.bestKey);
			document.getElementById('bestHard').textContent = getBest(MODES.hard.bestKey);
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

		function pickRound() {
			const target = POOL[Math.floor(Math.random() * POOL.length)];
			const pool = POOL.filter((p) => p.id !== target.id);
			const distractors = shuffle(pool).slice(0, modeCfg.choices - 1);
			options = shuffle([target, ...distractors]);
			current = target;
		}

		function renderChoices() {
			choices.innerHTML = '';
			options.forEach((p) => {
				const btn = document.createElement('button');
				btn.type = 'button';
				btn.className = 'stats-choice';
				btn.dataset.id = p.id;
				btn.innerHTML = `
					<img class="sc-sprite" src="${SPRITE_BASE}${p.id}.png" alt="${escapeHtml(p.name)}" loading="lazy">
					<span class="sc-name">${escapeHtml(p.name)}</span>
				`;
				btn.addEventListener('click', () => onChoice(p, btn));
				choices.appendChild(btn);
			});
		}

		function postLeaderboard() {
			if (submitted) return;
			submitted = true;
			const name = (sessionStorage.getItem('playerName') || localStorage.getItem('playerName') || '').trim();
			const pid = (window.PokeProfile && window.PokeProfile.playerId) || localStorage.getItem('pokequiz_player_id') || '';
			if (!name || !pid || streak <= 0) return;
			window.PokeUtil.submitScore({ game: 'stats', name, score: streak, mode, playerId: pid });
		}

		function reveal(correct, picked) {
			revealed = true;
			choices.querySelectorAll('.stats-choice').forEach((b) => {
				b.disabled = true;
				if (Number(b.dataset.id) === current.id) b.classList.add('is-correct');
				else if (picked && Number(b.dataset.id) === picked.id) b.classList.add('is-wrong');
			});
			nextBtn.hidden = false;
			if (correct) {
				streak++;
				if (streak > best) { best = streak; setBest(modeCfg.bestKey, best); }
				streakNum.textContent = streak; bestNum.textContent = best;
				setFeedback(`Correct! That spread belongs to <strong>${escapeHtml(current.name)}</strong>. Streak: ${streak}`, 'correct');
			} else {
				setFeedback(`Wrong &mdash; it was <strong>${escapeHtml(current.name)}</strong>.`, 'wrong');
			}
			setTimeout(() => nextBtn.focus(), 200);
		}

		function loseHeart() { hearts = Math.max(0, hearts - 1); renderHearts(); return hearts <= 0; }

		function onChoice(picked, btn) {
			if (revealed || ended) return;
			if (picked.id === current.id) {
				reveal(true, picked);
			} else {
				const out = loseHeart();
				if (out) {
					ended = true; reveal(false, picked);
					postLeaderboard();
					setTimeout(showGameOver, 1400);
				} else {
					btn.disabled = true;
					btn.classList.add('is-wrong');
					setFeedback(`Not that one. Hearts left: ${hearts}`, 'wrong');
				}
			}
		}

		function newRound() {
			if (ended) return;
			revealed = false;
			pickRound();
			drawRadar(radar, current.stats);
			legHp.textContent = current.stats.hp;
			legAtk.textContent = current.stats.atk;
			legDef.textContent = current.stats.def;
			legSpd.textContent = current.stats.spd;
			renderChoices();
			setFeedback('Pick the Pokémon whose base stats match the radar.');
			nextBtn.hidden = true;
		}

		function showGameOver() {
			postLeaderboard();
			modeSelectEl.hidden = true; gameView.hidden = true; gameOverEl.hidden = false;
			gameOverTitle.textContent = streak > 0 ? 'Run Complete' : 'Out of Hearts';
			finalStreak.textContent = streak; finalBest.textContent = best;
			gameOverMsg.innerHTML = current ? `Last spread: <strong>${escapeHtml(current.name)}</strong>.` : 'Run ended.';
		}

		function startMode(m) {
			mode = m; modeCfg = MODES[m];
			modeBadge.textContent = modeCfg.name; modeBadge.dataset.mode = m;
			hearts = modeCfg.hearts;
			streak = 0; best = getBest(modeCfg.bestKey);
			ended = false; submitted = false;
			streakNum.textContent = 0; bestNum.textContent = best;
			renderHearts();
			showGame();
			newRound();
		}

		document.querySelectorAll('.mode-card').forEach((c) => c.addEventListener('click', () => MODES[c.dataset.mode] && startMode(c.dataset.mode)));
		nextBtn.addEventListener('click', () => { if (ended) showGameOver(); else newRound(); });
		quitBtn.addEventListener('click', () => { if (!confirm('End this run?')) return; ended = true; showGameOver(); });
		retryBtn.addEventListener('click', () => startMode(mode));
		changeModeBtn.addEventListener('click', () => showModeSelect());

		showModeSelect();
	}

	function boot() { setModeCardsEnabled(false); loadData().then(() => { init(); setModeCardsEnabled(true); }); }
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
