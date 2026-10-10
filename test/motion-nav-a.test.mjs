import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// Motion wave-1 nav-a: TopNav family + Breadcrumbs carry no animated behavior.
// tsx takes no MotionProps; CSS owns no transition/animation; manifests pin no-motion.
const NAV_A_CSS = {
  TopNav: ['top-nav.css'],
  TopNavItem: ['top-nav-item.css'],
  TopNavHeading: ['top-nav-heading.css'],
  TopNavMenu: ['top-nav-menu.css'],
  TopNavMegaMenu: ['top-nav-mega-menu.css'],
  TopNavMegaMenuItem: ['top-nav-mega-menu-item.css'],
  TopNavMegaMenuFeaturedCard: ['top-nav-mega-menu-featured-card.css'],
  Breadcrumbs: ['breadcrumbs.css'],
  BreadcrumbItem: ['breadcrumbs.css'],
};

test('nav-a family has no animated behavior (audit)', () => {
  for (const [dir, cssFiles] of Object.entries(NAV_A_CSS)) {
    const src = readFileSync(`src/primitives/${dir}/${dir}.tsx`, 'utf8');
    assert.ok(!/MotionProps|motionAttrs|data-motion|data-entering|data-exiting/.test(src), `${dir} tsx references motion`);
    for (const file of cssFiles) {
      const p = `design/styles/primitives/${file}`;
      assert.ok(existsSync(p), `${dir} css missing: ${p}`);
      const css = readFileSync(p, 'utf8');
      assert.ok(!/(animation|transition|@keyframes|data-motion|data-entering|--motion-)/.test(css), `${dir} css animates without a motion contract`);
    }
    const manifest = JSON.parse(readFileSync(`src/primitives/${dir}/manifest.json`, 'utf8'));
    assert.deepEqual(manifest.transitions, [], `${dir} manifest declares transitions`);
    assert.deepEqual(manifest.constraints?.motion, ['no-motion'], `${dir} manifest missing no-motion pin`);
  }
});

test('TopNav and TopNavMegaMenu take no motion props', () => {
  for (const dir of ['TopNav', 'TopNavMegaMenu']) {
    const src = readFileSync(`src/primitives/${dir}/${dir}.tsx`, 'utf8');
    assert.ok(!src.includes('MotionProps'), `${dir} gained unplanned motion API`);
  }
});
