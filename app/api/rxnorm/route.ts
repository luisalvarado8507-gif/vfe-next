import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const inn = searchParams.get('inn');
  if (!inn) return NextResponse.json({ error: 'inn requerido' }, { status: 400 });

  try {
    const term = inn.split(' + ')[0].trim();
    // Buscar RxCUI exacto
    const res = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(term)}&search=2`,
      { headers: { Accept: 'application/json' } }
    );
    const data = await res.json();
    
    if (data.idGroup?.rxnormId?.length > 0) {
      const rxcui = data.idGroup.rxnormId[0];
      const detailRes = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`);
      const detail = await detailRes.json();
      return NextResponse.json({
        found: true,
        rxcui,
        name: detail.properties?.name || term,
        tty: detail.properties?.tty || 'IN',
        url: `https://www.rxnav.nlm.nih.gov/RxNav.html?search=${rxcui}`,
      });
    }
    return NextResponse.json({ found: false, term });
  } catch(e) {
    return NextResponse.json({ error: String(e), found: false }, { status: 500 });
  }
}
