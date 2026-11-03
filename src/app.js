'use strict';
(() => {
  const M = CinefitaMarketplace;
  const catalog = M.createCatalog(films);
  const key = 'cinefitaWireframe.cart.v1';
  const main = document.getElementById('conteudo');
  document.querySelector('.skip').addEventListener('click', event => {event.preventDefault(); main.focus();});
  const money = cents => (cents / 100).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let cart = [], storageOK = true, toastTimer, selectedOffer, checkoutState;
  let lastCatalog = '#/catalogo', featureIndex = 0;
  const features = ['frankenstein', 'psycho', 'hellraiser'].map(id => films.find(f => f.image === id));

  // Every screen uses this DOM builder. User input is always assigned as text.
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) {
      if (name.startsWith('on')) node.addEventListener(name.slice(2).toLowerCase(), value);
      else if (name === 'class') node.className = value;
      else if (['checked','disabled','hidden','required','open','selected'].includes(name)) node[name] = Boolean(value);
      else node.setAttribute(name, value);
    }
    for (const child of children.flat(Infinity)) {
      if (child !== null && child !== undefined && child !== false) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
  }
  const link = (text, href, classes = '') => el('a', {href, class:classes}, text);
  const button = (text, action, classes = '', extra = {}) => el('button', {type:'button', class:classes, onClick:action, ...extra}, text);
  function placeholder(film, feature = false) {
    return el('div', {class:'placeholder', 'aria-label':`Espaço reservado para o cartaz de ${film.title}`},
      el('span', {class:'placeholder-title'}, feature ? 'CARTAZ DE DESTAQUE' : 'CARTAZ COMPLETO'),
      el('span', {class:'placeholder-caption'}, film.title));
  }
  function notify(text) {
    clearTimeout(toastTimer);
    document.getElementById('feedback').textContent = text;
    toastTimer = setTimeout(() => { document.getElementById('feedback').textContent = ''; }, 5000);
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(cart.map(({offerId, qty}) => ({offerId, qty})))); }
    catch { storageOK = false; }
    document.getElementById('storage-notice').hidden = storageOK;
    document.getElementById('cart-count').textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  }
  try { cart = catalog.restore(JSON.parse(localStorage.getItem(key) || '[]')).items; }
  catch { storageOK = false; }
  save();
  function heading(title, eyebrow) {
    return el('div', {}, el('p', {class:'eyebrow'}, eyebrow), el('h1', {tabindex:'-1'}, title));
  }
  function card(film, options = {}) {
    const offers = catalog.matching(film.image, options);
    return el('article', {class:'card'}, placeholder(film), el('h3', {}, film.title),
      el('p', {class:'meta'}, `${film.year} · ${film.category}`),
      el('p', {class:'meta'}, [...new Set(offers.map(o => o.format))].join(' / ')),
      el('p', {class:'price'}, `A partir de ${money(Math.min(...offers.map(o => o.priceCents)))}`),
      el('p', {class:'meta'}, `${offers.length} ${offers.length === 1 ? 'oferta demonstrativa' : 'ofertas demonstrativas'}`),
      link('Ver ofertas', `#/produto?id=${film.image}&offer=${offers[0].id}`, 'button block'));
  }
  function home() {
    const feature = el('div', {class:'feature'});
    function paintFeature() {
      const film = features[featureIndex];
      feature.replaceChildren(placeholder(film, true), el('div', {class:'feature-controls'},
        button('←', () => {featureIndex = (featureIndex + features.length - 1) % features.length; paintFeature(); document.getElementById('previous-feature').focus();}, '', {id:'previous-feature', 'aria-label':'Destaque anterior'}),
        el('p', {'aria-live':'polite'}, link(`${film.title} · ${film.year}`, `#/produto?id=${film.image}`)),
        button('→', () => {featureIndex = (featureIndex + 1) % features.length; paintFeature(); document.getElementById('next-feature').focus();}, '', {id:'next-feature', 'aria-label':'Próximo destaque'})));
    }
    paintFeature();
    return [heading('Home', '01 / Início'),
      el('section', {class:'hero', 'aria-label':'Apresentação'},
        el('div', {}, el('h2', {}, 'Cinema físico, memória viva.'), el('p', {class:'muted'}, 'Descubra filmes, compare edições e comece sua coleção.'), link('Explorar catálogo →', '#/catalogo', 'button primary')), feature),
      el('section', {'aria-labelledby':'edicoes'}, el('div', {class:'section-heading'}, el('h2', {id:'edicoes'}, 'Edições para começar'), link('Ver todo o catálogo →', '#/catalogo')),
        el('div', {class:'grid'}, ['frankenstein','psycho','hellraiser'].map(id => card(films.find(f => f.image === id)))) )];
  }
  function selectField(label, id, options, value, change) {
    return el('div', {class:'field'}, el('label', {for:id}, label), el('select', {id, name:id, onChange:change}, options.map(([v, name]) => el('option', {value:v, selected:v === value}, name))));
  }
  function catalogPage(params) {
    lastCatalog = location.hash;
    const state = Object.fromEntries(['q','genre','format','seller','condition','sort'].map(k => [k, params.get(k) || '']));
    const results = el('div', {id:'catalog-results'}), count = el('p', {role:'status', 'aria-live':'polite'});
    const search = el('input', {id:'search', type:'search', name:'q', placeholder:'Ex.: Frankenstein', value:state.q, onInput:event => {state.q = event.target.value; update();}});
    function update() {
      const query = new URLSearchParams(Object.entries(state).filter(([,value]) => value));
      const next = '#/catalogo' + (query.size ? '?' + query : '');
      history.replaceState(null, '', next); lastCatalog = next;
      let found = films.filter(f => (!state.q || normalize(`${f.title} ${f.aliases || ''}`).includes(normalize(state.q))) && (!state.genre || f.category === state.genre));
      found = catalog.select(found, {format:state.format, seller:state.seller, condition:state.condition, sort:state.sort});
      if (state.sort === 'title') found.sort((a,b) => a.title.localeCompare(b.title, 'pt-BR'));
      if (state.sort === 'year') found.sort((a,b) => a.year - b.year);
      count.textContent = `${found.length} ${found.length === 1 ? 'filme encontrado' : 'filmes encontrados'}`;
      results.replaceChildren(found.length ? el('div', {class:'grid'}, found.map(f => card(f, {format:state.format,seller:state.seller,condition:state.condition}))) : el('div', {class:'empty'}, el('h2', {}, 'Nenhum título encontrado'), el('p', {}, 'Tente outro nome ou remova os filtros.'), button('Limpar filtros', clear, 'primary')));
    }
    function change(name) { return event => {state[name] = event.target.value; update();}; }
    function clear() {
      for (const k of Object.keys(state)) state[k] = '';
      search.value = '';
      for (const control of filters.querySelectorAll('select')) control.value = '';
      sort.querySelector('select').value = ''; update(); search.focus();
    }
    const filters = el('details', {class:'filter-panel', open:true}, el('summary', {}, 'Filtros'), el('div', {class:'filter-fields'},
      selectField('Gênero', 'genre', [['','Todos'], ...[...new Set(films.map(f => f.category))].sort().map(x => [x,x])], state.genre, change('genre')),
      selectField('Formato', 'format', [['','Todos'],['VHS','VHS'],['DVD','DVD'],['BLU-RAY','Blu-ray'],['FILME','Película']], state.format, change('format')),
      selectField('Vendedor', 'seller', [['','Todos'], ...catalog.sellers.map(s => [s.id,s.name])], state.seller, change('seller')),
      selectField('Conservação', 'condition', [['','Todas'], ...Object.entries(M.conditions)], state.condition, change('condition')),
      button('Limpar filtros', clear, 'block')));
    const sort = selectField('Ordenar por', 'sort', [['','Relevância'],['title','Título A–Z'],['price-low','Menor preço'],['price-high','Maior preço'],['year','Mais antigos']], state.sort, change('sort'));
    sort.style.marginBottom = '0';
    update();
    return [heading('Busca / Categoria', '02 / Descobrir filmes'),
      el('div', {class:'search-box'}, el('label', {for:'search'}, 'Buscar no acervo'), el('div', {class:'search-row'}, search,
        button('Limpar busca', () => {state.q = ''; search.value = ''; update(); search.focus();}))),
      el('div', {class:'catalog-layout'}, filters, el('section', {'aria-label':'Resultados'}, el('div', {class:'results-bar'}, count, sort), results))];
  }
  function product(params) {
    const film = films.find(f => f.image === params.get('id'));
    if (!film) return [heading('Filme não encontrado', '03 / Produto'), el('p', {}, 'O endereço não corresponde a um título deste protótipo.'), link('Voltar ao catálogo', '#/catalogo', 'button primary')];
    const offers = catalog.matching(film.image);
    selectedOffer = offers.some(o => o.id === params.get('offer')) ? params.get('offer') : offers[0].id;
    const add = button('Adicionar oferta ao carrinho', () => {
      const existing = cart.find(i => i.offerId === selectedOffer);
      if (existing) existing.qty = Math.min(99, existing.qty + 1); else cart.push(catalog.item(selectedOffer));
      checkoutState = undefined; save(); location.hash = '/carrinho'; notify(`${film.title} adicionado ao carrinho.`);
    }, 'primary block', {id:'add-to-cart'});
    return [link('← Voltar aos resultados', lastCatalog, 'back-link'), heading(film.title, '03 / Produto'),
      el('div', {class:'product-layout'}, placeholder(film), el('div', {},
        el('p', {class:'muted'}, `${film.year} · ${film.category}`),
        el('fieldset', {}, el('legend', {}, 'Compare e escolha uma oferta'), offers.map(o => el('label', {class:'offer'},
          el('input', {type:'radio', name:'offer', value:o.id, checked:selectedOffer === o.id, onChange:() => {selectedOffer = o.id; const q = new URLSearchParams({id:film.image,offer:o.id}); history.replaceState(null,'','#/produto?'+q);}}),
          el('span', {class:'offer-content'}, el('span', {class:'seller'}, catalog.seller(o.sellerId).name), el('span', {}, o.format === 'FILME' ? 'Película' : o.format),
            el('span', {class:'muted'}, M.conditions[o.condition]), el('span', {class:'price'}, money(o.priceCents)),
            el('span', {class:'muted'}, catalog.seller(o.sellerId).pickup ? 'Retirada grátis ou envio de R$ 19,90' : 'Envio de R$ 19,90'),
            el('span', {class:'muted'}, o.sellerId === 'cinefita' ? 'Oferta de demonstração' : 'Parceiro fictício · oferta de demonstração'))))),
        add, el('p', {class:'small muted', style:'margin-top:12px'}, 'Preços ilustrativos. Não há compra ou estoque real.'))),
      el('details', {class:'help'}, el('summary', {}, 'Ajuda de formatos'), el('p', {}, 'VHS usa videocassete. DVD e Blu-ray precisam de aparelhos compatíveis. Película exige um projetor e não é um disco. Confira o formato da oferta antes de escolher.')),
      el('details', {class:'help', open:true}, el('summary', {}, 'Sinopse e ficha técnica'), el('p', {}, film.desc), el('dl', {}, el('dt', {}, 'Título'), el('dd', {}, film.title), el('dt', {}, 'Ano'), el('dd', {}, film.year), el('dt', {}, 'Gênero'), el('dd', {}, film.category)))];
  }
  function summary(items, delivery, checkout = false) {
    const totals = M.totals(items, delivery);
    return el('div', {class:'panel summary'}, el('h2', {}, checkout ? 'Revise sua compra' : 'Resumo dos itens'),
      checkout ? totals.groups.map(g => el('div', {}, el('h3', {class:'small'}, g.seller.name), g.items.map(i => el('p', {class:'small'}, `${i.qty} × ${i.title} · ${money(i.priceCents * i.qty)}`)))) : null,
      el('div', {class:'summary-line'}, el('span', {}, 'Subtotal'), el('span', {}, money(totals.subtotalCents))),
      checkout ? el('div', {class:'summary-line'}, el('span', {}, 'Entregas'), el('span', {}, money(totals.shippingCents))) : el('p', {class:'small muted'}, 'Entrega calculada na próxima etapa, por vendedor.'),
      el('div', {class:'summary-line total'}, el('span', {}, checkout ? 'Total' : 'Subtotal'), el('span', {id:'order-total'}, money(checkout ? totals.totalCents : totals.subtotalCents))));
  }
  function cartPage() {
    if (!cart.length) return [heading('Carrinho', '04 / Conferir itens'), emptyCart()];
    const groups = M.groups(cart);
    function adjust(id, delta) {
      const item = cart.find(i => i.offerId === id); item.qty = Math.min(99, Math.max(1,item.qty + delta));
      checkoutState = undefined; save(); render(false); document.getElementById(`${id}-${delta > 0 ? 'more' : 'less'}`).focus();
    }
    const aside = summary(cart, {}, false);
    aside.append(link('Continuar para compra', '#/checkout', 'button primary block'), link('Continuar explorando', '#/catalogo', 'button block'));
    return [heading('Carrinho', '04 / Conferir itens'), el('div', {class:'two-column'}, el('div', {}, groups.map(g => el('section', {class:'panel'},
      el('h2', {}, g.seller.name), el('p', {class:'small muted'}, g.seller.official ? 'Loja oficial · ofertas demonstrativas' : 'Vendedor parceiro fictício'),
      g.items.map(item => el('article', {class:'cart-item'}, placeholder(item), el('div', {}, el('h3', {}, link(item.title, '#/produto?id='+item.image)),
        el('p', {class:'muted'}, `${item.format} · ${money(item.priceCents)} por unidade`), el('div', {class:'cart-controls'},
          el('div', {class:'quantity', role:'group', 'aria-label':`Quantidade de ${item.title}`},
            button('−', () => adjust(item.offerId,-1), '', {id:item.offerId+'-less', 'aria-label':`Diminuir quantidade de ${item.title}`, disabled:item.qty === 1}),
            el('output', {'aria-live':'polite'}, item.qty),
            button('+', () => adjust(item.offerId,1), '', {id:item.offerId+'-more','aria-label':`Aumentar quantidade de ${item.title}`, disabled:item.qty === 99})),
          button('Remover', () => {cart = cart.filter(i => i.offerId !== item.offerId); checkoutState = undefined; save(); render(); notify(`${item.title} removido. Você pode adicioná-lo novamente pelo catálogo.`);}, 'remove', {'aria-label':`Remover ${item.title} de ${g.seller.name}`})),
        el('p', {style:'margin-top:12px;font-weight:bold'}, money(item.priceCents * item.qty))))),
      el('div', {class:'seller-total'}, el('span', {}, 'Subtotal do vendedor'), el('span', {}, money(g.subtotalCents)))))), aside)];
  }
  function emptyCart() {
    return el('div', {class:'empty'}, el('h2', {}, 'Seu carrinho está vazio'), el('p', {}, 'Escolha uma oferta no catálogo para experimentar a compra.'), link('Explorar catálogo', '#/catalogo', 'button primary'));
  }
  function inputField(label, name, type = 'text', autocomplete = '', required = true) {
    const error = el('p', {id:name+'-error', class:'error', hidden:true});
    const input = el('input', {id:name, name, type, autocomplete, required, 'aria-describedby':name+'-error', maxlength:name === 'name' ? '100' : '180',
      onInput:() => {input.removeAttribute('aria-invalid'); error.hidden = true;}});
    return el('div', {class:'field'}, el('label', {for:name}, label), input, error);
  }
  function checkout() {
    if (!cart.length) return [heading('Checkout', '05 / Compra demonstrativa'), emptyCart()];
    checkoutState ||= {delivery:Object.fromEntries(M.groups(cart).map(g => [g.seller.id,g.seller.pickup ? 'pickup' : 'shipping'])), payment:'pix', installments:1};
    const state = checkoutState, review = el('aside', {id:'review'});
    const address = el('fieldset', {class:'address'}, el('legend', {}, 'Endereço para entrega'),
      el('p', {class:'small muted'}, 'Use somente dados fictícios. Os campos não são enviados nem salvos.'),
      inputField('CEP (00000-000)', 'zip', 'text', 'postal-code'), inputField('Rua', 'street', 'text', 'address-line1'),
      el('div', {class:'inline-fields'}, inputField('Número', 'number', 'text'), inputField('Bairro', 'district', 'text')),
      el('div', {class:'inline-fields'}, inputField('Cidade', 'city', 'text', 'address-level2'), inputField('Estado (UF)', 'state', 'text', 'address-level1')));
    const installmentField = selectField('Parcelamento sem juros', 'installments', Array.from({length:12},(_,i) => [String(i+1),`${i+1} ${i ? 'parcelas' : 'parcela'}`]), String(state.installments), e => {state.installments = Number(e.target.value); updateReview();});
    const paymentInfo = el('p', {class:'small', id:'payment-info', 'aria-live':'polite'});
    function updateReview() {
      const totals = M.totals(cart,state.delivery);
      const quote = CinefitaCheckout.quote(totals.totalCents,state.payment,state.payment === 'credit' ? state.installments : 1);
      const box = summary(cart,state.delivery,true);
      box.append(el('p', {class:'small'}, `Pagamento: ${quote.label}`), button('Concluir compra demonstrativa', () => form.requestSubmit(), 'primary block', {id:'complete-purchase'}),
        el('p', {class:'small muted', style:'margin-top:12px'}, 'Simulação sem cobrança ou envio de pedido.'), link('← Voltar ao carrinho', '#/carrinho', 'back-link'));
      review.replaceChildren(box);
      address.hidden = !totals.groups.some(g => g.method === 'shipping');
      address.disabled = address.hidden;
      installmentField.hidden = state.payment !== 'credit';
      installmentField.querySelector('select').disabled = installmentField.hidden;
      paymentInfo.textContent = state.payment === 'credit' ? `${quote.installments.length} parcelas: ${quote.installments.map(money).join(' + ')}. Total ${money(totals.totalCents)}.` : `${quote.label} à vista · ${money(totals.totalCents)}. Nenhum dado de pagamento é solicitado.`;
    }
    const form = el('form', {id:'checkout-form', novalidate:'', onSubmit:event => {
      event.preventDefault();
      let firstInvalid;
      for (const input of form.querySelectorAll('input[required]')) {
        if (input.closest('fieldset')?.disabled) continue;
        const value = input.value.trim();
        let message = value ? '' : 'Preencha este campo.';
        if (value && input.name === 'name' && value.length < 2) message = 'Informe um nome com pelo menos 2 caracteres.';
        if (value && input.type === 'email' && !input.validity.valid) message = 'Informe um e-mail válido, como nome@example.com.';
        if (value && input.name === 'zip' && !/^\d{5}-?\d{3}$/.test(value)) message = 'Informe um CEP com 8 números.';
        if (value && input.name === 'state' && !/^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/i.test(value)) message = 'Informe uma UF válida, como SP.';
        const error = document.getElementById(input.name+'-error');
        error.textContent = message; error.hidden = !message;
        if (message) {input.setAttribute('aria-invalid','true'); firstInvalid ||= input;} else input.removeAttribute('aria-invalid');
      }
      if (firstInvalid) {firstInvalid.focus(); notify('Revise os campos destacados antes de continuar.'); return;}
      const totals = M.totals(cart,state.delivery);
      const quote = CinefitaCheckout.quote(totals.totalCents,state.payment,state.payment === 'credit' ? state.installments : 1);
      cart = []; save(); checkoutState = undefined;
      // The form and its personal data are discarded; only the total is shown.
      main.replaceChildren(el('section', {class:'success'}, el('div', {class:'success-mark', 'aria-hidden':'true'}, '✓'),
        el('p', {class:'eyebrow'}, '05 / Simulação concluída'), el('h1', {tabindex:'-1'}, 'Compra demonstrativa concluída'),
        el('p', {}, 'Você percorreu todo o fluxo do wireframe.'),
        totals.groups.map(g => el('p', {class:'small'}, `${g.seller.name}: ${g.items.reduce((s,i)=>s+i.qty,0)} item(ns) · ${g.method === 'pickup' ? 'retirada grátis' : 'envio demonstrativo'}`)),
        el('p', {}, el('strong', {}, `Total simulado: ${money(totals.totalCents)}`)), el('p', {}, `Pagamento: ${quote.label}${quote.installments.length > 1 ? ` em ${quote.installments.length} parcelas` : ' à vista'}.`),
        el('p', {class:'notice'}, 'Nenhum pagamento foi processado, nenhum pedido foi enviado e os dados do formulário não foram salvos. Seu carrinho foi esvaziado.'), link('Voltar ao início', '#/inicio', 'button primary')));
      document.title = 'Simulação concluída · Cinefita Wireframe'; main.querySelector('h1').focus();
    }}, el('div', {class:'panel'}, el('h2', {}, 'Seus dados'), el('p', {class:'small muted'}, 'Preencha com dados fictícios para testar.'), inputField('Nome completo', 'name', 'text', 'name'), inputField('E-mail', 'email', 'email', 'email')),
      el('div', {class:'panel'}, el('h2', {}, 'Entrega por vendedor'), M.groups(cart).map(g => el('fieldset', {}, el('legend', {class:'small'}, g.seller.name),
        (g.seller.pickup ? ['pickup','shipping'] : ['shipping']).map(method => el('label', {class:'inline-radio'}, el('input', {type:'radio',name:'delivery-'+g.seller.id,value:method,checked:state.delivery[g.seller.id] === method,onChange:() => {state.delivery[g.seller.id] = method; updateReview();}}),
          method === 'pickup' ? 'Retirada grátis na Loja Oficial' : `Envio demonstrativo · ${money(g.seller.shippingCents)}`)))), address),
      el('div', {class:'panel'}, el('fieldset', {}, el('legend', {}, 'Pagamento'), Object.entries(CinefitaCheckout.methods).map(([value,label]) => el('label', {class:'inline-radio'}, el('input', {type:'radio',name:'payment',value,checked:state.payment === value,onChange:() => {state.payment = value; updateReview();}}), label))), installmentField, paymentInfo));
    updateReview();
    return [heading('Checkout', '05 / Compra demonstrativa'), el('div', {class:'two-column'}, form, review)];
  }
  function render(moveFocus = true) {
    const [path, query = ''] = location.hash.slice(1).split('?');
    const route = path || '/inicio', params = new URLSearchParams(query);
    const routes = {'/inicio':['Início',home],'/catalogo':['Busca / Categoria',catalogPage],'/produto':['Produto',product],'/carrinho':['Carrinho',cartPage],'/checkout':['Checkout',checkout]};
    const [title, page] = routes[route] || ['Página não encontrada',() => [heading('Página não encontrada','Navegação'),link('Voltar ao início','#/inicio','button primary')]];
    document.title = title + ' · Cinefita Wireframe';
    main.replaceChildren(...page(params));
    document.querySelectorAll('.screen-nav a').forEach(a => {if (a.hash.split('?')[0] === '#'+route) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');});
    if (moveFocus) {main.querySelector('h1')?.focus({preventScroll:true}); window.scrollTo(0,0);}
  }
  window.addEventListener('hashchange',() => render());
  render(false);
})();
