---
version: alpha
name: Cinefita Wireframe
description: Protótipo de baixa fidelidade da jornada de descoberta e compra de cinema físico.
colors:
  background: '#f4f4f4'
  paper: '#ffffff'
  surface: '#e7e7e7'
  soft: '#ededed'
  line: '#c5c5c5'
  ink: '#292929'
  muted: '#595959'
  action: '#3c3c3c'
  focus: '#111111'
typography:
  sans:
    fontFamily: 'Arial, Helvetica, sans-serif'
    fontSize: '16px'
    lineHeight: '1.55'
  utility:
    fontFamily: 'Courier New, monospace'
    fontSize: '12px'
    lineHeight: '1.5'
rounded:
  DEFAULT: '3px'
spacing:
  page: '1180px'
  panel: '24px'
components:
  button:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.DEFAULT}'
---

## Overview

Implementação independente dos cinco wireframes exportados do Figma em `output/pdf/WIREFRAME.pdf` do projeto Cinefita de origem. Público: quem inicia uma coleção de filmes físicos; idioma pt-BR. A paleta cinza e os cartazes representados por blocos cruzados preservam a baixa fidelidade solicitada. Não aplicar o tema cinematográfico colorido da loja final a este estudo.

## Colors

`src/styles.css :root` é o proprietário canônico dos tokens. Os nomes do frontmatter mapeiam para --bg, --paper, --surface, --soft, --line, --ink, --muted, --action e --focus. Todos os componentes consomem essas variáveis. A borda cinza clara separa blocos; texto e foco usam as cores escuras.

## Typography

Arial e Helvetica preservam o aspecto funcional do desenho. Courier New identifica as telas e os espaços reservados. Sem fontes externas. H1 de 36px no computador e 31px no celular; corpo de 16px e rótulos de 14px.

## Layout

Contêiner máximo de 1180px, três cards por linha. Busca com filtros laterais, produto em duas colunas, carrinho e checkout com resumo lateral. Até 650px, colunas empilhadas e cards em uma coluna, como na referência móvel. Resumo permanece antes da ação de concluir. A faixa com cinco links permite revisar cada tela. Rolagem natural.

## Elevation & Depth

Superfícies planas. Sombra somente na mensagem temporária de status, que fica acima do conteúdo.

## Shapes

Blocos retangulares com raio de 3px; marca e confirmação são construídas com texto e CSS. Sem imagens externas ou elementos em movimento.

## Components

`src/app.js` contém o construtor DOM compartilhado, os cards, campos, selects, mensagens e resumos. Regras comerciais e parcelamento reutilizam `marketplace-core.js` e `checkout-core.js` do projeto de origem. Há 33 filmes de demonstração em `data.js`; preços existentes foram preservados.

## Do's and Don'ts

Preservar nomes reais dos filmes e identificação demonstrativa de preços e vendedores. Usar links e controles nativos. Não introduzir pagamento, autenticação, envio de formulários ou imagens finais no wireframe. Entradas de texto são inseridas como texto no DOM.
