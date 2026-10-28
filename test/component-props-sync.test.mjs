import test from 'node:test';
import assert from 'node:assert/strict';
import { syncPropertyRows } from '../scripts/lib/component-props.mjs';

test('property synchronization preserves authored rows and is idempotent', () => {
  const authored='<tr><td><code>value</code></td><td>number</td><td>0</td><td>Authored explanation.</td></tr>';
  const props=[{id:'value',type:{kind:'number'}},{id:'slotProps',type:{kind:'record',fields:[]},note:'Named <parts> & safe props.'}];
  const once=syncPropertyRows(authored,props);
  assert.ok(once.startsWith(authored));assert.equal((once.match(/<tr/g)||[]).length,2);
  assert.match(once,/Named &lt;parts&gt; &amp; safe props/);assert.match(once,/<td>object<\/td>/);
  assert.equal(syncPropertyRows(once,props),once);
  const updated=syncPropertyRows(once,[props[0],{...props[1],note:'Updated contract.'}]);
  assert.match(updated,/Updated contract/);assert.doesNotMatch(updated,/Named &lt;parts&gt;/);
});
