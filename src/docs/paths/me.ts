import { MeSchema, UpdateMeSchema } from "../../schemas/auth.schemas";
import { bearerAuth, errorResponse, registry } from "../registry";

const json = <T>(schema: T) => ({
  content: { "application/json": { schema } },
});
const security = [{ [bearerAuth.name]: [] }];

registry.registerPath({
  method: "get",
  path: "/api/v1/me",
  tags: ["Conta"],
  summary: "Usuário logado",
  description: "Inclui `professionalProfile` quando o usuário é PROFESSIONAL.",
  security,
  responses: {
    200: { description: "Dados do usuário", ...json(MeSchema) },
    401: errorResponse("Sem token, token inválido ou expirado"),
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/me",
  tags: ["Conta"],
  summary: "Atualiza nome e bairro",
  description:
    "Envie só os campos que mudaram. `neighborhood: null` remove o bairro.",
  security,
  request: {
    body: { content: { "application/json": { schema: UpdateMeSchema } } },
  },
  responses: {
    200: { description: "Dados atualizados", ...json(MeSchema) },
    400: errorResponse("Dados inválidos"),
    401: errorResponse("Sem token, token inválido ou expirado"),
  },
});
