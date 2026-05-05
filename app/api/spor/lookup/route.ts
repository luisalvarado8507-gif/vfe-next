import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { searchEMASPOR, searchGSRS } from '@/lib/spor/ema-api';

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
      const results = await searchGSRS(inn);
      return NextResponse.json({ results, source: 'FDA-GSRS', inn });
    }
    const results = await searchEMASPOR(inn);
    return NextResponse.json({ results, source: 'EMA-SPOR', inn });
  } catch(e) {
    return NextResponse.json({ error: String(e), results: [] }, { status: 500 });
  }
}
