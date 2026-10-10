/* Inbox organism demo: six seeded threads read locally (all panels are visible
   with scripts disabled; JS shows one at a time on load). Selecting a thread
   marks it read, replies validate non-empty and append locally, archive and
   delete hide a thread behind an undo banner, and search filters senders and
   subjects. Keyboard: Up/Down/Home/End move in the list, Enter opens,
   "/" focuses search, "r" focuses reply, "a" archives, "d" deletes,
   "u" undoes, Escape returns to the thread list. No network, ever. */
(function () {
  'use strict';
  var root = document.querySelector('[data-inbox]');
  var search = document.querySelector('[data-search]');
  var clearSearch = document.querySelector('[data-clear-search]');
  var threadNav = document.querySelector('[data-threads]');
  var rows = Array.prototype.slice.call(document.querySelectorAll('[data-thread-row]'));
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-thread]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-thread-panel]'));
  var form = document.querySelector('[data-composer]');
  var reply = document.querySelector('[data-reply]');
  var send = document.querySelector('[data-send]');
  var replyError = document.querySelector('[data-reply-error]');
  var replyTarget = document.querySelector('[data-reply-target]');
  var banner = document.querySelector('[data-undo-banner]');
  var bannerText = document.querySelector('[data-undo-text]');
  var undoBtn = document.querySelector('[data-undo]');
  var count = document.querySelector('[data-count]');
  var emptyResults = document.querySelector('[data-empty-results]');
  var emptyThreads = document.querySelector('[data-empty-threads]');
  var status = document.querySelector('[data-status]');
  if (!root || !search || !threadNav || !rows.length || !form || !reply || !send) return;

  var activeId = 'kiln-schedule';
  var lastRemoved = null;

  function announce(message) {
    if (status) status.textContent = message;
  }

  function rowById(id) {
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].getAttribute('data-thread-row') === id) return rows[i];
    }
    return null;
  }

  function panelById(id) {
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].getAttribute('data-thread-panel') === id) return panels[i];
    }
    return null;
  }

  function buttonById(id) {
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('data-thread') === id) return buttons[i];
    }
    return null;
  }

  function threadTitle(id) {
    var btn = buttonById(id);
    if (!btn) return id;
    var label = btn.querySelector('[data-thread-title]');
    return ((label ? label.textContent : btn.textContent) || id).trim();
  }

  function isRemoved(row) {
    return row.getAttribute('data-removed') === 'true';
  }

  function visibleRows() {
    return rows.filter(function (row) { return !row.hidden && !isRemoved(row); });
  }

  function stamp() {
    var d = new Date();
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    return h + ':' + m;
  }

  function updateCount() {
    if (!count) return;
    var alive = rows.filter(function (row) { return !isRemoved(row); });
    var unread = alive.filter(function (row) { return row.hasAttribute('data-unread'); }).length;
    var noun = alive.length === 1 ? 'thread' : 'threads';
    var un = unread === 1 ? '1 unread' : unread + ' unread';
    count.textContent = alive.length + ' ' + noun + ', ' + un;
  }

  function updateEmptyStates() {
    var alive = rows.filter(function (row) { return !isRemoved(row); });
    if (emptyThreads) emptyThreads.hidden = alive.length !== 0;
    if (emptyResults) {
      var query = search.value.trim().toLowerCase();
      emptyResults.hidden = !(alive.length > 0 && visibleRows().length === 0 && query);
    }
  }

  function markRead(id) {
    var row = rowById(id);
    if (!row || !row.hasAttribute('data-unread')) return;
    row.removeAttribute('data-unread');
    var badge = row.querySelector('[data-unread-badge]');
    if (badge) badge.hidden = true;
    updateCount();
  }

  function select(id, focusButton, silent) {
    var target = panelById(id);
    var row = rowById(id);
    if (!target || !row || isRemoved(row) || row.hidden) return;
    activeId = id;
    for (var p = 0; p < panels.length; p++) {
      var pid = panels[p].getAttribute('data-thread-panel');
      var prow = rowById(pid);
      panels[p].hidden = pid !== id || (prow && (prow.hidden || isRemoved(prow)));
    }
    for (var b = 0; b < buttons.length; b++) {
      var isActive = buttons[b].getAttribute('data-thread') === id;
      if (isActive) {
        buttons[b].setAttribute('aria-current', 'true');
        if (focusButton) buttons[b].focus();
      } else {
        buttons[b].removeAttribute('aria-current');
      }
    }
    markRead(id);
    if (replyTarget) replyTarget.textContent = threadTitle(id);
    if (!silent) announce('Opened ' + threadTitle(id) + '.');
  }

  function applyFilter(announceIt) {
    var query = search.value.trim().toLowerCase();
    rows.forEach(function (row) {
      if (isRemoved(row)) {
        row.hidden = true;
        return;
      }
      var hay = (row.textContent || '').replace(/\s+/g, ' ').toLowerCase();
      row.hidden = Boolean(query) && hay.indexOf(query) === -1;
    });
    updateEmptyStates();
    updateCount();
    var activeRow = rowById(activeId);
    if (!activeRow || activeRow.hidden || isRemoved(activeRow)) {
      var first = visibleRows()[0];
      if (first) select(first.getAttribute('data-thread-row'), false, true);
    } else {
      select(activeId, false, true);
    }
    if (announceIt) {
      var n = visibleRows().length;
      announce(n === 0 ? 'No matching threads.' : n + ' matching threads.');
    }
  }

  function hideReplyError() {
    if (replyError) replyError.hidden = true;
    reply.removeAttribute('aria-invalid');
  }

  function showReplyError() {
    if (replyError) replyError.hidden = false;
    reply.setAttribute('aria-invalid', 'true');
    reply.focus();
    announce('Write a reply before sending.');
  }

  function appendReply(text) {
    var panel = panelById(activeId);
    if (!panel) return;
    var box = panel.querySelector('[data-messages]');
    if (!box) return;
    var article = document.createElement('article');
    var meta = document.createElement('div');
    var who = document.createElement('span');
    who.textContent = 'You';
    var when = document.createElement('time');
    when.textContent = stamp();
    meta.appendChild(who);
    meta.appendChild(document.createTextNode(' '));
    meta.appendChild(when);
    var body = document.createElement('p');
    body.textContent = text;
    article.appendChild(meta);
    article.appendChild(body);
    box.appendChild(article);
  }

  function submitReply() {
    var text = reply.value.trim();
    if (!text) {
      showReplyError();
      return;
    }
    hideReplyError();
    appendReply(text);
    reply.value = '';
    announce('Reply added to ' + threadTitle(activeId) + '. Nothing left this page.');
  }

  function removeActive(kind) {
    var row = rowById(activeId);
    if (!row || isRemoved(row)) return;
    row.setAttribute('data-removed', 'true');
    row.hidden = true;
    var panel = panelById(activeId);
    if (panel) panel.hidden = true;
    lastRemoved = { id: activeId, kind: kind };
    if (banner && bannerText) {
      bannerText.textContent = (kind === 'archive' ? 'Archived ' : 'Deleted ') + threadTitle(activeId) + '. Nothing left this page.';
      banner.hidden = false;
    }
    announce((kind === 'archive' ? 'Archived ' : 'Deleted ') + threadTitle(activeId) + '. Undo available.');
    updateCount();
    updateEmptyStates();
    var next = visibleRows()[0];
    if (next) {
      select(next.getAttribute('data-thread-row'), false, true);
    }
    if (undoBtn) undoBtn.focus();
  }

  function undoRemove() {
    if (!lastRemoved) return;
    var id = lastRemoved.id;
    var row = rowById(id);
    if (row) {
      row.removeAttribute('data-removed');
      row.hidden = false;
    }
    lastRemoved = null;
    if (banner) banner.hidden = true;
    applyFilter(false);
    select(id, true, false);
    updateEmptyStates();
  }

  search.addEventListener('input', function () { applyFilter(false); });
  search.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      search.value = '';
      applyFilter(false);
      var btn = buttonById(activeId);
      if (btn) btn.focus();
    }
  });

  if (clearSearch) {
    clearSearch.addEventListener('click', function () {
      search.value = '';
      applyFilter(false);
      search.focus();
    });
  }

  threadNav.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-thread]') : null;
    if (btn) select(btn.getAttribute('data-thread'), false, false);
  });

  threadNav.addEventListener('keydown', function (e) {
    var vis = visibleRows().map(function (row) { return buttonById(row.getAttribute('data-thread-row')); });
    if (!vis.length) return;
    var at = vis.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      var next;
      if (e.key === 'Home') next = vis[0];
      else if (e.key === 'End') next = vis[vis.length - 1];
      else if (at === -1) next = e.key === 'ArrowDown' ? vis[0] : vis[vis.length - 1];
      else {
        var step = e.key === 'ArrowDown' ? 1 : -1;
        next = vis[(at + step + vis.length) % vis.length];
      }
      if (next) next.focus();
      return;
    }
    if (e.key === 'Enter' && document.activeElement && document.activeElement.hasAttribute('data-thread')) {
      e.preventDefault();
      select(document.activeElement.getAttribute('data-thread'), false, false);
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submitReply();
  });

  reply.addEventListener('input', hideReplyError);

  reply.addEventListener('keydown', function (e) {
    // Cmd/Ctrl+Enter sends via the native send control; plain Enter adds a newline.
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      send.click();
    } else if (e.key === 'Escape') {
      var btn = buttonById(activeId);
      if (btn) btn.focus();
    }
  });

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-archive],[data-delete],[data-undo]') : null;
    if (!el) return;
    if (el.hasAttribute('data-archive')) removeActive('archive');
    else if (el.hasAttribute('data-delete')) removeActive('delete');
    else if (el.hasAttribute('data-undo')) undoRemove();
  });

  document.addEventListener('keydown', function (e) {
    var target = e.target || {};
    var tag = target.tagName || '';
    var typing = tag === 'TEXTAREA' || tag === 'INPUT' || target.isContentEditable;
    if (e.key === 'Escape' && typing) {
      var btn = buttonById(activeId);
      if (btn) btn.focus();
      return;
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') {
      e.preventDefault();
      search.focus();
    } else if (e.key === 'r') {
      e.preventDefault();
      reply.focus();
    } else if (e.key === 'a') {
      removeActive('archive');
    } else if (e.key === 'd') {
      removeActive('delete');
    } else if (e.key === 'u') {
      if (banner && !banner.hidden) undoRemove();
    }
  });

  applyFilter(false);
  select('kiln-schedule', false, true);
  updateCount();
})();
