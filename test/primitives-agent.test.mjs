// Agent UI primitives: server renders that pin the agreed behavior. Approvals and stops are never optimistic, text is
// never HTML, colour never carries a status alone, and the icon data module is plain data with no globals.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AGENT_STATUSES, SETTLED_STATUSES, createAgentStore, selectActivity, selectRunAgents } from '../dist/agent/index.js';
import { AGENT_ICONS, AGENT_ICON_GROUPS, agentIconGlyph, agentIconStrokeWidth, getAgentIcon } from '../dist/agent/icons.js';
import { AgentStatus, AGENT_STATUS_TONES } from '../dist/primitives/AgentStatus/AgentStatus.js';
import { AgentActivity } from '../dist/primitives/AgentActivity/AgentActivity.js';
import { ToolCallDisclosure } from '../dist/primitives/ToolCallDisclosure/ToolCallDisclosure.js';
import { ApprovalRequest } from '../dist/primitives/ApprovalRequest/ApprovalRequest.js';
import { StreamingMessage } from '../dist/primitives/StreamingMessage/StreamingMessage.js';
import { AgentLanes } from '../dist/primitives/AgentLanes/AgentLanes.js';
import { RunControls } from '../dist/primitives/RunControls/RunControls.js';
import { AgentIcon } from '../dist/primitives/AgentIcon/AgentIcon.js';
import * as barrel from '../dist/primitives/index.js';

const render = (type, props) => renderToStaticMarkup(h(type, props));
const at = '2026-10-17T09:41:00Z';
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const approval = (status, extra = {}) => ({ id: 'p1', runId: 'r1', agentId: 'a1', title: 'Publish the draft?', detail: 'Pricing FAQ', status, requestedAt: at, resolvedAt: status === 'pending' ? null : at, ...extra });
const run = (status) => ({ id: 'r1', status, reason: null, startedAt: at, updatedAt: at });
const agent = (id, status = 'running', parentAgentId = null, name = id) => ({ id, runId: 'r1', parentAgentId, name, status, reason: null, location: null, openMessageId: null, updatedAt: at });
const message = (extra = {}) => ({ id: 'm1', runId: 'r1', agentId: 'a1', text: 'Hello', complete: true, truncated: false, startedAt: at, updatedAt: at, ...extra });
const call = (phase, extra = {}) => ({ id: 'c1', runId: 'r1', agentId: 'a1', name: 'search_docs', phase, summary: 'Found 3 pages', error: phase === 'failed' ? 'Timed out' : null, startedAt: at, updatedAt: at, ...extra });

test('every agent component ships through the primitives barrel', () => {
  for (const name of ['AgentStatus', 'AgentActivity', 'ToolCallDisclosure', 'ApprovalRequest', 'StreamingMessage', 'AgentLanes', 'RunControls', 'AgentIcon']) {
    assert.equal(typeof barrel[name], 'function', `${name} missing from the barrel`);
  }
});

test('AgentStatus: tone map and visible words for all eight statuses', () => {
  const expected = {
    starting: ['info', 'Starting'], running: ['info', 'Working'], waiting: ['warning', 'Needs you'], completed: ['success', 'Done'],
    stopped: ['default', 'Stopped'], failed: ['danger', 'Failed'], interrupted: ['danger', 'Interrupted'], disconnected: ['danger', 'Disconnected'],
  };
  assert.deepEqual(Object.keys(expected).sort(), [...AGENT_STATUSES].sort(), 'every core status has an expectation');
  for (const [status, [tone, words]] of Object.entries(expected)) {
    assert.equal(AGENT_STATUS_TONES[status], tone, status);
    const html = render(AgentStatus, { status });
    assert.ok(html.includes(`data-status="${tone}" class="cieo cieo-p-status-dot"`), `${status} dot tone`);
    assert.equal(text(html), words, `${status} names its state in visible text`);
    assert.match(html, /aria-hidden="true"/, 'the dot is decorative: the words carry the meaning');
  }
});

test('AgentStatus: label overrides words and name precedes them', () => {
  const html = render(AgentStatus, { status: 'running', label: 'En cours', name: 'Researcher' });
  assert.equal(text(html), 'Researcher En cours');
  assert.match(html, /data-status="running"/);
});

test('AgentActivity: a labelled log with one keyed row per entry, in order', () => {
  const entries = [
    { seq: 1, at, runId: 'r1', agentId: 'a1', type: 'run.status', ref: 'r1' },
    { seq: 3, at, runId: 'r1', agentId: 'a1', type: 'tool.call', ref: 'c1' },
  ];
  const html = render(AgentActivity, { entries, describe: (e) => `row ${e.seq}` });
  assert.match(html, /^<ol class="cieo cieo-p-agent-activity" role="log" aria-label="Agent activity">/);
  assert.deepEqual([...html.matchAll(/data-seq="(\d+)"/g)].map((m) => m[1]), ['1', '3']);
  assert.match(html, /data-type="tool.call"/);
  assert.ok(html.indexOf('row 1') < html.indexOf('row 3'));
  const empty = render(AgentActivity, { entries: [], describe: String, label: 'Run log', emptyText: 'Nothing yet' });
  assert.match(empty, /role="log" aria-label="Run log"/, 'the log stays mounted while empty so later rows announce');
  assert.match(empty, /data-empty[^>]*>Nothing yet/);
});

test('ToolCallDisclosure: native details with name and phase words; error only when failed', () => {
  const words = { started: 'Running', finished: 'Done', failed: 'Failed' };
  for (const [phase, w] of Object.entries(words)) {
    const html = render(ToolCallDisclosure, { call: call(phase) });
    assert.match(html, /^<details class="cieo cieo-p-tool-call-disclosure"/);
    const summary = html.slice(html.indexOf('<summary>'), html.indexOf('</summary>'));
    assert.equal(text(summary), `search_docs ${w}`);
    assert.ok(html.includes('Found 3 pages'));
    assert.equal(html.includes('data-error'), phase === 'failed', `${phase} error visibility`);
  }
  assert.ok(render(ToolCallDisclosure, { call: call('failed') }).includes('Timed out'));
  assert.ok(!render(ToolCallDisclosure, { call: call('finished', { error: 'stale' }) }).includes('stale'), 'a stale error never shows on success');
});

test('ApprovalRequest: a section labelled by its title', () => {
  const html = render(ApprovalRequest, { approval: approval('pending') });
  const id = html.match(/aria-labelledby="([^"]+)"/)[1];
  assert.match(html, new RegExp(`<h3 id="${id}">Publish the draft\\?</h3>`));
  assert.match(html, /^<section class="cieo cieo-p-approval-request"/);
  assert.match(render(ApprovalRequest, { approval: approval('pending', { title: null }), headingLevel: 2 }), /<h2 id="[^"]+">Approval needed<\/h2>/);
});

test('ApprovalRequest: never shows a decision while pending, even when busy', () => {
  for (const busy of [null, 'approve', 'deny']) {
    const html = render(ApprovalRequest, { approval: approval('pending'), busy, onApprove() {}, onDeny() {} });
    const status = html.match(/data-status-text[^>]*>([^<]*)</)[1];
    assert.equal(status, 'Waiting for your decision', `busy=${busy}`);
    for (const decision of ['Approved', 'Denied', 'Expired']) assert.ok(!text(html).includes(decision), `busy=${busy} shows ${decision}`);
    const buttons = [...html.matchAll(/<button[^>]*>/g)].map((m) => m[0]);
    assert.equal(buttons.length, 2, 'approve and deny while pending');
    for (const b of buttons) assert.equal(/aria-disabled="true"/.test(b), busy !== null, `busy=${busy} disables both`);
    const pending = buttons.filter((b) => /data-state="pending"/.test(b));
    assert.equal(pending.length, busy ? 1 : 0, 'only the pressed button spins');
    if (busy === 'approve') assert.ok(/Approve/.test(html.slice(html.indexOf(pending[0]), html.indexOf('</button>', html.indexOf(pending[0])))));
  }
});

test('ApprovalRequest: resolved shows the decision and no buttons', () => {
  for (const [status, words] of [['approved', 'Approved'], ['denied', 'Denied'], ['expired', 'Expired']]) {
    const html = render(ApprovalRequest, { approval: approval(status), busy: 'approve', onApprove() {} });
    assert.ok(!html.includes('<button'), `${status} has no buttons`);
    assert.match(html, new RegExp(`data-status-text[^>]*>${words}<`));
    assert.ok(!html.includes('aria-busy'), 'a resolved request is never busy');
  }
});

test('StreamingMessage: plain text only, busy until complete, truncated note', () => {
  const evil = '<script>alert(1)</script><img src=x onerror=alert(2)>';
  const html = render(StreamingMessage, { message: message({ text: evil, complete: false }), author: 'Researcher' });
  assert.ok(!html.includes('<script>') && !html.includes('<img'), 'markup in the text is escaped');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'the text still shows, as text');
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /<article class="cieo cieo-chat-message"><span data-author="true">Researcher<\/span>/, 'builds on ChatMessage');
  const done = render(StreamingMessage, { message: message() });
  assert.ok(!done.includes('aria-busy'), 'complete messages are not busy');
  assert.ok(!done.includes('data-truncated'));
  assert.match(render(StreamingMessage, { message: message({ truncated: true }) }), /data-truncated[^>]*>Truncated</);
  const css = readFileSync('design/styles/primitives/streaming-message.css', 'utf8');
  assert.match(css, /white-space:\s*pre-wrap/, 'line breaks in streamed text are kept');
});

test('AgentLanes: name and status head each lane; children nest; orphans and cycles stay finite', () => {
  const agents = [agent('lead'), agent('child', 'waiting', 'lead'), agent('orphan', 'failed', 'gone'), agent('loopA', 'running', 'loopB'), agent('loopB', 'running', 'loopA')];
  const html = render(AgentLanes, { agents, renderLane: (a) => h('p', null, `body ${a.id}`) });
  assert.match(html, /^<ul class="cieo cieo-p-agent-lanes" aria-label="Agents">/);
  const lead = html.indexOf('data-agent-id="lead"');
  const child = html.indexOf('data-agent-id="child"');
  assert.ok(lead >= 0 && child > lead, 'child renders after its parent');
  assert.match(html, /data-agent-id="child" data-depth="1"/);
  assert.match(html, /data-agent-id="orphan" data-depth="0"/, 'an agent whose parent is missing starts a top-level lane');
  assert.match(html, /Needs you/, 'each lane header names its status');
  for (const id of ['lead', 'child', 'orphan']) assert.ok(html.includes(`body ${id}`));
  const ids = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map((m) => m[1]);
  for (const id of ids) assert.match(html, new RegExp(`id="${id}" data-agent-name`), 'each lane section is named by its agent');
  // A pure cycle has no root, so it renders nothing rather than recursing forever.
  assert.ok(!html.includes('loopA'));
});

test('RunControls: Stop only while live; disabled and spinning while busy', () => {
  for (const status of SETTLED_STATUSES) {
    const html = render(RunControls, { run: run(status), onStop() {} });
    assert.ok(!html.includes('<button'), `${status} hides Stop`);
    assert.match(html, /role="group" aria-label="Run controls"/);
  }
  for (const status of AGENT_STATUSES.filter((s) => !SETTLED_STATUSES.includes(s))) {
    assert.ok(render(RunControls, { run: run(status), onStop() {} }).includes('<button'), `${status} shows Stop`);
  }
  assert.ok(!render(RunControls, { run: run('running') }).includes('<button'), 'no handler, no button');
  const busy = render(RunControls, { run: run('running'), onStop() {}, busy: true });
  const button = busy.match(/<button[^>]*>/)[0];
  assert.match(button, /aria-disabled="true"/);
  assert.match(button, /data-state="pending"/);
  assert.match(busy, /data-status="running"/, 'status stays what the host reported while the stop is in flight');
  assert.ok(text(busy).includes('Working'));
});

test('agent icons: plain data, no globals, every icon has drawing data at every tier', () => {
  const src = readFileSync('dist/agent/icons.js', 'utf8');
  for (const bad of ['globalThis', 'window', 'document', 'self.']) assert.ok(!src.includes(bad), `icons module touches ${bad}`);
  const sandbox = {};
  const before = Object.keys(sandbox).length;
  vm.runInNewContext(src.replace(/^export /gm, ''), sandbox);
  assert.equal(Object.keys(sandbox).filter((k) => !/^(AGENT_|g\d|byId|getAgentIcon|agentIcon)/.test(k)).length, before, 'no stray globals at import');
  assert.equal(AGENT_ICONS.length, 24);
  assert.deepEqual(AGENT_ICON_GROUPS.map((g) => g.id), ['Doing', 'Talking', 'Waiting', 'Outcome']);
  const ids = new Set();
  const hasDrawing = (nodes) => nodes.some(([tag, attrs, kids]) => (tag === 'path' && attrs.d) || ['circle', 'ellipse', 'rect'].includes(tag) || (kids && hasDrawing(kids)));
  for (const icon of AGENT_ICONS) {
    assert.ok(!ids.has(icon.id), `duplicate id ${icon.id}`);
    ids.add(icon.id);
    assert.ok(icon.name && icon.description, `${icon.id} has words`);
    for (const tier of ['compact', 'regular', 'large']) assert.ok(hasDrawing(icon[tier]), `${icon.id} ${tier} has path data`);
    assert.equal(getAgentIcon(icon.id), icon);
  }
  assert.equal(getAgentIcon('nope'), undefined);
  assert.equal(agentIconGlyph(AGENT_ICONS[0], 16), AGENT_ICONS[0].compact);
  assert.equal(agentIconGlyph(AGENT_ICONS[0], 24), AGENT_ICONS[0].regular);
  assert.equal(agentIconGlyph(AGENT_ICONS[0], 64), AGENT_ICONS[0].large);
  assert.ok(Math.abs(agentIconStrokeWidth(24) * 24 / 64 - 1.55) < 0.05, 'about 1.55px of stroke at 24px');
  assert.equal(agentIconStrokeWidth(128), 1.7, 'never lighter than 1.7 units');
  assert.equal(readFileSync('atoms/web/identity/agenticons-actions.js', 'utf8').includes('globalThis.AgentActionIcons'), true, 'the original atom is untouched');
});

test('AgentIcon: renders every icon; decorative unless labelled; tone from data', () => {
  for (const icon of AGENT_ICONS) {
    const html = render(AgentIcon, { icon: icon.id });
    assert.match(html, /^<svg class="cieo cieo-p-agent-icon" viewBox="0 0 64 64" width="24" height="24"/);
    assert.match(html, /aria-hidden="true"/);
    assert.ok(/<(path|circle|ellipse|rect)\b/.test(html.slice(html.indexOf('<g'))), `${icon.id} draws a glyph`);
    assert.equal(html.includes(`data-tone="${icon.tone}"`), icon.tone !== null);
    assert.ok(!/stroke-width="[^"]*"[^>]*stroke-width/.test(html) && !/[a-z]+-[a-z]+=\{/.test(html));
  }
  const labelled = render(AgentIcon, { icon: 'failed', label: 'Failed', size: 16 });
  assert.match(labelled, /role="img" aria-label="Failed"/);
  assert.ok(!labelled.includes('aria-hidden'));
  assert.equal(render(AgentIcon, { icon: 'nope' }), '', 'an unknown id renders nothing');
  assert.ok(!render(AgentIcon, { icon: 'done', outline: false }).includes('rx="15"'), 'outline can be turned off');
});

test('components render straight from a real store fold', () => {
  const store = createAgentStore();
  const e = (seq, type, data, agentId = 'a1', parentAgentId = null) => ({ v: 1, seq, at, runId: 'r1', agentId, parentAgentId, type, data });
  store.apply([
    e(1, 'run.status', { status: 'running' }),
    e(2, 'agent.status', { status: 'running', name: 'Lead' }),
    e(3, 'agent.status', { status: 'waiting', name: 'Helper' }, 'a2', 'a1'),
    e(4, 'approval.requested', { approvalId: 'p1', title: 'Send it?' }),
  ]);
  const s = store.getSnapshot();
  const lanes = render(AgentLanes, { agents: selectRunAgents(s, 'r1'), renderLane: () => null });
  assert.match(lanes, /data-agent-id="a2" data-depth="1"/);
  const log = render(AgentActivity, { entries: selectActivity(s), describe: (x) => x.type });
  assert.equal([...log.matchAll(/<li /g)].length, 4);
  assert.match(render(ApprovalRequest, { approval: s.approvals.get('p1'), busy: 'approve' }), /Waiting for your decision/);
});

test('agent icons match the atom drawing at rest, at every size tier', () => {
  const src = readFileSync('atoms/web/identity/agenticons-actions.js', 'utf8');
  const body = src.slice(src.indexOf('(() => {') + '(() => {'.length, src.indexOf('globalThis.AgentActionIcons'));
  const sandbox = {};
  const rest = 'const S={snap:{w:34},base:{w:22},soft:{w:15},lazy:{w:9}};const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));const prog=(t,t0)=>(t-t0<=0?0:1);';
  vm.runInNewContext(`${rest}${body};this.atom={DEFS,inline};`, sandbox);
  const geometry = (markup) => [...markup.replace(/^<svg[^>]*>/, '').matchAll(/ (d|cx|cy|r|rx|ry|x|y|width|height|transform|stroke-width|fill|opacity)="([^"]+)"/g)]
    .map((m) => `${m[1]}=${m[2]}`).filter((a) => a !== 'transform=translate(0 0)').sort().join('|');
  assert.equal(sandbox.atom.DEFS.length, AGENT_ICONS.length, 'every atom icon is in the data module');
  for (const size of [16, 24, 48]) {
    for (const d of sandbox.atom.DEFS) {
      assert.equal(geometry(render(AgentIcon, { icon: d.k, size })), geometry(sandbox.atom.inline(d, { size })), `${d.k} at ${size}px`);
    }
  }
});
