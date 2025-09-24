// main.js

// Smooth anchors (safeguard if not native)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
  });
});

// Rollup: actions héro (si besoin)
const heroCta = document.getElementById('heroCta');
if (heroCta) heroCta.addEventListener('click', () => {
  window.location.href = 'simulateur.html';
});
