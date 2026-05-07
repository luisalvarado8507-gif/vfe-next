import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const ref = await adminDb.collection('farmacovigilancia_reportes').add({
      ...data,
      creadoEn: new Date().toISOString(),
      estado: 'pendiente_envio',
    });
    return NextResponse.json({ id: ref.id, ok: true });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const snap = await adminDb.collection('farmacovigilancia_reportes')
      .orderBy('creadoEn', 'desc').limit(50).get();
    const reportes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json(reportes);
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
