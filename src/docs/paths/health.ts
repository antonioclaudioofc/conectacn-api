import { z } from "../../lib/zod";
import { registry } from "../registry";

registry.registerPath({
  method: "get",
  path: "/api/health",
  tags: ["Health"],
  summary: "Verifica se a API está no ar",
  responses: {
    200: {
      description: "API funcionando",
      content: {
        "application/json": { schema: z.object({ status: z.literal("ok") }) },
      },
    },
  },
});
