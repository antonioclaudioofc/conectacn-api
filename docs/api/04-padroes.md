# 4. Padrões do código

[← Banco de dados](./03-banco-de-dados.md) · [Índice](../README.md) · [Próxima: Deploy →](./05-deploy.md)

---

## Formato de erro

Todos os erros passam por `src/middlewares/error-handler.ts` e saem no mesmo formato:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Dados inválidos", "details": [ { "field": "email", "message": "..." } ] } }
```

| Origem | HTTP | `code` |
|---|---|---|
| `throw new AppError(msg, status, code)` | o informado | o informado |
| `ZodError` (validação) | 400 | `VALIDATION_ERROR` (+ `details` por campo) |
| Prisma `P2002` (valor único duplicado) | 409 | `CONFLICT` |
| Prisma `P2025` (registro não encontrado em update/delete) | 404 | `NOT_FOUND` |
| JSON malformado no corpo | 400 | `INVALID_JSON` |
| Rota inexistente | 404 | `NOT_FOUND` |
| Qualquer outro erro | 500 | `INTERNAL_ERROR` (detalhes só no log do servidor) |

### Lançando erros de negócio

```ts
import { AppError } from '../errors/app-error';

throw new AppError('E-mail já cadastrado', 409, 'CONFLICT');
```

O Express 5 captura erros de funções `async` automaticamente — não é preciso `try/catch` nem `next(err)` nos controllers.

## Validação com Zod

- **Sempre importe o Zod de `src/lib/zod.ts`**, não direto de `'zod'`. Esse arquivo habilita `.openapi()`, que alimenta o Swagger.
  ```ts
  import { z } from '../lib/zod';
  ```
- Valide com `schema.parse(req.body)`: se falhar, lança `ZodError`, e o error-handler devolve o 400 com os campos.
- O mesmo schema serve para validar **e** documentar a rota.

## Documentando rotas no Swagger

A documentação é gerada do código — não existe arquivo YAML escrito à mão.

1. Crie `src/docs/paths/<modulo>.ts` registrando as rotas:
   ```ts
   import { z } from '../../lib/zod';
   import { registry, errorResponse, bearerAuth } from '../registry';

   registry.registerPath({
     method: 'post',
     path: '/api/v1/auth/login',
     tags: ['Auth'],
     summary: 'Login',
     request: { body: { content: { 'application/json': { schema: LoginSchema } } } },
     responses: {
       200: { description: 'Autenticado', content: { 'application/json': { schema: AuthResponseSchema } } },
       401: errorResponse('Credenciais inválidas'),
     },
     // para rotas protegidas:
     // security: [{ [bearerAuth.name]: [] }],
   });
   ```
2. Importe o arquivo em `src/docs/openapi.ts`:
   ```ts
   import './paths/auth';
   ```
3. Acesse `/docs` — a rota aparece com o schema e exemplos.

Componentes já registrados em `src/docs/registry.ts`:

| Nome | Uso |
|---|---|
| `bearerAuth` | Esquema de segurança JWT (botão **Authorize** no Swagger) |
| `ErrorResponse` / `errorResponse(desc)` | Resposta de erro padrão |

## Variáveis de ambiente

- Leia sempre de `env` (`src/config/env.ts`), nunca de `process.env` direto — assim tudo é validado e tipado.
- Nova variável? Adicione no schema de `env.ts` **e** no `.env.example` (sem valor real).

## Convenções gerais

- Rotas de negócio sob `/api/v1`.
- JSON em camelCase; banco em snake_case (mapeado pelo Prisma).
- Enums em MAIÚSCULAS.
- Mensagens de erro em português (são exibidas ao usuário final).
