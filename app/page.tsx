import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f4f9f4] flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <div className="text-5xl mb-4">📗</div>
        <h1 className="text-3xl font-bold text-[#2d6a2d]">VFE</h1>
        <p className="text-[#4a7c4a] font-medium">El Libro Verde de los Medicamentos</p>
        <p className="text-sm text-gray-500 mt-1">Ecuador · Base de datos de referencia</p>
      </div>
      <div className="flex gap-4">
        <Link href="/dashboard" 
          className="bg-[#2d6a2d] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#235223] transition">
          Ir al Dashboard
        </Link>
        <Link href="/medicamentos/nuevo"
          className="border border-[#2d6a2d] text-[#2d6a2d] px-6 py-3 rounded-lg font-medium hover:bg-[#f0f8f0] transition">
          Nuevo Medicamento
        </Link>
      </div>
    </div>
  );
}
