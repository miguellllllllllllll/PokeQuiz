// Palette-swap recolouring of the Calem trainer sprite sheet.
// Exposes window.TrainerPalette for camp.js + profile-page.js.
(function () {
	'use strict';

	const KEY = 'pokequiz_trainer_palette';
	const BODY_KEY = 'pokequiz_trainer_body';
	const FRAME_H = 38;
	const FRAME_W = 22;

	// Base palette ladders from Pictures/sprites/calem.png — darkest → lightest.
	// MAIN is the shade that maps directly to the user's chosen swatch.
	// Entries may be a hex string or { color, yMin?, yMax?, xMin?, xMax? } where
	// the bounds are frame-local pixel coords (0..FRAME_W-1 / 0..FRAME_H-1) —
	// used to avoid recolouring pixels of shared shades that belong to other
	// body parts.
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
		gogglesFrame: [{ color: '#384040', yMax: 18 }],
		// Two pupil pixels per eye, isolated by xMin/xMax + yMin/yMax — these are
		// the four black-outline pixels at (8,22), (13,22), (8,23), (13,23).
		eyes: [
			{ color: '#000000', xMin: 8,  xMax: 8,  yMin: 22, yMax: 23 },
			{ color: '#000000', xMin: 13, xMax: 13, yMin: 22, yMax: 23 },
		],
		// Sclera: the four white-ish pixels flanking the pupils. These share their
		// hex with the shirt palette, so without a more-specific rule the Shirt
		// picker would recolour them. Pinning them to a hidden category with main
		// = default keeps their delta at zero, so they stay at their natural shade
		// while the rest of the shirt pixels still respond to the Shirt picker.
		__sclera: [
			{ color: '#B8B0D0', xMin: 7,  xMax: 7,  yMin: 22, yMax: 22 },
			{ color: '#B8B0D0', xMin: 14, xMax: 14, yMin: 22, yMax: 22 },
			{ color: '#E8E8F8', xMin: 7,  xMax: 7,  yMin: 23, yMax: 23 },
			{ color: '#E8E8F8', xMin: 14, xMax: 14, yMin: 23, yMax: 23 },
		],
		outfit:  ['#1F2945', '#354775', '#4F69AE'],
		outfitTrim: [{ color: '#784040', yMin: 17 }],
		shirt:   ['#B8B0D0', '#E8E8F8'],
		pants:   [{ color: '#384040', yMin: 25 }],
		shoes:   [{ color: '#406888', yMin: 24 }],
		goggles: [{ color: '#66847B', yMax: 19 }],
	};
	const MAIN_IDX = { cap: 1, skin: 2, hair: 1, gogglesFrame: 0, eyes: 0, __sclera: 0, outfit: 1, outfitTrim: 0, shirt: 0, pants: 0, shoes: 0, goggles: 0 };

	const DEFAULTS = {
		cap:          '#C03838',
		skin:         '#D8A078',
		hair:         '#424149',
		gogglesFrame: '#384040',
		eyes:         '#000000',
		__sclera:     '#B8B0D0',
		outfit:       '#354775',
		outfitTrim:   '#784040',
		shirt:        '#B8B0D0',
		pants:        '#384040',
		shoes:        '#406888',
		goggles:      '#66847B',
	};

	// Body-style variants: each is a pixel pre-pass on the source sheet
	// (applied per-frame, frame-local coords) before the palette swap runs.
	// Mods rewrite hex colours so the existing palette ladder still applies.
	const BODIES = {
		classic: { label: 'Classic', mod: null },
		hood: {
			label: 'Hood',
			// Recolour the side/back hair pixels into the cap shade, so the cap
			// appears to extend down as a hood.
			mod: function (fx, fy, hex) {
				if (hex !== '#28272C' && hex !== '#424149') return null;
				// Sides of the head + back of the neck.
				if (fy >= 11 && fy <= 22 && (fx <= 4 || fx >= 17)) {
					return hex === '#28272C' ? '#701028' : '#C03838';
				}
				return null;
			},
		},
		bare: {
			label: 'No Goggles',
			// Replace goggles frame + lens pixels with the source skin shade so
			// the skin palette swap colours them. The pupil/sclera pixels are
			// pinned by xMin/xMax in the BASE map so they stay put.
			mod: function (fx, fy, hex) {
				if (fy < 16 || fy > 23) return null;
				if (hex === '#384040' || hex === '#66847B') return '#D8A078';
				return null;
			},
		},
	};
	const BODY_IDS = Object.keys(BODIES);

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
	function loadBody() {
		try {
			const raw = localStorage.getItem(BODY_KEY);
			if (raw && BODIES[raw]) return raw;
		} catch {}
		return 'classic';
	}
	function saveBody(id) {
		try { localStorage.setItem(BODY_KEY, BODIES[id] ? id : 'classic'); } catch {}
	}

	function rgbToHex(r, g, b) {
		return '#' + ((1<<24) | (r<<16) | (g<<8) | b).toString(16).slice(1).toUpperCase();
	}

	// Build a Map<u24, [{rgb, yMin, yMax}]> from original sheet colour → list of
	// candidate recolour rules (one per category that lists this shade). Algorithm:
	// per-channel additive delta from the BASE main shade — exact at the chosen
	// colour, shifted by the same offset for shadow/highlight shades.
	// Smaller (xRange * yRange) = more specific; sorted ascending so specific rules
	// win when their pixel matches before wider rules get a chance.
	function specificity(rule) {
		const xr = rule.xMax === Infinity ? 1e9 : (rule.xMax - rule.xMin);
		const yr = rule.yMax === Infinity ? 1e9 : (rule.yMax - rule.yMin);
		return xr * yr;
	}

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
				const isStr = typeof entry === 'string';
				const color = isStr ? entry : entry.color;
				const yMin = isStr ? 0 : (entry.yMin ?? 0);
				const yMax = isStr ? Infinity : (entry.yMax ?? Infinity);
				const xMin = isStr ? 0 : (entry.xMin ?? 0);
				const xMax = isStr ? Infinity : (entry.xMax ?? Infinity);
				const o = hexToRgb(color);
				const nr = Math.max(0, Math.min(255, chosenRgb[0] + (o[0] - mainRgb[0])));
				const ng = Math.max(0, Math.min(255, chosenRgb[1] + (o[1] - mainRgb[1])));
				const nb = Math.max(0, Math.min(255, chosenRgb[2] + (o[2] - mainRgb[2])));
				const key = (o[0]<<16) | (o[1]<<8) | o[2];
				const rule = { rgb: [nr, ng, nb], yMin, yMax, xMin, xMax };
				const list = map.get(key);
				if (list) list.push(rule); else map.set(key, [rule]);
			}
		}
		for (const rules of map.values()) rules.sort((a, b) => specificity(a) - specificity(b));
		return map;
	}

	// Write recoloured pixels of srcImage into dstCtx (must be same dimensions).
	// bodyId selects an optional pre-pass that rewrites pixel hexes (still using
	// ladder shades) before the palette swap runs.
	function recolor(srcImage, choices, dstCtx, bodyId) {
		const w = srcImage.width, h = srcImage.height;
		dstCtx.imageSmoothingEnabled = false;
		dstCtx.clearRect(0, 0, w, h);
		dstCtx.drawImage(srcImage, 0, 0);
		const id = dstCtx.getImageData(0, 0, w, h);
		const px = id.data;
		const map = buildColourMap(choices);
		const body = BODIES[bodyId] || BODIES.classic;
		const mod = body && body.mod;
		for (let i = 0, idx = 0; i < px.length; i += 4, idx++) {
			if (px[i+3] === 0) continue;
			const x = idx % w;
			const y = (idx / w) | 0;
			const frameX = x % FRAME_W;
			const frameY = y % FRAME_H;
			if (mod) {
				const srcHex = rgbToHex(px[i], px[i+1], px[i+2]);
				const replaced = mod(frameX, frameY, srcHex);
				if (replaced) {
					const n = parseInt(replaced.slice(1), 16);
					px[i] = (n>>16)&255; px[i+1] = (n>>8)&255; px[i+2] = n&255;
				}
			}
			const key = (px[i]<<16) | (px[i+1]<<8) | px[i+2];
			const rules = map.get(key);
			if (!rules) continue;
			for (let r = 0; r < rules.length; r++) {
				const rule = rules[r];
				if (frameY >= rule.yMin && frameY <= rule.yMax
				 && frameX >= rule.xMin && frameX <= rule.xMax) {
					px[i] = rule.rgb[0]; px[i+1] = rule.rgb[1]; px[i+2] = rule.rgb[2];
					break;
				}
			}
		}
		dstCtx.putImageData(id, 0, 0);
	}

	window.TrainerPalette = { BASE, MAIN_IDX, DEFAULTS, KEY, BODY_KEY, BODIES, BODY_IDS, load, save, loadBody, saveBody, recolor };
})();
