import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { env } from "../config/env";
import { AppError } from "../errors/app-error";
import { prisma } from "../lib/prisma";
import { sendMail } from "../lib/mailer";

export const CODE_TTL_MINUTES = 15;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_SECONDS = 60;

function hashCode(code: string): string {
  return createHmac("sha256", env.JWT_SECRET).update(code).digest("hex");
}

export function codeMatches(code: string, codeHash: string): boolean {
  const a = Buffer.from(hashCode(code), "hex");
  const b = Buffer.from(codeHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export async function sendVerificationCode(user: {
  id: string;
  email: string;
  name: string;
}) {
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");

  const data = {
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60_000),
    attempts: 0,
    sentAt: new Date(),
  };

  await prisma.emailVerificationCode.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });

  const firstName = user.name.split(" ")[0];

  try {
    await sendMail({
      to: user.email,
      subject: `${code} é seu código de verificação do ConectaCN`,
      text:
        `Olá, ${firstName}!\n\n` +
        `Seu código de verificação do ConectaCN é: ${code}\n\n` +
        `Ele expira em ${CODE_TTL_MINUTES} minutos. Se você não criou uma conta, ignore este e-mail.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1f2937">
          <h2 style="margin-bottom:4px">ConectaCN</h2>
          <p>Olá, ${escapeHtml(firstName)}!</p>
          <p>Use o código abaixo para confirmar seu e-mail:</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:24px 0">${code}</p>
          <p style="color:#6b7280;font-size:14px">
            O código expira em ${CODE_TTL_MINUTES} minutos.<br>
            Se você não criou uma conta, ignore este e-mail.
          </p>
        </div>`,
    });
  } catch (err) {
    console.error("Falha ao enviar e-mail de verificação:", err);
    throw new AppError(
      "Não foi possível enviar o e-mail de verificação. Tente reenviar o código.",
      502,
      "EMAIL_SEND_FAILED",
    );
  }
}
