'use client';
import { useEffect, useState } from 'react';

interface EMASPORResult {
  id: string;
  name: string;
  status: string;
  cas?: string;
  unii?: string;
}

interface GSRSResult {
  uuid: string;
  unii: string;
  name: string;
  rxcui?: string;
}

interface EMASPORLookupProps {
  inn: string;
}

export default function EMASPORLookup({ inn }: EMASPORLookupProps) {
  const [emaResults, setEmaResults] = useState<EMASPORResult[]>([]);
  const [gsrsResults, setGsrsResults] = useState<GSRSResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inn || inn.length < 3) return;
    const lookup = async () => {
      setLoading(true);
      try {
        const term = inn.split(' + ')[0].trim();
        const [emaRes, gsrsRes] = await Promise.allSettled([
          fetch(`/api/spor/lookup?inn=${encodeURIComponent(term)}&source=ema`),
          fetch(`/api/spor/lookup?inn=${encodeURIComponent(term)}&source=gsrs`),
        ]);
        if (emaRes.status === 'fulfilled' && emaRes.value.ok) {
          const d = await emaRes.value.json();
          setEmaResults(d.results || []);
        }
        if (gsrsRes.status === 'fulfilled' && gsrsRes.value.ok) {
          const d = await gsrsRes.value.json();
          setGsrsResults(d.results || []);
        }
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    lookup();
  }, [inn]);

  if (loading) return (
    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 11, background: '#FEF9C3', color: '#92400E', border: '1px solid #FDE68A', fontFamily: 'var(--mono)' }}>
        EMA SPOR...
      </span>
    </div>
  );

  if (!emaResults.length && !gsrsResults.length) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
      {emaResults.slice(0, 1).map(r => (
        <a key={r.id}
          href={`https://spor.ema.europa.eu/smswi/#/substances/${r.id}`}
          target="_blank" rel="noreferrer"
          title={`EMA SPOR: ${r.name} (${r.status})`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', textDecoration: 'none' }}>
          EMA {r.id.substring(0, 8)}
          <span style={{ fontSize: 10, opacity: 0.7 }}>↗</span>
        </a>
      ))}
      {gsrsResults.slice(0, 1).map(r => r.unii ? (
        <a key={r.uuid}
          href={`https://gsrs.ncats.nih.gov/#/substance/${r.uuid}`}
          target="_blank" rel="noreferrer"
          title={`FDA G-SRS UNII: ${r.unii}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)', background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', textDecoration: 'none' }}>
          UNII {r.unii}
          <span style={{ fontSize: 10, opacity: 0.7 }}>↗</span>
        </a>
      ) : null)}
    </div>
  );
}
