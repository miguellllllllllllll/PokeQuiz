(function () {
	'use strict';

	const TILE = 16;
	const MAP_W = 40;
	const MAP_H = 30;
	const SPEED = 84; // px/sec — matches old 1.4 px/frame at 60fps

	// Tile IDs
	const TG=0,TG2=1,TP=2,TW=3,TR=4,TR2=5,TWN=6,TD=7,TH2O=8,TTR=9,TFR=10,TFY=11,TSO=12,TCR=13,TFN=14,TRP=15,TIF=16,TIW=17,TRU=18,TST=19,TSG=20,TTR2=21,TBSH=22,TTG=23,TBED=24,TBKS=25;

	const SOLID = new Set([TW, TR, TR2, TRP, TWN, TH2O, TTR, TTR2, TFN, TIW, TSG, TBSH, TBED, TBKS]);
	const ANIMATED = new Set([TWN, TH2O, TCR]);

	// Signs placed on the camp map — key is "r,c", value is the message shown when
	// the player presses E next to it. Coordinates match camp's MAP tile grid.
	const SIGN_MESSAGES = {
		'12,10': "Welcome to Trainer Camp! Walk up to the house and press E at the door to head inside.",
		'19,12': "Crops grow here — talk to the farmer at the garden gate and plant a seed on any soil tile.",
		'12,4':  "Trail to the deep woods. Watch out for wild Pokemon in the tall grass.",
	};

	// ── Wild-encounter battle system ─────────────────────────────────────────────
	// Self-contained DOM-overlay battle UI: shows a spinning wheel that picks one
	// of four minigames at random, runs that minigame, and reports the result via
	// the callback passed to Battle.start(). Wins award Friendship Berries.
	const Battle = (() => {
		const TYPES = ['fire', 'water', 'grass'];
		const TYPE_EMOJI = { fire: '🔥', water: '💧', grass: '🌿', electric: '⚡', psychic: '🔮', fairy: '✨', normal: '⭐' };
		// Effectiveness multiplier: TYPES[attacker] vs TYPES[defender].
		// Standard fire→grass, grass→water, water→fire.
		const EFFECTIVENESS = {
			fire:   { fire: 1, water: 0.5, grass: 2 },
			water:  { fire: 2, water: 1, grass: 0.5 },
			grass:  { fire: 0.5, water: 2, grass: 1 },
		};
		// Pokémon used for sketch/foe — id, name, type. Sprites from PokeAPI CDN.
		const POKEMON = [
			{ id: 1, name: 'Bulbasaur', type: 'grass' },
			{ id: 4, name: 'Charmander', type: 'fire' },
			{ id: 7, name: 'Squirtle',  type: 'water' },
			{ id: 25, name: 'Pikachu',  type: 'electric' },
			{ id: 35, name: 'Clefairy', type: 'fairy' },
			{ id: 39, name: 'Jigglypuff', type: 'normal' },
			{ id: 54, name: 'Psyduck',  type: 'water' },
			{ id: 60, name: 'Poliwag',  type: 'water' },
			{ id: 63, name: 'Abra',     type: 'psychic' },
			{ id: 133, name: 'Eevee',   type: 'normal' },
		];
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
			// Reset wheel UI
			const disc = $('cbWheelDisc');
			if (disc) disc.style.transform = 'rotate(0deg)';
			const wr = $('cbWheelResult');
			if (wr) { wr.hidden = true; wr.textContent = ''; }
			const sb = $('cbSpinBtn');
			if (sb) { sb.disabled = false; sb.textContent = 'Spin!'; }
			show('wheel');
			// Play a random encounter cry and switch to battle music.
			const randomPoke = POKEMON[Math.floor(Math.random() * POKEMON.length)];
			Sound.cry(randomPoke.id);
			Music.start('battle');
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

		function startMinigame(key) {
			if (key === 'card')    startCard();
			else if (key === 'rps')    startRps();
			else if (key === 'rhythm') startRhythm();
			else if (key === 'sketch') startSketch();
		}

		// ── Card battle ───────────────────────────────────────────────────────────
		function startCard() {
			show('card');
			const foeType = TYPES[Math.floor(Math.random() * TYPES.length)];
			$('cbCardFoe').textContent = 'A wild ' + (TYPE_EMOJI[foeType] || '') + ' ' + foeType.toUpperCase() + ' Pokémon appears!';
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
				btn.innerHTML = (TYPE_EMOJI[t] || '') + ' ' + t.toUpperCase() + '<span class="cb-card-tag">(?)</span>';
				btn.addEventListener('click', () => {
					const won = eff >= 1;
					res.hidden = false;
					res.textContent = won
						? '✅ ' + tag + '! You won the battle.'
						: '❌ ' + tag + '. The wild Pokémon got away.';
					handEl.querySelectorAll('button').forEach(b => {
						b.disabled = true;
						const bType = b.dataset.cardType;
						const bEff = EFFECTIVENESS[bType]?.[foeType] ?? 1;
						const tagEl = b.querySelector('.cb-card-tag');
						if (tagEl) tagEl.textContent = '(' + (bEff > 1 ? 'super' : bEff < 1 ? 'weak' : 'ok') + ')';
					});
					setTimeout(() => end(won), 1500);
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
				foe.textContent = 'Foe picked ' + (TYPE_EMOJI[ai] || '') + ' ' + ai.toUpperCase() + '. You picked ' + (TYPE_EMOJI[player] || '') + ' ' + player.toUpperCase() + '.';
				const eff = EFFECTIVENESS[player][ai];
				const won = eff >= 1;
				res.hidden = false;
				res.textContent = eff > 1 ? '✅ Super effective! You won.' : eff < 1 ? '❌ Not very effective. You lost.' : '🤝 Standoff — you held your ground.';
				btns.forEach(b => b.removeEventListener('click', handler));
				setTimeout(() => end(won), 1500);
			};
			btns.forEach(b => b.addEventListener('click', handler, { once: true }));
		}

		// ── Rhythm strike ─────────────────────────────────────────────────────────
		function startRhythm() {
			show('rhythm');
			const cursor = $('cbRhythmCursor');
			const score = $('cbRhythmScore');
			const res = $('cbRhythmResult');
			res.hidden = true;
			let pos = 0;
			let dir = 1;
			let hits = 0;
			let misses = 0;
			const SPEED = 2.2;
			const target = (pct) => Math.max(0, Math.min(100, pct));
			let raf = null;
			const tick = () => {
				pos += dir * SPEED;
				if (pos >= 100) { pos = 100; dir = -1; }
				if (pos <= 0)   { pos = 0;   dir =  1; }
				cursor.style.left = target(pos) + '%';
				raf = requestAnimationFrame(tick);
			};
			tick();
			score.textContent = 'Hits: 0 / 3 · Misses: 0 / 3';
			const finish = (won) => {
				if (raf) cancelAnimationFrame(raf);
				document.removeEventListener('keydown', onKey);
				res.hidden = false;
				res.textContent = won ? '✅ Rhythm mastered!' : '❌ Out of sync.';
				setTimeout(() => end(won), 1300);
			};
			const onKey = (e) => {
				if (e.key !== ' ' && e.key !== 'Spacebar') return;
				e.preventDefault();
				if (pos >= 45 && pos <= 55) hits++; else misses++;
				score.textContent = 'Hits: ' + hits + ' / 3 · Misses: ' + misses + ' / 3';
				if (hits >= 3) finish(true);
				else if (misses >= 3) finish(false);
			};
			const onTap = (e) => { e.preventDefault(); onKey({ key: ' ' }); };
			const rhythmBar = document.querySelector('.cb-rhythm-bar');
			if (rhythmBar) rhythmBar.addEventListener('pointerdown', onTap);
			document.addEventListener('keydown', onKey);
			rhythmState = { stop: () => {
				if (raf) cancelAnimationFrame(raf);
				document.removeEventListener('keydown', onKey);
				if (rhythmBar) rhythmBar.removeEventListener('pointerdown', onTap);
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
					res.textContent = won ? '✅ It was ' + correct.name + '!' : '❌ It was actually ' + correct.name + '.';
					setTimeout(() => end(won), 1600);
				}, { once: true });
				btns.appendChild(b);
			});
		}

		// ── Result screen ─────────────────────────────────────────────────────────
		function end(won) {
			show('end');
			if (won) { Stats.increment('totalCatches'); Sound.win(); } else Sound.lose();
			$('cbEndTitle').textContent = won ? 'You Won!' : 'You Lost!';
			$('cbEndBody').textContent = won
				? '+1 Friendship Berry 🍓 added to your bag.'
				: 'The wild Pokémon fled with the prize. Try again!';
			const btn = $('cbEndBtn');
			btn.textContent = 'Continue';
			// Remove any handler left from a previous battle before adding the new one.
			if (_endHandler) { btn.removeEventListener('click', _endHandler); _endHandler = null; }
			const handler = () => {
				_endHandler = null;
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

		return { start, isOpen };
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
			const sellOne = $('cmSellOne');
			const sellAll = $('cmSellAll');
			const buySeed = $('cmBuySeed');
			if (sellOne) sellOne.disabled = (inv.friendshipBerries || 0) <= 0;
			if (sellAll) sellAll.disabled = (inv.friendshipBerries || 0) <= 0;
			if (buySeed) buySeed.disabled = (inv.tokens || 0) < SEED_PRICE;
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
			// Cosmetics — mark owned items and disable if already active or too poor.
			const cosm = inv.cosmetics || {};
			const tokens = inv.tokens || 0;
			document.querySelectorAll('[data-buy-wallpaper]').forEach(b => {
				const key = b.dataset.buyWallpaper;
				const active = (cosm.wallpaper || 'default') === key;
				b.disabled = active || tokens < COSM_PRICE.wallpaper;
				b.classList.toggle('cm-cosm-owned', active);
				b.textContent = active ? '✓ Active' : b.dataset.label;
			});
			document.querySelectorAll('[data-buy-accent]').forEach(b => {
				const key = b.dataset.buyAccent;
				const active = (cosm.accent || 'default') === key;
				b.disabled = active || tokens < COSM_PRICE.accent;
				b.classList.toggle('cm-cosm-owned', active);
				b.textContent = active ? '✓ Active' : b.dataset.label;
			});
			document.querySelectorAll('[data-buy-scale]').forEach(b => {
				const key = b.dataset.buyScale;
				const active = (cosm.partnerScale || 'normal') === key;
				b.disabled = active || (key !== 'normal' && tokens < COSM_PRICE.scale);
				b.classList.toggle('cm-cosm-owned', active);
				b.textContent = active ? '✓ Active' : b.dataset.label;
			});
			document.querySelectorAll('[data-buy-decor]').forEach(b => {
				const key = b.dataset.buyDecor;
				const owned = (cosm.decor || []).includes(key);
				b.disabled = owned || tokens < COSM_PRICE[key];
				b.classList.toggle('cm-cosm-owned', owned);
				b.textContent = owned
					? '✓ ' + b.dataset.label + ' (placed)'
					: b.dataset.label + ' · ' + (b.dataset.price || COSM_PRICE[key]) + '💰';
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
				inv.tokens = (inv.tokens || 0) + BERRY_PRICE;
				Inventory.save(inv);
				setStatus('Sold 1 berry for ' + BERRY_PRICE + ' Tokens.');
				refresh();
			});
			$('cmSellAll') && $('cmSellAll').addEventListener('click', () => {
				const inv = Inventory.load();
				const n = inv.friendshipBerries || 0;
				if (n <= 0) return;
				inv.friendshipBerries = 0;
				inv.tokens = (inv.tokens || 0) + n * BERRY_PRICE;
				Inventory.save(inv);
				setStatus('Sold ' + n + ' berries for ' + (n * BERRY_PRICE) + ' Tokens.');
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
			$('cmClose') && $('cmClose').addEventListener('click', close);

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
	const RoomEditor = (() => {
		let openFlag = false;
		let activeScene = 'upstairs';
		let placingKey = null;
		function $(id) { return document.getElementById(id); }

		function itemsForScene() {
			return activeScene === 'house' ? HOUSE_ITEMS : ROOM_ITEMS;
		}

		function invKeysForScene() {
			return activeScene === 'house'
				? { ownedKey: 'houseRoomItems', placementsKey: 'housePlacements' }
				: { ownedKey: 'roomItems',      placementsKey: 'roomPlacements' };
		}

		function liveUpdate() {
			const items = itemsForScene();
			const { placementsKey } = invKeysForScene();
			const inv = Inventory.load();
			const placements = inv.cosmetics?.[placementsKey] || {};
			const scene = activeScene === 'house' ? window.__houseScene : window.__upstairsScene;
			if (!scene || !scene._roomItemObjs) return;
			Object.entries(items).forEach(([key]) => {
				const obj = scene._roomItemObjs[key];
				const pos = placements[key];
				if (obj) {
					if (pos) {
						obj.setPosition(pos.c * 16 + 8, pos.r * 16 + 8);
						obj.setVisible(true);
					} else {
						obj.setVisible(false);
					}
				}
			});
		}

		function startPlace(key) {
			placingKey = key;
			if (!window.__gridMode) window.__gridMode = {};
			window.__gridMode.active = true;
			window.__gridMode.key = key;
			window.__gridMode.sceneKey = activeScene;
			window.__gridMode.hoverR = -1;
			window.__gridMode.hoverC = -1;
			refresh();
		}

		function cancelPlace() {
			placingKey = null;
			if (window.__gridMode) window.__gridMode.active = false;
			refresh();
		}

		function confirmPlace(r, c) {
			if (!placingKey) return;
			const { ownedKey, placementsKey } = invKeysForScene();
			const i = Inventory.load();
			if (!i.cosmetics) i.cosmetics = {};
			if (!Array.isArray(i.cosmetics[ownedKey])) i.cosmetics[ownedKey] = [];
			if (!i.cosmetics[placementsKey]) i.cosmetics[placementsKey] = {};
			if (!i.cosmetics[ownedKey].includes(placingKey)) i.cosmetics[ownedKey].push(placingKey);
			i.cosmetics[placementsKey][placingKey] = { r, c };
			Inventory.save(i);
			cancelPlace();
			liveUpdate();
			refresh();
		}

		function refresh() {
			const list = $('creItemList');
			if (!list) return;
			const items = itemsForScene();
			const { ownedKey, placementsKey } = invKeysForScene();
			const inv = Inventory.load();
			const cosm = inv.cosmetics || {};
			const roomItems = cosm[ownedKey] || [];
			const placements = cosm[placementsKey] || {};
			const tokens = inv.tokens || 0;

			const tokEl = $('creTokens');
			if (tokEl) tokEl.textContent = tokens;

			const sceneLbl = $('creSceneLabel');
			if (sceneLbl) sceneLbl.textContent = activeScene === 'house' ? '🏠 Ground Floor' : '🛏 Bedroom';

			const placedCount = Object.keys(placements).filter(k => items[k]).length;
			const ownedCount  = roomItems.filter(k => items[k]).length;
			const summaryEl = $('creSummary');
			if (summaryEl) summaryEl.textContent = ownedCount + ' / ' + Object.keys(items).length + ' owned · ' + placedCount + ' placed';

			const banner = $('crePlacingBanner');
			if (banner) {
				if (placingKey) {
					const item = items[placingKey];
					banner.hidden = false;
					const lbl = banner.querySelector('.cre-placing-label');
					if (lbl) lbl.textContent = 'Click a tile to place ' + (item?.emoji || '') + ' ' + (item?.label?.replace(/^\S+\s/, '') || '');
				} else {
					banner.hidden = true;
				}
			}

			list.innerHTML = '';
			const cats = { furniture: [], decor: [] };
			Object.entries(items).forEach(([key, item]) => {
				(item.cat === 'decor' ? cats.decor : cats.furniture).push([key, item]);
			});
			const catLabels = { furniture: '🪑 Furniture', decor: '🌸 Decor' };

			Object.entries(cats).forEach(([cat, entries]) => {
				if (!entries.length) return;
				const hdr = document.createElement('div');
				hdr.className = 'cre-cat-header';
				hdr.textContent = catLabels[cat];
				list.appendChild(hdr);

				entries.forEach(([key, item]) => {
					const owned    = roomItems.includes(key);
					const pos      = placements[key];
					const placed   = !!pos;
					const isPlacing = placingKey === key;
					const canAfford = tokens >= item.price;

					const card = document.createElement('div');
					card.className = 'cre-item' +
						(isPlacing ? ' cre-item--placing' : placed ? ' cre-item--active' : owned ? ' cre-item--owned' : '');

					const left = document.createElement('div');
					left.className = 'cre-item-left';
					const emojiEl = document.createElement('span');
					emojiEl.className = 'cre-item-emoji';
					emojiEl.textContent = item.emoji;
					const infoEl = document.createElement('div');
					infoEl.className = 'cre-item-info';
					const labelEl = document.createElement('div');
					labelEl.className = 'cre-item-label';
					labelEl.textContent = item.label.replace(/^\S+\s/, '');
					const statusEl = document.createElement('div');
					statusEl.className = 'cre-item-status' +
						(isPlacing ? ' cre-item-status--placing' : placed ? ' cre-item-status--active' : !owned ? ' cre-item-status--price' : '');
					statusEl.textContent = isPlacing ? '\u2196 Click a tile\u2026' : placed ? '\u2713 Placed' : owned ? 'In inventory' : item.price + ' \U0001f4b0';
					infoEl.appendChild(labelEl);
					infoEl.appendChild(statusEl);
					left.appendChild(emojiEl);
					left.appendChild(infoEl);

					const right = document.createElement('div');
					right.className = 'cre-item-right';

					if (isPlacing) {
						const cancelBtn = document.createElement('button');
						cancelBtn.className = 'cre-btn cre-btn--cancel';
						cancelBtn.type = 'button';
						cancelBtn.textContent = 'Cancel';
						cancelBtn.addEventListener('click', cancelPlace);
						right.appendChild(cancelBtn);
					} else if (placed) {
						const moveBtn = document.createElement('button');
						moveBtn.className = 'cre-btn cre-btn--activate';
						moveBtn.type = 'button';
						moveBtn.textContent = 'Move';
						moveBtn.addEventListener('click', () => startPlace(key));
						const removeBtn = document.createElement('button');
						removeBtn.className = 'cre-btn cre-btn--remove';
						removeBtn.type = 'button';
						removeBtn.textContent = '\u2715 Remove';
						removeBtn.addEventListener('click', () => {
							const i = Inventory.load();
							if (!i.cosmetics) i.cosmetics = {};
							if (!i.cosmetics[placementsKey]) i.cosmetics[placementsKey] = {};
							delete i.cosmetics[placementsKey][key];
							Inventory.save(i);
							liveUpdate(); refresh();
						});
						right.appendChild(moveBtn);
						right.appendChild(removeBtn);
					} else if (owned) {
						const placeBtn = document.createElement('button');
						placeBtn.className = 'cre-btn cre-btn--activate';
						placeBtn.type = 'button';
						placeBtn.textContent = 'Place';
						placeBtn.addEventListener('click', () => startPlace(key));
						right.appendChild(placeBtn);
					} else {
						const buyBtn = document.createElement('button');
						buyBtn.className = 'cre-btn cre-btn--buy';
						buyBtn.type = 'button';
						buyBtn.textContent = 'Buy';
						buyBtn.disabled = !canAfford;
						buyBtn.addEventListener('click', () => {
							const i = Inventory.load();
							if ((i.tokens || 0) < item.price) return;
							i.tokens -= item.price;
							if (!i.cosmetics) i.cosmetics = {};
							if (!Array.isArray(i.cosmetics[ownedKey])) i.cosmetics[ownedKey] = [];
							i.cosmetics[ownedKey].push(key);
							Inventory.save(i);
							liveUpdate(); refresh();
							startPlace(key);
						});
						right.appendChild(buyBtn);
					}

					card.appendChild(left);
					card.appendChild(right);
					list.appendChild(card);
				});
			});
		}

		function open() {
			const panel = $('campRoomEditor');
			if (!panel) return;
			panel.hidden = false;
			openFlag = true;
			refresh();
		}

		function close() {
			cancelPlace();
			const panel = $('campRoomEditor');
			if (panel) panel.hidden = true;
			openFlag = false;
		}

		function isOpen() { return openFlag; }

		function showEditBtn(show, sceneKey) {
			if (show && sceneKey) activeScene = sceneKey;
			const btn = $('campRoomEditBtn');
			if (btn) btn.hidden = !show;
			if (!show) close();
		}

		function wire() {
			const btn = $('campRoomEditBtn');
			if (btn && !btn.dataset.wired) {
				btn.dataset.wired = '1';
				btn.addEventListener('click', () => openFlag ? close() : open());
			}
			const closeBtn = $('creClose');
			if (closeBtn && !closeBtn.dataset.wired) {
				closeBtn.dataset.wired = '1';
				closeBtn.addEventListener('click', close);
			}
		}

		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
		else wire();

		return { open, close, isOpen, showEditBtn, liveUpdate, confirmPlace, wire };
	})();

	// ── Partner Pokémon panel — dedicated page for the follower ─────────────────
	const Partner = (() => {
		let openFlag = false;
		function $(id) { return document.getElementById(id); }
		function refresh() {
			const inv = Inventory.load();
			const form = FOLLOWER_FORMS[inv.eeveeForm || 'eevee'] || FOLLOWER_FORMS.eevee;
			const portrait = $('cpPortrait');
			if (portrait) {
				// Render south-idle frame at 3× scale by scaling both the element and
				// the background-size directly (avoids CSS transform layout hacks).
				const PS = 3;
				portrait.style.backgroundImage = "url('Pictures/sprites/" + form.sheet + ".png')";
				portrait.style.backgroundPosition = '0 0';
				portrait.style.backgroundSize = (form.frameW * form.cols * PS) + 'px ' + (form.frameH * 8 * PS) + 'px';
				portrait.style.width  = (form.frameW  * PS) + 'px';
				portrait.style.height = (form.frameH * PS) + 'px';
			}
			$('cpName') && ($('cpName').textContent = form.displayName);
			$('cpForm') && ($('cpForm').textContent = inv.eeveeForm === 'eevee' ? 'Stage 1 — can evolve' : 'Stage 2 — terminal evolution');
			const fpct = Math.min(100, Math.round(((inv.friendship || 0) / FRIENDSHIP_MAX) * 100));
			const bar = $('cpFriendshipBar');
			if (bar) bar.style.width = fpct + '%';
			$('cpFriendshipText') && ($('cpFriendshipText').textContent = (inv.friendship || 0) + ' / ' + FRIENDSHIP_MAX + (inv.eeveeForm !== 'eevee' ? ' (maxed)' : ''));
			$('cpBerries') && ($('cpBerries').textContent = inv.friendshipBerries || 0);
			const feedBtn = $('cpFeed');
			if (feedBtn) feedBtn.disabled = (inv.friendshipBerries || 0) <= 0 || (inv.eeveeForm && inv.eeveeForm !== 'eevee');
			const petBtn = $('cpPet');
			if (petBtn) petBtn.disabled = false;
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
			inv.friendshipBerries -= 1;
			inv.friendship = Math.min(FRIENDSHIP_MAX, (inv.friendship || 0) + FRIENDSHIP_PER_BERRY);
			Inventory.save(inv);
			if (inv.friendship >= FRIENDSHIP_MAX && sceneRef && typeof sceneRef._triggerEvolution === 'function') {
				close();
				sceneRef._triggerEvolution();
			} else {
				setStatus('Eevee gobbled a berry. +' + FRIENDSHIP_PER_BERRY + ' Friendship!', 'good');
				refresh();
			}
		}
		function pet() {
			setStatus('You give your partner a good pet.   (≧◡≦)', 'good');
		}
		function wire(scene) {
			const root = $('campPartner');
			if (!root || root.dataset.wired) { return; }
			root.dataset.wired = '1';
			$('cpClose') && $('cpClose').addEventListener('click', close);
			$('cpFeed') && $('cpFeed').addEventListener('click', () => feed(scene));
			$('cpPet') && $('cpPet').addEventListener('click', pet);
			// Nickname — save on input, notify scene to update label.
			const ni = $('cpNickname');
			if (ni) ni.addEventListener('input', () => {
				saveNickname(ni.value.trim());
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
	const INVENTORY_KEY = 'pokequiz_camp_inventory';
	const NICKNAME_KEY  = 'pokequiz_partner_nickname';
	const SHINY_KEY     = 'pokequiz_partner_shiny';
	const SAVE_KEY      = 'pokequiz_last_save';
	const PLANTS_KEY = 'pokequiz_camp_plants';
	const GROW_MS = 30 * 1000; // 30 seconds — tunable; deliberately short for Phase 1
	const SEED_PRICE = 5;
	const BERRY_PRICE = 10;
	const SCYTHE_PRICE = 75;
	const SCYTHE_RADIUS = 3; // Manhattan radius around the player for a single swing
	const STONE_PRICE = 50;
	const FRIENDSHIP_PER_BERRY = 20;
	const FRIENDSHIP_MAX = 100;
	const DAILY_BONUS_KEY = 'pokequiz_camp_daily';
	const DAILY_BONUS_MS = 22 * 60 * 60 * 1000; // 22 hours so timezone shifts can't lock you out

	// Follower form data — each PMD walk sheet has its own frame size and column
	// count, so the south/east/north/west frame indices are computed per form.
	// originY values were sampled directly from each sprite's south-idle frame
	// (alpha bounding box) so the feet sit at the world anchor cleanly.
	const FOLLOWER_FORMS = {
		eevee:    { sheet: 'eevee',    cols: 7, originY: 30/48, scale: 0.80, frameW: 40, frameH: 48, displayName: 'Eevee' },
		vaporeon: { sheet: 'vaporeon', cols: 4, originY: 32/48, scale: 0.58, frameW: 32, frameH: 48, displayName: 'Vaporeon' },
		espeon:   { sheet: 'espeon',   cols: 4, originY: 31/48, scale: 0.60, frameW: 32, frameH: 48, displayName: 'Espeon' },
		umbreon:  { sheet: 'umbreon',  cols: 4, originY: 28/40, scale: 0.60, frameW: 32, frameH: 40, displayName: 'Umbreon' },
		flareon:  { sheet: 'flareon',  cols: 4, originY: 28/40, scale: 0.72, frameW: 32, frameH: 40, displayName: 'Flareon' },
		jolteon:  { sheet: 'jolteon',  cols: 4, originY: 29/40, scale: 0.72, frameW: 32, frameH: 40, displayName: 'Jolteon' },
		leafeon:  { sheet: 'leafeon',  cols: 4, originY: 32/48, scale: 0.60, frameW: 32, frameH: 48, displayName: 'Leafeon' },
	};
	// ── Cosmetic lookup tables ────────────────────────────────────────────────────
	const WALLPAPER_BG = {
		default: { house: '#1a0e08', upstairs: '#140a18' },
		sakura:  { house: '#2e0e16', upstairs: '#280c14' },
		ocean:   { house: '#081428', upstairs: '#060e1e' },
		forest:  { house: '#081e08', upstairs: '#061806' },
		dusk:    { house: '#180828', upstairs: '#140620' },
	};
	const ACCENT_HEX = {
		default: '#f6c84c',
		red:     '#e84040',
		blue:    '#4488ff',
		green:   '#40c870',
	};
	const SCALE_MULT = { normal: 1.0, small: 0.68, large: 1.38 };
	// Fixed world-pixel positions for static decor objects (TILE = 16)
	const DECOR_POS = {
		flowers: { x: 14 * 16 + 8, y: 10 * 16 + 8 },
		lantern: { x:  9 * 16 + 8, y: 13 * 16 + 8 },
	};
	const COSM_PRICE = { wallpaper: 15, accent: 20, scale: 10, flowers: 25, lantern: 30 };
	const ROOM_ITEMS = {
		// Furniture
		desk:    { label: '🖥️ Study Desk',   price: 30, emoji: '🖥️', r: 3, c: 8, cat: 'furniture' },
		lamp:    { label: '🪔 Cozy Lamp',    price: 20, emoji: '🪔', r: 3, c: 9, cat: 'furniture' },
		radio:   { label: '📻 Music Player', price: 25, emoji: '📻', r: 3, c: 2, cat: 'furniture' },
		mirror:  { label: '🪞 Mirror',       price: 30, emoji: '🪞', r: 6, c: 2, cat: 'furniture' },
		gaming:  { label: '🎮 Game Console', price: 35, emoji: '🎮', r: 3, c: 6, cat: 'furniture' },
		curtain: { label: '🪟 Window',       price: 20, emoji: '🪟', r: 2, c: 10, cat: 'furniture' },
		// Decor
		plant:   { label: '🪴 Indoor Plant', price: 20, emoji: '🪴', r: 6, c: 9, cat: 'decor' },
		poster:  { label: '🖼️ Wall Art',     price: 15, emoji: '🖼️', r: 2, c: 6, cat: 'decor' },
		trophy:  { label: '🏆 Trophy',       price: 40, emoji: '🏆', r: 2, c: 2, cat: 'decor' },
		book:    { label: '📖 Story Books',  price: 15, emoji: '📖', r: 2, c: 4, cat: 'decor' },
		bear:    { label: '🧸 Stuffed Bear', price: 15, emoji: '🧸', r: 6, c: 7, cat: 'decor' },
		stars:   { label: '⭐ Star Mobile',  price: 25, emoji: '⭐', r: 5, c: 4, cat: 'decor' },
	};

	const HOUSE_ITEMS = {
		// Furniture
		tv:       { label: '📺 Television',  price: 40, emoji: '📺', r: 2, c: 5,  cat: 'furniture' },
		couch:    { label: '🛋️ Couch',       price: 35, emoji: '🛋️', r: 5, c: 4,  cat: 'furniture' },
		bookcase: { label: '📚 Bookcase',    price: 30, emoji: '📚', r: 2, c: 9,  cat: 'furniture' },
		clock:    { label: '🕰️ Wall Clock',  price: 25, emoji: '🕰️', r: 2, c: 7,  cat: 'furniture' },
		floorlamp:{ label: '🕯️ Floor Lamp',  price: 20, emoji: '🕯️', r: 5, c: 13, cat: 'furniture' },
		// Decor
		plant:    { label: '🌿 Floor Plant', price: 20, emoji: '🌿', r: 2, c: 2,  cat: 'decor' },
		kettle:   { label: '🫖 Tea Kettle',  price: 15, emoji: '🫖', r: 9, c: 4,  cat: 'decor' },
		vase:     { label: '💐 Flower Vase', price: 20, emoji: '💐', r: 9, c: 11, cat: 'decor' },
		frame:    { label: '🖼️ Photo Frame', price: 15, emoji: '🖼️', r: 2, c: 11, cat: 'decor' },
		plush:    { label: '🐱 Plush Cat',   price: 25, emoji: '🐱', r: 7, c: 12, cat: 'decor' },
	};

	const Inventory = (() => {
		const DEFAULT = {
			seeds: 3, friendshipBerries: 0, tokens: 0, friendship: 0,
			eeveeForm: 'eevee', stone: null,
			hasScythe: false, scytheEquipped: false,
			cosmetics: { wallpaper: 'default', accent: 'default', partnerScale: 'normal', decor: [], roomItems: [], roomPlacements: {}, houseRoomItems: [], housePlacements: {} },
		};
		function load() {
			try {
				const raw = localStorage.getItem(INVENTORY_KEY);
				if (raw) {
					const parsed = JSON.parse(raw);
					// Deep-merge cosmetics so new keys added to DEFAULT are always present.
					const cosm = Object.assign({}, DEFAULT.cosmetics, parsed.cosmetics || {});
					if (!Array.isArray(cosm.decor)) cosm.decor = [];
					if (!Array.isArray(cosm.roomItems)) cosm.roomItems = [];
					if (!cosm.roomPlacements || typeof cosm.roomPlacements !== 'object') cosm.roomPlacements = {};
					if (cosm.roomActive) {
						Object.entries(cosm.roomActive).forEach(([k, v]) => {
							if (v && ROOM_ITEMS[k] && !cosm.roomPlacements[k])
								cosm.roomPlacements[k] = { r: ROOM_ITEMS[k].r, c: ROOM_ITEMS[k].c };
						});
						delete cosm.roomActive;
					}
					if (!Array.isArray(cosm.houseRoomItems)) cosm.houseRoomItems = [];
					if (!cosm.housePlacements || typeof cosm.housePlacements !== 'object') cosm.housePlacements = {};
					if (cosm.houseRoomActive) {
						Object.entries(cosm.houseRoomActive).forEach(([k, v]) => {
							if (v && HOUSE_ITEMS[k] && !cosm.housePlacements[k])
								cosm.housePlacements[k] = { r: HOUSE_ITEMS[k].r, c: HOUSE_ITEMS[k].c };
						});
						delete cosm.houseRoomActive;
					}
					return Object.assign({}, DEFAULT, parsed, { cosmetics: cosm });
				}
			} catch {}
			return Object.assign({}, DEFAULT, { cosmetics: Object.assign({}, DEFAULT.cosmetics) });
		}
		function save(inv) {
			try { localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv)); } catch {}
		}
		return { load, save };
	})();
	const Plants = (() => {
		function load() {
			try {
				const raw = localStorage.getItem(PLANTS_KEY);
				if (raw) return JSON.parse(raw);
			} catch {}
			return [];
		}
		function save(plants) {
			try { localStorage.setItem(PLANTS_KEY, JSON.stringify(plants)); } catch {}
		}
		return { load, save };
	})();

	// Camp NPCs. Stationary for Phase 1 — each renders frame 0 of its walk sheet
	// (south-facing idle) and uses Manhattan-1 adjacency for the E-key dialog.
	// ── Sound — synthesized 8-bit beeps via Web Audio, no asset downloads ────────
	const Sound = (() => {
		let ctx = null;
		let enabled = true;
		function ensure() {
			try {
				if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
				if (ctx.state === 'suspended') ctx.resume();
			} catch (e) { ctx = null; }
			return ctx;
		}
		function play(notes, duration, type, vol) {
			if (!enabled) return;
			const c = ensure();
			if (!c) return;
			const t0 = c.currentTime;
			const dur = duration || 0.08;
			const v = vol == null ? 0.05 : vol;
			notes.forEach((freq, i) => {
				const osc = c.createOscillator();
				const gain = c.createGain();
				osc.connect(gain).connect(c.destination);
				osc.frequency.value = freq;
				osc.type = type || 'square';
				const startT = t0 + i * dur;
				gain.gain.setValueAtTime(v, startT);
				gain.gain.exponentialRampToValueAtTime(0.001, startT + dur);
				osc.start(startT);
				osc.stop(startT + dur + 0.02);
			});
		}
		function chord(notes, duration, type, vol) {
			if (!enabled) return;
			const c = ensure();
			if (!c) return;
			const t0 = c.currentTime;
			const dur = duration || 0.18;
			const v = vol == null ? 0.04 : vol;
			notes.forEach(freq => {
				const osc = c.createOscillator();
				const gain = c.createGain();
				osc.connect(gain).connect(c.destination);
				osc.frequency.value = freq;
				osc.type = type || 'square';
				gain.gain.setValueAtTime(v, t0);
				gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
				osc.start(t0);
				osc.stop(t0 + dur + 0.02);
			});
		}
		// Resume audio context on the first user gesture (browser autoplay policy).
		const prime = () => ensure();
		document.addEventListener('pointerdown', prime, { once: true });
		document.addEventListener('keydown', prime, { once: true });
		function setEnabled(on) { enabled = !!on; }
		return {
			plant:   () => play([392, 523],            0.07, 'triangle'),
			harvest: () => play([523, 659, 784],       0.09, 'triangle'),
			scythe:  () => play([880, 660, 440],       0.05, 'sawtooth', 0.05),
			equip:   () => play([523, 784],            0.06, 'square'),
			chime:   () => play([880],                 0.10, 'sine'),
			door:    () => play([330, 220],            0.10, 'square'),
			win:     () => play([523, 659, 784, 1047], 0.10, 'square'),
			lose:    () => play([392, 330, 262],       0.15, 'square'),
			spin:    () => play([440, 494, 523, 587],  0.05, 'square'),
			evolve:  () => chord([523, 659, 784, 1047], 0.6,  'triangle'),
			click:   () => play([880],                 0.04, 'square', 0.03),
			// Pokémon cry — unique 3-note sweep derived from Pokémon ID.
			cry: (id) => {
				const n = (id || 1);
				const base = 180 + (n * 47 % 280);
				play([base, base * (1 + (n * 7 % 9) / 18), base * (0.8 + (n * 3 % 5) / 20)], 0.13, 'sine', 0.06);
			},
			setEnabled,
			isEnabled: () => enabled,
		};
	})();

	// ── Background music ─────────────────────────────────────────────────────────
	// Streams real Pokémon MP3s from archive.org via HTML5 Audio.
	// Falls back to silence gracefully if the network is unavailable.
	// battle keeps the synthesised square-wave loop so it doesn't need a network
	// round-trip when a wild encounter fires mid-session.
	const Music = (() => {
		const BASE = 'https://archive.org/download/pkmn-frlg-soundtrack/Disc%201/';
		const URLS = {
			camp:     BASE + '04%20-%20Pallet%20Town.mp3',
			house:    BASE + '16%20-%20Pok%C3%A9mon%20Center.mp3',
			upstairs: BASE + '12%20-%20Route%201.mp3',
		};

		let current = null;   // the active HTMLAudioElement
		let area    = null;
		let on      = true;

		// Battle stays synthesised — fast, no network latency on encounter.
		let musicCtx = null;
		let battleOscs = [];
		let battleTimer = null;
		const BATTLE_NOTES = [440,.09,494,.09,523,.09,587,.09,523,.09,440,.18,415,.09,440,.18];

		function ensureCtx() {
			try {
				if (!musicCtx) musicCtx = new (window.AudioContext || window.webkitAudioContext)();
				if (musicCtx.state === 'suspended') musicCtx.resume();
			} catch(e) { musicCtx = null; }
			return musicCtx;
		}

		function playBattleLoop() {
			if (!on || area !== 'battle') return;
			const c = ensureCtx();
			if (!c) return;
			let t = c.currentTime, totalDur = 0;
			const notes = BATTLE_NOTES;
			for (let i = 0; i < notes.length; i += 2) {
				const freq = notes[i], dur = notes[i+1];
				const osc = c.createOscillator(), g = c.createGain();
				osc.connect(g).connect(c.destination);
				osc.frequency.value = freq; osc.type = 'square';
				g.gain.setValueAtTime(0.020, t);
				g.gain.exponentialRampToValueAtTime(0.0001, t + dur - 0.01);
				osc.start(t); osc.stop(t + dur);
				battleOscs.push(osc);
				t += dur; totalDur += dur;
			}
			battleTimer = setTimeout(() => {
				battleOscs = battleOscs.filter(o => { try { o.stop(0); } catch {} return false; });
				playBattleLoop();
			}, (totalDur - 0.05) * 1000);
		}

		function stopBattle() {
			if (battleTimer) { clearTimeout(battleTimer); battleTimer = null; }
			battleOscs.forEach(o => { try { o.stop(0); } catch {} });
			battleOscs = [];
		}

		// Preload all tracks immediately so there's no network lag when start() fires.
		const _pool = {};
		Object.entries(URLS).forEach(([key, url]) => {
			const a = new Audio();
			a.preload = 'auto';
			a.loop    = true;
			a.volume  = 0.45;
			a.src     = url;   // setting src starts buffering
			_pool[key] = a;
		});

		function stopAudio() {
			if (current) {
				current.pause();
				current.currentTime = 0;
				current = null;
			}
		}

		function start(key) {
			if (!on) return;
			if (area === key) return;
			stop();
			area = key;
			if (key === 'battle') { playBattleLoop(); return; }
			const audio = _pool[key];
			if (!audio) return;
			audio.currentTime = 0;
			audio.play().catch(() => {});   // browsers may block until a gesture
			current = audio;
		}

		function stop() {
			area = null;
			stopAudio();
			stopBattle();
		}

		function setEnabled(flag) {
			on = !!flag;
			if (!on) { stop(); return; }
			try { localStorage.setItem('pokequiz_music_on', flag ? '1' : '0'); } catch {}
		}
		function isEnabled() { return on; }
		try { const saved = localStorage.getItem('pokequiz_music_on'); if (saved === '0') on = false; } catch {}

		return { start, stop, setEnabled, isEnabled };
	})();

	// ── Stats tracking ───────────────────────────────────────────────────────────
	const STATS_KEY = 'pokequiz_camp_stats';
	const Stats = (() => {
		const DEFAULT = { totalCatches: 0, totalHarvests: 0, totalDaysPlayed: 0, loginStreak: 0, totalTokensEarned: 0 };
		function load() {
			try { const r = localStorage.getItem(STATS_KEY); return r ? Object.assign({}, DEFAULT, JSON.parse(r)) : Object.assign({}, DEFAULT); } catch { return Object.assign({}, DEFAULT); }
		}
		function save(s) { try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {} }
		function increment(field, by) { const s = load(); s[field] = (s[field] || 0) + (by || 1); save(s); }
		return { load, increment };
	})();

	// ── Daily login bonus ────────────────────────────────────────────────────────
	const Daily = (() => {
		function lastClaim() {
			try { return Number(localStorage.getItem(DAILY_BONUS_KEY) || 0); } catch { return 0; }
		}
		function ready() { return (Date.now() - lastClaim()) >= DAILY_BONUS_MS; }
		function claim() {
			const inv = Inventory.load();
			inv.tokens = (inv.tokens || 0) + 20;
			inv.seeds = (inv.seeds || 0) + 1;
			Inventory.save(inv);
			const prevClaim = lastClaim();
			try { localStorage.setItem(DAILY_BONUS_KEY, String(Date.now())); } catch {}
			// Update stats: streak continues if last claim was within 48h.
			const s = Stats.load();
			const hoursSince = prevClaim ? (Date.now() - prevClaim) / 3600000 : 999;
			s.loginStreak = (prevClaim && hoursSince < 48) ? (s.loginStreak || 0) + 1 : 1;
			s.totalDaysPlayed = (s.totalDaysPlayed || 0) + 1;
			s.totalTokensEarned = (s.totalTokensEarned || 0) + 20;
			Stats.save(s);
		}
		function hoursLeft() {
			const ms = DAILY_BONUS_MS - (Date.now() - lastClaim());
			return Math.max(0, Math.ceil(ms / (60 * 60 * 1000)));
		}
		return { ready, claim, hoursLeft };
	})();

	const NPCS = [
		{
			key: 'mart-keeper', species: 'pikachu', r: 14, c: 13,
			label: 'Shop',
			spriteScale: 0.55, frameHeight: 40,
			kind: 'mart',
			dialog: "Welcome to my shop! I buy berries and sell seeds — opening the mart now.",
		},
		{
			key: 'farmer', species: 'bulbasaur', r: 19, c: 19,
			label: 'Talk',
			spriteScale: 0.6, frameHeight: 40,
			dialog: "These plots love a good seed! Plant one on any soil tile and check back in a bit for a Friendship Berry.",
		},
	];

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
		set(12,4,TSG);

		// Sprinkle autumn-tree variants and bushes for visual variety
		const variant = [[3,17],[5,15],[7,17],[12,2],[19,3],[23,2],[27,5]];
		variant.forEach(([r,c]) => { if (map[r][c] === TTR) map[r][c] = TTR2; });
		const bushes = [[14,8],[16,9],[18,8],[22,9],[24,7],[26,9],[6,20],[5,29],[8,32]];
		bushes.forEach(([r,c]) => { if (map[r][c] === TG || map[r][c] === TG2) map[r][c] = TBSH; });

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
	const Dialog = (() => {
		let box, text, cont;
		let fullText = '', shownLen = 0, revealTimer = 0;
		let isOpenFlag = false;
		const CHARS_PER_TICK = 1.6;
		function ensureRefs() {
			if (!box) {
				box = document.getElementById('campDialog');
				text = document.getElementById('campDialogText');
				cont = document.getElementById('campDialogCont');
			}
			return !!box;
		}
		function open(message) {
			if (!ensureRefs()) return;
			fullText = message;
			shownLen = 0;
			revealTimer = 0;
			text.textContent = '';
			cont.hidden = true;
			box.hidden = false;
			isOpenFlag = true;
		}
		function tick() {
			if (!isOpenFlag) return;
			if (shownLen < fullText.length) {
				revealTimer += CHARS_PER_TICK;
				const reveal = Math.min(fullText.length, Math.floor(shownLen + revealTimer));
				if (reveal > shownLen) {
					shownLen = reveal;
					revealTimer = 0;
					text.textContent = fullText.slice(0, shownLen);
				}
				if (shownLen >= fullText.length) cont.hidden = false;
			}
		}
		function advance() {
			if (!isOpenFlag) return;
			if (shownLen < fullText.length) {
				shownLen = fullText.length;
				text.textContent = fullText;
				cont.hidden = false;
			} else {
				close();
			}
		}
		function close() {
			if (!box) return;
			box.hidden = true;
			isOpenFlag = false;
			fullText = ''; shownLen = 0;
		}
		function isOpen() { return isOpenFlag; }
		// Tap anywhere on the dialog box to advance — essential for touch users.
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				document.getElementById('campDialog')?.addEventListener('pointerup', advance);
			});
		} else {
			document.getElementById('campDialog')?.addEventListener('pointerup', advance);
		}
		return { open, tick, advance, close, isOpen };
	})();

	// ── Touch action flags ────────────────────────────────────────────────────────
	// On-screen buttons set these; each scene's update() consumes them once so
	// they behave like a keyboard JustDown (fire once per tap, not every frame).
	const TouchActions = (() => {
		const f = {};
		return {
			fire(action)    { f[action] = true; },
			consume(action) { const v = !!f[action]; f[action] = false; return v; },
		};
	})();

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
			if (musicBtn) musicBtn.textContent = '🎵 Music: ' + (Music.isEnabled() ? 'On' : 'Off');
		};

		resumeBtn.addEventListener('click', close);
		_pauseToggleFn = () => { panel.hidden ? open() : close(); };

		// 💾 Save button — writes the current timestamp to localStorage.
		const saveBtn = document.getElementById('campPauseSave');
		if (saveBtn) {
			saveBtn.addEventListener('click', () => {
				try { localStorage.setItem(SAVE_KEY, String(Date.now())); } catch {}
				const saveTimeEl = document.getElementById('campPauseSaveTime');
				if (saveTimeEl) saveTimeEl.textContent = 'Saved at ' + new Date().toLocaleTimeString();
				Sound.chime();
			});
		}

		// 🎵 Music toggle.
		const musicBtn = document.getElementById('campPauseMusic');
		if (musicBtn) {
			// Sync initial label with saved preference (HTML default is "On").
			musicBtn.textContent = '🎵 Music: ' + (Music.isEnabled() ? 'On' : 'Off');
			musicBtn.addEventListener('click', () => {
				const next = !Music.isEnabled();
				Music.setEnabled(next);
				if (next) {
					// getScenes(true) only returns running scenes, but all scenes are paused
					// while the pause menu is open. Use _pausedKeys[0] instead.
					const sceneKey = _pausedKeys[0];
					if (sceneKey && ['camp', 'house', 'upstairs'].includes(sceneKey)) Music.start(sceneKey);
				}
				musicBtn.textContent = '🎵 Music: ' + (next ? 'On' : 'Off');
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
	const MARKET_W = 30;
	const MARKET_H = 22;
	// North-edge column where the player walks in/out of the market. Lines up
	// with camp's south-exit col (11) only conceptually — the actual transition
	// snaps the player to whichever spawn point each scene uses, so they don't
	// need to match numerically.
	const MARKET_NORTH_C = 15;
	// Vendor NPCs — each has a sprite species, a position, and a shopKind that
	// selects which inventory list opens when the player presses E on them.
	const MARKET_NPCS = [
		{
			key: 'm-pikachu', species: 'pikachu', r: 7, c: 7,
			label: 'Shop', shopKind: 'general',
			spriteScale: 0.55, frameHeight: 40,
			dialog: "Pika! Seeds and berries at the trainer's mart.",
		},
		{
			key: 'm-bulbasaur', species: 'bulbasaur', r: 7, c: 22,
			label: 'Shop', shopKind: 'berries',
			spriteScale: 0.6, frameHeight: 40,
			dialog: "Bulba! Fresh-picked berries straight from my patch.",
		},
		{
			key: 'm-vaporeon', species: 'vaporeon', r: 14, c: 7,
			label: 'Shop', shopKind: 'cosmetics',
			spriteScale: 0.6, frameHeight: 48,
			dialog: "Vapor~ Wallpapers and accents to spruce up your camp.",
		},
		{
			key: 'm-umbreon', species: 'umbreon', r: 14, c: 22,
			label: 'Shop', shopKind: 'stones',
			spriteScale: 0.6, frameHeight: 40,
			dialog: "Umbre... Evolution stones, if you've got the tokens.",
		},
	];
	// Per-vendor inventories. Action strings map to handlers in MarketShop.
	const MARKET_SHOPS = {
		general: {
			title: "Pikachu's Mart",
			items: [
				{ label: '🌱 Berry Seed',         cost: 5,  action: 'buySeed' },
				{ label: '🍓 Sell 1 Berry',       sells: 10, action: 'sellBerry' },
				{ label: '🍓 Sell All Berries',   sells: 10, action: 'sellAllBerries' },
			],
		},
		berries: {
			title: 'Berry Stand',
			items: [
				{ label: '🍓 Sell 1 Berry',     sells: 10, action: 'sellBerry' },
				{ label: '🍓 Sell All Berries', sells: 10, action: 'sellAllBerries' },
				{ label: '🌱 Berry Seed',       cost: 5,  action: 'buySeed' },
			],
		},
		cosmetics: {
			title: 'Vaporeon Boutique',
			items: [
				{ label: '🌸 Sakura Wallpaper',  cost: 15, action: 'buyWallpaper', key: 'sakura'  },
				{ label: '🌊 Ocean Wallpaper',   cost: 15, action: 'buyWallpaper', key: 'ocean'   },
				{ label: '🌲 Forest Wallpaper',  cost: 15, action: 'buyWallpaper', key: 'forest'  },
				{ label: '⭐ Dusk Wallpaper',    cost: 15, action: 'buyWallpaper', key: 'dusk'    },
				{ label: '🔴 Red Accent',        cost: 20, action: 'buyAccent',    key: 'red'    },
				{ label: '🔵 Blue Accent',       cost: 20, action: 'buyAccent',    key: 'blue'   },
				{ label: '🟢 Green Accent',      cost: 20, action: 'buyAccent',    key: 'green'  },
			],
		},
		stones: {
			title: 'Umbreon Stone Vendor',
			items: [
				{ label: '🔥 Fire Stone',    cost: 50, action: 'buyStone', key: 'fire'    },
				{ label: '⚡ Thunder Stone', cost: 50, action: 'buyStone', key: 'thunder' },
				{ label: '🌿 Leaf Stone',    cost: 50, action: 'buyStone', key: 'leaf'    },
			],
		},
	};
	// Sign text shown when standing next to each market sign tile.
	const SIGN_MESSAGES_MARKET = {
		'9,7':   "Pikachu's Mart — seeds, basics, and berry trades.",
		'9,22':  "Berry Stand — sells berries by the bunch.",
		'16,7':  "Boutique — wallpapers and camp accent colors.",
		'16,22': "Stone Vendor — evolution stones for the worthy.",
	};
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

		// Small fountain pond bottom-center for atmosphere
		fill(17, 13, 18, 16, TH2O);

		// Signs in front of each stall — text comes from SIGN_MESSAGES_MARKET
		[[9,7],[9,22],[16,7],[16,22]].forEach(([r,c]) => set(r,c,TSG));

		return map;
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
				// NPC sprite sheets (PMD walk; row 0 frame 0 used as the static idle).
				this.load.spritesheet('npc-pikachu',   'Pictures/sprites/pikachu.png',   { frameWidth: 32, frameHeight: 40 });
				this.load.spritesheet('npc-bulbasaur', 'Pictures/sprites/bulbasaur.png', { frameWidth: 40, frameHeight: 40 });
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
				for (let r = 0; r < MAP_H; r++) {
					for (let c = 0; c < MAP_W; c++) {
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

				this.dir = this.spawnFrom === 'market' ? 2 : 0;
				this.dirAnimKeys = ['walk-south', 'walk-west', 'walk-north', 'walk-east'];
				// Idle frame index per direction (frame 0 of each row)
				this.dirIdleFrame = [0, 3, 6, 9];
				this.player.setFrame(this.dirIdleFrame[this.dir]);

				// Follower (Eevee or an evolved form) — trails behind the player via a
				// position-history buffer. Each PMD walk sheet has its own column count;
				// frame indices are computed from that.
				const formKey = (Inventory.load().eeveeForm) || 'eevee';
				const form = FOLLOWER_FORMS[formKey] || FOLLOWER_FORMS.eevee;
				const cols = form.cols;
				const rowFrames = (row) => Array.from({ length: cols }, (_, i) => row * cols + i);
				const eeveeAnims = [
					[formKey + '-walk-south', rowFrames(0), 0],
					[formKey + '-walk-west',  rowFrames(6), 6 * cols],
					[formKey + '-walk-north', rowFrames(4), 4 * cols],
					[formKey + '-walk-east',  rowFrames(2), 2 * cols],
				];
				for (const [key, frames] of eeveeAnims) {
					if (!this.anims.exists(key)) {
						this.anims.create({ key, frameRate: 10, repeat: -1,
							frames: this.anims.generateFrameNumbers(form.sheet, { frames }) });
					}
				}
				this.eeveeAnimKeys = eeveeAnims.map(([k]) => k);
				this.eeveeIdleFrame = eeveeAnims.map(([,,idle]) => idle);
				this.followerForm = formKey;
				const _followerInv = Inventory.load();
				const _scaleMult = SCALE_MULT[_followerInv.cosmetics?.partnerScale] ?? 1;
				this.follower = this.add.sprite(this.player.x, this.player.y + 14, form.sheet, this.eeveeIdleFrame[0]);
				this.follower.setOrigin(0.5, form.originY);
				this.follower.setScale(form.scale * _scaleMult);
				this._followerScaleMult = _scaleMult;
				this.follower.setDepth(3.5);

				// Nickname label — HTML overlay for crisp rendering at any DPR.
				this._followerNameEl = document.getElementById('campFollowerName');
				this._updateFollowerLabel = () => {
					const el = this._followerNameEl;
					if (!el) return;
					const nick = Partner.loadNickname();
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

				// scale; the player dot is overlaid every frame in updateMinimap().
				this.minimapEl = document.getElementById('campMinimap');
				if (this.minimapEl) {
					this.minimapEl.width = MAP_W * 3;
					this.minimapEl.height = MAP_H * 3;
					const mctx = this.minimapEl.getContext('2d');
					mctx.imageSmoothingEnabled = false;
					for (let r = 0; r < MAP_H; r++) {
						for (let c = 0; c < MAP_W; c++) {
							mctx.fillStyle = miniMapColor(this.map[r][c]);
							mctx.fillRect(c*3, r*3, 3, 3);
						}
					}
					this.minimapBase = mctx.getImageData(0, 0, this.minimapEl.width, this.minimapEl.height);
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
					if (npc) return { kind: 'npc', r, c, message: npc.dialog, label: npc.label, npcKind: npc.kind };
					if (!this.map[r] || this.map[r][c] === undefined) continue;
					const t = this.map[r][c];
					if (t === TSG) {
						const msg = SIGN_MESSAGES[r + ',' + c];
						if (msg) return { kind: 'sign', r, c, message: msg };
					}
					if (t === TD) return { kind: 'door', r, c };
					// Soil tile — plant if free + have seeds, harvest if ripe, status otherwise.
					if (t === TSO || t === TCR) {
						const plant = this._findPlantAt(r, c);
						if (plant) {
							const elapsed = Date.now() - plant.plantedAt;
							const ripe = elapsed >= GROW_MS;
							if (ripe) return { kind: 'harvest', r, c, label: 'Harvest' };
							const pct = Math.min(99, Math.floor(elapsed / GROW_MS * 100));
							const remaining = Math.max(1, Math.ceil((GROW_MS - elapsed) / 1000));
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
					const pct = Math.min(1, elapsed / GROW_MS);
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
						const remaining = Math.max(1, Math.ceil((GROW_MS - elapsed) / 1000));
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
					if (inv.seeds <= 0) {
						Dialog.open('You have no seeds! Talk to the farmer or check the soil later.');
						return true;
					}
					inv.seeds -= 1;
					Inventory.save(inv);
					this.plants.push({ r: target.r, c: target.c, plantedAt: Date.now() });
					Plants.save(this.plants);
					this._refreshPlantSprites();
					Sound.plant();
					return true;
				}
				if (target.kind === 'harvest') {
					this.plants = this.plants.filter(p => !(p.r === target.r && p.c === target.c));
					inv.friendshipBerries = (inv.friendshipBerries || 0) + 1;
					let replantMsg = '';
					if ((inv.seeds || 0) > 0) {
						inv.seeds -= 1;
						this.plants.push({ r: target.r, c: target.c, plantedAt: Date.now() });
						replantMsg = ' A fresh seed was replanted automatically.';
					}
					Plants.save(this.plants);
					Inventory.save(inv);
					this._refreshPlantSprites();
					Sound.harvest();
					Stats.increment('totalHarvests');
					Dialog.open('You harvested a Friendship Berry!' + replantMsg);
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
					return (Date.now() - p.plantedAt) >= GROW_MS;
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
				Dialog.open('🌾 Scythe sweep! Harvested ' + ripe.length + ' berries' + extra + '.');
				return true;
			}

			_updateInventoryHud() {
				const el = document.getElementById('campInventory');
				if (!el) return;
				const inv = Inventory.load();
				const form = inv.eeveeForm || 'eevee';
				const heart = form === 'eevee' && (inv.friendship || 0) < FRIENDSHIP_MAX
					? '   ❤️ ' + (inv.friendship || 0) + '/' + FRIENDSHIP_MAX
					: '';
				const scythe = inv.hasScythe
					? '   ' + (inv.scytheEquipped ? '🌾 equipped' : '🌾 (Q)')
					: '';
				el.textContent = '🌱 ' + (inv.seeds || 0) + '   🍓 ' + (inv.friendshipBerries || 0) + '   💰 ' + (inv.tokens || 0) + heart + scythe;
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
				Inventory.save(inv);
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
				Sound.evolve();
				Dialog.open('✨ Eevee is evolving into ' + newForm.toUpperCase() + '! ✨');
				const fade = document.getElementById('campFade');
				if (fade) fade.classList.remove('is-hidden');
				setTimeout(() => window.location.reload(), 1800);
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

			updateMinimap() {
				if (!this.minimapEl || !this.minimapBase) return;
				const mctx = this.minimapEl.getContext('2d');
				mctx.putImageData(this.minimapBase, 0, 0);
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
						Dialog.open('Daily bonus claimed! +20 💰 Tokens, +1 🌱 Seed.');
					} else {
						Dialog.open('Daily bonus already claimed. Next one available in ' + Daily.hoursLeft() + 'h.');
					}
				}
				if (k.rain && Phaser.Input.Keyboard.JustDown(k.rain) && !dialogOpen) {
					this.isRaining = !this.isRaining;
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
					else if (Inventory.load().scytheEquipped && this._scytheSwing()) {
						/* scythe handled the input */
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
				this._updateInventoryHud();
				// Refresh plant visuals every 8 ticks so the ripe-berry bob animates smoothly.
				if (this.tick % 8 === 0) this._refreshPlantSprites();
				this.updateMinimap();

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
						if (this.follower.anims.isPlaying) this.follower.anims.stop();
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
							this.follower.setFrame(this.eeveeIdleFrame[faceDir]);
						}
					}
					this.follower.setDepth(this.follower.y > this.player.y ? 3.5 : 2.5);
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
				// Pre-create ground floor item overlays — positioned from stored placements.
				const _houseRoomInv = Inventory.load();
				const _housePlacements = _houseRoomInv.cosmetics?.housePlacements || {};
				this._roomItemObjs = {};
				Object.entries(HOUSE_ITEMS).forEach(([key, item]) => {
					const pos = _housePlacements[key];
					const x = (pos ? pos.c : item.c) * TILE + TILE / 2;
					const y = (pos ? pos.r : item.r) * TILE + TILE / 2;
					const obj = this.add.text(x, y, item.emoji, { fontSize: '14px', resolution: 2 })
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
							ghost.setText(item.emoji);
							ghost.setPosition(hc * TILE + TILE / 2, hr * TILE + TILE / 2);
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

				// Pre-create room item overlays — positioned from stored placements.
				const _roomInv = Inventory.load();
				const _roomPlacements = _roomInv.cosmetics?.roomPlacements || {};
				this._roomItemObjs = {};
				Object.entries(ROOM_ITEMS).forEach(([key, item]) => {
					const pos = _roomPlacements[key];
					const x = (pos ? pos.c : item.c) * TILE + TILE / 2;
					const y = (pos ? pos.r : item.r) * TILE + TILE / 2;
					const obj = this.add.text(x, y, item.emoji, { fontSize: '14px', resolution: 2 })
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
							ghost.setText(item.emoji);
							ghost.setPosition(hc * TILE + TILE / 2, hr * TILE + TILE / 2);
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
			root.append(panel);
			document.body.append(root);
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
			balanceEl.textContent = '💰 ' + (inv.tokens || 0);
			itemsEl.innerHTML = '';
			cfg.items.forEach((it) => {
				const row = document.createElement('div');
				row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 0';
				const lbl = document.createElement('span');
				lbl.style.cssText = 'font-size:10px;line-height:1.5;flex:1 1 auto';
				const priceStr = it.cost != null ? ' — ' + it.cost + '💰'
				             : it.sells != null ? ' — +' + it.sells + '💰'
				             : '';
				lbl.textContent = it.label + priceStr;
				const b = document.createElement('button');
				b.type = 'button'; b.style.cssText = btn(true);
				b.textContent = it.cost != null ? 'Buy' : 'Sell';
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
				this.load.spritesheet('npc-pikachu',   'Pictures/sprites/pikachu.png',   { frameWidth: 32, frameHeight: 40 });
				this.load.spritesheet('npc-bulbasaur', 'Pictures/sprites/bulbasaur.png', { frameWidth: 40, frameHeight: 40 });
				this.load.spritesheet('npc-vaporeon',  'Pictures/sprites/vaporeon.png',  { frameWidth: 32, frameHeight: 48 });
				this.load.spritesheet('npc-umbreon',   'Pictures/sprites/umbreon.png',   { frameWidth: 32, frameHeight: 40 });
			}

			create() {
				console.log('[MarketScene] create()');
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

				if (!this.textures.exists('marketBase')) {
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
				} else {
					this.baseTex = this.textures.get('marketBase');
				}
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
				this.cameras.main.setBounds(-4000, -4000, 8000, 8000);
				// Use a soft grass-edge color so any gap around the world looks natural,
				// matching the camp's outdoor feel.
				this.cameras.main.setBackgroundColor('#3a5026');
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

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
	else start();
})();
