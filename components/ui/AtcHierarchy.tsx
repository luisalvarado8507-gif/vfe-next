'use client';
import { useEffect, useState } from 'react';

interface AtcLevel { code: string; level: number; description: string; }
interface AtcHierarchyProps { code: string; label?: string; }

const LEVEL_LABELS = ['Anatomical main group','Therapeutic subgroup','Pharmacological subgroup','Chemical subgroup','Chemical substance'];
const LEVEL_COLORS = [
  { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  { bg: '#FDF4FF', color: '#7E22CE', border: '#E9D5FF' },
  { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  { bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD' },
];

export default function AtcHierarchy({ code, label }: AtcHierarchyProps) {
  const [levels, setLevels] = useState<AtcLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code || code === '—') { setLoading(false); return; }
    fetch(`/api/atc?code=${code}`)
      .then(r => r.json())
      .then(d => { setLevels(d.levels || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [code]);

  if (!code || code === '—') return (
    <div style={{ fontSize: 12, color: 'var(--tx4)', fontStyle: 'italic' }}>Sin código ATC asignado</div>
  );

  return (
    <div>
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
      {loading ? (
        <div style={{ fontSize: 12, color: 'var(--tx4)', padding: '8px 0' }}>Cargando clasificación WHO...</div>
      ) : levels.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--tx4)', fontStyle: 'italic' }}>Clasificación no disponible</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {levels.map((lvl, i) => {
            const style = LEVEL_COLORS[i] || LEVEL_COLORS[4];
            return (
              <div key={lvl.code} style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: i * 16, padding: '6px 10px', background: style.bg, border: `1px solid ${style.border}`, borderRadius: 6, position: 'relative' }}>
                {i > 0 && <div style={{ position: 'absolute', left: -16, top: '50%', width: 14, height: 1, background: style.border }} />}
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)', color: style.color, minWidth: 52, background: style.border, padding: '1px 6px', borderRadius: 4 }}>{lvl.code}</span>
                <span style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 500 }}>Level {lvl.level} — {LEVEL_LABELS[lvl.level - 1]}</span>
                <span style={{ fontSize: 12, color: 'var(--tx)', fontWeight: 600, marginLeft: 4 }}>{lvl.description}</span>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ fontSize: 10, color: 'var(--tx4)', marginTop: 8, fontFamily: 'var(--mono)' }}>
        WHO-ATC · Anatomical Therapeutic Chemical Classification System
      </div>
    </div>
  );
}
