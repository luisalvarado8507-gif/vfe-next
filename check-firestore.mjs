import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(process.argv[2], 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });

const snap = await admin.firestore().collection('medicamentos').limit(2).get();
snap.docs.forEach(doc => {
  console.log('DOC ID:', doc.id);
  console.log('DATA keys:', Object.keys(doc.data()));
  if (doc.data().data) console.log('DATA.id:', doc.data().data.id);
  console.log('---');
});
process.exit(0);
