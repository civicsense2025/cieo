import json, sys, pathlib, http.server, threading
from functools import partial
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parents[2]
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), partial(http.server.SimpleHTTPRequestHandler, directory=str(root)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page()
        errors = []; pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(f'http://127.0.0.1:{srv.server_port}/test/browser/smoke.html'); pg.wait_for_function('window.__out && window.__out.done', timeout=15000)
        out = pg.evaluate('window.__out'); b.close()
    print(json.dumps(out, indent=1)); print('errors', errors)
    ok = (0 < float(out['swapMid']) < 1 and out['swapEnd'] == ['Published', None] and out['digits'] == ['10', 0]
          and out['flipMid'] not in ('', None) and out['flipEnd'] == 'height: 20px;' and out['exitEnd'] is True
          and 'scaleX' in out['edgesMid'] and out['dialogCentered'] and out['reduced'] == 'Instant' and not errors)
    print('SMOKE', 'PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
finally:
    srv.shutdown(); srv.server_close()
