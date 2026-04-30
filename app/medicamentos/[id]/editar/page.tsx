'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import TabIdentificacion from '../../nuevo/components/TabIdentificacion';
import TabPresentacion from '../../nuevo/components/TabPresentacion';
import TabRegistro from '../../nuevo/components/TabRegistro';
import TabClinica from '../../nuevo/components/TabClinica';

const TABS = ['🧬 Identificación', '💊 Presentación', '📋 Registro', '🩺 Clínica'];

export default function EditarMedicamento() {
  const { id } = useParams();
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { getToken, isEditor, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const cargar = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/medicamentos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.medicamento) {
          const med = result.medicamento;
          const flat: Record<string, string> = {};
          Object.keys(med).forEach(k => {
            if (typeof med[k] === 'string' || typeof med[k] === 'number') {
              flat[k] = String(med[k]);
            }
          });
          setData(flat);
        }
      } catch {
        console.error('Error cargando');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id, authLoading]);

  const handleChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async (marcarRevisado = false) => {
    if (!isEditor) {
      alert('No tienes permisos de editor');
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      if (marcarRevisado) data.estado = 'autorizado';
      const res = await fetch('/api/medicamentos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...data, id }),
      });
      const result = await res.json();
      if (result.ok) {
        alert('✅ Medicamento actualizado');
        router.push(`/medicamentos/${id}`);
      } else {
        alert('Error: ' + result.error);
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f4f9f4] flex">
      <Sidebar />
      <main className="flex-1 ml-64 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f9f4] flex">
      <Sidebar />
      <main className="flex-1 ml-64 px-8 py-8">
        <h2 className="text-xl font-bold text-[#2d6a2d] mb-2">Editar medicamento</h2>
        <p className="text-sm text-gray-500 mb-6 capitalize">{data.vtm || ''} · {data.laboratorio || ''}</p>

        <div className="flex gap-2 mb-6">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === i ? 'bg-[#2d6a2d] text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}>{t}</button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-green-100 p-6 shadow-sm min-h-64">
          {tab === 0 && <TabIdentificacion data={data} onChange={handleChange} />}
          {tab === 1 && <TabPresentacion data={data} onChange={handleChange} />}
          {tab === 2 && <TabRegistro data={data} onChange={handleChange} />}
          {tab === 3 && <TabClinica data={data} onChange={handleChange} />}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleGuardar} disabled={saving}
            className="bg-[#2d6a2d] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#235223] transition disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button onClick={() => handleGuardar(true)} disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition"
            style={{ background: '#16a34a' }}>
            {saving ? 'Guardando...' : '✓ Guardar y marcar como REVISADO'}
          </button>
          <Link href={`/medicamentos/${id}`}
            className="border border-gray-200 text-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
            Cancelar
          </Link>
        </div>
      </main>
    </div>
  );
}
