(() => {
  const canvas = document.getElementById('glitch-canvas');
  const ctx = canvas.getContext('2d');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer, frame, width, height;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  function clear() {
    cancelAnimationFrame(frame);
    document.body.classList.remove('is-glitching');
    ctx.clearRect(0, 0, width, height);
  }
  function schedule() {
    clearTimeout(timer);
    if (!motion.matches && !document.hidden) timer = setTimeout(burst, 5000 + Math.random() * 4000);
  }
  function burst() {
    if (motion.matches || document.hidden) return;
    const start = performance.now();
    document.body.classList.add('is-glitching');
    let last = 0;
    function draw(now) {
      if (now - start > 420) { clear(); schedule(); return; }
      if (now - last > 65) {
        last = now;
        ctx.clearRect(0, 0, width, height);
        // Sparse analog interference: restrained brightness, no full-screen flash.
        for (let i = 0; i < 7; i++) {
          const y = Math.random() * height;
          const h = 1 + Math.random() * 11;
          ctx.fillStyle = i % 2 ? 'rgba(79,168,190,.12)' : 'rgba(207,67,59,.16)';
          ctx.fillRect(Math.random() * width * .2, y, width * (.4 + Math.random() * .6), h);
          for (let x = 0; x < width; x += 6) {
            ctx.fillStyle = `rgba(185,200,211,${Math.random() * .2})`;
            ctx.fillRect(x, y, 2 + Math.random() * 10, Math.random() * h);
          }
        }
        ctx.fillStyle = 'rgba(120,145,160,.035)';
        for (let y = 0; y < height; y += 4) ctx.fillRect(0, y, width, 1);
      }
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { clear(); schedule(); });
  motion.addEventListener('change', () => { clear(); schedule(); });
  resize(); schedule();
})();
