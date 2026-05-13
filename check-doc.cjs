const fs = require('fs');
const path = require('path');

// Parsear .env.local manualmente
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) {
      let v = m[2].trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  });
}

const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

(async () => {
  const db = admin.firestore();
  const snap = await db.collection('medicamentos')
    .where('estado', '==', 'autorizado').limit(3).get();
  console.log(`Encontrados: ${snap.size} documentos\n`);
  snap.forEach(d => {
    const data = d.data();
    console.log('=== DOC', d.id, '===');
    console.log('TOP-LEVEL KEYS:', Object.keys(data).join(', '));
    if (data.data && typeof data.data === 'object') {
      console.log('NESTED data.* KEYS:', Object.keys(data.data).join(', '));
    }
    console.log('vtm:', JSON.stringify(data.vtm), '| data.vtm:', JSON.stringify(data.data?.vtm));
    console.log('via:', JSON.stringify(data.via), '| data.via:', JSON.stringify(data.data?.via), '| data.vias:', JSON.stringify(data.data?.vias));
    console.log('atc:', JSON.stringify(data.atc), '| data.atc:', JSON.stringify(data.data?.atc));
    console.log('atclbl:', JSON.stringify(data.atclbl), '| data.atclbl:', JSON.stringify(data.data?.atclbl));
    console.log('snomedVtmCode:', JSON.stringify(data.snomedVtmCode || data.data?.snomedVtmCode));
    console.log('snomed_vtm_code:', JSON.stringify(data.snomed_vtm_code || data.data?.snomed_vtm_code));
    console.log('');
  });
  process.exit(0);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
