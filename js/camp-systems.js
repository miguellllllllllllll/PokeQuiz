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

})();
