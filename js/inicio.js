(function(){
  const canvas = document.getElementById('tech-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;

  function resize(){
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', function(){ resize(); initNodes(); });

  const NUM = 55;
  const CONNECT_DIST = 140;
  const PULSE_SPEED = 0.012;
  let nodes = [];

  function initNodes(){
    nodes = Array.from({length: NUM}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1.2,
      pulse: Math.random() * Math.PI * 2
    }));
  }
  initNodes();

  function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move nodes
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += PULSE_SPEED;
      if(n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if(n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });

    // Draw connections
    for(let i = 0; i < nodes.length; i++){
      for(let j = i+1; j < nodes.length; j++){
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < CONNECT_DIST){
          const alpha = (1 - dist/CONNECT_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(96,180,255,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // Draw nodes (pulsing dots)
    nodes.forEach(n => {
      const glow = 0.55 + Math.sin(n.pulse) * 0.35;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(96,180,255,${glow})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

// Carousel
(function(){
  const track = document.getElementById('carouselTrack');
  const dots = document.querySelectorAll('#carouselDots span');
  if(!track || !dots.length) return;
  let idx = 0;
  function goTo(i){
    idx = i;
    track.style.transform = 'translateX(-' + (idx * 100) + '%)';
    dots.forEach((d, j) => d.classList.toggle('active', j === idx));
  }
  setInterval(function(){
    goTo((idx + 1) % dots.length);
  }, 3500);
})();


// Hide WA float when footer is visible
window.addEventListener('scroll', function(){
  var wa = document.querySelector('.wa-float');
  if(!wa) return;
  var footer = document.querySelector('footer');
  if(!footer) return;
  var rect = footer.getBoundingClientRect();
  var windowHeight = window.innerHeight;
  if(rect.top < windowHeight + 50) {
    wa.style.opacity = '0';
    wa.style.pointerEvents = 'none';
  } else {
    wa.style.opacity = '1';
    wa.style.pointerEvents = 'auto';
  }
});
