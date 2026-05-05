import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { toFHIRMedication, toFHIRBundle } from '@/lib/fhir/mappers';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'security', diagnostics: 'Unauthorized' }] }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const status = searchParams.get('status');
  const ingredient = searchParams.get('ingredient');
  const count = parseInt(searchParams.get('_count') || '20');
  const baseUrl = req.url.split('?')[0];

  try {
    let query = adminDb.collection('medicamentos').limit(Math.min(count, 100));
    if (status) {
      const estadoMap: Record<string, string> = { active: 'autorizado', inactive: 'arcsa_pendiente' };
      query = query.where('estado', '==', estadoMap[status] || status) as any;
    } else {
      query = query.where('estado', '!=', 'eliminado') as any;
    }
    const snap = await query.get();
    let meds = snap.docs.map(d => ({ docId: d.id, ...d.data().data, estado: d.data().estado, version: d.data().version }));

    if (code) meds = meds.filter((m: any) => (m.atc || '').toLowerCase().includes(code.toLowerCase()));
    if (ingredient) meds = meds.filter((m: any) => (m.vtm || '').toLowerCase().includes(ingredient.toLowerCase()));

    const resources = meds.map((m: any) => toFHIRMedication(m, baseUrl));
    const bundle = toFHIRBundle(resources, 'searchset', resources.length, baseUrl);

    return NextResponse.json(bundle, {
      headers: { 'Content-Type': 'application/fhir+json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch(e) {
    return NextResponse.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', diagnostics: String(e) }] }, { status: 500 });
  }
}
