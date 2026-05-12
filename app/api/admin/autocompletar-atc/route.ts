import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

// Mapa INN → ATC nivel 5 (códigos WHO oficiales)
const INN_ATC: Record<string, string> = {
  // Cardiovascular
  'amlodipino': 'C08CA01', 'amlodipina': 'C08CA01',
  'nifedipino': 'C08CA05', 'nifedipina': 'C08CA05',
  'diltiazem': 'C08DB01', 'verapamilo': 'C08DA01',
  'atenolol': 'C07AB03', 'bisoprolol': 'C07AB07',
  'carvedilol': 'C07AG02', 'metoprolol': 'C07AB02',
  'propranolol': 'C07AA05', 'nebivolol': 'C07AB12',
  'enalapril': 'C09AA02', 'lisinopril': 'C09AA03',
  'captopril': 'C09AA01', 'ramipril': 'C09AA05',
  'perindopril': 'C09AA04', 'fosinopril': 'C09AA09',
  'losartán': 'C09CA01', 'valsartán': 'C09CA03',
  'irbesartán': 'C09CA04', 'candesartán': 'C09CA06',
  'olmesartán': 'C09CA08', 'telmisartán': 'C09CA07',
  'furosemida': 'C03CA01', 'torasemida': 'C03CA04',
  'hidroclorotiazida': 'C03AA03', 'indapamida': 'C03BA11',
  'clortalidona': 'C03BA04', 'espironolactona': 'C03DA01',
  'eplerenona': 'C03DA04', 'amilorida': 'C03DB01',
  'atorvastatina': 'C10AA05', 'simvastatina': 'C10AA01',
  'rosuvastatina': 'C10AA07', 'pravastatina': 'C10AA03',
  'ezetimiba': 'C10AX09', 'fenofibrato': 'C10AB05',
  'warfarina': 'B01AA03', 'acenocumarol': 'B01AA07',
  'heparina': 'B01AB01', 'enoxaparina': 'B01AB05',
  'rivaroxabán': 'B01AF01', 'apixabán': 'B01AF02',
  'dabigatrán': 'B01AE07', 'clopidogrel': 'B01AC04',
  'ticagrelor': 'B01AC24', 'prasugrel': 'B01AC22',
  'aspirina': 'B01AC06', 'ácido acetilsalicílico': 'B01AC06',
  'digoxina': 'C01AA05', 'amiodarona': 'C01BD01',
  'nitroglicerina': 'C01DA02', 'isosorbida': 'C01DA14',
  'doxazosina': 'C02CA04', 'prazosina': 'C02CA01',
  'tamsulosina': 'G04CA02', 'alfuzosina': 'G04CA01',
  'hidralazina': 'C02DB02', 'metildopa': 'C02AB01',
  'clonidina': 'C02AC01',
  // Diabetes
  'metformina': 'A10BA02', 'glibenclamida': 'A10BB01',
  'glimepirida': 'A10BB12', 'gliclazida': 'A10BB09',
  'glipizida': 'A10BB07', 'pioglitazona': 'A10BG03',
  'sitagliptina': 'A10BH01', 'vildagliptina': 'A10BH02',
  'saxagliptina': 'A10BH03', 'linagliptina': 'A10BH05',
  'dapagliflozina': 'A10BK01', 'empagliflozina': 'A10BK03',
  'canagliflozina': 'A10BK02', 'liraglutida': 'A10BJ02',
  'semaglutida': 'A10BJ06', 'insulina': 'A10AB01',
  'acarbosa': 'A10BF01',
  // Tiroides
  'levotiroxina': 'H03AA01', 'liotironina': 'H03AA02',
  'propiltiouracilo': 'H03BA02', 'metimazol': 'H03BB02',
  'carbimazol': 'H03BB01',
  // Digestivo
  'omeprazol': 'A02BC01', 'lansoprazol': 'A02BC03',
  'pantoprazol': 'A02BC02', 'esomeprazol': 'A02BC05',
  'rabeprazol': 'A02BC04', 'ranitidina': 'A02BA02',
  'famotidina': 'A02BA03', 'ondansetrón': 'A04AA01',
  'granisetrón': 'A04AA02', 'metoclopramida': 'A03FA01',
  'domperidona': 'A03FA03', 'loperamida': 'A07DA03',
  'lactulosa': 'A06AD11', 'bisacodilo': 'A06AB02',
  'mesalazina': 'A07EC02', 'sulfasalazina': 'A07EC01',
  'orlistat': 'A08AB01',
  // Antiinfecciosos
  'amoxicilina': 'J01CA04', 'ampicilina': 'J01CA01',
  'cloxacilina': 'J01CF02', 'dicloxacilina': 'J01CF01',
  'ácido clavulánico': 'J01CR02', 'piperacilina': 'J01CA12',
  'cefalexina': 'J01DB01', 'cefazolina': 'J01DB04',
  'cefuroxima': 'J01DC02', 'cefixima': 'J01DD08',
  'ceftriaxona': 'J01DD04', 'cefotaxima': 'J01DD01',
  'ceftazidima': 'J01DD02', 'cefepima': 'J01DE01',
  'meropenem': 'J01DH02', 'imipenem': 'J01DH51',
  'ertapenem': 'J01DH03', 'azitromicina': 'J01FA10',
  'claritromicina': 'J01FA09', 'eritromicina': 'J01FA01',
  'doxiciclina': 'J01AA02', 'tetraciclina': 'J01AA07',
  'minociclina': 'J01AA08', 'tigeciclina': 'J01AA12',
  'ciprofloxacino': 'J01MA02', 'levofloxacino': 'J01MA12',
  'moxifloxacino': 'J01MA14', 'norfloxacino': 'J01MA06',
  'ofloxacino': 'J01MA01', 'gentamicina': 'J01GB03',
  'amikacina': 'J01GB06', 'tobramicina': 'J01GB01',
  'vancomicina': 'J01XA01', 'teicoplanina': 'J01XA02',
  'linezolid': 'J01XX08', 'clindamicina': 'J01FF01',
  'cloranfenicol': 'J01BA01', 'metronidazol': 'J01XD01',
  'tinidazol': 'J01XD02', 'trimetoprima': 'J01EA01',
  'nitrofurantoína': 'J01XE01', 'fosfomicina': 'J01XX01',
  'colistina': 'J01XB01', 'rifampicina': 'J04AB02',
  'isoniazida': 'J04AC01', 'pirazinamida': 'J04AK01',
  'etambutol': 'J04AK02', 'bedaquilina': 'J04AK05',
  // Antifúngicos
  'fluconazol': 'J02AC01', 'itraconazol': 'J02AC02',
  'voriconazol': 'J02AC03', 'posaconazol': 'J02AC04',
  'anfotericina b': 'J02AA01', 'caspofungina': 'J02AX04',
  'nistatina': 'A07AA02', 'clotrimazol': 'D01AC01',
  'miconazol': 'D01AC02', 'terbinafina': 'D01AE15',
  // Antivirales
  'aciclovir': 'J05AB01', 'valaciclovir': 'J05AB11',
  'ganciclovir': 'J05AB06', 'oseltamivir': 'J05AH02',
  'zidovudina': 'J05AF01', 'lamivudina': 'J05AF05',
  'tenofovir': 'J05AF07', 'emtricitabina': 'J05AF09',
  'abacavir': 'J05AF06', 'nevirapina': 'J05AG01',
  'efavirenz': 'J05AG03', 'dolutegravir': 'J05AJ03',
  'lopinavir': 'J05AE06', 'ritonavir': 'J05AE03',
  'atazanavir': 'J05AE08', 'darunavir': 'J05AE10',
  // Antiparasitarios
  'ivermectina': 'P02CF01', 'albendazol': 'P02CA03',
  'mebendazol': 'P02CA01', 'praziquantel': 'P02BA01',
  'cloroquina': 'P01BA01', 'hidroxicloroquina': 'P01BA02',
  'artesunato': 'P01BE03', 'artemeter': 'P01BE02',
  'quinina': 'P01BC01', 'primaquina': 'P01BA03',
  'mefloquina': 'P01BC02', 'benznidazol': 'P01CA02',
  // SNC
  'paracetamol': 'N02BE01', 'ibuprofeno': 'M01AE01',
  'naproxeno': 'M01AE02', 'diclofenaco': 'M01AB05',
  'ketoprofeno': 'M01AE03', 'ketorolaco': 'M01AB15',
  'metamizol': 'N02BB02', 'nimesulida': 'M01AX17',
  'celecoxib': 'M01AH01', 'etoricoxib': 'M01AH05',
  'meloxicam': 'M01AC06', 'piroxicam': 'M01AC01',
  'indometacina': 'M01AB01', 'morfina': 'N02AA01',
  'oxicodona': 'N02AA05', 'tramadol': 'N02AX02',
  'codeína': 'N02AA59', 'fentanilo': 'N02AB03',
  'buprenorfina': 'N02AE01', 'metadona': 'N02AC52',
  'naloxona': 'V03AB15', 'pregabalina': 'N03AX16',
  'gabapentina': 'N03AX12', 'sumatriptán': 'N02CC01',
  'ácido valproico': 'N03AG01', 'valproato': 'N03AG01',
  'carbamazepina': 'N03AF01', 'oxcarbazepina': 'N03AF02',
  'fenitoína': 'N03AB02', 'fenobarbital': 'N03AA02',
  'levetiracetam': 'N03AX14', 'lamotrigina': 'N03AX09',
  'topiramato': 'N03AX11', 'lacosamida': 'N03AX18',
  'clonazepam': 'N03AE01', 'diazepam': 'N05BA01',
  'lorazepam': 'N05BA06', 'alprazolam': 'N05BA12',
  'midazolam': 'N05CD08', 'zolpidem': 'N05CF02',
  'haloperidol': 'N05AD01', 'risperidona': 'N05AX08',
  'olanzapina': 'N05AH03', 'quetiapina': 'N05AH04',
  'clozapina': 'N05AH02', 'aripiprazol': 'N05AX12',
  'fluoxetina': 'N06AB03', 'sertralina': 'N06AB06',
  'escitalopram': 'N06AB10', 'citalopram': 'N06AB04',
  'paroxetina': 'N06AB05', 'venlafaxina': 'N06AX16',
  'duloxetina': 'N06AX21', 'mirtazapina': 'N06AX11',
  'amitriptilina': 'N06AA09', 'imipramina': 'N06AA02',
  'litio': 'N05AN01', 'levodopa': 'N04BA01',
  'carbidopa': 'N04BA02', 'pramipexol': 'N04BC05',
  'donepezilo': 'N06DA02', 'memantina': 'N06DX01',
  'biperideno': 'N04AA02',
  // Anestésicos
  'propofol': 'N01AX10', 'ketamina': 'N01AX03',
  'lidocaína': 'N01BB02', 'bupivacaína': 'N01BB01',
  'atropina': 'A03BA01',
  // Respiratorio
  'salbutamol': 'R03AC02', 'terbutalina': 'R03AC03',
  'salmeterol': 'R03AC12', 'formoterol': 'R03AC13',
  'ipratropio': 'R03BB01', 'tiotropio': 'R03BB04',
  'beclometasona': 'R03BA01', 'budesonida': 'R03BA02',
  'fluticasona': 'R03BA05', 'montelukast': 'R03DC03',
  'teofilina': 'R03DA04', 'aminofilina': 'R03DA05',
  'cetirizina': 'R06AE07', 'loratadina': 'R06AX13',
  'fexofenadina': 'R06AX26', 'desloratadina': 'R06AX27',
  'levocetirizina': 'R06AE09', 'bromhexina': 'R05CB02',
  'ambroxol': 'R05CB06', 'acetilcisteína': 'R05CB01',
  // Endocrinología
  'dexametasona': 'H02AB02', 'prednisolona': 'H02AB06',
  'prednisona': 'H02AB07', 'hidrocortisona': 'H02AB09',
  'betametasona': 'H02AB01', 'metilprednisolona': 'H02AB04',
  'fludrocortisona': 'H02AA02', 'medroxiprogesterona': 'G03AC06',
  'levonorgestrel': 'G03AC03', 'etinilestradiol': 'G03AA',
  'progesterona': 'G03DA04', 'testosterona': 'G03BA03',
  'oxitocina': 'H01BB02', 'ergometrina': 'G02AB03',
  'misoprostol': 'G02AD06',
  // Oncología
  'tamoxifeno': 'L02BA01', 'anastrozol': 'L02BG03',
  'letrozol': 'L02BG04', 'ciclofosfamida': 'L01AA01',
  'cisplatino': 'L01XA01', 'carboplatino': 'L01XA02',
  'oxaliplatino': 'L01XA03', 'fluorouracilo': 'L01BC02',
  'capecitabina': 'L01BC06', 'gemcitabina': 'L01BC05',
  'paclitaxel': 'L01CD01', 'docetaxel': 'L01CD02',
  'doxorrubicina': 'L01DB01', 'vincristina': 'L01CA02',
  'metotrexato': 'L01BA01', 'imatinib': 'L01EA01',
  'rituximab': 'L01FA01', 'trastuzumab': 'L01FD01',
  'bevacizumab': 'L01FG01',
  // Hematología
  'ácido fólico': 'B03BB01', 'sulfato ferroso': 'B03AA07',
  'cianocobalamina': 'B03BA01', 'eritropoyetina': 'B03XA01',
  'filgrastim': 'L03AA02', 'hidroxiurea': 'L01XX05',
  // Vitaminas
  'calcio': 'A12AA', 'vitamina d': 'A11CC05',
  'colecalciferol': 'A11CC05', 'ácido ascórbico': 'A11GA01',
  'tiamina': 'A11DA01', 'zinc': 'A12CB01',
  // Musculoesquelético
  'colchicina': 'M04AC01', 'alopurinol': 'M04AA01',
  'metotrexato': 'L01BA01', 'ciclosporina': 'L04AD01',
  'tacrolimus': 'L04AD02', 'alendronato': 'M05BA04',
  'risedronato': 'M05BA07', 'baclofeno': 'M03BX01',
  // Oftalmología
  'latanoprost': 'S01EE01', 'timolol': 'S01ED01',
  'pilocarpina': 'S01EB01', 'acetazolamida': 'S01EC01',
};

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.admin) return NextResponse.json({ error: 'Solo admin' }, { status: 403 });
  } catch { return NextResponse.json({ error: 'Token inválido' }, { status: 401 }); }

  let actualizados = 0, revisados = 0, lastDoc: any = null;
  while (true) {
    let q: any = adminDb.collection('medicamentos')
      .where('estado', '==', 'arcsa_pendiente')
      .where('data.atc', '==', '').limit(500);
    if (lastDoc) q = q.startAfter(lastDoc);
    const snap = await q.get();
    if (snap.empty) break;
    for (const doc of snap.docs) {
      const d = doc.data()?.data || {};
      const vtm = (d.vtm || '').toLowerCase().trim();
      const atc = INN_ATC[vtm];
      revisados++;
      if (atc) {
        await doc.ref.update({ 'data.atc': atc });
        actualizados++;
      }
    }
    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.docs.length < 500) break;
  }
  return NextResponse.json({ ok: true, actualizados, revisados });
}
