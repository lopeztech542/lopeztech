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

// Hide WA & IG float when footer is visible
window.addEventListener('scroll', function(){
  var wa = document.querySelector('.wa-float');
  var ig = document.querySelector('.ig-float');
  var footer = document.querySelector('footer');
  if(!footer) return;
  var rect = footer.getBoundingClientRect();
  var windowHeight = window.innerHeight;
  var hide = rect.top < windowHeight + 50;
  if(wa) {
    wa.style.opacity = hide ? '0' : '1';
    wa.style.pointerEvents = hide ? 'none' : 'auto';
  }
  if(ig) {
    ig.style.opacity = hide ? '0' : '1';
    ig.style.pointerEvents = hide ? 'none' : 'auto';
  }
});
