import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(process.argv[2], 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });

const snap = await admin.firestore().collection('medicamentos').count().get();
console.log('Total documentos en Firestore:', snap.data().count);
process.exit(0);
