import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { snomedCache } from '@/lib/cache';
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
    const cacheKey = `snomed:${type}:${conceptId || q}`;
    const cached = snomedCache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, fromCache: true });

    if (type === 'validate' && conceptId) {
      const result = await validateSNOMED(conceptId);
      snomedCache.set(cacheKey, result);
      return NextResponse.json(result);
    }
    if (type === 'doseform') {
      const results = await searchDoseForm(q);
      const r = { results, total: results.length };
      snomedCache.set(cacheKey, r);
      return NextResponse.json(r);
    }
    const results = await searchSubstance(q);
    const r = { results, total: results.length, system: 'SNOMED-International' };
    snomedCache.set(cacheKey, r);
    return NextResponse.json(r);
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
