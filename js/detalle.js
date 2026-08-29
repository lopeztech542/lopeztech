const SUPABASE_URL = 'https://nrnrrbjzbbqbdcamsqap.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybnJyYmp6YmJxYmRjYW1zcWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMTMzOTcsImV4cCI6MjEwMDY4OTM5N30.OFZTYrPALSs4yJ_9q-S2DbTu7On4HxxSjf0Nt4dXwbs';
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  return map[cat] || cat;
}

function formatLines(text) {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
}

(function() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  var page = document.getElementById('detallePage');

  if (!id) {
    page.innerHTML = '<div class="detalle-loading" style="color:var(--red);"><i class="ti ti-alert-circle"></i> Producto no encontrado.</div>';
    return;
  }

  (async function() {
    var { data: allProducts } = await _supabase.from('productos').select('id, nombre').order('id');
    var currentIdx = allProducts ? allProducts.findIndex(function(x) { return x.id == id; }) : -1;
    var prevProduct = currentIdx > 0 ? allProducts[currentIdx - 1] : null;
    var nextProduct = currentIdx >= 0 && currentIdx < allProducts.length - 1 ? allProducts[currentIdx + 1] : null;

    var { data: p, error } = await _supabase.from('productos').select('*').eq('id', id).single();
    if (error || !p) {
      page.innerHTML = '<div class="detalle-loading" style="color:var(--red);"><i class="ti ti-alert-circle"></i> Producto no encontrado.</div>';
      return;
    }

    document.title = p.nombre + ' — LOPEZTECH';

    var badgeHTML = '';
    if (p.badge === 'nuevo') badgeHTML = '<div class="detalle-badge nuevo">Nuevo</div>';
    else if (p.badge === 'oferta') badgeHTML = '<div class="detalle-badge oferta">Oferta</div>';

    var detallesAbajoHTML = '';
    var garantiaContenidoHTML = '';
    var otherSections = [];
    if (p.detalles) detallesAbajoHTML = '<div class="detalle-fijo"><h3 class="detalle-fijo-title">Detalles</h3><div class="detalle-fijo-body">' + formatLines(p.detalles) + '</div></div>';
    if (p.garantia) garantiaContenidoHTML += '<div class="detalle-fijo"><h3 class="detalle-fijo-title">Garantía</h3><div class="detalle-fijo-body">' + formatLines(p.garantia) + '</div></div>';
    if (p.contenido_caja) garantiaContenidoHTML += '<div class="detalle-fijo"><h3 class="detalle-fijo-title">Contenido de la caja</h3><div class="detalle-fijo-body">' + formatLines(p.contenido_caja) + '</div></div>';
    if (p.informacion) otherSections.push({ title: 'Información', body: formatLines(p.informacion) });
    if (p.caracteristicas) otherSections.push({ title: 'Características', body: formatLines(p.caracteristicas) });

    var otherSectionsHTML = otherSections.map(function(s) {
      return '<div class="detalle-fijo"><h3 class="detalle-fijo-title">' + s.title + '</h3><div class="detalle-fijo-body">' + s.body + '</div></div>';
    }).join('');

    var waMsg = encodeURIComponent('Hola, quiero comprar: ' + p.nombre + ' por ' + fmt(p.precio));

    var navHTML = '<div class="detalle-nav">';
    if (prevProduct) navHTML += '<a href="producto?id=' + prevProduct.id + '" class="nav-prev"><i class="ti ti-chevron-left"></i> ' + prevProduct.nombre.substring(0, 30) + '</a>';
    else navHTML += '<span></span>';
    if (nextProduct) navHTML += '<a href="producto?id=' + nextProduct.id + '" class="nav-next">' + nextProduct.nombre.substring(0, 30) + ' <i class="ti ti-chevron-right"></i></a>';
    navHTML += '</div>';

    var navTopHTML = '<div class="detalle-nav-top">';
    if (prevProduct) navTopHTML += '<a href="producto?id=' + prevProduct.id + '" class="nav-prev-sm"><i class="ti ti-chevron-left"></i></a>';
    if (nextProduct) navTopHTML += '<a href="producto?id=' + nextProduct.id + '" class="nav-next-sm"><i class="ti ti-chevron-right"></i></a>';
    navTopHTML += '</div>';

    document.getElementById('breadcrumbNav').style.display = 'none';

    page.innerHTML = `
      <div class="detalle-top-nav">
        <a href="/tienda" class="back-link"><i class="ti ti-arrow-left"></i> Volver a la tienda</a>
        ${navTopHTML}
      </div>
      <div class="detalle-grid">
        <div class="detalle-top">
          <div class="detalle-left">
            <div class="detalle-img-wrap">
              <img src="${p.imagen}" alt="${p.nombre}" />
            </div>
            ${detallesAbajoHTML ? '<div class="detalle-secciones-col">' + detallesAbajoHTML + '</div>' : ''}
          </div>
          <div class="detalle-info">
            ${badgeHTML}
            <h1 class="detalle-nombre">${p.nombre}</h1>
            <div class="detalle-precio-wrap">
              <span class="detalle-precio">${fmt(p.precio)}</span>
              ${p.old_precio ? '<span class="detalle-old-precio">' + fmt(p.old_precio) + '</span>' : ''}
            </div>
            <div class="detalle-stock ${p.stock > 0 ? 'ok' : 'no'}">
              ${p.stock > 0 ? '✓ ' + p.stock + ' unidades disponibles' : '✗ Agotado'}
            </div>
            <div class="detalle-meta">
              <div class="detalle-meta-item"><strong>Marca</strong><span>${p.marca || 'Genérica'}</span></div>
              <div class="detalle-meta-item"><strong>Categoría</strong><span>${catLabel(p.categoria)}</span></div>
              ${p.compat ? '<div class="detalle-meta-item"><strong>Compatibilidad</strong><span>' + p.compat + '</span></div>' : ''}
              ${p.modelo ? '<div class="detalle-meta-item"><strong>Modelo</strong><span>' + p.modelo + '</span></div>' : ''}
            </div>
            <div class="detalle-acciones">
              <button class="add-btn" data-id="${p.id}" data-name="${p.nombre.replace(/"/g,'&quot;')}" data-price="${p.precio}" data-img="${p.imagen}"><i class="ti ti-shopping-cart" style="font-size:16px"></i> Agregar al carrito</button>
              <a href="https://wa.me/573215151950?text=${waMsg}" target="_blank" class="buy-now-btn"><i class="ti ti-bolt" style="font-size:16px"></i> Comprar</a>
            </div>
            ${garantiaContenidoHTML || otherSectionsHTML ? '<div class="detalle-secciones-col">' + garantiaContenidoHTML + otherSectionsHTML + '</div>' : ''}
          </div>
        </div>
      </div>
      ${navHTML}
    `;
  })();
})();

function addToCart(id, name, price, img) {
  var cart = JSON.parse(localStorage.getItem('lt_cart') || '[]');
  var existing = cart.find(function(p) { return p.id === id; });
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: id, name: name, price: price, img: img, qty: 1 });
  }
  localStorage.setItem('lt_cart', JSON.stringify(cart));
  updateCartCount();
  var toast = document.getElementById('toast');
  toast.textContent = name + ' agregado ✓';
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 2500);
}

function updateCartCount() {
  var cart = JSON.parse(localStorage.getItem('lt_cart') || '[]');
  var count = cart.reduce(function(s, p) { return s + p.qty; }, 0);
  document.getElementById('cartCount').textContent = count;
}

function openCart() {
  document.getElementById('cartModal').classList.add('open');
  renderCart();
}

function closeCart() {
  document.getElementById('cartModal').classList.remove('open');
}

function renderCart() {
  var cart = JSON.parse(localStorage.getItem('lt_cart') || '[]');
  var container = document.getElementById('cartItems');
  var footer = document.getElementById('cartFooter');
  if (!cart.length) {
    container.innerHTML = '<div class="modal-empty">El carrito está vacío</div>';
    footer.style.display = 'none';
    return;
  }
  footer.style.display = 'block';
  container.innerHTML = cart.map(function(p, i) {
    return '<div class="modal-item">' +
      '<img src="' + p.img + '" alt="' + p.name + '" />' +
      '<div class="mi-info"><div class="mi-name">' + p.name + '</div><div class="mi-price">$' + Number(p.price).toLocaleString('es-CO') + '</div></div>' +
      '<div class="mi-qty"><button onclick="changeQty(' + i + ',-1)">-</button><span>' + p.qty + '</span><button onclick="changeQty(' + i + ',1)">+</button></div>' +
      '<button class="mi-remove" onclick="removeItem(' + i + ')"><i class="ti ti-trash"></i></button>' +
    '</div>';
  }).join('');
  var total = cart.reduce(function(s, p) { return s + p.price * p.qty; }, 0);
  document.getElementById('cartTotal').textContent = '$' + total.toLocaleString('es-CO');
  var msg = encodeURIComponent('Hola, quiero comprar:\n' + cart.map(function(p) { return '• ' + p.name + ' x' + p.qty + ' = $' + Number(p.price * p.qty).toLocaleString('es-CO'); }).join('\n') + '\n\nTotal: $' + total.toLocaleString('es-CO'));
  document.getElementById('cartWaBtn').href = 'https://wa.me/573215151950?text=' + msg;
}

function changeQty(idx, delta) {
  var cart = JSON.parse(localStorage.getItem('lt_cart') || '[]');
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  localStorage.setItem('lt_cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

function removeItem(idx) {
  var cart = JSON.parse(localStorage.getItem('lt_cart') || '[]');
  cart.splice(idx, 1);
  localStorage.setItem('lt_cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.add-btn');
    if (!btn) return;
    e.preventDefault();
    var id = parseInt(btn.dataset.id);
    var name = btn.dataset.name;
    var price = parseFloat(btn.dataset.price);
    var img = btn.dataset.img;
    addToCart(id, name, price, img);
    btn.classList.add('added');
    var original = btn.innerHTML;
    btn.innerHTML = '<i class="ti ti-check" style="font-size:16px"></i> Agregado';
    setTimeout(function() {
      btn.classList.remove('added');
      btn.innerHTML = original;
    }, 1200);
  });
});