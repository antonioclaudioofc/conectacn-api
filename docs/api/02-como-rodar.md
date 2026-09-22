# 2. Como rodar

[← Visão geral](./01-visao-geral.md) · [Índice](../README.md) · [Próxima: Banco de dados →](./03-banco-de-dados.md)

---

## Pré-requisitos

- **Node.js 22+**
- **PostgreSQL** — local ou na nuvem. Opções:
  - **Neon** ([neon.tech](https://neon.tech), plano grátis) — o mesmo banco serve para local e Vercel.
  - **Docker**:
    ```powershell
    docker run --name conectacn-db -e POSTGRES_USER=conectacn -e POSTGRES_PASSWORD=conectacn -e POSTGRES_DB=conectacn -p 5432:5432 -d postgres:17
    ```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha. **O `.env` nunca é commitado** (está no `.gitignore`).

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | URL de conexão do PostgreSQL |
| `NODE_ENV` | | `development` | `development`, `test` ou `production` |
| `PORT` | | `3000` | Porta do servidor local |
| `CORS_ORIGIN` | | `http://localhost:4200` | Origens liberadas, separadas por vírgula |

As variáveis são validadas na inicialização (`src/config/env.ts`). Se alguma estiver faltando ou inválida, a API não sobe e mostra **apenas o nome** da variável (nunca o valor).

## Primeira execução

```powershell
npm install
npm run db:generate              # gera o Prisma Client
npm run db:migrate -- --name init  # cria as tabelas (só na primeira vez / quando o schema muda)
npm run db:seed                  # insere as categorias
npm run dev                      # sobe em http://localhost:3000
```

> No Prisma 7 o `migrate dev` **não** roda `generate` nem `seed` automaticamente — por isso são comandos separados.

Verifique:

- http://localhost:3000/api/health → `{"status":"ok"}`
- http://localhost:3000/docs → Swagger
- `npm run db:studio` → interface visual do banco (as 17 categorias devem aparecer)

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor local com recarga automática (`tsx watch`) |
| `npm run build` | `prisma generate` + compila TypeScript para `dist/` |
| `npm start` | Roda a versão compilada (`dist/server.js`) |
| `npm run typecheck` | Checa tipos sem gerar arquivos |
| `npm run db:generate` | Gera o Prisma Client em `src/generated/prisma` |
| `npm run db:migrate` | Cria/aplica migrations em desenvolvimento |
| `npm run db:deploy` | Aplica migrations pendentes (produção) |
| `npm run db:seed` | Roda `prisma/seed.ts` |
| `npm run db:studio` | Abre o Prisma Studio |
