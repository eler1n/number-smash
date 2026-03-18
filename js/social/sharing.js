/* ============================================
   Number Smash - Sharing & Virality
   Emoji score cards like Wordle
   ============================================ */
var Sharing = (function () {

  function generateEmojiGrid(mergeHistory) {
    // mergeHistory = array of { correct: bool, overshoot: bool }
    if (!mergeHistory || !mergeHistory.length) return '';
    return mergeHistory.map(function (m) {
      if (m.correct) return '\uD83D\uDFE9';     // green
      if (m.overshoot) return '\uD83D\uDFE5';    // red
      return '\uD83D\uDFE8';                      // yellow (under target merge)
    }).join('');
  }

  function shareScore() {
    var score = Game.getLastScore();
    var combo = Game.getLastMaxCombo();
    var merges = Game.getMergeHistory();
    var grid = generateEmojiGrid(merges);

    var text = 'Number Smash \uD83D\uDCA5\n';
    text += 'Score: ' + score + ' | Combo: ' + combo + 'x\n';
    if (grid) text += grid + '\n';
    text += 'Can you beat me?';

    State.set('achievements.shared', true);
    doShare(text);
    Achievements.checkAll();
  }

  function shareDaily() {
    var score = State.get('daily.lastScore') || 0;
    var streak = State.get('player.streak') || 0;
    var text = 'Number Smash Daily \uD83D\uDCA5\n';
    text += 'Score: ' + score;
    if (streak > 1) text += ' | \uD83D\uDD25 ' + streak + '-day streak';
    text += '\nCan you beat me?';

    State.set('achievements.shared', true);
    doShare(text);
    Achievements.checkAll();
  }

  function doShare(text) {
    var url = window.location.origin + window.location.pathname;
    Sounds.play('click');

    if (navigator.share) {
      navigator.share({ title: 'Number Smash', text: text, url: url })
        .then(function () { Components.showToast('Shared!', 'success'); })
        .catch(function (e) { if (e.name !== 'AbortError') fallback(text + '\n' + url); });
    } else {
      fallback(text + '\n' + url);
    }
  }

  function fallback(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(function () { Components.showToast('Copied to clipboard!', 'success'); })
        .catch(function () { Components.showToast('Score: ready to paste!', 'info'); });
    } else {
      Components.showToast('Share your score with friends!', 'info');
    }
  }

  return { shareScore:shareScore, shareDaily:shareDaily, generateEmojiGrid:generateEmojiGrid };
})();
