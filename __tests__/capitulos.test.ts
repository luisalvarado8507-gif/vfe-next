import { CAPITULOS } from '@/lib/capitulos';

describe('Capítulos terapéuticos', () => {
  test('debe tener 18 capítulos', () => {
    expect(CAPITULOS).toHaveLength(18);
  });

  test('cada capítulo debe tener id y nombre', () => {
    CAPITULOS.forEach(cap => {
      expect(cap.id).toBeDefined();
      expect(cap.name).toBeDefined();
      expect(cap.id.startsWith('c')).toBe(true);
    });
  });

  test('el primer capítulo debe ser Sistema Cardiovascular', () => {
    expect(CAPITULOS[0].id).toBe('c01');
    expect(CAPITULOS[0].name).toBe('Sistema Cardiovascular');
  });

  test('el último capítulo debe ser Medicamentos Diversos', () => {
    expect(CAPITULOS[17].id).toBe('c18');
    expect(CAPITULOS[17].name).toBe('Medicamentos Diversos');
  });

  test('no debe haber IDs duplicados', () => {
    const ids = CAPITULOS.map(c => c.id);
    const unicos = new Set(ids);
    expect(unicos.size).toBe(ids.length);
  });
});
