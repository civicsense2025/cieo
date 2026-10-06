"""Exercise the real catalogue, not a substituted specimen app.
Run with --offline for a no-network set_content harness; CI uses a local HTTP origin.
"""
import argparse
import functools
import http.server
import json
import os
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--offline', action='store_true')
parser.add_argument('--out', default=str(ROOT / 'artifacts/catalogue-ui'))
args = parser.parse_args()
OUT = Path(args.out); OUT.mkdir(parents=True, exist_ok=True)
HTML = (ROOT / 'docs/library.html').read_text()
checks = []; failures = []; errors = []

def check(name, passed):
    checks.append({'name': name, 'pass': bool(passed)})
    print(('PASS ' if passed else 'FAIL ') + name, flush=True)
    if not passed: failures.append(name)

def load(page):
    page.on('pageerror', lambda e: errors.append(str(e)))
    if args.offline: page.set_content(HTML, wait_until='domcontentloaded')
    else: page.goto(URL, wait_until='domcontentloaded')
    page.wait_for_timeout(600)

def find(page, query):
    page.locator('#l-search').fill(query);page.wait_for_timeout(450)

def reset(page):
    page.locator('#l-search').fill('');page.wait_for_timeout(100)

server = None
if not args.offline:
    handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT))
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
    threading.Thread(target=server.serve_forever,daemon=True).start()
    URL=f'http://127.0.0.1:{server.server_port}/docs/library.html'

with sync_playwright() as p:
    executable=os.environ.get('CHROMIUM_PATH')
    browser=p.chromium.launch(**({'executable_path':executable} if executable else {}),args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1440,'height':1080},reduced_motion='no-preference')
    page=context.new_page();page.set_default_timeout(8000);load(page)
    check('All 345 original atoms are retained',page.evaluate('CieoCatalogue.count===345'))
    check('Offscreen recipe markup is deferred',page.evaluate('CieoCatalogue.initialized<30 && [...document.querySelectorAll(".stage")].filter(s=>s.childElementCount).length<30'))
    check('No recipes fail on initial view',page.evaluate('CieoCatalogue.errors.length===0'))
    page.screenshot(path=str(OUT/'desktop-light.png'))
    find(page,'zz-no-match-at-all')
    check('Search has a real empty state',page.locator('#l-empty').is_visible())
    page.locator('#l-reset').click()
    check('Reset restores all atoms',page.evaluate('CieoCatalogue.visible.length===345'))
    find(page,'Tabs with panel')
    tab=page.locator('#tabs [role=tab]').first;tab.focus();page.keyboard.press('ArrowRight');page.wait_for_timeout(400)
    check('Tabs support arrow selection',page.locator('#tabs [role=tab]').nth(1).get_attribute('aria-selected')=='true')
    page.keyboard.press('End');page.wait_for_timeout(300)
    check('Tabs support End',page.locator('#tabs [role=tab]').nth(2).get_attribute('aria-selected')=='true')
    page.keyboard.press('Home');page.wait_for_timeout(300)
    check('Tabs have one roving tab stop',page.locator('#tabs [role=tab][tabindex="0"]').count()==1)
    find(page,'Switch')
    switch=page.locator('#switch [role=switch]');switch.focus();page.keyboard.press('Space');page.wait_for_timeout(450)
    check('Switch toggles once on Space',switch.get_attribute('aria-checked')=='true')
    before=page.evaluate('CieoCatalogue.initialized')
    page.get_by_role('button',name='Expand Switch',exact=True).click();page.wait_for_timeout(400)
    check('Full preview moves the original stateful atom',page.locator('#l-focus #switch [role=switch]').get_attribute('aria-checked')=='true')
    check('Full preview does not remount recipes',page.evaluate('CieoCatalogue.initialized')==before)
    page.keyboard.press('Escape');page.wait_for_timeout(200)
    check('Closing full preview restores the original tile',page.locator('#l-grid #switch').count()==1)
    check('Closing full preview restores keyboard focus',page.evaluate('document.activeElement.getAttribute("aria-label")==="Expand Switch"'))
    page.get_by_role('button',name='Save Switch',exact=True).click()
    page.locator('[data-category="saved"]').click()
    check('Saved collection filters real atoms',page.evaluate('JSON.stringify(CieoCatalogue.visible)==="[\\"switch\\"]"'))
    if not args.offline:
        page.reload(wait_until='domcontentloaded');page.wait_for_timeout(500)
        check('Favorites survive a real-origin reload',page.locator('#switch [aria-label="Unsave Switch"]').count()==1)
    page.locator('[data-category="all"]').click()
    find(page,'Text field')
    email=page.locator('#field input');email.fill('not-an-email');email.press('Tab');page.wait_for_timeout(400)
    check('Email displays its invalid state',email.get_attribute('aria-invalid')=='true')
    email.fill('studio@example.com');email.press('Tab');page.wait_for_timeout(400)
    check('Email recovers to valid state',email.get_attribute('aria-invalid')=='false')
    find(page,'Dropdown')
    page.locator('#dropdown .dd').focus();page.keyboard.press('ArrowDown');page.wait_for_timeout(100)
    check('Menu ArrowDown transfers focus',page.evaluate('document.activeElement.getAttribute("role")==="menuitem"'))
    page.keyboard.press('ArrowDown');page.keyboard.press('Enter');page.wait_for_timeout(400)
    check('Menu selection closes and restores trigger focus',page.locator('#dropdown .dd').get_attribute('aria-expanded')=='false' and page.evaluate('document.activeElement.classList.contains("dd")'))
    find(page,'Command palette')
    page.locator('#palette input').fill('export');page.locator('#palette input').press('Enter');page.wait_for_timeout(400)
    check('Command palette filters and runs the existing command',page.locator('#palette .ps').inner_text().find('Export content')>=0)
    find(page,'Bottom sheet')
    page.locator('#sheet .op').click();page.wait_for_timeout(400)
    check('Sheet exposes its open state',page.locator('#sheet .op').get_attribute('aria-expanded')=='true')
    page.locator('#sheet .cl').click();page.wait_for_timeout(400)
    check('Sheet has an operable close control',page.locator('#sheet .op').get_attribute('aria-expanded')=='false')
    find(page,'Rubber-band slider');slider=page.locator('#slider [role=slider]');slider.focus();page.keyboard.press('End');page.wait_for_timeout(500)
    check('Slider End reaches 100',slider.get_attribute('aria-valuenow')=='100')
    page.keyboard.press('Home');page.wait_for_timeout(500)
    check('Slider Home reaches 0',slider.get_attribute('aria-valuenow')=='0')
    reset(page);page.locator('#tabs .l-tile-name').click();page.wait_for_timeout(400)
    check('Desktop inspector is contextual and nonmodal',page.locator('#l-inspector').is_visible() and not page.locator('#l-inspect-sheet').is_visible())
    check('Keyboard users enter the desktop inspector',page.evaluate('document.activeElement.id==="l-inspector-heading"'))
    with page.expect_download() as download:
        page.get_by_role('button',name='Download recipe',exact=True).click()
    artifact=download.value
    check('Inspector exports the real recipe',artifact.suggested_filename=='tabs.js' and 'init(st)' in Path(artifact.path()).read_text())
    page.screenshot(path=str(OUT/'desktop-inspector.png'))
    page.set_viewport_size({'width':768,'height':1024});page.wait_for_timeout(400)
    check('Inspector adapts to a tablet dialog',page.locator('#l-inspect-sheet').is_visible())
    page.set_viewport_size({'width':1440,'height':1080});page.wait_for_timeout(400)
    check('Inspector survives a round trip to desktop',page.locator('#l-inspector').is_visible())
    page.locator('#l-inspector-close').click()
    check('Inspector close restores its original opener',page.evaluate('document.activeElement.getAttribute("aria-label")==="Inspect Tabs with panel"'))
    page.locator('#l-view').click();page.locator('[data-setting="theme"][data-value="black"]').click()
    page.locator('[data-setting="accent"][data-value="green"]').click();page.keyboard.press('Escape');page.wait_for_timeout(350)
    check('Appearance changes the real recipe variables',page.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--accent").trim()==="#8cdbaf"'))
    page.screenshot(path=str(OUT/'desktop-dark.png'))
    check('Settings restore focus to their opener',page.evaluate('document.activeElement.id==="l-view"'))
    page.locator('#l-view').click();page.locator('[data-setting="theme"][data-value="white"]').click();page.locator('[data-setting="accent"][data-value="violet"]').click();page.keyboard.press('Escape')
    for width in [320,390,599,768,959,1024,1279,1440,1920]:
        page.set_viewport_size({'width':width,'height':900});page.evaluate('scrollTo(0,0)');page.wait_for_timeout(200)
        check(f'No page overflow at {width}px',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    print("Desktop phase complete",flush=True)
    browser.close()
    browser=p.chromium.launch(**({'executable_path':executable} if executable else {}),args=['--no-sandbox'])
    mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1)
    page=mobile.new_page();load(page);page.screenshot(path=str(OUT/'phone-light.png'))
    page.locator('#l-browse').click();page.wait_for_timeout(300)
    check('Phone collection drawer opens',page.locator('#l-browser').is_visible())
    page.screenshot(path=str(OUT/'phone-collections.png'))
    page.locator('[data-category="writing"]').click();page.wait_for_timeout(300)
    check('Phone category choice closes drawer and filters',not page.locator('#l-browser').is_visible() and page.evaluate('CieoCatalogue.visible.length===59'))
    check('Phone search has 16px input text',page.locator('#l-search').evaluate('e=>parseFloat(getComputedStyle(e).fontSize)>=16'))
    page.locator('#l-view').click();page.wait_for_timeout(300);page.screenshot(path=str(OUT/'phone-settings.png'));page.keyboard.press('Escape')
    check('Phone settings close on Escape',not page.locator('#l-settings').is_visible())
    print("Mobile phase complete",flush=True)
    browser.close()
    browser=p.chromium.launch(**({'executable_path':executable} if executable else {}),args=['--no-sandbox'])
    reduced=browser.new_context(viewport={'width':1440,'height':1080},reduced_motion='reduce')
    page=reduced.new_page();load(page);find(page,'Switch')
    sw=page.locator('#switch [role=switch]');sw.click();page.wait_for_timeout(100)
    check('System reduction is visible in the catalogue',page.locator('#l-playback-status').inner_text()=='Reduced motion')
    check('Reduced motion keeps switch operable',sw.get_attribute('aria-checked')=='true')
    initial=page.locator('#switch .kn').get_attribute('style');page.wait_for_timeout(300)
    check('Reduced motion settles without continuing playback',initial==page.locator('#switch .kn').get_attribute('style'))
    check('No uncaught browser errors',not errors)
    browser.close()
if server:server.shutdown()
report={'mode':'offline set_content' if args.offline else 'local HTTP origin','checks':checks,'failures':failures,'pageerrors':errors,'not_verified':['Safari','Firefox','screen readers','real mobile hardware','real clipboard grants']}
(OUT/'results.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'checks':len(checks),'passed':sum(c['pass'] for c in checks),'failures':failures,'pageerrors':errors},indent=2))
raise SystemExit(bool(failures or errors))
