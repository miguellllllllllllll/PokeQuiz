(function () {
	const NAME_KEY = 'playerName';
	const LOCAL_KEY = 'pokequiz_leaderboard';

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

	function init() {
		const btn = document.querySelector('.profile-btn');
		if (!btn) return;
		const panel = document.querySelector('.profile-panel');
		if (!panel) return;

		const nameEl = btn.querySelector('.profile-name');
		const panelNameView = panel.querySelector('.pp-name-view');
		const panelScoreView = panel.querySelector('.pp-score-view');
		const panelEditForm = panel.querySelector('.pp-edit-form');
		const panelEditBtn = panel.querySelector('.pp-edit-btn');
		const panelInput = panel.querySelector('.pp-input');
		const panelSaveBtn = panel.querySelector('.pp-save-btn');
		const panelCancelBtn = panel.querySelector('.pp-cancel-btn');
		const panelClearBtn = panel.querySelector('.pp-clear-btn');

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
		}

		function open() {
			panel.hidden = false;
			btn.setAttribute('aria-expanded', 'true');
			refresh();
		}

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
