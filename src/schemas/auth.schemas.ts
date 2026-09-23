import { z } from "../lib/zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("E-mail inválido")
  .max(254)
  .openapi({ example: "maria@email.com" });

const password = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .max(72, "A senha deve ter no máximo 72 caracteres")
  .openapi({ example: "minhasenha123" });

const name = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .openapi({ example: "Maria Souza" });

const neighborhood = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .openapi({ example: "Centro" });

export const UserRoleSchema = z
  .enum(["CLIENT", "PROFESSIONAL"])
  .openapi("UserRole");

export const RegisterSchema = z
  .object({
    name,
    email,
    password,
    role: UserRoleSchema,
    neighborhood: neighborhood.optional(),
  })
  .openapi("RegisterInput");

export const LoginSchema = z
  .object({
    email,
    password: z.string().min(1, "Informe a senha"),
  })
  .openapi("LoginInput");

export const VerifyEmailSchema = z
  .object({
    email,
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "O código deve ter 6 dígitos")
      .openapi({ example: "482913" }),
  })
  .openapi("VerifyEmailInput");

export const ResendCodeSchema = z.object({ email }).openapi("ResendCodeInput");

export const UpdateMeSchema = z
  .object({
    name: name.optional(),
    neighborhood: neighborhood.nullable().optional(),
  })
  .openapi("UpdateMeInput");

export const UserSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    email: z.string(),
    role: UserRoleSchema,
    city: z.string().openapi({ example: "Coelho Neto" }),
    neighborhood: z.string().nullable(),
    createdAt: z.iso.datetime(),
  })
  .openapi("User");

export const AuthResponseSchema = z
  .object({
    token: z
      .string()
      .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
    user: UserSchema,
  })
  .openapi("AuthResponse");

export const MessageResponseSchema = z
  .object({ message: z.string() })
  .openapi("MessageResponse");

export const RegisterResponseSchema = z
  .object({
    message: z.string().openapi({
      example: "Enviamos um código de verificação para o seu e-mail.",
    }),
    email: z.string(),
  })
  .openapi("RegisterResponse");

const CategorySchema = z
  .object({ id: z.number().int(), name: z.string(), slug: z.string() })
  .openapi("Category");

export const MeSchema = UserSchema.extend({
  professionalProfile: z
    .object({
      bio: z.string().nullable(),
      photoUrl: z.string().nullable(),
      whatsapp: z.string().nullable(),
      responseRate: z.number(),
      avgRating: z.number(),
      reviewCount: z.number().int(),
      lastActiveAt: z.iso.datetime(),
      categories: z.array(CategorySchema),
    })
    .nullable()
    .openapi({ description: "Preenchido apenas para PROFESSIONAL" }),
}).openapi("Me");

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
export type ResendCodeInput = z.infer<typeof ResendCodeSchema>;
export type UpdateMeInput = z.infer<typeof UpdateMeSchema>;
