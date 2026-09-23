import type { Request, RequestHandler } from "express";
import type { UserRole } from "../generated/prisma/client";
import { AppError } from "../errors/app-error";
import { verifyToken, type AuthUser } from "../lib/jwt";

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Autenticação necessária", 401, "UNAUTHORIZED");
  }

  try {
    req.user = verifyToken(header.slice("Bearer ".length));
  } catch {
    throw new AppError("Token inválido ou expirado", 401, "UNAUTHORIZED");
  }

  next();
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(
        "Você não tem permissão para esta ação",
        403,
        "FORBIDDEN",
      );
    }
    next();
  };
}

export function getAuthUser(req: Request): AuthUser {
  if (!req.user) {
    throw new AppError("Autenticação necessária", 401, "UNAUTHORIZED");
  }
  return req.user;
}
