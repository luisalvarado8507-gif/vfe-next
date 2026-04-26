import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const snap = await adminDb.collection('auditLog')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const entries = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ entries });
  } catch(e) {
    console.error('Error audit log:', e);
    return NextResponse.json({ error: 'Error al cargar' }, { status: 500 });
  }
}
