import '@fontsource-variable/figtree/wght.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createLiquid } from './liquid.js';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
if (reduced) root.classList.add('reduced');

// Arrived here from the FR/EN switch: the inline script in <head> already hid the loader.
const quick = root.classList.contains('quick');
try { sessionStorage.removeItem('mbs-quick-intro'); } catch {}

// Section to land on after load (e.g. /en/#membership from the language switch).
const landing = location.hash.slice(1);
if (landing && 'scrollRestoration' in history) history.scrollRestoration = 'manual';
const anchorOffset = (id) => (id === 'partner' || id === 'membership' || id === 'events' ? -70 : 0);

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// anchor links
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id === '#top' ? document.body : document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : el, { offset: anchorOffset(id.slice(1)) });
    else el.scrollIntoView();
  });
});

/* ---------- Mobile menu ---------- */
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('mobile-menu');
const menuLabel = toggle.dataset.menu || 'Menu';
const closeLabel = toggle.dataset.close || 'Close';
function closeMenu() {
  if (menu.hidden) return;
  menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = menuLabel;
  lenis?.start();
}
toggle.addEventListener('click', () => {
  const open = menu.hidden;
  menu.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? closeLabel : menuLabel;
  if (open) lenis?.stop(); else lenis?.start();
});

/* ---------- Language switch (FR / EN) ---------- */
// Netlify sends non-French browsers from / to /en/. The nf_lang cookie overrides that,
// so a visitor's own choice sticks. We also keep their place on the page.
function currentSection() {
  let found = '';
  for (const id of ['projects', 'membership', 'events', 'partner']) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= innerHeight * 0.35) found = id;
  }
  return found;
}
document.querySelectorAll('.lang-opt').forEach((a) => {
  a.addEventListener('click', (e) => {
    if (a.hasAttribute('aria-current')) { e.preventDefault(); return; }
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `nf_lang=${a.dataset.lang}; path=/; max-age=31536000; SameSite=Lax${secure}`;
    try { sessionStorage.setItem('mbs-quick-intro', '1'); } catch {}
    const section = currentSection();
    if (section) { e.preventDefault(); location.href = `${a.getAttribute('href')}#${section}`; }
  });
});

/* ---------- Nav colour by section ---------- */
const nav = document.querySelector('.nav');
function under(sel) {
  const r = document.querySelector(sel).getBoundingClientRect();
  return r.top <= 40 && r.bottom > 40;
}
function updateNav() {
  const top = window.scrollY < 40;
  const clear = under('.projects');
  const dark = !clear && (under('.hero') || under('.partner'));
  nav.classList.toggle('is-clear', !top && clear);
  nav.classList.toggle('is-dark', !top && dark);
  nav.classList.toggle('is-solid', !top && !clear && !dark);
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ---------- Liquid hero + intro ---------- */
const hero = document.querySelector('.hero');
const liquid = createLiquid(document.querySelector('.liquid'), {
  onFail: () => hero.classList.add('no-webgl'),
});

function intro() {
  const tl = gsap.timeline();
  const loader = document.querySelector('.loader');
  if (reduced) {
    liquid.reveal = 1; liquid.redraw?.();
    loader?.remove();
    return;
  }
  if (quick) {
    // Short version after switching language: no loader, quick reveal.
    loader?.remove();
    gsap.to(liquid, { reveal: 1, duration: 1.4, ease: 'power2.out' });
    gsap.from(['.hero-eyebrow', '.hero-title', '.hero-sub', '.hero-ctas'], {
      autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.06, ease: 'power3.out',
    });
    return;
  }
  gsap.set('.hero-title .line > span', { yPercent: 110 });
  gsap.set(['.hero-eyebrow', '.hero-sub p', '.hero-ctas'], { autoAlpha: 0, y: 20 });
  tl.from('.loader-body', { scale: 0.6, autoAlpha: 0, duration: 0.6, ease: 'back.out(1.6)', transformOrigin: '50% 50%' })
    .from('.loader-spark', { scale: 0, rotate: -180, duration: 0.6, ease: 'back.out(2.2)' }, '-=0.25')
    .to('.loader-spark', { scale: 1.35, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' })
    .to(loader, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '+=0.1')
    .add(() => loader.remove())
    .to(liquid, { reveal: 1, duration: 2.6, ease: 'power2.inOut' }, '-=0.6')
    .to('.hero-eyebrow', { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '<0.1')
    .to('.hero-title .line > span', { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out' }, '<0.1')
    .to(['.hero-sub p', '.hero-ctas'], { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, '<0.45');
}

if (document.fonts?.ready) document.fonts.ready.then(intro); else intro();

/* ---------- Scroll scenes ---------- */
const mm = gsap.matchMedia();

mm.add({ desktop: '(min-width: 901px)', mobile: '(max-width: 900px)', motion: '(prefers-reduced-motion: no-preference)' }, (ctx) => {
  const { desktop, motion } = ctx.conditions;

  if (motion) {
    // ribbons stretch and lift as you leave the hero
    gsap.to(liquid, {
      scroll: 1, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero-inner', {
      yPercent: -18, autoAlpha: 0.2, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // projects: horizontal journey on desktop
  if (desktop && motion) {
    const track = document.querySelector('.projects-track');
    const distance = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: '.projects', start: 'top top', end: () => '+=' + distance(),
        pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
      },
    });
    // each route draws as its panel arrives
    document.querySelectorAll('.panel-client .route path').forEach((p) => {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDashoffset: len, strokeDasharray: `6 8` }, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: p.closest('.panel'), containerAnimation: tween, start: 'left 80%', end: 'left 20%', scrub: true },
      });
    });
    document.querySelectorAll('.client-logo img').forEach((n) => {
      gsap.from(n, {
        xPercent: 12, ease: 'none',
        scrollTrigger: { trigger: n.closest('.panel'), containerAnimation: tween, start: 'left right', end: 'left left', scrub: true },
      });
    });
    gsap.from('.open-mark', {
      rotate: -200, scale: 0.4, ease: 'none',
      scrollTrigger: { trigger: '.panel-open', containerAnimation: tween, start: 'left right', end: 'left 30%', scrub: true },
    });
  }

  if (motion) {
    // hoodie gentle swing in
    gsap.from('.hoodie img', {
      rotate: -4, scale: 0.92, ease: 'none',
      scrollTrigger: { trigger: '.hoodie', start: 'top bottom', end: 'center center', scrub: true },
    });
    // footer line slides apart
    gsap.from('.footer-line span', {
      xPercent: (i) => [-30, 20, -10][i], ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }
});

/* ---------- Manifesto: words ink in as you read ---------- */
const mText = document.querySelector('.manifesto-text');
if (mText && !reduced) {
  const words = mText.textContent.trim().split(/\s+/);
  mText.setAttribute('aria-label', mText.textContent.trim());
  mText.innerHTML = words.map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
  const spans = mText.querySelectorAll('.w');
  ScrollTrigger.create({
    trigger: mText, start: 'top 80%', end: 'bottom 45%', scrub: true,
    onUpdate: (self) => {
      const n = Math.round(self.progress * spans.length);
      spans.forEach((s, i) => s.classList.toggle('on', i < n));
    },
  });
} else {
  document.documentElement.classList.add('no-split');
}

/* ---------- Magnetic primary button ---------- */
if (!reduced && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.3);
      yTo((e.clientY - r.top - r.height / 2) * 0.4);
    });
    el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------- Forms (Netlify Forms via AJAX) ---------- */
const hoodieRadios = document.querySelectorAll('input[name="hoodie"]');
const sizeField = document.querySelector('.field-size');
hoodieRadios.forEach((r) => r.addEventListener('change', () => {
  const yes = document.querySelector('input[name="hoodie"]:checked')?.value === 'Yes';
  sizeField.hidden = !yes;
  sizeField.querySelector('select').required = yes;
  ScrollTrigger.refresh();
}));

document.querySelectorAll('form[data-netlify]').forEach((form) => {
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    status.className = 'form-status';
    status.textContent = form.dataset.sending || 'Sending…';
    btn.disabled = true;
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      if (sizeField && form.contains(sizeField)) sizeField.hidden = true;
      status.classList.add('ok');
      status.textContent = form.dataset.success;
    } catch {
      status.classList.add('err');
      status.textContent = form.dataset.error || "That didn't send. Check your connection and try again.";
    } finally {
      btn.disabled = false;
    }
  });
});

window.addEventListener('load', () => {
  ScrollTrigger.refresh();
  // Land on the requested section once the pinned layout is measured.
  const el = landing && document.getElementById(landing);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: anchorOffset(landing), immediate: true, force: true });
  else el.scrollIntoView();
  ScrollTrigger.update();
  updateNav();
});
