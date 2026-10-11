/* Settings flow: profile plus preferences in one form with search filtering,
   per-field validation and inline errors, a save and discard bar, and
   persistence under the cieo-settings key that stays safe in private mode. */
(function () {
  'use strict';
  var KEY = 'cieo-settings';
  var AVATARS = ['AL', 'JO', 'SK'];
  var DEFAULTS = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    theme: 'system',
    notifyProduct: true,
    notifyWeekly: true,
    motion: 'full',
    density: 'comfortable',
    avatar: 'AL'
  };

  var reducedMotion = Boolean(
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  var form = document.querySelector('[data-settings-form]');
  var nameInput = document.querySelector('[data-setting="name"]');
  var emailInput = document.querySelector('[data-setting="email"]');
  var themeRadios = Array.prototype.slice.call(document.querySelectorAll('[data-setting="theme"]'));
  var notifyProduct = document.querySelector('[data-setting="notifyProduct"]');
  var notifyWeekly = document.querySelector('[data-setting="notifyWeekly"]');
  var motionSelect = document.querySelector('[data-setting="motion"]');
  var densitySelect = document.querySelector('[data-setting="density"]');
  var avatarBadge = document.querySelector('[data-avatar]');
  var avatarName = document.querySelector('[data-avatar-name]');
  var avatarEmail = document.querySelector('[data-avatar-email]');
  var avatarButton = document.querySelector('[data-avatar-change]');
  var saved = document.querySelector('[data-saved]');
  var formError = document.querySelector('[data-settings-error]');
  var statusNote = document.querySelector('[data-settings-status]');
  var discard = document.querySelector('[data-discard]');
  var search = document.querySelector('[data-settings-search]');
  var count = document.querySelector('[data-search-count]');
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-section]'));
  var noResults = document.querySelector('[data-no-results]');
  var clearSearch = document.querySelector('[data-clear-search]');

  var lastSaved = {};
  Object.keys(DEFAULTS).forEach(function (key) { lastSaved[key] = DEFAULTS[key]; });

  function markDirty() {
    // The confirmation describes the last save; any edit makes it stale.
    if (saved) saved.hidden = true;
    if (statusNote) statusNote.hidden = true;
  }
  function fieldFor(name) {
    return name === 'email' ? emailInput : nameInput;
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
  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  function validate() {
    var problems = [];
    var name = nameInput ? nameInput.value.trim() : '';
    if (!nameInput || name.length < 2) problems.push('name');
    var mail = emailInput ? emailInput.value.trim() : '';
    if (!emailInput || !validEmail(mail)) problems.push('email');
    return problems;
  }
  function clearErrors() {
    ['name', 'email'].forEach(function (name) { setError(name, false); });
    if (formError) formError.hidden = true;
  }
  function checkedTheme() {
    for (var i = 0; i < themeRadios.length; i++) {
      if (themeRadios[i].checked) return themeRadios[i].value;
    }
    return DEFAULTS.theme;
  }
  function readForm() {
    return {
      name: nameInput ? nameInput.value : DEFAULTS.name,
      email: emailInput ? emailInput.value.trim() : DEFAULTS.email,
      theme: checkedTheme(),
      notifyProduct: Boolean(notifyProduct && notifyProduct.checked),
      notifyWeekly: Boolean(notifyWeekly && notifyWeekly.checked),
      motion: motionSelect ? motionSelect.value : DEFAULTS.motion,
      density: densitySelect ? densitySelect.value : DEFAULTS.density,
      avatar: avatarBadge ? avatarBadge.textContent.trim() : DEFAULTS.avatar
    };
  }
  function paintAvatar(monogram, name, mail) {
    if (avatarBadge) avatarBadge.textContent = monogram;
    if (avatarName) avatarName.textContent = name === '' ? 'Your name' : name;
    if (avatarEmail) avatarEmail.textContent = mail === '' ? 'you@example.com' : mail;
  }
  function applyMotionSetting(value) {
    // Mirror the motion choice onto the root so token durations collapse,
    // matching the reduced-motion rule in the token stylesheet.
    if (value === 'reduced') document.documentElement.setAttribute('data-motion', 'reduced');
    else document.documentElement.removeAttribute('data-motion');
  }
  function applyForm(data) {
    if (nameInput) nameInput.value = data.name;
    if (emailInput) emailInput.value = data.email;
    themeRadios.forEach(function (radio) { radio.checked = radio.value === data.theme; });
    if (notifyProduct) notifyProduct.checked = data.notifyProduct;
    if (notifyWeekly) notifyWeekly.checked = data.notifyWeekly;
    if (motionSelect) motionSelect.value = data.motion;
    if (densitySelect) densitySelect.value = data.density;
    paintAvatar(data.avatar, data.name, data.email);
    applyMotionSetting(data.motion);
  }

  function load() {
    try {
      var stored = JSON.parse(window.localStorage.getItem(KEY) || 'null');
      if (stored) {
        var merged = {
          name: typeof stored.name === 'string' ? stored.name : DEFAULTS.name,
          email: typeof stored.email === 'string' ? stored.email : DEFAULTS.email,
          theme: stored.theme === 'light' || stored.theme === 'dark' || stored.theme === 'system'
            ? stored.theme : DEFAULTS.theme,
          notifyProduct: typeof stored.notifyProduct === 'boolean'
            ? stored.notifyProduct : DEFAULTS.notifyProduct,
          notifyWeekly: typeof stored.notifyWeekly === 'boolean'
            ? stored.notifyWeekly : DEFAULTS.notifyWeekly,
          motion: stored.motion === 'reduced' || stored.motion === 'full'
            ? stored.motion : DEFAULTS.motion,
          density: stored.density === 'compact' || stored.density === 'comfortable'
            ? stored.density : DEFAULTS.density,
          avatar: typeof stored.avatar === 'string' && stored.avatar !== ''
            ? stored.avatar : DEFAULTS.avatar
        };
        applyForm(merged);
        lastSaved = merged;
        return;
      }
    } catch (error) { /* keep static defaults when storage is unavailable */ }
    applyForm(lastSaved);
  }

  // Per-field validation as the user types; switches and selects mark dirty.
  [nameInput, emailInput].forEach(function (input) {
    if (!input) return;
    var key = input === emailInput ? 'email' : 'name';
    input.addEventListener('input', function () {
      markDirty();
      var bad = validate();
      setError(key, bad.indexOf(key) !== -1);
      if (bad.length === 0 && formError) formError.hidden = true;
      paintAvatar(
        avatarBadge ? avatarBadge.textContent.trim() : DEFAULTS.avatar,
        nameInput ? nameInput.value : '',
        emailInput ? emailInput.value.trim() : ''
      );
    });
  });
  themeRadios.forEach(function (radio) { radio.addEventListener('change', markDirty); });
  [notifyProduct, notifyWeekly, motionSelect, densitySelect].forEach(function (control) {
    if (!control) return;
    control.addEventListener('input', markDirty);
    control.addEventListener('change', markDirty);
  });

  if (avatarButton) {
    avatarButton.addEventListener('click', function () {
      var current = avatarBadge ? avatarBadge.textContent.trim() : AVATARS[0];
      var next = AVATARS[(AVATARS.indexOf(current) + 1 + AVATARS.length) % AVATARS.length];
      paintAvatar(
        next,
        nameInput ? nameInput.value : '',
        emailInput ? emailInput.value.trim() : ''
      );
      markDirty();
      avatarButton.focus();
    });
  }

  if (form) {
    // Enter inside a profile field submits; validate synchronously so the
    // confirmation is visible in the same task.
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var bad = validate();
      ['name', 'email'].forEach(function (name) {
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
      lastSaved = {
        name: data.name,
        email: data.email,
        theme: data.theme,
        notifyProduct: data.notifyProduct,
        notifyWeekly: data.notifyWeekly,
        motion: data.motion,
        density: data.density,
        avatar: data.avatar
      };
      applyMotionSetting(data.motion);
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

  // Settings search: narrow the visible sections in place, report the count,
  // and offer a way back when nothing matches.
  function sectionMatches(section, query) {
    if (query === '') return true;
    var haystack = (
      section.getAttribute('data-search-text') + ' ' + section.textContent
    ).toLowerCase();
    return query.split(/\s+/).every(function (word) {
      return word === '' || haystack.indexOf(word) !== -1;
    });
  }
  function firstVisible() {
    for (var i = 0; i < sections.length; i++) {
      if (!sections[i].hidden) return sections[i];
    }
    return null;
  }
  function jumpTo(section) {
    if (!section) return;
    var heading = section.querySelector('h2');
    if (heading) {
      if (!reducedMotion && heading.scrollIntoView) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      heading.focus({ preventScroll: true });
    }
  }
  function refreshSearch() {
    var query = search ? search.value.trim().toLowerCase() : '';
    var visible = 0;
    sections.forEach(function (section) {
      var show = sectionMatches(section, query);
      section.hidden = !show;
      if (show) visible += 1;
    });
    if (count) {
      count.textContent = query === ''
        ? 'Showing ' + sections.length + ' of ' + sections.length + ' sections.'
        : 'Showing ' + visible + ' of ' + sections.length + ' sections.';
    }
    if (noResults) noResults.hidden = visible !== 0;
  }
  if (search) {
    search.addEventListener('input', function () {
      markDirty();
      refreshSearch();
    });
    // Full keyboard path: Escape clears, Enter jumps to the first match.
    search.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && search.value !== '') {
        search.value = '';
        refreshSearch();
        event.preventDefault();
      } else if (event.key === 'Enter') {
        refreshSearch();
        jumpTo(firstVisible());
        event.preventDefault();
      }
    });
  }
  if (clearSearch) {
    clearSearch.addEventListener('click', function () {
      if (search) search.value = '';
      refreshSearch();
      if (search) search.focus();
    });
  }

  load();
  refreshSearch();
})();
