import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: z.string().default("http://localhost:4200"),

    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default("7d"),

    SMTP_HOST: z.string().default("smtp.gmail.com"),
    SMTP_PORT: z.coerce.number().default(465),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    MAIL_FROM: z.string().optional(),
  })
  .refine((e) => e.NODE_ENV !== "production" || (e.SMTP_USER && e.SMTP_PASS), {
    message: "SMTP_USER e SMTP_PASS são obrigatórios em produção",
    path: ["SMTP_USER", "SMTP_PASS"],
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const vars = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
  throw new Error(`Variáveis de ambiente inválidas ou ausentes: ${vars}`);
}

export const env = parsed.data;
