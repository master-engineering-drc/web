// Dépend de waNumber, fmt()

// ----- Ouverture/fermeture du modal -----
const openReview = document.getElementById('openReview');
const reviewDlg  = document.getElementById('reviewDlg');
const reviewCancel = document.getElementById('reviewCancel');
const reviewForm = document.getElementById('reviewForm');

openReview?.addEventListener('click', () => {
  reviewDlg.showModal();
  reviewForm.reset();
  setRating(0); // force l’utilisateur à choisir une note
});
reviewCancel?.addEventListener('click', () => reviewDlg.close());
reviewDlg?.addEventListener('click', (e) => { if (e.target === reviewDlg) reviewDlg.close(); });

// ----- Étoiles cliquables (demi-notes) -----
const starsEl = document.getElementById('stars');
const ratingInput = document.getElementById('rating');

// CSS inline pour l'effet “moitié remplie”
(() => {
  const style = document.createElement('style');
  style.textContent = `
    #stars{display:flex;gap:.25rem}
    #stars .star{position:relative;font-size:1.75rem;line-height:1;cursor:pointer;color:#d1d5db;user-select:none}
    #stars .star::before{content:"★";position:absolute;inset:0;width:var(--fill,0%);overflow:hidden;color:#fbbf24}
    #stars .star:focus{outline:2px solid #fbbf24;outline-offset:2px;border-radius:.25rem}
  `;
  document.head.appendChild(style);
})();

function renderStars(r){
  starsEl.innerHTML = '';
  for(let i=1;i<=5;i++){
    const s = document.createElement('span');
    s.className = 'star';
    s.textContent = '★';
    s.dataset.i = i;
    s.tabIndex = 0;
    s.setAttribute('role','radio');
    s.setAttribute('aria-checked', String(Math.ceil(r) === i));
    const fillUnit = Math.max(0, Math.min(1, r - (i-1)));
    s.style.setProperty('--fill', (fillUnit*100)+'%');

    // Clic: demi (gauche) / entier (droite)
    s.addEventListener('click', (e)=>{
      const rect = s.getBoundingClientRect();
      const half = ((e.clientX - rect.left) / rect.width) <= 0.5 ? 0.5 : 1.0;
      setRating((i-1) + half);
    });

    // Clavier
    s.addEventListener('keydown',(e)=>{
      let rNow = parseFloat(ratingInput.value||'0') || 0;
      if(e.key==='ArrowRight'){ e.preventDefault(); setRating(Math.min(5, rNow+0.5)); }
      else if(e.key==='ArrowLeft'){ e.preventDefault(); setRating(Math.max(0, rNow-0.5)); }
      else if(e.key==='Home'){ e.preventDefault(); setRating(0); }
      else if(e.key==='End'){ e.preventDefault(); setRating(5); }
      else if(e.key==='Enter' || e.key===' '){ e.preventDefault(); setRating(i); }
    });

    starsEl.appendChild(s);
  }
  ratingInput.value = r;
  if (r < 0.5) ratingInput.setCustomValidity('Veuillez sélectionner une note (0.5 à 5).');
  else ratingInput.setCustomValidity('');
}

function setRating(r){
  const val = Math.max(0, Math.min(5, Math.round((Number(r)||0)*2)/2));
  renderStars(val);
}

// Init étoiles
if (starsEl) setRating(0);

// ===== Avis : charger depuis Google Sheets (Apps Script) =====
(async function loadAndRenderReviews(){
  const list = document.getElementById('reviewsList');
  if (!list) return;

  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxvcaHqc3h2nl-3aNkPUE7uhyyVSmEhGAXKEpY-8FX2H2Tev1q1w6ryP3nzFtGZKtCSaw/exec'; // remplace par ton /exec

  function starsHTML(r){
    const safe = Math.max(0, Math.min(5, Number(r)||0));
    let html = '<div class="flex items-center gap-0.5" aria-label="'+safe+' sur 5">';
    for (let i=1;i<=5;i++){
      const fill = Math.max(0, Math.min(1, safe - (i-1)));
      const pct = Math.round(fill*100);
      html += `
        <span class="relative inline-block align-middle" style="width:1.1em;line-height:1;">
          <span style="color:#e5e7eb">★</span>
          <span style="color:#FFD700;position:absolute;inset:0;width:${pct}%;overflow:hidden">★</span>
        </span>`;
    }
    html += '</div>';
    return html;
  }

  function fmtDate(d){
    const dt = new Date(d);
    return isNaN(dt) ? (d||'') : dt.toLocaleDateString(undefined, {year:'numeric',month:'2-digit',day:'2-digit'});
  }

  function card({name, rating, message, date}){
    const wrap = document.createElement('article');
    wrap.className = "snap-start min-w-[280px] sm:min-w-[320px] bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-700 rounded-xl p-5 shadow-card dark:text-white";
    const stars = document.createElement('div'); stars.innerHTML = starsHTML(rating);
    const p = document.createElement('p'); p.textContent = message || '';
    const small = document.createElement('small'); small.className="text-muted dark:text-gray-300";
    small.textContent = `— ${name || 'Client'}${date ? ' • '+fmtDate(date) : ''}`;
    wrap.appendChild(stars); wrap.appendChild(p); wrap.appendChild(small);
    return wrap;
  }

  list.innerHTML = `
    <article class="snap-start min-w-[280px] sm:min-w-[320px] bg-white/60 dark:bg-[#111827]/60 border border-dashed border-gray-300 rounded-xl p-5">
      <small class="text-muted">Chargement des avis…</small>
    </article>`;

  try {
    const res = await fetch(ENDPOINT, {cache:'no-store'});
    if (!res.ok) throw new Error('HTTP '+res.status);
    const rows = await res.json();

    const items = (rows || []).map(x => ({
      date:   x.date   ?? x.Date   ?? '',
      name:   x.name   ?? x.Nom    ?? 'Client',
      rating: parseFloat(x.rating ?? x.note ?? x.Rating ?? x.Note) || 0,
      message:x.message?? x.Message?? ''
    }));

    items.sort((a,b)=>{
      const A = new Date(a.date), B = new Date(b.date);
      return (isNaN(B)-isNaN(A)) || (B - A);
    });

    list.innerHTML = '';
    if (!items.length) {
      list.innerHTML = '<p class="text-muted">Aucun avis pour le moment.</p>';
      return;
    }
    items.forEach(r => list.appendChild(card(r)));
  } catch (e) {
    list.innerHTML = '<p class="text-muted">Impossible de charger les avis pour l’instant.</p>';
  }
})();

// ----- Envoi WhatsApp / Email / Publication -----
const reviewWA   = document.getElementById('reviewWA');
const reviewMail = document.getElementById('reviewMail');
const reviewPublish = document.getElementById('reviewPublish');

function getReviewPayload(){
  const data = new FormData(reviewForm);
  const name = (data.get('name')||'').toString().trim();
  const rating = (data.get('rating')||'0').toString();
  const msgTxt = (data.get('message')||'').toString().trim();
  const hp  = (document.getElementById('hp_website')?.value || '');
  return { name, rating, msgTxt, hp };
}

function validateReview(){
  if (!reviewForm.checkValidity()) { reviewForm.reportValidity(); return false; }
  const r = +(ratingInput?.value || 0);
  if (!(r >= 0.5 && r <= 5 && r % 0.5 === 0)) { ratingInput.reportValidity(); return false; }
  return true;
}

reviewWA?.addEventListener('click', (e) => {
  if (!validateReview()) { e.preventDefault(); return; }
  const { name, rating, msgTxt } = getReviewPayload();
  const text = `Nouvel avis%0A%0ANom: ${encodeURIComponent(name)}%0ANote: ${rating}/5%0AMessage:%0A${encodeURIComponent(msgTxt)}`;
  const wa = `https://wa.me/${waNumber}?text=${text}`;
  window.open(wa, '_blank');
  reviewDlg.close();
});

reviewMail?.addEventListener('click', (e) => {
  if (!validateReview()) { e.preventDefault(); return; }
  const { name, rating, msgTxt } = getReviewPayload();
  const body = `Nom: ${encodeURIComponent(name)}%0ANote: ${encodeURIComponent(rating)}/5%0A%0A${encodeURIComponent(msgTxt)}`;
  location.href = `mailto:masterengineeringdrc1@gmail.com?subject=Avis client MED&body=${body}`;
  reviewDlg.close();
});

reviewPublish?.addEventListener('click', async () => {
  if (!validateReview()) return;
  const btn = reviewPublish;
  const { name, rating, msgTxt, hp } = getReviewPayload();

  btn.disabled = true;
  const oldTxt = btn.textContent;
  btn.textContent = 'Publication…';

  try {
    const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxvcaHqc3h2nl-3aNkPUE7uhyyVSmEhGAXKEpY-8FX2H2Tev1q1w6ryP3nzFtGZKtCSaw/exec'; // remplace par ton /exec
    const body = new URLSearchParams({ name, rating: String(rating), message: msgTxt, hp });
    const res = await fetch(ENDPOINT, { method:'POST', body });

    let ok = res.ok;
    let json = null;
    try { json = await res.json(); if ('ok' in (json||{})) ok = !!json.ok; } catch {}

    if (!ok) throw new Error((json && json.error) || ('HTTP '+res.status));

    // Prépend la carte localement
    const list = document.getElementById('reviewsList');
    if (list) {
      const wrap = document.createElement('article');
      wrap.className = "snap-start min-w-[280px] sm:min-w-[320px] bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-700 rounded-xl p-5 shadow-card dark:text-white";
      wrap.innerHTML = `
        <div class="mb-2">${(function(){ // étoiles read-only
          const r = parseFloat(rating)||0; let html=''; 
          for(let i=1;i<=5;i++)
            { 
                const fill=Math.max(0,Math.min(1,r-(i-1))); 
                const pct=Math.round(fill*100);
                html+=`
                    <span class="relative inline-block align-middle" style="width:1.1em;line-height:1;">
                        <span style="color:#e5e7eb">★</span>
                        <span style="color:#FFD700;position:absolute;inset:0;width:\${pct}%;overflow:hidden">★</span>
                    </span>
                `;
            } 
                return html; })()}
        </div>
        <p>${(msgTxt||'').replace(/[<>&]/g, s=>({ '<':'&lt;','>':'&gt;','&':'&amp;' }[s]))}</p>
        <small class="text-muted dark:text-gray-300">— ${name || 'Client'} • ${new Date().toLocaleDateString()}</small>`;
      list.prepend(wrap);
    }

    reviewDlg.close();
    reviewForm.reset();
    setRating(0);
    alert('Merci ! Votre avis a été publié.');
  } catch (err) {
    alert("Échec de la publication de l'avis. Réessayez plus tard.");
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.textContent = oldTxt;
  }
});
