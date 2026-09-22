# 7. Roadmap e pendências

[← Design](./06-design.md) · [Índice](../README.md)

---

## Status dos módulos da API

| # | Módulo | Status |
|---|---|---|
| 0 | Base: banco, `GET /api/health`, Swagger em `/docs` | ✅ Pronto |
| 1 | Autenticação (`/auth/*`, `GET/PATCH /me`) | 🔜 Próximo |
| 2 | Categorias | ⏳ |
| 3 | Perfil do profissional | ⏳ |
| 4 | Serviços | ⏳ |
| 5 | Busca e perfil público | ⏳ |
| 6 | Solicitações e máquina de estados | ⏳ |
| 7 | Avaliações e denúncia | ⏳ |
| 8 | Acabamento (rate limit, revisões) | ⏳ |

Os contratos descritos em [Integração](./03-integracao.md) e [Modelos e endpoints](./04-modelos-e-endpoints.md) são a **proposta oficial**. Se algo mudar na implementação, estas páginas e o Swagger são atualizados.

Enquanto um módulo não está pronto, dá para avançar com **mocks** baseados nas [interfaces](./04-modelos-e-endpoints.md#modelos-interfaces-typescript) (ex.: um `HttpInterceptor` de mock ou `json-server`). O Swagger em `/docs` sempre reflete o que já está implementado.

## Pontos em aberto

Coisas a alinhar entre front e back — comente se tiver opinião:

1. **Upload de foto.** A v1 recebe só uma URL (`photoUrl`). Precisamos decidir onde hospedar as imagens (ex.: Vercel Blob, Cloudinary) e se o upload passa pela API ou vai direto do front.
2. **Cancelar enquanto `PENDING`.** Pela regra atual o cliente não pode cancelar uma solicitação que ainda não foi respondida. Faz sentido liberar?
3. **Quem conclui o serviço.** Proposta atual: cliente **ou** profissional podem marcar como concluído. Alternativa: só o cliente confirma (mais seguro contra avaliações "forçadas").
4. **WhatsApp no perfil público.** Mostrar sempre ou só após o aceite (proposta atual)?
5. **Conta dupla.** Uma pessoa pode ser cliente e profissional ao mesmo tempo com a mesma conta?
6. **Prazo da taxa de resposta.** Proposta: responder em até **48 h** conta como "respondida no prazo".
7. **Recuperação de senha.** Não está no escopo da v1 (exige envio de e-mail). Precisa entrar?
