(function () {
	'use strict';

	const TILE = 16;
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

	// ── Tile drawing — BW2 Gen 5, TILE=16 ───────────────────────────────────────
	function drawTile(ctx, t, x, y, tick) {
		const d = TILE; // 16
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
				// Cobblestone: two offset rows of stones separated by 1-px grout
				ctx.fillStyle='#B0A470'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#988C5A';
				ctx.fillRect(x,y+5,d,1); ctx.fillRect(x,y+11,d,1); // H grout
				ctx.fillRect(x+7,y,1,5); ctx.fillRect(x+7,y+12,1,4); // V upper-row
				ctx.fillRect(x+3,y+6,1,5); ctx.fillRect(x+11,y+6,1,5); // V mid-row
				ctx.fillStyle='#C8BC88';
				ctx.fillRect(x+1,y+1,5,2); ctx.fillRect(x+9,y+1,6,2); // top-row highlights
				ctx.fillRect(x+1,y+7,1,2); ctx.fillRect(x+5,y+7,5,2); ctx.fillRect(x+13,y+7,2,2);
				ctx.fillRect(x+2,y+12,4,2); ctx.fillRect(x+9,y+12,5,2); // bottom highlights
				break;
			}
			case TR:
				ctx.fillStyle='#9C2020'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#701414'; ctx.fillRect(x,y+4,d,1); ctx.fillRect(x,y+9,d,1); ctx.fillRect(x,y+14,d,1);
				ctx.fillStyle='#C03028'; ctx.fillRect(x,y,d,2);
				ctx.fillStyle='#E04838'; ctx.fillRect(x,y,d,1);
				ctx.fillStyle='#7A1A1A'; ctx.fillRect(x+8,y,1,d);
				break;
			case TR2:
				ctx.fillStyle='#601010'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#7C1A1A'; ctx.fillRect(x,y+1,d,d-3);
				ctx.fillStyle='#480C0C'; ctx.fillRect(x,y+d-2,d,2);
				break;
			case TW:
				ctx.fillStyle='#D4D0B4'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#B0AC8C'; ctx.fillRect(x+1,y+5,d-2,1); ctx.fillRect(x+1,y+11,d-2,1);
				ctx.fillStyle='#9C9878'; ctx.fillRect(x+d-1,y,1,d);
				break;
			case TWN: {
				// 4-pane window: each pane 4×4, 1-px divider, wood frame 2px
				ctx.fillStyle='#D4D0B4'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#784828'; ctx.fillRect(x+2,y+2,12,12);
				const gl=Math.sin(tick*0.022+x*0.012)*0.05+0.88;
				ctx.fillStyle=`rgba(90,160,230,${gl})`;
				ctx.fillRect(x+3,y+3,4,4); ctx.fillRect(x+9,y+3,4,4);
				ctx.fillRect(x+3,y+9,4,4); ctx.fillRect(x+9,y+9,4,4);
				ctx.fillStyle='#784828';
				ctx.fillRect(x+7,y+3,1,10); ctx.fillRect(x+3,y+7,10,1);
				ctx.fillStyle='rgba(255,255,255,0.7)';
				ctx.fillRect(x+3,y+3,1,3); ctx.fillRect(x+9,y+3,1,3);
				ctx.fillStyle='rgba(255,255,255,0.9)';
				ctx.fillRect(x+3,y+3,1,1); ctx.fillRect(x+9,y+3,1,1);
				break;
			}
			case TD:
				ctx.fillStyle='#D4D0B4'; ctx.fillRect(x,y,d,d);
				ctx.fillStyle='#4A2808'; ctx.fillRect(x+3,y+1,10,d-1);
				ctx.fillStyle='#7C4C20'; ctx.fillRect(x+4,y+2,8,d-3);
				ctx.fillStyle='#6A3C14'; ctx.fillRect(x+4,y+8,8,1);
				ctx.fillStyle='#9A5C28';
				ctx.fillRect(x+5,y+3,3,4); ctx.fillRect(x+5,y+10,3,3);
				ctx.fillStyle='#E09800'; ctx.fillRect(x+10,y+9,2,2);
				ctx.fillStyle='#FFD030'; ctx.fillRect(x+10,y+9,1,1);
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
				// BW2 dome tree at 16px: dark ring → mid body → highlight → specular
				ctx.fillStyle='#78A840'; ctx.fillRect(x,y,d,d);
				// Trunk
				ctx.fillStyle='#5C3C1C'; ctx.fillRect(x+7,y+12,2,4);
				ctx.fillStyle='#7A5030'; ctx.fillRect(x+7,y+13,2,3);
				// Dark outline ring
				ctx.fillStyle='#1A3A0A';
				ctx.fillRect(x+5,y+1,6,1); ctx.fillRect(x+3,y+2,10,1);
				ctx.fillRect(x+2,y+3,12,8);
				ctx.fillRect(x+3,y+11,10,1); ctx.fillRect(x+5,y+12,6,1);
				// Mid-dark fill
				ctx.fillStyle='#2E600E';
				ctx.fillRect(x+4,y+2,8,1); ctx.fillRect(x+3,y+3,10,8); ctx.fillRect(x+4,y+11,8,1);
				// Lighter core
				ctx.fillStyle='#487824'; ctx.fillRect(x+4,y+3,7,7);
				// Highlight band
				ctx.fillStyle='#62A030';
				ctx.fillRect(x+4,y+3,5,4); ctx.fillRect(x+4,y+7,3,2);
				// Specular
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

	function drawChimney(ctx, camX, camY) {
		const wx=7*TILE+4, wy=2*TILE+2;
		const sx=wx-camX, sy=wy-camY;
		if(sx<-16||sx>VIEW_W||sy<-16||sy>VIEW_H) return;
		ctx.fillStyle='#501010'; ctx.fillRect(sx+1,sy,6,14);
		ctx.fillStyle='#701818'; ctx.fillRect(sx+2,sy+1,4,12);
		ctx.fillStyle='#401010'; ctx.fillRect(sx,sy,8,3);
		ctx.fillStyle='#602020'; ctx.fillRect(sx+1,sy+1,6,2);
	}

	// ── Player — BW2 16-px overworld sprite (Nate-inspired) ─────────────────────
	// bx = center-6 (12px wide), by = feet-18 (18px tall body+head)
	// Delegate to shared TrainerLook module (trainer-look.js loaded before this file).
	function drawPlayer(ctx, px, py, dir, frame) {
		if (window.TrainerLook) {
			window.TrainerLook.draw(ctx, px, py, dir, frame, _trainerLook);
		}
	}

	// ── Resize ───────────────────────────────────────────────────────────────────
	function applyResize(canvas) {
		const header = document.querySelector('.site-header');
		// Use ceil so there's never a sub-pixel gap below the header
		const hh = header ? Math.ceil(header.getBoundingClientRect().bottom) : 0;
		const wrap = document.getElementById('campWrap');
		if (wrap) wrap.style.top = hh + 'px';

		const W = window.innerWidth;
		const H = window.innerHeight - hh;

		canvas.width  = W;
		canvas.height = Math.max(H, 1);
		canvas.style.width  = W + 'px';
		canvas.style.height = Math.max(H, 1) + 'px';

		// Target ~3px screen pixels per logical pixel so TILE=16 tiles sit at ~48px.
		// Formula targets DS-like viewport (256×192). Mobile floors to 2.
		SCALE = Math.max(2, Math.floor(Math.min(W / 380, H / 240)));
		SCALE = Math.min(SCALE, 4);

		VIEW_W = Math.ceil(W / SCALE);
		VIEW_H = Math.ceil(Math.max(H, 1) / SCALE);
	}

	// ── Main ─────────────────────────────────────────────────────────────────────
	let _trainerLook = null;
	function init() {
		// Load saved trainer appearance (falls back to defaults if not set).
		_trainerLook = window.TrainerLook ? window.TrainerLook.load() : null;
		// Refresh look whenever the profile page saves a change.
		window.addEventListener('storage', (e) => {
			if (e.key === 'pokequiz_trainer_look' && window.TrainerLook) {
				_trainerLook = window.TrainerLook.load();
			}
		});

		const canvas = document.getElementById('campCanvas');
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = false;

		applyResize(canvas);
		window.addEventListener('resize', () => applyResize(canvas));
		window.addEventListener('load', () => applyResize(canvas));
		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(() => applyResize(canvas));
		}

		const map = buildMap();
		let plx = 11*TILE + TILE/2;
		let ply = 14*TILE + TILE/2;
		const SPEED = 1.4;
		let dir=0, frame=0, frameTick=0, tick=0, rafId;

		const keys = new Set();
		function onKey(e) {
			const k=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'];
			if(k.includes(e.key)){ e.type==='keydown'?keys.add(e.key):keys.delete(e.key); e.preventDefault(); }
		}
		window.addEventListener('keydown', onKey);
		window.addEventListener('keyup', onKey);

		const dpad={up:false,down:false,left:false,right:false};
		(function setupJoystick(){
			const base=document.getElementById('joystickBase');
			const knob=document.getElementById('joystickKnob');
			if(!base||!knob) return;
			const RADIUS=42, DEAD=0.18;
			let active=false, pointerId=null;
			function reset(){
				active=false; pointerId=null;
				dpad.up=dpad.down=dpad.left=dpad.right=false;
				knob.style.transform='translate(-50%,-50%)';
			}
			function applyJoy(dx,dy){
				const dist=Math.sqrt(dx*dx+dy*dy);
				const clamp=Math.min(dist,RADIUS);
				const nx=dist>0?dx/dist:0, ny=dist>0?dy/dist:0;
				knob.style.transform=`translate(calc(-50% + ${nx*clamp}px), calc(-50% + ${ny*clamp}px))`;
				const fx=dist>0?dx/Math.max(dist,RADIUS):0;
				const fy=dist>0?dy/Math.max(dist,RADIUS):0;
				dpad.left=fx<-DEAD; dpad.right=fx>DEAD;
				dpad.up=fy<-DEAD;   dpad.down=fy>DEAD;
			}
			base.addEventListener('pointerdown',e=>{
				if(active) return;
				active=true; pointerId=e.pointerId;
				base.setPointerCapture(e.pointerId);
				e.preventDefault();
				const r=base.getBoundingClientRect();
				applyJoy(e.clientX-r.left-r.width/2, e.clientY-r.top-r.height/2);
			});
			base.addEventListener('pointermove',e=>{
				if(!active||e.pointerId!==pointerId) return;
				e.preventDefault();
				const r=base.getBoundingClientRect();
				applyJoy(e.clientX-r.left-r.width/2, e.clientY-r.top-r.height/2);
			});
			['pointerup','pointercancel'].forEach(ev=>base.addEventListener(ev,e=>{
				if(e.pointerId!==pointerId) return;
				e.preventDefault(); reset();
			}));
		})();

		function solid(wx,wy){
			const col=Math.floor(wx/TILE),row=Math.floor(wy/TILE);
			if(col<0||col>=MAP_W||row<0||row>=MAP_H) return true;
			return SOLID.has(map[row][col]);
		}
		function tryMove(dx,dy){
			const hw=5;
			const nx=plx+dx;
			if(!solid(nx-hw,ply-2)&&!solid(nx+hw,ply-2)&&!solid(nx-hw,ply-8)&&!solid(nx+hw,ply-8))
				plx=Math.max(TILE+hw,Math.min(MAP_W*TILE-TILE-hw,nx));
			const ny=ply+dy;
			if(!solid(plx-hw,ny-2)&&!solid(plx+hw,ny-2)&&!solid(plx-hw,ny-8)&&!solid(plx+hw,ny-8))
				ply=Math.max(TILE+8,Math.min(MAP_H*TILE-TILE,ny));
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
			let camY=Math.round(ply-VIEW_H/2-10);
			camX=Math.max(0,Math.min(MAP_W*TILE-VIEW_W,camX));
			camY=Math.max(0,Math.min(MAP_H*TILE-VIEW_H,camY));

			// Clear full canvas (pre-scale)
			ctx.fillStyle='#68A028';
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
