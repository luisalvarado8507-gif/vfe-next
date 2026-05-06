// FHIR AuditEvent R4 compliant audit logging
// https://www.hl7.org/fhir/auditevent.html

import { adminDb } from '@/lib/firebase-admin';

export type AuditAction = 'C' | 'R' | 'U' | 'D' | 'E'; // Create/Read/Update/Delete/Execute
export type AuditOutcome = '0' | '4' | '8' | '12'; // Success/MinorFailure/SeriousFailure/MajorFailure

export interface AuditEventParams {
  action: AuditAction;
  resourceType: string;       // 'Medication' | 'Substance' | 'Organization' etc.
  resourceId: string;         // ID del recurso modificado
  resourceDisplay?: string;   // Nombre legible (vtm, nombre comercial)
  usuario: string;            // Email del usuario
  usuarioUid: string;         // UID Firebase
  usuarioRol?: string;        // 'viewer' | 'editor' | 'admin'
  ip?: string;                // IP del cliente
  subtype?: string;           // Acción específica: CREATE, UPDATE, DELETE, CAMBIO_ESTADO, etc.
  outcome?: AuditOutcome;     // '0' = éxito por defecto
  outcomeDesc?: string;       // Descripción del resultado
  detail?: Record<string, any>; // Campos adicionales
  estadoAnterior?: string;
  estadoNuevo?: string;
  cambioEstado?: boolean;
}

export async function registrarAuditEvent(params: AuditEventParams): Promise<void> {
  const now = new Date();
  
  // Formato FHIR AuditEvent R4
  const auditEvent = {
    // Campos FHIR AuditEvent R4 mínimos
    resourceType: 'AuditEvent',
    type: {
      system: 'http://dicom.nema.org/resources/ontology/DCM',
      code: '110110',
      display: 'Patient Record',
    },
    subtype: [{
      system: 'http://hl7.org/fhir/restful-interaction',
      code: params.subtype || params.action,
      display: params.subtype || params.action,
    }],
    action: params.action,
    period: { start: now.toISOString(), end: now.toISOString() },
    recorded: now.toISOString(),
    outcome: params.outcome || '0',
    outcomeDesc: params.outcomeDesc || (params.outcome === '0' ? 'Operación exitosa' : 'Error'),
    
    // Agente (usuario)
    agent: [{
      type: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
          code: 'IRCP',
          display: 'information recipient',
        }],
      },
      who: {
        identifier: { value: params.usuarioUid },
        display: params.usuario,
      },
      name: params.usuario,
      requestor: true,
      role: params.usuarioRol ? [{
        coding: [{
          system: 'https://simi.ec/fhir/CodeSystem/roles',
          code: params.usuarioRol,
          display: params.usuarioRol,
        }],
      }] : undefined,
      network: params.ip ? {
        address: params.ip,
        type: '2', // IP Address
      } : undefined,
    }],
    
    // Fuente
    source: {
      site: 'SIMI — Sistema Integral de Medicamentos Interoperables',
      observer: {
        identifier: { value: 'simi-ecuador' },
        display: 'SIMI Ecuador',
      },
      type: [{
        system: 'http://terminology.hl7.org/CodeSystem/security-source-type',
        code: '3',
        display: 'Web Server',
      }],
    },
    
    // Entidad modificada
    entity: [{
      what: {
        identifier: { value: params.resourceId },
        display: params.resourceDisplay || params.resourceId,
      },
      type: {
        system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
        code: '2',
        display: 'System Object',
      },
      role: {
        system: 'http://terminology.hl7.org/CodeSystem/object-role',
        code: '4',
        display: 'Domain Resource',
      },
      name: params.resourceType,
      detail: params.detail ? Object.entries(params.detail).map(([k, v]) => ({
        type: k,
        valueString: typeof v === 'string' ? v : JSON.stringify(v),
      })) : undefined,
    }],
    
    // Campos SIMI adicionales (no FHIR estándar pero útiles)
    _simi: {
      accion: params.subtype || params.action,
      medId: params.resourceId,
      vtm: params.resourceDisplay || '',
      usuario: params.usuario,
      usuarioUid: params.usuarioUid,
      usuarioRol: params.usuarioRol || 'unknown',
      ip: params.ip || '',
      timestamp: now,
      estadoAnterior: params.estadoAnterior || '',
      estadoNuevo: params.estadoNuevo || '',
      cambioEstado: params.cambioEstado || false,
      ...(params.detail || {}),
    },
  };

  await adminDb.collection('auditLog').add(auditEvent);
}

// Helper para obtener IP del request
export function getClientIP(req: Request): string {
  const forwarded = (req as any).headers?.get?.('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}
