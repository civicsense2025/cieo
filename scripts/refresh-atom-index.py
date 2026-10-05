import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    pg.goto('file:///private/tmp/claude-501/mk-meta.html'); pg.wait_for_function('window.__A && window.__A.length>0')
    json.dump(pg.evaluate('window.__A'), open('/private/tmp/claude-501/mk-meta.json','w'))
    b.close()
