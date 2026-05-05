import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { searchEMASPOR, searchGSRS } from '@/lib/spor/ema-api';
import { sporCache, gsrsCache } from '@/lib/cache';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  // No requiere auth para lookup público de terminologías
  const { searchParams } = new URL(req.url);
  const inn = searchParams.get('inn') || '';
  const source = searchParams.get('source') || 'ema';

  if (!inn) return NextResponse.json({ error: 'inn requerido' }, { status: 400 });

  try {
    if (source === 'gsrs') {
      const cacheKey = `gsrs:${inn.toLowerCase()}`;
      const cached = gsrsCache.get(cacheKey);
      if (cached) return NextResponse.json({ ...cached, fromCache: true });
      const results = await searchGSRS(inn);
      const r = { results, source: 'FDA-GSRS', inn };
      gsrsCache.set(cacheKey, r);
      return NextResponse.json(r);
    }
    const cacheKey = `spor:${inn.toLowerCase()}`;
    const cached = sporCache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, fromCache: true });
    const results = await searchEMASPOR(inn);
    const r = { results, source: 'EMA-SPOR', inn };
    sporCache.set(cacheKey, r);
    return NextResponse.json(r);
  } catch(e) {
    return NextResponse.json({ error: String(e), results: [] }, { status: 500 });
  }
}
