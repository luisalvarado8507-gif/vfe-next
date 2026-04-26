'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
}

function BaseDatosContent() {
  const [todos, setTodos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const { getToken, user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const capitulo = searchParams.get('capitulo');
  const capNombre = capitulo ? CAPITULOS.find(c => c.id === capitulo)?.name : null;

  useEffect(() => {
    if (authLoading || !user) return;
    const cargar = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) return;
        const params = new URLSearchParams({ limit: '50' });
        if (capitulo) params.set('capitulo', capitulo);
        const res = await fetch(`/api/medicamentos?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setTodos(data.medicamentos || []);
      } catch {
        console.error('Error');
      } finally {
        setLoading(false);
      }
    };
    setBusqueda('');
    cargar();
  }, [authLoading, user, capitulo]);

  const filtrados = busqueda.trim()
    ? todos.filter(m =>
        m.vtm?.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.laboratorio?.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.ff?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : todos;

  const estadoColor = (estado: string) => {
    switch(estado) {
      case 'autorizado': return 'bg-green-100 text-green-700';
      case 'suspendido': return 'bg-yellow-100 text-yellow-700';
      case 'retirado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9f4] flex">
      <Sidebar />
      <main className="flex-1 ml-64 px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#2d6a2d]">{capNombre || 'Base de datos'}</h2>
            {capNombre && (
              <Link href="/medicamentos" className="text-xs text-gray-400 hover:text-[#2d6a2d]">← Ver todos</Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{filtrados.length} medicamentos</span>
            <Link href="/medicamentos/nuevo"
              className="bg-[#2d6a2d] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#235223] transition">
              + Nuevo
            </Link>
          </div>
        </div>

        <input
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm mb-6 focus:outline-none focus:border-[#2d6a2d]"
          placeholder="Buscar por DCI, laboratorio, forma farmacéutica..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)} />

        <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-50 border-b border-green-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">DCI / VTM</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Laboratorio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Forma farmacéutica</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Concentración</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Cargando...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No hay medicamentos</td></tr>
              ) : filtrados.map((m, i) => (
                <tr key={m.docId || m.id} className={`border-b border-gray-50 hover:bg-green-50 transition ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-3 font-medium text-gray-800">{m.vtm}</td>
                  <td className="px-4 py-3 text-gray-600">{m.laboratorio}</td>
                  <td className="px-4 py-3 text-gray-600">{m.ff}</td>
                  <td className="px-4 py-3 text-gray-600">{m.conc}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColor(m.estado)}`}>
                      {m.estado || 'pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/medicamentos/${m.docId || m.id}`}
                      className="text-[#2d6a2d] text-xs font-medium hover:underline">Ver →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default function BaseDatos() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center text-gray-400">Cargando...</div>}>
      <BaseDatosContent />
    </Suspense>
  );
}
