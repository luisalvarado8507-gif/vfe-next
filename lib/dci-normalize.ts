// Normalización DCI — variantes ortográficas aceptadas (INN español vs latino)
// Centraliza las reglas de equivalencia ortográfica usadas por el buscador
// y por agregaciones del dashboard. Si añades una variante, hazlo aquí.

export function normalizarDCI(s: string): string {
  return s
    .toLowerCase()
    .replace(/\bamlodipina\b/g, 'amlodipino')
    .replace(/\bnifedipina\b/g, 'nifedipino')
    .replace(/\bfurosemida\b/g, 'furosemida')
    .replace(/\blomefantrina\b/g, 'lumefantrina')
    .replace(/\bácido acetil salicílico\b/g, 'ácido acetilsalicílico')
    .trim();
}
