(function () {
	'use strict';

	const TILE = 32;
	const MAP_W = 40;
	const MAP_H = 30;

	// Mutable viewport — updated by resize()
	let VIEW_W = 640, VIEW_H = 360, SCALE = 2;

	// Tile IDs
	const TG=0,TG2=1,TP=2,TW=3,TR=4,TR2=5,TWN=6,TD=7,TH2O=8,TTR=9,TFR=10,TFY=11,TSO=12,TCR=13,TFN=14;

	const SOLID = new Set([TW, TR, TR2, TWN, TH2O, TTR, TFN]);

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

		fill(3,6,5,16,TR);
		for(let c=6;c<=16;c++) set(6,c,TR2);
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

	// ── Tile drawing ─────────────────────────────────────────────────────────────
	function drawTile(ctx, t, x, y, tick) {
		const d = TILE;
		switch(t) {
			case TG:
				ctx.fillStyle='#88C038'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#68A020';
				ctx.fillRect(x+4,y+5,2,6); ctx.fillRect(x+17,y+18,2,6); ctx.fillRect(x+26,y+7,2,6);
				ctx.fillStyle='#A0D848'; ctx.fillRect(x+9,y+12,7,3);
				break;
			case TG2:
				ctx.fillStyle='#78B028'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#589818';
				ctx.fillRect(x+3,y+4,2,7); ctx.fillRect(x+13,y+20,2,7); ctx.fillRect(x+22,y+11,2,7);
				ctx.fillStyle='#90C030'; ctx.fillRect(x+16,y+6,6,3);
				break;
			case TP:
				ctx.fillStyle='#D8C080'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#C0A868';
				ctx.fillRect(x+4,y+4,4,3); ctx.fillRect(x+17,y+14,3,3); ctx.fillRect(x+7,y+22,5,3); ctx.fillRect(x+23,y+9,3,2);
				ctx.fillStyle='#E8D898';
				ctx.fillRect(x+11,y+8,4,2); ctx.fillRect(x+20,y+22,4,2);
				break;
			case TR:
				ctx.fillStyle='#C84020'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#B03010'; ctx.fillRect(x,y+9,d,3); ctx.fillRect(x,y+20,d,3);
				ctx.fillStyle='#E05830'; ctx.fillRect(x,y,d,5);
				ctx.fillStyle='#F07040'; ctx.fillRect(x,y+1,d,2);
				ctx.fillStyle='#B03010'; ctx.fillRect(x+16,y,1,d);
				break;
			case TR2:
				ctx.fillStyle='#701808'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#9C2810'; ctx.fillRect(x,y+3,d,d-7);
				ctx.fillStyle='#501008'; ctx.fillRect(x,y+d-3,d,3);
				break;
			case TW:
				ctx.fillStyle='#F0EED8'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#D8D4B0'; ctx.fillRect(x+2,y+9,d-4,2); ctx.fillRect(x+2,y+20,d-4,2);
				ctx.fillStyle='#C8C4A0'; ctx.fillRect(x+d-2,y,2,d); ctx.fillRect(x,y+d-2,d,2);
				break;
			case TWN: {
				ctx.fillStyle='#F0EED8'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#785020'; ctx.fillRect(x+4,y+4,d-8,d-8);
				const gl=Math.sin(tick*0.022+x*0.012)*0.06+0.86;
				ctx.fillStyle=`rgba(100,180,240,${gl})`;
				ctx.fillRect(x+6,y+6,9,9); ctx.fillRect(x+17,y+6,9,9);
				ctx.fillRect(x+6,y+17,9,9); ctx.fillRect(x+17,y+17,9,9);
				ctx.fillStyle='#785020'; ctx.fillRect(x+14,y+5,2,d-10); ctx.fillRect(x+5,y+14,d-10,2);
				ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.fillRect(x+6,y+6,3,9); ctx.fillRect(x+17,y+6,3,9);
				ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.fillRect(x+7,y+7,3,2); ctx.fillRect(x+18,y+7,3,2);
				break;
			}
			case TD:
				ctx.fillStyle='#F0EED8'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5A3010'; ctx.fillRect(x+5,y+2,d-10,d-2);
				ctx.fillStyle='#8A5020'; ctx.fillRect(x+7,y+4,d-14,d-6);
				ctx.fillStyle='#703818'; ctx.fillRect(x+7,y+15,d-14,2);
				ctx.fillStyle='#A06030'; ctx.fillRect(x+8,y+5,5,5); ctx.fillRect(x+8,y+17,5,4);
				ctx.fillStyle='#F0A000'; ctx.fillRect(x+d-12,y+17,4,4);
				ctx.fillStyle='#FFD040'; ctx.fillRect(x+d-11,y+18,2,2);
				break;
			case TH2O: {
				const w1=Math.sin(tick*0.05+(x+y)*0.04)*2.5;
				const w2=Math.sin(tick*0.04+x*0.06)*2;
				ctx.fillStyle='#4878C8'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#6898E8';
				ctx.fillRect(x+2,y+w1+3,d-4,3); ctx.fillRect(x+3,y+w1+13,d-6,3); ctx.fillRect(x+2,y+w2+22,d-4,3);
				ctx.fillStyle='#90B8F8'; ctx.fillRect(x+5,y+w1+4,8,1); ctx.fillRect(x+18,y+w1+14,7,1);
				const sp=Math.floor(tick/10)%4;
				ctx.fillStyle='rgba(190,228,255,0.7)';
				if(sp===0) ctx.fillRect(x+10,y+6,5,5);
				else if(sp===1) ctx.fillRect(x+20,y+20,5,5);
				else if(sp===2) ctx.fillRect(x+5,y+20,5,5);
				else ctx.fillRect(x+22,y+6,5,5);
				ctx.fillStyle='rgba(255,255,255,0.5)';
				if(sp===0) ctx.fillRect(x+12,y+8,2,2);
				else if(sp===1) ctx.fillRect(x+22,y+22,2,2);
				else if(sp===2) ctx.fillRect(x+7,y+22,2,2);
				else ctx.fillRect(x+24,y+8,2,2);
				break;
			}
			case TTR:
				ctx.fillStyle='#68A028'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#604828'; ctx.fillRect(x+12,y+22,8,10);
				ctx.fillStyle='#785838'; ctx.fillRect(x+14,y+23,4,9);
				ctx.fillStyle='#284E18';
				ctx.fillRect(x+8,y+0,16,2); ctx.fillRect(x+4,y+2,24,3);
				ctx.fillRect(x+2,y+5,28,18); ctx.fillRect(x+4,y+23,24,2); ctx.fillRect(x+8,y+25,16,2);
				ctx.fillStyle='#48982E';
				ctx.fillRect(x+10,y+2,12,2); ctx.fillRect(x+6,y+4,20,19); ctx.fillRect(x+10,y+23,12,2);
				ctx.fillStyle='#60B840'; ctx.fillRect(x+8,y+4,16,16); ctx.fillRect(x+10,y+20,12,3);
				ctx.fillStyle='#80D050'; ctx.fillRect(x+8,y+5,12,8); ctx.fillRect(x+8,y+13,8,5);
				ctx.fillStyle='#9EE868'; ctx.fillRect(x+10,y+6,6,4);
				ctx.fillStyle='#B8F880'; ctx.fillRect(x+11,y+7,3,2);
				break;
			case TFR:
				ctx.fillStyle='#88C038'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#408030'; ctx.fillRect(x+14,y+20,3,10);
				ctx.fillStyle='#D82020'; ctx.fillRect(x+10,y+12,11,9); ctx.fillRect(x+12,y+10,7,13);
				ctx.fillStyle='#F04040'; ctx.fillRect(x+14,y+12,4,4);
				ctx.fillStyle='#F8C808'; ctx.fillRect(x+13,y+13,5,5);
				ctx.fillStyle='#FFE040'; ctx.fillRect(x+14,y+14,3,3);
				break;
			case TFY:
				ctx.fillStyle='#88C038'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#408030'; ctx.fillRect(x+14,y+20,3,10);
				ctx.fillStyle='#E8A000'; ctx.fillRect(x+10,y+12,11,9); ctx.fillRect(x+12,y+10,7,13);
				ctx.fillStyle='#F8C808'; ctx.fillRect(x+14,y+12,4,4);
				ctx.fillStyle='#FF7800'; ctx.fillRect(x+13,y+13,5,5);
				ctx.fillStyle='#FFB020'; ctx.fillRect(x+14,y+14,3,3);
				break;
			case TSO:
				ctx.fillStyle='#503818'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5A4220'; ctx.fillRect(x+2,y+2,d-4,d-4);
				ctx.fillStyle='#402808'; ctx.fillRect(x,y+11,d,2); ctx.fillRect(x,y+22,d,2);
				ctx.fillStyle='#6A4C28'; ctx.fillRect(x+2,y+3,d-4,7); ctx.fillRect(x+2,y+13,d-4,8);
				break;
			case TCR: {
				ctx.fillStyle='#503818'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5A4220'; ctx.fillRect(x+2,y+2,d-4,d-4);
				ctx.fillStyle='#402808'; ctx.fillRect(x,y+11,d,2); ctx.fillRect(x,y+22,d,2);
				const sw=Math.sin(tick*0.06+x*0.08)*1.5;
				[[3,14],[13,12],[23,14]].forEach(([cx,cy])=>{
					ctx.fillStyle='#285820'; ctx.fillRect(x+cx+sw,y+cy,4,d-cy);
					ctx.fillStyle='#488A28'; ctx.fillRect(x+cx-2+sw,y+cy,8,7);
					ctx.fillStyle='#68B840'; ctx.fillRect(x+cx-1+sw,y+cy+1,6,5);
					ctx.fillStyle='#88D050'; ctx.fillRect(x+cx+sw,y+cy+2,4,2);
				});
				break;
			}
			case TFN:
				ctx.fillStyle='#88C038'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#987030'; ctx.fillRect(x,y+9,d,5); ctx.fillRect(x,y+20,d,5);
				ctx.fillStyle='#705020'; ctx.fillRect(x,y+13,d,2); ctx.fillRect(x,y+24,d,2);
				ctx.fillStyle='#C09848'; ctx.fillRect(x,y+10,d,2); ctx.fillRect(x,y+21,d,2);
				ctx.fillStyle='#A88040'; ctx.fillRect(x+12,y+2,8,d-4);
				ctx.fillStyle='#C0A060'; ctx.fillRect(x+13,y+3,5,d-6);
				ctx.fillStyle='#D8B870'; ctx.fillRect(x+14,y+4,2,d-8);
				ctx.fillStyle='#C0A060'; ctx.fillRect(x+10,y+2,12,4);
				ctx.fillStyle='#907030'; ctx.fillRect(x+10,y+5,12,2);
				break;
			default:
				ctx.fillStyle='#88C038'; ctx.fillRect(x,y,d,d);
		}
	}

	function drawChimney(ctx, camX, camY) {
		const wx=7*TILE+12, wy=2*TILE+8;
		const sx=wx-camX, sy=wy-camY;
		if(sx<-32||sx>VIEW_W||sy<-32||sy>VIEW_H) return;
		ctx.fillStyle='#501010'; ctx.fillRect(sx+2,sy,12,28);
		ctx.fillStyle='#701818'; ctx.fillRect(sx+4,sy+2,8,24);
		ctx.fillStyle='#401010'; ctx.fillRect(sx,sy,16,6);
		ctx.fillStyle='#602020'; ctx.fillRect(sx+2,sy+2,12,3);
	}

	// ── Player ───────────────────────────────────────────────────────────────────
	function drawPlayer(ctx, px, py, dir, frame) {
		const bx=Math.floor(px)-11, by=Math.floor(py)-28;
		const lg=frame===1?3:0;
		ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(bx+2,by+28,18,5);

		if(dir===0){
			ctx.fillStyle='#202020'; ctx.fillRect(bx+3,by+25+lg,7,4); ctx.fillRect(bx+12,by+25-lg,7,4);
			ctx.fillStyle='#282860'; ctx.fillRect(bx+4,by+17,14,9);
			ctx.fillStyle='#C83020'; ctx.fillRect(bx+3,by+11,16,7); ctx.fillRect(bx,by+11,4,7); ctx.fillRect(bx+18,by+11,4,7);
			ctx.fillStyle='#F0C880'; ctx.fillRect(bx,by+17,4,4); ctx.fillRect(bx+18,by+17,4,4);
			ctx.fillStyle='#301808'; ctx.fillRect(bx+4,by+6,2,5); ctx.fillRect(bx+16,by+6,2,5);
			ctx.fillStyle='#F0C880'; ctx.fillRect(bx+5,by+5,12,9);
			ctx.fillStyle='#101010'; ctx.fillRect(bx+7,by+8,2,2); ctx.fillRect(bx+13,by+8,2,2);
			ctx.fillStyle='#F0F0E0'; ctx.fillRect(bx+8,by+11,6,3);
			ctx.fillStyle='#181818'; ctx.fillRect(bx+3,by+3,16,3);
			ctx.fillStyle='#C83020'; ctx.fillRect(bx+5,by-3,12,7);
			ctx.fillStyle='#F0F0F0'; ctx.fillRect(bx+8,by+2,6,2);
			ctx.fillStyle='#C83020'; ctx.fillRect(bx+9,by+2,4,2);
		} else if(dir===2){
			ctx.fillStyle='#202020'; ctx.fillRect(bx+3,by+25+lg,7,4); ctx.fillRect(bx+12,by+25-lg,7,4);
			ctx.fillStyle='#282860'; ctx.fillRect(bx+4,by+17,14,9);
			ctx.fillStyle='#C83020'; ctx.fillRect(bx+3,by+11,16,7); ctx.fillRect(bx,by+11,4,7); ctx.fillRect(bx+18,by+11,4,7);
			ctx.fillStyle='#F0C880'; ctx.fillRect(bx,by+17,4,4); ctx.fillRect(bx+18,by+17,4,4);
			ctx.fillStyle='#301808'; ctx.fillRect(bx+5,by+5,12,9);
			ctx.fillStyle='#181818'; ctx.fillRect(bx+3,by+3,16,3);
			ctx.fillStyle='#C83020'; ctx.fillRect(bx+5,by-3,12,7);
			ctx.fillStyle='#181818'; ctx.fillRect(bx+9,by+3,4,3);
		} else if(dir===1){
			ctx.fillStyle='#202020'; ctx.fillRect(bx+4,by+25+lg,10,4);
			ctx.fillStyle='#282860'; ctx.fillRect(bx+4,by+17,12,9);
			ctx.fillStyle='#C83020'; ctx.fillRect(bx+4,by+11,13,7); ctx.fillRect(bx,by+11,5,7);
			ctx.fillStyle='#F0C880'; ctx.fillRect(bx,by+16,5,4);
			ctx.fillStyle='#301808'; ctx.fillRect(bx+4,by+5,2,6);
			ctx.fillStyle='#F0C880'; ctx.fillRect(bx+5,by+5,10,9);
			ctx.fillStyle='#101010'; ctx.fillRect(bx+6,by+8,2,2);
			ctx.fillStyle='#D0A060'; ctx.fillRect(bx+5,by+10,2,2);
			ctx.fillStyle='#181818'; ctx.fillRect(bx+3,by+3,14,3);
			ctx.fillStyle='#C83020'; ctx.fillRect(bx+5,by-3,11,7);
			ctx.fillStyle='#181818'; ctx.fillRect(bx+2,by+4,4,2);
		} else {
			ctx.fillStyle='#202020'; ctx.fillRect(bx+8,by+25+lg,10,4);
			ctx.fillStyle='#282860'; ctx.fillRect(bx+6,by+17,12,9);
			ctx.fillStyle='#C83020'; ctx.fillRect(bx+5,by+11,13,7); ctx.fillRect(bx+17,by+11,5,7);
			ctx.fillStyle='#F0C880'; ctx.fillRect(bx+17,by+16,5,4);
			ctx.fillStyle='#301808'; ctx.fillRect(bx+16,by+5,2,6);
			ctx.fillStyle='#F0C880'; ctx.fillRect(bx+7,by+5,10,9);
			ctx.fillStyle='#101010'; ctx.fillRect(bx+14,by+8,2,2);
			ctx.fillStyle='#D0A060'; ctx.fillRect(bx+15,by+10,2,2);
			ctx.fillStyle='#181818'; ctx.fillRect(bx+5,by+3,14,3);
			ctx.fillStyle='#C83020'; ctx.fillRect(bx+6,by-3,11,7);
			ctx.fillStyle='#181818'; ctx.fillRect(bx+16,by+4,4,2);
		}
	}

	// ── Resize ───────────────────────────────────────────────────────────────────
	function applyResize(canvas) {
		const header = document.querySelector('.site-header');
		const hh = header ? header.offsetHeight : 0;
		const wrap = document.getElementById('campWrap');
		if (wrap) wrap.style.top = hh + 'px';

		const W = window.innerWidth;
		const H = window.innerHeight - hh;

		canvas.width  = W;
		canvas.height = H;
		canvas.style.width  = W + 'px';
		canvas.style.height = H + 'px';

		// Integer scale: aim to show ~20 tiles wide
		SCALE = Math.max(1, Math.floor(Math.min(W / 400, H / 288)));
		SCALE = Math.min(SCALE, 4);

		VIEW_W = Math.ceil(W / SCALE);
		VIEW_H = Math.ceil(H / SCALE);
	}

	// ── Main ─────────────────────────────────────────────────────────────────────
	function init() {
		const canvas = document.getElementById('campCanvas');
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = false;

		applyResize(canvas);
		window.addEventListener('resize', () => applyResize(canvas));

		const map = buildMap();
		let plx = 11*TILE + TILE/2;
		let ply = 14*TILE + TILE/2;
		const SPEED = 2.5;
		let dir=0, frame=0, frameTick=0, tick=0, rafId;

		const keys = new Set();
		function onKey(e) {
			const k=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'];
			if(k.includes(e.key)){ e.type==='keydown'?keys.add(e.key):keys.delete(e.key); e.preventDefault(); }
		}
		window.addEventListener('keydown', onKey);
		window.addEventListener('keyup', onKey);

		const dpad={up:false,down:false,left:false,right:false};
		function bindBtn(id,k){
			const el=document.getElementById(id);
			if(!el) return;
			el.addEventListener('pointerdown',e=>{e.preventDefault();dpad[k]=true;});
			['pointerup','pointercancel','pointerleave'].forEach(ev=>el.addEventListener(ev,e=>{e.preventDefault();dpad[k]=false;}));
		}
		bindBtn('dpadUp','up'); bindBtn('dpadDown','down');
		bindBtn('dpadLeft','left'); bindBtn('dpadRight','right');

		function solid(wx,wy){
			const col=Math.floor(wx/TILE),row=Math.floor(wy/TILE);
			if(col<0||col>=MAP_W||row<0||row>=MAP_H) return true;
			return SOLID.has(map[row][col]);
		}
		function tryMove(dx,dy){
			const hw=9;
			const nx=plx+dx;
			if(!solid(nx-hw,ply-4)&&!solid(nx+hw,ply-4)&&!solid(nx-hw,ply-14)&&!solid(nx+hw,ply-14))
				plx=Math.max(TILE+hw,Math.min(MAP_W*TILE-TILE-hw,nx));
			const ny=ply+dy;
			if(!solid(plx-hw,ny-4)&&!solid(plx+hw,ny-4)&&!solid(plx-hw,ny-14)&&!solid(plx+hw,ny-14))
				ply=Math.max(TILE+16,Math.min(MAP_H*TILE-TILE,ny));
		}

		function loop(){
			tick++;
			rafId=requestAnimationFrame(loop);

			let dx=0,dy=0;
			if(keys.has('ArrowUp')||keys.has('w')||keys.has('W')||dpad.up)    {dy=-SPEED;dir=2;}
			if(keys.has('ArrowDown')||keys.has('s')||keys.has('S')||dpad.down) {dy=+SPEED;dir=0;}
			if(keys.has('ArrowLeft')||keys.has('a')||keys.has('A')||dpad.left) {dx=-SPEED;dir=1;}
			if(keys.has('ArrowRight')||keys.has('d')||keys.has('D')||dpad.right){dx=+SPEED;dir=3;}
			if(dx!==0&&dy!==0){dx*=0.707;dy*=0.707;}

			const moving=dx!==0||dy!==0;
			if(moving){tryMove(dx,dy);frameTick++;if(frameTick>=9){frame^=1;frameTick=0;}}
			else{frame=0;frameTick=0;}

			let camX=Math.round(plx-VIEW_W/2);
			let camY=Math.round(ply-VIEW_H/2-20);
			camX=Math.max(0,Math.min(MAP_W*TILE-VIEW_W,camX));
			camY=Math.max(0,Math.min(MAP_H*TILE-VIEW_H,camY));

			// Clear full canvas (pre-scale)
			ctx.fillStyle='#88C038';
			ctx.fillRect(0,0,canvas.width,canvas.height);

			// Scale context — all game drawing in logical tile coords
			ctx.save();
			ctx.scale(SCALE, SCALE);

			const sc=Math.max(0,Math.floor(camX/TILE)), ec=Math.min(MAP_W-1,Math.ceil((camX+VIEW_W)/TILE));
			const sr=Math.max(0,Math.floor(camY/TILE)), er=Math.min(MAP_H-1,Math.ceil((camY+VIEW_H)/TILE));
			for(let r=sr;r<=er;r++) for(let c=sc;c<=ec;c++) drawTile(ctx,map[r][c],c*TILE-camX,r*TILE-camY,tick);

			drawChimney(ctx,camX,camY);
			drawPlayer(ctx,plx-camX,ply-camY,dir,moving?frame:0);

			ctx.restore();
		}

		loop();
		document.addEventListener('visibilitychange',()=>{
			if(document.hidden) cancelAnimationFrame(rafId);
			else{tick=0;rafId=requestAnimationFrame(loop);}
		});
	}

	if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
	else init();
})();
