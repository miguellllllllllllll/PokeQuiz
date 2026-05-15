(function () {
	const NAME_KEY = 'playerName';
	const LOCAL_KEY = 'pokequiz_leaderboard';
	const AVATAR_KEY = 'pokequiz_avatar';
	const PLAYER_ID_KEY = 'pokequiz_player_id';

	function getPlayerId() {
		let id;
		try { id = localStorage.getItem(PLAYER_ID_KEY); } catch {}
		if (!id) {
			id = (typeof crypto !== 'undefined' && crypto.randomUUID)
				? crypto.randomUUID()
				: 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
			try { localStorage.setItem(PLAYER_ID_KEY, id); } catch {}
		}
		return id;
	}

	const AVATARS = [
		{ id: 'pokeball', src: 'Pictures/pokeball.png', label: 'Pokéball' },
		{ id: 'red', src: 'Pictures/Red_art.png', label: 'Red' },
		{ id: 'blue', src: 'Pictures/Blue_art.png', label: 'Blue' },
		{ id: 'giovanni', src: 'Pictures/Giovanni_art.png', label: 'Giovanni' },
	];

	function getAvatar() {
		const saved = localStorage.getItem(AVATAR_KEY);
		return AVATARS.find((a) => a.id === saved) || AVATARS[0];
	}

	function setAvatarStorage(id) {
		try { localStorage.setItem(AVATAR_KEY, id); } catch {}
	}

	function getName() {
		const fromSession = sessionStorage.getItem(NAME_KEY);
		if (fromSession) return fromSession;
		const fromLocal = localStorage.getItem(NAME_KEY);
		return fromLocal || '';
	}

	function setName(name) {
		const v = (name || '').trim().slice(0, 24);
		if (v) {
			sessionStorage.setItem(NAME_KEY, v);
			localStorage.setItem(NAME_KEY, v);
		} else {
			sessionStorage.removeItem(NAME_KEY);
			localStorage.removeItem(NAME_KEY);
		}
	}

	function getBestLocalScore() {
		try {
			const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
			const name = getName();
			const filtered = name
				? list.filter((e) => e.name === name)
				: list;
			const best = filtered.reduce((m, e) => (e.score > m.score ? e : m), { score: -1 });
			return best.score >= 0 ? best : null;
		} catch {
			return null;
		}
	}

	let refreshFn = () => {};
	let setAvatarFn = () => {};

	let openFn = () => {};

	window.PokeProfile = {
		get name() { return getName(); },
		set name(v) { setName(v); refreshFn(); },
		get avatar() { return getAvatar().id; },
		set avatar(id) { setAvatarFn(id); },
		get playerId() { return getPlayerId(); },
		refresh() { refreshFn(); },
		open() { openFn(); },
	};

	function syncNamePrompts() {
		const banners = document.querySelectorAll('.name-prompt');
		const has = !!getName();
		banners.forEach((b) => { b.hidden = has; });
	}

	function init() {
		getPlayerId(); // ensure every visitor gets a stable ID, even without sign-in

		const btn = document.querySelector('.profile-btn');
		if (!btn) return;

		// Convert the avatar <img> to a <span> so background-image cropping works.
		let avatarEl = btn.querySelector('.profile-avatar');
		if (avatarEl && avatarEl.tagName === 'IMG') {
			const span = document.createElement('span');
			span.className = 'profile-avatar';
			span.setAttribute('aria-hidden', 'true');
			avatarEl.replaceWith(span);
			avatarEl = span;
		}
		const nameEl = btn.querySelector('.profile-name');

		function refresh() {
			if (avatarEl) avatarEl.dataset.avatar = getAvatar().id;
			if (nameEl) nameEl.textContent = getName() || 'Trainer';
			syncNamePrompts();
		}

		refreshFn = refresh;
		setAvatarFn = (id) => { setAvatarStorage(id); refresh(); };

		// Profile button now navigates to the dedicated profile page. Some
		// pages render the button as a <button>; others (profile.html) as an
		// <a>. Either way, force navigation on click — except when we're
		// already on the profile page, where a sibling script (profile-page.js)
		// owns the UI.
		const onProfilePage = /\/profile\.html$/.test(window.location.pathname);
		if (!onProfilePage && btn.tagName !== 'A') {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				window.location.href = 'profile.html';
			});
		}

		// Remove the legacy inline dropdown panel from any page that still
		// embeds it — the page-based profile replaces it.
		document.querySelectorAll('.profile-panel').forEach((p) => p.remove());

		openFn = () => { window.location.href = 'profile.html'; };

		refresh();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
