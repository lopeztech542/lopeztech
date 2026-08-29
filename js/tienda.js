const SUPABASE_URL = 'https://nrnrrbjzbbqbdcamsqap.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybnJyYmp6YmJxYmRjYW1zcWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMTMzOTcsImV4cCI6MjEwMDY4OTM5N30.OFZTYrPALSs4yJ_9q-S2DbTu7On4HxxSjf0Nt4dXwbs';
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let PRODUCTS = [];
let filtered = [];
let currentCat = 'todos';
let currentBrand = null;
let currentOffers = [];

function fmt(n) {
  return '$' + Number(n).toLocaleString('es-CO');
}

function catLabel(cat) {
  const map = {
    'celulares-nuevos': 'Computadores Nuevos',
    'celulares-remanufacturados': 'Computadores Re.',
    'pantallas': 'Pantallas',
    'baterias': 'Baterías',
    'accesorios': 'Accesorios',
    'cargadores': 'Fuentes de Poder',
    'fundas': 'Mochilas'
  };
  return map[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
}

function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  document.getElementById('resultCount').textContent = list.length;
  if (!list.length) {
    grid.innerHTML = '<p style="color:#6B7280;font-size:14px;grid-column:1/-1;padding:2rem 0;">No se encontraron productos.</p>';
    return;
  }
  grid.innerHTML = list.map(p => {
    const badgeHTML = p.badge === 'oferta'
      ? '<div class="prod-badge-oferta">OFERTA</div>'
      : p.badge === 'nuevo'
      ? '<div class="prod-badge-nuevo">NUEVO</div>'
      : p.badge === 'stock'
      ? '<div class="prod-badge-stock">En stock</div>'
      : '';
    const oldHTML = p.old_precio ? `<span class="prod-old">${fmt(p.old_precio)}</span>` : '';
    const waMsg = encodeURIComponent(`Hola, quiero comprar: ${p.nombre} por ${fmt(p.precio)}`);
    return `
      <div class="product-card">
        <div class="prod-img">
          ${badgeHTML}
          <img src="${p.imagen}" alt="${p.nombre}" />
        </div>
        <div class="prod-info">
          <div class="prod-cat">${catLabel(p.categoria)}</div>
          <div class="prod-name">${p.nombre}</div>
          <div class="prod-compat">${p.compat}</div>
          <div class="prod-pricing">
            <span class="prod-price">${fmt(p.precio)}</span>
            ${oldHTML}
          </div>
          <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;">
            <span style="font-size:11px;color:${p.stock > 0 ? 'var(--green)' : 'var(--red)'};font-weight:600;">
              ${p.stock > 0 ? '✓ ' + p.stock + ' en stock' : '✗ Sin stock'}
            </span>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="add-btn" onclick="addToCart(${p.id},'${p.nombre.replace(/'/g,"\\'")}',${p.precio},'${p.imagen}')" ${p.stock <= 0 ? 'disabled' : ''} style="${p.stock <= 0 ? 'opacity:0.4;cursor:not-allowed;' : ''}">
              <i class="ti ti-shopping-cart" style="font-size:14px"></i> Carrito
            </button>
            <a href="https://wa.me/573215151950?text=${waMsg}" target="_blank" class="buy-now-btn" ${p.stock <= 0 ? 'style="opacity:0.4;pointer-events:none;"' : ''}>
              <i class="ti ti-bolt" style="font-size:14px"></i> Comprar
            </a>
          </div>
          <button class="detail-btn" onclick="showDetail(${p.id})">Ver detalles <i class="ti ti-chevron-down" style="font-size:12px;"></i></button>
        </div>
      </div>`;
  }).join('');
}

function filterProducts() {
  let list = [...PRODUCTS];
  const q = document.getElementById('searchInput').value.toLowerCase();
  const min = parseInt(document.getElementById('priceMin').value) || 0;
  const max = parseInt(document.getElementById('priceMax').value) || Infinity;

  if (currentCat !== 'todos') list = list.filter(p => p.categoria === currentCat);
  if (currentBrand) list = list.filter(p => p.marca === currentBrand);
  if (currentOffers.length > 0) list = list.filter(p => currentOffers.includes(p.badge));
  if (q) list = list.filter(p => p.nombre.toLowerCase().includes(q) || p.compat.toLowerCase().includes(q));
  list = list.filter(p => p.precio >= min && p.precio <= max);

  filtered = list;
  renderProducts(filtered);
}

function sortProducts(val) {
  const list = [...filtered];
  if (val === 'precio-asc') list.sort((a,b) => a.precio - b.precio);
  if (val === 'precio-desc') list.sort((a,b) => b.precio - a.precio);
  if (val === 'nombre') list.sort((a,b) => a.nombre.localeCompare(b.nombre));
  renderProducts(list);
}

function setTab(cat) {
  currentCat = cat;
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === cat));
  document.querySelectorAll('.filter-item[data-cat]').forEach(f => f.classList.toggle('active', f.dataset.cat === cat));
  filterProducts();
}

function toggleOffer(el) {
  const val = el.dataset.offer;
  el.classList.toggle('active');
  if (el.classList.contains('active')) currentOffers.push(val);
  else currentOffers = currentOffers.filter(o => o !== val);
  filterProducts();
}

let cart = [];
let cartTotal = 0;

function addToCart(id, name, price, img) {
  const existing = cart.find(p => p.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  updateCartUI();
  const toast = document.getElementById('toast');
  toast.textContent = name + ' agregado ✓';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function updateCartUI() {
  const count = cart.reduce((s, p) => s + p.qty, 0);
  document.getElementById('cartCount').textContent = count;
  var mc = document.getElementById('mobileCartCount');
  if(mc) mc.textContent = count;
}

function showDetail(id) {
  window.location.href = '/producto?id=' + id;
}

function closeDetail() {
  document.getElementById('detailModal').classList.remove('open');
}

function openCart() {
  const overlay = document.getElementById('cartModal');
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');

  if (!cart.length) {
    container.innerHTML = '<div class="modal-empty">El carrito está vacío</div>';
    footer.style.display = 'none';
    overlay.classList.add('open');
    return;
  }

  cartTotal = cart.reduce((s, p) => s + p.price * p.qty, 0);
  container.innerHTML = cart.map((p, i) => `
    <div class="modal-item">
      <img src="${p.img}" alt="${p.name}" />
      <div class="mi-info">
        <div class="mi-name">${p.name}</div>
        <div class="mi-price">${fmt(p.price)}</div>
      </div>
      <div class="mi-qty">
        <button onclick="changeQty(${i},-1)"><i class="ti ti-minus"></i></button>
        <span>${p.qty}</span>
        <button onclick="changeQty(${i},1)"><i class="ti ti-plus"></i></button>
      </div>
      <button class="mi-remove" onclick="removeFromCart(${i})"><i class="ti ti-trash"></i></button>
    </div>
  `).join('');

  document.getElementById('cartTotal').textContent = fmt(cartTotal);

  const msg = encodeURIComponent('Hola, quiero comprar:\n' + cart.map(p => '• ' + p.name + ' x' + p.qty + ' = ' + fmt(p.price * p.qty)).join('\n') + '\n\nTotal: ' + fmt(cartTotal));
  document.getElementById('cartWaBtn').href = 'https://wa.me/573215151950?text=' + msg;

  footer.style.display = 'block';
  overlay.classList.add('open');
}

function closeCart() {
  document.getElementById('cartModal').classList.remove('open');
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  openCart();
  updateCartUI();
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  openCart();
  updateCartUI();
}

function toggleCart() {
  openCart();
}

document.querySelectorAll('.filter-item[data-cat]').forEach(f => {
  f.addEventListener('click', () => {
    setTab(f.dataset.cat);
  });
});

(async function() {
  const [prodRes, marcasRes] = await Promise.all([
    _supabase.from('productos').select('*').order('id'),
    _supabase.from('marcas').select('nombre').order('nombre')
  ]);
  if (prodRes.error) {
    document.getElementById('productsGrid').innerHTML = '<p style="color:#e74c3c;padding:2rem 0;">Error al cargar productos.</p>';
    return;
  }
  PRODUCTS = prodRes.data || [];

  const counts = {};
  PRODUCTS.forEach(p => { counts[p.categoria] = (counts[p.categoria] || 0) + 1; });
  document.getElementById('countTodos').textContent = PRODUCTS.length;
  document.querySelectorAll('.filter-item[data-cat]').forEach(f => {
    const cat = f.dataset.cat;
    if (cat !== 'todos' && counts[cat] !== undefined) {
      const span = f.querySelector('.filter-count');
      if (span) span.textContent = counts[cat];
    }
  });

  const brands = marcasRes.data && marcasRes.data.length > 0
    ? marcasRes.data.map(m => m.nombre)
    : [...new Set(PRODUCTS.map(p => p.marca).filter(Boolean))];
  const brandHtml = brands.map(b => `<div class="filter-item" data-brand="${b}" onclick="toggleBrand(this)">${b}</div>`).join('');
  document.getElementById('brandFilters').innerHTML = brandHtml;

  filtered = [...PRODUCTS];
  renderProducts(PRODUCTS);
})();

function toggleBrand(el) {
  el.classList.toggle('active');
  const activeBrands = document.querySelectorAll('.filter-item[data-brand].active');
  currentBrand = activeBrands.length === 1 ? activeBrands[0].dataset.brand : null;
  filterProducts();
}
