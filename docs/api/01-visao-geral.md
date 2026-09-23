# 1. Visão geral da API

[← Índice](../README.md) · [Próxima: Como rodar →](./02-como-rodar.md)

---

> Esta área descreve **o que está implementado hoje**. O contrato planejado para os próximos módulos está em [Frontend → Modelos e endpoints](../frontend/04-modelos-e-endpoints.md).

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 22+ |
| Linguagem | TypeScript 7 (compilador nativo) |
| HTTP | Express 5 |
| Banco | PostgreSQL |
| ORM | Prisma 7 (com `@prisma/adapter-pg`) |
| Validação | Zod 4 |
| Documentação | OpenAPI 3.0 gerado a partir do Zod (`@asteasolutions/zod-to-openapi`) + Swagger UI |
| Autenticação | JWT (`jsonwebtoken`) + `bcryptjs`, com verificação de e-mail por código |
| E-mail | `nodemailer` via SMTP (Gmail); em dev sem SMTP, os e-mails saem no console |
| Deploy | Vercel (função serverless única) |
| Dev | `tsx` (execução e *watch* de TypeScript) |

## Arquitetura

Monolito simples: um app Express, organizado em camadas.

```
Requisição → routes → controllers → services → Prisma → PostgreSQL
                 ↘ middlewares (auth, validação)      ↘ errors (AppError)
```

- **routes** — define caminhos e aplica middlewares.
- **controllers** — lê a requisição, valida com Zod, chama o service e monta a resposta.
- **services** — regras de negócio e acesso ao banco.
- **middlewares** — autenticação, tratamento de erros.

Sem microsserviços, filas, cache, WebSocket ou chat — por decisão de produto.

## Estrutura de pastas

```
conectacn-api/
├── api/
│   └── index.js              # entrypoint da Vercel (reexporta dist/app)
├── docs/                     # esta documentação
├── prisma/
│   ├── schema.prisma         # modelos do banco
│   ├── migrations/           # histórico de migrations (versionado)
│   └── seed.ts               # categorias iniciais
├── prisma.config.ts          # config do Prisma 7 (URL do banco, seed, migrations)
├── src/
│   ├── app.ts                # monta o Express: CORS, JSON, rotas, erros
│   ├── server.ts             # sobe o servidor local (npm run dev / start)
│   ├── config/env.ts         # lê e valida variáveis de ambiente
│   ├── lib/
│   │   ├── prisma.ts         # PrismaClient único
│   │   ├── zod.ts            # Zod com .openapi() e mensagens em português
│   │   ├── jwt.ts            # assinar/verificar token
│   │   └── mailer.ts         # envio de e-mail (SMTP ou console em dev)
│   ├── errors/app-error.ts   # erro de negócio com status HTTP
│   ├── middlewares/
│   │   ├── authenticate.ts   # authenticate, requireRole, getAuthUser
│   │   └── error-handler.ts  # 404 e tratamento central de erros
│   ├── schemas/              # schemas Zod (validação + Swagger) por módulo
│   ├── routes/               # index.ts (agregador /api/v1) + <modulo>.routes.ts
│   ├── controllers/          # <modulo>.controller.ts
│   ├── services/             # regras de negócio + mappers de resposta
│   ├── docs/                 # geração do OpenAPI; paths/<modulo>.ts por módulo
│   ├── types/express.d.ts    # tipagem de req.user
│   └── generated/prisma/     # client gerado pelo Prisma (não versionado)
├── vercel.json
└── tsconfig.json
```

### Arquivos por módulo

Cada módulo segue o mesmo padrão (exemplo: auth):

| Arquivo | Papel |
|---|---|
| `schemas/auth.schemas.ts` | Entradas e saídas em Zod |
| `routes/auth.routes.ts` | Caminhos e middlewares |
| `controllers/auth.controller.ts` | `Schema.parse(req.body)` → service → `res.json` |
| `services/auth.service.ts` | Regras de negócio e Prisma |
| `docs/paths/auth.ts` | Registro das rotas no Swagger |

## Rotas disponíveis hoje

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Redireciona para `/docs` |
| GET | `/api/health` | Health check → `{ "status": "ok" }` |
| GET | `/docs` | Swagger UI |
| GET | `/docs/openapi.json` | Especificação OpenAPI 3.0 |
| POST | `/api/v1/auth/register` | Cadastro; envia código por e-mail |
| POST | `/api/v1/auth/verify-email` | Confirma o e-mail e retorna token |
| POST | `/api/v1/auth/resend-code` | Reenvia o código |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/me` | Usuário logado 🔒 |
| PATCH | `/api/v1/me` | Atualiza nome/bairro 🔒 |

Detalhes de cada rota (corpo, respostas, erros) no Swagger em `/docs` e em [Frontend → Integração](../frontend/03-integracao.md#autenticação--implementada).

## Como a autenticação funciona

1. **Cadastro** cria o usuário com `email_verified_at = NULL` (e o `ProfessionalProfile` vazio, se for profissional) e envia um código de 6 dígitos.
2. O código é salvo em `email_verification_codes` como **HMAC-SHA256** (chave = `JWT_SECRET`), nunca em texto puro. Vale 15 min, aceita 5 tentativas; reenvio só após 60 s.
3. **Verificação** confere o código (comparação em tempo constante), preenche `email_verified_at`, apaga o código e devolve o JWT.
4. **Login** exige senha correta **e** e-mail verificado. Para e-mail inexistente, a API compara com um hash falso, para a resposta levar o mesmo tempo e não revelar quais e-mails existem.
5. **JWT** (HS256) guarda `sub` = id do usuário e `role`; expira em `JWT_EXPIRES_IN` (7 dias).
6. Cadastro não verificado com o mesmo e-mail é **substituído** no recadastro — ninguém "reserva" um e-mail que não confirmou.

### Protegendo rotas

```ts
import { authenticate, requireRole, getAuthUser } from "../middlewares/authenticate";

router.use(authenticate);                                   // exige token válido
router.post("/services", requireRole("PROFESSIONAL"), ctrl); // exige perfil

// no controller:
const { id, role } = getAuthUser(req);
```

| Situação | Resposta |
|---|---|
| Sem header `Authorization: Bearer` | `401 UNAUTHORIZED` |
| Token inválido/expirado | `401 UNAUTHORIZED` |
| Perfil não permitido em `requireRole` | `403 FORBIDDEN` |

Qualquer outra rota responde `404` no [formato padrão de erro](./04-padroes.md#formato-de-erro).
