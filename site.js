(() => {
  'use strict';
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const shell = nav.closest('.nav-shell') || nav.parentElement;
  const links = nav.querySelector('.navlinks');
  if (!links || nav.querySelector('.nav-menu')) return;

  const button = document.createElement('button');
  button.className = 'nav-menu';
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'mobile-drawer');
  button.setAttribute('aria-label', 'باز کردن منوی سایت');
  button.textContent = '☰';

  const drawer = document.createElement('div');
  drawer.className = 'mobile-drawer';
  drawer.id = 'mobile-drawer';
  drawer.setAttribute('hidden', '');
  links.querySelectorAll('a').forEach((a) => drawer.append(a.cloneNode(true)));
  const cta = nav.querySelector('.nav-cta, .btn.primary');
  if (cta) drawer.append(cta.cloneNode(true));
  shell.style.position = 'relative';
  nav.append(button);
  shell.append(drawer);

  const close = () => {
    drawer.hidden = true;
    drawer.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    drawer.hidden = false;
    drawer.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
  };
  button.addEventListener('click', () => (drawer.hidden ? open() : close()));
  drawer.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) close();
  }, { passive: true });
})();
