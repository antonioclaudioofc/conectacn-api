import type { Request, Response } from "express";
import {
  LoginSchema,
  RegisterSchema,
  ResendCodeSchema,
  VerifyEmailSchema,
} from "../schemas/auth.schemas";
import * as authService from "../services/auth.service";

export async function register(req: Request, res: Response) {
  const input = RegisterSchema.parse(req.body);
  const { email } = await authService.register(input);

  res.status(201).json({
    message: "Enviamos um código de verificação para o seu e-mail.",
    email,
  });
}

export async function verifyEmail(req: Request, res: Response) {
  const input = VerifyEmailSchema.parse(req.body);
  res.json(await authService.verifyEmail(input));
}

export async function resendCode(req: Request, res: Response) {
  const input = ResendCodeSchema.parse(req.body);
  await authService.resendCode(input);

  res.json({
    message:
      "Se houver um cadastro pendente com este e-mail, enviamos um novo código.",
  });
}

export async function login(req: Request, res: Response) {
  const input = LoginSchema.parse(req.body);
  res.json(await authService.login(input));
}
