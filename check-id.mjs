import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(process.argv[2], 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });

const doc = await admin.firestore().collection('medicamentos').doc('1775467780554').get();
console.log('Existe:', doc.exists);
if (doc.exists) console.log('Data:', JSON.stringify(doc.data(), null, 2).slice(0, 300));
process.exit(0);
