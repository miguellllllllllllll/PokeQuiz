(function () {
	const NAME_KEY = 'playerName';
	const AVATAR_KEY = 'pokequiz_avatar';
	const PLAYER_ID_KEY = 'pokequiz_player_id';
	const LOCAL_KEY = 'pokequiz_leaderboard';
	const MEMORY_BEST_PREFIX = 'pokequiz_memory_best_';

	const AVATARS = [
		{ id: 'pokeball', label: 'Pokéball' },
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

	// ── Trainer Customizer (palette-swap on the Calem sheet) ────────────────────
	function initCustomizer() {
		const TP = window.TrainerPalette;
		if (!TP) return;
		const canvas  = document.getElementById('tcCanvas');
		const dirBtns = document.querySelectorAll('.tc-dir-btn');
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = false;

		const FW = 22, FH = 38;
		const offX = Math.floor((canvas.width - FW) / 2);
		const offY = Math.floor((canvas.height - FH) / 2);

		const fullCanvas = document.createElement('canvas');
		const fullCtx = fullCanvas.getContext('2d');
		fullCtx.imageSmoothingEnabled = false;

		const baseImg = new Image();
		baseImg.src = 'Pictures/sprites/calem.png';

		let choices = TP.load();
		let previewDir = 0;
		let bodyId = TP.loadBody ? TP.loadBody() : 'classic';

		function redraw() {
			if (!baseImg.complete || !baseImg.naturalWidth) return;
			TP.recolor(baseImg, choices, fullCtx, bodyId);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			// sheet rows: 0=south, 1=west, 2=north, 3=east — matches previewDir
			ctx.drawImage(fullCanvas, 0, previewDir * FH, FW, FH, offX, offY, FW, FH);
		}

		baseImg.onload = () => {
			fullCanvas.width = baseImg.width;
			fullCanvas.height = baseImg.height;
			redraw();
		};

		dirBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				previewDir = Number(btn.dataset.dir);
				dirBtns.forEach(b => b.classList.toggle('is-active', b === btn));
				redraw();
			});
		});

		const bodyBtns = document.querySelectorAll('.tc-body-btn');
		bodyBtns.forEach(btn => {
			btn.classList.toggle('is-active', btn.dataset.body === bodyId);
			btn.addEventListener('click', () => {
				bodyId = btn.dataset.body;
				bodyBtns.forEach(b => b.classList.toggle('is-active', b === btn));
				if (TP.saveBody) TP.saveBody(bodyId);
				redraw();
				try { window.dispatchEvent(new StorageEvent('storage', { key: TP.BODY_KEY || 'pokequiz_trainer_body' })); } catch {}
			});
		});

		Object.keys(TP.DEFAULTS).forEach(cat => {
			const row = document.querySelector(`.tc-row[data-cat="${cat}"]`);
			if (!row) return;
			const picker = row.querySelector('.tc-color-picker');
			const hexEl = row.querySelector('[data-hex]');
			if (!picker) return;
			const current = (choices[cat] || TP.DEFAULTS[cat]).toLowerCase();
			picker.value = current;
			if (hexEl) hexEl.textContent = current.toUpperCase();
			picker.addEventListener('input', () => {
				const val = picker.value.toUpperCase();
				choices[cat] = val;
				if (hexEl) hexEl.textContent = val;
				TP.save(choices);
				redraw();
			});
		});
	}

	// ── Outfit Presets ───────────────────────────────────────────────────────────
	const PRESETS_KEY = 'pokequiz_outfit_presets';
	const PRESET_COUNT = 5;
	// preview colours shown in the strip (in display order)
	const STRIP_CATS = ['cap', 'outfit', 'shirt', 'hair', 'skin'];

	function loadPresets() {
		try {
			const raw = localStorage.getItem(PRESETS_KEY);
			const arr = raw ? JSON.parse(raw) : [];
			// ensure always exactly PRESET_COUNT entries
			while (arr.length < PRESET_COUNT) arr.push(null);
			return arr.slice(0, PRESET_COUNT);
		} catch {
			return Array(PRESET_COUNT).fill(null);
		}
	}

	function savePresets(presets) {
		try { localStorage.setItem(PRESETS_KEY, JSON.stringify(presets)); } catch {}
	}

	function initPresets() {
		const TP = window.TrainerPalette;
		const grid = document.getElementById('opGrid');
		if (!grid) return;

		let presets = loadPresets();

		function buildSlot(idx) {
			const preset = presets[idx];
			const isFilled = preset !== null;
			const defaultName = `Outfit ${idx + 1}`;

			const slot = document.createElement('div');
			slot.className = 'op-slot ' + (isFilled ? 'is-filled' : 'is-empty');
			slot.dataset.idx = idx;

			// Header row: slot number + name input
			const header = document.createElement('div');
			header.className = 'op-slot-header';

			const numLabel = document.createElement('span');
			numLabel.className = 'op-slot-num';
			numLabel.textContent = idx + 1;

			const nameInput = document.createElement('input');
			nameInput.type = 'text';
			nameInput.className = 'op-name-input';
			nameInput.maxLength = 20;
			nameInput.placeholder = defaultName;
			nameInput.value = isFilled ? (preset.name || defaultName) : '';
			nameInput.setAttribute('aria-label', `Preset ${idx + 1} name`);

			header.appendChild(numLabel);
			header.appendChild(nameInput);

			// Color preview strip
			const strip = document.createElement('div');
			strip.className = 'op-preview-strip';
			STRIP_CATS.forEach((cat) => {
				const swatch = document.createElement('div');
				swatch.className = 'op-swatch';
				swatch.title = cat;
				if (isFilled && preset.palette) {
					const defaults = TP ? TP.DEFAULTS : {};
					swatch.style.background = preset.palette[cat] || defaults[cat] || '#ccc';
				}
				strip.appendChild(swatch);
			});

			// Action buttons
			const actions = document.createElement('div');
			actions.className = 'op-actions';

			const saveBtn = document.createElement('button');
			saveBtn.type = 'button';
			saveBtn.className = 'op-btn op-btn-save';
			saveBtn.textContent = 'SAVE';
			saveBtn.setAttribute('aria-label', `Save current outfit to slot ${idx + 1}`);

			const loadBtn = document.createElement('button');
			loadBtn.type = 'button';
			loadBtn.className = 'op-btn op-btn-load';
			loadBtn.textContent = 'LOAD';
			loadBtn.disabled = !isFilled;
			loadBtn.setAttribute('aria-label', `Load outfit from slot ${idx + 1}`);

			actions.appendChild(saveBtn);
			actions.appendChild(loadBtn);

			slot.appendChild(header);
			slot.appendChild(strip);
			if (!isFilled) {
				const emptyLabel = document.createElement('div');
				emptyLabel.className = 'op-empty-label';
				emptyLabel.textContent = 'Empty slot';
				slot.appendChild(emptyLabel);
			}
			slot.appendChild(actions);

			// Wire save
			saveBtn.addEventListener('click', () => {
				const currentPalette = TP ? TP.load() : {};
				const currentBody = TP && TP.loadBody ? TP.loadBody() : 'classic';
				const slotName = nameInput.value.trim() || defaultName;
				presets[idx] = { name: slotName, palette: Object.assign({}, currentPalette), body: currentBody };
				savePresets(presets);
				// Rebuild this slot in place
				const newSlot = buildSlot(idx);
				grid.replaceChild(newSlot, slot);
			});

			// Wire load
			loadBtn.addEventListener('click', () => {
				if (!presets[idx]) return;
				const p = presets[idx];
				if (TP) {
					TP.save(p.palette);
					if (TP.saveBody) TP.saveBody(p.body || 'classic');
					// Dispatch storage event so camp.js and the customizer canvas pick it up
					window.dispatchEvent(new StorageEvent('storage', { key: TP.KEY || 'pokequiz_trainer_palette' }));
					window.dispatchEvent(new StorageEvent('storage', { key: TP.BODY_KEY || 'pokequiz_trainer_body' }));
					// Also re-init the customizer controls to reflect loaded values
					refreshCustomizerPickers(p.palette, p.body || 'classic');
				}
				// Brief visual feedback on the button
				const orig = loadBtn.textContent;
				loadBtn.textContent = 'LOADED!';
				setTimeout(() => { loadBtn.textContent = orig; }, 1200);
			});

			return slot;
		}

		function render() {
			grid.innerHTML = '';
			for (let i = 0; i < PRESET_COUNT; i++) {
				grid.appendChild(buildSlot(i));
			}
		}

		render();
	}

	// Update the existing color picker UI and canvas when a preset is loaded.
	function refreshCustomizerPickers(palette, body) {
		const TP = window.TrainerPalette;
		if (!TP) return;
		const defaults = TP.DEFAULTS || {};
		Object.keys(defaults).forEach((cat) => {
			const row = document.querySelector(`.tc-row[data-cat="${cat}"]`);
			if (!row) return;
			const picker = row.querySelector('.tc-color-picker');
			const hexEl = row.querySelector('[data-hex]');
			const val = (palette[cat] || defaults[cat]).toLowerCase();
			if (picker) picker.value = val;
			if (hexEl) hexEl.textContent = val.toUpperCase();
		});
		// Dispatch input on every picker so the customizer closure picks up
		// each new colour, not just the first. The redraw runs per picker.
		document.querySelectorAll('.tc-color-picker').forEach((picker) => {
			picker.dispatchEvent(new Event('input', { bubbles: true }));
		});
		if (body) {
			const target = document.querySelector(`.tc-body-btn[data-body="${body}"]`);
			if (target) target.click();
		}
	}

	function init() {
		renderAvatarOnButton();
		renderHero();
		renderPicker();
		initCustomizer();
		initPresets();
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
