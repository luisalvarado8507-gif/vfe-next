import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.admin) return NextResponse.json({ error: 'Solo admin' }, { status: 403 });
  } catch { return NextResponse.json({ error: 'Token inválido' }, { status: 401 }); }

  const stats = { total: 0, sinATC: 0, sinFF: 0, sinVia: 0, sinConc: 0, sinRS: 0, sinLab: 0, sinVTM: 0, sinCUM: 0, atcIncompleto: 0 };
  let lastDoc: any = null;
  while (true) {
    let q: any = adminDb.collection('medicamentos').where('estado', '==', 'arcsa_pendiente').limit(500);
    if (lastDoc) q = q.startAfter(lastDoc);
    const snap = await q.get();
    if (snap.empty) break;
    for (const doc of snap.docs) {
      const d = doc.data()?.data || {};
      stats.total++;
      if (!d.atc) stats.sinATC++;
      else if (d.atc.length < 7) stats.atcIncompleto++;
      if (!d.ff) stats.sinFF++;
      if (!d.vias && !d.via) stats.sinVia++;
      if (!d.conc) stats.sinConc++;
      if (!d.rs) stats.sinRS++;
      if (!d.laboratorio) stats.sinLab++;
      if (!d.vtm) stats.sinVTM++;
      if (!d.cum) stats.sinCUM++;
    }
    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.docs.length < 500) break;
  }
  return NextResponse.json(stats);
}
