/* VittaClean · Blog (listado y nota) */
(async () => {
  const listBox = document.getElementById('blog-list');
  const article = document.getElementById('article');
  if (!listBox && !article) return;
  const posts = await VC.loadPosts();

  /* ---------- Listado ---------- */
  if (listBox) {
    const featBox = document.getElementById('blog-featured');
    const chipsBox = document.getElementById('blog-chips');
    const search = document.getElementById('blog-search');
    const cats = ['Todas', ...new Set(posts.map(p => p.categoria).filter(Boolean))];
    let cat = 'Todas', q = '';
    chipsBox.innerHTML = cats.map((c, i) => `<button class="chip${i ? '' : ' active'}" data-cat="${VC.esc(c)}">${VC.esc(c)}</button>`).join('');
    chipsBox.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      cat = b.dataset.cat;
      chipsBox.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === b));
      render();
    });
    search.addEventListener('input', () => { q = search.value.trim().toLowerCase(); render(); });

    const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    function render() {
      const nq = norm(q);
      const list = posts.filter(p => (cat === 'Todas' || p.categoria === cat) &&
        (!nq || norm(p.titulo + ' ' + p.resumen + ' ' + p.categoria).includes(nq)));
      if (!list.length) {
        featBox.innerHTML = '';
        listBox.innerHTML = `<div class="empty" style="grid-column:1/-1">${VC.icon('i-search')}<p>No encontramos notas con ese criterio.</p></div>`;
        return;
      }
      const [first, ...rest] = list;
      featBox.innerHTML = `
        <a class="featured reveal" href="notab482.html?n=${encodeURIComponent(first.slug)}">
          <div class="post-thumb">${first.portada ? `<img src="${VC.esc(first.portada)}" alt="${VC.esc(first.titulo)}">` : ''}<span class="post-cat">${VC.esc(first.categoria || 'Limpieza')}</span></div>
          <div class="post-body">
            <span class="tag-new">${VC.icon('i-sparkles')} Nota destacada</span>
            <div class="post-meta"><span>${VC.icon('i-calendar')}${VC.date(first.fecha)}</span><span>${VC.icon('i-clock')}${VC.readTime(first.contenido)} min de lectura</span></div>
            <h2>${VC.esc(first.titulo)}</h2>
            <p>${VC.esc(first.resumen || '')}</p>
            <span class="post-more">Leer nota completa ${VC.icon('i-arrow')}</span>
          </div>
        </a>`;
      listBox.innerHTML = rest.map(VC.card).join('');
      VC.observe();
    }
    render();
  }

  /* ---------- Nota individual ---------- */
  if (article) {
    const slug = new URLSearchParams(location.search).get('n');
    const p = posts.find(x => x.slug === slug);
    if (!p) {
      document.getElementById('a-title').textContent = 'Nota no encontrada';
      document.getElementById('a-lead').textContent = 'Es posible que la nota haya sido movida o eliminada.';
      article.innerHTML = `<div class="empty">${VC.icon('i-book')}<p>Regresa al blog para ver todas nuestras notas.</p><a class="btn btn--navy" href="blog.html">Ir al blog</a></div>`;
      document.getElementById('a-cover').remove();
      return;
    }
    document.title = `${p.titulo} | Blog Vitta Clean`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', p.resumen || '');
    document.getElementById('a-crumb').textContent = p.categoria || 'Nota';
    document.getElementById('a-cat').textContent = p.categoria || 'Limpieza';
    document.getElementById('a-title').textContent = p.titulo;
    document.getElementById('a-lead').textContent = p.resumen || '';
    document.getElementById('a-meta').innerHTML = `
      <span>${VC.icon('i-calendar')}${VC.date(p.fecha)}</span>
      <span>${VC.icon('i-clock')}${VC.readTime(p.contenido)} min de lectura</span>
      <span>${VC.icon('i-users')}${VC.esc(p.autor || 'Equipo Vitta Clean')}</span>`;
    const cover = document.getElementById('a-cover');
    if (p.portada) cover.innerHTML = `<img src="${VC.esc(p.portada)}" alt="${VC.esc(p.titulo)}">`; else cover.remove();
    article.innerHTML = p.contenido || '';

    const url = location.href;
    const t = encodeURIComponent(p.titulo);
    document.getElementById('share').innerHTML = `
      <span>Compartir</span>
      <a href="https://wa.me/?text=${t}%20${encodeURIComponent(url)}" target="_blank" rel="noopener" aria-label="Compartir en WhatsApp">${VC.icon('i-whatsapp', 'ic ic-fill')}</a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener" aria-label="Compartir en Facebook">${VC.icon('i-facebook', 'ic ic-fill')}</a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener" aria-label="Compartir en LinkedIn">${VC.icon('i-linkedin', 'ic ic-fill')}</a>
      <button type="button" id="copy-link" aria-label="Copiar enlace">${VC.icon('i-link')}</button>`;
    document.getElementById('copy-link').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(url); } catch {}
      const tt = document.querySelector('.toast'); tt.classList.add('show'); setTimeout(() => tt.classList.remove('show'), 2000);
    });

    const rel = posts.filter(x => x.slug !== p.slug).slice(0, 3);
    document.getElementById('related').innerHTML = rel.length ? rel.map(r => `
      <a class="mini-post" href="nota6e75.html?n=${encodeURIComponent(r.slug)}">
        ${r.portada ? `<img src="${VC.esc(r.portada)}" alt="" loading="lazy">` : ''}
        <span><strong>${VC.esc(r.titulo)}</strong><small>${VC.date(r.fecha)}</small></span>
      </a>`).join('') : '<p style="margin:0;color:var(--muted)">Pronto más notas.</p>';
  }
})();
