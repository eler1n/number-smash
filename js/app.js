/* ============================================
   Number Smash - Game Controller & App Router
   ============================================ */

// ============================================
// GAME CONTROLLER
// ============================================
var Game = (function () {
  var zone = null;         // current zone config
  var score = 0;
  var combo = 0;
  var maxCombo = 0;
  var correctHits = 0;
  var incorrectHits = 0;
  var totalMerges = 0;
  var mergeHistory = [];   // for emoji share grid
  var timeRemaining = 0;
  var timerTotal = 0;
  var timerInterval = null;
  var spawnInterval = null;
  var isRunning = false;
  var lastScore = 0;
  var lastMaxCombo = 0;
  var isEndless = false;
  var endlessLevel = 0;

  // Swipe/flick state
  var dragBlob = null;
  var dragStart = null;
  var dragStartTime = 0;

  function startZone(zoneConfig, endless) {
    zone = zoneConfig;
    isEndless = !!endless;
    endlessLevel = 0;
    score = 0;
    combo = 0;
    maxCombo = 0;
    correctHits = 0;
    incorrectHits = 0;
    totalMerges = 0;
    mergeHistory = [];
    isRunning = false;

    // Init renderer
    Renderer.init('game-canvas');
    var size = Renderer.getSize();

    // Init physics engine
    Engine.clear();
    Engine.init(size.width, size.height, {
      onMerge: handleMerge,
      onBlobUpdate: function () { Renderer.draw(); },
    });

    // Generate first target
    var target = Solver.generateTarget(zone.targetMin, zone.targetMax);
    Engine.setTarget(target);
    updateTargetDisplay(target);

    // Spawn initial blobs
    spawnInitialBlobs(target);

    // Timer setup
    timerTotal = zone.timer;
    timeRemaining = timerTotal;
    updateTimerBar();

    // Update HUD
    updateScore();
    updateCombo();

    // Setup input
    setupInput();

    // Show swipe hint on first play
    if (State.get('player.firstVisit') !== false) {
      var hint = document.getElementById('swipe-hint');
      if (hint) {
        hint.style.display = '';
        setTimeout(function () { hint.style.display = 'none'; }, 3000);
      }
    }

    // Hide game over overlay
    document.getElementById('gameover-overlay').style.display = 'none';

    // Start!
    isRunning = true;
    Engine.start();
    startTimer();
    startSpawner();
  }

  function spawnInitialBlobs(target) {
    var size = Renderer.getSize();
    var blobDefs = Solver.generateBlobs(target, zone.numMin, zone.numMax, zone.blobCount, zone.blobTypes);
    blobDefs.forEach(function (bd) {
      var x = 40 + Math.random() * (size.width - 80);
      var y = 40 + Math.random() * (size.height - 120);
      Engine.spawnBlob(bd.value, x, y, bd.type);
    });
  }

  function handleMerge(resultValue, x, y, isCorrect, isOvershoot) {
    totalMerges++;
    State.set('player.totalMerges', (State.get('player.totalMerges') || 0) + 1);

    if (isCorrect) {
      // HIT TARGET!
      correctHits++;
      combo++;
      if (combo > maxCombo) maxCombo = combo;

      // Score: base + combo bonus
      var points = 100 + combo * combo * 15;
      if (isEndless) points = Math.floor(points * (1 + endlessLevel * 0.1));
      score += points;

      mergeHistory.push({ correct: true, overshoot: false });

      // Visual + audio feedback
      Renderer.spawnCorrectExplosion(x, y);
      Renderer.spawnFloat(x, y, '+' + points, '#FFE66D');
      Sounds.play('correct');

      if (combo >= 3) {
        Sounds.play('combo', combo);
        Renderer.shake(Math.min(combo * 3, 20), 200);
        var msg = Solver.getComboMessage(combo);
        if (msg) Renderer.spawnFloat(x, y - 40, msg, '#FF3E6C');
      } else {
        Renderer.shake(6, 100);
      }

      updateScore();
      updateCombo();

      // Add time bonus for hits
      if (!isEndless) {
        timeRemaining = Math.min(timeRemaining + 2, timerTotal);
        updateTimerBar();
      } else {
        timeRemaining = Math.min(timeRemaining + 1.5, timerTotal);
        endlessLevel++;
      }

      // New target
      setTimeout(function () {
        if (!isRunning) return;
        var newTarget;
        if (isEndless) {
          var cfg = Levels.getEndlessConfig();
          var tMin = Math.floor(cfg.startTarget + endlessLevel * cfg.targetGrowth);
          var tMax = tMin + 5 + Math.floor(endlessLevel * 0.3);
          newTarget = Solver.generateTarget(tMin, tMax);
        } else {
          newTarget = Solver.generateTarget(zone.targetMin, zone.targetMax);
        }
        Engine.setTarget(newTarget);
        updateTargetDisplay(newTarget);
        Sounds.play('newTarget');

        // Spawn a couple more blobs to keep arena alive
        var size = Renderer.getSize();
        var extra = 1 + Math.floor(Math.random() * 2);
        for (var i = 0; i < extra; i++) {
          var val = zone.numMin + Math.floor(Math.random() * (zone.numMax - zone.numMin + 1));
          Engine.spawnBlob(val, 30 + Math.random() * (size.width - 60), 30);
        }
      }, 300);

    } else if (isOvershoot) {
      // OVERSHOOT — blob splits
      combo = 0;
      incorrectHits++;
      mergeHistory.push({ correct: false, overshoot: true });

      Renderer.spawnSplitEffect(x, y);
      Renderer.spawnFloat(x, y, 'SPLIT!', '#FF4444');
      Renderer.shake(10, 200);
      Sounds.play('overshoot');
      updateCombo();

    } else {
      // Normal merge (under target)
      mergeHistory.push({ correct: false, overshoot: false });
      Renderer.spawnMergeEffect(x, y, GameObjects.getColor(resultValue));
      Renderer.spawnFloat(x, y, String(resultValue), '#FFFFFF');
      Sounds.play('merge', resultValue);
    }
  }

  // --- Timer ---
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    var lastTick = Date.now();
    timerInterval = setInterval(function () {
      if (!isRunning) return;
      var now = Date.now();
      var dt = (now - lastTick) / 1000;
      lastTick = now;
      timeRemaining -= dt;

      if (timeRemaining <= 0) {
        timeRemaining = 0;
        endRound();
        return;
      }

      updateTimerBar();

      // Tick sound in last 5 seconds
      if (timeRemaining <= 5 && timeRemaining > 0 && Math.floor(timeRemaining + dt) !== Math.floor(timeRemaining)) {
        Sounds.play('tick');
      }
    }, 50);
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  // --- Blob spawner ---
  function startSpawner() {
    if (spawnInterval) clearInterval(spawnInterval);
    spawnInterval = setInterval(function () {
      if (!isRunning) return;
      var blobs = Engine.getBlobs();
      var maxBlobs = zone.blobCount + 4;
      if (blobs.length < maxBlobs) {
        var size = Renderer.getSize();
        var val = zone.numMin + Math.floor(Math.random() * (zone.numMax - zone.numMin + 1));
        var types = zone.blobTypes || ['normal'];
        var type = types[Math.floor(Math.random() * types.length)];
        if (type !== 'normal' && Math.random() > 0.3) type = 'normal';
        Engine.spawnBlob(val, 40 + Math.random() * (size.width - 80), -20, type);
      }
    }, zone.spawnInterval || 3000);
  }

  function stopSpawner() {
    if (spawnInterval) clearInterval(spawnInterval);
    spawnInterval = null;
  }

  // --- End round ---
  function endRound() {
    isRunning = false;
    Engine.stop();
    stopTimer();
    stopSpawner();

    Sounds.play('timeup');

    // Calculate final score
    lastScore = score;
    lastMaxCombo = maxCombo;

    // Update global stats
    if (score > (State.get('player.highScore') || 0)) {
      State.set('player.highScore', score);
    }
    if (maxCombo > (State.get('player.maxCombo') || 0)) {
      State.set('player.maxCombo', maxCombo);
    }
    if (incorrectHits === 0 && correctHits > 0) {
      State.set('player.perfectRounds', (State.get('player.perfectRounds') || 0) + 1);
    }

    // Coins
    var coinsEarned = Math.floor(score / 20);
    State.addCoins(coinsEarned);

    // Stars
    var stars = 0;
    if (zone.star1) {
      stars = Solver.calculateStars(score, zone);
      if (zone.id && zone.id.indexOf('daily_') !== 0 && zone.id.indexOf('endless') !== 0) {
        State.addStars(zone.id, stars);
      }
    }

    // Daily
    if (zone.id && zone.id.indexOf('daily_') === 0) {
      Challenges.completedDaily(score, stars);
    }

    Levels.checkWorldUnlocks();
    Achievements.checkAll();

    // Show game over
    showGameOver(stars, coinsEarned);
  }

  function showGameOver(stars, coins) {
    var ov = document.getElementById('gameover-overlay');
    ov.style.display = '';

    document.getElementById('gameover-title').textContent = isEndless ? 'Game Over!' : "Time's Up!";

    var scoreEl = document.getElementById('gameover-score');
    // Animate score counting up
    animateCounter(scoreEl, 0, score, 600);

    document.getElementById('go-combo').textContent = maxCombo + 'x';
    document.getElementById('go-merges').textContent = String(totalMerges);
    var accuracy = correctHits + incorrectHits > 0
      ? Math.round(correctHits / (correctHits + incorrectHits) * 100) : 0;
    document.getElementById('go-accuracy').textContent = accuracy + '%';

    var starsC = document.getElementById('gameover-stars');
    Components.createStarElements(stars, starsC, true);

    var msg = Solver.getScoreMessage(score);
    if (coins > 0) msg += ' +' + coins + ' coins!';
    document.getElementById('gameover-message').textContent = msg;

    // Emoji grid
    var emojiEl = document.getElementById('gameover-emoji');
    emojiEl.textContent = Sharing.generateEmojiGrid(mergeHistory);

    // Confetti for high scores
    if (score >= 500 || stars >= 2) {
      Components.spawnConfetti();
      Sounds.play('win');
    }
  }

  function animateCounter(el, from, to, duration) {
    var start = performance.now();
    function step(time) {
      var progress = Math.min((time - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      el.textContent = Math.floor(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function playAgain() {
    document.getElementById('gameover-overlay').style.display = 'none';
    if (isEndless) {
      startZone(zone, true);
    } else {
      startZone(zone, false);
    }
  }

  function quit() {
    isRunning = false;
    Engine.stop();
    Engine.clear();
    stopTimer();
    stopSpawner();
    document.getElementById('gameover-overlay').style.display = 'none';
    App.navigate('menu');
  }

  // --- HUD Updates ---
  function updateScore() {
    var el = document.getElementById('hud-score');
    if (el) el.textContent = score;
  }

  function updateCombo() {
    var el = document.getElementById('hud-combo');
    var countEl = document.getElementById('combo-count');
    if (!el) return;
    if (combo >= 2) {
      el.style.display = '';
      if (countEl) countEl.textContent = combo;
      el.className = 'hud-combo' + (combo >= 7 ? ' combo-mega' : '');
      // Re-trigger animation
      el.style.animation = 'none';
      el.offsetHeight; // force reflow
      el.style.animation = '';
    } else {
      el.style.display = 'none';
    }
  }

  function updateTargetDisplay(target) {
    var el = document.getElementById('target-number');
    var container = document.getElementById('target-display');
    if (el) el.textContent = target;
    // Re-trigger pop animation
    if (container) {
      container.style.animation = 'none';
      container.offsetHeight;
      container.style.animation = '';
    }
  }

  function updateTimerBar() {
    var bar = document.getElementById('timer-bar');
    if (!bar) return;
    var pct = Math.max(0, timeRemaining / timerTotal * 100);
    bar.style.width = pct + '%';
    if (timeRemaining <= 5) {
      bar.classList.add('urgent');
    } else {
      bar.classList.remove('urgent');
    }
  }

  // --- INPUT: Swipe/Flick ---
  function setupInput() {
    var canvas = Renderer.getCanvas();
    if (!canvas) return;

    // Clone to remove old listeners
    var newCanvas = canvas.cloneNode(true);
    canvas.parentNode.replaceChild(newCanvas, canvas);
    Renderer.init('game-canvas');
    canvas = Renderer.getCanvas();

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerUp);
  }

  function getPos(e) {
    var rect = Renderer.getCanvas().getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e) {
    e.preventDefault();
    Sounds.resume();
    if (!isRunning) return;

    var pos = getPos(e);
    var blob = Engine.getBlobAt(pos.x, pos.y);
    if (blob) {
      dragBlob = blob;
      dragStart = pos;
      dragStartTime = Date.now();
      Renderer.setDragLine(null, null); // clear
    }
  }

  function onPointerMove(e) {
    if (!dragBlob || !isRunning) return;
    e.preventDefault();
    var pos = getPos(e);
    // Show trajectory: line from blob to where it will go (opposite of drag direction)
    var dx = pos.x - dragStart.x;
    var dy = pos.y - dragStart.y;
    var bx = dragBlob.position.x;
    var by = dragBlob.position.y;
    Renderer.setDragLine(
      { x: bx, y: by },
      { x: bx - dx * 2, y: by - dy * 2 }
    );
  }

  function onPointerUp(e) {
    if (!dragBlob || !isRunning) {
      dragBlob = null;
      Renderer.clearDragLine();
      return;
    }

    var pos = getPos(e);
    var dx = pos.x - dragStart.x;
    var dy = pos.y - dragStart.y;
    var dt = Math.max(Date.now() - dragStartTime, 1);

    // Calculate flick force (opposite direction of drag for slingshot feel)
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 8) { // minimum drag distance
      var speed = Math.min(dist / dt * 15, 0.15); // cap max force
      var force = {
        x: -dx / dist * speed,
        y: -dy / dist * speed,
      };
      Engine.flickBlob(dragBlob, force);
      Sounds.play('flick');
    }

    dragBlob = null;
    dragStart = null;
    Renderer.clearDragLine();
  }

  // Public getters for sharing
  function getLastScore() { return lastScore; }
  function getLastMaxCombo() { return lastMaxCombo; }
  function getMergeHistory() { return mergeHistory; }

  return {
    startZone:startZone, playAgain:playAgain, quit:quit,
    getLastScore:getLastScore, getLastMaxCombo:getLastMaxCombo, getMergeHistory:getMergeHistory,
  };
})();


// ============================================
// APP ROUTER
// ============================================
var App = (function () {
  function init() {
    State.load();
    Sounds.init();
    RevenueCatStore.init();

    var hash = window.location.hash.substring(1);
    showLoading(function () {
      if (hash === 'daily') navigate('daily');
      else if (hash) navigate(hash);
      else navigate('menu');
    });

    window.addEventListener('hashchange', function () {
      var h = window.location.hash.substring(1);
      if (h) navigate(h);
    });

    document.addEventListener('click', function () { Sounds.resume(); }, { once: true });
    document.addEventListener('touchstart', function () { Sounds.resume(); }, { once: true });
  }

  function showLoading(cb) { setTimeout(cb, 1200); }

  function navigate(route) {
    var parts = route.split('/');
    var screen = parts[0];
    var param = parts.slice(1).join('/');

    // Hide all screens
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove('active');

    // Also hide game over overlay when navigating away
    var goOverlay = document.getElementById('gameover-overlay');
    if (goOverlay) goOverlay.style.display = 'none';

    var targetId = 'screen-' + screen;
    var target = document.getElementById(targetId);
    if (!target) { target = document.getElementById('screen-menu'); screen = 'menu'; }
    target.classList.add('active');

    switch (screen) {
      case 'menu':
        Screens.updateMenuStats();
        break;
      case 'worlds':
        Screens.renderWorldSelect();
        break;
      case 'game':
        if (param) {
          var zone;
          if (param.indexOf('daily_') === 0 && window._dailyZone) {
            zone = window._dailyZone;
          } else if (param === 'endless') {
            zone = buildEndlessZone();
          } else {
            zone = Levels.getZone(param);
          }
          if (zone) {
            Game.startZone(zone, param === 'endless');
          } else {
            Components.showToast('Zone not found!', 'error');
            navigate('worlds');
          }
        }
        break;
      case 'collection':
        Screens.renderCollection();
        break;
      case 'daily':
        Challenges.renderDailyScreen();
        break;
      case 'shop':
        Shop.render();
        break;
      case 'achievements':
        Achievements.render();
        break;
    }

    var newHash = '#' + route;
    if (window.location.hash !== newHash) history.replaceState(null, '', newHash);
  }

  function startEndless() {
    navigate('game/endless');
  }

  function buildEndlessZone() {
    var cfg = Levels.getEndlessConfig();
    return {
      id: 'endless',
      world: 0, num: 0, name: 'Endless Mode',
      targetMin: cfg.startTarget,
      targetMax: cfg.startTarget + 5,
      numMin: cfg.numMin,
      numMax: cfg.numMax,
      blobCount: cfg.startBlobs,
      timer: cfg.startTimer,
      spawnInterval: cfg.spawnInterval,
      blobTypes: cfg.types,
      isPremium: false,
      star1: 200, star2: 500, star3: 1000,
    };
  }

  return { init:init, navigate:navigate, startEndless:startEndless };
})();


// ============================================
// BOOT
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  App.init();
  setTimeout(function () {
    if (Tutorial.shouldShow()) Tutorial.start();
  }, 1500);
});
