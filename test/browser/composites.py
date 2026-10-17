import json, subprocess, sys, time, pathlib
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parents[2]
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '4799', '--bind', '127.0.0.1'], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
checks = {}
try:
    time.sleep(0.6)
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page()
        errors = []; pg.on('pageerror', lambda e: errors.append(str(e)))
        # The agent store reports a broken view through console.error instead of throwing, so count those too.
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and not m.text.startswith('Failed to load resource') else None)
        pg.goto('http://127.0.0.1:4799/site/composites/dashboard.html')
        pg.click('[data-nav="settings"]'); pg.fill('input[data-setting="store"]', 'Drift Goods 2')
        pg.click('[data-save]'); checks['settings-panel'] = pg.locator('[data-saved]').is_visible()
        pg.reload()
        checks['settings-persist'] = pg.input_value('input[data-setting="store"]') == 'Drift Goods 2'
        pg.goto('http://127.0.0.1:4799/site/composites/storefront.html')
        pg.click('[data-qty-plus]'); pg.click('[data-qty-plus]'); pg.click('[data-add]')
        pg.check('input[value="express"]')
        checks['cart-total'] = pg.text_content('[data-order-total]').strip() == '$456.00'
        pg.goto('http://127.0.0.1:4799/site/composites/chat.html')
        before = pg.locator('.cieo-chat-message').count()
        pg.fill('[data-input]', 'Hello'); pg.click('[data-send]'); pg.fill('[data-input]', 'Again')
        pg.dblclick('[data-send]', force=True)
        pg.wait_for_timeout(900)
        checks['chat-single-append'] = pg.locator('.cieo-chat-message').count() == before + 2
        pg.goto('http://127.0.0.1:4799/site/composites/booking.html')
        checks['confirm-gated'] = pg.locator('[data-confirm]').is_disabled()
        pg.click('[data-day="2026-10-21"]'); pg.check('input[value="10:30"]')
        pg.fill('[data-name]', 'Amara Okafor'); pg.fill('[data-email]', 'a@example.com')
        pg.click('[data-confirm]')
        checks['booking-ref'] = (pg.text_content('[data-reference]') or '').strip() == 'BK-20261021-1030-AO'
        pg.goto('http://127.0.0.1:4799/site/composites/settings.html')
        pg.fill('[data-setting="name"]', 'Ada Lovelace'); pg.fill('[data-setting="email"]', 'ada@example.com')
        pg.click('[data-save]')
        checks['settings-save'] = pg.locator('[data-saved]').is_visible()
        pg.reload()
        checks['settings-persist'] = pg.input_value('[data-setting="name"]') == 'Ada Lovelace'
        pg.goto('http://127.0.0.1:4799/site/composites/inbox.html')
        pg.click('[data-thread="invoice-1042"]')
        checks['inbox-thread'] = pg.locator('#panel-invoice-1042').is_visible()
        before = pg.locator('#panel-invoice-1042 [data-messages] > *').count()
        pg.fill('[data-reply]', 'Thanks — paid today'); pg.click('[data-send]')
        checks['inbox-reply'] = pg.locator('#panel-invoice-1042 [data-messages] > *').count() == before + 1
        pg.goto('http://127.0.0.1:4799/site/composites/onboarding.html')
        pg.click('[data-next="profile"]')
        pg.fill('[data-name]', 'Ada Lovelace'); pg.fill('[data-email]', 'ada@example.com')
        pg.check('input[name="avatar"] >> nth=0')
        pg.click('[data-next="preferences"]')
        pg.click('[data-theme] >> nth=0')
        pg.select_option('[data-digest]', index=1)
        pg.click('[data-next="done"]')
        checks['onboarding-done'] = pg.locator('[data-step-panel="done"]').is_visible()
        pg.goto('http://127.0.0.1:4799/site/composites/agent-run.html')
        pg.wait_for_selector('[data-approval] [data-approve]', timeout=15000)
        checks['agent-stream-plain'] = 'Writer will ask' in (pg.text_content('[data-message="lead"] [data-text]') or '') and pg.get_attribute('[data-message="lead"]', 'aria-busy') is None
        pg.click('[data-approve]')
        busy_text = pg.text_content('[data-approval] [data-status-text]')
        checks['agent-approval-not-optimistic'] = busy_text == 'Waiting for your decision' and pg.get_attribute('[data-deny]', 'aria-disabled') == 'true'
        pg.wait_for_function("document.querySelector('[data-run-status] [data-label]').textContent === 'Done'", timeout=15000)
        checks['agent-run-done'] = (pg.text_content('[data-approval] [data-status-text]') == 'Approved' and pg.locator('[data-approval] button').count() == 0
            and pg.locator('[data-stop]').is_hidden() and 'Pricing FAQ' in pg.text_content('[data-artifacts]')
            and pg.locator('[data-activity] li[data-seq]').count() >= 12)
        pg.click('[data-replay]'); pg.wait_for_selector('[data-tools] details', timeout=15000)
        pg.click('[data-stop]')
        checks['agent-stop-not-optimistic'] = pg.text_content('[data-run-status] [data-label]') == 'Working' and pg.get_attribute('[data-stop]', 'aria-disabled') == 'true'
        pg.wait_for_function("document.querySelector('[data-run-status] [data-label]').textContent === 'Stopped'", timeout=15000)
        checks['agent-stopped'] = pg.locator('[data-stop]').is_hidden()
        checks['no-errors'] = (errors == [])
        b.close()
    print(json.dumps(checks, indent=1))
    ok = all(checks.values()) and len(checks) == 16
    print('COMPOSITES', 'PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
finally:
    srv.terminate()
