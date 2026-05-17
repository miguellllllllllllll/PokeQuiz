(function () {
	'use strict';

	// ── Icon helper ───────────────────────────────────────────────────────────────
	// Returns an <i> HTML string for a Bootstrap Icon. Use in innerHTML only.
	const ico = (window.CAMP_SYSTEMS || {}).ico;
	// Icon map — game concepts → BI class names
	const ICO = (window.CAMP_DATA || {}).ICO;

	// ── Companion key helpers ─────────────────────────────────────────────────────
	// Companion keys can be:
	//   • eeveelution string  "eevee" | "vaporeon" | …
	//   • legacy numeric      4  (old saves — Charmander, no slot)
	//   • slotted string      "4:0"  "129:2"  (dexId:indexInCaughtArray)
	//
	// dexFromKey(key) → number | string
	//   Returns the numeric dex ID for PMD forms, or the raw string for eeveelutions.
	function dexFromKey(key) {
		if (key == null) return null;
		if (typeof key === 'number') return key;
		const m = String(key).match(/^(\d+)(?::\d+)?$/);
		return m ? parseInt(m[1]) : key; // eeveelution strings pass through unchanged
	}
	// animPrefixFromKey(key) → string used as the animation/anim-key prefix.
	// All instances of the same species share one set of Phaser animations.
	function animPrefixFromKey(key) {
		const d = dexFromKey(key);
		return String(d); // "4", "129", "eevee", etc.
	}
	// Shorthand: ico(ICO.seed) → '<i class="bi bi-seedling" …>'
	// Usage: inner.innerHTML = ico(ICO.book) + ' POKÉDEX';

	const TILE = 16;
	const MAP_W = 40;
	const MAP_H = 30;
	const SPEED = 84; // px/sec — matches old 1.4 px/frame at 60fps

	// Tile IDs
	const TG=0,TG2=1,TP=2,TW=3,TR=4,TR2=5,TWN=6,TD=7,TH2O=8,TTR=9,TFR=10,TFY=11,TSO=12,TCR=13,TFN=14,TRP=15,TIF=16,TIW=17,TRU=18,TST=19,TSG=20,TTR2=21,TBSH=22,TTG=23,TBED=24,TBKS=25,TBLD=26;

	const SOLID = new Set([TW, TR, TR2, TRP, TWN, TH2O, TTR, TTR2, TFN, TIW, TSG, TBSH, TBED, TBKS, TBLD]);
	const ANIMATED = new Set([TWN, TH2O, TCR]);

	// Signs placed on the camp map — key is "r,c", value is the message shown when
	// the player presses E next to it. Coordinates match camp's MAP tile grid.
	const SIGN_MESSAGES = (window.CAMP_DATA || {}).SIGN_MESSAGES;

	// ── Pokédex ───────────────────────────────────────────────────────────────────
	const Pokedex = (window.CAMP_SYSTEMS || {}).Pokedex;

	// ── PC Box ────────────────────────────────────────────────────────────────────
	const PCBox = (window.CAMP_SYSTEMS || {}).PCBox;

	// ── Wonder Trade ──────────────────────────────────────────────────────────────
	const WonderTrade = (window.CAMP_SYSTEMS || {}).WonderTrade;

	// ── Egg System ────────────────────────────────────────────────────────────────
	const EggSystem = (() => {
		const HATCH_STEPS_PUBLIC = 256;
		const HATCH_STEPS = HATCH_STEPS_PUBLIC;
		const BABIES = [
			{ form:'eevee', name:'Eevee', chance:0.3 },
			{ form:'eevee', name:'Pichu', chance:0.25 },
			{ form:'eevee', name:'Cleffa', chance:0.15 },
			{ form:'eevee', name:'Igglybuff', chance:0.15 },
			{ form:'eevee', name:'Togepi', chance:0.1 },
			{ form:'eevee', name:'Azurill', chance:0.05 },
		];
		function hasEgg() { return !!(Inventory.load().egg); }
		function stepUpdate() {
			const inv = Inventory.load();
			if (!inv.egg) return;
			inv.egg.steps = (inv.egg.steps || 0) + 1;
			if (inv.egg.steps >= HATCH_STEPS) {
				hatch(inv);
			} else {
				Inventory.save(inv);
			}
		}
		function hatch(inv) {
			inv.egg = null;
			const r = Math.random();
			let cum = 0, picked = BABIES[0];
			for (const b of BABIES) { cum += b.chance; if (r < cum) { picked = b; break; } }
			const added = PCBox.addToBox({ form: picked.form, nickname: picked.name, friendship: 0, since: Date.now() });
			Inventory.save(inv);
			if (added) {
				showToast(ico(ICO.egg) + ' Your egg hatched into ' + picked.name + '! Added to PC Box.');
				Achievements.unlock('hatchEgg');
			} else {
				inv = Inventory.load();
				inv.tokens = (inv.tokens || 0) + 30;
				Inventory.save(inv);
				showToast(ico(ICO.egg) + ' Egg hatched! PC Box full — got +30 ' + ico(ICO.token) + ' instead.');
			}
		}
		function buyEgg() {
			const inv = Inventory.load();
			if (inv.egg) { showToast('You already have an egg!'); return; }
			if ((inv.tokens||0) < 40) { showToast('Need 40 ' + ico(ICO.token) + ' to buy an egg.'); return; }
			inv.tokens -= 40;
			inv.egg = { steps: 0, target: HATCH_STEPS };
			Inventory.save(inv);
			showToast(ico(ICO.egg) + ' Egg acquired! Walk around camp to hatch it (' + HATCH_STEPS + ' steps).');
		}
		function status() {
			const inv = Inventory.load();
			if (!inv.egg) return null;
			return inv.egg;
		}
		return { hasEgg, stepUpdate, buyEgg, status, HATCH_STEPS: HATCH_STEPS_PUBLIC };
	})();

	// ── Contests ──────────────────────────────────────────────────────────────────
	const Contests = (() => {
		const CATEGORIES = [
			{ id:'cool',      label:ico(ICO.fire)+' Cool',      minigame:'rhythm',  desc:'Show off your style!' },
			{ id:'beautiful', label:ico(ICO.water)+' Beautiful',  minigame:'card',    desc:'Dazzle the judges.' },
			{ id:'cute',      label:ico(ICO.sparkle)+' Cute',       minigame:'rps',     desc:'Win hearts with charm.' },
			{ id:'clever',    label:ico(ICO.gem)+' Clever',     minigame:'sketch',  desc:'Outsmart the competition.' },
			{ id:'tough',     label:ico(ICO.bolt)+' Tough',     minigame:'card',    desc:'Prove your strength.' },
		];
		function open() {
			let panel = document.getElementById('contestPanel');
			if (!panel) {
				panel = document.createElement('div');
				panel.id = 'contestPanel';
				panel.style.cssText = 'position:fixed;inset:0;z-index:80;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P",monospace';
				document.body.appendChild(panel);
				panel.addEventListener('pointerdown', e => { if(e.target===panel) panel.hidden=true; });
			}
			panel.hidden = false;
			const inv = Inventory.load();
			const ribbons = inv.ribbons || {};
			panel.className = 'pk-backdrop';
			panel.innerHTML = '';
			const inner = document.createElement('div');
			inner.className = 'pk-modal pk-modal-sm';
			inner.innerHTML = '<div class="pk-modal-head">' +
				'<span class="pk-modal-title" style="color:#f6a0e8">' + ico(ICO.contest) + ' CONTEST HALL</span>' +
				'<button id="contestClose" class="pk-close" style="color:#f6a0e8" type="button">' + ico(ICO.close) + '</button>' +
				'</div>';
			const body = document.createElement('div');
			body.className = 'pk-modal-body';
			const subtitle = document.createElement('div');
			subtitle.style.cssText = 'font-size:8px;color:#e8c0e8;margin-bottom:14px';
			subtitle.textContent = 'Enter your partner in a Pokémon Contest!';
			body.appendChild(subtitle);
			const list = document.createElement('div');
			list.style.cssText = 'display:flex;flex-direction:column;gap:8px';
			CATEGORIES.forEach(cat => {
				const won = ribbons[cat.id];
				const row = document.createElement('div');
				row.className = 'pk-contest-row';
				const info = document.createElement('div');
				const nameEl = document.createElement('div');
				nameEl.className = 'pk-contest-name';
				nameEl.innerHTML = cat.label;
				const descEl = document.createElement('div');
				descEl.className = 'pk-contest-desc';
				descEl.textContent = cat.desc;
				info.appendChild(nameEl);
				info.appendChild(descEl);
				row.appendChild(info);
				if (won) {
					const ribbon = document.createElement('span');
					ribbon.style.cssText = 'font-size:18px';
					ribbon.innerHTML = ico(ICO.ribbon);
					row.appendChild(ribbon);
				} else {
					const entBtn = document.createElement('button');
					entBtn.dataset.cat = cat.id;
					entBtn.type = 'button';
					entBtn.className = 'pk-btn pk-btn-sm';
					entBtn.style.background = 'linear-gradient(180deg,#c060b8,#8040a0)';
					entBtn.style.color = '#fff';
					entBtn.textContent = 'Enter';
					row.appendChild(entBtn);
				}
				list.appendChild(row);
			});
			body.appendChild(list);
			inner.appendChild(body);
			panel.appendChild(inner);
			inner.addEventListener('pointerdown', e => e.stopPropagation());
			document.getElementById('contestClose').addEventListener('click', () => { panel.hidden = true; });
			list.querySelectorAll('[data-cat]').forEach(btn => {
				btn.addEventListener('click', () => {
					const cat = CATEGORIES.find(c => c.id === btn.dataset.cat);
					if (!cat) return;
					panel.hidden = true;
					Battle.startContestMode(cat, (won) => {
						if (won) {
							const inv2 = Inventory.load();
							if (!inv2.ribbons) inv2.ribbons = {};
							inv2.ribbons[cat.id] = true;
							Inventory.save(inv2);
							showToast(ico(ICO.ribbon) + ' Won the ' + cat.label + ' Contest! Ribbon earned!');
							Achievements.unlock('contestWin');
							if (Object.keys(inv2.ribbons).length >= 5) Achievements.unlock('contestMaster');
						} else {
							showToast('Didn\'t place in the ' + cat.label + ' Contest. Try again!');
						}
					});
				});
			});
		}
		return { open };
	})();

	// ── Curry Cooking ─────────────────────────────────────────────────────────────
	const CurryCooking = (window.CAMP_SYSTEMS || {}).CurryCooking;

	// ── Pokémon Amie ───────────────────────────────────────────────────────────────
	const Amie = (window.CAMP_SYSTEMS || {}).Amie;

	// ── Wild-encounter battle system ─────────────────────────────────────────────
	// Self-contained DOM-overlay battle UI: shows a spinning wheel that picks one
	// of four minigames at random, runs that minigame, and reports the result via
	// the callback passed to Battle.start(). Wins award Friendship Berries.
	const Battle = (() => {
		const TYPES = ['fire', 'water', 'grass'];
		const TYPE_ICO = { fire: ICO.fire, water: ICO.water, grass: ICO.tree, electric: ICO.bolt, psychic: ICO.gem, fairy: ICO.sparkle, normal: ICO.star };
		// Effectiveness multiplier: TYPES[attacker] vs TYPES[defender].
		// Standard fire→grass, grass→water, water→fire.
		const EFFECTIVENESS = {
			fire:   { fire: 1, water: 0.5, grass: 2 },
			water:  { fire: 2, water: 1, grass: 0.5 },
			grass:  { fire: 0.5, water: 2, grass: 1 },
		};
		// Pokémon used for sketch/foe — id, name, type. Sprites from PokeAPI CDN.
		const POKEMON = [
			{id:1,name:'Bulbasaur',type:'grass'},{id:4,name:'Charmander',type:'fire'},
			{id:7,name:'Squirtle',type:'water'},{id:25,name:'Pikachu',type:'electric'},
			{id:35,name:'Clefairy',type:'fairy'},{id:39,name:'Jigglypuff',type:'normal'},
			{id:54,name:'Psyduck',type:'water'},{id:60,name:'Poliwag',type:'water'},
			{id:63,name:'Abra',type:'psychic'},{id:133,name:'Eevee',type:'normal'},
			{id:52,name:'Meowth',type:'normal'},{id:66,name:'Machop',type:'fighting'},
			{id:74,name:'Geodude',type:'rock'},{id:92,name:'Gastly',type:'ghost'},
			{id:102,name:'Exeggcute',type:'grass'},{id:113,name:'Chansey',type:'normal'},
			{id:116,name:'Horsea',type:'water'},{id:129,name:'Magikarp',type:'water'},
			{id:137,name:'Porygon',type:'normal'},{id:143,name:'Snorlax',type:'normal'},
			{id:147,name:'Dratini',type:'dragon'},{id:19,name:'Rattata',type:'normal'},
			{id:41,name:'Zubat',type:'poison'},{id:43,name:'Oddish',type:'grass'},
			{id:48,name:'Venonat',type:'bug'},{id:81,name:'Magnemite',type:'electric'},
			{id:95,name:'Onix',type:'rock'},{id:106,name:'Hitmonlee',type:'fighting'},
			{id:123,name:'Scyther',type:'bug'},{id:131,name:'Lapras',type:'water'},
		];
		let _currentEncounter = null;
		let _contestMode = false;
		const SPRITE_URL = (id) => 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/' + id + '.png';
		const MINIGAMES = ['card', 'rps', 'rhythm', 'sketch'];
		let resultCb = null;
		let rhythmState = null;
		let _endHandler = null;

		function $(id) { return document.getElementById(id); }
		function show(screen) {
			const root = $('campBattle');
			if (!root) return;
			root.hidden = false;
			root.querySelectorAll('.cb-screen').forEach(el => {
				el.hidden = el.dataset.screen !== screen;
			});
		}
		function hideAll() {
			const root = $('campBattle');
			if (root) root.hidden = true;
		}

		function start(cb) {
			// Clean up any leftover state from a previous encounter.
			rhythmState?.stop();
			rhythmState = null;
			if (_endHandler) {
				const btn = $('cbEndBtn');
				if (btn) btn.removeEventListener('click', _endHandler);
				_endHandler = null;
			}
			resultCb = cb;
			_contestMode = false;
			_currentEncounter = POKEMON[Math.floor(Math.random() * POKEMON.length)];
			Pokedex.markSeen(_currentEncounter.id);
			// Reset wheel UI
			const disc = $('cbWheelDisc');
			if (disc) disc.style.transform = 'rotate(0deg)';
			const wr = $('cbWheelResult');
			if (wr) { wr.hidden = true; wr.textContent = ''; }
			const sb = $('cbSpinBtn');
			if (sb) { sb.disabled = false; sb.textContent = 'Spin!'; }
			show('wheel');
			// Play encounter cry and switch to battle music.
			Sound.cry(_currentEncounter.id);
			Music.start('battle');
		}

		function startContestMode(cat, cb) {
			rhythmState?.stop();
			rhythmState = null;
			if (_endHandler) {
				const btn = $('cbEndBtn');
				if (btn) btn.removeEventListener('click', _endHandler);
				_endHandler = null;
			}
			resultCb = (won) => cb(won);
			_contestMode = true;
			Music.start('battle');
			startMinigame(cat.minigame);
		}

		function spin() {
			const sb = $('cbSpinBtn');
			if (sb) { sb.disabled = true; sb.textContent = 'Spinning…'; }
			Sound.spin();
			const choice = MINIGAMES[Math.floor(Math.random() * MINIGAMES.length)];
			const idx = MINIGAMES.indexOf(choice);
			// Each slice is 90deg; pointer is at the top. Rotate the disc so the chosen
			// slice ends up under the pointer, with several full spins for flavour.
			const sliceAngle = 90;
			const target = 360 * 4 - (idx * sliceAngle) - sliceAngle / 2;
			const disc = $('cbWheelDisc');
			if (disc) disc.style.transform = 'rotate(' + target + 'deg)';
			setTimeout(() => {
				const wr = $('cbWheelResult');
				if (wr) {
					wr.hidden = false;
					wr.textContent = 'It’s ' + choice.toUpperCase() + '! Click to begin.';
				}
				if (sb) { sb.disabled = false; sb.textContent = 'Begin'; sb.dataset.next = choice; }
			}, 3100);
		}

		function nextFromWheel() {
			const sb = $('cbSpinBtn');
			const next = sb && sb.dataset.next;
			if (!next) { spin(); return; }
			sb.dataset.next = '';
			startMinigame(next);
		}

		function showRhythmDifficulty() {
			show('rhythm-diff');
		}

		function startMinigame(key) {
			if (key === 'card')    startCard();
			else if (key === 'rps')    startRps();
			else if (key === 'rhythm') showRhythmDifficulty();
			else if (key === 'sketch') startSketch();
		}

		// ── Card battle ───────────────────────────────────────────────────────────
		function startCard() {
			show('card');
			const foeType = TYPES[Math.floor(Math.random() * TYPES.length)];
			$('cbCardFoe').innerHTML = 'A wild ' + (TYPE_ICO[foeType] ? ico(TYPE_ICO[foeType]) + ' ' : '') + foeType.toUpperCase() + ' Pokémon appears!';
			// Build a hand of three random typed cards (no duplicates).
			const hand = [...TYPES].sort(() => Math.random() - 0.5);
			const handEl = $('cbCardHand');
			handEl.innerHTML = '';
			const res = $('cbCardResult');
			res.hidden = true;
			hand.forEach(t => {
				const eff = EFFECTIVENESS[t][foeType];
				const tag = eff > 1 ? 'super effective' : eff < 1 ? 'not very effective' : 'normal';
				const effClass = eff > 1 ? 'super' : eff < 1 ? 'weak' : 'normal';
				const btn = document.createElement('button');
				btn.className = 'cb-card-card';
				btn.type = 'button';
				btn.dataset.effect = effClass;
				btn.dataset.cardType = t; // store type for safe lookup on reveal
				btn.innerHTML = (TYPE_ICO[t] ? ico(TYPE_ICO[t]) + ' ' : '') + t.toUpperCase() + '<span class="cb-card-tag">(?)</span>';
				btn.addEventListener('click', () => {
					const won = eff >= 1;
					res.hidden = false;
					res.textContent = won
						? ico(ICO.check) + ' ' + tag + '! You won the battle.'
						: ico('x-circle-fill') + ' ' + tag + '. The wild Pokémon got away.';
					handEl.querySelectorAll('button').forEach(b => {
						b.disabled = true;
						const bType = b.dataset.cardType;
						const bEff = EFFECTIVENESS[bType]?.[foeType] ?? 1;
						const tagEl = b.querySelector('.cb-card-tag');
						if (tagEl) tagEl.textContent = '(' + (bEff > 1 ? 'super' : bEff < 1 ? 'weak' : 'ok') + ')';
					});
					setTimeout(() => end(won, 1), 1500);
				});
				handEl.appendChild(btn);
			});
		}

		// ── Type RPS ──────────────────────────────────────────────────────────────
		function startRps() {
			show('rps');
			const foe = $('cbRpsFoe');
			foe.textContent = 'Foe is choosing…';
			const res = $('cbRpsResult');
			res.hidden = true;
			const btns = $('cbRpsButtons').querySelectorAll('.cb-rps-btn');
			btns.forEach(b => { b.disabled = false; });
			const handler = (e) => {
				const player = e.currentTarget.dataset.type;
				const ai = TYPES[Math.floor(Math.random() * TYPES.length)];
				btns.forEach(b => { b.disabled = true; });
				foe.innerHTML = 'Foe picked ' + (TYPE_ICO[ai] ? ico(TYPE_ICO[ai]) + ' ' : '') + ai.toUpperCase() + '. You picked ' + (TYPE_ICO[player] ? ico(TYPE_ICO[player]) + ' ' : '') + player.toUpperCase() + '.';
				const eff = EFFECTIVENESS[player][ai];
				const won = eff >= 1;
				res.hidden = false;
				res.innerHTML = eff > 1 ? ico(ICO.check) + ' Super effective! You won.' : eff < 1 ? ico('x-circle-fill') + ' Not very effective. You lost.' : ico('dash-circle-fill') + ' Standoff — you held your ground.';
				btns.forEach(b => b.removeEventListener('click', handler));
				setTimeout(() => end(won, 1), 1500);
			};
			btns.forEach(b => b.addEventListener('click', handler, { once: true }));
		}

		// ── Rhythm strike ─────────────────────────────────────────────────────────
		function startRhythm(difficulty) {
			const diff = difficulty || 'normal';
			const CONFIGS = {
				easy:   { speed: 1.4, zoneW: 28, zoneL: 36, hitsNeeded: 3, missesAllowed: 3, mult: 1 },
				normal: { speed: 2.2, zoneW: 20, zoneL: 40, hitsNeeded: 3, missesAllowed: 3, mult: 2 },
				hard:   { speed: 3.4, zoneW: 10, zoneL: 45, hitsNeeded: 5, missesAllowed: 2, mult: 4 },
			};
			const cfg = CONFIGS[diff] || CONFIGS.normal;
			window.__rhythmMult = cfg.mult;
			const pp = typeof getPartnerPassive === 'function' ? getPartnerPassive() : { rhythmSpeedPenalty: 1 };
			const SPEED = cfg.speed * pp.rhythmSpeedPenalty;
			const HITS_NEEDED = cfg.hitsNeeded;
			const MISSES_ALLOWED = cfg.missesAllowed;
			const zoneEl = document.querySelector('.cb-rhythm-zone');
			if (zoneEl) { zoneEl.style.width = cfg.zoneW + '%'; zoneEl.style.left = cfg.zoneL + '%'; }
			show('rhythm');
			const cursor = $('cbRhythmCursor');
			const score = $('cbRhythmScore');
			const res = $('cbRhythmResult');
			res.hidden = true;
			let pos = 0;
			let dir = 1;
			let hits = 0;
			let misses = 0;
			const targetFn = (pct) => Math.max(0, Math.min(100, pct));
			let raf = null;
			const tick = () => {
				pos += dir * SPEED;
				if (pos >= 100) { pos = 100; dir = -1; }
				if (pos <= 0)   { pos = 0;   dir =  1; }
				cursor.style.left = targetFn(pos) + '%';
				raf = requestAnimationFrame(tick);
			};
			tick();
			score.textContent = 'Hits: 0 / ' + HITS_NEEDED + ' · Misses: 0 / ' + MISSES_ALLOWED;
			const zoneLeft = cfg.zoneL;
			const zoneRight = cfg.zoneL + cfg.zoneW;
			const finish = (won) => {
				if (raf) cancelAnimationFrame(raf);
				document.removeEventListener('keydown', onKey);
				res.hidden = false;
				res.innerHTML = won ? ico(ICO.check) + ' Rhythm mastered!' : ico('x-circle-fill') + ' Out of sync.';
				if (won) { DailyQuests.increment('rhythm'); Achievements.increment('rhythm100'); TrainerLevel.addXP('rhythm'); }
				setTimeout(() => end(won, won ? hits : 0), 1300);
			};
			const onKey = (e) => {
				if (e.key !== ' ' && e.key !== 'Spacebar') return;
				e.preventDefault();
				if (pos >= zoneLeft && pos <= zoneRight) hits++; else misses++;
				score.textContent = 'Hits: ' + hits + ' / ' + HITS_NEEDED + ' · Misses: ' + misses + ' / ' + MISSES_ALLOWED;
				if (hits >= HITS_NEEDED) finish(true);
				else if (misses >= MISSES_ALLOWED) finish(false);
			};
			// Tap or click anywhere on the bar to register a hit. iOS Safari can
			// drop pointerdown if the gesture is interpreted as a scroll attempt,
			// so listen for touchstart too and bind on the whole rhythm screen as
			// a fallback (the bar's children — cursor/zone — sometimes intercept
			// taps on small screens).
			const onTap = (e) => { e.preventDefault(); onKey({ key: ' ' }); };
			const tapBtn = document.getElementById('cbRhythmTapBtn');
			const rhythmBar = document.querySelector('.cb-rhythm-bar');
			if (tapBtn) {
				tapBtn.addEventListener('touchstart', onTap, { passive: false });
				tapBtn.addEventListener('pointerdown', onTap);
			}
			if (rhythmBar) {
				rhythmBar.addEventListener('touchstart', onTap, { passive: false });
				rhythmBar.addEventListener('pointerdown', onTap);
			}
			document.addEventListener('keydown', onKey);
			rhythmState = { stop: () => {
				if (raf) cancelAnimationFrame(raf);
				document.removeEventListener('keydown', onKey);
				if (tapBtn) {
					tapBtn.removeEventListener('touchstart', onTap);
					tapBtn.removeEventListener('pointerdown', onTap);
				}
				if (rhythmBar) {
					rhythmBar.removeEventListener('touchstart', onTap);
					rhythmBar.removeEventListener('pointerdown', onTap);
				}
			}};
		}

		// ── Silhouette / sketch ───────────────────────────────────────────────────
		function startSketch() {
			show('sketch');
			const stage = $('cbSketchImg');
			const btns = $('cbSketchButtons');
			const res = $('cbSketchResult');
			res.hidden = true;
			stage.classList.remove('is-revealed');
			// Pick one correct + three distractors.
			const pool = [...POKEMON].sort(() => Math.random() - 0.5);
			const correct = pool[0];
			_currentEncounter = correct;
			const choices = pool.slice(0, 4).sort(() => Math.random() - 0.5);
			stage.src = SPRITE_URL(correct.id);
			btns.innerHTML = '';
			choices.forEach(p => {
				const b = document.createElement('button');
				b.className = 'cb-btn cb-sketch-btn';
				b.type = 'button';
				b.textContent = p.name;
				b.addEventListener('click', () => {
					stage.classList.add('is-revealed');
					[...btns.querySelectorAll('button')].forEach(x => { x.disabled = true; });
					const won = p.id === correct.id;
					res.hidden = false;
					res.innerHTML = won ? ico(ICO.check) + ' It was ' + correct.name + '!' : ico('x-circle-fill') + ' It was actually ' + correct.name + '.';
					setTimeout(() => end(won, 1), 1600);
				}, { once: true });
				btns.appendChild(b);
			});
		}

		// ── Result screen ─────────────────────────────────────────────────────────
		function end(won, bonus) {
			show('end');
			if (won) { Stats.increment('totalCatches'); Sound.win(); } else Sound.lose();
			$('cbEndTitle').textContent = won ? 'You Won!' : 'You Lost!';
			let bodyMsg = won
				? '+1 Friendship Berry ' + ico(ICO.berry) + ' added to your bag.'
				: 'The wild Pokémon fled with the prize. Try again!';
			if (won) {
				const inv = Inventory.load();
				inv.friendshipBerries = (inv.friendshipBerries || 0) + 1;
				// Compute token bonus: rhythm passes hits (1-5); others pass 1
				const rawBonus = bonus || 0;
				let tokenBonus = rawBonus > 1 ? Math.min(5, rawBonus) : (rawBonus > 0 ? 1 : 0);
				// Rhythm boost doubles tokens
				if (tokenBonus > 0 && inv.boosts && inv.boosts.rhythmBoost > Date.now()) tokenBonus *= 2;
				// Furniture desk bonus
				const fb = getFurnitureBonuses ? getFurnitureBonuses() : null;
				if (fb && rawBonus > 1) tokenBonus += fb.rhythmTokenBonus; // desk gives +1 on rhythm
				// Partner passive: Flareon gives +1 token on rhythm; Rhythm Ear tutor skill gives +2
				const pp = typeof getPartnerPassive === 'function' ? getPartnerPassive() : { rhythmTokenBonus: 0, tutorRhythmBonus: 0 };
				if (rawBonus > 1) tokenBonus += pp.rhythmTokenBonus + (pp.tutorRhythmBonus || 0);
				// Rhythm difficulty multiplier
				if (rawBonus > 1 && window.__rhythmMult) tokenBonus = Math.round(tokenBonus * window.__rhythmMult);
				if (tokenBonus > 0) {
					inv.tokens = (inv.tokens || 0) + tokenBonus;
					bodyMsg += ' +' + tokenBonus + ' token' + (tokenBonus !== 1 ? 's' : '') + ' ' + ico(ICO.token);
				}
				Inventory.save(inv);
				if ((inv.tokens || 0) >= 500) Achievements.unlock('shopkeeper');
				DailyQuests.increment('minigame');
				showToast && showToast('+' + (tokenBonus > 0 ? tokenBonus + ' token' + (tokenBonus !== 1 ? 's' : '') + ' ' + ico(ICO.token) : '1 Berry ' + ico(ICO.berry)));
			}
			// Radar encounter doubles berry/token reward
			if (window.__radarEncounter && won) {
				const invR = Inventory.load();
				invR.friendshipBerries = (invR.friendshipBerries || 0) + 1;
				invR.tokens = (invR.tokens || 0) + 5;
				Inventory.save(invR);
				bodyMsg += ' [RADAR: doubled reward!]';
			}
			$('cbEndBody').textContent = bodyMsg;
			// Catch button — only in normal (non-contest) mode
			let catchBtn = null;
			if (won && _currentEncounter && !_contestMode) {
				catchBtn = document.createElement('button');
				catchBtn.className = 'cb-btn';
				catchBtn.type = 'button';
				catchBtn.style.cssText = 'margin-top:8px;font-size:9px';
				catchBtn.innerHTML = ico(ICO.bolt) + ' Throw Ball (5 ' + ico(ICO.token) + ')';
				catchBtn.addEventListener('click', () => {
					const inv = Inventory.load();
					if ((inv.tokens || 0) < 5) { showToast('Not enough tokens!'); return; }
					inv.tokens -= 5;
					Inventory.save(inv);
					Pokedex.markCaught(_currentEncounter.id);
					PCBox.addToBox({ form: _currentEncounter.id, name: _currentEncounter.name, nickname: '', friendship: 0, since: Date.now() });
					catchBtn.innerHTML = ico(ICO.check) + ' Caught ' + _currentEncounter.name + '!';
					catchBtn.disabled = true;
					Achievements.unlock('firstCatch');
				}, { once: true });
				const endBody = $('cbEndBody');
				if (endBody && endBody.parentElement) {
					endBody.parentElement.insertBefore(catchBtn, endBody.nextSibling);
				}
			}
			const btn = $('cbEndBtn');
			btn.textContent = 'Continue';
			// Remove any handler left from a previous battle before adding the new one.
			if (_endHandler) { btn.removeEventListener('click', _endHandler); _endHandler = null; }
			const handler = () => {
				_endHandler = null;
				if (catchBtn) { catchBtn.remove(); catchBtn = null; }
				hideAll();
				if (resultCb) { const cb = resultCb; resultCb = null; cb(won); }
			};
			_endHandler = handler;
			btn.addEventListener('click', handler, { once: true });
		}

		function wire() {
			const sb = $('cbSpinBtn');
			if (sb && !sb.dataset.wired) {
				sb.dataset.wired = '1';
				sb.addEventListener('click', nextFromWheel);
			}
			document.querySelectorAll('[data-diff]').forEach(btn => {
				if (!btn.dataset.diffWired) {
					btn.dataset.diffWired = '1';
					btn.addEventListener('click', () => startRhythm(btn.dataset.diff));
				}
			});
		}
		// Wire as soon as DOM is ready (in case start() hasn't been called yet).
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', wire);
		} else {
			wire();
		}

		function isOpen() {
			const root = $('campBattle');
			return root && !root.hidden;
		}

		return { start, isOpen, startContestMode };
	})();

	// ── Mart UI — Pikachu shopkeeper buys berries / sells seeds ──────────────────
	const Mart = (() => {
		let openFlag = false;
		function $(id) { return document.getElementById(id); }
		function refresh() {
			const inv = Inventory.load();
			const tokensEl = $('cmTokens');
			const berryEl = $('cmBerryCount');
			const seedEl = $('cmSeedCount');
			if (tokensEl) tokensEl.textContent = inv.tokens || 0;
			if (berryEl) berryEl.textContent = inv.friendshipBerries || 0;
			if (seedEl) seedEl.textContent = inv.seeds || 0;
			const baitCountEl = $('cmBaitCount');
			if (baitCountEl) baitCountEl.textContent = inv.fishingBait || 0;
			const premiumSeedCountEl = $('cmPremiumSeedCount');
			if (premiumSeedCountEl) premiumSeedCountEl.textContent = inv.premiumSeeds || 0;
			const oranSeedCountEl = $('cmOranSeedCount');
			if (oranSeedCountEl) oranSeedCountEl.textContent = inv.oranSeeds || 0;
			const sellOne = $('cmSellOne');
			const sellAll = $('cmSellAll');
			const buySeed = $('cmBuySeed');
			if (sellOne) sellOne.disabled = (inv.friendshipBerries || 0) <= 0;
			if (sellAll) sellAll.disabled = (inv.friendshipBerries || 0) <= 0;
			if (buySeed) buySeed.disabled = (inv.tokens || 0) < SEED_PRICE;
			const buyBait = $('cmBuyBait');
			if (buyBait) buyBait.disabled = (inv.tokens || 0) < 12;
			const buyPremiumSeed = $('cmBuyPremiumSeed');
			if (buyPremiumSeed) buyPremiumSeed.disabled = (inv.tokens || 0) < 18;
			const buyOranSeed = $('cmBuyOranSeed');
			if (buyOranSeed) buyOranSeed.disabled = (inv.tokens || 0) < 20;
			const buyScythe = $('cmBuyScythe');
			if (buyScythe) {
				buyScythe.disabled = !!inv.hasScythe || (inv.tokens || 0) < SCYTHE_PRICE;
				buyScythe.textContent = inv.hasScythe ? 'Owned' : 'Buy';
			}
			document.querySelectorAll('.cm-scythe-status').forEach(el => {
				el.textContent = inv.hasScythe ? '(owned — press Q to equip)' : '';
			});
			// Stones — disable buy when already owned (one at a time) or short on tokens.
			document.querySelectorAll('[data-buy-stone]').forEach(b => {
				const t = b.dataset.buyStone;
				const owned = inv.stone === t;
				b.disabled = owned || (inv.tokens || 0) < STONE_PRICE || (inv.eeveeForm && inv.eeveeForm !== 'eevee');
				b.textContent = owned ? 'Held' : 'Buy';
			});
			document.querySelectorAll('.cm-stone-status').forEach(el => {
				el.textContent = inv.stone === el.dataset.stone ? '(held)' : '';
			});
			const buyRadar = $('cmBuyRadar');
			const radarStatus = $('cmRadarStatus');
			if (buyRadar) { buyRadar.disabled = !!(inv.pokeRadar) || (inv.tokens||0) < 80; buyRadar.textContent = inv.pokeRadar ? 'Owned' : 'Buy'; }
			if (radarStatus) radarStatus.textContent = inv.pokeRadar ? '(owned)' : '';
			const rsBtn = $('cmBuyRockSmash');
			if (rsBtn) { rsBtn.disabled = !!(inv.hasRockSmash)||(inv.tokens||0)<60; rsBtn.textContent = inv.hasRockSmash?'Owned':'Buy'; }
			$('cmRockSmashStatus') && ($('cmRockSmashStatus').textContent = inv.hasRockSmash ? '(owned)' : '');
			// Plot upgrade
			const upgradeBtn = $('cmUpgradePlot');
			const plotLvlEl = $('cmPlotLevel');
			if (upgradeBtn) {
				const lvl = inv.plotUpgrade || 0;
				if (plotLvlEl) plotLvlEl.textContent = '(Lv ' + (lvl + 1) + ')';
				const cost = [50, 120][lvl];
				if (lvl >= 2) {
					upgradeBtn.textContent = 'Plot Max';
					upgradeBtn.disabled = true;
				} else {
					upgradeBtn.innerHTML = 'Upgrade → Lv' + (lvl + 2) + ' · ' + cost + ' ' + ico(ICO.token);
					upgradeBtn.disabled = (inv.tokens || 0) < cost;
				}
			}
			// Cosmetics — mark owned items and disable if already active or too poor.
			const cosm = inv.cosmetics || {};
			const tokens = inv.tokens || 0;
			document.querySelectorAll('[data-buy-wallpaper]').forEach(b => {
				const key = b.dataset.buyWallpaper;
				const active = (cosm.wallpaper || 'default') === key;
				b.disabled = active || tokens < COSM_PRICE.wallpaper;
				b.classList.toggle('cm-cosm-owned', active);
				b.innerHTML = active ? ico(ICO.check) + ' Active' : b.dataset.label;
			});
			document.querySelectorAll('[data-buy-accent]').forEach(b => {
				const key = b.dataset.buyAccent;
				const active = (cosm.accent || 'default') === key;
				b.disabled = active || tokens < COSM_PRICE.accent;
				b.classList.toggle('cm-cosm-owned', active);
				b.innerHTML = active ? ico(ICO.check) + ' Active' : b.dataset.label;
			});
			document.querySelectorAll('[data-buy-scale]').forEach(b => {
				const key = b.dataset.buyScale;
				const active = (cosm.partnerScale || 'normal') === key;
				b.disabled = active || (key !== 'normal' && tokens < COSM_PRICE.scale);
				b.classList.toggle('cm-cosm-owned', active);
				b.innerHTML = active ? ico(ICO.check) + ' Active' : b.dataset.label;
			});
			document.querySelectorAll('[data-buy-decor]').forEach(b => {
				const key = b.dataset.buyDecor;
				const owned = (cosm.decor || []).includes(key);
				b.disabled = owned || tokens < COSM_PRICE[key];
				b.classList.toggle('cm-cosm-owned', owned);
				b.textContent = owned
					? ico(ICO.check) + ' ' + b.dataset.label + ' (placed)'
					: b.dataset.label + ' · ' + (b.dataset.price || COSM_PRICE[key]) + ' ' + ico(ICO.token);
			});
		}
		function setStatus(msg) {
			const el = $('cmStatus');
			if (!el) return;
			el.textContent = msg || '';
		}
		function open() {
			const root = $('campMart');
			if (!root) return;
			root.hidden = false;
			openFlag = true;
			setStatus('');
			refresh();
		}
		function close() {
			const root = $('campMart');
			if (root) root.hidden = true;
			openFlag = false;
		}
		function isOpen() { return openFlag; }
		function wire() {
			const root = $('campMart');
			if (!root || root.dataset.wired) return;
			root.dataset.wired = '1';
			$('cmSellOne') && $('cmSellOne').addEventListener('click', () => {
				const inv = Inventory.load();
				if ((inv.friendshipBerries || 0) <= 0) return;
				inv.friendshipBerries -= 1;
				const fb = getFurnitureBonuses ? getFurnitureBonuses() : { berrySellBonus: 0 };
				const earnedTokens = BERRY_PRICE + (fb.berrySellBonus || 0);
				inv.tokens = (inv.tokens || 0) + earnedTokens;
				Inventory.save(inv);
				setStatus('Sold 1 berry for ' + earnedTokens + ' Tokens.');
				refresh();
			});
			$('cmSellAll') && $('cmSellAll').addEventListener('click', () => {
				const inv = Inventory.load();
				const n = inv.friendshipBerries || 0;
				if (n <= 0) return;
				inv.friendshipBerries = 0;
				const fb = getFurnitureBonuses ? getFurnitureBonuses() : { berrySellBonus: 0 };
				const priceEach = BERRY_PRICE + (fb.berrySellBonus || 0);
				inv.tokens = (inv.tokens || 0) + n * priceEach;
				Inventory.save(inv);
				setStatus('Sold ' + n + ' berries for ' + (n * priceEach) + ' Tokens.');
				refresh();
			});
			$('cmBuySeed') && $('cmBuySeed').addEventListener('click', () => {
				const inv = Inventory.load();
				if ((inv.tokens || 0) < SEED_PRICE) return;
				inv.tokens -= SEED_PRICE;
				inv.seeds = (inv.seeds || 0) + 1;
				Inventory.save(inv);
				setStatus('Bought 1 Seed for ' + SEED_PRICE + ' Tokens.');
				refresh();
			});
			$('cmBuyBait') && $('cmBuyBait').addEventListener('click', () => {
				const inv = Inventory.load();
				if ((inv.tokens || 0) < 12) return;
				inv.tokens -= 12;
				inv.fishingBait = (inv.fishingBait || 0) + 3;
				Inventory.save(inv);
				setStatus('Bought 3 Fishing Bait! Bigger catch zone when fishing.');
				refresh();
			});
			$('cmBuyPremiumSeed') && $('cmBuyPremiumSeed').addEventListener('click', () => {
				const inv = Inventory.load();
				if ((inv.tokens || 0) < 18) return;
				inv.tokens -= 18;
				inv.premiumSeeds = (inv.premiumSeeds || 0) + 1;
				Inventory.save(inv);
				setStatus('Bought 1 Premium Seed! Grows 3× faster and gives double berries.');
				refresh();
			});
			$('cmBuyOranSeed') && $('cmBuyOranSeed').addEventListener('click', () => {
				const inv = Inventory.load();
				if ((inv.tokens || 0) < 20) return;
				inv.tokens -= 20;
				inv.oranSeeds = (inv.oranSeeds || 0) + 1;
				Inventory.save(inv);
				setStatus('Bought 1 Oran Seed! Plants a berry that gives extra friendship.');
				refresh();
			});
			$('cmBuyScythe') && $('cmBuyScythe').addEventListener('click', () => {
				const inv = Inventory.load();
				if (inv.hasScythe) return;
				if ((inv.tokens || 0) < SCYTHE_PRICE) return;
				inv.tokens -= SCYTHE_PRICE;
				inv.hasScythe = true;
				inv.scytheEquipped = true;
				Inventory.save(inv);
				setStatus('Bought a Scythe! Press Q to toggle. Swing with E near ripe crops.');
				refresh();
			});
			const upgradePlotBtn = $('cmUpgradePlot');
			if (upgradePlotBtn && !upgradePlotBtn.dataset.wired) {
				upgradePlotBtn.dataset.wired = '1';
				upgradePlotBtn.addEventListener('click', () => {
					const inv = Inventory.load();
					const lvl = inv.plotUpgrade || 0;
					if (lvl >= 2) return;
					const cost = [50, 120][lvl];
					if ((inv.tokens || 0) < cost) return;
					inv.tokens -= cost;
					inv.plotUpgrade = lvl + 1;
					Inventory.save(inv);
					setStatus('Berry plot upgraded to level ' + (lvl + 2) + '! Plant more seeds at once.');
					refresh();
				});
			}
			document.querySelectorAll('[data-buy-stone]').forEach(b => {
				b.addEventListener('click', () => {
					const inv = Inventory.load();
					const stone = b.dataset.buyStone;
					if ((inv.tokens || 0) < STONE_PRICE) return;
					if (inv.stone === stone) return;
					inv.tokens -= STONE_PRICE;
					inv.stone = stone;
					Inventory.save(inv);
					const nm = stone.charAt(0).toUpperCase() + stone.slice(1);
					setStatus('Bought ' + nm + ' Stone! Hand it to Eevee to evolve.');
					refresh();
				});
			});
			$('cmBuyRadar') && $('cmBuyRadar').addEventListener('click', () => {
				const inv = Inventory.load();
				if (inv.pokeRadar) { setStatus('Already owned!'); return; }
				if ((inv.tokens||0) < 80) { setStatus('Need 80 ' + ico(ICO.token)); return; }
				inv.tokens -= 80;
				inv.pokeRadar = true;
				Inventory.save(inv);
				setStatus('Poké Radar purchased! Press R in camp to toggle.');
				refresh();
			});
			$('cmBuyRockSmash') && $('cmBuyRockSmash').addEventListener('click', () => {
				const inv = Inventory.load();
				if (inv.hasRockSmash) { setStatus('Already have Rock Smash!'); return; }
				if ((inv.tokens||0) < 60) { setStatus('Need 60 ' + ico(ICO.token)); return; }
				inv.tokens -= 60;
				inv.hasRockSmash = true;
				Inventory.save(inv);
				setStatus('Got Rock Smash! Press E near boulders to break them.');
				refresh();
			});
			$('cmClose') && $('cmClose').addEventListener('click', close);

			// ── Mart tabs ─────────────────────────────────────────────────────────
			document.querySelectorAll('.cm-tab').forEach(tab => {
				if (tab.dataset.wired) return;
				tab.dataset.wired = '1';
				tab.addEventListener('click', () => {
					document.querySelectorAll('.cm-tab').forEach(t => t.classList.remove('is-active'));
					document.querySelectorAll('.cm-tab-pane').forEach(p => p.classList.remove('is-active'));
					tab.classList.add('is-active');
					const pane = document.getElementById('cmTab' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1));
					if (pane) pane.classList.add('is-active');
				});
			});

			// ── Cosmetics ─────────────────────────────────────────────────────────
			function buyCosmetic(key, applyFn) {
				const inv = Inventory.load();
				if (!inv.cosmetics) inv.cosmetics = {};
				applyFn(inv);
				Inventory.save(inv);
				applyCampAccent(inv.cosmetics.accent);
				refresh();
			}
			document.querySelectorAll('[data-buy-wallpaper]').forEach(b => {
				b.addEventListener('click', () => {
					const inv = Inventory.load();
					const key = b.dataset.buyWallpaper;
					if ((inv.tokens || 0) < COSM_PRICE.wallpaper) return;
					inv.tokens -= COSM_PRICE.wallpaper;
					inv.cosmetics.wallpaper = key;
					Inventory.save(inv);
					setStatus('Wallpaper changed to ' + b.dataset.label + '!');
					refresh();
				});
			});
			document.querySelectorAll('[data-buy-accent]').forEach(b => {
				b.addEventListener('click', () => {
					const inv = Inventory.load();
					const key = b.dataset.buyAccent;
					if ((inv.tokens || 0) < COSM_PRICE.accent) return;
					inv.tokens -= COSM_PRICE.accent;
					inv.cosmetics.accent = key;
					Inventory.save(inv);
					applyCampAccent(key);
					setStatus('Camp accent changed to ' + b.dataset.label + '!');
					refresh();
				});
			});
			document.querySelectorAll('[data-buy-scale]').forEach(b => {
				b.addEventListener('click', () => {
					const inv = Inventory.load();
					const key = b.dataset.buyScale;
					const price = key === 'normal' ? 0 : COSM_PRICE.scale;
					if ((inv.tokens || 0) < price) return;
					inv.tokens -= price;
					inv.cosmetics.partnerScale = key;
					Inventory.save(inv);
					setStatus('Partner size set to ' + b.dataset.label + '! Reopen camp to apply.');
					refresh();
				});
			});
			document.querySelectorAll('[data-buy-decor]').forEach(b => {
				b.addEventListener('click', () => {
					const inv = Inventory.load();
					const key = b.dataset.buyDecor;
					if ((inv.cosmetics.decor || []).includes(key)) return;
					if ((inv.tokens || 0) < COSM_PRICE[key]) return;
					inv.tokens -= COSM_PRICE[key];
					inv.cosmetics.decor = [...(inv.cosmetics.decor || []), key];
					Inventory.save(inv);
					setStatus(b.dataset.label + ' placed in camp!');
					refresh();
				});
			});
		}
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', wire);
		} else {
			wire();
		}
		return { open, close, isOpen };
	})();

	// ── Room Editor — upstairs room decoration panel ──────────────────────────
	const RoomEditor = (window.CAMP_SYSTEMS || {}).RoomEditor;

	// ── Partner Pokémon panel — dedicated page for the follower ─────────────────
	const Partner = (() => {
		let openFlag = false;
		function $(id) { return document.getElementById(id); }
		function refresh() {
			const inv = Inventory.load();
			// Active companion may be a slotted key "129:2", legacy number 4,
			// or an eeveelution string "eevee". dexFromKey extracts the numeric ID.
			const companionKey = inv.companionForm != null ? inv.companionForm : (inv.eeveeForm || 'eevee');
			const formLookup = dexFromKey(companionKey);
			const form = FOLLOWER_FORMS[formLookup] || FOLLOWER_FORMS[inv.eeveeForm || 'eevee'] || FOLLOWER_FORMS.eevee;
			const portrait = $('cpPortrait');
			if (portrait) {
				// Render south-idle frame at 3× scale.
				// For PMD/CDN sprites use form.url; for local eeveelutions use local path.
				const PS = 3;
				const imgUrl = form.url ? form.url : ('Pictures/sprites/' + form.sheet + '.png');
				portrait.style.backgroundImage = "url('" + imgUrl + "')";
				portrait.style.backgroundPosition = '0 0';
				portrait.style.backgroundSize = (form.frameW * form.cols * PS) + 'px ' + (form.frameH * 8 * PS) + 'px';
				portrait.style.width  = (form.frameW  * PS) + 'px';
				portrait.style.height = (form.frameH * PS) + 'px';
			}
			// Read per-slot data from the active party slot (with fallback to global inv fields).
			const _activeSlot = (inv.party || [])[inv.partyActive || 0] || null;
			const _slotNickname   = _activeSlot ? (_activeSlot.nickname || '') : loadNickname();
			const _slotFriendship = _activeSlot ? (_activeSlot.friendship || 0) : (inv.friendship || 0);
			const _slotSince      = _activeSlot ? (_activeSlot.since || inv.partnerSince || Date.now()) : (inv.partnerSince || Date.now());
			// Re-sync the nickname input from storage — keeps it correct after a
			// partner switch (which clears NICKNAME_KEY) without needing a full open().
			const niEl = $('cpNickname');
			if (niEl) niEl.value = _slotNickname;
			$('cpName') && ($('cpName').textContent = form.displayName);
			// Stage/form label — only meaningful for eeveelutions.
			const isEeveelution = typeof formLookup === 'string'; // eeveelutions have string keys
			const dexNum = typeof formLookup === 'number' ? formLookup : null;
			$('cpForm') && ($('cpForm').textContent = isEeveelution
				? (inv.eeveeForm === 'eevee' ? 'Stage 1 — can evolve' : 'Stage 2 — terminal evolution')
				: 'Walking partner · #' + String(dexNum).padStart(3, '0'));
			const fpct = Math.min(100, Math.round((_slotFriendship / FRIENDSHIP_MAX) * 100));
			const bar = $('cpFriendshipBar');
			if (bar) bar.style.width = fpct + '%';
			$('cpFriendshipText') && ($('cpFriendshipText').textContent = _slotFriendship + ' / ' + FRIENDSHIP_MAX + (inv.eeveeForm !== 'eevee' ? ' (maxed)' : ''));
			$('cpBerries') && ($('cpBerries').textContent = inv.friendshipBerries || 0);
			const feedBtn = $('cpFeed');
			if (feedBtn) feedBtn.disabled = (inv.friendshipBerries || 0) <= 0 || (inv.eeveeForm && inv.eeveeForm !== 'eevee');
			const petBtn = $('cpPet');
			if (petBtn) petBtn.disabled = false;
			// Feature 8: Extra info
			const extraEl = $('cpInfoExtra');
			if (extraEl) {
				const days = Math.floor((Date.now() - _slotSince) / 86400000);
				const infoLines = [ico('clock-history') + ' ' + days + ' day' + (days !== 1 ? 's' : '') + ' together'];
				if (inv.friendship >= FRIENDSHIP_MAX && inv.eeveeForm === 'eevee' && inv.stone) infoLines.push(ico(ICO.bolt) + ' Ready to evolve! Feed a berry.');
				if (inv.boosts) {
					const _now = Date.now();
					if (inv.boosts.rhythmBoost > _now) infoLines.push(ico(ICO.music) + ' Rhythm boost: ' + Math.ceil((inv.boosts.rhythmBoost - _now) / 60000) + 'min left');
					if (inv.boosts.fastGrow > _now) infoLines.push(ico(ICO.seed) + ' Fast-grow: ' + Math.ceil((inv.boosts.fastGrow - _now) / 60000) + 'min left');
				}
				// Show partner passive ability
				if (typeof getPartnerPassive === 'function') {
					const pp = getPartnerPassive();
					const passiveLabels = [];
					if (pp.fishingBonus) passiveLabels.push(ico(ICO.fish) + ' Wider fishing zone');
					if (pp.rhythmTokenBonus > 0) passiveLabels.push(ico(ICO.music) + ' +' + pp.rhythmTokenBonus + ' rhythm token');
					if (pp.rhythmSpeedPenalty < 1) passiveLabels.push(ico(ICO.bolt) + ' Slower rhythm cursor');
					if (pp.growSpeedBonus > 0) passiveLabels.push(ico(ICO.seed) + ' Faster berry growth');
					if (pp.questRewardBonus > 0) passiveLabels.push(ico(ICO.quest) + ' +' + pp.questRewardBonus + ' quest tokens');
					if (pp.dailyCooldownMult < 1) passiveLabels.push(ico(ICO.moon) + ' Shorter daily cooldown');
					if (passiveLabels.length > 0) infoLines.push(ico(ICO.sparkle) + ' ' + passiveLabels.join(', '));
				}
				extraEl.innerHTML = infoLines.join('  ·  ');
			}
		}
		function setStatus(msg, kind) {
			const el = $('cpStatus');
			if (!el) return;
			el.textContent = msg || '';
			el.dataset.kind = kind || '';
		}
		function loadNickname() { try { return localStorage.getItem(NICKNAME_KEY) || ''; } catch { return ''; } }
		function saveNickname(n) { try { localStorage.setItem(NICKNAME_KEY, n); } catch {} }
		function loadShiny() { try { return localStorage.getItem(SHINY_KEY) === '1'; } catch { return false; } }
		function saveShiny(v) { try { localStorage.setItem(SHINY_KEY, v ? '1' : '0'); } catch {} }

		function open() {
			const root = $('campPartner');
			if (!root) return;
			root.hidden = false;
			openFlag = true;
			setStatus('');
			// Restore nickname and shiny state into inputs.
			const ni = $('cpNickname');
			if (ni) ni.value = loadNickname();
			const sb = $('cpShiny');
			if (sb) sb.classList.toggle('is-active', loadShiny());
			refresh();
		}
		function close() {
			const root = $('campPartner');
			if (root) root.hidden = true;
			openFlag = false;
			// If the nickname input (or any other input) is focused inside the panel,
			// hiding the panel won't fire focusout automatically in all browsers.
			// Explicit blur ensures _sceneKeyboard.enableGlobalCapture() is called.
			if (document.activeElement && root && root.contains(document.activeElement)) {
				document.activeElement.blur();
			}
		}
		function isOpen() { return openFlag; }
		function feed(sceneRef) {
			const inv = Inventory.load();
			if (inv.eeveeForm && inv.eeveeForm !== 'eevee') {
				setStatus(FOLLOWER_FORMS[inv.eeveeForm].displayName + ' is already evolved!', 'info');
				return;
			}
			if ((inv.friendshipBerries || 0) <= 0) {
				setStatus('You have no Friendship Berries.', 'warn');
				return;
			}
			const ppFeed = typeof getPartnerPassive === 'function' ? getPartnerPassive() : { tutorBerryBonus: 0 };
			const feedAmt = FRIENDSHIP_PER_BERRY + (ppFeed.tutorBerryBonus || 0);
			inv.friendshipBerries -= 1;
			inv.friendship = Math.min(FRIENDSHIP_MAX, (inv.friendship || 0) + feedAmt);
			Inventory.save(inv);
			DailyQuests.increment('feed');
			if (inv.friendship >= FRIENDSHIP_MAX) Achievements.unlock('fullFriend');
			if (inv.friendship >= FRIENDSHIP_MAX && sceneRef && typeof sceneRef._triggerEvolution === 'function') {
				close();
				sceneRef._triggerEvolution();
			} else {
				setStatus('Eevee gobbled a berry. +' + feedAmt + ' Friendship!', 'good');
				refresh();
			}
		}
		function pet() {
			const fb = getFurnitureBonuses ? getFurnitureBonuses() : { friendshipBonus: 0 };
			if (fb.friendshipBonus > 0) {
				const inv = Inventory.load();
				inv.friendship = Math.min(FRIENDSHIP_MAX, (inv.friendship || 0) + fb.friendshipBonus);
				Inventory.save(inv);
				setStatus('You give your partner a good pet.   (≧◡≦)  +' + fb.friendshipBonus + ' Friendship!', 'good');
				refresh();
			} else {
				setStatus('You give your partner a good pet.   (≧◡≦)', 'good');
			}
		}
		function openPartnerPicker() {
			const existing = document.getElementById('partnerPickerModal');
			if (existing) { existing.remove(); return; }

			// All 151 Gen-1 Pokémon are available as walking partners.
			// Caught ones are highlighted; uncaught ones are still selectable (dimmed).
			const caught = [];
			for (let _d = 1; _d <= 151; _d++) { caught.push(_d); }

			// Outer backdrop (fixed overlay) + inner pk-modal box — same pattern as Pokédex/PCBox
			const backdrop = document.createElement('div');
			backdrop.id = 'partnerPickerModal';
			backdrop.className = 'pk-backdrop';
			backdrop.style.zIndex = '200';
			const inner = document.createElement('div');
			inner.className = 'pk-modal';
			inner.style.cssText = 'max-width:420px;width:min(420px,94vw)';
			inner.innerHTML = '<div class="pk-modal-head">' +
				'<span class="pk-modal-title">' + ico(ICO.npc) + ' Choose Walking Partner</span>' +
				'<button class="pk-close" id="partnerPickerClose" type="button">' + ico(ICO.close) + '</button>' +
				'</div>' +
				'<div class="pk-modal-body" style="padding-top:8px">' +
				'<div id="partnerPickerGrid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;max-height:340px;overflow-y:auto;padding:4px 2px"></div>' +
				'</div>';
			backdrop.appendChild(inner);
			// Click outside inner box closes
			backdrop.addEventListener('pointerdown', e => { if (e.target === backdrop) backdrop.remove(); });
			document.body.appendChild(backdrop);

			const grid = document.getElementById('partnerPickerGrid');
			const inv = Inventory.load();
			const current = inv.companionForm;
			// Build per-instance list from the caught array (may contain duplicates).
			// Each entry: { dexId, companionKey, instanceLabel }
			// companionKey = "dexId:slotIndex" (slot = index within same-species instances).
			const speciesCount = {};
			const instances = [];
			Pokedex.getCaught().forEach((dexId, arrayIdx) => {
				speciesCount[dexId] = (speciesCount[dexId] || 0) + 1;
				instances.push({ dexId, arrayIdx });
			});
			// Assign per-species slot numbers so "Magikarp #1", "Magikarp #2" etc.
			const speciesSeen = {};
			instances.forEach(inst => {
				speciesSeen[inst.dexId] = (speciesSeen[inst.dexId] || 0);
				inst.slot = speciesSeen[inst.dexId]++;
				inst.companionKey = inst.dexId + ':' + inst.slot;
				inst.multipleOwned = speciesCount[inst.dexId] > 1;
			});

			// Render owned instances first, then dimmed uncaught Pokémon.
			const PICK_H = 44;
			function makeCell(dexId, companionKey, label, isActive, dimmed) {
				const form = FOLLOWER_FORMS[dexId];
				if (!form) return null;
				const cell = document.createElement('button');
				cell.type = 'button';
				cell.className = 'partner-pick-cell' + (isActive ? ' is-active' : '') + (dimmed ? ' is-unseen' : '');
				const bScale = PICK_H / form.frameH;
				const bW = Math.round(form.frameW * form.cols * bScale);
				const bH = Math.round(form.frameH * 8 * bScale);
				const fW = Math.round(form.frameW * bScale);
				cell.innerHTML =
					'<div class="partner-pick-sprite" style="' +
						'background-image:url(' + form.url + ');' +
						'background-size:' + bW + 'px ' + bH + 'px;' +
						'width:' + fW + 'px;height:' + PICK_H + 'px' +
					'"></div>' +
					'<div class="partner-pick-name">' + label + '</div>';
				cell.addEventListener('click', () => {
					window.__campScene?._switchFollower(companionKey);
					backdrop.remove();
					refresh();
				});
				return cell;
			}

			// Owned instances (full colour, possibly numbered).
			instances.forEach(({ dexId, companionKey, slot, multipleOwned }) => {
				const form = FOLLOWER_FORMS[dexId];
				if (!form) return;
				const label = form.displayName + (multipleOwned ? ' #' + (slot + 1) : '');
				const isActive = current === companionKey ||
					(typeof current === 'number' && current === dexId && slot === 0);
				const cell = makeCell(dexId, companionKey, label, isActive, false);
				if (cell) grid.appendChild(cell);
			});

			// Uncaught Pokémon — dimmed, no slot number.
			for (let _d = 1; _d <= 151; _d++) {
				if (Pokedex.isCaught(_d)) continue; // already shown above as owned instances
				const cell = makeCell(_d, _d, FOLLOWER_FORMS[_d]?.displayName || ('#' + _d), false, true);
				if (cell) grid.appendChild(cell);
			}

			document.getElementById('partnerPickerClose').addEventListener('click', () => backdrop.remove());
		}

		function wire(scene) {
			const root = $('campPartner');
			if (!root || root.dataset.wired) { return; }
			root.dataset.wired = '1';
			$('cpClose') && $('cpClose').addEventListener('click', close);
			$('cpFeed') && $('cpFeed').addEventListener('click', () => feed(scene));
			$('cpBerryLab') && $('cpBerryLab').addEventListener('click', () => BerryBreeding.open());
			$('cpPet') && $('cpPet').addEventListener('click', () => { Amie.open(); });
			$('cpPC') && $('cpPC').addEventListener('click', () => PCBox.open());
			$('cpChoosePartner') && $('cpChoosePartner').addEventListener('click', () => openPartnerPicker());
			$('cpInfoBtn') && $('cpInfoBtn').addEventListener('click', () => {
				const _pinv = Inventory.load();
				const _pkey = _pinv.companionForm != null ? _pinv.companionForm : (_pinv.eeveeForm || 'eevee');
				const _pdex = dexFromKey(_pkey);
				const EEVEE_DEX = { eevee:133,vaporeon:134,jolteon:135,flareon:136,espeon:196,umbreon:197,leafeon:470,glaceon:471,sylveon:700 };
				const dexId = typeof _pdex === 'number' ? _pdex : (EEVEE_DEX[_pdex] || 133);
				const displayName = FOLLOWER_FORMS[_pdex]?.displayName || FOLLOWER_FORMS[_pinv.eeveeForm || 'eevee']?.displayName || 'Eevee';
				PokeEncyclopedia.open(dexId, displayName);
			});
			// Nickname — save on input to both legacy NICKNAME_KEY and active party slot.
			const ni = $('cpNickname');
			if (ni) ni.addEventListener('input', () => {
				const trimmed = ni.value.trim();
				saveNickname(trimmed);
				// Also persist nickname into the active party slot so PCBox can display it.
				const _nInv = Inventory.load();
				const _nSlot = (_nInv.party || [])[_nInv.partyActive || 0];
				if (_nSlot) { _nSlot.nickname = trimmed; Inventory.save(_nInv); }
				if (scene && scene._updateFollowerLabel) scene._updateFollowerLabel();
			});
			// Shiny toggle — save and notify scene to retint follower.
			const sb = $('cpShiny');
			if (sb) sb.addEventListener('click', () => {
				const next = !loadShiny();
				saveShiny(next);
				sb.classList.toggle('is-active', next);
				if (scene && scene._applyFollowerShiny) scene._applyFollowerShiny();
			});
			root.addEventListener('click', (e) => { if (e.target === root) close(); });
		}
		return { open, close, isOpen, wire, loadNickname, loadShiny };
	})();

	// Universal ESC-to-close — works for any open modal in this file.
	document.addEventListener('keydown', (e) => {
		if (e.key !== 'Escape') return;
		if (Dialog.isOpen()) { Dialog.close(); e.preventDefault(); return; }
		if (Partner.isOpen()) { Partner.close(); e.preventDefault(); return; }
		if (Mart.isOpen()) { Mart.close(); e.preventDefault(); return; }
		if (RoomEditor.isOpen()) { RoomEditor.close(); e.preventDefault(); return; }
		// (Battle/pause have their own Escape handling.)
	});

	// ── Inventory + planted-berry persistence (localStorage) ─────────────────────
	const INVENTORY_KEY = (window.CAMP_DATA || {}).INVENTORY_KEY;
	const NICKNAME_KEY  = 'pokequiz_partner_nickname';
	const SHINY_KEY     = 'pokequiz_partner_shiny';
	const SAVE_KEY      = 'pokequiz_last_save';
	const PLANTS_KEY = (window.CAMP_DATA || {}).PLANTS_KEY;
	const GROW_MS = 30 * 1000; // 30 seconds — tunable; deliberately short for Phase 1
	const getEffectiveGrowMs = (window.CAMP_SYSTEMS || {}).getEffectiveGrowMs;
	const SEED_PRICE = 5;
	const BERRY_PRICE = 10;
	const BERRY_TYPES = (window.CAMP_DATA || {}).BERRY_TYPES;
	const SCYTHE_PRICE = 75;
	const SCYTHE_RADIUS = 3; // Manhattan radius around the player for a single swing
	const STONE_PRICE = 50;
	const FRIENDSHIP_PER_BERRY = 20;
	const FRIENDSHIP_MAX = (window.CAMP_DATA || {}).FRIENDSHIP_MAX;
	const DAILY_BONUS_KEY = (window.CAMP_DATA || {}).DAILY_BONUS_KEY;
	const DAILY_BONUS_MS = (window.CAMP_DATA || {}).DAILY_BONUS_MS;

	// Follower form data — each PMD walk sheet has its own frame size and column
	// count, so the south/east/north/west frame indices are computed per form.
	// originY values were sampled directly from each sprite's south-idle frame
	// (alpha bounding box) so the feet sit at the world anchor cleanly.
	const FOLLOWER_FORMS = (window.CAMP_DATA || {}).FOLLOWER_FORMS;
	// ── PMD SpriteCollab — all 151 Pokémon via CDN ────────────────────────────
	const PMD_CDN = 'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite/';
	const PMD_NAMES = (window.CAMP_DATA || {}).PMD_NAMES;
	// Official Pokédex heights in metres (index = dex number; 0 unused).
	// _ensureFollowerSprite uses these to size walkers proportionally vs the trainer.
	const POKEMON_HEIGHTS = (window.CAMP_DATA || {}).POKEMON_HEIGHTS;
	// Explicit frame-dimension overrides for PMD sheets whose layout the
	// auto-detector in _ensureFollowerSprite cannot resolve reliably.
	// dex: { frameW, frameH, cols }. Verified against the real Walk-Anim.png dims.
	const PMD_FRAME_OVERRIDES = (window.CAMP_DATA || {}).PMD_FRAME_OVERRIDES;
	for (let _i = 1; _i <= 151; _i++) {
		FOLLOWER_FORMS[_i] = {
			sheet: 'pmd-' + _i,
			url: PMD_CDN + String(_i).padStart(4,'0') + '/Walk-Anim.png',
			cols: 6, originY: 0.75,
			// 0.72 is a safe fallback; _ensureFollowerSprite recomputes from real height.
			scale: 0.72,
			frameW: 40, frameH: 40, displayName: PMD_NAMES[_i], dex: _i
		};
	}
	// ── Cosmetic lookup tables ────────────────────────────────────────────────────
	const WALLPAPER_BG = (window.CAMP_DATA || {}).WALLPAPER_BG;
	const ACCENT_HEX = (window.CAMP_DATA || {}).ACCENT_HEX;
	const SCALE_MULT = (window.CAMP_DATA || {}).SCALE_MULT;
	// Fixed world-pixel positions for static decor objects (TILE = 16)
	const DECOR_POS = (window.CAMP_DATA || {}).DECOR_POS;
	const COSM_PRICE = (window.CAMP_DATA || {}).COSM_PRICE;
	const ROOM_ITEMS = (window.CAMP_DATA || {}).ROOM_ITEMS;

	const HOUSE_ITEMS = (window.CAMP_DATA || {}).HOUSE_ITEMS;

	// ── Furniture pixel-art sprites ──────────────────────────────────────────────
	// 16×16 designs painted at runtime via canvas + fillRect, so no extra image
	// assets are needed and the look matches the camp's BW2-style tile art.
	// Each entry: { palette: { char: '#rrggbb' }, rows: [16 strings] }. '.' = transparent.
	const FURNITURE_DESIGNS = (window.CAMP_DATA || {}).FURNITURE_DESIGNS;

	// Sprite-sheet definitions for furniture.
	// s:1 = Pictures/furniture_sheet.png  (tileset_16x16_interior.png, 256×256, CC-BY-SA 3.0)
	// s:2 = Pictures/furniture_sheet2.png (furniture_0.png indoor RPG, 128×64, CC-BY 3.0)
	// x,y,w,h are pixel coords in that sheet; all output canvases are 16×16.
	const SPRITE_DEFS = (window.CAMP_DATA || {}).SPRITE_DEFS;

	const FurnitureSprites = (window.CAMP_SYSTEMS || {}).FurnitureSprites;

	const Inventory = (window.CAMP_SYSTEMS || {}).Inventory;
	const Plants = (window.CAMP_SYSTEMS || {}).Plants;

	// Camp NPCs. Stationary for Phase 1 — each renders frame 0 of its walk sheet
	// (south-facing idle) and uses Manhattan-1 adjacency for the E-key dialog.
	// ── Sound — synthesized 8-bit beeps via Web Audio, no asset downloads ────────
	const Sound = (window.CAMP_SYSTEMS || {}).Sound;

	// ── Background music ─────────────────────────────────────────────────────────
	// Streams real Pokémon MP3s from archive.org via HTML5 Audio.
	// Falls back to silence gracefully if the network is unavailable.
	// battle keeps the synthesised square-wave loop so it doesn't need a network
	// round-trip when a wild encounter fires mid-session.
	const Music = (window.CAMP_SYSTEMS || {}).Music;

	// ── Stats tracking ───────────────────────────────────────────────────────────
	const STATS_KEY = (window.CAMP_DATA || {}).STATS_KEY;
	const Stats = (window.CAMP_SYSTEMS || {}).Stats;

	// ── Daily login bonus ────────────────────────────────────────────────────────
	const Daily = (window.CAMP_SYSTEMS || {}).Daily;

	function getNpcDialog(npc) {
		if (typeof npc.dialog === 'string') return npc.dialog;
		if (Array.isArray(npc.dialog)) {
			const day = Math.floor(Date.now() / 86400000);
			const hash = (npc.key || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
			return npc.dialog[(day + hash) % npc.dialog.length];
		}
		return '';
	}

	const NPCS = (window.CAMP_DATA || {}).NPCS;

	// ── Map ──────────────────────────────────────────────────────────────────────
	function buildMap() {
		const map = Array.from({ length: MAP_H }, () => new Array(MAP_W).fill(TG));
		function set(r, c, t) { if (r>=0&&r<MAP_H&&c>=0&&c<MAP_W) map[r][c]=t; }
		function fill(r1,c1,r2,c2,t) { for(let r=r1;r<=r2;r++) for(let c=c1;c<=c2;c++) set(r,c,t); }

		let rng=77777;
		function rand(){ rng^=rng<<13;rng^=rng>>17;rng^=rng<<5;return(rng>>>0)/0xFFFFFFFF; }
		for(let r=2;r<MAP_H-2;r++) for(let c=2;c<MAP_W-2;c++) if(rand()<0.09) map[r][c]=TG2;

		for(let c=0;c<MAP_W;c++){set(0,c,TTR);set(1,c,TTR);}
		for(let r=0;r<MAP_H;r++){set(r,0,TTR);set(r,1,TTR);set(r,MAP_W-1,TTR);set(r,MAP_W-2,TTR);}
		for(let c=0;c<MAP_W;c++) if(c<8||c>13){set(MAP_H-1,c,TTR);set(MAP_H-2,c,TTR);}

		[[8,3],[9,4],[10,3],[11,4],[14,3],[15,4],[16,3],[20,3],[21,4],[22,3],[23,4],[26,2],[27,3],
		 [3,19],[4,20],[5,22],[4,24],[5,26],[3,28],[6,18],[7,19]
		].forEach(([r,c])=>set(r,c,TTR));

		[[4,19,TFR],[5,17,TFY],[6,19,TFR],[7,18,TFY],[8,17,TFR],
		 [4,25,TFY],[5,27,TFR],[6,25,TFY],
		 [13,4,TFR],[14,5,TFY],[15,4,TFR],[16,5,TFY],
		 [22,5,TFY],[23,4,TFR],[24,5,TFY],
		].forEach(([r,c,t])=>set(r,c,t));

		for(let c=6;c<=16;c++) set(3,c,TRP);   // ridge row
		fill(4,6,5,16,TR);                       // roof slope (front face)
		for(let c=5;c<=17;c++) set(6,c,TR2);    // eave with 1-tile overhang on each side
		fill(7,6,11,16,TW);
		set(8,8,TWN); set(9,8,TWN);
		set(8,14,TWN); set(9,14,TWN);
		set(11,11,TD);

		fill(3,30,9,36,TH2O);
		[[3,30],[3,36],[9,30],[9,36],[3,31],[9,31],[3,35],[9,35],[4,30],[4,36],[8,30],[8,36]
		].forEach(([r,c])=>set(r,c,TG));

		for(let r=12;r<=MAP_H-1;r++) set(r,11,TP);
		for(let c=11;c<=22;c++) set(20,c,TP);

		for(let c=20;c<=36;c++){set(12,c,TFN);set(27,c,TFN);}
		for(let r=13;r<=26;r++){set(r,20,TFN);set(r,36,TFN);}
		set(20,20,TP); set(20,21,TP);
		fill(13,21,26,35,TSO);
		for(let r=14;r<=26;r+=2) for(let c=21;c<=35;c++) set(r,c,TCR);

		// Signs — keys must match SIGN_MESSAGES coordinates above
		set(12,10,TSG);
		set(19,12,TSG);   // moved off the col-11 walking path
		set(10,30,TSG);   // fishing lake sign
		set(12,4,TSG);

		// Sprinkle autumn-tree variants and bushes for visual variety
		const variant = [[3,17],[5,15],[7,17],[12,2],[19,3],[23,2],[27,5]];
		variant.forEach(([r,c]) => { if (map[r][c] === TTR) map[r][c] = TTR2; });
		const bushes = [[14,8],[16,9],[18,8],[22,9],[24,7],[26,9],[6,20],[5,29],[8,32]];
		bushes.forEach(([r,c]) => { if (map[r][c] === TG || map[r][c] === TG2) map[r][c] = TBSH; });

		// Boulders that can be smashed with Rock Smash
		[[14,2],[24,3],[5,33],[18,36]].forEach(([r,c]) => set(r,c,TBLD));

		// Tall grass patches — wild Pokémon hide here. Two clumps off the main path.
		const tallGrass = [
			[24,5],[24,6],[25,5],[25,6],[26,6],[26,7],
			[15,17],[16,17],[16,18],[17,17],[17,18],[18,18],
		];
		tallGrass.forEach(([r,c]) => { if (map[r][c] === TG || map[r][c] === TG2) map[r][c] = TTG; });

		return map;
	}

	// ── Tile drawing — BW2 Gen 5, TILE=16 ───────────────────────────────────────
	function drawTile(ctx, t, x, y, tick) {
		const d = TILE;
		switch(t) {
			case TG:
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#508028';
				ctx.fillRect(x+2,y+3,1,3); ctx.fillRect(x+9,y+8,1,3); ctx.fillRect(x+13,y+2,1,2);
				ctx.fillStyle='#90C050';
				ctx.fillRect(x+5,y+6,2,1); ctx.fillRect(x+12,y+12,2,1);
				break;
			case TG2:
				ctx.fillStyle='#609030'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#406018';
				ctx.fillRect(x+3,y+4,1,3); ctx.fillRect(x+10,y+9,1,3); ctx.fillRect(x+14,y+1,1,2);
				ctx.fillStyle='#78B040'; ctx.fillRect(x+6,y+7,2,1);
				break;
			case TP: {
				ctx.fillStyle='#B0A470'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#988C5A';
				ctx.fillRect(x,y+5,d,1); ctx.fillRect(x,y+11,d,1);
				ctx.fillRect(x+7,y,1,5); ctx.fillRect(x+7,y+12,1,4);
				ctx.fillRect(x+3,y+6,1,5); ctx.fillRect(x+11,y+6,1,5);
				ctx.fillStyle='#C8BC88';
				ctx.fillRect(x+1,y+1,5,2); ctx.fillRect(x+9,y+1,6,2);
				ctx.fillRect(x+1,y+7,1,2); ctx.fillRect(x+5,y+7,5,2); ctx.fillRect(x+13,y+7,2,2);
				ctx.fillRect(x+2,y+12,4,2); ctx.fillRect(x+9,y+12,5,2);
				break;
			}
			case TRP: {
				// Ridge row — the apex of the pitched roof, slightly receded (back slope)
				ctx.fillStyle='#5C0808'; ctx.fillRect(x,y,d,d);
				// Top edge: dark cap stripe (the actual ridge line, in shadow as it faces away)
				ctx.fillStyle='#2C0404'; ctx.fillRect(x,y+0,d,2);
				// Ridge highlight — thin lit band where light just clips the apex
				ctx.fillStyle='#A82424'; ctx.fillRect(x,y+2,d,1);
				// Back slope shingles (darker than front-slope TR — same shape, less light)
				ctx.fillStyle='#7C1414'; ctx.fillRect(x+0,y+4,8,5); ctx.fillRect(x+8,y+4,8,5);
				ctx.fillStyle='#902020'; ctx.fillRect(x+0,y+3,8,1); ctx.fillRect(x+8,y+3,8,1);
				ctx.fillStyle='#2C0404'; ctx.fillRect(x+7,y+3,1,6);
				ctx.fillStyle='#4C0808'; ctx.fillRect(x+0,y+9,d,1);
				// Second row (offset)
				ctx.fillStyle='#7C1414'; ctx.fillRect(x+0,y+11,4,4); ctx.fillRect(x+4,y+11,8,4); ctx.fillRect(x+12,y+11,4,4);
				ctx.fillStyle='#902020'; ctx.fillRect(x+0,y+10,4,1); ctx.fillRect(x+4,y+10,8,1); ctx.fillRect(x+12,y+10,4,1);
				ctx.fillStyle='#2C0404'; ctx.fillRect(x+3,y+10,1,5); ctx.fillRect(x+11,y+10,1,5);
				ctx.fillStyle='#4C0808'; ctx.fillRect(x+0,y+15,d,1);
				break;
			}
			case TR: {
				// Front-slope shingles — well-lit, top-left bias for dimensionality
				ctx.fillStyle='#9C1C1C'; ctx.fillRect(x,y,d,d);
				// Top row of shingles
				ctx.fillStyle='#C0302C'; ctx.fillRect(x+0,y+1,8,6); ctx.fillRect(x+8,y+1,8,6);
				ctx.fillStyle='#E84838'; ctx.fillRect(x+0,y+0,8,1); ctx.fillRect(x+8,y+0,8,1);  // bright top edge
				ctx.fillStyle='#F46050'; ctx.fillRect(x+0,y+0,4,1); ctx.fillRect(x+8,y+0,4,1);  // left-half extra highlight (light from upper-left)
				ctx.fillStyle='#3C0606'; ctx.fillRect(x+7,y+0,1,8);                              // hard seam between shingles
				ctx.fillStyle='#5C0C0C'; ctx.fillRect(x+0,y+7,16,1);                             // shingle-row shadow
				ctx.fillStyle='#7C1414'; ctx.fillRect(x+13,y+1,3,6);                             // right-side shingle in shadow (light from left)
				ctx.fillStyle='#7C1414'; ctx.fillRect(x+5,y+1,3,6);
				// Bottom row of shingles (offset)
				ctx.fillStyle='#C0302C'; ctx.fillRect(x+0,y+9,4,6); ctx.fillRect(x+4,y+9,8,6); ctx.fillRect(x+12,y+9,4,6);
				ctx.fillStyle='#E84838'; ctx.fillRect(x+0,y+8,4,1); ctx.fillRect(x+4,y+8,8,1); ctx.fillRect(x+12,y+8,4,1);
				ctx.fillStyle='#F46050'; ctx.fillRect(x+0,y+8,2,1); ctx.fillRect(x+4,y+8,4,1); ctx.fillRect(x+12,y+8,2,1);
				ctx.fillStyle='#3C0606'; ctx.fillRect(x+3,y+8,1,8); ctx.fillRect(x+11,y+8,1,8);
				ctx.fillStyle='#5C0C0C'; ctx.fillRect(x+0,y+15,16,1);
				ctx.fillStyle='#7C1414'; ctx.fillRect(x+9,y+9,3,6);
				ctx.fillStyle='#7C1414'; ctx.fillRect(x+1,y+9,3,6);
				break;
			}
			case TR2:
				// Eave — projecting overhang with strong cast shadow below
				ctx.fillStyle='#580808'; ctx.fillRect(x,y,d,d);
				// Roof end shingles (one last lit row before the overhang lip)
				ctx.fillStyle='#9C1C1C'; ctx.fillRect(x,y+0,d,4);
				ctx.fillStyle='#C0302C'; ctx.fillRect(x,y+0,d,3);
				ctx.fillStyle='#E84838'; ctx.fillRect(x,y+0,d,1);
				ctx.fillStyle='#3C0606'; ctx.fillRect(x+7,y+0,1,4);
				// Trim board (the visible front-face of the overhang)
				ctx.fillStyle='#3C0606'; ctx.fillRect(x+0,y+4,d,1);   // top seam where shingles end
				ctx.fillStyle='#7C5028'; ctx.fillRect(x+0,y+5,d,4);   // wooden fascia trim board
				ctx.fillStyle='#9C6838'; ctx.fillRect(x+0,y+5,d,1);   // trim highlight
				ctx.fillStyle='#5C3818'; ctx.fillRect(x+0,y+8,d,1);   // trim bottom edge
				// Cast shadow beneath the overhang (this is what makes the house feel 3D)
				ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(x+0,y+9,d,4);
				ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(x+0,y+13,d,2);
				ctx.fillStyle='rgba(0,0,0,0.2)';  ctx.fillRect(x+0,y+15,d,1);
				break;
			case TW:
				// Wood-plank wall with directional shading (light from top-left)
				ctx.fillStyle='#D0B878'; ctx.fillRect(x,y,d,d);                  // base plank
				ctx.fillStyle='#E0CC8C'; ctx.fillRect(x+0,y+0,d-2,1);             // top-edge highlight
				ctx.fillStyle='#E0CC8C'; ctx.fillRect(x+0,y+6,d-2,1);
				ctx.fillStyle='#E0CC8C'; ctx.fillRect(x+0,y+12,d-2,1);
				ctx.fillStyle='#A88848'; ctx.fillRect(x+0,y+5,d,1);               // plank shadow
				ctx.fillStyle='#A88848'; ctx.fillRect(x+0,y+11,d,1);
				ctx.fillStyle='#8C6C2C'; ctx.fillRect(x+0,y+15,d,1);              // bottom shadow line
				ctx.fillStyle='#A88848'; ctx.fillRect(x+d-1,y+0,1,d);             // right-edge column shadow (cohesive across tiles)
				// Grain specks
				ctx.fillStyle='#B89858';
				ctx.fillRect(x+3,y+2,1,1); ctx.fillRect(x+10,y+3,1,1);
				ctx.fillRect(x+6,y+8,1,1); ctx.fillRect(x+13,y+9,1,1);
				ctx.fillRect(x+2,y+13,1,1); ctx.fillRect(x+9,y+14,1,1);
				break;
			case TWN: {
				// Paned window — wood frame with 2×2 glass and subtle animated glint
				ctx.fillStyle='#D8C088'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#3A1F08'; ctx.fillRect(x+1,y+1,14,14);     // outer frame
				ctx.fillStyle='#5C3818'; ctx.fillRect(x+2,y+2,12,12);     // inner frame
				const gl=Math.sin(tick*0.022+x*0.012)*0.06+0.82;
				ctx.fillStyle=`rgba(120,190,240,${gl})`;
				ctx.fillRect(x+3,y+3,4,4); ctx.fillRect(x+9,y+3,4,4);
				ctx.fillRect(x+3,y+9,4,4); ctx.fillRect(x+9,y+9,4,4);
				ctx.fillStyle='#3A1F08';                                  // mullions (window cross)
				ctx.fillRect(x+7,y+3,1,10); ctx.fillRect(x+3,y+7,10,1);
				ctx.fillStyle='rgba(255,255,255,0.55)';                   // glass highlight
				ctx.fillRect(x+3,y+3,2,1); ctx.fillRect(x+9,y+3,2,1);
				ctx.fillStyle='rgba(255,255,255,0.85)';                   // sparkle
				ctx.fillRect(x+3,y+3,1,1); ctx.fillRect(x+9,y+3,1,1);
				ctx.fillStyle='rgba(0,0,0,0.18)';                         // bottom-right interior shadow
				ctx.fillRect(x+6,y+6,1,1); ctx.fillRect(x+12,y+6,1,1);
				ctx.fillRect(x+6,y+12,1,1); ctx.fillRect(x+12,y+12,1,1);
				break;
			}
			case TD:
				// Paneled door — frame, two recessed panels, brass knob
				ctx.fillStyle='#D8C088'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#2C1804'; ctx.fillRect(x+2,y+0,12,d);      // door outer frame
				ctx.fillStyle='#7C4818'; ctx.fillRect(x+3,y+1,10,15);     // door body
				ctx.fillStyle='#5C3010'; ctx.fillRect(x+3,y+8,10,1);      // mid-rail separator
				ctx.fillStyle='#9C5C24';                                  // panel inset (lighter)
				ctx.fillRect(x+4,y+2,8,5); ctx.fillRect(x+4,y+10,8,5);
				ctx.fillStyle='#5C3010';                                  // panel top shadow
				ctx.fillRect(x+4,y+2,8,1); ctx.fillRect(x+4,y+10,8,1);
				ctx.fillStyle='#5C3010';                                  // panel left shadow
				ctx.fillRect(x+4,y+2,1,5); ctx.fillRect(x+4,y+10,1,5);
				ctx.fillStyle='#B07028';                                  // panel inner highlight
				ctx.fillRect(x+11,y+3,1,4); ctx.fillRect(x+11,y+11,1,4);
				ctx.fillStyle='#FFD038'; ctx.fillRect(x+10,y+8,2,2);      // knob
				ctx.fillStyle='#FFE890'; ctx.fillRect(x+10,y+8,1,1);      // knob highlight
				ctx.fillStyle='#8C5C18'; ctx.fillRect(x+10,y+10,1,1);     // knob shadow
				break;
			case TH2O: {
				const w1=Math.round(Math.sin(tick*0.05+(x+y)*0.04)*1.5);
				const w2=Math.round(Math.sin(tick*0.04+x*0.06)*1);
				ctx.fillStyle='#3858A8'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5070C0';
				ctx.fillRect(x+1,y+w1+2,d-2,2); ctx.fillRect(x+2,y+w1+7,d-4,2); ctx.fillRect(x+1,y+w2+12,d-2,2);
				ctx.fillStyle='#8098D8';
				ctx.fillRect(x+2,y+w1+3,4,1); ctx.fillRect(x+10,y+w1+8,4,1);
				const sp=Math.floor(tick/12)%4;
				ctx.fillStyle='rgba(170,210,255,0.7)';
				if(sp===0) ctx.fillRect(x+6,y+3,3,3);
				else if(sp===1) ctx.fillRect(x+11,y+10,3,3);
				else if(sp===2) ctx.fillRect(x+3,y+10,3,3);
				else ctx.fillRect(x+12,y+3,3,3);
				ctx.fillStyle='rgba(255,255,255,0.65)';
				if(sp===0) ctx.fillRect(x+7,y+4,1,1);
				else if(sp===1) ctx.fillRect(x+12,y+11,1,1);
				else if(sp===2) ctx.fillRect(x+4,y+11,1,1);
				else ctx.fillRect(x+13,y+4,1,1);
				break;
			}
			case TTR: {
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5C3C1C'; ctx.fillRect(x+7,y+12,2,4);
				ctx.fillStyle='#7A5030'; ctx.fillRect(x+7,y+13,2,3);
				ctx.fillStyle='#1A3A0A';
				ctx.fillRect(x+5,y+1,6,1); ctx.fillRect(x+3,y+2,10,1);
				ctx.fillRect(x+2,y+3,12,8);
				ctx.fillRect(x+3,y+11,10,1); ctx.fillRect(x+5,y+12,6,1);
				ctx.fillStyle='#2E600E';
				ctx.fillRect(x+4,y+2,8,1); ctx.fillRect(x+3,y+3,10,8); ctx.fillRect(x+4,y+11,8,1);
				ctx.fillStyle='#487824'; ctx.fillRect(x+4,y+3,7,7);
				ctx.fillStyle='#62A030';
				ctx.fillRect(x+4,y+3,5,4); ctx.fillRect(x+4,y+7,3,2);
				ctx.fillStyle='#9ED860'; ctx.fillRect(x+5,y+4,2,2);
				ctx.fillStyle='#BFF880'; ctx.fillRect(x+5,y+4,1,1);
				break;
			}
			case TFR:
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#3A6818'; ctx.fillRect(x+7,y+10,1,6);
				ctx.fillStyle='#D01818';
				ctx.fillRect(x+5,y+6,5,4); ctx.fillRect(x+6,y+5,3,6);
				ctx.fillStyle='#F8B800'; ctx.fillRect(x+6,y+7,3,2);
				ctx.fillStyle='#FFD838'; ctx.fillRect(x+7,y+7,1,1);
				break;
			case TFY:
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#3A6818'; ctx.fillRect(x+7,y+10,1,6);
				ctx.fillStyle='#E89000';
				ctx.fillRect(x+5,y+6,5,4); ctx.fillRect(x+6,y+5,3,6);
				ctx.fillStyle='#FF7800'; ctx.fillRect(x+6,y+7,3,2);
				ctx.fillStyle='#FFB020'; ctx.fillRect(x+7,y+7,1,1);
				break;
			case TSO:
				ctx.fillStyle='#4A3210'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5A4020'; ctx.fillRect(x+1,y+1,d-2,d-2);
				ctx.fillStyle='#382408'; ctx.fillRect(x,y+5,d,1); ctx.fillRect(x,y+11,d,1);
				ctx.fillStyle='#6A4C28';
				ctx.fillRect(x+1,y+2,d-2,3); ctx.fillRect(x+1,y+6,d-2,5); ctx.fillRect(x+1,y+12,d-2,3);
				break;
			case TCR: {
				ctx.fillStyle='#4A3210'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5A4020'; ctx.fillRect(x+1,y+1,d-2,d-2);
				ctx.fillStyle='#382408'; ctx.fillRect(x,y+5,d,1); ctx.fillRect(x,y+11,d,1);
				const sw=Math.sin(tick*0.06+x*0.08)*0.8;
				[[3,7],[10,6]].forEach(([cx,cy])=>{
					ctx.fillStyle='#204010'; ctx.fillRect(x+cx+sw,y+cy,1,d-cy);
					ctx.fillStyle='#3A7020'; ctx.fillRect(x+cx-1+sw,y+cy,3,4);
					ctx.fillStyle='#58A030'; ctx.fillRect(x+cx+sw,y+cy+1,2,2);
					ctx.fillStyle='#78C050'; ctx.fillRect(x+cx+sw,y+cy+1,1,1);
				});
				break;
			}
			case TFN:
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#8A6030'; ctx.fillRect(x,y+4,d,3); ctx.fillRect(x,y+10,d,3);
				ctx.fillStyle='#6A4820'; ctx.fillRect(x,y+6,d,1); ctx.fillRect(x,y+12,d,1);
				ctx.fillStyle='#B09050'; ctx.fillRect(x,y+4,d,1); ctx.fillRect(x,y+10,d,1);
				ctx.fillStyle='#9A7A38'; ctx.fillRect(x+7,y+1,2,d-2);
				ctx.fillStyle='#B09050'; ctx.fillRect(x+7,y+1,1,d-2);
				ctx.fillStyle='#C8A868'; ctx.fillRect(x+7,y+1,2,1);
				break;
			case TIF: {
				// Interior floor — light wood planks with vertical seams every 8 px
				ctx.fillStyle='#D8B878'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#E8C888'; ctx.fillRect(x+1,y,d-1,1);            // top board edge
				ctx.fillStyle='#B89858'; ctx.fillRect(x,y+15,d,1);             // bottom shadow
				ctx.fillStyle='#A8884C'; ctx.fillRect(x+7,y,1,d);              // plank seam mid
				ctx.fillStyle='#A8884C'; ctx.fillRect(x+15,y,1,d);             // plank seam right
				ctx.fillStyle='#C8A86C';
				ctx.fillRect(x+3,y+4,1,1); ctx.fillRect(x+11,y+9,1,1);
				ctx.fillRect(x+6,y+12,1,1); ctx.fillRect(x+13,y+3,1,1);
				break;
			}
			case TIW: {
				// Interior wall — warm panelled plaster with a wainscot trim line
				ctx.fillStyle='#E8D0A8'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#F4E0B8'; ctx.fillRect(x,y+0,d,1);              // top highlight
				ctx.fillStyle='#C8A878'; ctx.fillRect(x,y+11,d,1);             // wainscot rail
				ctx.fillStyle='#A88858'; ctx.fillRect(x,y+12,d,1);             // wainscot shadow
				ctx.fillStyle='#D8B878'; ctx.fillRect(x,y+13,d,3);             // wainscot panel
				ctx.fillStyle='#A88858'; ctx.fillRect(x,y+15,d,1);             // base shadow
				ctx.fillStyle='#D0B888';
				ctx.fillRect(x+3,y+3,1,1); ctx.fillRect(x+9,y+6,1,1);
				break;
			}
			case TRU: {
				// Decorative rug — soft red with cream border
				ctx.fillStyle='#B83838'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#E0C898'; ctx.fillRect(x,y,d,1); ctx.fillRect(x,y+d-1,d,1);
				ctx.fillStyle='#E0C898'; ctx.fillRect(x,y,1,d); ctx.fillRect(x+d-1,y,1,d);
				ctx.fillStyle='#8C2828'; ctx.fillRect(x+2,y+2,d-4,d-4);
				ctx.fillStyle='#D85050'; ctx.fillRect(x+4,y+4,d-8,d-8);
				ctx.fillStyle='#E0C898'; ctx.fillRect(x+7,y+7,2,2);
				break;
			}
			case TST: {
				// Stairs going up — stepped wood with rising shadow toward the back
				ctx.fillStyle='#D8B878'; ctx.fillRect(x,y,d,d);
				// Four steps, each 4px tall; back step is darkest (most shadow), front is brightest
				const stepShades = ['#583818', '#7C5028', '#A06834', '#C08048'];
				const stepEdges  = ['#3C1F08', '#583018', '#7C4820', '#9C5C28'];
				for (let s = 0; s < 4; s++) {
					const sy = y + s * 4;
					ctx.fillStyle = stepShades[s];
					ctx.fillRect(x, sy, d, 4);
					ctx.fillStyle = stepEdges[s];
					ctx.fillRect(x, sy + 3, d, 1);  // step nosing
					ctx.fillStyle = '#F0D0A0';
					ctx.fillRect(x, sy, d, 1);      // step highlight
				}
				// Side rail shadow on the left
				ctx.fillStyle = 'rgba(0,0,0,0.25)';
				ctx.fillRect(x, y, 2, d);
				break;
			}
			case TSG: {
				// Wooden sign on a post
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);                  // grass base
				ctx.fillStyle='#5C3818'; ctx.fillRect(x+7,y+9,2,7);              // post
				ctx.fillStyle='#8C5828'; ctx.fillRect(x+7,y+9,1,7);              // post highlight
				ctx.fillStyle='#5C3818'; ctx.fillRect(x+1,y+2,14,8);             // sign frame
				ctx.fillStyle='#A86838'; ctx.fillRect(x+2,y+3,12,6);             // sign face
				ctx.fillStyle='#C48848'; ctx.fillRect(x+2,y+3,12,1);             // top highlight
				ctx.fillStyle='#3C1808'; ctx.fillRect(x+2,y+9,12,1);             // bottom shadow
				ctx.fillStyle='#3C1808';
				ctx.fillRect(x+3,y+5,2,1); ctx.fillRect(x+6,y+5,3,1); ctx.fillRect(x+10,y+5,3,1);
				ctx.fillRect(x+3,y+7,4,1); ctx.fillRect(x+8,y+7,2,1); ctx.fillRect(x+11,y+7,2,1);
				break;
			}
			case TTR2: {
				// Alternate tree — autumn / orange leaves variant
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5C3C1C'; ctx.fillRect(x+7,y+12,2,4);
				ctx.fillStyle='#7A5030'; ctx.fillRect(x+7,y+13,2,3);
				ctx.fillStyle='#5C2008';
				ctx.fillRect(x+5,y+1,6,1); ctx.fillRect(x+3,y+2,10,1);
				ctx.fillRect(x+2,y+3,12,8);
				ctx.fillRect(x+3,y+11,10,1); ctx.fillRect(x+5,y+12,6,1);
				ctx.fillStyle='#A04018';
				ctx.fillRect(x+4,y+2,8,1); ctx.fillRect(x+3,y+3,10,8); ctx.fillRect(x+4,y+11,8,1);
				ctx.fillStyle='#D86820'; ctx.fillRect(x+4,y+3,7,7);
				ctx.fillStyle='#F09030';
				ctx.fillRect(x+4,y+3,5,4); ctx.fillRect(x+4,y+7,3,2);
				ctx.fillStyle='#FFC050'; ctx.fillRect(x+5,y+4,2,2);
				ctx.fillStyle='#FFE090'; ctx.fillRect(x+5,y+4,1,1);
				break;
			}
			case TBSH: {
				// Bush — smaller leafy clump, no trunk
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#2E600E';
				ctx.fillRect(x+3,y+5,10,9); ctx.fillRect(x+4,y+4,8,1); ctx.fillRect(x+5,y+14,6,1);
				ctx.fillStyle='#487824';
				ctx.fillRect(x+4,y+5,8,8); ctx.fillRect(x+5,y+13,6,1);
				ctx.fillStyle='#62A030';
				ctx.fillRect(x+4,y+5,5,4); ctx.fillRect(x+4,y+9,3,3);
				ctx.fillStyle='#9ED860'; ctx.fillRect(x+5,y+6,2,2);
				ctx.fillStyle='#BFF880'; ctx.fillRect(x+5,y+6,1,1);
				break;
			}
			case TBED: {
				// Bed — wooden frame with red blanket and white pillow.
				ctx.fillStyle='#D8B878'; ctx.fillRect(x,y,d,d);                       // floor under
				ctx.fillStyle='#5C3010'; ctx.fillRect(x,y+2,d,12);                    // frame
				ctx.fillStyle='#8C5828'; ctx.fillRect(x+1,y+3,d-2,10);                // inner wood
				ctx.fillStyle='#B83838'; ctx.fillRect(x+1,y+5,d-2,7);                 // blanket
				ctx.fillStyle='#E04050'; ctx.fillRect(x+1,y+5,d-2,1);                 // blanket highlight
				ctx.fillStyle='#7C1818'; ctx.fillRect(x+1,y+11,d-2,1);                // blanket shadow
				ctx.fillStyle='#F0E8C0'; ctx.fillRect(x+2,y+4,5,3);                   // pillow
				ctx.fillStyle='#FFFFFF'; ctx.fillRect(x+2,y+4,5,1);                   // pillow highlight
				ctx.fillStyle='#3C1F08'; ctx.fillRect(x,y+13,d,1);                    // base shadow
				break;
			}
			case TBKS: {
				// Bookshelf — wooden cabinet with colored book spines.
				ctx.fillStyle='#D8B878'; ctx.fillRect(x,y,d,d);                       // floor under
				ctx.fillStyle='#3C1F08'; ctx.fillRect(x,y,d,d);                       // shelf body
				ctx.fillStyle='#5C3010'; ctx.fillRect(x+1,y+1,d-2,d-2);               // shelf inner
				// Two rows of book spines
				ctx.fillStyle='#C03838'; ctx.fillRect(x+2,y+2,2,5);
				ctx.fillStyle='#3858A8'; ctx.fillRect(x+4,y+2,2,5);
				ctx.fillStyle='#2E8050'; ctx.fillRect(x+6,y+3,2,4);
				ctx.fillStyle='#D89050'; ctx.fillRect(x+8,y+2,2,5);
				ctx.fillStyle='#9C50C8'; ctx.fillRect(x+10,y+3,2,4);
				ctx.fillStyle='#3C1F08'; ctx.fillRect(x,y+7,d,1);                     // shelf divider
				ctx.fillStyle='#D08838'; ctx.fillRect(x+2,y+9,2,4);
				ctx.fillStyle='#3858A8'; ctx.fillRect(x+4,y+9,2,4);
				ctx.fillStyle='#7C1818'; ctx.fillRect(x+6,y+10,2,3);
				ctx.fillStyle='#2E8050'; ctx.fillRect(x+8,y+9,2,4);
				ctx.fillStyle='#C03838'; ctx.fillRect(x+10,y+10,2,3);
				break;
			}
			case TTG: {
				// Tall grass — distinctly darker green with vertical blade pattern.
				// Walking onto this tile rolls for a wild encounter.
				ctx.fillStyle='#3C6018'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#2A4810'; ctx.fillRect(x,y+12,d,4);
				ctx.fillStyle='#4F7C28';
				ctx.fillRect(x+1,y+3,1,10); ctx.fillRect(x+4,y+1,1,12);
				ctx.fillRect(x+7,y+4,1,9);  ctx.fillRect(x+10,y+2,1,11);
				ctx.fillRect(x+13,y+5,1,8);
				ctx.fillStyle='#6CA038';
				ctx.fillRect(x+2,y+5,1,7); ctx.fillRect(x+5,y+3,1,9);
				ctx.fillRect(x+8,y+6,1,6); ctx.fillRect(x+11,y+4,1,8);
				ctx.fillRect(x+14,y+7,1,5);
				ctx.fillStyle='#92C858';
				ctx.fillRect(x+5,y+3,1,1); ctx.fillRect(x+11,y+4,1,1);
				break;
			}
			case TBLD:
				ctx.fillStyle='#8A8888'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#A8A6A6'; ctx.fillRect(x+1,y+1,d-2,d-2);
				ctx.fillStyle='#C0BEBE'; ctx.fillRect(x+2,y+2,6,5);
				ctx.fillStyle='#686666'; ctx.fillRect(x,y+d-3,d,3);
				ctx.fillStyle='#787676'; ctx.fillRect(x+d-3,y,3,d);
				ctx.fillStyle='#FFFFFF'; ctx.fillRect(x+3,y+3,2,2);
				break;
			default:
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
		}
	}

	// Applies the chosen accent colour as a CSS custom property on #campWrap
	// so the location badge, prompt border, and other chrome inherit it live.
	function applyCampAccent(accentKey) {
		const hex = ACCENT_HEX[accentKey] || ACCENT_HEX.default;
		const wrap = document.getElementById('campWrap');
		if (wrap) wrap.style.setProperty('--camp-accent', hex);
	}

	function applyWrapTop() {
		const header = document.querySelector('.site-header');
		const wrap = document.getElementById('campWrap');
		if (!wrap) return;
		const hh = header ? Math.ceil(header.getBoundingClientRect().bottom) : 0;
		wrap.style.top = hh + 'px';
	}

	// ── Dialog UI (shared between scenes) ─────────────────────────────────────────
	const Dialog = (window.CAMP_SYSTEMS || {}).Dialog;

	// ── Touch action flags ────────────────────────────────────────────────────────
	// On-screen buttons set these; each scene's update() consumes them once so
	// they behave like a keyboard JustDown (fire once per tap, not every frame).
	const TouchActions = (window.CAMP_SYSTEMS || {}).TouchActions;

	// Exposed by setupPauseMenu so the touch ≡ button can open/close the panel.
	let _pauseToggleFn = null;

	// Phaser calls preventDefault() on every key registered via addKeys(), which
	// blocks typing those letters (W/A/S/D/E/P/F…) into HTML inputs.  When any
	// <input> or <textarea> gains focus we pause Phaser's global key capture so
	// the browser can deliver the characters normally; restore it on blur.
	let _sceneKeyboard = null;
	document.addEventListener('focusin', (e) => {
		if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
			_sceneKeyboard?.disableGlobalCapture();
		}
	});
	document.addEventListener('focusout', (e) => {
		if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
			_sceneKeyboard?.enableGlobalCapture();
		}
	});

	// Wire on-screen action buttons → TouchActions flags.
	function setupTouchPad() {
		[['capInteract','interact'],['capPartner','partner'],['capFaceoff','faceoff']].forEach(([id, action]) => {
			document.getElementById(id)?.addEventListener('pointerdown', (e) => {
				e.preventDefault();
				TouchActions.fire(action);
			});
		});
		document.getElementById('capMenu')?.addEventListener('pointerdown', (e) => {
			e.preventDefault();
			_pauseToggleFn?.();
		});
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupTouchPad);
	else setupTouchPad();

	// ── Pause menu (shared) ───────────────────────────────────────────────────────
	function setupPauseMenu(game) {
		const panel = document.getElementById('campPause');
		const resumeBtn = document.getElementById('campPauseResume');
		if (!panel || !resumeBtn || panel.dataset.wired) return;
		panel.dataset.wired = '1';

		// Track which scenes we paused so close() can resume them even though
		// Phaser's getScenes(true) excludes paused scenes.
		let _pausedKeys = [];
		const close = () => {
			panel.hidden = true;
			_pausedKeys.forEach(key => game.scene.resume(key));
			_pausedKeys = [];
		};
		const open = () => {
			panel.hidden = false;
			const active = game.scene.getScenes(true);
			_pausedKeys = active.map(s => s.scene.key);
			_pausedKeys.forEach(key => game.scene.pause(key));
			// Refresh save timestamp each time the menu opens.
			const saveTimeEl = document.getElementById('campPauseSaveTime');
			if (saveTimeEl) {
				try {
					const ts = localStorage.getItem(SAVE_KEY);
					saveTimeEl.textContent = ts
						? 'Last saved: ' + new Date(Number(ts)).toLocaleTimeString()
						: 'Not saved yet';
				} catch { saveTimeEl.textContent = ''; }
			}
			// Sync music button label.
			const musicBtn = document.getElementById('campPauseMusic');
			if (musicBtn) musicBtn.innerHTML = ico(ICO.music) + ' Music: ' + (Music.isEnabled() ? 'On' : 'Off');
		};

		resumeBtn.addEventListener('click', close);
		_pauseToggleFn = () => { panel.hidden ? open() : close(); };

		// Save button — writes the current timestamp to localStorage.
		const saveBtn = document.getElementById('campPauseSave');
		if (saveBtn) {
			saveBtn.addEventListener('click', () => {
				try { localStorage.setItem(SAVE_KEY, String(Date.now())); } catch {}
				const saveTimeEl = document.getElementById('campPauseSaveTime');
				if (saveTimeEl) saveTimeEl.textContent = 'Saved at ' + new Date().toLocaleTimeString();
				Sound.chime();
			});
		}

		// Music toggle.
		const musicBtn = document.getElementById('campPauseMusic');
		if (musicBtn) {
			// Sync initial label with saved preference (HTML default is "On").
			musicBtn.innerHTML = ico(ICO.music) + ' Music: ' + (Music.isEnabled() ? 'On' : 'Off');
			musicBtn.addEventListener('click', () => {
				const next = !Music.isEnabled();
				Music.setEnabled(next);
				if (next) {
					// getScenes(true) only returns running scenes, but all scenes are paused
					// while the pause menu is open. Use _pausedKeys[0] instead.
					const sceneKey = _pausedKeys[0];
					if (sceneKey && ['camp', 'house', 'upstairs'].includes(sceneKey)) Music.start(sceneKey);
				}
				musicBtn.innerHTML = ico(ICO.music) + ' Music: ' + (next ? 'On' : 'Off');
			});
		}

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				if (Dialog.isOpen()) { Dialog.close(); return; }
				panel.hidden ? open() : close();
			}
		});
	}

	// ── Mini-map palette — one swatch per tile type ───────────────────────────────
	function miniMapColor(t) {
		switch (t) {
			case TG: case TG2: case TFR: case TFY: return '#78A840';
			case TP: return '#B0A470';
			case TW: return '#D8C088';
			case TR: case TR2: case TRP: return '#9C1C1C';
			case TWN: return '#5070C0';
			case TD: return '#7C4818';
			case TH2O: return '#3858A8';
			case TTR: return '#1A3A0A';
			case TTR2: return '#A04018';
			case TBSH: return '#2E600E';
			case TSO: case TCR: return '#5A4020';
			case TFN: return '#8A6030';
			case TSG: return '#C48848';
			case TBLD: return '#888888';
			default: return '#101020';
		}
	}

	// ── Debug HUD ─────────────────────────────────────────────────────────────────
	// Always-on on-screen state dump for chasing scene-transition bugs. Toggle off
	// with the backtick key (`) when no longer needed.
	const Debug = {
		on: true,
		el: null,
		lastError: '',
		ensure() {
			if (this.el) return this.el;
			const div = document.createElement('div');
			div.id = 'campDebugHud';
			div.style.cssText = 'position:absolute;left:14px;top:60px;padding:8px 12px;background:rgba(0,0,0,0.85);color:#7fffa0;font:11px/1.5 ui-monospace,monospace;border:1px solid #295;border-radius:6px;z-index:30;pointer-events:none;white-space:pre;';
			document.getElementById('campWrap')?.appendChild(div);
			this.el = div;
			return div;
		},
		toggle() {
			this.ensure();
			this.on = !this.on;
			this.el.style.display = this.on ? 'block' : 'none';
		},
		render(text) {
			if (!this.on) return;
			this.ensure();
			this.el.textContent = text;
		},
	};
	// Backtick (`) toggles the HUD off/on. F8 also works on systems where it's
	// not bound to media keys.
	document.addEventListener('keydown', (e) => {
		if (e.key === '`' || e.key === 'F8') { e.preventDefault(); Debug.toggle(); }
	});

	// Scene transitions use a hard page reload with a URL hash. Phaser's
	// scene.start / manager.start were silently failing to fully shut down
	// the current scene in this project, leaving two scenes ticking together
	// and the player wedged. Reloading guarantees a clean state and the hash
	// is read on boot to start the right scene with the right spawn point.
	function safeSceneStart(scene, key, data) {
		try { Dialog.close(); } catch (_) {}
		try { Sound.door(); } catch (_) {}
		const from = (data && data.from) || '';
		console.log('[scene] reload →', key, 'from', from);
		// Trigger the black fade-in so the screen stays dark through the reload.
		const fade = document.getElementById('campFade');
		if (fade) fade.classList.remove('is-hidden');
		// Wait for the 350ms fade transition to fully complete before reloading.
		setTimeout(() => {
			window.location.hash = '#' + key + (from ? '|' + from : '');
			window.location.reload();
		}, 400);
	}

	// Read the hash on boot to figure out which scene to start. Captured once at
	// start() so we can clear the hash immediately and the result is still
	// available when each scene's init() runs on the first game step.
	let _bootData = { scene: 'camp', from: '' };
	function readBootHash() {
		const raw = (window.location.hash || '').replace(/^#/, '');
		if (!raw) return { scene: 'camp', from: '' };
		const [scene, from] = raw.split('|');
		return { scene: scene || 'camp', from: from || '' };
	}
	function consumeBootFrom(sceneKey) {
		// Only return boot 'from' once, and only if it matches the scene asking.
		if (_bootData && _bootData.scene === sceneKey && _bootData.from) {
			const from = _bootData.from;
			_bootData = { scene: 'camp', from: '' };
			return from;
		}
		return '';
	}

	// ── Day/night tint ────────────────────────────────────────────────────────────
	// Six-minute full cycle: 0..120s day, 120..180s sunset, 180..240s night,
	// 240..300s dawn, 300..360s back to day. Driven by performance.now mod cycle.
	function applyDayNight() {
		const tint = document.getElementById('campTint');
		if (!tint) return;
		const cycleSec = 360;
		const t = (performance.now() / 1000) % cycleSec;
		let alpha = 0;
		let color = '#0a1a40';
		if (t < 120) { alpha = 0; }
		else if (t < 180) { alpha = (t - 120) / 60 * 0.55; color = '#3a1a20'; }
		else if (t < 240) { alpha = 0.55; color = '#0a1430'; }
		else if (t < 300) { alpha = (1 - (t - 240) / 60) * 0.55; color = '#3a1a20'; }
		else { alpha = 0; }
		tint.style.opacity = alpha.toFixed(3);
		tint.style.background = color;
	}

	function updateDayNightTint() {
		const tint = document.getElementById('campTint');
		if (!tint) return;
		const h = new Date().getHours() + new Date().getMinutes() / 60;
		let opacity = 0;
		if (h >= 20 || h < 5)        opacity = 0.45;
		else if (h >= 18 && h < 20)  opacity = 0.45 * ((h - 18) / 2);
		else if (h >= 5  && h < 7)   opacity = 0.35 * (1 - (h - 5) / 2);
		tint.style.opacity = opacity.toFixed(3);
		tint.style.background = (opacity > 0.2) ? '#0a0820' : '#000';
		const isNight = h >= 20 || h < 6;
		window.__isNight = isNight;
		if (isNight) Achievements.unlock('nightOwl');
	}

	// ── House interior map ───────────────────────────────────────────────────────
	// 16 wide × 12 tall — wainscot walls, wood floor, rug accent, exit door at south,
	// stairs tucked into the north-east corner.
	const HOUSE_W = 16;
	const HOUSE_H = 12;
	const HOUSE_DOOR_C = 8;
	const HOUSE_DOOR_R = HOUSE_H - 1;
	function buildHouseMap() {
		const map = Array.from({ length: HOUSE_H }, () => new Array(HOUSE_W).fill(TIF));
		for (let c = 0; c < HOUSE_W; c++) { map[0][c] = TIW; map[HOUSE_H - 1][c] = TIW; }
		for (let r = 0; r < HOUSE_H; r++) { map[r][0] = TIW; map[r][HOUSE_W - 1] = TIW; }
		map[HOUSE_DOOR_R][HOUSE_DOOR_C] = TD;
		// 2×2 rug roughly centered
		map[6][7] = TRU; map[6][8] = TRU;
		map[7][7] = TRU; map[7][8] = TRU;
		// Stairs in the north-east corner, two tiles wide
		map[1][12] = TST; map[1][13] = TST;
		map[2][12] = TST; map[2][13] = TST;
		return map;
	}
	// Coordinates used by both HouseScene (for from-upstairs spawn) and
	// UpstairsScene (for stairs-down tile and player spawn).
	const HOUSE_STAIRS_C = 12;   // landing tile when descending
	const HOUSE_STAIRS_R = 3;    // one south of the stairs block

	// ── Upstairs interior map ────────────────────────────────────────────────────
	// 12 wide × 9 tall — cozy bedroom: wainscot walls, wood floor, bed in the
	// north-east, bookshelf along the north wall, rug accent, stairs-down at south.
	const UPSTAIRS_W = 12;
	const UPSTAIRS_H = 9;
	const UPSTAIRS_STAIRS_C = 2;
	const UPSTAIRS_STAIRS_R = UPSTAIRS_H - 2;
	function buildUpstairsMap() {
		const map = Array.from({ length: UPSTAIRS_H }, () => new Array(UPSTAIRS_W).fill(TIF));
		for (let c = 0; c < UPSTAIRS_W; c++) { map[0][c] = TIW; map[UPSTAIRS_H - 1][c] = TIW; }
		for (let r = 0; r < UPSTAIRS_H; r++) { map[r][0] = TIW; map[r][UPSTAIRS_W - 1] = TIW; }
		// Stairs going back down — two tiles wide at south-west.
		map[UPSTAIRS_STAIRS_R][UPSTAIRS_STAIRS_C]     = TST;
		map[UPSTAIRS_STAIRS_R][UPSTAIRS_STAIRS_C + 1] = TST;
		// Bed in the north-east corner (2 tiles wide).
		map[1][UPSTAIRS_W - 3] = TBED; map[1][UPSTAIRS_W - 2] = TBED;
		// Bookshelves along the north wall.
		map[1][3] = TBKS; map[1][4] = TBKS; map[1][5] = TBKS;
		// Rug accent in the middle.
		map[4][5] = TRU; map[4][6] = TRU;
		map[5][5] = TRU; map[5][6] = TRU;
		return map;
	}

	// ── Market Centre outdoor map ────────────────────────────────────────────────
	// 30 wide × 22 tall — open-air plaza in the same pixel style as the camp:
	// grass surround, tree border with a north-edge gap (mirroring camp's south
	// exit), cobblestone paths, flower beds, a small fountain pond, and four
	// vendor NPCs spread around the plaza, each selling a different category.
	const MARKET_W = 50;
	const MARKET_H = 28;
	// North-edge column where the player walks in/out of the market. Lines up
	// with camp's south-exit col (11) only conceptually — the actual transition
	// snaps the player to whichever spawn point each scene uses, so they don't
	// need to match numerically.
	const MARKET_NORTH_C = 15;
	// Vendor NPCs — each has a sprite species, a position, and a shopKind that
	// selects which inventory list opens when the player presses E on them.
	const MARKET_NPCS = (window.CAMP_DATA || {}).MARKET_NPCS;

	function getSeasonalItems() {
		const month = new Date().getMonth(); // 0-11
		if (month >= 2 && month <= 4) return [ // Spring: Mar-May
			{ label: ico(ICO.sparkle) + ' Sakura Bundle', cost: 12, action: 'cafeBuy', gives: 'berry', amount: 4 },
		];
		if (month >= 5 && month <= 7) return [ // Summer: Jun-Aug
			{ label: ico(ICO.sun) + ' Summer Seed Pack', cost: 8, action: 'cafeBuy', gives: 'seed', amount: 3 },
		];
		if (month >= 8 && month <= 10) return [ // Autumn: Sep-Nov
			{ label: ico(ICO.tree) + ' Harvest Basket', cost: 10, action: 'cafeBuy', gives: 'berry', amount: 6 },
		];
		return [ // Winter: Dec-Feb
			{ label: ico(ICO.snow) + ' Warm Brew', cost: 6, action: 'cafeBuy', gives: 'berry', amount: 2 },
		];
	}

	// Per-vendor inventories. Action strings map to handlers in MarketShop.
	const MARKET_SHOPS = {
		general: {
			title: "Pikachu's Mart",
			items: [
				{ label: ico(ICO.seed) + ' Berry Seed',         cost: 5,  action: 'buySeed' },
				{ label: ico(ICO.berry) + ' Sell 1 Berry',       sells: 10, action: 'sellBerry' },
				{ label: ico(ICO.berry) + ' Sell All Berries',   sells: 10, action: 'sellAllBerries' },
			],
		},
		berries: {
			title: 'Berry Stand',
			items: [
				{ label: ico(ICO.berry) + ' Sell 1 Berry',     sells: 10, action: 'sellBerry' },
				{ label: ico(ICO.berry) + ' Sell All Berries', sells: 10, action: 'sellAllBerries' },
				{ label: ico(ICO.seed) + ' Berry Seed',       cost: 5,  action: 'buySeed' },
			],
		},
		cosmetics: {
			title: 'Vaporeon Boutique',
			items: [
				{ label: ico(ICO.sparkle) + ' Sakura Wallpaper',  cost: 15, action: 'buyWallpaper', key: 'sakura'  },
				{ label: ico(ICO.water) + ' Ocean Wallpaper',   cost: 15, action: 'buyWallpaper', key: 'ocean'   },
				{ label: ico(ICO.tree) + ' Forest Wallpaper',  cost: 15, action: 'buyWallpaper', key: 'forest'  },
				{ label: ico(ICO.star) + ' Dusk Wallpaper',    cost: 15, action: 'buyWallpaper', key: 'dusk'    },
				{ label: ico('circle-fill') + ' Red Accent',        cost: 20, action: 'buyAccent',    key: 'red'    },
				{ label: ico('circle-fill') + ' Blue Accent',       cost: 20, action: 'buyAccent',    key: 'blue'   },
				{ label: ico('circle-fill') + ' Green Accent',      cost: 20, action: 'buyAccent',    key: 'green'  },
			],
		},
		stones: {
			title: 'Umbreon Stone Vendor',
			items: [
				{ label: ico(ICO.fire) + ' Fire Stone',    cost: 50, action: 'buyStone', key: 'fire'    },
				{ label: ico(ICO.bolt) + ' Thunder Stone', cost: 50, action: 'buyStone', key: 'thunder' },
				{ label: ico(ICO.tree) + ' Leaf Stone',    cost: 50, action: 'buyStone', key: 'leaf'    },
				{ label: ico(ICO.snow) + ' Ice Stone',     cost: 50, action: 'buyStone', key: 'ice'     },
				{ label: ico(ICO.gem) + ' Shiny Stone',   cost: 50, action: 'buyStone', key: 'shiny'   },
			],
		},
		pokecenter: {
			title: "Pokémon Center",
			items: [
				{ label: ico(ICO.heal) + ' Heal Partner Pokémon', cost: 0, action: 'healPokemon' },
				{ label: ico(ICO.berry) + ' Complimentary Berry',  cost: 0, action: 'freeBerry'   },
			],
		},
		cafe: {
			title: "Jolteon's Café",
			items: [
				{ label: ico(ICO.curry) + ' Espresso Shot',    cost: 8,  action: 'cafeBuy', gives: 'seed',     amount: 1 },
				{ label: ico(ICO.berry) + ' Bubble Tea',       cost: 10, action: 'cafeBuy', gives: 'berry',    amount: 3 },
				{ label: ico(ICO.berry) + ' Berry Cake',       cost: 15, action: 'cafeBuy', gives: 'berry',    amount: 5 },
				{ label: ico(ICO.seed) + ' Herbal Tea',       cost: 18, action: 'cafeBuy', gives: 'seed',     amount: 2 },
				{ label: ico(ICO.berry) + ' Croissant',        cost: 5,  action: 'cafeBuy', gives: 'berry',    amount: 2 },
				{ label: ico(ICO.token) + ' Choco Bar',        cost: 12, action: 'cafeBuy', gives: 'tokens',   amount: 8 },
				{ label: ico(ICO.egg) + ' Pokémon Egg',      cost: 40, action: 'buyEgg' },
			],
		},
	};
	// Sign text shown when standing next to each market sign tile.
	const SIGN_MESSAGES_MARKET = (window.CAMP_DATA || {}).SIGN_MESSAGES_MARKET;
	function buildMarketMap() {
		const map = Array.from({ length: MARKET_H }, () => new Array(MARKET_W).fill(TG));
		const set = (r, c, t) => { if (r>=0 && r<MARKET_H && c>=0 && c<MARKET_W) map[r][c] = t; };
		const fill = (r1, c1, r2, c2, t) => { for (let r=r1;r<=r2;r++) for (let c=c1;c<=c2;c++) set(r,c,t); };

		// Sprinkle grass variants for that BW2 organic look (same density as camp).
		let rng = 31415;
		const rand = () => { rng^=rng<<13; rng^=rng>>17; rng^=rng<<5; return (rng>>>0)/0xFFFFFFFF; };
		for (let r=2;r<MARKET_H-2;r++) for (let c=2;c<MARKET_W-2;c++) {
			if (rand() < 0.10) map[r][c] = TG2;
		}

		// Tree border around the edges — leaves a 3-tile gap at the north for the
		// road back to camp.
		for (let c=0;c<MARKET_W;c++){ set(0,c,TTR); set(1,c,TTR); set(MARKET_H-1,c,TTR); set(MARKET_H-2,c,TTR); }
		for (let r=0;r<MARKET_H;r++){ set(r,0,TTR); set(r,1,TTR); set(r,MARKET_W-1,TTR); set(r,MARKET_W-2,TTR); }
		for (let c = MARKET_NORTH_C - 1; c <= MARKET_NORTH_C + 1; c++) { set(0,c,TG); set(1,c,TG); }

		// Vertical road from the north entry into the plaza
		for (let r=0;r<=MARKET_H-5;r++) set(r, MARKET_NORTH_C, TP);
		// East-west cross path through the plaza
		for (let c=5;c<=MARKET_W-6;c++) set(11, c, TP);

		// Cobblestone pads in front of each vendor stall
		const stallPads = [
			[6, 5, 8, 9],    // pikachu (NW)
			[6, 20, 8, 24],  // bulbasaur (NE)
			[13, 5, 15, 9],  // vaporeon (SW)
			[13, 20, 15, 24],// umbreon (SE)
		];
		stallPads.forEach(([r1,c1,r2,c2]) => fill(r1,c1,r2,c2,TP));

		// 3-wide TBKS counter behind each vendor (gives a stall silhouette)
		const counters = [
			[5,6,5,8],   // pikachu
			[5,21,5,23], // bulbasaur
			[12,6,12,8], // vaporeon
			[12,21,12,23],// umbreon
		];
		counters.forEach(([r1,c1,r2,c2]) => fill(r1,c1,r2,c2,TBKS));

		// Decorative flower beds
		[
			[4,4,TFR],[4,5,TFY],[4,10,TFR],[4,11,TFY],
			[4,24,TFR],[4,25,TFY],[10,4,TFY],[10,25,TFR],
			[16,4,TFR],[16,25,TFY],[18,12,TFR],[18,17,TFY],
		].forEach(([r,c,t]) => { if (map[r][c] === TG || map[r][c] === TG2) set(r,c,t); });

		// Bushes for texture
		[[3,10],[3,20],[10,15],[16,8],[16,22],[18,4],[18,25]].forEach(([r,c]) => {
			if (map[r][c] === TG || map[r][c] === TG2) set(r,c,TBSH);
		});

		// Cobblestone feature plaza bottom-center
		fill(17, 13, 18, 16, TP);

		// Extra bottom-area decorations in the new rows (19–25)
		[[19,5,TBSH],[19,10,TBSH],[19,20,TBSH],[19,25,TBSH]].forEach(([r,c,t]) => set(r,c,t));
		[[20,7,TFR],[20,9,TFY],[20,21,TFR],[20,23,TFY]].forEach(([r,c,t]) => set(r,c,t));
		fill(22, 13, 23, 16, TP); // second cobblestone plaza at the south end
		[[21,12,TFY],[21,17,TFR],[24,12,TFR],[24,17,TFY]].forEach(([r,c,t]) => set(r,c,t));
		[[23,4,TBSH],[23,25,TBSH]].forEach(([r,c,t]) => set(r,c,t));

		// Signs in front of each stall — text comes from SIGN_MESSAGES_MARKET
		[[9,7],[9,22],[16,7],[16,22]].forEach(([r,c]) => set(r,c,TSG));

		// ── Pokémon Center (cols 30–37, rows 3–9) ─────────────────────────────
		// Interior floor first — walls are stamped on top so they win
		fill(3, 30, 9, 37, TIF);
		// Outer walls (overwrite floor edges)
		fill(3, 30, 3, 37, TIW);              // top wall
		fill(3, 30, 9, 30, TIW);              // left wall
		fill(3, 37, 9, 37, TIW);              // right wall
		fill(9, 30, 9, 32, TIW);              // south wall left of entrance
		fill(9, 35, 9, 37, TIW);              // south wall right of entrance
		// Reception counter
		fill(4, 31, 4, 36, TBKS);
		// Healing rug (centre of room)
		fill(6, 33, 7, 34, TRU);
		// Entrance corridor from south wall down to main path
		fill(9, 33, 10, 34, TP);
		// Decorative flowers flanking the entrance
		set(2, 30, TFR); set(2, 37, TFY);
		set(3, 29, TFY); set(3, 38, TFR);
		// Sign south of entrance (on the grass, reachable from the main path)
		set(10, 31, TSG);

		// ── Big Café (cols 40–47, rows 3–24) ──────────────────────────────────
		// Floor — fill the whole interior first
		fill(3, 40, 24, 47, TIF);
		// Outer walls (solid TIW), leaving row 11 col 40 open as the entrance
		fill(3, 40, 3, 47, TIW);              // top wall
		for (let r = 4; r <= 24; r++) { if (r !== 11) set(r, 40, TIW); } // left wall, gap at row 11
		fill(4, 47, 24, 47, TIW);             // right wall
		fill(24, 41, 24, 46, TIW);            // bottom wall
		// Service counter (top of dining room, row 4)
		fill(4, 41, 4, 46, TBKS);
		// Seating rugs — three rows of tables
		fill(8,  41, 9,  44, TRU);
		fill(12, 41, 13, 44, TRU);
		fill(15, 41, 16, 44, TRU);
		fill(19, 41, 20, 44, TRU);
		fill(22, 41, 23, 44, TRU);
		// Potted plants between seating sections
		set(10, 41, TFR); set(10, 44, TFY);
		set(14, 41, TFY); set(14, 44, TFR);
		set(17, 41, TFR); set(17, 44, TFY);
		set(21, 41, TFY); set(21, 44, TFR);
		// Windows: small flower accents on the right wall side
		set(7,  46, TFY); set(10, 46, TFR); set(13, 46, TFY);
		set(16, 46, TFR); set(19, 46, TFY); set(22, 46, TFR);
		// Sign just outside the café entrance on the south side of the path
		set(12, 39, TSG);

		return map;
	}

	const Fishing = (() => {
		let isOpen = false;
		function ensurePanel() {
			if (document.getElementById('fishingPanel')) return;
			const p = document.createElement('div');
			p.id = 'fishingPanel';
			p.hidden = true;
			p.className = 'pk-backdrop';
			const inner = document.createElement('div');
			inner.className = 'pk-modal pk-modal-sm';
			inner.style.textAlign = 'center';
			inner.innerHTML = '<div class="pk-modal-head"><span class="pk-modal-title">' + ico(ICO.fish) + ' FISHING</span></div>' +
				'<div class="pk-modal-body">' +
				'<div id="fishStatus" style="font-size:9px;color:var(--pk-muted);margin-bottom:16px;min-height:18px">Walk up to the water and cast your line…</div>' +
				'<div id="fishBar" style="position:relative;height:28px;background:rgba(10,30,60,0.8);border-radius:8px;margin:0 auto 14px;width:220px;overflow:hidden;border:1px solid rgba(74,158,204,0.3)">' +
					'<div id="fishZone" style="position:absolute;top:0;height:100%;background:rgba(64,200,112,0.35);width:30%;left:35%"></div>' +
					'<div id="fishCursor" style="position:absolute;top:0;height:100%;width:6px;background:var(--pk-gold);border-radius:3px;left:0%;box-shadow:0 0 6px rgba(246,200,76,0.6)"></div>' +
				'</div>' +
				'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">' +
					'<button id="fishCast" class="pk-btn pk-btn-blue pk-btn-sm" type="button">Cast</button>' +
					'<button id="fishLogBtn" class="pk-btn pk-btn-ghost pk-btn-xs" type="button">' + ico(ICO.book) + ' Log</button>' +
				'</div>' +
				'<div id="fishLog" style="display:none;margin-top:12px;text-align:left;font-size:7px;color:var(--pk-muted);max-height:100px;overflow-y:auto;padding:4px 8px;background:rgba(0,0,0,0.2);border-radius:6px"></div>' +
				'<button id="fishClose" class="pk-btn pk-btn-ghost pk-btn-xs" style="display:block;margin:12px auto 0" type="button">Leave</button>' +
				'</div>';
			p.appendChild(inner);
			inner.addEventListener('pointerdown', e => e.stopPropagation());
			document.body.appendChild(p);
			document.getElementById('fishClose').addEventListener('click', close);
			document.getElementById('fishCast').addEventListener('click', () => {
				if (phase === 'running') reel(); else cast();
			});
			document.getElementById('fishLogBtn').addEventListener('click', () => {
				const logEl = document.getElementById('fishLog');
				if (!logEl) return;
				if (logEl.style.display === 'none') {
					logEl.style.display = 'block';
					const fishLog = Inventory.load().fishLog || [];
					if (fishLog.length === 0) { logEl.textContent = 'No catches yet!'; }
					else {
						logEl.innerHTML = fishLog.map(f => '<div style="padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.08)">' + ico(ICO[f.icoKey]||ICO.fish) + ' ' + f.name + ' <span style="color:#8888aa;font-size:6px">(' + new Date(f.ts).toLocaleDateString() + ')</span></div>').join('');
					}
				} else {
					logEl.style.display = 'none';
				}
			});
		}
		let raf = null, pos = 0, dir = 1, phase = 'idle';
		function cast() {
			phase = 'running';
			pos = 0; dir = 1;
			const cursor = document.getElementById('fishCursor');
			const castBtn = document.getElementById('fishCast');
			const status = document.getElementById('fishStatus');
			const hasBait = (Inventory.load().fishingBait || 0) > 0;
			const ppCast = typeof getPartnerPassive === 'function' ? getPartnerPassive() : { fishingBonus: false, tutorFishBonus: false };
			const zone = document.getElementById('fishZone');
			if (zone) {
				if (ppCast.fishingBonus || ppCast.tutorFishBonus) { zone.style.width = '50%'; zone.style.left = '25%'; }
				else if (hasBait) { zone.style.width = '42%'; zone.style.left = '29%'; }
				else { zone.style.width = '30%'; zone.style.left = '35%'; }
			}
			if (castBtn) castBtn.textContent = 'Reel!';
			if (status) status.textContent = 'Tap Reel when in the green zone!';
			const SPEED = 1.8;
			const tick = () => {
				pos += dir * SPEED;
				if (pos >= 100) { pos = 100; dir = -1; }
				if (pos <= 0) { pos = 0; dir = 1; }
				if (cursor) cursor.style.left = pos + '%';
				raf = requestAnimationFrame(tick);
			};
			tick();
		}
		function reel() {
			if (raf) { cancelAnimationFrame(raf); raf = null; }
			const status = document.getElementById('fishStatus');
			const castBtn = document.getElementById('fishCast');
			const hit = pos >= 35 && pos <= 65;
			phase = 'idle';
			if (castBtn) castBtn.textContent = 'Cast';
			if (hit) {
				const inv = Inventory.load();
				const hasBait = (inv.fishingBait || 0) > 0;
				if (hasBait) { inv.fishingBait -= 1; }
				const roll = Math.random() + (hasBait ? 0.15 : 0);
				let caught = null;
				if (roll < 0.45) caught = { name: 'Magikarp', rarity: 'common',   reward: 'berry',  amount: 1, icoKey: 'fish' };
				else if (roll < 0.70) caught = { name: 'Goldeen', rarity: 'common',   reward: 'berry',  amount: 2, icoKey: 'fish' };
				else if (roll < 0.87) caught = { name: 'Psyduck',  rarity: 'uncommon', reward: 'seed',   amount: 1, icoKey: 'fish' };
				else if (roll < 0.96) caught = { name: 'Lapras',   rarity: 'rare',     reward: 'tokens', amount: 8, icoKey: 'gem' };
				else                   caught = { name: 'Shiny Gyarados', rarity: 'shiny', reward: 'tokens', amount: 25, icoKey: 'gem' };

				if (caught.reward === 'berry')  inv.friendshipBerries = (inv.friendshipBerries || 0) + caught.amount;
				if (caught.reward === 'seed')   inv.seeds = (inv.seeds || 0) + caught.amount;
				if (caught.reward === 'tokens') inv.tokens = (inv.tokens || 0) + caught.amount;

				if (!inv.fishLog) inv.fishLog = [];
				inv.fishLog.unshift({ name: caught.name, icoKey: caught.icoKey, rarity: caught.rarity, ts: Date.now() });
				if (inv.fishLog.length > 10) inv.fishLog.length = 10;

				Inventory.save(inv);
				DailyQuests.increment('fish');
				TrainerLevel.addXP('fish');
				Achievements.unlock('firstCatch');
				if (caught.rarity === 'rare' || caught.rarity === 'shiny') Achievements.unlock('rareFish');

				const rewardStr = caught.reward === 'tokens' ? caught.amount + ' ' + ico(ICO.token) : caught.amount + ' ' + ico(caught.reward === 'berry' ? ICO.berry : ICO.seed);
				if (status) status.innerHTML = ico(ICO[caught.icoKey]||ICO.fish) + ' Caught ' + caught.name + '! +' + rewardStr + (hasBait ? ' (bait bonus!)' : '');
				showToast(ico(ICO[caught.icoKey]||ICO.fish) + ' ' + caught.name + ' caught!');
			} else {
				if (status) status.innerHTML = ico('x-circle-fill') + ' The fish got away! Try again.';
			}
		}
		function start() {
			ensurePanel();
			const p = document.getElementById('fishingPanel');
			if (p) p.hidden = false;
			isOpen = true;
			phase = 'idle';
		}
		function close() {
			if (raf) { cancelAnimationFrame(raf); raf = null; }
			const p = document.getElementById('fishingPanel');
			if (p) p.hidden = true;
			isOpen = false;
			phase = 'idle';
		}
		function getIsOpen() { return isOpen; }
		return { start, close, isOpen: getIsOpen };
	})();

	const showToast = (window.CAMP_SYSTEMS || {}).showToast;

	const Achievements = (window.CAMP_SYSTEMS || {}).Achievements;

	// ── Trainer Level ─────────────────────────────────────────────────────────────
	const TrainerLevel = (window.CAMP_SYSTEMS || {}).TrainerLevel;

	// ── Camp Rating ───────────────────────────────────────────────────────────────
	const CampRating = (window.CAMP_SYSTEMS || {}).CampRating;

	// ── Campfire Stories ──────────────────────────────────────────────────────────
	const CampfireStories = (window.CAMP_SYSTEMS || {}).CampfireStories;

	// ── Postcard System ───────────────────────────────────────────────────────────
	const PostcardSystem = (window.CAMP_SYSTEMS || {}).PostcardSystem;

	// ── Berry Composting ──────────────────────────────────────────────────────────
	const BerryCompost = (window.CAMP_SYSTEMS || {}).BerryCompost;

	// ── NPC Campers ───────────────────────────────────────────────────────────────
	const NpcCampers = (() => {
		const CAMPERS = [
			{ name:'Red',   icoKey:'trainer', gift:{ tokens:10 }, giftLabel:'+10 ' + ico(ICO.token),
			  dialog:["...", "...", "...", "Take this. You'll need it.", "..."] },
			{ name:'Leaf',  icoKey:'seed',    gift:{ seeds:2 }, giftLabel:'+2 ' + ico(ICO.seed),
			  dialog:["Hey! Your camp looks cosy.", "Your Pokémon looks really happy!", "I found these on my travels — take them!"] },
			{ name:'Blue',  icoKey:'trainer', gift:{ tokens:15 }, giftLabel:'+15 ' + ico(ICO.token),
			  dialog:["Oh, it's you. Your camp's... passable.", "Not as good as mine, obviously.", "Fine, take this. Don't read into it."] },
			{ name:'May',   icoKey:'npc',     gift:{ berries:3 }, giftLabel:'+3 ' + ico(ICO.berry),
			  dialog:["Hi there! Exploring camps is so fun!", "Your partner Pokémon is adorable!", "I baked extra this morning — have some!"] },
			{ name:'Lucas', icoKey:'trainer', gift:{ tokens:8 }, giftLabel:'+8 ' + ico(ICO.token),
			  dialog:["I've been sketching Pokémon all morning.", "Your camp has really nice spots.", "Here — found this near the lake!"] },
			{ name:'Dawn',  icoKey:'npc',     gift:{ berries:2, seeds:1 }, giftLabel:'+2 ' + ico(ICO.berry) + '+1 ' + ico(ICO.seed),
			  dialog:["Hi! I love how your camp is set up.", "Contests are so fun — have you tried them?", "Take these — I had extras!"] },
		];

		function getTodayCamper() {
			const day = Math.floor(Date.now() / 86400000);
			return CAMPERS[day % CAMPERS.length];
		}

		function isVisitHour() {
			const h = new Date().getHours();
			return (h >= 6 && h <= 12) || (h >= 17 && h <= 22);
		}

		function todayKey() { return 'pokequiz_camper_' + new Date().toISOString().slice(0,10); }
		function hasClaimedToday() { return !!localStorage.getItem(todayKey()); }

		function openDialog(camperName) {
			const camper = CAMPERS.find(c => c.name === camperName) || getTodayCamper();
			if (hasClaimedToday()) {
				Dialog.open(camper.name + ': "Come back tomorrow — I\'ll have something new!"');
				return;
			}
			const lines = [...camper.dialog, camper.name + ' gives you something! (' + camper.giftLabel + ')'];
			Dialog.open(lines.join('\n'));
			// Give gift
			localStorage.setItem(todayKey(), '1');
			const inv = Inventory.load();
			if (camper.gift.tokens)  inv.tokens = (inv.tokens||0) + camper.gift.tokens;
			if (camper.gift.seeds)   inv.seeds  = (inv.seeds||0) + camper.gift.seeds;
			if (camper.gift.berries) inv.friendshipBerries = (inv.friendshipBerries||0) + camper.gift.berries;
			Inventory.save(inv);
			TrainerLevel.addXP('camper');
			Achievements.unlock('camperMet');
			showToast(ico(ICO.npc) + ' ' + camper.name + ' visited! ' + camper.giftLabel);
		}

		return { getTodayCamper, isVisitHour, hasClaimedToday, openDialog };
	})();

	const DailyQuests = (window.CAMP_SYSTEMS || {}).DailyQuests;

	const WeatherSystem = (window.CAMP_SYSTEMS || {}).WeatherSystem;

	function getFurnitureBonuses() {
		const inv = Inventory.load();
		const placed = { ...(inv.cosmetics?.roomPlacements || {}), ...(inv.cosmetics?.housePlacements || {}) };
		return {
			rhythmTokenBonus: placed.desk ? 1 : 0,
			berrySellBonus:   placed.bookcase ? 2 : 0,
			friendshipBonus:  (placed.couch || placed.armchair) ? 5 : 0,
			growSpeedBonus:   (placed.flowerplant || placed.plant || placed.floorplant) ? 0.2 : 0,
		};
	}

	const getPartnerPassive = (window.CAMP_SYSTEMS || {}).getPartnerPassive;


	// ── Partner Mood System ───────────────────────────────────────────────────────
	const PartnerMood = (window.CAMP_SYSTEMS || {}).PartnerMood;

	// ── Shiny Pokemon Encounters ──────────────────────────────────────────────────
	const SHINY_POOL = (window.CAMP_DATA || {}).SHINY_POOL;

	const SHINY_HARD_QUESTIONS = [
		{ q:'Which Pokemon has the highest base Speed stat in Gen 1?', opts:['Jolteon','Electrode','Aerodactyl','Dugtrio'], a:0 },
		{ q:'What is Eevee primary type?', opts:['Normal','Fairy','Psychic','Dragon'], a:0 },
		{ q:'Which move has 100% accuracy and causes sleep?', opts:['Spore','Sleep Powder','Hypnosis','Yawn'], a:0 },
		{ q:'What type is Shedinja weak to?', opts:['Fire','Water','Ghost','Normal'], a:0 },
		{ q:'How many Pokemon are in the original 151?', opts:['151','150','152','149'], a:0 },
		{ q:'Which Pokemon evolves using a Sun Stone into Sunflora?', opts:['Sunkern','Oddish','Bellsprout','Hoppip'], a:0 },
		{ q:'What is the signature move of Dragonite?', opts:['Draco Meteor','Outrage','Dragon Rush','Hyper Beam'], a:1 },
		{ q:'Which Gym Leader uses Rock-type Pokemon in Kanto?', opts:['Brock','Lt. Surge','Misty','Erika'], a:0 },
		{ q:'What held item doubles a Pokemon Speed when HP is low?', opts:['Salac Berry','Liechi Berry','Apicot Berry','Petaya Berry'], a:0 },
		{ q:'How many PP does Hydro Pump have?', opts:['5','10','8','15'], a:0 },
		{ q:'Which ability prevents stat reduction from opponent moves?', opts:['Clear Body','Sturdy','Battle Armor','Shell Armor'], a:0 },
		{ q:'What type combination does Charizard have?', opts:['Fire/Flying','Fire/Dragon','Fire only','Fire/Rock'], a:0 },
		{ q:'Which Legendary is found in Seafoam Islands?', opts:['Articuno','Zapdos','Moltres','Mewtwo'], a:0 },
		{ q:'What is the max EVs a Pokemon can have in one stat?', opts:['252','255','256','248'], a:0 },
		{ q:'Which Pokemon learns Nasty Plot naturally?', opts:['Togekiss','Gardevoir','Alakazam','Espeon'], a:0 },
		{ q:'What is the base power of Earthquake?', opts:['100','90','120','80'], a:0 },
		{ q:'Which item raises Sp. Atk when eaten at low HP?', opts:['Petaya Berry','Salac Berry','Liechi Berry','Lansat Berry'], a:0 },
		{ q:'Which Pokemon has the move Quiver Dance?', opts:['Volcarona','Butterfree','Beautifly','Dustox'], a:0 },
		{ q:'What typing does Togekiss have?', opts:['Fairy/Flying','Normal/Flying','Psychic/Flying','Fairy only'], a:0 },
		{ q:'Which move bypasses accuracy checks to always hit?', opts:['Swift','Aerial Ace','Shock Wave','All of these'], a:3 },
		{ q:'What is the BST of Arceus?', opts:['720','680','700','750'], a:0 },
		{ q:'How many evolutions does Eevee have?', opts:['8','7','9','6'], a:0 },
		{ q:'Which Pokemon can learn both Thunder and Blizzard naturally?', opts:['Lapras','Snorlax','Clefable','Jigglypuff'], a:0 },
		{ q:'What type is Gengar?', opts:['Ghost/Poison','Ghost only','Poison/Dark','Ghost/Dark'], a:0 },
		{ q:'Which held item boosts the power of Dragon-type moves?', opts:['Dragon Fang','Dragon Scale','Draco Plate','Dragon Gem'], a:0 },
		{ q:'What level does Magikarp evolve into Gyarados?', opts:['20','25','15','30'], a:0 },
		{ q:'Which ability makes all moves hit Ghost-type Pokemon?', opts:['Scrappy','Normalize','Mold Breaker','Tinted Lens'], a:0 },
		{ q:'What is the name of Mewtwo signature move?', opts:['Psystrike','Psychic','Psyshock','Psycho Cut'], a:0 },
		{ q:'Which Pokemon has the Levitate ability in Kanto?', opts:['Gengar','Haunter','Gastly','All three'], a:3 },
		{ q:'How many total moves can a Pokemon know at once?', opts:['4','6','8','3'], a:0 },
		{ q:'What is the Pokemon with the highest base HP?', opts:['Blissey','Chansey','Snorlax','Wobbuffet'], a:0 },
		{ q:'Which move has 150 power and causes recharge?', opts:['Hyper Beam','Giga Impact','Frenzy Plant','Blast Burn'], a:0 },
		{ q:'What type does Fairy resist?', opts:['Dragon','Fighting','Dark','All of these'], a:3 },
		{ q:'Which Pokemon is the Legendary Birds trio guardian?', opts:['Lugia','Ho-Oh','Rayquaza','Articuno'], a:0 },
		{ q:'What is Pikachu hidden ability?', opts:['Lightning Rod','Static','Volt Absorb','Plus'], a:0 },
		{ q:'Which item prevents a Pokemon from being switched out?', opts:['Shed Shell','Smoke Ball','Grip Claw','Safety Goggles'], a:0 },
		{ q:'How many Pokemon are in a full party?', opts:['6','8','4','5'], a:0 },
		{ q:'Which move raises all stats by one stage?', opts:['Ancient Power','Silver Wind','Ominous Wind','All of these'], a:3 },
		{ q:'What Generation introduced the Fairy type?', opts:['Gen 6','Gen 5','Gen 7','Gen 4'], a:0 },
		{ q:'Which Pokemon evolves from Feebas?', opts:['Milotic','Gyarados','Kingdra','Seaking'], a:0 },
	];

	const ShinyEncounters = (() => {
		let shinySprite = null;
		let sparkleText = null;
		let shinyData = null;
		let fleeTimer = null;
		let catchModalOpen = false;

		function _clearShiny(scene) {
			if (shinySprite) { shinySprite.destroy(); shinySprite = null; }
			if (sparkleText) { sparkleText.destroy(); sparkleText = null; }
			if (fleeTimer) { clearInterval(fleeTimer); fleeTimer = null; }
			shinyData = null;
			const timerEl = document.getElementById('shinyTimer');
			if (timerEl) timerEl.hidden = true;
		}

		function spawn(scene) {
			if (shinyData) return;
			const name = SHINY_POOL[Math.floor(Math.random() * SHINY_POOL.length)];
			const tx = 5 + Math.floor(Math.random() * (MAP_W - 10));
			const ty = 5 + Math.floor(Math.random() * (MAP_H - 10));
			const px = tx * TILE + TILE / 2;
			const py = ty * TILE + TILE / 2;
			shinySprite = scene.add.text(px, py, '⭐', { fontSize: '20px' }).setDepth(3).setOrigin(0.5);
			sparkleText = scene.add.text(px, py - 20, '✨', { fontSize: '12px' }).setDepth(3.1).setOrigin(0.5);
			shinyData = { name, tx, ty, timeLeft: 45 };
			showToast('✨ A wild shiny ' + name + ' appeared! (45s)');
			const timerEl = document.getElementById('shinyTimer');
			const nameEl = document.getElementById('shinyTimerName');
			const countEl = document.getElementById('shinyTimerCount');
			if (timerEl) { timerEl.hidden = false; }
			if (nameEl) nameEl.textContent = name;
			if (countEl) countEl.textContent = '45';
			fleeTimer = setInterval(function() {
				if (!shinyData) { clearInterval(fleeTimer); fleeTimer = null; return; }
				shinyData.timeLeft--;
				if (countEl) countEl.textContent = shinyData.timeLeft;
				if (shinyData.timeLeft <= 0) {
					showToast('✨ ' + shinyData.name + ' fled!');
					_clearShiny(scene);
				}
			}, 1000);
		}

		function update(scene, tick) {
			if (!shinySprite || !shinyData) return;
			if (tick % 180 === 0) {
				shinyData.tx = Math.max(2, Math.min(MAP_W - 3, shinyData.tx + (Math.random() < 0.5 ? -1 : 1)));
				shinyData.ty = Math.max(2, Math.min(MAP_H - 3, shinyData.ty + (Math.random() < 0.5 ? -1 : 1)));
			}
			const px = shinyData.tx * TILE + TILE / 2;
			const py = shinyData.ty * TILE + TILE / 2;
			shinySprite.setPosition(px, py);
			sparkleText.setPosition(px, py - 20);
		}

		function tick5s(scene) {
			const inv = Inventory.load();
			const chance = inv.hasShinyCharm ? 3 / 1000 : 1 / 1000;
			if (Math.random() < chance) spawn(scene);
		}

		function checkInteract(scene) {
			if (!shinyData || catchModalOpen) return false;
			const px = scene._player ? Math.floor(scene._player.x / TILE) : -99;
			const py = scene._player ? Math.floor(scene._player.y / TILE) : -99;
			const dist = Math.abs(px - shinyData.tx) + Math.abs(py - shinyData.ty);
			return dist <= 2;
		}

		function openCatchModal(scene) {
			catchModalOpen = true;
			const pool = [];
			while (pool.length < 5) {
				const q = SHINY_HARD_QUESTIONS[Math.floor(Math.random() * SHINY_HARD_QUESTIONS.length)];
				if (!pool.includes(q)) pool.push(q);
			}
			scene._shinyCatchPool = pool;
			scene._shinyCatchQIdx = 0;
			const modal = document.getElementById('shinyCatchModal');
			if (modal) modal.hidden = false;
			_renderQuestion(scene);
		}

		function _renderQuestion(scene) {
			const pool = scene._shinyCatchPool;
			const idx = scene._shinyCatchQIdx;
			const q = pool[idx];
			const modal = document.getElementById('shinyCatchModal');
			if (!modal) return;
			modal.innerHTML = '<div class="shiny-catch-inner">' +
				'<div class="shiny-catch-head">✨ Catch ' + (shinyData ? shinyData.name : '') + '!</div>' +
				'<div class="shiny-catch-sub">Question ' + (idx + 1) + ' of 5</div>' +
				'<div class="shiny-catch-timer-wrap"><div class="shiny-catch-timer-bar" id="shinyCatchTimerBar" style="width:100%"></div></div>' +
				'<div class="shiny-catch-question">' + q.q + '</div>' +
				'<div class="shiny-catch-opts">' +
				q.opts.map(function(o, i) { return '<button class="shiny-catch-opt" data-i="' + i + '">' + o + '</button>'; }).join('') +
				'</div></div>';
			modal.querySelectorAll('.shiny-catch-opt').forEach(function(btn) {
				btn.addEventListener('click', function() { _answerQuestion(scene, parseInt(btn.dataset.i, 10)); });
			});
			scene._shinyCatchQTimerStart = Date.now();
			if (scene._shinyCatchQTimer) clearInterval(scene._shinyCatchQTimer);
			scene._shinyCatchQTimer = setInterval(function() {
				const elapsed = Date.now() - scene._shinyCatchQTimerStart;
				const pct = Math.max(0, 100 - (elapsed / 15000) * 100);
				const bar = document.getElementById('shinyCatchTimerBar');
				if (bar) bar.style.width = pct + '%';
				if (elapsed >= 15000) {
					clearInterval(scene._shinyCatchQTimer);
					scene._shinyCatchQTimer = null;
					_failCatch(scene);
				}
			}, 100);
		}

		function _answerQuestion(scene, idx) {
			if (scene._shinyCatchQTimer) { clearInterval(scene._shinyCatchQTimer); scene._shinyCatchQTimer = null; }
			const pool = scene._shinyCatchPool;
			const q = pool[scene._shinyCatchQIdx];
			if (idx !== q.a) { _failCatch(scene); return; }
			scene._shinyCatchQIdx++;
			if (scene._shinyCatchQIdx >= 5) { _successCatch(scene); return; }
			_renderQuestion(scene);
		}

		function _failCatch(scene) {
			catchModalOpen = false;
			const modal = document.getElementById('shinyCatchModal');
			if (modal) modal.hidden = true;
			const name = shinyData ? shinyData.name : 'Pokemon';
			showToast('✨ ' + name + ' fled! So close...');
			_clearShiny(scene);
		}

		function _successCatch(scene) {
			catchModalOpen = false;
			const modal = document.getElementById('shinyCatchModal');
			if (modal) modal.hidden = true;
			const name = shinyData ? shinyData.name : 'Pokemon';
			const inv = Inventory.load();
			inv.shinies = inv.shinies || [];
			inv.shinies.push({ name, at: Date.now() });
			const today = new Date().toISOString().slice(0, 10);
			inv.lastShinyToday = today;
			const mood = PartnerMood.get(inv);
			const mult = PartnerMood.tokenMultiplier(mood);
			inv.tokens = (inv.tokens || 0) + Math.round(50 * mult);
			Inventory.save(inv);
			_clearShiny(scene);
			showToast('✨ You caught a shiny ' + name + '! +50 tokens!');
			if (typeof Sound !== 'undefined') Sound.win();
		}

		function openCollection() {
			const inv = Inventory.load();
			const shinies = inv.shinies || [];
			let html = '<b>✨ Shiny Collection (' + shinies.length + ')</b><br>';
			if (shinies.length === 0) {
				html += 'No shinies caught yet! Keep exploring.';
			} else {
				shinies.forEach(function(s) {
					const dt = new Date(s.at).toLocaleDateString();
					html += '⭐ <b>' + s.name + '</b> &mdash; caught ' + dt + '<br>';
				});
			}
			if (typeof Dialog !== 'undefined') Dialog.open(html);
		}

		function getCount() {
			const inv = Inventory.load();
			return (inv.shinies || []).length;
		}

		return { spawn, update, tick5s, checkInteract, openCatchModal, openCollection, getCount };
	})();

	// ── Photo Mode ────────────────────────────────────────────────────────────────
	const PhotoMode = (window.CAMP_SYSTEMS || {}).PhotoMode;

	// ── Seasonal Camp Events ──────────────────────────────────────────────────────
	const SeasonalEvents = (() => {
		function _getSeason() {
			const now = new Date();
			const m = now.getMonth() + 1;
			const d = now.getDate();
			if ((m === 10 && d >= 25) || (m === 11 && d <= 5)) return 'halloween';
			if ((m === 12 && d >= 20) || (m === 1 && d <= 3)) return 'winter';
			if (m === 4 && d >= 1 && d <= 7) return 'spring';
			if ((m === 6 && d >= 21) || (m === 7 && d <= 4)) return 'summer';
			return null;
		}
		const SEASON_CONFIGS = {
			halloween: { color: 0xFF6600, alpha: 0.18, emojis: ['🎃','🕷️','👻'], dialog: 'Happy Halloween!' },
			winter:    { color: 0x4488FF, alpha: 0.15, emojis: ['❄️','⛄','🎄'], dialog: 'Happy Holidays!' },
			spring:    { color: 0xFF88CC, alpha: 0.12, emojis: ['🌸','🌺','🌷'], dialog: 'Spring has sprung!' },
			summer:    { color: 0xFFDD00, alpha: 0.12, emojis: ['☀️','🌊','🏖️'], dialog: 'Summer vibes!' },
		};
		function applyToScene(scene) {
			const season = _getSeason();
			if (!season) return;
			const cfg = SEASON_CONFIGS[season];
			scene.add.rectangle(0, 0, MAP_W * TILE, MAP_H * TILE, cfg.color, cfg.alpha)
				.setOrigin(0, 0).setDepth(1.5).setScrollFactor(1);
			const positions = [
				{ x: 3 * TILE, y: 3 * TILE },
				{ x: (MAP_W - 4) * TILE, y: 3 * TILE },
				{ x: Math.floor(MAP_W / 2) * TILE, y: (MAP_H - 4) * TILE },
			];
			cfg.emojis.forEach(function(em, i) {
				const pos = positions[i] || positions[0];
				scene.add.text(pos.x, pos.y, em, { fontSize: '28px' }).setDepth(1.6).setScrollFactor(1);
			});
			const today = new Date().toISOString().slice(0, 10);
			const key = 'pokequiz_season_dialog_' + today;
			try {
				if (!localStorage.getItem(key)) {
					localStorage.setItem(key, '1');
					setTimeout(function() { if (typeof Dialog !== 'undefined') Dialog.open(cfg.dialog); }, 1500);
				}
			} catch(e) {}
		}
		return { applyToScene };
	})();

	// ── Surf / movement helpers ───────────────────────────────────────────────────
	function canWalkOn(tileId, inv) {
		if (!SOLID.has(tileId)) return true;
		if (tileId === TH2O && inv && inv.eeveeForm === 'vaporeon') return true;
		return false;
	}

	// ── Phaser Scenes ────────────────────────────────────────────────────────────
	function makeSceneClass() {
		return class CampScene extends Phaser.Scene {
			constructor() { super({ key: 'camp' }); }

			init(data) {
				// 'from-house' spawns the player just south of the camp door.
				// Prefer init data; fall back to URL-hash boot data captured at start().
				this.spawnFrom = (data && data.from) || consumeBootFrom('camp') || null;
			}

			preload() {
				// Load the raw sheet — we'll palette-swap it into a canvas and
				// register that canvas as the 'player' spritesheet below.
				this.load.image('player-base', 'Pictures/sprites/calem.png');
				// PMD walk sheets. Eevee + the three eeveelutions wired in here so the
				// follower can swap form after evolution without a preload-stage round trip.
				this.load.spritesheet('eevee',    'Pictures/sprites/eevee.png',    { frameWidth: 40, frameHeight: 48 });
				this.load.spritesheet('vaporeon', 'Pictures/sprites/vaporeon.png', { frameWidth: 32, frameHeight: 48 });
				this.load.spritesheet('espeon',   'Pictures/sprites/espeon.png',   { frameWidth: 32, frameHeight: 48 });
				this.load.spritesheet('umbreon',  'Pictures/sprites/umbreon.png',  { frameWidth: 32, frameHeight: 40 });
				this.load.spritesheet('flareon',  'Pictures/sprites/flareon.png',  { frameWidth: 32, frameHeight: 40 });
				this.load.spritesheet('jolteon',  'Pictures/sprites/jolteon.png',  { frameWidth: 32, frameHeight: 40 });
				this.load.spritesheet('leafeon',  'Pictures/sprites/leafeon.png',  { frameWidth: 32, frameHeight: 48 });
				this.load.spritesheet('glaceon',  'Pictures/sprites/glaceon.png',  { frameWidth: 32, frameHeight: 48 });
				this.load.spritesheet('sylveon',  'Pictures/sprites/sylveon.png',  { frameWidth: 32, frameHeight: 48 });
				// NPC trainer overworld sprites (FRLG 32×32 single-frame images).
				this.load.image('npc-youngster',     'Pictures/sprites/trainer-youngster.png');
				this.load.image('npc-camper',        'Pictures/sprites/trainer-camper.png');
				this.load.image('npc-cooltrainer-m', 'Pictures/sprites/trainer-cooltrainer-m.png');
				this.load.image('npc-picnicker',     'Pictures/sprites/trainer-picnicker.png');
				// NOTE: Companion sprite is intentionally NOT preloaded here with Phaser's loader.
				// The default FOLLOWER_FORMS dims (40×40) are wrong for most PMD sheets.
				// _buildCamp() bootstraps with Eevee then calls _switchFollower(), which uses
				// a native Image() fetch + frame-auto-detection + stale-texture validation.
			}

			create() {
				console.log('[CampScene] create()');
				if (typeof window !== 'undefined') window.__campScene = this;
				try {
					this._buildCamp();
					console.log('[CampScene] create() ok');
					requestAnimationFrame(() => requestAnimationFrame(() => {
						const f = document.getElementById('campFade');
						if (f) f.classList.add('is-hidden');
					}));
					// Feature 7: Show welcome-back dialog after evolution reload
					const justEvolved = localStorage.getItem('campJustEvolved');
					if (justEvolved) {
						localStorage.removeItem('campJustEvolved');
						setTimeout(() => Dialog.open(justEvolved.toUpperCase() + ' has joined your team!'), 1500);
					}
				} catch (e) {
					console.error('[CampScene] create failed:', e);
					Debug.lastError = 'CampScene.create: ' + e.message;
				}
			}

			_buildCamp() {
				this.tick = 0;
				this.map = buildMap();

				const W = MAP_W * TILE, H = MAP_H * TILE;
				// Reuse the existing canvas textures across scene boots — but only if
				// the existing entry is actually a CanvasTexture (has getContext). On
				// some Phaser builds textures.get() can return a base Texture on the
				// second boot, which would silently throw inside getContext() and abort
				// CampScene.create() — leaving the HOUSE scene wedged.
				const grabCanvasTex = (key) => {
					const existing = this.textures.exists(key) ? this.textures.get(key) : null;
					if (existing && typeof existing.getContext === 'function') return existing;
					if (existing) {
						try { this.textures.remove(key); } catch (_) {}
					}
					return this.textures.createCanvas(key, W, H);
				};
				this.baseTex = grabCanvasTex('campBase');
				this.animTex = grabCanvasTex('campAnim');
				if (!this.baseTex || !this.animTex) {
					throw new Error('createCanvas returned null for camp textures');
				}
				const baseCtx = this.baseTex.getContext();
				const animCtx = this.animTex.getContext();
				baseCtx.imageSmoothingEnabled = false;
				animCtx.imageSmoothingEnabled = false;
				this.animCtx = animCtx;

				this.animatedCells = [];
				for (let r = 0; r < MAP_H; r++) {
					for (let c = 0; c < MAP_W; c++) {
						const t = this.map[r][c];
						if (ANIMATED.has(t)) {
							this.animatedCells.push([r, c, t]);
							drawTile(baseCtx, TG, c*TILE, r*TILE, 0);
						} else {
							drawTile(baseCtx, t, c*TILE, r*TILE, 0);
						}
					}
				}
				this.baseTex.refresh();

				this.add.image(0, 0, 'campBase').setOrigin(0).setDepth(0);
				this.add.image(0, 0, 'campAnim').setOrigin(0).setDepth(1);

				// Chimney overlay
				const wx = 7*TILE + 4, wy = 2*TILE + 2;
				const cg = this.add.graphics().setDepth(2);
				cg.fillStyle(0x501010, 1); cg.fillRect(wx+1, wy, 6, 14);
				cg.fillStyle(0x701818, 1); cg.fillRect(wx+2, wy+1, 4, 12);
				cg.fillStyle(0x401010, 1); cg.fillRect(wx, wy, 8, 3);
				cg.fillStyle(0x602020, 1); cg.fillRect(wx+1, wy+1, 6, 2);

				// Palette-swap the base sheet into a canvas-backed spritesheet
				const baseImg = this.textures.get('player-base').getSourceImage();
				const pw = baseImg.width, ph = baseImg.height;
				this._playerCanvas = document.createElement('canvas');
				this._playerCanvas.width = pw;
				this._playerCanvas.height = ph;
				this._playerCtx = this._playerCanvas.getContext('2d');
				this._playerBaseImg = baseImg;

				const applyPalette = () => {
					if (window.TrainerPalette) {
						window.TrainerPalette.recolor(this._playerBaseImg, window.TrainerPalette.load(), this._playerCtx, window.TrainerPalette.loadBody && window.TrainerPalette.loadBody());
					} else {
						this._playerCtx.clearRect(0, 0, pw, ph);
						this._playerCtx.drawImage(this._playerBaseImg, 0, 0);
					}
				};
				applyPalette();
				if (!this.textures.exists('player')) {
					this.textures.addSpriteSheet('player', this._playerCanvas, { frameWidth: 22, frameHeight: 38 });
				} else {
					this.textures.get('player').refresh();
				}

				this._onStorage = (e) => {
					if ((e.key === 'pokequiz_trainer_palette' || e.key === 'pokequiz_trainer_body') && window.TrainerPalette) {
						applyPalette();
						this.textures.get('player').refresh();
					}
				};
				window.addEventListener('storage', this._onStorage);
				this.events.once('shutdown', () => window.removeEventListener('storage', this._onStorage));

				// Walk animations: row order in sheet = south, west, north, east
				const mkAnim = (key, frames) => {
					if (!this.anims.exists(key)) {
						this.anims.create({
							key, frameRate: 6, repeat: -1,
							frames: this.anims.generateFrameNumbers('player', { frames }),
						});
					}
				};
				mkAnim('walk-south', [1, 0, 2, 0]);
				mkAnim('walk-west',  [4, 3, 5, 3]);
				mkAnim('walk-north', [7, 6, 8, 6]);
				mkAnim('walk-east',  [10, 9, 11, 9]);

				// Spawn just south of the camp door if coming back from inside the house,
				// otherwise the default starting position on the path.
				const spawnTileR = this.spawnFrom === 'house'  ? 12
				                 : this.spawnFrom === 'market' ? MAP_H - 2
				                 : 14;
				this.player = this.physics.add.sprite(11*TILE + TILE/2, spawnTileR*TILE + TILE/2, 'player', 0);
				// Origin: feet at the bottom-centre of the frame (foot point ≈ y=36 in 38-tall frame)
				this.player.setOrigin(0.5, 36/38);
				this.player.setScale(0.75);  // shrink trainer to roughly one-tile-wide for tile-scale match
				this.player.setDepth(3);
				// Physics body — small rectangle covering the feet so collision feels tile-aligned
				this.player.body.setSize(10, 6);
				this.player.body.setOffset((22-10)/2, 38-8);

				// Solid tile bodies
				this.solids = this.physics.add.staticGroup();
				{
					const _campInv = Inventory.load();
					for (let r = 0; r < MAP_H; r++) {
						for (let c = 0; c < MAP_W; c++) {
							if (!canWalkOn(this.map[r][c], _campInv)) {
								const rect = this.add.rectangle(c*TILE + TILE/2, r*TILE + TILE/2, TILE, TILE);
								this.physics.add.existing(rect, true);
								this.solids.add(rect);
							}
						}
					}
				}
				this.physics.add.collider(this.player, this.solids);

				this.physics.world.setBounds(0, 0, W, H);
				this.player.setCollideWorldBounds(true);

				this.cameras.main.setBounds(0, 0, W, H);
				this.cameras.main.startFollow(this.player, true, 1, 1);
				this.cameras.main.setBackgroundColor('#68A028');
				this.cameras.main.setRoundPixels(true);
				this.applyZoom();
				this.scale.on('resize', this.onResize, this);
				this.events.once('shutdown', () => this.scale.off('resize', this.onResize, this));

				_sceneKeyboard = this.input.keyboard;
				this.keys = this.input.keyboard.addKeys({
					up: Phaser.Input.Keyboard.KeyCodes.UP,
					down: Phaser.Input.Keyboard.KeyCodes.DOWN,
					left: Phaser.Input.Keyboard.KeyCodes.LEFT,
					right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
					w: Phaser.Input.Keyboard.KeyCodes.W,
					a: Phaser.Input.Keyboard.KeyCodes.A,
					s: Phaser.Input.Keyboard.KeyCodes.S,
					d: Phaser.Input.Keyboard.KeyCodes.D,
					interact: Phaser.Input.Keyboard.KeyCodes.E,
					partner: Phaser.Input.Keyboard.KeyCodes.P,
					faceoff: Phaser.Input.Keyboard.KeyCodes.F,
					bonus:   Phaser.Input.Keyboard.KeyCodes.B,
					rain:    Phaser.Input.Keyboard.KeyCodes.R,
					scythe:  Phaser.Input.Keyboard.KeyCodes.Q,
				});
				this.dpad = { up:false, down:false, left:false, right:false };
				this.setupJoystick();
				setupPauseMenu(this.game);
				Music.start('camp');
				this.events.once('shutdown', () => Music.stop());

				// Apply saved accent colour immediately so chrome is correct before
				// the player interacts with anything.
				const _startInv = Inventory.load();
				applyCampAccent(_startInv.cosmetics?.accent);

				// Chimney smoke particles + container behind the player so puffs don't
				// occlude the trainer. The chimney tile is at row 2 col 7 in the map.
				this.smokeContainer = this.add.container(0, 0).setDepth(2);
				this.smoke = [];

				// Drifting leaf particles — small autumn-coloured rectangles that fall
				// across the camera viewport at random.
				this.leafContainer = this.add.container(0, 0).setDepth(4).setScrollFactor(0);
				this.leaves = [];
				// Rain weather — fixed-screen raindrops. Toggle with R key.
				this.rainContainer = this.add.container(0, 0).setDepth(4.5).setScrollFactor(0);
				this.raindrops = [];
				this.isRaining = false;
				WeatherSystem.check(this);

				this.dir = this.spawnFrom === 'market' ? 2 : 0;
				this.dirAnimKeys = ['walk-south', 'walk-west', 'walk-north', 'walk-east'];
				// Idle frame index per direction (frame 0 of each row)
				this.dirIdleFrame = [0, 3, 6, 9];
				this.player.setFrame(this.dirIdleFrame[this.dir]);

				// Follower (Eevee or an evolved form) — trails behind the player via a
				// position-history buffer. Each PMD walk sheet has its own column count;
				// frame indices are computed from that.
				const _inv0 = Inventory.load();
				const formKey = _inv0.companionForm != null ? _inv0.companionForm : (_inv0.eeveeForm || 'eevee');
				// Bootstrap with Eevee (always preloaded) so the sprite exists immediately.
				// Using the companion form's default dims here (cols:6, frameH:40) would create
				// wrong animations for most PMD sheets. _switchFollower below does a CDN fetch,
				// auto-detects the real frame dims, and swaps in the correct texture + anims.
				const _bootF = FOLLOWER_FORMS.eevee;
				const _bCols = _bootF.cols; // 7 — always correct
				const _bRow  = (row) => Array.from({ length: _bCols }, (_, i) => row * _bCols + i);
				const _bootAnims = [
					['eevee-walk-south', _bRow(0), 0],
					['eevee-walk-west',  _bRow(6), 6 * _bCols],
					['eevee-walk-north', _bRow(4), 4 * _bCols],
					['eevee-walk-east',  _bRow(2), 2 * _bCols],
				];
				for (const [key, frames] of _bootAnims) {
					if (!this.anims.exists(key)) {
						this.anims.create({ key, frameRate: 10, repeat: -1,
							frames: this.anims.generateFrameNumbers(_bootF.sheet, { frames }) });
					}
				}
				this.eeveeAnimKeys = _bootAnims.map(([k]) => k);
				this.eeveeIdleFrame = _bootAnims.map(([,,idle]) => idle);
				this.followerForm = 'eevee';
				const _followerInv = Inventory.load();
				const _scaleMult = SCALE_MULT[_followerInv.cosmetics?.partnerScale] ?? 1;
				this.follower = this.add.sprite(this.player.x, this.player.y + 14, _bootF.sheet, this.eeveeIdleFrame[0]);
				this.follower.setOrigin(0.5, _bootF.originY);
				this.follower.setScale(_bootF.scale * _scaleMult);
				this._followerScaleMult = _scaleMult;
				this.follower.setDepth(3.5);

				// Idle tracking
				this._idleTicks = 0;
				this._idleEmoji = document.getElementById('followerIdleEmoji');

				// Nickname label — HTML overlay for crisp rendering at any DPR.
				this._followerNameEl = document.getElementById('campFollowerName');
				this._updateFollowerLabel = () => {
					const el = this._followerNameEl;
					if (!el) return;
					// Prefer nickname stored in active party slot; fall back to legacy NICKNAME_KEY.
					const _lInv = Inventory.load();
					const _lSlot = (_lInv.party || [])[_lInv.partyActive || 0];
					const nick = (_lSlot && _lSlot.nickname) || Partner.loadNickname();
					if (nick) {
						el.textContent = nick;
						el.hidden = false;
					} else {
						el.hidden = true;
					}
				};
				this._updateFollowerLabel();

				// Shiny tint — golden shimmer if enabled.
				this._applyFollowerShiny = () => {
					if (Partner.loadShiny()) {
						this.follower.setTint(0xffd080);
					} else {
						this.follower.clearTint();
					}
				};
				this._applyFollowerShiny();
				// Now asynchronously swap in the real companion form with verified frame dims.
				// silent=true: no toast, no nickname-clear, no inventory save (already persisted).
				this._switchFollower(formKey, { silent: true });

				this.followerHistory = [];
				this.followerDir = 0;
				this.followerMode = 'trail';   // 'trail' while player moves, 'faceoff' once stopped
				this.followerTarget = null;
				this.followerPath = null;      // remaining waypoints during faceoff routing
				// Direction → tile-offset vector (matches this.dir: 0=south, 1=west, 2=north, 3=east).
				this.DIR_VEC = [[0,1],[-1,0],[0,-1],[1,0]];

				// Door-transition guard — flipped true the moment we trigger scene.start
				// so we don't re-fire while the next scene boots.
				this.didTransition = false;
				// When we arrived from the house, the player is one tile south of the
				// door. The door check would re-fire the moment they walk north onto it
				// without this — wait until they step OFF the door area to re-arm.
				this.armedForDoor = this.spawnFrom !== 'house';
				this.armedForSouth = this.spawnFrom !== 'market';

				// Poké Radar state
				this._radarShimmer = new Set();
				this._radarActive = false;
				this._radarTick = 0;
				this._radarGfx = null;

				// Egg step accumulator
				this._eggStepAccum = 0;

				// Spawn NPCs from the NPCS table. They render frame 0 of their walk
				// sheet (south idle), block movement via static collision rects, and
				// register into npcByTile for the E-key interaction prompt.
				this.npcByTile = {};
				const npcSolids = this.physics.add.staticGroup();
				for (const npc of NPCS) {
					const x = npc.c * TILE + TILE/2;
					const y = npc.r * TILE + TILE/2;
					const sprite = this.add.sprite(x, y, 'npc-' + npc.species, 0);
					sprite.setOrigin(0.5, (npc.frameHeight - 4) / npc.frameHeight);
					sprite.setScale(npc.spriteScale);
					sprite.setDepth(3);
					const rect = this.add.rectangle(x, y, TILE, TILE);
					this.physics.add.existing(rect, true);
					npcSolids.add(rect);
					this.npcByTile[npc.r + ',' + npc.c] = npc;
				}
				this.physics.add.collider(this.player, npcSolids);

				// Berry planting state — restored from localStorage so plants persist
				// across page reloads (including the house/camp scene swaps).
				this.plants = Plants.load();
				this.plantSprites = {}; // r,c → Phaser graphics representing the plant
				this.plantContainer = this.add.container(0, 0).setDepth(1.5);
				this._refreshPlantSprites();

				// Pre-render the static mini-map once. It mirrors the full map at tiny
				// ── Cosmetic decor — render bought items at fixed world positions ─────
				const _decorInv = Inventory.load();
				const _decor = _decorInv.cosmetics?.decor || [];
				if (_decor.includes('flowers')) {
					const fp = DECOR_POS.flowers;
					// Three flower emoji at slight offsets for a natural patch look.
					[[-6,-4],[4,-2],[0,6]].forEach(([dx,dy]) => {
						this.add.text(fp.x + dx, fp.y + dy, '🌸', { fontSize: '10px' })
							.setDepth(2).setOrigin(0.5);
					});
				}
				if (_decor.includes('lantern')) {
					const lp = DECOR_POS.lantern;
					this.add.text(lp.x, lp.y, '🏮', { fontSize: '13px' })
						.setDepth(2).setOrigin(0.5);
					// Soft glow circle underneath
					const gfx = this.add.graphics().setDepth(1.5);
					gfx.fillStyle(0xff8040, 0.18);
					gfx.fillCircle(lp.x, lp.y + 2, 20);
				}

				// ── Seasonal decorations ────────────────────────────────────────────
				{
					const month = new Date().getMonth(); // 0-11
					const seasonLayer = this.add.container(0, 0).setDepth(1.8).setScrollFactor(1);
					this._seasonParticles = [];
					this._seasonContainer = seasonLayer;

					if (month >= 2 && month <= 4) {
						// Spring — cherry blossom petals scattered around the camp
						const petalPositions = [[5,18],[6,22],[4,27],[7,15],[8,20],[5,24],[3,30]];
						petalPositions.forEach(([r,c]) => {
							const t = this.add.text(c*TILE+4, r*TILE+4, '🌸', { fontSize:'9px' })
								.setDepth(1.8).setOrigin(0.5);
							seasonLayer.add(t);
						});
						showToast(ico(ICO.sparkle) + ' Cherry blossoms are in bloom!');
					} else if (month >= 5 && month <= 7) {
						// Summer — sunflowers near the garden
						[[18,20],[20,21],[18,22]].forEach(([r,c]) => {
							const t = this.add.text(c*TILE, r*TILE, '🌻', { fontSize:'10px' })
								.setDepth(1.8).setOrigin(0.5);
							seasonLayer.add(t);
						});
					} else if (month >= 8 && month <= 10) {
						// Autumn — coloured leaf decorations on trees (leaves already fall in updateLeaves)
						[[3,5],[4,8],[5,12],[3,22],[4,25]].forEach(([r,c]) => {
							const t = this.add.text(c*TILE, r*TILE, '🍂', { fontSize:'10px' })
								.setDepth(1.8).setOrigin(0.5);
							seasonLayer.add(t);
						});
					} else {
						// Winter — snowflake accents + snowfall
						this._snowflakes = [];
						this._snowActive = true;
						[[2,8],[3,15],[2,22],[4,30]].forEach(([r,c]) => {
							const t = this.add.text(c*TILE+6, r*TILE+6, '❄️', { fontSize:'9px' })
								.setDepth(1.8).setOrigin(0.5);
							seasonLayer.add(t);
						});
					}
				}

				// ── Seasonal Events (date-specific overlays) ───────────────────────
				SeasonalEvents.applyToScene(this);

				// ── Camp rating display near south gate ───────────────────────────
				{
					const stars = CampRating.calculate();
					const starStr = '★'.repeat(stars) + '☆'.repeat(5-stars);
					this.add.text(11*TILE + TILE/2, 26*TILE, starStr, {
						fontFamily: '"Press Start 2P", monospace',
						fontSize: '6px',
						color: '#f6c84c',
						stroke: '#000000',
						strokeThickness: 2,
					}).setDepth(3).setOrigin(0.5);
					TrainerLevel.updateHUD();
				}

				// ── Surfing current state ─────────────────────────────────────────
				this._surfDriftTick = 0;
				this._surfDiscoveredIsland = false;

				// Minimap: pre-render the static tile layer once to an offscreen canvas.
				// updateMinimap() then does 1 drawImage blit + 2 fillRects per frame instead
				// of iterating all 1200 tiles each frame (which caused frame drops while walking).
				this.minimapEl = document.getElementById('campMinimap');
				if (this.minimapEl) {
					this.minimapEl.width = MAP_W * 3;
					this.minimapEl.height = MAP_H * 3;
					this._minimapCtx = this.minimapEl.getContext('2d');
					this._minimapCtx.imageSmoothingEnabled = false;
					// Build offscreen tile cache.
					const _offscreen = document.createElement('canvas');
					_offscreen.width  = MAP_W * 3;
					_offscreen.height = MAP_H * 3;
					const _octx = _offscreen.getContext('2d');
					_octx.fillStyle = '#000';
					_octx.fillRect(0, 0, _offscreen.width, _offscreen.height);
					for (let _r = 0; _r < MAP_H; _r++) {
						for (let _c = 0; _c < MAP_W; _c++) {
							_octx.fillStyle = miniMapColor(this.map[_r][_c]);
							_octx.fillRect(_c*3, _r*3, 3, 3);
						}
					}
					this._minimapCache = _offscreen;
				}
			}

			findInteractTarget() {
				// Pick the tile directly in front of the player (one tile in this.dir),
				// plus the tile the player is standing on (so door entry also works).
				const tc = Math.floor(this.player.x / TILE);
				const tr = Math.floor(this.player.y / TILE);
				const [dvx, dvy] = this.DIR_VEC[this.dir];
				const candidates = [[tc + dvx, tr + dvy], [tc, tr]];
				const followerTC = this.follower ? Math.floor(this.follower.x / TILE) : -99;
				const followerTR = this.follower ? Math.floor(this.follower.y / TILE) : -99;
				for (const [c, r] of candidates) {
					if (c === followerTC && r === followerTR) {
						return { kind: 'feed', r, c, label: 'Feed' };
					}
					const npc = this.npcByTile && this.npcByTile[r + ',' + c];
					if (npc) return { kind: 'npc', r, c, message: getNpcDialog(npc), label: npc.label, npcKind: npc.kind };
					if (!this.map[r] || this.map[r][c] === undefined) continue;
					const t = this.map[r][c];
					if (t === TSG) {
						const msg = SIGN_MESSAGES[r + ',' + c];
						if (msg === '__mailbox__') return { kind: 'sign', r, c, message: '__mailbox__', label: 'Mailbox' };
						if (msg === '__camprating__') return { kind: 'sign', r, c, message: '__camprating__', label: 'Camp ★' };
						if (msg) return { kind: 'sign', r, c, message: msg };
					}
					if (t === TD) return { kind: 'door', r, c };
					// Water tile — open fishing minigame
					if (t === TH2O) return { kind: 'fish', r, c, label: 'Fish' };
					// Campfire tile — open curry cooking
					if (t === TFR || t === TFY) return { kind: 'fire', r, c, label: 'Cook' };
					// Boulder tile
					if (t === TBLD) return { kind: 'boulder', r, c, label: 'Smash' };
					// Radar shimmer on tall grass
					if (t === TTG && this._radarShimmer && this._radarShimmer.has(r+','+c)) {
						return { kind: 'radar', r, c, label: 'Investigate' };
					}
					// Soil tile — plant if free + have seeds, harvest if ripe, status otherwise.
					if (t === TSO || t === TCR) {
						const plant = this._findPlantAt(r, c);
						if (plant) {
							const elapsed = Date.now() - plant.plantedAt;
							const growMs = getEffectiveGrowMs(); const ripe = elapsed >= growMs;
							if (ripe) return { kind: 'harvest', r, c, label: 'Harvest' };
							const pct = Math.min(99, Math.floor(elapsed / growMs * 100));
							const remaining = Math.max(1, Math.ceil((growMs - elapsed) / 1000));
							return {
								kind: 'growing', r, c, label: 'Growing…',
								message: 'This plant is ' + pct + '% grown — about ' + remaining + 's to go.',
							};
						}
						return { kind: 'plant', r, c, label: 'Plant' };
					}
				}
				return null;
			}

			_findPlantAt(r, c) {
				for (const p of (this.plants || [])) {
					if (p.r === r && p.c === c) return p;
				}
				return null;
			}

			_refreshPlantSprites() {
				if (!this.plantContainer) return;
				this.plantContainer.removeAll(true);
				this.plantSprites = {};
				const t = this.tick || 0;
				for (const p of this.plants) {
					const elapsed = Date.now() - p.plantedAt;
					const effGrowMs = getEffectiveGrowMs(); const pct = Math.min(1, elapsed / effGrowMs);
					const stage = pct >= 1 ? 3 : pct >= 0.66 ? 2 : pct >= 0.33 ? 1 : 0;
					const x = p.c * TILE + TILE/2;
					const y = p.r * TILE + TILE/2;
					const g = this.add.graphics();
					if (stage === 0) {
						// Freshly planted: small mound of dark soil with a seed peeking out.
						g.fillStyle(0x2C1808, 1); g.fillRect(x-3, y+3, 7, 2);
						g.fillStyle(0x4A2810, 1); g.fillRect(x-2, y+2, 5, 2);
						g.fillStyle(0xC8A86C, 1); g.fillRect(x, y+1, 1, 1);
					} else if (stage === 1) {
						// First sprout — two tiny leaves.
						g.fillStyle(0x2A5018, 1); g.fillRect(x, y, 1, 4);
						g.fillStyle(0x62A030, 1); g.fillRect(x-2, y-1, 5, 1);
						g.fillStyle(0x9ED860, 1); g.fillRect(x-1, y-1, 1, 1);
						g.fillStyle(0x9ED860, 1); g.fillRect(x+1, y-1, 1, 1);
					} else if (stage === 2) {
						// Growing — taller stem, broad leaves, faint flower hint.
						g.fillStyle(0x2A5018, 1); g.fillRect(x, y-2, 1, 6);
						g.fillStyle(0x62A030, 1); g.fillRect(x-2, y-3, 5, 2);
						g.fillStyle(0x9ED860, 1); g.fillRect(x-2, y-3, 1, 1);
						g.fillStyle(0x9ED860, 1); g.fillRect(x+2, y-3, 1, 1);
						g.fillStyle(0xFFB0B0, 0.7); g.fillRect(x, y-4, 1, 1);
					} else {
						// Ripe — bobbing berry with sparkle. tick drives a 2-pixel hover.
						const bob = (Math.sin(t * 0.08) * 1.2) | 0;
						const sparkleOn = ((t / 24) | 0) % 3 === 0;
						g.fillStyle(0x2A5018, 1); g.fillRect(x, y-1, 1, 5);
						g.fillStyle(0x62A030, 1); g.fillRect(x-2, y-2, 5, 2);
						g.fillStyle(0x2A5018, 1); g.fillRect(x+2, y-4 + bob, 1, 1);  // leaf
						g.fillStyle(0x9C2020, 1); g.fillCircle(x, y-3 + bob, 3);
						g.fillStyle(0xC03838, 1); g.fillCircle(x, y-3 + bob, 2);
						g.fillStyle(0xFFB0B0, 1); g.fillRect(x-1, y-4 + bob, 1, 1);
						if (sparkleOn) {
							g.fillStyle(0xFFE890, 1); g.fillRect(x+2, y-5 + bob, 1, 1);
							g.fillStyle(0xFFFFFF, 0.8); g.fillRect(x-3, y-2 + bob, 1, 1);
						}
					}
					this.plantContainer.add(g);
					this.plantSprites[p.r + ',' + p.c] = g;

					// Floating countdown above growing plants — disappears when ripe.
					if (stage < 3) {
						const remaining = Math.max(1, Math.ceil((getEffectiveGrowMs() - elapsed) / 1000));
						const label = this.add.text(x, y - 10, remaining + 's', {
							fontFamily: 'monospace',
							fontSize: '7px',
							color: '#FFFFFF',
							stroke: '#000000',
							strokeThickness: 2,
							resolution: 2,
						}).setOrigin(0.5, 1).setDepth(2);
						this.plantContainer.add(label);
					}
				}
			}

			_handlePlantAction(target) {
				const inv = Inventory.load();
				if (target.kind === 'plant') {
					if ((inv.premiumSeeds || 0) > 0) {
						inv.premiumSeeds -= 1;
						Inventory.save(inv);
						this.plants.push({ r: target.r, c: target.c, plantedAt: Date.now(), type: 'sitrus', premium: true });
						Plants.save(this.plants);
						this._refreshPlantSprites();
						Sound.plant();
						Dialog.open('You planted a Premium Sitrus Seed! It grows faster and gives more friendship.');
						return true;
					}
					if ((inv.oranSeeds || 0) > 0) {
						inv.oranSeeds -= 1;
						Inventory.save(inv);
						this.plants.push({ r: target.r, c: target.c, plantedAt: Date.now(), type: 'oran' });
						Plants.save(this.plants);
						this._refreshPlantSprites();
						Sound.plant();
						Dialog.open('You planted an Oran Seed!');
						return true;
					}
					if (inv.seeds <= 0) {
						Dialog.open('You have no seeds! Talk to the farmer or check the soil later.');
						return true;
					}
					inv.seeds -= 1;
					BerryCompost.applyOnPlant(inv);
					Inventory.save(inv);
					this.plants.push({ r: target.r, c: target.c, plantedAt: Date.now(), type: 'pecha' });
					Plants.save(this.plants);
					this._refreshPlantSprites();
					Sound.plant();
					return true;
				}
				if (target.kind === 'harvest') {
					const harvestPlant = this._findPlantAt(target.r, target.c);
					const berryType = (harvestPlant && harvestPlant.type) ? harvestPlant.type : 'pecha';
					const berryDef = BERRY_TYPES[berryType] || BERRY_TYPES.pecha;
					this.plants = this.plants.filter(p => !(p.r === target.r && p.c === target.c));
					inv.friendshipBerries = (inv.friendshipBerries || 0) + 1;
					// Track by berry type
					if (!inv.berryTypes) inv.berryTypes = {};
					inv.berryTypes[berryType] = (inv.berryTypes[berryType] || 0) + 1;
					let replantMsg = '';
					if ((inv.premiumSeeds || 0) > 0) {
						inv.premiumSeeds -= 1;
						this.plants.push({ r: target.r, c: target.c, plantedAt: Date.now(), type: 'sitrus', premium: true });
						replantMsg = ' A Premium Sitrus Seed was replanted.';
					} else if ((inv.oranSeeds || 0) > 0) {
						inv.oranSeeds -= 1;
						this.plants.push({ r: target.r, c: target.c, plantedAt: Date.now(), type: 'oran' });
						replantMsg = ' An Oran Seed was replanted.';
					} else if ((inv.seeds || 0) > 0) {
						inv.seeds -= 1;
						this.plants.push({ r: target.r, c: target.c, plantedAt: Date.now(), type: 'pecha' });
						replantMsg = ' A fresh seed was replanted automatically.';
					}
					Plants.save(this.plants);
					Inventory.save(inv);
					this._refreshPlantSprites();
					Sound.harvest();
					Stats.increment('totalHarvests');
					DailyQuests.increment('harvest');
					TrainerLevel.addXP('harvest');
					Achievements.increment('berryFarmer');
					Dialog.open('You harvested a ' + berryDef.label + '! (+' + berryDef.friendship + ' friendship)' + replantMsg);
					return true;
				}
				if (target.kind === 'growing') {
					Dialog.open(target.message);
					return true;
				}
				return false;
			}

			_scytheSwing() {
				const inv = Inventory.load();
				if (!inv.hasScythe || !inv.scytheEquipped) return false;
				const ptc = Math.floor(this.player.x / TILE);
				const ptr = Math.floor(this.player.y / TILE);
				const ripe = this.plants.filter(p => {
					if (Math.abs(p.r - ptr) + Math.abs(p.c - ptc) > SCYTHE_RADIUS) return false;
					return (Date.now() - p.plantedAt) >= getEffectiveGrowMs();
				});
				if (ripe.length === 0) {
					Dialog.open('You swing the scythe, but there’s nothing ripe nearby.');
					Sound.scythe && Sound.scythe();
					return true;
				}
				const ripeSet = new Set(ripe.map(p => p.r + ',' + p.c));
				this.plants = this.plants.filter(p => !ripeSet.has(p.r + ',' + p.c));
				let replanted = 0;
				for (const p of ripe) {
					if ((inv.seeds || 0) > 0) {
						inv.seeds -= 1;
						this.plants.push({ r: p.r, c: p.c, plantedAt: Date.now() });
						replanted += 1;
					}
				}
				inv.friendshipBerries = (inv.friendshipBerries || 0) + ripe.length;
				Plants.save(this.plants);
				Inventory.save(inv);
				this._refreshPlantSprites();
				Sound.scythe && Sound.scythe();
				Sound.harvest();
				Stats.increment('totalHarvests', ripe.length);
				const extra = replanted > 0 ? ' (' + replanted + ' replanted)' : '';
				Dialog.open('Scythe sweep! Harvested ' + ripe.length + ' berries' + extra + '.');
				return true;
			}

			_ensureFollowerSprite(form, onReady) {
				if (!form.url) { onReady(); return; }

				// --- Cached-texture path ---
				if (this.textures.exists(form.sheet)) {
					const tex  = this.textures.get(form.sheet);
					const src  = tex.source && tex.source[0];
					const f0   = tex.frames && (tex.frames['0'] || tex.frames[0]);
					const cachedH = f0 ? (f0.realHeight || f0.height || f0.cutHeight || 0) : 0;
					const srcH    = src ? src.height : 0;
					// Default assumes 8 rows; if this dex has an explicit override,
					// trust its frameH so the stale check doesn't wrongly invalidate.
					const expectedH = PMD_FRAME_OVERRIDES[form.dex]
						? PMD_FRAME_OVERRIDES[form.dex].frameH
						: (srcH > 0 ? Math.round(srcH / 8) : 0);

					// If we can verify the dims and they look correct, reuse the texture.
					if (cachedH > 0 && expectedH > 0 && cachedH === expectedH) {
						// Patch form dims from the cached texture so _switchFollower is consistent.
						const cachedW = f0 ? (f0.realWidth || f0.width || f0.cutWidth || cachedH) : cachedH;
						// Also verify frameW using the same smallest-frameW algorithm so a stale
						// texture loaded with the old "preferred col count" detector is invalidated.
						let expectedW = cachedW;
						if (src && src.width) {
							const _sw = [24, 28, 32, 36, 40, 48, 56, 64];
							for (const w of _sw) {
								if (src.width % w === 0) {
									const c = src.width / w;
									if (c >= 3 && c <= 10) { expectedW = w; break; }
								}
							}
							if (PMD_FRAME_OVERRIDES[form.dex]) expectedW = PMD_FRAME_OVERRIDES[form.dex].frameW;
						}
						if (cachedW !== expectedW) {
							// frameW mismatch — stale texture from old detector; fall through to re-fetch.
							console.warn('[Camp] Stale frameW for', form.sheet,
								'— expected', expectedW, 'got', cachedW, '; reloading.');
							this.textures.remove(form.sheet);
						} else {
							form.frameH = cachedH;
							form.frameW = cachedW;
							form.cols   = src ? Math.round(src.width / cachedW) : (form.cols || 4);
							// (Re)compute scale — may be missing if this is the first switch this session.
							if (form.dex && POKEMON_HEIGHTS[form.dex]) {
								const targetVis = 35 * Math.sqrt(POKEMON_HEIGHTS[form.dex] / 1.7);
								form.scale = Math.min(1.1, Math.max(0.40, targetVis / cachedH));
							}
							onReady();
							return;
						}
					}

					// Dims don't match (stale texture from a previous buggy load) — destroy and re-fetch.
					console.warn('[Camp] Stale texture', form.sheet,
						'— expected frameH', expectedH, 'got', cachedH, '; reloading.');
					this.textures.remove(form.sheet);
					// Also purge stale anims keyed to this sheet so they get rebuilt.
					const prefix = (typeof this.followerForm === 'number'
						? this.followerForm : String(form.sheet).replace('pmd-', ''));
					['walk-south','walk-west','walk-north','walk-east'].forEach(s => {
						const k = prefix + '-' + s;
						if (this.anims.exists(k)) this.anims.remove(k);
					});
				}

				// --- Fresh load ---
				// Fetch off the render loop via native Image — no this.load.start() stutter.
				const img = new window.Image();
				img.crossOrigin = 'anonymous';
				img.onload = () => {
					// Schedule the texture work at the start of the next Phaser game step
					// so it never lands mid-frame and causes a visible hitch.
					this.game.events.once('step', () => {
						if (!this.textures.exists(form.sheet)) {
							// Auto-detect frame dimensions from actual image dimensions.
							// PMD Walk-Anim always has exactly 8 rows (8 directions).
							let frameH = Math.round(img.naturalHeight / 8);
							// Pick the SMALLEST standard frameW that divides the sheet width
							// evenly and gives a column count in [3..10].  Smallest frameW =
							// most frames per direction = correct for PMD SpriteCollab, which
							// uses 4, 6, or 8 walk frames depending on the species.
							// (Old "preferred col count" approach wrongly detected frameW=48/cols=4
							// for sheets that are 192 px wide with 8 frames of 24 px each.)
							const stdW = [24, 28, 32, 36, 40, 48, 56, 64];
							let frameW = 0, cols = 0;
							for (const w of stdW) {
								if (img.naturalWidth % w === 0) {
									const c = img.naturalWidth / w;
									if (c >= 3 && c <= 10) { frameW = w; cols = c; break; }
								}
							}
							// Fallback: use frameH as frame width if nothing matched.
							if (!frameW) {
								frameW = frameH;
								cols = Math.max(3, Math.round(img.naturalWidth / frameW));
							}
							// Explicit override for sheets the detector can't resolve.
							if (PMD_FRAME_OVERRIDES[form.dex]) {
								const ov = PMD_FRAME_OVERRIDES[form.dex];
								frameW = ov.frameW; frameH = ov.frameH; cols = ov.cols;
							}
							// Patch the shared form object so _switchFollower reads correct dims.
							form.frameW = frameW; form.frameH = frameH; form.cols = cols;
							// Compute proportional scale from Pokédex height vs trainer.
							// Trainer ≈ 38px frame × 0.75 scale = 28.5 world-px (raised to 35 for better visibility).
							// sqrt(h/1.7): Pikachu(0.4m)→60%, Charizard(1.7m)→100%, Snorlax(2.1m)→111%.
							if (form.dex && POKEMON_HEIGHTS[form.dex]) {
								const targetVis = 35 * Math.sqrt(POKEMON_HEIGHTS[form.dex] / 1.7);
								form.scale = Math.min(1.1, Math.max(0.40, targetVis / frameH));
							}
							this.textures.addSpriteSheet(form.sheet, img, { frameWidth: frameW, frameHeight: frameH });
						}
						onReady();
					});
				};
				img.onerror = () => {
					console.warn('[Camp] Failed to load PMD sprite:', form.url);
					onReady(); // fall back gracefully — keeps current follower
				};
				img.src = form.url;
			}

			_switchFollower(formKey, opts = {}) {
				// Prevent stacking concurrent loads (e.g. rapid picker taps).
				if (this._followerLoading) return;
				this._followerLoading = true;
				// formKey may be a slotted string like "129:2" — extract the dex ID for form lookup.
				const dexId = dexFromKey(formKey);
				const form = FOLLOWER_FORMS[dexId] || FOLLOWER_FORMS.eevee;
				this._ensureFollowerSprite(form, () => {
					this._followerLoading = false;
					// Read cols AFTER _ensureFollowerSprite may have patched form.cols
					// (previously cols was captured before the async load — caused wrong frame slicing).
					const cols = form.cols || 4;
					const rowFrames = (row) => Array.from({ length: cols }, (_, i) => row * cols + i);
					// Animation keys are shared across all instances of the same species.
					const animPrefix = animPrefixFromKey(formKey);
					const animDefs = [
						[animPrefix + '-walk-south', rowFrames(0), 0],
						[animPrefix + '-walk-west',  rowFrames(6), 6 * cols],
						[animPrefix + '-walk-north', rowFrames(4), 4 * cols],
						[animPrefix + '-walk-east',  rowFrames(2), 2 * cols],
					];
					// Always destroy and recreate anims — they may have been built with
					// wrong cols if the texture was previously stale (e.g. 6 cols → 4 cols).
					for (const [key, frames] of animDefs) {
						if (this.anims.exists(key)) this.anims.remove(key);
						this.anims.create({ key, frameRate: 10, repeat: -1,
							frames: this.anims.generateFrameNumbers(form.sheet, { frames }) });
					}
					this.eeveeAnimKeys = animDefs.map(([k]) => k);
					this.eeveeIdleFrame = animDefs.map(([,,idle]) => idle);
					this.followerForm = formKey;
					if (this.follower) {
						this.follower.anims.stop();
						this.follower.setTexture(form.sheet, this.eeveeIdleFrame[this.followerDir || 0]);
						this.follower.setOrigin(0.5, form.originY);
						this.follower.setScale(form.scale * (this._followerScaleMult || 1));
					}
					// Reapply shiny tint (setTexture clears tint).
					if (this._applyFollowerShiny) this._applyFollowerShiny();
					if (!opts.silent) {
						// User-initiated switch: clear nickname for the new partner.
						try { localStorage.setItem(NICKNAME_KEY, ''); } catch {}
						const ni = document.getElementById('cpNickname');
						if (ni) ni.value = '';
						// Persist companion choice.
						const inv = Inventory.load();
						inv.companionForm = formKey;
						Inventory.save(inv);
						showToast(ico(ICO.npc) + ' ' + form.displayName + ' is walking with you!');
					}
					// Always update the label (shows nickname whether loading on start or switching).
					if (this._updateFollowerLabel) this._updateFollowerLabel();
				});
			}

			_updateInventoryHud() {
				const el = document.getElementById('campInventory');
				if (!el) return;
				const inv = Inventory.load();

				// Helper: one stat chip
				function chip(icoKey, colorKey, val) {
					return '<div class="hud-item">' +
						'<i class="bi bi-' + icoKey + ' hud-ico hud-ico--' + colorKey + '" aria-hidden="true"></i>' +
						'<span class="hud-val">' + val + '</span>' +
						'</div>';
				}
				function div() { return '<div class="hud-divider"></div>'; }

				let html = chip(ICO.seed, 'seed', inv.seeds || 0) +
					div() +
					chip(ICO.berry, 'berry', inv.friendshipBerries || 0) +
					div() +
					chip(ICO.token, 'token', inv.tokens || 0);

				// Friendship bar (only while still Eevee)
				const form = inv.eeveeForm || 'eevee';
				if (form === 'eevee') {
					const pct = Math.round(((inv.friendship || 0) / FRIENDSHIP_MAX) * 100);
					html += div() +
						'<div class="hud-item hud-friend">' +
							'<i class="bi bi-' + ICO.heart + ' hud-ico hud-ico--heart" aria-hidden="true"></i>' +
							'<div class="hud-friend-track" title="' + (inv.friendship||0) + ' / ' + FRIENDSHIP_MAX + '">' +
								'<div class="hud-friend-fill" style="width:' + pct + '%"></div>' +
							'</div>' +
						'</div>';
				}

				// Scythe indicator
				if (inv.hasScythe) {
					html += div() +
						chip(ICO.scythe, 'scythe', inv.scytheEquipped ? 'ON' : 'Q');
				}

				// Egg hatch progress
				const egg = EggSystem.status();
				if (egg) {
					const ePct = Math.round((egg.steps / EggSystem.HATCH_STEPS) * 100);
					html += div() +
						'<div class="hud-item hud-friend">' +
							'<i class="bi bi-' + ICO.egg + ' hud-ico hud-ico--egg" aria-hidden="true"></i>' +
							'<div class="hud-egg-track" title="' + egg.steps + ' / ' + EggSystem.HATCH_STEPS + ' steps">' +
								'<div class="hud-egg-fill" style="width:' + ePct + '%"></div>' +
							'</div>' +
						'</div>';
				}

				// Shiny counter
				const shinyCount = ShinyEncounters.getCount();
				html += div() +
					'<div class="hud-item">' +
						'<span class="hud-ico hud-ico--shiny" aria-hidden="true">✨</span>' +
						'<span class="hud-val">' + shinyCount + '</span>' +
					'</div>';

				// Partner mood
				const mood = PartnerMood.get(inv);
				html += div() +
					'<div class="hud-item" title="Partner mood: ' + mood + '">' +
						'<span style="font-size:14px">' + PartnerMood.emoji(mood) + '</span>' +
					'</div>';

				el.innerHTML = html;
			}

			_handleFeed() {
				const inv = Inventory.load();
				if (inv.eeveeForm && inv.eeveeForm !== 'eevee') {
					Dialog.open(inv.eeveeForm.charAt(0).toUpperCase() + inv.eeveeForm.slice(1) + ' looks up at you happily. (Already evolved!)');
					return;
				}
				if ((inv.friendshipBerries || 0) <= 0) {
					Dialog.open('Eevee looks hungry, but you have no Friendship Berries.');
					return;
				}
				inv.friendshipBerries -= 1;
				inv.friendship = Math.min(FRIENDSHIP_MAX, (inv.friendship || 0) + FRIENDSHIP_PER_BERRY);
				inv.lastBerryFed = Date.now();
				Inventory.save(inv);
				DailyQuests.increment('feed');
				if (inv.friendship >= FRIENDSHIP_MAX) {
					this._triggerEvolution();
				} else {
					Dialog.open('Eevee gobbled the berry! Friendship is now ' + inv.friendship + ' / ' + FRIENDSHIP_MAX + '.');
				}
			}

			_pickEvolutionForm() {
				// Held stone wins outright — picks Flareon/Jolteon/Leafeon and is
				// consumed on the next save (handled in _triggerEvolution).
				const inv = Inventory.load();
				if (inv.stone === 'fire')    return 'flareon';
				if (inv.stone === 'thunder') return 'jolteon';
				if (inv.stone === 'leaf')    return 'leafeon';
				if (inv.stone === 'ice')     return 'glaceon';
				if (inv.stone === 'shiny')   return 'sylveon';
				// No stone? Standing on tall grass also picks Leafeon, since the tile
				// itself acts as the 'mossy rock' equivalent.
				const ptc = Math.floor(this.player.x / TILE);
				const ptr = Math.floor(this.player.y / TILE);
				if (this.map[ptr] && this.map[ptr][ptc] === TTG) return 'leafeon';
				// Vaporeon if there's water within 4 tiles of the player.
				for (let dr = -4; dr <= 4; dr++) {
					for (let dc = -4; dc <= 4; dc++) {
						const row = this.map[ptr + dr];
						if (row && row[ptc + dc] === TH2O) return 'vaporeon';
					}
				}
				// Otherwise day/night picks between Espeon and Umbreon.
				const t = (performance.now() / 1000) % 360;
				const isNightish = t > 150 && t < 270;
				return isNightish ? 'umbreon' : 'espeon';
			}

			_triggerEvolution() {
				const newForm = this._pickEvolutionForm();
				const inv = Inventory.load();
				inv.eeveeForm = newForm;
				inv.friendship = FRIENDSHIP_MAX;
				inv.stone = null;  // stones are consumed on use
				Inventory.save(inv);
				Achievements.unlock('firstEvol');
				TrainerLevel.addXP('evolve');
				Sound.evolve();
				// Flash overlay for dramatic effect
				const flash = document.createElement('div');
				flash.style.cssText = 'position:fixed;inset:0;z-index:9999;background:white;opacity:0;pointer-events:none;transition:opacity 0.15s';
				document.body.appendChild(flash);
				setTimeout(() => { flash.style.opacity = '0.9'; }, 50);
				setTimeout(() => { flash.style.opacity = '0'; }, 300);
				setTimeout(() => { flash.style.opacity = '0.6'; }, 500);
				setTimeout(() => { flash.style.opacity = '0'; }, 700);
				setTimeout(() => { if (flash.parentNode) document.body.removeChild(flash); }, 1800);
				Dialog.open(newForm.charAt(0).toUpperCase() + newForm.slice(1) + ' is glowing! Press E to finish.');
				localStorage.setItem('campJustEvolved', newForm);
				const fade = document.getElementById('campFade');
				if (fade) fade.classList.remove('is-hidden');
				setTimeout(() => window.location.reload(), 1800);
			}

			_showCampfireMenu() {
				let panel = document.getElementById('campfireChoicePanel');
				if (!panel) {
					panel = document.createElement('div');
					panel.id = 'campfireChoicePanel';
					document.body.appendChild(panel);
					panel.addEventListener('pointerdown', e => { if(e.target===panel) panel.hidden=true; });
				}
				panel.hidden = false;
				panel.className = 'pk-backdrop';
				panel.innerHTML = '';
				const inner = document.createElement('div');
				inner.className = 'pk-modal pk-modal-sm';
				inner.style.textAlign = 'center';
				inner.innerHTML = '<div class="pk-modal-head"><span class="pk-modal-title">' + ico(ICO.fire) + ' CAMPFIRE</span>' +
					'<button id="campfireChoiceClose" class="pk-close" type="button">' + ico(ICO.close) + '</button></div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
				body.style.cssText = 'display:flex;flex-direction:column;gap:10px';

				const cookBtn = document.createElement('button');
				cookBtn.className = 'pk-btn pk-btn-sm pk-btn-full';
				cookBtn.style.cssText = 'background:linear-gradient(180deg,#ff9820,#cc6600);color:#fff';
				cookBtn.innerHTML = ico(ICO.curry) + ' Cook Curry';
				cookBtn.addEventListener('click', () => { panel.hidden = true; CurryCooking.open(); });

				const compostBtn = document.createElement('button');
				compostBtn.className = 'pk-btn pk-btn-green pk-btn-full pk-btn-sm';
				compostBtn.innerHTML = ico(ICO.compost) + ' Composting';
				compostBtn.addEventListener('click', () => { panel.hidden = true; BerryCompost.openPanel(); });

				const storyBtn = document.createElement('button');
				storyBtn.className = 'pk-btn pk-btn-gold pk-btn-full pk-btn-sm';
				storyBtn.innerHTML = ico(ICO.bookOpen) + ' Hear a Story';
				storyBtn.addEventListener('click', () => { panel.hidden = true; CampfireStories.open(); });

				const closeBtn2 = document.createElement('button');
				closeBtn2.className = 'pk-btn pk-btn-dark pk-btn-full pk-btn-sm';
				closeBtn2.textContent = 'Cancel';
				closeBtn2.addEventListener('click', () => { panel.hidden = true; });

				body.appendChild(cookBtn);
				body.appendChild(compostBtn);
				body.appendChild(storyBtn);
				body.appendChild(closeBtn2);
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.getElementById('campfireChoiceClose')?.addEventListener('click', () => { panel.hidden = true; });
			}

			showPrompt(label) {
				const el = document.getElementById('campPrompt');
				const lbl = document.getElementById('campPromptLabel');
				if (!el) return;
				if (!label || Dialog.isOpen()) { el.hidden = true; return; }
				if (lbl) lbl.textContent = label;
				el.hidden = false;
				// Anchor the prompt above the player's on-screen position,
				// clamped so it doesn't overlap the bottom touch controls.
				const cam = this.cameras.main;
				const sx = (this.player.x - cam.worldView.x) * cam.zoom;
				const sy = (this.player.y - cam.worldView.y) * cam.zoom;
				const maxTop = this.scale.height - 180;
				el.style.left = sx + 'px';
				el.style.top  = Math.min(sy, maxTop) + 'px';
				el.style.transform = 'translate(-50%, calc(-100% - 12px))';
			}

			updateRain() {
				if (!this.rainContainer) return;
				if (!this.isRaining) {
					if (this.raindrops.length === 0) return;
					// Let existing drops finish their fall after toggling off.
				}
				const vw = this.scale.width;
				const vh = this.scale.height;
				if (this.isRaining && this.tick % 1 === 0) {
					for (let i = 0; i < 3; i++) {
						const drop = this.add.rectangle(Math.random() * vw, -8, 1, 8, 0x88c0ff, 0.7);
						drop.setOrigin(0.5, 0);
						this.rainContainer.add(drop);
						this.raindrops.push({ obj: drop, vy: 18 + Math.random() * 8, vx: -2 });
					}
				}
				for (let i = this.raindrops.length - 1; i >= 0; i--) {
					const r = this.raindrops[i];
					r.obj.y += r.vy;
					r.obj.x += r.vx;
					if (r.obj.y > vh + 12) {
						r.obj.destroy();
						this.raindrops.splice(i, 1);
					}
				}
			}

			updateLeaves() {
				if (!this.leafContainer) return;
				const vw = this.scale.width;
				const vh = this.scale.height;
				if (this.tick % 90 === 0 && this.leaves.length < 10) {
					const colors = [0xD86820, 0xC04018, 0xE89000, 0x8C5A18];
					const col = colors[(Math.random() * colors.length) | 0];
					const leaf = this.add.rectangle(Math.random() * vw, -10, 4, 4, col, 0.85);
					leaf.setOrigin(0.5);
					leaf.angle = Math.random() * 360;
					this.leafContainer.add(leaf);
					this.leaves.push({
						obj: leaf,
						driftX: (Math.random() * 1.2 - 0.6),
						spin: (Math.random() * 4 - 2),
						sway: Math.random() * Math.PI * 2,
					});
				}
				for (let i = this.leaves.length - 1; i >= 0; i--) {
					const l = this.leaves[i];
					l.sway += 0.06;
					l.obj.x += l.driftX + Math.sin(l.sway) * 0.4;
					l.obj.y += 0.6;
					l.obj.angle += l.spin;
					if (l.obj.y > vh + 16) {
						l.obj.destroy();
						this.leaves.splice(i, 1);
					}
				}
			}

			updateSmoke() {
				if (!this.smokeContainer) return;
				// Chimney origin in world coords — matches the graphics block in create()
				const sx = 7*TILE + 8;
				const sy = 2*TILE + 2;
				if (this.tick % 18 === 0) {
					const puff = this.add.circle(sx + (Math.random()*2 - 1), sy, 3, 0xe0d6c0, 0.7);
					this.smokeContainer.add(puff);
					this.smoke.push({ obj: puff, life: 0, max: 80, drift: (Math.random()*0.6 - 0.3) });
				}
				for (let i = this.smoke.length - 1; i >= 0; i--) {
					const s = this.smoke[i];
					s.life++;
					const p = s.life / s.max;
					s.obj.x += s.drift;
					s.obj.y -= 0.4;
					s.obj.setRadius(3 + p * 4);
					s.obj.setAlpha((1 - p) * 0.7);
					if (s.life >= s.max) {
						s.obj.destroy();
						this.smoke.splice(i, 1);
					}
				}
			}

			_updateSeasonalParticles() {
				// Winter snowfall — small white flakes drifting down the screen
				const month = new Date().getMonth();
				if (month === 11 || month === 0 || month === 1) {
					if (!this._snowflakes) this._snowflakes = [];
					if (!this._snowContainer) {
						this._snowContainer = this.add.container(0,0).setDepth(5).setScrollFactor(0);
					}
					const vw = this.scale.width, vh = this.scale.height;
					if (this.tick % 12 === 0 && this._snowflakes.length < 30) {
						const flake = this.add.rectangle(Math.random()*vw, -6, 2, 2, 0xffffff, 0.7);
						flake.setOrigin(0.5);
						this._snowContainer.add(flake);
						this._snowflakes.push({ obj: flake, vy: 0.5 + Math.random()*0.6, vx: (Math.random()-0.5)*0.4, sway: Math.random()*Math.PI*2 });
					}
					for (let i = this._snowflakes.length - 1; i >= 0; i--) {
						const s = this._snowflakes[i];
						s.sway += 0.04;
						s.obj.x += s.vx + Math.sin(s.sway) * 0.3;
						s.obj.y += s.vy;
						if (s.obj.y > vh + 10) { s.obj.destroy(); this._snowflakes.splice(i,1); }
					}
				}
			}

			updateMinimap() {
				if (!this.minimapEl || !this._minimapCtx) return;
				const mctx = this._minimapCtx;
				// Blit static tile layer — O(1) per frame (vs O(tiles) before).
				if (this._minimapCache) {
					mctx.drawImage(this._minimapCache, 0, 0);
				} else {
					mctx.fillStyle = '#000';
					mctx.fillRect(0, 0, this.minimapEl.width, this.minimapEl.height);
				}
				// Player dot — bright yellow
				const px = Math.floor(this.player.x / TILE) * 3;
				const py = Math.floor(this.player.y / TILE) * 3;
				mctx.fillStyle = '#ffe040';
				mctx.fillRect(px - 1, py - 1, 5, 5);
				mctx.fillStyle = '#ffffff';
				mctx.fillRect(px, py, 3, 3);
			}

			onResize() {
				applyWrapTop();
				this.applyZoom();
			}

			applyZoom() {
				const W = this.scale.width;
				const H = this.scale.height;
				let s = Math.max(2, Math.floor(Math.min(W / 380, H / 240)));
				s = Math.min(s, 4);
				this.cameras.main.setZoom(s);
			}

			setupJoystick() {
				const base = document.getElementById('joystickBase');
				const knob = document.getElementById('joystickKnob');
				if (!base || !knob) return;
				// Re-bind the dpad each scene boot, but only attach DOM listeners once
				// so we don't stack handlers after camp↔house transitions.
				base.__campDpad = this.dpad;
				if (base.dataset.wired) return;
				base.dataset.wired = '1';
				const RADIUS = 42, DEAD = 0.18;
				let active = false, pointerId = null;

				function reset() {
					active = false; pointerId = null;
					const d = base.__campDpad;
					if (d) { d.up = d.down = d.left = d.right = false; }
					knob.style.transform = 'translate(-50%,-50%)';
				}
				function applyJoy(dx, dy) {
					const d = base.__campDpad;
					if (!d) return;
					const dist = Math.sqrt(dx*dx + dy*dy);
					const clamp = Math.min(dist, RADIUS);
					const nx = dist > 0 ? dx/dist : 0, ny = dist > 0 ? dy/dist : 0;
					knob.style.transform = `translate(calc(-50% + ${nx*clamp}px), calc(-50% + ${ny*clamp}px))`;
					const fx = dist > 0 ? dx/Math.max(dist, RADIUS) : 0;
					const fy = dist > 0 ? dy/Math.max(dist, RADIUS) : 0;
					d.left = fx < -DEAD; d.right = fx > DEAD;
					d.up   = fy < -DEAD; d.down  = fy > DEAD;
				}
				base.addEventListener('pointerdown', e => {
					if (active) return;
					active = true; pointerId = e.pointerId;
					base.setPointerCapture(e.pointerId);
					e.preventDefault();
					const r = base.getBoundingClientRect();
					applyJoy(e.clientX - r.left - r.width/2, e.clientY - r.top - r.height/2);
				});
				base.addEventListener('pointermove', e => {
					if (!active || e.pointerId !== pointerId) return;
					e.preventDefault();
					const r = base.getBoundingClientRect();
					applyJoy(e.clientX - r.left - r.width/2, e.clientY - r.top - r.height/2);
				});
				['pointerup','pointercancel'].forEach(ev => base.addEventListener(ev, e => {
					if (e.pointerId !== pointerId) return;
					e.preventDefault(); reset();
				}));
			}

			update() {
				this.tick++;
				// Freeze the scene the moment we've triggered a transition so we don't
				// keep updating the shared HUD/prompt DOM while HouseScene boots.
				if (this.didTransition) {
					this.player.setVelocity(0, 0);
					return;
				}
				// Freeze gameplay while any modal is open.
				if (Battle.isOpen() || Mart.isOpen() || Partner.isOpen()) {
					this.player.setVelocity(0, 0);
					this.player.anims.stop();
					this.player.setFrame(this.dirIdleFrame[this.dir]);
					return;
				}
				applyDayNight();
				Dialog.tick();

				// Shiny encounter update & 5-second spawn roll
				ShinyEncounters.update(this, this.tick);
				if (this.tick % 300 === 0) ShinyEncounters.tick5s(this);

				const dialogOpen = Dialog.isOpen();
				const k = this.keys, d = this.dpad;

				// Interaction prompt + E to read signs. When the dialog is open the player
				// freezes and E advances/closes the dialog instead of moving them.
				const target = this.findInteractTarget();
				this.showPrompt(target ? (target.label || (target.kind === 'door' ? 'Enter' : target.kind === 'npc' ? 'Talk' : 'Read')) : null);
				if ((k.partner && Phaser.Input.Keyboard.JustDown(k.partner) || TouchActions.consume('partner')) && !dialogOpen) {
					Partner.wire(this);
					Partner.open();
				}
				if (k.bonus && Phaser.Input.Keyboard.JustDown(k.bonus) && !dialogOpen) {
					if (Daily.ready()) {
						Daily.claim();
						Dialog.open('Daily bonus claimed! +20 Tokens, +1 Seed.');
					} else {
						Dialog.open('Daily bonus already claimed. Next one available in ' + Daily.hoursLeft() + 'h.');
					}
				}
				if (k.rain && Phaser.Input.Keyboard.JustDown(k.rain) && !dialogOpen) {
					const invR = Inventory.load();
					if (invR.pokeRadar) {
						this._radarActive = !this._radarActive;
						showToast(this._radarActive ? ico(ICO.radar) + ' Poké Radar ON — watch the grass!' : ico(ICO.radar) + ' Poké Radar OFF');
					} else {
						this.isRaining = !this.isRaining;
					}
				}
				// Radar shimmer update
				if (this._radarActive && this.tick % 90 === 0) {
					this._radarShimmer.clear();
					const grassTiles = [];
					for (let r=0;r<MAP_H;r++) for (let c=0;c<MAP_W;c++) if (this.map[r][c] === TTG) grassTiles.push([r,c]);
					const picks = Math.floor(Math.random()*3)+2;
					for (let i=0;i<picks && i<grassTiles.length;i++) {
						const idx = Math.floor(Math.random()*grassTiles.length);
						this._radarShimmer.add(grassTiles[idx][0]+','+grassTiles[idx][1]);
					}
				}
				if (k.scythe && Phaser.Input.Keyboard.JustDown(k.scythe) && !dialogOpen) {
					const inv = Inventory.load();
					if (!inv.hasScythe) {
						Dialog.open('You don’t own a Scythe yet. Buy one at Pikachu’s Mart!');
					} else {
						inv.scytheEquipped = !inv.scytheEquipped;
						Inventory.save(inv);
						Sound.equip && Sound.equip();
						Dialog.open(inv.scytheEquipped
							? '\u{1F33E} Scythe equipped. Press E near ripe crops to sweep the field.'
							: 'Scythe holstered.');
					}
				}
				if (Phaser.Input.Keyboard.JustDown(k.interact) || TouchActions.consume('interact')) {
					if (dialogOpen) Dialog.advance();
					else if (ShinyEncounters.checkInteract(this)) {
						ShinyEncounters.openCatchModal(this);
					}
					else if (Inventory.load().scytheEquipped && this._scytheSwing()) {
						/* scythe handled the input */
					}
					else if (target && target.kind === 'fish') {
						Fishing.start();
					}
					else if (target && (target.kind === 'plant' || target.kind === 'harvest' || target.kind === 'growing')) {
						this._handlePlantAction(target);
					}
					else if (target && target.kind === 'feed') {
						Partner.wire(this);
						Partner.open();
					}
					else if (target && target.kind === 'npc' && target.npcKind === 'mart') {
						Mart.open();
					}
					else if (target && target.kind === 'npc' && target.npcKind === 'quests') {
						DailyQuests.open();
					}
					else if (target && target.kind === 'npc' && target.npcKind === 'camper') {
						const camper = NpcCampers.getTodayCamper();
						NpcCampers.openDialog(camper.name);
					}
					else if (target && target.kind === 'npc' && target.npcKind === 'tutor') {
						MoveTutor.open();
					}
					else if (target && target.kind === 'fire') {
						// Campfire: offer Cook vs Story choice
						this._showCampfireMenu();
					}
					else if (target && target.kind === 'boulder') {
						const invB = Inventory.load();
						if (!invB.hasRockSmash) { Dialog.open('It\'s a large boulder. You need Rock Smash to break it!'); }
						else {
							this.map[target.r][target.c] = TG;
							// Rock Smash drops: chance of bonus items
							const rollDrop = Math.random();
							const invB2 = Inventory.load();
							invB2.tokens = (invB2.tokens||0) + 5;
							let dropMsg = 'Smashed! +5 ' + ico(ICO.token);
							if (rollDrop < 0.08) {
								// Rare: Fossil (Pokédex unlock for a fossil Pokémon)
								const fossils = [138,139,140,141,142]; // Omanyte, Omastar, Kabuto, Kabutops, Aerodactyl
								const fid = fossils[Math.floor(Math.random()*fossils.length)];
								Pokedex.markSeen(fid);
								invB2.tokens = (invB2.tokens||0) + 30;
								dropMsg = ico(ICO.fossil) + ' Fossil found! A ' + [,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','Omanyte','Omastar','Kabuto','Kabutops','Aerodactyl'][fid] + ' fossil! +30 ' + ico(ICO.token);
							} else if (rollDrop < 0.25) {
								// Uncommon: Shards
								invB2.tokens = (invB2.tokens||0) + 20;
								dropMsg = ico(ICO.gem) + ' Shard found! +20 ' + ico(ICO.token);
							} else if (rollDrop < 0.45) {
								// Common: Berry
								invB2.friendshipBerries = (invB2.friendshipBerries||0) + 1;
								dropMsg = ico(ICO.berry) + ' Berry hidden inside! +1 ' + ico(ICO.berry);
							}
							Inventory.save(invB2);
							showToast(dropMsg);
							Dialog.open(dropMsg + ' The path is clear.');
							TrainerLevel.addXP('harvest');
						}
					}
					else if (target && target.kind === 'radar') {
						this._radarShimmer.clear();
						window.__radarEncounter = true;
						Battle.start((won) => {
							window.__radarEncounter = false;
							Music.start('camp');
							if (won) { DailyQuests.increment('minigame'); TrainerLevel.addXP('battle'); }
						});
					}
					else if (target && target.message === '__mailbox__') {
						PostcardSystem.open();
					}
					else if (target && target.message === '__camprating__') {
						const stars = CampRating.calculate();
						const mult = CampRating.getAwayMultiplier();
						Dialog.open('Camp Rating: ' + '★'.repeat(stars) + '☆'.repeat(5-stars) + '\nAway reward bonus: +' + Math.round((mult-1)*100) + '%\nMore furniture, berries & Pokémon = higher stars!');
					}
					else if (target && target.message) Dialog.open(target.message);
					else if (target && target.kind === 'door' && !this.didTransition && this.armedForDoor) {
						this.didTransition = true;
						safeSceneStart(this, 'house', { from: 'camp' });
						return;
					}
				}

				let vx = 0, vy = 0;
				if (!dialogOpen) {
					if (k.up.isDown    || k.w.isDown || d.up)    { vy = -SPEED; this.dir = 2; }
					if (k.down.isDown  || k.s.isDown || d.down)  { vy =  SPEED; this.dir = 0; }
					if (k.left.isDown  || k.a.isDown || d.left)  { vx = -SPEED; this.dir = 1; }
					if (k.right.isDown || k.d.isDown || d.right) { vx =  SPEED; this.dir = 3; }
					if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
				}
				this.player.setVelocity(vx, vy);

				// Egg step counter
				if (Math.abs(vx) > 0 || Math.abs(vy) > 0) {
					this._eggStepAccum = (this._eggStepAccum || 0) + 1;
					if (this._eggStepAccum >= 8) { this._eggStepAccum = 0; EggSystem.stepUpdate(); }
				}

				// Surf: Vaporeon water-walk tint + current drift
				{
					const _ptile_r = Math.floor(this.player.y / TILE);
					const _ptile_c = Math.floor(this.player.x / TILE);
					const _ptile = this.map[_ptile_r] && this.map[_ptile_r][_ptile_c];
					const _isVaporeon = Inventory.load().eeveeForm === 'vaporeon';
					if (_ptile === TH2O && _isVaporeon) {
						this.player.setTint(0x88bbff);
						// Surfing current: gentle eastward drift when on water and idle
						if (vx === 0 && vy === 0) {
							this._surfDriftTick = (this._surfDriftTick || 0) + 1;
							if (this._surfDriftTick % 4 === 0) {
								this.player.x = Math.min(this.player.x + 0.5, MAP_W * TILE - TILE);
							}
						} else {
							this._surfDriftTick = 0;
						}
						// Hidden island discovery — reach the far east of the lake
						if (!this._surfDiscoveredIsland && _ptile_c >= 36 && _ptile_r >= 8 && _ptile_r <= 13) {
							this._surfDiscoveredIsland = true;
							const inv = Inventory.load();
							inv.tokens = (inv.tokens||0) + 25;
							inv.friendshipBerries = (inv.friendshipBerries||0) + 3;
							Inventory.save(inv);
							showToast(ico(ICO.water) + ' Hidden Cove discovered! +25 ' + ico(ICO.token) + ' +3 ' + ico(ICO.berry));
							Achievements.unlock('explorer');
							DailyQuests.increment('fish');
						}
					} else {
						this.player.clearTint();
						this._surfDriftTick = 0;
					}
				}

				// Sweep planting — while holding E and walking, auto-plant on each new
				// soil tile entered (one plant per tile, not per frame).
				if (!dialogOpen && k.interact && k.interact.isDown && (vx !== 0 || vy !== 0)) {
					const ptc = Math.floor(this.player.x / TILE);
					const ptr = Math.floor(this.player.y / TILE);
					const sweepKey = ptr + ',' + ptc;
					if (this._lastSweepTile !== sweepKey) {
						this._lastSweepTile = sweepKey;
						const tile = this.map[ptr] && this.map[ptr][ptc];
						if ((tile === TSO || tile === TCR) && !this._findPlantAt(ptr, ptc)) {
							const inv = Inventory.load();
							if ((inv.seeds || 0) > 0) {
								inv.seeds -= 1;
								Inventory.save(inv);
								this.plants.push({ r: ptr, c: ptc, plantedAt: Date.now() });
								Plants.save(this.plants);
								this._refreshPlantSprites();
								Sound.plant();
							}
						}
					}
				} else if (vx === 0 && vy === 0) {
					this._lastSweepTile = null;
				}

				const moving = vx !== 0 || vy !== 0;
				const animKey = this.dirAnimKeys[this.dir];
				if (moving) {
					if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== animKey) {
						this.player.anims.play(animKey, true);
					}
				} else {
					this.player.anims.stop();
					this.player.setFrame(this.dirIdleFrame[this.dir]);
				}

				const actx = this.animCtx;
				actx.clearRect(0, 0, MAP_W*TILE, MAP_H*TILE);
				for (const [r, c, t] of this.animatedCells) {
					drawTile(actx, t, c*TILE, r*TILE, this.tick);
				}
				this.animTex.refresh();
				this.updateSmoke();
				this.updateLeaves();
				this.updateRain();
				this._updateSeasonalParticles();
				this._updateInventoryHud();
				// Refresh plant visuals every 8 ticks so the ripe-berry bob animates smoothly.
				if (this.tick % 8 === 0) this._refreshPlantSprites();
				this.updateMinimap();


				// Radar sparkle graphics
				if (this._radarGfx) this._radarGfx.clear();
				if (this._radarActive && this._radarShimmer && this._radarShimmer.size > 0) {
					if (!this._radarGfx) this._radarGfx = this.add.graphics().setDepth(5);
					this._radarShimmer.forEach(key => {
						const [srStr, scStr] = key.split(',');
						const sr = parseInt(srStr), sc = parseInt(scStr);
						const pulse = Math.abs(Math.sin(this.tick * 0.08)) * 0.7 + 0.3;
						this._radarGfx.fillStyle(0xffffff, pulse);
						this._radarGfx.fillCircle(sc*TILE+8, sr*TILE+8, 4);
					});
				}

				// Trail mode: sample player position; follower lerps toward the oldest sample
				// so it lags ~1 sprite-width behind.
				// F key manually triggers face-off: routes the follower around to a tile
				// in front of the player so they look at each other.
				if (moving) {
					if (this.followerMode !== 'trail') {
						this.followerMode = 'trail';
						this.followerTarget = null;
						this.followerPath = null;
					}
					if (this.tick % 2 === 0) {
						this.followerHistory.push({ x: this.player.x, y: this.player.y });
						if (this.followerHistory.length > 8) this.followerHistory.shift();
					}
				}
				if ((Phaser.Input.Keyboard.JustDown(k.faceoff) || TouchActions.consume('faceoff')) && !dialogOpen && this.followerMode === 'trail') {
					this.followerMode = 'faceoff';
					this.followerHistory = [];
					const [dvx, dvy] = this.DIR_VEC[this.dir];
					const [pvx, pvy] = this.DIR_VEC[(this.dir + 1) % 4];
					this.followerPath = [
						{ x: this.player.x + pvx * TILE, y: this.player.y + pvy * TILE },
						{ x: this.player.x + dvx * TILE, y: this.player.y + dvy * TILE },
					];
					this.followerTarget = this.followerPath.shift();
				}

				const followTarget = this.followerMode === 'trail'
					? this.followerHistory[0]
					: this.followerTarget;
				if (followTarget) {
					const prevX = this.follower.x, prevY = this.follower.y;
					this.follower.x = Phaser.Math.Linear(this.follower.x, followTarget.x, 0.18);
					this.follower.y = Phaser.Math.Linear(this.follower.y, followTarget.y, 0.18);
					const fdx = this.follower.x - prevX;
					const fdy = this.follower.y - prevY;
					const fspeed = Math.hypot(fdx, fdy);
					if (fspeed > 0.15) {
						this._idleTicks = 0;
						if (this._idleEmoji) this._idleEmoji.hidden = true;
						const dir = Math.abs(fdx) > Math.abs(fdy)
							? (fdx > 0 ? 3 : 1)
							: (fdy > 0 ? 0 : 2);
						if (dir !== this.followerDir || !this.follower.anims.isPlaying) {
							this.follower.anims.play(this.eeveeAnimKeys[dir], true);
							this.followerDir = dir;
						}
					} else if (this.followerMode === 'faceoff' && this.followerPath && this.followerPath.length > 0) {
						// Arrived at the side waypoint — advance to the final face-off tile.
						this.followerTarget = this.followerPath.shift();
					} else {
						// Follower is idle — increment idle counter and handle breathe/sleep
						this._idleTicks = (this._idleTicks || 0) + 1;
						if (this._idleTicks === 180) {
							// 3s idle: subtle breathe animation using south frames 0,1
							const breatheKey = 'idle-breathe-' + this.followerForm;
							if (!this.anims.exists(breatheKey)) {
								const fc2 = FOLLOWER_FORMS[this.followerForm] || FOLLOWER_FORMS.eevee;
								this.anims.create({
									key: breatheKey,
									frames: [
										{ key: 'npc-camper', frame: 0 }, // placeholder safe default
										{ key: 'npc-camper', frame: 1 },
									],
									frameRate: 1,
									repeat: -1,
								});
								// Overwrite with real frames if sprite key is available
								const texKey = 'eevee-' + this.followerForm;
								if (this.textures.exists(texKey)) {
									this.anims.remove(breatheKey);
									this.anims.create({
										key: breatheKey,
										frames: this.anims.generateFrameNumbers(texKey, { frames: [0, 1] }),
										frameRate: 1,
										repeat: -1,
									});
								}
							}
							try { this.follower.anims.play(breatheKey, true); } catch(_) {}
						}
						if (this._idleTicks >= 480 && this._idleEmoji) {
							this._idleEmoji.hidden = false;
						}
						if (this.follower.anims.isPlaying && this._idleTicks < 180) this.follower.anims.stop();
						// Settled — face the player. In face-off mode that's the opposite of the
						// player's facing; in trail mode (rare: paused mid-trail) just orient at them.
						let faceDir;
						if (this.followerMode === 'faceoff') {
							faceDir = (this.dir + 2) % 4;
						} else {
							const ldx = this.player.x - this.follower.x;
							const ldy = this.player.y - this.follower.y;
							faceDir = Math.abs(ldx) + Math.abs(ldy) <= 4
								? this.followerDir
								: (Math.abs(ldx) > Math.abs(ldy) ? (ldx > 0 ? 3 : 1) : (ldy > 0 ? 0 : 2));
						}
						if (faceDir !== this.followerDir) {
							this.followerDir = faceDir;
							if (this._idleTicks < 180) this.follower.setFrame(this.eeveeIdleFrame[faceDir]);
						}
					}
					this.follower.setDepth(this.follower.y > this.player.y ? 3.5 : 2.5);
				}
				// Position the idle emoji above the follower (same way as nickname label)
				if (this.follower && this._idleEmoji && !this._idleEmoji.hidden) {
					const cam = this.cameras.main;
					const fc = FOLLOWER_FORMS[this.followerForm] || FOLLOWER_FORMS.eevee;
					const effectiveScale = fc.scale * (this._followerScaleMult ?? 1);
					const worldTop = this.follower.y - fc.originY * fc.frameH * effectiveScale;
					const fx = (this.follower.x - cam.worldView.x) * cam.zoom;
					const fy = (worldTop - cam.worldView.y) * cam.zoom - 20;
					this._idleEmoji.style.left = fx + 'px';
					this._idleEmoji.style.top  = fy + 'px';
				}
				// Position the HTML nickname label every frame so it tracks the
				// follower even when it's standing still (followTarget may be null).
				// Manually derive world-space sprite top from the form config so the
				// result is exact for every eeveelution and scale multiplier.
				if (this.follower && this._followerNameEl && !this._followerNameEl.hidden) {
					const cam = this.cameras.main;
					const fc = FOLLOWER_FORMS[this.followerForm] || FOLLOWER_FORMS.eevee;
					const effectiveScale = fc.scale * (this._followerScaleMult ?? 1);
					const worldTop = this.follower.y - fc.originY * fc.frameH * effectiveScale;
					const fx = (this.follower.x  - cam.worldView.x) * cam.zoom;
					const fy = (worldTop          - cam.worldView.y) * cam.zoom - 5;
					this._followerNameEl.style.left = fx + 'px';
					this._followerNameEl.style.top  = fy + 'px';
				}

				// Walk onto the door → enter the house. The player has to walk at least
				// two tiles away from the door before the entry trigger re-arms, so a
				// quick step-off-then-step-back-on doesn't re-fire (which would soft-
				// lock the player on the door tile after exiting the house).
				const tc = Math.floor(this.player.x / TILE);
				const tr = Math.floor(this.player.y / TILE);

				// Wild-encounter roll: only on a tile change AND only on tall grass.
				// 1/6 chance per fresh step into a tall-grass tile.
				const tileKey = tr + ',' + tc;
				if (tileKey !== this._lastTileKey) {
					this._lastTileKey = tileKey;
					if (this.map[tr] && this.map[tr][tc] === TTG && Math.random() < 1/6) {
						Battle.start((won) => {
							Music.start('camp');
							if (won) {
								const inv = Inventory.load();
								inv.friendshipBerries = (inv.friendshipBerries || 0) + 1;
								Inventory.save(inv);
							}
						});
					}
				}

				const onDoorTile = this.map[tr] && this.map[tr][tc] === TD;
				const distFromDoor = Math.abs(tr - 11) + Math.abs(tc - 11);
				if (distFromDoor >= 2) this.armedForDoor = true;
				if (this.armedForDoor && onDoorTile && !this.didTransition) {
					this.didTransition = true;
					safeSceneStart(this, 'house', { from: 'camp' });
				}

				// South-edge market exit — walk onto the road tile at the bottom of the
				// camp path (row MAP_H-1, col 11) to head to the Market Centre.
				const onSouthExit = tr === MAP_H - 1 && tc === 11;
				const distFromSouth = Math.abs((MAP_H - 1) - tr) + Math.abs(tc - 11);
				if (distFromSouth >= 2) this.armedForSouth = true;
				if (this.armedForSouth && onSouthExit && !this.didTransition) {
					this.didTransition = true;
					safeSceneStart(this, 'market', { from: 'camp' });
				}

				Debug.render(
					'CAMP\n' +
					'tile  ' + tc + ',' + tr + '\n' +
					'dir   ' + ['S','W','N','E'][this.dir] + '\n' +
					'distD ' + distFromDoor + '\n' +
					'onD   ' + onDoorTile + '\n' +
					'armed ' + this.armedForDoor + '\n' +
					'trans ' + this.didTransition + '\n' +
					'dlg   ' + dialogOpen + '\n' +
					'target ' + (target ? target.kind : '-') + '\n' +
					(Debug.lastError ? 'ERR ' + Debug.lastError : '')
				);
			}
		};
	}

	function makeHouseSceneClass() {
		return class HouseScene extends Phaser.Scene {
			constructor() { super({ key: 'house' }); }

			init(data) {
				// Consume any boot-hash from-data to keep parity with CampScene; the
				// house spawn is always one tile north of the exit door regardless.
				this.spawnFrom = (data && data.from) || consumeBootFrom('house') || null;
			}

			preload() {
				this.load.image('player-base', 'Pictures/sprites/calem.png');
			}

			create() {
				console.log('[HouseScene] create()');
				try {
					this._buildHouse();
					console.log('[HouseScene] create() ok — player at', this.player?.x, this.player?.y);
					requestAnimationFrame(() => requestAnimationFrame(() => {
						const f = document.getElementById('campFade');
						if (f) f.classList.add('is-hidden');
					}));
				} catch (e) {
					console.error('[HouseScene] create failed:', e);
					// Fall back to camp so the player isn't stranded on a black screen.
					this.scene.start('camp', { from: 'house' });
				}
				if (typeof window !== 'undefined') window.__houseScene = this;
			}

			_buildHouse() {
				this.tick = 0;
				this.map = buildHouseMap();
				const W = HOUSE_W * TILE, H = HOUSE_H * TILE;

				// House map is static — only build the texture the first time. Removing
				// and re-creating a canvas texture has caused null returns in Phaser 3
				// in some cases, leaving a black screen on the second entry.
				if (!this.textures.exists('houseBase')) {
					this.baseTex = this.textures.createCanvas('houseBase', W, H);
					if (!this.baseTex) {
						throw new Error('createCanvas("houseBase") returned null');
					}
					const baseCtx = this.baseTex.getContext();
					baseCtx.imageSmoothingEnabled = false;
					for (let r = 0; r < HOUSE_H; r++) {
						for (let c = 0; c < HOUSE_W; c++) {
							drawTile(baseCtx, this.map[r][c], c*TILE, r*TILE, 0);
						}
					}
					this.baseTex.refresh();
				} else {
					this.baseTex = this.textures.get('houseBase');
				}
				this.add.image(0, 0, 'houseBase').setOrigin(0).setDepth(0);

				// Palette-swap the trainer sheet — same pipeline as camp. Wrapped in
				// try/catch so a missing or half-loaded asset surfaces in the console
				// instead of silently producing a half-built scene.
				try {
					if (!this.textures.exists('player-base')) {
						throw new Error('player-base texture missing — Phaser loader did not cache calem.png');
					}
					const baseImg = this.textures.get('player-base').getSourceImage();
					const pw = baseImg.width, ph = baseImg.height;
					this._playerCanvas = document.createElement('canvas');
					this._playerCanvas.width = pw;
					this._playerCanvas.height = ph;
					this._playerCtx = this._playerCanvas.getContext('2d');
					const applyPalette = () => {
						if (window.TrainerPalette) {
							window.TrainerPalette.recolor(baseImg, window.TrainerPalette.load(), this._playerCtx, window.TrainerPalette.loadBody && window.TrainerPalette.loadBody());
						} else {
							this._playerCtx.clearRect(0, 0, pw, ph);
							this._playerCtx.drawImage(baseImg, 0, 0);
						}
					};
					applyPalette();
				} catch (e) {
					console.error('[HouseScene] palette swap failed:', e);
				}
				// Skip-if-exists: addSpriteSheet on a duplicate key returns null in
				// Phaser 3, which would later crash anim creation. The palette is
				// re-applied to this._playerCanvas above, but the texture keeps the
				// same source-canvas reference for the lifetime of the session.
				if (!this.textures.exists('player-house') && this._playerCanvas) {
					this.textures.addSpriteSheet('player-house', this._playerCanvas, { frameWidth: 22, frameHeight: 38 });
				} else if (this.textures.exists('player-house')) {
					this.textures.get('player-house').refresh();
				}
				this._onStorage = (e) => {
					if ((e.key === 'pokequiz_trainer_palette' || e.key === 'pokequiz_trainer_body') && window.TrainerPalette) {
						applyPalette();
						this.textures.get('player-house').refresh();
					}
				};
				window.addEventListener('storage', this._onStorage);
				this.events.once('shutdown', () => window.removeEventListener('storage', this._onStorage));

				const mkAnim = (key, frames) => {
					if (this.anims.exists(key)) this.anims.remove(key);
					this.anims.create({ key, frameRate: 6, repeat: -1,
						frames: this.anims.generateFrameNumbers('player-house', { frames }) });
				};
				mkAnim('h-walk-south', [1, 0, 2, 0]);
				mkAnim('h-walk-west',  [4, 3, 5, 3]);
				mkAnim('h-walk-north', [7, 6, 8, 6]);
				mkAnim('h-walk-east',  [10, 9, 11, 9]);

				// Spawn position depends on where we came from:
				// - from upstairs → land one tile south of the in-house stairs, facing south
				// - default       → one tile north of the exit door, facing north
				const fromUp = this.spawnFrom === 'upstairs';
				const spawnX = fromUp
					? HOUSE_STAIRS_C*TILE + TILE/2
					: HOUSE_DOOR_C*TILE + TILE/2;
				const spawnY = fromUp
					? HOUSE_STAIRS_R*TILE + TILE/2
					: (HOUSE_DOOR_R - 1)*TILE + TILE/2;
				this.player = this.physics.add.sprite(spawnX, spawnY, 'player-house', 0);
				this.player.setOrigin(0.5, 36/38);
				this.player.setScale(0.75);
				this.player.setDepth(3);
				this.player.body.setSize(10, 6);
				this.player.body.setOffset((22-10)/2, 38-8);

				this.solids = this.physics.add.staticGroup();
				for (let r = 0; r < HOUSE_H; r++) {
					for (let c = 0; c < HOUSE_W; c++) {
						if (SOLID.has(this.map[r][c])) {
							const rect = this.add.rectangle(c*TILE + TILE/2, r*TILE + TILE/2, TILE, TILE);
							this.physics.add.existing(rect, true);
							this.solids.add(rect);
						}
					}
				}
				this.physics.add.collider(this.player, this.solids);

				this.physics.world.setBounds(0, 0, W, H);
				this.player.setCollideWorldBounds(true);
				// Interior is a fixed room — keep the camera centered on it instead of
				// following the player. Use very large bounds so centerOn can produce
				// negative scroll when the viewport is bigger than the room without
				// being clamped to zero.
				this.cameras.main.setBounds(-4000, -4000, 8000, 8000);
				const _houseWp = (Inventory.load().cosmetics?.wallpaper) || 'default';
				this.cameras.main.setBackgroundColor(WALLPAPER_BG[_houseWp]?.house || '#1a0e08');
				// Pre-create ground floor item overlays — pixel-art sprites built from
				// FURNITURE_DESIGNS, registered as Phaser canvas textures.
				const _houseRoomInv = Inventory.load();
				const _housePlacements = _houseRoomInv.cosmetics?.housePlacements || {};
				this._roomItemObjs = {};
				Object.entries(HOUSE_ITEMS).forEach(([key, item]) => {
					const pos = _housePlacements[key];
					const x = (pos ? pos.c : item.c) * TILE + TILE / 2;
					const y = (pos ? pos.r : item.r) * TILE + TILE / 2;
					// Use a house-scoped sprite key so the same "plant" id can have
					// different art for the upstairs vs ground-floor scene.
					const texKey = 'furniture-house-' + key;
					if (!this.textures.exists(texKey)) {
						const designKey = (key === 'plant') ? 'floorplant' : key;
						const canvas = (SPRITE_DEFS[designKey] || FURNITURE_DESIGNS[designKey])
							? FurnitureSprites.get(designKey) : null;
						if (canvas) this.textures.addCanvas(texKey, canvas);
					}
					const obj = this.textures.exists(texKey)
						? this.add.image(x, y, texKey).setOrigin(0.5).setDepth(2).setVisible(!!pos)
						: this.add.text(x, y, item.label ? item.label.slice(0,3) : '?', { fontSize: '8px', resolution: 2 })
							.setOrigin(0.5).setDepth(2).setVisible(!!pos);
					this._roomItemObjs[key] = obj;
				});
				// Grid overlay + ghost for tile-snap placement mode.
				this._gridGraphics = this.add.graphics().setDepth(10);
				this._gridGhost = this.add.text(0, 0, '', { fontSize: '14px', resolution: 2 })
					.setOrigin(0.5).setDepth(11).setAlpha(0.7).setVisible(false);
				this.input.on('pointerdown', (pointer) => {
					const gm = window.__gridMode;
					if (!gm?.active || gm.sceneKey !== 'house') return;
					const tc = Math.floor(pointer.worldX / TILE);
					const tr = Math.floor(pointer.worldY / TILE);
					if (tc <= 0 || tr <= 0 || tc >= HOUSE_W - 1 || tr >= HOUSE_H - 1) return;
					if (SOLID.has(this.map[tr]?.[tc])) return;
					RoomEditor.confirmPlace(tr, tc);
				});
				this.input.on('pointermove', (pointer) => {
					const gm = window.__gridMode;
					if (!gm?.active || gm.sceneKey !== 'house') return;
					gm.hoverR = Math.floor(pointer.worldY / TILE);
					gm.hoverC = Math.floor(pointer.worldX / TILE);
				});
				this.events.once('shutdown', () => {
					if (window.__gridMode) window.__gridMode.active = false;
				});
				RoomEditor.showEditBtn(true, 'house');
				this.events.once('shutdown', () => { RoomEditor.showEditBtn(false); });

				this.cameras.main.setRoundPixels(true);
				this.applyZoom();
				this.scale.on('resize', this.onResize, this);
				this.events.once('shutdown', () => this.scale.off('resize', this.onResize, this));

				_sceneKeyboard = this.input.keyboard;
				this.keys = this.input.keyboard.addKeys({
					up: Phaser.Input.Keyboard.KeyCodes.UP,
					down: Phaser.Input.Keyboard.KeyCodes.DOWN,
					left: Phaser.Input.Keyboard.KeyCodes.LEFT,
					right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
					w: Phaser.Input.Keyboard.KeyCodes.W,
					a: Phaser.Input.Keyboard.KeyCodes.A,
					s: Phaser.Input.Keyboard.KeyCodes.S,
					d: Phaser.Input.Keyboard.KeyCodes.D,
					interact: Phaser.Input.Keyboard.KeyCodes.E,
				});
				this.dpad = { up:false, down:false, left:false, right:false };
				this.setupJoystick();
				setupPauseMenu(this.game);
				Music.start('house');
				this.events.once('shutdown', () => Music.stop());

				// fromUp: face south (just walked down stairs); else face north (just came in from outside)
				this.dir = fromUp ? 0 : 2;
				this.dirAnimKeys = ['h-walk-south', 'h-walk-west', 'h-walk-north', 'h-walk-east'];
				this.dirIdleFrame = [0, 3, 6, 9];
				this.player.setFrame(this.dirIdleFrame[this.dir]);
				this.didTransition = false;
				// When entering from outside, the player spawns one tile north of the
				// door — start armed so a single step south exits. When coming down
				// the stairs, the player spawns far from the door, so being armed is fine.
				this.armedForExit = true;
				// Track stairs re-arming so the spawn-tile-after-coming-down doesn't
				// instantly send the player back up.
				this.armedForStairs = !fromUp;

				// Cache prompt DOM refs once per scene boot.
				this._promptEl  = document.getElementById('campPrompt');
				this._promptLbl = document.getElementById('campPromptLabel');
				this.events.once('shutdown', () => {
					if (this._promptEl) this._promptEl.hidden = true;
				});
			}

			onResize() {
				applyWrapTop();
				this.applyZoom();
			}

			applyZoom() {
				const vw = this.scale.width;
				const vh = this.scale.height;
				// Phaser's RESIZE mode can fire onResize before layout settles, leaving
				// vw/vh at 0 on the very first call. Bail and re-try on the next tick.
				if (vw <= 0 || vh <= 0) {
					this.events.once('postupdate', () => this.applyZoom());
					return;
				}
				const roomW = HOUSE_W * TILE;
				const roomH = HOUSE_H * TILE;
				// Pick the largest integer zoom that still fits the whole room in view.
				let s = Math.min(vw / roomW, vh / roomH);
				s = Math.max(2, Math.floor(s));
				s = Math.min(s, 5);
				const cam = this.cameras.main;
				cam.setZoom(s);
				// centerOn computes scrollX/Y so the world point at (x, y) sits at the
				// middle of the viewport. With the large camera bounds set in create()
				// the resulting scroll won't be clamped if the viewport is bigger than
				// the room.
				cam.centerOn(roomW / 2, roomH / 2);
			}

			setupJoystick() {
				const base = document.getElementById('joystickBase');
				const knob = document.getElementById('joystickKnob');
				if (!base || !knob) return;
				// Joystick handlers attach once across all scene boots — only the dpad
				// reference is swapped so it always points at the current scene's state.
				base.__campDpad = this.dpad;
				if (base.dataset.wired) return;
				base.dataset.wired = '1';
				const RADIUS = 42, DEAD = 0.18;
				let active = false, pointerId = null;
				const reset = () => {
					active = false; pointerId = null;
					const d = base.__campDpad;
					if (d) { d.up = d.down = d.left = d.right = false; }
					knob.style.transform = 'translate(-50%,-50%)';
				};
				const applyJoy = (dx, dy) => {
					const d = base.__campDpad;
					if (!d) return;
					const dist = Math.sqrt(dx*dx + dy*dy);
					const clamp = Math.min(dist, RADIUS);
					const nx = dist > 0 ? dx/dist : 0, ny = dist > 0 ? dy/dist : 0;
					knob.style.transform = `translate(calc(-50% + ${nx*clamp}px), calc(-50% + ${ny*clamp}px))`;
					const fx = dist > 0 ? dx/Math.max(dist, RADIUS) : 0;
					const fy = dist > 0 ? dy/Math.max(dist, RADIUS) : 0;
					d.left = fx < -DEAD; d.right = fx > DEAD;
					d.up   = fy < -DEAD; d.down  = fy > DEAD;
				};
				base.addEventListener('pointerdown', e => {
					if (active) return;
					active = true; pointerId = e.pointerId;
					base.setPointerCapture(e.pointerId);
					e.preventDefault();
					const r = base.getBoundingClientRect();
					applyJoy(e.clientX - r.left - r.width/2, e.clientY - r.top - r.height/2);
				});
				base.addEventListener('pointermove', e => {
					if (!active || e.pointerId !== pointerId) return;
					e.preventDefault();
					const r = base.getBoundingClientRect();
					applyJoy(e.clientX - r.left - r.width/2, e.clientY - r.top - r.height/2);
				});
				['pointerup','pointercancel'].forEach(ev => base.addEventListener(ev, e => {
					if (e.pointerId !== pointerId) return;
					e.preventDefault(); reset();
				}));
			}

			_tickGrid() {
				const gm = window.__gridMode;
				const g = this._gridGraphics;
				const ghost = this._gridGhost;
				if (!g) return;
				g.clear();
				if (!gm?.active || gm.sceneKey !== 'house') {
					if (ghost) ghost.setVisible(false);
					return;
				}
				g.lineStyle(0.5, 0xffffff, 0.18);
				for (let r = 1; r < HOUSE_H; r++) {
					g.moveTo(TILE, r * TILE); g.lineTo((HOUSE_W - 1) * TILE, r * TILE);
				}
				for (let c = 1; c < HOUSE_W; c++) {
					g.moveTo(c * TILE, TILE); g.lineTo(c * TILE, (HOUSE_H - 1) * TILE);
				}
				g.strokePath();
				const hr = gm.hoverR ?? -1, hc = gm.hoverC ?? -1;
				if (hr > 0 && hc > 0 && hr < HOUSE_H - 1 && hc < HOUSE_W - 1) {
					const solid = SOLID.has(this.map[hr]?.[hc]);
					const canPlace = !solid;
					g.fillStyle(canPlace ? 0x88ffaa : 0xff5555, 0.3);
					g.fillRect(hc * TILE, hr * TILE, TILE, TILE);
					g.lineStyle(1, canPlace ? 0x88ffaa : 0xff5555, 0.8);
					g.strokeRect(hc * TILE, hr * TILE, TILE, TILE);
					if (ghost && gm.key) {
						const item = HOUSE_ITEMS[gm.key];
						if (item && canPlace) {
							ghost.setText(item.label ? item.label.slice(0,3) : '?');
							ghost.setPosition(hc * TILE + TILE / 2, hr * TILE + TILE / 2);
							ghost.setAngle((gm.rot || 0) * 90);
							ghost.setVisible(true);
						} else { ghost.setVisible(false); }
					}
				} else {
					if (ghost) ghost.setVisible(false);
				}
			}

			update() {
				this.tick++;
				this._tickGrid();
				// If we've already triggered the exit, freeze the scene so we don't
				// keep writing to shared DOM elements (prompt/HUD) on top of CampScene
				// while the queued transition is still processing.
				if (this.didTransition) {
					this.player.setVelocity(0, 0);
					return;
				}
				applyDayNight();
				Dialog.tick();
				const dialogOpen = Dialog.isOpen();
				const k = this.keys, d = this.dpad;
				let vx = 0, vy = 0;
				if (!dialogOpen) {
					if (k.up.isDown    || k.w.isDown || d.up)    { vy = -SPEED; this.dir = 2; }
					if (k.down.isDown  || k.s.isDown || d.down)  { vy =  SPEED; this.dir = 0; }
					if (k.left.isDown  || k.a.isDown || d.left)  { vx = -SPEED; this.dir = 1; }
					if (k.right.isDown || k.d.isDown || d.right) { vx =  SPEED; this.dir = 3; }
					if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
				}
				this.player.setVelocity(vx, vy);

				const moving = vx !== 0 || vy !== 0;
				const animKey = this.dirAnimKeys[this.dir];
				if (moving) {
					if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== animKey) {
						this.player.anims.play(animKey, true);
					}
				} else {
					this.player.anims.stop();
					this.player.setFrame(this.dirIdleFrame[this.dir]);
				}

				const tc = Math.floor(this.player.x / TILE);
				const tr = Math.floor(this.player.y / TILE);
				const onDoor = tc === HOUSE_DOOR_C && tr === HOUSE_DOOR_R;
				// Walking onto the stairs tile (TST) sends you upstairs. Stair-distance
				// gating mirrors door-exit: must step ≥2 tiles away once before the
				// stairs can trigger, so a from-upstairs spawn doesn't bounce back up.
				const onStairs = this.map[tr] && this.map[tr][tc] === TST;
				// Rectangle distance to the stair block (rows 1-2, cols 12-13) so
				// approaching from any direction arms correctly, not just from row 2.
				const stairMinR = 1, stairMaxR = 2, stairMinC = HOUSE_STAIRS_C, stairMaxC = HOUSE_STAIRS_C + 1;
				const distStairs =
					Math.max(0, stairMinR - tr, tr - stairMaxR) +
					Math.max(0, stairMinC - tc, tc - stairMaxC);
				if (distStairs >= 2) this.armedForStairs = true;
				if (onStairs && this.armedForStairs && !this.didTransition) {
					this.didTransition = true;
					safeSceneStart(this, 'upstairs', { from: 'house' });
					return;
				}
				// Require at least two tiles of distance before re-arming so a quick
				// step-onto-the-door right after spawn doesn't bounce the player back
				// to camp. Same shape as CampScene's armedForDoor logic.
				const distFromDoor = Math.abs(tr - HOUSE_DOOR_R) + Math.abs(tc - HOUSE_DOOR_C);
				if (distFromDoor >= 2) this.armedForExit = true;

				// Show the interaction prompt + E-key exit when standing right next to
				// the door. The prompt sits above the player on-screen.
				const pe = this._promptEl;
				const lbl = this._promptLbl;
				const nearDoor = distFromDoor === 1 || onDoor;
				if (pe && lbl) {
					if (nearDoor && !dialogOpen) {
						lbl.textContent = 'Exit';
						pe.hidden = false;
						const cam = this.cameras.main;
						const sx = (this.player.x - cam.worldView.x) * cam.zoom;
						const sy = (this.player.y - cam.worldView.y) * cam.zoom;
						const maxTop = this.scale.height - 180;
						pe.style.left = sx + 'px';
						pe.style.top  = Math.min(sy, maxTop) + 'px';
						pe.style.transform = 'translate(-50%, calc(-100% - 12px))';
					} else {
						pe.hidden = true;
					}
				}

				const ePressed = Phaser.Input.Keyboard.JustDown(k.interact) || TouchActions.consume('interact');

				// Pond fishing: if player stands on a tile where a pond is placed, E opens fishing
				if (ePressed && !dialogOpen) {
					const _pondInv = Inventory.load();
					const _pondPos = _pondInv.cosmetics?.housePlacements?.pond;
					if (_pondPos && _pondPos.r === tr && _pondPos.c === tc) {
						Fishing.start();
					}
				}

				const triggerExit = !this.didTransition && this.armedForExit && (
					onDoor || (ePressed && nearDoor)
				);
				if (triggerExit) {
					this.didTransition = true;
					if (pe) pe.hidden = true;
					safeSceneStart(this, 'camp', { from: 'house' });
				}

				Debug.render(
					'HOUSE\n' +
					'tile  ' + tc + ',' + tr + '\n' +
					'doorAt ' + HOUSE_DOOR_C + ',' + HOUSE_DOOR_R + '\n' +
					'pos   ' + Math.round(this.player.x) + ',' + Math.round(this.player.y) + '\n' +
					'dir   ' + ['S','W','N','E'][this.dir] + '\n' +
					'distD ' + distFromDoor + '\n' +
					'onD   ' + onDoor + '\n' +
					'near  ' + nearDoor + '\n' +
					'armed ' + this.armedForExit + '\n' +
					'trans ' + this.didTransition + '\n' +
					'E     ' + ePressed + '\n' +
					'trigE ' + triggerExit + '\n' +
					(Debug.lastError ? 'ERR ' + Debug.lastError : '')
				);
			}
		};
	}

	function makeUpstairsSceneClass() {
		return class UpstairsScene extends Phaser.Scene {
			constructor() { super({ key: 'upstairs' }); }

			init(data) {
				this.spawnFrom = (data && data.from) || consumeBootFrom('upstairs') || null;
			}

			preload() {
				this.load.image('player-base', 'Pictures/sprites/calem.png');
			}

			create() {
				console.log('[UpstairsScene] create()');
				try {
					this._buildUpstairs();
					console.log('[UpstairsScene] create() ok — player at', this.player?.x, this.player?.y);
					requestAnimationFrame(() => requestAnimationFrame(() => {
						const f = document.getElementById('campFade');
						if (f) f.classList.add('is-hidden');
					}));
				} catch (e) {
					console.error('[UpstairsScene] create failed:', e);
					this.scene.start('house', { from: 'upstairs' });
				}
				if (typeof window !== 'undefined') window.__upstairsScene = this;
			}

			_buildUpstairs() {
				this.tick = 0;
				this.map = buildUpstairsMap();
				const W = UPSTAIRS_W * TILE, H = UPSTAIRS_H * TILE;

				if (!this.textures.exists('upstairsBase')) {
					this.baseTex = this.textures.createCanvas('upstairsBase', W, H);
					if (!this.baseTex) throw new Error('createCanvas("upstairsBase") returned null');
					const baseCtx = this.baseTex.getContext();
					baseCtx.imageSmoothingEnabled = false;
					for (let r = 0; r < UPSTAIRS_H; r++) {
						for (let c = 0; c < UPSTAIRS_W; c++) {
							drawTile(baseCtx, this.map[r][c], c*TILE, r*TILE, 0);
						}
					}
					this.baseTex.refresh();
				} else {
					this.baseTex = this.textures.get('upstairsBase');
				}
				this.add.image(0, 0, 'upstairsBase').setOrigin(0).setDepth(0);

				try {
					if (!this.textures.exists('player-base')) {
						throw new Error('player-base texture missing');
					}
					const baseImg = this.textures.get('player-base').getSourceImage();
					const pw = baseImg.width, ph = baseImg.height;
					this._playerCanvas = document.createElement('canvas');
					this._playerCanvas.width = pw;
					this._playerCanvas.height = ph;
					this._playerCtx = this._playerCanvas.getContext('2d');
					const applyPalette = () => {
						if (window.TrainerPalette) {
							window.TrainerPalette.recolor(baseImg, window.TrainerPalette.load(), this._playerCtx, window.TrainerPalette.loadBody && window.TrainerPalette.loadBody());
						} else {
							this._playerCtx.clearRect(0, 0, pw, ph);
							this._playerCtx.drawImage(baseImg, 0, 0);
						}
					};
					applyPalette();
					this._applyPalette = applyPalette;
				} catch (e) {
					console.error('[UpstairsScene] palette swap failed:', e);
				}
				if (!this.textures.exists('player-upstairs') && this._playerCanvas) {
					this.textures.addSpriteSheet('player-upstairs', this._playerCanvas, { frameWidth: 22, frameHeight: 38 });
				} else if (this.textures.exists('player-upstairs')) {
					this.textures.get('player-upstairs').refresh();
				}
				this._onStorage = (e) => {
					if ((e.key === 'pokequiz_trainer_palette' || e.key === 'pokequiz_trainer_body') && window.TrainerPalette && this._applyPalette) {
						this._applyPalette();
						this.textures.get('player-upstairs').refresh();
					}
				};
				window.addEventListener('storage', this._onStorage);
				this.events.once('shutdown', () => window.removeEventListener('storage', this._onStorage));

				const mkAnim = (key, frames) => {
					if (this.anims.exists(key)) this.anims.remove(key);
					this.anims.create({ key, frameRate: 6, repeat: -1,
						frames: this.anims.generateFrameNumbers('player-upstairs', { frames }) });
				};
				mkAnim('u-walk-south', [1, 0, 2, 0]);
				mkAnim('u-walk-west',  [4, 3, 5, 3]);
				mkAnim('u-walk-north', [7, 6, 8, 6]);
				mkAnim('u-walk-east',  [10, 9, 11, 9]);

				// Spawn one tile north of the stairs, facing north (just stepped up).
				const spawnX = UPSTAIRS_STAIRS_C*TILE + TILE/2;
				const spawnY = (UPSTAIRS_STAIRS_R - 1)*TILE + TILE/2;
				this.player = this.physics.add.sprite(spawnX, spawnY, 'player-upstairs', 6);
				this.player.setOrigin(0.5, 36/38);
				this.player.setScale(0.75);
				this.player.setDepth(3);
				this.player.body.setSize(10, 6);
				this.player.body.setOffset((22-10)/2, 38-8);

				this.solids = this.physics.add.staticGroup();
				for (let r = 0; r < UPSTAIRS_H; r++) {
					for (let c = 0; c < UPSTAIRS_W; c++) {
						if (SOLID.has(this.map[r][c])) {
							const rect = this.add.rectangle(c*TILE + TILE/2, r*TILE + TILE/2, TILE, TILE);
							this.physics.add.existing(rect, true);
							this.solids.add(rect);
						}
					}
				}
				this.physics.add.collider(this.player, this.solids);

				this.physics.world.setBounds(0, 0, W, H);
				this.player.setCollideWorldBounds(true);
				this.cameras.main.setBounds(-4000, -4000, 8000, 8000);
				const _upWp = (Inventory.load().cosmetics?.wallpaper) || 'default';
				this.cameras.main.setBackgroundColor(WALLPAPER_BG[_upWp]?.upstairs || '#140a18');

				// Pre-create room item overlays — pixel-art sprites built from
				// FURNITURE_DESIGNS, registered as Phaser canvas textures.
				const _roomInv = Inventory.load();
				const _roomPlacements = _roomInv.cosmetics?.roomPlacements || {};
				this._roomItemObjs = {};
				Object.entries(ROOM_ITEMS).forEach(([key, item]) => {
					const pos = _roomPlacements[key];
					const x = (pos ? pos.c : item.c) * TILE + TILE / 2;
					const y = (pos ? pos.r : item.r) * TILE + TILE / 2;
					const texKey = 'furniture-up-' + key;
					if (!this.textures.exists(texKey)) {
						const canvas = (SPRITE_DEFS[key] || FURNITURE_DESIGNS[key])
							? FurnitureSprites.get(key) : null;
						if (canvas) this.textures.addCanvas(texKey, canvas);
					}
					const obj = this.textures.exists(texKey)
						? this.add.image(x, y, texKey).setOrigin(0.5).setDepth(2).setVisible(!!pos)
						: this.add.text(x, y, item.label ? item.label.slice(0,3) : '?', { fontSize: '8px', resolution: 2 })
							.setOrigin(0.5).setDepth(2).setVisible(!!pos);
					this._roomItemObjs[key] = obj;
				});
				// Grid overlay + ghost for tile-snap placement mode.
				this._gridGraphics = this.add.graphics().setDepth(10);
				this._gridGhost = this.add.text(0, 0, '', { fontSize: '14px', resolution: 2 })
					.setOrigin(0.5).setDepth(11).setAlpha(0.7).setVisible(false);
				this.input.on('pointerdown', (pointer) => {
					const gm = window.__gridMode;
					if (!gm?.active || gm.sceneKey !== 'upstairs') return;
					const tc = Math.floor(pointer.worldX / TILE);
					const tr = Math.floor(pointer.worldY / TILE);
					if (tc <= 0 || tr <= 0 || tc >= UPSTAIRS_W - 1 || tr >= UPSTAIRS_H - 1) return;
					if (SOLID.has(this.map[tr]?.[tc])) return;
					RoomEditor.confirmPlace(tr, tc);
				});
				this.input.on('pointermove', (pointer) => {
					const gm = window.__gridMode;
					if (!gm?.active || gm.sceneKey !== 'upstairs') return;
					gm.hoverR = Math.floor(pointer.worldY / TILE);
					gm.hoverC = Math.floor(pointer.worldX / TILE);
				});
				this.events.once('shutdown', () => {
					if (window.__gridMode) window.__gridMode.active = false;
				});
				// Show edit button while in this scene; hide on exit.
				RoomEditor.showEditBtn(true, 'upstairs');
				this.events.once('shutdown', () => { RoomEditor.showEditBtn(false); });

				this.cameras.main.setRoundPixels(true);
				this.applyZoom();
				this.scale.on('resize', this.onResize, this);
				this.events.once('shutdown', () => this.scale.off('resize', this.onResize, this));

				_sceneKeyboard = this.input.keyboard;
				this.keys = this.input.keyboard.addKeys({
					up: Phaser.Input.Keyboard.KeyCodes.UP,
					down: Phaser.Input.Keyboard.KeyCodes.DOWN,
					left: Phaser.Input.Keyboard.KeyCodes.LEFT,
					right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
					w: Phaser.Input.Keyboard.KeyCodes.W,
					a: Phaser.Input.Keyboard.KeyCodes.A,
					s: Phaser.Input.Keyboard.KeyCodes.S,
					d: Phaser.Input.Keyboard.KeyCodes.D,
					interact: Phaser.Input.Keyboard.KeyCodes.E,
				});
				this.dpad = { up:false, down:false, left:false, right:false };
				this.setupJoystick();
				setupPauseMenu(this.game);
				Music.start('upstairs');
				this.events.once('shutdown', () => Music.stop());

				this.dir = 2; // facing north — just emerged from stairs
				this.dirAnimKeys = ['u-walk-south', 'u-walk-west', 'u-walk-north', 'u-walk-east'];
				this.dirIdleFrame = [0, 3, 6, 9];
				this.player.setFrame(this.dirIdleFrame[this.dir]);
				this.didTransition = false;
				// Player spawned one tile north of stairs. Require ≥2-tile distance
				// before re-arming so quick south-tap right after spawn doesn't bounce
				// back down. Start unarmed so the spawn tile (1 step from stairs)
				// can't trigger immediately if dir was wrong.
				this.armedForStairs = false;

				// Cache DOM refs once — avoid getElementById every frame, and ensure
				// the prompt is hidden if the scene shuts down mid-display.
				this._promptEl  = document.getElementById('campPrompt');
				this._promptLbl = document.getElementById('campPromptLabel');
				this.events.once('shutdown', () => {
					if (this._promptEl) this._promptEl.hidden = true;
				});
			}

			onResize() {
				applyWrapTop();
				this.applyZoom();
			}

			applyZoom() {
				const vw = this.scale.width;
				const vh = this.scale.height;
				if (vw <= 0 || vh <= 0) {
					this.events.once('postupdate', () => this.applyZoom());
					return;
				}
				const roomW = UPSTAIRS_W * TILE;
				const roomH = UPSTAIRS_H * TILE;
				let s = Math.min(vw / roomW, vh / roomH);
				s = Math.max(2, Math.floor(s));
				s = Math.min(s, 5);
				const cam = this.cameras.main;
				cam.setZoom(s);
				cam.centerOn(roomW / 2, roomH / 2);
			}

			setupJoystick() {
				const base = document.getElementById('joystickBase');
				const knob = document.getElementById('joystickKnob');
				if (!base || !knob) return;
				base.__campDpad = this.dpad;
				if (base.dataset.wired) return;
				base.dataset.wired = '1';
				const RADIUS = 42, DEAD = 0.18;
				let active = false, pointerId = null;
				const reset = () => {
					active = false; pointerId = null;
					const d = base.__campDpad;
					if (d) { d.up = d.down = d.left = d.right = false; }
					knob.style.transform = 'translate(-50%,-50%)';
				};
				const applyJoy = (dx, dy) => {
					const d = base.__campDpad;
					if (!d) return;
					const dist = Math.sqrt(dx*dx + dy*dy);
					const clamp = Math.min(dist, RADIUS);
					const nx = dist > 0 ? dx/dist : 0, ny = dist > 0 ? dy/dist : 0;
					knob.style.transform = `translate(calc(-50% + ${nx*clamp}px), calc(-50% + ${ny*clamp}px))`;
					const fx = dist > 0 ? dx/Math.max(dist, RADIUS) : 0;
					const fy = dist > 0 ? dy/Math.max(dist, RADIUS) : 0;
					d.left = fx < -DEAD; d.right = fx > DEAD;
					d.up   = fy < -DEAD; d.down  = fy > DEAD;
				};
				base.addEventListener('pointerdown', e => {
					if (active) return;
					active = true; pointerId = e.pointerId;
					base.setPointerCapture(e.pointerId);
					e.preventDefault();
					const r = base.getBoundingClientRect();
					applyJoy(e.clientX - r.left - r.width/2, e.clientY - r.top - r.height/2);
				});
				base.addEventListener('pointermove', e => {
					if (!active || e.pointerId !== pointerId) return;
					e.preventDefault();
					const r = base.getBoundingClientRect();
					applyJoy(e.clientX - r.left - r.width/2, e.clientY - r.top - r.height/2);
				});
				['pointerup','pointercancel'].forEach(ev => base.addEventListener(ev, e => {
					if (e.pointerId !== pointerId) return;
					e.preventDefault(); reset();
				}));
			}

			_tickGrid() {
				const gm = window.__gridMode;
				const g = this._gridGraphics;
				const ghost = this._gridGhost;
				if (!g) return;
				g.clear();
				if (!gm?.active || gm.sceneKey !== 'upstairs') {
					if (ghost) ghost.setVisible(false);
					return;
				}
				g.lineStyle(0.5, 0xffffff, 0.18);
				for (let r = 1; r < UPSTAIRS_H; r++) {
					g.moveTo(TILE, r * TILE); g.lineTo((UPSTAIRS_W - 1) * TILE, r * TILE);
				}
				for (let c = 1; c < UPSTAIRS_W; c++) {
					g.moveTo(c * TILE, TILE); g.lineTo(c * TILE, (UPSTAIRS_H - 1) * TILE);
				}
				g.strokePath();
				const hr = gm.hoverR ?? -1, hc = gm.hoverC ?? -1;
				if (hr > 0 && hc > 0 && hr < UPSTAIRS_H - 1 && hc < UPSTAIRS_W - 1) {
					const solid = SOLID.has(this.map[hr]?.[hc]);
					const canPlace = !solid;
					g.fillStyle(canPlace ? 0x88ffaa : 0xff5555, 0.3);
					g.fillRect(hc * TILE, hr * TILE, TILE, TILE);
					g.lineStyle(1, canPlace ? 0x88ffaa : 0xff5555, 0.8);
					g.strokeRect(hc * TILE, hr * TILE, TILE, TILE);
					if (ghost && gm.key) {
						const item = ROOM_ITEMS[gm.key];
						if (item && canPlace) {
							ghost.setText(item.label ? item.label.slice(0,3) : '?');
							ghost.setPosition(hc * TILE + TILE / 2, hr * TILE + TILE / 2);
							ghost.setAngle((gm.rot || 0) * 90);
							ghost.setVisible(true);
						} else { ghost.setVisible(false); }
					}
				} else {
					if (ghost) ghost.setVisible(false);
				}
			}

			update() {
				this.tick++;
				this._tickGrid();
				if (this.didTransition) {
					this.player.setVelocity(0, 0);
					return;
				}
				applyDayNight();
				Dialog.tick();
				const dialogOpen = Dialog.isOpen();
				const k = this.keys, d = this.dpad;
				let vx = 0, vy = 0;
				if (!dialogOpen) {
					if (k.up.isDown    || k.w.isDown || d.up)    { vy = -SPEED; this.dir = 2; }
					if (k.down.isDown  || k.s.isDown || d.down)  { vy =  SPEED; this.dir = 0; }
					if (k.left.isDown  || k.a.isDown || d.left)  { vx = -SPEED; this.dir = 1; }
					if (k.right.isDown || k.d.isDown || d.right) { vx =  SPEED; this.dir = 3; }
					if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
				}
				this.player.setVelocity(vx, vy);

				const moving = vx !== 0 || vy !== 0;
				const animKey = this.dirAnimKeys[this.dir];
				if (moving) {
					if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== animKey) {
						this.player.anims.play(animKey, true);
					}
				} else {
					this.player.anims.stop();
					this.player.setFrame(this.dirIdleFrame[this.dir]);
				}

				const tc = Math.floor(this.player.x / TILE);
				const tr = Math.floor(this.player.y / TILE);
				const onStairs = this.map[tr] && this.map[tr][tc] === TST;
				// Rectangle distance to the stair block (1 row × 2 cols) — correct for
				// any approach direction, unlike the old min-of-two-points formula.
				const distFromStairs =
					Math.max(0, UPSTAIRS_STAIRS_R - tr, tr - UPSTAIRS_STAIRS_R) +
					Math.max(0, UPSTAIRS_STAIRS_C - tc, tc - (UPSTAIRS_STAIRS_C + 1));
				if (distFromStairs >= 2) this.armedForStairs = true;

				const pe = this._promptEl;
				const lbl = this._promptLbl;
				const nearStairs = distFromStairs === 1 || onStairs;
				if (pe && lbl) {
					if (nearStairs && !dialogOpen) {
						lbl.textContent = 'Down';
						pe.hidden = false;
						const cam = this.cameras.main;
						const sx = (this.player.x - cam.worldView.x) * cam.zoom;
						const sy = (this.player.y - cam.worldView.y) * cam.zoom;
						const maxTop = this.scale.height - 180;
						pe.style.left = sx + 'px';
						pe.style.top  = Math.min(sy, maxTop) + 'px';
						pe.style.transform = 'translate(-50%, calc(-100% - 12px))';
					} else {
						pe.hidden = true;
					}
				}

				const ePressed = Phaser.Input.Keyboard.JustDown(k.interact) || TouchActions.consume('interact');
				const trigger = !this.didTransition && this.armedForStairs && (
					onStairs || (ePressed && nearStairs)
				);
				if (trigger) {
					this.didTransition = true;
					if (pe) pe.hidden = true;
					safeSceneStart(this, 'house', { from: 'upstairs' });
					return;
				}

				Debug.render(
					'UPSTAIRS\n' +
					'tile  ' + tc + ',' + tr + '\n' +
					'pos   ' + Math.round(this.player.x) + ',' + Math.round(this.player.y) + '\n' +
					'dir   ' + ['S','W','N','E'][this.dir] + '\n' +
					'distS ' + distFromStairs + '\n' +
					'onS   ' + onStairs + '\n' +
					'armed ' + this.armedForStairs + '\n' +
					'trans ' + this.didTransition + '\n' +
					(Debug.lastError ? 'ERR ' + Debug.lastError : '')
				);
			}
		};
	}

	// ── Market vendor shop UI ────────────────────────────────────────────────────
	// Dynamic DOM panel (no HTML/CSS file edits needed) styled to match the
	// existing Mart aesthetic. Each vendor pulls its inventory from
	// MARKET_SHOPS[shopKind]; transactions go through Inventory.load/save.
	const MarketShop = (() => {
		let root = null, openFlag = false, currentVendor = null;
		let titleEl, balanceEl, itemsEl, statusEl;
		function btn(primary) {
			return [
				'display:inline-block','padding:9px 16px','font-family:inherit','font-size:10px',
				'letter-spacing:0.6px','color:' + (primary ? '#2a1e08' : '#e8eaf0'),
				'background:' + (primary
					? 'linear-gradient(180deg, #ffd968, #f6c84c 55%, #d6a83a)'
					: 'linear-gradient(180deg, #4a5e80, #2a3a52)'),
				'border:0','border-radius:8px','cursor:pointer',
				'box-shadow:inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -3px 0 rgba(0,0,0,0.4), 0 3px 0 rgba(0,0,0,0.5), 0 5px 12px rgba(0,0,0,0.45)'
			].join(';');
		}
		function ensureRoot() {
			if (root) return;
			root = document.createElement('div');
			root.id = 'campMarketShop';
			root.setAttribute('role', 'dialog');
			root.hidden = true;
			root.style.cssText = 'position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);backdrop-filter:blur(2px);font-family:"Press Start 2P", monospace';
			const panel = document.createElement('div');
			panel.style.cssText = 'width:min(440px,92%);max-height:80vh;overflow-y:auto;background:linear-gradient(180deg,#1a2440 0%,#0e1826 100%);border:2px solid #f6c84c;border-radius:10px;padding:14px 16px 12px;color:#e8eaf0;box-shadow:0 0 0 2px rgba(0,0,0,0.4),0 0 24px rgba(246,200,76,0.18),0 14px 32px rgba(0,0,0,0.65)';
			const head = document.createElement('div');
			head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding-bottom:8px;margin-bottom:10px;border-bottom:1px solid rgba(246,200,76,0.2)';
			titleEl = document.createElement('span');
			titleEl.style.cssText = 'font-size:12px;color:#f6c84c;letter-spacing:1.2px;text-shadow:0 0 10px rgba(246,200,76,0.4)';
			balanceEl = document.createElement('span');
			balanceEl.style.cssText = 'font-size:10px;color:#f6c84c';
			head.append(titleEl, balanceEl);
			itemsEl = document.createElement('div');
			itemsEl.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:4px 0 10px';
			statusEl = document.createElement('div');
			statusEl.style.cssText = 'font-size:9px;color:#a8c8e8;min-height:14px;padding:2px 0 8px';
			const foot = document.createElement('div');
			foot.style.cssText = 'display:flex;justify-content:flex-end;gap:8px';
			const leave = document.createElement('button');
			leave.type = 'button'; leave.textContent = 'Leave'; leave.style.cssText = btn(false);
			leave.addEventListener('click', close);
			foot.append(leave);
			panel.append(head, itemsEl, statusEl, foot);
			// Block taps on the panel itself from bubbling to the backdrop's
			// close-handler — so users only close by tapping the dim backdrop
			// or pressing Leave/Escape, not by tapping the panel chrome.
			panel.addEventListener('pointerdown', (e) => e.stopPropagation());
			root.append(panel);
			document.body.append(root);
			// Tap outside the panel (on the dim backdrop) closes the shop —
			// matches the camp's existing dialog dismissal pattern for touch users.
			root.addEventListener('pointerdown', () => { if (openFlag) close(); });
			document.addEventListener('keydown', (e) => {
				if (openFlag && e.key === 'Escape') { e.preventDefault(); close(); }
			});
		}
		function setStatus(msg) { if (statusEl) statusEl.textContent = msg || ''; }
		function refresh() {
			if (!currentVendor) return;
			const cfg = MARKET_SHOPS[currentVendor.shopKind];
			if (!cfg) return;
			const inv = Inventory.load();
			titleEl.textContent = cfg.title;
			balanceEl.innerHTML = ico(ICO.token) + ' ' + (inv.tokens || 0);
			itemsEl.innerHTML = '';
			const displayItems = currentVendor.shopKind === 'cafe'
				? cfg.items.concat(getSeasonalItems())
				: cfg.items;
			displayItems.forEach((it) => {
				const row = document.createElement('div');
				row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 0';
				const lbl = document.createElement('span');
				lbl.style.cssText = 'font-size:10px;line-height:1.5;flex:1 1 auto';
				const priceStr = it.cost != null ? ' — ' + it.cost + ' ' + ico(ICO.token)
				             : it.sells != null ? ' — +' + it.sells + ' ' + ico(ICO.token)
				             : '';
				lbl.textContent = it.label + priceStr;
				const b = document.createElement('button');
				b.type = 'button'; b.style.cssText = btn(true);
				b.textContent = it.cost != null ? (it.cost === 0 ? 'Free' : 'Buy') : 'Sell';
				b.addEventListener('click', () => doAction(it));
				row.append(lbl, b);
				itemsEl.append(row);
			});
		}
		function doAction(it) {
			const inv = Inventory.load();
			if (!inv.cosmetics) inv.cosmetics = {};
			switch (it.action) {
				case 'buySeed':
					if ((inv.tokens||0) < it.cost) { setStatus('Not enough Tokens.'); return; }
					inv.tokens -= it.cost; inv.seeds = (inv.seeds||0)+1;
					setStatus('Bought 1 Seed for ' + it.cost + ' Tokens.');
					break;
				case 'sellBerry':
					if ((inv.friendshipBerries||0) <= 0) { setStatus('No berries to sell.'); return; }
					inv.friendshipBerries -= 1; inv.tokens = (inv.tokens||0) + it.sells;
					setStatus('Sold 1 Berry for ' + it.sells + ' Tokens.');
					break;
				case 'sellAllBerries': {
					const n = inv.friendshipBerries||0;
					if (n<=0) { setStatus('No berries to sell.'); return; }
					inv.friendshipBerries = 0; inv.tokens = (inv.tokens||0) + n*it.sells;
					setStatus('Sold ' + n + ' Berries for ' + (n*it.sells) + ' Tokens.');
					break;
				}
				case 'buyStone':
					if (inv.stone === it.key) { setStatus('Already holding that stone.'); return; }
					if ((inv.tokens||0) < it.cost) { setStatus('Not enough Tokens.'); return; }
					inv.tokens -= it.cost; inv.stone = it.key;
					setStatus('Bought ' + it.key.toUpperCase() + ' Stone!');
					break;
				case 'buyWallpaper':
					if ((inv.tokens||0) < it.cost) { setStatus('Not enough Tokens.'); return; }
					inv.tokens -= it.cost; inv.cosmetics.wallpaper = it.key;
					setStatus('Wallpaper changed!');
					break;
				case 'buyAccent':
					if ((inv.tokens||0) < it.cost) { setStatus('Not enough Tokens.'); return; }
					inv.tokens -= it.cost; inv.cosmetics.accent = it.key;
					applyCampAccent(it.key);
					setStatus('Camp accent changed!');
					break;
				case 'cafeBuy': {
					if ((inv.tokens||0) < it.cost) { setStatus('Not enough tokens.'); return; }
					inv.tokens -= it.cost;
					if (!inv.boosts) inv.boosts = {};
					if (it.gives === 'seed')   { inv.seeds             = (inv.seeds            ||0) + it.amount; setStatus('Got ' + it.amount + ' seed' + (it.amount>1?'s':'') + '!'); }
					if (it.gives === 'berry')  { inv.friendshipBerries = (inv.friendshipBerries ||0) + it.amount; setStatus('Got ' + it.amount + ' berr' + (it.amount>1?'ies':'y') + '!'); }
					if (it.gives === 'tokens') { inv.tokens            = (inv.tokens            ||0) + it.amount; setStatus('Got ' + it.amount + ' bonus tokens!'); }
					// Special: Espresso Shot = rhythm boost (double tokens from rhythm for 10 min)
					if (it.label && it.label.includes('Espresso')) {
						inv.boosts.rhythmBoost = Date.now() + 10 * 60 * 1000;
						setStatus(ico(ICO.music) + ' Rhythm token boost active for 10 min!');
					}
					// Special: Herbal Tea = fast grow (berries ripen faster for 30 min)
					if (it.label && it.label.includes('Herbal')) {
						inv.boosts.fastGrow = Date.now() + 30 * 60 * 1000;
						setStatus(ico(ICO.seed) + ' Fast-grow active! Berries ripen faster for 30 min.');
					}
					break;
				}
				case 'buyEgg':
					EggSystem.buyEgg();
					Inventory.save(inv);
					close();
					return;
				case 'healPokemon':
					inv.partnerHp = 100;
					setStatus('Your Pokémon has been fully healed! ♥');
					break;
				case 'freeBerry': {
					const now = Date.now();
					if ((inv.lastFreeBerry || 0) > now - 3600000) { setStatus('Come back in an hour for another berry!'); return; }
					inv.lastFreeBerry = now;
					inv.friendshipBerries = (inv.friendshipBerries || 0) + 1;
					setStatus("Nurse Joy gave you a berry! ♥");
					break;
				}
				default: setStatus('Unknown action.');
			}
			Inventory.save(inv);
			refresh();
		}
		function open(vendor) { ensureRoot(); currentVendor = vendor; setStatus(''); refresh(); root.hidden = false; openFlag = true; }
		function close() { if (root) root.hidden = true; openFlag = false; currentVendor = null; }
		function isOpen() { return openFlag; }
		return { open, close, isOpen };
	})();

	function makeMarketSceneClass() {
		return class MarketScene extends Phaser.Scene {
			constructor() { super({ key: 'market' }); }

			init(data) {
				this.spawnFrom = (data && data.from) || consumeBootFrom('market') || null;
			}

			preload() {
				this.load.image('player-base', 'Pictures/sprites/calem.png');
				// NPC trainer overworld sprites (FRLG 32×32 single-frame images).
				this.load.image('npc-youngster',     'Pictures/sprites/trainer-youngster.png');
				this.load.image('npc-camper',        'Pictures/sprites/trainer-camper.png');
				this.load.image('npc-lady',          'Pictures/sprites/trainer-lady.png');
				this.load.image('npc-gentleman',     'Pictures/sprites/trainer-gentleman.png');
				this.load.image('npc-old-lady',      'Pictures/sprites/trainer-old-lady.png');
				this.load.image('npc-scientist',     'Pictures/sprites/trainer-scientist.png');
				this.load.image('npc-cooltrainer-f', 'Pictures/sprites/trainer-cooltrainer-f.png');
			}

			create() {
				console.log('[MarketScene] create()');
				if (!sessionStorage.getItem('marketVisited')) {
					sessionStorage.setItem('marketVisited', '1');
					DailyQuests.increment('market');
					const _mInv = Inventory.load();
					if (_mInv.eeveeForm === 'vaporeon') {
						setTimeout(() => Dialog.open('Your Vaporeon splashes excitedly — it loves the water fountains here!'), 800);
					}
				}
				try {
					this._buildMarket();
					requestAnimationFrame(() => requestAnimationFrame(() => {
						const f = document.getElementById('campFade');
						if (f) f.classList.add('is-hidden');
					}));
				} catch (e) {
					console.error('[MarketScene] create failed:', e);
					Debug.lastError = 'MarketScene.create: ' + e.message;
					this.scene.start('camp', { from: 'market' });
				}
				if (typeof window !== 'undefined') window.__marketScene = this;
			}

			_buildMarket() {
				this.tick = 0;
				this.map = buildMarketMap();
				const W = MARKET_W * TILE, H = MARKET_H * TILE;

				// Always recreate — reusing a cached texture risks wrong dimensions
				// if MARKET_W/H changed or the player re-enters in the same session.
				if (this.textures.exists('marketBase')) {
					this.textures.remove('marketBase');
				}
				this.baseTex = this.textures.createCanvas('marketBase', W, H);
				if (!this.baseTex) throw new Error('createCanvas("marketBase") returned null');
				const baseCtx = this.baseTex.getContext();
				baseCtx.imageSmoothingEnabled = false;
				for (let r = 0; r < MARKET_H; r++) {
					for (let c = 0; c < MARKET_W; c++) {
						drawTile(baseCtx, this.map[r][c], c*TILE, r*TILE, 0);
					}
				}
				this.baseTex.refresh();
				this.add.image(0, 0, 'marketBase').setOrigin(0).setDepth(0);

				// Palette-swap the trainer sheet (same pipeline as HouseScene)
				try {
					if (!this.textures.exists('player-base')) {
						throw new Error('player-base texture missing');
					}
					const baseImg = this.textures.get('player-base').getSourceImage();
					const pw = baseImg.width, ph = baseImg.height;
					this._playerCanvas = document.createElement('canvas');
					this._playerCanvas.width = pw;
					this._playerCanvas.height = ph;
					this._playerCtx = this._playerCanvas.getContext('2d');
					const applyPalette = () => {
						if (window.TrainerPalette) {
							window.TrainerPalette.recolor(baseImg, window.TrainerPalette.load(), this._playerCtx, window.TrainerPalette.loadBody && window.TrainerPalette.loadBody());
						} else {
							this._playerCtx.clearRect(0, 0, pw, ph);
							this._playerCtx.drawImage(baseImg, 0, 0);
						}
					};
					applyPalette();
					if (!this.textures.exists('player-market') && this._playerCanvas) {
						this.textures.addSpriteSheet('player-market', this._playerCanvas, { frameWidth: 22, frameHeight: 38 });
					} else if (this.textures.exists('player-market')) {
						this.textures.get('player-market').refresh();
					}
					this._onStorage = (e) => {
						if ((e.key === 'pokequiz_trainer_palette' || e.key === 'pokequiz_trainer_body') && window.TrainerPalette) {
							applyPalette();
							this.textures.get('player-market').refresh();
						}
					};
					window.addEventListener('storage', this._onStorage);
					this.events.once('shutdown', () => window.removeEventListener('storage', this._onStorage));
				} catch (e) {
					console.error('[MarketScene] palette swap failed:', e);
				}

				const mkAnim = (key, frames) => {
					if (this.anims.exists(key)) this.anims.remove(key);
					this.anims.create({ key, frameRate: 6, repeat: -1,
						frames: this.anims.generateFrameNumbers('player-market', { frames }) });
				};
				mkAnim('m-walk-south', [1, 0, 2, 0]);
				mkAnim('m-walk-west',  [4, 3, 5, 3]);
				mkAnim('m-walk-north', [7, 6, 8, 6]);
				mkAnim('m-walk-east',  [10, 9, 11, 9]);

				// Spawn one tile south of the north-edge entry, facing south.
				const spawnX = MARKET_NORTH_C*TILE + TILE/2;
				const spawnY = 3*TILE + TILE/2;
				this.player = this.physics.add.sprite(spawnX, spawnY, 'player-market', 0);
				this.player.setOrigin(0.5, 36/38);
				this.player.setScale(0.75);
				this.player.setDepth(3);
				this.player.body.setSize(10, 6);
				this.player.body.setOffset((22-10)/2, 38-8);

				this.solids = this.physics.add.staticGroup();
				for (let r = 0; r < MARKET_H; r++) {
					for (let c = 0; c < MARKET_W; c++) {
						if (SOLID.has(this.map[r][c])) {
							const rect = this.add.rectangle(c*TILE + TILE/2, r*TILE + TILE/2, TILE, TILE);
							this.physics.add.existing(rect, true);
							this.solids.add(rect);
						}
					}
				}
				this.physics.add.collider(this.player, this.solids);

				// Spawn vendor NPCs from MARKET_NPCS — same pattern as camp's NPCS.
				this.npcByTile = {};
				const npcSolids = this.physics.add.staticGroup();
				for (const npc of MARKET_NPCS) {
					const x = npc.c * TILE + TILE/2;
					const y = npc.r * TILE + TILE/2;
					const sprite = this.add.sprite(x, y, 'npc-' + npc.species, 0);
					sprite.setOrigin(0.5, (npc.frameHeight - 4) / npc.frameHeight);
					sprite.setScale(npc.spriteScale);
					sprite.setDepth(3);
					const rect = this.add.rectangle(x, y, TILE, TILE);
					this.physics.add.existing(rect, true);
					npcSolids.add(rect);
					this.npcByTile[npc.r + ',' + npc.c] = npc;
				}
				this.physics.add.collider(this.player, npcSolids);

				this.physics.world.setBounds(0, 0, W, H);
				this.player.setCollideWorldBounds(true);
				this.cameras.main.setBounds(0, 0, W, H);
				// Use a soft grass-edge color so any gap around the world looks natural,
				// matching the camp's outdoor feel.
				this.cameras.main.setBackgroundColor('#3a5026');
				this.cameras.main.setRoundPixels(true);
				this.cameras.main.startFollow(this.player, true, 1, 1);
				this.applyZoom();
				this.scale.on('resize', this.onResize, this);
				this.events.once('shutdown', () => this.scale.off('resize', this.onResize, this));

				_sceneKeyboard = this.input.keyboard;
				this.keys = this.input.keyboard.addKeys({
					up: Phaser.Input.Keyboard.KeyCodes.UP,
					down: Phaser.Input.Keyboard.KeyCodes.DOWN,
					left: Phaser.Input.Keyboard.KeyCodes.LEFT,
					right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
					w: Phaser.Input.Keyboard.KeyCodes.W,
					a: Phaser.Input.Keyboard.KeyCodes.A,
					s: Phaser.Input.Keyboard.KeyCodes.S,
					d: Phaser.Input.Keyboard.KeyCodes.D,
					interact: Phaser.Input.Keyboard.KeyCodes.E,
				});
				this.dpad = { up:false, down:false, left:false, right:false };
				this.setupJoystick();
				setupPauseMenu(this.game);
				Music.start('camp');
				this.events.once('shutdown', () => Music.stop());

				this.dir = 0; // facing south — just walked in from camp at the north edge
				this.dirAnimKeys = ['m-walk-south', 'm-walk-west', 'm-walk-north', 'm-walk-east'];
				this.dirIdleFrame = [0, 3, 6, 9];
				this.player.setFrame(this.dirIdleFrame[this.dir]);
				this.didTransition = false;
				// Re-arming for the north exit: don't fire immediately on spawn — wait
				// until the player has stepped at least two tiles south of the entry.
				this.armedForExit = false;

				this._promptEl  = document.getElementById('campPrompt');
				this._promptLbl = document.getElementById('campPromptLabel');
				// Swap the top-left location badge so it reads "MARKET CENTRE" while
				// here, then restore the original on shutdown.
				this._locEl = document.querySelector('.camp-location-name');
				if (this._locEl) {
					this._prevLocText = this._locEl.textContent;
					this._locEl.textContent = 'MARKET CENTRE';
				}
				this.events.once('shutdown', () => {
					if (this._promptEl) this._promptEl.hidden = true;
					if (this._locEl && this._prevLocText) this._locEl.textContent = this._prevLocText;
				});
			}

			onResize() { applyWrapTop(); this.applyZoom(); }

			applyZoom() {
				const vw = this.scale.width, vh = this.scale.height;
				if (vw <= 0 || vh <= 0) {
					this.events.once('postupdate', () => this.applyZoom());
					return;
				}
				const roomW = MARKET_W * TILE, roomH = MARKET_H * TILE;
				// Fit the entire market into the viewport — no min-zoom floor so it
				// always fits on phones, capped at 4× on large screens.
				let s = Math.min(vw / roomW, vh / roomH);
				s = Math.max(0.25, Math.min(s, 4));
				const cam = this.cameras.main;
				cam.setZoom(s);
				cam.setBounds(0, 0, roomW, roomH);
				// If the player is loaded, the camera is following them — just update
				// zoom and let Phaser re-center on the player. Otherwise fall back to
				// map center (initial load before player exists).
				if (!this.player) cam.centerOn(roomW / 2, roomH / 2);
			}

			setupJoystick() {
				const base = document.getElementById('joystickBase');
				const knob = document.getElementById('joystickKnob');
				if (!base || !knob) return;
				base.__campDpad = this.dpad;
				if (base.dataset.wired) return;
				base.dataset.wired = '1';
				const RADIUS = 42, DEAD = 0.18;
				let active = false, pointerId = null;
				const reset = () => {
					active = false; pointerId = null;
					const d = base.__campDpad;
					if (d) { d.up = d.down = d.left = d.right = false; }
					knob.style.transform = 'translate(-50%,-50%)';
				};
				const applyJoy = (dx, dy) => {
					const d = base.__campDpad;
					if (!d) return;
					const dist = Math.sqrt(dx*dx + dy*dy);
					const clamp = Math.min(dist, RADIUS);
					const nx = dist > 0 ? dx/dist : 0, ny = dist > 0 ? dy/dist : 0;
					knob.style.transform = `translate(calc(-50% + ${nx*clamp}px), calc(-50% + ${ny*clamp}px))`;
					const fx = dist > 0 ? dx/Math.max(dist, RADIUS) : 0;
					const fy = dist > 0 ? dy/Math.max(dist, RADIUS) : 0;
					d.left = fx < -DEAD; d.right = fx > DEAD;
					d.up   = fy < -DEAD; d.down  = fy > DEAD;
				};
				base.addEventListener('pointerdown', e => {
					if (active) return;
					active = true; pointerId = e.pointerId;
					base.setPointerCapture(e.pointerId); e.preventDefault();
					const r = base.getBoundingClientRect();
					applyJoy(e.clientX - r.left - r.width/2, e.clientY - r.top - r.height/2);
				});
				base.addEventListener('pointermove', e => {
					if (!active || e.pointerId !== pointerId) return;
					e.preventDefault();
					const r = base.getBoundingClientRect();
					applyJoy(e.clientX - r.left - r.width/2, e.clientY - r.top - r.height/2);
				});
				['pointerup','pointercancel'].forEach(ev => base.addEventListener(ev, e => {
					if (e.pointerId !== pointerId) return;
					e.preventDefault(); reset();
				}));
			}

			// Find the vendor NPC, sign, or other interactable directly in front of
			// the player (one tile in the direction they're facing). Adjacency only —
			// the player must be next to the thing, not on top of it.
			findInteractTarget() {
				const tc = Math.floor(this.player.x / TILE);
				const tr = Math.floor(this.player.y / TILE);
				// Direction vector: 0=south, 1=west, 2=north, 3=east
				const DV = [[0,1],[-1,0],[0,-1],[1,0]];
				const [dc, dr] = DV[this.dir] || [0, 1];
				const fc = tc + dc, fr = tr + dr;
				const npcKey = fr + ',' + fc;
				if (this.npcByTile && this.npcByTile[npcKey]) {
					return { kind: 'npc', npc: this.npcByTile[npcKey] };
				}
				const t = this.map[fr] && this.map[fr][fc];
				if (t === TSG) {
					const msg = SIGN_MESSAGES_MARKET[fr + ',' + fc];
					if (msg) return { kind: 'sign', message: msg };
				}
				return null;
			}

			update() {
				this.tick++;
				if (this.didTransition) {
					this.player.setVelocity(0, 0);
					return;
				}
				applyDayNight();
				Dialog.tick();
				const dialogOpen = Dialog.isOpen();
				const shopOpen = MarketShop.isOpen();
				const k = this.keys, d = this.dpad;
				let vx = 0, vy = 0;
				if (!dialogOpen && !shopOpen) {
					if (k.up.isDown    || k.w.isDown || d.up)    { vy = -SPEED; this.dir = 2; }
					if (k.down.isDown  || k.s.isDown || d.down)  { vy =  SPEED; this.dir = 0; }
					if (k.left.isDown  || k.a.isDown || d.left)  { vx = -SPEED; this.dir = 1; }
					if (k.right.isDown || k.d.isDown || d.right) { vx =  SPEED; this.dir = 3; }
					if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
				}
				this.player.setVelocity(vx, vy);

				const moving = vx !== 0 || vy !== 0;
				const animKey = this.dirAnimKeys[this.dir];
				if (moving) {
					if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== animKey) {
						this.player.anims.play(animKey, true);
					}
				} else {
					this.player.anims.stop();
					this.player.setFrame(this.dirIdleFrame[this.dir]);
				}

				const tc = Math.floor(this.player.x / TILE);
				const tr = Math.floor(this.player.y / TILE);

				// North-edge exit — walk onto the entry tile (row 1, col MARKET_NORTH_C)
				// to head back to camp. Arm only after the player has stepped at least
				// two tiles away so the spawn doesn't bounce back instantly.
				const onExitTile = tc === MARKET_NORTH_C && tr <= 1;
				const distFromExit = Math.max(0, tr - 1) + Math.abs(tc - MARKET_NORTH_C);
				if (distFromExit >= 2) this.armedForExit = true;

				const target = this.findInteractTarget();
				const ePressed = Phaser.Input.Keyboard.JustDown(k.interact) || TouchActions.consume('interact');

				const pe = this._promptEl;
				const lbl = this._promptLbl;
				const showPrompt = !dialogOpen && !shopOpen && target;
				if (pe && lbl) {
					if (showPrompt) {
						lbl.textContent = target.kind === 'npc' ? (target.npc.label || 'Shop') : 'Read';
						pe.hidden = false;
						const cam = this.cameras.main;
						const sx = (this.player.x - cam.worldView.x) * cam.zoom;
						const sy = (this.player.y - cam.worldView.y) * cam.zoom;
						const maxTop = this.scale.height - 180;
						pe.style.left = sx + 'px';
						pe.style.top  = Math.min(sy, maxTop) + 'px';
						pe.style.transform = 'translate(-50%, calc(-100% - 12px))';
					} else {
						pe.hidden = true;
					}
				}

				if (ePressed && !shopOpen) {
					if (dialogOpen) {
						Dialog.advance();
					} else if (target && target.kind === 'npc' && target.npc && target.npc.kind === 'contest') {
						Contests.open();
					} else if (target && target.kind === 'npc') {
						MarketShop.open(target.npc);
					} else if (target && target.kind === 'sign') {
						Dialog.open(target.message);
					}
				}

				if (!this.didTransition && this.armedForExit && onExitTile && !shopOpen && !dialogOpen) {
					this.didTransition = true;
					if (pe) pe.hidden = true;
					safeSceneStart(this, 'camp', { from: 'market' });
				}

				Debug.render(
					'MARKET\n' +
					'tile  ' + tc + ',' + tr + '\n' +
					'target ' + (target ? (target.kind === 'npc' ? target.npc.key : target.kind) : '-') + '\n' +
					'exit  ' + MARKET_NORTH_C + ',1\n' +
					'distE ' + distFromExit + '\n' +
					'armed ' + this.armedForExit + '\n' +
					'trans ' + this.didTransition + '\n' +
					(Debug.lastError ? 'ERR ' + Debug.lastError : '')
				);
			}
		};
	}

	function start() {
		const wrap = document.getElementById('campWrap');
		if (!wrap) return;
		if (!window.Phaser) { setTimeout(start, 30); return; }

		applyWrapTop();
		window.addEventListener('resize', applyWrapTop);
		window.addEventListener('load', applyWrapTop);
		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(applyWrapTop);
		}

		// Reorder the scene list so Phaser auto-starts the right one. The hash
		// is captured into _bootData here and cleared from the URL immediately so
		// a refresh-after-walking-around doesn't teleport the player back. Each
		// scene's init() consumes the boot 'from' value via consumeBootFrom().
		_bootData = readBootHash();
		const boot = _bootData;
		const CampClass = makeSceneClass();
		const HouseClass = makeHouseSceneClass();
		const UpstairsClass = makeUpstairsSceneClass();
		const MarketClass = makeMarketSceneClass();
		let sceneList;
		if (boot.scene === 'house')        sceneList = [HouseClass, CampClass, UpstairsClass, MarketClass];
		else if (boot.scene === 'upstairs') sceneList = [UpstairsClass, CampClass, HouseClass, MarketClass];
		else if (boot.scene === 'market')   sceneList = [MarketClass, CampClass, HouseClass, UpstairsClass];
		else                                sceneList = [CampClass, HouseClass, UpstairsClass, MarketClass];
		new Phaser.Game({
			type: Phaser.AUTO,
			parent: 'campWrap',
			backgroundColor: '#68A028',
			pixelArt: true,
			roundPixels: true,
			scale: {
				mode: Phaser.Scale.RESIZE,
				width: '100%',
				height: '100%',
			},
			physics: {
				default: 'arcade',
				arcade: { gravity: { y: 0 }, debug: false },
			},
			scene: sceneList,
		});
		// Clear the hash so a refresh from inside the house doesn't permanently
		// reboot you into the house, and so the back-button doesn't loop you in.
		if (window.location.hash) {
			history.replaceState(null, '', window.location.pathname + window.location.search);
		}
		// Fade-out is now triggered from inside each scene's create() after Phaser
		// has painted, so we don't need a fixed timeout here.
	}

	// ── Mystery Gift ─────────────────────────────────────────────────────────────
	const MysteryGift = (() => {
		const GIFTS = {
			'01-01': { label: 'New Year Gift',      gives: 'tokens', amount: 50,  msg: 'Happy New Year! +50 ' + ico(ICO.token) },
			'02-14': { label: 'Valentine Gift',     gives: 'berry',  amount: 10,  msg: 'Happy Valentine\'s Day! +10 ' + ico(ICO.berry) },
			'04-01': { label: 'April Fools Gift',   gives: 'seed',   amount: 5,   msg: '🃏 April Fools! Here\'s 5 seeds...' },
			'10-31': { label: 'Halloween Gift',     gives: 'tokens', amount: 30,  msg: 'Trick or Treat! +30 ' + ico(ICO.token) },
			'12-25': { label: 'Christmas Gift',     gives: 'tokens', amount: 100, msg: 'Merry Christmas! +100 ' + ico(ICO.token) },
			'12-31': { label: 'New Year\'s Eve Gift',gives: 'seed',  amount: 10,  msg: 'New Year\'s Eve! +10 seeds' },
			'02-27': { label: 'Pokémon Day Gift',   gives: 'egg',               msg: 'Happy Pokémon Day! Mystery Egg!' },
		};
		function todayKey() {
			const d = new Date();
			return String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
		}
		function check() {
			const key = todayKey();
			const gift = GIFTS[key];
			if (!gift) return null;
			const claimedKey = 'pokequiz_mgift_' + new Date().getFullYear() + '_' + key;
			if (localStorage.getItem(claimedKey)) return { ...gift, claimed: true };
			return { ...gift, claimed: false };
		}
		function claim() {
			const gift = check();
			if (!gift || gift.claimed) return;
			const key = todayKey();
			const claimedKey = 'pokequiz_mgift_' + new Date().getFullYear() + '_' + key;
			localStorage.setItem(claimedKey, '1');
			const inv = Inventory.load();
			if (gift.gives === 'tokens') inv.tokens = (inv.tokens||0) + gift.amount;
			else if (gift.gives === 'berry') inv.friendshipBerries = (inv.friendshipBerries||0) + gift.amount;
			else if (gift.gives === 'seed') inv.seeds = (inv.seeds||0) + gift.amount;
			else if (gift.gives === 'egg') EggSystem.buyEgg();
			Inventory.save(inv);
			showToast(gift.msg);
			Achievements.unlock('mysteryGift');
		}
		function open() {
			const gift = check();
			let panel = document.getElementById('mysteryGiftPanel');
			if (!panel) {
				panel = document.createElement('div');
				panel.id = 'mysteryGiftPanel';
				document.body.appendChild(panel);
				panel.addEventListener('pointerdown', e => { if(e.target===panel) panel.hidden=true; });
			}
			panel.hidden = false;
			panel.className = 'pk-backdrop';
			panel.innerHTML = '';
			const inner = document.createElement('div');
			inner.className = 'pk-modal pk-modal-sm';
			inner.style.textAlign = 'center';
			if (!gift) {
				inner.innerHTML = '<div class="pk-modal-head"><span class="pk-modal-title">' + ico(ICO.gift) + ' MYSTERY GIFT</span><button id="mgClose" class="pk-close" type="button">' + ico(ICO.close) + '</button></div>' +
					'<div class="pk-modal-body"><div style="font-size:9px;color:var(--pk-muted);margin-bottom:16px">No special gift today.<br><br>Check back on holidays!</div>' +
					'<button id="mgClose2" class="pk-btn pk-btn-dark pk-btn-sm" type="button">Close</button></div>';
			} else if (gift.claimed) {
				inner.innerHTML = '<div class="pk-modal-head"><span class="pk-modal-title">' + ico(ICO.gift) + ' ' + gift.label.toUpperCase() + '</span><button id="mgClose" class="pk-close" type="button">' + ico(ICO.close) + '</button></div>' +
					'<div class="pk-modal-body"><div style="font-size:9px;color:var(--pk-green);margin-bottom:16px">' + ico(ICO.check) + ' Already claimed today!</div>' +
					'<button id="mgClose2" class="pk-btn pk-btn-dark pk-btn-sm" type="button">Close</button></div>';
			} else {
				inner.innerHTML = '<div class="pk-modal-head"><span class="pk-modal-title">' + ico(ICO.gift) + ' ' + gift.label.toUpperCase() + '</span><button id="mgClose" class="pk-close" type="button">' + ico(ICO.close) + '</button></div>' +
					'<div class="pk-modal-body" style="padding-top:8px"><div style="font-size:48px;margin:8px 0 12px">' + ico(ICO.gift, 'gift-large') + '</div>' +
					'<div style="font-size:9px;color:var(--pk-text);margin-bottom:20px">A special gift awaits!</div>' +
					'<button id="mgClaim" class="pk-btn pk-btn-gold pk-btn-full" type="button">Open Gift!</button>' +
					'<button id="mgClose2" class="pk-btn pk-btn-ghost pk-btn-sm pk-btn-full" style="margin-top:8px" type="button">Later</button></div>';
			}
			panel.appendChild(inner);
			inner.addEventListener('pointerdown', e => e.stopPropagation());
			document.getElementById('mgClose')?.addEventListener('click', () => { panel.hidden = true; });
			document.getElementById('mgClose2')?.addEventListener('click', () => { panel.hidden = true; });
			document.getElementById('mgClaim')?.addEventListener('click', () => { claim(); panel.hidden = true; });
		}
		function autoCheck() {
			const gift = check();
			if (gift && !gift.claimed) {
				setTimeout(() => showToast(ico(ICO.gift) + ' A Mystery Gift is available today! Check the Pause menu.'), 3000);
			}
		}
		return { open, autoCheck, check };
	})();

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
	else start();

	// ── Day/night tint — update on load and every 60 seconds ─────────────────────
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => { updateDayNightTint(); setInterval(updateDayNightTint, 60000); });
	} else {
		updateDayNightTint();
		setInterval(updateDayNightTint, 60000);
	}

	// ── Extra wiring (Pokédex button, Mystery Gift auto-check) ───────────────────
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			document.getElementById('campDexBtn')?.addEventListener('click', () => Pokedex.open());
			document.getElementById('campPauseMystery')?.addEventListener('click', () => {
				const p = document.getElementById('campPause');
				if (p) p.hidden = true;
				MysteryGift.open();
			});
			MysteryGift.autoCheck();
			document.getElementById('cpPC')?.addEventListener('click', () => PCBox.open());
		});
	} else {
		document.getElementById('campDexBtn')?.addEventListener('click', () => Pokedex.open());
		document.getElementById('campPauseMystery')?.addEventListener('click', () => {
			const p = document.getElementById('campPause');
			if (p) p.hidden = true;
			MysteryGift.open();
		});
		MysteryGift.autoCheck();
		document.getElementById('cpPC')?.addEventListener('click', () => PCBox.open());
	}

	// ── Achievements panel wiring ─────────────────────────────────────────────────
	function wireAchievementsPanel() {
		document.getElementById('campAchieveBtn')?.addEventListener('click', () => {
			const panel = document.getElementById('achievePanel');
			if (!panel) return;
			panel.hidden = !panel.hidden;
			if (!panel.hidden) {
				const { defs, unlocked } = Achievements.getAll();
				const list = document.getElementById('achieveList');
				if (!list) return;
				list.innerHTML = '';
				defs.forEach(d => {
					const got = !!unlocked[d.id];
					const row = document.createElement('div');
					row.className = 'pk-achieve-row' + (got ? ' is-unlocked' : '');

					// Left icon badge
					const icoEl = document.createElement('div');
					icoEl.className = 'pk-achieve-ico';
					icoEl.innerHTML = d.icoKey ? ico(ICO[d.icoKey] || d.icoKey) : ico('question-circle');

					// Right text block
					const body = document.createElement('div');
					body.className = 'pk-achieve-body';

					const name = document.createElement('div');
					name.className = 'pk-achieve-name' + (got ? ' is-unlocked' : '');
					name.textContent = d.label;

					const desc = document.createElement('div');
					desc.className = 'pk-achieve-desc';
					desc.textContent = d.desc;

					body.appendChild(name);
					body.appendChild(desc);

					if (got) {
						const dt = document.createElement('div');
						dt.className = 'pk-achieve-date';
						dt.innerHTML = ico(ICO.check) + ' ' + new Date(unlocked[d.id]).toLocaleDateString();
						body.appendChild(dt);
					}

					row.appendChild(icoEl);
					row.appendChild(body);
					list.appendChild(row);
				});
			}
		});
		document.getElementById('achieveClose')?.addEventListener('click', () => {
			const panel = document.getElementById('achievePanel');
			if (panel) panel.hidden = true;
		});
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireAchievementsPanel);
	else wireAchievementsPanel();

	// ── Postcard button wiring ────────────────────────────────────────────────────
	function wirePostcardBtn() {
		document.getElementById('campPostcardBtn')?.addEventListener('click', () => PostcardSystem.open());
		TrainerLevel.updateHUD();
		CampRating.displayOnGate();
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wirePostcardBtn);
	else wirePostcardBtn();

	// ── Photo Mode button wiring ──────────────────────────────────────────────────
	{
		function wirePhotoBtn() {
			document.getElementById('campPhotoBtn')?.addEventListener('click', () => {
				const scene = window.__campScene;
				if (scene) PhotoMode.take(scene);
			});
		}
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wirePhotoBtn);
		else wirePhotoBtn();
	}

	// ── Shiny Collection button wiring ────────────────────────────────────────────
	{
		function wireShinyBtn() {
			document.getElementById('campShinyBtn')?.addEventListener('click', () => {
				ShinyEncounters.openCollection();
			});
		}
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireShinyBtn);
		else wireShinyBtn();
	}

	// ── Feature 1: Move Tutor ─────────────────────────────────────────────────────
	const MoveTutor = (() => {
		const SKILLS = [
			{ key: 'powerHerb',   label: 'Power Herb',   desc: '+5 friendship per berry feed', cost: 35 },
			{ key: 'lureExpert',  label: 'Lure Expert',  desc: 'Fishing zone always enlarged',  cost: 40 },
			{ key: 'rhythmEar',   label: 'Rhythm Ear',   desc: '+2 rhythm tokens per win',       cost: 45 },
			{ key: 'growthBoost', label: 'Growth Boost', desc: '+0.5 berry grow speed',          cost: 40 },
		];
		function open() {
			const existing = document.getElementById('moveTutorPanel');
			if (existing) { existing.remove(); return; }
			const panel = document.createElement('div');
			panel.id = 'moveTutorPanel';
			panel.className = 'pk-backdrop';
			panel.style.zIndex = '120';
			const inner = document.createElement('div');
			inner.className = 'pk-modal';
			inner.style.cssText = 'max-width:360px;width:min(360px,94vw)';
			const inv = Inventory.load();
			const learned = inv.tutorSkills || [];
			const tokens = inv.tokens || 0;
			let rows = '';
			SKILLS.forEach(sk => {
				const done = learned.includes(sk.key);
				rows += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08)">' +
					'<div style="flex:1">' +
						'<div style="font-size:8px;color:var(--pk-gold);margin-bottom:2px">' + sk.label + (done ? ' <span style="color:#50dd88">&#10003;</span>' : '') + '</div>' +
						'<div style="font-size:7px;color:var(--pk-muted)">' + sk.desc + '</div>' +
					'</div>' +
					(done
						? '<span style="font-size:7px;color:#50dd88;white-space:nowrap">Learned</span>'
						: '<button class="pk-btn pk-btn-gold pk-btn-sm" data-tutor-key="' + sk.key + '" type="button">' + sk.cost + ' ' + ico(ICO.token) + '</button>'
					) +
				'</div>';
			});
			inner.innerHTML = '<div class="pk-modal-head">' +
				'<span class="pk-modal-title">' + ico(ICO.star) + ' MOVE TUTOR</span>' +
				'<button class="pk-close" id="moveTutorClose" type="button">' + ico(ICO.close) + '</button>' +
				'</div>' +
				'<div class="pk-modal-body">' +
					'<div style="font-size:7px;color:var(--pk-muted);margin-bottom:12px">Teach your partner powerful new skills! Permanent — applies to all partners.</div>' +
					'<div style="font-size:7px;color:var(--pk-gold);margin-bottom:10px">' + ico(ICO.token) + ' ' + tokens + ' tokens</div>' +
					'<div id="tutorSkillList">' + rows + '</div>' +
				'</div>';
			panel.appendChild(inner);
			inner.addEventListener('pointerdown', e => e.stopPropagation());
			document.body.appendChild(panel);
			document.getElementById('moveTutorClose').addEventListener('click', () => panel.remove());
			panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
			panel.querySelectorAll('[data-tutor-key]').forEach(btn => {
				btn.addEventListener('click', () => {
					const sk = SKILLS.find(s => s.key === btn.dataset.tutorKey);
					if (!sk) return;
					const inv2 = Inventory.load();
					if ((inv2.tokens || 0) < sk.cost) { showToast(ico(ICO.token) + ' Not enough tokens!'); return; }
					if ((inv2.tutorSkills || []).includes(sk.key)) return;
					inv2.tokens -= sk.cost;
					inv2.tutorSkills = [...(inv2.tutorSkills || []), sk.key];
					Inventory.save(inv2);
					showToast(ico(ICO.star) + ' Learned ' + sk.label + '!');
					panel.remove();
					open();
				});
			});
		}
		return { open };
	})();

	// ── Feature 4: Pokémon Encyclopedia ──────────────────────────────────────────
	const PokeEncyclopedia = (window.CAMP_SYSTEMS || {}).PokeEncyclopedia;

	// ── Feature 5: Notification Bell ──────────────────────────────────────────────
	const NotifBell = (window.CAMP_SYSTEMS || {}).NotifBell;

	// ── Feature 6: Berry Breeding ─────────────────────────────────────────────────
	const BerryBreeding = (window.CAMP_SYSTEMS || {}).BerryBreeding;

})();
