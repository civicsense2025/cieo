// Progressive enhancement for the contact form: send in place and report in words. Without script the form posts
// normally and the Worker redirects back with ?sent=1.
const form = document.querySelector('[data-contact]');
if (form) {
  const status = form.querySelector('[data-status]');
  const button = form.querySelector('button[type="submit"]');
  const stamp = form.querySelector('input[name="t"]');
  const say = (state, text) => { status.dataset.state = state; status.textContent = text; };
  let attemptId = crypto.randomUUID();
  const refreshAttempt = () => { attemptId = crypto.randomUUID(); };
  form.addEventListener('input', refreshAttempt);
  form.addEventListener('change', refreshAttempt);
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
      const payload = { ...Object.fromEntries(new FormData(form)), attemptId };
      const response = await fetch(form.action, { method: 'POST', signal: AbortSignal.timeout(10000), headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (response.ok) { form.reset(); stamp.value = String(Date.now()); refreshAttempt(); say('ok', 'Thank you. Your message is on its way.'); }
      else say('error', result.error ?? (response.status === 429 ? 'Too many messages just now. Please try again in a few minutes.' : 'That did not go through. Please try again.'));
    } catch (err) { say('error', err?.name === 'AbortError' || err?.name === 'TimeoutError' ? 'Sending could not be confirmed. You can safely retry without sending twice.' : 'We could not reach the server. Check your connection and try again.'); }
    finally { button.disabled = false; }
  });
}
