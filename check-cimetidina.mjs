import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(process.argv[2], 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });

const snap = await admin.firestore().collection('medicamentos')
  .where('vtm', '>=', 'cimetidina')
  .where('vtm', '<=', 'cimetidina\uf8ff')
  .limit(5)
  .get();

console.log('Resultados:', snap.size);
snap.docs.forEach(d => console.log(d.id, d.data().vtm, d.data().estado));
process.exit(0);
