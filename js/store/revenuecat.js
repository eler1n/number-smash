/* ============================================
   Number Smash - RevenueCat Integration
   ============================================ */
var RevenueCatStore = (function () {
  var API_KEY = 'test_qvrFUREfFNwTfJGaJplRBwRCxle';
  var purchases = null, offerings = null, isInitialized = false;

  function init() {
    if (typeof window.Purchases === 'undefined') {
      console.warn('RevenueCat SDK not loaded.');
      return Promise.resolve();
    }
    try {
      var RC = window.Purchases.Purchases;
      purchases = RC.configure(API_KEY, State.get('player.id') || 'anon_' + Date.now());
      isInitialized = true;
      return syncEntitlements();
    } catch (e) { console.error('RC init failed:', e); return Promise.resolve(); }
  }

  function syncEntitlements() {
    if (!isInitialized || !purchases) return Promise.resolve();
    return purchases.getCustomerInfo().then(function (info) {
      var a = info.entitlements.active || {};
      State.set('entitlements.premium', 'premium' in a);
      State.set('entitlements.forcespack', 'forces_pack' in a || 'premium' in a);
      State.set('entitlements.transportpack', 'transport_pack' in a || 'premium' in a);
      State.set('entitlements.lastChecked', new Date().toISOString());
    }).catch(function () {});
  }

  function getOfferings() {
    if (!isInitialized) return Promise.resolve(mockOfferings());
    if (offerings) return Promise.resolve(offerings);
    return purchases.getOfferings().then(function (r) { offerings = r; return r; }).catch(function () { return mockOfferings(); });
  }

  function purchasePackage(pkg) {
    if (!isInitialized) { Components.showToast('Configure RevenueCat API key first.', 'error'); return Promise.reject(); }
    return purchases.purchase({ rcPackage: pkg }).then(function (r) {
      syncEntitlements(); Sounds.play('unlock'); Components.showToast('Purchase successful!', 'success'); return r;
    }).catch(function (e) { if (!e.userCancelled) Components.showToast('Purchase failed.', 'error'); throw e; });
  }

  function restorePurchases() {
    if (!isInitialized) return Promise.reject();
    return syncEntitlements().then(function () { Components.showToast('Restored!', 'success'); });
  }

  function mockOfferings() {
    return { current: { identifier: 'default', availablePackages: [
      { identifier:'premium_monthly', packageType:'MONTHLY', product:{ identifier:'premium_monthly', title:'Premium Monthly', description:'All worlds, all blob types, all skins', priceString:'$3.99/mo' }},
      { identifier:'premium_yearly', packageType:'ANNUAL', product:{ identifier:'premium_yearly', title:'Premium Yearly', description:'Best value! Everything unlocked.', priceString:'$29.99/yr' }},
      { identifier:'forces_pack', packageType:'LIFETIME', product:{ identifier:'forces_pack', title:'Wild Cards Pack', description:'Subtract & Multiply blob types', priceString:'$1.99' }},
    ]}};
  }

  return { init:init, syncEntitlements:syncEntitlements, getOfferings:getOfferings, purchasePackage:purchasePackage, restorePurchases:restorePurchases, isReady:function(){return isInitialized;} };
})();
