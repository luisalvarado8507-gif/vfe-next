// CNMB — Cuadro Nacional de Medicamentos Básicos Ecuador
// Fuente: Ministerio de Salud Pública del Ecuador
// https://www.salud.gob.ec/cuadro-nacional-de-medicamentos-basicos/

export interface CNMBInfo {
  version: string;       // Edición del CNMB
  año: number;           // Año de publicación
  url: string;           // URL oficial MSP
  descripcion: string;
}

// Historial de ediciones del CNMB Ecuador
export const CNMB_VERSIONES: CNMBInfo[] = [
  { version: '9ª Edición', año: 2014, url: 'https://www.salud.gob.ec', descripcion: 'Vigente 2014-actualidad' },
  { version: '8ª Edición', año: 2011, url: 'https://www.salud.gob.ec', descripcion: 'Anterior' },
  { version: '7ª Edición', año: 2008, url: 'https://www.salud.gob.ec', descripcion: 'Anterior' },
];

export const CNMB_VIGENTE = CNMB_VERSIONES[0];

// Clasificación CNMB por nivel de atención
export const CNMB_NIVELES: Record<string, string> = {
  '1': 'Nivel 1 — Atención primaria (Centros de salud)',
  '2': 'Nivel 2 — Atención especializada (Hospitales básicos)',
  '3': 'Nivel 3 — Alta complejidad (Hospitales especializados)',
  'H': 'Hospitalario general',
  'A': 'Ambulatorio',
};

export function getCNMBBadge(cnmb: string): { label: string; bg: string; color: string } | null {
  if (cnmb !== 'Sí') return null;
  return { label: 'CNMB 9ª Ed.', bg: '#FEF3C7', color: '#92400E' };
}
