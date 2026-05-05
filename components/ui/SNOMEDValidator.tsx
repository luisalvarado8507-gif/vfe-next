'use client';
import { useEffect, useState } from 'react';

interface SNOMEDValidatorProps {
  conceptId: string;
  term: string;
  type: 'vtm' | 'ff' | 'route';
}

const TYPE_STYLES = {
  vtm:   { bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' },
  ff:    { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
  route: { bg: '#CCFBF1', color: '#0F766E', border: '#5EEAD4' },
};

export default function SNOMEDValidator({ conceptId, term, type }: SNOMEDValidatorProps) {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'unknown'>('loading');
  const [serverTerm, setServerTerm] = useState('');
  const s = TYPE_STYLES[type];

  useEffect(() => {
    if (!conceptId) { setStatus('unknown'); return; }
    const validate = async () => {
      try {
        const res = await fetch(
          `https://snowstorm.ihtsdotools.org/snowstorm/snomed-ct/MAIN/2024-04-01/concepts/${conceptId}`,
          { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) }
        );
        if (res.ok) {
          const data = await res.json();
          setStatus(data.active ? 'valid' : 'invalid');
          setServerTerm(data.pt?.term || '');
        } else {
          setStatus('invalid');
        }
      } catch { setStatus('unknown'); }
    };
    validate();
  }, [conceptId]);

  const statusIcon = status === 'loading' ? '◷' : status === 'valid' ? '✓' : status === 'invalid' ? '✕' : '?';
  const statusTitle = status === 'valid' ? `Validado SNOMED International: ${serverTerm || term}`
    : status === 'invalid' ? 'Código no encontrado en SNOMED International'
    : status === 'loading' ? 'Validando con SNOMED International...'
    : 'No se pudo validar (servidor no disponible)';

  return (
    <a href={`https://browser.ihtsdotools.org/?perspective=full&conceptId1=${conceptId}&edition=en-edition`}
      target="_blank" rel="noreferrer"
      title={statusTitle}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)', textDecoration: 'none', cursor: 'pointer' }}>
      <span style={{ fontSize: 10 }}>{statusIcon}</span>
      SNOMED {conceptId}
      {status === 'valid' && serverTerm && serverTerm !== term && (
        <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>· {serverTerm}</span>
      )}
      <span style={{ fontSize: 10, opacity: 0.6 }}>↗</span>
    </a>
  );
}
