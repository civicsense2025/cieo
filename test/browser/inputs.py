"""Local-source input regression; no installs or external requests.
Run: CIEO_ESBUILD=/existing/node_modules/esbuild python3 test/browser/inputs.py
"""
import functools, http.server, json, os, pathlib, subprocess, tempfile, threading
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parents[2]
esbuild = os.environ.get('CIEO_ESBUILD', str(root.parent / 'principle/web/node_modules/esbuild'))
with tempfile.TemporaryDirectory(prefix='cieo-inputs-') as tmp:
    out = pathlib.Path(tmp)
    subprocess.run(['node', '-e', '''require(process.argv[1]).buildSync({entryPoints:[process.argv[2]],bundle:true,outfile:process.argv[3],jsx:'automatic',nodePaths:[process.argv[4]]})''', esbuild, str(root / 'test/browser/inputs.tsx'), str(out / 'fixture.js'), str(root / 'node_modules')], check=True)
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
            for kind in ['field', 'area', 'search']:
                for mode in ['controlled', 'uncontrolled']:
                    id = f'{kind}-{mode}'; control = page.locator('#' + id)
                    initial_height = control.evaluate('(el) => el.getBoundingClientRect().height')
                    control.press_sequentially('abc')
                    checks[id + '-typing'] = control.input_value() == 'abc'
                    checks[id + '-label'] = page.get_by_label(id, exact=True).count() == 1
                    page.locator('#' + id + '-form button[type=reset]').focus()
                    ev = page.evaluate('(id) => window.events[id]', id)
                    for event in ['change', 'input', 'inputCapture', 'blur', 'blurCapture']:
                        checks[id + '-' + event] = ev.count(event + ':abc') == 1
                    checks[id + '-change-sequence'] = [s for s in ev if s.startswith('change:')] == ['change:a', 'change:ab', 'change:abc']
                    page.locator('#' + id + '-focus').click()
                    checks[id + '-ref'] = control.evaluate('(el) => el === document.activeElement')
                    if kind != 'search':
                        checks[id + '-valid'] = control.locator('xpath=ancestor::div[contains(@class,"cieo-field")][last()]').get_attribute('data-status') == 'valid'
                        control.fill('x'); control.press('Tab')
                        checks[id + '-invalid'] = control.get_attribute('aria-invalid') == 'true'
                        checks[id + '-error-description'] = control.evaluate('(el) => el.getAttribute("aria-describedby").split(" ").map(id => document.getElementById(id).textContent).join(" ")') == 'Description Use three characters'
                        status_events = page.evaluate('(id) => window.events[id].filter(e => e.startsWith("status:"))', id)
                        checks[id + '-status-sequence'] = status_events == ['status:valid', 'status:neutral', 'status:invalid']
                        control.fill('abcd')
                        checks[id + '-recover'] = control.get_attribute('aria-invalid') is None
                    if kind == 'search':
                        control.press('Enter')
                        ev = page.evaluate('(id) => window.events[id]', id)
                        checks[id + '-enter-order'] = ev[-3:] == ['search:abc', 'enter', 'submit']
                        page.locator('#' + id + '-form .cieo-search-clear').click()
                        checks[id + '-clear-value'] = control.input_value() == ''
                        checks[id + '-clear-events'] = page.evaluate('(id) => window.events[id].filter(e => e === "change:").length === 1 && window.events[id].at(-1) === "clear"', id)
                    if mode == 'controlled':
                        page.locator('#' + id + '-update').click()
                        checks[id + '-prop-update'] = control.input_value() == 'updated'
                        if kind == 'search': checks[id + '-prop-filled'] = page.locator('#' + id + '-form .cieo-search').get_attribute('data-filled') == 'true'
                        if kind == 'area': checks[id + '-prop-count'] = page.locator('#' + id + '-form .cieo-field-count').inner_text().strip() == '7'
                    control.fill('cancelled' if kind == 'search' else 'x')
                    control.press('Tab')
                    page.locator('#' + id + '-cancel').check()
                    page.locator('#' + id + '-form button[type=reset]').click()
                    checks[id + '-cancelled-reset'] = control.input_value() == ('cancelled' if kind == 'search' else 'x')
                    if kind != 'search': checks[id + '-cancelled-status'] = control.get_attribute('aria-invalid') == 'true'
                    page.locator('#' + id + '-cancel').uncheck()
                    if mode == 'controlled':
                        page.locator('#' + id + '-form button[type=reset]').click()
                        checks[id + '-controlled-reset-value'] = control.input_value() == ('cancelled' if kind == 'search' else 'x')
                    if mode == 'uncontrolled':
                        if kind == 'area':
                            control.fill('one\ntwo\nthree\nfour\nfive\nsix')
                            expanded_height = control.evaluate('(el) => el.getBoundingClientRect().height')
                            checks[id + '-growth'] = expanded_height > initial_height
                        page.locator('#' + id + '-form button[type=reset]').click()
                        checks[id + '-reset'] = control.input_value() == ''
                        if kind != 'search':
                            page.wait_for_function('(id) => !document.getElementById(id).hasAttribute("aria-invalid")', arg=id)
                            checks[id + '-reset-status'] = control.get_attribute('aria-invalid') is None
                        if kind == 'area':
                            page.wait_for_function('(id) => document.querySelector("#" + id + "-form .cieo-field-count").textContent.trim() === "0"', arg=id)
                            checks[id + '-reset-count'] = page.locator('#' + id + '-form .cieo-field-count').inner_text().strip() == '0'
                            checks[id + '-reset-height'] = abs(control.evaluate('(el) => el.getBoundingClientRect().height') - initial_height) < 1
                        if kind == 'search':
                            page.wait_for_function('(id) => document.querySelector("#" + id + "-form .cieo-search-clear").getAttribute("aria-hidden") === "true"', arg=id)
                            clear = page.locator('#' + id + '-form .cieo-search-clear')
                            checks[id + '-reset-clear'] = clear.get_attribute('aria-hidden') == 'true' and clear.get_attribute('tabindex') == '-1' and clear.get_attribute('data-on') is None
                            checks[id + '-reset-clear-presentation'] = clear.evaluate('(el) => getComputedStyle(el).pointerEvents === "none"')
            checks['no-page-errors'] = not errors
            print(json.dumps({'browser': browser.version, 'viewport': [900,900], 'reducedMotion':'reduce', 'checks':checks, 'errors':errors}, indent=2))
            browser.close()
        assert all(checks.values()), 'Input regression failed'
    finally:
        server.shutdown(); server.server_close()
