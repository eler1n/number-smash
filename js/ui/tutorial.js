/* ============================================
   Number Smash - Tutorial
   ============================================ */
var Tutorial = (function () {
  var steps = [
    { title: 'Welcome to Number Smash!', text: 'Flick number blobs into each other to hit the target sum!' },
    { title: 'Swipe to Flick!', text: 'Drag your finger across a blob to launch it. The faster you swipe, the harder it flies!' },
    { title: 'Numbers Add Up!', text: 'When two blobs collide fast enough, they MERGE and their numbers add together!' },
    { title: 'Hit the Target!', text: 'Make a blob that equals the target number at the top. BOOM \u2014 points!' },
    { title: 'Watch Out!', text: 'If you go OVER the target, the blob SPLITS apart! Try to be precise.' },
    { title: 'Get Combos!', text: 'Hit targets in a row without missing for massive combo multipliers! Ready? GO!' },
  ];
  var current = 0, overlay = null;

  function shouldShow() { return State.get('player.firstVisit') === true; }

  function start() { current = 0; showStep(); }

  function showStep() {
    if (current >= steps.length) { finish(); return; }
    removeOverlay();
    var s = steps[current];
    overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.zIndex = '500';

    var card = document.createElement('div');
    card.className = 'gameover-card'; // reuse card styles
    card.style.maxWidth = '340px';

    var t = document.createElement('h3');
    t.textContent = s.title;
    t.style.marginBottom = '10px';

    var p = document.createElement('p');
    p.textContent = s.text;
    p.style.cssText = 'color:#8888AA;margin-bottom:16px;line-height:1.5';

    var btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:8px;justify-content:center';

    var next = document.createElement('button');
    next.className = 'btn btn-primary';
    next.textContent = current < steps.length - 1 ? 'Next' : "Let's SMASH!";
    next.addEventListener('click', function () { Sounds.play('click'); current++; showStep(); });

    var skip = document.createElement('button');
    skip.className = 'btn btn-ghost btn-small';
    skip.textContent = 'Skip';
    skip.addEventListener('click', function () { Sounds.play('click'); finish(); });

    btns.appendChild(next);
    if (current < steps.length - 1) btns.appendChild(skip);

    var counter = document.createElement('div');
    counter.style.cssText = 'color:rgba(255,255,255,.3);font-size:12px;margin-top:10px';
    counter.textContent = (current + 1) + '/' + steps.length;

    card.appendChild(t);
    card.appendChild(p);
    card.appendChild(btns);
    card.appendChild(counter);
    overlay.appendChild(card);
    document.getElementById('app').appendChild(overlay);
  }

  function removeOverlay() { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); overlay = null; }
  function finish() { removeOverlay(); State.set('player.firstVisit', false); }

  return { shouldShow:shouldShow, start:start, finish:finish };
})();
