// Validación del Registro Sanitario ARCSA Ecuador
// Formato real observado en datos ARCSA 2026:
// XXXXX-X-XXX-XX-XX (ej: 00012-1-MAN-03-05)
// También: ARCSA-DNMVSP-XXXXXX-XXXXX (formato nuevo post-2017)
// Y: XXXXX-MEE-XXXX (formato antiguo)

export interface RSValidationResult {
  valid: boolean;
  format: 'arcsa_nuevo' | 'arcsa_antiguo' | 'numerico' | 'desconocido' | 'vacio';
  normalized: string;
  mensaje?: string;
}

// Patrones de RS ARCSA Ecuador
const PATRONES = [
  // Formato clásico: 00012-1-MAN-03-05
  { regex: /^\d{4,6}-\d+-[A-Z]{2,4}-\d{2}-\d{2}$/i, format: 'arcsa_antiguo' as const },
  // Formato nuevo ARCSA: ARCSA-DNMVSP-XXXXXX-XXXXX
  { regex: /^ARCSA-[A-Z]+-\d+-\d+$/i, format: 'arcsa_nuevo' as const },
  // Formato MEE: 3029-MEE-0917
  { regex: /^\d{4,6}-[A-Z]{2,4}-\d{4}$/i, format: 'arcsa_antiguo' as const },
  // Formato solo numérico
  { regex: /^\d{8,15}$/, format: 'numerico' as const },
];

export function validarRS(rs: string): RSValidationResult {
  if (!rs || rs.trim() === '') {
    return { valid: false, format: 'vacio', normalized: '', mensaje: 'Registro sanitario requerido' };
  }

  const rsTrim = rs.trim().toUpperCase().replace(/\s+/g, '-');

  for (const patron of PATRONES) {
    if (patron.regex.test(rsTrim)) {
      return { valid: true, format: patron.format, normalized: rsTrim };
    }
  }

  // Si no coincide con ningún patrón pero tiene forma razonable (contiene guiones y alfanumérico)
  if (/^[A-Z0-9][A-Z0-9\-]{6,30}$/i.test(rsTrim)) {
    return { valid: true, format: 'desconocido', normalized: rsTrim, mensaje: 'Formato no estándar — verificar con ARCSA' };
  }

  return {
    valid: false,
    format: 'desconocido',
    normalized: rsTrim,
    mensaje: 'Formato inválido. Ejemplos: 00012-1-MAN-03-05 · ARCSA-DNMVSP-12345-67890',
  };
}

export function formatearRS(rs: string): string {
  return validarRS(rs).normalized || rs;
}
