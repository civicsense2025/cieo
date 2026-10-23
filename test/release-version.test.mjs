import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));

test('the package, its lockfile and the README install line name one release', () => {
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.equal(lock.version, pkg.version, 'package-lock.json top-level version');
  assert.equal(lock.packages[''].version, pkg.version, 'package-lock.json root package version');
  const install = read('README.md').match(/npm install github:civicsense2025\/cieo#v(\d+\.\d+\.\d+)/);
  assert.ok(install, 'README shows the install command with a version tag');
  assert.equal(install[1], pkg.version, 'README install tag');
});
