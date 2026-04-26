'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import TabIdentificacion from './components/TabIdentificacion';
import TabPresentacion from './components/TabPresentacion';
import TabRegistro from './components/TabRegistro';
import TabClinica from './components/TabClinica';

const TABS = ['🧬 Identificación', '💊 Presentación', '📋 Registro', '🩺 Clínica'];

export default function NuevoMedicamento() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { getToken, isEditor } = useAuth();

  const handleChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    if (!data.vtm || !data.laboratorio || !data.ff || !data.conc) {
      alert('Completa los campos obligatorios: DCI, Laboratorio, Forma farmacéutica y Concentración');
      setTab(0);
      return;
    }
    if (!isEditor) {
      alert('No tienes permisos de editor');
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/medicamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...data, estado: data.estado || 'pendiente' }),
      });
      const result = await res.json();
      if (result.ok) {
        alert('✅ Medicamento guardado correctamente');
        setData({});
        setTab(0);
      } else {
        alert('Error: ' + result.error);
      }
    } catch {
      alert('Error de conexion');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9f4] flex">
      <Sidebar />
      <main className="flex-1 ml-64 px-8 py-8">
        <h2 className="text-xl font-bold text-[#2d6a2d] mb-6">Nuevo medicamento</h2>

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
            {saving ? 'Guardando...' : 'Guardar medicamento'}
          </button>
          <button onClick={() => { setData({}); setTab(0); }}
            className="border border-gray-200 text-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
            Limpiar
          </button>
          <Link href="/medicamentos"
            className="border border-gray-200 text-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
            Cancelar
          </Link>
        </div>
      </main>
    </div>
  );
}
