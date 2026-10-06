import type { Service } from "../generated/prisma/client";

export function toService(service: Service) {
  return {
    id: service.id,
    professionalId: service.professionalId,
    title: service.title,
    description: service.description,
    priceFrom: service.priceFrom?.toFixed(2) ?? null,
    active: service.active,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}
