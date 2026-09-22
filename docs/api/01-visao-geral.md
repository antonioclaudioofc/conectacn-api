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
| Autenticação | JWT (`jsonwebtoken`) + `bcryptjs` — *em implementação* |
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
│   │   └── zod.ts            # Zod com suporte a .openapi()
│   ├── errors/app-error.ts   # erro de negócio com status HTTP
│   ├── middlewares/
│   │   └── error-handler.ts  # 404 e tratamento central de erros
│   ├── docs/                 # geração do OpenAPI e rota do Swagger
│   ├── routes/index.ts       # agregador das rotas /api/v1
│   └── generated/prisma/     # client gerado pelo Prisma (não versionado)
├── vercel.json
└── tsconfig.json
```

As pastas `controllers/` e `services/` são criadas conforme os módulos de negócio são implementados.

## Rotas disponíveis hoje

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Redireciona para `/docs` |
| GET | `/api/health` | Health check → `{ "status": "ok" }` |
| GET | `/docs` | Swagger UI |
| GET | `/docs/openapi.json` | Especificação OpenAPI 3.0 |
| — | `/api/v1/*` | Prefixo das rotas de negócio (ainda vazio) |

Qualquer outra rota responde `404` no [formato padrão de erro](./04-padroes.md#formato-de-erro).
