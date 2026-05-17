// Daily Challenge — seeded quiz, same 10 questions for everyone each day.
// Depends on: window.POKEQUIZ_QUIZZES (quizzes.js), window.PokeUtil (util.js)
(function () {
	'use strict';

	// ── LCG RNG seeded by day index ──────────────────────────────────────────
	function makeLcg(seed) {
		let s = seed >>> 0;
		return function () {
			// Constants from Numerical Recipes
			s = (Math.imul(1664525, s) + 1013904223) >>> 0;
			return s / 4294967296;
		};
	}

	function pickDailyQuestions(allQuestions, count) {
		const seed = Math.floor(Date.now() / 86400000);
		const rng = makeLcg(seed);
		// Fisher-Yates shuffle using LCG
		const pool = allQuestions.slice();
		for (let i = pool.length - 1; i > 0; i--) {
			const j = Math.floor(rng() * (i + 1));
			const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
		}
		return pool.slice(0, count);
	}

	// ── Helpers ──────────────────────────────────────────────────────────────
	function escapeHtml(s) {
		return String(s).replace(/[&<>"']/g, (c) => (
			{ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
		));
	}

	function todayKey() {
		// YYYY-MM-DD in local time
		const d = new Date();
		return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
	}

	// ── Main init ─────────────────────────────────────────────────────────────
	function init() {
		const STORAGE_KEY = 'pokequiz_daily_played';
		const QUESTIONS_PER_DAY = 10;

		const quizzes = window.POKEQUIZ_QUIZZES;
		if (!quizzes || !quizzes.master || !quizzes.master.questions) {
			document.getElementById('dailyRoot').innerHTML =
				'<p class="daily-error">Quiz data failed to load. Please refresh.</p>';
			return;
		}

		const allQuestions = quizzes.master.questions;
		const questions = pickDailyQuestions(allQuestions, QUESTIONS_PER_DAY);

		const root = document.getElementById('dailyRoot');
		const playedDate = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } })();

		if (playedDate === todayKey()) {
			showAlreadyPlayed(root);
			return;
		}

		startQuiz(root, questions, STORAGE_KEY);
	}

	function showAlreadyPlayed(root) {
		root.innerHTML = `
			<div class="daily-done-wrap">
				<div class="daily-done-icon">📅</div>
				<h2 class="daily-done-title">Come back tomorrow!</h2>
				<p class="daily-done-msg">You've already completed today's Daily Challenge.<br>A new challenge unlocks at midnight.</p>
				<div class="daily-actions">
					<a href="ranking.html?game=daily" class="btn">View Daily Leaderboard &rarr;</a>
					<a href="index.html" class="btn btn-secondary">Home</a>
				</div>
			</div>
		`;
	}

	function startQuiz(root, questions, storageKey) {
		let currentSlide = 0;

		function renderSlides() {
			return questions.map((q, qi) => {
				const answers = Object.entries(q.answers).map(([letter, text]) => `
					<label class="answer">
						<input type="radio" name="dq${qi}" value="${escapeHtml(letter)}">
						<span class="answer-letter">${escapeHtml(letter.toUpperCase())}</span>
						<span class="answer-text">${escapeHtml(text)}</span>
					</label>
				`).join('');
				return `
					<div class="slide" data-index="${qi}" role="group" aria-label="Question ${qi + 1} of ${questions.length}">
						<div class="question-num">Question ${qi + 1} of ${questions.length}</div>
						<div class="question" tabindex="-1">${escapeHtml(q.question)}</div>
						<div class="answers">${answers}</div>
					</div>
				`;
			}).join('');
		}

		root.innerHTML = `
			<div class="daily-meta">
				<div class="daily-date-pill">📅 Daily Challenge &mdash; ${new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
				<div class="progress">
					<span id="dProgressText">1 / ${questions.length}</span>
					<div class="progress-bar"><div class="progress-fill" id="dProgressFill"></div></div>
				</div>
			</div>
			<div class="quiz-stage">
				<div id="dQuiz" class="quiz-slides" aria-live="polite">${renderSlides()}</div>
			</div>
			<div class="quiz-controls">
				<button id="dPrev" class="btn btn-secondary">&larr; Previous</button>
				<button id="dNext" class="btn">Next &rarr;</button>
				<button id="dSubmit" class="btn" style="display:none">Submit &rarr;</button>
			</div>
			<div id="dResults" class="results" hidden></div>
		`;

		const slides = root.querySelectorAll('.slide');
		const dPrev = root.querySelector('#dPrev');
		const dNext = root.querySelector('#dNext');
		const dSubmit = root.querySelector('#dSubmit');
		const progressText = root.querySelector('#dProgressText');
		const progressFill = root.querySelector('#dProgressFill');
		const resultsEl = root.querySelector('#dResults');

		function updateProgress() {
			progressText.textContent = `${currentSlide + 1} / ${questions.length}`;
			progressFill.style.width = `${((currentSlide + 1) / questions.length) * 100}%`;
		}

		function showSlide(n) {
			slides[currentSlide].classList.remove('active-slide');
			slides[n].classList.add('active-slide');
			currentSlide = n;
			dPrev.style.display = currentSlide === 0 ? 'none' : 'inline-flex';
			if (currentSlide === slides.length - 1) {
				dNext.style.display = 'none';
				dSubmit.style.display = 'inline-flex';
			} else {
				dNext.style.display = 'inline-flex';
				dSubmit.style.display = 'none';
			}
			updateProgress();
			const heading = slides[n].querySelector('.question');
			if (heading) heading.focus({ preventScroll: true });
		}

		function showResults() {
			let numCorrect = 0;
			const answerContainers = root.querySelectorAll('.answers');
			questions.forEach((q, qi) => {
				const container = answerContainers[qi];
				const selected = container.querySelector(`input[name=dq${qi}]:checked`);
				const userAnswer = selected ? selected.value : null;
				const correct = q.correctAnswer;
				container.querySelectorAll('.answer').forEach(label => {
					const val = label.querySelector('input').value;
					if (val === correct) label.classList.add('is-correct');
					if (val === userAnswer && val !== correct) label.classList.add('is-wrong');
				});
				if (userAnswer === correct) numCorrect++;
			});

			const pct = Math.round((numCorrect / questions.length) * 100);

			// Mark as played today
			try { localStorage.setItem(storageKey, todayKey()); } catch {}

			// Determine rank
			let rankLabel, rankEmoji;
			if (pct === 100) { rankLabel = 'Perfect!'; rankEmoji = '🏆'; }
			else if (pct >= 80) { rankLabel = 'Champion'; rankEmoji = '⭐'; }
			else if (pct >= 60) { rankLabel = 'Ace Trainer'; rankEmoji = '🎯'; }
			else if (pct >= 40) { rankLabel = 'Rookie'; rankEmoji = '🌱'; }
			else { rankLabel = 'Try Again'; rankEmoji = '💪'; }

			dPrev.style.display = 'none';
			dNext.style.display = 'none';
			dSubmit.style.display = 'none';

			const playerName = (window.PokeUtil && window.PokeUtil.getPlayerName()) || 'Trainer';
			const playerId = window.PokeUtil ? window.PokeUtil.getPlayerId() : '';

			resultsEl.hidden = false;
			resultsEl.innerHTML = `
				<div class="results-rank">
					<span class="results-rank-emoji">${rankEmoji}</span>
					<span class="results-rank-label">${rankLabel}</span>
				</div>
				<h2>Daily Complete!</h2>
				<div class="score">
					<span class="score-num">${numCorrect}</span>
					<span class="score-denom"> / ${questions.length}</span>
				</div>
				<div class="score-pct">${pct}% Correct</div>
				<p class="results-msg" id="dResultsMsg" aria-live="polite">Submitting your score&hellip;</p>
				<div class="daily-done-wrap" style="margin-top:16px">
					<div class="daily-done-icon">📅</div>
					<p class="daily-done-msg">Come back tomorrow for a new challenge!</p>
				</div>
				<div class="results-actions">
					<a href="ranking.html" class="btn">View Leaderboard &rarr;</a>
					<a href="index.html" class="btn btn-secondary">Home</a>
					<a href="stats.html" class="btn btn-ghost">Your Stats</a>
				</div>
			`;
			resultsEl.scrollIntoView({ behavior: 'smooth' });

			// Submit to leaderboard
			if (window.PokeUtil && window.PokeUtil.submitScore) {
				window.PokeUtil.submitScore({
					game: 'daily',
					name: playerName,
					score: numCorrect,
					total: questions.length,
					playerId,
				}).then((ok) => {
					const msg = document.getElementById('dResultsMsg');
					if (!msg) return;
					if (ok) {
						msg.textContent = `Score submitted! Nice run, ${playerName}.`;
					} else {
						msg.textContent = `Score saved locally — couldn't reach the leaderboard.`;
					}
				});
			} else {
				const msg = document.getElementById('dResultsMsg');
				if (msg) msg.textContent = 'Score recorded locally.';
			}
		}

		dPrev.addEventListener('click', () => showSlide(currentSlide - 1));
		dNext.addEventListener('click', () => showSlide(currentSlide + 1));
		dSubmit.addEventListener('click', () => {
			let unanswered = 0;
			questions.forEach((_, qi) => {
				if (!root.querySelector(`input[name=dq${qi}]:checked`)) unanswered++;
			});
			if (unanswered > 0) {
				if (!confirm(`You have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}. They will be marked wrong. Submit anyway?`)) return;
			}
			showResults();
		});

		showSlide(0);
	}

	// Run after DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
