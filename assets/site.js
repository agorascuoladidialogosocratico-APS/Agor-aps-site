(() => {
  const button = document.querySelector('.nav-toggle');
  const navigation = document.querySelector('#main-navigation');
  if (!button || !navigation) return;
  const setOpen = (open) => {
    navigation.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      button.focus();
    }
  });
  document.addEventListener('click', event => {
    if (button.getAttribute('aria-expanded') === 'true' && !button.contains(event.target) && !navigation.contains(event.target)) {
      setOpen(false);
    }
  });
  const mq = matchMedia('(min-width: 861px)');
  mq.addEventListener('change', () => setOpen(false));
})();