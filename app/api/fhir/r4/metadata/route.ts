import { NextResponse } from 'next/server';

export async function GET() {
  const capability = {
    resourceType: 'CapabilityStatement',
    status: 'active',
    date: new Date().toISOString(),
    kind: 'instance',
    fhirVersion: '4.0.1',
    format: ['json'],
    name: 'SIMICapabilityStatement',
    title: 'SIMI FHIR R4 Capability Statement',
    description: 'Sistema Integral de Medicamentos Interoperables — Ecuador. API FHIR R4.',
    publisher: 'SIMI Ecuador',
    software: { name: 'SIMI', version: '1.0.0' },
    implementation: {
      description: 'SIMI — Sistema Integral de Medicamentos Interoperables',
      url: 'https://vfe-next.vercel.app/api/fhir/r4',
    },
    rest: [{
      mode: 'server',
      security: {
        cors: true,
        description: 'Firebase JWT Bearer token required',
      },
      resource: [
        {
          type: 'Medication',
          profile: 'http://hl7.org/fhir/StructureDefinition/Medication',
          interaction: [
            { code: 'read' },
            { code: 'search-type' },
          ],
          searchParam: [
            { name: 'code', type: 'token', documentation: 'Código ATC o SNOMED CT' },
            { name: 'ingredient', type: 'reference', documentation: 'Principio activo (VTM/INN)' },
            { name: 'status', type: 'token', documentation: 'Estado regulatorio' },
            { name: '_count', type: 'number', documentation: 'Número de resultados por página' },
          ],
        },
        {
          type: 'Substance',
          profile: 'http://hl7.org/fhir/StructureDefinition/Substance',
          interaction: [{ code: 'read' }, { code: 'search-type' }],
        },
        {
          type: 'Organization',
          profile: 'http://hl7.org/fhir/StructureDefinition/Organization',
          interaction: [{ code: 'read' }, { code: 'search-type' }],
        },
      ],
    }],
  };
  return NextResponse.json(capability, {
    headers: {
      'Content-Type': 'application/fhir+json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
