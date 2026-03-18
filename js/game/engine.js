/* ============================================
   Number Smash - Physics Engine
   Arena with number blobs, merge/split on collision
   ============================================ */
var Engine = (function () {
  var M = Matter;
  var MEngine = M.Engine;
  var World = M.World;
  var Bodies = M.Bodies;
  var Body = M.Body;
  var Events = M.Events;
  var Composite = M.Composite;
  var Vector = M.Vector;

  var engine = null;
  var world = null;
  var blobs = [];
  var walls = [];
  var arenaW = 0, arenaH = 0;
  var target = 10;
  var animFrame = null;
  var running = false;

  // Callbacks
  var onMerge = null;     // (resultValue, x, y, isCorrect, isOvershoot)
  var onBlobUpdate = null; // called each frame

  // Merge cooldown to prevent chain-merge in same frame
  var mergeCooldown = new Set();

  function init(w, h, callbacks) {
    arenaW = w;
    arenaH = h;
    onMerge = callbacks.onMerge || null;
    onBlobUpdate = callbacks.onBlobUpdate || null;

    engine = MEngine.create({ gravity: { x: 0, y: 0.4, scale: 0.001 } });
    world = engine.world;

    // Walls
    var t = 40;
    walls = [
      Bodies.rectangle(w / 2, -t / 2, w + t * 2, t, { isStatic: true, restitution: 0.9, label: 'wall' }),
      Bodies.rectangle(w / 2, h + t / 2, w + t * 2, t, { isStatic: true, restitution: 0.9, label: 'wall' }),
      Bodies.rectangle(-t / 2, h / 2, t, h + t * 2, { isStatic: true, restitution: 0.9, label: 'wall' }),
      Bodies.rectangle(w + t / 2, h / 2, t, h + t * 2, { isStatic: true, restitution: 0.9, label: 'wall' }),
    ];
    Composite.add(world, walls);

    Events.on(engine, 'collisionStart', handleCollision);
  }

  function clear() {
    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = null;
    running = false;
    blobs = [];
    mergeCooldown.clear();
    if (world) Composite.clear(world, false);
    if (engine) Events.off(engine, 'collisionStart', handleCollision);
    engine = null; world = null;
  }

  function setTarget(t) { target = t; }
  function getTarget() { return target; }

  function spawnBlob(value, x, y, blobType) {
    var r = GameObjects.getRadius(value);
    var body = Bodies.circle(x, y, r, {
      restitution: 0.85,
      friction: 0.05,
      frictionAir: 0.008,
      density: 0.001 * (1 + value * 0.15),
      label: 'blob',
    });
    body.numberValue = value;
    body.blobType = blobType || 'normal';
    body.spawnTime = Date.now();
    body.merging = false;

    Composite.add(world, body);
    blobs.push(body);
    return body;
  }

  function removeBlob(body) {
    var idx = blobs.indexOf(body);
    if (idx !== -1) blobs.splice(idx, 1);
    Composite.remove(world, body);
  }

  function flickBlob(body, force) {
    Body.applyForce(body, body.position, force);
  }

  function handleCollision(event) {
    var pairs = event.pairs;
    for (var i = 0; i < pairs.length; i++) {
      var a = pairs[i].bodyA;
      var b = pairs[i].bodyB;

      // Only merge blob+blob
      if (a.label !== 'blob' || b.label !== 'blob') continue;
      if (a.merging || b.merging) continue;

      // Need minimum relative speed to merge (prevents passive merges)
      var relSpeed = Vector.magnitude(Vector.sub(a.velocity, b.velocity));
      if (relSpeed < 1.5) continue;

      // Cooldown check
      var key = Math.min(a.id, b.id) + '_' + Math.max(a.id, b.id);
      if (mergeCooldown.has(key)) continue;
      mergeCooldown.add(key);
      setTimeout(function (k) { mergeCooldown.delete(k); }, 200, key);

      doMerge(a, b);
    }
  }

  function doMerge(a, b) {
    var typeA = GameObjects.types[a.blobType] || GameObjects.types.normal;
    var typeB = GameObjects.types[b.blobType] || GameObjects.types.normal;

    // Use the type of whichever blob is "special", default to normal add
    var mergeType = typeA;
    if (typeB.id !== 'normal') mergeType = typeB;

    var result = mergeType.merge(a.numberValue, b.numberValue);
    var midX = (a.position.x + b.position.x) / 2;
    var midY = (a.position.y + b.position.y) / 2;

    a.merging = true;
    b.merging = true;

    // Remove both
    removeBlob(a);
    removeBlob(b);

    if (result === target) {
      // CORRECT! Target hit
      if (onMerge) onMerge(result, midX, midY, true, false);
    } else if (result > target) {
      // OVERSHOOT! Split into random pieces
      if (onMerge) onMerge(result, midX, midY, false, true);
      splitBlob(result, midX, midY);
    } else {
      // Under target — create merged blob
      var merged = spawnBlob(result, midX, midY, mergeType.id === 'normal' ? a.blobType : mergeType.id);
      // Give it a little pop
      Body.setVelocity(merged, {
        x: (Math.random() - 0.5) * 3,
        y: -2 - Math.random() * 2,
      });
      if (onMerge) onMerge(result, midX, midY, false, false);
    }
  }

  function splitBlob(value, x, y) {
    // Split into 2-3 random pieces that add up to something less than value
    var numPieces = 2 + Math.floor(Math.random() * 2);
    var remaining = Math.max(Math.floor(value * 0.7), numPieces); // lose some value as penalty
    var pieces = [];

    for (var i = 0; i < numPieces - 1; i++) {
      var max = remaining - (numPieces - i - 1);
      var val = 1 + Math.floor(Math.random() * Math.min(max - 1, 8));
      pieces.push(val);
      remaining -= val;
    }
    pieces.push(Math.min(remaining, 9));

    // Spawn with explosive force
    pieces.forEach(function (val, idx) {
      var angle = (Math.PI * 2 / numPieces) * idx + Math.random() * 0.5;
      var blob = spawnBlob(val, x + Math.cos(angle) * 30, y + Math.sin(angle) * 30);
      Body.setVelocity(blob, {
        x: Math.cos(angle) * (4 + Math.random() * 3),
        y: Math.sin(angle) * (4 + Math.random() * 3) - 2,
      });
    });
  }

  function start() {
    running = true;
    var last = performance.now();
    function step(time) {
      if (!running) return;
      var delta = Math.min(time - last, 33);
      last = time;
      MEngine.update(engine, delta);

      // Keep blobs in bounds (just clamp velocity if going crazy)
      blobs.forEach(function (b) {
        if (b.position.x < 0 || b.position.x > arenaW || b.position.y > arenaH + 50) {
          Body.setPosition(b, {
            x: Math.max(20, Math.min(arenaW - 20, b.position.x)),
            y: Math.max(20, Math.min(arenaH - 20, b.position.y)),
          });
          Body.setVelocity(b, { x: b.velocity.x * 0.5, y: -Math.abs(b.velocity.y) * 0.3 });
        }
      });

      if (onBlobUpdate) onBlobUpdate();
      animFrame = requestAnimationFrame(step);
    }
    animFrame = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = null;
  }

  function getBlobs() { return blobs; }
  function getArenaSize() { return { w: arenaW, h: arenaH }; }
  function isRunning() { return running; }

  function getBlobAt(x, y) {
    for (var i = blobs.length - 1; i >= 0; i--) {
      var b = blobs[i];
      var r = GameObjects.getRadius(b.numberValue);
      var dx = x - b.position.x, dy = y - b.position.y;
      if (dx * dx + dy * dy < (r + 10) * (r + 10)) return b;
    }
    return null;
  }

  return {
    init:init, clear:clear, setTarget:setTarget, getTarget:getTarget,
    spawnBlob:spawnBlob, removeBlob:removeBlob, flickBlob:flickBlob,
    start:start, stop:stop, getBlobs:getBlobs, getArenaSize:getArenaSize,
    isRunning:isRunning, getBlobAt:getBlobAt,
  };
})();
