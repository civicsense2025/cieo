/* Dashboard demo: section switching with the current marker, validated settings persisted
   under the cieo-dashboard-settings key (private-mode safe) with a discard path, plus an
   orders table with search, status filter, sortable columns, refresh loading, and empty states. */
(function () {
  'use strict';
  var KEY = 'cieo-dashboard-settings';
  var DEFAULTS = { store: 'Drift Goods', notify: true, threshold: 12, contact: '' };

  /* Section switching (existing behavior: toggle hidden, move aria-current). */
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-panel]'));
  var navs = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));

  function show(name) {
    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-panel') !== name;
    });
    navs.forEach(function (nav) {
      if (nav.getAttribute('data-nav') === name) nav.setAttribute('aria-current', 'page');
      else nav.removeAttribute('aria-current');
    });
  }
  navs.forEach(function (nav, index) {
    nav.addEventListener('click', function () {
      show(nav.getAttribute('data-nav'));
    });
    // Full keyboard path: arrows move and activate, Home/End jump.
    nav.addEventListener('keydown', function (event) {
      var next = -1;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % navs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + navs.length) % navs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = navs.length - 1;
      else return;
      event.preventDefault();
      navs[next].focus();
      show(navs[next].getAttribute('data-nav'));
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-goto]'), function (button) {
    button.addEventListener('click', function () {
      var name = button.getAttribute('data-goto');
      show(name);
      var panel = document.querySelector('[data-panel="' + name + '"]');
      var heading = panel ? panel.querySelector('h2') : null;
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
    });
  });

  /* Settings: validation with inline error states, synchronous save, discard path. */
  var form = document.querySelector('[data-settings-form]');
  var store = document.querySelector('[data-setting="store"]');
  var contact = document.querySelector('[data-setting="contact"]');
  var notify = document.querySelector('[data-setting="notify"]');
  var threshold = document.querySelector('[data-setting="threshold"]');
  var readout = document.querySelector('[data-readout]');
  var saved = document.querySelector('[data-saved]');
  var formError = document.querySelector('[data-settings-error]');
  var statusNote = document.querySelector('[data-settings-status]');
  var discard = document.querySelector('[data-discard]');
  var lastSaved = { store: DEFAULTS.store, notify: DEFAULTS.notify, threshold: DEFAULTS.threshold, contact: DEFAULTS.contact };

  function paint(value) {
    if (readout) readout.textContent = value + ' units';
  }
  function markDirty() {
    // The confirmation describes the last save; any edit makes it stale until the next one.
    if (saved) saved.hidden = true;
    if (statusNote) statusNote.hidden = true;
  }
  function fieldFor(name) {
    if (name === 'store') return store;
    if (name === 'contact') return contact;
    return threshold;
  }
  function setError(name, on) {
    var message = document.querySelector('[data-error="' + name + '"]');
    var input = fieldFor(name);
    if (message) message.hidden = !on;
    if (input) {
      if (on) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }
  function validate() {
    var problems = [];
    var name = store ? store.value.trim() : '';
    if (!store || name.length < 2) problems.push('store');
    var mail = contact ? contact.value.trim() : '';
    if (mail !== '' && mail.indexOf('@') === -1) problems.push('contact');
    var value = threshold ? Number(threshold.value) : NaN;
    if (threshold && (!isFinite(value) || value < 0 || value > 50)) problems.push('threshold');
    return problems;
  }
  function clearErrors() {
    ['store', 'contact', 'threshold'].forEach(function (name) { setError(name, false); });
    if (formError) formError.hidden = true;
  }
  function readForm() {
    return {
      store: store ? store.value : '',
      notify: Boolean(notify && notify.checked),
      threshold: threshold ? Number(threshold.value) : DEFAULTS.threshold,
      contact: contact ? contact.value.trim() : ''
    };
  }
  function applyForm(data) {
    if (store) store.value = data.store;
    if (notify) notify.checked = data.notify;
    if (threshold) threshold.value = String(data.threshold);
    if (contact) contact.value = data.contact || '';
    paint(threshold ? threshold.value : DEFAULTS.threshold);
  }

  [[store, 'store'], [contact, 'contact'], [threshold, 'threshold']].forEach(function (pair) {
    var el = pair[0];
    if (!el) return;
    // 'input' covers text, email, and range in modern browsers.
    el.addEventListener('input', function () {
      if (el === threshold) paint(el.value);
      markDirty();
      var bad = validate();
      setError(pair[1], bad.indexOf(pair[1]) !== -1);
      if (bad.length === 0 && formError) formError.hidden = true;
    });
  });
  if (notify) notify.addEventListener('input', markDirty);

  try {
    var settings = JSON.parse(window.localStorage.getItem(KEY) || 'null');
    if (settings) {
      var merged = {
        store: typeof settings.store === 'string' ? settings.store : DEFAULTS.store,
        notify: typeof settings.notify === 'boolean' ? settings.notify : DEFAULTS.notify,
        threshold: typeof settings.threshold === 'number' ? settings.threshold : DEFAULTS.threshold,
        contact: typeof settings.contact === 'string' ? settings.contact : DEFAULTS.contact
      };
      applyForm(merged);
      lastSaved = merged;
    } else {
      paint(threshold ? threshold.value : DEFAULTS.threshold);
    }
  } catch (error) { /* keep static defaults when storage is unavailable */ }

  if (form) {
    // Enter inside any settings field submits; the handler below validates synchronously
    // so the confirmation banner is visible in the same task (browser gate relies on this).
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var bad = validate();
      ['store', 'contact', 'threshold'].forEach(function (name) {
        setError(name, bad.indexOf(name) !== -1);
      });
      if (bad.length > 0) {
        if (formError) formError.hidden = false;
        if (saved) saved.hidden = true;
        var first = fieldFor(bad[0]);
        if (first && first.focus) first.focus();
        return;
      }
      var data = readForm();
      try {
        window.localStorage.setItem(KEY, JSON.stringify(data));
      } catch (error) { /* storage unavailable; still confirm visibly */ }
      lastSaved = { store: data.store, notify: data.notify, threshold: data.threshold, contact: data.contact };
      clearErrors();
      if (statusNote) statusNote.hidden = true;
      if (saved) saved.hidden = false;
    });
  }
  if (discard) {
    discard.addEventListener('click', function () {
      applyForm(lastSaved);
      clearErrors();
      if (saved) saved.hidden = true;
      if (statusNote) {
        statusNote.textContent = 'Changes discarded. The form matches the last saved settings.';
        statusNote.hidden = false;
      }
    });
  }

  /* Orders: search + status filter + sortable columns + refresh loading + empty states. */
  var TONE = { Paid: 'success', Pending: 'warning', Refunded: 'danger' };
  var search = document.querySelector('[data-orders-search]');
  var statusFilter = document.querySelector('[data-orders-status]');
  var refreshButton = document.querySelector('[data-orders-refresh]');
  var emptyDemoButton = document.querySelector('[data-empty-demo]');
  var clearButton = document.querySelector('[data-clear-filters]');
  var restoreButton = document.querySelector('[data-restore-orders]');
  var count = document.querySelector('[data-orders-count]');
  var loading = document.querySelector('[data-orders-loading]');
  var emptyResults = document.querySelector('[data-empty-results]');
  var emptyOrders = document.querySelector('[data-empty-orders]');
  var table = document.querySelector('[data-orders-table]');
  var body = document.querySelector('[data-orders-body]');
  var sortButtons = Array.prototype.slice.call(document.querySelectorAll('[data-sort]'));

  // Static-first: read the demo rows out of the server-rendered markup so the table
  // is fully readable with scripts disabled, then manage them from here.
  var demoOrders = [];
  if (body) {
    demoOrders = Array.prototype.map.call(body.querySelectorAll('tr'), function (row) {
      var cells = row.querySelectorAll('td');
      function text(index) { return cells[index] ? cells[index].textContent.trim() : ''; }
      return {
        id: parseInt(text(0).replace('#', ''), 10),
        customer: text(1),
        total: parseFloat(text(2).replace(/[$,]/g, '')),
        status: text(3)
      };
    }).filter(function (order) { return isFinite(order.id) && isFinite(order.total); });
  }
  var orders = demoOrders.slice();
  var sortState = { key: 'order', dir: -1 };
  var refreshing = false;
  var reducedMotion = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function filtersActive() {
    return Boolean((search && search.value.trim() !== '') || (statusFilter && statusFilter.value !== 'all'));
  }
  function visibleOrders() {
    var query = search ? search.value.trim().toLowerCase().replace(/^#/, '') : '';
    var status = statusFilter ? statusFilter.value : 'all';
    var kept = orders.filter(function (order) {
      if (status !== 'all' && order.status !== status) return false;
      if (query !== '' && String(order.id).indexOf(query) === -1 && order.customer.toLowerCase().indexOf(query) === -1) return false;
      return true;
    });
    var key = sortState.key;
    var dir = sortState.dir;
    return kept.slice().sort(function (a, b) {
      var result;
      if (key === 'order') result = a.id - b.id;
      else if (key === 'total') result = a.total - b.total;
      else if (key === 'customer') result = a.customer.localeCompare(b.customer);
      else result = a.status.localeCompare(b.status);
      return result * dir;
    });
  }
  function money(value) { return '$' + value.toFixed(2); }
  function render() {
    if (!body) return;
    var rows = visibleOrders();
    while (body.firstChild) body.removeChild(body.firstChild);
    rows.forEach(function (order) {
      var row = document.createElement('tr');
      var idCell = document.createElement('td');
      idCell.textContent = '#' + order.id;
      var customerCell = document.createElement('td');
      customerCell.textContent = order.customer;
      var totalCell = document.createElement('td');
      totalCell.textContent = money(order.total);
      var statusCell = document.createElement('td');
      var badge = document.createElement('span');
      badge.setAttribute('class', 'dash-badge');
      badge.setAttribute('data-tone', TONE[order.status] || 'info');
      badge.textContent = order.status;
      statusCell.appendChild(badge);
      row.appendChild(idCell);
      row.appendChild(customerCell);
      row.appendChild(totalCell);
      row.appendChild(statusCell);
      body.appendChild(row);
    });
    var hasOrders = orders.length > 0;
    if (table) table.hidden = rows.length === 0;
    if (emptyResults) emptyResults.hidden = !(hasOrders && rows.length === 0);
    if (emptyOrders) emptyOrders.hidden = hasOrders;
    if (count) {
      if (!hasOrders) count.textContent = 'Showing 0 orders.';
      else if (filtersActive()) count.textContent = 'Showing ' + rows.length + ' of ' + orders.length + ' orders.';
      else count.textContent = 'Showing ' + orders.length + ' of ' + orders.length + ' orders.';
    }
    sortButtons.forEach(function (button) {
      var cell = button.closest ? button.closest('th') : null;
      var active = button.getAttribute('data-sort') === sortState.key;
      if (cell) cell.setAttribute('aria-sort', active ? (sortState.dir === 1 ? 'ascending' : 'descending') : 'none');
      var arrow = button.querySelector('[data-arrow]');
      if (arrow) arrow.textContent = active ? (sortState.dir === 1 ? '↑' : '↓') : '';
    });
  }

  sortButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.getAttribute('data-sort');
      if (sortState.key === key) sortState.dir = -sortState.dir;
      else sortState = { key: key, dir: 1 };
      render();
    });
  });
  if (search) {
    search.addEventListener('input', render);
    search.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && search.value !== '') {
        search.value = '';
        render();
      }
    });
  }
  if (statusFilter) statusFilter.addEventListener('change', render);
  if (clearButton) {
    clearButton.addEventListener('click', function () {
      if (search) search.value = '';
      if (statusFilter) statusFilter.value = 'all';
      render();
      if (search) search.focus();
    });
  }
  if (emptyDemoButton) {
    emptyDemoButton.addEventListener('click', function () {
      if (search) search.value = '';
      if (statusFilter) statusFilter.value = 'all';
      orders = [];
      render();
    });
  }
  if (restoreButton) {
    restoreButton.addEventListener('click', function () {
      orders = demoOrders.slice();
      if (search) search.value = '';
      if (statusFilter) statusFilter.value = 'all';
      render();
      if (refreshButton) refreshButton.focus();
    });
  }
  if (refreshButton) {
    refreshButton.addEventListener('click', function () {
      if (refreshing) return;
      refreshing = true;
      [search, statusFilter, emptyDemoButton].forEach(function (control) {
        if (control) control.disabled = true;
      });
      sortButtons.forEach(function (button) { button.disabled = true; });
      if (table) {
        table.hidden = true;
        table.setAttribute('aria-busy', 'true');
      }
      if (emptyResults) emptyResults.hidden = true;
      if (emptyOrders) emptyOrders.hidden = true;
      if (loading) loading.hidden = false;
      window.setTimeout(function () {
        if (loading) loading.hidden = true;
        [search, statusFilter, emptyDemoButton].forEach(function (control) {
          if (control) control.disabled = false;
        });
        sortButtons.forEach(function (button) { button.disabled = false; });
        if (table) table.removeAttribute('aria-busy');
        refreshing = false;
        render();
        if (count) count.textContent = 'Orders refreshed. ' + count.textContent;
      }, reducedMotion ? 0 : 450);
    });
  }
  render();
})();
