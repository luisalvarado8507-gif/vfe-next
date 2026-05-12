'use client';
import { ATC_DDD } from '@/lib/atc-db';
import { getEDQMDoseForm } from '@/lib/edqm';

// Mapa INN → SNOMED CT (sustancias frecuentes en SIMI)
const SNOMED_INN: Record<string, { code: string; term: string }> = {
  'candesartán':     { code: '372512008', term: 'Candesartan' },
  'amlodipino':      { code: '372502001', term: 'Amlodipine' },
  'losartán':        { code: '373567002', term: 'Losartan' },
  'enalapril':       { code: '372658000', term: 'Enalapril' },
  'metformina':      { code: '372567009', term: 'Metformin' },
  'atorvastatina':   { code: '373444002', term: 'Atorvastatin' },
  'simvastatina':    { code: '387584000', term: 'Simvastatin' },
  'omeprazol':       { code: '372726002', term: 'Omeprazole' },
  'metoprolol':      { code: '372826007', term: 'Metoprolol' },
  'atenolol':        { code: '387506006', term: 'Atenolol' },
  'hidroclorotiazida': { code: '387525002', term: 'Hydrochlorothiazide' },
  'furosemida':      { code: '387475002', term: 'Furosemide' },
  'espironolactona': { code: '387078006', term: 'Spironolactone' },
  'bisoprolol':      { code: '386868003', term: 'Bisoprolol' },
  'carvedilol':      { code: '386870007', term: 'Carvedilol' },
  'ramipril':        { code: '386872004', term: 'Ramipril' },
  'valsartán':       { code: '386876001', term: 'Valsartan' },
  'irbesartán':      { code: '386877005', term: 'Irbesartan' },
  'amlodipina':      { code: '372502001', term: 'Amlodipine' },
  'nifedipino':      { code: '372502001', term: 'Nifedipine' },
  'diltiazem':       { code: '372793000', term: 'Diltiazem' },
  'warfarina':       { code: '372756006', term: 'Warfarin' },
  'aspirina':        { code: '387458008', term: 'Aspirin' },
  'ácido acetilsalicílico': { code: '387458008', term: 'Aspirin' },
  'clopidogrel':     { code: '386952008', term: 'Clopidogrel' },
  'amoxicilina':     { code: '372687004', term: 'Amoxicillin' },
  'azitromicina':    { code: '387531004', term: 'Azithromycin' },
  'ciprofloxacino':  { code: '372840008', term: 'Ciprofloxacin' },
  'metronidazol':    { code: '372602008', term: 'Metronidazole' },
  'ibuprofeno':      { code: '387207008', term: 'Ibuprofen' },
  'paracetamol':     { code: '387517004', term: 'Paracetamol' },
  'tramadol':        { code: '386858008', term: 'Tramadol' },
  'prednisona':      { code: '372680007', term: 'Prednisone' },
  'levotiroxina':    { code: '387579007', term: 'Levothyroxine' },
  'insulina':        { code: '67866001',  term: 'Insulin' },
  'glibenclamida':   { code: '386966003', term: 'Glibenclamide' },
  'glimepirida':     { code: '386967007', term: 'Glimepiride' },
  'salbutamol':      { code: '372897005', term: 'Salbutamol' },
  'budesonida':      { code: '395726003', term: 'Budesonide' },
  'fluticasona':     { code: '396064000', term: 'Fluticasone' },

  // Cardiovascular ampliado
  'olmesartán':      { code: '412118008', term: 'Olmesartan' },
  'telmisartán':     { code: '387069003', term: 'Telmisartan' },
  'lisinopril':      { code: '386872004', term: 'Lisinopril' },
  'captopril':       { code: '372747003', term: 'Captopril' },
  'perindopril':     { code: '386873009', term: 'Perindopril' },
  'propranolol':     { code: '372772003', term: 'Propranolol' },
  'nebivolol':       { code: '407047006', term: 'Nebivolol' },
  'digoxina':        { code: '387461009', term: 'Digoxin' },
  'amiodarona':      { code: '372821002', term: 'Amiodarone' },
  'rosuvastatina':   { code: '407700005', term: 'Rosuvastatin' },
  'pravastatina':    { code: '373566006', term: 'Pravastatin' },
  'ezetimiba':       { code: '414889006', term: 'Ezetimibe' },
  'nitroglicerina':  { code: '387404004', term: 'Nitroglycerin' },
  'isosorbida':      { code: '387137007', term: 'Isosorbide' },
  'torasemida':      { code: '108476002', term: 'Torasemide' },
  'indapamida':      { code: '387132008', term: 'Indapamide' },
  'clortalidona':    { code: '387324003', term: 'Chlortalidone' },
  'amilorida':       { code: '387503006', term: 'Amiloride' },
  'doxazosina':      { code: '387509004', term: 'Doxazosin' },
  'tamsulosina':     { code: '372509007', term: 'Tamsulosin' },
  'dutasterida':     { code: '414152003', term: 'Dutasteride' },
  'finasterida':     { code: '386963009', term: 'Finasteride' },
  'enoxaparina':     { code: '372562003', term: 'Enoxaparin' },
  'heparina':        { code: '372877000', term: 'Heparin' },
  'rivaroxabán':     { code: '703664004', term: 'Rivaroxaban' },
  'dabigatrán':      { code: '700029008', term: 'Dabigatran' },
  'apixabán':        { code: '703966007', term: 'Apixaban' },
  // Antiinfecciosos ampliado
  'ácido clavulánico': { code: '395939008', term: 'Clavulanic acid' },
  'ampicilina':      { code: '372687004', term: 'Ampicillin' },
  'cloxacilina':     { code: '372741007', term: 'Cloxacillin' },
  'ceftriaxona':     { code: '372670001', term: 'Ceftriaxone' },
  'cefazolina':      { code: '372667005', term: 'Cefazolin' },
  'cefuroxima':      { code: '372665002', term: 'Cefuroxime' },
  'cefixima':        { code: '387508007', term: 'Cefixime' },
  'meropenem':       { code: '387540000', term: 'Meropenem' },
  'imipenem':        { code: '387417007', term: 'Imipenem' },
  'claritromicina':  { code: '387487009', term: 'Clarithromycin' },
  'eritromicina':    { code: '372694001', term: 'Erythromycin' },
  'doxiciclina':     { code: '372478003', term: 'Doxycycline' },
  'tetraciclina':    { code: '372721005', term: 'Tetracycline' },
  'levofloxacino':   { code: '387552007', term: 'Levofloxacin' },
  'norfloxacino':    { code: '387271008', term: 'Norfloxacin' },
  'clindamicina':    { code: '372786004', term: 'Clindamycin' },
  'vancomicina':     { code: '372735009', term: 'Vancomycin' },
  'gentamicina':     { code: '372536002', term: 'Gentamicin' },
  'amikacina':       { code: '387249001', term: 'Amikacin' },
  'trimetoprima':    { code: '387179004', term: 'Trimethoprim' },
  'sulfametoxazol':  { code: '398731002', term: 'Sulfamethoxazole' },
  'nitrofurantoína': { code: '372543006', term: 'Nitrofurantoin' },
  'rifampicina':     { code: '387159009', term: 'Rifampicin' },
  'isoniazida':      { code: '387207008', term: 'Isoniazid' },
  'pirazinamida':    { code: '387254004', term: 'Pyrazinamide' },
  'etambutol':       { code: '387129009', term: 'Ethambutol' },
  'fluconazol':      { code: '387174006', term: 'Fluconazole' },
  'itraconazol':     { code: '387532006', term: 'Itraconazole' },
  'nistatina':       { code: '387048008', term: 'Nystatin' },
  'aciclovir':       { code: '372729009', term: 'Aciclovir' },
  'oseltamivir':     { code: '412408008', term: 'Oseltamivir' },
  'ivermectina':     { code: '387559003', term: 'Ivermectin' },
  'albendazol':      { code: '387558006', term: 'Albendazole' },
  'mebendazol':      { code: '387311004', term: 'Mebendazole' },
  'metoclopramida':  { code: '372776000', term: 'Metoclopramide' },
  // SNC ampliado
  'ácido valproico': { code: '387080000', term: 'Valproic acid' },
  'carbamazepina':   { code: '372783004', term: 'Carbamazepine' },
  'fenitoína':       { code: '387220006', term: 'Phenytoin' },
  'fenobarbital':    { code: '372798009', term: 'Phenobarbital' },
  'levetiracetam':   { code: '414934007', term: 'Levetiracetam' },
  'lamotrigina':     { code: '387562006', term: 'Lamotrigine' },
  'clonazepam':      { code: '372702002', term: 'Clonazepam' },
  'diazepam':        { code: '387264003', term: 'Diazepam' },
  'lorazepam':       { code: '387106007', term: 'Lorazepam' },
  'alprazolam':      { code: '386983007', term: 'Alprazolam' },
  'haloperidol':     { code: '386837002', term: 'Haloperidol' },
  'risperidona':     { code: '386840002', term: 'Risperidone' },
  'olanzapina':      { code: '386849001', term: 'Olanzapine' },
  'quetiapina':      { code: '386850001', term: 'Quetiapine' },
  'clozapina':       { code: '387568005', term: 'Clozapine' },
  'fluoxetina':      { code: '372796001', term: 'Fluoxetine' },
  'sertralina':      { code: '372594008', term: 'Sertraline' },
  'escitalopram':    { code: '404852008', term: 'Escitalopram' },
  'citalopram':      { code: '372596005', term: 'Citalopram' },
  'paroxetina':      { code: '372596005', term: 'Paroxetine' },
  'venlafaxina':     { code: '372490001', term: 'Venlafaxine' },
  'duloxetina':      { code: '407032004', term: 'Duloxetine' },
  'amitriptilina':   { code: '372726002', term: 'Amitriptyline' },
  'imipramina':      { code: '372718000', term: 'Imipramine' },
  'litio':           { code: '387393002', term: 'Lithium' },
  'levodopa':        { code: '387018004', term: 'Levodopa' },
  'carbidopa':       { code: '387018004', term: 'Carbidopa' },
  'donepezilo':      { code: '372765000', term: 'Donepezil' },
  'memantina':       { code: '406458000', term: 'Memantine' },
  'morfina':         { code: '373529000', term: 'Morphine' },
  'oxicodona':       { code: '55452001',  term: 'Oxycodone' },
  'codeína':         { code: '387494007', term: 'Codeine' },
  'fentanilo':       { code: '373492002', term: 'Fentanyl' },
  'buprenorfina':    { code: '387173000', term: 'Buprenorphine' },
  'naloxona':        { code: '372890007', term: 'Naloxone' },
  'midazolam':       { code: '373476007', term: 'Midazolam' },
  'ketamina':        { code: '373464007', term: 'Ketamine' },
  'propofol':        { code: '387423006', term: 'Propofol' },
  'lidocaína':       { code: '387480006', term: 'Lidocaine' },
  'bupivacaína':     { code: '387152006', term: 'Bupivacaine' },
  // Digestivo ampliado
  'lansoprazol':     { code: '387246002', term: 'Lansoprazole' },
  'pantoprazol':     { code: '395800008', term: 'Pantoprazole' },
  'ranitidina':      { code: '372755005', term: 'Ranitidine' },
  'ondansetrón':     { code: '372487007', term: 'Ondansetron' },
  'domperidona':     { code: '387181002', term: 'Domperidone' },
  'loperamida':      { code: '387040009', term: 'Loperamide' },
  'lactulosa':       { code: '387352008', term: 'Lactulose' },
  'bisacodilo':      { code: '395954001', term: 'Bisacodyl' },
  'mesalazina':      { code: '387162006', term: 'Mesalazine' },
  'sulfasalazina':   { code: '387248001', term: 'Sulfasalazine' },
  // Musculoesquelético
  'diclofenaco':     { code: '372722003', term: 'Diclofenac' },
  'naproxeno':       { code: '372588000', term: 'Naproxen' },
  'meloxicam':       { code: '387247006', term: 'Meloxicam' },
  'celecoxib':       { code: '116081000', term: 'Celecoxib' },
  'nimesulida':      { code: '373129008', term: 'Nimesulide' },
  'piroxicam':       { code: '387152006', term: 'Piroxicam' },
  'indometacina':    { code: '372798009', term: 'Indometacin' },
  'colchicina':      { code: '387413007', term: 'Colchicine' },
  'alopurinol':      { code: '387384004', term: 'Allopurinol' },
  'metotrexato':     { code: '387381009', term: 'Methotrexate' },
  'ciclosporina':    { code: '387467008', term: 'Ciclosporin' },
  'azatioprina':     { code: '372574004', term: 'Azathioprine' },
  // Respiratorio
  'teofilina':       { code: '372810006', term: 'Theophylline' },
  'aminofilina':     { code: '372810006', term: 'Aminophylline' },
  'ipratropio':      { code: '372518006', term: 'Ipratropium' },
  'tiotropio':       { code: '407102009', term: 'Tiotropium' },
  'salmeterol':      { code: '372515009', term: 'Salmeterol' },
  'formoterol':      { code: '372526005', term: 'Formoterol' },
  'montelukast':     { code: '373728005', term: 'Montelukast' },
  'beclometasona':   { code: '116813004', term: 'Beclometasone' },
  'cetirizina':      { code: '372909002', term: 'Cetirizine' },
  'loratadina':      { code: '372802005', term: 'Loratadine' },
  'fexofenadina':    { code: '372522002', term: 'Fexofenadine' },
  // Endocrino y metabolismo
  'dexametasona':    { code: '372584003', term: 'Dexamethasone' },
  'prednisolona':    { code: '372592002', term: 'Prednisolone' },
  'hidrocortisona':  { code: '396458002', term: 'Hydrocortisone' },
  'betametasona':    { code: '116574000', term: 'Betamethasone' },
  'fludrocortisona': { code: '116601002', term: 'Fludrocortisone' },
  'medroxiprogesterona': { code: '126113004', term: 'Medroxyprogesterone' },
  'levonorgestrel':  { code: '126097006', term: 'Levonorgestrel' },
  'etinilestradiol': { code: '126098001', term: 'Ethinylestradiol' },
  'gliclazida':      { code: '386965004', term: 'Gliclazide' },
  'glipizida':       { code: '386966003', term: 'Glipizide' },
  'pioglitazona':    { code: '414005006', term: 'Pioglitazone' },
  'sitagliptina':    { code: '423307000', term: 'Sitagliptin' },
  'vildagliptina':   { code: '441656003', term: 'Vildagliptin' },
  'dapagliflozina':  { code: '703676008', term: 'Dapagliflozin' },
  'empagliflozina':  { code: '703976008', term: 'Empagliflozin' },
  'liraglutida':     { code: '449021000',  term: 'Liraglutide' },
  'semaglutida':     { code: '2200644',    term: 'Semaglutide' },
  'propiltiouracilo': { code: '387402000', term: 'Propylthiouracil' },
  'metimazol':       { code: '387066006', term: 'Methimazole' },
  'carbimazol':      { code: '387244004', term: 'Carbimazole' },
  // Oncología básica
  'tamoxifeno':      { code: '373345002', term: 'Tamoxifen' },
  'anastrozol':      { code: '386910003', term: 'Anastrozole' },
  'letrozol':        { code: '386912006', term: 'Letrozole' },
  'ciclofosfamida':  { code: '387420009', term: 'Cyclophosphamide' },
  'vincristina':     { code: '387126006', term: 'Vincristine' },
  'doxorrubicina':   { code: '372817009', term: 'Doxorubicin' },
  'capecitabina':    { code: '386906001', term: 'Capecitabine' },
  'imatinib':        { code: '414460008', term: 'Imatinib' },
  // Hematología
  'ácido fólico':    { code: '387451009', term: 'Folic acid' },
  'hierro':          { code: '387388001', term: 'Iron' },
  'ferroso':         { code: '387388001', term: 'Ferrous sulfate' },
  'cianocobalamina': { code: '387354009', term: 'Cyanocobalamin' },
  'hidroxiurea':     { code: '387314009', term: 'Hydroxycarbamide' },
  'eritropoyetina':  { code: '387044006', term: 'Erythropoietin' },
  // Oftalmología
  'latanoprost':     { code: '386926001', term: 'Latanoprost' },
  'timolol':         { code: '372800008', term: 'Timolol' },
  'pilocarpina':     { code: '372895004', term: 'Pilocarpine' },
  'acetazolamida':   { code: '372709004', term: 'Acetazolamide' },
  // Varios
  'acetilcisteína':  { code: '372528009', term: 'Acetylcysteine' },
  'calcio':          { code: '5540006',   term: 'Calcium' },
  'vitamina d':      { code: '71516007',  term: 'Vitamin D' },
  'colecalciferol':  { code: '71516007',  term: 'Colecalciferol' },
  'retinol':         { code: '82622003',  term: 'Retinol' },
  'zinc':            { code: '86739005',  term: 'Zinc' },
  'potasio':         { code: '8631001',   term: 'Potassium' },
  'magnesio':        { code: '72489007',  term: 'Magnesium' },
  'oxitocina':       { code: '112115002', term: 'Oxytocin' },
  'ergometrina':     { code: '387087009', term: 'Ergometrine' },
  'misoprostol':     { code: '387247006', term: 'Misoprostol' },
  'adrenalina':      { code: '387362001', term: 'Epinephrine' },
  'epinefrina':      { code: '387362001', term: 'Epinephrine' },
  'dopamina':        { code: '412383006', term: 'Dopamine' },
  'noradrenalina':   { code: '45754009',  term: 'Norepinephrine' },
  'atropina':        { code: '372832002', term: 'Atropine' },
  'manitol':         { code: '372765000', term: 'Mannitol' },
  'albumina':        { code: '52454007',  term: 'Albumin' },
  'dextrosa':        { code: '67079006',  term: 'Glucose' },
};



// Mapa INN → RxNorm RxCUI (NLM USA) — sustancias frecuentes
const RXNORM_INN: Record<string, string> = {
  'amlodipino': '17767', 'amlodipina': '17767',
  'losartán': '203160', 'valsartán': '69749',
  'enalapril': '3827', 'lisinopril': '29046',
  'metformina': '6809', 'glibenclamida': '4815',
  'atorvastatina': '83367', 'simvastatina': '36567',
  'omeprazol': '7646', 'lansoprazol': '17128',
  'amoxicilina': '723', 'azitromicina': '18631',
  'ciprofloxacino': '2551', 'metronidazol': '6922',
  'paracetamol': '161', 'ibuprofeno': '5640',
  'salbutamol': '435', 'budesonida': '19831',
  'espironolactona': '9997', 'furosemida': '4603',
  'metoprolol': '6918', 'bisoprolol': '19484',
  'warfarina': '11289', 'clopidogrel': '41493',
  'levotiroxina': '10582', 'prednisona': '8638',
  'dexametasona': '3264', 'hidrocortisona': '5311',
  'fluoxetina': '4493', 'sertralina': '36437',
  'diazepam': '3322', 'lorazepam': '6470',
  'carbamazepina': '2002', 'ácido valproico': '11118',
  'tramadol': '10689', 'morfina': '7052',
  'insulina': '5856', 'metformina': '6809',
  'ceftriaxona': '2193', 'vancomicina': '11124',
  'fluconazol': '4450', 'aciclovir': '19',
  'rifampicina': '9384', 'isoniazida': '6038',
};

// Mapa texto → UCUM (ISO 11240) — Unified Code for Units of Measure
// Fuente: https://ucum.org/ucum.html
const UCUM_MAP: Record<string, { code: string; display: string }> = {
  // Masa
  'mg':    { code: 'mg',   display: 'mg' },
  'g':     { code: 'g',    display: 'g' },
  'mcg':   { code: 'ug',   display: 'μg' },
  'μg':    { code: 'ug',   display: 'μg' },
  'ug':    { code: 'ug',   display: 'μg' },
  'kg':    { code: 'kg',   display: 'kg' },
  'ng':    { code: 'ng',   display: 'ng' },
  // Volumen
  'ml':    { code: 'mL',   display: 'mL' },
  'l':     { code: 'L',    display: 'L' },
  'dl':    { code: 'dL',   display: 'dL' },
  'ul':    { code: 'uL',   display: 'μL' },
  // Unidades internacionales
  'ui':    { code: '[IU]', display: 'UI' },
  'iu':    { code: '[IU]', display: 'IU' },
  'ufc':   { code: '[CFU]',display: 'UFC' },
  // Molar
  'mmol':  { code: 'mmol', display: 'mmol' },
  'mol':   { code: 'mol',  display: 'mol' },
  'meq':   { code: 'meq',  display: 'mEq' },
  // Concentración
  'mg/ml': { code: 'mg/mL',display: 'mg/mL' },
  'mg/l':  { code: 'mg/L', display: 'mg/L' },
  'g/l':   { code: 'g/L',  display: 'g/L' },
  'g/dl':  { code: 'g/dL', display: 'g/dL' },
  'mg/dl': { code: 'mg/dL',display: 'mg/dL' },
  'ui/ml': { code: '[IU]/mL', display: 'UI/mL' },
  '%':     { code: '%',    display: '%' },
  // Otros
  'mcg/dosis': { code: 'ug/{dose}', display: 'μg/dosis' },
  'mg/dosis':  { code: 'mg/{dose}', display: 'mg/dosis' },
};

function toUCUM(unit?: string): { code: string; display: string } | null {
  if (!unit) return null;
  return UCUM_MAP[unit.toLowerCase().trim()] || null;
}

// Roles de ingredientes según ISO 11238
export type RolIngrediente = 'active' | 'excipient' | 'adjuvant' | 'residue';

export interface Ingrediente {
  sustancia: string;           // INN/DCI
  rol: RolIngrediente;
  concentracion?: string;      // Valor numérico
  unidad?: string;             // Unidad EDQM/UCUM
  concentracionDenominador?: string;
  unidadDenominador?: string;
  snomedCode?: string;         // SNOMED CT concept ID
  snomedTerm?: string;
  referencia?: boolean;        // Concentración de referencia (ISO 11238)
  ddd?: string;                 // Dosis Diaria Definida WHO
  rxcui?: string;               // RxNorm RxCUI (NLM USA)
}

const ROL_CONFIG: Record<RolIngrediente, { label: string; bg: string; color: string; desc: string }> = {
  active:    { label: 'Activo',      bg: '#DBEAFE', color: '#1E40AF', desc: 'Principio activo (ISO 11238 §4.2)' },
  excipient: { label: 'Excipiente',  bg: '#F1F5F9', color: '#475569', desc: 'Excipiente (ISO 11238 §4.3)' },
  adjuvant:  { label: 'Adyuvante',   bg: '#ECFDF5', color: '#065F46', desc: 'Adyuvante inmunológico' },
  residue:   { label: 'Residuo',     bg: '#FEF3C7', color: '#92400E', desc: 'Residuo de proceso' },
};

interface TablaIngredientesProps {
  ingredientes: Ingrediente[];
  editable?: boolean;
  onChange?: (ingredientes: Ingrediente[]) => void;
}

export default function TablaIngredientes({ ingredientes, editable, onChange }: TablaIngredientesProps) {
  if (!ingredientes || ingredientes.length === 0) {
    return (
      <div style={{ padding: '16px', background: 'var(--bg3)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--tx4)', textAlign: 'center' }}>
        Sin ingredientes declarados
      </div>
    );
  }

  const activos = ingredientes.filter(i => i.rol === 'active');
  const excipientes = ingredientes.filter(i => i.rol !== 'active');

  return (
    <div>
      {/* Header ISO 11238 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
          Tabla de ingredientes · ISO 11238
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--bdr)' }} />
        <span style={{ fontSize: 10, color: 'var(--tx4)', fontFamily: 'var(--mono)' }}>
          {activos.length} activo{activos.length !== 1 ? 's' : ''} · {excipientes.length} excipiente{excipientes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              {['Sustancia (INN/DCI)', 'Rol', 'Concentración', 'Unidad', 'SNOMED CT', 'RxNorm', 'DDD'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '7px 12px', fontSize: 9, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 0.8, fontFamily: 'var(--mono)', textTransform: 'uppercase', borderBottom: '1px solid var(--bdr)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ingredientes.map((ing, i) => {
              const rc = ROL_CONFIG[ing.rol] || ROL_CONFIG.active;
              return (
                <tr key={i} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--bdr)', background: ing.rol === 'active' ? '#FAFBFF' : '#fff' }}>
                  <td style={{ padding: '8px 12px', fontWeight: ing.rol === 'active' ? 600 : 400, color: 'var(--tx)' }}>
                    {ing.sustancia}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: rc.bg, color: rc.color }} title={rc.desc}>
                      {rc.label}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx2)' }}>
                    {ing.concentracion || '—'}
                    {ing.concentracionDenominador ? `/${ing.concentracionDenominador}` : ''}
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx3)' }}>
                    {ing.unidad || '—'}
                    {ing.unidadDenominador ? `/${ing.unidadDenominador}` : ''}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    {ing.snomedCode ? (
                      <a href={`https://browser.ihtsdotools.org/?perspective=full&conceptId1=${ing.snomedCode}`}
                        target="_blank" rel="noreferrer"
                        style={{ fontSize: 10, fontFamily: 'var(--mono)', color: '#5B21B6', textDecoration: 'none', fontWeight: 600 }}>
                        {ing.snomedCode} ↗
                      </a>
                    ) : <span style={{ color: 'var(--tx4)', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    {/* RxNorm */}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                    {ing.rxcui ? (
                      <a href={`https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${ing.rxcui}`}
                        target="_blank" rel="noreferrer"
                        style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textDecoration: 'none', fontFamily: 'var(--mono)', padding: '1px 5px', borderRadius: 3, background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                        {ing.rxcui}
                      </a>
                    ) : <span style={{ color: 'var(--tx4)', fontSize: 10 }}>—</span>}
                    {ing.ddd ? (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#0891B2', fontFamily: 'var(--mono)' }} title="Dosis Diaria Definida WHO">{ing.ddd}</span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Nota ISO */}
      <div style={{ fontSize: 9, color: 'var(--tx4)', marginTop: 6, fontFamily: 'var(--mono)', textAlign: 'right' }}>
        ISO 11238 · Pharmaceutical Substances · EDQM Standard Terms
      </div>
    </div>
  );
}

// Función para convertir datos planos SIMI a Ingredientes ISO 11238
export function simiToIngredientes(med: Record<string, any>): Ingrediente[] {
  if (med.esCombo && med.comboData?.pas?.length) {
    return med.comboData.pas.map((pa: string, i: number) => ({
      sustancia: pa,
      rol: 'active' as RolIngrediente,
      concentracion: med.comboData.concs?.[i] ? String(med.comboData.concs[i]) : undefined,
      unidad: med.comboData.units?.[i] || 'mg',
      snomedCode: SNOMED_INN[pa?.toLowerCase()]?.code,
      snomedTerm: SNOMED_INN[pa?.toLowerCase()]?.term,
      referencia: i === 0,
    }));
  }
  if (med.vtm) {
    return [{
      sustancia: med.vtm,
      rol: 'active',
      concentracion: med.conc ? med.conc.replace(/[^0-9.,]/g, '').trim() : undefined,
      unidad: med.conc ? med.conc.replace(/[0-9.,\s]/g, '').trim() || 'mg' : 'mg',
      snomedCode: med.snomed_vtm_code,
      snomedTerm: med.vtm,
      referencia: true,
      rxcui: RXNORM_INN[med.vtm?.toLowerCase?.() || ''] || undefined,
      ddd: (() => {
        const atc = med.atc?.trim();
        if (!atc || atc.length < 7) return undefined;
        const ddds = ATC_DDD[atc.substring(0,7)];
        if (!ddds?.length) return undefined;
        return ddds.map((d: any) => `${d.ddd}${d.uom} ${d.adm}`).join(' / ');
      })(),
    }];
  }
  return [];
}
