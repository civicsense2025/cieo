"""Local-source browser checks for the interactive auth recipe panes and session reflow."""
import functools
import http.server
import json
import pathlib
import tempfile
import threading

from playwright.sync_api import sync_playwright


ROOT = pathlib.Path(__file__).resolve().parents[2]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, _format, *_args):
        pass


def build(out: pathlib.Path):
    runtime = (ROOT / 'atoms/web/runtime.core.js').read_text()
    shared = (ROOT / 'atoms/web/blocks/000-shared.js').read_text()
    wave1 = (ROOT / 'atoms/web/blocks/558-auth-wave1.js').read_text()
    wave2 = (ROOT / 'atoms/web/blocks/559-auth-wave2.js').read_text()
    wave3 = (ROOT / 'atoms/web/blocks/560-auth-wave3.js').read_text()
    bootstrap = """
      const recipeStates = {};
      const mountRecipe = (stageId, recipeId) => {
        const definition = A.find((item) => item.id === recipeId);
        const stage = document.getElementById(stageId);
        stage.innerHTML = definition.html;
        const render = definition.init(stage);
        recipeStates[stageId] = { stage, render };
        render(clock.t);
      };
      mountRecipe('mfa-stage', 'auth-mfa-challenge');
      mountRecipe('magic-stage', 'auth-magic-link');
      mountRecipe('reset-stage', 'auth-reset');
      mountRecipe('passkey-stage', 'auth-passkey');
      mountRecipe('sso-stage', 'auth-sso');
      mountRecipe('invite-stage', 'auth-invite');
      mountRecipe('account-stage', 'auth-account');
      mountRecipe('sessions-stage', 'auth-sessions');
      window.paintRecipes = (t) => {
        clock.t = t;
        for (const item of Object.values(recipeStates)) item.render(t);
      };
      window.recipeReady = true;
    """
    document = f"""<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
      <style>
        .stage {{ width:380px; padding:16px; }}
        .card,.col {{ display:flex; flex-direction:column; }}
      </style>
      <body>
        <section id="mfa-shell"><div id="mfa-stage" class="stage"></div></section>
        <div id="magic-stage" class="stage"></div>
        <div id="reset-stage" class="stage"></div>
        <div id="passkey-stage" class="stage"></div>
        <div id="sso-stage" class="stage"></div>
        <div id="invite-stage" class="stage"></div>
        <div id="account-stage" class="stage"></div>
        <div id="sessions-stage" class="stage"></div>
        <script>{runtime}</script>
        <script>{shared}</script>
        <script>{wave1}</script>
        <script>{wave2}</script>
        <script>{wave3}</script>
        <script>{bootstrap}</script>
      </body></html>"""
    (out / 'recipes.html').write_text(document)


def new_page(browser, origin, reduced_motion='no-preference'):
    context = browser.new_context(viewport={'width': 600, 'height': 1000}, reduced_motion=reduced_motion)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(origin) else route.abort())
    page.goto(origin + 'recipes.html')
    page.wait_for_function('window.recipeReady === true')
    return context, page, errors


def main():
    with tempfile.TemporaryDirectory(prefix='cieo-auth-recipes-') as temp:
        out = pathlib.Path(temp)
        build(out)
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=temp))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        origin = f'http://127.0.0.1:{server.server_port}/'
        report = {}
        try:
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch()

                context, page, errors = new_page(browser, origin)
                mfa = page.locator('#mfa-stage')
                code = mfa.locator('.md-code')
                recovery = mfa.locator('.md-rec')
                mfa.locator('.tg').click()
                report['mfa-focus-handoff'] = page.evaluate('document.activeElement?.id') == 'amf-rc'
                report['mfa-leaver-is-inert-and-hidden'] = code.get_attribute('aria-hidden') == 'true' and code.get_attribute('inert') is not None
                report['mfa-enterer-is-active'] = recovery.get_attribute('aria-hidden') is None and recovery.get_attribute('inert') is None
                page.evaluate('window.paintRecipes(0)')
                report['mfa-focus-survives-first-paint'] = page.evaluate('document.activeElement?.id') == 'amf-rc' and page.locator('#amf-rc').evaluate("el => getComputedStyle(el).visibility === 'visible'")

                reset = page.locator('#reset-stage')
                request_pane = reset.locator('.st-req')
                confirm_pane = reset.locator('.st-cf')
                reset.locator('.em').fill('ava@example.com')
                reset.locator('.go1').click()
                report['reset-focus-handoff'] = page.evaluate('document.activeElement?.id') == 'ars-pw'
                report['reset-leaver-is-inert-and-hidden'] = request_pane.get_attribute('aria-hidden') == 'true' and request_pane.get_attribute('inert') is not None
                report['reset-enterer-is-active'] = confirm_pane.get_attribute('aria-hidden') is None and confirm_pane.get_attribute('inert') is None
                page.evaluate('window.paintRecipes(0)')
                report['reset-focus-survives-first-paint'] = page.evaluate('document.activeElement?.id') == 'ars-pw' and page.locator('#ars-pw').evaluate("el => getComputedStyle(el).visibility === 'visible'")

                invite = page.locator('#invite-stage')
                invite_main = invite.locator('.st-main')
                invite_confirm = invite.locator('.st-cf')
                invite.locator('.dc').click()
                report['invite-focus-handoff'] = page.evaluate("document.activeElement?.textContent?.trim()") == 'Confirm decline'
                report['invite-leaver-is-inert-and-hidden'] = invite_main.get_attribute('aria-hidden') == 'true' and invite_main.get_attribute('inert') is not None
                report['invite-enterer-is-active'] = invite_confirm.get_attribute('aria-hidden') is None and invite_confirm.get_attribute('inert') is None

                account = page.locator('#account-stage')
                account_main = account.locator('.st-main')
                account_confirm = account.locator('.st-cf')
                account.locator('.so').click()
                report['account-focus-handoff'] = page.evaluate("document.activeElement?.textContent?.trim()") == 'Confirm sign out'
                report['account-leaver-is-inert-and-hidden'] = account_main.get_attribute('aria-hidden') == 'true' and account_main.get_attribute('inert') is not None
                report['account-enterer-is-active'] = account_confirm.get_attribute('aria-hidden') is None and account_confirm.get_attribute('inert') is None
                report['pane-errors'] = errors
                context.close()

                context, page, errors = new_page(browser, origin)
                magic = page.locator('#magic-stage')
                magic.evaluate("el => el.setAttribute('data-motion', 'off')")
                magic.locator('.em').fill('ava@example.com')
                magic.locator('.snd').click()
                page.evaluate('window.paintRecipes(0.02)')
                sent = magic.locator('.sm .layer').filter(has_text='Check your inbox for the link.')
                report['magic-link-local-motion-off-jumps-message'] = sent.evaluate("el => Number(el.style.opacity) === 1 && getComputedStyle(el).visibility === 'visible'")
                context.close()

                context, page, errors = new_page(browser, origin)
                passkey = page.locator('#passkey-stage')
                passkey.evaluate("el => el.setAttribute('data-motion', 'reduced')")
                passkey.locator('.pk').click()
                page.evaluate('window.paintRecipes(0.02)')
                waiting = passkey.locator('.pk .layer').filter(has_text='Waiting for your passkey')
                report['passkey-local-motion-reduced-jumps-label'] = waiting.evaluate("el => Number(el.style.opacity) === 1 && getComputedStyle(el).visibility === 'visible'")
                context.close()

                context, page, errors = new_page(browser, origin)
                sso = page.locator('#sso-stage')
                sso.get_by_role('button', name='Continue with Google').click()
                page.evaluate('window.paintRecipes(0.02)')
                page.locator('#sso-stage').evaluate("el => el.setAttribute('data-motion', 'off')")
                page.evaluate('window.paintRecipes(0.03)')
                google = sso.locator('[data-p="google"]')
                wait_label = google.locator('.layer').filter(has_text='Connecting to Google')
                report['sso-motion-change-settles-in-flight-label'] = wait_label.evaluate("el => Number(el.style.opacity) === 1 && getComputedStyle(el).visibility === 'visible'")
                context.close()

                context, page, errors = new_page(browser, origin)
                mfa = page.locator('#mfa-stage')
                code = mfa.locator('.md-code')
                recovery = mfa.locator('.md-rec')
                page.locator('#mfa-shell').evaluate("el => el.setAttribute('data-motion', 'off')")
                mfa.locator('.tg').click()
                page.evaluate('window.paintRecipes(0.02)')
                report['ancestor-motion-off-jumps-pane'] = code.evaluate("el => getComputedStyle(el).visibility === 'hidden'") and abs(
                    mfa.locator('.md-panes').evaluate('(el) => el.getBoundingClientRect().height')
                    - recovery.evaluate('(el) => el.getBoundingClientRect().height')
                ) < 1
                context.close()

                context, page, errors = new_page(browser, origin)
                mfa = page.locator('#mfa-stage')
                code = mfa.locator('.md-code')
                recovery = mfa.locator('.md-rec')
                mfa.evaluate("el => el.setAttribute('data-motion', 'reduced')")
                mfa.locator('.tg').click()
                page.evaluate('window.paintRecipes(0.02)')
                report['local-motion-reduced-jumps-pane'] = code.evaluate("el => getComputedStyle(el).visibility === 'hidden'") and abs(
                    mfa.locator('.md-panes').evaluate('(el) => el.getBoundingClientRect().height')
                    - recovery.evaluate('(el) => el.getBoundingClientRect().height')
                ) < 1
                context.close()

                context, page, errors = new_page(browser, origin)
                mfa = page.locator('#mfa-stage')
                code = mfa.locator('.md-code')
                recovery = mfa.locator('.md-rec')
                page.locator('#mfa-shell').evaluate("el => el.setAttribute('data-reduced-motion', 'true')")
                mfa.locator('.tg').click()
                page.evaluate('window.paintRecipes(0.02)')
                report['ancestor-data-reduced-motion-jumps-pane'] = code.evaluate("el => getComputedStyle(el).visibility === 'hidden'") and abs(
                    mfa.locator('.md-panes').evaluate('(el) => el.getBoundingClientRect().height')
                    - recovery.evaluate('(el) => el.getBoundingClientRect().height')
                ) < 1
                context.close()

                context, page, errors = new_page(browser, origin)
                mfa = page.locator('#mfa-stage')
                code = mfa.locator('.md-code')
                recovery = mfa.locator('.md-rec')
                mfa.locator('.tg').click()
                page.evaluate('window.paintRecipes(0.05)')
                report['transition-started-before-policy-change'] = code.evaluate("el => getComputedStyle(el).visibility === 'visible'")
                page.locator('#mfa-shell').evaluate("el => el.setAttribute('data-motion', 'reduced')")
                page.evaluate('window.paintRecipes(0.06)')
                report['motion-change-settles-pane-and-height'] = code.evaluate("el => getComputedStyle(el).visibility === 'hidden'") and abs(
                    mfa.locator('.md-panes').evaluate('(el) => el.getBoundingClientRect().height')
                    - recovery.evaluate('(el) => el.getBoundingClientRect().height')
                ) < 1
                context.close()

                context, page, errors = new_page(browser, origin)
                mfa = page.locator('#mfa-stage')
                code = mfa.locator('.md-code')
                recovery = mfa.locator('.md-rec')
                page.evaluate('window.paintRecipes(0)')
                page.emulate_media(reduced_motion='reduce')
                mfa.locator('.tg').click()
                page.evaluate('window.paintRecipes(0.02)')
                report['runtime-os-reduced-jumps-pane'] = code.evaluate("el => getComputedStyle(el).visibility === 'hidden'") and abs(
                    mfa.locator('.md-panes').evaluate('(el) => el.getBoundingClientRect().height')
                    - recovery.evaluate('(el) => el.getBoundingClientRect().height')
                ) < 1
                context.close()

                context, page, errors = new_page(browser, origin, reduced_motion='reduce')
                mfa = page.locator('#mfa-stage')
                code = mfa.locator('.md-code')
                page.evaluate("document.documentElement.setAttribute('data-motion', 'full')")
                mfa.locator('.tg').click()
                page.evaluate('window.paintRecipes(0.02)')
                report['root-motion-full-overrides-os-reduced'] = code.evaluate("el => getComputedStyle(el).visibility === 'visible'")
                context.close()

                context, page, errors = new_page(browser, origin)
                sessions = page.locator('#sessions-stage')
                rows = sessions.locator('.rows')
                rows.evaluate("el => { const [mac, phone, tablet] = [...el.children]; el.replaceChildren(phone, tablet, mac); }")
                page.evaluate('window.paintRecipes(0)')
                mac = rows.get_by_role('listitem').filter(has_text='MacBook Pro')
                rows.get_by_role('button', name='Revoke iPhone 15 session').click()
                page.evaluate('window.paintRecipes(0)')
                page.evaluate('window.paintRecipes(0.03)')
                before_second_revoke = mac.bounding_box()['y']
                rows.get_by_role('button', name='Revoke iPad Air session').click()
                page.evaluate('window.paintRecipes(0.03)')
                after_second_revoke = mac.bounding_box()['y']
                report['rapid-session-reflow-preserves-live-position'] = abs(after_second_revoke - before_second_revoke) < 1
                context.close()

                browser.close()
        finally:
            server.shutdown()
            server.server_close()

        print(json.dumps(report, indent=2))
        failures = [name for name, value in report.items() if value is False or isinstance(value, list) and value]
        if failures:
            raise SystemExit('FAILED: ' + ', '.join(failures))
        print('Auth recipe browser checks passed.')


if __name__ == '__main__':
    main()
