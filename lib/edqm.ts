// EDQM Standard Terms — European Directorate for the Quality of Medicines
// https://standardterms.edqm.eu/
// ISO 11239 (Pharmaceutical dose forms) y ISO 11240 (Units of measurement)
// Los códigos son del sistema EDQM Standard Terms Database

export interface EDQMTerm {
  code: string;         // Código EDQM (ej: 10219000)
  term: string;         // Término en inglés (ej: Tablet)
  termEs: string;       // Término en español
  status: 'current' | 'deprecated';
  isoStandard: string;  // ISO 11239 | ISO 11240 | ISO 11616
}

// ── Formas farmacéuticas (ISO 11239) ─────────────────────────────────────
export const EDQM_DOSE_FORMS: Record<string, EDQMTerm> = {
  // Sólidos orales
  'comprimido': { code: '10219000', term: 'Tablet', termEs: 'Comprimido', status: 'current', isoStandard: 'ISO 11239' },
  'comprimido recubierto': { code: '10220000', term: 'Film-coated tablet', termEs: 'Comprimido recubierto con película', status: 'current', isoStandard: 'ISO 11239' },
  'comprimido recubierto con película': { code: '10220000', term: 'Film-coated tablet', termEs: 'Comprimido recubierto con película', status: 'current', isoStandard: 'ISO 11239' },
  'comprimidos recubiertos con pelicula': { code: '10220000', term: 'Film-coated tablet', termEs: 'Comprimido recubierto con película', status: 'current', isoStandard: 'ISO 11239' },
  'comprimido de liberación prolongada': { code: '10227000', term: 'Prolonged-release tablet', termEs: 'Comprimido de liberación prolongada', status: 'current', isoStandard: 'ISO 11239' },
  'comprimido masticable': { code: '10228000', term: 'Chewable tablet', termEs: 'Comprimido masticable', status: 'current', isoStandard: 'ISO 11239' },
  'comprimido sublingual': { code: '10317000', term: 'Sublingual tablet', termEs: 'Comprimido sublingual', status: 'current', isoStandard: 'ISO 11239' },
  'comprimido dispersable': { code: '10221000', term: 'Dispersible tablet', termEs: 'Comprimido dispersable', status: 'current', isoStandard: 'ISO 11239' },
  'tabletas': { code: '10219000', term: 'Tablet', termEs: 'Tabletas', status: 'current', isoStandard: 'ISO 11239' },
  'tableta': { code: '10219000', term: 'Tablet', termEs: 'Tableta', status: 'current', isoStandard: 'ISO 11239' },
  // Cápsulas
  'cápsula': { code: '10210000', term: 'Capsule, hard', termEs: 'Cápsula dura', status: 'current', isoStandard: 'ISO 11239' },
  'cápsulas': { code: '10210000', term: 'Capsule, hard', termEs: 'Cápsula dura', status: 'current', isoStandard: 'ISO 11239' },
  'cápsula blanda': { code: '10212000', term: 'Capsule, soft', termEs: 'Cápsula blanda', status: 'current', isoStandard: 'ISO 11239' },
  'cápsula de liberación prolongada': { code: '10213000', term: 'Prolonged-release capsule, hard', termEs: 'Cápsula de liberación prolongada', status: 'current', isoStandard: 'ISO 11239' },
  // Líquidos orales
  'jarabe': { code: '10117000', term: 'Syrup', termEs: 'Jarabe', status: 'current', isoStandard: 'ISO 11239' },
  'solución oral': { code: '10100000', term: 'Oral solution', termEs: 'Solución oral', status: 'current', isoStandard: 'ISO 11239' },
  'suspensión oral': { code: '10107000', term: 'Oral suspension', termEs: 'Suspensión oral', status: 'current', isoStandard: 'ISO 11239' },
  'suspensión': { code: '10107000', term: 'Oral suspension', termEs: 'Suspensión oral', status: 'current', isoStandard: 'ISO 11239' },
  'emulsión oral': { code: '10104000', term: 'Oral emulsion', termEs: 'Emulsión oral', status: 'current', isoStandard: 'ISO 11239' },
  'gotas orales': { code: '10101000', term: 'Oral drops, solution', termEs: 'Gotas orales, solución', status: 'current', isoStandard: 'ISO 11239' },
  // Parenterales
  'solución inyectable': { code: '11201000', term: 'Solution for injection', termEs: 'Solución inyectable', status: 'current', isoStandard: 'ISO 11239' },
  'suspensión inyectable': { code: '11202000', term: 'Suspension for injection', termEs: 'Suspensión inyectable', status: 'current', isoStandard: 'ISO 11239' },
  'polvo para solución inyectable': { code: '11205000', term: 'Powder for solution for injection', termEs: 'Polvo para solución inyectable', status: 'current', isoStandard: 'ISO 11239' },
  'solución para infusión': { code: '11210000', term: 'Solution for infusion', termEs: 'Solución para infusión', status: 'current', isoStandard: 'ISO 11239' },
  // Tópicos
  'crema': { code: '10502000', term: 'Cream', termEs: 'Crema', status: 'current', isoStandard: 'ISO 11239' },
  'ungüento': { code: '10504000', term: 'Ointment', termEs: 'Ungüento', status: 'current', isoStandard: 'ISO 11239' },
  'gel': { code: '10503000', term: 'Gel', termEs: 'Gel', status: 'current', isoStandard: 'ISO 11239' },
  'loción': { code: '10511000', term: 'Lotion', termEs: 'Loción', status: 'current', isoStandard: 'ISO 11239' },
  'solución tópica': { code: '10514000', term: 'Cutaneous solution', termEs: 'Solución cutánea', status: 'current', isoStandard: 'ISO 11239' },
  'parche transdérmico': { code: '10519000', term: 'Transdermal patch', termEs: 'Parche transdérmico', status: 'current', isoStandard: 'ISO 11239' },
  // Oftálmicos / Óticos
  'colirio': { code: '10600000', term: 'Eye drops, solution', termEs: 'Colirio en solución', status: 'current', isoStandard: 'ISO 11239' },
  'gotas óticas': { code: '10700000', term: 'Ear drops, solution', termEs: 'Gotas óticas, solución', status: 'current', isoStandard: 'ISO 11239' },
  // Inhalación
  'aerosol': { code: '11101000', term: 'Pressurised inhalation, solution', termEs: 'Solución para inhalación presurizada', status: 'current', isoStandard: 'ISO 11239' },
  'polvo para inhalación': { code: '11106000', term: 'Inhalation powder', termEs: 'Polvo para inhalación', status: 'current', isoStandard: 'ISO 11239' },
  // Rectales / Vaginales
  'supositorio': { code: '11013000', term: 'Suppository', termEs: 'Supositorio', status: 'current', isoStandard: 'ISO 11239' },
  'óvulo': { code: '10912000', term: 'Pessary', termEs: 'Óvulo', status: 'current', isoStandard: 'ISO 11239' },
  // Polvos / Reconstituibles
  'polvo para suspensión oral': { code: '10108000', term: 'Powder for oral suspension', termEs: 'Polvo para suspensión oral', status: 'current', isoStandard: 'ISO 11239' },
  'polvo para reconstituir suspensión': { code: '10108000', term: 'Powder for oral suspension', termEs: 'Polvo para suspensión oral', status: 'current', isoStandard: 'ISO 11239' },
  'granulado': { code: '10204000', term: 'Granules', termEs: 'Granulado', status: 'current', isoStandard: 'ISO 11239' },
};

// ── Vías de administración (ISO 11239) ────────────────────────────────────
export const EDQM_ROUTES: Record<string, EDQMTerm> = {
  'oral': { code: '20053000', term: 'Oral use', termEs: 'Uso oral', status: 'current', isoStandard: 'ISO 11239' },
  'intravenosa': { code: '20045000', term: 'Intravenous use', termEs: 'Uso intravenoso', status: 'current', isoStandard: 'ISO 11239' },
  'intramuscular': { code: '20035000', term: 'Intramuscular use', termEs: 'Uso intramuscular', status: 'current', isoStandard: 'ISO 11239' },
  'subcutánea': { code: '20066000', term: 'Subcutaneous use', termEs: 'Uso subcutáneo', status: 'current', isoStandard: 'ISO 11239' },
  'tópica': { code: '20070000', term: 'Cutaneous use', termEs: 'Uso cutáneo', status: 'current', isoStandard: 'ISO 11239' },
  'inhalatoria': { code: '20020000', term: 'Inhalation use', termEs: 'Uso por inhalación', status: 'current', isoStandard: 'ISO 11239' },
  'sublingual': { code: '20067000', term: 'Sublingual use', termEs: 'Uso sublingual', status: 'current', isoStandard: 'ISO 11239' },
  'rectal': { code: '20061000', term: 'Rectal use', termEs: 'Uso rectal', status: 'current', isoStandard: 'ISO 11239' },
  'vaginal': { code: '20072000', term: 'Vaginal use', termEs: 'Uso vaginal', status: 'current', isoStandard: 'ISO 11239' },
  'oftálmica': { code: '20051000', term: 'Ocular use', termEs: 'Uso ocular', status: 'current', isoStandard: 'ISO 11239' },
  'ótica': { code: '20008000', term: 'Auricular use', termEs: 'Uso auricular', status: 'current', isoStandard: 'ISO 11239' },
  'nasal': { code: '20049000', term: 'Nasal use', termEs: 'Uso nasal', status: 'current', isoStandard: 'ISO 11239' },
  'transdérmica': { code: '20071000', term: 'Transdermal use', termEs: 'Uso transdérmico', status: 'current', isoStandard: 'ISO 11239' },
  'intranasal': { code: '20049000', term: 'Nasal use', termEs: 'Uso nasal', status: 'current', isoStandard: 'ISO 11239' },
  'intratecal': { code: '20043000', term: 'Intrathecal use', termEs: 'Uso intratecal', status: 'current', isoStandard: 'ISO 11239' },
  'intraperitoneal': { code: '20037000', term: 'Intraperitoneal use', termEs: 'Uso intraperitoneal', status: 'current', isoStandard: 'ISO 11239' },
};

export function getEDQMDoseForm(ff: string): EDQMTerm | null {
  const key = (ff || '').toLowerCase().trim();
  return EDQM_DOSE_FORMS[key] || null;
}

export function getEDQMRoute(via: string): EDQMTerm | null {
  const key = (via || '').toLowerCase().trim();
  return EDQM_ROUTES[key] || null;
}

// Buscar forma farmacéutica por coincidencia parcial
export function searchEDQMDoseForm(query: string): EDQMTerm | null {
  const q = query.toLowerCase().trim();
  // Búsqueda exacta primero
  if (EDQM_DOSE_FORMS[q]) return EDQM_DOSE_FORMS[q];
  // Búsqueda parcial
  for (const [key, term] of Object.entries(EDQM_DOSE_FORMS)) {
    if (q.includes(key) || key.includes(q)) return term;
  }
  return null;
}
