const fs = require('fs'), os = require('os'), path = require('path');
const admin = require('firebase-admin');
const sa = JSON.parse(fs.readFileSync(path.join(os.homedir(), 'vfe-next', 'serviceAccount.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// Base de datos ATC embebida (niveles 1-4 más comunes)
const ATC_L1 = { A:'Tracto alimentario y metabolismo', B:'Sangre y órganos hematopoyéticos', C:'Sistema cardiovascular', D:'Dermatológicos', G:'Sistema genitourinario y hormonas sexuales', H:'Preparados hormonales sistémicos', J:'Antiinfecciosos para uso sistémico', L:'Agentes antineoplásicos e inmunomoduladores', M:'Sistema musculoesquelético', N:'Sistema nervioso', P:'Antiparasitarios, insectidas y repelentes', R:'Sistema respiratorio', S:'Órganos de los sentidos', V:'Varios' };
const ATC_L2 = { A01:'Stomatological preparations', A02:'Drugs for acid related disorders', A03:'Drugs for functional GI disorders', A04:'Antiemetics', A05:'Bile and liver therapy', A06:'Drugs for constipation', A07:'Antidiarrheals', A08:'Antiobesity preparations', A09:'Digestives', A10:'Drugs used in diabetes', A11:'Vitamins', A12:'Mineral supplements', A16:'Other alimentary tract products', B01:'Antithrombotic agents', B02:'Antihemorrhagics', B03:'Antianemic preparations', B05:'Blood substitutes', C01:'Cardiac therapy', C02:'Antihypertensives', C03:'Diuretics', C07:'Beta blocking agents', C08:'Calcium channel blockers', C09:'Agents acting on the renin-angiotensin system', C10:'Lipid modifying agents', D01:'Antifungals for dermatological use', D02:'Emollients', D05:'Antipsoriatics', D06:'Antibiotics for dermatological use', D07:'Corticosteroids dermatological', D10:'Anti-acne preparations', D11:'Other dermatological preparations', G01:'Gynecological antiinfectives', G03:'Sex hormones', G04:'Urologicals', H01:'Pituitary hormones', H02:'Corticosteroids systemic', H03:'Thyroid therapy', H04:'Pancreatic hormones', J01:'Antibacterials systemic', J02:'Antimycotics systemic', J04:'Antimycobacterials', J05:'Antivirals systemic', J06:'Immune sera', J07:'Vaccines', L01:'Antineoplastic agents', L02:'Endocrine therapy', L03:'Immunostimulants', L04:'Immunosuppressants', M01:'Antiinflammatory antirheumatic', M03:'Muscle relaxants', M04:'Antigout preparations', M05:'Drugs for bone diseases', N01:'Anesthetics', N02:'Analgesics', N03:'Antiepileptics', N04:'Anti-parkinson drugs', N05:'Psycholeptics', N06:'Psychoanaleptics', N07:'Other nervous system drugs', P01:'Antiprotozoals', P02:'Anthelmintics', R01:'Nasal preparations', R03:'Drugs for obstructive airway diseases', R05:'Cough and cold preparations', R06:'Antihistamines systemic', S01:'Ophthalmologicals', S02:'Otologicals', V01:'Allergens', V03:'Other therapeutic products' };
const ATC_L3 = { C09A:'ACE inhibitors plain', C09B:'ACE inhibitors combinations', C09C:'Angiotensin II receptor blockers plain', C09D:'Angiotensin II receptor blockers combinations', C07A:'Beta blocking agents plain', C08C:'Selective calcium channel blockers vascular', C08D:'Selective calcium channel blockers cardiac', C10A:'Cholesterol regulating plain', C10B:'Cholesterol regulating combinations', A10A:'Insulins and analogues', A10B:'Blood glucose lowering excl. insulins', J01A:'Tetracyclines', J01C:'Beta-lactam penicillins', J01D:'Other beta-lactam antibacterials', J01F:'Macrolides', J01M:'Quinolone antibacterials', N02A:'Opioids', N02B:'Other analgesics and antipyretics', N05A:'Antipsychotics', N05B:'Anxiolytics', N05C:'Hypnotics and sedatives', N06A:'Antidepressants', M01A:'Antiinflammatory non-steroids' };

function getATCLabel(atc) {
  if (!atc || atc.length < 1) return '';
  const c = atc.toUpperCase();
  if (c.length >= 4 && ATC_L3[c.substring(0,4)]) return ATC_L3[c.substring(0,4)];
  if (c.length >= 3 && ATC_L2[c.substring(0,3)]) return ATC_L2[c.substring(0,3)];
  if (c.length >= 1 && ATC_L1[c[0]]) return ATC_L1[c[0]];
  return '';
}

function titleCasePresentacion(str) {
  if (!str) return '';
  if (!/[A-Z]{4,}/.test(str)) return str;
  return str.split(' ').map(w => {
    if (/\d/.test(w)) return w.toLowerCase();
    if (w.length <= 2) return w.toUpperCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
}

async function main() {
  console.log('Llenando atclbl y normalizando presentación...');
  const snap = await db.collection('medicamentos').get();
  const toUpdate = [];
  let statsAtc = 0, statsPres = 0;

  snap.docs.forEach(doc => {
    const d = doc.data();
    const data = d.data || {};
    const updates = {};

    // Llenar atclbl
    if (!data.atclbl && data.atc) {
      const label = getATCLabel(data.atc);
      if (label) { updates['data.atclbl'] = label; statsAtc++; }
    }

    // Normalizar presentación
    const pres = data.presentacion || '';
    if (pres && /[A-Z]{4,}/.test(pres)) {
      const presNueva = titleCasePresentacion(pres);
      if (presNueva !== pres) { updates['data.presentacion'] = presNueva; statsPres++; }
    }

    if (Object.keys(updates).length > 0) toUpdate.push({ id: doc.id, updates });
  });

  console.log(`atclbl a llenar: ${statsAtc}`);
  console.log(`Presentaciones a normalizar: ${statsPres}`);
  console.log(`Total docs: ${toUpdate.length}`);

  // Muestra
  let shown = 0;
  snap.docs.forEach(doc => {
    const data = doc.data().data || {};
    if (!data.atclbl && data.atc && shown < 8) {
      const label = getATCLabel(data.atc);
      if (label) { console.log(`  ATC ${data.atc} → "${label}"`); shown++; }
    }
  });

  if (process.argv.includes('--apply')) {
    console.log('\nAplicando...');
    let n = 0;
    for (let i = 0; i < toUpdate.length; i += 400) {
      const batch = db.batch();
      toUpdate.slice(i, i + 400).forEach(({ id, updates }) => {
        batch.update(db.collection('medicamentos').doc(id), {
          ...updates, updatedAt: new Date(), updatedBy: 'fill_atclbl',
        });
        n++;
      });
      await batch.commit();
      process.stdout.write(`\rActualizados: ${n}/${toUpdate.length}`);
    }
    console.log('\n✓ Completado');
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
