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
      const error = err as { code?: string; message?: string };
      setError(`Error: ${error.code} — ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📗</div>
          <h1 className="text-xl font-bold text-[#2d6a2d]">VFE</h1>
          <p className="text-sm text-gray-500">El Libro Verde de los Medicamentos</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
            <input type="email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2d6a2d]"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contraseña</label>
            <input type="password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2d6a2d]"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required />
          </div>
          {error && <p className="text-red-500 text-xs break-all">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-[#2d6a2d] text-white py-2.5 rounded-lg font-medium hover:bg-[#235223] transition disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
