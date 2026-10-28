"""Real-browser Popover and tab customization checks, with both motion preferences."""
import functools, http.server, os, pathlib, shutil, subprocess, tempfile, threading
from playwright.sync_api import sync_playwright, expect

root = pathlib.Path(__file__).resolve().parents[2]
esbuild = os.environ.get('CIEO_ESBUILD', str(root.parent/'principle/web/node_modules/esbuild'))
with tempfile.TemporaryDirectory(prefix='cieo-popover-') as directory:
    out = pathlib.Path(directory)
    subprocess.run(['node', '-e', 'require(process.argv[1]).buildSync({entryPoints:[process.argv[2]],bundle:true,outfile:process.argv[3],jsx:"automatic",nodePaths:[process.argv[4]]})', esbuild, str(root/'test/browser/popover.tsx'), str(out/'fixture.js'), str(root/'node_modules')], check=True)
    shutil.copyfile(root/'design/styles/primitives/popover.css', out/'popover.css')
    (out/'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="popover.css"><style>button{min-height:44px} .tabs{display:flex;gap:12px;position:relative}.marker{position:absolute;height:3px;bottom:0}</style><body><div id="root"></div><script src="fixture.js"></script></body></html>')
    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args): pass
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=directory))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for motion in ['reduce', 'no-preference']:
                page = browser.new_page(viewport={'width':390,'height':640}, reduced_motion=motion)
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.goto(f'http://127.0.0.1:{server.server_port}')
                page.get_by_role('button',name='Prevent open',exact=True).click()
                expect(page.get_by_role('dialog')).to_have_count(0)
                trigger = page.get_by_role('button',name='Edge',exact=True)
                trigger.click()
                panel = page.get_by_role('dialog',name='Edge panel')
                expect(panel).to_be_visible()
                page.wait_for_timeout(450 if motion == 'no-preference' else 30)
                bounds = panel.bounding_box()
                assert bounds['x'] >= 11 and bounds['y'] >= 11, bounds
                assert bounds['x'] + bounds['width'] <= 379 and bounds['y'] + bounds['height'] <= 629, bounds
                assert panel.evaluate('(el) => el.parentElement.parentElement === document.body')
                expect(panel.get_by_role('heading',name='Actions')).to_be_visible()
                panel.get_by_role('button',name='First action').focus()
                page.keyboard.press('Escape')
                expect(panel).not_to_be_visible()
                expect(trigger).to_be_focused()
                trigger.click(); page.get_by_role('button',name='Outside',exact=True).click()
                expect(panel).not_to_be_visible()
                for _ in range(3): trigger.click()
                expect(panel).to_be_visible()
                page.set_viewport_size({'width':320,'height':480})
                page.wait_for_timeout(450 if motion == 'no-preference' else 30)
                bounds = panel.bounding_box()
                assert bounds['x'] >= 11 and bounds['x'] + bounds['width'] <= 309, bounds
                page.keyboard.press('Escape')
                page.get_by_role('button',name='Toggle tabs',exact=True).click()
                expect(page.locator('.marker')).to_have_css('width', page.get_by_role('tab',name='First',exact=True).evaluate('(el) => `${el.offsetWidth}px`'))
                page.get_by_role('tab',name='First',exact=True).focus()
                page.keyboard.press('ArrowRight')
                expect(page.get_by_role('tab',name='Second',exact=True)).to_have_attribute('aria-selected','true')
                expect(page.get_by_role('tabpanel',name='Second',exact=True)).to_be_visible()
                assert not errors, errors
                page.close()
                print(f'PASS: popover slots, clipping escape, flip, resize, dismissal, focus, tabs; motion={motion}')
            browser.close()
    finally:
        server.shutdown()
