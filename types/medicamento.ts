export interface Medicamento {
  id: string;
  vtm: string;
  laboratorio: string;
  nombre: string;
  ff: string;
  conc: string;
  units?: number;
  rs?: string;
  atc?: string;
  estado: 'pendiente' | 'autorizado' | 'suspendido' | 'retirado' | 'eliminado';
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  chapId?: string;
  subId?: string;
  generico?: string;
  cnmb?: string;
  rsTipo?: string;
  rsCondicion?: string;
  rsFabricante?: string;
  rsPaisFab?: string;
  rsImportador?: string;
  gtin?: string;
  pmc?: number;
  iso11615Titular?: string;
  iso11615Fecha?: string;
  iso11615Venc?: string;
  iso11615Estado?: string;
  iso11615Pais?: string;
  iso11615Proc?: string;
  iso11238Forma?: string;
  iso11238Estado?: string;
  upres?: string;
  phpidL1?: string;
  phpidL2?: string;
  phpidL3?: string;
  phpid?: string;
  clinData?: Record<string, unknown>;
  farmPrices?: Record<string, number>;
}

export interface AuditLog {
  id?: string;
  accion: 'CREATE' | 'UPDATE' | 'DELETE';
  medId: string;
  vtm: string;
  usuario: string;
  timestamp: Date;
  datosPrevios?: Partial<Medicamento>;
  datosNuevos?: Partial<Medicamento>;
  motivo?: string;
}

export interface Capitulo {
  id: string;
  name: string;
  subs: Subcapitulo[];
}

export interface Subcapitulo {
  id: string;
  name: string;
}
