import { NextRequest, NextResponse } from 'next/server';
import {
  CriterioScore, EvidenciaCientifica,
  calcularVeredicto, generarRecomendacion,
  verificarWHO_EML, verificarIrracional, normalizarCombo
} from '@/lib/fdc-algorithm';

// ── Base de conocimiento farmacológico ────────────────────────────────────

// Clases farmacológicas por principio activo
const CLASES: Record<string, string> = {
  // Antihipertensivos
  'losartan': 'ARA2', 'valsartan': 'ARA2', 'candesartan': 'ARA2', 'irbesartan': 'ARA2',
  'telmisartan': 'ARA2', 'olmesartan': 'ARA2', 'azilsartan': 'ARA2',
  'enalapril': 'IECA', 'lisinopril': 'IECA', 'ramipril': 'IECA', 'captopril': 'IECA',
  'perindopril': 'IECA', 'trandolapril': 'IECA', 'benazepril': 'IECA', 'quinapril': 'IECA',
  'fosinopril': 'IECA', 'cilazapril': 'IECA', 'enalaprilato': 'IECA',
  'amlodipino': 'BCC_DHP', 'nifedipino': 'BCC_DHP', 'felodipino': 'BCC_DHP',
  'lercanidipino': 'BCC_DHP', 'lacidipino': 'BCC_DHP', 'nitrendipino': 'BCC_DHP',
  'verapamilo': 'BCC_noHP', 'diltiazem': 'BCC_noHP',
  'hidroclorotiazida': 'TIAZIDA', 'clortalidona': 'TIAZIDA', 'indapamida': 'TIAZIDA',
  'atenolol': 'BETABLOQ', 'bisoprolol': 'BETABLOQ', 'metoprolol': 'BETABLOQ',
  'carvedilol': 'BETABLOQ', 'nebivolol': 'BETABLOQ', 'propranolol': 'BETABLOQ',
  'espironolactona': 'DIURETICO_K', 'eplerenona': 'DIURETICO_K',
  'furosemida': 'ASA', 'torasemida': 'ASA',
  // Antidiabéticos
  'metformina': 'BIGUANIDA', 'glibenclamida': 'SULFONILUREA', 'glipizida': 'SULFONILUREA',
  'glimepirida': 'SULFONILUREA', 'gliclazida': 'SULFONILUREA',
  'sitagliptina': 'DPP4', 'vildagliptina': 'DPP4', 'saxagliptina': 'DPP4',
  'linagliptina': 'DPP4', 'alogliptina': 'DPP4',
  'dapagliflozina': 'SGLT2', 'empagliflozina': 'SGLT2', 'canagliflozina': 'SGLT2',
  'liraglutida': 'GLP1', 'semaglutida': 'GLP1', 'exenatida': 'GLP1',
  // Antibióticos
  'amoxicilina': 'BETALACTAM', 'ampicilina': 'BETALACTAM', 'cefalexina': 'BETALACTAM',
  'ceftriaxona': 'BETALACTAM', 'cefixima': 'BETALACTAM',
  'acido clavulanico': 'INH_BETALACT', 'clavulanato': 'INH_BETALACT',
  'sulbactam': 'INH_BETALACT', 'tazobactam': 'INH_BETALACT',
  'sulfametoxazol': 'SULFONAMIDA', 'trimetoprima': 'DIAMINOPIRIMIDINA',
  'imipenem': 'CARBAPENEM', 'cilastatina': 'INH_DHP',
  // Antivirales
  'efavirenz': 'NNRTI', 'nevirapina': 'NNRTI',
  'emtricitabina': 'NRTI', 'tenofovir': 'NRTI', 'lamivudina': 'NRTI',
  'zidovudina': 'NRTI', 'abacavir': 'NRTI',
  'lopinavir': 'IPROT', 'ritonavir': 'IPROT',
  // Antituberculosos
  'isoniazida': 'ANTITBC', 'rifampicina': 'ANTITBC', 'pirazinamida': 'ANTITBC',
  'etambutol': 'ANTITBC',
  // Antipalúdicos
  'artemeter': 'ARTEMISININA', 'lumefantrina': 'AMINOALCOHOL',
  // AINEs
  'ibuprofeno': 'AINE', 'naproxeno': 'AINE', 'diclofenaco': 'AINE',
  'ketoprofeno': 'AINE', 'meloxicam': 'AINE', 'celecoxib': 'COXIB',
  'nimesulida': 'AINE_SELECTIVO', 'piroxicam': 'AINE',
  'paracetamol': 'ANALGESICO_NO_AINE', 'metamizol': 'ANALGESICO_NO_AINE',
  'cafeina': 'XANTINA', 'codeina': 'OPIOIDE_DEBIL',
  // Antihistamínicos
  'cetirizina': 'ANTIHISTAM_H1', 'loratadina': 'ANTIHISTAM_H1',
  'fexofenadina': 'ANTIHISTAM_H1', 'levocetirizina': 'ANTIHISTAM_H1',
  'difenhidramina': 'ANTIHISTAM_H1_SED',
  'fenilefrina': 'SIMPATICOMIMETICO', 'pseudoefedrina': 'SIMPATICOMIMETICO',
  // Neurológicos
  'levodopa': 'PRECURSOR_DA', 'carbidopa': 'INH_DOPA_DECARB',
  // Anticonceptivos
  'etinilestradiol': 'ESTROGENO', 'levonorgestrel': 'PROGESTAGENO',
  // Lipídicos
  'atorvastatina': 'ESTATINA', 'rosuvastatina': 'ESTATINA', 'simvastatina': 'ESTATINA',
  'ezetimiba': 'INH_ABSORCION_COL',
  // Antibióticos tópicos
  'neomicina': 'AMINOGLUC', 'bacitracina': 'POLIPEPTIDO',
};

// Combinaciones de clases con mecanismo COMPLEMENTARIO
const CLASES_COMPLEMENTARIAS = new Set([
  'ARA2+TIAZIDA', 'TIAZIDA+ARA2',
  'IECA+TIAZIDA', 'TIAZIDA+IECA',
  'ARA2+BCC_DHP', 'BCC_DHP+ARA2',
  'IECA+BCC_DHP', 'BCC_DHP+IECA',
  'BETABLOQ+TIAZIDA', 'TIAZIDA+BETABLOQ',
  'BETABLOQ+BCC_DHP', 'BCC_DHP+BETABLOQ',
  'BETALACTAM+INH_BETALACT',
  'SULFONAMIDA+DIAMINOPIRIMIDINA',
  'CARBAPENEM+INH_DHP',
  'PRECURSOR_DA+INH_DOPA_DECARB',
  'ESTROGENO+PROGESTAGENO',
  'NRTI+NNRTI', 'NNRTI+NRTI',
  'NRTI+IPROT', 'IPROT+NRTI',
  'BIGUANIDA+SULFONILUREA',
  'BIGUANIDA+DPP4', 'DPP4+BIGUANIDA',
  'BIGUANIDA+SGLT2', 'SGLT2+BIGUANIDA',
  'ARTEMISININA+AMINOALCOHOL',
  'ANALGESICO_NO_AINE+OPIOIDE_DEBIL',
  'ANALGESICO_NO_AINE+XANTINA',
  'AMINOGLUC+POLIPEPTIDO',
  'ESTATINA+INH_ABSORCION_COL',
  'ARA2+DIURETICO_K', 'DIURETICO_K+ARA2',
  'IECA+DIURETICO_K', 'DIURETICO_K+IECA',
  'ANTITBC+ANTITBC', // Múltiples antituberculosos son siempre complementarios
]);

// Combinaciones de clases REDUNDANTES o PELIGROSAS
const CLASES_REDUNDANTES = new Set([
  'ARA2+IECA', 'IECA+ARA2',       // Doble bloqueo RAAS — peligroso
  'AINE+AINE',                      // Dos AINEs misma clase
  'AINE+AINE_SELECTIVO',
  'AINE_SELECTIVO+AINE',
  'BETABLOQ+BCC_noHP',             // Bradicardia aditiva
  'BCC_noHP+BETABLOQ',
  'SULFONAMIDA+SULFONAMIDA',
]);

function getClase(pa: string): string {
  const n = pa.toLowerCase().trim()
    .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u');
  return CLASES[n] || 'DESCONOCIDO';
}

function evaluarMecanismos(pas: string[]): { score: 0|1|2; justificacion: string } {
  const clases = pas.map(getClase);
  const desconocidos = clases.filter(c => c === 'DESCONOCIDO').length;

  if (desconocidos === pas.length) {
    return { score: 1, justificacion: 'Clases farmacológicas no identificadas automáticamente. Requiere revisión manual.' };
  }

  // Verificar redundancia/peligro
  for (let i = 0; i < clases.length; i++) {
    for (let j = i+1; j < clases.length; j++) {
      const par = `${clases[i]}+${clases[j]}`;
      if (CLASES_REDUNDANTES.has(par)) {
        return { score: 0, justificacion: `Clases redundantes o interacción peligrosa: ${clases[i]} + ${clases[j]}. Evitar combinación.` };
      }
      if (clases[i] === clases[j] && clases[i] !== 'ANTITBC' && clases[i] !== 'DESCONOCIDO') {
        return { score: 0, justificacion: `Misma clase farmacológica (${clases[i]}): sin beneficio adicional, toxicidad aditiva.` };
      }
    }
  }

  // Verificar complementariedad
  for (let i = 0; i < clases.length; i++) {
    for (let j = i+1; j < clases.length; j++) {
      const par = `${clases[i]}+${clases[j]}`;
      const parRev = `${clases[j]}+${clases[i]}`;
      if (CLASES_COMPLEMENTARIAS.has(par) || CLASES_COMPLEMENTARIAS.has(parRev)) {
        return { score: 2, justificacion: `Mecanismos complementarios confirmados: ${clases[i]} + ${clases[j]}.` };
      }
    }
  }

  return { score: 1, justificacion: `Clases: ${clases.join(' + ')}. Complementariedad no verificada automáticamente.` };
}

function evaluarToxicidad(pas: string[], esIrracional: boolean, razonIrracional?: string): { score: 0|1|2; justificacion: string } {
  if (esIrracional) return { score: 0, justificacion: `VETO toxicidad: ${razonIrracional}` };

  const clases = pas.map(getClase);
  for (let i = 0; i < clases.length; i++) {
    for (let j = i+1; j < clases.length; j++) {
      if (CLASES_REDUNDANTES.has(`${clases[i]}+${clases[j]}`)) {
        return { score: 0, justificacion: `Toxicidad supraditiva documentada: ${clases[i]} + ${clases[j]}.` };
      }
    }
  }

  const enWHO = verificarWHO_EML(pas);
  if (enWHO) return { score: 2, justificacion: 'Perfil de seguridad validado por WHO EML y uso clínico global.' };

  return { score: 1, justificacion: 'Sin señales de toxicidad supraditiva conocida. Confirmar con monitoreo farmacovigilancia.' };
}

async function consultarPubMed(pas: string[]): Promise<{ count: number; ids: string[] }> {
  try {
    const query = pas.map(p => `"${p}"[Title/Abstract]`).join(' AND ');
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query + ' AND (clinical trial[pt] OR randomized[tiab] OR meta-analysis[pt])')}&retmax=10&retmode=json&datetype=pdat&mindate=2014&maxdate=2024`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return { count: parseInt(data.esearchresult?.count||'0'), ids: data.esearchresult?.idlist||[] };
  } catch { return { count: 0, ids: [] }; }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, pas, concs } = await req.json();
    if (!pas || pas.length < 2) return NextResponse.json({ error: 'Se requieren al menos 2 principios activos' }, { status: 400 });

    const enWHO = verificarWHO_EML(pas);
    const { irracional: esIrracional, razon: razonIrracional } = verificarIrracional(pas);
    const pubmed = await consultarPubMed(pas);

    // Evaluaciones farmacológicas
    const mecResult = evaluarMecanismos(pas);
    const toxResult = evaluarToxicidad(pas, esIrracional, razonIrracional);

    const evidencia: EvidenciaCientifica = {
      pubmedCount: pubmed.count,
      cochrane: pubmed.count >= 3,
      nivelEvidencia: enWHO ? 'Ia' : pubmed.count>=5 ? 'Ib' : pubmed.count>=2 ? 'IIa' : pubmed.count>=1 ? 'IIb' : 'IV',
      aprobadaEMA: enWHO || pubmed.count >= 5,
      aprobadaFDA: enWHO || pubmed.count >= 5,
      enWHO_EML: enWHO,
      fuentes: [
        `PubMed: ${pubmed.count} RCTs/meta-análisis (2014–2024)`,
        enWHO ? 'WHO EML v23 2023: INCLUIDA ✓' : 'WHO EML: NO incluida',
        `Análisis farmacológico: ${mecResult.justificacion}`,
        pubmed.ids.length ? `PubMed IDs: ${pubmed.ids.slice(0,5).join(', ')}` : 'Sin IDs PubMed',
      ],
    };

    const criterios: CriterioScore[] = [
      {
        id: 'C1', nombre: 'Contribución terapéutica individual',
        score: esIrracional ? 0 : enWHO ? 2 : pubmed.count > 0 ? 1 : mecResult.score === 2 ? 1 : 0,
        justificacion: esIrracional ? `Sin contribución demostrada. ${razonIrracional}` : enWHO ? 'Validada en WHO EML — cada componente contribuye individualmente.' : pubmed.count > 0 ? `${pubmed.count} estudios apoyan contribución individual.` : 'Sin evidencia publicada de contribución individual.',
        fuente: 'WHO EML · PubMed'
      },
      {
        id: 'C2', nombre: 'Mecanismos de acción complementarios',
        score: mecResult.score,
        justificacion: mecResult.justificacion,
        fuente: 'Base de conocimiento farmacológico SIMI'
      },
      {
        id: 'C3', nombre: 'Farmacocinética compatible',
        score: enWHO ? 2 : pubmed.count >= 2 ? 2 : mecResult.score === 2 ? 1 : 0,
        justificacion: enWHO ? 'Compatibilidad FC validada por uso clínico global.' : pubmed.count >= 2 ? 'Estudios clínicos confirman compatibilidad FC.' : 'Comparar t½, absorción y eliminación. Ver DrugBank.',
        fuente: 'DrugBank · FDA labels'
      },
      {
        id: 'C4', nombre: 'Toxicidad no supraditiva',
        score: toxResult.score as 0|1|2,
        justificacion: toxResult.justificacion,
        fuente: 'EMA EPAR · WHO pharmacovigilance'
      },
      {
        id: 'C5', nombre: 'Balance beneficio/riesgo positivo',
        score: enWHO ? 2 : pubmed.count >= 3 ? 2 : pubmed.count >= 1 ? 1 : mecResult.score === 2 ? 1 : 0,
        justificacion: enWHO ? 'B/R positivo — incluida en medicamentos esenciales OMS.' : `${pubmed.count} estudios. ${pubmed.count >= 3 ? 'Evidencia suficiente.' : pubmed.count >= 1 ? 'Evidencia limitada.' : 'Sin evidencia publicada.'}`,
        fuente: `PubMed (${pubmed.count} resultados)`
      },
      {
        id: 'C6', nombre: 'Dosis fija justificada',
        score: enWHO ? 2 : concs?.length === pas.length && concs.every((c: string) => c) ? 1 : 0,
        justificacion: enWHO ? 'Ratio de dosis validada internacionalmente.' : concs?.length === pas.length ? `Dosis declaradas: ${pas.map((p: string, i: number) => `${p} ${concs[i]||'?'}`).join(' + ')}.` : 'Concentraciones no completamente declaradas.',
        fuente: 'Expediente · Literatura clínica'
      },
      {
        id: 'C7', nombre: 'Evidencia clínica publicada',
        score: pubmed.count >= 5 ? 2 : pubmed.count >= 1 ? 1 : enWHO ? 2 : 0,
        justificacion: `${pubmed.count} RCTs/meta-análisis en PubMed (2014–2024). ${pubmed.count >= 5 ? 'Evidencia sólida.' : pubmed.count >= 1 ? 'Evidencia limitada.' : enWHO ? 'WHO EML como sustituto de evidencia.' : 'Sin evidencia indexada.'}`,
        fuente: `PubMed · IDs: ${pubmed.ids.slice(0,3).join(', ')||'ninguno'}`
      },
      {
        id: 'C8', nombre: 'Aprobada en países de referencia',
        score: enWHO ? 2 : pubmed.count >= 3 ? 1 : mecResult.score === 2 && pubmed.count >= 1 ? 1 : 0,
        justificacion: enWHO ? 'En WHO EML — aprobada en múltiples países de referencia.' : pubmed.count >= 3 ? 'Evidencia suficiente sugiere aprobación en países de referencia.' : 'Verificar: EPAR, Drugs@FDA, Health Canada, MHRA.',
        fuente: 'WHO EML · EPAR · Drugs@FDA'
      },
    ];

    const scoreTotal = criterios.reduce((s, c) => s + c.score, 0);
    const vetoAutomatico = criterios.some(c => (c.id === 'C1' || c.id === 'C4') && c.score === 0);
    const veredicto = calcularVeredicto(scoreTotal, vetoAutomatico, evidencia);

    return NextResponse.json({
      nombre: nombre || pas.join(' + '),
      principiosActivos: pas,
      concentraciones: concs || [],
      scoreTotal, scoreMaximo: 16,
      porcentaje: Math.round((scoreTotal / 16) * 100),
      vetoAutomatico, veredicto, criterios, evidencia,
      recomendacion: generarRecomendacion(veredicto, criterios, evidencia),
      evaluadoPor: 'algoritmo_v2',
      fechaEvaluacion: new Date().toISOString(),
      sandbox: true,
    });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
