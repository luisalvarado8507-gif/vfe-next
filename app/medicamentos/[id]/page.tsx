// Server Component — carga datos en servidor (SSR/ISR)
// La ficha del medicamento es indexable y accesible sin JavaScript
import { adminDb } from '@/lib/firebase-admin';
import MedicamentoDetalle from './MedicamentoDetalle';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

// ISR — revalidar cada 24 horas o ante cambio regulatorio
export const revalidate = 86400;

// Pre-generar las fichas más consultadas (top 100 por estado autorizado)
export async function generateStaticParams() {
  try {
    const snap = await adminDb.collection('medicamentos')
      .where('estado', '==', 'autorizado')
      .limit(100)
      .get();
    return snap.docs.map(doc => ({ id: doc.id }));
  } catch {
    return [];
  }
}

// Metadata dinámica para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const doc = await adminDb.collection('medicamentos').doc(id).get();
    if (!doc.exists) return { title: 'Medicamento no encontrado — SIMI' };
    const d = doc.data()!;
    const data = d.data || {};
    const nombre = data.nombre || data.amp || data.vtm || 'Medicamento';
    const vtm = data.vtm || '';
    const atc = data.atc || '';
    const lab = data.laboratorio || '';
    return {
      title: `${nombre} — ${vtm} · SIMI Ecuador`,
      description: `Ficha técnica de ${nombre} (${vtm})${atc ? ` · ATC: ${atc}` : ''}${lab ? ` · ${lab}` : ''}. Registro sanitario ARCSA. Base de datos farmacéutica nacional de Ecuador.`,
      openGraph: {
        title: `${nombre} — SIMI Ecuador`,
        description: `${vtm} · ${atc} · ${lab}`,
        type: 'article',
      },
      other: {
        'fhir:resourceType': 'Medication',
        'fhir:id': id,
        'atc:code': atc,
        'drug:inn': vtm,
        'drug:rs': data.rs || '',
        'drug:cum': data.cum || '',
      },
    };
  } catch {
    return { title: 'Medicamento — SIMI Ecuador' };
  }
}

// Cargar datos en el servidor
async function getMedicamento(id: string) {
  try {
    const doc = await adminDb.collection('medicamentos').doc(id).get();
    if (!doc.exists) return null;
    const d = doc.data()!;
    return {
      docId: doc.id,
      ...d.data,
      estado: d.estado || 'arcsa_pendiente',
      version: d.version || 1,
      updatedAt: d.updatedAt?.toDate?.()?.toISOString() || '',
      updatedBy: d.updatedBy || '',
      createdAt: d.createdAt?.toDate?.()?.toISOString() || '',
    };
  } catch {
    return null;
  }
}

export default async function MedicamentoPage({ params }: Props) {
  const { id } = await params;
  const med = await getMedicamento(id);
  
  // JSON-LD estructurado para SEO farmacéutico
  const jsonLd = med ? {
    '@context': 'https://schema.org',
    '@type': 'Drug',
    name: med.nombre || med.amp || med.vtm,
    activeIngredient: med.vtm,
    administrationRoute: med.vias || med.via,
    dosageForm: med.ff,
    manufacturer: {
      '@type': 'Organization',
      name: med.laboratorio,
    },
    identifier: [
      med.rs && { '@type': 'PropertyValue', name: 'Registro Sanitario ARCSA', value: med.rs },
      med.cum && { '@type': 'PropertyValue', name: 'CUM', value: med.cum },
      med.atc && { '@type': 'PropertyValue', name: 'ATC-WHO', value: med.atc },
    ].filter(Boolean),
    legalStatus: med.rsCondicion || '',
    nonProprietaryName: med.vtm,
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <MedicamentoDetalle id={id} initialData={med} />
    </>
  );
}
