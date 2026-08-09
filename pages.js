const header=document.querySelector('header');
window.addEventListener('scroll',()=>header&&header.classList.toggle('scrolled',scrollY>30));
const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in-view')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>reveal.observe(el));
