import jwt, { type SignOptions } from "jsonwebtoken";
import type { UserRole } from "../generated/prisma/client";
import { env } from "../config/env";

export interface AuthUser {
  id: string;
  role: UserRole;
}

const ALGORITHM = "HS256";

export function signToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    algorithm: ALGORITHM,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

// Lança erro se o token for inválido, expirado ou com payload inesperado.
export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });

  if (
    typeof payload === "string" ||
    !payload.sub ||
    (payload.role !== "CLIENT" && payload.role !== "PROFESSIONAL")
  ) {
    throw new Error("Payload do token inválido");
  }

  return { id: payload.sub, role: payload.role };
}
