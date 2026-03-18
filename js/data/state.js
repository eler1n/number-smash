/* ============================================
   Number Smash - State Manager
   ============================================ */
var State = (function () {
  var KEY = 'number_smash_state';
  var listeners = {};
  var defaultState = {
    player: { id: null, name: 'Player', coins: 0, totalStars: 0, streak: 0,
              lastPlayDate: null, firstVisit: true,
              highScore: 0, totalMerges: 0, perfectRounds: 0, maxCombo: 0 },
    progress: { completedZones: {}, unlockedWorlds: [1] },
    inventory: { blobSkins: ['default'], arenaThemes: ['default'],
                 activeBlob: 'default', activeArena: 'default' },
    settings: { soundEnabled: true },
    entitlements: { premium: false, forcespack: false, transportpack: false, lastChecked: null },
    daily: { lastCompleted: null, lastScore: 0, lastStars: 0 },
    achievements: {},
    roundHistory: [] // last 10 merge results for emoji share
  };
  var state = {};

  function id() { return 'ns_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function merge(t, s) {
    var r = clone(t);
    for (var k in s) {
      if (s.hasOwnProperty(k)) {
        if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k]) && t[k] && typeof t[k] === 'object' && !Array.isArray(t[k]))
          r[k] = merge(t[k], s[k]);
        else r[k] = clone(s[k]);
      }
    }
    return r;
  }

  function get(path) {
    var p = path.split('.'), c = state;
    for (var i = 0; i < p.length; i++) { if (c == null) return undefined; c = c[p[i]]; }
    return c;
  }
  function set(path, value) {
    var p = path.split('.'), c = state;
    for (var i = 0; i < p.length - 1; i++) { if (!c[p[i]] || typeof c[p[i]] !== 'object') c[p[i]] = {}; c = c[p[i]]; }
    c[p[p.length - 1]] = value;
    save(); notify(path, value);
  }
  function notify(path, value) {
    for (var k in listeners) {
      if (path.indexOf(k) === 0 || k.indexOf(path) === 0) {
        listeners[k].forEach(function (fn) { try { fn(value, path); } catch (e) {} });
      }
    }
  }
  function subscribe(path, cb) {
    if (!listeners[path]) listeners[path] = [];
    listeners[path].push(cb);
    return function () { listeners[path] = listeners[path].filter(function (f) { return f !== cb; }); };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function load() {
    try { var s = localStorage.getItem(KEY); state = s ? merge(defaultState, JSON.parse(s)) : clone(defaultState); }
    catch (e) { state = clone(defaultState); }
    if (!state.player.id) { state.player.id = id(); save(); }
  }
  function reset() { state = clone(defaultState); state.player.id = id(); save(); }
  function addCoins(n) { set('player.coins', get('player.coins') + n); }
  function addStars(zoneId, stars) {
    var cur = get('progress.completedZones.' + zoneId);
    var prev = cur ? cur.stars : 0;
    if (stars > prev) {
      set('progress.completedZones.' + zoneId, { stars: stars, time: Date.now() });
      set('player.totalStars', get('player.totalStars') + (stars - prev));
    }
  }
  function isZoneCompleted(zoneId) { return !!get('progress.completedZones.' + zoneId); }
  function getZoneStars(zoneId) { var d = get('progress.completedZones.' + zoneId); return d ? d.stars : 0; }
  function isWorldUnlocked(w) { var ws = get('progress.unlockedWorlds'); return ws && ws.indexOf(w) !== -1; }
  function unlockWorld(w) { var ws = get('progress.unlockedWorlds') || [1]; if (ws.indexOf(w) === -1) { ws.push(w); set('progress.unlockedWorlds', ws); } }
  function isPremium() { return get('entitlements.premium') === true; }
  function hasEntitlement(i) { return get('entitlements.' + i) === true || isPremium(); }

  return { get:get, set:set, subscribe:subscribe, save:save, load:load, reset:reset,
    addCoins:addCoins, addStars:addStars, isZoneCompleted:isZoneCompleted, getZoneStars:getZoneStars,
    isWorldUnlocked:isWorldUnlocked, unlockWorld:unlockWorld, isPremium:isPremium, hasEntitlement:hasEntitlement };
})();
