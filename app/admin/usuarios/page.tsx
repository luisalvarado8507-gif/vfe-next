'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

interface UserRecord {
  uid: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  displayName?: string;
  lastSignIn?: string;
}

const ROLE_LABELS: Record<string, { label: string; bg: string; color: string; desc: string }> = {
  viewer: { label: 'Visualizador', bg: '#F1F5F9', color: '#475569', desc: 'Solo lectura' },
  editor: { label: 'Editor',       bg: '#DBEAFE', color: '#1D4ED8', desc: 'Crear y editar medicamentos' },
  admin:  { label: 'Administrador', bg: '#EDE9FE', color: '#6D28D9', desc: 'Acceso total' },
};

export default function AdminUsersPage() {
  const { isAdmin, permissions, loading: authLoading, getToken } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.push('/dashboard'); return; }
    cargarUsuarios();
  }, [authLoading, isAdmin]);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers(data.users || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const cambiarRol = async (uid: string, nuevoRol: string) => {
    setSaving(uid);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid, role: nuevoRol }),
      });
      const data = await res.json();
      if (data.ok) {
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: nuevoRol as any } : u));
        setMensaje(`✅ Rol actualizado correctamente`);
        setTimeout(() => setMensaje(''), 3000);
      } else {
        setMensaje(`❌ Error: ${data.error}`);
      }
    } catch(e) { setMensaje(`❌ Error: ${String(e)}`); }
    finally { setSaving(null); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: 'var(--green-dark, #0F2D5E)', padding: '20px 32px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.4)', letterSpacing: '2px', marginBottom: 6 }}>ADMINISTRACIÓN · RBAC</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Gestión de usuarios y roles</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
            Control de acceso basado en roles — viewer / editor / admin
          </p>
        </div>

        <div style={{ padding: '24px 32px' }}>

          {/* Mensaje */}
          {mensaje && (
            <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 600,
              background: mensaje.startsWith('✅') ? 'var(--estado-autorizado-bg)' : 'var(--red-bg)',
              color: mensaje.startsWith('✅') ? 'var(--estado-autorizado)' : 'var(--red)',
              border: `1.5px solid ${mensaje.startsWith('✅') ? '#86EFAC' : '#FCA5A5'}` }}>
              {mensaje}
            </div>
          )}

          {/* Tabla de roles disponibles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {Object.entries(ROLE_LABELS).map(([role, info]) => (
              <div key={role} style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: info.bg, color: info.color }}>
                    {info.label}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--tx3)' }}>{info.desc}</div>
                <div style={{ fontSize: 11, color: 'var(--tx4)', marginTop: 6, fontFamily: 'var(--mono)' }}>
                  {role === 'viewer' ? 'Ver fichas · buscar' :
                   role === 'editor' ? 'Crear · editar · exportar · importar' :
                   'Todo + capítulos + usuarios'}
                </div>
              </div>
            ))}
          </div>

          {/* Lista usuarios */}
          <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', overflow: 'hidden', boxShadow: 'var(--sh)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1.5px solid var(--bdr)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>Usuarios registrados</span>
              <span style={{ fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--mono)' }}>{users.length} usuarios</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--tx4)' }}>Cargando usuarios...</div>
            ) : users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--tx4)' }}>
                <div style={{ fontSize: 11, marginTop: 8 }}>
                  Para gestionar usuarios, usa la consola de Firebase Authentication
                </div>
                <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer"
                  style={{ display: 'inline-block', marginTop: 12, padding: '7px 16px', background: 'var(--green)', color: '#fff', borderRadius: 'var(--r)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                  Abrir Firebase Console →
                </a>
              </div>
            ) : users.map((u, i) => {
              const roleInfo = ROLE_LABELS[u.role] || ROLE_LABELS.viewer;
              return (
                <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--bdr)', background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: roleInfo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: roleInfo.color, flexShrink: 0 }}>
                    {(u.email || '?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>{u.displayName || u.email}</div>
                    <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{u.email}</div>
                  </div>
                  {u.lastSignIn && (
                    <div style={{ fontSize: 11, color: 'var(--tx4)', fontFamily: 'var(--mono)', minWidth: 140, textAlign: 'right' }}>
                      {new Date(u.lastSignIn).toLocaleDateString('es-EC')}
                    </div>
                  )}
                  <select
                    value={u.role}
                    onChange={e => cambiarRol(u.uid, e.target.value)}
                    disabled={saving === u.uid}
                    style={{ padding: '6px 10px', borderRadius: 'var(--r)', border: `1.5px solid ${roleInfo.bg}`, background: roleInfo.bg, color: roleInfo.color, fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none', opacity: saving === u.uid ? 0.5 : 1 }}>
                    <option value="viewer">Visualizador</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              );
            })}
          </div>

          {/* Nota Firebase */}
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--blue-bg)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--blue)' }}>
            <strong>Nota:</strong> Los roles se asignan como Custom Claims en Firebase Authentication.
            Para asignar el rol <code>admin</code> al primer administrador, ejecuta en Firebase Admin SDK:
            <code style={{ display: 'block', marginTop: 6, padding: '6px 10px', background: 'rgba(0,0,0,.05)', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 11 }}>
              admin.auth().setCustomUserClaims(uid, {'{'} admin: true {'}'})
            </code>
          </div>
        </div>
      </main>
    </div>
  );
}
