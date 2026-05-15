// Palette-swap recolouring of the Calem trainer sprite sheet.
// Exposes window.TrainerPalette for camp.js + profile-page.js.
(function () {
	'use strict';

	const KEY = 'pokequiz_trainer_palette';
	const FRAME_H = 38;

	// Base palette ladders from Pictures/sprites/calem.png — darkest → lightest.
	// MAIN is the shade that maps directly to the user's chosen swatch.
	// Entries may be a hex string or { color, yMin?, yMax? } where the bounds
	// are frame-local Y (0..FRAME_H-1) — used to avoid recolouring pixels of
	// shared shades that belong to other body parts.
	const BASE = {
		cap: [
			{ color: '#701028', yMax: 19 },
			{ color: '#C03838', yMax: 17 },
			{ color: '#F06848', yMax: 17 },
		],
		skin:    ['#885028', '#D09870', '#D8A078', '#F8D0B8'],
		hair: [
			{ color: '#28272C', yMax: 21 },
			{ color: '#424149', yMax: 21 },
		],
		eyes:    [{ color: '#384040', yMax: 19 }],
		outfit:  ['#1F2945', '#354775', '#4F69AE'],
		shirt:   ['#B8B0D0', '#E8E8F8'],
		pants:   [{ color: '#384040', yMin: 25 }],
		goggles: [{ color: '#66847B', yMax: 19 }],
	};
	const MAIN_IDX = { cap: 1, skin: 2, hair: 1, eyes: 0, outfit: 1, shirt: 0, pants: 0, goggles: 0 };

	const DEFAULTS = {
		cap:     '#C03838',
		skin:    '#D8A078',
		hair:    '#424149',
		eyes:    '#384040',
		outfit:  '#354775',
		shirt:   '#B8B0D0',
		pants:   '#384040',
		goggles: '#66847B',
	};

	function hexToRgb(hex) {
		const n = parseInt(hex.replace('#',''), 16);
		return [(n>>16)&255, (n>>8)&255, n&255];
	}

	function load() {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
		} catch {}
		return Object.assign({}, DEFAULTS);
	}
	function save(choices) {
		try { localStorage.setItem(KEY, JSON.stringify(choices)); } catch {}
	}

	// Build a Map<u24, [{rgb, yMin, yMax}]> from original sheet colour → list of
	// candidate recolour rules (one per category that lists this shade). Algorithm:
	// per-channel additive delta from the BASE main shade — exact at the chosen
	// colour, shifted by the same offset for shadow/highlight shades.
	function buildColourMap(choices) {
		const map = new Map();
		for (const cat of Object.keys(BASE)) {
			const ladder = BASE[cat];
			const mainEntry = ladder[MAIN_IDX[cat]];
			const mainColor = typeof mainEntry === 'string' ? mainEntry : mainEntry.color;
			const mainRgb = hexToRgb(mainColor);
			const chosenRgb = hexToRgb(choices[cat] || DEFAULTS[cat]);
			for (let i = 0; i < ladder.length; i++) {
				const entry = ladder[i];
				const color = typeof entry === 'string' ? entry : entry.color;
				const yMin = (typeof entry === 'string') ? 0 : (entry.yMin ?? 0);
				const yMax = (typeof entry === 'string') ? Infinity : (entry.yMax ?? Infinity);
				const o = hexToRgb(color);
				const nr = Math.max(0, Math.min(255, chosenRgb[0] + (o[0] - mainRgb[0])));
				const ng = Math.max(0, Math.min(255, chosenRgb[1] + (o[1] - mainRgb[1])));
				const nb = Math.max(0, Math.min(255, chosenRgb[2] + (o[2] - mainRgb[2])));
				const key = (o[0]<<16) | (o[1]<<8) | o[2];
				const rule = { rgb: [nr, ng, nb], yMin, yMax };
				const list = map.get(key);
				if (list) list.push(rule); else map.set(key, [rule]);
			}
		}
		return map;
	}

	// Write recoloured pixels of srcImage into dstCtx (must be same dimensions).
	function recolor(srcImage, choices, dstCtx) {
		const w = srcImage.width, h = srcImage.height;
		dstCtx.imageSmoothingEnabled = false;
		dstCtx.clearRect(0, 0, w, h);
		dstCtx.drawImage(srcImage, 0, 0);
		const id = dstCtx.getImageData(0, 0, w, h);
		const px = id.data;
		const map = buildColourMap(choices);
		for (let i = 0, idx = 0; i < px.length; i += 4, idx++) {
			if (px[i+3] === 0) continue;
			const key = (px[i]<<16) | (px[i+1]<<8) | px[i+2];
			const rules = map.get(key);
			if (!rules) continue;
			const y = (idx / w) | 0;
			const frameY = y % FRAME_H;
			for (let r = 0; r < rules.length; r++) {
				const rule = rules[r];
				if (frameY >= rule.yMin && frameY <= rule.yMax) {
					px[i] = rule.rgb[0]; px[i+1] = rule.rgb[1]; px[i+2] = rule.rgb[2];
					break;
				}
			}
		}
		dstCtx.putImageData(id, 0, 0);
	}

	window.TrainerPalette = { BASE, MAIN_IDX, DEFAULTS, KEY, load, save, recolor };
})();
