import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { flatToSPOR } from '@/lib/spor/types';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const entity = searchParams.get('entity') || 'product'; // substance | product | organisation

  try {
    if (id) {
      const doc = await adminDb.collection('medicamentos').doc(id).get();
      if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const d = doc.data()!;
      const med = { docId: doc.id, ...d.data, estado: d.estado, version: d.version };
      const spor = flatToSPOR(med);
      return NextResponse.json({
        substance: spor.substance,
        product: spor.product,
        organisation: spor.organisation,
        meta: { model: 'EMA SPOR', standard: 'ISO IDMP 11615/11238', version: '1.0' },
      });
    }

    // List — sample of 20 records
    const snap = await adminDb.collection('medicamentos')
      .where('estado', '==', 'autorizado').limit(20).get();

    const results = snap.docs.map(doc => {
      const d = doc.data();
      const med = { docId: doc.id, ...d.data, estado: d.estado, version: d.version };
      const spor = flatToSPOR(med);
      return entity === 'substance' ? spor.substance
           : entity === 'organisation' ? spor.organisation
           : spor.product;
    });

    return NextResponse.json({
      entity,
      total: results.length,
      data: results,
      meta: { model: 'EMA SPOR', standard: 'ISO IDMP 11615/11238', version: '1.0' },
    });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
