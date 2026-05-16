'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';

interface Medicamento {
  docId: string; id: string; vtm: string; nombre: string;
  conc: string; ff: string; laboratorio: string; estado: string;
  rs: string; cum: string; atc: string; esCombo: boolean; comboData: any;
}

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  autorizado:      { bg: '#dcfce7', color: '#166534', label: 'Autorizado' },
  suspendido:      { bg: '#fef9c3', color: '#854d0e', label: 'Suspendido' },
  retirado:        { bg: '#fee2e2', color: '#991b1b', label: 'Retirado' },
  arcsa_pendiente: { bg: '#eff6ff', color: '#1d4ed8', label: 'ARCSA pendiente' },
};

// Calcular score de completitud ISO IDMP por medicamento
function calcCompletitud(m: Medicamento): number {
  const vtm = String((m as any).vtm||'').trim();
  const ff = String((m as any).ff||'').trim();
  const atc = String((m as any).atc||'').trim();
  const atclbl = String((m as any).atclbl||'').trim();
  const cnmb = String((m as any).cnmb||'').trim();
  const SALES = /\b(fumarato|hemifumarato|maleato|besilato|cilexetilo|cilexetil|mesilato|tartrato|sulfato|clorhidrato|hidrocloruro|acetato|propionato|decanoato|enantato|pamoato|estearato|valerato|succinato|gluconato|lactato|citrato|nitrato|bromhidrato|tosilato|fosfato|monohidrato|dihidrato|trihidrato)\b/i;
  const BASURA_TEXTO = /^\d|^[a-z]\)|^[a-z]\s|cada\s+(capsula|comprimido|tableta|ampolla|frasco|sobre)|comprimido\s+con|tableta\s+recubierta|cubierta\s+pelicular|\uFFFD/i;
  const TRUNCADO = /\([^)]*$|eq\. a\s*$/i;
  const conc = String((m as any).conc||'').trim();
  const esCombo = (m as any).esCombo === true;
  const atcValido = !!atc && /^[A-Z][0-9]{2}[A-Z]{2}([0-9]{2})?$/.test(atc);
  const fp = (m as any).farmPrices;
  const tienePrecio = !!(fp && typeof fp === 'object' && Object.values(fp).some((v: any) => typeof v === 'number' && v > 0));
  const checks = [
    !!vtm,
    !!vtm && !BASURA_TEXTO.test(vtm),
    !!vtm && !TRUNCADO.test(vtm),
    !!vtm && !SALES.test(vtm),
    !!vtm && vtm === vtm.toLowerCase(),
    !!conc,
    !!conc && (!/[/+]/.test(conc) || esCombo),
    !!(m as any).ff,
    !!(m as any).vias,
    !!(m as any).laboratorio,
    !!(m as any).rs,
    !!atclbl && !/\b(therapy|agents|drugs|inhibitors|blockers|preparations)\b/i.test(atclbl),
    !!cnmb,
  ];
  const puntosObtenidos = checks.filter(Boolean).length + (atcValido ? 3 : 0) + (tienePrecio ? 5 : 0);
  const puntosMaximos = checks.length + 3 + 5;
  const score = Math.round((puntosObtenidos / puntosMaximos) * 100);
  return score;
}

function getVtmLabel(m: any): string {
  if (m.esCombo && m.comboData?.pas?.length) return m.comboData.pas.join(' + ');
  return m.vtm || '';
}

export default function RevisionPage() {
  const router = useRouter();
  const { getToken, isEditor, loading: authLoading } = useAuth();
  const [meds, setMeds] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('arcsa_pendiente');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const PER_PAGE = 50;

  const cargar = useCallback(async () => {
    if (authLoading || !isEditor) return;
    setLoading(true);
    try {
      const token = await getToken();
      let all: Medicamento[] = [];
      let cursor: string | null = null;
      while (true) {
        const params = new URLSearchParams({ limit: '500' });
        if (filtroEstado !== 'todos') params.set('estado', filtroEstado);
        if (cursor) params.set('cursor', cursor);
        const res = await fetch(`/api/medicamentos?${params}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        all = all.concat(data.medicamentos || []);
        cursor = data.nextCursor;
        if (!cursor) break;
      }
      setMeds(all);
      setPagina(1);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [authLoading, isEditor, filtroEstado, getToken]);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarEstado = async (docId: string, nuevoEstado: string) => {
    const token = await getToken();
    const med = meds.find(m => m.docId === docId);
    if (!med) return;
    await fetch('/api/medicamentos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...med, id: docId, estado: nuevoEstado }),
    });
    setMeds(prev => prev.filter(m => m.docId !== docId));
  };

  const filtrados = meds.filter(m => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (m.vtm||'').toLowerCase().includes(q)||(m.nombre||'').toLowerCase().includes(q)||(m.laboratorio||'').toLowerCase().includes(q)||(m.rs||'').toLowerCase().includes(q);
  });

  const ordenados = [...filtrados].sort((a, b) => calcCompletitud(b as any) - calcCompletitud(a as any));
  const totalPags = Math.max(1, Math.ceil(ordenados.length / PER_PAGE));
  const paginados = ordenados.slice((pagina-1)*PER_PAGE, pagina*PER_PAGE);
  const chip = (active: boolean) => ({ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: active ? 'var(--green)' : 'var(--bg2)', color: active ? '#fff' : 'var(--tx3)' } as React.CSSProperties);

  if (!authLoading && !isEditor) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex' }}>
      <Sidebar />
      <main style={{ flex:1, marginLeft:280, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ color:'var(--tx3)' }}>Acceso restringido a editores.</p>
      </main>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', fontFamily:'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex:1, marginLeft:280, padding:'28px 32px' }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--tx4)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>REVISIÓN · SOLO EDITORES</div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--tx)', margin:0 }}>Medicamentos pendientes de revisión</h1>
          <p style={{ fontSize:13, color:'var(--tx3)', marginTop:4 }}>Revisa, corrige y autoriza los medicamentos antes de que aparezcan en la base de datos pública.</p>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
          {[['arcsa_pendiente','ARCSA pendiente'],['suspendido','Suspendidos'],['retirado','Retirados'],['todos','Todos']].map(([val,lbl]) => (
            <button key={val} style={chip(filtroEstado===val)} onClick={() => { setFiltroEstado(val); setPagina(1); }}>{lbl}</button>
          ))}
          <input placeholder="Buscar..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
            style={{ marginLeft:'auto', padding:'6px 12px', borderRadius:8, border:'1px solid var(--bdr)', background:'var(--bg)', color:'var(--tx)', fontSize:13, width:220 }} />
        </div>
        <div style={{ fontSize:12, color:'var(--tx4)', marginBottom:12 }}>{loading ? 'Cargando...' : `${filtrados.length} medicamentos`}</div>
        <div style={{ background:'var(--bg2)', border:'1px solid var(--bdr)', borderRadius:'var(--r)', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--bdr)' }}>
                {['%','Nombre comercial','Principio activo','Concentración · FF','Laboratorio','RS','Estado','Acciones'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--tx4)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginados.map((m, i) => {
                const est = ESTADO_STYLES[m.estado] || { bg:'var(--bg3)', color:'var(--tx3)', label:m.estado };
                return (
                  <tr key={m.docId} style={{ borderTop:i===0?'none':'1px solid var(--bdr)', background:i%2===0?'var(--bg)':'var(--bg2)' }}>
                    <td style={{ padding:'10px 14px', fontFamily:'var(--mono)', fontSize:11, fontWeight:700, color: calcCompletitud(m)>=80?'#166534':calcCompletitud(m)>=50?'#854d0e':'#991b1b' }}>{calcCompletitud(m)}%</td>
                    <td style={{ padding:'10px 14px', fontWeight:600, color:'var(--tx)' }}>{m.nombre||m.vtm||'—'}</td>
                    <td style={{ padding:'10px 14px', color:'var(--tx2)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{getVtmLabel(m)||'—'}</td>
                    <td style={{ padding:'10px 14px', color:'var(--tx3)', fontFamily:'var(--mono)', fontSize:12 }}>{m.conc||'—'}</td>
                    <td style={{ padding:'10px 14px', color:'var(--tx3)', fontSize:12 }}>{m.laboratorio||'—'}</td>
                    <td style={{ padding:'10px 14px', color:'var(--tx4)', fontFamily:'var(--mono)', fontSize:11 }}>{m.rs||'—'}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:600, background:est.bg, color:est.color }}>{est.label}</span>
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => router.push(`/medicamentos/${m.docId}`)} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid var(--bdr)', background:'var(--bg)', color:'var(--tx2)', fontSize:12, cursor:'pointer' }}>Ver</button>
                        <button onClick={() => router.push(`/medicamentos/${m.docId}/editar`)} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid var(--bdr)', background:'var(--bg)', color:'var(--tx2)', fontSize:12, cursor:'pointer' }}>Editar</button>
                        <button onClick={() => cambiarEstado(m.docId, 'autorizado')} style={{ padding:'4px 10px', borderRadius:6, border:'none', background:'#dcfce7', color:'#166534', fontSize:12, fontWeight:600, cursor:'pointer' }}>✓ Autorizar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && paginados.length===0 && (
                <tr><td colSpan={7} style={{ padding:48, textAlign:'center', color:'var(--tx4)' }}>No hay medicamentos en este estado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPags > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:16 }}>
            <button onClick={() => setPagina(p => Math.max(1,p-1))} disabled={pagina===1} style={{ padding:'6px 14px', borderRadius:8, border:'1px solid var(--bdr)', background:'var(--bg)', color:'var(--tx2)', cursor:'pointer', fontSize:13 }}>← Anterior</button>
            <span style={{ padding:'6px 14px', fontSize:13, color:'var(--tx3)' }}>{pagina} / {totalPags}</span>
            <button onClick={() => setPagina(p => Math.min(totalPags,p+1))} disabled={pagina===totalPags} style={{ padding:'6px 14px', borderRadius:8, border:'1px solid var(--bdr)', background:'var(--bg)', color:'var(--tx2)', cursor:'pointer', fontSize:13 }}>Siguiente →</button>
          </div>
        )}
      </main>
    </div>
  );
}
