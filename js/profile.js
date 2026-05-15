(function () {
	const NAME_KEY = 'playerName';
	const LOCAL_KEY = 'pokequiz_leaderboard';
	const AVATAR_KEY = 'pokequiz_avatar';

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
		refresh() { refreshFn(); },
		open() { openFn(); },
	};

	function syncNamePrompts() {
		const banners = document.querySelectorAll('.name-prompt');
		const has = !!getName();
		banners.forEach((b) => { b.hidden = has; });
	}

	function init() {
		const btn = document.querySelector('.profile-btn');
		if (!btn) return;
		const panel = document.querySelector('.profile-panel');
		if (!panel) return;

		const nameEl = btn.querySelector('.profile-name');
		let avatarEl = btn.querySelector('.profile-avatar');
		// Replace the <img> with a <span> so CSS background-image can crop
		// the trainer art to the face. The picker uses the same technique.
		if (avatarEl && avatarEl.tagName === 'IMG') {
			const span = document.createElement('span');
			span.className = 'profile-avatar';
			span.setAttribute('aria-hidden', 'true');
			avatarEl.replaceWith(span);
			avatarEl = span;
		}
		const panelNameView = panel.querySelector('.pp-name-view');
		const panelScoreView = panel.querySelector('.pp-score-view');
		const panelEditForm = panel.querySelector('.pp-edit-form');
		const panelEditBtn = panel.querySelector('.pp-edit-btn');
		const panelInput = panel.querySelector('.pp-input');
		const panelSaveBtn = panel.querySelector('.pp-save-btn');
		const panelCancelBtn = panel.querySelector('.pp-cancel-btn');
		const panelClearBtn = panel.querySelector('.pp-clear-btn');

		// Inject avatar picker before the actions row
		const pickerRow = document.createElement('div');
		pickerRow.className = 'pp-row pp-avatar-row';
		pickerRow.innerHTML = `
			<span class="pp-row-label">Avatar</span>
			<div class="pp-avatar-picker">
				${AVATARS.map((a) => `
					<button class="pp-avatar-option" data-avatar="${a.id}" type="button" aria-label="${a.label}" title="${a.label}">
						<span class="pp-avatar-img" data-avatar="${a.id}"></span>
					</button>
				`).join('')}
			</div>
		`;
		const actionsRow = panel.querySelector('.pp-actions');
		panel.insertBefore(pickerRow, actionsRow);

		function applyAvatar(id) {
			const a = AVATARS.find((x) => x.id === id) || AVATARS[0];
			if (avatarEl) avatarEl.dataset.avatar = a.id;
			pickerRow.querySelectorAll('.pp-avatar-option').forEach((b) => {
				b.classList.toggle('selected', b.dataset.avatar === a.id);
			});
		}

		setAvatarFn = (id) => {
			setAvatarStorage(id);
			applyAvatar(id);
		};

		pickerRow.querySelectorAll('.pp-avatar-option').forEach((b) => {
			b.addEventListener('click', (e) => {
				e.stopPropagation();
				setAvatarFn(b.dataset.avatar);
			});
		});

		applyAvatar(getAvatar().id);

		function refresh() {
			const name = getName();
			const displayName = name || 'Trainer';
			nameEl.textContent = displayName;
			panelNameView.textContent = name || 'Not set';
			panelNameView.classList.toggle('pp-empty', !name);

			const best = getBestLocalScore();
			if (best) {
				panelScoreView.innerHTML = `<strong>${best.score}</strong> <span class="pp-of">/ ${best.total || 21}</span>`;
			} else {
				panelScoreView.innerHTML = '<span class="pp-empty">No runs yet</span>';
			}

			syncNamePrompts();
		}

		refreshFn = refresh;

		function open() {
			panel.hidden = false;
			btn.setAttribute('aria-expanded', 'true');
			refresh();
		}

		openFn = () => {
			open();
			setTimeout(() => toggleEdit(true), 80);
		};

		function close() {
			panel.hidden = true;
			btn.setAttribute('aria-expanded', 'false');
			panelEditForm.hidden = true;
		}

		function toggleEdit(show) {
			panelEditForm.hidden = !show;
			if (show) {
				panelInput.value = getName();
				setTimeout(() => panelInput.focus(), 0);
			}
		}

		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			panel.hidden ? open() : close();
		});

		panel.addEventListener('click', (e) => e.stopPropagation());

		document.addEventListener('click', () => close());
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') close();
		});

		panelEditBtn.addEventListener('click', () => toggleEdit(true));
		panelCancelBtn.addEventListener('click', () => toggleEdit(false));
		panelSaveBtn.addEventListener('click', (e) => {
			e.preventDefault();
			setName(panelInput.value);
			toggleEdit(false);
			refresh();
		});
		panelInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				panelSaveBtn.click();
			}
		});

		panelClearBtn.addEventListener('click', () => {
			if (!confirm('Clear all local PokeQuiz data (name + local scores)? Global leaderboard is not affected.')) return;
			sessionStorage.removeItem(NAME_KEY);
			sessionStorage.removeItem('playerScore');
			localStorage.removeItem(NAME_KEY);
			localStorage.removeItem(LOCAL_KEY);
			refresh();
		});

		refresh();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
