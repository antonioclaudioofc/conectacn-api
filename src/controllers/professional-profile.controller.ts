import type { Request, Response } from "express";
import { getAuthUser } from "../middlewares/authenticate";
import { UpdateProfessionalProfileSchema } from "../schemas/professional-profile.schemas";
import * as professionalProfileService from "../services/professional-profile.service";

export async function updateProfessionalProfile(req: Request, res: Response) {
  const input = UpdateProfessionalProfileSchema.parse(req.body);
  res.json(
    await professionalProfileService.updateProfessionalProfile(
      getAuthUser(req).id,
      input,
    ),
  );
}
