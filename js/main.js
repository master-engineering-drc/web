// ---------- Constantes & utilitaires globaux ----------
const waNumber = '243844894508'; // numéro WA unifié
const fmt = n => Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
const val = id => +document.getElementById(id).value || 0;

// ---------- Menu mobile ----------
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

navToggle?.addEventListener('click', () => {
  const isHidden = mobileMenu.classList.contains('hidden');
  mobileMenu.classList.toggle('hidden');
  navToggle.setAttribute('aria-expanded', String(isHidden));
});

// ---------- Lightbox galerie ----------
const dlg = document.getElementById('lightbox');
const lightImg = document.getElementById('lightImg');

document.querySelectorAll('.gl').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    lightImg.src = a.dataset.img;
    dlg.showModal();
  });
});

dlg?.addEventListener('click', () => dlg.close());
// Empêche qu’un clic sur l’image ferme le modal
lightImg?.addEventListener('click', e => e.stopPropagation());

// ---------- Hero -> scroll simulateur ----------
document.getElementById('openSim')?.addEventListener('click', () => {
  document.getElementById('simulateur')?.scrollIntoView({ behavior: 'smooth' });
});

// ---------- Formulaire devis : WA auto + mailto ----------
const f = document.getElementById('devisForm');
const msg = document.getElementById('formMsg');
const waQuick = document.getElementById('waQuick');

function buildWAFromForm(form) {
  const data = new FormData(form);
  const text = `Bonjour MED, je souhaite un devis pour: ${data.get('service') || ''}%0A` +
    `Nom: ${data.get('name') || ''}%0A` +
    `Téléphone: ${data.get('phone') || ''}%0A` +
    `Détails: ${encodeURIComponent(data.get('message') || '')}%0A`;
  return `https://wa.me/${waNumber}?text=${text}`;
}

function refreshWAQuick() {
  if (!f || !waQuick) return;
  if (f.checkValidity()) {
    waQuick.href = buildWAFromForm(f);
    waQuick.removeAttribute('aria-disabled');
    waQuick.classList.remove('opacity-60', 'pointer-events-none');
  } else {
    waQuick.href = '#';
    waQuick.setAttribute('aria-disabled', 'true');
    waQuick.classList.add('opacity-60', 'pointer-events-none');
  }
}

f?.addEventListener('input', refreshWAQuick);

waQuick?.addEventListener('click', (e) => {
  if (!f?.checkValidity()) {
    e.preventDefault();
    f.reportValidity();
    if (msg) msg.textContent = 'Complétez les champs requis avant d’envoyer par WhatsApp.';
  }
});

f?.addEventListener('submit', (e) => {
  if (!f.checkValidity()) {
    e.preventDefault();
    f.reportValidity();
    if (msg) msg.textContent = 'Veuillez compléter tous les champs requis.';
    return;
  }
  e.preventDefault();
  const data = new FormData(f);
  const body = `Nom: ${data.get('name')}%0A` +
    `Téléphone: ${data.get('phone')}%0A` +
    `Service: ${data.get('service')}%0A` +
    `Message: ${encodeURIComponent(data.get('message') || '')}`;
  location.href = `mailto:masterengineeringdrc1@gmail.com?subject=Demande de devis MED&body=${body}`;
  if (msg) msg.textContent = 'Ouverture de votre application mail… Vous pouvez aussi cliquer sur "WhatsApp direct".';
});

// Init
refreshWAQuick();
