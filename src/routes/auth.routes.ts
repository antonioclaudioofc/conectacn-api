import { Router } from "express";
import * as authController from "../controllers/auth.controller";

export const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/verify-email", authController.verifyEmail);
authRoutes.post("/resend-code", authController.resendCode);
authRoutes.post("/login", authController.login);
