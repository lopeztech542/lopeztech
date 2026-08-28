const SUPABASE_URL = 'https://nrnrrbjzbbqbdcamsqap.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybnJyYmp6YmJxYmRjYW1zcWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMTMzOTcsImV4cCI6MjEwMDY4OTM5N30.OFZTYrPALSs4yJ_9q-S2DbTu7On4HxxSjf0Nt4dXwbs';
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let ALL_PRODUCTS = [];
let ALL_CLIENTS = [];
let ALL_SALES = [];
let posCart = [];
let selectedFile = null;

/* ─── TOAST ─── */
function showToast(msg, type){
  var el = document.getElementById('toast');
  el.textContent = msg; el.className = 'toast show';
  el.style.background = type === 'error' ? '#DC2626' : '#1C2340';
  setTimeout(function(){ el.classList.remove('show'); }, 3500);
}

/* ─── TABS ─── */
function switchTab(name){
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.toggle('active', t.dataset.tab === name); });
  document.querySelectorAll('.tab-content').forEach(function(t){ t.classList.toggle('active', t.id === 'tab-' + name); });
  if(name === 'dashboard') loadDashboard();
  if(name === 'clients') loadClients();
  if(name === 'products') loadProducts();
  if(name === 'sales') loadSales();
}

/* ════════════════════════════════════
   DASHBOARD
   ════════════════════════════════════ */
async function loadDashboard(){
  try {
    var { count: cCount } = await _supabase.from('clientes').select('*', { count: 'exact', head: true });
    document.getElementById('statClients').textContent = cCount || 0;
  } catch(e) { document.getElementById('statClients').textContent = '0'; }

  try {
    var { count: pCount } = await _supabase.from('productos').select('*', { count: 'exact', head: true });
    document.getElementById('statProducts').textContent = pCount || 0;
  } catch(e) { document.getElementById('statProducts').textContent = '0'; }

  try {
    var today = new Date(); today.setHours(0,0,0,0);
    var { data: todaySales } = await _supabase.from('ventas').select('*').gte('created_at', today.toISOString());
    document.getElementById('statSalesToday').textContent = todaySales ? todaySales.length : 0;
    if(todaySales) loadRecentSales();
  } catch(e) { document.getElementById('statSalesToday').textContent = '0'; }

  try {
    var { data: allSales } = await _supabase.from('ventas').select('total');
    var total = 0;
    if(allSales) allSales.forEach(function(s){ total += Number(s.total || 0); });
    document.getElementById('statIncome').textContent = '$' + total.toLocaleString('es-CO');
  } catch(e) { document.getElementById('statIncome').textContent = '$0'; }

  try {
    var { data: lowStock } = await _supabase.from('productos').select('*').lte('stock', 3);
    document.getElementById('statLowStock').textContent = lowStock ? lowStock.length : 0;
  } catch(e) { document.getElementById('statLowStock').textContent = '0'; }
}

async function loadRecentSales(){
  var { data } = await _supabase.from('ventas').select('*').order('created_at', { ascending: false }).limit(5);
  var div = document.getElementById('recentSales');
  if(!data || !data.length) { div.innerHTML = '<p style="color:var(--muted);font-size:13px;">Sin ventas recientes.</p>'; return; }
  div.innerHTML = data.map(function(s){
    return '<div class="recent-sale-item"><span>#' + s.id + ' — ' + (s.cliente_nombre || 'Anónimo') + '</span><span style="font-weight:600;color:var(--blue);">$' + Number(s.total).toLocaleString('es-CO') + '</span></div>';
  }).join('');
}

/* ════════════════════════════════════
   CLIENTES
   ════════════════════════════════════ */
async function loadClients(){
  var q = document.getElementById('clientSearch').value.toLowerCase();
  try {
    var { data } = await _supabase.from('clientes').select('*').order('id', { ascending: false });
    ALL_CLIENTS = data || [];
  } catch(e) { ALL_CLIENTS = []; }
  renderClients();
}

function renderClients(){
  var q = document.getElementById('clientSearch').value.toLowerCase();
  var list = ALL_CLIENTS;
  if(q) list = list.filter(function(c){ return c.nombre.toLowerCase().includes(q) || (c.telefono || '').includes(q); });
  var tbody = document.getElementById('clientsTableBody');
  var empty = document.getElementById('noClients');
  if(!list.length){ tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = list.map(function(c){
    return '<tr><td>' + c.id + '</td><td><strong>' + c.nombre + '</strong></td><td>' + (c.telefono || '-') + '</td><td>' + (c.email || '-') + '</td><td>' + (c.created_at ? new Date(c.created_at).toLocaleDateString() : '-') + '</td><td><button class="btn btn-sm btn-outline" onclick="deleteClient(' + c.id + ')"><i class="ti ti-trash"></i></button></td></tr>';
  }).join('');
}

async function addClient(){
  var nombre = document.getElementById('clientName').value.trim();
  var telefono = document.getElementById('clientPhone').value.trim();
  var email = document.getElementById('clientEmail').value.trim();
  if(!nombre || !telefono){ showToast('Nombre y teléfono son obligatorios', 'error'); return; }
  var { error } = await _supabase.from('clientes').insert({ nombre: nombre, telefono: telefono, email: email || null });
  if(error){ showToast('Error: ' + error.message, 'error'); return; }
  showToast('Cliente agregado ✓', 'success');
  document.getElementById('clientName').value = '';
  document.getElementById('clientPhone').value = '';
  document.getElementById('clientEmail').value = '';
  loadClients(); loadDashboard();
}

async function deleteClient(id){
  if(!confirm('¿Eliminar este cliente?')) return;
  var { error } = await _supabase.from('clientes').delete().eq('id', id);
  if(error){ showToast('Error: ' + error.message, 'error'); return; }
  showToast('Cliente eliminado ✓', 'success');
  loadClients(); loadDashboard();
}

/* ════════════════════════════════════
   PRODUCTOS
   ════════════════════════════════════ */
async function loadProducts(){
  try {
    var { data } = await _supabase.from('productos').select('*').order('id', { ascending: false });
    ALL_PRODUCTS = data || [];
  } catch(e) { ALL_PRODUCTS = []; }
  renderProducts();
}

function renderProducts(){
  var q = (document.getElementById('prodSearch').value || '').toLowerCase();
  var list = ALL_PRODUCTS;
  if(q) list = list.filter(function(p){ return p.nombre.toLowerCase().includes(q); });
  document.getElementById('productCount').textContent = '(' + list.length + ')';
  var tbody = document.getElementById('productsTableBody');
  var empty = document.getElementById('noProducts');
  if(!list.length){ tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = list.map(function(p){
    var sc = p.stock <= 0 ? 'stock-zero' : p.stock <= 3 ? 'stock-low' : 'stock-ok';
    var sl = p.stock <= 0 ? 'Sin stock' : p.stock + ' uds';
    var img = p.imagen ? '<img src="' + p.imagen + '" class="thumb-img" />' : '<div class="thumb-img" style="background:var(--border);display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:10px;">IMG</div>';
    return '<tr><td>' + img + '</td><td><strong>' + p.nombre + '</strong></td><td>' + (p.categoria || '-') + '</td><td style="font-weight:600;color:var(--blue);">$' + Number(p.precio).toLocaleString('es-CO') + '</td><td><span class="stock-badge ' + sc + '">' + sl + '</span></td><td><button class="btn btn-sm btn-outline" onclick="editProduct(' + p.id + ')"><i class="ti ti-pencil"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteProduct(' + p.id + ')"><i class="ti ti-trash"></i></button></td></tr>';
  }).join('');
}

function handleFileSelect(e){
  selectedFile = e.target.files[0];
  document.getElementById('fileName').textContent = selectedFile ? selectedFile.name : '';
}

async function uploadFile(file){
  var formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'lopeztech_preset');
  var res = await fetch('https://api.cloudinary.com/v1_1/ylee0qlx/image/upload', {
    method: 'POST',
    body: formData
  });
  if(!res.ok) throw new Error('Error al subir a Cloudinary');
  var data = await res.json();
  return data.secure_url;
}

function cancelEdit(){
  document.getElementById('editProductId').value = '';
  document.getElementById('productForm').reset();
  document.getElementById('prodStock').value = 5;
  document.getElementById('cancelBtn').classList.add('hidden');
  document.getElementById('submitBtn').innerHTML = '<i class="ti ti-device-floppy"></i> Guardar Producto';
  document.getElementById('prodCardTitle').innerHTML = '<i class="ti ti-plus"></i> Nuevo Producto';
  selectedFile = null;
  document.getElementById('fileName').textContent = '';
  document.getElementById('fileInput').value = '';
  document.getElementById('prodImage').value = '';
}

function editProduct(id){
  var p = ALL_PRODUCTS.find(function(x){ return x.id === id; });
  if(!p) return;
  document.getElementById('editProductId').value = id;
  document.getElementById('prodName').value = p.nombre;
  document.getElementById('prodPrice').value = p.precio;
  document.getElementById('prodStock').value = p.stock;
  document.getElementById('prodCategory').value = p.categoria || '';
  document.getElementById('prodCompat').value = p.compat || '';
  document.getElementById('prodMarca').value = p.marca || '';
  document.getElementById('prodModelo').value = p.modelo || '';
  document.getElementById('prodBadge').value = p.badge || '';
  document.getElementById('prodDestacado').checked = p.destacado === true;
  document.getElementById('prodDetalles').value = p.detalles || '';
  document.getElementById('prodInfo').value = p.informacion || '';
  document.getElementById('prodCaract').value = p.caracteristicas || '';
  document.getElementById('prodGarantia').value = p.garantia || '';
  document.getElementById('prodCaja').value = p.contenido_caja || '';
  document.getElementById('prodImage').value = p.imagen || '';
  document.getElementById('cancelBtn').classList.remove('hidden');
  document.getElementById('submitBtn').innerHTML = '<i class="ti ti-refresh"></i> Actualizar Producto';
  document.getElementById('prodCardTitle').innerHTML = '<i class="ti ti-pencil"></i> Editar Producto';
  document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
}

async function saveProduct(e){
  e.preventDefault();
  var editId = document.getElementById('editProductId').value;
  var nombre = document.getElementById('prodName').value.trim();
  var precio = parseInt(document.getElementById('prodPrice').value);
  var stock = parseInt(document.getElementById('prodStock').value) || 0;
  var categoria = document.getElementById('prodCategory').value;
  var compat = document.getElementById('prodCompat').value.trim();
  var marca = document.getElementById('prodMarca').value.trim();
  var modelo = document.getElementById('prodModelo').value.trim();
  var badge = document.getElementById('prodBadge').value || null;
  var detalles = document.getElementById('prodDetalles').value.trim();
  var informacion = document.getElementById('prodInfo').value.trim();
  var caracteristicas = document.getElementById('prodCaract').value.trim();
  var garantia = document.getElementById('prodGarantia').value.trim();
  var contenido_caja = document.getElementById('prodCaja').value.trim();
  var imagen = document.getElementById('prodImage').value.trim();
  var destacado = document.getElementById('prodDestacado').checked;

  if(selectedFile){
    try { imagen = await uploadFile(selectedFile); }
    catch(err){ showToast('Error al subir imagen: ' + err.message, 'error'); return; }
  }
  if(!imagen){ showToast('Debes ingresar una URL o subir una imagen', 'error'); return; }

  var payload = { nombre: nombre, precio: precio, stock: stock, imagen: imagen, categoria: categoria, compat: compat, marca: marca, modelo: modelo, badge: badge, detalles: detalles, informacion: informacion, caracteristicas: caracteristicas, garantia: garantia, contenido_caja: contenido_caja, destacado: destacado };
  var error;
  if(editId){
    var r = await _supabase.from('productos').update(payload).eq('id', editId);
    error = r.error;
  } else {
    var r = await _supabase.from('productos').insert(payload);
    error = r.error;
  }
  if(error){ showToast('Error: ' + error.message, 'error'); return; }
  showToast(editId ? 'Producto actualizado ✓' : 'Producto creado ✓', 'success');
  cancelEdit();
  loadProducts(); loadDashboard();
}

async function deleteProduct(id){
  if(!confirm('¿Eliminar este producto?')) return;
  var { error } = await _supabase.from('productos').delete().eq('id', id);
  if(error){ showToast('Error: ' + error.message, 'error'); return; }
  showToast('Producto eliminado ✓', 'success');
  loadProducts(); loadDashboard();
}

/* ════════════════════════════════════
   VENTAS / POS
   ════════════════════════════════════ */
async function loadSales(){
  var period = document.getElementById('salesPeriod').value;
  try {
    var query = _supabase.from('ventas').select('*').order('id', { ascending: false });
    if(period !== 'all'){
      var from = new Date();
      if(period === 'today') from.setHours(0,0,0,0);
      if(period === 'week') from.setDate(from.getDate() - from.getDay());
      if(period === 'month') from.setDate(1);
      from.setHours(0,0,0,0);
      query = query.gte('created_at', from.toISOString());
    }
    var { data } = await query;
    ALL_SALES = data || [];
  } catch(e) { ALL_SALES = []; }
  renderSales();
}

function renderSales(){
  var list = ALL_SALES;
  document.getElementById('salesCount').textContent = list.length;
  var totalIncome = 0, totalItems = 0;
  list.forEach(function(s){
    totalIncome += Number(s.total || 0);
    totalItems += Number(s.items_count || 0);
  });
  document.getElementById('salesIncome').textContent = '$' + totalIncome.toLocaleString('es-CO');
  document.getElementById('salesItems').textContent = totalItems;
  document.getElementById('salesAvg').textContent = list.length ? '$' + Math.round(totalIncome / list.length).toLocaleString('es-CO') : '$0';

  var tbody = document.getElementById('salesTableBody');
  var empty = document.getElementById('noSales');
  if(!list.length){ tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = list.map(function(s){
    return '<tr><td>' + s.id + '</td><td>' + new Date(s.created_at).toLocaleString() + '</td><td>' + (s.cliente_nombre || 'Anónimo') + '</td><td>' + (s.items_count || 0) + '</td><td style="font-weight:600;color:var(--blue);">$' + Number(s.total).toLocaleString('es-CO') + '</td><td><button class="btn btn-sm btn-outline" onclick="showInvoice(' + s.id + ')"><i class="ti ti-file-invoice"></i></button></td></tr>';
  }).join('');
}

/* ─── POS ─── */
function openPOS(){
  posCart = [];
  document.getElementById('posName').value = '';
  document.getElementById('posPhone').value = '';
  document.getElementById('posModal').classList.add('open');
  renderPOSProducts();
  renderPOSCart();
}

function closePOS(){
  document.getElementById('posModal').classList.remove('open');
}

function renderPOSProducts(){
  var q = (document.getElementById('posSearch').value || '').toLowerCase();
  var list = ALL_PRODUCTS.filter(function(p){ return p.stock > 0; });
  if(q) list = list.filter(function(p){ return p.nombre.toLowerCase().includes(q); });
  var div = document.getElementById('posProductList');
  div.innerHTML = list.map(function(p){
    var inCart = posCart.find(function(c){ return c.id === p.id; });
    return '<div class="pos-prod-card" onclick="addToPOS(' + p.id + ')">' +
      (p.imagen ? '<img src="' + p.imagen + '" />' : '<div style="width:36px;height:36px;border-radius:6px;background:var(--border);"></div>') +
      '<div style="flex:1"><div class="pp-name">' + p.nombre + '</div><div class="pp-price">$' + Number(p.precio).toLocaleString('es-CO') + '</div></div>' +
      '<div class="pp-stock">' + (p.stock - (inCart ? inCart.qty : 0)) + ' disp.</div></div>';
  }).join('');
}

function addToPOS(id){
  var p = ALL_PRODUCTS.find(function(x){ return x.id === id; });
  if(!p) return;
  var inCart = posCart.find(function(c){ return c.id === id; });
  var maxStock = (inCart ? p.stock - inCart.qty : p.stock);
  if(maxStock <= 0){ showToast('Stock insuficiente', 'error'); return; }
  if(inCart){ inCart.qty++; }
  else { posCart.push({ id: p.id, nombre: p.nombre, precio: p.precio, imagen: p.imagen, qty: 1 }); }
  renderPOSCart();
  renderPOSProducts();
}

function updatePOSQty(id, delta){
  var item = posCart.find(function(c){ return c.id === id; });
  if(!item) return;
  var p = ALL_PRODUCTS.find(function(x){ return x.id === id; });
  if(delta > 0 && p && (p.stock - (posCart.reduce(function(s,i){ return i.id === id ? s + i.qty : s; }, 0))) <= 0){ showToast('Stock insuficiente', 'error'); return; }
  item.qty += delta;
  if(item.qty <= 0) posCart = posCart.filter(function(c){ return c.id !== id; });
  renderPOSCart();
  renderPOSProducts();
}

function renderPOSCart(){
  var div = document.getElementById('posCartItems');
  var total = 0;
  div.innerHTML = posCart.map(function(c){
    total += c.precio * c.qty;
    return '<div class="pos-item"><div class="pi-info"><div class="pi-name">' + c.nombre + '</div><div class="pi-price">$' + Number(c.precio).toLocaleString('es-CO') + '</div></div><div class="pi-qty"><button onclick="updatePOSQty(' + c.id + ',-1)">−</button><span>' + c.qty + '</span><button onclick="updatePOSQty(' + c.id + ',1)">+</button></div><button class="pi-remove" onclick="updatePOSQty(' + c.id + ',-99)"><i class="ti ti-trash"></i></button></div>';
  }).join('');
  if(!posCart.length) div.innerHTML = '<p style="color:var(--muted);font-size:13px;text-align:center;padding:1rem;">Carrito vacío</p>';
  document.getElementById('posTotalAmount').textContent = '$' + total.toLocaleString('es-CO');
}

async function completeSale(){
  if(!posCart.length){ showToast('Agrega productos al carrito', 'error'); return; }
  var nombre = document.getElementById('posName').value.trim() || 'Anónimo';
  var total = posCart.reduce(function(s, c){ return s + c.precio * c.qty; }, 0);
  var itemsCount = posCart.reduce(function(s, c){ return s + c.qty; }, 0);

  var { error: ventaError, data: venta } = await _supabase.from('ventas').insert({
    cliente_nombre: nombre,
    total: total,
    items_count: itemsCount
  }).select();

  if(ventaError){ showToast('Error: ' + ventaError.message, 'error'); return; }

  var saleId = venta[0].id;
  var itemsPayload = posCart.map(function(c){ return { venta_id: saleId, producto_id: c.id, nombre: c.nombre, precio: c.precio, cantidad: c.qty }; });
  var { error: itemsError } = await _supabase.from('venta_items').insert(itemsPayload);
  if(itemsError){ showToast('Error items: ' + itemsError.message, 'error'); return; }

  for(var i = 0; i < posCart.length; i++){
    var p = ALL_PRODUCTS.find(function(x){ return x.id === posCart[i].id; });
    if(p) await _supabase.from('productos').update({ stock: p.stock - posCart[i].qty }).eq('id', p.id);
  }

  showToast('Venta #' + saleId + ' completada ✓', 'success');
  closePOS();
  loadProducts();
  loadDashboard();
  loadSales();
  showInvoice(saleId);
}

/* ─── INVOICE ─── */
async function showInvoice(id){
  var { data: venta } = await _supabase.from('ventas').select('*').eq('id', id).single();
  if(!venta){ showToast('Venta no encontrada', 'error'); return; }
  var { data: items } = await _supabase.from('venta_items').select('*').eq('venta_id', id);

  var html = '<div style="text-align:center;margin-bottom:1rem;">';
  html += '<h3>LOPEZCELL</h3>';
  html += '<div style="color:var(--muted);font-size:12px;">Santa Marta, Magdalena · Colombia</div>';
  html += '<div class="inv-meta">Factura #' + venta.id + ' · ' + new Date(venta.created_at).toLocaleDateString() + '</div>';
  html += '</div>';
  html += '<table><thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>';
  var total = 0;
  if(items) items.forEach(function(it){
    var sub = it.precio * it.cantidad;
    total += sub;
    html += '<tr><td>' + it.nombre + '</td><td>' + it.cantidad + '</td><td>$' + Number(it.precio).toLocaleString('es-CO') + '</td><td>$' + sub.toLocaleString('es-CO') + '</td></tr>';
  });
  html += '</tbody></table>';
  html += '<div class="inv-total">Total: $' + total.toLocaleString('es-CO') + '</div>';
  html += '<div style="text-align:center;color:var(--muted);font-size:11px;margin-top:1.5rem;">¡Gracias por tu compra!</div>';

  document.getElementById('invoiceContent').innerHTML = html;
  document.getElementById('invoiceModal').classList.add('open');
}

function closeInvoice(){
  document.getElementById('invoiceModal').classList.remove('open');
}

function printInvoice(){
  window.print();
}

/* ─── INIT ─── */
loadDashboard();
loadProducts();
