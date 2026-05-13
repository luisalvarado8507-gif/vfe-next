// Algoritmo de evaluación FDC — SIMI/ARCSA
// Basado en criterios WHO, EMA (Guideline 2017), FDA 21 CFR 300.50

export interface CriterioScore {
  id: string;
  nombre: string;
  score: 0 | 1 | 2;        // 0=no cumple, 1=parcial, 2=cumple
  justificacion: string;
  fuente?: string;
}

export interface EvidenciaCientifica {
  pubmedCount: number;      // RCTs en PubMed últimos 10 años
  cochrane: boolean;        // Revisión Cochrane disponible
  nivelEvidencia: 'Ia' | 'Ib' | 'IIa' | 'IIb' | 'III' | 'IV' | 'desconocido';
  aprobadaEMA: boolean;
  aprobadaFDA: boolean;
  enWHO_EML: boolean;
  fuentes: string[];
}

export interface EvaluacionFDC {
  medicamentoId: string;
  nombre: string;
  principiosActivos: string[];
  concentraciones: string[];
  codigosATC: string[];
  criterios: CriterioScore[];
  scoreTotal: number;        // 0–16
  scoreMaximo: 16;
  porcentaje: number;        // 0–100
  vetoAutomatico: boolean;   // C1=0 o C4=0
  veredicto: 'RACIONAL' | 'REVISION_EXTENDIDA' | 'IRRACIONAL';
  evidencia: EvidenciaCientifica;
  recomendacion: string;
  evaluadoPor: 'algoritmo_v1';
  fechaEvaluacion: string;
  revisadoPorComite: boolean;
  notasComite?: string;
}

export type Veredicto = 'RACIONAL' | 'REVISION_EXTENDIDA' | 'IRRACIONAL';

export function calcularVeredicto(
  score: number,
  vetoAutomatico: boolean,
  evidencia: EvidenciaCientifica
): Veredicto {
  if (vetoAutomatico) return 'IRRACIONAL';
  if (score < 8) return 'IRRACIONAL';
  if (score >= 12 && (evidencia.aprobadaEMA || evidencia.aprobadaFDA || evidencia.enWHO_EML)) return 'RACIONAL';
  if (score >= 12) return 'REVISION_EXTENDIDA';
  return 'REVISION_EXTENDIDA';
}

export function generarRecomendacion(
  veredicto: Veredicto,
  criterios: CriterioScore[],
  evidencia: EvidenciaCientifica
): string {
  if (veredicto === 'RACIONAL') {
    return `Combinación racional. Cumple criterios WHO-EMA-FDA. ${evidencia.enWHO_EML ? 'Incluida en WHO EML.' : ''} ${evidencia.aprobadaEMA ? 'Aprobada por EMA.' : ''} ${evidencia.aprobadaFDA ? 'Aprobada por FDA.' : ''} Procede autorización de registro.`;
  }
  if (veredicto === 'IRRACIONAL') {
    const fallidos = criterios.filter(c => c.score === 0).map(c => c.nombre).join(', ');
    return `Combinación irracional. Criterios fallidos: ${fallidos}. Se recomienda denegar el registro sanitario y solicitar al titular evidencia científica de nivel I-II que justifique la combinación.`;
  }
  return `Evidencia insuficiente para determinar racionalidad. Se requiere revisión por comité científico ARCSA. Aportar ensayos clínicos controlados que comparen la FDC con sus componentes individuales.`;
}

// Combinaciones conocidas de la WHO EML v23 (2023)
export const WHO_EML_COMBOS = [
  'amoxicilina+ácido clavulánico',
  'amoxicilina+clavulanato',
  'efavirenz+emtricitabina+tenofovir',
  'emtricitabina+tenofovir',
  'lamivudina+nevirapina+zidovudina',
  'lopinavir+ritonavir',
  'lamivudina+zidovudina',
  'etambutol+isoniazida',
  'etambutol+isoniazida+pirazinamida+rifampicina',
  'etambutol+isoniazida+rifampicina',
  'isoniazida+pirazinamida+rifampicina',
  'isoniazida+rifampicina',
  'artemeter+lumefantrina',
  'sulfadoxina+pirimetamina',
  'sulfametoxazol+trimetoprima',
  'neomicina+bacitracina',
  'imipenem+cilastatina',
  'etinilestradiol+levonorgestrel',
  'levodopa+carbidopa',
  'losartán+hidroclorotiazida',
  'enalapril+hidroclorotiazida',
  'lisinopril+hidroclorotiazida',
  'captopril+hidroclorotiazida',
  'ramipril+hidroclorotiazida',
  'perindopril+hidroclorotiazida',
  'trandolapril+hidroclorotiazida',
  'benazepril+hidroclorotiazida',
  'quinapril+hidroclorotiazida',
  'fosinopril+hidroclorotiazida',
  'enalapril+amlodipino',
  'lisinopril+amlodipino',
  'ramipril+amlodipino',
  'perindopril+amlodipino',
  'perindopril+indapamida',
  'telmisartán+hidroclorotiazida',
  'irbesartán+hidroclorotiazida',
  'candesartán+hidroclorotiazida',
  'olmesartán+hidroclorotiazida',
  'atenolol+clortalidona',
  'bisoprolol+hidroclorotiazida',
  'candesartán+amlodipino',
  'valsartán+hidroclorotiazida',
  'metformina+glibenclamida',
];

// Combinaciones conocidas irracionales
export const COMBOS_IRRACIONALES_CONOCIDAS = [
  { combo: 'nimesulida+paracetamol', razon: 'Toxicidad hepática supraditiva. Nimesulida sola supera a paracetamol como antipirético.' },
  { combo: 'diclofenaco+serratopeptidasa', razon: 'Serratopeptidasa sin evidencia clínica robusta. Mayor riesgo GI.' },
  { combo: 'ofloxacino+ornidazol', razon: 'Espectro combinado no siempre justificado. Dosis fija inapropiada.' },
  { combo: 'ibuprofeno+paracetamol+cafeína', razon: 'Cafeína como coadyuvante con evidencia débil. Encarece sin beneficio claro.' },
  { combo: 'nimesulida+diclofenaco', razon: 'Dos AINEs del mismo mecanismo. Toxicidad aditiva sin beneficio adicional.' },
  { combo: 'cetirizina+paracetamol+fenilefrina', razon: 'Combinación sin ventaja demostrada sobre componentes solos para indicación específica.' },
];

export function normalizarCombo(pas: string[]): string {
  return pas.map(p => p.toLowerCase().trim()
    .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u')
  ).sort().join('+');
}

export function verificarWHO_EML(pas: string[]): boolean {
  const combo = normalizarCombo(pas);
  return WHO_EML_COMBOS.some(c => {
    const cn = c.toLowerCase().replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u');
    return cn === combo || cn.split('+').sort().join('+') === combo;
  });
}

export function verificarIrracional(pas: string[]): { irracional: boolean; razon?: string } {
  const combo = normalizarCombo(pas);
  const match = COMBOS_IRRACIONALES_CONOCIDAS.find(c => {
    const cn = c.combo.toLowerCase().replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u');
    return cn.split('+').sort().join('+') === combo;
  });
  return match ? { irracional: true, razon: match.razon } : { irracional: false };
}
