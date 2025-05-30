

function toggleCapacitePanneaux(val) {
  const conteneur = document.getElementById('capaciteContainer');
  conteneur.style.display = val === 'oui' ? 'block' : 'none';
}

function toggleConvertisseur(val) {
  document.getElementById('convertisseurHybride').style.display = val === 'hybride' ? 'block' : 'none';
  document.getElementById('regulateurCharge').style.display = val === 'non-hybride' ? 'block' : 'none';
}

// ☀️ Panneau solaire
function calculerSolaire() {
  const nb = +document.getElementById('nbPanneaux').value;
  const capa = +document.getElementById('puissancePanneau').value;
  const tensionBat = +document.getElementById('voltBatterie').value;
  const capBat = +document.getElementById('capBatterie').value;
  const charge = +document.getElementById('chargeTotale').value;
  const duree = +document.getElementById('dureeCharge').value;

  const prodSolaire = nb * capa * 5 * 0.75;
  const capBatterieWh = capBat * tensionBat;
  const consoTotale = charge * duree;

  const html = `
	<p>🔆 Production journalière : <strong>${prodSolaire} Wh</strong></p>
	<p>🔋 Batterie disponible : <strong>${capBatterieWh} Wh</strong></p>
	<p>⚡ Consommation : <strong>${consoTotale} Wh</strong></p>
	<p>${prodSolaire >= consoTotale ? '✅ Production suffisante' : '⚠️ Production insuffisante'}</p>
	<p>${capBatterieWh >= consoTotale ? '✅ Batterie suffisante' : '⚠️ Batterie insuffisante'}</p>
  `;

  document.getElementById('resultSolaire').innerHTML = html;
}

// 🔌 Groupe électrogène
function calculerGroupe() {
  const pDispo = +document.getElementById('puissanceGroupe').value;
  const charge = +document.getElementById('chargeGroupe').value;
  const duree = +document.getElementById('dureeGroupe').value;
  const type = document.getElementById('typeGroupe').value;

  const consoTotale = charge * duree;
  const suffisant = pDispo >= charge;
  const consoCarburant = ((charge / pDispo) * 0.8) * duree; // estimation

  const html = `
	<p>⏱ Charge demandée : <strong>${charge} W pendant ${duree}h</strong></p>
	<p>🔌 Groupe (${type}) : puissance dispo ${pDispo} W</p>
	<p>${suffisant ? '✅ Groupe peut alimenter la charge' : '⚠️ Groupe insuffisant'}</p>
	<p>⛽ Estimation consommation : <strong>${consoCarburant.toFixed(2)} L</strong></p>
  `;

  document.getElementById('resultGroupe').innerHTML = html;
}

// 🔋 Batteries seules
function calculerBatterie() {
  const cap = +document.getElementById('capBat').value;
  const volt = +document.getElementById('voltBat').value;
  const charge = +document.getElementById('chargeBat').value;
  const duree = +document.getElementById('dureeBat').value;

  const energieBat = cap * volt;
  const besoin = charge * duree;

  const html = `
	<p>🔋 Batterie : ${cap}Ah × ${volt}V = <strong>${energieBat} Wh</strong></p>
	<p>⚡ Besoin total : <strong>${besoin} Wh</strong></p>
	<p>${energieBat >= besoin ? '✅ Batterie suffisante' : '⚠️ Batterie insuffisante'}</p>
  `;

  document.getElementById('resultBatterie').innerHTML = html;
}

// ⚡ Réseau
function calculerReseau() {
  const dispo = +document.getElementById('puissanceReseau').value;
  const duree = +document.getElementById('dureeReseau').value;
  const charge = +document.getElementById('chargeReseau').value;
  const temps = +document.getElementById('tempsReseau').value;

  const dispoWh = dispo * duree;
  const besoin = charge * temps;

  const html = `
	<p>⚡ Puissance réseau dispo : <strong>${dispoWh} Wh</strong></p>
	<p>🔌 Besoin des appareils : <strong>${besoin} Wh</strong></p>
	<p>${dispoWh >= besoin ? '✅ Réseau suffisant' : '⚠️ Insuffisant ou délestage probable'}</p>
  `;

  document.getElementById('resultReseau').innerHTML = html;
}
