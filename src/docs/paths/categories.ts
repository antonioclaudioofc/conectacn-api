import { z } from "../../lib/zod";
import { CategorySchema } from "../../schemas/category.schemas";
import { registry } from "../registry";

registry.registerPath({
  method: "get",
  path: "/api/v1/categories",
  tags: ["Categorias"],
  summary: "Lista todas as categorias",
  description:
    "Pública e sem paginação. Ordenada por nome. Use o `slug` para filtros e URLs. " +
    "Resposta com cache (navegador 10 min, CDN 1 h).",
  responses: {
    200: {
      description: "Categorias",
      content: { "application/json": { schema: z.array(CategorySchema) } },
    },
  },
});
