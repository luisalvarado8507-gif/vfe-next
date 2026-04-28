'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';

export default function ImportarExportar() {
  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const { getToken, isEditor } = useAuth();

  const exportarJSON = async () => {
    setExportando(true);
    setMensaje('');
    try {
      const token = await getToken();
      if (!token) return;
      let allMeds: Record<string, unknown>[] = [];
      let cursor: string | null = null;
      while (true) {
        const params = new URLSearchParams({ limit: '500' });
        if (cursor) params.set('cursor', cursor);
        const res = await fetch(`/api/medicamentos?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        allMeds = allMeds.concat(data.medicamentos || []);
        cursor = data.nextCursor;
        if (!cursor) break;
      }
      const blob = new Blob([JSON.stringify(allMeds, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vfe_medicamentos_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      setMensaje(`✅ Exportados ${allMeds.length} medicamentos`);
    } catch(e) {
      setMensaje('❌ Error al exportar');
    } finally {
      setExportando(false);
    }
  };

  const exportarCSV = async () => {
    setExportando(true);
    setMensaje('');
    try {
      const token = await getToken();
      if (!token) return;
      let allMeds: Record<string, string>[] = [];
      let cursor: string | null = null;
      while (true) {
        const params = new URLSearchParams({ limit: '500' });
        if (cursor) params.set('cursor', cursor);
        const res = await fetch(`/api/medicamentos?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        allMeds = allMeds.concat(data.medicamentos || []);
        cursor = data.nextCursor;
        if (!cursor) break;
      }
      const headers = ['id','vtm','laboratorio','ff','conc','estado','chapId'];
      const rows = allMeds.map(m => headers.map(h => `"${String(m[h] || '').replace(/"/g, '""')}"`).join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vfe_medicamentos_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      setMensaje(`✅ Exportados ${allMeds.length} medicamentos en CSV`);
    } catch(e) {
      setMensaje('❌ Error al exportar CSV');
    } finally {
      setExportando(false);
    }
  };

  const importarJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isEditor) return;
    setImportando(true);
    setMensaje('Leyendo archivo...');
    try {
      const text = await file.text();
      const meds = JSON.parse(text);
      if (!Array.isArray(meds)) { setMensaje('❌ El archivo no es un array JSON válido'); return; }
      const token = await getToken();
      if (!token) return;
      let importados = 0;
      for (const med of meds) {
        const res = await fetch('/api/medicamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(med),
        });
        if (res.ok) importados++;
      }
      setMensaje(`✅ Importados ${importados} de ${meds.length} medicamentos`);
    } catch(e) {
      setMensaje('❌ Error al importar: ' + String(e));
    } finally {
      setImportando(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9f4] flex">
      <Sidebar />
      <main className="flex-1 ml-64 px-8 py-8">
        <h2 className="text-xl font-bold text-[#2d6a2d] mb-6">Importar / Exportar</h2>

        {mensaje && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${mensaje.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {mensaje}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Exportar */}
          <div className="bg-white rounded-xl border border-green-100 p-6 shadow-sm">
            <h3 className="font-semibold text-[#2d6a2d] mb-1">📤 Exportar</h3>
            <p className="text-xs text-gray-500 mb-4">Descarga todos los medicamentos de la base de datos</p>
            <div className="space-y-3">
              <button onClick={exportarJSON} disabled={exportando}
                className="w-full bg-[#2d6a2d] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#235223] transition disabled:opacity-50">
                {exportando ? 'Exportando...' : '⬇ Exportar JSON'}
              </button>
              <button onClick={exportarCSV} disabled={exportando}
                className="w-full border border-[#2d6a2d] text-[#2d6a2d] py-2.5 rounded-lg text-sm font-medium hover:bg-green-50 transition disabled:opacity-50">
                {exportando ? 'Exportando...' : '⬇ Exportar CSV'}
              </button>
            </div>
          </div>

          {/* Importar */}
          <div className="bg-white rounded-xl border border-green-100 p-6 shadow-sm">
            <h3 className="font-semibold text-[#2d6a2d] mb-1">📥 Importar</h3>
            <p className="text-xs text-gray-500 mb-4">Carga medicamentos desde un archivo JSON exportado</p>
            {isEditor ? (
              <div>
                <label className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-green-200 rounded-lg py-6 cursor-pointer hover:bg-green-50 transition">
                  <input type="file" accept=".json" onChange={importarJSON} className="hidden" disabled={importando} />
                  <span className="text-sm text-gray-500">{importando ? 'Importando...' : '📁 Selecciona archivo JSON'}</span>
                </label>
                <p className="text-xs text-gray-400 mt-2">Solo archivos JSON exportados desde VFE</p>
              </div>
            ) : (
              <p className="text-xs text-red-400">Necesitas permisos de editor para importar</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
