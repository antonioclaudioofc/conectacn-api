import nodemailer from "nodemailer";
import { env } from "../config/env";

interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const transporter =
  env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      })
    : null;

export async function sendMail(message: MailMessage): Promise<void> {
  // Sem SMTP configurado (só permitido fora de produção): mostra o e-mail no console.
  if (!transporter) {
    console.info(
      `\n[mail:dev] Para: ${message.to}\nAssunto: ${message.subject}\n\n${message.text}\n`,
    );
    return;
  }

  await transporter.sendMail({
    from: env.MAIL_FROM ?? `ConectaCN <${env.SMTP_USER}>`,
    ...message,
  });
}
