import { config } from 'dotenv';
config({ path: '.env.local' });
const { adminDb } = await import('./lib/firebase-admin.ts').catch(async () => {
  return await import('./lib/firebase-admin.js');
});
const snap = await adminDb.collection('medicamentos')
  .where('estado', '==', 'autorizado')
  .limit(3).get();
snap.forEach(d => {
  const data = d.data();
  console.log('\n=== DOC', d.id, '===');
  console.log('TOP-LEVEL KEYS:', Object.keys(data).join(', '));
  if (data.data) console.log('NESTED data.* KEYS:', Object.keys(data.data).join(', '));
  console.log('vtm:', data.vtm, '| data.vtm:', data.data?.vtm);
  console.log('via:', data.via, '| data.via:', data.data?.via, '| data.vias:', data.data?.vias);
  console.log('atc:', data.atc, '| data.atc:', data.data?.atc);
  console.log('atclbl:', data.atclbl, '| data.atclbl:', data.data?.atclbl);
  console.log('snomedVtmCode:', data.snomedVtmCode || data.data?.snomedVtmCode);
  console.log('snomed_vtm_code:', data.snomed_vtm_code || data.data?.snomed_vtm_code);
});
process.exit(0);
