export default function DocsPage() {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SIMI API — Documentación</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
        <style>{`
          body { margin: 0; background: #f0f4ff; font-family: 'Plus Jakarta Sans', sans-serif; }
          .topbar { background: #0F2D5E; padding: 14px 24px; display: flex; align-items: center; gap: 12px; }
          .topbar-logo { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
          .topbar-sub { font-size: 11px; color: rgba(255,255,255,.5); letter-spacing: 1.5px; }
          .swagger-ui .topbar { display: none; }
          .swagger-ui .info { margin: 24px 0 16px; }
          .swagger-ui .info .title { color: #0F2D5E; }
          .swagger-ui .opblock-tag { color: #0F2D5E; border-color: #BFDBFE; }
          .swagger-ui .opblock.opblock-get .opblock-summary { border-color: #1D4ED8; }
          .swagger-ui .opblock.opblock-post .opblock-summary { border-color: #166534; }
          .swagger-ui .opblock.opblock-put .opblock-summary { border-color: #92400E; }
          .swagger-ui .btn.authorize { background: #1D4ED8; border-color: #1D4ED8; }
          #swagger-container { max-width: 1200px; margin: 0 auto; padding: 0 16px 40px; }
        `}</style>
      </head>
      <body>
        <div className="topbar">
          <div>
            <div className="topbar-logo">SIMI</div>
            <div className="topbar-sub">SISTEMA INTEGRAL DE MEDICAMENTOS INTEROPERABLES · ECUADOR</div>
          </div>
          <div style={{marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,.6)'}}>
            API REST v1.0 · OpenAPI 3.0
          </div>
        </div>
        <div id="swagger-container">
          <div id="swagger-ui"></div>
        </div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          SwaggerUIBundle({
            url: '/api/docs',
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
            layout: 'BaseLayout',
            deepLinking: true,
            displayRequestDuration: true,
            filter: true,
            tryItOutEnabled: true,
          });
        `}} />
      </body>
    </html>
  );
}
