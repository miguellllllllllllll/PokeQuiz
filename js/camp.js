/**
 * camp.js — top-level wiring for the Pokémon Camp Phaser game.
 *
 * Depends on (in load order):
 *   camp-data.js    → window.CAMP_DATA.*   (pure static data)
 *   camp-systems.js → window.CAMP_SYSTEMS.* / window.CAMP_SCENES.* / window.__CAMP_STATE
 *
 * This file is intentionally thin: it pulls named exports from the two files
 * above, creates the Phaser.Game instance, and wires DOM buttons. All game
 * logic, scene classes, and helper functions live in camp-systems.js.
 */
(function () {
	'use strict';

	// ── Shared refs ───────────────────────────────────────────────────────────────
	const ico         = (window.CAMP_SYSTEMS || {}).ico;
	const ICO         = (window.CAMP_DATA    || {}).ICO;

	// ── Systems used directly in this file ───────────────────────────────────────
	const Dialog          = (window.CAMP_SYSTEMS || {}).Dialog;
	const Partner         = (window.CAMP_SYSTEMS || {}).Partner;
	const Mart            = (window.CAMP_SYSTEMS || {}).Mart;
	const RoomEditor      = (window.CAMP_SYSTEMS || {}).RoomEditor;
	const Pokedex         = (window.CAMP_SYSTEMS || {}).Pokedex;
	const PCBox           = (window.CAMP_SYSTEMS || {}).PCBox;
	const MysteryGift     = (window.CAMP_SYSTEMS || {}).MysteryGift;
	const Achievements    = (window.CAMP_SYSTEMS || {}).Achievements;
	const TrainerLevel    = (window.CAMP_SYSTEMS || {}).TrainerLevel;
	const CampRating      = (window.CAMP_SYSTEMS || {}).CampRating;
	const PostcardSystem  = (window.CAMP_SYSTEMS || {}).PostcardSystem;
	const PhotoMode       = (window.CAMP_SYSTEMS || {}).PhotoMode;
	const ShinyEncounters = (window.CAMP_SYSTEMS || {}).ShinyEncounters;
	const applyWrapTop    = (window.CAMP_SYSTEMS || {}).applyWrapTop;
	const readBootHash    = (window.CAMP_SYSTEMS || {}).readBootHash;
	const updateDayNightTint = (window.CAMP_SYSTEMS || {}).updateDayNightTint;
	const setupTouchPad   = (window.CAMP_SYSTEMS || {}).setupTouchPad;

	// ── Scene factories ───────────────────────────────────────────────────────────
	const makeSceneClass         = (window.CAMP_SCENES || {}).makeSceneClass;
	const makeHouseSceneClass    = (window.CAMP_SCENES || {}).makeHouseSceneClass;
	const makeUpstairsSceneClass = (window.CAMP_SCENES || {}).makeUpstairsSceneClass;
	const makeMarketSceneClass   = (window.CAMP_SCENES || {}).makeMarketSceneClass;

	// ── Universal ESC-to-close ────────────────────────────────────────────────────
	document.addEventListener('keydown', (e) => {
		if (e.key !== 'Escape') return;
		if (Dialog.isOpen())     { Dialog.close();     e.preventDefault(); return; }
		if (Partner.isOpen())    { Partner.close();    e.preventDefault(); return; }
		if (Mart.isOpen())       { Mart.close();       e.preventDefault(); return; }
		if (RoomEditor.isOpen()) { RoomEditor.close(); e.preventDefault(); return; }
		// (Battle/pause have their own Escape handling inside camp-systems.js.)
	});

	// ── Keyboard capture bridge ───────────────────────────────────────────────────
	// Phaser calls preventDefault() on every key registered via addKeys(), which
	// blocks typing those letters (W/A/S/D/E/P/F…) into HTML inputs. When any
	// <input>/<textarea> gains focus we release Phaser's capture; restore on blur.
	// __CAMP_STATE._sceneKeyboard is written by each scene's create() in camp-systems.js.
	document.addEventListener('focusin', (e) => {
		if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
			window.__CAMP_STATE?._sceneKeyboard?.disableGlobalCapture();
	});
	document.addEventListener('focusout', (e) => {
		if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
			window.__CAMP_STATE?._sceneKeyboard?.enableGlobalCapture();
	});

	// ── Debug HUD toggle ──────────────────────────────────────────────────────────
	// Debug object lives in camp-systems.js; backtick/F8 toggle it from here.
	document.addEventListener('keydown', (e) => {
		if (e.key === '`' || e.key === 'F8') {
			e.preventDefault();
			(window.CAMP_SYSTEMS || {}).Debug?.toggle();
		}
	});

	// ── Touch pad setup ───────────────────────────────────────────────────────────
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupTouchPad);
	else setupTouchPad();

	// ── Phaser game bootstrap ─────────────────────────────────────────────────────
	function start() {
		const wrap = document.getElementById('campWrap');
		if (!wrap) return;
		if (!window.Phaser) { setTimeout(start, 30); return; }

		applyWrapTop();
		window.addEventListener('resize', applyWrapTop);
		window.addEventListener('load', applyWrapTop);
		if (document.fonts && document.fonts.ready) document.fonts.ready.then(applyWrapTop);

		// Capture boot hash once, then clear the URL so a reload stays in place.
		// Scene init() calls consumeBootFrom() (in camp-systems.js) to read it once.
		window.__CAMP_STATE._bootData = readBootHash();
		const boot = window.__CAMP_STATE._bootData;

		const CampClass      = makeSceneClass();
		const HouseClass     = makeHouseSceneClass();
		const UpstairsClass  = makeUpstairsSceneClass();
		const MarketClass    = makeMarketSceneClass();

		let sceneList;
		if      (boot.scene === 'house')    sceneList = [HouseClass,    CampClass, UpstairsClass, MarketClass];
		else if (boot.scene === 'upstairs') sceneList = [UpstairsClass, CampClass, HouseClass,    MarketClass];
		else if (boot.scene === 'market')   sceneList = [MarketClass,   CampClass, HouseClass,    UpstairsClass];
		else                                sceneList = [CampClass,      HouseClass, UpstairsClass, MarketClass];

		new Phaser.Game({
			type: Phaser.AUTO,
			parent: 'campWrap',
			backgroundColor: '#68A028',
			pixelArt: true,
			roundPixels: true,
			scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
			physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
			scene: sceneList,
		});

		if (window.location.hash)
			history.replaceState(null, '', window.location.pathname + window.location.search);
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
	else start();

	// ── Day/night tint ────────────────────────────────────────────────────────────
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			updateDayNightTint(); setInterval(updateDayNightTint, 60000);
		});
	} else {
		updateDayNightTint();
		setInterval(updateDayNightTint, 60000);
	}

	// ── Button wiring (runs on DOMContentLoaded or immediately) ──────────────────
	function wireDOMButtons() {
		document.getElementById('campDexBtn')?.addEventListener('click', () => Pokedex.open());
		document.getElementById('cpPC')?.addEventListener('click', () => PCBox.open());
		document.getElementById('campPauseMystery')?.addEventListener('click', () => {
			const p = document.getElementById('campPause');
			if (p) p.hidden = true;
			MysteryGift.open();
		});
		MysteryGift.autoCheck();
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireDOMButtons);
	else wireDOMButtons();

	// ── Achievements panel ────────────────────────────────────────────────────────
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

					const icoEl = document.createElement('div');
					icoEl.className = 'pk-achieve-ico';
					icoEl.innerHTML = d.icoKey ? ico(ICO[d.icoKey] || d.icoKey) : ico('question-circle');

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

	// ── Postcard / Trainer Level / Camp Rating ────────────────────────────────────
	function wirePostcardBtn() {
		document.getElementById('campPostcardBtn')?.addEventListener('click', () => PostcardSystem.open());
		TrainerLevel.updateHUD();
		CampRating.displayOnGate();
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wirePostcardBtn);
	else wirePostcardBtn();

	// ── Photo Mode ────────────────────────────────────────────────────────────────
	function wirePhotoBtn() {
		document.getElementById('campPhotoBtn')?.addEventListener('click', () => {
			const scene = window.__campScene;
			if (scene) PhotoMode.take(scene);
		});
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wirePhotoBtn);
	else wirePhotoBtn();

	// ── Shiny Collection ──────────────────────────────────────────────────────────
	function wireShinyBtn() {
		document.getElementById('campShinyBtn')?.addEventListener('click', () => {
			ShinyEncounters.openCollection();
		});
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireShinyBtn);
	else wireShinyBtn();

})();
