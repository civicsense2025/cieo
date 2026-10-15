"""NPS scale motion: the plate lands exactly on the chosen option, stays inside the scale while it moves,
and animating it does not force a layout every frame.
Run: python3 test/browser/nps.py   (builds the catalogue into a temp dir; no installs or external requests)
"""
import json, pathlib, subprocess, sys, tempfile
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parents[2]
checks = {}; errors = []
with tempfile.TemporaryDirectory(prefix='cieo-nps-') as tmp:
    page_file = pathlib.Path(tmp) / 'catalogue.html'
    subprocess.run(['node', str(root / 'scripts/build-catalogue.mjs'), str(page_file)], check=True, capture_output=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1400, 'height': 900})
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(page_file.as_uri()); page.wait_for_timeout(800)
        tile = page.locator('#nps'); tile.scroll_into_view_if_needed(); page.wait_for_timeout(600)
        buttons = tile.locator('.ns button')
        geometry = '''i => { const ns = document.querySelector('#nps .ns').getBoundingClientRect();
          const b = document.querySelectorAll('#nps .ns button')[i].getBoundingClientRect();
          const m = getComputedStyle(document.querySelector('#nps .pl')).clipPath.match(/inset\\(([\\d.]+)px ([\\d.]+)px ([\\d.]+)px ([\\d.]+)px/);
          return { want: [b.left - ns.left, ns.width - (b.right - ns.left)], got: [+m[4], +m[2]] } }'''
        def settled_on(i):
            g = page.evaluate(f'({geometry})({i})')
            return all(abs(a - b) < 0.05 for a, b in zip(g['want'], g['got']))
        buttons.nth(2).click(); page.wait_for_timeout(300)
        checks['first-pick-lands-on-option'] = settled_on(2)
        cdp = page.context.new_cdp_session(page); cdp.send('Performance.enable')
        metric = lambda n: next(m['value'] for m in cdp.send('Performance.getMetrics')['metrics'] if m['name'] == n)
        page.evaluate('''() => { window.frames_ = 0; window.escaped = 0; const ns = document.querySelector('#nps .ns');
          (function tick() { window.frames_++; const m = getComputedStyle(document.querySelector('#nps .pl')).clipPath
            .match(/inset\\(([\\d.]+)px ([\\d.]+)px/); if (m && (+m[1] < -0.01 || +m[2] < -0.01)) window.escaped++; requestAnimationFrame(tick); })() }''')
        before = metric('LayoutCount')
        for i in (9, 0, 7, 10, 5, 3):
            buttons.nth(i).click(); page.wait_for_timeout(120)
            buttons.nth((i + 4) % 11).click(); page.wait_for_timeout(700)   # interrupt mid-flight, then settle
            checks[f'interrupted-pick-{(i + 4) % 11}-lands-on-option'] = settled_on((i + 4) % 11)
        frames = page.evaluate('window.frames_')
        checks['no-forced-layout-per-frame'] = (metric('LayoutCount') - before) < frames * 0.25
        checks['plate-never-leaves-the-scale'] = page.evaluate('window.escaped') == 0
        checks['only-chosen-option-is-checked'] = page.evaluate(
            "[...document.querySelectorAll('#nps .ns button')].filter(b => b.getAttribute('aria-checked') === 'true').length") == 1
        browser.close()
checks['no-page-errors'] = not errors
print(json.dumps({'checks': checks, 'errors': errors}, indent=2))
sys.exit(0 if all(checks.values()) and not errors else 1)
