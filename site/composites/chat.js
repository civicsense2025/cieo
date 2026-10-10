/* Chat workspace demo: appends messages locally (no backend), guards double-submit with a
   400ms reply window, Enter sends while Shift+Enter adds a newline, and the list auto-scrolls. */
(function () {
  var form = document.querySelector('[data-composer]');
  var list = document.querySelector('[data-list]');
  var input = document.querySelector('[data-input]');
  var send = document.querySelector('[data-send]');
  if (!form || !list || !input || !send) return;

  function stamp() {
    var d = new Date();
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    return h + ':' + m;
  }

  function scrollDown() {
    list.scrollTop = list.scrollHeight;
  }

  function appendMessage(author, time, text) {
    var article = document.createElement('article');
    article.className = 'cieo-chat-message';
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
    scrollDown();
  }

  function setSending(sending) {
    send.disabled = sending;
    if (sending) {
      send.setAttribute('aria-disabled', 'true');
    } else {
      send.removeAttribute('aria-disabled');
    }
  }

  function submit() {
    if (send.disabled) return;
    var text = input.value.trim();
    if (!text) return;
    setSending(true);
    appendMessage('You', stamp(), text);
    input.value = '';
    window.setTimeout(function () {
      appendMessage('Cieo', stamp(), 'Logged — demo replies stay on this page.');
      setSending(false);
    }, 400);
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
    }
  });

  scrollDown();
})();
