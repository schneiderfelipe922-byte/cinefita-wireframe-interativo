/* Valores em centavos: as parcelas sempre somam exatamente o total. */
const CinefitaCheckout = (() => {
  const methods = Object.freeze({pix: 'PIX', debit: 'Cartão de débito', credit: 'Cartão de crédito'});
  function quote(totalCents, method, count = 1) {
    if (!Number.isSafeInteger(totalCents) || totalCents <= 0) throw new RangeError('Total inválido.');
    if (!Object.hasOwn(methods, method)) throw new RangeError('Escolha uma forma de pagamento.');
    if (!Number.isInteger(count) || count < 1 || count > 12 || (method !== 'credit' && count !== 1) || count > totalCents) {
      throw new RangeError('Escolha um parcelamento válido.');
    }
    const base = Math.floor(totalCents / count), remainder = totalCents % count;
    const installments = Array.from({length: count}, (_, index) => base + (index < remainder ? 1 : 0));
    return {method, label: methods[method], totalCents, installments};
  }
  return {methods, quote};
})();
if (typeof module !== 'undefined') module.exports = CinefitaCheckout;
