"""Catalogue atoms never read layout inside their frame loop.
A frame loop that reads offset*/client*/getBoundingClientRect after writing styles forces a layout every frame, which is what made
motion jagged under load. Each tile below is shown alone, its controls are clicked, and every layout read made while the tile's
render function runs is counted. Reads that are the one-time first measurement of an element (size()) are not counted.
Atoms in LIVE_TRACKING read the live position or content height of other elements by design (a cursor following a moving target, a card
sized to fit growing content); caching those would lag a frame behind, so they are listed here rather than skipped silently.
Run: python3 test/browser/frame-reads.py   (builds the catalogue into a temp dir; no installs or external requests)
"""
import pathlib, subprocess, sys, tempfile
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parents[2]
LIVE_TRACKING = {
    'onboarding', 'funnel', 'header-search', 'footer-columns', 'footer-newsletter', 'fz5-app', 'agentpin',
    'evidencecapture', 'suggestededit', 'agentqueue', 'approvalinline', 'runreplay', 'pageeditor', 'scrollfade',
    'connectorlist', 'activityfeed', 'presencebar', 'agentthread', 'handoff', 'agentscroll-map', 'header-spread',
    'header-split', 'header-three', 'header-stacked', 'header-shrink', 'header-autohide', 'header-overlay',
    'header-pill', 'header-announce', 'header-minimal'}
GATED = '''nps step retarget accordion alert stepper line marquee player field dialog slider longpage booking contextmenu pagination
dropzone range slashmenu selectresize threadstack newposts cluster tabstrip tabs signature stepheader faqacc springplay
easingcompare durationladder staggerlab reducemotion tokeninspector framemeter issuearchive confirmhold listdetail inbox
siteheader disclosure consent oauthgrant toolapproval toolpermissions apikeyreveal planprogress reviewsummary'''.split()
INSTRUMENT = '''() => { window.__reads = 0; window.__in = 0; const P = Element.prototype;
  const count = () => { if (window.__in && !/szRead/.test(new Error().stack)) window.__reads++; };
  for (const k of ['offsetLeft','offsetTop','offsetWidth','offsetHeight','clientWidth','clientHeight','scrollWidth','scrollHeight']) {
    const host = Object.getOwnPropertyDescriptor(HTMLElement.prototype, k) ? HTMLElement.prototype : P, d = Object.getOwnPropertyDescriptor(host, k);
    if (d) Object.defineProperty(host, k, { get() { count(); return d.get.call(this); }, configurable: true }); }
  const g = P.getBoundingClientRect; P.getBoundingClientRect = function () { count(); return g.call(this); }; }'''
failures = {}; errors = []; checks = {}
with tempfile.TemporaryDirectory(prefix='cieo-frames-') as tmp:
    page_file = pathlib.Path(tmp) / 'catalogue.html'
    subprocess.run(['node', str(root / 'scripts/build-catalogue.mjs'), str(page_file)], check=True, capture_output=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1400, 'height': 900})
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.add_init_script('(' + INSTRUMENT + ')()')
        page.goto(page_file.as_uri()); page.wait_for_timeout(1200)
        known = set(page.evaluate("[...document.querySelectorAll('article.tile')].map(t => t.id)"))
        checks['every-gated-atom-exists'] = not [i for i in GATED + sorted(LIVE_TRACKING) if i not in known]
        for atom in GATED:
            if atom not in known: continue
            page.evaluate("id => { document.querySelectorAll('article.tile').forEach(t => t.style.display = t.id === id ? '' : 'none'); document.getElementById(id).scrollIntoView(); }", atom)
            page.wait_for_timeout(900)
            n = page.evaluate("""id => { const a = A.find(x => x.id === id);
              if (a && a.render && !a.wrapped) { const r = a.render; a.render = t => { window.__in = 1; try { return r(t); } finally { window.__in = 0; } }; a.wrapped = 1; }
              const st = document.querySelector('#' + id + ' .stage');
              const c = [...st.querySelectorAll('button,[role=tab],[role=radio],[role=switch],[role=option],summary,input')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && !e.disabled; });
              c.forEach((e, i) => e.setAttribute('data-fr', i)); window.__reads = 0; return Math.min(c.length, 6); }""", atom)
            for i in range(n):
                try: page.locator(f'#{atom} .stage [data-fr="{i}"]').first.click(timeout=800, force=True)
                except Exception: pass
                page.wait_for_timeout(450)
            page.wait_for_timeout(300)
            reads = page.evaluate('window.__reads')
            if reads: failures[atom] = reads
        checks['no-layout-reads-in-frame-loops'] = not failures
        # the shared catalogue loop must not measure off-screen tiles or re-set the hidden attribute every frame
        page.evaluate("document.querySelectorAll('article.tile').forEach(t => t.style.display = '')"); page.wait_for_timeout(600)
        scrim = page.evaluate('''() => new Promise(done => { let n = 0; const m = new MutationObserver(r => { n += r.length; });
          m.observe(document.getElementById('focusScrim'), { attributes: true, attributeFilter: ['hidden'] }); setTimeout(() => done(n), 600); })''')
        checks['focus-scrim-hidden-attribute-quiet'] = scrim == 0
        browser.close()
for k, v in checks.items(): print(('PASS ' if v else 'FAIL ') + k)
if failures: print('reads per atom:', failures)
if errors: print('page errors:', errors[:3])
sys.exit(0 if all(checks.values()) and not errors else 1)
