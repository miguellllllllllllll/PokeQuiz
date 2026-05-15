(function () {
	'use strict';

	const TILE = 32;
	const MAP_W = 40;
	const MAP_H = 30;
	const VIEW_W = 800;
	const VIEW_H = 480;

	// Tile IDs
	const TG=0,TG2=1,TP=2,TW=3,TR=4,TR2=5,TWN=6,TD=7,TH2O=8,TTR=9,TFR=10,TFY=11,TSO=12,TCR=13,TFN=14;

	const SOLID = new Set([TW, TR, TR2, TWN, TH2O, TTR, TFN]);

	// ── Map ──────────────────────────────────────────────────────────────────────
	function buildMap() {
		const map = Array.from({ length: MAP_H }, () => new Array(MAP_W).fill(TG));
		function set(r, c, t) { if (r>=0&&r<MAP_H&&c>=0&&c<MAP_W) map[r][c]=t; }
		function fill(r1,c1,r2,c2,t) { for(let r=r1;r<=r2;r++) for(let c=c1;c<=c2;c++) set(r,c,t); }

		// Grass variety
		let rng=77777;
		function rand(){ rng^=rng<<13;rng^=rng>>17;rng^=rng<<5;return(rng>>>0)/0xFFFFFFFF; }
		for(let r=2;r<MAP_H-2;r++) for(let c=2;c<MAP_W-2;c++) if(rand()<0.1) map[r][c]=TG2;

		// Border trees
		for(let c=0;c<MAP_W;c++){set(0,c,TTR);set(1,c,TTR);}
		for(let r=0;r<MAP_H;r++){set(r,0,TTR);set(r,1,TTR);set(r,MAP_W-1,TTR);set(r,MAP_W-2,TTR);}
		// Bottom border with entrance gap at cols 9-13
		for(let c=0;c<MAP_W;c++) if(c<8||c>13){set(MAP_H-1,c,TTR);set(MAP_H-2,c,TTR);}

		// Interior trees (don't overlap house cols 6-16 rows 3-11 or pond cols 30-36 rows 3-9)
		[[8,3],[9,4],[10,3],[11,4],[14,3],[15,4],[16,3],[20,3],[21,4],[22,3],[23,4],[26,2],[27,3],
		 [3,19],[4,20],[5,22],[4,24],[5,26],[3,28],[6,18],[7,19]
		].forEach(([r,c])=>set(r,c,TTR));

		// Flowers
		[[4,19,TFR],[5,17,TFY],[6,19,TFR],[7,18,TFY],[8,17,TFR],
		 [4,25,TFY],[5,27,TFR],[6,25,TFY],
		 [13,4,TFR],[14,5,TFY],[15,4,TFR],[16,5,TFY],
		 [22,5,TFY],[23,4,TFR],[24,5,TFY],
		].forEach(([r,c,t])=>set(r,c,t));

		// House: cols 6-16, rows 3-11
		fill(3,6,5,16,TR);
		for(let c=6;c<=16;c++) set(6,c,TR2);
		fill(7,6,11,16,TW);
		set(8,8,TWN); set(9,8,TWN);
		set(8,14,TWN); set(9,14,TWN);
		set(11,11,TD);

		// Pond: cols 30-36, rows 3-9 (rough edges)
		fill(3,30,9,36,TH2O);
		[[3,30],[3,36],[9,30],[9,36],[3,31],[9,31],[3,35],[9,35],[4,30],[4,36],[8,30],[8,36]
		].forEach(([r,c])=>set(r,c,TG));

		// Paths
		for(let r=12;r<=27;r++) set(r,11,TP);       // vertical from house
		for(let c=11;c<=22;c++) set(20,c,TP);        // horizontal to field gate

		// Crop field fence: cols 20-36, rows 12-27
		for(let c=20;c<=36;c++){set(12,c,TFN);set(27,c,TFN);}
		for(let r=13;r<=26;r++){set(r,20,TFN);set(r,36,TFN);}
		set(20,20,TP); set(20,21,TP);                // gate

		// Soil and crops inside fence
		fill(13,21,26,35,TSO);
		for(let r=14;r<=26;r+=2) for(let c=21;c<=35;c++) set(r,c,TCR);

		return map;
	}

	// ── Tile drawing ─────────────────────────────────────────────────────────────
	function drawTile(ctx, t, x, y, tick) {
		const d = TILE;
		switch(t) {
			case TG:
				ctx.fillStyle='#57a82e'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='rgba(0,0,0,0.04)';
				ctx.fillRect(x,y,d,1); ctx.fillRect(x,y,1,d);
				break;
			case TG2:
				ctx.fillStyle='#4a9a26'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5db630'; ctx.fillRect(x+3,y+3,7,5); ctx.fillRect(x+16,y+18,6,4);
				ctx.fillStyle='#6cc940'; ctx.fillRect(x+5,y+5,3,3);
				break;
			case TP:
				ctx.fillStyle='#876023'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#9c7030'; ctx.fillRect(x+2,y+2,d-4,d-4);
				ctx.fillStyle='#a88040';
				ctx.fillRect(x+4,y+4,10,7); ctx.fillRect(x+17,y+14,9,6); ctx.fillRect(x+3,y+18,11,7);
				ctx.fillStyle='#b89050'; ctx.fillRect(x+5,y+5,4,3); ctx.fillRect(x+18,y+15,3,3);
				break;
			case TR:
				ctx.fillStyle='#8a2c2c'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#9e3535'; ctx.fillRect(x+2,y+2,d-4,d-4);
				ctx.fillStyle='#7a2020';
				ctx.fillRect(x,y+8,d,2); ctx.fillRect(x,y+20,d,2); ctx.fillRect(x+16,y,2,d);
				break;
			case TR2:
				ctx.fillStyle='#581818'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#6a2020'; ctx.fillRect(x+1,y+2,d-2,d-6);
				ctx.fillStyle='#4a1010'; ctx.fillRect(x,y+d-4,d,4);
				break;
			case TW:
				ctx.fillStyle='#e6d4a0'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#d4be88';
				ctx.fillRect(x,y,d,3); ctx.fillRect(x,y,3,d); ctx.fillRect(x+d-3,y,3,d);
				ctx.fillStyle='#c8b070';
				ctx.fillRect(x+4,y+8,d-8,2); ctx.fillRect(x+4,y+20,d-8,2);
				break;
			case TWN: {
				ctx.fillStyle='#e6d4a0'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#7a5a18'; ctx.fillRect(x+4,y+4,d-8,d-8);
				const gl=Math.sin(tick*0.025+x*0.02)*0.08+0.82;
				ctx.fillStyle=`rgba(140,200,240,${gl})`;
				ctx.fillRect(x+6,y+6,8,8); ctx.fillRect(x+18,y+6,8,8);
				ctx.fillRect(x+6,y+18,8,8); ctx.fillRect(x+18,y+18,8,8);
				ctx.fillStyle='#7a5a18';
				ctx.fillRect(x+13,y+5,2,d-10); ctx.fillRect(x+5,y+13,d-10,2);
				ctx.fillStyle='rgba(255,255,255,0.5)';
				ctx.fillRect(x+7,y+7,3,3); ctx.fillRect(x+19,y+7,3,3);
				break;
			}
			case TD:
				ctx.fillStyle='#e6d4a0'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#5a2c10'; ctx.fillRect(x+4,y+2,d-8,d-2);
				ctx.fillStyle='#7a4020'; ctx.fillRect(x+6,y+4,d-12,d-6);
				ctx.fillStyle='#8a5030'; ctx.fillRect(x+8,y+6,d-16,d-14);
				ctx.fillStyle='#ffcb05'; ctx.fillRect(x+d-12,y+16,4,4);
				break;
			case TH2O: {
				const w1=Math.sin(tick*0.04+(x+y)*0.05)*2, w2=Math.sin(tick*0.03+x*0.07)*1.5;
				ctx.fillStyle='#2e70cc'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#3880dd';
				ctx.fillRect(x+2,y+w1+4,d-4,3); ctx.fillRect(x+4,y+w1+14,d-8,3); ctx.fillRect(x+2,y+w2+22,d-4,2);
				ctx.fillStyle='rgba(255,255,255,0.2)';
				ctx.fillRect(x+6,y+w1+5,5,1); ctx.fillRect(x+16,y+w1+15,7,1);
				break;
			}
			case TTR:
				ctx.fillStyle='#3a8020'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#6b3a1f'; ctx.fillRect(x+12,y+18,8,14);
				ctx.fillStyle='#7a4828'; ctx.fillRect(x+14,y+20,4,12);
				ctx.fillStyle='#1e6010'; ctx.fillRect(x+2,y+2,28,20);
				ctx.fillStyle='#2a7818'; ctx.fillRect(x+4,y+4,24,16);
				ctx.fillStyle='#3a9020'; ctx.fillRect(x+7,y+6,18,12);
				ctx.fillStyle='#50a830'; ctx.fillRect(x+10,y+7,12,8);
				ctx.fillStyle='#6cc040'; ctx.fillRect(x+12,y+8,5,4);
				break;
			case TFR:
				ctx.fillStyle='#57a82e'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#3a8020'; ctx.fillRect(x+14,y+18,4,10);
				ctx.fillStyle='#cc1515';
				ctx.fillRect(x+10,y+10,12,10); ctx.fillRect(x+12,y+8,8,14);
				ctx.fillStyle='#ff3030'; ctx.fillRect(x+14,y+10,4,4);
				ctx.fillStyle='#ffcb05'; ctx.fillRect(x+13,y+11,6,5);
				break;
			case TFY:
				ctx.fillStyle='#57a82e'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#3a8020'; ctx.fillRect(x+14,y+18,4,10);
				ctx.fillStyle='#d4a000';
				ctx.fillRect(x+10,y+10,12,10); ctx.fillRect(x+12,y+8,8,14);
				ctx.fillStyle='#ffcb05'; ctx.fillRect(x+14,y+10,4,4);
				ctx.fillStyle='#ff8800'; ctx.fillRect(x+13,y+11,6,5);
				break;
			case TSO:
				ctx.fillStyle='#2e1a08'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#3a2210'; ctx.fillRect(x+2,y+2,d-4,d-4);
				ctx.fillStyle='#261408';
				ctx.fillRect(x,y+10,d,2); ctx.fillRect(x,y+22,d,2);
				break;
			case TCR: {
				ctx.fillStyle='#2e1a08'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#3a2210'; ctx.fillRect(x+2,y+2,d-4,d-4);
				const sw=Math.sin(tick*0.04+x*0.1)*1.2;
				ctx.fillStyle='#2e7a18';
				ctx.fillRect(x+3+sw,y+16,5,12); ctx.fillRect(x+13+sw,y+14,5,14); ctx.fillRect(x+23+sw,y+16,5,12);
				ctx.fillStyle='#4aa830';
				ctx.fillRect(x+2+sw,y+10,7,8); ctx.fillRect(x+12+sw,y+8,7,8); ctx.fillRect(x+22+sw,y+10,7,8);
				ctx.fillStyle='#66cc48';
				ctx.fillRect(x+4+sw,y+10,3,4); ctx.fillRect(x+14+sw,y+8,3,4);
				break;
			}
			case TFN:
				ctx.fillStyle='#57a82e'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#b08040'; ctx.fillRect(x,y+8,d,5); ctx.fillRect(x,y+20,d,5);
				ctx.fillStyle='#c09050'; ctx.fillRect(x+12,y+2,8,d-4);
				ctx.fillStyle='#d4a860'; ctx.fillRect(x+14,y+4,4,d-8);
				break;
			default:
				ctx.fillStyle='#57a82e'; ctx.fillRect(x,y,d,d);
		}
	}

	// ── Player ───────────────────────────────────────────────────────────────────
	// bx/by = top-left of a 24×28 sprite box; py is feet (by+28)
	function drawPlayer(ctx, px, py, dir, frame) {
		const bx=Math.floor(px)-12, by=Math.floor(py)-28;
		const lg=frame===1?3:0;

		// Shadow
		ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.fillRect(bx+3,by+26,18,5);

		if(dir===0) { // Down
			ctx.fillStyle='#111'; ctx.fillRect(bx+4,by+24+lg,7,4); ctx.fillRect(bx+13,by+24-lg,7,4);
			ctx.fillStyle='#1a2050'; ctx.fillRect(bx+5,by+16,14,9);
			ctx.fillStyle='#cc2020'; ctx.fillRect(bx+3,by+9,18,8); ctx.fillRect(bx,by+9,4,8); ctx.fillRect(bx+20,by+9,4,8);
			ctx.fillStyle='#f0c080'; ctx.fillRect(bx,by+16,4,4); ctx.fillRect(bx+20,by+16,4,4);
			ctx.fillStyle='#f0c080'; ctx.fillRect(bx+5,by+4,14,10);
			ctx.fillStyle='#222'; ctx.fillRect(bx+7,by+7,2,2); ctx.fillRect(bx+15,by+7,2,2);
			ctx.fillStyle='#c07040'; ctx.fillRect(bx+10,by+11,4,1);
		} else if(dir===2) { // Up
			ctx.fillStyle='#111'; ctx.fillRect(bx+4,by+24+lg,7,4); ctx.fillRect(bx+13,by+24-lg,7,4);
			ctx.fillStyle='#1a2050'; ctx.fillRect(bx+5,by+16,14,9);
			ctx.fillStyle='#cc2020'; ctx.fillRect(bx+3,by+9,18,8); ctx.fillRect(bx,by+9,4,8); ctx.fillRect(bx+20,by+9,4,8);
			ctx.fillStyle='#f0c080'; ctx.fillRect(bx,by+16,4,4); ctx.fillRect(bx+20,by+16,4,4);
			ctx.fillStyle='#f0c080'; ctx.fillRect(bx+5,by+4,14,10);
			ctx.fillStyle='#cc2020'; ctx.fillRect(bx+9,by+3,6,3); // back of hat strap
		} else if(dir===1) { // Left
			ctx.fillStyle='#111'; ctx.fillRect(bx+5,by+24+lg,10,4);
			ctx.fillStyle='#1a2050'; ctx.fillRect(bx+5,by+16,13,9);
			ctx.fillStyle='#cc2020'; ctx.fillRect(bx+4,by+9,15,8); ctx.fillRect(bx,by+9,5,8);
			ctx.fillStyle='#f0c080'; ctx.fillRect(bx,by+15,5,4);
			ctx.fillStyle='#f0c080'; ctx.fillRect(bx+5,by+4,12,10);
			ctx.fillStyle='#222'; ctx.fillRect(bx+6,by+7,2,2);
			ctx.fillStyle='#d0a060'; ctx.fillRect(bx+5,by+9,2,2);
			ctx.fillStyle='#881010'; ctx.fillRect(bx+2,by+4,4,2); // brim extension
		} else { // Right
			ctx.fillStyle='#111'; ctx.fillRect(bx+9,by+24+lg,10,4);
			ctx.fillStyle='#1a2050'; ctx.fillRect(bx+6,by+16,13,9);
			ctx.fillStyle='#cc2020'; ctx.fillRect(bx+5,by+9,15,8); ctx.fillRect(bx+19,by+9,5,8);
			ctx.fillStyle='#f0c080'; ctx.fillRect(bx+19,by+15,5,4);
			ctx.fillStyle='#f0c080'; ctx.fillRect(bx+7,by+4,12,10);
			ctx.fillStyle='#222'; ctx.fillRect(bx+16,by+7,2,2);
			ctx.fillStyle='#d0a060'; ctx.fillRect(bx+17,by+9,2,2);
			ctx.fillStyle='#881010'; ctx.fillRect(bx+18,by+4,4,2);
		}

		// Hat (shared)
		ctx.fillStyle='#881010'; ctx.fillRect(bx+3,by+2,18,4);
		ctx.fillStyle='#991818'; ctx.fillRect(bx+5,by-2,14,5);
		ctx.fillStyle='#ffffff'; ctx.fillRect(bx+9,by+2,6,3);
		ctx.fillStyle='#ee1515'; ctx.fillRect(bx+10,by+2,4,3);
	}

	// ── Main ─────────────────────────────────────────────────────────────────────
	function init() {
		const canvas = document.getElementById('campCanvas');
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = false;

		const map = buildMap();
		let plx = 11*TILE + TILE/2;
		let ply = 14*TILE + TILE/2;
		const SPEED = 2.5;
		let dir=0, frame=0, frameTick=0, tick=0, rafId;

		const keys = new Set();
		function onKey(e) {
			const k=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'];
			if(k.includes(e.key)){
				e.type==='keydown'?keys.add(e.key):keys.delete(e.key);
				e.preventDefault();
			}
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
			if(keys.has('ArrowUp')||keys.has('w')||keys.has('W')||dpad.up)   {dy=-SPEED;dir=2;}
			if(keys.has('ArrowDown')||keys.has('s')||keys.has('S')||dpad.down){dy=+SPEED;dir=0;}
			if(keys.has('ArrowLeft')||keys.has('a')||keys.has('A')||dpad.left){dx=-SPEED;dir=1;}
			if(keys.has('ArrowRight')||keys.has('d')||keys.has('D')||dpad.right){dx=+SPEED;dir=3;}
			if(dx!==0&&dy!==0){dx*=0.707;dy*=0.707;}

			const moving=dx!==0||dy!==0;
			if(moving){tryMove(dx,dy);frameTick++;if(frameTick>=9){frame^=1;frameTick=0;}}
			else{frame=0;frameTick=0;}

			let camX=Math.round(plx-VIEW_W/2);
			let camY=Math.round(ply-VIEW_H/2-20);
			camX=Math.max(0,Math.min(MAP_W*TILE-VIEW_W,camX));
			camY=Math.max(0,Math.min(MAP_H*TILE-VIEW_H,camY));

			ctx.fillStyle='#57a82e'; ctx.fillRect(0,0,VIEW_W,VIEW_H);

			const sc=Math.max(0,Math.floor(camX/TILE)), ec=Math.min(MAP_W-1,Math.ceil((camX+VIEW_W)/TILE));
			const sr=Math.max(0,Math.floor(camY/TILE)), er=Math.min(MAP_H-1,Math.ceil((camY+VIEW_H)/TILE));
			for(let r=sr;r<=er;r++) for(let c=sc;c<=ec;c++) drawTile(ctx,map[r][c],c*TILE-camX,r*TILE-camY,tick);

			drawPlayer(ctx,plx-camX,ply-camY,dir,moving?frame:0);
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
