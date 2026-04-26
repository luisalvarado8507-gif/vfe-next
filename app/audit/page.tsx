'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface AuditEntry {
  id: string;
  accion: string;
  medId: string;
  vtm: string;
  usuario: string;
  timestamp: string;
  motivo?: string;
}

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const cargar = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/audit', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setEntries(data.entries || []);
      } catch {
        console.error('Error cargando audit log');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [authLoading]);

  const accionColor = (accion: string) => {
    switch(accion) {
      case 'CREATE': return 'bg-green-100 text-green-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9f4]">
      <header className="bg-[#2d6a2d] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📗</span>
          <div>
            <h1 className="font-bold text-lg">VFE</h1>
            <p className="text-xs text-green-200">El Libro Verde de los Medicamentos</p>
          </div>
        </div>
        <Link href="/dashboard" className="text-green-200 text-sm hover:text-white">← Dashboard</Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-[#2d6a2d] mb-6">Audit Log — Registro de cambios</h2>

        <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-50 border-b border-green-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acción</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Medicamento</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Cargando...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No hay registros</td></tr>
              ) : entries.map((e, i) => (
                <tr key={e.id} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {e.timestamp ? new Date(e.timestamp).toLocaleString('es-EC') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${accionColor(e.accion)}`}>
                      {e.accion}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{e.vtm}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{e.usuario}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{e.motivo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
