// Generador de strings VMPP/AMPP según SPMS.
// Prioriza volumen (vol+volUnit) cuando existe — caso cremas, jarabes,
// soluciones donde el "tamaño del envase" importa más que el número
// de unidades. Cae a units como fallback (cajas de N comprimidos).

export function buildPaquete(
  base: string,
  units: string,
  envase: string,
  vol: string,
  volUnit: string,
): string {
  const volStr = vol ? `${vol} ${volUnit || 'mL'}` : '';
  if (volStr && envase) return `${base}, ${envase} ${volStr}`;
  if (volStr) return `${base}, ${volStr}`;
  if (units && envase) return `${base}, ${envase} ${units}`;
  if (units) return `${base} ${units} unidades`;
  return '';
}
