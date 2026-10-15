(() => {
  const canvas = document.getElementById('glitch-canvas');
  const ctx = canvas.getContext('2d');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const view = document.querySelector('.result-view');
  const rand = (min, max) => min + Math.random() * (max - min);
  let timer, frame, width, height, cluster = 0;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  function clear() {
    cancelAnimationFrame(frame);
    view.style.removeProperty('translate');
    ctx.clearRect(0, 0, width, height);
  }
  function schedule() {
    clearTimeout(timer);
    if (motion.matches || document.hidden) return;
    // Irregular quiet periods alternate with short, clustered signal failures.
    const delay = cluster > 0 ? rand(65, 320) : Math.random() < .18 ? rand(2800, 4600) : rand(350, 1900);
    timer = setTimeout(burst, delay);
  }
  function burst() {
    if (motion.matches || document.hidden) return;
    if (cluster > 0) cluster--;
    else if (Math.random() < .32) cluster = Math.floor(rand(1, 4));
    const roll = Math.random();
    const type = roll < .18 ? 'dots' : roll < .64 ? 'blocks' : roll < .88 ? 'tear' : 'dropout';
    const duration = type === 'dots' ? rand(80, 180) : rand(160, 480);
    const x = rand(0, width * .65), y = rand(0, height * .8);
    const patchWidth = Math.min(width - x, rand(width * .25, width * .65));
    const patchHeight = Math.min(height - y, rand(height * .09, height * .28));
    const start = performance.now();
    let nextPaint = 0;
    function draw(now) {
      if (now - start > duration) { clear(); schedule(); return; }
      if (now >= nextPaint) {
        nextPaint = now + rand(25, 95);
        ctx.clearRect(0, 0, width, height);
        if (type === 'dots') {
          for (let i = 0, n = rand(20, 65); i < n; i++) {
            ctx.fillStyle = `rgba(235,242,245,${rand(.65, 1)})`;
            const size = Math.random() < .85 ? rand(2, 5) : rand(5, 10);
            ctx.fillRect(rand(0, width), rand(0, height), size, size);
          }
        } else if (type === 'blocks') {
          const cell = Math.floor(rand(10, 30));
          for (let by = 0; by < patchHeight; by += cell) {
            for (let bx = 0; bx < patchWidth; bx += cell) {
              if (Math.random() < .12) continue;
              const shade = Math.floor(rand(70, 245));
              ctx.fillStyle = Math.random() < .22 ? `rgba(172,62,58,${rand(.5,.9)})` : `rgba(${shade},${shade},${shade},${rand(.45,.9)})`;
              ctx.fillRect(x + bx, y + by, cell - 1, cell - 1);
            }
          }
        } else {
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
