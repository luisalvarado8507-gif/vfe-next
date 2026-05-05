// SNOMED International Browser API
// Servidor público: https://browser.ihtsdotools.org/snowstorm/snomed-ct
// Edición internacional — sin autenticación requerida para lectura

const SNOWSTORM_BASE = 'https://snowstorm.ihtsdotools.org/snowstorm/snomed-ct';
const EDITION = 'MAIN';
const VERSION = '2024-04-01';
const BRANCH = `${EDITION}/${VERSION}`;

export interface SNOMEDConcept {
  conceptId: string;
  fsn: { term: string };
  pt: { term: string };
  active: boolean;
  definitionStatus: string;
}

export interface SNOMEDSearchResult {
  conceptId: string;
  term: string;
  fsn: string;
  active: boolean;
}

// Buscar concepto por término
export async function searchSNOMED(term: string, ecl?: string): Promise<SNOMEDSearchResult[]> {
  try {
    const params = new URLSearchParams({
      term,
      limit: '5',
      active: 'true',
      ...(ecl ? { ecl } : {}),
    });
    const res = await fetch(
      `${SNOWSTORM_BASE}/${BRANCH}/concepts?term=${encodeURIComponent(term)}&limit=5&active=true`,
      { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      conceptId: item.conceptId,
      term: item.pt?.term || item.fsn?.term || term,
      fsn: item.fsn?.term || '',
      active: item.active,
    }));
  } catch(e) {
    return [];
  }
}

// Validar código SNOMED existente
export async function validateSNOMED(conceptId: string): Promise<{ valid: boolean; term?: string }> {
  try {
    const res = await fetch(
      `${SNOWSTORM_BASE}/${BRANCH}/concepts/${conceptId}`,
      { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return { valid: false };
    const data = await res.json();
    return { valid: data.active === true, term: data.pt?.term };
  } catch(e) {
    return { valid: false };
  }
}

// Buscar principios activos (sustancias) en SNOMED
// ECL: << 105590001 = Sustancia (jerarquía SNOMED)
export async function searchSubstance(inn: string): Promise<SNOMEDSearchResult[]> {
  return searchSNOMED(inn, '<< 105590001');
}

// Buscar formas farmacéuticas en SNOMED
// ECL: << 736542009 = Pharmaceutical dose form
export async function searchDoseForm(ff: string): Promise<SNOMEDSearchResult[]> {
  return searchSNOMED(ff, '<< 736542009');
}
