'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CHAPS } from '@/lib/capitulos-tree';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const capFromUrl = pathname?.match(/\/capitulos\/(c\w+)/)?.[1] || null;
  const [openCap, setOpenCap] = useState<string | null>(capFromUrl);
  const [activeCap, setActiveCap] = useState<string | null>(capFromUrl);
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
    router.push(`/capitulos/${chapId}?sub=${subId}`);
  };

  const isActive = (href: string) => pathname === href;

  return (
    <aside style={{
      width: '272px',
      background: 'var(--green-dark, #1B4332)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      overflow: 'hidden',
      fontFamily: 'var(--sans)',
      zIndex: 100,
    }}>

      {/* ── LOGO ── */}
      <div style={{ padding: '18px 16px 14px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg viewBox="0 0 26 14" fill="none" width="22" height="12">
              <rect x="0" y="0" width="26" height="14" rx="7" fill="white" opacity="0.2"/>
              <path d="M13 0 Q7 0 3.5 3.5 Q0 5.5 0 7 Q0 8.5 3.5 10.5 Q7 14 13 14 Z" fill="white"/>
              <path d="M13 0 Q19 0 22.5 3.5 Q26 5.5 26 7 Q26 8.5 22.5 10.5 Q19 14 13 14 Z" fill="rgba(116,198,157,0.9)"/>
              <line x1="13" y1="0" x2="13" y2="14" stroke="white" strokeWidth="1.2" opacity="0.5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "22px", color: "#fff", letterSpacing: "-0.5px", lineHeight: 1 }}>SIMI</div>
            <div style={{ fontSize: '10px', fontWeight: 500, color: 'rgba(255,255,255,.55)', marginTop: '2px', fontFamily: 'var(--mono)', letterSpacing: '1.2px' }}>
              MEDICAMENTOS · ECUADOR
            </div>
          </div>
        </div>

        {/* Usuario */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(255,255,255,.08)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--green-light, #74C69D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--green-dark, #1B4332)', flexShrink: 0 }}>
                {(user.email || '?')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.8)', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
            </div>
            <button onClick={handleLogout} style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.9)') }
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.5)')}>
              Salir
            </button>
          </div>
        ) : (
          <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,.08)', borderRadius: '8px', textDecoration: 'none', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.13)') }
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.08)')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,255,255,.7)"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12z"/></svg>
              </div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.6)' }}>Visitante</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green-light, #74C69D)' }}>Entrar →</span>
          </Link>
        )}
      </div>

      {/* ── NAV RÁPIDA ── */}
      <div style={{ padding: '10px 10px 6px', flexShrink: 0 }}>
        {[
          { href: '/dashboard',         icon: '⌂', label: 'Dashboard' },
          { href: '/medicamentos',       icon: '⊞', label: 'Base de datos' },
          { href: '/arbol',              icon: '⊤', label: 'Árbol SPMS' },
        { href: '/busqueda-semantica', icon: '✦', label: 'Búsqueda IA' },
          { href: '/avances',            icon: '◎', label: 'Panel de avances' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '7px 10px', borderRadius: '7px', marginBottom: '2px',
            fontSize: '12.5px', fontWeight: 500, textDecoration: 'none',
            color: isActive(item.href) ? '#fff' : 'rgba(255,255,255,.65)',
            background: isActive(item.href) ? 'rgba(255,255,255,.12)' : 'transparent',
            transition: 'all .13s',
            borderLeft: `2px solid ${isActive(item.href) ? 'var(--green-light, #74C69D)' : 'transparent'}`,
          }}
            onMouseEnter={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.07)'; }}
            onMouseLeave={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <span style={{ fontSize: '13px', opacity: 0.8, width: '16px', textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* ── CAPÍTULOS ── */}
      <div style={{ padding: '4px 14px 6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '9px', fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.3)', letterSpacing: '1.5px' }}>CAPÍTULOS</span>
        <Link href="/medicamentos/nuevo" style={{
          background: 'var(--green-light, #74C69D)', color: 'var(--green-dark, #1B4332)',
          borderRadius: '5px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, textDecoration: 'none',
        }}>＋ Nuevo</Link>
      </div>

      {/* ── LISTA CAPÍTULOS ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2px 0' }}>
        {CHAPS.map(cap => (
          <div key={cap.id}>
            {/* Capítulo */}
            <div
              onClick={() => toggleCap(cap.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '7px 14px', cursor: 'pointer', transition: 'all .12s',
                borderLeft: `2px solid ${activeCap === cap.id ? 'var(--green-light, #74C69D)' : 'transparent'}`,
                background: activeCap === cap.id ? 'rgba(255,255,255,.09)' : 'transparent',
              }}
              onMouseEnter={e => { if (activeCap !== cap.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'; }}
              onMouseLeave={e => { if (activeCap !== cap.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'rgba(255,255,255,.35)', minWidth: '22px', flexShrink: 0 }}>
                {cap.n}
              </span>
              <span style={{ flex: 1, fontSize: '12px', fontWeight: activeCap === cap.id ? 600 : 400, color: activeCap === cap.id ? '#fff' : 'rgba(255,255,255,.7)', lineHeight: 1.3 }}>
                {cap.name}
              </span>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,.3)', transition: 'transform .2s', transform: openCap === cap.id ? 'rotate(90deg)' : 'none', flexShrink: 0 }}>
                ▶
              </span>
            </div>

            {/* Subcapítulos */}
            {openCap === cap.id && cap.subs.length > 0 && (
              <div style={{ background: 'rgba(0,0,0,.15)', borderLeft: '2px solid rgba(255,255,255,.06)', marginLeft: '14px' }}>
                {cap.subs.map((sub, si) => (
                  <div key={sub.id}
                    onClick={() => handleSub(cap.id, sub.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '7px',
                      padding: '5px 12px 5px 10px', cursor: 'pointer', transition: 'all .12s',
                      background: activeSub === sub.id ? 'rgba(116,198,157,.12)' : 'transparent',
                      borderLeft: `2px solid ${activeSub === sub.id ? 'var(--green-light, #74C69D)' : 'transparent'}`,
                    }}
                    onMouseEnter={e => { if (activeSub !== sub.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'; }}
                    onMouseLeave={e => { if (activeSub !== sub.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.3)', minWidth: '30px', flexShrink: 0, paddingTop: '1px' }}>
                      {cap.n}.{si + 1}
                    </span>
                    <span style={{ fontSize: '11.5px', color: activeSub === sub.id ? '#fff' : 'rgba(255,255,255,.6)', fontWeight: activeSub === sub.id ? 600 : 400, lineHeight: 1.35 }}>
                      {sub.name}
                    </span>
                  </div>
                ))}
                <div
                  onClick={() => router.push(`/capitulos/${cap.id}`)}
                  style={{ padding: '5px 12px 6px 42px', fontSize: '11px', color: 'var(--green-light, #74C69D)', cursor: 'pointer', opacity: 0.8 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}>
                  Ver todos →
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,.08)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {[
          { href: '/medicamentos/nuevo', icon: '＋', label: 'Nuevo medicamento', accent: true },
          { href: '/io',    icon: '⬇', label: 'Importar / Exportar' },
          { href: '/audit', icon: '◉', label: 'Audit log' },
          { href: '/docs', icon: '⊙', label: 'API Docs' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 10px', borderRadius: '7px',
            fontSize: '12px', fontWeight: (item as any).accent ? 600 : 400,
            color: (item as any).accent ? 'var(--green-light, #74C69D)' : 'rgba(255,255,255,.55)',
            textDecoration: 'none', transition: 'all .13s',
            background: (item as any).accent ? 'rgba(116,198,157,.1)' : 'transparent',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.07)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = (item as any).accent ? 'rgba(116,198,157,.1)' : 'transparent'}>
            <span style={{ fontSize: '12px', width: '16px', textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

    </aside>
  );
}
