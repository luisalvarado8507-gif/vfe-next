// EMA SPOR — Substance, Product, Organisation, Referential
// Basado en EMA SPOR R4 / ISO IDMP 11615/11238/11239/11240/11616
// https://spor.ema.europa.eu/

// ── S — Substance (ISO 11238) ────────────────────────────────────────────
export interface SPORSubstance {
  simiId: string;           // ID estable SIMI: sub_{hash}
  inn: string;              // International Nonproprietary Name (INN/DCI)
  innLang: 'es' | 'en' | 'la';
  snomed?: string;          // SNOMED CT concept ID
  snomedTerm?: string;
  cas?: string;             // CAS Registry Number
  inchi?: string;           // InChI identifier
  molecularFormula?: string;
  molecularWeight?: number;
  class?: string;           // Clase química
  atcCode?: string;         // ATC nivel sustancia
  createdAt: string;
  updatedAt: string;
  version: number;
}

// ── P — Product (ISO 11615) ──────────────────────────────────────────────
export interface SPORProduct {
  simiId: string;           // ID estable SIMI: prd_{hash}
  // VTM — Virtual Therapeutic Moiety
  vtmId: string;            // Referencia a SPORSubstance.simiId
  vtmName: string;
  // VMP — Virtual Medicinal Product
  vmpId: string;            // ID estable SIMI: vmp_{hash}
  vmpName: string;          // VTM + concentración + forma farmacéutica
  // VMPP — Virtual Medicinal Product Pack
  vmppId?: string;
  vmppName?: string;        // VMP + número de unidades
  // AMP — Actual Medicinal Product
  ampId: string;            // ID estable SIMI: amp_{hash}
  ampName: string;          // Nombre comercial
  // AMPP — Actual Medicinal Product Pack
  amppId?: string;
  amppName?: string;
  // Identificadores regulatorios
  rs: string;               // Registro sanitario ARCSA
  cum?: string;             // Código Único de Medicamento
  gtin?: string;            // GTIN/EAN
  phpid?: string;           // ISO 11616 PhPID
  // Clasificación
  atc: string;
  atcLabel?: string;
  edqmForm?: string;        // EDQM forma farmacéutica
  edqmRoute?: string;       // EDQM vía de administración
  // Organización
  organisationId: string;   // Referencia a SPOROrganisation.simiId
  // Estado regulatorio
  estado: string;
  lifecycleHistory: LifecycleEvent[];
  // Ingredientes
  ingredients: SPORIngredient[];
  // Metadatos
  chapId?: string;
  subId?: string;
  cnmb?: string;
  generico?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface SPORIngredient {
  substanceId: string;      // Referencia a SPORSubstance.simiId
  substanceName: string;
  role: 'active' | 'excipient' | 'adjuvant';
  strengthValue?: number;
  strengthUnit?: string;    // UCUM unit
  strengthDenominator?: number;
  strengthDenominatorUnit?: string;
  referenceStrength?: boolean;
}

// ── O — Organisation (ISO 11615) ─────────────────────────────────────────
export interface SPOROrganisation {
  simiId: string;           // ID estable SIMI: org_{hash}
  name: string;
  type: 'manufacturer' | 'marketing_authorisation_holder' | 'importer' | 'distributor';
  country?: string;
  loc?: string;             // Localidad
  identifier?: string;      // ID en registro nacional
  createdAt: string;
  updatedAt: string;
}

// ── R — Referential (ISO 11239/11240) ────────────────────────────────────
export interface SPORReferential {
  type: 'dose_form' | 'route_of_administration' | 'unit_of_presentation' | 'strength_unit';
  code: string;
  display: string;
  system: 'EDQM' | 'UCUM' | 'SNOMED' | 'SIMI';
  active: boolean;
}

export interface LifecycleEvent {
  estado: string;
  fecha: string;
  usuario: string;
  motivo?: string;
  tipoVariacion?: 'IA' | 'IB' | 'II';  // Tipos de variación EMA
}

// ── Función para generar IDs estables ────────────────────────────────────
export function generateSPORId(prefix: string, value: string): string {
  // Simple hash determinístico para IDs estables
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `${prefix}_${Math.abs(hash).toString(36)}`;
}

// ── Conversor SIMI flat → SPOR entities ──────────────────────────────────
export function flatToSPOR(med: Record<string, any>): {
  substance: SPORSubstance;
  product: SPORProduct;
  organisation: SPOROrganisation;
} {
  const now = new Date().toISOString();

  const substance: SPORSubstance = {
    simiId: generateSPORId('sub', med.vtm || ''),
    inn: med.vtm || '',
    innLang: 'es',
    snomed: med.snomed_vtm_code,
    snomedTerm: med.vtm,
    atcCode: med.atc,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };

  const organisation: SPOROrganisation = {
    simiId: generateSPORId('org', med.laboratorio || ''),
    name: med.laboratorio || '',
    type: 'marketing_authorisation_holder',
    country: med.rsPaisFab || 'EC',
    createdAt: now,
    updatedAt: now,
  };

  const ingredients: SPORIngredient[] = med.esCombo && med.comboData?.pas
    ? med.comboData.pas.map((pa: string, i: number) => ({
        substanceId: generateSPORId('sub', pa),
        substanceName: pa,
        role: 'active' as const,
        strengthValue: med.comboData.concs?.[i] ? parseFloat(med.comboData.concs[i]) : undefined,
        strengthUnit: med.comboData.units?.[i] || 'mg',
      }))
    : [{
        substanceId: substance.simiId,
        substanceName: med.vtm || '',
        role: 'active' as const,
        strengthValue: med.conc ? parseFloat(med.conc) : undefined,
        strengthUnit: med.conc ? med.conc.replace(/[0-9.,s]/g, '').trim() || 'mg' : 'mg',
      }];

  const product: SPORProduct = {
    simiId: generateSPORId('prd', med.docId || med.id || ''),
    vtmId: substance.simiId,
    vtmName: med.vtm || '',
    vmpId: generateSPORId('vmp', `${med.vtm}${med.conc}${med.ff}`),
    vmpName: med.vmp || `${med.vtm} ${med.conc} ${med.ff}`.trim(),
    vmppId: med.vmpp ? generateSPORId('vmpp', med.vmpp) : undefined,
    vmppName: med.vmpp,
    ampId: generateSPORId('amp', med.amp || med.nombre || med.vtm || ''),
    ampName: med.amp || med.nombre || med.vtm || '',
    amppId: med.ampp ? generateSPORId('ampp', med.ampp) : undefined,
    amppName: med.ampp,
    rs: med.rs || '',
    cum: med.cum,
    gtin: med.gtin,
    phpid: med.phpid,
    atc: med.atc || '',
    atcLabel: med.atclbl,
    edqmForm: med.ff,
    edqmRoute: med.vias || med.via,
    organisationId: organisation.simiId,
    estado: med.estado || 'arcsa_pendiente',
    lifecycleHistory: [],
    ingredients,
    chapId: med.chapId,
    subId: med.subId,
    cnmb: med.cnmb,
    generico: med.generico,
    createdAt: now,
    updatedAt: now,
    version: med.version || 1,
  };

  return { substance, product, organisation };
}
