/**
 * SIMI — Auto-completar INN en inglés (vtmEn) desde mapa SNOMED
 * Solo afecta medicamentos autorizados
 */
import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Mapa INN español → inglés (from SNOMED_INN)
const INN_EN = {
  'amlodipino': 'Amlodipine', 'amlodipina': 'Amlodipine',
  'losartán': 'Losartan', 'valsartán': 'Valsartan',
  'enalapril': 'Enalapril', 'lisinopril': 'Lisinopril',
  'metformina': 'Metformin', 'glibenclamida': 'Glibenclamide',
  'atorvastatina': 'Atorvastatin', 'simvastatina': 'Simvastatin',
  'rosuvastatina': 'Rosuvastatin', 'omeprazol': 'Omeprazole',
  'lansoprazol': 'Lansoprazole', 'pantoprazol': 'Pantoprazole',
  'amoxicilina': 'Amoxicillin', 'azitromicina': 'Azithromycin',
  'ciprofloxacino': 'Ciprofloxacin', 'metronidazol': 'Metronidazole',
  'paracetamol': 'Paracetamol', 'ibuprofeno': 'Ibuprofen',
  'salbutamol': 'Salbutamol', 'budesonida': 'Budesonide',
  'espironolactona': 'Spironolactone', 'furosemida': 'Furosemide',
  'metoprolol': 'Metoprolol', 'bisoprolol': 'Bisoprolol',
  'carvedilol': 'Carvedilol', 'propranolol': 'Propranolol',
  'warfarina': 'Warfarin', 'clopidogrel': 'Clopidogrel',
  'levotiroxina': 'Levothyroxine', 'prednisona': 'Prednisone',
  'dexametasona': 'Dexamethasone', 'hidrocortisona': 'Hydrocortisone',
  'fluoxetina': 'Fluoxetine', 'sertralina': 'Sertraline',
  'diazepam': 'Diazepam', 'lorazepam': 'Lorazepam',
  'carbamazepina': 'Carbamazepine', 'tramadol': 'Tramadol',
  'morfina': 'Morphine', 'ceftriaxona': 'Ceftriaxone',
  'vancomicina': 'Vancomycin', 'fluconazol': 'Fluconazole',
  'aciclovir': 'Aciclovir', 'rifampicina': 'Rifampicin',
  'isoniazida': 'Isoniazid', 'ivermectina': 'Ivermectin',
  'dutasterida': 'Dutasteride', 'tamsulosina': 'Tamsulosin',
  'candesartán': 'Candesartan', 'hidroclorotiazida': 'Hydrochlorothiazide',
};

const INN_PT = {
  'amlodipino': 'Anlodipino', 'losartán': 'Losartana',
  'metformina': 'Metformina', 'atorvastatina': 'Atorvastatina',
  'omeprazol': 'Omeprazol', 'amoxicilina': 'Amoxicilina',
  'paracetamol': 'Paracetamol', 'ibuprofeno': 'Ibuprofeno',
  'espironolactona': 'Espironolactona', 'furosemida': 'Furosemida',
  'levotiroxina': 'Levotiroxina', 'fluoxetina': 'Fluoxetina',
  'warfarina': 'Varfarina', 'clopidogrel': 'Clopidogrel',
};

async function main() {
  const envContent = readFileSync('/Users/luisalvaradoaguirre/vfe-next/.env.local', 'utf-8');
  for (const line of envContent.split('\n')) {
    const eqIdx = line.indexOf('=');
    if (eqIdx < 0) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    val = val.replace(/\\n/g, '\n');
    if (key) process.env[key] = val;
  }

  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    })});
  }
  const db = admin.firestore();
  const snap = await db.collection('medicamentos').where('estado', '==', 'autorizado').get();
  
  let actualizados = 0;
  for (const doc of snap.docs) {
    const data = doc.data()?.data || {};
    const vtm = (data.vtm || '').toLowerCase().trim();
    const vtmEn = INN_EN[vtm];
    const vtmPt = INN_PT[vtm];
    if (vtmEn && !data.vtmEn) {
      await doc.ref.update({ 'data.vtmEn': vtmEn, ...(vtmPt ? { 'data.vtmPt': vtmPt } : {}) });
      console.log(`✅ ${data.vtm} → EN: ${vtmEn}${vtmPt ? ` / PT: ${vtmPt}` : ''}`);
      actualizados++;
    }
  }
  console.log(`\nTotal: ${actualizados} medicamentos actualizados`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
