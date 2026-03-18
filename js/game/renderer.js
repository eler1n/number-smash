/* ============================================
   Number Smash - Canvas Renderer
   Blobs with numbers, particles, explosions, screen shake
   ============================================ */
var Renderer = (function () {
  var canvas = null, ctx = null, w = 0, h = 0;
  var particles = [];
  var floats = []; // floating score text
  var shakeIntensity = 0;
  var shakeDuration = 0;
  var shakeStart = 0;

  // Drag state for trajectory preview
  var dragLine = null; // { fromX, fromY, toX, toY }

  function init(canvasId) {
    canvas = document.getElementById(canvasId);
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    w = canvas.clientWidth || 560;
    h = canvas.clientHeight || 440;
    if (w === 0 || h === 0) { w = 560; h = 440; }
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getSize() { return { width: w, height: h }; }
  function getCanvas() { return canvas; }

  function draw() {
    if (!ctx) return;

    // Screen shake offset
    var sx = 0, sy = 0;
    if (shakeDuration > 0) {
      var elapsed = Date.now() - shakeStart;
      if (elapsed < shakeDuration) {
        var progress = 1 - elapsed / shakeDuration;
        sx = (Math.random() - 0.5) * shakeIntensity * progress;
        sy = (Math.random() - 0.5) * shakeIntensity * progress;
      } else {
        shakeDuration = 0;
      }
    }

    ctx.save();
    ctx.translate(sx, sy);

    // Background
    var grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    grad.addColorStop(0, '#151530');
    grad.addColorStop(1, '#0A0A1A');
    ctx.fillStyle = grad;
    ctx.fillRect(-20, -20, w + 40, h + 40);

    // Subtle grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    for (var gx = 20; gx < w; gx += 40) {
      for (var gy = 20; gy < h; gy += 40) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw blobs
    var blobs = Engine.getBlobs();
    blobs.forEach(function (b) {
      drawBlob(b);
    });

    // Drag trajectory line
    if (dragLine) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(dragLine.fromX, dragLine.fromY);
      ctx.lineTo(dragLine.toX, dragLine.toY);
      ctx.stroke();
      // Arrow head
      var angle = Math.atan2(dragLine.toY - dragLine.fromY, dragLine.toX - dragLine.fromX);
      var ax = dragLine.toX, ay = dragLine.toY;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 10 * Math.cos(angle - 0.4), ay - 10 * Math.sin(angle - 0.4));
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 10 * Math.cos(angle + 0.4), ay - 10 * Math.sin(angle + 0.4));
      ctx.stroke();
      ctx.restore();
    }

    // Particles
    drawParticles();

    // Floating score text
    drawFloats();

    ctx.restore();
  }

  function drawBlob(body) {
    var val = body.numberValue;
    var r = GameObjects.getRadius(val);
    var color = GameObjects.getColor(val);
    var x = body.position.x, y = body.position.y;

    // Speed glow
    var speed = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);

    ctx.save();
    ctx.translate(x, y);

    // Squash-stretch based on velocity
    var stretch = 1 + Math.min(speed * 0.02, 0.25);
    var angle = Math.atan2(body.velocity.y, body.velocity.x);
    if (speed > 1) {
      ctx.rotate(angle);
      ctx.scale(stretch, 1 / stretch);
      ctx.rotate(-angle);
    }

    // Glow when moving fast
    if (speed > 3) {
      ctx.shadowColor = color;
      ctx.shadowBlur = Math.min(speed * 4, 30);
    }

    // Blob body — gradient for 3D look
    var bg = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    bg.addColorStop(0, lighten(color, 40));
    bg.addColorStop(0.7, color);
    bg.addColorStop(1, darken(color, 30));
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Subtle border
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Shine highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.save();
    ctx.translate(-r * 0.25, -r * 0.3);
    ctx.scale(1, 0.55);
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();

    // Number text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold ' + Math.round(r * 0.9) + 'px Fredoka';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(val), 0, 1);

    // Dark text outline for readability
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeText(String(val), 0, 1);

    // Blob type indicator for special types
    if (body.blobType === 'negative') {
      ctx.fillStyle = 'rgba(255,0,0,0.15)';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF6666';
      ctx.font = 'bold ' + Math.round(r * 0.4) + 'px Fredoka';
      ctx.fillText('-', 0, -r * 0.55);
    } else if (body.blobType === 'multiply') {
      ctx.fillStyle = 'rgba(255,215,0,0.15)';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold ' + Math.round(r * 0.4) + 'px Fredoka';
      ctx.fillText('\u00D7', 0, -r * 0.55);
    }

    ctx.restore();

    // Trail particles when moving fast
    if (speed > 4 && Math.random() < 0.4) {
      spawnParticle(x - body.velocity.x * 0.5, y - body.velocity.y * 0.5, color, 3);
    }
  }

  // --- Color helpers ---
  function lighten(hex, amt) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, r + amt); g = Math.min(255, g + amt); b = Math.min(255, b + amt);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function darken(hex, amt) { return lighten(hex, -amt); }

  // --- Particles ---
  function spawnParticle(x, y, color, size) {
    particles.push({ x:x, y:y, vx:(Math.random()-.5)*3, vy:(Math.random()-.5)*3 - 1,
                      life:1, decay:.025 + Math.random()*.02, color:color, size: size || 3 });
  }

  function spawnExplosion(x, y, color, count) {
    count = count || 20;
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      var speed = 3 + Math.random() * 6;
      particles.push({
        x:x, y:y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1, decay: .015 + Math.random() * .015,
        color: color, size: 3 + Math.random() * 5,
      });
    }
  }

  function spawnMergeEffect(x, y, color) {
    // Ring burst
    for (var i = 0; i < 12; i++) {
      var angle = (Math.PI * 2 / 12) * i;
      particles.push({
        x:x, y:y,
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 4,
        life: 1, decay: .04,
        color: color, size: 2 + Math.random() * 2,
      });
    }
  }

  function spawnCorrectExplosion(x, y) {
    var colors = ['#FF3E6C', '#FFE66D', '#4ECDC4', '#FF6B35', '#9B6DFF', '#51CF66', '#FFFFFF'];
    for (var i = 0; i < 50; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * 8;
      particles.push({
        x:x, y:y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 1, decay: .01 + Math.random() * .015,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 6,
      });
    }
  }

  function spawnSplitEffect(x, y) {
    var colors = ['#FF4444', '#FF6B6B', '#FF8888', '#FFAAAA'];
    for (var i = 0; i < 25; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 3 + Math.random() * 5;
      particles.push({
        x:x, y:y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1, decay: .02 + Math.random() * .02,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 4,
      });
    }
  }

  function drawParticles() {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- Floating text ---
  function spawnFloat(x, y, text, color) {
    floats.push({ x:x, y:y, text:text, color: color || '#FFE66D', life: 1 });
  }

  function drawFloats() {
    for (var i = floats.length - 1; i >= 0; i--) {
      var f = floats[i];
      f.y -= 1.5;
      f.life -= 0.02;
      if (f.life <= 0) { floats.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = f.life;
      ctx.fillStyle = f.color;
      ctx.font = 'bold ' + Math.round(24 + (1 - f.life) * 10) + 'px Fredoka';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
  }

  // --- Screen shake ---
  function shake(intensity, duration) {
    shakeIntensity = intensity;
    shakeDuration = duration;
    shakeStart = Date.now();
  }

  // --- Drag line ---
  function setDragLine(from, to) { dragLine = from ? { fromX: from.x, fromY: from.y, toX: to.x, toY: to.y } : null; }
  function clearDragLine() { dragLine = null; }

  return {
    init:init, resize:resize, getSize:getSize, getCanvas:getCanvas, draw:draw,
    spawnParticle:spawnParticle, spawnExplosion:spawnExplosion, spawnMergeEffect:spawnMergeEffect,
    spawnCorrectExplosion:spawnCorrectExplosion, spawnSplitEffect:spawnSplitEffect,
    spawnFloat:spawnFloat, shake:shake,
    setDragLine:setDragLine, clearDragLine:clearDragLine,
  };
})();
