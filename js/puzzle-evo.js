(function () {
	'use strict';

	// ── Data ──────────────────────────────────────────────────────────────────

	// Gen 1 evolution chains. Each sub-array is one chain; IDs are Pokédex numbers.
	// Branching evolutions (Eevee family) share the same starting mon — all
	// valid evolutions are siblings.
	const EVO_CHAINS = [
		[1,2,3],[4,5,6],[7,8,9],[10,11,12],[13,14,15],[16,17,18],
		[19,20],[21,22],[23,24],[25,26],[27,28],[29,30,31],[32,33,34],
		[35,36],[37,38],[39,40],[41,42],[43,44,45],[46,47],[48,49],
		[50,51],[52,53],[54,55],[56,57],[58,59],[60,61,62],[63,64,65],
		[66,67,68],[69,70,71],[72,73],[74,75,76],[77,78],[79,80],
		[81,82],[84,85],[86,87],[88,89],[90,91],[92,93,94],[96,97],
		[98,99],[100,101],[102,103],[104,105],[108],[109,110],[111,112],
		[113],[114],[115],[116,117],[118,119],[120,121],[122],[123],
		[124],[125],[126],[127],[128],[129,130],[131],[132],[133,134],
		[133,135],[133,136],[137],[138,139],[140,141],[142],[143],[144],[145],[146],[147,148,149],[150],[151],
	];

	const NAMES = {1:'Bulbasaur',2:'Ivysaur',3:'Venusaur',4:'Charmander',5:'Charmeleon',6:'Charizard',7:'Squirtle',8:'Wartortle',9:'Blastoise',10:'Caterpie',11:'Metapod',12:'Butterfree',13:'Weedle',14:'Kakuna',15:'Beedrill',16:'Pidgey',17:'Pidgeotto',18:'Pidgeot',19:'Rattata',20:'Raticate',21:'Spearow',22:'Fearow',23:'Ekans',24:'Arbok',25:'Pikachu',26:'Raichu',27:'Sandshrew',28:'Sandslash',29:'Nidoran♀',30:'Nidorina',31:'Nidoqueen',32:'Nidoran♂',33:'Nidorino',34:'Nidoking',35:'Clefairy',36:'Clefable',37:'Vulpix',38:'Ninetales',39:'Jigglypuff',40:'Wigglytuff',41:'Zubat',42:'Golbat',43:'Oddish',44:'Gloom',45:'Vileplume',46:'Paras',47:'Parasect',48:'Venonat',49:'Venomoth',50:'Diglett',51:'Dugtrio',52:'Meowth',53:'Persian',54:'Psyduck',55:'Golduck',56:'Mankey',57:'Primeape',58:'Growlithe',59:'Arcanine',60:'Poliwag',61:'Poliwhirl',62:'Poliwrath',63:'Abra',64:'Kadabra',65:'Alakazam',66:'Machop',67:'Machoke',68:'Machamp',69:'Bellsprout',70:'Weepinbell',71:'Victreebel',72:'Tentacool',73:'Tentacruel',74:'Geodude',75:'Graveler',76:'Golem',77:'Ponyta',78:'Rapidash',79:'Slowpoke',80:'Slowbro',81:'Magnemite',82:'Magneton',84:'Doduo',85:'Dodrio',86:'Seel',87:'Dewgong',88:'Grimer',89:'Muk',90:'Shellder',91:'Cloyster',92:'Gastly',93:'Haunter',94:'Gengar',96:'Drowzee',97:'Hypno',98:'Krabby',99:'Kingler',100:'Voltorb',101:'Electrode',102:'Exeggcute',103:'Exeggutor',104:'Cubone',105:'Marowak',108:'Lickitung',109:'Koffing',110:'Weezing',111:'Rhyhorn',112:'Rhydon',113:'Chansey',114:'Tangela',115:'Kangaskhan',116:'Horsea',117:'Seadra',118:'Goldeen',119:'Seaking',120:'Staryu',121:'Starmie',122:'Mr. Mime',123:'Scyther',124:'Jynx',125:'Electabuzz',126:'Magmar',127:'Pinsir',128:'Tauros',129:'Magikarp',130:'Gyarados',131:'Lapras',132:'Ditto',133:'Eevee',134:'Vaporeon',135:'Jolteon',136:'Flareon',137:'Porygon',138:'Omanyte',139:'Omastar',140:'Kabuto',141:'Kabutops',142:'Aerodactyl',143:'Snorlax',144:'Articuno',145:'Zapdos',146:'Moltres',147:'Dratini',148:'Dragonair',149:'Dragonite',150:'Mewtwo',151:'Mew'};

	const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

	// ── Precompute: for each pokémon id, what ids share a chain with it? ──────
	// We use a merged-chain approach: ids that appear in ANY chain together are
	// all relatives. This naturally handles Eevee (133) branching to 134/135/136.

	const chainmates = {}; // id -> Set of ids in same family (excluding self)

	(function buildChainmates() {
		// Union-Find to merge overlapping chains
		const parent = {};
		function find(x) {
			if (parent[x] === undefined) parent[x] = x;
			if (parent[x] !== x) parent[x] = find(parent[x]);
			return parent[x];
		}
		function union(a, b) {
			const pa = find(a), pb = find(b);
			if (pa !== pb) parent[pa] = pb;
		}

		EVO_CHAINS.forEach(chain => {
			for (let i = 0; i < chain.length - 1; i++) union(chain[i], chain[i + 1]);
		});

		// Group ids by root
		const groups = {};
		const allIds = [...new Set(EVO_CHAINS.flat())];
		allIds.forEach(id => {
			const r = find(id);
			if (!groups[r]) groups[r] = [];
			groups[r].push(id);
		});

		// Build chainmates map
		allIds.forEach(id => {
			const r = find(id);
			const mates = groups[r].filter(m => m !== id);
			chainmates[id] = new Set(mates);
		});
	})();

	// All unique ids usable as answer options (must have a name)
	const ALL_IDS = [...new Set(EVO_CHAINS.flat())].filter(id => NAMES[id]);

	// Ids that actually have evo-mates (singletons are boring as prompts)
	const PROMPT_IDS = ALL_IDS.filter(id => chainmates[id] && chainmates[id].size > 0);

	// ── Modes ─────────────────────────────────────────────────────────────────
	const MODES = {
		normal: { name: 'Normal', bestKey: 'pokequiz_evo_best_normal', maxHearts: Infinity },
		hard:   { name: 'Hard',   bestKey: 'pokequiz_evo_best_hard',   maxHearts: 1 },
	};

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
		return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
	}

	function spriteUrl(id) {
		return SPRITE_BASE + id + '.png';
	}

	// ── Game state ────────────────────────────────────────────────────────────
	let mode, modeCfg, streak, best, hearts, ended, submitted;
	let currentPromptId, correctOptions, currentChoices;
	let promptDeck = [];

	// ── DOM refs ──────────────────────────────────────────────────────────────
	let modeSelectEl, gameViewEl, gameOverEl;
	let streakNum, bestNum, chainDisplay, evoPrompt, answersGrid, feedbackEl;
	let nextBtn, quitBtn, retryBtn, changeModeBtn;
	let finalStreakEl, finalBestEl, resultTitle, resultScore, resultMsg, resultEmoji;

	function init() {
		modeSelectEl  = document.getElementById('modeSelect');
		gameViewEl    = document.getElementById('gameView');
		gameOverEl    = document.getElementById('gameOver');
		streakNum     = document.getElementById('streakNum');
		bestNum       = document.getElementById('bestNum');
		chainDisplay  = document.getElementById('chainDisplay');
		evoPrompt     = document.getElementById('evoPrompt');
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

		// Mode buttons
		document.querySelectorAll('[data-mode]').forEach(btn => {
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

		// Paint best scores
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
			const promptName = NAMES[currentPromptId] || ('#' + currentPromptId);
			const correctNames = [...correctOptions].map(id => NAMES[id] || '#' + id).join(', ');
			resultMsg.innerHTML = 'You were shown <strong>' + escapeHtml(promptName) +
				'</strong>. Correct answers: <strong>' + escapeHtml(correctNames) + '</strong>.';
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
		hearts    = modeCfg.maxHearts;
		ended     = false;
		submitted = false;
		promptDeck = shuffle([...PROMPT_IDS]);

		streakNum.textContent = 0;
		bestNum.textContent   = best;

		showGameView();
		nextRound();
	}

	function nextRound() {
		feedbackEl.textContent = '';
		nextBtn.hidden         = true;
		answersGrid.innerHTML  = '';

		// Pick prompt pokemon
		if (!promptDeck.length) promptDeck = shuffle([...PROMPT_IDS]);
		currentPromptId = promptDeck.pop();

		// All valid correct options = chain-mates
		correctOptions = chainmates[currentPromptId] || new Set();

		// Build choices: 1 correct + 3 wrong distractors (no overlap with correct set)
		const correctArr  = [...correctOptions];
		const correctPick = correctArr[Math.floor(Math.random() * correctArr.length)];

		const wrongPool = ALL_IDS.filter(id =>
			id !== currentPromptId && !correctOptions.has(id) && NAMES[id]
		);
		shuffle(wrongPool);
		const wrongs = wrongPool.slice(0, 3);

		currentChoices = shuffle([correctPick, ...wrongs]);

		// Render chain display
		renderChainDisplay(currentPromptId);

		// Prompt text
		evoPrompt.innerHTML = 'Which Pok&eacute;mon is in <strong>' +
			escapeHtml(NAMES[currentPromptId] || ('#' + currentPromptId)) +
			'</strong>&rsquo;s evolution family?';

		// Render answer buttons
		const letters = ['A', 'B', 'C', 'D'];
		currentChoices.forEach((id, idx) => {
			const btn = document.createElement('button');
			btn.type      = 'button';
			btn.className = 'pz-answer';
			btn.dataset.id = String(id);
			btn.innerHTML =
				'<span class="pz-answer-letter">' + letters[idx] + '</span>' +
				'<span>' + escapeHtml(NAMES[id] || ('#' + id)) + '</span>';
			btn.addEventListener('click', () => handleAnswer(id, correctOptions, btn));
			answersGrid.appendChild(btn);
		});
	}

	function renderChainDisplay(promptId) {
		// Find ALL chains containing this pokemon
		const relevantChains = EVO_CHAINS.filter(ch => ch.includes(promptId));

		// Build unique ordered members across all relevant chains
		const seen = new Set();
		const members = [];
		relevantChains.forEach(chain => {
			chain.forEach(id => {
				if (!seen.has(id)) { seen.add(id); members.push(id); }
			});
		});

		chainDisplay.innerHTML = '';

		members.forEach((id, idx) => {
			if (idx > 0) {
				const arrow = document.createElement('span');
				arrow.className = 'evo-arrow';
				arrow.textContent = '→';
				chainDisplay.appendChild(arrow);
			}
			const slot = document.createElement('div');
			slot.className = 'evo-slot' + (id === promptId ? ' is-current' : '');

			const img = document.createElement('img');
			img.src   = spriteUrl(id);
			img.alt   = id === promptId ? NAMES[id] : '?';
			img.width = 64;
			img.height= 64;

			const nameEl = document.createElement('span');
			nameEl.className = 'evo-slot-name' + (id !== promptId ? ' is-hidden' : '');
			nameEl.textContent = id === promptId ? (NAMES[id] || '#' + id) : '???';

			slot.appendChild(img);
			slot.appendChild(nameEl);
			chainDisplay.appendChild(slot);
		});
	}

	function handleAnswer(chosenId, correctSet, btn) {
		if (ended) return;

		// Lock all buttons
		answersGrid.querySelectorAll('.pz-answer').forEach(b => { b.disabled = true; });

		const isCorrect = correctSet.has(chosenId);

		if (isCorrect) {
			btn.classList.add('is-correct');
			streak++;
			if (streak > best) {
				best = streak;
				setBest(modeCfg.bestKey, best);
			}
			streakNum.textContent = streak;
			bestNum.textContent   = best;
			feedbackEl.textContent = 'Correct! Streak: ' + streak;
			feedbackEl.style.color = '#22c55e';

			// Reveal other correct options in green too
			answersGrid.querySelectorAll('.pz-answer').forEach(b => {
				if (correctSet.has(Number(b.dataset.id))) b.classList.add('is-correct');
			});

			nextBtn.hidden = false;
			setTimeout(() => nextBtn.focus(), 150);

		} else {
			btn.classList.add('is-wrong');
			// Reveal correct answer(s)
			answersGrid.querySelectorAll('.pz-answer').forEach(b => {
				if (correctSet.has(Number(b.dataset.id))) b.classList.add('is-correct');
			});

			if (modeCfg.maxHearts !== Infinity) {
				hearts = Math.max(0, hearts - 1);
				if (hearts <= 0) {
					ended = true;
					feedbackEl.innerHTML = 'Wrong &mdash; run over!';
					feedbackEl.style.color = '#ef4444';
					nextBtn.hidden = false;
					setTimeout(() => nextBtn.focus(), 150);
					return;
				}
			}

			const correctNames = [...correctSet].map(id => NAMES[id] || '#' + id).join(' / ');
			feedbackEl.innerHTML = 'Wrong! Correct: <strong>' + escapeHtml(correctNames) + '</strong>';
			feedbackEl.style.color = '#ef4444';
			nextBtn.hidden = false;
			setTimeout(() => nextBtn.focus(), 150);
		}
	}

	// ── Leaderboard submission ────────────────────────────────────────────────

	function postLeaderboard() {
		if (submitted) return;
		submitted = true;
		const name     = window.PokeUtil.getPlayerName();
		const playerId = window.PokeUtil.getPlayerId();
		if (!name || !playerId || streak <= 0) return;
		window.PokeUtil.submitScore({ game: 'evo', name, score: streak, mode, playerId });
	}

	// ── Boot ──────────────────────────────────────────────────────────────────

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

})();
