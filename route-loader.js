(() => {
  const script = document.currentScript;
  const source = script && script.dataset ? script.dataset.source : '';
  const baseHref = script && script.dataset && script.dataset.base ? script.dataset.base : './';

  if (!source) return;

  fetch(source, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error(`Unable to load ${source}`);
      return response.text();
    })
    .then(html => {
      const documentWithBase = html.replace(/<head([^>]*)>/i, `<head$1><base href="${baseHref}">`);
      document.open();
      document.write(documentWithBase);
      document.close();
    })
    .catch(() => {
      window.location.replace('/error/');
    });
})();