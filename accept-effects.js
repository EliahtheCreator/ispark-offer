(() => {
  const canvas = document.getElementById('glitch-canvas');
  const ctx = canvas.getContext('2d');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const view = document.querySelector('.result-view');
  const warp = document.getElementById('warp-displacement');
  const noise = document.getElementById('warp-noise');
  const rand = (min, max) => min + Math.random() * (max - min);
  let timer, frame, width, height, cluster = 0;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  function clear() {
    cancelAnimationFrame(frame);
    view.style.removeProperty('translate');
    view.style.removeProperty('filter');
    warp.setAttribute('scale', '0');
    ctx.clearRect(0, 0, width, height);
  }
  function schedule() {
    clearTimeout(timer);
    if (motion.matches || document.hidden) return;
    // Irregular quiet periods alternate with short, clustered signal failures.
    const delay = cluster > 0 ? rand(160, 380) : Math.random() < .18 ? rand(2600, 4200) : rand(850, 1900);
    timer = setTimeout(burst, delay);
  }
  function burst() {
    if (motion.matches || document.hidden) return;
    if (cluster > 0) cluster--;
    else if (Math.random() < .25) cluster = Math.floor(rand(1, 4));
    const type = Math.random() < .65 ? 'tear' : 'dropout';
    const duration = rand(220, 620);
    const y = rand(0, height * .8);
    const distort = Math.random() < .85;
    const start = performance.now();
    let nextPaint = 0;
    function draw(now) {
      if (now - start > duration) { clear(); schedule(); return; }
      if (now >= nextPaint) {
        nextPaint = now + rand(35, 100);
        if (distort) {
          // Displace the original pixels only: no recoloring, font swaps or asset edits.
          noise.setAttribute('seed', Math.floor(rand(1, 9999)));
          noise.setAttribute('baseFrequency', `0.001 ${rand(.035, .15)}`);
          warp.setAttribute('scale', rand(18, type === 'dropout' ? 85 : 48));
          view.style.filter = 'url(#signal-warp)';
        }
        ctx.clearRect(0, 0, width, height);
          const bandY = y + rand(-8, 8);
          const bandH = type === 'dropout' ? rand(35, 100) : rand(6, 24);
          ctx.fillStyle = 'rgba(4,7,13,.8)';
          ctx.fillRect(0, bandY, width, bandH);
          for (let bx = 0; bx < width; bx += rand(3, 24)) {
            ctx.fillStyle = Math.random() < .15 ? 'rgba(74,168,183,.45)' : `rgba(215,222,225,${rand(.25,.8)})`;
            ctx.fillRect(bx, bandY + rand(0, bandH), rand(5, 65), rand(2, 7));
          }
          // Only occasional heavier failures disturb the whole picture.
          if (type === 'dropout') view.style.translate = `${rand(-14,14)}px ${rand(-3,3)}px`;
      }
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  function reset() { cluster = 0; clear(); schedule(); }
  document.addEventListener('visibilitychange', reset);
  motion.addEventListener('change', reset);
  resize(); schedule();
})();
