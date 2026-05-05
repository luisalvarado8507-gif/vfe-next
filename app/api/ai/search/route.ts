import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function POST(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    // Rate limiting IA — máximo 10 req/min
    const rl = checkRateLimit(`ai:${user.uid}`, RATE_LIMITS.ai);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit: máximo 10 búsquedas IA por minuto.' }, { status: 429 });
    }

    const { query } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: 'query requerido' }, { status: 400 });

    // Llamar a Claude para interpretar la consulta clínica
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: `Eres un experto en farmacología clínica. El usuario buscará medicamentos con lenguaje natural clínico.
Tu tarea es extraer términos de búsqueda farmacológica precisos en español.
Responde SOLO con JSON sin markdown, con este formato exacto:
{
  "terms": ["termino1", "termino2"],
  "atcCodes": ["A02BC", "C09"],
  "intent": "descripcion breve del intent",
  "isIndicacion": true/false
}`,
        messages: [{
          role: 'user',
          content: `Consulta del usuario: "${query}"
Extrae términos farmacológicos para buscar en una base de datos de medicamentos del Ecuador.`
        }]
      })
    });

    const claudeData = await claudeRes.json();
    const text = claudeData.content?.[0]?.text || '{}';
    let parsed: { terms?: string[]; atcCodes?: string[]; intent?: string; isIndicacion?: boolean } = {};
    try { parsed = JSON.parse(text.replace(/```json|\x60\x60\x60/g, '').trim()); } catch {}

    const terms = parsed.terms || [query];
    const atcCodes = parsed.atcCodes || [];

    // Buscar en la base de datos
    const snap = await adminDb.collection('medicamentos')
      .where('estado', '==', 'autorizado')
      .limit(500).get();

    const allMeds = snap.docs.map(doc => ({
      docId: doc.id,
      vtm: doc.data().data?.vtm || '',
      nombre: doc.data().data?.nombre || doc.data().data?.amp || '',
      conc: doc.data().data?.conc || '',
      ff: doc.data().data?.ff || '',
      laboratorio: doc.data().data?.laboratorio || '',
      atc: doc.data().data?.atc || '',
      atclbl: doc.data().data?.atclbl || '',
      chapId: doc.data().data?.chapId || '',
      estado: doc.data().estado || '',
      generico: doc.data().data?.generico || '',
    }));

    // Scoring por relevancia
    const scored = allMeds.map(med => {
      let score = 0;
      const searchable = `${med.vtm} ${med.nombre} ${med.atc} ${med.atclbl} ${med.ff}`.toLowerCase();

      // Match por términos de Claude
      terms.forEach(term => {
        const t = term.toLowerCase();
        if (med.vtm.toLowerCase().includes(t)) score += 10;
        if (med.nombre.toLowerCase().includes(t)) score += 8;
        if (med.atclbl?.toLowerCase().includes(t)) score += 6;
        if (med.atc?.toLowerCase().startsWith(t)) score += 5;
        if (searchable.includes(t)) score += 3;
      });

      // Match por códigos ATC
      atcCodes.forEach(code => {
        if (med.atc?.toUpperCase().startsWith(code.toUpperCase())) score += 15;
      });

      return { ...med, score };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

    return NextResponse.json({
      query,
      intent: parsed.intent || query,
      terms,
      atcCodes,
      results: scored,
      total: scored.length,
      powered_by: 'Claude claude-sonnet-4-20250514 + SIMI Database',
    });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
