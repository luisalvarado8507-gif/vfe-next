'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';

interface Medicamento {
  id: string;
  docId: string;
  vtm: string;
  laboratorio: string;
  ff: string;
  conc: string;
  estado: string;
}

export default function BaseDatos() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const { getToken, loading: authLoading } = useAuth();

  const cargar = async (reset = false) => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({ limit: '50' });
      if (!reset && cursor) params.set('cursor', cursor);
      const res = await fetch(`/api/medicamentos?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (reset) {
        setMedicamentos(data.medicamentos || []);
      } else {
        setMedicamentos(prev => [...prev, ...(data.medicamentos || [])]);
      }
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch {
      console.error('Error cargando');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    cargar(true);
  }, [authLoading]);

  const filtrados = medicamentos.filter(m =>
    m.vtm?.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.laboratorio?.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.ff?.toLowerCase().includes(busqueda.toLowerCase())
  );

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
          <h2 className="text-xl font-bold text-[#2d6a2d]">Base de datos</h2>
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
              {loading && medicamentos.length === 0 ? (
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
                      className="text-[#2d6a2d] text-xs font-medium hover:underline">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {hasMore && (
            <div className="p-4 text-center border-t border-gray-100">
              <button onClick={() => cargar(false)}
                className="text-[#2d6a2d] text-sm font-medium hover:underline">
                {loading ? 'Cargando...' : 'Cargar más →'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
