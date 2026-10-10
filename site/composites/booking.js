/* Booking demo behavior: weekday slot tables (none Sundays), live summary, confirm gating,
   and reference codes as BK-<YYYYMMDD>-<HHMM>-initials. Hosts nothing; all state is local. */
(function () {
  'use strict';
  var WEEKDAY_SLOTS = ['09:00', '10:30', '13:00', '15:30'];
  var SATURDAY_SLOTS = ['10:00', '11:30'];
  var state = { day: null, slot: null };

  var form = document.querySelector('[data-booking-form]');
  var slotsEl = document.querySelector('[data-slots]');
  var nameEl = document.querySelector('[data-name]');
  var emailEl = document.querySelector('[data-email]');
  var confirmEl = document.querySelector('[data-confirm]');
  var refEl = document.querySelector('[data-reference]');
  var errorEl = document.querySelector('[data-book-error]');
  var successEl = document.querySelector('[data-success]');
  var sumDay = document.querySelector('[data-summary-day]');
  var sumTime = document.querySelector('[data-summary-time]');
  var sumName = document.querySelector('[data-summary-name]');
  var steps = Array.prototype.slice.call(document.querySelectorAll('[data-step]'));
  var dayButtons = Array.prototype.slice.call(document.querySelectorAll('[data-day]'));
  if (!form || !slotsEl || !nameEl || !emailEl || !confirmEl || !refEl) return;

  function slotsForDay(isoDay) {
    var date = new Date(isoDay + 'T12:00:00');
    var dow = date.getDay();
    if (dow === 0) return [];
    if (dow === 6) return SATURDAY_SLOTS.slice();
    return WEEKDAY_SLOTS.slice();
  }

  function emptyStateHtml() {
    return '<div class="cieo cieo-p-empty-state"><p class="cieo-p-empty-state-title">No slots on Sundays — pick another day.</p></div>';
  }

  function setStep(current) {
    steps.forEach(function (step) {
      if (step.getAttribute('data-step') === current) {
        step.setAttribute('aria-current', 'step');
      } else {
        step.removeAttribute('aria-current');
      }
    });
  }

  function updateSummary() {
    if (sumDay) sumDay.textContent = state.day || '—';
    if (sumTime) sumTime.textContent = state.slot || '—';
    if (sumName) sumName.textContent = nameEl.value.trim() || '—';
  }

  function emailValid() {
    // Both sides of @ must hold text; "@" alone or "a@" never passes.
    var v = emailEl.value.trim();
    var at = v.indexOf('@');
    return at > 0 && at < v.length - 1;
  }

  function checkConfirm() {
    var ready = Boolean(state.day && state.slot && nameEl.value.trim() && emailValid());
    confirmEl.disabled = !ready;
  }

  function renderSlots() {
    var times = state.day ? slotsForDay(state.day) : [];
    var legend = '<legend>Times</legend>';
    if (!times.length) {
      slotsEl.innerHTML = legend + emptyStateHtml();
      return;
    }
    var radios = times.map(function (time) {
      var checked = state.slot === time ? ' checked' : '';
      return '<label class="booking-slot"><input type="radio" name="slot" value="' + time + '"' + checked + '> ' + time + '</label>';
    }).join('');
    slotsEl.innerHTML = legend + radios;
    Array.prototype.forEach.call(slotsEl.querySelectorAll('input[name="slot"]'), function (radio) {
      radio.addEventListener('change', onSlotChange);
    });
  }

  function hideError() {
    if (errorEl) errorEl.hidden = true;
    emailEl.removeAttribute('aria-invalid');
  }

  function onDayClick(event) {
    var button = event.currentTarget;
    if (button.disabled) return;
    state.day = button.getAttribute('data-day');
    state.slot = null;
    dayButtons.forEach(function (other) {
      other.setAttribute('aria-pressed', other === button ? 'true' : 'false');
    });
    hideError();
    renderSlots();
    setStep('time');
    updateSummary();
    checkConfirm();
  }

  function onSlotChange(event) {
    state.slot = event.target.value;
    hideError();
    setStep('details');
    updateSummary();
    checkConfirm();
  }

  function onDetailsInput() {
    hideError();
    updateSummary();
    checkConfirm();
  }

  function initialsFor(name) {
    return name.trim().split(/\s+/).map(function (word) {
      return word.charAt(0);
    }).join('').slice(0, 2).toUpperCase();
  }

  function referenceFor(day, slot, name) {
    return 'BK-' + day.replace(/-/g, '') + '-' + slot.replace(':', '') + '-' + initialsFor(name);
  }

  function onConfirm() {
    if (!state.day || !state.slot || !nameEl.value.trim() || !emailValid()) {
      if (errorEl) errorEl.hidden = false;
      emailEl.setAttribute('aria-invalid', 'true');
      if (emailEl.focus) emailEl.focus();
      return;
    }
    hideError();
    refEl.textContent = referenceFor(state.day, state.slot, nameEl.value);
    form.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      // Focus leaves the now-hidden Confirm button; move it to the success heading so
      // screen-reader and keyboard users land on the announcement.
      var heading = successEl.querySelector('[data-success-heading]');
      if (heading && heading.focus) heading.focus();
    }
  }

  dayButtons.forEach(function (button) {
    button.addEventListener('click', onDayClick);
  });
  nameEl.addEventListener('input', onDetailsInput);
  emailEl.addEventListener('input', onDetailsInput);
  confirmEl.addEventListener('click', onConfirm);
  setStep('day');
  updateSummary();
  checkConfirm();
})();
