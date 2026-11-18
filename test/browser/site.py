"""Browser test for the published site: every page loads clean, tabs, search and hash links work.
Builds the deploy folder, serves it with Cloudflare-style clean URLs, then drives it with Chromium."""
import http.server, pathlib, shutil, subprocess, sys, threading
from functools import partial
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parents[2]
out = root / '.deploy-lane1'
subprocess.run(['node', 'scripts/build-deploy.mjs', '--out', out.name], cwd=root, check=True, stdout=subprocess.DEVNULL)


class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 256  # a page opens dozens of module requests at once; the default backlog of 5 resets them


class CleanUrls(http.server.SimpleHTTPRequestHandler):
    """Serves /x as x.html or x/index.html, and /site/x as /x (the host's _redirects rule), the way the host does."""
    def translate_path(self, path):
        if path.startswith('/site/'):
            path = path[5:]
        real = super().translate_path(path)
        p = pathlib.Path(real)
        if p.is_dir():
            return real
        if not p.exists() and p.with_name(p.name + '.html').exists():
            return str(p.with_name(p.name + '.html'))
        return real

    def log_message(self, *args):
        pass


srv = Server(('127.0.0.1', 0), partial(CleanUrls, directory=str(out)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{srv.server_port}'

names = lambda folder: sorted(f.stem for f in (out / folder).glob('*.html') if f.stem != 'index')
pages = ['/', '/components/Button', '/components/Grid', '/components/AuthEmailField', '/components/Dialog', '/components/Toast',
         '/composites/'] + [f'/composites/{n}' for n in names('composites')] + \
        ['/foundations/'] + [f'/foundations/{n}' for n in names('foundations')] + \
        ['/recipes/', '/docs/studio/', '/pricing', '/contact']
problems = []
checks = 0


def check(ok, message):
    global checks
    checks += 1
    if not ok:
        problems.append(message)


def visit(browser, url, fn=None):
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900})
    pg = ctx.new_page()
    log = []
    pg.on('pageerror', lambda e: log.append(f'pageerror: {e}'))
    pg.on('console', lambda m: log.append(f'console.{m.type}: {m.text}') if m.type == 'error' else None)
    pg.on('requestfailed', lambda r: log.append(f'request failed: {r.url} {r.failure}'))
    pg.on('response', lambda r: log.append(f'HTTP {r.status}: {r.url}') if r.status >= 400 else None)
    pg.goto(base + url, wait_until='networkidle')
    if fn:
        fn(pg)
        pg.wait_for_timeout(150)
    return ctx, pg, log


def tabs_on_component(pg):
    tabs = pg.locator('.doc-tabs [role="tab"]')
    count = tabs.count()
    check(count == 4, f'{pg.url}: expected 4 tabs, got {count}')
    for i in range(count):
        tab = tabs.nth(i)
        tab.click()
        panel_id = tab.get_attribute('aria-controls')
        visible = [p for p in pg.locator('[role="tabpanel"]').all() if p.is_visible()]
        check(len(visible) == 1 and visible[0].get_attribute('id') == panel_id, f'{pg.url}: tab {panel_id} must show exactly its panel, got {[v.get_attribute("id") for v in visible]}')
        check(tab.get_attribute('aria-selected') == 'true' and tab.get_attribute('tabindex') == '0', f'{pg.url}: {panel_id} tab not selected/tabbable')
        check(pg.locator('.doc-tabs [role="tab"][tabindex="0"]').count() == 1, f'{pg.url}: roving tabindex must leave one tab stop')
        if i > 0:
            text = visible[0].inner_text() if visible else ''
            check(len(text.strip()) > 10, f'{pg.url}: {panel_id} panel is empty')
            fam = pg.evaluate("(el) => getComputedStyle(el).fontFamily", visible[0].element_handle()) if visible else ''
            check('mono' in fam.lower() or 'menlo' in fam.lower() or 'consolas' in fam.lower(), f'{pg.url}: {panel_id} is not monospace ({fam})')
    # arrow keys move selection and focus
    pg.locator('.doc-tabs [role="tab"]').first.click()
    pg.keyboard.press('ArrowRight')
    check(pg.locator('#tab-code').get_attribute('aria-selected') == 'true' and pg.locator('#panel-code').is_visible(), f'{pg.url}: ArrowRight did not open the next tab')
    pg.keyboard.press('End')
    check(pg.locator('#panel-swift').is_visible(), f'{pg.url}: End did not open the last tab')
    pg.keyboard.press('Home')
    check(pg.locator('#panel-preview').is_visible() and not pg.locator('#panel-code').is_visible(), f'{pg.url}: Home did not return to Preview')
    # copy button copies the visible code
    pg.locator('#tab-code').click()
    pg.context.grant_permissions(['clipboard-read', 'clipboard-write'])
    btn = pg.locator('[data-copy-code="panel-code"]')
    check(btn.is_visible(), f'{pg.url}: code panel has no visible copy button')
    btn.click()
    pg.wait_for_timeout(100)
    check(btn.get_attribute('aria-label') == 'Copied', f'{pg.url}: copy button did not confirm')
    check(btn.locator('svg').count() == 2 and btn.inner_text().strip() == '', f'{pg.url}: copy button must be an icon, not text')
    check(pg.evaluate('navigator.clipboard.readText()').strip() == pg.locator('#panel-code code').inner_text().strip(), f'{pg.url}: clipboard text differs from the code panel')
    # deep link
    pg.goto(pg.url.split('#')[0] + '#panel-code')
    pg.wait_for_timeout(150)
    check(pg.locator('#panel-code').is_visible() and not pg.locator('#panel-preview').is_visible(), f'{pg.url}: #panel-code deep link did not open the code tab')


def search_checks(pg):
    trigger = pg.locator('[data-search-open]').first
    for combo in ('Meta+K', 'Control+K'):
        if trigger.count():
            trigger.focus()
        pg.keyboard.press(combo)
        dialog = pg.locator('.site-search-dialog')
        check(dialog.is_visible(), f'{combo}: search dialog did not open')
        pg.keyboard.type('grid')
        pg.wait_for_timeout(300)
        titles = pg.locator('.site-search-title').all_inner_texts()
        check('Grid' in titles, f'{combo}: typing grid did not list Grid ({titles[:6]})')
        pg.keyboard.press('Escape')
        check(not dialog.is_visible(), f'{combo}: Escape did not close search')
        if trigger.count():
            check(pg.evaluate("document.activeElement?.hasAttribute('data-search-open')"), f'{combo}: focus did not return to the search button')


with sync_playwright() as p:
    browser = p.chromium.launch()
    try:
        for url in pages:
            ctx, pg, log = visit(browser, url)
            if url.startswith('/components/'):
                try:
                    pg.wait_for_selector('html[data-playground-ready]', state='attached', timeout=10000)
                except Exception:
                    problems.append(f'{url}: the page script never finished loading')
                else:
                    tabs_on_component(pg)
            if url == '/':
                search_checks(pg)
            h1 = pg.locator('h1').count()
            check(h1 == 1, f'{url}: expected one h1, found {h1}')
            for line in log:
                problems.append(f'{url}: {line}')
            ctx.close()
        # recipes deep link, then a hashchange
        ctx, pg, log = visit(browser, '/recipes/#step')
        pg.wait_for_selector('#step', timeout=5000)
        check(pg.locator('#step').is_visible(), '/recipes/#step: target not visible')
        pg.evaluate("location.hash = '#retarget'")
        pg.wait_for_selector('#retarget', timeout=5000)
        check(pg.locator('#retarget').is_visible(), '/recipes/: hashchange to #retarget did not show it')
        problems.extend(f'/recipes/#hash: {line}' for line in log)
        ctx.close()
        # no text may fall back to a serif platform font (Courier, Times, Georgia...) on the pages people read first
        for url in ['/', '/components/Button', '/composites/', '/foundations/', '/docs/studio/', '/recipes/']:
            ctx, pg, log = visit(browser, url)
            cdp = ctx.new_cdp_session(pg)
            cdp.send('DOM.enable'); cdp.send('CSS.enable')
            root_id = cdp.send('DOM.getDocument', {'depth': -1})['root']['nodeId']
            fonts = set()
            for nid in cdp.send('DOM.querySelectorAll', {'nodeId': root_id, 'selector': 'body *'})['nodeIds'][:1200]:
                try:
                    fonts.update(f['familyName'] for f in cdp.send('CSS.getPlatformFontsForNode', {'nodeId': nid})['fonts'])
                except Exception:
                    pass
            serif = sorted(f for f in fonts if f.lower().startswith(('courier', 'times', 'georgia', 'palatino', 'garamond')))
            check(not serif, f'{url}: text renders in a serif font: {serif}')
            ctx.close()
        # every code block carries an icon copy button that copies the code and plays the spring swap
        for url in ['/', '/foundations/physics', '/components/Button']:
            ctx, pg, log = visit(browser, url)
            ctx.grant_permissions(['clipboard-read', 'clipboard-write'], origin=base)
            blocks = pg.evaluate("[...document.querySelectorAll('pre')].filter(p => p.offsetParent && !p.closest('[hidden]') && !p.matches('[data-fsm-out]')).length")
            covered = pg.evaluate("[...document.querySelectorAll('pre')].filter(p => p.offsetParent && !p.closest('[hidden]') && !p.matches('[data-fsm-out]') && (p.closest('.copy-wrap') || p.closest('.cieo-import-banner') || p.previousElementSibling?.matches('.copy-button'))).length")
            missing = pg.evaluate("[...document.querySelectorAll('pre')].filter(p => p.offsetParent && !p.closest('[hidden]') && !p.matches('[data-fsm-out]') && !(p.closest('.copy-wrap') || p.closest('.cieo-import-banner') || p.previousElementSibling?.matches('.copy-button'))).map(p => p.outerHTML.slice(0, 120))")
            check(blocks == covered, f'{url}: {blocks - covered} visible code block(s) have no copy button: {missing}')
            btn = pg.locator('.copy-button:visible').first
            if btn.count():
                check(not (btn.inner_text() or '').strip(), f'{url}: the copy button must be an icon, not words')
                btn.click()
                pg.wait_for_timeout(200)
                check(btn.evaluate('el => el.hasAttribute("data-copied")') and btn.get_attribute('aria-label') == 'Copied', f'{url}: copy button gave no confirmation')
                check(len(pg.evaluate('navigator.clipboard.readText()')) > 5, f'{url}: copy button put nothing on the clipboard')
                check(btn.evaluate('el => getComputedStyle(el.querySelector(".copy-glyph")).transitionProperty').find('scale') >= 0, f'{url}: copy icon swap is not animated')
            else:
                check(False, f'{url}: no visible copy button found')
            problems.extend(f'{url}: {line}' for line in log)
            ctx.close()
        # the Library page shows every part live, inside its own tile, without opening anything
        ctx, pg, log = visit(browser, '/components/')
        check(pg.locator('.tile').count() >= 250, '/components/: every library part needs a live tile')
        check(pg.evaluate("[...document.querySelectorAll('.tile-stage')].every(s => s.closest('.doc-register') && getComputedStyle(s).contain.includes('paint'))"), '/components/: a tile preview escaped its frame')
        check(pg.evaluate("(() => { const d = document.querySelector('.tile .cieo-dialog'); const t = d?.closest('.tile').getBoundingClientRect(); const r = d?.getBoundingClientRect(); return !!d && r.left >= t.left - 1 && r.right <= t.right + 1; })()"), '/components/: the Dialog tile spills outside its tile')
        check(pg.evaluate("[...document.querySelectorAll('.tile-stage')].every(s => s.inert)"), '/components/: tile previews must be inert so tapping a tile opens the page')
        check(pg.evaluate("new Set([...document.querySelectorAll('[id]')].map(e => e.id)).size === document.querySelectorAll('[id]').length"), '/components/: tile previews repeat an id')
        problems.extend(f'/components/: {line}' for line in log)
        ctx.close()
        # the Studio responds to its controls and fits a 320px phone
        ctx, pg, log = visit(browser, '/docs/studio/')
        btn = pg.locator('#board .cieo-btn').first
        pg.select_option('#radius', 'square')
        square = btn.evaluate('el => getComputedStyle(el).borderTopLeftRadius')
        pg.select_option('#radius', 'pill')
        check(btn.evaluate('el => getComputedStyle(el).borderTopLeftRadius') != square, '/docs/studio/: changing Corners must change the preview buttons')
        problems.extend(f'/docs/studio/: {line}' for line in log)
        ctx.close()
        phone = browser.new_context(viewport={'width': 320, 'height': 800})
        pp = phone.new_page()
        pp.goto(base + '/docs/studio/', wait_until='networkidle')
        check(pp.evaluate('document.documentElement.scrollWidth <= innerWidth'), '/docs/studio/: scrolls sideways at 320px')
        phone.close()
        # the preview controls reach the real components: corners, density, brand and mode each change what is drawn
        def stage_probe(url, selector, prop, control, first, second):
            ctx, pg, log = visit(browser, url)
            el = pg.locator(f'.doc-stage {selector}').first
            pg.select_option(f'select[data-stage-{control}]', first)
            before = el.evaluate(f'e => getComputedStyle(e).{prop}')
            pg.select_option(f'select[data-stage-{control}]', second)
            after = el.evaluate(f'e => getComputedStyle(e).{prop}')
            check(before != after, f'{url}: changing {control} left {prop} at {before}')
            problems.extend(f'{url}: {line}' for line in log)
            ctx.close()
        stage_probe('/components/Badge', '.cieo-badge', 'borderTopLeftRadius', 'radius', 'square', 'pill')
        stage_probe('/components/Card', '.cieo-card', 'borderTopLeftRadius', 'radius', 'square', 'pill')
        stage_probe('/components/Button', '.cieo-btn', 'height', 'density', 'compact', 'spacious')
        stage_probe('/components/Badge', '.cieo-badge', 'color', 'brand', 'iris', 'lagoon')
        stage_probe('/components/Badge', '.cieo-badge', 'backgroundColor', 'scheme', 'light', 'dark')
        ctx, pg, log = visit(browser, '/components/Button')
        stage = pg.locator('.doc-stage').first
        read = lambda: stage.evaluate("e => e.style.getPropertyValue('--cieo-motion-spring-base-w')")
        pg.select_option('select[data-stage-preset]', 'lazy')
        check(read() == '9', '/components/Button: choosing the lazy spring must set the base spring frequency to 9, got ' + repr(read()))
        pg.select_option('select[data-stage-preset]', 'base')
        check(read() == '', '/components/Button: the base spring restores the default tokens')
        ctx.close()
        # desktop shows the nav inline and no menu button; a phone hides the nav behind the two-line button
        ctx, pg, log = visit(browser, '/composites/')
        check(pg.locator('.site-nav a').first.is_visible() and not pg.locator('.site-menu-btn').is_visible(), '/composites/: desktop must show the nav inline and hide the menu button')
        check(pg.evaluate("document.querySelector('.site-header').getBoundingClientRect().height") < 100, '/composites/: desktop header must stay one row')
        ctx.close()
        phone = browser.new_context(viewport={'width': 390, 'height': 800}, has_touch=True)
        pp = phone.new_page()
        pp.goto(base + '/composites/', wait_until='networkidle')
        menu = pp.locator('.site-menu-btn')
        check(menu.is_visible() and not pp.locator('.site-nav a').first.is_visible(), 'phone: the nav must be folded behind the menu button')
        menu.click()
        check(pp.locator('.site-nav a').first.is_visible() and menu.get_attribute('aria-expanded') == 'true', 'phone: the menu button must open the nav')
        pp.keyboard.press('Escape')
        check(not pp.locator('.site-nav a').first.is_visible() and menu.get_attribute('aria-expanded') == 'false', 'phone: Escape must close the menu')
        phone.close()
        # every page fits a phone: no sideways scrolling at 390px
        phone = browser.new_context(viewport={'width': 390, 'height': 800}, has_touch=True)
        for url in pages:
            pp = phone.new_page()
            pp.goto(base + url, wait_until='networkidle')
            check(pp.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'{url}: scrolls sideways at 390px')
            pp.close()
        phone.close()
    finally:
        browser.close()
        srv.shutdown(); srv.server_close()
        shutil.rmtree(out, ignore_errors=True)

for line in problems:
    print('FAIL', line)
print(f'SITE {"PASS" if not problems else "FAIL"}: {len(pages)} pages, {checks} checks, {len(problems)} problems')
sys.exit(1 if problems else 0)
