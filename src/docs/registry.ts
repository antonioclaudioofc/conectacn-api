import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "../lib/zod";

export const registry = new OpenAPIRegistry();

export const bearerAuth = registry.registerComponent(
  "securitySchemes",
  "bearerAuth",
  {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
);

export const ErrorResponseSchema = registry.register(
  "ErrorResponse",
  z
    .object({
      error: z.object({
        code: z.string().openapi({ example: "VALIDATION_ERROR" }),
        message: z.string().openapi({ example: "Dados inválidos" }),
        details: z
          .array(z.object({ field: z.string(), message: z.string() }))
          .optional(),
      }),
    })
    .openapi("ErrorResponse"),
);

export const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: ErrorResponseSchema } },
});
