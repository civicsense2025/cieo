// Progressive enhancement for the contact form: send in place and report in words. Without script the form posts
// normally and the Worker redirects back with ?sent=1.
const form = document.querySelector('[data-contact]');
if (form) {
  const status = form.querySelector('[data-status]');
  const button = form.querySelector('button[type="submit"]');
  const stamp = form.querySelector('input[name="t"]');
  const say = (state, text) => { status.dataset.state = state; status.textContent = text; };
  stamp.value = String(Date.now()); // a form filled in under two seconds is a script, not a person
  if (new URLSearchParams(location.search).get('sent') === '1') say('ok', 'Thank you. Your message is on its way.');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    button.disabled = true; say('', 'Sending…');
    try {
      const response = await fetch(form.action, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      const result = await response.json().catch(() => ({}));
      if (response.ok) { form.reset(); stamp.value = String(Date.now()); say('ok', 'Thank you. Your message is on its way.'); }
      else say('error', result.error ?? (response.status === 429 ? 'Too many messages just now. Please try again in a few minutes.' : 'That did not go through. Please try again.'));
    } catch { say('error', 'We could not reach the server. Check your connection and try again.'); }
    finally { button.disabled = false; }
  });
}
