import { z } from "../lib/zod";

export const CategorySchema = z
  .object({
    id: z.number().int().openapi({ example: 6 }),
    name: z.string().openapi({ example: "Técnico de Informática" }),
    slug: z.string().openapi({ example: "tecnico-de-informatica" }),
  })
  .openapi("Category");
