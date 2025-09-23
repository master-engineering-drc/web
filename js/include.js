// Injecte header/footer dans les balises <div data-include="/components/header.html"></div>
(async () => {
  const slots = document.querySelectorAll('[data-include]');
  await Promise.all([...slots].map(async el => {
    const url = el.getAttribute('data-include');
    try {
      const res = await fetch(url, { cache: 'no-store' });
      el.innerHTML = res.ok ? await res.text() : `<!-- include fail: ${url} -->`;
    } catch { el.innerHTML = `<!-- include fail: ${url} -->`; }
  }));
})();
