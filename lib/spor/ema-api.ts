// EMA SPOR API — Substance Management
// API pública EMA: https://spor.ema.europa.eu/rmswi/
// Documentación: https://spor.ema.europa.eu/sporwi/

const EMA_SPOR_BASE = 'https://spor.ema.europa.eu/smswi/v2';
const GSRS_BASE = 'https://gsrs.ncats.nih.gov/api/v1';

export interface EMASPORSubstance {
  id: string;           // EMA SPOR substance ID
  name: string;         // INN/name
  status: string;       // active/inactive
  inchi?: string;
  smiles?: string;
  cas?: string;
  unii?: string;        // FDA UNII code
}

export interface GSRSSubstance {
  uuid: string;
  unii: string;
  name: string;
  rxcui?: string;
  inchi?: string;
}

// Buscar sustancia en EMA SPOR por INN
export async function searchEMASPOR(inn: string): Promise<EMASPORSubstance[]> {
  try {
    const res = await fetch(
      `${EMA_SPOR_BASE}/substances?name=${encodeURIComponent(inn)}&pageSize=5`,
      { 
        headers: { Accept: 'application/json', 'X-Requested-With': 'SIMI-Ecuador' },
        signal: AbortSignal.timeout(6000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || data.content || data.results || []).slice(0, 3).map((s: any) => ({
      id: s.id || s.substanceId || '',
      name: s.name || s.preferredName || inn,
      status: s.status || 'active',
      cas: s.casNumber || s.cas,
      unii: s.unii || s.fda_unii,
    }));
  } catch(e) {
    return [];
  }
}

// Buscar sustancia en G-SRS FDA (UNII) por INN
export async function searchGSRS(inn: string): Promise<GSRSSubstance[]> {
  try {
    const res = await fetch(
      `${GSRS_BASE}/substances/search?q=${encodeURIComponent(inn)}&top=3&skip=0`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(6000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const results = data.content || data.results || data.data || [];
    return results.slice(0, 3).map((s: any) => ({
      uuid: s.uuid || '',
      unii: s._unii || s.unii || s.approvalID || '',
      name: s._name || s.preferredName || s.names?.[0]?.name || inn,
      rxcui: s.codes?.find((c: any) => c.codeSystem === 'RXCUI')?.code,
      inchi: s.structure?.inChI,
    }));
  } catch(e) {
    return [];
  }
}

// Buscar UNII por INN (acceso directo)
export async function getUNII(inn: string): Promise<string | null> {
  try {
    const results = await searchGSRS(inn);
    return results[0]?.unii || null;
  } catch {
    return null;
  }
}
