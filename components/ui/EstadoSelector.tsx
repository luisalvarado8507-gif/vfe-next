'use client';
import { ESTADOS, TRANSICIONES, EstadoRegulatorio } from '@/lib/regulatory-lifecycle';

interface EstadoSelectorProps {
  value: EstadoRegulatorio;
  onChange: (estado: EstadoRegulatorio) => void;
  disabled?: boolean;
  mostrarTodos?: boolean; // si true, muestra todos (para crear nuevo)
}

export default function EstadoSelector({ value, onChange, disabled, mostrarTodos }: EstadoSelectorProps) {
  const info = ESTADOS[value] || ESTADOS.arcsa_pendiente;
  const disponibles = mostrarTodos
    ? Object.keys(ESTADOS) as EstadoRegulatorio[]
    : [value, ...TRANSICIONES[value]];

  return (
    <div>
      {/* Badge estado actual */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: info.bg, color: info.color, border: `1.5px solid ${info.border}` }}>
          {info.icon} {info.label}
        </span>
        <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{info.desc}</span>
      </div>

      {/* Selector */}
      <select
        value={value}
        onChange={e => onChange(e.target.value as EstadoRegulatorio)}
        disabled={disabled || ESTADOS[value]?.final}
        style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${info.border}`, borderRadius: 'var(--r)', fontSize: 13, background: info.bg, color: info.color, fontFamily: 'var(--sans)', outline: 'none', fontWeight: 600, cursor: ESTADOS[value]?.final ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}>
        {disponibles.map(est => {
          const ei = ESTADOS[est];
          return <option key={est} value={est}>{ei.icon} {ei.label} — {ei.desc}</option>;
        })}
      </select>

      {ESTADOS[value]?.final && (
        <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>
          Estado final — no se pueden realizar más transiciones
        </p>
      )}

      {!mostrarTodos && TRANSICIONES[value]?.length > 0 && (
        <p style={{ fontSize: 10, color: 'var(--tx4)', marginTop: 4, fontFamily: 'var(--mono)' }}>
          Transiciones disponibles: {TRANSICIONES[value].map(t => ESTADOS[t]?.label).join(' · ')}
        </p>
      )}
    </div>
  );
}
