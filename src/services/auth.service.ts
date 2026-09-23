import bcrypt from "bcryptjs";
import { AppError } from "../errors/app-error";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import type {
  LoginInput,
  RegisterInput,
  ResendCodeInput,
  VerifyEmailInput,
} from "../schemas/auth.schemas";
import { toPublicUser } from "./user.mapper";
import {
  MAX_ATTEMPTS,
  RESEND_COOLDOWN_SECONDS,
  codeMatches,
  sendVerificationCode,
} from "./verification-code.service";

const BCRYPT_ROUNDS = 10;

const DUMMY_HASH =
  "$2b$10$xJ3Z0BpYNKjPNBwuPvuOfuduk382PcoiijWDp6dhalZHIY4YnQPgi";

const invalidCode = () =>
  new AppError(
    "Código inválido ou expirado. Solicite um novo código.",
    400,
    "INVALID_CODE",
  );

function assertResendAllowed(sentAt: Date | undefined) {
  if (!sentAt) return;

  const waitSeconds = Math.ceil(
    RESEND_COOLDOWN_SECONDS - (Date.now() - sentAt.getTime()) / 1000,
  );

  if (waitSeconds > 0) {
    throw new AppError(
      `Aguarde ${waitSeconds} segundos para pedir um novo código.`,
      429,
      "TOO_MANY_REQUESTS",
    );
  }
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      professionalProfile: { select: { userId: true } },
      emailVerificationCode: { select: { sentAt: true } },
    },
  });

  if (existing?.emailVerifiedAt) {
    throw new AppError("E-mail já cadastrado", 409, "CONFLICT");
  }

  assertResendAllowed(existing?.emailVerificationCode?.sentAt);

  const data = {
    name: input.name,
    passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
    role: input.role,
    neighborhood: input.neighborhood ?? null,
  };
  const isProfessional = input.role === "PROFESSIONAL";

  const user = await prisma.$transaction(async (tx) => {
    if (!existing) {
      return tx.user.create({
        data: {
          email: input.email,
          ...data,
          professionalProfile: isProfessional ? { create: {} } : undefined,
        },
      });
    }

    if (existing.professionalProfile && !isProfessional) {
      await tx.professionalProfile.delete({ where: { userId: existing.id } });
    }

    return tx.user.update({
      where: { id: existing.id },
      data: {
        ...data,
        professionalProfile:
          isProfessional && !existing.professionalProfile
            ? { create: {} }
            : undefined,
      },
    });
  });

  await sendVerificationCode(user);

  return { email: user.email };
}

export async function verifyEmail(input: VerifyEmailInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { emailVerificationCode: true },
  });
  const record = user?.emailVerificationCode;

  if (!user || user.emailVerifiedAt || !record) throw invalidCode();

  const { count } = await prisma.emailVerificationCode.updateMany({
    where: {
      userId: user.id,
      attempts: { lt: MAX_ATTEMPTS },
      expiresAt: { gt: new Date() },
    },
    data: { attempts: { increment: 1 } },
  });

  if (count === 0 || !codeMatches(input.code, record.codeHash))
    throw invalidCode();

  const [verified] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationCode.delete({ where: { userId: user.id } }),
  ]);

  return { token: signToken(verified), user: toPublicUser(verified) };
}

export async function resendCode(input: ResendCodeInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { emailVerificationCode: true },
  });

  if (!user || user.emailVerifiedAt) return;

  assertResendAllowed(user.emailVerificationCode?.sentAt);

  await sendVerificationCode(user);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const passwordOk = await bcrypt.compare(
    input.password,
    user?.passwordHash ?? DUMMY_HASH,
  );

  if (!user || !passwordOk) {
    throw new AppError(
      "E-mail ou senha incorretos",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  if (!user.emailVerifiedAt) {
    throw new AppError(
      "Confirme seu e-mail antes de entrar.",
      403,
      "EMAIL_NOT_VERIFIED",
    );
  }

  if (user.role === "PROFESSIONAL") {
    await prisma.professionalProfile.update({
      where: { userId: user.id },
      data: { lastActiveAt: new Date() },
    });
  }

  return { token: signToken(user), user: toPublicUser(user) };
}
