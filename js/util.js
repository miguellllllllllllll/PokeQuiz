// Shared PokeQuiz helpers. Plain script (no module) — exposes window.PokeUtil.
// Loaded before page scripts so they can rely on PokeUtil being present.
(function () {
	'use strict';

	// Escape a string for safe interpolation into innerHTML.
	function escapeHtml(s) {
		return String(s).replace(/[&<>"']/g, (c) => ({
			'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
		}[c]));
	}

	// Read a query-string parameter from the current (or given) URL.
	function getQueryParam(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[[\]]/g, '\\$&');
		const m = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)').exec(url);
		if (!m) return null;
		if (!m[2]) return '';
		return decodeURIComponent(m[2].replace(/\+/g, ' '));
	}

	// Stable per-device player id, created on first use.
	function getPlayerId() {
		let id = '';
		try { id = localStorage.getItem('pokequiz_player_id') || ''; } catch {}
		if (!id) {
			id = (typeof crypto !== 'undefined' && crypto.randomUUID)
				? crypto.randomUUID()
				: 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
			try { localStorage.setItem('pokequiz_player_id', id); } catch {}
		}
		return id;
	}

	// Current trainer name (session takes priority over local).
	function getPlayerName() {
		try {
			return (sessionStorage.getItem('playerName')
				|| localStorage.getItem('playerName') || '').trim();
		} catch { return ''; }
	}

	// Lightweight non-blocking toast. type: 'info' | 'success' | 'error'.
	let toastTimer = null;
	function toast(message, type) {
		let el = document.querySelector('.pq-toast');
		if (!el) {
			el = document.createElement('div');
			el.className = 'pq-toast';
			el.setAttribute('role', 'status');
			el.setAttribute('aria-live', 'polite');
			document.body.appendChild(el);
		}
		el.textContent = message;
		el.dataset.type = type || 'info';
		// reflow so the transition re-triggers if a toast is already showing
		void el.offsetWidth;
		el.classList.add('is-visible');
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3600);
	}

	// POST a score to the leaderboard. Surfaces a toast on failure instead of
	// failing silently. Returns a promise that resolves to true on success.
	function submitScore(payload) {
		return fetch('/api/leaderboard', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(payload),
		})
			.then((res) => {
				if (res.ok) return true;
				toast('Score saved on this device — leaderboard rejected it.', 'error');
				return false;
			})
			.catch(() => {
				toast("Score saved on this device — couldn't reach the leaderboard.", 'error');
				return false;
			});
	}

	window.PokeUtil = {
		escapeHtml, getQueryParam, getPlayerId, getPlayerName, toast, submitScore,
	};
})();
