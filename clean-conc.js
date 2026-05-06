const fs = require('fs'), os = require('os'), path = require('path');
const admin = require('firebase-admin');
const sa = JSON.parse(fs.readFileSync(path.join(os.homedir(), 'vfe-next', 'serviceAccount.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

function limpiarConc(conc) {
  if (!conc) return '';
  let v = conc.trim();
  // Remover puntos al inicio de cada número: "..160.00 mg" → "160 mg"
  v = v.replace(/\.{2,}(\d)/g, '$1');
  v = v.replace(/^\.+(\d)/g, '$1');
  // Limpiar ceros extra: "160.00000 mg" → "160 mg", "12.50000 mg" → "12.5 mg"
  v = v.replace(/(\d+)\.0+(\s)/g, '$1$2');
  v = v.replace(/(\d+\.\d*[1-9])0+(\s)/g, '$1$2');
  // Normalizar mayúsculas en unidades
  v = v.replace(/\bMG\b/g, 'mg').replace(/\bML\b/g, 'ml').replace(/\bG\b/g, 'g');
  return v.trim();
}

function esConcSucia(conc) {
  if (!conc) return false;
  return /^\./.test(conc) || /\.{2,}/.test(conc) || /\d{5,}/.test(conc) || /\bMG\b|\bML\b/.test(conc);
}

async function main() {
  console.log('Buscando concentraciones sucias...');
  const snap = await db.collection('medicamentos').get();
  const toUpdate = [];

  snap.docs.forEach(doc => {
    const data = doc.data().data || {};
    const conc = data.conc || '';
    if (esConcSucia(conc)) {
      const concLimpia = limpiarConc(conc);
      if (concLimpia !== conc) {
        toUpdate.push({ id: doc.id, concOrig: conc, concLimpia });
      }
    }
  });

  console.log(`Concentraciones a limpiar: ${toUpdate.length}`);
  console.log('\nMuestra:');
  toUpdate.slice(0, 15).forEach(m => console.log(`  "${m.concOrig}" → "${m.concLimpia}"`));

  if (process.argv.includes('--apply')) {
    console.log('\nAplicando...');
    let n = 0;
    for (let i = 0; i < toUpdate.length; i += 400) {
      const batch = db.batch();
      toUpdate.slice(i, i + 400).forEach(({ id, concLimpia }) => {
        batch.update(db.collection('medicamentos').doc(id), {
          'data.conc': concLimpia, updatedAt: new Date(), updatedBy: 'clean_conc',
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
