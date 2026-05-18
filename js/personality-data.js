/* ============================================================
   personality-data.js — "Which Pokémon Are You?" quiz data
   ============================================================ */
window.PERSONALITY_DATA = {

  /* ── Result Pokémon definitions ───────────────────────────── */
  pokemon: {
    pikachu:    { id: 25,  name: 'Pikachu',    type: 'Electric', color: '#F7B731', bg: '#FFF9E6',
                  traits: ['Energetic', 'Social', 'Brave', 'Loyal'],
                  desc: "You light up every room you walk into. Spirited, quick on your feet, and fiercely loyal — people gravitate toward your electric energy. You lead with heart and aren't afraid to spark a little chaos when the moment calls for it." },

    charizard:  { id: 6,   name: 'Charizard',  type: 'Fire', color: '#E84118', bg: '#FFF1EE',
                  traits: ['Ambitious', 'Passionate', 'Independent', 'Fierce'],
                  desc: "You burn bright and refuse to be contained. Ambitious and fearless, you set your own rules and chase your goals with an intensity that demands respect. You've earned every win the hard way — and everyone around you knows it." },

    bulbasaur:  { id: 1,   name: 'Bulbasaur',  type: 'Grass', color: '#4CD137', bg: '#F0FFF2',
                  traits: ['Calm', 'Nurturing', 'Reliable', 'Patient'],
                  desc: "Steady, grounded, and quietly dependable — you're the kind of person others lean on without even realizing it. You grow at your own pace, you don't need the spotlight, and that deep-rooted patience is your greatest strength." },

    squirtle:   { id: 7,   name: 'Squirtle',   type: 'Water', color: '#0097e6', bg: '#EEF8FF',
                  traits: ['Cool', 'Adaptable', 'Focused', 'Thoughtful'],
                  desc: "Cool under pressure and always thinking two steps ahead. You're not the flashiest person in the room, but your calm, methodical approach means you almost always come out on top when it matters most." },

    eevee:      { id: 133, name: 'Eevee',       type: 'Normal', color: '#8c7ae6', bg: '#F5F3FF',
                  traits: ['Curious', 'Versatile', 'Friendly', 'Open-minded'],
                  desc: "You contain multitudes. Curious, warm, and endlessly adaptable — you could thrive in almost any situation. Your greatest power is that you haven't decided your limits yet. Every path is still wide open." },

    snorlax:    { id: 143, name: 'Snorlax',     type: 'Normal', color: '#718093', bg: '#F5F6FA',
                  traits: ['Chill', 'Comforting', 'Patient', 'Content'],
                  desc: "Life is too short to stress about things you can't control. You know what you love, you protect your peace fiercely, and your presence is genuinely comforting to everyone around you. Unmovable when it matters — unstoppable when you want to be." },

    gengar:     { id: 94,  name: 'Gengar',      type: 'Ghost', color: '#8e44ad', bg: '#F9F0FF',
                  traits: ['Witty', 'Mischievous', 'Clever', 'Playful'],
                  desc: "You've got a darkly brilliant sense of humor and a knack for seeing what others miss. A bit of a trickster, sure — but underneath the chaos is a genuinely sharp mind and a surprisingly big heart that not everyone gets to see." },

    mewtwo:     { id: 150, name: 'Mewtwo',      type: 'Psychic', color: '#9B59B6', bg: '#F8F0FF',
                  traits: ['Analytical', 'Independent', 'Powerful', 'Complex'],
                  desc: "You operate on a different frequency. Intensely self-aware and endlessly analytical, you rarely follow the crowd — you question everything, forge your own path, and that rare depth sets you apart from almost everyone around you." },

    jigglypuff: { id: 39,  name: 'Jigglypuff',  type: 'Fairy', color: '#fd79a8', bg: '#FFF0F6',
                  traits: ['Expressive', 'Creative', 'Sensitive', 'Bold'],
                  desc: "You have a big personality and you're absolutely not afraid to use it. Deeply creative and emotionally tuned in, you feel everything fully — and when you share that with the world, people genuinely cannot look away." },

    lapras:     { id: 131, name: 'Lapras',       type: 'Water', color: '#00b3cc', bg: '#EDFCFF',
                  traits: ['Gentle', 'Empathetic', 'Peaceful', 'Wise'],
                  desc: "You carry others with grace and warmth. Deeply empathetic and impossibly kind, you have a rare ability to make people feel truly seen. Still waters run deep — and yours run the deepest of all." },

    alakazam:   { id: 65,  name: 'Alakazam',    type: 'Psychic', color: '#e1b12c', bg: '#FFFBEE',
                  traits: ['Intellectual', 'Strategic', 'Precise', 'Focused'],
                  desc: "Your mind moves faster than most people can follow. A natural strategist, you approach every problem with logic and precision — and you usually see the solution long before anyone else even understood the question." },

    machamp:    { id: 68,  name: 'Machamp',     type: 'Fighting', color: '#c0392b', bg: '#FFF0EE',
                  traits: ['Determined', 'Hardworking', 'Strong', 'Direct'],
                  desc: "You don't make excuses — you make progress. Relentlessly hardworking and refreshingly straightforward, you tackle every challenge head-on. People can always count on you to show up and do what needs to be done." }
  },

  /* ── 12 personality questions ─────────────────────────────── */
  questions: [
    {
      text: "What's your ideal weekend?",
      answers: [
        { text: "🎉 Big hangout — the more the merrier",        weights: { pikachu: 3, jigglypuff: 2, eevee: 1 } },
        { text: "🏋️ Pushing hard toward a personal goal",       weights: { charizard: 3, machamp: 2, pikachu: 1 } },
        { text: "🛋️ Recharging at home in total comfort",       weights: { snorlax: 3, bulbasaur: 2, lapras: 1 } },
        { text: "🗺️ Exploring somewhere new, alone",            weights: { mewtwo: 3, alakazam: 2, eevee: 1 } }
      ]
    },
    {
      text: "How do you handle conflict?",
      answers: [
        { text: "⚡ Face it head-on and say exactly what I think", weights: { charizard: 3, pikachu: 2, machamp: 1 } },
        { text: "🤝 Find a compromise that works for everyone",    weights: { bulbasaur: 3, lapras: 2, eevee: 1 } },
        { text: "🧠 Outsmart it with a clever strategy",          weights: { alakazam: 3, gengar: 2, mewtwo: 1 } },
        { text: "😄 Defuse it with humor before it escalates",    weights: { gengar: 3, pikachu: 2, jigglypuff: 1 } }
      ]
    },
    {
      text: "Pick your ideal home vibe:",
      answers: [
        { text: "☕ Cozy — warm lighting, snacks on every surface", weights: { snorlax: 3, bulbasaur: 2, lapras: 1 } },
        { text: "🔬 Sleek and minimal — everything has a purpose",  weights: { mewtwo: 3, alakazam: 2, squirtle: 1 } },
        { text: "🎈 Lively — always buzzing with people",           weights: { pikachu: 3, jigglypuff: 2, eevee: 1 } },
        { text: "🌑 Hidden away — mysterious and all mine",         weights: { gengar: 3, mewtwo: 2, alakazam: 1 } }
      ]
    },
    {
      text: "Your squad has a big group project. Your role?",
      answers: [
        { text: "📣 Hype person — keeping morale sky-high",         weights: { pikachu: 3, charizard: 2, machamp: 1 } },
        { text: "💡 Idea factory — creativity is my whole thing",   weights: { jigglypuff: 3, gengar: 2, eevee: 1 } },
        { text: "📊 The researcher — I need data before deciding",  weights: { alakazam: 3, squirtle: 2, mewtwo: 1 } },
        { text: "💙 The glue — no one gets left behind on my watch",weights: { lapras: 3, bulbasaur: 2, eevee: 1 } }
      ]
    },
    {
      text: "A friend is in trouble. You...",
      answers: [
        { text: "🚀 Rush in immediately — plan on the way there",   weights: { charizard: 3, pikachu: 2, machamp: 1 } },
        { text: "🔍 Think it through carefully before acting",      weights: { alakazam: 3, squirtle: 2, mewtwo: 1 } },
        { text: "📞 Rally everyone — strength in numbers",          weights: { pikachu: 3, eevee: 2, lapras: 1 } },
        { text: "🎭 Find a clever angle nobody else considered",     weights: { gengar: 3, mewtwo: 2, alakazam: 1 } }
      ]
    },
    {
      text: "How do people usually describe you?",
      answers: [
        { text: "🌟 The life of the party",                         weights: { pikachu: 3, jigglypuff: 2, gengar: 1 } },
        { text: "🪨 The reliable one everyone counts on",           weights: { bulbasaur: 3, squirtle: 2, machamp: 1 } },
        { text: "🌑 The mysterious one — hard to read",             weights: { mewtwo: 3, gengar: 2, alakazam: 1 } },
        { text: "🎲 The wildcard — anything could happen",          weights: { charizard: 3, eevee: 2, gengar: 1 } }
      ]
    },
    {
      text: "Your relationship with rules?",
      answers: [
        { text: "📋 They exist for a reason — I respect them",      weights: { squirtle: 3, bulbasaur: 2, machamp: 1 } },
        { text: "🎨 They box in creativity — I bend them freely",   weights: { charizard: 3, jigglypuff: 2, gengar: 1 } },
        { text: "🔧 Rules are tools — I use them when they serve me",weights: { alakazam: 3, mewtwo: 2, eevee: 1 } },
        { text: "🌪️ What rules? I chart my own course",             weights: { mewtwo: 3, charizard: 2, gengar: 1 } }
      ]
    },
    {
      text: "What do you actually spend money on?",
      answers: [
        { text: "✈️ Experiences — concerts, trips, adventures",     weights: { pikachu: 3, charizard: 2, eevee: 1 } },
        { text: "🍕 Food — you know exactly what you love",          weights: { snorlax: 3, machamp: 2, bulbasaur: 1 } },
        { text: "📚 Books, gadgets, or courses to level up",         weights: { alakazam: 3, mewtwo: 2, squirtle: 1 } },
        { text: "🎵 Art, music, and creative projects",              weights: { jigglypuff: 3, gengar: 2, lapras: 1 } }
      ]
    },
    {
      text: "Pick an element that calls to you:",
      answers: [
        { text: "🔥 Fire — passion, power, transformation",          weights: { charizard: 3, pikachu: 2, machamp: 1 } },
        { text: "🌊 Water — calm, flow, depth",                      weights: { squirtle: 3, lapras: 2, snorlax: 1 } },
        { text: "🌿 Earth — stability, growth, patience",            weights: { bulbasaur: 3, snorlax: 2, lapras: 1 } },
        { text: "⚡ Lightning — raw energy and a sharp mind",        weights: { pikachu: 3, alakazam: 2, mewtwo: 1 } }
      ]
    },
    {
      text: "Your biggest fear is...",
      answers: [
        { text: "💤 Wasting my potential by standing still",         weights: { charizard: 3, machamp: 2, pikachu: 1 } },
        { text: "💔 Being misunderstood or left out",                weights: { jigglypuff: 3, eevee: 2, lapras: 1 } },
        { text: "🎛️ Losing control of a situation",                  weights: { mewtwo: 3, alakazam: 2, squirtle: 1 } },
        { text: "😴 Total boredom with zero surprises",              weights: { gengar: 3, pikachu: 2, eevee: 1 } }
      ]
    },
    {
      text: "What kind of energy do you bring?",
      answers: [
        { text: "⚡ High-voltage — always moving, always doing",     weights: { pikachu: 3, charizard: 2, machamp: 1 } },
        { text: "🌊 Steady and consistent — I never burn out",       weights: { bulbasaur: 3, squirtle: 2, lapras: 1 } },
        { text: "😌 Totally chill — why rush anything?",             weights: { snorlax: 3, lapras: 2, eevee: 1 } },
        { text: "🌀 Intense bursts, then deep rest",                 weights: { gengar: 3, mewtwo: 2, alakazam: 1 } }
      ]
    },
    {
      text: "One last move — what's it gonna be?",
      answers: [
        { text: "💥 A massive, flashy signature attack",             weights: { charizard: 3, pikachu: 2, machamp: 1 } },
        { text: "✨ A gentle move that heals or protects",           weights: { lapras: 3, bulbasaur: 2, jigglypuff: 1 } },
        { text: "🎯 A calculated, perfectly-timed precision strike", weights: { alakazam: 3, squirtle: 2, mewtwo: 1 } },
        { text: "👻 A sneaky trick nobody saw coming",               weights: { gengar: 3, eevee: 2, mewtwo: 1 } }
      ]
    }
  ]
};
