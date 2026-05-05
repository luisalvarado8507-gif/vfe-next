'use client';
import { useEffect, useState } from 'react';

interface RxNormResult {
  rxcui: string;
  name: string;
  synonym?: string;
  tty: string; // term type: IN=ingredient, PIN=precise, SY=synonym
}

interface RxNormLookupProps {
  inn: string; // INN/DCI del principio activo
}

export default function RxNormLookup({ inn }: RxNormLookupProps) {
  const [results, setResults] = useState<RxNormResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!inn || inn.length < 3) return;
    const lookup = async () => {
      setLoading(true);
      setError('');
      try {
        // RxNorm API pública NLM/FDA — sin autenticación requerida
        // Buscamos por nombre exacto primero, luego aproximado
        const term = inn.split(' + ')[0].trim(); // primer PA si es combo
        const url = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(term)}&search=2`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.idGroup?.rxnormId?.length > 0) {
          const rxcui = data.idGroup.rxnormId[0];
          // Obtener detalles del concepto
          const detailRes = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`);
          const detail = await detailRes.json();
          const props = detail.properties;
          if (props) {
            setResults([{
              rxcui: props.rxcui,
              name: props.name,
              synonym: props.synonym,
              tty: props.tty,
            }]);
          }
        } else {
          // Búsqueda aproximada
          const approxRes = await fetch(`https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(term)}&maxEntries=3`);
          const approxData = await approxRes.json();
          const candidates = approxData.approximateGroup?.candidate || [];
          setResults(candidates.slice(0, 2).map((c: any) => ({
            rxcui: c.rxcui,
            name: c.name,
            tty: c.tty || 'IN',
          })));
        }
      } catch(e) {
        setError('RxNorm no disponible');
      } finally {
        setLoading(false);
      }
    };
    lookup();
  }, [inn]);

  if (loading) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 11, background: '#FEF9C3', color: '#92400E', border: '1px solid #FDE68A', fontFamily: 'var(--mono)' }}>
      RxNorm...
    </span>
  );

  if (error || results.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
      {results.map(r => (
        <a key={r.rxcui}
          href={`https://www.rxnav.nlm.nih.gov/RxNav.html?search=${r.rxcui}`}
          target="_blank" rel="noreferrer"
          title={`RxNorm: ${r.name} (${r.tty})`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)', background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', textDecoration: 'none', cursor: 'pointer', transition: 'opacity .15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          RxNorm {r.rxcui}
          <span style={{ fontSize: 10, opacity: 0.7 }}>{r.tty}</span>
          <span style={{ fontSize: 10, opacity: 0.6 }}>↗</span>
        </a>
      ))}
    </div>
  );
}
