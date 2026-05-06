const fs = require('fs'), os = require('os'), path = require('path');
const admin = require('firebase-admin');
const sa = JSON.parse(fs.readFileSync(path.join(os.homedir(), 'vfe-next', 'serviceAccount.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// Palabras de forma farmacéutica que indican fin del nombre de marca
const FF_PALABRAS = [
  'comprimidos?', 'tabletas?', 'cápsulas?', 'capsulas?', 'jarabe',
  'solución', 'solucion', 'suspensión', 'suspension', 'inyectable',
  'crema', 'ungüento', 'unguento', 'gel', 'gotas', 'parche',
  'colirio', 'supositorio', 'óvulo', 'ovulo', 'polvo', 'granulado',
  'aerosol', 'spray', 'ampolla', 'vial', 'recubierto', 'recubierta',
  'peliculado', 'peliculada', 'retard', 'forte', 'film',
];

const FF_REGEX = new RegExp(
  `\\s+(?:${FF_PALABRAS.join('|')}).*$`,
  'i'
);

// Patrón de concentración: número seguido de mg, ml, g, %, UI, mcg
const CONC_REGEX = /\s+\d+[,.]?\d*\s*(?:mg|ml|g\b|ui|%|mcg|ug|mEq)\b.*/i;

// También: "X/Y mg" o "X mg/Y ml"
const CONC_SLASH_REGEX = /\s+\d+[,./]\d+(?:\s*mg|\s*ml)?.*/i;

function extraerMarca(nombre) {
  if (!nombre) return '';
  let n = nombre.trim();

  // Primero intentar quitar la FF
  let sin_ff = n.replace(FF_REGEX, '').trim();

  // Luego quitar la concentración
  let sin_conc = sin_ff.replace(CONC_REGEX, '').trim();

  // Quitar concentraciones tipo "5/10 mg" o "100/12.5"
  sin_conc = sin_conc.replace(CONC_SLASH_REGEX, '').trim();

  // Quitar números sueltos al final
  sin_conc = sin_conc.replace(/\s+\d+[,.]?\d*\s*$/, '').trim();

  // Si quedó muy corto o vacío, devolver original
  if (sin_conc.length < 2) return nombre;

  return sin_conc;
}

function necesitaLimpieza(nombre) {
  if (!nombre) return false;
  return /\d+\s*mg|\d+\s*ml|\bcomprimido\b|\btableta\b|\bcápsula\b|\bcapsula\b|\bjarabe\b|\bsolución\b|\bsolucion\b/i.test(nombre);
}

async function main() {
  console.log('Extrayendo nombres de marca limpios...');
  const snap = await db.collection('medicamentos').get();
  const toUpdate = [];
  let stats = 0;

  snap.docs.forEach(doc => {
    const d = doc.data();
    const data = d.data || {};
    const nombre = data.nombre || '';

    if (necesitaLimpieza(nombre)) {
      const marca = extraerMarca(nombre);
      if (marca && marca !== nombre && marca.length > 1) {
        toUpdate.push({ id: doc.id, nombreOrig: nombre, marcaLimpia: marca });
        stats++;
      }
    }
  });

  console.log(`Nombres a limpiar: ${stats}`);
  console.log('\nMuestra:');
  toUpdate.slice(0, 20).forEach(m => {
    console.log(`  "${m.nombreOrig}" → "${m.marcaLimpia}"`);
  });

  if (process.argv.includes('--apply')) {
    console.log('\nAplicando...');
    let n = 0;
    for (let i = 0; i < toUpdate.length; i += 400) {
      const batch = db.batch();
      toUpdate.slice(i, i + 400).forEach(({ id, marcaLimpia }) => {
        batch.update(db.collection('medicamentos').doc(id), {
          'data.nombre': marcaLimpia,
          'data.amp': marcaLimpia,
          updatedAt: new Date(),
          updatedBy: 'clean_marca',
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
