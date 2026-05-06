import { NextResponse } from 'next/server';

export async function GET() {
  const capability = {
    resourceType: 'CapabilityStatement',
    id: 'simi-ecuador-capability',
    url: 'https://vfe-next.vercel.app/api/fhir/r4/metadata',
    version: '1.0.0',
    name: 'SIMICapabilityStatement',
    title: 'SIMI FHIR R4 Capability Statement — Ecuador',
    status: 'active',
    experimental: false,
    date: '2026-05-01',
    publisher: 'SIMI — Sistema Integral de Medicamentos Interoperables',
    contact: [{
      name: 'SIMI Ecuador',
      telecom: [{ system: 'url', value: 'https://vfe-next.vercel.app' }],
    }],
    description: 'CapabilityStatement del servidor FHIR R4 de SIMI — Sistema Integral de Medicamentos Interoperables de Ecuador. Repositorio farmacéutico nacional con codificación ATC-WHO, SNOMED CT e ISO IDMP.',
    jurisdiction: [{
      coding: [{ system: 'urn:iso:std:iso:3166', code: 'EC', display: 'Ecuador' }],
    }],
    kind: 'instance',
    instantiates: [
      'http://hl7.org/fhir/CapabilityStatement/base',
    ],
    implementationGuide: [
      'http://hl7.org/fhir/uv/pharm-quality/ImplementationGuide/hl7.fhir.uv.pharm-quality',
    ],
    software: {
      name: 'SIMI',
      version: '2.0.0',
      releaseDate: '2026-05-01',
    },
    implementation: {
      description: 'SIMI — Sistema Integral de Medicamentos Interoperables · Ecuador',
      url: 'https://vfe-next.vercel.app/api/fhir/r4',
    },
    fhirVersion: '4.0.1',
    format: ['json', 'application/fhir+json'],
    patchFormat: ['application/json-patch+json'],
    rest: [{
      mode: 'server',
      documentation: 'Servidor FHIR R4 del repositorio farmacéutico nacional de Ecuador. Autenticación: Firebase JWT Bearer token. Endpoints públicos: metadata, Medication (búsqueda), Substance (búsqueda), Organization (búsqueda).',
      security: {
        cors: true,
        service: [{
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/restful-security-service', code: 'SMART-on-FHIR' }],
        }],
        description: 'Firebase JWT Bearer token requerido para endpoints autenticados. /metadata es público.',
      },
      resource: [
        {
          type: 'Medication',
          profile: 'http://hl7.org/fhir/StructureDefinition/Medication',
          documentation: 'Recurso Medication mapeado desde el modelo SIMI. Incluye codificación ATC-WHO, SNOMED CT, identificadores ARCSA (RS, CUM) y modelo SPOR.',
          interaction: [
            { code: 'read', documentation: 'Lectura por ID Firestore' },
            { code: 'search-type', documentation: 'Búsqueda por código ATC, estado, ingrediente' },
          ],
          versioning: 'versioned',
          readHistory: true,
          searchParam: [
            { name: 'code', type: 'token', documentation: 'Código ATC-WHO (ej: C09DB07) o SNOMED CT' },
            { name: 'ingredient', type: 'reference', documentation: 'Principio activo por INN/DCI' },
            { name: 'status', type: 'token', documentation: 'Estado regulatorio: active | inactive' },
            { name: '_count', type: 'number', documentation: 'Número de resultados por página (máx 100)' },
          ],
          extension: [{
            url: 'http://hl7.org/fhir/StructureDefinition/capabilitystatement-expectation',
            valueCode: 'SHALL',
          }],
        },
        {
          type: 'Substance',
          profile: 'http://hl7.org/fhir/StructureDefinition/Substance',
          documentation: 'Principios activos (VTM/INN). Codificados con SNOMED CT cuando disponible.',
          interaction: [
            { code: 'read' },
            { code: 'search-type' },
          ],
          searchParam: [
            { name: 'code', type: 'token', documentation: 'SNOMED CT o nombre INN/DCI' },
            { name: '_text', type: 'string', documentation: 'Búsqueda por texto en nombre INN' },
          ],
        },
        {
          type: 'Organization',
          profile: 'http://hl7.org/fhir/StructureDefinition/Organization',
          documentation: 'Laboratorios, fabricantes y titulares de registro sanitario en Ecuador.',
          interaction: [
            { code: 'read' },
            { code: 'search-type' },
          ],
          searchParam: [
            { name: 'name', type: 'string', documentation: 'Nombre del laboratorio o titular' },
          ],
        },
      ],
    }],
    document: [{
      mode: 'producer',
      documentation: 'SIMI puede generar documentos FHIR Bundle con listados de medicamentos para importación/exportación',
      profile: 'http://hl7.org/fhir/StructureDefinition/Bundle',
    }],
  };

  return NextResponse.json(capability, {
    headers: {
      'Content-Type': 'application/fhir+json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
      'X-FHIR-Version': '4.0.1',
    },
  });
}
