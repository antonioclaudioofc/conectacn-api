import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";

export const notFoundHandler: RequestHandler = (req, res) => {
  res
    .status(404)
    .json({
      error: {
        code: "NOT_FOUND",
        message: `Rota ${req.method} ${req.path} não encontrada`,
      },
    });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json({ error: { code: err.code, message: err.message } });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        details: err.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
    });
    return;
  }

  if (err?.type === "entity.parse.failed") {
    res
      .status(400)
      .json({
        error: {
          code: "INVALID_JSON",
          message: "JSON inválido no corpo da requisição",
        },
      });
    return;
  }

  console.error(err);
  res
    .status(500)
    .json({
      error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
    });
};
