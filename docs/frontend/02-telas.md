# 2. Telas

[← O produto](./01-produto.md) · [Índice](../README.md) · [Próxima: Integração →](./03-integracao.md)

---

Rotas Angular são sugestões — fique à vontade para ajustar. Os endpoints estão detalhados em [Modelos e endpoints](./04-modelos-e-endpoints.md).

## Públicas

| Tela | Rota sugerida | Endpoints |
|---|---|---|
| Home (busca + categorias) | `/` | `GET /categories` |
| Resultado de busca | `/profissionais?categoria=eletrica&bairro=Centro` | `GET /professionals` |
| Perfil público do profissional | `/profissionais/:id` | `GET /professionals/:id`, `GET /professionals/:id/services`, `GET /professionals/:id/reviews` |
| Login | `/entrar` | `POST /auth/login` |
| Cadastro (escolha Cliente/Profissional) | `/cadastro` | `POST /auth/register` |
| Verificação do e-mail (código de 6 dígitos) | `/verificar-email?email=...` | `POST /auth/verify-email`, `POST /auth/resend-code` |

## Cliente (logado)

| Tela | Rota sugerida | Endpoints |
|---|---|---|
| Nova solicitação (modal ou página) | `/profissionais/:id/solicitar` | `POST /requests` |
| Minhas solicitações | `/minhas-solicitacoes` | `GET /requests/sent` |
| Detalhe da solicitação | `/solicitacoes/:id` | `GET /requests/:id`, `POST /requests/:id/cancel`, `POST /requests/:id/complete` |
| Avaliar (modal no detalhe) | — | `POST /requests/:id/review` |
| Minha conta | `/conta` | `GET /me`, `PATCH /me` |

## Profissional (logado)

| Tela | Rota sugerida | Endpoints |
|---|---|---|
| Painel / solicitações recebidas (abas por status) | `/painel` | `GET /requests/received?status=PENDING` |
| Detalhe da solicitação | `/painel/solicitacoes/:id` | `GET /requests/:id`, `POST .../accept`, `.../decline`, `.../complete`, `.../cancel` |
| Editar perfil profissional | `/painel/perfil` | `GET /me`, `PATCH /me/professional-profile`, `GET /categories` |
| Meus serviços (lista + formulário) | `/painel/servicos` | `GET/POST/PATCH/DELETE /me/services` |
| Minhas avaliações | `/painel/avaliacoes` | `GET /professionals/:meuId/reviews` |

## Componentes reutilizáveis que valem a pena

- **Card de profissional** — foto, nome, categorias, nota ★, nº de avaliações, taxa de resposta, "ativo há X dias".
- **Badge de status** da solicitação — cores e labels em [Regras de negócio](./05-regras-de-negocio.md#labels-e-ações-por-status).
- **Estrelas** — exibição e input de 1 a 5.
- **Paginação** — mesmo formato em todas as listas.
- **Botão WhatsApp** — monta o link `wa.me`.
- **Estados de tela** — carregando (skeleton), vazio e erro. Ver [Design](./06-design.md#estados-que-não-podem-faltar).
