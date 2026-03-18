/* ============================================
   Number Smash - Daily Challenge & Streaks
   ============================================ */
var Challenges = (function () {
  function seededRandom(seed) { var x = Math.sin(seed) * 10000; return x - Math.floor(x); }
  function hashStr(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h = h & h; } return Math.abs(h); }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  function generateDaily() {
    var seed = hashStr('numsmash_' + todayStr());
    var r = function (n) { seed++; return Math.floor(seededRandom(seed) * n); };

    return {
      id: 'daily_' + todayStr(),
      world: 0, num: 0, name: "Today's Smash",
      targetMin: 8 + r(8),
      targetMax: 15 + r(10),
      numMin: 1 + r(2),
      numMax: 6 + r(4),
      blobCount: 7 + r(4),
      timer: 18 + r(5),
      spawnInterval: 2800 + r(1200),
      blobTypes: ['normal'],
      isPremium: false,
      star1: 100, star2: 300, star3: 600,
    };
  }

  function playDaily() {
    var today = todayStr();
    if (State.get('daily.lastCompleted') === today) {
      Components.showToast("Already completed today's challenge!", 'info');
      return;
    }
    window._dailyZone = generateDaily();
    App.navigate('game/daily_' + today);
  }

  function completedDaily(score, stars) {
    var today = todayStr();
    State.set('daily.lastCompleted', today);
    State.set('daily.lastScore', score);
    State.set('daily.lastStars', stars);
    updateStreak();
    State.addCoins(stars * 8);
    Components.showToast('Daily bonus: +' + (stars * 8) + ' coins!', 'success');
  }

  function updateStreak() {
    var today = todayStr();
    var last = State.get('player.lastPlayDate');
    var streak = State.get('player.streak') || 0;
    if (!last) { streak = 1; }
    else {
      var diff = Math.floor((new Date(today) - new Date(last)) / 86400000);
      if (diff === 1) streak++;
      else if (diff > 1) streak = 1;
    }
    State.set('player.streak', streak);
    State.set('player.lastPlayDate', today);
    Achievements.checkAll();
  }

  function renderDailyScreen() {
    var today = todayStr();
    var last = State.get('daily.lastCompleted');
    var streak = State.get('player.streak') || 0;

    var dateEl = document.getElementById('daily-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

    var sb = document.getElementById('daily-streak');
    if (sb) { var sc = sb.querySelector('.streak-count'); if (sc) sc.textContent = streak; }

    var playBtn = document.getElementById('btn-daily-play');
    var doneDiv = document.getElementById('daily-completed');

    if (last === today) {
      if (playBtn) playBtn.style.display = 'none';
      if (doneDiv) {
        doneDiv.style.display = '';
        var scoreEl = document.getElementById('daily-score');
        if (scoreEl) scoreEl.textContent = State.get('daily.lastScore') || 0;
        var starsC = document.getElementById('daily-stars');
        if (starsC) Components.createStarElements(State.get('daily.lastStars') || 0, starsC, false);
      }
    } else {
      if (playBtn) playBtn.style.display = '';
      if (doneDiv) doneDiv.style.display = 'none';
    }
  }

  return { generateDaily:generateDaily, playDaily:playDaily, completedDaily:completedDaily, updateStreak:updateStreak, renderDailyScreen:renderDailyScreen };
})();
