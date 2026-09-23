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
| `JWT_SECRET` | ✅ | — | Mínimo 32 caracteres. Também é a chave do hash dos códigos de verificação |
| `JWT_EXPIRES_IN` | | `7d` | Validade do token (`7d`, `12h`...) |
| `SMTP_HOST` | | `smtp.gmail.com` | Servidor SMTP |
| `SMTP_PORT` | | `465` | Porta SMTP (465 = SSL) |
| `SMTP_USER` | em produção | — | Seu e-mail do Gmail |
| `SMTP_PASS` | em produção | — | **Senha de app** do Gmail (não a senha da conta) |
| `MAIL_FROM` | | `ConectaCN <SMTP_USER>` | Remetente exibido |

Gere o `JWT_SECRET` com:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

> Trocar o `JWT_SECRET` desloga todo mundo e invalida códigos de verificação pendentes.

### E-mail em desenvolvimento

Com `SMTP_USER`/`SMTP_PASS` vazios (e `NODE_ENV` diferente de `production`), nenhum e-mail é enviado: o conteúdo — incluindo o código — aparece no **console do servidor**:

```
[mail:dev] Para: maria@email.com
Assunto: 482913 é seu código de verificação do ConectaCN
```

Em produção, a API não sobe sem SMTP configurado.

### Configurando o Gmail

1. Ative a **verificação em duas etapas** na Conta Google.
2. Acesse *Conta Google → Segurança → Senhas de app* (ou myaccount.google.com/apppasswords) e crie uma senha para "ConectaCN".
3. Use o seu e-mail em `SMTP_USER` e a senha de 16 caracteres gerada em `SMTP_PASS`.

Limites: cerca de 500 e-mails/dia em conta pessoal. Os e-mails podem cair no spam — oriente o usuário a conferir a pasta.

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
