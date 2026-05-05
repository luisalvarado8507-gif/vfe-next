'use client';
import { getATCHierarchy, ATC_L1 } from '@/lib/atc-db';

interface AtcLevel {
  code: string;
  level: number;
  label: string;
  description: string;
}

interface AtcHierarchyProps {
  code: string;
  label?: string;
}

// Descripciones de niveles ATC nivel 1 (grupos anatómicos principales)
const ATC_L1: Record<string, string> = {
  A: 'Tracto alimentario y metabolismo',
  B: 'Sangre y órganos hematopoyéticos',
  C: 'Sistema cardiovascular',
  D: 'Dermatológicos',
  G: 'Sistema genitourinario y hormonas sexuales',
  H: 'Preparados hormonales sistémicos',
  J: 'Antiinfecciosos para uso sistémico',
  L: 'Agentes antineoplásicos e inmunomoduladores',
  M: 'Sistema musculoesquelético',
  N: 'Sistema nervioso',
  P: 'Productos antiparasitarios, insecticidas y repelentes',
  R: 'Sistema respiratorio',
  S: 'Órganos de los sentidos',
  V: 'Varios',
};

const LEVEL_LABELS = [
  'Grupo anatómico principal',
  'Subgrupo terapéutico',
  'Subgrupo farmacológico',
  'Subgrupo químico',
  'Sustancia química',
];

function parseAtcLevels(code: string): AtcLevel[] {
  if (!code || code.length < 1) return [];
  const hierarchy = getATCHierarchy(code);
  return hierarchy.map(h => ({
    code: h.code,
    level: h.level,
    label: LEVEL_LABELS[h.level - 1] || `Nivel ${h.level}`,
    description: h.description,
  }));
}

const LEVEL_COLORS = [
  { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  { bg: '#FDF4FF', color: '#7E22CE', border: '#E9D5FF' },
  { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  { bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD' },
];

export default function AtcHierarchy({ code, label }: AtcHierarchyProps) {
  if (!code || code === '—') return (
    <div style={{ fontSize: 12, color: 'var(--tx4)', fontStyle: 'italic' }}>Sin código ATC asignado</div>
  );

  const levels = parseAtcLevels(code);

  return (
    <div>
      {/* Código completo con enlace WHO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--mono)', letterSpacing: 1 }}>
          {code.toUpperCase()}
        </span>
        {label && <span style={{ fontSize: 13, color: 'var(--tx2)' }}>{label}</span>}
        <a href={`https://www.whocc.no/atc_ddd_index/?code=${code}&showdescription=yes`}
          target="_blank" rel="noreferrer"
          style={{ fontSize: 11, color: 'var(--green)', textDecoration: 'none', fontWeight: 600, padding: '2px 8px', border: '1px solid var(--bdr)', borderRadius: 20, marginLeft: 'auto' }}>
          Ver en WHO-ATC →
        </a>
      </div>

      {/* Jerarquía visual */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {levels.map((lvl, i) => {
          const style = LEVEL_COLORS[i] || LEVEL_COLORS[4];
          const indent = i * 16;
          return (
            <div key={lvl.code} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginLeft: indent,
              padding: '6px 10px',
              background: style.bg,
              border: `1px solid ${style.border}`,
              borderRadius: 6,
              position: 'relative',
            }}>
              {i > 0 && (
                <div style={{
                  position: 'absolute', left: -16, top: '50%',
                  width: 14, height: 1, background: style.border,
                }} />
              )}
              <span style={{
                fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)',
                color: style.color, minWidth: 52, background: style.border,
                padding: '1px 6px', borderRadius: 4,
              }}>{lvl.code}</span>
              <span style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 500 }}>
                Nivel {lvl.level} — {lvl.label}
              </span>
              <span style={{ fontSize: 12, color: 'var(--tx)', fontWeight: 600, marginLeft: 4 }}>
                {lvl.description}
              </span>
            </div>
          );
        })}
      </div>

      {/* WHO note */}
      <div style={{ fontSize: 10, color: 'var(--tx4)', marginTop: 8, fontFamily: 'var(--mono)' }}>
        Clasificación WHO-ATC · Anatomical Therapeutic Chemical Classification System
      </div>
    </div>
  );
}
