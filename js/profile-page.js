(function () {
	const NAME_KEY = 'playerName';
	const AVATAR_KEY = 'pokequiz_avatar';
	const PLAYER_ID_KEY = 'pokequiz_player_id';
	const LOCAL_KEY = 'pokequiz_leaderboard';
	const MEMORY_BEST_PREFIX = 'pokequiz_memory_best_';

	const AVATARS = [
		{ id: 'pokeball', label: 'Pokéball' },
		{ id: 'red',      label: 'Red' },
		{ id: 'blue',     label: 'Blue' },
		{ id: 'giovanni', label: 'Giovanni' },
	];

	const GAMES = [
		{ id: 'quiz',        timeBased: false, withTotal: true  },
		{ id: 'silhouette',  timeBased: false, withTotal: false },
		{ id: 'cry',         timeBased: false, withTotal: false },
		{ id: 'higherlower', timeBased: false, withTotal: false },
		{ id: 'memory',      timeBased: true,  withTotal: false },
	];

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

	function getName() {
		return (sessionStorage.getItem(NAME_KEY) || localStorage.getItem(NAME_KEY) || '').trim();
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

	function getAvatar() {
		const saved = localStorage.getItem(AVATAR_KEY);
		return AVATARS.find((a) => a.id === saved) || AVATARS[0];
	}
	function setAvatar(id) {
		try { localStorage.setItem(AVATAR_KEY, id); } catch {}
	}

	function fmtTime(ms) {
		const totalSec = Math.floor(ms / 1000);
		const m = Math.floor(totalSec / 60);
		const s = totalSec % 60;
		return `${m}:${String(s).padStart(2, '0')}`;
	}

	function bestMemoryTime() {
		let best = null;
		for (const pairs of [6, 8, 12]) {
			const raw = localStorage.getItem(MEMORY_BEST_PREFIX + pairs);
			const n = Number(raw);
			if (Number.isFinite(n) && n > 0 && (best === null || n < best)) best = n;
		}
		return best;
	}

	async function fetchBestForGame(game, name) {
		try {
			const res = await fetch(`/api/leaderboard?game=${encodeURIComponent(game.id)}&limit=50`, {
				cache: 'no-store',
			});
			if (!res.ok) return null;
			const data = await res.json();
			const entries = Array.isArray(data?.entries) ? data.entries : [];
			const lowered = name.toLowerCase();
			const mine = entries.filter((e) => String(e.name || '').toLowerCase() === lowered);
			if (!mine.length) return null;
			if (game.timeBased) {
				// score from API is decoded ms (higher = better translated). For memory
				// the API returns the original ms — lowest ms wins.
				const best = mine.reduce((m, e) => (e.score < m.score ? e : m));
				return { value: fmtTime(best.score), raw: best };
			}
			const best = mine.reduce((m, e) => (e.score > m.score ? e : m));
			return { value: best.score, raw: best, total: best.total };
		} catch {
			return null;
		}
	}

	function renderAvatarOnButton() {
		const btnAvatar = document.querySelector('.profile-btn .profile-avatar');
		if (btnAvatar) btnAvatar.dataset.avatar = getAvatar().id;
		const btnName = document.querySelector('.profile-btn .profile-name');
		if (btnName) btnName.textContent = getName() || 'Trainer';
	}

	function renderHero() {
		const id = getPlayerId();
		const name = getName() || 'Trainer';
		document.querySelector('.ph-avatar').dataset.avatar = getAvatar().id;
		document.querySelector('.ph-name').textContent = name;
		const idCode = document.querySelector('.ph-id-code');
		if (idCode) idCode.textContent = id.slice(0, 8) + '…' + id.slice(-4);
		idCode?.setAttribute('title', id);
	}

	function renderPicker() {
		const root = document.querySelector('.pp-avatar-picker--lg');
		if (!root) return;
		root.innerHTML = AVATARS.map((a) => `
			<button class="pp-avatar-option" type="button" data-avatar="${a.id}" aria-label="${a.label}">
				<span class="pp-avatar-img" data-avatar="${a.id}"></span>
				<span class="pp-avatar-label">${a.label}</span>
			</button>
		`).join('');
		const current = getAvatar().id;
		root.querySelectorAll('.pp-avatar-option').forEach((b) => {
			b.classList.toggle('selected', b.dataset.avatar === current);
			b.addEventListener('click', () => {
				setAvatar(b.dataset.avatar);
				root.querySelectorAll('.pp-avatar-option').forEach((x) => {
					x.classList.toggle('selected', x === b);
				});
				renderHero();
				renderAvatarOnButton();
			});
		});
	}

	async function renderStats() {
		const name = getName();
		const tiles = document.querySelectorAll('.stat-tile');
		if (!name) {
			tiles.forEach((t) => {
				const v = t.querySelector('.stat-tile-value');
				v.textContent = 'Set name to track';
				v.classList.add('is-empty');
			});
			return;
		}
		await Promise.all(GAMES.map(async (g) => {
			const tile = document.querySelector(`.stat-tile[data-game="${g.id}"]`);
			if (!tile) return;
			const valEl = tile.querySelector('.stat-tile-value');
			const result = await fetchBestForGame(g, name);
			if (!result) {
				if (g.id === 'memory') {
					const local = bestMemoryTime();
					if (local) {
						valEl.textContent = fmtTime(local);
						valEl.classList.remove('is-empty');
						return;
					}
				}
				valEl.textContent = 'No runs yet';
				valEl.classList.add('is-empty');
				return;
			}
			valEl.classList.remove('is-empty');
			if (g.id === 'quiz') {
				valEl.innerHTML = `${result.value} <span style="font-size:14px;color:var(--muted)">/ ${result.total || 21}</span>`;
			} else {
				valEl.textContent = result.value;
			}
		}));
	}

	function wireEdit() {
		const editBtn = document.querySelector('.ph-edit-btn');
		const editRow = document.querySelector('.ph-edit');
		const input = document.querySelector('.ph-input');
		const saveBtn = document.querySelector('.ph-save');
		const cancelBtn = document.querySelector('.ph-cancel');
		const errorBox = document.querySelector('.ph-edit-error');

		function show(on) {
			editRow.hidden = !on;
			errorBox.hidden = true;
			errorBox.textContent = '';
			if (on) {
				input.value = getName();
				setTimeout(() => input.focus(), 0);
			}
		}

		editBtn.addEventListener('click', () => show(true));
		cancelBtn.addEventListener('click', () => show(false));
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') { e.preventDefault(); saveBtn.click(); }
		});

		saveBtn.addEventListener('click', async () => {
			const candidate = input.value.trim();
			errorBox.hidden = true;
			errorBox.textContent = '';
			if (!candidate) {
				setName('');
				show(false);
				renderHero();
				renderAvatarOnButton();
				renderStats();
				return;
			}
			if (candidate === getName()) { show(false); return; }
			saveBtn.disabled = true;
			try {
				const res = await fetch('/api/leaderboard', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ action: 'claim', name: candidate, playerId: getPlayerId() }),
				});
				if (res.status === 409) {
					const data = await res.json().catch(() => ({}));
					errorBox.textContent = data.message || `"${candidate}" is already claimed by another trainer.`;
					errorBox.hidden = false;
					return;
				}
			} catch {
				/* offline — allow local save */
			} finally {
				saveBtn.disabled = false;
			}
			setName(candidate);
			show(false);
			renderHero();
			renderAvatarOnButton();
			renderStats();
		});
	}

	function wireManage() {
		document.getElementById('ppCopyId').addEventListener('click', async (e) => {
			const btn = e.currentTarget;
			const id = getPlayerId();
			try {
				await navigator.clipboard.writeText(id);
				const old = btn.textContent;
				btn.textContent = 'Copied!';
				setTimeout(() => { btn.textContent = old; }, 1400);
			} catch {
				prompt('Trainer ID:', id);
			}
		});
		document.getElementById('ppClearData').addEventListener('click', () => {
			if (!confirm('Clear local PokeQuiz data (name + offline scores) on this device? Global leaderboard is not affected.')) return;
			sessionStorage.removeItem(NAME_KEY);
			sessionStorage.removeItem('playerScore');
			localStorage.removeItem(NAME_KEY);
			localStorage.removeItem(LOCAL_KEY);
			renderHero();
			renderAvatarOnButton();
			renderStats();
		});
	}

	function init() {
		renderAvatarOnButton();
		renderHero();
		renderPicker();
		wireEdit();
		wireManage();
		renderStats();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
