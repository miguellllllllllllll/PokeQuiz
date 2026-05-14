(function () {
	const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
	const CRY_BASE = 'https://play.pokemonshowdown.com/audio/cries/';
	const BEST_KEY = 'pokequiz_puzzle_best';

	function slugify(name) {
		return String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
	}

	function playCry(name) {
		try {
			const audio = new Audio(`${CRY_BASE}${slugify(name)}.mp3`);
			audio.volume = 0.55;
			audio.play().catch(() => { /* autoplay blocked or 404 */ });
		} catch { /* unsupported */ }
	}

	const POKEMON = [
		{ id: 1, name: 'Bulbasaur' },
		{ id: 4, name: 'Charmander' },
		{ id: 6, name: 'Charizard' },
		{ id: 7, name: 'Squirtle' },
		{ id: 9, name: 'Blastoise' },
		{ id: 10, name: 'Caterpie' },
		{ id: 16, name: 'Pidgey' },
		{ id: 19, name: 'Rattata' },
		{ id: 25, name: 'Pikachu' },
		{ id: 26, name: 'Raichu' },
		{ id: 35, name: 'Clefairy' },
		{ id: 37, name: 'Vulpix' },
		{ id: 39, name: 'Jigglypuff' },
		{ id: 41, name: 'Zubat' },
		{ id: 50, name: 'Diglett' },
		{ id: 52, name: 'Meowth' },
		{ id: 54, name: 'Psyduck' },
		{ id: 58, name: 'Growlithe' },
		{ id: 63, name: 'Abra' },
		{ id: 66, name: 'Machop' },
		{ id: 74, name: 'Geodude' },
		{ id: 77, name: 'Ponyta' },
		{ id: 79, name: 'Slowpoke' },
		{ id: 81, name: 'Magnemite' },
		{ id: 92, name: 'Gastly' },
		{ id: 94, name: 'Gengar' },
		{ id: 95, name: 'Onix' },
		{ id: 100, name: 'Voltorb' },
		{ id: 104, name: 'Cubone' },
		{ id: 113, name: 'Chansey' },
		{ id: 115, name: 'Kangaskhan' },
		{ id: 122, name: 'Mr. Mime', aliases: ['mr mime', 'mrmime'] },
		{ id: 123, name: 'Scyther' },
		{ id: 124, name: 'Jynx' },
		{ id: 125, name: 'Electabuzz' },
		{ id: 128, name: 'Tauros' },
		{ id: 129, name: 'Magikarp' },
		{ id: 130, name: 'Gyarados' },
		{ id: 131, name: 'Lapras' },
		{ id: 132, name: 'Ditto' },
		{ id: 133, name: 'Eevee' },
		{ id: 134, name: 'Vaporeon' },
		{ id: 135, name: 'Jolteon' },
		{ id: 136, name: 'Flareon' },
		{ id: 142, name: 'Aerodactyl' },
		{ id: 143, name: 'Snorlax' },
		{ id: 144, name: 'Articuno' },
		{ id: 145, name: 'Zapdos' },
		{ id: 146, name: 'Moltres' },
		{ id: 147, name: 'Dratini' },
		{ id: 149, name: 'Dragonite' },
		{ id: 150, name: 'Mewtwo' },
		{ id: 151, name: 'Mew' },
		{ id: 155, name: 'Cyndaquil' },
		{ id: 158, name: 'Totodile' },
		{ id: 172, name: 'Pichu' },
		{ id: 196, name: 'Espeon' },
		{ id: 197, name: 'Umbreon' },
		{ id: 249, name: 'Lugia' },
		{ id: 250, name: 'Ho-Oh', aliases: ['hooh', 'ho oh'] },
		{ id: 257, name: 'Blaziken' },
		{ id: 282, name: 'Gardevoir' },
		{ id: 384, name: 'Rayquaza' },
		{ id: 448, name: 'Lucario' },
		{ id: 470, name: 'Leafeon' },
		{ id: 471, name: 'Glaceon' },
		{ id: 493, name: 'Arceus' },
		{ id: 658, name: 'Greninja' },
		{ id: 700, name: 'Sylveon' },
		{ id: 906, name: 'Sprigatito' },
		{ id: 909, name: 'Fuecoco' },
		{ id: 912, name: 'Quaxly' }
	];

	function normalize(s) {
		return String(s || '').toLowerCase().normalize('NFD').replace(/[\̀-\ͯ]/g, '').replace(/[^a-z]/g, '');
	}

	function getBest() {
		const n = Number(localStorage.getItem(BEST_KEY));
		return Number.isFinite(n) && n > 0 ? n : 0;
	}

	function setBest(n) {
		try { localStorage.setItem(BEST_KEY, String(n)); } catch {}
	}

	const RECENT_BUFFER = Math.min(8, Math.floor(POKEMON.length / 3));
	let deck = [];
	const recentIds = [];

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

	function refillDeck() {
		deck = shuffleInPlace([...POKEMON]);
	}

	function pickPokemon() {
		if (deck.length === 0) refillDeck();

		let idx = deck.findIndex((p) => !recentIds.includes(p.id));
		if (idx === -1) idx = 0;

		const pick = deck.splice(idx, 1)[0];
		recentIds.push(pick.id);
		if (recentIds.length > RECENT_BUFFER) recentIds.shift();
		return pick;
	}

	function init() {
		const img = document.getElementById('silhouetteImg');
		const placeholder = document.getElementById('silhouettePlaceholder');
		const frame = img.closest('.silhouette-frame');
		const guessInput = document.getElementById('guessInput');
		const guessForm = document.getElementById('guessForm');
		const feedback = document.getElementById('feedback');
		const hintBtn = document.getElementById('hintBtn');
		const skipBtn = document.getElementById('skipBtn');
		const nextBtn = document.getElementById('nextBtn');
		const streakNum = document.getElementById('streakNum');
		const bestNum = document.getElementById('bestNum');
		const revealWrap = document.getElementById('revealNameWrap');
		const revealName = document.getElementById('revealName');

		let current = null;
		let revealed = false;
		let hintLetters = 0;
		let streak = 0;
		let best = getBest();
		bestNum.textContent = best;

		function setFeedback(msg, cls = '') {
			feedback.textContent = msg;
			feedback.className = 'feedback' + (cls ? ' ' + cls : '');
		}

		function loadPokemon(p) {
			current = p;
			revealed = false;
			hintLetters = 0;
			revealWrap.hidden = true;
			frame.classList.remove('is-revealed');
			img.classList.remove('is-loaded');
			img.classList.add('is-silhouette');
			placeholder.style.display = 'block';
			placeholder.textContent = 'Loading…';
			setFeedback('');
			guessInput.value = '';
			guessInput.disabled = false;
			hintBtn.disabled = false;
			skipBtn.hidden = false;
			nextBtn.hidden = true;
			guessForm.querySelector('button[type=submit]').disabled = false;

			const tempImg = new Image();
			tempImg.onload = () => {
				img.src = tempImg.src;
				img.classList.add('is-loaded');
				placeholder.style.display = 'none';
				guessInput.focus();
			};
			tempImg.onerror = () => {
				placeholder.textContent = 'Sprite unavailable — skipping…';
				setTimeout(nextPokemon, 800);
			};
			tempImg.src = `${SPRITE_BASE}${p.id}.png`;
		}

		function nextPokemon() {
			loadPokemon(pickPokemon());
		}

		function isMatch(input, p) {
			const guess = normalize(input);
			if (!guess) return false;
			const candidates = [p.name, ...(p.aliases || [])];
			return candidates.some((c) => normalize(c) === guess);
		}

		function reveal(correct) {
			revealed = true;
			img.classList.remove('is-silhouette');
			revealName.textContent = current.name;
			revealWrap.hidden = false;
			frame.classList.add('is-revealed');
			guessInput.disabled = true;
			hintBtn.disabled = true;
			skipBtn.hidden = true;
			nextBtn.hidden = false;
			guessForm.querySelector('button[type=submit]').disabled = true;

			if (correct) {
				streak++;
				if (streak > best) {
					best = streak;
					setBest(best);
				}
				streakNum.textContent = streak;
				bestNum.textContent = best;
				setFeedback(`Correct! Streak: ${streak}`, 'correct');
				playCry(current.name);
			} else {
				streak = 0;
				streakNum.textContent = streak;
			}
			setTimeout(() => nextBtn.focus(), 200);
		}

		function applyHint() {
			if (revealed) return;
			hintLetters = Math.min(hintLetters + 1, current.name.length - 1);
			const name = current.name;
			const masked = name.split('').map((ch, i) => {
				if (i < hintLetters) return ch;
				if (!/[a-zA-Z]/.test(ch)) return ch;
				return '_';
			}).join(' ');
			setFeedback(`Hint: ${masked}`, 'hint');
			if (hintLetters >= current.name.length - 1) hintBtn.disabled = true;
		}

		guessForm.addEventListener('submit', (e) => {
			e.preventDefault();
			if (revealed) return;
			if (isMatch(guessInput.value, current)) {
				reveal(true);
			} else {
				setFeedback('Not quite — try again!', 'wrong');
				guessInput.classList.remove('shake');
				void guessInput.offsetWidth;
				guessInput.classList.add('shake');
				guessInput.select();
			}
		});

		hintBtn.addEventListener('click', applyHint);

		skipBtn.addEventListener('click', () => {
			streak = 0;
			streakNum.textContent = streak;
			setFeedback(`Skipped — it was ${current.name}.`, 'skipped');
			reveal(false);
		});

		nextBtn.addEventListener('click', nextPokemon);

		nextPokemon();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
