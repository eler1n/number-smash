/* ============================================
   Number Smash - Achievements
   ============================================ */
var Achievements = (function () {
  var defs = [
    { id: 'first_smash', name: 'First Smash!', icon: '\uD83D\uDCA5', desc: 'Make your first merge', check: function () { return State.get('player.totalMerges') >= 1; } },
    { id: 'merge_50', name: 'Smasher', icon: '\uD83D\uDD28', desc: '50 total merges', check: function () { return State.get('player.totalMerges') >= 50; } },
    { id: 'merge_500', name: 'Mega Smasher', icon: '\uD83E\uDDE8', desc: '500 total merges', check: function () { return State.get('player.totalMerges') >= 500; } },
    { id: 'combo_3', name: 'Combo!', icon: '\uD83D\uDD25', desc: '3x combo', check: function () { return State.get('player.maxCombo') >= 3; } },
    { id: 'combo_5', name: 'Combo King', icon: '\uD83D\uDC51', desc: '5x combo', check: function () { return State.get('player.maxCombo') >= 5; } },
    { id: 'combo_10', name: 'UNSTOPPABLE', icon: '\uD83C\uDF0B', desc: '10x combo', check: function () { return State.get('player.maxCombo') >= 10; } },
    { id: 'score_500', name: 'Getting Good', icon: '\uD83C\uDFAF', desc: 'Score 500 in one round', check: function () { return State.get('player.highScore') >= 500; } },
    { id: 'score_2000', name: 'Number Wizard', icon: '\uD83E\uDDD9', desc: 'Score 2000 in one round', check: function () { return State.get('player.highScore') >= 2000; } },
    { id: 'score_5000', name: 'Math Legend', icon: '\uD83C\uDF1F', desc: 'Score 5000 in one round', check: function () { return State.get('player.highScore') >= 5000; } },
    { id: 'perfect', name: 'Sharpshooter', icon: '\uD83C\uDFAF', desc: '100% accuracy in a round', check: function () { return State.get('player.perfectRounds') >= 1; } },
    { id: 'streak_3', name: 'On Fire', icon: '\uD83D\uDD25', desc: '3-day streak', check: function () { return State.get('player.streak') >= 3; } },
    { id: 'streak_7', name: 'Week Warrior', icon: '\uD83D\uDCAA', desc: '7-day streak', check: function () { return State.get('player.streak') >= 7; } },
    { id: 'world2', name: 'Explorer', icon: '\uD83C\uDF0D', desc: 'Unlock World 2', check: function () { return State.isWorldUnlocked(2); } },
    { id: 'world3', name: 'Adventurer', icon: '\uD83D\uDE80', desc: 'Unlock World 3', check: function () { return State.isWorldUnlocked(3); } },
    { id: 'sharer', name: 'Social Star', icon: '\uD83E\uDD8B', desc: 'Share a score', check: function () { return State.get('achievements.shared') === true; } },
  ];

  function checkAll() {
    var earned = State.get('achievements') || {};
    var newOnes = [];
    defs.forEach(function (a) {
      if (!earned[a.id] && a.check()) { earned[a.id] = Date.now(); newOnes.push(a); }
    });
    if (newOnes.length) {
      State.set('achievements', earned);
      newOnes.forEach(function (a) {
        Components.showToast(a.icon + ' ' + a.name + '!', 'success');
        Sounds.play('unlock');
        State.addCoins(15);
      });
    }
  }
  function getAll() {
    var earned = State.get('achievements') || {};
    return defs.map(function (a) { return { id: a.id, name: a.name, icon: a.icon, desc: a.desc, earned: !!earned[a.id] }; });
  }
  function render() {
    var c = document.getElementById('achievements-container');
    if (!c) return; c.textContent = '';
    getAll().forEach(function (a) {
      var card = document.createElement('div');
      card.className = 'achievement-card' + (a.earned ? ' earned' : ' locked');
      var icon = document.createElement('div'); icon.className = 'achievement-icon'; icon.textContent = a.icon;
      var name = document.createElement('div'); name.className = 'achievement-name'; name.textContent = a.name;
      var desc = document.createElement('div'); desc.className = 'achievement-desc'; desc.textContent = a.desc;
      card.appendChild(icon); card.appendChild(name); card.appendChild(desc); c.appendChild(card);
    });
  }
  return { checkAll:checkAll, getAll:getAll, render:render };
})();
