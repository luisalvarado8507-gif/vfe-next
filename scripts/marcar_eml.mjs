/**
 * SIMI — Marcado automático EML-OMS (Lista Modelo de Medicamentos Esenciales)
 * WHO 23rd Essential Medicines List (2023) — 502 sustancias activas
 * 
 * Uso: node scripts/marcar_eml.mjs [--dry-run]
 */

import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const DRY_RUN = process.argv.includes('--dry-run');

// ── Lista EML-OMS 2023 — INNs oficiales ──────────────────────────────────────
// Fuente: WHO Model List of Essential Medicines, 23rd edition (2023)
// https://list.essentialmeds.org/
const EML_INNs = new Set([
  // Anestésicos
  'halothane','isoflurane','ketamine','nitrous oxide','oxygen','propofol','sevoflurane',
  'thiopental','bupivacaine','lidocaine','ephedrine','atropine','midazolam','morphine','fentanyl',
  // Analgésicos
  'acetylsalicylic acid','ibuprofen','paracetamol','codeine','tramadol','oxycodone',
  'methadone','buprenorphine','hydromorphone','naloxone','naltrexone',
  // Antiinfecciosos — antibacterianos
  'amoxicillin','ampicillin','benzylpenicillin','phenoxymethylpenicillin','cloxacillin',
  'amoxicillin clavulanic acid','piperacillin tazobactam','cefazolin','cefalexin',
  'cefixime','ceftriaxone','cefotaxime','ceftazidime','cefepime','meropenem','imipenem',
  'azithromycin','clarithromycin','erythromycin','doxycycline','tetracycline',
  'ciprofloxacin','levofloxacin','norfloxacin','metronidazole','tinidazole',
  'trimethoprim','sulfamethoxazole','trimethoprim sulfamethoxazole','clindamycin',
  'vancomycin','linezolid','chloramphenicol','gentamicin','amikacin','tobramycin',
  'nitrofurantoin','fosfomycin','colistin','rifampicin','isoniazid','pyrazinamide',
  'ethambutol','streptomycin','bedaquiline','delamanid','pretomanid',
  'benzathine benzylpenicillin','procaine benzylpenicillin',
  // Antifúngicos
  'fluconazole','itraconazole','amphotericin b','flucytosine','griseofulvin',
  'nystatin','voriconazole','clotrimazole','miconazole',
  // Antivirales
  'aciclovir','valaciclovir','ganciclovir','oseltamivir','ribavirin',
  'zidovudine','lamivudine','tenofovir','abacavir','emtricitabine','stavudine',
  'nevirapine','efavirenz','dolutegravir','raltegravir','lopinavir','ritonavir',
  'atazanavir','darunavir','sofosbuvir','ledipasvir','velpatasvir','daclatasvir',
  // Antiparasitarios
  'albendazole','mebendazole','levamisole','ivermectin','praziquantel',
  'diethylcarbamazine','suramin','melarsoprol','eflornithine','benznidazole',
  'chloroquine','artemether','lumefantrine','artesunate','quinine','primaquine',
  'mefloquine','doxycycline','atovaquone proguanil','pyrimethamine','sulfadoxine',
  'metronidazole','tinidazole','miltefosine','amphotericin b','pentamidine',
  // Cardiovasculares
  'amlodipine','nifedipine','verapamil','diltiazem',
  'atenolol','bisoprolol','carvedilol','metoprolol','propranolol',
  'enalapril','captopril','lisinopril','perindopril','ramipril',
  'losartan','valsartan','irbesartan','candesartan','telmisartan',
  'hydrochlorothiazide','furosemide','spironolactone','eplerenone','amiloride',
  'digoxin','amiodarone','lidocaine','adenosine','atenolol',
  'simvastatin','atorvastatin','rosuvastatin','pravastatin',
  'aspirin','clopidogrel','warfarin','heparin','enoxaparin',
  'nitroglycerin','isosorbide dinitrate','isosorbide mononitrate',
  'hydralazine','methyldopa','nitroprusside','adrenaline','dopamine','dobutamine',
  'streptokinase','alteplase',
  // Diabetes
  'metformin','glibenclamide','glipizide','gliclazide','glimepiride',
  'insulin','insulin glargine','insulin detemir','insulin lispro','insulin aspart',
  'sitagliptin','vildagliptin','dapagliflozin','empagliflozin','canagliflozin',
  'liraglutide','semaglutide','exenatide','pioglitazone',
  // Tiroides
  'levothyroxine','liothyronine','propylthiouracil','carbimazole','methimazole',
  // Corticosteroides
  'dexamethasone','prednisolone','prednisone','hydrocortisone','budesonide',
  'beclometasone','fluticasone','betamethasone','fludrocortisone',
  // Gastrointestinal
  'omeprazole','lansoprazole','pantoprazole','ranitidine','cimetidine',
  'ondansetron','metoclopramide','domperidone','hyoscine','loperamide',
  'oral rehydration salts','lactulose','bisacodyl','senna','mesalazine',
  'sulfasalazine','cholestyramine',
  // Respiratorio
  'salbutamol','terbutaline','salmeterol','formoterol','ipratropium',
  'tiotropium','aminophylline','theophylline','beclometasone','fluticasone',
  'montelukast','dornase alfa',
  // SNC
  'phenobarbital','phenytoin','carbamazepine','valproic acid','lamotrigine',
  'levetiracetam','ethosuximide','diazepam','lorazepam','clonazepam',
  'levodopa','carbidopa','biperiden','amantadine',
  'haloperidol','chlorpromazine','fluphenazine','risperidone','olanzapine',
  'quetiapine','clozapine','aripiprazole','lithium','amitriptyline',
  'fluoxetine','sertraline','escitalopram','citalopram','paroxetine',
  'venlafaxine','duloxetine','mirtazapine','imipramine','clomipramine',
  'diazepam','alprazolam','donepezil','memantine',
  // Oftalmológicos
  'tetracycline','chloramphenicol','ciprofloxacin','aciclovir','pilocarpine',
  'timolol','latanoprost','tropicamide','atropine','fluorescein','acetazolamide',
  'bevacizumab','ranibizumab',
  // Oncológicos
  'methotrexate','fluorouracil','cyclophosphamide','cisplatin','carboplatin',
  'doxorubicin','bleomycin','vincristine','vinblastine','paclitaxel','docetaxel',
  'imatinib','erlotinib','ibuprofen','tamoxifen','anastrozole','letrozole',
  'rituximab','trastuzumab','bevacizumab','cetuximab','imatinib',
  'everolimus','sunitinib','sorafenib','nilotinib',
  // Hematológicos
  'iron','ferrous sulfate','folic acid','cyanocobalamin','hydroxocobalamin',
  'erythropoietin','filgrastim','darbepoetin',
  'phytomenadione','tranexamic acid','protamine','fresh frozen plasma',
  'hydroxyurea','deferasirox','deferoxamine',
  // Vacunas (por nombre genérico)
  'bcg vaccine','hepatitis b vaccine','measles vaccine','polio vaccine',
  'dtp vaccine','tetanus toxoid','meningococcal vaccine','pneumococcal vaccine',
  'rotavirus vaccine','hpv vaccine','influenza vaccine','yellow fever vaccine',
  // Vitaminas y minerales
  'retinol','cholecalciferol','ascorbic acid','thiamine','riboflavin','niacin',
  'pyridoxine','zinc','calcium','potassium','sodium chloride','magnesium',
  'iodine','selenium',
  // Reproductivos
  'oxytocin','ergometrine','misoprostol','mifepristone','progesterone',
  'levonorgestrel','ethinylestradiol','medroxyprogesterone','etonogestrel',
  'clomifene','gonadotropins',
  // Inmunosupresores
  'ciclosporin','tacrolimus','azathioprine','mycophenolate','sirolimus',
  'prednisolone','methotrexate',
  // Antisépticos
  'chlorhexidine','povidone iodine','ethanol','hydrogen peroxide',
  // Misceláneos
  'activated charcoal','sodium bicarbonate','calcium gluconate','glucose',
  'acetylcysteine','dimercaprol','sodium thiosulfate','atropine',
  'adrenaline','epinephrine','noradrenaline','vasopressin',
  'dexamethasone','mannitol','albumin',
]);

// ── Normalización ─────────────────────────────────────────────────────────────
function norm(s) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function esEML(vtm, comboData) {
  if (!vtm) return false;
  const vtmNorm = norm(vtm);
  
  // Match directo
  for (const inn of EML_INNs) {
    if (vtmNorm.includes(norm(inn)) || norm(inn).includes(vtmNorm)) return true;
  }
  
  // Para combos verificar cada principio activo
  if (comboData?.pas?.length) {
    return comboData.pas.some(pa => {
      const paNorm = norm(pa);
      for (const inn of EML_INNs) {
        if (paNorm.includes(norm(inn)) || norm(inn).includes(paNorm)) return true;
      }
      return false;
    });
  }
  
  return false;
}

// ── Firebase ──────────────────────────────────────────────────────────────────
async function inicializarFirebase() {
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
  if (admin.apps.length) return admin.firestore();
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY,
    }),
  });
  return admin.firestore();
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('━'.repeat(60));
  console.log('SIMI — Marcado EML-OMS 2023');
  console.log(`Modo: ${DRY_RUN ? 'DRY RUN' : 'ESCRITURA REAL'}`);
  console.log('━'.repeat(60));

  const db = await inicializarFirebase();

  let todos = [];
  let lastDoc = null;
  process.stdout.write('Cargando medicamentos');
  while (true) {
    let q = db.collection('medicamentos').limit(500);
    if (lastDoc) q = q.startAfter(lastDoc);
    const snap = await q.get();
    if (snap.empty) break;
    snap.docs.forEach(doc => {
      const d = doc.data();
      todos.push({ docId: doc.id, data: d.data || {}, estado: d.estado });
    });
    lastDoc = snap.docs[snap.docs.length - 1];
    process.stdout.write('.');
    if (snap.docs.length < 500) break;
  }
  console.log(` ${todos.length} medicamentos cargados.\n`);

  let marcados = 0, ya_marcados = 0, no_eml = 0, errores = 0;

  for (let i = 0; i < todos.length; i++) {
    const { docId, data } = todos[i];
    const vtm = data.vtm || '';
    const comboData = data.comboData;
    const eml = esEML(vtm, comboData);
    
    if (i % 1000 === 0) process.stdout.write(`\r   Procesando ${i + 1}/${todos.length}...`);

    if (eml) {
      if (data.eml === true) { ya_marcados++; continue; }
      if (!DRY_RUN) {
        try {
          await db.collection('medicamentos').doc(docId).update({ 'data.eml': true });
          marcados++;
        } catch(e) { errores++; }
      } else {
        marcados++;
      }
    } else {
      if (data.eml === true && !DRY_RUN) {
        // Quitar marca si ya no corresponde
        await db.collection('medicamentos').doc(docId).update({ 'data.eml': false });
      }
      no_eml++;
    }
  }

  console.log('\n\n' + '═'.repeat(60));
  console.log('RESUMEN');
  console.log('═'.repeat(60));
  console.log(`✅ ${DRY_RUN ? 'Se marcarían' : 'Marcados'} como EML-OMS: ${marcados}`);
  console.log(`⏭  Ya estaban marcados:              ${ya_marcados}`);
  console.log(`➖ No pertenecen a EML:               ${no_eml}`);
  if (errores > 0) console.log(`⚠️  Errores:                          ${errores}`);
  console.log('═'.repeat(60));
  
  if (DRY_RUN) {
    console.log('\nℹ️  DRY RUN — sin cambios. Para aplicar:');
    console.log('   node scripts/marcar_eml.mjs');
  }
}

main().catch(e => { console.error('Error:', e); process.exit(1); });
