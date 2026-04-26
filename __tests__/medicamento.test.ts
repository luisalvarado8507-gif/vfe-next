describe('Validaciones de medicamento', () => {
  const medicamentoValido = {
    vtm: 'atenolol',
    laboratorio: 'Pfizer',
    ff: 'comprimido recubierto con película (Film-coated tablet)',
    conc: '50 mg',
    estado: 'pendiente',
  };

  test('medicamento válido tiene todos los campos requeridos', () => {
    expect(medicamentoValido.vtm).toBeTruthy();
    expect(medicamentoValido.laboratorio).toBeTruthy();
    expect(medicamentoValido.ff).toBeTruthy();
    expect(medicamentoValido.conc).toBeTruthy();
  });

  test('estado debe ser uno de los valores permitidos', () => {
    const estadosValidos = ['pendiente', 'autorizado', 'suspendido', 'retirado', 'eliminado'];
    expect(estadosValidos).toContain(medicamentoValido.estado);
  });

  test('VTM no debe estar vacío', () => {
    expect(medicamentoValido.vtm.trim().length).toBeGreaterThan(0);
  });

  test('concentración debe tener formato válido', () => {
    const concRegex = /\d+(\.\d+)?\s*(mg|mcg|g|mL|UI|%)/i;
    expect(concRegex.test(medicamentoValido.conc)).toBe(true);
  });

  test('validación GTIN - dígito de control', () => {
    const validarGTIN = (gtin: string): boolean => {
      const s = gtin.replace(/\D/g, '');
      if (![8, 12, 13, 14].includes(s.length)) return false;
      const digits = s.split('').map(Number);
      const check = digits.pop()!;
      const sum = digits.reverse().reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0);
      return (10 - (sum % 10)) % 10 === check;
    };
    expect(validarGTIN('7861234567897')).toBe(false);
    expect(validarGTIN('')).toBe(false);
  });
});
