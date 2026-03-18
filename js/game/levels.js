/* ============================================
   Number Smash - Worlds & Zone Definitions
   ============================================ */
var Levels = (function () {
  var worlds = [
    { num: 1, name: 'Baby Numbers', icon: '\uD83D\uDC76', color: '#51CF66', starsToUnlock: 0 },
    { num: 2, name: 'Getting Bigger', icon: '\uD83D\uDCAA', color: '#4A9EFF', starsToUnlock: 8 },
    { num: 3, name: 'Speed Demon', icon: '\u26A1', color: '#FFE66D', starsToUnlock: 22 },
    { num: 4, name: 'Wild Cards', icon: '\uD83C\uDFB2', color: '#FF6B35', starsToUnlock: 40 },
    { num: 5, name: 'Chaos Mode', icon: '\uD83C\uDF0B', color: '#FF3E6C', starsToUnlock: 55 },
  ];

  // Zone configs define difficulty parameters
  function Z(id, world, num, name, cfg) {
    return {
      id: id, world: world, num: num, name: name,
      targetMin: cfg.tMin || 5,
      targetMax: cfg.tMax || 10,
      numMin: cfg.nMin || 1,
      numMax: cfg.nMax || 5,
      blobCount: cfg.blobs || 6,
      timer: cfg.timer || 20,
      spawnInterval: cfg.spawn || 4000,
      blobTypes: cfg.types || ['normal'],
      isPremium: cfg.premium || false,
      // Star thresholds (score needed)
      star1: cfg.s1 || 50,
      star2: cfg.s2 || 150,
      star3: cfg.s3 || 300,
    };
  }

  var allZones = [
    // World 1: Baby Numbers — easy targets, small numbers, long timer
    Z('w1z1', 1, 1, 'First Smash',     { tMin:3,  tMax:5,  nMin:1, nMax:3,  blobs:4, timer:25, spawn:5000, s1:30,  s2:80,  s3:150 }),
    Z('w1z2', 1, 2, 'Easy Does It',    { tMin:4,  tMax:7,  nMin:1, nMax:4,  blobs:5, timer:25, spawn:5000, s1:50,  s2:120, s3:200 }),
    Z('w1z3', 1, 3, 'Five Alive',      { tMin:5,  tMax:8,  nMin:1, nMax:5,  blobs:5, timer:22, spawn:4500, s1:60,  s2:140, s3:250 }),
    Z('w1z4', 1, 4, 'Number Crunch',   { tMin:6,  tMax:10, nMin:1, nMax:5,  blobs:6, timer:22, spawn:4500, s1:80,  s2:180, s3:300 }),
    Z('w1z5', 1, 5, 'Double Digits',   { tMin:8,  tMax:12, nMin:1, nMax:6,  blobs:6, timer:20, spawn:4000, s1:100, s2:220, s3:400 }),
    Z('w1z6', 1, 6, 'Warm Up Done!',   { tMin:8,  tMax:14, nMin:1, nMax:7,  blobs:7, timer:20, spawn:4000, s1:120, s2:260, s3:450 }),

    // World 2: Getting Bigger — larger targets, more blobs
    Z('w2z1', 2, 1, 'Big Targets',     { tMin:10, tMax:15, nMin:1, nMax:7,  blobs:7, timer:20, spawn:3800, s1:100, s2:250, s3:450 }),
    Z('w2z2', 2, 2, 'Blob Storm',      { tMin:10, tMax:18, nMin:1, nMax:8,  blobs:8, timer:20, spawn:3500, s1:120, s2:280, s3:500 }),
    Z('w2z3', 2, 3, 'Math Machine',    { tMin:12, tMax:20, nMin:1, nMax:9,  blobs:8, timer:18, spawn:3500, s1:150, s2:320, s3:550 }),
    Z('w2z4', 2, 4, 'Quick Combos',    { tMin:10, tMax:16, nMin:2, nMax:8,  blobs:9, timer:18, spawn:3200, s1:160, s2:350, s3:600 }),
    Z('w2z5', 2, 5, 'Target Practice', { tMin:14, tMax:22, nMin:2, nMax:9,  blobs:9, timer:17, spawn:3200, s1:180, s2:380, s3:650 }),
    Z('w2z6', 2, 6, 'Stepping Up!',    { tMin:15, tMax:25, nMin:2, nMax:9,  blobs:10, timer:17, spawn:3000, s1:200, s2:420, s3:700 }),

    // World 3: Speed Demon — faster timer, more blobs, bigger targets
    Z('w3z1', 3, 1, 'Clock Ticking',   { tMin:12, tMax:20, nMin:1, nMax:9,  blobs:9,  timer:15, spawn:2800, s1:150, s2:350, s3:600 }),
    Z('w3z2', 3, 2, 'Rapid Fire',      { tMin:15, tMax:25, nMin:2, nMax:9,  blobs:10, timer:15, spawn:2500, s1:200, s2:400, s3:700 }),
    Z('w3z3', 3, 3, 'No Mercy',        { tMin:18, tMax:28, nMin:2, nMax:9,  blobs:10, timer:13, spawn:2500, s1:220, s2:450, s3:800 }),
    Z('w3z4', 3, 4, 'Blitz Mode',      { tMin:15, tMax:25, nMin:3, nMax:9,  blobs:11, timer:12, spawn:2200, s1:250, s2:500, s3:900 }),
    Z('w3z5', 3, 5, 'Overdrive',       { tMin:20, tMax:30, nMin:2, nMax:9,  blobs:12, timer:12, spawn:2000, s1:280, s2:550, s3:1000 }),
    Z('w3z6', 3, 6, 'Speed King',      { tMin:20, tMax:35, nMin:3, nMax:9,  blobs:12, timer:10, spawn:2000, s1:300, s2:600, s3:1100 }),

    // World 4: Wild Cards — negative + multiply blobs (premium)
    Z('w4z1', 4, 1, 'Subtract This',   { tMin:5,  tMax:10, nMin:1, nMax:9,  blobs:8,  timer:18, spawn:3000, types:['normal','negative'], premium:true, s1:150, s2:350, s3:650 }),
    Z('w4z2', 4, 2, 'Mind Bender',     { tMin:8,  tMax:15, nMin:1, nMax:9,  blobs:9,  timer:18, spawn:2800, types:['normal','negative'], premium:true, s1:180, s2:400, s3:750 }),
    Z('w4z3', 4, 3, 'Multiply Mayhem', { tMin:12, tMax:25, nMin:1, nMax:6,  blobs:7,  timer:18, spawn:3000, types:['normal','multiply'], premium:true, s1:200, s2:450, s3:800 }),
    Z('w4z4', 4, 4, 'Mixed Ops',       { tMin:10, tMax:20, nMin:1, nMax:9,  blobs:10, timer:16, spawn:2500, types:['normal','negative','multiply'], premium:true, s1:250, s2:500, s3:900 }),
    Z('w4z5', 4, 5, 'Brain Twister',   { tMin:15, tMax:30, nMin:2, nMax:9,  blobs:10, timer:15, spawn:2500, types:['normal','negative','multiply'], premium:true, s1:280, s2:550, s3:1000 }),
    Z('w4z6', 4, 6, 'Wild Card Master',{ tMin:18, tMax:35, nMin:2, nMax:9,  blobs:11, timer:14, spawn:2200, types:['normal','negative','multiply'], premium:true, s1:300, s2:600, s3:1100 }),

    // World 5: Chaos Mode — all mechanics, tiny timer, huge targets
    Z('w5z1', 5, 1, 'Total Chaos',     { tMin:20, tMax:40, nMin:2, nMax:9,  blobs:12, timer:12, spawn:2000, types:['normal','negative','multiply'], premium:true, s1:300, s2:600, s3:1100 }),
    Z('w5z2', 5, 2, 'Insanity',        { tMin:25, tMax:50, nMin:3, nMax:9,  blobs:13, timer:12, spawn:1800, types:['normal','negative','multiply'], premium:true, s1:350, s2:700, s3:1300 }),
    Z('w5z3', 5, 3, 'Madness',         { tMin:30, tMax:60, nMin:3, nMax:9,  blobs:14, timer:10, spawn:1800, types:['normal','negative','multiply'], premium:true, s1:400, s2:800, s3:1500 }),
    Z('w5z4', 5, 4, 'Impossible',      { tMin:20, tMax:40, nMin:1, nMax:9,  blobs:15, timer:10, spawn:1500, types:['normal','negative','multiply'], premium:true, s1:450, s2:900, s3:1700 }),
    Z('w5z5', 5, 5, 'Are You Kidding', { tMin:30, tMax:60, nMin:2, nMax:9,  blobs:15, timer:8,  spawn:1500, types:['normal','negative','multiply'], premium:true, s1:500, s2:1000, s3:2000 }),
    Z('w5z6', 5, 6, 'THE FINAL SMASH', { tMin:25, tMax:50, nMin:1, nMax:9,  blobs:16, timer:8,  spawn:1200, types:['normal','negative','multiply'], premium:true, s1:600, s2:1200, s3:2500 }),
  ];

  // Endless mode config: ramps difficulty over time
  var endlessConfig = {
    startTarget: 5,
    targetGrowth: 0.5, // increase per correct hit
    startTimer: 20,
    timerDecay: 0.3,   // decrease per correct hit (min 6)
    startBlobs: 6,
    blobGrowth: 0.3,
    numMin: 1, numMax: 9,
    spawnInterval: 3000,
    types: ['normal'],
  };

  function getAll() { return allZones; }
  function getZone(id) { for (var i = 0; i < allZones.length; i++) { if (allZones[i].id === id) return allZones[i]; } return null; }
  function getWorldZones(wn) { return allZones.filter(function (z) { return z.world === wn; }); }
  function getWorlds() { return worlds; }
  function getEndlessConfig() { return endlessConfig; }

  function getNextZone(id) {
    for (var i = 0; i < allZones.length; i++) { if (allZones[i].id === id && i + 1 < allZones.length) return allZones[i + 1]; }
    return null;
  }

  function isZoneAccessible(id) {
    var z = getZone(id);
    if (!z) return false;
    if (!State.isWorldUnlocked(z.world)) return false;
    if (z.isPremium && !State.isPremium()) return false;
    if (z.num === 1) return true;
    var prevId = 'w' + z.world + 'z' + (z.num - 1);
    return State.isZoneCompleted(prevId);
  }

  function checkWorldUnlocks() {
    var total = State.get('player.totalStars') || 0;
    worlds.forEach(function (w) {
      if (total >= w.starsToUnlock && !State.isWorldUnlocked(w.num)) {
        State.unlockWorld(w.num);
        if (w.num > 1) {
          Components.showToast(w.icon + ' World ' + w.num + ' Unlocked!', 'success');
          Sounds.play('unlock');
        }
      }
    });
  }

  return { getAll:getAll, getZone:getZone, getWorldZones:getWorldZones, getWorlds:getWorlds,
    getNextZone:getNextZone, isZoneAccessible:isZoneAccessible, checkWorldUnlocks:checkWorldUnlocks,
    getEndlessConfig:getEndlessConfig };
})();
