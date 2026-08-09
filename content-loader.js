(async () => {
  const localUrl = 'SES_content/site.json';
  const remoteUrl = window.SES_CONTENT_API_URL;
  const urls = [remoteUrl, localUrl].filter(Boolean);

  let content;
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) continue;
      content = await response.json();
      document.documentElement.dataset.contentSource = url === localUrl ? 'local' : 'remote';
      break;
    } catch (_) { /* Try the local fallback. */ }
  }
  if (!content) return;

  const $ = (selector) => document.querySelector(selector);
  const setText = (selector, value) => { const el = $(selector); if (el && value) el.textContent = value; };
  const slugify = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|$)/g, '');
  const page = location.pathname.split('/').pop() || 'index.html';
  const esc = (value) => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' })[char]);

  document.querySelectorAll('a[href^="tel:"]').forEach(el => { el.href = `tel:${content.company.phoneHref}`; el.textContent = content.company.phone; });
  document.querySelectorAll('a[href^="mailto:"]').forEach(el => { el.href = `mailto:${content.company.email}`; el.textContent = content.company.email; });

  const serviceCards = (home) => content.services.map((service, index) => home
    ? `<div class="svc-card"><div class="svc-num">${String(index + 1).padStart(2, '0')}</div><div class="svc-icon" aria-hidden="true">${esc(service.icon)}</div><h3>${esc(service.name)}</h3><p>${esc(service.summary)}</p></div>`
    : `<article class="card"><div class="num">${String(index + 1).padStart(2, '0')}</div><div class="icon" aria-hidden="true">${esc(service.icon)}</div><h3>${esc(service.name)}${service.status ? ` <span class="tag">${esc(service.status)}</span>` : ''}</h3><p>${esc(service.summary)}</p></article>`).join('');

  const projectCards = (home) => content.projects.map(project => home
    ? `<a class="proj-card" href="project.html?project=${encodeURIComponent(project.slug || slugify(project.title))}"><div class="proj-visual">${esc(project.icon)}</div><div class="proj-meta"><div class="proj-tb"><span>${esc(project.discipline)}</span><span>${esc(project.location)}</span></div><h3>${esc(project.title)}</h3><p>${esc(project.summary)}</p></div></a>`
    : `<a class="card project-card" href="project.html?project=${encodeURIComponent(project.slug || slugify(project.title))}"><div class="project-visual">${esc(project.icon)}</div><div class="card-copy"><div class="meta"><span>${esc(project.discipline)}</span><span>${esc(project.location)}</span></div><h3>${esc(project.title)}</h3><p>${esc(project.summary)}</p></div></a>`).join('');

  const teamCards = (home) => content.team.map(member => home
    ? `<div class="team-card"><div class="team-avatar"><div class="team-initials">${esc(member.initials)}</div></div><h4>${esc(member.name)}</h4><div class="role">${esc(member.role)}</div></div>`
    : `<article class="card"><div class="team-avatar"><span>${esc(member.initials)}</span></div><div class="team-info"><h3>${esc(member.name)}</h3><div class="role">${esc(member.role)}</div></div></article>`).join('');

  const postCards = (home) => content.posts.map(post => home
    ? `<a class="blog-card" href="${esc(post.url)}"><span class="blog-tag">${esc(post.tag)}</span><h3>${esc(post.title)}</h3><p>${esc(post.summary)}</p><div class="blog-date">Field note</div></a>`
    : `<a class="card blog-card" href="${esc(post.url)}"><span class="tag">${esc(post.tag)}</span><h3>${esc(post.title)}</h3><p>${esc(post.summary)}</p><span class="read">Read field note →</span></a>`).join('');

  if (page === 'index.html') {
    const services = $('.svc-grid'); if (services) services.innerHTML = serviceCards(true);
    const projects = $('.proj-grid'); if (projects) projects.innerHTML = projectCards(true);
    const team = $('.team-grid'); if (team) team.innerHTML = teamCards(true);
    const clients = $('.marquee-track'); if (clients) clients.innerHTML = [...content.clients, ...content.clients].map(name => `<div class="marquee-item">${esc(name)}</div>`).join('');
    const posts = $('.blog-grid'); if (posts) posts.innerHTML = postCards(true);
  }
  if (page === 'services.html') { const grid = $('.services-page .grid'); if (grid) grid.innerHTML = serviceCards(false); }
  if (page === 'projects.html') { const grid = $('.projects-page .grid'); if (grid) grid.innerHTML = projectCards(false); }
  if (page === 'clients.html') { const grid = $('.clients-page .grid'); if (grid) grid.innerHTML = content.clients.map(name => `<div class="client-mark">${esc(name)}</div>`).join(''); }
  if (page === 'team.html') { const grid = $('.team-page .grid'); if (grid) grid.innerHTML = teamCards(false); }
  if (page === 'blog.html') { const grid = $('.blog-page .grid'); if (grid) grid.innerHTML = postCards(false); }
  if (page === 'about.html') {
    setText('.about-page .page-hero h1', content.about.heading);
    setText('.about-page .page-hero p', content.about.summary);
    const list = $('.about-page .list');
    if (list) list.innerHTML = content.about.principles.map((item, index) => `<div class="list-row"><span class="num">${String(index + 1).padStart(2, '0')}</span><strong>${esc(item.title)}</strong><p>${esc(item.description)}</p></div>`).join('');
  }
})();
