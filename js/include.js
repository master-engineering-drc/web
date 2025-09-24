// js/include.js

// ---------------------------
// Menu mobile (toggle + close)
// ---------------------------
(function () {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');

  if (!btn || !menu) return;

  const open = () => {
    menu.classList.remove('hidden');
    btn.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeydown);
  };

  const close = () => {
    menu.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onKeydown);
  };

  const toggle = () => (menu.classList.contains('hidden') ? open() : close());

  // Clic sur le bouton (ou ses enfants, ex: icône svg)
  document.addEventListener('click', (e) => {
    if (!btn) return;
    if (e.target === btn || (e.target && btn.contains(e.target))) {
      e.preventDefault();
      toggle();
    }
  });

  // Fermer si clic en dehors
  function onDocClick(e) {
    if (menu.contains(e.target) || btn.contains(e.target)) return;
    close();
  }

  // Fermer avec Escape
  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }

  // Fermer si un lien du menu est cliqué
  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) close();
  });
})();

// ---------------------------
// Année automatique
// ---------------------------
(function () {
  const year = String(new Date().getFullYear());
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = year;
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = year));
})();

// ---------------------------
// WhatsApp helper (global)
// ---------------------------
(function () {
  const waNumber = '243990880720';
  window.openWhatsAppWithMessage = function openWhatsAppWithMessage(text) {
    const msg = encodeURIComponent(text || '');
    window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank', 'noopener');
  };
})();

// -------------------------------------------------------
// Préremplissage cross-page depuis liens a[data-prefill]
// (info / devis / planifier) -> support.html?subject=&msg=
// -------------------------------------------------------
(function () {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-prefill]');
    if (!a) return;

    const intent = (a.getAttribute('data-prefill') || '').toLowerCase(); // 'info' | 'devis' | 'planifier'
    if (!intent) return;

    // Cherche un titre pertinent (h3 dans la carte, sinon texte du lien)
    const card = a.closest('.service-card') || a.closest('article, section, div');
    const title =
      card?.querySelector('h3')?.innerText?.trim() ||
      a.getAttribute('data-title') ||
      a.innerText?.trim() ||
      'Service MED';

    let subject = title;
    let msg = '';

    if (intent === 'info') {
      msg =
`Bonjour MED,
Je souhaite des informations sur : "${title}".
Pouvez-vous me recontacter avec une estimation et les délais ?
Merci.`;
    } else if (intent === 'devis') {
      subject = `Devis — ${title}`;
      msg =
`Bonjour MED,
Je souhaite un devis détaillé pour : "${title}".
Contexte / adresse :
Budget indicatif :
Délais souhaités :
Merci.`;
    } else if (intent === 'planifier') {
      subject = `Planification — ${title}`;
      msg =
`Bonjour MED,
Je souhaite planifier une intervention pour : "${title}".
Créneaux possibles :
Adresse :
Merci.`;
    } else {
      // défaut = info
      msg =
`Bonjour MED,
Je souhaite des informations sur : "${title}".
Merci.`;
    }

    const rawHref = a.getAttribute('href') || 'support.html';
    const url = new URL(rawHref, location.href);       // gère chemins relatifs/absolus
    const params = url.searchParams;                   // conserve les params existants

    params.set('subject', subject);
    params.set('msg', msg);
    url.hash = 'contact';

    a.href = url.toString(); // un seul "?" et encodage correct
    // Laisse le navigateur suivre le lien mis à jour
  });
})();

// ---------------------------
// Form contact (mailto:)
// ---------------------------
(function () {
  const cf = document.getElementById('contactForm');
  if (!cf) return;

  cf.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(cf);
    if (fd.get('website')) return; // honeypot

    const nom = (fd.get('nom') || '').toString().trim();
    const tel = (fd.get('tel') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const subjectField = (fd.get('subject') || '').toString().trim();
    const msg = (fd.get('msg') || '').toString().trim();

    if (!nom || !tel || !msg) {
      alert('Veuillez remplir au moins : Nom, Téléphone et Message.');
      return;
    }

    const subject = encodeURIComponent(subjectField || `Contact MED — ${nom}`);
    const body = encodeURIComponent(
      `Nom: ${nom}\nTel: ${tel}\nEmail: ${email}\n\nMessage:\n${msg}`
    );

    window.location.href = `mailto:contact@masterengineeringdrc.com?subject=${subject}&body=${body}`;
    cf.reset();
  });
})();

// ------------------------------------------------------
// Préremplissage depuis ?msg=&subject= (page Contact)
// ------------------------------------------------------
(function () {
  const qs = new URLSearchParams(location.search);
  const msg = qs.get('msg');
  const subject = qs.get('subject');

  const messageField =
    document.querySelector('#message') ||
    document.querySelector('textarea[name="msg"]') ||
    document.querySelector('#contact-message') ||
    document.querySelector('form textarea');

  const subjectField =
    document.querySelector('#subject') ||
    document.querySelector('input[name="subject"]');

  if (subject && subjectField) {
    subjectField.value = subject;
    subjectField.dispatchEvent(new Event('input', { bubbles: true }));
  }

  if (msg && messageField) {
    messageField.value = msg;
    messageField.dispatchEvent(new Event('input', { bubbles: true }));
    if (location.hash !== '#contact') location.hash = '#contact';
    // focus après un micro délai pour laisser le scroll se faire
    setTimeout(() => messageField.focus({ preventScroll: false }), 0);
  }
})();

// -------------------------------------------
// Dialog avis (ouverture, fermeture, backdrop)
// -------------------------------------------
(function () {
  const dlg = document.getElementById('reviewDlg');
  const openBtn = document.getElementById('openReview');
  const cancelBtn = document.getElementById('cancelReview');

  if (openBtn && dlg?.showModal) {
    openBtn.addEventListener('click', () => dlg.showModal());
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => dlg.close());
  }

  if (dlg) {
    // Fermer en cliquant en dehors du formulaire
    dlg.addEventListener('click', (e) => {
      const form = dlg.querySelector('form');
      const rect = form?.getBoundingClientRect();
      if (!rect) return;
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) dlg.close();
    });

    // Échap est géré nativement par <dialog>, mais on s’assure
    dlg.addEventListener('cancel', (e) => {
      e.preventDefault();
      dlg.close();
    });
  }
})();
