# 6. Design e ferramentas

[← Regras de negócio](./05-regras-de-negocio.md) · [Índice](../README.md) · [Próxima: Roadmap →](./07-roadmap.md)

---

> Sugestões de bibliotecas, referências visuais e ferramentas para o frontend em **Angular**. Nada aqui é obrigatório — é um ponto de partida para decidir rápido.

## 1. Biblioteca de componentes

| Biblioteca | Site | Quando escolher |
|---|---|---|
| **Spartan UI** | [spartan.ng](https://spartan.ng) | O "shadcn/ui do Angular": Tailwind + componentes sem estilo imposto, copiados para o projeto. **Recomendado.** |
| **Zard UI** | [zardui.com](https://zardui.com) | Outra alternativa no estilo shadcn; mais nova, comunidade menor |
| **PrimeNG** | [primeng.org](https://primeng.org) | Muitos componentes prontos (tabela, calendário, upload). Mais rápido de entregar, menos personalizável |
| **Angular Material** | [material.angular.dev](https://material.angular.dev) | Oficial do Google, estável e acessível; visual bem "Google" |
| **Taiga UI** | [taiga-ui.dev](https://taiga-ui.dev) | Completa e bonita; curva de aprendizado maior |
| **Flowbite** | [flowbite.com](https://flowbite.com) | Componentes em Tailwind com guia para Angular |
| **daisyUI** | [daisyui.com](https://daisyui.com) | Plugin do Tailwind com classes prontas (`btn`, `card`); funciona em qualquer framework |

### Recomendação

- **Spartan UI + Tailwind CSS** — para um MVP *mobile first*, leve e com identidade própria. Quem já conhece shadcn/ui se sente em casa.
- **PrimeNG** — se a prioridade for entregar rápido, sem investir em design.

Evite misturar duas bibliotecas de componentes: escolha uma e mantenha a consistência.

---

## 2. Inspiração de design

| Site | Para quê |
|---|---|
| [mobbin.com](https://mobbin.com) | Capturas de apps reais, organizadas por fluxo (login, busca, perfil, checkout). A melhor para telas mobile |
| [dribbble.com](https://dribbble.com) | Ideias visuais. Busque *"service marketplace"*, *"handyman app"*, *"booking app"*, *"provider profile"* |
| [behance.net](https://www.behance.net) | Estudos de caso completos, com o raciocínio do design |
| [figma.com/community](https://www.figma.com/community) | Kits gratuitos — o kit do **shadcn/ui** serve de base visual para o Spartan |

### Apps parecidos para referência

- **GetNinjas** — o mais próximo em conceito no Brasil (pedido de serviço → profissional responde).
- **Thumbtack** e **TaskRabbit** — perfis de profissional, avaliações e fluxo de solicitação.
- **iFood** e **Airbnb** — cards, estrelas, filtros por categoria e busca.

---

## 3. Ferramentas de apoio

| Categoria | Ferramenta | Observação |
|---|---|---|
| Ícones | [lucide.dev](https://lucide.dev) | Mesmo conjunto do shadcn/Spartan; pacote `lucide-angular` |
| Paleta de cores | [realtimecolors.com](https://www.realtimecolors.com) | Testa a paleta aplicada numa página de exemplo |
| Paleta de cores | [coolors.co](https://coolors.co) | Gera e ajusta combinações |
| Contraste | [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/) | Confere se o texto é legível sobre o fundo |
| Fontes | [fonts.google.com](https://fonts.google.com) | **Inter** ou **Plus Jakarta Sans** combinam com esse estilo |
| Ilustrações | [undraw.co](https://undraw.co) | Ilustrações gratuitas para estados vazios ("nenhuma solicitação ainda") |

---

## 4. Dicas de design específicas do ConectaCN

### Público e contexto

- **Mobile first.** A maioria vai acessar pelo celular, muitas vezes com internet móvel — telas leves, poucas imagens pesadas.
- **Linguagem simples.** "Pedir orçamento", "Aguardando resposta", "Serviço concluído". Evite termos técnicos.
- **Botões grandes** e áreas de toque confortáveis (mínimo ~44px de altura).

### Confiança em primeiro plano

O diferencial do produto é **confiança verificável**, então no card e no perfil do profissional destaque:

- Nota em estrelas + número de avaliações (★ 4,8 · 23 avaliações). Sem avaliações → selo "Novo".
- Taxa de resposta ("Responde 92% das solicitações").
- Atividade recente ("Ativo hoje").
- Foto real e bio curta.

### Status das solicitações

Use cor **e** texto (nunca só cor, por acessibilidade):

| Status | Label | Cor sugerida |
|---|---|---|
| `PENDING` | Aguardando resposta | Amarelo/âmbar |
| `ACCEPTED` | Aceita | Azul |
| `DECLINED` | Recusada | Cinza |
| `COMPLETED` | Concluída | Verde |
| `CANCELLED` | Cancelada | Vermelho |

### Estados que não podem faltar

- **Carregando** — prefira *skeletons* (blocos cinza no formato do conteúdo) a spinners.
- **Vazio** — mensagem + ação ("Você ainda não fez solicitações. Buscar profissionais").
- **Erro** — mensagem clara + botão "Tentar novamente".
- **Confirmação** antes de ações irreversíveis (recusar, cancelar, concluir).

### Identidade visual

- Uma cor principal forte para ações (ex.: verde ou azul) e neutros para o resto.
- Botão do **WhatsApp** com o verde da marca e ícone reconhecível — é um ponto de conversão importante.
- Suporte a **tema escuro** é opcional na v1 (Tailwind e Spartan facilitam se quiserem fazer).
