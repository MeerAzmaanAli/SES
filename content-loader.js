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
  const routeKey = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop() || 'index';
  const page = routeKey.endsWith('.html') ? routeKey : `${routeKey}.html`;
  const esc = (value) => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);

  document.querySelectorAll('a[href^="tel:"]').forEach(el => { el.href = `tel:${content.company.phoneHref}`; el.textContent = content.company.phone; });
  document.querySelectorAll('a[href^="mailto:"]').forEach(el => { el.href = `mailto:${content.company.email}`; el.textContent = content.company.email; });

  const serviceImgMap = {
    'fire & safety': 'public/media/services_images/fire.jpeg',
    'hvac': 'public/media/services_images/hvac.jpeg',
    'cold rooms & storage': 'public/media/services_images/coldroom.jpeg',
    'fabrication': 'public/media/services_images/fabrication.jpeg',
    'water purification': 'public/media/services_images/ro.jpeg',
    'electrical works': 'public/media/services_images/electrical.jpeg',
    'solar': 'public/media/services_images/solar.jpeg',
    'it — software & applications': 'public/media/services_images/it.jpeg'
  };
  const getServiceImg = (service, index) => {
    if (service.image) return service.image;
    const nameLower = (service.name || '').toLowerCase().trim();
    if (serviceImgMap[nameLower]) return serviceImgMap[nameLower];
    const defaultImages = [
      'public/media/services_images/fire.jpeg',
      'public/media/services_images/hvac.jpeg',
      'public/media/services_images/coldroom.jpeg',
      'public/media/services_images/fabrication.jpeg',
      'public/media/services_images/ro.jpeg',
      'public/media/services_images/electrical.jpeg',
      'public/media/services_images/solar.jpeg',
      'public/media/services_images/it.jpeg'
    ];
    return defaultImages[index % defaultImages.length];
  };

  const serviceLinks = {
    'fire & safety': '/services/fire-fighting/',
    'hvac': '/services/hvac/',
    'cold rooms & storage': '/services/cold-rooms/',
    'electrical works': '/services/electrical/'
  };

  const serviceCards = (home) => content.services.map((service, index) => {
    const imgSrc = getServiceImg(service, index);
    const link = serviceLinks[(service.name || '').toLowerCase().trim()];
    const imgHtml = `<div class="svc-img-wrap"><img class="svc-img" src="${esc(imgSrc)}" alt="${esc(service.name)}" loading="lazy"></div>`;
    const actionHtml = link ? `<div style="margin-top:0.8rem;"><span style="color:var(--blue);font-weight:600;font-size:0.9rem;">Explore discipline →</span></div>` : '';
    const bodyHtml = `<div class="svc-body"><div class="svc-top"><div class="svc-num">${String(index + 1).padStart(2, '0')}</div><div class="svc-icon" aria-hidden="true">${esc(service.icon)}</div></div><h3>${esc(service.name)}${!home && service.status ? ` <span class="tag">${esc(service.status)}</span>` : ''}</h3><p>${esc(service.summary)}</p>${actionHtml}</div>`;
    
    if (link) {
      return home
        ? `<a class="svc-card" href="${link}">${imgHtml}${bodyHtml}</a>`
        : `<a class="card svc-card" href="${link}">${imgHtml}${bodyHtml}</a>`;
    }
    return home
      ? `<div class="svc-card">${imgHtml}${bodyHtml}</div>`
      : `<article class="card svc-card">${imgHtml}${bodyHtml}</article>`;
  }).join('');

  // Local images from public/media/project-visuals — add more per discipline as you drop files in
  const localProjectImgs = {
    'fire & safety': [
      'public/media/project-visuals/fire.png',
      'public/media/project-visuals/fire 2.png'
    ],
    'electrical works': [
      'public/media/project-visuals/electrical.png'
    ],
    'electrical': [
      'public/media/project-visuals/electrical.png'
    ]
  };

  // Unsplash fallbacks — used when no local image exists for a discipline
  const unsplashFallbacks = {
    'hvac':                'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=700&q=80&fit=crop',
    'cold rooms & storage':'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=700&q=80&fit=crop',
    'cold room':           'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=700&q=80&fit=crop',
    'piping':              'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=700&q=80&fit=crop',
    'solar':               'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=700&q=80&fit=crop',
    'fabrication':         'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=700&q=80&fit=crop',
    'water purification':  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=80&fit=crop',
    'default':             'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=700&q=80&fit=crop'
  };

  // Per-discipline counter so each project in the same discipline gets a different image
  const disciplineCounters = {};
  const getProjectImg = (project) => {
    if (project.thumbnail) return project.thumbnail;
    const key = (project.discipline || '').toLowerCase().trim();
    const pool = localProjectImgs[key];
    if (pool && pool.length) {
      disciplineCounters[key] = (disciplineCounters[key] || 0);
      const img = pool[disciplineCounters[key] % pool.length];
      disciplineCounters[key]++;
      return img;
    }
    return unsplashFallbacks[key] || unsplashFallbacks['default'];
  };

  const projectCards = (home) => content.projects.map(project => {
    const imgSrc = getProjectImg(project);
    // Encode spaces in local paths; leave full URLs (http/https) untouched
    const imgSrcEncoded = imgSrc.startsWith('http') ? imgSrc : imgSrc.replace(/ /g, '%20');
    const imgTag = `<img class="proj-img" src="${imgSrcEncoded}" alt="${esc(project.discipline)}" loading="lazy">`;
    const projectHref = `/project/?project=${encodeURIComponent(project.slug || slugify(project.title))}`;
    return home
      ? `<a class="proj-card" href="${projectHref}"><div class="proj-visual">${imgTag}</div><div class="proj-meta"><div class="proj-tb"><span>${esc(project.discipline)}</span><span>${esc(project.location)}</span></div><h3>${esc(project.title)}</h3><p>${esc(project.summary)}</p></div></a>`
      : `<a class="card project-card" href="${projectHref}"><div class="project-visual">${imgTag}</div><div class="card-copy"><div class="meta"><span>${esc(project.discipline)}</span><span>${esc(project.location)}</span></div><h3>${esc(project.title)}</h3><p>${esc(project.summary)}</p></div></a>`;
  }).join('');

  const teamPhotoMap = {
    'irshad ali': 'public/media/team_pp/Irshad_Ali.jpeg',
    'sarfaraz ali': 'public/media/team_pp/Sarfaraz_Ali.jpeg',
    'md. zubair khan': 'public/media/team_pp/Md_Zubair_Khan.jpeg',
    'meer bilal ali': 'public/media/team_pp/Meer_Bilal_Ali.jpeg',
    'meer azmaan ali': 'public/media/team_pp/Meer_Azmaan_Ali.jpeg'
  };
  const getTeamPhoto = (member) => teamPhotoMap[(member.name || '').toLowerCase()] || teamPhotoMap[(member.initials || '').toLowerCase()] || '';
  const teamCards = (home) => content.team.map(member => {
    const photo = getTeamPhoto(member);
    const avatar = photo
      ? `<img src="${esc(photo)}" alt="${esc(member.name)}" loading="lazy" decoding="async">`
      : `<div class="team-initials">${esc(member.initials)}</div>`;
    return home
      ? `<div class="team-card"><div class="team-avatar">${avatar}</div><h4>${esc(member.name)}</h4><div class="role">${esc(member.role)}</div></div>`
      : `<article class="card"><div class="team-avatar">${avatar}</div><div class="team-info"><h3>${esc(member.name)}</h3><div class="role">${esc(member.role)}</div><p class="team-bio">${esc(member.bio || '')}</p></div></article>`;
  }).join('');

  const prettyRoute = (url) => {
    if (!url || /^(?:[a-z]+:|#|\/\/)/i.test(url)) return url;
    const match = url.match(/^(.*\/)?([^/?#]+)\.html([?#].*)?$/i);
    if (!match) return url;
    const file = match[2].toLowerCase();
    const suffix = match[3] || '';
    const path = file === 'index' ? '/' : `/${file.replace(/^blog-/, 'blog/')}/`;
    return `${path}${suffix}`;
  };

  const postCards = (home) => content.posts.map(post => {
    const postUrl = esc(prettyRoute(post.url));
    const postImg = post.image ? `<div class="blog-visual"><img src="${esc(post.image)}" alt="${esc(post.title)}" loading="lazy"></div>` : '';
    return home
      ? `<a class="blog-card" href="${postUrl}">${postImg}<span class="blog-tag">${esc(post.tag)}</span><h3>${esc(post.title)}</h3><p>${esc(post.summary)}</p><div class="blog-date">${esc(post.readTime || 'Field note')}</div></a>`
      : `<a class="card blog-card" href="${postUrl}">${postImg}<span class="tag">${esc(post.tag)}</span><h3>${esc(post.title)}</h3><p>${esc(post.summary)}</p><span class="read">Read field note →</span></a>`;
  }).join('');

  // SEO & Structured Data injection from content.seo if present
  if (content.seo) {
    if (content.seo.defaultDescription && !$('meta[name="description"]')) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = content.seo.defaultDescription;
      document.head.appendChild(meta);
    }
    if (content.seo.structuredData && !$('script[type="application/ld+json"][data-injected="ses"]')) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.injected = 'ses';
      script.textContent = JSON.stringify(content.seo.structuredData);
      document.head.appendChild(script);
    }
  }

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
