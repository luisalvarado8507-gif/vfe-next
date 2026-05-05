import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { toFHIRSubstance, toFHIRBundle, toOperationOutcome } from '@/lib/fhir/mappers';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json(toOperationOutcome('Unauthorized'), { status: 401 });
  try {
    const { id } = await context.params;
    const vtm = decodeURIComponent(id);
    const resource = toFHIRSubstance(vtm);
    return NextResponse.json(resource, {
      headers: { 'Content-Type': 'application/fhir+json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch(e) {
    return NextResponse.json(toOperationOutcome(String(e)), { status: 500 });
  }
}
