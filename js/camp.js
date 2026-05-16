(function () {
	'use strict';

	const TILE = 16;
	const MAP_W = 40;
	const MAP_H = 30;
	const SPEED = 84; // px/sec — matches old 1.4 px/frame at 60fps

	// Tile IDs
	const TG=0,TG2=1,TP=2,TW=3,TR=4,TR2=5,TWN=6,TD=7,TH2O=8,TTR=9,TFR=10,TFY=11,TSO=12,TCR=13,TFN=14,TRP=15,TIF=16,TIW=17,TRU=18,TST=19,TSG=20,TTR2=21,TBSH=22;

	const SOLID = new Set([TW, TR, TR2, TRP, TWN, TH2O, TTR, TTR2, TFN, TIW, TST, TSG, TBSH]);
	const ANIMATED = new Set([TWN, TH2O, TCR]);

	// Signs placed on the camp map — key is "r,c", value is the message shown when
	// the player presses E next to it. Coordinates match camp's MAP tile grid.
	const SIGN_MESSAGES = {
		'12,10': "Welcome to Trainer Camp! Walk up to the house and press E at the door to head inside.",
		'19,11': "Crops grow here — come back later for a harvest minigame.",
		'12,4':  "Trail to the deep woods. Watch out for wild Pokemon in the tall grass.",
	};

	// ── Inventory + planted-berry persistence (localStorage) ─────────────────────
	const INVENTORY_KEY = 'pokequiz_camp_inventory';
	const PLANTS_KEY = 'pokequiz_camp_plants';
	const GROW_MS = 30 * 1000; // 30 seconds — tunable; deliberately short for Phase 1
	const Inventory = (() => {
		function load() {
			try {
				const raw = localStorage.getItem(INVENTORY_KEY);
				if (raw) return Object.assign({ seeds: 3, friendshipBerries: 0 }, JSON.parse(raw));
			} catch {}
			return { seeds: 3, friendshipBerries: 0 };
		}
		function save(inv) {
			try { localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv)); } catch {}
		}
		return { load, save };
	})();
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

	// Camp NPCs. Stationary for Phase 1 — each renders frame 0 of its walk sheet
	// (south-facing idle) and uses Manhattan-1 adjacency for the E-key dialog.
	const NPCS = [
		{
			key: 'mart-keeper', species: 'pikachu', r: 14, c: 13,
			label: 'Talk',
			spriteScale: 0.55, frameHeight: 40,
			dialog: "Welcome to my shop! I'll buy your berries — come back when you've grown some. (Mart not stocked yet — coming soon.)",
		},
		{
			key: 'farmer', species: 'bulbasaur', r: 21, c: 22,
			label: 'Talk',
			spriteScale: 0.6, frameHeight: 40,
			dialog: "These plots love a good seed! Plant one on any soil tile and check back in a bit for a Friendship Berry.",
		},
	];

	// ── Map ──────────────────────────────────────────────────────────────────────
	function buildMap() {
		const map = Array.from({ length: MAP_H }, () => new Array(MAP_W).fill(TG));
		function set(r, c, t) { if (r>=0&&r<MAP_H&&c>=0&&c<MAP_W) map[r][c]=t; }
		function fill(r1,c1,r2,c2,t) { for(let r=r1;r<=r2;r++) for(let c=c1;c<=c2;c++) set(r,c,t); }

		let rng=77777;
		function rand(){ rng^=rng<<13;rng^=rng>>17;rng^=rng<<5;return(rng>>>0)/0xFFFFFFFF; }
		for(let r=2;r<MAP_H-2;r++) for(let c=2;c<MAP_W-2;c++) if(rand()<0.09) map[r][c]=TG2;

		for(let c=0;c<MAP_W;c++){set(0,c,TTR);set(1,c,TTR);}
		for(let r=0;r<MAP_H;r++){set(r,0,TTR);set(r,1,TTR);set(r,MAP_W-1,TTR);set(r,MAP_W-2,TTR);}
		for(let c=0;c<MAP_W;c++) if(c<8||c>13){set(MAP_H-1,c,TTR);set(MAP_H-2,c,TTR);}

		[[8,3],[9,4],[10,3],[11,4],[14,3],[15,4],[16,3],[20,3],[21,4],[22,3],[23,4],[26,2],[27,3],
		 [3,19],[4,20],[5,22],[4,24],[5,26],[3,28],[6,18],[7,19]
		].forEach(([r,c])=>set(r,c,TTR));

		[[4,19,TFR],[5,17,TFY],[6,19,TFR],[7,18,TFY],[8,17,TFR],
		 [4,25,TFY],[5,27,TFR],[6,25,TFY],
		 [13,4,TFR],[14,5,TFY],[15,4,TFR],[16,5,TFY],
		 [22,5,TFY],[23,4,TFR],[24,5,TFY],
		].forEach(([r,c,t])=>set(r,c,t));

		for(let c=6;c<=16;c++) set(3,c,TRP);   // ridge row
		fill(4,6,5,16,TR);                       // roof slope (front face)
		for(let c=5;c<=17;c++) set(6,c,TR2);    // eave with 1-tile overhang on each side
		fill(7,6,11,16,TW);
		set(8,8,TWN); set(9,8,TWN);
		set(8,14,TWN); set(9,14,TWN);
		set(11,11,TD);

		fill(3,30,9,36,TH2O);
		[[3,30],[3,36],[9,30],[9,36],[3,31],[9,31],[3,35],[9,35],[4,30],[4,36],[8,30],[8,36]
		].forEach(([r,c])=>set(r,c,TG));

		for(let r=12;r<=27;r++) set(r,11,TP);
		for(let c=11;c<=22;c++) set(20,c,TP);

		for(let c=20;c<=36;c++){set(12,c,TFN);set(27,c,TFN);}
		for(let r=13;r<=26;r++){set(r,20,TFN);set(r,36,TFN);}
		set(20,20,TP); set(20,21,TP);
		fill(13,21,26,35,TSO);
		for(let r=14;r<=26;r+=2) for(let c=21;c<=35;c++) set(r,c,TCR);

		// Signs — keys must match SIGN_MESSAGES coordinates above
		set(12,10,TSG);
		set(19,11,TSG);
		set(12,4,TSG);

		// Sprinkle autumn-tree variants and bushes for visual variety
		const variant = [[3,17],[5,15],[7,17],[12,2],[19,3],[23,2],[27,5]];
		variant.forEach(([r,c]) => { if (map[r][c] === TTR) map[r][c] = TTR2; });
		const bushes = [[14,8],[16,9],[18,8],[22,9],[24,7],[26,9],[6,20],[5,29],[8,32]];
		bushes.forEach(([r,c]) => { if (map[r][c] === TG || map[r][c] === TG2) map[r][c] = TBSH; });

		return map;
	}

	// ── Tile drawing — BW2 Gen 5, TILE=16 ───────────────────────────────────────
	function drawTile(ctx, t, x, y, tick) {
		const d = TILE;
		switch(t) {
			case TG:
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#508028';
				ctx.fillRect(x+2,y+3,1,3); ctx.fillRect(x+9,y+8,1,3); ctx.fillRect(x+13,y+2,1,2);
				ctx.fillStyle='#90C050';
				ctx.fillRect(x+5,y+6,2,1); ctx.fillRect(x+12,y+12,2,1);
				break;
			case TG2:
				ctx.fillStyle='#609030'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#406018';
				ctx.fillRect(x+3,y+4,1,3); ctx.fillRect(x+10,y+9,1,3); ctx.fillRect(x+14,y+1,1,2);
				ctx.fillStyle='#78B040'; ctx.fillRect(x+6,y+7,2,1);
				break;
			case TP: {
				ctx.fillStyle='#B0A470'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#988C5A';
				ctx.fillRect(x,y+5,d,1); ctx.fillRect(x,y+11,d,1);
				ctx.fillRect(x+7,y,1,5); ctx.fillRect(x+7,y+12,1,4);
				ctx.fillRect(x+3,y+6,1,5); ctx.fillRect(x+11,y+6,1,5);
				ctx.fillStyle='#C8BC88';
				ctx.fillRect(x+1,y+1,5,2); ctx.fillRect(x+9,y+1,6,2);
				ctx.fillRect(x+1,y+7,1,2); ctx.fillRect(x+5,y+7,5,2); ctx.fillRect(x+13,y+7,2,2);
				ctx.fillRect(x+2,y+12,4,2); ctx.fillRect(x+9,y+12,5,2);
				break;
			}
			case TRP: {
				// Ridge row — the apex of the pitched roof, slightly receded (back slope)
				ctx.fillStyle='#5C0808'; ctx.fillRect(x,y,d,d);
				// Top edge: dark cap stripe (the actual ridge line, in shadow as it faces away)
				ctx.fillStyle='#2C0404'; ctx.fillRect(x,y+0,d,2);
				// Ridge highlight — thin lit band where light just clips the apex
				ctx.fillStyle='#A82424'; ctx.fillRect(x,y+2,d,1);
				// Back slope shingles (darker than front-slope TR — same shape, less light)
				ctx.fillStyle='#7C1414'; ctx.fillRect(x+0,y+4,8,5); ctx.fillRect(x+8,y+4,8,5);
				ctx.fillStyle='#902020'; ctx.fillRect(x+0,y+3,8,1); ctx.fillRect(x+8,y+3,8,1);
				ctx.fillStyle='#2C0404'; ctx.fillRect(x+7,y+3,1,6);
				ctx.fillStyle='#4C0808'; ctx.fillRect(x+0,y+9,d,1);
				// Second row (offset)
				ctx.fillStyle='#7C1414'; ctx.fillRect(x+0,y+11,4,4); ctx.fillRect(x+4,y+11,8,4); ctx.fillRect(x+12,y+11,4,4);
				ctx.fillStyle='#902020'; ctx.fillRect(x+0,y+10,4,1); ctx.fillRect(x+4,y+10,8,1); ctx.fillRect(x+12,y+10,4,1);
				ctx.fillStyle='#2C0404'; ctx.fillRect(x+3,y+10,1,5); ctx.fillRect(x+11,y+10,1,5);
				ctx.fillStyle='#4C0808'; ctx.fillRect(x+0,y+15,d,1);
				break;
			}
			case TR: {
				// Front-slope shingles — well-lit, top-left bias for dimensionality
				ctx.fillStyle='#9C1C1C'; ctx.fillRect(x,y,d,d);
				// Top row of shingles
				ctx.fillStyle='#C0302C'; ctx.fillRect(x+0,y+1,8,6); ctx.fillRect(x+8,y+1,8,6);
				ctx.fillStyle='#E84838'; ctx.fillRect(x+0,y+0,8,1); ctx.fillRect(x+8,y+0,8,1);  // bright top edge
				ctx.fillStyle='#F46050'; ctx.fillRect(x+0,y+0,4,1); ctx.fillRect(x+8,y+0,4,1);  // left-half extra highlight (light from upper-left)
				ctx.fillStyle='#3C0606'; ctx.fillRect(x+7,y+0,1,8);                              // hard seam between shingles
				ctx.fillStyle='#5C0C0C'; ctx.fillRect(x+0,y+7,16,1);                             // shingle-row shadow
				ctx.fillStyle='#7C1414'; ctx.fillRect(x+13,y+1,3,6);                             // right-side shingle in shadow (light from left)
				ctx.fillStyle='#7C1414'; ctx.fillRect(x+5,y+1,3,6);
				// Bottom row of shingles (offset)
				ctx.fillStyle='#C0302C'; ctx.fillRect(x+0,y+9,4,6); ctx.fillRect(x+4,y+9,8,6); ctx.fillRect(x+12,y+9,4,6);
				ctx.fillStyle='#E84838'; ctx.fillRect(x+0,y+8,4,1); ctx.fillRect(x+4,y+8,8,1); ctx.fillRect(x+12,y+8,4,1);
				ctx.fillStyle='#F46050'; ctx.fillRect(x+0,y+8,2,1); ctx.fillRect(x+4,y+8,4,1); ctx.fillRect(x+12,y+8,2,1);
				ctx.fillStyle='#3C0606'; ctx.fillRect(x+3,y+8,1,8); ctx.fillRect(x+11,y+8,1,8);
				ctx.fillStyle='#5C0C0C'; ctx.fillRect(x+0,y+15,16,1);
				ctx.fillStyle='#7C1414'; ctx.fillRect(x+9,y+9,3,6);
				ctx.fillStyle='#7C1414'; ctx.fillRect(x+1,y+9,3,6);
				break;
			}
			case TR2:
				// Eave — projecting overhang with strong cast shadow below
				ctx.fillStyle='#580808'; ctx.fillRect(x,y,d,d);
				// Roof end shingles (one last lit row before the overhang lip)
				ctx.fillStyle='#9C1C1C'; ctx.fillRect(x,y+0,d,4);
				ctx.fillStyle='#C0302C'; ctx.fillRect(x,y+0,d,3);
				ctx.fillStyle='#E84838'; ctx.fillRect(x,y+0,d,1);
				ctx.fillStyle='#3C0606'; ctx.fillRect(x+7,y+0,1,4);
				// Trim board (the visible front-face of the overhang)
				ctx.fillStyle='#3C0606'; ctx.fillRect(x+0,y+4,d,1);   // top seam where shingles end
				ctx.fillStyle='#7C5028'; ctx.fillRect(x+0,y+5,d,4);   // wooden fascia trim board
				ctx.fillStyle='#9C6838'; ctx.fillRect(x+0,y+5,d,1);   // trim highlight
				ctx.fillStyle='#5C3818'; ctx.fillRect(x+0,y+8,d,1);   // trim bottom edge
				// Cast shadow beneath the overhang (this is what makes the house feel 3D)
				ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(x+0,y+9,d,4);
				ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(x+0,y+13,d,2);
				ctx.fillStyle='rgba(0,0,0,0.2)';  ctx.fillRect(x+0,y+15,d,1);
				break;
			case TW:
				// Wood-plank wall with directional shading (light from top-left)
				ctx.fillStyle='#D0B878'; ctx.fillRect(x,y,d,d);                  // base plank
				ctx.fillStyle='#E0CC8C'; ctx.fillRect(x+0,y+0,d-2,1);             // top-edge highlight
				ctx.fillStyle='#E0CC8C'; ctx.fillRect(x+0,y+6,d-2,1);
				ctx.fillStyle='#E0CC8C'; ctx.fillRect(x+0,y+12,d-2,1);
				ctx.fillStyle='#A88848'; ctx.fillRect(x+0,y+5,d,1);               // plank shadow
				ctx.fillStyle='#A88848'; ctx.fillRect(x+0,y+11,d,1);
				ctx.fillStyle='#8C6C2C'; ctx.fillRect(x+0,y+15,d,1);              // bottom shadow line
				ctx.fillStyle='#A88848'; ctx.fillRect(x+d-1,y+0,1,d);             // right-edge column shadow (cohesive across tiles)
				// Grain specks
				ctx.fillStyle='#B89858';
				ctx.fillRect(x+3,y+2,1,1); ctx.fillRect(x+10,y+3,1,1);
				ctx.fillRect(x+6,y+8,1,1); ctx.fillRect(x+13,y+9,1,1);
				ctx.fillRect(x+2,y+13,1,1); ctx.fillRect(x+9,y+14,1,1);
				break;
			case TWN: {
				// Paned window — wood frame with 2×2 glass and subtle animated glint
				ctx.fillStyle='#D8C088'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#3A1F08'; ctx.fillRect(x+1,y+1,14,14);     // outer frame
				ctx.fillStyle='#5C3818'; ctx.fillRect(x+2,y+2,12,12);     // inner frame
				const gl=Math.sin(tick*0.022+x*0.012)*0.06+0.82;
				ctx.fillStyle=`rgba(120,190,240,${gl})`;
				ctx.fillRect(x+3,y+3,4,4); ctx.fillRect(x+9,y+3,4,4);
				ctx.fillRect(x+3,y+9,4,4); ctx.fillRect(x+9,y+9,4,4);
				ctx.fillStyle='#3A1F08';                                  // mullions (window cross)
				ctx.fillRect(x+7,y+3,1,10); ctx.fillRect(x+3,y+7,10,1);
				ctx.fillStyle='rgba(255,255,255,0.55)';                   // glass highlight
				ctx.fillRect(x+3,y+3,2,1); ctx.fillRect(x+9,y+3,2,1);
				ctx.fillStyle='rgba(255,255,255,0.85)';                   // sparkle
				ctx.fillRect(x+3,y+3,1,1); ctx.fillRect(x+9,y+3,1,1);
				ctx.fillStyle='rgba(0,0,0,0.18)';                         // bottom-right interior shadow
				ctx.fillRect(x+6,y+6,1,1); ctx.fillRect(x+12,y+6,1,1);
				ctx.fillRect(x+6,y+12,1,1); ctx.fillRect(x+12,y+12,1,1);
				break;
			}
			case TD:
				// Paneled door — frame, two recessed panels, brass knob
				ctx.fillStyle='#D8C088'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#2C1804'; ctx.fillRect(x+2,y+0,12,d);      // door outer frame
				ctx.fillStyle='#7C4818'; ctx.fillRect(x+3,y+1,10,15);     // door body
				ctx.fillStyle='#5C3010'; ctx.fillRect(x+3,y+8,10,1);      // mid-rail separator
				ctx.fillStyle='#9C5C24';                                  // panel inset (lighter)
				ctx.fillRect(x+4,y+2,8,5); ctx.fillRect(x+4,y+10,8,5);
				ctx.fillStyle='#5C3010';                                  // panel top shadow
				ctx.fillRect(x+4,y+2,8,1); ctx.fillRect(x+4,y+10,8,1);
				ctx.fillStyle='#5C3010';                                  // panel left shadow
				ctx.fillRect(x+4,y+2,1,5); ctx.fillRect(x+4,y+10,1,5);
				ctx.fillStyle='#B07028';                                  // panel inner highlight
				ctx.fillRect(x+11,y+3,1,4); ctx.fillRect(x+11,y+11,1,4);
				ctx.fillStyle='#FFD038'; ctx.fillRect(x+10,y+8,2,2);      // knob
				ctx.fillStyle='#FFE890'; ctx.fillRect(x+10,y+8,1,1);      // knob highlight
				ctx.fillStyle='#8C5C18'; ctx.fillRect(x+10,y+10,1,1);     // knob shadow
				break;
			case TH2O: {
				const w1=Math.round(Math.sin(tick*0.05+(x+y)*0.04)*1.5);
				const w2=Math.round(Math.sin(tick*0.04+x*0.06)*1);
				ctx.fillStyle='#3858A8'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5070C0';
				ctx.fillRect(x+1,y+w1+2,d-2,2); ctx.fillRect(x+2,y+w1+7,d-4,2); ctx.fillRect(x+1,y+w2+12,d-2,2);
				ctx.fillStyle='#8098D8';
				ctx.fillRect(x+2,y+w1+3,4,1); ctx.fillRect(x+10,y+w1+8,4,1);
				const sp=Math.floor(tick/12)%4;
				ctx.fillStyle='rgba(170,210,255,0.7)';
				if(sp===0) ctx.fillRect(x+6,y+3,3,3);
				else if(sp===1) ctx.fillRect(x+11,y+10,3,3);
				else if(sp===2) ctx.fillRect(x+3,y+10,3,3);
				else ctx.fillRect(x+12,y+3,3,3);
				ctx.fillStyle='rgba(255,255,255,0.65)';
				if(sp===0) ctx.fillRect(x+7,y+4,1,1);
				else if(sp===1) ctx.fillRect(x+12,y+11,1,1);
				else if(sp===2) ctx.fillRect(x+4,y+11,1,1);
				else ctx.fillRect(x+13,y+4,1,1);
				break;
			}
			case TTR: {
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5C3C1C'; ctx.fillRect(x+7,y+12,2,4);
				ctx.fillStyle='#7A5030'; ctx.fillRect(x+7,y+13,2,3);
				ctx.fillStyle='#1A3A0A';
				ctx.fillRect(x+5,y+1,6,1); ctx.fillRect(x+3,y+2,10,1);
				ctx.fillRect(x+2,y+3,12,8);
				ctx.fillRect(x+3,y+11,10,1); ctx.fillRect(x+5,y+12,6,1);
				ctx.fillStyle='#2E600E';
				ctx.fillRect(x+4,y+2,8,1); ctx.fillRect(x+3,y+3,10,8); ctx.fillRect(x+4,y+11,8,1);
				ctx.fillStyle='#487824'; ctx.fillRect(x+4,y+3,7,7);
				ctx.fillStyle='#62A030';
				ctx.fillRect(x+4,y+3,5,4); ctx.fillRect(x+4,y+7,3,2);
				ctx.fillStyle='#9ED860'; ctx.fillRect(x+5,y+4,2,2);
				ctx.fillStyle='#BFF880'; ctx.fillRect(x+5,y+4,1,1);
				break;
			}
			case TFR:
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#3A6818'; ctx.fillRect(x+7,y+10,1,6);
				ctx.fillStyle='#D01818';
				ctx.fillRect(x+5,y+6,5,4); ctx.fillRect(x+6,y+5,3,6);
				ctx.fillStyle='#F8B800'; ctx.fillRect(x+6,y+7,3,2);
				ctx.fillStyle='#FFD838'; ctx.fillRect(x+7,y+7,1,1);
				break;
			case TFY:
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#3A6818'; ctx.fillRect(x+7,y+10,1,6);
				ctx.fillStyle='#E89000';
				ctx.fillRect(x+5,y+6,5,4); ctx.fillRect(x+6,y+5,3,6);
				ctx.fillStyle='#FF7800'; ctx.fillRect(x+6,y+7,3,2);
				ctx.fillStyle='#FFB020'; ctx.fillRect(x+7,y+7,1,1);
				break;
			case TSO:
				ctx.fillStyle='#4A3210'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5A4020'; ctx.fillRect(x+1,y+1,d-2,d-2);
				ctx.fillStyle='#382408'; ctx.fillRect(x,y+5,d,1); ctx.fillRect(x,y+11,d,1);
				ctx.fillStyle='#6A4C28';
				ctx.fillRect(x+1,y+2,d-2,3); ctx.fillRect(x+1,y+6,d-2,5); ctx.fillRect(x+1,y+12,d-2,3);
				break;
			case TCR: {
				ctx.fillStyle='#4A3210'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5A4020'; ctx.fillRect(x+1,y+1,d-2,d-2);
				ctx.fillStyle='#382408'; ctx.fillRect(x,y+5,d,1); ctx.fillRect(x,y+11,d,1);
				const sw=Math.sin(tick*0.06+x*0.08)*0.8;
				[[3,7],[10,6]].forEach(([cx,cy])=>{
					ctx.fillStyle='#204010'; ctx.fillRect(x+cx+sw,y+cy,1,d-cy);
					ctx.fillStyle='#3A7020'; ctx.fillRect(x+cx-1+sw,y+cy,3,4);
					ctx.fillStyle='#58A030'; ctx.fillRect(x+cx+sw,y+cy+1,2,2);
					ctx.fillStyle='#78C050'; ctx.fillRect(x+cx+sw,y+cy+1,1,1);
				});
				break;
			}
			case TFN:
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#8A6030'; ctx.fillRect(x,y+4,d,3); ctx.fillRect(x,y+10,d,3);
				ctx.fillStyle='#6A4820'; ctx.fillRect(x,y+6,d,1); ctx.fillRect(x,y+12,d,1);
				ctx.fillStyle='#B09050'; ctx.fillRect(x,y+4,d,1); ctx.fillRect(x,y+10,d,1);
				ctx.fillStyle='#9A7A38'; ctx.fillRect(x+7,y+1,2,d-2);
				ctx.fillStyle='#B09050'; ctx.fillRect(x+7,y+1,1,d-2);
				ctx.fillStyle='#C8A868'; ctx.fillRect(x+7,y+1,2,1);
				break;
			case TIF: {
				// Interior floor — light wood planks with vertical seams every 8 px
				ctx.fillStyle='#D8B878'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#E8C888'; ctx.fillRect(x+1,y,d-1,1);            // top board edge
				ctx.fillStyle='#B89858'; ctx.fillRect(x,y+15,d,1);             // bottom shadow
				ctx.fillStyle='#A8884C'; ctx.fillRect(x+7,y,1,d);              // plank seam mid
				ctx.fillStyle='#A8884C'; ctx.fillRect(x+15,y,1,d);             // plank seam right
				ctx.fillStyle='#C8A86C';
				ctx.fillRect(x+3,y+4,1,1); ctx.fillRect(x+11,y+9,1,1);
				ctx.fillRect(x+6,y+12,1,1); ctx.fillRect(x+13,y+3,1,1);
				break;
			}
			case TIW: {
				// Interior wall — warm panelled plaster with a wainscot trim line
				ctx.fillStyle='#E8D0A8'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#F4E0B8'; ctx.fillRect(x,y+0,d,1);              // top highlight
				ctx.fillStyle='#C8A878'; ctx.fillRect(x,y+11,d,1);             // wainscot rail
				ctx.fillStyle='#A88858'; ctx.fillRect(x,y+12,d,1);             // wainscot shadow
				ctx.fillStyle='#D8B878'; ctx.fillRect(x,y+13,d,3);             // wainscot panel
				ctx.fillStyle='#A88858'; ctx.fillRect(x,y+15,d,1);             // base shadow
				ctx.fillStyle='#D0B888';
				ctx.fillRect(x+3,y+3,1,1); ctx.fillRect(x+9,y+6,1,1);
				break;
			}
			case TRU: {
				// Decorative rug — soft red with cream border
				ctx.fillStyle='#B83838'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#E0C898'; ctx.fillRect(x,y,d,1); ctx.fillRect(x,y+d-1,d,1);
				ctx.fillStyle='#E0C898'; ctx.fillRect(x,y,1,d); ctx.fillRect(x+d-1,y,1,d);
				ctx.fillStyle='#8C2828'; ctx.fillRect(x+2,y+2,d-4,d-4);
				ctx.fillStyle='#D85050'; ctx.fillRect(x+4,y+4,d-8,d-8);
				ctx.fillStyle='#E0C898'; ctx.fillRect(x+7,y+7,2,2);
				break;
			}
			case TST: {
				// Stairs going up — stepped wood with rising shadow toward the back
				ctx.fillStyle='#D8B878'; ctx.fillRect(x,y,d,d);
				// Four steps, each 4px tall; back step is darkest (most shadow), front is brightest
				const stepShades = ['#583818', '#7C5028', '#A06834', '#C08048'];
				const stepEdges  = ['#3C1F08', '#583018', '#7C4820', '#9C5C28'];
				for (let s = 0; s < 4; s++) {
					const sy = y + s * 4;
					ctx.fillStyle = stepShades[s];
					ctx.fillRect(x, sy, d, 4);
					ctx.fillStyle = stepEdges[s];
					ctx.fillRect(x, sy + 3, d, 1);  // step nosing
					ctx.fillStyle = '#F0D0A0';
					ctx.fillRect(x, sy, d, 1);      // step highlight
				}
				// Side rail shadow on the left
				ctx.fillStyle = 'rgba(0,0,0,0.25)';
				ctx.fillRect(x, y, 2, d);
				break;
			}
			case TSG: {
				// Wooden sign on a post
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);                  // grass base
				ctx.fillStyle='#5C3818'; ctx.fillRect(x+7,y+9,2,7);              // post
				ctx.fillStyle='#8C5828'; ctx.fillRect(x+7,y+9,1,7);              // post highlight
				ctx.fillStyle='#5C3818'; ctx.fillRect(x+1,y+2,14,8);             // sign frame
				ctx.fillStyle='#A86838'; ctx.fillRect(x+2,y+3,12,6);             // sign face
				ctx.fillStyle='#C48848'; ctx.fillRect(x+2,y+3,12,1);             // top highlight
				ctx.fillStyle='#3C1808'; ctx.fillRect(x+2,y+9,12,1);             // bottom shadow
				ctx.fillStyle='#3C1808';
				ctx.fillRect(x+3,y+5,2,1); ctx.fillRect(x+6,y+5,3,1); ctx.fillRect(x+10,y+5,3,1);
				ctx.fillRect(x+3,y+7,4,1); ctx.fillRect(x+8,y+7,2,1); ctx.fillRect(x+11,y+7,2,1);
				break;
			}
			case TTR2: {
				// Alternate tree — autumn / orange leaves variant
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5C3C1C'; ctx.fillRect(x+7,y+12,2,4);
				ctx.fillStyle='#7A5030'; ctx.fillRect(x+7,y+13,2,3);
				ctx.fillStyle='#5C2008';
				ctx.fillRect(x+5,y+1,6,1); ctx.fillRect(x+3,y+2,10,1);
				ctx.fillRect(x+2,y+3,12,8);
				ctx.fillRect(x+3,y+11,10,1); ctx.fillRect(x+5,y+12,6,1);
				ctx.fillStyle='#A04018';
				ctx.fillRect(x+4,y+2,8,1); ctx.fillRect(x+3,y+3,10,8); ctx.fillRect(x+4,y+11,8,1);
				ctx.fillStyle='#D86820'; ctx.fillRect(x+4,y+3,7,7);
				ctx.fillStyle='#F09030';
				ctx.fillRect(x+4,y+3,5,4); ctx.fillRect(x+4,y+7,3,2);
				ctx.fillStyle='#FFC050'; ctx.fillRect(x+5,y+4,2,2);
				ctx.fillStyle='#FFE090'; ctx.fillRect(x+5,y+4,1,1);
				break;
			}
			case TBSH: {
				// Bush — smaller leafy clump, no trunk
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#2E600E';
				ctx.fillRect(x+3,y+5,10,9); ctx.fillRect(x+4,y+4,8,1); ctx.fillRect(x+5,y+14,6,1);
				ctx.fillStyle='#487824';
				ctx.fillRect(x+4,y+5,8,8); ctx.fillRect(x+5,y+13,6,1);
				ctx.fillStyle='#62A030';
				ctx.fillRect(x+4,y+5,5,4); ctx.fillRect(x+4,y+9,3,3);
				ctx.fillStyle='#9ED860'; ctx.fillRect(x+5,y+6,2,2);
				ctx.fillStyle='#BFF880'; ctx.fillRect(x+5,y+6,1,1);
				break;
			}
			default:
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
		}
	}

	function applyWrapTop() {
		const header = document.querySelector('.site-header');
		const wrap = document.getElementById('campWrap');
		if (!wrap) return;
		const hh = header ? Math.ceil(header.getBoundingClientRect().bottom) : 0;
		wrap.style.top = hh + 'px';
	}

	// ── Dialog UI (shared between scenes) ─────────────────────────────────────────
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
		return { open, tick, advance, close, isOpen };
	})();

	// ── Pause menu (shared) ───────────────────────────────────────────────────────
	function setupPauseMenu(game) {
		const panel = document.getElementById('campPause');
		const resumeBtn = document.getElementById('campPauseResume');
		if (!panel || !resumeBtn || panel.dataset.wired) return;
		panel.dataset.wired = '1';
		const close = () => {
			panel.hidden = true;
			const active = game.scene.getScenes(true);
			active.forEach(s => game.scene.resume(s.scene.key));
		};
		const open = () => {
			panel.hidden = false;
			const active = game.scene.getScenes(true);
			active.forEach(s => game.scene.pause(s.scene.key));
		};
		resumeBtn.addEventListener('click', close);
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				if (Dialog.isOpen()) { Dialog.close(); return; }
				panel.hidden ? open() : close();
			}
		});
	}

	// ── Mini-map palette — one swatch per tile type ───────────────────────────────
	function miniMapColor(t) {
		switch (t) {
			case TG: case TG2: case TFR: case TFY: return '#78A840';
			case TP: return '#B0A470';
			case TW: return '#D8C088';
			case TR: case TR2: case TRP: return '#9C1C1C';
			case TWN: return '#5070C0';
			case TD: return '#7C4818';
			case TH2O: return '#3858A8';
			case TTR: return '#1A3A0A';
			case TTR2: return '#A04018';
			case TBSH: return '#2E600E';
			case TSO: case TCR: return '#5A4020';
			case TFN: return '#8A6030';
			case TSG: return '#C48848';
			default: return '#101020';
		}
	}

	// ── Debug HUD ─────────────────────────────────────────────────────────────────
	// Always-on on-screen state dump for chasing scene-transition bugs. Toggle off
	// with the backtick key (`) when no longer needed.
	const Debug = {
		on: true,
		el: null,
		lastError: '',
		ensure() {
			if (this.el) return this.el;
			const div = document.createElement('div');
			div.id = 'campDebugHud';
			div.style.cssText = 'position:absolute;left:14px;top:60px;padding:8px 12px;background:rgba(0,0,0,0.85);color:#7fffa0;font:11px/1.5 ui-monospace,monospace;border:1px solid #295;border-radius:6px;z-index:30;pointer-events:none;white-space:pre;';
			document.getElementById('campWrap')?.appendChild(div);
			this.el = div;
			return div;
		},
		toggle() {
			this.ensure();
			this.on = !this.on;
			this.el.style.display = this.on ? 'block' : 'none';
		},
		render(text) {
			if (!this.on) return;
			this.ensure();
			this.el.textContent = text;
		},
	};
	// Backtick (`) toggles the HUD off/on. F8 also works on systems where it's
	// not bound to media keys.
	document.addEventListener('keydown', (e) => {
		if (e.key === '`' || e.key === 'F8') { e.preventDefault(); Debug.toggle(); }
	});

	// Scene transitions use a hard page reload with a URL hash. Phaser's
	// scene.start / manager.start were silently failing to fully shut down
	// the current scene in this project, leaving two scenes ticking together
	// and the player wedged. Reloading guarantees a clean state and the hash
	// is read on boot to start the right scene with the right spawn point.
	function safeSceneStart(scene, key, data) {
		try { Dialog.close(); } catch (_) {}
		const from = (data && data.from) || '';
		console.log('[scene] reload →', key, 'from', from);
		// Trigger the black fade-in so the screen stays dark through the reload.
		const fade = document.getElementById('campFade');
		if (fade) fade.classList.remove('is-hidden');
		// Short delay so the fade animation has time to land before the reload.
		setTimeout(() => {
			window.location.hash = '#' + key + (from ? '|' + from : '');
			window.location.reload();
		}, 220);
	}

	// Read the hash on boot to figure out which scene to start. Captured once at
	// start() so we can clear the hash immediately and the result is still
	// available when each scene's init() runs on the first game step.
	let _bootData = { scene: 'camp', from: '' };
	function readBootHash() {
		const raw = (window.location.hash || '').replace(/^#/, '');
		if (!raw) return { scene: 'camp', from: '' };
		const [scene, from] = raw.split('|');
		return { scene: scene || 'camp', from: from || '' };
	}
	function consumeBootFrom(sceneKey) {
		// Only return boot 'from' once, and only if it matches the scene asking.
		if (_bootData && _bootData.scene === sceneKey && _bootData.from) {
			const from = _bootData.from;
			_bootData = { scene: 'camp', from: '' };
			return from;
		}
		return '';
	}

	// ── Day/night tint ────────────────────────────────────────────────────────────
	// Six-minute full cycle: 0..120s day, 120..180s sunset, 180..240s night,
	// 240..300s dawn, 300..360s back to day. Driven by performance.now mod cycle.
	function applyDayNight() {
		const tint = document.getElementById('campTint');
		if (!tint) return;
		const cycleSec = 360;
		const t = (performance.now() / 1000) % cycleSec;
		let alpha = 0;
		let color = '#0a1a40';
		if (t < 120) { alpha = 0; }
		else if (t < 180) { alpha = (t - 120) / 60 * 0.55; color = '#3a1a20'; }
		else if (t < 240) { alpha = 0.55; color = '#0a1430'; }
		else if (t < 300) { alpha = (1 - (t - 240) / 60) * 0.55; color = '#3a1a20'; }
		else { alpha = 0; }
		tint.style.opacity = alpha.toFixed(3);
		tint.style.background = color;
	}

	// ── House interior map ───────────────────────────────────────────────────────
	// 16 wide × 12 tall — wainscot walls, wood floor, rug accent, exit door at south,
	// stairs tucked into the north-east corner.
	const HOUSE_W = 16;
	const HOUSE_H = 12;
	const HOUSE_DOOR_C = 8;
	const HOUSE_DOOR_R = HOUSE_H - 1;
	function buildHouseMap() {
		const map = Array.from({ length: HOUSE_H }, () => new Array(HOUSE_W).fill(TIF));
		for (let c = 0; c < HOUSE_W; c++) { map[0][c] = TIW; map[HOUSE_H - 1][c] = TIW; }
		for (let r = 0; r < HOUSE_H; r++) { map[r][0] = TIW; map[r][HOUSE_W - 1] = TIW; }
		map[HOUSE_DOOR_R][HOUSE_DOOR_C] = TD;
		// 2×2 rug roughly centered
		map[6][7] = TRU; map[6][8] = TRU;
		map[7][7] = TRU; map[7][8] = TRU;
		// Stairs in the north-east corner, two tiles wide
		map[1][12] = TST; map[1][13] = TST;
		map[2][12] = TST; map[2][13] = TST;
		return map;
	}

	// ── Phaser Scenes ────────────────────────────────────────────────────────────
	function makeSceneClass() {
		return class CampScene extends Phaser.Scene {
			constructor() { super({ key: 'camp' }); }

			init(data) {
				// 'from-house' spawns the player just south of the camp door.
				// Prefer init data; fall back to URL-hash boot data captured at start().
				this.spawnFrom = (data && data.from) || consumeBootFrom('camp') || null;
			}

			preload() {
				// Load the raw sheet — we'll palette-swap it into a canvas and
				// register that canvas as the 'player' spritesheet below.
				this.load.image('player-base', 'Pictures/sprites/calem.png');
				// PMD walk sheet: 7 frames × 8 directions (rows 0/2/4/6 = S/E/N/W).
				this.load.spritesheet('eevee', 'Pictures/sprites/eevee.png', { frameWidth: 40, frameHeight: 48 });
				// NPC sprite sheets (PMD walk; row 0 frame 0 used as the static idle).
				this.load.spritesheet('npc-pikachu',   'Pictures/sprites/pikachu.png',   { frameWidth: 32, frameHeight: 40 });
				this.load.spritesheet('npc-bulbasaur', 'Pictures/sprites/bulbasaur.png', { frameWidth: 40, frameHeight: 40 });
			}

			create() {
				console.log('[CampScene] create()');
				try {
					this._buildCamp();
					console.log('[CampScene] create() ok');
				} catch (e) {
					console.error('[CampScene] create failed:', e);
					Debug.lastError = 'CampScene.create: ' + e.message;
				}
			}

			_buildCamp() {
				this.tick = 0;
				this.map = buildMap();

				const W = MAP_W * TILE, H = MAP_H * TILE;
				// Reuse the existing canvas textures across scene boots — but only if
				// the existing entry is actually a CanvasTexture (has getContext). On
				// some Phaser builds textures.get() can return a base Texture on the
				// second boot, which would silently throw inside getContext() and abort
				// CampScene.create() — leaving the HOUSE scene wedged.
				const grabCanvasTex = (key) => {
					const existing = this.textures.exists(key) ? this.textures.get(key) : null;
					if (existing && typeof existing.getContext === 'function') return existing;
					if (existing) {
						try { this.textures.remove(key); } catch (_) {}
					}
					return this.textures.createCanvas(key, W, H);
				};
				this.baseTex = grabCanvasTex('campBase');
				this.animTex = grabCanvasTex('campAnim');
				if (!this.baseTex || !this.animTex) {
					throw new Error('createCanvas returned null for camp textures');
				}
				const baseCtx = this.baseTex.getContext();
				const animCtx = this.animTex.getContext();
				baseCtx.imageSmoothingEnabled = false;
				animCtx.imageSmoothingEnabled = false;
				this.animCtx = animCtx;

				this.animatedCells = [];
				for (let r = 0; r < MAP_H; r++) {
					for (let c = 0; c < MAP_W; c++) {
						const t = this.map[r][c];
						if (ANIMATED.has(t)) {
							this.animatedCells.push([r, c, t]);
							drawTile(baseCtx, TG, c*TILE, r*TILE, 0);
						} else {
							drawTile(baseCtx, t, c*TILE, r*TILE, 0);
						}
					}
				}
				this.baseTex.refresh();

				this.add.image(0, 0, 'campBase').setOrigin(0).setDepth(0);
				this.add.image(0, 0, 'campAnim').setOrigin(0).setDepth(1);

				// Chimney overlay
				const wx = 7*TILE + 4, wy = 2*TILE + 2;
				const cg = this.add.graphics().setDepth(2);
				cg.fillStyle(0x501010, 1); cg.fillRect(wx+1, wy, 6, 14);
				cg.fillStyle(0x701818, 1); cg.fillRect(wx+2, wy+1, 4, 12);
				cg.fillStyle(0x401010, 1); cg.fillRect(wx, wy, 8, 3);
				cg.fillStyle(0x602020, 1); cg.fillRect(wx+1, wy+1, 6, 2);

				// Palette-swap the base sheet into a canvas-backed spritesheet
				const baseImg = this.textures.get('player-base').getSourceImage();
				const pw = baseImg.width, ph = baseImg.height;
				this._playerCanvas = document.createElement('canvas');
				this._playerCanvas.width = pw;
				this._playerCanvas.height = ph;
				this._playerCtx = this._playerCanvas.getContext('2d');
				this._playerBaseImg = baseImg;

				const applyPalette = () => {
					if (window.TrainerPalette) {
						window.TrainerPalette.recolor(this._playerBaseImg, window.TrainerPalette.load(), this._playerCtx);
					} else {
						this._playerCtx.clearRect(0, 0, pw, ph);
						this._playerCtx.drawImage(this._playerBaseImg, 0, 0);
					}
				};
				applyPalette();
				if (!this.textures.exists('player')) {
					this.textures.addSpriteSheet('player', this._playerCanvas, { frameWidth: 22, frameHeight: 38 });
				} else {
					this.textures.get('player').refresh();
				}

				this._onStorage = (e) => {
					if (e.key === 'pokequiz_trainer_palette' && window.TrainerPalette) {
						applyPalette();
						this.textures.get('player').refresh();
					}
				};
				window.addEventListener('storage', this._onStorage);
				this.events.once('shutdown', () => window.removeEventListener('storage', this._onStorage));

				// Walk animations: row order in sheet = south, west, north, east
				const mkAnim = (key, frames) => {
					if (!this.anims.exists(key)) {
						this.anims.create({
							key, frameRate: 6, repeat: -1,
							frames: this.anims.generateFrameNumbers('player', { frames }),
						});
					}
				};
				mkAnim('walk-south', [1, 0, 2, 0]);
				mkAnim('walk-west',  [4, 3, 5, 3]);
				mkAnim('walk-north', [7, 6, 8, 6]);
				mkAnim('walk-east',  [10, 9, 11, 9]);

				// Spawn just south of the camp door if coming back from inside the house,
				// otherwise the default starting position on the path.
				const spawnTileR = this.spawnFrom === 'house' ? 12 : 14;
				this.player = this.physics.add.sprite(11*TILE + TILE/2, spawnTileR*TILE + TILE/2, 'player', 0);
				// Origin: feet at the bottom-centre of the frame (foot point ≈ y=36 in 38-tall frame)
				this.player.setOrigin(0.5, 36/38);
				this.player.setScale(0.75);  // shrink trainer to roughly one-tile-wide for tile-scale match
				this.player.setDepth(3);
				// Physics body — small rectangle covering the feet so collision feels tile-aligned
				this.player.body.setSize(10, 6);
				this.player.body.setOffset((22-10)/2, 38-8);

				// Solid tile bodies
				this.solids = this.physics.add.staticGroup();
				for (let r = 0; r < MAP_H; r++) {
					for (let c = 0; c < MAP_W; c++) {
						if (SOLID.has(this.map[r][c])) {
							const rect = this.add.rectangle(c*TILE + TILE/2, r*TILE + TILE/2, TILE, TILE);
							this.physics.add.existing(rect, true);
							this.solids.add(rect);
						}
					}
				}
				this.physics.add.collider(this.player, this.solids);

				this.physics.world.setBounds(0, 0, W, H);
				this.player.setCollideWorldBounds(true);

				this.cameras.main.setBounds(0, 0, W, H);
				this.cameras.main.startFollow(this.player, true, 1, 1);
				this.cameras.main.setBackgroundColor('#68A028');
				this.cameras.main.setRoundPixels(true);
				this.applyZoom();
				this.scale.on('resize', this.onResize, this);
				this.events.once('shutdown', () => this.scale.off('resize', this.onResize, this));

				this.keys = this.input.keyboard.addKeys({
					up: Phaser.Input.Keyboard.KeyCodes.UP,
					down: Phaser.Input.Keyboard.KeyCodes.DOWN,
					left: Phaser.Input.Keyboard.KeyCodes.LEFT,
					right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
					w: Phaser.Input.Keyboard.KeyCodes.W,
					a: Phaser.Input.Keyboard.KeyCodes.A,
					s: Phaser.Input.Keyboard.KeyCodes.S,
					d: Phaser.Input.Keyboard.KeyCodes.D,
					interact: Phaser.Input.Keyboard.KeyCodes.E,
				});
				this.dpad = { up:false, down:false, left:false, right:false };
				this.setupJoystick();
				setupPauseMenu(this.game);

				// Chimney smoke particles + container behind the player so puffs don't
				// occlude the trainer. The chimney tile is at row 2 col 7 in the map.
				this.smokeContainer = this.add.container(0, 0).setDepth(2);
				this.smoke = [];

				// Drifting leaf particles — small autumn-coloured rectangles that fall
				// across the camera viewport at random.
				this.leafContainer = this.add.container(0, 0).setDepth(4).setScrollFactor(0);
				this.leaves = [];

				this.dir = 0;
				this.dirAnimKeys = ['walk-south', 'walk-west', 'walk-north', 'walk-east'];
				// Idle frame index per direction (frame 0 of each row)
				this.dirIdleFrame = [0, 3, 6, 9];
				this.player.setFrame(this.dirIdleFrame[this.dir]);

				// Eevee follower — trails behind the player via a position-history buffer.
				// PMD 7-frame walk × 4 cardinal directions (rows 0/2/4/6 of an 8-row sheet).
				// Origin Y = 30/48 anchors at the feet (sampled from the south-idle frame).
				const eeveeAnims = [
					['eevee-walk-south', [0,1,2,3,4,5,6],        0],   // dir 0 (south)
					['eevee-walk-west',  [42,43,44,45,46,47,48], 42],  // dir 1 (west) — row 6
					['eevee-walk-north', [28,29,30,31,32,33,34], 28],  // dir 2 (north) — row 4
					['eevee-walk-east',  [14,15,16,17,18,19,20], 14],  // dir 3 (east) — row 2
				];
				for (const [key, frames] of eeveeAnims) {
					if (!this.anims.exists(key)) {
						this.anims.create({ key, frameRate: 10, repeat: -1,
							frames: this.anims.generateFrameNumbers('eevee', { frames }) });
					}
				}
				this.eeveeAnimKeys = eeveeAnims.map(([k]) => k);
				this.eeveeIdleFrame = eeveeAnims.map(([,,idle]) => idle);
				this.follower = this.add.sprite(this.player.x, this.player.y + 14, 'eevee', this.eeveeIdleFrame[0]);
				this.follower.setOrigin(0.5, 30/48);
				this.follower.setScale(0.8);
				this.follower.setDepth(3.5);
				this.followerHistory = [];
				this.followerDir = 0;
				this.followerMode = 'trail';   // 'trail' while player moves, 'faceoff' once stopped
				this.followerTarget = null;
				this.followerPath = null;      // remaining waypoints during faceoff routing
				// Direction → tile-offset vector (matches this.dir: 0=south, 1=west, 2=north, 3=east).
				this.DIR_VEC = [[0,1],[-1,0],[0,-1],[1,0]];

				// Door-transition guard — flipped true the moment we trigger scene.start
				// so we don't re-fire while the next scene boots.
				this.didTransition = false;
				// When we arrived from the house, the player is one tile south of the
				// door. The door check would re-fire the moment they walk north onto it
				// without this — wait until they step OFF the door area to re-arm.
				this.armedForDoor = this.spawnFrom !== 'house';

				// Spawn NPCs from the NPCS table. They render frame 0 of their walk
				// sheet (south idle), block movement via static collision rects, and
				// register into npcByTile for the E-key interaction prompt.
				this.npcByTile = {};
				const npcSolids = this.physics.add.staticGroup();
				for (const npc of NPCS) {
					const x = npc.c * TILE + TILE/2;
					const y = npc.r * TILE + TILE/2;
					const sprite = this.add.sprite(x, y, 'npc-' + npc.species, 0);
					sprite.setOrigin(0.5, (npc.frameHeight - 4) / npc.frameHeight);
					sprite.setScale(npc.spriteScale);
					sprite.setDepth(3);
					const rect = this.add.rectangle(x, y, TILE, TILE);
					this.physics.add.existing(rect, true);
					npcSolids.add(rect);
					this.npcByTile[npc.r + ',' + npc.c] = npc;
				}
				this.physics.add.collider(this.player, npcSolids);

				// Berry planting state — restored from localStorage so plants persist
				// across page reloads (including the house/camp scene swaps).
				this.plants = Plants.load();
				this.plantSprites = {}; // r,c → Phaser graphics representing the plant
				this.plantContainer = this.add.container(0, 0).setDepth(1.5);
				this._refreshPlantSprites();

				// Pre-render the static mini-map once. It mirrors the full map at tiny
				// scale; the player dot is overlaid every frame in updateMinimap().
				this.minimapEl = document.getElementById('campMinimap');
				if (this.minimapEl) {
					this.minimapEl.width = MAP_W * 3;
					this.minimapEl.height = MAP_H * 3;
					const mctx = this.minimapEl.getContext('2d');
					mctx.imageSmoothingEnabled = false;
					for (let r = 0; r < MAP_H; r++) {
						for (let c = 0; c < MAP_W; c++) {
							mctx.fillStyle = miniMapColor(this.map[r][c]);
							mctx.fillRect(c*3, r*3, 3, 3);
						}
					}
					this.minimapBase = mctx.getImageData(0, 0, this.minimapEl.width, this.minimapEl.height);
				}
			}

			findInteractTarget() {
				// Pick the tile directly in front of the player (one tile in this.dir),
				// plus the tile the player is standing on (so door entry also works).
				const tc = Math.floor(this.player.x / TILE);
				const tr = Math.floor(this.player.y / TILE);
				const [dvx, dvy] = this.DIR_VEC[this.dir];
				const candidates = [[tc + dvx, tr + dvy], [tc, tr]];
				for (const [c, r] of candidates) {
					const npc = this.npcByTile && this.npcByTile[r + ',' + c];
					if (npc) return { kind: 'npc', r, c, message: npc.dialog, label: npc.label };
					if (!this.map[r] || this.map[r][c] === undefined) continue;
					const t = this.map[r][c];
					if (t === TSG) {
						const msg = SIGN_MESSAGES[r + ',' + c];
						if (msg) return { kind: 'sign', r, c, message: msg };
					}
					if (t === TD) return { kind: 'door', r, c };
					// Soil tile — plant if free + have seeds, harvest if ripe, status otherwise.
					if (t === TSO || t === TCR) {
						const plant = this._findPlantAt(r, c);
						if (plant) {
							const ripe = (Date.now() - plant.plantedAt) >= GROW_MS;
							if (ripe) return { kind: 'harvest', r, c, label: 'Harvest' };
							return { kind: 'growing', r, c, label: 'Growing…', message: 'A seed is sprouting here. Come back in a bit.' };
						}
						return { kind: 'plant', r, c, label: 'Plant' };
					}
				}
				return null;
			}

			_findPlantAt(r, c) {
				for (const p of (this.plants || [])) {
					if (p.r === r && p.c === c) return p;
				}
				return null;
			}

			_refreshPlantSprites() {
				if (!this.plantContainer) return;
				this.plantContainer.removeAll(true);
				this.plantSprites = {};
				for (const p of this.plants) {
					const ripe = (Date.now() - p.plantedAt) >= GROW_MS;
					const x = p.c * TILE + TILE/2;
					const y = p.r * TILE + TILE/2;
					const g = this.add.graphics();
					if (ripe) {
						g.fillStyle(0x2A5018, 1); g.fillRect(x-1, y+2, 2, 3);    // stem
						g.fillStyle(0xC03838, 1); g.fillCircle(x, y-1, 3);        // berry red
						g.fillStyle(0xFFB0B0, 1); g.fillRect(x-1, y-2, 1, 1);     // berry highlight
						g.fillStyle(0x2A5018, 1); g.fillRect(x+1, y-3, 1, 1);     // leaf
					} else {
						g.fillStyle(0x2A5018, 1); g.fillRect(x, y, 1, 4);          // stem
						g.fillStyle(0x62A030, 1); g.fillRect(x-1, y-1, 3, 2);      // leaf cluster
						g.fillStyle(0x9ED860, 1); g.fillRect(x-1, y-1, 1, 1);
					}
					this.plantContainer.add(g);
					this.plantSprites[p.r + ',' + p.c] = g;
				}
			}

			_handlePlantAction(target) {
				const inv = Inventory.load();
				if (target.kind === 'plant') {
					if (inv.seeds <= 0) {
						Dialog.open('You have no seeds! Talk to the farmer or check the soil later.');
						return true;
					}
					inv.seeds -= 1;
					Inventory.save(inv);
					this.plants.push({ r: target.r, c: target.c, plantedAt: Date.now() });
					Plants.save(this.plants);
					this._refreshPlantSprites();
					return true;
				}
				if (target.kind === 'harvest') {
					this.plants = this.plants.filter(p => !(p.r === target.r && p.c === target.c));
					Plants.save(this.plants);
					inv.friendshipBerries = (inv.friendshipBerries || 0) + 1;
					Inventory.save(inv);
					this._refreshPlantSprites();
					Dialog.open('You harvested a Friendship Berry!');
					return true;
				}
				if (target.kind === 'growing') {
					Dialog.open(target.message);
					return true;
				}
				return false;
			}

			_updateInventoryHud() {
				const el = document.getElementById('campInventory');
				if (!el) return;
				const inv = Inventory.load();
				el.textContent = '🌱 ' + inv.seeds + '   🍓 ' + (inv.friendshipBerries || 0);
			}

			showPrompt(label) {
				const el = document.getElementById('campPrompt');
				const lbl = document.getElementById('campPromptLabel');
				if (!el) return;
				if (!label || Dialog.isOpen()) { el.hidden = true; return; }
				if (lbl) lbl.textContent = label;
				el.hidden = false;
				// Anchor the prompt above the player's on-screen position
				const cam = this.cameras.main;
				const sx = (this.player.x - cam.worldView.x) * cam.zoom;
				const sy = (this.player.y - cam.worldView.y) * cam.zoom;
				el.style.left = sx + 'px';
				el.style.top  = sy + 'px';
				el.style.transform = 'translate(-50%, calc(-100% - 12px))';
			}

			updateLeaves() {
				if (!this.leafContainer) return;
				const vw = this.scale.width;
				const vh = this.scale.height;
				if (this.tick % 90 === 0 && this.leaves.length < 10) {
					const colors = [0xD86820, 0xC04018, 0xE89000, 0x8C5A18];
					const col = colors[(Math.random() * colors.length) | 0];
					const leaf = this.add.rectangle(Math.random() * vw, -10, 4, 4, col, 0.85);
					leaf.setOrigin(0.5);
					leaf.angle = Math.random() * 360;
					this.leafContainer.add(leaf);
					this.leaves.push({
						obj: leaf,
						driftX: (Math.random() * 1.2 - 0.6),
						spin: (Math.random() * 4 - 2),
						sway: Math.random() * Math.PI * 2,
					});
				}
				for (let i = this.leaves.length - 1; i >= 0; i--) {
					const l = this.leaves[i];
					l.sway += 0.06;
					l.obj.x += l.driftX + Math.sin(l.sway) * 0.4;
					l.obj.y += 0.6;
					l.obj.angle += l.spin;
					if (l.obj.y > vh + 16) {
						l.obj.destroy();
						this.leaves.splice(i, 1);
					}
				}
			}

			updateSmoke() {
				if (!this.smokeContainer) return;
				// Chimney origin in world coords — matches the graphics block in create()
				const sx = 7*TILE + 8;
				const sy = 2*TILE + 2;
				if (this.tick % 18 === 0) {
					const puff = this.add.circle(sx + (Math.random()*2 - 1), sy, 3, 0xe0d6c0, 0.7);
					this.smokeContainer.add(puff);
					this.smoke.push({ obj: puff, life: 0, max: 80, drift: (Math.random()*0.6 - 0.3) });
				}
				for (let i = this.smoke.length - 1; i >= 0; i--) {
					const s = this.smoke[i];
					s.life++;
					const p = s.life / s.max;
					s.obj.x += s.drift;
					s.obj.y -= 0.4;
					s.obj.setRadius(3 + p * 4);
					s.obj.setAlpha((1 - p) * 0.7);
					if (s.life >= s.max) {
						s.obj.destroy();
						this.smoke.splice(i, 1);
					}
				}
			}

			updateMinimap() {
				if (!this.minimapEl || !this.minimapBase) return;
				const mctx = this.minimapEl.getContext('2d');
				mctx.putImageData(this.minimapBase, 0, 0);
				// Player dot — bright yellow
				const px = Math.floor(this.player.x / TILE) * 3;
				const py = Math.floor(this.player.y / TILE) * 3;
				mctx.fillStyle = '#ffe040';
				mctx.fillRect(px - 1, py - 1, 5, 5);
				mctx.fillStyle = '#ffffff';
				mctx.fillRect(px, py, 3, 3);
			}

			onResize() {
				applyWrapTop();
				this.applyZoom();
			}

			applyZoom() {
				const W = this.scale.width;
				const H = this.scale.height;
				let s = Math.max(2, Math.floor(Math.min(W / 380, H / 240)));
				s = Math.min(s, 4);
				this.cameras.main.setZoom(s);
			}

			setupJoystick() {
				const base = document.getElementById('joystickBase');
				const knob = document.getElementById('joystickKnob');
				if (!base || !knob) return;
				// Re-bind the dpad each scene boot, but only attach DOM listeners once
				// so we don't stack handlers after camp↔house transitions.
				base.__campDpad = this.dpad;
				if (base.dataset.wired) return;
				base.dataset.wired = '1';
				const RADIUS = 42, DEAD = 0.18;
				let active = false, pointerId = null;

				function reset() {
					active = false; pointerId = null;
					const d = base.__campDpad;
					if (d) { d.up = d.down = d.left = d.right = false; }
					knob.style.transform = 'translate(-50%,-50%)';
				}
				function applyJoy(dx, dy) {
					const d = base.__campDpad;
					if (!d) return;
					const dist = Math.sqrt(dx*dx + dy*dy);
					const clamp = Math.min(dist, RADIUS);
					const nx = dist > 0 ? dx/dist : 0, ny = dist > 0 ? dy/dist : 0;
					knob.style.transform = `translate(calc(-50% + ${nx*clamp}px), calc(-50% + ${ny*clamp}px))`;
					const fx = dist > 0 ? dx/Math.max(dist, RADIUS) : 0;
					const fy = dist > 0 ? dy/Math.max(dist, RADIUS) : 0;
					d.left = fx < -DEAD; d.right = fx > DEAD;
					d.up   = fy < -DEAD; d.down  = fy > DEAD;
				}
				base.addEventListener('pointerdown', e => {
					if (active) return;
					active = true; pointerId = e.pointerId;
					base.setPointerCapture(e.pointerId);
					e.preventDefault();
					const r = base.getBoundingClientRect();
					applyJoy(e.clientX - r.left - r.width/2, e.clientY - r.top - r.height/2);
				});
				base.addEventListener('pointermove', e => {
					if (!active || e.pointerId !== pointerId) return;
					e.preventDefault();
					const r = base.getBoundingClientRect();
					applyJoy(e.clientX - r.left - r.width/2, e.clientY - r.top - r.height/2);
				});
				['pointerup','pointercancel'].forEach(ev => base.addEventListener(ev, e => {
					if (e.pointerId !== pointerId) return;
					e.preventDefault(); reset();
				}));
			}

			update() {
				this.tick++;
				// Freeze the scene the moment we've triggered a transition so we don't
				// keep updating the shared HUD/prompt DOM while HouseScene boots.
				if (this.didTransition) {
					this.player.setVelocity(0, 0);
					return;
				}
				applyDayNight();
				Dialog.tick();

				const dialogOpen = Dialog.isOpen();
				const k = this.keys, d = this.dpad;

				// Interaction prompt + E to read signs. When the dialog is open the player
				// freezes and E advances/closes the dialog instead of moving them.
				const target = this.findInteractTarget();
				this.showPrompt(target ? (target.label || (target.kind === 'door' ? 'Enter' : target.kind === 'npc' ? 'Talk' : 'Read')) : null);
				if (Phaser.Input.Keyboard.JustDown(k.interact)) {
					if (dialogOpen) Dialog.advance();
					else if (target && (target.kind === 'plant' || target.kind === 'harvest' || target.kind === 'growing')) {
						this._handlePlantAction(target);
					}
					else if (target && target.message) Dialog.open(target.message);
					else if (target && target.kind === 'door' && !this.didTransition && this.armedForDoor) {
						this.didTransition = true;
						safeSceneStart(this, 'house', { from: 'camp' });
						return;
					}
				}

				let vx = 0, vy = 0;
				if (!dialogOpen) {
					if (k.up.isDown    || k.w.isDown || d.up)    { vy = -SPEED; this.dir = 2; }
					if (k.down.isDown  || k.s.isDown || d.down)  { vy =  SPEED; this.dir = 0; }
					if (k.left.isDown  || k.a.isDown || d.left)  { vx = -SPEED; this.dir = 1; }
					if (k.right.isDown || k.d.isDown || d.right) { vx =  SPEED; this.dir = 3; }
					if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
				}
				this.player.setVelocity(vx, vy);

				const moving = vx !== 0 || vy !== 0;
				const animKey = this.dirAnimKeys[this.dir];
				if (moving) {
					if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== animKey) {
						this.player.anims.play(animKey, true);
					}
				} else {
					this.player.anims.stop();
					this.player.setFrame(this.dirIdleFrame[this.dir]);
				}

				const actx = this.animCtx;
				actx.clearRect(0, 0, MAP_W*TILE, MAP_H*TILE);
				for (const [r, c, t] of this.animatedCells) {
					drawTile(actx, t, c*TILE, r*TILE, this.tick);
				}
				this.animTex.refresh();
				this.updateSmoke();
				this.updateLeaves();
				this._updateInventoryHud();
				// Refresh plant visuals once per second to catch ripening.
				if (this.tick % 60 === 0) this._refreshPlantSprites();
				this.updateMinimap();

				// Trail mode: sample player position; follower lerps toward the oldest sample
				// so it lags ~1 sprite-width behind. Once the player stops, switch to face-off
				// mode: route Eevee around the player via a side waypoint, then to a tile
				// in front of the player, ending facing them.
				if (moving) {
					if (this.followerMode !== 'trail') {
						this.followerMode = 'trail';
						this.followerTarget = null;
						this.followerPath = null;
					}
					if (this.tick % 2 === 0) {
						this.followerHistory.push({ x: this.player.x, y: this.player.y });
						if (this.followerHistory.length > 8) this.followerHistory.shift();
					}
				} else if (this.followerMode === 'trail') {
					// Player just stopped — build a two-step path around the player.
					// Step 1: a tile perpendicular to the player's facing (right side),
					// Step 2: a tile in front of the player (final face-off position).
					this.followerMode = 'faceoff';
					this.followerHistory = [];
					const [dvx, dvy] = this.DIR_VEC[this.dir];
					const [pvx, pvy] = this.DIR_VEC[(this.dir + 1) % 4];
					this.followerPath = [
						{ x: this.player.x + pvx * TILE, y: this.player.y + pvy * TILE },
						{ x: this.player.x + dvx * TILE, y: this.player.y + dvy * TILE },
					];
					this.followerTarget = this.followerPath.shift();
				}

				const followTarget = this.followerMode === 'trail'
					? this.followerHistory[0]
					: this.followerTarget;
				if (followTarget) {
					const prevX = this.follower.x, prevY = this.follower.y;
					this.follower.x = Phaser.Math.Linear(this.follower.x, followTarget.x, 0.18);
					this.follower.y = Phaser.Math.Linear(this.follower.y, followTarget.y, 0.18);
					const fdx = this.follower.x - prevX;
					const fdy = this.follower.y - prevY;
					const fspeed = Math.hypot(fdx, fdy);
					if (fspeed > 0.15) {
						const dir = Math.abs(fdx) > Math.abs(fdy)
							? (fdx > 0 ? 3 : 1)
							: (fdy > 0 ? 0 : 2);
						if (dir !== this.followerDir || !this.follower.anims.isPlaying) {
							this.follower.anims.play(this.eeveeAnimKeys[dir], true);
							this.followerDir = dir;
						}
					} else if (this.followerMode === 'faceoff' && this.followerPath && this.followerPath.length > 0) {
						// Arrived at the side waypoint — advance to the final face-off tile.
						this.followerTarget = this.followerPath.shift();
					} else {
						if (this.follower.anims.isPlaying) this.follower.anims.stop();
						// Settled — face the player. In face-off mode that's the opposite of the
						// player's facing; in trail mode (rare: paused mid-trail) just orient at them.
						let faceDir;
						if (this.followerMode === 'faceoff') {
							faceDir = (this.dir + 2) % 4;
						} else {
							const ldx = this.player.x - this.follower.x;
							const ldy = this.player.y - this.follower.y;
							faceDir = Math.abs(ldx) + Math.abs(ldy) <= 4
								? this.followerDir
								: (Math.abs(ldx) > Math.abs(ldy) ? (ldx > 0 ? 3 : 1) : (ldy > 0 ? 0 : 2));
						}
						if (faceDir !== this.followerDir) {
							this.followerDir = faceDir;
							this.follower.setFrame(this.eeveeIdleFrame[faceDir]);
						}
					}
					this.follower.setDepth(this.follower.y > this.player.y ? 3.5 : 2.5);
				}

				// Walk onto the door → enter the house. The player has to walk at least
				// two tiles away from the door before the entry trigger re-arms, so a
				// quick step-off-then-step-back-on doesn't re-fire (which would soft-
				// lock the player on the door tile after exiting the house).
				const tc = Math.floor(this.player.x / TILE);
				const tr = Math.floor(this.player.y / TILE);
				const onDoorTile = this.map[tr] && this.map[tr][tc] === TD;
				const distFromDoor = Math.abs(tr - 11) + Math.abs(tc - 11);
				if (distFromDoor >= 2) this.armedForDoor = true;
				if (this.armedForDoor && onDoorTile && !this.didTransition) {
					this.didTransition = true;
					safeSceneStart(this, 'house', { from: 'camp' });
				}

				Debug.render(
					'CAMP\n' +
					'tile  ' + tc + ',' + tr + '\n' +
					'dir   ' + ['S','W','N','E'][this.dir] + '\n' +
					'distD ' + distFromDoor + '\n' +
					'onD   ' + onDoorTile + '\n' +
					'armed ' + this.armedForDoor + '\n' +
					'trans ' + this.didTransition + '\n' +
					'dlg   ' + dialogOpen + '\n' +
					'target ' + (target ? target.kind : '-') + '\n' +
					(Debug.lastError ? 'ERR ' + Debug.lastError : '')
				);
			}
		};
	}

	function makeHouseSceneClass() {
		return class HouseScene extends Phaser.Scene {
			constructor() { super({ key: 'house' }); }

			init(data) {
				// Consume any boot-hash from-data to keep parity with CampScene; the
				// house spawn is always one tile north of the exit door regardless.
				this.spawnFrom = (data && data.from) || consumeBootFrom('house') || null;
			}

			preload() {
				this.load.image('player-base', 'Pictures/sprites/calem.png');
			}

			create() {
				console.log('[HouseScene] create()');
				try {
					this._buildHouse();
					console.log('[HouseScene] create() ok — player at', this.player?.x, this.player?.y);
				} catch (e) {
					console.error('[HouseScene] create failed:', e);
					// Fall back to camp so the player isn't stranded on a black screen.
					this.scene.start('camp', { from: 'house' });
				}
				if (typeof window !== 'undefined') window.__houseScene = this;
			}

			_buildHouse() {
				this.tick = 0;
				this.map = buildHouseMap();
				const W = HOUSE_W * TILE, H = HOUSE_H * TILE;

				// House map is static — only build the texture the first time. Removing
				// and re-creating a canvas texture has caused null returns in Phaser 3
				// in some cases, leaving a black screen on the second entry.
				if (!this.textures.exists('houseBase')) {
					this.baseTex = this.textures.createCanvas('houseBase', W, H);
					if (!this.baseTex) {
						throw new Error('createCanvas("houseBase") returned null');
					}
					const baseCtx = this.baseTex.getContext();
					baseCtx.imageSmoothingEnabled = false;
					for (let r = 0; r < HOUSE_H; r++) {
						for (let c = 0; c < HOUSE_W; c++) {
							drawTile(baseCtx, this.map[r][c], c*TILE, r*TILE, 0);
						}
					}
					this.baseTex.refresh();
				} else {
					this.baseTex = this.textures.get('houseBase');
				}
				this.add.image(0, 0, 'houseBase').setOrigin(0).setDepth(0);

				// Palette-swap the trainer sheet — same pipeline as camp. Wrapped in
				// try/catch so a missing or half-loaded asset surfaces in the console
				// instead of silently producing a half-built scene.
				try {
					if (!this.textures.exists('player-base')) {
						throw new Error('player-base texture missing — Phaser loader did not cache calem.png');
					}
					const baseImg = this.textures.get('player-base').getSourceImage();
					const pw = baseImg.width, ph = baseImg.height;
					this._playerCanvas = document.createElement('canvas');
					this._playerCanvas.width = pw;
					this._playerCanvas.height = ph;
					this._playerCtx = this._playerCanvas.getContext('2d');
					const applyPalette = () => {
						if (window.TrainerPalette) {
							window.TrainerPalette.recolor(baseImg, window.TrainerPalette.load(), this._playerCtx);
						} else {
							this._playerCtx.clearRect(0, 0, pw, ph);
							this._playerCtx.drawImage(baseImg, 0, 0);
						}
					};
					applyPalette();
				} catch (e) {
					console.error('[HouseScene] palette swap failed:', e);
				}
				// Skip-if-exists: addSpriteSheet on a duplicate key returns null in
				// Phaser 3, which would later crash anim creation. The palette is
				// re-applied to this._playerCanvas above, but the texture keeps the
				// same source-canvas reference for the lifetime of the session.
				if (!this.textures.exists('player-house') && this._playerCanvas) {
					this.textures.addSpriteSheet('player-house', this._playerCanvas, { frameWidth: 22, frameHeight: 38 });
				} else if (this.textures.exists('player-house')) {
					this.textures.get('player-house').refresh();
				}
				this._onStorage = (e) => {
					if (e.key === 'pokequiz_trainer_palette' && window.TrainerPalette) {
						applyPalette();
						this.textures.get('player-house').refresh();
					}
				};
				window.addEventListener('storage', this._onStorage);
				this.events.once('shutdown', () => window.removeEventListener('storage', this._onStorage));

				const mkAnim = (key, frames) => {
					if (this.anims.exists(key)) this.anims.remove(key);
					this.anims.create({ key, frameRate: 6, repeat: -1,
						frames: this.anims.generateFrameNumbers('player-house', { frames }) });
				};
				mkAnim('h-walk-south', [1, 0, 2, 0]);
				mkAnim('h-walk-west',  [4, 3, 5, 3]);
				mkAnim('h-walk-north', [7, 6, 8, 6]);
				mkAnim('h-walk-east',  [10, 9, 11, 9]);

				// Spawn one tile north of the exit door, facing north.
				const spawnX = HOUSE_DOOR_C*TILE + TILE/2;
				const spawnY = (HOUSE_DOOR_R - 1)*TILE + TILE/2;
				this.player = this.physics.add.sprite(spawnX, spawnY, 'player-house', 0);
				this.player.setOrigin(0.5, 36/38);
				this.player.setScale(0.75);
				this.player.setDepth(3);
				this.player.body.setSize(10, 6);
				this.player.body.setOffset((22-10)/2, 38-8);

				this.solids = this.physics.add.staticGroup();
				for (let r = 0; r < HOUSE_H; r++) {
					for (let c = 0; c < HOUSE_W; c++) {
						if (SOLID.has(this.map[r][c])) {
							const rect = this.add.rectangle(c*TILE + TILE/2, r*TILE + TILE/2, TILE, TILE);
							this.physics.add.existing(rect, true);
							this.solids.add(rect);
						}
					}
				}
				this.physics.add.collider(this.player, this.solids);

				this.physics.world.setBounds(0, 0, W, H);
				this.player.setCollideWorldBounds(true);
				// Interior is a fixed room — keep the camera centered on it instead of
				// following the player. Use very large bounds so centerOn can produce
				// negative scroll when the viewport is bigger than the room without
				// being clamped to zero.
				this.cameras.main.setBounds(-4000, -4000, 8000, 8000);
				this.cameras.main.setBackgroundColor('#1a0e08');
				this.cameras.main.setRoundPixels(true);
				this.applyZoom();
				this.scale.on('resize', this.onResize, this);
				this.events.once('shutdown', () => this.scale.off('resize', this.onResize, this));

				this.keys = this.input.keyboard.addKeys({
					up: Phaser.Input.Keyboard.KeyCodes.UP,
					down: Phaser.Input.Keyboard.KeyCodes.DOWN,
					left: Phaser.Input.Keyboard.KeyCodes.LEFT,
					right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
					w: Phaser.Input.Keyboard.KeyCodes.W,
					a: Phaser.Input.Keyboard.KeyCodes.A,
					s: Phaser.Input.Keyboard.KeyCodes.S,
					d: Phaser.Input.Keyboard.KeyCodes.D,
					interact: Phaser.Input.Keyboard.KeyCodes.E,
				});
				this.dpad = { up:false, down:false, left:false, right:false };
				this.setupJoystick();
				setupPauseMenu(this.game);

				this.dir = 2; // facing north (player just stepped through the door)
				this.dirAnimKeys = ['h-walk-south', 'h-walk-west', 'h-walk-north', 'h-walk-east'];
				this.dirIdleFrame = [0, 3, 6, 9];
				this.player.setFrame(this.dirIdleFrame[this.dir]);
				this.didTransition = false;
				// The player spawns one tile north of the door, so the exit is just a
				// single step south. Start armed — there's no risk of re-bouncing here
				// because Phaser fully tears down CampScene before this scene runs.
				this.armedForExit = true;
			}

			onResize() {
				applyWrapTop();
				this.applyZoom();
			}

			applyZoom() {
				const vw = this.scale.width;
				const vh = this.scale.height;
				// Phaser's RESIZE mode can fire onResize before layout settles, leaving
				// vw/vh at 0 on the very first call. Bail and re-try on the next tick.
				if (vw <= 0 || vh <= 0) {
					this.events.once('postupdate', () => this.applyZoom());
					return;
				}
				const roomW = HOUSE_W * TILE;
				const roomH = HOUSE_H * TILE;
				// Pick the largest integer zoom that still fits the whole room in view.
				let s = Math.min(vw / roomW, vh / roomH);
				s = Math.max(2, Math.floor(s));
				s = Math.min(s, 5);
				const cam = this.cameras.main;
				cam.setZoom(s);
				// centerOn computes scrollX/Y so the world point at (x, y) sits at the
				// middle of the viewport. With the large camera bounds set in create()
				// the resulting scroll won't be clamped if the viewport is bigger than
				// the room.
				cam.centerOn(roomW / 2, roomH / 2);
			}

			setupJoystick() {
				const base = document.getElementById('joystickBase');
				const knob = document.getElementById('joystickKnob');
				if (!base || !knob) return;
				// Joystick handlers attach once across all scene boots — only the dpad
				// reference is swapped so it always points at the current scene's state.
				base.__campDpad = this.dpad;
				if (base.dataset.wired) return;
				base.dataset.wired = '1';
				const RADIUS = 42, DEAD = 0.18;
				let active = false, pointerId = null;
				const reset = () => {
					active = false; pointerId = null;
					const d = base.__campDpad;
					if (d) { d.up = d.down = d.left = d.right = false; }
					knob.style.transform = 'translate(-50%,-50%)';
				};
				const applyJoy = (dx, dy) => {
					const d = base.__campDpad;
					if (!d) return;
					const dist = Math.sqrt(dx*dx + dy*dy);
					const clamp = Math.min(dist, RADIUS);
					const nx = dist > 0 ? dx/dist : 0, ny = dist > 0 ? dy/dist : 0;
					knob.style.transform = `translate(calc(-50% + ${nx*clamp}px), calc(-50% + ${ny*clamp}px))`;
					const fx = dist > 0 ? dx/Math.max(dist, RADIUS) : 0;
					const fy = dist > 0 ? dy/Math.max(dist, RADIUS) : 0;
					d.left = fx < -DEAD; d.right = fx > DEAD;
					d.up   = fy < -DEAD; d.down  = fy > DEAD;
				};
				base.addEventListener('pointerdown', e => {
					if (active) return;
					active = true; pointerId = e.pointerId;
					base.setPointerCapture(e.pointerId);
					e.preventDefault();
					const r = base.getBoundingClientRect();
					applyJoy(e.clientX - r.left - r.width/2, e.clientY - r.top - r.height/2);
				});
				base.addEventListener('pointermove', e => {
					if (!active || e.pointerId !== pointerId) return;
					e.preventDefault();
					const r = base.getBoundingClientRect();
					applyJoy(e.clientX - r.left - r.width/2, e.clientY - r.top - r.height/2);
				});
				['pointerup','pointercancel'].forEach(ev => base.addEventListener(ev, e => {
					if (e.pointerId !== pointerId) return;
					e.preventDefault(); reset();
				}));
			}

			update() {
				this.tick++;
				// If we've already triggered the exit, freeze the scene so we don't
				// keep writing to shared DOM elements (prompt/HUD) on top of CampScene
				// while the queued transition is still processing.
				if (this.didTransition) {
					this.player.setVelocity(0, 0);
					return;
				}
				applyDayNight();
				Dialog.tick();
				const dialogOpen = Dialog.isOpen();
				const k = this.keys, d = this.dpad;
				let vx = 0, vy = 0;
				if (!dialogOpen) {
					if (k.up.isDown    || k.w.isDown || d.up)    { vy = -SPEED; this.dir = 2; }
					if (k.down.isDown  || k.s.isDown || d.down)  { vy =  SPEED; this.dir = 0; }
					if (k.left.isDown  || k.a.isDown || d.left)  { vx = -SPEED; this.dir = 1; }
					if (k.right.isDown || k.d.isDown || d.right) { vx =  SPEED; this.dir = 3; }
					if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
				}
				this.player.setVelocity(vx, vy);

				const moving = vx !== 0 || vy !== 0;
				const animKey = this.dirAnimKeys[this.dir];
				if (moving) {
					if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== animKey) {
						this.player.anims.play(animKey, true);
					}
				} else {
					this.player.anims.stop();
					this.player.setFrame(this.dirIdleFrame[this.dir]);
				}

				const tc = Math.floor(this.player.x / TILE);
				const tr = Math.floor(this.player.y / TILE);
				const onDoor = tc === HOUSE_DOOR_C && tr === HOUSE_DOOR_R;
				// Require at least two tiles of distance before re-arming so a quick
				// step-onto-the-door right after spawn doesn't bounce the player back
				// to camp. Same shape as CampScene's armedForDoor logic.
				const distFromDoor = Math.abs(tr - HOUSE_DOOR_R) + Math.abs(tc - HOUSE_DOOR_C);
				if (distFromDoor >= 2) this.armedForExit = true;

				// Show the interaction prompt + E-key exit when standing right next to
				// the door. The prompt sits above the player on-screen.
				const pe = document.getElementById('campPrompt');
				const lbl = document.getElementById('campPromptLabel');
				const nearDoor = distFromDoor === 1 || onDoor;
				if (pe && lbl) {
					if (nearDoor && !dialogOpen) {
						lbl.textContent = 'Exit';
						pe.hidden = false;
						const cam = this.cameras.main;
						const sx = (this.player.x - cam.worldView.x) * cam.zoom;
						const sy = (this.player.y - cam.worldView.y) * cam.zoom;
						pe.style.left = sx + 'px';
						pe.style.top  = sy + 'px';
						pe.style.transform = 'translate(-50%, calc(-100% - 12px))';
					} else {
						pe.hidden = true;
					}
				}

				const ePressed = Phaser.Input.Keyboard.JustDown(k.interact);
				const triggerExit = !this.didTransition && this.armedForExit && (
					onDoor || (ePressed && nearDoor)
				);
				if (triggerExit) {
					this.didTransition = true;
					safeSceneStart(this, 'camp', { from: 'house' });
				}

				Debug.render(
					'HOUSE\n' +
					'tile  ' + tc + ',' + tr + '\n' +
					'doorAt ' + HOUSE_DOOR_C + ',' + HOUSE_DOOR_R + '\n' +
					'pos   ' + Math.round(this.player.x) + ',' + Math.round(this.player.y) + '\n' +
					'dir   ' + ['S','W','N','E'][this.dir] + '\n' +
					'distD ' + distFromDoor + '\n' +
					'onD   ' + onDoor + '\n' +
					'near  ' + nearDoor + '\n' +
					'armed ' + this.armedForExit + '\n' +
					'trans ' + this.didTransition + '\n' +
					'E     ' + ePressed + '\n' +
					'trigE ' + triggerExit + '\n' +
					(Debug.lastError ? 'ERR ' + Debug.lastError : '')
				);
			}
		};
	}

	function start() {
		const wrap = document.getElementById('campWrap');
		if (!wrap) return;
		if (!window.Phaser) { setTimeout(start, 30); return; }

		applyWrapTop();
		window.addEventListener('resize', applyWrapTop);
		window.addEventListener('load', applyWrapTop);
		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(applyWrapTop);
		}

		// Reorder the scene list so Phaser auto-starts the right one. The hash
		// is captured into _bootData here and cleared from the URL immediately so
		// a refresh-after-walking-around doesn't teleport the player back. Each
		// scene's init() consumes the boot 'from' value via consumeBootFrom().
		_bootData = readBootHash();
		const boot = _bootData;
		const CampClass = makeSceneClass();
		const HouseClass = makeHouseSceneClass();
		const sceneList = boot.scene === 'house' ? [HouseClass, CampClass] : [CampClass, HouseClass];
		new Phaser.Game({
			type: Phaser.AUTO,
			parent: 'campWrap',
			backgroundColor: '#68A028',
			pixelArt: true,
			roundPixels: true,
			scale: {
				mode: Phaser.Scale.RESIZE,
				width: '100%',
				height: '100%',
			},
			physics: {
				default: 'arcade',
				arcade: { gravity: { y: 0 }, debug: false },
			},
			scene: sceneList,
		});
		// Clear the hash so a refresh from inside the house doesn't permanently
		// reboot you into the house, and so the back-button doesn't loop you in.
		if (window.location.hash) {
			history.replaceState(null, '', window.location.pathname + window.location.search);
		}
		// Fade out the black overlay once the first scene has had a moment to paint.
		setTimeout(() => {
			const fade = document.getElementById('campFade');
			if (fade) fade.classList.add('is-hidden');
		}, 250);
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
	else start();
})();
