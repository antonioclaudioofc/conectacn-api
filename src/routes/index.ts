import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { categoryRoutes } from "./category.routes";
import { meRoutes } from "./me.routes";
import { professionalRoutes } from "./professional.routes";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/me", meRoutes);
routes.use("/categories", categoryRoutes);
routes.use("/professionals", professionalRoutes);
