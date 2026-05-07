import { NextRequest, NextResponse } from 'next/server';
import {
  CriterioScore, EvidenciaCientifica,
  calcularVeredicto, generarRecomendacion,
  verificarWHO_EML, verificarIrracional
} from '@/lib/fdc-algorithm';

async function consultarPubMed(pas: string[]): Promise<{ count: number; ids: string[] }> {
  try {
    const query = pas.map(p => `"${p}"[Title/Abstract]`).join(' AND ');
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query + ' AND (clinical trial[pt] OR randomized[tiab] OR meta-analysis[pt])')}&retmax=10&retmode=json&datetype=pdat&mindate=2014&maxdate=2024`;
    const res = await fetch(url);
    const data = await res.json();
    return { count: parseInt(data.esearchresult?.count||'0'), ids: data.esearchresult?.idlist||[] };
  } catch { return { count:0, ids:[] }; }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, pas, concs } = await req.json();
    if (!pas || pas.length < 2) return NextResponse.json({ error: 'Se requieren al menos 2 principios activos' }, { status: 400 });

    const enWHO = verificarWHO_EML(pas);
    const { irracional: esIrracional, razon: razonIrracional } = verificarIrracional(pas);
    const pubmed = await consultarPubMed(pas);

    const evidencia: EvidenciaCientifica = {
      pubmedCount: pubmed.count,
      cochrane: pubmed.count >= 3,
      nivelEvidencia: enWHO ? 'Ia' : pubmed.count>=5 ? 'Ib' : pubmed.count>=2 ? 'IIa' : pubmed.count>=1 ? 'IIb' : 'IV',
      aprobadaEMA: enWHO,
      aprobadaFDA: enWHO,
      enWHO_EML: enWHO,
      fuentes: [
        `PubMed: ${pubmed.count} RCTs/meta-análisis (2014–2024)`,
        enWHO ? 'WHO EML v23 2023: INCLUIDA ✓' : 'WHO EML: NO incluida',
        pubmed.ids.length ? `PubMed IDs: ${pubmed.ids.slice(0,5).join(', ')}` : 'Sin IDs PubMed encontrados',
      ],
    };

    const criterios: CriterioScore[] = [
      { id:'C1', nombre:'Contribución terapéutica individual',
        score: esIrracional?0:enWHO?2:pubmed.count>0?1:0,
        justificacion: esIrracional?`Sin contribución demostrada. ${razonIrracional}`:enWHO?'Validada por WHO EML.':pubmed.count>0?'Evidencia parcial disponible.':'Sin evidencia publicada.',
        fuente:'WHO EML · PubMed' },
      { id:'C2', nombre:'Mecanismos de acción complementarios',
        score: enWHO?2:pas.length===2?1:0,
        justificacion: enWHO?'Complementariedad validada internacionalmente.':'Requiere análisis farmacológico manual de mecanismos.',
        fuente:'Revisión farmacológica' },
      { id:'C3', nombre:'Farmacocinética compatible',
        score: enWHO?2:pubmed.count>=2?1:0,
        justificacion: enWHO?'Compatibilidad FC validada por uso clínico global.':'Comparar t½, absorción y eliminación. Ver DrugBank.',
        fuente:'DrugBank · FDA labels' },
      { id:'C4', nombre:'Toxicidad no supraditiva',
        score: esIrracional?0:enWHO?2:pubmed.count>=1?1:0,
        justificacion: esIrracional?`VETO: ${razonIrracional}`:enWHO?'Perfil seguridad validado.':'Requiere revisión farmacovigilancia.',
        fuente:'EMA EPAR · WHO pharmacovigilance' },
      { id:'C5', nombre:'Balance beneficio/riesgo positivo',
        score: enWHO?2:pubmed.count>=3?2:pubmed.count>=1?1:0,
        justificacion: enWHO?'B/R positivo — incluida en medicamentos esenciales OMS.':`${pubmed.count} estudios. ${pubmed.count>=3?'Evidencia suficiente.':'Evidencia limitada.'}`,
        fuente:`PubMed (${pubmed.count} resultados)` },
      { id:'C6', nombre:'Dosis fija justificada',
        score: enWHO?2:concs?.length===pas.length&&concs.every((c:string)=>c)?1:0,
        justificacion: enWHO?'Ratio de dosis validada internacionalmente.':concs?.length===pas.length?`Dosis declaradas: ${pas.map((p:string,i:number)=>`${p} ${concs[i]||'?'}`).join(' + ')}.`:'Concentraciones no completamente declaradas.',
        fuente:'Expediente · Literatura clínica' },
      { id:'C7', nombre:'Evidencia clínica publicada',
        score: pubmed.count>=5?2:pubmed.count>=1?1:0,
        justificacion:`${pubmed.count} RCTs/meta-análisis en PubMed (2014–2024). ${pubmed.count>=5?'Evidencia sólida.':pubmed.count>=1?'Evidencia limitada.':'Sin evidencia indexada.'}`,
        fuente:`PubMed · IDs: ${pubmed.ids.slice(0,3).join(', ')||'ninguno'}` },
      { id:'C8', nombre:'Aprobada en países de referencia',
        score: enWHO?2:pubmed.count>=2?1:0,
        justificacion: enWHO?'En WHO EML — aprobada en múltiples países referencia.':'Verificar manualmente: EPAR, Drugs@FDA, Health Canada, MHRA.',
        fuente:'WHO EML · EPAR · Drugs@FDA' },
    ];

    const scoreTotal = criterios.reduce((s,c) => s+c.score, 0);
    const vetoAutomatico = criterios.some(c => (c.id==='C1'||c.id==='C4') && c.score===0);
    const veredicto = calcularVeredicto(scoreTotal, vetoAutomatico, evidencia);

    return NextResponse.json({
      nombre: nombre || pas.join(' + '),
      principiosActivos: pas,
      concentraciones: concs||[],
      scoreTotal, scoreMaximo:16,
      porcentaje: Math.round((scoreTotal/16)*100),
      vetoAutomatico, veredicto, criterios, evidencia,
      recomendacion: generarRecomendacion(veredicto, criterios, evidencia),
      evaluadoPor: 'algoritmo_v1',
      fechaEvaluacion: new Date().toISOString(),
      sandbox: true,
    });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
