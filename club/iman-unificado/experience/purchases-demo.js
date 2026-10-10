/* The original local comparison from assets/site.js. No requests or purchases are sent. */
(() => {
const budgetInput = document.querySelector('#presupuesto');
const deliveryInput = document.querySelector('#plazo');
if (budgetInput && deliveryInput) {
  const compare = () => {
    const budget = budgetInput.valueAsNumber;
    const days = Number(deliveryInput.value);
    const offers = [...document.querySelectorAll('.demo-offer')];
    const eligible = offers.filter(offer => Number(offer.dataset.price) <= budget && Number(offer.dataset.days) <= days);
    eligible.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
    offers.forEach(offer => {
      const reasons = [];
      if (!Number.isFinite(budget) || Number(offer.dataset.price) > budget) reasons.push('Fuera de presupuesto');
      if (Number(offer.dataset.days) > days) reasons.push('Supera el plazo');
      offer.querySelector('.offer-status').textContent = reasons.length ? reasons.join(' · ') : 'Cumple tus condiciones';
      offer.classList.toggle('recommended', eligible[0] === offer);
    });
    document.querySelector('#resultado').textContent = eligible.length ? `${eligible[0].dataset.name} cumple las condiciones.` : 'Ninguna propuesta cumple las condiciones.';
    document.querySelector('#motivo').textContent = eligible.length ? 'Es la opción de menor total que cumple el presupuesto y el plazo.' : 'El proceso se detiene para revisión. No se excede el presupuesto ni se aprueba una compra automáticamente.';
  };
  budgetInput.addEventListener('input', compare);
  deliveryInput.addEventListener('change', compare);
  compare();
}
})();
