(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const view = document.querySelector('.logo-signal');
  const warp = document.getElementById('warp-displacement');
  const noise = document.getElementById('warp-noise');
  const profile = document.getElementById('warp-profile');
  const rand = (min, max) => min + Math.random() * (max - min);
  let timer, frame;
  function clear() {
    cancelAnimationFrame(frame);
    view.style.removeProperty('filter');
    warp.setAttribute('scale', '0');
  }
  function schedule() {
    clearTimeout(timer);
    if (!motion.matches && !document.hidden) timer = setTimeout(burst, rand(2600, 5800));
  }
  function burst() {
    if (motion.matches || document.hidden) return;
    const tear = Math.random() < .45;
    const duration = rand(180, 420);
    const strength = rand(100, tear ? 190 : 150);
    const start = performance.now();
    noise.setAttribute('seed', Math.floor(rand(1, 9999)));
    noise.setAttribute('baseFrequency', `0 ${tear ? rand(.025, .07) : rand(.006, .018)}`);
    profile.setAttribute('type', tear ? 'discrete' : 'identity');
    profile.setAttribute('tableValues', '0.1 0.5 0.5 0.9');
    view.style.filter = 'url(#signal-warp)';
    let nextPaint = 0;
    function draw(now) {
      const progress = (now - start) / duration;
      if (progress >= 1) { clear(); schedule(); return; }
      if (now >= nextPaint) {
        nextPaint = now + rand(35, 80);
        // Horizontal displacement of existing pixels only; no noise or block overlays.
        warp.setAttribute('scale', strength * Math.sin(progress * Math.PI) * rand(.8, 1));
      }
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
  }
  function reset() { clear(); schedule(); }
  document.addEventListener('visibilitychange', reset);
  motion.addEventListener('change', reset);
  schedule();
})();
