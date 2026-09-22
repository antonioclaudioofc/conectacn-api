import { prisma } from "../src/lib/prisma";

const CATEGORIES = [
  "Elétrica",
  "Encanamento",
  "Pedreiro/Reforma",
  "Diarista/Limpeza",
  "Jardinagem",
  "Técnico de Informática",
  "Manicure/Pedicure",
  "Cabeleireiro",
  "Fotografia",
  "Aulas Particulares",
  "Mecânica",
  "Costura",
  "Pintura",
  "Serviços Gerais",
  "Pet/Veterinário",
  "Chaveiro",
  "Climatização",
];

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  for (const name of CATEGORIES) {
    const slug = slugify(name);
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }
  console.log(`Seed: ${CATEGORIES.length} categorias garantidas.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
