import { prisma } from "../lib/prisma";

export async function listCategories() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
  });

  return categories.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}
