/* ═══════════════════════════════════════════════════════════════
   script.js — TechMaster Quiz
   All interactivity: starfield, confetti, quiz logic, results
   ═══════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────────
   1. STARFIELD ANIMATION
   Draws and animates small coloured dots on a <canvas> element
   to create a drifting star effect behind the UI.
───────────────────────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('stars');
  const ctx    = canvas.getContext('2d');
  let stars    = [];

  /** Resize canvas to fill the viewport and regenerate stars */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
  }

  /** Create 160 star objects with random position, velocity and colour */
  function init() {
    stars = [];
    for (let i = 0; i < 160; i++) {
      stars.push({
        x:   Math.random() * canvas.width,
        y:   Math.random() * canvas.height,
        r:   Math.random() * 1.5 + 0.3,           // radius
        vx:  (Math.random() - 0.5) * 0.15,        // horizontal drift
        vy:  (Math.random() - 0.5) * 0.15,        // vertical drift
        o:   Math.random() * 0.6 + 0.2,           // opacity
        // random hue — cyan, magenta, or blue-purple bias
        hue: Math.random() < 0.3 ? 180 + Math.random() * 60
           : Math.random() < 0.5 ? 300 + Math.random() * 40
           :                       220 + Math.random() * 30
      });
    }
  }

  /** Clear canvas, draw each star, advance positions, wrap edges */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 80%, 80%, ${s.o})`;
      ctx.fill();

      // move
      s.x += s.vx;
      s.y += s.vy;

      // wrap around edges
      if (s.x < 0)            s.x = canvas.width;
      if (s.x > canvas.width) s.x = 0;
      if (s.y < 0)            s.y = canvas.height;
      if (s.y > canvas.height) s.y = 0;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();


/* ─────────────────────────────────────────────────────────────
   2. CONFETTI BURST
   Launches colourful rectangles across the screen — shown when
   the player scores ≥ 75 %.
───────────────────────────────────────────────────────────── */
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  canvas.style.display = 'block';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const palette = ['#00f0ff','#ff3cac','#f9c74f','#80ffdb','#7b2fff','#00ff8c'];
  const pieces  = [];

  // Spawn 120 pieces at random positions above the fold
  for (let i = 0; i < 120; i++) {
    pieces.push({
      x:   Math.random() * canvas.width,
      y:   Math.random() * canvas.height - canvas.height,
      w:   Math.random() * 10 + 5,
      h:   Math.random() * 6  + 3,
      r:   Math.random() * Math.PI * 2,    // initial rotation
      dr:  Math.random() * 0.3 - 0.15,    // rotation speed
      vx:  Math.random() * 4 - 2,
      vy:  Math.random() * 4 + 2,         // falls downward
      col: palette[Math.floor(Math.random() * palette.length)],
      o:   1
    });
  }

  let frame = 0;

  function run() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle   = p.col;
      ctx.globalAlpha = p.o;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();

      // physics
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.dr;

      // fade out after frame 120
      if (frame > 120) p.o -= 0.012;
    });

    frame++;
    if (frame < 200) {
      requestAnimationFrame(run);
    } else {
      canvas.style.display = 'none'; // clean up
    }
  }

  run();
}


/* ─────────────────────────────────────────────────────────────
   3. QUESTION BANK
   50 questions across four categories.
   Each entry:  { cat, catClass, q, opts[], ans (index) }
───────────────────────────────────────────────────────────── */
const QUESTIONS = [
  /* ── Digital Basics (Q1–Q10) ──────────────────────────────── */
  { cat:'Digital Basics', catClass:'cat-data',
    q:"What is a bit?",
    opts:["Group of numbers","Binary value (0 or 1)","Voltage level","Memory block"],
    ans:1 },
  { cat:'Digital Basics', catClass:'cat-data',
    q:"1 byte equals:",
    opts:["4 bits","8 bits","16 bits","32 bits"],
    ans:1 },
  { cat:'Digital Basics', catClass:'cat-data',
    q:"TRUE in PLC means:",
    opts:["0","OFF","1","Error"],
    ans:2 },
  { cat:'Digital Basics', catClass:'cat-plc',
    q:"AND logic output is ON when:",
    opts:["Any input ON","All inputs ON","All inputs OFF","One input OFF"],
    ans:1 },
  { cat:'Digital Basics', catClass:'cat-plc',
    q:"OR logic output is ON when:",
    opts:["All OFF","Any one ON","All ON only","None"],
    ans:1 },
  { cat:'Digital Basics', catClass:'cat-plc',
    q:"NOT logic will:",
    opts:["Add","Reverse signal","Multiply","Store"],
    ans:1 },
  { cat:'Digital Basics', catClass:'cat-plc',
    q:"Series contacts in ladder represent:",
    opts:["OR","AND","NOT","Timer"],
    ans:1 },
  { cat:'Digital Basics', catClass:'cat-plc',
    q:"Parallel contacts represent:",
    opts:["AND","OR","NOT","Counter"],
    ans:1 },
  { cat:'Digital Basics', catClass:'cat-plc',
    q:"NC contact will conduct when:",
    opts:["Input ON","Input OFF","Always OFF","Always ON"],
    ans:1 },
  { cat:'Digital Basics', catClass:'cat-plc',
    q:"PLC mainly works on:",
    opts:["Analog only","Boolean logic","AC supply","Frequency"],
    ans:1 },

  /* ── PLC Fundamentals (Q11–Q20) ───────────────────────────── */
  { cat:'PLC', catClass:'cat-plc',
    q:"PLC continuously runs:",
    opts:["Voltage cycle","Scan cycle","Power cycle","Timer"],
    ans:1 },
  { cat:'PLC', catClass:'cat-plc',
    q:"Correct scan order:",
    opts:["Execute → Read → Write","Read → Execute → Write","Write → Execute → Read","Random"],
    ans:1 },
  { cat:'PLC', catClass:'cat-plc',
    q:"Data register stores:",
    opts:["Wires","Numbers","Voltage","Bits only"],
    ans:1 },
  { cat:'PLC', catClass:'cat-plc',
    q:"INT type stores:",
    opts:["Decimal","Whole numbers","Characters","Logic only"],
    ans:1 },
  { cat:'PLC', catClass:'cat-plc',
    q:"REAL type stores:",
    opts:["ON/OFF","Decimal values","Bits","Timer"],
    ans:1 },
  { cat:'PLC', catClass:'cat-plc',
    q:"Rising edge detects:",
    opts:["1 → 0","0 → 1","Constant signal","Noise"],
    ans:1 },
  { cat:'PLC', catClass:'cat-plc',
    q:"Falling edge detects:",
    opts:["0 → 1","1 → 0","No change","Always ON"],
    ans:1 },
  { cat:'PLC', catClass:'cat-plc',
    q:"Timer is used to:",
    opts:["Count","Delay action","Store value","Increase current"],
    ans:1 },
  { cat:'PLC', catClass:'cat-plc',
    q:"Counter is used to:",
    opts:["Delay","Count events","Convert signal","Amplify"],
    ans:1 },
  { cat:'PLC', catClass:'cat-plc',
    q:"If input is faster than scan time:",
    opts:["Always detected","May be missed","Stops PLC","Increases voltage"],
    ans:1 },

  /* ── Instrumentation & Signals (Q21–Q30) ──────────────────── */
  { cat:'Instrumentation', catClass:'cat-comp',
    q:"A transmitter does:",
    opts:["Supplies power","Converts physical value to signal","Stores data","Switches circuit"],
    ans:1 },
  { cat:'Instrumentation', catClass:'cat-comp',
    q:"Standard signal used in industry:",
    opts:["0–5V","4–20 mA","220V","12V"],
    ans:1 },
  { cat:'Instrumentation', catClass:'cat-comp',
    q:"4 mA represents:",
    opts:["Maximum","Minimum","Fault","Noise"],
    ans:1 },
  { cat:'Instrumentation', catClass:'cat-comp',
    q:"20 mA represents:",
    opts:["Minimum","Maximum","Zero","Error"],
    ans:1 },
  { cat:'Instrumentation', catClass:'cat-comp',
    q:"A transducer is used for:",
    opts:["Power","Signal conversion","Heat","Storage"],
    ans:1 },
  { cat:'Instrumentation', catClass:'cat-comp',
    q:"Isolation amplifier is used to:",
    opts:["Increase speed","Protect and isolate signal","Reduce voltage","Generate power"],
    ans:1 },
  { cat:'Instrumentation', catClass:'cat-comp',
    q:"Why is current signal preferred?",
    opts:["Cheap","Less noise effect","High voltage","Fast"],
    ans:1 },
  { cat:'Instrumentation', catClass:'cat-comp',
    q:"Shunt is used to:",
    opts:["Increase voltage","Measure current","Store energy","Reduce speed"],
    ans:1 },
  { cat:'Instrumentation', catClass:'cat-comp',
    q:"50A shunt gives approximately:",
    opts:["230V","75mV","10V","5V"],
    ans:1 },
  { cat:'Instrumentation', catClass:'cat-comp',
    q:"Transducer converts 75mV into:",
    opts:["230V","0–10V","50A","24V"],
    ans:1 },

  /* ── Electrical & Motors (Q31–Q50) ────────────────────────── */
  { cat:'Electrical', catClass:'cat-elec',
    q:"Voltage is:",
    opts:["Flow","Pressure","Heat","Resistance"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Current is:",
    opts:["Pressure","Flow of electrons","Voltage","Power"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Ohm's law:",
    opts:["V = I / R","V = I × R","I = V × R","R = I × V"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Current in wire creates:",
    opts:["Heat only","Magnetic field","Voltage","Resistance"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Motor works based on:",
    opts:["Heat","Magnetic force","Sound","Light"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"If current increases in motor:",
    opts:["Torque decreases","Torque increases","No change","Speed zero"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Rotor is:",
    opts:["Fixed","Rotating","Wire","Sensor"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Stator is:",
    opts:["Rotating","Fixed","Output","Coil only"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Motor converts:",
    opts:["Mechanical → Electrical","Electrical → Mechanical","Heat → Light","Voltage → Current"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Servo motor uses:",
    opts:["Open loop","Closed loop","Manual","No control"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Earthing is for:",
    opts:["Signal","Safety","Speed","Voltage"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Ground is:",
    opts:["Earth only","Reference point","Load","Supply"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Line voltage is:",
    opts:["Phase to neutral","Phase to phase","Neutral to earth","Ground"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Phase voltage is:",
    opts:["Phase to phase","Phase to neutral","Earth only","Ground"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Relation between line and phase voltage:",
    opts:["VL = VP","VL = √3 × VP","VP = 2 × VL","No relation"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Isolation prevents:",
    opts:["Speed","Damage & noise","Voltage","Current"],
    ans:1 },
  { cat:'PLC', catClass:'cat-plc',
    q:"PLC communication is used for:",
    opts:["Power","Data exchange","Heat","Light"],
    ans:1 },
  { cat:'PLC', catClass:'cat-plc',
    q:"Modbus is:",
    opts:["Motor","Protocol","Sensor","Voltage"],
    ans:1 },
  { cat:'PLC', catClass:'cat-plc',
    q:"Closed loop system means:",
    opts:["No feedback","Feedback present","Manual","Open system"],
    ans:1 },
  { cat:'Electrical', catClass:'cat-elec',
    q:"Correct working chain:",
    opts:["Current → Voltage","Voltage → Current → Magnetic → Motion","Motion → Current","Heat → Voltage"],
    ans:1 },
];


/* ─────────────────────────────────────────────────────────────
   4. APPLICATION STATE
───────────────────────────────────────────────────────────── */
let playerName  = '';           // entered on register screen
let answers     = new Array(50).fill(null); // null = unanswered
let currentQ    = 0;            // 0-based index of visible question
let timerInterval = null;       // setInterval handle
let timeLeft    = 1800;         // seconds remaining (30 min)
let quizStarted = false;        // prevents double-start


/* ─────────────────────────────────────────────────────────────
   5. LEADERBOARD — persisted via localStorage
───────────────────────────────────────────────────────────── */
/** Returns the stored leaderboard array, or [] on failure */
function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem('tm_lb') || '[]');
  } catch (e) {
    return [];
  }
}

/** Serialises and saves the leaderboard array */
function saveLeaderboard(lb) {
  try {
    localStorage.setItem('tm_lb', JSON.stringify(lb));
  } catch (e) { /* storage unavailable — silently ignore */ }
}


/* ─────────────────────────────────────────────────────────────
   6. SCREEN SWITCHING
   Hides all .screen elements then shows the requested one.
───────────────────────────────────────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}


/* ─────────────────────────────────────────────────────────────
   7. START QUIZ
   Reads player name, resets all state, shows quiz screen.
───────────────────────────────────────────────────────────── */
function startQuiz() {
  playerName  = document.getElementById('reg-name').value.trim() || 'Anonymous';
  answers     = new Array(50).fill(null);
  currentQ    = 0;
  timeLeft    = 1800;
  quizStarted = true;

  document.getElementById('display-name').textContent = playerName;

  showScreen('screen-quiz');
  buildNav();           // render 50 navigator dots
  renderQuestion(0);    // display first question
  startTimer();         // begin countdown
}


/* ─────────────────────────────────────────────────────────────
   8. TIMER
───────────────────────────────────────────────────────────── */
/** Starts (or restarts) the 1-second countdown interval */
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitQuiz();       // auto-submit when time runs out
    }
  }, 1000);
}

/** Formats seconds as MM:SS and applies danger class when ≤ 2 min */
function updateTimerDisplay() {
  const m  = Math.floor(timeLeft / 60);
  const s  = timeLeft % 60;
  const el = document.getElementById('timer-display');
  el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  el.classList.toggle('danger', timeLeft <= 120); // red flash below 2 min
}


/* ─────────────────────────────────────────────────────────────
   9. QUESTION NAVIGATOR DOTS
   One dot per question — shows answered/current state.
───────────────────────────────────────────────────────────── */
/** Create all 50 dot elements inside #q-nav */
function buildNav() {
  const nav = document.getElementById('q-nav');
  nav.innerHTML = '';

  for (let i = 0; i < 50; i++) {
    const dot    = document.createElement('div');
    dot.className = 'q-dot' + (i === 0 ? ' current' : '');
    dot.textContent = i + 1;
    dot.id          = `dot-${i}`;
    dot.onclick     = () => goToQ(i);
    nav.appendChild(dot);
  }
}

/** Refresh all dot classes to reflect current answer/position state */
function updateNav() {
  for (let i = 0; i < 50; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (!dot) continue;
    dot.className = 'q-dot';
    if (answers[i] !== null) dot.classList.add('answered');
    if (i === currentQ)      dot.classList.add('current');
  }
}

/** Jump directly to question index i */
function goToQ(i) {
  currentQ = i;
  renderQuestion(i);
}


/* ─────────────────────────────────────────────────────────────
   10. RENDER QUESTION
   Populates the question card with the data for question index i.
───────────────────────────────────────────────────────────── */
function renderQuestion(i) {
  const q       = QUESTIONS[i];
  const letters = ['A', 'B', 'C', 'D'];

  // -- Category badge
  const catEl = document.getElementById('q-cat');
  catEl.innerHTML =
    `<span class="cat-badge ${q.catClass}" style="font-size:10px;padding:4px 12px;">${q.cat}</span>`;

  // -- Question number + text
  document.getElementById('q-num').textContent  = `Question ${i + 1} of 50`;
  document.getElementById('q-text').textContent = q.q;

  // -- Clear any previous inline feedback
  const fb = document.getElementById('feedback-bar');
  fb.className  = 'feedback-bar';
  fb.textContent = '';

  // -- Build answer option buttons
  const container = document.getElementById('options-container');
  container.innerHTML = '';

  q.opts.forEach((optText, idx) => {
    const div = document.createElement('div');
    div.className = 'option';
    div.innerHTML =
      `<span class="option-letter">${letters[idx]}</span><span>${optText}</span>`;

    // Mark already-selected answer
    if (answers[i] === idx) div.classList.add('selected');

    div.onclick = () => selectAnswer(i, idx, div);
    container.appendChild(div);
  });

  // -- Progress bar
  const pct = ((i + 1) / 50) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `Question ${i + 1} of 50`;

  updateNav();
  updateLiveStats();
}


/* ─────────────────────────────────────────────────────────────
   11. SELECT ANSWER
   Records the player's choice and highlights the option.
───────────────────────────────────────────────────────────── */
function selectAnswer(qi, idx, clickedEl) {
  answers[qi] = idx;

  // Deselect all options then mark chosen one
  document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
  clickedEl.classList.add('selected');

  updateLiveStats();
  updateNav();
}

/** Recalculate and display live answered count + running score */
function updateLiveStats() {
  const answered = answers.filter(a => a !== null).length;
  document.getElementById('answered-count').textContent = answered;

  // Running score: 2 pts per correct
  const pts = answers.reduce((sum, a, i) => {
    return (a !== null && a === QUESTIONS[i].ans) ? sum + 2 : sum;
  }, 0);
  document.getElementById('score-live').textContent = pts;
}


/* ─────────────────────────────────────────────────────────────
   12. NAVIGATION (prev / next)
───────────────────────────────────────────────────────────── */
function navigate(dir) {
  const next = currentQ + dir;
  if (next >= 0 && next < 50) {
    currentQ = next;
    renderQuestion(next);
  }
}


/* ─────────────────────────────────────────────────────────────
   13. SUBMIT QUIZ
───────────────────────────────────────────────────────────── */
/** Ask for confirmation if there are unanswered questions */
function confirmSubmit() {
  const unanswered = answers.filter(a => a === null).length;
  if (unanswered > 0) {
    if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
  }
  submitQuiz();
}

/** Stop timer, calculate results, switch to results screen */
function submitQuiz() {
  clearInterval(timerInterval);
  quizStarted = false;
  buildResults();
  showScreen('screen-results');
}


/* ─────────────────────────────────────────────────────────────
   14. BUILD RESULTS
   Populates every section of the results screen.
───────────────────────────────────────────────────────────── */
function buildResults() {
  /* ── Totals ─────────────────────────────────────────────── */
  let correct = 0, wrong = 0, skip = 0;

  answers.forEach((a, i) => {
    if      (a === null)           skip++;
    else if (a === QUESTIONS[i].ans) correct++;
    else                           wrong++;
  });

  const score = correct * 2;
  const pct   = Math.round((correct / 50) * 100);

  // Populate hero numbers
  document.getElementById('result-score').textContent        = score;
  document.getElementById('result-name-display').textContent = playerName;
  document.getElementById('r-correct').textContent           = correct;
  document.getElementById('r-wrong').textContent             = wrong;
  document.getElementById('r-skip').textContent              = skip;
  document.getElementById('r-pct').textContent               = pct + '%';

  /* ── Grade / rank ────────────────────────────────────────── */
  let grade, emoji;
  if      (pct >= 90) { grade = 'S RANK — LEGENDARY';     emoji = '🏆'; }
  else if (pct >= 75) { grade = 'A RANK — EXCELLENT';     emoji = '⭐'; }
  else if (pct >= 60) { grade = 'B RANK — GOOD';          emoji = '👍'; }
  else if (pct >= 45) { grade = 'C RANK — AVERAGE';       emoji = '📘'; }
  else                { grade = 'D RANK — KEEP STUDYING'; emoji = '💪'; }

  const gradeEl = document.getElementById('result-grade');
  gradeEl.textContent   = grade;
  gradeEl.style.color   = pct >= 75 ? 'var(--neon3)' : pct >= 50 ? 'var(--neon1)' : 'var(--muted)';
  document.getElementById('result-emoji').textContent = emoji;

  // Confetti for good scores
  if (pct >= 75) launchConfetti();

  /* ── Per-category breakdown bars ────────────────────────── */
  const catDefs = ['Digital Basics', 'PLC', 'Instrumentation', 'Electrical'];
  const catColors = {
    'Digital Basics': 'var(--neon2)',
    'PLC':            'var(--neon5)',
    'Instrumentation':'var(--neon1)',
    'Electrical':     'var(--neon3)'
  };

  let bdHtml = '';
  catDefs.forEach(cat => {
    // Questions belonging to this category (with their original index)
    const catQs      = QUESTIONS.map((q, i) => ({ ...q, idx: i })).filter(q => q.cat === cat);
    const catCorrect = catQs.filter(q => answers[q.idx] === q.ans).length;
    const catTotal   = catQs.length;
    const catPct     = Math.round((catCorrect / catTotal) * 100);
    const colour     = catColors[cat];

    bdHtml += `
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:14px;font-weight:600;">${cat}</span>
          <span style="font-family:'Orbitron',monospace;font-size:12px;color:${colour};">
            ${catCorrect}/${catTotal} — ${catPct}%
          </span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${catPct}%;background:${colour};border-radius:3px;
               box-shadow:0 0 8px ${colour};transition:width 1s ease;"></div>
        </div>
      </div>`;
  });
  document.getElementById('cat-breakdown').innerHTML = bdHtml;

  /* ── Per-question answer review ─────────────────────────── */
  let reviewHtml = '';

  QUESTIONS.forEach((q, i) => {
    const a         = answers[i];
    const isCorrect = a === q.ans;
    const isSkip    = a === null;

    let cls     = 'r-skip',    tag = 'SKIPPED', tagCls = 'tag-skip';
    if (!isSkip) {
      cls    = isCorrect ? 'r-correct' : 'r-wrong';
      tag    = isCorrect ? 'CORRECT'   : 'WRONG';
      tagCls = isCorrect ? 'tag-correct' : 'tag-wrong';
    }

    reviewHtml += `
      <div class="review-item ${cls}">
        <div style="font-size:10px;font-family:'Orbitron',monospace;color:var(--muted);margin-bottom:6px;">
          ${q.cat} — Q${i + 1}
        </div>
        <div class="review-q">${q.q}</div>
        <div class="review-ans">
          <span class="tag ${tagCls}">${tag}</span>
          ${!isSkip
            ? `<span style="font-size:13px;color:var(--muted);">Your:
                 <strong style="color:${isCorrect ? 'var(--correct)' : 'var(--wrong)'};">
                   ${q.opts[a]}
                 </strong>
               </span>`
            : ''}
          ${!isCorrect
            ? `<span style="font-size:13px;color:var(--muted);">✓
                 <strong style="color:var(--correct);">${q.opts[q.ans]}</strong>
               </span>`
            : ''}
        </div>
      </div>`;
  });

  document.getElementById('answer-review').innerHTML = reviewHtml;

  /* ── Leaderboard ─────────────────────────────────────────── */
  const lb = getLeaderboard();
  lb.push({ name: playerName, score, pct, date: new Date().toLocaleDateString() });
  lb.sort((a, b) => b.score - a.score);     // descending by score
  const top20 = lb.slice(0, 20);            // keep only top 20
  saveLeaderboard(top20);
  renderLeaderboard(top20, playerName, score);
}


/* ─────────────────────────────────────────────────────────────
   15. RENDER LEADERBOARD
───────────────────────────────────────────────────────────── */
function renderLeaderboard(lb, myName, myScore) {
  const medalEmoji = ['🥇', '🥈', '🥉'];
  let html = '';

  // Table header row
  html += `
    <div class="lb-row"
         style="background:rgba(0,0,0,0.5);border-color:rgba(255,255,255,0.08);margin-bottom:12px;">
      <div style="font-family:'Orbitron',monospace;font-size:10px;color:var(--muted);text-align:center;">#</div>
      <div style="font-family:'Orbitron',monospace;font-size:10px;color:var(--muted);">PLAYER</div>
      <div style="font-family:'Orbitron',monospace;font-size:10px;color:var(--muted);text-align:center;">SCORE</div>
      <div style="font-family:'Orbitron',monospace;font-size:10px;color:var(--muted);text-align:center;">%</div>
    </div>`;

  if (lb.length === 0) {
    html = '<div style="text-align:center;color:var(--muted);padding:20px;">No scores yet. Be the first!</div>';
  } else {
    lb.forEach((entry, idx) => {
      const isMe    = (entry.name === myName && entry.score === myScore);
      const rankCls = idx === 0 ? 'rank1' : idx === 1 ? 'rank2' : idx === 2 ? 'rank3' : '';

      html += `
        <div class="lb-row ${rankCls} ${isMe ? 'me' : ''}">
          <div class="rank-num">${idx < 3 ? medalEmoji[idx] : idx + 1}</div>
          <div class="lb-name">
            ${entry.name}
            ${isMe ? '<span style="font-size:11px;color:var(--neon5);"> (YOU)</span>' : ''}
          </div>
          <div class="lb-score">${entry.score}</div>
          <div class="lb-pct">${entry.pct}%</div>
        </div>`;
    });
  }

  document.getElementById('leaderboard-list').innerHTML = html;
}


/* ─────────────────────────────────────────────────────────────
   16. TOGGLE ANSWER REVIEW
   Shows/hides the full per-question breakdown.
───────────────────────────────────────────────────────────── */
function toggleReview() {
  const el = document.getElementById('answer-review');
  el.style.display = (el.style.display === 'none') ? 'block' : 'none';
}


/* ─────────────────────────────────────────────────────────────
   17. RETAKE QUIZ
   Resets state and returns to the register screen,
   pre-filling the player's name.
───────────────────────────────────────────────────────────── */
function retake() {
  answers  = new Array(50).fill(null);
  currentQ = 0;
  timeLeft = 1800;
  document.getElementById('reg-name').value = playerName; // keep name
  showScreen('screen-register');
}
