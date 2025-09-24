// js/inject.js
// Injection de fragments HTML (header/footer) + liens actifs + menu mobile + année
// Fonctionne en site statique (GitHub Pages/Hostinger)

const cache = new Map();

async function loadFragment(path) {
  if (cache.has(path)) return cache.get(path);
  const res = await fetch(path, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`Impossible de charger ${path}`);
  const html = await res.text();
  cache.set(path, html);
  return html;
}

// Active le lien du menu correspondant à la page courante
function highlightActive(container) {
  const page = location.pathname.split('/').pop() || 'index.html';
  container.querySelectorAll('[data-nav]').forEach(a => {
    const target = a.getAttribute('data-nav');
    if (target === page) {
      a.classList.add('bg-blue-50','dark:bg-slate-800');
    } else {
      a.classList.remove('bg-blue-50','dark:bg-slate-800');
    }
  });
}

// Menu mobile + année auto
function wireHeaderFooter(root) {
  const menuBtn   = root.querySelector('#menuBtn')   || document.getElementById('menuBtn');
  const mobile    = root.querySelector('#mobileMenu')|| document.getElementById('mobileMenu');
  if (menuBtn && mobile) {
    menuBtn.addEventListener('click', () => mobile.classList.toggle('hidden'));
  }

  const nav = root.querySelector('#mainNav') || document.getElementById('mainNav');
  const mnav= root.querySelector('#mobileNav') || document.getElementById('mobileNav');
  if (nav)  highlightActive(nav);
  if (mnav) highlightActive(mnav);

  const y = root.querySelector('#year') || document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

// Injecte tous les marqueurs [data-include="partials/header.html"]
async function injectAll() {
  const nodes = document.querySelectorAll('[data-include]');
  await Promise.all(Array.from(nodes).map(async node => {
    const src = node.getAttribute('data-include');
    try {
      const html = await loadFragment(src);
      node.outerHTML = html; // remplace le placeholder par le fragment
    } catch (e) {
      console.error(e);
    }
  }));

  // Une fois injecté, relier les comportements (menu, actif, année)
  wireHeaderFooter(document);
}

document.addEventListener('DOMContentLoaded', injectAll);
