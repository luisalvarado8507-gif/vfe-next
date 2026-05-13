const fs = require('fs');
const path = require('path');

fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) { let v = m[2].trim(); if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1); process.env[m[1]] = v; }
});

const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
})});

function loadAtcDb() {
  const content = fs.readFileSync(path.join(__dirname, 'lib/atc-db.ts'), 'utf8');
  const result = { L1: {}, L2: {}, L3: {}, L4: {}, L5: {} };
  for (const sec of ['ATC_L1','ATC_L2','ATC_L3','ATC_L4','ATC_L5']) {
    const level = 'L' + sec.slice(-1);
    const start = content.indexOf(`export const ${sec}`);
    if (start === -1) continue;
    const end = content.indexOf('};', start);
    const block = content.slice(start, end);
    const re = /^\s*([A-Z]\d{0,2}[A-Z]{0,2}\d{0,2}):\s*['"]([^'"]+)['"]/gm;
    let m;
    while ((m = re.exec(block)) !== null) result[level][m[1]] = m[2];
  }
  return result;
}

// Diccionario L4 EN→ES (cubre los 19 términos detectados + otros frecuentes)
const ES = {
  // Aparato digestivo
  'Antacids with antiflatulents': 'Antiácidos con antiflatulentos',
  'Drugs for peptic ulcer and gastro-oesophageal reflux disease (GORD)': 'Fármacos para úlcera péptica y enfermedad por reflujo gastroesofágico (ERGE)',
  'Proton pump inhibitors': 'Inhibidores de la bomba de protones',
  'H2-receptor antagonists': 'Antagonistas de los receptores H2',
  
  // Cardiovascular
  'Digitalis glycosides': 'Glucósidos digitálicos',
  'Organic nitrates': 'Nitratos orgánicos',
  'Other cardiac preparations': 'Otros preparados cardíacos',
  
  // Diuréticos
  'Sulfonamides, plain': 'Sulfonamidas, monofármacos',
  'Aldosterone antagonists': 'Antagonistas de la aldosterona',
  'Low-ceiling diuretics, thiazides': 'Diuréticos de bajo techo, tiazidas',
  'High-ceiling diuretics': 'Diuréticos de alto techo',
  'Potassium-sparing agents': 'Diuréticos ahorradores de potasio',
  
  // Betabloqueantes
  'Beta blocking agents, selective': 'Betabloqueantes selectivos',
  'Beta blocking agents, non-selective': 'Betabloqueantes no selectivos',
  'Alpha and beta blocking agents': 'Alfa y betabloqueantes',
  'Alpha and beta blocking agents and thiazides': 'Alfa y betabloqueantes con tiazidas',
  'Beta blocking agents and thiazides': 'Betabloqueantes con tiazidas',
  'Beta blocking agents and calcium channel blockers': 'Betabloqueantes y bloqueadores de los canales de calcio',
  
  // SRAA — ECA y ARA II
  'ACE inhibitors, plain': 'Inhibidores de la ECA, monofármacos',
  'ACE inhibitors, combinations': 'Inhibidores de la ECA, combinaciones',
  'ACE inhibitors and diuretics': 'Inhibidores de la ECA y diuréticos',
  'ACE inhibitors and calcium channel blockers': 'Inhibidores de la ECA y bloqueadores de los canales de calcio',
  'Angiotensin II receptor blockers (ARBs), plain': 'Antagonistas de los receptores de angiotensina II (ARA II), monofármacos',
  'Angiotensin II receptor blockers (ARBs), combinations': 'Antagonistas de los receptores de angiotensina II (ARA II), combinaciones',
  'Angiotensin II receptor blockers (ARBs) and diuretics': 'ARA II y diuréticos',
  'Angiotensin II receptor blockers (ARBs) and calcium channel blockers': 'ARA II y bloqueadores de los canales de calcio',
  'Angiotensin II receptor blockers (ARBs), other combinations': 'ARA II, otras combinaciones',
  
  // Calcioantagonistas
  'Selective calcium channel blockers with mainly vascular effects': 'Bloqueadores selectivos de los canales de calcio con efectos principalmente vasculares',
  'Selective calcium channel blockers with direct cardiac effects': 'Bloqueadores selectivos de los canales de calcio con efectos cardíacos directos',
  
  // Estatinas y antitrombóticos
  'HMG CoA reductase inhibitors': 'Inhibidores de la HMG-CoA reductasa (estatinas)',
  'Platelet aggregation inhibitors excl. heparin': 'Inhibidores de la agregación plaquetaria, excl. heparina',
  
  // Urología
  'Alpha-adrenoreceptor antagonists': 'Antagonistas de los receptores alfa-adrenérgicos',
  
  // Antibióticos
  'Beta-lactamase sensitive penicillins': 'Penicilinas sensibles a betalactamasa',
  'Beta-lactamase resistant penicillins': 'Penicilinas resistentes a betalactamasa',
  'Penicillins with extended spectrum': 'Penicilinas de espectro ampliado',
  'Combinations of penicillins, incl. beta-lactamase inhibitors': 'Combinaciones de penicilinas, incl. inhibidores de betalactamasa',
  
  // Analgésicos / AINEs
  'Anilides': 'Anilidas',
  'Other analgesics and antipyretics': 'Otros analgésicos y antipiréticos',
  'Antiinflammatory and antirheumatic products, non-steroids': 'Antiinflamatorios y antirreumáticos no esteroideos',
  'Salicylic acid and derivatives': 'Ácido salicílico y derivados',
};

function tr(s) { return ES[s] || s; }

const ATC = loadAtcDb();
console.log(`✓ ATC cargado: L4=${Object.keys(ATC.L4).length} L5=${Object.keys(ATC.L5).length}\n`);

function buildAtclbl(code) {
  if (!code) return null;
  const c = code.toUpperCase().trim();
  const l5key = c.length >= 7 ? c.substring(0,7) : null;
  const l5val = l5key ? ATC.L5[l5key] : null;
  const l4key = c.length >= 5 ? c.substring(0,5) : null;
  const l4val = l4key ? ATC.L4[l4key] : null;
  if (l4val && l5val) return `${tr(l4val)} / ${l5val}`;
  if (l4val) return tr(l4val);
  if (l5val) return l5val;
  const l3 = c.length >= 4 ? ATC.L3[c.substring(0,4)] : null;
  if (l3) return tr(l3);
  const l2 = c.length >= 3 ? ATC.L2[c.substring(0,3)] : null;
  if (l2) return tr(l2);
  return null;
}

// IMPORTANTE: este script ahora SOBREESCRIBE atclbl existente (porque queremos corregir los traducidos a medias)
const DRY_RUN = process.argv[2] !== '--apply';
const ESTADO_FILTER = process.argv[3] || 'autorizado';
const OVERWRITE = process.argv.includes('--overwrite');

(async () => {
  console.log(`MODO: ${DRY_RUN ? '🔍 DRY-RUN' : '✍️  APPLY'} | FILTRO: estado=${ESTADO_FILTER} | OVERWRITE: ${OVERWRITE}\n`);
  const db = admin.firestore();
  let query = db.collection('medicamentos');
  if (ESTADO_FILTER !== 'all') query = query.where('estado','==',ESTADO_FILTER);
  const snap = await query.get();
  console.log(`Encontrados: ${snap.size} documentos\n`);

  let actualizados = 0, yaTienen = 0, sinAtc = 0, sinMatch = 0;
  const ejemplos = [];
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snap.docs) {
    const data = doc.data().data || {};
    const atc = data.atc;
    if (!atc) { sinAtc++; continue; }
    if (data.atclbl && data.atclbl.trim() && !OVERWRITE) { yaTienen++; continue; }
    const lbl = buildAtclbl(atc);
    if (!lbl) { sinMatch++; continue; }
    if (ejemplos.length < 12) ejemplos.push(`${(data.vtm||'?').slice(0,25).padEnd(25)} | ${atc.padEnd(8)} → "${lbl}"`);
    if (!DRY_RUN) {
      batch.update(doc.ref, { 'data.atclbl': lbl });
      batchCount++;
      if (batchCount >= 400) { await batch.commit(); batch = db.batch(); batchCount = 0; }
    }
    actualizados++;
  }
  if (!DRY_RUN && batchCount > 0) await batch.commit();

  console.log(`--- EJEMPLOS ---`);
  ejemplos.forEach(e => console.log(e));
  console.log(`\n=== RESUMEN ===`);
  console.log(`Actualizados:    ${actualizados}`);
  console.log(`Ya tenían (skip):${yaTienen}`);
  console.log(`Sin código ATC:  ${sinAtc}`);
  console.log(`ATC sin match:   ${sinMatch}`);
  console.log(`Total revisado:  ${snap.size}`);
  console.log(`\n${DRY_RUN ? '👁  DRY-RUN — aplicar con: node backfill-atclbl.cjs --apply --overwrite' : '✅ APLICADO'}`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
