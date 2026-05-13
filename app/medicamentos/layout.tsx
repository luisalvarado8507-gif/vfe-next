import MedicamentosSSR from './MedicamentosSSR';

export async function generateMetadata() {
  return {
    title: 'Base de datos de medicamentos — SIMI Ecuador',
    description: 'Repositorio farmacéutico nacional del Ecuador. Consulta los 16.515 medicamentos autorizados por ARCSA con estándares ISO IDMP, WHO-ATC y FHIR R4.',
    keywords: 'medicamentos Ecuador, ARCSA, repositorio farmacéutico, ISO IDMP, ATC, SIMI',
    openGraph: {
      title: 'Base de datos de medicamentos autorizados — SIMI Ecuador',
      description: 'Repositorio farmacéutico nacional con 16.515 medicamentos autorizados por ARCSA Ecuador.',
      url: 'https://vfe-next.vercel.app/medicamentos',
    }
  };
}

export default function MedicamentosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MedicamentosSSR />
      {children}
    </>
  );
}
