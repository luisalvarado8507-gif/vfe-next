'use client';
import { useState, useRef, useEffect } from 'react';
import { ATC_DB } from '@/lib/atc-db';

interface Props {
  value: string;
  onChange: (code: string, label: string) => void;
  placeholder?: string;
}

export default function AtcAutocomplete({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<{code: string; lbl: string; inn: string}[]>([]);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const buscar = (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    const ql = q.toLowerCase();
    const matches = Object.entries(ATC_DB)
      .filter(([code, v]) =>
        code.toLowerCase().startsWith(ql) ||
        v.lbl.toLowerCase().includes(ql) ||
        v.inn.toLowerCase().includes(ql)
      )
      .slice(0, 12)
      .map(([code, v]) => ({ code, lbl: v.lbl, inn: v.inn }));
    setResults(matches);
    setOpen(matches.length > 0);
    setIdx(-1);
  };

  const seleccionar = (code: string, lbl: string) => {
    setQuery(code);
    onChange(code, lbl);
    setOpen(false);
    setResults([]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, -1)); }
    if (e.key === 'Enter' && idx >= 0) { e.preventDefault(); seleccionar(results[idx].code, results[idx].lbl); }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <input
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
        placeholder={placeholder || 'Ej. C07AB03 o paracetamol...'}
        value={query}
        onChange={e => buscar(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => query && results.length > 0 && setOpen(true)}
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto">
          {results.map((r, i) => (
            <button key={r.code} type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 transition flex items-center gap-3 ${i === idx ? 'bg-green-50' : ''}`}
              onMouseDown={() => seleccionar(r.code, r.lbl)}>
              <span className="font-mono text-xs font-bold text-[#2d6a2d] w-20 shrink-0">{r.code}</span>
              <span className="text-gray-700 truncate">{r.lbl}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
