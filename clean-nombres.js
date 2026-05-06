const fs = require('fs'), os = require('os'), path = require('path');
const admin = require('firebase-admin');
const sa = JSON.parse(fs.readFileSync(path.join(os.homedir(), 'vfe-next', 'serviceAccount.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// Palabras que deben mantenerse en mayúsculas
const SIGLAS = new Set(['S.A.', 'S.A', 'LTDA.', 'LTDA', 'CIA.', 'CIA', 'C.A.', 'C.A',
  'S.R.L.', 'INC.', 'LLC', 'LTD.', 'LTD', 'PLC', 'AG', 'SA', 'NV', 'BV',
  'mg', 'ml', 'UI', 'MG', 'ML', 'IV', 'IM', 'SC',
]);

// Prefijos/sufijos farmacéuticos que deben preservarse
const PRESERVAR = ['pH', 'mEq', 'mcg', 'µg', 'UI/ml', 'mg/ml'];

function titleCaseFarma(str) {
  if (!str) return '';
  // Si no tiene al menos 4 mayúsculas seguidas, no tocar
  if (!/[A-Z]{4,}/.test(str)) return str;

  return str.split(' ').map((word, i) => {
    // Preservar siglas conocidas
    if (SIGLAS.has(word)) return word;
    // Preservar palabras con números (dosis: 2,5mg, 500MG)
    if (/\d/.test(word)) return word.toLowerCase();
    // Preservar palabras cortas que son siglas (3 letras mayúsculas)
    if (/^[A-Z]{2,3}$/.test(word) && word.length <= 3) return word;
    // Primera letra mayúscula, resto minúscula
    if (word.length > 0) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    return word;
  }).join(' ');
}

function necesitaNormalizacion(str) {
  if (!str) return false;
  return /[A-Z]{4,}/.test(str);
}

async function main() {
  console.log('Normalizando nombres comerciales y titulares...');
  const snap = await db.collection('medicamentos').get();
  const toUpdate = [];
  let statsNombre = 0, statsTitular = 0;

  snap.docs.forEach(doc => {
    const d = doc.data();
    const data = d.data || {};
    const updates = {};

    // Nombre comercial
    const nombre = data.nombre || '';
    if (necesitaNormalizacion(nombre)) {
      const nombreNuevo = titleCaseFarma(nombre);
      if (nombreNuevo !== nombre) {
        updates['data.nombre'] = nombreNuevo;
        updates['data.amp'] = nombreNuevo; // Sincronizar amp
        statsNombre++;
      }
    }

    // Titular RS
    const titular = data.rsTitular || '';
    if (necesitaNormalizacion(titular)) {
      const titularNuevo = titleCaseFarma(titular);
      if (titularNuevo !== titular) {
        updates['data.rsTitular'] = titularNuevo;
        statsTitular++;
      }
    }

    // País fabricante
    const pais = data.rsPaisFab || '';
    if (pais && necesitaNormalizacion(pais)) {
      updates['data.rsPaisFab'] = titleCaseFarma(pais);
    }

    if (Object.keys(updates).length > 0) {
      toUpdate.push({ id: doc.id, updates });
    }
  });

  console.log(`Nombres a normalizar: ${statsNombre}`);
  console.log(`Titulares a normalizar: ${statsTitular}`);
  console.log(`Total docs: ${toUpdate.length}`);

  console.log('\nMuestra nombres:');
  let shown = 0;
  snap.docs.forEach(doc => {
    const nombre = doc.data().data?.nombre || '';
    if (necesitaNormalizacion(nombre) && shown < 10) {
      console.log(`  "${nombre}" → "${titleCaseFarma(nombre)}"`);
      shown++;
    }
  });

  console.log('\nMuestra titulares:');
  shown = 0;
  snap.docs.forEach(doc => {
    const titular = doc.data().data?.rsTitular || '';
    if (necesitaNormalizacion(titular) && shown < 5) {
      console.log(`  "${titular}" → "${titleCaseFarma(titular)}"`);
      shown++;
    }
  });

  if (process.argv.includes('--apply')) {
    console.log('\nAplicando...');
    let n = 0;
    for (let i = 0; i < toUpdate.length; i += 400) {
      const batch = db.batch();
      toUpdate.slice(i, i + 400).forEach(({ id, updates }) => {
        batch.update(db.collection('medicamentos').doc(id), {
          ...updates, updatedAt: new Date(), updatedBy: 'normalize_nombres',
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
