/* A progressively enhanced book: links remain real anchors, all chapters are
   readable without JavaScript, and no content is advanced automatically. */
(() => {
  'use strict';
  const root = document.documentElement;
  const book = document.querySelector('.story-book');
  if (!book) return;
  let pages = [...book.querySelectorAll(':scope > .book-page')];
  const prev = document.querySelector('.page-prev');
  const next = document.querySelector('.page-next');
  const indexButton = document.querySelector('.index-toggle');
  const index = document.querySelector('.book-index');
  const turn = document.querySelector('.page-turn');
  const motionButton = document.querySelector('.motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let transitionTimer;
  let paused = false;
  try { paused = localStorage.getItem('agora-motion-paused') === 'true'; } catch {}
  root.classList.add('js');

  function setIndex(open, focusButton = false) {
    index.classList.toggle('is-open', open);
    indexButton.setAttribute('aria-expanded', String(open));
    if (focusButton) indexButton.focus();
  }
  indexButton.addEventListener('click', () => setIndex(indexButton.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('click', event => {
    if (!index.contains(event.target) && !indexButton.contains(event.target)) setIndex(false);
  });
  function updateMotion() {
    root.classList.toggle('motion-paused', paused || reduced.matches);
    motionButton.setAttribute('aria-pressed', String(paused || reduced.matches));
    motionButton.disabled = reduced.matches;
    motionButton.textContent = reduced.matches ? 'Animazioni ridotte' : paused ? 'Attiva le animazioni ▷' : 'Ferma le animazioni Ⅱ';
  }
  motionButton.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('agora-motion-paused', String(paused)); } catch {}
    updateMotion();
  });
  reduced.addEventListener('change', updateMotion);
  updateMotion();

  function pageForHash(hash) {
    let id;
    try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return 0; }
    const target = document.getElementById(id);
    const page = target?.closest('.book-page');
    const position = pages.indexOf(page);
    return position >= 0 ? position : 0;
  }
  function render(number, {animate = true, focus = true} = {}) {
    const destination = Math.max(0, Math.min(number, pages.length - 1));
    const changed = destination !== current;
    const backwards = destination < current;
    clearTimeout(transitionTimer);
    turn.classList.remove('turning', 'backwards');
    pages.forEach((page, i) => {
      page.hidden = i !== destination;
      page.classList.remove('is-entering');
    });
    current = destination;
    const page = pages[current];
    const target = document.getElementById(location.hash.slice(1));
    if(target && page.contains(target)){let ancestor=target.parentElement;while(ancestor && ancestor!==page){if(ancestor.tagName==='DETAILS')ancestor.open=true;ancestor=ancestor.parentElement;}}
    if (animate && changed && !paused && !reduced.matches) {
      // Restart only the decorative paper transition, never clone interactive content.
      void turn.offsetWidth;
      turn.classList.toggle('backwards', backwards);
      turn.classList.add('turning');
      page.classList.add('is-entering');
      transitionTimer = setTimeout(() => turn.classList.remove('turning', 'backwards'), 760);
    }
    prev.disabled = current === 0;
    next.replaceChildren(document.createTextNode(current === 0 ? 'Apri il libro ' : current === pages.length - 1 ? 'Torna all’inizio ' : 'Sfoglia '));
    const arrow = document.createElement('span');arrow.setAttribute('aria-hidden', 'true');arrow.textContent = current === pages.length - 1 ? '↺' : '→';next.append(arrow);
    document.querySelector('#page-label').textContent = page.dataset.title;
    document.querySelector('.page-count').textContent = `${current + 1} / ${pages.length}`;
    document.querySelectorAll('.progress-dots i').forEach((dot, i) => dot.classList.toggle('current', i === current));
    document.querySelectorAll('.book-index a, .quick-nav a').forEach(link => {
      if (link.hash === '#' + page.id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    setIndex(false);
    if (focus) {
      const heading = page.querySelector('h1,h2');
      heading.setAttribute('tabindex', '-1');heading.focus({preventScroll: true});
      book.scrollIntoView({block: 'start', behavior: 'instant'});
      document.querySelector('.book-status').textContent = `${page.dataset.title}. Pagina ${current + 1} di ${pages.length}.`;
    }
  }
  function go(number) {
    const i = number >= pages.length ? 0 : Math.max(0, number);
    history.pushState(null, '', '#' + pages[i].id);
    render(i);
  }
  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target?.closest('.book-page')) return;
    event.preventDefault();
    const page = target.closest('.book-page');
    if (target.id === 'odisseo') target.closest('details')?.setAttribute('open', '');
    history.pushState(null, '', link.hash);
    render(pages.indexOf(page));
    if (target.id !== page.id) target.scrollIntoView({block:'nearest',behavior:'instant'});
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { if(indexButton.getAttribute('aria-expanded') === 'true')setIndex(false, true); return; }
    if (indexButton.getAttribute('aria-expanded') === 'true' || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('input,textarea,select,button,a,summary,[contenteditable="true"]')) return;
    if (event.key === 'ArrowRight' && current < pages.length - 1) {event.preventDefault();go(current + 1);}
    if (event.key === 'ArrowLeft' && current > 0) {event.preventDefault();go(current - 1);}
  });
  window.addEventListener('hashchange', () => render(pageForHash(location.hash)));
  window.addEventListener('popstate', () => render(pageForHash(location.hash), {animate:false}));
  document.addEventListener('agora:cms:loaded', () => {
    pages = [...book.querySelectorAll(':scope > .book-page')].filter(page=>page.dataset.excluded!=='true');
    book.querySelectorAll(':scope > .book-page[data-excluded="true"]').forEach(page=>page.hidden=true);
    const dots=document.querySelector('.progress-dots');dots.replaceChildren(...pages.map(()=>document.createElement('i')));
    document.querySelectorAll('.book-index a,.quick-nav a').forEach(link=>{const page=document.getElementById(link.hash.slice(1))?.closest('.book-page');link.hidden=page?.dataset.excluded==='true';});
    render(pageForHash(location.hash), {animate:false, focus:false});
    if (!reduced.matches && !paused) pages[current].classList.add('is-entering');
  });
  render(pageForHash(location.hash), {animate:false, focus:false});
  if (!reduced.matches && !paused) pages[current].classList.add('is-entering');
})();
