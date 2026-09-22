# 1. O produto

[← Índice](../README.md) · [Próxima: Telas →](./02-telas.md)

---

**ConectaCN** conecta moradores de **Coelho Neto (MA)** a profissionais e prestadores de serviço locais — eletricista, técnico de informática, pedreiro, manicure, professor particular etc.

## O problema real

Encontrar um profissional a cidade já resolve com grupos de WhatsApp e indicação. O que falta é:

- **Confiança verificável** — saber se o profissional é bom com base em avaliações de quem realmente contratou.
- **Organização** — um jeito claro de pedir um serviço e acompanhar o andamento.

Por isso a peça central do produto é a **solicitação de serviço** (`ServiceRequest`): ela é criada e acompanhada dentro da plataforma, gera histórico e é o que libera a **avaliação**. Só quem teve um serviço concluído pode avaliar.

## Princípios para a interface

- **Navegar é livre.** Busca, perfis, serviços e avaliações são públicos — não peça login para olhar.
- **Login só na hora de agir.** Ao clicar em "Solicitar serviço" (ou qualquer ação de escrita), aí sim leve o usuário para login/cadastro e depois **devolva ele para onde estava**.
- **Reputação em destaque.** Nota, quantidade de avaliações, taxa de resposta e "ativo recentemente" são o que diferencia a plataforma de um grupo de WhatsApp.
- **Público local, muito uso em celular.** Pense *mobile first*, telas leves, textos simples.

## Fora do escopo (v1)

Sem chat interno, sem pagamento, sem mapa/geolocalização, sem notificações em tempo real, sem favoritos (fica para uma fase futura). O contato final pode acontecer pelo **WhatsApp** (link `wa.me`).

## Perfis de usuário

| Perfil | Quem é | O que faz |
|---|---|---|
| **Visitante** | Qualquer pessoa sem login | Busca profissionais, vê perfis, serviços e avaliações |
| **Cliente** (`CLIENT`) | Morador que quer contratar | Tudo do visitante + envia solicitações, acompanha, cancela, avalia, denuncia avaliação |
| **Profissional** (`PROFESSIONAL`) | Prestador de serviço | Mantém o perfil e os serviços, recebe solicitações, aceita/recusa, conclui/cancela |

O tipo é escolhido **no cadastro** e não muda depois. Uma mesma pessoa que queira ser as duas coisas precisa de duas contas (ver [pendências](./07-roadmap.md#pontos-em-aberto)).

## Jornada do cliente

1. Busca por categoria (ex.: "Elétrica") e/ou bairro.
2. Abre um perfil, vê serviços, preços "a partir de" e avaliações.
3. Clica em **Solicitar serviço** → faz login/cadastro se precisar → escreve uma mensagem (opcionalmente escolhendo um serviço específico).
4. Acompanha o status em **Minhas solicitações**.
5. Quando aceita, pode falar com o profissional pelo WhatsApp.
6. Após a conclusão, **avalia** (nota de 1 a 5 + comentário).

## Jornada do profissional

1. Cadastra-se como profissional.
2. Completa o perfil: bio, foto, WhatsApp, categorias em que atua.
3. Cadastra seus serviços (título, descrição, preço a partir de).
4. Recebe solicitações → **aceita** ou **recusa** (rápido, pois isso conta na taxa de resposta).
5. Marca como **concluído** (ou cancela) e acompanha as avaliações recebidas.
