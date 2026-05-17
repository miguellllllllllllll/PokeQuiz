# PokeQuiz — Implemented Features
> Last audited: 2026-05-18

---

## Camp / World

- **4 Scenes**: Camp (outdoor), House (interior), Upstairs (bedroom), Market
- **Day/Night tint**: CSS overlay updates every 60 s based on real-world time
- **Weather system**: Rain (30%), Snow (replaces rain in Dec–Feb), Fog (~10%) — seeded per 4-hour window; all use screen-space particles/overlays
- **Seasonal decorations**: Month-based emoji overlays (cherry blossoms, sunflowers, autumn leaves, snowflakes) + date-specific tint overlays for Halloween, Winter, Spring, Summer events
- **Camp visitors**: Daily rotating NPCs (Red, Leaf, Blue, May, Lucas, Dawn) appear during visit windows (6–12 am, 5–10 pm); give tokens/seeds/berries; gated by daily claim flag
- **Berry Trader NPC**: Daily rotating berry trade offers (pecha→oran, oran→sitrus, sitrus→tokens, pecha→friendship berries); youngster NPC in camp
- **Campfire**: Placeable tile → "Cook Curry" or "Read Campfire Story"; stories vary by weather/season
- **Berry garden**: Plant seeds, wait real time to grow, harvest; scythe for AoE harvest
- **Fishing**: Cast at water tiles; catch Pokémon; mini timing mechanic
- **Room decoration** (`RoomEditor`): Place/move/remove furniture and decor in house scenes
- **Wallpapers & accents**: Cosmetic room wallpaper + accent colour picker
- **NPC interactions**: Fixed NPCs with dialogue, shops, sign posts (camp + market)
- **Pokémon of the Day**: Date-seeded featured Pokémon sign near south gate; +10 friendship if your partner matches (once per day, keyed by date)
- **Camp Guestbook**: Leave messages stored in localStorage (up to 20 entries); HUD button + modal panel
- **Secret Area**: Hidden interactable tile behind the house (r:7, c:6); once-daily; rewards +30 tokens + 1 Friendship Berry + "Secret Seeker" achievement
- **Touch pad**: On-screen D-pad + action buttons for mobile; swipe gestures on game canvas (left→Pokédex, right→Partner, up→Achievements, down→PC Box)
- **Boot hash routing**: URL hash can deep-link to a specific scene on load

---

## Pokémon / Partner

- **Follower sprite**: PMD animated follower walks behind player (Gen 1, 151 Pokémon)
- **Partner system** (`Partner`): Choose/switch active partner Pokémon
- **PC Box** (`PCBox`): Storage for collected Pokémon
- **Friendship**: 0–100 scale; increases by feeding berries; displayed in partner panel
- **Friendship evolution**: At max friendship (100), follower animates and evolves; persists via `companionForm`
- **Nicknames**: Displayed above follower sprite; editable
- **Shiny encounters** (`ShinyEncounters`): Random shiny chance during exploration; shiny collection panel (✨ HUD button); 40-question shiny quiz for hard encounters
- **Pokédex** (`Pokedex`): Full Pokédex viewer (D key or HUD button)

---

## Progression & Meta

- **Trainer Level** (`TrainerLevel`): XP + level system; HUD display
- **Camp Rating** (`CampRating`): Star rating shown on camp gate
- **Achievements** (`Achievements`): Unlock-based system; panel lists all with unlock date; includes "Secret Seeker" and others
- **Trainer Card** (`/trainer-card.html`): Shows trainer info + 8 Kanto gym badges (computed from quiz best scores); "Share Card" button generates `?tc=<base64url>` for a read-only shareable view
- **Daily login streak**: Escalating rewards at day 3 / 7 / 14 / 30 / every 30 (tokens, seeds, berries)
- **Daily quests**: Camp activity quests (feed, harvest, market, rhythm, fish, minigame)
- **Gym Badges in camp**: "Gym Badges" button in pause menu shows all 8 badges with earned/locked state
- **Inventory**: Items, berries, seeds, tokens, coins stored in localStorage
- **Stats tracking**: Various play stats persisted in localStorage; personal bests viewable at `/stats.html`

---

## Economy / Shops

- **Poké Mart** (`Mart`): Buy items with tokens
- **Market scene**: 6 vendor stalls — cosmetics, berries, stones, plants, furniture, mystery
- **Cosmetics**: Purchasable trainer outfits/accessories

---

## Quiz & Mini-Games (20 leaderboard games)

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
| `daily` | Daily Challenge | Seeded 10-question daily quiz (same for everyone, one attempt/day) |
| `rhythm` | Rhythm | Camp rhythm battle wins |
| `evo` | Evolution Chain | Pick the correct evolution partner (Normal + Hard modes) |

- **Combo multiplier display**: all puzzle games show 🔥 ×1.5 at 3-streak, ×2 at 5-streak (visual only, does not affect submitted score)

---

## Social / Communication

- **Postcard system** (`PostcardSystem`): Write, save, read, delete postcards; "Share Link" encodes postcard as `?postcard=<base64url>`; visiting the link shows an incoming postcard modal with save option
- **Mystery Gift** (`MysteryGift`): Triggered by hardcoded holiday dates; code redemption input supports redeemable codes (`CAMPBONUS`, `SHINYSTART`, `POKEMONDAY26`)
- **Trainer card sharing**: "Share Card" on `/trainer-card.html` generates a `?tc=` URL encoding name, badges, partner, streak for read-only viewing
- **Camp Guestbook**: Leave messages visible to anyone on the same device/profile
- **Leaderboard** (`/ranking.html`): Global leaderboard for all 20 games via Upstash Redis; score submission via `PokeUtil.submitScore()`

---

## UI / HUD

- **HUD button bar**: Trainer Card, Pokédex, Achievements, Postcards, Photo Mode, Music Toggle, Guestbook, Shiny Collection, Notifications
- **Pause menu**: Resume, Save, Music on/off, Mystery Gift, Gym Badges, Accessibility
- **Accessibility panel**: High Contrast mode + Reduce Motion toggle; persisted via localStorage, applied on every load
- **Music**: Off by default; toggle persists via `pokequiz_music_on_v2`; 3 area tracks (Camp, House, Upstairs) streamed from archive.org; battle music synthesised via Web Audio
- **Sound effects**: Full SFX suite synthesised via Web Audio API (no downloads)
- **Photo Mode** (`PhotoMode`): In-game screenshot (F key or HUD button)
- **Debug HUD**: Toggle with backtick / F8
- **Notifications**: Bell icon with badge counter

---

## Pages

| Page | Description |
|---|---|
| `index.html` | Home / game hub |
| `play.html` | Game selector |
| `quizzes.html` | Quiz browser |
| `quiz.html` | Quiz player |
| `puzzle.html` | Puzzle browser |
| `puzzle-*.html` | Individual puzzle games (17 games) |
| `puzzle-evo.html` | Evolution Chain game |
| `daily.html` | Daily Challenge (seeded, one attempt/day) |
| `ranking.html` | Global leaderboard (20 games) |
| `camp.html` | Pokémon Camp (Phaser game) |
| `trainer-card.html` | Trainer card + gym badges + shareable URL |
| `trainer.html` | Trainer info page |
| `badges.html` | Badge browser |
| `profile.html` | Profile page |
| `stats.html` | Personal bests dashboard |

---

## Technical

- **Phaser 3.88**: Arcade physics, pixel art renderer, RESIZE scale mode
- **Script load order**: `camp-data.js` → `camp-systems.js` → `camp.js` (all `defer`)
- **Module namespaces**: `window.CAMP_DATA`, `window.CAMP_SYSTEMS`, `window.CAMP_SCENES`, `window.__CAMP_STATE`
- **Cache busting**: `?v=N` query params on script/CSS tags
- **Service worker** (`sw.js`): Asset caching
- **CI**: GitHub Actions — syntax-check all JS/MJS + leaderboard consistency check (`tests/check-consistency.mjs`)
- **Backend**: Vercel serverless (`api/leaderboard.js`) + Upstash Redis

---

## Known Gaps (not yet implemented)

- True seasonal tile palette swaps (currently overlay tints + emoji decorations)
- Seasonal leaderboard (monthly reset + top-3 reward)
- Trade board (cosmetic peer trading)
- Egg group mini-game (distinct from evolution chain)
