import { AppError } from "../errors/app-error";
import { prisma } from "../lib/prisma";
import type { UpdateProfessionalProfileInput } from "../schemas/professional-profile.schemas";
import { getMe } from "./me.service";

export async function updateProfessionalProfile(
  userId: string,
  input: UpdateProfessionalProfileInput,
) {
  const { categoryIds, ...fields } = input;

  if (categoryIds) {
    const found = await prisma.category.count({
      where: { id: { in: categoryIds } },
    });
    if (found !== categoryIds.length) {
      throw new AppError(
        "Uma ou mais categorias não existem",
        400,
        "INVALID_CATEGORY",
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.professionalProfile.update({
      where: { userId },
      data: { ...fields, lastActiveAt: new Date() },
    });

    if (categoryIds) {
      await tx.professionalCategory.deleteMany({
        where: { professionalId: userId },
      });
      await tx.professionalCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          professionalId: userId,
          categoryId,
        })),
      });
    }
  });

  return getMe(userId);
}
