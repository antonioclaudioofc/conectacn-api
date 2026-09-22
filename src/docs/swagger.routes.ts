import { Router } from "express";
import { getOpenApiDocument } from "./openapi";


const SWAGGER_UI_VERSION = "5";

const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ConectaCN API — Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: '/docs/openapi.json',
      dom_id: '#swagger-ui',
      persistAuthorization: true,
    });
  </script>
</body>
</html>`;

export const docsRoutes = Router();

docsRoutes.get("/openapi.json", (_req, res) => {
  res.json(getOpenApiDocument());
});

docsRoutes.get("/", (_req, res) => {
  res.type("html").send(html);
});
