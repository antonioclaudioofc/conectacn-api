import type { Request, Response } from "express";
import { parseUuidParam } from "../lib/params";
import { getAuthUser } from "../middlewares/authenticate";
import {
  CreateServiceSchema,
  UpdateServiceSchema,
} from "../schemas/service.schemas";
import * as serviceService from "../services/service.service";

const serviceId = (req: Request) =>
  parseUuidParam(req.params.id, "Serviço não encontrado");

export async function listMyServices(req: Request, res: Response) {
  res.json(await serviceService.listMyServices(getAuthUser(req).id));
}

export async function createService(req: Request, res: Response) {
  const input = CreateServiceSchema.parse(req.body);
  res
    .status(201)
    .json(await serviceService.createService(getAuthUser(req).id, input));
}

export async function updateService(req: Request, res: Response) {
  const id = serviceId(req);
  const input = UpdateServiceSchema.parse(req.body);
  res.json(await serviceService.updateService(getAuthUser(req).id, id, input));
}

export async function deleteService(req: Request, res: Response) {
  await serviceService.deleteService(getAuthUser(req).id, serviceId(req));
  res.status(204).end();
}

export async function listPublicServices(req: Request, res: Response) {
  const professionalId = parseUuidParam(
    req.params.id,
    "Profissional não encontrado",
  );
  res.json(await serviceService.listPublicServices(professionalId));
}
