// camp-systems.js — self-contained UI systems extracted from camp.js
// Depends on camp-data.js (window.CAMP_DATA.ICO must be loaded first).
// Loaded with defer AFTER camp-data.js and BEFORE camp.js.
(function () {
	window.CAMP_SYSTEMS = window.CAMP_SYSTEMS || {};
	window.CAMP_SCENES  = window.CAMP_SCENES  || {};
	// Shared mutable state — readable/writable from both camp-systems.js and camp.js.
	// Using a single object avoids closure-scope issues when these two IIFEs run separately.
	window.__CAMP_STATE = window.__CAMP_STATE || {
		_bootData: { scene: 'camp', from: '' },
		_pauseToggleFn: null,
		_sceneKeyboard: null,
	};
	const __S = window.__CAMP_STATE; // short alias used throughout this file
	const ICO = (window.CAMP_DATA || {}).ICO || {};

	// ── Tile IDs ────────────────────────────────────────────────────────────────
	// These must be defined here (not just in camp.js) because buildMap, drawTile,
	// canWalkOn, and all four scene classes reference them and live in this file.
	const TG=0,TG2=1,TP=2,TW=3,TR=4,TR2=5,TWN=6,TD=7,TH2O=8,TTR=9,TFR=10,TFY=11,TSO=12,TCR=13,TFN=14,TRP=15,TIF=16,TIW=17,TRU=18,TST=19,TSG=20,TTR2=21,TBSH=22,TTG=23,TBED=24,TBKS=25,TBLD=26,TSA=27,TSA2=28,TSHO=29,TBWT=30,TPIER=31,TPALM=32,TROCKB=33,TSHL=34,TCVF=35,TCVW=36,TCVFS=37,TCVXT=38,TCVTR=39,TCVCH=40,TCVHK=41;
	const SOLID    = new Set([TW,TR,TR2,TRP,TWN,TH2O,TTR,TTR2,TFN,TIW,TSG,TBSH,TBED,TBKS,TBLD,TBWT,TPALM,TROCKB,TCVW]);
	const ANIMATED = new Set([TWN,TH2O,TCR]);

	// ── Scene constants ──────────────────────────────────────────────────────────
	const SPEED = 84; // px/sec — 1.4 px/frame at 60fps
	const PMD_CDN = 'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite/';
	const NICKNAME_KEY = 'pokequiz_partner_nickname';
	const SHINY_KEY    = 'pokequiz_partner_shiny';
	const SAVE_KEY     = 'pokequiz_last_save';

	// ── Interior map dimensions ──────────────────────────────────────────────────
	const HOUSE_W = 16, HOUSE_H = 12;
	const HOUSE_DOOR_C = 8, HOUSE_DOOR_R = HOUSE_H - 1;
	const HOUSE_STAIRS_C = 12, HOUSE_STAIRS_R = 3;
	const UPSTAIRS_W = 12, UPSTAIRS_H = 9;
	const UPSTAIRS_STAIRS_C = 2, UPSTAIRS_STAIRS_R = UPSTAIRS_H - 2;
	const MARKET_W = 50, MARKET_H = 28, MARKET_NORTH_C = 15;
	const BEACH_W = 32, BEACH_H = 22, BEACH_NORTH_C = 15;

	// ── CAMP_DATA pull-ins ────────────────────────────────────────────────────────
	// All of these are plain references to the already-populated CAMP_DATA objects,
	// so modifications made later (e.g. FOLLOWER_FORMS PMD loop in camp.js) remain
	// visible here because JS objects/arrays are passed by reference.
	const TILE             = (window.CAMP_DATA || {}).TILE;
	const MAP_W            = (window.CAMP_DATA || {}).MAP_W;
	const MAP_H            = (window.CAMP_DATA || {}).MAP_H;
	const FOLLOWER_FORMS   = (window.CAMP_DATA || {}).FOLLOWER_FORMS;
	const PMD_NAMES        = (window.CAMP_DATA || {}).PMD_NAMES;
	const GEN1_EVOLUTIONS  = (window.CAMP_DATA || {}).GEN1_EVOLUTIONS;
	const POKEMON_HEIGHTS  = (window.CAMP_DATA || {}).POKEMON_HEIGHTS;
	const PMD_FRAME_OVERRIDES = (window.CAMP_DATA || {}).PMD_FRAME_OVERRIDES;
	const WALLPAPER_BG     = (window.CAMP_DATA || {}).WALLPAPER_BG;
	const ACCENT_HEX       = (window.CAMP_DATA || {}).ACCENT_HEX;
	const DECOR_POS        = (window.CAMP_DATA || {}).DECOR_POS;
	const ROOM_ITEMS       = (window.CAMP_DATA || {}).ROOM_ITEMS;
	const HOUSE_ITEMS      = (window.CAMP_DATA || {}).HOUSE_ITEMS;
	const NPCS             = (window.CAMP_DATA || {}).NPCS;
	const BERRY_TYPES      = (window.CAMP_DATA || {}).BERRY_TYPES;
	const MARKET_NPCS      = (window.CAMP_DATA || {}).MARKET_NPCS;
	const NPC_SPRITE_SCALES = (window.CAMP_DATA || {}).NPC_SPRITE_SCALES || {};
	const SHINY_POOL       = (window.CAMP_DATA || {}).SHINY_POOL;
	const SPRITE_DEFS      = (window.CAMP_DATA || {}).SPRITE_DEFS;
	const SCALE_MULT       = (window.CAMP_DATA || {}).SCALE_MULT;
	const COSM_PRICE       = (window.CAMP_DATA || {}).COSM_PRICE;
	const SIGN_MESSAGES    = (window.CAMP_DATA || {}).SIGN_MESSAGES;
	const SIGN_MESSAGES_MARKET = (window.CAMP_DATA || {}).SIGN_MESSAGES_MARKET;
	const SIGN_MESSAGES_BEACH  = (window.CAMP_DATA || {}).SIGN_MESSAGES_BEACH;
	const FURNITURE_DESIGNS = (window.CAMP_DATA || {}).FURNITURE_DESIGNS;
	const PLANTS_KEY       = (window.CAMP_DATA || {}).PLANTS_KEY;
	const STATS_KEY        = (window.CAMP_DATA || {}).STATS_KEY;
	const INVENTORY_KEY    = (window.CAMP_DATA || {}).INVENTORY_KEY;
	const FRIENDSHIP_MAX   = (window.CAMP_DATA || {}).FRIENDSHIP_MAX;
	const DAILY_BONUS_KEY  = (window.CAMP_DATA || {}).DAILY_BONUS_KEY;
	const DAILY_BONUS_MS   = (window.CAMP_DATA || {}).DAILY_BONUS_MS;
	const GROW_MS          = (window.CAMP_DATA || {}).GROW_MS;
	const SEED_PRICE       = (window.CAMP_DATA || {}).SEED_PRICE;
	const BERRY_PRICE      = (window.CAMP_DATA || {}).BERRY_PRICE;
	const SCYTHE_PRICE     = (window.CAMP_DATA || {}).SCYTHE_PRICE;
	const SCYTHE_RADIUS    = (window.CAMP_DATA || {}).SCYTHE_RADIUS;
	const STONE_PRICE      = (window.CAMP_DATA || {}).STONE_PRICE;
	const FRIENDSHIP_PER_BERRY = (window.CAMP_DATA || {}).FRIENDSHIP_PER_BERRY;

	// ── PMD SpriteCollab — fill FOLLOWER_FORMS entries 1..151 ────────────────────
	// Runs here (not in camp.js) so all scene classes that reference FOLLOWER_FORMS
	// have the PMD entries available without relying on camp.js's load order.
	if (FOLLOWER_FORMS) {
		for (let _i = 1; _i <= 151; _i++) {
			// Apply any known frame-size overrides at construction time so the form
			// object always has correct dims even before the sprite image is loaded.
			// This prevents wrong portrait/picker rendering and avoids relying solely
			// on the runtime auto-detector to patch the form after load.
			const _initOv = PMD_FRAME_OVERRIDES && PMD_FRAME_OVERRIDES[_i];
			FOLLOWER_FORMS[_i] = {
				sheet: 'pmd-' + _i,
				url: PMD_CDN + String(_i).padStart(4, '0') + '/Walk-Anim.png',
				cols: _initOv ? _initOv.cols : 6,
				originY: 0.75,
				scale: 0.72,
				frameW: _initOv ? _initOv.frameW : 40,
				frameH: _initOv ? _initOv.frameH : 40,
				displayName: (PMD_NAMES || {})[_i],
				dex: _i,
			};
		}
	}

	// ── applyCampAccent ───────────────────────────────────────────────────────────
	// Applies the chosen accent colour as a CSS custom property on #campWrap.
	// Defined here (not only in camp.js) because scene classes call it directly.
	function applyCampAccent(accentKey) {
		const hex = (ACCENT_HEX || {})[accentKey] || (ACCENT_HEX || {})['default'] || '#f5a623';
		const wrap = document.getElementById('campWrap');
		if (wrap) wrap.style.setProperty('--camp-accent', hex);
	}
	window.CAMP_SYSTEMS.applyCampAccent = applyCampAccent;

	// ── Debug HUD ─────────────────────────────────────────────────────────────────
	// Defined here so scene classes (makeSceneClass etc.) can call Debug.render().
	// camp.js wires the backtick toggle key; the HUD element is shared.
	const Debug = {
		on: false,
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
	window.CAMP_SYSTEMS.Debug = Debug;

	// ── SHINY_HARD_QUESTIONS ──────────────────────────────────────────────────────
	// Static quiz questions used by ShinyEncounters. Pure data — no dependencies.
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

	// ── ico ─────────────────────────────────────────────────────────
		function ico(cls, extra) {
			return '<i class="bi bi-' + cls + (extra ? ' ' + extra : '') + '" aria-hidden="true"></i>';
		}
	window.CAMP_SYSTEMS.ico = ico;

	// ── Sound ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.Sound = Sound;

	// ── Dialog ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.Dialog = Dialog;

	// ── showToast ─────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.showToast = showToast;

	// ── Feature 2: Floating reward label ──────────────────────────────────
	function showFloatingReward(text, x, y) {
		const wrap = document.getElementById('campWrap');
		if (!wrap) return;
		const el = document.createElement('div');
		el.className = 'pk-floating-reward';
		el.textContent = text;
		if (typeof x === 'number' && typeof y === 'number') {
			const rect = wrap.getBoundingClientRect();
			el.style.left = (rect.left + x) + 'px';
			el.style.top  = (rect.top  + y) + 'px';
		} else {
			// Default: centre-bottom of campWrap
			const rect = wrap.getBoundingClientRect();
			el.style.left = (rect.left + rect.width / 2) + 'px';
			el.style.top  = (rect.top  + rect.height * 0.72) + 'px';
		}
		el.style.transform = 'translateX(-50%)';
		document.body.appendChild(el);
		setTimeout(() => el.remove(), 1300);
	}
	window.CAMP_SYSTEMS.showFloatingReward = showFloatingReward;

	// ── Feature 3: Achievement unlock banner ──────────────────────────────
	let _bannerTimeout = null;
	function showAchievementBanner(label) {
		const existing = document.querySelector('.pk-achievement-banner');
		if (existing) existing.remove();
		if (_bannerTimeout) clearTimeout(_bannerTimeout);
		const el = document.createElement('div');
		el.className = 'pk-achievement-banner';
		el.style.animation = 'pk-banner-in 0.3s ease forwards';
		el.innerHTML =
			'<div class="pk-achievement-banner-sub">&#x2736; Achievement Unlocked!</div>' +
			'<div class="pk-achievement-banner-label">' + label + '</div>';
		document.body.appendChild(el);
		_bannerTimeout = setTimeout(() => {
			el.style.animation = 'pk-banner-out 0.3s ease forwards';
			setTimeout(() => el.remove(), 320);
		}, 2800);
	}
	window.CAMP_SYSTEMS.showAchievementBanner = showAchievementBanner;

	// ── Achievements ────────────────────────────────────────────────────────
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
				{ id: 'secretFound',  label: 'Secret Seeker',    icoKey: 'sparkle', desc: 'Find the hidden treasure spot'      },
				{ id: 'caveExplorer',  label: 'Cave Explorer',       icoKey: 'map',     desc: 'Visit the cave 10 times'        },
				{ id: 'fossilHunter',  label: 'Fossil Hunter',        icoKey: 'gem',     desc: 'Dig 20 fossils total'           },
				{ id: 'lightBringer',  label: 'Let There Be Light',   icoKey: 'sparkle', desc: 'Explore with Flash HM equipped' },
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
				const def = DEFS.find(d => d.id === id);
				const label = def ? def.label : id;
				showToast(ico(ICO.achieve) + ' Achievement: ' + label);
				showAchievementBanner(label);
			}
			function increment(id) {
				const data = load();
				const key = '__count_' + id;
				data[key] = (data[key] || 0) + 1;
				if (id === 'rhythm100' && data[key] >= 10) unlock('rhythm100');
				if (id === 'berryFarmer' && data[key] >= 20) unlock('berryFarmer');
				if (id === 'caveExplorer' && data[key] >= 10) unlock('caveExplorer');
				if (id === 'fossilHunter' && data[key] >= 20) unlock('fossilHunter');
				save(data);
			}
			function getAll() { return { defs: DEFS, unlocked: load() }; }
			return { unlock, increment, getAll };
		})();
	window.CAMP_SYSTEMS.Achievements = Achievements;

	// ── PhotoMode ────────────────────────────────────────────────────────
		const PhotoMode = (() => {
			function take(scene) {
				const hideEls = document.querySelectorAll('.photo-mode-hide');
				hideEls.forEach(function(el) { el._pmDisplay = el.style.display; el.style.display = 'none'; });
				const overlay = document.createElement('div');
				overlay.id = '_photoCountdown';
				overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:80px;color:#fff;text-shadow:0 0 20px #000;z-index:9999;pointer-events:none;';
				document.body.appendChild(overlay);
				let count = 3;
				function tick() {
					if (count > 0) { overlay.textContent = String(count); count--; setTimeout(tick, 700); }
					else {
						overlay.textContent = '📷';
						setTimeout(function() {
							if (scene.game && scene.game.renderer) {
								scene.game.renderer.snapshot(function(img) {
									const link = document.createElement('a');
									link.href = img.src;
									link.download = 'pokequiz-camp-' + Date.now() + '.png';
									link.click();
									overlay.remove();
									hideEls.forEach(function(el) { el.style.display = el._pmDisplay || ''; });
									showToast('Photo saved! 📷');
								});
							} else {
								overlay.remove();
								hideEls.forEach(function(el) { el.style.display = el._pmDisplay || ''; });
							}
						}, 400);
					}
				}
				tick();
			}
			return { take };
		})();
	window.CAMP_SYSTEMS.PhotoMode = PhotoMode;

	// ── PokeEncyclopedia ────────────────────────────────────────────────────────
		const PokeEncyclopedia = (() => {
			function open(dexId, displayName) {
				const existing = document.getElementById('encyclopediaPanel');
				if (existing) { existing.remove(); return; }
				const panel = document.createElement('div');
				panel.id = 'encyclopediaPanel';
				panel.className = 'pk-backdrop';
				panel.style.zIndex = '150';
				const inner = document.createElement('div');
				inner.className = 'pk-modal';
				inner.style.cssText = 'max-width:400px;width:min(400px,94vw)';
				inner.innerHTML = '<div class="pk-modal-head">' +
					'<span class="pk-modal-title">' + ico(ICO.book) + ' ENCYCLOPEDIA</span>' +
					'<button class="pk-close" id="encyclopediaClose" type="button">' + ico(ICO.close) + '</button>' +
					'</div>' +
					'<div class="pk-modal-body" id="encyclopediaBody">' +
						'<div style="text-align:center;padding:24px;font-size:8px;color:var(--pk-muted)">Loading...</div>' +
					'</div>';
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.body.appendChild(panel);
				document.getElementById('encyclopediaClose').addEventListener('click', () => panel.remove());
				panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
	
				const cacheKey = 'pokequiz_pokeapi_' + dexId;
				const cached = (() => { try { const v = sessionStorage.getItem(cacheKey); return v ? JSON.parse(v) : null; } catch(e) { return null; } })();
				if (cached) { _render(dexId, displayName, cached.poke, cached.species, panel); return; }
	
				Promise.all([
					fetch('https://pokeapi.co/api/v2/pokemon/' + dexId).then(r => r.json()),
					fetch('https://pokeapi.co/api/v2/pokemon-species/' + dexId).then(r => r.json()),
				]).then(([poke, species]) => {
					try { sessionStorage.setItem(cacheKey, JSON.stringify({ poke, species })); } catch(_) {}
					if (document.getElementById('encyclopediaPanel')) _render(dexId, displayName, poke, species, panel);
				}).catch(() => {
					const body = document.getElementById('encyclopediaBody');
					if (body) body.innerHTML = '<div style="text-align:center;padding:16px;font-size:8px;color:var(--pk-red)">Failed to load data. Check your connection.</div>';
				});
			}
			function _render(dexId, displayName, poke, species, panel) {
				const body = document.getElementById('encyclopediaBody');
				if (!body) return;
				const sprite = poke.sprites?.other?.['official-artwork']?.front_default || poke.sprites?.front_default || '';
				const types = (poke.types || []).map(t => {
					const TYPE_COLORS = { fire:'#f08030',water:'#6890f0',grass:'#78c850',electric:'#f8d030',psychic:'#f85888',ice:'#98d8d8',dragon:'#7038f8',dark:'#705848',fairy:'#ee99ac',normal:'#a8a878',fighting:'#c03028',poison:'#a040a0',ground:'#e0c068',rock:'#b8a038',bug:'#a8b820',ghost:'#705898',steel:'#b8b8d0',flying:'#a890f0' };
					const c = TYPE_COLORS[t.type.name] || '#888';
					return '<span style="background:' + c + ';color:#fff;padding:2px 7px;border-radius:4px;font-size:7px;text-transform:capitalize">' + t.type.name + '</span>';
				}).join(' ');
				const stats = (poke.stats || []).map(s => {
					const n = s.base_stat;
					const pct = Math.round((n / 255) * 100);
					const col = n >= 100 ? '#50dd88' : n >= 60 ? '#f6c84c' : '#f06868';
					const STAT_LABELS = { hp:'HP', attack:'Atk', defense:'Def', 'special-attack':'SpAtk', 'special-defense':'SpDef', speed:'Speed' };
					const lbl = STAT_LABELS[s.stat.name] || s.stat.name;
					return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
						'<span style="font-size:6px;color:var(--pk-muted);width:38px;flex-shrink:0">' + lbl + '</span>' +
						'<div style="flex:1;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden">' +
							'<div style="width:' + pct + '%;height:100%;background:' + col + ';border-radius:3px"></div>' +
						'</div>' +
						'<span style="font-size:7px;color:#e8eaf0;width:22px;text-align:right">' + n + '</span>' +
					'</div>';
				}).join('');
				const flavor = ((species.flavor_text_entries || []).find(e => e.language.name === 'en')?.flavor_text || '').replace(/\f/g, ' ').replace(/\n/g, ' ');
				const h = ((poke.height || 0) / 10).toFixed(1) + ' m';
				const w = ((poke.weight || 0) / 10).toFixed(1) + ' kg';
				body.innerHTML =
					(sprite ? '<div style="text-align:center;margin-bottom:12px"><img src="' + sprite + '" alt="' + displayName + '" style="width:120px;height:120px;object-fit:contain;image-rendering:auto"></div>' : '') +
					'<div style="text-align:center;margin-bottom:8px">' +
						'<span style="font-size:10px;color:var(--pk-gold)">' + displayName + '</span> ' +
						'<span style="font-size:7px;color:var(--pk-muted)">#' + String(dexId).padStart(3,'0') + '</span>' +
					'</div>' +
					'<div style="text-align:center;margin-bottom:10px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">' + types + '</div>' +
					'<div style="display:flex;gap:16px;justify-content:center;margin-bottom:10px;font-size:7px;color:var(--pk-muted)">' +
						'<span>' + ico(ICO.level) + ' ' + h + '</span><span>' + ico(ICO.cart) + ' ' + w + '</span>' +
					'</div>' +
					'<div style="margin-bottom:10px">' + stats + '</div>' +
					(flavor ? '<div style="font-size:7px;color:var(--pk-muted);font-style:italic;line-height:1.6;border-top:1px solid rgba(255,255,255,0.08);padding-top:8px">' + flavor + '</div>' : '');
			}
			return { open };
		})();
	window.CAMP_SYSTEMS.PokeEncyclopedia = PokeEncyclopedia;

	// (SPRITE_DEFS, ROOM_ITEMS, HOUSE_ITEMS, FURNITURE_DESIGNS pulled at top of IIFE)


	// ── FurnitureSprites ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.FurnitureSprites = FurnitureSprites;

	// ── Music ────────────────────────────────────────────────────────
		const Music = (() => {
			const BASE = 'https://archive.org/download/pkmn-frlg-soundtrack/Disc%201/';
			const URLS = {
				camp:     BASE + '04%20-%20Pallet%20Town.mp3',
				house:    BASE + '16%20-%20Pok%C3%A9mon%20Center.mp3',
				upstairs: BASE + '12%20-%20Route%201.mp3',
				beach:    'https://archive.org/download/pkmn-frlg-soundtrack/Disc%201/23%20-%20Seafoam%20Islands.mp3',
			};
	
			let current = null;   // the active HTMLAudioElement
			let area    = null;
			let on      = false;
	
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
				try { localStorage.setItem('pokequiz_music_on_v2', on ? '1' : '0'); } catch {}
				if (!on) { stop(); return; }
			}
			function isEnabled() { return on; }
			try {
				const saved = localStorage.getItem('pokequiz_music_on_v2');
				if (saved === '1') on = true;
				else if (saved === '0') on = false;
				// if null (never set), keep the default (false)
			} catch {}
	
			return { start, stop, setEnabled, isEnabled };
		})();
	window.CAMP_SYSTEMS.Music = Music;

	// (PLANTS_KEY, STATS_KEY pulled at top of IIFE)


	// ── Plants ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.Plants = Plants;

	// ── Stats ────────────────────────────────────────────────────────
		const Stats = (() => {
			const DEFAULT = { totalCatches: 0, totalHarvests: 0, totalDaysPlayed: 0, loginStreak: 0, totalTokensEarned: 0 };
			function load() {
				try { const r = localStorage.getItem(STATS_KEY); return r ? Object.assign({}, DEFAULT, JSON.parse(r)) : Object.assign({}, DEFAULT); } catch { return Object.assign({}, DEFAULT); }
			}
			function save(s) { try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {} }
			function increment(field, by) { const s = load(); s[field] = (s[field] || 0) + (by || 1); save(s); }
			return { load, increment };
		})();
	window.CAMP_SYSTEMS.Stats = Stats;

	// ── TrainerLevel ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.TrainerLevel = TrainerLevel;

	// ── WeatherSystem ────────────────────────────────────────────────────────
		const WeatherSystem = {
			check(scene) {
				const now   = Date.now();
				const seed  = Math.floor(now / (4 * 3600 * 1000));
				const rng   = ((seed * 1664525 + 1013904223) >>> 0) / 0xFFFFFFFF;
				const month = new Date().getMonth(); // 0-11
				const isWinter = month === 11 || month === 0 || month === 1;
				// 30 % precipitation, 10 % fog; snow replaces rain in winter months
				let type = 'clear';
				if      (rng < 0.30) type = isWinter ? 'snow' : 'rain';
				else if (rng < 0.40) type = 'fog';
				if (type !== 'clear' && scene && !scene._autoWeatherOn) {
					scene._autoWeatherOn = true;
					scene.isRaining = (type === 'rain');
					scene.isSnowing = (type === 'snow');
					scene.isFoggy   = (type === 'fog');
				}
			},
			currentType(scene) {
				if (!scene) return 'clear';
				if (scene.isRaining) return 'rain';
				if (scene.isSnowing) return 'snow';
				if (scene.isFoggy)   return 'fog';
				return 'clear';
			},
			isActive(type) {
				const scene = window.__campScene;
				if (!scene) return false;
				if (type === 'rain') return !!scene.isRaining;
				if (type === 'snow') return !!scene.isSnowing;
				if (type === 'fog')  return !!scene.isFoggy;
				return false;
			},
		};
	window.CAMP_SYSTEMS.WeatherSystem = WeatherSystem;

	// ── Feature 5: Friendship bar above follower ─────────────────────────────
	function showFriendshipBar(scene, delta) {
		if (!scene || !scene.follower) return;
		// Destroy previous bar graphics
		if (scene._friendshipBar) {
			try { scene._friendshipBar.destroy(); } catch (_) {}
			scene._friendshipBar = null;
		}
		const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
		const friendship = Math.min(100, Math.max(0, inv.friendship || 0));
		const pct = friendship / 100;
		const BAR_W = 30, BAR_H = 4;
		const fx = scene.follower.x - BAR_W / 2;
		const fy = scene.follower.y - (scene.follower.displayHeight * scene.follower.originY) - 8;
		const gfx = scene.add.graphics().setDepth(8);
		// Background
		gfx.fillStyle(0x000000, 0.6);
		gfx.fillRect(fx, fy, BAR_W, BAR_H);
		// Fill — green → yellow → red based on friendship
		const fillColor = pct > 0.5 ? 0x40c870 : pct > 0.25 ? 0xf6c84c : 0xe04848;
		gfx.fillStyle(fillColor, 1);
		gfx.fillRect(fx, fy, Math.round(BAR_W * pct), BAR_H);
		scene._friendshipBar = gfx;
		// Fade out after 2 seconds
		scene.tweens.add({
			targets: gfx,
			alpha: 0,
			duration: 500,
			delay: 1500,
			onComplete: () => { try { gfx.destroy(); } catch (_) {} if (scene._friendshipBar === gfx) scene._friendshipBar = null; },
		});
	}
	window.CAMP_SYSTEMS.showFriendshipBar = showFriendshipBar;

	// ── PokemonOfDay ───────────────────────────────────────────────────────────
		const PokemonOfDay = (() => {
			function get() {
				const seed = Math.floor(Date.now() / 86400000); // changes daily
				return (seed % 151) + 1; // dex ID 1-151
			}
			function getName(id) {
				return (PMD_NAMES || {})[id] || ('Pokémon #' + id);
			}
			function checkBonus(scene) {
				const inv = Inventory.load();
				const todayId = get();
				const partnerId = inv.companionId || inv.companion;
				if (!partnerId || Number(partnerId) !== todayId) return;
				const key = 'pokequiz_potd_' + new Date().toISOString().slice(0,10);
				try {
					if (localStorage.getItem(key)) return;
					localStorage.setItem(key, '1');
					inv.friendship = Math.min(FRIENDSHIP_MAX, (inv.friendship||0) + 10);
					Inventory.save(inv);
					showToast('⭐ Your partner is today\'s featured Pokémon! +10 friendship!');
				} catch {}
			}
			return { get, getName, checkBonus };
		})();
	window.CAMP_SYSTEMS.PokemonOfDay = PokemonOfDay;

	// ── AccessibilitySettings ─────────────────────────────────────────────────
		const AccessibilitySettings = (() => {
			const KEY = 'pokequiz_a11y';
			const DEFAULTS = { highContrast: false, reduceMotion: false };
			function load() {
				try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || '{}')); }
				catch { return { ...DEFAULTS }; }
			}
			function save(cfg) { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch {} }
			function apply(cfg) {
				document.body.classList.toggle('pk-high-contrast', !!cfg.highContrast);
				document.body.classList.toggle('pk-reduce-motion', !!cfg.reduceMotion);
			}
			function toggle(key) {
				const cfg = load();
				cfg[key] = !cfg[key];
				save(cfg);
				apply(cfg);
				return cfg[key];
			}
			// Apply saved settings immediately on script load.
			apply(load());
			return { load, save, apply, toggle };
		})();
	window.CAMP_SYSTEMS.AccessibilitySettings = AccessibilitySettings;

	// ── PartnerMood ────────────────────────────────────────────────────────
		const PartnerMood = (() => {
			function get(inv) {
				const today = new Date().toISOString().slice(0,10);
				if (inv.lastShinyToday === today || inv.lastPerfectQuizDate === today) return 'excited';
				const now = Date.now();
				const fedRecently = inv.lastBerryFed && (now - inv.lastBerryFed) < 2 * 3600000;
				const quizToday = inv.lastQuizPlayed === today;
				const bonusToday = (() => { try { return localStorage.getItem('pokequiz_camp_daily') === today; } catch(e) { return false; } })();
				if (fedRecently || quizToday || bonusToday) return 'happy';
				const noVisit24h = !inv.lastLogin || (now - inv.lastLogin) > 24 * 3600000;
				if (noVisit24h) return 'tired';
				return 'neutral';
			}
			function emoji(mood) {
				if (mood === 'excited') return '🤩';
				if (mood === 'happy') return '😊';
				if (mood === 'tired') return '😴';
				return '😐';
			}
			function tokenMultiplier(mood) {
				return (mood === 'happy' || mood === 'excited') ? 1.1 : 1.0;
			}
			return { get, emoji, tokenMultiplier };
		})();
	window.CAMP_SYSTEMS.PartnerMood = PartnerMood;

	// ── PostcardSystem ────────────────────────────────────────────────────────
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

				// Share button — encodes postcard into a URL for clipboard copy
				const shareBtn = document.createElement('button');
				shareBtn.className = 'pk-btn pk-btn-ghost pk-btn-sm pk-btn-full';
				shareBtn.style.marginTop = '4px';
				shareBtn.innerHTML = ico('share') + ' Share Link';
				shareBtn.addEventListener('click', () => {
					try {
						const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ text: card.text, prompt: card.prompt || '', ts: card.ts }))));
						const url = window.location.origin + window.location.pathname + '?postcard=' + payload;
						if (navigator.clipboard?.writeText) {
							navigator.clipboard.writeText(url).then(
								() => showToast(ico(ICO.postcard) + ' Share link copied!'),
								() => prompt('Copy this link:', url),
							);
						} else { prompt('Copy this link:', url); }
					} catch { showToast('Could not create share link.'); }
				});
				body.appendChild(shareBtn);

				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.getElementById('postcardBack3')?.addEventListener('click', () => renderList(panel));
			}

			// Detect ?postcard= param and show incoming postcard dialog
			function receiveFromURL() {
				try {
					const params = new URLSearchParams(window.location.search);
					const raw = params.get('postcard');
					if (!raw) return;
					history.replaceState(null, '', window.location.pathname + window.location.hash);
					const card = JSON.parse(decodeURIComponent(escape(atob(raw))));
					if (!card || typeof card.text !== 'string') return;
					let panel = document.getElementById('postcardPanel');
					if (!panel) {
						panel = document.createElement('div');
						panel.id = 'postcardPanel';
						document.body.appendChild(panel);
						panel.addEventListener('pointerdown', e => { if(e.target===panel) panel.hidden=true; });
					}
					panel.hidden = false;
					panel.className = 'pk-backdrop';
					panel.innerHTML = '';
					const inner = document.createElement('div');
					inner.className = 'pk-modal pk-modal-sm';
					inner.innerHTML = '<div class="pk-modal-head"><span class="pk-modal-title">' + ico(ICO.mail) + ' INCOMING POSTCARD</span>' +
						'<button id="pcRecvClose" class="pk-close" type="button">' + ico(ICO.close) + '</button></div>';
					const body = document.createElement('div');
					body.className = 'pk-modal-body';
					body.style.cssText = 'display:flex;flex-direction:column;gap:12px';
					if (card.prompt) {
						const pr = document.createElement('div');
						pr.style.cssText = 'font-size:7px;color:var(--pk-gold);font-style:italic';
						pr.textContent = '"' + card.prompt + '"';
						body.appendChild(pr);
					}
					const txt = document.createElement('div');
					txt.style.cssText = 'font-size:9px;color:var(--pk-text);line-height:1.9;padding:12px;background:rgba(246,200,76,0.05);border:1px solid var(--pk-border);border-radius:8px';
					txt.textContent = card.text;
					body.appendChild(txt);
					const saveBtn = document.createElement('button');
					saveBtn.className = 'pk-btn pk-btn-gold pk-btn-full pk-btn-sm';
					saveBtn.innerHTML = ico(ICO.send) + ' Save to my Postcards';
					saveBtn.addEventListener('click', () => {
						const existing = load();
						existing.unshift({ text: card.text, prompt: card.prompt || '', ts: card.ts || Date.now(), received: true });
						if (existing.length > MAX_CARDS) existing.length = MAX_CARDS;
						save(existing);
						showToast(ico(ICO.postcard) + ' Postcard saved!');
						panel.hidden = true;
					});
					body.appendChild(saveBtn);
					inner.appendChild(body);
					panel.appendChild(inner);
					inner.addEventListener('pointerdown', e => e.stopPropagation());
					document.getElementById('pcRecvClose')?.addEventListener('click', () => { panel.hidden = true; });
				} catch {}
			}

			return { open, receiveFromURL };
		})();
	window.CAMP_SYSTEMS.PostcardSystem = PostcardSystem;

	// ── TouchActions ────────────────────────────────────────────────────────
		const TouchActions = (() => {
			const f = {};
			return {
				fire(action)    { f[action] = true; },
				consume(action) { const v = !!f[action]; f[action] = false; return v; },
			};
		})();
	window.CAMP_SYSTEMS.TouchActions = TouchActions;

	// (INVENTORY_KEY, FRIENDSHIP_MAX, DAILY_BONUS_KEY, DAILY_BONUS_MS pulled at top of IIFE)


	// ── getEffectiveGrowMs ────────────────────────────────────────────────
		function getEffectiveGrowMs() {
			const inv = Inventory.load();
			let ms = GROW_MS;
			// Herbal Tea fast-grow boost: 80% faster (10% of normal time)
			if (inv.boosts && inv.boosts.fastGrow > Date.now()) ms = Math.floor(ms * 0.1);
			// Furniture grow speed bonus: 20% faster
			const fb = getFurnitureBonuses ? getFurnitureBonuses() : { growSpeedBonus: 0 };
			if (fb.growSpeedBonus > 0) ms = Math.floor(ms * (1 - fb.growSpeedBonus));
			// Partner passive: Leafeon gives +30% grow speed; Growth Boost tutor skill gives +50%
			const pp = typeof getPartnerPassive === 'function' ? getPartnerPassive() : { growSpeedBonus: 0, tutorGrowBonus: 0 };
			if (pp.growSpeedBonus > 0) ms = Math.floor(ms * (1 - pp.growSpeedBonus));
			if ((pp.tutorGrowBonus || 0) > 0) ms = Math.floor(ms * (1 - pp.tutorGrowBonus));
			return Math.max(1000, ms);
		}
	window.CAMP_SYSTEMS.getEffectiveGrowMs = getEffectiveGrowMs;

	// ── Inventory ────────────────────────────────────────────────────────
		const Inventory = (() => {
			const DEFAULT = {
				seeds: 3, friendshipBerries: 0, tokens: 0, friendship: 0,
				eeveeForm: 'eevee', stone: null,
				hasScythe: false, scytheEquipped: false,
				seashells: 0,
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
	window.CAMP_SYSTEMS.Inventory = Inventory;

	// ── Daily ────────────────────────────────────────────────────────
		const Daily = (() => {
			function lastClaim() {
				try { return Number(localStorage.getItem(DAILY_BONUS_KEY) || 0); } catch { return 0; }
			}
			function ready() { return (Date.now() - lastClaim()) >= DAILY_BONUS_MS; }
			function claim() {
				const inv = Inventory.load();
				const prevClaim = lastClaim();
				try { localStorage.setItem(DAILY_BONUS_KEY, String(Date.now())); } catch {}
				// Update stats: streak continues if last claim was within 48h.
				const s = Stats.load();
				const hoursSince = prevClaim ? (Date.now() - prevClaim) / 3600000 : 999;
				s.loginStreak = (prevClaim && hoursSince < 48) ? (s.loginStreak || 0) + 1 : 1;
				s.totalDaysPlayed = (s.totalDaysPlayed || 0) + 1;
				Stats.save(s);
				const streak = s.loginStreak;
				// Base daily reward
				let bonusTokens = 20, bonusSeeds = 1, bonusBerries = 0;
				// Escalating streak milestones
				if (streak === 3)  { bonusTokens += 15; showToast('🔥 3-day streak! +15 bonus ' + ico(ICO.token)); }
				if (streak === 7)  { bonusTokens += 50; bonusSeeds += 3; showToast('🔥 7-day streak! +50 ' + ico(ICO.token) + ' +3 seeds!'); }
				if (streak === 14) { bonusTokens += 100; bonusBerries += 3; showToast('🔥 14-day streak! +100 ' + ico(ICO.token) + ' +3 berries!'); }
				if (streak === 30) { bonusTokens += 200; bonusBerries += 5; bonusSeeds += 5; showToast('🔥 30-day streak! Legendary bonus!'); }
				if (streak > 30 && streak % 30 === 0) { bonusTokens += 200; showToast('🔥 ' + streak + '-day streak! Keep going!'); }
				inv.tokens = (inv.tokens || 0) + bonusTokens;
				inv.seeds  = (inv.seeds  || 0) + bonusSeeds;
				if (bonusBerries) inv.friendshipBerries = (inv.friendshipBerries || 0) + bonusBerries;
				s.totalTokensEarned = (s.totalTokensEarned || 0) + bonusTokens;
				Stats.save(s);
				Inventory.save(inv);
			}
			function hoursLeft() {
				const ms = DAILY_BONUS_MS - (Date.now() - lastClaim());
				return Math.max(0, Math.ceil(ms / (60 * 60 * 1000)));
			}
			return { ready, claim, hoursLeft };
		})();
	window.CAMP_SYSTEMS.Daily = Daily;

	// ── Pokedex ────────────────────────────────────────────────────────
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
				// Always push — duplicates allowed so you can own multiple of the same species.
				d.caught.push(id);
				saveData(d);
				// Milestones are based on unique species count, not total instances.
				checkMilestones(new Set(d.caught).size);
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
				const uniqueSpecies = new Set(data.caught).size;
				const totalOwned   = data.caught.length;
				counter.textContent = uniqueSpecies + ' / 151' + (totalOwned > uniqueSpecies ? '  (' + totalOwned + ' total)' : '');
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
			// Returns the raw caught array (may contain duplicate dex IDs — one per owned instance).
			function getCaught() { return loadData().caught; }
			return { markSeen, markCaught, isCaught, getCaught, open };
		})();
	window.CAMP_SYSTEMS.Pokedex = Pokedex;

	// ── CurryCooking ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.CurryCooking = CurryCooking;

	// ── Amie ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.Amie = Amie;

	// ── RoomEditor ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.RoomEditor = RoomEditor;

	// ── BerryBreeding ────────────────────────────────────────────────────────
		const BerryBreeding = (() => {
			const BREED_RECIPES = {
				'pecha+pecha':  { name: 'Gold Pecha',  friendship: 30, effect: 'rhythm-boost-5min',  cost: 2, icon: '🍬', key: 'goldPecha'  },
				'oran+oran':    { name: 'Gold Oran',   friendship: 50, effect: null,                  cost: 2, icon: '🫐', key: 'goldOran'   },
				'sitrus+sitrus':{ name: 'Gold Sitrus', friendship: 70, effect: 'fast-grow-20min',     cost: 2, icon: '🍋', key: 'goldSitrus' },
				'pecha+oran':   { name: 'Mago Berry',  friendship: 35, effect: null,                  cost: 1, icon: '🍑', key: 'magoBerry'  },
				'oran+sitrus':  { name: 'Lum Berry',   friendship: 45, effect: 'fast-grow-10min',     cost: 1, icon: '🍈', key: 'lumBerry'   },
				'pecha+sitrus': { name: 'Salac Berry', friendship: 40, effect: 'rhythm-boost-10min',  cost: 1, icon: '🍓', key: 'salacBerry' },
			};
			const BERRY_LABELS = { pecha: 'Pecha', oran: 'Oran', sitrus: 'Sitrus' };
			const BERRY_KEYS = ['pecha', 'oran', 'sitrus'];
	
			function getBerryCount(inv, type) {
				if (type === 'pecha') return inv.friendshipBerries || 0;
				if (type === 'oran') return inv.oranBerries || 0;
				if (type === 'sitrus') return inv.sitrusBerries || 0;
				return 0;
			}
			function deductBerry(inv, type, amount) {
				if (type === 'pecha') inv.friendshipBerries = Math.max(0, (inv.friendshipBerries || 0) - amount);
				else if (type === 'oran') inv.oranBerries = Math.max(0, (inv.oranBerries || 0) - amount);
				else if (type === 'sitrus') inv.sitrusBerries = Math.max(0, (inv.sitrusBerries || 0) - amount);
			}
	
			function open() {
				const existing = document.getElementById('berryBreedPanel');
				if (existing) { existing.remove(); return; }
				const panel = document.createElement('div');
				panel.id = 'berryBreedPanel';
				panel.className = 'pk-backdrop';
				panel.style.zIndex = '130';
				const inner = document.createElement('div');
				inner.className = 'pk-modal';
				inner.style.cssText = 'max-width:380px;width:min(380px,94vw)';
	
				function buildPanel() {
					const inv = Inventory.load();
					const gb = inv.goldBerries || {};
					let leftSel = 'pecha', rightSel = 'pecha';
	
					function getRecipe(l, r) {
						return BREED_RECIPES[l + '+' + r] || BREED_RECIPES[r + '+' + l] || null;
					}
	
					function renderHTML() {
						const recipe = getRecipe(leftSel, rightSel);
						const inv2 = Inventory.load();
						const lCount = getBerryCount(inv2, leftSel);
						const rCount = getBerryCount(inv2, rightSel);
						let canBrew = false;
						let previewHTML = '<div style="font-size:8px;color:var(--pk-muted);padding:8px 0">No recipe for this combination.</div>';
						if (recipe) {
							const needLeft = leftSel === rightSel ? recipe.cost : 1;
							const needRight = leftSel === rightSel ? 0 : 1;
							canBrew = lCount >= needLeft && (leftSel === rightSel || rCount >= needRight);
							const effectLabel = recipe.effect ? ('<br><span style="font-size:6px;color:#88ccff">' + recipe.effect.replace(/-/g,' ') + '</span>') : '';
							previewHTML = '<div style="text-align:center;padding:6px 0">' +
								'<div style="font-size:20px;margin-bottom:4px">' + recipe.icon + '</div>' +
								'<div style="font-size:8px;color:var(--pk-gold)">' + recipe.name + '</div>' +
								'<div style="font-size:7px;color:#50dd88">+' + recipe.friendship + ' friendship' + effectLabel + '</div>' +
								'<div style="font-size:6px;color:var(--pk-muted);margin-top:2px">Cost: ' + needLeft + ' ' + BERRY_LABELS[leftSel] + (leftSel !== rightSel ? ' + 1 ' + BERRY_LABELS[rightSel] : '') + '</div>' +
							'</div>';
						}
						const storedHTML = Object.keys(gb).length > 0
							? '<div style="margin-top:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:8px"><div style="font-size:7px;color:var(--pk-muted);margin-bottom:4px">Stored Gold Berries:</div>' +
								Object.entries(gb).filter(([,v]) => v > 0).map(([k,v]) => {
									const rec = Object.values(BREED_RECIPES).find(r => r.key === k);
									return '<div style="display:flex;align-items:center;gap:6px;padding:3px 0">' +
										'<span style="font-size:12px">' + (rec?.icon || '🍓') + '</span>' +
										'<span style="font-size:7px;color:#e8eaf0">' + (rec?.name || k) + ' ×' + v + '</span>' +
										'<button class="pk-btn pk-btn-gold pk-btn-sm" data-use-berry="' + k + '" style="margin-left:auto" type="button">Use</button>' +
									'</div>';
								}).join('') + '</div>'
							: '';
						return '<div class="pk-modal-head">' +
							'<span class="pk-modal-title">🌿 BERRY LAB</span>' +
							'<button class="pk-close" id="berryBreedClose" type="button">' + ico(ICO.close) + '</button>' +
							'</div>' +
							'<div class="pk-modal-body">' +
								'<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:10px">' +
									'<div>' +
										'<div style="font-size:7px;color:var(--pk-muted);margin-bottom:4px">Left Berry</div>' +
										'<select id="breedLeft" style="width:100%;padding:4px;background:#1a2848;color:#e8eaf0;border:1px solid rgba(246,200,76,0.3);border-radius:6px;font-size:7px">' +
											BERRY_KEYS.map(b => '<option value="' + b + '"' + (b === leftSel ? ' selected' : '') + '>' + BERRY_LABELS[b] + ' (×' + getBerryCount(inv2, b) + ')</option>').join('') +
										'</select>' +
									'</div>' +
									'<div style="font-size:16px;color:var(--pk-muted)">+</div>' +
									'<div>' +
										'<div style="font-size:7px;color:var(--pk-muted);margin-bottom:4px">Right Berry</div>' +
										'<select id="breedRight" style="width:100%;padding:4px;background:#1a2848;color:#e8eaf0;border:1px solid rgba(246,200,76,0.3);border-radius:6px;font-size:7px">' +
											BERRY_KEYS.map(b => '<option value="' + b + '"' + (b === rightSel ? ' selected' : '') + '>' + BERRY_LABELS[b] + ' (×' + getBerryCount(inv2, b) + ')</option>').join('') +
										'</select>' +
									'</div>' +
								'</div>' +
								'<div id="breedPreview" style="background:rgba(0,0,0,0.2);border-radius:8px;padding:6px;margin-bottom:10px">' + previewHTML + '</div>' +
								'<button id="breedBtn" class="pk-btn pk-btn-gold pk-btn-full"' + (canBrew ? '' : ' disabled') + ' type="button">🧪 Brew!</button>' +
								storedHTML +
							'</div>';
					}
	
					inner.innerHTML = renderHTML();
					inner.addEventListener('pointerdown', e => e.stopPropagation());
					document.getElementById('berryBreedClose')?.addEventListener('click', () => panel.remove());
	
					function rewire() {
						const lEl = document.getElementById('breedLeft');
						const rEl = document.getElementById('breedRight');
						const brewBtn = document.getElementById('breedBtn');
						if (lEl) lEl.addEventListener('change', () => { leftSel = lEl.value; inner.innerHTML = renderHTML(); rewire(); });
						if (rEl) rEl.addEventListener('change', () => { rightSel = rEl.value; inner.innerHTML = renderHTML(); rewire(); });
						if (brewBtn) brewBtn.addEventListener('click', () => {
							const recipe = getRecipe(leftSel, rightSel);
							if (!recipe) return;
							const inv3 = Inventory.load();
							const needLeft = leftSel === rightSel ? recipe.cost : 1;
							if (getBerryCount(inv3, leftSel) < needLeft) { showToast('Not enough ' + BERRY_LABELS[leftSel] + '!'); return; }
							if (leftSel !== rightSel && getBerryCount(inv3, rightSel) < 1) { showToast('Not enough ' + BERRY_LABELS[rightSel] + '!'); return; }
							deductBerry(inv3, leftSel, needLeft);
							if (leftSel !== rightSel) deductBerry(inv3, rightSel, 1);
							if (!inv3.goldBerries) inv3.goldBerries = {};
							inv3.goldBerries[recipe.key] = (inv3.goldBerries[recipe.key] || 0) + 1;
							Inventory.save(inv3);
							showToast(recipe.icon + ' Brewed ' + recipe.name + '!');
							inner.innerHTML = renderHTML();
							rewire();
						});
						inner.querySelectorAll('[data-use-berry]').forEach(btn2 => {
							btn2.addEventListener('click', () => {
								const bkey = btn2.dataset.useBerry;
								const rec2 = Object.values(BREED_RECIPES).find(r => r.key === bkey);
								if (!rec2) return;
								const inv4 = Inventory.load();
								if (!inv4.goldBerries || !(inv4.goldBerries[bkey] > 0)) { showToast('None left!'); return; }
								inv4.goldBerries[bkey] -= 1;
								inv4.friendship = Math.min(FRIENDSHIP_MAX, (inv4.friendship || 0) + rec2.friendship);
								if (!inv4.boosts) inv4.boosts = {};
								if (rec2.effect === 'rhythm-boost-5min') inv4.boosts.rhythmBoost = Math.max(inv4.boosts.rhythmBoost || 0, Date.now() + 5*60*1000);
								else if (rec2.effect === 'rhythm-boost-10min') inv4.boosts.rhythmBoost = Math.max(inv4.boosts.rhythmBoost || 0, Date.now() + 10*60*1000);
								else if (rec2.effect === 'fast-grow-10min') inv4.boosts.fastGrow = Math.max(inv4.boosts.fastGrow || 0, Date.now() + 10*60*1000);
								else if (rec2.effect === 'fast-grow-20min') inv4.boosts.fastGrow = Math.max(inv4.boosts.fastGrow || 0, Date.now() + 20*60*1000);
								Inventory.save(inv4);
								showToast(rec2.icon + ' Used ' + rec2.name + '! +' + rec2.friendship + ' friendship');
								inner.innerHTML = renderHTML();
								rewire();
							});
						});
						document.getElementById('berryBreedClose')?.addEventListener('click', () => panel.remove());
					}
					rewire();
				}
	
				panel.appendChild(inner);
				document.body.appendChild(panel);
				panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
				buildPanel();
			}
			return { open };
		})();
	window.CAMP_SYSTEMS.BerryBreeding = BerryBreeding;

	// ── NotifBell ────────────────────────────────────────────────────────
		const NotifBell = (() => {
			function check() {
				const msgs = [];
				const inv = Inventory.load();
				// 1. Ripe berries
				try {
					const plantsRaw = localStorage.getItem('pokequiz_camp_plants');
					if (plantsRaw) {
						const _plants = JSON.parse(plantsRaw);
						const effMs = typeof getEffectiveGrowMs === 'function' ? getEffectiveGrowMs() : 30000;
						const ripe = _plants.filter(p => p && (Date.now() - (p.plantedAt||0)) >= effMs);
						if (ripe.length > 0) msgs.push(ico(ICO.berry) + ' ' + ripe.length + ' ripe berr' + (ripe.length === 1 ? 'y' : 'ies') + ' ready!');
					}
				} catch(_) {}
				// 2. Daily quests incomplete
				try {
					const dq = inv.dailyQuests;
					const today = new Date().toISOString().slice(0,10);
					if (!dq || dq.date !== today || !dq.claimed) {
						const QUEST_IDS = ['feed','harvest','market','rhythm','fish','minigame'];
						const progress = (dq && dq.date === today) ? (dq.progress || {}) : {};
						const incomplete = QUEST_IDS.filter(id => (progress[id] || 0) < 1).length;
						if (incomplete > 0) msgs.push(ico(ICO.quest) + ' ' + incomplete + ' daily quest' + (incomplete === 1 ? '' : 's') + ' remaining');
					}
				} catch(_) {}
				// 3. Egg hatching >80%
				try {
					if (inv.egg && inv.egg.steps != null) {
						const pct = Math.min(100, Math.round((inv.egg.steps / 256) * 100));
						if (pct >= 80) msgs.push(ico(ICO.egg) + ' Egg almost ready! (' + pct + '%)');
					}
				} catch(_) {}
				// 4. Mystery gift available
				try {
					const today2 = new Date().toISOString().slice(0,10);
					const mgKey = 'pokequiz_mystery_gift_' + today2;
					if (!localStorage.getItem(mgKey)) msgs.push(ico(ICO.gift) + ' Mystery Gift available!');
				} catch(_) {}
				// 5. Daily bonus not claimed
				try {
					if (typeof Daily !== 'undefined' && Daily.ready()) msgs.push(ico(ICO.star) + ' Daily bonus ready!');
				} catch(_) {}
				return msgs;
			}
			function updateBadge() {
				const badge = document.getElementById('campNotifBadge');
				if (!badge) return;
				const msgs = check();
				if (msgs.length > 0) {
					badge.textContent = msgs.length;
					badge.hidden = false;
				} else {
					badge.hidden = true;
				}
			}
			function open() {
				const existing = document.getElementById('notifDropdown');
				if (existing) { existing.remove(); return; }
				const msgs = check();
				const btn = document.getElementById('campNotifBtn');
				const dropdown = document.createElement('div');
				dropdown.id = 'notifDropdown';
				dropdown.style.cssText = 'position:absolute;top:44px;right:8px;z-index:200;background:rgba(10,14,28,0.97);border:1px solid rgba(246,200,76,0.28);border-radius:8px;padding:8px 12px;min-width:220px;max-width:280px;box-shadow:0 8px 24px rgba(0,0,0,0.5)';
				if (msgs.length === 0) {
					dropdown.innerHTML = '<div style="font-size:7px;color:var(--pk-muted);padding:4px 0">No notifications right now!</div>';
				} else {
					dropdown.innerHTML = msgs.map(m => '<div style="font-size:7px;color:#e8eaf0;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.06)">' + m + '</div>').join('');
				}
				const campWrap = document.getElementById('campWrap') || document.body;
				campWrap.appendChild(dropdown);
				function dismiss(e) {
					if (!dropdown.contains(e.target) && e.target !== btn) {
						dropdown.remove();
						document.removeEventListener('click', dismiss, true);
					}
				}
				setTimeout(() => document.addEventListener('click', dismiss, true), 0);
			}
			function init() {
				const btn = document.getElementById('campNotifBtn');
				if (btn) btn.addEventListener('click', () => open());
				updateBadge();
				setInterval(updateBadge, 30000);
			}
			if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
			else init();
			return { check, updateBadge, open };
		})();
	window.CAMP_SYSTEMS.NotifBell = NotifBell;

	// ── PCBox ────────────────────────────────────────────────────────
		const PCBox = (() => {
			const PARTY_MAX = 6;
	
			// Resolve a display name from a form value (string eeveelution or numeric dex ID).
			function formName(form) {
				const EEV = {eevee:'Eevee',vaporeon:'Vaporeon',espeon:'Espeon',umbreon:'Umbreon',
					flareon:'Flareon',jolteon:'Jolteon',leafeon:'Leafeon',glaceon:'Glaceon',sylveon:'Sylveon'};
				if (typeof form === 'string') return EEV[form] || form;
				if (typeof form === 'number') return (typeof PMD_NAMES !== 'undefined' && PMD_NAMES[form]) || ('#' + form);
				return String(form);
			}
	
			// Initialise / migrate save data and return inventory.
			function load() {
				const inv = Inventory.load();
				// Migrate legacy pcBox → party + pcStorage
				if (inv.pcBox && !inv.party) {
					inv.party = inv.pcBox.slice();
					inv.partyActive = inv.pcBoxActive || 0;
					delete inv.pcBox;
					delete inv.pcBoxActive;
				}
				if (!inv.party) {
					inv.party = [{
						form: inv.eeveeForm || 'eevee',
						name: formName(inv.eeveeForm || 'eevee'),
						nickname: '',
						friendship: inv.friendship || 0,
						since: inv.partnerSince || Date.now(),
					}];
				}
				if (!inv.pcStorage) inv.pcStorage = [];
				if (inv.partyActive == null) inv.partyActive = 0;
				const filled = inv.party.filter(Boolean).length;
				if (inv.partyActive >= filled) inv.partyActive = Math.max(0, filled - 1);
				Inventory.save(inv);
				return inv;
			}
	
			function open() {
				const inv = load();
				let panel = document.getElementById('pcBoxPanel');
				if (!panel) {
					panel = document.createElement('div');
					panel.id = 'pcBoxPanel';
					document.body.appendChild(panel);
					panel.addEventListener('pointerdown', e => { if (e.target === panel) panel.hidden = true; });
				}
				panel.hidden = false;
				render(panel, inv);
			}
	
			function render(panel, inv) {
				const party      = inv.party || [];
				const pc         = inv.pcStorage || [];
				const activeIdx  = inv.partyActive || 0;
				panel.className  = 'pk-backdrop';
				panel.innerHTML  = '';
				const inner = document.createElement('div');
				inner.className  = 'pk-modal';
				inner.style.cssText = 'max-width:460px;width:min(460px,94vw)';
				inner.innerHTML  =
					'<div class="pk-modal-head">' +
					'<span class="pk-modal-title">' + ico(ICO.pc) + ' PARTY &amp; PC</span>' +
					'<button id="pcBoxClose" class="pk-close" type="button">' + ico(ICO.close) + '</button>' +
					'</div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
	
				// ── Party ──────────────────────────────────────────────
				const partyHead = document.createElement('div');
				partyHead.style.cssText = 'font-size:8px;color:var(--pk-gold);margin-bottom:8px;letter-spacing:1px';
				partyHead.innerHTML = ico(ICO.npc) + ' PARTY &nbsp;<span style="color:var(--pk-muted);font-size:7px">' +
					party.filter(Boolean).length + ' / ' + PARTY_MAX + '</span>';
				body.appendChild(partyHead);
	
				const partyGrid = document.createElement('div');
				partyGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:16px';
				for (let i = 0; i < PARTY_MAX; i++) {
					const slot = party[i];
					const card = document.createElement('div');
					card.className = 'pk-box-slot' + (slot && i === activeIdx ? ' is-active' : '');
					card.style.minHeight = '60px';
					if (slot) {
						const dn = formName(slot.form);
						const shown = slot.nickname || dn;
						const slotDex = typeof slot.form === 'number' ? slot.form : parseInt(String(slot.form).split(':')[0]);
						const nextEvo = GEN1_EVOLUTIONS && !isNaN(slotDex) ? GEN1_EVOLUTIONS[slotDex] : null;
						const nextEvoName = nextEvo ? formName(nextEvo) : null;
						const slotSpriteUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + slotDex + '.png';
						card.innerHTML =
							'<img src="' + slotSpriteUrl + '" style="width:40px;height:40px;image-rendering:pixelated;display:block;margin:0 auto 2px" alt="">' +
							'<div class="pk-box-slot-name">' + (i === activeIdx ? ico(ICO.star) + ' ' : '') + shown + '</div>' +
							'<div class="pk-box-slot-sub" style="font-size:6px;color:var(--pk-muted)">' +
								(slot.nickname ? dn + ' · ' : '') + '&#9829; ' + (slot.friendship || 0) +
							'</div>';
						if (i === activeIdx) {
							card.innerHTML += '<div style="font-size:7px;color:var(--pk-green);margin-top:4px">Walking partner</div>';
						} else {
							const btnRow = document.createElement('div');
							btnRow.style.cssText = 'display:flex;gap:4px;margin-top:6px;flex-wrap:wrap';
							const walkBtn = document.createElement('button');
							walkBtn.type = 'button'; walkBtn.className = 'pk-btn pk-btn-gold pk-btn-xs';
							walkBtn.textContent = 'Walk'; walkBtn.dataset.action = 'walk'; walkBtn.dataset.idx = i;
							btnRow.appendChild(walkBtn);
							if (party.filter(Boolean).length > 1) {
								const pcBtn = document.createElement('button');
								pcBtn.type = 'button'; pcBtn.className = 'pk-btn pk-btn-xs';
								pcBtn.style.cssText = 'background:rgba(255,255,255,0.06);color:var(--pk-muted)';
								pcBtn.textContent = '→ PC'; pcBtn.dataset.action = 'toPC'; pcBtn.dataset.idx = i;
								btnRow.appendChild(pcBtn);
							}
							card.appendChild(btnRow);
						}
						if (nextEvo) {
							const evoBtn = document.createElement('button');
							evoBtn.type = 'button'; evoBtn.className = 'pk-btn pk-btn-xs';
							evoBtn.style.cssText = 'background:linear-gradient(135deg,#7c4dff,#3d1fff);color:#fff;margin-top:4px;width:100%';
							evoBtn.innerHTML = ico(ICO.bolt) + ' Evolve → ' + nextEvoName;
							evoBtn.dataset.action = 'evolve'; evoBtn.dataset.idx = i; evoBtn.dataset.nextEvo = nextEvo;
							card.appendChild(evoBtn);
						}
					} else {
						card.innerHTML = '<div style="font-size:7px;color:var(--pk-faint);text-align:center;padding:16px 0">—</div>';
					}
					partyGrid.appendChild(card);
				}
				body.appendChild(partyGrid);
	
				// ── PC Storage ─────────────────────────────────────────
				const pcHead = document.createElement('div');
				pcHead.style.cssText = 'font-size:8px;color:var(--pk-muted);margin-bottom:8px;letter-spacing:1px;' +
					'border-top:1px solid var(--pk-border);padding-top:12px';
				pcHead.innerHTML = ico(ICO.pc) + ' PC STORAGE &nbsp;<span style="font-size:7px">(' + pc.length + ')</span>';
				body.appendChild(pcHead);
	
				if (!pc.length) {
					const emp = document.createElement('div');
					emp.style.cssText = 'font-size:7px;color:var(--pk-faint);text-align:center;padding:8px 0';
					emp.textContent = 'PC is empty';
					body.appendChild(emp);
				} else {
					const pcList = document.createElement('div');
					pcList.style.cssText = 'display:flex;flex-direction:column;gap:4px;max-height:180px;overflow-y:auto';
					pc.forEach((slot, pcIdx) => {
						if (!slot) return;
						const row = document.createElement('div');
						row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;' +
							'padding:6px 8px;border:1px solid var(--pk-border);border-radius:var(--pk-radius-sm);' +
							'background:rgba(255,255,255,0.02)';
						const dn = formName(slot.form);
						const pcDex = typeof slot.form === 'number' ? slot.form : parseInt(String(slot.form).split(':')[0]);
						const pcSpriteUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + pcDex + '.png';
						row.innerHTML =
							'<div style="display:flex;align-items:center;gap:6px">' +
							'<img src="' + pcSpriteUrl + '" style="width:32px;height:32px;image-rendering:pixelated;flex-shrink:0" alt="">' +
							'<div>' +
							'<div style="font-size:7px;color:var(--pk-text)">' + (slot.nickname || dn) +
								(slot.nickname ? ' <span style="color:var(--pk-faint);font-size:6px">(' + dn + ')</span>' : '') + '</div>' +
							'<div style="font-size:6px;color:var(--pk-muted)">&#9829; ' + (slot.friendship || 0) + '</div>' +
							'</div>' +
							'</div>';
						const partyFull = party.filter(Boolean).length >= PARTY_MAX;
						const btnWrap = document.createElement('div');
						btnWrap.style.cssText = 'display:flex;flex-direction:column;gap:3px;align-items:flex-end';
						const ab = document.createElement('button');
						ab.type = 'button'; ab.className = 'pk-btn pk-btn-gold pk-btn-xs';
						ab.textContent = partyFull ? '⇄ Swap' : '→ Party';
						ab.dataset.action = partyFull ? 'swap' : 'toParty';
						ab.dataset.pcIdx = pcIdx;
						btnWrap.appendChild(ab);
						const pcSlotDex = typeof slot.form === 'number' ? slot.form : parseInt(String(slot.form).split(':')[0]);
						const pcNextEvo = GEN1_EVOLUTIONS && !isNaN(pcSlotDex) ? GEN1_EVOLUTIONS[pcSlotDex] : null;
						if (pcNextEvo) {
							const evoBtn2 = document.createElement('button');
							evoBtn2.type = 'button'; evoBtn2.className = 'pk-btn pk-btn-xs';
							evoBtn2.style.cssText = 'background:linear-gradient(135deg,#7c4dff,#3d1fff);color:#fff;font-size:6px';
							evoBtn2.innerHTML = ico(ICO.bolt) + ' → ' + formName(pcNextEvo);
							evoBtn2.dataset.action = 'evolvePC'; evoBtn2.dataset.pcIdx = pcIdx; evoBtn2.dataset.nextEvo = pcNextEvo;
							btnWrap.appendChild(evoBtn2);
						}
						row.appendChild(btnWrap);
						pcList.appendChild(row);
					});
					body.appendChild(pcList);
				}
	
				// Wonder Trade
				const wt = document.createElement('button');
				wt.type = 'button'; wt.className = 'pk-btn pk-btn-blue pk-btn-full pk-btn-sm';
				wt.style.marginTop = '12px';
				wt.innerHTML = ico(ICO.trade) + ' Wonder Trade';
				wt.addEventListener('click', () => WonderTrade.open());
				body.appendChild(wt);
	
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.getElementById('pcBoxClose').addEventListener('click', () => {
					panel.hidden = true;
					window.__CAMP_STATE?._sceneKeyboard?.enableGlobalCapture();
				});
	
				// Party button delegation
				partyGrid.addEventListener('click', e => {
					const btn = e.target.closest('[data-action]');
					if (!btn) return;
					const inv2 = load();
					const action = btn.dataset.action;
					const idx = parseInt(btn.dataset.idx);
					if (action === 'walk') {
						const prev = inv2.party[inv2.partyActive || 0];
						if (prev) prev.friendship = inv2.friendship || 0;
						inv2.partyActive = idx;
						const ns = inv2.party[idx];
						if (ns) {
							inv2.companionForm = ns.form;
							inv2.eeveeForm = typeof ns.form === 'string' ? ns.form : (inv2.eeveeForm || 'eevee');
							inv2.friendship = ns.friendship || 0;
							inv2.partnerSince = ns.since || Date.now();
						}
						Inventory.save(inv2);
						window.__campScene?._switchFollower(ns?.form ?? 'eevee', { silent: true });
						showToast(ico(ICO.npc) + ' ' + (ns?.nickname || formName(ns?.form)) + ' is walking with you!');
					} else if (action === 'toPC') {
						if (inv2.party.filter(Boolean).length <= 1) { showToast('Cannot remove last party member!'); return; }
						const [moved] = inv2.party.splice(idx, 1);
						if ((inv2.partyActive || 0) >= idx && inv2.partyActive > 0) inv2.partyActive--;
						const active = inv2.party[inv2.partyActive || 0];
						if (active) {
							inv2.companionForm = active.form;
							inv2.eeveeForm = typeof active.form === 'string' ? active.form : (inv2.eeveeForm || 'eevee');
						}
						inv2.pcStorage = inv2.pcStorage || [];
						inv2.pcStorage.push(moved);
						Inventory.save(inv2);
						showToast(ico(ICO.pc) + ' ' + (moved?.nickname || formName(moved?.form)) + ' moved to PC.');
						if (idx === activeIdx) window.__campScene?._switchFollower(active?.form ?? 'eevee', { silent: true });
					} else if (action === 'evolve') {
						const nextEvo = parseInt(btn.dataset.nextEvo);
						const evoSlot = inv2.party[idx];
						if (!evoSlot || !nextEvo) return;
						const oldName = evoSlot.nickname || formName(evoSlot.form);
						const newName = formName(nextEvo);
						evoSlot.form = nextEvo;
						evoSlot.name = newName;
						// If this is the active walking partner, switch the follower sprite
						if (idx === (inv2.partyActive || 0)) {
							inv2.companionForm = nextEvo;
							Inventory.save(inv2);
							window.__campScene?._switchFollower(nextEvo, { silent: true });
						} else {
							Inventory.save(inv2);
						}
						Pokedex.markSeen(nextEvo);
						TrainerLevel.addXP('evolve');
						Achievements.unlock('firstEvol');
						showToast(ico(ICO.bolt) + ' ' + oldName + ' evolved into ' + newName + '!');
						// Flash animation
						const fl = document.createElement('div');
						fl.style.cssText = 'position:fixed;inset:0;z-index:9999;background:white;opacity:0;pointer-events:none;transition:opacity 0.15s';
						document.body.appendChild(fl);
						setTimeout(() => { fl.style.opacity = '0.8'; }, 30);
						setTimeout(() => { fl.style.opacity = '0'; }, 250);
						setTimeout(() => { fl.style.opacity = '0.4'; }, 450);
						setTimeout(() => { fl.style.opacity = '0'; }, 650);
						setTimeout(() => { if (fl.parentNode) fl.remove(); }, 1200);
					}
					render(panel, Inventory.load());
				});
	
				// PC button delegation
				body.addEventListener('click', e => {
					const btn = e.target.closest('[data-action][data-pc-idx]');
					if (!btn) return;
					const inv2 = load();
					const pcIdx2 = parseInt(btn.dataset.pcIdx);
					const action = btn.dataset.action;
					const pcSlot = (inv2.pcStorage || [])[pcIdx2];
					if (!pcSlot) return;
					if (action === 'toParty') {
						if ((inv2.party || []).filter(Boolean).length >= PARTY_MAX) { showToast('Party full! Swap first.'); return; }
						inv2.pcStorage.splice(pcIdx2, 1);
						inv2.party.push(pcSlot);
						Inventory.save(inv2);
						showToast(ico(ICO.npc) + ' ' + (pcSlot.nickname || formName(pcSlot.form)) + ' added to party!');
					} else if (action === 'swap') {
						const ai = inv2.partyActive || 0;
						const cur = inv2.party[ai];
						if (cur) cur.friendship = inv2.friendship || 0;
						inv2.pcStorage[pcIdx2] = cur;
						inv2.party[ai] = pcSlot;
						inv2.companionForm = pcSlot.form;
						inv2.eeveeForm = typeof pcSlot.form === 'string' ? pcSlot.form : (inv2.eeveeForm || 'eevee');
						inv2.friendship = pcSlot.friendship || 0;
						inv2.partnerSince = pcSlot.since || Date.now();
						Inventory.save(inv2);
						window.__campScene?._switchFollower(pcSlot.form, { silent: true });
						showToast(ico(ICO.trade) + ' ' + (pcSlot.nickname || formName(pcSlot.form)) + ' swapped into party!');
					} else if (action === 'evolvePC') {
						const nextEvoPc = parseInt(btn.dataset.nextEvo);
						if (!pcSlot || !nextEvoPc) return;
						const oldNamePc = pcSlot.nickname || formName(pcSlot.form);
						pcSlot.form = nextEvoPc;
						pcSlot.name = formName(nextEvoPc);
						Inventory.save(inv2);
						Pokedex.markSeen(nextEvoPc);
						TrainerLevel.addXP('evolve');
						Achievements.unlock('firstEvol');
						showToast(ico(ICO.bolt) + ' ' + oldNamePc + ' evolved into ' + formName(nextEvoPc) + '!');
						const fl2 = document.createElement('div');
						fl2.style.cssText = 'position:fixed;inset:0;z-index:9999;background:white;opacity:0;pointer-events:none;transition:opacity 0.15s';
						document.body.appendChild(fl2);
						setTimeout(() => { fl2.style.opacity = '0.8'; }, 30);
						setTimeout(() => { fl2.style.opacity = '0'; }, 250);
						setTimeout(() => { fl2.style.opacity = '0.4'; }, 450);
						setTimeout(() => { fl2.style.opacity = '0'; }, 650);
						setTimeout(() => { if (fl2.parentNode) fl2.remove(); }, 1200);
					}
					render(panel, Inventory.load());
				});
			}
	
			// Called after catching — routes to party (if room) or PC (overflow).
			function addToBox(pkmnData) {
				const inv = load();
				const party = inv.party || [];
				if (party.filter(Boolean).length < PARTY_MAX) {
					party.push(pkmnData);
					inv.party = party;
					Inventory.save(inv);
					showToast(ico(ICO.npc) + ' ' + (pkmnData.nickname || formName(pkmnData.form)) + ' joined your party!');
				} else {
					inv.pcStorage = inv.pcStorage || [];
					inv.pcStorage.push(pkmnData);
					Inventory.save(inv);
					showToast(ico(ICO.pc) + ' Party full! ' + (pkmnData.nickname || formName(pkmnData.form)) + ' sent to PC.');
				}
				return true;
			}
	
			return { open, addToBox, load, formName };
		})();
	window.CAMP_SYSTEMS.PCBox = PCBox;

	// ── WonderTrade ────────────────────────────────────────────────────────
		const WonderTrade = (() => {
			const TRADE_POOL = [
				{ form:'eevee',    name:'Eevee',         friendship:20 },
				{ form:'vaporeon', name:'Vaporeon',       friendship:50 },
				{ form:'flareon',  name:'Flareon',        friendship:50 },
				{ form:'jolteon',  name:'Jolteon',        friendship:50 },
				{ form:'leafeon',  name:'Leafeon',        friendship:50 },
				{ form:'espeon',   name:'Espeon',         friendship:50 },
				{ form:'umbreon',  name:'Umbreon',        friendship:50 },
				{ form:'eevee',    name:'Mystery Eevee',  friendship:80 },
			];
			function open() {
				// Build trade list from PC storage + non-active party slots.
				const inv = PCBox.load();
				const party     = inv.party || [];
				const pc        = inv.pcStorage || [];
				const activeIdx = inv.partyActive || 0;
				// Tradeable = PC entries + non-active party slots
				const tradeable = [
					...pc.map((s, i)    => ({ source:'pc',    idx: i, slot: s })),
					...party.map((s, i) => s && i !== activeIdx ? { source:'party', idx: i, slot: s } : null)
						.filter(Boolean),
				];
				if (!tradeable.length) { showToast('Nothing to trade! Put a Pokémon in the PC first.'); return; }
				let panel = document.getElementById('wonderTradePanel');
				if (!panel) {
					panel = document.createElement('div');
					panel.id = 'wonderTradePanel';
					document.body.appendChild(panel);
					panel.addEventListener('pointerdown', e => { if (e.target === panel) panel.hidden = true; });
				}
				panel.hidden = false;
				panel.className = 'pk-backdrop';
				panel.innerHTML = '';
				const inner = document.createElement('div');
				inner.className = 'pk-modal pk-modal-sm';
				inner.innerHTML =
					'<div class="pk-modal-head">' +
					'<span class="pk-modal-title" style="color:#88aaff">' + ico(ICO.trade) + ' WONDER TRADE</span>' +
					'<button id="wtClose" class="pk-close" style="color:#88aaff" type="button">' + ico(ICO.close) + '</button>' +
					'</div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
				const intro = document.createElement('div');
				intro.style.cssText = 'font-size:8px;color:var(--pk-muted);margin-bottom:14px';
				intro.textContent = 'Trade a Pokémon for a mystery partner!';
				body.appendChild(intro);
				const list = document.createElement('div');
				list.style.cssText = 'display:flex;flex-direction:column;gap:6px';
				tradeable.forEach((entry, ti) => {
					const { slot } = entry;
					const row = document.createElement('div');
					row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;' +
						'padding:8px 10px;border:1px solid var(--pk-border);border-radius:var(--pk-radius-sm);background:rgba(255,255,255,0.03)';
					const dn = PCBox.formName(slot.form);
					row.innerHTML =
						'<div>' +
						'<div style="font-size:8px;color:var(--pk-text)">' + (slot.nickname || dn) +
						'<span style="color:var(--pk-faint);font-size:7px"> (' + dn + ')</span></div>' +
						'<div style="font-size:7px;color:var(--pk-muted)">&#9829; ' + (slot.friendship || 0) +
						(entry.source === 'party' ? ' &nbsp;<span style="color:var(--pk-muted)">party</span>' : '') + '</div>' +
						'</div>';
					const tradeBtn = document.createElement('button');
					tradeBtn.dataset.ti = ti;
					tradeBtn.type = 'button';
					tradeBtn.className = 'pk-btn pk-btn-blue pk-btn-xs';
					tradeBtn.textContent = 'Trade';
					row.appendChild(tradeBtn);
					list.appendChild(row);
				});
				body.appendChild(list);
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.getElementById('wtClose').addEventListener('click', () => { panel.hidden = true; });
				list.querySelectorAll('[data-ti]').forEach(btn => {
					btn.addEventListener('click', () => {
						const ti = parseInt(btn.dataset.ti);
						const entry = tradeable[ti];
						const inv2 = PCBox.load();
						const received = TRADE_POOL[Math.floor(Math.random() * TRADE_POOL.length)];
						const receivedEntry = { form: received.form, name: received.name, nickname: received.name, friendship: received.friendship, since: Date.now() };
						if (entry.source === 'pc') {
							inv2.pcStorage.splice(entry.idx, 1);
							inv2.pcStorage.push(receivedEntry);
						} else {
							inv2.party.splice(entry.idx, 1);
							if ((inv2.partyActive || 0) > entry.idx) inv2.partyActive--;
							inv2.party.push(receivedEntry);
						}
						Inventory.save(inv2);
						panel.hidden = true;
						showToast(ico(ICO.trade) + ' Got ' + received.name + ' in return!');
						Achievements.unlock('wonderTrade');
					});
				});
			}
			return { open };
		})();
	window.CAMP_SYSTEMS.WonderTrade = WonderTrade;

	// ── CampRating ────────────────────────────────────────────────────────
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
					let html = '';
					for (let i = 1; i <= 5; i++) {
						html += '<span class="star' + (i > stars ? ' empty' : '') + '">' +
							(i <= stars ? '★' : '☆') + '</span>';
					}
					el.innerHTML = html;
					el.title = stars + '-Star Camp';
				}
				if (stars === 5) Achievements.unlock('fiveStarCamp');
				return stars;
			}
	
			return { calculate, getAwayMultiplier, displayOnGate };
		})();
	window.CAMP_SYSTEMS.CampRating = CampRating;

	// ── CampfireStories ────────────────────────────────────────────────────────
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
				try { return WeatherSystem.currentType(window.__campScene); } catch { return 'clear'; }
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
	window.CAMP_SYSTEMS.CampfireStories = CampfireStories;

	// ── BerryCompost ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.BerryCompost = BerryCompost;

	// ── getPartnerPassive ────────────────────────────────────────────────────────
		function getPartnerPassive() {
			const inv = Inventory.load();
			const form = inv.eeveeForm || 'eevee';
			const ts = inv.tutorSkills || [];
			return {
				fishingBonus:       form === 'vaporeon',
				rhythmTokenBonus:   form === 'flareon' ? 1 : 0,
				rhythmSpeedPenalty: form === 'jolteon' ? 0.85 : 1.0,
				growSpeedBonus:     form === 'leafeon' ? 0.3 : 0,
				questRewardBonus:   form === 'espeon' ? 3 : 0,
				dailyCooldownMult:  form === 'umbreon' ? 0.85 : 1.0,
				tutorBerryBonus:    ts.includes('powerHerb') ? 5 : 0,
				tutorFishBonus:     ts.includes('lureExpert'),
				tutorRhythmBonus:   ts.includes('rhythmEar') ? 2 : 0,
				tutorGrowBonus:     ts.includes('growthBoost') ? 0.5 : 0,
			};
		}
	window.CAMP_SYSTEMS.getPartnerPassive = getPartnerPassive;

	// ── DailyQuests ────────────────────────────────────────────────────────
		const DailyQuests = (() => {
			const QUESTS = [
				{ id: 'feed',     label: 'Feed partner 3×',      goal: 3,  reward: 10, icoKey: 'berry'  },
				{ id: 'harvest',  label: 'Harvest a berry',       goal: 1,  reward: 8,  icoKey: 'seed'   },
				{ id: 'market',   label: 'Visit the marketplace', goal: 1,  reward: 12, icoKey: 'cart'   },
				{ id: 'rhythm',   label: 'Win a rhythm battle',   goal: 1,  reward: 15, icoKey: 'music'  },
				{ id: 'fish',     label: 'Catch a fish',          goal: 1,  reward: 10, icoKey: 'fish'   },
				{ id: 'minigame', label: 'Win any wild battle',   goal: 1,  reward: 8,  icoKey: 'game'   },
				{ id: 'shell',    label: 'Collect 3 seashells',   goal: 3,  reward: 10, icoKey: 'star'   },
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
	window.CAMP_SYSTEMS.DailyQuests = DailyQuests;

	// (TILE, MAP_W, MAP_H, GROW_MS, prices, FRIENDSHIP_PER_BERRY pulled at top of IIFE)


	// ── getSeasonalItems ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.getSeasonalItems = getSeasonalItems;

	// ── getFurnitureBonuses ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.getFurnitureBonuses = getFurnitureBonuses;

	// ── EggSystem ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.EggSystem = EggSystem;

	// ── Fishing ────────────────────────────────────────────────────────
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
					// Daily catch streak — every fish landed today nudges the odds
					// toward rarer catches (resets at midnight).
					const fToday = new Date().toISOString().slice(0, 10);
					if (!inv.fishStreak || inv.fishStreak.date !== fToday)
						inv.fishStreak = { date: fToday, count: 0 };
					const streakBonus = Math.min(0.22, (inv.fishStreak.count || 0) * 0.045);
					const roll = Math.random() + (hasBait ? 0.15 : 0) + streakBonus;
					inv.fishStreak.count = (inv.fishStreak.count || 0) + 1;
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
					const streakNote = (inv.fishStreak.count >= 3) ? ' · streak ×' + inv.fishStreak.count + ' (rarer bites!)' : '';
					if (status) status.innerHTML = ico(ICO[caught.icoKey]||ICO.fish) + ' Caught ' + caught.name + '! +' + rewardStr + (hasBait ? ' (bait bonus!)' : '') + streakNote;
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
	window.CAMP_SYSTEMS.Fishing = Fishing;

	// ── BeachShack — trade seashells collected on the beach ─────────────────────
		const BeachShack = (() => {
			let openFlag = false;
			const COST = { tokens: 3, berries: 5, seeds: 5, parasol: 20 };
			function ensure() {
				if (document.getElementById('beachShackPanel')) return;
				const p = document.createElement('div');
				p.id = 'beachShackPanel';
				p.hidden = true;
				p.className = 'pk-backdrop';
				const inner = document.createElement('div');
				inner.className = 'pk-modal pk-modal-sm';
				inner.style.textAlign = 'center';
				inner.innerHTML =
					'<div class="pk-modal-head"><span class="pk-modal-title">🐚 BEACH SHACK</span></div>' +
					'<div class="pk-modal-body">' +
					'<div id="shackBal" style="font-size:9px;color:var(--pk-gold);margin-bottom:6px"></div>' +
					'<div id="shackStatus" style="font-size:8px;color:var(--pk-muted);min-height:14px;margin-bottom:10px"></div>' +
					'<div style="display:flex;flex-direction:column;gap:8px">' +
					'<button class="pk-btn pk-btn-blue pk-btn-sm" data-trade="tokens">3 🐚 → 25 Tokens</button>' +
					'<button class="pk-btn pk-btn-blue pk-btn-sm" data-trade="berries">5 🐚 → 4 Berries</button>' +
					'<button class="pk-btn pk-btn-blue pk-btn-sm" data-trade="seeds">5 🐚 → 3 Seeds</button>' +
					'<button class="pk-btn pk-btn-blue pk-btn-sm" data-trade="parasol">20 🐚 → 🏖 Beach Parasol decor</button>' +
					'</div>' +
					'<button id="shackClose" class="pk-btn pk-btn-ghost pk-btn-xs" style="display:block;margin:14px auto 0" type="button">Leave</button>' +
					'</div>';
				p.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				p.addEventListener('pointerdown', () => { if (openFlag) close(); });
				document.body.appendChild(p);
				document.getElementById('shackClose').addEventListener('click', close);
				inner.querySelectorAll('[data-trade]').forEach(b => {
					b.addEventListener('click', () => trade(b.dataset.trade));
				});
			}
			function setStatus(m) { const e = document.getElementById('shackStatus'); if (e) e.textContent = m || ''; }
			function trade(kind) {
				const inv = Inventory.load();
				const have = inv.seashells || 0;
				const cost = COST[kind];
				if (have < cost) { setStatus('Not enough seashells — go collect more!'); return; }
				if (kind === 'parasol') {
					if (!inv.cosmetics) inv.cosmetics = {};
					if (!Array.isArray(inv.cosmetics.decor)) inv.cosmetics.decor = [];
					if (inv.cosmetics.decor.includes('parasol')) { setStatus('You already own the Beach Parasol.'); return; }
					inv.cosmetics.decor.push('parasol');
					setStatus('🏖 Beach Parasol added to your camp decor!');
				} else if (kind === 'tokens')  { inv.tokens = (inv.tokens || 0) + 25; setStatus('Traded for +25 Tokens!'); }
				else if (kind === 'berries')   { inv.friendshipBerries = (inv.friendshipBerries || 0) + 4; setStatus('Traded for +4 Friendship Berries!'); }
				else if (kind === 'seeds')     { inv.seeds = (inv.seeds || 0) + 3; setStatus('Traded for +3 Berry Seeds!'); }
				inv.seashells = have - cost;
				Inventory.save(inv);
				refresh();
			}
			function refresh() {
				const inv = Inventory.load();
				const bal = document.getElementById('shackBal');
				if (bal) bal.textContent = 'You have ' + (inv.seashells || 0) + ' 🐚 seashells';
				document.querySelectorAll('#beachShackPanel [data-trade]').forEach(btn => {
					btn.disabled = (inv.seashells || 0) < COST[btn.dataset.trade];
				});
			}
			function open() {
				ensure();
				const p = document.getElementById('beachShackPanel');
				if (p) p.hidden = false;
				openFlag = true;
				setStatus('Seashells wash up all over the beach — collect and trade them here.');
				refresh();
			}
			function close() {
				const p = document.getElementById('beachShackPanel');
				if (p) p.hidden = true;
				openFlag = false;
			}
			document.addEventListener('keydown', e => {
				if (openFlag && e.key === 'Escape') { e.preventDefault(); close(); }
			});
			return { open, close, isOpen: () => openFlag };
		})();
	window.CAMP_SYSTEMS.BeachShack = BeachShack;

	// ── TowerDungeon — original top-down roguelike inside the marketplace tower ──
	// Self-contained canvas-overlay minigame; does not touch the Phaser scenes.
	// Your partner Pokémon fights alongside you, auto-firing at nearby foes.
		const TowerDungeon = (() => {
			let W = 560, H = 560, VW = 320, VH = 240; const WALL = 16, MAX_ROOM = 9;
			let root = null, cv = null, ctx = null, raf = null, openFlag = false;
			let S = null;
			const keys = {};
			const FORM_COLOR = {
				eevee:'#c89860', vaporeon:'#5aa0e0', jolteon:'#f0d040', flareon:'#f08030',
				espeon:'#d080d0', umbreon:'#5a5a80', leafeon:'#80c050', glaceon:'#90d0e0', sylveon:'#f0a0c0',
			};
			const FORM_NOVA = {
				eevee:'#e8d0a0', vaporeon:'#4aa8f0', jolteon:'#f8e050', flareon:'#ff7038',
				espeon:'#e070e0', umbreon:'#7060a0', leafeon:'#70d040', glaceon:'#a0e8ff', sylveon:'#ffa0d8',
			};
			const FORM_TYPE = {
				eevee:'normal', vaporeon:'water', jolteon:'electric', flareon:'fire',
				espeon:'psychic', umbreon:'dark', leafeon:'grass', glaceon:'ice', sylveon:'fairy',
			};
			// Gen1 primary type for dex 1-151 (index = dex number)
			const GEN1_TYPE_STR = '_GGGFFFWWWBBBBBBNNNNNNNNPPEEUUPPPPPPNNFFNNPPGGGBBBBUURNNWWKKFFWWWYYYKKKGGGWWRRRFFWWEENNNWWPPWWHHHRYYRRWWEEGGUURKKNPPUUNGNWWWWWWYBIEFBNWWWNNWEFNRRRRRNIEFDDDYY';
			const GEN1_CHAR_TYPE = {G:'grass',F:'fire',W:'water',B:'bug',N:'normal',P:'poison',E:'electric',U:'ground',R:'rock',K:'fighting',H:'ghost',D:'dragon',Y:'psychic',I:'ice'};
			function formType(form) {
				if (FORM_TYPE[form]) return FORM_TYPE[form];
				const dex = parseInt(form);
				if (!isNaN(dex) && dex >= 1 && dex <= 151) return GEN1_CHAR_TYPE[GEN1_TYPE_STR[dex]] || 'normal';
				return 'normal';
			}
			function formColor(form) {
				if (FORM_COLOR[form]) return FORM_COLOR[form];
				const tc = TYPE_COLOR[formType(form)]; return tc ? tc.body : '#c89860';
			}
			function formNovaColor(form) {
				if (FORM_NOVA[form]) return FORM_NOVA[form];
				const tc = TYPE_COLOR[formType(form)]; return tc ? tc.hi : '#e8d0a0';
			}
			function formDisplayName(form) {
				const EEV = { eevee:1, vaporeon:1, jolteon:1, flareon:1, espeon:1, umbreon:1, leafeon:1, glaceon:1, sylveon:1 };
				if (EEV[form]) return form.charAt(0).toUpperCase() + form.slice(1);
				const dex = parseInt(form);
				if (!isNaN(dex) && FOLLOWER_FORMS && FOLLOWER_FORMS[dex]) return FOLLOWER_FORMS[dex].displayName || String(dex);
				return String(form);
			}
			// Per-type enemy color palette { body, hi, eye }
			const TYPE_COLOR = {
				normal:   { body:'#a0a0a0', hi:'#c8c8a0', eye:'#404060' },
				fire:     { body:'#e03010', hi:'#ff7030', eye:'#ffff40' },
				water:    { body:'#1870c8', hi:'#50a8ff', eye:'#e0f0ff' },
				grass:    { body:'#3a9030', hi:'#60d050', eye:'#ffffc0' },
				electric: { body:'#d8b820', hi:'#ffe860', eye:'#302000' },
				ice:      { body:'#80c8c8', hi:'#c0f0f0', eye:'#203040' },
				psychic:  { body:'#c04090', hi:'#ff80c8', eye:'#fffff0' },
				dark:     { body:'#3a2050', hi:'#6a4880', eye:'#ff2020' },
				poison:   { body:'#703090', hi:'#b060d8', eye:'#80ff80' },
				rock:     { body:'#a08030', hi:'#d0b050', eye:'#402000' },
				ground:   { body:'#b08030', hi:'#e0b050', eye:'#300000' },
				bug:      { body:'#809020', hi:'#c0d030', eye:'#300000' },
				dragon:   { body:'#5030d0', hi:'#8870ff', eye:'#ffd700' },
				fairy:    { body:'#e090a8', hi:'#ffbbd0', eye:'#803090' },
				ghost:    { body:'#504080', hi:'#8070b0', eye:'#ff60ff' },
			};
			// type effectiveness: attacking type → array of types it's super effective against
			const TYPE_SE = {
				water:['fire'], fire:['grass','ice'], grass:['water'],
				electric:['water'], ice:['grass'], psychic:['poison'],
				dark:['psychic'], fairy:['dark'],
			};
			function typeMultiplier(attackerType, defenderType) {
				const se = TYPE_SE[attackerType] || [];
				return se.indexOf(defenderType) >= 0 ? 2 : 1;
			}
			const RELICS = {
				shellbell: { name:'Shell Bell',   desc:'Heal 1 HP every 4 kills' },
				lucky:     { name:'Lucky Egg',    desc:'Double Stardust drops' },
				guard:     { name:'Guard Spec.',  desc:'Longer invulnerability' },
				power:     { name:'Power Band',   desc:'+1 shot damage' },
				swift:     { name:'Quick Claw',   desc:'Faster fire rate' },
				thorns:    { name:'Thorn Coat',   desc:'Deal 1 dmg to enemies that touch you' },
				focus:     { name:'Focus Band',   desc:'20% chance survive lethal hit (once per run)' },
				magnet:    { name:'Magnet',        desc:'Bullets slightly home toward enemies' },
				scope:     { name:'Scope Lens',   desc:'+15% critical hit chance' },
				lum:       { name:'Lum Berry',    desc:'Immune to status effects' },
				berries:   { name:'Oran Berry',   desc:'Heal 2 HP when HP < 3 (once per room)' },
				regen:     { name:'Leftovers',    desc:'Regen 1 HP every 80 ticks' },
				salve:     { name:'Full Restore', desc:'Full heal when entering rest rooms' },
				choice:    { name:'Choice Band',  desc:'+2 shot dmg, shots only fire in face direction' },
			};
			function randomRelic(owned) {
				const pool = Object.keys(RELICS).filter(k => owned.indexOf(k) < 0);
				return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
			}
			// Boss archetypes for varied boss encounters each run
			const BOSS_ARCHETYPES = [
				{
					key:'dark', name:'Dark Tyrant', color:'#6a2a9a', barColor:'#9a4ad0', eType:'dark', hp:22,
					desc:'3-spread + homing', attackMode:'dark',
				},
				{
					key:'fire', name:'Fire Lord', color:'#ff6010', barColor:'#ff9020', eType:'fire', hp:24,
					desc:'Spinning ring of 8', attackMode:'fire',
				},
				{
					key:'ice', name:'Ice Queen', color:'#a0d8f0', barColor:'#60c0e8', eType:'ice', hp:20,
					desc:'4-directional cross', attackMode:'ice',
				},
				{
					key:'psychic', name:'Psychic Overlord', color:'#e060c0', barColor:'#ff80d0', eType:'psychic', hp:26,
					desc:'Teleports + homing burst', attackMode:'psychic',
				},
				{
					key:'poison', name:'Poison King', color:'#60b040', barColor:'#90d060', eType:'poison', hp:18,
					desc:'Radial cloud of 12', attackMode:'poison',
				},
			];
			const MINIBOSS_TYPES = [
				{ key:'shield',  name:'Guardian',  color:'#4060c0', barColor:'#6080e0', eType:'rock',  hp:30, desc:'Rotating shield' },
				{ key:'split',   name:'Mimic',     color:'#a04080', barColor:'#d060a0', eType:'ghost', hp:28, desc:'Splits at half HP' },
				{ key:'charger', name:'Rampager',  color:'#c04020', barColor:'#ff6030', eType:'fire',  hp:24, desc:'Charges across room' },
			];
			// Permanent upgrades
			const PERM_DEFS = {
				startHp:    { name:'Thick Fat',    desc:'Start with +1 max HP per level',      costs:[15,30,50] },
				startStar:  { name:'Pickup',       desc:'Start with +8 Stardust per level',    costs:[12,25,40] },
				fireRate:   { name:'Hustle',       desc:'Player fires 4 ticks faster per level',costs:[20,45,70] },
				novaCharge: { name:'Synchronize',  desc:'Partner nova cost -8 per level',      costs:[18,35,55] },
				rollFrames: { name:'Speed Boost',  desc:'Dodge roll lasts 2 extra frames/level',costs:[22,40,65] },
				startRelic: { name:'Relic Starter',desc:'Begin each run with 1-3 random relics',costs:[30,65,110] },
				typePower:  { name:'Type Mastery', desc:'+1 dmg per level on type-effective hits',costs:[25,50,80] },
				revival:    { name:'Revival Herb', desc:'Survive a killing blow (once per run per level)',costs:[40,80,130] },
			};
			function loadPerm() {
				try { return JSON.parse(localStorage.getItem('pokequiz_tower_perm') || '{}'); } catch(_){ return {}; }
			}
			function savePerm(p) { localStorage.setItem('pokequiz_tower_perm', JSON.stringify(p)); }
			function loadBank() { return parseInt(localStorage.getItem('pokequiz_tower_bank') || '0', 10) || 0; }
			function saveBank(v) { localStorage.setItem('pokequiz_tower_bank', String(v)); }
			const BEST_KEY = 'td_best_v1';
			function loadBest() { try { return JSON.parse(localStorage.getItem(BEST_KEY)||'{}'); } catch(_) { return {}; } }
			function saveBest(d) { try { localStorage.setItem(BEST_KEY, JSON.stringify(d)); } catch(_) {} }
			function seededRand(seed) { let s=seed%233280||1; return function(){ s=(s*9301+49297)%233280; return s/233280; }; }
			// Trivia questions for puzzle rooms
			const TRIVIA = [
				{ q:"What type is Gengar?",          a:"Ghost",      w:["Psychic","Dark","Poison"] },
				{ q:"How many HP does Blissey have?", a:"255",        w:["220","300","180"] },
				{ q:"What evolves into Vaporeon?",   a:"Eevee",      w:["Poliwag","Staryu","Slowpoke"] },
				{ q:"What is super effective vs Water?", a:"Grass",  w:["Fire","Ground","Ice"] },
				{ q:"Which Pokémon is #001?",         a:"Bulbasaur",  w:["Charmander","Squirtle","Caterpie"] },
				{ q:"What type is Eevee?",           a:"Normal",     w:["Fairy","Psychic","Ground"] },
				{ q:"How many Eevee evolutions exist?", a:"8",       w:["6","7","9"] },
				{ q:"What move cannot miss?",        a:"Swift",      w:["Tackle","Bite","Pound"] },
				// Types
				{ q:"What type is Mewtwo?",          a:"Psychic",    w:["Dark","Normal","Ghost"] },
				{ q:"What type is Magnemite?",       a:"Electric/Steel", w:["Electric","Steel","Electric/Rock"] },
				{ q:"What type is Clefairy?",        a:"Fairy",      w:["Normal","Psychic","Ice"] },
				{ q:"What is super effective vs Dark?", a:"Fairy",   w:["Ghost","Psychic","Fighting"] },
				{ q:"What type is Snorlax?",         a:"Normal",     w:["Ground","Fighting","Psychic"] },
				{ q:"What is Charizard's secondary type?", a:"Flying", w:["Dragon","Fire","Rock"] },
				{ q:"What type is Marowak?",         a:"Ground",     w:["Normal","Rock","Fighting"] },
				{ q:"What type resists Electric?",   a:"Dragon",     w:["Water","Grass","Normal"] },
				// Evolutions
				{ q:"What does Machoke evolve into?", a:"Machamp",   w:["Machop","Golem","Alakazam"] },
				{ q:"What level does Magikarp evolve?", a:"20",      w:["15","25","30"] },
				{ q:"What stone evolves Pikachu?",   a:"Thunder Stone", w:["Moon Stone","Fire Stone","Water Stone"] },
				{ q:"What evolves into Alakazam?",   a:"Kadabra",    w:["Abra","Drowzee","Jynx"] },
				{ q:"What does Slowpoke evolve into?", a:"Slowbro",  w:["Slowking","Slowbro or Slowking","Slowpoke+"] },
				{ q:"What evolves Eevee into Espeon?", a:"High Friendship (Day)", w:["Sun Stone","Psychic TM","Dusk Stone"] },
				{ q:"What Pokémon evolves using a King's Rock?", a:"Slowking", w:["Politoed","Steelix","Porygon2"] },
				// Moves
				{ q:"How many PP does Hyper Beam have?", a:"5",      w:["10","15","8"] },
				{ q:"What type is Earthquake?",      a:"Ground",     w:["Rock","Normal","Fighting"] },
				{ q:"What move has 120 base power and may burn?", a:"Fire Blast", w:["Flamethrower","Overheat","Heat Wave"] },
				{ q:"What move puts the foe to sleep?", a:"Spore",   w:["Sleep Powder","Hypnosis","Yawn"] },
				{ q:"What move copies the foe's last move?", a:"Mimic", w:["Copycat","Mirror Move","Sketch"] },
				// Abilities
				{ q:"What ability does Intimidate lower?", a:"Attack", w:["Speed","Defense","Sp. Atk"] },
				{ q:"What ability prevents stat drops?", a:"Clear Body", w:["Sturdy","Immunity","Own Tempo"] },
				{ q:"Levitate grants immunity to which type?", a:"Ground", w:["Electric","Rock","Poison"] },
				{ q:"What ability heals HP in rain?",  a:"Rain Dish", w:["Hydration","Swift Swim","Dry Skin"] },
				// Pokédex numbers
				{ q:"What is Pikachu's Pokédex number?", a:"25",     w:["35","55","12"] },
				{ q:"What number is Mewtwo?",         a:"150",        w:["151","149","152"] },
				{ q:"Which number is Snorlax?",       a:"143",        w:["131","113","133"] },
				{ q:"What is Dragonite's number?",    a:"149",        w:["147","148","150"] },
				// Generations
				{ q:"Which gen introduced Johto starters?", a:"Gen 2", w:["Gen 1","Gen 3","Gen 4"] },
				{ q:"Which gen introduced Fairy type?", a:"Gen 6",   w:["Gen 5","Gen 7","Gen 4"] },
				{ q:"Lucario was introduced in which gen?", a:"Gen 4", w:["Gen 3","Gen 5","Gen 2"] },
				// Version exclusives
				{ q:"Scyther is exclusive to which game?", a:"Red",  w:["Blue","Yellow","Gold"] },
				{ q:"Ekans is exclusive to which version?", a:"Red", w:["Blue","FireRed","LeafGreen"] },
				// Legendary types
				{ q:"What type is Lugia?",            a:"Psychic/Flying", w:["Water/Flying","Normal/Flying","Psychic/Water"] },
				{ q:"What type is Ho-Oh?",            a:"Fire/Flying",    w:["Normal/Flying","Psychic/Fire","Fire/Normal"] },
				{ q:"What type is Celebi?",           a:"Psychic/Grass",  w:["Grass","Fairy/Grass","Psychic"] },
				// Held items / stat totals
				{ q:"What item boosts Sp. Atk by 10%?", a:"Wise Glasses", w:["Shell Bell","Expert Belt","Petaya Berry"] },
				{ q:"What is Blissey's total base stat?", a:"540",   w:["600","480","520"] },
				{ q:"What held item halves burn damage?", a:"Rawst Berry", w:["Lum Berry","Oran Berry","Pecha Berry"] },
			];
			// Trainer room data — tier indicates earliest floor they can appear on (0=floor1, 1=floor4, 2=floor7)
			const TRAINERS = [
				{ name:"Youngster Joey", emoji:"👦", tier:0,
				  team:[{col:'#a0785a',type:'normal',hp:10,r:8},{col:'#c08040',type:'normal',hp:16,r:9}] },
				{ name:"Lass Iris", emoji:"👧", tier:0,
				  team:[{col:'#4060e0',type:'grass',hp:9,r:8},{col:'#e02040',type:'grass',hp:18,r:10}] },
				{ name:"Bug Catcher", emoji:"🧒", tier:0,
				  team:[{col:'#80a040',type:'bug',hp:8,r:7},{col:'#d0d0ff',type:'bug',hp:14,r:9},{col:'#f0e040',type:'bug',hp:16,r:9}] },
				{ name:"Sailor Jack", emoji:"⚓", tier:0,
				  team:[{col:'#40a0c0',type:'water',hp:10,r:8},{col:'#2050d0',type:'water',hp:22,r:12}] },
				{ name:"Hiker Rocky", emoji:"🧗", tier:1,
				  team:[{col:'#a08060',type:'rock',hp:18,r:10},{col:'#806040',type:'ground',hp:20,r:11},{col:'#c09060',type:'rock',hp:24,r:12}] },
				{ name:"Scientist Lara", emoji:"🔬", tier:1,
				  team:[{col:'#a0e0e0',type:'electric',hp:16,r:9},{col:'#4080ff',type:'psychic',hp:20,r:10},{col:'#80e0ff',type:'electric',hp:22,r:10}] },
				{ name:"Psychic Owen", emoji:"🔮", tier:1,
				  team:[{col:'#d070d0',type:'psychic',hp:18,r:10},{col:'#e090e8',type:'psychic',hp:26,r:12}] },
				{ name:"Bug Maniac Boris", emoji:"🦋", tier:1,
				  team:[{col:'#70c050',type:'bug',hp:14,r:9},{col:'#a0d060',type:'bug',hp:18,r:10},{col:'#f0e040',type:'bug',hp:20,r:10},{col:'#c0f060',type:'bug',hp:22,r:11}] },
				{ name:"Ace Trainer Nina", emoji:"🌟", tier:2,
				  team:[{col:'#60a0ff',type:'water',hp:22,r:11},{col:'#ff8040',type:'fire',hp:24,r:12},{col:'#60c060',type:'grass',hp:26,r:12},{col:'#a060ff',type:'psychic',hp:30,r:13}] },
				{ name:"Cooltrainer Rex", emoji:"😎", tier:2,
				  team:[{col:'#ffe060',type:'electric',hp:24,r:12},{col:'#ff4080',type:'fairy',hp:28,r:13},{col:'#8060ff',type:'dark',hp:32,r:14}] },
				{ name:"Dragon Tamer Cory", emoji:"🐉", tier:2,
				  team:[{col:'#6040a0',type:'dragon',hp:28,r:13},{col:'#4030c0',type:'dragon',hp:32,r:14},{col:'#9060d0',type:'dragon',hp:38,r:15}] },
			];
			// Sprite cache — reuse the player's trainer sheet + the partner's
			// follower spritesheet (both already shipped game assets).
			let dunImgPlayer = null, dunImgPartner = null, dunPartnerMeta = null, dunPartnerForm = null;
			function loadSprites(forceForm) {
				if (!dunImgPlayer) {
					const raw = new Image();
					raw.onload = () => {
						try {
							const c = document.createElement("canvas"); c.width = raw.width; c.height = raw.height;
							const cx = c.getContext("2d");
							if (window.TrainerPalette && window.TrainerPalette.recolor) {
								window.TrainerPalette.recolor(raw, window.TrainerPalette.load(), cx,
									window.TrainerPalette.loadBody && window.TrainerPalette.loadBody());
							} else { cx.drawImage(raw, 0, 0); }
							dunImgPlayer = c;
						} catch (_e) { dunImgPlayer = raw; }
					};
					raw.src = "Pictures/sprites/calem.png";
				}
				// Use explicitly-passed form (from beginRun) so the sprite
				// matches the partner the player actually selected, not whoever
				// happens to be the current equipped companion in inventory.
				const inv = Inventory.load();
				const rawForm = forceForm != null ? forceForm
					: (inv.companionForm != null ? inv.companionForm : (inv.eeveeForm || "eevee"));
				const local = { eevee:1, vaporeon:1, espeon:1, umbreon:1, flareon:1, jolteon:1, leafeon:1, glaceon:1, sylveon:1 };
				const dexNum = parseInt(rawForm);
				const useForm = local[rawForm] ? rawForm : (!isNaN(dexNum) && FOLLOWER_FORMS && FOLLOWER_FORMS[dexNum] ? dexNum : 'eevee');
				if (dunPartnerForm !== useForm) {
					dunPartnerForm = useForm;
					dunPartnerMeta = (FOLLOWER_FORMS && FOLLOWER_FORMS[useForm]) || { sheet: useForm, cols: 7, frameW: 40, frameH: 48 };
					dunImgPartner = null;
					const pi = new Image();
					pi.onload = () => { dunImgPartner = pi; };
					pi.src = dunPartnerMeta.url || ("Pictures/sprites/" + dunPartnerMeta.sheet + ".png");
				}
			}
			function onKey(e) {
				if (!openFlag) return;
				const k = e.key.toLowerCase();
				if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
				keys[k] = (e.type === 'keydown');
				if (e.type === 'keydown' && k === 'escape') exit();
			}
			function fit() {
				const dpr = Math.min(window.devicePixelRatio || 1, 3);
				// Logical viewport = actual screen size. The canvas CSS always fills
				// 100% of the fixed-inset parent so there is no CSS stretching.
				VW = Math.max(300, window.innerWidth  || 360);
				VH = Math.max(300, window.innerHeight || 540);
				if (cv) {
					// DPR-scaled internal resolution so rendering is 1:1 physical pixels.
					cv.width  = Math.round(VW * dpr);
					cv.height = Math.round(VH * dpr);
				}
				if (ctx) {
					// Pre-scale so all draw calls use logical (CSS-pixel) coordinates.
					ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
					ctx.imageSmoothingEnabled = false;
				}
			}
			function ensure() {
				if (root) return;
				root = document.createElement("div");
				root.id = "towerDungeon";
				root.hidden = true;
				root.style.cssText = "position:fixed;inset:0;z-index:120;background:#07060f;font-family:monospace;touch-action:none;overflow:hidden";
				cv = document.createElement("canvas");
				cv.width = W; cv.height = H;
				// fill the fixed-inset parent div — fit() sets internal resolution.
				cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;background:#15101f;display:block";
				ctx = cv.getContext("2d");
				ctx.imageSmoothingEnabled = false;
				root.appendChild(cv);
				// Touch d-pad overlaid bottom-left.
				const pad = document.createElement("div");
				pad.style.cssText = "position:absolute;left:14px;bottom:16px;display:grid;grid-template-columns:repeat(3,50px);grid-template-rows:repeat(3,50px);gap:6px;touch-action:none";
				const mk = (label, key, gc, gr) => {
					const b = document.createElement("button");
					b.textContent = label; b.type = "button";
					b.style.cssText = "grid-column:" + gc + ";grid-row:" + gr + ";font-size:20px;border-radius:10px;border:2px solid #5a4a8a;background:rgba(42,36,64,0.82);color:#cfc6ee;touch-action:none";
					b.addEventListener("pointerdown", e => { e.preventDefault(); keys[key] = true; });
					["pointerup","pointercancel","pointerleave"].forEach(ev =>
						b.addEventListener(ev, e => { e.preventDefault(); keys[key] = false; }));
					pad.appendChild(b);
				};
				mk("↑","arrowup",2,1); mk("←","arrowleft",1,2);
				mk("→","arrowright",3,2); mk("↓","arrowdown",2,3);
				root.appendChild(pad);
				// LEAVE button overlaid bottom-right.
				const leave = document.createElement("button");
				leave.textContent = "LEAVE"; leave.type = "button";
				leave.style.cssText = "position:absolute;right:16px;bottom:26px;font-size:12px;padding:16px 20px;border-radius:10px;border:2px solid #5a4a8a;background:rgba(42,36,64,0.82);color:#cfc6ee";
				leave.addEventListener("click", exit);
				root.appendChild(leave);
				// Start screen
				const ss = document.createElement("div");
				ss.id = "towerStartScreen"; ss.className = "tower-start-screen"; ss.hidden = true;
				root.appendChild(ss);
				// Puzzle overlay
				const puz = document.createElement("div");
				puz.id = "towerPuzzleOverlay"; puz.className = "tower-overlay"; puz.hidden = true;
				root.appendChild(puz);
				// Shrine overlay
				const shr = document.createElement("div");
				shr.id = "towerShrineOverlay"; shr.className = "tower-overlay"; shr.hidden = true;
				root.appendChild(shr);
				// Trainer overlay
				const tr = document.createElement("div");
				tr.id = "towerTrainerOverlay"; tr.className = "tower-overlay"; tr.hidden = true;
				root.appendChild(tr);
				// Upgrade overlay
				const up = document.createElement("div");
				up.id = "towerUpgradeOverlay"; up.className = "tower-overlay"; up.hidden = true;
				root.appendChild(up);
				// Recap overlay
				const rc = document.createElement("div");
				rc.id = "towerRecapOverlay"; rc.className = "tower-overlay"; rc.hidden = true;
				root.appendChild(rc);
				document.body.appendChild(root);
				window.addEventListener("keydown", onKey);
				window.addEventListener("keyup", onKey);
				window.addEventListener("resize", () => { if (openFlag) fit(); });
			}
			function getOverlay(id) { return root && root.querySelector('#' + id); }
			function hideAllOverlays() {
				['towerStartScreen','towerPuzzleOverlay','towerShrineOverlay',
				 'towerTrainerOverlay','towerUpgradeOverlay','towerRecapOverlay'].forEach(id => {
					const el = getOverlay(id); if (el) el.hidden = true;
				});
			}
			// ── Start screen ────────────────────────────────────────────────
			function showStartScreen() {
				hideAllOverlays();
				const inv = Inventory.load();
				const party = inv.party || [];
				const el = getOverlay('towerStartScreen');
				if (!el) return;
				const bank = loadBank();
				el.innerHTML = '';
				const title = document.createElement('h2');
				title.style.cssText = 'color:#ffe060;font-size:18px;margin:0 0 6px;';
				title.textContent = '🗼 Tower Dungeon';
				el.appendChild(title);
				const sub = document.createElement('p');
				sub.style.cssText = 'color:#8a7aaa;font-size:11px;margin:0 0 14px;';
				sub.textContent = 'Choose your partner for this run';
				el.appendChild(sub);
				const bankEl = document.createElement('p');
				bankEl.style.cssText = 'color:#ffd24a;font-size:12px;margin:0 0 10px;';
				bankEl.textContent = '⭐ Stardust Bank: ' + bank;
				el.appendChild(bankEl);
				const grid = document.createElement('div');
				grid.className = 'tower-partner-grid';
				el.appendChild(grid);
				const defaultPartner = (inv.companionForm != null ? inv.companionForm : (inv.eeveeForm || 'eevee'));
				const partnerList = party.length > 0 ? party : [{ form: defaultPartner, nickname: defaultPartner }];
				partnerList.forEach((p, idx) => {
					const form = p.form || defaultPartner;
					const col = formColor(form);
					const displayName = formDisplayName(form);
					const card = document.createElement('div');
					card.className = 'tower-partner-card' + (idx === (inv.partyActive || 0) ? ' selected' : '');
					const dot = document.createElement('div');
					dot.className = 'tower-partner-dot';
					dot.style.background = col;
					card.appendChild(dot);
					const nn = document.createElement('div');
					nn.style.cssText = 'font-size:11px;font-weight:bold;margin-bottom:3px;';
					nn.textContent = p.nickname || displayName;
					card.appendChild(nn);
					const fn = document.createElement('div');
					fn.style.cssText = 'font-size:9px;color:#8a7aaa;';
					fn.textContent = displayName;
					card.appendChild(fn);
					card.addEventListener('click', () => { beginRun(form, p.nickname || displayName); });
					grid.appendChild(card);
				});
				// Show possible modifiers as teaser
				const modPreview = document.createElement('div');
				modPreview.style.cssText = 'margin:10px 0 4px;';
				modPreview.innerHTML = '<div style="font-size:9px;color:#8a7aaa;text-align:center;margin-bottom:5px;letter-spacing:1px;text-transform:uppercase;">Run Modifier (random)</div>' +
					'<div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;">' +
					MODIFIERS.map(m => '<div style="background:rgba(30,20,50,0.9);border:1px solid #5a4a8a;border-radius:6px;padding:4px 8px;text-align:center;min-width:60px;">' +
						'<div style="font-size:14px;line-height:1.3">' + m.icon + '</div>' +
						'<div style="font-size:9px;color:#c0a0ff;font-weight:bold;margin:1px 0">' + m.name + '</div>' +
						'<div style="font-size:7px;color:#7a6a9a">' + m.desc + '</div>' +
					'</div>').join('') +
					'</div>';
				el.appendChild(modPreview);
				// Personal bests panel
				const bestData = loadBest();
				const bestsDiv = document.createElement('div');
				bestsDiv.style.cssText = 'margin:8px 0 4px;padding:6px 10px;background:rgba(20,15,40,0.85);border:1px solid #5a4a8a;border-radius:8px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center;';
				bestsDiv.innerHTML =
					'<div style="font-size:9px;color:#8a7aaa;text-align:center;width:100%;margin-bottom:3px;letter-spacing:1px;text-transform:uppercase;">Personal Bests</div>' +
					[['🏆','Best Floor', bestData.depth != null ? bestData.depth : '—'],
					 ['☠','Most Kills', bestData.kills != null ? bestData.kills : '—'],
					 ['⭐','Most Stardust', bestData.stardust != null ? bestData.stardust : '—'],
					 ['🎒','Most Relics', bestData.relics != null ? bestData.relics : '—']
					].map(([ico,lbl,val])=>'<div style="text-align:center;min-width:55px;"><div style="font-size:12px">'+ico+'</div><div style="font-size:9px;color:#c0a0ff;font-weight:bold">'+val+'</div><div style="font-size:7px;color:#6a5a8a">'+lbl+'</div></div>').join('');
				el.appendChild(bestsDiv);
				const btnRow = document.createElement('div');
				btnRow.style.cssText = 'display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;justify-content:center;';
				el.appendChild(btnRow);
				const upgradeBtn = document.createElement('button');
				upgradeBtn.className = 'tower-btn';
				upgradeBtn.textContent = '⬆ Permanent Upgrades';
				upgradeBtn.addEventListener('click', showUpgradeScreen);
				btnRow.appendChild(upgradeBtn);
				const todaySeed = (()=>{ const d=new Date(); return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate(); })();
				const dailyBtn = document.createElement('button');
				dailyBtn.className = 'tower-btn';
				const dailyDone = bestData.lastDaily === todaySeed;
				dailyBtn.textContent = dailyDone ? '📅 Daily (Done ✓)' : '📅 Daily Challenge';
				dailyBtn.disabled = dailyDone;
				dailyBtn.addEventListener('click', () => { beginRun(defaultPartner, 'Daily Run', true); });
				btnRow.appendChild(dailyBtn);
				const closeBtn = document.createElement('button');
				closeBtn.className = 'tower-btn';
				closeBtn.textContent = '✕ Close';
				closeBtn.addEventListener('click', () => { hideAllOverlays(); exit(); });
				btnRow.appendChild(closeBtn);
				el.hidden = false;
			}
			// ── Upgrade screen ──────────────────────────────────────────────
			function showUpgradeScreen() {
				hideAllOverlays();
				const el = getOverlay('towerUpgradeOverlay');
				if (!el) return;
				const perm = loadPerm();
				let bank = loadBank();
				el.innerHTML = '';
				const title = document.createElement('h2');
				title.textContent = 'Permanent Upgrades';
				el.appendChild(title);
				const bankEl = document.createElement('p');
				bankEl.id = 'towerUpgradeBank';
				bankEl.style.cssText = 'color:#ffd24a;font-size:12px;margin:4px 0 10px;';
				bankEl.textContent = '⭐ Stardust Bank: ' + bank;
				el.appendChild(bankEl);
				const grid = document.createElement('div');
				grid.className = 'tower-upgrade-grid';
				el.appendChild(grid);
				Object.entries(PERM_DEFS).forEach(([key, def]) => {
					const lvl = perm[key] || 0;
					const row = document.createElement('div');
					row.className = 'tower-upgrade-row';
					const info = document.createElement('div');
					info.style.cssText = 'flex:1;';
					const nm = document.createElement('div');
					nm.style.cssText = 'font-size:12px;color:#cfc6ee;';
					nm.textContent = def.name + ' Lv.' + lvl + '/3';
					const desc = document.createElement('div');
					desc.style.cssText = 'font-size:9px;color:#8a7aaa;margin-top:2px;';
					desc.textContent = def.desc;
					info.appendChild(nm); info.appendChild(desc);
					row.appendChild(info);
					const cost = lvl < 3 ? def.costs[lvl] : null;
					const btn = document.createElement('button');
					btn.className = 'tower-upgrade-buy';
					btn.disabled = lvl >= 3 || bank < (cost || 9999);
					btn.textContent = lvl >= 3 ? 'MAX' : cost + ' ⭐';
					btn.addEventListener('click', () => {
						const curBank = loadBank();
						const curPerm = loadPerm();
						const curLvl = curPerm[key] || 0;
						const curCost = PERM_DEFS[key].costs[curLvl];
						if (curLvl >= 3 || curBank < curCost) return;
						curPerm[key] = curLvl + 1;
						savePerm(curPerm);
						saveBank(curBank - curCost);
						showUpgradeScreen();
					});
					row.appendChild(btn);
					grid.appendChild(row);
				});
				const backBtn = document.createElement('button');
				backBtn.className = 'tower-btn';
				backBtn.style.marginTop = '14px';
				backBtn.textContent = '← Back';
				backBtn.addEventListener('click', showStartScreen);
				el.appendChild(backBtn);
				el.hidden = false;
			}
			// ── Puzzle overlay ──────────────────────────────────────────────
			function showPuzzleOverlay(onDone) {
				const el = getOverlay('towerPuzzleOverlay');
				if (!el) { onDone(false); return; }
				const q = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
				el.innerHTML = '';
				const h = document.createElement('h2');
				h.textContent = '❓ Puzzle Room';
				el.appendChild(h);
				const qp = document.createElement('p');
				qp.style.cssText = 'font-size:13px;margin:8px 0 14px;max-width:320px;';
				qp.textContent = q.q;
				el.appendChild(qp);
				const answers = [q.a, ...q.w].sort(() => Math.random() - 0.5);
				const grid = document.createElement('div');
				grid.className = 'tower-answer-grid';
				el.appendChild(grid);
				answers.forEach(ans => {
					const btn = document.createElement('button');
					btn.className = 'tower-answer-btn';
					btn.textContent = ans;
					btn.addEventListener('click', () => {
						const correct = ans === q.a;
						btn.style.borderColor = correct ? '#7ad07a' : '#ff5a6a';
						if (!correct && S) { S.hp--; }
						setTimeout(() => { el.hidden = true; onDone(correct); }, 700);
					});
					grid.appendChild(btn);
				});
				el.hidden = false;
			}
			// ── Shrine overlay ──────────────────────────────────────────────
			function showShrineOverlay(onDone) {
				const el = getOverlay('towerShrineOverlay');
				if (!el) { onDone(); return; }
				el.innerHTML = '';
				const h = document.createElement('h2');
				h.textContent = '⛩ Shrine Room';
				el.appendChild(h);
				const p = document.createElement('p');
				p.textContent = 'Choose a blessing (costs Stardust):';
				el.appendChild(p);
				const opts = [
					{ label:'Vitality Shrine', desc:'+1 max HP', cost:10, fn:() => { S.maxHp++; S.hp = Math.min(S.hp + 1, S.maxHp); } },
					{ label:'Power Shrine',    desc:'+1 player shot dmg (this run)', cost:12, fn:() => { S.bonusDmg = (S.bonusDmg||0)+1; } },
					{ label:'Energy Shrine',   desc:'+30 max energy', cost:8, fn:() => { S.maxEnergy += 30; } },
				];
				const grid = document.createElement('div');
				grid.className = 'tower-shrine-grid';
				el.appendChild(grid);
				opts.forEach(opt => {
					const btn = document.createElement('button');
					btn.className = 'tower-shrine-opt';
					const canAfford = S && S.stardust >= opt.cost;
					btn.style.opacity = canAfford ? '1' : '0.45';
					btn.innerHTML = '<b style="color:#ffe060">' + opt.label + '</b><br><span style="font-size:10px;color:#8a7aaa">' + opt.desc + ' · ' + opt.cost + ' ⭐</span>';
					btn.addEventListener('click', () => {
						if (!S || S.stardust < opt.cost) return;
						S.stardust -= opt.cost;
						opt.fn();
						el.hidden = true;
						onDone();
					});
					grid.appendChild(btn);
				});
				const skipBtn = document.createElement('button');
				skipBtn.className = 'tower-btn';
				skipBtn.style.marginTop = '10px';
				skipBtn.textContent = 'Skip';
				skipBtn.addEventListener('click', () => { el.hidden = true; onDone(); });
				el.appendChild(skipBtn);
				el.hidden = false;
			}
			// ── Curse overlay ──────────────────────────────────────────────
			function showCurseOverlay(onDone) {
				const el = getOverlay('towerShrineOverlay');
				if (!el) { onDone(); return; }
				// Pick a random curse not already active
				const available = CURSES.filter(c => !(S.curses||[]).includes(c.key));
				const curse = available.length ? available[Math.floor(Math.random()*available.length)] : CURSES[0];
				const rk = randomRelic(S.relics);
				el.innerHTML = '';
				const h = document.createElement('h2');
				h.textContent = '⚠ Risk Room';
				el.appendChild(h);
				const desc = document.createElement('p');
				desc.style.cssText = 'font-size:12px;margin:6px 0;';
				desc.textContent = curse.icon + ' ' + curse.name + ': ' + curse.desc;
				el.appendChild(desc);
				const reward = document.createElement('p');
				reward.style.cssText = 'font-size:11px;color:#ffe060;margin:4px 0 10px;';
				reward.textContent = rk ? 'Reward: Relic — ' + RELICS[rk].name : 'Reward: +15 Stardust';
				el.appendChild(reward);
				const row = document.createElement('div');
				row.style.cssText = 'display:flex;gap:10px;justify-content:center;';
				el.appendChild(row);
				const acceptBtn = document.createElement('button');
				acceptBtn.className = 'tower-btn primary';
				acceptBtn.textContent = 'Accept Curse';
				acceptBtn.addEventListener('click', () => {
					if (rk) {
						S.relics.push(rk);
						if (rk==='swift') S.rapid=true;
						showToast('Relic: '+RELICS[rk].name+' (with curse!)');
						checkSynergies();
					} else { S.stardust += 15; }
					S.curses.push(curse.key);
					// Apply immediate curse effects
					if (curse.key==='glass') { S.maxHp = Math.max(1, S.maxHp-1); S.hp = Math.min(S.hp, S.maxHp); S.bonusDmg = (S.bonusDmg||0)+2; }
					el.hidden = true;
					onDone();
				});
				row.appendChild(acceptBtn);
				const declineBtn = document.createElement('button');
				declineBtn.className = 'tower-btn';
				declineBtn.textContent = 'Decline';
				declineBtn.addEventListener('click', () => { el.hidden = true; onDone(); });
				row.appendChild(declineBtn);
				el.hidden = false;
			}
			// ── Trainer overlay ─────────────────────────────────────────────
			let trainerData = null, trainerTeamIdx = 0;
			function showTrainerBattle(onDone) {
				// Floor-scaled trainer selection: early floors use low-tier trainers, late floors use higher tiers
				const floorTier = S ? Math.floor((S.room - 1) / 3) : 0; // 0=floors1-3, 1=floors4-6, 2=floors7-9
				const eligible = TRAINERS.filter(t => t.tier <= floorTier);
				const pool = eligible.length ? eligible : TRAINERS;
				trainerData = pool[Math.floor(Math.random() * pool.length)];
				trainerTeamIdx = 0;
				const el = getOverlay('towerTrainerOverlay');
				if (!el) { spawnTrainerWave(onDone); return; }
				el.innerHTML = '';
				const h = document.createElement('h2');
				h.textContent = trainerData.emoji + ' ' + trainerData.name + ' wants to battle!';
				el.appendChild(h);
				const p = document.createElement('p');
				p.textContent = 'Team: ' + trainerData.team.length + ' Pokémon';
				el.appendChild(p);
				const btn = document.createElement('button');
				btn.className = 'tower-btn primary';
				btn.textContent = 'Fight!';
				btn.addEventListener('click', () => {
					el.hidden = true;
					S._roomOverlay = false;
					S._trainerBattle = true;
					S._trainerData = trainerData;
					S._trainerTeamIdx = 0;
					S._trainerOnDone = onDone;
					spawnTrainerWave();
				});
				el.appendChild(btn);
				el.hidden = false;
			}
			function spawnTrainerWave() {
				if (!S || !S._trainerData) return;
				const team = S._trainerData.team;
				const idx = S._trainerTeamIdx;
				if (idx >= team.length) {
					// trainer defeated
					S._trainerBattle = false;
					const rk = randomRelic(S.relics);
					if (rk) S.pickups.push({ x: W/2, y: H/2, kind:'relic', relic:rk, r:11, bob:0 });
					if (S._trainerOnDone) S._trainerOnDone();
					return;
				}
				const tm = team[idx];
				const tier = Math.floor((S.room - 1) / 3);
				S.enemies = [{
					x: W/2 + (Math.random()-0.5)*80, y: WALL + 60 + Math.random()*80,
					hp: tm.hp, maxHp: tm.hp, r: tm.r, col: tm.col,
					eType: tm.type, boss:false, shooter: Math.random()<0.4,
					cd: 60, spd: 0.55 + tier*0.12, hurt:0, eStatuses:{},
				}];
			}
			// ── Endless choice screen ───────────────────────────────────────
			function showEndlessChoice() {
				hideAllOverlays();
				const el = getOverlay('towerRecapOverlay');
				if (!el) { S.result = 'win'; return; }
				el.innerHTML = '';
				const h = document.createElement('h2');
				h.style.color = '#ffe060';
				h.textContent = '🏆 Floor 9 Cleared!';
				el.appendChild(h);
				const p = document.createElement('p');
				p.textContent = 'You have conquered the tower. Push further into endless?';
				el.appendChild(p);
				const bankBtn = document.createElement('button');
				bankBtn.className = 'tower-btn primary';
				bankBtn.style.margin = '8px 4px';
				bankBtn.textContent = '🏦 Bank & Finish';
				bankBtn.addEventListener('click', () => {
					el.hidden = true;
					S.result = 'win';
					S.endTimer = 0;
					S._recapShown = false;
					// Trigger normal recap after a short delay
					setTimeout(() => { if (!S._recapShown) { S._recapShown = true; showRecapScreen(true); } }, 200);
				});
				el.appendChild(bankBtn);
				const endlessBtn = document.createElement('button');
				endlessBtn.className = 'tower-btn';
				endlessBtn.style.margin = '8px 4px';
				endlessBtn.textContent = '⚡ Push Further →';
				endlessBtn.addEventListener('click', () => {
					el.hidden = true;
					S.endlessLoop = (S.endlessLoop || 0) + 1;
					S.room = 1;
					S._endlessChoiceShown = false;
					newRoom();
					S.px = W / 2; S.py = H - 40;
				});
				el.appendChild(endlessBtn);
				el.hidden = false;
			}
			// ── Recap screen ────────────────────────────────────────────────
			function showRecapScreen(win) {
				hideAllOverlays();
				const el = getOverlay('towerRecapOverlay');
				if (!el) return;
				el.innerHTML = '';
				const h = document.createElement('h2');
				h.textContent = win ? '🏆 TOWER RUN COMPLETE' : '💀 YOU FELL';
				el.appendChild(h);
				if (win) { const wm = document.createElement('p'); wm.style.color = '#7ad07a'; wm.textContent = '🎉 Congratulations! Tower cleared!'; el.appendChild(wm); }
				const endlessLoop = S ? (S.endlessLoop || 0) : 0;
				const roomNum = S ? Math.max(0, S.room - 1) : 0;
				const stats = [
					'Floors cleared: ' + (endlessLoop > 0 ? 'ENDLESS ×' + endlessLoop + ' + ' + roomNum : roomNum),
					'Enemies defeated: ' + (S ? S.kills : 0),
					'Stardust earned: ' + (S ? S.stardust : 0),
					'Relics collected: ' + (S ? S.relics.length : 0),
				];
				if (endlessLoop > 0) stats.push('Endless Depth: ' + (endlessLoop * 9 + roomNum) + ' floors');
				if (S && S.modifier) {
					const modDef = MODIFIERS.find(m => m.key === S.modifier);
					if (modDef) stats.push('Modifier: ' + modDef.icon + ' ' + modDef.name);
				}
				stats.forEach(st => { const p = document.createElement('p'); p.textContent = st; el.appendChild(p); });
				// Show active synergies
				if (S && S.synergies && S.synergies.size > 0) {
					const synDiv = document.createElement('div');
					synDiv.style.cssText = 'margin:6px 0;padding:6px;border:1px solid #5a4a8a;border-radius:6px;';
					const synTitle = document.createElement('div');
					synTitle.style.cssText = 'color:#ffe060;font-size:10px;margin-bottom:4px;';
					synTitle.textContent = '⚡ Active Synergies';
					synDiv.appendChild(synTitle);
					const synNames = { sniper:'Sniper (2.5x crits)', regen_combo:'Regen Combo (fast regen)', bulletstorm:'Bulletstorm (8-tick fire)', ironbarbs:'Iron Barbs (2 thorn dmg)', luckybreak:'Lucky Break (+8 SD focus)' };
					S.synergies.forEach(k => {
						const sd = document.createElement('div');
						sd.style.cssText = 'color:#c0a0ff;font-size:9px;';
						sd.textContent = '• ' + (synNames[k] || k);
						synDiv.appendChild(sd);
					});
					el.appendChild(synDiv);
				}
				const endlessBonus = endlessLoop * 20;
				const earned = (S ? S.stardust : 0) + endlessBonus;
				if (endlessBonus > 0) {
					const eb = document.createElement('p');
					eb.style.cssText = 'color:#ff9040;font-size:10px;';
					eb.textContent = '+ ' + endlessBonus + ' ⭐ Endless Bonus (×' + endlessLoop + ')';
					el.appendChild(eb);
				}
				const bankBtn = document.createElement('button');
				bankBtn.className = 'tower-btn primary';
				bankBtn.style.margin = '12px 4px 4px';
				bankBtn.textContent = 'Bank Stardust (+' + earned + ' ⭐)';
				bankBtn.addEventListener('click', () => {
					saveBank(loadBank() + earned);
					if (S) S.stardust = 0;
					bankBtn.disabled = true;
					bankBtn.textContent = 'Banked!';
				});
				el.appendChild(bankBtn);
				const againBtn = document.createElement('button');
				againBtn.className = 'tower-btn';
				againBtn.style.margin = '4px';
				againBtn.textContent = '↩ Play Again';
				againBtn.addEventListener('click', () => { el.hidden = true; showStartScreen(); });
				el.appendChild(againBtn);
				const campBtn = document.createElement('button');
				campBtn.className = 'tower-btn';
				campBtn.style.margin = '4px';
				campBtn.textContent = '🏕 Return to Camp';
				campBtn.addEventListener('click', () => { el.hidden = true; _doExit(); });
				el.appendChild(campBtn);
				el.hidden = false;
			}
			function newRoom() {
				S.doorOpen = false;
				S.bullets = []; S.ebullets = []; S.enemies = []; S.pickups = [];
				S.hazards = [];
				S._roomOverlay = false;
				S._trainerBattle = false;
				S.berryUsed = false;
				S.roomBanner = 90;
				S.roomFlash = 10;
				// Speedrun modifier: 45-second timer (45*60 ticks)
				S.roomTimer = S.modifier === 'speedrun' ? 45 * 60 : 0;
				// Determine room type based on room number
				const r = S.room;
				const el = S.endlessLoop || 0;
				if (el > 0) {
					// Endless mode: boss every 3rd room
					const endlessRoomInCycle = ((r - 1) % 9) + 1;
					if (endlessRoomInCycle % 3 === 0) { S.roomType = 'boss'; }
					else if (endlessRoomInCycle % 3 === 2) { S.roomType = Math.random() < 0.5 ? 'rest' : 'treasure'; }
					else { S.roomType = Math.random() < 0.4 ? 'combat' : (Math.random() < 0.5 ? 'trainer' : 'ambush'); }
				} else if (r >= MAX_ROOM) { S.roomType = 'boss'; }
				else if (r === 8) { S.roomType = 'rest'; }
				else if (r === 7) { S.roomType = Math.random() < 0.5 ? 'trainer' : 'shop'; }
				else if (r === 6) { S.roomType = 'combat'; }
				else if (r === 5) { S.roomType = Math.random() < 0.5 ? 'puzzle' : 'shrine'; }
				else if (r === 4) { S.roomType = 'miniboss'; }
				else if (r === 3) { S.roomType = Math.random() < 0.5 ? 'treasure' : 'ambush'; }
				else { S.roomType = 'combat'; }
				// Curse room override: rooms 2, 3, 6 have 20% chance
				if ((r===2||r===3||r===6) && el===0 && Math.random()<0.20) S.roomType = 'curse';
				const tier = Math.floor((r - 1) / 3); // 0,1,2
				const tierTypes = ['poison','psychic','dark'];
				const eType = tierTypes[Math.min(tier, 2)];
				if (S.roomType === 'treasure') {
					S.doorOpen = true;
					const rk = randomRelic(S.relics);
					S.pickups.push({ x: W/2, y: H/2, kind:'relic', relic:rk, r:11, bob:0 });
					S.pickups.push({ x: W/2-70, y:H/2, kind:'heart', r:8, bob:1 });
					S.pickups.push({ x: W/2+70, y:H/2, kind:'maxhp', r:9, bob:3 });
				} else if (S.roomType === 'rest') {
					S.doorOpen = true;
					S.pickups.push({ x:W/2-50, y:H/2, kind:'restpad', r:18, bob:0 });
					S.pickups.push({ x:W/2+60, y:H/2, kind:'reroll', r:13, bob:2 });
				} else if (S.roomType === 'shop') {
					S.doorOpen = true;
					const rk = randomRelic(S.relics);
					S.pickups.push({ x:W/2-80, y:H/2, kind:'shop', item:'heal',   cost:8,  r:13, bob:0 });
					S.pickups.push({ x:W/2,    y:H/2, kind:'shop', item:'energy', cost:6,  r:13, bob:0 });
					S.pickups.push({ x:W/2+80, y:H/2, kind:'shop', item:'relic',  relic:rk, cost:14, r:13, bob:0 });
				} else if (S.roomType === 'puzzle' || S.roomType === 'shrine') {
					S.doorOpen = false;
					S._roomOverlay = true;
					// Show overlay after a short delay (next tick)
					S._pendingOverlay = S.roomType; S._pendingOverlayTick = S.tick;
				} else if (S.roomType === 'curse') {
					S.doorOpen = false;
					S._roomOverlay = true;
					S._pendingOverlay = 'curse'; S._pendingOverlayTick = S.tick;
				} else if (S.roomType === 'trainer') {
					S.doorOpen = false;
					S._roomOverlay = true;
					S._pendingOverlay = 'trainer'; S._pendingOverlayTick = S.tick;
				} else if (S.roomType === 'boss') {
					const arch = S.bossArchetype || BOSS_ARCHETYPES[0];
					const hpScale = 1 + (S.endlessLoop||0) * 0.2;
					const bhp = Math.round(arch.hp * 4 * hpScale);
					S.enemies.push({
						x:W/2, y:WALL+96, hp:bhp, maxHp:bhp, r:22,
						boss:true, shooter:true, cd:70, spd:0.55, hurt:0,
						eType: arch.eType, bossColor: arch.color, attackMode: arch.attackMode,
						eStatuses:{},
					});
				} else if (S.roomType === 'miniboss') {
					const mbt = S.minibossType || MINIBOSS_TYPES[0];
					const mbhp = mbt.hp;
					S.enemies.push({
						x:W/2, y:WALL+96, hp:mbhp, maxHp:mbhp, r:15,
						boss:false, miniboss:true, shooter:false, cd:80, spd:0.9, hurt:0,
						eType: mbt.eType, bossColor: mbt.color,
						mbKey: mbt.key, shieldAngle:0, chargeTimer:0, charging:0, _split:false,
						eStatuses:{},
					});
				} else {
					// combat or ambush
					const isAmbush = (S.roomType === 'ambush');
					const isHorde = S.modifier === 'horde';
					const base = 2 + Math.min(7, r + 1) + (isHorde ? 2 : 0);
					const n = isAmbush ? base * 2 : base;
					const tierR = [7,9,11][tier];
					const tierHpMin = [2,4,8][tier];
					const tierHpMax = [4,8,14][tier];
					const tierSpd = [0.55,0.7,0.88][tier];
					// Move mode weights by tier
					const movePools = [
						// tier 0: 70% charger, 20% zigzagger, 10% circler
						['charger','charger','charger','charger','charger','charger','charger','zigzagger','zigzagger','circler'],
						// tier 1: 40% charger, 25% circler, 20% zigzagger, 15% retreater
						['charger','charger','charger','charger','circler','circler','circler','zigzagger','zigzagger','retreater','retreater','circler'],
						// tier 2: 25% charger, 25% circler, 20% flanker, 20% retreater, 10% zigzagger
						['charger','charger','circler','circler','flanker','flanker','retreater','retreater','zigzagger','charger'],
					];
					const modePool = movePools[Math.min(tier, 2)];
					const heldPool = [null,null,null,null,null,'sitrus','sitrus','helmet','berries','berries','berries','shell','toxic_orb','toxic_orb'];
					for (let i = 0; i < n; i++) {
						const shooter = r >= 3 && Math.random() < 0.35;
						const hp = tierHpMin + Math.floor(Math.random()*(tierHpMax-tierHpMin+1));
						const heldRoll = r >= 3 && Math.random() < 0.25;
						const held = heldRoll ? heldPool[Math.floor(Math.random()*heldPool.length)] : null;
						// Attack pattern assignment
						let attackPat = 'straight';
						if (tier >= 1 && Math.random() < 0.30) attackPat = 'spread';
						if (tier >= 2 && Math.random() < 0.20) attackPat = 'burst';
						const moveMode = modePool[Math.floor(Math.random() * modePool.length)];
						// Endless mode HP scaling
						const endlessHpScale = 1 + (S.endlessLoop||0) * 0.2;
						// Horde: 80% HP and size
						const hordeScale = isHorde ? 0.8 : 1;
						const finalHp = Math.max(1, Math.round(hp * hordeScale * endlessHpScale));
						const finalR = Math.max(5, Math.round(tierR * hordeScale));
						const enemy = {
							x: WALL+24+Math.random()*(W-2*WALL-48),
							y: WALL+24+Math.random()*(H-2*WALL-120),
							hp: finalHp, maxHp: finalHp, r: finalR, shooter, cd:50+Math.random()*70,
							spd: shooter ? tierSpd*0.7 : tierSpd+Math.random()*0.2,
							hurt:0, eType, held, heldUsed:false, moveMode, attackPat, zigTimer:0, burstQueue:0,
							shellHp: (held==='shell' ? 3 : 0),
							eStatuses:{},
						};
						// Elite variant
						if (Math.random() < 0.12) {
							enemy.elite = true;
							enemy.hp = Math.ceil(enemy.hp*2.2);
							enemy.maxHp = enemy.hp;
							enemy.spd *= 1.3;
							enemy.r += 2;
						}
						S.enemies.push(enemy);
					}
					if (isAmbush) {
						// drop 2 relics + stardust on clear — set a flag
						S._ambushRoom = true;
					}
				}
			}
			// Called once per room after overlay
			function openRoomAfterOverlay() {
				S._roomOverlay = false;
				S._pendingOverlay = null;
				S.doorOpen = false; // door opens when enemies cleared
			}
			function nearest(x, y, list) {
				let best = null, bd = 1e9;
				for (const e of list) { const d = (e.x - x) ** 2 + (e.y - y) ** 2; if (d < bd) { bd = d; best = e; } }
				return best;
			}
			function shoot(list, x, y, tx, ty, spd, dmg, col) {
				const a = Math.atan2(ty - y, tx - x);
				list.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, dmg, col, r: 3 });
			}
			function applyStatus(name, ticks) {
				if (!S || S.relics.indexOf('lum') >= 0) return;
				S.statuses[name] = Math.max(S.statuses[name], ticks);
			}
			function step() {
				S.tick++;
				if (S.flash > 0) S.flash--;
				if (S.invuln > 0) S.invuln--;
				if (S.result) {
					S.endTimer++;
					if (S.endTimer === 120 && !S._recapShown) { S._recapShown = true; showRecapScreen(S.result === 'win'); }
					return;
				}
				// Handle pending overlay triggers (fire on tick 2 of the new room)
				if (S._pendingOverlay && S.tick >= S._pendingOverlayTick + 2) {
					const ov = S._pendingOverlay;
					S._pendingOverlay = null;
					S._roomOverlay = true;
					if (ov === 'puzzle') {
						showPuzzleOverlay((correct) => {
							if (correct) {
								const rk = randomRelic(S.relics);
								if (rk) { S.relics.push(rk); if (rk==='swift') S.rapid=true; showToast('Relic: '+RELICS[rk].name); checkSynergies(); }
								S.stardust += 6;
							}
							openRoomAfterOverlay();
							S.doorOpen = true;
						});
					} else if (ov === 'shrine') {
						showShrineOverlay(() => { openRoomAfterOverlay(); S.doorOpen = true; });
					} else if (ov === 'trainer') {
						showTrainerBattle(() => { openRoomAfterOverlay(); S.doorOpen = false; });
					} else if (ov === 'curse') {
						showCurseOverlay(() => { openRoomAfterOverlay(); S.doorOpen = true; });
					}
					return;
				}
				if (S._roomOverlay) return;
				// Hit-stop: skip 1 logic frame on enemy kill for impact feel
				if (S.hitStop > 0) { S.hitStop--; return; }
				// Trainer battle wave progression
				if (S._trainerBattle && S.enemies.length === 0) {
					S._trainerTeamIdx++;
					if (S._trainerTeamIdx >= (S._trainerData && S._trainerData.team.length || 0)) {
						S._trainerBattle = false;
						const rk = randomRelic(S.relics);
						if (rk) S.pickups.push({ x:W/2, y:H/2, kind:'relic', relic:rk, r:11, bob:0 });
						S.doorOpen = true;
						if (S._trainerOnDone) { const cb = S._trainerOnDone; S._trainerOnDone=null; cb(); }
						return; // battle over
					} else {
						spawnTrainerWave(); // next wave spawns same tick — no freeze
					}
				}
				// Status ticks
				for (const [k, v] of Object.entries(S.statuses)) { if (v > 0) S.statuses[k]--; }
				if (S.statuses.burn > 0 && S.tick % 60 === 0) { S.hp--; S.flash = 4; }
				if (S.comboTimer > 0) { S.comboTimer--; if (S.comboTimer <= 0) S.comboKills = 0; }
				if (S.statuses.poison > 0 && S.tick % 90 === 0) { S.hp--; S.flash = 4; }
				const paralysed = S.statuses.para > 0 && Math.random() < 0.25;
				const sleeping  = S.statuses.sleep > 0;
				// Speedrun modifier: room timer countdown
				if (S.modifier === 'speedrun' && S.roomTimer > 0 && !S._roomOverlay && !S.doorOpen) {
					S.roomTimer--;
					if (S.roomTimer <= 0) {
						// Auto-clear room but costs 1 HP
						S.enemies = [];
						S.hp = Math.max(1, S.hp - 1);
						S.flash = 12;
					}
				}
				// Regen relic + regen_combo synergy
				if (S.synergies && S.synergies.has('regen_combo') && S.tick % 50 === 0) S.hp = Math.min(S.maxHp, S.hp + 1);
				else if (S.relics.indexOf('regen') >= 0 && S.tick % 80 === 0) S.hp = Math.min(S.maxHp, S.hp + 1);
				// Oran Berry relic (once per room)
				if (S.relics.indexOf('berries') >= 0 && !S.berryUsed && S.hp < 3) { S.hp = Math.min(S.maxHp, S.hp + 2); S.berryUsed = true; }
				if (sleeping || paralysed) {
					S.ptrail.push({ x:S.px, y:S.py });
					if (S.ptrail.length > 18) S.ptrail.shift();
					for (let _i = S.fx.length-1; _i>=0; _i--) {
						const _p = S.fx[_i]; _p.x+=_p.vx; _p.y+=_p.vy; _p.vx*=0.88; _p.vy*=0.88; _p.life--;
						if (_p.life<=0) S.fx.splice(_i,1);
					}
					return;
				}
				const kL = keys['arrowleft'] || keys['a'], kR = keys['arrowright'] || keys['d'];
				const kU = keys['arrowup'] || keys['w'], kD = keys['arrowdown'] || keys['s'];
				let mx = (kR?1:0)-(kL?1:0), my = (kD?1:0)-(kU?1:0);
				if (!S._pk) S._pk = {};
				const perm = loadPerm();
				const rollDur = 13 + (perm.rollFrames||0)*2;
				const edge = (cur, name, vx, vy) => {
					if (cur && !S._pk[name]) {
						if (S.tapDir===name && S.tick-S.tapT<16 && S.rollT<=0) {
							S.rollT=rollDur; S.rollVx=vx*4.6; S.rollVy=vy*4.6; S.rollCd=50;
						}
						S.tapDir=name; S.tapT=S.tick;
					}
					S._pk[name] = cur;
				};
				edge(kL,'L',-1,0); edge(kR,'R',1,0); edge(kU,'U',0,-1); edge(kD,'D',0,1);
				const SP = 1.85;
				if (S.rollT > 0) {
					S.rollT--; S.invuln = Math.max(S.invuln, 2);
					S.px = Math.max(WALL+7, Math.min(W-WALL-7, S.px+S.rollVx));
					S.py = Math.max(WALL+7, Math.min(H-WALL-7, S.py+S.rollVy));
				} else {
					if (mx && my) { mx *= 0.707; my *= 0.707; }
					S.px = Math.max(WALL+7, Math.min(W-WALL-7, S.px+mx*SP));
					S.py = Math.max(WALL+7, Math.min(H-WALL-7, S.py+my*SP));
				}
				// Track roll cooldown for visual indicator
				if (S.rollT <= 0 && S.rollCd > 0) S.rollCd--;
				// Partner follows the player path via a position-history trail.
				S.ptrail.push({ x: S.px, y: S.py });
				if (S.ptrail.length > 18) S.ptrail.shift();
				{ const _tp = S.ptrail[0] || S.partner;
				  S.partner.x += (_tp.x - S.partner.x) * 0.34;
				  S.partner.y += (_tp.y - S.partner.y) * 0.34; }
				S.moving = !!(mx || my);
				if (mx || my) { S.faceX = mx; S.faceY = my; S.walkPhase += 0.35; }
				if (S.pMuzzle > 0) S.pMuzzle--;
				if (S.partnerMuzzle > 0) S.partnerMuzzle--;
				for (let _i = S.fx.length - 1; _i >= 0; _i--) {
					const _p = S.fx[_i];
					_p.x += _p.vx; _p.y += _p.vy; _p.vx *= 0.88; _p.vy *= 0.88; _p.life--;
					if (_p.life <= 0) S.fx.splice(_i, 1);
				}
				// partner special — press E to release a form-specific nova
				const novaCost = Math.max(20, 45 - (perm.novaCharge||0)*8);
				if (S.novaCd > 0) S.novaCd--;
				if (S.frozenField > 0) S.frozenField--;
				if (S.barrier > 0) S.barrier--;
				if (S.energy < S.maxEnergy) S.energy = Math.min(S.maxEnergy, S.energy + 0.13);
				const eDown = !!keys["e"];
				if (eDown && !S.ePrev && S.energy >= novaCost && S.novaCd <= 0 && S.enemies.length) {
					S.energy -= novaCost; S.novaCd = 24; S.partnerMuzzle = 9;
					const nd = 2 + (S.relics.indexOf("power") >= 0 ? 1 : 0) + (S.partnerLevel >= 3 ? 1 : 0);
					const pf = S.partnerForm || 'eevee';
					const aimA = S.partnerAim || 0;
					const px = S.partner.x, py = S.partner.y;
					if (pf === 'vaporeon') {
						// Tidal Jet: 3 piercing beams in 30deg cone
						for (let k = -1; k <= 1; k++) {
							const aa = aimA + k * (15 * Math.PI / 180);
							S.bullets.push({ x:px, y:py, vx:Math.cos(aa)*4.2, vy:Math.sin(aa)*4.2, dmg:nd+1, col:'#4aa8f0', r:5, isNova:true, pierce:true, pierceHits:0 });
						}
						for (let k=0;k<8;k++) S.fx.push({x:px,y:py,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6,life:14,col:'#4aa8f0'});
					} else if (pf === 'flareon') {
						// Flame Burst: 8-direction + 3 fire hazards
						for (let k=0;k<8;k++) { const aa=k/8*Math.PI*2; S.bullets.push({x:px,y:py,vx:Math.cos(aa)*3.7,vy:Math.sin(aa)*3.7,dmg:nd,col:'#ff7038',r:4,isNova:true}); }
						for (let k=0;k<3;k++) S.hazards.push({x:px+(Math.random()-0.5)*60,y:py+(Math.random()-0.5)*60,r:18,type:'fire',life:180,dmg:1,tickCd:0});
						for (let k=0;k<12;k++) S.fx.push({x:px,y:py,vx:(Math.random()-0.5)*8,vy:(Math.random()-0.5)*8,life:16,col:'#ff7038'});
					} else if (pf === 'jolteon') {
						// Chain Lightning
						let tgt1 = nearest(px, py, S.enemies);
						if (tgt1) {
							tgt1.hp -= 4; tgt1.hurt = 6; if (tgt1.hp<=0&&!tgt1._dead){tgt1._dead=true;S.kills++;S.stardust+=(S.relics.indexOf('lucky')>=0?2:1);}
							S.fx.push({x:tgt1.x,y:tgt1.y,vx:0,vy:0,life:10,col:'#ffe060',lightning:true,lx1:px,ly1:py,lx2:tgt1.x,ly2:tgt1.y});
							let prev = tgt1;
							for (let chain=0;chain<3;chain++) {
								const nexts = S.enemies.filter(e=>e!==prev&&!e._dead);
								let nextE=null,bestD=80*80;
								for (const e of nexts){const d=(e.x-prev.x)**2+(e.y-prev.y)**2;if(d<bestD){bestD=d;nextE=e;}}
								if (!nextE) break;
								nextE.hp -= 2; nextE.hurt = 6; if (nextE.hp<=0&&!nextE._dead){nextE._dead=true;S.kills++;S.stardust+=(S.relics.indexOf('lucky')>=0?2:1);}
								S.fx.push({x:nextE.x,y:nextE.y,vx:0,vy:0,life:10,col:'#ffe060',lightning:true,lx1:prev.x,ly1:prev.y,lx2:nextE.x,ly2:nextE.y});
								prev = nextE;
							}
						}
					} else if (pf === 'glaceon') {
						// Blizzard: 12 bullets in cone ±50deg, frozenField
						for (let k=0;k<12;k++) {
							const aa = aimA + (Math.random()-0.5)*(100*Math.PI/180);
							S.bullets.push({x:px,y:py,vx:Math.cos(aa)*3.5,vy:Math.sin(aa)*3.5,dmg:nd,col:'#a0e8ff',r:4,isNova:true,slow:true});
						}
						S.frozenField = 90;
						for (let k=0;k<10;k++) S.fx.push({x:px,y:py,vx:(Math.random()-0.5)*7,vy:(Math.random()-0.5)*7,life:14,col:'#a0e8ff'});
					} else if (pf === 'espeon') {
						// Psychic Burst: 6 homing bullets + knockback
						for (let k=0;k<6;k++) {
							const aa=k/6*Math.PI*2;
							S.bullets.push({x:px,y:py,vx:Math.cos(aa)*2.5,vy:Math.sin(aa)*2.5,dmg:nd,col:'#e070e0',r:4,isNova:true,homing:true});
						}
						for (const e of S.enemies) {
							const a=Math.atan2(e.y-py,e.x-px);
							e.x+=Math.cos(a)*30; e.y+=Math.sin(a)*30;
							e.x=Math.max(WALL+e.r,Math.min(W-WALL-e.r,e.x));
							e.y=Math.max(WALL+e.r,Math.min(H-WALL-e.r,e.y));
						}
						for (let k=0;k<12;k++) S.fx.push({x:px,y:py,vx:(Math.random()-0.5)*7,vy:(Math.random()-0.5)*7,life:14,col:'#e070e0'});
					} else if (pf === 'umbreon') {
						// Dark Mark: mark 3 nearest enemies
						S.darkMark = 120;
						const sorted = [...S.enemies].sort((a,b)=>((a.x-px)**2+(a.y-py)**2)-((b.x-px)**2+(b.y-py)**2));
						for (let k=0;k<Math.min(3,sorted.length);k++) sorted[k].marked = 60;
						for (let k=0;k<10;k++) S.fx.push({x:px,y:py,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6,life:14,col:'#7060a0'});
					} else if (pf === 'leafeon') {
						// Leaf Veil: 8 spreading bullets + heal 2
						for (let k=0;k<8;k++) { const aa=k/8*Math.PI*2; S.bullets.push({x:px,y:py,vx:Math.cos(aa)*3.7,vy:Math.sin(aa)*3.7,dmg:nd,col:'#70d040',r:4,isNova:true}); }
						S.hp = Math.min(S.maxHp, S.hp+2);
						for (let k=0;k<14;k++) S.fx.push({x:S.px+(Math.random()-0.5)*20,y:S.py+(Math.random()-0.5)*20,vx:(Math.random()-0.5)*3,vy:(Math.random()-0.5)*3,life:18,col:'#70d040'});
					} else if (pf === 'sylveon') {
						// Fairy Shield: grant barrier
						S.barrier = 180;
						for (let k=0;k<14;k++) S.fx.push({x:S.px+(Math.random()-0.5)*22,y:S.py+(Math.random()-0.5)*22,vx:(Math.random()-0.5)*4,vy:(Math.random()-0.5)*4,life:20,col:'#ffa0d8'});
					} else {
						// eevee (fallback): ring of 16
						for (let k = 0; k < 16; k++) {
							const aa = k / 16 * Math.PI * 2;
							S.bullets.push({ x: px, y: py, vx: Math.cos(aa) * 3.7, vy: Math.sin(aa) * 3.7, dmg: nd, col: S.novaColor, r: 4, isNova: true });
						}
						for (let k = 0; k < 12; k++) S.fx.push({ x: px, y: py, vx: (Math.random()-0.5)*7, vy: (Math.random()-0.5)*7, life: 15, col: S.novaColor });
					}
				}
				S.ePrev = eDown;
				// Fire rate
				const fasterRate = (perm.fireRate||0)*4;
				const baseFireRate = (S.relics.indexOf('swift')>=0||S.rapid) ? 14 : 26;
				const curseSlow = (S.curses&&S.curses.includes('slow_gun')) ? 1.3 : 1;
				const playerFireRate = (S.synergies && S.synergies.has('bulletstorm')) ? 8 : Math.max(8, Math.round((baseFireRate - fasterRate) * curseSlow));
				if (S.fireCd > 0) S.fireCd--;
				const curseWeak = (S.curses&&S.curses.includes('weak')) ? 1 : 0;
				const baseDmg = Math.max(1, 1 + (S.relics.indexOf('power')>=0?1:0) + (S.bonusDmg||0) - curseWeak);
				const tgt = nearest(S.px, S.py, S.enemies);
				if (tgt && S.fireCd <= 0) {
					const critChance = 0.10 + (S.relics.indexOf('scope')>=0?0.15:0);
					const isCrit = Math.random() < critChance;
					const critMult = (S.synergies && S.synergies.has('sniper')) ? 2.5 : 1.5;
					let dmg = baseDmg * (isCrit ? critMult : 1);
					if (S.relics.indexOf('choice') >= 0) { dmg = (baseDmg+2) * (isCrit?1.5:1); const a=Math.atan2(S.faceY||1,S.faceX||0); S.bullets.push({x:S.px,y:S.py,vx:Math.cos(a)*3.4,vy:Math.sin(a)*3.4,dmg:Math.ceil(dmg),col:'#ffe060',r:3,isCrit}); S.pAim=a; }
					else { shoot(S.bullets, S.px, S.py, tgt.x, tgt.y, 3.4, Math.ceil(dmg), '#ffe060'); S.bullets[S.bullets.length-1].isCrit=isCrit; S.pAim=Math.atan2(tgt.y-S.py,tgt.x-S.px); }
					if (isCrit) S.fx.push({x:S.px,y:S.py-10,vx:0,vy:-0.5,life:22,col:'#ffd700',crit:true,text:'CRIT!'});
					S.fireCd = playerFireRate; S.pMuzzle = 5;
				}
				if (S.partnerCd > 0) S.partnerCd--;
				const ptgt = nearest(S.partner.x, S.partner.y, S.enemies);
				const partnerFireRate = (S.relics.indexOf('swift')>=0||S.rapid) ? 22 : (S.partnerLevel>=3?28:36);
				const partnerDmg = 1 + (S.partnerLevel>=2?1:0);
				if (ptgt && S.partnerCd <= 0) {
					const pType = formType(S.partnerForm || 'eevee');
					const mult = typeMultiplier(pType, ptgt.eType || 'normal');
					const typePowerBonus = mult > 1 ? (perm.typePower||0) : 0;
					shoot(S.bullets, S.partner.x, S.partner.y, ptgt.x, ptgt.y, 3.0, partnerDmg * mult + typePowerBonus, S.pColor);
					S.bullets[S.bullets.length-1].partner = true;
					S.partnerCd = partnerFireRate;
					S.partnerAim = Math.atan2(ptgt.y - S.partner.y, ptgt.x - S.partner.x); S.partnerMuzzle = 5;
				}
				// magnet homing
				const hasMagnet = S.relics.indexOf('magnet') >= 0;
				for (let i = S.bullets.length - 1; i >= 0; i--) {
					const b = S.bullets[i]; b.x += b.vx; b.y += b.vy;
					if (b.homing && S.enemies.length) {
						const nt = nearest(b.x, b.y, S.enemies);
						if (nt) { const ha=Math.atan2(nt.y-b.y,nt.x-b.x); b.vx+=Math.cos(ha)*0.22; b.vy+=Math.sin(ha)*0.22; const spd=Math.hypot(b.vx,b.vy); if(spd>4.0){b.vx=b.vx/spd*4.0;b.vy=b.vy/spd*4.0;} }
					}
					if (hasMagnet && !b.isNova && S.enemies.length) {
						const nt = nearest(b.x, b.y, S.enemies);
						if (nt) { const ha=Math.atan2(nt.y-b.y,nt.x-b.x); b.vx+=Math.cos(ha)*0.18; b.vy+=Math.sin(ha)*0.18; const spd=Math.hypot(b.vx,b.vy); if(spd>4.2){b.vx=b.vx/spd*4.2;b.vy=b.vy/spd*4.2;} }
					}
					if (b.x < 0 || b.x > W || b.y < 0 || b.y > H) { S.bullets.splice(i, 1); continue; }
					let hit = false;
					for (const e of S.enemies) {
						if ((e.x - b.x) ** 2 + (e.y - b.y) ** 2 < (e.r + b.r) ** 2) {
							// Shield block check for miniboss shield type
							if (e.miniboss && e.mbKey === 'shield') {
								const bAngle = Math.atan2(b.y - e.y, b.x - e.x);
								const sAngle = e.shieldAngle || 0;
								const diff = Math.abs(((bAngle - sAngle + Math.PI*3) % (Math.PI*2)) - Math.PI);
								if (diff < Math.PI/3) {
									hit = true;
									S.fx.push({x:b.x,y:b.y,vx:(Math.random()-0.5)*4,vy:(Math.random()-0.5)*4,life:8,col:'#c0c0ff'});
									break;
								}
							}
							// Shell item
							if (e.shellHp > 0) {
								e.shellHp--;
								hit = true;
								if (e.shellHp <= 0) {
									for (let _k=0;_k<6;_k++) S.fx.push({x:e.x,y:e.y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,life:12,col:'#c0c0c0'});
								}
								break;
							}
							if (e.held==='helmet' && !e.heldUsed && S.invuln<=0) { S.hp--; S.flash=5; }
							let dmg = b.dmg;
							if (e.marked > 0) dmg *= 2;
							e.hp -= dmg; e.hurt = 6; hit = true;
							if (b.isCrit) e.critFlash = 8;
							// Floating damage number
							S.fx.push({ x: b.x + (Math.random()-0.5)*8, y: b.y - 4, vx: (Math.random()-0.5)*0.4, vy: -0.9, life: 46, col: b.isCrit ? '#ffd700' : '#e8e0ff', dmgText: (b.isCrit ? '★' : '') + Math.ceil(dmg) });
							if (e.held==='sitrus' && !e.heldUsed && e.hp < e.maxHp*0.5) { e.hp=Math.min(e.maxHp,e.hp+3); e.heldUsed=true; }
							// Partner bullet status effect
							if (b.partner && e.eStatuses) {
								const pType = formType(S.partnerForm || 'eevee');
								const statusMap = { fire:'burn', water:'slow', electric:'para', ice:'slow', grass:'poison', psychic:'para' };
								const sKey = statusMap[pType];
								if (sKey) {
									const dur = { burn:180, slow:120, para:90, poison:150 }[sKey];
									if (!(e.eStatuses[sKey] > 0)) e.eStatuses[sKey] = dur;
								}
							}
							if (e.hp <= 0 && !e._dead) {
								e._dead = true;
								const baseSD = (e.boss||e.miniboss ? 12 : 1) + (S.modifier === 'frail' ? 5 : 0) + (S.endlessLoop||0);
								S.stardust += baseSD * (S.relics.indexOf("lucky") >= 0 ? 2 : 1);
								S.kills++;
								S.comboKills++; S.comboTimer = 120;
								if (!e.boss) S.hitStop = Math.max(S.hitStop || 0, 1);
								S.fx.push({ kind:'ring', x:e.x, y:e.y, r:e.r+2, life:20, maxLife:20, col:(TYPE_COLOR[e.eType]||{}).body||'#ffffff' });
								S.partnerXP++;
								if (S.partnerLevel<2 && S.partnerXP>=8) { S.partnerLevel=2; showToast(S.partnerNickname+' reached Lv.2!'); try { Sound.evolve && Sound.evolve(); } catch(_) {} }
								else if (S.partnerLevel<3 && S.partnerXP>=20) { S.partnerLevel=3; showToast(S.partnerNickname+' reached Lv.3!'); try { Sound.evolve && Sound.evolve(); } catch(_) {} }
								if (S.relics.indexOf("shellbell") >= 0 && S.kills % 4 === 0) S.hp = Math.min(S.maxHp, S.hp + 1);
								if (!e.boss && !e.miniboss && Math.random() < 0.2) S.pickups.push({ x: e.x, y: e.y, kind: "heart", r: 8, bob: 0 });
								if (e.elite && !e.boss) S.pickups.push({ x: e.x+10, y: e.y, kind: "heart", r: 8, bob: 2 });
								if (e.held === 'berries') S.pickups.push({ x: e.x, y: e.y+10, kind: 'heart', r: 8, bob: Math.random()*5 });
								try { Sound.plant && Sound.plant(); } catch(_) {}
							}
							const _pCol = e.hp <= 0 ? ((TYPE_COLOR[e.eType] || {}).body || '#ffd060') : '#ffffff';
							for (let _k = 0; _k < 5; _k++) S.fx.push({ x: b.x, y: b.y, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4, life: 9 + Math.random()*6, col: _pCol });
							// Pierce logic
							if (b.pierce && (b.pierceHits||0) < 3) {
								b.pierceHits = (b.pierceHits||0) + 1;
								hit = false; // don't remove bullet
							}
							break;
						}
					}
					if (hit) S.bullets.splice(i, 1);
				}
				S.enemies = S.enemies.filter(e => e.hp > 0);
				// Process hazards
				if (S.hazards) {
					for (let hi = S.hazards.length-1; hi >= 0; hi--) {
						const hz = S.hazards[hi];
						hz.life--;
						hz.tickCd = (hz.tickCd||0) - 1;
						if (hz.tickCd <= 0) {
							hz.tickCd = 40;
							for (const e of S.enemies) {
								if ((e.x-hz.x)**2+(e.y-hz.y)**2 < (e.r+hz.r)**2) {
									e.hp -= hz.dmg; e.hurt = 6;
									if (e.eStatuses && hz.type==='fire' && !(e.eStatuses.burn>0)) e.eStatuses.burn=120;
								}
							}
						}
						if (hz.life <= 0) S.hazards.splice(hi, 1);
					}
				}
				for (const e of S.enemies) {
					if (e.hurt > 0) e.hurt--;
					if (e.critFlash > 0) e.critFlash--;
					if (e.marked > 0) e.marked--;
					// Status effects tick
					if (e.eStatuses) {
						if (e.eStatuses.burn > 0) { if (S.tick % 60 === 0) { e.hp--; e.hurt=4; } e.eStatuses.burn--; }
						if (e.eStatuses.poison > 0) { if (S.tick % 50 === 0) { e.hp--; e.hurt=4; } e.eStatuses.poison--; }
						if (e.eStatuses.slow > 0) e.eStatuses.slow--;
						if (e.eStatuses.para > 0) e.eStatuses.para--;
					}
					// Enemy movement by moveMode
					const _dx = S.px - e.x, _dy = S.py - e.y;
					const _dist = Math.hypot(_dx, _dy) || 1;
					const _da = Math.atan2(_dy, _dx);
					// Speed multipliers from global effects and curses
					const frozenMult = (S.frozenField > 0 ? 0.4 : 1);
					const statusSlowMult = (e.eStatuses && e.eStatuses.slow > 0 ? 0.4 : 1);
					const fastFoesMult = (S.curses && S.curses.includes('fast_foes') ? 1.3 : 1);
					const paraMult = (e.eStatuses && e.eStatuses.para > 0 && Math.random()<0.3) ? 0 : 1;
					const spdMult = frozenMult * statusSlowMult * fastFoesMult * paraMult;
					const effSpd = e.spd * spdMult;
					// Miniboss special logic
					if (e.miniboss) {
						const mbk = e.mbKey;
						if (mbk === 'shield') {
							e.shieldAngle = (e.shieldAngle||0) + 0.04;
						}
						if (mbk === 'split' && !e._split && e.hp <= e.maxHp * 0.5) {
							e._split = true;
							for (let _s = 0; _s < 2; _s++) {
								const sh = Math.ceil(e.hp * 0.5);
								S.enemies.push({ x:e.x+(_s?15:-15), y:e.y, hp:sh, maxHp:sh, r:9,
									miniboss:false, boss:false, shooter:false, cd:40, spd:e.spd*1.2,
									hurt:0, eType:e.eType, held:null, heldUsed:false, moveMode:'charger',
									attackPat:'straight', zigTimer:0, burstQueue:0, shellHp:0, eStatuses:{} });
							}
						}
						if (mbk === 'charger') {
							e.chargeTimer = (e.chargeTimer||0) + 1;
							if (e.chargeTimer >= 180 && !e.charging) {
								e.charging = 30;
								e.chargeVx = Math.cos(Math.atan2(S.py-e.y,S.px-e.x)) * 5;
								e.chargeVy = Math.sin(Math.atan2(S.py-e.y,S.px-e.x)) * 5;
								e.chargeTimer = 0;
							}
							if (e.charging > 0) {
								e.x += e.chargeVx; e.y += e.chargeVy; e.charging--;
								e.x = Math.max(WALL + e.r, Math.min(W - WALL - e.r, e.x));
								e.y = Math.max(WALL + e.r, Math.min(H - WALL - e.r, e.y));
								if (e.hurt > 0) e.hurt--;
								// skip regular movement
								if ((e.x - S.px) ** 2 + (e.y - S.py) ** 2 < (e.r + 7) ** 2 && S.invuln <= 0 && S.barrier <= 0) {
									if (S.relics.indexOf('thorns') >= 0) { const thDmg = (S.synergies && S.synergies.has('ironbarbs')) ? 2 : 1; e.hp -= thDmg; if(e.hp<=0&&!e._dead){e._dead=true;S.kills++;S.stardust+=(S.relics.indexOf('lucky')>=0?2:1);} }
									if (S.hp <= 1 && S.relics.indexOf('focus') >= 0 && !S._focusUsed && Math.random() < 0.2) {
										S._focusUsed = true; S.invuln = S.relics.indexOf("guard")>=0?72:52; S.flash = 8;
									} else if (S.barrier <= 0) { if ((S.revivals||0)>0&&S.hp<=1){S.revivals--;S.hp=1;S.invuln=120;S.flash=12;showToast('💚 Revival Herb activated!');} else{S.hp--;} S.invuln = S.relics.indexOf("guard") >= 0 ? 72 : 52; S.flash = 8; S.shake = 8; }
								}
								continue;
							}
						}
					}
					const mm = e.moveMode || 'charger';
					if (mm === 'charger' || e.boss || e.miniboss) {
						e.x += Math.cos(_da) * effSpd; e.y += Math.sin(_da) * effSpd;
					} else if (mm === 'circler') {
						// Orbit player at ~90px, strafe sideways
						const targetDist = 90;
						const radialSpd = (_dist - targetDist) > 0 ? 0.7 : -0.7;
						const tangAngle = _da + Math.PI / 2;
						e.x += Math.cos(_da) * radialSpd + Math.cos(tangAngle) * effSpd;
						e.y += Math.sin(_da) * radialSpd + Math.sin(tangAngle) * effSpd;
					} else if (mm === 'zigzagger') {
						e.zigTimer = (e.zigTimer || 0) + 1;
						const zigOff = (Math.floor(e.zigTimer / 40) % 2 === 0 ? 0.6 : -0.6);
						const perpA = _da + Math.PI / 2;
						e.x += Math.cos(_da) * effSpd + Math.cos(perpA) * zigOff;
						e.y += Math.sin(_da) * effSpd + Math.sin(perpA) * zigOff;
					} else if (mm === 'retreater') {
						if (_dist < 55) {
							// Back away from player
							e.x -= Math.cos(_da) * effSpd;
							e.y -= Math.sin(_da) * effSpd;
						} else {
							e.x += Math.cos(_da) * effSpd * 0.7;
							e.y += Math.sin(_da) * effSpd * 0.7;
						}
					} else if (mm === 'flanker') {
						const flankA = _da + (70 * Math.PI / 180);
						e.x += Math.cos(flankA) * effSpd;
						e.y += Math.sin(flankA) * effSpd;
					} else {
						e.x += Math.cos(_da) * effSpd; e.y += Math.sin(_da) * effSpd;
					}
					// Clamp to room bounds
					e.x = Math.max(WALL + e.r, Math.min(W - WALL - e.r, e.x));
					e.y = Math.max(WALL + e.r, Math.min(H - WALL - e.r, e.y));
					if ((e.x - S.px) ** 2 + (e.y - S.py) ** 2 < (e.r + 7) ** 2 && S.invuln <= 0 && S.barrier <= 0) {
						if (S.relics.indexOf('thorns') >= 0) { const thDmg = (S.synergies && S.synergies.has('ironbarbs')) ? 2 : 1; e.hp -= thDmg; if(e.hp<=0&&!e._dead){e._dead=true;S.kills++;S.stardust+=(S.relics.indexOf('lucky')>=0?2:1);} }
						if (S.hp <= 1 && S.relics.indexOf('focus') >= 0 && !S._focusUsed && Math.random() < 0.2) {
							S._focusUsed = true; S.invuln = S.relics.indexOf("guard")>=0?72:52; S.flash = 8;
							if (S.synergies && S.synergies.has('luckybreak')) S.stardust += 8;
						} else {
							if ((S.revivals||0) > 0 && S.hp <= 1) { S.revivals--; S.hp = 1; S.invuln = 120; S.flash = 12; showToast('💚 Revival Herb activated!'); }
							else { S.hp--; S.invuln = S.relics.indexOf("guard") >= 0 ? 72 : 52; S.flash = 8; S.shake = 8; }
						}
						if (S.relics.indexOf('lum') < 0 && Math.random() < 0.15) {
							if (e.eType==='poison') applyStatus('poison', e.held==='toxic_orb'?360:180);
							else if (e.eType==='fire') applyStatus('burn',180);
							else if (e.eType==='psychic'||e.eType==='dark') applyStatus('para',120);
						}
					}
					if (e.shooter||e.boss||e.miniboss) {
						// Handle burst queue (fires one bullet per tick)
						if (e.burstQueue > 0) {
							e.burstQueue--;
							shoot(S.ebullets, e.x, e.y, S.px, S.py, 2.2, 1, '#ff5a7a');
						}
						e.cd--;
						if (e.cd <= 0) {
						if (e.boss) {
							const am = e.attackMode || 'dark';
							const ba = Math.atan2(S.py - e.y, S.px - e.x);
							if (am === 'dark') {
								for (const off of [-0.34, 0, 0.34]) { const aa = ba + off;
									const eb = { x: e.x, y: e.y, vx: Math.cos(aa) * 2.3, vy: Math.sin(aa) * 2.3, dmg: 1, col: "#9a4ad0", r: 3 };
									if (Math.random()<0.2) eb.statusPara = true;
									S.ebullets.push(eb); }
								S.ebullets.push({x:e.x,y:e.y,vx:Math.cos(ba)*1.6,vy:Math.sin(ba)*1.6,dmg:1,col:"#c070ff",r:3,homing:true});
								e.cd = 58;
							} else if (am === 'fire') {
								// Spinning ring of 8
								for (let k = 0; k < 8; k++) {
									const aa = (k / 8) * Math.PI * 2 + S.tick * 0.05;
									S.ebullets.push({x:e.x,y:e.y,vx:Math.cos(aa)*2.2,vy:Math.sin(aa)*2.2,dmg:1,col:"#ff7020",r:3,statusBurn:true});
								}
								e.cd = 80;
							} else if (am === 'ice') {
								// 4-directional cross + slow
								for (let k = 0; k < 4; k++) {
									const aa = (k / 4) * Math.PI * 2;
									S.ebullets.push({x:e.x,y:e.y,vx:Math.cos(aa)*1.8,vy:Math.sin(aa)*1.8,dmg:1,col:"#80d8ff",r:3,slow:true});
								}
								e.cd = 70;
							} else if (am === 'psychic') {
								// Teleport to random position, then burst of 6 homing
								if (S.tick % 180 < 5) {
									e.x = WALL+40+Math.random()*(W-2*WALL-80);
									e.y = WALL+40+Math.random()*(H-2*WALL-80);
								}
								for (let k = 0; k < 6; k++) {
									const aa = (k / 6) * Math.PI * 2;
									S.ebullets.push({x:e.x,y:e.y,vx:Math.cos(aa)*1.9,vy:Math.sin(aa)*1.9,dmg:1,col:"#ff80d0",r:3,homing:true});
								}
								e.cd = 65;
							} else if (am === 'poison') {
								// Radial cloud of 12
								for (let k = 0; k < 12; k++) {
									const aa = (k / 12) * Math.PI * 2;
									S.ebullets.push({x:e.x,y:e.y,vx:Math.cos(aa)*1.7,vy:Math.sin(aa)*1.7,dmg:1,col:"#80e040",r:3,statusPoison:true});
								}
								e.cd = 65;
							}
						} else if (e.miniboss) {
							e.spd = 1.4; e.cd = 80;
							// miniboss always uses burst attack
							if (!e.burstQueue) { e.burstQueue = 3; }
						} else {
							// Regular shooter: apply attackPat
							const ap = e.attackPat || 'straight';
							if (ap === 'burst' && !e.burstQueue) {
								e.burstQueue = 3;
								e.cd = 180 + Math.random() * 40;
							} else if (ap === 'spread') {
								const ba2 = Math.atan2(S.py - e.y, S.px - e.x);
								for (const off of [-0.38, 0, 0.38]) {
									S.ebullets.push({x:e.x,y:e.y,vx:Math.cos(ba2+off)*2.0,vy:Math.sin(ba2+off)*2.0,dmg:1,col:'#ff5a7a',r:3});
								}
								e.cd = 90 + Math.random() * 60;
							} else {
								shoot(S.ebullets, e.x, e.y, S.px, S.py, 2.0, 1, '#ff5a7a');
								e.cd = 90 + Math.random() * 70;
							}
						}
					} }
				}
				for (let i = S.ebullets.length - 1; i >= 0; i--) {
					const b = S.ebullets[i]; b.x += b.vx; b.y += b.vy;
					if (b.homing) { const ha=Math.atan2(S.py-b.y,S.px-b.x); b.vx+=Math.cos(ha)*0.14; b.vy+=Math.sin(ha)*0.14; }
					if (b.x < 0 || b.x > W || b.y < 0 || b.y > H) { S.ebullets.splice(i, 1); continue; }
					if ((b.x - S.px) ** 2 + (b.y - S.py) ** 2 < (b.r + 7) ** 2 && S.invuln <= 0) {
						if (S.barrier > 0) { S.ebullets.splice(i,1); continue; }
						const guardT = S.synergies && S.synergies.has('ironbarbs') ? 90 : (S.relics.indexOf("guard") >= 0 ? 72 : 52);
						if ((S.revivals||0) > 0 && S.hp <= 1) { S.revivals--; S.hp = 1; S.invuln = 120; S.flash = 12; showToast('💚 Revival Herb activated!'); }
						else { S.hp--; }
						S.invuln = guardT; S.flash = 8;
						try { Sound.chime && Sound.chime(); } catch(_) {}
						if (b.statusPara && S.relics.indexOf('lum')<0) applyStatus('para',120);
						if (b.statusBurn && S.relics.indexOf('lum')<0) applyStatus('burn',180);
						if (b.statusPoison && S.relics.indexOf('lum')<0) applyStatus('poison',180);
						S.ebullets.splice(i, 1);
					}
				}
				for (let i = S.pickups.length - 1; i >= 0; i--) {
					const p = S.pickups[i];
					if ((p.x - S.px) ** 2 + (p.y - S.py) ** 2 >= (p.r + 9) ** 2) continue;
					if ((p.kind === "shop" || p.kind === "reroll") && S.stardust < (p.cost||10)) continue;
					let fxCol = "#9effa0";
					if (p.kind === "heart") S.hp = Math.min(S.maxHp, S.hp + 1);
					else if (p.kind === "maxhp") { S.maxHp++; S.hp = S.maxHp; }
					else if (p.kind === "rapid") S.rapid = true;
					else if (p.kind === "relic") {
						if (p.relic) { S.relics.push(p.relic); if (p.relic === "swift") S.rapid = true;
							showToast("Relic: " + RELICS[p.relic].name + " \u2014 " + RELICS[p.relic].desc);
							checkSynergies();
							try { Sound.spin && Sound.spin(); } catch(_) {}
						}
						fxCol = "#ffe060";
					} else if (p.kind === "restpad") {
						S.hp = S.maxHp; S.energy = S.maxEnergy; S.berryUsed = false; fxCol = "#7ad0ff";
					} else if (p.kind === "reroll") {
						if (S.relics.length > 0) {
							S.stardust -= 10;
							const swapIdx = Math.floor(Math.random()*S.relics.length);
							const old = S.relics[swapIdx];
							const newR = randomRelic(S.relics.filter((_,ii)=>ii!==swapIdx));
							if (newR) { S.relics[swapIdx]=newR; showToast("Rerolled "+RELICS[old].name+" \u2192 "+RELICS[newR].name); }
						}
						fxCol = "#c0a0ff";
					} else if (p.kind === "shop") {
						S.stardust -= p.cost;
						if (p.item === "heal") S.hp = Math.min(S.maxHp, S.hp + 3);
						else if (p.item === "energy") S.energy = S.maxEnergy;
						else if (p.item === "relic" && p.relic) { S.relics.push(p.relic); if (p.relic === "swift") S.rapid = true;
							showToast("Bought relic: " + RELICS[p.relic].name); checkSynergies(); try { Sound.spin && Sound.spin(); } catch(_) {} }
						fxCol = "#ffd24a";
					}
					for (let k = 0; k < 10; k++) S.fx.push({ x: p.x, y: p.y, vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5, life: 14, col: fxCol });
					S.pickups.splice(i, 1);
				}
				if (S.enemies.length === 0 && !S._roomOverlay && !S._trainerBattle) {
					S.doorOpen = true;
					if (S._ambushRoom && !S._ambushDropped) {
						S._ambushDropped = true;
						const rk1 = randomRelic(S.relics); const rk2 = randomRelic([...S.relics, rk1||'']);
						if (rk1) S.pickups.push({x:W/2-40,y:H/2,kind:'relic',relic:rk1,r:11,bob:0});
						if (rk2) S.pickups.push({x:W/2+40,y:H/2,kind:'relic',relic:rk2,r:11,bob:2});
						S.stardust += 8;
					}
					if (S.py < WALL + 12 && Math.abs(S.px - W / 2) < 14) {
						S.room++;
						try { Sound.door && Sound.door(); } catch(_) {}
						if (S.room > MAX_ROOM) {
							if (!S._endlessChoiceShown) {
								S._endlessChoiceShown = true;
								S.doorOpen = false; // prevent re-triggering every tick
								S.py = WALL + 20;   // push player away from door threshold
								showEndlessChoice();
							}
						} else { newRoom(); S.px = W / 2; S.py = H - 40; }
					}
				}
				if (S.hp <= 0) {
					if ((S.revivals||0) > 0) { S.revivals--; S.hp = 1; S.invuln = 120; S.flash = 12; showToast('💚 Revival Herb activated!'); }
					else if (S.relics.indexOf('focus') >= 0 && !S._focusUsed && Math.random() < 0.2) {
						S._focusUsed = true; S.hp = 1; S.invuln = 90;
					} else { S.result = 'lose'; }
				}
			}
			// Zoom factor: scales the game world up so the camera stays tight
			// around the player even on large/hi-DPI viewports.
			const DUNGEON_ZOOM = 2.0;
			function draw() {
				const t = S.tick;
				// Effective viewport in game-world units
				const evw = VW / DUNGEON_ZOOM, evh = VH / DUNGEON_ZOOM;
				// camera follows the player, clamped to the room bounds
				let camX = Math.max(0, Math.min(W - evw, S.px - evw / 2));
				let camY = Math.max(0, Math.min(H - evh, S.py - evh / 2));
				// Screen shake
				if (S.shake > 0) {
					const shk = S.shake * 0.6;
					camX += (Math.random() - 0.5) * shk;
					camY += (Math.random() - 0.5) * shk;
					S.shake--;
				}
				ctx.fillStyle = "#0e0b16"; ctx.fillRect(0, 0, VW, VH);
				ctx.save();
				ctx.scale(DUNGEON_ZOOM, DUNGEON_ZOOM);
				ctx.translate(-camX, -camY);
				// floor — dungeon stone tiles
				for (let y = WALL; y < H - WALL; y += 16) {
					for (let x = WALL; x < W - WALL; x += 16) {
						const v = ((x * 7 + y * 13) >> 4) % 3;
						ctx.fillStyle = ["#272036", "#221c30", "#2c2540"][v];
						ctx.fillRect(x, y, 16, 16);
						ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.fillRect(x, y, 16, 1); ctx.fillRect(x, y, 1, 16);
						ctx.fillStyle = "rgba(255,255,255,0.035)"; ctx.fillRect(x + 1, y + 15, 15, 1);
					}
				}
				// Corner stones — darkened squares at the 4 corners of the playable area
				ctx.fillStyle = 'rgba(0,0,0,0.38)';
				ctx.fillRect(WALL, WALL, 24, 24); ctx.fillRect(W-WALL-24, WALL, 24, 24);
				ctx.fillRect(WALL, H-WALL-24, 24, 24); ctx.fillRect(W-WALL-24, H-WALL-24, 24, 24);
				ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
				[[WALL,WALL],[W-WALL-24,WALL],[WALL,H-WALL-24],[W-WALL-24,H-WALL-24]].forEach(([cx,cy]) => {
					ctx.strokeRect(cx+1, cy+1, 22, 22);
				});
				// Centre floor marking — subtle diamond
				const cx2 = W/2, cy2 = H/2, cr = 22;
				ctx.globalAlpha = 0.09; ctx.strokeStyle = '#a090c0'; ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.moveTo(cx2, cy2-cr); ctx.lineTo(cx2+cr, cy2);
				ctx.lineTo(cx2, cy2+cr); ctx.lineTo(cx2-cr, cy2); ctx.closePath(); ctx.stroke();
				ctx.globalAlpha = 1; ctx.lineWidth = 1;
				// walls — stone bricks
				const brick = (bx, by, bw, bh) => {
					for (let y = by; y < by + bh; y += 8) {
						const off = ((y / 8) % 2) * 8;
						for (let x = bx - 8; x < bx + bw; x += 16) {
							const px = x + off;
							ctx.fillStyle = "#4a4068"; ctx.fillRect(px, y, 16, 8);
							ctx.fillStyle = "#5a4f80"; ctx.fillRect(px + 1, y + 1, 14, 2);
							ctx.fillStyle = "#322a4a"; ctx.fillRect(px, y + 7, 16, 1); ctx.fillRect(px + 15, y, 1, 8);
						}
					}
				};
				brick(0, 0, W, WALL); brick(0, H - WALL, W, WALL);
				brick(0, 0, WALL, H); brick(W - WALL, 0, WALL, H);
				// door arch (top centre)
				const dx = W / 2;
				ctx.fillStyle = "#1a1426"; ctx.fillRect(dx - 15, 0, 30, WALL);
				if (S.doorOpen) {
					const gl = 0.5 + Math.sin(t * 0.15) * 0.25;
					ctx.fillStyle = "rgba(120,235,150," + gl.toFixed(2) + ")"; ctx.fillRect(dx - 12, 0, 24, WALL);
					ctx.fillStyle = "#d6ffd6"; ctx.font = "9px monospace"; ctx.textAlign = "center";
					ctx.fillText("\u25B2", dx, WALL - 4);
				} else {
					ctx.fillStyle = "#6a4a2a";
					for (let i = 0; i < 5; i++) ctx.fillRect(dx - 13 + i * 6, 2, 3, WALL - 4);
				}
				ctx.fillStyle = "#2a2240"; ctx.fillRect(dx - 16, 0, 3, WALL); ctx.fillRect(dx + 13, 0, 3, WALL);
				// soft shadows
				ctx.fillStyle = "rgba(0,0,0,0.34)";
				for (const e of S.enemies) { ctx.beginPath(); ctx.ellipse(e.x, e.y + e.r - 1, e.r, e.r * 0.42, 0, 0, 7); ctx.fill(); }
				ctx.beginPath(); ctx.ellipse(S.partner.x, S.partner.y + 6, 6, 3, 0, 0, 7); ctx.fill();
				ctx.beginPath(); ctx.ellipse(S.px, S.py + 7, 6, 3, 0, 0, 7); ctx.fill();
				// glowing projectiles
				const orb = (x, y, r, col) => {
					ctx.globalAlpha = 0.35; ctx.fillStyle = col;
					ctx.beginPath(); ctx.arc(x, y, r + 2.5, 0, 7); ctx.fill();
					ctx.globalAlpha = 1; ctx.fillStyle = col;
					ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
					ctx.fillStyle = "#ffffff";
					ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.42, 0, 7); ctx.fill();
				};
				// Bullet trails
				for (const b of S.bullets) {
					ctx.globalAlpha = 0.35;
					ctx.strokeStyle = b.col; ctx.lineWidth = 1.5;
					ctx.beginPath(); ctx.moveTo(b.x - b.vx * 4, b.y - b.vy * 4); ctx.lineTo(b.x, b.y); ctx.stroke();
					ctx.globalAlpha = 1; ctx.lineWidth = 1;
					orb(b.x, b.y, 3.2, b.col);
				}
				for (const b of S.ebullets) {
					ctx.globalAlpha = 0.3;
					ctx.strokeStyle = b.col; ctx.lineWidth = 1.2;
					ctx.beginPath(); ctx.moveTo(b.x - b.vx * 3, b.y - b.vy * 3); ctx.lineTo(b.x, b.y); ctx.stroke();
					ctx.globalAlpha = 1; ctx.lineWidth = 1;
					orb(b.x, b.y, 3, b.col);
				}
				// pickups
				for (const p of S.pickups) {
					const by = p.y + Math.sin((t + p.bob * 20) * 0.1) * 3;
					if (p.kind === "restpad") {
						ctx.globalAlpha = 0.3 + Math.sin(t * 0.08) * 0.12; ctx.fillStyle = "#7ad0ff";
						ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 7, 0, 7); ctx.fill();
						ctx.globalAlpha = 1;
						ctx.fillStyle = "#1c3850"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
						ctx.fillStyle = "#7ad0ff"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r - 4, 0, 7); ctx.fill();
						ctx.fillStyle = "#eaffff";
						ctx.fillRect(p.x - 2, p.y - 8, 4, 16); ctx.fillRect(p.x - 8, p.y - 2, 16, 4);
						continue;
					}
					if (p.kind === "shop") {
						ctx.fillStyle = "#241f3a"; ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
						ctx.fillStyle = "#ffd24a"; ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, 3);
						const gl = p.item === "heal" ? "#ff5a6a" : p.item === "energy" ? "#7ad0ff" : "#ffe060";
						ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(p.x, p.y - 1, 6, 0, 7); ctx.fill();
						ctx.fillStyle = "#1a1426"; ctx.font = "8px monospace"; ctx.textAlign = "center";
						ctx.fillText(p.item === "heal" ? "+" : p.item === "energy" ? "E" : "R", p.x, p.y + 2);
						ctx.fillStyle = "#ffd24a"; ctx.font = "7px monospace";
						ctx.fillText(p.cost + " SD", p.x, p.y + p.r + 9);
						continue;
					}
					const col = p.kind === "heart" ? "#ff4060" : p.kind === "rapid" ? "#ffd24a"
						: p.kind === "maxhp" ? "#ff8ad0" : "#ffe060";
					// glow aura
					ctx.globalAlpha = 0.3 + Math.sin(t * 0.14) * 0.12; ctx.fillStyle = col;
					ctx.beginPath(); ctx.arc(p.x, by, p.r + 5, 0, 7); ctx.fill();
					ctx.globalAlpha = 1;
					if (p.kind === "heart") {
						// Parametric heart shape
						ctx.save(); ctx.translate(p.x, by); ctx.scale(0.38, 0.38);
						ctx.beginPath();
						for (let ang = 0; ang <= Math.PI * 2; ang += 0.05) {
							const hx = 16 * Math.pow(Math.sin(ang), 3);
							const hy = -(13 * Math.cos(ang) - 5 * Math.cos(2*ang) - 2 * Math.cos(3*ang) - Math.cos(4*ang));
							ang === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
						}
						ctx.closePath();
						ctx.fillStyle = "#ff4060"; ctx.fill();
						ctx.fillStyle = "rgba(255,180,190,0.7)";
						ctx.beginPath(); ctx.ellipse(-3, -5, 3, 2, -0.5, 0, Math.PI*2); ctx.fill();
						ctx.restore();
					} else {
						ctx.fillStyle = "#1a1426"; ctx.beginPath(); ctx.arc(p.x, by, p.r, 0, 7); ctx.fill();
						ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, by, p.r - 2, 0, 7); ctx.fill();
						ctx.fillStyle = "#ffffff"; ctx.font = "9px monospace"; ctx.textAlign = "center";
						ctx.fillText(p.kind === "rapid" ? "F" : p.kind === "maxhp" ? "U" : "R", p.x, by + 3);
					}
				}
				// hazards
				if (S.hazards) {
					for (const hz of S.hazards) {
						const alpha = Math.min(1, hz.life / 40) * (0.5 + Math.sin(t*0.12)*0.15);
						ctx.globalAlpha = alpha;
						const hCol = hz.type === 'fire' ? '#ff6020' : '#80e0e0';
						const hg = ctx.createRadialGradient(hz.x, hz.y, 2, hz.x, hz.y, hz.r+4);
						hg.addColorStop(0, hCol);
						hg.addColorStop(1, 'rgba(0,0,0,0)');
						ctx.fillStyle = hg;
						ctx.beginPath(); ctx.arc(hz.x, hz.y, hz.r+4, 0, 7); ctx.fill();
						ctx.globalAlpha = 1;
					}
				}
				// enemies
				for (const e of S.enemies) {
					const hurt = e.hurt > 0 || e.critFlash > 0;
					const critGold = e.critFlash > 0;
					// Elite aura
					if (e.elite && !e.boss) {
						ctx.globalAlpha = 0.3 + Math.sin(t*0.15)*0.15;
						ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2.5;
						ctx.beginPath(); ctx.arc(e.x, e.y, e.r+5, 0, 7); ctx.stroke();
						ctx.globalAlpha = 1;
					}
					if (e.boss) {
						const by = e.y + Math.sin(t * 0.06) * 3;
						const bCol = e.bossColor || '#6a2a9a';
						// Lighter shade for highlight
						ctx.fillStyle = hurt ? "#ffffff" : "#1a0e26";
						ctx.beginPath(); ctx.moveTo(e.x - 14, by - 11); ctx.lineTo(e.x - 21, by - 27); ctx.lineTo(e.x - 6, by - 14); ctx.closePath(); ctx.fill();
						ctx.beginPath(); ctx.moveTo(e.x + 14, by - 11); ctx.lineTo(e.x + 21, by - 27); ctx.lineTo(e.x + 6, by - 14); ctx.closePath(); ctx.fill();
						ctx.fillStyle = hurt ? "#ffffff" : "#241038";
						ctx.beginPath(); ctx.arc(e.x, by, e.r + 2, 0, 7); ctx.fill();
						ctx.fillStyle = hurt ? "#ffffff" : bCol;
						ctx.beginPath(); ctx.arc(e.x, by, e.r, 0, 7); ctx.fill();
						ctx.globalAlpha = 0.6;
						ctx.fillStyle = "#ffffff";
						ctx.beginPath(); ctx.arc(e.x - 5, by - 5, e.r * 0.5, 0, 7); ctx.fill();
						ctx.globalAlpha = 1;
						ctx.fillStyle = "#ff3050";
						ctx.beginPath(); ctx.arc(e.x - 8, by - 2, 3.6, 0, 7); ctx.fill();
						ctx.beginPath(); ctx.arc(e.x + 8, by - 2, 3.6, 0, 7); ctx.fill();
						ctx.fillStyle = "#ffe0e0";
						ctx.beginPath(); ctx.arc(e.x - 8, by - 2, 1.5, 0, 7); ctx.fill();
						ctx.beginPath(); ctx.arc(e.x + 8, by - 2, 1.5, 0, 7); ctx.fill();
						ctx.fillStyle = "#1a0e26"; ctx.fillRect(e.x - 9, by + 8, 18, 3);
					} else if (e.miniboss) {
						const mCol = e.bossColor || '#4060c0';
						const by = e.y + Math.sin(t*0.08)*2;
						// Flash if charger charging
						const isFlashing = e.mbKey==='charger' && e.charging > 20;
						ctx.fillStyle = hurt||isFlashing ? "#ffffff" : "#1a1030";
						ctx.beginPath(); ctx.arc(e.x, by, e.r+2, 0, 7); ctx.fill();
						ctx.fillStyle = hurt||isFlashing ? "#ffffff" : mCol;
						ctx.beginPath(); ctx.arc(e.x, by, e.r, 0, 7); ctx.fill();
						ctx.globalAlpha = 0.5;
						ctx.fillStyle = "#ffffff";
						ctx.beginPath(); ctx.arc(e.x-3, by-3, e.r*0.4, 0, 7); ctx.fill();
						ctx.globalAlpha = 1;
						// Shield arcs
						if (e.mbKey === 'shield') {
							const sa = e.shieldAngle || 0;
							for (let k=0;k<3;k++) {
								const a0 = sa + k*Math.PI*2/3;
								ctx.strokeStyle = hurt ? '#ffffff' : '#c0d0ff';
								ctx.lineWidth = 3;
								ctx.globalAlpha = 0.8;
								ctx.beginPath(); ctx.arc(e.x, by, e.r+7, a0, a0+0.8); ctx.stroke();
								ctx.globalAlpha = 1;
							}
						}
						ctx.lineWidth = 1;
					} else if (e.shooter) {
						const bob = Math.sin(t * 0.1 + e.x) * 2;
						const ey = e.y + bob;
						ctx.fillStyle = hurt ? "#ffffff" : "#2a1830";
						ctx.beginPath(); ctx.moveTo(e.x, ey - 9); ctx.lineTo(e.x + 8, ey); ctx.lineTo(e.x, ey + 9); ctx.lineTo(e.x - 8, ey); ctx.closePath(); ctx.fill();
						ctx.fillStyle = hurt ? "#ffffff" : "#ff5a8a";
						ctx.beginPath(); ctx.arc(e.x, ey, 3.4, 0, 7); ctx.fill();
						ctx.fillStyle = "#ffd0e0"; ctx.beginPath(); ctx.arc(e.x, ey, 1.6, 0, 7); ctx.fill();
						// Aim preview when about to shoot
						if (e.cd < 22) {
							const aimA2 = Math.atan2(S.py - e.y, S.px - e.x);
							const aimProg = (22 - e.cd) / 22;
							// Glow halo
							ctx.globalAlpha = aimProg * 0.25;
							ctx.strokeStyle = '#ffaa00'; ctx.lineWidth = 5;
							ctx.beginPath(); ctx.moveTo(e.x, ey); ctx.lineTo(e.x + Math.cos(aimA2)*60, ey + Math.sin(aimA2)*60); ctx.stroke();
							// Core line
							ctx.globalAlpha = aimProg * 0.85;
							ctx.strokeStyle = aimProg > 0.7 ? '#ff2020' : '#ff8800';
							ctx.lineWidth = 1.5;
							ctx.beginPath(); ctx.moveTo(e.x, ey); ctx.lineTo(e.x + Math.cos(aimA2)*60, ey + Math.sin(aimA2)*60); ctx.stroke();
							ctx.globalAlpha = 1; ctx.lineWidth = 1;
						}
					} else {
						const sq = Math.sin(t * 0.18 + e.x) * 1.4;
						const rw = e.r + sq, rh = e.r - sq;
						const tc = TYPE_COLOR[e.eType] || TYPE_COLOR.poison;
						ctx.fillStyle = hurt ? "#ffffff" : tc.body;
						ctx.globalAlpha = hurt ? 1 : 0.55;
						ctx.beginPath(); ctx.ellipse(e.x, e.y, rw + 1, rh + 1, 0, 0, 7); ctx.fill();
						ctx.globalAlpha = 1;
						ctx.fillStyle = hurt ? "#ffffff" : tc.body;
						ctx.beginPath(); ctx.ellipse(e.x, e.y, rw, rh, 0, 0, 7); ctx.fill();
						ctx.fillStyle = hurt ? "#ffffff" : tc.hi;
						ctx.beginPath(); ctx.ellipse(e.x - 2, e.y - 2, rw * 0.4, rh * 0.4, 0, 0, 7); ctx.fill();
						ctx.fillStyle = "#ffffff";
						ctx.beginPath(); ctx.arc(e.x - 2.6, e.y - 1, 2.1, 0, 7); ctx.fill();
						ctx.beginPath(); ctx.arc(e.x + 2.6, e.y - 1, 2.1, 0, 7); ctx.fill();
						ctx.fillStyle = critGold ? "#ffd700" : tc.eye;
						ctx.beginPath(); ctx.arc(e.x - 2, e.y - 0.6, 1, 0, 7); ctx.fill();
						ctx.beginPath(); ctx.arc(e.x + 3.2, e.y - 0.6, 1, 0, 7); ctx.fill();
					}
					// HP mini-bar (non-boss)
					if (!e.boss && e.hp < e.maxHp) {
						const bx = e.x - 8, bby = e.y + e.r + 3;
						ctx.fillStyle = '#2a1828'; ctx.fillRect(bx, bby, 16, 2);
						ctx.fillStyle = e.hp/e.maxHp > 0.5 ? '#60d060' : '#d06030';
						ctx.fillRect(bx, bby, 16 * Math.max(0, e.hp/e.maxHp), 2);
					}
					// Status dots
					if (e.eStatuses) {
						let sx = e.x - 6, sy = e.y - e.r - 5;
						const statCols = { burn:'#ff7040', poison:'#c060e0', slow:'#80d0ff', para:'#f0d040' };
						for (const [sk, sc] of Object.entries(statCols)) {
							if (e.eStatuses[sk] > 0) { ctx.fillStyle = sc; ctx.beginPath(); ctx.arc(sx, sy, 2, 0, 7); ctx.fill(); sx += 5; }
						}
					}
					// Dark mark X above marked enemies
					if (e.marked > 0) {
						ctx.fillStyle = '#7020a0'; ctx.globalAlpha = 0.8 + Math.sin(t*0.2)*0.2;
						ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
						ctx.fillText('✕', e.x, e.y - e.r - 6);
						ctx.globalAlpha = 1;
					}
					// held item dot
					if (e.held && !e.heldUsed) {
						let hdCol = '#ff4444';
						if (e.held==='sitrus') hdCol = '#f0d040';
						else if (e.held==='berries') hdCol = '#80ff80';
						else if (e.held==='shell') hdCol = '#c0c0c0';
						else if (e.held==='toxic_orb') hdCol = '#c060e0';
						ctx.fillStyle = hdCol;
						ctx.beginPath(); ctx.arc(e.x + e.r - 2, e.y - e.r + 2, 3, 0, 7); ctx.fill();
						// Shell ring visualization
						if (e.held==='shell' && e.shellHp > 0) {
							ctx.strokeStyle = '#c0c0c0'; ctx.lineWidth = 1.5;
							ctx.globalAlpha = e.shellHp / 3;
							ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 4, 0, 7); ctx.stroke();
							ctx.globalAlpha = 1;
						}
					}
				}
				// partner Pokemon — real follower sprite when loaded, else drawn
				{
					const px = S.partner.x, py = S.partner.y + Math.sin(t * 0.12) * 1.5;
					let drew = false;
					if (dunImgPartner && dunPartnerMeta) {
						const m = dunPartnerMeta, cols = m.cols || 4, fw = m.frameW || 40, fh = m.frameH || 48;
						const aa = (((S.partnerAim || Math.PI / 2) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
						let row;
						if (aa < Math.PI / 4 || aa >= 7 * Math.PI / 4) row = 2;
						else if (aa < 3 * Math.PI / 4) row = 0;
						else if (aa < 5 * Math.PI / 4) row = 6;
						else row = 4;
						const fr = Math.floor(t / 12) % 2;
						const sc = 17 / fh, w = fw * sc, h = fh * sc;
						try { ctx.drawImage(dunImgPartner, (fr % cols) * fw, row * fh, fw, fh, px - w / 2, py - h + 6, w, h); drew = true; } catch (_e) {}
					}
					if (!drew) {
						const fl = Math.cos(S.partnerAim || 0) >= 0 ? 1 : -1;
						ctx.fillStyle = S.pColor;
						ctx.beginPath(); ctx.moveTo(px - 5, py - 3); ctx.lineTo(px - 7, py - 9); ctx.lineTo(px - 1, py - 5); ctx.closePath(); ctx.fill();
						ctx.beginPath(); ctx.moveTo(px + 5, py - 3); ctx.lineTo(px + 7, py - 9); ctx.lineTo(px + 1, py - 5); ctx.closePath(); ctx.fill();
						ctx.beginPath(); ctx.arc(px, py, 6.5, 0, 7); ctx.fill();
						ctx.fillStyle = "#ffffff";
						ctx.beginPath(); ctx.arc(px + fl * 1.6 - 2, py - 1, 1.9, 0, 7); ctx.fill();
						ctx.beginPath(); ctx.arc(px + fl * 1.6 + 2, py - 1, 1.9, 0, 7); ctx.fill();
						ctx.fillStyle = "#1a1020";
						ctx.beginPath(); ctx.arc(px + fl * 1.6 - 1.4, py - 1, 1, 0, 7); ctx.fill();
						ctx.beginPath(); ctx.arc(px + fl * 1.6 + 2.6, py - 1, 1, 0, 7); ctx.fill();
					}
					if (S.partnerMuzzle > 0) { ctx.fillStyle = "rgba(255,255,210,0.85)"; ctx.beginPath(); ctx.arc(px + Math.cos(S.partnerAim) * 8, py + Math.sin(S.partnerAim) * 8, 3.5, 0, 7); ctx.fill(); }
				}
				// player — real trainer sprite when loaded, else drawn
				if (!(S.invuln > 0 && (t >> 2) % 2)) {
					const px = S.px, py = S.py;
					let drew = false;
					if (dunImgPlayer) {
						const dir = Math.abs(S.faceX) > Math.abs(S.faceY) ? (S.faceX < 0 ? 1 : 3) : (S.faceY < 0 ? 2 : 0);
						const seq = [1, 0, 2, 0];
						const fr = S.moving ? seq[Math.floor(S.walkPhase) % 4] : 0;
						const sf = dir * 3 + fr;
						const sc = 0.6, w = 22 * sc, h = 38 * sc;
						try { ctx.drawImage(dunImgPlayer, (sf % 3) * 22, Math.floor(sf / 3) * 38, 22, 38, px - w / 2, py - h + 7, w, h); drew = true; } catch (_e) {}
					}
					if (!drew) {
						const bob = Math.abs(Math.sin(S.walkPhase)) * 1.5, py2 = py - bob, fl = S.faceX < 0 ? -1 : 1;
						ctx.fillStyle = "#3a2e6a"; ctx.fillRect(px - 4, py2 + 3, 3, 5); ctx.fillRect(px + 1, py2 + 3, 3, 5);
						ctx.fillStyle = "#5b8fd6"; ctx.fillRect(px - 5, py2 - 4, 10, 9);
						ctx.fillStyle = "#e8c79a"; ctx.fillRect(px - 4, py2 - 11, 8, 8);
						ctx.fillStyle = "#c8362f"; ctx.fillRect(px - 5, py2 - 13, 10, 4); ctx.fillRect(px - 4, py2 - 16, 8, 3);
						ctx.fillStyle = "#1a1020"; ctx.fillRect(px - 2 + fl, py2 - 8, 1.6, 2);
					}
					if (S.pMuzzle > 0) { ctx.fillStyle = "rgba(255,240,170,0.9)"; ctx.beginPath(); ctx.arc(px + Math.cos(S.pAim) * 11, py - 9 + Math.sin(S.pAim) * 11, 4, 0, 7); ctx.fill(); }
				}
				// Dodge availability ring
				if (!S.rollT) {
					const rollFill = S.rollCd > 0 ? 1 - S.rollCd / 50 : 1;
					const ringR = 10;
					ctx.globalAlpha = 0.55;
					// background ring
					ctx.strokeStyle = 'rgba(80,60,120,0.6)'; ctx.lineWidth = 1.5;
					ctx.beginPath(); ctx.arc(S.px, S.py + 7, ringR, 0, Math.PI * 2); ctx.stroke();
					// fill arc
					ctx.strokeStyle = rollFill >= 1 ? '#a0e8ff' : '#6060c0';
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.arc(S.px, S.py + 7, ringR, -Math.PI/2, -Math.PI/2 + rollFill * Math.PI * 2);
					ctx.stroke();
					ctx.globalAlpha = 1; ctx.lineWidth = 1;
				}
				// Sylveon barrier glow
				if (S.barrier > 0) {
					ctx.globalAlpha = 0.25 + Math.sin(S.tick*0.15)*0.1;
					const barrierGrad = ctx.createRadialGradient(S.px, S.py, 6, S.px, S.py, 22);
					barrierGrad.addColorStop(0,'rgba(255,180,220,0)');
					barrierGrad.addColorStop(1,'rgba(255,180,220,0.7)');
					ctx.fillStyle = barrierGrad; ctx.beginPath(); ctx.arc(S.px, S.py, 22, 0, 7); ctx.fill();
					ctx.globalAlpha = 1;
				}
				// particles + floating damage numbers
				for (const p of S.fx) {
					if (p.lightning) {
						// Jagged lightning line
						ctx.globalAlpha = Math.min(1, p.life / 6);
						ctx.strokeStyle = p.col || '#ffe060'; ctx.lineWidth = 1.5;
						const lx1=p.lx1, ly1=p.ly1, lx2=p.lx2, ly2=p.ly2;
						const segs=5; ctx.beginPath(); ctx.moveTo(lx1,ly1);
						for (let ls=1;ls<segs;ls++) {
							const fr=ls/segs;
							const ox=(lx1+(lx2-lx1)*fr)+((Math.random()-0.5)*12);
							const oy=(ly1+(ly2-ly1)*fr)+((Math.random()-0.5)*12);
							ctx.lineTo(ox,oy);
						}
						ctx.lineTo(lx2,ly2); ctx.stroke(); ctx.globalAlpha = 1;
					} else if (p.kind === 'ring') {
						const rProg = 1 - p.life / p.maxLife;
						ctx.globalAlpha = p.life / p.maxLife;
						ctx.strokeStyle = p.col;
						ctx.lineWidth = 2.5;
						ctx.beginPath();
						ctx.arc(p.x, p.y, p.r + rProg * 20, 0, Math.PI * 2);
						ctx.stroke();
						ctx.lineWidth = 1;
					} else if (p.dmgText) {
						const dAlpha = Math.min(1, p.life / 20);
						ctx.globalAlpha = dAlpha;
						const isCritDmg = p.col === '#ffd700';
						ctx.font = isCritDmg ? 'bold 12px monospace' : 'bold 10px monospace';
						ctx.textAlign = 'center';
						// drop shadow
						ctx.fillStyle = 'rgba(0,0,0,0.7)';
						ctx.fillText(p.dmgText, p.x + 1, p.y + 1);
						ctx.fillStyle = p.col;
						ctx.fillText(p.dmgText, p.x, p.y);
					} else {
						ctx.globalAlpha = Math.min(1, p.life / 9);
						ctx.fillStyle = p.col;
						const pr = Math.max(0.5, p.life * 0.18);
						ctx.beginPath(); ctx.arc(p.x, p.y, pr, 0, Math.PI * 2); ctx.fill();
					}
				}
				ctx.globalAlpha = 1;
				ctx.restore();
				// Fog modifier — darken beyond 130px circle around player
				if (S.modifier === 'fog') {
					const fogPX = S.px - (Math.max(0, Math.min(W - VW, S.px - VW / 2)));
					const fogPY = S.py - (Math.max(0, Math.min(H - VH, S.py - VH / 2)));
					const fogG = ctx.createRadialGradient(fogPX, fogPY, 90, fogPX, fogPY, 200);
					fogG.addColorStop(0, 'rgba(0,0,0,0)');
					fogG.addColorStop(0.65, 'rgba(0,0,0,0.55)');
					fogG.addColorStop(1, 'rgba(0,0,0,0.92)');
					ctx.fillStyle = fogG;
					ctx.fillRect(0, 0, VW, VH);
				}
				// vignette
				const vg = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.28, VW / 2, VH / 2, Math.max(VW, VH) * 0.72);
				vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.5)");
				ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
				// Room flash on transition
				if (S.roomFlash > 0) { ctx.fillStyle = 'rgba(255,255,255,'+(S.roomFlash/10)*0.4+')'; ctx.fillRect(0,0,VW,VH); S.roomFlash--; }
				// Room entry banner (fades in/out over 90 ticks)
				if (S.roomBanner > 0) {
					const bannerAlpha = S.roomBanner > 70 ? (90 - S.roomBanner) / 20 : Math.min(1, S.roomBanner / 30);
					const ROOM_LABELS = { combat:'⚔ Combat', boss:'💀 Boss Fight', miniboss:'🔥 Mini-Boss', treasure:'💎 Treasure Room', rest:'💙 Rest Room', shop:'🛒 Shop', puzzle:'🧩 Puzzle', shrine:'🌟 Shrine', trainer:'🎌 Trainer Battle', ambush:'⚠ Ambush!' };
					const label = ROOM_LABELS[S.roomType] || S.roomType;
					const roomNum = S.endlessLoop > 0 ? 'ENDLESS ×' + S.endlessLoop + ' — R' + S.room : 'ROOM ' + S.room + ' / ' + MAX_ROOM;
					ctx.globalAlpha = bannerAlpha * 0.85;
					ctx.fillStyle = 'rgba(10,8,22,0.9)';
					ctx.fillRect(VW * 0.1, VH / 2 - 22, VW * 0.8, 36);
					ctx.globalAlpha = bannerAlpha;
					ctx.fillStyle = '#ffe060'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
					ctx.fillText(label, VW / 2, VH / 2 - 5);
					ctx.fillStyle = '#8a7aaa'; ctx.font = '7px monospace';
					ctx.fillText(roomNum, VW / 2, VH / 2 + 9);
					ctx.globalAlpha = 1;
					S.roomBanner--;
				}
				if (S.comboKills >= 3) {
					const cAlpha = Math.min(1, S.comboTimer / 40);
					ctx.globalAlpha = cAlpha;
					const cScale = 1 + Math.sin(S.tick * 0.3) * 0.06;
					ctx.save(); ctx.translate(VW / 2, VH / 2 - 30); ctx.scale(cScale, cScale);
					ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
					ctx.fillStyle = '#000'; ctx.fillText('×' + S.comboKills + ' COMBO', 1, 1);
					ctx.fillStyle = S.comboKills >= 8 ? '#ff4040' : S.comboKills >= 5 ? '#ff9040' : '#ffe060';
					ctx.fillText('×' + S.comboKills + ' COMBO', 0, 0);
					ctx.restore(); ctx.globalAlpha = 1;
				}
				// HUD backing strips
				ctx.fillStyle = 'rgba(8,5,18,0.62)';
				ctx.fillRect(0, 0, VW, 44);           // top bar
				ctx.fillRect(0, VH - 28, VW, 28);     // bottom bar (relics)
				// HUD
				ctx.fillStyle = "rgba(10,8,18,0.7)"; ctx.fillRect(0, 0, VW, 16);
				// Subtle gradient border
				{ const hudGrad = ctx.createLinearGradient(0,0,VW,0); hudGrad.addColorStop(0,'rgba(180,100,255,0.0)'); hudGrad.addColorStop(0.5,'rgba(180,100,255,0.35)'); hudGrad.addColorStop(1,'rgba(180,100,255,0.0)'); ctx.fillStyle=hudGrad; ctx.fillRect(0,0,VW,2); }
				for (let i = 0; i < S.maxHp; i++) {
					const hx = 5 + i * 12, hy = 4, on = i < S.hp;
					ctx.fillStyle = on ? "#ff4d63" : "#332b48";
					ctx.fillRect(hx + 1, hy, 3, 2); ctx.fillRect(hx + 5, hy, 3, 2);
					ctx.fillRect(hx, hy + 2, 9, 3); ctx.fillRect(hx + 1, hy + 5, 7, 2); ctx.fillRect(hx + 3, hy + 7, 3, 1);
					if (on) { ctx.fillStyle = "#ff8a98"; ctx.fillRect(hx + 1, hy + 2, 2, 2); }
				}
				ctx.font = "8px monospace"; ctx.textAlign = "right";
				const roomLabel = S.endlessLoop > 0 ? ("END×" + S.endlessLoop + " R" + S.room) : ("ROOM " + S.room + "/" + MAX_ROOM);
				ctx.fillStyle = S.endlessLoop > 0 ? "#ff9040" : "#ffe060"; ctx.fillText(roomLabel, VW - 6, 11);
				ctx.textAlign = "center";
				if (S.roomType === "boss" && S.enemies.length) { ctx.fillStyle = "#ff7a8a"; ctx.fillText("BOSS FIGHT", VW / 2, 11); }
				else if (S.roomType === "treasure" && S.pickups.length) { ctx.fillStyle = "#9effa0"; ctx.fillText("TREASURE ROOM", VW / 2, 11); }
				else if (S.enemies.length) { ctx.fillStyle = "#c8a0ff"; ctx.fillText(S.enemies.length + " foes", VW / 2, 11); }
				else if (S.roomType === "rest") { ctx.fillStyle = "#7ad0ff"; ctx.fillText("REST ROOM", VW / 2, 11); }
				else if (S.roomType === "shop") { ctx.fillStyle = "#ffd24a"; ctx.fillText("SHOP", VW / 2, 11); }
				else { ctx.fillStyle = "#7ad07a"; ctx.fillText("CLEAR \u2014 GO UP", VW / 2, 11); }
				// floor progress bar (1..8, boss floors marked)
				for (let i = 1; i <= MAX_ROOM; i++) {
					const fx = VW / 2 - MAX_ROOM * 5 + (i - 1) * 10;
					const isBoss = (i === 4 || i === 9);
					ctx.fillStyle = i < S.room ? "#7ad07a" : i === S.room ? "#ffe060" : "#3a3158";
					if (isBoss && i >= S.room) ctx.fillStyle = i === S.room ? "#ff7a8a" : "#5a3045";
					ctx.fillRect(fx, 19, 8, 6);
				}
				// energy bar (partner special) + Stardust counter
				ctx.fillStyle = "#1a1830"; ctx.fillRect(6, 29, 92, 7);
				ctx.fillStyle = "#46c8e0"; ctx.fillRect(6, 29, 92 * Math.max(0, S.energy / S.maxEnergy), 7);
				ctx.strokeStyle = "#5a4a8a"; ctx.lineWidth = 1; ctx.strokeRect(6, 29, 92, 7);
				ctx.fillStyle = (S.energy >= 45 ? "#bff0fa" : "#6a7a90"); ctx.font = "6px monospace"; ctx.textAlign = "left";
				ctx.fillText("ENERGY \u2014 E", 9, 34.5);
				ctx.fillStyle = "#ffd24a"; ctx.font = "8px monospace"; ctx.textAlign = "right";
				ctx.fillText("⭐ " + S.stardust, VW - 6, 35);
				// Modifier label (top-center small)
				if (S.modifier) {
					const modDef = MODIFIERS.find(m => m.key === S.modifier);
					if (modDef) {
						const modColors = { fog:'#a0c0e0', frail:'#ff6060', horde:'#c060ff', blessed:'#ffe060', speedrun:'#ff9040' };
						ctx.font = "7px monospace"; ctx.textAlign = "center";
						let modLabel = modDef.icon + " " + modDef.name.toUpperCase();
						let modLabelColor = modColors[S.modifier] || '#c0a0ff';
						if (S.modifier === 'speedrun' && S.roomTimer > 0) {
							const secsLeft = Math.ceil(S.roomTimer / 60);
							modLabel += " " + secsLeft + "s";
							modLabelColor = secsLeft <= 10 ? "#ff4040" : '#ff9040';
						}
						ctx.fillStyle = modLabelColor;
						ctx.fillText(modLabel, VW / 2, 43);
					}
				}
				// Endless mode indicator
				if (S.endlessLoop > 0) {
					ctx.font = "6px monospace"; ctx.textAlign = "right";
					ctx.fillStyle = "#ff9040";
					ctx.fillText("ENDLESS ×" + S.endlessLoop, VW - 6, 43);
				}
				// Daily badge
				if (S.isDaily) {
					ctx.font = "6px monospace"; ctx.textAlign = "left";
					ctx.fillStyle = "#60c8ff";
					ctx.fillText("📅 DAILY", 6, 43);
				}
				// Relic strip
				if (S.relics && S.relics.length > 0) {
					const RELIC_ABBR = { shellbell:'🔔', lucky:'🥚', guard:'🛡', power:'💪', swift:'⚡', thorns:'🌵', focus:'🎯', magnet:'🧲', scope:'🔭', lum:'🍋', berries:'🍇', regen:'🍃', salve:'💊', choice:'🎗' };
					const rx = 6, ry = 58;
					ctx.font = '8px monospace'; ctx.textAlign = 'left';
					let xx = rx;
					for (const rk of S.relics) {
						const abbr = RELIC_ABBR[rk] || rk[0].toUpperCase();
						ctx.fillStyle = (S.synergies && [...S.synergies].some(s => {
							const synMap = { sniper:['power','scope'], regen_combo:['shellbell','regen'], bulletstorm:['magnet','swift'], ironbarbs:['thorns','guard'], luckybreak:['lucky','focus'] };
							return synMap[s] && synMap[s].indexOf(rk) >= 0;
						})) ? '#ffd700' : '#c0a0ff';
						ctx.fillText(abbr, xx, ry + 8);
						xx += 12;
					}
				}
				// Active curses pills
				if (S.curses && S.curses.length > 0) {
					let cx2 = 6; ctx.font = '6px monospace'; ctx.textAlign = 'left';
					for (const ck of S.curses) {
						const cd = CURSES.find(c=>c.key===ck);
						if (cd) { ctx.fillStyle = '#ff5050'; ctx.fillText(cd.icon+' '+cd.name.substring(0,8), cx2, 70); cx2 += 60; }
					}
				}
				// Partner info + level
				ctx.fillStyle = S.pColor; ctx.font = "7px monospace"; ctx.textAlign = "right";
				const _pnn = (S.partnerNickname||'Partner'); const _pnShort = _pnn.length > 10 ? _pnn.slice(0,9)+'…' : _pnn;
				ctx.fillText(_pnShort + " Lv." + (S.partnerLevel||1), VW - 6, 52);
				// Status indicators
				if (S.statuses) {
					let sx = 6; ctx.font = "7px monospace"; ctx.textAlign = "left";
					if (S.statuses.burn > 0)   { ctx.fillStyle = "#ff7040"; ctx.fillText("BRN", sx, 52); sx += 22; }
					if (S.statuses.poison > 0) { ctx.fillStyle = "#c060e0"; ctx.fillText("PSN", sx, 52); sx += 22; }
					if (S.statuses.para > 0)   { ctx.fillStyle = "#f0d040"; ctx.fillText("PAR", sx, 52); sx += 22; }
					if (S.statuses.sleep > 0)  { ctx.fillStyle = "#7090ff"; ctx.fillText("SLP", sx, 52); }
				}
				{ const boss = S.enemies.find(e => e.boss);
				  const mb = !boss && S.enemies.find(e => e.miniboss);
				  if (boss) {
					const bw = Math.min(VW - 36, 240), bx = (VW - bw) / 2, byy = 58;
					const arch = S.bossArchetype || BOSS_ARCHETYPES[0];
					ctx.fillStyle = "rgba(10,8,18,0.85)"; ctx.fillRect(bx - 3, byy - 2, bw + 6, 12);
					ctx.fillStyle = "#3a2030"; ctx.fillRect(bx, byy, bw, 8);
					ctx.fillStyle = arch.barColor || "#ff4d63"; ctx.fillRect(bx, byy, bw * Math.max(0, boss.hp / boss.maxHp), 8);
					ctx.strokeStyle = "#5a4a8a"; ctx.lineWidth = 1; ctx.strokeRect(bx, byy, bw, 8);
					ctx.fillStyle = "#ffffff"; ctx.font = "6px monospace"; ctx.textAlign = "center";
					ctx.fillText(arch.name || "BOSS", VW / 2, byy - 3);
				  } else if (mb) {
					const bw = Math.min(VW - 36, 200), bx = (VW - bw) / 2, byy = 70;
					const mbt = S.minibossType || MINIBOSS_TYPES[0];
					ctx.fillStyle = "rgba(10,8,18,0.85)"; ctx.fillRect(bx - 3, byy - 2, bw + 6, 12);
					ctx.fillStyle = "#3a2030"; ctx.fillRect(bx, byy, bw, 8);
					ctx.fillStyle = mbt.barColor || "#6080e0"; ctx.fillRect(bx, byy, bw * Math.max(0, mb.hp / mb.maxHp), 8);
					ctx.strokeStyle = "#5a4a8a"; ctx.lineWidth = 1; ctx.strokeRect(bx, byy, bw, 8);
					ctx.fillStyle = "#ffffff"; ctx.font = "6px monospace"; ctx.textAlign = "center";
					ctx.fillText(mbt.name || "MINI-BOSS", VW / 2, byy - 3);
				  } }
				// Trainer banner
				if (S._trainerBattle && S._trainerData) {
					ctx.fillStyle = "rgba(10,8,18,0.85)"; ctx.fillRect(0, 0, VW, 16);
					ctx.fillStyle = "#ffe060"; ctx.font = "8px monospace"; ctx.textAlign = "center";
					ctx.fillText(S._trainerData.emoji + " " + S._trainerData.name + " \u2014 team " + (S._trainerTeamIdx+1) + "/" + S._trainerData.team.length, VW/2, 11);
				}
				// CRIT floating text
				for (const p of S.fx) {
					if (p.crit && p.text) {
						ctx.globalAlpha = Math.min(1, p.life / 12);
						ctx.fillStyle = "#ffd700"; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
						ctx.fillText(p.text, p.x - camX, p.y - camY);
						ctx.globalAlpha = 1;
					}
				}
				if (S.result) {
					ctx.fillStyle = "rgba(6,4,12,0.8)"; ctx.fillRect(0, 0, VW, VH);
					ctx.textAlign = "center";
					const win = S.result === "win";
					ctx.fillStyle = win ? "#ffe060" : "#ff7a8a"; ctx.font = "15px monospace";
					ctx.fillText(win ? "TOWER CLEARED!" : "DEFEATED", VW / 2, VH / 2 - 12);
					ctx.fillStyle = "#cfc6ee"; ctx.font = "8px monospace";
					ctx.fillText("Rooms cleared: " + (S.room - 1), VW / 2, VH / 2 + 10);
					ctx.fillText("Tap LEAVE to collect rewards", VW / 2, VH / 2 + 26);
				}
				if (S.flash > 0) { ctx.fillStyle = "rgba(255,40,60," + (S.flash / 26) + ")"; ctx.fillRect(0, 0, VW, VH); }
			}
			function start() {
				ensure();
				fit();
				loadSprites();
				root.hidden = false;
				openFlag = true;
				if (raf) cancelAnimationFrame(raf);
				// Blank loop so root is visible during start screen
				S = null;
				showStartScreen();
			}
			// Curses — risk rooms offer a curse+relic trade
			const CURSES = [
				{ key:'glass',     icon:'💔', name:'Glass Cannon', desc:'-1 max HP, +2 dmg' },
				{ key:'slow_gun',  icon:'🐌', name:'Slow Trigger', desc:'Fire rate -30%' },
				{ key:'weak',      icon:'😰', name:'Weakened',     desc:'-1 shot damage min 1' },
				{ key:'fast_foes', icon:'💨', name:'Frenzy',       desc:'Enemies +30% faster' },
			];
			// Floor modifiers — one per run
			const MODIFIERS = [
				{ key:'fog',      icon:'🌫', name:'Foggy', desc:'Reduced visibility' },
				{ key:'frail',    icon:'💔', name:'Frail', desc:'-1 max HP, +5 Stardust/kill bonus' },
				{ key:'horde',    icon:'👾', name:'Horde', desc:'More enemies, but weaker' },
				{ key:'blessed',  icon:'✨', name:'Blessed', desc:'Start with 2 free relics' },
				{ key:'speedrun', icon:'⏱', name:'Speedrun', desc:'45s per room or lose 1 HP' },
			];
			// Relic synergy check
			function checkSynergies() {
				if (!S) return;
				if (!S.synergies) S.synergies = new Set();
				const r = S.relics;
				const has = k => r.indexOf(k) >= 0;
				const prev = new Set(S.synergies);
				const SYNERGY_NAMES = { sniper:'Sniper — Crit hits deal 2.5× dmg!', regen_combo:'Regen Combo — Heal faster!', bulletstorm:'Bulletstorm — Rapid homing fire!', ironbarbs:'Iron Barbs — Double thorn dmg!', luckybreak:'Lucky Break — Bonus Stardust on focus!' };
				// sniper: Power Band + Scope Lens
				if (has('power') && has('scope')) S.synergies.add('sniper'); else S.synergies.delete('sniper');
				// regen: Shell Bell + Leftovers
				if (has('shellbell') && has('regen')) S.synergies.add('regen_combo'); else S.synergies.delete('regen_combo');
				// bulletstorm: Magnet + Quick Claw/swift
				if (has('magnet') && has('swift')) S.synergies.add('bulletstorm'); else S.synergies.delete('bulletstorm');
				// ironbarbs: Thorn Coat + Guard Spec.
				if (has('thorns') && has('guard')) S.synergies.add('ironbarbs'); else S.synergies.delete('ironbarbs');
				// luckybreak: Lucky Egg + Focus Band
				if (has('lucky') && has('focus')) S.synergies.add('luckybreak'); else S.synergies.delete('luckybreak');
				// Toast newly activated synergies
				for (const key of S.synergies) {
					if (!prev.has(key) && SYNERGY_NAMES[key]) {
						showToast('✨ SYNERGY: ' + SYNERGY_NAMES[key]);
						try { Sound.chime && Sound.chime(); } catch(_) {}
					}
				}
			}
			function beginRun(form, nickname, isDaily) {
				hideAllOverlays();
				const perm = loadPerm();
				const startHpBonus = perm.startHp || 0;
				const startStarBonus = (perm.startStar || 0) * 8;
				// Pick random boss archetype and run modifier
				let chosenBoss, chosenMod;
				const todaySeedVal = (()=>{ const d=new Date(); return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate(); })();
				if (isDaily) {
					const rng = seededRand(todaySeedVal);
					chosenBoss = BOSS_ARCHETYPES[Math.floor(rng() * BOSS_ARCHETYPES.length)];
					chosenMod = MODIFIERS[Math.floor(rng() * MODIFIERS.length)];
				} else {
					chosenBoss = BOSS_ARCHETYPES[Math.floor(Math.random() * BOSS_ARCHETYPES.length)];
					chosenMod = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
				}
				const chosenMiniboss = MINIBOSS_TYPES[Math.floor(Math.random() * MINIBOSS_TYPES.length)];
				let baseHp = 6 + startHpBonus;
				if (chosenMod.key === 'frail') baseHp = Math.max(2, baseHp - 1);
				S = {
					room: 1, hp: baseHp, maxHp: baseHp, px: W / 2, py: H - 40,
					partner: { x: W / 2 - 15, y: H - 30 },
					pColor: formColor(form),
					novaColor: formNovaColor(form),
					partnerForm: form, partnerNickname: nickname || formDisplayName(form),
					partnerLevel: 1, partnerXP: 0,
					bullets: [], ebullets: [], enemies: [], fx: [], pickups: [], ptrail: [],
					hazards: [],
					fireCd: 0, partnerCd: 0, invuln: 0, doorOpen: false,
					faceX: 0, faceY: 1, pMuzzle: 0, partnerMuzzle: 0, walkPhase: 0,
					result: null, endTimer: 0, tick: 0, flash: 0, roomType: 'combat', rapid: false,
					energy: 60, maxEnergy: 100, novaCd: 0,
					stardust: startStarBonus, bonusDmg: 0,
					relics: [], kills: 0, comboKills: 0, comboTimer: 0, rollT: 0, rollCd: 0, rollVx: 0, rollVy: 0,
					tapDir: '', tapT: -99, ePrev: true,
					statuses: { burn:0, poison:0, para:0, sleep:0 },
					_roomOverlay: false, _pendingOverlay: null, _ambushRoom: false, _ambushDropped: false,
					_trainerBattle: false, _trainerData: null, _trainerTeamIdx: 0, _trainerOnDone: null,
					_focusUsed: false, _recapShown: false, berryUsed: false,
					bossArchetype: chosenBoss,
					minibossType: chosenMiniboss,
					modifier: chosenMod.key,
					synergies: new Set(),
					endlessLoop: 0,
					roomTimer: 0,
					shake: 0, hitStop: 0,
					roomBanner: 0,
					roomFlash: 0,
					frozenField: 0,
					barrier: 0,
					darkMark: 0,
					curses: [],
					isDaily: !!isDaily,
					dailySeed: isDaily ? todaySeedVal : 0,
					revivals: perm.revival || 0,
				};
				// Blessed modifier: start with 2 random relics
				if (chosenMod.key === 'blessed') {
					const r1 = randomRelic(S.relics);
					if (r1) { S.relics.push(r1); if (r1 === 'swift') S.rapid = true; }
					const r2 = randomRelic(S.relics);
					if (r2) { S.relics.push(r2); if (r2 === 'swift') S.rapid = true; }
					checkSynergies();
				}
				// Perm upgrade: startRelic
				const startRelicCount = perm.startRelic || 0;
				for (let _r = 0; _r < startRelicCount; _r++) {
					const rk = randomRelic(S.relics);
					if (rk) { S.relics.push(rk); if (rk==='swift') S.rapid=true; }
				}
				if (startRelicCount > 0) checkSynergies();
				loadSprites(form);
				newRoom();
				if (raf) cancelAnimationFrame(raf);
				loop();
			}
			function _doExit() {
				if (!openFlag) return;
				openFlag = false;
				if (raf) { cancelAnimationFrame(raf); raf = null; }
				if (root) root.hidden = true;
				const cleared = Math.max(0, (S ? S.room : 1) - 1);
				if (cleared > 0) {
					const inv = Inventory.load();
					const endlessLoopN = S ? (S.endlessLoop || 0) : 0;
					const tok = cleared * 6 + (S && S.result === 'win' ? 30 : 0) + (endlessLoopN * 20);
					const ber = Math.floor(cleared / 2);
					inv.tokens = (inv.tokens || 0) + tok;
					inv.friendshipBerries = (inv.friendshipBerries || 0) + ber;
					Inventory.save(inv);
					try { TrainerLevel.addXP('quest'); } catch (_) {}
					showToast('Tower run — ' + cleared + ' room' + (cleared === 1 ? '' : 's') + ' cleared · +' + tok + ' tokens' + (ber ? ', +' + ber + ' berries' : ''));
				}
				// Update best-run records
				if (S) {
					const best = loadBest();
					const depth = (S.endlessLoop||0)*9 + Math.max(0,(S.room||1)-1);
					if (depth > (best.depth||0)) best.depth = depth;
					if ((S.kills||0) > (best.kills||0)) best.kills = S.kills;
					if ((S.stardust||0) > (best.stardust||0)) best.stardust = S.stardust;
					if (((S.relics||[]).length) > (best.relics||0)) best.relics = S.relics.length;
					saveBest(best);
					if (S.isDaily) { best.lastDaily = S.dailySeed; saveBest(best); }
				}
			}
			function exit() { _doExit(); }
			let _loopLast = 0;
			const _STEP_MS = 1000 / 60;
			function loop(ts) {
				if (!openFlag) return;
				raf = requestAnimationFrame(loop);
				if (!S) return;
				// Cap logic to 60 fps regardless of display refresh rate
				if (ts - _loopLast >= _STEP_MS) {
					_loopLast += _STEP_MS;
					// If we fall more than 3 frames behind (tab was hidden etc.) skip catch-up
					if (ts - _loopLast > _STEP_MS * 3) _loopLast = ts;
					try { step(); } catch (e) { console.warn('[TowerDungeon step]', e); }
				}
				try { draw(); } catch (e) { console.warn('[TowerDungeon draw]', e); }
			}
			return { start, exit, isOpen: () => openFlag };
		})();
	window.CAMP_SYSTEMS.TowerDungeon = TowerDungeon;

	// ── Battle ────────────────────────────────────────────────────────
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
				// Dismiss mobile nav sheet so it can't block battle taps
				MobileBottomSheet.close();
			}
			function hideAll() {
				const root = $('campBattle');
				if (root) root.hidden = true;
			}
	
			function showIntro(onDone) {
				const enc = _currentEncounter;
				// Populate sprite + name
				const img = $('cbIntroSprite');
				if (img) { img.src = SPRITE_URL(enc.id); img.alt = enc.name; }
				const nameEl = $('cbIntroName');
				if (nameEl) nameEl.textContent = enc.name;
				// Re-trigger CSS animations (flash + poke entrance)
				['cbIntroFlash', 'cbIntroPoke'].forEach(id => {
					const el = $(id);
					if (!el) return;
					el.style.animation = 'none';
					void el.offsetWidth;
					el.style.animation = '';
				});
				show('intro');
				// Play cry after the flash peak
				setTimeout(() => Sound.cry(enc.id), 460);
				Music.start('battle');
				// Wire the "Battle!" button — clone to strip stale listeners
				const oldBtn = $('cbIntroBtn');
				if (oldBtn) {
					const fresh = oldBtn.cloneNode(true);
					oldBtn.parentNode.replaceChild(fresh, oldBtn);
					fresh.addEventListener('click', onDone, { once: true });
				}
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
				// Pre-reset wheel UI so it's ready when the intro transitions to it
				const disc = $('cbWheelDisc');
				if (disc) disc.style.transform = 'rotate(0deg)';
				const wr = $('cbWheelResult');
				if (wr) { wr.hidden = true; wr.textContent = ''; }
				const sb = $('cbSpinBtn');
				if (sb) { sb.disabled = false; sb.textContent = 'Spin!'; }
				// Show encounter intro — player clicks "Battle!" to reach the wheel
				showIntro(() => show('wheel'));
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
					// Submit rhythm score to leaderboard
					try {
						const rhythmName = window.PokeUtil?.getPlayerName?.() || 'Trainer';
						const rhythmPid  = window.PokeUtil?.getPlayerId?.() || '';
						const rhythmScore = Math.max(1, rawBonus || 1);
						window.PokeUtil?.submitScore?.({ game: 'rhythm', name: rhythmName, score: rhythmScore, playerId: rhythmPid });
					} catch {}
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
	window.CAMP_SYSTEMS.Battle = Battle;

	// ── Partner ────────────────────────────────────────────────────────
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
				const _canEvo = !isEeveelution && dexNum && GEN1_EVOLUTIONS && GEN1_EVOLUTIONS[dexNum];
				const _evoName = _canEvo ? ((PMD_NAMES && PMD_NAMES[GEN1_EVOLUTIONS[dexNum]]) || ('#' + GEN1_EVOLUTIONS[dexNum])) : null;
				$('cpForm') && ($('cpForm').textContent = isEeveelution
					? (inv.eeveeForm === 'eevee' ? 'Stage 1 — can evolve' : 'Stage 2 — terminal evolution')
					: (_canEvo
						? 'Can evolve → ' + _evoName + ' · #' + String(dexNum).padStart(3, '0')
						: 'Walking partner · #' + String(dexNum).padStart(3, '0')));
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
					// Hint for non-Eevee Pokémon that can evolve via PC Box
					if (_canEvo && _evoName) infoLines.push(ico(ICO.bolt) + ' Evolve into ' + _evoName + ' — open <b>PC Box</b> → Evolve button');
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
				// Also close the partner picker if it is still open — e.g. if the user
				// presses ESC on the outer panel while the picker backdrop is still shown.
				const picker = document.getElementById('partnerPickerModal');
				if (picker) picker.remove();
				// If the nickname input (or any other input) is focused inside the panel,
				// hiding the panel won't fire focusout automatically in all browsers.
				// Explicit blur ensures _sceneKeyboard.enableGlobalCapture() is called.
				if (document.activeElement && root && root.contains(document.activeElement)) {
					document.activeElement.blur();
				}
				// Always restore Phaser keyboard capture when closing the panel.
				// The focusin/focusout bridge in camp.js only fires for INPUT/TEXTAREA,
				// so clicking the × button (a <button>) never triggers enableGlobalCapture.
				// Calling it unconditionally here ensures movement is never frozen.
				window.__CAMP_STATE?._sceneKeyboard?.enableGlobalCapture();
			}
			// isOpen() checks the actual DOM state rather than just the flag.
			// This means if campPartner is hidden for any reason the game will
			// never be incorrectly frozen — DOM truth beats flag state.
			function isOpen() {
				const root = $('campPartner');
				if (root && !root.hidden) return true;
				// Keep flag in sync if DOM says closed but flag is stale.
				if (openFlag) openFlag = false;
				return false;
			}
			// Evolve a wild (non-Eevee) partner in-place.
			// Called when max friendship is reached by berry-feeding — same UX trigger as Eevee.
			function _doWildEvolution(inv, companionKey, companionDex, nextEvoDex) {
				const _oldName = (PMD_NAMES && PMD_NAMES[companionDex]) || ('#' + companionDex);
				const _newName = (PMD_NAMES && PMD_NAMES[nextEvoDex]) || ('#' + nextEvoDex);
				// Update the active party slot's form
				const _ai = inv.partyActive || 0;
				const _slot = (inv.party || [])[_ai];
				if (_slot) _slot.form = nextEvoDex;
				// Update the top-level companion reference
				inv.companionForm = nextEvoDex;
				Inventory.save(inv);
				// Switch the follower sprite immediately
				window.__campScene?._switchFollower(nextEvoDex, { silent: true });
				// Mark Pokédex and XP
				if (typeof Pokedex !== 'undefined') Pokedex.markSeen(nextEvoDex);
				TrainerLevel.addXP('evolve');
				Achievements.unlock('firstEvol');
				// Flash overlay (same as Eevee evolution)
				const _fl = document.createElement('div');
				_fl.style.cssText = 'position:fixed;inset:0;z-index:9999;background:white;opacity:0;pointer-events:none;transition:opacity 0.18s';
				document.body.appendChild(_fl);
				setTimeout(() => { _fl.style.opacity = '0.9'; }, 50);
				setTimeout(() => { _fl.style.opacity = '0'; }, 320);
				setTimeout(() => { _fl.style.opacity = '0.5'; }, 520);
				setTimeout(() => { _fl.style.opacity = '0'; }, 720);
				setTimeout(() => { if (_fl.parentNode) _fl.remove(); }, 1400);
				showToast(ico(ICO.bolt) + ' ' + _oldName + ' evolved into ' + _newName + '!');
				setStatus(ico(ICO.bolt) + ' ' + _oldName + ' evolved into ' + _newName + '!', 'good');
				refresh();
			}

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
				// Feature 2: Floating reward
				showFloatingReward('+' + feedAmt + ' 🍓');
				// Feature 5: Friendship bar
				if (window.__campScene) showFriendshipBar(window.__campScene, feedAmt);

				// ── Non-Eevee evolution: same trigger as Eevee (max friendship + berry) ──
				const _ck = inv.companionForm;
				const _cd = dexFromKey(_ck);
				const _nextEvo = GEN1_EVOLUTIONS && typeof _cd === 'number' && GEN1_EVOLUTIONS[_cd];
				if (_nextEvo && inv.friendship >= FRIENDSHIP_MAX) {
					close();
					_doWildEvolution(inv, _ck, _cd, _nextEvo);
					return;
				}

				// ── Eevee evolution: needs max friendship (stone handled in scene) ──
				if (inv.friendship >= FRIENDSHIP_MAX && sceneRef && typeof sceneRef._triggerEvolution === 'function') {
					close();
					sceneRef._triggerEvolution();
				} else {
					// Companion name for the status message
					const _pName = _cd && PMD_NAMES ? PMD_NAMES[_cd] : null;
					const _partnerLabel = _pName || (FOLLOWER_FORMS[inv.eeveeForm || 'eevee'] || {}).displayName || 'Partner';
					setStatus(_partnerLabel + ' gobbled a berry. +' + feedAmt + ' Friendship!', 'good');
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

				// Outer backdrop + inner pk-modal
				const backdrop = document.createElement('div');
				backdrop.id = 'partnerPickerModal';
				backdrop.className = 'pk-backdrop';
				backdrop.style.zIndex = '200';
				const inner = document.createElement('div');
				inner.className = 'pk-modal';
				inner.style.cssText = 'max-width:460px;width:min(460px,96vw)';
				inner.innerHTML = '<div class="pk-modal-head">' +
					'<span class="pk-modal-title">' + ico(ICO.npc) + ' Choose Walking Partner</span>' +
					'<button class="pk-close" id="partnerPickerClose" type="button">' + ico(ICO.close) + '</button>' +
					'</div>' +
					'<div class="pk-modal-body" style="padding-top:10px">' +
					'<div id="partnerPickerGrid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;max-height:380px;overflow-y:auto;padding:2px 2px 8px"></div>' +
					'</div>';
				backdrop.appendChild(inner);
				backdrop.addEventListener('pointerdown', e => { if (e.target === backdrop) backdrop.remove(); });
				document.body.appendChild(backdrop);

				// Wire close button FIRST — always works even if grid build errors below
				document.getElementById('partnerPickerClose').addEventListener('click', () => backdrop.remove());

				try {
					const grid = document.getElementById('partnerPickerGrid');
					const inv = Inventory.load();
					// current companion: may be string key ('eevee','vaporeon'…) or numeric slotted key ('129:2')
					const current = inv.companionForm != null ? inv.companionForm : (inv.eeveeForm || 'eevee');
					const PICK_H = 44;
					const SPRITE_CDN = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

					function makeCell(key, label, isActive, dimmed) {
						// Compound keys like "129:2" encode dexId:slot — extract numeric dexId for lookups
						const numId = typeof key === 'number' ? key : parseInt(String(key).split(':')[0], 10);
						const form = FOLLOWER_FORMS ? (FOLLOWER_FORMS[key] || FOLLOWER_FORMS[numId]) : null;
						const cell = document.createElement('button');
						cell.type = 'button';
						cell.className = 'partner-pick-cell' + (isActive ? ' is-active' : '') + (dimmed ? ' is-unseen' : '');
						let spriteHTML;
						if (form && form.frameH) {
							// Use form.url for PMD CDN sprites; fall back to local sprite sheet for eeveelutions
							const spriteUrl = form.url || ('Pictures/sprites/' + form.sheet + '.png');
							const bScale = PICK_H / form.frameH;
							const bW = Math.round(form.frameW * form.cols * bScale);
							const bH = Math.round(form.frameH * 8 * bScale);
							const fW = Math.round(form.frameW * bScale);
							spriteHTML = '<div class="partner-pick-sprite" style="' +
								'background-image:url(' + spriteUrl + ');' +
								'background-size:' + bW + 'px ' + bH + 'px;' +
								'background-position:0 0;' +
								'width:' + fW + 'px;height:' + PICK_H + 'px"></div>';
						} else {
							// PokeAPI static fallback — use numId (never the raw compound key string)
							spriteHTML = '<img src="' + SPRITE_CDN + numId + '.png" style="width:' + PICK_H + 'px;height:' + PICK_H + 'px;image-rendering:pixelated" alt="">';
						}
						cell.innerHTML = spriteHTML + '<div class="partner-pick-name">' + (label || key) + '</div>';
						cell.addEventListener('click', () => {
							window.__campScene?._switchFollower(key);
							// Also sync eeveeForm for string eeveelution keys so the rest of the system stays consistent
							if (typeof key === 'string' && FOLLOWER_FORMS && FOLLOWER_FORMS[key]) {
								const _inv = Inventory.load();
								_inv.companionForm = key;
								_inv.eeveeForm = key;
								Inventory.save(_inv);
							}
							backdrop.remove();
							refresh();
						});
						return cell;
					}

					function addSectionLabel(text) {
						const lbl = document.createElement('div');
						lbl.style.cssText = 'grid-column:1/-1;font-size:7px;color:var(--pk-gold);letter-spacing:1px;padding:6px 0 2px;border-top:1px solid rgba(255,255,255,0.06);margin-top:2px';
						lbl.textContent = text;
						grid.appendChild(lbl);
					}

					// ── Section 1: Eevee & all eeveelutions (always available) ──
					const EEVEELUTIONS = ['eevee','vaporeon','jolteon','flareon','espeon','umbreon','leafeon','glaceon','sylveon'];
					const EEV_LABELS   = { eevee:'Eevee', vaporeon:'Vaporeon', jolteon:'Jolteon', flareon:'Flareon', espeon:'Espeon', umbreon:'Umbreon', leafeon:'Leafeon', glaceon:'Glaceon', sylveon:'Sylveon' };
					EEVEELUTIONS.forEach(key => {
						const isActive = current === key;
						grid.appendChild(makeCell(key, EEV_LABELS[key], isActive, false));
					});

					// ── Section 2: Caught Gen-1 Pokémon (numeric, full colour) ──
					const caughtList = (Pokedex && Pokedex.getCaught) ? Pokedex.getCaught() : [];
					const caughtArr  = Array.isArray(caughtList) ? caughtList.map(Number).filter(Boolean) : [];
					const caughtSet  = new Set(caughtArr);

					// Build per-species slot numbers for owned instances
					const speciesCount = {};
					caughtArr.forEach(id => { speciesCount[id] = (speciesCount[id] || 0) + 1; });
					const speciesSeen = {};
					const instances = [];
					caughtArr.forEach(dexId => {
						speciesSeen[dexId] = (speciesSeen[dexId] || 0);
						const slot = speciesSeen[dexId]++;
						instances.push({ dexId, slot, companionKey: dexId + ':' + slot, multipleOwned: speciesCount[dexId] > 1 });
					});

					if (instances.length > 0) {
						addSectionLabel('YOUR POKÉMON');
						instances.forEach(({ dexId, companionKey, slot, multipleOwned }) => {
							const form = FOLLOWER_FORMS ? FOLLOWER_FORMS[dexId] : null;
							const baseName = (form && form.displayName) || (PMD_NAMES && PMD_NAMES[dexId]) || ('#' + dexId);
							const label = baseName + (multipleOwned ? ' #' + (slot + 1) : '');
							const isActive = current === companionKey || (current === dexId);
							grid.appendChild(makeCell(companionKey, label, isActive, false));
						});
					}

					// ── Section 3: All 151 Gen-1 uncaught (dimmed) ──
					addSectionLabel('ALL GEN 1');
					for (let _d = 1; _d <= 151; _d++) {
						if (caughtSet.has(_d)) continue;
						const form = FOLLOWER_FORMS ? FOLLOWER_FORMS[_d] : null;
						const label = (form && form.displayName) || (PMD_NAMES && PMD_NAMES[_d]) || ('#' + _d);
						grid.appendChild(makeCell(_d, label, current === _d, true));
					}

				} catch (err) {
					const g = document.getElementById('partnerPickerGrid');
					if (g) g.innerHTML = '<div style="grid-column:1/-1;font-size:8px;color:var(--pk-muted);padding:16px 0;text-align:center">Could not load list — try again.</div>';
					console.error('[PartnerPicker]', err);
				}
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
	window.CAMP_SYSTEMS.Partner = Partner;

	// ── Contests ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.Contests = Contests;

	// ── Mart ────────────────────────────────────────────────────────
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
				const flashBtn = $('cmBuyFlash');
				if (flashBtn) { flashBtn.disabled = !!(inv.hasFlash)||(inv.tokens||0)<40; flashBtn.textContent = inv.hasFlash?'Owned':'Buy'; }
				$('cmFlashStatus') && ($('cmFlashStatus').textContent = inv.hasFlash ? '(owned)' : '');
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
				$('cmBuyFlash') && $('cmBuyFlash').addEventListener('click', () => {
					const inv = Inventory.load();
					if (inv.hasFlash) { setStatus('Already have Flash HM!'); return; }
					if ((inv.tokens||0) < 40) { setStatus('Need 40 ' + ico(ICO.token)); return; }
					inv.tokens -= 40;
					inv.hasFlash = true;
					Inventory.save(inv);
					setStatus('Got Flash HM! Brightens the cave when exploring.');
					Achievements.unlock('lightBringer');
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
	window.CAMP_SYSTEMS.Mart = Mart;

	// ── NpcCampers ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.NpcCampers = NpcCampers;

	// ── BerryTrader ───────────────────────────────────────────────────────────
		const BerryTrader = (() => {
			const TRADES = [
				{ give: { pecha: 5 }, receive: { oran: 3 }, msg: 'Trade 5 Pecha Berries for 3 Oran Berries' },
				{ give: { oran: 3 },  receive: { sitrus: 1 }, msg: 'Trade 3 Oran Berries for 1 Sitrus Berry' },
				{ give: { sitrus: 2 }, receive: { tokens: 20 }, msg: 'Trade 2 Sitrus Berries for 20 tokens' },
				{ give: { pecha: 10 }, receive: { friendshipBerries: 3 }, msg: 'Trade 10 Pecha for 3 Friendship Berries' },
			];
			function getTodayTrade() {
				const seed = Math.floor(Date.now() / 86400000);
				return TRADES[seed % TRADES.length];
			}
			function canAfford(inv, give) {
				return Object.entries(give).every(([k, v]) => (inv[k] || 0) >= v);
			}
			function doTrade() {
				const trade = getTodayTrade();
				const inv = Inventory.load();
				if (!canAfford(inv, trade.give)) { showToast('Not enough berries!'); return false; }
				Object.entries(trade.give).forEach(([k, v]) => { inv[k] = (inv[k]||0) - v; });
				Object.entries(trade.receive).forEach(([k, v]) => { inv[k] = (inv[k]||0) + v; });
				Inventory.save(inv);
				showToast('Trade complete!');
				return true;
			}
			function openTradeDialog(trade) {
				const give = Object.entries(trade.give).map(([k,v]) => v + ' ' + k).join(', ');
				const recv = Object.entries(trade.receive).map(([k,v]) => v + ' ' + k).join(', ');
				Dialog.open('Berry Merchant: "I\'ll trade you ' + recv + ' for your ' + give + '. Deal?"', [
					{ label: 'Accept', cb: () => doTrade() },
					{ label: 'No thanks', cb: () => {} },
				]);
			}
			function interact() { openTradeDialog(getTodayTrade()); }
			return { interact, getTodayTrade };
		})();
	window.CAMP_SYSTEMS.BerryTrader = BerryTrader;

	// ── Guestbook ─────────────────────────────────────────────────────────────
		const Guestbook = (() => {
			const KEY = 'pokequiz_guestbook';
			const MAX = 20;
			function load() { try { return JSON.parse(localStorage.getItem(KEY)||'[]'); } catch { return []; } }
			function save(entries) { try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch {} }
			function addEntry(name, message) {
				const entries = load();
				entries.unshift({ name: name.slice(0,20), msg: message.slice(0,100), ts: Date.now() });
				if (entries.length > MAX) entries.length = MAX;
				save(entries);
			}
			function open() {
				let panel = document.getElementById('guestbookPanel');
				if (!panel) {
					panel = document.createElement('div');
					panel.id = 'guestbookPanel';
					document.body.appendChild(panel);
					panel.addEventListener('pointerdown', e => { if(e.target===panel) panel.hidden=true; });
				}
				panel.hidden = false;
				render(panel);
			}
			function render(panel) {
				const entries = load();
				const name = (window.PokeUtil?.getPlayerName?.() || localStorage.getItem('pokequiz_trainer_name') || 'Trainer');
				panel.className = 'pk-backdrop';
				panel.innerHTML = '';
				const inner = document.createElement('div');
				inner.className = 'pk-modal';
				inner.innerHTML = '<div class="pk-modal-head"><span class="pk-modal-title">📖 GUESTBOOK</span>' +
					'<button id="gbClose" class="pk-close" type="button">✕</button></div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
				body.style.cssText = 'display:flex;flex-direction:column;gap:10px';
				// Write entry
				const writeRow = document.createElement('div');
				writeRow.style.cssText = 'display:flex;gap:6px';
				const input = document.createElement('input');
				input.type = 'text';
				input.maxLength = 100;
				input.placeholder = 'Leave a message…';
				input.style.cssText = 'flex:1;background:rgba(255,255,255,0.06);border:1px solid var(--pk-border);border-radius:6px;color:var(--pk-text);font-family:inherit;font-size:8px;padding:6px 8px';
				const submitBtn = document.createElement('button');
				submitBtn.className = 'pk-btn pk-btn-gold pk-btn-sm';
				submitBtn.textContent = 'Sign';
				submitBtn.addEventListener('click', () => {
					const msg = input.value.trim();
					if (!msg) return;
					addEntry(name, msg);
					input.value = '';
					render(panel);
				});
				writeRow.appendChild(input);
				writeRow.appendChild(submitBtn);
				body.appendChild(writeRow);
				// Entries
				if (entries.length === 0) {
					const empty = document.createElement('div');
					empty.style.cssText = 'font-size:8px;color:var(--pk-muted);text-align:center;padding:16px';
					empty.textContent = 'No messages yet. Be the first!';
					body.appendChild(empty);
				} else {
					entries.forEach(e => {
						const row = document.createElement('div');
						row.style.cssText = 'padding:8px 10px;border:1px solid var(--pk-border);border-radius:6px;background:rgba(255,255,255,0.03)';
						row.innerHTML = '<div style="font-size:7px;color:var(--pk-gold)">' + e.name + ' · ' + new Date(e.ts).toLocaleDateString() + '</div>' +
							'<div style="font-size:8px;color:var(--pk-text);margin-top:3px">' + e.msg.replace(/</g,'&lt;') + '</div>';
						body.appendChild(row);
					});
				}
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.getElementById('gbClose')?.addEventListener('click', () => { panel.hidden = true; });
			}
			return { open, addEntry, load };
		})();
	window.CAMP_SYSTEMS.Guestbook = Guestbook;

	// ── ShinyEncounters ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.ShinyEncounters = ShinyEncounters;

	// ── SeasonalEvents ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.SeasonalEvents = SeasonalEvents;

	// ── Market vendor shop inventories ───────────────────────────────────────────
	// Moved here from camp.js so MarketShop (below) can reference it.
	// ico() and ICO are both defined earlier in this IIFE.

	// Rotating weekly Move Tutor (changes every Monday, same week index as shop)
	const _WEEKLY_MOVES = [
		{ name: 'Hyper Beam',   gives: 'tokens', amount: 20, desc: '+20 tokens — raw power!' },
		{ name: 'Calm Mind',    gives: 'seeds',  amount: 3,  desc: '+3 Berry Seeds for your garden' },
		{ name: 'Swords Dance', gives: 'berries',amount: 8,  desc: '+8 Berries to share with your partner' },
		{ name: 'Agility',      gives: 'tokens', amount: 25, desc: '+25 tokens — speed-boost your stash' },
	];

	// Compute rotating weekly shop (changes every Monday)
	const _WEEK_IDX = (() => {
		const d = new Date(); d.setHours(0,0,0,0);
		d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // roll back to Monday
		return Math.floor(d.getTime() / 604800000) % 4;
	})();
	const _WEEKLY_CONFIGS = [
		{ title: "🌟 Wanderer's Stock",  items: [
			{ label: ico(ICO.gem)   + ' Shiny Stone',    cost: 45, action: 'buyStone',  key: 'shiny'               },
			{ label: ico(ICO.seed)  + ' Seed Trio',       cost: 12, action: 'cafeBuy', gives: 'seed',   amount: 3  },
			{ label: ico(ICO.berry) + ' Berry Haul',       cost: 20, action: 'cafeBuy', gives: 'berry',  amount: 10 },
		]},
		{ title: "🏔️ Cave Merchant",      items: [
			{ label: ico(ICO.snow)  + ' Ice Stone',       cost: 40, action: 'buyStone',  key: 'ice'                 },
			{ label: ico(ICO.berry) + ' Berry Basket',    cost: 18, action: 'cafeBuy', gives: 'berry',  amount: 8  },
			{ label: ico(ICO.token) + ' Token Boost',     cost: 25, action: 'cafeBuy', gives: 'tokens', amount: 35 },
		]},
		{ title: "🌿 Forest Trader",      items: [
			{ label: ico(ICO.tree)  + ' Leaf Stone',      cost: 40, action: 'buyStone',  key: 'leaf'                },
			{ label: ico(ICO.seed)  + ' Mega Seed Pack',  cost: 15, action: 'cafeBuy', gives: 'seed',   amount: 4  },
			{ label: ico(ICO.berry) + ' Berry Surplus',   cost: 22, action: 'cafeBuy', gives: 'berry',  amount: 12 },
		]},
		{ title: "⚡ Sky Merchant",       items: [
			{ label: ico(ICO.bolt)  + ' Thunder Stone',   cost: 40, action: 'buyStone',  key: 'thunder'             },
			{ label: ico(ICO.token) + ' Token Jackpot',   cost: 35, action: 'cafeBuy', gives: 'tokens', amount: 55 },
			{ label: ico(ICO.egg)   + ' Mystery Egg',     cost: 50, action: 'buyEgg'                               },
		]},
	];

	const MARKET_SHOPS = {
		general: {
			title: "Pikachu's Mart",
			items: [
				{ label: ico(ICO.seed)  + ' Berry Seed',        cost: 5,  action: 'buySeed' },
				{ label: ico(ICO.berry) + ' Sell 1 Berry',      sells: 10, action: 'sellBerry' },
				{ label: ico(ICO.berry) + ' Sell All Berries',  sells: 10, action: 'sellAllBerries' },
			],
		},
		berries: {
			title: 'Berry Stand',
			items: [
				{ label: ico(ICO.berry) + ' Sell 1 Berry',      sells: 10, action: 'sellBerry' },
				{ label: ico(ICO.berry) + ' Sell All Berries',  sells: 10, action: 'sellAllBerries' },
				{ label: ico(ICO.seed)  + ' Berry Seed',        cost: 5,  action: 'buySeed' },
			],
		},
		lottery: {
			title: '🎰 Daily Lottery',
			items: [
				{ label: ico(ICO.star) + ' Scratch Ticket (once/day)', cost: 5, action: 'buyLottery' }
			],
		},
		well: {
			title: '⛲ Wishing Well',
			items: [
				{ label: ico(ICO.sparkle) + ' Make a Wish (1 token, once/day)', cost: 1, action: 'makeWish' }
			],
		},
		weekly: { title: _WEEKLY_CONFIGS[_WEEK_IDX].title, items: _WEEKLY_CONFIGS[_WEEK_IDX].items },
		tutor: {
			title: '🥋 Move Tutor',
			items: [
				{ label: ico(ICO.sparkle) + ' Learn ' + _WEEKLY_MOVES[_WEEK_IDX].name + ' (once/week)', cost: 30, action: 'learnMove' },
			],
		},
		cosmetics: {
			title: 'Vaporeon Boutique',
			items: [
				{ label: ico(ICO.sparkle) + ' Sakura Wallpaper', cost: 15, action: 'buyWallpaper', key: 'sakura'  },
				{ label: ico(ICO.water)   + ' Ocean Wallpaper',  cost: 15, action: 'buyWallpaper', key: 'ocean'   },
				{ label: ico(ICO.tree)    + ' Forest Wallpaper', cost: 15, action: 'buyWallpaper', key: 'forest'  },
				{ label: ico(ICO.star)    + ' Dusk Wallpaper',   cost: 15, action: 'buyWallpaper', key: 'dusk'    },
				{ label: ico('circle-fill') + ' Red Accent',     cost: 20, action: 'buyAccent',    key: 'red'     },
				{ label: ico('circle-fill') + ' Blue Accent',    cost: 20, action: 'buyAccent',    key: 'blue'    },
				{ label: ico('circle-fill') + ' Green Accent',   cost: 20, action: 'buyAccent',    key: 'green'   },
			],
		},
		stones: {
			title: 'Umbreon Stone Vendor',
			items: [
				{ label: ico(ICO.fire)  + ' Fire Stone',    cost: 50, action: 'buyStone', key: 'fire'    },
				{ label: ico(ICO.bolt)  + ' Thunder Stone', cost: 50, action: 'buyStone', key: 'thunder' },
				{ label: ico(ICO.tree)  + ' Leaf Stone',    cost: 50, action: 'buyStone', key: 'leaf'    },
				{ label: ico(ICO.snow)  + ' Ice Stone',     cost: 50, action: 'buyStone', key: 'ice'     },
				{ label: ico(ICO.gem)   + ' Shiny Stone',   cost: 50, action: 'buyStone', key: 'shiny'   },
			],
		},
		pokecenter: {
			title: "Pokémon Center",
			items: [
				{ label: ico(ICO.heal)  + ' Heal Partner Pokémon', cost: 0, action: 'healPokemon' },
				{ label: ico(ICO.berry) + ' Complimentary Berry',  cost: 0, action: 'freeBerry'   },
			],
		},
		cafe: {
			title: "Jolteon's Café",
			items: [
				{ label: ico(ICO.curry) + ' Espresso Shot', cost: 8,  action: 'cafeBuy', gives: 'seed',   amount: 1 },
				{ label: ico(ICO.berry) + ' Bubble Tea',    cost: 10, action: 'cafeBuy', gives: 'berry',  amount: 3 },
				{ label: ico(ICO.berry) + ' Berry Cake',    cost: 15, action: 'cafeBuy', gives: 'berry',  amount: 5 },
				{ label: ico(ICO.seed)  + ' Herbal Tea',    cost: 18, action: 'cafeBuy', gives: 'seed',   amount: 2 },
				{ label: ico(ICO.berry) + ' Croissant',     cost: 5,  action: 'cafeBuy', gives: 'berry',  amount: 2 },
				{ label: ico(ICO.token) + ' Choco Bar',     cost: 12, action: 'cafeBuy', gives: 'tokens', amount: 8 },
				{ label: ico(ICO.egg)   + ' Pokémon Egg',   cost: 40, action: 'buyEgg' },
			],
		},
	};

	// ── MarketShop ────────────────────────────────────────────────────────
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
					// priceStr embeds an ico() <i> element, so render as HTML — using
					// textContent here would print the raw markup as literal text.
					lbl.innerHTML = it.label + priceStr;
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
					case 'buyLottery': {
						const today = new Date().toISOString().slice(0, 10);
						if (inv.lastLottery === today) { setStatus("Already played today! Come back tomorrow."); return; }
						if ((inv.tokens||0) < it.cost) { setStatus('Not enough tokens.'); return; }
						inv.tokens -= it.cost;
						inv.lastLottery = today;
						const roll = Math.random();
						let msg;
						if      (roll < 0.04) { inv.tokens = (inv.tokens||0) + 100; msg = '🎉 JACKPOT! +100 tokens!'; }
						else if (roll < 0.09) { const s = ['fire','thunder','leaf','ice','shiny'][Math.floor(Math.random()*5)]; inv.stone = s; msg = '✨ Rare! Won a ' + s.toUpperCase() + ' Stone!'; }
						else if (roll < 0.22) { inv.seeds = (inv.seeds||0) + 3; msg = '🌱 Won 3 Berry Seeds!'; }
						else if (roll < 0.47) { inv.tokens = (inv.tokens||0) + 25; msg = '💰 Won 25 tokens!'; }
						else if (roll < 0.74) { inv.friendshipBerries = (inv.friendshipBerries||0) + 5; msg = '🍇 Won 5 Berries!'; }
						else                  { inv.tokens = (inv.tokens||0) + 10; msg = '🎟️ Won 10 tokens. Try again tomorrow!'; }
						setStatus(msg);
						break;
					}
					case 'makeWish': {
						const today = new Date().toISOString().slice(0, 10);
						if (inv.lastWish === today) { setStatus('You already made a wish today!'); return; }
						if ((inv.tokens||0) < 1) { setStatus('You need at least 1 token.'); return; }
						inv.tokens -= 1;
						inv.lastWish = today;
						if (!inv.boosts) inv.boosts = {};
						const roll = Math.random();
						let msg;
						if      (roll < 0.15) { inv.friendshipBerries = (inv.friendshipBerries||0) + 3; msg = '🍇 The well grants 3 Berries!'; }
						else if (roll < 0.30) { inv.seeds = (inv.seeds||0) + 1; msg = '🌱 The well grants a Berry Seed!'; }
						else if (roll < 0.50) { inv.tokens = (inv.tokens||0) + 8; msg = '💰 The well returns 8 tokens — lucky!'; }
						else if (roll < 0.65) { inv.boosts.xpBoost = Date.now() + 30*60*1000; msg = '✨ Wish granted: +XP boost for 30 min!'; }
						else if (roll < 0.80) { inv.boosts.fastGrow = Date.now() + 60*60*1000; msg = '🌿 Wish granted: fast berry growth for 1 hr!'; }
						else                  { msg = '💧 The well ripples... nothing today. Try tomorrow.'; }
						setStatus(msg);
						break;
					}
					case 'learnMove': {
					const wKey = 'pokequiz_move_tutor_' + _WEEK_IDX;
					if (localStorage.getItem(wKey)) { setStatus('Already learned this week!'); return; }
					if ((inv.tokens||0) < 30) { setStatus('Need 30 tokens.'); return; }
					inv.tokens -= 30;
					const mv = _WEEKLY_MOVES[_WEEK_IDX];
					if (mv.gives === 'tokens')  { inv.tokens            = (inv.tokens||0)            + mv.amount; }
					if (mv.gives === 'seeds')   { inv.seeds             = (inv.seeds||0)             + mv.amount; }
					if (mv.gives === 'berries') { inv.friendshipBerries = (inv.friendshipBerries||0) + mv.amount; }
					localStorage.setItem(wKey, '1');
					setStatus('Learned ' + mv.name + '! ' + mv.desc);
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
	window.CAMP_SYSTEMS.MarketShop = MarketShop;

	// ── HallOfFame ────────────────────────────────────────────────────────
	const HallOfFame = (() => {
		let _fetching = false;
		function open() {
			if (_fetching) return;
			_fetching = true;
			Dialog.open('🏆 Fetching Hall of Fame…');
			fetch('/api/leaderboard?game=quiz&limit=5')
				.then(r => r.json())
				.then(data => {
					_fetching = false;
					const entries = (data.entries || []).slice(0, 5);
					if (!entries.length) { Dialog.open('The Hall of Fame is empty — be the first!'); return; }
					const medals = ['🥇','🥈','🥉','4.','5.'];
					const lines = ['🏆 HALL OF FAME', '─────────────'];
					entries.forEach((e, i) => {
						lines.push(medals[i] + ' ' + (e.name || 'Trainer') + ' — ' + (e.score || 0) + ' pts');
					});
					Dialog.open(lines.join('\n'));
				})
				.catch(() => { _fetching = false; Dialog.open('Rankings unavailable right now.'); });
		}
		return { open };
	})();
	window.CAMP_SYSTEMS.HallOfFame = HallOfFame;

	// ── ExpeditionBoard ────────────────────────────────────────────────────────
	const ExpeditionBoard = (() => {
		const KEY = 'pokequiz_expedition';
		const TIERS = [
			{ id: 'quick',   label: 'Quick Trip',  time: '1 hr',  ms: 60*60*1000,       cost: 8,  berries: 2,  seeds: 0, tokens: 8  },
			{ id: 'trek',    label: 'Trek',        time: '4 hrs', ms: 4*60*60*1000,     cost: 15, berries: 5,  seeds: 1, tokens: 18 },
			{ id: 'journey', label: 'Journey',     time: '8 hrs', ms: 8*60*60*1000,     cost: 20, berries: 10, seeds: 3, tokens: 30 },
		];
		function loadExp() { try { return JSON.parse(localStorage.getItem(KEY)||'null'); } catch { return null; } }
		function saveExp(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
		function fmtMs(ms) {
			if (ms <= 0) return 'Ready!';
			const h = Math.floor(ms/3600000), m = Math.floor((ms%3600000)/60000);
			return h > 0 ? h + 'h ' + m + 'm' : m + 'm';
		}
		let root = null, openFlag = false;
		function isOpen() { return openFlag; }
		function open() { if (openFlag) { close(); return; } openFlag = true; build(); }
		function close() { openFlag = false; if (root) { root.remove(); root = null; } }
		function build() {
			if (root) root.remove();
			const state = loadExp();
			const now = Date.now();
			root = document.createElement('div');
			root.style.cssText = 'position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7)';
			const box = document.createElement('div');
			box.style.cssText = 'background:linear-gradient(160deg,#1a2a40,#0d1a2e);border:2px solid #4a6fa5;border-radius:12px;padding:20px;min-width:280px;max-width:340px;color:#e8eaf0;font-family:inherit;text-align:center';
			const closeBtn = () => { const b = document.createElement('button'); b.textContent = 'Close'; b.style.cssText = 'margin-top:10px;padding:8px 20px;border:0;border-radius:8px;background:#2a3a52;color:#e8eaf0;cursor:pointer;font-family:inherit;display:block;margin:10px auto 0'; b.onclick = close; return b; };
			if (state && (now - state.startMs) < state.ms) {
				const tier = TIERS.find(t => t.id === state.id) || TIERS[0];
				const rem = state.ms - (now - state.startMs);
				box.innerHTML = '<div style="font-size:20px;margin-bottom:8px">🗺 Expedition Board</div><div style="color:#aec6e8;font-size:11px;margin-bottom:12px">Explorer on a ' + tier.label + '!</div><div style="font-size:28px;margin:10px 0">⏳</div><div style="font-size:13px;color:#ffd968">Returns in: ' + fmtMs(rem) + '</div><div style="font-size:10px;color:#6080a0;margin-top:6px">Haul: 🍇' + tier.berries + ' 🌱' + tier.seeds + ' 💰' + tier.tokens + '</div>';
				box.appendChild(closeBtn());
			} else if (state && (now - state.startMs) >= state.ms) {
				const tier = TIERS.find(t => t.id === state.id) || TIERS[0];
				box.innerHTML = '<div style="font-size:20px;margin-bottom:8px">🗺 Expedition Board</div><div style="color:#6dbe6d;font-size:12px;margin-bottom:12px">Your explorer has returned!</div><div style="font-size:28px;margin:10px 0">🎒</div><div style="font-size:11px;color:#aec6e8">Haul from ' + tier.label + ':</div><div style="font-size:13px;color:#ffd968;margin:8px 0">🍇 ' + tier.berries + ' · 🌱 ' + tier.seeds + ' · 💰 ' + tier.tokens + '</div>';
				const claim = document.createElement('button');
				claim.textContent = '🎒 Claim';
				claim.style.cssText = 'margin-top:10px;padding:10px 24px;border:0;border-radius:8px;background:linear-gradient(180deg,#ffd968,#d6a83a);color:#2a1e08;cursor:pointer;font-family:inherit;font-size:11px;display:block;margin:10px auto 0';
				claim.onclick = () => {
					const inv = Inventory.load();
					inv.friendshipBerries = (inv.friendshipBerries||0) + tier.berries;
					inv.seeds  = (inv.seeds||0)  + tier.seeds;
					inv.tokens = (inv.tokens||0) + tier.tokens;
					Inventory.save(inv);
					localStorage.removeItem(KEY);
					close();
					Dialog.open('🎒 Expedition complete!\n🍇 +' + tier.berries + ' Berries · 🌱 +' + tier.seeds + ' Seeds · 💰 +' + tier.tokens + ' Tokens');
				};
				box.appendChild(claim);
				box.appendChild(closeBtn());
			} else {
				box.innerHTML = '<div style="font-size:20px;margin-bottom:4px">🗺 Expedition Board</div><div style="color:#aec6e8;font-size:10px;margin-bottom:12px">Send your partner on an adventure!</div>';
				const statusEl = document.createElement('div');
				statusEl.style.cssText = 'font-size:11px;color:#ffd968;min-height:16px;margin-bottom:8px';
				box.appendChild(statusEl);
				TIERS.forEach(tier => {
					const row = document.createElement('div');
					row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 12px;margin-bottom:8px;background:rgba(255,255,255,0.05);border-radius:8px;border:1px solid rgba(74,111,165,0.3)';
					row.innerHTML = '<div><div style="font-size:12px">⏱ ' + tier.label + ' <span style=\"color:#666;font-size:10px\">' + tier.time + '</span></div><div style="font-size:10px;color:#6080a0">🍇' + tier.berries + ' 🌱' + tier.seeds + ' 💰' + tier.tokens + '</div></div>';
					const btn = document.createElement('button');
					btn.textContent = tier.cost + '🪙';
					btn.style.cssText = 'padding:7px 12px;border:0;border-radius:6px;background:linear-gradient(180deg,#ffd968,#d6a83a);color:#2a1e08;cursor:pointer;font-family:inherit;font-size:10px;white-space:nowrap';
					btn.onclick = () => {
						const inv = Inventory.load();
						if ((inv.tokens||0) < tier.cost) { statusEl.textContent = 'Need ' + tier.cost + ' tokens!'; return; }
						inv.tokens -= tier.cost;
						Inventory.save(inv);
						saveExp({ id: tier.id, startMs: Date.now(), ms: tier.ms });
						close();
						Dialog.open('🗺 ' + tier.label + ' started!\nYour explorer will return in ' + tier.time + '.');
					};
					row.appendChild(btn);
					box.appendChild(row);
				});
				box.appendChild(closeBtn());
			}
			root.appendChild(box);
			root.addEventListener('click', e => { if (e.target === root) close(); });
			document.body.appendChild(root);
		}
		return { open, close, isOpen };
	})();
	window.CAMP_SYSTEMS.ExpeditionBoard = ExpeditionBoard;

	// ── TreasureExcavation ────────────────────────────────────────────────────────
	const TreasureExcavation = (() => {
		const KEY = 'pokequiz_treasure';
		const DAILY_PICKS = 5, GW = 5, GH = 4;
		function todayStr() { return new Date().toISOString().slice(0, 10); }
		function newGrid() {
			return Array.from({ length: GW * GH }, () => {
				const r = Math.random();
				if (r < 0.05) return { type: 'tokens',  amount: 25, label: '💰25' };
				if (r < 0.15) return { type: 'tokens',  amount: 10, label: '💰10' };
				if (r < 0.30) return { type: 'berries', amount: 3,  label: '🍇×3' };
				if (r < 0.45) return { type: 'seeds',   amount: 1,  label: '🌱×1' };
				if (r < 0.55) return { type: 'tokens',  amount: 5,  label: '💰5'  };
				return { type: 'empty', label: '🪨' };
			});
		}
		function loadState() {
			try {
				const d = JSON.parse(localStorage.getItem(KEY)||'null');
				if (!d || d.date !== todayStr()) {
					const s = { date: todayStr(), grid: newGrid(), revealed: [], picks: 0 };
					localStorage.setItem(KEY, JSON.stringify(s));
					return s;
				}
				return d;
			} catch { return { date: todayStr(), grid: newGrid(), revealed: [], picks: 0 }; }
		}
		function saveState(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
		let root = null, openFlag = false, _s = null, picksEl = null, statusEl = null, gridEl = null;
		function isOpen() { return openFlag; }
		function open() { if (openFlag) { close(); return; } openFlag = true; _s = loadState(); render(); }
		function close() { openFlag = false; if (root) { root.remove(); root = null; } _s = null; }
		function render() {
			if (root) root.remove();
			root = document.createElement('div');
			root.style.cssText = 'position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7)';
			const box = document.createElement('div');
			box.style.cssText = 'background:linear-gradient(160deg,#1a1a2e,#0a1a0a);border:2px solid #4a7a4a;border-radius:12px;padding:20px;min-width:310px;color:#e8eaf0;font-family:inherit;text-align:center';
			const ttl = document.createElement('div'); ttl.style.cssText = 'font-size:20px;margin-bottom:4px'; ttl.textContent = '⛏ Excavation Site'; box.appendChild(ttl);
			picksEl = document.createElement('div'); picksEl.style.cssText = 'font-size:10px;color:#8aba8a;margin-bottom:4px'; box.appendChild(picksEl);
			statusEl = document.createElement('div'); statusEl.style.cssText = 'font-size:12px;color:#ffd968;min-height:16px;margin-bottom:10px'; box.appendChild(statusEl);
			gridEl = document.createElement('div'); gridEl.style.cssText = 'display:grid;grid-template-columns:repeat(' + GW + ',1fr);gap:4px;margin-bottom:14px'; box.appendChild(gridEl);
			const doneBtn = document.createElement('button'); doneBtn.textContent = 'Done'; doneBtn.style.cssText = 'padding:8px 24px;border:0;border-radius:8px;background:#2a3a52;color:#e8eaf0;cursor:pointer;font-family:inherit'; doneBtn.onclick = close; box.appendChild(doneBtn);
			root.appendChild(box);
			root.addEventListener('click', e => { if (e.target === root) close(); });
			document.body.appendChild(root);
			updatePicks(); buildGrid();
		}
		function updatePicks() { if (picksEl && _s) picksEl.textContent = 'Daily digs: ' + Math.max(0, DAILY_PICKS - _s.picks) + ' remaining'; }
		function buildGrid() {
			if (!gridEl || !_s) return;
			gridEl.innerHTML = '';
			_s.grid.forEach((cell, idx) => {
				const tile = document.createElement('button');
				const rev = _s.revealed.includes(idx);
				tile.style.cssText = 'width:52px;height:52px;border:0;border-radius:6px;font-size:15px;cursor:' + (rev ? 'default' : 'pointer') + ';font-family:inherit;background:' + (rev ? 'rgba(255,255,255,0.07)' : 'linear-gradient(180deg,#5c4420,#3a2810)') + ';color:' + (rev ? '#777' : '#d4a860');
				tile.textContent = rev ? cell.label : '🟫';
				if (!rev) tile.onclick = () => dig(idx);
				gridEl.appendChild(tile);
			});
		}
		function dig(idx) {
			if (!_s || _s.picks >= DAILY_PICKS) { if (statusEl) statusEl.textContent = 'No more digs today!'; return; }
			if (_s.revealed.includes(idx)) return;
			_s.revealed.push(idx); _s.picks++;
			saveState(_s);
			const cell = _s.grid[idx];
			const inv = Inventory.load();
			let msg = '';
			if (cell.type === 'tokens')  { inv.tokens            = (inv.tokens||0)            + cell.amount; msg = '💰 Found ' + cell.amount + ' tokens!'; }
			else if (cell.type === 'berries') { inv.friendshipBerries = (inv.friendshipBerries||0) + cell.amount; msg = '🍇 Found ' + cell.amount + ' berries!'; }
			else if (cell.type === 'seeds')   { inv.seeds             = (inv.seeds||0)             + cell.amount; msg = '🌱 Found a Berry Seed!'; }
			else { msg = '🪨 Just rocks here…'; }
			Inventory.save(inv);
			if (statusEl) statusEl.textContent = msg;
			updatePicks();
			const tiles = gridEl.querySelectorAll('button');
			if (tiles[idx]) {
				tiles[idx].textContent = cell.label;
				tiles[idx].style.background = 'rgba(255,255,255,0.07)';
				tiles[idx].style.color = '#777';
				tiles[idx].style.cursor = 'default';
				tiles[idx].onclick = null;
			}
		}
		return { open, close, isOpen };
	})();
	window.CAMP_SYSTEMS.TreasureExcavation = TreasureExcavation;

	// ── MysteryGift ────────────────────────────────────────────────────────
		const MysteryGift = (() => {
			// One-time redeemable codes (expires in YYYY-MM-DD format, inclusive)
			const CODES = {
				'POKECENTER25': { label: 'Poké Center Bonus',  gives: 'tokens', amount: 75,  expires: '2025-12-31', msg: 'Poké Center code! +75 ' },
				'CAMPBONUS':    { label: 'Camp Welcome Bonus', gives: 'seeds',  amount: 10,  expires: '2027-12-31', msg: 'Welcome bonus! +10 seeds' },
				'SHINYSTART':   { label: 'Shiny Starter',      gives: 'berry',  amount: 15,  expires: '2027-12-31', msg: 'Shiny Starter code! +15 berries' },
				'POKEMONDAY26': { label: 'Pokémon Day 2026',   gives: 'tokens', amount: 151, expires: '2026-02-28', msg: '🎉 Pokémon Day 2026! +151 ' },
			};
			const CODES_KEY = 'pokequiz_redeemed_codes';
			function getRedeemedCodes() {
				try { return JSON.parse(localStorage.getItem(CODES_KEY) || '[]'); } catch { return []; }
			}
			function markCodeRedeemed(code) {
				const list = getRedeemedCodes();
				list.push(code.toUpperCase());
				try { localStorage.setItem(CODES_KEY, JSON.stringify(list)); } catch {}
			}
			function redeemCode(raw) {
				const code = (raw || '').trim().toUpperCase();
				if (!code) return { ok: false, msg: 'Enter a code first.' };
				const def = CODES[code];
				if (!def) return { ok: false, msg: 'Unknown code.' };
				if (def.expires && new Date().toISOString().slice(0,10) > def.expires)
					return { ok: false, msg: 'This code has expired.' };
				if (getRedeemedCodes().includes(code))
					return { ok: false, msg: 'Already redeemed.' };
				// Apply reward
				const inv = Inventory.load();
				if (def.gives === 'tokens') inv.tokens = (inv.tokens||0) + def.amount;
				else if (def.gives === 'berry') inv.friendshipBerries = (inv.friendshipBerries||0) + def.amount;
				else if (def.gives === 'seed') inv.seeds = (inv.seeds||0) + def.amount;
				else if (def.gives === 'egg') EggSystem.buyEgg();
				Inventory.save(inv);
				markCodeRedeemed(code);
				Achievements.unlock('mysteryGift');
				const suffix = def.gives === 'tokens' ? ico(ICO.token) : def.gives === 'berry' ? ico(ICO.berry) : '';
				showToast(ico(ICO.gift) + ' ' + def.msg + suffix);
				return { ok: true, msg: def.label + ' redeemed!' };
			}
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
				// Code redemption section
				const codeSection = document.createElement('div');
				codeSection.style.cssText = 'margin-top:14px;padding-top:14px;border-top:1px solid var(--pk-border)';
				codeSection.innerHTML = '<div style="font-size:7px;color:var(--pk-muted);margin-bottom:8px">' + ico(ICO.gift) + ' Redeem a code</div>';
				const codeRow = document.createElement('div');
				codeRow.style.cssText = 'display:flex;gap:6px';
				const codeInput = document.createElement('input');
				codeInput.type = 'text';
				codeInput.placeholder = 'Enter code…';
				codeInput.style.cssText = 'flex:1;background:rgba(255,255,255,0.06);border:1px solid var(--pk-border);border-radius:6px;color:var(--pk-text);font-family:inherit;font-size:8px;padding:6px 8px;text-transform:uppercase;letter-spacing:1px';
				const codeBtn = document.createElement('button');
				codeBtn.className = 'pk-btn pk-btn-gold pk-btn-sm';
				codeBtn.textContent = 'Redeem';
				const codeFeedback = document.createElement('div');
				codeFeedback.style.cssText = 'font-size:7px;margin-top:6px;min-height:14px';
				codeBtn.addEventListener('click', () => {
					const result = redeemCode(codeInput.value);
					codeFeedback.style.color = result.ok ? 'var(--pk-green)' : 'var(--pk-red, #f66)';
					codeFeedback.textContent = result.msg;
					if (result.ok) codeInput.value = '';
				});
				codeRow.appendChild(codeInput);
				codeRow.appendChild(codeBtn);
				codeSection.appendChild(codeRow);
				codeSection.appendChild(codeFeedback);
				inner.querySelector('.pk-modal-body')?.appendChild(codeSection);

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
			return { open, autoCheck, check, redeemCode };
		})();
	window.CAMP_SYSTEMS.MysteryGift = MysteryGift;

	// ── MoveTutor ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.MoveTutor = MoveTutor;

	// ═══════════════════════════════════════════════════════════════════════════
	// Scene helpers and Phaser scene factory functions
	// All window.CAMP_SYSTEMS.* and window.CAMP_DATA.* are accessible in scope.
	// ═══════════════════════════════════════════════════════════════════════════
	window.CAMP_SCENES = window.CAMP_SCENES || {};


	// ── dexFromKey ────────────────────────────────────────────────────────
		function dexFromKey(key) {
			if (key == null) return null;
			if (typeof key === 'number') return key;
			const m = String(key).match(/^(\d+)(?::\d+)?$/);
			return m ? parseInt(m[1]) : key; // eeveelution strings pass through unchanged
		}
	window.CAMP_SYSTEMS.dexFromKey = dexFromKey;

	// ── animPrefixFromKey ────────────────────────────────────────────────────────
		function animPrefixFromKey(key) {
			const d = dexFromKey(key);
			return String(d); // "4", "129", "eevee", etc.
		}
	window.CAMP_SYSTEMS.animPrefixFromKey = animPrefixFromKey;

	// ── getNpcDialog ────────────────────────────────────────────────────────
		function getNpcDialog(npc) {
			if (typeof npc.dialog === 'string') return npc.dialog;
			if (Array.isArray(npc.dialog)) {
				const day = Math.floor(Date.now() / 86400000);
				const hash = (npc.key || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
				return npc.dialog[(day + hash) % npc.dialog.length];
			}
			return '';
		}
	window.CAMP_SYSTEMS.getNpcDialog = getNpcDialog;

	// ── buildMap ────────────────────────────────────────────────────────
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

			// Beach exit path — far right, bottom rows (cols 27-29, rows MAP_H-3 to MAP_H-1)
			set(MAP_H-1, 28, TP); set(MAP_H-2, 28, TP); set(MAP_H-3, 28, TP);
			set(MAP_H-3, 27, TSG);

			// Cave entrance (south-west, cols 4-5 — override TTR south wall like beach)
			set(MAP_H-1,4,TP); set(MAP_H-1,5,TP); set(MAP_H-2,4,TP); set(MAP_H-2,5,TP);

			return map;
		}
	window.CAMP_SYSTEMS.buildMap = buildMap;

	// ── drawTile ────────────────────────────────────────────────────────
		function drawTile(ctx, t, x, y, tick) {
			const d = TILE, S = TILE;
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
				case TSA:
					// Warm sandy beige with grain noise
					ctx.fillStyle='#E8D070'; ctx.fillRect(x,y,d,d);
					ctx.fillStyle='#F0DC88';
					ctx.fillRect(x+1,y+1,3,2); ctx.fillRect(x+9,y+5,4,2); ctx.fillRect(x+3,y+11,5,1);
					ctx.fillStyle='#C8B040';
					ctx.fillRect(x+6,y+3,1,1); ctx.fillRect(x+13,y+7,1,1); ctx.fillRect(x+5,y+13,1,1);
					ctx.fillRect(x+10,y+11,1,1); ctx.fillRect(x+2,y+7,1,1); ctx.fillRect(x+14,y+2,1,1);
					break;
				case TSA2:
					// Darker wet sand
					ctx.fillStyle='#C8A840'; ctx.fillRect(x,y,d,d);
					ctx.fillStyle='#D8BC58';
					ctx.fillRect(x+2,y+2,3,2); ctx.fillRect(x+10,y+6,4,1); ctx.fillRect(x+4,y+12,4,1);
					ctx.fillStyle='#A88830';
					ctx.fillRect(x+7,y+4,1,1); ctx.fillRect(x+12,y+9,1,1); ctx.fillRect(x+3,y+14,1,1);
					ctx.fillRect(x+1,y+9,1,1); ctx.fillRect(x+13,y+3,1,1);
					break;
				case TSHO: {
					// Shoreline — top half sand with foam, bottom half water
					ctx.fillStyle='#E8D070'; ctx.fillRect(x,y,d,d/2);
					ctx.fillStyle='#40B8D8'; ctx.fillRect(x,y+d/2,d,d/2);
					// Animated foam line
					const foamOff=Math.round(Math.sin(tick*0.07+(x)*0.05)*1);
					ctx.fillStyle='rgba(255,255,255,0.7)';
					ctx.fillRect(x+1,y+7+foamOff,d-2,1);
					// Foam flecks
					ctx.fillStyle='rgba(255,255,255,0.85)';
					const fs=Math.floor(tick/10)%3;
					if(fs===0){ctx.fillRect(x+3,y+8,2,1);ctx.fillRect(x+11,y+7,2,1);}
					else if(fs===1){ctx.fillRect(x+6,y+8,2,1);ctx.fillRect(x+13,y+7,1,1);}
					else{ctx.fillRect(x+2,y+7,1,1);ctx.fillRect(x+9,y+8,2,1);}
					break;
				}
				case TBWT: {
					// Tropical beach water — vivid turquoise
					const bw1=Math.round(Math.sin(tick*0.05+(x+y)*0.04)*1.5);
					const bw2=Math.round(Math.sin(tick*0.04+x*0.06)*1);
					ctx.fillStyle='#40B8D8'; ctx.fillRect(x,y,d,d);
					ctx.fillStyle='#5CCCE8';
					ctx.fillRect(x+1,y+bw1+2,d-2,2); ctx.fillRect(x+2,y+bw2+7,d-4,2); ctx.fillRect(x+1,y+bw1+12,d-2,2);
					ctx.fillStyle='#80D8F0';
					ctx.fillRect(x+2,y+bw1+3,4,1); ctx.fillRect(x+10,y+bw2+8,3,1);
					const bsp=Math.floor(tick/12)%4;
					ctx.fillStyle='rgba(255,255,255,0.8)';
					if(bsp===0) ctx.fillRect(x+6,y+3,2,2);
					else if(bsp===1) ctx.fillRect(x+11,y+10,2,2);
					else if(bsp===2) ctx.fillRect(x+3,y+10,2,2);
					else ctx.fillRect(x+12,y+3,2,2);
					ctx.fillStyle='rgba(255,255,255,0.9)';
					if(bsp===0) ctx.fillRect(x+7,y+4,1,1);
					else if(bsp===1) ctx.fillRect(x+12,y+11,1,1);
					else if(bsp===2) ctx.fillRect(x+4,y+11,1,1);
					else ctx.fillRect(x+13,y+4,1,1);
					break;
				}
				case TPIER:
					// Dark wood pier planks
					ctx.fillStyle='#6B4423'; ctx.fillRect(x,y,d,d);
					ctx.fillStyle='#4A2E14';
					ctx.fillRect(x,y+4,d,1); ctx.fillRect(x,y+12,d,1); // plank gaps
					ctx.fillStyle='#7C5530';
					ctx.fillRect(x+1,y+1,d-2,2); ctx.fillRect(x+1,y+5,d-2,6); ctx.fillRect(x+1,y+13,d-2,2);
					ctx.fillStyle='#3A2210'; // nail dots
					ctx.fillRect(x+2,y+2,1,1); ctx.fillRect(x+13,y+2,1,1);
					ctx.fillRect(x+2,y+14,1,1); ctx.fillRect(x+13,y+14,1,1);
					break;
				case TPALM: {
					// Tropical palm tree
					ctx.fillStyle='#E8D070'; ctx.fillRect(x,y,d,d); // sand base
					// Trunk (2px wide, centered)
					ctx.fillStyle='#7A5030'; ctx.fillRect(x+7,y+8,2,8);
					ctx.fillStyle='#5A3818'; ctx.fillRect(x+8,y+8,1,8);
					ctx.fillStyle='#9A6840'; ctx.fillRect(x+7,y+8,1,8);
					// Fronds — fan shape
					ctx.fillStyle='#2A6A18';
					ctx.fillRect(x+3,y+3,10,2); ctx.fillRect(x+2,y+4,12,1);
					ctx.fillRect(x+5,y+2,6,1);
					ctx.fillStyle='#5A9A30';
					ctx.fillRect(x+4,y+3,8,2); ctx.fillRect(x+3,y+4,10,1);
					ctx.fillStyle='#88CC44';
					ctx.fillRect(x+6,y+2,4,1); ctx.fillRect(x+5,y+3,6,1);
					// Left frond
					ctx.fillStyle='#2A6A18'; ctx.fillRect(x+1,y+5,5,2);
					ctx.fillStyle='#5A9A30'; ctx.fillRect(x+2,y+5,4,1);
					// Right frond
					ctx.fillStyle='#2A6A18'; ctx.fillRect(x+10,y+5,5,2);
					ctx.fillStyle='#5A9A30'; ctx.fillRect(x+10,y+5,4,1);
					break;
				}
				case TROCKB:
					// Rounded gray boulder
					ctx.fillStyle='#888888'; ctx.fillRect(x,y,d,d);
					ctx.fillStyle='#A0A0A0'; ctx.fillRect(x+2,y+2,10,9);
					ctx.fillStyle='#BBBBBB'; // top-left highlight
					ctx.fillRect(x+3,y+3,5,3); ctx.fillRect(x+3,y+6,2,1);
					ctx.fillStyle='#555555'; // bottom-right shadow
					ctx.fillRect(x+9,y+8,5,5); ctx.fillRect(x+7,y+11,5,2);
					ctx.fillStyle='#777777'; // texture dots
					ctx.fillRect(x+6,y+5,1,1); ctx.fillRect(x+10,y+4,1,1); ctx.fillRect(x+4,y+9,1,1);
					break;
				case TSHL:
					// Shell/starfish decoration on sand
					ctx.fillStyle='#E8D070'; ctx.fillRect(x,y,d,d);
					// Sand grain
					ctx.fillStyle='#C8B040'; ctx.fillRect(x+3,y+3,1,1); ctx.fillRect(x+12,y+11,1,1);
					// Shell spiral shape (pink/white)
					ctx.fillStyle='#F0A8B0'; // outer shell
					ctx.fillRect(x+5,y+5,6,6); ctx.fillRect(x+6,y+4,4,1); ctx.fillRect(x+6,y+11,4,1);
					ctx.fillRect(x+4,y+6,1,4); ctx.fillRect(x+11,y+6,1,4);
					ctx.fillStyle='#E07890'; // mid shell
					ctx.fillRect(x+6,y+6,4,4); ctx.fillRect(x+7,y+5,2,1);
					ctx.fillStyle='#FFFFFF'; // highlight
					ctx.fillRect(x+6,y+6,2,2); ctx.fillRect(x+7,y+5,1,1);
					ctx.fillStyle='#D05878'; // center point
					ctx.fillRect(x+8,y+8,1,1);
					break;
				case TCVF: ctx.fillStyle='#9898b8'; ctx.fillRect(x,y,S,S); ctx.fillStyle='#b0b0cc'; ctx.fillRect(x+1,y+1,S-2,S-2); ctx.fillStyle='#8080a0'; ctx.fillRect(x,y,1,1); ctx.fillRect(x+S-1,y+S-1,1,1); break;
				case TCVW: ctx.fillStyle='#2c2020'; ctx.fillRect(x,y,S,S); ctx.fillStyle='#3c2c24'; ctx.fillRect(x+1,y+1,S-2,S-2); ctx.fillStyle='#5c4030'; for(var _i=0;_i<3;_i++){ctx.fillRect(x+2+_i*4,y+3,3,3);} ctx.fillStyle='#7a5840'; ctx.fillRect(x+2,y+3,2,2); break;
				case TCVFS: ctx.fillStyle='#3a3045'; ctx.fillRect(x,y,S,S); ctx.fillStyle='#8070a0'; ctx.fillRect(x+5,y+5,6,6); ctx.fillStyle='#b0a0c8'; ctx.fillRect(x+6,y+6,4,4); break;
				case TCVXT: ctx.fillStyle='#4a2e18'; ctx.fillRect(x,y,S,S); ctx.fillStyle='#ffcb05'; ctx.fillRect(x+S/2-2,y+3,4,S-6); ctx.fillRect(x+3,y+S/2-1,S-6,3); break;
				default:
					ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
			}
		}
	window.CAMP_SYSTEMS.drawTile = drawTile;

	// ── applyWrapTop ────────────────────────────────────────────────────────
		function applyWrapTop() {
			const header = document.querySelector('.site-header');
			const wrap = document.getElementById('campWrap');
			if (!wrap) return;
			const hh = header ? Math.ceil(header.getBoundingClientRect().bottom) : 0;
			wrap.style.top = hh + 'px';
		}
	window.CAMP_SYSTEMS.applyWrapTop = applyWrapTop;

	// ── setupTouchPad ────────────────────────────────────────────────────────
		function setupTouchPad() {
			// Helper: close mobile nav sheet whenever a gameplay button is pressed
			const _closeMBS = () => MobileBottomSheet.close();

			[['capInteract','interact'],['capPartner','partner'],['capFaceoff','faceoff']].forEach(([id, action]) => {
				const el = document.getElementById(id);
				if (!el) return;
				el.addEventListener('pointerdown', (e) => {
					e.preventDefault();
					_closeMBS();
					TouchActions.fire(action);
				});
				// touchstart fallback for browsers where pointerdown is unreliable on overlays
				el.addEventListener('touchstart', (e) => {
					e.preventDefault();
					_closeMBS();
					TouchActions.fire(action);
				}, { passive: false });
			});
			const menuEl = document.getElementById('capMenu');
			if (menuEl) {
				menuEl.addEventListener('pointerdown', (e) => {
					e.preventDefault();
					_closeMBS();
					__S._pauseToggleFn?.();
				});
				menuEl.addEventListener('touchstart', (e) => {
					e.preventDefault();
					_closeMBS();
					__S._pauseToggleFn?.();
				}, { passive: false });
			}

			// ── Swipe gestures on the game canvas to open HUD panels ─────────────
			// Swipe left  → Pokédex   Swipe right → Partner
			// Swipe up    → Achievements   Swipe down  → PC Box
			const wrap = document.getElementById('campWrap');
			if (wrap) {
				let _tx = 0, _ty = 0;
				wrap.addEventListener('touchstart', (e) => {
					const t = e.touches[0];
					_tx = t.clientX; _ty = t.clientY;
				}, { passive: true });
				wrap.addEventListener('touchend', (e) => {
					const t = e.changedTouches[0];
					const dx = t.clientX - _tx;
					const dy = t.clientY - _ty;
					const adx = Math.abs(dx), ady = Math.abs(dy);
					if (Math.max(adx, ady) < 40) return; // too short
					// Only fire if no modal/dialog is open
					if (Dialog.isOpen() || Partner.isOpen() || Pokedex.isOpen?.()) return;
					if (adx > ady) {
						// Horizontal swipe
						if (dx < 0) Pokedex.open();        // left → Pokédex
						else        Partner.open();         // right → Partner
					} else {
						// Vertical swipe
						if (dy < 0) Achievements.open?.(); // up → Achievements
						else        PCBox.open();           // down → PC Box
					}
				}, { passive: true });
			}
		}
	window.CAMP_SYSTEMS.setupTouchPad = setupTouchPad;

	// ── setupPauseMenu ────────────────────────────────────────────────────────
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
			__S._pauseToggleFn = () => { panel.hidden ? open() : close(); };
	
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
						if (sceneKey && ['camp', 'house', 'upstairs', 'beach'].includes(sceneKey)) Music.start(sceneKey);
					}
					musicBtn.innerHTML = ico(ICO.music) + ' Music: ' + (next ? 'On' : 'Off');
				});
			}
	
			// Gym Badges panel
			const badgesBtn = document.getElementById('campPauseBadges');
			if (badgesBtn) {
				badgesBtn.addEventListener('click', () => {
					close();
					const earned = window.PokeBadges ? window.PokeBadges.computeAndSave() : {};
					const meta   = window.PokeBadges ? window.PokeBadges.meta : [];
					let bdPanel = document.getElementById('gymBadgePanel');
					if (!bdPanel) {
						bdPanel = document.createElement('div');
						bdPanel.id = 'gymBadgePanel';
						document.body.appendChild(bdPanel);
						bdPanel.addEventListener('pointerdown', e => { if(e.target===bdPanel) bdPanel.hidden=true; });
					}
					bdPanel.hidden = false;
					bdPanel.className = 'pk-backdrop';
					bdPanel.innerHTML = '';
					const inner = document.createElement('div');
					inner.className = 'pk-modal pk-modal-sm';
					const count = meta.filter(b => earned[b.id]).length;
					inner.innerHTML = '<div class="pk-modal-head"><span class="pk-modal-title">' + ico(ICO.badge || 'award-fill') + ' GYM BADGES</span>' +
						'<button id="bdClose" class="pk-close" type="button">' + ico(ICO.close) + '</button></div>';
					const body = document.createElement('div');
					body.className = 'pk-modal-body';
					const sub = document.createElement('div');
					sub.style.cssText = 'font-size:7px;color:var(--pk-muted);margin-bottom:14px';
					sub.textContent = count + ' / ' + meta.length + ' badges earned';
					body.appendChild(sub);
					const grid = document.createElement('div');
					grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px';
					meta.forEach(b => {
						const cell = document.createElement('div');
						cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;border-radius:8px;border:1px solid var(--pk-border);background:' + (earned[b.id] ? 'rgba(246,200,76,0.08)' : 'rgba(255,255,255,0.02)');
						const em = document.createElement('div');
						em.style.cssText = 'font-size:22px;' + (earned[b.id] ? '' : 'filter:grayscale(1) opacity(0.35)');
						em.textContent = b.emoji;
						const nm = document.createElement('div');
						nm.style.cssText = 'font-size:6px;color:' + (earned[b.id] ? 'var(--pk-gold)' : 'var(--pk-muted)') + ';text-align:center;line-height:1.4';
						nm.textContent = b.name.replace(' Badge','');
						cell.appendChild(em);
						cell.appendChild(nm);
						grid.appendChild(cell);
					});
					body.appendChild(grid);
					if (!window.PokeBadges) {
						const warn = document.createElement('div');
						warn.style.cssText = 'font-size:7px;color:var(--pk-muted);margin-top:10px';
						warn.textContent = 'Play quiz games to earn badges!';
						body.appendChild(warn);
					}
					inner.appendChild(body);
					bdPanel.appendChild(inner);
					inner.addEventListener('pointerdown', e => e.stopPropagation());
					document.getElementById('bdClose')?.addEventListener('click', () => { bdPanel.hidden = true; });
				});
			}

			// Accessibility panel
			const accessBtn = document.getElementById('campPauseAccess');
			if (accessBtn) {
				accessBtn.addEventListener('click', () => {
					close();
					let acPanel = document.getElementById('accessPanel');
					if (!acPanel) {
						acPanel = document.createElement('div');
						acPanel.id = 'accessPanel';
						document.body.appendChild(acPanel);
						acPanel.addEventListener('pointerdown', e => { if(e.target===acPanel) acPanel.hidden=true; });
					}
					acPanel.hidden = false;
					acPanel.className = 'pk-backdrop';
					acPanel.innerHTML = '';
					const inner = document.createElement('div');
					inner.className = 'pk-modal pk-modal-sm';
					inner.innerHTML = '<div class="pk-modal-head"><span class="pk-modal-title">⚙️ ACCESSIBILITY</span>' +
						'<button id="acClose" class="pk-close" type="button">' + ico(ICO.close) + '</button></div>';
					const body = document.createElement('div');
					body.className = 'pk-modal-body';
					body.style.cssText = 'display:flex;flex-direction:column;gap:12px';
					function makeToggleRow(label, desc, key) {
						const cfg = AccessibilitySettings.load();
						const row = document.createElement('div');
						row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--pk-border);border-radius:8px';
						const info = document.createElement('div');
						const lbl = document.createElement('div');
						lbl.style.cssText = 'font-size:9px;color:var(--pk-text)';
						lbl.textContent = label;
						const dsc = document.createElement('div');
						dsc.style.cssText = 'font-size:7px;color:var(--pk-muted);margin-top:2px';
						dsc.textContent = desc;
						info.appendChild(lbl);
						info.appendChild(dsc);
						const btn = document.createElement('button');
						btn.className = 'pk-btn pk-btn-sm ' + (cfg[key] ? 'pk-btn-gold' : 'pk-btn-dark');
						btn.style.minWidth = '44px';
						btn.textContent = cfg[key] ? 'On' : 'Off';
						btn.addEventListener('click', () => {
							const newVal = AccessibilitySettings.toggle(key);
							btn.className = 'pk-btn pk-btn-sm ' + (newVal ? 'pk-btn-gold' : 'pk-btn-dark');
							btn.textContent = newVal ? 'On' : 'Off';
						});
						row.appendChild(info);
						row.appendChild(btn);
						return row;
					}
					body.appendChild(makeToggleRow('High Contrast', 'Increases colour contrast across the UI', 'highContrast'));
					body.appendChild(makeToggleRow('Reduce Motion', 'Disables particle effects and animations', 'reduceMotion'));
					inner.appendChild(body);
					acPanel.appendChild(inner);
					inner.addEventListener('pointerdown', e => e.stopPropagation());
					document.getElementById('acClose')?.addEventListener('click', () => { acPanel.hidden = true; });
				});
			}

			document.addEventListener('keydown', (e) => {
				if (e.key === 'Escape') {
					if (Dialog.isOpen()) { Dialog.close(); return; }
					panel.hidden ? open() : close();
				}
			});
		}
	window.CAMP_SYSTEMS.setupPauseMenu = setupPauseMenu;

	// ── miniMapColor ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.miniMapColor = miniMapColor;

	// ── safeSceneStart ────────────────────────────────────────────────────────
		// Area display names shown in the transition overlay so the user sees
		// "Entering the Market…" rather than a silent black screen.
		const _AREA_NAMES = { camp:'the Camp', house:'your House', upstairs:'upstairs',
		                       market:'the Market', beach:'the Beach', cave:'the Cave' };

		function safeSceneStart(scene, key, data) {
			try { Dialog.close(); } catch (_) {}
			try { Sound.door(); } catch (_) {}
			const from = (data && data.from) || '';
			console.log('[scene] switch →', key, 'from', from);

			// Show the black overlay with a label so users know it's loading, not frozen.
			const fade = document.getElementById('campFade');
			if (fade) {
				fade.innerHTML =
					'<div style="position:absolute;inset:0;display:flex;align-items:center;' +
					'justify-content:center;color:rgba(255,255,255,0.55);font-family:' +
					'monospace;font-size:13px;letter-spacing:1px;pointer-events:none;">' +
					'Entering ' + (_AREA_NAMES[key] || key) + '…</div>';
				fade.classList.remove('is-hidden');
			}

			// Encode destination in the hash so __campRestart / readBootHash lands right.
			window.location.hash = '#' + key + (from ? '|' + from : '');

			// __campRestart (defined in camp.js) destroys the current Phaser instance and
			// creates a fresh one. JS stays compiled in memory — only Phaser re-inits,
			// making this ~2-3× faster than window.location.reload().
			// Fall back to reload if __campRestart isn't available yet (race on cold boot).
			setTimeout(() => {
				if (typeof window.__campRestart === 'function') {
					window.__campRestart();
				} else {
					window.location.reload();
				}
			}, 80);
		}
	window.CAMP_SYSTEMS.safeSceneStart = safeSceneStart;

	// ── readBootHash ────────────────────────────────────────────────────────
		function readBootHash() {
			const raw = (window.location.hash || '').replace(/^#/, '');
			if (!raw) return { scene: 'camp', from: '' };
			const [scene, from] = raw.split('|');
			return { scene: scene || 'camp', from: from || '' };
		}
	window.CAMP_SYSTEMS.readBootHash = readBootHash;

	// ── consumeBootFrom ────────────────────────────────────────────────────────
		function consumeBootFrom(sceneKey) {
			// Only return boot 'from' once, and only if it matches the scene asking.
			if (__S._bootData && __S._bootData.scene === sceneKey && __S._bootData.from) {
				const from = __S._bootData.from;
				__S._bootData = { scene: 'camp', from: '' };
				return from;
			}
			return '';
		}
	window.CAMP_SYSTEMS.consumeBootFrom = consumeBootFrom;

	// ── applyDayNight ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.applyDayNight = applyDayNight;

	// ── updateDayNightTint ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.updateDayNightTint = updateDayNightTint;

	// ── buildHouseMap ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.buildHouseMap = buildHouseMap;

	// ── buildUpstairsMap ────────────────────────────────────────────────────────
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
	window.CAMP_SYSTEMS.buildUpstairsMap = buildUpstairsMap;

	// ── buildMarketMap ────────────────────────────────────────────────────────
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
	
			// ── Road network ────────────────────────────────────────────────────────
			// Main N-S spine — 3 tiles wide (matches the north tree-gap cols 14-16)
			for (let r = 0; r <= 24; r++) { set(r,14,TP); set(r,15,TP); set(r,16,TP); }
			// Main E-W boulevard — 2 tiles wide, col 3 to col 39 (stops at Café wall)
			for (let c = 3; c <= 39; c++) { set(10,c,TP); set(11,c,TP); }
			// North stall spurs — bridge row 9 gap between stall pads (row 8) and boulevard (row 10)
			fill(9, 9, 9, 13, TP);    // NW stall → spine
			fill(9, 17, 9, 20, TP);   // NE stall → spine
			// South stall spurs — bridge row 12 gap between boulevard (row 11) and stall pads (row 13)
			fill(12, 9, 12, 13, TP);  // SW stall → spine
			fill(12, 17, 12, 20, TP); // SE stall → spine
	
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
	
			// Bottom-area decorations (south of boulevard)
			[[19,5,TBSH],[19,20,TBSH],[19,25,TBSH]].forEach(([r,c,t]) => set(r,c,t));
			[[20,7,TFR],[20,9,TFY],[20,21,TFR],[20,23,TFY]].forEach(([r,c,t]) => set(r,c,t));
			[[21,18,TFY],[24,18,TFR]].forEach(([r,c,t]) => set(r,c,t));
			[[23,4,TBSH],[23,25,TBSH]].forEach(([r,c,t]) => set(r,c,t));
	
			// Signs in front of each stall — text comes from SIGN_MESSAGES_MARKET
			[[9,7],[9,22],[16,7],[16,22]].forEach(([r,c]) => set(r,c,TSG));
			// Notice board sign (west of board NPC) and Arcane Tower sign (south approach)
			set(8, 11, TSG);  // notice board
			set(23, 11, TSG); // arcane tower
	
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

			// ── Medieval Tower — centre of lower grass lot (rows 15–20, cols 10–13) ──
			// Overwrites any flower/bush tiles that landed here — the tower wins.
			fill(15, 10, 20, 13, TBLD);
			// Tower approach — wide spur connecting south of tower to the N-S spine
			fill(21, 10, 21, 16, TP);

			// Wishing well — decorative solid at (16,17)-(17,18)
			fill(16, 17, 17, 18, TBLD);
			set(19, 17, TSG); // sign south of well

			set(20, 7, TSG); // weekly vendor sign

			// New feature signs
			set(24, 8, TSG);   // move tutor sign
			set(21, 20, TSG);  // expedition board sign
			set(24, 23, TSG);  // treasure excavation sign
			set(21, 25, TSG);  // gossip corner sign

			// Decorative rug at excavation site
			fill(22, 22, 24, 24, TRU);

			return map;
		}
	window.CAMP_SYSTEMS.buildMarketMap = buildMarketMap;

	// ── WildSpawner ──────────────────────────────────────────────────────────────
	class WildSpawner {
		constructor(mapGrid, tileSize) {
			this.map = mapGrid;
			this.T = tileSize;
			this.wilds = [];
			this.MAX = 4;
			this._pool = [1,4,7,25,39,52,54,58,60,63,69,74,77,79,81,88,90,92,96,98,100,102,104,113,116,118,120,128,131,133,143];
		}

		_walkable(r, c, inv) {
			const t = (this.map[r]||[])[c];
			return t !== undefined && canWalkOn(t, inv);
		}

		spawnAll(inv) {
			const candidates = [];
			for (let r=2; r<this.map.length-2; r++)
				for (let c=2; c<(this.map[0]||[]).length-2; c++)
					if (this._walkable(r,c,inv)) candidates.push({r,c});
			const picks = [];
			const tmp = [...candidates];
			for (let i=0; i<this.MAX && tmp.length; i++) {
				const idx = Math.floor(Math.random()*tmp.length);
				picks.push(tmp.splice(idx,1)[0]);
			}
			for (const p of picks) {
				const dex = this._pool[Math.floor(Math.random()*this._pool.length)];
				this._spawn(dex, p.r, p.c);
			}
		}

		_spawn(dexNum, row, col) {
			const T=this.T, x=col*T+T/2, y=row*T+T/2;
			const names=(window.CAMP_DATA||{}).PMD_NAMES||[];
			const name=names[dexNum]||('Pokemon '+dexNum);
			const wrap=document.getElementById('campWrap');
			if (!wrap) return;
			const el=document.createElement('div');
			el.style.cssText='position:absolute;left:0;top:0;width:32px;height:32px;pointer-events:none;z-index:5;transition:left 0.25s,top 0.25s;';
			const img=document.createElement('img');
			const pad=String(dexNum).padStart(4,'0');
			img.src=`https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite/${pad}/Idle/Down/0001.png`;
			img.style.cssText='width:32px;height:32px;image-rendering:pixelated;';
			img.onerror=()=>{img.style.display='none';};
			const badge=document.createElement('div');
			badge.style.cssText='position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:11px;display:none;filter:drop-shadow(0 1px 2px #000);';
			badge.textContent='❗';
			el.appendChild(img); el.appendChild(badge);
			wrap.appendChild(el);
			const w={el,badge,img,dexNum,name,worldX:x,worldY:y,row,col,moveTimer:0,moveInterval:2500+Math.random()*2500,near:false};
			this.wilds.push(w);
		}

		update(player, cam) {
			if (!cam||!player) return;
			const zoom=cam.zoom, ox=cam.scrollX, oy=cam.scrollY;
			for (const w of this.wilds) {
				w.moveTimer += 16;
				if (w.moveTimer>w.moveInterval) {
					w.moveTimer=0; w.moveInterval=2500+Math.random()*2500;
					const dirs=[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];
					const d=dirs[Math.floor(Math.random()*4)];
					const nr=w.row+d.dr, nc=w.col+d.dc;
					if (this._walkable(nr,nc,null)) {
						w.row=nr; w.col=nc;
						w.worldX=nc*this.T+this.T/2; w.worldY=nr*this.T+this.T/2;
					}
				}
				const sx=(w.worldX-ox)*zoom, sy=(w.worldY-oy)*zoom;
				w.el.style.left=(sx-16)+'px'; w.el.style.top=(sy-16)+'px';
				w.el.style.transform=`scale(${Math.max(1,zoom/2)})`;
				const dx=Math.abs(w.worldX-player.x), dy=Math.abs(w.worldY-player.y);
				const near=dx<this.T*2.5 && dy<this.T*2.5;
				if (near!==w.near) { w.near=near; w.badge.style.display=near?'block':'none'; }
			}
		}

		getNearby(px, py) {
			for (const w of this.wilds) {
				if (Math.abs(w.worldX-px)<this.T*2.5 && Math.abs(w.worldY-py)<this.T*2.5) return w;
			}
			return null;
		}

		remove(w) {
			const i=this.wilds.indexOf(w); if(i>=0) this.wilds.splice(i,1);
			if(w.el) w.el.remove();
		}

		destroyAll() { for(const w of this.wilds) if(w.el) w.el.remove(); this.wilds=[]; }
	}

	function showWildEncounter(wild, onFlee, onCatch) {
		const m=document.getElementById('wildModal');
		if (!m) { if(onFlee) onFlee(); return; }
		const pad=String(wild.dexNum).padStart(4,'0');
		document.getElementById('wildModalImg').src=`https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite/${pad}/Idle/Down/0001.png`;
		document.getElementById('wildModalName').textContent=wild.name.toUpperCase();
		m.hidden=false;
		document.getElementById('wildFleeBtn').onclick=()=>{m.hidden=true; if(onFlee) onFlee();};
		document.getElementById('wildCatchBtn').onclick=()=>{
			m.hidden=true;
			try {
				const inv=JSON.parse(localStorage.getItem('pokequiz_inventory')||'{}');
				const balls=inv.pokeballs||inv.pokeball||inv['poke-ball']||0;
				if (balls<=0) { showToast('No Poké Balls! Buy some at the Mart.'); if(onFlee) onFlee(); return; }
				const k=inv.pokeballs!==undefined?'pokeballs':(inv['poke-ball']!==undefined?'poke-ball':'pokeball');
				inv[k]=Math.max(0,(inv[k]||0)-1);
				localStorage.setItem('pokequiz_inventory',JSON.stringify(inv));
			} catch {}
			if(onCatch) onCatch();
		};
	}
	window.CAMP_SYSTEMS.showWildEncounter = showWildEncounter;

	// ── buildBeachMap ────────────────────────────────────────────────────────
		function buildBeachMap() {
			const map = Array.from({ length: BEACH_H }, () => new Array(BEACH_W).fill(TSA));
			const set = (r, c, t) => { if (r>=0 && r<BEACH_H && c>=0 && c<BEACH_W) map[r][c] = t; };
			const fill = (r1, c1, r2, c2, t) => { for(let r=r1;r<=r2;r++) for(let c=c1;c<=c2;c++) set(r,c,t); };

			// Sprinkle wet sand for variety
			let rng = 54321;
			const rand = () => { rng^=rng<<13; rng^=rng>>17; rng^=rng<<5; return (rng>>>0)/0xFFFFFFFF; };
			for (let r=2;r<9;r++) for (let c=2;c<BEACH_W-2;c++) {
				if (rand() < 0.12) map[r][c] = TSA2;
			}

			// Top border — palm treeline
			for (let c=0;c<BEACH_W;c++) { set(0,c,TPALM); set(1,c,TPALM); }
			// Left/right rock columns
			for (let r=2;r<9;r++) { set(r,0,TROCKB); set(r,1,TROCKB); set(r,BEACH_W-1,TROCKB); set(r,BEACH_W-2,TROCKB); }

			// Top entrance path (cols 14-16, rows 0-3)
			for (let r=0;r<=3;r++) { set(r,14,TP); set(r,15,TP); set(r,16,TP); }

			// Rocky boulder clusters at corners
			[[2,2],[2,3],[3,2],[3,3],[4,2],[4,3],  // NW cluster
			 [2,28],[2,29],[3,28],[3,29],[4,28],[4,29]  // NE cluster
			].forEach(([r,c]) => set(r,c,TROCKB));

			// Scattered palm trees in sand area
			[[4,7],[5,7],[4,8],[5,8],   // palm 1
			 [4,22],[5,22],[4,23],[5,23], // palm 2
			 [7,5],[8,5],[7,6],          // palm 3
			 [6,26],[7,26],[6,27],       // palm 4
			].forEach(([r,c]) => set(r,c,TPALM));

			// Shell decorations scattered on sand
			[[5,10],[6,13],[7,20],[5,25],[8,9],[6,19]].forEach(([r,c]) => set(r,c,TSHL));

			// Shoreline band (rows 9-11, full width except rock sides)
			for (let r=9;r<=11;r++) for (let c=2;c<BEACH_W-2;c++) set(r,c,TSHO);

			// Beach water (rows 12-21)
			for (let r=12;r<BEACH_H;r++) for (let c=0;c<BEACH_W;c++) set(r,c,TBWT);
			// Rock sides continue in water area
			for (let r=9;r<BEACH_H;r++) { set(r,0,TROCKB); set(r,1,TROCKB); set(r,BEACH_W-1,TROCKB); set(r,BEACH_W-2,TROCKB); }

			// Pier (rows 2-12, cols 15-17 = TPIER planks extending into water)
			for (let r=2;r<=12;r++) { set(r,15,TPIER); set(r,16,TPIER); set(r,17,TPIER); }

			// Small rocky islands in water
			set(14,10,TROCKB); set(14,22,TROCKB); set(16,8,TROCKB); set(16,24,TROCKB);

			// Signs
			set(2,13,TSG);  // BEACH PIER sign
			set(2,5,TSG);   // ROCKY COVE sign
			set(7,26,TSG);  // DEEP WATER sign

			return map;
		}
	window.CAMP_SYSTEMS.buildBeachMap = buildBeachMap;

	// ── canWalkOn ────────────────────────────────────────────────────────
		function canWalkOn(tileId, inv) {
			if (!SOLID.has(tileId)) return true;
			if (tileId === TH2O && inv && inv.eeveeForm === 'vaporeon') return true;
			return false;
		}
	window.CAMP_SYSTEMS.canWalkOn = canWalkOn;

	// ── makeSceneClass ────────────────────────────────────────────────────────
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
					this.load.spritesheet('glaceon',  'Pictures/sprites/glaceon.png',  { frameWidth: 32, frameHeight: 40 });
					this.load.spritesheet('sylveon',  'Pictures/sprites/sylveon.png',  { frameWidth: 32, frameHeight: 48 });
					// NPC trainer overworld sprites (FRLG/HGSS 32×32 single-frame images).
					this.load.image('npc-youngster',      'Pictures/sprites/trainer-youngster.png');
					this.load.image('npc-camper',         'Pictures/sprites/trainer-camper.png');
					this.load.image('npc-cooltrainer-m',  'Pictures/sprites/trainer-cooltrainer-m.png');
					this.load.image('npc-cooltrainer-f',  'Pictures/sprites/trainer-cooltrainer-f.png');
					this.load.image('npc-picnicker',      'Pictures/sprites/trainer-picnicker.png');
					this.load.image('npc-gentleman',      'Pictures/sprites/trainer-gentleman.png');
					this.load.image('npc-lady',           'Pictures/sprites/trainer-lady.png');
					this.load.image('npc-old-lady',       'Pictures/sprites/trainer-old-lady.png');
					this.load.image('npc-scientist',      'Pictures/sprites/trainer-scientist.png');
					this.load.image('npc-lass',           'Pictures/sprites/trainer-lass.png');
					this.load.image('npc-bug-catcher',    'Pictures/sprites/trainer-bug-catcher.png');
					this.load.image('npc-bird-keeper',    'Pictures/sprites/trainer-bird-keeper.png');
					this.load.image('npc-fisherman',      'Pictures/sprites/trainer-fisherman.png');
					this.load.image('npc-black-belt',     'Pictures/sprites/trainer-black-belt.png');
					this.load.image('npc-beauty',         'Pictures/sprites/trainer-beauty.png');
					this.load.image('npc-hiker',          'Pictures/sprites/trainer-hiker.png');
					this.load.image('npc-sailor',         'Pictures/sprites/trainer-sailor.png');
					this.load.image('npc-super-nerd',     'Pictures/sprites/trainer-super-nerd.png');
					this.load.image('npc-swimmer-m',      'Pictures/sprites/trainer-swimmer-m.png');
					this.load.image('npc-swimmer-f',      'Pictures/sprites/trainer-swimmer-f.png');
					this.load.image('npc-psychic',        'Pictures/sprites/trainer-psychic.png');
					this.load.image('npc-hex-maniac',     'Pictures/sprites/trainer-hex-maniac.png');
					this.load.image('npc-ninja-boy',      'Pictures/sprites/trainer-ninja-boy.png');
					this.load.image('npc-ranger-m',       'Pictures/sprites/trainer-ranger-m.png');
					this.load.image('npc-ranger-f',       'Pictures/sprites/trainer-ranger-f.png');
					this.load.image('npc-parasol-lady',   'Pictures/sprites/trainer-parasol-lady.png');
					this.load.image('npc-ace-trainer-m',  'Pictures/sprites/trainer-ace-trainer-m.png');
					this.load.image('npc-ace-trainer-f',  'Pictures/sprites/trainer-ace-trainer-f.png');
					// NOTE: Companion sprite is intentionally NOT preloaded here with Phaser's loader.
					// The default FOLLOWER_FORMS dims (40×40) are wrong for most PMD sheets.
					// _buildCamp() bootstraps with Eevee then calls _switchFollower(), which uses
					// a native Image() fetch + frame-auto-detection + stale-texture validation.
				}
	
				create() {
					if (window.__campLoadHide) window.__campLoadHide();
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
						const _f = document.getElementById('campFade'); if (_f) _f.classList.add('is-hidden');
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
	
					// Seasonal tile palette: tint the base layer so grass/ground shifts hue by season.
					const _seasonTints = [
						0xDDEEFF, 0xDDEEFF,             // Jan, Feb  → winter blue
						0xFFEEF4, 0xFFEEF4, 0xFFEEF4,   // Mar-May   → spring pink
						0xFFFBE0, 0xFFFBE0, 0xFFFBE0,   // Jun-Aug   → summer warm
						0xFFE8B0, 0xFFD890, 0xFFC860,   // Sep-Nov   → autumn amber
						0xCCE0FF,                        // Dec       → deep winter blue
					];
					const _baseTileImg = this.add.image(0, 0, 'campBase').setOrigin(0).setDepth(0);
					_baseTileImg.setTint(_seasonTints[new Date().getMonth()]);
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
					                 : this.spawnFrom === 'beach'  ? MAP_H - 2
					                 : this.spawnFrom === 'cave'   ? MAP_H - 3   // just above south cave entrance
					                 : 14;
					const spawnTileC = this.spawnFrom === 'beach' ? 28
					                 : this.spawnFrom === 'cave'  ? 4    // left column of cave entrance
					                 : 11;
					this.player = this.physics.add.sprite(spawnTileC*TILE + TILE/2, spawnTileR*TILE + TILE/2, 'player', 0);
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

					// Wild Pokémon spawner
					this._wildSpawner = new WildSpawner(this.map, TILE);
					this._wildSpawner.spawnAll(Inventory.load());
					this._inWildEncounter = false;

					this.physics.world.setBounds(0, 0, W, H);
					this.player.setCollideWorldBounds(true);

					this.cameras.main.setBounds(0, 0, W, H);
					this.cameras.main.startFollow(this.player, true, 1, 1);
					this.cameras.main.setBackgroundColor('#68A028');
					this.cameras.main.setRoundPixels(true);
					this.applyZoom();
					this.scale.on('resize', this.onResize, this);
					this.events.once('shutdown', () => this.scale.off('resize', this.onResize, this));

					setTimeout(function() {
						if (window.CAMP_SYSTEMS && window.CAMP_SYSTEMS.CampTutorial) {
							window.CAMP_SYSTEMS.CampTutorial.show();
						}
					}, 1500);

					__S._sceneKeyboard = this.input.keyboard;
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
					this.events.once('shutdown', () => { if (this._wildSpawner) { this._wildSpawner.destroyAll(); this._wildSpawner = null; } });

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
					// Weather system — rain, snow, fog.
					this.rainContainer = this.add.container(0, 0).setDepth(4.5).setScrollFactor(0);
					this.raindrops = [];
					this.isRaining = false;
					this.snowContainer = this.add.container(0, 0).setDepth(4.4).setScrollFactor(0);
					this.snowflakes = [];
					this.isSnowing = false;
					this.fogOverlay = this.add.rectangle(0, 0, 2000, 2000, 0xc8d8e8, 0).setOrigin(0,0).setDepth(4.3).setScrollFactor(0);
					this.isFoggy = false;
					WeatherSystem.check(this);
					if (this.isFoggy) this.fogOverlay.setAlpha(0.32);
	
					// Face south from house; north from market/beach/cave (emerged from south wall)
					this.dir = (this.spawnFrom === 'market' || this.spawnFrom === 'beach' || this.spawnFrom === 'cave') ? 2 : 0;
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
					this.armedForBeach = this.spawnFrom !== 'beach';
	
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
						sprite.setScale(NPC_SPRITE_SCALES[npc.species] || npc.spriteScale);
						sprite.setDepth(3);
						// Blocker is 2×2 tiles — StaticBody auto-sizes from the Rectangle
						// dimensions, and npcSolids.add() calls body.reset() to place it.
						const rect = this.add.rectangle(x, y, TILE * 2, TILE * 2);
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
	
					// ── Camp rating → HUD badge (not an in-world text) ────────────────
					CampRating.displayOnGate();
					TrainerLevel.updateHUD();

					// ── Pokémon of the Day bonus (silent — no in-world sign) ───────────
					PokemonOfDay.checkBonus(this);

					// ── Surfing current state ─────────────────────────────────────────
					this._surfDriftTick = 0;
					this._surfDiscoveredIsland = false;
	
					// Minimap: pre-render the static tile layer once to an offscreen canvas.
					// updateMinimap() then does 1 drawImage blit + 2 fillRects per frame instead
					// of iterating all 1200 tiles each frame (which caused frame drops while walking).
					this.minimapEl = document.getElementById('campMinimap');
					this._minimapScale = 3;
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

					// ── Feature 1: Footprint trail graphics ───────────────────────────
					this._footprintGraphics = this.add.graphics().setDepth(1).setScrollFactor(1);
					this._footprints = [];
					this._footprintTick = 0;

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
						// Secret area trigger — hidden spot behind house at col 6, row 7
						if (r === 7 && c === 6) {
							return { kind: 'secret', r, c, label: 'Investigate' };
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
						// Feature 2: Floating reward for berry harvest
						showFloatingReward('+1 🍓');
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
						const _dexOvH = PMD_FRAME_OVERRIDES && PMD_FRAME_OVERRIDES[form.dex];
						const expectedH = _dexOvH
							? _dexOvH.frameH
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
								const _dexOvW = PMD_FRAME_OVERRIDES && PMD_FRAME_OVERRIDES[form.dex];
							if (_dexOvW) expectedW = _dexOvW.frameW;
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
								// Use a null-guarded lookup so a missing/undefined
								// PMD_FRAME_OVERRIDES (e.g. old cached camp-data.js) never
								// throws and silently skips the override.
								const _ov = PMD_FRAME_OVERRIDES && PMD_FRAME_OVERRIDES[form.dex];
								if (_ov) { frameW = _ov.frameW; frameH = _ov.frameH; cols = _ov.cols; }
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
						// Derive cols from the actual loaded texture width so hardcoded form.cols
						// can never produce overlapping frames (e.g. eeveelution with wrong cols).
						let cols = form.cols || 4;
						if (this.textures.exists(form.sheet)) {
							const _tex = this.textures.get(form.sheet);
							const _src = _tex.source && _tex.source[0];
							if (_src && _src.width && form.frameW) {
								const _detected = Math.round(_src.width / form.frameW);
								if (_detected >= 3 && _detected <= 12) { cols = _detected; form.cols = cols; }
							}
						}
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
						const _pName2 = dexFromKey(inv.companionForm);
						const _pLabel = (typeof _pName2 === 'number' && PMD_NAMES && PMD_NAMES[_pName2]) || 'Partner';
						Dialog.open(_pLabel + ' looks hungry, but you have no Friendship Berries.');
						return;
					}
					inv.friendshipBerries -= 1;
					inv.friendship = Math.min(FRIENDSHIP_MAX, (inv.friendship || 0) + FRIENDSHIP_PER_BERRY);
					inv.lastBerryFed = Date.now();
					Inventory.save(inv);
					DailyQuests.increment('feed');
					// Floating reward + friendship bar
					showFloatingReward('+' + FRIENDSHIP_PER_BERRY + ' 💛');
					if (window.__campScene) showFriendshipBar(window.__campScene, FRIENDSHIP_PER_BERRY);
					if (inv.friendship >= FRIENDSHIP_MAX) {
						// Check for non-Eevee wild evolution first
						const _ck2 = inv.companionForm;
						const _cd2 = dexFromKey(_ck2);
						const _ne2 = GEN1_EVOLUTIONS && typeof _cd2 === 'number' && GEN1_EVOLUTIONS[_cd2];
						if (_ne2) {
							this._triggerWildEvolution(_cd2, _ne2);
						} else {
							this._triggerEvolution();
						}
					} else {
						const _dn = dexFromKey(inv.companionForm);
						const _pLabel2 = (typeof _dn === 'number' && PMD_NAMES && PMD_NAMES[_dn]) || 'Partner';
						Dialog.open(_pLabel2 + ' gobbled the berry! Friendship: ' + inv.friendship + ' / ' + FRIENDSHIP_MAX + '.');
					}
				}

				_triggerWildEvolution(fromDex, nextEvoDex) {
					const inv = Inventory.load();
					const _oldName = (PMD_NAMES && PMD_NAMES[fromDex]) || ('#' + fromDex);
					const _newName = (PMD_NAMES && PMD_NAMES[nextEvoDex]) || ('#' + nextEvoDex);
					// Update party slot
					const _ai = inv.partyActive || 0;
					const _slot = (inv.party || [])[_ai];
					if (_slot) _slot.form = nextEvoDex;
					inv.companionForm = nextEvoDex;
					Inventory.save(inv);
					// Switch follower sprite in-place (no page reload needed)
					this._switchFollower(nextEvoDex, { silent: true });
					Pokedex.markSeen(nextEvoDex);
					TrainerLevel.addXP('evolve');
					Achievements.unlock('firstEvol');
					Sound.evolve();
					// Flash overlay (same style as Eevee)
					const _flash2 = document.createElement('div');
					_flash2.style.cssText = 'position:fixed;inset:0;z-index:9999;background:white;opacity:0;pointer-events:none;transition:opacity 0.18s';
					document.body.appendChild(_flash2);
					setTimeout(() => { _flash2.style.opacity = '0.9'; }, 50);
					setTimeout(() => { _flash2.style.opacity = '0'; }, 320);
					setTimeout(() => { _flash2.style.opacity = '0.5'; }, 520);
					setTimeout(() => { _flash2.style.opacity = '0'; }, 720);
					setTimeout(() => { if (_flash2.parentNode) _flash2.remove(); }, 1400);
					Dialog.open(_oldName + ' is glowing! It evolved into ' + _newName + '!');
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

				updateSnow() {
					if (!this.snowContainer) return;
					if (!this.isSnowing && this.snowflakes.length === 0) return;
					const vw = this.scale.width;
					const vh = this.scale.height;
					if (this.isSnowing && this.tick % 3 === 0 && this.snowflakes.length < 60) {
						const flake = this.add.text(Math.random() * vw, -12, '❄', { fontSize: (7 + (Math.random() * 6 | 0)) + 'px', alpha: 0.7 + Math.random() * 0.3 });
						flake.setScrollFactor(0).setDepth(4.4);
						this.snowContainer.add(flake);
						this.snowflakes.push({ obj: flake, vy: 0.8 + Math.random() * 1.2, vx: Math.random() * 0.8 - 0.4, wobble: Math.random() * Math.PI * 2 });
					}
					for (let i = this.snowflakes.length - 1; i >= 0; i--) {
						const f = this.snowflakes[i];
						f.wobble += 0.03;
						f.obj.y += f.vy;
						f.obj.x += f.vx + Math.sin(f.wobble) * 0.4;
						if (f.obj.y > vh + 20) {
							f.obj.destroy();
							this.snowflakes.splice(i, 1);
						}
					}
				}

				updateFog() {
					if (!this.fogOverlay) return;
					const targetAlpha = this.isFoggy ? 0.30 : 0;
					const current = this.fogOverlay.alpha;
					if (Math.abs(current - targetAlpha) > 0.003) {
						this.fogOverlay.setAlpha(current + (targetAlpha - current) * 0.04);
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
					const W = this.scale.width, H = this.scale.height;
					if (W <= 0 || H <= 0) { this.events.once("postupdate", () => this.applyZoom()); return; }
					const mapW = MAP_W * TILE, mapH = MAP_H * TILE;
					// Fill viewport: zoom so map covers both axes
					let s = Math.ceil(Math.max(W / mapW, H / mapH));
					s = Math.max(2, Math.min(s, 4));
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
					this.justPressedE = Phaser.Input.Keyboard.JustDown(k.interact) || TouchActions.consume('interact');
					if (this.justPressedE) {
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
						else if (target && target.kind === 'npc' && target.npcKind === 'berrytrader') {
							BerryTrader.interact();
						}
						else if (target && target.kind === 'npc' && target.npcKind === 'guestbook') {
							Guestbook.open();
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
						else if (target && target.kind === 'dig') {
							const tc2 = Math.floor(this.player.x / TILE);
							const tr2 = Math.floor(this.player.y / TILE);
							TreasureDig.tryDig(tr2, tc2);
						}
						else if (target && target.kind === 'seasonal_npc') {
							SeasonalNPC.interact(target.npcData);
						}
						else if (target && target.kind === 'secret') {
							const secretKey = 'pokequiz_secret_' + new Date().toISOString().slice(0,10);
							const alreadyFound = !!localStorage.getItem(secretKey);
							if (alreadyFound) {
								Dialog.open('✨ You already found the secret spot today. Come back tomorrow for another treasure!');
							} else {
								localStorage.setItem(secretKey, '1');
								const invS = Inventory.load();
								invS.tokens = (invS.tokens||0) + 30;
								invS.friendshipBerries = (invS.friendshipBerries||0) + 1;
								Inventory.save(invS);
								showToast('🎁 Secret found! +30 tokens & +1 Friendship Berry!');
								Dialog.open('🎁 You found a hidden treasure chest!\nYou got: +30 tokens & 1 Friendship Berry!\nThis secret refreshes daily — check back tomorrow!');
								TrainerLevel.addXP('harvest');
								Achievements.unlock('secretFound');
							}
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

					// Wild encounter check (E near a visible wild Pokémon)
					if (this.justPressedE && !this._inWildEncounter && this._wildSpawner) {
						const _ww = this._wildSpawner.getNearby(this.player.x, this.player.y);
						if (_ww) {
							this._inWildEncounter = true;
							showWildEncounter(_ww,
								() => { this._inWildEncounter = false; },
								() => {
									this._wildSpawner.remove(_ww);
									this._inWildEncounter = false;
									try {
										const box=JSON.parse(localStorage.getItem('pokequiz_pc_box')||'[]');
										box.push({id:_ww.dexNum,name:_ww.name,caught:Date.now()});
										localStorage.setItem('pokequiz_pc_box',JSON.stringify(box));
									} catch {}
									if (window.CAMP_SYSTEMS.DexGroupRewards) window.CAMP_SYSTEMS.DexGroupRewards.markSeen(_ww.dexNum);
									showToast('Caught ' + _ww.name + '! Added to PC Box. 🎉');
								}
							);
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

					// ── Feature 1: Footprint trail ────────────────────────────────────
					if (this._footprintGraphics) {
						this._footprintTick = (this._footprintTick || 0) + 1;
						if ((vx !== 0 || vy !== 0) && this._footprintTick % 12 === 0) {
							if (!this._footprints) this._footprints = [];
							this._footprints.push({ x: this.player.x, y: this.player.y - 4, age: 0 });
						}
						this._footprintGraphics.clear();
						if (this._footprints) {
							for (let _fi = this._footprints.length - 1; _fi >= 0; _fi--) {
								const _fp = this._footprints[_fi];
								_fp.age++;
								if (_fp.age >= 20) { this._footprints.splice(_fi, 1); continue; }
								const _alpha = (1 - _fp.age / 20) * 0.35;
								this._footprintGraphics.fillStyle(0x885522, _alpha);
								this._footprintGraphics.fillCircle(_fp.x, _fp.y, 3);
							}
						}
					}

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
					this.updateSnow();
					this.updateFog();
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
	
					// ── Feature 6: Weather reactions — follower tint ─────────────────
					if (this.tick % 60 === 0) {
						const _isRaining = this.isRaining || this.isSnowing;
						if (this.follower && _isRaining) {
							this.follower.setTint(0xaaccff);
						} else if (this.follower && !_isRaining && !this._followerShiny) {
							// Only clear tint if not shiny and not Vaporeon surf
							const _ptile_r2 = Math.floor(this.player.y / TILE);
							const _ptile_c2 = Math.floor(this.player.x / TILE);
							const _isWater = this.map[_ptile_r2] && this.map[_ptile_r2][_ptile_c2] === TH2O;
							if (!_isWater) this.follower.clearTint();
						}
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

					// Bottom-right beach exit
					const onBeachExit = tr === MAP_H - 1 && tc === 28;
					const distFromBeach = Math.abs((MAP_H - 1) - tr) + Math.abs(tc - 28);
					if (distFromBeach >= 2) this.armedForBeach = true;
					if (this.armedForBeach && onBeachExit && !this.didTransition) {
						this.didTransition = true;
						safeSceneStart(this, 'beach', { from: 'camp' });
					}

					// Cave entrance transition — south cols 4-5, rows MAP_H-2 to MAP_H-1
					const onCaveEntrance = tr >= MAP_H - 2 && (tc === 4 || tc === 5);
					if (this.armedForCave == null) this.armedForCave = (this.spawnFrom !== 'cave');
					const distFromCave = (MAP_H - 1 - tr) + Math.max(0, tc < 4 ? 4 - tc : tc > 5 ? tc - 5 : 0);
					if (distFromCave >= 2) this.armedForCave = true;
					if (this.armedForCave && onCaveEntrance && !this.didTransition) {
						this.didTransition = true;
						safeSceneStart(this, 'cave', { from: 'camp' });
					}

					// Wild spawner position update
					if (this._wildSpawner) this._wildSpawner.update(this.player, this.cameras.main);

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
	window.CAMP_SCENES.makeSceneClass = makeSceneClass;

	// ── makeHouseSceneClass ────────────────────────────────────────────────────────
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

					// Partner follower sprite
					this._buildMarketFollower();
	
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
	
					__S._sceneKeyboard = this.input.keyboard;
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
					const dpr = window.devicePixelRatio || 1;
					const vw = this.scale.width / dpr;
					const vh = this.scale.height / dpr;
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

					// Partner follower trails the player indoors (method borrowed
					// from MarketScene via the makeHouseSceneClass patch below).
					if (this._updateMarketFollower) this._updateMarketFollower(vx, vy);

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
	window.CAMP_SCENES.makeHouseSceneClass = makeHouseSceneClass;

	// ── makeUpstairsSceneClass ────────────────────────────────────────────────────────
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
	
					__S._sceneKeyboard = this.input.keyboard;
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
					const dpr = window.devicePixelRatio || 1;
					const vw = this.scale.width / dpr;
					const vh = this.scale.height / dpr;
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
	window.CAMP_SCENES.makeUpstairsSceneClass = makeUpstairsSceneClass;

	// ── makeMarketSceneClass ────────────────────────────────────────────────────────
		function makeMarketSceneClass() {
			return class MarketScene extends Phaser.Scene {
				constructor() { super({ key: 'market' }); }
	
				init(data) {
					this.spawnFrom = (data && data.from) || consumeBootFrom('market') || null;
				}
	
				preload() {
					this.load.image('player-base', 'Pictures/sprites/calem.png');
					// Partner-follower PMD walk sheets — required by _buildMarketFollower();
					// without these the follower renders as a missing-texture box and the
					// bad animation frames freeze the scene.
					this.load.spritesheet('eevee',    'Pictures/sprites/eevee.png',    { frameWidth: 40, frameHeight: 48 });
					this.load.spritesheet('vaporeon', 'Pictures/sprites/vaporeon.png', { frameWidth: 32, frameHeight: 48 });
					this.load.spritesheet('espeon',   'Pictures/sprites/espeon.png',   { frameWidth: 32, frameHeight: 48 });
					this.load.spritesheet('umbreon',  'Pictures/sprites/umbreon.png',  { frameWidth: 32, frameHeight: 40 });
					this.load.spritesheet('flareon',  'Pictures/sprites/flareon.png',  { frameWidth: 32, frameHeight: 40 });
					this.load.spritesheet('jolteon',  'Pictures/sprites/jolteon.png',  { frameWidth: 32, frameHeight: 40 });
					this.load.spritesheet('leafeon',  'Pictures/sprites/leafeon.png',  { frameWidth: 32, frameHeight: 48 });
					this.load.spritesheet('glaceon',  'Pictures/sprites/glaceon.png',  { frameWidth: 32, frameHeight: 40 });
					this.load.spritesheet('sylveon',  'Pictures/sprites/sylveon.png',  { frameWidth: 32, frameHeight: 48 });
					// NPC trainer overworld sprites (FRLG 32×32 single-frame images).
					this.load.image('npc-youngster',     'Pictures/sprites/trainer-youngster.png');
					this.load.image('npc-camper',        'Pictures/sprites/trainer-camper.png');
					this.load.image('npc-lady',          'Pictures/sprites/trainer-lady.png');
					this.load.image('npc-gentleman',     'Pictures/sprites/trainer-gentleman.png');
					this.load.image('npc-old-lady',      'Pictures/sprites/trainer-old-lady.png');
					this.load.image('npc-scientist',     'Pictures/sprites/trainer-scientist.png');
					this.load.image('npc-cooltrainer-f', 'Pictures/sprites/trainer-cooltrainer-f.png');
					this.load.image('npc-cooltrainer-m', 'Pictures/sprites/trainer-cooltrainer-m.png');
					this.load.image('npc-picnicker', 'Pictures/sprites/trainer-picnicker.png');
					this.load.image('npc-lass', 'Pictures/sprites/trainer-lass.png');
					this.load.image('npc-bug-catcher', 'Pictures/sprites/trainer-bug-catcher.png');
					this.load.image('npc-bird-keeper', 'Pictures/sprites/trainer-bird-keeper.png');
					this.load.image('npc-fisherman', 'Pictures/sprites/trainer-fisherman.png');
					this.load.image('npc-black-belt', 'Pictures/sprites/trainer-black-belt.png');
					this.load.image('npc-beauty', 'Pictures/sprites/trainer-beauty.png');
					this.load.image('npc-hiker', 'Pictures/sprites/trainer-hiker.png');
					this.load.image('npc-sailor', 'Pictures/sprites/trainer-sailor.png');
					this.load.image('npc-super-nerd', 'Pictures/sprites/trainer-super-nerd.png');
					this.load.image('npc-swimmer-m', 'Pictures/sprites/trainer-swimmer-m.png');
					this.load.image('npc-swimmer-f', 'Pictures/sprites/trainer-swimmer-f.png');
					this.load.image('npc-psychic', 'Pictures/sprites/trainer-psychic.png');
					this.load.image('npc-hex-maniac', 'Pictures/sprites/trainer-hex-maniac.png');
					this.load.image('npc-ninja-boy', 'Pictures/sprites/trainer-ninja-boy.png');
					this.load.image('npc-ranger-m', 'Pictures/sprites/trainer-ranger-m.png');
					this.load.image('npc-ranger-f', 'Pictures/sprites/trainer-ranger-f.png');
					this.load.image('npc-parasol-lady', 'Pictures/sprites/trainer-parasol-lady.png');
					this.load.image('npc-ace-trainer-m', 'Pictures/sprites/trainer-ace-trainer-m.png');
					this.load.image('npc-ace-trainer-f', 'Pictures/sprites/trainer-ace-trainer-f.png');
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
					// Paint the medieval tower art over its TBLD footprint
					this._drawMarketTower(baseCtx, 10 * TILE, 15 * TILE);
					this._drawWell(baseCtx, 17 * TILE, 16 * TILE);
					this.baseTex.refresh();
					// ── Market minimap ──────────────────────────────────────────────────
					this.minimapEl = document.getElementById('campMinimap');
					if (this.minimapEl) {
						const _mS = 2; // 2 px per market tile
						this._minimapScale = _mS;
						this.minimapEl.width  = MARKET_W * _mS;
						this.minimapEl.height = MARKET_H * _mS;
						this._minimapCtx = this.minimapEl.getContext('2d');
						this._minimapCtx.imageSmoothingEnabled = false;
						const _mOff = document.createElement('canvas');
						_mOff.width  = this.minimapEl.width;
						_mOff.height = this.minimapEl.height;
						const _mCtx = _mOff.getContext('2d');
						for (let _r = 0; _r < MARKET_H; _r++) {
							for (let _c = 0; _c < MARKET_W; _c++) {
								const _t = this.map[_r][_c];
								let _col;
								if      (SOLID.has(_t) && (_t === TTR || _t === TTR2)) _col = '#1a3311';
								else if (SOLID.has(_t) && _t === TIW)                  _col = '#888899';
								else if (SOLID.has(_t) && _t === TBLD)                 _col = '#555566';
								else if (SOLID.has(_t))                                _col = '#997744';
								else if (_t === TIF)                                   _col = '#ccbb88';
								else if (_t === TRU)                                   _col = '#aa5555';
								else if (_t === TP)                                    _col = '#c8b078';
								else                                                   _col = '#4a6e30';
								_mCtx.fillStyle = _col;
								_mCtx.fillRect(_c * _mS, _r * _mS, _mS, _mS);
							}
						}
						this._minimapCache = _mOff;
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

					// Partner follower sprite — trails the player around the market.
					// (update() already calls _updateMarketFollower each frame.)
					this._buildMarketFollower();

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
						sprite.setScale(NPC_SPRITE_SCALES[npc.species] || npc.spriteScale);
						sprite.setDepth(3);
						// Blocker is 2×2 tiles — StaticBody auto-sizes from the Rectangle
						// dimensions, and npcSolids.add() calls body.reset() to place it.
						const rect = this.add.rectangle(x, y, TILE * 2, TILE * 2);
						this.physics.add.existing(rect, true);
						npcSolids.add(rect);
						this.npcByTile[npc.r + ',' + npc.c] = npc;
					}
					this.physics.add.collider(this.player, npcSolids);
	
					// Repurpose the F (faceoff) touch button as minimap toggle in market
					const _fBtn = document.getElementById('capFaceoff');
					if (_fBtn) {
						_fBtn._mktOrig = _fBtn.textContent;
						_fBtn._mktTitle = _fBtn.title;
						_fBtn.textContent = 'M';
						_fBtn.title = 'Mini-map (M)';
						_fBtn._mktFn = (e) => { e.preventDefault(); Minimap.toggle(); };
						_fBtn.addEventListener('pointerdown', _fBtn._mktFn);
					}
					this.events.once('shutdown', () => {
						const _fb = document.getElementById('capFaceoff');
						if (_fb && _fb._mktOrig != null) {
							_fb.textContent = _fb._mktOrig;
							_fb.title       = _fb._mktTitle || '';
							if (_fb._mktFn) _fb.removeEventListener('pointerdown', _fb._mktFn);
							delete _fb._mktOrig; delete _fb._mktFn; delete _fb._mktTitle;
						}
					});
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
	
					__S._sceneKeyboard = this.input.keyboard;
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

				// ── Medieval tower pixel-art painter ─────────────────────────────────
				// Paints a 64×96 px BW2-style stone tower onto the base canvas.
				// px,py = top-left pixel of the 4×6-tile footprint (col3×16, row16×16).
				_drawMarketTower(ctx, px, py) {
					const W = 64, H = 96;
					const r = (x, y, w, h, col) => {
						ctx.fillStyle = col;
						ctx.fillRect(px + x, py + y, w, h);
					};

					// ── Palette (BW2 stone/wood) ────────────────────────────────────────
					const STONE  = '#787068';
					const SHADOW = '#504840';
					const HILIT  = '#9C9488';
					const MORTAR = '#585048';
					const DARK   = '#18100C';
					const WOOD   = '#3A2210';
					const WFRAME = '#584838';
					const GLOW   = '#F8D040';
					const GLOWL  = '#FFF0A0';
					const GLOWD  = '#C89010';

					// ── Main tower body (below battlements) ─────────────────────────────
					r(0, 14, W, H - 14, STONE);
					// Left & right shadow edges
					r(0, 14, 3, H - 14, SHADOW);
					r(W - 3, 14, 3, H - 14, SHADOW);

					// ── Horizontal mortar lines ──────────────────────────────────────────
					for (let my = 22; my < H; my += 8) {
						r(3, my, W - 6, 1, MORTAR);
					}

					// ── Vertical mortar (alternating brick offset) ────────────────────────
					const bodyRows = Math.ceil((H - 14) / 8);
					for (let by = 0; by < bodyRows; by++) {
						const offX = (by % 2 === 0) ? 8 : 16;
						for (let mx = offX; mx < W - 3; mx += 24) {
							r(mx, 14 + by * 8 + 1, 1, 6, MORTAR);
						}
					}

					// ── Battlements — 3 merlons (16 px) with 2 crenels (8 px) ──────────
					// Crenel shadow fill (depth behind gaps)
					r(16, 0, 8, 14, SHADOW);
					r(40, 0, 8, 14, SHADOW);
					// Merlons: left, centre, right
					r(0,  0, 16, 14, STONE);
					r(24, 0, 16, 14, STONE);
					r(48, 0, 16, 14, STONE);
					// Merlon highlight (top edge)
					r(0,  0, 16, 2, HILIT);
					r(24, 0, 16, 2, HILIT);
					r(48, 0, 16, 2, HILIT);
					// Merlon left-edge shadow
					r(0,  2, 2, 12, SHADOW);
					r(24, 2, 2, 12, SHADOW);
					r(48, 2, 2, 12, SHADOW);
					// Battlement ledge cap & underline
					r(0, 14, W, 2, HILIT);
					r(0, 16, W, 2, SHADOW);

					// ── Arrow slit — cross shape, vertically centred in upper body ───────
					const slitX = 28, slitY = 34;
					r(slitX,     slitY,      8, 14, MORTAR);          // outer frame
					r(slitX + 2, slitY + 1,  4, 12, DARK);            // vertical channel
					r(slitX + 1, slitY + 4,  6,  4, DARK);            // horizontal bar
					r(slitX + 3, slitY + 2,  2,  2, '#303858');       // sky-glint

					// ── Arched window with warm glow ─────────────────────────────────────
					const wX = 16, wY = 50, wW = 32, wH = 14;
					r(wX,      wY,      wW,     wH,     WFRAME);       // frame
					r(wX + 2,  wY + 2,  wW - 4, wH - 4, GLOW);        // glass
					r(wX + 2,  wY + 2,  wW - 4, 2,      GLOWL);       // top glint
					r(wX + (wW >> 1) - 1, wY + 2, 2, wH - 4, GLOWD); // vertical divider
					r(wX + 2,  wY + (wH >> 1), wW - 4, 1, GLOWD);    // horizontal divider
					// Soft glow bloom
					ctx.fillStyle = 'rgba(248,208,64,0.12)';
					ctx.fillRect(px + wX - 2, py + wY - 2, wW + 4, wH + 4);

					// ── Wooden door at base centre ────────────────────────────────────────
					const dX = 18, dY = 76, dW = 28, dH = 20;
					r(dX,      dY,      dW,     dH,     WFRAME);       // arch/frame
					r(dX + 2,  dY + 4,  dW - 4, dH - 4, WOOD);        // door panel
					// Plank lines on door
					r(dX + 2,  dY + 8,  dW - 4, 1, SHADOW);
					r(dX + 2,  dY + 12, dW - 4, 1, SHADOW);
					// Arch top pixels
					r(dX + 4,  dY + 2,  dW - 8, 2, WOOD);
					r(dX + 2,  dY + 3,  dW - 4, 1, WOOD);
					// Door handle
					r(dX + dW - 8, dY + 11, 4, 4, WFRAME);
					r(dX + dW - 7, dY + 12, 2, 2, '#8A7050');

					// ── Ground-shadow line at base ────────────────────────────────────────
					r(2, H - 1, W - 4, 1, SHADOW);
				}

				_drawWell(ctx, px, py) {
					const W = 32, H = 32;
					const r = (x, y, w, h, col) => {
						ctx.fillStyle = col;
						ctx.fillRect(px + x, py + y, w, h);
					};

					const STONE  = '#787068';
					const SHADOW = '#504840';
					const HILIT  = '#9C9488';
					const WATER  = '#4488CC';
					const WATERD = '#1A3060';
					const WOOD   = '#3A2210';
					const ROPE   = '#584838';
					const BUCKET = '#504840';
					const SHIMMER = '#E8F4FF';

					// Stone rim — outer ring
					r(0,  8, W, 12, STONE);
					// Shadow edges on rim
					r(0,  8, 2, 12, SHADOW);
					r(W-2, 8, 2, 12, SHADOW);
					// Highlight top edge of rim
					r(0,  8, W, 2, HILIT);
					// Water fill inside rim
					r(3, 10, W-6, 8, WATER);
					// Dark water center
					r(11, 12, 10, 4, WATERD);
					// Water shimmer
					r(5,  11, 4, 1, SHIMMER);
					r(20, 13, 3, 1, SHIMMER);

					// Stone posts left and right
					r(2,  0,  4, 20, STONE);
					r(W-6, 0, 4, 20, STONE);
					// Post highlights
					r(2,  0,  1, 20, HILIT);
					r(W-6, 0, 1, 20, HILIT);
					// Post shadows
					r(5,  0,  1, 20, SHADOW);
					r(W-4, 0, 1, 20, SHADOW);

					// Wooden crossbeam
					r(2,  6, W-4, 2, WOOD);

					// Rope hint (thin vertical from crossbeam)
					r(W/2 - 1, 8, 2, 4, ROPE);

					// Bucket
					r(W/2 - 2, 12, 4, 4, BUCKET);

					// Ground shadow at base
					r(2, 19, W-4, 1, SHADOW);
				}

				_buildMarketFollower() {
					try {
						const inv = Inventory.load();
						const formKey = inv.companionForm != null ? inv.companionForm : (inv.eeveeForm || 'eevee');
						const dexId   = dexFromKey(formKey);
						const form    = FOLLOWER_FORMS[dexId] || FOLLOWER_FORMS['eevee'];

						// Trail history — follower is 8 frames behind player
						this._followerHistory = Array(8).fill({ x: this.player.x, y: this.player.y });
						this._followerDir     = 0;

						// Bootstrap sprite with Eevee (always preloaded)
						const bootF = FOLLOWER_FORMS['eevee'];
						// Bail safely if the sheet failed to preload — building a sprite
						// on a missing texture would freeze the scene with bad anim frames.
						if (!this.textures.exists(bootF.sheet)) {
							console.warn('[MarketFollower] eevee sheet missing — skipping follower');
							return;
						}
						const bCols = bootF.cols || 7;
						const bRow  = (row) => Array.from({ length: bCols }, (_, i) => row * bCols + i);
						const bootAnims = [
							['mkt-eevee-s', bRow(0), 0],
							['mkt-eevee-w', bRow(6), 6 * bCols],
							['mkt-eevee-n', bRow(4), 4 * bCols],
							['mkt-eevee-e', bRow(2), 2 * bCols],
						];
						for (const [key, frames] of bootAnims) {
							if (!this.anims.exists(key))
								this.anims.create({ key, frameRate: 10, repeat: -1,
									frames: this.anims.generateFrameNumbers(bootF.sheet, { frames }) });
						}
						this._followerAnimKeys  = bootAnims.map(([k]) => k);
						this._followerIdleFrame = bootAnims.map(([,,idle]) => idle);

						const scaleMult = SCALE_MULT[((inv.cosmetics) || {}).partnerScale] ?? 1;
						this.follower = this.add.sprite(this.player.x, this.player.y, bootF.sheet, this._followerIdleFrame[0]);
						this.follower.setOrigin(0.5, bootF.originY);
						this.follower.setScale(bootF.scale * scaleMult);
						this._followerScaleMult = scaleMult;
						this.follower.setDepth(2.9);
						if (Partner.loadShiny()) this.follower.setTint(0xffd080);

						// Async-load real companion sprite if it differs from Eevee
						if (form.url && dexId !== 133 && formKey !== 'eevee') {
							const img = new window.Image();
							img.crossOrigin = 'anonymous';
							img.onload = () => {
								if (!this.follower || !this.game) return;
								this.game.events.once('step', () => {
									if (!this.follower || !this.game) return;
									const sheet = form.sheet;
									if (!this.textures.exists(sheet)) {
										let frameH = Math.round(img.naturalHeight / 8);
										const stdW = [24,28,32,36,40,48,56,64];
										let frameW = frameH, cols = 4;
										for (const w of stdW) {
											if (img.naturalWidth % w === 0) {
												const c = img.naturalWidth / w;
												if (c >= 3 && c <= 10) { frameW = w; cols = c; break; }
											}
										}
										const _ov = PMD_FRAME_OVERRIDES && PMD_FRAME_OVERRIDES[form.dex];
										if (_ov) { frameW = _ov.frameW; frameH = _ov.frameH; cols = _ov.cols; }
										form.frameW = frameW; form.frameH = frameH; form.cols = cols;
										if (form.dex && POKEMON_HEIGHTS[form.dex]) {
											const tv = 35 * Math.sqrt(POKEMON_HEIGHTS[form.dex] / 1.7);
											form.scale = Math.min(1.1, Math.max(0.40, tv / frameH));
										}
										try { this.textures.addSpriteSheet(sheet, img, { frameWidth: frameW, frameHeight: frameH }); }
										catch(_e) { /* texture may already exist from camp scene */ }
									}
									// Build market-prefixed anims so they don't clash with camp's
									const pf   = 'mkt' + (form.dex || dexId) + '-';
									const c2   = form.cols || 4;
									const rF   = (row) => Array.from({ length: c2 }, (_, i) => row * c2 + i);
									const aDefs = [
										[pf+'s', rF(0), 0],
										[pf+'w', rF(6), 6*c2],
										[pf+'n', rF(4), 4*c2],
										[pf+'e', rF(2), 2*c2],
									];
									for (const [key, frames] of aDefs) {
										if (this.anims.exists(key)) this.anims.remove(key);
										try { this.anims.create({ key, frameRate: 10, repeat: -1,
												frames: this.anims.generateFrameNumbers(sheet, { frames }) }); }
										catch(_e) {}
									}
									this._followerAnimKeys  = aDefs.map(([k]) => k);
									this._followerIdleFrame = aDefs.map(([,,idle]) => idle);
									if (this.follower) {
										this.follower.anims.stop();
										this.follower.setTexture(sheet, this._followerIdleFrame[this._followerDir || 0]);
										this.follower.setOrigin(0.5, form.originY);
										this.follower.setScale(form.scale * (this._followerScaleMult || 1));
										if (Partner.loadShiny()) this.follower.setTint(0xffd080);
									}
								});
							};
							img.onerror = () => {}; // keep Eevee on failure
							img.src = form.url;
						}
						this.events.once('shutdown', () => {
							if (this.follower) { this.follower.destroy(); this.follower = null; }
						});
					} catch(e) {
						console.warn('[MarketFollower] init failed:', e);
					}
				}

				_updateMarketFollower(vx, vy) {
					if (!this.follower || !this._followerHistory) return;
					// Push player's current position into history ring, pop oldest
					this._followerHistory.push({ x: this.player.x, y: this.player.y });
					if (this._followerHistory.length > 8) this._followerHistory.shift();
					const pos = this._followerHistory[0];
					this.follower.x = pos.x;
					this.follower.y = pos.y + 4; // slight offset to appear behind player

					const moving = vx !== 0 || vy !== 0;
					if (moving) {
						if      (vy > 0) this._followerDir = 0;
						else if (vx < 0) this._followerDir = 1;
						else if (vy < 0) this._followerDir = 2;
						else if (vx > 0) this._followerDir = 3;
						const key = this._followerAnimKeys && this._followerAnimKeys[this._followerDir];
						if (key && (!this.follower.anims.isPlaying || this.follower.anims.currentAnim?.key !== key))
							this.follower.anims.play(key, true);
					} else {
						this.follower.anims.stop();
						if (this._followerIdleFrame) {
							const f = this._followerIdleFrame[this._followerDir];
							if (f != null) this.follower.setFrame(f);
						}
					}
				}

				onResize() { applyWrapTop(); this.applyZoom(); }
	
				applyZoom() {
					const dpr = window.devicePixelRatio || 1;
					const vw = this.scale.width / dpr, vh = this.scale.height / dpr;
					if (vw <= 0 || vh <= 0) {
						this.events.once('postupdate', () => this.applyZoom());
						return;
					}
					const roomW = MARKET_W * TILE, roomH = MARKET_H * TILE;
					// Match the camp scene zoom formula: same pixel-density feel,
					// integer steps, min 2×, max 4×. Camera follows the player,
					// clipped to the market bounds — same as camp area.
					let s = Math.max(2, Math.floor(Math.min(vw / 380, vh / 240)));
					s = Math.min(s, 4);
					const cam = this.cameras.main;
					cam.setZoom(s);
					cam.setBounds(0, 0, roomW, roomH);
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
					// Arcane Tower — face its stone footprint (rows 15-20, cols 10-13)
					// to enter the dungeon crawl.
					if (t === TBLD && fr >= 15 && fr <= 20 && fc >= 10 && fc <= 13) {
						return { kind: 'tower', label: 'Enter' };
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
					const shopOpen = MarketShop.isOpen() || ExpeditionBoard.isOpen() || TreasureExcavation.isOpen()
					              || (typeof TowerDungeon !== 'undefined' && TowerDungeon.isOpen && TowerDungeon.isOpen());
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
					this._updateMarketFollower(vx, vy);
	
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
							lbl.textContent = target.kind === 'npc' ? (target.npc.label || 'Shop')
								: target.kind === 'tower' ? 'Enter'
								: target.kind === 'sign' ? 'Read' : 'Use';
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
						} else if (target && target.kind === 'npc' && target.npc && target.npc.kind === 'quests') {
							DailyQuests.open();
						} else if (target && target.kind === 'npc' && target.npc && target.npc.kind === 'archivist') {
							const lines = Array.isArray(target.npc.dialog) ? target.npc.dialog : [target.npc.dialog];
							Dialog.open(lines.join('\n'));
						} else if (target && target.kind === 'npc' && target.npc && target.npc.kind === 'halloffame') {
							HallOfFame.open();
						} else if (target && target.kind === 'npc' && target.npc && target.npc.kind === 'expedition') {
							ExpeditionBoard.open();
						} else if (target && target.kind === 'npc' && target.npc && target.npc.kind === 'treasure') {
							TreasureExcavation.open();
						} else if (target && target.kind === 'npc' && target.npc && target.npc.kind === 'gossip') {
							const pool = target.npc.pool || [];
							const dayIdx = Math.floor(Date.now() / 86400000);
							Dialog.open(pool[dayIdx % pool.length] || 'Nothing to say today.');
						} else if (target && target.kind === 'npc') {
							MarketShop.open(target.npc);
						} else if (target && target.kind === 'tower') {
							TowerDungeon.start();
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
	window.CAMP_SCENES.makeMarketSceneClass = makeMarketSceneClass;

	// ── makeBeachSceneClass ────────────────────────────────────────────────────────
		function makeBeachSceneClass() {
			return class BeachScene extends Phaser.Scene {
				constructor() { super({ key: 'beach' }); }

				init(data) {
					this.spawnFrom = (data && data.from) || consumeBootFrom('beach') || null;
				}

				preload() {
					this.load.image('player-base', 'Pictures/sprites/calem.png');
					this.load.image('npc-fisherman',   'Pictures/sprites/trainer-fisherman.png');
					this.load.image('npc-swimmer-m',   'Pictures/sprites/trainer-swimmer-m.png');
					this.load.image('npc-picnicker',   'Pictures/sprites/trainer-picnicker.png');
				}

				create() {
					console.log('[BeachScene] create()');
					try {
						this._buildBeach();
						requestAnimationFrame(() => requestAnimationFrame(() => {
							const f = document.getElementById('campFade');
							if (f) f.classList.add('is-hidden');
						}));
					} catch (e) {
						console.error('[BeachScene] create failed:', e);
						Debug.lastError = 'BeachScene.create: ' + e.message;
						this.scene.start('camp', { from: 'beach' });
					}
					if (typeof window !== 'undefined') window.__beachScene = this;
				}

				_buildBeach() {
					this.tick = 0;
					this.map = buildBeachMap();
					const W = BEACH_W * TILE, H = BEACH_H * TILE;

					if (this.textures.exists('beachBase')) {
						this.textures.remove('beachBase');
					}
					this.baseTex = this.textures.createCanvas('beachBase', W, H);
					if (!this.baseTex) throw new Error('createCanvas("beachBase") returned null');
					const baseCtx = this.baseTex.getContext();
					baseCtx.imageSmoothingEnabled = false;
					for (let r = 0; r < BEACH_H; r++) {
						for (let c = 0; c < BEACH_W; c++) {
							drawTile(baseCtx, this.map[r][c], c*TILE, r*TILE, 0);
						}
					}
					this.baseTex.refresh();
					this.add.image(0, 0, 'beachBase').setOrigin(0).setDepth(0);

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
						if (!this.textures.exists('player-beach') && this._playerCanvas) {
							this.textures.addSpriteSheet('player-beach', this._playerCanvas, { frameWidth: 22, frameHeight: 38 });
						} else if (this.textures.exists('player-beach')) {
							this.textures.get('player-beach').refresh();
						}
						this._onStorage = (e) => {
							if ((e.key === 'pokequiz_trainer_palette' || e.key === 'pokequiz_trainer_body') && window.TrainerPalette) {
								applyPalette();
								this.textures.get('player-beach').refresh();
							}
						};
						window.addEventListener('storage', this._onStorage);
						this.events.once('shutdown', () => window.removeEventListener('storage', this._onStorage));
					} catch (e) {
						console.error('[BeachScene] palette swap failed:', e);
					}

					const mkAnim = (key, frames) => {
						if (this.anims.exists(key)) this.anims.remove(key);
						this.anims.create({ key, frameRate: 6, repeat: -1,
							frames: this.anims.generateFrameNumbers('player-beach', { frames }) });
					};
					mkAnim('bch-walk-south', [1, 0, 2, 0]);
					mkAnim('bch-walk-west',  [4, 3, 5, 3]);
					mkAnim('bch-walk-north', [7, 6, 8, 6]);
					mkAnim('bch-walk-east',  [10, 9, 11, 9]);

					const spawnX = BEACH_NORTH_C * TILE + TILE/2;
					const spawnY = 2 * TILE + TILE/2;
					this.player = this.physics.add.sprite(spawnX, spawnY, 'player-beach', 0);
					this.player.setOrigin(0.5, 36/38);
					this.player.setScale(0.75);
					this.player.setDepth(3);
					this.player.body.setSize(10, 6);
					this.player.body.setOffset((22-10)/2, 38-8);

					// ── Beach minimap — static cache canvas (same pipeline as market) ──
					this.minimapEl = document.getElementById('campMinimap');
					if (this.minimapEl) {
						const _mS = 3; // px per beach tile
						this._minimapScale = _mS;
						this.minimapEl.width  = BEACH_W * _mS;
						this.minimapEl.height = BEACH_H * _mS;
						this._minimapCtx = this.minimapEl.getContext('2d');
						this._minimapCtx.imageSmoothingEnabled = false;
						const _mOff = document.createElement('canvas');
						_mOff.width  = this.minimapEl.width;
						_mOff.height = this.minimapEl.height;
						const _mCtx = _mOff.getContext('2d');
						for (let _r = 0; _r < BEACH_H; _r++) {
							for (let _c = 0; _c < BEACH_W; _c++) {
								const _t = this.map[_r][_c];
								let _col;
								if      (_t === TBWT)   _col = '#2c6cae';
								else if (_t === TSHO)   _col = '#d8c98f';
								else if (_t === TPALM)  _col = '#1f3d18';
								else if (_t === TROCKB) _col = '#776b5a';
								else if (_t === TPIER)  _col = '#9c7b4a';
								else                    _col = '#e6d6a0';
								_mCtx.fillStyle = _col;
								_mCtx.fillRect(_c * _mS, _r * _mS, _mS, _mS);
							}
						}
						this._minimapCache = _mOff;
					}

					this.solids = this.physics.add.staticGroup();
					for (let r = 0; r < BEACH_H; r++) {
						for (let c = 0; c < BEACH_W; c++) {
							if (SOLID.has(this.map[r][c])) {
								const rect = this.add.rectangle(c*TILE + TILE/2, r*TILE + TILE/2, TILE, TILE);
								this.physics.add.existing(rect, true);
								this.solids.add(rect);
							}
						}
					}
					this.physics.add.collider(this.player, this.solids);

					// Day-rotating dialogue pools — each NPC says a different line daily.
					const _dayIdx = Math.floor(Date.now() / 86400000);
					const BEACH_NPCS = [
						{ r:8,  c:16, species:'fisherman', label:'Talk',
						  dialogPool: [
						    "I've been fishing here for hours. The bite is best at sunset!",
						    "Catch enough fish in a day and they start biting easier — lucky streak, I call it.",
						    "Rare Pokemon lurk in the deep water. Keep casting!",
						    "Bait widens your reel window. Always worth it.",
						  ] },
						{ r:10, c:8,  species:'swimmer-m', label:'Talk',
						  dialogPool: [
						    "The water's warm today! Watch out for currents.",
						    "Try surfing the waves — your partner loves it.",
						    "At low tide the rock pools fill with treasure. Go look!",
						    "I saw a Wingull flock circling earlier. Storm coming, maybe.",
						  ] },
						{ r:5,  c:22, species:'picnicker', label:'Talk',
						  dialogPool: [
						    "I found a Pokemon fossil here once. Keep digging — it takes days!",
						    "Seashells wash up all along the sand. Collect them for the shack.",
						    "A beach picnic with your partner does wonders for friendship.",
						    "Build a sandcastle! Trainers passing by always tip well.",
						  ] },
						// Daily visitor — a different trainer each day, hands out a small gift.
						{ r:4,  c:13, species:['fisherman','swimmer-m','picnicker'][_dayIdx % 3],
						  label:'Talk', kind:'visitor',
						  dialog: "Oh, a fellow beachgoer! Here, take this — found it down the shore." },
					];
					this.npcByTile = {};
					const npcSolids = this.physics.add.staticGroup();
					for (const npc of BEACH_NPCS) {
						const nx = npc.c * TILE + TILE/2;
						const ny = npc.r * TILE + TILE/2;
						const sprite = this.add.sprite(nx, ny, 'npc-' + npc.species, 0);
						sprite.setOrigin(0.5, 0.875);
						sprite.setScale(0.75);
						sprite.setDepth(3);
						const rect = this.add.rectangle(nx, ny, TILE * 2, TILE * 2);
						this.physics.add.existing(rect, true);
						npcSolids.add(rect);
						this.npcByTile[npc.r + ',' + npc.c] = npc;
					}
					this.physics.add.collider(this.player, npcSolids);

					this._interactSpots = {
						'6,3':  { kind: 'wishing_well',   label: 'Wish' },
						'8,25': { kind: 'treasure_spot',  label: 'Dig'  },
						'9,20': { kind: 'bottle_message', label: 'Read' },
					};
					for (let pr = 10; pr <= 12; pr++) {
						this._interactSpots[pr + ',16'] = { kind: 'pier_fishing', label: 'Fish' };
					}

					// Beachfront overhaul — shells, activity spots, ambiance, wildlife.
					try { this._initBeachFeatures(); }
					catch (e) { console.warn('[Beach] features init failed:', e); }

					this.physics.world.setBounds(0, 0, W, H);
					this.player.setCollideWorldBounds(true);
					this.cameras.main.setBounds(0, 0, W, H);
					this.cameras.main.setBackgroundColor('#2090B8');
					this.cameras.main.setRoundPixels(true);
					this.cameras.main.startFollow(this.player, true, 1, 1);
					this.applyZoom();
					this.scale.on('resize', this.onResize, this);
					this.events.once('shutdown', () => this.scale.off('resize', this.onResize, this));

					__S._sceneKeyboard = this.input.keyboard;
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
					Music.start('beach');
					this.events.once('shutdown', () => Music.stop());

					this.dir = 0;
					this.dirAnimKeys = ['bch-walk-south', 'bch-walk-west', 'bch-walk-north', 'bch-walk-east'];
					this.dirIdleFrame = [0, 3, 6, 9];
					this.player.setFrame(this.dirIdleFrame[this.dir]);
					this.didTransition = false;
					this.armedForExit = false;

					this._promptEl  = document.getElementById('campPrompt');
					this._promptLbl = document.getElementById('campPromptLabel');
					this._locEl = document.querySelector('.camp-location-name');
					if (this._locEl) {
						this._prevLocText = this._locEl.textContent;
						this._locEl.textContent = 'BEACH PIER';
					}
					this.events.once('shutdown', () => {
						if (this._promptEl) this._promptEl.hidden = true;
						if (this._locEl && this._prevLocText) this._locEl.textContent = this._prevLocText;
					});
				}

				onResize() { applyWrapTop(); this.applyZoom(); }

				applyZoom() {
					const W = this.scale.width, H = this.scale.height;
					if (W <= 0 || H <= 0) {
						this.events.once('postupdate', () => this.applyZoom());
						return;
					}
					const roomW = BEACH_W * TILE, roomH = BEACH_H * TILE;
					// Fill viewport: zoom until map covers both axes
					let s = Math.ceil(Math.max(W / roomW, H / roomH));
					s = Math.max(2, Math.min(s, 4));
					const cam = this.cameras.main;
					cam.setZoom(s);
					cam.setBounds(0, 0, roomW, roomH);
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

				findInteractTarget() {
					const tc = Math.floor(this.player.x / TILE);
					const tr = Math.floor(this.player.y / TILE);
					const DV = [[0,1],[-1,0],[0,-1],[1,0]];
					const [dc, dr] = DV[this.dir] || [0, 1];
					const fc = tc + dc, fr = tr + dr;
					const npcKey = fr + ',' + fc;
					if (this.npcByTile && this.npcByTile[npcKey]) {
						return { kind: 'npc', npc: this.npcByTile[npcKey] };
					}
					const spotKey = tr + ',' + tc;
					if (this._interactSpots && this._interactSpots[spotKey]) {
						return { kind: 'spot', spot: this._interactSpots[spotKey] };
					}
					const facingKey = fr + ',' + fc;
					if (this._interactSpots && this._interactSpots[facingKey]) {
						return { kind: 'spot', spot: this._interactSpots[facingKey] };
					}
					const t = this.map[fr] && this.map[fr][fc];
					if (t === TSG) {
						const msg = SIGN_MESSAGES_BEACH && SIGN_MESSAGES_BEACH[fr + ',' + fc];
						if (msg) return { kind: 'sign', message: msg };
					}
					return null;
				}

				// ── Beachfront features — built once in _buildBeach ──────────────
				_initBeachFeatures() {
					this._beachTick = 0;

					// Warm sunset overlay — alpha is driven each frame by the clock.
					this._sunsetOverlay = this.add
						.rectangle(0, 0, BEACH_W * TILE, BEACH_H * TILE, 0xff7a3c, 0)
						.setOrigin(0).setDepth(20);

					// Ambient Wingull — drifting pixel-art birds that flap their wings.
					this._gulls = [];
					for (let i = 0; i < 3; i++) {
						const g = this.add.graphics().setDepth(19);
						g._gx = Math.random() * BEACH_W * TILE;
						g._gy = (2 + Math.random() * 5) * TILE;
						g._gspd = 0.25 + Math.random() * 0.35;
						g._gphase = i * 3;
						this._gulls.push(g);
					}

					// Wailmer breaching far out on the horizon water, blowing a spout.
					this._wailmer = this.add.graphics().setDepth(0.7);
					this._wailmerX = BEACH_W * TILE * 0.4;
					this._wailmerY = 17 * TILE;

					// Seashells — collectible sprites scattered on the dry sand.
					this._shells = [];
					const occupied = new Set(Object.keys(this._interactSpots));
					Object.keys(this.npcByTile || {}).forEach(k => occupied.add(k));
					let placed = 0, tries = 0;
					while (placed < 6 && tries < 300) {
						tries++;
						const r = 3 + Math.floor(Math.random() * 5);
						const c = 3 + Math.floor(Math.random() * (BEACH_W - 6));
						const key = r + ',' + c;
						if (occupied.has(key) || !this.map[r] || SOLID.has(this.map[r][c])) continue;
						occupied.add(key);
						const sx = c * TILE + TILE / 2, sy = r * TILE + TILE / 2;
						const g = this.add.graphics().setDepth(2.5);
						g.fillStyle(0xf3d9b0, 1); g.fillCircle(sx, sy + 3, 4);
						g.fillStyle(0xe0a6c0, 1); g.fillCircle(sx, sy + 3, 2.4);
						g.lineStyle(1, 0xc98a52, 1);
						g.beginPath(); g.moveTo(sx, sy - 1); g.lineTo(sx, sy + 5); g.strokePath();
						g._sr = r; g._sc = c;
						this._shells.push(g);
						placed++;
					}

					// Activity spots — only register where the tile is walkable.
					const addSpot = (r, c, kind, label) => {
						if (this.map[r] && !SOLID.has(this.map[r][c]) && !this._interactSpots[r + ',' + c])
							this._interactSpots[r + ',' + c] = { kind, label, r, c };
					};
					addSpot(4, 6,  'sandcastle',  'Build');
					addSpot(6, 11, 'picnic',      'Picnic');
					addSpot(7, 27, 'fossil',      'Excavate');
					addSpot(10, 5, 'surf',        'Surf');
					addSpot(9, 24, 'tide_pool',   'Search');
					addSpot(3, 20, 'beach_shack', 'Shop');

					// ── Beach Shack — a proper thatched-roof hut ───────────────────
					const hut = this.add.graphics().setDepth(2.6);
					const hx = 19 * TILE + 2, hy = 2 * TILE + 6; // top-left of the hut
					// shadow
					hut.fillStyle(0x000000, 0.18); hut.fillEllipse(hx + 20, hy + 32, 44, 9);
					// support posts
					hut.fillStyle(0x6e4622, 1);
					hut.fillRect(hx + 3, hy + 14, 4, 18);
					hut.fillRect(hx + 33, hy + 14, 4, 18);
					// back wall / counter
					hut.fillStyle(0xcaa36a, 1); hut.fillRect(hx + 5, hy + 15, 30, 14);
					hut.fillStyle(0xb98f55, 1); hut.fillRect(hx + 5, hy + 24, 30, 5); // counter top
					hut.fillStyle(0x8a6a3c, 1);
					for (let p = 0; p < 6; p++) hut.fillRect(hx + 7 + p * 5, hy + 16, 1, 8); // plank lines
					// thatched palm roof — overhanging, layered fronds
					hut.fillStyle(0x9c7a30, 1);
					hut.fillTriangle(hx - 4, hy + 16, hx + 44, hy + 16, hx + 20, hy - 6);
					hut.fillStyle(0xc6a042, 1);
					hut.fillTriangle(hx - 2, hy + 13, hx + 42, hy + 13, hx + 20, hy - 3);
					hut.fillStyle(0xe0bd5c, 1);
					hut.fillTriangle(hx + 2, hy + 9, hx + 38, hy + 9, hx + 20, hy + 1);
					// roof ridge palm tuft
					hut.fillStyle(0x3d6b22, 1);
					hut.fillCircle(hx + 20, hy - 6, 4);
					hut.fillCircle(hx + 16, hy - 4, 3); hut.fillCircle(hx + 24, hy - 4, 3);
					// shells on the counter
					hut.fillStyle(0xf3d9b0, 1); hut.fillCircle(hx + 11, hy + 23, 2.5);
					hut.fillStyle(0xe0a6c0, 1); hut.fillCircle(hx + 11, hy + 23, 1.4);
					hut.fillStyle(0xf3d9b0, 1); hut.fillCircle(hx + 29, hy + 23, 2.5);
					hut.fillStyle(0xd98f86, 1); hut.fillCircle(hx + 29, hy + 23, 1.4);

					this._sandcastleG = this.add.graphics().setDepth(2.5);
					this._renderSandcastle();
				}

				_renderSandcastle() {
					if (!this._sandcastleG) return;
					this._sandcastleG.clear();
					if (!localStorage.getItem('pokequiz_beach_sandcastle_' + new Date().toDateString())) return;
					let entry = null;
					for (const [k, s] of Object.entries(this._interactSpots || {})) {
						if (s.kind === 'sandcastle') { entry = k; break; }
					}
					if (!entry) return;
					const [r, c] = entry.split(',').map(Number);
					const x = c * TILE + TILE / 2, y = r * TILE + TILE / 2, g = this._sandcastleG;
					g.fillStyle(0xe8caa0, 1);
					g.fillRect(x - 6, y, 12, 6);
					g.fillRect(x - 5, y - 4, 3, 5); g.fillRect(x + 2, y - 4, 3, 5);
					g.fillRect(x - 1.5, y - 6, 3, 7);
					g.fillStyle(0xc99a5a, 1); g.fillRect(x - 6, y + 5, 12, 2);
				}

				// Original pixel-art Wingull — white seabird with blue-grey wings and
				// an orange beak; `flap` toggles the wing pose for a flight cycle.
				_drawWingull(g, x, y, flap) {
					g.clear();
					const px = (c, a, b, w, h) => { g.fillStyle(c, 1); g.fillRect(Math.round(x + a), Math.round(y + b), w, h); };
					// body + head (white)
					px(0xffffff, -3, -1, 6, 4);
					px(0xffffff,  2, -3, 4, 4);
					// blue-grey crest/back
					px(0x5c8fce, -3, -2, 5, 2);
					px(0x5c8fce,  2, -3, 3, 1);
					// orange beak
					px(0xf2a13a,  6, -1, 3, 2);
					// eye
					px(0x202830,  4, -1, 1, 1);
					// wings — up vs down pose
					if (flap) {
						px(0xffffff, -6, -5, 4, 2);
						px(0xffffff, -3, -3, 3, 2);
						px(0x5c8fce, -6, -5, 2, 1);
					} else {
						px(0xffffff, -7,  1, 5, 2);
						px(0xffffff, -3,  2, 3, 2);
						px(0x5c8fce, -7,  2, 2, 1);
					}
					// tail
					px(0xffffff, -5, -1, 2, 3);
				}

				_updateBeachFeatures() {
					this._beachTick = (this._beachTick || 0) + 1;
					const clock = (performance.now() / 1000) % 360;

					// Sunset glow — warm overlay that peaks during the dusk window.
					if (this._sunsetOverlay) {
						let a = 0;
						if (clock > 130 && clock < 200)      a = (clock - 130) / 70 * 0.3;
						else if (clock >= 200 && clock < 250) a = 0.3;
						else if (clock >= 250 && clock < 300) a = (1 - (clock - 250) / 50) * 0.3;
						this._sunsetOverlay.setAlpha(a);
					}

					// Drift the Wingull flock — proper little pixel birds that flap.
					if (this._gulls) {
						for (const g of this._gulls) {
							g._gx += g._gspd;
							if (g._gx > BEACH_W * TILE + 24) { g._gx = -24; g._gy = (2 + Math.random() * 5) * TILE; }
							const wob = Math.sin(this._beachTick * 0.07 + g._gx * 0.05) * 2;
							const flap = Math.floor(this._beachTick / 9 + (g._gphase || 0)) % 2 === 0;
							this._drawWingull(g, g._gx, g._gy + wob, flap);
						}
					}

					// Wailmer breaching the horizon — body bobs, spout sprays on a cycle.
					if (this._wailmer) {
						const w = this._wailmer;
						const x = this._wailmerX, y = this._wailmerY;
						const bob = Math.sin(this._beachTick * 0.04) * 2;
						w.clear();
						// rounded blue back breaching the water
						w.fillStyle(0x2d6fb0, 1); w.fillEllipse(x, y + bob, 34, 17);
						w.fillStyle(0x3f86c8, 1); w.fillEllipse(x, y - 2 + bob, 28, 12);
						w.fillStyle(0xbfe0f0, 0.7); w.fillEllipse(x - 6, y - 5 + bob, 9, 4); // sheen
						// yellow eye-spot patches (Wailmer marking)
						w.fillStyle(0xe8c34a, 1);
						w.fillCircle(x - 9, y - 1 + bob, 2.5);
						w.fillCircle(x + 9, y - 1 + bob, 2.5);
						// water line in front so it reads as half-submerged
						w.fillStyle(0x2c6cae, 0.85); w.fillRect(x - 20, y + 6 + bob, 40, 6);
						// animated blow-hole spout
						const phase = (this._beachTick % 150);
						if (phase < 46) {
							const up = phase < 23 ? phase / 23 : 1 - (phase - 23) / 23;
							const sh = 4 + up * 18;
							w.fillStyle(0xdff1fb, 0.9);
							w.fillRect(x - 2, y - 7 + bob - sh, 4, sh);
							w.fillStyle(0xffffff, 0.95);
							w.fillCircle(x, y - 8 + bob - sh, 3 + up * 2);
							w.fillCircle(x - 4, y - 6 + bob - sh * 0.7, 2);
							w.fillCircle(x + 4, y - 6 + bob - sh * 0.7, 2);
						}
					}

					// Auto-collect a seashell the player walks over.
					if (this._shells && this._shells.length) {
						const pr = Math.floor(this.player.y / TILE);
						const pc = Math.floor(this.player.x / TILE);
						for (let i = this._shells.length - 1; i >= 0; i--) {
							const s = this._shells[i];
							if (s._sr === pr && s._sc === pc) {
								s.destroy();
								this._shells.splice(i, 1);
								const inv = Inventory.load();
								inv.seashells = (inv.seashells || 0) + 1;
								Inventory.save(inv);
								try { Sound.chime && Sound.chime(); } catch (_) {}
								try { DailyQuests.increment('shell'); } catch (_) {}
								showToast('🐚 Seashell collected — ' + inv.seashells + ' total');
							}
						}
					}
				}

				_handleSpot(spot) {
					const today = new Date().toDateString();
					if (spot.kind === 'sandcastle') {
						const key = 'pokequiz_beach_sandcastle_' + today;
						if (localStorage.getItem(key)) { Dialog.open('Your sandcastle still stands proud — the tide will claim it by tomorrow.'); return; }
						localStorage.setItem(key, '1');
						const inv = Inventory.load();
						inv.tokens = (inv.tokens || 0) + 12;
						Inventory.save(inv);
						this._renderSandcastle();
						Dialog.open('You build a magnificent sandcastle! A passing trainer tips you 12 tokens.');
						showToast('+12 tokens — nice sandcastle!');
						return;
					}
					if (spot.kind === 'picnic') {
						const key = 'pokequiz_beach_picnic_' + today;
						if (localStorage.getItem(key)) { Dialog.open('You and your partner already enjoyed a seaside picnic today.'); return; }
						localStorage.setItem(key, '1');
						const inv = Inventory.load();
						if ((inv.eeveeForm || 'eevee') === 'eevee')
							inv.friendship = Math.min(FRIENDSHIP_MAX, (inv.friendship || 0) + 15);
						Inventory.save(inv);
						Dialog.open('You share a picnic with your partner by the waves. It looks overjoyed — friendship grew!');
						showToast('Beach picnic — friendship up!');
						return;
					}
					if (spot.kind === 'surf') {
						const key = 'pokequiz_beach_surf_' + today;
						if (localStorage.getItem(key)) { Dialog.open('The waves have calmed. Come back tomorrow to surf again!'); return; }
						localStorage.setItem(key, '1');
						const inv = Inventory.load();
						const b = 2 + Math.floor(Math.random() * 3);
						inv.friendshipBerries = (inv.friendshipBerries || 0) + b;
						Inventory.save(inv);
						Dialog.open('You ride the waves on your partner\'s back — what a rush! You scoop up ' + b + ' berries bobbing in the surf.');
						showToast('+' + b + ' berries from surfing!');
						return;
					}
					if (spot.kind === 'tide_pool') {
						const lowTide = today && (((performance.now() / 1000) % 360) < 120 || ((performance.now() / 1000) % 360) > 300);
						if (!lowTide) { Dialog.open('The tide is in — this rock pool is underwater. Search again at low tide.'); return; }
						const key = 'pokequiz_beach_tidepool_' + today;
						if (localStorage.getItem(key)) { Dialog.open('The tide pool is quiet now. The next tide will refill it.'); return; }
						localStorage.setItem(key, '1');
						const inv = Inventory.load();
						inv.tokens = (inv.tokens || 0) + 8;
						inv.seashells = (inv.seashells || 0) + 2;
						Inventory.save(inv);
						Dialog.open('You explore the tide pool and find coins and shells wedged among the rocks. +8 tokens, +2 🐚!');
						showToast('Tide pool: +8 tokens, +2 shells');
						return;
					}
					if (spot.kind === 'fossil') {
						const dayK = 'pokequiz_beach_fossil_' + today;
						if (localStorage.getItem(dayK)) { Dialog.open('You\'ve excavated here today. Freeing a fossil takes patience — return tomorrow.'); return; }
						localStorage.setItem(dayK, '1');
						const fk = 'pokequiz_beach_fossil_progress';
						let prog = (parseInt(localStorage.getItem(fk) || '0', 10) || 0) + 1;
						const NEED = 5;
						if (prog >= NEED) {
							localStorage.removeItem(fk);
							const inv = Inventory.load();
							inv.tokens = (inv.tokens || 0) + 50;
							Inventory.save(inv);
							Dialog.open('At last — you free an ancient Pokémon fossil from the rock! A collector rewards you 50 tokens.');
							showToast('Fossil revived! +50 tokens');
						} else {
							localStorage.setItem(fk, String(prog));
							Dialog.open('You chip away at the buried fossil. (' + prog + ' / ' + NEED + ' fragments uncovered.)');
							showToast('Fossil fragment ' + prog + ' / ' + NEED);
						}
						return;
					}
					if (spot.kind === 'beach_shack') {
						BeachShack.open();
						return;
					}
					this._handleSpotLegacy(spot);
				}

				_handleSpotLegacy(spot) {
					const today = new Date().toDateString();
					if (spot.kind === 'wishing_well') {
						const key = 'pokequiz_beach_wishing_well_' + today;
						if (localStorage.getItem(key)) {
							Dialog.open("The well shimmers quietly. Come back tomorrow for another wish!");
							return;
						}
						localStorage.setItem(key, '1');
						const inv = Inventory.load();
						inv.tokens = (inv.tokens || 0) + 5;
						Inventory.save(inv);
						const fortunes = [
							"A great adventure awaits you on the horizon!",
							"Friendship is your strongest power.",
							"The rarest Pokemon will appear when you least expect it.",
							"Today's catch will be legendary!",
							"Patience is the key to becoming a master trainer.",
							"A shiny surprise may be closer than you think!",
							"Your bond with your partner grows stronger every day.",
							"Great things come to those who keep trying!",
						];
						const fortune = fortunes[Math.floor(Date.now() / 86400000) % fortunes.length];
						Dialog.open(fortune + '\n+5 tokens from the wishing well!');
						showToast('+5 tokens from the wishing well!');
					} else if (spot.kind === 'treasure_spot') {
						const key = 'pokequiz_beach_treasure_spot_' + today;
						if (localStorage.getItem(key)) {
							Dialog.open("The sand is undisturbed here. Maybe tomorrow the tide will wash in something new?");
							return;
						}
						localStorage.setItem(key, '1');
						const inv = Inventory.load();
						const berriesFound = 1 + Math.floor(Math.random() * 3);
						inv.friendshipBerries = (inv.friendshipBerries || 0) + berriesFound;
						Inventory.save(inv);
						Dialog.open('You dig in the sand and find ' + berriesFound + ' buried berries! Someone must have hidden them here.');
						showToast('+' + berriesFound + ' berries found!');
					} else if (spot.kind === 'bottle_message') {
						const key = 'pokequiz_beach_bottle_message_' + today;
						const messages = [
							"Keep training hard! A true champion never gives up! — A Mystery Trainer",
							"The ocean holds many secrets. Dive deep and you'll find your destiny! — A Mystery Trainer",
							"I once caught a shiny Gyarados at this very pier. Believe in your luck! — A Mystery Trainer",
							"A Pokemon's friendship is worth more than any trophy. Cherish it! — A Mystery Trainer",
							"Every step of your journey matters. Don't rush the adventure! — A Mystery Trainer",
							"The rarest berries grow where no one looks. Explore everywhere! — A Mystery Trainer",
							"I left you something for the road. May your battles be ever in your favor! — A Mystery Trainer",
							"The best trainers I've met had one thing in common: they never stopped believing! — A Mystery Trainer",
						];
						const msg = messages[Math.floor(Date.now() / 86400000) % messages.length];
						if (!localStorage.getItem(key)) {
							localStorage.setItem(key, '1');
							const inv = Inventory.load();
							inv.tokens = (inv.tokens || 0) + 5;
							Inventory.save(inv);
							Dialog.open('You find a bottle washed ashore. Inside is a note:\n\n"' + msg + '"\n\n+5 tokens!');
							showToast('+5 tokens from bottle message!');
						} else {
							Dialog.open('You find a bottle washed ashore. Inside is a note:\n\n"' + msg + '"');
						}
					} else if (spot.kind === 'pier_fishing') {
						Fishing.start();
					}
				}

				update() {
					this.tick++;
					if (this.didTransition) {
						this.player.setVelocity(0, 0);
						return;
					}
					applyDayNight();
					Dialog.tick();
					try { this._updateBeachFeatures(); } catch (_) {}
					const dialogOpen = Dialog.isOpen();
					// Freeze movement while a beach overlay (fishing / shack) is open.
					const overlayOpen = (typeof Fishing !== 'undefined' && Fishing.isOpen && Fishing.isOpen())
					                 || (typeof BeachShack !== 'undefined' && BeachShack.isOpen && BeachShack.isOpen());
					const k = this.keys, d = this.dpad;
					let vx = 0, vy = 0;
					if (!dialogOpen && !overlayOpen) {
						if (k.up.isDown    || k.w.isDown || d.up)    { vy = -SPEED; this.dir = 2; }
						if (k.down.isDown  || k.s.isDown || d.down)  { vy =  SPEED; this.dir = 0; }
						if (k.left.isDown  || k.a.isDown || d.left)  { vx = -SPEED; this.dir = 1; }
						if (k.right.isDown || k.d.isDown || d.right) { vx =  SPEED; this.dir = 3; }
						if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
					}
					this.player.setVelocity(vx, vy);

					const animCtx = this.baseTex && this.baseTex.getContext ? this.baseTex.getContext() : null;
					if (animCtx) {
						for (let r = 9; r < BEACH_H; r++) {
							for (let c = 2; c < BEACH_W - 2; c++) {
								const t = this.map[r][c];
								if (t === TBWT || t === TSHO) {
									drawTile(animCtx, t, c*TILE, r*TILE, this.tick);
								}
							}
						}
						this.baseTex.refresh();
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

					const tc = Math.floor(this.player.x / TILE);
					const tr = Math.floor(this.player.y / TILE);

					const onExitTile = tr <= 1 && tc >= 14 && tc <= 16;
					const distFromExit = Math.max(0, tr - 1) + Math.max(0, 14 - tc, tc - 16);
					if (distFromExit >= 2) this.armedForExit = true;

					const target = this.findInteractTarget();
					const ePressed = Phaser.Input.Keyboard.JustDown(k.interact) || TouchActions.consume('interact');

					const pe = this._promptEl;
					const lbl = this._promptLbl;
					const showPrompt = !dialogOpen && target;
					if (pe && lbl) {
						if (showPrompt) {
							const lblText = target.kind === 'npc' ? (target.npc.label || 'Talk') : (target.kind === 'spot' ? (target.spot.label || 'Use') : 'Read');
							lbl.textContent = lblText;
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

					if (ePressed && !overlayOpen) {
						if (dialogOpen) {
							Dialog.advance();
						} else if (target && target.kind === 'npc') {
							const npc = target.npc;
							if (npc.kind === 'visitor') {
								// Daily visitor — hands out one small gift per day.
								const vk = 'pokequiz_beach_visitor_' + new Date().toDateString();
								if (localStorage.getItem(vk)) {
									Dialog.open('Enjoy the beach! I already gave you something today.');
								} else {
									localStorage.setItem(vk, '1');
									const inv = Inventory.load();
									const roll = Math.random();
									let msg;
									if (roll < 0.4)      { inv.tokens = (inv.tokens||0)+15; msg = '+15 tokens'; }
									else if (roll < 0.75){ inv.friendshipBerries = (inv.friendshipBerries||0)+3; msg = '+3 Friendship Berries'; }
									else                 { inv.seashells = (inv.seashells||0)+5; msg = '+5 seashells'; }
									Inventory.save(inv);
									Dialog.open(npc.dialog + '\n\n(' + msg + '!)');
									showToast('Daily beach gift: ' + msg);
								}
							} else if (Array.isArray(npc.dialogPool)) {
								const dayIdx = Math.floor(Date.now() / 86400000);
								Dialog.open(npc.dialogPool[dayIdx % npc.dialogPool.length]);
							} else {
								const lines = Array.isArray(npc.dialog) ? npc.dialog : [npc.dialog];
								Dialog.open(lines.join('\n'));
							}
						} else if (target && target.kind === 'spot') {
							this._handleSpot(target.spot);
						} else if (target && target.kind === 'sign') {
							Dialog.open(target.message);
						}
					}

					if (!this.didTransition && this.armedForExit && onExitTile && !dialogOpen) {
						this.didTransition = true;
						if (pe) pe.hidden = true;
						safeSceneStart(this, 'camp', { from: 'beach' });
					}

					Debug.render(
						'BEACH\n' +
						'tile  ' + tc + ',' + tr + '\n' +
						'target ' + (target ? target.kind : '-') + '\n' +
						'distE ' + distFromExit + '\n' +
						'armed ' + this.armedForExit + '\n' +
						'trans ' + this.didTransition + '\n' +
						(Debug.lastError ? 'ERR ' + Debug.lastError : '')
					);
				}
			};
		}
	window.CAMP_SCENES.makeBeachSceneClass = makeBeachSceneClass;

	// ── buildCaveMap ────────────────────────────────────────────────────────────
		function buildCaveMap() {
			const CH=18, CW=22;
			const m=Array.from({length:CH},()=>new Array(CW).fill(TCVW));
			const s=(r,c,t)=>{if(r>=0&&r<CH&&c>=0&&c<CW)m[r][c]=t;};
			// Main floor
			for(let r=2;r<CH-2;r++) for(let c=2;c<CW-2;c++) s(r,c,TCVF);
			// Rocky pillars
			for(const[r,c] of [[4,5],[4,6],[5,5],[4,14],[4,15],[5,15],[10,8],[10,9],[11,8],[10,17],[10,18],[11,17]]) s(r,c,TCVW);
			// Fossil spots
			for(const[r,c] of [[4,9],[7,4],[7,17],[12,7],[12,15]]) s(r,c,TCVFS);
			// Exit tiles — north wall
			s(1,10,TCVXT); s(1,11,TCVXT);
			// Trap tiles — disguised floor (revealed on first step)
			for(const[r,c] of [[6,7],[8,13],[11,5],[13,14]]) s(r,c,TCVTR);
			// Daily chest — south center
			s(CH-3, CW/2|0, TCVCH);
			// Hiker NPC — mid-cave west side
			s(7, 7, TCVHK);
			return m;
		}
	window.CAMP_SYSTEMS.buildCaveMap = buildCaveMap;

	// ── makeCaveSceneClass ────────────────────────────────────────────────────────
		function makeCaveSceneClass() {
			const CAVE_W = 22, CAVE_H = 18;
			return class CaveScene extends Phaser.Scene {
				constructor() { super({ key: 'cave' }); }

				init(data) {
					this.spawnFrom = (data && data.from) || null;
				}

				preload() {
					this.load.image('player-base', 'Pictures/sprites/calem.png');
				}

				create() {
					if (window.__campLoadHide) window.__campLoadHide();
					console.log('[CaveScene] create()');
					try {
						this._buildCave();
						// Clear the black campFade overlay (same 2-rAF pattern as other scenes)
						requestAnimationFrame(() => requestAnimationFrame(() => {
							const f = document.getElementById('campFade');
							if (f) f.classList.add('is-hidden');
						}));
					} catch (e) {
						console.error('[CaveScene] create failed:', e);
						Debug.lastError = 'CaveScene.create: ' + e.message;
						const _f = document.getElementById('campFade'); if (_f) _f.classList.add('is-hidden');
					}
				}

				_buildCave() {
					this.tick = 0;
					this.map = buildCaveMap();
					// Daily seeded hidden item tile — random floor position changes each day
					{
						const seed = Math.floor(Date.now() / 86400000); // day number
						const rng = (n) => { let x = Math.sin(seed * 9301 + n * 49297) * 233280; return x - Math.floor(x); };
						const floorTiles = [];
						for (let r = 5; r < CAVE_H - 3; r++)
							for (let c = 3; c < CAVE_W - 3; c++)
								if (this.map[r][c] === TCVF) floorTiles.push([r, c]);
						if (floorTiles.length) {
							const idx = Math.floor(rng(0) * floorTiles.length);
							this._hiddenItemTile = floorTiles[idx];
						}
					}
					const W = CAVE_W * TILE, H = CAVE_H * TILE;

					// ── Tile rendering — Rectangle GameObjects ───────────────────────
					// Both createCanvas+refresh and addCanvas produce invisible Images in
					// this WebGL scene (pixelArt:true, Phaser 3.88 — unknown pipeline bug).
					// Rectangle uses Phaser's Shape pipeline, confirmed working (same as fog).
					// Diagnostic log left in so console reveals texture state post-mortem.
					console.log('[cave] TILE=' + TILE + ' map=' + CAVE_W + 'x' + CAVE_H + ' (' + W + 'x' + H + 'px)');
					const _cvCol = (t) => {
						if (t === TCVF)  return 0x9898b8;
						if (t === TCVW)  return 0x2c2020;
						if (t === TCVFS) return 0x3a3045;
						if (t === TCVXT) return 0x4a2e18;
						if (t === TCVTR) return 0x9898b8; // looks like floor until triggered
						if (t === TCVCH) return 0x8b6914; // chest — gold-brown
						if (t === TCVHK) return 0x2a5a2a; // hiker — dark green patch
						return 0x5a5070;
					};
					this._tileRects = [];
					for (let r = 0; r < CAVE_H; r++) {
						this._tileRects[r] = [];
						for (let c = 0; c < CAVE_W; c++) {
							const _r = this.add.rectangle(
								c * TILE + TILE / 2, r * TILE + TILE / 2, TILE, TILE, _cvCol(this.map[r][c])
							).setDepth(0);
							this._tileRects[r][c] = _r;
						}
					}
					// Highlight pass — inner bevel on floor tiles (second rect, lighter)
					for (let r = 0; r < CAVE_H; r++)
						for (let c = 0; c < CAVE_W; c++)
							if (this.map[r][c] === TCVF || this.map[r][c] === TCVTR)
								this.add.rectangle(
									c * TILE + TILE / 2, r * TILE + TILE / 2, TILE - 2, TILE - 2, 0xb0b0cc
								).setDepth(0);
					// Fossil-spot gem highlight
					for (let r = 0; r < CAVE_H; r++)
						for (let c = 0; c < CAVE_W; c++)
							if (this.map[r][c] === TCVFS)
								this.add.rectangle(
									c * TILE + TILE / 2, r * TILE + TILE / 2, 6, 6, 0x8070a0
								).setDepth(1);
					// Hidden daily item — tiny sparkle dot (only shows if not already claimed today)
					if (this._hiddenItemTile) {
						const [hr, hc] = this._hiddenItemTile;
						const today = new Date().toDateString();
						if (!localStorage.getItem('pokequiz_cave_item_' + today)) {
							this._hiddenItemDot = this.add.rectangle(
								hc * TILE + TILE/2, hr * TILE + TILE/2, 4, 4, 0xffffff
							).setDepth(2);
						}
					}

					// Flashlight fog — pure Phaser Graphics, no DOM canvas needed.
					// Drawn in screen space (scrollFactor 0), above everything else.
					this._fog = this.add.graphics().setDepth(100).setScrollFactor(0);
					this._flashCanvas = null; // not used

					// Palette-swap player sprite
					try {
						const baseImg = this.textures.get('player-base').getSourceImage();
						const pw = baseImg.width, ph = baseImg.height;
						this._playerCanvas = document.createElement('canvas');
						this._playerCanvas.width = pw; this._playerCanvas.height = ph;
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
						if (!this.textures.exists('player-cave')) {
							this.textures.addSpriteSheet('player-cave', this._playerCanvas, { frameWidth: 22, frameHeight: 38 });
						} else {
							this.textures.get('player-cave').refresh();
						}
					} catch (e) { console.error('[CaveScene] palette swap failed:', e); }

					const mkAnim = (key, frames) => {
						if (this.anims.exists(key)) this.anims.remove(key);
						this.anims.create({ key, frameRate: 6, repeat: -1,
							frames: this.anims.generateFrameNumbers('player-cave', { frames }) });
					};
					mkAnim('cv-walk-south', [1, 0, 2, 0]);
					mkAnim('cv-walk-west',  [4, 3, 5, 3]);
					mkAnim('cv-walk-north', [7, 6, 8, 6]);
					mkAnim('cv-walk-east',  [10, 9, 11, 9]);

					// Spawn at north exit, facing south (walking into the cave)
					const spawnC = Math.floor(CAVE_W / 2);
					const spawnR = 2; // row 2 — just below north exit tiles
					this.player = this.physics.add.sprite(spawnC*TILE + TILE/2, spawnR*TILE + TILE/2, 'player-cave', 0);
					this.player.setOrigin(0.5, 36/38);
					this.player.setScale(0.75);
					this.player.setDepth(3);
					this.player.body.setSize(10, 6);
					this.player.body.setOffset((22-10)/2, 38-8);

					// Solid tiles
					this.solids = this.physics.add.staticGroup();
					for (let r = 0; r < CAVE_H; r++) {
						for (let c = 0; c < CAVE_W; c++) {
							if (SOLID.has(this.map[r][c])) {
								const rect = this.add.rectangle(c*TILE + TILE/2, r*TILE + TILE/2, TILE, TILE);
								this.physics.add.existing(rect, true);
								this.solids.add(rect);
							}
						}
					}
					this.physics.add.collider(this.player, this.solids);

					// Wild Pokémon (cave-appropriate pool)
					this._wildSpawner = new WildSpawner(this.map, TILE);
					// Cave-exclusive pool: Zubat, Golbat, Geodude, Graveler, Onix, Diglett, Dugtrio, Machop + rare Snorlax/Lapras
					this._wildSpawner._pool = [41,42,74,75,95,50,51,66,143,131];
					this._wildSpawner.spawnAll(null);
					this._inWildEncounter = false;

					this.physics.world.setBounds(0, 0, W, H);
					this.player.setCollideWorldBounds(true);
					this.cameras.main.setBackgroundColor('#080810');
					this.cameras.main.setRoundPixels(true);
					// Match the same pattern as HouseScene / UpstairsScene:
					// setBounds + startFollow BEFORE applyZoom so worldView is correct.
					this.cameras.main.setBounds(0, 0, W, H);
					this.cameras.main.startFollow(this.player, true, 1, 1);
					this.applyZoom();
					this.scale.on('resize', this.onResize, this);
					this.events.once('shutdown', () => this.scale.off('resize', this.onResize, this));

					__S._sceneKeyboard = this.input.keyboard;
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
					this.events.once('shutdown', () => { if (this._wildSpawner) { this._wildSpawner.destroyAll(); this._wildSpawner = null; } });

					this.dir = 0; // face south — entered from north
					this.dirAnimKeys = ['cv-walk-south', 'cv-walk-west', 'cv-walk-north', 'cv-walk-east'];
					this.dirIdleFrame = [0, 3, 6, 9];
					this.player.setFrame(this.dirIdleFrame[this.dir]);
					this.didTransition = false;
					this.armedForExit = false;
					this._exitArmed = false; // arms once player moves away from north exit
					// Cache Flash ownership so the fog doesn't hit localStorage 60fps
					this._flashOwned = !!(Inventory.load().hasFlash);
					this.DIR_VEC = [[0,1],[-1,0],[0,-1],[1,0]];

					this._promptEl  = document.getElementById('campPrompt');
					this._promptLbl = document.getElementById('campPromptLabel');
					this._locEl = document.querySelector('.camp-location-name');
					if (this._locEl) {
						this._prevLocText = this._locEl.textContent;
						Achievements.increment('caveExplorer');
					this._locEl.textContent = 'UNDERGROUND CAVE';
					}
					this.events.once('shutdown', () => {
						if (this._promptEl) this._promptEl.hidden = true;
						if (this._locEl && this._prevLocText) this._locEl.textContent = this._prevLocText;
					});
				}

				_drawCaveTiles() {
					const gfx = this._tileGfx;
					if (!gfx) return;
					gfx.clear();
					const T = TILE;
					for (let r = 0; r < CAVE_H; r++) {
						for (let c = 0; c < CAVE_W; c++) {
							const x = c * T, y = r * T, t = this.map[r][c];
							if (t === TCVF) {
								gfx.fillStyle(0x9898b8,1); gfx.fillRect(x,y,T,T);
								gfx.fillStyle(0xb0b0cc,1); gfx.fillRect(x+1,y+1,T-2,T-2);
								gfx.fillStyle(0x8080a0,1); gfx.fillRect(x,y,1,1); gfx.fillRect(x+T-1,y+T-1,1,1);
							} else if (t === TCVW) {
								gfx.fillStyle(0x2c2020,1); gfx.fillRect(x,y,T,T);
								gfx.fillStyle(0x3c2c24,1); gfx.fillRect(x+1,y+1,T-2,T-2);
								gfx.fillStyle(0x5c4030,1);
								gfx.fillRect(x+2,y+3,3,3); gfx.fillRect(x+6,y+3,3,3); gfx.fillRect(x+10,y+3,3,3);
								gfx.fillStyle(0x7a5840,1); gfx.fillRect(x+2,y+3,2,2);
							} else if (t === TCVFS) {
								gfx.fillStyle(0x3a3045,1); gfx.fillRect(x,y,T,T);
								gfx.fillStyle(0x8070a0,1); gfx.fillRect(x+5,y+5,6,6);
								gfx.fillStyle(0xb0a0c8,1); gfx.fillRect(x+6,y+6,4,4);
							} else if (t === TCVXT) {
								gfx.fillStyle(0x4a2e18,1); gfx.fillRect(x,y,T,T);
								gfx.fillStyle(0xffcb05,1);
								gfx.fillRect(x+T/2-2,y+3,4,T-6); gfx.fillRect(x+3,y+T/2-1,T-6,3);
							} else {
								gfx.fillStyle(0x5a5070,1); gfx.fillRect(x,y,T,T);
							}
						}
					}
				}

				onResize() { applyWrapTop(); this.applyZoom(); }

				applyZoom() {
					const W = this.scale.width, H = this.scale.height;
					if (W <= 0 || H <= 0) { this.events.once('postupdate', () => this.applyZoom()); return; }
					const roomW = CAVE_W * TILE, roomH = CAVE_H * TILE;
					let s = Math.ceil(Math.max(W / roomW, H / roomH));
					s = Math.max(2, Math.min(s, 4));
					const cam = this.cameras.main;
					cam.setZoom(s);
					cam.setBounds(0, 0, roomW, roomH);
					// startFollow is established in _buildCave — applyZoom only adjusts zoom/bounds.
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

				update() {
					if (!this.player) return;
					this.tick++;
					if (this.didTransition) { this.player.setVelocity(0, 0); return; }
					Dialog.tick();
					const dialogOpen = Dialog.isOpen();
					const k = this.keys, d = this.dpad;

					const tc = Math.floor(this.player.x / TILE);
					const tr = Math.floor(this.player.y / TILE);

					// Flashlight fog — drawn AFTER tc/tr are computed so radius is valid.
					// Draws horizontal 3-px strips leaving a circular torch hole (screen space).
					if (this._fog && this.player) {
						const cam = this.cameras.main;
						const SW = this.scale.width, SH = this.scale.height;
						const sx = Math.round((this.player.x - cam.scrollX) * cam.zoom);
						const sy = Math.round((this.player.y - cam.scrollY) * cam.zoom);
						const _hasFlash = !!(this._flashOwned);
						// Torch radius: Flash HM = full 128; no Flash = shrinks deeper in cave (row-based)
						const _baseR = _hasFlash ? 128 : Math.max(52, 96 - Math.floor(tr / CAVE_H * 44));
						const R  = Math.round(_baseR * cam.zoom); // torch radius (screen px)
						const STEP = 3;
						this._fog.clear();
						this._fog.fillStyle(0x000000, 0.92);
						for (let py = 0; py < SH; py += STEP) {
							const dy = (py + STEP * 0.5) - sy;
							if (Math.abs(dy) >= R) {
								this._fog.fillRect(0, py, SW, STEP);
							} else {
								const dx = Math.sqrt(R * R - dy * dy);
								const lx = Math.round(sx - dx);
								const rx = Math.round(sx + dx);
								if (lx > 0)  this._fog.fillRect(0,  py, lx,      STEP);
								if (rx < SW) this._fog.fillRect(rx, py, SW - rx, STEP);
							}
						}
					}
					const [dvx, dvy] = this.DIR_VEC[this.dir];
					const tileR = tr + dvy, tileC = tc + dvx;
					const facingTile = this.map[tileR] && this.map[tileR][tileC];

					// Show prompt
					const pe = this._promptEl, lbl = this._promptLbl;
					let promptLabel = null;
					if (facingTile === TCVFS) promptLabel = 'Dig';
					if (facingTile === TCVCH) promptLabel = 'Open Chest';
					if (facingTile === TCVHK) promptLabel = 'Talk';
					if (pe && lbl) {
						if (!dialogOpen && promptLabel) {
							lbl.textContent = promptLabel;
							pe.hidden = false;
							const cam = this.cameras.main;
							const sx = (this.player.x - cam.worldView.x) * cam.zoom;
							const sy = (this.player.y - cam.worldView.y) * cam.zoom;
							pe.style.left = sx + 'px';
							pe.style.top  = Math.min(sy, this.scale.height - 180) + 'px';
							pe.style.transform = 'translate(-50%, calc(-100% - 12px))';
						} else {
							pe.hidden = true;
						}
					}

					const ePressed = Phaser.Input.Keyboard.JustDown(k.interact) || TouchActions.consume('interact');
					if (ePressed) {
						if (dialogOpen) {
							Dialog.advance();
						} else if (facingTile === TCVFS && this.map[tileR] && this.map[tileR][tileC] === TCVFS) {
							this._miningStreak = (this._miningStreak || 0) + 1;
							const mult = this._miningStreak >= 5 ? 2 : this._miningStreak >= 3 ? 1.5 : 1;
							const reward = Math.round(25 * mult);
							try {
								const inv = JSON.parse(localStorage.getItem('pokequiz_inventory') || '{}');
								inv.tokens = (inv.tokens || 0) + reward;
								localStorage.setItem('pokequiz_inventory', JSON.stringify(inv));
								this.map[tileR][tileC] = TCVF;
								if (this._tileRects[tileR] && this._tileRects[tileR][tileC]) {
									this._tileRects[tileR][tileC].setFillStyle(0x9898b8);
									// also remove the gem highlight — find and destroy it by position
								}
							} catch (_) {}
							Achievements.increment('fossilHunter');
							const streakMsg = mult > 1 ? ' 🔥 ×' + mult + ' streak!' : '';
							Dialog.open('⛏️ Fossil found! +' + reward + ' tokens!' + streakMsg);
						} else if (facingTile === TCVCH) {
							const today = new Date().toDateString();
							const key = 'pokequiz_cave_chest_' + today;
							if (localStorage.getItem(key)) {
								Dialog.open('📦 The chest is empty for today.\nCome back tomorrow!');
							} else {
								localStorage.setItem(key, '1');
								const rewards = [
									{ tokens: 40, msg: '+40 tokens!' },
									{ tokens: 20, berry: 1, msg: '+20 tokens + 1 Friendship Berry!' },
									{ seed: 1, msg: '+1 Seed!' },
									{ tokens: 60, msg: '+60 tokens!' },
								];
								const r = rewards[Math.floor(Math.random() * rewards.length)];
								try {
									const inv = JSON.parse(localStorage.getItem('pokequiz_inventory') || '{}');
									if (r.tokens) inv.tokens = (inv.tokens || 0) + r.tokens;
									if (r.berry) inv.friendshipBerries = (inv.friendshipBerries || 0) + r.berry;
									if (r.seed) inv.seeds = (inv.seeds || 0) + 1;
									localStorage.setItem('pokequiz_inventory', JSON.stringify(inv));
								} catch (_) {}
								Dialog.open('📦 Daily Cave Chest!\n' + r.msg);
							}
						} else if (facingTile === TCVHK) {
							const tips = [
								'Hiker: "The deeper you go, the darker it gets. A Flash HM from the Mart helps a lot!"',
								'Hiker: "I once dug 5 fossils in one run — the streak bonus is worth it!"',
								'Hiker: "Watch your step... some floor tiles aren\'t what they seem."',
								'Hiker: "There\'s a chest somewhere in the deep cave. It refills every day!"',
								'Hiker: "Zubat swoops fast, but Onix hits harder. Bring your best team!"',
							];
							const tip = tips[Math.floor(Date.now() / 86400000) % tips.length];
							Dialog.open(tip);
						} else if (!this._inWildEncounter && this._wildSpawner) {
							const _ww = this._wildSpawner.getNearby(this.player.x, this.player.y);
							if (_ww) {
								this._inWildEncounter = true;
								showWildEncounter(_ww,
									() => { this._inWildEncounter = false; },
									() => {
										this._wildSpawner.remove(_ww);
										this._inWildEncounter = false;
										try {
											const box = JSON.parse(localStorage.getItem('pokequiz_pc_box') || '[]');
											box.push({id:_ww.dexNum, name:_ww.name, caught:Date.now()});
											localStorage.setItem('pokequiz_pc_box', JSON.stringify(box));
										} catch {}
										if (window.CAMP_SYSTEMS.DexGroupRewards) window.CAMP_SYSTEMS.DexGroupRewards.markSeen(_ww.dexNum);
										showToast('Caught ' + _ww.name + '! Added to PC Box. 🎉');
									}
								);
							}
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

					// Trap tile — penalise first step on hidden floor crack
					if (!dialogOpen && !this.didTransition) {
						const curTile = this.map[tr]?.[tc];
						if (curTile === TCVTR) {
							const trapKey = tr + ',' + tc;
							if (!this._triggeredTraps) this._triggeredTraps = new Set();
							if (!this._triggeredTraps.has(trapKey)) {
								this._triggeredTraps.add(trapKey);
								// Reveal tile (darken it slightly)
								if (this._tileRects[tr]?.[tc]) this._tileRects[tr][tc].setFillStyle(0x706878);
								try {
									const inv = JSON.parse(localStorage.getItem('pokequiz_inventory') || '{}');
									inv.tokens = Math.max(0, (inv.tokens || 0) - 5);
									localStorage.setItem('pokequiz_inventory', JSON.stringify(inv));
								} catch (_) {}
								showToast('💥 Cracked floor! −5 tokens');
							}
						}
					}

					// Hidden daily item walk-on
					if (this._hiddenItemTile && !dialogOpen && !this.didTransition) {
						const [hr, hc] = this._hiddenItemTile;
						if (tr === hr && tc === hc) {
							const today = new Date().toDateString();
							const iKey = 'pokequiz_cave_item_' + today;
							if (!localStorage.getItem(iKey)) {
								localStorage.setItem(iKey, '1');
								if (this._hiddenItemDot) { this._hiddenItemDot.destroy(); this._hiddenItemDot = null; }
								const prizes = ['tokens:30', 'berry:1', 'seed:1', 'tokens:50'];
								const prize = prizes[Math.floor(Math.random() * prizes.length)];
								try {
									const inv = JSON.parse(localStorage.getItem('pokequiz_inventory') || '{}');
									if (prize.startsWith('tokens')) inv.tokens = (inv.tokens||0) + parseInt(prize.split(':')[1]);
									else if (prize.startsWith('berry')) inv.friendshipBerries = (inv.friendshipBerries||0) + 1;
									else if (prize.startsWith('seed')) inv.seeds = (inv.seeds||0) + 1;
									localStorage.setItem('pokequiz_inventory', JSON.stringify(inv));
								} catch (_) {}
								showToast('✨ Found a hidden item! ' + prize.replace('tokens:', '+').replace(':', ' +') + '!');
							}
						}
					}

					// Walk-on north exit — arm once player moves south of spawn row,
					// then auto-transition when they walk back onto the TCVXT tiles.
					if (tr > 3) this._exitArmed = true;
					if (!this.didTransition && this._exitArmed &&
					    tr <= 1 && (this.map[tr]?.[tc] === TCVXT)) {
						this.didTransition = true;
						if (pe) pe.hidden = true;
						safeSceneStart(this, 'camp', { from: 'cave' });
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

					// Wild spawner update
					if (this._wildSpawner) this._wildSpawner.update(this.player, this.cameras.main);

					// Manual camera follow — keeps player centered within map bounds without
					// Camera scroll is managed by startFollow + setBounds in applyZoom().

					Debug.render(
						'CAVE\n' +
						'tile  ' + tc + ',' + tr + '\n' +
						'dir   ' + ['S','W','N','E'][this.dir] + '\n' +
						'rects ' + (this._tileRects ? CAVE_W + 'x' + CAVE_H : 'null') + '\n' +
						'trans ' + this.didTransition + '\n' +
						'dlg   ' + dialogOpen + '\n' +
						(Debug.lastError ? 'ERR ' + Debug.lastError : '')
					);
				}
			};
		}
	window.CAMP_SCENES.makeCaveSceneClass = makeCaveSceneClass;

	// ── SeasonalRewards ────────────────────────────────────────────────────────
	const SeasonalRewards = (() => {
		async function check() {
			try {
				const lastMonth = (() => {
					const d = new Date();
					d.setMonth(d.getMonth() - 1);
					return d.toISOString().slice(0, 7);
				})();
				const claimedKey = 'pokequiz_seasonal_reward_' + lastMonth;
				if (localStorage.getItem(claimedKey)) return;
				const name = window.PokeUtil?.getPlayerName?.();
				if (!name) return;
				// Fetch last month's top 3 for quiz (flagship game)
				const res = await fetch('/api/leaderboard?game=quiz&season=1&month=' + lastMonth + '&limit=3');
				if (!res.ok) return;
				const data = await res.json();
				const entries = data.entries || [];
				const rank = entries.findIndex(e => e.name?.toLowerCase() === name.toLowerCase());
				if (rank === -1) return;
				// They were top 3! Give reward
				localStorage.setItem(claimedKey, '1');
				const inv = Inventory.load();
				const bonus = [200, 150, 100][rank] || 50;
				inv.tokens = (inv.tokens || 0) + bonus;
				Inventory.save(inv);
				const medals = ['🥇', '🥈', '🥉'];
				showToast(medals[rank] + ' You finished #' + (rank+1) + ' last season! +' + bonus + ' tokens!');
			} catch {}
		}
		return { check };
	})();
	window.CAMP_SYSTEMS.SeasonalRewards = SeasonalRewards;

	// ══════════════════════════════════════════════════════════════════════════════
	// BATCH 2 — HUD / GUI
	// ══════════════════════════════════════════════════════════════════════════════

	// ── B2-0: Button bar hamburger toggle ────────────────────────────────────────
	const BtnBarToggle = (() => {
		function init() {
			// Always start open; clear any stale flag from old versions
			const bar = document.getElementById('campBtnBar');
			if (bar) bar.classList.remove('camp-btn-bar--closed');
			try { localStorage.removeItem('pokequiz_btnbar_closed'); } catch {}
		}
		function toggle() {
			const bar = document.getElementById('campBtnBar');
			if (!bar) return;
			bar.classList.toggle('camp-btn-bar--closed');
		}
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
		else init();
		return { init, toggle };
	})();
	window.CAMP_SYSTEMS.BtnBarToggle = BtnBarToggle;

	// ── B2-1: Compact HUD mode ────────────────────────────────────────────────────
	const HudCompact = (() => {
		const KEY = 'pokequiz_hud_compact';
		let compact = false;
		function apply() {
			const bar = document.querySelector('.camp-btn-bar');
			if (!bar) return;
			if (compact) bar.classList.add('campHudBar--compact');
			else bar.classList.remove('campHudBar--compact');
			const btn = document.getElementById('campHudToggle');
			if (btn) btn.title = compact ? 'Expand HUD' : 'Compact HUD';
		}
		function init() {
			try { compact = localStorage.getItem(KEY) === '1'; } catch {}
			apply();
			const btn = document.getElementById('campHudToggle');
			if (btn) {
				btn.addEventListener('click', () => {
					compact = !compact;
					try { localStorage.setItem(KEY, compact ? '1' : '0'); } catch {}
					apply();
				});
			}
		}
		return { init };
	})();
	window.CAMP_SYSTEMS.HudCompact = HudCompact;

	// ── B2-2: Partner Portrait Widget ────────────────────────────────────────────

	// ── B2-3: Quick-slot bar ──────────────────────────────────────────────────────
	const QuickSlotBar = (() => {
		const DEFAULTS = ['oran', 'pecha', 'sitrus', 'friendship'];
		const LABELS   = { oran: '🫐', pecha: '🍬', sitrus: '🍋', friendship: '🍓' };
		const NAMES    = { oran: 'Oran', pecha: 'Pecha', sitrus: 'Sitrus', friendship: 'Friend' };
		let el = null;
		function getSlots() {
			try {
				const raw = localStorage.getItem('pokequiz_quickslots');
				return raw ? JSON.parse(raw) : [...DEFAULTS];
			} catch { return [...DEFAULTS]; }
		}
		function getCount(type) {
			const inv = Inventory.load();
			if (type === 'friendship') return inv.friendshipBerries || 0;
			return ((inv.berryTypes || {})[type]) || 0;
		}
		function useSlot(idx) {
			const slots = getSlots();
			const type = slots[idx];
			if (!type) return;
			const inv = Inventory.load();
			if (type === 'friendship') {
				if ((inv.friendshipBerries || 0) <= 0) { showToast('No Friendship Berries!'); return; }
				inv.friendshipBerries = Math.max(0, (inv.friendshipBerries || 0) - 1);
				inv.friendship = Math.min(FRIENDSHIP_MAX || 100, (inv.friendship || 0) + (window.CAMP_DATA?.FRIENDSHIP_PER_BERRY || 10));
				Inventory.save(inv);
				showToast(LABELS[type] + ' +' + (window.CAMP_DATA?.FRIENDSHIP_PER_BERRY || 10) + ' friendship!');
				if (window.CAMP_SYSTEMS.FriendshipMilestone) window.CAMP_SYSTEMS.FriendshipMilestone.check(null, inv.friendship);
			} else {
				const bt = inv.berryTypes || {};
				if ((bt[type] || 0) <= 0) { showToast('No ' + NAMES[type] + ' Berries!'); return; }
				bt[type] = Math.max(0, (bt[type] || 0) - 1);
				inv.berryTypes = bt;
				inv.friendship = Math.min(FRIENDSHIP_MAX || 100, (inv.friendship || 0) + 5);
				Inventory.save(inv);
				showToast(LABELS[type] + ' ' + NAMES[type] + ' Berry used! +5 friendship');
			}
			render();
		}
		function render() {
			if (!el) return;
			const slots = getSlots();
			el.querySelectorAll('.cpQuickSlot').forEach((slot, i) => {
				const type = slots[i];
				const cnt = type ? getCount(type) : 0;
				const icon = type ? (LABELS[type] || '?') : '—';
				slot.innerHTML = '<span class="cqs-icon">' + icon + '</span><span class="cqs-count">' + cnt + '</span>';
				slot.dataset.slot = i + 1;
				slot.title = (type ? NAMES[type] + ' Berry' : 'Empty') + ' [' + (i + 1) + ']';
				slot.classList.toggle('cqs-empty', cnt === 0);
			});
		}
		function init() {
			el = document.getElementById('campQuickBar');
			if (!el) return;
			render();
			// Keyboard 1-4
			document.addEventListener('keydown', (e) => {
				if (document.activeElement && ['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
				const idx = ['1','2','3','4'].indexOf(e.key);
				if (idx !== -1) useSlot(idx);
			});
		}
		function refresh() { render(); }
		return { init, refresh, useSlot };
	})();
	window.CAMP_SYSTEMS.QuickSlotBar = QuickSlotBar;

	// ── B2-4: Mini-map overlay ────────────────────────────────────────────────────
	const Minimap = (() => {
		let visible = false;
		let timer = null;
		let inited = false;
		const KEY = 'pokequiz_minimap_on';
		function init() {
			// Idempotent — init() is called both from the camp scene's create
			// hook and unconditionally at load (so the minimap also works when
			// the page boots straight into the market scene).
			if (inited) return;
			inited = true;
			try { visible = localStorage.getItem(KEY) !== '0'; } catch { visible = true; }
			const el = document.getElementById('campMinimap');
			if (el) el.style.display = visible ? '' : 'none';
			// M key toggle
			document.addEventListener('keydown', (e) => {
				if (document.activeElement && ['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
				if (e.key === 'm' || e.key === 'M') toggle();
			});
			const btn = document.getElementById('campMapBtn');
			if (btn) btn.addEventListener('click', toggle);
			timer = setInterval(updateDot, 500);
		}
		function toggle() {
			visible = !visible;
			try { localStorage.setItem(KEY, visible ? '1' : '0'); } catch {}
			const el = document.getElementById('campMinimap');
			if (el) el.style.display = visible ? '' : 'none';
		}
	function updateDot() {
		if (!visible) return;
		// Use whichever overworld scene is currently active (market / beach / camp).
		const _active = (s) => s && s.sys && s.sys.isActive();
		const scene = _active(window.__marketScene) ? window.__marketScene
		            : _active(window.__beachScene)  ? window.__beachScene
		            : window.__campScene;
		if (!scene || !scene.minimapEl || !scene._minimapCtx || !scene._minimapCache) return;
		const ctx = scene._minimapCtx;
		const mEl = scene.minimapEl;
		const mS  = scene._minimapScale || 3;
		ctx.drawImage(scene._minimapCache, 0, 0);
		// Player dot
		if (scene.player) {
			const px = Math.floor(scene.player.x / (TILE || 16));
			const py = Math.floor(scene.player.y / (TILE || 16));
			ctx.fillStyle = '#44ff44';
			ctx.fillRect(px * mS - 1, py * mS - 1, mS + 2, mS + 2);
		}
		// NPC dots
		if (scene.npcByTile) {
			ctx.fillStyle = '#ffff44';
			Object.values(scene.npcByTile).forEach(npc => {
				ctx.fillRect(npc.c * mS, npc.r * mS, mS, mS);
			});
		}
	}
		function destroy() { if (timer) { clearInterval(timer); timer = null; } }
		return { init, toggle, destroy };
	})();
	window.CAMP_SYSTEMS.Minimap = Minimap;
	// Start the minimap refresh loop regardless of which scene boots first —
	// the camp create hook also calls init(), but that no-ops once inited.
	if (document.readyState === 'loading')
		document.addEventListener('DOMContentLoaded', () => Minimap.init());
	else
		Minimap.init();

	// ══════════════════════════════════════════════════════════════════════════════
	// BATCH 3 — CAMP ACTIVITIES
	// ══════════════════════════════════════════════════════════════════════════════

	// ── B3-2: Treasure Digging ────────────────────────────────────────────────────
	const TreasureDig = (() => {
		let scene = null;
		let spotR = -1, spotC = -1;
		let sparkleGfx = null;
		function _dateStr() { return new Date().toISOString().slice(0, 10); }
		function _seed(str) {
			let h = 5381;
			for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
			return Math.abs(h);
		}
		function init(sc) {
			scene = sc;
			const today = _dateStr();
			const s = _seed(today);
			// Pick a random tile that is walkable (grass area) — use center region
			spotR = 5 + (s % 12);
			spotC = 8 + ((s >> 4) % 20);
			// Draw sparkle
			if (sparkleGfx) { try { sparkleGfx.destroy(); } catch {} sparkleGfx = null; }
			if (localStorage.getItem('pokequiz_dig_' + today)) return; // already dug today
			if (!scene) return;
			sparkleGfx = scene.add.graphics().setDepth(4);
			_drawSparkle();
		}
		function _drawSparkle() {
			if (!sparkleGfx) return;
			sparkleGfx.clear();
			const t = TILE || 16;
			const cx = spotC * t + t / 2, cy = spotR * t + t / 2;
			const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.006);
			sparkleGfx.fillStyle(0xffee44, pulse);
			// Phaser 3.88 has no fillStar — draw a 4-point star manually via fillPoints
			{ const pts=[], outerR=6, innerR=3, numPts=4;
			  for(let i=0;i<numPts*2;i++){const a=(i*Math.PI/numPts)-Math.PI/2;const r=(i%2===0)?outerR:innerR;pts.push({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)});}
			  sparkleGfx.fillPoints(pts,true); }
		}
		function updateSparkle() { _drawSparkle(); }
		function tryDig(pr, pc) {
			if (Math.abs(pr - spotR) > 1 || Math.abs(pc - spotC) > 1) return false;
			const today = _dateStr();
			const digKey = 'pokequiz_dig_' + today;
			if (localStorage.getItem(digKey)) {
				Dialog.open('You already dug here today. Come back tomorrow!');
				return true;
			}
			localStorage.setItem(digKey, '1');
			if (sparkleGfx) { try { sparkleGfx.destroy(); } catch {} sparkleGfx = null; }
			const roll = Math.random();
			const inv = Inventory.load();
			let reward = '';
			if (roll < 0.05) {
				// Rare: evolution stone
				if (!inv.items) inv.items = [];
				const stones = ['Fire Stone','Thunder Stone','Leaf Stone','Water Stone'];
				const stone = stones[Math.floor(Math.random() * stones.length)];
				inv.items.push(stone);
				reward = '✨ Rare find: ' + stone + '!';
			} else if (roll < 0.25) {
				const berries = 1 + Math.floor(Math.random() * 3);
				inv.friendshipBerries = (inv.friendshipBerries || 0) + berries;
				reward = '🍓 Found ' + berries + ' Friendship ' + (berries === 1 ? 'Berry' : 'Berries') + '!';
			} else if (roll < 0.55) {
				const seeds = 1 + Math.floor(Math.random() * 3);
				inv.seeds = (inv.seeds || 0) + seeds;
				reward = '🌱 Found ' + seeds + ' ' + (seeds === 1 ? 'Seed' : 'Seeds') + '!';
			} else {
				const tokens = 10 + Math.floor(Math.random() * 41);
				inv.tokens = (inv.tokens || 0) + tokens;
				reward = '💰 Found ' + tokens + ' tokens!';
			}
			Inventory.save(inv);
			showToast('⛏️ Dug up: ' + reward);
			Dialog.open('You dug up a hidden treasure!\n' + reward + '\nThis spot refreshes daily.');
			return true;
		}
		return { init, updateSparkle, tryDig, getSpot: () => ({ r: spotR, c: spotC }) };
	})();
	window.CAMP_SYSTEMS.TreasureDig = TreasureDig;

	// ── B3-3: Camp Journal ────────────────────────────────────────────────────────
	const Journal = (() => {
		const KEY = 'pokequiz_journal';
		const MAX = 30;
		const FLAVOURS = [
			'The berries are growing well.', 'The weather feels just right today.',
			'Your partner seems happy.', 'A gentle breeze rustles the leaves.',
			'The campfire crackles warmly.', 'You spot a Butterfree in the distance.',
			'The pond shimmers in the light.', 'Dew clings to the morning grass.',
			'Birdsong fills the air.', 'The stars were bright last night.',
		];
		function load() {
			try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
		}
		function save(entries) { try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch {} }
		function autoLog() {
			const today = new Date().toISOString().slice(0, 10);
			const entries = load();
			if (entries.length && entries[0].date === today) return; // already logged today
			const inv = Inventory.load();
			const streak = (window.CAMP_SYSTEMS.Daily && window.CAMP_SYSTEMS.Daily.streak) ? window.CAMP_SYSTEMS.Daily.streak() : 1;
			const companionKey = inv.companionForm != null ? inv.companionForm : (inv.eeveeForm || 'eevee');
			const formLookup = (window.CAMP_SYSTEMS.dexFromKey || (k => k))(companionKey);
			const form = FOLLOWER_FORMS ? (FOLLOWER_FORMS[formLookup] || FOLLOWER_FORMS.eevee) : null;
			const partnerName = (form && form.displayName) || 'Eevee';
			const weather = (() => { try { return window.__campWeather || 'Clear'; } catch { return 'Clear'; } })();
			const flavour = FLAVOURS[Math.floor(Math.random() * FLAVOURS.length)];
			const entry = {
				date: today,
				day: streak,
				text: 'Day ' + streak + ' — ' + today + ' — You visited camp. Partner: ' + partnerName + '. Weather: ' + weather + '. ' + flavour,
			};
			entries.unshift(entry);
			if (entries.length > MAX) entries.length = MAX;
			save(entries);
		}
		function open() {
			let panel = document.getElementById('journalPanel');
			if (!panel) {
				panel = document.createElement('div');
				panel.id = 'journalPanel';
				panel.className = 'pk-drawer';
				panel.setAttribute('role', 'dialog');
				panel.setAttribute('aria-label', 'Journal');
				document.getElementById('campWrap')?.appendChild(panel);
			}
			const entries = load();
			panel.innerHTML = '<div class="pk-drawer-head">' +
				'<span class="pk-drawer-title">📖 JOURNAL</span>' +
				'<button id="journalClose" class="pk-close" type="button" aria-label="Close"><i class="bi bi-x-lg"></i></button>' +
				'</div><div class="pk-drawer-body" id="journalBody">' +
				(entries.length === 0 ? '<div style="color:var(--pk-muted);font-size:8px">No entries yet. Visit camp daily!</div>' :
					entries.map(e => '<div class="journal-entry"><div class="journal-date">' + e.date + '</div><div class="journal-text">' + e.text + '</div></div>').join('')
				) + '</div>';
			panel.hidden = false;
			document.getElementById('journalClose')?.addEventListener('click', close);
		}
		function close() {
			const panel = document.getElementById('journalPanel');
			if (panel) panel.hidden = true;
		}
		return { autoLog, open, close, load };
	})();
	window.CAMP_SYSTEMS.Journal = Journal;

	// ── B3-4: Friendship Milestones ───────────────────────────────────────────────
	const FriendshipMilestone = (() => {
		const MILESTONES = [25, 50, 75, 100];
		function check(dexId, friendship) {
			for (const level of MILESTONES) {
				if (friendship >= level) {
					const mKey = 'pokequiz_fmilestone_' + (dexId || 'partner') + '_' + level;
					if (!localStorage.getItem(mKey)) {
						localStorage.setItem(mKey, '1');
						_showModal(dexId, level, friendship);
						break; // show one at a time
					}
				}
			}
		}
		function _showModal(dexId, level, friendship) {
			let modal = document.getElementById('friendshipMilestoneModal');
			if (modal) modal.remove();
			modal = document.createElement('div');
			modal.id = 'friendshipMilestoneModal';
			modal.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P",monospace;animation:pk-backdrop-in 0.2s ease';
			const inv = Inventory.load();
			const companionKey = inv.companionForm != null ? inv.companionForm : (inv.eeveeForm || 'eevee');
			const formLookup = (window.CAMP_SYSTEMS.dexFromKey || (k => k))(companionKey);
			const form = FOLLOWER_FORMS ? (FOLLOWER_FORMS[formLookup] || FOLLOWER_FORMS.eevee) : null;
			const name = (form && form.displayName) || 'Partner';
			const PS = 4;
			let spriteHTML = '🌟';
			if (form) {
				const imgUrl = form.url ? form.url : ('Pictures/sprites/' + form.sheet + '.png');
				spriteHTML = '<div style="background-image:url(\'' + imgUrl + '\');background-position:0 0;background-size:' + (form.frameW * form.cols * PS) + 'px ' + (form.frameH * 8 * PS) + 'px;width:' + (form.frameW * PS) + 'px;height:' + (form.frameH * PS) + 'px;image-rendering:pixelated;margin:0 auto 10px"></div>';
			}
			const colours = { 25: '#44cc88', 50: '#f6c84c', 75: '#ff8844', 100: '#ff44cc' };
			const col = colours[level] || '#fff';
			modal.innerHTML = '<div style="background:linear-gradient(180deg,#1a2448,#0e1826);border:2px solid ' + col + ';border-radius:14px;padding:28px 32px;text-align:center;max-width:340px;width:90vw;box-shadow:0 0 40px ' + col + '44">' +
				'<div style="font-size:11px;color:' + col + ';margin-bottom:16px;letter-spacing:2px">✨ FRIENDSHIP MILESTONE ✨</div>' +
				spriteHTML +
				'<div style="font-size:10px;color:#fff;margin-bottom:8px">' + name + ' reached<br>Friendship Level ' + level + '!</div>' +
				'<div style="font-size:8px;color:var(--pk-muted);margin-bottom:18px">' + '♥'.repeat(Math.round(level / 20)) + ' ' + friendship + ' / ' + (FRIENDSHIP_MAX || 100) + '</div>' +
				'<button id="fmClose" type="button" class="pk-btn pk-btn-sm" style="background:linear-gradient(180deg,' + col + ',#884422);color:#fff">Wonderful!</button>' +
				'</div>';
			document.body.appendChild(modal);
			document.getElementById('fmClose')?.addEventListener('click', () => modal.remove());
			Sound.win && Sound.win();
		}
		return { check };
	})();
	window.CAMP_SYSTEMS.FriendshipMilestone = FriendshipMilestone;

	// ── B3-5: Berry Recipes (Tea & Puffin additions to campfire) ─────────────────
	// Injected into _showCampfireMenu via monkey-patch applied when the scene starts.
	// We store the extra recipes here so they can be imported there.
	const BerryRecipes = (() => {
		function addToCampfireMenu(panel, body, scene) {
			const teaBtn = document.createElement('button');
			teaBtn.className = 'pk-btn pk-btn-sm pk-btn-full';
			teaBtn.style.cssText = 'background:linear-gradient(180deg,#44aacc,#226688);color:#fff';
			teaBtn.innerHTML = '🍵 Brew Berry Tea';
			teaBtn.addEventListener('click', () => {
				panel.hidden = true;
				const inv = Inventory.load();
				const bt = inv.berryTypes || {};
				if ((bt.oran || 0) < 2) { showToast('Need 2 Oran Berries!'); return; }
				bt.oran -= 2;
				inv.berryTypes = bt;
				inv.friendship = Math.min(FRIENDSHIP_MAX || 100, (inv.friendship || 0) + 15);
				inv.tokens = (inv.tokens || 0) + 5;
				Inventory.save(inv);
				if (window.CAMP_SYSTEMS.FriendshipMilestone) window.CAMP_SYSTEMS.FriendshipMilestone.check(null, inv.friendship);
				showToast('🍵 Berry Tea brewed! +15 friendship, +5 tokens');
			});

			const puffinBtn = document.createElement('button');
			puffinBtn.className = 'pk-btn pk-btn-sm pk-btn-full';
			puffinBtn.style.cssText = 'background:linear-gradient(180deg,#cc88ff,#884499);color:#fff';
			puffinBtn.innerHTML = '🧁 Bake Poké Puffin';
			puffinBtn.addEventListener('click', () => {
				panel.hidden = true;
				const inv = Inventory.load();
				const bt = inv.berryTypes || {};
				if ((bt.sitrus || 0) < 1 || (bt.pecha || 0) < 1) { showToast('Need 1 Sitrus + 1 Pecha Berry!'); return; }
				bt.sitrus -= 1;
				bt.pecha  -= 1;
				inv.berryTypes = bt;
				inv.friendship = Math.min(FRIENDSHIP_MAX || 100, (inv.friendship || 0) + 20);
				Inventory.save(inv);
				if (window.CAMP_SYSTEMS.FriendshipMilestone) window.CAMP_SYSTEMS.FriendshipMilestone.check(null, inv.friendship);
				showToast('🧁 Poké Puffin baked! +20 friendship! Your partner is spinning with joy!');
				// Happy spin on follower
				const sc = window.__campScene;
				if (sc && sc.follower && sc.follower.setAngularVelocity) {
					sc.follower.setAngularVelocity(300);
					setTimeout(() => { try { sc.follower.setAngularVelocity(0); sc.follower.setAngle(0); } catch {} }, 800);
				}
			});

			body.appendChild(teaBtn);
			body.appendChild(puffinBtn);
		}
		return { addToCampfireMenu };
	})();
	window.CAMP_SYSTEMS.BerryRecipes = BerryRecipes;

	// ══════════════════════════════════════════════════════════════════════════════
	// BATCH 4 — MAJOR CAMP FEATURES
	// ══════════════════════════════════════════════════════════════════════════════

	// ── B4-1: Ambient Party Pokémon ───────────────────────────────────────────────
	const AmbientParty = (() => {
		let sprites = [], timers = [], scene = null;
		function init(sc) {
			scene = sc;
			destroy();
			const inv = Inventory.load();
			const slots = (inv.pcBox || []).slice(0, 3);
			if (slots.length < 3) return;
			for (let i = 0; i < Math.min(3, slots.length); i++) {
				const slot = slots[i];
				const formKey = slot.form || 'eevee';
				const formLookup = (window.CAMP_SYSTEMS.dexFromKey || (k => k))(formKey);
				const form = FOLLOWER_FORMS ? (FOLLOWER_FORMS[formLookup] || FOLLOWER_FORMS.eevee) : null;
				if (!form) continue;
				const startX = (8 + i * 4) * (TILE || 16);
				const startY = (14 + i * 2) * (TILE || 16);
				let sp = null;
				try {
					// Use PokeAPI sprite as a static image fallback
					const SPRITE_CDN = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
					const dexId = typeof formLookup === 'number' ? formLookup : (i + 1);
					sp = scene.add.sprite(startX, startY, form.sheet || 'eevee', 0)
						.setDepth(2.5)
						.setScale((form.scale || 0.7) * 0.8);
				} catch {
					sp = null;
				}
				if (sp) sprites.push({ sp, baseX: startX, baseY: startY, dx: 0, dy: 0, tick: 0 });
				const t = setInterval(() => wander(sprites[sprites.length - 1]), 3000);
				timers.push(t);
			}
		}
		function wander(entry) {
			if (!entry || !entry.sp) return;
			const dirs = [[1,0],[-1,0],[0,1],[0,-1],[0,0]];
			const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
			const nx = entry.sp.x + dx * (TILE || 16);
			const ny = entry.sp.y + dy * (TILE || 16);
			// Keep within reasonable bounds
			if (nx > 4 * (TILE||16) && nx < 30 * (TILE||16) && ny > 4 * (TILE||16) && ny < 20 * (TILE||16)) {
				try { entry.sp.setPosition(nx, ny); } catch {}
			}
		}
		function destroy() {
			timers.forEach(t => clearInterval(t));
			timers = [];
			sprites.forEach(e => { try { e.sp.destroy(); } catch {} });
			sprites = [];
		}
		return { init, destroy };
	})();
	window.CAMP_SYSTEMS.AmbientParty = AmbientParty;

	// ── B4-2: Seasonal Special NPCs ──────────────────────────────────────────────
	const SeasonalNPC = (() => {
		const SCHEDULE = [
			{ weeks: [1,13],  name: 'Mew',    dex: 151, emoji: '🌸', bonus: 'Spring spirit brings renewal!' },
			{ weeks: [14,26], name: 'Celebi',  dex: 251, emoji: '🌿', bonus: 'Summer time traveller visits!' },
			{ weeks: [27,39], name: 'Jirachi', dex: 385, emoji: '⭐', bonus: 'Autumn wish-maker appears!' },
			{ weeks: [40,52], name: 'Deoxys',  dex: 386, emoji: '❄️', bonus: 'Winter alien descends!' },
		];
		const NPC_ROW = 3, NPC_COL = 12;
		let npcSprite = null, scene = null;
		function _weekOfYear() {
			const now = new Date();
			const start = new Date(now.getFullYear(), 0, 1);
			return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
		}
		function _current() {
			const w = _weekOfYear();
			return SCHEDULE.find(s => w >= s.weeks[0] && w <= s.weeks[1]) || SCHEDULE[0];
		}
		function init(sc) {
			scene = sc;
			if (!scene) return;
			const npc = _current();
			const x = NPC_COL * (TILE || 16) + (TILE || 16) / 2;
			const y = NPC_ROW * (TILE || 16) + (TILE || 16) / 2;
			// Render as emoji text since PMD sprites for legendaries need CDN fetch
			try {
				npcSprite = scene.add.text(x, y, npc.emoji + '\n' + npc.name, {
					fontSize: '10px',
					fontFamily: 'monospace',
					color: '#fff',
					stroke: '#000',
					strokeThickness: 2,
					align: 'center',
				}).setDepth(3).setOrigin(0.5);
			} catch {}
			// Register in npcByTile for interaction
			if (scene.npcByTile) {
				scene.npcByTile[NPC_ROW + ',' + NPC_COL] = {
					r: NPC_ROW, c: NPC_COL, kind: 'seasonal_legendary',
					label: 'Talk',
					dialog: npc.emoji + ' ' + npc.name + ' appears!\n"' + npc.bonus + '"\n+50 tokens! A special legend noted!',
					_npc: npc,
				};
			}
		}
		function interact(npcData) {
			const rewardKey = 'pokequiz_seasonal_npc_' + _weekOfYear();
			const inv = Inventory.load();
			let msg = npcData.dialog;
			if (!localStorage.getItem(rewardKey)) {
				localStorage.setItem(rewardKey, '1');
				inv.tokens = (inv.tokens || 0) + 50;
				Inventory.save(inv);
				if (window.CAMP_SYSTEMS.Achievements) window.CAMP_SYSTEMS.Achievements.unlock('legendary_encounter');
				msg += '\nYou received +50 tokens!';
			} else {
				msg += '\n(Already received weekly reward.)';
			}
			Dialog.open(msg);
		}
		return { init, interact, getCurrent: _current };
	})();
	window.CAMP_SYSTEMS.SeasonalNPC = SeasonalNPC;

	// ── B4-3: Camp Upgrades ───────────────────────────────────────────────────────
	const CampUpgrades = (() => {
		const UPGRADES = [
			{ id: 'flowerPath', label: 'Flower Path',  cost: 200, icon: '🌸', desc: 'Decorative flowers along the path' },
			{ id: 'fountain',   label: 'Fountain',     cost: 500, icon: '⛲', desc: 'A fountain at the camp centre' },
			{ id: 'lanterns',   label: 'Lanterns',     cost: 300, icon: '🏮', desc: 'Glowing lanterns around the camp' },
		];
		function isOwned(id) { return !!localStorage.getItem('pokequiz_upgrade_' + id); }
		function open() {
			let panel = document.getElementById('upgradesPanel');
			if (!panel) {
				panel = document.createElement('div');
				panel.id = 'upgradesPanel';
				panel.className = 'pk-drawer';
				panel.setAttribute('role', 'dialog');
				panel.setAttribute('aria-label', 'Camp Upgrades');
				document.getElementById('campWrap')?.appendChild(panel);
			}
			const inv = Inventory.load();
			panel.innerHTML = '<div class="pk-drawer-head">' +
				'<span class="pk-drawer-title">🔨 CAMP UPGRADES</span>' +
				'<button id="upgradesClose" class="pk-close" type="button" aria-label="Close"><i class="bi bi-x-lg"></i></button>' +
				'</div><div class="pk-drawer-body">' +
				'<div style="font-size:7px;color:var(--pk-muted);margin-bottom:12px">Tokens: <b style="color:var(--pk-gold)">' + (inv.tokens || 0) + '</b></div>' +
				'<div id="upgradesList" style="display:flex;flex-direction:column;gap:10px">' +
				UPGRADES.map(u => {
					const owned = isOwned(u.id);
					return '<div class="upgrade-row' + (owned ? ' upgrade-owned' : '') + '" data-id="' + u.id + '">' +
						'<span class="upgrade-icon">' + u.icon + '</span>' +
						'<div class="upgrade-info"><div class="upgrade-name">' + u.label + '</div><div class="upgrade-desc">' + u.desc + '</div></div>' +
						(owned ? '<span class="upgrade-badge">✓ Owned</span>' :
							'<button class="pk-btn pk-btn-sm upgrade-buy" data-id="' + u.id + '" data-cost="' + u.cost + '" type="button">' + u.cost + ' 🪙</button>') +
						'</div>';
				}).join('') +
				'</div></div>';
			panel.hidden = false;
			document.getElementById('upgradesClose')?.addEventListener('click', () => { panel.hidden = true; });
			panel.querySelectorAll('.upgrade-buy').forEach(btn => {
				btn.addEventListener('click', () => {
					const id = btn.dataset.id;
					const cost = parseInt(btn.dataset.cost);
					const inv2 = Inventory.load();
					if ((inv2.tokens || 0) < cost) { showToast('Not enough tokens!'); return; }
					inv2.tokens -= cost;
					Inventory.save(inv2);
					localStorage.setItem('pokequiz_upgrade_' + id, '1');
					showToast(UPGRADES.find(u => u.id === id)?.icon + ' ' + UPGRADES.find(u => u.id === id)?.label + ' purchased!');
					// Apply immediately
					if (window.__campScene) apply(id, window.__campScene);
					open(); // re-render
				});
			});
		}
		function apply(id, sc) {
			if (!sc || !isOwned(id)) return;
			if (id === 'flowerPath') {
				// Flower sprites along the path row (row 12, cols 5-15)
				for (let c = 5; c <= 15; c += 2) {
					try { sc.add.text(c * (TILE||16) + 4, 12 * (TILE||16) - 4, '🌸', { fontSize:'8px' }).setDepth(1.9); } catch {}
				}
			} else if (id === 'fountain') {
				try {
					const fx = 8 * (TILE||16) + (TILE||16)/2, fy = 4 * (TILE||16) + (TILE||16)/2;
					sc.add.text(fx, fy, '⛲', { fontSize:'16px' }).setDepth(2).setOrigin(0.5);
					const gfx = sc.add.graphics().setDepth(1.8);
					gfx.fillStyle(0x4499ff, 0.3);
					gfx.fillCircle(fx, fy, 20);
				} catch {}
			} else if (id === 'lanterns') {
				const positions = [[3,2],[3,35],[20,2],[20,35],[12,2],[12,35]];
				positions.forEach(([r,c]) => {
					try {
						sc.add.text(c*(TILE||16), r*(TILE||16), '🏮', {fontSize:'10px'}).setDepth(1.9);
						const g = sc.add.graphics().setDepth(1.7);
						g.fillStyle(0xff8822, 0.2);
						g.fillCircle(c*(TILE||16)+8, r*(TILE||16)+8, 18);
					} catch {}
				});
			}
		}
		function applyAll(sc) {
			UPGRADES.forEach(u => { if (isOwned(u.id)) apply(u.id, sc); });
		}
		return { open, apply, applyAll, isOwned };
	})();
	window.CAMP_SYSTEMS.CampUpgrades = CampUpgrades;

	// ── B4-4: Day/Night NPC animation states ─────────────────────────────────────
	const NpcDayNight = (() => {
		let sleepyEls = [];
		function update(scene) {
			if (!scene || !scene.npcByTile) return;
			const h = new Date().getHours();
			const isNight  = h >= 22 || h < 6;
			const isDawn   = (h >= 6 && h < 8) || (h >= 18 && h < 20);
			const npcs = Object.values(scene.npcByTile);
			// Clean old sleepy overlays
			sleepyEls.forEach(e => { try { e.destroy(); } catch {} });
			sleepyEls = [];
			if (isNight && scene.tick % 120 === 0) {
				npcs.forEach(npc => {
					try {
						const t = scene.add.text(
							npc.c * (TILE||16) + (TILE||16)/2,
							npc.r * (TILE||16) - 4,
							'💤', { fontSize: '8px' }
						).setDepth(3.5);
						sleepyEls.push(t);
						// Float up and fade
						scene.tweens.add({ targets: t, y: '-=12', alpha: 0, duration: 1800, onComplete: () => { try { t.destroy(); } catch {} } });
					} catch {}
				});
			}
			// Dawn/dusk bob — apply to NPC sprites if we can find them in scene
			if (isDawn && scene._npcSprites) {
				const bob = Math.sin(scene.tick * 0.08) * 2;
				scene._npcSprites.forEach(sp => {
					try { sp.y = sp._baseY + bob; } catch {}
				});
			}
		}
		return { update };
	})();
	window.CAMP_SYSTEMS.NpcDayNight = NpcDayNight;

	// ══════════════════════════════════════════════════════════════════════════════
	// BATCH 5 — META / PROGRESSION
	// ══════════════════════════════════════════════════════════════════════════════

	// ── B5-1: Seasonal Gate Sign (leaderboard top score) ─────────────────────────
	const SeasonalGateSign = (() => {
		let lastFetch = 0;
		const CACHE_MS = 5 * 60 * 1000;
		async function init() {
			const __S2 = window.__CAMP_STATE;
			if (__S2._seasonalTop && Date.now() - lastFetch < CACHE_MS) return;
			try {
				const res = await fetch('/api/leaderboard?game=quiz&limit=1&season=1');
				if (!res.ok) return;
				const data = await res.json();
				const top = (data.entries || [])[0];
				if (top) {
					__S2._seasonalTop = { score: top.score, name: top.name };
					lastFetch = Date.now();
				}
			} catch {}
		}
		function getText() {
			const __S2 = window.__CAMP_STATE;
			const t = __S2._seasonalTop;
			if (!t) return '';
			return '🏆 This month\'s top score: ' + t.score + ' by ' + t.name;
		}
		return { init, getText };
	})();
	window.CAMP_SYSTEMS.SeasonalGateSign = SeasonalGateSign;

	// ── B5-2: Badge Challenges ────────────────────────────────────────────────────
	const BadgeChallenges = (() => {
		const BADGES = [
			{ name: 'Boulder Badge', game: 'quiz',        req: 80,  label: 'Score 80+ on the Quiz' },
			{ name: 'Cascade Badge', game: 'silhouette',  req: 80,  label: 'Score 80+ on Silhouette' },
			{ name: 'Thunder Badge', game: 'cry',         req: 80,  label: 'Score 80+ on Cry' },
			{ name: 'Rainbow Badge', game: 'memory',      req: 150, label: 'Score 150+ on Memory' },
			{ name: 'Soul Badge',    game: 'type',        req: 80,  label: 'Score 80+ on Type' },
			{ name: 'Marsh Badge',   game: 'stats',       req: 80,  label: 'Score 80+ on Stats' },
			{ name: 'Volcano Badge', game: 'higherlower', req: 80,  label: 'Score 80+ on Higher/Lower' },
			{ name: 'Earth Badge',   game: 'sprint',      req: 80,  label: 'Score 80+ on Sprint' },
		];
		function getStatus() {
			return BADGES.map(b => {
				let best = 0;
				try { best = parseInt(localStorage.getItem('pokequiz_' + b.game + '_best') || '0'); } catch {}
				return { name: b.name, requirement: b.label, earned: best >= b.req, best };
			});
		}
		function getSummaryText() {
			const statuses = getStatus();
			const earned = statuses.filter(s => s.earned).length;
			return '🏅 Gym Badges: ' + earned + '/8 earned\n' +
				statuses.map(s => (s.earned ? '✅' : '⬜') + ' ' + s.name + ': ' + s.requirement + (s.best > 0 ? ' (Best: ' + s.best + ')' : '')).join('\n');
		}
		return { getStatus, getSummaryText };
	})();
	window.CAMP_SYSTEMS.BadgeChallenges = BadgeChallenges;

	// ══════════════════════════════════════════════════════════════════════════════
	// HOOK PATCHES — wire new systems into existing scene hooks
	// ══════════════════════════════════════════════════════════════════════════════

	// Patch _showCampfireMenu to include Berry Tea and Poké Puffin buttons.
	// We wait for the scene class to be created then wrap the prototype method.
	const _origMakeSceneClass = window.CAMP_SCENES.makeSceneClass;
	window.CAMP_SCENES.makeSceneClass = function () {
		const SceneClass = _origMakeSceneClass.apply(this, arguments);
		const origMenu = SceneClass.prototype._showCampfireMenu;
		if (origMenu) {
			SceneClass.prototype._showCampfireMenu = function () {
				origMenu.call(this);
				// After original opens the panel, append our new buttons before Cancel
				const panel = document.getElementById('campfireChoicePanel');
				if (!panel) return;
				const inner = panel.querySelector('.pk-modal');
				if (!inner) return;
				const body = inner.querySelector('.pk-modal-body');
				if (!body) return;
				// Find cancel button (last child) and insert before it
				const cancelBtn = body.lastElementChild;
				const tempDiv = document.createElement('div');
				body.insertBefore(tempDiv, cancelBtn);
				BerryRecipes.addToCampfireMenu(panel, tempDiv, this);
			};
		}
		// Patch create() to call our new inits
		const origCreate = SceneClass.prototype.create;
		SceneClass.prototype.create = function () {
			origCreate.call(this);
			try {
				// Init new systems after camp is built
				QuickSlotBar.init();
				Minimap.init();
				HudCompact.init();
				TreasureDig.init(this);
				Journal.autoLog();
				SeasonalNPC.init(this);
				CampUpgrades.applyAll(this);
				AmbientParty.init(this);
				SeasonalGateSign.init();
			} catch (e) { console.warn('[Camp Batch 2-5 init]', e); }
		};
		// Patch update() to call per-frame hooks
		const origUpdate = SceneClass.prototype.update;
		SceneClass.prototype.update = function (time, delta) {
			origUpdate.call(this, time, delta);
			try {
				// Treasure dig sparkle pulse
				TreasureDig.updateSparkle();
				// Day/Night NPC states
				if (this.tick % 60 === 0) NpcDayNight.update(this);
			} catch {}
		};
		// Patch findInteractTarget to include dig spot
		const origFind = SceneClass.prototype.findInteractTarget;
		SceneClass.prototype.findInteractTarget = function () {
			const base = origFind.call(this);
			if (base) return base;
			// Check dig spot
			const tc = Math.floor(this.player.x / (TILE || 16));
			const tr = Math.floor(this.player.y / (TILE || 16));
			const spot = TreasureDig.getSpot();
			if (Math.abs(tr - spot.r) <= 1 && Math.abs(tc - spot.c) <= 1) {
				return { kind: 'dig', r: spot.r, c: spot.c, label: 'Dig' };
			}
			// Check seasonal NPC
			if (Math.abs(tr - 3) <= 1 && Math.abs(tc - 12) <= 1) {
				const npc = this.npcByTile && this.npcByTile['3,12'];
				if (npc && npc.kind === 'seasonal_legendary') {
					return { kind: 'seasonal_npc', r: 3, c: 12, label: 'Talk', npcData: npc };
				}
			}
			return base;
		};
		return SceneClass;
	};

	// Fix: HouseScene._buildHouse calls this._buildMarketFollower(), but the
	// partner-follower methods were only ever defined on MarketScene. Without
	// them HouseScene.create() throws and the house never loads — you "can't
	// enter the house". Borrow the follower methods onto the HouseScene
	// prototype so the partner trails the player indoors, just like outdoors.
	const _origMakeHouseSceneClass = window.CAMP_SCENES.makeHouseSceneClass;
	window.CAMP_SCENES.makeHouseSceneClass = function () {
		const HouseClass = _origMakeHouseSceneClass.apply(this, arguments);
		if (!HouseClass.prototype._buildMarketFollower || !HouseClass.prototype._updateMarketFollower) {
			const MarketClass = window.CAMP_SCENES.makeMarketSceneClass();
			if (!HouseClass.prototype._buildMarketFollower)
				HouseClass.prototype._buildMarketFollower = MarketClass.prototype._buildMarketFollower;
			if (!HouseClass.prototype._updateMarketFollower)
				HouseClass.prototype._updateMarketFollower = MarketClass.prototype._updateMarketFollower;
		}
		return HouseClass;
	};

	// Share the camp's inventory HUD updater with the Market and Beach scenes
	// so the bottom-centre stat bar (seeds / berries / tokens / …) shows live
	// values there too — otherwise it keeps the stale "0 0" placeholder.
	['makeMarketSceneClass', 'makeBeachSceneClass'].forEach((factoryName) => {
		const orig = window.CAMP_SCENES[factoryName];
		if (typeof orig !== 'function') return;
		window.CAMP_SCENES[factoryName] = function () {
			const Cls = orig.apply(this, arguments);
			if (!Cls.prototype._updateInventoryHud) {
				const CampClass = window.CAMP_SCENES.makeSceneClass();
				Cls.prototype._updateInventoryHud = CampClass.prototype._updateInventoryHud;
			}
			if (Cls.prototype.update && !Cls.prototype.__invHudPatched) {
				Cls.prototype.__invHudPatched = true;
				const origUpdate = Cls.prototype.update;
				Cls.prototype.update = function (time, delta) {
					origUpdate.call(this, time, delta);
					try { if (this._updateInventoryHud) this._updateInventoryHud(); } catch (_) {}
				};
			}
			return Cls;
		};
	});

	// Also patch gate-sign dialog to include badge status + seasonal top
	// We do this by wrapping the sign message resolution inline with a storage hook:
	// When __camprating__ or gate sign messages are shown, enrich them.
	// Enrich gate/sign dialogs with seasonal leaderboard top + badge status.
	// We intercept Dialog.open and augment messages that contain camp-related keywords.
	(function () {
		const _orig = Dialog.open;
		Dialog.open = function (message) {
			let msg = message;
			// Enrich messages that look like gate or camp rating signs
			if (typeof msg === 'string' && (msg.includes('Camp') || msg.includes('Welcome') || msg.includes('gate') || msg.toLowerCase().includes('welcome to camp'))) {
				const top = SeasonalGateSign.getText();
				if (top && !msg.includes('top score')) msg += '\n\n' + top;
				const badges = BadgeChallenges.getSummaryText();
				if (badges && !msg.includes('Gym Badges')) msg += '\n\n' + badges;
			}
			_orig.call(this, msg);
		};
	})();

	// ══════════════════════════════════════════════════════════════════════════
	// BATCH 5 — NEW FEATURES
	// ══════════════════════════════════════════════════════════════════════════

	// ── CampEvents (meteor shower + aurora borealis) ───────────────────────────
	const CampEvents = (() => {
		function _seedRng(seed) {
			let s = seed >>> 0;
			s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
			s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
			return ((s ^ (s >>> 16)) >>> 0) / 0xFFFFFFFF;
		}
		function _dateKey() { return new Date().toISOString().slice(0, 10); }
		function _numericDateSeed() { return parseInt(_dateKey().replace(/-/g, ''), 10); }
		function _showMeteor() {
			if (document.getElementById('campMeteorShower')) return;
			const el = document.createElement('div');
			el.id = 'campMeteorShower';
			for (let i = 0; i < 15; i++) {
				const streak = document.createElement('div');
				streak.className = 'meteor-streak';
				streak.style.cssText = 'left:' + (Math.random()*110-10) + '%;top:' + (Math.random()*60-20) + '%;animation-delay:' + (Math.random()*6) + 's;animation-duration:' + (0.6+Math.random()*0.8) + 's';
				el.appendChild(streak);
			}
			document.getElementById('campWrap')?.appendChild(el);
			showToast('🌠 A meteor shower is happening!');
			setTimeout(() => el.remove(), 90000);
		}
		function _showAurora() {
			if (document.getElementById('campAurora')) return;
			const el = document.createElement('div');
			el.id = 'campAurora';
			document.getElementById('campWrap')?.appendChild(el);
			showToast('🌌 Northern lights appear over camp!');
		}
		function check(scene) {
			const hour = new Date().getHours();
			const month = new Date().getMonth();
			const isWinter = month === 11 || month === 0 || month === 1;
			const dateKey = _dateKey();
			const seed = _numericDateSeed();
			if (hour >= 22) {
				const meteorKey = 'pokequiz_meteor_' + dateKey;
				if (!localStorage.getItem(meteorKey)) {
					try { localStorage.setItem(meteorKey, '1'); } catch (_) {}
					if (_seedRng(seed) < 0.20) _showMeteor();
				}
			}
			if (isWinter && hour >= 22) {
				const weatherType = WeatherSystem.currentType(scene);
				if (weatherType === 'clear') {
					const auroraKey = 'pokequiz_aurora_' + dateKey;
					if (!localStorage.getItem(auroraKey)) {
						try { localStorage.setItem(auroraKey, '1'); } catch (_) {}
						if (_seedRng(seed + 777) < 0.10) _showAurora();
					}
				}
			}
		}
		return { check };
	})();
	window.CAMP_SYSTEMS.CampEvents = CampEvents;

	// ── SeasonalSprites ────────────────────────────────────────────────────────
	const SeasonalSprites = {
		apply(scene) {
			const month = new Date().getMonth();
			const isWinter = month === 11 || month === 0 || month === 1;
			const isSummer = month >= 5 && month <= 7;
			if (isWinter) {
				[[2,3],[2,37],[26,3],[26,39],[14,1]].forEach(([r,c]) => {
					const g = scene.add.graphics().setDepth(1.9);
					const x = c*TILE+TILE/2, y = r*TILE+TILE/2;
					g.fillStyle(0xFFFFFF, 0.7); g.fillCircle(x, y, 4);
					g.fillStyle(0xEEEEFF, 0.5); g.fillCircle(x+4, y+1, 3); g.fillCircle(x-3, y+2, 2.5);
				});
			}
			if (isSummer) {
				[[18,20],[20,21],[18,22]].forEach(([r,c]) => {
					const g = scene.add.graphics().setDepth(1.9);
					const x = c*TILE+TILE/2, y = r*TILE+TILE/2;
					g.fillStyle(0x228B22, 1); g.fillRect(x-1, y+2, 2, 8);
					g.fillStyle(0xFFDD00, 1);
					for (let a = 0; a < 8; a++) { const ang = (a/8)*Math.PI*2; g.fillCircle(x+Math.cos(ang)*4, y+Math.sin(ang)*4, 2.5); }
					g.fillStyle(0x8B4513, 1); g.fillCircle(x, y, 3);
				});
			}
		},
	};
	window.CAMP_SYSTEMS.SeasonalSprites = SeasonalSprites;

	// ── OfflineProgress ────────────────────────────────────────────────────────
	const OfflineProgress = (() => {
		const KEY = 'pokequiz_last_visit';
		const WEATHER_FLAVOUR = { rain:'It rained while you were away.', snow:'Snow fell while you were gone.', fog:'A foggy mist settled over camp.', clear:'The sun shone over camp.' };
		function check() {
			const now = Date.now();
			let last = 0;
			try { last = parseInt(localStorage.getItem(KEY) || '0', 10); } catch (_) {}
			try { localStorage.setItem(KEY, String(now)); } catch (_) {}
			if (!last || (now - last) < 8 * 3600000) return;
			const hoursAway = Math.round((now - last) / 3600000);
			const scene = window.__campScene;
			const weather = scene ? WeatherSystem.currentType(scene) : 'clear';
			const weatherMsg = WEATHER_FLAVOUR[weather] || WEATHER_FLAVOUR.clear;
			const plants = Plants.load();
			const growMs = (window.CAMP_DATA || {}).GROW_MS || 60000;
			const grownCount = plants.filter(p => (now - p.plantedAt) >= growMs).length;
			const berryMsg = grownCount > 0 ? 'Your berries grew while you were away!' : 'Your berries need a bit more time.';
			const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : null;
			let partnerMsg = '';
			if (inv && (inv.companionId || inv.companion || inv.eeveeForm)) {
				const partnerName = inv.nickname || (inv.companionId ? ((window.CAMP_DATA || {}).PMD_NAMES || {})[inv.companionId] : null) || 'your partner';
				inv.friendship = Math.min(100, (inv.friendship || 0) + 5);
				try { Inventory.save(inv); } catch (_) {}
				partnerMsg = partnerName + ' missed you! (+5 friendship)';
			}
			const msg = 'You were away for ' + hoursAway + ' hour' + (hoursAway !== 1 ? 's' : '') + '! ' + weatherMsg + ' ' + berryMsg + (partnerMsg ? ' ' + partnerMsg : '');
			setTimeout(() => Dialog.open(msg), 1200);
		}
		return { check };
	})();
	window.CAMP_SYSTEMS.OfflineProgress = OfflineProgress;

	// ── CampShare ─────────────────────────────────────────────────────────────
	const CampShare = (() => {
		function _b64url(str) { return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,''); }
		function _unb64url(str) { try { return atob(str.replace(/-/g,'+').replace(/_/g,'/')); } catch { return null; } }
		function generate() {
			const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
			const trainerName = localStorage.getItem('pokequiz_trainer_name') || 'Trainer';
			const partner = inv.eeveeForm || (inv.companionId ? ((window.CAMP_DATA || {}).PMD_NAMES || {})[inv.companionId] : 'Eevee') || 'Eevee';
			const decor = (inv.cosmetics && inv.cosmetics.decor || []).slice(0,3);
			let streak = 0;
			try { const s = (typeof Stats !== 'undefined') ? Stats.load() : {}; streak = s.loginStreak || 0; } catch (_) {}
			const data = JSON.stringify({ n: trainerName, p: partner, r: 1, d: decor, s: streak });
			const encoded = _b64url(data);
			const url = window.location.origin + window.location.pathname + '?visit=' + encoded;
			try { navigator.clipboard.writeText(url); showToast('🔗 Camp link copied!'); } catch (_) { showToast('Link: ' + url); }
			return url;
		}
		function receive() {
			const params = new URLSearchParams(window.location.search);
			const visitData = params.get('visit');
			if (!visitData) return;
			const raw = _unb64url(visitData);
			if (!raw) return;
			let parsed;
			try { parsed = JSON.parse(raw); } catch { return; }
			const modal = document.getElementById('campVisitModal');
			if (!modal) return;
			modal.hidden = false;
			const nameEl = modal.querySelector('#visitModalName');
			const pokeEl = modal.querySelector('#visitModalPoke');
			const ratingEl = modal.querySelector('#visitModalRating');
			if (nameEl) nameEl.textContent = parsed.n || 'Trainer';
			if (pokeEl) pokeEl.textContent = parsed.p || 'Eevee';
			if (ratingEl) ratingEl.textContent = '★'.repeat(Math.min(5, Math.max(1, parsed.r || 1)));
		}
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(receive, 500));
		else setTimeout(receive, 500);
		return { generate, receive };
	})();
	window.CAMP_SYSTEMS.CampShare = CampShare;

	// ── RivalSystem ────────────────────────────────────────────────────────────
	const RivalSystem = (() => {
		const RIVALS = ['Red','Blue','Leaf','May','Dawn','Lucas','Ethan','Lyra'];
		const GAMES   = ['wordle','silhouette','type','stats','sprint','memory','connections','evo'];
		const GAME_LABELS = { wordle:'PokéWordle', silhouette:'Silhouette', type:'Type Quiz', stats:'Stats Quiz', sprint:'Sprint', memory:'Memory', connections:'Connections', evo:'Evolution' };
		function _seedRng(s) { let x=s>>>0; x=Math.imul(x^(x>>>16),0x45d9f3b); return ((x^(x>>>16))>>>0)/0xFFFFFFFF; }
		function getDaily() {
			const day = Math.floor(Date.now()/86400000);
			const gIdx = Math.floor(_seedRng(day*7+2)*GAMES.length);
			return { name:RIVALS[Math.floor(_seedRng(day*7+1)*RIVALS.length)], game:GAMES[gIdx], gameLabel:GAME_LABELS[GAMES[gIdx]]||'Quiz', score:Math.floor(60+_seedRng(day*7+3)*36) };
		}
		function challenge() {
			const rival = getDaily();
			const dateKey = new Date().toISOString().slice(0,10);
			const beatKey = 'pokequiz_rival_beat_' + dateKey;
			const beaten = !!localStorage.getItem(beatKey);
			const myBest = parseInt(localStorage.getItem('pokequiz_' + rival.game + '_best') || '0', 10);
			const iBeaten = myBest > rival.score;
			if (iBeaten && !beaten) {
				try { localStorage.setItem(beatKey, '1'); } catch (_) {}
				const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
				inv.tokens = (inv.tokens||0)+50;
				try { (typeof Inventory !== 'undefined') && Inventory.save(inv); } catch (_) {}
				Dialog.open('You beat Rival ' + rival.name + ' on ' + rival.gameLabel + '! (' + myBest + ' vs ' + rival.score + ') +50 tokens!');
			} else if (iBeaten) {
				Dialog.open('You already beat Rival ' + rival.name + ' today! (' + myBest + ' vs ' + rival.score + ')');
			} else {
				Dialog.open('Rival ' + rival.name + ' scored ' + rival.score + ' on ' + rival.gameLabel + '! Your best: ' + (myBest||0) + '. Beat it to earn 50 tokens!');
			}
		}
		function autoCheck() {
			const rival = getDaily();
			const dateKey = new Date().toISOString().slice(0,10);
			const beatKey = 'pokequiz_rival_beat_' + dateKey;
			if (localStorage.getItem(beatKey)) return;
			const myBest = parseInt(localStorage.getItem('pokequiz_' + rival.game + '_best') || '0', 10);
			if (myBest > rival.score) {
				try { localStorage.setItem(beatKey, '1'); } catch (_) {}
				const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
				inv.tokens = (inv.tokens||0)+50;
				try { (typeof Inventory !== 'undefined') && Inventory.save(inv); } catch (_) {}
				setTimeout(() => showToast('🏆 You beat Rival ' + rival.name + '! +50 tokens!'), 2000);
			}
		}
		return { getDaily, challenge, autoCheck };
	})();
	window.CAMP_SYSTEMS.RivalSystem = RivalSystem;

	// ── FriendList ─────────────────────────────────────────────────────────────
	const FriendList = (() => {
		const KEY = 'pokequiz_friends';
		const MAX = 10;
		function load() { try { return JSON.parse(localStorage.getItem(KEY)||'[]'); } catch { return []; } }
		function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (_) {} }
		function _parseName(url) {
			try { const params=new URLSearchParams(new URL(url).search); const tc=params.get('tc'); if(!tc)return null; const raw=atob(tc.replace(/-/g,'+').replace(/_/g,'/')); const data=JSON.parse(raw); return data.name||data.n||null; } catch { return null; }
		}
		function open() { const p=document.getElementById('friendsPanel'); if(!p)return; p.hidden=false; _render(p); }
		function _render(panel) {
			const friends=load(), body=panel.querySelector('#friendsPanelBody');
			if(!body)return; body.innerHTML='';
			if(friends.length===0){const e=document.createElement('div');e.style.cssText='font-size:7px;color:var(--pk-muted);text-align:center;padding:14px 0';e.textContent='No friends yet. Add one below!';body.appendChild(e);}
			friends.forEach((url,i)=>{
				const name=_parseName(url)||'Trainer #'+(i+1);
				const row=document.createElement('div');
				row.style.cssText='display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--pk-border);border-radius:7px;margin-bottom:6px';
				row.innerHTML='<span style="flex:1;font-size:8px;color:var(--pk-text)">'+name+'</span><a href="'+url+'" class="pk-btn pk-btn-xs pk-btn-gold" style="text-decoration:none;font-size:6px">Visit</a><button class="pk-btn pk-btn-xs pk-btn-dark friend-remove" data-idx="'+i+'" style="font-size:6px">Remove</button>';
				body.appendChild(row);
			});
			body.querySelectorAll('.friend-remove').forEach(btn=>{
				btn.addEventListener('click',()=>{const idx=parseInt(btn.dataset.idx,10);const list=load();list.splice(idx,1);save(list);_render(panel);});
			});
		}
		function addFromInput(url) {
			if(!url||!url.includes('trainer-card')){showToast('Paste a Trainer Card URL!');return;}
			const list=load(); if(list.includes(url)){showToast('Already in friends list!');return;} if(list.length>=MAX){showToast('Friends list full!');return;}
			list.push(url);save(list);showToast('Friend added!');
			const panel=document.getElementById('friendsPanel'); if(panel&&!panel.hidden)_render(panel);
		}
		const _wire = () => {
			document.getElementById('friendAddBtn')?.addEventListener('click',()=>{const i=document.getElementById('friendAddInput');addFromInput(i?.value?.trim());if(i)i.value='';});
			document.getElementById('friendsClose')?.addEventListener('click',()=>{const p=document.getElementById('friendsPanel');if(p)p.hidden=true;});
		};
		if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_wire);else _wire();
		return { open, addFromInput, load, save };
	})();
	window.CAMP_SYSTEMS.FriendList = FriendList;

	// ── Prestige ───────────────────────────────────────────────────────────────
	const Prestige = (() => {
		const KEY = 'pokequiz_prestige_count';
		function getCount() { try{return parseInt(localStorage.getItem(KEY)||'0',10);}catch{return 0;} }
		function isEligible() {
			const achData=(typeof Achievements!=='undefined')?Achievements.getAll():{defs:[],unlocked:{}};
			const unlockedCount=Object.keys(achData.unlocked).filter(k=>!k.startsWith('__count_')).length;
			const level=(typeof TrainerLevel!=='undefined')?TrainerLevel.getLevel():1;
			return unlockedCount>=20&&level>=20;
		}
		function apply() {
			if(!isEligible()){showToast('Not eligible for Prestige yet!');return;}
			const inv=(typeof Inventory!=='undefined')?Inventory.load():{};
			inv.tokens=0;inv.seeds=0;inv.oranSeeds=0;inv.premiumSeeds=0;inv.friendshipBerries=0;
			try{(typeof Inventory!=='undefined')&&Inventory.save(inv);}catch(_){}
			const newCount=getCount()+1;
			try{localStorage.setItem(KEY,String(newCount));}catch(_){}
			showToast('⭐'.repeat(newCount)+' Prestige '+newCount+'! A new journey begins!');
			_updateBadge();
		}
		function _updateBadge() {
			const count=getCount(),badge=document.getElementById('trainerLevelBadge');
			if(!badge||count===0)return;
			badge.dataset.prestige='⭐'.repeat(Math.min(count,5));
		}
		if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_updateBadge);else _updateBadge();
		return { isEligible, apply, getCount };
	})();
	window.CAMP_SYSTEMS.Prestige = Prestige;

	// ── DexRewards ─────────────────────────────────────────────────────────────
	const DexRewards = (() => {
		const KEY = 'pokequiz_dex_rewards';
		const MILESTONES = [
			{n:25,  tokens:100,  ach:null,       label:'Novice Collector', item:null},
			{n:50,  tokens:200,  ach:null,        label:null,               item:'shinyCharm'},
			{n:100, tokens:500,  ach:'dex100',    label:'Century Trainer',  item:null},
			{n:151, tokens:1000, ach:'dexMaster', label:'Pokédex Master',   item:null},
		];
		function load() { try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];} }
		function check() {
			const dexData=(typeof Pokedex!=='undefined')?Pokedex.getData?.():null;
			const caughtCount=dexData?new Set(dexData.caught||[]).size:0;
			const claimed=load();
			MILESTONES.forEach(m=>{
				if(caughtCount>=m.n&&!claimed.includes(m.n)){
					claimed.push(m.n);
					try{localStorage.setItem(KEY,JSON.stringify(claimed));}catch(_){}
					const inv=(typeof Inventory!=='undefined')?Inventory.load():{};
					inv.tokens=(inv.tokens||0)+m.tokens;
					if(m.item==='shinyCharm')inv.shinyCharm=true;
					try{(typeof Inventory!=='undefined')&&Inventory.save(inv);}catch(_){}
					setTimeout(()=>{
						showFloatingReward('+'+m.tokens+' tokens!');
						if(m.ach)(typeof Achievements!=='undefined')&&Achievements.unlock(m.ach);
						if(m.label)showAchievementBanner(m.label);
						showToast('📚 Pokédex milestone: '+m.n+' caught! +'+m.tokens+' tokens!'+(m.item==='shinyCharm'?' Shiny Charm obtained!':''));
					},500);
				}
			});
		}
		return { check };
	})();
	window.CAMP_SYSTEMS.DexRewards = DexRewards;

	// ── PartnerStats ──────────────────────────────────────────────────────────
	const PartnerStats = (() => {
		const STAT_NAMES = ['ATK','DEF','SPD','SP.ATK','SP.DEF','HP'];
		const BASE_STATS = { eevee:[55,50,55,45,65,55],vaporeon:[65,60,65,110,95,130],flareon:[130,60,65,95,110,65],jolteon:[65,60,130,110,95,65],espeon:[130,60,110,130,95,65],umbreon:[65,110,65,60,110,95],leafeon:[110,130,95,60,65,65],glaceon:[60,110,65,130,110,65],sylveon:[65,65,60,110,130,95] };
		const TRAIN_COST = 10;
		function _key(dexId) { return 'pokequiz_partner_stats_'+dexId; }
		function getStats(dexId, formKey) { try{return JSON.parse(localStorage.getItem(_key(dexId))||'null')||[...(BASE_STATS[formKey||'eevee']||[50,50,50,50,50,50])];}catch{return[50,50,50,50,50,50];} }
		function trainStat(dexId, formKey, statIdx) {
			const inv=(typeof Inventory!=='undefined')?Inventory.load():{};
			if((inv.tokens||0)<TRAIN_COST){showToast('Need 10 tokens to train!');return false;}
			inv.tokens-=TRAIN_COST;
			try{(typeof Inventory!=='undefined')&&Inventory.save(inv);}catch(_){}
			const stats=getStats(dexId,formKey);
			stats[statIdx]=Math.min(255,stats[statIdx]+5);
			try{localStorage.setItem(_key(dexId),JSON.stringify(stats));}catch(_){}
			return stats;
		}
		function renderPanel(container, dexId, formKey) {
			if(!container)return;
			const stats=getStats(dexId,formKey);
			container.innerHTML='';
			const title=document.createElement('div');title.style.cssText='font-size:7px;color:var(--pk-gold);margin-bottom:8px';title.textContent='TRAINING STATS';container.appendChild(title);
			STAT_NAMES.forEach((name,i)=>{
				const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:6px;margin-bottom:5px';
				const lbl=document.createElement('span');lbl.style.cssText='font-size:6px;color:var(--pk-muted);width:38px;flex-shrink:0';lbl.textContent=name;
				const barWrap=document.createElement('div');barWrap.style.cssText='flex:1;height:5px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden';
				const bar=document.createElement('div');
				const pct=Math.round((stats[i]/255)*100);
				const col=stats[i]>=100?'#50dd88':stats[i]>=60?'#f6c84c':'#f06868';
				bar.style.cssText='width:'+pct+'%;height:100%;background:'+col+';border-radius:3px';
				barWrap.appendChild(bar);
				const val=document.createElement('span');val.style.cssText='font-size:6px;color:#e8eaf0;width:22px;text-align:right';val.textContent=stats[i];
				const trainBtn=document.createElement('button');trainBtn.className='pk-btn pk-btn-xs pk-btn-dark';trainBtn.style.cssText='font-size:6px;padding:2px 6px';trainBtn.textContent='+';trainBtn.title='Train '+name+' ('+TRAIN_COST+' tokens)';
				trainBtn.addEventListener('click',()=>{const ns=trainStat(dexId,formKey,i);if(ns)renderPanel(container,dexId,formKey);});
				row.appendChild(lbl);row.appendChild(barWrap);row.appendChild(val);row.appendChild(trainBtn);container.appendChild(row);
			});
		}
		return { getStats, trainStat, renderPanel };
	})();
	window.CAMP_SYSTEMS.PartnerStats = PartnerStats;

	// ── TrainerTitles ─────────────────────────────────────────────────────────
	const TrainerTitles = (() => {
		const TITLES = [
			{id:'shinyHunter',label:'Shiny Hunter', check:(s)=>(s.totalShinies||0)>=3},
			{id:'scholar',    label:'Scholar',      check:(s)=>(s.bestQuizScore||0)>=80},
			{id:'veteran',    label:'Veteran',      check:(s)=>(s.loginStreak||0)>=14},
			{id:'fisherKing', label:'Fisher King',  check:(s)=>(s.totalCatches||0)>=20},
			{id:'berryFarmer',label:'Berry Farmer', check:(s)=>(s.totalHarvests||0)>=30},
			{id:'berryMaster',label:'Berry Master', check:(s)=>(s.totalBerriesFed||0)>=50},
		];
		function getCurrent() { const s=(typeof Stats!=='undefined')?Stats.load():{}; for(const t of TITLES){if(t.check(s))return t;} return null; }
		function getAll() { const s=(typeof Stats!=='undefined')?Stats.load():{}; return TITLES.map(t=>({...t,earned:t.check(s)})); }
		function updateHUD() { const el=document.getElementById('trainerTitleBadge');if(!el)return;const t=getCurrent();el.textContent=t?t.label:'';el.hidden=!t; }
		function check() { const t=getCurrent();if(!t)return;try{localStorage.setItem('pokequiz_trainer_title',t.id);}catch(_){}updateHUD(); }
		if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(check,800));else setTimeout(check,800);
		return { getCurrent, getAll, updateHUD, check };
	})();
	window.CAMP_SYSTEMS.TrainerTitles = TrainerTitles;

	// ── PhotoAlbum ─────────────────────────────────────────────────────────────
	const PhotoAlbum = (() => {
		const KEY = 'pokequiz_photo_album';
		const MAX = 10;
		function load() { try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];} }
		function save(album) { try{localStorage.setItem(KEY,JSON.stringify(album));}catch(_){} }
		function saveToAlbum(dataUrl) {
			const album=load();
			if(album.length>=MAX){showToast('Album full! (max '+MAX+' photos)');return;}
			album.unshift({url:dataUrl,ts:Date.now()});save(album);showToast('📸 Photo saved to album!');
		}
		function open() { const p=document.getElementById('photoAlbumPanel');if(!p)return;p.hidden=false;_render(p); }
		function _render(panel) {
			const album=load(),body=panel.querySelector('#photoAlbumGrid');
			if(!body)return;body.innerHTML='';
			if(album.length===0){body.innerHTML='<div style="font-size:7px;color:var(--pk-muted);text-align:center;padding:18px 0">No photos yet!</div>';return;}
			album.forEach((photo,i)=>{
				const cell=document.createElement('div');cell.style.cssText='position:relative;cursor:pointer;border-radius:6px;overflow:hidden;border:1px solid var(--pk-border)';
				const img=document.createElement('img');img.src=photo.url;img.style.cssText='width:100%;height:80px;object-fit:cover;display:block';
				img.addEventListener('click',()=>_viewFull(photo.url));
				const del=document.createElement('button');del.style.cssText='position:absolute;top:3px;right:3px;background:rgba(200,0,0,0.8);border:none;padding:2px 5px;font-size:7px;border-radius:4px;cursor:pointer;color:#fff';del.textContent='✕';
				del.addEventListener('click',(e)=>{e.stopPropagation();const a=load();a.splice(i,1);save(a);_render(panel);});
				cell.appendChild(img);cell.appendChild(del);body.appendChild(cell);
			});
		}
		function _viewFull(url) {
			const ex=document.getElementById('photoFullView');if(ex)ex.remove();
			const overlay=document.createElement('div');overlay.id='photoFullView';overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:900;display:flex;align-items:center;justify-content:center;cursor:pointer';
			const img=document.createElement('img');img.src=url;img.style.cssText='max-width:90%;max-height:90%;border-radius:8px;border:2px solid var(--pk-gold)';
			overlay.appendChild(img);overlay.addEventListener('click',()=>overlay.remove());document.body.appendChild(overlay);
		}
		const _wire=()=>{document.getElementById('photoAlbumClose')?.addEventListener('click',()=>{const p=document.getElementById('photoAlbumPanel');if(p)p.hidden=true;});};
		if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_wire);else _wire();
		return { open, saveToAlbum, load };
	})();
	window.CAMP_SYSTEMS.PhotoAlbum = PhotoAlbum;

	// ── Villagers ─────────────────────────────────────────────────────────────
	const Villagers = (() => {
		function _rng(s){let x=s>>>0;x=Math.imul(x^(x>>>16),0x45d9f3b);return((x^(x>>>16))>>>0);}
		const DEFS = [
			{id:'lily',name:'Picnicker Lily',sprite:'npc-picnicker',row:5,col:3,
				unlockKey:()=>{const s=(typeof Stats!=='undefined')?Stats.load():{};return(s.loginStreak||0)>=7;},
				dialogues:["The flowers remind me of Floaroma Town!","Have you tried growing Oran Berries?","I heard a wild Eevee was spotted nearby!","Beautiful weather today! Perfect for a picnic.","Your camp is really coming along nicely!"]},
			{id:'tom',name:'Hiker Tom',sprite:'npc-camper',row:3,col:14,
				unlockKey:()=>{const inv=(typeof Inventory!=='undefined')?Inventory.load():{};return(inv.totalBerriesFed||0)>=50;},
				dialogues:["I've scaled Mt. Coronet and THIS camp still impresses me!","Berries? I eat those for breakfast on long hikes.","The fishing spot nearby is great!","Any good curry recipes?","Keep training hard! That's the hiker way!"]},
			{id:'sora',name:'Scientist Sora',sprite:'npc-scientist',row:8,col:10,
				unlockKey:()=>{const dex=(typeof Pokedex!=='undefined')?Pokedex.getData?.():null;return dex?new Set(dex.caught||[]).size>=25:false;},
				dialogues:["Fascinating! A wild Pokémon ecosystem right here!","I'm studying how Eevee adapts to environments.","Did you know Porygon was created from code?","Your Pokédex data is invaluable!","Keep catching Pokémon — science demands it!"]},
		];
		function apply(scene) {
			if(!scene||!scene.add)return;
			const dayNum=Math.floor(Date.now()/86400000);
			DEFS.forEach(def=>{
				if(!def.unlockKey())return;
				const dialogIdx=_rng(dayNum+def.id.length)%def.dialogues.length;
				const dialogue=def.dialogues[dialogIdx];
				const x=def.col*TILE+TILE/2,y=def.row*TILE+TILE/2;
				let npcSprite;
				if(scene.textures.exists(def.sprite)){npcSprite=scene.add.image(x,y,def.sprite).setDepth(3).setOrigin(0.5,1).setScale(1.2);}
				else{npcSprite=scene.add.text(x,y,'🧑',{fontSize:'16px'}).setDepth(3).setOrigin(0.5,1);}
				scene.add.text(x,y-22,def.name,{fontFamily:'"Press Start 2P"',fontSize:'4px',color:'#f6c84c',stroke:'#000',strokeThickness:2}).setDepth(4).setOrigin(0.5,1);
				if(!scene.npcByTile)scene.npcByTile={};
				scene.npcByTile[def.row+','+def.col]={kind:'villager',label:'Talk',name:def.name,message:dialogue,sprite:npcSprite};
			});
		}
		return { apply };
	})();
	window.CAMP_SYSTEMS.Villagers = Villagers;

	// ── GardenExpansion ────────────────────────────────────────────────────────
	const GardenExpansion = (() => {
		const KEY = 'pokequiz_garden_plots';
		const COST = 150;
		const EXTRA_TILES = [[[21,14],[21,15],[21,16]],[[22,14],[22,15],[22,16]],[[23,14],[23,15],[23,16]]];
		function getPlotCount(){try{return Math.max(1,Math.min(4,parseInt(localStorage.getItem(KEY)||'1',10)));}catch{return 1;}}
		function buy(){
			const current=getPlotCount();if(current>=4){showToast('Already at max garden plots!');return false;}
			const inv=(typeof Inventory!=='undefined')?Inventory.load():{};
			if((inv.tokens||0)<COST){showToast('Need 150 tokens to buy a plot!');return false;}
			inv.tokens-=COST;try{(typeof Inventory!=='undefined')&&Inventory.save(inv);}catch(_){}
			const newCount=current+1;try{localStorage.setItem(KEY,String(newCount));}catch(_){}
			showToast('🌱 Garden expanded! Plot '+newCount+' unlocked!');return true;
		}
		function getExtraTiles(){const count=getPlotCount(),tiles=[];for(let i=0;i<count-1;i++){(EXTRA_TILES[i]||[]).forEach(([r,c])=>tiles.push(r+','+c));}return tiles;}
		return{getPlotCount,buy,getExtraTiles,COST};
	})();
	window.CAMP_SYSTEMS.GardenExpansion = GardenExpansion;

	// ── NotifFeed ──────────────────────────────────────────────────────────────
	const NotifFeed = (() => {
		const KEY = 'pokequiz_notif_feed';
		const MAX = 20;
		function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
		function save(feed){try{localStorage.setItem(KEY,JSON.stringify(feed));}catch(_){}}
		function push(text,icon){
			const feed=load();feed.unshift({text,icon:icon||'bell-fill',ts:Date.now()});
			if(feed.length>MAX)feed.length=MAX;save(feed);
			const badge=document.getElementById('campNotifBadge');
			const unread=parseInt(badge?.dataset.unread||'0',10)+1;
			if(badge){badge.dataset.unread=String(unread);badge.textContent=unread;badge.hidden=false;}
		}
		function markRead(){const badge=document.getElementById('campNotifBadge');if(badge){badge.dataset.unread='0';badge.hidden=true;}}
		function open(){
			const drawer=document.getElementById('notifDrawer');
			if(!drawer){_legacyOpen();return;}
			drawer.hidden=!drawer.hidden;
			if(!drawer.hidden){_renderDrawer(drawer);markRead();}
		}
		function _legacyOpen(){
			const existing=document.getElementById('notifDropdown');if(existing){existing.remove();return;}
			const feed=load();
			const dropdown=document.createElement('div');dropdown.id='notifDropdown';
			dropdown.style.cssText='position:absolute;top:44px;right:8px;z-index:200;background:rgba(10,14,28,0.97);border:1px solid rgba(246,200,76,0.28);border-radius:8px;padding:8px 12px;min-width:240px;max-width:300px;max-height:320px;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,0.5)';
			dropdown.innerHTML=feed.length===0?'<div style="font-size:7px;color:var(--pk-muted);padding:4px 0">No notifications yet!</div>':
				feed.map(n=>'<div style="display:flex;align-items:flex-start;gap:6px;font-size:7px;color:#e8eaf0;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.06)"><i class="bi bi-'+(n.icon||'bell-fill')+'" style="color:var(--pk-gold);flex-shrink:0;margin-top:1px"></i><span>'+n.text+'</span></div>').join('');
			const campWrap=document.getElementById('campWrap')||document.body;campWrap.appendChild(dropdown);
			markRead();
			function dismiss(e){const btn=document.getElementById('campNotifBtn');if(!dropdown.contains(e.target)&&e.target!==btn){dropdown.remove();document.removeEventListener('click',dismiss,true);}}
			setTimeout(()=>document.addEventListener('click',dismiss,true),0);
		}
		function _renderDrawer(drawer){
			const feed=load(),body=drawer.querySelector('#notifDrawerBody');if(!body)return;body.innerHTML='';
			if(feed.length===0){body.innerHTML='<div style="font-size:7px;color:var(--pk-muted);padding:8px 0;text-align:center">No notifications yet!</div>';return;}
			feed.forEach(n=>{
				const row=document.createElement('div');row.style.cssText='display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)';
				const ts=new Date(n.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
				row.innerHTML='<i class="bi bi-'+(n.icon||'bell-fill')+'" style="color:var(--pk-gold);flex-shrink:0;margin-top:1px"></i><div style="flex:1"><div style="font-size:7px;color:#e8eaf0">'+n.text+'</div><div style="font-size:6px;color:var(--pk-muted);margin-top:2px">'+ts+'</div></div>';
				body.appendChild(row);
			});
		}
		const _wire=()=>{document.getElementById('notifDrawerClose')?.addEventListener('click',()=>{const d=document.getElementById('notifDrawer');if(d)d.hidden=true;});};
		if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_wire);else _wire();
		return{push,markRead,open,load};
	})();
	window.CAMP_SYSTEMS.NotifFeed = NotifFeed;

	// ── WeeklyChallenge ────────────────────────────────────────────────────────
	const WeeklyChallenge = (() => {
		const OBJECTIVES=[
			{id:'berries', label:'Feed 10 berries',        stat:'totalBerriesFed',target:10},
			{id:'harvest', label:'Harvest 15 berries',      stat:'totalHarvests',  target:15},
			{id:'fish',    label:'Catch 3 fish',            stat:'totalCatches',   target:3},
			{id:'rhythm',  label:'Win 3 rhythm battles',    stat:'rhythmWins',     target:3},
			{id:'dig',     label:'Dig 3 treasures',         stat:'totalDigs',      target:3},
			{id:'shiny',   label:'Find 1 shiny Pokémon',    stat:'totalShinies',   target:1},
			{id:'market',  label:'Visit market 3 times',    stat:'marketVisits',   target:3},
			{id:'befriend',label:'Befriend 5 wild Pokémon', stat:'wildBefriended', target:5},
		];
		const REWARD_TOKENS=200;
		function _isoWeek(){const d=new Date(),jan4=new Date(d.getFullYear(),0,4);const wn=Math.ceil((((d-jan4)/86400000)+jan4.getDay()+1)/7);return d.getFullYear()+'-W'+String(wn).padStart(2,'0');}
		function _weekKey(){return 'pokequiz_weekly_'+_isoWeek();}
		function getCurrent(){const s=_isoWeek().replace(/\D/g,'');return OBJECTIVES[(parseInt(s,10)>>>0)%OBJECTIVES.length];}
		function _loadData(){try{return JSON.parse(localStorage.getItem(_weekKey())||'{"progress":0,"done":false}');}catch{return{progress:0,done:false};}}
		function _saveData(d){try{localStorage.setItem(_weekKey(),JSON.stringify(d));}catch(_){}}
		function getProgress(){const obj=getCurrent(),data=_loadData();return{objective:obj,progress:data.progress||0,done:!!data.done};}
		function checkProgress(){
			const obj=getCurrent(),data=_loadData();if(data.done)return;
			const stats=(typeof Stats!=='undefined')?Stats.load():{};
			data.progress=Math.min(obj.target,stats[obj.stat]||0);
			if(data.progress>=obj.target){
				data.done=true;_saveData(data);
				const inv=(typeof Inventory!=='undefined')?Inventory.load():{};inv.tokens=(inv.tokens||0)+REWARD_TOKENS;
				try{(typeof Inventory!=='undefined')&&Inventory.save(inv);}catch(_){}
				(typeof Achievements!=='undefined')&&Achievements.unlock('weekly_1');
				setTimeout(()=>{showToast('🗓️ Weekly Challenge Complete! +'+REWARD_TOKENS+' tokens!');NotifFeed.push('Weekly Challenge complete! +'+REWARD_TOKENS+' tokens!','calendar-week-fill');},1000);
			}else{_saveData(data);}
		}
		function open(){const p=document.getElementById('weeklyPanel');if(!p)return;p.hidden=false;_renderPanel(p);}
		function _renderPanel(panel){
			const{objective,progress,done}=getProgress(),body=panel.querySelector('#weeklyPanelBody');if(!body)return;
			const pct=Math.min(100,Math.round((progress/objective.target)*100));
			body.innerHTML='<div style="font-size:7px;color:var(--pk-muted);margin-bottom:10px">Week of '+_isoWeek()+'</div><div style="font-size:9px;color:var(--pk-gold);margin-bottom:8px">'+objective.label+'</div><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="flex:1;height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:'+(done?'#50dd88':'#f6c84c')+';border-radius:4px"></div></div><span style="font-size:7px;color:#e8eaf0;flex-shrink:0">'+progress+'/'+objective.target+'</span></div>'+(done?'<div style="font-size:7px;color:#50dd88">✓ Completed! Reward claimed.</div>':'<div style="font-size:7px;color:var(--pk-muted)">Reward: '+REWARD_TOKENS+' tokens</div>');
		}
		const _wire=()=>{document.getElementById('weeklyClose')?.addEventListener('click',()=>{const p=document.getElementById('weeklyPanel');if(p)p.hidden=true;});};
		if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_wire);else _wire();
		return{getCurrent,getProgress,checkProgress,open};
	})();
	window.CAMP_SYSTEMS.WeeklyChallenge = WeeklyChallenge;

	// ── SaveSlots ──────────────────────────────────────────────────────────────
	const SaveSlots = (() => {
		const NUM_SLOTS=3;
		function _getAllKeys(){const k=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&key.startsWith('pokequiz_')&&!key.startsWith('pokequiz_slot'))k.push(key);}return k;}
		function _slotPrefix(n){return 'pokequiz_slot'+n+'_';}
		function saveToSlot(n){
			const prefix=_slotPrefix(n);
			_getAllKeys().forEach(k=>{try{const v=localStorage.getItem(k);if(v!==null)localStorage.setItem(prefix+k,v);}catch(_){}});
			const inv=(typeof Inventory!=='undefined')?Inventory.load():{};
			const meta={name:localStorage.getItem('pokequiz_trainer_name')||'Trainer',level:(typeof TrainerLevel!=='undefined')?TrainerLevel.getLevel():1,partner:inv.eeveeForm||'Eevee',ts:Date.now()};
			try{localStorage.setItem(prefix+'__meta__',JSON.stringify(meta));}catch(_){}
			showToast('💾 Saved to Slot '+n+'!');
		}
		function loadFromSlot(n){
			const prefix=_slotPrefix(n),allKeys=[];
			for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(prefix)&&!k.endsWith('__meta__'))allKeys.push(k);}
			if(allKeys.length===0){showToast('Slot '+n+' is empty!');return;}
			_getAllKeys().forEach(k=>{try{localStorage.removeItem(k);}catch(_){}});
			allKeys.forEach(k=>{const mk=k.slice(prefix.length);try{const v=localStorage.getItem(k);if(v!==null)localStorage.setItem(mk,v);}catch(_){}});
			showToast('📂 Loaded Slot '+n+'! Reloading…');setTimeout(()=>window.location.reload(),1000);
		}
		function deleteSlot(n){
			const prefix=_slotPrefix(n),toDelete=[];
			for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(prefix))toDelete.push(k);}
			toDelete.forEach(k=>{try{localStorage.removeItem(k);}catch(_){}});showToast('🗑️ Slot '+n+' deleted.');
		}
		function getSlotMeta(n){try{return JSON.parse(localStorage.getItem(_slotPrefix(n)+'__meta__')||'null');}catch{return null;}}
		function open(){const p=document.getElementById('saveSlotsPanel');if(!p)return;p.hidden=false;_renderPanel(p);}
		function _renderPanel(panel){
			const body=panel.querySelector('#saveSlotsPanelBody');if(!body)return;body.innerHTML='';
			for(let i=1;i<=NUM_SLOTS;i++){
				const meta=getSlotMeta(i);
				const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--pk-border);border-radius:8px;margin-bottom:8px';
				const info=document.createElement('div');info.style.flex='1';
				const slotTitle=document.createElement('div');slotTitle.style.cssText='font-size:8px;color:var(--pk-gold)';slotTitle.textContent='Slot '+i;info.appendChild(slotTitle);
				if(meta){const d=document.createElement('div');d.style.cssText='font-size:6px;color:var(--pk-muted);margin-top:3px';d.textContent=meta.name+' · Lv.'+meta.level+' · '+meta.partner+' · '+new Date(meta.ts).toLocaleDateString();info.appendChild(d);}
				else{const e=document.createElement('div');e.style.cssText='font-size:6px;color:var(--pk-faint);margin-top:3px';e.textContent='Empty';info.appendChild(e);}
				const btns=document.createElement('div');btns.style.cssText='display:flex;gap:4px;flex-shrink:0';
				const saveBtn=document.createElement('button');saveBtn.className='pk-btn pk-btn-xs pk-btn-gold';saveBtn.textContent='Save';saveBtn.addEventListener('click',()=>{saveToSlot(i);_renderPanel(panel);});
				const loadBtn=document.createElement('button');loadBtn.className='pk-btn pk-btn-xs pk-btn-dark';loadBtn.textContent='Load';loadBtn.disabled=!meta;loadBtn.addEventListener('click',()=>{if(meta)loadFromSlot(i);});
				const delBtn=document.createElement('button');delBtn.className='pk-btn pk-btn-xs';delBtn.style.background='rgba(180,30,30,0.7)';delBtn.textContent='✕';delBtn.disabled=!meta;delBtn.addEventListener('click',()=>{if(meta){deleteSlot(i);_renderPanel(panel);}});
				btns.appendChild(saveBtn);btns.appendChild(loadBtn);btns.appendChild(delBtn);row.appendChild(info);row.appendChild(btns);body.appendChild(row);
			}
		}
		const _wire=()=>{document.getElementById('saveSlotsClose')?.addEventListener('click',()=>{const p=document.getElementById('saveSlotsPanel');if(p)p.hidden=true;});};
		if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_wire);else _wire();
		return{open,saveToSlot,loadFromSlot,deleteSlot,getSlotMeta};
	})();
	window.CAMP_SYSTEMS.SaveSlots = SaveSlots;

	// ── SaveIO ─────────────────────────────────────────────────────────────────
	const SaveIO = (() => {
		function exportSave(){
			const data={};
			for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('pokequiz_')){try{data[k]=localStorage.getItem(k);}catch(_){}}}
			const json=JSON.stringify(data,null,2),blob=new Blob([json],{type:'application/json'}),url=URL.createObjectURL(blob);
			const a=document.createElement('a');a.href=url;a.download='pokequiz-save-'+new Date().toISOString().slice(0,10)+'.json';a.click();
			URL.revokeObjectURL(url);showToast('💾 Save exported!');
		}
		function importSave(json){
			let data;try{data=JSON.parse(json);}catch{showToast('Invalid save file!');return;}
			const overlay=document.createElement('div');overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:999;display:flex;align-items:center;justify-content:center';
			const box=document.createElement('div');box.style.cssText='background:var(--pk-bg,#0a1220);border:2px solid var(--pk-gold,#f6c84c);border-radius:10px;padding:20px;max-width:320px;font-family:"Press Start 2P",monospace;text-align:center';
			box.innerHTML='<div style="font-size:8px;color:#f6c84c;margin-bottom:12px">Import Save</div><div style="font-size:7px;color:#c8d8f0;margin-bottom:16px">This will overwrite your current save. Continue?</div><div style="display:flex;gap:8px;justify-content:center"><button id="_importYes" class="pk-btn pk-btn-gold pk-btn-sm">Yes, Import</button><button id="_importNo" class="pk-btn pk-btn-dark pk-btn-sm">Cancel</button></div>';
			overlay.appendChild(box);document.body.appendChild(overlay);
			document.getElementById('_importYes').addEventListener('click',()=>{Object.entries(data).forEach(([k,v])=>{if(k.startsWith('pokequiz_'))try{localStorage.setItem(k,v);}catch(_){}});overlay.remove();showToast('✅ Save imported! Reloading…');setTimeout(()=>window.location.reload(),1000);});
			document.getElementById('_importNo').addEventListener('click',()=>overlay.remove());
		}
		const _wire=()=>{document.getElementById('saveImportInput')?.addEventListener('change',(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=(ev)=>importSave(ev.target.result);r.readAsText(f);});};
		if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_wire);else _wire();
		return{exportSave,importSave};
	})();
	window.CAMP_SYSTEMS.SaveIO = SaveIO;

	// ── PWAInstall ─────────────────────────────────────────────────────────────
	const PWAInstall = (() => {
		let _deferredPrompt=null;
		window.addEventListener('beforeinstallprompt',(e)=>{e.preventDefault();_deferredPrompt=e;const btn=document.getElementById('campInstallBtn');if(btn)btn.hidden=false;});
		function prompt(){if(!_deferredPrompt)return;_deferredPrompt.prompt();_deferredPrompt.userChoice.then(()=>{_deferredPrompt=null;const btn=document.getElementById('campInstallBtn');if(btn)btn.hidden=true;});}
		const _wire=()=>{document.getElementById('campInstallBtn')?.addEventListener('click',prompt);};
		if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_wire);else _wire();
		return{prompt};
	})();
	window.CAMP_SYSTEMS.PWAInstall = PWAInstall;

	// ── MobileBottomSheet ──────────────────────────────────────────────────────
	const MobileBottomSheet = (() => {
		let _open=false;
		function init(){
			const bar=document.getElementById('campBtnBarItems');
			if(!bar)return;
			function applyMobile(){if(window.innerWidth<=600){bar.classList.add('camp-mobile-sheet');}else{bar.classList.remove('camp-mobile-sheet');bar.classList.remove('camp-mobile-sheet--open');_open=false;}}
			applyMobile();window.addEventListener('resize',applyMobile);
		}
		function toggle(){const bar=document.getElementById('campBtnBarItems');if(!bar||!bar.classList.contains('camp-mobile-sheet'))return;_open=!_open;bar.classList.toggle('camp-mobile-sheet--open',_open);}
		function close(){const bar=document.getElementById('campBtnBarItems');if(!bar||!_open)return;_open=false;bar.classList.remove('camp-mobile-sheet--open');}
		if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
		return{toggle,close,init};
	})();
	window.CAMP_SYSTEMS.MobileBottomSheet = MobileBottomSheet;

	// ── Colorblind Mode patch ─────────────────────────────────────────────────
	(function(){
		const _origApply=AccessibilitySettings.apply;
		function _ensureFilter(){
			if(document.getElementById('cb-deuteranopia-filter'))return;
			const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
			svg.id='cb-deuteranopia-filter';svg.setAttribute('style','position:absolute;width:0;height:0;overflow:hidden');
			svg.innerHTML='<defs><filter id="cb-deuteranopia"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.700 0.300 0 0 0  0 0.300 0.700 0 0  0 0 0 1 0"/></filter></defs>';
			document.body.appendChild(svg);
		}
		AccessibilitySettings.apply=function(cfg){_origApply.call(this,cfg);if(cfg.colorblind){_ensureFilter();document.body.classList.add('cb-colorblind');}else{document.body.classList.remove('cb-colorblind');}};
		AccessibilitySettings.apply(AccessibilitySettings.load());
	})();

	// ── Patch setupPauseMenu for new buttons ──────────────────────────────────
	(function(){
		const _origSetup=window.CAMP_SYSTEMS.setupPauseMenu;
		window.CAMP_SYSTEMS.setupPauseMenu=function(game){
			_origSetup(game);
			const panel=document.getElementById('campPause');
			if(!panel||panel.dataset.b5Wired)return;
			panel.dataset.b5Wired='1';
			const observer=new MutationObserver(()=>{
				const body=document.querySelector('#accessPanel .pk-modal-body');
				if(!body||body.dataset.cbAdded)return;
				body.dataset.cbAdded='1';
				const cfg=AccessibilitySettings.load();
				const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--pk-border);border-radius:8px';
				row.innerHTML='<div><div style="font-size:9px;color:var(--pk-text)">Colorblind Mode</div><div style="font-size:7px;color:var(--pk-muted);margin-top:2px">Deuteranopia filter</div></div>';
				const btn=document.createElement('button');btn.className='pk-btn pk-btn-sm '+(cfg.colorblind?'pk-btn-gold':'pk-btn-dark');btn.style.minWidth='44px';btn.textContent=cfg.colorblind?'On':'Off';
				btn.addEventListener('click',()=>{const nv=AccessibilitySettings.toggle('colorblind');btn.className='pk-btn pk-btn-sm '+(nv?'pk-btn-gold':'pk-btn-dark');btn.textContent=nv?'On':'Off';});
				row.appendChild(btn);body.appendChild(row);
			});
			const acPanel=document.getElementById('accessPanel');
			if(acPanel)observer.observe(acPanel,{childList:true,subtree:true});
			document.getElementById('campPauseSaveSlots')?.addEventListener('click',()=>{panel.hidden=true;SaveSlots.open();});
			document.getElementById('campPausePrestige')?.addEventListener('click',()=>{
				panel.hidden=true;
				if(Prestige.isEligible()){if(confirm('Prestige now? You keep Pokémon, Pokédex, and achievements but lose tokens/seeds/berries.'))Prestige.apply();}
				else{Dialog.open('Complete all achievements and reach Trainer Level 20 to Prestige!');}
			});
			document.getElementById('campPauseExport')?.addEventListener('click',()=>SaveIO.exportSave());
			document.getElementById('campPauseImport')?.addEventListener('click',()=>document.getElementById('saveImportInput')?.click());
		};
	})();

	// ── PartnerBondSkills ──────────────────────────────────────────────────────
	const PartnerBondSkills = (() => {
		const TYPE_PERKS = {
			fire:     { label: '+15% quiz XP',                 desc: 'Earn 15% more XP on quiz pages.' },
			water:    { label: 'Fishing always bites',          desc: 'Every cast is guaranteed to catch something.' },
			grass:    { label: 'Berries grow 50% faster',       desc: 'Berry grow timers are cut in half.' },
			electric: { label: 'Sprint quiz timer +3s',         desc: 'Sprint quiz questions give 3 extra seconds.' },
			psychic:  { label: 'Shiny rate doubled',            desc: 'Shiny Pokémon encounters are twice as likely.' },
			normal:   { label: '+5 tokens per daily login',     desc: 'Collect 5 bonus tokens every day.' },
			ghost:    { label: 'Secret area resets every 12h',  desc: 'Secret areas refresh twice as often.' },
			dragon:   { label: 'Camp rating gain +25%',         desc: 'All camp rating actions earn 25% more stars.' },
			fighting: { label: 'Curry always max quality',      desc: 'Campfire curry is always best quality.' },
			poison:   { label: 'Berry trader refreshes 2×/day', desc: 'Berry trader stock refreshes twice daily.' },
			ice:      { label: 'Rival cooldown halved',         desc: 'Challenge rivals again in half the usual time.' },
			rock:     { label: 'Dig finds double items',        desc: 'Digging for treasure yields twice as many items.' },
			ground:   { label: '+10% token earnings',           desc: 'Earn 10% more tokens from all sources.' },
			bug:      { label: 'Berry harvests +1 extra',       desc: 'Each berry harvest yields one bonus berry.' },
			steel:    { label: 'No durability loss on tools',   desc: 'Fishing/digging tools never degrade.' },
			dark:     { label: 'Night bonuses always active',   desc: 'Night-time camp bonuses apply 24 hours a day.' },
			fairy:    { label: 'Friendship gains +10%',         desc: 'All friendship increases are 10% higher.' },
			flying:   { label: 'Expedition returns 20% faster', desc: 'Expedition return time is reduced by 20%.' },
		};
		const MILESTONES = [25, 50, 75, 100];
		const KEY = 'pokequiz_bond_perks';

		function _load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
		function _save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(_) {} }

		function check() {
			try {
				const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
				const friendship = inv.friendship || 0;
				const partnerType = (inv.partnerType || 'normal').toLowerCase();
				const data = _load();
				const currentLevel = MILESTONES.filter(m => friendship >= m).length;
				const prevLevel = data[partnerType] || 0;
				if (currentLevel > prevLevel) {
					data[partnerType] = currentLevel;
					_save(data);
					const perk = TYPE_PERKS[partnerType];
					if (perk) {
						setTimeout(() => {
							showToast('🌟 Bond Perk Unlocked! ' + perk.label);
							(typeof NotifFeed !== 'undefined') && NotifFeed.push('Bond Perk: ' + perk.label, 'star-fill');
						}, 800);
					}
				}
			} catch(_) {}
		}

		function getPerks() {
			const data = _load();
			return Object.entries(data).map(([type, level]) => ({
				type, level,
				...(TYPE_PERKS[type] || { label: type, desc: '' })
			}));
		}

		function applyPassive(type) {
			try {
				const data = _load();
				const t = (type || '').toLowerCase();
				return (data[t] || 0) > 0;
			} catch { return false; }
		}

		function hasPerk(type) { return applyPassive(type); }

		return { check, getPerks, applyPassive, hasPerk, TYPE_PERKS };
	})();
	window.CAMP_SYSTEMS.PartnerBondSkills = PartnerBondSkills;

	// ── BerryBuffs ─────────────────────────────────────────────────────────────
	const BerryBuffs = (() => {
		const BUFF_DURATION_MS = 30 * 60 * 1000; // 30 minutes
		const KEY = 'pokequiz_active_buff';
		const BUFF_DEFS = {
			sitrus: { name: 'Sitrus Berry', icon: '🍇', desc: '+1 extra life on quiz pages.' },
			oran:   { name: 'Oran Berry',   icon: '🫐', desc: '+5 seconds on quiz timer.' },
			leppa:  { name: 'Leppa Berry',  icon: '🍒', desc: 'Combo streak starts at ×1.5.' },
			pecha:  { name: 'Pecha Berry',  icon: '🍑', desc: 'No friendship penalty on wrong answers.' },
		};

		function getActive() {
			try {
				const raw = localStorage.getItem(KEY);
				if (!raw) return null;
				const buff = JSON.parse(raw);
				if (Date.now() > buff.expires) { localStorage.removeItem(KEY); return null; }
				if (localStorage.getItem('pokequiz_buff_used') === '1') {
					localStorage.removeItem(KEY);
					localStorage.removeItem('pokequiz_buff_used');
					return null;
				}
				return buff;
			} catch { return null; }
		}

		function activateBuff(berryType) {
			const def = BUFF_DEFS[berryType];
			if (!def) return;
			const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
			const berries = inv.berries || {};
			const count = berries[berryType] || 0;
			if (count <= 0) { showToast('No ' + def.name + ' in inventory!'); return; }
			berries[berryType] = count - 1;
			inv.berries = berries;
			try { (typeof Inventory !== 'undefined') && Inventory.save(inv); } catch(_) {}
			const buff = { type: berryType, expires: Date.now() + BUFF_DURATION_MS };
			try { localStorage.setItem(KEY, JSON.stringify(buff)); } catch(_) {}
			showToast(def.icon + ' ' + def.name + ' buff active! ' + def.desc);
			const modal = document.getElementById('berryBuffModal');
			if (modal) modal.hidden = true;
		}

		function open() {
			const modal = document.getElementById('berryBuffModal');
			if (!modal) return;
			modal.hidden = false;
			_renderModal(modal);
		}

		function _renderModal(modal) {
			const body = modal.querySelector('#berryBuffBody');
			if (!body) return;
			const active = getActive();
			const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
			const berries = inv.berries || {};
			body.innerHTML = '';
			if (active) {
				const def = BUFF_DEFS[active.type] || {};
				const mins = Math.ceil((active.expires - Date.now()) / 60000);
				const info = document.createElement('div');
				info.style.cssText = 'padding:10px;border:1px solid var(--pk-gold);border-radius:8px;margin-bottom:12px;font-size:7px;color:var(--pk-gold)';
				info.innerHTML = 'Active: ' + (def.icon || '') + ' <b>' + (def.name || active.type) + '</b><br><span style="color:var(--pk-muted)">Expires in ~' + mins + ' min</span>';
				body.appendChild(info);
			}
			Object.entries(BUFF_DEFS).forEach(([type, def]) => {
				const count = berries[type] || 0;
				const row = document.createElement('div');
				row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--pk-border);border-radius:8px;margin-bottom:6px';
				const ico2 = document.createElement('span');
				ico2.style.cssText = 'font-size:20px;flex-shrink:0';
				ico2.textContent = def.icon;
				const info2 = document.createElement('div');
				info2.style.flex = '1';
				info2.innerHTML = '<div style="font-size:8px;color:var(--pk-text)">' + def.name + ' <span style="color:var(--pk-muted)">×' + count + '</span></div><div style="font-size:6px;color:var(--pk-muted);margin-top:3px">' + def.desc + '</div>';
				const btn = document.createElement('button');
				btn.className = 'pk-btn pk-btn-xs pk-btn-gold';
				btn.textContent = 'Use';
				btn.disabled = count <= 0 || !!active;
				btn.addEventListener('click', () => { activateBuff(type); _renderModal(modal); });
				row.appendChild(ico2);
				row.appendChild(info2);
				row.appendChild(btn);
				body.appendChild(row);
			});
			if (!Object.values(berries).some(v => v > 0)) {
				const empty = document.createElement('div');
				empty.style.cssText = 'font-size:7px;color:var(--pk-muted);text-align:center;padding:16px 0';
				empty.textContent = 'No buff berries in inventory.';
				body.appendChild(empty);
			}
		}

		const _wire = () => {
			document.getElementById('berryBuffClose')?.addEventListener('click', () => {
				const m = document.getElementById('berryBuffModal');
				if (m) m.hidden = true;
			});
			document.getElementById('campBerryBuffBtn')?.addEventListener('click', () => open());
		};
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _wire); else _wire();

		return { open, activateBuff, getActive, BUFF_DEFS };
	})();
	window.CAMP_SYSTEMS.BerryBuffs = BerryBuffs;

	// ── CampUpgrades (Facility Upgrades — replaces cosmetic-only version) ─────
	const FacilityUpgrades = (() => {
		const KEY = 'pokequiz_upgrades';
		const FACILITIES = {
			fishing: {
				name: 'Fishing Dock',
				icon: '🎣',
				levels: [
					{ label: 'Basic Dock',    cost: 0,   desc: 'Standard fishing — common Pokémon.' },
					{ label: 'Better Dock',   cost: 150, desc: '+Rare Pokémon chance when fishing.' },
					{ label: 'Premium Dock',  cost: 400, desc: 'Legendary encounters possible!' },
				],
			},
			garden: {
				name: 'Garden Plot',
				icon: '🌱',
				levels: [
					{ label: 'Small Plot',    cost: 0,   desc: '4 berry slots available.' },
					{ label: 'Large Plot',    cost: 100, desc: '8 berry slots (2× capacity).' },
					{ label: 'Expert Plot',   cost: 300, desc: 'Berries grow 50% faster.' },
				],
			},
			campfire: {
				name: 'Campfire',
				icon: '🔥',
				levels: [
					{ label: 'Small Fire',    cost: 0,   desc: 'Standard curry — normal quality.' },
					{ label: 'Warm Fire',     cost: 80,  desc: 'Curry gives +5 bonus friendship.' },
					{ label: 'Roaring Fire',  cost: 250, desc: 'Campfire stories reward 10 tokens.' },
				],
			},
		};

		function _load() { try { return JSON.parse(localStorage.getItem(KEY) || '{"fishing":0,"garden":0,"campfire":0}'); } catch { return { fishing: 0, garden: 0, campfire: 0 }; } }
		function _save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(_) {} }

		function getLevel(facility) { return _load()[facility] || 0; }

		function canUpgrade(facility) {
			const data = _load();
			const lvl = data[facility] || 0;
			const fac = FACILITIES[facility];
			if (!fac) return false;
			if (lvl >= fac.levels.length - 1) return false;
			const nextCost = fac.levels[lvl + 1].cost;
			const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
			return (inv.tokens || 0) >= nextCost;
		}

		function upgrade(facility) {
			const data = _load();
			const lvl = data[facility] || 0;
			const fac = FACILITIES[facility];
			if (!fac) return;
			if (lvl >= fac.levels.length - 1) { showToast('Already max level!'); return; }
			const nextLevel = fac.levels[lvl + 1];
			const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
			if ((inv.tokens || 0) < nextLevel.cost) { showToast('Not enough tokens!'); return; }
			inv.tokens = (inv.tokens || 0) - nextLevel.cost;
			try { (typeof Inventory !== 'undefined') && Inventory.save(inv); } catch(_) {}
			data[facility] = lvl + 1;
			_save(data);
			showToast('🔨 ' + fac.name + ' upgraded to ' + nextLevel.label + '!');
			(typeof NotifFeed !== 'undefined') && NotifFeed.push(fac.name + ' upgraded! ' + nextLevel.desc, 'hammer');
			const panel = document.getElementById('upgradePanel');
			if (panel && !panel.hidden) _renderPanel(panel);
		}

		function open() {
			const panel = document.getElementById('upgradePanel');
			if (!panel) return;
			panel.hidden = false;
			_renderPanel(panel);
		}

		function _renderPanel(panel) {
			const body = panel.querySelector('#upgradePanelBody');
			if (!body) return;
			const data = _load();
			const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
			const tokens = inv.tokens || 0;
			body.innerHTML = '<div style="font-size:7px;color:var(--pk-muted);margin-bottom:12px">Tokens: <span style="color:var(--pk-gold)">' + tokens + '</span></div>';
			Object.entries(FACILITIES).forEach(([key, fac]) => {
				const lvl = data[key] || 0;
				const isMax = lvl >= fac.levels.length - 1;
				const current = fac.levels[lvl];
				const next = fac.levels[lvl + 1];
				const card = document.createElement('div');
				card.style.cssText = 'border:1px solid var(--pk-border);border-radius:10px;padding:12px;margin-bottom:10px';
				const canUp = !isMax && tokens >= (next ? next.cost : Infinity);
				card.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:18px">' + fac.icon + '</span><div style="flex:1"><div style="font-size:9px;color:var(--pk-gold)">' + fac.name + '</div><div style="font-size:7px;color:var(--pk-muted)">Level ' + (lvl + 1) + ' — ' + current.label + '</div></div></div>' +
					'<div style="font-size:7px;color:var(--pk-text);margin-bottom:10px">' + current.desc + '</div>' +
					(isMax ? '<div style="font-size:7px;color:#50dd88">✓ Max Level</div>' :
						'<div style="font-size:7px;color:var(--pk-muted);margin-bottom:8px">Next: ' + next.label + ' — ' + next.desc + '</div>');
				if (!isMax) {
					const btn = document.createElement('button');
					btn.className = 'pk-btn pk-btn-sm ' + (canUp ? 'pk-btn-gold' : 'pk-btn-dark');
					btn.textContent = 'Upgrade (' + next.cost + ' tokens)';
					btn.disabled = !canUp;
					btn.addEventListener('click', () => upgrade(key));
					card.appendChild(btn);
				}
				body.appendChild(card);
			});
		}

		const _wire = () => {
			document.getElementById('upgradeClose')?.addEventListener('click', () => {
				const p = document.getElementById('upgradePanel');
				if (p) p.hidden = true;
			});
			document.getElementById('campUpgradeBtn')?.addEventListener('click', () => open());
		};
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _wire); else _wire();

		return { open, getLevel, canUpgrade, upgrade, FACILITIES };
	})();
	window.CAMP_SYSTEMS.CampUpgrades = FacilityUpgrades;

	// ── Expeditions ────────────────────────────────────────────────────────────
	const Expeditions = (() => {
		const KEY = 'pokequiz_expedition';
		const TYPES = {
			short: {
				label: 'Short Trip',
				duration: 60 * 60 * 1000,
				cost: 20,
				icon: '🥾',
				rewardDesc: '2-3 berries + 10 tokens',
				reward: () => {
					const count = 2 + Math.floor(Math.random() * 2);
					const berryTypes = ['sitrus', 'oran', 'leppa', 'pecha', 'rawst', 'chesto'];
					const berries = {};
					for (let i = 0; i < count; i++) {
						const b = berryTypes[Math.floor(Math.random() * berryTypes.length)];
						berries[b] = (berries[b] || 0) + 1;
					}
					return { tokens: 10, berries };
				},
			},
			long: {
				label: 'Long Expedition',
				duration: 4 * 60 * 60 * 1000,
				cost: 50,
				icon: '🏕️',
				rewardDesc: 'Rare item + 2-5 seeds + 30 tokens',
				reward: () => {
					const seedCount = 2 + Math.floor(Math.random() * 4);
					const seeds = {};
					const seedTypes = ['sitrus', 'oran', 'leppa', 'pecha'];
					for (let i = 0; i < seedCount; i++) {
						const s = seedTypes[Math.floor(Math.random() * seedTypes.length)];
						seeds[s] = (seeds[s] || 0) + 1;
					}
					return { tokens: 30, seeds, rareItem: 'Rare Feather' };
				},
			},
			epic: {
				label: 'Epic Adventure',
				duration: 8 * 60 * 60 * 1000,
				cost: 100,
				icon: '⚔️',
				rewardDesc: 'Guaranteed shiny + 5 seeds + 100 tokens',
				reward: () => {
					const seeds = { sitrus: 2, oran: 2, leppa: 1 };
					return { tokens: 100, seeds, shinyEncounter: true };
				},
			},
		};

		function _load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } }
		function _save(d) { try { d ? localStorage.setItem(KEY, JSON.stringify(d)) : localStorage.removeItem(KEY); } catch(_) {} }

		function getActive() { return _load(); }

		function isComplete() {
			const exp = _load();
			if (!exp) return false;
			return Date.now() >= exp.startTime + (TYPES[exp.type] ? TYPES[exp.type].duration : 0);
		}

		function check() {
			const exp = _load();
			if (!exp) return;
			if (!isComplete()) {
				_updatePartnerBadge(true, exp);
				return;
			}
			const typeDef = TYPES[exp.type];
			const rewards = typeDef ? typeDef.reward() : { tokens: 0 };
			_giveRewards(rewards, exp);
			_save(null);
			_updatePartnerBadge(false);
			_showRewardModal(rewards, exp);
		}

		function _giveRewards(rewards, exp) {
			try {
				const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
				inv.tokens = (inv.tokens || 0) + (rewards.tokens || 0);
				if (rewards.berries) {
					inv.berries = inv.berries || {};
					Object.entries(rewards.berries).forEach(([k, v]) => { inv.berries[k] = (inv.berries[k] || 0) + v; });
				}
				if (rewards.seeds) {
					inv.seeds = inv.seeds || {};
					Object.entries(rewards.seeds).forEach(([k, v]) => { inv.seeds[k] = (inv.seeds[k] || 0) + v; });
				}
				(typeof Inventory !== 'undefined') && Inventory.save(inv);
				if (rewards.shinyEncounter && typeof ShinyEncounters !== 'undefined') {
					setTimeout(() => ShinyEncounters.trigger(), 2000);
				}
			} catch(_) {}
		}

		function _showRewardModal(rewards, exp) {
			const overlay = document.createElement('div');
			overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center';
			const typeDef = TYPES[exp.type] || {};
			let rewardText = '+' + (rewards.tokens || 0) + ' tokens';
			if (rewards.berries) rewardText += ', berries: ' + Object.entries(rewards.berries).map(([k,v])=>v+'× '+k).join(', ');
			if (rewards.seeds)   rewardText += ', seeds: ' + Object.entries(rewards.seeds).map(([k,v])=>v+'× '+k).join(', ');
			if (rewards.rareItem) rewardText += ', ' + rewards.rareItem;
			if (rewards.shinyEncounter) rewardText += ', ✨ Shiny Encounter!';
			overlay.innerHTML = '<div style="background:var(--pk-bg,#0a1220);border:2px solid var(--pk-gold,#f6c84c);border-radius:12px;padding:24px 28px;max-width:340px;font-family:\'Press Start 2P\',monospace;text-align:center"><div style="font-size:24px;margin-bottom:12px">' + (typeDef.icon||'🎒') + '</div><div style="font-size:9px;color:var(--pk-gold,#f6c84c);margin-bottom:10px">' + (exp.partnerName||'Your partner') + ' returned!</div><div style="font-size:7px;color:#c8d8f0;margin-bottom:16px">' + rewardText + '</div><button id="_expDismiss" class="pk-btn pk-btn-gold pk-btn-sm">Collect Rewards!</button></div>';
			document.body.appendChild(overlay);
			overlay.querySelector('#_expDismiss')?.addEventListener('click', () => overlay.remove());
			showToast((typeDef.icon||'') + ' ' + (exp.partnerName||'Partner') + ' returned from expedition!');
		}

		function _updatePartnerBadge(away, exp) {
			try {
				const sprite = document.getElementById('campPartnerSprite') || document.getElementById('cpPortrait');
				const badge = document.getElementById('expeditionAwayBadge');
				if (badge) badge.hidden = !away;
				if (sprite) sprite.style.opacity = away ? '0.3' : '1';
				if (away && exp) {
					const remaining = Math.max(0, Math.ceil((exp.startTime + (TYPES[exp.type]?.duration || 0) - Date.now()) / 60000));
					if (badge) badge.textContent = '✈️ Away! ~' + remaining + 'min';
				}
			} catch(_) {}
		}

		function start(type) {
			if (_load()) { showToast('Partner is already on an expedition!'); return; }
			const typeDef = TYPES[type];
			if (!typeDef) return;
			const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
			if ((inv.tokens || 0) < typeDef.cost) { showToast('Not enough tokens!'); return; }
			inv.tokens = (inv.tokens || 0) - typeDef.cost;
			try { (typeof Inventory !== 'undefined') && Inventory.save(inv); } catch(_) {}
			const partnerName = inv.partnerNickname || inv.eeveeForm || 'Partner';
			_save({ type, startTime: Date.now(), partnerName, rewards: null });
			_updatePartnerBadge(true, _load());
			showToast(typeDef.icon + ' ' + partnerName + ' has left on a ' + typeDef.label + '!');
			const panel = document.getElementById('expeditionPanel');
			if (panel) panel.hidden = true;
		}

		function cancel() {
			const exp = _load();
			if (!exp) { showToast('No active expedition.'); return; }
			_save(null);
			_updatePartnerBadge(false);
			showToast('Expedition cancelled. No rewards.');
		}

		function open() {
			const panel = document.getElementById('expeditionPanel');
			if (!panel) return;
			panel.hidden = false;
			_renderPanel(panel);
		}

		function _renderPanel(panel) {
			const body = panel.querySelector('#expeditionPanelBody');
			if (!body) return;
			const exp = _load();
			const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
			const tokens = inv.tokens || 0;
			body.innerHTML = '';
			// Check tier gate
			const tier = (typeof CampTier !== 'undefined') ? CampTier.getTier() : 5;
			if (tier < 4) {
				body.innerHTML = '<div style="font-size:7px;color:var(--pk-muted);text-align:center;padding:20px">Reach Camp Tier 4 (4★) to unlock Expeditions!</div>';
				return;
			}
			if (exp) {
				const typeDef = TYPES[exp.type] || {};
				const endTime = exp.startTime + (typeDef.duration || 0);
				const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 60000));
				const done = Date.now() >= endTime;
				body.innerHTML = '<div style="border:1px solid var(--pk-gold);border-radius:10px;padding:14px;text-align:center"><div style="font-size:22px;margin-bottom:8px">' + (typeDef.icon||'') + '</div><div style="font-size:8px;color:var(--pk-gold);margin-bottom:6px">' + exp.partnerName + ' is away!</div><div style="font-size:7px;color:var(--pk-muted);margin-bottom:12px">' + typeDef.label + (done ? ' — <span style="color:#50dd88">READY!</span>' : ' — ~' + remaining + ' min left') + '</div>' +
					(done ? '<button id="_expCollectBtn" class="pk-btn pk-btn-gold pk-btn-sm" style="width:100%">Collect Rewards!</button>' : '<button id="_expCancelBtn" class="pk-btn pk-btn-dark pk-btn-sm" style="width:100%">Cancel (no reward)</button>') + '</div>';
				body.querySelector('#_expCollectBtn')?.addEventListener('click', () => { check(); panel.hidden = true; });
				body.querySelector('#_expCancelBtn')?.addEventListener('click', () => { if (confirm('Cancel the expedition? No rewards will be given.')) { cancel(); _renderPanel(panel); } });
				return;
			}
			body.innerHTML = '<div style="font-size:7px;color:var(--pk-muted);margin-bottom:14px">Tokens: <span style="color:var(--pk-gold)">' + tokens + '</span></div>';
			Object.entries(TYPES).forEach(([typeKey, typeDef]) => {
				const canStart = tokens >= typeDef.cost;
				const durationH = typeDef.duration / 3600000;
				const durationLabel = durationH < 1 ? (typeDef.duration / 60000) + 'min' : durationH + 'h';
				const card = document.createElement('div');
				card.style.cssText = 'border:1px solid var(--pk-border);border-radius:10px;padding:12px;margin-bottom:10px';
				card.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:20px">' + typeDef.icon + '</span><div style="flex:1"><div style="font-size:9px;color:var(--pk-gold)">' + typeDef.label + '</div><div style="font-size:7px;color:var(--pk-muted)">Duration: ' + durationLabel + ' · Cost: ' + typeDef.cost + ' tokens</div></div></div><div style="font-size:7px;color:var(--pk-text);margin-bottom:10px">Rewards: ' + typeDef.rewardDesc + '</div>';
				const btn = document.createElement('button');
				btn.className = 'pk-btn pk-btn-sm ' + (canStart ? 'pk-btn-gold' : 'pk-btn-dark');
				btn.textContent = canStart ? 'Send Partner!' : 'Not enough tokens';
				btn.disabled = !canStart;
				btn.addEventListener('click', () => { start(typeKey); _renderPanel(panel); });
				card.appendChild(btn);
				body.appendChild(card);
			});
		}

		const _wire = () => {
			document.getElementById('expeditionClose')?.addEventListener('click', () => {
				const p = document.getElementById('expeditionPanel');
				if (p) p.hidden = true;
			});
			document.getElementById('campExpeditionBtn')?.addEventListener('click', () => open());
		};
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _wire); else _wire();

		return { start, check, getActive, cancel, open, TYPES };
	})();
	window.CAMP_SYSTEMS.Expeditions = Expeditions;

	// ── CampStoryArc ───────────────────────────────────────────────────────────
	const CampStoryArc = (() => {
		const KEY_DAY  = 'pokequiz_story_day';
		const KEY_DATE = 'pokequiz_story_last_date';
		const KEY_ARC  = 'pokequiz_story_arc';

		const ARCS = [
			[
				{ text: 'A letter from Prof. Oak arrives at camp…',                      tokens: 20, berries: 1 },
				{ text: 'A mysterious trainer is spotted near the south gate.',           tokens: 25, berries: 1 },
				{ text: 'Strange Pokémon footprints appear by the pond.',                tokens: 20, berries: 2 },
				{ text: 'The camp visitor leaves a package at the campfire.',            tokens: 30, berries: 2 },
				{ text: 'A legendary Pokémon silhouette is seen at dusk.',               tokens: 35, berries: 2 },
				{ text: 'The mysterious trainer challenges you to a quiz battle!',       tokens: 40, berries: 3 },
				{ text: 'The arc concludes — your camp earns a special story badge! 🏅', tokens: 100, berries: 5 },
			],
			[
				{ text: 'A flock of Wingull delivers mysterious packages to camp.',      tokens: 20, berries: 1 },
				{ text: 'Strange blue flames flicker at the forest edge at midnight.',   tokens: 25, berries: 1 },
				{ text: 'A Pokémon egg appears on your doorstep with no note.',          tokens: 20, berries: 2 },
				{ text: 'Prof. Birch radios in with urgent news about a rare Pokémon.',  tokens: 30, berries: 2 },
				{ text: 'The sky turns an unusual color — Rayquaza was spotted nearby.', tokens: 35, berries: 2 },
				{ text: 'An ancient stone tablet is unearthed near the dig site.',       tokens: 40, berries: 3 },
				{ text: 'Arc 2 complete — legend becomes reality at your camp! 🏆',      tokens: 100, berries: 5 },
			],
		];

		function _today() { return new Date().toISOString().slice(0, 10); }
		function _loadDay()  { try { return parseInt(localStorage.getItem(KEY_DAY)  || '1', 10); } catch { return 1; } }
		function _loadDate() { try { return localStorage.getItem(KEY_DATE) || ''; } catch { return ''; } }
		function _loadArc()  { try { return parseInt(localStorage.getItem(KEY_ARC)  || '0', 10); } catch { return 0; } }

		function getCurrentDay() { return _loadDay(); }

		function getStoryText(day) {
			const arc = _loadArc() % ARCS.length;
			const d = (day || _loadDay()) - 1;
			return (ARCS[arc][d] || ARCS[0][0]).text;
		}

		function check() {
			const today = _today();
			const lastDate = _loadDate();
			if (lastDate === today) return;
			let day = _loadDay();
			let arc = _loadArc();
			const storyEntry = (ARCS[arc % ARCS.length] || ARCS[0])[day - 1] || ARCS[0][0];
			try {
				localStorage.setItem(KEY_DATE, today);
				const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
				inv.tokens = (inv.tokens || 0) + (storyEntry.tokens || 0);
				const berries = inv.berries || {};
				berries.sitrus = (berries.sitrus || 0) + (storyEntry.berries || 0);
				inv.berries = berries;
				(typeof Inventory !== 'undefined') && Inventory.save(inv);
			} catch(_) {}
			setTimeout(() => {
				showToast('📖 Story Day ' + day + ': ' + storyEntry.text);
				(typeof NotifFeed !== 'undefined') && NotifFeed.push('Story Day ' + day + ': ' + storyEntry.text, 'book-fill');
			}, 1200);
			if (day >= 7) {
				arc++;
				day = 1;
				try { localStorage.setItem(KEY_ARC, String(arc)); } catch(_) {}
			} else {
				day++;
			}
			try { localStorage.setItem(KEY_DAY, String(day)); } catch(_) {}
		}

		return { check, getCurrentDay, getStoryText };
	})();
	window.CAMP_SYSTEMS.CampStoryArc = CampStoryArc;

	// ── TypeMastery ────────────────────────────────────────────────────────────
	const TypeMastery = (() => {
		const KEY   = 'pokequiz_type_mastery';
		const DELTA = 'pokequiz_type_mastery_delta';
		const TYPES = ['normal','fire','water','grass','electric','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];
		const THRESHOLDS = { bronze: 10, silver: 25, gold: 50, platinum: 100 };
		const COLORS = { bronze: '#cd7f32', silver: '#a8a9ad', gold: '#f6c84c', platinum: '#e5e4e2' };

		function _load() {
			try {
				const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
				const out = {};
				TYPES.forEach(t => { out[t] = raw[t] || 0; });
				return out;
			} catch { return Object.fromEntries(TYPES.map(t => [t, 0])); }
		}
		function _save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(_) {} }

		function getLevel(type) {
			const count = (_load()[type] || 0);
			if (count >= THRESHOLDS.platinum) return 'platinum';
			if (count >= THRESHOLDS.gold)     return 'gold';
			if (count >= THRESHOLDS.silver)   return 'silver';
			if (count >= THRESHOLDS.bronze)   return 'bronze';
			return 'none';
		}

		function getTotal() { return Object.values(_load()).reduce((a, b) => a + b, 0); }

		function addCorrect(type, count) {
			if (!TYPES.includes(type)) return;
			const data = _load();
			const prev = data[type] || 0;
			const prevLevel = getLevel(type);
			data[type] = prev + (count || 1);
			_save(data);
			const newLevel = getLevel(type);
			if (newLevel !== prevLevel && newLevel !== 'none') {
				setTimeout(() => {
					showToast('🏅 ' + type.charAt(0).toUpperCase() + type.slice(1) + ' type: ' + newLevel.charAt(0).toUpperCase() + newLevel.slice(1) + ' mastery!');
					(typeof NotifFeed !== 'undefined') && NotifFeed.push(type + ' Type Mastery: ' + newLevel, 'patch-check-fill');
				}, 500);
			}
		}

		function _absorbDelta() {
			try {
				const raw = localStorage.getItem(DELTA);
				if (!raw) return;
				const delta = JSON.parse(raw);
				localStorage.removeItem(DELTA);
				Object.entries(delta).forEach(([type, count]) => addCorrect(type, count));
			} catch(_) {}
		}

		function open() {
			_absorbDelta();
			const panel = document.getElementById('typeMasteryPanel');
			if (!panel) return;
			panel.hidden = false;
			_renderPanel(panel);
		}

		function _renderPanel(panel) {
			const body = panel.querySelector('#typeMasteryBody');
			if (!body) return;
			const data = _load();
			const total = getTotal();
			body.innerHTML = '<div style="font-size:7px;color:var(--pk-muted);margin-bottom:14px">Total Mastery Score: <span style="color:var(--pk-gold)">' + total + '</span></div>';
			TYPES.forEach(type => {
				const count = data[type] || 0;
				const lvl = getLevel(type);
				const color = COLORS[lvl] || 'rgba(255,255,255,0.2)';
				const nextThresh = lvl === 'none' ? THRESHOLDS.bronze : lvl === 'bronze' ? THRESHOLDS.silver : lvl === 'silver' ? THRESHOLDS.gold : lvl === 'gold' ? THRESHOLDS.platinum : THRESHOLDS.platinum;
				const pct = Math.min(100, Math.round((count / nextThresh) * 100));
				const badge = lvl !== 'none' ? '<span style="font-size:6px;color:' + color + ';margin-left:6px">[' + lvl.toUpperCase() + ']</span>' : '';
				const row = document.createElement('div');
				row.style.cssText = 'margin-bottom:8px';
				row.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px"><span style="font-size:7px;color:var(--pk-text)">' + type.charAt(0).toUpperCase() + type.slice(1) + badge + '</span><span style="font-size:6px;color:var(--pk-muted)">' + count + ' / ' + nextThresh + '</span></div><div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden"><div style="width:' + pct + '%;height:100%;background:' + color + ';border-radius:3px;transition:width 0.3s"></div></div>';
				body.appendChild(row);
			});
		}

		const _wire = () => {
			document.getElementById('typeMasteryClose')?.addEventListener('click', () => {
				const p = document.getElementById('typeMasteryPanel');
				if (p) p.hidden = true;
			});
			document.getElementById('campTypeMasteryBtn')?.addEventListener('click', () => open());
		};
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _wire); else _wire();

		// Also absorb delta on camp load
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _absorbDelta); else _absorbDelta();

		return { open, addCorrect, getLevel, getTotal, TYPES, THRESHOLDS };
	})();
	window.CAMP_SYSTEMS.TypeMastery = TypeMastery;

	// ── CampTier ───────────────────────────────────────────────────────────────
	const CampTier = (() => {
		const TIER_PERKS = [
			{ tier: 1, stars: 0,  label: 'Base Camp',       desc: 'Welcome to camp!' },
			{ tier: 2, stars: 1,  label: 'Growing Camp',    desc: 'Garden Lv2 now available.' },
			{ tier: 3, stars: 2,  label: 'Popular Camp',    desc: 'Two NPCs can visit simultaneously.' },
			{ tier: 4, stars: 3,  label: 'Advanced Camp',   desc: 'Expeditions system unlocked!' },
			{ tier: 5, stars: 4,  label: 'Legendary Camp',  desc: 'Prof. Oak visits with legendary hints.' },
		];

		function getTier() {
			try {
				const stars = typeof CampRating !== 'undefined' ? (CampRating.getStars ? CampRating.getStars() : CampRating.get?.().stars || 0) : 0;
				for (let i = TIER_PERKS.length - 1; i >= 0; i--) {
					if (stars >= TIER_PERKS[i].stars) return TIER_PERKS[i].tier;
				}
				return 1;
			} catch { return 1; }
		}

		function check() {
			const tier = getTier();
			_renderBadge(tier);
			return tier;
		}

		function getPerks() {
			const tier = getTier();
			return TIER_PERKS.filter(p => p.tier <= tier);
		}

		function _renderBadge(tier) {
			try {
				const badge = document.getElementById('campTierBadge');
				if (!badge) return;
				const info = TIER_PERKS[tier - 1] || TIER_PERKS[0];
				badge.textContent = '★'.repeat(tier) + ' ' + info.label;
				badge.title = info.desc;
				badge.hidden = false;
			} catch(_) {}
		}

		const _wire = () => { _renderBadge(getTier()); };
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _wire); else _wire();

		return { check, getTier, getPerks, TIER_PERKS };
	})();
	window.CAMP_SYSTEMS.CampTier = CampTier;

	// ── TrainerBattles ─────────────────────────────────────────────────────────
	const TrainerBattles = (() => {
		const KEY_WINS = 'pokequiz_battle_wins';
		const NPC_DATA = {
			Red:   { sprite: '🧢', taunt: '"..." — Red says nothing, but his stare says everything.' },
			Leaf:  { sprite: '🌿', taunt: '"Better luck next time, trainer!"' },
			Blue:  { sprite: '💙', taunt: '"Ha! You\'ll have to do WAY better than that!"' },
			May:   { sprite: '🎀', taunt: '"Keep practicing! You\'ll get there!"' },
			Lucas: { sprite: '📘', taunt: '"Interesting battle data. You need more training."' },
			Dawn:  { sprite: '💫', taunt: '"Don\'t give up! I believe in you!"' },
		};

		function getWins() { try { return parseInt(localStorage.getItem(KEY_WINS) || '0', 10); } catch { return 0; } }
		function _isBeaten(npc) { try { return localStorage.getItem('pokequiz_battle_' + npc + '_beaten') === '1'; } catch { return false; } }
		function _setBeaten(npc) { try { localStorage.setItem('pokequiz_battle_' + npc + '_beaten', '1'); } catch(_) {} }
		function _incWins() { try { localStorage.setItem(KEY_WINS, String(getWins() + 1)); } catch(_) {} }

		function _getQuestions(count) {
			try {
				const pool = (window.CAMP_DATA || {}).QUIZ_POOL || (window.CAMP_DATA || {}).quizPool || [];
				if (pool.length > 0) {
					const shuffled = [...pool].sort(() => Math.random() - 0.5);
					return shuffled.slice(0, count).map(q => ({
						question: q.question || q.q || 'What type is this Pokémon?',
						choices: q.choices || q.options || ['Fire', 'Water', 'Grass', 'Electric'],
						answer: q.answer || q.correct || 0,
					}));
				}
			} catch(_) {}
			// Fallback questions
			const FALLBACK = [
				{ question: 'What is Pikachu\'s primary type?', choices: ['Electric', 'Normal', 'Fire', 'Psychic'], answer: 0 },
				{ question: 'Which Pokémon evolves from Eevee using a Water Stone?', choices: ['Flareon', 'Vaporeon', 'Jolteon', 'Espeon'], answer: 1 },
				{ question: 'What type is Gengar?', choices: ['Dark', 'Psychic', 'Ghost', 'Poison'], answer: 2 },
				{ question: 'How many HP does a standard Potion restore?', choices: ['10', '20', '30', '50'], answer: 1 },
				{ question: 'What is Charizard\'s secondary type?', choices: ['Dragon', 'Flying', 'Fire', 'Normal'], answer: 1 },
				{ question: 'Which move has 100% accuracy and 40 base power for Normal type?', choices: ['Tackle', 'Scratch', 'Pound', 'Cut'], answer: 2 },
				{ question: 'What type is effective against Dragon?', choices: ['Fire', 'Ice', 'Water', 'Grass'], answer: 1 },
				{ question: 'Which Pokémon is known as the Flame Pokémon?', choices: ['Charmander', 'Vulpix', 'Growlithe', 'Magmar'], answer: 0 },
				{ question: 'What is the max base friendship value?', choices: ['100', '200', '255', '300'], answer: 2 },
				{ question: 'Which region is Johto located in?', choices: ['Kanto', 'Japan', 'Gold/Silver games', 'Hoenn'], answer: 2 },
			];
			const shuffled = [...FALLBACK].sort(() => Math.random() - 0.5);
			return shuffled.slice(0, count);
		}

		function startBattle(npcName) {
			const npc = NPC_DATA[npcName] || { sprite: '❓', taunt: '"Good try!"' };
			const questions = _getQuestions(5);
			let current = 0;
			let correct = 0;
			let timerInterval = null;
			let timeLeft = 8;

			const overlay = document.createElement('div');
			overlay.id = 'trainerBattleOverlay';
			overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:10000;display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P",monospace';

			function _render() {
				clearInterval(timerInterval);
				if (current >= questions.length) {
					_showResult();
					return;
				}
				const q = questions[current];
				timeLeft = 8;
				overlay.innerHTML = '<div style="background:var(--pk-bg,#0a1220);border:2px solid var(--pk-gold,#f6c84c);border-radius:12px;padding:24px;max-width:380px;width:95%;text-align:center">' +
					'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div style="font-size:20px">' + npc.sprite + '</div><div style="font-size:8px;color:var(--pk-gold)">' + npcName + '\'s Battle</div><div style="font-size:8px;color:var(--pk-muted)">' + (current + 1) + '/5 · ✓' + correct + '</div></div>' +
					'<div id="_bTimerBar" style="height:5px;background:var(--pk-gold,#f6c84c);border-radius:3px;margin-bottom:14px;transition:width 0.1s linear;width:100%"></div>' +
					'<div style="font-size:8px;color:#e8eaf0;margin-bottom:18px;min-height:40px">' + q.question + '</div>' +
					'<div id="_bChoices" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
					q.choices.map((c, i) => '<button class="pk-btn pk-btn-dark pk-btn-sm _bChoice" data-idx="' + i + '" style="font-size:7px">' + c + '</button>').join('') +
					'</div></div>';
				overlay.querySelectorAll('._bChoice').forEach(btn => {
					btn.addEventListener('click', () => {
						clearInterval(timerInterval);
						const idx = parseInt(btn.dataset.idx, 10);
						if (idx === q.answer) {
							correct++;
							btn.style.background = 'rgba(80,221,136,0.4)';
						} else {
							btn.style.background = 'rgba(221,80,80,0.4)';
							overlay.querySelectorAll('._bChoice')[q.answer].style.background = 'rgba(80,221,136,0.4)';
						}
						overlay.querySelectorAll('._bChoice').forEach(b => b.disabled = true);
						setTimeout(() => { current++; _render(); }, 700);
					});
				});
				// Timer
				const bar = overlay.querySelector('#_bTimerBar');
				timerInterval = setInterval(() => {
					timeLeft -= 0.1;
					if (bar) bar.style.width = Math.max(0, (timeLeft / 8) * 100) + '%';
					if (timeLeft <= 0) {
						clearInterval(timerInterval);
						overlay.querySelectorAll('._bChoice').forEach(b => b.disabled = true);
						if (bar) bar.style.background = '#dd5050';
						setTimeout(() => { current++; _render(); }, 700);
					}
				}, 100);
			}

			function _showResult() {
				clearInterval(timerInterval);
				const won = correct >= 3;
				if (won) {
					_incWins();
					_setBeaten(npcName);
					const inv = (typeof Inventory !== 'undefined') ? Inventory.load() : {};
					inv.tokens = (inv.tokens || 0) + 50;
					try { (typeof Inventory !== 'undefined') && Inventory.save(inv); } catch(_) {}
					(typeof Achievements !== 'undefined') && Achievements.unlock('battle_win');
				}
				overlay.innerHTML = '<div style="background:var(--pk-bg,#0a1220);border:2px solid ' + (won ? '#50dd88' : '#dd5050') + ';border-radius:12px;padding:28px;max-width:360px;width:95%;text-align:center">' +
					'<div style="font-size:28px;margin-bottom:12px">' + (won ? '🏆' : npc.sprite) + '</div>' +
					'<div style="font-size:9px;color:' + (won ? '#50dd88' : '#dd5050') + ';margin-bottom:10px">' + (won ? 'You Win!' : 'You Lose!') + '</div>' +
					'<div style="font-size:7px;color:#c8d8f0;margin-bottom:16px">' + (won ? 'Answered ' + correct + '/5 correctly!<br>+50 tokens earned!' : npc.taunt + '<br>Got ' + correct + '/5 correct.') + '</div>' +
					'<button id="_bClose" class="pk-btn pk-btn-gold pk-btn-sm">Close</button></div>';
				overlay.querySelector('#_bClose')?.addEventListener('click', () => overlay.remove());
			}

			document.body.appendChild(overlay);
			_render();
		}

		return { startBattle, getWins, NPC_DATA };
	})();
	window.CAMP_SYSTEMS.TrainerBattles = TrainerBattles;

	// ── CampTutorial ──────────────────────────────────────────────────────────
	const CampTutorial = (() => {
		const KEY = 'pokequiz_tutorial_v1';
		const STEPS = [
			'Use WASD or Arrow Keys to walk around camp.',
			'Press E near signs, NPCs, or objects to interact.',
			'Press P to open your partner Pokémon panel.',
			'Head south through the gate to reach the Market.',
			'Plant seeds in the garden and come back later to harvest!',
		];
		let overlay = null, step = 0;

		function show() {
			if (localStorage.getItem(KEY)) return;
			step = 0;
			if (!overlay) {
				overlay = document.createElement('div');
				overlay.id = 'campTutorialOverlay';
				overlay.style.cssText = 'position:fixed;inset:0;z-index:8500;display:flex;align-items:flex-end;justify-content:center;padding-bottom:80px;pointer-events:none;';
				document.body.appendChild(overlay);
			}
			_render();
		}

		function _render() {
			if (!overlay) return;
			overlay.innerHTML = '<div style="background:rgba(10,10,20,0.92);border:2px solid #ffcb05;border-radius:12px;padding:16px 22px;max-width:340px;width:90%;font-family:\'Press Start 2P\',monospace;font-size:8px;color:#fff;line-height:1.7;pointer-events:auto;text-align:center;">'
				+ '<div style="color:#ffcb05;margin-bottom:10px;">HOW TO PLAY (' + (step+1) + '/' + STEPS.length + ')</div>'
				+ '<div style="margin-bottom:14px;">' + STEPS[step] + '</div>'
				+ '<div style="display:flex;gap:8px;justify-content:center;">'
				+ '<button onclick="window.CAMP_SYSTEMS.CampTutorial.skip()" style="background:#333;color:#aaa;border:1px solid #555;border-radius:6px;padding:6px 12px;font-family:\'Press Start 2P\',monospace;font-size:7px;cursor:pointer;">Skip</button>'
				+ '<button onclick="window.CAMP_SYSTEMS.CampTutorial.next()" style="background:#ffcb05;color:#111;border:none;border-radius:6px;padding:6px 12px;font-family:\'Press Start 2P\',monospace;font-size:7px;cursor:pointer;">' + (step < STEPS.length - 1 ? 'Next >' : 'Done!') + '</button>'
				+ '</div></div>';
		}

		function next() {
			step++;
			if (step >= STEPS.length) {
				skip();
			} else {
				_render();
			}
		}

		function skip() {
			localStorage.setItem(KEY, '1');
			if (overlay) { overlay.remove(); overlay = null; }
		}

		return { show, next, skip };
	})();
	window.CAMP_SYSTEMS.CampTutorial = CampTutorial;

	// ── DexGroupRewards ──────────────────────────────────────────────────────
	// Handles group-completion rewards (Starters, Birds, Eeveelutions, etc.)
	// DexRewards (above) handles total-caught milestones.
	const DexGroupRewards = (() => {
		const KEY_SEEN = 'pokequiz_dex_seen';
		const KEY_CLAIMED = 'pokequiz_dex_rewards_claimed';

		const GROUPS = [
			{
				id: 'kanto_starters',
				label: 'Kanto Starters',
				dex: [1, 4, 7],
				tokens: 50,
				badge: 'Starter Fan'
			},
			{
				id: 'legendary_birds',
				label: 'Legendary Birds',
				dex: [144, 145, 146],
				tokens: 100,
				badge: 'Bird Keeper'
			},
			{
				id: 'eeveelutions',
				label: 'Eeveelutions',
				dex: [134, 135, 136, 196, 197, 470, 471, 700],
				tokens: 80,
				badge: 'Eevee Expert'
			},
			{
				id: 'kanto_starter_lines',
				label: 'Kanto Starter Lines',
				dex: [1, 2, 3, 4, 5, 6, 7, 8, 9],
				tokens: 75,
				badge: 'Kanto Champion'
			},
		];

		function _loadSeen() {
			try { return JSON.parse(localStorage.getItem(KEY_SEEN) || '[]'); } catch(e) { return []; }
		}

		function _loadClaimed() {
			try { return JSON.parse(localStorage.getItem(KEY_CLAIMED) || '[]'); } catch(e) { return []; }
		}

		function markSeen(dexNum) {
			const seen = _loadSeen();
			if (!seen.includes(dexNum)) {
				seen.push(dexNum);
				localStorage.setItem(KEY_SEEN, JSON.stringify(seen));
				_checkRewards();
			}
		}

		function _checkRewards() {
			const seen = _loadSeen();
			const claimed = _loadClaimed();
			GROUPS.forEach(g => {
				if (claimed.includes(g.id)) return;
				const complete = g.dex.every(n => seen.includes(n));
				if (!complete) return;
				claimed.push(g.id);
				localStorage.setItem(KEY_CLAIMED, JSON.stringify(claimed));
				// Grant tokens
				try {
					const inv = JSON.parse(localStorage.getItem('pokequiz_inventory') || '{}');
					inv.tokens = (inv.tokens || 0) + g.tokens;
					localStorage.setItem('pokequiz_inventory', JSON.stringify(inv));
				} catch(e) {}
				// Toast + achievement
				if (window.CAMP_SYSTEMS && window.CAMP_SYSTEMS.showToast) {
					window.CAMP_SYSTEMS.showToast('Dex Reward: ' + g.label + '! +' + g.tokens + ' tokens', 4000);
				}
				if (window.CAMP_SYSTEMS && window.CAMP_SYSTEMS.Achievements) {
					window.CAMP_SYSTEMS.Achievements.unlock(g.badge);
				}
			});
		}

		function getProgress() {
			const seen = _loadSeen();
			const claimed = _loadClaimed();
			return GROUPS.map(g => ({
				id: g.id,
				label: g.label,
				total: g.dex.length,
				seen: g.dex.filter(n => seen.includes(n)).length,
				claimed: claimed.includes(g.id),
				tokens: g.tokens,
			}));
		}

		function _seedPartner() {
			try {
				const pData = JSON.parse(localStorage.getItem('pokequiz_partner') || 'null');
				if (pData && pData.dex) markSeen(pData.dex);
			} catch(e) {}
		}

		// Seed on load
		_seedPartner();

		return { markSeen, getProgress, _checkRewards };
	})();
	window.CAMP_SYSTEMS.DexGroupRewards = DexGroupRewards;

	// ── Sound additions ────────────────────────────────────────────────────────
	(function(){
		const _s=window.CAMP_SYSTEMS.Sound;
		let _sCtx=null;
		function _ensure(){try{if(!_sCtx)_sCtx=new(window.AudioContext||window.webkitAudioContext)();if(_sCtx.state==='suspended')_sCtx.resume();}catch(e){_sCtx=null;}return _sCtx;}
		function _on(){return _s&&_s.isEnabled?.();}
		_s.footstep=function(){if(!_on())return;const c=_ensure();if(!c)return;const osc=c.createOscillator(),g=c.createGain();osc.connect(g).connect(c.destination);osc.frequency.value=220;osc.type='triangle';const t=c.currentTime;g.gain.setValueAtTime(0.05,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.015);osc.start(t);osc.stop(t+0.02);};
		_s.dig=function(){if(!_on())return;const c=_ensure();if(!c)return;const osc=c.createOscillator(),g=c.createGain();osc.connect(g).connect(c.destination);osc.frequency.value=80;osc.type='square';const t=c.currentTime;g.gain.setValueAtTime(0.08,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.12);osc.start(t);osc.stop(t+0.14);};
		_s.transition=function(){if(!_on())return;const c=_ensure();if(!c)return;const osc=c.createOscillator(),g=c.createGain();osc.connect(g).connect(c.destination);osc.type='sawtooth';const t=c.currentTime;osc.frequency.setValueAtTime(400,t);osc.frequency.exponentialRampToValueAtTime(100,t+0.2);g.gain.setValueAtTime(0.04,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.2);osc.start(t);osc.stop(t+0.22);};
		_s.villagerGreet=function(){if(!_on())return;const c=_ensure();if(!c)return;[523,659,784].forEach((freq,i)=>{const osc=c.createOscillator(),g=c.createGain();osc.connect(g).connect(c.destination);osc.frequency.value=freq;osc.type='triangle';const t=c.currentTime+i*0.08;g.gain.setValueAtTime(0.05,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.08);osc.start(t);osc.stop(t+0.1);});};
	})();

})();

