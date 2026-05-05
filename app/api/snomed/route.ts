import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { searchSubstance, searchDoseForm, validateSNOMED } from '@/lib/snomed/international';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'substance'; // substance | doseform | validate
  const conceptId = searchParams.get('conceptId');

  try {
    if (type === 'validate' && conceptId) {
      const result = await validateSNOMED(conceptId);
      return NextResponse.json(result);
    }
    if (type === 'doseform') {
      const results = await searchDoseForm(q);
      return NextResponse.json({ results, total: results.length });
    }
    const results = await searchSubstance(q);
    return NextResponse.json({ results, total: results.length, system: 'SNOMED-International' });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
