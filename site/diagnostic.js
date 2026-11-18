/*
  Diagnostic libéral: 64 questions shown one at a time, scored in the browser.

  Scoring is the one of the original index.php (churchofzer.com/Diagnostic), with two typos fixed (see QUESTIONS):
  each answer adds one to a letter a…p, then
    b + 2c + 3d  < 13 → collectiviste, < 26 → étatiste acharné, < 39 → étatiste qui s'ignore
    f + 2g + 3h  < 32 → libéral conservateur
    j + 2k + 3l  < 54 → minarchiste
    otherwise anarcho-capitaliste, and n + 2o + 3p > 40 adds the "extrémiste" line.
  Answers stay in the visitor's browser (localStorage); nothing is sent anywhere.
*/
(() => {
  'use strict';

  const OPTIONS = ['Pas du tout', 'Pas vraiment', 'Plutôt, oui', 'Tout à fait'];

  // [question, letter scored for each option above], in the original order.
  // Two typos of the old index.php are corrected here (November 2026):
  //   29: was 'lkij' (« Plutôt, oui » and « Tout à fait » swapped), now 'lkji' like the rest of its group
  //   32: was 'icba' (« Pas du tout » scored i), now 'dcba'
  const QUESTIONS = [
    ['Les impôts sont-ils trop peu élevés ?', 'dcba'],
    ['Les clubs privés devraient-ils avoir seuls autorité sur le choix de leurs membres, même s’ils sont discriminatoires ?', 'abcd'],
    ['L’administration devrait-elle conserver la plus grande part des terrains publics ?', 'hgfe'],
    ['Êtes-vous favorable au libre-échange ?', 'efgh'],
    ['La réglementation sur la sûreté du travail est-elle trop peu contraignante ?', 'dcba'],
    ['Le salaire minimum devrait-il être aboli ?', 'efgh'],
    ['La justice elle-même devrait-elle être privatisée ?', 'mnop'],
    ['Les relations sexuelles entre adultes consentants devraient-elles être réglementées ?', 'dcba'],
    ['Devrions-nous conserver les lois anti-trust ?', 'lkji'],
    ['Intervenons-nous trop dans les autres pays ?', 'efgh'],
    ['Devrions-nous conserver le caractère public des écoles et des universités ?', 'lkji'],
    ['Toute administration est-elle un mal nécessaire ?', 'ponm'],
    ['Le Conseil constitutionnel devrait-il sanctionner toute réglementation économique comme inconstitutionnelle ?', 'ijkl'],
    ['Est-il légitime d’imposer une autorisation professionnelle aux docteurs, notaires, pharmaciens et autres ?', 'dcba'],
    ['La police devrait-elle être privatisée ?', 'mnop'],
    ['Devrait-on assouplir les lois sur l’immigration ?', 'dcba'],
    ['La bureaucratie devrait-elle être conservée ?', 'ponm'],
    ['Les dépenses étatiques sont-elles trop peu élevées ?', 'dcba'],
    ['Si le pays devait être en guerre, devrait-il faire plus en sorte d’éviter les cibles civiles ?', 'abcd'],
    ['Les agréments médicaux et pharmaceutiques devraient-ils être conservés ?', 'lkji'],
    ['Le budget militaire devrait-il être réduit d’au moins 75 % ?', 'ijkl'],
    ['Devrions-nous conserver l’Assurance Maladie ?', 'lkji'],
    ['Les tribunaux devraient-ils être privatisés ?', 'mnop'],
    ['Un pays devrait-il refuser de payer pour la défense de ses alliés assez riches pour se défendre eux-mêmes ?', 'abcd'],
    ['Devrions-nous conserver La Poste comme société publique ?', 'hgfe'],
    ['Toutes les taxes et impôts devraient-ils être abolis ?', 'mnop'],
    ['Les lois sur l’immigration devraient-elles être conservées ?', 'lkji'],
    ['Le contrôle des loyers devrait-il être maintenu ?', 'hgfe'],
    ['Conserveriez-vous au moins la moitié des administrations existantes ?', 'lkji'],
    ['Croyez-vous en la liberté d’expression pour les livres, les journaux, à la radio, à la télévision, sur Internet, etc. même pour des sujets ou vues insultants ou impopulaires ?', 'abcd'],
    ['Devrait-on baisser les impôts de 50 % ou plus ?', 'ijkl'],
    ['L’administration dépense-t-elle trop peu pour l’éducation supérieure ?', 'dcba'],
    ['Les plans d’urbanisme sont-ils trop peu contraignants ?', 'hgfe'],
    ['Pensez-vous qu’on dépense trop peu pour les programmes anti-pauvreté ?', 'dcba'],
    ['La France devrait-elle se maintenir complètement en Afrique, en Europe et toutes ses bases à l’étranger ?', 'lkji'],
    ['Devrait-on privatiser routes et autoroutes ?', 'mnop'],
    ['L’administration est-elle en fait l’exploitation des membres productifs de la société au profit d’une classe dirigeante parasite ?', 'mnop'],
    ['L’État devrait-il être désarmé et son armée démantelée ?', 'mnop'],
    ['Est-il moralement admissible d’exercer une justice vigilante, même envers les membres du gouvernement ?', 'mnop'],
    ['Devrions-nous conserver la Sécurité sociale ?', 'lkji'],
    ['Devrions-nous conserver l’État-providence ?', 'lkji'],
    ['Le budget militaire devrait-il être réduit ?', 'abcd'],
    ['Êtes-vous contre la conscription / le service national ?', 'abcd'],
    ['Dépensons-nous trop peu pour l’Assurance Maladie ?', 'dcba'],
    ['La banque centrale devrait-elle être abolie et remplacée par un système de banques privées et de monnaie libre ?', 'mnop'],
    ['La marijuana devrait-elle être réglementée ?', 'hgfe'],
    ['Devrait-on supprimer tous les pouvoirs discrétionnaires de la banque centrale et figer la masse monétaire ?', 'lkji'],
    ['Toute bureaucratie / pouvoir politique est-il naturellement bon ?', 'ponm'],
    ['La banque centrale a-t-elle trop de pouvoir discrétionnaire ?', 'efgh'],
    ['Est-ce que bombarder des civils dans un pays ennemi est moralement assimilable à un meurtre ?', 'efgh'],
    ['Vous qualifieriez-vous d’anarcho-capitaliste ?', 'mnop'],
    ['Toutes les drogues devraient-elles être réglementées, même pour les adultes ?', 'lkji'],
    ['Dépensons-nous trop pour la Sécurité sociale ?', 'abcd'],
    ['Sommes-nous sur-réglementés ?', 'efgh'],
    ['Êtes-vous opposé au service national ?', 'abcd'],
    ['Toute la législation devrait-elle être remplacée par la jurisprudence, l’arbitrage et autres juges privés ?', 'mnop'],
    ['Le chèque-éducation serait-il un progrès comparé à l’organisation de l’école publique actuelle ?', 'efgh'],
    ['L’ensemble des espaces et terrains publics devraient-ils être maintenus publics ?', 'lkji'],
    ['Les lois anti-discrimination devraient-elles être conservées ?', 'lkji'],
    ['Les dépenses publiques devraient-elles être réduites de 50 % ou plus ?', 'ijkl'],
    ['Devrait-on maintenir public l’entretien, les pompiers et autres services locaux ?', 'lkji'],
    ['Les procédures de validation des médicaments sont-elles trop laxistes ?', 'hgfe'],
    ['Un bon de logement serait-il un progrès par rapport à la politique actuelle de logement social ?', 'efgh'],
    ['Faudrait-il maintenir les réglementations de la sécurité du travail ?', 'lkji'],
  ].map(([text, letters]) => ({ text: frenchSpacing(text), letters }));

  const TOTAL = QUESTIONS.length;

  // The six levels of the pyramid images (pyramide0.jpg … pyramide5.jpg), bottom to top.
  const LEVELS = ['Communiste', 'Pseudo-libéral', 'Démocrate', 'Minarchiste', 'Anarcap', 'HHH'];
  const PYRAMID_ALT = [
    '« Tous des communistes »', '« Pseudo-libéral »', '« Démocrate »', '« Minarchiste »', '« Anarcap »', 'au sommet, avec Hans-Hermann Hoppe',
  ];

  function diagnose(answers) {
    const n = {};
    for (const l of 'abcdefghijklmnop') n[l] = 0;
    answers.forEach((a, i) => { n[QUESTIONS[i].letters[a]]++; });

    const statist = n.b + 2 * n.c + 3 * n.d;
    if (statist < 13) return { level: 0, short: 'collectiviste', title: 'Vous êtes un collectiviste de la pire espèce.', extra: 'Pour vous, l’État est l’alpha et l’oméga de la vie en société.' };
    if (statist < 26) return { level: 0, short: 'étatiste acharné', title: 'Vous êtes un étatiste acharné.' };
    if (statist < 39) return { level: 1, short: 'étatiste qui s’ignore', title: 'Vous êtes probablement un étatiste qui s’ignore.' };
    if (n.f + 2 * n.g + 3 * n.h < 32) return { level: 2, short: 'libéral conservateur', title: 'Vous êtes probablement un « libéral conservateur ».' };
    if (n.j + 2 * n.k + 3 * n.l < 54) return { level: 3, short: 'minarchiste', title: 'Vous êtes probablement un minarchiste.' };
    const anarcap = { level: 4, short: 'anarcho-capitaliste', title: 'Vous êtes vraisemblablement un anarcho-capitaliste.' };
    if (n.n + 2 * n.o + 3 * n.p > 40) {
      return { ...anarcap, level: 5, extra: 'On vous prend probablement souvent pour un extrémiste. Et pourtant, vous êtes parmi ceux qui ont le mieux compris la Liberté…' };
    }
    return anarcap;
  }

  /* ---------------- State (kept in this browser only) ---------------- */

  const STORE_KEY = 'quizliberal.v1';
  const blank = () => ({ answers: Array(TOTAL).fill(null), index: 0, done: false });

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && Array.isArray(s.answers) && s.answers.length === TOTAL
        && s.answers.every((a) => a === null || (Number.isInteger(a) && a >= 0 && a < OPTIONS.length))) {
        const index = Number.isInteger(s.index) ? Math.min(Math.max(s.index, 0), TOTAL - 1) : 0;
        return { answers: s.answers, index, done: !!s.done && s.answers.every((a) => a !== null) };
      }
    } catch (e) { /* storage unavailable or unreadable: start fresh */ }
    return blank();
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* private mode: progress is not kept */ }
  }

  let state = load();
  const answeredCount = () => state.answers.filter((a) => a !== null).length;
  const firstUnanswered = () => state.answers.findIndex((a) => a === null);
  const allAnswered = () => firstUnanswered() === -1;

  /* ---------------- Elements ---------------- */

  const $ = (id) => document.getElementById(id);
  const views = { intro: $('view-intro'), quiz: $('view-quiz'), result: $('view-result') };
  const el = {
    bar: $('quiz-bar'), progress: $('progress'), progressFill: $('progress-fill'), progressCount: $('progress-count'),
    introActions: $('intro-actions'),
    question: $('question'), eyebrow: $('question-eyebrow'), qText: $('question-text'), answers: $('answers'),
    prev: $('btn-prev'), next: $('btn-next'), hint: $('finish-hint'), jump: $('jump-grid'),
    resultTitle: $('result-title'), resultExtra: $('result-extra'), ladder: $('ladder'), pyramid: $('pyramid-img'),
    toast: $('toast'),
  };

  /* ---------------- Views (#questions, #resultat; no hash = intro) ---------------- */

  let current = null;

  function route() {
    const h = location.hash;
    if (h === '#resultat' && allAnswered()) showResult();
    else if (h === '#questions') showQuiz();
    else showIntro();
  }
  function goTo(hash) {
    if (location.hash === hash || (!hash && !location.hash)) return route();
    if (hash) location.hash = hash;
    else { history.pushState(null, '', location.pathname + location.search); route(); }
  }
  function show(name) {
    const changed = current !== name;
    current = name;
    for (const [k, v] of Object.entries(views)) v.hidden = k !== name;
    el.bar.hidden = name !== 'quiz';
    if (changed) window.scrollTo(0, 0);
    return changed;
  }

  /* ---------------- Intro ---------------- */

  function showIntro() {
    show('intro');
    document.title = 'Diagnostic libéral · Où vous situez-vous ?';
    const count = answeredCount();
    const arrow = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    if (state.done) {
      el.introActions.innerHTML = `<button type="button" class="btn btn-accent btn-lg" data-action="see-result">Voir mon résultat ${arrow}</button>
        <button type="button" class="btn btn-secondary btn-lg" data-action="restart">Recommencer</button>`;
    } else if (count > 0) {
      el.introActions.innerHTML = `<button type="button" class="btn btn-accent btn-lg" data-action="resume">Reprendre à la question ${state.index + 1} ${arrow}</button>
        <button type="button" class="btn btn-secondary btn-lg" data-action="restart">Recommencer</button>
        <p class="resume-note">Vous avez déjà répondu à ${count} question${count > 1 ? 's' : ''} sur ${TOTAL}.</p>`;
    } else {
      el.introActions.innerHTML = `<button type="button" class="btn btn-accent btn-lg" data-action="start">Commencer le diagnostic ${arrow}</button>`;
    }
  }

  /* ---------------- Questions ---------------- */

  let advanceTimer = 0;

  function buildJumpGrid() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < TOTAL; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = String(i + 1);
      b.dataset.jump = String(i);
      frag.appendChild(b);
    }
    el.jump.appendChild(frag);
  }

  function showQuiz() {
    const entering = show('quiz');
    renderQuestion(null);
    if (entering) focusQuestion();
  }

  function renderQuestion(direction) {
    const i = state.index;
    const q = QUESTIONS[i];
    document.title = `Question ${i + 1} sur ${TOTAL} · Diagnostic libéral`;
    el.eyebrow.textContent = `Question ${i + 1} sur ${TOTAL}`;
    // Keep « devrait-il », « a-t-elle »… on one line.
    el.qText.innerHTML = escapeHtml(q.text).replace(/[\p{L}’']+-(?:t-)?(?:ils?|elles?|on|nous|vous|ce)(?!\p{L})/gu, '<span class="nw">$&</span>');
    el.answers.innerHTML = OPTIONS.map((label, k) => `
      <button type="button" class="answer" data-choice="${k}" aria-pressed="false">
        <span class="answer-key" aria-hidden="true">${'ABCD'[k]}</span>
        <span class="answer-label">${label}</span>
        <span class="answer-scale" aria-hidden="true">${[0, 1, 2, 3].map((n) => `<i${n <= k ? ' class="on"' : ''}></i>`).join('')}</span>
      </button>`).join('');
    if (direction) {
      el.question.classList.remove('slide-next', 'slide-prev');
      void el.question.offsetWidth; // restart the animation
      el.question.classList.add(direction > 0 ? 'slide-next' : 'slide-prev');
    }
    refresh();
  }

  // Everything that depends on the answers, without rebuilding the question.
  function refresh() {
    const i = state.index;
    const selected = state.answers[i];
    el.answers.querySelectorAll('.answer').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.choice) === selected)));

    const count = answeredCount();
    el.progressFill.style.width = `${(count / TOTAL) * 100}%`;
    el.progress.setAttribute('aria-valuenow', String(count));
    el.progress.classList.toggle('is-complete', count === TOTAL);
    el.progressCount.textContent = `${count}/${TOTAL}`;

    el.prev.disabled = i === 0;
    const last = i === TOTAL - 1;
    const complete = count === TOTAL;
    const arrow = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    if (last) {
      el.next.innerHTML = `Voir mon diagnostic ${arrow}`;
      el.next.dataset.action = 'finish';
      el.next.className = `btn ${complete ? 'btn-accent' : 'btn-secondary'}`;
      el.next.disabled = !complete;
    } else {
      el.next.innerHTML = `Suivante ${arrow}`;
      el.next.dataset.action = 'next';
      el.next.className = `btn ${selected !== null ? 'btn-primary' : 'btn-secondary'}`;
      el.next.disabled = false;
    }

    const missing = TOTAL - count;
    const noneAfter = nextUnansweredAfter(i) === -1;
    if (missing > 0 && (last || (selected !== null && noneAfter))) {
      el.hint.innerHTML = `${missing === 1 ? 'Il reste 1 question' : `Il reste ${missing} questions`} sans réponse. <button type="button" data-action="first-missing">Y aller</button>`;
      el.hint.hidden = false;
    } else if (missing === 0 && !last) {
      el.hint.innerHTML = 'Toutes les questions ont une réponse. <button type="button" data-action="finish">Voir mon diagnostic</button>';
      el.hint.hidden = false;
    } else {
      el.hint.hidden = true;
    }

    el.jump.querySelectorAll('button').forEach((b, n) => {
      const done = state.answers[n] !== null;
      b.classList.toggle('is-answered', done);
      b.setAttribute('aria-label', `Question ${n + 1}${done ? ', répondue' : ''}`);
      if (n === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
  }

  function goQuestion(i) {
    clearTimeout(advanceTimer);
    if (i < 0 || i >= TOTAL || i === state.index) return;
    const direction = i > state.index ? 1 : -1;
    state.index = i;
    save();
    renderQuestion(direction);
    focusQuestion();
    const top = views.quiz.getBoundingClientRect().top + window.scrollY - 140;
    if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function focusQuestion() {
    el.qText.focus({ preventScroll: true });
  }

  const nextUnansweredAfter = (i) => state.answers.findIndex((a, n) => n > i && a === null);

  function choose(k) {
    clearTimeout(advanceTimer);
    const i = state.index;
    const wasComplete = allAnswered();
    state.answers[i] = k;
    save();
    refresh();
    // Going through the questions: on to the next unanswered one (i + 1 in the usual case,
    // or back to where the visitor was after changing an earlier answer).
    // Reviewing a complete set: simply the next question.
    const target = wasComplete ? (i < TOTAL - 1 ? i + 1 : -1) : nextUnansweredAfter(i);
    if (target >= 0) {
      advanceTimer = setTimeout(() => goQuestion(target), 260); // short pause so the choice is seen
    } else if (allAnswered()) {
      const finish = el.next.dataset.action === 'finish' ? el.next : el.hint.querySelector('[data-action=finish]');
      if (finish) finish.focus({ preventScroll: true });
    }
  }

  /* ---------------- Result ---------------- */

  function showResult() {
    clearTimeout(advanceTimer);
    show('result');
    const r = diagnose(state.answers);
    document.title = `${r.title} · Diagnostic libéral`;
    el.resultTitle.textContent = frenchSpacing(r.title);
    el.resultExtra.hidden = !r.extra;
    el.resultExtra.textContent = r.extra ? frenchSpacing(r.extra) : '';
    el.ladder.innerHTML = LEVELS.map((name, n) => `
      <li class="${n <= r.level ? 'on' : ''}${n === r.level ? ' here' : ''}"${n === r.level ? ' aria-current="step"' : ''}>
        <span class="bar" style="background-position:${n * 20}% 0"></span><span class="lbl">${name}</span>
      </li>`).join('');
    el.ladder.setAttribute('aria-label', `Votre position sur la pyramide : ${LEVELS[r.level]}, niveau ${r.level + 1} sur ${LEVELS.length}`);
    $('ladder-caption').innerHTML = `Niveau <strong>${LEVELS[r.level]}</strong> · ${r.level + 1} sur ${LEVELS.length}`;
    el.pyramid.src = `pyramide${r.level}.jpg`;
    el.pyramid.alt = frenchSpacing(`Pyramide de la Liberté, de « Tous des communistes » en bas à HHH au sommet. Vous êtes : ${PYRAMID_ALT[r.level]}.`);
    el.resultTitle.focus({ preventScroll: true });
  }

  async function share() {
    const url = 'https://www.quizliberal.xyz';
    const r = allAnswered() ? diagnose(state.answers) : null;
    const text = r
      ? `D’après le Diagnostic libéral, je suis ${r.short}. Et vous ?`
      : 'Où vous situez-vous sur la pyramide de la Liberté ? 64 questions, moins de 10 minutes.';
    if (navigator.share) {
      try { await navigator.share({ title: 'Diagnostic libéral', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast('Lien copié dans le presse-papiers');
    } catch (e) {
      toast('Partagez ce lien : www.quizliberal.xyz');
    }
  }

  let toastTimer = 0;
  function toast(message) {
    clearTimeout(toastTimer);
    el.toast.textContent = message;
    el.toast.hidden = false;
    toastTimer = setTimeout(() => { el.toast.hidden = true; }, 2800);
  }

  /* ---------------- Events ---------------- */

  function restart() {
    if (answeredCount() > 0 && !state.done && !window.confirm('Effacer vos réponses et recommencer depuis la première question ?')) return;
    state = blank();
    save();
    if (current === 'quiz') { renderQuestion(null); focusQuestion(); window.scrollTo(0, 0); } else goTo('#questions');
  }

  document.addEventListener('click', (e) => {
    const choice = e.target.closest('[data-choice]');
    if (choice) return choose(Number(choice.dataset.choice));
    const jump = e.target.closest('[data-jump]');
    if (jump) return goQuestion(Number(jump.dataset.jump));
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.disabled) return;
    switch (btn.dataset.action) {
      case 'start': state = blank(); save(); goTo('#questions'); break;
      case 'resume': goTo('#questions'); break;
      case 'restart': restart(); break;
      case 'prev': goQuestion(state.index - 1); break;
      case 'next': goQuestion(state.index + 1); break;
      case 'first-missing': goQuestion(firstUnanswered()); break;
      case 'finish': if (allAnswered()) { state.done = true; save(); goTo('#resultat'); } break;
      case 'see-result': goTo('#resultat'); break;
      case 'review': state.index = 0; save(); goTo('#questions'); break;
      case 'share': share(); break;
      default: break;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (current !== 'quiz' || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    const key = e.key.toLowerCase();
    const k = 'abcd'.indexOf(key) >= 0 ? 'abcd'.indexOf(key) : '1234'.indexOf(key);
    if (key.length === 1 && k >= 0) { e.preventDefault(); choose(k); return; }
    if (e.key === 'ArrowRight' && state.index < TOTAL - 1) { e.preventDefault(); goQuestion(state.index + 1); }
    if (e.key === 'ArrowLeft' && state.index > 0) { e.preventDefault(); goQuestion(state.index - 1); }
  });

  window.addEventListener('hashchange', route);
  window.addEventListener('popstate', route);

  /* ---------------- Helpers ---------------- */

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  // French typography: non-breaking space before ? ! : ; % and inside « ».
  function frenchSpacing(s) {
    return s.replace(/ ([?!:;%»])/g, ' $1').replace(/« /g, '« ');
  }

  buildJumpGrid();
  route();
})();
