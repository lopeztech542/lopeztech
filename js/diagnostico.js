function openDiagModal(){
  document.getElementById('diagModal').classList.add('open');
}
function closeDiagModal(){
  document.getElementById('diagModal').classList.remove('open');
}

function sendForm(nombre, apellido, celular, marca, modelo, problema, modalForm){
  // 1. Send email via FormSubmit.co
  var formData = new FormData();
  formData.append('_captcha', 'false');
  formData.append('_subject', 'Nuevo diagnóstico solicitado - ' + nombre);
  formData.append('_replyto', celular);
  formData.append('Nombre', nombre);
  formData.append('Apellido', apellido);
  formData.append('Celular', celular);
  formData.append('Marca', marca);
  formData.append('Modelo', modelo);
  formData.append('Problema', problema);
  fetch('https://formsubmit.co/lopezrojano542@gmail.com', {
    method: 'POST', body: formData
  });

  // 2. Open WhatsApp
  var texto = 'Hola quiero solicitar un diagnostico';
  texto += '%0A%0ANombre: ' + encodeURIComponent(nombre);
  if (apellido) texto += '%0AApellido: ' + encodeURIComponent(apellido);
  texto += '%0ACelular: ' + encodeURIComponent(celular);
  texto += '%0AMarca: ' + encodeURIComponent(marca);
  if (modelo) texto += '%0AModelo: ' + encodeURIComponent(modelo);
  if (problema) texto += '%0AProblema: ' + encodeURIComponent(problema);
  window.open('https://wa.me/573235538178?text=' + texto, '_blank');

  if (modalForm) closeDiagModal();
}

// Inline form
document.getElementById('diagForm').addEventListener('submit', function(e){
  e.preventDefault();
  sendForm(
    document.getElementById('diagNombre').value,
    document.getElementById('diagApellido').value,
    document.getElementById('diagCelular').value,
    document.getElementById('diagMarca').value,
    document.getElementById('diagModelo').value,
    document.getElementById('diagProblema').value,
    false
  );
});

// Modal form
document.getElementById('diagModalForm').addEventListener('submit', function(e){
  e.preventDefault();
  sendForm(
    document.getElementById('modNombre').value,
    document.getElementById('modApellido').value,
    document.getElementById('modCelular').value,
    document.getElementById('modMarca').value,
    document.getElementById('modModelo').value,
    document.getElementById('modProblema').value,
    true
  );
});

// Close modal on overlay click
document.getElementById('diagModal')?.addEventListener('click', function(e){
  if(e.target === this) closeDiagModal();
});

// Hide WA float when footer enters viewport
window.addEventListener('scroll', function(){
  var wa = document.querySelector('.wa-float');
  if(!wa) return;
  var footer = document.querySelector('footer');
  if(!footer) return;
  var rect = footer.getBoundingClientRect();
  var windowHeight = window.innerHeight;
  if(rect.top < windowHeight + 50){
    wa.style.opacity = '0';
    wa.style.pointerEvents = 'none';
  } else {
    wa.style.opacity = '1';
    wa.style.pointerEvents = 'auto';
  }
});
