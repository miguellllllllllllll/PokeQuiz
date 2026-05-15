// Shared trainer sprite renderer + look persistence.
// Exports window.TrainerLook used by camp.js and profile-page.js.
(function () {
	'use strict';

	const KEY = 'pokequiz_trainer_look';

	const DEFAULTS = {
		gender : 'male',
		skin   : '#F0D0A0',
		hair   : '#302010',
		hat    : '#1C2850',   // jacket + cap share one colour
		bottom : '#607090',   // shorts / skirt
		shoes  : '#3A2010',
	};

	// Palette options shown in the picker
	const PALETTES = {
		skin: [
			{ color: '#FFE8C8', label: 'Pale'   },
			{ color: '#F0D0A0', label: 'Fair'   },
			{ color: '#D4926A', label: 'Tan'    },
			{ color: '#A0623A', label: 'Brown'  },
			{ color: '#5C3A1E', label: 'Dark'   },
		],
		hair: [
			{ color: '#302010', label: 'Black'  },
			{ color: '#7A4828', label: 'Brown'  },
			{ color: '#D4A820', label: 'Blonde' },
			{ color: '#AA2820', label: 'Red'    },
			{ color: '#C0C0C0', label: 'Silver' },
			{ color: '#2858A0', label: 'Blue'   },
		],
		hat: [
			{ color: '#1C2850', label: 'Navy'    },
			{ color: '#8B1818', label: 'Crimson' },
			{ color: '#1A4A28', label: 'Forest'  },
			{ color: '#4A1880', label: 'Purple'  },
			{ color: '#181818', label: 'Black'   },
			{ color: '#7A7A7A', label: 'Grey'    },
		],
		bottom: [
			{ color: '#607090', label: 'Slate'    },
			{ color: '#2848A0', label: 'Denim'    },
			{ color: '#383838', label: 'Charcoal' },
			{ color: '#4A6830', label: 'Olive'    },
			{ color: '#7A4828', label: 'Tan'      },
		],
		shoes: [
			{ color: '#3A2010', label: 'Brown' },
			{ color: '#181818', label: 'Black' },
			{ color: '#E8E8E8', label: 'White' },
			{ color: '#8B1818', label: 'Red'   },
		],
	};

	function darken(hex, r) {
		const n = parseInt(hex.replace('#',''), 16);
		const dr = v => Math.max(0, Math.round(((n>>16)&255)*v)).toString(16).padStart(2,'0');
		const dg = v => Math.max(0, Math.round(((n>>8)&255)*v)).toString(16).padStart(2,'0');
		const db = v => Math.max(0, Math.round((n&255)*v)).toString(16).padStart(2,'0');
		return `#${dr(1-r)}${dg(1-r)}${db(1-r)}`;
	}

	function load() {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
		} catch {}
		return Object.assign({}, DEFAULTS);
	}

	function save(look) {
		try { localStorage.setItem(KEY, JSON.stringify(look)); } catch {}
	}

	// Draw the sprite. px/py is the foot-center point (same convention as camp.js).
	// frame: 0=idle, 1=step
	function draw(ctx, px, py, dir, frame, look) {
		const l    = look || load();
		const bx   = Math.floor(px) - 6;
		const by   = Math.floor(py) - 17;
		const step = frame === 1 ? 2 : 0;

		const skin   = l.skin   || DEFAULTS.skin;
		const shade  = darken(skin, 0.18);
		const hair   = l.hair   || DEFAULTS.hair;
		const hat    = l.hat    || DEFAULTS.hat;
		const brim   = darken(hat, 0.28);
		const top    = hat;               // jacket matches cap
		const bot    = l.bottom || DEFAULTS.bottom;
		const botSh  = darken(bot, 0.25);
		const shoes  = l.shoes  || DEFAULTS.shoes;
		const shirt  = '#E8E8F0';
		const eyes   = '#101820';
		const logo   = '#CC1818';

		const C = { skin, shade, hair, hat, brim, top, bot, botSh, shoes, shirt, eyes, logo };
		if (l.gender === 'female') _drawF(ctx, bx, by, step, C, dir);
		else                       _drawM(ctx, bx, by, step, C, dir);
	}

	// ── Male (Nate) ──────────────────────────────────────────────────────────────
	function _drawM(ctx, bx, by, step, C, dir) {
		const f = (color, x, y, w, h) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };

		f('rgba(0,0,0,0.22)', bx+1, by+17, 10, 3); // shadow

		if (dir === 0) { // south
			f(C.shoes,  bx+1,  by+14+step, 4, 3); f(C.shoes,  bx+7,  by+14-step, 4, 3);
			f(C.bot,    bx+1,  by+9,  10, 6);     f(C.botSh,  bx+1,  by+13, 10, 2);
			f(C.top,    bx+0,  by+4,  12, 6);
			f(C.shirt,  bx+4,  by+4,   4, 4);
			f(C.top,    bx-1,  by+4,   2, 6);     f(C.top,    bx+11, by+4,   2, 6);
			f(C.skin,   bx-1,  by+9,   2, 3);     f(C.skin,   bx+11, by+9,   2, 3);
			f(C.skin,   bx+4,  by+2,   4, 3);     // neck
			f(C.skin,   bx+2,  by-3,   8, 6);     // face
			f(C.hair,   bx+2,  by-1,   1, 3);     f(C.hair,   bx+9,  by-1,   1, 3);
			f(C.eyes,   bx+3,  by-1,   2, 2);     f(C.eyes,   bx+7,  by-1,   2, 2);
			f(C.shade,  bx+4,  by+1,   4, 1);     // mouth
			f(C.brim,   bx+1,  by-3,  10, 2);     // brim
			f(C.hat,    bx+2,  by-7,   8, 5);     // cap
			f(C.logo,   bx+4,  by-6,   3, 2);     // logo

		} else if (dir === 2) { // north
			f(C.shoes,  bx+1,  by+14+step, 4, 3); f(C.shoes,  bx+7,  by+14-step, 4, 3);
			f(C.bot,    bx+1,  by+9,  10, 6);     f(C.botSh,  bx+1,  by+13, 10, 2);
			f(C.top,    bx+0,  by+4,  12, 6);
			f(C.top,    bx-1,  by+4,   2, 6);     f(C.top,    bx+11, by+4,   2, 6);
			f(C.skin,   bx-1,  by+9,   2, 3);     f(C.skin,   bx+11, by+9,   2, 3);
			f(C.hair,   bx+2,  by-3,   8, 6);
			f(C.brim,   bx+1,  by-3,  10, 2);     f(C.brim,   bx+5,  by-3,   2, 2);
			f(C.hat,    bx+2,  by-7,   8, 5);

		} else if (dir === 1) { // west
			f(C.shoes,  bx+2,  by+14+step, 7, 3);
			f(C.bot,    bx+2,  by+9,   8, 6);     f(C.botSh,  bx+2,  by+13,  8, 2);
			f(C.top,    bx+2,  by+4,   9, 6);     f(C.top,    bx+0,  by+4,   3, 6);
			f(C.skin,   bx+0,  by+9,   2, 3);     // hand
			f(C.skin,   bx+4,  by+2,   3, 3);     // neck
			f(C.skin,   bx+2,  by-3,   6, 6);     // face
			f(C.shade,  bx+2,  by+0,   1, 2);     // nose
			f(C.hair,   bx+2,  by-2,   1, 3);
			f(C.eyes,   bx+3,  by-1,   2, 2);
			f(C.brim,   bx+1,  by-3,   8, 2);     f(C.brim,   bx+0,  by-2,   2, 1);
			f(C.hat,    bx+2,  by-7,   7, 5);

		} else { // east
			f(C.shoes,  bx+3,  by+14+step, 7, 3);
			f(C.bot,    bx+2,  by+9,   8, 6);     f(C.botSh,  bx+2,  by+13,  8, 2);
			f(C.top,    bx+1,  by+4,   9, 6);     f(C.top,    bx+9,  by+4,   3, 6);
			f(C.skin,   bx+10, by+9,   2, 3);
			f(C.skin,   bx+5,  by+2,   3, 3);
			f(C.skin,   bx+4,  by-3,   6, 6);
			f(C.shade,  bx+9,  by+0,   1, 2);
			f(C.hair,   bx+9,  by-2,   1, 3);
			f(C.eyes,   bx+7,  by-1,   2, 2);
			f(C.brim,   bx+3,  by-3,   8, 2);     f(C.brim,   bx+10, by-2,   2, 1);
			f(C.hat,    bx+3,  by-7,   7, 5);
		}
	}

	// ── Female (Rosa) ────────────────────────────────────────────────────────────
	function _drawF(ctx, bx, by, step, C, dir) {
		const f = (color, x, y, w, h) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };

		f('rgba(0,0,0,0.22)', bx+1, by+17, 10, 3); // shadow

		if (dir === 0) { // south
			f(C.shoes,  bx+2,  by+15+step, 3, 2); f(C.shoes,  bx+7,  by+15-step, 3, 2);
			// Skirt — flared hem
			f(C.bot,    bx+1,  by+9,  10, 7);
			f(C.botSh,  bx+0,  by+13, 12, 3);
			f(C.top,    bx+1,  by+4,  10, 6);
			f(C.shirt,  bx+4,  by+4,   4, 3);
			f(C.top,    bx+0,  by+4,   2, 5);     f(C.top,    bx+10, by+4,   2, 5);
			f(C.skin,   bx+0,  by+8,   2, 3);     f(C.skin,   bx+10, by+8,   2, 3);
			f(C.skin,   bx+4,  by+2,   4, 3);
			f(C.skin,   bx+2,  by-3,   8, 6);
			// Side hair strands
			f(C.hair,   bx+1,  by-3,   2, 8);     f(C.hair,   bx+9,  by-3,   2, 8);
			f(C.eyes,   bx+3,  by-1,   2, 2);     f(C.eyes,   bx+7,  by-1,   2, 2);
			f(C.shade,  bx+5,  by+1,   2, 1);
			// Beret
			f(C.hat,    bx+2,  by-6,   8, 4);
			f(C.brim,   bx+1,  by-3,  10, 1);
			f(C.hair,   bx+2,  by-7,   8, 2);     // hair above hat

		} else if (dir === 2) { // north
			f(C.shoes,  bx+2,  by+15+step, 3, 2); f(C.shoes,  bx+7,  by+15-step, 3, 2);
			f(C.bot,    bx+1,  by+9,  10, 7);     f(C.botSh,  bx+0,  by+13, 12, 3);
			f(C.top,    bx+1,  by+4,  10, 6);
			f(C.top,    bx+0,  by+4,   2, 5);     f(C.top,    bx+10, by+4,   2, 5);
			f(C.skin,   bx+0,  by+8,   2, 3);     f(C.skin,   bx+10, by+8,   2, 3);
			// Long hair (visible back)
			f(C.hair,   bx+2,  by-3,   8, 8);
			f(C.hair,   bx+1,  by+2,   2, 5);     f(C.hair,   bx+9,  by+2,   2, 5);
			f(C.hat,    bx+2,  by-6,   8, 4);
			f(C.brim,   bx+1,  by-3,  10, 1);

		} else if (dir === 1) { // west
			f(C.shoes,  bx+2,  by+15+step, 6, 2);
			f(C.bot,    bx+1,  by+9,   9, 7);     f(C.botSh,  bx+0,  by+13, 10, 3);
			f(C.top,    bx+2,  by+4,   8, 6);     f(C.top,    bx+0,  by+4,   3, 5);
			f(C.skin,   bx+0,  by+8,   2, 3);
			f(C.skin,   bx+4,  by+2,   3, 3);
			f(C.skin,   bx+2,  by-3,   6, 6);
			f(C.shade,  bx+2,  by+0,   1, 2);
			f(C.hair,   bx+6,  by-3,   2, 8);     // back strand
			f(C.hair,   bx+2,  by-2,   1, 2);
			f(C.eyes,   bx+3,  by-1,   2, 2);
			f(C.hat,    bx+2,  by-6,   7, 4);
			f(C.brim,   bx+2,  by-3,   7, 1);

		} else { // east
			f(C.shoes,  bx+4,  by+15+step, 6, 2);
			f(C.bot,    bx+2,  by+9,   9, 7);     f(C.botSh,  bx+2,  by+13, 10, 3);
			f(C.top,    bx+2,  by+4,   8, 6);     f(C.top,    bx+9,  by+4,   3, 5);
			f(C.skin,   bx+10, by+8,   2, 3);
			f(C.skin,   bx+5,  by+2,   3, 3);
			f(C.skin,   bx+4,  by-3,   6, 6);
			f(C.shade,  bx+9,  by+0,   1, 2);
			f(C.hair,   bx+4,  by-3,   2, 8);     // back strand
			f(C.hair,   bx+9,  by-2,   1, 2);
			f(C.eyes,   bx+7,  by-1,   2, 2);
			f(C.hat,    bx+3,  by-6,   7, 4);
			f(C.brim,   bx+3,  by-3,   7, 1);
		}
	}

	window.TrainerLook = { DEFAULTS, PALETTES, load, save, draw, darken };
})();
