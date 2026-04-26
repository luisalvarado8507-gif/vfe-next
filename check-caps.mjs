import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(process.argv[2], 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });

const snap = await admin.firestore().collection('capitulos').limit(5).get();
console.log('Capítulos en Firestore:', snap.size);
snap.docs.forEach(doc => console.log(doc.id, JSON.stringify(doc.data()).slice(0,100)));

process.exit(0);
