import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { toFHIROrganization, toFHIRBundle } from '@/lib/fhir/mappers';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', diagnostics: 'Unauthorized' }] }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('name') || '';
  const baseUrl = req.url.split('?')[0];
  try {
    const snap = await adminDb.collection('medicamentos').limit(500).get();
    const labs = new Set<string>();
    snap.docs.forEach(d => { if (d.data().data?.laboratorio) labs.add(d.data().data.laboratorio); });
    let list = Array.from(labs);
    if (q) list = list.filter(l => l.toLowerCase().includes(q.toLowerCase()));
    const resources = list.slice(0, 50).map(l => toFHIROrganization(l));
    return NextResponse.json(toFHIRBundle(resources, 'searchset', resources.length, baseUrl), {
      headers: { 'Content-Type': 'application/fhir+json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch(e) {
    return NextResponse.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', diagnostics: String(e) }] }, { status: 500 });
  }
}
