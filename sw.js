// PokeQuiz service worker.
// Strategy:
//   - HTML navigations  → network-first (always fresh online, cached fallback offline)
//   - same-origin assets → stale-while-revalidate (fast + self-updating)
//   - /api/*             → never cached (always live)
//   - cross-origin       → left to the browser (fonts, sprite CDNs)
const CACHE = 'pokequiz-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
	event.waitUntil((async () => {
		const keys = await caches.keys();
		await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
		await self.clients.claim();
	})());
});

self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;

	let url;
	try { url = new URL(req.url); } catch { return; }
	if (url.origin !== self.location.origin) return;       // fonts / sprite CDNs
	if (url.pathname.startsWith('/api/')) return;          // leaderboard — always live

	// HTML pages: network-first so deploys land immediately; cache as fallback.
	if (req.mode === 'navigate') {
		event.respondWith((async () => {
			try {
				const fresh = await fetch(req);
				const cache = await caches.open(CACHE);
				cache.put(req, fresh.clone());
				return fresh;
			} catch {
				return (await caches.match(req))
					|| (await caches.match('/index.html'))
					|| new Response('Offline', { status: 503, statusText: 'Offline' });
			}
		})());
		return;
	}

	// Static assets: serve from cache instantly, refresh in the background.
	event.respondWith((async () => {
		const cached = await caches.match(req);
		const network = fetch(req).then((res) => {
			if (res && res.ok) {
				caches.open(CACHE).then((c) => c.put(req, res.clone()));
			}
			return res;
		}).catch(() => cached);
		return cached || network;
	})());
});
