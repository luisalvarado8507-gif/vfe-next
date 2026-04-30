'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { CAPITULOS } from '@/lib/capitulos';
import { Suspense } from 'react';

interface Medicamento {
  id: string;
  docId: string;
  vtm: string;
  laboratorio: string;
  ff: string;
  conc: string;
  estado: string;
  amp?: string;
  vmp?: string;
  generico?: string;
  nombre?: string;
}

const PER_PAGE = 12;

// Orden de estados: autorizados primero, arcsa_pendiente al final
const estadoOrden = (estado: string) => {
  if (estado === 'autorizado') return 0;
  if (estado === 'suspendido') return 1;
  if (estado === 'retirado') return 2;
  if (estado === 'arcsa_pendiente') return 4;
  return 3;
};

function BaseDatosContent() {
  const [todos, setTodos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroGenerico, setFiltroGenerico] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hayMas, setHayMas] = useState(true);
  const { getToken, user, isEditor, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const capitulo = searchParams.get('capitulo');
  const capNombre = capitulo ? CAPITULOS.find(c => c.id === capitulo)?.name : null;

  // Carga todos los medicamentos en lotes de 500
  const cargarTodos = useCallback(async () => {
    setLoading(true);
    setCargando(true);
    try {
      const token = await getToken();
      if (!token) return;
      let cursorActual: string | null = null;
      let acumulado: Medicamento[] = [];
      let intentos = 0;
      while (intentos < 50) { // max 50 lotes = 25.000 registros
        intentos++;
        const params = new URLSearchParams({ limit: '500' });
        if (cursorActual) params.set('cursor', cursorActual);
        if (capitulo) params.set('capitulo', capitulo);
        const res = await fetch(`/api/medicamentos?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const meds: Medicamento[] = data.medicamentos || [];
        acumulado = [...acumulado, ...meds];
        setTodos([...acumulado]); // actualizar UI progresivamente
        setLoading(false);
        cursorActual = data.nextCursor || null;
        if (!cursorActual) break; // no hay más
      }
      setHayMas(false);
    } catch(e) { console.error(e); }
    finally { setCargando(false); setLoading(false); }
  }, [getToken, capitulo]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    setTodos([]);
    setCursor(null);
    setHayMas(true);
    setBusqueda('');
    setPagina(1);
    cargarTodos();
  }, [authLoading, user, capitulo]);

  // Búsqueda
  const [busquedaResults, setBusquedaResults] = useState<Medicamento[] | null>(null);
  useEffect(() => {
    if (!busqueda.trim()) { setBusquedaResults(null); setPagina(1); return; }
    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`/api/busqueda?q=${encodeURIComponent(busqueda)}${capitulo ? `&capitulo=${capitulo}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setBusquedaResults(data.medicamentos || []);
        setPagina(1);
      } catch(e) { console.error(e); }
      finally { setBuscando(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // Fuente de datos: búsqueda o todos
  const fuente = busquedaResults ?? todos;

  // Ordenar: autorizados primero, arcsa_pendiente al final
  const ordenados = [...fuente].sort((a, b) => {
    const est = estadoOrden(a.estado) - estadoOrden(b.estado);
    if (est !== 0) return est;
    return ((b as any).hasPrices ? 1 : 0) - ((a as any).hasPrices ? 1 : 0);
  });

  // Filtros
  const filtrados = ordenados.filter(m => {
    if (filtroEstado !== 'todos' && m.estado !== filtroEstado) return false;
    if (filtroGenerico === 'si' && m.generico !== 'Sí') return false;
    if (filtroGenerico === 'no' && m.generico !== 'No') return false;
    return true;
  });

  const totalPags = Math.max(1, Math.ceil(filtrados.length / PER_PAGE));
  const paginados = filtrados.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE);

  const estadoDot = (estado: string) => {
    switch(estado) {
      case 'autorizado': return '#16a34a';
      case 'suspendido': return '#D97706';
      case 'retirado': return '#DC2626';
      case 'arcsa_pendiente': return '#EA580C';
      default: return '#9CA3AF';
    }
  };
  const estadoLabel = (estado: string) => {
    if (estado === 'arcsa_pendiente') return 'ARCSA - No revisado';
    return estado || 'pendiente';
  };
  const estadoBg = (estado: string) => {
    switch(estado) {
      case 'autorizado': return '#dcfce7';
      case 'suspendido': return '#fef9c3';
      case 'retirado': return '#fee2e2';
      case 'arcsa_pendiente': return '#ffedd5';
      default: return '#f3f4f6';
    }
  };

  const limpiarFiltros = () => { setFiltroEstado('todos'); setFiltroGenerico('todos'); setBusqueda(''); setPagina(1); };

  const btnFiltro = (activo: boolean): React.CSSProperties => ({
    padding: '4px 12px', borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
    border: `1.5px solid ${activo ? 'var(--green)' : 'var(--bdr)'}`,
    background: activo ? 'var(--green)' : 'var(--bg2)',
    color: activo ? '#fff' : 'var(--tx2)',
  });

  if (authLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'var(--tx4)' }}>Cargando...</p>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', fontFamily:'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex:1, marginLeft:280, padding:'28px 32px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'var(--bg3)', border:'1.5px solid var(--bdr)', borderRadius:8, fontSize:13, fontWeight:600, color:'var(--tx2)', textDecoration:'none' }}>
              🏠 Inicio
            </Link>
            <span style={{ fontSize:15, fontWeight:700, color:'var(--tx)' }}>{capNombre || 'Base de datos'}</span>
          </div>
          <Link href="/medicamentos/nuevo"
            style={{ background:'var(--green)', color:'#fff', padding:'7px 18px', borderRadius:8, fontSize:13, fontWeight:700, textDecoration:'none' }}>
            + Nuevo
          </Link>
        </div>

        {/* Buscador */}
        <div style={{ position:'relative', marginBottom:16 }}>
          <input
            style={{ width:'100%', border:'1.5px solid var(--bdr)', borderRadius:10, padding:'11px 16px', fontSize:14, outline:'none', background:'var(--bg2)', boxShadow:'var(--shm)', fontFamily:'var(--sans)', color:'var(--tx)', boxSizing:'border-box' }}
            placeholder="Buscar medicamento, principio activo, laboratorio, código ATC…"
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
          {buscando && <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'var(--tx4)' }}>Buscando...</span>}
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'var(--tx3)' }}>ESTADO:</span>
            {[['todos','Todos'],['autorizado','Autorizado'],['suspendido','Suspendido'],['retirado','Retirado']].map(([val,lbl]) => (
              <button key={val} onClick={() => { setFiltroEstado(val); setPagina(1); }} style={btnFiltro(filtroEstado===val)}>{lbl}</button>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'var(--tx3)' }}>GENÉRICO:</span>
            {[['todos','Todos'],['si','Sí'],['no','No']].map(([val,lbl]) => (
              <button key={val} onClick={() => { setFiltroGenerico(val); setPagina(1); }} style={btnFiltro(filtroGenerico===val)}>{lbl}</button>
            ))}
          </div>
          <button onClick={limpiarFiltros} style={{ marginLeft:'auto', padding:'4px 12px', borderRadius:6, fontSize:12.5, fontWeight:600, cursor:'pointer', border:'1.5px solid var(--bdr)', background:'var(--bg2)', color:'var(--tx3)' }}>
            ✕ Limpiar
          </button>
        </div>

        {/* Tabla */}
        <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid var(--bdr)', overflow:'hidden', boxShadow:'var(--sh)' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1.5px solid var(--bdr)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'var(--tx)' }}>Medicamentos</span>
            <span style={{ fontSize:12, color:'var(--tx3)', fontFamily:'var(--mono)' }}>
              {filtrados.length} registros
              {cargando && <span style={{ color:'var(--green)', marginLeft:8 }}>· cargando más...</span>}
            </span>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'var(--bg3)' }}>
                  {['VTM / DCI ↕','AMP (Comercial) ↕','LABORATORIO ↕','VMP ↕','ESTADO ↕','GENÉRICO','ACCIONES'].map(h => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--tx3)', letterSpacing:'.5px', fontFamily:'var(--mono)', whiteSpace:'nowrap', borderBottom:'1.5px solid var(--bdr)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:48, color:'var(--tx4)' }}>Cargando medicamentos...</td></tr>
                ) : paginados.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:48, color:'var(--tx4)' }}>No hay medicamentos</td></tr>
                ) : paginados.map((m, i) => {
                  const id = m.docId || m.id;
                  const amp = m.amp || m.nombre || '';
                  return (
                    <tr key={id} style={{ borderBottom:'1px solid var(--bdr)', background: i%2===0 ? '#fff' : 'var(--bg3)' }}>
                      <td style={{ padding:'10px 14px', fontWeight:700, color:'var(--tx)' }}>{m.vtm}</td>
                      <td style={{ padding:'10px 14px', color:'var(--tx2)', maxWidth:220 }}>
                        <div style={{ fontWeight:500 }}>{amp || <span style={{ color:'var(--tx4)', fontStyle:'italic', fontSize:11 }}>—</span>}</div>
                        {m.conc && <span style={{ fontSize:11, color:'var(--tx3)', fontFamily:'var(--mono)' }}>{m.conc}</span>}
                      </td>
                      <td style={{ padding:'10px 14px', color:'var(--tx2)' }}>{m.laboratorio}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, fontFamily:'var(--mono)', maxWidth:180 }}>
                        <span style={{ color:'var(--green)' }}>{m.vmp || '—'}</span>
                      </td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, fontSize:11.5, fontWeight:600, background:estadoBg(m.estado), color:estadoDot(m.estado) }}>
                          <span style={{ width:6, height:6, borderRadius:'50%', background:estadoDot(m.estado), flexShrink:0 }}></span>
                          {estadoLabel(m.estado)}
                        </span>
                      </td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ fontSize:12, color: m.generico==='Sí' ? 'var(--green)' : 'var(--tx3)', fontWeight:600 }}>
                          • {m.generico || '—'}
                        </span>
                      </td>
                      <td style={{ padding:'10px 14px' }}>
                        <div style={{ display:'flex', gap:4 }}>
                          <Link href={`/medicamentos/${id}`}
                            style={{ padding:'3px 10px', borderRadius:6, fontSize:12, fontWeight:600, border:'1.5px solid var(--bdr)', color:'var(--gdp)', background:'var(--bg2)', textDecoration:'none' }}>
                            Ver
                          </Link>
                          {isEditor && (
                            <Link href={`/medicamentos/${id}/editar`}
                              style={{ padding:'3px 10px', borderRadius:6, fontSize:12, fontWeight:600, border:'1.5px solid var(--bdr)', color:'var(--blue,#2563EB)', background:'var(--bg2)', textDecoration:'none' }}>
                              Editar
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación inteligente */}
          {totalPags > 1 && (() => {
            const delta = 2;
            const pages: (number|string)[] = [];
            pages.push(1);
            if (pagina - delta > 2) pages.push('...');
            for (let p = Math.max(2, pagina-delta); p <= Math.min(totalPags-1, pagina+delta); p++) pages.push(p);
            if (pagina + delta < totalPags - 1) pages.push('...');
            if (totalPags > 1) pages.push(totalPags);
            return (
              <div style={{ padding:'12px 16px', borderTop:'1.5px solid var(--bdr)', display:'flex', alignItems:'center', justifyContent:'center', gap:4, flexWrap:'wrap' }}>
                <button onClick={() => { setPagina(p => Math.max(1,p-1)); window.scrollTo(0,0); }} disabled={pagina===1}
                  style={{ padding:'4px 10px', borderRadius:6, border:'1.5px solid var(--bdr)', fontSize:13, fontWeight:600, cursor:'pointer', background:'var(--bg2)', color: pagina===1 ? 'var(--tx4)' : 'var(--tx2)', opacity: pagina===1?0.4:1 }}>‹</button>
                {pages.map((p, i) => typeof p === 'string'
                  ? <span key={'dot'+i} style={{ fontSize:13, color:'var(--tx3)', padding:'0 2px' }}>···</span>
                  : <button key={p} onClick={() => { setPagina(p as number); window.scrollTo(0,0); }}
                      style={{ minWidth:30, height:30, borderRadius:6, border:'1.5px solid var(--bdr)', fontSize:12.5, fontWeight:600, cursor:'pointer',
                        background: pagina===p ? 'var(--green)' : 'var(--bg2)',
                        color: pagina===p ? '#fff' : 'var(--tx2)',
                        padding:'0 6px',
                      }}>{p}</button>
                )}
                <button onClick={() => { setPagina(p => Math.min(totalPags,p+1)); window.scrollTo(0,0); }} disabled={pagina===totalPags}
                  style={{ padding:'4px 10px', borderRadius:6, border:'1.5px solid var(--bdr)', fontSize:13, fontWeight:600, cursor:'pointer', background:'var(--bg2)', color: pagina===totalPags ? 'var(--tx4)' : 'var(--tx2)', opacity: pagina===totalPags?0.4:1 }}>›</button>
                <span style={{ fontSize:12, color:'var(--tx3)', marginLeft:8 }}>Pág. {pagina} de {totalPags}</span>
                <input type='number' min={1} max={totalPags} value={pagina}
                  onChange={e => { const v=parseInt(e.target.value); if(v>=1&&v<=totalPags){setPagina(v);window.scrollTo(0,0);}}}
                  style={{ width:60, border:'1.5px solid var(--bdr)', borderRadius:6, padding:'3px 8px', fontSize:12.5, textAlign:'center', outline:'none', marginLeft:4 }} />
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
}

export default function BaseDatos() {
  return (
    <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--tx4)' }}>Cargando...</div>}>
      <BaseDatosContent />
    </Suspense>
  );
}
