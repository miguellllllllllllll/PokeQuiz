// Palette-swap recolouring of the Calem trainer sprite sheet.
// Exposes window.TrainerPalette for camp.js + profile-page.js.
(function () {
	'use strict';

	const KEY = 'pokequiz_trainer_palette';

	// Base palette ladders from Pictures/sprites/calem.png — darkest → lightest.
	// MAIN is the shade that maps directly to the user's chosen swatch.
	const BASE = {
		cap:     ['#701028', '#784040', '#C03838', '#F06848'],
		skin:    ['#885028', '#D09870', '#D8A078', '#F8D0B8'],
		hair:    ['#28272C', '#424149'],
		outfit:  ['#1F2945', '#354775', '#4F69AE'],
		shirt:   ['#B8B0D0', '#E8E8F8'],
		pants:   ['#384040'],
		goggles: ['#406888', '#66847B'],
	};
	const MAIN_IDX = { cap: 2, skin: 2, hair: 1, outfit: 1, shirt: 0, pants: 0, goggles: 0 };

	const DEFAULTS = {
		cap:     '#C03838',
		skin:    '#D8A078',
		hair:    '#424149',
		outfit:  '#354775',
		shirt:   '#B8B0D0',
		pants:   '#384040',
		goggles: '#406888',
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

	// Build a Map<u24, [r,g,b]> from original sheet colour → recoloured value.
	// Algorithm: per-channel additive delta from the BASE main shade — exact at
	// the chosen colour, shifted by the same offset for shadow/highlight shades.
	function buildColourMap(choices) {
		const map = new Map();
		for (const cat of Object.keys(BASE)) {
			const ladder = BASE[cat];
			const mainRgb = hexToRgb(ladder[MAIN_IDX[cat]]);
			const chosenRgb = hexToRgb(choices[cat] || DEFAULTS[cat]);
			for (let i = 0; i < ladder.length; i++) {
				const o = hexToRgb(ladder[i]);
				const nr = Math.max(0, Math.min(255, chosenRgb[0] + (o[0] - mainRgb[0])));
				const ng = Math.max(0, Math.min(255, chosenRgb[1] + (o[1] - mainRgb[1])));
				const nb = Math.max(0, Math.min(255, chosenRgb[2] + (o[2] - mainRgb[2])));
				map.set((o[0]<<16) | (o[1]<<8) | o[2], [nr, ng, nb]);
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
		for (let i = 0; i < px.length; i += 4) {
			if (px[i+3] === 0) continue;
			const key = (px[i]<<16) | (px[i+1]<<8) | px[i+2];
			const m = map.get(key);
			if (m) { px[i] = m[0]; px[i+1] = m[1]; px[i+2] = m[2]; }
		}
		dstCtx.putImageData(id, 0, 0);
	}

	window.TrainerPalette = { BASE, MAIN_IDX, DEFAULTS, KEY, load, save, recolor };
})();
