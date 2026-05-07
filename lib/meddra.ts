// MedDRA v24.1 — SOC + términos preferentes frecuentes en farmacovigilancia
// 27 System Organ Classes con PTs principales para reporte RAM

export interface MedDRASOC {
  code: string;
  label: string;
  pts: MedDRAPT[];
}

export interface MedDRAPT {
  code: string;
  term: string;
  soc: string;
}

export const MEDDRA_SOC: MedDRASOC[] = [
  { code: '10018065', label: 'Trastornos gastrointestinales', pts: [
    { code: '10000084', term: 'Dolor abdominal', soc: '10018065' },
    { code: '10000087', term: 'Dolor abdominal superior', soc: '10018065' },
    { code: '10013946', term: 'Diarrea', soc: '10018065' },
    { code: '10028813', term: 'Nauseas', soc: '10018065' },
    { code: '10047700', term: 'Vomitos', soc: '10018065' },
    { code: '10020751', term: 'Hemorragia gastrointestinal', soc: '10018065' },
    { code: '10014008', term: 'Dispepsia', soc: '10018065' },
    { code: '10033371', term: 'Pancreatitis', soc: '10018065' },
    { code: '10019972', term: 'Hepatitis', soc: '10018065' },
    { code: '10013828', term: 'Disfagia', soc: '10018065' },
    { code: '10053148', term: 'Colitis', soc: '10018065' },
    { code: '10000486', term: 'Flatulencia', soc: '10018065' },
    { code: '10061517', term: 'Sangrado rectal', soc: '10018065' },
  ]},
  { code: '10027433', label: 'Trastornos del sistema nervioso', pts: [
    { code: '10019211', term: 'Cefalea', soc: '10027433' },
    { code: '10012378', term: 'Mareos', soc: '10027433' },
    { code: '10013573', term: 'Convulsiones', soc: '10027433' },
    { code: '10037042', term: 'Parestesia', soc: '10027433' },
    { code: '10013395', term: 'Discinesia', soc: '10027433' },
    { code: '10041349', term: 'Somnolencia', soc: '10027433' },
    { code: '10015074', term: 'Encefalopatia', soc: '10027433' },
    { code: '10039906', term: 'Accidente cerebrovascular', soc: '10027433' },
    { code: '10028524', term: 'Meningitis', soc: '10027433' },
    { code: '10029205', term: 'Neuropatia periferica', soc: '10027433' },
    { code: '10011224', term: 'Deterioro de la conciencia', soc: '10027433' },
    { code: '10037175', term: 'Parkinson secundario', soc: '10027433' },
  ]},
  { code: '10022117', label: 'Trastornos de la piel y tejido subcutaneo', pts: [
    { code: '10037844', term: 'Rash', soc: '10022117' },
    { code: '10011224', term: 'Prurito', soc: '10022117' },
    { code: '10000707', term: 'Angioedema', soc: '10022117' },
    { code: '10011951', term: 'Urticaria', soc: '10022117' },
    { code: '10040785', term: 'Sindrome de Stevens-Johnson', soc: '10022117' },
    { code: '10014198', term: 'Eritema multiforme', soc: '10022117' },
    { code: '10043189', term: 'Necrolisis epidermica toxica', soc: '10022117' },
    { code: '10013786', term: 'Dermatitis', soc: '10022117' },
    { code: '10030113', term: 'Alopecia', soc: '10022117' },
    { code: '10016946', term: 'Fotosensibilidad', soc: '10022117' },
    { code: '10028393', term: 'Sudoracion nocturna', soc: '10022117' },
  ]},
  { code: '10007541', label: 'Trastornos cardiacos', pts: [
    { code: '10003119', term: 'Arritmia', soc: '10007541' },
    { code: '10003989', term: 'Bradicardia', soc: '10007541' },
    { code: '10042604', term: 'Taquicardia', soc: '10007541' },
    { code: '10019279', term: 'Insuficiencia cardiaca', soc: '10007541' },
    { code: '10067125', term: 'Fibrilacion auricular', soc: '10007541' },
    { code: '10028596', term: 'Infarto de miocardio', soc: '10007541' },
    { code: '10011081', term: 'Cardiopatia', soc: '10007541' },
    { code: '10036545', term: 'Prolongacion del intervalo QT', soc: '10007541' },
    { code: '10033557', term: 'Palpitaciones', soc: '10007541' },
  ]},
  { code: '10038738', label: 'Trastornos respiratorios, toracicos y mediastinicos', pts: [
    { code: '10013968', term: 'Disnea', soc: '10038738' },
    { code: '10011224', term: 'Tos', soc: '10038738' },
    { code: '10006482', term: 'Broncoespasmo', soc: '10038738' },
    { code: '10035664', term: 'Neumonia', soc: '10038738' },
    { code: '10037383', term: 'Fibrosis pulmonar', soc: '10038738' },
    { code: '10014941', term: 'Embolia pulmonar', soc: '10038738' },
    { code: '10003553', term: 'Asma', soc: '10038738' },
    { code: '10036402', term: 'Pleuritis', soc: '10038738' },
    { code: '10036791', term: 'Rinitis alergica', soc: '10038738' },
  ]},
  { code: '10022891', label: 'Trastornos hepatobiliares', pts: [
    { code: '10023893', term: 'Ictericia', soc: '10022891' },
    { code: '10019663', term: 'Hepatotoxicidad', soc: '10022891' },
    { code: '10019726', term: 'Cirrosis hepatica', soc: '10022891' },
    { code: '10024690', term: 'Colestasis', soc: '10022891' },
    { code: '10019837', term: 'Insuficiencia hepatica', soc: '10022891' },
    { code: '10005364', term: 'Bilirrubina elevada', soc: '10022891' },
    { code: '10019222', term: 'Hepatomegalia', soc: '10022891' },
  ]},
  { code: '10038359', label: 'Trastornos renales y urinarios', pts: [
    { code: '10038435', term: 'Insuficiencia renal', soc: '10038359' },
    { code: '10067978', term: 'Lesion renal aguda', soc: '10038359' },
    { code: '10030302', term: 'Nefrotoxicidad', soc: '10038359' },
    { code: '10018965', term: 'Hematuria', soc: '10038359' },
    { code: '10036971', term: 'Proteinuria', soc: '10038359' },
    { code: '10024435', term: 'Cistitis', soc: '10038359' },
    { code: '10047848', term: 'Retencion urinaria', soc: '10038359' },
  ]},
  { code: '10015919', label: 'Trastornos del metabolismo y la nutricion', pts: [
    { code: '10020635', term: 'Hipoglucemia', soc: '10015919' },
    { code: '10020604', term: 'Hiperglucemia', soc: '10015919' },
    { code: '10020910', term: 'Hiponatremia', soc: '10015919' },
    { code: '10020647', term: 'Hipopotasemia', soc: '10015919' },
    { code: '10020587', term: 'Hipercalcemia', soc: '10015919' },
    { code: '10012174', term: 'Acidosis metabolica', soc: '10015919' },
    { code: '10021111', term: 'Anorexia', soc: '10015919' },
  ]},
  { code: '10005329', label: 'Trastornos de la sangre y sistema linfatico', pts: [
    { code: '10002034', term: 'Anemia', soc: '10005329' },
    { code: '10043554', term: 'Trombocitopenia', soc: '10005329' },
    { code: '10025182', term: 'Leucopenia', soc: '10005329' },
    { code: '10028961', term: 'Neutropenia', soc: '10005329' },
    { code: '10002026', term: 'Agranulocitosis', soc: '10005329' },
    { code: '10025255', term: 'Linfopenia', soc: '10005329' },
    { code: '10033762', term: 'Pancitopenia', soc: '10005329' },
  ]},
  { code: '10040785', label: 'Trastornos musculoesqueleticos y tejido conjuntivo', pts: [
    { code: '10003239', term: 'Artralgia', soc: '10040785' },
    { code: '10028411', term: 'Mialgia', soc: '10040785' },
    { code: '10044521', term: 'Rabdomiolisis', soc: '10040785' },
    { code: '10028652', term: 'Miopatia', soc: '10040785' },
    { code: '10037222', term: 'Osteoporosis', soc: '10040785' },
    { code: '10006002', term: 'Dolor de espalda', soc: '10040785' },
    { code: '10023509', term: 'Dolor articular', soc: '10040785' },
  ]},
  { code: '10021428', label: 'Infecciones e infestaciones', pts: [
    { code: '10021881', term: 'Infeccion urinaria', soc: '10021428' },
    { code: '10035664', term: 'Neumonia', soc: '10021428' },
    { code: '10017533', term: 'Infeccion fungica', soc: '10021428' },
    { code: '10022735', term: 'Herpes zoster', soc: '10021428' },
    { code: '10008889', term: 'Celulitis', soc: '10021428' },
    { code: '10040047', term: 'Sepsis', soc: '10021428' },
    { code: '10019973', term: 'Colitis por Clostridium difficile', soc: '10021428' },
  ]},
  { code: '10029205', label: 'Trastornos del sistema inmunologico', pts: [
    { code: '10002198', term: 'Anafilaxia', soc: '10029205' },
    { code: '10000880', term: 'Reaccion alergica', soc: '10029205' },
    { code: '10008164', term: 'Enfermedad autoinmune', soc: '10029205' },
    { code: '10020756', term: 'Hipersensibilidad', soc: '10029205' },
    { code: '10040654', term: 'Sindrome de hipersensibilidad', soc: '10029205' },
  ]},
  { code: '10013765', label: 'Trastornos oculares', pts: [
    { code: '10042772', term: 'Vision borrosa', soc: '10013765' },
    { code: '10015994', term: 'Glaucoma', soc: '10013765' },
    { code: '10003778', term: 'Catarata', soc: '10013765' },
    { code: '10002961', term: 'Retinopatia', soc: '10013765' },
    { code: '10030043', term: 'Ojo seco', soc: '10013765' },
  ]},
  { code: '10019805', label: 'Trastornos vasculares', pts: [
    { code: '10020772', term: 'Hipertension', soc: '10019805' },
    { code: '10021097', term: 'Hipotension', soc: '10019805' },
    { code: '10042434', term: 'Trombosis venosa profunda', soc: '10019805' },
    { code: '10068715', term: 'Tromboembolismo venoso', soc: '10019805' },
    { code: '10014522', term: 'Edema', soc: '10019805' },
    { code: '10028116', term: 'Rubefaccion', soc: '10019805' },
  ]},
  { code: '10041244', label: 'Trastornos endocrinos', pts: [
    { code: '10043882', term: 'Hipotiroidismo', soc: '10041244' },
    { code: '10020583', term: 'Hipertiroidismo', soc: '10041244' },
    { code: '10001367', term: 'Insuficiencia suprarrenal', soc: '10041244' },
    { code: '10012601', term: 'Sindrome de Cushing', soc: '10041244' },
    { code: '10018473', term: 'Ginecomastia', soc: '10041244' },
  ]},
  { code: '10037175', label: 'Trastornos psiquiatricos', pts: [
    { code: '10012218', term: 'Depresion', soc: '10037175' },
    { code: '10002855', term: 'Ansiedad', soc: '10037175' },
    { code: '10022437', term: 'Insomnio', soc: '10037175' },
    { code: '10022523', term: 'Confusion', soc: '10037175' },
    { code: '10036572', term: 'Psicosis', soc: '10037175' },
    { code: '10041349', term: 'Alucinaciones', soc: '10037175' },
    { code: '10041457', term: 'Ideacion suicida', soc: '10037175' },
  ]},
];

export function buscarPT(query: string): MedDRAPT[] {
  const q = query.toLowerCase();
  const results: MedDRAPT[] = [];
  for (const soc of MEDDRA_SOC) {
    for (const pt of soc.pts) {
      if (pt.term.toLowerCase().includes(q)) results.push(pt);
    }
  }
  return results.slice(0, 20);
}

export function getSOCLabel(code: string): string {
  return MEDDRA_SOC.find(s => s.code === code)?.label || code;
}
