import { z } from "../lib/zod";

export const MAX_CATEGORIES = 5;

const bio = z
  .string()
  .trim()
  .max(1000, "A bio deve ter no máximo 1000 caracteres")
  .transform((v) => v || null)
  .openapi({
    example: "Eletricista há 10 anos, atendo residências e comércios.",
  });

const photoUrl = z
  .url({ protocol: /^https$/, error: "Informe uma URL https válida" })
  .max(500)
  .openapi({ example: "https://exemplo.com/foto.jpg" });

const whatsapp = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .transform((digits) =>
    digits.length === 10 || digits.length === 11 ? `55${digits}` : digits,
  )
  .pipe(
    z
      .string()
      .regex(
        /^55\d{10,11}$/,
        "WhatsApp inválido. Informe DDD + número, ex.: (98) 99999-1234",
      ),
  )
  .openapi({
    example: "(98) 99999-1234",
    description:
      "Aceita com ou sem formatação e com ou sem o 55. É salvo só com dígitos, ex.: 5598999991234",
  });

const categoryIds = z
  .array(z.int().positive())
  .min(1, "Escolha pelo menos uma categoria")
  .max(MAX_CATEGORIES, `Escolha no máximo ${MAX_CATEGORIES} categorias`)
  .refine((ids) => new Set(ids).size === ids.length, "Categorias repetidas")
  .openapi({ example: [1, 17] });

export const UpdateProfessionalProfileSchema = z
  .object({
    bio: bio.nullable().optional(),
    photoUrl: photoUrl.nullable().optional(),
    whatsapp: whatsapp.nullable().optional(),
    categoryIds: categoryIds.optional(),
  })
  .refine((o) => Object.values(o).some((v) => v !== undefined), {
    message: "Envie ao menos um campo para atualizar",
  })
  .openapi("UpdateProfessionalProfileInput");

export type UpdateProfessionalProfileInput = z.infer<
  typeof UpdateProfessionalProfileSchema
>;
