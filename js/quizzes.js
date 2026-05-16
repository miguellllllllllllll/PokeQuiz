(function() {
	const QUIZZES = {
		master: {
			id: 'master',
			name: 'Master Quiz',
			difficulty: 'Master',
			description: "The original PokeQuiz — a mixed bag of trivia spanning the anime, lore, and competitive deep cuts. Built for true masters.",
			chips: ['🏆 Mixed', '21 Questions', 'Original'],
			questions: [
				{ question: "What was Ash's starter pokemon?", answers: { a: "The Mouse Pokemon", b: "The Sky Squirrel Pokemon", c: "The Tiny Mouse Pokemon", d: "The Rat Pokemon" }, correctAnswer: "a" },
				{ question: "Who was the first pokemon Ash caught?", answers: { a: "Caterpie", b: "Pidgey", c: "Squirtle", d: "Pikachu" }, correctAnswer: "a" },
				{ question: "Where did Ash win his first Pokemon League?", answers: { a: "Kanto Region", b: "Alola Region", c: "Kalos Region", d: "Unova Region" }, correctAnswer: "b" },
				{ question: "What was the name of Ash's main rival in the Kanto Region?", answers: { a: "Gary", b: "Brock", c: "Giovanni", d: "Blue" }, correctAnswer: "a" },
				{ question: "What are the three types of the starter pokemon?", answers: { a: "Lightning, Flying, Fighting", b: "Fire, Water, Grass", c: "Dark, Ghost, Psychic", d: "Fire, Ice, Dragon" }, correctAnswer: "b" },
				{ question: "Which one are the Legendary Birds of the Kanto Region?", answers: { a: "Kyogre, Groudon, Rayquaza", b: "Artickuno, Zapdose, Moltress", c: "Zekrom, Kyurem, Reshiram", d: "Articuno, Zapdos, Moltres" }, correctAnswer: "d" },
				{ question: "Who was Pokemon Champion Cynthia's main Pokemon?", answers: { a: "Salamence", b: "Metagross", c: "Garchomp", d: "Dragonite" }, correctAnswer: "c" },
				{ question: "In what generation was Mega Evolution introduced?", answers: { a: "6th", b: "7th", c: "5th", d: "9th" }, correctAnswer: "a" },
				{ question: "What color are the footprints on a Shiny Galarian Stunfisk?", answers: { a: "Green", b: "Yellow", c: "Brown", d: "Blue" }, correctAnswer: "b" },
				{ question: "What item do you need to give Scyther to evolve?", answers: { a: "Equalizer", b: "Charged Battery", c: "Metal Claw", d: "Black Augurite" }, correctAnswer: "d" },
				{ question: "Who did Ash lose to in the Kalos Pokemon League?", answers: { a: "Iris", b: "Alain", c: "Diantha", d: "Cynthia" }, correctAnswer: "b" },
				{ question: "How do you differentiate a male Pikachu and a female Pikachu?", answers: { a: "Color of Their Tail", b: "Shape of Their Tail", c: "Shape of One of Their Ears", d: "Color of Their Ears" }, correctAnswer: "b" },
				{ question: "What's the name of the leader of Team Rocket?", answers: { a: "Jessie", b: "James", c: "Giovanni", d: "Ghetsis" }, correctAnswer: "c" },
				{ question: "Which Tapu is the guardian of Melemele Island?", answers: { a: "Tapu Koko", b: "Tapu Lele", c: "Tapu Bulu", d: "Tapu Fini" }, correctAnswer: "a" },
				{ question: "In the very first episode of Pokemon what chased after Ash and Pikachu?", answers: { a: "Fearow", b: "Spearow", c: "Pidgey", d: "Pidgeot" }, correctAnswer: "b" },
				{ question: "How was Pikachu's Pokeball unique when Ash received it?", answers: { a: "Color of The Pokeball", b: "Unusual Size of The Pokeball", c: "The Shape of The Pokeball", d: "A Figure on The Pokeball" }, correctAnswer: "d" },
				{ question: "How many Deoxys forms are there?", answers: { a: "2", b: "3", c: "4", d: "5" }, correctAnswer: "c" },
				{ question: "Who was the previous owner of Ash's Charizard?", answers: { a: "Gary", b: "Professor Oak", c: "Professor Juniper", d: "Damian" }, correctAnswer: "d" },
				{ question: "What cat was Mew's character design based on?", answers: { a: "Scottish Fold", b: "Balinese", c: "Siamese", d: "Sphynx (Bingus)" }, correctAnswer: "d" },
				{ question: "How many Eeveelutions are there?", answers: { a: "8", b: "9", c: "5", d: "6" }, correctAnswer: "a" },
				{ question: "In Pokemon GO, what can you name your Eevee for it to evolve into an Espeon?", answers: { a: "Esper", b: "Sakura", c: "Tamao", d: "Mai" }, correctAnswer: "b" }
			]
		},

		easy: {
			id: 'easy',
			name: 'Rookie Quiz',
			difficulty: 'Easy',
			description: "Just left Pallet Town? Start here. Basic anime moments, iconic Pokémon, and the kind of trivia anyone who watched the show should know.",
			chips: ['🌱 Easy', '21 Questions', 'Anime Basics'],
			questions: [
				{ question: "What type is Pikachu?", answers: { a: "Electric", b: "Fire", c: "Water", d: "Grass" }, correctAnswer: "a" },
				{ question: "What color is a normal Charizard?", answers: { a: "Blue", b: "Green", c: "Orange", d: "Purple" }, correctAnswer: "c" },
				{ question: "What is the famous Pokémon catchphrase?", answers: { a: "Catch them all", b: "Gotta catch 'em all", c: "Find them all", d: "Train them all" }, correctAnswer: "b" },
				{ question: "What item do trainers throw to catch a Pokémon?", answers: { a: "Pokéball", b: "Net", c: "Lure", d: "Cage" }, correctAnswer: "a" },
				{ question: "Who is the professor of the Kanto region?", answers: { a: "Professor Oak", b: "Professor Elm", c: "Professor Birch", d: "Professor Rowan" }, correctAnswer: "a" },
				{ question: "What region were the original Pokémon games set in?", answers: { a: "Hoenn", b: "Sinnoh", c: "Kanto", d: "Johto" }, correctAnswer: "c" },
				{ question: "What does Pikachu evolve into?", answers: { a: "Raichu", b: "Pichu", c: "Marill", d: "It doesn't evolve" }, correctAnswer: "a" },
				{ question: "What is the name of Ash's hometown?", answers: { a: "Pallet Town", b: "Viridian City", c: "Cerulean City", d: "Pewter City" }, correctAnswer: "a" },
				{ question: "What are the colors of a classic Pokéball?", answers: { a: "Blue and white", b: "Red and white", c: "Green and white", d: "Black and white" }, correctAnswer: "b" },
				{ question: "How does Team Rocket's motto begin?", answers: { a: "Prepare for trouble", b: "Get ready to lose", c: "We are Team Rocket", d: "Surrender now" }, correctAnswer: "a" },
				{ question: "What organization do Jessie and James belong to?", answers: { a: "Team Aqua", b: "Team Magma", c: "Team Rocket", d: "Team Galactic" }, correctAnswer: "c" },
				{ question: "Which Pokémon can transform into any other Pokémon?", answers: { a: "Ditto", b: "Mew", c: "Zoroark", d: "Smeargle" }, correctAnswer: "a" },
				{ question: "What type does Misty specialize in?", answers: { a: "Water", b: "Fire", c: "Grass", d: "Rock" }, correctAnswer: "a" },
				{ question: "What type does Brock specialize in?", answers: { a: "Fire", b: "Water", c: "Rock", d: "Electric" }, correctAnswer: "c" },
				{ question: "What is Snorlax famous for doing?", answers: { a: "Running fast", b: "Sleeping", c: "Flying high", d: "Swimming deep" }, correctAnswer: "b" },
				{ question: "How many starters do you pick from in Kanto?", answers: { a: "1", b: "3", c: "5", d: "9" }, correctAnswer: "b" },
				{ question: "Which one of these is a first-gen Fire starter?", answers: { a: "Charmander", b: "Cyndaquil", c: "Torchic", d: "Chimchar" }, correctAnswer: "a" },
				{ question: "What is the name of the encyclopedia device trainers carry?", answers: { a: "Pokédex", b: "Pokébook", c: "Pokétome", d: "Pokémap" }, correctAnswer: "a" },
				{ question: "What's Bulbasaur's primary type?", answers: { a: "Grass", b: "Water", c: "Fire", d: "Bug" }, correctAnswer: "a" },
				{ question: "Who is Ash's electric-mouse partner?", answers: { a: "Raichu", b: "Pichu", c: "Pikachu", d: "Plusle" }, correctAnswer: "c" },
				{ question: "What is Eevee's classification in the Pokédex?", answers: { a: "Mouse Pokémon", b: "Fox Pokémon", c: "Evolution Pokémon", d: "Cat Pokémon" }, correctAnswer: "c" }
			]
		},

		medium: {
			id: 'medium',
			name: 'Trainer Quiz',
			difficulty: 'Medium',
			description: "You've cleared a few gyms. Type matchups, evolution methods, and mid-tier trivia — solid trainer territory.",
			chips: ['⚡ Medium', '21 Questions', 'Game Mechanics'],
			questions: [
				{ question: "Which type is super effective against Water?", answers: { a: "Fire", b: "Electric", c: "Ground", d: "Bug" }, correctAnswer: "b" },
				{ question: "What is Charizard's secondary type?", answers: { a: "Dragon", b: "Flying", c: "Fighting", d: "Rock" }, correctAnswer: "b" },
				{ question: "Which stone evolves Eevee into Vaporeon?", answers: { a: "Fire Stone", b: "Water Stone", c: "Thunder Stone", d: "Leaf Stone" }, correctAnswer: "b" },
				{ question: "At what level does Magikarp evolve into Gyarados?", answers: { a: "15", b: "20", c: "25", d: "30" }, correctAnswer: "b" },
				{ question: "Which type does Champion Lance specialize in?", answers: { a: "Dragon", b: "Flying", c: "Ice", d: "Steel" }, correctAnswer: "a" },
				{ question: "Which region introduced the Steel and Dark types?", answers: { a: "Kanto", b: "Johto", c: "Hoenn", d: "Sinnoh" }, correctAnswer: "b" },
				{ question: "How many Pokémon were in the original Generation 1 Pokédex?", answers: { a: "149", b: "150", c: "151", d: "152" }, correctAnswer: "c" },
				{ question: "Who is the Champion of the Sinnoh region?", answers: { a: "Lance", b: "Steven", c: "Cynthia", d: "Alder" }, correctAnswer: "c" },
				{ question: "Which ability makes a Pokémon immune to Ground-type moves?", answers: { a: "Levitate", b: "Volt Absorb", c: "Lightning Rod", d: "Flash Fire" }, correctAnswer: "a" },
				{ question: "What is Dragonite's type combination?", answers: { a: "Dragon / Ice", b: "Dragon / Flying", c: "Dragon / Fire", d: "Dragon / Water" }, correctAnswer: "b" },
				{ question: "Which Pokémon is #001 in the National Pokédex?", answers: { a: "Mew", b: "Pikachu", c: "Bulbasaur", d: "Charmander" }, correctAnswer: "c" },
				{ question: "Which stone evolves Pikachu into Raichu?", answers: { a: "Sun Stone", b: "Moon Stone", c: "Thunder Stone", d: "Shiny Stone" }, correctAnswer: "c" },
				{ question: "Which Pokémon only learns Splash at low levels?", answers: { a: "Magikarp", b: "Feebas", c: "Wishiwashi", d: "Goldeen" }, correctAnswer: "a" },
				{ question: "What is the maximum number of Pokémon you can carry in your party?", answers: { a: "4", b: "5", c: "6", d: "8" }, correctAnswer: "c" },
				{ question: "Which stat does Swords Dance sharply raise?", answers: { a: "Defense", b: "Attack", c: "Special Attack", d: "Speed" }, correctAnswer: "b" },
				{ question: "Which company manufactures Poké Balls in the Kanto games?", answers: { a: "Silph Co.", b: "Devon Corp.", c: "Aether Foundation", d: "Macro Cosmos" }, correctAnswer: "a" },
				{ question: "Which move has the highest priority in normal play?", answers: { a: "Quick Attack", b: "Extreme Speed", c: "Mach Punch", d: "Bullet Punch" }, correctAnswer: "b" },
				{ question: "Which of these evolves with high friendship?", answers: { a: "Golbat → Crobat", b: "Eevee → Umbreon (at night)", c: "Pichu → Pikachu", d: "All of these" }, correctAnswer: "d" },
				{ question: "Ghost-type moves are super effective against which type?", answers: { a: "Dark", b: "Psychic", c: "Fighting", d: "Normal" }, correctAnswer: "b" },
				{ question: "Which region features Mega Evolution as its central mechanic?", answers: { a: "Kanto", b: "Hoenn", c: "Kalos", d: "Galar" }, correctAnswer: "c" },
				{ question: "Which Kanto starter is Grass / Poison once fully evolved?", answers: { a: "Charizard", b: "Blastoise", c: "Venusaur", d: "Pidgeot" }, correctAnswer: "c" }
			]
		},

		hard: {
			id: 'hard',
			name: 'Elite Quiz',
			difficulty: 'Hard',
			description: "Elite Four caliber. Signature moves, deep stat trivia, generational firsts — bring your Pokédex and your patience.",
			chips: ['🔥 Hard', '21 Questions', 'Deep Cuts'],
			questions: [
				{ question: "What is Arceus's Base Stat Total?", answers: { a: "600", b: "680", c: "720", d: "750" }, correctAnswer: "c" },
				{ question: "Which Pokémon is the only one to learn V-create as a signature move?", answers: { a: "Victini", b: "Rayquaza", c: "Mewtwo", d: "Reshiram" }, correctAnswer: "a" },
				{ question: "What is Shedinja's HP stat regardless of level?", answers: { a: "1", b: "10", c: "Same as its level", d: "100" }, correctAnswer: "a" },
				{ question: "Which Pokémon naturally has the ability Wonder Guard?", answers: { a: "Sableye", b: "Shedinja", c: "Spiritomb", d: "Dusknoir" }, correctAnswer: "b" },
				{ question: "Which generation introduced the Fairy type?", answers: { a: "Gen 4", b: "Gen 5", c: "Gen 6", d: "Gen 7" }, correctAnswer: "c" },
				{ question: "What is Ditto's only naturally learned move?", answers: { a: "Splash", b: "Transform", c: "Tackle", d: "Sketch" }, correctAnswer: "b" },
				{ question: "What is the National Pokédex number of Mew?", answers: { a: "150", b: "151", c: "152", d: "153" }, correctAnswer: "b" },
				{ question: "Which Pokémon evolves from Sneasel with a Razor Claw held at night?", answers: { a: "Weavile", b: "Gliscor", c: "Honchkrow", d: "Mismagius" }, correctAnswer: "a" },
				{ question: "Which move must Rayquaza know to achieve Mega Evolution?", answers: { a: "Dragon Pulse", b: "Outrage", c: "Dragon Ascent", d: "Draco Meteor" }, correctAnswer: "c" },
				{ question: "Which Pokémon's signature move is Sketch?", answers: { a: "Smeargle", b: "Ditto", c: "Mew", d: "Zoroark" }, correctAnswer: "a" },
				{ question: "What is the type combination of Galarian Slowking?", answers: { a: "Psychic / Dark", b: "Poison / Psychic", c: "Fairy / Psychic", d: "Ghost / Psychic" }, correctAnswer: "b" },
				{ question: "What is Greninja's standard Hidden Ability?", answers: { a: "Protean", b: "Torrent", c: "Battle Bond", d: "Adaptability" }, correctAnswer: "a" },
				{ question: "Which Sinnoh legendary trio represents emotion, willpower, and knowledge?", answers: { a: "Lake Guardians", b: "Creation Trio", c: "Sky Forces", d: "Beast Trio" }, correctAnswer: "a" },
				{ question: "Which Pokémon has the highest base HP stat in the games?", answers: { a: "Blissey", b: "Chansey", c: "Snorlax", d: "Wailord" }, correctAnswer: "a" },
				{ question: "Which Pokémon is the only Ice / Ghost type?", answers: { a: "Froslass", b: "Glalie", c: "Cryogonal", d: "Jynx" }, correctAnswer: "a" },
				{ question: "Which move has the highest base power in the main games?", answers: { a: "Hyper Beam", b: "Explosion", c: "Eternabeam", d: "Light of Ruin" }, correctAnswer: "b" },
				{ question: "What does the move Spite do?", answers: { a: "Reduces PP of the foe's last move", b: "Lowers the foe's Attack", c: "Always strikes first", d: "Curses the foe" }, correctAnswer: "a" },
				{ question: "Which famous glitch Pokémon was found in Pokémon Red and Blue?", answers: { a: "MissingNo.", b: "'M (M-block)", c: "Glitchmon", d: "Both A and B" }, correctAnswer: "d" },
				{ question: "Who is the protagonist of the Pokémon Adventures manga's Red & Blue arc?", answers: { a: "Red", b: "Ash", c: "Blue", d: "Gold" }, correctAnswer: "a" },
				{ question: "Which Pokémon is famous for having only the move Splash and being completely useless until evolved?", answers: { a: "Magikarp", b: "Feebas", c: "Wishiwashi", d: "Goldeen" }, correctAnswer: "a" },
				{ question: "Which Galar starter evolves into Cinderace?", answers: { a: "Scorbunny", b: "Grookey", c: "Sobble", d: "Litten" }, correctAnswer: "a" }
			]
		}
	};

	window.POKEQUIZ_QUIZZES = QUIZZES;
})();
