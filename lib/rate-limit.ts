// Rate limiting para SIMI API
// Implementación en memoria — se resetea con cada deploy
// Para producción con múltiples instancias usar Redis o Firestore

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  limit: number;      // máximo de requests
  windowMs: number;   // ventana en milisegundos
}

export const RATE_LIMITS = {
  api:          { limit: 100, windowMs: 60_000 },   // 100 req/min para API general
  fhir:         { limit: 60,  windowMs: 60_000 },   // 60 req/min para FHIR
  ai:           { limit: 10,  windowMs: 60_000 },   // 10 req/min para IA
  busqueda:     { limit: 30,  windowMs: 60_000 },   // 30 req/min para búsqueda
  auth:         { limit: 5,   windowMs: 60_000 },   // 5 req/min para auth
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `${identifier}`;
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // Nueva ventana
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.limit - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
}

// Helper para obtener IP del request
export function getClientId(req: Request): string {
  const forwarded = (req as any).headers?.get?.('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return ip;
}
