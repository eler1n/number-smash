/* ============================================
   Number Smash - UI Components
   ============================================ */
var Components = (function () {
  function showToast(msg, type, dur) {
    var c = document.getElementById('toast-container');
    if (!c) return;
    var t = document.createElement('div');
    t.className = 'toast ' + (type || 'info');
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, dur || 3000);
  }

  function renderStars(count, max) {
    max = max || 3;
    var r = '';
    for (var i = 0; i < max; i++) r += i < count ? '\u2B50' : '\u2606';
    return r;
  }

  function createStarElements(count, container, animated) {
    container.textContent = '';
    for (var i = 0; i < 3; i++) {
      var s = document.createElement('span');
      s.className = 'star' + (i < count ? ' earned' : '');
      s.textContent = i < count ? '\u2B50' : '\u2606';
      if (animated && i < count) s.style.animationDelay = (i * 0.2) + 's';
      container.appendChild(s);
    }
  }

  function spawnConfetti() {
    var colors = ['#FF3E6C', '#FFE66D', '#4ECDC4', '#FF6B35', '#9B6DFF', '#51CF66'];
    for (var i = 0; i < 40; i++) {
      var p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = Math.random() * 100 + 'vw';
      p.style.animationDuration = (1.5 + Math.random() * 2) + 's';
      p.style.animationDelay = Math.random() * 0.3 + 's';
      p.style.width = (5 + Math.random() * 8) + 'px';
      p.style.height = (5 + Math.random() * 8) + 'px';
      document.body.appendChild(p);
      setTimeout(function (el) { if (el.parentNode) el.parentNode.removeChild(el); }, 4000, p);
    }
  }

  return { showToast:showToast, renderStars:renderStars, createStarElements:createStarElements, spawnConfetti:spawnConfetti };
})();
