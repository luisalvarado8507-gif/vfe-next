'use client';
import { useEffect, useState } from 'react';
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

function BaseDatosContent() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroGenerico, setFiltroGenerico] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [allLoaded, setAllLoaded] = useState<Medicamento[]>([]);
  const { getToken, user, isEditor, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const capitulo = searchParams.get('capitulo');
  const capNombre = capitulo ? CAPITULOS.find(c => c.id === capitulo)?.name : null;

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    cargar();
    setBusqueda('');
    setPagina(1);
  }, [authLoading, user, capitulo]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (!busqueda.trim()) { setPagina(1); return; }
    const timer = setTimeout(() => buscarEnAPI(busqueda), 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const cargar = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const params = new URLSearchParams({ limit: '500' });
      if (capitulo) params.set('capitulo', capitulo);
      const res = await fetch(`/api/medicamentos?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const meds = data.medicamentos || [];
      setMedicamentos(meds);
      setAllLoaded(meds);
      setNextCursor(data.nextCursor || null);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const buscarEnAPI = async (q: string) => {
    setBuscando(true);
    try {
      const token = await getToken();
      if (!token) return;
      const params = new URLSearchParams({ q });
      if (capitulo) params.set('capitulo', capitulo);
      const res = await fetch(`/api/busqueda?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMedicamentos(data.medicamentos || []);
      setPagina(1);
    } catch(e) { console.error(e); }
    finally { setBuscando(false); }
  };

  // Filtros
  const filtrados = medicamentos.filter(m => {
    if (filtroEstado !== 'todos' && m.estado !== filtroEstado) return false;
    if (filtroGenerico === 'si' && m.generico !== 'Sí') return false;
    if (filtroGenerico === 'no' && m.generico !== 'No') return false;
    return true;
  });

  const totalPags = Math.ceil(filtrados.length / PER_PAGE);
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

  const limpiarFiltros = () => { setFiltroEstado('todos'); setFiltroGenerico('todos'); setBusqueda(''); setPagina(1); };

  if (authLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'var(--tx4)' }}>Cargando...</p>
    </div>
  );

  const btnFiltro = (activo: boolean): React.CSSProperties => ({
    padding: '4px 12px', borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
    border: `1.5px solid ${activo ? 'var(--green)' : 'var(--bdr)'}`,
    background: activo ? 'var(--green)' : 'var(--bg2)',
    color: activo ? '#fff' : 'var(--tx2)',
  });

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
            style={{ width:'100%', border:'1.5px solid var(--bdr)', borderRadius:10, padding:'11px 16px', fontSize:14, outline:'none', background:'var(--bg2)', boxShadow:'var(--shm)', fontFamily:'var(--sans)', color:'var(--tx)' }}
            placeholder="Buscar medicamento, principio activo, laboratorio, código ATC…"
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
          {buscando && <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'var(--tx4)' }}>Buscando...</span>}
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'var(--tx3)' }}>ESTADO:</span>
            {[['todos','Todos'],['autorizado','Autorizado'],['suspendido','Suspendido'],['retirado','Retirado'],['arcsa_pendiente','ARCSA Pendiente']].map(([val,lbl]) => (
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
            <span style={{ fontSize:12, color:'var(--tx3)', fontFamily:'var(--mono)' }}>{filtrados.length} registros</span>
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
                {loading || buscando ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:48, color:'var(--tx4)' }}>Cargando...</td></tr>
                ) : paginados.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:48, color:'var(--tx4)' }}>No hay medicamentos</td></tr>
                ) : paginados.map((m, i) => {
                  const id = m.docId || m.id;
                  const amp = m.amp || m.nombre || '';
                  const vmp = m.vmp || '';
                  return (
                    <tr key={id} style={{ borderBottom:'1px solid var(--bdr)', background: i%2===0 ? '#fff' : 'var(--bg3)' }}>
                      <td style={{ padding:'10px 14px', fontWeight:700, color:'var(--tx)' }}>{m.vtm}</td>
                      <td style={{ padding:'10px 14px', color:'var(--tx2)', maxWidth:240 }}>
                        <div style={{ fontWeight:500 }}>{amp || <span style={{ color:'var(--tx4)', fontStyle:'italic', fontSize:11 }}>—</span>}</div>
                        {m.conc && <span style={{ fontSize:11, color:'var(--tx3)', fontFamily:'var(--mono)' }}>{m.conc}</span>}
                      </td>
                      <td style={{ padding:'10px 14px', color:'var(--tx2)' }}>{m.laboratorio}</td>
                      <td style={{ padding:'10px 14px', color:'var(--tx3)', fontSize:12, fontFamily:'var(--mono)', maxWidth:200 }}>
                        <span style={{ color:'var(--green)' }}>{vmp || '—'}</span>
                      </td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, fontSize:11.5, fontWeight:600, background: m.estado==='autorizado' ? '#dcfce7' : m.estado==='arcsa_pendiente' ? '#ffedd5' : '#fee2e2', color: estadoDot(m.estado) }}>
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
                              style={{ padding:'3px 10px', borderRadius:6, fontSize:12, fontWeight:600, border:'1.5px solid var(--bdr)', color:'var(--blue)', background:'var(--bg2)', textDecoration:'none' }}>
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

          {/* Paginación */}
          {totalPags > 1 && (
            <div style={{ padding:'12px 16px', borderTop:'1.5px solid var(--bdr)', display:'flex', alignItems:'center', justifyContent:'center', gap:4, flexWrap:'wrap' }}>
              <span style={{ fontSize:12, color:'var(--tx3)', marginRight:8 }}>Pág.</span>
              {Array.from({ length: Math.min(totalPags, 20) }, (_, i) => i+1).map(p => (
                <button key={p} onClick={() => setPagina(p)}
                  style={{ width:30, height:30, borderRadius:6, border:'1.5px solid var(--bdr)', fontSize:12.5, fontWeight:600, cursor:'pointer',
                    background: pagina===p ? 'var(--green)' : 'var(--bg2)',
                    color: pagina===p ? '#fff' : 'var(--tx2)',
                  }}>{p}</button>
              ))}
              {totalPags > 20 && <span style={{ fontSize:12, color:'var(--tx3)' }}>· {totalPags}</span>}
            </div>
          )}
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
