import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

const INN_EN: Record<string, string> = {
  'amlodipino':'Amlodipine','amlodipina':'Amlodipine','losartán':'Losartan',
  'valsartán':'Valsartan','enalapril':'Enalapril','lisinopril':'Lisinopril',
  'metformina':'Metformin','glibenclamida':'Glibenclamide','atorvastatina':'Atorvastatin',
  'simvastatina':'Simvastatin','rosuvastatina':'Rosuvastatin','omeprazol':'Omeprazole',
  'lansoprazol':'Lansoprazole','pantoprazol':'Pantoprazole','amoxicilina':'Amoxicillin',
  'azitromicina':'Azithromycin','ciprofloxacino':'Ciprofloxacin','metronidazol':'Metronidazole',
  'paracetamol':'Paracetamol','ibuprofeno':'Ibuprofen','salbutamol':'Salbutamol',
  'budesonida':'Budesonide','espironolactona':'Spironolactone','furosemida':'Furosemide',
  'metoprolol':'Metoprolol','bisoprolol':'Bisoprolol','carvedilol':'Carvedilol',
  'propranolol':'Propranolol','warfarina':'Warfarin','clopidogrel':'Clopidogrel',
  'levotiroxina':'Levothyroxine','prednisona':'Prednisone','dexametasona':'Dexamethasone',
  'hidrocortisona':'Hydrocortisone','fluoxetina':'Fluoxetine','sertralina':'Sertraline',
  'diazepam':'Diazepam','lorazepam':'Lorazepam','carbamazepina':'Carbamazepine',
  'tramadol':'Tramadol','morfina':'Morphine','ceftriaxona':'Ceftriaxone',
  'vancomicina':'Vancomycin','fluconazol':'Fluconazole','aciclovir':'Aciclovir',
  'rifampicina':'Rifampicin','isoniazida':'Isoniazid','ivermectina':'Ivermectin',
  'dutasterida':'Dutasteride','tamsulosina':'Tamsulosin','candesartán':'Candesartan',
  'hidroclorotiazida':'Hydrochlorothiazide','olmesartán':'Olmesartan','telmisartán':'Telmisartan',
  'ramipril':'Ramipril','captopril':'Captopril','atenolol':'Atenolol',
  'diltiazem':'Diltiazem','verapamilo':'Verapamil',
  'clortalidona':'Chlortalidone','indapamida':'Indapamide','torasemida':'Torasemide',
};

const INN_PT: Record<string, string> = {
  'amlodipino':'Anlodipino','losartán':'Losartana','metformina':'Metformina',
  'atorvastatina':'Atorvastatina','omeprazol':'Omeprazol','amoxicilina':'Amoxicilina',
  'paracetamol':'Paracetamol','ibuprofeno':'Ibuprofeno','espironolactona':'Espironolactona',
  'furosemida':'Furosemida','levotiroxina':'Levotiroxina','fluoxetina':'Fluoxetina',
  'warfarina':'Varfarina','clopidogrel':'Clopidogrel','ciprofloxacino':'Ciprofloxacino',
  'metronidazol':'Metronidazol','salbutamol':'Salbutamol',
};

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.admin) return NextResponse.json({ error: 'Solo admin' }, { status: 403 });
  } catch { return NextResponse.json({ error: 'Token inválido' }, { status: 401 }); }

  const snap = await adminDb.collection('medicamentos').where('estado', '==', 'autorizado').get();
  let actualizados = 0;
  for (const doc of snap.docs) {
    const data = doc.data()?.data || {};
    const vtm = (data.vtm || '').toLowerCase().trim();
    const vtmEn = INN_EN[vtm];
    const vtmPt = INN_PT[vtm];
    if (vtmEn && !data.vtmEn) {
      const update: any = { 'data.vtmEn': vtmEn };
      if (vtmPt) update['data.vtmPt'] = vtmPt;
      await doc.ref.update(update);
      actualizados++;
    }
  }
  return NextResponse.json({ ok: true, actualizados, total: snap.size });
}