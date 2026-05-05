import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const snap = await adminDb
      .collection('medicamentos').doc(params.id)
      .collection('versiones')
      .orderBy('savedAt', 'desc')
      .limit(50)
      .get();
    const versiones = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      savedAt: doc.data().savedAt?.toDate?.()?.toISOString() || '',
    }));
    return NextResponse.json({ versiones, total: versiones.length });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
