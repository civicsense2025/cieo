/* Chat workspace demo: three seeded threads switch locally (content stays readable
   with scripts disabled; JS hides the inactive threads on load). Sends append a user
   bubble and a canned local reply after a 400ms window that also guards
   double-submit. The word "fail" previews a failed reply with a Retry control that
   always lands on retry. A token meter estimates one token per four characters in
   the open thread. Keyboard: Up/Down/Left/Right/Home/End move between threads, "/"
   focuses the composer, Escape returns to the thread list. No network, ever. */
(function () {
  'use strict';
  var form = document.querySelector('[data-composer]');
  var listFallback = document.querySelector('[data-list]');
  var input = document.querySelector('[data-input]');
  var send = document.querySelector('[data-send]');
  var threadNav = document.querySelector('[data-threads]');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-thread]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-thread-panel]'));
  var budget = document.querySelector('[data-budget]');
  var budgetText = document.querySelector('[data-budget-text]');
  var status = document.querySelector('[data-status]');
  if (!form || !listFallback || !input || !send || !panels.length) return;

  var activeId = 'theming';

  function activePanel() {
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].getAttribute('data-thread-panel') === activeId) return panels[i];
    }
    return panels[0];
  }

  function activeList() {
    return activePanel().querySelector('[data-list]');
  }

  function stamp() {
    var d = new Date();
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    return h + ':' + m;
  }

  function scrollDown(list) {
    list.scrollTop = list.scrollHeight;
  }

  function estimate(text) {
    return Math.max(1, Math.ceil(text.length / 4));
  }

  function messageUsage(panel) {
    var messages = panel.querySelectorAll('.cieo-chat-message');
    var used = 0;
    for (var i = 0; i < messages.length; i++) {
      used += estimate(messages[i].textContent.replace(/\s+/g, ' ').trim());
    }
    return used;
  }

  function currentUsage() {
    return messageUsage(activePanel());
  }

  function updateBudget() {
    var used = currentUsage();
    if (budget) budget.value = used;
    if (budgetText) {
      budgetText.textContent = used + ' of 4,000 tokens used in this thread.';
    }
  }

  function announce(message) {
    if (status) status.textContent = message;
  }

  function threadTitle(id) {
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('data-thread') === id) {
        var label = buttons[i].querySelector('[data-thread-title]');
        return ((label ? label.textContent : buttons[i].textContent) || id).trim();
      }
    }
    return id;
  }

  function hideEmpty(panel) {
    var empty = panel.querySelector('[data-empty]');
    if (empty) empty.hidden = true;
  }

  function appendMessage(author, time, text) {
    hideEmpty(activePanel());
    var list = activeList();
    var article = document.createElement('article');
    article.className = 'cieo-chat-message cieo-chat-fade';
    article.tabIndex = -1;
    var meta = document.createElement('div');
    var who = document.createElement('span');
    who.textContent = author;
    var when = document.createElement('time');
    when.textContent = time;
    meta.appendChild(who);
    meta.appendChild(document.createTextNode(' '));
    meta.appendChild(when);
    var bubble = document.createElement('div');
    var p = document.createElement('p');
    p.textContent = text;
    bubble.appendChild(p);
    article.appendChild(meta);
    article.appendChild(bubble);
    list.appendChild(article);
    scrollDown(list);
    return article;
  }

  function cannedReply(text, used) {
    if (/token|budget/i.test(text)) {
      return 'This thread holds about ' + used + ' of 4,000 demo tokens — roughly one per four characters, counted on this page.';
    }
    if (/thread/i.test(text)) {
      return 'Switch threads above: Theming help, Bag totals, or the empty New idea starter. Arrow keys move, Enter opens.';
    }
    return 'Logged — demo replies stay on this page.';
  }

  function setSending(sending) {
    send.disabled = sending;
    if (sending) {
      send.setAttribute('aria-disabled', 'true');
    } else {
      send.removeAttribute('aria-disabled');
    }
  }

  function appendAssistant(text) {
    var node = appendMessage('Cieo', stamp(), cannedReply(text, currentUsage()));
    updateBudget();
    announce('Local reply added.');
    return node;
  }

  function appendFailure(original) {
    var list = activeList();
    var node = document.createElement('div');
    node.className = 'cieo-chat-message cieo-chat-fade';
    var banner = document.createElement('div');
    banner.setAttribute('data-parts', 'Banner');
    banner.setAttribute('data-tone', 'danger');
    banner.setAttribute('role', 'alert');
    var title = document.createElement('p');
    title.textContent = 'Reply did not send.';
    var body = document.createElement('p');
    body.textContent = 'Nothing left this page — the demo reply failed because the message mentions “fail”.';
    var retry = document.createElement('button');
    retry.type = 'button';
    retry.setAttribute('data-retry', '');
    retry.textContent = 'Retry reply';
    retry._failedText = original;
    banner.appendChild(title);
    banner.appendChild(body);
    banner.appendChild(retry);
    node.appendChild(banner);
    list.appendChild(node);
    scrollDown(list);
    updateBudget();
    announce('Reply failed. Retry available.');
    retry.focus();
  }

  function submit() {
    if (send.disabled) return;
    var text = input.value.trim();
    if (!text) return;
    setSending(true);
    appendMessage('You', stamp(), text);
    input.value = '';
    updateBudget();
    announce('Message sent. Waiting for the local reply.');
    window.setTimeout(function () {
      if (/fail/i.test(text)) {
        appendFailure(text);
      } else {
        appendAssistant(text);
      }
      setSending(false);
    }, 400);
  }

  function switchThread(id, focusButton, silent) {
    var target = null;
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].getAttribute('data-thread-panel') === id) target = panels[i];
    }
    if (!target) return;
    activeId = id;
    for (var p = 0; p < panels.length; p++) {
      panels[p].hidden = panels[p] !== target;
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
    updateBudget();
    scrollDown(activeList());
    if (!silent) announce('Switched to ' + threadTitle(id) + '.');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submit();
  });

  input.addEventListener('keydown', function (e) {
    // isComposing guards IME (CJK) users from sending mid-composition on Enter.
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      submit();
    } else if (e.key === 'Escape') {
      var btn = document.querySelector('[data-thread="' + activeId + '"]');
      if (btn) btn.focus();
    }
  });

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-retry]') : null;
    if (!el || el.disabled) return;
    el.disabled = true;
    el.setAttribute('aria-disabled', 'true');
    var original = el._failedText || '';
    var failed = el.closest ? el.closest('.cieo-chat-message') : null;
    window.setTimeout(function () {
      var reply = appendAssistant(original);
      if (failed && failed.parentNode) failed.parentNode.removeChild(failed);
      updateBudget();
      reply.focus();
      scrollDown(activeList());
    }, 400);
  });

  if (threadNav) {
    threadNav.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-thread]') : null;
      if (btn) switchThread(btn.getAttribute('data-thread'), false, false);
    });
    threadNav.addEventListener('keydown', function (e) {
      var step = 0;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') step = 1;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') step = -1;
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        var edge = e.key === 'Home' ? buttons[0] : buttons[buttons.length - 1];
        if (edge) switchThread(edge.getAttribute('data-thread'), true, false);
        return;
      }
      if (step !== 0 && buttons.indexOf(document.activeElement) !== -1) {
        e.preventDefault();
        var at = buttons.indexOf(document.activeElement);
        var next = buttons[(at + step + buttons.length) % buttons.length];
        switchThread(next.getAttribute('data-thread'), true, false);
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    var target = e.target || {};
    var tag = target.tagName || '';
    var typing = tag === 'TEXTAREA' || tag === 'INPUT' || target.isContentEditable;
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      input.focus();
    }
  });

  switchThread('theming', false, true);
  updateBudget();
  scrollDown(activeList());
})();
