(function () {
	'use strict';

	const TILE = 16;
	const MAP_W = 40;
	const MAP_H = 30;
	const SPEED = 84; // px/sec — matches old 1.4 px/frame at 60fps

	// Tile IDs
	const TG=0,TG2=1,TP=2,TW=3,TR=4,TR2=5,TWN=6,TD=7,TH2O=8,TTR=9,TFR=10,TFY=11,TSO=12,TCR=13,TFN=14,TRP=15;

	const SOLID = new Set([TW, TR, TR2, TRP, TWN, TH2O, TTR, TFN]);
	const ANIMATED = new Set([TWN, TH2O, TCR]);

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

	// ── Phaser Scene ─────────────────────────────────────────────────────────────
	function makeSceneClass() {
		return class CampScene extends Phaser.Scene {
			constructor() { super({ key: 'camp' }); }

			preload() {
				// Load the raw sheet — we'll palette-swap it into a canvas and
				// register that canvas as the 'player' spritesheet below.
				this.load.image('player-base', 'Pictures/sprites/calem.png');
				// PMD walk sheet: 7 frames × 8 directions (rows 0/2/4/6 = S/E/N/W).
				this.load.spritesheet('eevee', 'Pictures/sprites/eevee.png', { frameWidth: 40, frameHeight: 48 });
			}

			create() {
				this.tick = 0;
				this.map = buildMap();

				const W = MAP_W * TILE, H = MAP_H * TILE;
				// Static base — drawn once. Animated overlay — drawn each frame.
				this.baseTex = this.textures.createCanvas('campBase', W, H);
				this.animTex = this.textures.createCanvas('campAnim', W, H);
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
				this.textures.addSpriteSheet('player', this._playerCanvas, { frameWidth: 22, frameHeight: 38 });

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

				this.player = this.physics.add.sprite(11*TILE + TILE/2, 14*TILE + TILE/2, 'player', 0);
				// Origin: feet at the bottom-centre of the frame (foot point ≈ y=36 in 38-tall frame)
				this.player.setOrigin(0.5, 36/38);
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

				this.keys = this.input.keyboard.addKeys({
					up: Phaser.Input.Keyboard.KeyCodes.UP,
					down: Phaser.Input.Keyboard.KeyCodes.DOWN,
					left: Phaser.Input.Keyboard.KeyCodes.LEFT,
					right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
					w: Phaser.Input.Keyboard.KeyCodes.W,
					a: Phaser.Input.Keyboard.KeyCodes.A,
					s: Phaser.Input.Keyboard.KeyCodes.S,
					d: Phaser.Input.Keyboard.KeyCodes.D,
				});
				this.dpad = { up:false, down:false, left:false, right:false };
				this.setupJoystick();

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
				// Direction → tile-offset vector (matches this.dir: 0=south, 1=west, 2=north, 3=east).
				this.DIR_VEC = [[0,1],[-1,0],[0,-1],[1,0]];
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
				const RADIUS = 42, DEAD = 0.18;
				let active = false, pointerId = null;
				const dpad = this.dpad;

				function reset() {
					active = false; pointerId = null;
					dpad.up = dpad.down = dpad.left = dpad.right = false;
					knob.style.transform = 'translate(-50%,-50%)';
				}
				function applyJoy(dx, dy) {
					const dist = Math.sqrt(dx*dx + dy*dy);
					const clamp = Math.min(dist, RADIUS);
					const nx = dist > 0 ? dx/dist : 0, ny = dist > 0 ? dy/dist : 0;
					knob.style.transform = `translate(calc(-50% + ${nx*clamp}px), calc(-50% + ${ny*clamp}px))`;
					const fx = dist > 0 ? dx/Math.max(dist, RADIUS) : 0;
					const fy = dist > 0 ? dy/Math.max(dist, RADIUS) : 0;
					dpad.left = fx < -DEAD; dpad.right = fx > DEAD;
					dpad.up   = fy < -DEAD; dpad.down  = fy > DEAD;
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

				const k = this.keys, d = this.dpad;
				let vx = 0, vy = 0;
				if (k.up.isDown    || k.w.isDown || d.up)    { vy = -SPEED; this.dir = 2; }
				if (k.down.isDown  || k.s.isDown || d.down)  { vy =  SPEED; this.dir = 0; }
				if (k.left.isDown  || k.a.isDown || d.left)  { vx = -SPEED; this.dir = 1; }
				if (k.right.isDown || k.d.isDown || d.right) { vx =  SPEED; this.dir = 3; }
				if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
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

				// Trail mode: sample player position; follower lerps toward the oldest sample
				// so it lags ~1 sprite-width behind. Once the player stops, switch to face-off
				// mode: walk to 1 tile in front of the player, then turn around to face them.
				if (moving) {
					if (this.followerMode !== 'trail') {
						this.followerMode = 'trail';
						this.followerTarget = null;
					}
					if (this.tick % 2 === 0) {
						this.followerHistory.push({ x: this.player.x, y: this.player.y });
						if (this.followerHistory.length > 8) this.followerHistory.shift();
					}
				} else if (this.followerMode === 'trail') {
					// Player just stopped — pick a tile in front of them as the face-off target.
					this.followerMode = 'faceoff';
					this.followerHistory = [];
					const [dvx, dvy] = this.DIR_VEC[this.dir];
					this.followerTarget = {
						x: this.player.x + dvx * TILE,
						y: this.player.y + dvy * TILE,
					};
				}

				const target = this.followerMode === 'trail'
					? this.followerHistory[0]
					: this.followerTarget;
				if (target) {
					const prevX = this.follower.x, prevY = this.follower.y;
					this.follower.x = Phaser.Math.Linear(this.follower.x, target.x, 0.18);
					this.follower.y = Phaser.Math.Linear(this.follower.y, target.y, 0.18);
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
					} else {
						if (this.follower.anims.isPlaying) this.follower.anims.stop();
						// Arrived — face the player. In face-off mode that's the opposite of the
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
			scene: [makeSceneClass()],
		});
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
	else start();
})();
