import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CORE_EVENT_TYPES, createAgentState, createAgentStore, parseAgentEvent, reduce,
  selectActivity, selectAgents, selectAttention, selectOpenDrafts, selectPendingApprovals, selectRuns, selectStreamingMessage,
} from '../dist/agent/index.js';

const ev = (seq, type, data = {}, extra = {}) => ({ v: 1, seq, at: `2026-10-17T00:00:${String(seq % 60).padStart(2, '0')}Z`, runId: 'run-1', agentId: 'a1', parentAgentId: null, type, data, ...extra });
const fold = (events, limits) => events.reduce((s, e) => reduce(s, parseAgentEvent(e), limits), createAgentState());

test('envelope guard rejects malformed frames and accepts well-formed ones', () => {
  assert.ok(parseAgentEvent(ev(1, 'run.status', { status: 'running' })));
  for (const bad of [
    null, [], 'x', { ...ev(1, 'run.status'), v: 2 }, { ...ev(0, 'run.status') }, { ...ev(1.5, 'run.status') },
    { ...ev(1, 'run.status'), runId: '' }, { ...ev(1, 'run.status'), agentId: 'has space' }, { ...ev(1, 'run.status'), agentId: 'a'.repeat(257) },
    { ...ev(1, 'Run.Status') }, { ...ev(1, '.leading') }, { ...ev(1, 'trailing.') }, { ...ev(1, 'run.status'), data: [] }, { ...ev(1, 'run.status'), data: new Date() },
  ]) assert.equal(parseAgentEvent(bad), null, JSON.stringify(bad));
  assert.equal(parseAgentEvent({ ...ev(1, 'run.status'), parentAgentId: undefined }).parentAgentId, null);
});

test('events apply once and in order; duplicates leave the same state object', () => {
  const s1 = fold([ev(1, 'agent.status', { status: 'running', name: 'Reviewer', runStatus: 'running' })]);
  assert.equal(s1.cursor, 1);
  assert.equal(reduce(s1, parseAgentEvent(ev(1, 'agent.status', { status: 'failed' }))), s1);
  assert.equal(selectAgents(s1)[0].status, 'running');
  assert.equal(selectRuns(s1)[0].status, 'running');
});

test('a hole in a contiguous log is flagged, applies nothing, and clears once the missing event arrives', () => {
  const s1 = fold([ev(1, 'run.status', { status: 'running' })]);
  const holed = reduce(s1, parseAgentEvent(ev(3, 'run.status', { status: 'completed' })));
  assert.deepEqual(holed.gap, { after: 1, received: 3 });
  assert.equal(holed.cursor, 1);
  assert.equal(selectRuns(holed)[0].status, 'running');
  const healed = reduce(holed, parseAgentEvent(ev(2, 'run.status', { status: 'waiting' })));
  assert.equal(healed.gap, null);
  assert.equal(healed.cursor, 2);
  const filtered = reduce(s1, parseAgentEvent(ev(9, 'run.status', { status: 'completed' })), { ...defaults(), contiguous: false });
  assert.equal(filtered.cursor, 9);
  assert.equal(filtered.gap, null);
});

test('unknown types and malformed payloads advance the cursor, are counted, and change no view', () => {
  const s = fold([ev(1, 'future.thing', { a: 1 }), ev(2, 'run.status', { status: 'bogus' }), ev(3, 'tool.call', { callId: 'c1' })]);
  assert.equal(s.cursor, 3);
  assert.equal(s.rejected, 3);
  assert.equal(s.runs.size, 0);
  assert.equal(s.activity.length, 0);
});

test('extension events keep their payload in activity untouched', () => {
  const s = fold([ev(1, 'x.host.recording.saved', { objectId: 'abc', bytes: 10 })]);
  assert.equal(s.rejected, 0);
  assert.deepEqual(selectActivity(s)[0].data, { objectId: 'abc', bytes: 10 });
  assert.equal(s.agents.size, 1);
});

test('streamed text appends by default, replaces on request, completes once, and is capped', () => {
  const s = fold([ev(1, 'message.delta', { text: 'Hel' }), ev(2, 'message.delta', { text: 'lo' })]);
  assert.equal(selectStreamingMessage(s, 'a1').text, 'Hello');
  const replaced = fold([ev(1, 'message.delta', { text: 'Hel' }), ev(2, 'message.delta', { text: 'Hello there', mode: 'replace' })]);
  assert.equal(selectStreamingMessage(replaced, 'a1').text, 'Hello there');
  const done = fold([ev(1, 'message.delta', { text: 'Hel' }), ev(2, 'message.complete', { text: 'Hello.' })]);
  assert.equal(selectStreamingMessage(done, 'a1'), null);
  assert.equal(done.messages.get('a1#1').text, 'Hello.');
  const late = reduce(done, parseAgentEvent(ev(3, 'message.delta', { text: 'late', messageId: 'a1#1' })));
  assert.equal(late.rejected, 1, 'a delta for a finished message is rejected, not appended');
  assert.equal(late.messages.get('a1#1').text, 'Hello.');
  const next = reduce(done, parseAgentEvent(ev(3, 'message.delta', { text: 'Second' })));
  assert.equal(selectStreamingMessage(next, 'a1').text, 'Second', 'a new delta without an id starts the next message');
  assert.equal(next.messages.size, 2);
  const capped = fold([ev(1, 'message.delta', { text: 'abcdef' })], { ...defaults(), maxTextChars: 4 });
  assert.deepEqual([capped.messages.get('a1#1').text, capped.messages.get('a1#1').truncated], ['abcd', true]);
  assert.equal(s.activity.length, 0, 'deltas do not flood activity');
});

test('approvals stay pending until the host resolves them, and a repeat request never reopens a decision', () => {
  const pending = fold([ev(1, 'approval.requested', { approvalId: 'ap1', title: 'Delete page' })]);
  assert.equal(selectPendingApprovals(pending).length, 1);
  assert.equal(selectAttention(pending), 1);
  const resolved = fold([
    ev(1, 'approval.requested', { approvalId: 'ap1', title: 'Delete page' }),
    ev(2, 'approval.resolved', { approvalId: 'ap1', decision: 'denied' }),
    ev(3, 'approval.requested', { approvalId: 'ap1', title: 'Delete page' }),
  ]);
  assert.equal(selectPendingApprovals(resolved).length, 0);
  assert.equal(resolved.approvals.get('ap1').status, 'denied');
});

test('drafts open, update, and close exactly once', () => {
  const s = fold([
    ev(1, 'draft.begin', { draftId: 'd1', text: 'Button', anchor: { x: 1 } }),
    ev(2, 'draft.update', { draftId: 'd1', text: 'Button is low contrast' }),
  ]);
  assert.equal(selectOpenDrafts(s)[0].text, 'Button is low contrast');
  assert.deepEqual(selectOpenDrafts(s)[0].anchor, { x: 1 });
  const closed = reduce(s, parseAgentEvent(ev(3, 'draft.complete', { draftId: 'd1', artifactId: 'f1' })));
  assert.equal(selectOpenDrafts(closed).length, 0);
  assert.equal(closed.drafts.get('d1').artifactId, 'f1');
  assert.equal(reduce(closed, parseAgentEvent(ev(4, 'draft.cancel', { draftId: 'd1' }))).drafts.get('d1').status, 'complete');
  assert.equal(fold([ev(1, 'draft.update', { draftId: 'nope' })]).rejected, 1);
});

test('memory stays bounded: activity is a ring and maps evict settled entries before live ones', () => {
  const limits = { ...defaults(), maxActivity: 3, maxEntities: 2 };
  const s = fold([
    ev(1, 'approval.requested', { approvalId: 'live' }),
    ev(2, 'approval.requested', { approvalId: 'old' }),
    ev(3, 'approval.resolved', { approvalId: 'old', decision: 'approved' }),
    ev(4, 'approval.requested', { approvalId: 'new' }),
  ], limits);
  assert.deepEqual([...s.approvals.keys()].sort(), ['live', 'new']);
  assert.equal(s.activity.length, 3);
  assert.deepEqual(s.activity.map((a) => a.seq), [2, 3, 4]);
});

test('replaying the same log yields an equal state', () => {
  const log = [ev(1, 'agent.status', { status: 'running' }), ev(2, 'tool.call', { callId: 'c', name: 'click', phase: 'started' }), ev(3, 'tool.call', { callId: 'c', phase: 'failed', error: 'Timed out' })];
  const a = fold(log); const b = fold(log);
  assert.deepEqual(a, b);
  assert.deepEqual([a.tools.get('c').name, a.tools.get('c').error], ['click', 'Timed out']);
});

test('store orders a batch, notifies once per change, isolates listener errors, and counts bad frames', () => {
  const store = createAgentStore();
  let calls = 0;
  const off = store.subscribe(() => { calls += 1; });
  store.subscribe(() => { throw new Error('broken view'); });
  const quiet = console.error; console.error = () => {};
  try {
    assert.equal(store.apply([ev(2, 'run.status', { status: 'completed' }), ev(1, 'run.status', { status: 'running' }), { junk: true }]), 2);
  } finally { console.error = quiet; }
  assert.equal(calls, 1);
  assert.equal(store.dropped, 1);
  assert.equal(selectRuns(store.getSnapshot())[0].status, 'completed');
  const before = store.getSnapshot();
  store.apply([ev(1, 'run.status', { status: 'failed' })]);
  assert.equal(store.getSnapshot(), before);
  assert.equal(calls, 1, 'no notification for a no-op batch');
  off();
  store.reset();
  assert.equal(calls, 1);
  assert.equal(store.getSnapshot().cursor, 0);
  assert.throws(() => createAgentStore({ limits: { maxActivity: 0 } }), RangeError);
});

test('selectors keep their value while the map they read is unchanged', () => {
  const store = createAgentStore();
  store.apply([ev(1, 'approval.requested', { approvalId: 'ap1' })]);
  const first = selectPendingApprovals(store.getSnapshot());
  store.apply([ev(2, 'message.delta', { text: 'hi' })]);
  assert.equal(selectPendingApprovals(store.getSnapshot()), first);
  assert.equal(selectStreamingMessage(store.getSnapshot(), 'a1').text, 'hi');
});

function defaults() { return { maxActivity: 500, maxTextChars: 20000, maxEntities: 500, contiguous: true }; }

test('every core type passes the envelope guard and folds through the store', () => {
  for (const type of CORE_EVENT_TYPES) assert.ok(parseAgentEvent(ev(1, type)), type);
  const store = createAgentStore();
  store.apply([ev(1, 'agent.status', { status: 'running' }), ev(2, 'navigation', { location: '/pricing' }), ev(3, 'run.status', { status: 'completed' })]);
  const s = store.getSnapshot();
  assert.equal(s.cursor, 3);
  assert.equal(s.gap, null);
  assert.equal(store.dropped, 0);
  assert.equal(s.agents.get('a1').location, '/pricing');
});
