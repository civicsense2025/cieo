/* Onboarding demo behavior: four static steps (welcome, profile, preferences,
   done) stay readable with scripts disabled; JS hides the inactive steps on
   load and gates every forward move behind per-step validation with inline
   errors. Skip links jump without validating, the progress meter tracks the
   open step, the done panel summarizes local entries plus an invite code that
   copies via navigator.clipboard with a textarea/execCommand fallback, and
   Start over returns to welcome. Keyboard: Tab reaches every control, Enter
   advances from text fields, Escape steps back, arrows move across the
   stepper. Reduced motion is honored via matchMedia. No network calls — all
   state stays on this page. */
(function () {
  'use strict';
  var ORDER = ['welcome', 'profile', 'preferences', 'done'];
  var LABELS = { welcome: 'Welcome', profile: 'Profile', preferences: 'Preferences', done: 'All set' };
  var STATIC_CODE = 'CIEO-START-7Q2D';
  var current = 'welcome';

  var stepper = document.querySelector('[data-stepper]');
  var stepButtons = Array.prototype.slice.call(document.querySelectorAll('[data-step]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-step-panel]'));
  var progress = document.querySelector('[data-progress]');
  var progressText = document.querySelector('[data-progress-text]');
  var status = document.querySelector('[data-status]');
  var nameEl = document.querySelector('[data-name]');
  var emailEl = document.querySelector('[data-email]');
  var nameError = document.querySelector('[data-name-error]');
  var emailError = document.querySelector('[data-email-error]');
  var themeRadios = Array.prototype.slice.call(document.querySelectorAll('[data-theme]'));
  var themeGroup = document.querySelector('[data-theme-group]');
  var themeError = document.querySelector('[data-theme-error]');
  var digestEl = document.querySelector('[data-digest]');
  var digestError = document.querySelector('[data-digest-error]');
  var notifyEl = document.querySelector('[data-notify]');
  var copyBtn = document.querySelector('[data-copy]');
  var copyStatus = document.querySelector('[data-copy-status]');
  var codeEl = document.querySelector('[data-referral-code]');
  if (!stepper || !panels.length || !nameEl || !emailEl) return;

  var reduceMotion = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function announce(message) {
    if (status) status.textContent = message;
  }

  function panelFor(id) {
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].getAttribute('data-step-panel') === id) return panels[i];
    }
    return null;
  }

  function setError(input, errEl, show) {
    if (errEl) errEl.hidden = !show;
    if (!input) return;
    if (show) {
      input.setAttribute('aria-invalid', 'true');
      if (errEl && errEl.id) input.setAttribute('aria-describedby', errEl.id);
    } else {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }

  function emailValid() {
    var v = emailEl.value.trim();
    var at = v.indexOf('@');
    return at > 0 && at < v.length - 1 && v.indexOf(' ') === -1;
  }

  function validateProfile(show) {
    var nameOk = nameEl.value.trim().length > 0;
    var mailOk = emailValid();
    setError(nameEl, nameError, show && !nameOk);
    setError(emailEl, emailError, show && !mailOk);
    return nameOk && mailOk;
  }

  function themeValue() {
    for (var i = 0; i < themeRadios.length; i++) {
      if (themeRadios[i].checked) return themeRadios[i].value;
    }
    return '';
  }

  function validatePreferences(show) {
    var themeOk = Boolean(themeValue());
    var digestOk = Boolean(digestEl && digestEl.value);
    if (themeError) themeError.hidden = !(show && !themeOk);
    if (themeGroup) {
      if (show && !themeOk) themeGroup.setAttribute('aria-invalid', 'true');
      else themeGroup.removeAttribute('aria-invalid');
    }
    setError(digestEl, digestError, show && !digestOk);
    return themeOk && digestOk;
  }

  function focusFirstInvalid(id) {
    if (id === 'profile' || (id === 'preferences' && !validateProfile(false))) {
      validateProfile(true);
      if (!nameEl.value.trim()) {
        if (nameEl.focus) nameEl.focus();
        return;
      }
      if (emailEl.focus) emailEl.focus();
      return;
    }
    validatePreferences(true);
    if (!themeValue() && themeRadios[0] && themeRadios[0].focus) {
      themeRadios[0].focus();
      return;
    }
    if (digestEl && digestEl.focus) digestEl.focus();
  }

  function avatarValue() {
    var picked = document.querySelector('input[name="avatar"]:checked');
    return picked ? picked.value : '—';
  }

  function setSummary(selector, value) {
    var el = document.querySelector(selector);
    if (el) el.textContent = value || '—';
  }

  function codeFor(name) {
    var initials = name.trim().split(/\s+/).map(function (word) {
      return word.charAt(0);
    }).join('').slice(0, 2).toUpperCase();
    if (!initials) return STATIC_CODE;
    return 'CIEO-' + initials + '-7Q2D';
  }

  function buildSummary() {
    var name = nameEl.value.trim();
    setSummary('[data-summary-name]', name);
    setSummary('[data-summary-email]', emailEl.value.trim());
    setSummary('[data-summary-avatar]', avatarValue());
    setSummary('[data-summary-theme]', themeValue());
    setSummary('[data-summary-notify]', notifyEl && notifyEl.checked ? 'On' : 'Off');
    var digestLabel = '';
    if (digestEl && digestEl.selectedIndex >= 0 && digestEl.options[digestEl.selectedIndex]) {
      digestLabel = digestEl.options[digestEl.selectedIndex].text;
    }
    setSummary('[data-summary-digest]', digestEl && digestEl.value ? digestLabel : '—');
    if (codeEl) codeEl.textContent = codeFor(name);
    if (copyStatus) copyStatus.textContent = '';
  }

  function showStep(id, options) {
    var opts = options || {};
    current = id;
    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-step-panel') !== id;
    });
    stepButtons.forEach(function (button) {
      if (button.getAttribute('data-step') === id) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    var at = ORDER.indexOf(id) + 1;
    if (progress) progress.value = at;
    if (progressText) progressText.textContent = 'Step ' + at + ' of ' + ORDER.length + ' — ' + LABELS[id] + '.';
    if (id === 'done') buildSummary();
    if (!opts.silent) {
      announce(LABELS[id] + ' — step ' + at + ' of ' + ORDER.length + '.');
      var panel = panelFor(id);
      var heading = panel && panel.querySelector('h2');
      if (heading && heading.focus) {
        if (reduceMotion) heading.focus({ preventScroll: true });
        else heading.focus();
      }
    }
  }

  // Forward moves clear every earlier gate, so deep-linking the stepper can
  // never strand an invalid step behind the summary.
  function advanceTo(target) {
    var need = ORDER.slice(0, ORDER.indexOf(target));
    for (var i = 0; i < need.length; i++) {
      var ok = true;
      if (need[i] === 'profile') ok = validateProfile(true);
      if (need[i] === 'preferences') ok = validatePreferences(true);
      if (!ok) {
        showStep(need[i]);
        focusFirstInvalid(need[i]);
        return;
      }
    }
    showStep(target);
  }

  function copyCurrent(done) {
    var value = codeEl ? codeEl.textContent : STATIC_CODE;
    function fallbackCopy() {
      // Fallback for browsers without the async clipboard API: select a
      // temporary field and copy locally — still no network involved.
      var area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(area);
      done(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () {
        done(true);
      }, function () {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  }

  function restart() {
    nameEl.value = '';
    emailEl.value = '';
    var firstAvatar = document.querySelector('input[name="avatar"]');
    if (firstAvatar) firstAvatar.checked = true;
    themeRadios.forEach(function (radio) {
      radio.checked = false;
    });
    if (digestEl) digestEl.value = '';
    if (notifyEl) notifyEl.checked = true;
    validateProfile(false);
    validatePreferences(false);
    if (codeEl) codeEl.textContent = STATIC_CODE;
    if (copyStatus) copyStatus.textContent = '';
    showStep('welcome');
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-next]'), function (button) {
    button.addEventListener('click', function () {
      advanceTo(button.getAttribute('data-next'));
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-back]'), function (button) {
    button.addEventListener('click', function () {
      showStep(button.getAttribute('data-back'));
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-skip]'), function (button) {
    button.addEventListener('click', function () {
      showStep(button.getAttribute('data-skip'));
    });
  });

  stepper.addEventListener('click', function (event) {
    var button = event.target && event.target.closest ? event.target.closest('[data-step]') : null;
    if (!button) return;
    var id = button.getAttribute('data-step');
    if (ORDER.indexOf(id) <= ORDER.indexOf(current)) showStep(id);
    else advanceTo(id);
  });

  stepper.addEventListener('keydown', function (event) {
    if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].indexOf(event.key) === -1) return;
    event.preventDefault();
    var at = ORDER.indexOf(current);
    var next = event.key === 'ArrowRight' ? Math.min(at + 1, ORDER.length - 1)
      : event.key === 'ArrowLeft' ? Math.max(at - 1, 0)
      : event.key === 'Home' ? 0 : ORDER.length - 1;
    var id = ORDER[next];
    if (next <= at) showStep(id);
    else advanceTo(id);
    var button = stepper.querySelector('[data-step="' + id + '"]');
    if (button && button.focus) button.focus();
  });

  [nameEl, emailEl].forEach(function (field) {
    field.addEventListener('input', function () {
      validateProfile(false);
      if (nameError && !nameError.hidden) validateProfile(true);
      else if (emailError && !emailError.hidden) validateProfile(true);
    });
    field.addEventListener('blur', function () {
      validateProfile(true);
    });
    field.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        advanceTo(current === 'profile' ? 'preferences' : 'done');
      }
    });
  });

  themeRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      validatePreferences(false);
      if (themeError && !themeError.hidden) validatePreferences(true);
    });
  });

  if (digestEl) {
    digestEl.addEventListener('change', function () {
      validatePreferences(false);
      if (digestError && !digestError.hidden) validatePreferences(true);
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      copyBtn.disabled = true;
      copyCurrent(function (ok) {
        copyBtn.disabled = false;
        if (copyStatus) {
          copyStatus.textContent = ok
            ? 'Invite code copied — hand it to a teammate.'
            : 'Copy did not work — select the code above and copy it by hand.';
        }
        announce(ok ? 'Invite code copied.' : 'Copy failed. The code is shown above.');
        if (copyBtn.focus) copyBtn.focus();
      });
    });
  }

  var restartBtn = document.querySelector('[data-restart]');
  if (restartBtn) restartBtn.addEventListener('click', restart);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && current !== 'welcome') {
      event.preventDefault();
      showStep(ORDER[ORDER.indexOf(current) - 1]);
    }
  });

  showStep('welcome', { silent: true });
})();
