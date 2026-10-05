# usage: refresh-atom-index.py <meta.html> <out.json>
import json, sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    pg.goto('file://'+sys.argv[1]+''); pg.wait_for_function('window.__A && window.__A.length>0')
    json.dump(pg.evaluate('window.__A'), open(sys.argv[2],'w'))
    b.close()
