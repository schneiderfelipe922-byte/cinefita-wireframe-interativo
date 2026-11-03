# Cinefita · Wireframe interativo

Protótipo navegável em HTML, CSS e JavaScript baseado nas cinco telas de baixa fidelidade do wireframe Cinefita: início, busca/categoria, produto, carrinho e checkout. Layout responsivo para computador e celular, com blocos cinza no lugar dos cartazes finais.

**[Abrir o wireframe publicado](https://schneiderfelipe922-byte.github.io/cinefita-wireframe-interativo/)**

## Experimentar

1. Abra o catálogo e combine busca, gênero, formato, vendedor e conservação.
2. Abra um filme e escolha uma das ofertas demonstrativas.
3. Adicione ao carrinho, altere a quantidade e confira os vendedores.
4. Continue para a compra, use dados fictícios, escolha entrega e pagamento.
5. Conclua a simulação para ver a confirmação. Não há cobrança ou envio real.

A faixa superior dá acesso direto às cinco telas. O checkout vazio orienta a adicionar uma oferta. A amostra contém 33 filmes com dados e preços preservados do projeto Cinefita de origem. Parceiros são fictícios.

## Executar localmente

Abra `index.html` no navegador ou execute, nesta pasta:

```sh
python3 -m http.server 8000
```

Abra `http://localhost:8000`. Não exige build, instalação de pacotes, backend ou chaves de API.

## Arquivos

- `index.html`: estrutura e carregamento do protótipo.
- `src/app.js`: telas, navegação, filtros, carrinho e formulário.
- `src/styles.css`: tokens cinza e layout responsivo.
- `src/data.js`: amostra editorial do projeto de origem.
- `src/marketplace-core.js`: ofertas, vendedores, restauração e totais reutilizados.
- `src/checkout-core.js`: pagamento e parcelas em centavos reutilizados.
- `DESIGN.md` e `UX-CONTRACT.md`: decisões visuais e de interação.
- `evidencias/`: capturas e registros da verificação.

## Verificação

```sh
node --test tests/core.test.cjs
```

Cinco testes cobrem ofertas, restauração segura, frete por vendedor, filtros e parcelas. A verificação no navegador percorreu busca sem resultados, filtros combinados, seleção de oferta, quantidade, recarga, dois vendedores, formulário inválido, conclusão e remoção do último item. As cinco telas foram conferidas em 320, 390, 768 e 1440px, sem rolagem horizontal ou IDs duplicados. O checkout preenchido também foi conferido nessas larguras. Detalhes e limites em `evidencias/navegador.json`.

## Armazenamento e limites

Somente ofertas e quantidades ficam no armazenamento local, com chave própria deste protótipo. Nenhum dado do formulário é persistido ou transmitido. Limpar o armazenamento do navegador remove o carrinho. Com armazenamento bloqueado, as escolhas ficam em memória na aba e um aviso é exibido.

O protótipo é independente da loja final e não oferece autenticação, backend, pagamento real, publicação de anúncios ou sincronização entre dispositivos.

## GitHub Pages

Publicação estática a partir de `main`, pasta raiz `/`, com `.nojekyll`. As rotas usam hash e funcionam na subpasta do repositório.
