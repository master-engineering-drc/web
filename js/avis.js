// avis.js

// Ouvrir/fermer le dialog
const dlg = document.getElementById('reviewDlg');
const btnOpen = document.getElementById('openReview');
const btnCancel = document.getElementById('cancelReview');

if (btnOpen && dlg) btnOpen.addEventListener('click', ()=> dlg.showModal());
if (btnCancel && dlg) btnCancel.addEventListener('click', ()=> dlg.close());

// Soumission (modération: ne pas injecter dans la liste)
const form = document.getElementById('reviewForm');
if (form) {
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    if (fd.get('website')) return; // honeypot
    const nom = (fd.get('nom')||'').toString().trim();
    const zone = (fd.get('zone')||'').toString().trim();
    const note = Math.max(0, Math.min(5, Number(fd.get('note')||0)));
    const message = (fd.get('message')||'').toString().trim();

    if (!nom || !zone || !message || message.length < 10) {
      alert('Merci de renseigner un avis de 10 à 240 caractères, avec votre prénom et votre zone.');
      return;
    }

    // Ici: remplacer par ton Apps Script / API (POST) si besoin
    // await fetch('https://script.google.com/...', { method:'POST', body: fd });

    alert('Merci ! Votre avis a été soumis et sera publié après vérification.');
    dlg.close();
    form.reset();
  });
}
