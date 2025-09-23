// Dépend de fmt() et val() définis dans main.js

// ---------- Onglets + explications dynamiques ----------
const tabs = document.querySelectorAll('.sim-tab');
const panels = document.querySelectorAll('.sim-panel');
const expTitle = document.getElementById('exp-title');
const expBody  = document.getElementById('exp-body');
const expEx    = document.getElementById('exp-example');
const fillBtn  = document.getElementById('fillExampleBtn');

const EXPLAINS = {
  '#sim1': {
    title: 'Conso & coût (1 appareil)',
    body: "<strong>kWh</strong> = (W/1000) × heures/jour × jours. <strong>Coût</strong> = kWh × tarif (CDF/kWh).",
    example: [
      'Puissance 1200 W, 3 h/j, 30 jours, tarif 800 CDF/kWh.',
      'Cliquez sur <em>Remplir l’exemple</em> puis <strong>Calculer</strong>.'
    ],
    fill: () => { s1_w.value=1200; s1_h.value=3; s1_d.value=30; s1_t.value=800; }
  },
  '#sim2': {
    title: 'Multi-appareils (somme des consommations)',
    body: "Addition de kWh individuels : <code>kWh = (W/1000) × h/j × jours</code>, puis total × tarif.",
    example: [
      'Ligne 1 : Frigo 150 W • 24 h/j • 30 j',
      'Ligne 2 : Éclairage 40 W • 5 h/j • 30 j',
      'Tarif 800 CDF/kWh. Cliquez sur <strong>Calculer total</strong>.'
    ],
    fill: () => {
      const rows = document.getElementById('s2_rows');
      rows.innerHTML = '';
      const addRow = (name,W,h,d) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="py-1"><input class="w-full border p-2 rounded bg-white dark:bg-slate-800 dark:border-slate-600" value="${name}"></td>
          <td><input type="number" class="w-24 border p-2 rounded bg-white dark:bg-slate-800 dark:border-slate-600" value="${W}"></td>
          <td><input type="number" class="w-20 border p-2 rounded bg-white dark:bg-slate-800 dark:border-slate-600" value="${h}"></td>
          <td><input type="number" class="w-20 border p-2 rounded bg-white dark:bg-slate-800 dark:border-slate-600" value="${d}"></td>
          <td><button class="text-red-600 px-2 py-1" onclick="this.closest('tr').remove()">✖</button></td>`;
        rows.appendChild(tr);
      };
      document.getElementById('s2_tarif').value = 800;
      addRow('Frigo',150,24,30);
      addRow('Éclairage',40,5,30);
    }
  },
  '#sim3': {
    title: 'Dimensionnement solaire (PV + batteries)',
    body: "PV ≈ conso_jour / (PSH × rendement_système). Batteries ≈ (conso_jour × jours)/ (DoD × η onduleur).",
    example: [
      'Conso 15 kWh/j • PSH 5 h • Rendement 0,75',
      'Autonomie 1,5 j • DoD 0,8 • η onduleur 0,92',
      'Panneau 550 W • Batterie 48 V • Pointe 3500 W.'
    ],
    fill: () => {
      s3_kwhd.value=15; s3_psh.value=5; s3_sysEff.value=0.75; s3_days.value=1.5;
      s3_dod.value=0.8; s3_invEff.value=0.92; s3_pvw.value=550; s3_vbat.value=48; s3_peak.value=3500;
    }
  },
  '#sim4': {
    title: 'Autonomie batterie',
    body: "<strong>h</strong> = (kWh_batt × DoD × η onduleur) / (Charge_W/1000).",
    example: ['Batterie 10 kWh • DoD 0,8 • η 0,92','Charge continue 800 W.','Cliquer sur <strong>Calculer</strong>.'],
    fill: () => { s4_kwh.value=10; s4_dod.value=0.8; s4_eff.value=0.92; s4_w.value=800; }
  },
  '#sim5': {
    title: 'Section de câble & chute de tension',
    body: "ΔV(V) = (2 × L × I × ρ)/A ; %ΔV = ΔV/V × 100. Choix de la section la plus petite respectant %ΔV max.",
    example: ['L=30 m • I=16 A • V=230 V • Cuivre','Chute max 3 %','Cliquer sur <strong>Dimensionner</strong>.'],
    fill: () => { s5_L.value=30; s5_I.value=16; s5_V.value=230; s5_mat.value='cu'; s5_max.value=3; }
  },
  '#sim6': {
    title: 'Sélecteur de groupe électrogène',
    body: "kVA ≈ (W_régime × k_surtension)/(1000 × PF) × marge.",
    example: ['W_régime 5000 W • k_surtension 1,2','PF 0,8 • marge 1,25'],
    fill: () => { s6_w.value=5000; s6_k.value=1.2; s6_pf.value=0.8; s6_m.value=1.25; }
  },
  '#sim7': {
    title: 'Éclairage (lux & nb luminaires)',
    body: "Flux requis (lm) ≈ (lux_cible × surface)/(UF × MF). Nb = ⌈ flux_requis / flux_luminaire ⌉.",
    example: ['Surface 50 m² • Lux 300','UF 0,6 • MF 0,8 • 3000 lm (24 W)'],
    fill: () => { s7_area.value=50; s7_lux.value=300; s7_uf.value=0.6; s7_mf.value=0.8; s7_lm.value=3000; s7_w.value=24; }
  },
  '#sim8': {
    title: 'ROI solaire (économies & retour)',
    body: "Économies année 1 = prod × tarif − maintenance. Payback ≈ coût / économies. NPV = somme des économies actualisées − coût.",
    example: ['Coût 8000 • Prod 6000 kWh/an','Tarif 800 FC/kWh • Maint 120','Horizon 20 ans • Index 3% • Taux 8%'],
    fill: () => { s8_cost.value=8000; s8_prod.value=6000; s8_tarif.value=800; s8_maint.value=120; s8_years.value=20; s8_escal.value=3; s8_disc.value=8; }
  },
  '#sim9': {
    title: 'Équilibrage des phases (tri)',
    body: "Déséquilibre (%) = (max − min)/moyenne × 100.",
    example: ['L1 : 1200, 800, 500','L2 : 1000, 600','L3 : 900, 700'],
    fill: () => { s9_l1.value='1200, 800, 500'; s9_l2.value='1000, 600'; s9_l3.value='900, 700'; }
  }
};

function renderExplain(targetId){
  const cfg = EXPLAINS[targetId]; if(!cfg) return;
  expTitle.textContent = cfg.title;
  expBody.innerHTML = cfg.body;
  expEx.innerHTML = `
    <h4 class="font-semibold text-blue-200 mb-1">Exemple</h4>
    <ul class="list-disc pl-5 space-y-1">${cfg.example.map(li=>`<li>${li}</li>`).join('')}</ul>
  `;
  if (fillBtn) fillBtn.onclick = cfg.fill;
}

function activateTab(targetId) {
  panels.forEach(p => p.classList.add('hidden'));
  tabs.forEach(b => {
    const active = b.dataset.target === targetId;
    b.setAttribute('aria-selected', active ? 'true' : 'false');
    if (active) {
      b.classList.remove('bg-white/10','text-white','border-white/30');
      b.classList.add('bg-white','text-brand','border','border-black','shadow-card','font-semibold');
    } else {
      b.classList.remove('bg-white','text-brand','border-black','shadow-card','font-semibold');
      b.classList.add('bg-white/10','text-white','border','border-white/30');
    }
  });
  document.querySelector(targetId)?.classList.remove('hidden');
  renderExplain(targetId);
}

tabs.forEach(b => b.addEventListener('click', () => activateTab(b.dataset.target)));
activateTab('#sim1');

// ---------- Calculs ----------
// 1) Conso & coût
document.getElementById('s1_btn')?.addEventListener('click', ()=>{
  const W=val('s1_w'), h=val('s1_h'), d=val('s1_d'), t=val('s1_t');
  const kwh=(W/1000)*h*d, cost=kwh*t;
  s1_kwh.textContent = fmt(kwh)+' kWh';
  s1_cost.textContent = 'FC'+fmt(cost);
});

// 2) Multi-appareils
const s2_rows=document.getElementById('s2_rows');
document.getElementById('s2_add')?.addEventListener('click', ()=>{
  const tr=document.createElement('tr');
  tr.innerHTML=`
    <td class="py-1"><input class="w-full border p-2 rounded bg-white dark:bg-slate-800 dark:border-slate-600" placeholder="Appareil"></td>
    <td><input type="number" class="w-24 border p-2 rounded bg-white dark:bg-slate-800 dark:border-slate-600" placeholder="W"></td>
    <td><input type="number" class="w-20 border p-2 rounded bg-white dark:bg-slate-800 dark:border-slate-600" placeholder="h/j"></td>
    <td><input type="number" class="w-20 border p-2 rounded bg-white dark:bg-slate-800 dark:border-slate-600" placeholder="jours"></td>
    <td><button class="text-red-600 px-2 py-1" onclick="this.closest('tr').remove()">✖</button></td>`;
  s2_rows.appendChild(tr);
});
document.getElementById('s2_calc')?.addEventListener('click', ()=>{
  let kwh=0;
  s2_rows.querySelectorAll('tr').forEach(tr=>{
    const W=+tr.children[1].querySelector('input').value||0;
    const h=+tr.children[2].querySelector('input').value||0;
    const d=+tr.children[3].querySelector('input').value||0;
    kwh += (W/1000)*h*d;
  });
  const t=+document.getElementById('s2_tarif').value||0;
  document.getElementById('s2_out').textContent = `Total: ${fmt(kwh)} kWh • ${fmt(kwh*t)} CDF`;
});

// 3) Solaire (PV + batt.)
document.getElementById('s3_btn')?.addEventListener('click', ()=>{
  const kwhd=val('s3_kwhd'), psh=val('s3_psh'), sysEff=val('s3_sysEff')||1;
  const days=val('s3_days'), dod=val('s3_dod')||1, invEff=val('s3_invEff')||1;
  const panelW=val('s3_pvw')||400, vbat=val('s3_vbat')||48, peakW=val('s3_peak')||0;
  const pv_kw = kwhd/(psh*sysEff);
  const panels = Math.ceil((pv_kw*1000)/panelW);
  const bat_kwh = (kwhd*days)/(dod*invEff);
  const bat_Ah = (bat_kwh*1000)/vbat;
  const inv_kw = Math.max((peakW/1000)*1.25, pv_kw*0.6);
  s3_pv.textContent  = `PV ≈ ${fmt(pv_kw)} kW (${panels} panneaux de ${panelW} W)`;
  s3_bat.textContent = `Batteries ≈ ${fmt(bat_kwh)} kWh (≈ ${fmt(bat_Ah)} Ah @ ${vbat} V)`;
  s3_inv.textContent = `Onduleur recommandé : ${fmt(inv_kw)} kW min`;
});

// 4) Autonomie batterie
document.getElementById('s4_btn')?.addEventListener('click', ()=>{
  const kwh=val('s4_kwh'), dod=val('s4_dod')||1, eff=val('s4_eff')||1, W=val('s4_w')||1;
  const hours=(kwh*dod*eff)/(W/1000);
  const h=Math.floor(hours), m=Math.round((hours-h)*60);
  s4_out.textContent = `${fmt(hours)} h (${h} h ${m} min)`;
});

// 5) Câble & ΔV
document.getElementById('s5_btn')?.addEventListener('click', ()=>{
  const L=val('s5_L'), I=val('s5_I'), V=val('s5_V'), mat=document.getElementById('s5_mat').value;
  const maxPct=val('s5_max');
  const rho = (mat==='al') ? 2.826e-8 : 1.724e-8;
  const sections=[1.5,2.5,4,6,10,16,25,35,50,70,95,120,150,185,240];
  const dropPctFor = (mm2)=>{ const A=mm2*1e-6; const dV=(2*L*I*rho)/A; return (dV/V)*100; };
  let rec=sections[sections.length-1], pct=dropPctFor(rec);
  for(const s of sections){ const p=dropPctFor(s); if(p<=maxPct){ rec=s; pct=p; break; } }
  s5_rec.textContent = `Section recommandée : ${rec} mm² (${mat.toUpperCase()})`;
  s5_drop.textContent = `Chute réelle ≈ ${fmt(pct)} %`;
});

// 6) Groupe électrogène
document.getElementById('s6_btn')?.addEventListener('click', ()=>{
  const W=val('s6_w'), k=val('s6_k')||1, pf=val('s6_pf')||0.8, m=val('s6_m')||1.25;
  const kVA=(W*k)/(1000*pf)*m, kW=kVA*pf;
  s6_out.textContent = `${fmt(kVA)} kVA (≈ ${fmt(kW)} kW)`;
});

// 7) Éclairage
document.getElementById('s7_btn')?.addEventListener('click', ()=>{
  const A=val('s7_area'), lux=val('s7_lux'), UF=val('s7_uf')||1, MF=val('s7_mf')||1, lm=val('s7_lm')||1, W=val('s7_w')||0;
  const fluxReq=(lux*A)/(UF*MF); const count=Math.max(1, Math.ceil(fluxReq/lm)); const power=count*W;
  s7_count.textContent = `${count} luminaires`;
  s7_power.textContent = `Puissance totale ≈ ${fmt(power)} W`;
});

// 8) ROI solaire
document.getElementById('s8_btn')?.addEventListener('click', ()=>{
  const cost=val('s8_cost'), prod=val('s8_prod'), tarif=val('s8_tarif'), maint=val('s8_maint');
  const years=Math.max(1, val('s8_years')||20), escal=(val('s8_escal')||0)/100, disc=(val('s8_disc')||0)/100;
  const year1=prod*tarif-maint; let cum=0, payback=null, npv=-cost;
  for(let y=1;y<=years;y++){
    const saving=prod*(tarif*Math.pow(1+escal,y-1))-maint;
    cum+=saving;
    if(payback===null&&cum>=cost) payback=y;
    npv+=saving/Math.pow(1+disc,y);
  }
  s8_sav.textContent = `Économies année 1 : ${fmt(year1)} CDF`;
  s8_pb.textContent  = `Payback simple : ${payback ? payback+' ans' : 'n/a'}`;
  s8_npv.textContent = `NPV (${years} ans) : ${fmt(npv)} CDF`;
});

// 9) Équilibrage des phases
const parseLoads = v => (v||'').split(',').map(x=>+x.trim()).filter(n=>!isNaN(n)&&n>0);
document.getElementById('s9_btn')?.addEventListener('click', ()=>{
  const L1=parseLoads(s9_l1.value);
  const L2=parseLoads(s9_l2.value);
  const L3=parseLoads(s9_l3.value);
  const S=[L1.reduce((a,b)=>a+b,0), L2.reduce((a,b)=>a+b,0), L3.reduce((a,b)=>a+b,0)];
  const avg=(S[0]+S[1]+S[2])/3||1, maxI=S.indexOf(Math.max(...S)), minI=S.indexOf(Math.min(...S));
  const imb=((S[maxI]-S[minI])/avg)*100;
  const phases=[L1,L2,L3]; const largest=Math.max(...(phases[maxI].length?phases[maxI]:[0]));
  let sug='Ajoutez/retirez des charges pour équilibrer.';
  if(largest>0) sug=`Déplacer ≈ ${fmt(largest)} W de L${maxI+1} → L${minI+1} (déséquilibre actuel ≈ ${fmt(imb)} %).`;
  s9_tot.textContent = `L1: ${fmt(S[0])} W | L2: ${fmt(S[1])} W | L3: ${fmt(S[2])} W`;
  s9_imb.textContent = `Déséquilibre ≈ ${fmt(imb)} %`;
  s9_sug.textContent = sug;
});
