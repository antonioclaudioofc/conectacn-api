# ConectaCN — Documentação

Plataforma que conecta moradores de **Coelho Neto (MA)** a profissionais e prestadores de serviço locais.

A documentação está dividida em duas áreas:

## 📱 Frontend — como integrar e construir a interface

Para quem vai desenvolver o frontend em **Angular**: a ideia do produto, as telas e o contrato da API.

| Página | Conteúdo |
|---|---|
| [1. O produto](./frontend/01-produto.md) | Problema, princípios de interface, perfis de usuário e jornadas |
| [2. Telas](./frontend/02-telas.md) | Telas sugeridas por perfil, rotas e componentes reutilizáveis |
| [3. Integração](./frontend/03-integracao.md) | Base URL, formato dos dados, paginação, erros, autenticação |
| [4. Modelos e endpoints](./frontend/04-modelos-e-endpoints.md) | Interfaces TypeScript e todas as rotas da API |
| [5. Regras de negócio](./frontend/05-regras-de-negocio.md) | Fluxo da solicitação, avaliações, reputação e WhatsApp |
| [6. Design e ferramentas](./frontend/06-design.md) | Bibliotecas de componentes, inspiração e dicas visuais |
| [7. Roadmap e pendências](./frontend/07-roadmap.md) | O que já está pronto e o que falta decidir |

## ⚙️ API — como o backend funciona hoje

Para quem mantém o backend: arquitetura, como rodar, banco e deploy. Descreve **o que já está implementado**.

| Página | Conteúdo |
|---|---|
| [1. Visão geral](./api/01-visao-geral.md) | Stack, arquitetura e estrutura de pastas |
| [2. Como rodar](./api/02-como-rodar.md) | Pré-requisitos, variáveis de ambiente e scripts |
| [3. Banco de dados](./api/03-banco-de-dados.md) | Schema Prisma, migrations e seed |
| [4. Padrões do código](./api/04-padroes.md) | Validação, erros e como documentar rotas no Swagger |
| [5. Deploy na Vercel](./api/05-deploy.md) | Como o deploy funciona e passo a passo |

## Links rápidos

- Swagger (local): http://localhost:3000/docs
- OpenAPI JSON (local): http://localhost:3000/docs/openapi.json
- Health check (local): http://localhost:3000/api/health
