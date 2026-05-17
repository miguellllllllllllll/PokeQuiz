// camp-systems.js — self-contained UI systems extracted from camp.js
// Depends on camp-data.js (window.CAMP_DATA.ICO must be loaded first).
// Loaded with defer AFTER camp-data.js and BEFORE camp.js.
(function () {
	window.CAMP_SYSTEMS = window.CAMP_SYSTEMS || {};
	const ICO = (window.CAMP_DATA || {}).ICO || {};


	// ── ico ─────────────────────────────────────────────────────────
		function ico(cls, extra) {
			return '<i class="bi bi-' + cls + (extra ? ' ' + extra : '') + '" aria-hidden="true"></i>';
		}
	window.CAMP_SYSTEMS.ico = ico;

	// ── Sound ────────────────────────────────────────────────────────
		const Sound = (() => {
			let ctx = null;
			let enabled = true;
			function ensure() {
				try {
					if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
					if (ctx.state === 'suspended') ctx.resume();
				} catch (e) { ctx = null; }
				return ctx;
			}
			function play(notes, duration, type, vol) {
				if (!enabled) return;
				const c = ensure();
				if (!c) return;
				const t0 = c.currentTime;
				const dur = duration || 0.08;
				const v = vol == null ? 0.05 : vol;
				notes.forEach((freq, i) => {
					const osc = c.createOscillator();
					const gain = c.createGain();
					osc.connect(gain).connect(c.destination);
					osc.frequency.value = freq;
					osc.type = type || 'square';
					const startT = t0 + i * dur;
					gain.gain.setValueAtTime(v, startT);
					gain.gain.exponentialRampToValueAtTime(0.001, startT + dur);
					osc.start(startT);
					osc.stop(startT + dur + 0.02);
				});
			}
			function chord(notes, duration, type, vol) {
				if (!enabled) return;
				const c = ensure();
				if (!c) return;
				const t0 = c.currentTime;
				const dur = duration || 0.18;
				const v = vol == null ? 0.04 : vol;
				notes.forEach(freq => {
					const osc = c.createOscillator();
					const gain = c.createGain();
					osc.connect(gain).connect(c.destination);
					osc.frequency.value = freq;
					osc.type = type || 'square';
					gain.gain.setValueAtTime(v, t0);
					gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
					osc.start(t0);
					osc.stop(t0 + dur + 0.02);
				});
			}
			// Resume audio context on the first user gesture (browser autoplay policy).
			const prime = () => ensure();
			document.addEventListener('pointerdown', prime, { once: true });
			document.addEventListener('keydown', prime, { once: true });
			function setEnabled(on) { enabled = !!on; }
			return {
				plant:   () => play([392, 523],            0.07, 'triangle'),
				harvest: () => play([523, 659, 784],       0.09, 'triangle'),
				scythe:  () => play([880, 660, 440],       0.05, 'sawtooth', 0.05),
				equip:   () => play([523, 784],            0.06, 'square'),
				chime:   () => play([880],                 0.10, 'sine'),
				door:    () => play([330, 220],            0.10, 'square'),
				win:     () => play([523, 659, 784, 1047], 0.10, 'square'),
				lose:    () => play([392, 330, 262],       0.15, 'square'),
				spin:    () => play([440, 494, 523, 587],  0.05, 'square'),
				evolve:  () => chord([523, 659, 784, 1047], 0.6,  'triangle'),
				click:   () => play([880],                 0.04, 'square', 0.03),
				// Pokémon cry — unique 3-note sweep derived from Pokémon ID.
				cry: (id) => {
					const n = (id || 1);
					const base = 180 + (n * 47 % 280);
					play([base, base * (1 + (n * 7 % 9) / 18), base * (0.8 + (n * 3 % 5) / 20)], 0.13, 'sine', 0.06);
				},
				setEnabled,
				isEnabled: () => enabled,
			};
		})();
	window.CAMP_SYSTEMS.Sound = Sound;

	// ── Dialog ────────────────────────────────────────────────────────
		const Dialog = (() => {
			let box, text, cont;
			let fullText = '', shownLen = 0, revealTimer = 0;
			let isOpenFlag = false;
			const CHARS_PER_TICK = 1.6;
			function ensureRefs() {
				if (!box) {
					box = document.getElementById('campDialog');
					text = document.getElementById('campDialogText');
					cont = document.getElementById('campDialogCont');
				}
				return !!box;
			}
			function open(message) {
				if (!ensureRefs()) return;
				fullText = message;
				shownLen = 0;
				revealTimer = 0;
				text.textContent = '';
				cont.hidden = true;
				box.hidden = false;
				isOpenFlag = true;
			}
			function tick() {
				if (!isOpenFlag) return;
				if (shownLen < fullText.length) {
					revealTimer += CHARS_PER_TICK;
					const reveal = Math.min(fullText.length, Math.floor(shownLen + revealTimer));
					if (reveal > shownLen) {
						shownLen = reveal;
						revealTimer = 0;
						text.textContent = fullText.slice(0, shownLen);
					}
					if (shownLen >= fullText.length) cont.hidden = false;
				}
			}
			function advance() {
				if (!isOpenFlag) return;
				if (shownLen < fullText.length) {
					shownLen = fullText.length;
					text.textContent = fullText;
					cont.hidden = false;
				} else {
					close();
				}
			}
			function close() {
				if (!box) return;
				box.hidden = true;
				isOpenFlag = false;
				fullText = ''; shownLen = 0;
			}
			function isOpen() { return isOpenFlag; }
			// Tap anywhere on the dialog box to advance — essential for touch users.
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', () => {
					document.getElementById('campDialog')?.addEventListener('pointerup', advance);
				});
			} else {
				document.getElementById('campDialog')?.addEventListener('pointerup', advance);
			}
			return { open, tick, advance, close, isOpen };
		})();
	window.CAMP_SYSTEMS.Dialog = Dialog;

	// ── showToast ─────────────────────────────────────────────────────────
		function showToast(msg) {
			const existing = document.getElementById('campToast');
			if (existing) existing.remove();
			const toast = document.createElement('div');
			toast.id = 'campToast';
			toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#1a2440,#0e1826);border:2px solid #f6c84c;border-radius:10px;padding:10px 18px;font-family:"Press Start 2P",monospace;font-size:9px;color:#f6c84c;z-index:200;pointer-events:none;opacity:1;transition:opacity 0.5s ease;text-align:center;max-width:90vw;word-break:break-word';
			toast.innerHTML = msg;
			document.body.appendChild(toast);
			setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 2800);
		}
	window.CAMP_SYSTEMS.showToast = showToast;

	// ── Achievements ────────────────────────────────────────────────────────
		const Achievements = (() => {
			const DEFS = [
				{ id: 'firstCatch',   label: 'First Catch',      icoKey: 'fish',      desc: 'Catch your first fish'              },
				{ id: 'rareFish',     label: 'Rare Find',        icoKey: 'gem',        desc: 'Catch a Lapras or Shiny Gyarados'   },
				{ id: 'firstEvol',    label: 'Evolution!',       icoKey: 'sparkle',        desc: 'Evolve your partner Pokémon'        },
				{ id: 'fullFriend',   label: 'Best Friends',     icoKey: 'heart',     desc: 'Max out friendship'                 },
				{ id: 'rhythm100',    label: 'Rhythm Master',    icoKey: 'music',    desc: 'Win 10 rhythm battles'              },
				{ id: 'berryFarmer',  label: 'Berry Farmer',     icoKey: 'seed',     desc: 'Harvest 20 berries total'           },
				{ id: 'questStreak',  label: 'Quest Complete',   icoKey: 'quest',   desc: 'Complete all daily quests in a day' },
				{ id: 'shopkeeper',   label: 'Wealthy Trainer',  icoKey: 'token',  desc: 'Earn 500 tokens total'              },
				{ id: 'decorator',    label: 'Interior Design',  icoKey: 'house',  desc: 'Place 5 furniture pieces'           },
				{ id: 'nightOwl',     label: 'Night Owl',        icoKey: 'moon',        desc: 'Play camp after 10 PM'              },
				{ id: 'dex100',       label: 'Pokémon Master',   icoKey: 'book',   desc: 'Catch 100 different Pokémon'        },
				{ id: 'hatchEgg',     label: 'Hatcher',          icoKey: 'egg',          desc: 'Hatch a Pokémon egg'                },
				{ id: 'contestWin',   label: 'Contestant',       icoKey: 'contest',       desc: 'Win your first Pokémon Contest'     },
				{ id: 'contestMaster',label: 'Contest Master',   icoKey: 'ribbon',   desc: 'Win all 5 Contest categories'       },
				{ id: 'chef',         label: 'Camp Chef',        icoKey: 'curry',        desc: 'Cook your first curry'              },
				{ id: 'explorer',     label: 'Explorer',         icoKey: 'map',         desc: 'Reveal the entire camp map'         },
				{ id: 'mysteryGift',  label: 'Gift Receiver',    icoKey: 'gift',    desc: 'Claim a Mystery Gift'               },
				{ id: 'wonderTrade',  label: 'Wonder Trade',     icoKey: 'trade',     desc: 'Complete a Wonder Trade'            },
				{ id: 'trainer10',    label: 'Rising Trainer',   icoKey: 'level',   desc: 'Reach Trainer Level 10'             },
				{ id: 'trainer30',    label: 'Ace Trainer',      icoKey: 'level',      desc: 'Reach Trainer Level 30'             },
				{ id: 'fiveStarCamp', label: 'Five-Star Camp',   icoKey: 'star',  desc: 'Earn a 5-star camp rating'          },
				{ id: 'storytime',    label: 'Storyteller',      icoKey: 'bookOpen',     desc: 'Read a campfire story'              },
				{ id: 'postcard',     label: 'Pen Pal',          icoKey: 'postcard',          desc: 'Send your first postcard'           },
				{ id: 'composted',    label: 'Composter',        icoKey: 'compost',       desc: 'Make your first compost'            },
				{ id: 'camperMet',    label: 'Good Company',     icoKey: 'npc',    desc: 'Meet a visiting trainer'            },
			];
			function load() {
				const raw = localStorage.getItem('pokequiz_achievements');
				return raw ? JSON.parse(raw) : {};
			}
			function save(data) { localStorage.setItem('pokequiz_achievements', JSON.stringify(data)); }
			function unlock(id) {
				const data = load();
				if (data[id]) return;
				data[id] = Date.now();
				save(data);
				showToast(ico(ICO.achieve) + ' Achievement: ' + (DEFS.find(d => d.id === id)?.label || id));
			}
			function increment(id) {
				const data = load();
				const key = '__count_' + id;
				data[key] = (data[key] || 0) + 1;
				if (id === 'rhythm100' && data[key] >= 10) unlock('rhythm100');
				if (id === 'berryFarmer' && data[key] >= 20) unlock('berryFarmer');
				save(data);
			}
			function getAll() { return { defs: DEFS, unlocked: load() }; }
			return { unlock, increment, getAll };
		})();
	window.CAMP_SYSTEMS.Achievements = Achievements;

	// ── PhotoMode ────────────────────────────────────────────────────────
		const PhotoMode = (() => {
			function take(scene) {
				const hideEls = document.querySelectorAll('.photo-mode-hide');
				hideEls.forEach(function(el) { el._pmDisplay = el.style.display; el.style.display = 'none'; });
				const overlay = document.createElement('div');
				overlay.id = '_photoCountdown';
				overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:80px;color:#fff;text-shadow:0 0 20px #000;z-index:9999;pointer-events:none;';
				document.body.appendChild(overlay);
				let count = 3;
				function tick() {
					if (count > 0) { overlay.textContent = String(count); count--; setTimeout(tick, 700); }
					else {
						overlay.textContent = '📷';
						setTimeout(function() {
							if (scene.game && scene.game.renderer) {
								scene.game.renderer.snapshot(function(img) {
									const link = document.createElement('a');
									link.href = img.src;
									link.download = 'pokequiz-camp-' + Date.now() + '.png';
									link.click();
									overlay.remove();
									hideEls.forEach(function(el) { el.style.display = el._pmDisplay || ''; });
									showToast('Photo saved! 📷');
								});
							} else {
								overlay.remove();
								hideEls.forEach(function(el) { el.style.display = el._pmDisplay || ''; });
							}
						}, 400);
					}
				}
				tick();
			}
			return { take };
		})();
	window.CAMP_SYSTEMS.PhotoMode = PhotoMode;

	// ── PokeEncyclopedia ────────────────────────────────────────────────────────
		const PokeEncyclopedia = (() => {
			function open(dexId, displayName) {
				const existing = document.getElementById('encyclopediaPanel');
				if (existing) { existing.remove(); return; }
				const panel = document.createElement('div');
				panel.id = 'encyclopediaPanel';
				panel.className = 'pk-backdrop';
				panel.style.zIndex = '150';
				const inner = document.createElement('div');
				inner.className = 'pk-modal';
				inner.style.cssText = 'max-width:400px;width:min(400px,94vw)';
				inner.innerHTML = '<div class="pk-modal-head">' +
					'<span class="pk-modal-title">' + ico(ICO.book) + ' ENCYCLOPEDIA</span>' +
					'<button class="pk-close" id="encyclopediaClose" type="button">' + ico(ICO.close) + '</button>' +
					'</div>' +
					'<div class="pk-modal-body" id="encyclopediaBody">' +
						'<div style="text-align:center;padding:24px;font-size:8px;color:var(--pk-muted)">Loading...</div>' +
					'</div>';
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.body.appendChild(panel);
				document.getElementById('encyclopediaClose').addEventListener('click', () => panel.remove());
				panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
	
				const cacheKey = 'pokequiz_pokeapi_' + dexId;
				const cached = (() => { try { const v = sessionStorage.getItem(cacheKey); return v ? JSON.parse(v) : null; } catch(e) { return null; } })();
				if (cached) { _render(dexId, displayName, cached.poke, cached.species, panel); return; }
	
				Promise.all([
					fetch('https://pokeapi.co/api/v2/pokemon/' + dexId).then(r => r.json()),
					fetch('https://pokeapi.co/api/v2/pokemon-species/' + dexId).then(r => r.json()),
				]).then(([poke, species]) => {
					try { sessionStorage.setItem(cacheKey, JSON.stringify({ poke, species })); } catch(_) {}
					if (document.getElementById('encyclopediaPanel')) _render(dexId, displayName, poke, species, panel);
				}).catch(() => {
					const body = document.getElementById('encyclopediaBody');
					if (body) body.innerHTML = '<div style="text-align:center;padding:16px;font-size:8px;color:var(--pk-red)">Failed to load data. Check your connection.</div>';
				});
			}
			function _render(dexId, displayName, poke, species, panel) {
				const body = document.getElementById('encyclopediaBody');
				if (!body) return;
				const sprite = poke.sprites?.other?.['official-artwork']?.front_default || poke.sprites?.front_default || '';
				const types = (poke.types || []).map(t => {
					const TYPE_COLORS = { fire:'#f08030',water:'#6890f0',grass:'#78c850',electric:'#f8d030',psychic:'#f85888',ice:'#98d8d8',dragon:'#7038f8',dark:'#705848',fairy:'#ee99ac',normal:'#a8a878',fighting:'#c03028',poison:'#a040a0',ground:'#e0c068',rock:'#b8a038',bug:'#a8b820',ghost:'#705898',steel:'#b8b8d0',flying:'#a890f0' };
					const c = TYPE_COLORS[t.type.name] || '#888';
					return '<span style="background:' + c + ';color:#fff;padding:2px 7px;border-radius:4px;font-size:7px;text-transform:capitalize">' + t.type.name + '</span>';
				}).join(' ');
				const stats = (poke.stats || []).map(s => {
					const n = s.base_stat;
					const pct = Math.round((n / 255) * 100);
					const col = n >= 100 ? '#50dd88' : n >= 60 ? '#f6c84c' : '#f06868';
					const STAT_LABELS = { hp:'HP', attack:'Atk', defense:'Def', 'special-attack':'SpAtk', 'special-defense':'SpDef', speed:'Speed' };
					const lbl = STAT_LABELS[s.stat.name] || s.stat.name;
					return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
						'<span style="font-size:6px;color:var(--pk-muted);width:38px;flex-shrink:0">' + lbl + '</span>' +
						'<div style="flex:1;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden">' +
							'<div style="width:' + pct + '%;height:100%;background:' + col + ';border-radius:3px"></div>' +
						'</div>' +
						'<span style="font-size:7px;color:#e8eaf0;width:22px;text-align:right">' + n + '</span>' +
					'</div>';
				}).join('');
				const flavor = ((species.flavor_text_entries || []).find(e => e.language.name === 'en')?.flavor_text || '').replace(/\f/g, ' ').replace(/\n/g, ' ');
				const h = ((poke.height || 0) / 10).toFixed(1) + ' m';
				const w = ((poke.weight || 0) / 10).toFixed(1) + ' kg';
				body.innerHTML =
					(sprite ? '<div style="text-align:center;margin-bottom:12px"><img src="' + sprite + '" alt="' + displayName + '" style="width:120px;height:120px;object-fit:contain;image-rendering:auto"></div>' : '') +
					'<div style="text-align:center;margin-bottom:8px">' +
						'<span style="font-size:10px;color:var(--pk-gold)">' + displayName + '</span> ' +
						'<span style="font-size:7px;color:var(--pk-muted)">#' + String(dexId).padStart(3,'0') + '</span>' +
					'</div>' +
					'<div style="text-align:center;margin-bottom:10px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">' + types + '</div>' +
					'<div style="display:flex;gap:16px;justify-content:center;margin-bottom:10px;font-size:7px;color:var(--pk-muted)">' +
						'<span>' + ico(ICO.level) + ' ' + h + '</span><span>' + ico(ICO.cart) + ' ' + w + '</span>' +
					'</div>' +
					'<div style="margin-bottom:10px">' + stats + '</div>' +
					(flavor ? '<div style="font-size:7px;color:var(--pk-muted);font-style:italic;line-height:1.6;border-top:1px solid rgba(255,255,255,0.08);padding-top:8px">' + flavor + '</div>' : '');
			}
			return { open };
		})();
	window.CAMP_SYSTEMS.PokeEncyclopedia = PokeEncyclopedia;

	// Additional CAMP_DATA refs used by FurnitureSprites
	const SPRITE_DEFS       = (window.CAMP_DATA || {}).SPRITE_DEFS       || {};
	const ROOM_ITEMS        = (window.CAMP_DATA || {}).ROOM_ITEMS        || {};
	const HOUSE_ITEMS       = (window.CAMP_DATA || {}).HOUSE_ITEMS       || {};
	const FURNITURE_DESIGNS = (window.CAMP_DATA || {}).FURNITURE_DESIGNS || {};


	// ── FurnitureSprites ────────────────────────────────────────────────────────
		const FurnitureSprites = (() => {
			const cache = {};
	
			// Eagerly load both sprite sheets so they're ready by the time the user
			// enters their house. The images are tiny (<15 KB total).
			const sheets = [null, null, null]; // 1-indexed
			function loadSheets() {
				[1, 2].forEach((n) => {
					const img = new Image();
					img.src = `Pictures/furniture_sheet${n === 1 ? '' : n}.png`;
					sheets[n] = img;
				});
			}
			loadSheets();
	
			function drawFromSheet(ctx, def) {
				const img = sheets[def.s];
				if (!img || !img.complete || img.naturalWidth === 0) return false;
				ctx.imageSmoothingEnabled = false;
				ctx.drawImage(img, def.x, def.y, def.w, def.h, 0, 0, 16, 16);
				return true;
			}
	
			function get(key) {
				if (cache[key]) return cache[key];
				const canvas = document.createElement('canvas');
				canvas.width = 16; canvas.height = 16;
				const ctx = canvas.getContext('2d');
				ctx.imageSmoothingEnabled = false;
	
				// Try sprite sheet first.
				const def = SPRITE_DEFS[key];
				if (def && drawFromSheet(ctx, def)) {
					cache[key] = canvas;
					return canvas;
				}
	
				// Fall back to canvas pixel-art design.
				const designKey = key === 'plant' ? 'floorplant' : key;
				const d = FURNITURE_DESIGNS[designKey] || FURNITURE_DESIGNS[key];
				if (!d) return null;
				for (let r = 0; r < d.rows.length; r++) {
					const row = d.rows[r];
					for (let c = 0; c < row.length; c++) {
						const ch = row[c];
						if (ch === '.' || ch === ' ') continue;
						const color = d.palette[ch];
						if (!color) continue;
						ctx.fillStyle = color;
						ctx.fillRect(c, r, 1, 1);
					}
				}
				cache[key] = canvas;
				return canvas;
			}
	
			// Invalidate cache on sheet load so subsequent get() calls use the real art.
			[1, 2].forEach((n) => {
				sheets[n] && (sheets[n].onload = () => {
					Object.keys(cache).forEach((k) => {
						if (SPRITE_DEFS[k]?.s === n) delete cache[k];
					});
				});
			});
	
			function makeIcon(key, sizePx) {
				const src = get(key);
				if (!src) {
					const span = document.createElement('span');
					span.innerHTML = (() => { const _it = ROOM_ITEMS[key] || HOUSE_ITEMS[key] || {}; return _it.icoKey ? ico(ICO[_it.icoKey]||_it.icoKey) : ''; })();
					span.style.fontSize = (sizePx || 22) + 'px';
					return span;
				}
				const img = document.createElement('canvas');
				img.width = 16; img.height = 16;
				const ctx = img.getContext('2d');
				ctx.imageSmoothingEnabled = false;
				ctx.drawImage(src, 0, 0);
				img.style.width = (sizePx || 32) + 'px';
				img.style.height = (sizePx || 32) + 'px';
				img.style.imageRendering = 'pixelated';
				img.style.display = 'block';
				return img;
			}
	
			// Re-render icons after sheet loads (editor may already be open).
			function refreshIcons() {
				document.querySelectorAll('[data-furniture-key]').forEach((el) => {
					const key = el.dataset.furnitureKey;
					const fresh = get(key);
					if (fresh && el.tagName === 'CANVAS') {
						el.getContext('2d').drawImage(fresh, 0, 0);
					}
				});
			}
			[1, 2].forEach((n) => {
				if (sheets[n]) sheets[n].addEventListener('load', refreshIcons);
			});
	
			return { get, makeIcon };
		})();
	window.CAMP_SYSTEMS.FurnitureSprites = FurnitureSprites;

	// ── Music ────────────────────────────────────────────────────────
		const Music = (() => {
			const BASE = 'https://archive.org/download/pkmn-frlg-soundtrack/Disc%201/';
			const URLS = {
				camp:     BASE + '04%20-%20Pallet%20Town.mp3',
				house:    BASE + '16%20-%20Pok%C3%A9mon%20Center.mp3',
				upstairs: BASE + '12%20-%20Route%201.mp3',
			};
	
			let current = null;   // the active HTMLAudioElement
			let area    = null;
			let on      = true;
	
			// Battle stays synthesised — fast, no network latency on encounter.
			let musicCtx = null;
			let battleOscs = [];
			let battleTimer = null;
			const BATTLE_NOTES = [440,.09,494,.09,523,.09,587,.09,523,.09,440,.18,415,.09,440,.18];
	
			function ensureCtx() {
				try {
					if (!musicCtx) musicCtx = new (window.AudioContext || window.webkitAudioContext)();
					if (musicCtx.state === 'suspended') musicCtx.resume();
				} catch(e) { musicCtx = null; }
				return musicCtx;
			}
	
			function playBattleLoop() {
				if (!on || area !== 'battle') return;
				const c = ensureCtx();
				if (!c) return;
				let t = c.currentTime, totalDur = 0;
				const notes = BATTLE_NOTES;
				for (let i = 0; i < notes.length; i += 2) {
					const freq = notes[i], dur = notes[i+1];
					const osc = c.createOscillator(), g = c.createGain();
					osc.connect(g).connect(c.destination);
					osc.frequency.value = freq; osc.type = 'square';
					g.gain.setValueAtTime(0.020, t);
					g.gain.exponentialRampToValueAtTime(0.0001, t + dur - 0.01);
					osc.start(t); osc.stop(t + dur);
					battleOscs.push(osc);
					t += dur; totalDur += dur;
				}
				battleTimer = setTimeout(() => {
					battleOscs = battleOscs.filter(o => { try { o.stop(0); } catch {} return false; });
					playBattleLoop();
				}, (totalDur - 0.05) * 1000);
			}
	
			function stopBattle() {
				if (battleTimer) { clearTimeout(battleTimer); battleTimer = null; }
				battleOscs.forEach(o => { try { o.stop(0); } catch {} });
				battleOscs = [];
			}
	
			// Preload all tracks immediately so there's no network lag when start() fires.
			const _pool = {};
			Object.entries(URLS).forEach(([key, url]) => {
				const a = new Audio();
				a.preload = 'auto';
				a.loop    = true;
				a.volume  = 0.45;
				a.src     = url;   // setting src starts buffering
				_pool[key] = a;
			});
	
			function stopAudio() {
				if (current) {
					current.pause();
					current.currentTime = 0;
					current = null;
				}
			}
	
			function start(key) {
				if (!on) return;
				if (area === key) return;
				stop();
				area = key;
				if (key === 'battle') { playBattleLoop(); return; }
				const audio = _pool[key];
				if (!audio) return;
				audio.currentTime = 0;
				audio.play().catch(() => {});   // browsers may block until a gesture
				current = audio;
			}
	
			function stop() {
				area = null;
				stopAudio();
				stopBattle();
			}
	
			function setEnabled(flag) {
				on = !!flag;
				if (!on) { stop(); return; }
				try { localStorage.setItem('pokequiz_music_on', flag ? '1' : '0'); } catch {}
			}
			function isEnabled() { return on; }
			try { const saved = localStorage.getItem('pokequiz_music_on'); if (saved === '0') on = false; } catch {}
	
			return { start, stop, setEnabled, isEnabled };
		})();
	window.CAMP_SYSTEMS.Music = Music;

	// String key constants used by Plants and Stats
	const PLANTS_KEY = (window.CAMP_DATA || {}).PLANTS_KEY;
	const STATS_KEY  = (window.CAMP_DATA || {}).STATS_KEY;


	// ── Plants ────────────────────────────────────────────────────────
		const Plants = (() => {
			function load() {
				try {
					const raw = localStorage.getItem(PLANTS_KEY);
					if (raw) return JSON.parse(raw);
				} catch {}
				return [];
			}
			function save(plants) {
				try { localStorage.setItem(PLANTS_KEY, JSON.stringify(plants)); } catch {}
			}
			return { load, save };
		})();
	window.CAMP_SYSTEMS.Plants = Plants;

	// ── Stats ────────────────────────────────────────────────────────
		const Stats = (() => {
			const DEFAULT = { totalCatches: 0, totalHarvests: 0, totalDaysPlayed: 0, loginStreak: 0, totalTokensEarned: 0 };
			function load() {
				try { const r = localStorage.getItem(STATS_KEY); return r ? Object.assign({}, DEFAULT, JSON.parse(r)) : Object.assign({}, DEFAULT); } catch { return Object.assign({}, DEFAULT); }
			}
			function save(s) { try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {} }
			function increment(field, by) { const s = load(); s[field] = (s[field] || 0) + (by || 1); save(s); }
			return { load, increment };
		})();
	window.CAMP_SYSTEMS.Stats = Stats;

	// ── TrainerLevel ────────────────────────────────────────────────────────
		const TrainerLevel = (() => {
			// XP needed to advance FROM each level (level 1 → needs XP_TABLE[1] to reach 2)
			const XP_TABLE = [0];
			for (let i = 1; i <= 50; i++) XP_TABLE[i] = Math.floor(18 * i * i * 0.85);
	
			const XP_SOURCES = { fish:15, harvest:10, rhythm:25, quest:20, cook:15, evolve:50,
				amie:8, contest:30, compost:12, postcard:18, camper:10, battle:10, egg:40 };
	
			function load() {
				try { return JSON.parse(localStorage.getItem('pokequiz_trainer_level') || '{"level":1,"xp":0,"totalXp":0}'); }
				catch { return { level:1, xp:0, totalXp:0 }; }
			}
			function save(d) { localStorage.setItem('pokequiz_trainer_level', JSON.stringify(d)); }
	
			function addXP(source) {
				const amount = XP_SOURCES[source] || 5;
				const d = load();
				d.xp = (d.xp || 0) + amount;
				d.totalXp = (d.totalXp || 0) + amount;
				let leveled = false;
				while (d.level < 50 && d.xp >= XP_TABLE[d.level]) {
					d.xp -= XP_TABLE[d.level];
					d.level++;
					leveled = true;
				}
				save(d);
				if (leveled) {
					showToast(ico(ICO.star) + ' Level Up! Trainer Level ' + d.level + '!');
					if (d.level >= 10) Achievements.unlock('trainer10');
					if (d.level >= 30) Achievements.unlock('trainer30');
				}
				updateHUD();
			}
	
			function updateHUD() {
				const el = document.getElementById('trainerLevelBadge');
				if (!el) return;
				const d = load();
				el.textContent = 'Lv.' + d.level;
				const next = d.level < 50 ? XP_TABLE[d.level] : '---';
				el.title = 'XP: ' + d.xp + ' / ' + next + '  |  Total: ' + d.totalXp;
			}
	
			function getLevel() { return load().level; }
			return { addXP, updateHUD, getLevel };
		})();
	window.CAMP_SYSTEMS.TrainerLevel = TrainerLevel;

	// ── WeatherSystem ────────────────────────────────────────────────────────
		const WeatherSystem = {
			check(scene) {
				const now = Date.now();
				const seed = Math.floor(now / (4 * 3600 * 1000));
				const rng = ((seed * 1664525 + 1013904223) >>> 0) / 0xFFFFFFFF;
				const shouldRain = rng < 0.3;
				if (shouldRain && scene && scene.rainContainer && !scene._autoRainOn) {
					scene._autoRainOn = true;
					scene.isRaining = true;
				}
			},
		};
	window.CAMP_SYSTEMS.WeatherSystem = WeatherSystem;

	// ── PartnerMood ────────────────────────────────────────────────────────
		const PartnerMood = (() => {
			function get(inv) {
				const today = new Date().toISOString().slice(0,10);
				if (inv.lastShinyToday === today || inv.lastPerfectQuizDate === today) return 'excited';
				const now = Date.now();
				const fedRecently = inv.lastBerryFed && (now - inv.lastBerryFed) < 2 * 3600000;
				const quizToday = inv.lastQuizPlayed === today;
				const bonusToday = (() => { try { return localStorage.getItem('pokequiz_camp_daily') === today; } catch(e) { return false; } })();
				if (fedRecently || quizToday || bonusToday) return 'happy';
				const noVisit24h = !inv.lastLogin || (now - inv.lastLogin) > 24 * 3600000;
				if (noVisit24h) return 'tired';
				return 'neutral';
			}
			function emoji(mood) {
				if (mood === 'excited') return '🤩';
				if (mood === 'happy') return '😊';
				if (mood === 'tired') return '😴';
				return '😐';
			}
			function tokenMultiplier(mood) {
				return (mood === 'happy' || mood === 'excited') ? 1.1 : 1.0;
			}
			return { get, emoji, tokenMultiplier };
		})();
	window.CAMP_SYSTEMS.PartnerMood = PartnerMood;

	// ── PostcardSystem ────────────────────────────────────────────────────────
		const PostcardSystem = (() => {
			const MAX_CARDS = 10;
			const PROMPTS = [
				"What's your favourite Pokémon and why?",
				"Describe your camp in three words.",
				"What adventure do you wish for today?",
				"Write a message to your future trainer self.",
				"What would you name your dream team?",
				"What Pokémon would you want as a partner in real life?",
				"Describe the best Pokémon battle you've ever imagined.",
			];
	
			function load() {
				try { return JSON.parse(localStorage.getItem('pokequiz_postcards') || '[]'); }
				catch { return []; }
			}
			function save(cards) { localStorage.setItem('pokequiz_postcards', JSON.stringify(cards)); }
	
			function open() {
				let panel = document.getElementById('postcardPanel');
				if (!panel) {
					panel = document.createElement('div');
					panel.id = 'postcardPanel';
					document.body.appendChild(panel);
					panel.addEventListener('pointerdown', e => { if(e.target===panel) panel.hidden=true; });
				}
				panel.hidden = false;
				renderList(panel);
			}
	
			function renderList(panel) {
				const cards = load();
				panel.className = 'pk-backdrop';
				panel.innerHTML = '';
				const inner = document.createElement('div');
				inner.className = 'pk-modal';
				inner.innerHTML = '<div class="pk-modal-head">' +
					'<span class="pk-modal-title">' + ico(ICO.postcard) + ' POSTCARDS</span>' +
					'<button id="postcardClose" class="pk-close" type="button">' + ico(ICO.close) + '</button>' +
					'</div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
	
				const sub = document.createElement('div');
				sub.style.cssText = 'font-size:7px;color:var(--pk-muted);margin-bottom:12px';
				sub.textContent = cards.length + ' / ' + MAX_CARDS + ' postcards saved';
				body.appendChild(sub);
	
				if (cards.length > 0) {
					const list = document.createElement('div');
					list.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-bottom:12px';
					cards.forEach((card, i) => {
						const row = document.createElement('div');
						row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border:1px solid var(--pk-border);border-radius:var(--pk-radius-sm);background:rgba(255,255,255,0.03);cursor:pointer;gap:8px';
						const info = document.createElement('div');
						info.style.flex = '1';
						const date = document.createElement('div');
						date.style.cssText = 'font-size:7px;color:var(--pk-gold)';
						date.innerHTML = ico(ICO.mail) + ' ' + new Date(card.ts).toLocaleDateString();
						const preview = document.createElement('div');
						preview.style.cssText = 'font-size:7px;color:var(--pk-muted);margin-top:2px';
						preview.textContent = card.text.length > 40 ? card.text.slice(0,40)+'…' : card.text;
						info.appendChild(date);
						info.appendChild(preview);
						const del = document.createElement('button');
						del.className = 'pk-btn pk-btn-red pk-btn-xs';
						del.innerHTML = ico(ICO.trash);
						del.addEventListener('click', e => {
							e.stopPropagation();
							const c2 = load(); c2.splice(i,1); save(c2);
							renderList(panel);
						});
						info.addEventListener('click', () => renderRead(panel, card));
						row.appendChild(info);
						row.appendChild(del);
						list.appendChild(row);
					});
					body.appendChild(list);
				} else {
					const empty = document.createElement('div');
					empty.style.cssText = 'text-align:center;color:var(--pk-faint);font-size:8px;padding:18px 0';
					empty.textContent = 'No postcards yet. Write your first!';
					body.appendChild(empty);
				}
	
				if (cards.length < MAX_CARDS) {
					const writeBtn = document.createElement('button');
					writeBtn.className = 'pk-btn pk-btn-gold pk-btn-full pk-btn-sm';
					writeBtn.innerHTML = ico(ICO.write) + ' Write New Postcard';
					writeBtn.addEventListener('click', () => renderWrite(panel));
					body.appendChild(writeBtn);
				}
	
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.getElementById('postcardClose')?.addEventListener('click', () => { panel.hidden = true; });
			}
	
			function renderWrite(panel) {
				const prompt = PROMPTS[Math.floor(Date.now() / 86400000) % PROMPTS.length];
				panel.className = 'pk-backdrop';
				panel.innerHTML = '';
				const inner = document.createElement('div');
				inner.className = 'pk-modal pk-modal-sm';
				inner.innerHTML = '<div class="pk-modal-head">' +
					'<span class="pk-modal-title">' + ico(ICO.write) + ' WRITE</span>' +
					'<button id="postcardBack" class="pk-close" type="button">' + ico(ICO.back) + '</button>' +
					'</div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
				body.style.cssText = 'display:flex;flex-direction:column;gap:10px';
	
				const hint = document.createElement('div');
				hint.style.cssText = 'font-size:7px;color:var(--pk-gold);padding:8px;background:rgba(246,200,76,0.06);border-radius:6px';
				hint.innerHTML = ico(ICO.info) + ' ' + prompt;
	
				const ta = document.createElement('textarea');
				ta.style.cssText = 'width:100%;min-height:90px;background:rgba(255,255,255,0.05);border:1px solid var(--pk-border);border-radius:6px;color:var(--pk-text);font-family:inherit;font-size:8px;padding:8px;resize:none;box-sizing:border-box;line-height:1.7';
				ta.maxLength = 200;
				ta.placeholder = 'Write here… (max 200 chars)';
	
				const counter = document.createElement('div');
				counter.style.cssText = 'font-size:7px;color:var(--pk-faint);text-align:right';
				counter.textContent = '0 / 200';
				ta.addEventListener('input', () => { counter.textContent = ta.value.length + ' / 200'; });
	
				const saveBtn = document.createElement('button');
				saveBtn.className = 'pk-btn pk-btn-gold pk-btn-full pk-btn-sm';
				saveBtn.innerHTML = ico(ICO.send) + ' Send Postcard';
				saveBtn.addEventListener('click', () => {
					const text = ta.value.trim();
					if (!text) { showToast('Write something first!'); return; }
					const c2 = load();
					c2.unshift({ text, ts: Date.now(), prompt });
					if (c2.length > MAX_CARDS) c2.length = MAX_CARDS;
					save(c2);
					TrainerLevel.addXP('postcard');
					Achievements.unlock('postcard');
					showToast(ico(ICO.postcard) + ' Postcard saved!');
					renderList(panel);
				});
	
				body.appendChild(hint);
				body.appendChild(ta);
				body.appendChild(counter);
				body.appendChild(saveBtn);
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.getElementById('postcardBack')?.addEventListener('click', () => renderList(panel));
			}
	
			function renderRead(panel, card) {
				panel.className = 'pk-backdrop';
				panel.innerHTML = '';
				const inner = document.createElement('div');
				inner.className = 'pk-modal pk-modal-sm';
				inner.innerHTML = '<div class="pk-modal-head">' +
					'<span class="pk-modal-title">' + ico(ICO.readMail) + ' POSTCARD</span>' +
					'<button id="postcardBack3" class="pk-close" type="button">' + ico(ICO.back) + '</button>' +
					'</div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
				body.style.cssText = 'display:flex;flex-direction:column;gap:12px';
	
				const date = document.createElement('div');
				date.style.cssText = 'font-size:7px;color:var(--pk-muted)';
				date.innerHTML = ico('calendar3') + ' ' + new Date(card.ts).toLocaleDateString();
	
				if (card.prompt) {
					const pr = document.createElement('div');
					pr.style.cssText = 'font-size:7px;color:var(--pk-gold);font-style:italic';
					pr.textContent = '"' + card.prompt + '"';
					body.appendChild(date);
					body.appendChild(pr);
				} else {
					body.appendChild(date);
				}
	
				const text = document.createElement('div');
				text.style.cssText = 'font-size:9px;color:var(--pk-text);line-height:1.9;padding:12px;background:rgba(246,200,76,0.05);border:1px solid var(--pk-border);border-radius:8px';
				text.textContent = card.text;
				body.appendChild(text);
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.getElementById('postcardBack3')?.addEventListener('click', () => renderList(panel));
			}
	
			return { open };
		})();
	window.CAMP_SYSTEMS.PostcardSystem = PostcardSystem;

	// ── TouchActions ────────────────────────────────────────────────────────
		const TouchActions = (() => {
			const f = {};
			return {
				fire(action)    { f[action] = true; },
				consume(action) { const v = !!f[action]; f[action] = false; return v; },
			};
		})();
	window.CAMP_SYSTEMS.TouchActions = TouchActions;

	// CAMP_DATA constants used by Inventory, Daily, BerryBreeding, NotifBell
	const INVENTORY_KEY  = (window.CAMP_DATA || {}).INVENTORY_KEY;
	const FRIENDSHIP_MAX = (window.CAMP_DATA || {}).FRIENDSHIP_MAX || 100;
	const DAILY_BONUS_KEY = (window.CAMP_DATA || {}).DAILY_BONUS_KEY;
	const DAILY_BONUS_MS  = (window.CAMP_DATA || {}).DAILY_BONUS_MS || (22*3600*1000);


	// ── getEffectiveGrowMs ────────────────────────────────────────────────
		function getEffectiveGrowMs() {
			const inv = Inventory.load();
			let ms = GROW_MS;
			// Herbal Tea fast-grow boost: 80% faster (10% of normal time)
			if (inv.boosts && inv.boosts.fastGrow > Date.now()) ms = Math.floor(ms * 0.1);
			// Furniture grow speed bonus: 20% faster
			const fb = getFurnitureBonuses ? getFurnitureBonuses() : { growSpeedBonus: 0 };
			if (fb.growSpeedBonus > 0) ms = Math.floor(ms * (1 - fb.growSpeedBonus));
			// Partner passive: Leafeon gives +30% grow speed; Growth Boost tutor skill gives +50%
			const pp = typeof getPartnerPassive === 'function' ? getPartnerPassive() : { growSpeedBonus: 0, tutorGrowBonus: 0 };
			if (pp.growSpeedBonus > 0) ms = Math.floor(ms * (1 - pp.growSpeedBonus));
			if ((pp.tutorGrowBonus || 0) > 0) ms = Math.floor(ms * (1 - pp.tutorGrowBonus));
			return Math.max(1000, ms);
		}
	window.CAMP_SYSTEMS.getEffectiveGrowMs = getEffectiveGrowMs;

	// ── Inventory ────────────────────────────────────────────────────────
		const Inventory = (() => {
			const DEFAULT = {
				seeds: 3, friendshipBerries: 0, tokens: 0, friendship: 0,
				eeveeForm: 'eevee', stone: null,
				hasScythe: false, scytheEquipped: false,
				cosmetics: { wallpaper: 'default', accent: 'default', partnerScale: 'normal', decor: [], roomItems: [], roomPlacements: {}, houseRoomItems: [], housePlacements: {} },
			};
			function load() {
				try {
					const raw = localStorage.getItem(INVENTORY_KEY);
					if (raw) {
						const parsed = JSON.parse(raw);
						// Deep-merge cosmetics so new keys added to DEFAULT are always present.
						const cosm = Object.assign({}, DEFAULT.cosmetics, parsed.cosmetics || {});
						if (!Array.isArray(cosm.decor)) cosm.decor = [];
						if (!Array.isArray(cosm.roomItems)) cosm.roomItems = [];
						if (!cosm.roomPlacements || typeof cosm.roomPlacements !== 'object') cosm.roomPlacements = {};
						if (cosm.roomActive) {
							Object.entries(cosm.roomActive).forEach(([k, v]) => {
								if (v && ROOM_ITEMS[k] && !cosm.roomPlacements[k])
									cosm.roomPlacements[k] = { r: ROOM_ITEMS[k].r, c: ROOM_ITEMS[k].c };
							});
							delete cosm.roomActive;
						}
						if (!Array.isArray(cosm.houseRoomItems)) cosm.houseRoomItems = [];
						if (!cosm.housePlacements || typeof cosm.housePlacements !== 'object') cosm.housePlacements = {};
						if (cosm.houseRoomActive) {
							Object.entries(cosm.houseRoomActive).forEach(([k, v]) => {
								if (v && HOUSE_ITEMS[k] && !cosm.housePlacements[k])
									cosm.housePlacements[k] = { r: HOUSE_ITEMS[k].r, c: HOUSE_ITEMS[k].c };
							});
							delete cosm.houseRoomActive;
						}
						// Away-time check: if lastLogin is set, compute time away and award items
						if (parsed.lastLogin) {
							const awayMs = Date.now() - parsed.lastLogin;
							const awayHours = awayMs / 3600000;
							if (awayHours >= 1) {
								// Camp rating bonus (calculated here since CampRating module not yet defined;
								// we replicate the logic inline to avoid forward-reference issues)
								const _placements = Object.keys({
									...(parsed.cosmetics?.roomPlacements || {}),
									...(parsed.cosmetics?.housePlacements || {}),
								}).length;
								let _rScore = Math.min(2, Math.floor(_placements / 2));
								try { const _pl = JSON.parse(localStorage.getItem('pokequiz_plants') || '[]'); if (_pl.length >= 2) _rScore += 1; } catch {}
								if ((parsed.pcBox || []).length >= 3) _rScore += 1;
								if ((parsed.friendship || 0) >= 80) _rScore += 1;
								const _rMult = 1 + (Math.min(5, Math.max(1, _rScore)) - 1) * 0.2;
	
								let msg = '';
								if (awayHours >= 8) {
									parsed.seeds = (parsed.seeds||0) + Math.round(3 * _rMult);
									parsed.friendshipBerries = (parsed.friendshipBerries||0) + Math.round(2 * _rMult);
									parsed.tokens = (parsed.tokens||0) + Math.round(10 * _rMult);
									msg = 'Away 8h+: found seeds, berries & tokens! (×' + _rMult.toFixed(1) + ' camp bonus)';
								} else if (awayHours >= 4) {
									parsed.seeds = (parsed.seeds||0) + Math.round(2 * _rMult);
									parsed.friendshipBerries = (parsed.friendshipBerries||0) + Math.round(1 * _rMult);
									msg = 'Away 4h+: found seeds & berries! (×' + _rMult.toFixed(1) + ')';
								} else if (awayHours >= 1) {
									parsed.seeds = (parsed.seeds||0) + Math.round(1 * _rMult);
									msg = 'Away 1h+: found a seed!';
								}
								if (msg) {
									parsed.lastLogin = Date.now();
									localStorage.setItem(INVENTORY_KEY, JSON.stringify(parsed));
									setTimeout(() => { if (typeof showToast !== 'undefined') showToast(ico(ICO.camp) + ' Your Pokémon explored! ' + msg); }, 2000);
								}
							}
						}
						return Object.assign({}, DEFAULT, parsed, { cosmetics: cosm });
					}
				} catch {}
				return Object.assign({}, DEFAULT, { cosmetics: Object.assign({}, DEFAULT.cosmetics) });
			}
			function save(inv) {
				try {
					inv.lastLogin = Date.now();
					localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv));
				} catch {}
			}
			return { load, save };
		})();
	window.CAMP_SYSTEMS.Inventory = Inventory;

	// ── Daily ────────────────────────────────────────────────────────
		const Daily = (() => {
			function lastClaim() {
				try { return Number(localStorage.getItem(DAILY_BONUS_KEY) || 0); } catch { return 0; }
			}
			function ready() { return (Date.now() - lastClaim()) >= DAILY_BONUS_MS; }
			function claim() {
				const inv = Inventory.load();
				inv.tokens = (inv.tokens || 0) + 20;
				inv.seeds = (inv.seeds || 0) + 1;
				Inventory.save(inv);
				const prevClaim = lastClaim();
				try { localStorage.setItem(DAILY_BONUS_KEY, String(Date.now())); } catch {}
				// Update stats: streak continues if last claim was within 48h.
				const s = Stats.load();
				const hoursSince = prevClaim ? (Date.now() - prevClaim) / 3600000 : 999;
				s.loginStreak = (prevClaim && hoursSince < 48) ? (s.loginStreak || 0) + 1 : 1;
				s.totalDaysPlayed = (s.totalDaysPlayed || 0) + 1;
				s.totalTokensEarned = (s.totalTokensEarned || 0) + 20;
				Stats.save(s);
			}
			function hoursLeft() {
				const ms = DAILY_BONUS_MS - (Date.now() - lastClaim());
				return Math.max(0, Math.ceil(ms / (60 * 60 * 1000)));
			}
			return { ready, claim, hoursLeft };
		})();
	window.CAMP_SYSTEMS.Daily = Daily;

	// ── Pokedex ────────────────────────────────────────────────────────
		const Pokedex = (() => {
			const DEX = [
				{id:1,n:'Bulbasaur'},{id:2,n:'Ivysaur'},{id:3,n:'Venusaur'},
				{id:4,n:'Charmander'},{id:5,n:'Charmeleon'},{id:6,n:'Charizard'},
				{id:7,n:'Squirtle'},{id:8,n:'Wartortle'},{id:9,n:'Blastoise'},
				{id:10,n:'Caterpie'},{id:11,n:'Metapod'},{id:12,n:'Butterfree'},
				{id:13,n:'Weedle'},{id:14,n:'Kakuna'},{id:15,n:'Beedrill'},
				{id:16,n:'Pidgey'},{id:17,n:'Pidgeotto'},{id:18,n:'Pidgeot'},
				{id:19,n:'Rattata'},{id:20,n:'Raticate'},{id:21,n:'Spearow'},
				{id:22,n:'Fearow'},{id:23,n:'Ekans'},{id:24,n:'Arbok'},
				{id:25,n:'Pikachu'},{id:26,n:'Raichu'},{id:27,n:'Sandshrew'},
				{id:28,n:'Sandslash'},{id:29,n:'Nidoran♀'},{id:30,n:'Nidorina'},
				{id:31,n:'Nidoqueen'},{id:32,n:'Nidoran♂'},{id:33,n:'Nidorino'},
				{id:34,n:'Nidoking'},{id:35,n:'Clefairy'},{id:36,n:'Clefable'},
				{id:37,n:'Vulpix'},{id:38,n:'Ninetales'},{id:39,n:'Jigglypuff'},
				{id:40,n:'Wigglytuff'},{id:41,n:'Zubat'},{id:42,n:'Golbat'},
				{id:43,n:'Oddish'},{id:44,n:'Gloom'},{id:45,n:'Vileplume'},
				{id:46,n:'Paras'},{id:47,n:'Parasect'},{id:48,n:'Venonat'},
				{id:49,n:'Venomoth'},{id:50,n:'Diglett'},{id:51,n:'Dugtrio'},
				{id:52,n:'Meowth'},{id:53,n:'Persian'},{id:54,n:'Psyduck'},
				{id:55,n:'Golduck'},{id:56,n:'Mankey'},{id:57,n:'Primeape'},
				{id:58,n:'Growlithe'},{id:59,n:'Arcanine'},{id:60,n:'Poliwag'},
				{id:61,n:'Poliwhirl'},{id:62,n:'Poliwrath'},{id:63,n:'Abra'},
				{id:64,n:'Kadabra'},{id:65,n:'Alakazam'},{id:66,n:'Machop'},
				{id:67,n:'Machoke'},{id:68,n:'Machamp'},{id:69,n:'Bellsprout'},
				{id:70,n:'Weepinbell'},{id:71,n:'Victreebel'},{id:72,n:'Tentacool'},
				{id:73,n:'Tentacruel'},{id:74,n:'Geodude'},{id:75,n:'Graveler'},
				{id:76,n:'Golem'},{id:77,n:'Ponyta'},{id:78,n:'Rapidash'},
				{id:79,n:'Slowpoke'},{id:80,n:'Slowbro'},{id:81,n:'Magnemite'},
				{id:82,n:'Magneton'},{id:83,n:"Farfetch'd"},{id:84,n:'Doduo'},
				{id:85,n:'Dodrio'},{id:86,n:'Seel'},{id:87,n:'Dewgong'},
				{id:88,n:'Grimer'},{id:89,n:'Muk'},{id:90,n:'Shellder'},
				{id:91,n:'Cloyster'},{id:92,n:'Gastly'},{id:93,n:'Haunter'},
				{id:94,n:'Gengar'},{id:95,n:'Onix'},{id:96,n:'Drowzee'},
				{id:97,n:'Hypno'},{id:98,n:'Krabby'},{id:99,n:'Kingler'},
				{id:100,n:'Voltorb'},{id:101,n:'Electrode'},{id:102,n:'Exeggcute'},
				{id:103,n:'Exeggutor'},{id:104,n:'Cubone'},{id:105,n:'Marowak'},
				{id:106,n:'Hitmonlee'},{id:107,n:'Hitmonchan'},{id:108,n:'Lickitung'},
				{id:109,n:'Koffing'},{id:110,n:'Weezing'},{id:111,n:'Rhyhorn'},
				{id:112,n:'Rhydon'},{id:113,n:'Chansey'},{id:114,n:'Tangela'},
				{id:115,n:'Kangaskhan'},{id:116,n:'Horsea'},{id:117,n:'Seadra'},
				{id:118,n:'Goldeen'},{id:119,n:'Seaking'},{id:120,n:'Staryu'},
				{id:121,n:'Starmie'},{id:122,n:'Mr. Mime'},{id:123,n:'Scyther'},
				{id:124,n:'Jynx'},{id:125,n:'Electabuzz'},{id:126,n:'Magmar'},
				{id:127,n:'Pinsir'},{id:128,n:'Tauros'},{id:129,n:'Magikarp'},
				{id:130,n:'Gyarados'},{id:131,n:'Lapras'},{id:132,n:'Ditto'},
				{id:133,n:'Eevee'},{id:134,n:'Vaporeon'},{id:135,n:'Jolteon'},
				{id:136,n:'Flareon'},{id:137,n:'Porygon'},{id:138,n:'Omanyte'},
				{id:139,n:'Omastar'},{id:140,n:'Kabuto'},{id:141,n:'Kabutops'},
				{id:142,n:'Aerodactyl'},{id:143,n:'Snorlax'},{id:144,n:'Articuno'},
				{id:145,n:'Zapdos'},{id:146,n:'Moltres'},{id:147,n:'Dratini'},
				{id:148,n:'Dragonair'},{id:149,n:'Dragonite'},{id:150,n:'Mewtwo'},
				{id:151,n:'Mew'},
			];
			function loadData() {
				try { return JSON.parse(localStorage.getItem('pokequiz_dex') || '{"seen":[],"caught":[]}'); }
				catch { return { seen: [], caught: [] }; }
			}
			function saveData(d) { localStorage.setItem('pokequiz_dex', JSON.stringify(d)); }
			function markSeen(id) {
				const d = loadData();
				if (!d.seen.includes(id)) { d.seen.push(id); saveData(d); }
			}
			function markCaught(id) {
				const d = loadData();
				if (!d.seen.includes(id)) d.seen.push(id);
				// Always push — duplicates allowed so you can own multiple of the same species.
				d.caught.push(id);
				saveData(d);
				// Milestones are based on unique species count, not total instances.
				checkMilestones(new Set(d.caught).size);
			}
			function isCaught(id) { return loadData().caught.includes(id); }
			function checkMilestones(n) {
				if (n === 10) { showToast(ico(ICO.book) + ' Pokédex milestone: 10 caught! +20 ' + ico(ICO.token)); const inv=Inventory.load(); inv.tokens=(inv.tokens||0)+20; Inventory.save(inv); }
				if (n === 30) { showToast(ico(ICO.book) + ' Pokédex milestone: 30 caught! +50 ' + ico(ICO.token)); const inv=Inventory.load(); inv.tokens=(inv.tokens||0)+50; Inventory.save(inv); }
				if (n === 60) { showToast(ico(ICO.book) + ' Pokédex milestone: 60 caught! +100 ' + ico(ICO.token)); const inv=Inventory.load(); inv.tokens=(inv.tokens||0)+100; Inventory.save(inv); }
				if (n === 100) { showToast(ico(ICO.achieve) + ' 100 Pokémon caught! Master Trainer!'); Achievements.unlock('dex100'); }
			}
			function open() {
				let panel = document.getElementById('dexPanel');
				if (!panel) {
					panel = document.createElement('div');
					panel.id = 'dexPanel';
					document.body.appendChild(panel);
					panel.addEventListener('pointerdown', () => { panel.hidden = true; });
				}
				panel.hidden = false;
				panel.className = 'pk-backdrop';
				panel.innerHTML = '';
				const inner = document.createElement('div');
				inner.className = 'pk-modal';
				inner.innerHTML = '<div class="pk-modal-head">' +
					'<span class="pk-modal-title">' + ico(ICO.book) + ' POKÉDEX</span>' +
					'<span id="dexCounter" style="font-size:9px;color:var(--pk-muted)"></span>' +
					'<button id="dexClose" class="pk-close" type="button">' + ico(ICO.close) + '</button>' +
					'</div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
				body.style.cssText = 'padding-top:10px';
				const grid = document.createElement('div');
				grid.id = 'dexGrid';
				grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:5px';
				body.appendChild(grid);
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.getElementById('dexClose').addEventListener('click', () => { panel.hidden = true; });
				const data = loadData();
				const counter = document.getElementById('dexCounter');
				const uniqueSpecies = new Set(data.caught).size;
				const totalOwned   = data.caught.length;
				counter.textContent = uniqueSpecies + ' / 151' + (totalOwned > uniqueSpecies ? '  (' + totalOwned + ' total)' : '');
				DEX.forEach(p => {
					const seen = data.seen.includes(p.id);
					const caught = data.caught.includes(p.id);
					const cell = document.createElement('div');
					cell.className = 'pk-dex-cell' + (caught ? ' is-caught' : '');
					cell.title = caught ? p.n : (seen ? '???' : '---');
					const img = document.createElement('img');
					img.style.cssText = 'width:32px;height:32px;image-rendering:pixelated;' + (!seen ? 'filter:brightness(0)' : seen && !caught ? 'filter:brightness(0.25) saturate(0)' : '');
					img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/' + p.id + '.png';
					img.loading = 'lazy';
					const num = document.createElement('div');
					num.className = 'pk-dex-num' + (caught ? ' is-caught' : '');
					num.textContent = '#' + String(p.id).padStart(3,'0');
					cell.appendChild(img);
					cell.appendChild(num);
					grid.appendChild(cell);
				});
			}
			// Returns the raw caught array (may contain duplicate dex IDs — one per owned instance).
			function getCaught() { return loadData().caught; }
			return { markSeen, markCaught, isCaught, getCaught, open };
		})();
	window.CAMP_SYSTEMS.Pokedex = Pokedex;

	// ── CurryCooking ────────────────────────────────────────────────────────
		const CurryCooking = (() => {
			const RECIPES = [
				{ label: ico(ICO.curry) + ' Plain Curry',    ingredients: { pecha: 1 }, desc: '+5 friendship',         effect: (inv) => { inv.friendship = Math.min(100,(inv.friendship||0)+5); } },
				{ label: ico(ICO.curry) + ' Oran Curry',     ingredients: { oran: 1 },  desc: '+15 friendship',        effect: (inv) => { inv.friendship = Math.min(100,(inv.friendship||0)+15); } },
				{ label: ico(ICO.curry) + ' Sitrus Curry',   ingredients: { sitrus: 1 }, desc: '+30 friendship + heal', effect: (inv) => { inv.friendship = Math.min(100,(inv.friendship||0)+30); inv.partnerHp = 100; } },
				{ label: ico(ICO.curry) + ' Mixed Berry Curry', ingredients: { pecha:1, oran:1 }, desc: '+20 friendship + 10 min rhythm boost', effect: (inv) => { inv.friendship = Math.min(100,(inv.friendship||0)+20); if(!inv.boosts) inv.boosts={}; inv.boosts.rhythmBoost = Date.now()+10*60*1000; } },
				{ label: ico(ICO.curry) + ' Spicy Curry',    ingredients: { pecha:2 },  desc: '+10 friendship + fast-grow 15min', effect: (inv) => { inv.friendship = Math.min(100,(inv.friendship||0)+10); if(!inv.boosts) inv.boosts={}; inv.boosts.fastGrow = Date.now()+15*60*1000; } },
			];
			function canMake(recipe) {
				const inv = Inventory.load();
				const bt = inv.berryTypes || {};
				for (const [type, amt] of Object.entries(recipe.ingredients)) {
					if ((bt[type]||0) < amt) return false;
				}
				return true;
			}
			function open() {
				let panel = document.getElementById('curryPanel');
				if (!panel) {
					panel = document.createElement('div');
					panel.id = 'curryPanel';
					panel.style.cssText = 'position:fixed;inset:0;z-index:80;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P",monospace';
					document.body.appendChild(panel);
					panel.addEventListener('pointerdown', e => { if(e.target===panel) panel.hidden=true; });
				}
				panel.hidden = false;
				const inv = Inventory.load();
				const bt = inv.berryTypes || {};
				panel.className = 'pk-backdrop';
				panel.innerHTML = '';
				const inner = document.createElement('div');
				inner.className = 'pk-modal pk-modal-sm';
				inner.innerHTML = '<div class="pk-modal-head">' +
					'<span class="pk-modal-title" style="color:#ff9820">' + ico(ICO.curry) + ' CURRY COOKING</span>' +
					'<button id="curryClose" class="pk-close" style="color:#ff9820" type="button">' + ico(ICO.close) + '</button>' +
					'</div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
				const berryLine = document.createElement('div');
				berryLine.style.cssText = 'font-size:8px;color:#ffc080;margin-bottom:14px;padding:8px 10px;background:rgba(255,136,0,0.08);border-radius:8px;border:1px solid rgba(255,136,0,0.2)';
				berryLine.innerHTML = 'Berries: ' + ico(ICO.berry,'berry-pecha') + (bt.pecha||0) + ' &nbsp;' + ico(ICO.berry,'berry-oran') + (bt.oran||0) + ' &nbsp;' + ico(ICO.berry,'berry-sitrus') + (bt.sitrus||0);
				body.appendChild(berryLine);
				const list = document.createElement('div');
				list.style.cssText = 'display:flex;flex-direction:column;gap:8px';
				RECIPES.forEach((r, i) => {
					const can = canMake(r);
					const ingStr = Object.entries(r.ingredients).map(([k,v]) => v+'× '+k).join(', ');
					const row = document.createElement('div');
					row.className = 'pk-curry-row' + (can ? ' can-make' : '');
					const nm = document.createElement('div');
					nm.className = 'pk-curry-name';
					nm.textContent = r.label;
					const dc = document.createElement('div');
					dc.className = 'pk-curry-desc';
					dc.textContent = r.desc + ' · needs: ' + ingStr;
					row.appendChild(nm);
					row.appendChild(dc);
					if (can) {
						const cookBtn = document.createElement('button');
						cookBtn.dataset.recipe = i;
						cookBtn.type = 'button';
						cookBtn.className = 'pk-btn pk-btn-sm';
						cookBtn.style.cssText = 'background:linear-gradient(180deg,#ff9820,#cc6600);color:#fff;margin-top:6px';
						cookBtn.textContent = 'Cook!';
						row.appendChild(cookBtn);
					}
					list.appendChild(row);
				});
				body.appendChild(list);
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.getElementById('curryClose').addEventListener('click', () => { panel.hidden = true; });
				list.querySelectorAll('[data-recipe]').forEach(btn => {
					btn.addEventListener('click', () => {
						const recipe = RECIPES[parseInt(btn.dataset.recipe)];
						const inv2 = Inventory.load();
						if (!inv2.berryTypes) inv2.berryTypes = {};
						for (const [type, amt] of Object.entries(recipe.ingredients)) {
							inv2.berryTypes[type] = (inv2.berryTypes[type]||0) - amt;
						}
						recipe.effect(inv2);
						Inventory.save(inv2);
						showToast(ico(ICO.curry) + ' ' + recipe.label + ' cooked! ' + recipe.desc);
						Achievements.unlock('chef');
						TrainerLevel.addXP('cook');
						panel.hidden = true;
					});
				});
			}
			return { open };
		})();
	window.CAMP_SYSTEMS.CurryCooking = CurryCooking;

	// ── Amie ────────────────────────────────────────────────────────
		const Amie = (() => {
			let taps = 0, sessionBonus = 0;
			const MAX_SESSION = 10;
			function open() {
				let panel = document.getElementById('amiePanel');
				if (!panel) {
					panel = document.createElement('div');
					panel.id = 'amiePanel';
					panel.style.cssText = 'position:fixed;inset:0;z-index:80;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P",monospace';
					document.body.appendChild(panel);
				}
				taps = 0; sessionBonus = 0;
				panel.hidden = false;
				render(panel);
			}
			function render(panel) {
				panel.className = 'pk-backdrop';
				panel.innerHTML = '';
				const inner = document.createElement('div');
				inner.className = 'pk-modal pk-modal-sm';
				inner.style.textAlign = 'center';
				inner.innerHTML = '<div class="pk-modal-head"><span class="pk-modal-title">' + ico(ICO.play) + ' POKÉMON PLAY</span></div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
				body.innerHTML = '<div id="amieSprite" style="font-size:64px;cursor:pointer;user-select:none;margin:8px 0 4px;display:inline-block;transition:transform 0.1s">🐾</div>' +
					'<div id="amieMsg" style="font-size:9px;color:var(--pk-muted);margin:10px 0 6px;min-height:18px">Tap your partner to play!</div>' +
					'<div id="amieTaps" style="font-size:8px;color:var(--pk-gold);margin-bottom:16px">Taps: 0 / ' + MAX_SESSION + '</div>' +
					'<button id="amieClose" type="button" class="pk-btn pk-btn-dark pk-btn-sm">Done</button>';
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				const sprite = document.getElementById('amieSprite');
				const msg = document.getElementById('amieMsg');
				const tapsEl = document.getElementById('amieTaps');
				const MESSAGES = ['💚','Yay!','Hehe~','Again!','♪','Purrr~','So fun!'];
				sprite.addEventListener('click', () => {
					if (taps >= MAX_SESSION) { msg.textContent = 'I need a rest! Come back later~'; return; }
					taps++;
					sessionBonus++;
					sprite.style.transform = 'scale(1.3)';
					setTimeout(() => { sprite.style.transform = 'scale(1)'; }, 100);
					msg.textContent = MESSAGES[taps % MESSAGES.length];
					tapsEl.textContent = 'Taps: ' + taps + ' / ' + MAX_SESSION;
					if (taps === MAX_SESSION) {
						const inv2 = Inventory.load();
						const bonus = Math.min(sessionBonus, 5);
						inv2.friendship = Math.min(100, (inv2.friendship||0) + bonus);
						Inventory.save(inv2);
						msg.innerHTML = ico(ICO.star) + ' +' + bonus + ' friendship! Session complete!';
						showToast('+' + bonus + ' friendship from playing!');
					}
				});
				document.getElementById('amieClose').addEventListener('click', () => {
					if (sessionBonus > 0 && taps < MAX_SESSION) {
						const inv2 = Inventory.load();
						const bonus = Math.floor(sessionBonus / 2);
						if (bonus > 0) { inv2.friendship = Math.min(100,(inv2.friendship||0)+bonus); Inventory.save(inv2); showToast('+' + bonus + ' friendship!'); }
					}
					panel.hidden = true;
				});
			}
			return { open };
		})();
	window.CAMP_SYSTEMS.Amie = Amie;

	// ── RoomEditor ────────────────────────────────────────────────────────
		const RoomEditor = (() => {
			let openFlag = false;
			let activeScene = 'upstairs';
			let placingKey = null;
			function $(id) { return document.getElementById(id); }
	
			function itemsForScene() {
				return activeScene === 'house' ? HOUSE_ITEMS : ROOM_ITEMS;
			}
	
			function invKeysForScene() {
				return activeScene === 'house'
					? { ownedKey: 'houseRoomItems', placementsKey: 'housePlacements' }
					: { ownedKey: 'roomItems',      placementsKey: 'roomPlacements' };
			}
	
			function liveUpdate() {
				const items = itemsForScene();
				const { placementsKey } = invKeysForScene();
				const inv = Inventory.load();
				const placements = inv.cosmetics?.[placementsKey] || {};
				const scene = activeScene === 'house' ? window.__houseScene : window.__upstairsScene;
				if (!scene || !scene._roomItemObjs) return;
				Object.entries(items).forEach(([key]) => {
					const obj = scene._roomItemObjs[key];
					const pos = placements[key];
					if (obj) {
						if (pos) {
							obj.setPosition(pos.c * 16 + 8, pos.r * 16 + 8);
							obj.setAngle((pos.rot || 0) * 90);
							obj.setVisible(true);
						} else {
							obj.setVisible(false);
						}
					}
				});
			}
	
			function startPlace(key) {
				placingKey = key;
				if (!window.__gridMode) window.__gridMode = {};
				// Preserve existing rotation when moving an already-placed item
				const { placementsKey } = invKeysForScene();
				const existingPos = (Inventory.load().cosmetics?.[placementsKey] || {})[key];
				window.__gridMode.active = true;
				window.__gridMode.key = key;
				window.__gridMode.sceneKey = activeScene;
				window.__gridMode.hoverR = -1;
				window.__gridMode.hoverC = -1;
				window.__gridMode.rot = existingPos?.rot || 0;
				refresh();
			}
	
			function rotateWhilePlacing() {
				if (!window.__gridMode) return;
				window.__gridMode.rot = ((window.__gridMode.rot || 0) + 1) % 4;
				refresh();
			}
	
			function cancelPlace() {
				placingKey = null;
				if (window.__gridMode) window.__gridMode.active = false;
				refresh();
			}
	
			function confirmPlace(r, c) {
				if (!placingKey) return;
				const { ownedKey, placementsKey } = invKeysForScene();
				const i = Inventory.load();
				if (!i.cosmetics) i.cosmetics = {};
				if (!Array.isArray(i.cosmetics[ownedKey])) i.cosmetics[ownedKey] = [];
				if (!i.cosmetics[placementsKey]) i.cosmetics[placementsKey] = {};
				if (!i.cosmetics[ownedKey].includes(placingKey)) i.cosmetics[ownedKey].push(placingKey);
				i.cosmetics[placementsKey][placingKey] = { r, c, rot: window.__gridMode?.rot ?? 0 };
				Inventory.save(i);
				cancelPlace();
				liveUpdate();
				refresh();
				// Achievement: place 5+ furniture pieces
				const allPlacements = Object.assign({}, i.cosmetics.roomPlacements || {}, i.cosmetics.housePlacements || {});
				if (Object.keys(allPlacements).length >= 5) Achievements.unlock('decorator');
			}
	
			function refresh() {
				const list = $('creItemList');
				if (!list) return;
				const items = itemsForScene();
				const { ownedKey, placementsKey } = invKeysForScene();
				const inv = Inventory.load();
				const cosm = inv.cosmetics || {};
				const roomItems = cosm[ownedKey] || [];
				const placements = cosm[placementsKey] || {};
				const tokens = inv.tokens || 0;
	
				const tokEl = $('creTokens');
				if (tokEl) tokEl.textContent = tokens;
	
				const sceneLbl = $('creSceneLabel');
				if (sceneLbl) sceneLbl.innerHTML = activeScene === 'house' ? ico(ICO.house) + ' Ground Floor' : ico(ICO.house) + ' Bedroom';
	
				const placedCount = Object.keys(placements).filter(k => items[k]).length;
				const ownedCount  = roomItems.filter(k => items[k]).length;
				const summaryEl = $('creSummary');
				if (summaryEl) summaryEl.textContent = ownedCount + ' / ' + Object.keys(items).length + ' owned · ' + placedCount + ' placed';
	
				const banner = $('crePlacingBanner');
				if (banner) {
					if (placingKey) {
						const item = items[placingKey];
						banner.hidden = false;
						const lbl = banner.querySelector('.cre-placing-label');
						if (lbl) lbl.innerHTML = 'Click a tile to place ' + (item?.icoKey ? ico(ICO[item.icoKey]||item.icoKey)+' ' : '') + (item?.label || '');
					} else {
						banner.hidden = true;
					}
				}
	
				list.innerHTML = '';
				const cats = { furniture: [], decor: [] };
				Object.entries(items).forEach(([key, item]) => {
					(item.cat === 'decor' ? cats.decor : cats.furniture).push([key, item]);
				});
				const catLabels = { furniture: ico(ICO.game) + ' Furniture', decor: ico(ICO.sparkle) + ' Decor' };
	
				Object.entries(cats).forEach(([cat, entries]) => {
					if (!entries.length) return;
					const hdr = document.createElement('div');
					hdr.className = 'cre-cat-header';
					hdr.textContent = catLabels[cat];
					list.appendChild(hdr);
	
					entries.forEach(([key, item]) => {
						const owned    = roomItems.includes(key);
						const pos      = placements[key];
						const placed   = !!pos;
						const isPlacing = placingKey === key;
						const canAfford = tokens >= item.price;
	
						const card = document.createElement('div');
						card.className = 'cre-item' +
							(isPlacing ? ' cre-item--placing' : placed ? ' cre-item--active' : owned ? ' cre-item--owned' : '');
	
						const left = document.createElement('div');
						left.className = 'cre-item-left';
						// Pixel-art sprite for the item — falls back to emoji span if the
						// design isn't registered (keeps layout intact for any new item).
						const emojiEl = FurnitureSprites.makeIcon(key, 32);
						emojiEl.className = 'cre-item-emoji';
						const infoEl = document.createElement('div');
						infoEl.className = 'cre-item-info';
						const labelEl = document.createElement('div');
						labelEl.className = 'cre-item-label';
						labelEl.textContent = item.label.replace(/^\S+\s/, '');
						const statusEl = document.createElement('div');
						statusEl.className = 'cre-item-status' +
							(isPlacing ? ' cre-item-status--placing' : placed ? ' cre-item-status--active' : !owned ? ' cre-item-status--price' : '');
						statusEl.textContent = isPlacing ? '\u2196 Click a tile\u2026' : placed ? '\u2713 Placed' : owned ? 'In inventory' : item.price + ' \U0001f4b0';
						infoEl.appendChild(labelEl);
						infoEl.appendChild(statusEl);
						left.appendChild(emojiEl);
						left.appendChild(infoEl);
	
						const right = document.createElement('div');
						right.className = 'cre-item-right';
	
						if (isPlacing) {
							const rotBtn = document.createElement('button');
							rotBtn.className = 'cre-btn cre-btn--rotate';
							rotBtn.type = 'button';
							const rotDeg = ((window.__gridMode?.rot || 0) * 90);
							rotBtn.title = rotDeg + '°';
							rotBtn.textContent = '↻ ' + rotDeg + '°';
							rotBtn.addEventListener('click', rotateWhilePlacing);
							const cancelBtn = document.createElement('button');
							cancelBtn.className = 'cre-btn cre-btn--cancel';
							cancelBtn.type = 'button';
							cancelBtn.textContent = 'Cancel';
							cancelBtn.addEventListener('click', cancelPlace);
							right.appendChild(rotBtn);
							right.appendChild(cancelBtn);
						} else if (placed) {
							const rotateBtn = document.createElement('button');
							rotateBtn.className = 'cre-btn cre-btn--rotate';
							rotateBtn.type = 'button';
							const rotDeg = ((pos?.rot || 0) * 90);
							rotateBtn.title = rotDeg + '°';
							rotateBtn.textContent = '↻';
							rotateBtn.addEventListener('click', () => {
								const i = Inventory.load();
								if (!i.cosmetics?.[placementsKey]?.[key]) return;
								i.cosmetics[placementsKey][key].rot = ((i.cosmetics[placementsKey][key].rot || 0) + 1) % 4;
								Inventory.save(i);
								liveUpdate(); refresh();
							});
							const moveBtn = document.createElement('button');
							moveBtn.className = 'cre-btn cre-btn--activate';
							moveBtn.type = 'button';
							moveBtn.textContent = 'Move';
							moveBtn.addEventListener('click', () => startPlace(key));
							const removeBtn = document.createElement('button');
							removeBtn.className = 'cre-btn cre-btn--remove';
							removeBtn.type = 'button';
							removeBtn.textContent = '\u2715 Remove';
							removeBtn.addEventListener('click', () => {
								const i = Inventory.load();
								if (!i.cosmetics) i.cosmetics = {};
								if (!i.cosmetics[placementsKey]) i.cosmetics[placementsKey] = {};
								delete i.cosmetics[placementsKey][key];
								Inventory.save(i);
								liveUpdate(); refresh();
							});
							right.appendChild(rotateBtn);
							right.appendChild(moveBtn);
							right.appendChild(removeBtn);
						} else if (owned) {
							const placeBtn = document.createElement('button');
							placeBtn.className = 'cre-btn cre-btn--activate';
							placeBtn.type = 'button';
							placeBtn.textContent = 'Place';
							placeBtn.addEventListener('click', () => startPlace(key));
							right.appendChild(placeBtn);
						} else {
							const buyBtn = document.createElement('button');
							buyBtn.className = 'cre-btn cre-btn--buy';
							buyBtn.type = 'button';
							buyBtn.textContent = 'Buy';
							buyBtn.disabled = !canAfford;
							buyBtn.addEventListener('click', () => {
								const i = Inventory.load();
								if ((i.tokens || 0) < item.price) return;
								i.tokens -= item.price;
								if (!i.cosmetics) i.cosmetics = {};
								if (!Array.isArray(i.cosmetics[ownedKey])) i.cosmetics[ownedKey] = [];
								i.cosmetics[ownedKey].push(key);
								Inventory.save(i);
								liveUpdate(); refresh();
								startPlace(key);
							});
							right.appendChild(buyBtn);
						}
	
						card.appendChild(left);
						card.appendChild(right);
						list.appendChild(card);
					});
				});
			}
	
			function open() {
				const panel = $('campRoomEditor');
				if (!panel) return;
				panel.hidden = false;
				openFlag = true;
				refresh();
			}
	
			function close() {
				cancelPlace();
				const panel = $('campRoomEditor');
				if (panel) panel.hidden = true;
				openFlag = false;
			}
	
			function isOpen() { return openFlag; }
	
			function showEditBtn(show, sceneKey) {
				if (show && sceneKey) activeScene = sceneKey;
				const btn = $('campRoomEditBtn');
				if (btn) btn.hidden = !show;
				if (!show) close();
			}
	
			function wire() {
				const btn = $('campRoomEditBtn');
				if (btn && !btn.dataset.wired) {
					btn.dataset.wired = '1';
					btn.addEventListener('click', () => openFlag ? close() : open());
				}
				const closeBtn = $('creClose');
				if (closeBtn && !closeBtn.dataset.wired) {
					closeBtn.dataset.wired = '1';
					closeBtn.addEventListener('click', close);
				}
			}
	
			if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
			else wire();
	
			return { open, close, isOpen, showEditBtn, liveUpdate, confirmPlace, wire };
		})();
	window.CAMP_SYSTEMS.RoomEditor = RoomEditor;

	// ── BerryBreeding ────────────────────────────────────────────────────────
		const BerryBreeding = (() => {
			const BREED_RECIPES = {
				'pecha+pecha':  { name: 'Gold Pecha',  friendship: 30, effect: 'rhythm-boost-5min',  cost: 2, icon: '🍬', key: 'goldPecha'  },
				'oran+oran':    { name: 'Gold Oran',   friendship: 50, effect: null,                  cost: 2, icon: '🫐', key: 'goldOran'   },
				'sitrus+sitrus':{ name: 'Gold Sitrus', friendship: 70, effect: 'fast-grow-20min',     cost: 2, icon: '🍋', key: 'goldSitrus' },
				'pecha+oran':   { name: 'Mago Berry',  friendship: 35, effect: null,                  cost: 1, icon: '🍑', key: 'magoBerry'  },
				'oran+sitrus':  { name: 'Lum Berry',   friendship: 45, effect: 'fast-grow-10min',     cost: 1, icon: '🍈', key: 'lumBerry'   },
				'pecha+sitrus': { name: 'Salac Berry', friendship: 40, effect: 'rhythm-boost-10min',  cost: 1, icon: '🍓', key: 'salacBerry' },
			};
			const BERRY_LABELS = { pecha: 'Pecha', oran: 'Oran', sitrus: 'Sitrus' };
			const BERRY_KEYS = ['pecha', 'oran', 'sitrus'];
	
			function getBerryCount(inv, type) {
				if (type === 'pecha') return inv.friendshipBerries || 0;
				if (type === 'oran') return inv.oranBerries || 0;
				if (type === 'sitrus') return inv.sitrusBerries || 0;
				return 0;
			}
			function deductBerry(inv, type, amount) {
				if (type === 'pecha') inv.friendshipBerries = Math.max(0, (inv.friendshipBerries || 0) - amount);
				else if (type === 'oran') inv.oranBerries = Math.max(0, (inv.oranBerries || 0) - amount);
				else if (type === 'sitrus') inv.sitrusBerries = Math.max(0, (inv.sitrusBerries || 0) - amount);
			}
	
			function open() {
				const existing = document.getElementById('berryBreedPanel');
				if (existing) { existing.remove(); return; }
				const panel = document.createElement('div');
				panel.id = 'berryBreedPanel';
				panel.className = 'pk-backdrop';
				panel.style.zIndex = '130';
				const inner = document.createElement('div');
				inner.className = 'pk-modal';
				inner.style.cssText = 'max-width:380px;width:min(380px,94vw)';
	
				function buildPanel() {
					const inv = Inventory.load();
					const gb = inv.goldBerries || {};
					let leftSel = 'pecha', rightSel = 'pecha';
	
					function getRecipe(l, r) {
						return BREED_RECIPES[l + '+' + r] || BREED_RECIPES[r + '+' + l] || null;
					}
	
					function renderHTML() {
						const recipe = getRecipe(leftSel, rightSel);
						const inv2 = Inventory.load();
						const lCount = getBerryCount(inv2, leftSel);
						const rCount = getBerryCount(inv2, rightSel);
						let canBrew = false;
						let previewHTML = '<div style="font-size:8px;color:var(--pk-muted);padding:8px 0">No recipe for this combination.</div>';
						if (recipe) {
							const needLeft = leftSel === rightSel ? recipe.cost : 1;
							const needRight = leftSel === rightSel ? 0 : 1;
							canBrew = lCount >= needLeft && (leftSel === rightSel || rCount >= needRight);
							const effectLabel = recipe.effect ? ('<br><span style="font-size:6px;color:#88ccff">' + recipe.effect.replace(/-/g,' ') + '</span>') : '';
							previewHTML = '<div style="text-align:center;padding:6px 0">' +
								'<div style="font-size:20px;margin-bottom:4px">' + recipe.icon + '</div>' +
								'<div style="font-size:8px;color:var(--pk-gold)">' + recipe.name + '</div>' +
								'<div style="font-size:7px;color:#50dd88">+' + recipe.friendship + ' friendship' + effectLabel + '</div>' +
								'<div style="font-size:6px;color:var(--pk-muted);margin-top:2px">Cost: ' + needLeft + ' ' + BERRY_LABELS[leftSel] + (leftSel !== rightSel ? ' + 1 ' + BERRY_LABELS[rightSel] : '') + '</div>' +
							'</div>';
						}
						const storedHTML = Object.keys(gb).length > 0
							? '<div style="margin-top:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:8px"><div style="font-size:7px;color:var(--pk-muted);margin-bottom:4px">Stored Gold Berries:</div>' +
								Object.entries(gb).filter(([,v]) => v > 0).map(([k,v]) => {
									const rec = Object.values(BREED_RECIPES).find(r => r.key === k);
									return '<div style="display:flex;align-items:center;gap:6px;padding:3px 0">' +
										'<span style="font-size:12px">' + (rec?.icon || '🍓') + '</span>' +
										'<span style="font-size:7px;color:#e8eaf0">' + (rec?.name || k) + ' ×' + v + '</span>' +
										'<button class="pk-btn pk-btn-gold pk-btn-sm" data-use-berry="' + k + '" style="margin-left:auto" type="button">Use</button>' +
									'</div>';
								}).join('') + '</div>'
							: '';
						return '<div class="pk-modal-head">' +
							'<span class="pk-modal-title">🌿 BERRY LAB</span>' +
							'<button class="pk-close" id="berryBreedClose" type="button">' + ico(ICO.close) + '</button>' +
							'</div>' +
							'<div class="pk-modal-body">' +
								'<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:10px">' +
									'<div>' +
										'<div style="font-size:7px;color:var(--pk-muted);margin-bottom:4px">Left Berry</div>' +
										'<select id="breedLeft" style="width:100%;padding:4px;background:#1a2848;color:#e8eaf0;border:1px solid rgba(246,200,76,0.3);border-radius:6px;font-size:7px">' +
											BERRY_KEYS.map(b => '<option value="' + b + '"' + (b === leftSel ? ' selected' : '') + '>' + BERRY_LABELS[b] + ' (×' + getBerryCount(inv2, b) + ')</option>').join('') +
										'</select>' +
									'</div>' +
									'<div style="font-size:16px;color:var(--pk-muted)">+</div>' +
									'<div>' +
										'<div style="font-size:7px;color:var(--pk-muted);margin-bottom:4px">Right Berry</div>' +
										'<select id="breedRight" style="width:100%;padding:4px;background:#1a2848;color:#e8eaf0;border:1px solid rgba(246,200,76,0.3);border-radius:6px;font-size:7px">' +
											BERRY_KEYS.map(b => '<option value="' + b + '"' + (b === rightSel ? ' selected' : '') + '>' + BERRY_LABELS[b] + ' (×' + getBerryCount(inv2, b) + ')</option>').join('') +
										'</select>' +
									'</div>' +
								'</div>' +
								'<div id="breedPreview" style="background:rgba(0,0,0,0.2);border-radius:8px;padding:6px;margin-bottom:10px">' + previewHTML + '</div>' +
								'<button id="breedBtn" class="pk-btn pk-btn-gold pk-btn-full"' + (canBrew ? '' : ' disabled') + ' type="button">🧪 Brew!</button>' +
								storedHTML +
							'</div>';
					}
	
					inner.innerHTML = renderHTML();
					inner.addEventListener('pointerdown', e => e.stopPropagation());
					document.getElementById('berryBreedClose')?.addEventListener('click', () => panel.remove());
	
					function rewire() {
						const lEl = document.getElementById('breedLeft');
						const rEl = document.getElementById('breedRight');
						const brewBtn = document.getElementById('breedBtn');
						if (lEl) lEl.addEventListener('change', () => { leftSel = lEl.value; inner.innerHTML = renderHTML(); rewire(); });
						if (rEl) rEl.addEventListener('change', () => { rightSel = rEl.value; inner.innerHTML = renderHTML(); rewire(); });
						if (brewBtn) brewBtn.addEventListener('click', () => {
							const recipe = getRecipe(leftSel, rightSel);
							if (!recipe) return;
							const inv3 = Inventory.load();
							const needLeft = leftSel === rightSel ? recipe.cost : 1;
							if (getBerryCount(inv3, leftSel) < needLeft) { showToast('Not enough ' + BERRY_LABELS[leftSel] + '!'); return; }
							if (leftSel !== rightSel && getBerryCount(inv3, rightSel) < 1) { showToast('Not enough ' + BERRY_LABELS[rightSel] + '!'); return; }
							deductBerry(inv3, leftSel, needLeft);
							if (leftSel !== rightSel) deductBerry(inv3, rightSel, 1);
							if (!inv3.goldBerries) inv3.goldBerries = {};
							inv3.goldBerries[recipe.key] = (inv3.goldBerries[recipe.key] || 0) + 1;
							Inventory.save(inv3);
							showToast(recipe.icon + ' Brewed ' + recipe.name + '!');
							inner.innerHTML = renderHTML();
							rewire();
						});
						inner.querySelectorAll('[data-use-berry]').forEach(btn2 => {
							btn2.addEventListener('click', () => {
								const bkey = btn2.dataset.useBerry;
								const rec2 = Object.values(BREED_RECIPES).find(r => r.key === bkey);
								if (!rec2) return;
								const inv4 = Inventory.load();
								if (!inv4.goldBerries || !(inv4.goldBerries[bkey] > 0)) { showToast('None left!'); return; }
								inv4.goldBerries[bkey] -= 1;
								inv4.friendship = Math.min(FRIENDSHIP_MAX, (inv4.friendship || 0) + rec2.friendship);
								if (!inv4.boosts) inv4.boosts = {};
								if (rec2.effect === 'rhythm-boost-5min') inv4.boosts.rhythmBoost = Math.max(inv4.boosts.rhythmBoost || 0, Date.now() + 5*60*1000);
								else if (rec2.effect === 'rhythm-boost-10min') inv4.boosts.rhythmBoost = Math.max(inv4.boosts.rhythmBoost || 0, Date.now() + 10*60*1000);
								else if (rec2.effect === 'fast-grow-10min') inv4.boosts.fastGrow = Math.max(inv4.boosts.fastGrow || 0, Date.now() + 10*60*1000);
								else if (rec2.effect === 'fast-grow-20min') inv4.boosts.fastGrow = Math.max(inv4.boosts.fastGrow || 0, Date.now() + 20*60*1000);
								Inventory.save(inv4);
								showToast(rec2.icon + ' Used ' + rec2.name + '! +' + rec2.friendship + ' friendship');
								inner.innerHTML = renderHTML();
								rewire();
							});
						});
						document.getElementById('berryBreedClose')?.addEventListener('click', () => panel.remove());
					}
					rewire();
				}
	
				panel.appendChild(inner);
				document.body.appendChild(panel);
				panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
				buildPanel();
			}
			return { open };
		})();
	window.CAMP_SYSTEMS.BerryBreeding = BerryBreeding;

	// ── NotifBell ────────────────────────────────────────────────────────
		const NotifBell = (() => {
			function check() {
				const msgs = [];
				const inv = Inventory.load();
				// 1. Ripe berries
				try {
					const plantsRaw = localStorage.getItem('pokequiz_camp_plants');
					if (plantsRaw) {
						const _plants = JSON.parse(plantsRaw);
						const effMs = typeof getEffectiveGrowMs === 'function' ? getEffectiveGrowMs() : 30000;
						const ripe = _plants.filter(p => p && (Date.now() - (p.plantedAt||0)) >= effMs);
						if (ripe.length > 0) msgs.push(ico(ICO.berry) + ' ' + ripe.length + ' ripe berr' + (ripe.length === 1 ? 'y' : 'ies') + ' ready!');
					}
				} catch(_) {}
				// 2. Daily quests incomplete
				try {
					const dq = inv.dailyQuests;
					const today = new Date().toISOString().slice(0,10);
					if (!dq || dq.date !== today || !dq.claimed) {
						const QUEST_IDS = ['feed','harvest','market','rhythm','fish','minigame'];
						const progress = (dq && dq.date === today) ? (dq.progress || {}) : {};
						const incomplete = QUEST_IDS.filter(id => (progress[id] || 0) < 1).length;
						if (incomplete > 0) msgs.push(ico(ICO.quest) + ' ' + incomplete + ' daily quest' + (incomplete === 1 ? '' : 's') + ' remaining');
					}
				} catch(_) {}
				// 3. Egg hatching >80%
				try {
					if (inv.egg && inv.egg.steps != null) {
						const pct = Math.min(100, Math.round((inv.egg.steps / 256) * 100));
						if (pct >= 80) msgs.push(ico(ICO.egg) + ' Egg almost ready! (' + pct + '%)');
					}
				} catch(_) {}
				// 4. Mystery gift available
				try {
					const today2 = new Date().toISOString().slice(0,10);
					const mgKey = 'pokequiz_mystery_gift_' + today2;
					if (!localStorage.getItem(mgKey)) msgs.push(ico(ICO.gift) + ' Mystery Gift available!');
				} catch(_) {}
				// 5. Daily bonus not claimed
				try {
					if (typeof Daily !== 'undefined' && Daily.ready()) msgs.push(ico(ICO.star) + ' Daily bonus ready!');
				} catch(_) {}
				return msgs;
			}
			function updateBadge() {
				const badge = document.getElementById('campNotifBadge');
				if (!badge) return;
				const msgs = check();
				if (msgs.length > 0) {
					badge.textContent = msgs.length;
					badge.hidden = false;
				} else {
					badge.hidden = true;
				}
			}
			function open() {
				const existing = document.getElementById('notifDropdown');
				if (existing) { existing.remove(); return; }
				const msgs = check();
				const btn = document.getElementById('campNotifBtn');
				const dropdown = document.createElement('div');
				dropdown.id = 'notifDropdown';
				dropdown.style.cssText = 'position:absolute;top:44px;right:8px;z-index:200;background:rgba(10,14,28,0.97);border:1px solid rgba(246,200,76,0.28);border-radius:8px;padding:8px 12px;min-width:220px;max-width:280px;box-shadow:0 8px 24px rgba(0,0,0,0.5)';
				if (msgs.length === 0) {
					dropdown.innerHTML = '<div style="font-size:7px;color:var(--pk-muted);padding:4px 0">No notifications right now!</div>';
				} else {
					dropdown.innerHTML = msgs.map(m => '<div style="font-size:7px;color:#e8eaf0;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.06)">' + m + '</div>').join('');
				}
				const campWrap = document.getElementById('campWrap') || document.body;
				campWrap.appendChild(dropdown);
				function dismiss(e) {
					if (!dropdown.contains(e.target) && e.target !== btn) {
						dropdown.remove();
						document.removeEventListener('click', dismiss, true);
					}
				}
				setTimeout(() => document.addEventListener('click', dismiss, true), 0);
			}
			function init() {
				const btn = document.getElementById('campNotifBtn');
				if (btn) btn.addEventListener('click', () => open());
				updateBadge();
				setInterval(updateBadge, 30000);
			}
			if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
			else init();
			return { check, updateBadge, open };
		})();
	window.CAMP_SYSTEMS.NotifBell = NotifBell;

	// ── PCBox ────────────────────────────────────────────────────────
		const PCBox = (() => {
			const PARTY_MAX = 6;
	
			// Resolve a display name from a form value (string eeveelution or numeric dex ID).
			function formName(form) {
				const EEV = {eevee:'Eevee',vaporeon:'Vaporeon',espeon:'Espeon',umbreon:'Umbreon',
					flareon:'Flareon',jolteon:'Jolteon',leafeon:'Leafeon',glaceon:'Glaceon',sylveon:'Sylveon'};
				if (typeof form === 'string') return EEV[form] || form;
				if (typeof form === 'number') return (typeof PMD_NAMES !== 'undefined' && PMD_NAMES[form]) || ('#' + form);
				return String(form);
			}
	
			// Initialise / migrate save data and return inventory.
			function load() {
				const inv = Inventory.load();
				// Migrate legacy pcBox → party + pcStorage
				if (inv.pcBox && !inv.party) {
					inv.party = inv.pcBox.slice();
					inv.partyActive = inv.pcBoxActive || 0;
					delete inv.pcBox;
					delete inv.pcBoxActive;
				}
				if (!inv.party) {
					inv.party = [{
						form: inv.eeveeForm || 'eevee',
						name: formName(inv.eeveeForm || 'eevee'),
						nickname: '',
						friendship: inv.friendship || 0,
						since: inv.partnerSince || Date.now(),
					}];
				}
				if (!inv.pcStorage) inv.pcStorage = [];
				if (inv.partyActive == null) inv.partyActive = 0;
				const filled = inv.party.filter(Boolean).length;
				if (inv.partyActive >= filled) inv.partyActive = Math.max(0, filled - 1);
				Inventory.save(inv);
				return inv;
			}
	
			function open() {
				const inv = load();
				let panel = document.getElementById('pcBoxPanel');
				if (!panel) {
					panel = document.createElement('div');
					panel.id = 'pcBoxPanel';
					document.body.appendChild(panel);
					panel.addEventListener('pointerdown', e => { if (e.target === panel) panel.hidden = true; });
				}
				panel.hidden = false;
				render(panel, inv);
			}
	
			function render(panel, inv) {
				const party      = inv.party || [];
				const pc         = inv.pcStorage || [];
				const activeIdx  = inv.partyActive || 0;
				panel.className  = 'pk-backdrop';
				panel.innerHTML  = '';
				const inner = document.createElement('div');
				inner.className  = 'pk-modal';
				inner.style.cssText = 'max-width:460px;width:min(460px,94vw)';
				inner.innerHTML  =
					'<div class="pk-modal-head">' +
					'<span class="pk-modal-title">' + ico(ICO.pc) + ' PARTY &amp; PC</span>' +
					'<button id="pcBoxClose" class="pk-close" type="button">' + ico(ICO.close) + '</button>' +
					'</div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
	
				// ── Party ──────────────────────────────────────────────
				const partyHead = document.createElement('div');
				partyHead.style.cssText = 'font-size:8px;color:var(--pk-gold);margin-bottom:8px;letter-spacing:1px';
				partyHead.innerHTML = ico(ICO.npc) + ' PARTY &nbsp;<span style="color:var(--pk-muted);font-size:7px">' +
					party.filter(Boolean).length + ' / ' + PARTY_MAX + '</span>';
				body.appendChild(partyHead);
	
				const partyGrid = document.createElement('div');
				partyGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:16px';
				for (let i = 0; i < PARTY_MAX; i++) {
					const slot = party[i];
					const card = document.createElement('div');
					card.className = 'pk-box-slot' + (slot && i === activeIdx ? ' is-active' : '');
					card.style.minHeight = '60px';
					if (slot) {
						const dn = formName(slot.form);
						const shown = slot.nickname || dn;
						card.innerHTML =
							'<div class="pk-box-slot-name">' + (i === activeIdx ? ico(ICO.star) + ' ' : '') + shown + '</div>' +
							'<div class="pk-box-slot-sub" style="font-size:6px;color:var(--pk-muted)">' +
								(slot.nickname ? dn + ' · ' : '') + '&#9829; ' + (slot.friendship || 0) +
							'</div>';
						if (i === activeIdx) {
							card.innerHTML += '<div style="font-size:7px;color:var(--pk-green);margin-top:4px">Walking partner</div>';
						} else {
							const btnRow = document.createElement('div');
							btnRow.style.cssText = 'display:flex;gap:4px;margin-top:6px;flex-wrap:wrap';
							const walkBtn = document.createElement('button');
							walkBtn.type = 'button'; walkBtn.className = 'pk-btn pk-btn-gold pk-btn-xs';
							walkBtn.textContent = 'Walk'; walkBtn.dataset.action = 'walk'; walkBtn.dataset.idx = i;
							btnRow.appendChild(walkBtn);
							if (party.filter(Boolean).length > 1) {
								const pcBtn = document.createElement('button');
								pcBtn.type = 'button'; pcBtn.className = 'pk-btn pk-btn-xs';
								pcBtn.style.cssText = 'background:rgba(255,255,255,0.06);color:var(--pk-muted)';
								pcBtn.textContent = '→ PC'; pcBtn.dataset.action = 'toPC'; pcBtn.dataset.idx = i;
								btnRow.appendChild(pcBtn);
							}
							card.appendChild(btnRow);
						}
					} else {
						card.innerHTML = '<div style="font-size:7px;color:var(--pk-faint);text-align:center;padding:16px 0">—</div>';
					}
					partyGrid.appendChild(card);
				}
				body.appendChild(partyGrid);
	
				// ── PC Storage ─────────────────────────────────────────
				const pcHead = document.createElement('div');
				pcHead.style.cssText = 'font-size:8px;color:var(--pk-muted);margin-bottom:8px;letter-spacing:1px;' +
					'border-top:1px solid var(--pk-border);padding-top:12px';
				pcHead.innerHTML = ico(ICO.pc) + ' PC STORAGE &nbsp;<span style="font-size:7px">(' + pc.length + ')</span>';
				body.appendChild(pcHead);
	
				if (!pc.length) {
					const emp = document.createElement('div');
					emp.style.cssText = 'font-size:7px;color:var(--pk-faint);text-align:center;padding:8px 0';
					emp.textContent = 'PC is empty';
					body.appendChild(emp);
				} else {
					const pcList = document.createElement('div');
					pcList.style.cssText = 'display:flex;flex-direction:column;gap:4px;max-height:180px;overflow-y:auto';
					pc.forEach((slot, pcIdx) => {
						if (!slot) return;
						const row = document.createElement('div');
						row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;' +
							'padding:6px 8px;border:1px solid var(--pk-border);border-radius:var(--pk-radius-sm);' +
							'background:rgba(255,255,255,0.02)';
						const dn = formName(slot.form);
						row.innerHTML =
							'<div>' +
							'<div style="font-size:7px;color:var(--pk-text)">' + (slot.nickname || dn) +
								(slot.nickname ? ' <span style="color:var(--pk-faint);font-size:6px">(' + dn + ')</span>' : '') + '</div>' +
							'<div style="font-size:6px;color:var(--pk-muted)">&#9829; ' + (slot.friendship || 0) + '</div>' +
							'</div>';
						const partyFull = party.filter(Boolean).length >= PARTY_MAX;
						const ab = document.createElement('button');
						ab.type = 'button'; ab.className = 'pk-btn pk-btn-gold pk-btn-xs';
						ab.textContent = partyFull ? '⇄ Swap' : '→ Party';
						ab.dataset.action = partyFull ? 'swap' : 'toParty';
						ab.dataset.pcIdx = pcIdx;
						row.appendChild(ab);
						pcList.appendChild(row);
					});
					body.appendChild(pcList);
				}
	
				// Wonder Trade
				const wt = document.createElement('button');
				wt.type = 'button'; wt.className = 'pk-btn pk-btn-blue pk-btn-full pk-btn-sm';
				wt.style.marginTop = '12px';
				wt.innerHTML = ico(ICO.trade) + ' Wonder Trade';
				wt.addEventListener('click', () => WonderTrade.open());
				body.appendChild(wt);
	
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.getElementById('pcBoxClose').addEventListener('click', () => { panel.hidden = true; });
	
				// Party button delegation
				partyGrid.addEventListener('click', e => {
					const btn = e.target.closest('[data-action]');
					if (!btn) return;
					const inv2 = load();
					const action = btn.dataset.action;
					const idx = parseInt(btn.dataset.idx);
					if (action === 'walk') {
						const prev = inv2.party[inv2.partyActive || 0];
						if (prev) prev.friendship = inv2.friendship || 0;
						inv2.partyActive = idx;
						const ns = inv2.party[idx];
						if (ns) {
							inv2.companionForm = ns.form;
							inv2.eeveeForm = typeof ns.form === 'string' ? ns.form : (inv2.eeveeForm || 'eevee');
							inv2.friendship = ns.friendship || 0;
							inv2.partnerSince = ns.since || Date.now();
						}
						Inventory.save(inv2);
						window.__campScene?._switchFollower(ns?.form ?? 'eevee', { silent: true });
						showToast(ico(ICO.npc) + ' ' + (ns?.nickname || formName(ns?.form)) + ' is walking with you!');
					} else if (action === 'toPC') {
						if (inv2.party.filter(Boolean).length <= 1) { showToast('Cannot remove last party member!'); return; }
						const [moved] = inv2.party.splice(idx, 1);
						if ((inv2.partyActive || 0) >= idx && inv2.partyActive > 0) inv2.partyActive--;
						const active = inv2.party[inv2.partyActive || 0];
						if (active) {
							inv2.companionForm = active.form;
							inv2.eeveeForm = typeof active.form === 'string' ? active.form : (inv2.eeveeForm || 'eevee');
						}
						inv2.pcStorage = inv2.pcStorage || [];
						inv2.pcStorage.push(moved);
						Inventory.save(inv2);
						showToast(ico(ICO.pc) + ' ' + (moved?.nickname || formName(moved?.form)) + ' moved to PC.');
						if (idx === activeIdx) window.__campScene?._switchFollower(active?.form ?? 'eevee', { silent: true });
					}
					render(panel, Inventory.load());
				});
	
				// PC button delegation
				body.addEventListener('click', e => {
					const btn = e.target.closest('[data-action][data-pc-idx]');
					if (!btn) return;
					const inv2 = load();
					const pcIdx2 = parseInt(btn.dataset.pcIdx);
					const action = btn.dataset.action;
					const pcSlot = (inv2.pcStorage || [])[pcIdx2];
					if (!pcSlot) return;
					if (action === 'toParty') {
						if ((inv2.party || []).filter(Boolean).length >= PARTY_MAX) { showToast('Party full! Swap first.'); return; }
						inv2.pcStorage.splice(pcIdx2, 1);
						inv2.party.push(pcSlot);
						Inventory.save(inv2);
						showToast(ico(ICO.npc) + ' ' + (pcSlot.nickname || formName(pcSlot.form)) + ' added to party!');
					} else if (action === 'swap') {
						const ai = inv2.partyActive || 0;
						const cur = inv2.party[ai];
						if (cur) cur.friendship = inv2.friendship || 0;
						inv2.pcStorage[pcIdx2] = cur;
						inv2.party[ai] = pcSlot;
						inv2.companionForm = pcSlot.form;
						inv2.eeveeForm = typeof pcSlot.form === 'string' ? pcSlot.form : (inv2.eeveeForm || 'eevee');
						inv2.friendship = pcSlot.friendship || 0;
						inv2.partnerSince = pcSlot.since || Date.now();
						Inventory.save(inv2);
						window.__campScene?._switchFollower(pcSlot.form, { silent: true });
						showToast(ico(ICO.trade) + ' ' + (pcSlot.nickname || formName(pcSlot.form)) + ' swapped into party!');
					}
					render(panel, Inventory.load());
				});
			}
	
			// Called after catching — routes to party (if room) or PC (overflow).
			function addToBox(pkmnData) {
				const inv = load();
				const party = inv.party || [];
				if (party.filter(Boolean).length < PARTY_MAX) {
					party.push(pkmnData);
					inv.party = party;
					Inventory.save(inv);
					showToast(ico(ICO.npc) + ' ' + (pkmnData.nickname || formName(pkmnData.form)) + ' joined your party!');
				} else {
					inv.pcStorage = inv.pcStorage || [];
					inv.pcStorage.push(pkmnData);
					Inventory.save(inv);
					showToast(ico(ICO.pc) + ' Party full! ' + (pkmnData.nickname || formName(pkmnData.form)) + ' sent to PC.');
				}
				return true;
			}
	
			return { open, addToBox, load, formName };
		})();
	window.CAMP_SYSTEMS.PCBox = PCBox;

	// ── WonderTrade ────────────────────────────────────────────────────────
		const WonderTrade = (() => {
			const TRADE_POOL = [
				{ form:'eevee',    name:'Eevee',         friendship:20 },
				{ form:'vaporeon', name:'Vaporeon',       friendship:50 },
				{ form:'flareon',  name:'Flareon',        friendship:50 },
				{ form:'jolteon',  name:'Jolteon',        friendship:50 },
				{ form:'leafeon',  name:'Leafeon',        friendship:50 },
				{ form:'espeon',   name:'Espeon',         friendship:50 },
				{ form:'umbreon',  name:'Umbreon',        friendship:50 },
				{ form:'eevee',    name:'Mystery Eevee',  friendship:80 },
			];
			function open() {
				// Build trade list from PC storage + non-active party slots.
				const inv = PCBox.load();
				const party     = inv.party || [];
				const pc        = inv.pcStorage || [];
				const activeIdx = inv.partyActive || 0;
				// Tradeable = PC entries + non-active party slots
				const tradeable = [
					...pc.map((s, i)    => ({ source:'pc',    idx: i, slot: s })),
					...party.map((s, i) => s && i !== activeIdx ? { source:'party', idx: i, slot: s } : null)
						.filter(Boolean),
				];
				if (!tradeable.length) { showToast('Nothing to trade! Put a Pokémon in the PC first.'); return; }
				let panel = document.getElementById('wonderTradePanel');
				if (!panel) {
					panel = document.createElement('div');
					panel.id = 'wonderTradePanel';
					document.body.appendChild(panel);
					panel.addEventListener('pointerdown', e => { if (e.target === panel) panel.hidden = true; });
				}
				panel.hidden = false;
				panel.className = 'pk-backdrop';
				panel.innerHTML = '';
				const inner = document.createElement('div');
				inner.className = 'pk-modal pk-modal-sm';
				inner.innerHTML =
					'<div class="pk-modal-head">' +
					'<span class="pk-modal-title" style="color:#88aaff">' + ico(ICO.trade) + ' WONDER TRADE</span>' +
					'<button id="wtClose" class="pk-close" style="color:#88aaff" type="button">' + ico(ICO.close) + '</button>' +
					'</div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
				const intro = document.createElement('div');
				intro.style.cssText = 'font-size:8px;color:var(--pk-muted);margin-bottom:14px';
				intro.textContent = 'Trade a Pokémon for a mystery partner!';
				body.appendChild(intro);
				const list = document.createElement('div');
				list.style.cssText = 'display:flex;flex-direction:column;gap:6px';
				tradeable.forEach((entry, ti) => {
					const { slot } = entry;
					const row = document.createElement('div');
					row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;' +
						'padding:8px 10px;border:1px solid var(--pk-border);border-radius:var(--pk-radius-sm);background:rgba(255,255,255,0.03)';
					const dn = PCBox.formName(slot.form);
					row.innerHTML =
						'<div>' +
						'<div style="font-size:8px;color:var(--pk-text)">' + (slot.nickname || dn) +
						'<span style="color:var(--pk-faint);font-size:7px"> (' + dn + ')</span></div>' +
						'<div style="font-size:7px;color:var(--pk-muted)">&#9829; ' + (slot.friendship || 0) +
						(entry.source === 'party' ? ' &nbsp;<span style="color:var(--pk-muted)">party</span>' : '') + '</div>' +
						'</div>';
					const tradeBtn = document.createElement('button');
					tradeBtn.dataset.ti = ti;
					tradeBtn.type = 'button';
					tradeBtn.className = 'pk-btn pk-btn-blue pk-btn-xs';
					tradeBtn.textContent = 'Trade';
					row.appendChild(tradeBtn);
					list.appendChild(row);
				});
				body.appendChild(list);
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.getElementById('wtClose').addEventListener('click', () => { panel.hidden = true; });
				list.querySelectorAll('[data-ti]').forEach(btn => {
					btn.addEventListener('click', () => {
						const ti = parseInt(btn.dataset.ti);
						const entry = tradeable[ti];
						const inv2 = PCBox.load();
						const received = TRADE_POOL[Math.floor(Math.random() * TRADE_POOL.length)];
						const receivedEntry = { form: received.form, name: received.name, nickname: received.name, friendship: received.friendship, since: Date.now() };
						if (entry.source === 'pc') {
							inv2.pcStorage.splice(entry.idx, 1);
							inv2.pcStorage.push(receivedEntry);
						} else {
							inv2.party.splice(entry.idx, 1);
							if ((inv2.partyActive || 0) > entry.idx) inv2.partyActive--;
							inv2.party.push(receivedEntry);
						}
						Inventory.save(inv2);
						panel.hidden = true;
						showToast(ico(ICO.trade) + ' Got ' + received.name + ' in return!');
						Achievements.unlock('wonderTrade');
					});
				});
			}
			return { open };
		})();
	window.CAMP_SYSTEMS.WonderTrade = WonderTrade;

	// ── CampRating ────────────────────────────────────────────────────────
		const CampRating = (() => {
			function calculate() {
				const inv = Inventory.load();
				let score = 0;
				const placements = Object.keys({
					...(inv.cosmetics?.roomPlacements || {}),
					...(inv.cosmetics?.housePlacements || {}),
				}).length;
				score += Math.min(2, Math.floor(placements / 2));
				const plants = Plants.load();
				if (plants.length >= 2) score += 1;
				const boxSize = (inv.pcBox || []).length;
				if (boxSize >= 3) score += 1;
				if ((inv.friendship || 0) >= 80) score += 1;
				const stars = Math.min(5, Math.max(1, score));
				return stars;
			}
	
			function getAwayMultiplier() {
				const stars = calculate();
				return 1 + (stars - 1) * 0.2; // 1.0× at ★1, up to 1.8× at ★5
			}
	
			function displayOnGate() {
				const stars = calculate();
				const el = document.getElementById('campRatingGate');
				if (el) {
					let html = '';
					for (let i = 1; i <= 5; i++) {
						html += '<span class="star' + (i > stars ? ' empty' : '') + '">' +
							(i <= stars ? '★' : '☆') + '</span>';
					}
					el.innerHTML = html;
					el.title = stars + '-Star Camp';
				}
				if (stars === 5) Achievements.unlock('fiveStarCamp');
				return stars;
			}
	
			return { calculate, getAwayMultiplier, displayOnGate };
		})();
	window.CAMP_SYSTEMS.CampRating = CampRating;

	// ── CampfireStories ────────────────────────────────────────────────────────
		const CampfireStories = (() => {
			const STORIES = [
				{ title:'The Legend of Ho-Oh', pages:[
					"Long ago, when Pokémon and humans first learned to live together...",
					"A great fire burned in the mountains of Johto.",
					"From the flames rose Ho-Oh, its wings spanning the sky.",
					"It left behind three sacred beasts — Entei, Raikou, and Suicune.",
					"They say on a clear evening you can still see Ho-Oh's rainbow trail.",
				]},
				{ title:"Eevee's Secret", pages:[
					"It is said that Eevee holds more potential than any Pokémon alive.",
					"Its DNA is uniquely irregular — able to adapt to any environment.",
					"In old stories, a trainer once befriended an Eevee deep in a forest.",
					"By sharing every adventure, the Eevee found its truest form...",
					"Not from a stone — but from the unbreakable bond between two hearts.",
				]},
				{ title:'The Wandering Snorlax', pages:[
					"Travelers in Kanto once reported a mountain that snored.",
					"It wasn't a mountain. It was Snorlax — the biggest of its kind.",
					"For seven days it slept across Route 12, blocking all passage.",
					"Only the Poké Flute could stir it... and even then, just barely.",
					"They say it went back to sleep in the forest. It's still there.",
				]},
				{ title:'The Old Man and the Magikarp', pages:[
					"An old fisherman sat at the same lake every day for thirty years.",
					"Every day, he caught only Magikarp. He never once complained.",
					"'The water knows patience,' he would say.",
					"On his last fishing day, his line went taut with impossible weight.",
					"A giant Gyarados leaped from the lake and bowed its head.",
					"It was his oldest Magikarp — finally evolved. Old friends at last.",
				]},
				{ title:'The Celestial Tower', pages:[
					"In Unova stands a tower where Pokémon go when they have passed.",
					"Trainers ring the bell at the top to honor them.",
					"The bell's tone carries for miles — some say it reaches the sky.",
					"On foggy nights, small lights circle the tower.",
					"The locals don't fear them. 'They're just saying hello,' they say.",
				]},
				{ title:'Mew and the Sea', pages:[
					"Before maps existed, Mew swam every ocean on Earth.",
					"It carried a copy of every Pokémon's DNA in its tiny body.",
					"Scientists call it a myth. But sailors still leave out offerings.",
					"A pink ripple seen at dawn. A giggle on the wind.",
					"Mew hasn't forgotten anyone. It never does.",
				]},
			];
	
			function getWeather() {
				try { return window.__campScene?.isRaining ? 'rain' : 'clear'; } catch { return 'clear'; }
			}
	
			function getStoryForToday() {
				const month = new Date().getMonth();
				const day   = Math.floor(Date.now() / 86400000);
				// Seasonal overrides
				if (month === 11 || month === 0 || month === 1) return STORIES[4]; // winter → tower
				if (month >= 2 && month <= 4)  return STORIES[1]; // spring → eevee
				if (getWeather() === 'rain')   return STORIES[2]; // rain → snorlax
				return STORIES[day % STORIES.length];
			}
	
			function open() {
				const story = getStoryForToday();
				let page = 0;
				let panel = document.getElementById('storyPanel');
				if (!panel) {
					panel = document.createElement('div');
					panel.id = 'storyPanel';
					document.body.appendChild(panel);
				}
				panel.hidden = false;
	
				function render() {
					panel.className = 'pk-backdrop';
					panel.innerHTML = '';
					const inner = document.createElement('div');
					inner.className = 'pk-modal pk-modal-sm';
					inner.style.textAlign = 'center';
					inner.innerHTML = '<div class="pk-modal-head">' +
						'<span class="pk-modal-title" style="color:#f0c860">' + ico(ICO.bookOpen) + ' ' + story.title.toUpperCase() + '</span>' +
						'</div>';
					const body = document.createElement('div');
					body.className = 'pk-modal-body';
					body.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:14px';
	
					const fire = document.createElement('div');
					fire.style.cssText = 'font-size:28px';
					fire.innerHTML = ico(ICO.fire, 'campfire-ico');
	
					const text = document.createElement('div');
					text.style.cssText = 'font-size:8px;color:var(--pk-text);line-height:1.9;min-height:56px;text-align:center;padding:0 8px;max-width:300px';
					text.textContent = story.pages[page];
	
					const pageNum = document.createElement('div');
					pageNum.style.cssText = 'font-size:7px;color:var(--pk-faint)';
					pageNum.textContent = (page+1) + ' / ' + story.pages.length;
	
					const btns = document.createElement('div');
					btns.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center';
	
					if (page < story.pages.length - 1) {
						const next = document.createElement('button');
						next.className = 'pk-btn pk-btn-gold pk-btn-sm';
						next.textContent = 'Next ▶';
						next.addEventListener('click', () => { page++; render(); });
						btns.appendChild(next);
					} else {
						const done = document.createElement('button');
						done.className = 'pk-btn pk-btn-green pk-btn-sm';
						done.innerHTML = ico(ICO.check) + ' The End';
						done.addEventListener('click', () => {
							panel.hidden = true;
							const inv = Inventory.load();
							inv.tokens = (inv.tokens||0) + 5;
							Inventory.save(inv);
							showToast(ico(ICO.bookOpen) + ' Story complete! +5 ' + ico(ICO.token));
							Achievements.unlock('storytime');
							TrainerLevel.addXP('quest');
						});
						btns.appendChild(done);
					}
	
					const skip = document.createElement('button');
					skip.className = 'pk-btn pk-btn-dark pk-btn-sm';
					skip.textContent = 'Close';
					skip.addEventListener('click', () => { panel.hidden = true; });
					btns.appendChild(skip);
	
					body.appendChild(fire);
					body.appendChild(text);
					body.appendChild(pageNum);
					body.appendChild(btns);
					inner.appendChild(body);
					panel.appendChild(inner);
					inner.addEventListener('pointerdown', e => e.stopPropagation());
				}
				render();
			}
	
			return { open };
		})();
	window.CAMP_SYSTEMS.CampfireStories = CampfireStories;

	// ── BerryCompost ────────────────────────────────────────────────────────
		const BerryCompost = (() => {
			const COST = 3;
			function canMake() { return (Inventory.load().friendshipBerries || 0) >= COST; }
			function hasCompost() { return (Inventory.load().boosts?.compost || 0) > 0; }
	
			function make() {
				if (!canMake()) { showToast('Need ' + COST + ' berries to compost!'); return; }
				const inv = Inventory.load();
				inv.friendshipBerries -= COST;
				if (!inv.boosts) inv.boosts = {};
				inv.boosts.compost = (inv.boosts.compost || 0) + 1;
				Inventory.save(inv);
				TrainerLevel.addXP('compost');
				Achievements.unlock('composted');
				showToast(ico(ICO.compost) + ' Compost made! Next planting grows 50% faster.');
			}
	
			function applyOnPlant(inv) {
				// Called when planting to consume a compost charge, boosting grow speed
				if ((inv.boosts?.compost || 0) > 0) {
					inv.boosts.compost -= 1;
					if (!inv.boosts) inv.boosts = {};
					// fast-grow for 30 minutes
					inv.boosts.fastGrow = Math.max(inv.boosts.fastGrow || 0, Date.now() + 30 * 60 * 1000);
					showToast(ico(ICO.compost) + ' Compost applied! Faster growth for 30 min.');
				}
			}
	
			function openPanel() {
				let panel = document.getElementById('compostPanel');
				if (!panel) {
					panel = document.createElement('div');
					panel.id = 'compostPanel';
					document.body.appendChild(panel);
					panel.addEventListener('pointerdown', e => { if(e.target===panel) panel.hidden=true; });
				}
				panel.hidden = false;
				render(panel);
			}
	
			function render(panel) {
				const inv = Inventory.load();
				const berries = inv.friendshipBerries || 0;
				const charges = inv.boosts?.compost || 0;
				panel.className = 'pk-backdrop';
				panel.innerHTML = '';
				const inner = document.createElement('div');
				inner.className = 'pk-modal pk-modal-sm';
				inner.innerHTML = '<div class="pk-modal-head">' +
					'<span class="pk-modal-title" style="color:#7ec860">' + ico(ICO.compost) + ' COMPOSTING</span>' +
					'<button id="compostClose" class="pk-close" style="color:#7ec860" type="button">' + ico(ICO.close) + '</button>' +
					'</div>';
				const body = document.createElement('div');
				body.className = 'pk-modal-body';
				body.style.cssText = 'display:flex;flex-direction:column;gap:12px';
	
				const info = document.createElement('div');
				info.style.cssText = 'font-size:8px;color:var(--pk-text);padding:10px;background:rgba(126,200,96,0.08);border:1px solid rgba(126,200,96,0.25);border-radius:8px';
				info.innerHTML = ico(ICO.berry) + ' Berries: <strong>' + berries + '</strong><span class="hud-sep"></span>' + ico(ICO.compost) + ' Compost charges: <strong>' + charges + '</strong>';
	
				const desc = document.createElement('div');
				desc.style.cssText = 'font-size:7px;color:var(--pk-muted);line-height:1.7';
				desc.textContent = 'Combine ' + COST + ' berries into compost. Compost is automatically used on your next planting, giving 50% faster growth for 30 minutes.';
	
				const btn = document.createElement('button');
				btn.className = 'pk-btn pk-btn-green pk-btn-full pk-btn-sm';
				btn.disabled = !canMake();
				btn.innerHTML = canMake() ? ico(ICO.compost) + ' Make Compost (' + COST + ' ' + ico(ICO.berry) + ' → 1 charge)' : 'Not enough berries (' + berries + '/' + COST + ')';
				btn.addEventListener('click', () => {
					make();
					render(panel);
				});
	
				body.appendChild(info);
				body.appendChild(desc);
				body.appendChild(btn);
				inner.appendChild(body);
				panel.appendChild(inner);
				inner.addEventListener('pointerdown', e => e.stopPropagation());
				document.getElementById('compostClose')?.addEventListener('click', () => { panel.hidden = true; });
			}
	
			return { canMake, hasCompost, make, applyOnPlant, openPanel };
		})();
	window.CAMP_SYSTEMS.BerryCompost = BerryCompost;

	// ── getPartnerPassive ────────────────────────────────────────────────────────
		function getPartnerPassive() {
			const inv = Inventory.load();
			const form = inv.eeveeForm || 'eevee';
			const ts = inv.tutorSkills || [];
			return {
				fishingBonus:       form === 'vaporeon',
				rhythmTokenBonus:   form === 'flareon' ? 1 : 0,
				rhythmSpeedPenalty: form === 'jolteon' ? 0.85 : 1.0,
				growSpeedBonus:     form === 'leafeon' ? 0.3 : 0,
				questRewardBonus:   form === 'espeon' ? 3 : 0,
				dailyCooldownMult:  form === 'umbreon' ? 0.85 : 1.0,
				tutorBerryBonus:    ts.includes('powerHerb') ? 5 : 0,
				tutorFishBonus:     ts.includes('lureExpert'),
				tutorRhythmBonus:   ts.includes('rhythmEar') ? 2 : 0,
				tutorGrowBonus:     ts.includes('growthBoost') ? 0.5 : 0,
			};
		}
	window.CAMP_SYSTEMS.getPartnerPassive = getPartnerPassive;

	// ── DailyQuests ────────────────────────────────────────────────────────
		const DailyQuests = (() => {
			const QUESTS = [
				{ id: 'feed',     label: 'Feed partner 3×',      goal: 3,  reward: 10, icoKey: 'berry'  },
				{ id: 'harvest',  label: 'Harvest a berry',       goal: 1,  reward: 8,  icoKey: 'seed'   },
				{ id: 'market',   label: 'Visit the marketplace', goal: 1,  reward: 12, icoKey: 'cart'   },
				{ id: 'rhythm',   label: 'Win a rhythm battle',   goal: 1,  reward: 15, icoKey: 'music'  },
				{ id: 'fish',     label: 'Catch a fish',          goal: 1,  reward: 10, icoKey: 'fish'   },
				{ id: 'minigame', label: 'Win any wild battle',   goal: 1,  reward: 8,  icoKey: 'game'   },
			];
			function todayKey() { return new Date().toISOString().slice(0, 10); }
			function load() {
				const inv = Inventory.load();
				const today = todayKey();
				if (!inv.dailyQuests || inv.dailyQuests.date !== today) {
					inv.dailyQuests = { date: today, progress: {}, claimed: false };
					Inventory.save(inv);
				}
				return inv.dailyQuests;
			}
			function increment(id) {
				const inv = Inventory.load();
				const dq = load();
				dq.progress[id] = (dq.progress[id] || 0) + 1;
				inv.dailyQuests = dq;
				Inventory.save(inv);
				refresh();
				if (!dq.claimed && QUESTS.every(q => (dq.progress[q.id] || 0) >= q.goal)) {
					claimBonus();
				}
			}
			function claimBonus() {
				const inv = Inventory.load();
				const pp = typeof getPartnerPassive === 'function' ? getPartnerPassive() : { questRewardBonus: 0 };
				const totalReward = QUESTS.reduce((s, q) => s + q.reward, 0) + (pp.questRewardBonus || 0) * QUESTS.length;
				inv.tokens = (inv.tokens || 0) + totalReward;
				inv.dailyQuests.claimed = true;
				Inventory.save(inv);
				const bonusEl = document.getElementById('questBonus');
				if (bonusEl) bonusEl.innerHTML = ico(ICO.check) + ' All done! +' + totalReward + ' tokens claimed!';
				showToast(ico(ICO.check) + ' Daily quests done! +' + totalReward + ' tokens!');
				TrainerLevel.addXP('quest');
				Achievements.unlock('questStreak');
			}
			function refresh() {
				const panel = document.getElementById('questPanel');
				if (!panel || panel.hidden) return;
				const dq = load();
				const dateEl = document.getElementById('questDate');
				if (dateEl) dateEl.textContent = dq.date;
				const list = document.getElementById('questList');
				if (!list) return;
				list.innerHTML = '';
				QUESTS.forEach(q => {
					const prog = Math.min(q.goal, dq.progress[q.id] || 0);
					const done = prog >= q.goal;
					const row = document.createElement('div');
					row.className = 'pk-quest-row' + (done ? ' is-done' : '');
					const lbl = document.createElement('div');
					lbl.className = 'pk-quest-label' + (done ? ' is-done' : '');
					lbl.innerHTML = (done ? ico(ICO.check) + ' ' : (q.icoKey ? ico(ICO[q.icoKey] || q.icoKey) + ' ' : '')) + q.label;
					const prog_el = document.createElement('div');
					prog_el.className = 'pk-quest-prog';
					prog_el.innerHTML = prog + ' / ' + q.goal + ' &nbsp;· +' + q.reward + ' ' + ico(ICO.token);
					row.appendChild(lbl);
					row.appendChild(prog_el);
					list.appendChild(row);
				});
				const bonusEl = document.getElementById('questBonus');
				if (bonusEl && dq.claimed) bonusEl.innerHTML = ico(ICO.check) + ' All done! Rewards claimed.';
			}
			function open() {
				const panel = document.getElementById('questPanel');
				if (panel) { panel.hidden = false; refresh(); }
			}
			function close() {
				const panel = document.getElementById('questPanel');
				if (panel) panel.hidden = true;
			}
			function wire() {
				const btn = document.getElementById('questClose');
				if (btn && !btn.dataset.wired) { btn.dataset.wired = '1'; btn.addEventListener('click', close); }
			}
			if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
			else wire();
			return { open, close, increment, refresh };
		})();
	window.CAMP_SYSTEMS.DailyQuests = DailyQuests;

})();
