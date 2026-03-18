/* ============================================
   Number Smash - Screen Management
   ============================================ */
var Screens = (function () {
  function renderWorldSelect() {
    var c = document.getElementById('worlds-container');
    if (!c) return;
    c.textContent = '';

    Levels.getWorlds().forEach(function (w) {
      var unlocked = State.isWorldUnlocked(w.num);
      var section = document.createElement('div');
      section.className = 'world-section' + (unlocked ? '' : ' world-locked');

      var title = document.createElement('div');
      title.className = 'world-title';
      var icon = document.createElement('span');
      icon.className = 'world-icon';
      icon.textContent = w.icon;
      title.appendChild(icon);
      title.appendChild(document.createTextNode(' ' + w.name));
      if (!unlocked) {
        var lock = document.createElement('span');
        lock.style.cssText = 'font-size:13px;color:#8888AA;margin-left:8px';
        lock.textContent = '(' + w.starsToUnlock + '\u2B50 to unlock)';
        title.appendChild(lock);
      }
      section.appendChild(title);

      var grid = document.createElement('div');
      grid.className = 'level-grid';

      Levels.getWorldZones(w.num).forEach(function (zone) {
        var accessible = Levels.isZoneAccessible(zone.id);
        var stars = State.getZoneStars(zone.id);
        var completed = State.isZoneCompleted(zone.id);

        var card = document.createElement('div');
        card.className = 'level-card';
        if (completed) card.classList.add('completed');
        if (!accessible) card.classList.add('locked');
        if (zone.isPremium && !State.isPremium()) card.classList.add('premium-locked');

        if (accessible) {
          card.addEventListener('click', function () {
            Sounds.play('click');
            App.navigate('game/' + zone.id);
          });
        }

        var num = document.createElement('div');
        num.className = 'level-number';
        num.textContent = zone.num;
        card.appendChild(num);

        if (!accessible) {
          var lock = document.createElement('div');
          lock.className = 'lock-badge';
          lock.textContent = '\uD83D\uDD12';
          lock.style.cssText = 'position:absolute;font-size:22px';
          card.appendChild(lock);
        } else {
          var st = document.createElement('div');
          st.className = 'level-stars';
          st.textContent = Components.renderStars(stars);
          card.appendChild(st);
        }

        grid.appendChild(card);
      });
      section.appendChild(grid);
      c.appendChild(section);
    });

    var starsDisplay = document.getElementById('worlds-stars');
    if (starsDisplay) starsDisplay.textContent = '\u2B50 ' + (State.get('player.totalStars') || 0);
  }

  function updateMenuStats() {
    var hs = document.getElementById('menu-highscore');
    var mc = document.getElementById('menu-maxcombo');
    var st = document.getElementById('menu-stars');
    if (hs) hs.textContent = State.get('player.highScore') || 0;
    if (mc) mc.textContent = State.get('player.maxCombo') || 0;
    if (st) st.textContent = State.get('player.totalStars') || 0;

    var streak = State.get('player.streak') || 0;
    var badge = document.getElementById('menu-streak');
    if (badge) {
      if (streak > 0) { badge.style.display = ''; badge.querySelector('.streak-count').textContent = streak; }
      else badge.style.display = 'none';
    }
  }

  function renderCollection() {
    var c = document.getElementById('collection-container');
    if (!c) return;
    c.textContent = '';

    var coins = document.getElementById('collection-coins');
    if (coins) coins.textContent = '\uD83E\uDE99 ' + (State.get('player.coins') || 0);

    var skins = [
      { id: 'default', name: 'Classic', preview: '\u26BD', price: 0 },
      { id: 'emoji', name: 'Emoji Faces', preview: '\uD83D\uDE0E', price: 50 },
      { id: 'galaxy', name: 'Galaxy', preview: '\uD83C\uDF0C', price: 80 },
      { id: 'candy', name: 'Candy', preview: '\uD83C\uDF6C', price: 80 },
      { id: 'monster', name: 'Monsters', preview: '\uD83D\uDC7E', price: 100 },
      { id: 'neon', name: 'Neon', preview: '\uD83D\uDCA0', price: 120 },
    ];

    var section = document.createElement('div');
    section.className = 'collection-section';
    var title = document.createElement('h3');
    title.textContent = 'Blob Skins';
    section.appendChild(title);

    var grid = document.createElement('div');
    grid.className = 'skin-grid';

    var owned = State.get('inventory.blobSkins') || ['default'];
    var active = State.get('inventory.activeBlob') || 'default';

    skins.forEach(function (skin) {
      var isOwned = owned.indexOf(skin.id) !== -1;
      var isActive = active === skin.id;
      var card = document.createElement('div');
      card.className = 'skin-card' + (isActive ? ' active' : '') + (!isOwned ? ' locked' : '');

      var preview = document.createElement('div');
      preview.className = 'skin-preview';
      preview.textContent = skin.preview;
      card.appendChild(preview);

      var name = document.createElement('div');
      name.className = 'skin-name';
      name.textContent = skin.name;
      card.appendChild(name);

      if (!isOwned) {
        var price = document.createElement('div');
        price.className = 'skin-price';
        price.textContent = '\uD83E\uDE99 ' + skin.price;
        card.appendChild(price);
      }

      card.addEventListener('click', function () {
        if (isOwned) {
          State.set('inventory.activeBlob', skin.id);
          Sounds.play('click');
          renderCollection();
        } else {
          var playerCoins = State.get('player.coins') || 0;
          if (playerCoins >= skin.price) {
            State.set('player.coins', playerCoins - skin.price);
            owned.push(skin.id);
            State.set('inventory.blobSkins', owned);
            State.set('inventory.activeBlob', skin.id);
            Sounds.play('unlock');
            Components.showToast('Unlocked ' + skin.name + '!', 'success');
            renderCollection();
          } else {
            Components.showToast('Need ' + (skin.price - playerCoins) + ' more coins!', 'error');
          }
        }
      });

      grid.appendChild(card);
    });

    section.appendChild(grid);
    c.appendChild(section);
  }

  return { renderWorldSelect:renderWorldSelect, updateMenuStats:updateMenuStats, renderCollection:renderCollection };
})();
