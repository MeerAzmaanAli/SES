const header=document.querySelector('header');
window.addEventListener('scroll',()=>header&&header.classList.toggle('scrolled',scrollY>30));
const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in-view')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>reveal.observe(el));

const prettyRoute=(href)=>{
	if (!href || /^(?:[a-z]+:|#|\/\/)/i.test(href)) return href;
	const match=href.match(/^(.*\/)?([^/?#]+)\.html([?#].*)?$/i);
	if (!match) return href;
	const file=match[2].toLowerCase();
	const suffix=match[3]||'';
	const path=file==='index' ? '/' : file.startsWith('blog-') ? `/blog/${file.slice(5)}/` : `/${file}/`;
	return `${path}${suffix}`;
};

if (location.pathname.endsWith('.html')) {
	const currentFile=location.pathname.split('/').pop().toLowerCase();
	const slug=currentFile.replace(/\.html$/,'');
	const prettyCurrent=currentFile==='index.html' ? '/' : slug.startsWith('blog-') ? `/blog/${slug.slice(5)}/` : `/${slug}/`;
	history.replaceState({},'',`${prettyCurrent}${location.search}${location.hash}`);
}

document.querySelectorAll('a[href]').forEach(link=>{
	const href=link.getAttribute('href');
	const pretty=prettyRoute(href);
	if (pretty && pretty!==href) link.setAttribute('href', pretty);
});
