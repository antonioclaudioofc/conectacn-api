import { Router } from "express";
import * as meController from "../controllers/me.controller";
import * as professionalProfileController from "../controllers/professional-profile.controller";
import { authenticate, requireRole } from "../middlewares/authenticate";

export const meRoutes = Router();

meRoutes.use(authenticate);

meRoutes.get("/", meController.getMe);
meRoutes.patch("/", meController.updateMe);
meRoutes.patch(
  "/professional-profile",
  requireRole("PROFESSIONAL"),
  professionalProfileController.updateProfessionalProfile,
);
