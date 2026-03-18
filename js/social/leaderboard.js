/* ============================================
   Number Smash - Local Leaderboard
   ============================================ */
var Leaderboard = (function () {
  function getStats() {
    return {
      highScore: State.get('player.highScore') || 0,
      maxCombo: State.get('player.maxCombo') || 0,
      totalMerges: State.get('player.totalMerges') || 0,
      totalStars: State.get('player.totalStars') || 0,
      streak: State.get('player.streak') || 0,
      perfectRounds: State.get('player.perfectRounds') || 0,
    };
  }
  return { getStats:getStats };
})();
