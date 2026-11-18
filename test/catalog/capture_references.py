"""Optional public-reference capture. No login, cookies, or product data are used."""
import json
import pathlib
import urllib.request
from playwright.sync_api import sync_playwright

out = pathlib.Path('review-artifact/references')
out.mkdir(parents=True, exist_ok=True)
results = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    for name, url in [('recollect', 'https://recollect.so/'), ('graphicalui', 'https://www.graphicalui.com/'), ('figma', 'https://www.figma.com/design/')]:
        page = browser.new_page(viewport={'width': 1440, 'height': 1040})
        try:
            response = page.goto(url, wait_until='domcontentloaded', timeout=40000)
            page.wait_for_timeout(2500)
            page.screenshot(path=str(out / f'{name}.png'))
            page.evaluate('window.scrollTo(0, 760)')
            page.wait_for_timeout(700)
            page.screenshot(path=str(out / f'{name}-detail.png'))
            results.append({'name': name, 'url': url, 'title': page.title(), 'status': response.status if response else None})
        except Exception as error:
            results.append({'name': name, 'url': url, 'error': str(error)})
        page.close()
    browser.close()
try:
    urllib.request.urlretrieve('https://recollect.so/images/recollect-ipad-hero.png', out / 'recollect-product.png')
except Exception as error:
    results.append({'name': 'recollect-product', 'error': str(error)})
(out / 'sources.json').write_text(json.dumps(results, indent=2))
print(json.dumps(results, indent=2))
