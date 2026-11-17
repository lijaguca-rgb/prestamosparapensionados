/* VittaClean · interacciones del sitio · Diseñado por De La Rosa Web */
const VC = {
  wa: '523318299243',
  posts: 'data/posts.json'
};

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

VC.waLink = (msg) => `https://wa.me/${VC.wa}?text=${encodeURIComponent(msg)}`;
VC.esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
VC.date = (iso) => {
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d) ? '' : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
};
VC.readTime = (html = '') => Math.max(2, Math.round(html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200));
VC.icon = (id, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="assets/img/icons.svg?v=20261109161846#${id}"></use></svg>`;
VC.loadPosts = async () => {
  try {
    const r = await fetch(VC.posts + '?v=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw 0;
    const data = await r.json();
    return (Array.isArray(data) ? data : [])
      .filter(p => !p.estado || p.estado === 'publicado')
      .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  } catch { return []; }
};
VC.card = (p) => `
  <a class="post-card reveal spot" href="nota.html?n=${encodeURIComponent(p.slug)}">
    <div class="post-thumb">
      ${p.portada ? `<img src="${VC.esc(p.portada)}" alt="${VC.esc(p.titulo)}" loading="lazy">` : ''}
      <span class="post-cat">${VC.esc(p.categoria || 'Limpieza')}</span>
    </div>
    <div class="post-body">
      <div class="post-meta">
        <span>${VC.icon('i-calendar')}${VC.date(p.fecha)}</span>
        <span>${VC.icon('i-clock')}${VC.readTime(p.contenido)} min</span>
      </div>
      <h3>${VC.esc(p.titulo)}</h3>
      <p>${VC.esc(p.resumen || '')}</p>
      <span class="post-more">Leer nota ${VC.icon('i-arrow')}</span>
    </div>
  </a>`;

/* ---------- Header + scroll effects ---------- */
(() => {
  const header = $('.header');
  const toTop = $('.to-top');
  const bar = $('.progress-bar');
  const onScroll = () => {
    const y = window.scrollY;
    header && header.classList.toggle('is-solid', y > 40);
    toTop && toTop.classList.toggle('show', y > 700);
    if (bar) {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? Math.min(1, y / h) : 0})`;
    }
    const cta = $('.cta-band .bg img');
    if (cta) {
      const r = cta.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) cta.style.transform = `translateY(${(r.top - innerHeight) * 0.12}px)`;
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop && toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  // Active nav link on landing
  const links = $$('.nav a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { links.forEach(l => l.classList.remove('active')); map.get(e.target.id)?.classList.add('active'); }
    }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); s && io.observe(s); });
  }
})();

/* ---------- Mobile menu ---------- */
(() => {
  const btn = $('.burger');
  const menu = $('.mmenu');
  if (!btn || !menu) return;
  const set = (open) => {
    document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.setAttribute('aria-hidden', !open);
  };
  btn.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => set(false)));
  $('.m-close', menu)?.addEventListener('click', () => { set(false); btn.focus(); });
  addEventListener('keydown', e => e.key === 'Escape' && set(false));
  addEventListener('resize', () => innerWidth > 960 && set(false));
})();

/* ---------- Reveal + counters + process line ---------- */
VC.observe = () => {
  const els = $$('.reveal:not(.in), .process:not(.in), [data-count]:not(.counted)');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    if (el.dataset.count !== undefined) countUp(el); else el.classList.add('in');
    io.unobserve(el);
  }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  els.forEach(e => io.observe(e));
};
function countUp(el) {
  el.classList.add('counted');
  const end = parseFloat(el.dataset.count); const dur = 1800; const t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dur); const v = Math.round(end * (1 - Math.pow(1 - p, 3)));
    el.textContent = v.toLocaleString('es-MX');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
VC.observe();

/* ---------- Hero bubbles ---------- */
(() => {
  const box = $('.bubbles');
  if (!box || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const n = innerWidth < 640 ? 10 : 18;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    const size = 10 + Math.random() * 46;
    s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;animation-duration:${12 + Math.random() * 14}s;animation-delay:${-Math.random() * 20}s`;
    box.appendChild(s);
  }
})();

/* ---------- WhatsApp tooltip ---------- */
(() => {
  const tip = $('.wa-tip');
  if (!tip) return;
  let closed = false;
  try { closed = sessionStorage.getItem('vc-tip') === '1'; } catch {}
  if (!closed) setTimeout(() => tip.classList.add('show'), 4500);
  $('button', tip)?.addEventListener('click', () => {
    tip.classList.remove('show');
    try { sessionStorage.setItem('vc-tip', '1'); } catch {}
  });
})();

/* ---------- Forms → WhatsApp ---------- */
$$('form[data-wa]').forEach(f => f.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(f));
  const lines = ['Hola Vitta Clean, me gustaría solicitar una cotización.'];
  if (d.nombre) lines.push(`• Nombre: ${d.nombre}`);
  if (d.empresa) lines.push(`• Empresa: ${d.empresa}`);
  if (d.tipo) lines.push(`• Tipo de espacio: ${d.tipo}`);
  if (d.m2) lines.push(`• Superficie aprox.: ${d.m2} m²`);
  if (d.frecuencia) lines.push(`• Frecuencia: ${d.frecuencia}`);
  if (d.telefono) lines.push(`• Teléfono: ${d.telefono}`);
  if (d.mensaje) lines.push(`• Detalles: ${d.mensaje}`);
  window.open(VC.waLink(lines.join('\n')), '_blank', 'noopener');
}));

/* ---------- Latest posts on home ---------- */
(async () => {
  const box = $('#latest-posts');
  if (!box) return;
  const posts = await VC.loadPosts();
  if (!posts.length) { box.innerHTML = `<div class="empty" style="grid-column:1/-1">${VC.icon('i-book')}<p>Muy pronto publicaremos nuestras primeras notas.</p></div>`; return; }
  box.innerHTML = posts.slice(0, 3).map(VC.card).join('');
  VC.observe();
})();


/* ---------- Efectos dinámicos ---------- */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Títulos palabra por palabra
  if (!reduce) $$('.section-head h2, .unit-text h2, .about-text h2').forEach(h => {
    let i = 0;
    const wrap = (node) => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--i', i++);
          w.appendChild(inner); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) wrap(n);
    });
    wrap(h); h.classList.add('split');
  });
  VC.observe();

  // Texto que se escribe solo en el hero
  const typer = $('.typer');
  if (typer && !reduce) {
    const words = typer.dataset.words.split('|');
    let wi = words.length - 1, ci = words[wi].length, del = true;
    const tick = () => {
      const w = words[wi];
      ci += del ? -1 : 1;
      typer.textContent = w.slice(0, ci);
      let wait = del ? 45 : 85;
      if (!del && ci === w.length) { del = true; wait = 2200; }
      else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; wait = 350; }
      setTimeout(tick, wait);
    };
    setTimeout(tick, 2600);
  }

  if (!fine || reduce) return;

  // Spotlight que sigue al cursor
  document.addEventListener('pointermove', e => {
    const el = e.target.closest?.('.spot, .tilt');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // Tilt 3D en tarjetas de servicios
  $$('.tilt').forEach(card => {
    const g = document.createElement('span'); g.className = 'glare'; card.appendChild(g);
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transition = 'box-shadow .5s';
      card.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-8px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transition = ''; card.style.transform = ''; });
  });

  // Botones magnéticos
  $$('.btn').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${((e.clientX - r.left) / r.width - .5) * 8}px ${((e.clientY - r.top) / r.height - .5) * 6}px`;
    });
    b.addEventListener('pointerleave', () => b.style.translate = '');
  });

  // Parallax con el mouse en el hero
  const hero = $('.hero');
  if (hero) {
    const card = $('.quote-card', hero), bub = $('.bubbles', hero), bg = $('.hero-bg img', hero);
    hero.addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      if (card) card.style.translate = `${x * -14}px ${y * -10}px`;
      if (bub) bub.style.transform = `translate(${x * 26}px, ${y * 18}px)`;
      if (bg) bg.style.translate = `${x * -12}px ${y * -8}px`;
    });
  }
})();

/* ---------- Onda al hacer clic ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('.btn'); if (!b) return;
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
  const s = document.createElement('span'); s.className = 'ripple';
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  b.appendChild(s); setTimeout(() => s.remove(), 700);
});

/* ---------- Year ---------- */
$$('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
