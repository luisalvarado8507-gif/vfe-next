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

// Cargar ATC_L4 del archivo
function loadL4() {
  const content = fs.readFileSync(path.join(__dirname, 'lib/atc-db.ts'), 'utf8');
  const start = content.indexOf('export const ATC_L4');
  const end = content.indexOf('};', start);
  const block = content.slice(start, end);
  const db = {};
  const re = /^\s*([A-Z]\d{2}[A-Z]{2}):\s*['"]([^'"]+)['"]/gm;
  let m;
  while ((m = re.exec(block)) !== null) db[m[1]] = m[2];
  return db;
}
const L4 = loadL4();

(async () => {
  const snap = await admin.firestore().collection('medicamentos').where('estado','==','autorizado').get();
  const uniqueL4 = new Set();
  snap.forEach(d => {
    const atc = d.data().data?.atc;
    if (atc && atc.length >= 5) {
      const key = atc.substring(0,5);
      if (L4[key]) uniqueL4.add(`${key} | ${L4[key]}`);
    }
  });
  console.log(`Códigos L4 únicos en los ${snap.size} autorizados:\n`);
  [...uniqueL4].sort().forEach(x => console.log(x));
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
