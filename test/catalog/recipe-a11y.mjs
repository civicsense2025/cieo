/** Pins the accessibility contracts of the sheet, one-time-code and phone recipes in a real browser. */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
execFileSync(process.execPath, ['scripts/build-collection.mjs'], { cwd: root, stdio: 'inherit' });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
let failed = 0;
const check = async (name, fn) => { try { await fn(); console.log('PASS', name); } catch (e) { failed++; console.error('FAIL', name, String(e)); } };
try {
  await page.goto(pathToFileURL(path.join(root, 'docs/collection.html')).href);
  await page.waitForFunction(() => !!window.CIEO_REVIEW, null, { timeout: 30000 });
  await page.waitForTimeout(600);

  await check('a closed sheet is hidden from assistive tech with aria-hidden="true"', async () => {
    await page.locator('#sheet').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
    const v = await page.locator('#sheet .sh').first().evaluate((el) => ({ hidden: el.getAttribute('aria-hidden'), inert: el.inert }));
    assert.deepEqual(v, { hidden: 'true', inert: true });
  });
  await check('the one-time code announces one message, not every layer', async () => {
    const tile = page.locator('#otp').first();
    assert.equal(await tile.locator('.om').getAttribute('aria-hidden'), 'true');
    const input = tile.locator('input'); await input.fill('000000'); await page.waitForTimeout(300);
    assert.match(await tile.locator('.say[role=status]').textContent(), /didn’t match/);
    await page.waitForTimeout(2200);
    await input.fill('246810'); await page.waitForTimeout(300);
    assert.match(await tile.locator('.say').textContent(), /Verified/);
  });
  await check('the third wrong code never claims the old code is dead', async () => {
    const tile = page.locator('#otp').first(), input = tile.locator('input');
    for (let i = 0; i < 3; i++) { await input.fill('111111'); await page.waitForTimeout(2100); await input.fill('222222'); await page.waitForTimeout(250); }
    const said = await tile.locator('.say').textContent();
    assert.doesNotMatch(said, /no longer works/);
  });
  await check('phone messages have unique ids that the field points at', async () => {
    await page.locator('#phone').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
    const r = await page.evaluate(() => { const ids = [...document.querySelectorAll('[id^="ph-msg"]')].map((e) => e.id); const inp = document.querySelector('#phone input'); return { ids, dup: ids.length !== new Set(ids).size, ref: inp?.getAttribute('aria-describedby') }; });
    assert.equal(r.dup, false); assert.ok(r.ids.includes(r.ref), `describedby ${r.ref} not in ${r.ids}`);
  });
  await check('no uncaught browser errors', async () => assert.deepEqual(errors, []));
} finally { await browser.close(); }
if (failed) process.exit(1);
