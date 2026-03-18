/* ============================================
   Number Smash - Scoring & Target Generation
   ============================================ */
var Solver = (function () {

  function generateTarget(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function generateBlobs(target, numMin, numMax, count, blobTypes) {
    var blobs = [];
    // Guarantee at least one solvable pair
    var a = numMin + Math.floor(Math.random() * (Math.min(target - numMin, numMax) - numMin + 1));
    var b = target - a;
    if (b >= numMin && b <= numMax) {
      blobs.push({ value: a, type: 'normal' });
      blobs.push({ value: b, type: 'normal' });
    } else {
      blobs.push({ value: Math.min(a, numMax), type: 'normal' });
      blobs.push({ value: Math.min(target - Math.min(a, numMax), numMax), type: 'normal' });
    }

    // Fill the rest randomly
    var types = blobTypes || ['normal'];
    while (blobs.length < count) {
      var val = numMin + Math.floor(Math.random() * (numMax - numMin + 1));
      var type = types[Math.floor(Math.random() * types.length)];
      // Special types only for some blobs (30% chance)
      if (type !== 'normal' && Math.random() > 0.3) type = 'normal';
      blobs.push({ value: val, type: type });
    }

    // Shuffle
    for (var i = blobs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = blobs[i]; blobs[i] = blobs[j]; blobs[j] = tmp;
    }

    return blobs;
  }

  function calculateScore(correctHits, incorrectHits, maxCombo, timeRemaining, basePoints) {
    var base = (basePoints || 100) * correctHits;
    var comboBonus = maxCombo * maxCombo * 10;
    var accuracyBonus = correctHits > 0 && incorrectHits === 0 ? 200 : 0;
    var timeBonus = Math.floor(timeRemaining * 5);
    return Math.max(0, base + comboBonus + accuracyBonus + timeBonus);
  }

  function calculateStars(score, zone) {
    if (score >= zone.star3) return 3;
    if (score >= zone.star2) return 2;
    if (score >= zone.star1) return 1;
    return 0;
  }

  function getScoreMessage(score) {
    if (score >= 2000) return ['LEGENDARY!', 'INSANE SCORE!', 'YOU ARE A GOD!'][Math.floor(Math.random() * 3)];
    if (score >= 1000) return ['INCREDIBLE!', 'AMAZING!', 'ON FIRE!'][Math.floor(Math.random() * 3)];
    if (score >= 500) return ['Great job!', 'Awesome!', 'Impressive!'][Math.floor(Math.random() * 3)];
    if (score >= 200) return ['Nice!', 'Good work!', 'Well played!'][Math.floor(Math.random() * 3)];
    if (score >= 50) return ['Not bad!', 'Keep practicing!', 'Getting there!'][Math.floor(Math.random() * 3)];
    return ['Try again!', 'You can do better!', 'Keep smashing!'][Math.floor(Math.random() * 3)];
  }

  function getComboMessage(combo) {
    if (combo >= 10) return 'GODLIKE!';
    if (combo >= 7) return 'UNSTOPPABLE!';
    if (combo >= 5) return 'ON FIRE!';
    if (combo >= 3) return 'COMBO!';
    return '';
  }

  return { generateTarget:generateTarget, generateBlobs:generateBlobs,
    calculateScore:calculateScore, calculateStars:calculateStars,
    getScoreMessage:getScoreMessage, getComboMessage:getComboMessage };
})();
