/* Market Centre — standalone hub page that mirrors camp's mart aesthetic.
   Reads/writes the same localStorage keys camp.js uses so balances stay in sync. */
(function () {
	'use strict';

	const LS_TOKENS  = 'pq_camp_tokens';
	const LS_BERRIES = 'pq_camp_berries';
	const LS_SEEDS   = 'pq_camp_seeds';

	const getNum = (k) => {
		const n = parseInt(localStorage.getItem(k) || '0', 10);
		return Number.isFinite(n) ? n : 0;
	};
	const setNum = (k, v) => localStorage.setItem(k, String(Math.max(0, v | 0)));

	const tokensEl = document.getElementById('marketTokens');
	const dialog   = document.getElementById('marketDialog');
	const dTitle   = document.getElementById('marketDialogTitle');
	const dBody    = document.getElementById('marketDialogBody');
	const dClose   = document.getElementById('marketDialogClose');
	const dLeave   = document.getElementById('marketDialogLeave');
	const statusEl = document.getElementById('marketStatus');

	let toastTimer = null;

	function refresh() {
		if (tokensEl) tokensEl.textContent = String(getNum(LS_TOKENS));
	}

	function toast(msg) {
		if (!statusEl) return;
		statusEl.textContent = msg;
		statusEl.hidden = false;
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(() => { statusEl.hidden = true; }, 1800);
	}

	function openShop(kind) {
		const shop = SHOPS[kind];
		if (!shop) return;
		dTitle.textContent = shop.title;
		dBody.innerHTML = '';
		// Flavor line
		const p = document.createElement('p');
		p.textContent = shop.flavor;
		dBody.appendChild(p);
		// Items
		shop.items.forEach((item) => {
			const row = document.createElement('div');
			row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0;';
			const label = document.createElement('span');
			label.textContent = item.label;
			label.style.flex = '1 1 auto';
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'mk-btn';
			btn.textContent = item.cta;
			btn.addEventListener('click', () => item.onClick());
			row.appendChild(label);
			row.appendChild(btn);
			dBody.appendChild(row);
		});
		dialog.hidden = false;
	}

	function closeShop() { dialog.hidden = true; }

	function buy(cost, then) {
		const t = getNum(LS_TOKENS);
		if (t < cost) { toast('Not enough tokens!'); return false; }
		setNum(LS_TOKENS, t - cost);
		then();
		refresh();
		return true;
	}

	const SHOPS = {
		mart: {
			title: "Pikachu's Mart",
			flavor: 'Same as in camp — quick seed buy for trainers in a hurry.',
			items: [
				{
					label: '🌱 Berry Seed — 5💰',
					cta: 'Buy',
					onClick: () => buy(5, () => { setNum(LS_SEEDS, getNum(LS_SEEDS) + 1); toast('Got a seed! 🌱'); }),
				},
			],
		},
		berries: {
			title: 'Berry Stand',
			flavor: 'Sell berries straight to the market for a fair price.',
			items: [
				{
					label: '🍓 Sell 1 berry · +10💰',
					cta: 'Sell',
					onClick: () => {
						const b = getNum(LS_BERRIES);
						if (b <= 0) { toast('No berries to sell.'); return; }
						setNum(LS_BERRIES, b - 1);
						setNum(LS_TOKENS, getNum(LS_TOKENS) + 10);
						refresh();
						toast('+10 💰');
					},
				},
				{
					label: '🍓 Sell all berries',
					cta: 'Sell all',
					onClick: () => {
						const b = getNum(LS_BERRIES);
						if (b <= 0) { toast('No berries to sell.'); return; }
						setNum(LS_BERRIES, 0);
						setNum(LS_TOKENS, getNum(LS_TOKENS) + b * 10);
						refresh();
						toast(`+${b * 10} 💰`);
					},
				},
			],
		},
		stones: {
			title: 'Stone Vendor',
			flavor: 'Evolution stones — for the right partner at the right time.',
			items: [
				{ label: '🔥 Fire Stone — 50💰',    cta: 'Buy', onClick: () => buy(50, () => toast('🔥 Fire Stone purchased!')) },
				{ label: '⚡ Thunder Stone — 50💰', cta: 'Buy', onClick: () => buy(50, () => toast('⚡ Thunder Stone purchased!')) },
				{ label: '🌿 Leaf Stone — 50💰',   cta: 'Buy', onClick: () => buy(50, () => toast('🌿 Leaf Stone purchased!')) },
			],
		},
		cosmetics: {
			title: 'Boutique',
			flavor: 'Camp decor and wallpapers to spruce things up.',
			items: [
				{ label: '🌸 Sakura Wallpaper — 15💰', cta: 'Buy', onClick: () => buy(15, () => toast('🌸 Wallpaper purchased!')) },
				{ label: '🌊 Ocean Wallpaper — 15💰',  cta: 'Buy', onClick: () => buy(15, () => toast('🌊 Wallpaper purchased!')) },
				{ label: '🏮 Lantern Decor — 30💰',    cta: 'Buy', onClick: () => buy(30, () => toast('🏮 Decor purchased!')) },
			],
		},
	};

	document.querySelectorAll('.market-shop').forEach((btn) => {
		btn.addEventListener('click', () => openShop(btn.getAttribute('data-shop')));
	});
	if (dClose) dClose.addEventListener('click', closeShop);
	if (dLeave) dLeave.addEventListener('click', closeShop);
	document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeShop(); });

	refresh();
})();
