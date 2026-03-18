/* ============================================
   Number Smash - Blob Type Definitions
   ============================================ */
var GameObjects = (function () {
  // Rainbow colors for number values 1-9
  var COLORS = [
    null,           // 0 (unused)
    '#FF3E6C',      // 1 hot pink
    '#FF6B35',      // 2 orange
    '#FFE66D',      // 3 yellow
    '#51CF66',      // 4 green
    '#4ECDC4',      // 5 teal
    '#4A9EFF',      // 6 blue
    '#9B6DFF',      // 7 purple
    '#FF69B4',      // 8 pink
    '#FF4444',      // 9 red
  ];

  // For values > 9, cycle through brighter versions
  function getColor(val) {
    if (val <= 0) return '#888888';
    if (val <= 9) return COLORS[val];
    // Higher values get white-mixed colors
    var base = COLORS[((val - 1) % 9) + 1];
    return base;
  }

  function getRadius(val) {
    return 20 + Math.min(val, 20) * 2.5;
  }

  function getEmoji(val) {
    var emojis = [null, '\uD83D\uDE00', '\uD83D\uDE06', '\uD83D\uDE0E', '\uD83E\uDD29', '\uD83D\uDE0D',
                  '\uD83E\uDD73', '\uD83D\uDE08', '\uD83E\uDD2F', '\uD83D\uDC7E'];
    if (val <= 9) return emojis[val];
    return '\uD83D\uDCAF';
  }

  // Blob types
  var types = {
    normal: {
      id: 'normal', name: 'Normal', category: 'free',
      merge: function (a, b) { return a + b; },
      mergeLabel: '+',
    },
    negative: {
      id: 'negative', name: 'Subtract', category: 'premium', entitlement: 'forcespack',
      merge: function (a, b) { return Math.abs(a - b); },
      mergeLabel: '-',
      tint: 'rgba(255,0,0,0.3)',
    },
    multiply: {
      id: 'multiply', name: 'Multiply', category: 'premium', entitlement: 'transportpack',
      merge: function (a, b) { return a * b; },
      mergeLabel: '\u00D7',
      tint: 'rgba(255,215,0,0.3)',
    },
  };

  function isTypeUnlocked(typeId) {
    var t = types[typeId];
    if (!t) return false;
    if (t.category === 'free') return true;
    return State.hasEntitlement(t.entitlement);
  }

  return { COLORS:COLORS, getColor:getColor, getRadius:getRadius, getEmoji:getEmoji, types:types, isTypeUnlocked:isTypeUnlocked };
})();
