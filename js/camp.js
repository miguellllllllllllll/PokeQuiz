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
	const SeasonalRewards = (window.CAMP_SYSTEMS || {}).SeasonalRewards;
	const Achievements    = (window.CAMP_SYSTEMS || {}).Achievements;
	const TrainerLevel    = (window.CAMP_SYSTEMS || {}).TrainerLevel;
	const CampRating      = (window.CAMP_SYSTEMS || {}).CampRating;
	const PostcardSystem  = (window.CAMP_SYSTEMS || {}).PostcardSystem;
	const PhotoMode       = (window.CAMP_SYSTEMS || {}).PhotoMode;
	const ShinyEncounters = (window.CAMP_SYSTEMS || {}).ShinyEncounters;
	const Music                 = (window.CAMP_SYSTEMS || {}).Music;
	const AccessibilitySettings = (window.CAMP_SYSTEMS || {}).AccessibilitySettings;
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

	// ── Canvas click restores keyboard capture ────────────────────────────────────
	// When any overlay panel is closed by clicking its × button (a <button>, not an
	// <input>), no focusout fires on an INPUT/TEXTAREA, so enableGlobalCapture() is
	// never called and Phaser key interception stays disabled — freezing movement.
	// Listening for a click/pointerdown anywhere on the game canvas guarantees
	// capture is always restored the moment the player interacts with the world,
	// regardless of which panel was open or how it was dismissed.
	function restoreCaptureOnCanvasClick() {
		const wrap = document.getElementById('campWrap');
		if (!wrap) { setTimeout(restoreCaptureOnCanvasClick, 100); return; }
		wrap.addEventListener('pointerdown', () => {
			window.__CAMP_STATE?._sceneKeyboard?.enableGlobalCapture();
		});
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restoreCaptureOnCanvasClick);
	else restoreCaptureOnCanvasClick();

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
		SeasonalRewards.check();
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

	// ── Music Toggle ──────────────────────────────────────────────────────────────
	function syncMusicBtn(btn) {
		if (!btn) return;
		const on = Music?.isEnabled();
		btn.innerHTML = on
			? '<i class="bi bi-music-note-beamed"></i>'
			: '<i class="bi bi-music-note-beamed" style="opacity:.4"></i>';
		btn.title = on ? 'Music: On (click to mute)' : 'Music: Off (click to unmute)';
		btn.setAttribute('aria-label', on ? 'Mute music' : 'Unmute music');
	}
	function wireMusicBtn() {
		const btn = document.getElementById('campMusicBtn');
		if (!btn || !Music) return;
		syncMusicBtn(btn);
		btn.addEventListener('click', () => {
			Music.setEnabled(!Music.isEnabled());
			syncMusicBtn(btn);
		});
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireMusicBtn);
	else wireMusicBtn();

	// ── Incoming postcard from URL ────────────────────────────────────────────────
	if (document.readyState === 'loading')
		document.addEventListener('DOMContentLoaded', () => PostcardSystem?.receiveFromURL());
	else PostcardSystem?.receiveFromURL();

	// ── Guestbook button ──────────────────────────────────────────────────────
	function wireGuestbookBtn() {
		const Guestbook = (window.CAMP_SYSTEMS || {}).Guestbook;
		document.getElementById('campGuestbookBtn')?.addEventListener('click', () => {
			if (Guestbook) Guestbook.open();
		});
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireGuestbookBtn);
	else wireGuestbookBtn();

	// ── Journal button (Batch 3-3) ─────────────────────────────────────────────
	function wireJournalBtn() {
		document.getElementById('campJournalBtn')?.addEventListener('click', () => {
			const J = (window.CAMP_SYSTEMS || {}).Journal;
			if (J) J.open();
		});
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireJournalBtn);
	else wireJournalBtn();

	// ── Upgrades button (Batch 4-3) ────────────────────────────────────────────
	function wireUpgradeBtn() {
		document.getElementById('campUpgradeBtn')?.addEventListener('click', () => {
			const U = (window.CAMP_SYSTEMS || {}).CampUpgrades;
			if (U) U.open();
		});
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireUpgradeBtn);
	else wireUpgradeBtn();

	// ── Quick-slot bar click wiring (Batch 2-3) ────────────────────────────────
	function wireQuickSlots() {
		document.getElementById('campQuickBar')?.addEventListener('click', (e) => {
			const slot = e.target.closest('.cpQuickSlot');
			if (!slot) return;
			const idx = parseInt(slot.dataset.slot) - 1;
			const QS = (window.CAMP_SYSTEMS || {}).QuickSlotBar;
			if (QS) QS.useSlot(idx);
		});
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireQuickSlots);
	else wireQuickSlots();

	// ── Batch 5 buttons ────────────────────────────────────────────────────────
	function wireBatch5Buttons() {
		const CampShare     = (window.CAMP_SYSTEMS || {}).CampShare;
		const RivalSystem   = (window.CAMP_SYSTEMS || {}).RivalSystem;
		const FriendList    = (window.CAMP_SYSTEMS || {}).FriendList;
		const PhotoAlbum    = (window.CAMP_SYSTEMS || {}).PhotoAlbum;
		const WeeklyChallenge = (window.CAMP_SYSTEMS || {}).WeeklyChallenge;
		const NotifFeed     = (window.CAMP_SYSTEMS || {}).NotifFeed;
		const SaveSlots     = (window.CAMP_SYSTEMS || {}).SaveSlots;
		const SaveIO        = (window.CAMP_SYSTEMS || {}).SaveIO;
		const Prestige      = (window.CAMP_SYSTEMS || {}).Prestige;
		const TrainerTitles = (window.CAMP_SYSTEMS || {}).TrainerTitles;
		const OfflineProgress = (window.CAMP_SYSTEMS || {}).OfflineProgress;
		const PWAInstall    = (window.CAMP_SYSTEMS || {}).PWAInstall;

		// Share button
		document.getElementById('campShareBtn')?.addEventListener('click', () => {
			if (CampShare) CampShare.generate();
		});

		// Rival button
		document.getElementById('campRivalBtn')?.addEventListener('click', () => {
			if (RivalSystem) RivalSystem.challenge();
		});

		// Friends button
		document.getElementById('campFriendsBtn')?.addEventListener('click', () => {
			if (FriendList) FriendList.open();
		});

		// Photo album button
		document.getElementById('campAlbumBtn')?.addEventListener('click', () => {
			if (PhotoAlbum) PhotoAlbum.open();
		});

		// Weekly challenge button
		document.getElementById('campWeeklyBtn')?.addEventListener('click', () => {
			if (WeeklyChallenge) WeeklyChallenge.open();
		});

		// Notif button — replace with NotifFeed
		document.getElementById('campNotifBtn')?.addEventListener('click', () => {
			if (NotifFeed) NotifFeed.open();
		});

		// PWA install button
		document.getElementById('campInstallBtn')?.addEventListener('click', () => {
			if (PWAInstall) PWAInstall.prompt();
		});

		// Pause menu: Save Slots
		document.getElementById('campPauseSaveSlots')?.addEventListener('click', () => {
			const p = document.getElementById('campPause');
			if (p) p.hidden = true;
			if (SaveSlots) SaveSlots.open();
		});

		// Pause menu: Prestige / New Game+
		document.getElementById('campPausePrestige')?.addEventListener('click', () => {
			const p = document.getElementById('campPause');
			if (p) p.hidden = true;
			if (Prestige) Prestige.open();
		});

		// Pause menu: Export save
		document.getElementById('campPauseExport')?.addEventListener('click', () => {
			const p = document.getElementById('campPause');
			if (p) p.hidden = true;
			if (SaveIO) SaveIO.exportSave();
		});

		// Pause menu: Import save
		document.getElementById('campPauseImport')?.addEventListener('click', () => {
			const p = document.getElementById('campPause');
			if (p) p.hidden = true;
			document.getElementById('saveImportInput')?.click();
		});
		document.getElementById('saveImportInput')?.addEventListener('change', (e) => {
			const file = e.target.files?.[0];
			if (file && SaveIO) SaveIO.importSave(file);
			e.target.value = '';
		});

		// Auto-checks on load
		if (RivalSystem)    RivalSystem.autoCheck();
		if (WeeklyChallenge) WeeklyChallenge.checkProgress();
		if (TrainerTitles)  TrainerTitles.check();
		if (OfflineProgress) OfflineProgress.check();

		// Show install button if PWA prompt is available
		if (PWAInstall) PWAInstall.init();
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireBatch5Buttons);
	else wireBatch5Buttons();

	// ── Grouped HUD popups ────────────────────────────────────────────────────
	function wireGroupedHud() {
		// Group definitions — map group id → array of {btnId, icon, label}
		const GROUPS = {
			trainer:  [
				{ btnId: 'campTCBtn',      icon: 'bi-person-vcard-fill', label: 'Card',    isLink: true },
				{ btnId: 'campAchieveBtn', icon: 'bi-award-fill',        label: 'Achieve' },
			],
			records:  [
				{ btnId: 'campDexBtn',       icon: 'bi-book-fill',      label: 'Pokédex' },
				{ btnId: 'campJournalBtn',   icon: 'bi-book-half',      label: 'Journal' },
				{ btnId: 'campShinyBtn',     icon: 'bi-stars',          label: 'Shinies' },
				{ btnId: 'campAlbumBtn',     icon: 'bi-images',         label: 'Album' },
				{ btnId: 'campGuestbookBtn', icon: 'bi-journal-text',   label: 'Guests' },
			],
			camp:     [
				{ btnId: 'campMapBtn',     icon: 'bi-map-fill',       label: 'Map' },
				{ btnId: 'campUpgradeBtn', icon: 'bi-hammer',         label: 'Build' },
				{ btnId: 'campWeeklyBtn',  icon: 'bi-calendar-week',  label: 'Weekly' },
			],
			social:   [
				{ btnId: 'campFriendsBtn', icon: 'bi-people-fill',    label: 'Friends' },
				{ btnId: 'campRivalBtn',   icon: 'bi-trophy-fill',    label: 'Rival' },
				{ btnId: 'campShareBtn',   icon: 'bi-share-fill',     label: 'Share' },
				{ btnId: 'campPostcardBtn',icon: 'bi-envelope-fill',  label: 'Cards' },
			],
			settings: [
				{ btnId: 'campMusicBtn',   icon: 'bi-music-note-beamed', label: 'Music' },
				{ btnId: 'campPhotoBtn',   icon: 'bi-camera-fill',       label: 'Photo' },
			],
			notifs:   [] // opens feed directly — handled separately
		};

		// Lazily add optional buttons if they exist in the DOM
		const optionalBtns = {
			settings: [
				{ btnId: 'campSaveSlotsBtn', icon: 'bi-floppy-fill',    label: 'Saves' },
				{ btnId: 'campExportBtn',    icon: 'bi-download',       label: 'Export' },
				{ btnId: 'campInstallBtn',   icon: 'bi-phone-vibrate',  label: 'Install' },
			],
			trainer: [
				{ btnId: 'campPrestigeBtn',  icon: 'bi-star-fill',      label: 'Prestige' },
			]
		};
		for (const [grp, extras] of Object.entries(optionalBtns)) {
			for (const e of extras) {
				if (document.getElementById(e.btnId)) GROUPS[grp].push(e);
			}
		}

		// Create the shared popup element once — append to body to avoid overflow:hidden clip
		const popup = document.createElement('div');
		popup.id = 'campGrpPopup';
		popup.className = 'is-hidden';
		popup.setAttribute('aria-label', 'HUD submenu');
		document.body.appendChild(popup);
		const wrap = document.getElementById('campWrap');

		let activeGrp = null;

		function closePopup() {
			popup.classList.add('is-hidden');
			popup.innerHTML = '';
			if (activeGrp) {
				const btnId = 'grp' + activeGrp.charAt(0).toUpperCase() + activeGrp.slice(1);
				document.getElementById(btnId)?.classList.remove('is-active');
			}
			activeGrp = null;
		}

		function openPopup(grpId, anchorBtn) {
			if (activeGrp === grpId) { closePopup(); return; }
			closePopup();
			activeGrp = grpId;
			anchorBtn.classList.add('is-active');

			const items = GROUPS[grpId] || [];
			popup.innerHTML = '';
			for (const item of items) {
				const origBtn = document.getElementById(item.btnId);
				const btn = document.createElement('button');
				btn.className = 'cgp-btn';
				btn.type = 'button';
				btn.setAttribute('aria-label', item.label);
				btn.innerHTML = `<i class="bi ${item.icon}"></i><span class="cgp-label">${item.label}</span>`;
				btn.addEventListener('click', () => {
					if (origBtn) origBtn.click();
					closePopup();
				});
				popup.appendChild(btn);
			}

			// Position popup above the anchor button using viewport coords
			popup.classList.remove('is-hidden');
			const rect = anchorBtn.getBoundingClientRect();
			// Measure popup after making it visible to get correct dimensions
			popup.style.left = '0px';
			popup.style.top = '0px';
			const pW = popup.offsetWidth || 180;
			const pH = popup.offsetHeight || 120;
			let left = Math.max(4, rect.left);
			if (left + pW > window.innerWidth - 4) left = Math.max(4, window.innerWidth - pW - 4);
			const top = Math.max(4, rect.top - pH - 8);
			popup.style.left = left + 'px';
			popup.style.top = top + 'px';
			popup.style.bottom = 'auto';
		}

		// Wire group buttons
		for (const grpId of Object.keys(GROUPS)) {
			const btnId = 'grp' + grpId.charAt(0).toUpperCase() + grpId.slice(1);
			const btn = document.getElementById(btnId);
			if (!btn) continue;
			btn.addEventListener('click', (e) => {
				e.stopPropagation();
				if (grpId === 'notifs') {
					// Notifs opens feed directly
					(window.CAMP_SYSTEMS?.NotifFeed || window.CAMP_SYSTEMS?.Notifications)?.open?.();
					return;
				}
				openPopup(grpId, btn);
			});
		}

		// Wire hamburger toggle: on mobile → slide sheet; on desktop → max-width collapse
		const hamburger = document.getElementById('campBarToggle');
		if (hamburger) {
			hamburger.addEventListener('click', () => {
				const MBS = window.CAMP_SYSTEMS && window.CAMP_SYSTEMS.MobileBottomSheet;
				if (MBS && window.innerWidth <= 600) {
					MBS.toggle();
				}
				// Desktop collapse still handled by BtnBarToggle in camp-systems.js
			}, true); // capture phase so this fires before any stopPropagation
		}

		// Close popup on outside click or Escape
		document.addEventListener('click', (e) => {
			if (!popup.contains(e.target) && !e.target.closest('.camp-grp-btn')) closePopup();
		});
		document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireGroupedHud);
	else wireGroupedHud();

})();
