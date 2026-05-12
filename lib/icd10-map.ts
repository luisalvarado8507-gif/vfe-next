// Mapa ATC (nivel 4-5) → indicaciones ICD-10
// Fuente: WHO ICD-10 + correlación ATC-ICD estándar
export const ATC_ICD10: Record<string, { code: string; desc: string }[]> = {
  // Cardiovascular
  'C01':  [{ code: 'I50', desc: 'Insuficiencia cardíaca' }, { code: 'I48', desc: 'Fibrilación auricular' }],
  'C02':  [{ code: 'I10', desc: 'Hipertensión esencial' }, { code: 'I15', desc: 'Hipertensión secundaria' }],
  'C03':  [{ code: 'I10', desc: 'Hipertensión' }, { code: 'I50', desc: 'Insuficiencia cardíaca' }, { code: 'R60', desc: 'Edema' }],
  'C07':  [{ code: 'I10', desc: 'Hipertensión' }, { code: 'I20', desc: 'Angina de pecho' }, { code: 'I48', desc: 'Fibrilación auricular' }],
  'C08':  [{ code: 'I10', desc: 'Hipertensión' }, { code: 'I20', desc: 'Angina de pecho' }],
  'C09':  [{ code: 'I10', desc: 'Hipertensión' }, { code: 'I50', desc: 'Insuficiencia cardíaca' }, { code: 'I25', desc: 'Cardiopatía isquémica crónica' }],
  'C10':  [{ code: 'E78', desc: 'Trastornos del metabolismo de lipoproteínas' }, { code: 'I25', desc: 'Cardiopatía isquémica' }],
  'B01':  [{ code: 'I26', desc: 'Embolia pulmonar' }, { code: 'I63', desc: 'Infarto cerebral' }, { code: 'I48', desc: 'Fibrilación auricular' }],
  // Antiinfecciosos
  'J01C': [{ code: 'J06', desc: 'Infecciones agudas vías respiratorias superiores' }, { code: 'J20', desc: 'Bronquitis aguda' }, { code: 'J22', desc: 'Infección aguda vías respiratorias inferiores' }],
  'J01D': [{ code: 'J18', desc: 'Neumonía' }, { code: 'A41', desc: 'Sepsis' }, { code: 'N39', desc: 'Infección vías urinarias' }],
  'J01M': [{ code: 'N39', desc: 'Infección vías urinarias' }, { code: 'J18', desc: 'Neumonía' }, { code: 'A09', desc: 'Gastroenteritis infecciosa' }],
  'J02':  [{ code: 'B37', desc: 'Candidiasis' }, { code: 'B35', desc: 'Dermatofitosis' }],
  'J05':  [{ code: 'B00', desc: 'Infecciones por herpesvirus' }, { code: 'J10', desc: 'Influenza' }],
  // SNC
  'N02A': [{ code: 'R52', desc: 'Dolor' }, { code: 'G89', desc: 'Dolor crónico' }, { code: 'C80', desc: 'Dolor oncológico' }],
  'N02B': [{ code: 'R50', desc: 'Fiebre' }, { code: 'R52', desc: 'Dolor' }, { code: 'M79', desc: 'Dolor musculoesquelético' }],
  'N03':  [{ code: 'G40', desc: 'Epilepsia' }, { code: 'G41', desc: 'Estado epiléptico' }],
  'N04':  [{ code: 'G20', desc: 'Enfermedad de Parkinson' }, { code: 'G21', desc: 'Parkinsonismo secundario' }],
  'N05':  [{ code: 'F20', desc: 'Esquizofrenia' }, { code: 'F31', desc: 'Trastorno bipolar' }, { code: 'F41', desc: 'Trastornos de ansiedad' }],
  'N06A': [{ code: 'F32', desc: 'Episodio depresivo' }, { code: 'F33', desc: 'Trastorno depresivo recurrente' }, { code: 'F41', desc: 'Trastornos de ansiedad' }],
  // Tracto alimentario
  'A02':  [{ code: 'K21', desc: 'Enfermedad por reflujo gastroesofágico' }, { code: 'K25', desc: 'Úlcera gástrica' }, { code: 'K27', desc: 'Úlcera péptica' }],
  'A03':  [{ code: 'K30', desc: 'Dispepsia' }, { code: 'K59', desc: 'Trastornos funcionales intestinales' }],
  'A10':  [{ code: 'E11', desc: 'Diabetes mellitus tipo 2' }, { code: 'E10', desc: 'Diabetes mellitus tipo 1' }, { code: 'E13', desc: 'Otras formas de diabetes mellitus' }],
  // Respiratorio
  'R03':  [{ code: 'J45', desc: 'Asma' }, { code: 'J44', desc: 'EPOC' }, { code: 'J46', desc: 'Estado asmático' }],
  'R06':  [{ code: 'J30', desc: 'Rinitis alérgica' }, { code: 'L50', desc: 'Urticaria' }, { code: 'T78', desc: 'Efectos adversos sin clasificación' }],
  // Endocrinología
  'H02':  [{ code: 'M32', desc: 'Lupus eritematoso sistémico' }, { code: 'J45', desc: 'Asma' }, { code: 'K50', desc: 'Enfermedad de Crohn' }],
  'H03':  [{ code: 'E03', desc: 'Hipotiroidismo' }, { code: 'E05', desc: 'Tirotoxicosis' }],
  // Musculoesquelético
  'M01':  [{ code: 'M05', desc: 'Artritis reumatoide seropositiva' }, { code: 'M15', desc: 'Poliartrosis' }, { code: 'M54', desc: 'Dorsalgia' }],
  'M04':  [{ code: 'M10', desc: 'Gota' }, { code: 'M11', desc: 'Condrocalcinosis' }],
  'M05':  [{ code: 'M80', desc: 'Osteoporosis con fractura' }, { code: 'M81', desc: 'Osteoporosis sin fractura' }],
  // Oncología
  'L01':  [{ code: 'C80', desc: 'Tumor maligno de sitio no especificado' }, { code: 'C34', desc: 'Tumor maligno bronquios y pulmón' }],
  'L02':  [{ code: 'C50', desc: 'Tumor maligno de mama' }, { code: 'C61', desc: 'Tumor maligno de próstata' }],
  // Hematología
  'B03':  [{ code: 'D50', desc: 'Anemia por deficiencia de hierro' }, { code: 'D51', desc: 'Anemia por deficiencia de B12' }, { code: 'D52', desc: 'Anemia por deficiencia de folato' }],
};

export function getICD10ForATC(atc?: string): { code: string; desc: string }[] {
  if (!atc || atc.length < 3) return [];
  // Buscar por nivel 4 (5 chars), luego nivel 3 (4 chars), luego nivel 2 (3 chars)
  const keys = [atc.substring(0,5), atc.substring(0,4), atc.substring(0,3)];
  for (const key of keys) {
    if (ATC_ICD10[key]) return ATC_ICD10[key];
  }
  return [];
}
