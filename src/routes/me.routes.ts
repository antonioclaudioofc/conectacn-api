import { Router } from "express";
import * as meController from "../controllers/me.controller";
import * as professionalProfileController from "../controllers/professional-profile.controller";
import * as serviceController from "../controllers/service.controller";
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

const myServices = Router();
myServices.use(requireRole("PROFESSIONAL"));
myServices.get("/", serviceController.listMyServices);
myServices.post("/", serviceController.createService);
myServices.patch("/:id", serviceController.updateService);
myServices.delete("/:id", serviceController.deleteService);

meRoutes.use("/services", myServices);
