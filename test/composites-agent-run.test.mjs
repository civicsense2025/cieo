import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('site/composites/agent-run.html', 'utf8');
const js = readFileSync('site/composites/agent-run.js', 'utf8');

test('agent run renders its regions with scripts disabled', () => {
  for (const s of ['Agent run', 'role="log" aria-label="Agent activity"', 'role="group" aria-label="Run controls"', 'aria-label="Agents"', 'aria-busy="true"', 'Nothing saved yet']) {
    assert.ok(html.includes(s), `static markup missing: ${s}`);
  }
});

test('agent run uses shipped parts and links every one under built-from', () => {
  const names = JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8')).names;
  const parts = [...`${html}\n${js}`.matchAll(/data-parts(?:="|': ')([^"']+)/g)].flatMap((m) => m[1].split(/\s+/));
  for (const p of ['RunControls', 'AgentStatus', 'AgentLanes', 'StreamingMessage', 'AgentActivity', 'ToolCallDisclosure', 'ApprovalRequest']) assert.ok(parts.includes(p), `part missing: ${p}`);
  for (const p of parts) {
    assert.ok(names.includes(p), `unshipped part: ${p}`);
    assert.ok(html.includes(`../components/${p}.html`), `built-from missing link: ${p}`);
  }
});

test('agent run drives a real store and never renders text as HTML or reaches the network', () => {
  assert.match(js, /import \{[^}]*createAgentStore[^}]*\} from '\.\.\/\.\.\/dist\/agent\/index\.js'/);
  assert.match(html, /<script type="module" src="\.\/agent-run\.js">/);
  for (const t of ['run.status', 'message.delta', 'message.complete', 'tool.call', 'approval.requested', 'approval.resolved', 'draft.begin', 'draft.complete', 'artifact.saved']) {
    assert.ok(js.includes(`'${t}'`), `fixture missing ${t}`);
  }
  for (const bad of ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource(']) assert.ok(!js.includes(bad), `forbidden: ${bad}`);
  assert.ok(js.includes('isSettled'), 'Stop visibility follows the settled rule from cieo/agent');
});

test('composites index links the agent run', () => {
  assert.ok(readFileSync('site/composites/index.html', 'utf8').includes('./agent-run.html'));
});
