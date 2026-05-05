const fs = require('fs');

// Cargar env
const env = fs.readFileSync('/Users/luisalvaradoaguirre/vfe-next/.env.local', 'utf8');
env.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) process.env[line.substring(0,idx).trim()] = line.substring(idx+1).trim().replace(/^"|"$/g,'');
});

const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}
const db = admin.firestore();

// Cargar JSON limpio
const medicamentos = JSON.parse(fs.readFileSync('/Users/luisalvaradoaguirre/Downloads/simi_medicamentos_arcsa.json', 'utf8'));
console.log(`JSON cargado: ${medicamentos.length} medicamentos`);

// Índice por RS para búsqueda rápida
const porRS = {};
medicamentos.forEach(m => { porRS[m.rs] = m; });
console.log(`RS únicos en JSON: ${Object.keys(porRS).length}`);

async function actualizarLote(docs, porRS) {
  let actualizados = 0;
  let noEncontrados = 0;
  const batch = db.batch();
  let batchCount = 0;

  for (const doc of docs) {
    const data = doc.data();
    const rs = data.data?.rs || data.rs || '';
    const medLimpio = porRS[rs];

    if (!medLimpio) { noEncontrados++; continue; }

    // Merge con datos existentes — actualizar campos limpios sin perder datos manuales
    const dataActualizada = {
      ...data.data,
      vtm: medLimpio.vtm || data.data?.vtm || '',
      nombre: medLimpio.nombre || data.data?.nombre || '',
      amp: medLimpio.amp || data.data?.amp || '',
      conc: medLimpio.conc || data.data?.conc || '',
      ff: medLimpio.ff || data.data?.ff || '',
      vias: medLimpio.vias || data.data?.vias || '',
      laboratorio: medLimpio.laboratorio || data.data?.laboratorio || '',
      rs: medLimpio.rs || data.data?.rs || '',
      cum: medLimpio.cum || data.data?.cum || '',
      atc: medLimpio.atc || data.data?.atc || '',
      cnmb: medLimpio.cnmb || data.data?.cnmb || '',
      rsCondicion: medLimpio.rsCondicion || data.data?.rsCondicion || '',
      rsFecha: medLimpio.rsFecha || data.data?.rsFecha || '',
      rsVence: medLimpio.rsVence || data.data?.rsVence || '',
      rsTitular: medLimpio.rsTitular || data.data?.rsTitular || '',
      rsPaisFab: medLimpio.rsPaisFab || data.data?.rsPaisFab || '',
      presentacion: medLimpio.presentacion || data.data?.presentacion || '',
    };

    batch.update(doc.ref, {
      data: dataActualizada,
      vtm: medLimpio.vtm || data.vtm || '',
      laboratorio: medLimpio.laboratorio || data.laboratorio || '',
      estado: data.estado || 'autorizado',
      updatedAt: new Date(),
      updatedBy: 'import_arcsa_2026',
    });

    actualizados++;
    batchCount++;

    // Commit cada 400 operaciones (límite Firestore = 500)
    if (batchCount === 400) {
      await batch.commit();
      batchCount = 0;
      process.stdout.write('.');
    }
  }

  // Commit restantes
  if (batchCount > 0) await batch.commit();

  return { actualizados, noEncontrados };
}

async function main() {
  console.log('\nIniciando actualización masiva...');
  let totalActualizados = 0;
  let totalNoEncontrados = 0;
  let cursor = null;
  let lote = 0;

  while (true) {
    let query = db.collection('medicamentos').limit(400);
    if (cursor) query = query.startAfter(cursor);

    const snap = await query.get();
    if (snap.empty) break;

    cursor = snap.docs[snap.docs.length - 1];
    lote++;

    const { actualizados, noEncontrados } = await actualizarLote(snap.docs, porRS);
    totalActualizados += actualizados;
    totalNoEncontrados += noEncontrados;

    console.log(`\nLote ${lote}: +${actualizados} actualizados | ${noEncontrados} sin RS match | Total: ${totalActualizados}`);

    if (snap.docs.length < 400) break;
  }

  console.log('\n=============================');
  console.log(`COMPLETADO`);
  console.log(`Actualizados: ${totalActualizados}`);
  console.log(`Sin match RS: ${totalNoEncontrados}`);
  console.log('=============================');
  process.exit(0);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
