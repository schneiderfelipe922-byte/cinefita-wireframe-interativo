const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const M = require('../src/marketplace-core.js');
const Checkout = require('../src/checkout-core.js');
const source = fs.readFileSync(path.join(__dirname,'../src/data.js'),'utf8');
const context = vm.createContext({});
vm.runInContext(source+';globalThis.dataset=films;',context);
const films = Array.from(context.dataset);
const catalog = M.createCatalog(films);
test('amostra preserva 33 filmes e ofertas de Frankenstein', () => {
  assert.equal(films.length,33);
  assert.equal(catalog.matching('frankenstein').length,3);
  assert.equal(catalog.get('cinefita-frankenstein').priceCents,8490);
});
test('restauração rejeita ofertas inventadas e ignora preços manipulados', () => {
  const restored = catalog.restore([{offerId:'cinefita-frankenstein',qty:999,price:0},{offerId:'inexistente',qty:1},null]);
  assert.equal(restored.rejected,2);
  assert.equal(restored.items[0].qty,99);
  assert.equal(restored.items[0].priceCents,8490);
  assert.equal(catalog.restore('inválido').items.length,0);
});
test('agrupamento mantém vendedores, soma centavos e aplica frete por origem', () => {
  const cart = [catalog.item('cinefita-frankenstein',2),catalog.item('aurora-psycho-vhs')];
  let totals = M.totals(cart,{cinefita:'pickup',aurora:'pickup'});
  assert.equal(totals.groups.length,2);
  assert.equal(totals.subtotalCents,24470);
  assert.equal(totals.shippingCents,1990);
  assert.equal(totals.totalCents,26460);
  totals = M.totals(cart,{cinefita:'shipping'});
  assert.equal(totals.shippingCents,3980);
});
test('filtros comerciais respeitam formato, vendedor e conservação combinados', () => {
  assert.equal(catalog.select(films,{format:'DVD',seller:'bairro',condition:'new'}).length,1);
  assert.equal(catalog.select(films,{format:'DVD',seller:'aurora'}).length,0);
});
test('parcelas preservam total para 1 a 12 pagamentos e rejeitam entradas inválidas', () => {
  for (let count=1;count<=12;count++) {
    const quote = Checkout.quote(19961,'credit',count);
    assert.equal(quote.installments.reduce((a,b)=>a+b,0),19961);
    assert.ok(Math.max(...quote.installments)-Math.min(...quote.installments)<=1);
  }
  for (const args of [[0,'pix'],[500,'unknown'],[500,'debit',2],[500,'credit',13]]) assert.throws(()=>Checkout.quote(...args),RangeError);
});
