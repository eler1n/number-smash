/* ============================================
   Number Smash - Shop UI
   ============================================ */
var Shop = (function () {
  function render() {
    var coins = document.getElementById('shop-coins');
    if (coins) coins.textContent = '\uD83E\uDE99 ' + (State.get('player.coins') || 0);
    RevenueCatStore.getOfferings().then(renderPackages);
  }

  function renderPackages(offerings) {
    var c = document.getElementById('shop-packs');
    if (!c) return;
    c.textContent = '';
    if (!offerings || !offerings.current) return;

    var pkgs = offerings.current.availablePackages || [];
    var packs = pkgs.filter(function (p) { return p.identifier.indexOf('premium') === -1; });

    if (packs.length) {
      var title = document.createElement('h3');
      title.textContent = 'Add-ons';
      c.appendChild(title);

      packs.forEach(function (pkg) {
        var product = pkg.product;
        var item = document.createElement('div');
        item.className = 'shop-item';

        var icon = document.createElement('div');
        icon.className = 'item-icon';
        icon.textContent = '\uD83C\uDFB2';

        var info = document.createElement('div');
        info.className = 'item-info';
        var name = document.createElement('div');
        name.className = 'item-name';
        name.textContent = product.title;
        var desc = document.createElement('div');
        desc.className = 'item-desc';
        desc.textContent = product.description;
        info.appendChild(name);
        info.appendChild(desc);

        var price = document.createElement('div');
        price.className = 'item-price';
        var btn = document.createElement('button');
        btn.className = 'btn btn-primary btn-small';
        btn.textContent = product.priceString || 'Buy';
        btn.addEventListener('click', function () { purchaseItem(pkg); });
        price.appendChild(btn);

        item.appendChild(icon);
        item.appendChild(info);
        item.appendChild(price);
        c.appendChild(item);
      });
    }
  }

  function purchasePremium() {
    if (State.isPremium()) { Components.showToast("You're already premium!", 'info'); return; }
    showParentalGate(function () {
      RevenueCatStore.getOfferings().then(function (o) {
        if (!o || !o.current) { Components.showToast('Store unavailable.', 'error'); return; }
        var pkg = o.current.availablePackages.find(function (p) { return p.identifier === 'premium_monthly'; });
        if (pkg) RevenueCatStore.purchasePackage(pkg).then(render).catch(function () {});
      });
    });
  }

  function purchaseItem(pkg) {
    showParentalGate(function () {
      RevenueCatStore.purchasePackage(pkg).then(render).catch(function () {});
    });
  }

  function showParentalGate(onSuccess) {
    var a = 10 + Math.floor(Math.random() * 20);
    var b = 10 + Math.floor(Math.random() * 20);
    var answer = a + b;

    var ov = document.createElement('div');
    ov.className = 'overlay';

    var card = document.createElement('div');
    card.className = 'gameover-card';
    card.style.maxWidth = '340px';

    var t = document.createElement('h3');
    t.textContent = '\uD83D\uDD12 Ask a Parent';

    var d = document.createElement('p');
    d.textContent = 'Please ask a parent to solve this:';
    d.style.cssText = 'color:#8888AA;margin:8px 0';

    var q = document.createElement('p');
    q.style.cssText = 'font-size:30px;font-weight:700;margin:12px 0';
    q.textContent = a + ' + ' + b + ' = ?';

    var input = document.createElement('input');
    input.type = 'number';
    input.placeholder = 'Answer';
    input.style.cssText = 'width:110px;padding:10px;font-size:20px;text-align:center;border:2px solid #4ECDC4;border-radius:12px;background:#1A1A3E;color:white;font-family:Fredoka';

    var btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:14px';

    var ok = document.createElement('button');
    ok.className = 'btn btn-primary';
    ok.textContent = 'Confirm';
    ok.addEventListener('click', function () {
      if (parseInt(input.value, 10) === answer) { ov.parentNode.removeChild(ov); onSuccess(); }
      else { input.value = ''; input.style.borderColor = '#FF4444'; Sounds.play('overshoot'); }
    });

    var cancel = document.createElement('button');
    cancel.className = 'btn btn-ghost';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', function () { ov.parentNode.removeChild(ov); });

    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(t);
    card.appendChild(d);
    card.appendChild(q);
    card.appendChild(input);
    card.appendChild(btns);
    ov.appendChild(card);
    document.getElementById('app').appendChild(ov);
    input.focus();
  }

  return { render:render, purchasePremium:purchasePremium };
})();
