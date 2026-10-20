/* ============================================================
   RExec Docs — shared behaviour for sidebar pages
   ============================================================ */

function copyCode(btn) {
  const pre = btn.closest('.pre-wrap').querySelector('pre');
  navigator.clipboard.writeText(pre.innerText).then(() => {
    btn.textContent = 'Copied!'; btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  });
}

function switchTab(e, id) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  e.target.classList.add('active');
  document.getElementById(id).classList.add('active');
}

// Sidebar: highlight the current section and subsection, expand its subsection list.
// Sections are h2s; subsections are h3s plus anything a subsection link points at.
(function () {
  const links = document.querySelectorAll('.doc-sidebar a');
  const groups = document.querySelectorAll('.doc-sidebar .has-sub');
  if (!links.length) return;

  const targets = new Set(document.querySelectorAll('main h2[id], main h3[id]'));
  document.querySelectorAll('.doc-sidebar .sidebar-sub a').forEach(a => {
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (el) targets.add(el);
  });
  const heads = [...targets];

  function setOpen(li, open) {
    li.classList.toggle('open', open);
    li.querySelector('.sub-toggle').setAttribute('aria-expanded', open);
  }
  groups.forEach(li => li.querySelector('.sub-toggle').addEventListener('click', () => {
    li.dataset.manual = '1';
    setOpen(li, !li.classList.contains('open'));
  }));

  function update() {
    let section = '', sub = '';
    heads
      .map(h => ({ h, top: h.getBoundingClientRect().top + window.scrollY }))
      .sort((a, b) => a.top - b.top)
      .forEach(({ h, top }) => {
        if (window.scrollY >= top - 90) {
          if (h.tagName === 'H2') { section = h.id; sub = ''; } else { sub = h.id; }
        }
      });
    links.forEach(l => {
      const id = l.getAttribute('href').slice(1);
      l.classList.toggle('active', id === section || id === sub);
    });
    groups.forEach(li => {
      if (li.dataset.manual) return;
      setOpen(li, li.querySelector(':scope > a').getAttribute('href') === '#' + section);
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
