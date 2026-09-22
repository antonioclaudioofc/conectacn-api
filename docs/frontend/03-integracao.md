# 3. Integração

[← Telas](./02-telas.md) · [Índice](../README.md) · [Próxima: Modelos e endpoints →](./04-modelos-e-endpoints.md)

---

## Base URL e documentação

| Ambiente | Base da API | Swagger |
|---|---|---|
| Local | `http://localhost:3000/api/v1` | `http://localhost:3000/docs` |
| Produção | `https://<projeto>.vercel.app/api/v1` | `https://<projeto>.vercel.app/docs` |

- Health check: `GET /api/health` → `{ "status": "ok" }` (fora do `/v1`).
- Especificação OpenAPI 3.0: `/docs/openapi.json`. Dá para **gerar o client Angular automaticamente** (ex.: [`ng-openapi-gen`](https://github.com/cyclosproject/ng-openapi-gen) ou `openapi-generator` com `typescript-angular`), mantendo os tipos sempre em dia.
- Coloque a base URL em `environment.ts` / `environment.prod.ts`.

## Formato dos dados

- JSON com chaves em **camelCase**.
- IDs são **UUID** (string). Exceção: `Category.id` é número inteiro.
- Datas em **ISO 8601 UTC** (`"2026-09-22T19:08:42.000Z"`). Converta para o fuso local na exibição (`DatePipe`).
- Dinheiro (`priceFrom`) vem como **string decimal** (`"150.00"`) para não perder precisão — use `Number()`/`CurrencyPipe` com `'BRL'` na exibição. Pode ser `null` ("sob consulta").
- Campos opcionais vêm como `null` (não somem do JSON).
- Enums sempre em MAIÚSCULAS: `CLIENT`, `PROFESSIONAL`, `PENDING`, `ACCEPTED`...

## Paginação (todas as listas)

Query: `?page=1&pageSize=20` (padrão `page=1`, `pageSize=20`, máximo `50`).

```json
{
  "data": [ ... ],
  "meta": { "page": 1, "pageSize": 20, "total": 57, "totalPages": 3 }
}
```

## Formato de erro

Todo erro segue o mesmo formato:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      { "field": "email", "message": "Invalid email address" }
    ]
  }
}
```

`details` só aparece em erros de validação — use `field` para mostrar a mensagem embaixo do campo certo no formulário.

| HTTP | `code` | Quando | O que o front faz |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Campos inválidos | Mostrar erros por campo (`details`) |
| 400 | `INVALID_JSON` | Corpo malformado | Bug do front — logar |
| 401 | `UNAUTHORIZED` | Sem token, token inválido/expirado, login errado | Limpar sessão, ir para `/entrar?returnUrl=...` |
| 403 | `FORBIDDEN` | Logado, mas sem permissão (ex.: cliente tentando aceitar) | Mensagem "Você não pode fazer isso" |
| 404 | `NOT_FOUND` | Recurso/rota não existe | Tela/mensagem de não encontrado |
| 409 | `CONFLICT` | E-mail já cadastrado, avaliação já feita | Mensagem específica (`message`) |
| 409 | `INVALID_STATUS_TRANSITION` | Ação não permitida no status atual | Recarregar a solicitação e atualizar a tela |
| 429 | `TOO_MANY_REQUESTS` | Muitas tentativas (ex.: login) | "Aguarde e tente novamente" |
| 500 | `INTERNAL_ERROR` | Erro no servidor | Mensagem genérica |

> Dica: um `HttpInterceptor` de erro centraliza 401/403/500, e os formulários tratam 400/409 localmente.

## CORS

A API só aceita chamadas das origens configuradas no backend. Passe para o backend as URLs do front (ex.: `http://localhost:4200` e a URL de produção) para liberarmos.

---

## Autenticação

JWT simples, **sem refresh token** na v1.

### Cadastro

`POST /auth/register`

```json
{
  "name": "Maria Souza",
  "email": "maria@email.com",
  "password": "minhasenha123",
  "role": "CLIENT",
  "neighborhood": "Centro"
}
```

- `role`: `"CLIENT"` ou `"PROFESSIONAL"`.
- `password`: mínimo 8 caracteres.
- `neighborhood` é opcional; `city` é sempre "Coelho Neto" por enquanto.
- Se `role = PROFESSIONAL`, o perfil profissional é criado vazio automaticamente → após o cadastro, **leve o profissional para completar o perfil** (`/painel/perfil`).

Resposta `201`:

```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": "…", "name": "Maria Souza", "email": "maria@email.com", "role": "CLIENT", "city": "Coelho Neto", "neighborhood": "Centro", "createdAt": "…" }
}
```

O cadastro **já retorna o token** — não precisa logar de novo.

### Login

`POST /auth/login` com `{ "email", "password" }` → `200` no mesmo formato acima. Credenciais erradas → `401` (a mensagem não diz se foi o e-mail ou a senha).

### Usando o token

- Envie em toda rota autenticada: `Authorization: Bearer <token>` (um `HttpInterceptor` resolve).
- Validade: **7 dias**. Expirou → a API responde `401` → limpe a sessão e mande para o login.
- Guarde o token no `localStorage` (simples e suficiente para a v1).
- Não há endpoint de logout: sair = apagar o token no front.

### Guards sugeridos

- `authGuard` — exige estar logado (redireciona para `/entrar?returnUrl=<rota atual>`).
- `roleGuard('CLIENT' | 'PROFESSIONAL')` — exige o perfil certo.
- Ao iniciar o app com token salvo, chame `GET /me` para restaurar o usuário (e validar o token).
