const TRAINERS = {
	red: {
		name: 'Red',
		title: 'The Silent Champion',
		region: 'Kanto · Pallet Town',
		role: 'Champion',
		sprite: 'Pictures/Red.gif',
		art: 'Pictures/Red_art.png',
		generation: 'Generation I',
		debut: 'Pokémon Red & Green (1996)',
		ace: 'Pikachu',
		types: ['Mixed'],
		lore: [
			"Red is the legendary Trainer from Pallet Town who set out at age 11 with a starter from Professor Oak and went on to become Kanto's Pokémon League Champion. He single-handedly dismantled Team Rocket, captured the legendary birds, and even confronted Mewtwo in the depths of Cerulean Cave.",
			"After claiming the title, he disappeared from public life and retreated to the summit of Mt. Silver — a frozen, monster-infested peak — where he trained in complete silence for years. He is canonically the strongest Trainer in the franchise's lore.",
			"Red never speaks a single line of dialogue in any mainline game. His silence has become iconic: a champion defined entirely by what he does, not what he says."
		],
		facts: [
			'Based on series creator Satoshi Tajiri as a child.',
			'In HeartGold/SoulSilver, his team is in the level 80s — the highest of any Trainer at release.',
			'His original name in beta materials was simply "Satoshi" (Ash in English).'
		]
	},
	blue: {
		name: 'Blue Oak',
		title: 'The Eternal Rival',
		region: 'Kanto · Pallet Town',
		role: 'Rival / Gym Leader',
		sprite: 'Pictures/Blue.gif',
		art: 'Pictures/Blue_art.png',
		generation: 'Generation I',
		debut: 'Pokémon Red & Green (1996)',
		ace: 'Varies by starter',
		types: ['Mixed'],
		lore: [
			"Blue is Professor Oak's grandson and the player's lifelong rival in Kanto. Arrogant, talented, and relentlessly competitive, he picks the starter strong against yours and races you to every milestone in the region.",
			"He briefly held the title of Pokémon League Champion — for about ten minutes — before being dethroned by Red in the most famous rival battle in gaming history. Oak's stinging words afterward (\"you have forgotten the most important thing\") have echoed for decades.",
			"By the time of Gold/Silver, Blue has rebuilt himself as the Viridian City Gym Leader, taking over Giovanni's old gym and specializing in a balanced, type-diverse team."
		],
		facts: [
			'His default name "Blue" is a Western-only convention; in Japan he is "Green".',
			'He is the only Champion in the series to be defeated immediately after taking the title.',
			'His Eevee evolves based on how well you treat your rival early in the game.'
		]
	},
	giovanni: {
		name: 'Giovanni',
		title: 'Boss of Team Rocket',
		region: 'Kanto · Viridian City',
		role: 'Gym Leader / Crime Boss',
		sprite: 'Pictures/Giovanni.png',
		art: 'Pictures/Giovanni_art.png',
		generation: 'Generation I',
		debut: 'Pokémon Red & Green (1996)',
		ace: 'Rhydon',
		types: ['Ground'],
		lore: [
			"Giovanni leads a double life: by day he is the Viridian City Gym Leader and final Kanto badge-holder; by night he is the founder and Boss of Team Rocket, an organized crime syndicate that uses Pokémon for profit and power.",
			"His operations stretch across Kanto — from the Game Corner basement in Celadon to the Silph Co. takeover in Saffron — and he is personally responsible for the experiments at Pokémon Mansion that led to the creation of Mewtwo.",
			"After his defeat by Red, Giovanni disbands Team Rocket and vanishes to train in self-imposed exile, intending to one day return stronger. His son, Silver, grows up resenting him for it."
		],
		facts: [
			'His Pokémon are all Ground-type, but his crime syndicate uses Poison-types like Koffing and Zubat.',
			'In Sun & Moon\'s Rainbow Rocket episode, he leads a coalition of every villain team boss.',
			'Silver, the rival in Gold/Silver, is his estranged son.'
		]
	},
	lance: {
		name: 'Lance',
		title: 'The Dragon Master',
		region: 'Johto · Blackthorn City',
		role: 'Champion (Indigo League)',
		sprite: 'Pictures/Lance.png',
		generation: 'Generation I / II',
		debut: 'Pokémon Red & Green (1996)',
		ace: 'Dragonite',
		types: ['Dragon'],
		lore: [
			"Lance is a member of the prestigious Dragon clan of Blackthorn City and the most famous Dragon-type master in the world. He debuted as the final member of Kanto's Elite Four before being promoted to Champion of the entire Indigo League by the time of Gold/Silver.",
			"His signature Pokémon — a Dragonite that is canonically over-leveled and uses moves it shouldn't legally know — is arguably the most infamous \"that one Pokémon\" boss in series history.",
			"Lance plays a heroic role in Johto, personally helping the player dismantle the remnants of Team Rocket in Mahogany Town and the Goldenrod Radio Tower. He is one of the few villains-turned-allies in the franchise."
		],
		facts: [
			'His cousin is Clair, the Blackthorn Gym Leader.',
			'He shares a name and design with his Adventures manga counterpart, who is a far darker character.',
			'His cape and stoic posture are directly inspired by classic shōnen anime rivals.'
		]
	},
	cynthia: {
		name: 'Cynthia',
		title: 'The Sinnoh Champion',
		region: 'Sinnoh · Celestic Town',
		role: 'Champion',
		sprite: 'Pictures/Cynthia.png',
		generation: 'Generation IV',
		debut: 'Pokémon Diamond & Pearl (2006)',
		ace: 'Garchomp',
		types: ['Mixed'],
		lore: [
			"Cynthia is widely regarded by the community as the single hardest Champion in the entire Pokémon series. A scholar of Sinnoh mythology, she splits her time between studying ancient ruins and crushing challengers at the Pokémon League with a perfectly balanced team.",
			"Her grandmother is the elder of Celestic Town and the keeper of its Old Charm and ancient murals. Cynthia's deep knowledge of the lore of Dialga, Palkia, and Giratina is what allows her to anticipate and counter Team Galactic's plans across the region.",
			"Her signature Garchomp — fast, hard-hitting, and packing Earthquake plus Dragon Rush — has caused more game-overs than any other single Pokémon in franchise history."
		],
		facts: [
			'She makes cameo appearances as a guest Champion in Black/White, Sun/Moon, and Sword/Shield.',
			'Her Spiritomb has no type weaknesses (in Gen IV) — a deliberate cruelty.',
			'She is the first female Champion in the mainline series.'
		]
	},
	steven: {
		name: 'Steven Stone',
		title: 'Master of Steel',
		region: 'Hoenn · Mossdeep City',
		role: 'Champion / Stone Collector',
		sprite: 'Pictures/Steven.png',
		generation: 'Generation III',
		debut: 'Pokémon Ruby & Sapphire (2002)',
		ace: 'Metagross',
		types: ['Steel'],
		lore: [
			"Steven is the son of the president of Devon Corporation, but he has no interest in inheriting the family business. Instead, he travels Hoenn obsessively in search of rare stones and Pokémon — particularly Steel-types, which he believes embody resilience and beauty.",
			"He is Hoenn's reigning Champion in Ruby/Sapphire/Emerald and is uniquely personal in his role: he chats with you in caves, gives you a TM the first time you meet, and lends a hand against Team Magma and Aqua at the climax.",
			"In Omega Ruby/Alpha Sapphire he reveals he was the first Trainer to discover Mega Evolution in Hoenn, and his Mega Metagross is the centerpiece of one of the toughest final battles in the series."
		],
		facts: [
			'In Emerald, he steps down as Champion to let Wallace take the throne.',
			'He gifts the player a Beldum at the start of post-game ORAS — a direct callback to fans.',
			'He is the only Champion who personally hand-delivers an item to the player early-game.'
		]
	},
	iris: {
		name: 'Iris',
		title: 'The Wild Dragon Tamer',
		region: 'Unova · Opelucid City',
		role: 'Gym Leader → Champion',
		sprite: 'Pictures/Iris.png',
		generation: 'Generation V',
		debut: 'Pokémon Black & White (2010)',
		ace: 'Haxorus',
		types: ['Dragon'],
		lore: [
			"Iris grew up in the Village of Dragons, raised among Druddigon and Deino. Her bond with Dragon-types is instinctive — she sees them not as monsters but as family — and that wildness shows in her unpolished, energetic personality.",
			"In Black, she serves as the Opelucid City Gym Leader; in the sequel Black 2/White 2, she is promoted to Champion of the entire Unova League. She is the youngest Champion in the mainline series at the time of her promotion.",
			"Her ace, Haxorus, is one of the highest-base-Attack Dragon-types in the game, and her Lapras + Aggron coverage in the Champion battle has caught many Trainers off guard expecting an all-Dragon team."
		],
		facts: [
			'She is the youngest mainline Champion in the series.',
			'Drayden, the alternate Opelucid Gym Leader, is her mentor and grandfather figure.',
			'She becomes a major recurring character in the Pokémon anime\'s Best Wishes arc.'
		]
	},
	n: {
		name: 'N',
		title: 'King of Team Plasma',
		region: 'Unova',
		role: 'Plasma King / Anti-Hero',
		sprite: 'Pictures/N.png',
		generation: 'Generation V',
		debut: 'Pokémon Black & White (2010)',
		ace: 'Zekrom / Reshiram',
		types: ['Mixed (wild-caught)'],
		lore: [
			"N — short for Natural Harmonia Gropius — was raised in isolation by Ghetsis after being found as a child surrounded by abused Pokémon. He grew up believing humans and Pokémon should be separated, and was groomed to become the King of Team Plasma to enforce that ideology.",
			"He claims to hear the voices of Pokémon, and his team is never the same twice: he catches wild Pokémon moments before each battle and releases them afterward, refusing to keep them in his party.",
			"At the climax of Black/White he awakens one of Unova's legendary dragons (Zekrom in Black, Reshiram in White) and challenges the player in his castle. After his defeat — and the revelation that Ghetsis used him — he leaves Unova on the back of his dragon to find the truth for himself."
		],
		facts: [
			'His full name "Natural Harmonia Gropius" is built from architectural and naturalist references.',
			'He is the only "villain" in the series whom the player never truly defeats — only convinces.',
			'In Black 2/White 2 he returns two years later and aids the player against the new Team Plasma.'
		]
	}
};

(function init(){
	const params = new URLSearchParams(location.search);
	const id = (params.get('id') || '').toLowerCase();
	const t = TRAINERS[id];
	const root = document.getElementById('trainer-root');
	if(!t){
		root.innerHTML = '<div class="lore-missing"><h2>Unknown Trainer</h2><p>No lore page exists for "'+(id||'(none)')+'". <a href="index.html">Back to Home</a></p></div>';
		document.title = 'Trainer · PokeQuiz';
		return;
	}
	document.title = t.name + ' · PokeQuiz';

	const factsHtml = t.facts.map(f => '<li>'+f+'</li>').join('');
	const loreHtml = t.lore.map(p => '<p>'+p+'</p>').join('');
	const typesHtml = t.types.map(x => '<span class="lore-chip">'+x+'</span>').join('');

	root.innerHTML = `
		<a class="lore-back" href="index.html">← Back to Iconic Trainers</a>
		<div class="lore-card">
			<div class="lore-portrait">
				<img src="${t.sprite}" alt="${t.name} sprite">
				<h1>${t.name}</h1>
				<p class="lore-title">${t.title}</p>
				<dl class="lore-meta">
					<div><dt>Region</dt><dd>${t.region}</dd></div>
					<div><dt>Role</dt><dd>${t.role}</dd></div>
					<div><dt>Generation</dt><dd>${t.generation}</dd></div>
					<div><dt>Debut</dt><dd>${t.debut}</dd></div>
					<div><dt>Ace</dt><dd>${t.ace}</dd></div>
					<div><dt>Specialty</dt><dd class="lore-chips">${typesHtml}</dd></div>
				</dl>
			</div>
			<div class="lore-body">
				<section>
					<h2>Lore</h2>
					${loreHtml}
				</section>
				<section>
					<h2>Did You Know?</h2>
					<ul>${factsHtml}</ul>
				</section>
			</div>
		</div>
	`;
})();
