import { Router } from "express";
import * as serviceController from "../controllers/service.controller";

export const professionalRoutes = Router();

professionalRoutes.get("/:id/services", serviceController.listPublicServices);
