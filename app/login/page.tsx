'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch(err: unknown) {
      const e = err as { code?: string };
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      } else if (e.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este email.');
      } else if (e.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Espera unos minutos.');
      } else {
        setError('Error de autenticación. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>

      {/* Panel izquierdo — identidad SIMI */}
      <div style={{ width: '45%', background: '#0F2D5E', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 52px', position: 'relative', overflow: 'hidden' }}>

        {/* Decoración geométrica */}
        <div style={{ position: 'absolute', right: -80, top: -80, width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(255,255,255,.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: -60, bottom: -60, width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(255,255,255,.05)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" fill="none" stroke="#60A5FA" strokeWidth="1.5"/>
                <line x1="12" y1="2" x2="12" y2="22" stroke="#60A5FA" strokeWidth="1" opacity="0.5"/>
                <line x1="4" y1="12" x2="20" y2="12" stroke="#60A5FA" strokeWidth="1" opacity="0.5"/>
                <circle cx="12" cy="12" r="2.5" fill="#60A5FA"/>
                <circle cx="12" cy="2" r="1.5" fill="#3B82F6"/>
                <circle cx="20" cy="7" r="1.5" fill="#3B82F6"/>
                <circle cx="20" cy="17" r="1.5" fill="#3B82F6"/>
                <circle cx="12" cy="22" r="1.5" fill="#3B82F6"/>
                <circle cx="4" cy="17" r="1.5" fill="#3B82F6"/>
                <circle cx="4" cy="7" r="1.5" fill="#3B82F6"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>SIMI</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', letterSpacing: '1.5px', fontFamily: 'monospace', marginTop: 2 }}>ECUADOR</div>
            </div>
          </div>
        </div>

        {/* Contenido central */}
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Sistema Integral de Medicamentos Interoperables
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.8, marginBottom: 32 }}>
            Repositorio farmacéutico nacional con nomenclatura SPMS, interoperabilidad FHIR R4, codificación ATC-WHO y SNOMED CT.
          </p>

          {/* Badges de estándares */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['ISO IDMP', 'HL7 FHIR R4', 'EMA SPOR', 'SNOMED CT', 'ATC-WHO', 'ARCSA'].map(std => (
              <span key={std} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.12)' }}>
                {std}
              </span>
            ))}
          </div>
        </div>

        {/* Footer izquierdo */}
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', lineHeight: 1.8 }}>
          <div>Repositorio farmacéutico nacional · Ecuador</div>
          <div>Conforme a estándares EMA · FDA · OMS · ISO</div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{ flex: 1, background: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.3px' }}>
              Iniciar sesión
            </h2>
            <p style={{ fontSize: 13, color: '#64748B' }}>
              Accede al repositorio farmacéutico con tus credenciales institucionales.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 6 }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="usuario@institucion.gob.ec"
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', color: '#0F172A', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#1D4ED8')}
                onBlur={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 6 }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', color: '#0F172A', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#1D4ED8')}
                onBlur={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
              />
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEE2E2', border: '1.5px solid #FCA5A5', borderRadius: 8, fontSize: 13, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚠</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '13px 0', background: loading ? '#93C5FD' : '#1D4ED8', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', transition: 'background .15s', letterSpacing: '0.3px' }}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = '#1E40AF'); }}
              onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = '#1D4ED8'); }}>
              {loading ? 'Verificando credenciales...' : 'Acceder al sistema →'}
            </button>
          </form>

          {/* Info de acceso */}
          <div style={{ marginTop: 28, padding: '14px 16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF', marginBottom: 6, letterSpacing: '0.5px' }}>
              ACCESO INSTITUCIONAL
            </div>
            <div style={{ fontSize: 12, color: '#3B82F6', lineHeight: 1.7 }}>
              El acceso está restringido a usuarios autorizados. Los roles disponibles son: <strong>Visualizador</strong>, <strong>Editor regulatorio</strong> y <strong>Administrador</strong>.
            </div>
          </div>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: '#94A3B8' }}>
            SIMI · Sistema Integral de Medicamentos Interoperables · Ecuador
          </div>
        </div>
      </div>
    </div>
  );
}
