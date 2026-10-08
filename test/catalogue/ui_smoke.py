"""Exercise the real catalogue, not a parallel specimen application.
CI uses HTTP; CIEO_DOCUMENT_ONLY=1 supports restricted local browser sandboxes.
Optional CHROMIUM_EXECUTABLE supplies an existing system browser.
"""
import functools
import http.server
import json
import os
import pathlib
import subprocess
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'review-artifact' / 'ui'
OUT.mkdir(parents=True, exist_ok=True)
subprocess.run(['node', 'scripts/build-collection.mjs'], cwd=ROOT, check=True)
HTML = (ROOT / 'docs/collection.html').read_text()
DOCUMENT_ONLY = os.environ.get('CIEO_DOCUMENT_ONLY') == '1'
checks = []
RECIPES = json.loads(subprocess.check_output(['node', 'test/catalogue/registry.mjs'], cwd=ROOT, text=True))
EXPECTED_IDS = [recipe['id'] for recipe in RECIPES]
EXPECTED_COUNT = len(EXPECTED_IDS)


def check(name, condition):
    if not condition:
        raise AssertionError(name)
    checks.append(name)
    print("PASS", name, flush=True)


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/docs/collection.html'

with sync_playwright() as p:
    launch = {'headless': True}
    if os.environ.get('CHROMIUM_EXECUTABLE'):
        launch['executable_path'] = os.environ['CHROMIUM_EXECUTABLE']
    browser = p.chromium.launch(**launch)

    def load(width=1440, height=1000, **options):
        page = browser.new_page(viewport={'width': width, 'height': height}, **options)
        page.set_default_timeout(7000)
        page.errors = []
        page.on('pageerror', lambda error: page.errors.append(str(error)))
        if DOCUMENT_ONLY:
            page.set_content(HTML, wait_until='domcontentloaded')
        else:
            page.goto(url, wait_until='domcontentloaded')
        page.wait_for_function('!!window.CIEO_REVIEW')
        page.wait_for_timeout(300)
        return page

    def search(page, text):
        page.locator('#atom-search').fill(text)
        page.wait_for_timeout(150)

    page = load()
    check('Every declared atom is registered exactly once', page.evaluate('CIEO_REVIEW.ids') == EXPECTED_IDS and len(set(EXPECTED_IDS)) == EXPECTED_COUNT)
    check('Initial rendering is lazy', page.evaluate('A.filter(a=>a.inited).length < 40'))
    page.evaluate('CIEO_REVIEW.initAll()')
    page.wait_for_timeout(500)
    check('All declared atom initializers complete', page.evaluate('CIEO_REVIEW.errors().length === 0 && A.every(a=>a.inited)'))
    failures = page.evaluate('''() => {
        const failures=[];
        for(const a of A) if(a.render) for(const dt of [0,.1,1]) {
          try { a.render(clock.t+dt); } catch(error) { failures.push([a.id,error.message]); }
        }
        return failures;
    }''')
    check('All registered render functions tolerate three sampled frames', not failures)
    check('Pricing recipe CSS no longer positions the picker preset row', page.locator('#colorpicker .ps').evaluate("e=>getComputedStyle(e).position === 'static'"))
    check('The picker presets remain in a horizontal row', page.locator('#colorpicker .ps').evaluate("e=>getComputedStyle(e).flexDirection === 'row'"))
    page.screenshot(path=str(OUT / 'desktop.png'))

    search(page, 'rubber-band slider')
    check('Search filters actual recipes', page.locator('#groups > .tile:visible').count() == 1)
    check('Search retains the matching atom identity', page.locator('#slider').is_visible())
    search(page, 'no-such-cieo-atom')
    check('An empty search presents recovery', page.locator('#empty-state').is_visible())
    page.locator('#clear-filters').click()
    expect(page.locator('#count')).to_have_text(f'{EXPECTED_COUNT} atoms')
    page.locator('[data-family=D]').click()
    check('Family filtering applies to the full registry', page.evaluate("A.filter(a=>!a.el.hidden).every(a=>a.fam.includes('D'))"))
    page.locator('[data-family="*"]').click()

    search(page, 'Switch / Toggle primitive')
    toggle = page.locator('#switch .tg')
    toggle.click()
    expect(toggle).to_have_attribute('aria-checked', 'true')
    toggle.focus(); page.keyboard.press('Space')
    expect(toggle).to_have_attribute('aria-checked', 'false')
    check('Switch pointer and Space activation toggle once', True)
    toggle.click()
    page.locator('[data-save=switch]').click()
    expect(page.locator('[data-save=switch]')).to_have_attribute('aria-pressed', 'true')
    check('Save acts on the real atom', page.evaluate("CieoCatalogue.favorites.has('switch')"))
    page.evaluate("window.testSwitch = document.querySelector('#switch .tg')")
    page.locator('[data-inspect=switch]').last.click()
    expect(page.locator('#inspect-dialog')).to_be_visible()
    check('Inspector moves one live stage without cloning', page.locator('#switch .tg').count() == 0 and page.evaluate("window.testSwitch === document.querySelector('#inspect-dialog .tg')"))
    check('Inspector preserves active atom state', page.locator('#inspect-dialog .tg').get_attribute('aria-checked') == 'true')
    check('Inspector keeps the original gallery footprint', page.locator('#switch .ui-preview-placeholder').count() == 1)
    check('Inspector links to this atom source', page.locator('#inspect-source').get_attribute('href').endswith('blocks/038-switch.js'))
    for _ in range(10):
        page.keyboard.press('Tab')
        check(f'Inspector traps keyboard focus {len(checks)}', page.evaluate("document.activeElement.closest('#inspect-dialog') !== null"))
    page.screenshot(path=str(OUT / 'inspector.png'))
    page.keyboard.press('Escape')
    expect(page.locator('#inspect-dialog')).not_to_be_visible()
    check('Closing restores the live stage and value', page.locator('#switch .tg').get_attribute('aria-checked') == 'true')
    check('Closing restores focus to its trigger', page.evaluate("document.activeElement.matches('[data-inspect=switch]')"))

    search(page, 'Tabs with panel')
    page.locator('#tabs [role=tab]').first.focus(); page.keyboard.press('ArrowRight')
    expect(page.locator('#tabs [role=tab]').nth(1)).to_have_attribute('aria-selected', 'true')
    page.keyboard.press('End')
    expect(page.locator('#tabs [role=tab]').last).to_have_attribute('aria-selected', 'true')
    check('Tabs support roving arrows and End', True)
    search(page, 'Command palette')
    page.locator('#palette input').fill('theme')
    page.keyboard.press('Enter')
    expect(page.locator('#palette .ps')).to_contain_text('Toggle theme')
    check('The original command filtering and selection still work', True)
    search(page, 'Color picker')
    hue = page.locator('#colorpicker .hu'); hue.focus(); page.keyboard.press('End')
    check('The color picker exposes keyboard hue adjustment', hue.get_attribute('role') == 'slider')
    search(page, 'Accordion')
    page.locator('#accordion button').first.click()
    expect(page.locator('#accordion button').first).to_have_attribute('aria-expanded', 'true')
    check('Accordion exposes its expanded state', True)

    search(page, '')
    page.locator('.ui-topbar [data-open=appearance-dialog]').click()
    page.get_by_role('button', name='Dark', exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-appearance', 'dark')
    page.get_by_role('button', name='Coral accent', exact=True).click()
    check('Accent is applied to the existing preview scope', page.locator('#switch').evaluate("e=>getComputedStyle(e).getPropertyValue('--accent').trim() === '#edb5a4'"))
    page.keyboard.press('Escape')
    page.screenshot(path=str(OUT / 'dark.png'))
    check('No uncaught desktop errors', not page.errors)
    page.close()

    for width in [320, 375, 390, 768, 1024, 1440, 1920]:
        page = load(width, 960, has_touch=width < 1024)
        check(f'No document overflow at {width}px', page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
        check(f'All atoms remain registered at {width}px', page.evaluate('CIEO_REVIEW.ids') == EXPECTED_IDS)
        if width in [390, 768]:
            page.screenshot(path=str(OUT / f'{"phone" if width == 390 else "tablet"}.png'))
        if width < 1024:
            page.locator('.ui-topbar [data-open=browse-dialog]').click()
            expect(page.locator('#browse-dialog')).to_be_visible()
            page.locator('#mobile-nav a[href="#cat-writing"]').click()
            expect(page.locator('#collection-title')).to_have_text('Writing')
            check(f'Category navigation and legacy hashes work at {width}px', page.evaluate("A.filter(a=>!a.el.hidden).every(a=>a.cat==='Writing')"))
            expect(page.locator('#browse-dialog')).not_to_be_visible()
            page.locator('#goalring [data-inspect]').last.click()
            expect(page.locator('#inspect-dialog')).to_be_visible()
            check(f'The inspector fits {width}px', page.locator('#inspect-dialog').evaluate('e=>e.getBoundingClientRect().width <= innerWidth'))
            if width == 390:
                page.screenshot(path=str(OUT / 'phone-inspector.png'))
            page.keyboard.press('Escape')
        check(f'No uncaught errors at {width}px', not page.errors)
        page.close()

    page = load(reduced_motion='reduce')
    before = page.evaluate('clock.t'); page.wait_for_timeout(250)
    check('Reduced motion does not advance the idle preview clock', page.evaluate('clock.t') == before)
    check('Reduced motion disables the speed control', page.locator('#motion-speed').is_disabled())
    search(page, 'Switch / Toggle primitive'); page.locator('#switch .tg').click()
    expect(page.locator('#switch .tg')).to_have_attribute('aria-checked', 'true')
    check('Reduced motion retains interaction state changes', True)
    page.close()
    page = load(forced_colors='active')
    check('Forced colors retain visible chrome boundaries', page.locator('.ui-chip[aria-pressed=true]').evaluate("e=>getComputedStyle(e).borderTopStyle !== 'none'"))
    page.close(); browser.close()
server.shutdown()
report = {'passed': len(checks), 'failed': 0, 'mode': 'document-only' if DOCUMENT_ONLY else 'http', 'checks': checks}
(OUT / 'results.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
