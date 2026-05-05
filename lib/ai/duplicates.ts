// Detección de duplicados farmacéuticos con IA
// Combina algoritmos determinísticos + análisis semántico con Claude

export interface DuplicateGroup {
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  meds: DuplicateCandidate[];
}

export interface DuplicateCandidate {
  docId: string;
  vtm: string;
  nombre: string;
  conc: string;
  ff: string;
  laboratorio: string;
  estado: string;
  chapId: string;
}

// Normalizar texto para comparación
export function normalize(s: string): string {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9\s+]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Score de similitud entre dos strings (0-1)
export function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (!na || !nb) return 0;
  // Jaccard similarity de bigramas
  const bigrams = (s: string) => new Set(Array.from({ length: s.length - 1 }, (_, i) => s.slice(i, i + 2)));
  const ba = bigrams(na);
  const bb = bigrams(nb);
  const intersection = new Set([...ba].filter(x => bb.has(x)));
  const union = new Set([...ba, ...bb]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// Detectar duplicados determinísticos (sin IA)
export function detectDuplicates(meds: DuplicateCandidate[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < meds.length; i++) {
    if (processed.has(meds[i].docId)) continue;
    const group: DuplicateCandidate[] = [meds[i]];
    
    for (let j = i + 1; j < meds.length; j++) {
      if (processed.has(meds[j].docId)) continue;
      
      const vtmSim = similarity(meds[i].vtm, meds[j].vtm);
      const concSim = similarity(meds[i].conc, meds[j].conc);
      const ffSim = similarity(meds[i].ff, meds[j].ff);
      
      // Alta confianza: mismo VTM exacto + misma concentración + misma FF
      if (vtmSim > 0.95 && concSim > 0.85 && ffSim > 0.85) {
        group.push(meds[j]);
        processed.add(meds[j].docId);
        continue;
      }
      
      // Media confianza: VTM muy similar + concentración similar
      if (vtmSim > 0.85 && concSim > 0.75 && ffSim > 0.7) {
        group.push(meds[j]);
        processed.add(meds[j].docId);
      }
    }
    
    if (group.length > 1) {
      processed.add(meds[i].docId);
      const vtmSims = group.slice(1).map(m => similarity(group[0].vtm, m.vtm));
      const avgSim = vtmSims.reduce((a, b) => a + b, 0) / vtmSims.length;
      groups.push({
        confidence: avgSim > 0.95 ? 'high' : avgSim > 0.85 ? 'medium' : 'low',
        reason: avgSim > 0.95 
          ? 'Mismo principio activo, concentración y forma farmacéutica'
          : 'Principio activo y concentración muy similares',
        meds: group,
      });
    }
  }
  
  return groups.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.confidence] - order[b.confidence];
  });
}
