(function () {
	'use strict';

	// ── Icon helper ───────────────────────────────────────────────────────────────
	// Returns an <i> HTML string for a Bootstrap Icon. Use in innerHTML only.
	function ico(cls, extra) {
		return '<i class="bi bi-' + cls + (extra ? ' ' + extra : '') + '" aria-hidden="true"></i>';
	}
	// Icon map — game concepts → BI class names
	const ICO = {
		seed:     'seedling',
		berry:    'flower1',
		token:    'coin',
		heart:    'heart-fill',
		egg:      'egg-fill',
		star:     'star-fill',
		starOff:  'star',
		fish:     'droplet-fill',
		fire:     'fire',
		book:     'book-fill',
		bookOpen: 'book-open-fill',
		pc:       'pc-display-horizontal',
		trade:    'arrow-repeat',
		contest:  'patch-check-fill',
		curry:    'cup-hot-fill',
		play:     'suit-heart-fill',
		compost:  'recycle',
		quest:    'clipboard-check-fill',
		achieve:  'award-fill',
		trainer:  'person-vcard-fill',
		postcard: 'envelope-fill',
		write:    'pencil-fill',
		readMail: 'envelope-open-fill',
		gift:     'gift-fill',
		radar:    'broadcast-pin',
		scythe:   'scissors',
		music:    'music-note-beamed',
		cart:     'cart3-fill',
		game:     'controller',
		heal:     'plus-circle-fill',
		bolt:     'lightning-fill',
		water:    'water',
		gem:      'gem',
		snow:     'snow',
		moon:     'moon-stars-fill',
		sun:      'sun-fill',
		tree:     'tree-fill',
		sparkle:  'stars',
		hammer:   'hammer',
		map:      'map-fill',
		close:    'x-lg',
		back:     'arrow-left',
		next:     'arrow-right-short',
		check:    'check2-circle',
		trash:    'trash3-fill',
		send:     'send-fill',
		info:     'info-circle-fill',
		level:    'bar-chart-fill',
		ribbon:   'patch-check-fill',
		house:    'house-fill',
		mail:     'mailbox2-fill',
		camp:     'tree',
		npc:      'person-fill',
		fossil:   'database-fill',
	};
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
	const SIGN_MESSAGES = {
		'12,10': "Welcome to Trainer Camp! Walk up to the house and press E at the door to head inside.",
		'19,12': "Crops grow here — talk to the farmer at the garden gate and plant a seed on any soil tile.",
		'12,4':  "Trail to the deep woods. Watch out for wild Pokemon in the tall grass.",
		'10,30': "A peaceful lake — press E near the water to fish!",
		'17,9':  '__mailbox__',
		'25,11': '__camprating__',
	};

	// ── Pokédex ───────────────────────────────────────────────────────────────────
	const Pokedex = (() => {
		const DEX = [
			{id:1,n:'Bulbasaur'},{id:2,n:'Ivysaur'},{id:3,n:'Venusaur'},
			{id:4,n:'Charmander'},{id:5,n:'Charmeleon'},{id:6,n:'Charizard'},
			{id:7,n:'Squirtle'},{id:8,n:'Wartortle'},{id:9,n:'Blastoise'},
			{id:10,n:'Caterpie'},{id:11,n:'Metapod'},{id:12,n:'Butterfree'},
			{id:13,n:'Weedle'},{id:14,n:'Kakuna'},{id:15,n:'Beedrill'},
			{id:16,n:'Pidgey'},{id:17,n:'Pidgeotto'},{id:18,n:'Pidgeot'},
			{id:19,n:'Rattata'},{id:20,n:'Raticate'},{id:21,n:'Spearow'},
			{id:22,n:'Fearow'},{id:23,n:'Ekans'},{id:24,n:'Arbok'},
			{id:25,n:'Pikachu'},{id:26,n:'Raichu'},{id:27,n:'Sandshrew'},
			{id:28,n:'Sandslash'},{id:29,n:'Nidoran♀'},{id:30,n:'Nidorina'},
			{id:31,n:'Nidoqueen'},{id:32,n:'Nidoran♂'},{id:33,n:'Nidorino'},
			{id:34,n:'Nidoking'},{id:35,n:'Clefairy'},{id:36,n:'Clefable'},
			{id:37,n:'Vulpix'},{id:38,n:'Ninetales'},{id:39,n:'Jigglypuff'},
			{id:40,n:'Wigglytuff'},{id:41,n:'Zubat'},{id:42,n:'Golbat'},
			{id:43,n:'Oddish'},{id:44,n:'Gloom'},{id:45,n:'Vileplume'},
			{id:46,n:'Paras'},{id:47,n:'Parasect'},{id:48,n:'Venonat'},
			{id:49,n:'Venomoth'},{id:50,n:'Diglett'},{id:51,n:'Dugtrio'},
			{id:52,n:'Meowth'},{id:53,n:'Persian'},{id:54,n:'Psyduck'},
			{id:55,n:'Golduck'},{id:56,n:'Mankey'},{id:57,n:'Primeape'},
			{id:58,n:'Growlithe'},{id:59,n:'Arcanine'},{id:60,n:'Poliwag'},
			{id:61,n:'Poliwhirl'},{id:62,n:'Poliwrath'},{id:63,n:'Abra'},
			{id:64,n:'Kadabra'},{id:65,n:'Alakazam'},{id:66,n:'Machop'},
			{id:67,n:'Machoke'},{id:68,n:'Machamp'},{id:69,n:'Bellsprout'},
			{id:70,n:'Weepinbell'},{id:71,n:'Victreebel'},{id:72,n:'Tentacool'},
			{id:73,n:'Tentacruel'},{id:74,n:'Geodude'},{id:75,n:'Graveler'},
			{id:76,n:'Golem'},{id:77,n:'Ponyta'},{id:78,n:'Rapidash'},
			{id:79,n:'Slowpoke'},{id:80,n:'Slowbro'},{id:81,n:'Magnemite'},
			{id:82,n:'Magneton'},{id:83,n:"Farfetch'd"},{id:84,n:'Doduo'},
			{id:85,n:'Dodrio'},{id:86,n:'Seel'},{id:87,n:'Dewgong'},
			{id:88,n:'Grimer'},{id:89,n:'Muk'},{id:90,n:'Shellder'},
			{id:91,n:'Cloyster'},{id:92,n:'Gastly'},{id:93,n:'Haunter'},
			{id:94,n:'Gengar'},{id:95,n:'Onix'},{id:96,n:'Drowzee'},
			{id:97,n:'Hypno'},{id:98,n:'Krabby'},{id:99,n:'Kingler'},
			{id:100,n:'Voltorb'},{id:101,n:'Electrode'},{id:102,n:'Exeggcute'},
			{id:103,n:'Exeggutor'},{id:104,n:'Cubone'},{id:105,n:'Marowak'},
			{id:106,n:'Hitmonlee'},{id:107,n:'Hitmonchan'},{id:108,n:'Lickitung'},
			{id:109,n:'Koffing'},{id:110,n:'Weezing'},{id:111,n:'Rhyhorn'},
			{id:112,n:'Rhydon'},{id:113,n:'Chansey'},{id:114,n:'Tangela'},
			{id:115,n:'Kangaskhan'},{id:116,n:'Horsea'},{id:117,n:'Seadra'},
			{id:118,n:'Goldeen'},{id:119,n:'Seaking'},{id:120,n:'Staryu'},
			{id:121,n:'Starmie'},{id:122,n:'Mr. Mime'},{id:123,n:'Scyther'},
			{id:124,n:'Jynx'},{id:125,n:'Electabuzz'},{id:126,n:'Magmar'},
			{id:127,n:'Pinsir'},{id:128,n:'Tauros'},{id:129,n:'Magikarp'},
			{id:130,n:'Gyarados'},{id:131,n:'Lapras'},{id:132,n:'Ditto'},
			{id:133,n:'Eevee'},{id:134,n:'Vaporeon'},{id:135,n:'Jolteon'},
			{id:136,n:'Flareon'},{id:137,n:'Porygon'},{id:138,n:'Omanyte'},
			{id:139,n:'Omastar'},{id:140,n:'Kabuto'},{id:141,n:'Kabutops'},
			{id:142,n:'Aerodactyl'},{id:143,n:'Snorlax'},{id:144,n:'Articuno'},
			{id:145,n:'Zapdos'},{id:146,n:'Moltres'},{id:147,n:'Dratini'},
			{id:148,n:'Dragonair'},{id:149,n:'Dragonite'},{id:150,n:'Mewtwo'},
			{id:151,n:'Mew'},
		];
		function loadData() {
			try { return JSON.parse(localStorage.getItem('pokequiz_dex') || '{"seen":[],"caught":[]}'); }
			catch { return { seen: [], caught: [] }; }
		}
		function saveData(d) { localStorage.setItem('pokequiz_dex', JSON.stringify(d)); }
		function markSeen(id) {
			const d = loadData();
			if (!d.seen.includes(id)) { d.seen.push(id); saveData(d); }
		}
		function markCaught(id) {
			const d = loadData();
			if (!d.seen.includes(id)) d.seen.push(id);
			if (!d.caught.includes(id)) {
				d.caught.push(id);
				saveData(d);
				checkMilestones(d.caught.length);
			}
		}
		function isCaught(id) { return loadData().caught.includes(id); }
		function checkMilestones(n) {
			if (n === 10) { showToast(ico(ICO.book) + ' Pokédex milestone: 10 caught! +20 ' + ico(ICO.token)); const inv=Inventory.load(); inv.tokens=(inv.tokens||0)+20; Inventory.save(inv); }
			if (n === 30) { showToast(ico(ICO.book) + ' Pokédex milestone: 30 caught! +50 ' + ico(ICO.token)); const inv=Inventory.load(); inv.tokens=(inv.tokens||0)+50; Inventory.save(inv); }
			if (n === 60) { showToast(ico(ICO.book) + ' Pokédex milestone: 60 caught! +100 ' + ico(ICO.token)); const inv=Inventory.load(); inv.tokens=(inv.tokens||0)+100; Inventory.save(inv); }
			if (n === 100) { showToast(ico(ICO.achieve) + ' 100 Pokémon caught! Master Trainer!'); Achievements.unlock('dex100'); }
		}
		function open() {
			let panel = document.getElementById('dexPanel');
			if (!panel) {
				panel = document.createElement('div');
				panel.id = 'dexPanel';
				document.body.appendChild(panel);
				panel.addEventListener('pointerdown', () => { panel.hidden = true; });
			}
			panel.hidden = false;
			panel.className = 'pk-backdrop';
			panel.innerHTML = '';
			const inner = document.createElement('div');
			inner.className = 'pk-modal';
			inner.innerHTML = '<div class="pk-modal-head">' +
				'<span class="pk-modal-title">' + ico(ICO.book) + ' POKÉDEX</span>' +
				'<span id="dexCounter" style="font-size:9px;color:var(--pk-muted)"></span>' +
				'<button id="dexClose" class="pk-close" type="button">' + ico(ICO.close) + '</button>' +
				'</div>';
			const body = document.createElement('div');
			body.className = 'pk-modal-body';
			body.style.cssText = 'padding-top:10px';
			const grid = document.createElement('div');
			grid.id = 'dexGrid';
			grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:5px';
			body.appendChild(grid);
			inner.appendChild(body);
			panel.appendChild(inner);
			inner.addEventListener('pointerdown', e => e.stopPropagation());
			document.getElementById('dexClose').addEventListener('click', () => { panel.hidden = true; });
			const data = loadData();
			const counter = document.getElementById('dexCounter');
			counter.textContent = data.caught.length + ' / 151';
			DEX.forEach(p => {
				const seen = data.seen.includes(p.id);
				const caught = data.caught.includes(p.id);
				const cell = document.createElement('div');
				cell.className = 'pk-dex-cell' + (caught ? ' is-caught' : '');
				cell.title = caught ? p.n : (seen ? '???' : '---');
				const img = document.createElement('img');
				img.style.cssText = 'width:32px;height:32px;image-rendering:pixelated;' + (!seen ? 'filter:brightness(0)' : seen && !caught ? 'filter:brightness(0.25) saturate(0)' : '');
				img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/' + p.id + '.png';
				img.loading = 'lazy';
				const num = document.createElement('div');
				num.className = 'pk-dex-num' + (caught ? ' is-caught' : '');
				num.textContent = '#' + String(p.id).padStart(3,'0');
				cell.appendChild(img);
				cell.appendChild(num);
				grid.appendChild(cell);
			});
		}
		return { markSeen, markCaught, isCaught, open };
	})();

	// ── PC Box ────────────────────────────────────────────────────────────────────
	const PCBox = (() => {
		const MAX_SLOTS = 6;
		function load() {
			const inv = Inventory.load();
			if (!inv.pcBox) {
				inv.pcBox = [{ form: inv.eeveeForm || 'eevee', nickname: '', friendship: inv.friendship || 0, since: inv.partnerSince || Date.now() }];
				inv.pcBoxActive = 0;
				Inventory.save(inv);
			}
			return inv;
		}
		function open() {
			const inv = load();
			let panel = document.getElementById('pcBoxPanel');
			if (!panel) {
				panel = document.createElement('div');
				panel.id = 'pcBoxPanel';
				panel.style.cssText = 'position:fixed;inset:0;z-index:80;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P",monospace';
				document.body.appendChild(panel);
				panel.addEventListener('pointerdown', e => { if(e.target===panel) panel.hidden=true; });
			}
			panel.hidden = false;
			render(panel, inv);
		}
		function render(panel, inv) {
			const activeIdx = inv.pcBoxActive || 0;
			const box = inv.pcBox || [];
			const FORMS = { eevee:'Eevee',vaporeon:'Vaporeon',espeon:'Espeon',umbreon:'Umbreon',flareon:'Flareon',jolteon:'Jolteon',leafeon:'Leafeon',glaceon:'Glaceon',sylveon:'Sylveon' };
			panel.className = 'pk-backdrop';
			panel.innerHTML = '';
			const inner = document.createElement('div');
			inner.className = 'pk-modal pk-modal-sm';
			inner.innerHTML = '<div class="pk-modal-head">' +
				'<span class="pk-modal-title">' + ico(ICO.pc) + ' PC BOX</span>' +
				'<button id="pcBoxClose" class="pk-close" type="button">' + ico(ICO.close) + '</button>' +
				'</div>';
			const body = document.createElement('div');
			body.className = 'pk-modal-body';
			const grid = document.createElement('div');
			grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px';
			for (let i = 0; i < MAX_SLOTS; i++) {
				const slot = box[i];
				const card = document.createElement('div');
				card.className = 'pk-box-slot' + (i === activeIdx ? ' is-active' : '');
				if (slot) {
					const formName = FORMS[slot.form] || slot.form;
					const name = document.createElement('div');
					name.className = 'pk-box-slot-name';
					name.innerHTML = (i === activeIdx ? ico(ICO.star) + ' ' : '') + (slot.nickname || formName);
					const sub = document.createElement('div');
					sub.className = 'pk-box-slot-sub';
					sub.textContent = 'Friendship: ' + (slot.friendship||0);
					card.appendChild(name);
					card.appendChild(sub);
					if (i !== activeIdx) {
						const btn = document.createElement('button');
						btn.dataset.slot = i;
						btn.type = 'button';
						btn.className = 'pk-btn pk-btn-gold pk-btn-xs';
						btn.style.marginTop = '6px';
						btn.textContent = 'Set Active';
						card.appendChild(btn);
					} else {
						const lbl = document.createElement('div');
						lbl.style.cssText = 'font-size:7px;color:var(--pk-green);margin-top:4px';
						lbl.textContent = 'Active Partner';
						card.appendChild(lbl);
					}
				} else {
					card.innerHTML = '<div style="font-size:8px;color:var(--pk-faint);text-align:center;padding:12px 0">Empty</div>';
				}
				grid.appendChild(card);
			}
			const wt = document.createElement('button');
			wt.type = 'button';
			wt.className = 'pk-btn pk-btn-blue pk-btn-full pk-btn-sm';
			wt.style.marginTop = '4px';
			wt.innerHTML = ico(ICO.trade) + ' Wonder Trade';
			wt.addEventListener('click', () => WonderTrade.open());
			body.appendChild(grid);
			body.appendChild(wt);
			inner.appendChild(body);
			panel.appendChild(inner);
			inner.addEventListener('pointerdown', e => e.stopPropagation());
			document.getElementById('pcBoxClose').addEventListener('click', () => { panel.hidden = true; });
			grid.querySelectorAll('[data-slot]').forEach(btn => {
				btn.addEventListener('click', () => {
					const idx = parseInt(btn.dataset.slot);
					const inv2 = Inventory.load();
					const slot = (inv2.pcBox||[])[idx];
					if (!slot) return;
					const prev = inv2.pcBox[inv2.pcBoxActive||0];
					if (prev) {
						prev.friendship = inv2.friendship || 0;
						prev.form = inv2.eeveeForm || 'eevee';
					}
					inv2.pcBoxActive = idx;
					inv2.eeveeForm = slot.form;
					inv2.friendship = slot.friendship || 0;
					inv2.partnerSince = slot.since || Date.now();
					Inventory.save(inv2);
					showToast('Partner switched to ' + (FORMS[slot.form]||slot.form) + '!');
					render(panel, Inventory.load());
				});
			});
		}
		function addToBox(pkmnData) {
			const inv = Inventory.load();
			if (!inv.pcBox) inv.pcBox = [];
			if (inv.pcBox.length >= MAX_SLOTS) { showToast('PC Box is full! (6/6)'); return false; }
			inv.pcBox.push(pkmnData);
			Inventory.save(inv);
			return true;
		}
		return { open, addToBox };
	})();

	// ── Wonder Trade ──────────────────────────────────────────────────────────────
	const WonderTrade = (() => {
		const TRADE_POOL = [
			{ form:'eevee', name:'Pikachu', friendship:30 },
			{ form:'vaporeon', name:'Vaporeon', friendship:50 },
			{ form:'flareon', name:'Flareon', friendship:50 },
			{ form:'jolteon', name:'Jolteon', friendship:50 },
			{ form:'leafeon', name:'Leafeon', friendship:50 },
			{ form:'espeon', name:'Espeon', friendship:50 },
			{ form:'umbreon', name:'Umbreon', friendship:50 },
			{ form:'eevee', name:'Eevee', friendship:20 },
			{ form:'eevee', name:'Mystery Eevee', friendship:80 },
		];
		function open() {
			const inv = Inventory.load();
			const box = inv.pcBox || [];
			if (box.length === 0) { showToast('PC Box is empty! Nothing to trade.'); return; }
			let panel = document.getElementById('wonderTradePanel');
			if (!panel) {
				panel = document.createElement('div');
				panel.id = 'wonderTradePanel';
				document.body.appendChild(panel);
				panel.addEventListener('pointerdown', e => { if(e.target===panel) panel.hidden=true; });
			}
			panel.hidden = false;
			panel.className = 'pk-backdrop';
			panel.innerHTML = '';
			const FORMS = {eevee:'Eevee',vaporeon:'Vaporeon',espeon:'Espeon',umbreon:'Umbreon',flareon:'Flareon',jolteon:'Jolteon',leafeon:'Leafeon',glaceon:'Glaceon',sylveon:'Sylveon'};
			const inner = document.createElement('div');
			inner.className = 'pk-modal pk-modal-sm';
			inner.innerHTML = '<div class="pk-modal-head">' +
				'<span class="pk-modal-title" style="color:#88aaff">' + ico(ICO.trade) + ' WONDER TRADE</span>' +
				'<button id="wtClose" class="pk-close" style="color:#88aaff" type="button">' + ico(ICO.close) + '</button>' +
				'</div>';
			const body = document.createElement('div');
			body.className = 'pk-modal-body';
			const intro = document.createElement('div');
			intro.style.cssText = 'font-size:8px;color:var(--pk-muted);margin-bottom:14px';
			intro.textContent = 'Select a Pokémon to trade away for a mystery partner!';
			body.appendChild(intro);
			const list = document.createElement('div');
			list.style.cssText = 'display:flex;flex-direction:column;gap:6px';
			const activeIdx = inv.pcBoxActive || 0;
			box.forEach((slot, i) => {
				if (!slot) return;
				const row = document.createElement('div');
				row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border:1px solid var(--pk-border);border-radius:var(--pk-radius-sm);background:rgba(255,255,255,0.03)';
				const formName = FORMS[slot.form] || slot.form;
				row.innerHTML = '<div><div style="font-size:8px;color:var(--pk-text)">' + (slot.nickname||formName) + ' <span style="color:var(--pk-faint);font-size:7px">(' + formName + ')</span></div>' +
					'<div style="font-size:7px;color:var(--pk-muted)">Friendship: ' + (slot.friendship||0) + '</div></div>';
				if (i !== activeIdx) {
					const tradeBtn = document.createElement('button');
					tradeBtn.dataset.slot = i;
					tradeBtn.type = 'button';
					tradeBtn.className = 'pk-btn pk-btn-blue pk-btn-xs';
					tradeBtn.textContent = 'Trade';
					row.appendChild(tradeBtn);
				} else {
					row.innerHTML += '<span style="font-size:7px;color:var(--pk-gold)">Active</span>';
				}
				list.appendChild(row);
			});
			body.appendChild(list);
			inner.appendChild(body);
			panel.appendChild(inner);
			inner.addEventListener('pointerdown', e => e.stopPropagation());
			document.getElementById('wtClose').addEventListener('click', () => { panel.hidden = true; });
			list.querySelectorAll('[data-slot]').forEach(btn => {
				btn.addEventListener('click', () => {
					const slotIdx = parseInt(btn.dataset.slot);
					const inv2 = Inventory.load();
					const traded = inv2.pcBox[slotIdx];
					if (!traded) return;
					inv2.pcBox.splice(slotIdx, 1);
					if ((inv2.pcBoxActive||0) > slotIdx) inv2.pcBoxActive--;
					const received = TRADE_POOL[Math.floor(Math.random() * TRADE_POOL.length)];
					inv2.pcBox.push({ form: received.form, nickname: received.name, friendship: received.friendship, since: Date.now() });
					Inventory.save(inv2);
					panel.hidden = true;
					showToast(ico(ICO.trade) + ' Traded ' + (traded.nickname||traded.form) + ' for ' + received.name + '!');
					Achievements.unlock('wonderTrade');
				});
			});
		}
		return { open };
	})();

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
	const CurryCooking = (() => {
		const RECIPES = [
			{ label: ico(ICO.curry) + ' Plain Curry',    ingredients: { pecha: 1 }, desc: '+5 friendship',         effect: (inv) => { inv.friendship = Math.min(100,(inv.friendship||0)+5); } },
			{ label: ico(ICO.curry) + ' Oran Curry',     ingredients: { oran: 1 },  desc: '+15 friendship',        effect: (inv) => { inv.friendship = Math.min(100,(inv.friendship||0)+15); } },
			{ label: ico(ICO.curry) + ' Sitrus Curry',   ingredients: { sitrus: 1 }, desc: '+30 friendship + heal', effect: (inv) => { inv.friendship = Math.min(100,(inv.friendship||0)+30); inv.partnerHp = 100; } },
			{ label: ico(ICO.curry) + ' Mixed Berry Curry', ingredients: { pecha:1, oran:1 }, desc: '+20 friendship + 10 min rhythm boost', effect: (inv) => { inv.friendship = Math.min(100,(inv.friendship||0)+20); if(!inv.boosts) inv.boosts={}; inv.boosts.rhythmBoost = Date.now()+10*60*1000; } },
			{ label: ico(ICO.curry) + ' Spicy Curry',    ingredients: { pecha:2 },  desc: '+10 friendship + fast-grow 15min', effect: (inv) => { inv.friendship = Math.min(100,(inv.friendship||0)+10); if(!inv.boosts) inv.boosts={}; inv.boosts.fastGrow = Date.now()+15*60*1000; } },
		];
		function canMake(recipe) {
			const inv = Inventory.load();
			const bt = inv.berryTypes || {};
			for (const [type, amt] of Object.entries(recipe.ingredients)) {
				if ((bt[type]||0) < amt) return false;
			}
			return true;
		}
		function open() {
			let panel = document.getElementById('curryPanel');
			if (!panel) {
				panel = document.createElement('div');
				panel.id = 'curryPanel';
				panel.style.cssText = 'position:fixed;inset:0;z-index:80;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P",monospace';
				document.body.appendChild(panel);
				panel.addEventListener('pointerdown', e => { if(e.target===panel) panel.hidden=true; });
			}
			panel.hidden = false;
			const inv = Inventory.load();
			const bt = inv.berryTypes || {};
			panel.className = 'pk-backdrop';
			panel.innerHTML = '';
			const inner = document.createElement('div');
			inner.className = 'pk-modal pk-modal-sm';
			inner.innerHTML = '<div class="pk-modal-head">' +
				'<span class="pk-modal-title" style="color:#ff9820">' + ico(ICO.curry) + ' CURRY COOKING</span>' +
				'<button id="curryClose" class="pk-close" style="color:#ff9820" type="button">' + ico(ICO.close) + '</button>' +
				'</div>';
			const body = document.createElement('div');
			body.className = 'pk-modal-body';
			const berryLine = document.createElement('div');
			berryLine.style.cssText = 'font-size:8px;color:#ffc080;margin-bottom:14px;padding:8px 10px;background:rgba(255,136,0,0.08);border-radius:8px;border:1px solid rgba(255,136,0,0.2)';
			berryLine.innerHTML = 'Berries: ' + ico(ICO.berry,'berry-pecha') + (bt.pecha||0) + ' &nbsp;' + ico(ICO.berry,'berry-oran') + (bt.oran||0) + ' &nbsp;' + ico(ICO.berry,'berry-sitrus') + (bt.sitrus||0);
			body.appendChild(berryLine);
			const list = document.createElement('div');
			list.style.cssText = 'display:flex;flex-direction:column;gap:8px';
			RECIPES.forEach((r, i) => {
				const can = canMake(r);
				const ingStr = Object.entries(r.ingredients).map(([k,v]) => v+'× '+k).join(', ');
				const row = document.createElement('div');
				row.className = 'pk-curry-row' + (can ? ' can-make' : '');
				const nm = document.createElement('div');
				nm.className = 'pk-curry-name';
				nm.textContent = r.label;
				const dc = document.createElement('div');
				dc.className = 'pk-curry-desc';
				dc.textContent = r.desc + ' · needs: ' + ingStr;
				row.appendChild(nm);
				row.appendChild(dc);
				if (can) {
					const cookBtn = document.createElement('button');
					cookBtn.dataset.recipe = i;
					cookBtn.type = 'button';
					cookBtn.className = 'pk-btn pk-btn-sm';
					cookBtn.style.cssText = 'background:linear-gradient(180deg,#ff9820,#cc6600);color:#fff;margin-top:6px';
					cookBtn.textContent = 'Cook!';
					row.appendChild(cookBtn);
				}
				list.appendChild(row);
			});
			body.appendChild(list);
			inner.appendChild(body);
			panel.appendChild(inner);
			inner.addEventListener('pointerdown', e => e.stopPropagation());
			document.getElementById('curryClose').addEventListener('click', () => { panel.hidden = true; });
			list.querySelectorAll('[data-recipe]').forEach(btn => {
				btn.addEventListener('click', () => {
					const recipe = RECIPES[parseInt(btn.dataset.recipe)];
					const inv2 = Inventory.load();
					if (!inv2.berryTypes) inv2.berryTypes = {};
					for (const [type, amt] of Object.entries(recipe.ingredients)) {
						inv2.berryTypes[type] = (inv2.berryTypes[type]||0) - amt;
					}
					recipe.effect(inv2);
					Inventory.save(inv2);
					showToast(ico(ICO.curry) + ' ' + recipe.label + ' cooked! ' + recipe.desc);
					Achievements.unlock('chef');
					TrainerLevel.addXP('cook');
					panel.hidden = true;
				});
			});
		}
		return { open };
	})();

	// ── Pokémon Amie ───────────────────────────────────────────────────────────────
	const Amie = (() => {
		let taps = 0, sessionBonus = 0;
		const MAX_SESSION = 10;
		function open() {
			let panel = document.getElementById('amiePanel');
			if (!panel) {
				panel = document.createElement('div');
				panel.id = 'amiePanel';
				panel.style.cssText = 'position:fixed;inset:0;z-index:80;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P",monospace';
				document.body.appendChild(panel);
			}
			taps = 0; sessionBonus = 0;
			panel.hidden = false;
			render(panel);
		}
		function render(panel) {
			panel.className = 'pk-backdrop';
			panel.innerHTML = '';
			const inner = document.createElement('div');
			inner.className = 'pk-modal pk-modal-sm';
			inner.style.textAlign = 'center';
			inner.innerHTML = '<div class="pk-modal-head"><span class="pk-modal-title">' + ico(ICO.play) + ' POKÉMON PLAY</span></div>';
			const body = document.createElement('div');
			body.className = 'pk-modal-body';
			body.innerHTML = '<div id="amieSprite" style="font-size:64px;cursor:pointer;user-select:none;margin:8px 0 4px;display:inline-block;transition:transform 0.1s">🐾</div>' +
				'<div id="amieMsg" style="font-size:9px;color:var(--pk-muted);margin:10px 0 6px;min-height:18px">Tap your partner to play!</div>' +
				'<div id="amieTaps" style="font-size:8px;color:var(--pk-gold);margin-bottom:16px">Taps: 0 / ' + MAX_SESSION + '</div>' +
				'<button id="amieClose" type="button" class="pk-btn pk-btn-dark pk-btn-sm">Done</button>';
			inner.appendChild(body);
			panel.appendChild(inner);
			inner.addEventListener('pointerdown', e => e.stopPropagation());
			const sprite = document.getElementById('amieSprite');
			const msg = document.getElementById('amieMsg');
			const tapsEl = document.getElementById('amieTaps');
			const MESSAGES = ['💚','Yay!','Hehe~','Again!','♪','Purrr~','So fun!'];
			sprite.addEventListener('click', () => {
				if (taps >= MAX_SESSION) { msg.textContent = 'I need a rest! Come back later~'; return; }
				taps++;
				sessionBonus++;
				sprite.style.transform = 'scale(1.3)';
				setTimeout(() => { sprite.style.transform = 'scale(1)'; }, 100);
				msg.textContent = MESSAGES[taps % MESSAGES.length];
				tapsEl.textContent = 'Taps: ' + taps + ' / ' + MAX_SESSION;
				if (taps === MAX_SESSION) {
					const inv2 = Inventory.load();
					const bonus = Math.min(sessionBonus, 5);
					inv2.friendship = Math.min(100, (inv2.friendship||0) + bonus);
					Inventory.save(inv2);
					msg.innerHTML = ico(ICO.star) + ' +' + bonus + ' friendship! Session complete!';
					showToast('+' + bonus + ' friendship from playing!');
				}
			});
			document.getElementById('amieClose').addEventListener('click', () => {
				if (sessionBonus > 0 && taps < MAX_SESSION) {
					const inv2 = Inventory.load();
					const bonus = Math.floor(sessionBonus / 2);
					if (bonus > 0) { inv2.friendship = Math.min(100,(inv2.friendship||0)+bonus); Inventory.save(inv2); showToast('+' + bonus + ' friendship!'); }
				}
				panel.hidden = true;
			});
		}
		return { open };
	})();

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
				// Partner passive: Flareon gives +1 token on rhythm
				const pp = typeof getPartnerPassive === 'function' ? getPartnerPassive() : { rhythmTokenBonus: 0 };
				if (rawBonus > 1) tokenBonus += pp.rhythmTokenBonus;
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
				const alreadyCaught = Pokedex.isCaught(_currentEncounter.id);
				catchBtn.innerHTML = alreadyCaught ? ico(ICO.check) + ' Already Caught' : ico(ICO.bolt) + ' Throw Ball (5 ' + ico(ICO.token) + ')';
				catchBtn.disabled = alreadyCaught;
				catchBtn.addEventListener('click', () => {
					if (alreadyCaught) return;
					const inv = Inventory.load();
					if ((inv.tokens || 0) < 5) { showToast('Not enough tokens!'); return; }
					inv.tokens -= 5;
					Inventory.save(inv);
					Pokedex.markCaught(_currentEncounter.id);
					catchBtn.innerHTML = ico(ICO.check) + ' Caught ' + _currentEncounter.name + '!';
					catchBtn.disabled = true;
					Achievements.unlock('firstCatch');
					showToast(ico(ICO.check) + ' ' + _currentEncounter.name + ' caught and added to Pokédex!');
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
						obj.setAngle((pos.rot || 0) * 90);
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
			// Preserve existing rotation when moving an already-placed item
			const { placementsKey } = invKeysForScene();
			const existingPos = (Inventory.load().cosmetics?.[placementsKey] || {})[key];
			window.__gridMode.active = true;
			window.__gridMode.key = key;
			window.__gridMode.sceneKey = activeScene;
			window.__gridMode.hoverR = -1;
			window.__gridMode.hoverC = -1;
			window.__gridMode.rot = existingPos?.rot || 0;
			refresh();
		}

		function rotateWhilePlacing() {
			if (!window.__gridMode) return;
			window.__gridMode.rot = ((window.__gridMode.rot || 0) + 1) % 4;
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
			i.cosmetics[placementsKey][placingKey] = { r, c, rot: window.__gridMode?.rot ?? 0 };
			Inventory.save(i);
			cancelPlace();
			liveUpdate();
			refresh();
			// Achievement: place 5+ furniture pieces
			const allPlacements = Object.assign({}, i.cosmetics.roomPlacements || {}, i.cosmetics.housePlacements || {});
			if (Object.keys(allPlacements).length >= 5) Achievements.unlock('decorator');
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
			if (sceneLbl) sceneLbl.innerHTML = activeScene === 'house' ? ico(ICO.house) + ' Ground Floor' : ico(ICO.house) + ' Bedroom';

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
					if (lbl) lbl.innerHTML = 'Click a tile to place ' + (item?.icoKey ? ico(ICO[item.icoKey]||item.icoKey)+' ' : '') + (item?.label || '');
				} else {
					banner.hidden = true;
				}
			}

			list.innerHTML = '';
			const cats = { furniture: [], decor: [] };
			Object.entries(items).forEach(([key, item]) => {
				(item.cat === 'decor' ? cats.decor : cats.furniture).push([key, item]);
			});
			const catLabels = { furniture: ico(ICO.game) + ' Furniture', decor: ico(ICO.sparkle) + ' Decor' };

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
					// Pixel-art sprite for the item — falls back to emoji span if the
					// design isn't registered (keeps layout intact for any new item).
					const emojiEl = FurnitureSprites.makeIcon(key, 32);
					emojiEl.className = 'cre-item-emoji';
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
						const rotBtn = document.createElement('button');
						rotBtn.className = 'cre-btn cre-btn--rotate';
						rotBtn.type = 'button';
						const rotDeg = ((window.__gridMode?.rot || 0) * 90);
						rotBtn.title = rotDeg + '°';
						rotBtn.textContent = '↻ ' + rotDeg + '°';
						rotBtn.addEventListener('click', rotateWhilePlacing);
						const cancelBtn = document.createElement('button');
						cancelBtn.className = 'cre-btn cre-btn--cancel';
						cancelBtn.type = 'button';
						cancelBtn.textContent = 'Cancel';
						cancelBtn.addEventListener('click', cancelPlace);
						right.appendChild(rotBtn);
						right.appendChild(cancelBtn);
					} else if (placed) {
						const rotateBtn = document.createElement('button');
						rotateBtn.className = 'cre-btn cre-btn--rotate';
						rotateBtn.type = 'button';
						const rotDeg = ((pos?.rot || 0) * 90);
						rotateBtn.title = rotDeg + '°';
						rotateBtn.textContent = '↻';
						rotateBtn.addEventListener('click', () => {
							const i = Inventory.load();
							if (!i.cosmetics?.[placementsKey]?.[key]) return;
							i.cosmetics[placementsKey][key].rot = ((i.cosmetics[placementsKey][key].rot || 0) + 1) % 4;
							Inventory.save(i);
							liveUpdate(); refresh();
						});
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
						right.appendChild(rotateBtn);
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
			// Feature 8: Extra info
			if (!inv.partnerSince) { inv.partnerSince = Date.now(); Inventory.save(inv); }
			const extraEl = $('cpInfoExtra');
			if (extraEl) {
				const days = Math.floor((Date.now() - inv.partnerSince) / 86400000);
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
				extraEl.textContent = infoLines.join('  ·  ');
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
			inv.friendshipBerries -= 1;
			inv.friendship = Math.min(FRIENDSHIP_MAX, (inv.friendship || 0) + FRIENDSHIP_PER_BERRY);
			Inventory.save(inv);
			DailyQuests.increment('feed');
			if (inv.friendship >= FRIENDSHIP_MAX) Achievements.unlock('fullFriend');
			if (inv.friendship >= FRIENDSHIP_MAX && sceneRef && typeof sceneRef._triggerEvolution === 'function') {
				close();
				sceneRef._triggerEvolution();
			} else {
				setStatus('Eevee gobbled a berry. +' + FRIENDSHIP_PER_BERRY + ' Friendship!', 'good');
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

			// Build list of caught dex IDs using the exported isCaught check
			const caught = [];
			for (let _d = 1; _d <= 151; _d++) { if (Pokedex.isCaught(_d)) caught.push(_d); }
			if (!caught.length) { showToast('No Pokémon caught yet! Fish or battle to catch some.'); return; }

			// Outer backdrop (fixed overlay) + inner pk-modal box — same pattern as Pokédex/PCBox
			const backdrop = document.createElement('div');
			backdrop.id = 'partnerPickerModal';
			backdrop.className = 'pk-backdrop';
			backdrop.style.zIndex = '200';
			const inner = document.createElement('div');
			inner.className = 'pk-modal';
			inner.style.cssText = 'max-width:360px;width:min(360px,94vw)';
			inner.innerHTML = '<div class="pk-modal-head">' +
				'<span class="pk-modal-title">' + ico(ICO.npc) + ' Choose Partner</span>' +
				'<button class="pk-close" id="partnerPickerClose" type="button">' + ico(ICO.close) + '</button>' +
				'</div>' +
				'<div class="pk-modal-body" style="padding-top:8px">' +
				'<div id="partnerPickerGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-height:320px;overflow-y:auto;padding:4px 2px"></div>' +
				'</div>';
			backdrop.appendChild(inner);
			// Click outside inner box closes
			backdrop.addEventListener('pointerdown', e => { if (e.target === backdrop) backdrop.remove(); });
			document.body.appendChild(backdrop);

			const grid = document.getElementById('partnerPickerGrid');
			const inv = Inventory.load();
			const current = inv.companionForm;

			caught.forEach(dexId => {
				const form = FOLLOWER_FORMS[dexId];
				if (!form) return;
				const isActive = current == dexId;
				const cell = document.createElement('button');
				cell.type = 'button';
				cell.className = 'partner-pick-cell' + (isActive ? ' is-active' : '');
				// Show first frame (40×40 top-left of sprite sheet) via CSS clip
				cell.innerHTML = '<div class="partner-pick-sprite" style="background-image:url(' + form.url + ')"></div>' +
					'<div class="partner-pick-name">' + form.displayName + '</div>';
				cell.addEventListener('click', () => {
					window.__campScene?._switchFollower(dexId);
					backdrop.remove();
				});
				grid.appendChild(cell);
			});

			document.getElementById('partnerPickerClose').addEventListener('click', () => backdrop.remove());
		}

		function wire(scene) {
			const root = $('campPartner');
			if (!root || root.dataset.wired) { return; }
			root.dataset.wired = '1';
			$('cpClose') && $('cpClose').addEventListener('click', close);
			$('cpFeed') && $('cpFeed').addEventListener('click', () => feed(scene));
			$('cpPet') && $('cpPet').addEventListener('click', () => { Amie.open(); });
			$('cpPC') && $('cpPC').addEventListener('click', () => PCBox.open());
			$('cpChoosePartner') && $('cpChoosePartner').addEventListener('click', () => openPartnerPicker());
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
	function getEffectiveGrowMs() {
		const inv = Inventory.load();
		let ms = GROW_MS;
		// Herbal Tea fast-grow boost: 80% faster (10% of normal time)
		if (inv.boosts && inv.boosts.fastGrow > Date.now()) ms = Math.floor(ms * 0.1);
		// Furniture grow speed bonus: 20% faster
		const fb = getFurnitureBonuses ? getFurnitureBonuses() : { growSpeedBonus: 0 };
		if (fb.growSpeedBonus > 0) ms = Math.floor(ms * (1 - fb.growSpeedBonus));
		// Partner passive: Leafeon gives +30% grow speed
		const pp = typeof getPartnerPassive === 'function' ? getPartnerPassive() : { growSpeedBonus: 0 };
		if (pp.growSpeedBonus > 0) ms = Math.floor(ms * (1 - pp.growSpeedBonus));
		return Math.max(1000, ms);
	}
	const SEED_PRICE = 5;
	const BERRY_PRICE = 10;
	const BERRY_TYPES = {
		pecha:  { label: 'Pecha Berry',  icoKey: 'berry', growMs: 30000,  friendship: 20, sellPrice: 10, color: '#ffaacc' },
		oran:   { label: 'Oran Berry',   icoKey: 'berry', growMs: 90000,  friendship: 35, sellPrice: 18, color: '#6688ff' },
		sitrus: { label: 'Sitrus Berry', icoKey: 'berry', growMs: 180000, friendship: 50, sellPrice: 30, color: '#ffdd44' },
	};
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
		glaceon:  { sheet: 'glaceon',  cols: 4, originY: 30/48, scale: 0.60, frameW: 32, frameH: 48, displayName: 'Glaceon' },
		sylveon:  { sheet: 'sylveon',  cols: 4, originY: 30/48, scale: 0.60, frameW: 32, frameH: 48, displayName: 'Sylveon' },
	};
	// ── PMD SpriteCollab — all 151 Pokémon via CDN ────────────────────────────
	const PMD_CDN = 'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite/';
	const PMD_NAMES = [null,
		'Bulbasaur','Ivysaur','Venusaur','Charmander','Charmeleon','Charizard',
		'Squirtle','Wartortle','Blastoise','Caterpie','Metapod','Butterfree',
		'Weedle','Kakuna','Beedrill','Pidgey','Pidgeotto','Pidgeot',
		'Rattata','Raticate','Spearow','Fearow','Ekans','Arbok',
		'Pikachu','Raichu','Sandshrew','Sandslash','Nidoran F','Nidorina',
		'Nidoqueen','Nidoran M','Nidorino','Nidoking','Clefairy','Clefable',
		'Vulpix','Ninetales','Jigglypuff','Wigglytuff','Zubat','Golbat',
		'Oddish','Gloom','Vileplume','Paras','Parasect','Venonat','Venomoth',
		'Diglett','Dugtrio','Meowth','Persian','Psyduck','Golduck',
		'Mankey','Primeape','Growlithe','Arcanine','Poliwag','Poliwhirl',
		'Poliwrath','Abra','Kadabra','Alakazam','Machop','Machoke','Machamp',
		'Bellsprout','Weepinbell','Victreebel','Tentacool','Tentacruel',
		'Geodude','Graveler','Golem','Ponyta','Rapidash','Slowpoke','Slowbro',
		'Magnemite','Magneton',"Farfetch'd",'Doduo','Dodrio','Seel','Dewgong',
		'Grimer','Muk','Shellder','Cloyster','Gastly','Haunter','Gengar',
		'Onix','Drowzee','Hypno','Krabby','Kingler','Voltorb','Electrode',
		'Exeggcute','Exeggutor','Cubone','Marowak','Hitmonlee','Hitmonchan',
		'Lickitung','Koffing','Weezing','Rhyhorn','Rhydon','Chansey',
		'Tangela','Kangaskhan','Horsea','Seadra','Goldeen','Seaking',
		'Staryu','Starmie','Mr. Mime','Scyther','Jynx','Electabuzz','Magmar',
		'Pinsir','Tauros','Magikarp','Gyarados','Lapras','Ditto',
		'Eevee','Vaporeon','Jolteon','Flareon','Porygon','Omanyte','Omastar',
		'Kabuto','Kabutops','Aerodactyl','Snorlax','Articuno','Zapdos',
		'Moltres','Dratini','Dragonair','Dragonite','Mewtwo','Mew'
	];
	// Per-dex scale overrides (larger Pokémon get smaller scale so they fit visually)
	const PMD_SCALE = {
		6:0.68,9:0.68,31:0.65,34:0.65,59:0.65,62:0.65,65:0.65,68:0.65,
		71:0.65,73:0.65,76:0.65,89:0.65,91:0.65,94:0.70,103:0.65,149:0.65,
		143:0.60,150:0.65,131:0.65,130:0.65
	};
	for (let _i = 1; _i <= 151; _i++) {
		FOLLOWER_FORMS[_i] = {
			sheet: 'pmd-' + _i,
			url: PMD_CDN + String(_i).padStart(4,'0') + '/Walk-Anim.png',
			cols: 6, originY: 0.75, scale: PMD_SCALE[_i] || 0.72,
			frameW: 40, frameH: 40, displayName: PMD_NAMES[_i], dex: _i
		};
	}
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
		bed:          { label: 'Bed',           price: 50, icoKey: 'house',   r: 4, c: 5,  cat: 'furniture' },
		desk:         { label: 'Study Desk',    price: 30, icoKey: 'pc',      r: 3, c: 8,  cat: 'furniture' },
		dresser:      { label: 'Dresser',       price: 35, icoKey: 'house',   r: 3, c: 11, cat: 'furniture' },
		wardrobe:     { label: 'Wardrobe',      price: 45, icoKey: 'house', r: 6, c: 13, cat: 'furniture' },
		lamp:         { label: 'Cozy Lamp',     price: 20, icoKey: 'sun', r: 3, c: 9,  cat: 'furniture' },
		radio:        { label: 'Music Player',  price: 25, icoKey: 'music', r: 3, c: 2,  cat: 'furniture' },
		mirror:       { label: 'Mirror',        price: 30, icoKey: 'sparkle', r: 6, c: 2,  cat: 'furniture' },
		gaming:       { label: 'Game Console',  price: 35, icoKey: 'game',    r: 3, c: 6,  cat: 'furniture' },
		curtain:      { label: 'Red Curtain',   price: 20, icoKey: 'house', r: 2, c: 10, cat: 'furniture' },
		curtain_green:{ label: 'Green Curtain', price: 20, icoKey: 'house', r: 2, c: 12, cat: 'furniture' },
		stool:        { label: 'Round Stool',   price: 20, icoKey: 'house',   r: 5, c: 7,  cat: 'furniture' },
		nightstand:   { label: 'Nightstand',    price: 25, icoKey: 'house', r: 4, c: 9,  cat: 'furniture' },
		armchair:     { label: 'Armchair',      price: 40, icoKey: 'house', r: 7, c: 3,  cat: 'furniture' },
		// Decor
		plant:        { label: 'Indoor Plant',  price: 20, icoKey: 'tree', r: 6, c: 9,  cat: 'decor' },
		flowerplant:  { label: 'Flower Plant',  price: 25, icoKey: 'seed',    r: 7, c: 11, cat: 'decor' },
		poster:       { label: 'Wall Art',      price: 15, icoKey: 'sparkle', r: 2, c: 6,  cat: 'decor' },
		trophy:       { label: 'Trophy',        price: 40, icoKey: 'achieve', r: 2, c: 2,  cat: 'decor' },
		book:         { label: 'Story Books',   price: 15, icoKey: 'book',    r: 2, c: 4,  cat: 'decor' },
		bear:         { label: 'Stuffed Bear',  price: 15, icoKey: 'heart', r: 6, c: 7,  cat: 'decor' },
		stars:        { label: 'Star Mobile',   price: 25, icoKey: 'star',    r: 5, c: 4,  cat: 'decor' },
		barrel:       { label: 'Barrel',        price: 20, icoKey: 'house', r: 8, c: 12, cat: 'decor' },
	};

	const HOUSE_ITEMS = {
		// Furniture
		tv:         { label: 'Television',    price: 40, icoKey: 'pc', r: 2, c: 5,  cat: 'furniture' },
		couch:      { label: 'Red Couch',     price: 35, icoKey: 'house', r: 5, c: 4,  cat: 'furniture' },
		armchair:   { label: 'Armchair',      price: 40, icoKey: 'house', r: 5, c: 8,  cat: 'furniture' },
		bookcase:   { label: 'Bookcase',      price: 30, icoKey: 'book', r: 2, c: 9,  cat: 'furniture' },
		clock:      { label: 'Wall Clock',    price: 25, icoKey: 'info', r: 2, c: 7,  cat: 'furniture' },
		floorlamp:  { label: 'Floor Lamp',    price: 20, icoKey: 'sun', r: 5, c: 13, cat: 'furniture' },
		sidetable:  { label: 'Side Table',    price: 25, icoKey: 'house', r: 4, c: 11, cat: 'furniture' },
		// Decor
		plant:      { label: 'Floor Plant',   price: 20, icoKey: 'tree',    r: 2, c: 2,  cat: 'decor' },
		flowerplant:{ label: 'Flower Plant',  price: 25, icoKey: 'seed',    r: 8, c: 8,  cat: 'decor' },
		kettle:     { label: 'Tea Kettle',    price: 15, icoKey: 'curry', r: 9, c: 4,  cat: 'decor' },
		vase:       { label: 'Flower Vase',   price: 20, icoKey: 'seed', r: 9, c: 11, cat: 'decor' },
		frame:      { label: 'Photo Frame',   price: 15, icoKey: 'sparkle', r: 2, c: 11, cat: 'decor' },
		plush:      { label: 'Plush Cat',     price: 25, icoKey: 'heart', r: 7, c: 12, cat: 'decor' },
		barrel:     { label: 'Barrel',        price: 20, icoKey: 'house',   r: 9, c: 7,  cat: 'decor' },
		chest:      { label: 'Treasure Chest',price: 30, icoKey: 'gift', r: 9, c: 13, cat: 'decor' },
	};

	// ── Furniture pixel-art sprites ──────────────────────────────────────────────
	// 16×16 designs painted at runtime via canvas + fillRect, so no extra image
	// assets are needed and the look matches the camp's BW2-style tile art.
	// Each entry: { palette: { char: '#rrggbb' }, rows: [16 strings] }. '.' = transparent.
	const FURNITURE_DESIGNS = {
		// ── Upstairs (ROOM_ITEMS) ──
		desk: { palette:{1:'#1a1a1a',2:'#5b3a1d',3:'#9a6b3e',A:'#79c5ff',B:'#3a8bcf'}, rows:[
			"................",
			"....111111......",
			"...1BAAAAB1.....",
			"...1AAAAAA1.....",
			"...1AAAAAA1.....",
			"...1BAAAAB1.....",
			"...11111111.....",
			".....1111.......",
			"..3333333333....",
			"..3333333333....",
			"..2222222222....",
			"..2........2....",
			"..2........2....",
			"..2........2....",
			"..2........2....",
			"................",
		]},
		lamp: { palette:{1:'#3a3a3a',2:'#f3d780',3:'#9c6f2a',Y:'#fff3b3'}, rows:[
			"................",
			".......YY.......",
			"......YYYY......",
			".....YYYYYY.....",
			"....33333333....",
			"....32222223....",
			"....32222223....",
			".....333333.....",
			"......1111......",
			"......1111......",
			"......1111......",
			"......1111......",
			".....111111.....",
			"....11111111....",
			"....33333333....",
			"................",
		]},
		radio: { palette:{1:'#0e0e0e',2:'#1a1a1a',3:'#3a3a3a',4:'#fff',Y:'#fc6',S:'#666'}, rows:[
			"................",
			"................",
			"...22222222.....",
			"...23333332.....",
			"...23S22S32.....",
			"...23SS44S32....",
			"...23S44SS32....",
			"...23S22S32.....",
			"...23333332.....",
			"...23Y4Y4Y2.....",
			"...23333332.....",
			"...22222222.....",
			"................",
			"................",
			"................",
			"................",
		]},
		mirror: { palette:{1:'#a47a30',2:'#d4a857',3:'#cfe5ff',4:'#fff',B:'#86b8e0'}, rows:[
			"................",
			"......1111......",
			".....122221.....",
			"....12333321....",
			"....1334B331....",
			"....134BB431....",
			"....1344B431....",
			"....1334B331....",
			"....1333B331....",
			"....1B33B331....",
			"....12333321....",
			".....122221.....",
			"......1111......",
			".......22.......",
			"......2222......",
			"................",
		]},
		gaming: { palette:{1:'#1a1a1a',2:'#444',3:'#888',A:'#3aff66',B:'#3a8bcf',C:'#ff6a3a'}, rows:[
			"................",
			"...11111111.....",
			"...1AAAAAA1.....",
			"...1ABBBBA1.....",
			"...1ABBBBA1.....",
			"...1AAAAAA1.....",
			"...11111111.....",
			"......11........",
			"....111111......",
			"................",
			"..222222222.....",
			"..233333332.....",
			"..23CCC3B3 2....",
			"..233333332.....",
			"..222222222.....",
			"................",
		]},
		curtain: { palette:{1:'#5b3a1d',2:'#8a5a2a',3:'#79c5ff',4:'#aee0ff',5:'#c44',6:'#922'}, rows:[
			"................",
			"..1111111111....",
			"..15555555 51....",
			"..16555 55561....",
			"..1543334451....",
			"..1543334451....",
			"..1543334451....",
			"..1565556561....",
			"..1565556561....",
			"..1565556561....",
			"..1655555 61....",
			"..1555555551....",
			"..1565556561....",
			"..1111111111....",
			"................",
			"................",
		]},
		plant: { palette:{1:'#3a7e2a',2:'#5fb83a',3:'#1f4a18',4:'#8c5a30',5:'#a47233'}, rows:[
			"................",
			"......222.......",
			".....12321......",
			"....1232321.....",
			"....2321232.....",
			"...12333321.....",
			"...232123232....",
			"....1233321.....",
			".....12321......",
			"......121.......",
			".....55555......",
			"....4444444.....",
			"....4555554.....",
			"....4444444.....",
			".....44444......",
			"................",
		]},
		poster: { palette:{1:'#a47a30',2:'#d4a857',3:'#9bd6ff',4:'#fce98a',5:'#3a7e2a',6:'#fff'}, rows:[
			"................",
			"...11111111.....",
			"...12222221.....",
			"...12333321.....",
			"...12366321.....",
			"...12344321.....",
			"...12345321.....",
			"...12355321.....",
			"...12355321.....",
			"...12345321.....",
			"...12222221.....",
			"...11111111.....",
			"................",
			"................",
			"................",
			"................",
		]},
		trophy: { palette:{1:'#a47a30',2:'#ffd34d',3:'#e6a832',4:'#fff8c8',5:'#5b3a1d'}, rows:[
			"................",
			"....1111111.....",
			"....1222221.....",
			"....1244421.....",
			"....1242421.....",
			"....1244421.....",
			"....1222221.....",
			"....13333 31....",
			".....32223......",
			"......212.......",
			"......212.......",
			".....22222......",
			"....5555555.....",
			"....5555555.....",
			"................",
			"................",
		]},
		book: { palette:{1:'#1a1a1a',2:'#c44',3:'#46b',4:'#4a4',5:'#db4',6:'#fc6'}, rows:[
			"................",
			"................",
			"...1111111111...",
			"...1444444461...",
			"...1444444451...",
			"...1444444461...",
			"...1111111111...",
			"...1222222221...",
			"...1226222221...",
			"...1222222261...",
			"...1111111111...",
			"...1333333361...",
			"...1333333351...",
			"...1333333361...",
			"...1111111111...",
			"................",
		]},
		bear: { palette:{1:'#7a4520',2:'#a36437',3:'#1a1a1a',4:'#c44',5:'#fff'}, rows:[
			"................",
			"....22....22....",
			"...2112..2112...",
			"...2112..2112...",
			"....22....22....",
			"....22222222....",
			"...2333223332...",
			"...211211 1112...",
			"...221334 1322..",
			"...22122 21222..",
			"....22444422....",
			"...221111122....",
			"..21111111112...",
			"..211111111 12...",
			"...22222222.....",
			"................",
		]},
		stars: { palette:{1:'#3a3a3a',2:'#ffd34d',3:'#fff',Y:'#fff3b3'}, rows:[
			"....111111111...",
			"................",
			"...1...1...1....",
			"...1...1...1....",
			"...1...1...1....",
			"...1...1...1....",
			"...1...1...1....",
			"...Y...Y...Y....",
			"..YYY.YYY.YYY...",
			".YYYYYYYYYYYYY..",
			"..YYY.YYY.YYY...",
			"...Y...Y...Y....",
			"................",
			"................",
			"................",
			"................",
		]},
		// ── Ground floor (HOUSE_ITEMS) ──
		tv: { palette:{1:'#1a1a1a',2:'#3a3a3a',3:'#5b3a1d',A:'#46a8e0',B:'#1f6090'}, rows:[
			"................",
			"...1111111111...",
			"...12222222 21...",
			"...12AAAAAA21...",
			"...12ABBBBA21...",
			"...12ABBBBA21...",
			"...12AAAAAA21...",
			"...12222222 21...",
			"...1111111111...",
			"......1..1......",
			"....33333333....",
			"....3....3..3...",
			"....3....3..3...",
			"................",
			"................",
			"................",
		]},
		couch: { palette:{1:'#1a1a1a',2:'#7a2a2a',3:'#a83a3a',4:'#d04a4a',5:'#5b3a1d'}, rows:[
			"................",
			"................",
			"..2222222222....",
			"..2334444332....",
			"..2344444432....",
			"..2344444432....",
			"..2344444432....",
			"..2223333322....",
			"..2222222222....",
			"..2444444442....",
			"..2434434442....",
			"..2444444442....",
			"..2222222222....",
			"..5..........5..",
			"..5..........5..",
			"................",
		]},
		bookcase: { palette:{1:'#3a2410',2:'#5b3a1d',3:'#8a5a2a',4:'#c44',5:'#46b',6:'#4a4',7:'#db4',8:'#fc6'}, rows:[
			"....111111111...",
			"....122222221...",
			"....14545454 51...",
			"....16767676 71...",
			"....122222221...",
			"....14545454 51...",
			"....16767676 71...",
			"....122222221...",
			"....14545454 51...",
			"....16767676 71...",
			"....122222221...",
			"....14545454 51...",
			"....16767676 71...",
			"....122222221...",
			"....111111111...",
			"................",
		]},
		clock: { palette:{1:'#5b3a1d',2:'#a47a30',3:'#fff',4:'#1a1a1a',5:'#c44'}, rows:[
			"................",
			".....111111.....",
			"....12222221....",
			"...1233333321...",
			"...1233333321...",
			"...123344 4321...",
			"...12334534321..",
			"...12333534321..",
			"...12334434321..",
			"...12333333321..",
			"...12333334321..",
			"...12333334321..",
			"....12333321....",
			".....111111.....",
			"................",
			"................",
		]},
		floorlamp: { palette:{1:'#3a3a3a',2:'#f3d780',3:'#9c6f2a',Y:'#fff3b3'}, rows:[
			"......YYYY......",
			".....YYYYYY.....",
			"....YYYYYYYY....",
			"....33333333....",
			"....32222223....",
			"....32222223....",
			".....333333.....",
			"......111.......",
			"......111.......",
			"......111.......",
			"......111.......",
			"......111.......",
			"......111.......",
			"......111.......",
			"....11111111....",
			"....33333333....",
		]},
		// "plant" is shared (only HOUSE if upstairs already loaded its own — Phaser
		// caches by key so we register a HOUSE-specific key in scene code.)
		floorplant: { palette:{1:'#3a7e2a',2:'#5fb83a',3:'#1f4a18',4:'#8c5a30',5:'#a47233'}, rows:[
			"....1...........",
			"..1212..........",
			".121231.........",
			"..21232.........",
			"...12321........",
			"..123212.........",
			".12312132.........",
			"..21321.........",
			"....121.........",
			"....555.........",
			"...44444........",
			"...45554........",
			"...44444........",
			"....444.........",
			"................",
			"................",
		]},
		kettle: { palette:{1:'#1a1a1a',2:'#3a3a3a',3:'#5a5a5a',4:'#888',5:'#a83a3a',6:'#fff'}, rows:[
			"................",
			"................",
			"......2..2......",
			"......22 22......",
			".....111111.....",
			"....21555512....",
			"....25555552....",
			"...255555552....",
			"...255555552....",
			"...255555552....",
			"....25555552....",
			"....21555512....",
			"....111111111...",
			"................",
			"................",
			"................",
		]},
		vase: { palette:{1:'#a47a30',2:'#d4a857',3:'#c44',4:'#922',5:'#4a4',6:'#5fb83a',7:'#3a7e2a'}, rows:[
			"......333.......",
			".....34453......",
			".....35563......",
			"....63575636....",
			"....66666666....",
			".....55555......",
			".....111111.....",
			".....122221.....",
			".....122221.....",
			"....12222221....",
			"....12222221....",
			"....12222221....",
			"....12222221....",
			".....111111.....",
			"......1111......",
			"................",
		]},
		frame: { palette:{1:'#a47a30',2:'#ffd34d',3:'#9bd6ff',4:'#3a7e2a',5:'#fce98a',6:'#fff'}, rows:[
			"................",
			"...1111111111...",
			"...1222222221...",
			"...12333333 21...",
			"...12365 5321...",
			"...12334 4321...",
			"...12345 5321...",
			"...12344 4321...",
			"...12333 3321...",
			"...12222 2221...",
			"...1111111111...",
			"................",
			"................",
			"................",
			"................",
			"................",
		]},
		plush: { palette:{1:'#cf6a2a',2:'#e6803a',3:'#1a1a1a',4:'#fff',5:'#c44',6:'#fc6'}, rows:[
			"................",
			"...22....22.....",
			"..2112..2112....",
			"..2222222222....",
			"..2333223332....",
			"..2244332442....",
			"..223333 3332....",
			"..2233553322....",
			"...22555522.....",
			"..2222222222....",
			".211222222112...",
			".2111122222112...",
			"..2222222222....",
			"...2222222 2....",
			"...22222222.....",
			"................",
		]},
	};

	// Sprite-sheet definitions for furniture.
	// s:1 = Pictures/furniture_sheet.png  (tileset_16x16_interior.png, 256×256, CC-BY-SA 3.0)
	// s:2 = Pictures/furniture_sheet2.png (furniture_0.png indoor RPG, 128×64, CC-BY 3.0)
	// x,y,w,h are pixel coords in that sheet; all output canvases are 16×16.
	const SPRITE_DEFS = {
		// ── Sheet 2 (each sprite is already 16×16) ──────────────────────────────
		bed:          { s:2, x:0,   y:0,  w:16, h:16 },
		bookcase:     { s:2, x:48,  y:0,  w:16, h:16 },
		dresser:      { s:2, x:64,  y:0,  w:16, h:16 },
		stool:        { s:2, x:80,  y:0,  w:16, h:16 },
		desk:         { s:2, x:96,  y:0,  w:16, h:16 },
		sidetable:    { s:2, x:112, y:0,  w:16, h:16 },
		tv:           { s:2, x:0,   y:16, w:16, h:16 },
		nightstand:   { s:2, x:48,  y:16, w:16, h:16 },
		plant:        { s:2, x:64,  y:16, w:16, h:16 },
		floorplant:   { s:2, x:64,  y:16, w:16, h:16 },
		flowerplant:  { s:2, x:80,  y:16, w:16, h:16 },
		trophy:       { s:2, x:112, y:16, w:16, h:16 },
		armchair:     { s:2, x:16,  y:32, w:16, h:16 },
		couch:        { s:2, x:32,  y:32, w:16, h:16 },
		barrel:       { s:2, x:64,  y:32, w:16, h:16 },
		gaming:       { s:2, x:96,  y:32, w:16, h:16 },
		kettle:       { s:2, x:0,   y:48, w:16, h:16 },
		wardrobe:     { s:2, x:64,  y:48, w:16, h:16 },
		chest:        { s:2, x:0,   y:32, w:16, h:16 },
		// ── Sheet 1 (multi-tile sprites scaled to 16×16) ─────────────────────────
		// Curtains: cols 8-9, each set is 3 rows tall (verified via pixel scan)
		curtain:      { s:1, x:128, y:80,  w:32, h:48 },
		curtain_green:{ s:1, x:128, y:128, w:32, h:48 },
		curtain_blue: { s:1, x:128, y:176, w:32, h:48 },
		// Candle at col 15, row 10 (verified)
		lamp:         { s:1, x:240, y:160, w:16, h:16 },
		floorlamp:    { s:1, x:240, y:160, w:16, h:16 },
		// Vase/pot at col 13, row 14
		vase:         { s:1, x:208, y:224, w:16, h:16 },
	};

	const FurnitureSprites = (() => {
		const cache = {};

		// Eagerly load both sprite sheets so they're ready by the time the user
		// enters their house. The images are tiny (<15 KB total).
		const sheets = [null, null, null]; // 1-indexed
		function loadSheets() {
			[1, 2].forEach((n) => {
				const img = new Image();
				img.src = `Pictures/furniture_sheet${n === 1 ? '' : n}.png`;
				sheets[n] = img;
			});
		}
		loadSheets();

		function drawFromSheet(ctx, def) {
			const img = sheets[def.s];
			if (!img || !img.complete || img.naturalWidth === 0) return false;
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(img, def.x, def.y, def.w, def.h, 0, 0, 16, 16);
			return true;
		}

		function get(key) {
			if (cache[key]) return cache[key];
			const canvas = document.createElement('canvas');
			canvas.width = 16; canvas.height = 16;
			const ctx = canvas.getContext('2d');
			ctx.imageSmoothingEnabled = false;

			// Try sprite sheet first.
			const def = SPRITE_DEFS[key];
			if (def && drawFromSheet(ctx, def)) {
				cache[key] = canvas;
				return canvas;
			}

			// Fall back to canvas pixel-art design.
			const designKey = key === 'plant' ? 'floorplant' : key;
			const d = FURNITURE_DESIGNS[designKey] || FURNITURE_DESIGNS[key];
			if (!d) return null;
			for (let r = 0; r < d.rows.length; r++) {
				const row = d.rows[r];
				for (let c = 0; c < row.length; c++) {
					const ch = row[c];
					if (ch === '.' || ch === ' ') continue;
					const color = d.palette[ch];
					if (!color) continue;
					ctx.fillStyle = color;
					ctx.fillRect(c, r, 1, 1);
				}
			}
			cache[key] = canvas;
			return canvas;
		}

		// Invalidate cache on sheet load so subsequent get() calls use the real art.
		[1, 2].forEach((n) => {
			sheets[n] && (sheets[n].onload = () => {
				Object.keys(cache).forEach((k) => {
					if (SPRITE_DEFS[k]?.s === n) delete cache[k];
				});
			});
		});

		function makeIcon(key, sizePx) {
			const src = get(key);
			if (!src) {
				const span = document.createElement('span');
				span.innerHTML = (() => { const _it = ROOM_ITEMS[key] || HOUSE_ITEMS[key] || {}; return _it.icoKey ? ico(ICO[_it.icoKey]||_it.icoKey) : ''; })();
				span.style.fontSize = (sizePx || 22) + 'px';
				return span;
			}
			const img = document.createElement('canvas');
			img.width = 16; img.height = 16;
			const ctx = img.getContext('2d');
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(src, 0, 0);
			img.style.width = (sizePx || 32) + 'px';
			img.style.height = (sizePx || 32) + 'px';
			img.style.imageRendering = 'pixelated';
			img.style.display = 'block';
			return img;
		}

		// Re-render icons after sheet loads (editor may already be open).
		function refreshIcons() {
			document.querySelectorAll('[data-furniture-key]').forEach((el) => {
				const key = el.dataset.furnitureKey;
				const fresh = get(key);
				if (fresh && el.tagName === 'CANVAS') {
					el.getContext('2d').drawImage(fresh, 0, 0);
				}
			});
		}
		[1, 2].forEach((n) => {
			if (sheets[n]) sheets[n].addEventListener('load', refreshIcons);
		});

		return { get, makeIcon };
	})();

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
					// Away-time check: if lastLogin is set, compute time away and award items
					if (parsed.lastLogin) {
						const awayMs = Date.now() - parsed.lastLogin;
						const awayHours = awayMs / 3600000;
						if (awayHours >= 1) {
							// Camp rating bonus (calculated here since CampRating module not yet defined;
							// we replicate the logic inline to avoid forward-reference issues)
							const _placements = Object.keys({
								...(parsed.cosmetics?.roomPlacements || {}),
								...(parsed.cosmetics?.housePlacements || {}),
							}).length;
							let _rScore = Math.min(2, Math.floor(_placements / 2));
							try { const _pl = JSON.parse(localStorage.getItem('pokequiz_plants') || '[]'); if (_pl.length >= 2) _rScore += 1; } catch {}
							if ((parsed.pcBox || []).length >= 3) _rScore += 1;
							if ((parsed.friendship || 0) >= 80) _rScore += 1;
							const _rMult = 1 + (Math.min(5, Math.max(1, _rScore)) - 1) * 0.2;

							let msg = '';
							if (awayHours >= 8) {
								parsed.seeds = (parsed.seeds||0) + Math.round(3 * _rMult);
								parsed.friendshipBerries = (parsed.friendshipBerries||0) + Math.round(2 * _rMult);
								parsed.tokens = (parsed.tokens||0) + Math.round(10 * _rMult);
								msg = 'Away 8h+: found seeds, berries & tokens! (×' + _rMult.toFixed(1) + ' camp bonus)';
							} else if (awayHours >= 4) {
								parsed.seeds = (parsed.seeds||0) + Math.round(2 * _rMult);
								parsed.friendshipBerries = (parsed.friendshipBerries||0) + Math.round(1 * _rMult);
								msg = 'Away 4h+: found seeds & berries! (×' + _rMult.toFixed(1) + ')';
							} else if (awayHours >= 1) {
								parsed.seeds = (parsed.seeds||0) + Math.round(1 * _rMult);
								msg = 'Away 1h+: found a seed!';
							}
							if (msg) {
								parsed.lastLogin = Date.now();
								localStorage.setItem(INVENTORY_KEY, JSON.stringify(parsed));
								setTimeout(() => { if (typeof showToast !== 'undefined') showToast(ico(ICO.camp) + ' Your Pokémon explored! ' + msg); }, 2000);
							}
						}
					}
					return Object.assign({}, DEFAULT, parsed, { cosmetics: cosm });
				}
			} catch {}
			return Object.assign({}, DEFAULT, { cosmetics: Object.assign({}, DEFAULT.cosmetics) });
		}
		function save(inv) {
			try {
				inv.lastLogin = Date.now();
				localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv));
			} catch {}
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

	function getNpcDialog(npc) {
		if (typeof npc.dialog === 'string') return npc.dialog;
		if (Array.isArray(npc.dialog)) {
			const day = Math.floor(Date.now() / 86400000);
			const hash = (npc.key || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
			return npc.dialog[(day + hash) % npc.dialog.length];
		}
		return '';
	}

	const NPCS = [
		{
			key: 'mart-keeper', species: 'pikachu', r: 14, c: 13,
			label: 'Shop',
			spriteScale: 0.55, frameHeight: 40,
			kind: 'mart',
			dialog: [
				"Welcome to my shop! I buy berries and sell seeds — opening the mart now.",
				"Pika! Business is slow today. Come sell those berries!",
				"The freshest seeds in camp — straight from the Pokémon Express!",
				"Pikachu estimates berry prices are UP today. Sell now!",
			],
		},
		{
			key: 'farmer', species: 'bulbasaur', r: 19, c: 19,
			label: 'Talk',
			spriteScale: 0.6, frameHeight: 40,
			dialog: [
				"These plots love a good seed! Plant one on any soil tile and check back in a bit for a Friendship Berry.",
				"Bulba! Rain makes the berries grow faster — or so they say.",
				"I heard Oran Berries give extra friendship. Worth the wait!",
				"Saur! My record is 20 berries in one harvest. Can you beat it?",
			],
		},
		{
			key: 'quest-board', species: 'pikachu', r: 8, c: 28,
			label: 'Quests',
			kind: 'quests',
			spriteScale: 0.55, frameHeight: 40,
			dialog: [
				"Daily quest board! Check your tasks for today.",
				"New quests reset at midnight. Have you done yours?",
				"Complete all quests for bonus tokens!",
			],
		},
		{
			key: 'visiting-camper', species: 'bulbasaur', r: 16, c: 8,
			label: 'Talk',
			kind: 'camper',
			spriteScale: 0.6, frameHeight: 40,
			dialog: ["..."],  // overridden by NpcCampers.openDialog
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
	const MARKET_NPCS = [
		{
			key: 'm-pikachu', species: 'pikachu', r: 7, c: 7,
			label: 'Shop', shopKind: 'general',
			spriteScale: 0.55, frameHeight: 40,
			dialog: [
				"Pika! Seeds and berries at the trainer's mart.",
				"Pikachu says: berry prices looking good today!",
				"Come see what's in stock!",
			],
		},
		{
			key: 'm-bulbasaur', species: 'bulbasaur', r: 7, c: 22,
			label: 'Shop', shopKind: 'berries',
			spriteScale: 0.6, frameHeight: 40,
			dialog: [
				"Bulba! Fresh-picked berries straight from my patch.",
				"The soil looks extra fertile today — good planting weather!",
				"Try an Oran Seed for a bigger friendship boost!",
			],
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
		{
			key: 'm-espeon', species: 'espeon', r: 5, c: 34,
			label: 'Heal', shopKind: 'pokecenter',
			spriteScale: 0.6, frameHeight: 48,
			dialog: "Espe~! Welcome to the Pokémon Center. We restore your Pokémon to full health — free of charge!",
		},
		{
			key: 'm-jolteon', species: 'jolteon', r: 5, c: 43,
			label: 'Café', shopKind: 'cafe',
			spriteScale: 0.6, frameHeight: 40,
			dialog: "Jolt! Welcome to my café — grab something energizing before your next quiz!",
		},
		{
			key: 'm-contest', species: 'espeon', r: 14, c: 18,
			label: 'Contest', shopKind: null, kind: 'contest',
			spriteScale: 0.6, frameHeight: 48,
			dialog: ['Welcome to the Contest Hall! Show off your partner\'s talents!', 'Ribbons are forever — come compete!'],
		},
	];

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
	const SIGN_MESSAGES_MARKET = {
		'9,7':   "Pikachu's Mart — seeds, basics, and berry trades.",
		'9,22':  "Berry Stand — sells berries by the bunch.",
		'16,7':  "Boutique — wallpapers and camp accent colors.",
		'16,22': "Stone Vendor — evolution stones for the worthy.",
		'10,31': "Pokémon Center — free healing and a complimentary berry!",
		'12,39': "Jolteon's Café — energizing beverages and treats!",
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
			const ppCast = typeof getPartnerPassive === 'function' ? getPartnerPassive() : { fishingBonus: false };
			const zone = document.getElementById('fishZone');
			if (zone) {
				if (ppCast.fishingBonus) { zone.style.width = '50%'; zone.style.left = '25%'; }
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

	function showToast(msg) {
		const existing = document.getElementById('campToast');
		if (existing) existing.remove();
		const toast = document.createElement('div');
		toast.id = 'campToast';
		toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#1a2440,#0e1826);border:2px solid #f6c84c;border-radius:10px;padding:10px 18px;font-family:"Press Start 2P",monospace;font-size:9px;color:#f6c84c;z-index:200;pointer-events:none;opacity:1;transition:opacity 0.5s ease;text-align:center;max-width:90vw;word-break:break-word';
		toast.innerHTML = msg;
		document.body.appendChild(toast);
		setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 2800);
	}

	const Achievements = (() => {
		const DEFS = [
			{ id: 'firstCatch',   label: 'First Catch',      icoKey: 'fish',      desc: 'Catch your first fish'              },
			{ id: 'rareFish',     label: 'Rare Find',        icoKey: 'gem',        desc: 'Catch a Lapras or Shiny Gyarados'   },
			{ id: 'firstEvol',    label: 'Evolution!',       icoKey: 'sparkle',        desc: 'Evolve your partner Pokémon'        },
			{ id: 'fullFriend',   label: 'Best Friends',     icoKey: 'heart',     desc: 'Max out friendship'                 },
			{ id: 'rhythm100',    label: 'Rhythm Master',    icoKey: 'music',    desc: 'Win 10 rhythm battles'              },
			{ id: 'berryFarmer',  label: 'Berry Farmer',     icoKey: 'seed',     desc: 'Harvest 20 berries total'           },
			{ id: 'questStreak',  label: 'Quest Complete',   icoKey: 'quest',   desc: 'Complete all daily quests in a day' },
			{ id: 'shopkeeper',   label: 'Wealthy Trainer',  icoKey: 'token',  desc: 'Earn 500 tokens total'              },
			{ id: 'decorator',    label: 'Interior Design',  icoKey: 'house',  desc: 'Place 5 furniture pieces'           },
			{ id: 'nightOwl',     label: 'Night Owl',        icoKey: 'moon',        desc: 'Play camp after 10 PM'              },
			{ id: 'dex100',       label: 'Pokémon Master',   icoKey: 'book',   desc: 'Catch 100 different Pokémon'        },
			{ id: 'hatchEgg',     label: 'Hatcher',          icoKey: 'egg',          desc: 'Hatch a Pokémon egg'                },
			{ id: 'contestWin',   label: 'Contestant',       icoKey: 'contest',       desc: 'Win your first Pokémon Contest'     },
			{ id: 'contestMaster',label: 'Contest Master',   icoKey: 'ribbon',   desc: 'Win all 5 Contest categories'       },
			{ id: 'chef',         label: 'Camp Chef',        icoKey: 'curry',        desc: 'Cook your first curry'              },
			{ id: 'explorer',     label: 'Explorer',         icoKey: 'map',         desc: 'Reveal the entire camp map'         },
			{ id: 'mysteryGift',  label: 'Gift Receiver',    icoKey: 'gift',    desc: 'Claim a Mystery Gift'               },
			{ id: 'wonderTrade',  label: 'Wonder Trade',     icoKey: 'trade',     desc: 'Complete a Wonder Trade'            },
			{ id: 'trainer10',    label: 'Rising Trainer',   icoKey: 'level',   desc: 'Reach Trainer Level 10'             },
			{ id: 'trainer30',    label: 'Ace Trainer',      icoKey: 'level',      desc: 'Reach Trainer Level 30'             },
			{ id: 'fiveStarCamp', label: 'Five-Star Camp',   icoKey: 'star',  desc: 'Earn a 5-star camp rating'          },
			{ id: 'storytime',    label: 'Storyteller',      icoKey: 'bookOpen',     desc: 'Read a campfire story'              },
			{ id: 'postcard',     label: 'Pen Pal',          icoKey: 'postcard',          desc: 'Send your first postcard'           },
			{ id: 'composted',    label: 'Composter',        icoKey: 'compost',       desc: 'Make your first compost'            },
			{ id: 'camperMet',    label: 'Good Company',     icoKey: 'npc',    desc: 'Meet a visiting trainer'            },
		];
		function load() {
			const raw = localStorage.getItem('pokequiz_achievements');
			return raw ? JSON.parse(raw) : {};
		}
		function save(data) { localStorage.setItem('pokequiz_achievements', JSON.stringify(data)); }
		function unlock(id) {
			const data = load();
			if (data[id]) return;
			data[id] = Date.now();
			save(data);
			showToast(ico(ICO.achieve) + ' Achievement: ' + (DEFS.find(d => d.id === id)?.label || id));
		}
		function increment(id) {
			const data = load();
			const key = '__count_' + id;
			data[key] = (data[key] || 0) + 1;
			if (id === 'rhythm100' && data[key] >= 10) unlock('rhythm100');
			if (id === 'berryFarmer' && data[key] >= 20) unlock('berryFarmer');
			save(data);
		}
		function getAll() { return { defs: DEFS, unlocked: load() }; }
		return { unlock, increment, getAll };
	})();

	// ── Trainer Level ─────────────────────────────────────────────────────────────
	const TrainerLevel = (() => {
		// XP needed to advance FROM each level (level 1 → needs XP_TABLE[1] to reach 2)
		const XP_TABLE = [0];
		for (let i = 1; i <= 50; i++) XP_TABLE[i] = Math.floor(18 * i * i * 0.85);

		const XP_SOURCES = { fish:15, harvest:10, rhythm:25, quest:20, cook:15, evolve:50,
			amie:8, contest:30, compost:12, postcard:18, camper:10, battle:10, egg:40 };

		function load() {
			try { return JSON.parse(localStorage.getItem('pokequiz_trainer_level') || '{"level":1,"xp":0,"totalXp":0}'); }
			catch { return { level:1, xp:0, totalXp:0 }; }
		}
		function save(d) { localStorage.setItem('pokequiz_trainer_level', JSON.stringify(d)); }

		function addXP(source) {
			const amount = XP_SOURCES[source] || 5;
			const d = load();
			d.xp = (d.xp || 0) + amount;
			d.totalXp = (d.totalXp || 0) + amount;
			let leveled = false;
			while (d.level < 50 && d.xp >= XP_TABLE[d.level]) {
				d.xp -= XP_TABLE[d.level];
				d.level++;
				leveled = true;
			}
			save(d);
			if (leveled) {
				showToast(ico(ICO.star) + ' Level Up! Trainer Level ' + d.level + '!');
				if (d.level >= 10) Achievements.unlock('trainer10');
				if (d.level >= 30) Achievements.unlock('trainer30');
			}
			updateHUD();
		}

		function updateHUD() {
			const el = document.getElementById('trainerLevelBadge');
			if (!el) return;
			const d = load();
			el.textContent = 'Lv.' + d.level;
			const next = d.level < 50 ? XP_TABLE[d.level] : '---';
			el.title = 'XP: ' + d.xp + ' / ' + next + '  |  Total: ' + d.totalXp;
		}

		function getLevel() { return load().level; }
		return { addXP, updateHUD, getLevel };
	})();

	// ── Camp Rating ───────────────────────────────────────────────────────────────
	const CampRating = (() => {
		function calculate() {
			const inv = Inventory.load();
			let score = 0;
			const placements = Object.keys({
				...(inv.cosmetics?.roomPlacements || {}),
				...(inv.cosmetics?.housePlacements || {}),
			}).length;
			score += Math.min(2, Math.floor(placements / 2));
			const plants = Plants.load();
			if (plants.length >= 2) score += 1;
			const boxSize = (inv.pcBox || []).length;
			if (boxSize >= 3) score += 1;
			if ((inv.friendship || 0) >= 80) score += 1;
			const stars = Math.min(5, Math.max(1, score));
			return stars;
		}

		function getAwayMultiplier() {
			const stars = calculate();
			return 1 + (stars - 1) * 0.2; // 1.0× at ★1, up to 1.8× at ★5
		}

		function displayOnGate() {
			const stars = calculate();
			const el = document.getElementById('campRatingGate');
			if (el) {
				el.textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars);
				el.title = stars + '-Star Camp';
			}
			if (stars === 5) Achievements.unlock('fiveStarCamp');
			return stars;
		}

		return { calculate, getAwayMultiplier, displayOnGate };
	})();

	// ── Campfire Stories ──────────────────────────────────────────────────────────
	const CampfireStories = (() => {
		const STORIES = [
			{ title:'The Legend of Ho-Oh', pages:[
				"Long ago, when Pokémon and humans first learned to live together...",
				"A great fire burned in the mountains of Johto.",
				"From the flames rose Ho-Oh, its wings spanning the sky.",
				"It left behind three sacred beasts — Entei, Raikou, and Suicune.",
				"They say on a clear evening you can still see Ho-Oh's rainbow trail.",
			]},
			{ title:"Eevee's Secret", pages:[
				"It is said that Eevee holds more potential than any Pokémon alive.",
				"Its DNA is uniquely irregular — able to adapt to any environment.",
				"In old stories, a trainer once befriended an Eevee deep in a forest.",
				"By sharing every adventure, the Eevee found its truest form...",
				"Not from a stone — but from the unbreakable bond between two hearts.",
			]},
			{ title:'The Wandering Snorlax', pages:[
				"Travelers in Kanto once reported a mountain that snored.",
				"It wasn't a mountain. It was Snorlax — the biggest of its kind.",
				"For seven days it slept across Route 12, blocking all passage.",
				"Only the Poké Flute could stir it... and even then, just barely.",
				"They say it went back to sleep in the forest. It's still there.",
			]},
			{ title:'The Old Man and the Magikarp', pages:[
				"An old fisherman sat at the same lake every day for thirty years.",
				"Every day, he caught only Magikarp. He never once complained.",
				"'The water knows patience,' he would say.",
				"On his last fishing day, his line went taut with impossible weight.",
				"A giant Gyarados leaped from the lake and bowed its head.",
				"It was his oldest Magikarp — finally evolved. Old friends at last.",
			]},
			{ title:'The Celestial Tower', pages:[
				"In Unova stands a tower where Pokémon go when they have passed.",
				"Trainers ring the bell at the top to honor them.",
				"The bell's tone carries for miles — some say it reaches the sky.",
				"On foggy nights, small lights circle the tower.",
				"The locals don't fear them. 'They're just saying hello,' they say.",
			]},
			{ title:'Mew and the Sea', pages:[
				"Before maps existed, Mew swam every ocean on Earth.",
				"It carried a copy of every Pokémon's DNA in its tiny body.",
				"Scientists call it a myth. But sailors still leave out offerings.",
				"A pink ripple seen at dawn. A giggle on the wind.",
				"Mew hasn't forgotten anyone. It never does.",
			]},
		];

		function getWeather() {
			try { return window.__campScene?.isRaining ? 'rain' : 'clear'; } catch { return 'clear'; }
		}

		function getStoryForToday() {
			const month = new Date().getMonth();
			const day   = Math.floor(Date.now() / 86400000);
			// Seasonal overrides
			if (month === 11 || month === 0 || month === 1) return STORIES[4]; // winter → tower
			if (month >= 2 && month <= 4)  return STORIES[1]; // spring → eevee
			if (getWeather() === 'rain')   return STORIES[2]; // rain → snorlax
			return STORIES[day % STORIES.length];
		}

		function open() {
			const story = getStoryForToday();
			let page = 0;
			let panel = document.getElementById('storyPanel');
			if (!panel) {
				panel = document.createElement('div');
				panel.id = 'storyPanel';
				document.body.appendChild(panel);
			}
			panel.hidden = false;

			function render() {
				panel.className = 'pk-backdrop';
				panel.innerHTML = '';
				const inner = document.createElement('div');
				inner.className = 'pk-modal pk-modal-sm';
				inner.style.textAlign = 'center';
				inner.innerHTML = '<div class="pk-modal-head">' +
					'<span class="pk-modal-title" style="color:#f0c860">' + ico(ICO.bookOpen) + ' ' + story.title.toUpperCase() + '</span>' +
					'</div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
				body.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:14px';

				const fire = document.createElement('div');
				fire.style.cssText = 'font-size:28px';
				fire.innerHTML = ico(ICO.fire, 'campfire-ico');

				const text = document.createElement('div');
				text.style.cssText = 'font-size:8px;color:var(--pk-text);line-height:1.9;min-height:56px;text-align:center;padding:0 8px;max-width:300px';
				text.textContent = story.pages[page];

				const pageNum = document.createElement('div');
				pageNum.style.cssText = 'font-size:7px;color:var(--pk-faint)';
				pageNum.textContent = (page+1) + ' / ' + story.pages.length;

				const btns = document.createElement('div');
				btns.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center';

				if (page < story.pages.length - 1) {
					const next = document.createElement('button');
					next.className = 'pk-btn pk-btn-gold pk-btn-sm';
					next.textContent = 'Next ▶';
					next.addEventListener('click', () => { page++; render(); });
					btns.appendChild(next);
				} else {
					const done = document.createElement('button');
					done.className = 'pk-btn pk-btn-green pk-btn-sm';
					done.innerHTML = ico(ICO.check) + ' The End';
					done.addEventListener('click', () => {
						panel.hidden = true;
						const inv = Inventory.load();
						inv.tokens = (inv.tokens||0) + 5;
						Inventory.save(inv);
						showToast(ico(ICO.bookOpen) + ' Story complete! +5 ' + ico(ICO.token));
						Achievements.unlock('storytime');
						TrainerLevel.addXP('quest');
					});
					btns.appendChild(done);
				}

				const skip = document.createElement('button');
				skip.className = 'pk-btn pk-btn-dark pk-btn-sm';
				skip.textContent = 'Close';
				skip.addEventListener('click', () => { panel.hidden = true; });
				btns.appendChild(skip);

				body.appendChild(fire);
				body.appendChild(text);
				body.appendChild(pageNum);
				body.appendChild(btns);
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
			}
			render();
		}

		return { open };
	})();

	// ── Postcard System ───────────────────────────────────────────────────────────
	const PostcardSystem = (() => {
		const MAX_CARDS = 10;
		const PROMPTS = [
			"What's your favourite Pokémon and why?",
			"Describe your camp in three words.",
			"What adventure do you wish for today?",
			"Write a message to your future trainer self.",
			"What would you name your dream team?",
			"What Pokémon would you want as a partner in real life?",
			"Describe the best Pokémon battle you've ever imagined.",
		];

		function load() {
			try { return JSON.parse(localStorage.getItem('pokequiz_postcards') || '[]'); }
			catch { return []; }
		}
		function save(cards) { localStorage.setItem('pokequiz_postcards', JSON.stringify(cards)); }

		function open() {
			let panel = document.getElementById('postcardPanel');
			if (!panel) {
				panel = document.createElement('div');
				panel.id = 'postcardPanel';
				document.body.appendChild(panel);
				panel.addEventListener('pointerdown', e => { if(e.target===panel) panel.hidden=true; });
			}
			panel.hidden = false;
			renderList(panel);
		}

		function renderList(panel) {
			const cards = load();
			panel.className = 'pk-backdrop';
			panel.innerHTML = '';
			const inner = document.createElement('div');
			inner.className = 'pk-modal';
			inner.innerHTML = '<div class="pk-modal-head">' +
				'<span class="pk-modal-title">' + ico(ICO.postcard) + ' POSTCARDS</span>' +
				'<button id="postcardClose" class="pk-close" type="button">' + ico(ICO.close) + '</button>' +
				'</div>';
			const body = document.createElement('div');
			body.className = 'pk-modal-body';

			const sub = document.createElement('div');
			sub.style.cssText = 'font-size:7px;color:var(--pk-muted);margin-bottom:12px';
			sub.textContent = cards.length + ' / ' + MAX_CARDS + ' postcards saved';
			body.appendChild(sub);

			if (cards.length > 0) {
				const list = document.createElement('div');
				list.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-bottom:12px';
				cards.forEach((card, i) => {
					const row = document.createElement('div');
					row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border:1px solid var(--pk-border);border-radius:var(--pk-radius-sm);background:rgba(255,255,255,0.03);cursor:pointer;gap:8px';
					const info = document.createElement('div');
					info.style.flex = '1';
					const date = document.createElement('div');
					date.style.cssText = 'font-size:7px;color:var(--pk-gold)';
					date.innerHTML = ico(ICO.mail) + ' ' + new Date(card.ts).toLocaleDateString();
					const preview = document.createElement('div');
					preview.style.cssText = 'font-size:7px;color:var(--pk-muted);margin-top:2px';
					preview.textContent = card.text.length > 40 ? card.text.slice(0,40)+'…' : card.text;
					info.appendChild(date);
					info.appendChild(preview);
					const del = document.createElement('button');
					del.className = 'pk-btn pk-btn-red pk-btn-xs';
					del.innerHTML = ico(ICO.trash);
					del.addEventListener('click', e => {
						e.stopPropagation();
						const c2 = load(); c2.splice(i,1); save(c2);
						renderList(panel);
					});
					info.addEventListener('click', () => renderRead(panel, card));
					row.appendChild(info);
					row.appendChild(del);
					list.appendChild(row);
				});
				body.appendChild(list);
			} else {
				const empty = document.createElement('div');
				empty.style.cssText = 'text-align:center;color:var(--pk-faint);font-size:8px;padding:18px 0';
				empty.textContent = 'No postcards yet. Write your first!';
				body.appendChild(empty);
			}

			if (cards.length < MAX_CARDS) {
				const writeBtn = document.createElement('button');
				writeBtn.className = 'pk-btn pk-btn-gold pk-btn-full pk-btn-sm';
				writeBtn.innerHTML = ico(ICO.write) + ' Write New Postcard';
				writeBtn.addEventListener('click', () => renderWrite(panel));
				body.appendChild(writeBtn);
			}

			inner.appendChild(body);
			panel.appendChild(inner);
			inner.addEventListener('pointerdown', e => e.stopPropagation());
			document.getElementById('postcardClose')?.addEventListener('click', () => { panel.hidden = true; });
		}

		function renderWrite(panel) {
			const prompt = PROMPTS[Math.floor(Date.now() / 86400000) % PROMPTS.length];
			panel.className = 'pk-backdrop';
			panel.innerHTML = '';
			const inner = document.createElement('div');
			inner.className = 'pk-modal pk-modal-sm';
			inner.innerHTML = '<div class="pk-modal-head">' +
				'<span class="pk-modal-title">' + ico(ICO.write) + ' WRITE</span>' +
				'<button id="postcardBack" class="pk-close" type="button">' + ico(ICO.back) + '</button>' +
				'</div>';
			const body = document.createElement('div');
			body.className = 'pk-modal-body';
			body.style.cssText = 'display:flex;flex-direction:column;gap:10px';

			const hint = document.createElement('div');
			hint.style.cssText = 'font-size:7px;color:var(--pk-gold);padding:8px;background:rgba(246,200,76,0.06);border-radius:6px';
			hint.innerHTML = ico(ICO.info) + ' ' + prompt;

			const ta = document.createElement('textarea');
			ta.style.cssText = 'width:100%;min-height:90px;background:rgba(255,255,255,0.05);border:1px solid var(--pk-border);border-radius:6px;color:var(--pk-text);font-family:inherit;font-size:8px;padding:8px;resize:none;box-sizing:border-box;line-height:1.7';
			ta.maxLength = 200;
			ta.placeholder = 'Write here… (max 200 chars)';

			const counter = document.createElement('div');
			counter.style.cssText = 'font-size:7px;color:var(--pk-faint);text-align:right';
			counter.textContent = '0 / 200';
			ta.addEventListener('input', () => { counter.textContent = ta.value.length + ' / 200'; });

			const saveBtn = document.createElement('button');
			saveBtn.className = 'pk-btn pk-btn-gold pk-btn-full pk-btn-sm';
			saveBtn.innerHTML = ico(ICO.send) + ' Send Postcard';
			saveBtn.addEventListener('click', () => {
				const text = ta.value.trim();
				if (!text) { showToast('Write something first!'); return; }
				const c2 = load();
				c2.unshift({ text, ts: Date.now(), prompt });
				if (c2.length > MAX_CARDS) c2.length = MAX_CARDS;
				save(c2);
				TrainerLevel.addXP('postcard');
				Achievements.unlock('postcard');
				showToast(ico(ICO.postcard) + ' Postcard saved!');
				renderList(panel);
			});

			body.appendChild(hint);
			body.appendChild(ta);
			body.appendChild(counter);
			body.appendChild(saveBtn);
			inner.appendChild(body);
			panel.appendChild(inner);
			inner.addEventListener('pointerdown', e => e.stopPropagation());
			document.getElementById('postcardBack')?.addEventListener('click', () => renderList(panel));
		}

		function renderRead(panel, card) {
			panel.className = 'pk-backdrop';
			panel.innerHTML = '';
			const inner = document.createElement('div');
			inner.className = 'pk-modal pk-modal-sm';
			inner.innerHTML = '<div class="pk-modal-head">' +
				'<span class="pk-modal-title">' + ico(ICO.readMail) + ' POSTCARD</span>' +
				'<button id="postcardBack3" class="pk-close" type="button">' + ico(ICO.back) + '</button>' +
				'</div>';
			const body = document.createElement('div');
			body.className = 'pk-modal-body';
			body.style.cssText = 'display:flex;flex-direction:column;gap:12px';

			const date = document.createElement('div');
			date.style.cssText = 'font-size:7px;color:var(--pk-muted)';
			date.innerHTML = ico('calendar3') + ' ' + new Date(card.ts).toLocaleDateString();

			if (card.prompt) {
				const pr = document.createElement('div');
				pr.style.cssText = 'font-size:7px;color:var(--pk-gold);font-style:italic';
				pr.textContent = '"' + card.prompt + '"';
				body.appendChild(date);
				body.appendChild(pr);
			} else {
				body.appendChild(date);
			}

			const text = document.createElement('div');
			text.style.cssText = 'font-size:9px;color:var(--pk-text);line-height:1.9;padding:12px;background:rgba(246,200,76,0.05);border:1px solid var(--pk-border);border-radius:8px';
			text.textContent = card.text;
			body.appendChild(text);
			inner.appendChild(body);
			panel.appendChild(inner);
			inner.addEventListener('pointerdown', e => e.stopPropagation());
			document.getElementById('postcardBack3')?.addEventListener('click', () => renderList(panel));
		}

		return { open };
	})();

	// ── Berry Composting ──────────────────────────────────────────────────────────
	const BerryCompost = (() => {
		const COST = 3;
		function canMake() { return (Inventory.load().friendshipBerries || 0) >= COST; }
		function hasCompost() { return (Inventory.load().boosts?.compost || 0) > 0; }

		function make() {
			if (!canMake()) { showToast('Need ' + COST + ' berries to compost!'); return; }
			const inv = Inventory.load();
			inv.friendshipBerries -= COST;
			if (!inv.boosts) inv.boosts = {};
			inv.boosts.compost = (inv.boosts.compost || 0) + 1;
			Inventory.save(inv);
			TrainerLevel.addXP('compost');
			Achievements.unlock('composted');
			showToast(ico(ICO.compost) + ' Compost made! Next planting grows 50% faster.');
		}

		function applyOnPlant(inv) {
			// Called when planting to consume a compost charge, boosting grow speed
			if ((inv.boosts?.compost || 0) > 0) {
				inv.boosts.compost -= 1;
				if (!inv.boosts) inv.boosts = {};
				// fast-grow for 30 minutes
				inv.boosts.fastGrow = Math.max(inv.boosts.fastGrow || 0, Date.now() + 30 * 60 * 1000);
				showToast(ico(ICO.compost) + ' Compost applied! Faster growth for 30 min.');
			}
		}

		function openPanel() {
			let panel = document.getElementById('compostPanel');
			if (!panel) {
				panel = document.createElement('div');
				panel.id = 'compostPanel';
				document.body.appendChild(panel);
				panel.addEventListener('pointerdown', e => { if(e.target===panel) panel.hidden=true; });
			}
			panel.hidden = false;
			render(panel);
		}

		function render(panel) {
			const inv = Inventory.load();
			const berries = inv.friendshipBerries || 0;
			const charges = inv.boosts?.compost || 0;
			panel.className = 'pk-backdrop';
			panel.innerHTML = '';
			const inner = document.createElement('div');
			inner.className = 'pk-modal pk-modal-sm';
			inner.innerHTML = '<div class="pk-modal-head">' +
				'<span class="pk-modal-title" style="color:#7ec860">' + ico(ICO.compost) + ' COMPOSTING</span>' +
				'<button id="compostClose" class="pk-close" style="color:#7ec860" type="button">' + ico(ICO.close) + '</button>' +
				'</div>';
			const body = document.createElement('div');
			body.className = 'pk-modal-body';
			body.style.cssText = 'display:flex;flex-direction:column;gap:12px';

			const info = document.createElement('div');
			info.style.cssText = 'font-size:8px;color:var(--pk-text);padding:10px;background:rgba(126,200,96,0.08);border:1px solid rgba(126,200,96,0.25);border-radius:8px';
			info.innerHTML = ico(ICO.berry) + ' Berries: <strong>' + berries + '</strong><span class="hud-sep"></span>' + ico(ICO.compost) + ' Compost charges: <strong>' + charges + '</strong>';

			const desc = document.createElement('div');
			desc.style.cssText = 'font-size:7px;color:var(--pk-muted);line-height:1.7';
			desc.textContent = 'Combine ' + COST + ' berries into compost. Compost is automatically used on your next planting, giving 50% faster growth for 30 minutes.';

			const btn = document.createElement('button');
			btn.className = 'pk-btn pk-btn-green pk-btn-full pk-btn-sm';
			btn.disabled = !canMake();
			btn.innerHTML = canMake() ? ico(ICO.compost) + ' Make Compost (' + COST + ' ' + ico(ICO.berry) + ' → 1 charge)' : 'Not enough berries (' + berries + '/' + COST + ')';
			btn.addEventListener('click', () => {
				make();
				render(panel);
			});

			body.appendChild(info);
			body.appendChild(desc);
			body.appendChild(btn);
			inner.appendChild(body);
			panel.appendChild(inner);
			inner.addEventListener('pointerdown', e => e.stopPropagation());
			document.getElementById('compostClose')?.addEventListener('click', () => { panel.hidden = true; });
		}

		return { canMake, hasCompost, make, applyOnPlant, openPanel };
	})();

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

	const DailyQuests = (() => {
		const QUESTS = [
			{ id: 'feed',     label: 'Feed partner 3×',      goal: 3,  reward: 10, icoKey: 'berry'  },
			{ id: 'harvest',  label: 'Harvest a berry',       goal: 1,  reward: 8,  icoKey: 'seed'   },
			{ id: 'market',   label: 'Visit the marketplace', goal: 1,  reward: 12, icoKey: 'cart'   },
			{ id: 'rhythm',   label: 'Win a rhythm battle',   goal: 1,  reward: 15, icoKey: 'music'  },
			{ id: 'fish',     label: 'Catch a fish',          goal: 1,  reward: 10, icoKey: 'fish'   },
			{ id: 'minigame', label: 'Win any wild battle',   goal: 1,  reward: 8,  icoKey: 'game'   },
		];
		function todayKey() { return new Date().toISOString().slice(0, 10); }
		function load() {
			const inv = Inventory.load();
			const today = todayKey();
			if (!inv.dailyQuests || inv.dailyQuests.date !== today) {
				inv.dailyQuests = { date: today, progress: {}, claimed: false };
				Inventory.save(inv);
			}
			return inv.dailyQuests;
		}
		function increment(id) {
			const inv = Inventory.load();
			const dq = load();
			dq.progress[id] = (dq.progress[id] || 0) + 1;
			inv.dailyQuests = dq;
			Inventory.save(inv);
			refresh();
			if (!dq.claimed && QUESTS.every(q => (dq.progress[q.id] || 0) >= q.goal)) {
				claimBonus();
			}
		}
		function claimBonus() {
			const inv = Inventory.load();
			const pp = typeof getPartnerPassive === 'function' ? getPartnerPassive() : { questRewardBonus: 0 };
			const totalReward = QUESTS.reduce((s, q) => s + q.reward, 0) + (pp.questRewardBonus || 0) * QUESTS.length;
			inv.tokens = (inv.tokens || 0) + totalReward;
			inv.dailyQuests.claimed = true;
			Inventory.save(inv);
			const bonusEl = document.getElementById('questBonus');
			if (bonusEl) bonusEl.innerHTML = ico(ICO.check) + ' All done! +' + totalReward + ' tokens claimed!';
			showToast(ico(ICO.check) + ' Daily quests done! +' + totalReward + ' tokens!');
			TrainerLevel.addXP('quest');
			Achievements.unlock('questStreak');
		}
		function refresh() {
			const panel = document.getElementById('questPanel');
			if (!panel || panel.hidden) return;
			const dq = load();
			const dateEl = document.getElementById('questDate');
			if (dateEl) dateEl.textContent = dq.date;
			const list = document.getElementById('questList');
			if (!list) return;
			list.innerHTML = '';
			QUESTS.forEach(q => {
				const prog = Math.min(q.goal, dq.progress[q.id] || 0);
				const done = prog >= q.goal;
				const row = document.createElement('div');
				row.className = 'pk-quest-row' + (done ? ' is-done' : '');
				const lbl = document.createElement('div');
				lbl.className = 'pk-quest-label' + (done ? ' is-done' : '');
				lbl.innerHTML = (done ? ico(ICO.check) + ' ' : (q.icoKey ? ico(ICO[q.icoKey] || q.icoKey) + ' ' : '')) + q.label;
				const prog_el = document.createElement('div');
				prog_el.className = 'pk-quest-prog';
				prog_el.innerHTML = prog + ' / ' + q.goal + ' &nbsp;· +' + q.reward + ' ' + ico(ICO.token);
				row.appendChild(lbl);
				row.appendChild(prog_el);
				list.appendChild(row);
			});
			const bonusEl = document.getElementById('questBonus');
			if (bonusEl && dq.claimed) bonusEl.innerHTML = ico(ICO.check) + ' All done! Rewards claimed.';
		}
		function open() {
			const panel = document.getElementById('questPanel');
			if (panel) { panel.hidden = false; refresh(); }
		}
		function close() {
			const panel = document.getElementById('questPanel');
			if (panel) panel.hidden = true;
		}
		function wire() {
			const btn = document.getElementById('questClose');
			if (btn && !btn.dataset.wired) { btn.dataset.wired = '1'; btn.addEventListener('click', close); }
		}
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
		else wire();
		return { open, close, increment, refresh };
	})();

	const WeatherSystem = {
		check(scene) {
			const now = Date.now();
			const seed = Math.floor(now / (4 * 3600 * 1000));
			const rng = ((seed * 1664525 + 1013904223) >>> 0) / 0xFFFFFFFF;
			const shouldRain = rng < 0.3;
			if (shouldRain && scene && scene.rainContainer && !scene._autoRainOn) {
				scene._autoRainOn = true;
				scene.isRaining = true;
			}
		},
	};

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

	function getPartnerPassive() {
		const form = (Inventory.load().eeveeForm) || 'eevee';
		return {
			fishingBonus:       form === 'vaporeon',
			rhythmTokenBonus:   form === 'flareon' ? 1 : 0,
			rhythmSpeedPenalty: form === 'jolteon' ? 0.85 : 1.0,
			growSpeedBonus:     form === 'leafeon' ? 0.3 : 0,
			questRewardBonus:   form === 'espeon' ? 3 : 0,
			dailyCooldownMult:  form === 'umbreon' ? 0.85 : 1.0,
		};
	}

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
				// NPC sprite sheets (PMD walk; row 0 frame 0 used as the static idle).
				this.load.spritesheet('npc-pikachu',   'Pictures/sprites/pikachu.png',   { frameWidth: 32, frameHeight: 40 });
				this.load.spritesheet('npc-bulbasaur', 'Pictures/sprites/bulbasaur.png', { frameWidth: 40, frameHeight: 40 });
				// Pre-load companion sprite if player has chosen one
				const _preInv = Inventory.load();
				if (_preInv.companionForm != null && _preInv.companionForm !== _preInv.eeveeForm) {
					const _pf = FOLLOWER_FORMS[_preInv.companionForm];
					if (_pf?.url) {
						this.load.spritesheet(_pf.sheet, _pf.url, { frameWidth: _pf.frameW, frameHeight: _pf.frameH });
					}
				}
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

				// scale; the player dot is overlaid every frame in updateMinimap().
				this.minimapEl = document.getElementById('campMinimap');
				if (this.minimapEl) {
					this.minimapEl.width = MAP_W * 3;
					this.minimapEl.height = MAP_H * 3;
					const mctx = this.minimapEl.getContext('2d');
					mctx.imageSmoothingEnabled = false;
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
				if (this.textures.exists(form.sheet)) { onReady(); return; }
				if (!form.url) { onReady(); return; }
				this.load.spritesheet(form.sheet, form.url, { frameWidth: form.frameW, frameHeight: form.frameH });
				this.load.once('complete', onReady);
				this.load.start();
			}

			_switchFollower(formKey) {
				const form = FOLLOWER_FORMS[formKey] || FOLLOWER_FORMS.eevee;
				const cols = form.cols;
				const rowFrames = (row) => Array.from({ length: cols }, (_, i) => row * cols + i);
				const animDefs = [
					[formKey + '-walk-south', rowFrames(0), 0],
					[formKey + '-walk-west',  rowFrames(6), 6 * cols],
					[formKey + '-walk-north', rowFrames(4), 4 * cols],
					[formKey + '-walk-east',  rowFrames(2), 2 * cols],
				];
				this._ensureFollowerSprite(form, () => {
					for (const [key, frames] of animDefs) {
						if (!this.anims.exists(key)) {
							this.anims.create({ key, frameRate: 10, repeat: -1,
								frames: this.anims.generateFrameNumbers(form.sheet, { frames }) });
						}
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
					// Persist companion choice
					const inv = Inventory.load();
					inv.companionForm = formKey;
					Inventory.save(inv);
					showToast(ico(ICO.npc) + ' ' + form.displayName + ' is walking with you!');
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
				if (!this.minimapEl) return;
				const mctx = this.minimapEl.getContext('2d');
				mctx.fillStyle = '#000';
				mctx.fillRect(0, 0, this.minimapEl.width, this.minimapEl.height);
				for (let r = 0; r < MAP_H; r++) {
					for (let c = 0; c < MAP_W; c++) {
						mctx.fillStyle = miniMapColor(this.map[r][c]);
						mctx.fillRect(c*3, r*3, 3, 3);
					}
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
				this.load.spritesheet('npc-pikachu',   'Pictures/sprites/pikachu.png',   { frameWidth: 32, frameHeight: 40 });
				this.load.spritesheet('npc-bulbasaur', 'Pictures/sprites/bulbasaur.png', { frameWidth: 40, frameHeight: 40 });
				this.load.spritesheet('npc-vaporeon',  'Pictures/sprites/vaporeon.png',  { frameWidth: 32, frameHeight: 48 });
				this.load.spritesheet('npc-umbreon',   'Pictures/sprites/umbreon.png',   { frameWidth: 32, frameHeight: 40 });
				this.load.spritesheet('npc-espeon',    'Pictures/sprites/espeon.png',    { frameWidth: 32, frameHeight: 48 });
				this.load.spritesheet('npc-jolteon',   'Pictures/sprites/jolteon.png',   { frameWidth: 32, frameHeight: 40 });
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
})();
