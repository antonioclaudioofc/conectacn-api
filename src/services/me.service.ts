import { AppError } from "../errors/app-error";
import { prisma } from "../lib/prisma";
import type { UpdateMeInput } from "../schemas/auth.schemas";
import { toMe } from "./user.mapper";

const include = {
  professionalProfile: {
    include: { categories: { include: { category: true } } },
  },
} as const;

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include });

  if (!user) throw new AppError("Sessão inválida", 401, "UNAUTHORIZED");

  return toMe(user);
}

export async function updateMe(userId: string, input: UpdateMeInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    include,
  });

  return toMe(user);
}
