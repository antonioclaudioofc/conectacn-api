import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";

import "./paths/health";
import "./paths/auth";
import "./paths/me";

type OpenApiDocument = ReturnType<OpenApiGeneratorV3["generateDocument"]>;

let cached: OpenApiDocument | undefined;

export function getOpenApiDocument(): OpenApiDocument {
  cached ??= new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.3",
    info: {
      title: "ConectaCN API",
      version: "1.0.0",
      description:
        "API que conecta moradores de Coelho Neto (MA) a profissionais e prestadores de serviço locais.",
    },
    servers: [{ url: "/" }],
  });
  return cached;
}
