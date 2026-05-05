// SIMI → FHIR R4 Resource Mappers
// Basado en HL7 FHIR R4 specification (https://hl7.org/fhir/R4/)

export function toFHIRMedication(med: Record<string, any>, baseUrl: string) {
  const resource: Record<string, any> = {
    resourceType: 'Medication',
    id: med.docId || med.id,
    meta: {
      versionId: String(med.version || 1),
      lastUpdated: med.updatedAt || new Date().toISOString(),
      profile: ['http://hl7.org/fhir/StructureDefinition/Medication'],
    },
    text: {
      status: 'generated',
      div: `<div xmlns="http://www.w3.org/1999/xhtml">${med.amp || med.nombre || med.vtm}</div>`,
    },
    identifier: [
      { system: 'https://simi.ec/medicamentos', value: med.docId || med.id },
    ],
    code: {
      coding: [
        ...(med.atc ? [{
          system: 'http://www.whocc.no/atc',
          code: med.atc,
          display: med.atclbl || med.atc,
        }] : []),
        ...(med.snomed_vtm_code ? [{
          system: 'http://snomed.info/sct',
          code: med.snomed_vtm_code,
          display: med.vtm,
        }] : []),
      ],
      text: med.amp || med.nombre || med.vtm,
    },
    status: mapEstadoToFHIR(med.estado),
    manufacturer: med.laboratorio ? {
      reference: `Organization/${encodeURIComponent(med.laboratorio)}`,
      display: med.laboratorio,
    } : undefined,
    form: med.ff ? {
      coding: [
        ...(med.snomed_ff_code ? [{
          system: 'http://snomed.info/sct',
          code: med.snomed_ff_code,
          display: med.ff,
        }] : []),
        {
          system: 'https://standardterms.edqm.eu',
          display: med.ff,
        },
      ],
      text: med.ff,
    } : undefined,
    ingredient: buildIngredients(med),
    extension: [
      { url: 'https://simi.ec/fhir/StructureDefinition/registro-sanitario', valueString: med.rs || '' },
      { url: 'https://simi.ec/fhir/StructureDefinition/cum', valueString: med.cum || '' },
      { url: 'https://simi.ec/fhir/StructureDefinition/cnmb', valueBoolean: med.cnmb === 'Sí' },
      { url: 'https://simi.ec/fhir/StructureDefinition/capitulo', valueString: med.chapId || '' },
      { url: 'https://simi.ec/fhir/StructureDefinition/precio-pvp', valueDecimal: med.pp ? parseFloat(med.pp) : undefined },
    ].filter(e => e.valueString !== undefined || e.valueBoolean !== undefined || e.valueDecimal !== undefined),
  };
  // Remove undefined fields
  return JSON.parse(JSON.stringify(resource));
}

function mapEstadoToFHIR(estado: string): string {
  const map: Record<string, string> = {
    autorizado: 'active',
    suspendido: 'inactive',
    revocado: 'entered-in-error',
    retirado: 'inactive',
    arcsa_pendiente: 'inactive',
    en_evaluacion: 'inactive',
    borrador: 'inactive',
    variacion: 'active',
  };
  return map[estado] || 'inactive';
}

function buildIngredients(med: Record<string, any>) {
  if (med.esCombo && med.comboData?.pas?.length) {
    return med.comboData.pas.map((pa: string, i: number) => ({
      itemCodeableConcept: {
        coding: [{ system: 'https://simi.ec/sustancias', display: pa }],
        text: pa,
      },
      isActive: true,
      strength: med.comboData.concs?.[i] ? {
        numerator: { value: parseFloat(med.comboData.concs[i]) || 0, unit: med.comboData.units?.[i] || 'mg' },
        denominator: { value: 1, unit: 'unit' },
      } : undefined,
    }));
  }
  if (med.vtm) {
    return [{
      itemCodeableConcept: {
        coding: [
          ...(med.snomed_vtm_code ? [{ system: 'http://snomed.info/sct', code: med.snomed_vtm_code, display: med.vtm }] : []),
          { system: 'https://simi.ec/sustancias', display: med.vtm },
        ],
        text: med.vtm,
      },
      isActive: true,
      strength: med.conc ? {
        numerator: { value: parseFloat(med.conc) || 0, unit: med.conc.replace(/[0-9.,s]/g, '').trim() || 'mg' },
        denominator: { value: 1, unit: 'unit' },
      } : undefined,
    }];
  }
  return [];
}

export function toFHIRSubstance(vtm: string, code?: string) {
  return {
    resourceType: 'Substance',
    id: encodeURIComponent(vtm),
    meta: { profile: ['http://hl7.org/fhir/StructureDefinition/Substance'] },
    identifier: [{ system: 'https://simi.ec/sustancias', value: vtm }],
    status: 'active',
    code: {
      coding: [
        ...(code ? [{ system: 'http://snomed.info/sct', code, display: vtm }] : []),
        { system: 'https://simi.ec/sustancias', display: vtm },
      ],
      text: vtm,
    },
    description: vtm,
  };
}

export function toFHIROrganization(laboratorio: string) {
  return {
    resourceType: 'Organization',
    id: encodeURIComponent(laboratorio),
    meta: { profile: ['http://hl7.org/fhir/StructureDefinition/Organization'] },
    identifier: [{ system: 'https://simi.ec/organizaciones', value: laboratorio }],
    active: true,
    type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/organization-type', code: 'pharm', display: 'Pharmacy' }] }],
    name: laboratorio,
  };
}

export function toFHIRBundle(resources: any[], type: string, total: number, baseUrl: string, nextUrl?: string) {
  return {
    resourceType: 'Bundle',
    type,
    total,
    timestamp: new Date().toISOString(),
    link: [
      { relation: 'self', url: baseUrl },
      ...(nextUrl ? [{ relation: 'next', url: nextUrl }] : []),
    ],
    entry: resources.map(r => ({
      fullUrl: `${baseUrl.split('/fhir')[0]}/api/fhir/r4/${r.resourceType}/${r.id}`,
      resource: r,
    })),
  };
}

export function toOperationOutcome(message: string, severity = 'error') {
  return {
    resourceType: 'OperationOutcome',
    issue: [{ severity, code: 'processing', diagnostics: message }],
  };
}
