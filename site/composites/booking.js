/* Booking demo behavior: weekday slot tables (none Sundays), live summary, confirm gating,
   reference codes as BK-<YYYYMMDD>-<HHMM>-initials, per-step error states, local reference
   lookup, reschedule and cancel paths, and past-vs-upcoming visit states. Hosts nothing;
   all state is local (memory plus this page's demo storage key). */
(function () {
  'use strict';
  var WEEKDAY_SLOTS = ['09:00', '10:30', '13:00', '15:30'];
  var SATURDAY_SLOTS = ['10:00', '11:30'];
  // Demo "today": visits before this ISO day read as past. Fixed so the
  // past-vs-upcoming states are deterministic for tests and readers.
  var TODAY = '2026-10-10';
  var STORE_KEY = 'cieo-bookings';
  var state = { day: null, slot: null, confirmedRef: null, reschedulingFrom: null };
  var touched = { name: false, email: false };

  var form = document.querySelector('[data-booking-form]');
  var slotsEl = document.querySelector('[data-slots]');
  var nameEl = document.querySelector('[data-name]');
  var emailEl = document.querySelector('[data-email]');
  var confirmEl = document.querySelector('[data-confirm]');
  var refEl = document.querySelector('[data-reference]');
  var errorEl = document.querySelector('[data-book-error]');
  var successEl = document.querySelector('[data-success]');
  var successNote = document.querySelector('[data-success-note]');
  var statusEl = document.querySelector('[data-booking-status]');
  var cancelledEl = document.querySelector('[data-cancelled]');
  var cancelledRef = document.querySelector('[data-cancelled-ref]');
  var cancelConfirm = document.querySelector('[data-cancel-confirm]');
  var dayError = document.querySelector('[data-day-error]');
  var slotError = document.querySelector('[data-slot-error]');
  var nameError = document.querySelector('[data-name-error]');
  var emailError = document.querySelector('[data-email-error]');
  var lookupEl = document.querySelector('[data-lookup]');
  var lookupGo = document.querySelector('[data-lookup-go]');
  var lookupError = document.querySelector('[data-lookup-error]');
  var lookupPanel = document.querySelector('[data-lookup-panel]');
  var visitsEl = document.querySelector('[data-visits]');
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

  function isPast(isoDay) {
    return isoDay < TODAY;
  }

  function loadRecords() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveRecords(records) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(records));
    } catch (e) {
      /* Demo storage is best-effort; the page works without it. */
    }
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

  function nameValid() {
    return nameEl.value.trim().length > 0;
  }

  function setFieldError(input, errEl, show) {
    if (errEl) errEl.hidden = !show;
    if (show) {
      input.setAttribute('aria-invalid', 'true');
      if (errEl && errEl.id) input.setAttribute('aria-describedby', errEl.id);
    } else {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }

  function validateDay(show) {
    var ok = Boolean(state.day);
    if (dayError) dayError.hidden = ok || !show;
    return ok;
  }

  function validateSlot(show) {
    var ok = Boolean(state.slot);
    if (slotError) slotError.hidden = ok || !show;
    return ok;
  }

  function validateName(show) {
    var ok = nameValid();
    setFieldError(nameEl, nameError, show && !ok);
    return ok;
  }

  function validateEmail(show) {
    var ok = emailValid();
    setFieldError(emailEl, emailError, show && !ok);
    return ok;
  }

  function checkConfirm() {
    var ready = Boolean(state.day && state.slot && nameValid() && emailValid());
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
  }

  function focusFirstInvalid() {
    if (!state.day) {
      var first = null;
      dayButtons.forEach(function (b) {
        if (!first && !b.disabled) first = b;
      });
      validateDay(true);
      if (first && first.focus) first.focus();
      return;
    }
    if (!state.slot) {
      validateSlot(true);
      var radio = slotsEl.querySelector('input[name="slot"]');
      if (radio && radio.focus) radio.focus();
      return;
    }
    if (!nameValid()) {
      validateName(true);
      if (nameEl.focus) nameEl.focus();
      return;
    }
    validateEmail(true);
    if (emailEl.focus) emailEl.focus();
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
    validateDay(false);
    validateSlot(false);
    renderSlots();
    setStep('time');
    updateSummary();
    checkConfirm();
  }

  function onSlotChange(event) {
    state.slot = event.target.value;
    hideError();
    validateSlot(false);
    setStep('details');
    updateSummary();
    checkConfirm();
  }

  function onDetailsInput() {
    hideError();
    if (touched.name) validateName(true);
    if (touched.email) validateEmail(true);
    updateSummary();
    checkConfirm();
  }

  // Reaching for name or email before day/time flags the earlier step,
  // so every step surfaces its own error state without dead ends.
  function onDetailsFocus() {
    if (!state.day) validateDay(true);
    else if (!state.slot) validateSlot(true);
  }

  function initialsFor(name) {
    return name.trim().split(/\s+/).map(function (word) {
      return word.charAt(0);
    }).join('').slice(0, 2).toUpperCase();
  }

  function referenceFor(day, slot, name) {
    return 'BK-' + day.replace(/-/g, '') + '-' + slot.replace(':', '') + '-' + initialsFor(name);
  }

  function statusFor(isoDay) {
    return isPast(isoDay) ? 'Past visit' : 'Upcoming visit';
  }

  function setStatusBadge(badge, isoDay) {
    if (!badge) return;
    var past = isPast(isoDay);
    badge.textContent = past ? 'Past visit' : 'Upcoming visit';
    badge.setAttribute('data-status', past ? 'default' : 'success');
  }

  function visitText(ref, day, slot) {
    return day + ' at ' + slot + ' — ref ' + ref;
  }

  function upsertVisitRow(ref, day, slot) {
    if (!visitsEl) return;
    var row = visitsEl.querySelector('[data-visit-ref="' + ref + '"]');
    if (!row) {
      row = document.createElement('li');
      row.setAttribute('class', 'cieo-p-list-item');
      row.setAttribute('data-visit', '');
      row.setAttribute('data-visit-ref', ref);
      visitsEl.insertBefore(row, visitsEl.firstChild);
    }
    row.setAttribute('data-visit-day', day);
    row.removeAttribute('data-visit-cancelled');
    var past = isPast(day);
    row.innerHTML = '<span class="cieo cieo-badge" data-status="' + (past ? 'default' : 'success') + '">' +
      (past ? 'Past visit' : 'Upcoming visit') + '</span> ' + visitText(ref, day, slot);
  }

  function markVisitCancelled(ref) {
    if (!visitsEl) return;
    var row = visitsEl.querySelector('[data-visit-ref="' + ref + '"]');
    if (!row) return;
    row.setAttribute('data-visit-cancelled', 'true');
    var badge = row.querySelector('.cieo-badge');
    if (badge) {
      badge.textContent = 'Cancelled visit';
      badge.setAttribute('data-status', 'danger');
    }
  }

  function onConfirm() {
    if (!state.day || !state.slot || !nameValid() || !emailValid()) {
      if (errorEl) errorEl.hidden = false;
      validateDay(true);
      validateSlot(true);
      validateName(true);
      validateEmail(true);
      touched.name = true;
      touched.email = true;
      focusFirstInvalid();
      return;
    }
    hideError();
    var ref = referenceFor(state.day, state.slot, nameEl.value);
    var records = loadRecords();
    if (state.reschedulingFrom && state.reschedulingFrom !== ref) {
      delete records[state.reschedulingFrom];
      if (successNote) {
        successNote.textContent = 'Moved from ' + state.reschedulingFrom + ' — that reference no longer holds a slot.';
        successNote.hidden = false;
      }
    } else if (successNote) {
      successNote.hidden = true;
      successNote.textContent = '';
    }
    records[ref] = {
      day: state.day,
      slot: state.slot,
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      status: isPast(state.day) ? 'past' : 'upcoming'
    };
    saveRecords(records);
    state.confirmedRef = ref;
    state.reschedulingFrom = null;
    refEl.textContent = ref;
    setStatusBadge(statusEl, state.day);
    upsertVisitRow(ref, state.day, state.slot);
    if (cancelConfirm) cancelConfirm.hidden = true;
    form.hidden = true;
    if (cancelledEl) cancelledEl.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      setStep('confirm');
      // Focus leaves the now-hidden Confirm button; move it to the success heading so
      // screen-reader and keyboard users land on the announcement.
      var heading = successEl.querySelector('[data-success-heading]');
      if (heading && heading.focus) heading.focus();
    }
  }

  function showFormAtDay() {
    if (successEl) successEl.hidden = true;
    if (cancelledEl) cancelledEl.hidden = true;
    if (cancelConfirm) cancelConfirm.hidden = true;
    form.hidden = false;
    hideError();
    setStep('day');
    var calHeading = document.querySelector('[data-calendar-heading]');
    if (calHeading && calHeading.focus) calHeading.focus();
  }

  function onReschedule() {
    // Keep day, slot, and details: the visitor only changes what needs changing.
    state.reschedulingFrom = state.confirmedRef;
    showFormAtDay();
    updateSummary();
    checkConfirm();
  }

  function hideCancelConfirm(returnFocus) {
    if (cancelConfirm) cancelConfirm.hidden = true;
    if (returnFocus) {
      var cancelBtn = document.querySelector('[data-cancel]');
      if (cancelBtn && cancelBtn.focus) cancelBtn.focus();
    }
  }

  function onCancelAsk() {
    if (!cancelConfirm) return;
    cancelConfirm.hidden = false;
    var yes = document.querySelector('[data-cancel-yes]');
    if (yes && yes.focus) yes.focus();
  }

  function onCancelYes() {
    var ref = state.confirmedRef;
    if (cancelConfirm) cancelConfirm.hidden = true;
    if (successEl) successEl.hidden = true;
    var records = loadRecords();
    if (ref && records[ref]) {
      records[ref].status = 'cancelled';
      saveRecords(records);
    }
    if (ref) markVisitCancelled(ref);
    if (cancelledRef) cancelledRef.textContent = ref || '—';
    if (cancelledEl) {
      cancelledEl.hidden = false;
      setStep('manage');
      var heading = cancelledEl.querySelector('[data-cancelled-heading]');
      if (heading && heading.focus) heading.focus();
    }
  }

  function resetAll() {
    state.day = null;
    state.slot = null;
    state.confirmedRef = null;
    state.reschedulingFrom = null;
    touched.name = false;
    touched.email = false;
    nameEl.value = '';
    emailEl.value = '';
    dayButtons.forEach(function (other) {
      other.setAttribute('aria-pressed', 'false');
    });
    setFieldError(nameEl, nameError, false);
    setFieldError(emailEl, emailError, false);
    validateDay(false);
    validateSlot(false);
    hideError();
    renderSlots();
    updateSummary();
    checkConfirm();
  }

  function onBookAgain() {
    resetAll();
    showFormAtDay();
  }

  // Deterministic, local reference lookup: BK-YYYYMMDD-HHMM-XX decodes to a
  // day, a time, and holder initials. Saved bookings enrich it with the name.
  function decodeReference(raw) {
    var ref = (raw || '').trim().toUpperCase();
    var m = /^BK-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})-([A-Z]{1,2})$/.exec(ref);
    if (!m) return null;
    var day = m[1] + '-' + m[2] + '-' + m[3];
    var slot = m[4] + ':' + m[5];
    var check = new Date(day + 'T12:00:00');
    if (isNaN(check.getTime())) return null;
    var iso = check.toISOString().slice(0, 10);
    if (iso !== day) return null;
    if (slotsForDay(day).indexOf(slot) === -1) return null;
    return { ref: ref, day: day, slot: slot, initials: m[6] };
  }

  function onLookup() {
    if (!lookupEl) return;
    var found = decodeReference(lookupEl.value);
    if (!found) {
      if (lookupError) lookupError.hidden = false;
      lookupEl.setAttribute('aria-invalid', 'true');
      if (lookupError && lookupError.id) lookupEl.setAttribute('aria-describedby', lookupError.id);
      if (lookupPanel) lookupPanel.hidden = true;
      if (lookupEl.focus) lookupEl.focus();
      return;
    }
    if (lookupError) lookupError.hidden = true;
    lookupEl.removeAttribute('aria-invalid');
    lookupEl.removeAttribute('aria-describedby');
    var records = loadRecords();
    var saved = records[found.ref];
    var holder = saved && saved.name ? saved.name : 'holder ' + found.initials;
    var status = saved && saved.status === 'cancelled' ? 'Cancelled visit' : statusFor(found.day);
    var dayOut = document.querySelector('[data-lookup-day]');
    var timeOut = document.querySelector('[data-lookup-time]');
    var holderOut = document.querySelector('[data-lookup-holder]');
    var statusOut = document.querySelector('[data-lookup-status]');
    if (dayOut) dayOut.textContent = found.day;
    if (timeOut) timeOut.textContent = found.slot;
    if (holderOut) holderOut.textContent = holder;
    if (statusOut) statusOut.textContent = status;
    if (lookupPanel) {
      lookupPanel.hidden = false;
      setStep('manage');
      var heading = lookupPanel.querySelector('[data-lookup-heading]');
      if (heading && heading.focus) heading.focus();
    }
  }

  function refreshVisitStates() {
    if (!visitsEl) return;
    Array.prototype.forEach.call(visitsEl.querySelectorAll('[data-visit]'), function (row) {
      if (row.hasAttribute('data-visit-cancelled')) return;
      var badge = row.querySelector('.cieo-badge');
      setStatusBadge(badge, row.getAttribute('data-visit-day') || TODAY);
    });
  }

  dayButtons.forEach(function (button) {
    button.addEventListener('click', onDayClick);
  });
  nameEl.addEventListener('input', onDetailsInput);
  emailEl.addEventListener('input', onDetailsInput);
  nameEl.addEventListener('focus', onDetailsFocus);
  emailEl.addEventListener('focus', onDetailsFocus);
  nameEl.addEventListener('blur', function () {
    touched.name = true;
    validateName(true);
    checkConfirm();
  });
  emailEl.addEventListener('blur', function () {
    touched.email = true;
    validateEmail(true);
    checkConfirm();
  });
  confirmEl.addEventListener('click', onConfirm);
  var rescheduleBtn = document.querySelector('[data-reschedule]');
  var cancelBtn = document.querySelector('[data-cancel]');
  var cancelYes = document.querySelector('[data-cancel-yes]');
  var cancelNo = document.querySelector('[data-cancel-no]');
  var bookAgain = document.querySelector('[data-book-again]');
  if (rescheduleBtn) rescheduleBtn.addEventListener('click', onReschedule);
  if (cancelBtn) cancelBtn.addEventListener('click', onCancelAsk);
  if (cancelYes) cancelYes.addEventListener('click', onCancelYes);
  if (cancelNo) cancelNo.addEventListener('click', function () {
    hideCancelConfirm(true);
  });
  if (bookAgain) bookAgain.addEventListener('click', onBookAgain);
  if (lookupGo) lookupGo.addEventListener('click', onLookup);
  if (lookupEl) lookupEl.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      onLookup();
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && cancelConfirm && !cancelConfirm.hidden) {
      event.preventDefault();
      hideCancelConfirm(true);
    }
  });
  setStep('day');
  refreshVisitStates();
  updateSummary();
  checkConfirm();
})();
