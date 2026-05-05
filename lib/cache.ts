// Cache en memoria con TTL para APIs externas
// RxNorm, SNOMED, EMA SPOR, G-SRS

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private ttlMs: number;

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs;
    // Limpiar entradas expiradas cada 10 minutos
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  size(): number {
    return this.store.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt < now) this.store.delete(key);
    }
  }
}

// Caches con diferentes TTLs según la frecuencia de actualización
export const rxnormCache  = new TTLCache<any>(24 * 60 * 60 * 1000);  // 24h — RxNorm cambia raramente
export const snomedCache  = new TTLCache<any>(24 * 60 * 60 * 1000);  // 24h — SNOMED edición semestral
export const sporCache    = new TTLCache<any>(6  * 60 * 60 * 1000);  // 6h  — EMA SPOR
export const gsrsCache    = new TTLCache<any>(24 * 60 * 60 * 1000);  // 24h — G-SRS UNII
export const analyticsCache = new TTLCache<any>(5 * 60 * 1000);      // 5min — Analytics

// Wrapper genérico con cache
export async function withCache<T>(
  cache: TTLCache<T>,
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  if (cached !== null) return cached;
  const value = await fetcher();
  cache.set(key, value);
  return value;
}
