(function () {
	'use strict';

	// ── Item config ───────────────────────────────────────────────────────────

	const ITEMS = [
		{ key: 'tokens',          label: 'Tokens',            max: 100 },
		{ key: 'seeds',           label: 'Seeds',             max: 10  },
		{ key: 'pecha',           label: 'Pecha Berries',     max: 20  },
		{ key: 'oran',            label: 'Oran Berries',      max: 20  },
		{ key: 'sitrus',          label: 'Sitrus Berries',    max: 20  },
		{ key: 'friendshipBerries', label: 'Friendship Berries', max: 5 },
	];

	// ── Helpers ───────────────────────────────────────────────────────────────

	function escapeHtml(s) {
		return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
	}

	function getPlayerName() {
		try {
			return (sessionStorage.getItem('playerName') || localStorage.getItem('playerName') || '').trim();
		} catch { return ''; }
	}

	function getInventory() {
		try {
			return JSON.parse(localStorage.getItem('pokequiz_inventory') || '{}');
		} catch { return {}; }
	}

	function saveInventory(inv) {
		try { localStorage.setItem('pokequiz_inventory', JSON.stringify(inv)); } catch {}
	}

	function getItemQty(inv, itemKey) {
		const v = inv[itemKey];
		if (typeof v === 'number') return v;
		if (v && typeof v === 'object' && typeof v.qty === 'number') return v.qty;
		return 0;
	}

	function adjustItemQty(inv, itemKey, delta) {
		const cur = getItemQty(inv, itemKey);
		const next = Math.max(0, cur + delta);
		// preserve object shape if already object
		if (inv[itemKey] && typeof inv[itemKey] === 'object') {
			inv[itemKey] = Object.assign({}, inv[itemKey], { qty: next });
		} else {
			inv[itemKey] = next;
		}
	}

	function makeOfferId(ts, from) {
		try {
			return btoa(String(ts) + from).slice(0, 8);
		} catch {
			return Math.random().toString(36).slice(2, 10);
		}
	}

	function encodeOffer(payload) {
		try {
			return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
		} catch { return ''; }
	}

	function decodeOffer(b64) {
		try {
			return JSON.parse(decodeURIComponent(escape(atob(b64))));
		} catch { return null; }
	}

	function claimKey(id) { return 'pokequiz_claimed_' + id; }

	function isClaimed(id) {
		try { return !!localStorage.getItem(claimKey(id)); } catch { return false; }
	}

	function markClaimed(id) {
		try { localStorage.setItem(claimKey(id), '1'); } catch {}
	}

	function itemLabel(key) {
		const item = ITEMS.find((i) => i.key === key);
		return item ? item.label : key;
	}

	function showStatus(el, msg, type) {
		el.textContent = msg;
		el.className = 'trade-status trade-status--' + (type || 'info');
		el.hidden = false;
	}

	// ── Populate dropdowns ────────────────────────────────────────────────────

	function buildItemOptions() {
		return ITEMS.map((i) => `<option value="${i.key}">${escapeHtml(i.label)}</option>`).join('');
	}

	// ── Render Make-an-Offer panel ────────────────────────────────────────────

	function initMakeOffer() {
		const offerItemSel = document.getElementById('offerItem');
		const offerQtyInput = document.getElementById('offerQty');
		const wantItemSel = document.getElementById('wantItem');
		const wantQtyInput = document.getElementById('wantQty');
		const generateBtn = document.getElementById('generateBtn');
		const linkOut = document.getElementById('linkOut');
		const linkStatus = document.getElementById('linkStatus');

		if (!offerItemSel) return;

		const opts = buildItemOptions();
		offerItemSel.innerHTML = opts;
		wantItemSel.innerHTML = opts;
		// Default want to second item so they differ
		if (wantItemSel.options.length > 1) wantItemSel.selectedIndex = 1;

		function updateQtyMax() {
			const item = ITEMS.find((i) => i.key === offerItemSel.value);
			offerQtyInput.max = item ? item.max : 100;
		}
		function updateWantMax() {
			const item = ITEMS.find((i) => i.key === wantItemSel.value);
			wantQtyInput.max = item ? item.max : 100;
		}

		offerItemSel.addEventListener('change', updateQtyMax);
		wantItemSel.addEventListener('change', updateWantMax);
		updateQtyMax();
		updateWantMax();

		generateBtn.addEventListener('click', () => {
			const fromName = getPlayerName() || 'Trainer';
			const giveItem = offerItemSel.value;
			const giveQty = Math.max(1, Math.min(Number(offerQtyInput.value) || 1, Number(offerQtyInput.max)));
			const wantItem = wantItemSel.value;
			const wantQty = Math.max(1, Math.min(Number(wantQtyInput.value) || 1, Number(wantQtyInput.max)));

			const ts = Date.now();
			const id = makeOfferId(ts, fromName);

			const payload = {
				from: fromName,
				give: { item: giveItem, qty: giveQty },
				want: { item: wantItem, qty: wantQty },
				id,
				ts,
			};

			const encoded = encodeOffer(payload);
			if (!encoded) {
				showStatus(linkStatus, 'Failed to encode offer.', 'error');
				return;
			}

			const url = window.location.origin + window.location.pathname + '?offer=' + encodeURIComponent(encoded);

			linkOut.href = url;
			linkOut.textContent = url.length > 72 ? url.slice(0, 69) + '...' : url;
			linkOut.hidden = false;

			// Copy to clipboard
			if (navigator.clipboard && navigator.clipboard.writeText) {
				navigator.clipboard.writeText(url).then(() => {
					showStatus(linkStatus, 'Trade link copied to clipboard!', 'success');
				}).catch(() => {
					showStatus(linkStatus, 'Link generated (copy manually above).', 'info');
				});
			} else {
				showStatus(linkStatus, 'Link generated (copy manually above).', 'info');
			}
		});
	}

	// ── Render Incoming Trade panel ───────────────────────────────────────────

	function initIncomingTrade() {
		const incomingPanel = document.getElementById('incomingPanel');
		const noOfferMsg = document.getElementById('noOfferMsg');
		const offerDetails = document.getElementById('offerDetails');
		const acceptBtn = document.getElementById('acceptBtn');
		const declineBtn = document.getElementById('declineBtn');
		const tradeStatus = document.getElementById('tradeStatus');

		if (!incomingPanel) return;

		// Parse ?offer= from URL
		const params = new URLSearchParams(window.location.search);
		const raw = params.get('offer');

		if (!raw) {
			if (noOfferMsg) noOfferMsg.hidden = false;
			if (offerDetails) offerDetails.hidden = true;
			return;
		}

		const offer = decodeOffer(raw);
		if (!offer || !offer.id || !offer.give || !offer.want || !offer.from) {
			if (noOfferMsg) { noOfferMsg.textContent = 'Invalid trade offer link.'; noOfferMsg.hidden = false; }
			if (offerDetails) offerDetails.hidden = true;
			return;
		}

		if (noOfferMsg) noOfferMsg.hidden = true;
		if (offerDetails) offerDetails.hidden = false;

		// Build detail text
		const trainerEl = document.getElementById('offerTrainerName');
		const giveEl = document.getElementById('offerGive');
		const wantEl = document.getElementById('offerWant');
		if (trainerEl) trainerEl.textContent = offer.from;
		if (giveEl) giveEl.textContent = offer.give.qty + ' ' + itemLabel(offer.give.item);
		if (wantEl) wantEl.textContent = offer.want.qty + ' ' + itemLabel(offer.want.item);

		const myName = getPlayerName();
		const isOwnOffer = myName && myName === offer.from;
		const alreadyClaimed = isClaimed(offer.id);

		if (isOwnOffer) {
			if (acceptBtn) acceptBtn.hidden = true;
			if (declineBtn) declineBtn.hidden = true;
			showStatus(tradeStatus, 'This is your own offer — share the link with a friend to trade!', 'info');
			return;
		}

		if (alreadyClaimed) {
			if (acceptBtn) acceptBtn.hidden = true;
			if (declineBtn) declineBtn.hidden = true;
			showStatus(tradeStatus, 'You have already claimed this trade.', 'info');
			return;
		}

		// Accept handler
		if (acceptBtn) {
			acceptBtn.addEventListener('click', () => {
				const inv = getInventory();
				const haveQty = getItemQty(inv, offer.want.item);

				if (haveQty < offer.want.qty) {
					showStatus(tradeStatus,
						'Not enough ' + itemLabel(offer.want.item) + '! You have ' + haveQty + ', need ' + offer.want.qty + '.',
						'error');
					return;
				}

				// Deduct what claimer gives, credit what they receive
				adjustItemQty(inv, offer.want.item, -offer.want.qty);
				adjustItemQty(inv, offer.give.item, offer.give.qty);
				saveInventory(inv);

				markClaimed(offer.id);

				if (acceptBtn) acceptBtn.disabled = true;
				if (declineBtn) declineBtn.hidden = true;

				showStatus(tradeStatus,
					'Trade accepted! You gave ' + offer.want.qty + ' ' + itemLabel(offer.want.item) +
					' and received ' + offer.give.qty + ' ' + itemLabel(offer.give.item) + '.',
					'success');
			});
		}

		// Decline handler
		if (declineBtn) {
			declineBtn.addEventListener('click', () => {
				markClaimed(offer.id);
				if (acceptBtn) acceptBtn.hidden = true;
				if (declineBtn) declineBtn.hidden = true;
				showStatus(tradeStatus, 'Trade declined.', 'info');
			});
		}
	}

	// ── Boot ──────────────────────────────────────────────────────────────────

	function init() {
		initMakeOffer();
		initIncomingTrade();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
