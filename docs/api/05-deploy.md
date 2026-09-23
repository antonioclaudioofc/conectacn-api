# 5. Deploy na Vercel

[← Padrões do código](./04-padroes.md) · [Índice](../README.md)

---

## Como funciona

A API inteira roda como **uma única função serverless** na Vercel.

1. A Vercel executa o `buildCommand` do `vercel.json` → `npm run build` → `prisma generate` + `tsc` (gera `dist/`).
2. `api/index.js` é a função: apenas reexporta o app Express compilado (`dist/app`).
3. O `rewrite` do `vercel.json` manda **todas** as URLs para essa função, e o Express resolve a rota.

```json
{
  "buildCommand": "npm run build",
  "functions": { "api/index.js": { "includeFiles": "dist/**" } },
  "rewrites": [{ "source": "/(.*)", "destination": "/api" }]
}
```

### Por que `api/index.js` e não `.ts`?

O projeto usa **TypeScript 7** (compilador nativo), que não expõe a API JavaScript que a Vercel usa para transpilar `.ts` dentro de `/api`. Por isso o código é compilado pelo nosso `tsc` e a função é um `.js` de uma linha. Se um dia voltarmos para TypeScript 5.x, dá para usar `api/index.ts` diretamente.

## Passo a passo

1. **Banco na nuvem** — Neon ou Supabase. Pela Vercel: *Storage → Marketplace → Neon* já cria a `DATABASE_URL` no projeto.
2. **Importar o repositório** na Vercel com Framework Preset **"Other"**. Build e rotas já vêm do `vercel.json`.
3. **Variáveis de ambiente** (*Settings → Environment Variables*):

   | Variável | Valor |
   |---|---|
   | `DATABASE_URL` | URL **com pooler** do banco |
   | `CORS_ORIGIN` | URL(s) do frontend, separadas por vírgula |
   | `JWT_SECRET` | Segredo forte, **diferente** do usado em desenvolvimento |
   | `SMTP_USER` / `SMTP_PASS` | E-mail do Gmail e senha de app (obrigatórios em produção) |
   | `MAIL_FROM` | Opcional, ex.: `ConectaCN <seu-email@gmail.com>` |

   `NODE_ENV=production` é definido pela Vercel automaticamente.
4. **Deploy** — cada push na `main` gera deploy de produção; outras branches geram *preview*.
   Alternativa via CLI: `npm i -g vercel`, depois `vercel` (preview) ou `vercel --prod`.
5. **Verificar** — `https://<projeto>.vercel.app/api/health` e `/docs`.

## Banco em produção

As migrations **não** rodam no build (evita alterar o banco a cada deploy). Quando houver migration nova, aplique da sua máquina:

```powershell
$env:DATABASE_URL="<url direta do banco>"; npm run db:deploy; npm run db:seed
```

- Use a URL **direta** (sem `-pooler`) para migrations.
- Use a URL **com pooler** na Vercel — funções serverless abrem muitas conexões e o pooler evita estourar o limite do banco.
- O seed é idempotente: rodar de novo não duplica categorias.

## Problemas conhecidos

| Sintoma | Causa provável | Solução |
|---|---|---|
| `No Output Directory named "public" found` | Vercel esperando um site estático | Ajustar o `vercel.json` (avisar o backend) |
| `Variáveis de ambiente inválidas ou ausentes: DATABASE_URL` | Variável não cadastrada no ambiente certo (Production/Preview) | Cadastrar em *Settings → Environment Variables* e refazer o deploy |
| Erro de CORS no navegador | Origem do front não está em `CORS_ORIGIN` | Incluir a URL exata (com `https://`, sem `/` no final) |
