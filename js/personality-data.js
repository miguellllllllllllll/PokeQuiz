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
      subtitle: '12 results · 16 questions',
      icon: '✨',
      color: '#ee1515',
      gradient: 'linear-gradient(135deg,#ee1515 0%,#ff6b35 100%)',
      desc: 'Find your true Kanto counterpart among 12 iconic Gen 1 Pokémon.',
      showcasePokemon: [25, 6, 94, 133],  // Pikachu · Charizard · Gengar · Eevee

      pokemon: {
        pikachu:    { id: 25,  typeId: 13, name: 'Pikachu',    type: 'Electric', color: '#F7B731',
                      traits: ['Energetic','Social','Brave','Loyal'],
                      signatureMove: 'Thunderbolt', idealPartner: 'Eevee',
                      desc: "You light up every room you walk into. Spirited, quick on your feet, and fiercely loyal, people gravitate toward your electric energy. You lead with heart and aren't afraid to spark a little chaos when the moment calls for it." },
        charizard:  { id: 6,   typeId: 10, name: 'Charizard',  type: 'Fire',     color: '#E84118',
                      traits: ['Ambitious','Passionate','Independent','Fierce'],
                      signatureMove: 'Flamethrower', idealPartner: 'Blastoise',
                      desc: "You burn bright and refuse to be contained. Ambitious and fearless, you set your own rules and chase your goals with an intensity that demands respect. You've earned every win the hard way, and everyone around you knows it." },
        bulbasaur:  { id: 1,   typeId: 12, name: 'Bulbasaur',  type: 'Grass',    color: '#4CD137',
                      traits: ['Calm','Nurturing','Reliable','Patient'],
                      signatureMove: 'Vine Whip', idealPartner: 'Squirtle',
                      desc: "Steady, grounded, and quietly dependable, you're the kind of person others lean on without even realising it. You grow at your own pace, and that deep-rooted patience is your greatest strength." },
        squirtle:   { id: 7,   typeId: 11, name: 'Squirtle',   type: 'Water',    color: '#0097e6',
                      traits: ['Cool','Adaptable','Focused','Thoughtful'],
                      signatureMove: 'Bubble Beam', idealPartner: 'Gengar',
                      desc: "Cool under pressure and always thinking two steps ahead. Your calm, methodical approach means you almost always come out on top when it matters most." },
        eevee:      { id: 133, typeId: 1,  name: 'Eevee',      type: 'Normal',   color: '#8c7ae6',
                      traits: ['Curious','Versatile','Friendly','Open-minded'],
                      signatureMove: 'Swift', idealPartner: 'Pikachu',
                      desc: "You contain multitudes. Curious, warm, and endlessly adaptable, you could thrive in almost any situation. Your greatest power is that you haven't decided your limits yet." },
        snorlax:    { id: 143, typeId: 1,  name: 'Snorlax',    type: 'Normal',   color: '#718093',
                      traits: ['Chill','Comforting','Patient','Content'],
                      signatureMove: 'Body Slam', idealPartner: 'Lapras',
                      desc: "Life is too short to stress about things you can't control. You know what you love, you protect your peace fiercely, and your presence is genuinely comforting to everyone around you." },
        gengar:     { id: 94,  typeId: 8,  name: 'Gengar',     type: 'Ghost',    color: '#8e44ad',
                      traits: ['Witty','Mischievous','Clever','Playful'],
                      signatureMove: 'Shadow Ball', idealPartner: 'Alakazam',
                      desc: "A darkly brilliant sense of humour and a knack for seeing what others miss. A bit of a trickster, sure, but underneath the chaos is a genuinely sharp mind and a surprisingly big heart." },
        mewtwo:     { id: 150, typeId: 14, name: 'Mewtwo',     type: 'Psychic',  color: '#9B59B6',
                      traits: ['Analytical','Independent','Powerful','Complex'],
                      signatureMove: 'Psystrike', idealPartner: 'Mew',
                      desc: "You operate on a different frequency. Intensely self-aware and endlessly analytical, you question everything and forge your own path. That rare depth sets you apart from almost everyone." },
        jigglypuff: { id: 39,  typeId: 18, name: 'Jigglypuff', type: 'Fairy',    color: '#fd79a8',
                      traits: ['Expressive','Creative','Sensitive','Bold'],
                      signatureMove: 'Sing', idealPartner: 'Pikachu',
                      desc: "You have a big personality and you're not afraid to use it. Deeply creative and emotionally tuned in, you feel everything fully. When you share that with the world, people cannot look away." },
        lapras:     { id: 131, typeId: 11, name: 'Lapras',     type: 'Water',    color: '#00b3cc',
                      traits: ['Gentle','Empathetic','Peaceful','Wise'],
                      signatureMove: 'Ice Beam', idealPartner: 'Snorlax',
                      desc: "You carry others with grace and warmth. Deeply empathetic and impossibly kind, you have a rare ability to make people feel truly seen. Still waters run deep, and yours run the deepest." },
        alakazam:   { id: 65,  typeId: 14, name: 'Alakazam',   type: 'Psychic',  color: '#e1b12c',
                      traits: ['Intellectual','Strategic','Precise','Focused'],
                      signatureMove: 'Psychic', idealPartner: 'Gengar',
                      desc: "Your mind moves faster than most people can follow. A natural strategist, you approach every problem with logic and precision, and you usually see the solution before anyone else understood the question." },
        machamp:    { id: 68,  typeId: 2,  name: 'Machamp',    type: 'Fighting', color: '#c0392b',
                      traits: ['Determined','Hardworking','Strong','Direct'],
                      signatureMove: 'Close Combat', idealPartner: 'Pikachu',
                      desc: "You don't make excuses, you make progress. Relentlessly hardworking and refreshingly straightforward, you tackle every challenge head-on. People can always count on you to show up." }
      },

      questions: [
        { text: "What's your ideal weekend?",
          answers: [
            { emoji:'🎉', text: "Big hangout — the more the merrier",            weights: { eevee:3, pikachu:2, jigglypuff:1 } },
            { emoji:'🏋️', text: "Pushing hard toward a personal goal",           weights: { charizard:3, machamp:2, pikachu:1 } },
            { emoji:'🛋️', text: "Recharging at home in total comfort",           weights: { snorlax:3, bulbasaur:2, lapras:1 } },
            { emoji:'🗺️', text: "Exploring somewhere new, alone",                weights: { mewtwo:3, alakazam:2, squirtle:1 } }
          ]
        },
        { text: "How do you handle conflict?",
          answers: [
            { emoji:'⚡', text: "Face it head-on — say exactly what I think",    weights: { machamp:3, charizard:2, pikachu:1 } },
            { emoji:'🤝', text: "Find a compromise that works for everyone",      weights: { bulbasaur:3, lapras:2, snorlax:1 } },
            { emoji:'🧠', text: "Outsmart it with a clever strategy",             weights: { alakazam:3, squirtle:2, mewtwo:1 } },
            { emoji:'😄', text: "Defuse it with humour before it escalates",      weights: { gengar:3, jigglypuff:2, pikachu:1 } }
          ]
        },
        { text: "Pick your ideal home vibe:",
          answers: [
            { emoji:'☕', text: "Cozy — warm lighting, snacks on every surface", weights: { snorlax:3, bulbasaur:2, lapras:1 } },
            { emoji:'🔬', text: "Sleek and minimal — everything has a purpose",   weights: { mewtwo:3, squirtle:2, alakazam:1 } },
            { emoji:'🎈', text: "Lively — always buzzing with people",            weights: { eevee:3, pikachu:2, jigglypuff:1 } },
            { emoji:'🌑', text: "Hidden away — mysterious and all mine",          weights: { mewtwo:3, gengar:2, alakazam:1 } }
          ]
        },
        { text: "Your squad has a big project. Your role?",
          answers: [
            { emoji:'📣', text: "Hype person — keeping morale sky-high",         weights: { pikachu:3, jigglypuff:2, machamp:1 } },
            { emoji:'💡', text: "Idea factory — creativity is my whole thing",   weights: { jigglypuff:3, gengar:2, eevee:1 } },
            { emoji:'📊', text: "Researcher — I need data before deciding",      weights: { squirtle:3, alakazam:2, mewtwo:1 } },
            { emoji:'💙', text: "The glue — no one gets left behind",            weights: { lapras:3, bulbasaur:2, eevee:1 } }
          ]
        },
        { text: "A friend is in trouble. You...",
          answers: [
            { emoji:'🚀', text: "Rush in — figure out the plan on the way",      weights: { charizard:3, machamp:2, pikachu:1 } },
            { emoji:'🔍', text: "Think it through carefully before acting",      weights: { squirtle:3, alakazam:2, mewtwo:1 } },
            { emoji:'📞', text: "Rally everyone — strength in numbers",          weights: { bulbasaur:3, lapras:2, eevee:1 } },
            { emoji:'🎭', text: "Find a clever angle nobody else considered",    weights: { lapras:3, gengar:2, mewtwo:1 } }
          ]
        },
        { text: "How do people usually describe you?",
          answers: [
            { emoji:'🌟', text: "The life of the party",                         weights: { jigglypuff:3, pikachu:2, gengar:1 } },
            { emoji:'🪨', text: "The reliable one everyone counts on",           weights: { bulbasaur:3, machamp:2, squirtle:1 } },
            { emoji:'🌑', text: "The mysterious one — hard to read",             weights: { mewtwo:3, gengar:2, alakazam:1 } },
            { emoji:'🎲', text: "The wildcard — anything could happen",          weights: { eevee:3, charizard:2, gengar:1 } }
          ]
        },
        { text: "Your relationship with rules?",
          answers: [
            { emoji:'📋', text: "They exist for a reason — I respect them",      weights: { squirtle:3, snorlax:2, machamp:1 } },
            { emoji:'🎨', text: "Rules box in creativity — I bend them freely",  weights: { charizard:3, jigglypuff:2, gengar:1 } },
            { emoji:'🔧', text: "Rules are tools — useful when they serve me",   weights: { alakazam:3, mewtwo:2, eevee:1 } },
            { emoji:'🌪️', text: "What rules? I chart my own course",             weights: { mewtwo:3, charizard:2, gengar:1 } }
          ]
        },
        { text: "What do you actually spend money on?",
          answers: [
            { emoji:'✈️', text: "Experiences — concerts, trips, adventures",     weights: { pikachu:3, eevee:2, charizard:1 } },
            { emoji:'🍕', text: "Food — you know exactly what you love",          weights: { snorlax:3, machamp:2, bulbasaur:1 } },
            { emoji:'📚', text: "Books, gadgets, or courses to level up",         weights: { alakazam:3, mewtwo:2, squirtle:1 } },
            { emoji:'🎵', text: "Art, music, and creative projects",              weights: { jigglypuff:3, gengar:2, lapras:1 } }
          ]
        },
        { text: "Pick an element that calls to you:",
          answers: [
            { emoji:'🔥', text: "Fire — passion, power, transformation",         weights: { charizard:3, machamp:2, pikachu:1 } },
            { emoji:'🌊', text: "Water — calm, flow, depth",                     weights: { squirtle:3, lapras:2, snorlax:1 } },
            { emoji:'🌿', text: "Earth — stability, growth, patience",           weights: { bulbasaur:3, snorlax:2, lapras:1 } },
            { emoji:'⚡', text: "Lightning — raw energy and a sharp mind",       weights: { pikachu:3, alakazam:2, mewtwo:1 } }
          ]
        },
        { text: "Your biggest fear is...",
          answers: [
            { emoji:'💤', text: "Wasting potential by standing still",           weights: { machamp:3, charizard:2, pikachu:1 } },
            { emoji:'💔', text: "Being misunderstood or left out",               weights: { eevee:3, jigglypuff:2, lapras:1 } },
            { emoji:'🎛️', text: "Losing control of a situation",                 weights: { mewtwo:3, alakazam:2, squirtle:1 } },
            { emoji:'😴', text: "Total boredom with zero surprises",             weights: { gengar:3, eevee:2, pikachu:1 } }
          ]
        },
        { text: "What energy do you bring?",
          answers: [
            { emoji:'⚡', text: "High-voltage — always moving, always doing",    weights: { machamp:3, pikachu:2, charizard:1 } },
            { emoji:'🌊', text: "Steady and consistent — never burned out",      weights: { bulbasaur:3, squirtle:2, lapras:1 } },
            { emoji:'😌', text: "Totally chill — why rush anything?",            weights: { snorlax:3, lapras:2, eevee:1 } },
            { emoji:'🌀', text: "Intense bursts followed by deep rest",          weights: { gengar:3, mewtwo:2, alakazam:1 } }
          ]
        },
        { text: "One last move — what's it gonna be?",
          answers: [
            { emoji:'💥', text: "A massive, flashy signature attack",            weights: { charizard:3, machamp:2, pikachu:1 } },
            { emoji:'✨', text: "A gentle move that heals or protects",          weights: { lapras:3, bulbasaur:2, jigglypuff:1 } },
            { emoji:'🎯', text: "A calculated, perfectly-timed strike",          weights: { squirtle:3, alakazam:2, mewtwo:1 } },
            { emoji:'👻', text: "A sneaky trick nobody saw coming",              weights: { gengar:3, eevee:2, mewtwo:1 } }
          ]
        },
        { text: "How do you recharge after a completely draining day?",
          answers: [
            { emoji:'😴', text: "Sleep as long as possible — rest is non-negotiable",weights: { snorlax:3, lapras:2, bulbasaur:1 } },
            { emoji:'📖', text: "Quiet time alone — reading, thinking, absorbing",  weights: { alakazam:3, mewtwo:2, squirtle:1 } },
            { emoji:'🎤', text: "Creating something — music, art, anything expressive", weights: { jigglypuff:3, gengar:2, eevee:1 } },
            { emoji:'🏋️', text: "A physical challenge to clear out the mental fog", weights: { machamp:3, charizard:2, pikachu:1 } }
          ]
        },
        { text: "What do you need most to feel truly at home?",
          answers: [
            { emoji:'🤗', text: "Warmth and consistent connection with people I love", weights: { eevee:3, lapras:2, bulbasaur:1 } },
            { emoji:'🔥', text: "Shared ambition — people who push me to grow",       weights: { machamp:3, charizard:2, pikachu:1 } },
            { emoji:'🎭', text: "Freedom to be genuinely, weirdly myself",            weights: { gengar:3, jigglypuff:2, eevee:1 } },
            { emoji:'🧘', text: "Comfortable silence — no performance required",      weights: { snorlax:3, mewtwo:2, alakazam:1 } }
          ]
        },
        { text: "People who really know you would say you're actually...",
          answers: [
            { emoji:'💛', text: "Much kinder and softer than you appear",            weights: { gengar:3, mewtwo:2, charizard:1 } },
            { emoji:'🔥', text: "Far more driven and competitive than you let on",   weights: { eevee:3, snorlax:2, jigglypuff:1 } },
            { emoji:'🧠', text: "Deeper and more thoughtful than people first expect",weights: { alakazam:3, lapras:2, squirtle:1 } },
            { emoji:'🌟', text: "Just as joyful and genuine as you always seem",     weights: { pikachu:3, bulbasaur:2, lapras:1 } }
          ]
        },
        { text: "The journey's almost over. What actually kept you going?",
          answers: [
            { emoji:'❤️', text: "The people counting on me — I don't let them down", weights: { lapras:3, bulbasaur:2, eevee:1 } },
            { emoji:'🏆', text: "Proving something to myself more than anyone else",  weights: { charizard:3, machamp:2, mewtwo:1 } },
            { emoji:'💫', text: "Pure stubbornness — I simply don't know how to stop",weights: { squirtle:3, pikachu:2, alakazam:1 } },
            { emoji:'🎉', text: "Honestly? The whole thing was fun from start to finish",weights: { jigglypuff:3, gengar:2, snorlax:1 } }
          ]
        }
      ]
    }
  }
};
