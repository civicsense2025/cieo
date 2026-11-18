import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { toUS, findings } from '../scripts/us-spelling.mjs';

test('British spellings convert to US English without touching words that are already correct', () => {
  assert.equal(toUS('colour behaviour centred grey labelled labelling cancelled catalogue analyse'), 'color behavior centered gray labeled labeling canceled catalog analyze');
  assert.equal(toUS('Colour CANCELLED Catalogue'), 'Color CANCELED Catalog');
  for (const fine of ['aria-labelledby', 'cancellation', 'organism', 'optimistic', 'center', 'canceled', 'createAnalyser', 'AnalyserNode', 'Task.isCancelled']) assert.equal(toUS(fine), fine, fine);
  assert.deepEqual(findings('plain US text with aria-labelledby'), []);
});

test('a line marked us-spelling-keep is left alone, because it names a live URL or API', () => {
  const line = "'/docs/catalogue.html' // us-spelling-keep";
  assert.equal(toUS(line), line);
  assert.deepEqual(findings(line), []);
});

test('the repository uses US English everywhere (rewrite with `node scripts/us-spelling.mjs`)', () => {
  const r = spawnSync(process.execPath, ['scripts/us-spelling.mjs', '--check'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr.split('\n').slice(0, 15).join('\n'));
});
