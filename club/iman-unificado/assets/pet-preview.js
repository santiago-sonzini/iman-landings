(() => {
  'use strict';
  document.querySelectorAll('[data-pet-preview]').forEach(preview => {
    const products = [...preview.querySelectorAll('[data-pet-product]')];
    const categories = [...preview.querySelectorAll('[data-pet-category]')];
    const search = preview.querySelector('[data-pet-search]');
    const count = preview.querySelector('[data-pet-count]');
    const empty = preview.querySelector('[data-pet-empty]');
    let selected = 'todos';
    let animation;
    const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    function replay() {
      preview.classList.remove('is-pet-animating');
      cancelAnimationFrame(animation);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      animation = requestAnimationFrame(() => { animation = requestAnimationFrame(() => preview.classList.add('is-pet-animating')); });
    }
    function filter() {
      const query = normalize(search.value);
      let total = 0;
      for (const product of products) {
        const visible = (selected === 'todos' || product.dataset.petKind.split(' ').includes(selected)) && normalize(product.dataset.petName).includes(query);
        product.hidden = !visible;
        if (visible) total++;
      }
      for (const category of categories) category.setAttribute('aria-pressed', String(category.dataset.petCategory === selected));
      empty.hidden = total !== 0;
      count.textContent = `${total} ${total === 1 ? 'producto de ejemplo' : 'productos de ejemplo'}`;
      replay();
    }
    categories.forEach(button => button.addEventListener('click', () => { selected = button.dataset.petCategory; filter(); }));
    search.addEventListener('input', filter);
    preview.querySelector('[data-pet-replay]')?.addEventListener('click', replay);
    preview.addEventListener('pet:replay', replay);
  });
})();
