// Progressive enhancement for the contact form: send in place and report in words. Without script the form posts
// normally and the Worker redirects back with ?sent=1.
const form = document.querySelector('[data-contact]');
if (form) {
  const status = form.querySelector('[data-status]');
  const button = form.querySelector('button[type="submit"]');
  const stamp = form.querySelector('input[name="t"]');
  const say = (state, text) => { status.dataset.state = state; status.textContent = text; };
  stamp.value = String(Date.now()); // a form filled in under two seconds is a script, not a person
  const params = new URLSearchParams(location.search);
  const reasons = { invalid: 'Please check your name, email and message and try again.', large: 'That message is too large.', unreadable: 'We could not read that message.', busy: 'Too many messages just now. Please try again in a few minutes.', closed: 'Messages are not being accepted right now. Please try again later.', failed: 'We could not send that just now. Please try again.' };
  if (params.get('sent') === '1') say('ok', 'Thank you. Your message is on its way.');
  else if (reasons[params.get('error')]) say('error', reasons[params.get('error')]);
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
