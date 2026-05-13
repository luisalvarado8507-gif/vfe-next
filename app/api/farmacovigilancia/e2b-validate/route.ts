import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try { await adminAuth.verifyIdToken(token); } catch { return NextResponse.json({ error: 'Token inválido' }, { status: 401 }); }

  const { xml } = await req.json();
  if (!xml) return NextResponse.json({ valid: false, errors: ['XML vacío'] });

  const errors: string[] = [];
  const warnings: string[] = [];

  // Validaciones E2B(R3) básicas
  if (!xml.includes('messageformatversion>3.0')) errors.push('No es formato E2B(R3) — messageformatversion debe ser 3.0');
  if (!xml.includes('<safetyreportid>')) errors.push('Falta safetyreportid obligatorio');
  if (!xml.includes('<primarysourcecountry>')) errors.push('Falta primarysourcecountry obligatorio');
  if (!xml.includes('<reporttype>')) errors.push('Falta reporttype obligatorio');
  if (!xml.includes('<serious>')) errors.push('Falta campo serious obligatorio');
  if (!xml.includes('<drug>')) errors.push('Falta al menos un elemento drug');
  if (!xml.includes('<reaction>')) errors.push('Falta al menos un elemento reaction');
  if (!xml.includes('meddraversionllt') && !xml.includes('meddraversion')) warnings.push('Versión MedDRA no especificada');
  if (!xml.includes('<narrativeincludeclinical>') && !xml.includes('<sendercomment>')) warnings.push('Sin narrativa clínica (recomendado en R3)');
  if (!xml.includes('WHO-VIGIBASE') && !xml.includes('CNFV')) warnings.push('Receptor no identificado como VigiBase o CNFV-ARCSA');

  return NextResponse.json({
    valid: errors.length === 0,
    errors,
    warnings,
    standard: 'ICH E2B(R3) — ISO/HL7 PHMR R2',
    vigibaseCompatible: errors.length === 0,
    cnfvCompatible: errors.length === 0,
  });
}
