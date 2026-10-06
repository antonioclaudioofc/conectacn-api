import { AppError } from "../errors/app-error";
import { prisma } from "../lib/prisma";
import {
  MAX_SERVICES,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "../schemas/service.schemas";
import { toService } from "./service.mapper";

const serviceNotFound = () =>
  new AppError("Serviço não encontrado", 404, "NOT_FOUND");

const touchProfile = (userId: string) =>
  prisma.professionalProfile.update({
    where: { userId },
    data: { lastActiveAt: new Date() },
  });

async function assertOwnService(userId: string, serviceId: string) {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, professionalId: userId },
    select: { id: true },
  });
  if (!service) throw serviceNotFound();
}

export async function listMyServices(userId: string) {
  const services = await prisma.service.findMany({
    where: { professionalId: userId },
    orderBy: { createdAt: "asc" },
  });
  return services.map(toService);
}

export async function createService(userId: string, input: CreateServiceInput) {
  const total = await prisma.service.count({
    where: { professionalId: userId },
  });
  if (total >= MAX_SERVICES) {
    throw new AppError(
      `Limite de ${MAX_SERVICES} serviços atingido. Remova ou edite um serviço existente.`,
      409,
      "SERVICE_LIMIT_REACHED",
    );
  }

  const [service] = await prisma.$transaction([
    prisma.service.create({ data: { ...input, professionalId: userId } }),
    touchProfile(userId),
  ]);
  return toService(service);
}

export async function updateService(
  userId: string,
  serviceId: string,
  input: UpdateServiceInput,
) {
  await assertOwnService(userId, serviceId);

  const [service] = await prisma.$transaction([
    prisma.service.update({ where: { id: serviceId }, data: input }),
    touchProfile(userId),
  ]);
  return toService(service);
}

export async function deleteService(userId: string, serviceId: string) {
  await assertOwnService(userId, serviceId);

  await prisma.$transaction([
    prisma.service.delete({ where: { id: serviceId } }),
    touchProfile(userId),
  ]);
}

export async function listPublicServices(professionalId: string) {
  const profile = await prisma.professionalProfile.findFirst({
    where: { userId: professionalId, user: { emailVerifiedAt: { not: null } } },
    select: { userId: true },
  });
  if (!profile) {
    throw new AppError("Profissional não encontrado", 404, "NOT_FOUND");
  }

  const services = await prisma.service.findMany({
    where: { professionalId, active: true },
    orderBy: { createdAt: "asc" },
  });
  return services.map(toService);
}
