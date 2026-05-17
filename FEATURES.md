# PokeQuiz — Implemented Features
> Last audited: 2026-05-18

---

## Camp / World

- **4 Scenes**: Camp (outdoor), House (interior), Upstairs (bedroom), Market
- **Day/Night tint**: CSS overlay updates every 60 s based on real-world time
- **Rain weather**: Visual rain particle effect (probabilistic trigger); no snow/fog yet
- **Seasonal overlays**: Date-based tint + emoji overlays for Halloween, Winter, Spring, Summer — NOT full tile palette swaps
- **Camp visitors**: Daily rotating NPCs (Red, Leaf, Blue, May, Lucas, Dawn) appear during visit windows (6–12am, 5–10pm), give gifts (tokens/seeds/berries), have unique dialogue; gated by daily claim flag
- **Campfire**: Placeable tile; opens menu → "Cook Curry" or "Read Campfire Story"; stories vary by weather/season
- **Berry garden**: Plant seeds, wait real time to grow, harvest berries; scythe for AoE harvest
- **Fishing**: Cast at water tiles; catch Pokémon; mini timing mechanic
- **Room decoration** (`RoomEditor`): Place/move/remove furniture and decor items in house scenes
- **Wallpapers & accents**: Cosmetic room wallpaper + accent colour picker
- **NPC interactions**: Fixed NPCs with dialogue, shops, sign posts (camp + market scenes)
- **Touch pad**: On-screen D-pad + action buttons for mobile play
- **Boot hash routing**: URL hash can deep-link to a specific scene on load

---

## Pokémon / Partner

- **Follower sprite**: PMD animated follower walks behind player (Gen 1, 151 Pokémon)
- **Partner system** (`Partner`): Choose/switch active partner Pokémon
- **PC Box** (`PCBox`): Storage for collected Pokémon
- **Friendship**: 0–100 scale; increases by feeding berries; displayed in partner panel
- **Friendship evolution**: At max friendship (100), follower animates and visually evolves to next form; persists via `companionForm` in inventory
- **Nicknames**: Displayed above follower sprite; editable
- **Shiny encounters** (`ShinyEncounters`): Random shiny chance during exploration; shiny collection panel (✨ HUD button); 40-question shiny quiz for hard encounters
- **Pokédex** (`Pokedex`): Full Pokédex viewer (D key or HUD button)

---

## Progression & Meta

- **Trainer Level** (`TrainerLevel`): XP + level system; HUD display
- **Camp Rating** (`CampRating`): Star rating for camp shown on gate
- **Achievements** (`Achievements`): Unlock-based achievement system; panel lists all with unlock date; includes "Good Company" and others
- **Trainer Card** (`/trainer-card.html`): Shows trainer info, 8 Kanto gym badges (computed from quiz best scores)
- **Daily login streak**: Streak counter stored in stats (`loginStreak`); **no escalating rewards yet**
- **Daily quests**: Camp activity quests (feed, harvest, market, rhythm, fish, minigame)
- **Inventory**: Items, berries, seeds, tokens, coins stored in localStorage
- **Stats tracking**: Various play stats persisted in localStorage

---

## Economy / Shops

- **Poké Mart** (`Mart`): Buy items with tokens
- **Market scene**: 6 vendor stalls (`MARKET_SHOPS`) — cosmetics, berries, stones, plants, furniture, mystery
- **Cosmetics**: Purchasable trainer outfits/accessories (`COSM_PRICE`)

---

## Quiz & Mini-Games (17 leaderboard games)

| ID | Name | Description |
|---|---|---|
| `quiz` | Pokémon Quiz | General trivia |
| `silhouette` | Silhouette | Guess from shadow |
| `cry` | Cry | Guess from audio cry |
| `higherlower` | Higher or Lower | Stat comparisons |
| `memory` | Memory | Card flip pairs |
| `zoom` | Zoom | Guess from zoomed image |
| `dex` | Pokédex | Dex number recall |
| `type` | Type | Type identification |
| `stats` | Stats | Base stat quiz |
| `sprint` | Sprint | Speed round |
| `infinite` | Infinite | Endless mode |
| `wordle` | Wordle | Name-guessing word game |
| `connections` | Connections | Group-sorting puzzle |
| `ability` | Ability | Ability identification |
| `moveset` | Moveset | Move recall |
| `spotlight` | Spotlight | Partial-reveal guess |
| `team` | Team | Team composition quiz |

- **Type effectiveness drill** (`puzzle-type.js`): Standalone fast-fire type matchup game with 3 modes (mono/dual/random), hearts system, best-score tracking

---

## Social / Communication

- **Postcard system** (`PostcardSystem`): Write, save, read, delete postcards — **local storage only, no cross-user sharing yet**
- **Mystery Gift** (`MysteryGift`): Gifts triggered by hardcoded holiday dates (New Year, Valentine, Easter, Halloween, Christmas, Pokémon Day); **no redeemable codes yet**
- **Leaderboard** (`/ranking.html`): Global leaderboard for all 17 games via Upstash Redis API; score submission via `PokeUtil.submitScore()`

---

## UI / HUD

- **HUD button bar**: Trainer Card, Pokédex, Achievements, Postcards, Photo Mode, Music Toggle, Shiny Collection, Notifications
- **Pause menu**: Resume, Music on/off, Mystery Gift, settings
- **Music toggle**: HUD button; icon reflects on/off state; persists via `pokequiz_music_on_v2` localStorage key; **off by default**
- **Camp music**: 3 area tracks (Camp = Pallet Town, House = Pokémon Center, Upstairs = Route 1) streamed from archive.org; battle music synthesised via Web Audio
- **Sound effects**: Full SFX suite (plant, harvest, scythe, door, chime, win, lose, spin, evolve, cry, click) — synthesised via Web Audio API, no downloads
- **Photo Mode** (`PhotoMode`): In-game screenshot capture (F key or HUD button)
- **Debug HUD**: Toggle with backtick/F8; shows internal state
- **Notifications** (`campNotifBtn`): Bell icon with badge counter
- **ARIA labels**: Semantic markup throughout; **no dedicated high-contrast or reduce-motion UI yet**

---

## Technical

- **Phaser 3.88**: Arcade physics, pixel art renderer, RESIZE scale mode
- **Script load order**: `camp-data.js` → `camp-systems.js` → `camp.js` (all `defer`)
- **Module namespaces**: `window.CAMP_DATA`, `window.CAMP_SYSTEMS`, `window.CAMP_SCENES`, `window.__CAMP_STATE`
- **Cache busting**: `?v=N` query params on script tags
- **Service worker** (`sw.js`): Asset caching
- **CI**: GitHub Actions — syntax-check all JS + leaderboard consistency check (`tests/check-consistency.mjs`)
- **Backend**: Vercel serverless (`api/leaderboard.js`) + Upstash Redis

---

- **Snow weather**: Animated ❄ snowflakes in winter months (Dec–Feb); replaces rain
- **Fog weather**: Soft blue-grey overlay that fades in; triggered ~10% of windows
- **Streak rewards**: Escalating bonuses at 3 / 7 / 14 / 30 / every 30 days (tokens, seeds, berries)
- **Postcard sharing**: "Share Link" button in read view encodes postcard as base64 URL; `?postcard=` param on load shows incoming postcard modal with save option
- **Mystery gift codes**: Code input in Mystery Gift panel; active codes: `CAMPBONUS`, `SHINYSTART`, `POKEMONDAY26`
- **Gym Badges in camp**: "Gym Badges" button in pause menu shows all 8 badges with earned/locked state
- **Accessibility panel**: "Accessibility" button in pause menu; toggles High Contrast mode and Reduce Motion (persisted via localStorage, applied immediately on load)
- **Mobile swipe gestures**: Swipe left → Pokédex, right → Partner, up → Achievements, down → PC Box (on `#campWrap`)

- **Daily Challenge** (`daily.html` + `js/daily-challenge.js`): seeded 10-question daily quiz; everyone gets the same questions; one attempt per day (gated by `pokequiz_daily_played`); submits to `daily` leaderboard
- **Evolution Chain mini-game** (`puzzle-evo.html` + `js/puzzle-evo.js`): given a Pokémon, pick another in its evolution chain; Normal + Hard modes; streak scoring; Union-Find handles branching chains (Eevee evolutions); leaderboard tab added
- **Quiz history / stats page** (`stats.html`): personal bests dashboard reading all `pokequiz_*_best_*` localStorage keys; Camp Life card (catches, harvests, days, streak, tokens); Achievements count
- **Trainer card sharing** (`js/trainer-card.js`): "Share Card" button encodes `{ name, badges, partner, streak }` as `?tc=<base64url>`; visiting the URL shows a read-only "Viewing [Name]'s Trainer Card" view
- **Pokémon of the Day** (`PokemonOfDay` in camp-systems.js): date-seeded featured Pokémon sign near the south gate; +10 friendship bonus if your current partner matches (once per day)
- **Berry Trader NPC** (`BerryTrader` in camp-systems.js): daily rotating trade offers (pecha→oran, oran→sitrus, sitrus→tokens, pecha→friendship berries); youngster NPC in camp
- **Camp Guestbook** (`Guestbook` in camp-systems.js + `campGuestbookBtn` HUD button): leave messages stored in localStorage (up to 20); full modal panel; NPC/book sign in camp
- **Secret Area**: hidden interactable tile behind the house (r:7, c:6); once-daily; rewards +30 tokens + 1 Friendship Berry + unlocks "Secret Seeker" achievement
- **Rhythm game leaderboard**: rhythm battle wins now submit `game: 'rhythm'` score to leaderboard; new tab on ranking.html
- **Combo multiplier display**: all 8 puzzle games show 🔥 ×1.5 at 3-streak, 🔥 ×2 at 5-streak (visual only)

## Known Gaps (not yet implemented)

- True seasonal tile palette swaps (currently uses overlay tints + emoji decorations)
- Seasonal leaderboard (monthly reset + top-3 reward)
- Trade board (cosmetic)
- Egg group puzzle (there is an evolution chain game; egg group grouping is separate)
