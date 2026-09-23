import type { AuthUser } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      // Preenchido pelo middeware `authenticate`.
      user?: AuthUser;
    }
  }
}

export {};
