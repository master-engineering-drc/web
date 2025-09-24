/* =========================================================
   simulateurs.js — MED (unifié)
   - Onglets (3 secteurs)
   - Simulateurs : SNEL / PV+Batterie / Groupe électrogène
   - Catalogue vignettes S/M/L (ajout direct dans les tableaux)
   ========================================================= */

/* ===== Helpers ===== */
const qs  = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => [...r.querySelectorAll(s)];
const nf  = (n, d=2) => Number.isFinite(n) ? n.toFixed(d) : '—';
const hoursFmt = h => {
  if (!Number.isFinite(h) || h <= 0) return '—';
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  return `${hh} h ${String(mm).padStart(2,'0')} min`;
};
function setStatus(el, level, text){
  if (!el) return;
  const base = "px-2 py-1 rounded border text-sm";
  const map = {
    ok:   "bg-green-100 text-green-900 border-green-300",
    warn: "bg-amber-100 text-amber-900 border-amber-300",
    bad:  "bg-red-100 text-red-900 border-red-300",
    idle: "bg-white/10 text-white border-white/30"
  };
  el.className = `${base} ${map[level] || map.idle}`;
  el.textContent = text || '—';
}

/* ===== Onglets ===== */
function setupTabs(){
  const tabs = qsa('.sim-tab');
  const panels = qsa('.sim-panel');
  if (!tabs.length || !panels.length) return;

  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tabs.forEach(b=>{
        b.classList.remove('bg-white','text-brand','border-black');
        b.classList.add('bg-white/10','text-white','border-white/30');
        b.setAttribute('aria-selected','false');
      });
      btn.classList.add('bg-white','text-brand','border-black');
      btn.classList.remove('bg-white/10','text-white','border-white/30');
      btn.setAttribute('aria-selected','true');

      const target = btn.getAttribute('data-target');
      panels.forEach(p=>p.classList.add('hidden'));
      const panel = qs(target);
      panel && panel.classList.remove('hidden');
    });
  });
}

/* ===== Constructeurs de lignes ===== */
function makeRowGrid(){
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input placeholder="Nom" class="w-full p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-800"></td>
    <td><input type="number" value="100" min="0" class="w-24 p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-800"></td>
    <td><input type="number" value="1" min="0" step="0.1" class="w-20 p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-800"></td>
    <td><button class="px-2 py-1 rounded border">✖</button></td>`;
  tr.querySelector('button').addEventListener('click', ()=>{ tr.remove(); recalcGrid(); });
  tr.querySelectorAll('input').forEach(i=> i.addEventListener('input', recalcGrid));
  return tr;
}
function makeRowPV(){
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input placeholder="Nom" class="w-full p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-800"></td>
    <td><input type="number" value="100" min="0" class="w-24 p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-800"></td>
    <td><input type="number" value="1" min="0" step="0.1" class="w-20 p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-800"></td>
    <td><button class="px-2 py-1 rounded border">✖</button></td>`;
  tr.querySelector('button').addEventListener('click', ()=>{ tr.remove(); recalcPV(); });
  tr.querySelectorAll('input').forEach(i=> i.addEventListener('input', recalcPV));
  return tr;
}
function makeRowGen(){
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input placeholder="Nom" class="w-full p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-800"></td>
    <td><input type="number" value="100" min="0" class="w-24 p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-800"></td>
    <td><input type="number" value="1" min="1" step="0.1" class="w-28 p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-800" title="Facteur de pic (ex: 3 pour moteurs)"></td>
    <td><button class="px-2 py-1 rounded border">✖</button></td>`;
  tr.querySelector('button').addEventListener('click', ()=>{ tr.remove(); recalcGen(); });
  tr.querySelectorAll('input').forEach(i=> i.addEventListener('input', recalcGen));
  return tr;
}

/* ===== SNEL (compteur) ===== */
function setupGrid(){
  const addBtn = qs('#grid_add');
  const presets = qs('#grid_presets');
  const kwhInput = qs('#grid_kwh');
  const tarifInput = qs('#grid_tarif');
  const tbody = qs('#grid_rows');

  if (!tbody) return;

  addBtn && addBtn.addEventListener('click', ()=>{ tbody.appendChild(makeRowGrid()); recalcGrid(); });
  presets && presets.addEventListener('change', e=>{
    if(!e.target.value) return;
    const [n,w,h] = e.target.value.split(',');
    const tr = makeRowGrid();
    const ins = tr.querySelectorAll('input');
    ins[0].value = n; ins[1].value = +w; ins[2].value = +h;
    tbody.appendChild(tr); e.target.value=''; recalcGrid();
  });
  kwhInput && kwhInput.addEventListener('input', recalcGrid);
  tarifInput && tarifInput.addEventListener('input', recalcGrid);

  // Ligne initiale
  tbody.appendChild(makeRowGrid());
  recalcGrid();
}
function recalcGrid(){
  const tbody = qs('#grid_rows');
  if (!tbody) return;

  let dailyWh = 0;
  tbody.querySelectorAll('tr').forEach(tr=>{
    const ins = tr.querySelectorAll('input');
    const w = +ins[1].value || 0;
    const h = +ins[2].value || 0;
    dailyWh += w*h;
  });
  const kwhDay = dailyWh/1000;
  const credit = +(+qs('#grid_kwh')?.value || 0);
  const days = credit>0 && kwhDay>0 ? credit / kwhDay : 0;
  const tarif = +(+qs('#grid_tarif')?.value || 0) || null;

  const kwhDayEl = qs('#grid_kwh_day');
  const daysEl   = qs('#grid_days');
  const costEl   = qs('#grid_cost');
  const stEl     = qs('#grid_status');

  kwhDayEl && (kwhDayEl.textContent = nf(kwhDay));
  daysEl && (daysEl.textContent = days ? (days>=1 ? `${nf(days,1)} jours` : `${nf(days*24,1)} h`) : '—');
  costEl && (costEl.textContent = (tarif && kwhDay>0) ? `Coût/jour : ${new Intl.NumberFormat().format(Math.round(kwhDay*tarif))} CDF` : 'Coût/jour : —');

  if (!credit || kwhDay<=0) return setStatus(stEl,'idle','—');
  if (days >= 1)      setStatus(stEl,'ok','✅ OK — votre achat couvre ≥ 1 jour');
  else if (days>=0.25)setStatus(stEl,'warn','⚠️ À surveiller — < 1 jour');
  else                setStatus(stEl,'bad','⛔ Dépassé — très faible durée');
}

/* ===== Solaire (PV + batterie) ===== */
function setupPV(){
  const addBtn = qs('#pv_add');
  const presets = qs('#pv_presets');
  const inputs = ['#pv_n','#pv_w','#pv_psh','#pv_eff','#pv_v','#pv_ah','#pv_dod','#pv_invkw']
    .map(id=>qs(id));
  const tbody = qs('#pv_rows');
  if (!tbody) return;

  addBtn && addBtn.addEventListener('click', ()=>{ tbody.appendChild(makeRowPV()); recalcPV(); });
  presets && presets.addEventListener('change', e=>{
    if(!e.target.value) return;
    const [n,w,h] = e.target.value.split(',');
    const tr = makeRowPV();
    const ins = tr.querySelectorAll('input');
    ins[0].value = n; ins[1].value = +w; ins[2].value = +h;
    tbody.appendChild(tr); e.target.value=''; recalcPV();
  });
  inputs.forEach(el=> el && el.addEventListener('input', recalcPV));

  // Ligne initiale
  tbody.appendChild(makeRowPV());
  recalcPV();
}
function recalcPV(){
  const tbody = qs('#pv_rows');
  if (!tbody) return;

  // Production
  const n   = +(+qs('#pv_n')?.value || 0);
  const w   = +(+qs('#pv_w')?.value || 0);
  const psh = +(+qs('#pv_psh')?.value || 0);
  const eff = +(+qs('#pv_eff')?.value || 0.75);
  const pvDayKWh = (n*w*psh*eff)/1000;
  qs('#pv_kwh_prod') && (qs('#pv_kwh_prod').textContent = nf(pvDayKWh));

  // Conso + pic (hypothèse : simultané pour test onduleur)
  let dailyWh = 0, peakW = 0;
  tbody.querySelectorAll('tr').forEach(tr=>{
    const ins = tr.querySelectorAll('input');
    const w = +ins[1].value || 0;
    const h = +ins[2].value || 0;
    dailyWh += w*h;
    peakW += w;
  });
  const kwhDay = dailyWh/1000;
  qs('#pv_kwh_day') && (qs('#pv_kwh_day').textContent = nf(kwhDay));
  const balance = pvDayKWh - kwhDay;
  qs('#pv_kwh_balance') && (qs('#pv_kwh_balance').textContent = (balance>=0 ? '+' : '') + nf(balance) + ' kWh/j');

  // Batterie & autonomie (toutes charges en même temps)
  const V   = +(+qs('#pv_v')?.value || 0);
  const Ah  = +(+qs('#pv_ah')?.value || 0);
  const DoD = +(+qs('#pv_dod')?.value || 0.8);
  const usableWh = V*Ah*DoD; // simplifié
  const runtimeH = peakW>0 ? usableWh/peakW : 0;
  qs('#pv_runtime') && (qs('#pv_runtime').textContent = runtimeH ? hoursFmt(runtimeH) : '—');

  // Onduleur check (budget 80%)
  const invKW = +(+qs('#pv_invkw')?.value || 0);
  const invBudgetW = invKW*1000*0.8;
  const st = qs('#pv_status');
  if (invBudgetW<=0) return setStatus(st,'idle','—');
  if (peakW<=invBudgetW && balance>=0) setStatus(st,'ok','✅ OK — onduleur & production journalière suffisants');
  else if (peakW<=invBudgetW || balance>=0) setStatus(st,'warn','⚠️ À surveiller — limite onduleur ou énergie jour');
  else setStatus(st,'bad','⛔ Dépassé — onduleur/énergie insuffisants');
}

/* ===== Estimation conso carburant (Auto) =====
   Hypothèses pédagogiques :
   - Diesel ≈ 0.30 L/kWh à charge moyenne
   - Essence ≈ 0.46 L/kWh à charge moyenne
   - Surcoût à faible charge, léger surcoût proche 100%
   - Planche minimale (ralenti) : diesel 0.2 L/h, essence 0.3 L/h
*/
function estimateFuelLph(runW, kva, pf, type='diesel'){
  const kwRated = Math.max(0, kva * pf);              // kW dispo
  const kwOut   = Math.min(runW/1000, kwRated);       // kW réellement fournis (borné)
  const f       = (kwRated > 0) ? (kwOut / kwRated) : 0;  // taux de charge 0..1

  const baseLkWh = (type === 'essence') ? 0.46 : 0.30;    // L/kWh de base
  let mult;                                               // pénalités/bonus
  if (f <= 0.25)      mult = 1.30;  // très faible charge → moins efficient
  else if (f <= 0.50) mult = 1.10;
  else if (f <= 0.80) mult = 1.00;  // zone efficace
  else                mult = 1.05;  // proche pleine charge

  const idleFloor = (type === 'essence') ? 0.30 : 0.20;   // L/h mini
  const lph = Math.max(idleFloor, kwOut * baseLkWh * mult);
  return lph; // L/h
}

/* ===== Groupe électrogène ===== */
function setupGen(){
  const addBtn = qs('#gen_add');
  const presets = qs('#gen_presets');
  const inputs = ['#gen_kva','#gen_pf','#gen_cont','#gen_tank','#gen_fuel','#gen_type','#gen_auto']
    .map(id=>qs(id));
  const tbody = qs('#gen_rows');
  if (!tbody) return;

  addBtn && addBtn.addEventListener('click', ()=>{ tbody.appendChild(makeRowGen()); recalcGen(); });
  presets && presets.addEventListener('change', e=>{
    if(!e.target.value) return;
    const [n,w,pic] = e.target.value.split(',');
    const tr = makeRowGen();
    const ins = tr.querySelectorAll('input');
    ins[0].value = n; ins[1].value = +w; ins[2].value = +pic;
    tbody.appendChild(tr); e.target.value=''; recalcGen();
  });

  // Mode Auto/Manuel pour la conso L/h
  const autoChk = qs('#gen_auto');
  const fuelIn  = qs('#gen_fuel');
  function syncFuelMode(){
    if (!autoChk || !fuelIn) return;
    if (autoChk.checked){
      fuelIn.setAttribute('disabled','disabled');
      fuelIn.classList.add('opacity-60','cursor-not-allowed');
    }else{
      fuelIn.removeAttribute('disabled');
      fuelIn.classList.remove('opacity-60','cursor-not-allowed');
    }
  }
  autoChk && autoChk.addEventListener('change', ()=>{ syncFuelMode(); recalcGen(); });

  inputs.forEach(el=> el && el.addEventListener('input', recalcGen));

  // Ligne initiale
  tbody.appendChild(makeRowGen());
  syncFuelMode();
  recalcGen();
}
function recalcGen(){
  const tbody = qs('#gen_rows');
  if (!tbody) return;

  const kva   = +(+qs('#gen_kva')?.value || 0);
  const pf    = +(+qs('#gen_pf')?.value || 0);
  const cont  = +(+qs('#gen_cont')?.value || 0.8);
  const kw    = kva*pf;
  const contW = kw*1000*cont;

  let runW = 0, peakW = 0;
  tbody.querySelectorAll('tr').forEach(tr=>{
    const ins = tr.querySelectorAll('input');
    const w = +ins[1].value || 0;
    const surge = +ins[2].value || 1;
    runW += w;
    peakW += w*surge;
  });

  qs('#gen_budget') && (qs('#gen_budget').textContent = nf(contW,0) + ' W');
  qs('#gen_run')    && (qs('#gen_run').textContent    = nf(runW,0) + ' W');
  qs('#gen_peak')   && (qs('#gen_peak').textContent   = nf(peakW,0) + ' W');

  const st = qs('#gen_status');
  if (contW<=0) setStatus(st,'idle','—');
  else if (runW<=contW && peakW<=kw*1000) setStatus(st,'ok','✅ OK — dans la plage du groupe');
  else if (runW<=contW*1.1 && peakW<=kw*1000*1.05) setStatus(st,'warn','⚠️ À surveiller — proche des limites');
  else setStatus(st,'bad','⛔ Dépassé — réduisez les charges');

  // Carburant & autonomie
  const tank     = +(+qs('#gen_tank')?.value || 0);
  const manualLPH= +(+qs('#gen_fuel')?.value || 0);
  const auto     = !!qs('#gen_auto')?.checked;
  const type     = (qs('#gen_type')?.value || 'diesel').toLowerCase();

  let lph = 0; // litres/heure
  if (auto){
    lph = estimateFuelLph(runW, kva, pf, type);
  }else{
    lph = (manualLPH > 0) ? manualLPH : 0;
  }

  const rt = (tank>0 && lph>0) ? (tank / lph) : 0;
  qs('#gen_lph')     && (qs('#gen_lph').textContent     = lph ? `${nf(lph,2)} L/h` : '—');
  qs('#gen_runtime') && (qs('#gen_runtime').textContent = rt ? hoursFmt(rt) : '—');
}

/* ===== Catalogue vignettes (S / M / L) ===== */
const CATALOG = [
  { name:'Ampoule LED', cat:'Éclairage', h:5, surge:1, sizes:[{t:'S',w:7},{t:'M',w:10},{t:'L',w:15}] },
  { name:'TV LED', cat:'Multimédia', h:4, surge:1, sizes:[{t:'S',w:45},{t:'M',w:70},{t:'L',w:120}] },
  { name:'Réfrigérateur', cat:'Froid', h:12, surge:3, sizes:[{t:'S',w:120},{t:'M',w:150},{t:'L',w:200}] },
  { name:'Congélateur',   cat:'Froid', h:12, surge:3, sizes:[{t:'S',w:120},{t:'M',w:150},{t:'L',w:200}] },
  { name:'Ventilateur', cat:'Confort', h:6, surge:1.2, sizes:[{t:'S',w:35},{t:'M',w:55},{t:'L',w:90}] },
  { name:'Climatiseur (split)', cat:'Confort', h:4, surge:3, sizes:[{t:'S',w:900},{t:'M',w:1200},{t:'L',w:1800}] },
  { name:'Pompe à eau', cat:'Pompage', h:1, surge:3, sizes:[{t:'S',w:400},{t:'M',w:750},{t:'L',w:1500}] },
  { name:'Ordinateur portable', cat:'Bureautique', h:5, surge:1,   sizes:[{t:'S',w:45},{t:'M',w:65},{t:'L',w:85}] },
  { name:'Ordinateur de bureau',cat:'Bureautique', h:5, surge:1.2, sizes:[{t:'S',w:150},{t:'M',w:250},{t:'L',w:400}] },
  { name:'Routeur/Box Internet',cat:'Bureautique', h:24, surge:1, sizes:[{t:'S',w:8},{t:'M',w:12},{t:'L',w:20}] },
  { name:'Micro-ondes', cat:'Cuisine', h:0.5, surge:1.5, sizes:[{t:'S',w:700},{t:'M',w:1000},{t:'L',w:1200}] },
  { name:'Bouilloire',  cat:'Cuisine', h:0.3, surge:1.5, sizes:[{t:'S',w:1500},{t:'M',w:2000},{t:'L',w:2200}] },
  { name:'Fer à repasser', cat:'Entretien', h:1, surge:1.3, sizes:[{t:'S',w:1200},{t:'M',w:1800},{t:'L',w:2200}] },
  { name:'Lave-linge',     cat:'Entretien', h:1, surge:2,   sizes:[{t:'S',w:500},{t:'M',w:1000},{t:'L',w:1500}] },
  { name:'Chauffe-eau', cat:'Eau chaude', h:2, surge:1.2, sizes:[{t:'S',w:1500},{t:'M',w:2000},{t:'L',w:3000}] },
];
function tileHTML(item){
  const pills = item.sizes.map(s => `
    <button
      class="px-2 py-1 rounded border bg-white text-ink hover:bg-yellow-50 dark:bg-slate-900 dark:text-white text-xs font-medium"
      data-name="${item.name}" data-cat="${item.cat}"
      data-w="${s.w}" data-h="${item.h}" data-surge="${item.surge}" data-size="${s.t}"
      aria-label="${item.name} ${s.t} ${s.w}W">
      ${s.t} • ${s.w} W
    </button>`).join('');
  return `
  <article class="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-card h-full">
    <h4 class="font-semibold">${item.name}</h4>
    <p class="text-[11px] text-gray-500 dark:text-gray-400 mb-2">${item.cat}</p>
    <div class="flex flex-wrap gap-2">${pills}</div>
    <p class="mt-2 text-[11px] opacity-70">Usage typique : ${item.h} h/j</p>
  </article>`;
}
function addGridRow(name, w, h){
  const tbody = qs('#grid_rows'); if (!tbody) return;
  const tr = makeRowGrid();
  const ins = tr.querySelectorAll('input');
  ins[0].value = name; ins[1].value = +w; ins[2].value = +h;
  tbody.appendChild(tr); recalcGrid();
}
function addPVRow(name, w, h){
  const tbody = qs('#pv_rows'); if (!tbody) return;
  const tr = makeRowPV();
  const ins = tr.querySelectorAll('input');
  ins[0].value = name; ins[1].value = +w; ins[2].value = +h;
  tbody.appendChild(tr); recalcPV();
}
function addGenRow(name, w, surge){
  const tbody = qs('#gen_rows'); if (!tbody) return;
  const tr = makeRowGen();
  const ins = tr.querySelectorAll('input');
  ins[0].value = name; ins[1].value = +w; ins[2].value = +surge;
  tbody.appendChild(tr); recalcGen();
}
function renderCatalog(containerId, mode){
  const root = qs('#'+containerId);
  if (!root) return;
  root.innerHTML = CATALOG.map(tileHTML).join('');
  root.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-w]');
    if(!btn) return;
    const name  = btn.dataset.name;
    const w     = parseFloat(btn.dataset.w);
    const h     = parseFloat(btn.dataset.h);
    const surge = parseFloat(btn.dataset.surge) || 1;
    if (mode === 'grid') addGridRow(name, w, h);
    else if (mode === 'pv') addPVRow(name, w, h);
    else if (mode === 'gen') addGenRow(name, w, surge);
  });
}

/* ===== Boot (avec <script defer>) ===== */
function initSimulateurs(){
  if (!qs('#simulateur')) return; // page sans simulateur : on sort proprement

  setupTabs();

  // Monter simulateurs
  setupGrid();
  setupPV();
  setupGen();

  // Monter catalogues (vignettes)
  renderCatalog('grid_catalog','grid');
  renderCatalog('pv_catalog','pv');
  renderCatalog('gen_catalog','gen');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSimulateurs);
} else {
  initSimulateurs();
}
