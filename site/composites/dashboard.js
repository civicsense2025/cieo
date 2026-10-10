(function () {
  'use strict';
  var KEY = 'cieo-dashboard-settings';
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-panel]'));
  var navs = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var store = document.querySelector('[data-setting="store"]');
  var notify = document.querySelector('[data-setting="notify"]');
  var threshold = document.querySelector('[data-setting="threshold"]');
  var readout = document.querySelector('[data-readout]');
  var save = document.querySelector('[data-save]');
  var saved = document.querySelector('[data-saved]');

  function show(name) {
    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-panel') !== name;
    });
    navs.forEach(function (nav) {
      if (nav.getAttribute('data-nav') === name) nav.setAttribute('aria-current', 'page');
      else nav.removeAttribute('aria-current');
    });
  }
  navs.forEach(function (nav) {
    nav.addEventListener('click', function () {
      show(nav.getAttribute('data-nav'));
    });
  });

  function paint(value) {
    if (readout) readout.textContent = value + ' units';
  }
  if (threshold) {
    threshold.addEventListener('input', function () {
      paint(threshold.value);
    });
  }

  try {
    var settings = JSON.parse(window.localStorage.getItem(KEY) || 'null');
    if (settings) {
      if (store && typeof settings.store === 'string') store.value = settings.store;
      if (notify && typeof settings.notify === 'boolean') notify.checked = settings.notify;
      if (threshold && typeof settings.threshold === 'number') threshold.value = String(settings.threshold);
      paint(threshold ? threshold.value : 12);
    }
  } catch (error) { /* keep static defaults when storage is unavailable */ }

  if (save) {
    save.addEventListener('click', function () {
      var data = {
        store: store ? store.value : '',
        notify: notify ? notify.checked : false,
        threshold: threshold ? Number(threshold.value) : 12
      };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(data));
      } catch (error) { /* storage unavailable; still confirm visibly */ }
      if (saved) saved.hidden = false;
    });
  }
})();
