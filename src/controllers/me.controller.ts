import type { Request, Response } from "express";
import { getAuthUser } from "../middlewares/authenticate";
import { UpdateMeSchema } from "../schemas/auth.schemas";
import * as meService from "../services/me.service";

export async function getMe(req: Request, res: Response) {
  res.json(await meService.getMe(getAuthUser(req).id));
}

export async function updateMe(req: Request, res: Response) {
  const input = UpdateMeSchema.parse(req.body);
  res.json(await meService.updateMe(getAuthUser(req).id, input));
}
