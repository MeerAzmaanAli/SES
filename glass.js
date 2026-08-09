(() => {
  const header = document.querySelector('header');
  if (!header) return;
  const syncGlassState = () => header.classList.toggle('scrolled', window.scrollY > 30);
  syncGlassState();
  window.addEventListener('scroll', syncGlassState, { passive: true });
})();
