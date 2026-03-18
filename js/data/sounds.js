/* ============================================
   Number Smash - Sound Manager (Web Audio synth)
   ============================================ */
var Sounds = (function () {
  var ctx = null, enabled = true;
  function init() {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    enabled = State.get('settings.soundEnabled') !== false;
  }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
  function toggle() { enabled = !enabled; State.set('settings.soundEnabled', enabled); }

  function tone(freq, dur, type, vol) {
    if (!ctx || !enabled) return; resume();
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(vol || .25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
  }
  function noise(dur, vol) {
    if (!ctx || !enabled) return; resume();
    var n = ctx.sampleRate * dur, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = ctx.createBufferSource(); s.buffer = b;
    var g = ctx.createGain(); g.gain.setValueAtTime(vol || .08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + dur);
    s.connect(g); g.connect(ctx.destination); s.start();
  }

  var sfx = {
    flick: function () { tone(300, .08, 'sine', .15); setTimeout(function () { tone(600, .06, 'sine', .1); }, 30); },
    merge: function (val) {
      var f = 300 + (val || 5) * 40;
      tone(f, .12, 'sine', .25);
      setTimeout(function () { tone(f * 1.5, .1, 'sine', .2); }, 60);
    },
    correct: function () {
      [523, 659, 784, 1047].forEach(function (n, i) {
        setTimeout(function () { tone(n, .15, 'sine', .3); }, i * 70);
      });
    },
    overshoot: function () {
      tone(400, .15, 'sawtooth', .15); noise(.1, .12);
      setTimeout(function () { tone(200, .2, 'sawtooth', .12); }, 80);
    },
    combo: function (level) {
      var base = 523 + level * 50;
      for (var i = 0; i < Math.min(level + 2, 6); i++) {
        (function (idx) {
          setTimeout(function () { tone(base + idx * 80, .12, 'sine', .2); }, idx * 50);
        })(i);
      }
    },
    tick: function () { tone(1000, .04, 'square', .1); },
    timeup: function () {
      [600, 500, 400, 300].forEach(function (n, i) {
        setTimeout(function () { tone(n, .2, 'sawtooth', .15); }, i * 120);
      });
    },
    newTarget: function () { tone(800, .06, 'sine', .15); setTimeout(function () { tone(1200, .08, 'sine', .15); }, 40); },
    click: function () { tone(800, .06, 'sine', .15); },
    unlock: function () { tone(600, .12, 'sine', .2); setTimeout(function () { tone(900, .2, 'sine', .25); }, 100); },
    win: function () {
      [523, 587, 659, 784, 880, 1047].forEach(function (n, i) {
        setTimeout(function () { tone(n, .15, 'sine', .25); }, i * 80);
      });
    },
  };
  function play(name, arg) { if (sfx[name]) sfx[name](arg); }
  return { init:init, play:play, toggle:toggle, resume:resume };
})();
