/* ============================================================
   personality-data.js  v3
   Three personality quizzes — includes typeId (PokeAPI type
   badge ID), showcase Pokémon IDs, and showcase type IDs
   for the hub cards.
   ============================================================ */
window.PERSONALITY_DATA = {

  quizzes: {

    /* ════════════════════════════════════════════
       QUIZ 1 – Which Starter Pokémon Are You?
    ════════════════════════════════════════════ */
    starter: {
      id: 'starter',
      name: 'Which Starter Pokémon Are You?',
      label: 'STARTER QUIZ',
      subtitle: '9 results · 10 questions',
      icon: '🌿',
      color: '#00b894',
      gradient: 'linear-gradient(135deg,#00b894 0%,#00cec9 100%)',
      desc: 'Grass, Fire, or Water? Find your Gen 1–3 starter match.',
      showcasePokemon: [4, 1, 7],   // Charmander · Bulbasaur · Squirtle

      pokemon: {
        bulbasaur:  { id: 1,   typeId: 12, name: 'Bulbasaur',  type: 'Grass',  color: '#00b894',
                      traits: ['Reliable','Calm','Nurturing','Steady'],
                      desc: "The underrated choice that always delivers. Your steady, patient presence is what keeps everything together, no spotlight needed. People who pick you never regret it." },
        charmander: { id: 4,   typeId: 10, name: 'Charmander', type: 'Fire',   color: '#e17055',
                      traits: ['Passionate','Driven','Bold','Loyal'],
                      desc: "You start small but burn hotter than anyone expected. Driven, passionate, and fiercely loyal to the people you care about. Once you commit to something, absolutely nothing can stop you." },
        squirtle:   { id: 7,   typeId: 11, name: 'Squirtle',   type: 'Water',  color: '#0984e3',
                      traits: ['Cool','Chill','Dependable','Smart'],
                      desc: "Effortlessly cool, dependable, and always in control. You've got a calm confidence that people find magnetic, and when it's time to perform, you never let anyone down." },
        chikorita:  { id: 152, typeId: 12, name: 'Chikorita',  type: 'Grass',  color: '#00b894',
                      traits: ['Gentle','Optimistic','Loyal','Sweet'],
                      desc: "You lead with kindness and a stubborn, contagious optimism. Some might underestimate you at first, but you always find a way to prove them wrong with pure heart and persistence." },
        cyndaquil:  { id: 155, typeId: 10, name: 'Cyndaquil',  type: 'Fire',   color: '#fdcb6e',
                      traits: ['Shy','Sincere','Hardworking','Warm'],
                      desc: "Quiet on the outside, burning on the inside. You take a little time to warm up to new people, but once you do you're one of the most genuine and dedicated friends anyone could ask for." },
        totodile:   { id: 158, typeId: 11, name: 'Totodile',   type: 'Water',  color: '#74b9ff',
                      traits: ['Energetic','Fearless','Playful','Fun'],
                      desc: "Pure unfiltered enthusiasm, every single day. You dive into everything head-first with a massive grin on your face, and somehow your ridiculous confidence actually works out more often than not." },
        treecko:    { id: 252, typeId: 12, name: 'Treecko',    type: 'Grass',  color: '#00b894',
                      traits: ['Cool','Independent','Composed','Sharp'],
                      desc: "Impossibly cool under pressure and too proud to show it. You face every challenge with a stone-cold expression and a sharp mind, and somehow that makes people trust you completely." },
        torchic:    { id: 255, typeId: 10, name: 'Torchic',    type: 'Fire',   color: '#e84393',
                      traits: ['Spirited','Affectionate','Fierce','Confident'],
                      desc: "Small but absolutely unstoppable. Endlessly spirited and surprisingly fierce, you throw everything you have into everything you do. The people who love you are never surprised when you win." },
        mudkip:     { id: 258, typeId: 11, name: 'Mudkip',     type: 'Water',  color: '#6c5ce7',
                      traits: ['Laid-back','Dependable','Quietly Strong','Genuine'],
                      desc: "Completely unassuming, wildly effective. You don't make a fuss, you don't need the attention. You just show up, do the work, and somehow end up being the most powerful one in the room." }
      },

      questions: [
        { text: "You're about to choose a starter. What matters most?",
          answers: [
            { emoji:'💚', text: "Something dependable — I need consistency",     weights: { bulbasaur:3, chikorita:2, mudkip:1 } },
            { emoji:'🔥', text: "Something with fire — raw power and passion",   weights: { charmander:3, torchic:2, cyndaquil:1 } },
            { emoji:'💧', text: "Something cool — style and smart thinking",     weights: { squirtle:3, totodile:2, treecko:1 } },
            { emoji:'✨', text: "Whatever people least expect me to pick",       weights: { treecko:3, mudkip:2, chikorita:1 } }
          ]
        },
        { text: "Where do you feel most at home?",
          answers: [
            { emoji:'🌲', text: "Deep in nature — forests, mountains, trails",   weights: { bulbasaur:3, chikorita:2, treecko:2 } },
            { emoji:'🏙️', text: "In the city — always something happening",      weights: { charmander:3, torchic:2, totodile:1 } },
            { emoji:'🌊', text: "Near water — ocean, lake, a river",             weights: { squirtle:3, totodile:2, mudkip:2 } },
            { emoji:'🛖', text: "Anywhere cozy — it's who I'm with, not where",  weights: { cyndaquil:3, chikorita:2, bulbasaur:1 } }
          ]
        },
        { text: "A rival shows up looking for a battle. You...",
          answers: [
            { emoji:'🔥', text: "Step up immediately — bring it on",             weights: { charmander:3, totodile:2, torchic:2 } },
            { emoji:'🤔', text: "Study them first — wait for the right moment",  weights: { treecko:3, squirtle:2, bulbasaur:1 } },
            { emoji:'💬', text: "Try talking it out — battles aren't everything",weights: { chikorita:3, cyndaquil:2, mudkip:1 } },
            { emoji:'😤', text: "Accept calmly, but fight like your life depends on it",weights: { squirtle:3, bulbasaur:2, treecko:1 } }
          ]
        },
        { text: "How do you handle a really bad day?",
          answers: [
            { emoji:'🔥', text: "Push through it — frustration becomes fuel",    weights: { charmander:3, torchic:2, totodile:1 } },
            { emoji:'🛋️', text: "Rest and recharge — tomorrow will be better",   weights: { mudkip:3, bulbasaur:2, cyndaquil:2 } },
            { emoji:'👫', text: "Talk to the people I trust most",               weights: { chikorita:3, squirtle:2, cyndaquil:1 } },
            { emoji:'😤', text: "Shake it off and act like nothing happened",    weights: { treecko:3, totodile:2, squirtle:1 } }
          ]
        },
        { text: "Your friends would say you're the one who...",
          answers: [
            { emoji:'💪', text: "Always shows up when things get hard",          weights: { bulbasaur:3, mudkip:2, cyndaquil:2 } },
            { emoji:'🎉', text: "Makes everything more fun",                     weights: { totodile:3, torchic:2, charmander:1 } },
            { emoji:'🧊', text: "Stays cool when everyone else panics",          weights: { treecko:3, squirtle:2, mudkip:1 } },
            { emoji:'💛', text: "Is always encouraging and kind",                weights: { chikorita:3, cyndaquil:2, bulbasaur:1 } }
          ]
        },
        { text: "What's your approach to a new challenge?",
          answers: [
            { emoji:'📋', text: "Plan carefully — I want every advantage",       weights: { squirtle:3, bulbasaur:2, treecko:1 } },
            { emoji:'💥', text: "Dive in and figure it out as I go",             weights: { totodile:3, charmander:2, torchic:1 } },
            { emoji:'🌱', text: "Start slow, build momentum, then go all in",    weights: { chikorita:3, mudkip:2, cyndaquil:1 } },
            { emoji:'😎', text: "Walk in like I've done this a hundred times",   weights: { treecko:3, squirtle:2, charmander:1 } }
          ]
        },
        { text: "Pick a power you'd want:",
          answers: [
            { emoji:'🌿', text: "Healing — restore energy and regrow anything",  weights: { bulbasaur:3, chikorita:2, mudkip:1 } },
            { emoji:'🔥', text: "Flames — control fire with pure will",          weights: { charmander:3, torchic:2, cyndaquil:2 } },
            { emoji:'🌊', text: "Water — command rivers, oceans, storms",        weights: { squirtle:3, totodile:2, mudkip:2 } },
            { emoji:'🌳', text: "Growth — make any living thing thrive",         weights: { chikorita:3, treecko:2, bulbasaur:1 } }
          ]
        },
        { text: "Your ideal Saturday:",
          answers: [
            { emoji:'🏕️', text: "Hiking somewhere quiet and beautiful",          weights: { bulbasaur:3, chikorita:2, treecko:1 } },
            { emoji:'🎮', text: "Gaming, competing, or training hard",            weights: { charmander:3, torchic:2, squirtle:1 } },
            { emoji:'🏄', text: "Surfing, swimming — anything on the water",      weights: { totodile:3, mudkip:2, squirtle:1 } },
            { emoji:'☕', text: "Staying in, comfortable, zero obligations",      weights: { cyndaquil:3, mudkip:2, bulbasaur:1 } }
          ]
        },
        { text: "When you win, you...",
          answers: [
            { emoji:'😤', text: "Nod quietly — you knew this would happen",      weights: { treecko:3, squirtle:2, mudkip:1 } },
            { emoji:'🎊', text: "Celebrate loudly — everyone's celebrating",    weights: { totodile:3, torchic:2, charmander:1 } },
            { emoji:'🙏', text: "Thank everyone who helped you get there",       weights: { chikorita:3, cyndaquil:2, bulbasaur:1 } },
            { emoji:'😤', text: "Feel proud for a moment, then go train harder", weights: { charmander:3, squirtle:2, treecko:1 } }
          ]
        },
        { text: "Last question — what drives you?",
          answers: [
            { emoji:'❤️', text: "Protecting the people I love",                  weights: { bulbasaur:3, cyndaquil:2, chikorita:2 } },
            { emoji:'🏆', text: "Proving I'm the best — full stop",              weights: { charmander:3, torchic:2, treecko:1 } },
            { emoji:'🌊', text: "Going with life's flow and enjoying the ride",  weights: { totodile:3, mudkip:2, squirtle:1 } },
            { emoji:'🤝', text: "Making sure everyone around me thrives",        weights: { chikorita:3, mudkip:2, bulbasaur:1 } }
          ]
        }
      ]
    },

    /* ════════════════════════════════════════════
       QUIZ 2 – Which Pokémon Type Are You?
    ════════════════════════════════════════════ */
    type: {
      id: 'type',
      name: 'Which Pokémon Type Are You?',
      label: 'TYPE QUIZ',
      subtitle: '10 results · 10 questions',
      icon: '🔮',
      color: '#6c5ce7',
      gradient: 'linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%)',
      desc: 'Fire, Psychic, Ghost… which of the 10 core types fits your personality?',
      showcaseTypeIds: [10, 11, 12, 13, 14, 8],  // Fire · Water · Grass · Electric · Psychic · Ghost

      pokemon: {
        fire:     { id: 6,   typeId: 10, name: 'Fire Type',     type: 'Fire',     typeName: 'Fire',     icon: '🔥', color: '#EE8130',
                    traits: ['Passionate','Bold','Energetic','Intense'],
                    desc: "You are pure, burning passion. Enthusiastic, dynamic, and impossible to ignore. You throw yourself into everything you care about with an intensity that lights up the people around you. Just don't burn out too fast." },
        water:    { id: 9,   typeId: 11, name: 'Water Type',    type: 'Water',    typeName: 'Water',    icon: '🌊', color: '#6390F0',
                    traits: ['Adaptable','Calm','Empathetic','Deep'],
                    desc: "You flow around every obstacle rather than crashing through it. Calm, emotionally intuitive, and endlessly adaptable, you're the person people come to when everything feels overwhelming." },
        grass:    { id: 3,   typeId: 12, name: 'Grass Type',    type: 'Grass',    typeName: 'Grass',    icon: '🌿', color: '#7AC74C',
                    traits: ['Nurturing','Patient','Steady','Grounded'],
                    desc: "Rooted, steady, and full of quiet life. You take your time, but you always grow toward the light. The most reliable person in any room, always making sure everyone else is okay before checking on yourself." },
        electric: { id: 26,  typeId: 13, name: 'Electric Type', type: 'Electric', typeName: 'Electric', icon: '⚡', color: '#F7D02C',
                    traits: ['Energetic','Quick','Charismatic','Sharp'],
                    desc: "You charge every room you enter. Quick-witted, charismatic, and endlessly energetic, you process the world faster than almost anyone else and have the sparkling personality to match." },
        psychic:  { id: 65,  typeId: 14, name: 'Psychic Type',  type: 'Psychic',  typeName: 'Psychic',  icon: '🔮', color: '#F95587',
                    traits: ['Analytical','Intuitive','Complex','Focused'],
                    desc: "You see patterns where others see chaos. Deeply analytical, strangely intuitive, and endlessly curious about how things work, you're the person who figured out the plot twist three chapters ago." },
        ghost:    { id: 94,  typeId: 8,  name: 'Ghost Type',    type: 'Ghost',    typeName: 'Ghost',    icon: '👻', color: '#735797',
                    traits: ['Mysterious','Creative','Playful','Independent'],
                    desc: "You exist slightly outside of everyone else's reality, and you love it. Mysterious, creative, and delightfully unpredictable, you move through the world on your own terms, invisible to most but unforgettable to few." },
        dragon:   { id: 149, typeId: 16, name: 'Dragon Type',   type: 'Dragon',   typeName: 'Dragon',   icon: '🐉', color: '#6F35FC',
                    traits: ['Powerful','Ambitious','Proud','Rare'],
                    desc: "Rare and remarkable. You carry yourself with a quiet authority that people can't quite explain. They just know you're different. Ambitious, powerful, and not easily found, but absolutely worth knowing." },
        fighting: { id: 68,  typeId: 2,  name: 'Fighting Type', type: 'Fighting', typeName: 'Fighting', icon: '🥊', color: '#C22E28',
                    traits: ['Determined','Hardworking','Direct','Strong'],
                    desc: "No shortcuts, no excuses, no backing down. You face every challenge head-on with relentless determination. People always know exactly where they stand with you, and they respect it." },
        normal:   { id: 143, typeId: 1,  name: 'Normal Type',   type: 'Normal',   typeName: 'Normal',   icon: '⭐', color: '#A8A77A',
                    traits: ['Versatile','Balanced','Genuine','Reliable'],
                    desc: "Deeply, powerfully, underestimated. You look ordinary until someone actually pays attention. Then they realise you're incredibly versatile and genuinely capable of almost anything. The most dangerous type on the field." },
        ice:      { id: 131, typeId: 15, name: 'Ice Type',      type: 'Ice',      typeName: 'Ice',      icon: '❄️', color: '#96D9D6',
                    traits: ['Cool','Composed','Precise','Rare'],
                    desc: "Elegant and crystalline under pressure. Cool on the outside with startling depths on the inside. You don't show your whole self to just anyone, but when you do, people discover something completely beautiful." }
      },

      questions: [
        { text: "When you feel a strong emotion, you...",
          answers: [
            { emoji:'🔥', text: "Express it immediately and loudly",             weights: { fire:3, electric:2, fighting:1 } },
            { emoji:'🌊', text: "Let it wash over you and sit with it",          weights: { water:3, ice:2, grass:1 } },
            { emoji:'🎭', text: "Process it privately — nobody needs to know",   weights: { ghost:3, psychic:2, ice:1 } },
            { emoji:'📊', text: "Analyse it before reacting",                    weights: { psychic:3, normal:2, dragon:1 } }
          ]
        },
        { text: "Your friends come to you for...",
          answers: [
            { emoji:'💡', text: "Energy and ideas — you get everyone excited",   weights: { fire:3, electric:2, fighting:1 } },
            { emoji:'🤗', text: "Listening — you make people feel heard",        weights: { water:3, grass:2, normal:1 } },
            { emoji:'🧠', text: "Advice — you actually see the whole picture",   weights: { psychic:3, dragon:2, ice:1 } },
            { emoji:'😂', text: "A good time — you make everything more fun",    weights: { electric:3, ghost:2, normal:1 } }
          ]
        },
        { text: "How do you feel about being the centre of attention?",
          answers: [
            { emoji:'🎤', text: "I love it — this is my natural habitat",        weights: { fire:3, electric:2, fighting:1 } },
            { emoji:'👀', text: "Fine with it, but I don't chase it",            weights: { dragon:3, normal:2, grass:1 } },
            { emoji:'😌', text: "I prefer blending in and observing",            weights: { ghost:3, water:2, ice:1 } },
            { emoji:'🤔', text: "I'm okay with it when it's deserved",           weights: { psychic:3, ice:2, normal:1 } }
          ]
        },
        { text: "Pick the environment you feel most alive in:",
          answers: [
            { emoji:'🌋', text: "Somewhere with heat and high stakes",           weights: { fire:3, fighting:2, dragon:1 } },
            { emoji:'🌊', text: "Near water — coastal, calm, endless",           weights: { water:3, ice:2, grass:1 } },
            { emoji:'🌃', text: "A city at night — lights, secrets, energy",     weights: { ghost:3, electric:2, psychic:1 } },
            { emoji:'🏔️', text: "High up — remote, powerful, above it all",      weights: { dragon:3, ice:2, fighting:1 } }
          ]
        },
        { text: "When faced with a hard obstacle, you...",
          answers: [
            { emoji:'💥', text: "Attack it head-on — brute force",               weights: { fighting:3, fire:2, electric:1 } },
            { emoji:'💧', text: "Flow around it — find a smarter path",          weights: { water:3, grass:2, psychic:1 } },
            { emoji:'👻', text: "Phase through it — act like it barely exists",  weights: { ghost:3, ice:2, normal:1 } },
            { emoji:'♟️', text: "Study it, then dismantle it systematically",    weights: { psychic:3, dragon:2, ice:1 } }
          ]
        },
        { text: "How much of yourself do you share with others?",
          answers: [
            { emoji:'📖', text: "Everything — I'm an open book",                 weights: { fire:3, electric:2, normal:1 } },
            { emoji:'🌊', text: "Quite a lot — I value deep connection",         weights: { water:3, grass:2, fighting:1 } },
            { emoji:'🔐', text: "Very little — most people don't get the real me",weights: { ghost:3, dragon:2, ice:1 } },
            { emoji:'🧩', text: "Only pieces — I reveal myself slowly",          weights: { psychic:3, ice:2, normal:1 } }
          ]
        },
        { text: "Your biggest strength is your...",
          answers: [
            { emoji:'🔥', text: "Passion — you go harder than anyone else",      weights: { fire:3, fighting:2, electric:1 } },
            { emoji:'🧘', text: "Patience — you can wait as long as it takes",   weights: { grass:3, water:2, ice:1 } },
            { emoji:'🔮', text: "Intuition — you just know things somehow",      weights: { psychic:3, ghost:2, dragon:1 } },
            { emoji:'🛡️', text: "Consistency — you show up every single time",   weights: { normal:3, fighting:2, grass:1 } }
          ]
        },
        { text: "Your sense of humour?",
          answers: [
            { emoji:'😂', text: "Loud and obvious — if it's funny, you show it", weights: { fire:3, electric:2, fighting:1 } },
            { emoji:'😏', text: "Dry and deadpan — nobody's sure if you're joking",weights: { ice:3, ghost:2, normal:1 } },
            { emoji:'👻', text: "Dark and weird — definitely not for everyone",  weights: { ghost:3, psychic:2, dragon:1 } },
            { emoji:'😊', text: "Warm and silly — you just want everyone happy", weights: { water:3, grass:2, normal:1 } }
          ]
        },
        { text: "Pick a word that fits you best:",
          answers: [
            { emoji:'🔥', text: "Unstoppable",                                   weights: { fire:3, fighting:3, dragon:1 } },
            { emoji:'💙', text: "Empathetic",                                    weights: { water:3, grass:3, normal:1 } },
            { emoji:'🌑', text: "Enigmatic",                                     weights: { ghost:3, psychic:2, ice:2 } },
            { emoji:'⚡', text: "Electric",                                      weights: { electric:3, fire:2, dragon:1 } }
          ]
        },
        { text: "What do you want people to feel around you?",
          answers: [
            { emoji:'🔥', text: "Inspired — like anything is possible",          weights: { fire:3, electric:2, dragon:1 } },
            { emoji:'🌿', text: "Safe — like everything's going to be okay",     weights: { grass:3, water:2, normal:1 } },
            { emoji:'🤩', text: "Alive — like they're part of something wild",   weights: { electric:3, ghost:2, fighting:1 } },
            { emoji:'🥶', text: "Intrigued — like they've only seen a fraction", weights: { ice:3, psychic:2, ghost:1 } }
          ]
        }
      ]
    },

    /* ════════════════════════════════════════════
       QUIZ 3 – Which Kanto Pokémon Are You?
    ════════════════════════════════════════════ */
    kanto: {
      id: 'kanto',
      name: 'Which Kanto Pokémon Are You?',
      label: 'KANTO QUIZ',
      subtitle: '12 results · 12 questions',
      icon: '✨',
      color: '#ee1515',
      gradient: 'linear-gradient(135deg,#ee1515 0%,#ff6b35 100%)',
      desc: 'Find your true Kanto counterpart among 12 iconic Gen 1 Pokémon.',
      showcasePokemon: [25, 6, 94, 133],  // Pikachu · Charizard · Gengar · Eevee

      pokemon: {
        pikachu:    { id: 25,  typeId: 13, name: 'Pikachu',    type: 'Electric', color: '#F7B731',
                      traits: ['Energetic','Social','Brave','Loyal'],
                      desc: "You light up every room you walk into. Spirited, quick on your feet, and fiercely loyal, people gravitate toward your electric energy. You lead with heart and aren't afraid to spark a little chaos when the moment calls for it." },
        charizard:  { id: 6,   typeId: 10, name: 'Charizard',  type: 'Fire',     color: '#E84118',
                      traits: ['Ambitious','Passionate','Independent','Fierce'],
                      desc: "You burn bright and refuse to be contained. Ambitious and fearless, you set your own rules and chase your goals with an intensity that demands respect. You've earned every win the hard way, and everyone around you knows it." },
        bulbasaur:  { id: 1,   typeId: 12, name: 'Bulbasaur',  type: 'Grass',    color: '#4CD137',
                      traits: ['Calm','Nurturing','Reliable','Patient'],
                      desc: "Steady, grounded, and quietly dependable, you're the kind of person others lean on without even realising it. You grow at your own pace, and that deep-rooted patience is your greatest strength." },
        squirtle:   { id: 7,   typeId: 11, name: 'Squirtle',   type: 'Water',    color: '#0097e6',
                      traits: ['Cool','Adaptable','Focused','Thoughtful'],
                      desc: "Cool under pressure and always thinking two steps ahead. Your calm, methodical approach means you almost always come out on top when it matters most." },
        eevee:      { id: 133, typeId: 1,  name: 'Eevee',      type: 'Normal',   color: '#8c7ae6',
                      traits: ['Curious','Versatile','Friendly','Open-minded'],
                      desc: "You contain multitudes. Curious, warm, and endlessly adaptable, you could thrive in almost any situation. Your greatest power is that you haven't decided your limits yet." },
        snorlax:    { id: 143, typeId: 1,  name: 'Snorlax',    type: 'Normal',   color: '#718093',
                      traits: ['Chill','Comforting','Patient','Content'],
                      desc: "Life is too short to stress about things you can't control. You know what you love, you protect your peace fiercely, and your presence is genuinely comforting to everyone around you." },
        gengar:     { id: 94,  typeId: 8,  name: 'Gengar',     type: 'Ghost',    color: '#8e44ad',
                      traits: ['Witty','Mischievous','Clever','Playful'],
                      desc: "A darkly brilliant sense of humour and a knack for seeing what others miss. A bit of a trickster, sure, but underneath the chaos is a genuinely sharp mind and a surprisingly big heart." },
        mewtwo:     { id: 150, typeId: 14, name: 'Mewtwo',     type: 'Psychic',  color: '#9B59B6',
                      traits: ['Analytical','Independent','Powerful','Complex'],
                      desc: "You operate on a different frequency. Intensely self-aware and endlessly analytical, you question everything and forge your own path. That rare depth sets you apart from almost everyone." },
        jigglypuff: { id: 39,  typeId: 18, name: 'Jigglypuff', type: 'Fairy',    color: '#fd79a8',
                      traits: ['Expressive','Creative','Sensitive','Bold'],
                      desc: "You have a big personality and you're not afraid to use it. Deeply creative and emotionally tuned in, you feel everything fully. When you share that with the world, people cannot look away." },
        lapras:     { id: 131, typeId: 11, name: 'Lapras',     type: 'Water',    color: '#00b3cc',
                      traits: ['Gentle','Empathetic','Peaceful','Wise'],
                      desc: "You carry others with grace and warmth. Deeply empathetic and impossibly kind, you have a rare ability to make people feel truly seen. Still waters run deep, and yours run the deepest." },
        alakazam:   { id: 65,  typeId: 14, name: 'Alakazam',   type: 'Psychic',  color: '#e1b12c',
                      traits: ['Intellectual','Strategic','Precise','Focused'],
                      desc: "Your mind moves faster than most people can follow. A natural strategist, you approach every problem with logic and precision, and you usually see the solution before anyone else understood the question." },
        machamp:    { id: 68,  typeId: 2,  name: 'Machamp',    type: 'Fighting', color: '#c0392b',
                      traits: ['Determined','Hardworking','Strong','Direct'],
                      desc: "You don't make excuses, you make progress. Relentlessly hardworking and refreshingly straightforward, you tackle every challenge head-on. People can always count on you to show up." }
      },

      questions: [
        { text: "What's your ideal weekend?",
          answers: [
            { emoji:'🎉', text: "Big hangout — the more the merrier",            weights: { pikachu:3, jigglypuff:2, eevee:1 } },
            { emoji:'🏋️', text: "Pushing hard toward a personal goal",           weights: { charizard:3, machamp:2, pikachu:1 } },
            { emoji:'🛋️', text: "Recharging at home in total comfort",           weights: { snorlax:3, bulbasaur:2, lapras:1 } },
            { emoji:'🗺️', text: "Exploring somewhere new, alone",                weights: { mewtwo:3, alakazam:2, eevee:1 } }
          ]
        },
        { text: "How do you handle conflict?",
          answers: [
            { emoji:'⚡', text: "Face it head-on — say exactly what I think",    weights: { charizard:3, pikachu:2, machamp:1 } },
            { emoji:'🤝', text: "Find a compromise that works for everyone",      weights: { bulbasaur:3, lapras:2, eevee:1 } },
            { emoji:'🧠', text: "Outsmart it with a clever strategy",             weights: { alakazam:3, gengar:2, mewtwo:1 } },
            { emoji:'😄', text: "Defuse it with humour before it escalates",      weights: { gengar:3, pikachu:2, jigglypuff:1 } }
          ]
        },
        { text: "Pick your ideal home vibe:",
          answers: [
            { emoji:'☕', text: "Cozy — warm lighting, snacks on every surface", weights: { snorlax:3, bulbasaur:2, lapras:1 } },
            { emoji:'🔬', text: "Sleek and minimal — everything has a purpose",   weights: { mewtwo:3, alakazam:2, squirtle:1 } },
            { emoji:'🎈', text: "Lively — always buzzing with people",            weights: { pikachu:3, jigglypuff:2, eevee:1 } },
            { emoji:'🌑', text: "Hidden away — mysterious and all mine",          weights: { gengar:3, mewtwo:2, alakazam:1 } }
          ]
        },
        { text: "Your squad has a big project. Your role?",
          answers: [
            { emoji:'📣', text: "Hype person — keeping morale sky-high",         weights: { pikachu:3, charizard:2, machamp:1 } },
            { emoji:'💡', text: "Idea factory — creativity is my whole thing",   weights: { jigglypuff:3, gengar:2, eevee:1 } },
            { emoji:'📊', text: "Researcher — I need data before deciding",      weights: { alakazam:3, squirtle:2, mewtwo:1 } },
            { emoji:'💙', text: "The glue — no one gets left behind",            weights: { lapras:3, bulbasaur:2, eevee:1 } }
          ]
        },
        { text: "A friend is in trouble. You...",
          answers: [
            { emoji:'🚀', text: "Rush in — figure out the plan on the way",      weights: { charizard:3, pikachu:2, machamp:1 } },
            { emoji:'🔍', text: "Think it through carefully before acting",      weights: { alakazam:3, squirtle:2, mewtwo:1 } },
            { emoji:'📞', text: "Rally everyone — strength in numbers",          weights: { pikachu:3, eevee:2, lapras:1 } },
            { emoji:'🎭', text: "Find a clever angle nobody else considered",    weights: { gengar:3, mewtwo:2, alakazam:1 } }
          ]
        },
        { text: "How do people usually describe you?",
          answers: [
            { emoji:'🌟', text: "The life of the party",                         weights: { pikachu:3, jigglypuff:2, gengar:1 } },
            { emoji:'🪨', text: "The reliable one everyone counts on",           weights: { bulbasaur:3, squirtle:2, machamp:1 } },
            { emoji:'🌑', text: "The mysterious one — hard to read",             weights: { mewtwo:3, gengar:2, alakazam:1 } },
            { emoji:'🎲', text: "The wildcard — anything could happen",          weights: { charizard:3, eevee:2, gengar:1 } }
          ]
        },
        { text: "Your relationship with rules?",
          answers: [
            { emoji:'📋', text: "They exist for a reason — I respect them",      weights: { squirtle:3, bulbasaur:2, machamp:1 } },
            { emoji:'🎨', text: "Rules box in creativity — I bend them freely",  weights: { charizard:3, jigglypuff:2, gengar:1 } },
            { emoji:'🔧', text: "Rules are tools — useful when they serve me",   weights: { alakazam:3, mewtwo:2, eevee:1 } },
            { emoji:'🌪️', text: "What rules? I chart my own course",             weights: { mewtwo:3, charizard:2, gengar:1 } }
          ]
        },
        { text: "What do you actually spend money on?",
          answers: [
            { emoji:'✈️', text: "Experiences — concerts, trips, adventures",     weights: { pikachu:3, charizard:2, eevee:1 } },
            { emoji:'🍕', text: "Food — you know exactly what you love",          weights: { snorlax:3, machamp:2, bulbasaur:1 } },
            { emoji:'📚', text: "Books, gadgets, or courses to level up",         weights: { alakazam:3, mewtwo:2, squirtle:1 } },
            { emoji:'🎵', text: "Art, music, and creative projects",              weights: { jigglypuff:3, gengar:2, lapras:1 } }
          ]
        },
        { text: "Pick an element that calls to you:",
          answers: [
            { emoji:'🔥', text: "Fire — passion, power, transformation",         weights: { charizard:3, pikachu:2, machamp:1 } },
            { emoji:'🌊', text: "Water — calm, flow, depth",                     weights: { squirtle:3, lapras:2, snorlax:1 } },
            { emoji:'🌿', text: "Earth — stability, growth, patience",           weights: { bulbasaur:3, snorlax:2, lapras:1 } },
            { emoji:'⚡', text: "Lightning — raw energy and a sharp mind",       weights: { pikachu:3, alakazam:2, mewtwo:1 } }
          ]
        },
        { text: "Your biggest fear is...",
          answers: [
            { emoji:'💤', text: "Wasting potential by standing still",           weights: { charizard:3, machamp:2, pikachu:1 } },
            { emoji:'💔', text: "Being misunderstood or left out",               weights: { jigglypuff:3, eevee:2, lapras:1 } },
            { emoji:'🎛️', text: "Losing control of a situation",                 weights: { mewtwo:3, alakazam:2, squirtle:1 } },
            { emoji:'😴', text: "Total boredom with zero surprises",             weights: { gengar:3, pikachu:2, eevee:1 } }
          ]
        },
        { text: "What energy do you bring?",
          answers: [
            { emoji:'⚡', text: "High-voltage — always moving, always doing",    weights: { pikachu:3, charizard:2, machamp:1 } },
            { emoji:'🌊', text: "Steady and consistent — never burned out",      weights: { bulbasaur:3, squirtle:2, lapras:1 } },
            { emoji:'😌', text: "Totally chill — why rush anything?",            weights: { snorlax:3, lapras:2, eevee:1 } },
            { emoji:'🌀', text: "Intense bursts followed by deep rest",          weights: { gengar:3, mewtwo:2, alakazam:1 } }
          ]
        },
        { text: "One last move — what's it gonna be?",
          answers: [
            { emoji:'💥', text: "A massive, flashy signature attack",            weights: { charizard:3, pikachu:2, machamp:1 } },
            { emoji:'✨', text: "A gentle move that heals or protects",          weights: { lapras:3, bulbasaur:2, jigglypuff:1 } },
            { emoji:'🎯', text: "A calculated, perfectly-timed strike",          weights: { alakazam:3, squirtle:2, mewtwo:1 } },
            { emoji:'👻', text: "A sneaky trick nobody saw coming",              weights: { gengar:3, eevee:2, mewtwo:1 } }
          ]
        }
      ]
    }
  }
};
