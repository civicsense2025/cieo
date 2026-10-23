// test/social-audio-recipes.test.mjs
// Pins the audio, comment, messaging and feedback motion recipes in the catalogue.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const FILES = {
  Audio: 'atoms/web/blocks/561-audio.js',
  Comments: 'atoms/web/blocks/562-comments.js',
  Messaging: 'atoms/web/blocks/563-messaging.js',
  Feedback: 'atoms/web/blocks/564-feedback.js',
};
const IDS = {
  Audio: ['audio-voice-note', 'audio-recorder', 'audio-transcript', 'audio-room'],
  Comments: ['comments-thread', 'comments-reactions', 'comments-voice-reply', 'comments-link-preview'],
  Messaging: ['msg-typing', 'msg-delivery', 'msg-inbox', 'msg-group-avatar'],
  Feedback: ['feedback-pin-review', 'feedback-helpful'],
};
const read = (p) => readFileSync(p, 'utf8');
const blocksJson = JSON.parse(read('atoms/web/blocks.json'));
const index = JSON.parse(read('atoms/web/index.json'));

// One recipe's source: from its atom( header to the next header or end of file.
function recipes(file) {
  const src = read(file);
  const parts = src.split(/(?=^atom\(\{ id:')/m).filter((p) => p.startsWith('atom({ id:'));
  return new Map(parts.map((p) => [p.match(/^atom\(\{ id:'([^']+)'/)[1], p]));
}

test('the four block files are registered in order after the auth recipes', () => {
  const at = Object.values(FILES).map((f) => blocksJson.indexOf(f.replace('atoms/web/', '')));
  assert.ok(at.every((i) => i > blocksJson.indexOf('blocks/560-auth-wave3.js')));
  assert.deepEqual([...at].sort((a, b) => a - b), at, 'blocks.json keeps 561 to 564 in numeric order');
});

for (const [category, file] of Object.entries(FILES)) {
  const found = recipes(file);
  test(`${file} declares exactly its ${category} recipes`, () => {
    assert.deepEqual([...found.keys()], IDS[category]);
  });
  for (const id of IDS[category]) {
    const src = found.get(id) ?? '';
    test(`${id} sits in ${category}, has an init and a trailing plain-text hint`, () => {
      assert.ok(src, `${id} is declared`);
      assert.match(src, new RegExp(`cat:'${category}'`));
      assert.match(src, /\binit\(st\)\s*\{/);
      assert.match(src, /<div class="hint">[^<]+<\/div>`/, 'trailing caption div');
    });
    test(`${id} can be driven without a pointer`, () => {
      const nativeControl = /<(button|input|textarea)\b/.test(src) || /AU_EL\('button'|CM_EL\('button'|MS_EL\('button'|FB_EL\('button'/.test(src);
      const keyHandler = /onkeydown|addEventListener\('keydown'/.test(src);
      assert.ok(nativeControl, 'every control is a native button, input or textarea');
      if (/role="slider"/.test(src)) assert.ok(keyHandler && /tabindex="0"/.test(src), 'a custom slider needs tabindex and keys');
    });
    test(`${id} honours reduced motion`, () => {
      assert.match(src, /\bREDUCE\b/);
    });
    test(`${id} uses theme variables, no fixed colours and no oversized type`, () => {
      assert.ok(!/#[0-9a-fA-F]{3,8}\b(?![^<]*<\/style)/.test(src.replace(/&#\d+;/g, '')), 'no hex colours');
      for (const m of src.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)) assert.ok(Number(m[1]) < 50, `font-size ${m[1]}px`);
      assert.match(src, /var\(--(ink|muted|card|raised|accent|danger)\)/);
    });
    test(`${id} is indexed with the same category and file`, () => {
      const row = index.find((r) => r.id === id);
      assert.ok(row, `${id} is in atoms/web/index.json`);
      assert.equal(row.category, category);
      assert.equal(row.file, file.replace('atoms/web/', ''));
      assert.ok(row.summary && row.api && row.name);
    });
  }
}

test('these files stay free of words the brand gate forbids and of network calls', () => {
  for (const file of Object.values(FILES)) {
    const src = read(file);
    assert.doesNotMatch(src, /lamina|meridian|\bvelo\b|claude|github|linear\b/i, file);
    assert.doesNotMatch(src, /\bfetch\(|XMLHttpRequest|new Audio\(|AudioContext|getUserMedia|WebSocket/, file);
  }
});

test('the catalogue page declares the new categories and places them in a jump group', () => {
  const page = read('atoms/web/runtime.library.page.js');
  for (const category of Object.keys(FILES)) {
    assert.ok(page.includes(`'${category}'`), `${category} in CATS and CATGROUPS`);
  }
  assert.match(page, /'Audio and conversation':\['Audio','Comments','Messaging','Feedback'\]/);
});

test('simulated audio levels stay inside the unit range for any clock time', () => {
  const src = read(FILES.Audio);
  const level = new Function('clamp', `${src.match(/const AU_LEVEL = [^\n]+/)[0]}; return AU_LEVEL;`)((v, a = 0, b = 1) => Math.min(b, Math.max(a, v)));
  for (let t = 0; t < 120; t += .037) {
    const v = level(t);
    assert.ok(v >= 0 && v <= 1, `level(${t}) = ${v}`);
  }
});
