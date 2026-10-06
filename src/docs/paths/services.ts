import { z } from "../../lib/zod";
import {
  CreateServiceSchema,
  ServiceSchema,
  UpdateServiceSchema,
} from "../../schemas/service.schemas";
import { bearerAuth, errorResponse, registry } from "../registry";

const json = <T>(schema: T) => ({
  content: { "application/json": { schema } },
});
const security = [{ [bearerAuth.name]: [] }];
const idParam = z.object({ id: z.uuid() });

const authErrors = {
  401: errorResponse("Sem token, token inválido ou expirado"),
  403: errorResponse("Usuário não é PROFESSIONAL"),
};

registry.registerPath({
  method: "get",
  path: "/api/v1/me/services",
  tags: ["Meus serviços"],
  summary: "Lista meus serviços",
  description: "Inclui serviços pausados (`active: false`). Ordem de criação.",
  security,
  responses: {
    200: { description: "Serviços", ...json(z.array(ServiceSchema)) },
    ...authErrors,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/me/services",
  tags: ["Meus serviços"],
  summary: "Cria um serviço",
  description: "Limite de 20 serviços por profissional. `priceFrom` em reais (número).",
  security,
  request: { body: json(CreateServiceSchema) },
  responses: {
    201: { description: "Serviço criado", ...json(ServiceSchema) },
    400: errorResponse("Dados inválidos"),
    ...authErrors,
    409: errorResponse("SERVICE_LIMIT_REACHED"),
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/v1/me/services/{id}",
  tags: ["Meus serviços"],
  summary: "Edita ou pausa um serviço",
  description: "Envie só os campos que mudaram. `active: false` pausa; `null` limpa descrição ou preço.",
  security,
  request: { params: idParam, body: json(UpdateServiceSchema) },
  responses: {
    200: { description: "Serviço atualizado", ...json(ServiceSchema) },
    400: errorResponse("Dados inválidos"),
    ...authErrors,
    404: errorResponse("Serviço não encontrado (ou de outro profissional)"),
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/v1/me/services/{id}",
  tags: ["Meus serviços"],
  summary: "Remove um serviço",
  description:
    "Remoção definitiva. Solicitações antigas ligadas a ele continuam existindo, sem o vínculo com o serviço. " +
    "Para tirar do ar temporariamente, prefira `active: false`.",
  security,
  request: { params: idParam },
  responses: {
    204: { description: "Removido" },
    ...authErrors,
    404: errorResponse("Serviço não encontrado (ou de outro profissional)"),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/professionals/{id}/services",
  tags: ["Profissionais"],
  summary: "Serviços ativos de um profissional",
  description: "Pública. Só serviços com `active: true`, na ordem de criação.",
  request: { params: idParam },
  responses: {
    200: { description: "Serviços", ...json(z.array(ServiceSchema)) },
    404: errorResponse("Profissional não encontrado"),
  },
});
