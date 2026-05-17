(function () {
	function updateComboDisplay(s) {
		let el = document.getElementById('comboDisplay');
		if (!el) {
			el = document.createElement('div');
			el.id = 'comboDisplay';
			el.style.cssText = 'position:fixed;top:80px;right:16px;font-size:11px;font-weight:bold;color:#f6c84c;text-shadow:0 0 8px rgba(246,200,76,0.8);transition:all 0.2s;z-index:999;pointer-events:none;font-family:inherit';
			document.body.appendChild(el);
		}
		if (s >= 5) { el.textContent = '🔥 ×2 COMBO'; el.style.color = '#ff6030'; }
		else if (s >= 3) { el.textContent = '🔥 ×1.5 COMBO'; el.style.color = '#f6c84c'; }
		else { el.textContent = ''; }
	}

	const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
	const CRY_BASE = 'https://play.pokemonshowdown.com/audio/cries/';
	const DATA_URL = 'js/pokemon-data.json';

	const MODES = {
		casual: { name: 'Casual', hearts: Infinity, bestKey: 'pokequiz_cry_best_casual' },
		standard: { name: 'Standard', hearts: 3, bestKey: 'pokequiz_cry_best_standard' },
		hardcore: { name: 'Hardcore', hearts: 1, bestKey: 'pokequiz_cry_best_hardcore' }
	};

	function slugify(name) {
		return String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
	}

	function normalize(s) {
		return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
	}

	function getBest(modeKey) {
		const n = Number(localStorage.getItem(modeKey));
		return Number.isFinite(n) && n > 0 ? n : 0;
	}

	function setBest(modeKey, n) {
		try { localStorage.setItem(modeKey, String(n)); } catch {}
	}

	let POOL = [];
	let currentAudio = null;

	function preloadCry(name) {
		try {
			const audio = new Audio();
			audio.preload = 'auto';
			audio.volume = 0.55;
			audio.src = `${CRY_BASE}${slugify(name)}.mp3`;
			audio.load();
			currentAudio = audio;
		} catch { currentAudio = null; }
	}

	function playCry() {
		const a = currentAudio;
		if (!a) return;
		try {
			a.currentTime = 0;
			a.play().catch(() => {});
		} catch {}
	}

	function shuffleInPlace(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const r = (typeof crypto !== 'undefined' && crypto.getRandomValues)
				? crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32
				: Math.random();
			const j = Math.floor(r * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	function createPicker(pool) {
		let deck = [];
		const recentIds = [];
		const RECENT_BUFFER = Math.min(20, Math.floor(pool.length / 3));

		function refill() { deck = shuffleInPlace([...pool]); }
		function pick() {
			if (deck.length === 0) refill();
			let idx = deck.findIndex((p) => !recentIds.includes(p.id));
			if (idx === -1) idx = 0;
			const picked = deck.splice(idx, 1)[0];
			recentIds.push(picked.id);
			if (recentIds.length > RECENT_BUFFER) recentIds.shift();
			return picked;
		}
		return { pick };
	}

	async function loadPool() {
		try {
			const res = await fetch(DATA_URL);
			if (!res.ok) throw new Error('http ' + res.status);
			const data = await res.json();
			if (!Array.isArray(data) || !data.length) throw new Error('empty');
			POOL = data;
		} catch (err) {
			POOL = [
				{ id: 25, name: 'Pikachu' },
				{ id: 6, name: 'Charizard' },
				{ id: 150, name: 'Mewtwo' }
			];
			console.warn('Failed to load full pokedex; using fallback', err);
		}
	}

	function setModeCardsEnabled(enabled) {
		document.querySelectorAll('.mode-card').forEach((c) => {
			c.disabled = !enabled;
			c.style.opacity = enabled ? '' : '0.55';
			c.style.cursor = enabled ? '' : 'wait';
		});
	}

	function init() {
		const modeSelectEl = document.getElementById('modeSelect');
		const gameView = document.getElementById('gameView');
		const gameOverEl = document.getElementById('gameOver');
		const modeBadge = document.getElementById('modeBadge');
		const heartsRow = document.getElementById('heartsRow');

		const img = document.getElementById('silhouetteImg');
		const placeholder = document.getElementById('silhouettePlaceholder');
		const frame = img.closest('.silhouette-frame');
		const playCryBtn = document.getElementById('playCryBtn');
		const guessInput = document.getElementById('guessInput');
		const guessForm = document.getElementById('guessForm');
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
		const gameOverMessage = document.getElementById('gameOverMessage');
		const retryBtn = document.getElementById('retryBtn');
		const changeModeBtn = document.getElementById('changeModeBtn');
		const submitButton = guessForm.querySelector('button[type=submit]');

		let mode = null;
		let modeConfig = null;
		let picker = null;
		let current = null;
		let revealed = false;
		let hintLetters = 0;
		let streak = 0;
		let best = 0;
		let hearts = 0;
		let ended = false;
		let submitted = false;

		function paintBestsOnModeSelect() {
			document.getElementById('bestCasual').textContent = getBest(MODES.casual.bestKey);
			document.getElementById('bestStandard').textContent = getBest(MODES.standard.bestKey);
			document.getElementById('bestHardcore').textContent = getBest(MODES.hardcore.bestKey);
		}

		function showModeSelect() {
			paintBestsOnModeSelect();
			modeSelectEl.hidden = false;
			gameView.hidden = true;
			gameOverEl.hidden = true;
		}

		function showGame() {
			modeSelectEl.hidden = true;
			gameView.hidden = false;
			gameOverEl.hidden = true;
		}

		function triggerStreakMilestone(n) {
			const card = document.querySelector('.puzzle-card');
			if (!card) return;
			const burst = document.createElement('div');
			burst.className = 'streak-milestone';
			burst.textContent = `${n} Streak!`;
			card.appendChild(burst);
			setTimeout(() => burst.remove(), 1400);
		}

		function postLeaderboard() {
			if (submitted) return;
			submitted = true;
			const playerName = (sessionStorage.getItem('playerName') || localStorage.getItem('playerName') || '').trim();
			const playerId = (window.PokeProfile && window.PokeProfile.playerId) || localStorage.getItem('pokequiz_player_id') || '';
			if (!playerName || !playerId || streak <= 0) return;
			window.PokeUtil.submitScore({ game: 'cry', name: playerName, score: streak, mode, playerId });
		}

		function showGameOver(victory) {
			postLeaderboard();
			modeSelectEl.hidden = true;
			gameView.hidden = true;
			gameOverEl.hidden = false;
			gameOverEl.classList.toggle('is-victory', !!victory);
			gameOverEl.classList.toggle('is-defeat', !victory);
			gameOverTitle.textContent = victory ? 'Dex Complete!' : 'You Blacked Out!';
			finalStreak.textContent = streak;
			finalBest.textContent = best;
			const reason = victory
				? `You identified every Pokémon in the dex on ${modeConfig.name} mode. Incredible.`
				: current
					? `You were defeated by <strong>${escapeHtml(current.name)}</strong>.`
					: 'Run ended.';
			gameOverMessage.innerHTML = reason;
		}

		function escapeHtml(s) {
			return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
		}

		function renderHearts() {
			heartsRow.innerHTML = '';
			if (modeConfig.hearts === Infinity) {
				const inf = document.createElement('span');
				inf.className = 'hearts-infinite';
				inf.textContent = '∞';
				inf.title = 'Unlimited hearts';
				heartsRow.appendChild(inf);
				return;
			}
			for (let i = 0; i < modeConfig.hearts; i++) {
				const h = document.createElement('span');
				h.className = 'heart ' + (i < hearts ? 'filled' : 'empty');
				h.textContent = '♥';
				heartsRow.appendChild(h);
			}
		}

		function setFeedback(msg, cls = '') {
			feedback.innerHTML = msg;
			feedback.className = 'feedback' + (cls ? ' ' + cls : '');
		}

		function loadPokemon(p) {
			current = p;
			revealed = false;
			hintLetters = 0;
			revealWrap.hidden = true;
			frame.classList.remove('is-revealed', 'cry-ready', 'cry-revealed');
			frame.classList.add('cry-loading');
			img.hidden = true;
			img.classList.remove('is-loaded');
			img.classList.remove('is-silhouette');
			img.src = '';
			placeholder.hidden = true;
			if (playCryBtn) {
				playCryBtn.hidden = false;
				playCryBtn.disabled = true;
				playCryBtn.classList.remove('is-playing');
			}
			setFeedback('');
			guessInput.value = '';
			guessInput.disabled = false;
			hintBtn.disabled = false;
			skipBtn.hidden = mode !== 'casual';
			nextBtn.hidden = true;
			submitButton.disabled = false;

			// Preload the sprite quietly for the reveal moment, no silhouette
			// painting beforehand — this is an audio-only round.
			const tempImg = new Image();
			tempImg.onload = () => {
				img.src = tempImg.src;
				img.classList.add('is-loaded');
			};
			tempImg.onerror = () => {
				setTimeout(nextPokemon, 800);
			};
			tempImg.src = `${SPRITE_BASE}${p.id}.png`;

			preloadCry(p.name);
			// Give the cry a moment to start buffering before enabling play.
			if (playCryBtn) {
				setTimeout(() => {
					if (current === p) {
						playCryBtn.disabled = false;
						frame.classList.remove('cry-loading');
						frame.classList.add('cry-ready');
						// Auto-play the first cry so the player hears it immediately,
						// then they can replay manually.
						playCry();
						playCryBtn.classList.add('is-playing');
						setTimeout(() => playCryBtn.classList.remove('is-playing'), 1800);
						guessInput.focus();
					}
				}, 400);
			}
		}

		function nextPokemon() {
			if (ended) return;
			loadPokemon(picker.pick());
		}

		function isMatch(input, p) {
			const guess = normalize(input);
			if (!guess) return false;
			const candidates = [p.name, ...(p.aliases || [])];
			return candidates.some((c) => normalize(c) === guess);
		}

		function reveal(correct) {
			revealed = true;
			img.hidden = false;
			img.classList.remove('is-silhouette');
			img.classList.add('is-loaded');
			if (playCryBtn) playCryBtn.hidden = true;
			frame.classList.add('cry-revealed');
			revealName.textContent = current.name;
			revealWrap.hidden = false;
			frame.classList.add('is-revealed');
			guessInput.disabled = true;
			hintBtn.disabled = true;
			skipBtn.hidden = true;
			nextBtn.hidden = false;
			submitButton.disabled = true;

			if (correct) {
				streak++;
				if (streak > best) {
					best = streak;
					setBest(modeConfig.bestKey, best);
				}
				streakNum.textContent = streak;
				bestNum.textContent = best;
				setFeedback(`Correct! Streak: ${streak}`, 'correct');
				// Update combo indicator
				if (typeof updateComboDisplay === 'function') updateComboDisplay(streak);
				if (streak > 0 && streak % 5 === 0) {
					triggerStreakMilestone(streak);
				}
			}
			// On a wrong reveal, callers (skip, out-of-hearts) own the streak
			// reset themselves so that postLeaderboard sees the run's final
			// streak before any reset.
			playCry();
			setTimeout(() => nextBtn.focus(), 200);
		}

		function loseHeart() {
			if (modeConfig.hearts === Infinity) return false;
			hearts = Math.max(0, hearts - 1);
			renderHearts();
			return hearts <= 0;
		}

		function applyHint() {
			if (revealed) return;
			hintLetters = Math.min(hintLetters + 1, current.name.length - 1);
			const name = current.name;
			const masked = name.split('').map((ch, i) => {
				if (i < hintLetters) return ch;
				if (!/[a-zA-Z0-9]/.test(ch)) return ch;
				return '_';
			}).join(' ');
			setFeedback(`Hint: ${masked}`, 'hint');
			if (hintLetters >= current.name.length - 1) hintBtn.disabled = true;
		}

		function handleWrongGuess() {
			if (typeof updateComboDisplay === 'function') updateComboDisplay(0);
			const out = loseHeart();
			if (out) {
				ended = true;
				reveal(false);
				setFeedback(`Out of hearts &mdash; it was <strong>${escapeHtml(current.name)}</strong>.`, 'wrong');
				const card = document.querySelector('.puzzle-card');
				if (card) {
					card.classList.remove('is-losing');
					void card.offsetWidth;
					card.classList.add('is-losing');
				}
				setTimeout(() => showGameOver(false), 1400);
			} else {
				const heartsLeft = modeConfig.hearts === Infinity ? '∞' : hearts;
				setFeedback(`Not quite! Hearts left: ${heartsLeft}`, 'wrong');
				guessInput.classList.remove('shake');
				void guessInput.offsetWidth;
				guessInput.classList.add('shake');
				guessInput.select();
			}
		}

		function startMode(modeKey) {
			mode = modeKey;
			modeConfig = MODES[modeKey];
			modeBadge.textContent = modeConfig.name;
			modeBadge.dataset.mode = modeKey;
			hearts = modeConfig.hearts === Infinity ? Infinity : modeConfig.hearts;
			streak = 0;
			best = getBest(modeConfig.bestKey);
			ended = false;
			submitted = false;
			streakNum.textContent = streak;
			bestNum.textContent = best;
			picker = createPicker(POOL);
			renderHearts();
			// Skip is only available in casual; standard/hardcore force a guess.
			skipBtn.hidden = modeKey !== 'casual';
			showGame();
			nextPokemon();
		}

		// Mode select buttons
		document.querySelectorAll('.mode-card').forEach((card) => {
			card.addEventListener('click', () => {
				const m = card.dataset.mode;
				if (MODES[m]) startMode(m);
			});
		});

		// Guess form
		guessForm.addEventListener('submit', (e) => {
			e.preventDefault();
			if (revealed || ended) return;
			if (isMatch(guessInput.value, current)) {
				reveal(true);
			} else {
				handleWrongGuess();
			}
		});

		hintBtn.addEventListener('click', applyHint);

		skipBtn.addEventListener('click', () => {
			streak = 0;
			streakNum.textContent = streak;
			if (typeof updateComboDisplay === 'function') updateComboDisplay(0);
			setFeedback(`Skipped — it was <strong>${escapeHtml(current.name)}</strong>.`, 'skipped');
			reveal(false);
		});

		nextBtn.addEventListener('click', () => {
			if (ended) showGameOver(false);
			else nextPokemon();
		});

		quitBtn.addEventListener('click', () => {
			if (!confirm('End this run and return to mode select? Your streak will be lost.')) return;
			ended = true;
			showGameOver(false);
		});

		if (playCryBtn) {
			playCryBtn.addEventListener('click', (e) => {
				e.preventDefault();
				if (revealed || ended) return;
				playCry();
				playCryBtn.classList.remove('is-playing');
				void playCryBtn.offsetWidth;
				playCryBtn.classList.add('is-playing');
				setTimeout(() => playCryBtn.classList.remove('is-playing'), 1800);
			});
		}

		retryBtn.addEventListener('click', () => startMode(mode));

		changeModeBtn.addEventListener('click', () => showModeSelect());

		// Boot
		showModeSelect();
	}

	function bootDom() {
		setModeCardsEnabled(false);
		loadPool().then(() => {
			init();
			setModeCardsEnabled(true);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', bootDom);
	} else {
		bootDom();
	}
})();
