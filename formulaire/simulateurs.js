// simulateurs.js
import { openWhatsAppWithMessage } from './include.js';

const presets = {
  maison2p: [
    { nom: 'Éclairage LED', W: 60, h: 4 },
    { nom: 'TV', W: 80, h: 3 },
    { nom: 'Frigo A+', W: 120, h: 8 },
    { nom: 'Chargeurs', W: 30, h: 3 },
  ],
  maison4p: [
    { nom: 'Éclairage LED', W: 90, h: 4 },
    { nom: 'TV', W: 80, h: 3 },
    { nom: 'Frigo A+', W: 120, h: 10 },
    { nom: 'Congélateur', W: 150, h: 6 },
    { nom: 'Pompe petite', W: 250, h: 0.5 },
  ],
  boutique: [
    { nom: 'Éclairage LED', W: 120, h: 6 },
    { nom: 'Caisse/PC', W: 100, h: 6 },
    { nom: 'Caméras', W: 40, h: 24 },
    { nom: 'Frigo vitrine', W: 180, h: 10 },
  ],
};

const resume = document.getElementById('resume');
const resumeList = document.getElementById('resumeList');
const totalWh = document.getElementById('totalWh');
const suggestion = document.getElementById('suggestion');
const autonomie = document.getElementById('autonomie');
const autonomieVal = document.getElementById('autonomieVal');

let current = [];
let autonomyHours = 6;

function render() {
  if (!resume || !resumeList) return;
  if (!current.length) { resume.classList.add('hidden'); return; }
  resume.classList.remove('hidden');
  resumeList.innerHTML = current.map(i => `• ${i.nom}: ${i.W}W × ${i.h}h = <strong>${i.W*i.h} Wh/j</strong>`).join('<br/>');
  const dailyWh = current.reduce((s,i)=> s + i.W*i.h, 0);
  const avgW = Math.round(dailyWh / 24);
  totalWh.textContent = `≈ ${dailyWh} Wh/j • ~${avgW} W moyens`;
  // Suggestion basique (autonomie sur batteries LiFePO4 48V)
  const needWh = avgW * autonomyHours;
  const kWh = Math.ceil((needWh) / 1000);
  suggestion.textContent = `Cible backup: ~${kWh} kWh (autonomie ${autonomyHours}h)`;
}

function usePreset(key) {
  current = presets[key] ? [...presets[key]] : [];
  render();
}

document.querySelectorAll('[data-preset]').forEach(btn=>{
  btn.addEventListener('click', ()=> usePreset(btn.dataset.preset));
});

if (autonomie && autonomieVal) {
  autonomie.addEventListener('input', ()=>{
    autonomyHours = Number(autonomie.value || 6);
    autonomieVal.textContent = autonomyHours;
    render();
  });
}

// Avancé — ajout ligne simple
const formApp = document.getElementById('formApp');
const listApp = document.getElementById('listApp');
if (formApp && listApp) {
  formApp.addEventListener('submit', (e)=>{
    e.preventDefault();
    const inputs = formApp.querySelectorAll('input');
    const nom = inputs[0].value.trim();
    const W = Number(inputs[1].value || 0);
    const h = Number(inputs[2].value || 0);
    if (!nom || W<=0 || h<0) return;
    current.push({ nom, W, h });
    inputs.forEach(i=> i.value='');
    render();
    listApp.innerHTML = current.map((i,idx)=> `<li>${i.nom} — ${i.W}W × ${i.h}h <button data-rm="${idx}" class="ml-2 underline">retirer</button></li>`).join('');
  });

  listApp.addEventListener('click', (e)=>{
    const t = e.target;
    if (t instanceof HTMLElement && t.dataset.rm) {
      const idx = Number(t.dataset.rm);
      current.splice(idx,1);
      render();
      listApp.innerHTML = current.map((i,idx)=> `<li>${i.nom} — ${i.W}W × ${i.h}h <button data-rm="${idx}" class="ml-2 underline">retirer</button></li>`).join('');
    }
  });
}

// Envoyer pour devis (WhatsApp)
const ctaSend = document.getElementById('ctaSend');
if (ctaSend) {
  ctaSend.addEventListener('click', ()=>{
    const dailyWh = current.reduce((s,i)=> s + i.W*i.h, 0);
    const avgW = Math.round(dailyWh / 24);
    const needWh = avgW * autonomyHours;
    const kWh = Math.ceil((needWh) / 1000);
    const text = [
      'Bonjour MED, voici ma simulation :',
      ...current.map(i=> `- ${i.nom}: ${i.W}W x ${i.h}h = ${i.W*i.h}Wh/j`),
      `Total ≈ ${dailyWh} Wh/j (≈ ${avgW} W moyens)`,
      `Backup cible: ~${kWh} kWh pour ${autonomyHours}h`,
      'Merci de me proposer une solution et un devis.'
    ].join('\n');
    openWhatsAppWithMessage(text);
  });
}
