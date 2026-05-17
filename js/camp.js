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
	const dexFromKey = (window.CAMP_SYSTEMS || {}).dexFromKey;
	// animPrefixFromKey(key) → string used as the animation/anim-key prefix.
	// All instances of the same species share one set of Phaser animations.
	const animPrefixFromKey = (window.CAMP_SYSTEMS || {}).animPrefixFromKey;
	// Shorthand: ico(ICO.seed) → '<i class="bi bi-seedling" …>'
	// Usage: inner.innerHTML = ico(ICO.book) + ' POKÉDEX';

	const TILE = (window.CAMP_DATA || {}).TILE;
	const MAP_W = (window.CAMP_DATA || {}).MAP_W;
	const MAP_H = (window.CAMP_DATA || {}).MAP_H;
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
	const EggSystem = (window.CAMP_SYSTEMS || {}).EggSystem;

	// ── Contests ──────────────────────────────────────────────────────────────────
	const Contests = (window.CAMP_SYSTEMS || {}).Contests;

	// ── Curry Cooking ─────────────────────────────────────────────────────────────
	const CurryCooking = (window.CAMP_SYSTEMS || {}).CurryCooking;

	// ── Pokémon Amie ───────────────────────────────────────────────────────────────
	const Amie = (window.CAMP_SYSTEMS || {}).Amie;

	// ── Wild-encounter battle system ─────────────────────────────────────────────
	// Self-contained DOM-overlay battle UI: shows a spinning wheel that picks one
	// of four minigames at random, runs that minigame, and reports the result via
	// the callback passed to Battle.start(). Wins award Friendship Berries.
	const Battle = (window.CAMP_SYSTEMS || {}).Battle;

	// ── Mart UI — Pikachu shopkeeper buys berries / sells seeds ──────────────────
	const Mart = (window.CAMP_SYSTEMS || {}).Mart;

	// ── Room Editor — upstairs room decoration panel ──────────────────────────
	const RoomEditor = (window.CAMP_SYSTEMS || {}).RoomEditor;

	// ── Partner Pokémon panel — dedicated page for the follower ─────────────────
	const Partner = (window.CAMP_SYSTEMS || {}).Partner;

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
	const GROW_MS = (window.CAMP_DATA || {}).GROW_MS;
	const getEffectiveGrowMs = (window.CAMP_SYSTEMS || {}).getEffectiveGrowMs;
	const SEED_PRICE = (window.CAMP_DATA || {}).SEED_PRICE;
	const BERRY_PRICE = (window.CAMP_DATA || {}).BERRY_PRICE;
	const BERRY_TYPES = (window.CAMP_DATA || {}).BERRY_TYPES;
	const SCYTHE_PRICE = (window.CAMP_DATA || {}).SCYTHE_PRICE;
	const SCYTHE_RADIUS = (window.CAMP_DATA || {}).SCYTHE_RADIUS;
	const STONE_PRICE = (window.CAMP_DATA || {}).STONE_PRICE;
	const FRIENDSHIP_PER_BERRY = (window.CAMP_DATA || {}).FRIENDSHIP_PER_BERRY;
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

	const getNpcDialog = (window.CAMP_SYSTEMS || {}).getNpcDialog;

	const NPCS = (window.CAMP_DATA || {}).NPCS;

	// ── Map ──────────────────────────────────────────────────────────────────────
	const buildMap = (window.CAMP_SYSTEMS || {}).buildMap;

	// ── Tile drawing — BW2 Gen 5, TILE=16 ───────────────────────────────────────
	const drawTile = (window.CAMP_SYSTEMS || {}).drawTile;

	// Applies the chosen accent colour as a CSS custom property on #campWrap
	// so the location badge, prompt border, and other chrome inherit it live.
	function applyCampAccent(accentKey) {
		const hex = ACCENT_HEX[accentKey] || ACCENT_HEX.default;
		const wrap = document.getElementById('campWrap');
		if (wrap) wrap.style.setProperty('--camp-accent', hex);
	}

	const applyWrapTop = (window.CAMP_SYSTEMS || {}).applyWrapTop;

	// ── Dialog UI (shared between scenes) ─────────────────────────────────────────
	const Dialog = (window.CAMP_SYSTEMS || {}).Dialog;

	// ── Touch action flags ────────────────────────────────────────────────────────
	// On-screen buttons set these; each scene's update() consumes them once so
	// they behave like a keyboard JustDown (fire once per tap, not every frame).
	const TouchActions = (window.CAMP_SYSTEMS || {}).TouchActions;

	// __CAMP_STATE.{_bootData,_pauseToggleFn,_sceneKeyboard} are the shared mutable
	// bridge between this IIFE and camp-systems.js. Initialised in camp-systems.js.

	// Phaser calls preventDefault() on every key registered via addKeys(), which
	// blocks typing those letters (W/A/S/D/E/P/F…) into HTML inputs.  When any
	// <input> or <textarea> gains focus we pause Phaser's global key capture so
	// the browser can deliver the characters normally; restore it on blur.
	document.addEventListener('focusin', (e) => {
		if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
			window.__CAMP_STATE?._sceneKeyboard?.disableGlobalCapture();
		}
	});
	document.addEventListener('focusout', (e) => {
		if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
			window.__CAMP_STATE?._sceneKeyboard?.enableGlobalCapture();
		}
	});

	// Wire on-screen action buttons → TouchActions flags.
	const setupTouchPad = (window.CAMP_SYSTEMS || {}).setupTouchPad;
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupTouchPad);
	else setupTouchPad();

	// ── Pause menu (shared) ───────────────────────────────────────────────────────
	const setupPauseMenu = (window.CAMP_SYSTEMS || {}).setupPauseMenu;

	// ── Mini-map palette — one swatch per tile type ───────────────────────────────
	const miniMapColor = (window.CAMP_SYSTEMS || {}).miniMapColor;

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
	const safeSceneStart = (window.CAMP_SYSTEMS || {}).safeSceneStart;

	// Read the hash on boot to figure out which scene to start. Captured once at
	// start() so we can clear the hash immediately and the result is still
	// available when each scene's init() runs on the first game step.
	const readBootHash = (window.CAMP_SYSTEMS || {}).readBootHash;
	const consumeBootFrom = (window.CAMP_SYSTEMS || {}).consumeBootFrom;

	// ── Day/night tint ────────────────────────────────────────────────────────────
	// Six-minute full cycle: 0..120s day, 120..180s sunset, 180..240s night,
	// 240..300s dawn, 300..360s back to day. Driven by performance.now mod cycle.
	const applyDayNight = (window.CAMP_SYSTEMS || {}).applyDayNight;

	const updateDayNightTint = (window.CAMP_SYSTEMS || {}).updateDayNightTint;

	// ── House interior map ───────────────────────────────────────────────────────
	// 16 wide × 12 tall — wainscot walls, wood floor, rug accent, exit door at south,
	// stairs tucked into the north-east corner.
	const HOUSE_W = 16;
	const HOUSE_H = 12;
	const HOUSE_DOOR_C = 8;
	const HOUSE_DOOR_R = HOUSE_H - 1;
	const buildHouseMap = (window.CAMP_SYSTEMS || {}).buildHouseMap;
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
	const buildUpstairsMap = (window.CAMP_SYSTEMS || {}).buildUpstairsMap;

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

	const getSeasonalItems = (window.CAMP_SYSTEMS || {}).getSeasonalItems;

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
	const buildMarketMap = (window.CAMP_SYSTEMS || {}).buildMarketMap;

	const Fishing = (window.CAMP_SYSTEMS || {}).Fishing;

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
	const NpcCampers = (window.CAMP_SYSTEMS || {}).NpcCampers;

	const DailyQuests = (window.CAMP_SYSTEMS || {}).DailyQuests;

	const WeatherSystem = (window.CAMP_SYSTEMS || {}).WeatherSystem;

	const getFurnitureBonuses = (window.CAMP_SYSTEMS || {}).getFurnitureBonuses;

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

	const ShinyEncounters = (window.CAMP_SYSTEMS || {}).ShinyEncounters;

	// ── Photo Mode ────────────────────────────────────────────────────────────────
	const PhotoMode = (window.CAMP_SYSTEMS || {}).PhotoMode;

	// ── Seasonal Camp Events ──────────────────────────────────────────────────────
	const SeasonalEvents = (window.CAMP_SYSTEMS || {}).SeasonalEvents;

	// ── Surf / movement helpers ───────────────────────────────────────────────────
	const canWalkOn = (window.CAMP_SYSTEMS || {}).canWalkOn;

	// ── Phaser Scenes ────────────────────────────────────────────────────────────
	const makeSceneClass = (window.CAMP_SCENES || {}).makeSceneClass;

	const makeHouseSceneClass = (window.CAMP_SCENES || {}).makeHouseSceneClass;

	const makeUpstairsSceneClass = (window.CAMP_SCENES || {}).makeUpstairsSceneClass;

	// ── Market vendor shop UI ────────────────────────────────────────────────────
	// Dynamic DOM panel (no HTML/CSS file edits needed) styled to match the
	// existing Mart aesthetic. Each vendor pulls its inventory from
	// MARKET_SHOPS[shopKind]; transactions go through Inventory.load/save.
	const MarketShop = (window.CAMP_SYSTEMS || {}).MarketShop;

	const makeMarketSceneClass = (window.CAMP_SCENES || {}).makeMarketSceneClass;

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
		window.__CAMP_STATE._bootData = readBootHash();
		const boot = window.__CAMP_STATE._bootData;
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
	const MysteryGift = (window.CAMP_SYSTEMS || {}).MysteryGift;

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
	const MoveTutor = (window.CAMP_SYSTEMS || {}).MoveTutor;

	// ── Feature 4: Pokémon Encyclopedia ──────────────────────────────────────────
	const PokeEncyclopedia = (window.CAMP_SYSTEMS || {}).PokeEncyclopedia;

	// ── Feature 5: Notification Bell ──────────────────────────────────────────────
	const NotifBell = (window.CAMP_SYSTEMS || {}).NotifBell;

	// ── Feature 6: Berry Breeding ─────────────────────────────────────────────────
	const BerryBreeding = (window.CAMP_SYSTEMS || {}).BerryBreeding;

})();
