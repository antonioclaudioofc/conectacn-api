import { z } from "../lib/zod";

export const MAX_SERVICES = 20;

const title = z
  .string()
  .trim()
  .min(3, "O título deve ter pelo menos 3 caracteres")
  .max(80, "O título deve ter no máximo 80 caracteres")
  .openapi({ example: "Instalação de chuveiro elétrico" });

const description = z
  .string()
  .trim()
  .max(1000, "A descrição deve ter no máximo 1000 caracteres")
  .transform((v) => v || null)
  .openapi({
    example: "Instalação completa com troca de resistência, se necessário.",
  });

const priceFrom = z
  .number()
  .min(0, "O preço não pode ser negativo")
  .max(999999.99, "Preço muito alto")
  .transform((v) => Math.round(v * 100) / 100)
  .openapi({
    example: 80,
    description: 'Preço "a partir de", em reais. null = sob consulta',
  });

export const CreateServiceSchema = z
  .object({
    title,
    description: description.nullable().optional(),
    priceFrom: priceFrom.nullable().optional(),
  })
  .openapi("CreateServiceInput");

export const UpdateServiceSchema = z
  .object({
    title: title.optional(),
    description: description.nullable().optional(),
    priceFrom: priceFrom.nullable().optional(),
    active: z
      .boolean()
      .optional()
      .openapi({
        description: "false pausa o serviço (some do perfil público)",
      }),
  })
  .refine((o) => Object.values(o).some((v) => v !== undefined), {
    message: "Envie ao menos um campo para atualizar",
  })
  .openapi("UpdateServiceInput");

export const ServiceSchema = z
  .object({
    id: z.uuid(),
    professionalId: z.uuid(),
    title: z.string(),
    description: z.string().nullable(),
    priceFrom: z.string().nullable().openapi({ example: "80.00" }),
    active: z.boolean(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .openapi("Service");

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;
