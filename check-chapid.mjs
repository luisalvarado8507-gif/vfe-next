import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(process.argv[2], 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });

const snap = await admin.firestore().collection('medicamentos').limit(10).get();
snap.docs.forEach(doc => {
  const d = doc.data().data;
  console.log('chapId:', d?.chapId, '| subId:', d?.subId, '| vtm:', d?.vtm?.slice(0,20));
});
process.exit(0);
