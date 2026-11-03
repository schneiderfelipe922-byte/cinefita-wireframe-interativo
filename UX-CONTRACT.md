# Contrato de interação

Fluxo: início → busca/categoria → produto → carrinho → checkout → confirmação. Rotas por hash permitem publicar em qualquer subpasta do GitHub Pages e abrir o HTML diretamente. Voltar do produto preserva os filtros da lista; recarregar a lista preserva os parâmetros da URL.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
| --- | --- | --- | --- | --- |
| Select/Listbox | selectField em src/app.js e select nativo | Este contrato | Filtros, ordem, parcelas; popup do sistema | Navegador: seleção e teclado |
| Form | inputField e checkout em src/app.js | Este contrato | Erros associados, foco no primeiro inválido | Navegador: inválido, recuperação, sucesso |
| Scrollbar | src/styles.css global | DESIGN.md | Forced colors nativo | Inspeção no navegador |
| Toast | notify em src/app.js | Este contrato | Status educado compartilhado | Navegador: adicionar e remover |
| CRUD | catálogo/cart em src/app.js e marketplace-core.js | Este contrato | Adicionar, quantidade 1–99, remover, readicionar | tests/core.test.cjs e navegador |

Busca local sem requisições, normalizada por acentos, combinada com gênero, formato, vendedor, conservação e ordenação. Limpar retorna foco ao campo de busca. Sem resultados oferece recuperação. Não há carregamento remoto, sessão ou concorrência de API.

O carrinho identifica cada oferta separadamente, calcula em centavos e agrupa por vendedor. Retirada gratuita apenas na loja oficial; envio ilustrativo de R$ 19,90 por vendedor. A conservação não informada é explícita. IMDb não é reputação de vendedor. Não há exclusão irreversível.

Somente IDs de oferta e quantidades ficam no localStorage, com chave exclusiva `cinefitaWireframe.cart.v1`. Dados restaurados passam pelo núcleo comercial e não definem preço. Armazenamento bloqueado mantém memória na aba e aviso permanente. Dados pessoais do formulário não são persistidos nem enviados.

Checkout exige nome e e-mail; endereço somente com envio. Erros ficam associados ao campo, preservam conteúdo e levam foco ao primeiro inválido. PIX e débito à vista; crédito em 1–12 parcelas sem juros, com centavos distribuídos exatamente. Nenhum número de cartão ou código PIX é solicitado. Sucesso informa o total, entrega por vendedor e ausência de cobrança; limpa o carrinho e descarta o formulário.

Todos os controles são nativos e operáveis por teclado, com foco visível. Mudança de tela atualiza título e foco no H1. Quantidade preserva foco quando o controle continua habilitado. Navegação, resumo e formulários empilham em telas estreitas. Não há movimento, modal, seletor de data, upload ou autenticação.
