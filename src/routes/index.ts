import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { meRoutes } from "./me.routes";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/me", meRoutes);
