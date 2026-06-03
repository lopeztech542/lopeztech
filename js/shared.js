// Mobile slide menu toggle
document.querySelector('.nav-menu')?.addEventListener('click', function(){
  var menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
  var icon = this.querySelector('i');
  if(icon) icon.className = icon.className.includes('menu-2') ? 'ti ti-x' : 'ti ti-menu-2';
});
function closeMobileMenu(){
  document.getElementById('mobileMenu').classList.remove('open');
  var btn = document.querySelector('.nav-menu i');
  if(btn) btn.className = 'ti ti-menu-2';
}
document.getElementById('mobileOverlay')?.addEventListener('click', closeMobileMenu);
