// Canonical client-side leaderboard game config — single source of truth for
// pages that render leaderboards (ranking.html). Exposes window.POKEQUIZ_GAMES.
//
// NOTE: api/leaderboard.js keeps its own server-side GAMES map (validation
// keys, score caps). The game ids and mode keys here must stay in sync with it.
(function () {
	'use strict';
	window.POKEQUIZ_GAMES = {
		quiz: {
			label: 'Trivia Quiz', scoreLabel: 'Score', defaultTotal: 21, timeBased: false,
			modes: null,
		},
		silhouette: {
			label: "Who's That Pokémon?", scoreLabel: 'Streak', timeBased: false,
			modes: [
				{ key: 'casual',   label: 'Casual' },
				{ key: 'standard', label: 'Standard' },
				{ key: 'hardcore', label: 'Hardcore' },
			],
		},
		cry: {
			label: 'Cry Quiz', scoreLabel: 'Streak', timeBased: false,
			modes: [
				{ key: 'casual',   label: 'Casual' },
				{ key: 'standard', label: 'Standard' },
				{ key: 'hardcore', label: 'Hardcore' },
			],
		},
		higherlower: {
			label: 'Higher or Lower', scoreLabel: 'Streak', timeBased: false,
			modes: [
				{ key: 'weight', label: 'Weight' },
				{ key: 'height', label: 'Height' },
				{ key: 'hp',     label: 'HP' },
				{ key: 'atk',    label: 'Attack' },
				{ key: 'spd',    label: 'Speed' },
				{ key: 'random', label: 'Random' },
			],
		},
		memory: {
			label: 'Memory Match', scoreLabel: 'Time', timeBased: true,
			modes: [
				{ key: '6',  label: 'Easy (6 pairs)' },
				{ key: '8',  label: 'Medium (8 pairs)' },
				{ key: '12', label: 'Hard (12 pairs)' },
			],
		},
		zoom: {
			label: 'Zoomed-In', scoreLabel: 'Streak', timeBased: false,
			modes: [
				{ key: 'casual',   label: 'Casual' },
				{ key: 'standard', label: 'Standard' },
				{ key: 'hardcore', label: 'Hardcore' },
			],
		},
		dex: {
			label: 'Pokédex Entry', scoreLabel: 'Streak', timeBased: false,
			modes: [
				{ key: 'casual',   label: 'Casual' },
				{ key: 'standard', label: 'Standard' },
				{ key: 'hardcore', label: 'Hardcore' },
			],
		},
		type: {
			label: 'Type Chart', scoreLabel: 'Streak', timeBased: false,
			modes: [
				{ key: 'mono',   label: 'Mono-type' },
				{ key: 'dual',   label: 'Dual-type' },
				{ key: 'random', label: 'Random' },
			],
		},
		stats: {
			label: 'Stat Spread', scoreLabel: 'Streak', timeBased: false,
			modes: [
				{ key: 'easy',   label: 'Easy (4 choices)' },
				{ key: 'medium', label: 'Medium (6 choices)' },
				{ key: 'hard',   label: 'Hard (8 choices)' },
			],
		},
		sprint: {
			label: 'Gen Sprint', scoreLabel: 'Caught', timeBased: false,
			modes: [
				{ key: '30',  label: '30 seconds' },
				{ key: '60',  label: '60 seconds' },
				{ key: '120', label: '2 minutes' },
			],
		},
		infinite: {
			label: 'Infinite Trivia', scoreLabel: 'Streak', timeBased: false,
			modes: null,
		},
		wordle: {
			label: 'Pokédle', scoreLabel: 'Streak', timeBased: false,
			modes: null,
		},
		connections: {
			label: 'Connections', scoreLabel: 'Streak', timeBased: false,
			modes: null,
		},
		ability: {
			label: 'Ability Guesser', scoreLabel: 'Streak', timeBased: false,
			modes: [
				{ key: 'ability-name',    label: 'Description → Ability' },
				{ key: 'pokemon-ability', label: 'Pokémon → Ability' },
			],
		},
		moveset: {
			label: 'Moveset Guesser', scoreLabel: 'Streak', timeBased: false,
			modes: [
				{ key: 'casual',   label: 'Casual' },
				{ key: 'standard', label: 'Standard' },
				{ key: 'hardcore', label: 'Hardcore' },
			],
		},
		spotlight: {
			label: 'Daily Spotlight', scoreLabel: 'Score', timeBased: false,
			modes: null,
		},
		team: {
			label: 'Counter Team', scoreLabel: 'Score', timeBased: false,
			modes: null,
		},
	};
})();
