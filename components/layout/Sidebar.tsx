'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CHAPS } from '@/lib/capitulos-tree';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [openCap, setOpenCap] = useState<string | null>(null);
  const [activeCap, setActiveCap] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const toggleCap = (id: string) => {
    setOpenCap(prev => prev === id ? null : id);
    setActiveCap(id);
  };

  const handleSub = (chapId: string, subId: string) => {
    setActiveSub(subId);
    router.push(`/capitulos/${chapId}`);
  };

  return (
    <aside style={{
      width: '280px',
      background: 'var(--bg2, #fff)',
      borderRight: '1.5px solid var(--bdr, #D0ECC6)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* LOGO */}
      <div style={{ background: 'var(--green, #3DDB18)', padding: '15px 14px 13px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
          <svg viewBox="0 0 26 14" fill="none" width="26" height="14" style={{ marginTop: '3px', flexShrink: 0 }}>
            <rect x="0" y="0" width="26" height="14" rx="7" fill="white" opacity="0.15"/>
            <path d="M13 0 Q7 0 3.5 3.5 Q0 5.5 0 7 Q0 8.5 3.5 10.5 Q7 14 13 14 Z" fill="white"/>
            <path d="M13 0 Q19 0 22.5 3.5 Q26 5.5 26 7 Q26 8.5 22.5 10.5 Q19 14 13 14 Z" fill="rgba(61,219,24,0.85)"/>
            <line x1="13" y1="0" x2="13" y2="14" stroke="white" strokeWidth="1.2" opacity="0.6"/>
            <rect x="0.6" y="0.6" width="24.8" height="12.8" rx="6.4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
          </svg>
          <div>
            <div style={{ fontWeight: 800, fontSize: '26px', color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>VFE</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,.9)', marginTop: '3px' }}>Gestión de Medicamentos</div>
          </div>
        </div>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.6)', fontFamily: "'DM Mono', monospace", letterSpacing: '1.5px', marginTop: '4px' }}>
          EL LIBRO VERDE · ECUADOR
        </div>
        {user && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
              </div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.85)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
            </div>
            <button onClick={handleLogout}
              style={{ fontSize: '11px', color: 'rgba(255,255,255,.7)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}>
              Salir
            </button>
          </div>
        )}
        {!user && (
          <Link href="/login" style={{
            display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px',
            fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,.9)',
            background: 'rgba(255,255,255,.2)', borderRadius: '6px', padding: '4px 10px',
            border: '1px solid rgba(255,255,255,.3)', textDecoration: 'none'
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12z"/></svg>
            VISITANTE &nbsp;<strong>ENTRAR</strong>
          </Link>
        )}
      </div>

      {/* CHAPTER LIST HEADER */}
      <div style={{ padding: '6px 8px 2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '9px', fontFamily: "'DM Mono', monospace", color: 'var(--tx4, #B0CFA8)', letterSpacing: '1px' }}>CAPÍTULOS</span>
        <Link href="/medicamentos/nuevo" style={{
          background: 'var(--green, #3DDB18)', color: '#fff', borderRadius: '5px',
          padding: '2px 8px', fontSize: '11px', fontWeight: 700, textDecoration: 'none'
        }}>＋ Nuevo</Link>
      </div>

      {/* CHAPTERS */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {CHAPS.map(cap => (
          <div key={cap.id}>
            <div
              onClick={() => toggleCap(cap.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '8px 14px', fontSize: '13.5px', fontWeight: 600,
                color: activeCap === cap.id ? 'var(--gdp, #1A6B08)' : 'var(--tx2, #3A5C30)',
                cursor: 'pointer', transition: 'all .12s',
                borderLeft: `3px solid ${activeCap === cap.id ? 'var(--green, #3DDB18)' : 'transparent'}`,
                background: activeCap === cap.id ? 'rgba(61,219,24,.10)' : 'transparent',
              }}
              onMouseEnter={e => { if (activeCap !== cap.id) (e.currentTarget as HTMLElement).style.background = 'var(--bg3, #EDF7E8)'; }}
              onMouseLeave={e => { if (activeCap !== cap.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--tx4, #B0CFA8)', minWidth: '22px', flexShrink: 0 }}>
                {cap.n}
              </span>
              <span style={{ flex: 1, lineHeight: 1.3, fontSize: '12px' }}>{cap.name}</span>
              <span style={{
                marginLeft: 'auto', fontSize: '10px', color: 'var(--tx4)',
                transition: 'transform .2s',
                transform: openCap === cap.id ? 'rotate(90deg)' : 'none',
              }}>▶</span>
            </div>

            {/* SUBCAPÍTULOS */}
            {openCap === cap.id && cap.subs.length > 0 && (
              <div style={{ background: 'var(--bg3, #EDF7E8)' }}>
                {cap.subs.map(sub => (
                  <div key={sub.id}
                    onClick={() => handleSub(cap.id, sub.id)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      padding: '6px 14px 6px 34px',
                      fontSize: '12.5px', color: activeSub === sub.id ? 'var(--gdp)' : 'var(--tx2)',
                      cursor: 'pointer', transition: 'all .12s',
                      borderLeft: `3px solid ${activeSub === sub.id ? 'var(--green)' : 'transparent'}`,
                      background: activeSub === sub.id ? 'rgba(61,219,24,.10)' : 'transparent',
                      fontWeight: activeSub === sub.id ? 600 : 400,
                    }}>
                    {sub.name}
                  </div>
                ))}
                <div
                  onClick={() => router.push(`/capitulos/cap.id`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 14px 5px 34px', fontSize: '12px', color: 'var(--tx3)', cursor: 'pointer' }}>
                  Ver todos →
                </div>
              </div>
            )}

            {openCap === cap.id && cap.subs.length === 0 && (
              <div onClick={() => router.push(`/capitulos/cap.id`)}
                style={{ padding: '5px 14px 5px 34px', fontSize: '12px', color: 'var(--tx3)', cursor: 'pointer', background: 'var(--bg3)' }}>
                Ver medicamentos →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FOOTER NAV */}
      <div style={{ padding: '9px 10px', borderTop: '1.5px solid var(--bdr)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {[
          { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
          { href: '/medicamentos', icon: '📋', label: 'Base de datos' },
          { href: '/arbol', icon: '🌳', label: 'Árbol de medicamentos' },
          { href: '/avances', icon: '📊', label: 'Panel de avances' },
          { href: '/medicamentos/nuevo', icon: '➕', label: 'Nuevo medicamento' },
          { href: '/io', icon: '📦', label: 'Importar / Exportar' },
          { href: '/audit', icon: '🔍', label: 'Audit log' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 10px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '12.5px', fontWeight: 600,
            color: 'var(--tx2)', border: '1.5px solid var(--bdr)',
            background: 'var(--bg2)', transition: 'all .12s', textDecoration: 'none'
          }}>
            {item.icon} {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
