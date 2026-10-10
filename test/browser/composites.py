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
        checks['no-errors'] = (errors == [])
        b.close()
    print(json.dumps(checks, indent=1))
    ok = all(checks.values()) and len(checks) == 7
    print('COMPOSITES', 'PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
finally:
    srv.terminate()
