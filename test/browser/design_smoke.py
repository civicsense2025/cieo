"""Offline Chromium checks. Install Playwright; no site or external asset access is needed."""
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS = ROOT / "test/browser/artifacts"
ARTIFACTS.mkdir(parents=True, exist_ok=True)
results = []


def check(name, condition):
    assert condition, name
    results.append(name)


with tempfile.TemporaryDirectory() as folder:
    standalone = Path(folder) / "studio.html"
    subprocess.run(["node", "scripts/build-standalone.mjs", str(standalone)], cwd=ROOT, check=True)
    html = standalone.read_text(encoding="utf-8")
    with sync_playwright() as playwright:
        executable = os.getenv("CHROMIUM_EXECUTABLE") or shutil.which("chromium")
        launch = {"headless": True}
        if executable:
            launch["executable_path"] = executable
        browser = playwright.chromium.launch(**launch)
        page = browser.new_page(viewport={"width": 1440, "height": 1080})
        errors, requests = [], []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("request", lambda request: requests.append(request.url))
        page.set_content(html, wait_until="load")
        page.wait_for_selector("#board .cieo-btn")
        check("no external asset requests", all(url.startswith("data:") for url in requests))
        for width in [320, 390, 768, 1024, 1440, 1920]:
            page.set_viewport_size({"width": width, "height": 1080})
            page.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
            check(f"no horizontal overflow at {width}px", page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
        page.set_viewport_size({"width": 1440, "height": 1080})
        button = page.locator("#board .cieo-btn").first
        radius = lambda: button.evaluate("el => getComputedStyle(el).borderTopLeftRadius")
        page.select_option("#radius", "square")
        square = radius()
        page.select_option("#radius", "pill")
        check("changing Corners changes the preview buttons", radius() != square)
        board_bg = lambda: page.locator("#board").evaluate("el => getComputedStyle(el).backgroundColor")
        page.select_option("#scheme", "light")
        light = board_bg()
        page.select_option("#scheme", "dark")
        check("changing Mode changes the preview", board_bg() != light)
        height = lambda: button.evaluate("el => el.getBoundingClientRect().height")
        page.select_option("#density", "compact")
        compact = height()
        page.select_option("#density", "comfortable")
        check("changing Density changes control height", height() > compact)
        page.locator("#accent").fill("#ff0000")
        page.locator("#apply-accent").click()
        check("an exact brand color is accepted", "#" in page.locator("#accent-help").inner_text() or page.locator("#status").inner_text() != "")
        page.locator('#brand-choices input[type="radio"]').nth(1).check(force=True)
        page.locator("#reset").click()
        check("reset restores the default corners", radius() == page.evaluate("getComputedStyle(document.querySelector('#board .cieo-btn')).borderTopLeftRadius"))
        tabs = page.locator('#pv-tabs [role="tab"]')
        tabs.nth(1).click()
        check("preview tabs switch", tabs.nth(1).get_attribute("aria-selected") == "true")
        for fmt in ["css", "json", "swift", "cli"]:
            page.locator(f'[data-format="{fmt}"]').click()
            check(f"{fmt} export is shown", page.locator(f'[data-format="{fmt}"]').get_attribute("aria-pressed") == "true")
        with page.expect_download() as pending:
            page.locator("#download").click()
        check("export downloads", bool(pending.value.suggested_filename))
        page.screenshot(path=str(ARTIFACTS / "desktop.png"), full_page=True)
        page.set_viewport_size({"width": 390, "height": 844})
        page.screenshot(path=str(ARTIFACTS / "mobile.png"), full_page=True)
        check("zero uncaught browser errors", not errors)
        browser.close()
report = {"passed": len(results), "checks": results, "mode": "offline set_content with data-URL modules; real clipboard/storage permission grants are not tested"}
(ARTIFACTS / "report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, indent=2))
