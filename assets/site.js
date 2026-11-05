(() => {
  const button = document.querySelector('.nav-toggle');
  const navigation = document.querySelector('#main-navigation');
  if (!button || !navigation) return;
  document.documentElement.classList.add('js');
  const mobile = matchMedia('(max-width: 980px)');
  const setOpen = (open, returnFocus = false) => {
    navigation.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    if (returnFocus) button.focus();
  };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    setOpen(false);
    // Anchor navigation must not leave keyboard focus inside a hidden mobile menu.
    if (mobile.matches && link.hash) {
      const target = document.getElementById(link.hash.slice(1));
      if (target) {target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });
  document.addEventListener('click', event => {
    if (!button.contains(event.target) && !navigation.contains(event.target)) setOpen(false);
  });
  mobile.addEventListener('change', () => setOpen(false));
})();
