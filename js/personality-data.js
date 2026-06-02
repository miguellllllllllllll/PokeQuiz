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
      subtitle: '27 results · 20 questions',
      icon: '🌿',
      color: '#00b894',
      gradient: 'linear-gradient(135deg,#00b894 0%,#00cec9 100%)',
      desc: 'Grass, Fire, or Water? Find your Gen 1–9 starter match.',
      showcasePokemon: [4, 1, 7],   // Charmander · Bulbasaur · Squirtle

      pokemon: {
        // ── Gen 1 ──────────────────────────────────────────────────────────
        bulbasaur:   { id: 1,   typeId: 12, name: 'Bulbasaur',   type: 'Grass', color: '#00b894',
                       traits: ['Reliable','Calm','Nurturing','Steady'],
                       signatureMove: 'Leech Seed', idealPartner: 'Squirtle',
                       desc: "The underrated choice that always delivers. Your steady, patient presence is what keeps everything together, no spotlight needed. People who pick you never regret it." },
        charmander:  { id: 4,   typeId: 10, name: 'Charmander',  type: 'Fire',  color: '#e17055',
                       traits: ['Passionate','Driven','Bold','Loyal'],
                       signatureMove: 'Flamethrower', idealPartner: 'Bulbasaur',
                       desc: "You start small but burn hotter than anyone expected. Driven, passionate, and fiercely loyal to the people you care about. Once you commit to something, absolutely nothing can stop you." },
        squirtle:    { id: 7,   typeId: 11, name: 'Squirtle',    type: 'Water', color: '#0984e3',
                       traits: ['Cool','Chill','Dependable','Smart'],
                       signatureMove: 'Hydro Pump', idealPartner: 'Charmander',
                       desc: "Effortlessly cool, dependable, and always in control. You've got a calm confidence that people find magnetic, and when it's time to perform, you never let anyone down." },
        // ── Gen 2 ──────────────────────────────────────────────────────────
        chikorita:   { id: 152, typeId: 12, name: 'Chikorita',   type: 'Grass', color: '#00b894',
                       traits: ['Gentle','Optimistic','Loyal','Sweet'],
                       signatureMove: 'Synthesis', idealPartner: 'Cyndaquil',
                       desc: "You lead with kindness and a stubborn, contagious optimism. Some might underestimate you at first, but you always find a way to prove them wrong with pure heart and persistence." },
        cyndaquil:   { id: 155, typeId: 10, name: 'Cyndaquil',   type: 'Fire',  color: '#fdcb6e',
                       traits: ['Shy','Sincere','Hardworking','Warm'],
                       signatureMove: 'Eruption', idealPartner: 'Chikorita',
                       desc: "Quiet on the outside, burning on the inside. You take a little time to warm up to new people, but once you do you're one of the most genuine and dedicated friends anyone could ask for." },
        totodile:    { id: 158, typeId: 11, name: 'Totodile',    type: 'Water', color: '#74b9ff',
                       traits: ['Energetic','Fearless','Playful','Fun'],
                       signatureMove: 'Aqua Jet', idealPartner: 'Cyndaquil',
                       desc: "Pure unfiltered enthusiasm, every single day. You dive into everything head-first with a massive grin on your face, and somehow your ridiculous confidence actually works out more often than not." },
        // ── Gen 3 ──────────────────────────────────────────────────────────
        treecko:     { id: 252, typeId: 12, name: 'Treecko',     type: 'Grass', color: '#00b894',
                       traits: ['Cool','Independent','Composed','Sharp'],
                       signatureMove: 'Leaf Blade', idealPartner: 'Mudkip',
                       desc: "Impossibly cool under pressure and too proud to show it. You face every challenge with a stone-cold expression and a sharp mind, and somehow that makes people trust you completely." },
        torchic:     { id: 255, typeId: 10, name: 'Torchic',     type: 'Fire',  color: '#e84393',
                       traits: ['Spirited','Affectionate','Fierce','Confident'],
                       signatureMove: 'Blaze Kick', idealPartner: 'Treecko',
                       desc: "Small but absolutely unstoppable. Endlessly spirited and surprisingly fierce, you throw everything you have into everything you do. The people who love you are never surprised when you win." },
        mudkip:      { id: 258, typeId: 11, name: 'Mudkip',      type: 'Water', color: '#6c5ce7',
                       traits: ['Laid-back','Dependable','Quietly Strong','Genuine'],
                       signatureMove: 'Muddy Water', idealPartner: 'Torchic',
                       desc: "Completely unassuming, wildly effective. You don't make a fuss, you don't need the attention. You just show up, do the work, and somehow end up being the most powerful one in the room." },
        // ── Gen 4 ──────────────────────────────────────────────────────────
        turtwig:     { id: 387, typeId: 12, name: 'Turtwig',     type: 'Grass', color: '#00cec9',
                       traits: ['Patient','Earnest','Grounded','Dependable'],
                       signatureMove: 'Wood Hammer', idealPartner: 'Piplup',
                       desc: "You take your time and do things right. There's no rushing you and no fooling you. You've built your life on genuine effort and it shows in everything you do, even when no one's watching." },
        chimchar:    { id: 390, typeId: 10, name: 'Chimchar',    type: 'Fire',  color: '#e17055',
                       traits: ['Playful','Scrappy','Resilient','Spirited'],
                       signatureMove: 'Flare Blitz', idealPartner: 'Turtwig',
                       desc: "You get knocked down and come back grinning. Scrappy, adaptable, and absolutely impossible to keep down — your energy is infectious and your bounce-back game is unmatched." },
        piplup:      { id: 393, typeId: 11, name: 'Piplup',      type: 'Water', color: '#0652DD',
                       traits: ['Proud','Independent','Dignified','Determined'],
                       signatureMove: 'Hydro Pump', idealPartner: 'Chimchar',
                       desc: "You carry yourself with a natural dignity that can read as aloofness — but underneath is real conviction and iron will. You don't ask for help easily, and you don't need to." },
        // ── Gen 5 ──────────────────────────────────────────────────────────
        snivy:       { id: 495, typeId: 12, name: 'Snivy',       type: 'Grass', color: '#55efc4',
                       traits: ['Composed','Sharp','Elegant','Confident'],
                       signatureMove: 'Leaf Storm', idealPartner: 'Oshawott',
                       desc: "You don't raise your voice or make a fuss. You're already the most capable person in the room and everyone quietly knows it. Cool, effortlessly stylish, and with a wit that cuts clean through the noise." },
        tepig:       { id: 498, typeId: 10, name: 'Tepig',       type: 'Fire',  color: '#fd9644',
                       traits: ['Cheerful','Resilient','Warmhearted','Sunny'],
                       signatureMove: 'Heat Crash', idealPartner: 'Snivy',
                       desc: "You're genuinely warm and impossible not to like. You bounce back fast when things go wrong, and your optimism isn't naïve — it's real and it pulls people through." },
        oshawott:    { id: 501, typeId: 11, name: 'Oshawott',    type: 'Water', color: '#45aaf2',
                       traits: ['Earnest','Courageous','Sincere','Endearing'],
                       signatureMove: 'Razor Shell', idealPartner: 'Tepig',
                       desc: "You try harder than almost anyone, and it shows. You're not always the most graceful, but your sincerity and courage are unmistakable. People underestimate you right until you prove them spectacularly wrong." },
        // ── Gen 6 ──────────────────────────────────────────────────────────
        chespin:     { id: 650, typeId: 12, name: 'Chespin',     type: 'Grass', color: '#78e08f',
                       traits: ['Carefree','Enthusiastic','Reckless','Warm'],
                       signatureMove: 'Spiky Shield', idealPartner: 'Froakie',
                       desc: "You dive into everything headfirst with zero hesitation and maximum energy. Slightly reckless? Sure. But your fearless warmth makes you the kind of person who makes everything more fun just by showing up." },
        fennekin:    { id: 653, typeId: 10, name: 'Fennekin',    type: 'Fire',  color: '#f7b731',
                       traits: ['Ambitious','Refined','Clever','Discerning'],
                       signatureMove: 'Mystical Fire', idealPartner: 'Chespin',
                       desc: "You have high standards — for yourself and for everything you invest in. Quietly ambitious and sharper than most, you prefer depth over breadth in everything from ideas to people." },
        froakie:     { id: 656, typeId: 11, name: 'Froakie',     type: 'Water', color: '#74b9ff',
                       traits: ['Focused','Analytical','Reserved','Capable'],
                       signatureMove: 'Water Shuriken', idealPartner: 'Fennekin',
                       desc: "You're the quiet one who's actually the most capable in the room. Understated, sharp, and decisive when it counts — you don't announce yourself. Your results do." },
        // ── Gen 7 ──────────────────────────────────────────────────────────
        rowlet:      { id: 722, typeId: 12, name: 'Rowlet',      type: 'Grass', color: '#6ab04c',
                       traits: ['Calm','Adaptable','Thoughtful','Unhurried'],
                       signatureMove: 'Leaf Blade', idealPartner: 'Litten',
                       desc: "You move at your own pace and it's never a problem. Adaptable without being a pushover, calm without being boring — you have an effortless quality that makes difficult things look easy." },
        litten:      { id: 725, typeId: 10, name: 'Litten',      type: 'Fire',  color: '#d63031',
                       traits: ['Independent','Stoic','Intense','Loyal'],
                       signatureMove: 'Fire Fang', idealPartner: 'Rowlet',
                       desc: "You're a closed book to most people, and that's exactly how you like it. Fiercely loyal to the few you let in, and completely unbothered by the approval of everyone else. That quiet intensity is magnetic." },
        popplio:     { id: 728, typeId: 11, name: 'Popplio',     type: 'Water', color: '#a29bfe',
                       traits: ['Hardworking','Expressive','Earnest','Resilient'],
                       signatureMove: 'Sparkling Aria', idealPartner: 'Rowlet',
                       desc: "You put in the work even when no one's watching, and you wear your heart completely on your sleeve. You get underestimated a lot — which just gives you more material to work with." },
        // ── Gen 8 ──────────────────────────────────────────────────────────
        grookey:     { id: 810, typeId: 12, name: 'Grookey',     type: 'Grass', color: '#26de81',
                       traits: ['Mischievous','Curious','Spontaneous','Energetic'],
                       signatureMove: 'Drum Beating', idealPartner: 'Scorbunny',
                       desc: "You're the one who gets the whole group doing something completely unplanned and everyone ends up having the best time. Curious about everything, impossible to contain, and just chaotic enough to be genuinely exciting." },
        scorbunny:   { id: 813, typeId: 10, name: 'Scorbunny',   type: 'Fire',  color: '#ff7675',
                       traits: ['Athletic','Spirited','Determined','Bright'],
                       signatureMove: 'Pyro Ball', idealPartner: 'Sobble',
                       desc: "You bring full energy everywhere you go. Competitive, driven, and genuinely enthusiastic — you're at your best when there's something to run toward, and you make the people around you better just by being there." },
        sobble:      { id: 816, typeId: 11, name: 'Sobble',      type: 'Water', color: '#6c5ce7',
                       traits: ['Sensitive','Empathetic','Gentle','Sincere'],
                       signatureMove: 'Snipe Shot', idealPartner: 'Grookey',
                       desc: "You feel everything more deeply than most, and that emotional intelligence is a genuine gift. You notice what others miss, care in ways people don't bother with, and the right people see you and think: finally, someone who actually gets it." },
        // ── Gen 9 ──────────────────────────────────────────────────────────
        sprigatito:  { id: 906, typeId: 12, name: 'Sprigatito',  type: 'Grass', color: '#badc58',
                       traits: ['Charming','Carefree','Playful','Magnetic'],
                       signatureMove: 'Magical Leaf', idealPartner: 'Quaxly',
                       desc: "You have a natural magnetism you barely even try for. Effortlessly charming, a little playful, and completely at ease in any room — people want to be around you without fully understanding why. You know exactly what you're doing." },
        fuecoco:     { id: 909, typeId: 10, name: 'Fuecoco',     type: 'Fire',  color: '#ff6348',
                       traits: ['Relaxed','Content','Cheerful','Easygoing'],
                       signatureMove: 'Flamethrower', idealPartner: 'Sprigatito',
                       desc: "You don't stress what you can't control, and you're genuinely fine with that. You know how to enjoy things fully in the moment, and that rare contentment is something people spend their whole lives chasing." },
        quaxly:      { id: 912, typeId: 11, name: 'Quaxly',      type: 'Water', color: '#0984e3',
                       traits: ['Diligent','Principled','Meticulous','Stubborn'],
                       signatureMove: 'Aqua Step', idealPartner: 'Fuecoco',
                       desc: "You have standards and you keep them. You take quiet pride in doing things properly, and while that can make you seem inflexible, it's actually just respect — for the work, for yourself, for what things are supposed to be." }
      },

      questions: [
        // Q1 ── Energy level: calm vs high-energy
        { text: "It's the start of a new day. How do you feel?",
          answers: [
            { emoji:'☀️', text: "Ready to go — I'm already thinking about what to tackle first",
              weights: { charmander:3, scorbunny:2, totodile:2, torchic:1, tepig:1, chimchar:1, sprigatito:1 } },
            { emoji:'🌿', text: "Peaceful and present — no rush, the day will unfold how it should",
              weights: { rowlet:3, fuecoco:2, bulbasaur:2, turtwig:1, mudkip:1, chikorita:1, cyndaquil:1 } },
            { emoji:'😤', text: "Quietly focused — I have a plan and I'm already moving on it",
              weights: { snivy:3, froakie:2, treecko:2, quaxly:1, piplup:1, fennekin:1 } },
            { emoji:'💥', text: "Hyped and a little unpredictable — let's see where it goes",
              weights: { grookey:3, chespin:2, litten:2, oshawott:1, popplio:1, sobble:1, squirtle:1 } }
          ]
        },
        // Q2 ── Social style: outgoing vs reserved vs selective vs confident
        { text: "You're at a party where you only know one person. You...",
          answers: [
            { emoji:'🎉', text: "Talk to everyone — you genuinely love meeting new people",
              weights: { totodile:3, sprigatito:2, chimchar:2, grookey:1, chespin:1, torchic:1, tepig:1 } },
            { emoji:'🤝', text: "Stick close to your friend but gradually open up",
              weights: { cyndaquil:3, sobble:2, popplio:2, oshawott:1, chikorita:1, bulbasaur:1, turtwig:1 } },
            { emoji:'👁️', text: "Observe first, then engage selectively with interesting people",
              weights: { litten:3, froakie:2, treecko:2, snivy:1, fennekin:1, quaxly:1, rowlet:1 } },
            { emoji:'😎', text: "Walk in like you own the place — you feel comfortable anywhere",
              weights: { squirtle:3, piplup:2, charmander:2, scorbunny:1, mudkip:1, fuecoco:1 } }
          ]
        },
        // Q3 ── Pride vs humility
        { text: "You just did something genuinely impressive. You...",
          answers: [
            { emoji:'🏆', text: "Own it — you worked hard for this and you're proud of it",
              weights: { piplup:3, torchic:2, snivy:2, charmander:1, treecko:1, fennekin:1, scorbunny:1 } },
            { emoji:'🙏', text: "Thank the people who helped — it was truly a team effort",
              weights: { bulbasaur:3, chikorita:2, turtwig:2, oshawott:1, popplio:1, tepig:1, cyndaquil:1 } },
            { emoji:'😏', text: "Move on quietly — your results speak for themselves",
              weights: { mudkip:3, froakie:2, litten:2, quaxly:1, rowlet:1, squirtle:1, sobble:1 } },
            { emoji:'🎊', text: "Celebrate loudly and drag everyone into the fun with you",
              weights: { chimchar:3, totodile:2, grookey:2, chespin:1, sprigatito:1, fuecoco:1 } }
          ]
        },
        // Q4 ── How they handle failure
        { text: "You put real effort into something and it completely falls apart. You...",
          answers: [
            { emoji:'🔥', text: "Get frustrated for a moment, then channel it into going harder",
              weights: { torchic:3, charmander:2, scorbunny:2, tepig:1, litten:1, grookey:1, chimchar:1 } },
            { emoji:'🌱', text: "Regroup calmly, find what went wrong, and try with a better plan",
              weights: { turtwig:3, bulbasaur:2, quaxly:2, snivy:1, fennekin:1, rowlet:1, piplup:1 } },
            { emoji:'🤍', text: "Let yourself feel it, then talk to someone you trust",
              weights: { sobble:3, cyndaquil:2, chikorita:2, popplio:1, oshawott:1, squirtle:1, froakie:1 } },
            { emoji:'😂', text: "Laugh it off — you've bounced back from worse and you will again",
              weights: { chespin:3, totodile:2, treecko:2, mudkip:1, fuecoco:1, sprigatito:1 } }
          ]
        },
        // Q5 ── Chaos vs order
        { text: "Your ideal environment to work or create in:",
          answers: [
            { emoji:'📐', text: "Perfectly organized — everything in its place, nothing wasted",
              weights: { quaxly:3, fennekin:2, froakie:2, piplup:1, snivy:1, charmander:1, turtwig:1 } },
            { emoji:'🌿', text: "Calm and minimal — just what I need, nothing extra",
              weights: { chikorita:3, bulbasaur:2, cyndaquil:2, rowlet:1, fuecoco:1, sobble:1, litten:1 } },
            { emoji:'🌀', text: "Controlled chaos — looks messy but I know exactly where everything is",
              weights: { mudkip:3, grookey:2, chespin:2, chimchar:1, totodile:1, torchic:1, popplio:1 } },
            { emoji:'🔁', text: "Flexible — I adapt to whatever the situation calls for",
              weights: { sprigatito:3, squirtle:2, oshawott:2, tepig:1, treecko:1, scorbunny:1 } }
          ]
        },
        // Q6 ── Emotional openness vs closed
        { text: "When something is bothering you, you typically...",
          answers: [
            { emoji:'💬', text: "Open up fairly quickly — you find that sharing helps",
              weights: { popplio:3, chikorita:2, sobble:2, tepig:1, oshawott:1, chespin:1, sprigatito:1 } },
            { emoji:'🔒', text: "Keep it inside until you've fully processed it yourself",
              weights: { treecko:3, litten:2, snivy:2, froakie:1, turtwig:1, piplup:1, fennekin:1 } },
            { emoji:'😤', text: "Power through — solving the problem feels better than talking",
              weights: { scorbunny:3, torchic:2, quaxly:2, charmander:1, mudkip:1, squirtle:1, bulbasaur:1 } },
            { emoji:'🎭', text: "Let it out sideways — through humor, creativity, or staying busy",
              weights: { fuecoco:3, grookey:2, chimchar:2, totodile:1, rowlet:1, cyndaquil:1 } }
          ]
        },
        // Q7 ── Ambition vs contentment
        { text: "How do you feel about big goals?",
          answers: [
            { emoji:'🚀', text: "They fuel me — I always have something big I'm working toward",
              weights: { fennekin:3, charmander:2, scorbunny:2, torchic:1, piplup:1, snivy:1, quaxly:1 } },
            { emoji:'🌅', text: "I prefer meaningful over massive — depth matters more than scale",
              weights: { oshawott:3, cyndaquil:2, rowlet:2, turtwig:1, sobble:1, chikorita:1, bulbasaur:1 } },
            { emoji:'😌', text: "Honestly? I'm pretty content with a genuinely good life right now",
              weights: { totodile:3, fuecoco:2, mudkip:2, squirtle:1, chespin:1, sprigatito:1, litten:1 } },
            { emoji:'⚡', text: "Driven — but I want to actually enjoy the journey too",
              weights: { tepig:3, popplio:2, chimchar:2, grookey:1, froakie:1, treecko:1 } }
          ]
        },
        // Q8 ── What energizes you
        { text: "You're most energized by...",
          answers: [
            { emoji:'👥', text: "Being around people — good conversation, genuine connection",
              weights: { sprigatito:3, totodile:2, tepig:2, chikorita:1, grookey:1, chespin:1, popplio:1 } },
            { emoji:'🎯', text: "Deep focus on something you care about — just you and the work",
              weights: { froakie:3, litten:2, quaxly:2, fennekin:1, snivy:1, turtwig:1, treecko:1 } },
            { emoji:'🤸', text: "Moving, doing, competing — anything physical and high-stakes",
              weights: { scorbunny:3, chimchar:2, torchic:2, fuecoco:1, charmander:1, piplup:1 } },
            { emoji:'🌙', text: "Quiet time alone — space to think, recharge, and just be",
              weights: { rowlet:3, mudkip:2, oshawott:2, cyndaquil:1, sobble:1, squirtle:1, bulbasaur:1 } }
          ]
        },
        // Q9 ── Approach to conflict
        { text: "Someone challenges you in front of others. You...",
          answers: [
            { emoji:'🔥', text: "Accept immediately and make sure they don't regret asking",
              weights: { torchic:3, charmander:2, piplup:2, scorbunny:1, fennekin:1, quaxly:1 } },
            { emoji:'🧊', text: "Respond calmly with a precision that shuts it down completely",
              weights: { snivy:3, treecko:2, froakie:2, litten:1, squirtle:1, turtwig:1, cyndaquil:1 } },
            { emoji:'😅', text: "Defuse it with humor — you'd rather laugh than fight",
              weights: { grookey:3, sprigatito:2, chimchar:2, totodile:1, fuecoco:1, chespin:1, mudkip:1 } },
            { emoji:'🕊️', text: "Try to understand where they're coming from before escalating",
              weights: { chikorita:3, oshawott:2, sobble:2, popplio:1, tepig:1, bulbasaur:1, rowlet:1 } }
          ]
        },
        // Q10 ── Trust and loyalty
        { text: "For you, trust is...",
          answers: [
            { emoji:'🔐', text: "Earned slowly through consistent actions over a long time",
              weights: { litten:3, turtwig:2, quaxly:2, cyndaquil:1, rowlet:1, fuecoco:1 } },
            { emoji:'💛', text: "Given generously — you prefer to start open and adjust from there",
              weights: { popplio:3, chikorita:2, tepig:2, chespin:1, oshawott:1, sprigatito:1, grookey:1 } },
            { emoji:'🛡️', text: "Sacred — once given it's absolute, but it takes real time",
              weights: { charmander:3, mudkip:2, bulbasaur:2, squirtle:1, piplup:1, totodile:1, torchic:1 } },
            { emoji:'🎲', text: "Situational — you assess each person and context on its own",
              weights: { treecko:3, froakie:2, snivy:2, fennekin:1, scorbunny:1, chimchar:1, sobble:1 } }
          ]
        },
        // Q11 ── Planning vs improvising
        { text: "Before a big event or challenge, you...",
          answers: [
            { emoji:'📋', text: "Plan everything down to the smallest detail",
              weights: { quaxly:3, fennekin:2, piplup:2, bulbasaur:1, froakie:1, turtwig:1, snivy:1 } },
            { emoji:'🌊', text: "Have a rough outline but stay flexible — things always shift",
              weights: { squirtle:3, rowlet:2, oshawott:2, fuecoco:1, mudkip:1, chikorita:1, sprigatito:1 } },
            { emoji:'🔥', text: "Trust yourself to adapt — you work best in the moment",
              weights: { chimchar:3, totodile:2, grookey:2, chespin:1, scorbunny:1, tepig:1 } },
            { emoji:'📚', text: "Research and prepare deeply, then practice until it feels natural",
              weights: { cyndaquil:3, treecko:2, torchic:2, popplio:1, charmander:1, litten:1, sobble:1 } }
          ]
        },
        // Q12 ── Pace and patience
        { text: "When results take longer than expected, you...",
          answers: [
            { emoji:'🐢', text: "Stay patient — you know good things genuinely take time",
              weights: { turtwig:3, bulbasaur:2, rowlet:2, cyndaquil:1, chikorita:1, popplio:1, sobble:1 } },
            { emoji:'😤', text: "Double down — clearly you haven't been pushing hard enough",
              weights: { fennekin:3, torchic:2, scorbunny:2, charmander:1, piplup:1, chimchar:1, quaxly:1 } },
            { emoji:'🔄', text: "Reassess — maybe the approach needs to change, not the effort",
              weights: { froakie:3, snivy:2, oshawott:2, squirtle:1, litten:1, treecko:1 } },
            { emoji:'😌', text: "Trust the process and don't stress — it'll come when it's ready",
              weights: { fuecoco:3, mudkip:2, sprigatito:2, totodile:1, chespin:1, tepig:1, grookey:1 } }
          ]
        },
        // Q13 ── Self-image: humble vs self-assured
        { text: "How do you see yourself compared to others?",
          answers: [
            { emoji:'🌟', text: "I know I'm capable — and I'm not going to pretend otherwise",
              weights: { snivy:3, piplup:2, treecko:2, charmander:1, fennekin:1, froakie:1, quaxly:1 } },
            { emoji:'🤷', text: "I don't really compare — I'm just focused on my own path",
              weights: { bulbasaur:3, fuecoco:2, rowlet:2, mudkip:1, turtwig:1, litten:1, squirtle:1 } },
            { emoji:'💪', text: "I know I have more to prove, and honestly that drives me",
              weights: { oshawott:3, popplio:2, chimchar:2, cyndaquil:1, scorbunny:1, torchic:1 } },
            { emoji:'🌈', text: "I try to lift others up — everyone does better together",
              weights: { tepig:3, chikorita:2, sobble:2, chespin:1, grookey:1, sprigatito:1, totodile:1 } }
          ]
        },
        // Q14 ── Risk appetite
        { text: "A risky opportunity comes up with a big potential reward. You...",
          answers: [
            { emoji:'🎯', text: "Calculate the odds carefully — then make a rational call",
              weights: { froakie:3, fennekin:2, squirtle:2, snivy:1, piplup:1, turtwig:1, quaxly:1 } },
            { emoji:'🐾', text: "Go for it — you figure the rest out as you go",
              weights: { totodile:3, grookey:2, chimchar:2, sprigatito:1, torchic:1, scorbunny:1 } },
            { emoji:'🤔', text: "Think it over carefully — you've learned not to rush these things",
              weights: { chespin:3, bulbasaur:2, cyndaquil:2, rowlet:1, chikorita:1, oshawott:1, popplio:1 } },
            { emoji:'💫', text: "Trust your gut and commit fully once you've decided",
              weights: { charmander:3, litten:2, mudkip:2, sobble:1, treecko:1, tepig:1, fuecoco:1 } }
          ]
        },
        // Q15 ── Depth vs breadth of interests
        { text: "When it comes to hobbies and interests, you...",
          answers: [
            { emoji:'🔭', text: "Go deep on one or two things — mastery matters more than variety",
              weights: { fennekin:3, froakie:2, litten:2, snivy:1, quaxly:1, cyndaquil:1, turtwig:1 } },
            { emoji:'🌐', text: "Try everything — you get bored fast and love novelty",
              weights: { chespin:3, grookey:2, sprigatito:2, totodile:1, chimchar:1, tepig:1 } },
            { emoji:'🌱', text: "A healthy mix — some deep passions, some light exploration",
              weights: { rowlet:3, squirtle:2, oshawott:2, fuecoco:1, mudkip:1, chikorita:1, bulbasaur:1 } },
            { emoji:'🎖️', text: "Gravitate toward things you can get genuinely great at",
              weights: { scorbunny:3, piplup:2, charmander:2, torchic:1, popplio:1, sobble:1, treecko:1 } }
          ]
        },
        // Q16 ── Loyalty and relationships
        { text: "Your closest friendships are built on...",
          answers: [
            { emoji:'🤝', text: "Shared history and unspoken loyalty that's built over years",
              weights: { cyndaquil:3, bulbasaur:2, litten:2, turtwig:1, mudkip:1, rowlet:1, charmander:1 } },
            { emoji:'💡', text: "Mutual respect for each other's minds and ideas",
              weights: { piplup:3, fennekin:2, snivy:2, froakie:1, treecko:1, quaxly:1, squirtle:1 } },
            { emoji:'😂', text: "Constant laughing and making ridiculous memories together",
              weights: { sprigatito:3, grookey:2, totodile:2, chimchar:1, chespin:1, scorbunny:1, torchic:1 } },
            { emoji:'💗', text: "Genuine emotional honesty — you can say absolutely anything",
              weights: { sobble:3, popplio:2, chikorita:2, oshawott:1, tepig:1, fuecoco:1 } }
          ]
        },
        // Q17 ── Competitive spirit
        { text: "When it comes to competition, you're...",
          answers: [
            { emoji:'🥇', text: "All in — you play to win and you don't apologize for it",
              weights: { torchic:3, scorbunny:2, piplup:2, charmander:1, snivy:1, treecko:1, fennekin:1 } },
            { emoji:'🧘', text: "Focused on yourself — you compete against your own last performance",
              weights: { quaxly:3, turtwig:2, cyndaquil:2, rowlet:1, froakie:1, bulbasaur:1 } },
            { emoji:'🎮', text: "Casual — but actually quite competitive beneath the surface",
              weights: { mudkip:3, squirtle:2, fuecoco:2, sprigatito:1, chespin:1, oshawott:1, litten:1 } },
            { emoji:'🎪', text: "In it for the fun — you want everyone to leave smiling",
              weights: { chimchar:3, grookey:2, tepig:2, totodile:1, popplio:1, sobble:1, chikorita:1 } }
          ]
        },
        // Q18 ── Handling uncertainty
        { text: "When the future feels uncertain, you...",
          answers: [
            { emoji:'🗺️', text: "Make a plan immediately — structure genuinely calms you down",
              weights: { piplup:3, quaxly:2, fennekin:2, froakie:1, snivy:1, cyndaquil:1 } },
            { emoji:'🌊', text: "Let it flow — you've learned that most things work out fine",
              weights: { litten:3, mudkip:2, fuecoco:2, squirtle:1, totodile:1, sprigatito:1, rowlet:1 } },
            { emoji:'🤗', text: "Lean on the people close to you — together you figure it out",
              weights: { chikorita:3, sobble:2, oshawott:2, tepig:1, popplio:1, chespin:1, grookey:1 } },
            { emoji:'😤', text: "Focus hard on what you CAN control and attack that relentlessly",
              weights: { bulbasaur:3, torchic:2, scorbunny:2, treecko:1, chimchar:1, charmander:1, turtwig:1 } }
          ]
        },
        // Q19 ── Creativity and expression
        { text: "When you need to express yourself, you reach for...",
          answers: [
            { emoji:'🎨', text: "Art, music, or making something real with your hands",
              weights: { popplio:3, grookey:2, sobble:2, sprigatito:1, chikorita:1, chespin:1, fuecoco:1 } },
            { emoji:'💬', text: "Conversation — you think out loud and love bouncing ideas off people",
              weights: { tepig:3, torchic:2, chimchar:2, cyndaquil:1, totodile:1, charmander:1 } },
            { emoji:'📝', text: "Writing or structured thinking — putting things in precise order",
              weights: { oshawott:3, snivy:2, fennekin:2, quaxly:1, froakie:1, bulbasaur:1, piplup:1 } },
            { emoji:'🏃', text: "Action — you express yourself through what you do, not what you say",
              weights: { squirtle:3, scorbunny:2, litten:2, mudkip:1, turtwig:1, treecko:1, rowlet:1 } }
          ]
        },
        // Q20 ── Core motivation
        { text: "At your core, what matters most to you?",
          answers: [
            { emoji:'❤️', text: "Connection — the people you love and who love you back",
              weights: { turtwig:3, chikorita:2, bulbasaur:2, cyndaquil:1, popplio:1, tepig:1 } },
            { emoji:'🌋', text: "Achievement — leaving a real mark and proving what you're made of",
              weights: { treecko:3, charmander:2, torchic:2, scorbunny:1, piplup:1, snivy:1, chimchar:1 } },
            { emoji:'🧭', text: "Integrity — doing things right and staying true to your values",
              weights: { sobble:3, quaxly:2, litten:2, froakie:1, oshawott:1, squirtle:1, fennekin:1 } },
            { emoji:'🌈', text: "Freedom — space to be fully yourself without compromise",
              weights: { fuecoco:3, sprigatito:2, grookey:2, mudkip:1, rowlet:1, chespin:1, totodile:1 } }
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
      subtitle: '10 results · 13 questions',
      icon: '🔮',
      color: '#6c5ce7',
      gradient: 'linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%)',
      desc: 'Fire, Psychic, Ghost… which of the 10 core types fits your personality?',
      showcaseTypeIds: [10, 11, 12, 13, 14, 8],  // Fire · Water · Grass · Electric · Psychic · Ghost

      pokemon: {
        fire:     { id: 6,   typeId: 10, name: 'Fire Type',     type: 'Fire',     typeName: 'Fire',     icon: '🔥', color: '#EE8130',
                    traits: ['Passionate','Bold','Energetic','Intense'],
                    signatureMove: 'Flamethrower', idealPartner: 'Blastoise',
                    desc: "You are pure, burning passion. Enthusiastic, dynamic, and impossible to ignore. You throw yourself into everything you care about with an intensity that lights up the people around you. Just don't burn out too fast." },
        water:    { id: 9,   typeId: 11, name: 'Water Type',    type: 'Water',    typeName: 'Water',    icon: '🌊', color: '#6390F0',
                    traits: ['Adaptable','Calm','Empathetic','Deep'],
                    signatureMove: 'Surf', idealPartner: 'Venusaur',
                    desc: "You flow around every obstacle rather than crashing through it. Calm, emotionally intuitive, and endlessly adaptable, you're the person people come to when everything feels overwhelming." },
        grass:    { id: 3,   typeId: 12, name: 'Grass Type',    type: 'Grass',    typeName: 'Grass',    icon: '🌿', color: '#7AC74C',
                    traits: ['Nurturing','Patient','Steady','Grounded'],
                    signatureMove: 'Solar Beam', idealPartner: 'Charizard',
                    desc: "Rooted, steady, and full of quiet life. You take your time, but you always grow toward the light. The most reliable person in any room, always making sure everyone else is okay before checking on yourself." },
        electric: { id: 26,  typeId: 13, name: 'Electric Type', type: 'Electric', typeName: 'Electric', icon: '⚡', color: '#F7D02C',
                    traits: ['Energetic','Quick','Charismatic','Sharp'],
                    signatureMove: 'Thunderbolt', idealPartner: 'Pidgeot',
                    desc: "You charge every room you enter. Quick-witted, charismatic, and endlessly energetic, you process the world faster than almost anyone else and have the sparkling personality to match." },
        psychic:  { id: 65,  typeId: 14, name: 'Psychic Type',  type: 'Psychic',  typeName: 'Psychic',  icon: '🔮', color: '#F95587',
                    traits: ['Analytical','Intuitive','Complex','Focused'],
                    signatureMove: 'Calm Mind', idealPartner: 'Gengar',
                    desc: "You see patterns where others see chaos. Deeply analytical, strangely intuitive, and endlessly curious about how things work, you're the person who figured out the plot twist three chapters ago." },
        ghost:    { id: 94,  typeId: 8,  name: 'Ghost Type',    type: 'Ghost',    typeName: 'Ghost',    icon: '👻', color: '#735797',
                    traits: ['Mysterious','Creative','Playful','Independent'],
                    signatureMove: 'Shadow Ball', idealPartner: 'Alakazam',
                    desc: "You exist slightly outside of everyone else's reality, and you love it. Mysterious, creative, and delightfully unpredictable, you move through the world on your own terms, invisible to most but unforgettable to few." },
        dragon:   { id: 149, typeId: 16, name: 'Dragon Type',   type: 'Dragon',   typeName: 'Dragon',   icon: '🐉', color: '#6F35FC',
                    traits: ['Powerful','Ambitious','Proud','Rare'],
                    signatureMove: 'Dragon Dance', idealPartner: 'Gardevoir',
                    desc: "Rare and remarkable. You carry yourself with a quiet authority that people can't quite explain. They just know you're different. Ambitious, powerful, and not easily found, but absolutely worth knowing." },
        fighting: { id: 68,  typeId: 2,  name: 'Fighting Type', type: 'Fighting', typeName: 'Fighting', icon: '🥊', color: '#C22E28',
                    traits: ['Determined','Hardworking','Direct','Strong'],
                    signatureMove: 'Close Combat', idealPartner: 'Alakazam',
                    desc: "No shortcuts, no excuses, no backing down. You face every challenge head-on with relentless determination. People always know exactly where they stand with you, and they respect it." },
        normal:   { id: 143, typeId: 1,  name: 'Normal Type',   type: 'Normal',   typeName: 'Normal',   icon: '⭐', color: '#A8A77A',
                    traits: ['Versatile','Balanced','Genuine','Reliable'],
                    signatureMove: 'Hyper Beam', idealPartner: 'Machamp',
                    desc: "Deeply, powerfully, underestimated. You look ordinary until someone actually pays attention. Then they realise you're incredibly versatile and genuinely capable of almost anything. The most dangerous type on the field." },
        ice:      { id: 131, typeId: 15, name: 'Ice Type',      type: 'Ice',      typeName: 'Ice',      icon: '❄️', color: '#96D9D6',
                    traits: ['Cool','Composed','Precise','Rare'],
                    signatureMove: 'Ice Beam', idealPartner: 'Charizard',
                    desc: "Elegant and crystalline under pressure. Cool on the outside with startling depths on the inside. You don't show your whole self to just anyone, but when you do, people discover something completely beautiful." }
      },

      questions: [
        { text: "When you feel a strong emotion, you...",
          answers: [
            { emoji:'🔥', text: "Express it immediately and loudly",             weights: { fighting:3, fire:2, electric:1 } },
            { emoji:'🌊', text: "Let it wash over you and sit with it",          weights: { water:3, grass:2, ice:1 } },
            { emoji:'🎭', text: "Process it privately — nobody needs to know",   weights: { ice:3, ghost:2, psychic:1 } },
            { emoji:'📊', text: "Analyse it before reacting",                    weights: { normal:3, psychic:2, dragon:1 } }
          ]
        },
        { text: "Your friends come to you for...",
          answers: [
            { emoji:'💡', text: "Energy and ideas — you get everyone excited",   weights: { electric:3, fighting:2, fire:1 } },
            { emoji:'🤗', text: "Listening — you make people feel heard",        weights: { normal:3, grass:2, water:1 } },
            { emoji:'🧠', text: "Advice — you actually see the whole picture",   weights: { psychic:3, dragon:2, ice:1 } },
            { emoji:'😂', text: "A good time — you make everything more fun",    weights: { electric:3, ghost:2, normal:1 } }
          ]
        },
        { text: "How do you feel about being the centre of attention?",
          answers: [
            { emoji:'🎤', text: "I love it — this is my natural habitat",        weights: { electric:3, fighting:2, fire:1 } },
            { emoji:'👀', text: "Fine with it, but I don't chase it",            weights: { dragon:3, grass:2, normal:1 } },
            { emoji:'😌', text: "I prefer blending in and observing",            weights: { ghost:3, water:2, ice:1 } },
            { emoji:'🤔', text: "I'm okay with it when it's deserved",           weights: { psychic:3, ice:2, normal:1 } }
          ]
        },
        { text: "Pick the environment you feel most alive in:",
          answers: [
            { emoji:'🌋', text: "Somewhere with heat and high stakes",           weights: { fire:3, fighting:2, dragon:1 } },
            { emoji:'🌊', text: "Near water — coastal, calm, endless",           weights: { water:3, ice:2, normal:1 } },
            { emoji:'🌃', text: "A city at night — lights, secrets, energy",     weights: { electric:3, ghost:2, psychic:1 } },
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
            { emoji:'🌊', text: "Quite a lot — I value deep connection",         weights: { normal:3, water:2, grass:1 } },
            { emoji:'🔐', text: "Very little — most people don't get the real me",weights: { dragon:3, ghost:2, ice:1 } },
            { emoji:'🧩', text: "Only pieces — I reveal myself slowly",          weights: { ice:3, psychic:2, normal:1 } }
          ]
        },
        { text: "Your biggest strength is your...",
          answers: [
            { emoji:'🔥', text: "Passion — you go harder than anyone else",      weights: { fighting:3, fire:2, electric:1 } },
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
            { emoji:'🔥', text: "Unstoppable",                                   weights: { fighting:3, dragon:2, fire:1 } },
            { emoji:'💙', text: "Empathetic",                                    weights: { grass:3, normal:2, ice:1 } },
            { emoji:'🌑', text: "Enigmatic",                                     weights: { dragon:3, ghost:2, psychic:1 } },
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
        },
        { text: "When something is unfair, you...",
          answers: [
            { emoji:'🥊', text: "Call it out directly — loudly if necessary",    weights: { fighting:3, fire:2, electric:1 } },
            { emoji:'🌊', text: "Feel it deeply but choose your battles wisely",  weights: { water:3, grass:2, ice:1 } },
            { emoji:'👻', text: "Work around it quietly on your own terms",      weights: { ghost:3, psychic:2, dragon:1 } },
            { emoji:'📜', text: "Document it methodically and build a case",     weights: { normal:3, ice:2, grass:1 } }
          ]
        },
        { text: "Your favourite kind of surprise?",
          answers: [
            { emoji:'🔥', text: "A challenge that demands absolutely everything",weights: { dragon:3, fire:2, fighting:1 } },
            { emoji:'💫', text: "A discovery that changes how you see the world", weights: { psychic:3, electric:2, ghost:1 } },
            { emoji:'🤗', text: "Someone showing up for you unexpectedly",        weights: { normal:3, water:2, grass:1 } },
            { emoji:'🌀', text: "A situation so strange you can't help but laugh",weights: { ghost:3, ice:2, normal:1 } }
          ]
        },
        { text: "How do you leave a lasting impression?",
          answers: [
            { emoji:'💥', text: "You're impossible to ignore in the room",        weights: { fire:3, electric:2, fighting:1 } },
            { emoji:'🧊', text: "You're impossible to forget once they leave",    weights: { ice:3, ghost:2, dragon:1 } },
            { emoji:'🌱', text: "You become the person they realise they needed", weights: { grass:3, water:2, normal:1 } },
            { emoji:'🔮', text: "You're the one they're still trying to figure out",weights: { dragon:3, psychic:2, ghost:1 } }
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
      subtitle: '151 results · 40 questions',
      icon: '✨',
      color: '#ee1515',
      gradient: 'linear-gradient(135deg,#ee1515 0%,#ff6b35 100%)',
      desc: 'Discover your true Kanto counterpart among all 151 original Pokémon.',
      showcasePokemon: [25, 6, 94, 133],  // Pikachu · Charizard · Gengar · Eevee

      pokemon: {
        bulbasaur: { id: 1, typeId: 12, name: 'Bulbasaur', type: 'Grass', color: '#4CD137',
                      traits: ["Patient","Nurturing","Reliable","Steady"],
                      signatureMove: 'Vine Whip', idealPartner: 'Squirtle',
                      desc: "Patient, nurturing, and perpetually underrated, you're the person who actually holds everything together. You don't need the spotlight because your results speak louder than any announcement." },
        ivysaur: { id: 2, typeId: 12, name: 'Ivysaur', type: 'Grass', color: '#55efc4',
                      traits: ["Dedicated","Steady","Growing","Determined"],
                      signatureMove: 'Razor Leaf', idealPartner: 'Wartortle',
                      desc: "You're mid-journey and you know it, which makes you more focused than most. Dedicated, steady, and genuinely building toward something real." },
        venusaur: { id: 3, typeId: 12, name: 'Venusaur', type: 'Grass', color: '#00b894',
                      traits: ["Grounded","Wise","Protective","Powerful"],
                      signatureMove: 'Solar Beam', idealPartner: 'Blastoise',
                      desc: "Grounded, protective, and carrying a quiet authority earned through years of showing up. You've grown into your full strength and it shows in every room you enter." },
        charmander: { id: 4, typeId: 10, name: 'Charmander', type: 'Fire', color: '#e17055',
                      traits: ["Passionate","Eager","Fierce","Loyal"],
                      signatureMove: 'Ember', idealPartner: 'Bulbasaur',
                      desc: "Burning with more intensity than your size suggests, you give everything to whatever you care about. Small, fierce, and loyal, you grow into something extraordinary." },
        charmeleon: { id: 5, typeId: 10, name: 'Charmeleon', type: 'Fire', color: '#d63031',
                      traits: ["Rebellious","Competitive","Intense","Driven"],
                      signatureMove: 'Flamethrower', idealPartner: 'Wartortle',
                      desc: "You push back on anything that tries to limit you, and that defiance is actually your greatest asset. Competitive, intense, and deeply ambitious, you don't wait for permission." },
        charizard: { id: 6, typeId: 10, name: 'Charizard', type: 'Fire', color: '#E84118',
                      traits: ["Ambitious","Fierce","Independent","Unstoppable"],
                      signatureMove: 'Fire Blast', idealPartner: 'Blastoise',
                      desc: "You've earned every bit of your reputation the hard way and you know it. Ambitious, fierce, and completely self-determined, you set the standard and other people try to meet it." },
        squirtle: { id: 7, typeId: 11, name: 'Squirtle', type: 'Water', color: '#0097e6',
                      traits: ["Cool","Strategic","Dependable","Focused"],
                      signatureMove: 'Water Gun', idealPartner: 'Charmander',
                      desc: "Cool under pressure and always thinking two steps ahead, you almost always come out on top when it matters most. There's a calm confidence to you that people find genuinely magnetic." },
        wartortle: { id: 8, typeId: 11, name: 'Wartortle', type: 'Water', color: '#0652DD',
                      traits: ["Composed","Mature","Confident","Reliable"],
                      signatureMove: 'Bubble Beam', idealPartner: 'Ivysaur',
                      desc: "You've outgrown the need to prove yourself constantly, and that maturity is your real strength. Composed, confident, and quietly formidable." },
        blastoise: { id: 9, typeId: 11, name: 'Blastoise', type: 'Water', color: '#1e3799',
                      traits: ["Powerful","Steady","Respected","Immovable"],
                      signatureMove: 'Hydro Pump', idealPartner: 'Venusaur',
                      desc: "Steady, powerful, and completely impossible to move when you've decided your position. You've built something real and everyone around you knows it." },
        caterpie: { id: 10, typeId: 7, name: 'Caterpie', type: 'Bug', color: '#78e08f',
                      traits: ["Humble","Earnest","Patient","Hopeful"],
                      signatureMove: 'String Shot', idealPartner: 'Metapod',
                      desc: "Humble, earnest, and completely unashamed of starting at the very beginning. You trust the process because you already know where it leads." },
        metapod: { id: 11, typeId: 7, name: 'Metapod', type: 'Bug', color: '#b8e994',
                      traits: ["Patient","Enduring","Still","Resilient"],
                      signatureMove: 'Harden', idealPartner: 'Caterpie',
                      desc: "Internally, you're doing the most important work of your life right now, and nobody can see it. Patient, enduring, and completely undistracted by what others think." },
        butterfree: { id: 12, typeId: 7, name: 'Butterfree', type: 'Bug', color: '#a29bfe',
                      traits: ["Free","Expressive","Evolved","Beautiful"],
                      signatureMove: 'Psychic', idealPartner: 'Pidgeot',
                      desc: "You emerged as something completely different from where you started, and you wear that transformation openly. Free, expressive, and genuinely beautiful in motion." },
        weedle: { id: 13, typeId: 7, name: 'Weedle', type: 'Bug', color: '#f9ca24',
                      traits: ["Scrappy","Persistent","Underestimated","Sharp"],
                      signatureMove: 'Poison Sting', idealPartner: 'Beedrill',
                      desc: "Scrappy, persistent, and carrying a lot more sting than people expect at first glance. You don't need a grand introduction, your results make it." },
        kakuna: { id: 14, typeId: 7, name: 'Kakuna', type: 'Bug', color: '#f6e58d',
                      traits: ["Patient","Quiet","Transforming","Determined"],
                      signatureMove: 'Harden', idealPartner: 'Weedle',
                      desc: "You're in a critical phase of becoming and you know better than to rush it. Patient, quiet, and transforming on the inside while the world waits." },
        beedrill: { id: 15, typeId: 7, name: 'Beedrill', type: 'Bug', color: '#fbc531',
                      traits: ["Fierce","Protective","Loyal","Community-minded"],
                      signatureMove: 'Twineedle', idealPartner: 'Butterfree',
                      desc: "Fierce, protective, and completely devoted to the people and things you consider yours. Cross someone you care about and you'll see exactly what kind of threat you are." },
        pidgey: { id: 16, typeId: 1, name: 'Pidgey', type: 'Normal', color: '#b2bec3',
                      traits: ["Easygoing","Adaptable","Content","Low-key"],
                      signatureMove: 'Gust', idealPartner: 'Pidgeotto',
                      desc: "Easygoing, adaptable, and completely at peace with where you are right now. You don't force things, and somehow that means things tend to work out for you." },
        pidgeotto: { id: 17, typeId: 1, name: 'Pidgeotto', type: 'Normal', color: '#a29bfe',
                      traits: ["Steady","Hardworking","Reliable","Progressing"],
                      signatureMove: 'Wing Attack', idealPartner: 'Pidgey',
                      desc: "Steady, hardworking, and making real progress every single day even if no one's watching. You know where you're going and you're already on your way." },
        pidgeot: { id: 18, typeId: 1, name: 'Pidgeot', type: 'Normal', color: '#fd79a8',
                      traits: ["Graceful","Swift","Proud","Commanding"],
                      signatureMove: 'Fly', idealPartner: 'Raichu',
                      desc: "Graceful in motion and quietly proud of what you've become. You don't need to announce your speed, everyone can see it." },
        rattata: { id: 19, typeId: 1, name: 'Rattata', type: 'Normal', color: '#9b59b6',
                      traits: ["Tenacious","Resourceful","Scrappy","Fearless"],
                      signatureMove: 'Super Fang', idealPartner: 'Meowth',
                      desc: "Tenacious, resourceful, and completely unafraid of being the underdog. You survive on wit and persistence where others give up." },
        raticate: { id: 20, typeId: 1, name: 'Raticate', type: 'Normal', color: '#8e44ad',
                      traits: ["Efficient","No-nonsense","Focused","Sharp"],
                      signatureMove: 'Hyper Fang', idealPartner: 'Fearow',
                      desc: "No-nonsense, efficient, and exactly as sharp as you need to be. You don't waste time or energy on anything that doesn't move you forward." },
        spearow: { id: 21, typeId: 1, name: 'Spearow', type: 'Normal', color: '#f0932b',
                      traits: ["Blunt","Territorial","Direct","Honest"],
                      signatureMove: 'Peck', idealPartner: 'Fearow',
                      desc: "Blunt, direct, and completely uninterested in sugarcoating anything. People always know exactly where they stand with you, and most of them find that refreshing." },
        fearow: { id: 22, typeId: 1, name: 'Fearow', type: 'Normal', color: '#e55039',
                      traits: ["Assertive","Commanding","Proud","Territorial"],
                      signatureMove: 'Drill Peck', idealPartner: 'Raticate',
                      desc: "Commanding, assertive, and comfortable claiming the space you need. You've earned the right to be direct and you use it." },
        ekans: { id: 23, typeId: 4, name: 'Ekans', type: 'Poison', color: '#a29bfe',
                      traits: ["Patient","Cunning","Perceptive","Calm"],
                      signatureMove: 'Wrap', idealPartner: 'Arbok',
                      desc: "Patient, perceptive, and far more calculating than your casual manner suggests. You observe everything and act only when the moment is exactly right." },
        arbok: { id: 24, typeId: 4, name: 'Arbok', type: 'Poison', color: '#6c5ce7',
                      traits: ["Commanding","Intimidating","Wise","Instinctive"],
                      signatureMove: 'Glare', idealPartner: 'Raichu',
                      desc: "Commanding and instinctive, you project authority without needing to explain yourself. People sense it before you say a word." },
        pikachu: { id: 25, typeId: 13, name: 'Pikachu', type: 'Electric', color: '#F7B731',
                      traits: ["Energetic","Social","Brave","Loyal"],
                      signatureMove: 'Thunderbolt', idealPartner: 'Eevee',
                      desc: "You light up every room you walk into without even trying. Spirited, quick, and fiercely loyal, people gravitate toward your energy because it's completely real." },
        raichu: { id: 26, typeId: 13, name: 'Raichu', type: 'Electric', color: '#e17055',
                      traits: ["Confident","Experienced","Self-assured","Balanced"],
                      signatureMove: 'Thunder', idealPartner: 'Pidgeot',
                      desc: "You've grown into your power and you wear it comfortably. Confident, experienced, and self-assured in a way that can only come from actually doing the work." },
        sandshrew: { id: 27, typeId: 5, name: 'Sandshrew', type: 'Ground', color: '#f9ca24',
                      traits: ["Defensive","Practical","Grounded","Reliable"],
                      signatureMove: 'Slash', idealPartner: 'Sandslash',
                      desc: "Practical, grounded, and always prepared for what might come. You build security quietly and consistently, and people feel it when you're around." },
        sandslash: { id: 28, typeId: 5, name: 'Sandslash', type: 'Ground', color: '#e2b96a',
                      traits: ["Tough","Resilient","Reliable","Precise"],
                      signatureMove: 'Slash', idealPartner: 'Sandshrew',
                      desc: "Tough, resilient, and exactly as precise as a situation demands. You don't need to make a show of your strength because it's already obvious." },
        nidoranF: { id: 29, typeId: 4, name: 'Nidoran F', type: 'Poison', color: '#fd79a8',
                      traits: ["Cautious","Perceptive","Protective","Careful"],
                      signatureMove: 'Double Kick', idealPartner: 'Nidorina',
                      desc: "Cautious and perceptive, you notice what others miss before they even realize there's something to notice. You protect yourself and your people with quiet precision." },
        nidorina: { id: 30, typeId: 4, name: 'Nidorina', type: 'Poison', color: '#e84393',
                      traits: ["Nurturing","Loyal","Defensive","Devoted"],
                      signatureMove: 'Bite', idealPartner: 'Nidoran F',
                      desc: "Nurturing, loyal, and fiercely protective of the people you love. Your warmth is real and your defense is absolute." },
        nidoqueen: { id: 31, typeId: 4, name: 'Nidoqueen', type: 'Poison', color: '#a29bfe',
                      traits: ["Powerful","Protective","Formidable","Commanding"],
                      signatureMove: 'Earthquake', idealPartner: 'Nidoking',
                      desc: "Powerful, commanding, and completely uncompromising about protecting what matters to you. You are the person people run to when things get serious." },
        nidoranM: { id: 32, typeId: 4, name: 'Nidoran M', type: 'Poison', color: '#74b9ff',
                      traits: ["Assertive","Ambitious","Proud","Driven"],
                      signatureMove: 'Horn Attack', idealPartner: 'Nidorino',
                      desc: "Quietly ambitious and more assertive than you let on initially. You know exactly where you're going and you make moves without announcing them." },
        nidorino: { id: 33, typeId: 4, name: 'Nidorino', type: 'Poison', color: '#0984e3',
                      traits: ["Competitive","Direct","Determined","Aggressive"],
                      signatureMove: 'Horn Drill', idealPartner: 'Nidoran M',
                      desc: "Competitive, direct, and genuinely driven to be better than your last version. You don't coast on potential, you chase it down." },
        nidoking: { id: 34, typeId: 4, name: 'Nidoking', type: 'Poison', color: '#6c5ce7',
                      traits: ["Authoritative","Powerful","Decisive","Commanding"],
                      signatureMove: 'Megahorn', idealPartner: 'Nidoqueen',
                      desc: "Authoritative, decisive, and impossible to ignore when you enter a room. You've built the kind of presence that doesn't need to announce itself." },
        clefairy: { id: 35, typeId: 18, name: 'Clefairy', type: 'Fairy', color: '#ff7eb3',
                      traits: ["Whimsical","Kind","Magical","Warm"],
                      signatureMove: 'Metronome', idealPartner: 'Jigglypuff',
                      desc: "Whimsical, kind, and carrying a small but real magic that people feel without being able to explain. You make the world feel a little warmer just by being in it." },
        clefable: { id: 36, typeId: 18, name: 'Clefable', type: 'Fairy', color: '#fd79a8',
                      traits: ["Serene","Graceful","Powerful","Mysterious"],
                      signatureMove: 'Moonblast', idealPartner: 'Wigglytuff',
                      desc: "Serene, graceful, and quietly more powerful than anyone who dismisses the softness ever expects. You operate on a frequency most people never tune into." },
        vulpix: { id: 37, typeId: 10, name: 'Vulpix', type: 'Fire', color: '#ff9f43',
                      traits: ["Clever","Elegant","Self-reliant","Strategic"],
                      signatureMove: 'Flamethrower', idealPartner: 'Ninetales',
                      desc: "Sharp, self-reliant, and a bit guarded with people you don't know yet. You reveal your real depth only to those who earn it." },
        ninetales: { id: 38, typeId: 10, name: 'Ninetales', type: 'Fire', color: '#ffd32a',
                      traits: ["Wise","Dignified","Timeless","Composed"],
                      signatureMove: 'Fire Spin', idealPartner: 'Vulpix',
                      desc: "Timeless, composed, and carrying the kind of quiet dignity that genuinely cannot be faked. You've seen enough to understand almost everything." },
        jigglypuff: { id: 39, typeId: 1, name: 'Jigglypuff', type: 'Normal', color: '#fd79a8',
                      traits: ["Expressive","Bold","Creative","Sensitive"],
                      signatureMove: 'Sing', idealPartner: 'Clefairy',
                      desc: "Expressive, bold, and completely unable to be anything other than yourself. Your feelings are big, your presence is bigger, and people can't look away." },
        wigglytuff: { id: 40, typeId: 1, name: 'Wigglytuff', type: 'Normal', color: '#ff9ff3',
                      traits: ["Warm","Generous","Cheerful","Welcoming"],
                      signatureMove: 'Hyper Voice', idealPartner: 'Clefable',
                      desc: "Warm, generous, and genuinely cheerful in a way that isn't performance. You make people feel welcome without even trying." },
        zubat: { id: 41, typeId: 4, name: 'Zubat', type: 'Poison', color: '#6c5ce7',
                      traits: ["Persistent","Resourceful","Misunderstood","Tenacious"],
                      signatureMove: 'Wing Attack', idealPartner: 'Golbat',
                      desc: "Persistent, resourceful, and far more capable than the reputation that precedes you. You find your way in the dark when everyone else is lost." },
        golbat: { id: 42, typeId: 4, name: 'Golbat', type: 'Poison', color: '#5f27cd',
                      traits: ["Swift","Bold","Aggressive","Confident"],
                      signatureMove: 'Air Slash', idealPartner: 'Zubat',
                      desc: "Swift, bold, and completely confident in your ability to get where you need to go. You move fast and you don't ask for permission." },
        oddish: { id: 43, typeId: 12, name: 'Oddish', type: 'Grass', color: '#00b894',
                      traits: ["Cheerful","Adaptable","Wandering","Curious"],
                      signatureMove: 'Absorb', idealPartner: 'Bellsprout',
                      desc: "Cheerful, adaptable, and perfectly content wandering toward whatever feels right. You find exactly what you need without making a plan." },
        gloom: { id: 44, typeId: 12, name: 'Gloom', type: 'Grass', color: '#6ab04c',
                      traits: ["Sensitive","Misunderstood","Deep","Unique"],
                      signatureMove: 'Acid', idealPartner: 'Oddish',
                      desc: "Misunderstood more than you deserve, you have a sensitivity and depth that most people encounter and immediately misjudge. The ones who stay find out they were completely wrong." },
        vileplume: { id: 45, typeId: 12, name: 'Vileplume', type: 'Grass', color: '#ff6b81',
                      traits: ["Bold","Striking","Unapologetic","Commanding"],
                      signatureMove: 'Petal Dance', idealPartner: 'Victreebel',
                      desc: "Bold, striking, and completely unapologetic about taking up space. Your presence is impossible to ignore, and you stopped apologizing for that a long time ago." },
        paras: { id: 46, typeId: 7, name: 'Paras', type: 'Bug', color: '#e17055',
                      traits: ["Hardworking","Quiet","Diligent","Steady"],
                      signatureMove: 'Spore', idealPartner: 'Parasect',
                      desc: "Hardworking, quiet, and completely committed to the task in front of you. You don't need recognition, you just need to do the work." },
        parasect: { id: 47, typeId: 7, name: 'Parasect', type: 'Bug', color: '#d63031',
                      traits: ["Methodical","Driven","Focused","Precise"],
                      signatureMove: 'X-Scissor', idealPartner: 'Paras',
                      desc: "Methodical, driven, and deeply focused on exactly what needs to happen next. You've found your system and you execute it without question." },
        venonat: { id: 48, typeId: 7, name: 'Venonat', type: 'Bug', color: '#a29bfe',
                      traits: ["Curious","Gentle","Earnest","Observant"],
                      signatureMove: 'Psybeam', idealPartner: 'Butterfree',
                      desc: "Curious, gentle, and more observant than anyone gives you credit for. You notice things quietly and store them carefully." },
        venomoth: { id: 49, typeId: 7, name: 'Venomoth', type: 'Bug', color: '#fd79a8',
                      traits: ["Free-spirited","Adaptable","Unpredictable","Creative"],
                      signatureMove: 'Sleep Powder', idealPartner: 'Butterfree',
                      desc: "Free-spirited, adaptable, and genuinely impossible to contain once you decide to move. You follow light and change direction and it all somehow works out." },
        diglett: { id: 50, typeId: 5, name: 'Diglett', type: 'Ground', color: '#e2b96a',
                      traits: ["Efficient","Understated","Focused","Quick"],
                      signatureMove: 'Dig', idealPartner: 'Dugtrio',
                      desc: "Efficient, understated, and quietly more effective than almost anyone working at surface level. You do things your way, below the noise." },
        dugtrio: { id: 51, typeId: 5, name: 'Dugtrio', type: 'Ground', color: '#f9ca24',
                      traits: ["Coordinated","Practical","Swift","Efficient"],
                      signatureMove: 'Earthquake', idealPartner: 'Diglett',
                      desc: "Coordinated, practical, and moving faster than people expect when you need to. You get things done without drama or ceremony." },
        meowth: { id: 52, typeId: 1, name: 'Meowth', type: 'Normal', color: '#ffd32a',
                      traits: ["Cunning","Charming","Streetwise","Resourceful"],
                      signatureMove: 'Pay Day', idealPartner: 'Persian',
                      desc: "Cunning, charming, and street-smart in a way that formal education never really captures. You find the angle that works and you work it." },
        persian: { id: 53, typeId: 1, name: 'Persian', type: 'Normal', color: '#dfe6e9',
                      traits: ["Refined","Aloof","Elegant","Calculated"],
                      signatureMove: 'Slash', idealPartner: 'Meowth',
                      desc: "Refined, elegant, and carefully selective about who earns your attention. You see everything happening around you and share only what serves you." },
        psyduck: { id: 54, typeId: 11, name: 'Psyduck', type: 'Water', color: '#74b9ff',
                      traits: ["Anxious","Overthinking","Earnest","Surprisingly Capable"],
                      signatureMove: 'Confusion', idealPartner: 'Slowpoke',
                      desc: "Your mind is always running a little faster than you'd like, but that anxious energy keeps you more switched on than most. Earnest, endearing, and surprisingly capable when it counts." },
        golduck: { id: 55, typeId: 11, name: 'Golduck', type: 'Water', color: '#0652DD',
                      traits: ["Composed","Athletic","Confident","Sharp"],
                      signatureMove: 'Hydro Pump', idealPartner: 'Slowbro',
                      desc: "Composed, athletic, and quietly impressive in a way that looks effortless. You've moved past the anxiety and into the zone." },
        mankey: { id: 56, typeId: 2, name: 'Mankey', type: 'Fighting', color: '#e17055',
                      traits: ["Hot-headed","Passionate","Raw","Explosive"],
                      signatureMove: 'Karate Chop', idealPartner: 'Primeape',
                      desc: "Hot-headed, raw, and burning with more feeling than you always know what to do with. That intensity is real and it's also genuinely powerful when aimed right." },
        primeape: { id: 57, typeId: 2, name: 'Primeape', type: 'Fighting', color: '#d63031',
                      traits: ["Relentless","Ferocious","Intense","Unstoppable"],
                      signatureMove: 'Cross Chop', idealPartner: 'Mankey',
                      desc: "Relentless, ferocious, and completely impossible to stop once you've decided to move. Your intensity is not a liability, it's your edge." },
        growlithe: { id: 58, typeId: 10, name: 'Growlithe', type: 'Fire', color: '#ff7675',
                      traits: ["Loyal","Warm","Devoted","Protective"],
                      signatureMove: 'Flamethrower', idealPartner: 'Arcanine',
                      desc: "Loyal, warm, and absolutely devoted to the people who matter to you. Your love is constant and your protection is real." },
        arcanine: { id: 59, typeId: 10, name: 'Arcanine', type: 'Fire', color: '#e17055',
                      traits: ["Noble","Powerful","Majestic","Loyal"],
                      signatureMove: 'Extreme Speed', idealPartner: 'Growlithe',
                      desc: "Noble, powerful, and breathtaking when you decide to move. You carry yourself with a natural majesty that commands respect without demanding it." },
        poliwag: { id: 60, typeId: 11, name: 'Poliwag', type: 'Water', color: '#74b9ff',
                      traits: ["Carefree","Cheerful","Adaptable","Go-with-flow"],
                      signatureMove: 'Water Gun', idealPartner: 'Poliwhirl',
                      desc: "Carefree, cheerful, and completely at ease with wherever life takes you. You don't fight the current because you trust it." },
        poliwhirl: { id: 61, typeId: 11, name: 'Poliwhirl', type: 'Water', color: '#0984e3',
                      traits: ["Adaptable","Steady","Resilient","Improving"],
                      signatureMove: 'Bubblebeam', idealPartner: 'Poliwag',
                      desc: "Adaptable, steady, and consistently getting better without making a fuss about it. You grow at exactly the pace you need." },
        poliwrath: { id: 62, typeId: 11, name: 'Poliwrath', type: 'Water', color: '#1e3799',
                      traits: ["Disciplined","Powerful","Determined","Strong"],
                      signatureMove: 'Submission', idealPartner: 'Machamp',
                      desc: "Disciplined, powerful, and built through effort that nobody can take from you. Your strength is entirely self-made and it shows." },
        abra: { id: 63, typeId: 14, name: 'Abra', type: 'Psychic', color: '#ffd32a',
                      traits: ["Elusive","Cerebral","Independent","Perceptive"],
                      signatureMove: 'Teleport', idealPartner: 'Kadabra',
                      desc: "Elusive, cerebral, and deeply independent, you live mostly in your own mind and it's genuinely a more interesting place than anywhere else. You disappear when people push too hard." },
        kadabra: { id: 64, typeId: 14, name: 'Kadabra', type: 'Psychic', color: '#f9ca24',
                      traits: ["Analytical","Sharp","Precise","Focused"],
                      signatureMove: 'Psychic', idealPartner: 'Alakazam',
                      desc: "Analytical, sharp, and relentlessly precise when you're focused on something. You process information faster than most and you're aware of it." },
        alakazam: { id: 65, typeId: 14, name: 'Alakazam', type: 'Psychic', color: '#e1b12c',
                      traits: ["Intellectual","Strategic","Precise","Brilliant"],
                      signatureMove: 'Future Sight', idealPartner: 'Gengar',
                      desc: "Your mind moves faster than most people can follow, and you've long since made peace with being the sharpest person in the room. Precise, strategic, and genuinely brilliant." },
        machop: { id: 66, typeId: 2, name: 'Machop', type: 'Fighting', color: '#e17055',
                      traits: ["Eager","Hardworking","Earnest","Dedicated"],
                      signatureMove: 'Karate Chop', idealPartner: 'Machoke',
                      desc: "Eager, hardworking, and completely earnest about getting better. You put in more effort than anyone asks for because you actually want it." },
        machoke: { id: 67, typeId: 2, name: 'Machoke', type: 'Fighting', color: '#c0392b',
                      traits: ["Dedicated","Strong","Improving","Disciplined"],
                      signatureMove: 'DynamicPunch', idealPartner: 'Machamp',
                      desc: "Dedicated, disciplined, and visibly getting stronger every day. You're in the hard middle of the work and you're choosing it anyway." },
        machamp: { id: 68, typeId: 2, name: 'Machamp', type: 'Fighting', color: '#c0392b',
                      traits: ["Determined","Direct","Hardworking","Powerful"],
                      signatureMove: 'Close Combat', idealPartner: 'Pikachu',
                      desc: "No shortcuts, no excuses, and no backing down. You face every challenge head-on with relentless determination, and people always know exactly where they stand with you." },
        bellsprout: { id: 69, typeId: 12, name: 'Bellsprout', type: 'Grass', color: '#78e08f',
                      traits: ["Flexible","Cheerful","Persistent","Adaptable"],
                      signatureMove: 'Vine Whip', idealPartner: 'Weepinbell',
                      desc: "Flexible, persistent, and cheerful in a way that survives every setback. You bend without breaking and that quiet resilience is your real strength." },
        weepinbell: { id: 70, typeId: 12, name: 'Weepinbell', type: 'Grass', color: '#6ab04c',
                      traits: ["Aggressive","Eager","Forward","Hungry"],
                      signatureMove: 'Razor Leaf', idealPartner: 'Bellsprout',
                      desc: "Eager, aggressive, and completely forward about what you want. You lean into the pursuit and you don't apologize for appetite." },
        victreebel: { id: 71, typeId: 12, name: 'Victreebel', type: 'Grass', color: '#badc58',
                      traits: ["Cunning","Striking","Strategic","Luring"],
                      signatureMove: 'Leaf Blade', idealPartner: 'Vileplume',
                      desc: "Cunning and striking, you draw people in and keep them slightly off-balance. Your appeal is completely real but so are your edges." },
        tentacool: { id: 72, typeId: 11, name: 'Tentacool', type: 'Water', color: '#74b9ff',
                      traits: ["Drifting","Perceptive","Adaptable","Patient"],
                      signatureMove: 'Wrap', idealPartner: 'Tentacruel',
                      desc: "Perceptive and adaptable, you pick up on things most people miss while drifting through at your own pace. Sharper than you look." },
        tentacruel: { id: 73, typeId: 11, name: 'Tentacruel', type: 'Water', color: '#0984e3',
                      traits: ["Calculated","Commanding","Sharp","Precise"],
                      signatureMove: 'Hydro Pump', idealPartner: 'Tentacool',
                      desc: "Sharp, calculated, and commanding when you decide to be. You don't make threats, you establish facts, and people take notes." },
        geodude: { id: 74, typeId: 6, name: 'Geodude', type: 'Rock', color: '#b2bec3',
                      traits: ["Solid","Blunt","Grounded","Low-maintenance"],
                      signatureMove: 'Rock Throw', idealPartner: 'Graveler',
                      desc: "Solid, blunt, and completely low-maintenance in the best possible way. You are exactly what you appear to be, and people find that profoundly refreshing." },
        graveler: { id: 75, typeId: 6, name: 'Graveler', type: 'Rock', color: '#95a5a6',
                      traits: ["Tough","No-nonsense","Grounded","Reliable"],
                      signatureMove: 'Rock Blast', idealPartner: 'Golem',
                      desc: "Tough, no-nonsense, and utterly reliable when it matters. You don't complain, you don't fold, you just handle it." },
        golem: { id: 76, typeId: 6, name: 'Golem', type: 'Rock', color: '#7f8c8d',
                      traits: ["Powerful","Stoic","Immovable","Decided"],
                      signatureMove: 'Earthquake', idealPartner: 'Graveler',
                      desc: "Powerful, stoic, and completely immovable once you've made a decision. You've built a foundation that nothing shakes, and people lean on that." },
        ponyta: { id: 77, typeId: 10, name: 'Ponyta', type: 'Fire', color: '#ffd32a',
                      traits: ["Graceful","Spirited","Free","Pure"],
                      signatureMove: 'Flame Charge', idealPartner: 'Rapidash',
                      desc: "Graceful, spirited, and genuinely most yourself when you have room to run. You don't need direction, just space." },
        rapidash: { id: 78, typeId: 10, name: 'Rapidash', type: 'Fire', color: '#ff9f43',
                      traits: ["Elegant","Swift","Proud","Unstoppable"],
                      signatureMove: 'Fire Spin', idealPartner: 'Arcanine',
                      desc: "Elegant in motion and quietly proud of the speed you've built. You make it look effortless because, at this point, it genuinely is." },
        slowpoke: { id: 79, typeId: 11, name: 'Slowpoke', type: 'Water', color: '#ff9ff3',
                      traits: ["Unbothered","Content","Relaxed","At-peace"],
                      signatureMove: 'Yawn', idealPartner: 'Snorlax',
                      desc: "Completely, genuinely unbothered by the things that stress most people out. You exist at your own pace and the world eventually catches up." },
        slowbro: { id: 80, typeId: 11, name: 'Slowbro', type: 'Water', color: '#fd79a8',
                      traits: ["Calm","Thoughtful","Wise","Unhurried"],
                      signatureMove: 'Psychic', idealPartner: 'Slowpoke',
                      desc: "Calm, thoughtful, and secretly carrying more wisdom than your laid-back exterior suggests. You've processed everything, you just don't need to perform the processing." },
        magnemite: { id: 81, typeId: 13, name: 'Magnemite', type: 'Electric', color: '#74b9ff',
                      traits: ["Logical","Systematic","Efficient","Independent"],
                      signatureMove: 'Thundershock', idealPartner: 'Magneton',
                      desc: "Logical, systematic, and genuinely self-sufficient in ways most people never achieve. You operate on your own frequency and don't need outside input to function." },
        magneton: { id: 82, typeId: 13, name: 'Magneton', type: 'Electric', color: '#0984e3',
                      traits: ["Precise","Methodical","Collective","Self-sufficient"],
                      signatureMove: 'Zap Cannon', idealPartner: 'Magnemite',
                      desc: "Precise, methodical, and operating at a level of organization that quietly impresses everyone around you. You've got a system and it works." },
        farfetchd: { id: 83, typeId: 1, name: 'Farfetch\'d', type: 'Normal', color: '#78e08f',
                      traits: ["Principled","Rare","Dedicated","Honorable"],
                      signatureMove: 'Leaf Blade', idealPartner: 'Pidgeot',
                      desc: "Principled, rare, and completely dedicated to doing things the right way even when it's harder. You operate by a code that most people don't have the patience for." },
        doduo: { id: 84, typeId: 1, name: 'Doduo', type: 'Normal', color: '#e2b96a',
                      traits: ["Restless","Dual-natured","Eager","Quick"],
                      signatureMove: 'Peck', idealPartner: 'Dodrio',
                      desc: "Restless, quick, and always moving toward something even when you're not sure exactly what. Your energy is constant and your enthusiasm is real." },
        dodrio: { id: 85, typeId: 1, name: 'Dodrio', type: 'Normal', color: '#d63031',
                      traits: ["Dynamic","Fast","Competitive","Multi-faceted"],
                      signatureMove: 'Tri Attack', idealPartner: 'Fearow',
                      desc: "Dynamic, fast, and carrying more dimensions than people expect. You process things from multiple angles simultaneously and you move before most people finish deciding." },
        seel: { id: 86, typeId: 11, name: 'Seel', type: 'Water', color: '#74b9ff',
                      traits: ["Playful","Cheerful","Innocent","Enthusiastic"],
                      signatureMove: 'Aurora Beam', idealPartner: 'Dewgong',
                      desc: "Playful, cheerful, and genuinely delighted by the world around you. Your enthusiasm is completely unironic and that's exactly what makes it so contagious." },
        dewgong: { id: 87, typeId: 11, name: 'Dewgong', type: 'Water', color: '#dfe6e9',
                      traits: ["Serene","Graceful","Composed","Peaceful"],
                      signatureMove: 'Ice Beam', idealPartner: 'Lapras',
                      desc: "Serene, graceful, and carrying a quiet beauty that doesn't announce itself. You have a rare kind of peace that people want to stay near." },
        grimer: { id: 88, typeId: 4, name: 'Grimer', type: 'Poison', color: '#636e72',
                      traits: ["Adaptable","Uninhibited","Easygoing","Unbothered"],
                      signatureMove: 'Sludge', idealPartner: 'Muk',
                      desc: "Adaptable, uninhibited, and completely at peace with taking up space. You don't pretend to be something cleaner than you are, and there's a real freedom in that." },
        muk: { id: 89, typeId: 4, name: 'Muk', type: 'Poison', color: '#2d3436',
                      traits: ["Overwhelming","Unapologetic","Powerful","Unconstrained"],
                      signatureMove: 'Gunk Shot', idealPartner: 'Grimer',
                      desc: "Overwhelming, unapologetic, and completely beyond containment once you decide to be. You are a lot, and you know it, and you're completely fine with that." },
        shellder: { id: 90, typeId: 11, name: 'Shellder', type: 'Water', color: '#74b9ff',
                      traits: ["Defensive","Tough","Prickly","Selective"],
                      signatureMove: 'Clamp', idealPartner: 'Cloyster',
                      desc: "Tough, defensive, and not easy to get close to, but the people who crack through find someone genuinely worth knowing. Your exterior is just your honesty about who gets in." },
        cloyster: { id: 91, typeId: 11, name: 'Cloyster', type: 'Water', color: '#0652DD',
                      traits: ["Guarded","Powerful","Impenetrable","Strategic"],
                      signatureMove: 'Icicle Spear', idealPartner: 'Shellder',
                      desc: "Almost completely guarded on the outside, but that armor is protecting something formidable. You choose every relationship with care and that makes them mean everything." },
        gastly: { id: 92, typeId: 8, name: 'Gastly', type: 'Ghost', color: '#6c5ce7',
                      traits: ["Playful","Mischievous","Elusive","Free"],
                      signatureMove: 'Lick', idealPartner: 'Haunter',
                      desc: "Playful, mischievous, and impossible to pin down. You drift through situations others find impossible with a casual ease that looks like magic." },
        haunter: { id: 93, typeId: 8, name: 'Haunter', type: 'Ghost', color: '#8e44ad',
                      traits: ["Witty","Dark","Unpredictable","Clever"],
                      signatureMove: 'Shadow Punch', idealPartner: 'Gengar',
                      desc: "Witty, darkly clever, and genuinely unpredictable in the best way. Your sense of humor is not for everyone and you consider that a feature." },
        gengar: { id: 94, typeId: 8, name: 'Gengar', type: 'Ghost', color: '#8e44ad',
                      traits: ["Mischievous","Clever","Big-hearted","Playful"],
                      signatureMove: 'Shadow Ball', idealPartner: 'Alakazam',
                      desc: "A darkly brilliant sense of humor and a knack for seeing what others miss. Underneath the chaos is a genuinely sharp mind and a surprisingly enormous heart." },
        onix: { id: 95, typeId: 6, name: 'Onix', type: 'Rock', color: '#636e72',
                      traits: ["Imposing","Stoic","Resilient","Immovable"],
                      signatureMove: 'Rock Slide', idealPartner: 'Steelix',
                      desc: "Imposing, stoic, and built for endurance in a way that smaller things simply cannot match. You don't need to make noise, your presence makes it for you." },
        drowzee: { id: 96, typeId: 14, name: 'Drowzee', type: 'Psychic', color: '#ffd32a',
                      traits: ["Perceptive","Strange","Introspective","Unsettling"],
                      signatureMove: 'Hypnosis', idealPartner: 'Hypno',
                      desc: "Perceptive, strange, and quietly reading everyone in the room without appearing to. You know more than you let on and you use that knowledge carefully." },
        hypno: { id: 97, typeId: 14, name: 'Hypno', type: 'Psychic', color: '#f9ca24',
                      traits: ["Mysterious","Compelling","Analytical","Unsettling"],
                      signatureMove: 'Psychic', idealPartner: 'Drowzee',
                      desc: "Mysterious, compelling, and operating at a level of psychological awareness that makes most people quietly uneasy. You see through things very easily." },
        krabby: { id: 98, typeId: 11, name: 'Krabby', type: 'Water', color: '#e17055',
                      traits: ["Stubborn","Determined","Grumpy","Tenacious"],
                      signatureMove: 'Crabhammer', idealPartner: 'Kingler',
                      desc: "Stubborn, grumpy, and completely determined to get what you're after regardless of how long it takes. People underestimate how far that tenacity actually carries you." },
        kingler: { id: 99, typeId: 11, name: 'Kingler', type: 'Water', color: '#d63031',
                      traits: ["Powerful","Precise","Aggressive","Decisive"],
                      signatureMove: 'Crabhammer', idealPartner: 'Krabby',
                      desc: "Precise, powerful, and absolutely decisive the moment you act. You don't hesitate once you've committed, and you're right more often than people expect." },
        voltorb: { id: 100, typeId: 13, name: 'Voltorb', type: 'Electric', color: '#e17055',
                      traits: ["Volatile","Unpredictable","Tense","Explosive"],
                      signatureMove: 'Thunderbolt', idealPartner: 'Electrode',
                      desc: "Volatile, unpredictable, and carrying a charge that everyone around you can feel. You keep people on their toes and that's not always an accident." },
        electrode: { id: 101, typeId: 13, name: 'Electrode', type: 'Electric', color: '#e55039',
                      traits: ["Explosive","Fast","Edge-living","Intense"],
                      signatureMove: 'Explosion', idealPartner: 'Voltorb',
                      desc: "Explosive, fast, and living so close to the edge that it becomes your most interesting quality. You move at a speed that leaves most people blinking." },
        exeggcute: { id: 102, typeId: 12, name: 'Exeggcute', type: 'Grass', color: '#ffd32a',
                      traits: ["Collective","Social","Curious","Community-minded"],
                      signatureMove: 'Egg Bomb', idealPartner: 'Chansey',
                      desc: "Collective-minded, social, and at your absolute best when you're thinking alongside other people. Individual glory matters less to you than shared discovery." },
        exeggutor: { id: 103, typeId: 12, name: 'Exeggutor', type: 'Grass', color: '#badc58',
                      traits: ["Confident","Zen","Self-possessed","Powerful"],
                      signatureMove: 'Solar Beam', idealPartner: 'Venusaur',
                      desc: "Completely self-possessed, somehow both confident and zen at the same time. You've decided who you are, you're deeply fine with all of it, and nothing really rattles you." },
        cubone: { id: 104, typeId: 5, name: 'Cubone', type: 'Ground', color: '#f9ca24',
                      traits: ["Solitary","Resilient","Carrying-grief","Determined"],
                      signatureMove: 'Bone Club', idealPartner: 'Marowak',
                      desc: "Solitary, resilient, and carrying something heavy that made you stronger than you were before. You've processed loss in your own way and you keep going." },
        marowak: { id: 105, typeId: 5, name: 'Marowak', type: 'Ground', color: '#e2b96a',
                      traits: ["Hardened","Fierce","Protective","Battle-worn"],
                      signatureMove: 'Bonemerang', idealPartner: 'Cubone',
                      desc: "Hardened by real difficulty and fiercely protective because of it. You've been through things that most people only hear about, and it made you exactly who you are." },
        hitmonlee: { id: 106, typeId: 2, name: 'Hitmonlee', type: 'Fighting', color: '#e17055',
                      traits: ["Technical","Fast","Disciplined","Precise"],
                      signatureMove: 'Hi Jump Kick', idealPartner: 'Hitmonchan',
                      desc: "Technical, fast, and disciplined in a way that makes your skill look like pure instinct. Every movement has been earned through relentless practice." },
        hitmonchan: { id: 107, typeId: 2, name: 'Hitmonchan', type: 'Fighting', color: '#d63031',
                      traits: ["Precise","Honorable","Focused","Principled"],
                      signatureMove: 'Close Combat', idealPartner: 'Hitmonlee',
                      desc: "Precise, honorable, and deeply focused on doing things the right way. Your discipline is a form of respect, for the craft, and for yourself." },
        lickitung: { id: 108, typeId: 1, name: 'Lickitung', type: 'Normal', color: '#fd79a8',
                      traits: ["Curious","Sensory","Unusual","Earnest"],
                      signatureMove: 'Lick', idealPartner: 'Chansey',
                      desc: "Curious, sensory, and experiencing the world in a way that's genuinely different from most people around you. Unusual in the best possible way." },
        koffing: { id: 109, typeId: 4, name: 'Koffing', type: 'Poison', color: '#a29bfe',
                      traits: ["Carefree","Chaotic","Cheerful","Unbothered"],
                      signatureMove: 'Sludge Bomb', idealPartner: 'Weezing',
                      desc: "Carefree, chaotic, and genuinely cheerful about the whole thing. You float through situations that would stress others out and somehow that works." },
        weezing: { id: 110, typeId: 4, name: 'Weezing', type: 'Poison', color: '#6c5ce7',
                      traits: ["Self-aware","Complex","Dark-humored","Accepting"],
                      signatureMove: 'Sludge Bomb', idealPartner: 'Koffing',
                      desc: "Self-aware, complex, and carrying a dark sense of humor about your own contradictions. You know exactly what you are and you've found a kind of peace in it." },
        rhyhorn: { id: 111, typeId: 5, name: 'Rhyhorn', type: 'Ground', color: '#b2bec3',
                      traits: ["Stubborn","Powerful","Straightforward","Unstoppable"],
                      signatureMove: 'Horn Attack', idealPartner: 'Rhydon',
                      desc: "Stubborn, powerful, and charging straight ahead without overcomplicating it. You decide on a direction and nothing short of a wall changes that." },
        rhydon: { id: 112, typeId: 5, name: 'Rhydon', type: 'Ground', color: '#95a5a6',
                      traits: ["Formidable","Evolved","Tough","Resilient"],
                      signatureMove: 'Earthquake', idealPartner: 'Rhyhorn',
                      desc: "Formidable, evolved, and built through the kind of endurance that reshapes you permanently. You're not the same as you were and that's entirely the point." },
        chansey: { id: 113, typeId: 1, name: 'Chansey', type: 'Normal', color: '#ffb8d1',
                      traits: ["Generous","Selfless","Caring","Nurturing"],
                      signatureMove: 'Soft-Boiled', idealPartner: 'Blissey',
                      desc: "Generous, selfless, and genuinely giving without keeping score. You care for people in a way that asks for nothing back, and that is actually rare." },
        tangela: { id: 114, typeId: 12, name: 'Tangela', type: 'Grass', color: '#55efc4',
                      traits: ["Mysterious","Gentle","Hard-to-read","Unique"],
                      signatureMove: 'Mega Drain', idealPartner: 'Venusaur',
                      desc: "Mysterious, gentle, and genuinely hard to fully know, which isn't shyness, it's just that you reveal yourself slowly and on your own terms." },
        kangaskhan: { id: 115, typeId: 1, name: 'Kangaskhan', type: 'Normal', color: '#a5b4a1',
                      traits: ["Fiercely-protective","Devoted","Loyal","Maternal"],
                      signatureMove: 'Outrage', idealPartner: 'Chansey',
                      desc: "Fiercely protective, absolutely devoted, and genuinely dangerous when someone threatens what you care about. Your love comes with real teeth." },
        horsea: { id: 116, typeId: 11, name: 'Horsea', type: 'Water', color: '#74b9ff',
                      traits: ["Delicate","Curious","Quietly-strong","Determined"],
                      signatureMove: 'Water Gun', idealPartner: 'Seadra',
                      desc: "Delicate in appearance, quietly strong in reality, and curious about almost everything. You hold more than you look like you can." },
        seadra: { id: 117, typeId: 11, name: 'Seadra', type: 'Water', color: '#0984e3',
                      traits: ["Dignified","Sharp","Territorial","Proud"],
                      signatureMove: 'Hydro Pump', idealPartner: 'Kingdra',
                      desc: "Dignified, sharp, and quietly territorial about the things that belong to you. You defend your space with precision and your pride is completely earned." },
        goldeen: { id: 118, typeId: 11, name: 'Goldeen', type: 'Water', color: '#ff9f43',
                      traits: ["Graceful","Proud","Beautiful","Flowing"],
                      signatureMove: 'Horn Drill', idealPartner: 'Seaking',
                      desc: "Graceful, proud, and genuinely beautiful in motion. You're completely in your element and everyone around you can see it." },
        seaking: { id: 119, typeId: 11, name: 'Seaking', type: 'Water', color: '#e84393',
                      traits: ["Dominant","Striking","Confident","Commanding"],
                      signatureMove: 'Megahorn', idealPartner: 'Goldeen',
                      desc: "Dominant, striking, and completely confident in your ability to lead when the moment arrives. You don't wait for permission to take the space you need." },
        staryu: { id: 120, typeId: 11, name: 'Staryu', type: 'Water', color: '#74b9ff',
                      traits: ["Mysterious","Composed","Regenerative","Self-contained"],
                      signatureMove: 'Water Gun', idealPartner: 'Starmie',
                      desc: "Mysterious, self-contained, and regenerating constantly in ways people don't notice. You are more intact than you look and more capable than you announce." },
        starmie: { id: 121, typeId: 11, name: 'Starmie', type: 'Water', color: '#a29bfe',
                      traits: ["Enigmatic","Otherworldly","Sharp","Composed"],
                      signatureMove: 'Psychic', idealPartner: 'Alakazam',
                      desc: "Enigmatic in a way that makes people wonder if they're seeing the real you or just a projection of it. Sharp, composed, and completely your own thing." },
        mrMime: { id: 122, typeId: 14, name: 'Mr. Mime', type: 'Psychic', color: '#fd79a8',
                      traits: ["Expressive","Social","Performative","Theatrical"],
                      signatureMove: 'Psychic', idealPartner: 'Jigglypuff',
                      desc: "Expressive, theatrical, and deeply social in a way that draws either fascination or discomfort. You perform, but you also genuinely mean it." },
        scyther: { id: 123, typeId: 7, name: 'Scyther', type: 'Bug', color: '#78e08f',
                      traits: ["Swift","Precise","Disciplined","Lethal"],
                      signatureMove: 'X-Scissor', idealPartner: 'Pinsir',
                      desc: "Swift, precise, and disciplined to the point where your skill looks effortless. Every movement is intentional and nothing is wasted." },
        jynx: { id: 124, typeId: 15, name: 'Jynx', type: 'Ice', color: '#fd79a8',
                      traits: ["Expressive","Emotional","Magnetic","Intuitive"],
                      signatureMove: 'Blizzard', idealPartner: 'Mr. Mime',
                      desc: "Expressive, emotional, and magnetically compelling in a way that people feel before they understand it. You operate on deep intuition and it's almost always right." },
        electabuzz: { id: 125, typeId: 13, name: 'Electabuzz', type: 'Electric', color: '#ffd32a',
                      traits: ["High-energy","Aggressive","Charged","Intense"],
                      signatureMove: 'Thunderpunch', idealPartner: 'Magmar',
                      desc: "High-energy, charged, and generating more electricity than most people can stand to be around for long. Your intensity is real and you lean into it." },
        magmar: { id: 126, typeId: 10, name: 'Magmar', type: 'Fire', color: '#e17055',
                      traits: ["Intense","Hot-tempered","Passionate","Raw"],
                      signatureMove: 'Fire Punch', idealPartner: 'Electabuzz',
                      desc: "Intense, hot-tempered, and burning with feeling that you don't always know how to contain. Your passion is raw and absolutely real." },
        pinsir: { id: 127, typeId: 7, name: 'Pinsir', type: 'Bug', color: '#636e72',
                      traits: ["Fierce","Powerful","Blunt","Unstoppable"],
                      signatureMove: 'Guillotine', idealPartner: 'Scyther',
                      desc: "Fierce, powerful, and completely blunt about what you want and how you'll get it. You grab what matters and you don't let go." },
        tauros: { id: 128, typeId: 1, name: 'Tauros', type: 'Normal', color: '#b2bec3',
                      traits: ["Aggressive","Dominant","Unstoppable","Charging"],
                      signatureMove: 'Double-Edge', idealPartner: 'Rhydon',
                      desc: "Aggressive, dominant, and building momentum the moment you decide to move. Once you're going, redirecting you takes more force than most people have." },
        magikarp: { id: 129, typeId: 11, name: 'Magikarp', type: 'Water', color: '#ff9f43',
                      traits: ["Persevering","Underestimated","Resilient","Enduring"],
                      signatureMove: 'Tackle', idealPartner: 'Gyarados',
                      desc: "You get dismissed, written off, and overlooked, and you keep going anyway. The people who doubted you are in for a surprise that they won't forget for a very long time." },
        gyarados: { id: 130, typeId: 11, name: 'Gyarados', type: 'Water', color: '#0652DD',
                      traits: ["Fierce","Transformed","Unstoppable","Powerful"],
                      signatureMove: 'Hyper Beam', idealPartner: 'Dragonite',
                      desc: "You've been pushed to your absolute limit, survived it, and emerged as something nobody expected. Fierce, powerful, and completely done with being underestimated." },
        lapras: { id: 131, typeId: 11, name: 'Lapras', type: 'Water', color: '#00b3cc',
                      traits: ["Gentle","Wise","Empathetic","Peaceful"],
                      signatureMove: 'Ice Beam', idealPartner: 'Snorlax',
                      desc: "Gentle, wise, and carrying others with a grace that makes the journey feel safe. You have a rare capacity for empathy that people seek out without always knowing why." },
        ditto: { id: 132, typeId: 1, name: 'Ditto', type: 'Normal', color: '#b2bec3',
                      traits: ["Adaptable","Easygoing","Versatile","Fluid"],
                      signatureMove: 'Transform', idealPartner: 'Eevee',
                      desc: "Adaptable, easygoing, and genuinely capable of becoming what any situation needs. You don't have a rigid self because you never needed one." },
        eevee: { id: 133, typeId: 1, name: 'Eevee', type: 'Normal', color: '#8c7ae6',
                      traits: ["Curious","Versatile","Open","Full-of-potential"],
                      signatureMove: 'Swift', idealPartner: 'Pikachu',
                      desc: "Curious, warm, and carrying more potential than you've decided what to do with yet. You contain multitudes and you haven't picked your limits because you haven't had to." },
        vaporeon: { id: 134, typeId: 11, name: 'Vaporeon', type: 'Water', color: '#74b9ff',
                      traits: ["Fluid","Serene","Elegant","Adaptive"],
                      signatureMove: 'Water Gun', idealPartner: 'Dewgong',
                      desc: "Fluid, serene, and elegantly at home in your environment. You adapt without losing yourself and that balance is genuinely your superpower." },
        jolteon: { id: 135, typeId: 13, name: 'Jolteon', type: 'Electric', color: '#ffd32a',
                      traits: ["Sharp","High-strung","Electric","Reactive"],
                      signatureMove: 'Thunderbolt', idealPartner: 'Pikachu',
                      desc: "Sharp, high-strung, and operating at a frequency that most people find a little overwhelming. You process everything fast and you move even faster." },
        flareon: { id: 136, typeId: 10, name: 'Flareon', type: 'Fire', color: '#e17055',
                      traits: ["Passionate","Proud","Warm","Devoted"],
                      signatureMove: 'Flamethrower', idealPartner: 'Arcanine',
                      desc: "Passionate, warm, and deeply proud of what you love. You invest fully and that fire doesn't dim regardless of how long it burns." },
        porygon: { id: 137, typeId: 1, name: 'Porygon', type: 'Normal', color: '#fd79a8',
                      traits: ["Logical","Unique","Systematic","Precise"],
                      signatureMove: 'Zap Cannon', idealPartner: 'Magneton',
                      desc: "Logical, unique, and operating with a precision that most organic minds can't quite replicate. You are your own category entirely and that's exactly right." },
        omanyte: { id: 138, typeId: 6, name: 'Omanyte', type: 'Rock', color: '#74b9ff',
                      traits: ["Ancient","Patient","Methodical","Curious"],
                      signatureMove: 'Water Gun', idealPartner: 'Omastar',
                      desc: "Ancient, methodical, and carrying a patience built over time that most modern things simply don't have. You take what you need and you take your time." },
        omastar: { id: 139, typeId: 6, name: 'Omastar', type: 'Rock', color: '#0984e3',
                      traits: ["Wise","Ancient","Powerful","Deliberate"],
                      signatureMove: 'Hydro Pump', idealPartner: 'Kabutops',
                      desc: "Wise, ancient, and carrying the kind of depth that only comes from having been through more than most. You are deliberate in everything and it shows." },
        kabuto: { id: 140, typeId: 6, name: 'Kabuto', type: 'Rock', color: '#e2b96a',
                      traits: ["Tough","Survivalist","Ancient","Resilient"],
                      signatureMove: 'Slash', idealPartner: 'Omanyte',
                      desc: "Tough, ancient, and built for survival in conditions that most things couldn't handle. You've endured things that would end lesser versions of yourself." },
        kabutops: { id: 141, typeId: 6, name: 'Kabutops', type: 'Rock', color: '#2d3436',
                      traits: ["Fierce","Efficient","Predatory","Precise"],
                      signatureMove: 'Slash', idealPartner: 'Omastar',
                      desc: "Fierce, efficient, and absolutely precise when you act. No wasted motion, no second-guessing, just clean decisive action that gets it done." },
        aerodactyl: { id: 142, typeId: 6, name: 'Aerodactyl', type: 'Rock', color: '#7f8c8d',
                      traits: ["Wild","Prehistoric","Untameable","Fierce"],
                      signatureMove: 'Rock Slide', idealPartner: 'Dragonite',
                      desc: "Wild, prehistoric, and genuinely impossible to fully tame. You operate on raw instinct and you're faster to action than anything else in the room." },
        snorlax: { id: 143, typeId: 1, name: 'Snorlax', type: 'Normal', color: '#718093',
                      traits: ["Content","Comforting","Peaceful","Patient"],
                      signatureMove: 'Body Slam', idealPartner: 'Lapras',
                      desc: "Life is too short to stress about things you can't control. You know what you love, you protect your peace fiercely, and your presence is genuinely comforting to everyone around you." },
        articuno: { id: 144, typeId: 15, name: 'Articuno', type: 'Ice', color: '#74b9ff',
                      traits: ["Elegant","Rare","Composed","Solitary"],
                      signatureMove: 'Blizzard', idealPartner: 'Dragonite',
                      desc: "Rare, elegant, and composed in a way that makes most people feel like they're witnessing something they didn't deserve to see. You don't appear often, but when you do, it matters." },
        zapdos: { id: 145, typeId: 13, name: 'Zapdos', type: 'Electric', color: '#ffd32a',
                      traits: ["Legendary","Unpredictable","Powerful","Electrifying"],
                      signatureMove: 'Thunder', idealPartner: 'Articuno',
                      desc: "Unpredictable, electrifying, and carrying a power that you didn't ask for but have completely accepted. You arrive with a charge that changes the atmosphere." },
        moltres: { id: 146, typeId: 10, name: 'Moltres', type: 'Fire', color: '#e17055',
                      traits: ["Majestic","Passionate","Legendary","Blazing"],
                      signatureMove: 'Fire Blast', idealPartner: 'Zapdos',
                      desc: "Majestic, passionate, and burning with a heat that you were born to carry. You don't arrive quietly and you were never meant to." },
        dratini: { id: 147, typeId: 16, name: 'Dratini', type: 'Dragon', color: '#74b9ff',
                      traits: ["Gentle","Patient","Full-of-potential","Serene"],
                      signatureMove: 'Dragon Rage', idealPartner: 'Dragonair',
                      desc: "Gentle, patient, and carrying a potential that even you don't fully understand yet. You are quietly becoming something extraordinary." },
        dragonair: { id: 148, typeId: 16, name: 'Dragonair', type: 'Dragon', color: '#a29bfe',
                      traits: ["Graceful","Mysterious","Serene","Powerful"],
                      signatureMove: 'Dragon Pulse', idealPartner: 'Dratini',
                      desc: "Graceful, mysterious, and moving through the world with a quiet power that people notice but can't quite name. You carry yourself like something genuinely rare." },
        dragonite: { id: 149, typeId: 16, name: 'Dragonite', type: 'Dragon', color: '#f9ca24',
                      traits: ["Powerful","Gentle","Achieved","Wise"],
                      signatureMove: 'Dragon Claw', idealPartner: 'Charizard',
                      desc: "Powerful beyond what you started as, and gentle enough to know that power doesn't require performance. You've arrived at something real and you wear it well." },
        mewtwo: { id: 150, typeId: 14, name: 'Mewtwo', type: 'Psychic', color: '#9B59B6',
                      traits: ["Analytical","Complex","Solitary","Powerful"],
                      signatureMove: 'Psystrike', idealPartner: 'Mew',
                      desc: "You operate on a different frequency from most people, and you've long since stopped apologizing for it. Intensely analytical, deeply self-aware, and forging your own path entirely." },
        mew: { id: 151, typeId: 14, name: 'Mew', type: 'Psychic', color: '#ff7eb3',
                      traits: ["Playful","Rare","Curious","Mystical"],
                      signatureMove: 'Transform', idealPartner: 'Mewtwo',
                      desc: "Rare, playful, and carrying a curiosity about absolutely everything that never dims. You contain the origin of something and most people never get close enough to see it." }
      },

      questions: [
        { text: 'How do you actually start your morning?',
          answers: [
            { text: 'Up early, first out the door, already thinking about what I\'m conquering today', weights: {
                charizard: 3,
                zapdos: 1, moltres: 1, charmander: 1, mankey: 1, primeape: 1, arcanine: 1, machop: 1, machoke: 1, machamp: 1, ponyta: 1, rapidash: 1, farfetchd: 1
              } },
            { text: 'Slow and deliberate — I make tea, check my plants, ease in at my own pace', weights: {
                venusaur: 3,
                slowpoke: 2, starmie: 2, slowbro: 2, clefable: 2, jigglypuff: 2,
                psyduck: 1, golduck: 1, poliwag: 1, poliwrath: 1, abra: 1, alakazam: 1, seel: 1, dewgong: 1, shellder: 1, cloyster: 1, krabby: 1, kingler: 1
              } },
            { text: 'I lie awake running through every possible scenario before I even get up', weights: {
                mewtwo: 3,
                graveler: 2, golem: 2, onix: 2, voltorb: 2, rhyhorn: 2,
                kadabra: 1, magnemite: 1, magneton: 1, electrode: 1, mrMime: 1, electabuzz: 1, ditto: 1, eevee: 1, jolteon: 1, mew: 1, fearow: 1, raichu: 1
              } },
            { text: 'I wake up curious and excited — no alarm needed, every day feels like an adventure', weights: {
                pikachu: 3,
                tangela: 1, staryu: 1, tauros: 1, lapras: 1, vaporeon: 1, omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1, squirtle: 1, wartortle: 1, blastoise: 1
              } }
          ]
        },
        { text: 'Someone picks a fight with you. What happens next?',
          answers: [
            { text: 'I engage head-on — I\'m not here to back down from anyone', weights: {
                machamp: 3,
                ponyta: 2, rapidash: 2, chansey: 2, kangaskhan: 2, tauros: 2,
                hitmonchan: 1, magmar: 1, ditto: 1, eevee: 1, flareon: 1, porygon: 1, snorlax: 1, charmander: 1, charmeleon: 1, rattata: 1, raticate: 1, clefairy: 1
              } },
            { text: 'I try to understand both sides and find a peaceful resolution', weights: {
                lapras: 3,
                dewgong: 2, cloyster: 2, parasect: 2, weepinbell: 2, victreebel: 2,
                vileplume: 1, paras: 1, tangela: 1, horsea: 1, seadra: 1, goldeen: 1, seaking: 1, staryu: 1, jynx: 1, magikarp: 1, gyarados: 1, vaporeon: 1
              } },
            { text: 'I stay calm and dismantle their argument with logic until they\'ve got nothing left', weights: {
                alakazam: 3,
                drowzee: 2, hypno: 2, electrode: 2, exeggcute: 2, exeggutor: 2,
                electabuzz: 1, jolteon: 1, pikachu: 1, raichu: 1, persian: 1, magnemite: 1, magneton: 1, voltorb: 1, lickitung: 1, mrMime: 1, weezing: 1, pinsir: 1
              } },
            { text: 'I let them underestimate me, then pull the rug out when they least expect it', weights: {
                gengar: 3,
                haunter: 2, gastly: 2, nidorino: 2, grimer: 2, muk: 2,
                weedle: 1, kakuna: 1, beedrill: 1, nidoranF: 1, nidorina: 1, nidoqueen: 1, nidoranM: 1, nidoking: 1, oddish: 1, gloom: 1, venonat: 1, venomoth: 1
              } }
          ]
        },
        { text: 'How would your friends describe your social energy?',
          answers: [
            { text: 'The life of the party — I perform, I entertain, I make sure everyone\'s having a great time', weights: {
                jigglypuff: 3,
                tauros: 2, porygon: 2, pidgey: 2, pidgeotto: 2, clefable: 2,
                doduo: 1, chansey: 1, kangaskhan: 1, spearow: 1, wigglytuff: 1, meowth: 1, persian: 1, farfetchd: 1, dodrio: 1, lickitung: 1, pidgeot: 1, fearow: 1
              } },
            { text: 'Warm and steady — I show up, I listen, I\'m quietly the glue holding the group together', weights: {
                bulbasaur: 3,
                sandslash: 2, diglett: 2, dugtrio: 2, seel: 2, shellder: 2,
                marowak: 1, rhyhorn: 1, rhydon: 1, sandshrew: 1, paras: 1, parasect: 1, psyduck: 1, golduck: 1, poliwag: 1, poliwhirl: 1, poliwrath: 1, tentacool: 1
              } },
            { text: 'Selective — I\'d rather go deep with one person than skim the surface with a crowd', weights: {
                abra: 3,
                gengar: 2, mrMime: 2, jynx: 2, mewtwo: 2, mew: 2,
                alakazam: 1, kadabra: 1, gastly: 1, haunter: 1, drowzee: 1, hypno: 1, exeggcute: 1, exeggutor: 1, slowpoke: 1, slowbro: 1, starmie: 1, ninetales: 1
              } },
            { text: 'I adapt to whoever I\'m with — I can vibe with anyone in any room', weights: {
                eevee: 3,
                ditto: 2, snorlax: 2, rattata: 2, raticate: 2, clefairy: 2,
                ponyta: 1, rapidash: 1, goldeen: 1, seaking: 1, staryu: 1, magikarp: 1, lapras: 1, vaporeon: 1, flareon: 1, omanyte: 1, omastar: 1, kabuto: 1
              } }
          ]
        },
        { text: 'You just failed at something that really mattered to you. What do you do?',
          answers: [
            { text: 'I get angry, I push back, I train harder — failure just makes me more dangerous', weights: { primeape: 3, mankey: 2, machamp: 2, hitmonlee: 2, hitmonchan: 2, magmar: 2, kangaskhan: 1 } },
            { text: 'I take a long nap, eat something good, and come back to it when I\'m ready', weights: {
                snorlax: 3,
                eevee: 2, porygon: 2, pidgeot: 2, spearow: 2, fearow: 2,
                squirtle: 1, wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1, poliwag: 1, poliwhirl: 1, poliwrath: 1, seel: 1, dewgong: 1, shellder: 1, cloyster: 1
              } },
            { text: 'I analyze every step, find exactly where it went wrong, and build a better strategy', weights: {
                kadabra: 3,
                abra: 1, alakazam: 1, magnemite: 1, magneton: 1, hypno: 1, voltorb: 1, electrode: 1, electabuzz: 1, jolteon: 1, zapdos: 1, mewtwo: 1, mew: 1
              } },
            { text: 'I shapeshift — I become exactly what the situation needs next time', weights: {
                ditto: 3,
                rattata: 2, raticate: 2, clefable: 2, dodrio: 2, lickitung: 2,
                farfetchd: 1, doduo: 1, gastly: 1, haunter: 1, gengar: 1, pidgey: 1, pidgeotto: 1, clefairy: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1, persian: 1
              } }
          ]
        },
        { text: 'What is the thing you actually fear most?',
          answers: [
            { text: 'Being tamed — someone else controlling my path or putting out my fire', weights: {
                charmeleon: 3,
                dragonair: 2, dragonite: 2, vulpix: 2, ninetales: 2, growlithe: 2,
                charmander: 1, arcanine: 1, ponyta: 1, rapidash: 1, magmar: 1, moltres: 1, charizard: 1, cubone: 1, marowak: 1, hitmonchan: 1, weezing: 1, pidgeot: 1
              } },
            { text: 'Losing connection — being cut off from the people I love', weights: {
                slowbro: 3,
                mewtwo: 2, mew: 2, flareon: 2, dratini: 2,
                dewgong: 1, cloyster: 1, starmie: 1, jynx: 1, lapras: 1, drowzee: 1, articuno: 1, poliwag: 1, poliwhirl: 1, poliwrath: 1, tentacool: 1, tentacruel: 1
              } },
            { text: 'Being wrong — making a decision based on bad information and ruining everything', weights: {
                hypno: 3,
                abra: 2, kadabra: 2, alakazam: 2, slowpoke: 2, gastly: 2,
                mrMime: 1, exeggcute: 1, exeggutor: 1, mankey: 1, primeape: 1, machop: 1, machoke: 1, machamp: 1, magnemite: 1, magneton: 1, shellder: 1, krabby: 1
              } },
            { text: 'Being forgotten — invisible, irrelevant, fading into background noise', weights: {
                venomoth: 3,
                haunter: 2, gengar: 2, beedrill: 2, venonat: 2, weedle: 2,
                kakuna: 1, pinsir: 1, bulbasaur: 1, caterpie: 1, metapod: 1, paras: 1, bellsprout: 1, weepinbell: 1, victreebel: 1, grimer: 1, muk: 1, koffing: 1
              } }
          ]
        },
        { text: 'How do you handle your emotions when things get intense?',
          answers: [
            { text: 'I\'m an open book — you\'ll know exactly how I feel, immediately', weights: {
                mankey: 3,
                primeape: 2, machop: 2, machoke: 2, machamp: 2, hitmonlee: 2,
                arcanine: 1, ponyta: 1, rapidash: 1, hitmonchan: 1, magmar: 1, flareon: 1, moltres: 1, charmeleon: 1, vulpix: 1, ninetales: 1, poliwrath: 1, golbat: 1
              } },
            { text: 'I wear my heart on my sleeve — enthusiasm and affection first, always', weights: {
                growlithe: 3,
                eevee: 2, charmander: 2, charizard: 2, fearow: 2, clefairy: 2,
                lickitung: 1, chansey: 1, porygon: 1, snorlax: 1, pidgey: 1, rattata: 1, raticate: 1, spearow: 1, clefable: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1
              } },
            { text: 'I keep a composed exterior while carefully filing everything away for later', weights: {
                persian: 3,
                exeggcute: 2, kangaskhan: 2, jynx: 2, tauros: 2, ditto: 2,
                drowzee: 1, mewtwo: 1, mew: 1, abra: 1, kadabra: 1, alakazam: 1, farfetchd: 1, doduo: 1, hypno: 1, mrMime: 1, dodrio: 1, pidgeotto: 1
              } },
            { text: 'I drift away — I go somewhere quiet and process everything in private', weights: {
                gastly: 3,
                haunter: 2, gengar: 2, venonat: 2, bellsprout: 2, weepinbell: 2,
                bulbasaur: 1, ivysaur: 1, venusaur: 1, weedle: 1, beedrill: 1, ekans: 1, arbok: 1, nidoranF: 1, nidorina: 1, nidoranM: 1, nidorino: 1, oddish: 1
              } }
          ]
        },
        { text: 'What actually gets you out of bed and working toward something big?',
          answers: [
            { text: 'Proving people wrong — I remember every person who doubted me', weights: {
                hitmonlee: 3,
                charmeleon: 2, vulpix: 2, ninetales: 2, mankey: 2, primeape: 2,
                machop: 1, machoke: 1, machamp: 1, charmander: 1, growlithe: 1, arcanine: 1, ponyta: 1, rapidash: 1, hitmonchan: 1, magmar: 1, flareon: 1, moltres: 1
              } },
            { text: 'Protecting the people and things I love — I build so they never have to worry', weights: {
                dragonite: 3,
                gyarados: 2, aerodactyl: 2, articuno: 2, zapdos: 2, dratini: 2,
                dragonair: 1, butterfree: 1, doduo: 1, scyther: 1, charizard: 1, pidgey: 1, pidgeotto: 1, spearow: 1, zubat: 1, golbat: 1, farfetchd: 1, dodrio: 1
              } },
            { text: 'Curiosity — I need to understand how everything works, and build something no one\'s built before', weights: {
                porygon: 3,
                mrMime: 2, jynx: 2, mewtwo: 2, mew: 2, pikachu: 2,
                electabuzz: 1, jolteon: 1, raichu: 1, abra: 1, kadabra: 1, alakazam: 1, slowpoke: 1, slowbro: 1, magnemite: 1, magneton: 1, drowzee: 1, hypno: 1
              } },
            { text: 'The simple joy of it — I just genuinely love doing the thing', weights: {
                oddish: 3,
                vileplume: 2, bellsprout: 2, weepinbell: 2, victreebel: 2, koffing: 2,
                gloom: 1, bulbasaur: 1, ivysaur: 1, venusaur: 1, exeggcute: 1, exeggutor: 1, weezing: 1, tangela: 1, weedle: 1, kakuna: 1, beedrill: 1, ekans: 1
              } }
          ]
        },
        { text: 'Describe your ideal place to work or create.',
          answers: [
            { text: 'Minimal, wired in, completely silent — I need data and zero distraction', weights: {
                magneton: 3,
                magnemite: 2, voltorb: 2, electrode: 2, electabuzz: 2, jolteon: 2,
                pikachu: 1, raichu: 1, zapdos: 1, dugtrio: 1, poliwag: 1, machop: 1, machoke: 1, bellsprout: 1, weepinbell: 1, victreebel: 1, grimer: 1, muk: 1
              } },
            { text: 'Outside, open air, somewhere I can move around and keep an eye on everything', weights: {
                kangaskhan: 3,
                kingler: 2, lickitung: 2, chansey: 2, horsea: 2, seadra: 2,
                psyduck: 1, tentacool: 1, tentacruel: 1, seel: 1, dewgong: 1, shellder: 1, cloyster: 1, krabby: 1, goldeen: 1, seaking: 1, staryu: 1, tauros: 1
              } },
            { text: 'Surrounded by greenery, soft light, things growing — nature is my productivity hack', weights: {
                tangela: 3,
                parasect: 2, paras: 2, caterpie: 2, metapod: 2, kakuna: 2,
                pinsir: 1, bulbasaur: 1, ivysaur: 1, venusaur: 1, butterfree: 1, oddish: 1, gloom: 1, vileplume: 1, venomoth: 1, exeggcute: 1, exeggutor: 1, scyther: 1
              } },
            { text: 'Cozy chaos — snacks nearby, low lighting, I work best when I\'m completely comfortable', weights: {
                meowth: 3,
                clefairy: 2, persian: 2, growlithe: 2, arcanine: 2, ponyta: 2,
                vulpix: 1, eevee: 1, flareon: 1, porygon: 1, snorlax: 1, moltres: 1, charmander: 1, charmeleon: 1, rattata: 1, raticate: 1, clefable: 1, ninetales: 1
              } }
          ]
        },
        { text: 'You have a huge decision to make. How do you approach it?',
          answers: [
            { text: 'I go with my gut and move fast — hesitation is its own kind of mistake', weights: {
                aerodactyl: 3,
                omanyte: 2, kabuto: 2, kabutops: 2, butterfree: 2, pidgeot: 2,
                spearow: 1, fearow: 1, golbat: 1, graveler: 1, onix: 1, rhyhorn: 1, gyarados: 1, articuno: 1, dragonite: 1, charizard: 1, pidgey: 1, pidgeotto: 1
              } },
            { text: 'I research everything, build a model, run it against every scenario I can think of', weights: {
                omastar: 3,
                squirtle: 2, wartortle: 2, blastoise: 2, psyduck: 2, golduck: 2,
                geodude: 1, golem: 1, slowpoke: 1, slowbro: 1, seel: 1, shellder: 1, krabby: 1, kingler: 1, rhydon: 1, horsea: 1, seadra: 1, goldeen: 1
              } },
            { text: 'I ask five trusted people, gather their input, then sit with it until something feels right', weights: {
                exeggcute: 3,
                exeggutor: 2, tangela: 2, paras: 2, parasect: 2, mrMime: 2,
                starmie: 1, abra: 1, kadabra: 1, alakazam: 1, drowzee: 1, hypno: 1, jynx: 1, mewtwo: 1, mew: 1, sandshrew: 1, sandslash: 1, diglett: 1
              } },
            { text: 'I watch how other people react, then make a move that none of them saw coming', weights: {
                arbok: 3,
                bulbasaur: 2, ivysaur: 2, venusaur: 2, ekans: 2, nidoranF: 2,
                nidorina: 1, nidoranM: 1, nidorino: 1, oddish: 1, gloom: 1, vileplume: 1, venonat: 1, venomoth: 1, bellsprout: 1, weepinbell: 1, victreebel: 1, tentacruel: 1
              } }
          ]
        },
        { text: 'What\'s your sense of humor actually like?',
          answers: [
            { text: 'Electric and sharp — I\'m always looking for the perfect moment to land a great zinger', weights: {
                electabuzz: 3,
                raichu: 2, arcanine: 2, ponyta: 2, rapidash: 2, magnemite: 2,
                pikachu: 1, magneton: 1, voltorb: 1, electrode: 1, jolteon: 1, flareon: 1, zapdos: 1, charmander: 1, charizard: 1, magmar: 1, moltres: 1, hitmonlee: 1
              } },
            { text: 'Soft and wholesome — my humor makes people feel safe, not called out', weights: {
                wigglytuff: 3,
                farfetchd: 2, doduo: 2, dodrio: 2, lickitung: 2, chansey: 2,
                pidgey: 1, pidgeotto: 1, pidgeot: 1, rattata: 1, raticate: 1, clefairy: 1, clefable: 1, jigglypuff: 1, meowth: 1, persian: 1, kangaskhan: 1, tauros: 1
              } },
            { text: 'Dry and dark — I\'ll make a joke about things most people are afraid to touch', weights: {
                haunter: 3,
                gastly: 2, gengar: 2, grimer: 2, beedrill: 2, ekans: 2,
                bulbasaur: 1, weezing: 1, ivysaur: 1, nidorina: 1, nidoranM: 1, nidorino: 1, nidoking: 1, oddish: 1, gloom: 1, vileplume: 1, venonat: 1, venomoth: 1
              } },
            { text: 'Unpredictable and chaotic — I will absolutely commit to a bit until everyone is uncomfortable', weights: {
                ninetales: 3,
                mrMime: 2, charmeleon: 2, vulpix: 2, growlithe: 2, kadabra: 2,
                mew: 1, abra: 1, alakazam: 1, drowzee: 1, hypno: 1, exeggcute: 1, exeggutor: 1, mewtwo: 1, starmie: 1, jynx: 1, slowpoke: 1, slowbro: 1
              } }
          ]
        },
        { text: 'What completely drains your energy after too much of it?',
          answers: [
            { text: 'Being forced to be warm and social when I want to be left alone', weights: {
                cloyster: 3,
                dewgong: 2, lapras: 2, psyduck: 2, golduck: 2, poliwag: 2,
                seaking: 1, staryu: 1, jynx: 1, magikarp: 1, vaporeon: 1, articuno: 1, poliwhirl: 1, tentacruel: 1, slowpoke: 1, slowbro: 1, horsea: 1, seadra: 1
              } },
            { text: 'People who talk without listening and take up all the oxygen in the room', weights: {
                blastoise: 3,
                poliwrath: 2, seel: 2, shellder: 2, krabby: 2, kingler: 2,
                hitmonlee: 1, mankey: 1, primeape: 1, machop: 1, machoke: 1, machamp: 1, hitmonchan: 1, goldeen: 1, omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1
              } },
            { text: 'Standing still — I need movement, challenge, or I start to deteriorate', weights: {
                scyther: 3,
                butterfree: 2, charizard: 2, caterpie: 2, metapod: 2, pidgeotto: 2,
                venonat: 1, venomoth: 1, pinsir: 1, weedle: 1, kakuna: 1, beedrill: 1, pidgeot: 1, paras: 1, parasect: 1, dodrio: 1, gyarados: 1, aerodactyl: 1
              } },
            { text: 'Negativity, mess, and bad vibes — I absorb the energy of my environment completely', weights: {
                koffing: 3,
                ekans: 2, arbok: 2, nidoranF: 2, nidorina: 2, nidoranM: 2,
                venusaur: 1, nidoqueen: 1, nidorino: 1, nidoking: 1, zubat: 1, golbat: 1, oddish: 1, gloom: 1, vileplume: 1, bellsprout: 1, weepinbell: 1, victreebel: 1
              } }
          ]
        },
        { text: 'What is your relationship with rules and authority?',
          answers: [
            { text: 'Rules are suggestions — I operate by my own code, and it\'s a better one anyway', weights: {
                golbat: 3,
                zapdos: 2, moltres: 2, zubat: 2, dodrio: 2, haunter: 2,
                scyther: 1, aerodactyl: 1, articuno: 1, dragonite: 1, diglett: 1, geodude: 1, kingler: 1, electrode: 1, cubone: 1, marowak: 1, hitmonlee: 1, hitmonchan: 1
              } },
            { text: 'I respect structure — I built mine the right way and I expect the same from others', weights: {
                wartortle: 3,
                poliwrath: 2, squirtle: 2, blastoise: 2, psyduck: 2, golduck: 2,
                seaking: 1, staryu: 1, magikarp: 1, lapras: 1, kabutops: 1, mankey: 1, primeape: 1, poliwag: 1, poliwhirl: 1, machop: 1, machoke: 1, machamp: 1
              } },
            { text: 'I\'ll follow rules that make sense, but I need to understand the reason why first', weights: {
                vulpix: 3,
                clefable: 1, ninetales: 1, jigglypuff: 1, growlithe: 1, arcanine: 1, ponyta: 1, rapidash: 1, chansey: 1, kangaskhan: 1, magmar: 1, tauros: 1, ditto: 1
              } },
            { text: 'I disappear into the system so thoroughly that no one can track what I\'m doing', weights: {
                muk: 3,
                nidorino: 2, vileplume: 2, victreebel: 2, grimer: 2, koffing: 2,
                nidoranM: 1, nidoking: 1, oddish: 1, gloom: 1, venonat: 1, venomoth: 1, bellsprout: 1, weepinbell: 1, weezing: 1, bulbasaur: 1, ivysaur: 1, venusaur: 1
              } }
          ]
        },
        { text: 'In what way do people most consistently underestimate you?',
          answers: [
            { text: 'They see the easygoing exterior and have no idea how hard I can hit when I need to', weights: {
                machoke: 3,
                mankey: 2, primeape: 2, machop: 2, machamp: 2, onix: 2,
                hitmonchan: 1, poliwrath: 1, geodude: 1, graveler: 1, golem: 1, hitmonlee: 1, rhyhorn: 1, rhydon: 1, aerodactyl: 1, koffing: 1, seaking: 1, staryu: 1
              } },
            { text: 'They think I\'m soft, but I\'ve been quietly keeping score this whole time', weights: {
                chansey: 3,
                poliwhirl: 2, tentacool: 2, tentacruel: 2, seel: 2, shellder: 2,
                lickitung: 1, wigglytuff: 1, ditto: 1, eevee: 1, porygon: 1, snorlax: 1, rattata: 1, raticate: 1, clefairy: 1, clefable: 1, jigglypuff: 1, meowth: 1
              } },
            { text: 'They see the trophy, not the algorithm — they don\'t understand how I got there', weights: {
                starmie: 3,
                slowbro: 2, slowpoke: 2, squirtle: 2, wartortle: 2, blastoise: 2,
                magikarp: 1, lapras: 1, vaporeon: 1, golduck: 1, poliwag: 1, dewgong: 1, cloyster: 1, kingler: 1, gyarados: 1, mewtwo: 1, mew: 1, metapod: 1
              } },
            { text: 'They see my chaos and miss how deeply I\'m actually paying attention', weights: {
                psyduck: 3,
                abra: 2, kadabra: 2, alakazam: 2, drowzee: 2, hypno: 2,
                krabby: 1, exeggcute: 1, exeggutor: 1, horsea: 1, seadra: 1, goldeen: 1, mrMime: 1, jynx: 1, omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1
              } }
          ]
        },
        { text: 'What does loyalty actually mean to you?',
          answers: [
            { text: 'I run toward you, not away — when things get bad, I\'m the one showing up', weights: {
                arcanine: 3,
                ninetales: 2, ponyta: 2, rapidash: 2, kangaskhan: 2, magmar: 2,
                flareon: 1, charmander: 1, charmeleon: 1, vulpix: 1, growlithe: 1, tauros: 1, ditto: 1, eevee: 1, porygon: 1, snorlax: 1, rattata: 1, raticate: 1
              } },
            { text: 'It grows slowly — I\'m loyal to the people who earned it over years, not days', weights: {
                gloom: 3,
                oddish: 2, nidorino: 2, zubat: 2, golbat: 2, paras: 2,
                grimer: 1, muk: 1, koffing: 1, weezing: 1, tangela: 1, arbok: 1, nidoranF: 1, nidoranM: 1, gastly: 1, gengar: 1, exeggutor: 1, parasect: 1
              } },
            { text: 'I keep my promises and remember every single detail of what you\'ve shared with me', weights: {
                ekans: 3,
                nidoqueen: 2, nidoking: 2, bulbasaur: 2, ivysaur: 2, venusaur: 2,
                onix: 1, rhyhorn: 1, diglett: 1, dugtrio: 1, tentacool: 1, tentacruel: 1, graveler: 1, pinsir: 1, dratini: 1, dragonair: 1, mewtwo: 1, mew: 1
              } },
            { text: 'I protect you without being asked — it\'s instinct, not obligation', weights: {
                nidorina: 3,
                vileplume: 2, venomoth: 2, bellsprout: 2, weepinbell: 2, victreebel: 2,
                geodude: 1, golem: 1, haunter: 1, cubone: 1, marowak: 1, rhydon: 1, weedle: 1, kakuna: 1, beedrill: 1, sandshrew: 1, sandslash: 1, venonat: 1
              } }
          ]
        },
        { text: 'How do you feel about taking risks?',
          answers: [
            { text: 'I thrive on them — the higher the stakes, the more focused and alive I feel', weights: {
                dodrio: 3,
                spearow: 2, fearow: 2, farfetchd: 2, doduo: 2, pidgey: 2,
                pidgeotto: 1, pidgeot: 1, lickitung: 1, chansey: 1, scyther: 1, articuno: 1, moltres: 1, dragonite: 1, charizard: 1, butterfree: 1, wigglytuff: 1, persian: 1
              } },
            { text: 'I like calculated risks — I\'ll take the leap once I\'ve mapped the landing zone', weights: {
                poliwhirl: 3,
                poliwrath: 2, machop: 2, machoke: 2, hitmonlee: 2, hitmonchan: 2,
                mankey: 1, primeape: 1, machamp: 1, cloyster: 1, krabby: 1, kingler: 1, goldeen: 1, tentacool: 1, horsea: 1, seadra: 1, starmie: 1, weezing: 1
              } },
            { text: 'I\'ll risk it if the upside helps something bigger than me', weights: {
                tentacruel: 3,
                nidorino: 2, seaking: 2, staryu: 2, lapras: 2, dratini: 2,
                koffing: 1, bulbasaur: 1, ivysaur: 1, venusaur: 1, weedle: 1, kakuna: 1, beedrill: 1, ekans: 1, arbok: 1, nidoranF: 1, nidorina: 1, nidoqueen: 1
              } },
            { text: 'I\'d rather have a sure thing — I build slowly but I almost never lose what I\'ve built', weights: {
                poliwag: 3,
                magikarp: 2, vaporeon: 2, squirtle: 2, wartortle: 2, blastoise: 2,
                gyarados: 1, omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1, psyduck: 1, golduck: 1, slowpoke: 1, slowbro: 1, seel: 1, dewgong: 1, shellder: 1
              } }
          ]
        },
        { text: 'Someone publicly praises your work in front of a group. How do you react?',
          answers: [
            { text: 'I accept it gracefully — I worked hard for this and I\'m not going to fake modesty', weights: {
                fearow: 3,
                dodrio: 2, pidgey: 2, pidgeotto: 2, pidgeot: 2, spearow: 2,
                farfetchd: 1, doduo: 1, articuno: 1, zapdos: 1, dragonite: 1, charizard: 1, butterfree: 1, rattata: 1, raticate: 1, zubat: 1, golbat: 1, scyther: 1
              } },
            { text: 'I deflect immediately and redirect credit to everyone who helped me', weights: {
                ivysaur: 3,
                clefable: 2, jigglypuff: 2, wigglytuff: 2, oddish: 2, gloom: 2,
                tangela: 1, bulbasaur: 1, venusaur: 1, vileplume: 1, paras: 1, parasect: 1, persian: 1, bellsprout: 1, weepinbell: 1, victreebel: 1, ditto: 1, eevee: 1
              } },
            { text: 'I appreciate it but immediately start cataloguing what still needs to be better', weights: { golduck: 3, starmie: 2, alakazam: 2, jynx: 2, poliwag: 2, poliwhirl: 2 } },
            { text: 'Honestly? I love it. I beam. I remember it for months and it fuels me.', weights: {
                clefairy: 3,
                meowth: 2, lickitung: 2, chansey: 2, kangaskhan: 2, tauros: 2,
                porygon: 1, snorlax: 1, dratini: 1, dragonair: 1, ekans: 1, arbok: 1, sandshrew: 1, sandslash: 1, nidoranF: 1, nidorina: 1, nidoqueen: 1, nidoranM: 1
              } }
          ]
        },
        { text: 'How do you actually approach planning something important?',
          answers: [
            { text: 'Spreadsheets, timelines, contingencies — I map every single step before I move', weights: {
                hitmonchan: 3,
                mankey: 2, primeape: 2, poliwrath: 2, machop: 2, machoke: 2,
                hitmonlee: 1, machamp: 1, caterpie: 1, metapod: 1, nidorino: 1, vileplume: 1, paras: 1, parasect: 1, abra: 1, kadabra: 1, alakazam: 1, bellsprout: 1
              } },
            { text: 'I have a rough vision and I improvise everything else on the way there', weights: {
                graveler: 3,
                golem: 2, onix: 2, rhyhorn: 2, rhydon: 2, geodude: 2,
                nidoking: 1, aerodactyl: 1, sandshrew: 1, nidoqueen: 1, diglett: 1, dugtrio: 1, marowak: 1, sandslash: 1, cubone: 1, omanyte: 1, omastar: 1, kabuto: 1
              } },
            { text: 'I absorb every input I can find, then suddenly know what to do', weights: {
                magnemite: 3,
                magneton: 2, zapdos: 2, pikachu: 2, raichu: 2, voltorb: 2,
                electabuzz: 1, jolteon: 1, electrode: 1, pinsir: 1, dratini: 1, dragonite: 1, kakuna: 1, ekans: 1, arbok: 1, nidoranF: 1, nidorina: 1, nidoranM: 1
              } },
            { text: 'I talk it through with someone I trust until the plan feels right', weights: {
                rattata: 3,
                lickitung: 2, chansey: 2, kangaskhan: 2, tauros: 2, ditto: 2,
                clefairy: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1, persian: 1, eevee: 1, porygon: 1, snorlax: 1, raticate: 1, clefable: 1, farfetchd: 1, doduo: 1
              } }
          ]
        },
        { text: 'How much of yourself do you actually let people see?',
          answers: [
            { text: 'I let people in slowly — the real me takes time and trust to appear', weights: {
                onix: 3,
                geodude: 2, graveler: 2, golem: 2, rhyhorn: 2, rhydon: 2,
                aerodactyl: 1, sandslash: 1, diglett: 1, dugtrio: 1, cubone: 1, marowak: 1, omastar: 1, nidoqueen: 1, nidoking: 1, caterpie: 1, metapod: 1, pikachu: 1
              } },
            { text: 'I share everything openly — vulnerability is a feature, not a bug', weights: {
                vaporeon: 3,
                omanyte: 2, kabuto: 2, kabutops: 2, squirtle: 2, wartortle: 2,
                clefairy: 1, persian: 1, farfetchd: 1, doduo: 1, seel: 1, dewgong: 1, shellder: 1, cloyster: 1, krabby: 1, kingler: 1, lickitung: 1, chansey: 1
              } },
            { text: 'I\'m genuinely an open book — but most people don\'t ask the right questions', weights: {
                drowzee: 3,
                abra: 2, kadabra: 2, alakazam: 2, hypno: 2, exeggutor: 2,
                exeggcute: 1, starmie: 1, slowbro: 1, sandshrew: 1, machop: 1, machoke: 1, machamp: 1, gastly: 1, haunter: 1, gengar: 1, voltorb: 1, hitmonlee: 1
              } },
            { text: 'I show people what they want to see while keeping the real depths to myself', weights: { jynx: 3, mrMime: 2, articuno: 2, mewtwo: 2, mew: 2, slowpoke: 2 } }
          ]
        },
        { text: 'Someone challenges you to a direct competition. What do you feel?',
          answers: [
            { text: 'Pure excitement — finally, a chance to prove exactly what I\'m worth', weights: {
                tauros: 3,
                raticate: 2, jigglypuff: 2, wigglytuff: 2, meowth: 2, persian: 2,
                mankey: 1, primeape: 1, machop: 1, machoke: 1, machamp: 1, hitmonlee: 1, hitmonchan: 1, kangaskhan: 1, ditto: 1, eevee: 1, snorlax: 1, pidgey: 1
              } },
            { text: 'I study them first, find the gap, then act at exactly the right moment', weights: {
                seaking: 3,
                psyduck: 2, golduck: 2, poliwag: 2, poliwhirl: 2, tentacool: 2,
                omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1, weezing: 1, chansey: 1, pinsir: 1, dratini: 1, dragonair: 1
              } },
            { text: 'I turn it into performance — I want the win AND the crowd', weights: {
                electrode: 3,
                magneton: 2, electabuzz: 2, jolteon: 2, zapdos: 2, pikachu: 2,
                voltorb: 1, raichu: 1, magnemite: 1, charmeleon: 1, caterpie: 1, metapod: 1, vulpix: 1, ninetales: 1, growlithe: 1, abra: 1, kadabra: 1, alakazam: 1
              } },
            { text: 'I don\'t feel competitive — I just want everyone to grow and do their best', weights: {
                exeggutor: 3,
                exeggcute: 2, gloom: 2, paras: 2, parasect: 2, tangela: 2,
                mewtwo: 1, mew: 1, slowpoke: 1, drowzee: 1, hypno: 1, mrMime: 1, bulbasaur: 1, ivysaur: 1, venusaur: 1, oddish: 1, vileplume: 1, bellsprout: 1
              } }
          ]
        },
        { text: 'What\'s your relationship with patience and waiting?',
          answers: [
            { text: 'I\'m genuinely terrible at it — stillness feels like wasted momentum to me', weights: {
                voltorb: 3,
                magnemite: 2, magneton: 2, electrode: 2, electabuzz: 2, jolteon: 2,
                raichu: 1, pikachu: 1, zapdos: 1, abra: 1, kadabra: 1, alakazam: 1, tentacruel: 1, geodude: 1, graveler: 1, golem: 1, grimer: 1, muk: 1
              } },
            { text: 'I\'m patient about the big things — I\'ll wait a lifetime for what I actually want', weights: {
                dratini: 3,
                dragonair: 2, dragonite: 2, eevee: 2, porygon: 2, snorlax: 2,
                mewtwo: 1, mew: 1, charmander: 1, metapod: 1, diglett: 1, dugtrio: 1, mankey: 1, primeape: 1, growlithe: 1, arcanine: 1, machop: 1, machoke: 1
              } },
            { text: 'I use waiting time productively — I\'m always building even when I look still', weights: {
                staryu: 3,
                slowpoke: 2, starmie: 2, slowbro: 2, poliwhirl: 2, tentacool: 2,
                hypno: 1, krabby: 1, kingler: 1, exeggcute: 1, exeggutor: 1, horsea: 1, seadra: 1, goldeen: 1, seaking: 1, mrMime: 1, jynx: 1, magikarp: 1
              } },
            { text: 'I\'m almost too patient — I\'ll endure almost anything without complaint', weights: {
                seel: 3,
                dewgong: 2, cloyster: 2, lapras: 2, wartortle: 2, poliwag: 2,
                kabutops: 1, squirtle: 1, blastoise: 1, psyduck: 1, shellder: 1, vaporeon: 1, omanyte: 1, omastar: 1, kabuto: 1, articuno: 1, golduck: 1, poliwrath: 1
              } }
          ]
        },
        { text: 'How do you feel about time completely alone?',
          answers: [
            { text: 'It\'s sacred — I recharge by myself and I guard that time fiercely', weights: {
                clefable: 3,
                clefairy: 2, jigglypuff: 2, wigglytuff: 2, meowth: 2, persian: 2,
                chansey: 1, kangaskhan: 1, tauros: 1, ditto: 1, eevee: 1, porygon: 1, snorlax: 1, spearow: 1, fearow: 1, farfetchd: 1, doduo: 1, dodrio: 1
              } },
            { text: 'I feel it most keenly — solitude is where I process everything that\'s happened', weights: {
                cubone: 3,
                sandslash: 2, nidoqueen: 2, nidoking: 2, diglett: 2, dugtrio: 2,
                marowak: 1, sandshrew: 1, geodude: 1, graveler: 1, golem: 1, onix: 1, rhyhorn: 1, rhydon: 1, gloom: 1, vileplume: 1, paras: 1, parasect: 1
              } },
            { text: 'I love it, but I start to miss people after a while — I need both', weights: {
                dragonair: 3,
                dratini: 2, dragonite: 2, hitmonchan: 2, tangela: 2, pinsir: 2,
                pikachu: 1, raichu: 1, nidorino: 1, victreebel: 1, grimer: 1, lapras: 1, jolteon: 1, flareon: 1, omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1
              } },
            { text: 'Honestly, I can be alone indefinitely — I genuinely don\'t get lonely that easily', weights: {
                lickitung: 3,
                pidgey: 2, pidgeotto: 2, pidgeot: 2, rattata: 2, raticate: 2,
                muk: 1, magmar: 1, charmander: 1, charmeleon: 1, squirtle: 1, wartortle: 1, blastoise: 1, caterpie: 1, metapod: 1, weedle: 1, kakuna: 1, beedrill: 1
              } }
          ]
        },
        { text: 'Something you\'ve relied on for years suddenly changes. What do you do?',
          answers: [
            { text: 'I rage against it initially, then eventually adapt — but I\'m slow to let go', weights: {
                gyarados: 3,
                omanyte: 2, omastar: 2, kabuto: 2, kabutops: 2, aerodactyl: 2,
                poliwrath: 1, seel: 1, dewgong: 1, shellder: 1, staryu: 1, magikarp: 1, lapras: 1, squirtle: 1, wartortle: 1, spearow: 1, fearow: 1, poliwhirl: 1
              } },
            { text: 'I take time to mourn it, then rebuild deliberately and carefully', weights: {
                tentacool: 3,
                tentacruel: 2, muk: 2, krabby: 2, weezing: 2, seaking: 2,
                gengar: 1, koffing: 1, ekans: 1, arbok: 1, nidoranF: 1, oddish: 1, gloom: 1, venonat: 1, venomoth: 1, grimer: 1, cloyster: 1, gastly: 1
              } },
            { text: 'I find the angle in it — change usually creates opportunity if you move fast enough', weights: {
                goldeen: 3,
                vaporeon: 2, blastoise: 2, psyduck: 2, golduck: 2, poliwag: 2,
                kingler: 1, horsea: 1, seadra: 1, slowpoke: 1, slowbro: 1, starmie: 1, caterpie: 1, ninetales: 1, arcanine: 1, geodude: 1, graveler: 1, golem: 1
              } },
            { text: 'I barely notice — I was already moving in a different direction anyway', weights: {
                pidgeot: 3,
                dragonair: 2,
                pidgey: 1, pidgeotto: 1, farfetchd: 1, doduo: 1, dodrio: 1, clefable: 1, snorlax: 1, dragonite: 1, butterfree: 1, jigglypuff: 1, wigglytuff: 1, zubat: 1
              } }
          ]
        },
        { text: 'When you\'re the one in charge, how do you lead?',
          answers: [
            { text: 'With dominance — I set the direction and I expect everyone to move in it', weights: {
                nidoking: 3,
                nidoranF: 2, zubat: 2, golbat: 2, venonat: 2, venomoth: 2,
                tentacool: 1, caterpie: 1, metapod: 1, butterfree: 1, clefable: 1, vulpix: 1, ninetales: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1, persian: 1, mankey: 1
              } },
            { text: 'With quiet authority — I don\'t demand respect, I build it action by action', weights: {
                nidoqueen: 3,
                arbok: 2, nidorina: 2, nidoranM: 2, nidorino: 2, oddish: 2,
                weedle: 1, kakuna: 1, gloom: 1, vileplume: 1, bellsprout: 1, weepinbell: 1, victreebel: 1, haunter: 1, gengar: 1, venusaur: 1, beedrill: 1, ekans: 1
              } },
            { text: 'Through the environment — I set up systems so the right thing happens automatically', weights: {
                marowak: 3,
                rhydon: 2, hitmonchan: 2, tangela: 2, magmar: 2, pinsir: 2,
                sandshrew: 1, sandslash: 1, diglett: 1, dugtrio: 1, geodude: 1, graveler: 1, golem: 1, onix: 1, cubone: 1, rhyhorn: 1, bulbasaur: 1, ivysaur: 1
              } },
            { text: 'By example and genuine enthusiasm — I pull people forward because I believe so hard', weights: {
                grimer: 3,
                tentacruel: 2, muk: 2, gastly: 2, koffing: 2, weezing: 2,
                machamp: 1, magnemite: 1, magneton: 1, voltorb: 1, electrode: 1, hitmonlee: 1, mrMime: 1, jynx: 1, electabuzz: 1, jolteon: 1, kabutops: 1, dratini: 1
              } }
          ]
        },
        { text: 'What\'s the biggest misconception people have about you?',
          answers: [
            { text: 'That I\'m aggressive — I\'m actually just extremely direct and I don\'t apologize for it', weights: {
                pinsir: 3,
                metapod: 2, scyther: 2, butterfree: 2, weedle: 2, kakuna: 2,
                muk: 1, dragonair: 1, mewtwo: 1, mew: 1, pikachu: 1, raichu: 1, sandshrew: 1, sandslash: 1, clefable: 1, diglett: 1, dugtrio: 1, meowth: 1
              } },
            { text: 'That I\'m simple — there\'s a whole world running under the surface that nobody sees', weights: {
                slowpoke: 3,
                starmie: 2, slowbro: 2, goldeen: 2, staryu: 2, magikarp: 2,
                krabby: 1, squirtle: 1, wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1, poliwag: 1, poliwhirl: 1, poliwrath: 1, abra: 1, kadabra: 1, alakazam: 1
              } },
            { text: 'That I\'m cold — I\'m not cold, I\'m just precise about who gets the real me', weights: {
                magmar: 3,
                charmander: 2, charmeleon: 2, charizard: 2, vulpix: 2, ninetales: 2,
                flareon: 1, growlithe: 1, arcanine: 1, ponyta: 1, rapidash: 1, grimer: 1, gastly: 1, haunter: 1, gengar: 1, marowak: 1, lickitung: 1, koffing: 1
              } },
            { text: 'That I\'m fragile — I\'ve survived things quietly that would\'ve broken most people', weights: {
                caterpie: 3,
                beedrill: 1, paras: 1, parasect: 1, venonat: 1, venomoth: 1, venusaur: 1, rattata: 1, raticate: 1, spearow: 1, fearow: 1, ekans: 1, arbok: 1
              } }
          ]
        },
        { text: 'How do you approach hard, sustained work?',
          answers: [
            { text: 'I lock in completely — I can work for hours in a flow state without noticing time', weights: {
                kingler: 3,
                seaking: 2, staryu: 2, magikarp: 2, lapras: 2, vaporeon: 2,
                squirtle: 1, wartortle: 1, blastoise: 1, poliwag: 1, poliwhirl: 1, cloyster: 1, krabby: 1, horsea: 1, seadra: 1, goldeen: 1, starmie: 1, gyarados: 1
              } },
            { text: 'I chip away slowly and consistently — I\'m not fast, but I never stop', weights: {
                sandslash: 3,
                cubone: 2, marowak: 2, sandshrew: 2, nidoqueen: 2, nidoking: 2,
                dugtrio: 1, diglett: 1, geodude: 1, graveler: 1, golem: 1, onix: 1, rhyhorn: 1, rhydon: 1, raichu: 1, abra: 1, machamp: 1, magnemite: 1
              } },
            { text: 'I rally behind a deadline and do my best work under pressure', weights: {
                beedrill: 3,
                scyther: 1, pinsir: 1, caterpie: 1, metapod: 1, butterfree: 1, weedle: 1, kakuna: 1, paras: 1, parasect: 1, venonat: 1, venomoth: 1, zubat: 1
              } },
            { text: 'I need to feel inspired — I work incredibly hard on things I love, struggle with things I don\'t', weights: {
                charmander: 3,
                rapidash: 2, magmar: 2, flareon: 2, moltres: 2, charmeleon: 2,
                ponyta: 1, vulpix: 1, ninetales: 1, growlithe: 1, arcanine: 1, charizard: 1, magneton: 1, drowzee: 1, electrode: 1, hitmonlee: 1, tangela: 1, jynx: 1
              } }
          ]
        },
        { text: 'How do you think about personal growth and change?',
          answers: [
            { text: 'I\'m actively reinventing myself — I\'m not who I was last year and I like that', weights: {
                squirtle: 3,
                tentacool: 2, tentacruel: 2, seel: 2, shellder: 2, krabby: 2,
                wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1, poliwag: 1, poliwhirl: 1, poliwrath: 1, slowpoke: 1, slowbro: 1, dewgong: 1, cloyster: 1, kingler: 1
              } },
            { text: 'I grow through stillness — my biggest changes happen when I stop forcing things', weights: {
                metapod: 3,
                caterpie: 2, kakuna: 2, beedrill: 2, paras: 2, parasect: 2,
                cubone: 1, marowak: 1, rhyhorn: 1, rhydon: 1, seaking: 1, magmar: 1, magikarp: 1, lapras: 1, vaporeon: 1, jolteon: 1, flareon: 1, dratini: 1
              } },
            { text: 'I pursue growth deliberately — I have a system and I track my own progress', weights: {
                butterfree: 3,
                scyther: 2, pinsir: 2, gyarados: 2, articuno: 2, moltres: 2,
                dragonite: 1, charizard: 1, aerodactyl: 1, zapdos: 1, pidgey: 1, pidgeotto: 1, pidgeot: 1, spearow: 1, fearow: 1, zubat: 1, golbat: 1, farfetchd: 1
              } },
            { text: 'I grow through relationships — the right people push me to become something better', weights: { weedle: 3, venonat: 2, venomoth: 2, arbok: 2, nidorina: 2, nidoranM: 2 } }
          ]
        },
        { text: 'What does steady, incremental improvement mean to you?',
          answers: [
            { text: 'It\'s the whole game — I trust the compound effect more than any big breakthrough', weights: {
                kakuna: 3,
                pinsir: 2, caterpie: 2, metapod: 2, nidoranF: 2, nidoranM: 2,
                weedle: 1, beedrill: 1, venonat: 1, venomoth: 1, weepinbell: 1, victreebel: 1, muk: 1, gengar: 1, koffing: 1, weezing: 1, bulbasaur: 1, ivysaur: 1
              } },
            { text: 'I get restless with small gains — I want leaps, not steps', weights: {
                pidgey: 3,
                pidgeot: 2, spearow: 2, fearow: 2, farfetchd: 2, doduo: 2,
                dodrio: 1, kangaskhan: 1, tauros: 1, dragonite: 1, butterfree: 1, zubat: 1, golbat: 1, persian: 1, lickitung: 1, chansey: 1, scyther: 1, gyarados: 1
              } },
            { text: 'I value consistency, but I also need to know the destination is worth the grind', weights: {
                pidgeotto: 3,
                aerodactyl: 1, articuno: 1, clefable: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1, porygon: 1, zapdos: 1, moltres: 1, charizard: 1, rapidash: 1, onix: 1
              } },
            { text: 'I build habits and they carry me even on the days when motivation vanishes', weights: {
                raticate: 3,
                ditto: 2, eevee: 2, snorlax: 2, rattata: 2, clefairy: 2,
                bellsprout: 1, rhydon: 1, tangela: 1, horsea: 1, seadra: 1, electabuzz: 1, magmar: 1, magikarp: 1, lapras: 1, vaporeon: 1, jolteon: 1, flareon: 1
              } }
          ]
        },
        { text: 'How do you feel about your own personal space and boundaries?',
          answers: [
            { text: 'My territory is sacred — cross the line and you\'ll know about it fast', weights: {
                spearow: 3,
                farfetchd: 2, doduo: 2, dodrio: 2, pidgey: 2, pidgeotto: 2,
                pidgeot: 1, fearow: 1, dragonite: 1, rattata: 1, raticate: 1, clefairy: 1, clefable: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1, persian: 1, lickitung: 1
              } },
            { text: 'I enforce boundaries firmly but fairly — I respect yours and expect you to respect mine', weights: {
                raichu: 3,
                pikachu: 2, voltorb: 2, electrode: 2, electabuzz: 2, jolteon: 2,
                magnemite: 1, magneton: 1, zapdos: 1, cubone: 1, rhydon: 1, geodude: 1, golem: 1, grimer: 1, gastly: 1, haunter: 1, onix: 1, drowzee: 1
              } },
            { text: 'I\'m flexible — I adapt my space to whoever I\'m with and what the situation needs', weights: {
                sandshrew: 3,
                marowak: 2, sandslash: 2, nidoqueen: 2, nidoking: 2, diglett: 2,
                dugtrio: 1, graveler: 1, rhyhorn: 1, ponyta: 1, rapidash: 1, hitmonchan: 1, chansey: 1, tangela: 1, kangaskhan: 1, horsea: 1, seadra: 1, goldeen: 1
              } },
            { text: 'I struggle with them — I give people too much access and end up drained', weights: {
                nidoranF: 3,
                weedle: 2, ekans: 2, arbok: 2, nidorina: 2, nidoranM: 2,
                muk: 1, gengar: 1, koffing: 1, weezing: 1, nidorino: 1, zubat: 1, golbat: 1, bellsprout: 1, weepinbell: 1, victreebel: 1, tentacool: 1, tentacruel: 1
              } }
          ]
        },
        { text: 'How ambitious are you, honestly?',
          answers: [
            { text: 'Extremely — I have a specific vision of the top and I\'m working toward it relentlessly', weights: {
                nidoranM: 3,
                arbok: 2, nidorina: 2, golbat: 2, grimer: 2, muk: 2,
                hitmonchan: 1, tangela: 1, pinsir: 1, dratini: 1, dragonair: 1, charmeleon: 1, caterpie: 1, metapod: 1, pikachu: 1, sandshrew: 1, clefairy: 1, vulpix: 1
              } },
            { text: 'Ambitious in specific areas — deeply motivated where I care, completely detached elsewhere', weights: {
                nidorino: 3,
                nidoranF: 2, venonat: 2, venomoth: 2, bellsprout: 2, weepinbell: 2,
                gastly: 1, nidoking: 1, oddish: 1, haunter: 1, weedle: 1, kakuna: 1, beedrill: 1, ekans: 1, nidoqueen: 1, tentacruel: 1, tentacool: 1, primeape: 1
              } },
            { text: 'I drift into things and somehow end up succeeding — ambition feels like the wrong word', weights: {
                zubat: 3,
                gengar: 2, koffing: 2, weezing: 2, scyther: 2, gyarados: 2,
                aerodactyl: 1, articuno: 1, dragonite: 1, butterfree: 1, doduo: 1, moltres: 1, charizard: 1, pidgey: 1, pidgeotto: 1, pidgeot: 1, spearow: 1, fearow: 1
              } },
            { text: 'I want depth and meaning more than height — being the best isn\'t the goal, doing it well is', weights: {
                vileplume: 3,
                victreebel: 2, bulbasaur: 2, ivysaur: 2, venusaur: 2, gloom: 2,
                paras: 1, parasect: 1, exeggcute: 1, exeggutor: 1, dewgong: 1, onix: 1, krabby: 1, kingler: 1, voltorb: 1, hitmonlee: 1, rhyhorn: 1, rhydon: 1
              } }
          ]
        },
        { text: 'How do you handle boring, repetitive, or tedious work?',
          answers: [
            { text: 'I find a rhythm and let my mind wander — I can grind indefinitely', weights: {
                paras: 3,
                tangela: 2, scyther: 2, butterfree: 2, vileplume: 2, bellsprout: 2,
                oddish: 1, ivysaur: 1, gloom: 1, weepinbell: 1, victreebel: 1, exeggcute: 1, venusaur: 1, charmander: 1, charmeleon: 1, pikachu: 1, raichu: 1, nidoranF: 1
              } },
            { text: 'I automate or delegate it the moment I can — my energy is for bigger things', weights: {
                parasect: 3,
                caterpie: 2, metapod: 2, exeggutor: 2, pinsir: 2, bulbasaur: 2,
                dragonair: 1, dragonite: 1, mewtwo: 1, mew: 1, ponyta: 1, rapidash: 1, magnemite: 1, magneton: 1, drowzee: 1, hypno: 1, voltorb: 1, electrode: 1
              } },
            { text: 'I do it, but I\'m quietly miserable — I need the end goal visible to push through', weights: {
                venonat: 3,
                kakuna: 2, beedrill: 2, venomoth: 2, weedle: 2, grimer: 2,
                weezing: 1, zubat: 1, golbat: 1, tentacool: 1, tentacruel: 1, muk: 1, gastly: 1, haunter: 1, gengar: 1, koffing: 1, ekans: 1, arbok: 1
              } },
            { text: 'I turn it into a game or a competition with myself — tedium is a mindset, not a fact', weights: {
                diglett: 3,
                dugtrio: 2, sandshrew: 2, nidoking: 2, geodude: 2, golem: 2,
                nidoqueen: 1, marowak: 1, rhydon: 1, sandslash: 1, graveler: 1, onix: 1, cubone: 1, rhyhorn: 1, nidorina: 1, nidoranM: 1, nidorino: 1, clefairy: 1
              } }
          ]
        },
        { text: 'How physical or active are you day to day?',
          answers: [
            { text: 'Always moving — stillness makes me anxious and I need to use my body', weights: {
                dugtrio: 3,
                sandshrew: 2, cubone: 2, marowak: 2, sandslash: 2, nidoqueen: 2,
                diglett: 1, geodude: 1, graveler: 1, golem: 1, onix: 1, rhyhorn: 1, rhydon: 1, nidoking: 1, growlithe: 1, kadabra: 1, dratini: 1, dragonair: 1
              } },
            { text: 'Active when I need to be — I have deep reserves I haven\'t shown anyone yet', weights: {
                poliwrath: 3,
                machoke: 2, seel: 2, dewgong: 2, shellder: 2, cloyster: 2,
                seaking: 1, staryu: 1, magikarp: 1, vaporeon: 1, kingler: 1, lapras: 1, kabutops: 1, squirtle: 1, wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1
              } },
            { text: 'I prefer mental energy — physical action is a tool, not a state of being', weights: {
                machop: 3,
                hitmonlee: 2, hitmonchan: 2, mankey: 2, primeape: 2, machamp: 2,
                goldeen: 1, omanyte: 1, kabuto: 1, arbok: 1, nidoranF: 1, nidorina: 1, nidoranM: 1, nidorino: 1, vulpix: 1, venonat: 1, venomoth: 1, arcanine: 1
              } },
            { text: 'I take it as it comes — I can be a couch or a mountain, depending on the day', weights: {
                bellsprout: 3,
                ivysaur: 2, venusaur: 2, oddish: 2, gloom: 2, vileplume: 2,
                weepinbell: 1, victreebel: 1, paras: 1, parasect: 1, grimer: 1, muk: 1, gastly: 1, haunter: 1, gengar: 1, exeggcute: 1, exeggutor: 1, koffing: 1
              } }
          ]
        },
        { text: 'What does persistence look like for you?',
          answers: [
            { text: 'I keep going no matter what — obstacles don\'t stop me, they become part of the path', weights: { weepinbell: 3, bulbasaur: 2, ivysaur: 2, venusaur: 2, oddish: 2, gloom: 2 } },
            { text: 'I evolve my approach — I won\'t keep doing the same thing if it isn\'t working', weights: {
                victreebel: 3,
                weezing: 2, weedle: 2, kakuna: 2, beedrill: 2, ekans: 2,
                vileplume: 1, bellsprout: 1, nidorina: 1, nidorino: 1, zubat: 1, golbat: 1, grimer: 1, muk: 1, koffing: 1, tangela: 1, arbok: 1, nidoranF: 1
              } },
            { text: 'I rest without quitting — I know the difference between a break and giving up', weights: {
                geodude: 3,
                onix: 2, graveler: 2, rhyhorn: 2, rhydon: 2, sandshrew: 2,
                omanyte: 1, kabuto: 1, kabutops: 1, aerodactyl: 1, sandslash: 1, nidoqueen: 1, nidoking: 1, dragonair: 1, pikachu: 1, raichu: 1, mankey: 1, primeape: 1
              } },
            { text: 'I outlast everyone — I don\'t have the most energy, but I\'m still here at the end', weights: {
                golem: 3,
                omastar: 2, diglett: 2, dugtrio: 2, cubone: 2, marowak: 2,
                pinsir: 1, charmander: 1, charmeleon: 1, caterpie: 1, metapod: 1, butterfree: 1, parasect: 1, mrMime: 1, scyther: 1, electabuzz: 1, magmar: 1, tauros: 1
              } }
          ]
        },
        { text: 'How important is independence and freedom to you?',
          answers: [
            { text: 'Everything — I will sacrifice comfort, stability, and security to stay free', weights: {
                ponyta: 3,
                moltres: 2, dragonair: 2, electabuzz: 2, jolteon: 2, dratini: 2,
                charmeleon: 1, vulpix: 1, ninetales: 1, charizard: 1, voltorb: 1, electrode: 1, cubone: 1, hitmonlee: 1, hitmonchan: 1, koffing: 1, weezing: 1, tangela: 1
              } },
            { text: 'I value it but I also find freedom in commitment — roots and wings can coexist', weights: { rapidash: 3, growlithe: 2, arcanine: 2, magmar: 2, flareon: 2, charmander: 2 } },
            { text: 'I need enough independence to do things my way, not full isolation', weights: {
                farfetchd: 3,
                zapdos: 2, dragonite: 2, pikachu: 2, raichu: 2, sandslash: 2,
                gyarados: 1, scyther: 1, tauros: 1, ditto: 1, clefairy: 1, jigglypuff: 1, wigglytuff: 1, zubat: 1, golbat: 1, meowth: 1, horsea: 1, seadra: 1
              } },
            { text: 'I\'m honestly fine with structure — freedom without purpose is just wandering', weights: {
                doduo: 3,
                eevee: 2, porygon: 2, aerodactyl: 2, snorlax: 2, articuno: 2,
                dodrio: 1, pidgey: 1, pidgeotto: 1, pidgeot: 1, spearow: 1, fearow: 1, rattata: 1, raticate: 1, persian: 1, lickitung: 1, chansey: 1, kangaskhan: 1
              } }
          ]
        },
        { text: 'How do you protect yourself emotionally?',
          answers: [
            { text: 'I build walls — few people get past them, but those who do are trusted completely', weights: {
                dewgong: 3,
                cloyster: 2, lapras: 2, kingler: 2, horsea: 2, seadra: 2,
                articuno: 1, slowbro: 1, starmie: 1, jynx: 1, marowak: 1, pikachu: 1, raichu: 1, sandshrew: 1, sandslash: 1, voltorb: 1, electrode: 1, cubone: 1
              } },
            { text: 'I protect myself by staying useful — if I\'m needed, I feel safe', weights: { shellder: 3, seaking: 2, staryu: 2, magikarp: 2, gyarados: 2, vaporeon: 2 } },
            { text: 'I use humor to deflect anything that feels too heavy', weights: {
                krabby: 3,
                goldeen: 2, omanyte: 2, omastar: 2, kabuto: 2, kabutops: 2,
                squirtle: 1, wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1, poliwag: 1, poliwhirl: 1, poliwrath: 1, tentacool: 1, tentacruel: 1, seel: 1, slowpoke: 1
              } },
            { text: 'I protect myself by becoming unpredictable — if no one knows my patterns, no one can use them', weights: {
                weezing: 3,
                growlithe: 2, arcanine: 2, machop: 2, machoke: 2, machamp: 2,
                ekans: 1, arbok: 1, nidoranF: 1, nidorina: 1, nidoqueen: 1, nidoranM: 1, nidoking: 1, grimer: 1, muk: 1, gastly: 1, haunter: 1, gengar: 1
              } }
          ]
        },
        { text: 'You\'re deep into a long project. It\'s taking longer than expected. What do you do?',
          answers: [
            { text: 'I buckle down harder — the length of the road is proof the destination is worth it', weights: {
                rhyhorn: 3,
                omanyte: 2, omastar: 2, kabuto: 2, kabutops: 2, sandshrew: 2,
                marowak: 1, aerodactyl: 1, sandslash: 1, nidoqueen: 1, nidoking: 1, drowzee: 1, hypno: 1, hitmonlee: 1, mrMime: 1, electabuzz: 1, dratini: 1, mewtwo: 1
              } },
            { text: 'I revisit the plan, cut what isn\'t essential, and find a smarter path forward', weights: {
                rhydon: 3,
                geodude: 2, golem: 2, onix: 2, graveler: 2, cubone: 2,
                mankey: 1, primeape: 1, machop: 1, machoke: 1, magnemite: 1, magneton: 1, seel: 1, shellder: 1, cloyster: 1, gastly: 1, haunter: 1, gengar: 1
              } },
            { text: 'I look for the wonder in it — long projects are where the best discoveries happen', weights: {
                horsea: 3,
                magikarp: 2, vaporeon: 2, dragonair: 2, diglett: 2, dugtrio: 2,
                dewgong: 1, kingler: 1, goldeen: 1, seaking: 1, staryu: 1, lapras: 1, squirtle: 1, wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1, poliwag: 1
              } },
            { text: 'I phone a friend — I can push through anything if someone\'s there with me', weights: {
                seadra: 3,
                poliwhirl: 1, tentacool: 1, tentacruel: 1, krabby: 1, slowpoke: 1, slowbro: 1, starmie: 1, gyarados: 1, growlithe: 1, machamp: 1, weepinbell: 1, victreebel: 1
              } }
          ]
        },
        { text: 'Do you feel like you\'ve reached your potential yet?',
          answers: [
            { text: 'Absolutely not — I\'m still in the early chapters and the best is nowhere near written', weights: {
                mrMime: 3,
                drowzee: 2, jynx: 2, mewtwo: 2, mew: 2, abra: 2,
                hypno: 1, exeggcute: 1, exeggutor: 1, slowpoke: 1, slowbro: 1, starmie: 1, seaking: 1, bulbasaur: 1, ivysaur: 1, venusaur: 1, blastoise: 1, caterpie: 1
              } },
            { text: 'I tap into it in flashes — I\'ve seen what I can do and I\'m working to access it consistently', weights: {
                magikarp: 3,
                krabby: 2, kingler: 2, horsea: 2, seadra: 2, goldeen: 2,
                omanyte: 1, omastar: 1, kabuto: 1, kabutops: 1, poliwhirl: 1, poliwrath: 1, seel: 1, dewgong: 1, shellder: 1, cloyster: 1, staryu: 1, gyarados: 1
              } },
            { text: 'I keep finding new depths I didn\'t know existed — potential feels infinite', weights: {
                jolteon: 3,
                electrode: 2, raichu: 2, magnemite: 2, magneton: 2, voltorb: 2,
                pikachu: 1, electabuzz: 1, zapdos: 1, porygon: 1, snorlax: 1, dratini: 1, dragonair: 1, metapod: 1, paras: 1, parasect: 1, diglett: 1, dugtrio: 1
              } },
            { text: 'I feel settled in who I am — the work is refinement now, not discovery', weights: {
                flareon: 3,
                charmander: 2, charmeleon: 2, charizard: 2, vulpix: 2, ninetales: 2,
                growlithe: 1, arcanine: 1, ponyta: 1, rapidash: 1, magmar: 1, moltres: 1, mankey: 1, primeape: 1, kadabra: 1, alakazam: 1, machop: 1, machoke: 1
              } }
          ]
        },
        { text: 'What side of yourself do almost no one ever get to see?',
          answers: [
            { text: 'My tenderness — I care deeply and I\'m fiercely protective of the people I love', weights: {
                omanyte: 3,
                omastar: 2, poliwhirl: 2, poliwrath: 2, tentacool: 2, tentacruel: 2,
                seaking: 1, staryu: 1, starmie: 1, magikarp: 1, gyarados: 1, lapras: 1, vaporeon: 1, squirtle: 1, wartortle: 1, blastoise: 1, psyduck: 1, golduck: 1
              } },
            { text: 'My humor — I have an absolutely ridiculous inner life that almost no one sees', weights: { kabuto: 3, krabby: 2, kingler: 2, horsea: 2, seadra: 2, goldeen: 2, ditto: 1, eevee: 1 } },
            { text: 'My ambition — on the surface I seem easygoing, underneath I\'m tracking everything', weights: {
                kabutops: 3,
                rhyhorn: 2, rhydon: 2, aerodactyl: 2, geodude: 2, graveler: 2,
                golem: 1, onix: 1, rattata: 1, nidorino: 1, nidoking: 1, vulpix: 1, ninetales: 1, oddish: 1, gloom: 1, vileplume: 1, venonat: 1, venomoth: 1
              } },
            { text: 'My fear — I carry anxieties silently that would probably surprise everyone who knows me', weights: {
                articuno: 3,
                cloyster: 2, zubat: 2, golbat: 2, dewgong: 2, scyther: 2,
                jynx: 1, dragonite: 1, butterfree: 1, dodrio: 1, zapdos: 1, moltres: 1, pinsir: 1, dratini: 1, dragonair: 1, mewtwo: 1, mew: 1, caterpie: 1
              } }
          ]
        },
        { text: 'When do you feel most completely, undeniably yourself?',
          answers: [
            { text: 'In motion, at full speed, something important on the line', weights: {
                zapdos: 3,
                raichu: 2, magnemite: 2, magneton: 2, farfetchd: 2, doduo: 2,
                dodrio: 1, scyther: 1, gyarados: 1, pidgey: 1, pidgeotto: 1, sandshrew: 1, sandslash: 1, diglett: 1, dugtrio: 1, geodude: 1, graveler: 1, golem: 1
              } },
            { text: 'When I\'m creating or discovering something that didn\'t exist before I found it', weights: {
                moltres: 3,
                charizard: 2, arcanine: 2, flareon: 2, dragonite: 2, charmander: 2,
                aerodactyl: 1, articuno: 1, charmeleon: 1, butterfree: 1, pidgeot: 1, spearow: 1, fearow: 1, vulpix: 1, ninetales: 1, zubat: 1, golbat: 1, growlithe: 1
              } },
            { text: 'When I feel genuinely needed — when my presence makes a real difference', weights: {
                mew: 3,
                wigglytuff: 2, meowth: 2, persian: 2, alakazam: 2, exeggcute: 2,
                abra: 1, kadabra: 1, drowzee: 1, hypno: 1, exeggutor: 1, kangaskhan: 1, mrMime: 1, tauros: 1, ditto: 1, eevee: 1, porygon: 1, snorlax: 1
              } },
            { text: 'When I\'m electric and lit up and the right song is playing', weights: {
                pikachu: 3,
                ponyta: 2, rapidash: 2, cubone: 2, marowak: 2, hitmonlee: 2,
                electrode: 1, electabuzz: 1, jolteon: 1, voltorb: 1, hitmonchan: 1, tangela: 1, horsea: 1, seadra: 1, jynx: 1, pinsir: 1, magikarp: 1, vaporeon: 1
              } }
          ]
        },
        { text: 'At the end of a brutal stretch, what actually keeps you going?',
          answers: [
            { text: 'Stubbornness — I refuse to be the reason something doesn\'t happen', weights: {
                charizard: 3,
                moltres: 2, gyarados: 2, flareon: 2, aerodactyl: 2, articuno: 2,
                charmander: 1, charmeleon: 1, vulpix: 1, ninetales: 1, growlithe: 1, arcanine: 1, ponyta: 1, rapidash: 1, doduo: 1, dodrio: 1, scyther: 1, magmar: 1
              } },
            { text: 'A vision so specific and clear it feels like memory — I\'ve already seen myself there', weights: {
                mewtwo: 3,
                drowzee: 2, hypno: 2, exeggcute: 2, exeggutor: 2, starmie: 2,
                mrMime: 1, wartortle: 1, dugtrio: 1, mankey: 1, primeape: 1, machop: 1, machoke: 1, seel: 1, onix: 1, voltorb: 1, electrode: 1, cubone: 1
              } },
            { text: 'The love I have for the thing itself — if it matters, I find the energy', weights: {
                eevee: 3,
                ditto: 2, porygon: 2, snorlax: 2, rattata: 2, raticate: 2,
                lickitung: 1, chansey: 1, kangaskhan: 1, tauros: 1, pidgeot: 1, spearow: 1, fearow: 1, clefairy: 1, clefable: 1, jigglypuff: 1, wigglytuff: 1, meowth: 1
              } },
            { text: 'The people counting on me — I can\'t quit when someone else needs me not to', weights: {
                gengar: 3,
                gastly: 2, haunter: 2, muk: 2, koffing: 2, weezing: 2,
                ekans: 1, arbok: 1, nidoranF: 1, grimer: 1, ivysaur: 1, weedle: 1, kakuna: 1, beedrill: 1, nidorina: 1, nidoqueen: 1, nidoranM: 1, nidorino: 1
              } }
          ]
        },
        { text: 'Stripped of everything else, at your absolute core, you are…',
          answers: [
            { text: 'A protector — I exist to make sure the people and things I love are safe', weights: {
                snorlax: 3,
                clefable: 2, jigglypuff: 2, wigglytuff: 2, meowth: 2, persian: 2,
                lickitung: 1, chansey: 1, kangaskhan: 1, tauros: 1, ditto: 1, eevee: 1, porygon: 1, rattata: 1, raticate: 1, clefairy: 1, magnemite: 1, magneton: 1
              } },
            { text: 'A seeker — I need to know more, become more, understand more than I did yesterday', weights: { alakazam: 3, abra: 2, kadabra: 2, slowbro: 2, drowzee: 2, hypno: 2 } },
            { text: 'A transformer — I become what each moment needs and I\'m always changing', weights: {
                dragonite: 3,
                butterfree: 2, spearow: 2, fearow: 2, zubat: 2, golbat: 2,
                dratini: 1, dragonair: 1, articuno: 1, scyther: 1, aerodactyl: 1, zapdos: 1, moltres: 1, electabuzz: 1, vaporeon: 1, jolteon: 1, flareon: 1, omastar: 1
              } },
            { text: 'A force — something raw and unstoppable that most people only sense but never fully see', weights: {
                gyarados: 3,
                horsea: 2, seadra: 2, goldeen: 2, seaking: 2, staryu: 2,
                charizard: 1, squirtle: 1, pidgey: 1, pidgeotto: 1, pidgeot: 1, tentacool: 1, tentacruel: 1, farfetchd: 1, doduo: 1, dodrio: 1, seel: 1, shellder: 1
              } }
          ]
        }
      ]
    }
  }
};
