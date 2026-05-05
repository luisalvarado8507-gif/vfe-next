import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { checkRateLimit, getClientId, RATE_LIMITS } from '@/lib/rate-limit';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const capitulo = searchParams.get('capitulo') || '';
  const subcapitulo = searchParams.get('subcapitulo') || '';
  const atc = searchParams.get('atc') || '';

  // Rate limiting IA
  const clientId = getClientId(req);
  const rl = checkRateLimit(`alertas:${clientId}`, RATE_LIMITS.ai);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit: máximo 10 alertas IA por minuto.', alertas: [] }, { status: 429 });
  }

  if (!capitulo) return NextResponse.json({ error: 'capitulo requerido' }, { status: 400 });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: `Eres un farmacéutico clínico experto en el contexto de Ecuador y Latinoamérica.
Genera alertas terapéuticas concisas y clínicamente relevantes para un grupo farmacológico.
Responde SOLO con JSON válido sin markdown:
{
  "alertas": [
    {
      "tipo": "interaccion|contraindicacion|precaucion|monitoreo|embarazo|pediatrico",
      "severidad": "alta|media|baja",
      "titulo": "título corto",
      "descripcion": "descripción clínica concisa (máximo 100 caracteres)"
    }
  ],
  "mecanismo": "mecanismo de acción del grupo en 1-2 oraciones",
  "indicaciones": ["indicación 1", "indicación 2", "indicación 3"]
}`,
        messages: [{
          role: 'user',
          content: `Grupo farmacológico: "${capitulo}"${subcapitulo ? ` - "${subcapitulo}"` : ''}${atc ? ` (ATC: ${atc})` : ''}
Genera 4-6 alertas terapéuticas clínicamente relevantes para prescriptores y farmacéuticos en Ecuador.`
        }]
      })
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || '{}';
    let parsed: { alertas?: any[]; mecanismo?: string; indicaciones?: string[] } = {};
    try { parsed = JSON.parse(text.replace(/```json|```/g, '').trim()); } catch {}

    return NextResponse.json({
      capitulo, subcapitulo, atc,
      alertas: parsed.alertas || [],
      mecanismo: parsed.mecanismo || '',
      indicaciones: parsed.indicaciones || [],
      powered_by: 'Claude claude-sonnet-4-20250514',
    });
  } catch(e) {
    return NextResponse.json({ error: String(e), alertas: [] }, { status: 500 });
  }
}
