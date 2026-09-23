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

### Categorias

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/categories` | 🔓 | Lista todas (sem paginação) → `Category[]` |

### Profissionais (busca e perfil público)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/professionals` | 🔓 | Busca paginada → `Paginated<ProfessionalSummary>` |
| GET | `/professionals/:id` | 🔓 | Perfil público → `ProfessionalProfile` |
| GET | `/professionals/:id/services` | 🔓 | Serviços ativos → `Service[]` |
| GET | `/professionals/:id/reviews` | 🔓 | Avaliações, mais recentes primeiro → `Paginated<Review>` |

Filtros de `GET /professionals` (todos opcionais, combináveis):

| Query | Exemplo | Efeito |
|---|---|---|
| `category` | `eletrica` | Slug da categoria |
| `neighborhood` | `Centro` | Bairro (sem diferenciar maiúsculas/acentos) |
| `q` | `ar condicionado` | Texto livre em nome, bio e títulos de serviço |
| `page`, `pageSize` | `1`, `20` | Paginação |

A ordenação é feita pela API (ver [Regras de negócio](./05-regras-de-negocio.md#ordenação-da-busca)) — o front não precisa ordenar.

### Perfil e serviços do profissional logado 🛠️

| Método | Rota | Descrição |
|---|---|---|
| PATCH | `/me/professional-profile` | Atualiza `bio`, `photoUrl`, `whatsapp`, `categoryIds: number[]` |
| GET | `/me/services` | Meus serviços (inclui inativos) |
| POST | `/me/services` | Cria `{ title, description?, priceFrom? }` |
| PATCH | `/me/services/:id` | Edita (inclusive `active: false` para pausar) |
| DELETE | `/me/services/:id` | Remove |

Regras de formulário: `title` 3–80 caracteres; `description` até 1000; `priceFrom` número ≥ 0 (envie como número: `150` ou `150.5`); `whatsapp` só dígitos com DDI+DDD (`5598999999999`); `bio` até 1000.

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
