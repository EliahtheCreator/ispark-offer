var canvas = document.getElementById('grid-canvas');
var ctx = canvas.getContext('2d');
var W, H;
var time = 0;
var enhancedSignal = document.body.classList.contains('accept-page');

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);

var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function drawGrid() {
  ctx.clearRect(0, 0, W, H);

  var centerX = W / 2;
  var horizonY = H * 0.35;

  if (enhancedSignal) {
    var glow = ctx.createRadialGradient(centerX, horizonY, 0, centerX, horizonY, W * .48);
    glow.addColorStop(0, 'rgba(207,63,51,.21)');
    glow.addColorStop(.15, 'rgba(179,58,58,.09)');
    glow.addColorStop(1, 'rgba(179,58,58,0)');
    ctx.save();
    ctx.translate(0, horizonY * .65);
    ctx.scale(1, .35);
    ctx.fillStyle = glow;
    ctx.fillRect(0, -H * 3, W, H * 6);
    ctx.restore();
  }
  var gridSpacing = 60;
  var depth = 12;

  for (var i = 0; i <= depth; i++) {
    var t = i / depth;
    var y = horizonY + (H - horizonY) * (t * t);
    var alpha = (0.04 + t * 0.12) * (enhancedSignal ? 1.7 : 1);
    ctx.strokeStyle = 'rgba(179, 58, 58, ' + alpha + ')';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  var vanishX = centerX + Math.sin(time * 0.0003) * 40;
  if (enhancedSignal) {
    ctx.fillStyle = 'rgba(218,83,65,.65)';
    ctx.beginPath();
    ctx.ellipse(vanishX, horizonY, 3.5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  var numVertical = 24;
  for (var j = -numVertical; j <= numVertical; j++) {
    var bottomX = centerX + j * gridSpacing * 2;
    var vAlpha = (0.03 + (1 - Math.abs(j) / numVertical) * 0.08) * (enhancedSignal ? 2.4 : 1);
    ctx.strokeStyle = 'rgba(179, 58, 58, ' + vAlpha + ')';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(vanishX, horizonY);
    ctx.lineTo(bottomX, H);
    ctx.stroke();
  }

  var topGridSpacing = 80;
  ctx.strokeStyle = 'rgba(179, 58, 58, 0.03)';
  ctx.lineWidth = 0.5;
  for (var gx = 0; gx < W; gx += topGridSpacing) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, horizonY);
    ctx.stroke();
  }
  for (var gy = 0; gy < horizonY; gy += topGridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(W, gy);
    ctx.stroke();
  }

  var particleCount = 30;
  for (var p = 0; p < particleCount; p++) {
    var seed = p * 137.5;
    var px = (Math.sin(seed) * 0.5 + 0.5) * W;
    var py = ((Math.cos(seed * 1.3) * 0.5 + 0.5) * (H - horizonY)) + horizonY;
    var pulse = (Math.sin(time * 0.001 + seed) * 0.5 + 0.5);
    var size = 1 + pulse * 1.5;
    ctx.fillStyle = 'rgba(179, 58, 58, ' + (0.1 + pulse * 0.25) + ')';
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!prefersReduced) {
    time += 16;
    requestAnimationFrame(drawGrid);
  }
}

drawGrid();
