import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

function norm(s: string) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

const EML_INNs = new Set([
  'halothane','isoflurane','ketamine','nitrous oxide','oxygen','propofol','sevoflurane','thiopental',
  'bupivacaine','lidocaine','ephedrine','atropine','midazolam','morphine','fentanyl',
  'acetylsalicylic acid','ibuprofen','paracetamol','codeine','tramadol','oxycodone','methadone',
  'buprenorphine','hydromorphone','naloxone','naltrexone',
  'amoxicillin','ampicillin','benzylpenicillin','phenoxymethylpenicillin','cloxacillin',
  'piperacillin','cefazolin','cefalexin','cefixime','ceftriaxone','cefotaxime','ceftazidime',
  'cefepime','meropenem','imipenem','azithromycin','clarithromycin','erythromycin',
  'doxycycline','tetracycline','ciprofloxacin','levofloxacin','norfloxacin',
  'metronidazole','tinidazole','trimethoprim','sulfamethoxazole','clindamycin',
  'vancomycin','linezolid','chloramphenicol','gentamicin','amikacin','tobramycin',
  'nitrofurantoin','fosfomycin','colistin','rifampicin','isoniazid','pyrazinamide',
  'ethambutol','streptomycin','bedaquiline','delamanid',
  'fluconazole','itraconazole','amphotericin b','flucytosine','griseofulvin','nystatin',
  'voriconazole','clotrimazole','miconazole',
  'aciclovir','valaciclovir','ganciclovir','oseltamivir','ribavirin',
  'zidovudine','lamivudine','tenofovir','abacavir','emtricitabine','stavudine',
  'nevirapine','efavirenz','dolutegravir','raltegravir','lopinavir','ritonavir',
  'atazanavir','darunavir','sofosbuvir','ledipasvir','velpatasvir','daclatasvir',
  'albendazole','mebendazole','levamisole','ivermectin','praziquantel',
  'diethylcarbamazine','chloroquine','artemether','lumefantrine','artesunate',
  'quinine','primaquine','mefloquine','pyrimethamine','sulfadoxine','miltefosine','pentamidine',
  'amlodipine','nifedipine','verapamil','diltiazem',
  'atenolol','bisoprolol','carvedilol','metoprolol','propranolol',
  'enalapril','captopril','lisinopril','perindopril','ramipril',
  'losartan','valsartan','irbesartan','candesartan','telmisartan','olmesartan',
  'hydrochlorothiazide','furosemide','spironolactone','eplerenone','amiloride','torasemide',
  'digoxin','amiodarone','adenosine','simvastatin','atorvastatin','rosuvastatin','pravastatin',
  'aspirin','clopidogrel','warfarin','heparin','enoxaparin',
  'nitroglycerin','isosorbide dinitrate','isosorbide mononitrate',
  'hydralazine','methyldopa','adrenaline','dopamine','dobutamine','noradrenaline',
  'metformin','glibenclamide','glipizide','gliclazide','glimepiride',
  'insulin','sitagliptin','vildagliptin','dapagliflozin','empagliflozin','canagliflozin',
  'liraglutide','semaglutide','pioglitazone',
  'levothyroxine','liothyronine','propylthiouracil','carbimazole','methimazole',
  'dexamethasone','prednisolone','prednisone','hydrocortisone','budesonide',
  'beclometasone','fluticasone','betamethasone','fludrocortisone',
  'omeprazole','lansoprazole','pantoprazole','ranitidine','ondansetron','metoclopramide',
  'domperidone','hyoscine','loperamide','lactulose','bisacodyl','mesalazine','sulfasalazine',
  'salbutamol','terbutaline','salmeterol','formoterol','ipratropium','tiotropium',
  'aminophylline','theophylline','montelukast',
  'phenobarbital','phenytoin','carbamazepine','valproic acid','lamotrigine','levetiracetam',
  'ethosuximide','diazepam','lorazepam','clonazepam','levodopa','carbidopa','biperiden',
  'haloperidol','chlorpromazine','fluphenazine','risperidone','olanzapine','quetiapine',
  'clozapine','aripiprazole','lithium','amitriptyline','fluoxetine','sertraline',
  'escitalopram','citalopram','paroxetine','venlafaxine','duloxetine','mirtazapine',
  'imipramine','clomipramine','donepezil','memantine',
  'pilocarpine','timolol','latanoprost','tropicamide','fluorescein','acetazolamide',
  'bevacizumab','ranibizumab',
  'methotrexate','fluorouracil','cyclophosphamide','cisplatin','carboplatin',
  'doxorubicin','bleomycin','vincristine','vinblastine','paclitaxel','docetaxel',
  'imatinib','tamoxifen','anastrozole','letrozole','rituximab','trastuzumab',
  'ferrous sulfate','folic acid','cyanocobalamin','hydroxocobalamin','hydroxyurea',
  'deferasirox','deferoxamine','tranexamic acid','phytomenadione',
  'oxytocin','ergometrine','misoprostol','mifepristone','levonorgestrel',
  'ethinylestradiol','medroxyprogesterone','clomifene',
  'ciclosporin','tacrolimus','azathioprine','mycophenolate',
  'chlorhexidine','povidone iodine','retinol','cholecalciferol','ascorbic acid',
  'thiamine','zinc','calcium','potassium','iodine',
  'acetylcysteine','activated charcoal','sodium bicarbonate','calcium gluconate','glucose','mannitol','albumin',
]);

function esEML(vtm: string, comboData: any): boolean {
  const vtmNorm = norm(vtm);
  // Match estricto: el VTM debe ser exactamente igual al INN (no substring)
  for (const inn of EML_INNs) {
    const innNorm = norm(inn);
    if (vtmNorm === innNorm) return true;
    // Solo acepta si el INN tiene más de 6 chars Y coincide exactamente como palabra completa
    if (innNorm.length > 6 && vtmNorm === innNorm) return true;
  }
  // Para combos: CADA principio activo debe estar en EML
  if (comboData?.pas?.length) {
    return comboData.pas.some((pa: string) => {
      const paNorm = norm(pa);
      for (const inn of EML_INNs) {
        if (paNorm === norm(inn)) return true;
      }
      return false;
    });
  }
  return false;
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.admin) return NextResponse.json({ error: 'Solo admin' }, { status: 403 });
  } catch { return NextResponse.json({ error: 'Token inválido' }, { status: 401 }); }

  // Paso 1: limpiar TODOS los eml existentes
  let limpiados = 0, lastDoc: any = null;
  while (true) {
    let q: any = adminDb.collection('medicamentos').where('data.eml', '==', true).limit(500);
    if (lastDoc) q = q.startAfter(lastDoc);
    const snap = await q.get();
    if (snap.empty) break;
    for (const doc of snap.docs) {
      await doc.ref.update({ 'data.eml': false });
      limpiados++;
    }
    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.docs.length < 500) break;
  }

  // Paso 2: marcar solo autorizados que coincidan con EML
  let marcados = 0, total = 0;
  lastDoc = null;
  while (true) {
    let q: any = adminDb.collection('medicamentos').where('estado', '==', 'autorizado').limit(500);
    if (lastDoc) q = q.startAfter(lastDoc);
    const snap = await q.get();
    if (snap.empty) break;
    for (const doc of snap.docs) {
      const data = doc.data()?.data || {};
      const eml = esEML(data.vtm || '', data.comboData);
      if (eml) {
        await doc.ref.update({ 'data.eml': true });
        marcados++;
      }
      total++;
    }
    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.docs.length < 500) break;
  }
  return NextResponse.json({ ok: true, limpiados, marcados, total });
}
