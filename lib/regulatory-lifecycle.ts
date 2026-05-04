// Ciclo de vida regulatorio SIMI
// Basado en EMA SPOR / ARCSA Ecuador / ISO IDMP

export type EstadoRegulatorio =
  | 'borrador'           // Registro en construcción
  | 'arcsa_pendiente'    // Enviado a ARCSA, pendiente evaluación
  | 'en_evaluacion'      // ARCSA en proceso de revisión
  | 'autorizado'         // Autorización otorgada — en comercialización
  | 'variacion'          // Variación tipo I o II en proceso
  | 'suspendido'         // Suspensión cautelar
  | 'revocado'           // Revocación definitiva
  | 'retirado';          // Retirado del mercado por el titular

export interface EstadoInfo {
  label: string;
  desc: string;
  bg: string;
  color: string;
  border: string;
  icon: string;
  final: boolean; // no puede transicionar desde aquí
}

export const ESTADOS: Record<EstadoRegulatorio, EstadoInfo> = {
  borrador:        { label: 'Borrador',           desc: 'Registro en construcción',                    bg: '#F8FAFC', color: '#475569', border: '#CBD5E1', icon: '○', final: false },
  arcsa_pendiente: { label: 'Pendiente ARCSA',    desc: 'Enviado a ARCSA, pendiente evaluación',       bg: '#FEF9C3', color: '#854D0E', border: '#FDE68A', icon: '◷', final: false },
  en_evaluacion:   { label: 'En evaluación',      desc: 'ARCSA en proceso de revisión técnica',        bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD', icon: '◑', final: false },
  autorizado:      { label: 'Autorizado',         desc: 'Autorización otorgada — en comercialización', bg: '#DCFCE7', color: '#166534', border: '#86EFAC', icon: '●', final: false },
  variacion:       { label: 'Variación',          desc: 'Variación tipo I o II en proceso',            bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD', icon: '◎', final: false },
  suspendido:      { label: 'Suspendido',         desc: 'Suspensión cautelar por ARCSA',               bg: '#FEF3C7', color: '#92400E', border: '#FCD34D', icon: '⊘', final: false },
  revocado:        { label: 'Revocado',           desc: 'Revocación definitiva de la autorización',    bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', icon: '✕', final: true  },
  retirado:        { label: 'Retirado',           desc: 'Retirado del mercado por el titular',         bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', icon: '↩', final: true  },
};

// Transiciones permitidas (máquina de estados)
export const TRANSICIONES: Record<EstadoRegulatorio, EstadoRegulatorio[]> = {
  borrador:        ['arcsa_pendiente'],
  arcsa_pendiente: ['en_evaluacion', 'borrador'],
  en_evaluacion:   ['autorizado', 'arcsa_pendiente', 'suspendido'],
  autorizado:      ['variacion', 'suspendido', 'retirado'],
  variacion:       ['autorizado', 'suspendido'],
  suspendido:      ['autorizado', 'revocado', 'retirado'],
  revocado:        [],
  retirado:        [],
};

export function puedeTransicionar(desde: EstadoRegulatorio, hacia: EstadoRegulatorio): boolean {
  return TRANSICIONES[desde]?.includes(hacia) ?? false;
}

export function getTransicionesDisponibles(estado: EstadoRegulatorio): EstadoRegulatorio[] {
  return TRANSICIONES[estado] || [];
}

export interface TransicionHistorial {
  estadoAnterior: EstadoRegulatorio;
  estadoNuevo: EstadoRegulatorio;
  fecha: string;
  usuario: string;
  motivo?: string;
}
