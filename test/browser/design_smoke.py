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
        page.wait_for_function("document.querySelector('#token-rows').children.length === 73")
        check("73 tokens render", page.locator("#token-rows tr").count() == 73)
        check("no external asset requests", all(url.startswith("data:") for url in requests))
        for width in [320, 390, 768, 1024, 1440, 1920]:
            page.set_viewport_size({"width": width, "height": 1080})
            page.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
            check(f"no horizontal overflow at {width}px", page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
        page.set_viewport_size({"width": 1440, "height": 1080})
        page.locator('input[value="iris"]').check()
        page.select_option("#scheme", "dark")
        check("palette and dark mode apply", page.evaluate("document.documentElement.dataset.cieoTheme === 'iris-dark'"))
        page.select_option("#contrast", "high")
        page.select_option("#density", "compact")
        page.select_option("#radius", "crisp")
        page.select_option("#font", "mono")
        check("density applies", page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--cieo-control-height') === '2rem'"))
        page.locator("#accent").fill("#ff0000")
        page.locator("#apply-accent").click()
        check("custom accent resolves", page.locator("#accent-value").inner_text().startswith("#"))
        page.locator("#token-search").fill("no-such-token")
        check("empty token search", page.locator("#empty-tokens").is_visible())
        page.locator("#token-search").fill("radius")
        check("token search filters", page.locator("#token-rows tr").count() == 4)
        page.locator("#token-search").fill("")
        page.locator("#rtl").check()
        check("RTL is scoped to preview", page.locator("#preview").get_attribute("dir") == "rtl")
        check("inspector remains LTR", page.evaluate("getComputedStyle(document.querySelector('.inspector')).direction") == "ltr")
        page.locator(".task input").nth(1).check()
        check("task progress updates", page.locator("#completion").get_attribute("value") == "2")
        page.locator("#launch").click()
        check("primary action focuses form", page.locator("#project-name").evaluate("el => el === document.activeElement"))
        page.locator("#project-name").fill("A local project")
        page.locator('#project-form button[type="submit"]').click()
        check("demo form works", "local demonstration" in page.locator("#status").inner_text())
        page.select_option("#motion", "reduced")
        page.locator("#replay").click()
        check("explicit reduced motion stays still", page.locator(".motion-art").evaluate("el => el.style.getPropertyValue('--travel')") == "0px")
        page.emulate_media(reduced_motion="reduce")
        page.select_option("#motion", "system")
        check("system reduced motion wins", page.evaluate("document.documentElement.dataset.motion") == "reduced")
        check("stagger resets", page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--motion-stagger-max').trim()") == "0s")
        page.locator("#copy").click()
        check("clipboard fallback opens", page.locator("#export-dialog").is_visible())
        page.keyboard.press("Escape")
        check("native dialog escape closes", not page.locator("#export-dialog").is_visible())
        page.locator("#import-theme").set_input_files({"name": "bad.json", "mimeType": "application/json", "buffer": b'{"version":999}'})
        page.wait_for_function("document.querySelector('#status').textContent.includes('Import rejected')")
        check("invalid import keeps current theme", page.evaluate("document.documentElement.dataset.cieoTheme") == "iris-dark")
        page.locator("#import-theme").set_input_files({"name": "theme.json", "mimeType": "application/json", "buffer": b'{"version":1,"options":{"brand":"lagoon","scheme":"light"}}'})
        page.wait_for_function("document.documentElement.dataset.cieoTheme === 'lagoon-light'")
        check("valid configuration import", True)
        for format_name in ["css", "dtcg", "json", "config", "swift", "rust", "kotlin", "dart", "python", "c"]:
            page.select_option("#format", format_name)
            with page.expect_download() as pending:
                page.locator("#download").click()
            check(f"{format_name} download", pending.value.suggested_filename.startswith("cieo-lagoon-light."))
        page.locator("#reset").click()
        check("reset restores defaults", page.locator('input[value="studio"]').is_checked())
        page.emulate_media(reduced_motion="no-preference")
        page.locator("#replay").click()
        page.wait_for_timeout(700)
        check("spring replay settles", page.locator(".motion-art").evaluate("el => el.style.getPropertyValue('--travel')") == "0px")
        page.screenshot(path=str(ARTIFACTS / "desktop.png"), full_page=True)
        page.emulate_media(forced_colors="active")
        check("forced colors keep a control boundary", page.locator("#launch").evaluate("el => getComputedStyle(el).borderStyle") == "solid")
        page.emulate_media(forced_colors="none")
        page.set_viewport_size({"width": 390, "height": 844})
        check("mobile controls collapse", page.locator("#inspector-panels").is_hidden())
        page.locator("#customize-toggle").click()
        check("mobile controls expand", page.locator("#inspector-panels").is_visible())
        page.screenshot(path=str(ARTIFACTS / "mobile-controls.png"), full_page=True)
        page.locator("#customize-toggle").click()
        page.locator(".cieo-skip").focus()
        page.keyboard.press("Enter")
        check("keyboard skip link focuses preview", page.locator("#preview").evaluate("el => el === document.activeElement"))
        check("zero uncaught browser errors", not errors)
        browser.close()
report = {"passed": len(results), "checks": results, "mode": "offline set_content with data-URL modules; real clipboard/storage permission grants are not tested"}
(ARTIFACTS / "report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, indent=2))
