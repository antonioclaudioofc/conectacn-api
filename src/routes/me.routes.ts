import { Router } from "express";
import * as meController from "../controllers/me.controller";
import { authenticate } from "../middlewares/authenticate";

export const meRoutes = Router();

meRoutes.use(authenticate);

meRoutes.get("/", meController.getMe);
meRoutes.patch("/", meController.updateMe);
