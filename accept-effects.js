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
    view.style.removeProperty('transform');
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
    const type = roll < .38 ? 'dots' : roll < .7 ? 'blocks' : roll < .93 ? 'tear' : 'dropout';
    const duration = type === 'dots' ? rand(35, 110) : rand(70, 290);
    const x = rand(0, width * .85), y = rand(0, height * .92);
    const patchWidth = Math.min(width - x, rand(35, Math.min(240, width * .4)));
    const patchHeight = Math.min(height - y, rand(18, 100));
    const start = performance.now();
    let nextPaint = 0;
    function draw(now) {
      if (now - start > duration) { clear(); schedule(); return; }
      if (now >= nextPaint) {
        nextPaint = now + rand(25, 95);
        ctx.clearRect(0, 0, width, height);
        if (type === 'dots') {
          for (let i = 0, n = rand(1, 12); i < n; i++) {
            ctx.fillStyle = `rgba(235,242,245,${rand(.3, .85)})`;
            const size = Math.random() < .85 ? rand(1, 3) : rand(3, 6);
            ctx.fillRect(rand(0, width), rand(0, height), size, size);
          }
        } else if (type === 'blocks') {
          const cell = Math.floor(rand(5, 18));
          for (let by = 0; by < patchHeight; by += cell) {
            for (let bx = 0; bx < patchWidth; bx += cell) {
              if (Math.random() < .25) continue;
              const shade = Math.floor(rand(35, 205));
              ctx.fillStyle = Math.random() < .22 ? `rgba(172,62,58,${rand(.2,.65)})` : `rgba(${shade},${shade},${shade},${rand(.15,.65)})`;
              ctx.fillRect(x + bx, y + by, cell - 1, cell - 1);
            }
          }
        } else {
          const bandY = y + rand(-8, 8);
          const bandH = type === 'dropout' ? rand(12, 45) : rand(1, 9);
          ctx.fillStyle = 'rgba(4,7,13,.8)';
          ctx.fillRect(0, bandY, width, bandH);
          for (let bx = 0; bx < width; bx += rand(3, 24)) {
            ctx.fillStyle = Math.random() < .15 ? 'rgba(74,168,183,.45)' : `rgba(215,222,225,${rand(.04,.42)})`;
            ctx.fillRect(bx, bandY + rand(0, bandH), rand(2, 35), rand(1, 3));
          }
          // Only occasional heavier failures disturb the whole picture.
          if (type === 'dropout') view.style.transform = `translate(${rand(-5,5)}px,${rand(-1,1)}px)`;
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
