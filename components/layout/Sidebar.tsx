'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CHAPS } from '@/lib/capitulos-tree';

const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  admin:  { label: 'Administrador',     bg: '#EDE9FE', color: '#5B21B6', icon: '◈' },
  editor: { label: 'Editor regulatorio', bg: '#DBEAFE', color: '#1D4ED8', icon: '✎' },
  viewer: { label: 'Visualizador',       bg: '#F1F5F9', color: '#475569', icon: '◉' },
};

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export default function Sidebar() {
  const { user, role, isAdmin, isEditor, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const capFromUrl = pathname?.match(/\/capitulos\/(c\w+)/)?.[1] || null;
  const [capsOpen, setCapsOpen] = useState(!!capFromUrl);
  const [adminOpen, setAdminOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const navGroups: NavGroup[] = [
    {
      label: 'Principal',
      items: [
        { href: '/dashboard',          icon: '⌂', label: 'Dashboard' },
        { href: '/medicamentos',        icon: '⊞', label: 'Base de datos' },
        { href: '/busqueda-semantica',  icon: '✦', label: 'Búsqueda IA' },
      ],
    },
    {
      label: 'Análisis',
      items: [
        { href: '/analytics',  icon: '◈', label: 'Analítica' },
        { href: '/avances',    icon: '◎', label: 'Conformidad ISO' },
        { href: '/arbol',      icon: '⊤', label: 'Árbol SPMS' },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { href: '/gobernanza', icon: '⊡', label: 'Gobernanza' },
        { href: '/docs',       icon: '⊙', label: 'API Docs' },
        { href: '/audit',      icon: '◉', label: 'Audit log' },
        ...(isEditor ? [{ href: '/io', icon: '⬇', label: 'Importar / Exportar' }] : []),
      ],
    },
  ];

  const adminItems: NavItem[] = isAdmin ? [
    { href: '/admin/usuarios',   icon: '◈', label: 'Usuarios y roles' },
    { href: '/admin/duplicados', icon: '⊜', label: 'Duplicados IA' },
  ] : [];

  const linkStyle = (href: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 12px',
    borderRadius: 7,
    fontSize: 13,
    fontWeight: isActive(href) ? 600 : 400,
    color: isActive(href) ? '#fff' : 'rgba(255,255,255,.65)',
    background: isActive(href) ? 'rgba(255,255,255,.12)' : 'transparent',
    borderLeft: `2px solid ${isActive(href) ? '#60A5FA' : 'transparent'}`,
    textDecoration: 'none',
    transition: 'all .13s',
    cursor: 'pointer',
    marginBottom: 1,
  });

  const groupLabelStyle: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 700,
    color: 'rgba(255,255,255,.3)',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    fontFamily: 'var(--mono)',
    padding: '10px 12px 4px',
  };

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 260,
      background: 'var(--green-dark, #0F2D5E)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
      fontFamily: 'var(--sans)',
      borderRight: '1px solid rgba(255,255,255,.06)',
    }}>

      {/* ── Logo ──────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" fill="none" stroke="#60A5FA" strokeWidth="1.5"/>
              <line x1="12" y1="2" x2="12" y2="22" stroke="#60A5FA" strokeWidth="1" opacity="0.5"/>
              <line x1="4" y1="12" x2="20" y2="12" stroke="#60A5FA" strokeWidth="1" opacity="0.5"/>
              <circle cx="12" cy="12" r="2.5" fill="#60A5FA"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>SIMI</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', letterSpacing: '1.5px', fontFamily: 'var(--mono)' }}>ECUADOR</div>
          </div>
        </Link>

        {/* Usuario y rol */}
        {user ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                {user.email}
              </div>
              <button onClick={() => { logout(); router.push('/login'); }} style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, fontFamily: 'var(--sans)', flexShrink: 0 }}>
                Salir
              </button>
            </div>
            {(() => {
              const rc = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)' }}>
                  <span style={{ fontSize: 10 }}>{rc.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.75)', fontFamily: 'var(--mono)', letterSpacing: 0.5 }}>{rc.label.toUpperCase()}</span>
                  <span style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: '#60A5FA', flexShrink: 0 }} />
                </div>
              );
            })()}
          </div>
        ) : (
          <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,.08)', borderRadius: '8px', textDecoration: 'none' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>Acceder al sistema</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,.5)' }}>→</span>
          </Link>
        )}
      </div>

      {/* ── Navegación principal ──────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 0', scrollbarWidth: 'thin' }}>

        {/* Botón nuevo medicamento — prominente */}
        {isEditor && (
          <div style={{ padding: '0 4px 8px' }}>
            <Link href="/medicamentos/nuevo" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 0', background: 'rgba(96,165,250,.2)', color: '#60A5FA',
              borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none',
              border: '1.5px solid rgba(96,165,250,.3)', transition: 'all .15s',
              fontFamily: 'var(--sans)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(96,165,250,.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(96,165,250,.2)')}>
              + Nuevo medicamento
            </Link>
          </div>
        )}

        {/* Grupos de navegación */}
        {navGroups.map(group => (
          <div key={group.label}>
            <div style={groupLabelStyle}>{group.label}</div>
            {group.items.map(item => (
              <Link key={item.href} href={item.href} style={linkStyle(item.href)}
                onMouseEnter={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.07)'; }}
                onMouseLeave={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <span style={{ fontSize: 12, width: 16, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}

        {/* Admin group — colapsable */}
        {isAdmin && adminItems.length > 0 && (
          <div>
            <button onClick={() => setAdminOpen(!adminOpen)} style={{
              ...groupLabelStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 12px 4px',
            }}>
              <span>Administración</span>
              <span style={{ fontSize: 8, transition: 'transform .2s', transform: adminOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
            </button>
            {adminOpen && adminItems.map(item => (
              <Link key={item.href} href={item.href} style={linkStyle(item.href)}
                onMouseEnter={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.07)'; }}
                onMouseLeave={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <span style={{ fontSize: 12, width: 16, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Capítulos — colapsable */}
        <div>
          <button onClick={() => setCapsOpen(!capsOpen)} style={{
            ...groupLabelStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 12px 4px',
          }}>
            <span>Capítulos terapéuticos</span>
            <span style={{ fontSize: 8, transition: 'transform .2s', transform: capsOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
          </button>
          {capsOpen && (
            <div style={{ marginBottom: 8 }}>
              {CHAPS.map(cap => {
                const active = capFromUrl === cap.id;
                return (
                  <Link key={cap.id} href={`/capitulos/${cap.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 12px', borderRadius: 6, textDecoration: 'none',
                      fontSize: 12, color: active ? '#fff' : 'rgba(255,255,255,.55)',
                      background: active ? 'rgba(255,255,255,.1)' : 'transparent',
                      borderLeft: `2px solid ${active ? '#60A5FA' : 'transparent'}`,
                      transition: 'all .13s', marginBottom: 1,
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.85)'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.55)'; }}>
                    <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.3)', minWidth: 16 }}>{cap.n}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cap.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,.06)', flexShrink: 0 }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', fontFamily: 'var(--mono)', letterSpacing: 0.5, textAlign: 'center' }}>
          SIMI v2 · ISO IDMP · FHIR R4 · Ecuador
        </div>
      </div>
    </aside>
  );
}
