(function () {
	'use strict';

	// ── Egg group data (Gen 1) ────────────────────────────────────────────────

	const EGG_GROUPS = {
		monster:    [1,2,3,4,5,6,7,8,9,31,34,104,105,111,112,115,131,143],
		water1:     [7,8,9,54,55,60,61,62,72,73,79,80,86,87,90,91,98,99,116,117,118,119,120,121,129,130,131,138,139,140,141],
		bug:        [10,11,12,13,14,15,46,47,48,49,123,127,165,166],
		flying:     [16,17,18,21,22,41,42,83,84,85,142],
		field:      [19,20,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,50,51,52,53,56,57,58,59,77,78,83,104,105,108,111,112,115,128,132,133,134,135,136,143],
		fairy:      [35,36,39,40,113,122,173,174,175,176],
		grass:      [43,44,45,69,70,71,102,103,114],
		humanlike:  [56,57,63,64,65,66,67,68,96,97,106,107,122,124,125,126],
		water3:     [90,91,98,99,138,139,140,141],
		mineral:    [74,75,76,81,82,100,101,109,110,137],
		amorphous:  [92,93,94,109,110],
		water2:     [129,130],
		dragon:     [147,148,149],
		undiscovered: [144,145,146,150,151],
	};

	const NAMES = {1:'Bulbasaur',2:'Ivysaur',3:'Venusaur',4:'Charmander',5:'Charmeleon',6:'Charizard',7:'Squirtle',8:'Wartortle',9:'Blastoise',10:'Caterpie',11:'Metapod',12:'Butterfree',13:'Weedle',14:'Kakuna',15:'Beedrill',16:'Pidgey',17:'Pidgeotto',18:'Pidgeot',19:'Rattata',20:'Raticate',21:'Spearow',22:'Fearow',23:'Ekans',24:'Arbok',25:'Pikachu',26:'Raichu',27:'Sandshrew',28:'Sandslash',29:'Nidoran♀',30:'Nidorina',31:'Nidoqueen',32:'Nidoran♂',33:'Nidorino',34:'Nidoking',35:'Clefairy',36:'Clefable',37:'Vulpix',38:'Ninetales',39:'Jigglypuff',40:'Wigglytuff',41:'Zubat',42:'Golbat',43:'Oddish',44:'Gloom',45:'Vileplume',46:'Paras',47:'Parasect',48:'Venonat',49:'Venomoth',50:'Diglett',51:'Dugtrio',52:'Meowth',53:'Persian',54:'Psyduck',55:'Golduck',56:'Mankey',57:'Primeape',58:'Growlithe',59:'Arcanine',60:'Poliwag',61:'Poliwhirl',62:'Poliwrath',63:'Abra',64:'Kadabra',65:'Alakazam',66:'Machop',67:'Machoke',68:'Machamp',69:'Bellsprout',70:'Weepinbell',71:'Victreebel',72:'Tentacool',73:'Tentacruel',74:'Geodude',75:'Graveler',76:'Golem',77:'Ponyta',78:'Rapidash',79:'Slowpoke',80:'Slowbro',81:'Magnemite',82:'Magneton',84:'Doduo',85:'Dodrio',86:'Seel',87:'Dewgong',88:'Grimer',89:'Muk',90:'Shellder',91:'Cloyster',92:'Gastly',93:'Haunter',94:'Gengar',96:'Drowzee',97:'Hypno',98:'Krabby',99:'Kingler',100:'Voltorb',101:'Electrode',102:'Exeggcute',103:'Exeggutor',104:'Cubone',105:'Marowak',108:'Lickitung',109:'Koffing',110:'Weezing',111:'Rhyhorn',112:'Rhydon',113:'Chansey',114:'Tangela',115:'Kangaskhan',116:'Horsea',117:'Seadra',118:'Goldeen',119:'Seaking',120:'Staryu',121:'Starmie',122:'Mr. Mime',123:'Scyther',124:'Jynx',125:'Electabuzz',126:'Magmar',127:'Pinsir',128:'Tauros',129:'Magikarp',130:'Gyarados',131:'Lapras',132:'Ditto',133:'Eevee',134:'Vaporeon',135:'Jolteon',136:'Flareon',137:'Porygon',138:'Omanyte',139:'Omastar',140:'Kabuto',141:'Kabutops',142:'Aerodactyl',143:'Snorlax',144:'Articuno',145:'Zapdos',146:'Moltres',147:'Dratini',148:'Dragonair',149:'Dragonite',150:'Mewtwo',151:'Mew'};

	const SPRITE_BASE = 'https://poke-api-sprites.netlify.app/sprites/pokemon/versions/generation-viii/icons/';

	// ── Precompute groupmates ─────────────────────────────────────────────────

	// groupsOf[id] = array of group names the id belongs to
	const groupsOf = {};
	// membersOf[groupName] = Set of ids
	const membersOf = {};

	for (const [groupName, ids] of Object.entries(EGG_GROUPS)) {
		membersOf[groupName] = new Set(ids);
		for (const id of ids) {
			if (!groupsOf[id]) groupsOf[id] = [];
			groupsOf[id].push(groupName);
		}
	}

	// sharesAnyGroup(a, b): any group overlap
	function sharesAnyGroup(a, b) {
		const ga = groupsOf[a] || [];
		const gb = new Set(groupsOf[b] || []);
		return ga.some((g) => gb.has(g));
	}

	// sharesPrimaryGroup(a, b): first group of both must match
	function sharesPrimaryGroup(a, b) {
		const ga = groupsOf[a];
		const gb = groupsOf[b];
		if (!ga || !gb || !ga.length || !gb.length) return false;
		return ga[0] === gb[0];
	}

	// All known ids (have a name)
	const ALL_IDS = Object.keys(NAMES).map(Number);

	// Modes ───────────────────────────────────────────────────────────────────

	const MODES = {
		normal: { name: 'Normal', bestKey: 'pokequiz_egggroup_best_normal', isCorrect: sharesAnyGroup },
		hard:   { name: 'Hard',   bestKey: 'pokequiz_egggroup_best_hard',   isCorrect: sharesPrimaryGroup },
	};

	// ── Helpers ───────────────────────────────────────────────────────────────

	function getBest(k) { const n = Number(localStorage.getItem(k)); return Number.isFinite(n) && n > 0 ? n : 0; }
	function setBest(k, n) { try { localStorage.setItem(k, String(n)); } catch {} }

	function shuffle(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	function escapeHtml(s) {
		return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
	}

	function spriteUrl(id) {
		return SPRITE_BASE + id + '.png';
	}

	// Ids usable as prompts: have at least one valid correct answer in the chosen mode
	function getPromptIds(isCorrect) {
		return ALL_IDS.filter((id) => {
			// undiscovered = no breeding partners; skip as prompt
			if ((groupsOf[id] || []).includes('undiscovered')) return false;
			// must have at least one other id that qualifies as correct
			return ALL_IDS.some((other) => other !== id && isCorrect(id, other));
		});
	}

	// ── Game state ────────────────────────────────────────────────────────────

	let mode, modeCfg, streak, best, ended, submitted;
	let currentPromptId, currentChoices, currentCorrectId;
	let promptDeck = [];

	// ── DOM refs ──────────────────────────────────────────────────────────────

	let modeSelectEl, gameViewEl, gameOverEl;
	let streakNum, bestNum, promptImg, promptName, promptGroups, answersGrid, feedbackEl;
	let nextBtn, quitBtn, retryBtn, changeModeBtn;
	let finalStreakEl, finalBestEl, resultTitle, resultScore, resultMsg, resultEmoji;

	function init() {
		modeSelectEl  = document.getElementById('modeSelect');
		gameViewEl    = document.getElementById('gameView');
		gameOverEl    = document.getElementById('gameOver');
		streakNum     = document.getElementById('streakNum');
		bestNum       = document.getElementById('bestNum');
		promptImg     = document.getElementById('promptImg');
		promptName    = document.getElementById('promptName');
		promptGroups  = document.getElementById('promptGroups');
		answersGrid   = document.getElementById('answersGrid');
		feedbackEl    = document.getElementById('feedback');
		nextBtn       = document.getElementById('nextBtn');
		quitBtn       = document.getElementById('quitBtn');
		retryBtn      = document.getElementById('retryBtn');
		changeModeBtn = document.getElementById('changeModeBtn');
		finalStreakEl = document.getElementById('finalStreak');
		finalBestEl   = document.getElementById('finalBest');
		resultTitle   = document.getElementById('resultTitle');
		resultScore   = document.getElementById('resultScore');
		resultMsg     = document.getElementById('resultMsg');
		resultEmoji   = document.getElementById('resultEmoji');

		document.querySelectorAll('[data-mode]').forEach((btn) => {
			btn.addEventListener('click', () => startMode(btn.dataset.mode));
		});

		nextBtn.addEventListener('click', () => {
			if (ended) showGameOver();
			else nextRound();
		});

		quitBtn.addEventListener('click', () => {
			if (!confirm('End this run?')) return;
			ended = true;
			showGameOver();
		});

		retryBtn.addEventListener('click', () => startMode(mode));
		changeModeBtn.addEventListener('click', showModeSelect);

		showModeSelect();
	}

	// ── Views ─────────────────────────────────────────────────────────────────

	function showModeSelect() {
		modeSelectEl.hidden = false;
		gameViewEl.hidden   = true;
		gameOverEl.hidden   = true;

		document.getElementById('bestNormal').textContent = getBest(MODES.normal.bestKey);
		document.getElementById('bestHard').textContent   = getBest(MODES.hard.bestKey);
	}

	function showGameView() {
		modeSelectEl.hidden = true;
		gameViewEl.hidden   = false;
		gameOverEl.hidden   = true;
	}

	function showGameOver() {
		postLeaderboard();
		modeSelectEl.hidden = true;
		gameViewEl.hidden   = true;
		gameOverEl.hidden   = false;

		finalStreakEl.textContent = streak;
		finalBestEl.textContent   = best;
		resultScore.textContent   = streak;
		resultTitle.textContent   = streak > 0 ? 'Run Complete!' : 'Stumped!';
		resultEmoji.textContent   = streak >= 20 ? '🏆' : streak >= 10 ? '🔥' : '🌟';

		if (currentPromptId) {
			const promptNameStr = NAMES[currentPromptId] || ('#' + currentPromptId);
			const correctName   = NAMES[currentCorrectId] || ('#' + currentCorrectId);
			resultMsg.innerHTML = 'You were shown <strong>' + escapeHtml(promptNameStr) + '</strong>. ' +
				'The correct answer was <strong>' + escapeHtml(correctName) + '</strong>.';
		} else {
			resultMsg.textContent = 'Run ended.';
		}
	}

	// ── Game flow ─────────────────────────────────────────────────────────────

	function startMode(m) {
		mode      = m;
		modeCfg   = MODES[m] || MODES.normal;
		streak    = 0;
		best      = getBest(modeCfg.bestKey);
		ended     = false;
		submitted = false;
		promptDeck = shuffle(getPromptIds(modeCfg.isCorrect));

		streakNum.textContent = 0;
		bestNum.textContent   = best;

		showGameView();
		nextRound();
	}

	function nextRound() {
		feedbackEl.textContent = '';
		nextBtn.hidden         = true;
		answersGrid.innerHTML  = '';

		if (!promptDeck.length) promptDeck = shuffle(getPromptIds(modeCfg.isCorrect));
		currentPromptId = promptDeck.pop();

		// Build choices: 1 correct + 3 wrong
		const correctPool = ALL_IDS.filter((id) =>
			id !== currentPromptId && modeCfg.isCorrect(currentPromptId, id) && NAMES[id]
		);
		shuffle(correctPool);
		currentCorrectId = correctPool[0];

		const wrongPool = ALL_IDS.filter((id) =>
			id !== currentPromptId && !modeCfg.isCorrect(currentPromptId, id) && NAMES[id]
		);
		shuffle(wrongPool);
		const wrongs = wrongPool.slice(0, 3);

		currentChoices = shuffle([currentCorrectId, ...wrongs]);

		// Render prompt
		promptImg.src = spriteUrl(currentPromptId);
		promptImg.alt = NAMES[currentPromptId] || ('Pokemon #' + currentPromptId);
		promptName.textContent = NAMES[currentPromptId] || ('#' + currentPromptId);

		// Show egg groups for the prompt pokemon
		const groups = (groupsOf[currentPromptId] || []).join(', ');
		if (promptGroups) {
			promptGroups.textContent = groups ? ('Egg Group: ' + groups) : '';
		}

		// Render answer buttons
		const letters = ['A', 'B', 'C', 'D'];
		currentChoices.forEach((id, idx) => {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'pz-answer';
			btn.dataset.id = String(id);

			const img = document.createElement('img');
			img.src = spriteUrl(id);
			img.alt = '';
			img.width = 40;
			img.height = 40;
			img.className = 'pz-choice-sprite';

			btn.innerHTML =
				'<span class="pz-answer-letter">' + letters[idx] + '</span>' +
				'<span class="pz-choice-wrap">' +
					img.outerHTML +
					'<span>' + escapeHtml(NAMES[id] || ('#' + id)) + '</span>' +
				'</span>';

			btn.addEventListener('click', () => handleAnswer(id, btn));
			answersGrid.appendChild(btn);
		});
	}

	function handleAnswer(chosenId, btn) {
		if (ended) return;

		answersGrid.querySelectorAll('.pz-answer').forEach((b) => { b.disabled = true; });

		const isCorrect = chosenId === currentCorrectId;

		// Always highlight correct in green
		answersGrid.querySelectorAll('.pz-answer').forEach((b) => {
			if (Number(b.dataset.id) === currentCorrectId) b.classList.add('is-correct');
		});

		if (isCorrect) {
			streak++;
			if (streak > best) { best = streak; setBest(modeCfg.bestKey, best); }
			streakNum.textContent = streak;
			bestNum.textContent   = best;
			feedbackEl.textContent = 'Correct! Streak: ' + streak;
			feedbackEl.style.color = '#22c55e';
		} else {
			btn.classList.add('is-wrong');
			ended = true;
			const correctName = NAMES[currentCorrectId] || ('#' + currentCorrectId);
			feedbackEl.innerHTML = 'Wrong! Correct: <strong>' + escapeHtml(correctName) + '</strong>';
			feedbackEl.style.color = '#ef4444';
		}

		nextBtn.hidden = false;
		setTimeout(() => nextBtn.focus(), 150);

		if (!isCorrect) {
			// In hard mode any wrong ends the run immediately on next press
			// but allow seeing the answer first; ended flag controls it.
		}
	}

	// ── Leaderboard submission ────────────────────────────────────────────────

	function postLeaderboard() {
		if (submitted) return;
		submitted = true;
		const name     = window.PokeUtil.getPlayerName();
		const playerId = window.PokeUtil.getPlayerId();
		if (!name || !playerId || streak <= 0) return;
		window.PokeUtil.submitScore({ game: 'egggroup', name, score: streak, mode, playerId });
	}

	// ── Boot ──────────────────────────────────────────────────────────────────

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
