(async () => {
  const target = document.getElementById('projectDetail');
  const escape = (value) => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' })[char]);
  const slugify = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const requested = new URLSearchParams(location.search).get('project');
  const urls = [window.SES_CONTENT_API_URL, 'SES_content/site.json'].filter(Boolean);
  let content;
  for (const url of urls) {
    try { const response = await fetch(url, { cache: 'no-store' }); if (response.ok) { content = await response.json(); break; } } catch (_) { /* local fallback below */ }
  }
  const project = content?.projects?.find(item => item.slug === requested || slugify(item.title) === requested);
  if (!project) {
    target.innerHTML = '<section class="case-not-found"><div class="wrap"><h1>Project not found.</h1><p>Please return to the project index and choose a case study.</p><a class="btn-primary" href="projects.html">View projects →</a></div></section>';
    return;
  }
  document.title = `${project.title} — SES`;
  const scope = Array.isArray(project.scope) && project.scope.length ? project.scope : [project.summary];
  const photos = Array.isArray(project.gallery) ? project.gallery : [];
  const gallery = photos.length ? `<div class="gallery-grid">${photos.map(photo => `<figure class="gallery-item"><img src="${escape(photo.src)}" alt="${escape(photo.alt || project.title)}" loading="lazy"></figure>`).join('')}</div>` : `<div class="photo-placeholder"><div><span>Site photography</span><h3>Photos will appear here once added to the project record.</h3><p>Add actual site-image URLs to this project's <code>gallery</code> array in the content repository.</p></div></div>`;
  target.innerHTML = `<section class="case-hero"><div class="wrap"><a class="case-back" href="projects.html">← All projects</a><div class="case-eyebrow"><span>${escape(project.discipline)}</span><span>${escape(project.location)}</span></div><h1>${escape(project.title)}</h1><p class="case-summary">${escape(project.summary)}</p></div></section><section class="case-section"><div class="wrap"><div class="case-facts"><div class="case-fact"><span>Discipline</span><strong>${escape(project.discipline)}</strong></div><div class="case-fact"><span>Location</span><strong>${escape(project.location)}</strong></div><div class="case-fact"><span>Status</span><strong>${escape(project.status || 'Delivered')}</strong></div></div></div></section><section class="case-section" style="padding-top:0"><div class="wrap case-layout"><div><div class="titleblock"><i></i><b>PROJECT SCOPE</b></div><h2>Work delivered on site.</h2></div><div class="scope-list">${scope.map((item,index) => `<div class="scope-item"><span>${String(index + 1).padStart(2,'0')}</span><p>${escape(item)}</p></div>`).join('')}</div></div></section><section class="case-section case-gallery"><div class="wrap"><div class="gallery-head"><div><div class="titleblock"><i></i><b>SITE DOCUMENTATION</b></div><h2>Actual work, captured on site.</h2></div><p>Project photography is maintained in the content repository and can be updated without redeploying the website.</p></div>${gallery}</div></section>`;
})();
