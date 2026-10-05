import json, subprocess, sys, time, pathlib
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parents[2]
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '4799', '--bind', '127.0.0.1'], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    time.sleep(0.6)
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page()
        errors = []; pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto('http://127.0.0.1:4799/test/browser/smoke.html'); pg.wait_for_function('window.__out && window.__out.done', timeout=15000)
        out = pg.evaluate('window.__out'); b.close()
    print(json.dumps(out, indent=1)); print('errors', errors)
    ok = (0 < float(out['swapMid']) < 1 and out['swapEnd'] == ['Published', None] and out['digits'] == ['10', 0]
          and out['flipMid'] not in ('', None) and out['flipEnd'] == 'height: 20px;' and out['exitEnd'] is True
          and 'scaleX' in out['edgesMid'] and out['reduced'] == 'Instant' and not errors)
    print('SMOKE', 'PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
finally:
    srv.terminate()
