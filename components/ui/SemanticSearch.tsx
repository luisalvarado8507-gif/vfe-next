'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface SearchResult {
  docId: string;
  vtm: string;
  nombre: string;
  conc: string;
  ff: string;
  laboratorio: string;
  atc: string;
  estado: string;
  score: number;
}

export default function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [intent, setIntent] = useState('');
  const [terms, setTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter();

  const buscar = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const token = await getToken();
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResults(data.results || []);
      setIntent(data.intent || query);
      setTerms(data.terms || []);
      setSearched(true);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const ejemplos = [
    'antihipertensivos para embarazo',
    'antibiótico para infección urinaria',
    'medicamento para diabetes tipo 2',
    'analgésico sin aspirina',
    'hipoglucemiante oral combinado',
  ];

  return (
    <div style={{ fontFamily: 'var(--sans)' }}>
      {/* Buscador semántico */}
      <div style={{ background: 'var(--green-dark, #0F2D5E)', borderRadius: 'var(--rl)', padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.4)', letterSpacing: '2px', marginBottom: 6 }}>
          BÚSQUEDA SEMÁNTICA · POWERED BY CLAUDE AI
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 14 }}>
          Describe el medicamento que buscas en lenguaje clínico natural
        </div>
        <div style={{ display: 'flex', gap: 0, background: '#fff', borderRadius: 'var(--r)', overflow: 'hidden' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder='Ej: "antihipertensivo para paciente con diabetes" o "antibiótico betalactámico oral"'
            style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 14px', fontSize: 13, fontFamily: 'var(--sans)', color: 'var(--tx)' }}
          />
          <button onClick={buscar} disabled={loading || !query.trim()} style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '0 22px', fontSize: 13, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'var(--sans)' }}>
            {loading ? '...' : '⟳ Buscar'}
          </button>
        </div>
        {/* Ejemplos */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {ejemplos.map(e => (
            <button key={e} onClick={() => { setQuery(e); }} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Intent interpretado */}
      {searched && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: 'var(--blue-bg)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 700 }}>Claude interpretó:</span>
          <span style={{ fontSize: 12, color: 'var(--tx2)' }}>{intent}</span>
          {terms.length > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {terms.slice(0, 4).map(t => (
                <span key={t} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, background: 'var(--bg3)', color: 'var(--tx3)', fontFamily: 'var(--mono)' }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resultados */}
      {searched && (
        results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', color: 'var(--tx4)' }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>💊</div>
            <div style={{ fontWeight: 600 }}>Sin resultados para esta búsqueda</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Intenta con términos más generales</div>
          </div>
        ) : (
          <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1.5px solid var(--bdr)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>{results.length} resultados relevantes</span>
              <span style={{ fontSize: 11, color: 'var(--tx4)', fontFamily: 'var(--mono)' }}>ordenados por relevancia semántica</span>
            </div>
            {results.map((m, i) => (
              <div key={m.docId} onClick={() => router.push(`/medicamentos/${m.docId}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--bdr)', cursor: 'pointer', transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>{m.nombre || m.vtm}</div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{m.vtm} · {m.conc} · {m.ff}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{m.laboratorio}</div>
                {m.atc && <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--tx4)', padding: '2px 6px', background: 'var(--bg3)', borderRadius: 4 }}>{m.atc}</span>}
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>Ver →</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
