import { NextRequest, NextResponse } from 'next/server';
import { validarRS } from '@/lib/rs-validator';
import { adminDb } from '@/lib/firebase-admin';

// Endpoint público para verificar RS ARCSA
// GET /api/arcsa/rs?q=00012-1-MAN-03-05
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  if (!q) return NextResponse.json({ error: 'Parámetro q requerido' }, { status: 400 });

  // Validar formato
  const validation = validarRS(q);

  // Buscar en Firestore si existe
  let existeEnSIMI = false;
  let medId = '';
  try {
    const snap = await adminDb.collection('medicamentos')
      .where('data.rs', '==', validation.normalized)
      .limit(1)
      .get();
    existeEnSIMI = !snap.empty;
    medId = snap.docs[0]?.id || '';
  } catch {}

  return NextResponse.json({
    rs: q,
    normalized: validation.normalized,
    valid: validation.valid,
    format: validation.format,
    mensaje: validation.mensaje,
    existeEnSIMI,
    medId: existeEnSIMI ? medId : undefined,
    fhirUrl: existeEnSIMI ? `/api/fhir/r4/Medication/${medId}` : undefined,
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
