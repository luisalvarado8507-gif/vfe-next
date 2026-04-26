'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CAPITULOS } from '@/lib/capitulos';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-[#2d6a2d] text-white flex flex-col min-h-screen fixed left-0 top-0">
      <div className="px-5 py-5 border-b border-green-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📗</span>
          <div>
            <h1 className="font-bold text-sm">VFE</h1>
            <p className="text-xs text-green-300">El Libro Verde</p>
          </div>
        </div>
        <p className="text-xs text-green-400 mt-2 truncate">{user?.email}</p>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-xs text-green-400 uppercase tracking-wider px-2 mb-2">Capítulos</p>
        {CAPITULOS.map(cap => (
          <Link key={cap.id} href={`/medicamentos?capitulo=${cap.id}`}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-green-100 hover:bg-green-700 transition mb-0.5">
            <span className="text-green-400 font-mono w-5">{cap.id.replace('c','')}</span>
            {cap.name}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-green-700 space-y-1">
        <Link href="/dashboard"
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-green-100 hover:bg-green-700 transition">
          🏠 Dashboard
        </Link>
        <Link href="/medicamentos"
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-green-100 hover:bg-green-700 transition">
          📋 Base de datos
        </Link>
        <Link href="/medicamentos/nuevo"
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-green-100 hover:bg-green-700 transition">
          ➕ Nuevo medicamento
        </Link>
        <Link href="/audit"
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-green-100 hover:bg-green-700 transition">
          🔍 Audit log
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-red-300 hover:bg-red-900 hover:text-red-100 transition mt-2">
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
