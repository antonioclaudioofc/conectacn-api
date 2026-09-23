import {
  AuthResponseSchema,
  LoginSchema,
  MessageResponseSchema,
  RegisterResponseSchema,
  RegisterSchema,
  ResendCodeSchema,
  VerifyEmailSchema,
} from "../../schemas/auth.schemas";
import { errorResponse, registry } from "../registry";

const json = <T>(schema: T) => ({
  content: { "application/json": { schema } },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/register",
  tags: ["Auth"],
  summary: "Cadastro",
  description:
    "Cria a conta e envia um código de 6 dígitos para o e-mail. **Não retorna token**: " +
    "o login só é liberado após `POST /auth/verify-email`. Se já existir um cadastro " +
    "**não verificado** com o mesmo e-mail, ele é substituído e um novo código é enviado.",
  request: { body: json(RegisterSchema) },
  responses: {
    201: {
      description: "Conta criada, código enviado",
      ...json(RegisterResponseSchema),
    },
    400: errorResponse("Dados inválidos"),
    409: errorResponse("E-mail já cadastrado e verificado"),
    429: errorResponse("Código enviado há menos de 60 segundos"),
    502: errorResponse("Falha ao enviar o e-mail (use /auth/resend-code)"),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/verify-email",
  tags: ["Auth"],
  summary: "Confirma o e-mail com o código",
  description:
    "O código expira em 15 minutos e aceita até 5 tentativas. Em caso de sucesso, " +
    "já retorna o token (não é preciso fazer login em seguida).",
  request: { body: json(VerifyEmailSchema) },
  responses: {
    200: { description: "E-mail confirmado", ...json(AuthResponseSchema) },
    400: errorResponse(
      "Dados inválidos ou INVALID_CODE (errado, expirado ou tentativas esgotadas)",
    ),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/resend-code",
  tags: ["Auth"],
  summary: "Reenvia o código de verificação",
  description:
    "Gera um novo código (o anterior deixa de valer). Intervalo mínimo de 60 segundos " +
    "entre envios. A resposta é a mesma exista ou não o cadastro.",
  request: { body: json(ResendCodeSchema) },
  responses: {
    200: { description: "Pedido aceito", ...json(MessageResponseSchema) },
    400: errorResponse("Dados inválidos"),
    429: errorResponse("Aguarde para pedir um novo código"),
    502: errorResponse("Falha ao enviar o e-mail"),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/login",
  tags: ["Auth"],
  summary: "Login",
  request: { body: json(LoginSchema) },
  responses: {
    200: { description: "Autenticado", ...json(AuthResponseSchema) },
    400: errorResponse("Dados inválidos"),
    401: errorResponse("INVALID_CREDENTIALS: e-mail ou senha incorretos"),
    403: errorResponse("EMAIL_NOT_VERIFIED: e-mail ainda não confirmado"),
  },
});
