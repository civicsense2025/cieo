"""Local-source Radio and RadioGroup regression; no installs or external requests.
Run: CIEO_ESBUILD=/existing/node_modules/esbuild python3 test/browser/radio.py
"""
import functools, http.server, json, os, pathlib, subprocess, tempfile, threading
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parents[2]
esbuild = os.environ.get('CIEO_ESBUILD', str(root.parent / 'principle/web/node_modules/esbuild'))
with tempfile.TemporaryDirectory(prefix='cieo-radio-') as tmp:
    out = pathlib.Path(tmp)
    subprocess.run(['node', '-e', '''require(process.argv[1]).buildSync({entryPoints:[process.argv[2]],bundle:true,outfile:process.argv[3],jsx:'automatic',nodePaths:[process.argv[4]]})''', esbuild, str(root / 'test/browser/radio.tsx'), str(out / 'fixture.js'), str(root / 'node_modules')], check=True)
    (out / 'controls.css').write_text((root / 'src/controls/controls.css').read_text())
    (out / 'index.html').write_text('<html lang="en"><meta charset="utf-8"><link rel="stylesheet" href="controls.css"><div id="root"></div><script src="fixture.js"></script></html>')
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=tmp)
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    checks = {}; errors = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width': 900, 'height': 900}, reduced_motion='reduce')
            page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(f'http://127.0.0.1:{server.server_port}/') else route.abort())
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(f'http://127.0.0.1:{server.server_port}/')
            for mode in ['uncontrolled', 'controlled']:
                a = page.locator('#' + mode + '-alpha'); b = page.locator('#' + mode + '-beta')
                checks[mode+'-initial'] = b.is_checked() and not a.is_checked()
                checks[mode+'-label'] = page.get_by_role('radio', name=mode+' alpha Radio description', exact=True).count() == 1
                checks[mode+'-description'] = a.evaluate('(el) => document.getElementById(el.getAttribute("aria-describedby")).textContent') == 'Radio description'
                page.locator('#'+mode+'-focus').click()
                checks[mode+'-ref'] = a.evaluate('(el) => document.activeElement === el')
                a.press('Space')
                checks[mode+'-pick'] = a.is_checked() and not b.is_checked()
                checks[mode+'-callbacks'] = page.evaluate('(mode) => window.events.filter(e=>e.startsWith(mode+":"))', mode) == [mode+':group:alpha', mode+':radio:alpha']
                a.press('ArrowRight')
                checks[mode+'-keyboard'] = b.is_checked() and not a.is_checked()
                a.check()
                before = page.evaluate('window.events.length')
                page.locator('#'+mode+'-cancel').check()
                page.locator('#'+mode+' button[type=reset]').click()
                checks[mode+'-cancel-reset'] = a.is_checked() and not b.is_checked()
                page.locator('#'+mode+'-cancel').uncheck()
                page.locator('#'+mode+' button[type=reset]').click()
                page.locator('#'+mode+'-render').click()
                checks[mode+'-reset-rerender'] = (a.is_checked() and not b.is_checked()) if mode == 'controlled' else (b.is_checked() and not a.is_checked())
                checks[mode+'-reset-silent'] = page.evaluate('window.events.length') == before
                checks[mode+'-disabled'] = page.locator('#'+mode+'-disabled').is_disabled()
                if mode == 'controlled':
                    b.check(); page.locator('#'+mode+'-update').click()
                    checks[mode+'-prop-update'] = a.is_checked() and not b.is_checked()
                checks[mode+'-form-data'] = page.evaluate('(mode)=>new FormData(document.getElementById(mode)).get(mode)', mode) == ('alpha' if mode == 'controlled' else 'beta')
            page.locator('#solo-b').check()
            checks['standalone-exclusive'] = page.locator('#solo-b').is_checked() and not page.locator('#solo-a').is_checked()
            checks['different-name-independent'] = page.locator('#other').is_checked()
            checks['standalone-form-data'] = page.evaluate('new FormData(document.getElementById("standalone")).get("solo")') == 'b'
            page.locator('#standalone button[type=reset]').click()
            checks['standalone-reset'] = page.locator('#solo-a').is_checked() and not page.locator('#solo-b').is_checked()
            checks['fieldset-disabled'] = page.locator('#fieldset-radio').is_disabled()
            checks['no-page-errors'] = not errors
            print(json.dumps({'browser': browser.version, 'viewport': [900,900], 'reducedMotion':'reduce', 'checks':checks, 'errors':errors}, indent=2))
            browser.close()
        assert all(checks.values()), 'Radio regression failed'
    finally:
        server.shutdown(); server.server_close()
