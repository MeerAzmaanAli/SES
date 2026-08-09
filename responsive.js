(() => {
  const header = document.querySelector('header');
  const nav = header?.querySelector('nav');
  const links = nav?.querySelector('.nav-links');
  if (!header || !nav || !links) return;

  header.classList.add('menu-ready');
  const button = document.createElement('button');
  button.className = 'mobile-menu-toggle';
  button.type = 'button';
  button.setAttribute('aria-label', 'Open navigation');
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = '☰';
  nav.append(button);

  const close = () => { header.classList.remove('menu-open'); button.setAttribute('aria-expanded', 'false'); button.innerHTML = '☰'; };
  button.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    button.setAttribute('aria-expanded', String(open));
    button.innerHTML = open ? '×' : '☰';
  });
  links.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  window.addEventListener('resize', () => { if (window.innerWidth > 900) close(); });
})();
