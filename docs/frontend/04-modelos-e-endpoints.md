# 4. Modelos e endpoints

[← Integração](./03-integracao.md) · [Índice](../README.md) · [Próxima: Regras de negócio →](./05-regras-de-negocio.md)

---

## Modelos (interfaces TypeScript)

Referência do que a API retorna. Se usar geração automática pelo Swagger, estes tipos vêm prontos.

```ts
export type UserRole = 'CLIENT' | 'PROFESSIONAL';

export type RequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;          // só aparece para o próprio usuário (GET /me, login)
  role: UserRole;
  city: string;           // "Coelho Neto"
  neighborhood: string | null;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;           // "Técnico de Informática"
  slug: string;           // "tecnico-de-informatica" → use na URL/filtro
}

// Card na busca e cabeçalho do perfil público
export interface ProfessionalSummary {
  id: string;             // = id do usuário
  name: string;
  neighborhood: string | null;
  photoUrl: string | null;
  categories: Category[];
  avgRating: number;      // 0 a 5, uma casa decimal. 0 + reviewCount 0 = "Sem avaliações"
  reviewCount: number;
  responseRate: number;   // 0 a 1 → exibir como % (Math.round(x * 100))
  lastActiveAt: string;   // exibir como "ativo há 2 dias"
}

export interface ProfessionalProfile extends ProfessionalSummary {
  bio: string | null;
  whatsapp: string | null; // ver regra de exibição em Regras de negócio
  createdAt: string;       // "Na plataforma desde…"
}

export interface Service {
  id: string;
  professionalId: string;
  title: string;
  description: string | null;
  priceFrom: string | null; // "150.00" ou null ("sob consulta")
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  id: string;
  status: RequestStatus;
  message: string;
  client: { id: string; name: string; neighborhood: string | null };
  professional: { id: string; name: string; photoUrl: string | null; whatsapp: string | null };
  service: { id: string; title: string } | null;
  review: Review | null;    // preenchido quando já avaliada
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;           // 1 a 5
  comment: string | null;
  client: { id: string; name: string };
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface AuthResponse {
  token: string;
  user: User;
}

// GET /me e PATCH /me
export interface Me extends User {
  professionalProfile: {
    bio: string | null;
    photoUrl: string | null;
    whatsapp: string | null;
    responseRate: number;
    avgRating: number;
    reviewCount: number;
    lastActiveAt: string;
    categories: Category[];
  } | null;                 // null para CLIENT
}

// POST /auth/register
export interface RegisterResponse {
  message: string;
  email: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}
```

### Categorias (lista fixa)

Elétrica · Encanamento · Pedreiro/Reforma · Diarista/Limpeza · Jardinagem · Técnico de Informática · Manicure/Pedicure · Cabeleireiro · Fotografia · Aulas Particulares · Mecânica · Costura · Pintura · Serviços Gerais · Pet/Veterinário · Chaveiro · Climatização

Sempre busque via `GET /categories` (não fixe no front) — ícones podem ser mapeados pelo `slug`.

---

## Endpoints

Todas as rotas são relativas a `/api/v1`. 🔓 = pública · 🔒 = exige token · 👤 = só cliente · 🛠️ = só profissional.

### Auth e conta ✅ implementado

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/register` | 🔓 | Cadastro → `201 { message, email }` (sem token; envia código por e-mail) |
| POST | `/auth/verify-email` | 🔓 | `{ email, code }` → `200 AuthResponse` |
| POST | `/auth/resend-code` | 🔓 | `{ email }` → `200 { message }` (intervalo mínimo de 60 s) |
| POST | `/auth/login` | 🔓 | `{ email, password }` → `200 AuthResponse` |
| GET | `/me` | 🔒 | `Me` — usuário logado (+ perfil profissional, se for) |
| PATCH | `/me` | 🔒 | `{ name?, neighborhood? }` → `Me`. `neighborhood: null` remove o bairro |

Detalhes do fluxo e dos erros em [Integração → Autenticação](./03-integracao.md#autenticação--implementada).

### Categorias ✅ implementado

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/categories` | 🔓 | Lista todas (sem paginação), em ordem alfabética → `Category[]` |

```json
[
  { "id": 10, "name": "Aulas Particulares", "slug": "aulas-particulares" },
  { "id": 8, "name": "Cabeleireiro", "slug": "cabeleireiro" }
]
```

- A resposta vem com cache (`Cache-Control`): o navegador reaproveita por 10 min. Dá para carregar uma vez ao abrir o app e guardar num service.
- Use o `slug` nos filtros e URLs (`/profissionais?categoria=eletrica`) e o `id` ao salvar as categorias do profissional.

### Profissionais (busca e perfil público)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/professionals` | 🔓 | Busca paginada → `Paginated<ProfessionalSummary>` |
| GET | `/professionals/:id` | 🔓 | Perfil público → `ProfessionalProfile` |
| GET | `/professionals/:id/services` | 🔓 | ✅ Serviços ativos, em ordem de criação → `Service[]`. Profissional inexistente ou não verificado → `404` |
| GET | `/professionals/:id/reviews` | 🔓 | Avaliações, mais recentes primeiro → `Paginated<Review>` |

Filtros de `GET /professionals` (todos opcionais, combináveis):

| Query | Exemplo | Efeito |
|---|---|---|
| `category` | `eletrica` | Slug da categoria |
| `neighborhood` | `Centro` | Bairro (sem diferenciar maiúsculas/acentos) |
| `q` | `ar condicionado` | Texto livre em nome, bio e títulos de serviço |
| `page`, `pageSize` | `1`, `20` | Paginação |

A ordenação é feita pela API (ver [Regras de negócio](./05-regras-de-negocio.md#ordenação-da-busca)) — o front não precisa ordenar.

### Perfil do profissional logado 🛠️ ✅ implementado

| Método | Rota | Descrição |
|---|---|---|
| PATCH | `/me/professional-profile` | Atualiza `bio`, `photoUrl`, `whatsapp`, `categoryIds` → `Me` |

```json
{
  "bio": "Eletricista há 10 anos, atendo residências e comércios.",
  "photoUrl": "https://exemplo.com/foto.jpg",
  "whatsapp": "(98) 99999-1234",
  "categoryIds": [1, 17]
}
```

- Envie **só os campos que mudaram**; corpo vazio → `400`.
- `null` limpa `bio`, `photoUrl` ou `whatsapp`.
- Resposta: o mesmo `Me` do `GET /me`, já atualizado — dá para atualizar o estado do app direto com ela.
- Cliente chamando esta rota → `403 FORBIDDEN`.

| Campo | Regra |
|---|---|
| `bio` | Até 1000 caracteres. Só espaços vira `null` |
| `photoUrl` | URL **https**, até 500 caracteres. Por enquanto a API recebe só o link (upload de arquivo virá depois — ver [pendências](./07-roadmap.md#pontos-em-aberto)) |
| `whatsapp` | DDD + número, com ou sem formatação e com ou sem `+55`: `(98) 99999-1234`, `98999991234`, `+55 98 3333-1234`. É salvo e devolvido **só com dígitos e com 55** (`5598999991234`) — pronto para `https://wa.me/5598999991234` |
| `categoryIds` | 1 a 5 ids de `GET /categories`, sem repetir. **Substitui a lista inteira** (para adicionar uma, envie as antigas + a nova). Id inexistente → `400 INVALID_CATEGORY` |

Sugestão de tela (`/painel/perfil`): carregar `GET /me` + `GET /categories`, mostrar as categorias como chips selecionáveis (máx. 5) e uma prévia do card público.

### Serviços do profissional logado 🛠️ ✅ implementado

| Método | Rota | Descrição |
|---|---|---|
| GET | `/me/services` | Meus serviços, **inclusive pausados**, em ordem de criação → `Service[]` |
| POST | `/me/services` | Cria `{ title, description?, priceFrom? }` → `201 Service` |
| PATCH | `/me/services/:id` | Edita só os campos enviados (inclusive `active`) → `Service` |
| DELETE | `/me/services/:id` | Remove → `204` (sem corpo) |

```json
// POST /me/services
{ "title": "Instalação de chuveiro", "description": "Com troca de resistência.", "priceFrom": 80 }

// resposta 201
{
  "id": "…", "professionalId": "…",
  "title": "Instalação de chuveiro", "description": "Com troca de resistência.",
  "priceFrom": "80.00", "active": true,
  "createdAt": "…", "updatedAt": "…"
}
```

| Campo | Regra |
|---|---|
| `title` | 3 a 80 caracteres (espaços nas pontas são removidos) |
| `description` | Até 1000 caracteres. Vazio ou `null` → `null` |
| `priceFrom` | **Número** em reais, 0 a 999999.99 (`80`, `150.5`). Arredondado para 2 casas. Omitido ou `null` → "sob consulta". Volta como **texto** (`"80.00"`) |
| `active` | Só no PATCH. `false` pausa: o serviço some do perfil público, mas continua em `GET /me/services` |

- Limite de **20 serviços** por profissional → `409 SERVICE_LIMIT_REACHED`.
- Serviço de outro profissional ou id inválido → `404 NOT_FOUND`.
- **Pausar vs. remover:** prefira pausar (`active: false`) para tirar do ar temporariamente. Remover é definitivo; solicitações antigas que citavam o serviço continuam existindo, mas sem o vínculo.

Sugestão de tela (`/painel/servicos`): lista com um toggle "Ativo" por serviço (chama o PATCH com `active`), botão "Novo serviço" abrindo um formulário e confirmação antes de remover.

### Solicitações

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/requests` | 👤 | Cria `{ professionalId, serviceId?, message }` → `201 ServiceRequest` |
| GET | `/requests/sent` | 👤 | Minhas solicitações enviadas → `Paginated<ServiceRequest>` |
| GET | `/requests/received` | 🛠️ | Recebidas → `Paginated<ServiceRequest>` (filtro `?status=PENDING`) |
| GET | `/requests/:id` | 🔒 | Detalhe (só cliente ou profissional envolvidos) |
| POST | `/requests/:id/accept` | 🛠️ | `PENDING → ACCEPTED` |
| POST | `/requests/:id/decline` | 🛠️ | `PENDING → DECLINED` |
| POST | `/requests/:id/complete` | 🔒 | `ACCEPTED → COMPLETED` |
| POST | `/requests/:id/cancel` | 🔒 | `ACCEPTED → CANCELLED` |

- `message`: 10–1000 caracteres.
- As ações de status **não têm corpo** e retornam a `ServiceRequest` atualizada.
- `GET /requests/sent` também aceita `?status=`.

### Avaliações

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/requests/:id/review` | 👤 | Avalia `{ rating: 1-5, comment? }` → `201 Review` |
| POST | `/reviews/:id/flag` | 🔒 | Denuncia uma avaliação `{ reason? }` → `204` |
