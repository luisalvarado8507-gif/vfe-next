import { NextResponse } from 'next/server';

export async function GET() {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'SIMI API — Sistema Integral de Medicamentos Interoperables',
      version: '1.0.0',
      description: 'API REST del repositorio farmacéutico nacional de Ecuador. Nomenclatura SPMS · ATC-WHO · SNOMED CT.',
      contact: { name: 'SIMI Ecuador', url: 'https://vfe-next.vercel.app' },
      license: { name: 'Uso institucional — Ecuador' },
    },
    servers: [
      { url: 'https://vfe-next.vercel.app', description: 'Producción' },
      { url: 'http://localhost:3000', description: 'Desarrollo local' },
    ],
    security: [{ BearerAuth: [] }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http', scheme: 'bearer', bearerFormat: 'Firebase JWT',
          description: 'Token JWT de Firebase Authentication',
        },
      },
      schemas: {
        Medicamento: {
          type: 'object',
          properties: {
            docId:       { type: 'string', description: 'ID del documento en Firestore' },
            vtm:         { type: 'string', description: 'Principio activo (DCI/INN) — Virtual Therapeutic Moiety' },
            nombre:      { type: 'string', description: 'Nombre comercial' },
            conc:        { type: 'string', description: 'Concentración/dosis' },
            ff:          { type: 'string', description: 'Forma farmacéutica (EDQM)' },
            vias:        { type: 'string', description: 'Vías de administración' },
            laboratorio: { type: 'string', description: 'Laboratorio/fabricante' },
            rs:          { type: 'string', description: 'Número de registro sanitario ARCSA' },
            cum:         { type: 'string', description: 'Código Único de Medicamento ARCSA' },
            atc:         { type: 'string', description: 'Código ATC-WHO (ej. C09DB07)', example: 'C09DB07' },
            atclbl:      { type: 'string', description: 'Descripción del código ATC' },
            estado:      { type: 'string', enum: ['autorizado','arcsa_pendiente','suspendido','retirado'], description: 'Estado regulatorio' },
            generico:    { type: 'string', enum: ['Sí','No'], description: 'Medicamento genérico' },
            cnmb:        { type: 'string', description: 'Cuadro Nacional de Medicamentos Básicos' },
            vmp:         { type: 'string', description: 'Virtual Medicinal Product' },
            vmpp:        { type: 'string', description: 'Virtual Medicinal Product Pack' },
            amp:         { type: 'string', description: 'Actual Medicinal Product' },
            ampp:        { type: 'string', description: 'Actual Medicinal Product Pack' },
            chapId:      { type: 'string', description: 'ID del capítulo terapéutico' },
            subId:       { type: 'string', description: 'ID del subcapítulo' },
            pp:          { type: 'string', description: 'Precio de presentación (USD)' },
            pu:          { type: 'string', description: 'Precio unitario (USD)' },
            prospectoUrl:{ type: 'string', description: 'URL del prospecto PDF' },
            packagingUrl:{ type: 'string', description: 'URL del packaging PDF' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/api/medicamentos': {
        get: {
          summary: 'Listar medicamentos',
          description: 'Devuelve la lista paginada de medicamentos. Soporta paginación por cursor, filtro por capítulo y estado.',
          tags: ['Medicamentos'],
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 500 }, description: 'Registros por página' },
            { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Cursor de paginación (docId del último registro)' },
            { name: 'capitulo', in: 'query', schema: { type: 'string' }, description: 'Filtrar por capítulo (ej. c01)' },
            { name: 'estado', in: 'query', schema: { type: 'string', enum: ['autorizado','arcsa_pendiente','suspendido','retirado'] }, description: 'Filtrar por estado regulatorio' },
          ],
          responses: {
            '200': {
              description: 'Lista de medicamentos',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      medicamentos: { type: 'array', items: { '$ref': '#/components/schemas/Medicamento' } },
                      nextCursor: { type: 'string', nullable: true },
                      total: { type: 'integer' },
                    },
                  },
                },
              },
            },
            '401': { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
          },
        },
        post: {
          summary: 'Crear medicamento',
          description: 'Crea un nuevo registro de medicamento. Requiere rol de editor.',
          tags: ['Medicamentos'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/Medicamento' } } },
          },
          responses: {
            '200': { description: 'Medicamento creado', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'string' }, ok: { type: 'boolean' } } } } } },
            '401': { description: 'No autorizado' },
          },
        },
        put: {
          summary: 'Actualizar medicamento',
          description: 'Actualiza un medicamento existente. Requiere rol de editor.',
          tags: ['Medicamentos'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/Medicamento' } } },
          },
          responses: {
            '200': { description: 'Actualizado correctamente' },
            '401': { description: 'No autorizado' },
          },
        },
      },
      '/api/medicamentos/{id}': {
        get: {
          summary: 'Obtener medicamento por ID',
          tags: ['Medicamentos'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del documento Firestore' }],
          responses: {
            '200': { description: 'Medicamento encontrado', content: { 'application/json': { schema: { type: 'object', properties: { medicamento: { '$ref': '#/components/schemas/Medicamento' } } } } } },
            '404': { description: 'No encontrado' },
          },
        },
      },
      '/api/busqueda': {
        get: {
          summary: 'Buscar medicamentos',
          description: 'Búsqueda por nombre comercial, INN/DCI, código ATC, registro sanitario o CUM.',
          tags: ['Búsqueda'],
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Término de búsqueda', example: 'amlodipino' },
            { name: 'tipo', in: 'query', schema: { type: 'string', enum: ['todo','nombre','vtm','atc','rs'] }, description: 'Tipo de búsqueda' },
            { name: 'capitulo', in: 'query', schema: { type: 'string' }, description: 'Filtrar por capítulo' },
            { name: 'estado', in: 'query', schema: { type: 'string' }, description: 'Filtrar por estado' },
          ],
          responses: {
            '200': { description: 'Resultados de búsqueda', content: { 'application/json': { schema: { type: 'object', properties: { medicamentos: { type: 'array', items: { '$ref': '#/components/schemas/Medicamento' } }, total: { type: 'integer' } } } } } },
          },
        },
      },
      '/api/capitulos': {
        get: {
          summary: 'Obtener estructura de capítulos',
          description: 'Devuelve el árbol completo de capítulos y subcapítulos terapéuticos.',
          tags: ['Capítulos'],
          responses: {
            '200': { description: 'Árbol de capítulos', content: { 'application/json': { schema: { type: 'object', properties: { chaps: { type: 'array' } } } } } },
          },
        },
      },
      '/api/avances': {
        get: {
          summary: 'Estadísticas de la base de datos',
          description: 'Devuelve métricas: total, autorizados, genéricos, CNMB, distribución por capítulo.',
          tags: ['Estadísticas'],
          responses: {
            '200': { description: 'Estadísticas', content: { 'application/json': { schema: { type: 'object', properties: { total: { type: 'integer' }, autorizados: { type: 'integer' }, genericos: { type: 'integer' }, cnmb: { type: 'integer' }, porCapitulo: { type: 'object' } } } } } },
          },
        },
      },
      '/api/audit': {
        get: {
          summary: 'Audit log de cambios',
          description: 'Historial de operaciones CREATE/UPDATE/DELETE con usuario y timestamp.',
          tags: ['Auditoría'],
          responses: {
            '200': { description: 'Entradas de auditoría' },
          },
        },
      },
    },
    tags: [
      { name: 'Medicamentos', description: 'Gestión del repositorio farmacéutico' },
      { name: 'Búsqueda', description: 'Búsqueda semántica por INN, ATC, RS' },
      { name: 'Capítulos', description: 'Estructura terapéutica del vademécum' },
      { name: 'Estadísticas', description: 'Métricas y avances de la base' },
      { name: 'Auditoría', description: 'Trazabilidad de cambios regulatorios' },
    ],
  };

  return NextResponse.json(spec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}
