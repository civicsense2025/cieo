"""Local-source auth motion gate. No installs and no external requests.

Run: CIEO_ESBUILD=/existing/node_modules/esbuild python3 test/browser/auth-motion.py
"""
import functools
import http.server
import json
import os
import pathlib
import shutil
import subprocess
import tempfile
import threading

from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parents[2]
esbuild = os.environ.get('CIEO_ESBUILD', str(root.parent / 'principle/web/node_modules/esbuild'))


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, _format, *_args):
        pass


def build(out: pathlib.Path):
    subprocess.run([
        'node', '-e',
        "require(process.argv[1]).buildSync({entryPoints:[process.argv[2]],bundle:true,outfile:process.argv[3],jsx:'automatic',nodePaths:[process.argv[4]]})",
        esbuild, str(root / 'test/browser/auth-motion.tsx'), str(out / 'fixture.js'), str(root / 'node_modules'),
    ], check=True)
    shutil.copytree(root / 'design', out / 'design')
    shutil.copytree(root / 'tokens', out / 'tokens')
    (out / 'index.html').write_text(
        '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">'
        '<link rel="stylesheet" href="tokens/tokens.css"><link rel="stylesheet" href="design/themes.css">'
        '<link rel="stylesheet" href="design/primitives.css"><body><main id="root" style="padding:24px;max-width:420px"></main>'
        '<script src="fixture.js"></script></body></html>'
    )


def run_mode(browser, origin: str, mode: str):
    context = browser.new_context(viewport={'width': 500, 'height': 900}, reduced_motion=mode)
    page = context.new_page()
    errors = []
    checks = {}
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(origin) else route.abort())
    page.goto(origin)
    page.wait_for_function('window.ready === true')
    page.evaluate("""() => {
      const root = document.getElementById('root');
      root.style.setProperty('--motion-duration-snap', '200ms');
      root.style.setProperty('--motion-duration-base', '300ms');
      root.style.setProperty('--motion-duration-soft', '440ms');
      root.style.setProperty('--motion-duration-exit', '100ms');
    }""")

    mfa = page.locator('#mfa')
    mfa.get_by_role('button', name='Use a recovery code instead').click()
    mfa_state = mfa.evaluate("""el => ({
      focus: document.activeElement?.id,
      focusPaneOpacity: Number.parseFloat(getComputedStyle(document.activeElement?.closest('[data-auth-motion-pane]')).opacity),
      panes: el.querySelectorAll('[data-auth-motion-pane]').length,
      leaverHidden: el.querySelector('[data-auth-motion-phase="leave"]')?.getAttribute('aria-hidden'),
      leaverInert: el.querySelector('[data-auth-motion-phase="leave"]')?.hasAttribute('inert')
    })""")
    checks['mfa-focus-handoff'] = mfa_state['focus'] == 'mfa-form-recovery'
    checks['mfa-focused-pane-is-visible'] = mfa_state['focusPaneOpacity'] >= 0.99
    if mode == 'no-preference':
        checks['mfa-retains-inert-leaver'] = (
            mfa_state['panes'] == 2
            and mfa_state['leaverHidden'] == 'true'
            and mfa_state['leaverInert'] is True
        )
        mfa.get_by_role('button', name='Use the authenticator instead').click()
        checks['mfa-rapid-reversal-focus'] = page.evaluate("document.activeElement?.id") == 'mfa-form-otp-0'
    else:
        checks['mfa-reduced-is-instant'] = mfa.locator('[data-auth-motion-pane]').count() == 1

    reset = page.locator('#reset')
    before = reset.locator('[data-auth-motion-frame]').evaluate('(el) => el.getBoundingClientRect().height') if reset.locator('[data-auth-motion-frame]').count() else 0
    page.evaluate("window.hooks.setResetStep('confirm')")
    try:
        page.wait_for_function("document.activeElement?.id === 'reset-form-password'", timeout=250)
        checks['reset-focus-handoff'] = True
    except Exception:
        checks['reset-focus-handoff'] = False
    after = reset.locator('[data-auth-motion-frame]').evaluate('(el) => el.getBoundingClientRect().height') if reset.locator('[data-auth-motion-frame]').count() else 0
    checks['reset-measured-frame'] = before > 0 and after > 0

    account = page.locator('#account')
    account.get_by_role('button', name='Sign out').click()
    account_state = account.evaluate("""el => ({
      focus: document.activeElement?.textContent?.trim(),
      panes: el.querySelectorAll('[data-auth-motion-pane]').length
    })""")
    checks['account-focus-handoff'] = account_state['focus'] == 'Confirm sign out'
    checks['account-pane-contract'] = account_state['panes'] == (2 if mode == 'no-preference' else 1)

    pending = page.locator('#pending')
    page.evaluate('window.hooks.setPending(true)')
    page.wait_for_function("document.querySelector('#pending button[type=submit] .cieo-swap-in')?.textContent === 'Signing in…'", timeout=250)
    pending_state = pending.evaluate("""el => ({
      incoming: el.querySelector('button[type="submit"] .cieo-swap-in')?.textContent,
      outgoing: el.querySelector('button[type="submit"] .cieo-swap-out')?.textContent
    })""")
    checks['pending-label-swap'] = pending_state['incoming'] == 'Signing in…'
    if mode == 'no-preference':
        checks['pending-label-retains-old'] = pending_state['outgoing'] == 'Sign in'

    password = page.locator('#motion-password')
    password.fill('Abcdefgh12!')
    first_segment = page.locator('#password .cieo-auth-meter i').first
    meter = page.locator('#password .cieo-auth-meter')
    transition_duration = first_segment.evaluate("el => getComputedStyle(el).transitionDuration")
    checks['password-snap-feedback'] = first_segment.get_attribute('data-filled') == 'true' and (
        'transform' in first_segment.evaluate("el => getComputedStyle(el).transitionProperty") if mode == 'no-preference'
        else all(float(item.strip().removesuffix('s')) == 0 for item in transition_duration.split(','))
    )
    page.wait_for_timeout(500)
    checks['password-meter-final-geometry'] = meter.locator('i[data-filled]').first.evaluate(
        "el => Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).a - 1) < 0.01"
    ) and meter.locator('i:not([data-filled])').last.evaluate(
        "el => Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).a - 0.12) < 0.02"
    )

    error_message = page.locator('#error .cieo-auth-motion-message')
    checks['empty-error-does-not-add-gap'] = error_message.evaluate("el => getComputedStyle(el).position === 'absolute'")
    page.evaluate("window.hooks.setEmailError('Check the address')")
    page.wait_for_timeout(20)
    checks['error-enters-in-flow'] = error_message.get_attribute('data-open') is not None and error_message.evaluate("el => getComputedStyle(el).position !== 'absolute'")
    page.evaluate('window.hooks.setEmailError(undefined)')
    if mode == 'no-preference':
        checks['error-exit-retains-space'] = error_message.get_attribute('data-open') is not None
        page.wait_for_timeout(450)
    checks['error-exit-releases-space'] = error_message.get_attribute('data-open') is None and error_message.evaluate("el => getComputedStyle(el).position === 'absolute'")

    sessions = page.locator('#sessions')
    sessions.scroll_into_view_if_needed()
    tablet = sessions.get_by_role('listitem').filter(has_text='iPad Air')
    checks['sessions-no-page-load-motion'] = tablet.evaluate("el => el.style.transform === ''")
    sessions.get_by_role('button', name='Revoke iPhone 15 session').click()
    page.wait_for_timeout(20)
    checks['sessions-remove-row-immediately'] = sessions.get_by_text('iPhone 15', exact=True).count() == 0
    if mode == 'no-preference':
        try:
            page.wait_for_function("el => el.style.transform !== '' && el.style.transform !== 'none'", arg=tablet.element_handle(), timeout=250)
            checks['sessions-reflow-survivors'] = True
        except Exception:
            checks['sessions-reflow-survivors'] = False
        page.wait_for_timeout(450)
        checks['sessions-reflow-settles'] = tablet.evaluate("el => el.style.transform === '' || el.style.transform === 'none'")
    else:
        checks['sessions-reduced-is-instant'] = tablet.evaluate("el => el.style.transform === '' || el.style.transform === 'none'")

    page.evaluate('window.hooks.resetSessions()')
    page.wait_for_timeout(40)
    sessions.evaluate("el => el.setAttribute('data-motion', 'off')")
    sessions.get_by_role('button', name='Revoke iPhone 15 session').click()
    page.wait_for_timeout(20)
    tablet = sessions.get_by_role('listitem').filter(has_text='iPad Air')
    checks['sessions-local-off-is-instant'] = tablet.evaluate("el => el.style.transform === '' || el.style.transform === 'none'")

    if mode == 'no-preference':
        page.evaluate("window.hooks.setResetStep('request')")
        page.wait_for_timeout(600)
        page.evaluate("window.hooks.setResetStep('confirm')")
        page.wait_for_timeout(20)
        page.evaluate("document.documentElement.setAttribute('data-motion', 'reduced')")
        page.wait_for_timeout(20)
        checks['runtime-reduced-clears-pane-motion'] = reset.locator('[data-auth-motion-phase="leave"]').count() == 0
        reset_frame = reset.locator('[data-auth-motion-frame]')
        reset_live = reset.locator('[data-auth-motion-phase="enter"], [data-auth-motion-phase="rest"]').last
        checks['runtime-reduced-jumps-height'] = abs(reset_frame.evaluate('(el) => el.getBoundingClientRect().height') - reset_live.evaluate('(el) => el.getBoundingClientRect().height')) < 1
        page.evaluate("window.hooks.setPending(false)")
        page.wait_for_timeout(600)
        page.evaluate("document.documentElement.removeAttribute('data-motion')")
        page.wait_for_timeout(20)
        page.evaluate("window.hooks.setPending(true)")
        page.wait_for_timeout(20)
        page.evaluate("document.documentElement.setAttribute('data-motion', 'reduced')")
        page.wait_for_timeout(20)
        checks['runtime-reduced-clears-label-motion'] = pending.locator('button[type="submit"] .cieo-swap-out').count() == 0
        page.evaluate("document.documentElement.removeAttribute('data-motion')")
        page.wait_for_timeout(20)

    # Runtime opt-out must make structural and nested text swaps instant even when the OS allows motion.
    page.locator('#mfa').evaluate("el => el.setAttribute('data-motion', 'off')")
    current_toggle = mfa.get_by_role('button', name='Use a recovery code instead')
    if current_toggle.count():
        current_toggle.click()
    else:
        mfa.get_by_role('button', name='Use the authenticator instead').click()
    page.wait_for_timeout(20)
    checks['local-motion-off-hides-leaver'] = mfa.locator('[data-auth-motion-phase="leave"]').count() == 0 or mfa.locator('[data-auth-motion-phase="leave"]').evaluate(
        "el => getComputedStyle(el).display === 'none'"
    )
    frame = mfa.locator('[data-auth-motion-frame]')
    live_pane = mfa.locator('[data-auth-motion-phase="enter"], [data-auth-motion-phase="rest"]').last
    checks['local-motion-off-jumps-height'] = abs(frame.evaluate('(el) => el.getBoundingClientRect().height') - live_pane.evaluate('(el) => el.getBoundingClientRect().height')) < 1

    page.evaluate('window.hooks.setPending(false)')
    page.wait_for_timeout(450)
    page.evaluate("document.documentElement.setAttribute('data-motion', 'off')")
    page.evaluate('window.hooks.setPending(true)')
    page.wait_for_timeout(20)
    pending_button = pending.locator('button[type="submit"]')
    old_label = pending_button.locator('.cieo-swap-out')
    checks['local-motion-off-hides-old-label'] = old_label.count() == 0 or old_label.evaluate("el => getComputedStyle(el).display === 'none'")
    checks['local-motion-off-instant-label'] = pending_button.locator('.cieo-swap-in').evaluate("el => getComputedStyle(el).animationName === 'none'")
    page.evaluate("document.documentElement.removeAttribute('data-motion')")
    page.wait_for_timeout(20)
    checks['local-motion-toggle-does-not-resurface-old-label'] = pending_button.locator('.cieo-swap-out').count() == 0

    page.evaluate("document.documentElement.setAttribute('data-motion', 'reduced')")
    page.locator('#mfa').evaluate("el => el.removeAttribute('data-motion')")
    page.evaluate("window.hooks.setEmailError('Reduced motion feedback')")
    reduced_message = page.locator('#error .cieo-auth-motion-message')
    reduced_meter = page.locator('#password .cieo-auth-meter')
    reduced_otp = page.locator('#otp .cieo-auth-otp-box').first
    checks['data-motion-reduced-auth-transitions-stop'] = all(
        float(item.strip().removesuffix('s')) == 0
        for item in reduced_message.evaluate("el => getComputedStyle(el).transitionDuration").split(',')
    ) and all(
        float(item.strip().removesuffix('s')) == 0
        for item in reduced_meter.evaluate("el => getComputedStyle(el).transitionDuration").split(',')
    ) and all(
        float(item.strip().removesuffix('s')) == 0
        for item in reduced_otp.evaluate("el => getComputedStyle(el).transitionDuration").split(',')
    )
    checks['data-motion-reduced-keeps-password-geometry'] = reduced_meter.locator('i[data-filled]').first.evaluate(
        "el => Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).a - 1) < 0.01"
    ) and reduced_meter.locator('i:not([data-filled])').last.evaluate(
        "el => Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).a - 0.12) < 0.02"
    )
    password_root = page.locator('#password .cieo-auth-password-input')
    password_root.evaluate("el => el.setAttribute('data-reduced-motion', 'true')")
    checks['local-data-reduced-motion-css-stops-transitions'] = all(
        float(item.strip().removesuffix('s')) == 0
        for item in reduced_meter.locator('i').first.evaluate("el => getComputedStyle(el).transitionDuration").split(',')
    )
    password_root.evaluate("el => el.removeAttribute('data-reduced-motion')")
    page.evaluate("document.documentElement.removeAttribute('data-motion')")

    if mode == 'no-preference':
        page.evaluate("window.hooks.setResetStep('request')")
        page.wait_for_timeout(600)
        page.evaluate("window.hooks.setResetStep('confirm')")
        page.wait_for_timeout(20)
        page.emulate_media(reduced_motion='reduce')
        try:
            page.wait_for_function(
                "document.querySelectorAll('#reset [data-auth-motion-phase=leave]').length === 0",
                timeout=250,
            )
            checks['runtime-os-reduced-settles-existing-pane'] = True
        except Exception:
            checks['runtime-os-reduced-settles-existing-pane'] = False

    if mode == 'reduce':
        page.evaluate("document.documentElement.setAttribute('data-motion', 'full')")
        checks['root-motion-full-overrides-os-css'] = float(
            reduced_meter.locator('i').first.evaluate("el => getComputedStyle(el).transitionDuration.split(',')[0]").removesuffix('s')
        ) > 0
        page.evaluate("window.hooks.setResetStep('request')")
        page.wait_for_timeout(20)
        page.evaluate("window.hooks.setResetStep('confirm')")
        page.wait_for_timeout(20)
        checks['root-motion-full-overrides-os-react'] = reset.locator('[data-auth-motion-pane]').count() == 2
        pane = reset.locator('[data-auth-motion-phase="enter"]')
        checks['root-motion-full-keeps-auth-animation'] = pane.evaluate(
            "el => getComputedStyle(el).animationName !== 'none' && parseFloat(getComputedStyle(el).animationDuration) > 0"
        )
        page.evaluate("document.documentElement.removeAttribute('data-motion')")

    page.locator('#mfa').evaluate("el => el.setAttribute('data-motion', 'reduced')")
    page.wait_for_timeout(30)
    mfa.locator('.cieo-auth-toggle').click()
    page.wait_for_timeout(20)
    local_frame = mfa.locator('[data-auth-motion-frame]')
    local_live = mfa.locator('[data-auth-motion-phase="enter"], [data-auth-motion-phase="rest"]').last
    checks['local-data-motion-reduced-jumps-pane'] = mfa.locator('[data-auth-motion-phase="leave"]').count() == 0 and abs(
        local_frame.evaluate('(el) => el.getBoundingClientRect().height') - local_live.evaluate('(el) => el.getBoundingClientRect().height')
    ) < 1
    page.locator('#mfa').evaluate("el => { el.removeAttribute('data-motion'); el.setAttribute('data-reduced-motion', 'true'); }")
    page.wait_for_timeout(30)
    mfa.locator('.cieo-auth-toggle').click()
    page.wait_for_timeout(20)
    checks['local-data-reduced-motion-jumps-pane'] = mfa.locator('[data-auth-motion-phase="leave"]').count() == 0
    page.locator('#mfa').evaluate("el => el.removeAttribute('data-reduced-motion')")
    checks['no-page-errors'] = not errors
    context.close()
    return {'checks': checks, 'errors': errors}


with tempfile.TemporaryDirectory(prefix='cieo-auth-motion-') as tmp:
    out = pathlib.Path(tmp)
    build(out)
    handler = functools.partial(QuietHandler, directory=tmp)
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            origin = f'http://127.0.0.1:{server.server_port}/'
            report = {mode: run_mode(browser, origin, mode) for mode in ('no-preference', 'reduce')}
            report['browser'] = browser.version
            browser.close()
        print(json.dumps(report, indent=2))
        failed = [f'{mode}:{name}' for mode in ('no-preference', 'reduce') for name, ok in report[mode]['checks'].items() if not ok]
        if failed:
            raise SystemExit('FAILED: ' + ', '.join(failed))
        print('Auth motion checks passed in full and reduced modes.')
    finally:
        server.shutdown()
        server.server_close()
