import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minifyJs } from '../scripts/minify.mjs';

const dir = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(dir, 'fixtures/minify-p2-regex-template.js'), 'utf8');

// P2: entering `${...}` must reset regex lexical context — a leading `/`
// is a regex literal, not division. Collapsing its spaces flips eval
// semantics ("true" -> "false"); node --check cannot catch it.
test('P2: `${}` leading regex keeps verbatim spaces (fixture)', () => {
  const min = minifyJs(fixture);
  assert.match(min, /\/a  b\//, `double-space regex must survive, got: ${JSON.stringify(min)}`);
});

test('P2: `${}` regex eval semantics preserved (true stays true)', () => {
  const min = minifyJs(fixture);
  const run = (code) => new Function(`${code}; return ok;`)();
  assert.equal(run(fixture), 'true');
  assert.equal(run(min), run(fixture));
});

test('P2: nested template `${}` leading regex also resets context', () => {
  const src = "const t = `outer${`inner${/a  b/.test('a  b')}`}`;\n";
  const min = minifyJs(src);
  assert.match(min, /\/a  b\//, `nested regex must survive, got: ${JSON.stringify(min)}`);
});

// A block comment containing a newline counts as a LineTerminator for the
// restricted productions (return/throw/...), so the break must survive.
test('P2: block comment containing newline preserves the break (ASI)', () => {
  const src = 'function f() {\nreturn /* keep\nme */ 5;\n}\n';
  const min = minifyJs(src);
  const run = (code) => new Function(`${code}; return f();`)();
  assert.equal(run(src), undefined);
  assert.equal(run(min), run(src), `ASI semantics must agree, got: ${JSON.stringify(min)}`);
  assert.match(min, /return\n/, `newline after return must survive, got: ${JSON.stringify(min)}`);
});
